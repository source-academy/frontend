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

  // Fixed version of conductor runner that is known to work with the current conductor API.
  const CONDUCTOR_RUNNER_URL =
    'https://cdn.jsdelivr.net/npm/@sourceacademy/conductor@0.3.0/dist/conductor/runner/index.js'; 

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

  class DummyEvaluator {
    constructor(conductor) {
      this.conductor = conductor;
      runnerConductor = conductor;
    }

    async startEvaluator(entryPoint) {
      const fileContent = await this.conductor.requestFile(entryPoint);
      if (!fileContent) {
        throw new Error('Cannot load entrypoint file');
      }

      await this.evaluateFile(entryPoint, fileContent);

      while (true) {
        const chunk = await this.conductor.requestChunk();
        await this.evaluateChunk(chunk);
      }
    }

    async evaluateFile(fileName, fileContent) {
      this.conductor.sendOutput('[dummy] output message');
      this.conductor.sendResult('[dummy] result message');
      this.conductor.sendError({ name: 'DummyEvaluatorError', message: '[dummy] error message' });
    }

    async evaluateChunk(chunk) {
      const text = typeof chunk === 'string' ? chunk.trim() : '';

      if (text.startsWith('output ')) {
        this.conductor.sendOutput(text.slice(7));
        return;
      }

      if (text.startsWith('result ')) {
        this.conductor.sendResult(parseResult(text.slice(7)));
        return;
      }

      if (text.startsWith('error ')) {
        this.conductor.sendError({ name: 'DummyEvaluatorError', message: text.slice(6) });
        return;
      }

      this.conductor.sendOutput('[dummy] try: output ..., result ..., error ...');
    }
  }

  const runner = await import(CONDUCTOR_RUNNER_URL);
  const initialise = runner.initialise;

  if (typeof initialise !== 'function') {
    throw new Error('Failed to load conductor runner initialise()');
  }

  self.addEventListener('unhandledrejection', function (event) {
    if (!runnerConductor) {
      return;
    }

    runnerConductor.sendError(normaliseError(event.reason, 'DummyEvaluatorFatalError'));
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
