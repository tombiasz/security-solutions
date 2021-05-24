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
exports.AuthService = void 0;
class AuthService {
    constructor({ userRepository, passwordProvider, tokenProvider, tokenRepository, }) {
        this.tokenType = 'Bearer';
        this.userRepository = userRepository;
        this.passwordProvider = passwordProvider;
        this.tokenProvider = tokenProvider;
        this.tokenRepository = tokenRepository;
    }
    authenticateWithUsernameAndPassword({ username, password, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findUserByUsername(username);
            const samePassword = yield this.passwordProvider.comparePasswords({
                hash: (user === null || user === void 0 ? void 0 : user.password) || '',
                plainPassword: password,
            });
            if (user && samePassword) {
                return {
                    id: user.id,
                    username: user.username,
                    clientId: yield this.tokenProvider.createClientIdToken(),
                };
            }
            return null;
        });
    }
    generateTokens({ user, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = yield this.tokenProvider.createAccessToken({
                sub: user.id,
                username: user.username,
                client_id: user.clientId,
            });
            const refreshToken = yield this.tokenProvider.createRefreshToken();
            yield this.tokenRepository.save({
                refreshToken: refreshToken.token,
                userId: user.id,
                clientId: user.clientId,
                expiresAtSec: refreshToken.expiresAtSec,
            });
            return {
                accessToken: accessToken.token,
                refreshToken: refreshToken.token,
                tokenType: this.tokenType,
                expiresAt: accessToken.expiresAtSec,
            };
        });
    }
    authenticateWithAccessToken({ token, }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = yield this.tokenProvider.verifyAccessToken(token);
                if (!payload) {
                    return null;
                }
                const user = yield this.userRepository.findUserById(payload.sub);
                if (!user) {
                    return null;
                }
                return {
                    id: user.id,
                    username: user.username,
                    clientId: payload.client_id,
                };
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    authenticateWithRefreshToken({ token, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenRecord = yield this.tokenRepository.findByRefreshToken(token);
            if (!tokenRecord) {
                return null;
            }
            yield this.tokenRepository.deleteByRefreshToken(token);
            const now = new Date();
            const isExpired = now.getTime() >= tokenRecord.expiresAt.getTime();
            if (isExpired) {
                return null;
            }
            const user = yield this.userRepository.findUserById(tokenRecord.userId);
            if (!user) {
                return null;
            }
            return {
                id: user.id,
                username: user.username,
                clientId: tokenRecord.clientId,
            };
        });
    }
    extractTokenFromRawHeader({ value }) {
        const [type, token] = value.trim().split(' ');
        if (type !== this.tokenType) {
            return '';
        }
        return token;
    }
    login({ user }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRepository.update(user.id, {
                lastLogin: new Date(),
            });
        });
    }
    logoutOnAllDevices({ user }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.tokenRepository.deleteAllByUserId(user.id);
        });
    }
    logoutOnASingleDevice({ user }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.tokenRepository.deleteByUserIdAndClientId(user.id, user.clientId);
        });
    }
}
exports.AuthService = AuthService;
