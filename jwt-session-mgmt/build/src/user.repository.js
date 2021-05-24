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
exports.UserRepository = void 0;
const users = [
    {
        id: '122fc27b-967b-4f2a-b989-2869b77a8739',
        username: 'tim',
        password: '$2b$12$pdB1IDE0XLGwCk7/2oIMv.Y3oobKRL6JLXIAKGp3AMcRhc.fdMwE6',
        lastLogin: null,
    },
];
class UserRepository {
    findUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = users.find((u) => u.username === username);
            if (!user) {
                return null;
            }
            return user;
        });
    }
    update(id, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const idx = users.findIndex((u) => u.id === id);
            if (idx === -1) {
                throw new Error(`trying to update nonexistent entity: id ${id}`);
            }
            users[idx] = Object.assign(Object.assign({}, users[idx]), userData);
        });
    }
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = users.find((u) => u.id === id);
            if (!user) {
                return null;
            }
            return user;
        });
    }
}
exports.UserRepository = UserRepository;
