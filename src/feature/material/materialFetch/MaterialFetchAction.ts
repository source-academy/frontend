import { action } from 'typesafe-actions';
import { FETCH_MATERIAL_INDEX } from '../materialTypes';

export const fetchMaterialIndex = (id = -1) => action(FETCH_MATERIAL_INDEX, { id });
