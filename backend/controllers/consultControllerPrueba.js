import Peticion from "../models/consultModelPrueba.js";
import asyncHandler from 'express-async-handler';

const createPeticion = asyncHandler(async (req, res) => {

    const { tipo, box } = req.body;

    const peticion = await Peticion.create({
        tipo,
        box,
        status: "En progreso",
        user: req.user._id
    });

    if (peticion) {
        res.status(201).json({
            _id: peticion._id,
            tipo: peticion.tipo,
            box: peticion.box,
            status: peticion.status
        });

    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }

});

const getUserPeticion = asyncHandler(async (req, res) => {
    try {
        const userPeticion = await Peticion.find({ user: req.user._id }).select('-user');
        res.status(200).json(userPeticion);
    } catch (error) {
        console.log(error);
    }
});

const getUserPeticionbyID = asyncHandler(async (req, res) => {
    try {
        const userPeticion = await Peticion.find({ _id: req.body._id }).select('-user');
        res.status(200).json(userPeticion);
    } catch (error) {
        console.log(error);
    }
});

const updatePeticion = asyncHandler(async (req, res) => {

    const peticion = await Peticion.findOne({
        _id: req.body.consult_id,
        user: req.user._id,
    });

    if (peticion) {
        peticion.tipo = req.body.tipo || peticion.tipo;
        peticion.box = req.body.box || peticion.box;
        peticion.status = req.body.status || peticion.status;


        const updatedPeticion = await peticion.save();

        res.status(200).json({
            _id: updatedPeticion._id,
            tipo: updatedPeticion.tipo,
            box: updatedPeticion.box,
            status: updatedPeticion.status,
        });
    } else {
        res.status(404);
        throw new Error('Consult not found');
    }
});

const deletePeticion = asyncHandler(async (req, res) => {

    const peticion = await Peticion.findOne({
        _id: req.body.peticion_id,
        user: req.user._id
    });

    if (peticion) {

        await Peticion.deleteOne(peticion);

        res.status(200).json('Peticion deleted');

    } else {
        res.status(404);
        throw new Error('Peticion not found');
    }
});

const getPeticion = asyncHandler(async (req, res) => {
    const peticion = await Peticion.find();
    res.status(200).json(peticion);
});

export {
    createPeticion,
    getUserPeticion,
    getUserPeticionbyID,
    updatePeticion,
    deletePeticion,
    getPeticion
};