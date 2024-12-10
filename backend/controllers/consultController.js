import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Consult from '../models/consultModel.js';
// import dd from '../utils/dumpAndDie.js';
// import { validationResult } from 'express-validator';

const createConsult = asyncHandler(async (req, res) => {
    const { state, municipio, parroquia, centro_poblado, start, end } = req.body;

    const consult = await Consult.create({
        state,
        municipio,
        parroquia,
        centro_poblado,
        start,
        end,
        final: "--/--/----",
        user: req.user._id
    });

    if (consult) {
        res.status(201).json({
            _id: consult._id,
            state: consult.state,
            municipio: consult.municipio,
            parroquia: consult.parroquia,
            centro_poblado: consult.centro_poblado,
            start: consult.start,
            end: consult.end,
            final: consult.final
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const getUserConsults = asyncHandler(async (req, res) => {
    const userConsults = await Consult.find({ user: req.user._id }).select('-user');

    res.status(200).json(userConsults);
});

const updateConsult = asyncHandler(async (req, res) => {

    const consult = await Consult.findOne({
        _id: req.body.consult_id,
        user: req.user._id
    });

    if (consult) {
        consult.state = req.body.state || consult.state;
        consult.municipio = req.body.municipio || consult.municipio;
        consult.parroquia = req.body.parroquia || consult.parroquia;
        consult.centro_poblado = req.body.centro_poblado || consult.centro_poblado;
        consult.start = req.body.start || consult.start;
        consult.end = req.body.end || consult.end;

        const updatedConsult = await consult.save();

        res.status(200).json({
            _id: updatedConsult._id,
            state: updatedConsult.state,
            municipio: updatedConsult.municipio,
            parroquia: updatedConsult.parroquia,
            centro_poblado: updatedConsult.centro_poblado,
            start: updatedConsult.start,
            end: updatedConsult.end,
        });
    } else {
        res.status(404);
        throw new Error('Consult not found');
    }
});

const deleteConsult = asyncHandler(async (req, res) => {

    const consult = await Consult.findOne({
        _id: req.body.consult_id,
        user: req.user._id
    });

    if (consult) {
        
        await Consult.deleteOne(consult);

        res.status(200).json('Consult deleted');

    } else {
        res.status(404);
        throw new Error('Consult not found');
    }
});

const getConsults = asyncHandler(async (req, res) => {
    const consults = await Consult.find();
    res.status(200).json(consults);
});

export {
    createConsult,
    getUserConsults,
    updateConsult,
    deleteConsult,
    getConsults
};