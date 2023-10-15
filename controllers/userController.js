const CustomAPIError = require('../errors/custom-error');
const User = require('../models/userModel');
const Products = require('../models/productModel');
const Orders = require('../models/orderModel');
const cloudinary =require('cloudinary').v2;
const fs = require('fs');

// New Registration
const registerUser = async (req,res) => {
    const {name,email,password} = req.body;
    if(!name || !email || !password) {
        throw new CustomAPIError('Please Provide Credentials');
    }
    const picture = await cloudinary.uploader.upload(req.files.picture.tempFilePath, {
        use_filename: true,
        folder:'Ecommerce'
    })
    fs.unlinkSync(req.files.picture.tempFilePath);
    req.body.picture = picture.secure_url;
    const user = await User.create(req.body);
    const token = await user.createToken();
    res.status(201).json({user, token});
}

// Login
const loginUser = async (req,res) => {
    const {email, password} = req.body;
    if(!email || !password) {
        throw new CustomAPIError('Please Provide Credentials');
    }
    const user = await User.findOne({email});
    if(!user) {
        throw new CustomAPIError('User Not Found');
    }
    const isPasswordMatch = await user.comparePassword(password);
    if(!isPasswordMatch) {
        throw new CustomAPIError('Password Incorrect');
    }
    
    const token =await user.createToken();
    res.cookie('token', `Bearer ${token}`);
    res.status(200).json({user, token, success:true});
    // res.status(200).json({user, token});
}

// Dashboard Overview (Admin)
const dashboardOverview = async (req,res) => {
    const user = await User.find();
    const product = await Products.find();
    const order = await Orders.find();
    let totalOrderAmount = order.reduce((index, item) => {
        return index + item.grossTotal;
    }, 0)
    res.render('admin-dashboard', {name:req.user.name, id:req.user.userId, email:req.user.email, joined:req.user.joined, image:req.user.image, user, totalUser:user.length, totalProduct: product.length, totalOrder:order.length, totalOrderAmount});
}

// Get All users (Admin)
const getAllUsersAdmin = async (req,res) => {
    const user = await User.find();
    res.render('admin-users', {name:req.user.name, id:req.user.userId, email:req.user.email, joined:req.user.joined, image:req.user.image, user, totalUser:user.length});
}

// Get Single User 
const getSingleUser = async (req,res) => {
    const user = await User.findById({_id:req.user.userId});
    res.status(200).json({user});
}

// Get Single User (Admin)
const getSingleUserAdmin = async (req,res) =>{
    const {id} = req.params;
    const user = await User.findById({_id:id});
    res.status(200).render('admin-update-user', {
        image:req.user.image, 
        name:user.name, 
        email:user.email, 
        role:user.role,
        id:user._id
    });
}

// Update User Role (Admin)
const updateUserRole = async (req,res) => {
    const {id} = req.params;
    const user = await User.findByIdAndUpdate({_id:id}, {role:req.body.role}, {runValidators:true, new:true});
    res.status(200).json({user});
}

// Get Update User Profile Page
const updateUserProfile = async (req,res) => {
    const id = req.user.userId;
    const user = await User.findById({_id:id});
    res.render('edit-user-profile', {name:user.name, email:user.email, image:user.picture});
}

// Update User Profile Data
const updateUserProfileData = async (req,res) => {
    const id = req.user.userId;
    const {name, email,img} = req.body;
   
    let picture;
    if(req.files) {
       let pic = await cloudinary.uploader.upload(req.files.picture.tempFilePath, {
            use_filename: true,
            folder: 'Ecommerce'
       })
       fs.unlinkSync(req.files.picture.tempFilePath);
       picture = pic.secure_url;
    }
    else if(!req.files) {
        picture = img;
    }

    const user = await User.findByIdAndUpdate({_id:id}, {name:name, email:email, picture:picture}, {runValidators:true, new:true});

    const token =await user.createToken();
    res.cookie('token', `Bearer ${token}`);

    res.status(200).json({success:true, userRole:user.role});
}

// Change Password UI Page
const changePasswordPage = async (req,res) => {
    const id = req.user.userId;
    const user = await User.findById({_id:id});
    res.render('change-password', {image: user.picture});
}

// Change Password
const changePassword = async (req,res) => {
    const id = req.user.userId;
    const {oldPassword, newPassword, confirmPassword} = req.body;

    const user = await User.findById({_id:id});
    if(!oldPassword || !newPassword || !confirmPassword) {
        throw new CustomAPIError('Please Fill Required Feilds')
    }
    const isPasswordMatch = await user.comparePassword(oldPassword);
    if(!isPasswordMatch) {
        throw new CustomAPIError('Old Password Not Matched');
    }
    if(newPassword !== confirmPassword) {
        throw new CustomAPIError('New password Not Matched');
    }
    const updatedUser = await User.findByIdAndUpdate({_id:id}, {password: newPassword}, {runValidators:true, new:true});
    
    const token =await updatedUser.createToken();
    res.cookie('token', `Bearer ${token}`);
    await updatedUser.save({ validateBeforeSave: false });


    res.status(200).json({success:true, userRole:user.role});

}

// Delete User (Admin)
const deleteUser = async (req,res) => {
    const {id} = req.params;
    const user = await User.findByIdAndDelete({_id:id});
    res.status(200).redirect('/admin/users')
}


module.exports = {
    registerUser,
    loginUser,
    dashboardOverview,
    getSingleUser,
    getAllUsersAdmin,
    getSingleUserAdmin,
    updateUserRole,
    updateUserProfile,
    updateUserProfileData,
    changePasswordPage,
    changePassword,
    deleteUser
}