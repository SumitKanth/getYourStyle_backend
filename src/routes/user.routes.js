import express from 'express';
import { registerUser, loginUser, logoutUser, userDressUpload, 
particularDressSection, allCustomDresses, particularCustomDress, isUserAuth,
 userDressFromDressSection, particularUserDressFromUserDress, deleteOrder } from '../controllers/user.controller.js';
import { validateUser } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route('/register').post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(validateUser, logoutUser);

router.route("/user-dress").post(
    upload.single("dressImage"),
    userDressUpload
);

router.route("/particular-dress").post(validateUser, particularDressSection);

router.route("/all-coustom-design").post(validateUser, allCustomDresses);

router.route("/particular-custom-dresses").post(validateUser, particularCustomDress);

router.route('/user-auth').get(isUserAuth)

router.route("/user-dress-from-dress-section").post(validateUser, userDressFromDressSection);

router.route("/user-dress-for-cart").get(validateUser, particularUserDressFromUserDress)

router.route("/order-delete").post(validateUser, deleteOrder);

export default router