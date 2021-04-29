export default class MissionRepoData {
  repoOwner: string = '';
  repoName: string = '';
  dateOfCreation: Date;

  constructor(repoOwner: string, repoName: string, dateOfCreation: string) {
    this.repoOwner = repoOwner;
    this.repoName = repoName;
    this.dateOfCreation = new Date(dateOfCreation);
  }
}
