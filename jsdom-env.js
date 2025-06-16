import JSDOMEnvironment from 'jest-environment-jsdom';

// https://stackoverflow.com/a/78051351
export default class FixJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);
    this.global.fetch = fetch;
    this.global.Request = Request;
    this.global.Response = Response;
    // And any other missing globals
  }
}
