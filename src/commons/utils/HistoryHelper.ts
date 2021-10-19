/** history is created and exported here instead of in src/index.tsx as jest
 * would otherwise throw an error. See: https://stackoverflow.com/a/42611909/6910451
 */
import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();
