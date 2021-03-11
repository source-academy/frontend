import { URIField } from './GitHubClasses';

export function encodeAsURL(messageBodyPrototype: URIField[]) {
  const uriComponents: string[] = [];

  messageBodyPrototype.forEach(element => {
    uriComponents.push(
      [encodeURIComponent(element.name || ''), encodeURIComponent(element.value || '')].join('=')
    );
  });

  return uriComponents.join('&');
}
