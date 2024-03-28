import setupJVM, { parseBin } from 'java-slang/dist/jvm';
import { createModuleProxy, loadCachedFiles } from 'java-slang/dist/jvm/utils/integration';
import { Context } from 'js-slang';
import { initModuleContext, loadModuleBundle } from 'js-slang/dist/modules/loader/moduleLoader';

import DisplayBufferService from './DisplayBufferService';

const supportedModules: string[] = ['rune'];

export async function jvmRun(javaCode: string, context: Context) {
  let compiled = {};
  // FIXME: Remove when the compiler is working
  if (javaCode.startsWith('// From JSON')) {
    const json = JSON.parse(javaCode.slice(13));
    compiled = json;
  }

  const lib: {
    [key: string]: {
      methods: { [key: string]: (...args: any[]) => any };
    };
  } = {};

  await Promise.all(
    supportedModules.map(async module => {
      await initModuleContext(module, context, true);
      const moduleFuncs = await loadModuleBundle(module, context);
      const { javaClassname, proxy } = await createModuleProxy(module, moduleFuncs);
      lib[javaClassname] = { methods: proxy };
    })
  );

  return loadCachedFiles(() =>
    import('java-slang/dist/jvm/utils/classfiles').then(module => {
      return module.default as { [key: string]: string };
    })
  )
    .then(stdlib => {
      const files = {
        ...stdlib,
        ...compiled
      };

      let buffer: string[] = [];

      return new Promise((resolve, reject) => {
        const runJVM = setupJVM({
          javaClassPath: '',
          nativesPath: '',
          callbacks: {
            readFileSync: (path: string) => {
              const item = files[path as keyof typeof files];
              if (!item) {
                throw new Error('File not found: ' + path);
              }
              const binaryString = atob(item);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              return parseBin(new DataView(bytes.buffer));
            },
            readFile: (path: string) => {
              return import(`jvm-slang/bin/stdlib/${path}.js`).then(m => {
                return m;
              });
            },
            stdout: (str: string) => {
              // java flush pushes a single newline to buffer
              if (str === '\n') {
                if (buffer.length > 0) {
                  DisplayBufferService.push(buffer.join(''), context.externalContext);
                }
                buffer = [];
                return;
              }

              if (str.endsWith('\n')) {
                buffer.push(str);
                DisplayBufferService.push(buffer.join(''), context.externalContext);
                buffer = [];
              } else {
                buffer.push(str);
              }
            },
            stderr: (msg: string) => {
              context.errors.push({
                type: 'Runtime' as any,
                severity: 'Error' as any,
                location: {
                  start: {
                    line: 0,
                    column: 0
                  },
                  end: {
                    line: 0,
                    column: 0
                  }
                },
                explain: () => msg,
                elaborate: () => msg
              });
            },
            onFinish: () => {
              resolve(
                context.errors.length
                  ? { status: 'error' }
                  : { status: 'finished', context, value: '' }
              );
            }
          },
          natives: lib
        });
        runJVM();
      });
    })
    .catch(() => {
      return { status: 'error' };
    });
}
