const gameAccessKey = 'sa-dev-access';
const gameAccessValue = 'sa-dev-access';

export function hasDevAccess() {
  return sessionStorage.getItem(gameAccessKey) === gameAccessValue;
}
