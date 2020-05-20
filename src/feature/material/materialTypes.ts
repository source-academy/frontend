export const CREATE_MATERIAL_FOLDER = 'CREATE_MATERIAL_FOLDER';
export const DELETE_MATERIAL = 'DELETE_MATERIAL';
export const DELETE_MATERIAL_FOLDER = 'DELETE_MATERIAL_FOLDER';
export const FETCH_MATERIAL_INDEX = 'FETCH_MATERIAL_INDEX';
export const UPDATE_MATERIAL_DIRECTORY_TREE = 'UPDATE_MATERIAL_DIRECTORY_TREE';
export const UPDATE_MATERIAL_INDEX = 'UPDATE_MATERIAL_INDEX';
export const UPLOAD_MATERIAL = 'UPLOAD_MATERIAL';

export type MaterialData = {
    title: string;
    description: string;
    inserted_at: string;
    updated_at: string;
    id: number;
    uploader: {
        id: number;
        name: string;
    };
    url: string;
};

export type DirectoryData = {
    id: number;
    title: string;
};
