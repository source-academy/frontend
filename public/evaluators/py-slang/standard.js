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

    // Load Pyodide inside the worker and initialise once
    let pyodideInstance;
    let pyodideReady;
    function ensurePyodideLoaded() {
        if (!pyodideReady) {
            console.log("[runner] ensurePyodideLoaded entered");
            try {
                // Load pyodide from CDN in the worker scope
                importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
            }
            catch (e) {
                // If importScripts is unavailable for some reason, surface the error later
                console.error("Failed to import pyodide.js", e);
            }
            pyodideReady = (async () => {
                // @ts-ignore loadPyodide is provided by the imported script
                pyodideInstance = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/" });
                await pyodideInstance.loadPackage("pandas");
            })();
        }
        return pyodideReady;
    }
    class PythonEvaluator extends BasicEvaluator {
        constructor(conductor) {
            super(conductor);
        }
        async evaluateChunk(chunk) {
            console.log("[runner] evaluateChunk entered with chunk: ", chunk);
            await ensurePyodideLoaded();
            console.log("[runner] ensurePyodideLoaded exited");
            const pyodide = pyodideInstance;
            // Wire stdout/stderr to conductor output
            pyodide.setStdout({
                batched: (text) => {
                    if (text)
                        this.conductor.sendOutput(text);
                }
            });
            // pyodide.setStderr({
            // 	batched: (text: string) => {
            // 		if (text) this.conductor.sendOutput(text);
            // 	}
            // });
            // Provide a synchronous input() backed by tryRequestInput()
            // If no input is available, return empty string to avoid blocking
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
            try {
                await pyodide.runPythonAsync(chunk);
            }
            catch (err) {
                const message = (err && err.message) ? err.message : String(err);
                this.conductor.sendOutput(`[python error] ${message}`);
            }
        }
    }
    // Signal that the worker loaded
    console.log("[py-pyscript] worker booted");
    initialise(PythonEvaluator);

})();
//# sourceMappingURL=worker.js.map
