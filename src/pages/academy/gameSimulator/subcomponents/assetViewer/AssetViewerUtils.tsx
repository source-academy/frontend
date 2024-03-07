import { Icon, Tooltip, TreeNodeInfo } from '@blueprintjs/core';
import { set } from 'lodash';
import { deleteS3File } from 'src/features/gameSimulator/GameSimulatorService';

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
  const assetObj = {};
  assetPaths.forEach(assetPath => set(assetObj, assetPath.split('/'), 'FILE'));
  rootFolders.forEach(folder => {
    if (!assetObj[folder] || assetObj[folder] === 'FILE') {
      assetObj[folder] = [];
    }
  });

  const convertAssetObjectsToTree = (
    parentFolders: string[],
    assetObj: object | Array<string>
  ): TreeNodeInfo[] => {
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
 * Delete button that is tied to each asset.
 *
 * (May be extended to include tools apart from deletion)
 *
 * @param filePath The path to the asset that you want to supply the delete button for.
 * @returns {JSX.Element} A delete button that deletes the file with the given asset path.
 */
export function deleteIcon(filePath: string) {
  const deleteFile = (filePath: string) => async () => {
    const confirm = window.confirm(`Are you sure you want to delete ${filePath}?`);
    const reconfirm = window.confirm(
      `Are you REALLY sure you want to delete ${filePath}?\nThere is NO undoing this action!`
    );
    alert(
      confirm
        ? reconfirm
          ? await deleteS3File(filePath)
          : 'Please double check before deleting an asset!\nThere is NO undoing this action!'
        : 'Please double check before deleting an asset!\nThere is NO undoing this action!'
    );
  };
  return (
    <Tooltip content="Delete">
      <Icon icon="trash" onClick={deleteFile(filePath)} />
    </Tooltip>
  );
}

/**
 * This function applies a function fn to every node in a blueprint core Tree
 *
 * @param nodes All parent nodes of the blueprint core tree
 * @param fn Function to apply to every element in the tree
 */
export function treeMap(nodes: TreeNodeInfo[] | undefined, fn: (node: TreeNodeInfo) => void) {
  nodes &&
    nodes.forEach(node => {
      fn(node);
      treeMap(node.childNodes, fn);
    });
}
