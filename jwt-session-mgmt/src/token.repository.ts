import * as crypto from 'crypto';

type TokenRecord = {
  refreshTokenHash: string;
  userId: string;
  clientId: string; //device id
  expiresAt: Date;
};

let tokens: TokenRecord[] = [];

const sha256 = (value: string): string => {
  return crypto.createHash('sha256').update(value).digest('hex');
};

export class TokenRepository {
  public async findByRefreshToken(refreshToken: string): Promise<TokenRecord | null> {
    const hash = sha256(refreshToken);
    const record = tokens.find((r) => r.refreshTokenHash === hash);

    if (!record) {
      return null;
    }

    return record;
  }

  public async save({
    refreshToken,
    expiresAtSec,
    userId,
    clientId,
  }: {
    refreshToken: string;
    expiresAtSec: number;
    userId: string;
    clientId: string;
  }): Promise<void> {
    tokens.push({
      refreshTokenHash: sha256(refreshToken),
      expiresAt: new Date(expiresAtSec * 10000),
      userId,
      clientId,
    });
  }

  public async deleteByRefreshToken(refreshToken: string): Promise<void> {
    const hash = sha256(refreshToken);
    const idx = tokens.findIndex((r) => r.refreshTokenHash === hash);

    if (idx === -1) {
      console.error(`trying to delete nonexistent token record using refresh token`);
      return;
    }

    tokens.splice(idx, 1);
  }

  public async deleteAllByUserId(userId: string): Promise<void> {
    tokens = tokens.filter((r) => r.userId !== userId);
  }

  public async deleteByUserIdAndClientId(
    userId: string,
    clientId: string
  ): Promise<void> {
    const idx = tokens.findIndex((r) => r.clientId === clientId);

    if (idx === -1) {
      console.error(`trying to delete nonexistent token record using client id`);
      return;
    }

    if (tokens[idx].userId !== userId) {
      console.error(`clientId-userId mismatch`);
      return;
    }

    tokens.splice(idx, 1);
  }
}
