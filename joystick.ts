
namespace qwiicmotor
/*
*/ {
    export enum eADDR_joy { Joystick_x20 = 0x20 }
    let n_i2cCheck: boolean = false // i2c-Check
    let n_i2cError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)

    export function beimStart(ck: boolean) {
        n_i2cCheck = ck
        n_i2cError = 0 // Reset Fehlercode
    }

    // ========== group="2 Motoren fahren mit SparkFun Qwiic Joystick"
/* 
    //% group="2 Motoren fahren mit SparkFun Qwiic Joystick" subcategory="Joystick"
    //% block="i2c %pADDR fahren Joystick || i2c-Adresse %qwiicjoystick"
    //% pADDR.shadow="qwiicmotor_eADDR"
    //% qwiicjoystick.shadow="qwiicmotor_joy_eADDR"
    // qwiicjoystick.defl=32
     function driveJoystick(pADDR: number, qwiicjoystick?: number) {
        let bu = Buffer.create(1)
        bu.setUint8(0, 3) // Joystick Register 3-7 lesen
        i2cWriteBuffer(qwiicjoystick, bu, true)

        bu = i2cReadBuffer(qwiicjoystick, 5) // Joystick Register 3-7 lesen

        if (bu.getUint8(4) == 0) { // Register 7: Current Button Position (0:gedrückt)
            controlRegister(pADDR, eControl.DRIVER_ENABLE, true)
        }

        let driveValue = bu.getUint8(0) // Register 3: Horizontal MSB 8 Bit
        if (0x78 < driveValue && driveValue < 0x88) driveValue = 0x80 // off at the outputs
        writeRegister(pADDR, eRegister.MA_DRIVE, driveValue)

        driveValue = bu.getUint8(2) // Register 5: Vertical MSB 8 Bit
        if (0x78 < driveValue && driveValue < 0x88) driveValue = 0x80 // off at the outputs
        writeRegister(pADDR, eRegister.MB_DRIVE, driveValue)
    }
 */

    //% group="SparkFun Qwiic Joystick " subcategory="Joystick"
    //% block="i2c %pADDR fahre Joystick %pJoystick"
    //% pADDR.shadow="qwiicmotor_eADDR"
    //% pJoystick.shadow="qwiicmotor_readJoystick"
    export function driveArray(pADDR: number, pJoystick: number) {
        let bu = Buffer.create(4)
        bu.setNumber(NumberFormat.UInt32LE, 0, pJoystick)

        if (bu.getUint8(2) == 0) { // Register 7: Current Button Position (0:gedrückt)
            qwiicmotor.controlRegister(pADDR, eControl.DRIVER_ENABLE, true)
        }

        let driveValue = bu.getUint8(0) // Register 3: Horizontal MSB 8 Bit
        if (0x78 < driveValue && driveValue < 0x88) driveValue = 0x80 // off at the outputs
        qwiicmotor.writeRegister(pADDR, eRegister.MA_DRIVE, driveValue)

        driveValue = bu.getUint8(1) // Register 5: Vertical MSB 8 Bit
        if (0x78 < driveValue && driveValue < 0x88) driveValue = 0x80 // off at the outputs
        qwiicmotor.writeRegister(pADDR, eRegister.MB_DRIVE, driveValue)
    }

    //% blockId=qwiicmotor_readJoystick
    //% group="SparkFun Qwiic Joystick " subcategory="Joystick"
    //% block="i2c %pADDR lese Joystick"
    //% pADDR.shadow="qwiicmotor_joy_eADDR"
    export function qwiicmotor_readJoystick(pADDR: number): number {
        let returnBuffer = Buffer.create(4)

        let bu = Buffer.create(1)
        bu.setUint8(0, 3) // Joystick Register 3-7 lesen
        i2cWriteBuffer(pADDR, bu, true)

        bu = i2cReadBuffer(pADDR, 6) // Joystick Register 3-8 lesen

        returnBuffer.setUint8(0, bu.getUint8(0)) // Register 3: Horizontal MSB 8 Bit
        returnBuffer.setUint8(1, bu.getUint8(2)) // Register 5: Vertical MSB 8 Bit
        returnBuffer.setUint8(2, bu.getUint8(4)) // Register 7: Current Button Position (0:gedrückt)
        returnBuffer.setUint8(3, bu.getUint8(5)) // Register 8: STATUS 1:gedrückt

        return returnBuffer.getNumber(NumberFormat.UInt32LE, 0)

    }


    // ========== group="i2c Adressen"

    //% blockId=qwiicmotor_joy_eADDR
    //% group="i2c Adressen" subcategory="Joystick"
    //% block="%pADDR" weight=6
    export function qwiicmotor_joy_eADDR(pADDR: eADDR_joy): number { return pADDR }

    //% group="i2c Adressen" subcategory="Joystick"
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
