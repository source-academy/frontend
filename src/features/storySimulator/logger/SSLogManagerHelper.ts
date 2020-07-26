import { AssetPath } from 'src/features/game/commons/CommonTypes';

export function getIdFromShortPath(shortPath: AssetPath) {
  return shortPath.split('/').pop()!.split('.')[0];
}

export const padWithTab = (str: string) => '    ' + str;
