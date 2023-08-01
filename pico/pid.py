class PIDController:
    def __init__(self, setpoint, kp, ki, kd):
        self.setpoint = setpoint
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.last_error = 0
        self.integral = 0

    def calculate(self, temperature):
        error = self.setpoint - temperature

        # Proportional term
        p_term = self.kp * error

        # Integral term
        self.integral += error
        i_term = self.ki * self.integral

        # Derivative term
        d_term = self.kd * (error - self.last_error)
        self.last_error = error

        output = p_term + i_term + d_term
        return output


# Example usage
# setpoint = 90  # Desired temperature
# kp = 1.0  # Proportional gain
# ki = 0.5  # Integral gain
# kd = 0.2  # Derivative gain
#
# temperature = 80  # Current temperature
#
# # Create an instance of PIDController
# pid_controller = PIDController(setpoint, kp, ki, kd)

# Main loop
# while True:
#     # Read the current temperature (replace with actual temperature reading code)
#     # temperature = read_temperature()
#
#     # Calculate the output from the PID controller
#     output = pid_controller.calculate(temperature)
#
#     # Determine the heating status based on the output
#     if output > 0:
#         toggle_heating(True)
#     else:
#         toggle_heating(False)
#
#     # Print the output for demonstration purposes
#     print("PID output:", output)
#
#     # Delay for a certain period (adjust as needed)
#     time.sleep(1)
