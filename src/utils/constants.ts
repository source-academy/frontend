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
