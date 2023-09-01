
//% color=#7F003F icon="\uf0d1" block="Motor Qwiic" weight=06
namespace qwiicmotor
/* 230901

https://www.sparkfun.com/products/15451
https://github.com/sparkfun/Qwiic_SCMD_Py
https://learn.sparkfun.com/tutorials/hookup-guide-for-the-qwiic-motor-driver

https://github.com/sparkfun/Serial_Controlled_Motor_Driver
https://github.com/sparkfun/Serial_Controlled_Motor_Driver/blob/master/Documentation/SCMD_Datasheet.pdf


https://github.com/sparkfun/Qwiic_I2C_Py/blob/master/qwiic_i2c/circuitpy_i2c.py

Code anhand der Python library und Datenblätter neu programmiert von Lutz Elßner im August, September 2023
*/ {
    export enum eADDR { //https://learn.sparkfun.com/tutorials/hookup-guide-for-the-qwiic-motor-driver
        Motor_x5D = 0x5D, Motor_x58 = 0x58, Motor_x59 = 0x59, Motor_x5A = 0x5A, Motor_x5B = 0x5B, Motor_x5C = 0x5C,
        Motor_x5E = 0x5E, Motor_x5F = 0x5F, Motor_x60 = 0x60, Motor_x61 = 0x61
    }

    let i2cWriteBufferError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)

    export enum eRegister {
        FID = 0x00, // Reports firmware version. This corresponds with the numbering within the gitub repository.
        ID = 0x01, // Reports hard-coded ID byte of 0xA9
        CONFIG_BITS = 0x03, // Reflects jumper position on bottom of board

        // 0x04-0x11 Diagnostics and Debug -- Reports counts and time for this driver.

        FSAFE_FAULTS = 0x0E, /* Default 0x00
        The failsafe ISR hit count. This is incremented every time the watchdog is not satisfied and the ISR is allowed to run.
        Write 0x00 to clear.
        */
        REG_OOR_CNT = 0x0F, /* Default 0x00
        This counts the number of times anybody tried to write outside of the range of available registers. 
        This should always remain at 0.
        Write 0x00 to clear.
        */
        REG_RO_WRITE_CNT = 0x10, /* Default 0x00
        This reports the number of times anybody tried to write to a locked register. This is very useful to
        determine if the proper keys are being applied. If, after a program is run, this contains a non-zero
        value, the program is trying to write locked registers and is being denied.
        Write 0x00 to reset.
        */

        // 0x12-0x1D Local configuration -- Registers that set the drive parameters and clocking of this driver, which do not transfer to slaves when written.

        MOTOR_A_INVERT = 0x12,
        MOTOR_B_INVERT = 0x13, /* Default 0x00
        Motor inverts for the A and B channels. These are used on all boards, master and slave, to control the directions.
        Writing 0x01 to either register causes the forward direction of that channel to be reversed
        Writing 0x00 returns to the driver to default mode.
        */
        BRIDGE = 0x14, /* Default 0x00
        This causes the channel B source mux to match channel A source in order to allow bridging.
        Writing 0x01 to cause channel bridging. Writing 0x00 to unbridge channels.
        Motor drive levels -- drive 0 to 255 for -100% to 100% drive. There is one address per possible motor.
        */
        LOCAL_MASTER_LOCK = 0x15, /* Default 0x00
        This register allows all other registers to be writable, for unknown effect.
        Write 0x9B to allow free register use.
        Write other values to lock read-only registers.
        */
        LOCAL_USER_LOCK = 0x16, /* Default 0x5C
        This register allows the configuration registers to be locked from inadvertent access. Anything that can
        change modes is protected by the user lock, and is unlocked by default. When locked, writing garbage
        data will invoke garbage motor movements but will not cause the configuration to be lost when correct
        data is returned. Any register with "USER LOCK" as "YES" can become read-only with this register.
        (Note: it is possible to accidentally write the user lock key to this register with garbage data.)
        Write 0x5C to prevent writes to configuration registers
        Write other values to allow writes.
        */
        FSAFE_CTRL = 0x1F, /* Default 0x11
        Use to configure what happens when failsafe occurs.
        B0: output behavior
            0 – maintain last motor drive levels
            1 -- Center output drive levels for 0 drive
        B2-1: Restart operation( Do not use on slaves )
            0x0 do nothing
            0x1 reboot
            0x2 re-enumerate
        B3: User port behavior
            0 – do nothing
            1 – reinit user port
        B4: expansion port behavior
            0 – do nothing
            1 – reinit expansion port
        */

        // 0x20-0x41 Motor drive levels -- drive 0 to 255 for -100% to 100% drive. There is one address per possible motor.

        MA_DRIVE = 0x20,
        MB_DRIVE = 0x21, /* Default 0x80
        The output driver PWMs are directly controlled by these registers.
        Writing a value from 0 to 255 sets the duty cycle of the associated channels on any board, master or
        slave. Note: Writing a value of 0x80 sets the duty cycle to 50%, which will appear as off at the outputs.
        Write values up and down from there for forward and backwards drive.
        */

        // 0x50-0x55 Remote configuration -- Packed configuration bits for inversion and bridging in the master that are decoded and sent to the appropriate slaves when written.

        // 0x70-0x78 System configuration -- Fail safe, status, enable, and expansion bus control registers.

        DRIVER_ENABLE = 0x70, /* Default 0x00
        This register controls the driver enable line and can effectively remove all energy from the outputs.
        Write 0x01: Enable this driver
        Write 0x00: Disable this driver.
        */
        FSAFE_TIME = 0x76, /* Default 0x00
        This register sets the watchdog timeout time, from 10 ms to 2.55 seconds. The LSB is worth 10 ms.
        Write 0x00: Do not use the watchdog.
        Write other values: Set the watchdog timeout time to 10ms * value.
        */
        STATUS_1 = 0x77, /* Default 0x00
        This register uses bits to show status. Currently, only b0 is used.
        Bit 0: Enumeration complete. Reads 1 if the master state machine has reached the fully enumerated state.
        Bit 1: Busy. The busy bit is set when certain operations are requested, and cleared when all blocking
        operations are done. It should be observed when making changes to related operations.
        If writing commands while the SCMD is busy, previously requested commands can be lost.
        The bit is set as a logical OR for any changes to the following registers:
        INV_2_9, INV_10_17, INV_18_25, INV_26_33, BRIDGE_SLV_L, BRIDGE_SLV_H,
        DRIVER_ENABLE, MASTER_LOCK, USER_LOCK, FSAFE_TIME, REM_WRITE, REM_READ, FORCE_UPDATE
        */
        CONTROL_1 = 0x78, /* Default 0x00
        This register can be used to issue low level orders to the system.
        Bit 0: Reset the processor now. The slave chain will also be reset, and all configuration is erased.
        Bit 1: Initiate re-enumeration of the slave chain. ...
        */

        // 0x79-0x7E Remote access -- Use to perform remote reads and writes from connected slaves.
    }

    export enum eSTATUS_1 { // Bits im Register STATUS_1
        ENUMERATION_BIT = 0x01, BUSY_BIT = 0x02, REM_READ_BIT = 0x04, REM_WRITE_BIT = 0x08, HW_EN_BIT = 0x10
    }


    // ========== group="Motor Konfiguration"

    //% group="Motor Konfiguration"
    //% block="i2c %pADDR beim Start" weight=8
    export function init(pADDR: eADDR): void {
        if (getStatus(pADDR, eStatus.begin)) { // ID=0xA9
            writeRegister(pADDR, qwiicmotor.eRegister.CONTROL_1, 1) // Reset the processor now.
            for (let i = 0; i < 5; i += 1) {
                if (getStatus(pADDR, eStatus.ready)) // STATUS_1
                    break
                else
                    control.waitMicros(100000) // 0.1 Sekunde
            }
        }
    }

    export enum eControl { DRIVER_ENABLE, MOTOR_A_INVERT, MOTOR_B_INVERT, BRIDGE_A_B, LOCAL_MASTER_LOCK, LOCAL_USER_LOCK, CONTROL_1_Reset }

    //% group="Motor Konfiguration"
    //% block="i2c %pADDR %pControl %pON" weight=4
    //% pON.shadow="toggleOnOff"
    export function controlRegister(pADDR: eADDR, pControl: eControl, pON: boolean) {
        let bit: number = (pON ? 0x01 : 0x00)
        switch (pControl) {
            case eControl.DRIVER_ENABLE: { writeRegister(pADDR, eRegister.DRIVER_ENABLE, bit); break } // Write 0x01: Enable this driver.
            case eControl.MOTOR_A_INVERT: { writeRegister(pADDR, eRegister.MOTOR_A_INVERT, bit); break } // reverse
            case eControl.MOTOR_B_INVERT: { writeRegister(pADDR, eRegister.MOTOR_B_INVERT, bit); break } // reverse
            case eControl.BRIDGE_A_B: { writeRegister(pADDR, eRegister.BRIDGE, bit); break } // bridging
            case eControl.LOCAL_MASTER_LOCK: { writeRegister(pADDR, eRegister.LOCAL_MASTER_LOCK, (pON ? 0x9B : 0x00)); break } // Write 0x9B to allow free register use.
            case eControl.LOCAL_USER_LOCK: { writeRegister(pADDR, eRegister.LOCAL_USER_LOCK, (pON ? 0x00 : 0x5C)); break } // Write 0x5C to prevent writes to configuration registers.
            case eControl.CONTROL_1_Reset: { writeRegister(pADDR, eRegister.CONTROL_1, bit); break } // Reset the processor now.
        }
    }



    // ========== group="Motor (-100% .. 0% .. +100%)"

    //          blockSetVariable=iMotor
    //% blockId=f_eMotor block="$pMotor" blockHidden=true
    export function f_eMotor(pMotor: eMotor): number { return pMotor }
    export enum eMotor {
        //% block="MOTOR A"
        MOTOR_A = 1,
        //% block="MOTOR B"
        MOTOR_B = 2,
        //% block="BRIDGE A+B"
        MOTOR_AB = 3,
        //% block="AUS SCHALTEN"
        AUS = 0
    }
    //% group="Motor (-100% .. 0% .. +100%)"
    //% block="i2c %pADDR starten %pMotor %speed \\%" weight=8
    //% pMotor.shadow="f_eMotor"
    //% speed.shadow="speedPicker" speed.defl=0
    export function drive(pADDR: eADDR, pMotor: eMotor, speed: number) {
        // constrain: speed zwischen -100 und +100 begrenzen
        // map: -100 -> 0 / 0 -> 127,5 / +100 -> 255
        // ceil: aufrunden, damit 127,5 = 128 = 0x80 Motor Stillstand
        //let driveValue = Math.ceil(Math.map(Math.constrain(speed, -100, 100), -100, 100, 0, 255))
        switch (pMotor) {
            case eMotor.MOTOR_A: {
                writeRegister(pADDR, eRegister.BRIDGE, 0)
                driveA(pADDR, speed)
                writeRegister(pADDR, eRegister.DRIVER_ENABLE, 1)
                break
            }
            case eMotor.MOTOR_B: {
                writeRegister(pADDR, eRegister.BRIDGE, 0)
                driveB(pADDR, speed)
                writeRegister(pADDR, eRegister.DRIVER_ENABLE, 1)
                break
            }
            case eMotor.MOTOR_AB: {
                writeRegister(pADDR, eRegister.BRIDGE, 1)
                driveA(pADDR, speed)
                writeRegister(pADDR, eRegister.DRIVER_ENABLE, 1)
                break
            }
            default: { // case eMotor.AUS
                writeRegister(pADDR, eRegister.DRIVER_ENABLE, 0)
                writeRegister(pADDR, eRegister.MA_DRIVE, 0x80)
                writeRegister(pADDR, eRegister.MB_DRIVE, 0x80)
                writeRegister(pADDR, eRegister.BRIDGE, 0)
                writeRegister(pADDR, eRegister.MOTOR_A_INVERT, 0)
                writeRegister(pADDR, eRegister.MOTOR_B_INVERT, 0)
                break
            }
        }
    }

    //% group="Motor (-100% .. 0% .. +100%)"
    //% block="i2c %pADDR fahren MOTOR A %speed \\%" weight=6
    //% speed.shadow="speedPicker" speed.defl=0
    export function driveA(pADDR: eADDR, speed: number) {
        // constrain: speed zwischen -100 und +100 begrenzen
        // map: -100 -> 0 / 0 -> 127,5 / +100 -> 255
        // ceil: aufrunden, damit 127,5 = 128 = 0x80 Motor Stillstand
        let driveValue = Math.ceil(Math.map(Math.constrain(speed, -100, 100), -100, 100, 0, 255))
        writeRegister(pADDR, eRegister.MA_DRIVE, driveValue & 0xFF)
    }

    //% group="Motor (-100% .. 0% .. +100%)"
    //% block="i2c %pADDR fahren MOTOR B %speed \\%" weight=4
    //% speed.shadow="speedPicker" speed.defl=0
    export function driveB(pADDR: eADDR, speed: number) {
        // constrain: speed zwischen -100 und +100 begrenzen
        // map: -100 -> 0 / 0 -> 127,5 / +100 -> 255
        // ceil: aufrunden, damit 127,5 = 128 = 0x80 Motor Stillstand
        let driveValue = Math.ceil(Math.map(Math.constrain(speed, -100, 100), -100, 100, 0, 255))
        writeRegister(pADDR, eRegister.MB_DRIVE, driveValue & 0xFF)
    }


    // ========== group="Motor (0 .. 255)"

    export enum eDirection {
        //% block="vorwärts"
        forward = 1,
        //% block="rückwärts"
        backward = 0
    }

    //% group="Motor (0 .. 255)"
    //% block="i2c %pADDR fahren MOTOR A %speed (0-255) %direction" weight=8
    //% speed.min=0 speed.max=255
    export function set_driveA(pADDR: eADDR, speed: number, direction: eDirection) {
        writeRegister(pADDR, eRegister.MA_DRIVE, set_drive(speed, direction))
    }

    //% group="Motor (0 .. 255)"
    //% block="i2c %pADDR fahren MOTOR B %speed (0-255) %direction" weight=6
    //% speed.min=0 speed.max=255
    export function set_driveB(pADDR: eADDR, speed: number, direction: eDirection) {
        writeRegister(pADDR, eRegister.MB_DRIVE, set_drive(speed, direction))
    }

    //% group="Motor (0 .. 255)"
    //% block="driveValue %speed (0-255) %direction" weight=2
    //% speed.min=0 speed.max=255
    export function set_drive(speed: number, pDirection: eDirection) {
        /*
        void setDrive( uint8_t channel, uint8_t direction, uint8_t level );
        This sets an output to drive at a level and direction.
        channel: Motor number, 0 through 33.
        direction: 1 or 0 for forward or backwards.
        level: 0 to 255 for drive strength.
 
        0x20: MA_DRIVE
        0x21: MB_DRIVE
        The output driver PWMs are directly controlled by these registers.
        Writing a value from 0 to 255 sets the duty cycle of the associated channels on any board, master or
        slave. Note: Writing a value of 0x80 sets the duty cycle to 50%, which will appear as off at the outputs.
        Write values up and down from there for forward and backwards drive.
        */
        // Convert value to a 7-bit int and match the indexing for uint8_t values as needed in Arduino library
        //   0  16  32  48  64  80  96 112 128 144 160 176 192 208 224 240 256 # 272
        // forward=0: (ungerade)
        //   1   9  17  25  33  41  49  57  65  73  81  89  97 105 113 121 129 # 137
        // backward=1: (gerade)
        //   0   8  16  24  32  40  48  56  64  72  80  88  96 104 112 120 128 # 136
        // driveValue forward=0:
        // 127 119 111 103  95  87  79  71  63  55  47  39  31  23  15   7  -1=255 aus Register gelesen
        // driveValue backward=1:
        // 128 136 144 152 160 168 176 184 192 200 208 216 224 232 240 248 256=  0 aus Register gelesen
        let direction: number = (pDirection == eDirection.forward ? 1 : 0) // 1 or 0 for forward or backwards
        //direction = direction & 0x01
        let level = Math.constrain(speed, 0, 255) & 0xFF
        level = Math.trunc(Math.round((level + 1 - direction) / 2))

        // Make sure the motor number is valid

        let driveValue = (level * direction) + (level * (direction - 1)) // set to 1/2 drive if direction = 1 or -1/2 drive if direction = 0 (level * direction)
        //driveValue += 128
        return driveValue + 128

        /* if (pMotor == eMotor2.MOTOR_A)
            writeRegister(pADDR, eRegister.MA_DRIVE, driveValue)
        else
            writeRegister(pADDR, eRegister.MB_DRIVE, driveValue) 
        */
    }



    // ========== advanced=true

    // ========== group="Motor Konfiguration / Status"

    //% blockId=f_eSafeTime block="$pSafeTime" blockHidden=true
    export function f_eSafeTime(pSafeTime: eSafeTime): number { return pSafeTime }
    export enum eSafeTime {
        //% block="no failsafe"
        no_failsafe = 0,
        //% block="10 ms"
        ms1 = 1,
        //% block="100 ms"
        ms10 = 10,
        //% block="0,5 s"
        ms50 = 50,
        //% block="1 s"
        ms100 = 100,
        //% block="1,5 s"
        ms150 = 150,
        //% block="2 s"
        ms200 = 200,
        //% block="2,5 s"
        ms250 = 250
    }
    //% group="Motor Konfiguration / Status" advanced=true
    //% block="i2c %pADDR watchdog timeout %time" weight=6
    //% time.shadow="f_eSafeTime"
    export function setSafeTime(pADDR: eADDR, time: number) {
        if (time > 0) {
            writeRegister(pADDR, eRegister.FSAFE_CTRL, 0x01) // 0x1F
        }
        writeRegister(pADDR, eRegister.FSAFE_TIME, time) // 0x76 0 ... 2,55 Sekunden
    }


    export enum eStatus { i2c_connected, begin, ready, busy }
    //% group="Motor Konfiguration / Status" advanced=true
    //% block="i2c %pADDR Status %pStatus" weight=4
    export function getStatus(pADDR: eADDR, pStatus: eStatus): boolean {
        switch (pStatus) {
            case eStatus.i2c_connected: {
                let bu = Buffer.create(1)
                bu.setUint8(0, 0)
                i2cWriteBufferError = pins.i2cWriteBuffer(pADDR, bu)
                return i2cWriteBufferError == 0
            }
            case eStatus.begin: {
                /*
                uint8_t begin( void );
                Call after providing settings to start the wire library, apply the settings, and get the ID word (return
                value should be 0xA9). Don't progress unless this returns 0xA9!
                */
                return readRegister(pADDR, eRegister.ID) == 0xA9
            }
            case eStatus.ready: {
                /*
                bool ready( void );
                This function checks to see if the SCMD is done booting and is ready to receive commands. Use this
                after .begin(), and don't progress to your main program until this returns true.
                SCMD_STATUS_1: Read back basic program status
                    B0: 1 = Enumeration Complete
                    B1: 1 = Device busy
                    B2: 1 = Remote read in progress
                    B3: 1 = Remote write in progress
                    B4: Read state of enable pin U2.5"
                */
                let statusByte = readRegister(pADDR, eRegister.STATUS_1)
                return (statusByte & eSTATUS_1.ENUMERATION_BIT) != 0 && statusByte != 0xFF  // wait for ready flag and not 0xFF
            }
            case eStatus.busy: {
                /*
                This function checks to see if the SCMD busy with an operation. Wait for busy to be clear before
                sending each configuration commands (not needed for motor drive levels).
                */
                let statusByte = readRegister(pADDR, eRegister.STATUS_1)
                return (statusByte & (eSTATUS_1.BUSY_BIT | eSTATUS_1.REM_READ_BIT | eSTATUS_1.REM_WRITE_BIT)) != 0
            }
            default: return false
        }
    }

    function hex(v: number) {
        let bu = Buffer.create(1)
        bu.setUint8(0, v)
        return bu.toHex()
    }

    //% group="Motor Konfiguration / Status" advanced=true
    //% block="i2c %pADDR Statuszeile %nummer" weight=2
    //% nummer.min=0 nummer.max=2
    export function statuszeile(pADDR: eADDR, nummer: number): string {
        switch (nummer) {
            case 0: {
                return readRegister(pADDR, eRegister.DRIVER_ENABLE)
                    + " m" + hex(readRegister(pADDR, eRegister.MA_DRIVE))
                    + hex(readRegister(pADDR, eRegister.MB_DRIVE))
                    + " i" + readRegister(pADDR, eRegister.MOTOR_A_INVERT)
                    + readRegister(pADDR, eRegister.MOTOR_B_INVERT)
                    + " b" + readRegister(pADDR, eRegister.BRIDGE) // 12
            }
            case 1: {
                return hex(readRegister(pADDR, eRegister.FID))          // 7b
                    + hex(readRegister(pADDR, eRegister.ID))            // a9
                    + hex(readRegister(pADDR, eRegister.CONFIG_BITS))   // 08
                    + " " + readRegister(pADDR, eRegister.CONTROL_1)    // 0
                    + " " + readRegister(pADDR, eRegister.REG_OOR_CNT)  // 0
                    + " " + readRegister(pADDR, eRegister.REG_RO_WRITE_CNT) // 0
                    + " " + hex(readRegister(pADDR, eRegister.STATUS_1))    // 11 Bit 1: Busy.
            }
            case 2: {
                return hex(readRegister(pADDR, eRegister.LOCAL_MASTER_LOCK))    // 00
                    + hex(readRegister(pADDR, eRegister.LOCAL_USER_LOCK))       // 5c
                    + " " + hex(readRegister(pADDR, eRegister.FSAFE_FAULTS))    // 00
                    + " " + hex(readRegister(pADDR, eRegister.FSAFE_CTRL))      // 19
                    + " " + readRegister(pADDR, eRegister.FSAFE_TIME) / 100 + "s"

            }
            default: return nummer.toString()
        }
    }




    // ========== group="i2c Register"

    //% group="i2c Register" advanced=true
    //% block="i2c %pADDR read Register %pRegister" weight=6
    //% pRegister.shadow="eRegister_enum"
    export function readRegister(pADDR: eADDR, pRegister: number) {
        let bu = Buffer.create(1)
        bu.setUint8(0, pRegister)
        i2cWriteBufferError = pins.i2cWriteBuffer(pADDR, bu, true)
        return pins.i2cReadBuffer(pADDR, 1).getUint8(0)
    }

    //% group="i2c Register" advanced=true
    //% block="i2c %pADDR write Register %pRegister Byte %value" weight=4
    //% pRegister.shadow="eRegister_enum"
    export function writeRegister(pADDR: eADDR, pRegister: number, value: number) {
        let bu = Buffer.create(2)
        bu.setUint8(0, pRegister)
        bu.setUint8(1, value)
        i2cWriteBufferError = pins.i2cWriteBuffer(pADDR, bu)
    }

    //% blockId=eRegister_enum
    //% group="i2c Register" advanced=true
    //% block="Registernummer %pRegister" weight=2
    export function i2cRegister_enum(pRegister: eRegister): number { return pRegister }



    // ========== group="i2c Adressen"

    //% group="i2c Adressen" advanced=true
    //% block="i2c Adresse von Modul %pADDR" weight=6
    export function i2cAdressen(pADDR: eADDR): number { return pADDR }

    //% group="i2c Adressen" advanced=true
    //% block="Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)" weight=2
    export function i2cError() { return i2cWriteBufferError }


} // qwiicmotor.ts
