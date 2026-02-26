"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database = __importStar(require("./config/database"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const swagger_config_1 = require("./config/swagger.config");
const compression_1 = __importDefault(require("compression"));
dotenv_1.default.config();
const index_route_1 = require("./api/v1/routes/index.route");
require("./config/redis-queue");
const app = (0, express_1.default)();
const port = process.env.PORT;
const corsOptions = { origin: process.env.CORS_ORIGIN };
app.use((0, compression_1.default)({
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers["upgrade"] === "websocket") {
            return false;
        }
        const contentType = res.getHeader("Content-Type");
        if (!contentType)
            return false;
        const type = contentType.toString().toLowerCase();
        if (type.startsWith("text/") ||
            type.includes("application/json") ||
            type.includes("application/javascript") ||
            type.includes("text/css")) {
            return compression_1.default.filter(req, res);
        }
        return false;
    },
}));
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
});
global._io = io;
database.connect();
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)(corsOptions));
(0, index_route_1.routeApiV1)(app);
(0, swagger_config_1.setupSwagger)(app);
server.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
