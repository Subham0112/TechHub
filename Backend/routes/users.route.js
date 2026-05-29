const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {body}=require('express-validator');

router.route('/register').post([
    body('email').isEmail().withMessage('Invalid email format'),
        body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long'),
        body('phone').isLength({min:10}).withMessage('Phone number must be at least 10 digits long')]
    ,userController.registerUser);

router.route('/login').post([
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long')],
    userController.loginUser);

    router.route("/profile").get(authMiddleware, userController.getUserProfile);
    router.route("/profile").put(authMiddleware, userController.updateProfile);

    router.route("/logout").post(authMiddleware, userController.logoutUser);

    module.exports = router;