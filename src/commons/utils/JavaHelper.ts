import setupJVM, { parseBin } from 'java-slang/dist/jvm';
import { createModuleProxy, loadCachedFiles } from 'java-slang/dist/jvm/utils/integration';
import { Context } from 'js-slang';
import { initModuleContext, loadModuleBundle } from 'js-slang/dist/modules/loader/moduleLoader';

import DisplayBufferService from './DisplayBufferService';

const CDN = 'https://source-academy.github.io/modules/java/java-packages/src/';

export async function javaRun(javaCode: string, context: Context) {
  let compiled = {};

  let files = {};
  let buffer: string[] = [];

  const readClassFiles = (path: string) => {
    let item = files[path as keyof typeof files];

    // not found: attempt to fetch from CDN
    if (!item && path) {
      const splits = path.split('/');
      splits.pop(); // classname.class
      const pkg = splits.join('_');

      const request = new XMLHttpRequest();
      request.open('GET', `${CDN}${pkg}.json`, false);
      request.send(null);
      if (request.status !== 200) {
        throw new Error('File not found: ' + path);
      }
      const json = JSON.parse(request.responseText);
      // we might want to cache the files in IndexedDB here
      files = { ...files, ...json };

      if (!files[path as keyof typeof files]) {
        throw new Error('File not found: ' + path);
      }

      item = files[path as keyof typeof files];
    }

    // convert base64 to classfile object
    const binaryString = atob(item);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return parseBin(new DataView(bytes.buffer));
  };
  const loadNatives = (path: string) => {
    // dynamic load modules
    if (path.startsWith('modules')) {
      const module = path.split('/')[1] as string;
      initModuleContext(module, context, true);
      const moduleFuncs = loadModuleBundle(module, context);
      const { proxy } = createModuleProxy(module, moduleFuncs);
      return Promise.resolve({ default: proxy });
    }

    return import(`java-slang/dist/jvm/stdlib/${path}.js`).then(m => {
      return m;
    });
  };
  const stdout = (str: string) => {
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
  };
  const stderr = (msg: string) => {
    context.errors.push({
      type: 'Runtime' as any,
      severity: 'Error' as any,
      location: {
        start: {
          line: -1,
          column: -1
        },
        end: {
          line: -1,
          column: -1
        }
      },
      explain: () => msg,
      elaborate: () => msg
    });
  };

  // FIXME: Remove when the compiler is working
  const json = JSON.parse(javaCode);
  compiled = json;

  // load cached classfiles from IndexedDB
  return loadCachedFiles(() =>
    // Initial loader to fetch commonly used classfiles
    fetch(CDN + '_base.json')
      .then(res => res.json())
      .then((obj: { [key: string]: string }) => {
        return obj;
      })
  )
    .then(stdlib => {
      files = {
        ...stdlib,
        ...compiled
      };

      // run the JVM
      return new Promise((resolve, reject) => {
        setupJVM({
          javaClassPath: '',
          nativesPath: '',
          callbacks: {
            readFileSync: readClassFiles,
            readFile: loadNatives,
            stdout,
            stderr,
            onFinish: () => {
              resolve(
                context.errors.length
                  ? { status: 'error' }
                  : { status: 'finished', context, value: '' }
              );
            }
          },
          natives: {}
        })();
      });
    })
    .catch(() => {
      return { status: 'error' };
    });
}
