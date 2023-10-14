
namespace qwiicmotor
/*
*/ {
    export enum eADDR_joy { Joystick_x20 = 0x20 }
    let n_i2cCheck: boolean = false // i2c-Check
    let n_i2cError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)

    export enum eRegister_joy {     // Register codes for the Joystick
        ID = 0x00,              // Default I2C Slave Address from EEPROM
        VERSION1 = 0x01,        // Firmware Version (MSB First)
        VERSION2 = 0x02,
        X_MSB = 0x03,           // Current Horizontal Position (MSB First)
        //% block="X_LSB 2Bit: xx000000"
        X_LSB = 0x04,
        Y_MSB = 0x05,           // Current Vertical Position (MSB First)
        //% block="Y_LSB 2Bit: xx000000"
        Y_LSB = 0x06,
        //% block="BUTTON 0:gedrückt"
        BUTTON = 0x07,          // Current Button Position
        //% block="STATUS 1:gedrückt"
        STATUS = 0x08,          // Button Status: Indicates if button was pressed since last read of button state. Clears after read.
        I2C_LOCK = 0x09,        // Configuration or "Locking" Register - Prevents random I2C address changes during I2C scans and register dumps. Must be set to 0x13 before an address change gets saved to the EEPROM.
        CHANGE_ADDREESS = 0x0A  // Current/Set I2C Slave Address (Write). Stored in EEPROM.
    }


    //% group="beim Start"
    //% block="i2c %pADDR beim Start || i2c-Check %ck" subcategory="Joystick" color="#BF3F7F"
    //% pADDR.shadow="qwiicmotor_eADDR_joy"
    //% ck.shadow="toggleOnOff" ck.defl=1
    export function beimStart_joy(pADDR: number, ck?: boolean) {
        n_i2cCheck = ck
        n_i2cError = 0 // Reset Fehlercode

        i2cWriteBuffer(pADDR, Buffer.fromArray([eRegister_joy.STATUS, 0])) // (8) Status 'Button war gedrückt' löschen
        // sendet 0 im Byte(3) und schaltet Motor aus
    }



    // ========== group="2 Motoren fahren mit SparkFun Qwiic Joystick"


    //% group="2 Motoren fahren mit SparkFun Qwiic Joystick" subcategory="Joystick" color="#BF3F7F"
    //% block="i2c %pADDR fahren %pJoystick" weight=6
    //% pADDR.shadow="qwiicmotor_eADDR"
    //% pJoystick.shadow="qwiicmotor_readJoystick"
    export function driveJoystick(pADDR: number, pJoystick: number) {
        drive255(pADDR, pJoystick) // in qwiicmotor.ts
    }

    // ========== group="Motor (0 .. 128 .. 255) (auch für Fernsteuerung)"

    //% blockId=qwiicmotor_readJoystick
    //% group="Motor (0 .. 128 .. 255) (auch für Fernsteuerung)" subcategory="Joystick" color="#BF3F7F"
    //% block="i2c %pADDR" weight=4
    //% pADDR.shadow="qwiicmotor_eADDR_joy"
    export function qwiicmotor_readJoystick(pADDR: number): number {
        let bu_ret = Buffer.create(4)

        //let bu = Buffer.create(1)
        //bu.setUint8(0, 3) // Joystick Register ab Nummer 3
        i2cWriteBuffer(pADDR, Buffer.fromArray([3]), true)

        let bu_joy = i2cReadBuffer(pADDR, 6) // Joystick 6 Register 3-8 lesen

        bu_ret.setUint8(0, bu_joy.getUint8(0)) // Register 3: Horizontal MSB 8 Bit
        bu_ret.setUint8(1, bu_joy.getUint8(2)) // Register 5: Vertical MSB 8 Bit
        bu_ret.setUint8(2, bu_joy.getUint8(4)) // Register 7: Current Button Position (0:gedrückt)
        bu_ret.setUint8(3, bu_joy.getUint8(5)) // Register 8: Button STATUS (1:war gedrückt)

        return bu_ret.getNumber(NumberFormat.UInt32LE, 0)
    }

    // ========== group="i2c Register"

    //% group="i2c Register" subcategory="Joystick" color="#BF3F7F"
    //% block="i2c %pADDR Register %pRegister 8 Bit lesen" weight=2
    //% pADDR.shadow="qwiicmotor_eADDR_joy"
    export function readRegister_joy(pADDR: number, pRegister: eRegister_joy) {
        i2cWriteBuffer(pADDR, Buffer.fromArray([pRegister]), true)
        return i2cReadBuffer(pADDR, 1).getUint8(0)
    }




    //% blockId=qwiicmotor_UInt32LE
    //% group="Motor (0 .. 128 .. 255) (auch für Fernsteuerung)" subcategory="Joystick" color="#BF3F7F"
    //% block="Motor A %ma B %mb (0..128..255) starten %en" weight=2
    //% ma.min=0 ma.max=255 ma.defl=128
    //% mb.min=0 mb.max=255 mb.defl=128
    //% en.shadow="toggleOnOff"
    export function qwiicmotor_UInt32LE(ma: number, mb: number, en: boolean): number {
        let returnBuffer = Buffer.create(4)
        if (between(ma, 0, 255) && between(mb, 0, 255)) {
            returnBuffer.setUint8(0, ma)
            returnBuffer.setUint8(1, mb)
            //returnBuffer.setUint8(2, (en ? 0 : 1)) // (0: gedrückt) DRIVER_ENABLE=true
            returnBuffer.setUint8(3, (en ? 1 : 0)) // (0: gedrückt) DRIVER_ENABLE=true
        } else {
            returnBuffer.setUint8(0, 128)
            returnBuffer.setUint8(1, 128)
            //returnBuffer.setUint8(2, 1) // DRIVER_ENABLE=false
            returnBuffer.setUint8(3, 0) // DRIVER_ENABLE=false
        }
        return returnBuffer.getNumber(NumberFormat.UInt32LE, 0)
    }


    export function between(i0: number, i1: number, i2: number): boolean {
        return (i0 >= i1 && i0 <= i2)
    }

    // ========== group="i2c Adressen"

    //% blockId=qwiicmotor_eADDR_joy
    //% group="i2c Adressen" subcategory="Joystick" color="#BF3F7F"
    //% block="%pADDR" weight=6
    export function qwiicmotor_eADDR_joy(pADDR: eADDR_joy): number { return pADDR }

    //% group="i2c Adressen" subcategory="Joystick" color="#BF3F7F"
    //% block="i2c Fehlercode" weight=2
    export function i2cError_joy() { return n_i2cError }


    function i2cWriteBuffer(pADDR: number, buf: Buffer, repeat: boolean = false) {
        if (n_i2cError == 0) { // vorher kein Fehler
            n_i2cError = pins.i2cWriteBuffer(pADDR, buf, repeat)
            if (n_i2cCheck && n_i2cError != 0)  // vorher kein Fehler, wenn (n_i2cCheck=true): beim 1. Fehler anzeigen
                basic.showString(Buffer.fromArray([pADDR]).toHex()) // zeige fehlerhafte i2c-Adresse als HEX
        } else if (!n_i2cCheck)  // vorher Fehler, aber ignorieren (n_i2cCheck=false): i2c weiter versuchen
            n_i2cError = pins.i2cWriteBuffer(pADDR, buf, repeat)
        //else { } // n_i2cCheck=true und n_i2cError != 0: weitere i2c Aufrufe blockieren
    }

    function i2cReadBuffer(pADDR: number, size: number, repeat: boolean = false): Buffer {
        if (!n_i2cCheck || n_i2cError == 0)
            return pins.i2cReadBuffer(pADDR, size, repeat)
        else
            return Buffer.create(size)
    }

} // joystick.ts
