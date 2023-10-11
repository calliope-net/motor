qwiicmotor.init(qwiicmotor.qwiicmotor_eADDR(qwiicmotor.eADDR.Motor_x5D), false)
loops.everyInterval(500, function () {
    qwiicmotor.driveArray(qwiicmotor.qwiicmotor_eADDR(qwiicmotor.eADDR.Motor_x5D), qwiicmotor.qwiicmotor_readJoystick(qwiicmotor.qwiicmotor_joy_eADDR(qwiicmotor.eADDR_joy.Joystick_x20)))
})
