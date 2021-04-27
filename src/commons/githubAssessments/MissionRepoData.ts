export default class MissionRepoData {
  repoOwner: string = '';
  repoName: string = '';

  constructor(repoOwner: string, repoName: string) {
    this.repoOwner = repoOwner;
    this.repoName = repoName;
  }
}
