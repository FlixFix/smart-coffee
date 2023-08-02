import re
from datetime import datetime

import matplotlib.pyplot as plt
from scipy.interpolate import make_interp_spline
import numpy as np

groups = []
plot_heating = False
smoothen = False


def main():
    read_logs('../backend/log/pico.log', groups)
    filtered_groups = [group for group in groups if group.lines]
    plot_results([filtered_groups[-1]])


def plot_results(groups):
    num_groups = len(groups)
    if num_groups == 1:
        num_cols = 1
    else:
        num_cols = 2  # Number of columns in the grid
    num_rows = (num_groups + num_cols - 1) // num_cols  # Compute number of rows needed for the grid

    fig, axes = plt.subplots(num_rows, num_cols, figsize=(20, 10))
    fig.tight_layout(pad=3.0)

    for i, group in enumerate(groups):
        # Compute time differences from the starting time
        if len(group.lines) == 0:
            break

        starting_time = group.lines[0].timestamp
        time_diffs = [(line.timestamp - starting_time).total_seconds() for line in group.lines]

        # Extract temperature values
        temps = [line.temp for line in group.lines]

        # Extract pid_output values
        pid_outputs = [line.pid_output for line in group.lines]

        if num_cols == 1:
            ax = axes
        else:
            # Get the appropriate axis for the current group
            if num_rows > 1:
                ax = axes[i // num_cols, i % num_cols]
            else:
                ax = axes[i % num_cols]

        # Create the legend text
        legend_text = f"kp={group.kp}, ki={group.ki}, kd={group.kd}"

        ax.plot([], [], ' ', label=legend_text)
        ax.grid(True)
        if group.temperature != '':
            ax.axhline(y=float(group.temperature), color='m', linestyle='--', label='Desired Temperature')

        if smoothen:
            # smooth out the curve
            spl = make_interp_spline(time_diffs, temps)
            x_interp = np.linspace(min(time_diffs), max(time_diffs), 200)  # Smoothness of the curve
            y_interp = spl(x_interp)
            ax.plot(x_interp, y_interp, color='lightblue', label='Actual Temperature', linewidth=2)
        else:
            ax.plot(time_diffs, temps, color='lightblue', label='Actual Temperature', linewidth=2)

        x_min, x_max = ax.get_xbound()
        ax.fill_between(x=[x_min, x_max], y1=float(group.temperature) - 0.5, y2=float(group.temperature) + 0.5, color='m', alpha=0.1)

        ax.set_xlabel("Time (s)")
        ax.set_ylabel("Temperature")
        ax.set_title(f"Control cycle started at {group.starting_time}")

        if plot_heating:
            # Plot the data for the current group with conditional coloring and markers
            prev_pid_output = None  # Variable to track previous pid_output value
            prev_time_diff = None  # Variable to track previous time difference
            for j, pid_output in enumerate(pid_outputs):

                # plot first heating state
                if j == 0:
                    marker_label = 'heating on' if group.lines[j].pid_output > 0 else 'heating off'
                    color = 'green' if group.lines[j].pid_output > 0 else 'red'
                    ax.plot(time_diffs[j], temps[j], marker='.', color=color, markersize=8)
                    ax.annotate(marker_label, xy=(time_diffs[j], temps[j]), xytext=(5, -10),
                                textcoords='offset points', fontsize=8, color=color)

                # Check if there is a change from negative to positive or vice versa
                if prev_pid_output is not None and ((prev_pid_output < 0 < pid_output) or (
                        prev_pid_output > 0 > pid_output)):
                    time_diff = time_diffs[j] - prev_time_diff
                    marker_label = 'heating on' if pid_output > 0 else f'heating off after \n {time_diff:.2f} seconds'
                    color = 'green' if pid_output > 0 else 'red'
                    ax.plot(time_diffs[j], temps[j], marker='.', color=color, markersize=8)
                    ax.annotate(marker_label, xy=(time_diffs[j], temps[j]), xytext=(5, -10),
                                    textcoords='offset points', fontsize=8, color=color)

                prev_pid_output = pid_output
                prev_time_diff = time_diffs[j]

        # Add the legend to the subplot with padding
        ax.legend(loc="upper right", borderaxespad=0.5)

        # Add padding inside the subplot
        ax.margins(x=0.05, y=0.8)

    # Adjust y-axis limits to include all temperatures
    plt.autoscale(enable=True, axis='y', tight=True)

    # Remove any empty subplots
    if num_groups < num_rows * num_cols:
        if num_rows > 1:
            for i in range(num_groups, num_rows * num_cols):
                axes[i // num_cols, i % num_cols].axis("off")
        else:
            for i in range(num_groups, num_rows * num_cols):
                axes[i % num_cols].axis("off")

    plt.show()


def read_logs(file_path, groups):
    try:
        with open(file_path, 'r') as file:
            started_pid = False
            current_group = None
            for line in file:
                if "Started PID" in line:
                    if current_group is not None:
                        groups[-1].finish_group()

                    started_pid = True

                    # Extract kp, ki, and kd using regular expressions
                    pattern = r"PICO \[(.*?)\]: Started PID with values: kp=([\d.]+) ki=([\d.]+) kd=([\d.]+)"
                    match = re.search(pattern, line)
                    if match:
                        timestamp_str = match.group(1)
                        timestamp = parse_timestamp(timestamp_str)
                        kp = float(match.group(2))
                        ki = float(match.group(3))
                        kd = float(match.group(4))
                    else:
                        kp = ki = kd = timestamp = None

                    current_group = ControlCycle("", kp, ki, kd, timestamp)
                    groups.append(current_group)
                elif started_pid and "Desired temperature is:" in line:
                    started_pid = False
                    temperature = line.split("Desired temperature is: ")[1].strip()
                    current_group.temperature = temperature
                elif current_group is not None:
                    # Extract timestamp, temp, and pid_output using regular expressions
                    pattern = r"PICO \[(.*?)\]: temp=([\d.-]+)\$\$pid_output=([\d.-]+)"
                    match = re.search(pattern, line)
                    if match:
                        timestamp_str = match.group(1)
                        temp = float(match.group(2))
                        pid_output = float(match.group(3))

                        timestamp = parse_timestamp(timestamp_str)
                        line_obj = ControlStep(timestamp, temp, pid_output)
                        current_group.add_line(line_obj)

    except FileNotFoundError:
        print("File not found.")

    return groups


def parse_timestamp(timestamp_str):
    # Remove the timezone offset from the timestamp
    timestamp_str = re.sub(r"[-+]\d{2}:\d{2}$", "", timestamp_str)
    # Convert the string to a datetime object
    timestamp = datetime.strptime(timestamp_str, "%Y-%m-%dT%H:%M:%S.%f")
    return timestamp


class ControlStep:
    def __init__(self, timestamp, temp, pid_output):
        self.timestamp = timestamp
        self.temp = temp
        self.pid_output = pid_output


class ControlCycle:
    def __init__(self, temperature, kp, ki, kd, starting_time):
        self.temperature = temperature
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.lines = []
        self.starting_time = starting_time
        self.finished = False

    def add_line(self, line):
        self.lines.append(line)

    def finish_group(self):
        self.finished = True


if __name__ == "__main__":
    main()