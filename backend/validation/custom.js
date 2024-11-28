import { ExpressValidator } from 'express-validator';
import dd from '../utils/dumpAndDie.js';

export const { checkSchema } = new ExpressValidator({
        cedulaAndEmailNotEmpty: (value, { req }) => {
            return req.body.cedula || req.body.email;
        },
        isNumberOnly: (value) => {
            return /^\d+$/.test(value);
        },
    }
);