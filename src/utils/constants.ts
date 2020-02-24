import * as dotenv from 'dotenv';

dotenv.config();

export const LUMINUS_CLIENT_ID = process.env.REACT_APP_LUMINUS_CLIENT_ID;
export const SOURCE_ACADEMY_VERSION = process.env.REACT_APP_VERSION;
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const USE_BACKEND =
  process.env.REACT_APP_USE_BACKEND !== undefined &&
  process.env.REACT_APP_USE_BACKEND !== '' &&
  process.env.REACT_APP_USE_BACKEND!.toUpperCase() === 'TRUE';
export const USE_CHATKIT =
  process.env.REACT_APP_CHATKIT_INSTANCE_LOCATOR !== undefined &&
  process.env.REACT_APP_CHATKIT_INSTANCE_LOCATOR !== '';
export const INSTANCE_LOCATOR = process.env.REACT_APP_CHATKIT_INSTANCE_LOCATOR;
export const DEFAULT_SOURCE_CHAPTER = 1;

export enum LINKS {
  GITHUB_ISSUES = 'https://github.com/source-academy/cadet-frontend/issues',
  GITHUB_ORG = 'https://github.com/source-academy',

  MODULE_DETAILS = 'https://www.comp.nus.edu.sg/~cs1101s',
  LUMINUS = 'https://luminus.nus.edu.sg/modules/b1340bf4-fc99-4898-be2a-2c20e38c065f/announcements/active',
  PIAZZA = 'https://luminus.nus.edu.sg/modules/b1340bf4-fc99-4898-be2a-2c20e38c065f/forum',
  SHAREDB_SERVER = 'api2.sourceacademy.nus.edu.sg/',
  SOURCE_DOCS = 'https://sicp.comp.nus.edu.sg/source/',
  SOURCE_DOCS_CHAPTER_2_2 = 'https://sicp.comp.nus.edu.sg/chapters/29',
  SOURCE_DOCS_CHAPTER_3_2 = 'https://sicp.comp.nus.edu.sg/chapters/52',
  TECH_SVC = 'mailto:techsvc@comp.nus.edu.sg',
  TEXTBOOK = 'https://sicp.comp.nus.edu.sg/'
}
