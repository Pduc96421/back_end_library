"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPagination = getPagination;
function getPagination(query) {
    const page = parseInt(query.page) || 1;
    const size = parseInt(query.size) || 10;
    const skip = (page - 1) * size;
    return { page, size, skip };
}
