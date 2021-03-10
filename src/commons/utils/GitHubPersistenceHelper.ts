/**
 * Returns an instance to Octokit created using the authentication token
 */
export function generateOctokitInstance(authToken:string) {
	const { Octokit } = require("@octokit/rest");

  const octokit = new Octokit({
    auth: authToken,
    userAgent: 'Source Academy Playground',
    previews: ['jean-grey', 'symmetra'],    
    baseUrl: 'https://api.github.com',
    log: {
        debug: () => {},
        info: () => {},
        warn: console.warn,
        error: console.error
    },
    request: {
        agent: undefined,
        fetch: undefined,
        timeout: 0
    }
  });
	 
	return octokit;
}
