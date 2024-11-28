import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '200h'
    });

    try {
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development', 
            sameSite: 'strict',
            maxAge: 30 * 240 * 600 * 600 * 10000
        })
    } catch (error) {
        console.log(error);
        
    }

};

export default generateToken;