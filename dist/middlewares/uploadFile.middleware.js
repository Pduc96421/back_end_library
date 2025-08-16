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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});
const streamUpload = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream(options, (error, result) => {
            if (result) {
                resolve(result);
            }
            else {
                reject(error);
            }
        });
        streamifier_1.default.createReadStream(buffer).pipe(stream);
    });
};
const uploadFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            return res.status(400).json({ code: 400, message: "Không tìm thấy file" });
        }
        const fileExtension = (_a = req.file.originalname.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const publicId = `${Date.now()}_${req.file.originalname.split(".")[0]}`;
        const fileOptions = {
            folder: "library-documents",
            resource_type: "auto",
            type: "upload",
            format: fileExtension,
        };
        const fileResult = yield streamUpload(req.file.buffer, fileOptions);
        req.body.file = fileResult.secure_url;
        if (fileExtension === "pdf") {
            const previewOptions = {
                folder: "library-documents/previews",
                resource_type: "image",
                type: "upload",
                format: "jpg",
                transformation: [{ page: 1 }, { quality: "auto" }, { fetch_format: "auto" }],
            };
            const previewResult = yield streamUpload(req.file.buffer, previewOptions);
            req.body.preview_urls = [previewResult.secure_url];
        }
        else {
            req.body.preview_urls = [];
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi upload Cloudinary", error });
    }
});
exports.uploadFile = uploadFile;
