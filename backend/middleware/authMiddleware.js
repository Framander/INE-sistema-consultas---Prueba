import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import dd from '../utils/dumpAndDie.js';
import { Error } from 'mongoose';
import { notFound } from './errorMiddleware.js';

const protect = asyncHandler(async (req, res, next) => {
    
    let token;
    token = req.cookies.jwt;
    
    if (token) {

        try {
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);        
            req.user = await User.findById(decoded.userId).select('-password');

            if(req.user.role !== 'admin' || !req.body._id) {
                next();
                return;
            }

        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, invalid token');
        }
        
        req.user = await User.findById(req.body._id).select('-password');

        if(!req.user) {
            res.status(401);
            throw new Error('User not found');
        }
        
        next();

    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const protectAdminOnly = asyncHandler(async (req, res, next) => {
    let token;

    token = req.cookies.jwt;

    if (token) {

        try {

            const decoded = jwt.verify(token, process.env.JWT_SECRET);        
            req.user = await User.findById(decoded.userId).select('-password');
        
        } catch (error) {
            
            res.status(401);
            throw new Error('Not authorized, invalid token');
        
        }

        if(req.user.role !== 'admin') {
            res.status(404);
            notFound(req, res, next);
        }

        next();

    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

export { protect, protectAdminOnly };