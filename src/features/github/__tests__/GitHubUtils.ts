import { URIField } from '../GitHubClasses';
import { encodeAsURL } from '../GitHubUtils';

test('URL string encoding is correct', () => {
  const testArray = [
    new URIField('yeet', 1234),
    new URIField('skeet', 'sAuCeAcAdeMy'),
    new URIField('mageet', false)
  ];
  const messageBody = encodeAsURL(testArray);

  expect(messageBody).toBe('yeet=1234&skeet=sAuCeAcAdeMy&mageet=false');
});
