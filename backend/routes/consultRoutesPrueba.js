import express from 'express';
import {
    createPeticion,
    getUserPeticion,
    updatePeticion,
    deletePeticion,
    getPeticion
} from '../controllers/consultControllerPrueba.js';

const router = express.Router();
import { protect, protectAdminOnly } from '../middleware/authMiddleware.js';

router.route('/Solicitud-General')
.get(protect, getUserPeticion)
.post(protect, createPeticion)
.put(protect, updatePeticion)
.delete(protect, deletePeticion);

router.get('/all-Solicitud-General', protectAdminOnly, getPeticion);

export default router;