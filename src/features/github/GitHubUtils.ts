import { URIField } from './GitHubClasses';

export async function exchangeAccessCodeForAuthTokenContainingObject(
  backendLink: string,
  messageBody: string
) {
  return await fetch(backendLink, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: messageBody
  });
}

export function encodeAsURL(messageBodyPrototype: URIField[]) {
  const uriComponents: string[] = [];

  messageBodyPrototype.forEach(element => {
    const field = element.name || '';

    // We need to check for the edge-case where the value is literally false
    const value = element.value === false ? false : element.value || '';

    uriComponents.push([encodeURIComponent(field), encodeURIComponent(value)].join('='));
  });

  return uriComponents.join('&');
}
