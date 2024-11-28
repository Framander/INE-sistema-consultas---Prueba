import express from 'express';
import {
    authUser,
    registerUser,
    CreateCode,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsersProfiles,
} from '../controllers/userController.js';
const router = express.Router();
import { protect, protectAdminOnly } from '../middleware/authMiddleware.js';
import { checkSchema } from '../validation/custom.js';
// import dd from '../utils/dumpAndDie.js';
import UserOTPVerification from '../models/userOTPVerification.js';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

// router.post('/', body('name').isEmpty(), registerUser);

const uservalidate = {
    name: {
        notEmpty: {
            errorMessage: 'Name is required'
        }
    },
    last_name: {
        notEmpty: {
            errorMessage: 'Last name is required'
        }
    },
    email: {
        notEmpty: {
            errorMessage: 'Email is required'
        },
        isEmail: {
            errorMessage: 'Must be a valid email'
        }
    },
    cedula: {
        notEmpty: {
            errorMessage: 'Cedula is required'
        },
        isLength: {
            options: {
                min: 7,
                max: 8
            },
            errorMessage: 'Cedula length invalid'
        },
        isNumberOnly: {
            errorMessage: 'Cedula must contain only numbers'
        }
    },
    number: {
        notEmpty: {
            errorMessage: 'Number is required'
        },
        isLength: {
            options: {
                min: 10,
                max: 11
            },
            errorMessage: 'Number length invalid'
        },
        isNumberOnly: {
            errorMessage: 'Number must contain only numbers'
        }
    },
    entidad_federal: {
        notEmpty: {
            errorMessage: 'Entidad is required'
        },
        isLength: {
            options: {
                min: 5
            },
            errorMessage: 'Entidad length invalid'
        },
    },
    address: {
        notEmpty: {
            errorMessage: 'Address is required'
        },
        isLength: {
            options: {
                min: 5
            },
            errorMessage: 'Address length invalid'
        }
    },
    password: {
        notEmpty: {
            errorMessage: 'Password is required'
        }
    },
}

router.post('/', checkSchema(uservalidate, ['body']), registerUser);

router.post('/verify-code', checkSchema(uservalidate, ['body']), CreateCode);

router.post('/auth', checkSchema({
    email: {
        cedulaAndEmailNotEmpty: {
            isEmail: {
                errorMessage: 'Must be a valid email'
            },
            errorMessage: 'Debe haber una cedula o algun email'
        }
    },
    cedula: {
        optional: true,
        isLength: {
            options: {
                min: 7,
                max: 8
            },
            errorMessage: 'Cedula length invalid'
        },
        isNumberOnly: {
            errorMessage: 'Cedula must contain only numbers'
        }
    },
    password: {
        notEmpty: {
            errorMessage: 'Password is required'
        }
    },
}, ['body']), authUser);

router.post('/logout', logoutUser);

router.route('/profile').get(protect, getUserProfile).put(protect, checkSchema({
    entidad_federal: {
        optional: true,
        isLength: {
            options: {
                min: 5
            },
            errorMessage: 'Entidad length invalid'
        }
    },
    address: {
        optional: true,
        isLength: {
            options: {
                min: 5
            },
            errorMessage: 'Address length invalid'
        }
    },
    number: {
        optional: true,
        isLength: {
            options: {
                min: 10,
                max: 11
            },
            errorMessage: 'Number length invalid'
        },
        isNumberOnly: {
            errorMessage: 'Number must contain only numbers'
        }
    },
}, ['body']), updateUserProfile);

router.get('/profiles', protectAdminOnly, getUsersProfiles);

router.post("/verifyOTP", async (req, res) => {
    try {
        let { userId, otp } = req.body;
        
        if (!userId || !otp || otp.length < 6) {
            throw Error("No estan permitidos los valores en blanco o menores a 6 digitos");
        } else {
            const UserOTPVerificationRecords = await UserOTPVerification.find({
                userId,
            });


            if (UserOTPVerificationRecords.length <= 0) {
                // no record found
                throw new Error(
                    "Los datos suministrados no existen o ya han sido verificados. Porfavor ingrese a su cuenta o cree su nuevo usuario"
                );
            } else {
                // user otp record exists
                const { expiresAt } = UserOTPVerificationRecords[0];
                const hashedOTP = UserOTPVerificationRecords[0].otp;

                if (expiresAt < Date.now()) {
                    // user otp record has expired
                    await UserOTPVerification.deleteMany({ userId });
                    throw new Error("Su codigo de verificación a expirado. Porfavor solicite uno nuevo.");
                } else {
                    const validOTP = await bcrypt.compare(otp, hashedOTP);

                    if (!validOTP) {
                        // supplied otp is wrong
                        throw new Error("Codigo erroneo, verifique su correo")
                    } else {
                        //succes 
                        
                        await UserOTPVerification.deleteMany({ userId });
                        res.json({
                            status: "VERIFIED",
                            message: `User email verified succesfully.`,
                        });
                    }
                }
            }
        }
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        });
    }
});

export default router;