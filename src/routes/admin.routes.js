import express from 'express'
import { validateUser } from '../middlewares/auth.middleware.js';
import { updatingUserCustomDressPriceAnduserDressOrderInfo, dressUpload, allDress, userOrders
,orderCompleted } from '../controllers/admin.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();


router.route("/updating-price-stage").post(updatingUserCustomDressPriceAnduserDressOrderInfo);

router.route('/dress-upload').post(
    upload.single("image"),
    dressUpload
)

router.route("/all-dress").get(allDress);

router.route('/user-order').get(userOrders);


router.route("/order-completed").post(orderCompleted);

export default router