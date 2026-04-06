import { generateOctokitInstance } from '../GitHubPersistenceHelper';

test('Octokit instance is generated with input auth value', async () => {
  const authToken = '123456789abcdefghijklmnopqrstuvwxyz';
  const generatedOctokitInstance = generateOctokitInstance(authToken);

  const authObject = (await generatedOctokitInstance.auth()) as any;
  expect(authObject.token).toBe(authToken);
  expect(authObject.tokenType).toBe('oauth');
});
