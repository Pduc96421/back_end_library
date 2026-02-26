"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.momoCreate = exports.vnpayReturn = exports.createQr = void 0;
const vnpay_1 = require("vnpay");
const createQr = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vnpay = new vnpay_1.VNPay({
        tmnCode: "JA7KBF8X",
        secureSecret: "KQPD7DWO8YTTXCIAT8FV1LG4BN21DQ66",
        vnpayHost: "https://sandbox.vnpayment.vn",
        testMode: true,
        hashAlgorithm: vnpay_1.HashAlgorithm.SHA512,
        loggerFn: vnpay_1.ignoreLogger,
    });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: 10000,
        vnp_IpAddr: "localhost",
        vnp_TxnRef: "123456",
        vnp_OrderInfo: "Thanh toan don hang 123456",
        vnp_OrderType: vnpay_1.ProductCode.Other,
        vnp_ReturnUrl: "http://localhost:8080/payments/vnpay-return",
        vnp_Locale: vnpay_1.VnpLocale.VN,
        vnp_CreateDate: (0, vnpay_1.dateFormat)(new Date()),
        vnp_ExpireDate: (0, vnpay_1.dateFormat)(tomorrow),
    });
    return res.status(200).json({
        code: 200,
        message: "Tạo thanh toán thành công",
        result: paymentUrl,
    });
});
exports.createQr = createQr;
const vnpayReturn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query);
});
exports.vnpayReturn = vnpayReturn;
const momoCreate = (req1, res1) => __awaiter(void 0, void 0, void 0, function* () {
    var accessKey = "F8BBA842ECF85";
    var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    var orderInfo = "pay with MoMo";
    var partnerCode = "MOMO";
    var redirectUrl = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
    var ipnUrl = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
    var requestType = "payWithMethod";
    var amount = "50000";
    var orderId = partnerCode + new Date().getTime();
    var requestId = orderId;
    var extraData = "";
    var paymentCode = "T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
    var orderGroupId = "";
    var autoCapture = true;
    var lang = "vi";
    var rawSignature = "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&ipnUrl=" +
        ipnUrl +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        partnerCode +
        "&redirectUrl=" +
        redirectUrl +
        "&requestId=" +
        requestId +
        "&requestType=" +
        requestType;
    console.log("--------------------RAW SIGNATURE----------------");
    console.log(rawSignature);
    const crypto = require("crypto");
    var signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");
    console.log("--------------------SIGNATURE----------------");
    console.log(signature);
    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature,
    });
    const https = require("https");
    const options = {
        hostname: "test-payment.momo.vn",
        port: 443,
        path: "/v2/gateway/api/create",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(requestBody),
        },
    };
    const req = https.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        res.setEncoding("utf8");
        res.on("data", (body) => {
            console.log("Body: ");
            console.log(body);
            console.log("resultCode: ");
            console.log(JSON.parse(body).resultCode);
        });
        res.on("end", () => {
            console.log("No more data in response.");
        });
    });
    req.on("error", (e) => {
        console.log(`problem with request: ${e.message}`);
    });
    console.log("Sending....");
    req.write(requestBody);
    req.end();
});
exports.momoCreate = momoCreate;
