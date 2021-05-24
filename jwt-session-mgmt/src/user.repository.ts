type UserRecord = {
  id: string;
  username: string;
  password: string;
  lastLogin: Date | null;
};

const users: UserRecord[] = [
  {
    id: '122fc27b-967b-4f2a-b989-2869b77a8739',
    username: 'mat',
    password: '$2b$12$pdB1IDE0XLGwCk7/2oIMv.Y3oobKRL6JLXIAKGp3AMcRhc.fdMwE6', // foobar
    lastLogin: null,
  },
  {
    id: '6c71ea87-0f9d-4810-885c-6b90e560479f',
    username: 'pat',
    password: '$2b$12$pdB1IDE0XLGwCk7/2oIMv.Y3oobKRL6JLXIAKGp3AMcRhc.fdMwE6', // foobar
    lastLogin: null,
  },
];

export class UserRepository {
  public async findUserByUsername(username: string): Promise<UserRecord | null> {
    const user = users.find((u) => u.username === username);

    if (!user) {
      return null;
    }

    return user;
  }

  public async update(
    id: string,
    userData: Omit<Partial<UserRecord>, 'id'>
  ): Promise<void> {
    const idx = users.findIndex((u) => u.id === id);

    if (idx === -1) {
      throw new Error(`trying to update nonexistent entity: id ${id}`);
    }

    users[idx] = { ...users[idx], ...userData };
  }

  public async findUserById(id: string): Promise<UserRecord | null> {
    const user = users.find((u) => u.id === id);

    if (!user) {
      return null;
    }

    return user;
  }
}
