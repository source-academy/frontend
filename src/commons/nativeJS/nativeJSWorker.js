const nativeJSWorker = () => {
  this.self.onmessage = function (payload) {
    const code = payload.data;
    try {
      // eslint-disable-next-line no-eval
      this.self.postMessage({ status: 'finished', message: eval(code) });
    } catch (error) {
      this.self.postMessage({ status: 'error', message: error.message });
    }
  };
};

module.exports = nativeJSWorker;
