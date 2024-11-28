import express from 'express';
import {
    getUserConsults,
    createConsult,
    updateConsult,
    deleteConsult,
    getConsults
} from '../controllers/consultController.js';

const router = express.Router();
import { protect, protectAdminOnly } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getUserConsults).post(protect, createConsult).put(protect, updateConsult).delete(protect, deleteConsult);

router.get('/all', protectAdminOnly, getConsults);


export default router;