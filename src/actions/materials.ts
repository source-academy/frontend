import { action } from 'typesafe-actions';

import { MaterialData } from '../components/academy/materialsUpload/materialShape';
import * as actionTypes from './actionTypes';

export const createMaterialFolder = (name: string) =>
  action(actionTypes.CREATE_MATERIAL_FOLDER, { name });

export const deleteMaterial = (id: number) => 
  action(actionTypes.DELETE_MATERIAL, { id });

export const fetchMaterialIndex = () =>
  action(actionTypes.FETCH_MATERIAL_INDEX);

export const updateMaterialIndex = (index: MaterialData[]) =>
  action(actionTypes.UPDATE_MATERIAL_INDEX, { index });

export const uploadMaterial = (file: File, title: string, description: string) =>
  action(actionTypes.UPLOAD_MATERIAL, { file, title, description });
