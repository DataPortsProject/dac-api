import { insert } from '../api/cygnus';

// Implementation
// eslint-disable-next-line import/prefer-default-export
export function insertCygnus(entity) {
  return insert(entity);
}
