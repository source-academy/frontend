export class GitHubFileNodeData {
  childrenRetrieved: boolean = false;
  filePath: string = 'dummy_path';
  fileType: string = 'unset';

  constructor(path: string, type: string) {
    this.filePath = path;
    this.fileType = type;
  }
}
