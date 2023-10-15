const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Provide Name']
    },
    email: {
        type: String,
        required: [true, 'Please Provide Email'],
        unique:true,
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',]
    },
    password: {
        type: String,
        required: [true, 'Please Enter Password'],
        minLength:[8, 'Password Should Be Greater Then 8 Digits']
    },
    picture: {
        type: String,
        required: [true, "Please Provide Image"]
    },
    role:{
        type:String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

UserSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}

UserSchema.methods.createToken = async function () {
    const token = await jwt.sign({id:this._id, name:this.name, email:this.email, joined:this.createdAt, image:this.picture, role:this.role}, process.env.JWT_SECRET, {expiresIn:process.env.JWT_LIFETIME});
    return token;
}

module.exports = mongoose.model('User', UserSchema);