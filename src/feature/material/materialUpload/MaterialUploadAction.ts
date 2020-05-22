import { action } from 'typesafe-actions';
import { 
  CREATE_MATERIAL_FOLDER, 
  DELETE_MATERIAL, DELETE_MATERIAL_FOLDER, 
  FETCH_MATERIAL_INDEX, 
  UPDATE_MATERIAL_DIRECTORY_TREE, UPDATE_MATERIAL_INDEX,
  UPLOAD_MATERIAL } from '../materialTypes';
import { DirectoryData, MaterialData } from '../materialTypes';

export const createMaterialFolder = (title: string) => action(CREATE_MATERIAL_FOLDER, { title });

export const deleteMaterial = (id: number) => action(DELETE_MATERIAL, { id });

export const deleteMaterialFolder = (id: number) => action(DELETE_MATERIAL_FOLDER, { id });

export const fetchMaterialIndex = (id = -1) => action(FETCH_MATERIAL_INDEX, { id });

export const updateMaterialDirectoryTree = (directoryTree: DirectoryData[]) =>
  action(UPDATE_MATERIAL_DIRECTORY_TREE, { directoryTree });

export const updateMaterialIndex = (index: MaterialData[]) => action(UPDATE_MATERIAL_INDEX, { index });

export const uploadMaterial = (file: File, title: string, description: string) =>
  action(UPLOAD_MATERIAL, { file, title, description });
