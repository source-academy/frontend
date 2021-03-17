export class URIField {
  name: string;
  value?: string | number | boolean;

  constructor(name: string, value?: string | number | boolean) {
    this.name = name;
    this.value = value;
  }
}
