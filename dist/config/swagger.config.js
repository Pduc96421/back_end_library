"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "API documentation cho hệ thống thư viện tài liệu số",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8080}`,
                description: "Local server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", example: "user@example.com" },
                        password: { type: "string", example: "password123" },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        fullName: { type: "string" },
                        email: { type: "string" },
                        avatarUrl: { type: "string" },
                        role: { type: "string" },
                        isActive: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                RegisterRequest: {
                    type: "object",
                    required: ["fullName", "email", "password"],
                    properties: {
                        fullName: { type: "string" },
                        email: { type: "string" },
                        password: { type: "string" },
                    },
                },
                Document: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        fileUrl: { type: "string" },
                        thumbnailUrl: { type: "string" },
                        categoryId: { type: "string" },
                        authorId: { type: "string" },
                        tags: { type: "array", items: { type: "string" } },
                        status: { type: "string", enum: ["pending", "approved", "rejected"] },
                        access: { type: "string", enum: ["public", "private"] },
                        likes: { type: "number" },
                        downloads: { type: "number" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Category: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Library: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        userId: { type: "string" },
                        documents: { type: "array", items: { type: "string" } },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Comment: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        documentId: { type: "string" },
                        userId: { type: "string" },
                        content: { type: "string" },
                        likes: { type: "number" },
                        parentId: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Reminder: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        documentId: { type: "string" },
                        userId: { type: "string" },
                        title: { type: "string" },
                        remindAt: { type: "string", format: "date-time" },
                        isActive: { type: "boolean" },
                    },
                },
                Chat: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        roomId: { type: "string" },
                        senderId: { type: "string" },
                        content: { type: "string" },
                        fileUrl: { type: "string" },
                        reactions: { type: "array", items: { type: "object" } },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                RoomChat: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        avatar: { type: "string" },
                        members: { type: "array", items: { type: "string" } },
                        superAdmin: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                SuccessResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        data: { type: "object" },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                    },
                },
            },
        },
        tags: [
            { name: "Auth", description: "Xác thực người dùng" },
            { name: "Users", description: "Quản lý người dùng" },
            { name: "Documents", description: "Quản lý tài liệu" },
            { name: "Categories", description: "Danh mục tài liệu" },
            { name: "Library", description: "Thư viện cá nhân" },
            { name: "Comments", description: "Bình luận tài liệu" },
            { name: "Reminders", description: "Nhắc nhở đọc tài liệu" },
            { name: "Chats", description: "Tin nhắn trong phòng chat" },
            { name: "RoomChat", description: "Quản lý phòng chat" },
            { name: "Friends", description: "Kết bạn người dùng" },
            { name: "Notifications", description: "Thông báo" },
            { name: "Roles", description: "Vai trò người dùng" },
            { name: "Payments", description: "Thanh toán" },
        ],
        paths: {
            "/auth/login": {
                post: {
                    tags: ["Auth"],
                    summary: "Đăng nhập",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/LoginRequest" },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Đăng nhập thành công" },
                        401: { description: "Sai email hoặc mật khẩu" },
                    },
                },
            },
            "/auth/logout": {
                post: {
                    tags: ["Auth"],
                    summary: "Đăng xuất",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Đăng xuất thành công" },
                    },
                },
            },
            "/auth/refresh": {
                post: {
                    tags: ["Auth"],
                    summary: "Làm mới access token",
                    responses: {
                        200: { description: "Token mới" },
                    },
                },
            },
            "/auth/validate-token": {
                post: {
                    tags: ["Auth"],
                    summary: "Kiểm tra token hợp lệ",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Token hợp lệ" },
                    },
                },
            },
            "/auth/google-login": {
                get: {
                    tags: ["Auth"],
                    summary: "Đăng nhập bằng Google (OAuth2)",
                    responses: {
                        302: { description: "Redirect đến Google" },
                    },
                },
            },
            "/auth/google-login-success": {
                get: {
                    tags: ["Auth"],
                    summary: "Callback sau khi đăng nhập Google thành công",
                    responses: {
                        200: { description: "Đăng nhập Google thành công" },
                    },
                },
            },
            "/users": {
                get: {
                    tags: ["Users"],
                    summary: "Lấy danh sách người dùng",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Danh sách người dùng" },
                    },
                },
            },
            "/users/search": {
                get: {
                    tags: ["Users"],
                    summary: "Tìm kiếm người dùng",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: "query",
                            name: "keyword",
                            schema: { type: "string" },
                            description: "Từ khóa tìm kiếm",
                        },
                    ],
                    responses: {
                        200: { description: "Kết quả tìm kiếm" },
                    },
                },
            },
            "/users/my-info": {
                get: {
                    tags: ["Users"],
                    summary: "Lấy thông tin người dùng hiện tại",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Thông tin cá nhân" },
                    },
                },
            },
            "/users/library": {
                get: {
                    tags: ["Users"],
                    summary: "Lấy thư viện của user hiện tại",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Thư viện của user" },
                    },
                },
            },
            "/users/sent-confirm-account": {
                post: {
                    tags: ["Users"],
                    summary: "Gửi email xác nhận tài khoản",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { email: { type: "string" } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Đã gửi email xác nhận" },
                    },
                },
            },
            "/users/confirm-account": {
                post: {
                    tags: ["Users"],
                    summary: "Xác nhận tài khoản qua token email",
                    responses: {
                        200: { description: "Tài khoản đã được xác nhận" },
                    },
                },
            },
            "/users/{userId}/detail": {
                get: {
                    tags: ["Users"],
                    summary: "Lấy thông tin người dùng theo ID",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Thông tin người dùng" },
                        404: { description: "Không tìm thấy người dùng" },
                    },
                },
            },
            "/users/{userId}": {
                put: {
                    tags: ["Users"],
                    summary: "Cập nhật thông tin người dùng",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        fullName: { type: "string" },
                                        avatarUrl: { type: "string", format: "binary" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Cập nhật thành công" },
                    },
                },
                delete: {
                    tags: ["Users"],
                    summary: "Xóa người dùng (Admin)",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Xóa thành công" },
                    },
                },
            },
            "/users/change-password": {
                put: {
                    tags: ["Users"],
                    summary: "Đổi mật khẩu",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        oldPassword: { type: "string" },
                                        newPassword: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Đổi mật khẩu thành công" },
                    },
                },
            },
            "/users/open-account/{userId}": {
                post: {
                    tags: ["Users"],
                    summary: "Mở khóa tài khoản (Admin)",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Tài khoản đã được mở khóa" },
                    },
                },
            },
            "/users/register": {
                post: {
                    tags: ["Users"],
                    summary: "Đăng ký tài khoản mới",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RegisterRequest" },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Đăng ký thành công" },
                        400: { description: "Dữ liệu không hợp lệ" },
                    },
                },
            },
            "/users/forgot-password": {
                post: {
                    tags: ["Users"],
                    summary: "Quên mật khẩu - gửi email",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { email: { type: "string" } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Đã gửi email khôi phục" },
                    },
                },
            },
            "/users/verify-forgot-password": {
                post: {
                    tags: ["Users"],
                    summary: "Xác thực token quên mật khẩu & đặt lại",
                    responses: {
                        200: { description: "Đặt lại mật khẩu thành công" },
                    },
                },
            },
            "/users/create": {
                post: {
                    tags: ["Users"],
                    summary: "Tạo tài khoản người dùng (Admin)",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RegisterRequest" },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Tạo tài khoản thành công" },
                    },
                },
            },
            "/documents/all-document": {
                get: {
                    tags: ["Documents"],
                    summary: "Lấy tất cả tài liệu",
                    responses: {
                        200: { description: "Danh sách tài liệu" },
                    },
                },
            },
            "/documents/top-document": {
                get: {
                    tags: ["Documents"],
                    summary: "Lấy tài liệu nổi bật",
                    responses: {
                        200: { description: "Danh sách tài liệu nổi bật" },
                    },
                },
            },
            "/documents/search": {
                get: {
                    tags: ["Documents"],
                    summary: "Tìm kiếm tài liệu",
                    parameters: [
                        {
                            in: "query",
                            name: "keyword",
                            schema: { type: "string" },
                        },
                        {
                            in: "query",
                            name: "categoryId",
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Kết quả tìm kiếm" },
                    },
                },
            },
            "/documents/pending": {
                get: {
                    tags: ["Documents"],
                    summary: "Lấy tài liệu đang chờ duyệt (Admin)",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Danh sách tài liệu chờ duyệt" },
                    },
                },
            },
            "/documents/user": {
                get: {
                    tags: ["Documents"],
                    summary: "Lấy tài liệu của người dùng hiện tại",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Tài liệu của user" },
                    },
                },
            },
            "/documents/user/share-document": {
                get: {
                    tags: ["Documents"],
                    summary: "Lấy tài liệu được chia sẻ",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Tài liệu được chia sẻ" },
                    },
                },
            },
            "/documents/all-tag": {
                get: {
                    tags: ["Documents"],
                    summary: "Lấy tất cả tags",
                    responses: {
                        200: { description: "Danh sách tags" },
                    },
                },
            },
            "/documents/{documentId}/detail": {
                get: {
                    tags: ["Documents"],
                    summary: "Lấy chi tiết tài liệu",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Chi tiết tài liệu" },
                        404: { description: "Không tìm thấy" },
                    },
                },
            },
            "/documents/{documentId}": {
                patch: {
                    tags: ["Documents"],
                    summary: "Cập nhật tài liệu",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        title: { type: "string" },
                                        description: { type: "string" },
                                        tags: { type: "array", items: { type: "string" } },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Cập nhật thành công" },
                    },
                },
                delete: {
                    tags: ["Documents"],
                    summary: "Xóa tài liệu",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Xóa thành công" },
                    },
                },
            },
            "/documents/{documentId}/approve": {
                put: {
                    tags: ["Documents"],
                    summary: "Duyệt tài liệu (Admin)",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Duyệt thành công" },
                    },
                },
            },
            "/documents/{documentId}/reject": {
                put: {
                    tags: ["Documents"],
                    summary: "Từ chối tài liệu (Admin)",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Từ chối thành công" },
                    },
                },
            },
            "/documents/{documentId}/like": {
                post: {
                    tags: ["Documents"],
                    summary: "Thích tài liệu",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã thích" },
                    },
                },
                delete: {
                    tags: ["Documents"],
                    summary: "Bỏ thích tài liệu",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã bỏ thích" },
                    },
                },
            },
            "/documents/{documentId}/access": {
                post: {
                    tags: ["Documents"],
                    summary: "Thay đổi quyền truy cập tài liệu",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        access: { type: "string", enum: ["public", "private"] },
                                        shareWith: { type: "array", items: { type: "string" } },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Cập nhật quyền truy cập thành công" },
                    },
                },
            },
            "/documents/{documentId}/download": {
                get: {
                    tags: ["Documents"],
                    summary: "Tải xuống tài liệu",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "File tải xuống" },
                    },
                },
            },
            "/documents/{documentId}/rate": {
                post: {
                    tags: ["Documents"],
                    summary: "Đánh giá tài liệu",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        rating: { type: "number", minimum: 1, maximum: 5 },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Đánh giá thành công" },
                    },
                },
            },
            "/documents/upload": {
                post: {
                    tags: ["Documents"],
                    summary: "Upload tài liệu mới",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    required: ["file", "title", "categoryId"],
                                    properties: {
                                        file: { type: "string", format: "binary" },
                                        title: { type: "string" },
                                        description: { type: "string" },
                                        categoryId: { type: "string" },
                                        tags: { type: "array", items: { type: "string" } },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Upload thành công" },
                    },
                },
            },
            "/categories": {
                get: {
                    tags: ["Categories"],
                    summary: "Lấy tất cả danh mục",
                    responses: {
                        200: { description: "Danh sách danh mục" },
                    },
                },
                post: {
                    tags: ["Categories"],
                    summary: "Tạo danh mục mới",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        description: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Tạo thành công" },
                    },
                },
            },
            "/categories/search": {
                get: {
                    tags: ["Categories"],
                    summary: "Tìm kiếm danh mục",
                    parameters: [
                        { in: "query", name: "keyword", schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Kết quả tìm kiếm" },
                    },
                },
            },
            "/categories/{categoryId}/detail": {
                get: {
                    tags: ["Categories"],
                    summary: "Chi tiết danh mục",
                    parameters: [
                        { in: "path", name: "categoryId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Chi tiết danh mục" },
                    },
                },
            },
            "/categories/{categoryId}": {
                put: {
                    tags: ["Categories"],
                    summary: "Cập nhật danh mục",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "categoryId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { name: { type: "string" }, description: { type: "string" } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Cập nhật thành công" },
                    },
                },
                delete: {
                    tags: ["Categories"],
                    summary: "Xóa danh mục",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "categoryId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Xóa thành công" },
                    },
                },
            },
            "/categories/{categoryId}/documents": {
                get: {
                    tags: ["Categories"],
                    summary: "Lấy tài liệu theo danh mục",
                    parameters: [
                        { in: "path", name: "categoryId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Danh sách tài liệu trong danh mục" },
                    },
                },
            },
            "/library": {
                get: {
                    tags: ["Library"],
                    summary: "Lấy tất cả thư viện của user hiện tại",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Danh sách thư viện" },
                    },
                },
                post: {
                    tags: ["Library"],
                    summary: "Tạo thư viện mới",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { name: { type: "string" } },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Tạo thư viện thành công" },
                    },
                },
            },
            "/library/user/{libraryId}": {
                get: {
                    tags: ["Library"],
                    summary: "Lấy một thư viện của user",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "libraryId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Thông tin thư viện" },
                    },
                },
            },
            "/library/all-library/{userId}": {
                get: {
                    tags: ["Library"],
                    summary: "Lấy tất cả thư viện của user theo userId",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Danh sách thư viện" },
                    },
                },
            },
            "/library/{libraryId}": {
                put: {
                    tags: ["Library"],
                    summary: "Cập nhật thư viện",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "libraryId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { name: { type: "string" } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Cập nhật thành công" },
                    },
                },
                delete: {
                    tags: ["Library"],
                    summary: "Xóa thư viện",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "libraryId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Xóa thành công" },
                    },
                },
            },
            "/library/{libraryId}/{documentId}/status": {
                post: {
                    tags: ["Library"],
                    summary: "Thay đổi trạng thái tài liệu trong thư viện",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "libraryId", required: true, schema: { type: "string" } },
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Cập nhật trạng thái thành công" },
                    },
                },
            },
            "/library/user/{libraryId}/{documentId}": {
                post: {
                    tags: ["Library"],
                    summary: "Thêm tài liệu vào thư viện",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "libraryId", required: true, schema: { type: "string" } },
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã thêm tài liệu" },
                    },
                },
                delete: {
                    tags: ["Library"],
                    summary: "Xóa tài liệu khỏi thư viện",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "libraryId", required: true, schema: { type: "string" } },
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã xóa tài liệu" },
                    },
                },
            },
            "/comments/{documentId}": {
                get: {
                    tags: ["Comments"],
                    summary: "Lấy danh sách bình luận của tài liệu",
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Danh sách bình luận" },
                    },
                },
                post: {
                    tags: ["Comments"],
                    summary: "Thêm bình luận",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        content: { type: "string" },
                                        parentId: { type: "string", nullable: true },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Thêm bình luận thành công" },
                    },
                },
            },
            "/comments/{documentId}/{commentId}/replies": {
                get: {
                    tags: ["Comments"],
                    summary: "Lấy danh sách trả lời của bình luận",
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                        { in: "path", name: "commentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Danh sách trả lời" },
                    },
                },
            },
            "/comments/{documentId}/{commentId}/like": {
                post: {
                    tags: ["Comments"],
                    summary: "Thích bình luận",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                        { in: "path", name: "commentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã thích bình luận" },
                    },
                },
                delete: {
                    tags: ["Comments"],
                    summary: "Bỏ thích bình luận",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                        { in: "path", name: "commentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã bỏ thích bình luận" },
                    },
                },
            },
            "/comments/{documentId}/{commentId}": {
                delete: {
                    tags: ["Comments"],
                    summary: "Xóa bình luận",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                        { in: "path", name: "commentId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Xóa bình luận thành công" },
                    },
                },
            },
            "/reminders": {
                get: {
                    tags: ["Reminders"],
                    summary: "Lấy tất cả nhắc nhở của user",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Danh sách nhắc nhở" },
                    },
                },
            },
            "/reminders/{reminderId}": {
                get: {
                    tags: ["Reminders"],
                    summary: "Lấy chi tiết nhắc nhở",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "reminderId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Chi tiết nhắc nhở" },
                    },
                },
                put: {
                    tags: ["Reminders"],
                    summary: "Cập nhật nhắc nhở",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "reminderId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        title: { type: "string" },
                                        remindAt: { type: "string", format: "date-time" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Cập nhật thành công" },
                    },
                },
                delete: {
                    tags: ["Reminders"],
                    summary: "Xóa nhắc nhở",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "reminderId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Xóa thành công" },
                    },
                },
            },
            "/reminders/{documentId}": {
                post: {
                    tags: ["Reminders"],
                    summary: "Tạo nhắc nhở cho tài liệu",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "documentId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        title: { type: "string" },
                                        remindAt: { type: "string", format: "date-time" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Tạo nhắc nhở thành công" },
                    },
                },
            },
            "/reminders/{reminderId}/toggle": {
                put: {
                    tags: ["Reminders"],
                    summary: "Bật/tắt nhắc nhở",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "reminderId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã toggle nhắc nhở" },
                    },
                },
            },
            "/chats/send": {
                post: {
                    tags: ["Chats"],
                    summary: "Gửi tin nhắn văn bản",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        roomId: { type: "string" },
                                        content: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Gửi thành công" },
                    },
                },
            },
            "/chats/send-file": {
                post: {
                    tags: ["Chats"],
                    summary: "Gửi tin nhắn file",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        roomId: { type: "string" },
                                        file_url: { type: "string", format: "binary" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Gửi file thành công" },
                    },
                },
            },
            "/chats/{chatId}/react": {
                patch: {
                    tags: ["Chats"],
                    summary: "React tin nhắn",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "chatId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { emoji: { type: "string" } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "React thành công" },
                    },
                },
            },
            "/chats/{chatId}/reactions": {
                get: {
                    tags: ["Chats"],
                    summary: "Lấy danh sách reaction của tin nhắn",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "chatId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Danh sách reaction" },
                    },
                },
            },
            "/chats/update/{chatId}": {
                patch: {
                    tags: ["Chats"],
                    summary: "Cập nhật tin nhắn",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "chatId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { content: { type: "string" } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Cập nhật thành công" },
                    },
                },
            },
            "/chats/{roomId}": {
                get: {
                    tags: ["Chats"],
                    summary: "Lấy tin nhắn trong phòng",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "roomId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Danh sách tin nhắn" },
                    },
                },
            },
            "/chats/{chatId}": {
                delete: {
                    tags: ["Chats"],
                    summary: "Xóa tin nhắn",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "chatId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Xóa thành công" },
                    },
                },
            },
            "/chats/delete-multiple": {
                delete: {
                    tags: ["Chats"],
                    summary: "Xóa nhiều tin nhắn",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        chatIds: { type: "array", items: { type: "string" } },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Xóa thành công" },
                    },
                },
            },
            "/room-chat/create": {
                post: {
                    tags: ["RoomChat"],
                    summary: "Tạo phòng chat",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        members: { type: "array", items: { type: "string" } },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Tạo phòng thành công" },
                    },
                },
            },
            "/room-chat/add-user/{roomId}": {
                post: {
                    tags: ["RoomChat"],
                    summary: "Thêm thành viên vào phòng",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "roomId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        userId: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Thêm thành viên thành công" },
                    },
                },
            },
            "/room-chat/update/{roomId}": {
                patch: {
                    tags: ["RoomChat"],
                    summary: "Cập nhật thông tin phòng chat",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "roomId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        avatar: { type: "string", format: "binary" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Cập nhật phòng thành công" },
                    },
                },
            },
            "/room-chat/list-room": {
                get: {
                    tags: ["RoomChat"],
                    summary: "Lấy danh sách phòng chat của user",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Danh sách phòng chat" },
                    },
                },
            },
            "/room-chat/info/{roomId}": {
                get: {
                    tags: ["RoomChat"],
                    summary: "Lấy thông tin phòng chat",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "roomId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Thông tin phòng chat" },
                    },
                },
            },
            "/room-chat/{roomId}/users/{userId}": {
                delete: {
                    tags: ["RoomChat"],
                    summary: "Xóa thành viên khỏi phòng",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "roomId", required: true, schema: { type: "string" } },
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã xóa thành viên" },
                    },
                },
            },
            "/room-chat/{roomId}/leave": {
                delete: {
                    tags: ["RoomChat"],
                    summary: "Rời phòng chat",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "roomId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã rời phòng" },
                    },
                },
            },
            "/room-chat/{roomId}/change-super-admin/{userId}": {
                patch: {
                    tags: ["RoomChat"],
                    summary: "Thay đổi super admin phòng",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "roomId", required: true, schema: { type: "string" } },
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã đổi super admin" },
                    },
                },
            },
            "/room-chat/{roomId}/change-role-room": {
                patch: {
                    tags: ["RoomChat"],
                    summary: "Thay đổi role trong phòng chat",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "roomId", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        userId: { type: "string" },
                                        role: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Đã đổi role" },
                    },
                },
            },
            "/user-fr/not-friend": {
                get: {
                    tags: ["Friends"],
                    summary: "Lấy danh sách người chưa kết bạn",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Danh sách người chưa kết bạn" },
                    },
                },
            },
            "/user-fr/request": {
                get: {
                    tags: ["Friends"],
                    summary: "Lấy danh sách lời mời kết bạn đã gửi",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Danh sách lời mời đã gửi" },
                    },
                },
            },
            "/user-fr/accept": {
                get: {
                    tags: ["Friends"],
                    summary: "Lấy danh sách lời mời kết bạn nhận được",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Danh sách lời mời nhận được" },
                    },
                },
            },
            "/user-fr/friends": {
                get: {
                    tags: ["Friends"],
                    summary: "Lấy danh sách bạn bè",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Danh sách bạn bè" },
                    },
                },
            },
            "/user-fr/add-friend/{userId}": {
                post: {
                    tags: ["Friends"],
                    summary: "Gửi lời mời kết bạn",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã gửi lời mời kết bạn" },
                    },
                },
            },
            "/user-fr/cancel-friend/{userId}": {
                post: {
                    tags: ["Friends"],
                    summary: "Hủy lời mời kết bạn",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã hủy lời mời" },
                    },
                },
            },
            "/user-fr/refuse-friend/{userId}": {
                post: {
                    tags: ["Friends"],
                    summary: "Từ chối lời mời kết bạn",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã từ chối lời mời" },
                    },
                },
            },
            "/user-fr/accept-friend/{userId}": {
                post: {
                    tags: ["Friends"],
                    summary: "Chấp nhận lời mời kết bạn",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã chấp nhận lời mời" },
                    },
                },
            },
            "/user-fr/delete-friend/{userId}": {
                delete: {
                    tags: ["Friends"],
                    summary: "Xóa bạn bè",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "userId", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Đã xóa bạn bè" },
                    },
                },
            },
            "/notifications": {
                get: {
                    tags: ["Notifications"],
                    summary: "Lấy danh sách thông báo",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Danh sách thông báo" },
                    },
                },
            },
            "/roles": {
                get: {
                    tags: ["Roles"],
                    summary: "Lấy tất cả roles",
                    responses: {
                        200: { description: "Danh sách roles" },
                    },
                },
                post: {
                    tags: ["Roles"],
                    summary: "Tạo role mới",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { name: { type: "string" } },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Tạo role thành công" },
                    },
                },
            },
            "/roles/{role}": {
                delete: {
                    tags: ["Roles"],
                    summary: "Xóa role",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "role", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Xóa role thành công" },
                    },
                },
            },
            "/payments/create-qr": {
                post: {
                    tags: ["Payments"],
                    summary: "Tạo mã QR thanh toán",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        amount: { type: "number" },
                                        orderId: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Mã QR được tạo thành công" },
                    },
                },
            },
            "/payments/vnpay-return": {
                get: {
                    tags: ["Payments"],
                    summary: "VNPay callback sau thanh toán",
                    parameters: [
                        { in: "query", name: "vnp_ResponseCode", schema: { type: "string" } },
                        { in: "query", name: "vnp_TxnRef", schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Xử lý kết quả thanh toán" },
                    },
                },
            },
        },
    },
    apis: [],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        customSiteTitle: "Library API Docs",
        customCss: `
        .swagger-ui .topbar { background-color: #1e293b; }
        .swagger-ui .topbar-wrapper img { display: none; }
        .swagger-ui .topbar-wrapper::before {
          content: "📚 Library API";
          color: white;
          font-size: 1.4rem;
          font-weight: bold;
        }
      `,
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: "none",
            filter: true,
            tagsSorter: "alpha",
        },
    }));
    console.log(`📄 Swagger docs available at http://localhost:${process.env.PORT || 8080}/api-docs`);
};
exports.setupSwagger = setupSwagger;
