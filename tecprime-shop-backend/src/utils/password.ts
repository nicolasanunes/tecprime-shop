import { compare } from 'bcrypt';

export const validatePassword = (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return compare(password, hashedPassword);
};
