"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_handlers_1 = require("./auth.handlers");
const PORT = 8000;
const asyncWrap = (handler) => (req, res, next) => {
    handler(req, res, next).catch((err) => next(err));
};
const _authMiddleware = asyncWrap(auth_handlers_1.authMiddleware);
const app = express_1.default();
app.use(express_1.default.json());
app.use((req, res, next) => {
    req.getAuthorizedUser = () => {
        throw new Error('Default getAuthorizedUser() request method should not be called! Did you forget to use authorization middleware?');
    };
    next();
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).send('internal server error');
});
app.use('/', express_1.default
    .Router()
    .get('/', (req, res) => res.send('open endpoint (no auth)'))
    .get('/protected', _authMiddleware, (req, res) => {
    return res.json(`Hello, ${req.getAuthorizedUser().username}!`);
}));
app.use('/auth', express_1.default
    .Router()
    .post('/login', asyncWrap(auth_handlers_1.loginHandler))
    .post('/refresh-token', asyncWrap(auth_handlers_1.refreshTokenHandler))
    .post('/logout', _authMiddleware, asyncWrap(auth_handlers_1.logoutCurrentDeviceHandler))
    .post('/logout/devices/all', _authMiddleware, asyncWrap(auth_handlers_1.logoutAllDevicesHandler)));
app.listen(PORT, () => {
    console.log(`Server is running at https://localhost:${PORT}`);
});
