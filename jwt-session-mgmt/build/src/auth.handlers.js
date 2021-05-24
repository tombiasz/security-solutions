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
exports.logoutAllDevicesHandler = exports.logoutCurrentDeviceHandler = exports.refreshTokenHandler = exports.loginHandler = exports.authMiddleware = void 0;
const auth_service_1 = require("./auth.service");
const user_repository_1 = require("./user.repository");
const password_provider_1 = require("./password.provider");
const token_provider_1 = require("./token.provider");
const token_repository_1 = require("./token.repository");
const JWT_SECRET = '1swows6tOxV00w0Yalp4+g4xai9Uv95Vrhwoi2izZ6VDzoL8j04XqhlpbOMnYzO4ZwJqZfA7Nt070zbmrnPuw';
const passwordProvider = new password_provider_1.PasswordProvider();
const tokenProvider = new token_provider_1.TokenProvider({
    secret: JWT_SECRET,
});
const userRepository = new user_repository_1.UserRepository();
const tokenRepository = new token_repository_1.TokenRepository();
const authService = new auth_service_1.AuthService({
    userRepository,
    passwordProvider,
    tokenProvider,
    tokenRepository,
});
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const rawHeader = req.headers['authorization'] || '';
    const token = authService.extractTokenFromRawHeader({ value: rawHeader });
    if (!token) {
        return res.status(401).end();
    }
    const user = yield authService.authenticateWithAccessToken({ token });
    if (!user) {
        return res.status(401).end();
    }
    req.getAuthorizedUser = () => {
        return user;
    };
    next();
});
exports.authMiddleware = authMiddleware;
const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).end();
    }
    const user = yield authService.authenticateWithUsernameAndPassword({
        username,
        password,
    });
    if (!user) {
        return res.status(401).end();
    }
    const token = yield authService.generateTokens({ user });
    authService.login({ user });
    req.getAuthorizedUser = () => {
        return user;
    };
    res.status(200).json(token);
});
exports.loginHandler = loginHandler;
const refreshTokenHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).end();
    }
    const user = yield authService.authenticateWithRefreshToken({
        token: refreshToken,
    });
    if (!user) {
        return res.status(401).end();
    }
    const tokens = yield authService.generateTokens({ user });
    return res.status(200).json(tokens).end();
});
exports.refreshTokenHandler = refreshTokenHandler;
const logoutCurrentDeviceHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.getAuthorizedUser();
    yield authService.logoutOnASingleDevice({ user });
    return res.status(204).end();
});
exports.logoutCurrentDeviceHandler = logoutCurrentDeviceHandler;
const logoutAllDevicesHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.getAuthorizedUser();
    yield authService.logoutOnAllDevices({ user });
    return res.status(204).end();
});
exports.logoutAllDevicesHandler = logoutAllDevicesHandler;
