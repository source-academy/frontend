import setupJVM, { parseBin } from 'java-slang/dist/jvm';
import { createModuleProxy, loadCachedFiles } from 'java-slang/dist/jvm/utils/integration';
import { Context } from 'js-slang';
import loadSourceModules from 'js-slang/dist/modules/loader';

import Constants from './Constants';
import DisplayBufferService from './DisplayBufferService';

export async function javaRun(
  _javaCode: string,
  context: Context,
  options?: { uploadIsActive?: boolean; uploads?: { [key: string]: any } }
) {
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
      request.open('GET', `${Constants.javaPackagesUrl}${pkg}.json`, false);
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
  const loadNatives = async (path: string) => {
    // dynamic load modules
    if (path.startsWith('modules')) {
      const module = path.split('/')[1] as string;
      const moduleFuncs = await loadSourceModules(new Set([module]), context, true);
      const { proxy } = createModuleProxy(module, moduleFuncs[module]);
      return { default: proxy };
    }
    return await import(`java-slang/dist/jvm/stdlib/${path}.js`);
  };
  const stdout = (str: string) => {
    if (str.endsWith('\n')) {
      buffer.push(str);
      const lines = buffer.join('').split('\n');
      lines.pop();
      lines.forEach(line => DisplayBufferService.push(line, context.externalContext));
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

  if (options?.uploadIsActive) {
    compiled = options.uploads ?? {};
  } else {
    stderr('Compiler not integrated');
    return Promise.resolve({ status: 'error' });
  }

  // load cached classfiles from IndexedDB
  return loadCachedFiles(() =>
    // Initial loader to fetch commonly used classfiles
    fetch(Constants.javaPackagesUrl + '_base.json')
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
