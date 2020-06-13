import { LocationId } from '../location/GameMapTypes';

export function showLocationError(id: LocationId) {
  throw new Error(`Location ${id} was not found`);
}
