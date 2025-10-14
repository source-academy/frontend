(function () {
    'use strict';

    /**
     * Generic Conductor Error.
     */
    class ConductorError extends Error {
        constructor(message) {
            super(message);
            this.name = "ConductorError";
            this.errorType = "__unknown" /* ErrorType.UNKNOWN */;
        }
    }

    /**
     * Conductor internal error, probably caused by developer oversight.
     */
    class ConductorInternalError extends ConductorError {
        constructor(message) {
            super(message);
            this.name = "ConductorInternalError";
            this.errorType = "__internal" /* ErrorType.INTERNAL */;
        }
    }

    class BasicEvaluator {
        async startEvaluator(entryPoint) {
            const initialChunk = await this.conductor.requestFile(entryPoint);
            if (!initialChunk)
                throw new ConductorInternalError("Cannot load entrypoint file");
            await this.evaluateFile(entryPoint, initialChunk);
            while (true) {
                const chunk = await this.conductor.requestChunk();
                await this.evaluateChunk(chunk);
            }
        }
        /**
         * Evaluates a file.
         * @param fileName The name of the file to be evaluated.
         * @param fileContent The content of the file to be evaluated.
         * @returns A promise that resolves when the evaluation is complete.
         */
        async evaluateFile(fileName, fileContent) {
            return this.evaluateChunk(fileContent);
        }
        constructor(conductor) {
            this.conductor = conductor;
        }
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
        var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
        var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
        var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
        var _, done = false;
        for (var i = decorators.length - 1; i >= 0; i--) {
            var context = {};
            for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
            for (var p in contextIn.access) context.access[p] = contextIn.access[p];
            context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
            var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
            if (kind === "accessor") {
                if (result === void 0) continue;
                if (result === null || typeof result !== "object") throw new TypeError("Object expected");
                if (_ = accept(result.get)) descriptor.get = _;
                if (_ = accept(result.set)) descriptor.set = _;
                if (_ = accept(result.init)) initializers.unshift(_);
            }
            else if (_ = accept(result)) {
                if (kind === "field") initializers.unshift(_);
                else descriptor[key] = _;
            }
        }
        if (target) Object.defineProperty(target, contextIn.name, descriptor);
        done = true;
    }
    function __runInitializers(thisArg, initializers, value) {
        var useValue = arguments.length > 2;
        for (var i = 0; i < initializers.length; i++) {
            value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
        }
        return useValue ? value : void 0;
    }
    function __setFunctionName(f, name, prefix) {
        if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
        return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
    }
    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    /**
     * Imports an external plugin from a given location.
     * @param location Where to find the external plugin.
     * @returns A promise resolving to the imported plugin.
     */
    async function importExternalPlugin(location) {
        const plugin = (await import(/* webpackIgnore: true */ location)).plugin;
        // TODO: verify it is actually a plugin
        return plugin;
    }

    /**
     * Imports an external module from a given location.
     * @param location Where to find the external module.
     * @returns A promise resolving to the imported module.
     */
    async function importExternalModule(location) {
        const plugin = await importExternalPlugin(location);
        // TODO: additional verification it is a module
        return plugin;
    }

    class Channel {
        send(message, transfer) {
            this.__verifyAlive();
            this.__port.postMessage(message, transfer ?? []);
        }
        subscribe(subscriber) {
            this.__verifyAlive();
            this.__subscribers.add(subscriber);
            if (this.__waitingMessages) {
                for (const data of this.__waitingMessages) {
                    subscriber(data);
                }
                delete this.__waitingMessages;
            }
        }
        unsubscribe(subscriber) {
            this.__verifyAlive();
            this.__subscribers.delete(subscriber);
        }
        close() {
            this.__verifyAlive();
            this.__isAlive = false;
            this.__port?.close();
        }
        /**
         * Check if this Channel is allowed to be used.
         * @throws Throws an error if the Channel has been closed.
         */
        __verifyAlive() {
            if (!this.__isAlive)
                throw new ConductorInternalError(`Channel ${this.name} has been closed`);
        }
        /**
         * Dispatch some data to subscribers.
         * @param data The data to be dispatched to subscribers.
         */
        __dispatch(data) {
            this.__verifyAlive();
            if (this.__waitingMessages) {
                // set a limit on how many setup messages to hold
                // this prevents unlimited memory leak if the channel will never be listened to
                if (this.__waitingMessages.length >= 10 /* Constant.SETUP_MESSAGES_BUFFER_SIZE */) {
                    // not an error, since non-listening of channel is allowed by design
                    return console.warn("Channel buffer full; message dropped (no subscribers on channel)", data);
                }
                this.__waitingMessages.push(data);
            }
            else {
                for (const subscriber of this.__subscribers) {
                    subscriber(data);
                }
            }
        }
        /**
         * Listens to the port's message event, and starts the port.
         * Messages will be buffered until the first subscriber listens to the Channel.
         * @param port The MessagePort to listen to.
         */
        listenToPort(port) {
            port.addEventListener("message", e => this.__dispatch(e.data));
            port.start();
        }
        /**
         * Replaces the underlying MessagePort of this Channel and closes it, and starts the new port.
         * @param port The new port to use.
         */
        replacePort(port) {
            this.__verifyAlive();
            this.__port?.close();
            this.__port = port;
            this.listenToPort(port);
        }
        constructor(name, port) {
            /** The callbacks subscribed to this Channel. */
            this.__subscribers = new Set();
            /** Is the Channel in a valid state? */
            this.__isAlive = true;
            /** Messages held temporarily while waiting for a listener. */
            this.__waitingMessages = [];
            this.name = name;
            this.replacePort(port);
        }
    }

    /**
     * A stack-based queue implementation.
     * `push` and `pop` run in amortized constant time.
     */
    class Queue {
        constructor() {
            /** The output stack. */
            this.__s1 = [];
            /** The input stack. */
            this.__s2 = [];
        }
        /**
         * Adds an item to the queue.
         * @param item The item to be added to the queue.
         */
        push(item) {
            this.__s2.push(item);
        }
        /**
         * Removes an item from the queue.
         * @returns The item removed from the queue.
         * @throws If the queue is empty.
         */
        pop() {
            if (this.__s1.length === 0) {
                if (this.__s2.length === 0)
                    throw new Error("queue is empty");
                let temp = this.__s1;
                this.__s1 = this.__s2.reverse();
                this.__s2 = temp;
            }
            return this.__s1.pop(); // as the length is nonzero
        }
        /**
         * The length of the queue.
         */
        get length() {
            return this.__s1.length + this.__s2.length;
        }
        /**
         * Makes a copy of the queue.
         * @returns A copy of the queue.
         */
        clone() {
            const newQueue = new Queue();
            newQueue.__s1 = [...this.__s1];
            newQueue.__s2 = [...this.__s2];
            return newQueue;
        }
    }

    class MessageQueue {
        push(item) {
            if (this.__promiseQueue.length !== 0)
                this.__promiseQueue.pop()(item);
            else
                this.__inputQueue.push(item);
        }
        async pop() {
            if (this.__inputQueue.length !== 0)
                return this.__inputQueue.pop();
            return new Promise((resolve, _reject) => {
                this.__promiseQueue.push(resolve);
            });
        }
        tryPop() {
            if (this.__inputQueue.length !== 0)
                return this.__inputQueue.pop();
            return undefined;
        }
        constructor() {
            this.__inputQueue = new Queue();
            this.__promiseQueue = new Queue();
            this.push = this.push.bind(this);
        }
    }

    class ChannelQueue {
        async receive() {
            return this.__messageQueue.pop();
        }
        tryReceive() {
            return this.__messageQueue.tryPop();
        }
        send(message, transfer) {
            this.__channel.send(message, transfer);
        }
        close() {
            this.__channel.unsubscribe(this.__messageQueue.push);
        }
        constructor(channel) {
            this.__messageQueue = new MessageQueue();
            this.name = channel.name;
            this.__channel = channel;
            this.__channel.subscribe(this.__messageQueue.push);
        }
    }

    class Conduit {
        __negotiateChannel(channelName) {
            const { port1, port2 } = new MessageChannel();
            const channel = new Channel(channelName, port1);
            this.__link.postMessage([channelName, port2], [port2]); // TODO: update communication protocol?
            this.__channels.set(channelName, channel);
        }
        __verifyAlive() {
            if (!this.__alive)
                throw new ConductorInternalError("Conduit already terminated");
        }
        registerPlugin(pluginClass, ...arg) {
            this.__verifyAlive();
            const attachedChannels = [];
            for (const channelName of pluginClass.channelAttach) {
                if (!this.__channels.has(channelName))
                    this.__negotiateChannel(channelName);
                attachedChannels.push(this.__channels.get(channelName)); // as the Channel has been negotiated
            }
            const plugin = new pluginClass(this, attachedChannels, ...arg);
            if (plugin.name !== undefined) {
                if (this.__pluginMap.has(plugin.name))
                    throw new ConductorInternalError(`Plugin ${plugin.name} already registered`);
                this.__pluginMap.set(plugin.name, plugin);
            }
            this.__plugins.push(plugin);
            return plugin;
        }
        unregisterPlugin(plugin) {
            this.__verifyAlive();
            let p = 0;
            for (let i = 0; i < this.__plugins.length; ++i) {
                if (this.__plugins[p] === plugin)
                    ++p;
                this.__plugins[i] = this.__plugins[i + p];
            }
            for (let i = this.__plugins.length - 1, e = this.__plugins.length - p; i >= e; --i) {
                delete this.__plugins[i];
            }
            if (plugin.name) {
                this.__pluginMap.delete(plugin.name);
            }
            plugin.destroy?.();
        }
        lookupPlugin(pluginName) {
            this.__verifyAlive();
            if (!this.__pluginMap.has(pluginName))
                throw new ConductorInternalError(`Plugin ${pluginName} not registered`);
            return this.__pluginMap.get(pluginName); // as the map has been checked
        }
        terminate() {
            this.__verifyAlive();
            for (const plugin of this.__plugins) {
                //this.unregisterPlugin(plugin);
                plugin.destroy?.();
            }
            this.__link.terminate?.();
            this.__alive = false;
        }
        __handlePort(data) {
            const [channelName, port] = data;
            if (this.__channels.has(channelName)) { // uh-oh, we already have a port for this channel
                const channel = this.__channels.get(channelName); // as the map has been checked
                if (this.__parent) { // extract the data and discard the messageport; child's Channel will close it
                    channel.listenToPort(port);
                }
                else { // replace our messageport; Channel will close it
                    channel.replacePort(port);
                }
            }
            else { // register the new channel
                const channel = new Channel(channelName, port);
                this.__channels.set(channelName, channel);
            }
        }
        constructor(link, parent = false) {
            this.__alive = true;
            this.__channels = new Map();
            this.__pluginMap = new Map();
            this.__plugins = [];
            this.__link = link;
            link.addEventListener("message", e => this.__handlePort(e.data));
            this.__parent = parent;
        }
    }

    class RpcCallMessage {
        constructor(fn, args, invokeId) {
            this.type = 0 /* RpcMessageType.CALL */;
            this.data = { fn, args, invokeId };
        }
    }

    class RpcErrorMessage {
        constructor(invokeId, err) {
            this.type = 2 /* RpcMessageType.RETURN_ERR */;
            this.data = { invokeId, err };
        }
    }

    class RpcReturnMessage {
        constructor(invokeId, res) {
            this.type = 1 /* RpcMessageType.RETURN */;
            this.data = { invokeId, res };
        }
    }

    function makeRpc(channel, self) {
        const waiting = [];
        let invocations = 0;
        const otherCallbacks = {};
        channel.subscribe(async (rpcMessage) => {
            switch (rpcMessage.type) {
                case 0 /* RpcMessageType.CALL */:
                    {
                        const { fn, args, invokeId } = rpcMessage.data;
                        try {
                            // @ts-expect-error
                            const res = await self[fn](...args);
                            if (invokeId > 0)
                                channel.send(new RpcReturnMessage(invokeId, res));
                        }
                        catch (err) {
                            if (invokeId > 0)
                                channel.send(new RpcErrorMessage(invokeId, err));
                        }
                        break;
                    }
                case 1 /* RpcMessageType.RETURN */:
                    {
                        const { invokeId, res } = rpcMessage.data;
                        waiting[invokeId]?.[0]?.(res);
                        delete waiting[invokeId];
                        break;
                    }
                case 2 /* RpcMessageType.RETURN_ERR */:
                    {
                        const { invokeId, err } = rpcMessage.data;
                        waiting[invokeId]?.[1]?.(err);
                        delete waiting[invokeId];
                        break;
                    }
            }
        });
        return new Proxy(otherCallbacks, {
            get(target, p, receiver) {
                const cb = Reflect.get(target, p, receiver);
                if (cb)
                    return cb;
                const newCallback = typeof p === "string" && p.charAt(0) === "$"
                    ? (...args) => {
                        channel.send(new RpcCallMessage(p, args, 0));
                    }
                    : (...args) => {
                        const invokeId = ++invocations;
                        channel.send(new RpcCallMessage(p, args, invokeId));
                        return new Promise((resolve, reject) => {
                            waiting[invokeId] = [resolve, reject];
                        });
                    };
                Reflect.set(target, p, newCallback, receiver);
                return newCallback;
            },
        });
    }

    /**
     * Typechecking utility decorator.
     * It is recommended that usage of this decorator is removed
     * before or during the build process, as some tools
     * (e.g. terser) do not have good support for class decorators.
     * @param _pluginClass The Class to be typechecked.
     */
    function checkIsPluginClass(_pluginClass) {
    }

    var DataType;
    (function (DataType) {
        /** The return type of functions with no returned value. As a convention, the associated JS value is undefined. */
        DataType[DataType["VOID"] = 0] = "VOID";
        /** A Boolean value. */
        DataType[DataType["BOOLEAN"] = 1] = "BOOLEAN";
        /** A numerical value. */
        DataType[DataType["NUMBER"] = 2] = "NUMBER";
        /** An immutable string of characters. */
        DataType[DataType["CONST_STRING"] = 3] = "CONST_STRING";
        /** The empty list. As a convention, the associated JS value is null. */
        DataType[DataType["EMPTY_LIST"] = 4] = "EMPTY_LIST";
        /** A pair of values. Reference type. */
        DataType[DataType["PAIR"] = 5] = "PAIR";
        /** An array of values of a single type. Reference type. */
        DataType[DataType["ARRAY"] = 6] = "ARRAY";
        /** A value that can be called with fixed arity. Reference type. */
        DataType[DataType["CLOSURE"] = 7] = "CLOSURE";
        /** An opaque value that cannot be manipulated from user code. */
        DataType[DataType["OPAQUE"] = 8] = "OPAQUE";
        /** A list (either a pair or the empty list). */
        DataType[DataType["LIST"] = 9] = "LIST";
    })(DataType || (DataType = {}));

    class AbortServiceMessage {
        constructor(minVersion) {
            this.type = 1 /* ServiceMessageType.ABORT */;
            this.data = { minVersion: minVersion };
        }
    }

    class HelloServiceMessage {
        constructor() {
            this.type = 0 /* ServiceMessageType.HELLO */;
            this.data = { version: 0 /* Constant.PROTOCOL_VERSION */ };
        }
    }

    class PluginServiceMessage {
        constructor(pluginName) {
            this.type = 3 /* ServiceMessageType.PLUGIN */;
            this.data = pluginName;
        }
    }

    let RunnerPlugin = (() => {
        let _classDecorators = [checkIsPluginClass];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        _classThis = class {
            requestFile(fileName) {
                return this.__fileRpc.requestFile(fileName);
            }
            async requestChunk() {
                return (await this.__chunkQueue.receive()).chunk;
            }
            async requestInput() {
                const { message } = await this.__ioQueue.receive();
                return message;
            }
            tryRequestInput() {
                const out = this.__ioQueue.tryReceive();
                return out?.message;
            }
            sendOutput(message) {
                this.__ioQueue.send({ message });
            }
            sendError(error) {
                this.__errorChannel.send({ error });
            }
            updateStatus(status, isActive) {
                this.__statusChannel.send({ status, isActive });
            }
            hostLoadPlugin(pluginName) {
                this.__serviceChannel.send(new PluginServiceMessage(pluginName));
            }
            registerPlugin(pluginClass, ...arg) {
                return this.__conduit.registerPlugin(pluginClass, ...arg);
            }
            unregisterPlugin(plugin) {
                this.__conduit.unregisterPlugin(plugin);
            }
            registerModule(moduleClass) {
                if (!this.__isCompatibleWithModules)
                    throw new ConductorInternalError("Evaluator has no data interface");
                return this.registerPlugin(moduleClass, this.__evaluator);
            }
            unregisterModule(module) {
                this.unregisterPlugin(module);
            }
            async importAndRegisterExternalPlugin(location, ...arg) {
                const pluginClass = await importExternalPlugin(location);
                return this.registerPlugin(pluginClass, ...arg);
            }
            async importAndRegisterExternalModule(location) {
                const moduleClass = await importExternalModule(location);
                return this.registerModule(moduleClass);
            }
            constructor(conduit, [fileChannel, chunkChannel, serviceChannel, ioChannel, errorChannel, statusChannel], evaluatorClass) {
                this.name = "__runner_main" /* InternalPluginName.RUNNER_MAIN */;
                // @ts-expect-error TODO: figure proper way to typecheck this
                this.__serviceHandlers = new Map([
                    [0 /* ServiceMessageType.HELLO */, function helloServiceHandler(message) {
                            if (message.data.version < 0 /* Constant.PROTOCOL_MIN_VERSION */) {
                                this.__serviceChannel.send(new AbortServiceMessage(0 /* Constant.PROTOCOL_MIN_VERSION */));
                                console.error(`Host's protocol version (${message.data.version}) must be at least ${0 /* Constant.PROTOCOL_MIN_VERSION */}`);
                            }
                            else {
                                console.log(`Host is using protocol version ${message.data.version}`);
                            }
                        }],
                    [1 /* ServiceMessageType.ABORT */, function abortServiceHandler(message) {
                            console.error(`Host expects at least protocol version ${message.data.minVersion}, but we are on version ${0 /* Constant.PROTOCOL_VERSION */}`);
                            this.__conduit.terminate();
                        }],
                    [2 /* ServiceMessageType.ENTRY */, function entryServiceHandler(message) {
                            this.__evaluator.startEvaluator(message.data);
                        }]
                ]);
                this.__conduit = conduit;
                this.__fileRpc = makeRpc(fileChannel, {});
                this.__chunkQueue = new ChannelQueue(chunkChannel);
                this.__serviceChannel = serviceChannel;
                this.__ioQueue = new ChannelQueue(ioChannel);
                this.__errorChannel = errorChannel;
                this.__statusChannel = statusChannel;
                this.__serviceChannel.send(new HelloServiceMessage());
                this.__serviceChannel.subscribe(message => {
                    this.__serviceHandlers.get(message.type)?.call(this, message);
                });
                this.__evaluator = new evaluatorClass(this);
                this.__isCompatibleWithModules = this.__evaluator.hasDataInterface ?? false;
            }
        };
        __setFunctionName(_classThis, "RunnerPlugin");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })();
        _classThis.channelAttach = ["__file_rpc" /* InternalChannelName.FILE */, "__chunk" /* InternalChannelName.CHUNK */, "__service" /* InternalChannelName.SERVICE */, "__stdio" /* InternalChannelName.STANDARD_IO */, "__error" /* InternalChannelName.ERROR */, "__status" /* InternalChannelName.STATUS */];
        (() => {
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return _classThis;
    })();

    /**
     * Initialise this runner with the evaluator to be used.
     * @param evaluatorClass The Evaluator to be used on this runner.
     * @param link The underlying communication link.
     * @returns The initialised `runnerPlugin` and `conduit`.
     */
    function initialise(evaluatorClass, link = self) {
        const conduit = new Conduit(link, false);
        const runnerPlugin = conduit.registerPlugin(RunnerPlugin, evaluatorClass);
        return { runnerPlugin, conduit };
    }

    /**
     * Configuration for Pyodide package management
     *
     * This file contains the list of packages that are available in the Pyodide distribution
     * and can be loaded efficiently using pyodide.loadPackage()
     */
    /**
     * List of packages available in Pyodide v0.26.2 distribution
     * These packages are pre-compiled and optimized for WebAssembly
     *
     * Source: https://pyodide.org/en/stable/usage/packages-in-pyodide.html
     */
    const PYODIDE_BUILTIN_PACKAGES = new Set([
        // Core scientific computing
        'numpy',
        'pandas',
        'scipy',
        'matplotlib',
        'plotly',
        'bokeh',
        'seaborn',
        // Machine learning
        'scikit-learn',
        'tensorflow',
        'keras',
        'pytorch',
        'xgboost',
        // Data processing
        'pillow',
        'opencv-python',
        'beautifulsoup4',
        'lxml',
        'requests',
        'urllib3',
        // Numerical computing
        'sympy',
        'statsmodels',
        'networkx',
        // Package management
        'micropip',
        'pip',
        // Development tools
        'pytest',
        'black',
        'mypy',
        // Other common packages
        'dateutil',
        'pytz',
        'six',
        'setuptools',
        'wheel',
        'packaging',
        'certifi',
        'charset-normalizer',
        'idna',
        'cycler',
        'kiwisolver',
        'pyparsing',
        'fonttools',
        // Jupyter ecosystem
        'ipython',
        'jupyter',
        'notebook',
        // Crypto/security
        'cryptography',
        'pycryptodome',
        // File formats
        'openpyxl',
        'xlrd',
        'h5py',
        'tables',
        // Visualization
        'altair',
        'plotnine',
        'pygments',
        // Statistics
        'patsy',
        'lifelines',
        // Misc utilities
        'joblib',
        'tqdm',
        'click',
        'jinja2',
        'markupsafe'
    ]);
    /**
     * Essential packages that should always be available
     * These are loaded at initialization for optimal performance
     */
    const ESSENTIAL_PACKAGES = [
        'micropip' // Required for fallback package installation
    ];
    /**
     * Packages that require special handling or have known issues
     */
    const SPECIAL_HANDLING_PACKAGES = new Map([
        ['cv2', 'opencv-python'], // cv2 imports as opencv-python
        ['PIL', 'pillow'], // PIL imports as pillow
        ['sklearn', 'scikit-learn'], // sklearn imports as scikit-learn
        ['torch', 'pytorch'], // torch imports as pytorch
        ['tf', 'tensorflow'], // tf imports as tensorflow
    ]);
    /**
     * Check if a package is available in Pyodide distribution
     */
    function isPyodideBuiltinPackage(packageName) {
        // Check direct match
        if (PYODIDE_BUILTIN_PACKAGES.has(packageName)) {
            return true;
        }
        // Check special handling packages
        if (SPECIAL_HANDLING_PACKAGES.has(packageName)) {
            const actualPackage = SPECIAL_HANDLING_PACKAGES.get(packageName);
            return PYODIDE_BUILTIN_PACKAGES.has(actualPackage);
        }
        return false;
    }
    /**
     * Get the actual package name for Pyodide loading
     */
    function getPyodidePackageName(packageName) {
        return SPECIAL_HANDLING_PACKAGES.get(packageName) ?? packageName;
    }

    /**
     * Utilities for parsing Python import statements from code chunks
     */
    /**
     * Extracts import statements from Python code using regex parsing
     *
     * This function identifies both 'import' and 'from...import' statements
     * and extracts the relevant package information.
     *
     * @param code The Python code to parse
     * @returns Array of ImportStatement objects
     */
    function extractImports(code) {
        const imports = [];
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Skip comments and empty lines
            if (line.startsWith('#') || line.length === 0) {
                continue;
            }
            // Handle regular import statements: import module [as alias]
            const importMatch = line.match(/^import\s+([a-zA-Z0-9_][a-zA-Z0-9_.]*)(?:\s+as\s+([a-zA-Z0-9_]+))?/);
            if (importMatch) {
                imports.push({
                    module: importMatch[1],
                    alias: importMatch[2],
                    isFromImport: false,
                    line: i + 1
                });
                continue;
            }
            // Handle from imports: from module import item1, item2 [as alias]
            const fromImportMatch = line.match(/^from\s+([a-zA-Z0-9_][a-zA-Z0-9_.]*)\s+import\s+(.+)/);
            if (fromImportMatch) {
                const module = fromImportMatch[1];
                const importPart = fromImportMatch[2];
                // Parse the imported items (handle commas, aliases, etc.)
                const items = parseImportItems(importPart);
                imports.push({
                    module,
                    items: items.map(item => item.name),
                    isFromImport: true,
                    line: i + 1
                });
                continue;
            }
        }
        return imports;
    }
    /**
     * Parses the items part of a 'from...import' statement
     * Handles cases like: item1, item2 as alias, item3, *
     */
    function parseImportItems(importPart) {
        const items = [];
        // Split by comma and process each item
        const parts = importPart.split(',').map(part => part.trim());
        for (const part of parts) {
            // Handle 'item as alias'
            const aliasMatch = part.match(/^([a-zA-Z0-9_]+)\s+as\s+([a-zA-Z0-9_]+)$/);
            if (aliasMatch) {
                items.push({
                    name: aliasMatch[1],
                    alias: aliasMatch[2]
                });
                continue;
            }
            // Handle simple item name
            const simpleMatch = part.match(/^([a-zA-Z0-9_*]+)$/);
            if (simpleMatch) {
                items.push({
                    name: simpleMatch[1]
                });
            }
        }
        return items;
    }
    /**
     * Extracts unique package names from a list of import statements
     *
     * For submodule imports like 'numpy.random', this returns the top-level package 'numpy'
     *
     * @param imports Array of ImportStatement objects
     * @returns Set of unique package names
     */
    function extractPackageNames(imports) {
        const packages = new Set();
        for (const imp of imports) {
            // Extract the top-level package name
            const topLevelPackage = imp.module.split('.')[0];
            // Skip built-in Python modules
            if (!isBuiltinPythonModule(topLevelPackage)) {
                packages.add(topLevelPackage);
            }
        }
        return packages;
    }
    /**
     * Checks if a module is a built-in Python module that doesn't need installation
     */
    function isBuiltinPythonModule(moduleName) {
        const builtinModules = new Set([
            'os', 'sys', 'json', 'math', 'random', 'datetime', 'time', 'collections',
            'itertools', 'functools', 'operator', 'pathlib', 'glob', 'shutil', 'tempfile',
            'urllib', 'http', 'html', 'xml', 'csv', 'configparser', 'logging', 'unittest',
            'io', 're', 'string', 'textwrap', 'unicodedata', 'calendar', 'hashlib',
            'hmac', 'secrets', 'statistics', 'decimal', 'fractions', 'contextlib',
            'abc', 'numbers', 'types', 'copy', 'pprint', 'reprlib', 'enum', 'graphlib',
            'weakref', 'gc', 'inspect', 'site', 'importlib', 'pkgutil', 'modulefinder',
            'runpy', 'traceback', 'future', 'keyword', 'token', 'tokenize', 'ast',
            'symtable', 'symbol', 'dis', 'pickletools', 'formatter', 'errno', 'ctypes',
            'threading', 'multiprocessing', 'concurrent', 'subprocess', 'sched', 'queue',
            'socketserver', 'ssl', 'asyncio', 'socket', 'signal', 'mmap', 'select',
            'selectors', 'codecs', 'locale', 'gettext', 'argparse', 'optparse', 'getopt',
            'cmd', 'shlex', 'platform', 'warnings', 'dataclasses', 'contextlib',
            'typing', 'pydoc', 'doctest', 'difflib', 'rlcompleter', 'tabnanny', 'trace',
            'timeit', 'cProfile', 'profile', 'pstats', 'cgi', 'cgitb', 'wsgiref',
            'ftplib', 'poplib', 'imaplib', 'nntplib', 'smtplib', 'smtpd', 'telnetlib',
            'uuid', 'zlib', 'gzip', 'bz2', 'lzma', 'zipfile', 'tarfile'
        ]);
        return builtinModules.has(moduleName);
    }

    /**
     * Package Manager Service for Pyodide
     *
     * This service handles dynamic loading of Python packages using a hybrid approach:
     * 1. Use pyodide.loadPackage() for built-in Pyodide packages (fast)
     * 2. Use micropip.install() for PyPI packages (comprehensive)
     *
     * Features:
     * - Intelligent package detection and classification
     * - Caching to avoid redundant downloads
     * - Comprehensive error handling and logging
     * - Performance monitoring
     */
    class PackageManager {
        constructor(pyodide, config = {}) {
            this.micropipReady = false;
            this.pyodide = pyodide;
            this.cache = {
                loaded: new Set(),
                failed: new Map(),
                loadTimestamps: new Map()
            };
            this.config = {
                enableCaching: true,
                loadTimeout: 30000, // 30 seconds
                preloadEssentials: true,
                verbose: false,
                ...config
            };
        }
        /**
         * Initialize the package manager with essential packages
         */
        async initialize() {
            if (this.config.verbose) {
                console.log('[PackageManager] Initializing...');
            }
            if (this.config.preloadEssentials) {
                await this.loadEssentialPackages();
            }
        }
        /**
         * Load essential packages that are always needed
         */
        async loadEssentialPackages() {
            const startTime = Date.now();
            for (const packageName of ESSENTIAL_PACKAGES) {
                try {
                    await this.loadSinglePackage(packageName);
                    // Set up micropip after loading
                    if (packageName === 'micropip') {
                        this.micropipReady = true;
                        if (this.config.verbose) {
                            console.log('[PackageManager] micropip is ready');
                        }
                    }
                }
                catch (error) {
                    console.warn(`[PackageManager] Failed to load essential package ${packageName}:`, error);
                }
            }
            if (this.config.verbose) {
                console.log(`[PackageManager] Essential packages loaded in ${Date.now() - startTime}ms`);
            }
        }
        /**
         * Analyze code and load all required packages
         */
        async loadPackagesFromCode(code) {
            const startTime = Date.now();
            if (this.config.verbose) {
                console.log('[PackageManager] Analyzing code for imports...');
            }
            // Extract imports from code
            const imports = extractImports(code);
            const packageNames = extractPackageNames(imports);
            if (this.config.verbose) {
                console.log(`[PackageManager] Found ${packageNames.size} packages:`, Array.from(packageNames));
            }
            // Load packages
            const results = await this.loadPackages(Array.from(packageNames));
            if (this.config.verbose) {
                const totalTime = Date.now() - startTime;
                const successful = results.filter(r => r.success).length;
                console.log(`[PackageManager] Loaded ${successful}/${results.length} packages in ${totalTime}ms`);
            }
            return results;
        }
        /**
         * Load multiple packages using optimal strategy for each
         */
        async loadPackages(packageNames) {
            const results = [];
            // Process packages in parallel for better performance
            const loadPromises = packageNames.map(async (packageName) => {
                return await this.loadPackageWithStrategy(packageName);
            });
            const loadResults = await Promise.allSettled(loadPromises);
            for (let i = 0; i < loadResults.length; i++) {
                const result = loadResults[i];
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                }
                else {
                    results.push({
                        packageName: packageNames[i],
                        success: false,
                        method: 'pyodide',
                        error: result.reason?.message || 'Unknown error',
                        loadTime: 0
                    });
                }
            }
            return results;
        }
        /**
         * Load a single package using the optimal strategy
         */
        async loadPackageWithStrategy(packageName) {
            const startTime = Date.now();
            // Check cache first
            if (this.config.enableCaching && this.cache.loaded.has(packageName)) {
                return {
                    packageName,
                    success: true,
                    method: 'pyodide', // This doesn't matter for cached packages
                    loadTime: 0
                };
            }
            // Check if package previously failed
            if (this.config.enableCaching && this.cache.failed.has(packageName)) {
                return {
                    packageName,
                    success: false,
                    method: 'pyodide',
                    error: this.cache.failed.get(packageName),
                    loadTime: 0
                };
            }
            try {
                let result;
                if (isPyodideBuiltinPackage(packageName)) {
                    // Use Pyodide's built-in package loader
                    result = await this.loadWithPyodide(packageName);
                }
                else {
                    // Fall back to micropip for PyPI packages
                    result = await this.loadWithMicropip(packageName);
                }
                // Update cache
                if (this.config.enableCaching) {
                    if (result.success) {
                        this.cache.loaded.add(packageName);
                        this.cache.loadTimestamps.set(packageName, Date.now());
                    }
                    else {
                        this.cache.failed.set(packageName, result.error || 'Unknown error');
                    }
                }
                result.loadTime = Date.now() - startTime;
                return result;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (this.config.enableCaching) {
                    this.cache.failed.set(packageName, errorMessage);
                }
                return {
                    packageName,
                    success: false,
                    method: 'pyodide',
                    error: errorMessage,
                    loadTime: Date.now() - startTime
                };
            }
        }
        /**
         * Load package using Pyodide's built-in loader
         */
        async loadWithPyodide(packageName) {
            const actualPackageName = getPyodidePackageName(packageName);
            if (this.config.verbose) {
                console.log(`[PackageManager] Loading ${packageName} (${actualPackageName}) via Pyodide...`);
            }
            try {
                await this.pyodide.loadPackage(actualPackageName);
                return {
                    packageName,
                    success: true,
                    method: 'pyodide',
                    loadTime: 0 // Will be set by caller
                };
            }
            catch (error) {
                throw new Error(`Pyodide failed to load ${actualPackageName}: ${error}`);
            }
        }
        /**
         * Load package using micropip from PyPI
         */
        async loadWithMicropip(packageName) {
            if (!this.micropipReady) {
                throw new Error('micropip is not ready. Ensure essential packages are loaded first.');
            }
            if (this.config.verbose) {
                console.log(`[PackageManager] Loading ${packageName} via micropip...`);
            }
            try {
                // Use micropip to install the package
                await this.pyodide.runPythonAsync(`
        import micropip
        await micropip.install("${packageName}")
      `);
                return {
                    packageName,
                    success: true,
                    method: 'micropip',
                    loadTime: 0 // Will be set by caller
                };
            }
            catch (error) {
                throw new Error(`micropip failed to install ${packageName}: ${error}`);
            }
        }
        /**
         * Load a single package directly (for manual package loading)
         */
        async loadSinglePackage(packageName) {
            return await this.loadPackageWithStrategy(packageName);
        }
        /**
         * Get package loading statistics
         */
        getStats() {
            const loadTimes = {};
            for (const [pkg, timestamp] of this.cache.loadTimestamps) {
                loadTimes[pkg] = timestamp;
            }
            return {
                loaded: this.cache.loaded.size,
                failed: this.cache.failed.size,
                loadTimes
            };
        }
        /**
         * Clear the package cache
         */
        clearCache() {
            this.cache.loaded.clear();
            this.cache.failed.clear();
            this.cache.loadTimestamps.clear();
        }
        /**
         * Check if a package is already loaded
         */
        isPackageLoaded(packageName) {
            return this.cache.loaded.has(packageName);
        }
        /**
         * Get list of failed packages with their error messages
         */
        getFailedPackages() {
            return new Map(this.cache.failed);
        }
    }

    /**
     * Enhanced Python Evaluator with Dynamic Package Loading
     *
     * This evaluator implements a hybrid approach for package management:
     * - Analyzes code for import statements before execution
     * - Loads required packages dynamically using optimal strategies
     * - Provides comprehensive error handling and logging
     * - Maintains backward compatibility with existing conductor framework
     */
    // Pyodide instance management
    let pyodideInstance;
    let pyodideReady;
    let packageManager;
    /**
     * Initialize Pyodide and the package manager
     */
    async function ensurePyodideLoaded() {
        if (!pyodideReady) {
            console.log("[PythonEvaluator] Initializing Pyodide...");
            try {
                // Load pyodide from CDN in the worker scope
                importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
            }
            catch (e) {
                console.error("[PythonEvaluator] Failed to import pyodide.js", e);
                throw new Error("Failed to load Pyodide script");
            }
            pyodideReady = (async () => {
                try {
                    // Initialize Pyodide
                    pyodideInstance = await loadPyodide({
                        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"
                    });
                    // Initialize package manager with configuration
                    const config = {
                        enableCaching: true,
                        loadTimeout: 30000,
                        preloadEssentials: true,
                        verbose: true // Enable for development, can be configured later
                    };
                    packageManager = new PackageManager(pyodideInstance, config);
                    await packageManager.initialize();
                    console.log("[PythonEvaluator] Pyodide and PackageManager initialized successfully");
                }
                catch (error) {
                    console.error("[PythonEvaluator] Failed to initialize Pyodide:", error);
                    throw error;
                }
            })();
        }
        return pyodideReady;
    }
    class PythonEvaluator extends BasicEvaluator {
        constructor(conductor) {
            super(conductor);
        }
        async evaluateChunk(chunk) {
            console.log("[PythonEvaluator] Evaluating chunk:", chunk.substring(0, 100) + (chunk.length > 100 ? "..." : ""));
            try {
                // Ensure Pyodide is ready
                await ensurePyodideLoaded();
                if (!pyodideInstance || !packageManager) {
                    throw new Error("Pyodide or PackageManager not properly initialized");
                }
                const pyodide = pyodideInstance;
                // Set up I/O handling
                this.setupIOHandling(pyodide);
                // Load required packages before execution
                await this.loadRequiredPackages(chunk);
                // Execute the Python code
                await this.executePythonCode(chunk);
            }
            catch (err) {
                const message = this.formatError(err);
                this.conductor.sendOutput(`[python error] ${message}`);
                console.error("[PythonEvaluator] Execution error:", err);
            }
        }
        /**
         * Set up stdout/stderr handling and input function
         */
        setupIOHandling(pyodide) {
            // Wire stdout to conductor output
            pyodide.setStdout({
                batched: (text) => {
                    if (text)
                        this.conductor.sendOutput(text);
                }
            });
            // Provide synchronous input() backed by tryRequestInput()
            const inputSync = (prompt) => {
                if (typeof prompt === "string" && prompt.length > 0) {
                    this.conductor.sendOutput(prompt);
                }
                const line = this.conductor.tryRequestInput();
                return line ?? "";
            };
            // Expose the JS function to Python and override builtins.input
            pyodide.globals.set("__sa_input_sync__", inputSync);
            pyodide.runPython("import builtins\n" +
                "builtins.input = __sa_input_sync__\n");
        }
        /**
         * Analyze code and load required packages
         */
        async loadRequiredPackages(code) {
            if (!packageManager) {
                console.warn("[PythonEvaluator] PackageManager not available, skipping package loading");
                return;
            }
            try {
                const loadResults = await packageManager.loadPackagesFromCode(code);
                // Report loading results
                const successful = loadResults.filter(r => r.success);
                const failed = loadResults.filter(r => !r.success);
                if (successful.length > 0) {
                    const successNames = successful.map(r => r.packageName).join(", ");
                    console.log(`[PythonEvaluator] Successfully loaded packages: ${successNames}`);
                }
                if (failed.length > 0) {
                    const failureDetails = failed.map(r => `${r.packageName} (${r.error})`).join(", ");
                    console.warn(`[PythonEvaluator] Failed to load packages: ${failureDetails}`);
                    // Send warning to user about failed packages
                    this.conductor.sendOutput(`[warning] Some packages failed to load: ${failed.map(r => r.packageName).join(", ")}\n`);
                }
                // Log performance stats if any packages were loaded
                if (loadResults.length > 0) {
                    const totalTime = loadResults.reduce((sum, r) => sum + r.loadTime, 0);
                    console.log(`[PythonEvaluator] Package loading completed in ${totalTime}ms`);
                }
            }
            catch (error) {
                console.error("[PythonEvaluator] Error during package loading:", error);
                this.conductor.sendOutput(`[warning] Package loading encountered issues: ${error}\n`);
            }
        }
        /**
         * Execute Python code with proper error handling
         */
        async executePythonCode(code) {
            if (!pyodideInstance) {
                throw new Error("Pyodide instance not available");
            }
            try {
                await pyodideInstance.runPythonAsync(code);
            }
            catch (error) {
                // Re-throw with additional context
                throw new Error(`Python execution failed: ${error}`);
            }
        }
        /**
         * Format error messages for user-friendly display
         */
        formatError(err) {
            if (!err) {
                return "Unknown error occurred";
            }
            // Extract meaningful error message
            let message = "";
            if (typeof err === "string") {
                message = err;
            }
            else if (err.message) {
                message = err.message;
            }
            else {
                message = String(err);
            }
            // Clean up common error patterns for better readability
            message = message
                .replace(/^Error: /, "")
                .replace(/^Python execution failed: /, "")
                .replace(/PythonError: /, "");
            return message;
        }
        /**
         * Get package manager statistics (useful for debugging)
         */
        getPackageStats() {
            if (!packageManager) {
                return { error: "PackageManager not initialized" };
            }
            return packageManager.getStats();
        }
        /**
         * Manually load a package (useful for testing or special cases)
         */
        async loadPackage(packageName) {
            if (!packageManager) {
                console.warn("[PythonEvaluator] PackageManager not available");
                return false;
            }
            try {
                const result = await packageManager.loadSinglePackage(packageName);
                return result.success;
            }
            catch (error) {
                console.error(`[PythonEvaluator] Failed to load package ${packageName}:`, error);
                return false;
            }
        }
    }

    // Signal that the worker loaded
    console.log("[py-pyscript] worker booted");
    initialise(PythonEvaluator);

})();
