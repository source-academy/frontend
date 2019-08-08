import { MaterialData } from '../components/academy/materialsUpload/materialShape';
import * as actionTypes from './actionTypes';

export const deleteMaterial = (id: number) => ({
  type: actionTypes.DELETE_MATERIAL,
  payload: {
    id
  }
});

export const fetchMaterialIndex = () => ({
  type: actionTypes.FETCH_MATERIAL_INDEX
});

export const updateMaterialIndex = (index: MaterialData[]) => ({
  type: actionTypes.UPDATE_MATERIAL_INDEX,
  payload: {
    index
  }
});

export const uploadMaterial = (file: File, title: string, description: string) => ({
  type: actionTypes.UPLOAD_MATERIAL,
  payload: { file, title, description }
});
