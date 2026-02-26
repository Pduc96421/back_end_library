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
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeApiV1 = void 0;
const document_route_1 = require("./document.route");
const reminder_route_1 = require("./reminder.route");
const library_route_1 = require("./library.route");
const comment_route_1 = require("./comment.route");
const category_route_1 = require("./category.route");
const role_route_1 = require("./role.route");
const auth_route_1 = require("./auth.route");
const user_route_1 = require("./user.route");
const notification_route_1 = require("./notification.route");
const chat_route_1 = require("./chat.route");
const room_chat_route_1 = require("./room-chat.route");
const users_route_1 = require("./users.route");
const authMiddleware = __importStar(require("../../../middlewares/auth.middleware"));
const payment_route_1 = require("./payment.route");
const routeApiV1 = (app) => {
    app.use(authMiddleware.infoUser);
    app.use("/documents", document_route_1.documentRoute);
    app.use("/reminders", reminder_route_1.reminderRoute);
    app.use("/library", library_route_1.libraryRoute);
    app.use("/comments", comment_route_1.commentRoute);
    app.use("/categories", category_route_1.categoryRoute);
    app.use("/roles", role_route_1.roleRoute);
    app.use("/auth", auth_route_1.authRoute);
    app.use("/users", user_route_1.userRoute);
    app.use("/notifications", notification_route_1.notificationRoute);
    app.use("/payments", payment_route_1.paymentRoute);
    app.use("/chats", authMiddleware.verifyToken, chat_route_1.chatRoute);
    app.use("/room-chat", authMiddleware.verifyToken, room_chat_route_1.roomChatRoute);
    app.use("/user-fr", authMiddleware.verifyToken, users_route_1.usersRoute);
};
exports.routeApiV1 = routeApiV1;
