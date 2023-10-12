
namespace qwiicmotor
/*
*/ {
    export enum eADDR_joy { Joystick_x20 = 0x20 }
    let n_i2cCheck: boolean = false // i2c-Check
    let n_i2cError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)

    export function beimStart_joy(pADDR: number,ck: boolean) {
        n_i2cCheck = ck
        n_i2cError = 0 // Reset Fehlercode
        qwiicmotor_readJoystick(pADDR)
    }



    // ========== group="2 Motoren fahren mit SparkFun Qwiic Joystick"


    //% group="2 Motoren fahren mit SparkFun Qwiic Joystick" subcategory="Joystick" color="#BF3F7F"
    //% block="i2c %pADDR fahren %pJoystick" weight=6
    //% pADDR.shadow="qwiicmotor_eADDR"
    //% pJoystick.shadow="qwiicmotor_readJoystick"
    export function driveJoystick(pADDR: number, pJoystick: number) {
        drive255(pADDR, pJoystick)
    }

    // ========== group="Motor (0 .. 128 .. 255) (auch für Fernsteuerung)"

    //% blockId=qwiicmotor_readJoystick
    //% group="Motor (0 .. 128 .. 255) (auch für Fernsteuerung)" subcategory="Joystick" color="#BF3F7F"
    //% block="i2c %pADDR" weight=4
    //% pADDR.shadow="qwiicmotor_eADDR_joy"
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
            returnBuffer.setUint8(2, (en ? 0 : 1)) // (0: gedrückt) DRIVER_ENABLE=true
        } else {
            returnBuffer.setUint8(0, 128)
            returnBuffer.setUint8(1, 128)
            returnBuffer.setUint8(2, 1) // DRIVER_ENABLE=false
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
