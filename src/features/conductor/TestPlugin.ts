import { TestPlugin as TestPluginAbstractClass } from '@sourceacademy/web-test';
export class TestPlugin extends TestPluginAbstractClass {
    constructor(...args: ConstructorParameters<typeof TestPluginAbstractClass>) {
        console.log('TestPlugin constructor called with args:', args);
        super(...args);
    }
}
