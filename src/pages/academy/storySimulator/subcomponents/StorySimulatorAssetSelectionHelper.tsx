import { Icon, ITreeNode, Tooltip } from '@blueprintjs/core';
import _ from 'lodash';
import React from 'react';
import { deleteS3File, s3AssetFolders } from 'src/features/storySimulator/StorySimulatorService';

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
 * This function brings up a confirmation to delete an S3 file given the short filepath
 *
 * @param filePath - the file path e.g. "stories/chapter0.txt"
 */
const deleteFile = (filePath: string) => async () => {
  const confirm = window.confirm(
    `Are you sure you want to delete ${filePath}?\nThere is no undoing this action!`
  );
  alert(confirm ? await deleteS3File(filePath) : 'Whew');
};

/**
 * This function takes a list of filepaths
 * (e.g. ["locations/hallway/normal.png", "locations/hallway/emergency.png"]) and returns a
 * blueprint core tree, where each node represents a folder/file.
 *
 * The child of each folder node are the files/folders inside it.
 *
 * @param assetPaths - a list of all filepaths
 * @returns {ITreeNode[]} - a blueprint core tree parent nodes
 */
export function assetPathsToTree(assetPaths: string[]): ITreeNode[] {
  const assetObj = {};
  assetPaths.forEach(assetPath => _.set(assetObj, assetPath.split('/'), 'FILE'));
  s3AssetFolders.forEach(folder => {
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
        secondaryLabel: (
          <Tooltip content="Delete">
            <Icon icon="trash" onClick={deleteFile(shortPath)} />
          </Tooltip>
        ),
        childNodes:
          assetObj[file] === 'FILE' ? undefined : helper([...parentFolders, file], assetObj[file])
      };
    });
  }
  return helper([], assetObj);
}
