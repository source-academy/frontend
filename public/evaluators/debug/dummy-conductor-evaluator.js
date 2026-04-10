/* Dummy evaluator written in class style using this.conductor.send* calls. */
(function () {
  'use strict';

  const CHANNEL = {
    CHUNK: '__chunk',
    SERVICE: '__service',
    STDIO: '__stdio',
    RESULT: '__result',
    ERROR: '__error'
  };

  const SERVICE = {
    HELLO: 0,
    ENTRY: 2
  };

  const ports = Object.create(null);
  const chunkQueue = [];
  const chunkWaiters = [];

  function post(channelName, payload) {
    const port = ports[channelName];
    if (port) {
      port.postMessage(payload);
    }
  }

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

  function pushChunk(message) {
    const waiter = chunkWaiters.shift();
    if (waiter) {
      waiter(message);
      return;
    }
    chunkQueue.push(message);
  }

  function popChunk() {
    if (chunkQueue.length > 0) {
      return Promise.resolve(chunkQueue.shift());
    }
    return new Promise(resolve => {
      chunkWaiters.push(resolve);
    });
  }

  class BasicEvaluator {
    constructor(conductor) {
      this.conductor = conductor;
    }

    async startEvaluator(entryPoint) {
      await this.evaluateFile(entryPoint, '');
      while (true) {
        const chunk = await this.conductor.requestChunk();
        await this.evaluateChunk(chunk);
      }
    }

    async evaluateFile(fileName, fileContent) {
      return this.evaluateChunk(fileContent);
    }
  }

  class DummyEvaluator extends BasicEvaluator {
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

  const conductor = {
    async requestChunk() {
      const message = await popChunk();
      return typeof message?.chunk === 'string' ? message.chunk : '';
    },
    sendOutput(message) {
      post(CHANNEL.STDIO, { message: String(message) });
    },
    sendResult(value) {
      post(CHANNEL.RESULT, { result: value });
    },
    sendError(error) {
      post(CHANNEL.ERROR, { error });
    }
  };

  const evaluator = new DummyEvaluator(conductor);

  function onService(message) {
    if (!message || typeof message.type !== 'number') {
      return;
    }

    if (message.type === SERVICE.HELLO) {
      post(CHANNEL.SERVICE, { type: SERVICE.HELLO, data: { version: 0 } });
      return;
    }

    if (message.type === SERVICE.ENTRY) {
      evaluator.startEvaluator(message.data).catch(function (err) {
        conductor.sendError({
          name: 'DummyEvaluatorFatalError',
          message: err && err.message ? err.message : String(err)
        });
      });
    }
  }

  self.addEventListener('message', function (event) {
    const data = event.data;
    if (!Array.isArray(data) || data.length !== 2) {
      return;
    }

    const channelName = data[0];
    const port = data[1];
    if (typeof channelName !== 'string' || !port) {
      return;
    }

    ports[channelName] = port;

    if (channelName === CHANNEL.SERVICE) {
      port.addEventListener('message', function (e) {
        onService(e.data);
      });
      port.start();
      return;
    }

    if (channelName === CHANNEL.CHUNK) {
      port.addEventListener('message', function (e) {
        pushChunk(e.data);
      });
      port.start();
      return;
    }

    if (typeof port.start === 'function') {
      port.start();
    }
  });
})();
