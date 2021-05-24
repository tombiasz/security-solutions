import * as jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

type AccessTokenPayload = {
  username: string;
  client_id: string;
  sub: string;
};

export type DecodedAccessTokenPayload = AccessTokenPayload & {
  iat: number;
  exp: number;
};

type AccessToken = {
  token: string;
  expiresAtSec: number;
};

type RefreshToken = {
  token: string;
  expiresAtSec: number;
};

export class TokenProvider {
  private readonly algorithm = 'HS512';
  private readonly accessTokenExpiresInSec = 5 * 60;
  private readonly refreshTokenExpiresInSec = 1 * 24 * 60 * 60;
  private readonly refreshTokenCharSize = 32;
  private readonly clientIdTokenCharSize = 8;
  private readonly secret;

  constructor({ secret }: { secret: string }) {
    if (secret.length === 0) {
      throw TypeError('secret cannot be empty');
    }

    this.secret = secret;
  }

  public async createAccessToken(payload: AccessTokenPayload): Promise<AccessToken> {
    const exp = Math.floor(new Date().getTime() / 1000) + this.accessTokenExpiresInSec;
    const token = jwt.sign(
      {
        ...payload,
        exp,
      },
      this.secret,
      {
        algorithm: this.algorithm,
      }
    );

    return {
      token,
      expiresAtSec: exp,
    };
  }

  public async createRefreshToken(): Promise<RefreshToken> {
    const exp = Math.floor(new Date().getTime() / 1000) + this.refreshTokenExpiresInSec;

    return {
      token: nanoid(this.refreshTokenCharSize),
      expiresAtSec: exp,
    };
  }

  public async createClientIdToken(): Promise<string> {
    return nanoid(this.clientIdTokenCharSize);
  }

  public async verifyAccessToken(token: string): Promise<DecodedAccessTokenPayload> {
    return <any>jwt.verify(token, this.secret, {
      ignoreExpiration: false,
      algorithms: [this.algorithm],
    });
  }
}
