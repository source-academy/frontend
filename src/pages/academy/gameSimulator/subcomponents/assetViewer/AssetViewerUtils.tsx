import { TreeNodeInfo } from '@blueprintjs/core';
import { set } from 'lodash';

type Tree = Record<any, any> | string[] | any;

/**
 * This function takes a list of filepaths and returns blueprint core tree nodes.
 * Each node represents a file / folder.
 *
 * Example of list of filepaths: ["locations/hallway/normal.png", "locations/hallway/emergency.png"]
 *
 * The child of each folder node are the files / folders inside it.
 *
 * @param assetPaths - A list of all filepaths.
 * @param iconRenderer - Function that dictates what JSX Element/icon to render beside
 *                       all blueprint core nodes basded on the file path.
 * @param rootFolders - A default list of parent folder names that you want to display regardless of
 *                      whether or not they have contents.
 * @returns {TreeNodeInfo[]} - a blueprint core tree parent nodes
 */
export function convertAssetPathsToTree(
  assetPaths: string[],
  iconRenderer: (pathName: string) => JSX.Element,
  rootFolders: string[] = []
): TreeNodeInfo[] {
  const assetObj: Tree = {};
  assetPaths.forEach(assetPath => set(assetObj, assetPath.split('/'), 'FILE'));
  rootFolders.forEach(folder => {
    if (!assetObj[folder] || assetObj[folder] === 'FILE') {
      assetObj[folder] = [];
    }
  });

  const convertAssetObjectsToTree = (parentFolders: string[], assetObj: Tree): TreeNodeInfo[] => {
    return Object.keys(assetObj).map(file => {
      const shortPath = '/' + parentFolders.join('/') + '/' + file;
      return {
        id: shortPath,
        label: file,
        secondaryLabel: iconRenderer(shortPath),
        childNodes:
          assetObj[file] === 'FILE'
            ? undefined
            : convertAssetObjectsToTree([...parentFolders, file], assetObj[file])
      };
    });
  };
  return convertAssetObjectsToTree([], assetObj);
}

/**
 * This function applies a function fn to every node in a blueprint core Tree
 *
 * @param nodes All parent nodes of the blueprint core tree
 * @param fn Function to apply to every element in the tree
 */
export function treeMap(nodes: TreeNodeInfo[] | undefined, fn: (node: TreeNodeInfo) => void) {
  nodes?.forEach(node => {
    fn(node);
    treeMap(node.childNodes, fn);
  });
}
