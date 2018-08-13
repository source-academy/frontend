import * as dotenv from 'dotenv'

dotenv.config()

/* Remove this variable entirely when implemented. DO NOT just set to true;
 * also check that the CSS looks acceptable, since there will be className
 * changes. */
export const IS_XP_IMPLEMENTED = false

export const IVLE_KEY = process.env.REACT_APP_IVLE_KEY
export const VERSION = process.env.REACT_APP_VERSION
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
export const USE_BACKEND = process.env.REACT_APP_USE_BACKEND

export enum LINKS {
  GITHUB_ISSUES = 'https://github.com/source-academy/cadet-frontend/issues',
  GITHUB_ORG = 'https://github.com/source-academy',
  LUMINUS = 'https://luminus.nus.edu.sg/modules/8722e9a5-abc5-4160-820d-bf69d8a63c6f',
  PIAZZA = 'https://piazza.com/nus.edu.sg/fall2018/cs1101s',
  SOURCE_DOCS = 'https://www.comp.nus.edu.sg/~cs1101s/source/',
  TECH_SVC = 'mailto:techsvc@comp.nus.edu.sg',
  TEXTBOOK = 'https://www.comp.nus.edu.sg/~cs1101s/sicp/'
}
