import express from 'express';
import { AuthorizedUser } from './auth.service';
import {
  authMiddleware,
  loginHandler,
  logoutAllDevicesHandler,
  logoutCurrentDeviceHandler,
  refreshTokenHandler,
} from './auth.handlers';
const pino = require('pino-http');

const PORT = 8000;

declare global {
  namespace Express {
    interface Request {
      getAuthorizedUser(): AuthorizedUser;
    }
  }
}

export type AsyncRequestHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise<void>;

const asyncWrap =
  (handler: AsyncRequestHandler): express.RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch((err) => next(err));
  };

const _authMiddleware = asyncWrap(authMiddleware);

const app = express();

app.use(express.json());

app.use(pino());

app.use((req, res, next) => {
  req.getAuthorizedUser = () => {
    throw new Error(
      'Default getAuthorizedUser() request method should not be called! Did you forget to use authorization middleware?'
    );
  };

  next();
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);

    return res.status(500).send('internal server error');
  }
);

app.use(
  '/',
  express
    .Router()
    .get('/', (req, res) => res.send('open endpoint (no auth)'))
    .get('/protected', _authMiddleware, (req, res) => {
      return res.json(`Hello, ${req.getAuthorizedUser().username}!`);
    })
);

app.use(
  '/auth',
  express
    .Router()
    .post('/login', asyncWrap(loginHandler))
    .post('/refresh-token', asyncWrap(refreshTokenHandler))
    .post('/logout', _authMiddleware, asyncWrap(logoutCurrentDeviceHandler))
    .post('/logout/devices/all', _authMiddleware, asyncWrap(logoutAllDevicesHandler))
);

app.listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}`);
});
