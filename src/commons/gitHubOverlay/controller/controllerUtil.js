import ExplorerFile from '../model/ExplorerFile';
import ExplorerFileNode from '../model/ExplorerFileNode';

// Returns a string containing the filepath
export function recreateFilePath(fileNode) {
  let directories = [];

  let currentFileNode = fileNode;

  while (currentFileNode !== null) {
    directories.push(currentFileNode.file.name);
    currentFileNode = currentFileNode.parentFileNode;
  }

  directories.reverse();

  return directories.join('/');
}

// Returns an array corresponding to the root of the directory, given the repository contents of the root
export function generateRoot(repositoryJsonObject) {
  let root = [];

  repositoryJsonObject.data.forEach(fileJsonObject => {
    root.push(new ExplorerFileNode(fileJsonObject, null));
  });

  return root;
}

// Mutates the given FileNode, attempting to find its children
// Does nothing if the File associated with the FileNode is
export async function expandDirectory(fileNode, octokitInstance, owner, repo) {
  // If it's not a directory, it cannot be expanded
  if (fileNode.file.type !== 'dir') {
    return;
  }

  // If the directory has been expanded, we do not expand it again
  if (fileNode.directoryExpanded) {
    return;
  }

  // Call the GitHub API to get the children in JSON format
  const filepath = recreateFilePath(fileNode);
  const directoryObjects = await octokitInstance.repos.getContent({
    owner: owner,
    repo: repo,
    path: filepath
  });

  // Generate the children
  let children = [];

  directoryObjects.data.forEach(fileJsonObject => {
    children.push(new ExplorerFileNode(fileJsonObject, fileNode));
  });

  // Modify the current FileNode
  fileNode.directoryExpanded = true;
  fileNode.children = children;
}
