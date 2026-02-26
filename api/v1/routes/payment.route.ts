import { Router } from "express";

import * as paymentController from "../controllers/payment.controller";

const router = Router();

router.post("/create-qr", paymentController.createQr);
router.post("/momo-create", paymentController.momoCreate);
router.get("/vnpay-return", paymentController.vnpayReturn);

export const paymentRoute: Router = router;
