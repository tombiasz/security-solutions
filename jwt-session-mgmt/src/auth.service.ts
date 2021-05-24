import { UserRepository } from './user.repository';
import { PasswordProvider } from './password.provider';
import { TokenProvider } from './token.provider';
import { TokenRepository } from './token.repository';

type TokenCredentials = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number;
};

export type AuthorizedUser = {
  id: string;
  username: string;
  clientId: string;
};

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly passwordProvider: PasswordProvider;
  private readonly tokenProvider: TokenProvider;
  private readonly tokenRepository: TokenRepository;
  private readonly tokenType = 'Bearer';

  constructor({
    userRepository,
    passwordProvider,
    tokenProvider,
    tokenRepository,
  }: {
    userRepository: UserRepository;
    passwordProvider: PasswordProvider;
    tokenProvider: TokenProvider;
    tokenRepository: TokenRepository;
  }) {
    this.userRepository = userRepository;
    this.passwordProvider = passwordProvider;
    this.tokenProvider = tokenProvider;
    this.tokenRepository = tokenRepository;
  }

  public async authenticateWithUsernameAndPassword({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<AuthorizedUser | null> {
    const user = await this.userRepository.findUserByUsername(username);

    const samePassword = await this.passwordProvider.comparePasswords({
      hash: user?.password || '',
      plainPassword: password,
    });

    if (user && samePassword) {
      return {
        id: user.id,
        username: user.username,
        clientId: await this.tokenProvider.createClientIdToken(),
      };
    }

    return null;
  }

  public async generateTokens({
    user,
  }: {
    user: AuthorizedUser;
  }): Promise<TokenCredentials> {
    const accessToken = await this.tokenProvider.createAccessToken({
      sub: user.id,
      username: user.username,
      client_id: user.clientId,
    });
    const refreshToken = await this.tokenProvider.createRefreshToken();

    await this.tokenRepository.save({
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
  }

  public async authenticateWithAccessToken({
    token,
  }: {
    token: string;
  }): Promise<AuthorizedUser | null> {
    try {
      const payload = await this.tokenProvider.verifyAccessToken(token);

      if (!payload) {
        return null;
      }

      const user = await this.userRepository.findUserById(payload.sub);

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        clientId: payload.client_id,
      };
    } catch (error) {
      console.error(error);

      return null;
    }
  }

  public async authenticateWithRefreshToken({
    token,
  }: {
    token: string;
  }): Promise<AuthorizedUser | null> {
    const tokenRecord = await this.tokenRepository.findByRefreshToken(token);

    if (!tokenRecord) {
      return null;
    }

    await this.tokenRepository.deleteByRefreshToken(token);

    const now = new Date();
    const isExpired = now.getTime() >= tokenRecord.expiresAt.getTime();
    if (isExpired) {
      return null;
    }

    const user = await this.userRepository.findUserById(tokenRecord.userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      clientId: tokenRecord.clientId,
    };
  }

  public extractTokenFromRawHeader({ value }: { value: string }) {
    const [type, token] = value.trim().split(' ');

    if (type !== this.tokenType) {
      return '';
    }

    return token;
  }

  public async login({ user }: { user: AuthorizedUser }): Promise<void> {
    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
    });
  }

  public async logoutOnAllDevices({ user }: { user: AuthorizedUser }): Promise<void> {
    await this.tokenRepository.deleteAllByUserId(user.id);
  }

  public async logoutOnASingleDevice({ user }: { user: AuthorizedUser }): Promise<void> {
    await this.tokenRepository.deleteByUserIdAndClientId(user.id, user.clientId);
  }
}
