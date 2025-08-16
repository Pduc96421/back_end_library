"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateValidPassword = exports.generateRandomNumber = exports.generateRandomString = void 0;
const generateRandomString = (length) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
exports.generateRandomString = generateRandomString;
const generateRandomNumber = (length) => {
    const characters = "0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
exports.generateRandomNumber = generateRandomNumber;
const generateValidPassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '@$!%*?&';
    const password = [
        uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
        lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        specialChars[Math.floor(Math.random() * specialChars.length)],
    ];
    const allChars = uppercaseChars + lowercaseChars + numbers + specialChars;
    while (password.length < 8) {
        password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }
    return password.sort(() => Math.random() - 0.5).join('');
};
exports.generateValidPassword = generateValidPassword;
