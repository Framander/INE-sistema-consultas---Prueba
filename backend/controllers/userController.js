import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import dd from '../utils/dumpAndDie.js';
import { validationResult } from 'express-validator';
import NodeMailer from 'nodemailer'
import bcrypt from 'bcryptjs';
import UserOTPVerification from '../models/userOTPVerification.js';

// @desc    Auth user/set token
// route    POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(400);
        throw new Error(result.errors[0].msg);
    }
    const { email, cedula, password } = req.body;

    const user = await User.findOne({
        $or: [
            { email },
            { cedula }
        ]
    });


    // Remember that an async function return a promise
    if (user && (await user.matchPasswords(password))) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            last_name: user.last_name,
            email: user.email,
            cedula: user.cedula,
            entidad_federal: user.entidad_federal,
            number: user.number,
            address: user.address
        });

    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// route    POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {

    const result = validationResult(req);

    if (!result.isEmpty()) {
        res.status(400);
        throw new Error(result.errors[0].msg);
    }

    const { name, last_name, email, cedula, entidad_federal, address, number, password } = req.body;

    const userExists = await User.findOne({
        $or: [
            { email },
            { cedula }
        ]
    });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        last_name,
        email,
        cedula,
        entidad_federal,
        address,
        number,
        password,
        role: 'user'
    });

    user.save()

    if (user) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            last_name: user.last_name,
            email: user.email,
            cedula: user.cedula,
            entidad_federal: user.entidad_federal,
            address: user.address,
            number: user.number
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const registerAdmin = asyncHandler(async (req, res) => {

    const result = validationResult(req);

    if (!result.isEmpty()) {
        res.status(400);
        throw new Error(result.errors[0].msg);
    }

    const { name, last_name, email, cedula, entidad_federal, address, number, password } = req.body;

    const userExists = await User.findOne({
        $or: [
            { email },
            { cedula }
        ]
    });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        last_name,
        email,
        cedula,
        entidad_federal,
        address,
        number,
        password,
        role: 'admin'
    });

    user.save()

    if (user) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            last_name: user.last_name,
            email: user.email,
            cedula: user.cedula,
            entidad_federal: user.entidad_federal,
            address: user.address,
            number: user.number
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const CreateCode = asyncHandler(async (req, res) => {

    const result = validationResult(req);

    if (!result.isEmpty()) {
        res.status(400);
        throw new Error(result.errors[0].msg);
    }

    const { name, last_name, email, cedula } = req.body;

    const userExists = await User.findOne({
        $or: [
            { email },
            { cedula }
        ]
    });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const otp = `${Math.floor( 10000 + Math.random() * 900000)}`;
    if (otp.length < 6) {
        otp = `${Math.floor( 10000 + Math.random() * 900000)}`;
    }   
    const message = `<p> Hola ${name} ${last_name}. <br><br>
                    Ingrese el codigo de verificación que le estamos proporcionando para validar la creación de su cuenta SAU.<br><br>
                    Su codigo de verificación es: <b>${otp}</b>.</p>`;

    const user_id = await sendOTPVerificationEmail({ email: email, _id: otp*654 }, message, otp);
    // sendOTPVerificationEmail(result, res, message, otp)
    res.json(user_id)
});


// @desc    Logout a user
// route    POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({ message: 'User Logged Out' });
});

// @desc    Get user profile
// route    GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        last_name: req.user.last_name,
        email: req.user.email,
        cedula: req.user.cedula,
        entidad_federal: req.user.entidad_federal,
        address: req.user.address,
        number: req.user.number
    }

    res.status(200).json(user);
});

// @desc    Update a user profile
// route    PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.status(400);
        throw new Error(result.errors[0].msg);
    }

    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.last_name = req.body.last_name || user.last_name;
        // user.email = req.body.email || user.email;
        // user.cedula = req.body.cedula || user.cedula;
        user.entidad_federal = req.body.entidad_federal || user.entidad_federal;
        user.address = req.body.address || user.address;
        user.number = req.body.number || user.number;

        // if (req.body.password) {
        //     user.password = req.body.password;
        // }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            last_name: updatedUser.last_name,
            // email: updatedUser.email,
            // cedula: updatedUser.cedula,
            entidad_federal: updatedUser.entidad_federal,
            address: updatedUser.address,
            number: updatedUser.number
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const getUsersProfiles = asyncHandler(async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

export {
    authUser,
    registerUser,
    registerAdmin,
    CreateCode,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsersProfiles
};

const sendOTPVerificationEmail = async ({ _id, email }, message, otp) => {
    try {

        // Email verification code 

        let transporter = NodeMailer.createTransport({
            host: "mail.ine.gob.ve",
            auth: {
                user: process.env.Auth_Email,
                pass: process.env.Auth_PASS,
            },
        })

        //mail options
        const mailOptions = {
            from: process.env.Auth_Email,
            to: email,
            subject: "Servicio de Atención al Usuario - Verificación de Correo Electrónico",
            html: message,
        };

        //hash the otp

        const saltRounds = 10;

        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });

        // save otp record

        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);

        return newOTPVerification

    } catch (error) {
        throw new Error(error.message);
    }
};

// Verify otp email



// resend verification
// router.post("/resendOTPVerificationCode", async (req, res) => {
//     try {
//         let {userId, email} = req.body;

//         if (!userId || !email ) {
//             throw Error("No se permiten espacios en blanco")
//         } else {
//             //delete existing records and resend

//             await UserOTPVerification.deleteMany({ userId });
//             sendOTPVerificationEmail({ _id: userId, email }, res);
//         }
//     } catch (error) {
//         res.json({
//             status: "FAILED",
//             message: error.message,
//         })
//     }
// })