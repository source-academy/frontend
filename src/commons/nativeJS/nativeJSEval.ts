import { NativeJSEvalResult } from 'src/features/nativeJS/NativeJSTypes';

import nativeJSWorker from './nativeJSWorker';

type jsWorker = () => void;

function workerToURL(worker: jsWorker): string {
  let workerCode: string = worker.toString();
  // Extract code within outer most "{}"
  workerCode = workerCode.substring(workerCode.indexOf('{') + 1, workerCode.lastIndexOf('}'));
  // Blobify code
  const workerBlob: Blob = new Blob([workerCode], { type: 'application/javascript' });
  // Create URL object
  const workerURL: string = URL.createObjectURL(workerBlob);

  return workerURL;
}

export class NativeJSEvaluator {
  jsWebWorker: Worker;
  running: boolean;

  constructor() {
    this.jsWebWorker = new Worker(workerToURL(nativeJSWorker));
    this.running = false;
  }

  get isRunning() {
    return this.running;
  }

  evalCode(code: string, timeout: number = 3000): Promise<NativeJSEvalResult> {
    return new Promise((resolve, _) => {
      this.jsWebWorker.postMessage(code);
      this.running = true;
      this.jsWebWorker.onmessage = ({ data }) => {
        const evalPayload: NativeJSEvalResult = data as NativeJSEvalResult;
        this.running = false;
        resolve(evalPayload);
      };

      setTimeout(() => {
        if (this.running) {
          this.terminate();
          resolve({ status: 'timeout', message: `Timeout reached (${timeout}ms)` });
        }
      }, timeout);
    });
  }

  terminate(): void {
    this.jsWebWorker.terminate();
    this.running = false;
  }
}
