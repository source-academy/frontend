import { ITreeNode } from '@blueprintjs/core';
import _ from 'lodash';

/**
 * This function applies a function fn to every node in a blueprint core Tree
 *
 * @param nodes All parent nodes of the blueprint core tree
 * @param fn Function to apply to every element in the tree
 */
export function treeMap(nodes: ITreeNode[] | undefined, fn: (node: ITreeNode) => void) {
  nodes &&
    nodes.forEach(node => {
      fn(node);
      treeMap(node.childNodes, fn);
    });
}

/**
 * This function takes a list of filepaths
 * (e.g. ["locations/hallway/normal.png", "locations/hallway/emergency.png"]) and returns
 * blueprint core tree nodes, where each node represents a folder/file.
 *
 * The child of each folder node are the files/folders inside it.
 *
 * @param assetPaths - a list of all filepaths
 * @param iconRenderer - Function that dictates what JSX Element/icon to render beside
 *                       all blueprint core nodes basded on the file path
 * @param rootFolders - a default list of parent folder names that you want to display regardless of
 *                      whether or not they have contents
 * @returns {ITreeNode[]} - a blueprint core tree parent nodes
 */
export function assetPathsToTree(
  assetPaths: string[],
  iconRenderer: (pathName: string) => JSX.Element,
  rootFolders: string[] = []
): ITreeNode[] {
  const assetObj = {};
  assetPaths.forEach(assetPath => _.set(assetObj, assetPath.split('/'), 'FILE'));
  rootFolders.forEach(folder => {
    if (!assetObj[folder] || assetObj[folder] === 'FILE') {
      assetObj[folder] = [];
    }
  });

  function helper(parentFolders: string[], assetObj: object | Array<string>): ITreeNode[] {
    return Object.keys(assetObj).map(file => {
      const shortPath = '/' + parentFolders.join('/') + '/' + file;
      return {
        id: shortPath,
        label: file,
        secondaryLabel: iconRenderer(shortPath),
        childNodes:
          assetObj[file] === 'FILE' ? undefined : helper([...parentFolders, file], assetObj[file])
      };
    });
  }
  return helper([], assetObj);
}
