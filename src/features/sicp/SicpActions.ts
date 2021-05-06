import { action } from 'typesafe-actions';

import { SicpChapter, UPDATE_CHAPTER } from "./SicpTypes";

export const updateSicpChapter = (chapter: SicpChapter) => action(UPDATE_CHAPTER, chapter);
