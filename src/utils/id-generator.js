import { randomBytes } from 'crypto';

export function generateId(length = 8) {
  return randomBytes(length).toString('hex');
}
