import { URIField } from './GitHubClasses';

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
