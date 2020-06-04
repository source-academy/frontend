/** history is created and exported here instead of in src/index.tsx as jest
 * would otherwise throw an error. See: https://stackoverflow.com/a/42611909/6910451
 */
import { createBrowserHistory } from 'history';

/**
 * HistoryHelper is a slice of the session property of the application redux
 * store. It keeps track of the last visited location in general, and the last
 * visited location under /academy. This allows us to implement different routes
 * for the 'SOURCE ACADEMY' button depending on the current location of the
 * user.
 */
export type HistoryHelper = {
  lastAcademyLocations: lastLocation[];
  lastGeneralLocations: lastLocation[];
};

type lastLocation = string | null;

export const history = createBrowserHistory();
