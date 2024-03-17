import express from 'express';
import { registerUser, loginUser, logoutUser, userDressUpload, 
particularDressSection, orderCompleted, allCustomDresses, particularCustomDress,
allDress, isUserAuth } from '../controllers/user.controller.js';
import { validateUser } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route('/register').post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(validateUser, logoutUser);

router.route("/user-dress").post(
    validateUser,
    upload.single("dressImage"),
    userDressUpload
);

router.route("/all-dress").post(validateUser, allDress);

router.route("/particular-dress").post(validateUser, particularDressSection);

router.route("/order-completed").post(validateUser, orderCompleted);

router.route("/all-coustom-design").post(validateUser, allCustomDresses);

router.route("/particular-custom-dresses").post(validateUser, particularCustomDress);

router.route('/user-auth').get(isUserAuth)

export default router