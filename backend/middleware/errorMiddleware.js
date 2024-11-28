const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    // This is because by default this manual error handler I am creating may throw an status code 200
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // This is for mongoose. You should change this when using mysql in the INE proyect
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    };

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

export {notFound, errorHandler};