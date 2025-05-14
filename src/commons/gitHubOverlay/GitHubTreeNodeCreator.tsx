import { TreeNodeInfo } from '@blueprintjs/core';
import type { Octokit } from '@octokit/rest';
import { GetResponseTypeFromEndpointMethod } from '@octokit/types';

import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';
import { GitHubFileNodeData } from './GitHubFileNodeData';

/**
 * A utility class for the GitHub overlay file explorer that handles the creation of TreeNodeInfos
 */
export class GitHubTreeNodeCreator {
  static fileIndex: number = 0;
  static currentRepoName: string = '';

  /**
   * Generates an array of TreeNodeInfos corresponding to the first level of a given repository.
   *
   * When loading a new repository, this function should always be called first as node creation is stateful.
   *
   * @param repoName The name of the repository where the file exists
   */
  public static async getFirstLayerRepoFileNodes(repoName: string) {
    if (repoName === '') {
      return [];
    }

    // Only allow mutations if the repoName is correct
    GitHubTreeNodeCreator.fileIndex = 0;
    GitHubTreeNodeCreator.currentRepoName = repoName;

    return await GitHubTreeNodeCreator.getChildNodes(repoName, '');
  }

  /**
   * Generates an array of TreeNodeInfo corresponding to the children of a given folder
   *
   * @param repoName The name of the repository where the folder exists
   * @param filePath The filePath of the folder
   */
  public static async getChildNodes(repoName: string, filePath: string) {
    const childNodes: TreeNodeInfo<GitHubFileNodeData>[] = [];

    // Ensures that we will only generate children if the repoNames match
    if (repoName !== GitHubTreeNodeCreator.currentRepoName) {
      return childNodes;
    }

    const octokit: Octokit = getGitHubOctokitInstance();

    if (octokit === undefined) {
      return childNodes;
    }

    try {
      type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
        typeof octokit.users.getAuthenticated
      >;
      const authUser: GetAuthenticatedResponse = await octokit.users.getAuthenticated();
      const githubLoginID = authUser.data.login;

      type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
      const results: GetContentResponse = await octokit.repos.getContent({
        owner: githubLoginID,
        repo: repoName,
        path: filePath
      });

      const childFiles = results.data;

      if (Array.isArray(childFiles)) {
        childFiles.forEach(childFile => {
          childNodes.push(this.createNode(childFile));
        });
      }
    } catch (err) {
      console.error(err);
    }

    return childNodes;
  }

  /**
   * Generates a single TreeNodeInfo corresponding to a single file or folder.
   *
   * @param octokitFileData File data as described by Octokit's REST API
   */
  private static createNode(octokitFileData: any) {
    const index = GitHubTreeNodeCreator.fileIndex;

    let node: TreeNodeInfo<GitHubFileNodeData> = {
      id: index,
      label: 'dummy file'
    };

    if (octokitFileData.type === 'file') {
      node = {
        id: index,
        nodeData: new GitHubFileNodeData(octokitFileData.path, 'file'),
        icon: 'document',
        label: octokitFileData.name
      };
    }

    if (octokitFileData.type === 'dir') {
      node = {
        id: index,
        nodeData: new GitHubFileNodeData(octokitFileData.path, 'dir'),
        icon: 'folder-close',
        label: octokitFileData.name,
        childNodes: [] // Child nodes are initially empty
      };
    }

    GitHubTreeNodeCreator.fileIndex++;

    return node;
  }
}
