class ExplorerFile {
  name = '';
  type = '';

  constructor(jsonObject) {
    this.name = jsonObject.name;
    this.type = jsonObject.type;
  }
}

export default ExplorerFile;
