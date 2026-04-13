/* Dummy evaluator using conductor runner API */
(async function () {
  'use strict';

  // The worker can receive channel-attach messages before async imports resolve.
  // Buffer and replay them once the conductor runner has been initialised.
  const earlyMessages = [];
  function captureEarlyMessage(event) {
    earlyMessages.push(event);
  }
  self.addEventListener('message', captureEarlyMessage);

  const CONDUCTOR_RUNNER_URL =
    'https://cdn.jsdelivr.net/npm/@sourceacademy/conductor@latest/dist/conductor/runner/index.js';
  const CONDUCTOR_TYPES_URL =
    'https://cdn.jsdelivr.net/npm/@sourceacademy/conductor@latest/dist/conductor/types/index.js';

  function parseResult(text) {
    const value = text.trim();
    if (value.length === 0) {
      return '';
    }

    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  function normaliseError(err, fallbackName) {
    if (err && typeof err === 'object') {
      return {
        name: typeof err.name === 'string' ? err.name : fallbackName,
        message: typeof err.message === 'string' ? err.message : String(err)
      };
    }

    return { name: fallbackName, message: String(err) };
  }

  let runnerConductor;
  let activeEvaluator;

  function failActiveExecution(error) {
    if (!runnerConductor) {
      return;
    }

    runnerConductor.sendError(normaliseError(error, 'DummyEvaluatorFatalError'));
    activeEvaluator?.failExecution();
  }

  class DummyEvaluator {
    constructor(conductor) {
      this.conductor = conductor;
      runnerConductor = conductor;
      activeEvaluator = this;
      this.conductor.updateStatus(RunnerStatus.EVAL_READY, true);
    }

    beginExecution() {
      this.conductor.updateStatus(RunnerStatus.EVAL_READY, false);
      this.conductor.updateStatus(RunnerStatus.WAITING, false);
      this.conductor.updateStatus(RunnerStatus.RUNNING, true);
    }

    finishExecution() {
      this.conductor.updateStatus(RunnerStatus.RUNNING, false);
      this.conductor.updateStatus(RunnerStatus.WAITING, true);
    }

    stopExecution() {
      this.conductor.updateStatus(RunnerStatus.RUNNING, false);
      this.conductor.updateStatus(RunnerStatus.WAITING, false);
      this.conductor.updateStatus(RunnerStatus.STOPPED, true);
    }

    failExecution() {
      this.conductor.updateStatus(RunnerStatus.RUNNING, false);
      this.conductor.updateStatus(RunnerStatus.WAITING, false);
      this.conductor.updateStatus(RunnerStatus.ERROR, true);
    }

    sendDisplayResult(result) {
      this.conductor.sendResult(result);
    }

    sendDisplayError(error) {
      this.conductor.sendError(error);
    }

    async startEvaluator(entryPoint) {
      const fileContent = await this.conductor.requestFile(entryPoint);
      if (!fileContent) {
        throw new Error('Cannot load entrypoint file');
      }

      this.beginExecution();
      const shouldContinue = await this.evaluateFile(entryPoint, fileContent);
      if (shouldContinue === false) {
        return;
      }
      this.finishExecution();

      while (true) {
        this.conductor.updateStatus(RunnerStatus.WAITING, true);
        const chunk = await this.conductor.requestChunk();
        this.beginExecution();
        const shouldContinue = await this.evaluateChunk(chunk);
        if (shouldContinue === false) {
          return;
        }
        this.finishExecution();
      }
    }

    async evaluateFile(fileName, fileContent) {
      this.conductor.sendOutput('[dummy] output message');
      this.conductor.sendOutput(`[dummy] loaded file 1`);
      this.conductor.sendOutput(`[dummy] loaded file 2`);
      this.sendDisplayError({ name: 'DummyEvaluatorError', message: '[dummy] error message' });
      this.conductor.sendOutput(`[dummy] loaded file 3`);
      this.sendDisplayResult('[dummy] result message');

      return true;
    }

    async evaluateChunk(chunk) {
      const text = typeof chunk === 'string' ? chunk.trim() : '';

      if (text.startsWith('output ')) {
        this.conductor.sendOutput(text.slice(7));
        return;
      }

      if (text.startsWith('result ')) {
        this.sendDisplayResult(parseResult(text.slice(7)));
        return true;
      }

      if (text.startsWith('error ')) {
        this.sendDisplayError({ name: 'DummyEvaluatorError', message: text.slice(6) });
        return true;
      }

      if (text === 'stop') {
        this.stopExecution();
        return false;
      }

      if (text.startsWith('fatal ')) {
        this.sendDisplayError({ name: 'DummyEvaluatorError', message: text.slice(6) });
        this.failExecution();
        return false;
      }

      this.conductor.sendOutput('[dummy] try: output ..., result ..., error ..., stop, fatal ...');
      return true;
    }
  }

  const runner = await import(CONDUCTOR_RUNNER_URL);
  const { RunnerStatus } = await import(CONDUCTOR_TYPES_URL);
  const initialise = runner.initialise;

  if (typeof initialise !== 'function') {
    throw new Error('Failed to load conductor runner initialise()');
  }

  self.addEventListener('unhandledrejection', function (event) {
    event.preventDefault();
    failActiveExecution(event.reason);
  });

  initialise(DummyEvaluator);

  self.removeEventListener('message', captureEarlyMessage);
  for (const event of earlyMessages) {
    self.dispatchEvent(
      new MessageEvent('message', {
        data: event.data
      })
    );
  }
})().catch(function (err) {
  console.error('Failed to bootstrap dummy conductor evaluator:', err);
});
