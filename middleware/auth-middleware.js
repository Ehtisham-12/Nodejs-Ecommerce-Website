const jwt = require('jsonwebtoken');
const CustomAPIError = require('../errors/custom-error');


const authMiddleWare = async (req,res,next) => {
    const authHeader = req.cookies.token;
    // const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new CustomAPIError('Not authorize to access this route');
    }

    const token = authHeader.split(' ')[1];

    try {
        const payLoad = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = {userId: payLoad.id, name: payLoad.name, email:payLoad.email, joined:payLoad.joined, image:payLoad.image,role:payLoad.role};
        next();
    } catch (error) {
        throw new CustomAPIError('Not Authenticated User');
    }
}

module.exports = authMiddleWare;