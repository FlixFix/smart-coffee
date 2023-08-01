import re
from datetime import datetime
from time import sleep

# Define the Line and Group classes

class ControlStep:
    def __init__(self, timestamp, temp, pid_output):
        self.timestamp = timestamp
        self.temp = temp
        self.pid_output = pid_output

class ControlCycle:
    def __init__(self, desired_temperature, kp, ki, kd, timestamp):
        self.timestamp = timestamp
        self.desired_temperature = desired_temperature
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.lines = []

# Regular expression patterns
group_start_pattern = r"PICO \[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+[-+]\d{2}:\d{2})\]: Started PID with values: kp=(\d+\.\d+)\s+ki=(\d+\.\d+)\s+kd=(\d+\.\d+)"
desired_temp_pattern = r"Desired temperature is: (\d+\.\d+)"
line_pattern = r"PICO \[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+[-+]\d{2}:\d{2})\]: temp=(\d+\.\d+)\$\$pid_outut=(-?\d+\.\d+)"

def parse_timestamp(timestamp_str):
    # Remove the timezone offset from the timestamp
    timestamp_str = re.sub(r"[-+]\d{2}:\d{2}$", "", timestamp_str)
    # Convert the string to a datetime object
    timestamp = datetime.strptime(timestamp_str, "%Y-%m-%dT%H:%M:%S.%f")
    return timestamp

# Read the input file and update data structure dynamically
def update_data_structure(file_path, groups):
    with open(file_path, 'r') as file:
        for line in file:
            line = line.strip()

            # Check if the line starts a new group
            group_start_match = re.match(group_start_pattern, line)
            if group_start_match:
                timestamp_str = float(group_start_match.group(1))
                timestamp = parse_timestamp(timestamp_str)
                kp = float(group_start_match.group(2))
                ki = float(group_start_match.group(3))
                kd = float(group_start_match.group(4))
                group_exists = False

                # Check if the group already exists
                for group in groups:
                    if group.timestamp == timestamp:
                        group_exists = True
                        break

                if not group_exists:
                    current_group = ControlCycle(None, kp, ki, kd, timestamp)
                    groups.append(current_group)
                continue

            # Check if the line contains the desired temperature
            desired_temp_match = re.match(desired_temp_pattern, line)
            if desired_temp_match:
                desired_temperature = float(desired_temp_match.group(1))

                # Update the desired temperature for the corresponding group
                for group in groups:
                    if group.timestamp == timestamp:
                        group.desired_temperature = desired_temperature
                        break
                continue

            # Check if the line contains a line entry
            line_match = re.match(line_pattern, line)
            if line_match:
                timestamp = datetime.strptime(line_match.group(1), "%Y-%m-%dT%H:%M:%S.%f%z")
                temp = float(line_match.group(2))
                pid_output = float(line_match.group(3))

                # Update the lines for the corresponding group
                for group in groups:
                    if group.timestamp == timestamp:
                        group.lines.append(ControlStep(timestamp, temp, pid_output))
                        break

# Example usage
input_file_path = "../backend/log/pico.log"
groups = []



if __name__ == "__main__":
    while True:
        update_data_structure(input_file_path, groups)

        # Process and use the updated groups as needed
        for group in groups:
            print(f"Group PID: {group.pid_value}")
            print(f"Desired Temperature: {group.desired_temperature}")
            print(f"kp: {group.kp}, ki: {group.ki}, kd: {group.kd}")
            print("Lines:")
            for line in group.lines:
                print(f"Timestamp: {line.timestamp}, Temperature: {line.temp}, PID Output: {line.pid_output}")
            print()

        # Wait for 2 seconds before reading the file again
        sleep(2)
