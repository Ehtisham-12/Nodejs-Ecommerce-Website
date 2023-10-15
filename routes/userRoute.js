const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const authRole = require('../middleware/authRole');

// controllers
const {
    registerUser,
    loginUser,
    dashboardOverview,
    getSingleUser,
    getAllUsersAdmin,
    getSingleUserAdmin,
    updateUserProfile,
    updateUserRole,
    updateUserProfileData,
    changePasswordPage,
    changePassword,
    deleteUser
} = require('../controllers/userController');




router.route('/login').get((req,res)=>{
    res.render('login');
})

router.route('/logout').get((req,res)=> {
    res.clearCookie('token');
    res.redirect('/');
})

router.route('/user').get(auth,  (req,res) => {
    res.render('profile', {name:req.user.name, id:req.user.userId, email:req.user.email, joined:req.user.joined, image:req.user.image});
})

router.route('/admin').get(auth, authRole, (req,res) => {
    res.render('admin', {name:req.user.name, id:req.user.userId, email:req.user.email, joined:req.user.joined, image:req.user.image});
})

router.route('/homeUser').get(auth, getSingleUser);

router.route('/admin/dashboard').get(auth,authRole, dashboardOverview)
router.route('/admin/users').get(auth,authRole, getAllUsersAdmin);
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// Get Single User (Admin)
router.route('/admin/user/:id').get(auth, authRole, getSingleUserAdmin);

// Update User Role
router.route('/admin/user/:id').post(auth, authRole, updateUserRole);

//Get Update User Profile Page
router.route('/profile/update').get(auth, updateUserProfile);

// Update User Profile Data
router.route('/profile/user/update').post(auth, updateUserProfileData);

// Change Password Page 
router.route('/profile/change/password').get(auth, changePasswordPage);

// Change password 
router.route('/profile/changed-password').put(auth,changePassword)

// Delete User (Admin)
router.route('/admin/user/delete/:id').get(auth,authRole,deleteUser)


module.exports = router