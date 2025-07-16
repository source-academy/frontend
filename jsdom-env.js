import { TestEnvironment as JSDOMEnvironment } from 'jest-environment-jsdom';

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

// https://github.com/prisma/prisma/discussions/14504#discussioncomment-3406588
// https://jest-archive-august-2023.netlify.app/docs/28.x/upgrading-to-jest28#custom-environment
export const TestEnvironment = FixJSDOMEnvironment;
