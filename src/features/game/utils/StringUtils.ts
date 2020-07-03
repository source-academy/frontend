export const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

export function toCapitalizedWords(name: string) {
  const words = name.match(/[A-Za-z][a-z]*/g) || [];

  return words.map(capitalise).join(' ');
}
