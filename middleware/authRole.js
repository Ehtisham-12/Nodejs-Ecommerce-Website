const jwt = require('jsonwebtoken');
const CustomAPIError = require('../errors/custom-error');


const authRole = async (req,res,next) => {
    if(req.user.role === 'admin') {
        next();
    }
    else {
        throw new CustomAPIError('Page Not Found');
    }
}

module.exports = authRole;