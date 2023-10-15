
const errorHandler = async (err,req,res,next) => {
    const customError = {
        statusCode: err.statusCode || 500,
        msg: err.message || 'Something Went Wrong'
    }

    if(err.name === 'ValidationError'){
        customError.msg = Object.values(err.errors).map(item => item.message).join(',');
        customError.statusCode = 400;
    }
    if(err.code === 11000) {
        customError.msg = `User Already Exist with Email ${err.keyValue.email}`
        customError.statusCode = 400
    }
    // res.status(500).json({err});
    console.log(customError.msg)
    res.status(customError.statusCode).json({msg:customError.msg});
}


module.exports = errorHandler