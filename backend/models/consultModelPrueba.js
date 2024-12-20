import mongoose from "mongoose";

const peticionPrueba = mongoose.Schema({
    tipo: {
        type: String,
        required: true
    },
    box: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    final: {
        type: Date,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

}, {
    timestamps: true
})

const Peticion = mongoose.model('Peticion', peticionPrueba);

export default Peticion;