import { action } from 'typesafe-actions';

import { DirectoryData, MaterialData } from '../components/material/materialShape';
import * as actionTypes from './actionTypes';

export const createMaterialFolder = (title: string) =>
  action(actionTypes.CREATE_MATERIAL_FOLDER, { title });

export const deleteMaterial = (id: number) => action(actionTypes.DELETE_MATERIAL, { id });

export const deleteMaterialFolder = (id: number) =>
  action(actionTypes.DELETE_MATERIAL_FOLDER, { id });

export const fetchMaterialIndex = (id = -1) => action(actionTypes.FETCH_MATERIAL_INDEX, { id });

export const updateMaterialDirectoryTree = (directoryTree: DirectoryData[]) =>
  action(actionTypes.UPDATE_MATERIAL_DIRECTORY_TREE, { directoryTree });

export const updateMaterialIndex = (index: MaterialData[]) =>
  action(actionTypes.UPDATE_MATERIAL_INDEX, { index });

export const uploadMaterial = (file: File, title: string, description: string) =>
  action(actionTypes.UPLOAD_MATERIAL, { file, title, description });

export const fetchTestStories = () => action(actionTypes.FETCH_TEST_STORIES);
