import express from 'express';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { PasswordProvider } from './password.provider';
import { TokenProvider } from './token.provider';
import { TokenRepository } from './token.repository';
import { AsyncRequestHandler } from './server';

const JWT_SECRET =
  '1swows6tOxV00w0Yalp4+g4xai9Uv95Vrhwoi2izZ6VDzoL8j04XqhlpbOMnYzO4ZwJqZfA7Nt070zbmrnPuw';

const passwordProvider = new PasswordProvider();
const tokenProvider = new TokenProvider({
  secret: JWT_SECRET,
});
const userRepository = new UserRepository();
const tokenRepository = new TokenRepository();
const authService = new AuthService({
  userRepository,
  passwordProvider,
  tokenProvider,
  tokenRepository,
});

export const authMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  const rawHeader = req.headers['authorization'] || '';
  const token = authService.extractTokenFromRawHeader({ value: rawHeader });

  if (!token) {
    return res.status(401).end();
  }

  const user = await authService.authenticateWithAccessToken({ token });

  if (!user) {
    return res.status(401).end();
  }

  req.getAuthorizedUser = () => {
    return user;
  };

  next();
};

export const loginHandler: AsyncRequestHandler = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).end();
  }

  const user = await authService.authenticateWithUsernameAndPassword({
    username,
    password,
  });

  if (!user) {
    return res.status(401).end();
  }

  const token = await authService.generateTokens({ user });

  authService.login({ user });

  req.getAuthorizedUser = () => {
    return user;
  };

  res.status(200).json(token);
};

export const refreshTokenHandler: AsyncRequestHandler = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).end();
  }

  const user = await authService.authenticateWithRefreshToken({
    token: refreshToken,
  });

  if (!user) {
    return res.status(401).end();
  }

  const tokens = await authService.generateTokens({ user });

  return res.status(200).json(tokens).end();
};

export const logoutCurrentDeviceHandler: AsyncRequestHandler = async (req, res) => {
  const user = req.getAuthorizedUser();

  await authService.logoutOnASingleDevice({ user });

  return res.status(204).end();
};

export const logoutAllDevicesHandler: AsyncRequestHandler = async (req, res) => {
  const user = req.getAuthorizedUser();

  await authService.logoutOnAllDevices({ user });

  return res.status(204).end();
};
