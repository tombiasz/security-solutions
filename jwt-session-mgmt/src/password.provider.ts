import * as bcrypt from 'bcrypt';

export class PasswordProvider {
  private readonly bcryptSaltRounds = 12;

  public async comparePasswords({
    hash,
    plainPassword,
  }: {
    hash: string;
    plainPassword: string;
  }): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }

  public hashPassword({ password }: { password: string }): Promise<string> {
    return bcrypt.hash(password, this.bcryptSaltRounds);
  }
}
