import mongoose from "mongoose";

const consultSchema = mongoose.Schema({
    state: {
        type: String,
        required: true
    },
    municipio: {
        type: String,
        required: true
    },
    parroquia: {
        type: String,
        required: true,
    },
    centro_poblado: {
        type: String,
        required: true,
    },
    start: {
        type: Date,
        required: true,
    },
    end: {
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
});

const Consult = mongoose.model('Consult', consultSchema);

export default Consult;