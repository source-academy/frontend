import { generateOctokitInstance } from '../GitHubPersistenceHelper';

test('Octokit instance is generated with input auth value', async () => {
  const authToken = '123456789abcdefghijklmnopqrstuvwxyz';
  const generatedOctokitInstance = generateOctokitInstance(authToken);

  // We need to do this because the auth() function returns a unknown Promise
  // Typescript will not allow us to directly call the properties
  generatedOctokitInstance.auth().then(authObject => {
    const stringified = JSON.stringify(authObject);
    const json = JSON.parse(stringified);

    const keys = Object.keys(json);
    const values = Object.values(json);

    expect(keys.length).toEqual(values.length);

    let existsKeyToken = false;
    let existsKeyTokenType = false;

    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === 'token') {
        existsKeyToken = true;
        expect(values[i] === authToken);
      }

      if (keys[i] === 'tokenType') {
        existsKeyTokenType = true;
        expect(values[i] === 'oauth');
      }
    }

    expect(existsKeyToken).toBe(true);
    expect(existsKeyTokenType).toBe(true);
  });
});
