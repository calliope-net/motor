
namespace qwiicmotor
/*
alle Definitionen aus:
https://github.com/sparkfun/Qwiic_SCMD_Py/blob/main/qwiic_scmd.py
wurden hier nicht gebraucht
*/ {
    /* 
        enum eRegister {
            FID = 0x00,
            ID = 0x01,
            MOTOR_A_INVERT = 0x12, MOTOR_B_INVERT = 0x13,
            BRIDGE = 0x14,
            MA_DRIVE = 0x20, MB_DRIVE = 0x21,
            DRIVER_ENABLE = 0x70,
            STATUS_1 = 0x77,
        }
    
        enum eSTATUS_1 {
            ENUMERATION_BIT = 0x01,
            BUSY_BIT = 0x02,
            REM_READ_BIT = 0x04,
            REM_WRITE_BIT = 0x08,
            HW_EN_BIT = 0x10
        }
     */
    /* 
            // Define the flags for  the device
        
            // defaults ( Set config in PSoC, use for reference in Arduino )
            const ID_WORD = 0xA9  // Device ID to be programmed into memory for reads
            const START_SLAVE_ADDR = 0x50  // Start address of slaves
            const MAX_SLAVE_ADDR = 0x5F  // Max address of slaves
            const MASTER_LOCK_KEY = 0x9B
            const USER_LOCK_KEY = 0x5C
            const FIRMWARE_VERSION = 0x07
            const POLL_ADDRESS = 0x4A  // Address of an unasigned, ready slave
            const MAX_POLL_LIMIT = 0xC8  // 200
        
            // SCMD_STATUS_1 bits
            const SCMD_ENUMERATION_BIT = 0x01
            const SCMD_BUSY_BIT = 0x02
            const SCMD_REM_READ_BIT = 0x04
            const SCMD_REM_WRITE_BIT = 0x08
            const SCMD_HW_EN_BIT = 0x10
        
            // SCMD_CONTROL_1 bits
            const SCMD_FULL_RESET_BIT = 0x01
            const SCMD_RE_ENUMERATE_BIT = 0x02
        
            // SCMD_FSAFE_CTRL bits and masks
            const SCMD_FSAFE_DRIVE_KILL = 0x01
            const SCMD_FSAFE_RESTART_MASK = 0x06
            const SCMD_FSAFE_REBOOT = 0x02
            const SCMD_FSAFE_RE_ENUM = 0x04
            const SCMD_FSAFE_CYCLE_USER = 0x08
            const SCMD_FSAFE_CYCLE_EXP = 0x10
        
            // SCMD_MST_E_IN_FN bits and masks
            const SCMD_M_IN_RESTART_MASK = 0x03
            const SCMD_M_IN_REBOOT = 0x01
            const SCMD_M_IN_RE_ENUM = 0x02
            const SCMD_M_IN_CYCLE_USER = 0x04
            const SCMD_M_IN_CYCLE_EXP = 0x08
        
            // Address map
            const SCMD_FID = 0x00
            const SCMD_ID = 0x01
            const SCMD_SLAVE_ADDR = 0x02
            const SCMD_CONFIG_BITS = 0x03
            const SCMD_U_I2C_RD_ERR = 0x04
            const SCMD_U_I2C_WR_ERR = 0x05
            const SCMD_U_BUF_DUMPED = 0x06
            const SCMD_E_I2C_RD_ERR = 0x07
            const SCMD_E_I2C_WR_ERR = 0x08
            const SCMD_LOOP_TIME = 0x09
            const SCMD_SLV_POLL_CNT = 0x0A
            const SCMD_SLV_TOP_ADDR = 0x0B
            const SCMD_MST_E_ERR = 0x0C
            const SCMD_MST_E_STATUS = 0x0D
            const SCMD_FSAFE_FAULTS = 0x0E
            const SCMD_REG_OOR_CNT = 0x0F
            const SCMD_REG_RO_WRITE_CNT = 0x10
            const SCMD_GEN_TEST_WORD = 0x11
            const SCMD_MOTOR_A_INVERT = 0x12
            const SCMD_MOTOR_B_INVERT = 0x13
            const SCMD_BRIDGE = 0x14
            const SCMD_LOCAL_MASTER_LOCK = 0x15
            const SCMD_LOCAL_USER_LOCK = 0x16
            const SCMD_MST_E_IN_FN = 0x17
            const SCMD_U_PORT_CLKDIV_U = 0x18
            const SCMD_U_PORT_CLKDIV_L = 0x19
            const SCMD_U_PORT_CLKDIV_CTRL = 0x1A
            const SCMD_E_PORT_CLKDIV_U = 0x1B
            const SCMD_E_PORT_CLKDIV_L = 0x1C
            const SCMD_E_PORT_CLKDIV_CTRL = 0x1D
            const SCMD_U_BUS_UART_BAUD = 0x1E
            const SCMD_FSAFE_CTRL = 0x1F
            const SCMD_MA_DRIVE = 0x20
            const SCMD_MB_DRIVE = 0x21
            const SCMD_S1A_DRIVE = 0x22
            const SCMD_S1B_DRIVE = 0x23
            const SCMD_S2A_DRIVE = 0x24
            const SCMD_S2B_DRIVE = 0x25
            const SCMD_S3A_DRIVE = 0x26
            const SCMD_S3B_DRIVE = 0x27
            const SCMD_S4A_DRIVE = 0x28
            const SCMD_S4B_DRIVE = 0x29
            const SCMD_S5A_DRIVE = 0x2A
            const SCMD_S5B_DRIVE = 0x2B
            const SCMD_S6A_DRIVE = 0x2C
            const SCMD_S6B_DRIVE = 0x2D
            const SCMD_S7A_DRIVE = 0x2E
            const SCMD_S7B_DRIVE = 0x2F
            const SCMD_S8A_DRIVE = 0x30
            const SCMD_S8B_DRIVE = 0x31
            const SCMD_S9A_DRIVE = 0x32
            const SCMD_S9B_DRIVE = 0x33
            const SCMD_S10A_DRIVE = 0x34
            const SCMD_S10B_DRIVE = 0x35
            const SCMD_S11A_DRIVE = 0x36
            const SCMD_S11B_DRIVE = 0x37
            const SCMD_S12A_DRIVE = 0x38
            const SCMD_S12B_DRIVE = 0x39
            const SCMD_S13A_DRIVE = 0x3A
            const SCMD_S13B_DRIVE = 0x3B
            const SCMD_S14A_DRIVE = 0x3C
            const SCMD_S14B_DRIVE = 0x3D
            const SCMD_S15A_DRIVE = 0x3E
            const SCMD_S15B_DRIVE = 0x3F
            const SCMD_S16A_DRIVE = 0x40
            const SCMD_S16B_DRIVE = 0x41
        
            const SCMD_INV_2_9 = 0x50
            const SCMD_INV_10_17 = 0x51
            const SCMD_INV_18_25 = 0x52
            const SCMD_INV_26_33 = 0x53
            const SCMD_BRIDGE_SLV_L = 0x54
            const SCMD_BRIDGE_SLV_H = 0x55
        
            // SCMD_PAGE_SELECT           = 0x6F
            const SCMD_DRIVER_ENABLE = 0x70
            const SCMD_UPDATE_RATE = 0x71
            const SCMD_FORCE_UPDATE = 0x72
            const SCMD_E_BUS_SPEED = 0x73
            const SCMD_MASTER_LOCK = 0x74
            const SCMD_USER_LOCK = 0x75
            const SCMD_FSAFE_TIME = 0x76
            const SCMD_STATUS_1 = 0x77
            const SCMD_CONTROL_1 = 0x78
        
            const SCMD_REM_ADDR = 0x79
            const SCMD_REM_OFFSET = 0x7A
            const SCMD_REM_DATA_WR = 0x7B
            const SCMD_REM_DATA_RD = 0x7C
            const SCMD_REM_WRITE = 0x7D
            const SCMD_REM_READ = 0x7E
    */
} // qwiicmotormotor-enum.ts
