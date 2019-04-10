import * as dotenv from 'dotenv';

dotenv.config();

export const IVLE_KEY = process.env.REACT_APP_IVLE_KEY;
export const VERSION = process.env.REACT_APP_VERSION;
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const USE_BACKEND =
  process.env.REACT_APP_USE_BACKEND !== '' &&
  process.env.REACT_APP_USE_BACKEND!.toUpperCase() === 'TRUE';

export enum LINKS {
  GITHUB_ISSUES = 'https://github.com/source-academy/cadet-frontend/issues',
  GITHUB_ORG = 'https://github.com/source-academy',
  IVLE = 'https://ivle.nus.edu.sg/v1/Module/Student/default.aspx?CourseID=a6579f36-4d7d-41fb-b394-92a00b78148b',
  PIAZZA = 'https://piazza.com/nus.edu.sg/fall2018/cs1101s',
  SOURCE_DOCS = 'https://www.comp.nus.edu.sg/~cs1101s/source/',
  TECH_SVC = 'mailto:techsvc@comp.nus.edu.sg',
  TEXTBOOK = 'https://www.comp.nus.edu.sg/~cs1101s/sicp/'
}
