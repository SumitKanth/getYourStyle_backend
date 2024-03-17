import express from 'express'
import { validateUser } from '../middlewares/auth.middleware.js';
import { updatingUserCustomDressPrice, dressUpload } from '../controllers/admin.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();


router.route("/updating-price-stage").post(validateUser, updatingUserCustomDressPrice);

router.route('/dress-upload').post(
    upload.single("image"),
    dressUpload
)


export default router