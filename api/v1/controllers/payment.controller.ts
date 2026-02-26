import { Request, Response } from "express";
import {
  ignoreLogger,
  VNPay,
  HashAlgorithm,
  ProductCode,
  VnpLocale,
  dateFormat,
} from "vnpay";

// post payments/create-qr
export const createQr = async (req: Request, res: Response) => {
  const vnpay = new VNPay({
    tmnCode: "JA7KBF8X",
    secureSecret: "KQPD7DWO8YTTXCIAT8FV1LG4BN21DQ66",
    vnpayHost: "https://sandbox.vnpayment.vn",
    testMode: true,
    hashAlgorithm: HashAlgorithm.SHA512,
    loggerFn: ignoreLogger,
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: 10000,
    vnp_IpAddr: "localhost",
    vnp_TxnRef: "123456",
    vnp_OrderInfo: "Thanh toan don hang 123456",
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: "http://localhost:8080/payments/vnpay-return",
    vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
    vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là thời gian hiện tại
    vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
  });

  return res.status(200).json({
    code: 200,
    message: "Tạo thanh toán thành công",
    result: paymentUrl,
  });
};

// Get payments/vnpay-return
export const vnpayReturn = async (req: Request, res: Response) => {
  console.log(req.query);
};

export const momoCreate = async (req1: Request, res1: Response) => {
  //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
  //parameters
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
  var paymentCode =
    "T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
  var orderGroupId = "";
  var autoCapture = true;
  var lang = "vi";

  //before sign HMAC SHA256 with format
  //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
  var rawSignature =
    "accessKey=" +
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
  //puts raw signature
  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);
  //signature
  const crypto = require("crypto");
  var signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
  console.log("--------------------SIGNATURE----------------");
  console.log(signature);

  //json object send to MoMo endpoint
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
  //Create the HTTPS objects
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
  //Send the request and get the response
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
  // write data to request body
  console.log("Sending....");
  req.write(requestBody);
  req.end();
};
