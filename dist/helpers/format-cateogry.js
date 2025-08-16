"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCategory = formatCategory;
function formatCategory(category) {
    return {
        id: category._id,
        name: category.name,
        status: category.status || "ACTIVE",
        description: category.description || ""
    };
}
