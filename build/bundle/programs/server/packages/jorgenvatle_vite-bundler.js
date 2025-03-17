Package["core-runtime"].queue("jorgenvatle:vite-bundler",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var fetch = Package.fetch.fetch;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var message;

var require = meteorInstall({"node_modules":{"meteor":{"jorgenvatle:vite-bundler":{"src":{"server.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/server.ts                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let WebApp, WebAppInternals;
    module.link("meteor/webapp", {
      WebApp(v) {
        WebApp = v;
      },
      WebAppInternals(v) {
        WebAppInternals = v;
      }
    }, 0);
    let Logger;
    module.link("./utility/Logger", {
      default(v) {
        Logger = v;
      }
    }, 1);
    let ViteDevServerWorker;
    module.link("./vite-boilerplate/development", {
      ViteDevServerWorker(v) {
        ViteDevServerWorker = v;
      }
    }, 2);
    let ViteProductionBoilerplate;
    module.link("./vite-boilerplate/production", {
      ViteProductionBoilerplate(v) {
        ViteProductionBoilerplate = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const worker = Meteor.isProduction ? new ViteProductionBoilerplate() : new ViteDevServerWorker();
    if ('start' in worker) {
      Meteor.startup(() => {
        worker.start();
      });
    }
    WebAppInternals.registerBoilerplateDataCallback('meteor-vite', async (request, data) => {
      const {
        dynamicBody,
        dynamicHead
      } = await worker.getBoilerplate();
      if (dynamicHead) {
        data.dynamicHead = "".concat(data.dynamicHead || '', "\n").concat(dynamicHead);
      }
      if (dynamicBody) {
        data.dynamicBody = "".concat(data.dynamicBody || '', "\n").concat(dynamicBody);
      }
    });
    if (worker instanceof ViteProductionBoilerplate) {
      Meteor.startup(() => {
        Logger.debug("Vite asset base URL: ".concat(worker.baseUrl));
        worker.makeViteAssetsCacheable();
      });
      // Prevent Meteor from sending a 200 OK HTML file when the request is clearly not valid.
      // If an asset is found by Meteor, this hook will not be called.
      WebApp.connectHandlers.use(worker.assetDir, (req, res, next) => {
        res.writeHead(404, 'Not found');
        res.write('Vite asset could not be found.');
        Logger.warn("Served 404 for Vite asset request: ".concat(req.originalUrl));
        res.end();
      });
    }
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"workers.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/workers.ts                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    var _process$env$METEOR_V;
    module.export({
      createWorkerFork: () => createWorkerFork,
      isMeteorIPCMessage: () => isMeteorIPCMessage,
      cwd: () => cwd,
      workerPath: () => workerPath,
      getProjectPackageJson: () => getProjectPackageJson
    });
    let fork;
    module.link("node:child_process", {
      fork(v) {
        fork = v;
      }
    }, 0);
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 1);
    let Random;
    module.link("meteor/random", {
      Random(v) {
        Random = v;
      }
    }, 2);
    let Path;
    module.link("path", {
      default(v) {
        Path = v;
      }
    }, 3);
    let FS;
    module.link("fs", {
      default(v) {
        FS = v;
      }
    }, 4);
    let pc;
    module.link("picocolors", {
      default(v) {
        pc = v;
      }
    }, 5);
    let getMeteorRuntimeConfig;
    module.link("./utility/Helpers", {
      getMeteorRuntimeConfig(v) {
        getMeteorRuntimeConfig = v;
      }
    }, 6);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function createWorkerFork(hooks, options) {
      var _options$detached, _options$ipc, _options$ipc2;
      if (!FS.existsSync(workerPath)) {
        throw new MeteorViteError(["Unable to locate Meteor-Vite workers! Make sure you've installed the 'meteor-vite' npm package.", "Install it by running the following command:", "$  ".concat(pc.yellow('npm i -D meteor-vite'))]);
      }
      const child = fork(workerPath, ['--enable-source-maps'], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        cwd,
        detached: (_options$detached = options === null || options === void 0 ? void 0 : options.detached) !== null && _options$detached !== void 0 ? _options$detached : false,
        env: prepareWorkerEnv({
          ipcOverDdp: !!(options !== null && options !== void 0 && (_options$ipc = options.ipc) !== null && _options$ipc !== void 0 && _options$ipc.active)
        })
      });
      if (options !== null && options !== void 0 && options.detached) {
        child.unref();
      }
      const hookMethods = Object.keys(hooks);
      hookMethods.forEach(method => {
        const hook = hooks[method];
        if (typeof hook !== 'function') return;
        hooks[method] = Meteor.bindEnvironment(hook);
      });
      const workerConfigHook = hooks.workerConfig;
      hooks.workerConfig = data => {
        if (typeof workerConfigHook === 'function') {
          workerConfigHook(data);
        }
        const {
          pid,
          listening
        } = data;
        if (listening && process.env.ENABLE_DEBUG_LOGS) {
          console.log('Running Vite worker as a background process..\n  ', ["Background PID: ".concat(pid), "Child process PID: ".concat(child.pid), "Meteor PID: ".concat(process.pid), "Is vite server: ".concat(listening)].join('\n   '));
        }
      };
      if (options !== null && options !== void 0 && (_options$ipc2 = options.ipc) !== null && _options$ipc2 !== void 0 && _options$ipc2.active) {
        options.ipc.setResponseHooks(hooks);
      }
      child.on('message', message => {
        const hook = hooks[message.kind];
        if (typeof hook !== 'function') {
          return console.warn('Meteor: Unrecognized worker message!', {
            message
          });
        }
        return hook(message.data);
      });
      child.on('exit', code => {
        if (code || process.env.ENABLE_DEBUG_LOGS) {
          console.warn('Child exited with code:', code);
        }
      });
      child.on('error', error => {
        console.error('Meteor: Worker process error:', error);
        if (!child.connected) {
          throw new MeteorViteError('Lost connection to Vite worker process');
        }
      });
      child.on('disconnect', () => {
        if (process.env.ENABLE_DEBUG_LOGS) {
          console.warn('Meteor: Worker process disconnected');
        }
      });
      return {
        call(_ref) {
          var _options$ipc3, _options$ipc4;
          let {
            params,
            method
          } = _ref;
          const message = {
            id: Random.id(),
            method,
            params
          };
          if (!(options !== null && options !== void 0 && (_options$ipc3 = options.ipc) !== null && _options$ipc3 !== void 0 && _options$ipc3.active) && !child.connected) {
            throw new MeteorViteError("Oops worker process is not connected! Tried to send message to worker: ".concat(method));
          }
          if (options !== null && options !== void 0 && (_options$ipc4 = options.ipc) !== null && _options$ipc4 !== void 0 && _options$ipc4.active) {
            options.ipc.call(message);
          }
          if (child.connected) {
            child.send(message);
          }
        },
        child
      };
    }
    function isMeteorIPCMessage(message) {
      if (!message || typeof message !== 'object') {
        return false;
      }
      if (!('type' in message) || !('topic' in message)) {
        return false;
      }
      if ((message === null || message === void 0 ? void 0 : message.type) !== 'METEOR_IPC_MESSAGE') {
        return false;
      }
      if (typeof message.topic !== 'string') {
        return false;
      }
      return true;
    }
    class MeteorViteError extends Error {
      constructor(message) {
        if (!Array.isArray(message)) {
          message = [message];
        }
        super("\n\u26A1  ".concat(message.join('\n L ')));
        this.name = this.constructor.name;
      }
    }
    const cwd = (_process$env$METEOR_V = process.env.METEOR_VITE_CWD) !== null && _process$env$METEOR_V !== void 0 ? _process$env$METEOR_V : guessCwd();
    const workerPath = Path.join(cwd, 'node_modules/meteor-vite/dist/bin/worker.mjs');
    function getProjectPackageJson() {
      let file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'package.json';
      const path = Path.join(cwd, file);
      if (!FS.existsSync(path)) {
        throw new MeteorViteError(["Unable to locate ".concat(pc.yellow(file), " for your project in ").concat(pc.yellow(path)), "Make sure you run Meteor commands from the root of your project directory.", "Alternatively, you can supply a superficial CWD for Meteor-Vite to use:", "$  cross-env METEOR_VITE_CWD=\"./projects/my-meteor-project/\" meteor run"]);
      }
      return JSON.parse(FS.readFileSync(path, 'utf-8'));
    }
    function guessCwd() {
      var _process$env$PWD;
      let cwd = (_process$env$PWD = process.env.PWD) !== null && _process$env$PWD !== void 0 ? _process$env$PWD : process.cwd();
      const index = cwd.indexOf('.meteor');
      if (index !== -1) {
        cwd = cwd.substring(0, index);
      }
      return cwd;
    }
    function prepareWorkerEnv(_ref2) {
      let {
        ipcOverDdp = false
      } = _ref2;
      const workerEnvPrefix = 'METEOR_VITE_WORKER_';
      const env = {
        FORCE_COLOR: '3',
        ENABLE_DEBUG_LOGS: process.env.ENABLE_DEBUG_LOGS,
        METEOR_LOCAL_DIR: process.env.METEOR_LOCAL_DIR,
        STARTED_AT: Date.now().toString(),
        NODE_ENV: process.env.NODE_ENV
      };
      if (ipcOverDdp) {
        const METEOR_RUNTIME = getMeteorRuntimeConfig();
        if (!METEOR_RUNTIME.fallback) {
          Object.assign(env, {
            DDP_IPC: true,
            METEOR_RUNTIME: JSON.stringify(METEOR_RUNTIME)
          });
        }
      }
      Object.entries(process.env).forEach(_ref3 => {
        let [key, value] = _ref3;
        if (!key.startsWith(workerEnvPrefix)) {
          return;
        }
        const unPrefixedKey = key.replace(new RegExp("^".concat(workerEnvPrefix)), '');
        env[key] = value;
        env[unPrefixedKey] = value;
      });
      return env;
    }
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"api":{"Collections.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/api/Collections.ts                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectSpread;
    module.link("@babel/runtime/helpers/objectSpread2", {
      default(v) {
        _objectSpread = v;
      }
    }, 0);
    module.export({
      StatusCollection: () => StatusCollection,
      DataStreamCollection: () => DataStreamCollection,
      IpcCollection: () => IpcCollection
    });
    let Mongo;
    module.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const StatusCollection = new Mongo.Collection('_meteor-vite.status', {
      connection: null
    });
    const DataStreamCollection = new Mongo.Collection('_meteor-vite.data-stream');
    const IpcCollection = new Mongo.Collection('_meteor-vite.ipc', {
      connection: null,
      transform: doc => {
        return _objectSpread(_objectSpread({}, doc), {}, {
          params: JSON.parse(doc.params)
        });
      }
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"DDP-IPC.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/api/DDP-IPC.ts                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      DDP_IPC: () => DDP_IPC
    });
    let getMeteorRuntimeConfig;
    module.link("../utility/Helpers", {
      getMeteorRuntimeConfig(v) {
        getMeteorRuntimeConfig = v;
      }
    }, 0);
    let IpcCollection;
    module.link("./Collections", {
      IpcCollection(v) {
        IpcCollection = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class DDP_IPC {
      constructor(responseHooks) {
        this.responseHooks = void 0;
        this.responseHooks = responseHooks;
        Meteor.methods({
          'meteor-vite:ipc': _ref => {
            let {
              kind,
              data
            } = _ref;
            const hook = this.responseHooks[kind];
            if (typeof hook !== 'function') {
              return console.warn('Meteor: Unrecognized worker message!', {
                message: {
                  kind,
                  data
                }
              });
            }
            return hook(data);
          },
          async 'meteor-vite:ipc.received'(id) {
            await IpcCollection.removeAsync(id);
          }
        });
        Meteor.publish('meteor-vite:ipc', function () {
          return IpcCollection.find();
        });
      }
      call(_ref2) {
        let {
          method,
          params,
          id
        } = _ref2;
        IpcCollection.insertAsync({
          id,
          method,
          params: JSON.stringify(params)
        }).catch(error => {
          console.error('Vite: Failed to send IPC event!', error);
        });
      }
      setResponseHooks(responseHooks) {
        Object.assign(this.responseHooks, responseHooks);
      }
      /**
       * Whether we are confident that Meteor can be reached over DDP from the current runtime config
       */
      get active() {
        return !getMeteorRuntimeConfig().fallback;
      }
    }
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Endpoints.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/api/Endpoints.ts                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      Methods: () => Methods
    });
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    let getMeteorRuntimeConfig;
    module.link("../utility/Helpers", {
      getMeteorRuntimeConfig(v) {
        getMeteorRuntimeConfig = v;
      }
    }, 1);
    let DataStreamCollection, StatusCollection;
    module.link("./Collections", {
      DataStreamCollection(v) {
        DataStreamCollection = v;
      },
      StatusCollection(v) {
        StatusCollection = v;
      }
    }, 2);
    let watchDataStreamLogs;
    module.link("./Watchers", {
      watchDataStreamLogs(v) {
        watchDataStreamLogs = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const Methods = {
      async 'meteor-vite:status/update'(status) {
        const {
          appId
        } = getMeteorRuntimeConfig();
        await StatusCollection.upsertAsync({
          type: status.type
        }, {
          $set: {
            data: Object.assign(status.data, {
              updatedAt: new Date(),
              appId
            })
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        });
      },
      async 'meteor-vite:log'(log) {
        await DataStreamCollection.insertAsync(Object.assign(log, {
          createdAt: new Date()
        }));
      }
    };
    Meteor.startup(() => {
      if (Meteor.isProduction) {
        return;
      }
      Meteor.methods(Methods);
      watchDataStreamLogs();
      if (Meteor.isClient) {
        return;
      }
      Meteor.publish('meteor-vite:log', () => {
        return DataStreamCollection.find({
          type: {
            $in: ['log:client', 'log:shared']
          }
        }, {
          limit: 50,
          sort: {
            createdAt: -1
          }
        });
      });
      // Todo: clean up old logs regularly
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Watchers.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/api/Watchers.ts                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      watchDataStreamLogs: () => watchDataStreamLogs
    });
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    let DDPLogger;
    module.link("../utility/DDPLogger", {
      default(v) {
        DDPLogger = v;
      }
    }, 1);
    let DataStreamCollection;
    module.link("./Collections", {
      DataStreamCollection(v) {
        DataStreamCollection = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    let watcherActive = false;
    function watchDataStreamLogs() {
      const startupTime = new Date();
      if (watcherActive) {
        return console.warn(new Error('⚡ Data stream logs are already being watched'));
      }
      if (Meteor.isProduction) {
        throw new Error('meteor-vite data logs are only available in development mode');
      }
      watcherActive = true;
      if (Meteor.isClient) {
        Meteor.subscribe('meteor-vite:log', {
          onReady() {
            console.debug('⚡ Listening for logs from meteor-vite');
          },
          onStop(error) {
            if (!error) {
              return console.debug('⚡ Unsubscribed from meteor-vite logs');
            }
            console.debug('⚡ Error from meteor-vite logs publication', error);
          }
        });
      }
      DataStreamCollection.find({
        createdAt: {
          $gt: startupTime
        }
      }).observe({
        added(document) {
          DDPLogger.print(document);
        }
      });
    }
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"loading":{"vite-connection-handler.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/loading/vite-connection-handler.ts                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectSpread;
    module1.link("@babel/runtime/helpers/objectSpread2", {
      default(v) {
        _objectSpread = v;
      }
    }, 0);
    module1.export({
      MeteorViteConfig: () => MeteorViteConfig,
      VITE_ENTRYPOINT_SCRIPT_ID: () => VITE_ENTRYPOINT_SCRIPT_ID,
      VITE_CLIENT_SCRIPT_ID: () => VITE_CLIENT_SCRIPT_ID,
      ViteDevScripts: () => ViteDevScripts,
      ViteConnection: () => ViteConnection,
      getConfig: () => getConfig,
      setConfig: () => setConfig,
      DevConnectionLog: () => DevConnectionLog
    });
    let Meteor;
    module1.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    let Mongo;
    module1.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 1);
    module1.link("../api/Endpoints");
    let getProjectPackageJson;
    module1.link("../workers", {
      getProjectPackageJson(v) {
        getProjectPackageJson = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    let MeteorViteConfig;
    const VITE_ENTRYPOINT_SCRIPT_ID = 'meteor-vite-entrypoint-script';
    const VITE_CLIENT_SCRIPT_ID = 'meteor-vite-client';
    class ViteDevScripts {
      constructor(config) {
        this.config = void 0;
        this.urls = void 0;
        this.needsReactPreamble = void 0;
        this.config = config;
        const {
          baseUrl
        } = config;
        this.urls = {
          baseUrl,
          entrypointUrl: "".concat(baseUrl, "/").concat(config.entryFile),
          viteClientUrl: "".concat(baseUrl, "/@vite/client"),
          reactRefresh: "".concat(baseUrl, "/@react-refresh")
        };
        /**
         * Determine whether to inject React Refresh snippet into HTML served by Meteor.
         * Without this snippet, React HMR will not work with Meteor-Vite.
         *
         * {@link https://github.com/JorgenVatle/meteor-vite/issues/29}
         * {@link https://github.com/vitejs/vite-plugin-react/issues/11#discussion_r430879201}
         */
        {
          const packageJson = getProjectPackageJson();
          this.needsReactPreamble = false;
          if ('@vitejs/plugin-react' in packageJson.dependencies) {
            this.needsReactPreamble = true;
          }
          if ('@vitejs/plugin-react' in packageJson.devDependencies) {
            this.needsReactPreamble = true;
          }
        }
      }
      async stringTemplate() {
        const {
          viteClientUrl,
          entrypointUrl
        } = this.urls;
        if (!this.config.ready) {
          if ('getTextAsync' in Assets) {
            return Assets.getTextAsync('src/loading/dev-server-splash.html');
          }
          return Assets.getText('src/loading/dev-server-splash.html');
        }
        const moduleLines = ["<script src=\"".concat(viteClientUrl, "\" type=\"module\" id=\"").concat(VITE_CLIENT_SCRIPT_ID, "\"></script>"), "<script src=\"".concat(entrypointUrl, "\" type=\"module\" id=\"").concat(VITE_ENTRYPOINT_SCRIPT_ID, "\"></script>")];
        if (this.needsReactPreamble) {
          moduleLines.unshift("\n                <script type=\"module\">\n                  import RefreshRuntime from \"".concat(this.urls.reactRefresh, "\";\n                  RefreshRuntime.injectIntoGlobalHook(window)\n                  window.$RefreshReg$ = () => {}\n                  window.$RefreshSig$ = () => (type) => type\n                  window.__vite_plugin_react_preamble_installed__ = true\n                </script>\n            "));
        }
        return moduleLines.join('\n');
      }
      injectScriptsInDOM() {
        if (Meteor.isServer) {
          throw new Error('This can only run on the client!');
        }
        if (!Meteor.isDevelopment) {
          return;
        }
        // If the scripts already exists on the page, throw an error to prevent adding more than one script.
        const existingScript = document.getElementById(VITE_ENTRYPOINT_SCRIPT_ID) || document.getElementById(VITE_CLIENT_SCRIPT_ID);
        if (existingScript) {
          throw new Error('Vite script already exists in the current document');
        }
        const TemporaryElements = {
          splashScreen: document.getElementById('meteor-vite-splash-screen'),
          styles: document.getElementById('meteor-vite-styles')
        };
        // Otherwise create a new set of nodes so they can be appended to the document.
        const viteEntrypoint = document.createElement('script');
        viteEntrypoint.id = VITE_ENTRYPOINT_SCRIPT_ID;
        viteEntrypoint.src = this.urls.entrypointUrl;
        viteEntrypoint.type = 'module';
        viteEntrypoint.setAttribute('defer', 'true');
        const viteClient = document.createElement('script');
        viteClient.id = VITE_CLIENT_SCRIPT_ID;
        viteClient.src = this.urls.viteClientUrl;
        viteClient.type = 'module';
        viteEntrypoint.onerror = error => {
          DevConnectionLog.error('Vite entrypoint module failed to load! Will refresh page shortly...', error);
          setTimeout(() => window.location.reload(), 15000);
        };
        viteEntrypoint.onload = () => {
          var _TemporaryElements$sp, _TemporaryElements$st;
          DevConnectionLog.info('Loaded Vite module dynamically! Hopefully all went well and your app is usable. 🤞');
          (_TemporaryElements$sp = TemporaryElements.splashScreen) === null || _TemporaryElements$sp === void 0 ? void 0 : _TemporaryElements$sp.remove();
          (_TemporaryElements$st = TemporaryElements.styles) === null || _TemporaryElements$st === void 0 ? void 0 : _TemporaryElements$st.remove();
        };
        document.body.prepend(viteEntrypoint, viteClient);
      }
    }
    const runtimeConfig = {
      ready: false,
      host: 'localhost',
      baseUrl: 'http://localhost:0',
      port: 0,
      entryFile: '',
      lastUpdate: Date.now()
    };
    const ViteConnection = {
      publication: '_meteor_vite',
      methods: {
        refreshConfig: '_meteor_vite_refresh_config'
      },
      configSelector: {
        _id: 'viteConfig'
      }
    };
    async function getConfig() {
      var _config$resolvedUrls, _config$resolvedUrls$, _config$resolvedUrls2, _config$resolvedUrls3;
      const viteConfig = await MeteorViteConfig.findOneAsync(ViteConnection.configSelector);
      const config = viteConfig || runtimeConfig;
      let baseUrl = ((_config$resolvedUrls = config.resolvedUrls) === null || _config$resolvedUrls === void 0 ? void 0 : (_config$resolvedUrls$ = _config$resolvedUrls.network) === null || _config$resolvedUrls$ === void 0 ? void 0 : _config$resolvedUrls$[0]) || ((_config$resolvedUrls2 = config.resolvedUrls) === null || _config$resolvedUrls2 === void 0 ? void 0 : (_config$resolvedUrls3 = _config$resolvedUrls2.local) === null || _config$resolvedUrls3 === void 0 ? void 0 : _config$resolvedUrls3[0]) || "http://localhost:".concat(config.port);
      if (process.env.METEOR_VITE_HOST) {
        baseUrl = "".concat(process.env.METEOR_VITE_PROTOCOL || 'http', "://").concat(process.env.METEOR_VITE_HOST, ":").concat(process.env.METEOR_VITE_PORT || config.port);
      }
      // Strip any trailing '/' characters
      baseUrl = baseUrl.replace(/\/+$/g, '');
      return _objectSpread(_objectSpread({}, config), {}, {
        baseUrl,
        age: Date.now() - config.lastUpdate
      });
    }
    async function setConfig(config) {
      Object.assign(runtimeConfig, config, ViteConnection.configSelector, {
        lastUpdate: Date.now()
      });
      if (runtimeConfig.port && runtimeConfig.host && runtimeConfig.entryFile) {
        runtimeConfig.ready = true;
      }
      await MeteorViteConfig.upsertAsync(ViteConnection.configSelector, runtimeConfig);
      return runtimeConfig;
    }
    if (Meteor.isDevelopment) {
      module1.runSetters(MeteorViteConfig = new Mongo.Collection(ViteConnection.publication, {
        connection: null
      }), ["MeteorViteConfig"]);
    }
    const logLabel = Meteor.isClient ? "[Meteor-Vite] \u26A1 " : '⚡  ';
    const DevConnectionLog = {
      _logToScreen(message) {
        var _document$querySelect;
        if (!Meteor.isClient) return;
        const messageNode = document.createElement('div');
        messageNode.innerText = message;
        (_document$querySelect = document.querySelector('.vite-status-text')) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.prepend(messageNode);
      },
      info: function (message) {
        DevConnectionLog._logToScreen(" \u26A1 ".concat(message));
        for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          params[_key - 1] = arguments[_key];
        }
        console.info("".concat(logLabel, " ").concat(message), ...params);
      },
      debug: function (message) {
        DevConnectionLog._logToScreen(" \u26A1 ".concat(message));
        for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          params[_key2 - 1] = arguments[_key2];
        }
        console.debug("".concat(logLabel, " ").concat(message), ...params);
      },
      error: function (message) {
        for (var _len3 = arguments.length, params = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          params[_key3 - 1] = arguments[_key3];
        }
        for (const param of params) {
          if (param instanceof Error && param.stack) {
            DevConnectionLog._logToScreen(param.stack);
          }
        }
        DevConnectionLog._logToScreen(" \u26A1 ".concat(message));
        console.error("".concat(logLabel, " ").concat(message), ...params);
      }
    };
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"utility":{"AnsiColor.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/utility/AnsiColor.ts                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  AnsiColor: () => AnsiColor
});
function defineColor(prefix, suffix) {
  return message => {
    return "".concat(prefix).concat(message).concat(suffix);
  };
}
const AnsiColor = {
  dim: defineColor('\x1b[2m', '\x1b[22m'),
  green: defineColor('\x1b[32m', '\x1b[39m'),
  blue: defineColor('\x1b[34m', '\x1b[39m'),
  red: defineColor('\x1b[31m', '\x1b[39m')
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"DDPLogger.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/utility/DDPLogger.ts                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let pc;
    module.link("picocolors", {
      default(v) {
        pc = v;
      }
    }, 0);
    let Methods;
    module.link("../api/Endpoints", {
      Methods(v) {
        Methods = v;
      }
    }, 1);
    let inspect;
    module.link("node:util", {
      inspect(v) {
        inspect = v;
      }
    }, 2);
    let AnsiColor;
    module.link("./AnsiColor", {
      AnsiColor(v) {
        AnsiColor = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class DDPLogger {
      constructor() {
        this.type = 'log:shared';
        if (Meteor.isServer) {
          this.type = 'log:client';
        }
      }
      send(log) {
        const document = Object.assign({}, log, {
          type: this.type,
          message: [log.message, ...this.serializeArgs(log.args)].join(' ')
        });
        if (!Meteor.isServer) {
          Meteor.callAsync('meteor-vite:log', document).catch(error => {
            console.error('Failed to log message', error);
          });
          return;
        }
        Methods['meteor-vite:log'](document).catch(error => {
          console.error('Failed to log message', error);
        });
      }
      styleMessage(data) {
        const prefix = data.sender ? AnsiColor.dim("[".concat(data.sender, "]")) + ' ' : '';
        const message = "\u26A1  ".concat(prefix).concat(data.message);
        switch (data.level) {
          case 'info':
            return pc.blue(message);
          case 'error':
            return pc.red(message);
          case 'warn':
            return pc.yellow(message);
          case 'success':
            return pc.green(message);
          case 'debug':
            return pc.dim(pc.blue(message));
        }
      }
      serializeArgs(args) {
        return args.map(data => {
          return inspect(data, {
            depth: 2,
            colors: true
          });
        });
      }
      print(log) {
        var _this = this;
        const levels = {
          info: function (message) {
            for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
              args[_key - 1] = arguments[_key];
            }
            return console.info(_this.styleMessage({
              message: String(message),
              level: 'info',
              sender: log.sender
            }), ...args);
          },
          error: function (message) {
            for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
              args[_key2 - 1] = arguments[_key2];
            }
            return console.error(_this.styleMessage({
              message: String(message),
              level: 'error',
              sender: log.sender
            }), ...args);
          },
          warn: function (message) {
            for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
              args[_key3 - 1] = arguments[_key3];
            }
            return console.warn(_this.styleMessage({
              message: String(message),
              level: 'warn',
              sender: log.sender
            }), ...args);
          },
          success: function (message) {
            for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
              args[_key4 - 1] = arguments[_key4];
            }
            return console.log(_this.styleMessage({
              message: String(message),
              level: 'success',
              sender: log.sender
            }), ...args);
          },
          debug: function (message) {
            for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
              args[_key5 - 1] = arguments[_key5];
            }
            return console.debug(_this.styleMessage({
              message: String(message),
              level: 'debug',
              sender: log.sender
            }), ...args);
          }
        };
        if (log.level in levels) {
          return levels[log.level](log.message);
        }
        console.error('Unknown log level', log);
      }
      info(message) {
        for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
          args[_key6 - 1] = arguments[_key6];
        }
        this.send({
          message,
          args,
          level: 'info'
        });
      }
      error(message) {
        for (var _len7 = arguments.length, args = new Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
          args[_key7 - 1] = arguments[_key7];
        }
        this.send({
          message,
          args,
          level: 'error'
        });
      }
      warn(message) {
        for (var _len8 = arguments.length, args = new Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
          args[_key8 - 1] = arguments[_key8];
        }
        this.send({
          message,
          args,
          level: 'warn'
        });
      }
      success(message) {
        for (var _len9 = arguments.length, args = new Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
          args[_key9 - 1] = arguments[_key9];
        }
        this.send({
          message,
          args,
          level: 'success'
        });
      }
      debug(message) {
        for (var _len10 = arguments.length, args = new Array(_len10 > 1 ? _len10 - 1 : 0), _key10 = 1; _key10 < _len10; _key10++) {
          args[_key10 - 1] = arguments[_key10];
        }
        this.send({
          message,
          args,
          level: 'debug'
        });
      }
    }
    module.exportDefault(new DDPLogger());
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Errors.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/utility/Errors.ts                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  MeteorViteError: () => MeteorViteError
});
class MeteorViteError extends Error {
  constructor(message, details) {
    super("\u26A1  ".concat(message),
    // @ts-expect-error Might or might not be supported depending on Meteor's node version.
    details);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Helpers.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/utility/Helpers.ts                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module1.export({
      msToHumanTime: () => msToHumanTime,
      posixPath: () => posixPath,
      getTempDir: () => getTempDir,
      getDevServerHost: () => getDevServerHost,
      getMeteorRuntimeConfig: () => getMeteorRuntimeConfig,
      getBuildConfig: () => getBuildConfig
    });
    let cwd, getProjectPackageJson;
    module1.link("../workers", {
      cwd(v) {
        cwd = v;
      },
      getProjectPackageJson(v) {
        getProjectPackageJson = v;
      }
    }, 0);
    let Path;
    module1.link("node:path", {
      default(v) {
        Path = v;
      }
    }, 1);
    let OS;
    module1.link("node:os", {
      default(v) {
        OS = v;
      }
    }, 2);
    let FS;
    module1.link("node:fs", {
      default(v) {
        FS = v;
      }
    }, 3);
    let MeteorViteError;
    module1.link("./Errors", {
      MeteorViteError(v) {
        MeteorViteError = v;
      }
    }, 4);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function msToHumanTime(milliseconds) {
      const duration = {
        count: milliseconds,
        type: 'ms'
      };
      if (milliseconds > 1000) {
        duration.count = milliseconds / 1000;
        duration.type = 's';
      }
      if (duration.type === 's' && duration.count > 60) {
        duration.type = 'min';
        duration.count = duration.count / 60;
      }
      return "".concat(Math.round(duration.count * 100) / 100).concat(duration.type);
    }
    function posixPath(filePath) {
      return filePath.split(Path.sep).join('/');
    }
    function getTempDir() {
      var _packageJson$meteor, _packageJson$meteor$v;
      const packageJson = getProjectPackageJson();
      const tempRootDir = (packageJson === null || packageJson === void 0 ? void 0 : (_packageJson$meteor = packageJson.meteor) === null || _packageJson$meteor === void 0 ? void 0 : (_packageJson$meteor$v = _packageJson$meteor.vite) === null || _packageJson$meteor$v === void 0 ? void 0 : _packageJson$meteor$v.tempBuildDir) || OS.tmpdir();
      try {
        const tempDir = Path.resolve(tempRootDir, 'meteor-vite', packageJson.name);
        FS.mkdirSync(tempDir, {
          recursive: true
        });
        return tempDir;
      } catch (error) {
        console.warn(new MeteorViteError("Unable to set up temp directory for meteor-vite bundles. Will use node_modules instead", {
          cause: error
        }));
        return Path.resolve(cwd, 'node_modules', '.vite-meteor-temp');
      }
    }
    function getDevServerHost() {
      var _process$argv$join$ma;
      let {
        portString,
        hostname
      } = ((_process$argv$join$ma = process.argv.join(' ').match(/--port[\s=](?<hostname>[\d\w.]+:)?(?<portString>[\d]+)/)) === null || _process$argv$join$ma === void 0 ? void 0 : _process$argv$join$ma.groups) || {};
      const {
        METEOR_PORT,
        DDP_DEFAULT_CONNECTION_URL,
        MOBILE_DDP_URL
      } = process.env;
      if (!portString && METEOR_PORT) {
        portString = METEOR_PORT;
      }
      if (!portString && DDP_DEFAULT_CONNECTION_URL) {
        var _DDP_DEFAULT_CONNECTI;
        const {
          port,
          host
        } = (DDP_DEFAULT_CONNECTION_URL === null || DDP_DEFAULT_CONNECTION_URL === void 0 ? void 0 : (_DDP_DEFAULT_CONNECTI = DDP_DEFAULT_CONNECTION_URL.match(/\/\/(?<host>[\d\w\-_.]+):(?<port>\d+)/)) === null || _DDP_DEFAULT_CONNECTI === void 0 ? void 0 : _DDP_DEFAULT_CONNECTI.groups) || {
          port: '',
          host: ''
        };
        portString = port;
        hostname = host;
      }
      if (!portString && MOBILE_DDP_URL) {
        var _MOBILE_DDP_URL$match;
        const {
          port
        } = (MOBILE_DDP_URL === null || MOBILE_DDP_URL === void 0 ? void 0 : (_MOBILE_DDP_URL$match = MOBILE_DDP_URL.match(/:(?<port>\d+)/)) === null || _MOBILE_DDP_URL$match === void 0 ? void 0 : _MOBILE_DDP_URL$match.groups) || {
          port: ''
        };
        portString = port;
      }
      const port = parseInt(portString);
      if (Number.isNaN(port)) {
        console.warn(new MeteorViteError("Unable to determine the port for your Meteor development server. We're going to assume it's localhost:3000. If you're using a different port specify it using the METEOR_PORT environment variable so that Vite can function correctly. E.g. METEOR_PORT=3030"));
        return {
          fallback: true,
          host: 'localhost',
          port: 3000
        };
      }
      return {
        fallback: false,
        host: hostname || 'localhost',
        port
      };
    }
    function getMeteorRuntimeConfig() {
      var _meteor_bootstrap__, _meteor_bootstrap__$c;
      const appId = (_meteor_bootstrap__ = __meteor_bootstrap__) === null || _meteor_bootstrap__ === void 0 ? void 0 : (_meteor_bootstrap__$c = _meteor_bootstrap__.configJson) === null || _meteor_bootstrap__$c === void 0 ? void 0 : _meteor_bootstrap__$c.appId;
      const {
        port,
        host,
        fallback
      } = getDevServerHost();
      if (!appId) {
        console.warn(new MeteorViteError('Unable to retrieve your Meteor App ID. (`./.meteor/.id`) This is probably fine in most cases, but can lead to issues when running multiple concurrent instances. Please do report this issue on GitHub 🙏 https://github.com/JorgenVatle/meteor-vite/issues'));
      }
      return {
        host,
        port,
        appId,
        fallback
      };
    }
    function getBuildConfig() {
      var _packageJson$meteor2, _packageJson$meteor2$;
      const packageJson = getProjectPackageJson();
      const tempDir = getTempDir();
      // Not in a project (publishing the package or in temporary Meteor build)
      const pluginEnabled = !process.env.VITE_METEOR_DISABLED && !process.env.METEOR_VITE_DISABLED;
      /**
       * Meteor client mainModule as specified in the package.json file. This is where we will push the final Vite bundle.
       */
      const meteorMainModule = (_packageJson$meteor2 = packageJson.meteor) === null || _packageJson$meteor2 === void 0 ? void 0 : (_packageJson$meteor2$ = _packageJson$meteor2.mainModule) === null || _packageJson$meteor2$ === void 0 ? void 0 : _packageJson$meteor2$.client;
      /**
       * Destination directory inside the source Meteor project for the transpiled Vite bundle.
       * This is what is fed into Meteor at the end of the build process.
       */
      const viteOutSrcDir = Path.join(cwd, '_vite-bundle', 'client');
      /**
       * Check if Meteor is running using the --production flag and not actually bundling for production.
       * This is important to check for as we normally clean up the files created for production once our compiler
       * plugin finishes.
       */
      const isSimulatedProduction = process.argv.includes('--production');
      /**
       * Intermediary Meteor project - used to build the Vite bundle in a safe environment where all the Meteor
       * packages from the source project are available to our Vite plugin to analyze for creating ESM export stubs.
       */
      const tempMeteorProject = Path.resolve(tempDir, 'meteor'); // Temporary Meteor project source
      const tempMeteorOutDir = Path.join(tempDir, 'bundle', 'meteor'); // Temporary Meteor production bundle
      if (pluginEnabled && !packageJson.meteor.mainModule) {
        throw new MeteorViteError('No meteor main module found, please add meteor.mainModule.client to your package.json');
      }
      return {
        packageJson,
        tempMeteorOutDir,
        tempMeteorProject,
        isSimulatedProduction,
        meteorMainModule,
        pluginEnabled,
        viteOutSrcDir
      };
    }
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Logger.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/utility/Logger.ts                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let pc;
    module.link("picocolors", {
      default(v) {
        pc = v;
      }
    }, 0);
    let inspect;
    module.link("node:util", {
      inspect(v) {
        inspect = v;
      }
    }, 1);
    let fs;
    module.link("node:fs", {
      default(v) {
        fs = v;
      }
    }, 2);
    let performance;
    module.link("node:perf_hooks", {
      performance(v) {
        performance = v;
      }
    }, 3);
    let msToHumanTime;
    module.link("./Helpers", {
      msToHumanTime(v) {
        msToHumanTime = v;
      }
    }, 4);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class BuildLogger {
      constructor() {
        this.debugEnabled = false;
        this.github = new GithubActions();
        const debugEnv = process.env.DEBUG || 'false';
        this.debugEnabled = !!debugEnv.trim().split(/\s+/).find(field => {
          return BuildLogger.DEBUG_ENV_TRIGGERS.includes(field.trim());
        });
      }
      info(message) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        console.info(pc.blue("\u26A1  ".concat(message)), ...args);
      }
      error(message) {
        this.github.annotate(message, {});
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        console.error(pc.red("\u26A1  ".concat(message)), ...args);
      }
      warn(message) {
        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }
        console.warn(pc.yellow("\u26A1  ".concat(message)), ...args);
      }
      success(message) {
        for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          args[_key4 - 1] = arguments[_key4];
        }
        console.log(pc.green("\u26A1  ".concat(message)), ...args);
      }
      debug(message) {
        if (!this.debugEnabled) {
          return;
        }
        for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
          args[_key5 - 1] = arguments[_key5];
        }
        console.debug(pc.dim(pc.blue("\u26A1  ".concat(message))), ...args);
      }
      startProfiler() {
        const startTime = performance.now();
        return {
          complete: message => {
            const messageWithTiming = "".concat(message, " in ").concat(msToHumanTime(performance.now() - startTime));
            this.success(messageWithTiming);
            this.github.summarize(messageWithTiming);
          }
        };
      }
    }
    BuildLogger.DEBUG_ENV_TRIGGERS = ['true', '*', 'vite-bundler:*'];
    class GithubActions {
      constructor() {
        this.summaryLines = [];
        this.stepSummaryFile = void 0;
        this.useAnnotations = void 0;
        if (process.env.METEOR_VITE_DISABLE_CI_SUMMARY === 'true') {
          return;
        }
        this.stepSummaryFile = process.env.GITHUB_STEP_SUMMARY;
        this.useAnnotations = !!this.stepSummaryFile;
      }
      annotate(message) {
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (!this.useAnnotations) {
          return;
        }
        const data = Object.entries(options).map(_ref => {
          let [key, value] = _ref;
          return "".concat(key, "=\"").concat(value, "\"");
        });
        console.log("::notice ".concat(data.join(), "::\u26A1  ").concat(message));
      }
      summarize(message) {
        if (!this.stepSummaryFile) {
          return;
        }
        for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
          args[_key6 - 1] = arguments[_key6];
        }
        const formattedArgs = args.length ? inspect(args) : '';
        this.summaryLines.push("\u26A1  ".concat(message, " ").concat(formattedArgs));
        const summary = ['```log', 'Meteor-Vite build metrics:', ...this.summaryLines, '```', '', '<details>', '<summary>Generated by Meteor Vite</summary>', '\n', 'Step summary generated by [`jorgenvatle:vite-bundler`](https://github.com/JorgenVatle/meteor-vite)', 'You can disable this behaviour with an environment variable: `METEOR_VITE_DISABLE_CI_SUMMARY=false`', '', '</details>', ''];
        fs.writeFileSync(this.stepSummaryFile, summary.join('\n'));
      }
    }
    module.exportDefault(new BuildLogger());
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"vite-boilerplate":{"common.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/vite-boilerplate/common.ts                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  ViteBoilerplate: () => ViteBoilerplate
});
class ViteBoilerplate {}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"development.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/vite-boilerplate/development.ts                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      ViteDevServerWorker: () => ViteDevServerWorker
    });
    let fetch;
    module.link("meteor/fetch", {
      fetch(v) {
        fetch = v;
      }
    }, 0);
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 1);
    let DDP_IPC;
    module.link("../api/DDP-IPC", {
      DDP_IPC(v) {
        DDP_IPC = v;
      }
    }, 2);
    let DevConnectionLog, getConfig, MeteorViteConfig, setConfig, ViteConnection, ViteDevScripts;
    module.link("../loading/vite-connection-handler", {
      DevConnectionLog(v) {
        DevConnectionLog = v;
      },
      getConfig(v) {
        getConfig = v;
      },
      MeteorViteConfig(v) {
        MeteorViteConfig = v;
      },
      setConfig(v) {
        setConfig = v;
      },
      ViteConnection(v) {
        ViteConnection = v;
      },
      ViteDevScripts(v) {
        ViteDevScripts = v;
      }
    }, 3);
    let getBuildConfig, getMeteorRuntimeConfig;
    module.link("../utility/Helpers", {
      getBuildConfig(v) {
        getBuildConfig = v;
      },
      getMeteorRuntimeConfig(v) {
        getMeteorRuntimeConfig = v;
      }
    }, 4);
    let Logger;
    module.link("../utility/Logger", {
      default(v) {
        Logger = v;
      }
    }, 5);
    let createWorkerFork, getProjectPackageJson, isMeteorIPCMessage;
    module.link("../workers", {
      createWorkerFork(v) {
        createWorkerFork = v;
      },
      getProjectPackageJson(v) {
        getProjectPackageJson = v;
      },
      isMeteorIPCMessage(v) {
        isMeteorIPCMessage = v;
      }
    }, 6);
    let ViteBoilerplate;
    module.link("./common", {
      ViteBoilerplate(v) {
        ViteBoilerplate = v;
      }
    }, 7);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class ViteDevServerWorker extends ViteBoilerplate {
      constructor() {
        super();
        this.viteServer = void 0;
      }
      start() {
        if (Meteor.isProduction) {
          throw new Error('Tried to start Vite dev server in production!');
        }
        if (!getBuildConfig().pluginEnabled) {
          Logger.warn('Meteor Vite plugin disabled. Aborting dev server startup');
          return;
        }
        DevConnectionLog.info('Starting Vite server...');
        const ipc = new DDP_IPC({
          async viteConfig(config) {
            const {
              ready
            } = await setConfig(config);
            if (ready) {
              DevConnectionLog.info("Meteor-Vite ready for connections!");
            }
          },
          refreshNeeded() {
            DevConnectionLog.info('Some lazy-loaded packages were imported, please refresh');
          }
        });
        const viteServer = this.viteServer = createWorkerFork({
          viteConfig: ipc.responseHooks.viteConfig,
          refreshNeeded: ipc.responseHooks.refreshNeeded
        }, {
          detached: true,
          ipc
        });
        Meteor.publish(ViteConnection.publication, () => {
          return MeteorViteConfig.find(ViteConnection.configSelector);
        });
        Meteor.methods({
          [ViteConnection.methods.refreshConfig]() {
            DevConnectionLog.info('Refreshing configuration from Vite dev server...');
            viteServer.call({
              method: 'vite.server.getConfig',
              params: []
            });
            return getConfig();
          }
        });
        viteServer.call({
          method: 'vite.server.start',
          params: [{
            packageJson: getProjectPackageJson(),
            meteorParentPid: process.ppid,
            meteorConfig: getMeteorRuntimeConfig()
          }]
        });
        // Forward IPC messages from the `meteor-tool` parent process to the Vite server
        // Used to notify our Vite build plugin of things like the client bundle or Atmosphere packages being rebuilt.
        process.on('message', async message => {
          if (!isMeteorIPCMessage(message)) return;
          const {
            baseUrl,
            ready
          } = await getConfig();
          if (!ready) return;
          await fetch("".concat(baseUrl, "/__meteor__/ipc-message"), {
            method: 'POST',
            body: JSON.stringify(message)
          }).catch(error => {
            console.error(error);
          });
        });
      }
      async getBoilerplate() {
        const scripts = new ViteDevScripts(await getConfig());
        return {
          dynamicBody: await scripts.stringTemplate()
        };
      }
    }
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"production.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jorgenvatle_vite-bundler/src/vite-boilerplate/production.ts                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module1.export({
      ViteProductionBoilerplate: () => ViteProductionBoilerplate
    });
    let FS;
    module1.link("fs", {
      default(v) {
        FS = v;
      }
    }, 0);
    let Meteor;
    module1.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 1);
    let WebApp, WebAppInternals;
    module1.link("meteor/webapp", {
      WebApp(v) {
        WebApp = v;
      },
      WebAppInternals(v) {
        WebAppInternals = v;
      }
    }, 2);
    let Path;
    module1.link("path", {
      default(v) {
        Path = v;
      }
    }, 3);
    let Util;
    module1.link("util", {
      default(v) {
        Util = v;
      }
    }, 4);
    let Logger;
    module1.link("../utility/Logger", {
      default(v) {
        Logger = v;
      }
    }, 5);
    let ViteBoilerplate;
    module1.link("./common", {
      ViteBoilerplate(v) {
        ViteBoilerplate = v;
      }
    }, 6);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class ViteProductionBoilerplate extends ViteBoilerplate {
      constructor() {
        super();
      }
      get assetDir() {
        return '/' + this.viteManifest.assetsDir.replace(/^\/+/, '');
      }
      get baseUrl() {
        return this.viteManifest.base;
      }
      filePath(file) {
        return "".concat(this.baseUrl.replace(/\/?$/, ''), "/").concat(file);
      }
      getBoilerplate() {
        return {
          dynamicHead: this.dynamicHead,
          dynamicBody: ''
        };
      }
      get dynamicHead() {
        const imports = this.imports;
        const lines = [];
        const prefetchArray = [];
        for (const file of imports.stylesheets) {
          lines.push("<link rel=\"stylesheet\" crossorigin href=\"".concat(this.filePath(file), "\">"));
        }
        for (const file of imports.modules) {
          lines.push("<script type=\"module\" crossorigin src=\"".concat(this.filePath(file), "\"></script>"));
        }
        for (const file of imports.modulePreload) {
          lines.push("<link rel=\"modulepreload\" crossorigin href=\"".concat(this.filePath(file), "\">"));
        }
        for (const file of imports.moduleLazyPrefetch) {
          prefetchArray.push({
            href: this.filePath(file)
          });
        }
        for (const file of imports.cssLazyPrefetch) {
          prefetchArray.push({
            href: this.filePath(file),
            as: 'style'
          });
        }
        function lazyPrefetch(assets) {
          window.addEventListener('load', () => window.setTimeout(() => {
            const makeLink = asset => {
              const link = document.createElement('link');
              link.rel = 'prefetch';
              link.fetchPriority = 'low';
              Object.entries(asset).forEach(_ref => {
                let [key, value] = _ref;
                link.setAttribute(key, value);
              });
              return link;
            };
            const loadNext = (assets, count) => window.setTimeout(() => {
              if (count > assets.length) {
                count = assets.length;
                if (count === 0) {
                  return;
                }
              }
              const fragment = new DocumentFragment();
              while (count > 0) {
                const asset = assets.shift();
                if (!asset) {
                  break;
                }
                const link = makeLink(asset);
                fragment.append(link);
                count--;
                if (assets.length) {
                  link.onload = () => loadNext(assets, 1);
                  link.onerror = () => loadNext(assets, 1);
                }
              }
              document.head.append(fragment);
            });
            loadNext(assets, 3);
          }));
        }
        if (!process.env.DISABLE_FULL_APP_PREFETCH) {
          lines.push("<script type=\"text/javascript\">", "".concat(lazyPrefetch.toString(), ";"), "lazyPrefetch(".concat(JSON.stringify(prefetchArray), ")"), "</script>");
        }
        return lines.join('\n');
      }
      get viteManifest() {
        var _Meteor$settings$vite;
        if ((_Meteor$settings$vite = Meteor.settings.vite) !== null && _Meteor$settings$vite !== void 0 && _Meteor$settings$vite.manifest) {
          return Meteor.settings.vite.manifest;
        }
        // Search Meteor's program.json file for Vite's manifest.json file
        const viteManifestInfo = WebApp.clientPrograms['web.browser'].manifest.find(_ref2 => {
          let {
            path
          } = _ref2;
          return path.endsWith('vite-manifest.json');
        });
        if (!viteManifestInfo) {
          throw new Error('Could not find Vite manifest in Meteor client program manifest');
        }
        // Read and cache the contents of the vite manifest.json file.
        const viteManifestPath = Path.join(__meteor_bootstrap__.serverDir, '..', 'web.browser', viteManifestInfo.path);
        const manifest = JSON.parse(FS.readFileSync(viteManifestPath, 'utf8'));
        Meteor.settings.vite = {
          manifest
        };
        return manifest;
      }
      /**
       * Mark assets built by Vite as cacheable in Meteor's program.json file for both legacy and modern browsers.
       * Because of the way Meteor handles non-cacheable assets, headers are added that make it tricky to cache with
       * a standard reverse proxy config. You would have to explicitly override the caching headers for all files served
       * by meteor at /vite-assets.
       *
       * The default behavior of Meteor would be to set a max-age header of 0. Which would of course result in a lot of
       * load being put on both your clients and your server.
       */
      makeViteAssetsCacheable() {
        const archs = ['web.browser', 'web.browser.legacy'];
        for (const arch of archs) {
          const files = WebAppInternals.staticFilesByArch[arch] || {};
          // Override cacheable flag for any assets built by Vite.
          // Meteor will by default set this to false for asset files.
          Object.entries(files).forEach(_ref3 => {
            let [path, file] = _ref3;
            if (!path.startsWith("".concat(this.assetDir, "/"))) {
              return;
            }
            if (path.endsWith('.js')) {
              file.cacheable = true;
            }
            if (path.endsWith('.css')) {
              file.cacheable = true;
            }
          });
        }
      }
      get imports() {
        var _Meteor$settings$vite2;
        if ((_Meteor$settings$vite2 = Meteor.settings.vite) !== null && _Meteor$settings$vite2 !== void 0 && _Meteor$settings$vite2.imports) {
          return Meteor.settings.vite.imports;
        }
        const manifest = this.viteManifest;
        const stylesheets = new Set();
        const modules = new Set();
        const modulePreload = new Set();
        const moduleLazyPrefetch = new Set();
        const cssLazyPrefetch = new Set();
        function preloadImports(imports) {
          for (const path of imports) {
            var _chunk$css;
            const chunk = manifest.files[path];
            if (!chunk) {
              continue;
            }
            if (modulePreload.has(chunk.file)) {
              continue;
            }
            moduleLazyPrefetch.delete(chunk.file);
            modulePreload.add(chunk.file);
            (_chunk$css = chunk.css) === null || _chunk$css === void 0 ? void 0 : _chunk$css.forEach(css => stylesheets.add(css));
            preloadImports(chunk.imports || []);
          }
        }
        // Todo: Preload all assets app assets in the background after loading essential assets.
        //  rel="preload" fetchPriority="low"
        for (const [name, chunk] of Object.entries(manifest.files)) {
          var _chunk$css2;
          if (!chunk.isEntry) {
            if (chunk.file.endsWith('.js')) {
              moduleLazyPrefetch.add(chunk.file);
            }
            if (chunk.file.endsWith('.css')) {
              cssLazyPrefetch.add(chunk.file);
            }
            continue;
          }
          if (chunk.file.endsWith('.js')) {
            moduleLazyPrefetch.delete(chunk.file);
            modules.add(chunk.file);
          }
          if (chunk.file.endsWith('.css')) {
            stylesheets.add(chunk.file);
          }
          preloadImports(chunk.imports || []);
          (_chunk$css2 = chunk.css) === null || _chunk$css2 === void 0 ? void 0 : _chunk$css2.forEach(css => {
            stylesheets.add(css);
            cssLazyPrefetch.delete(css);
          });
        }
        const imports = {
          stylesheets,
          modules,
          modulePreload,
          moduleLazyPrefetch,
          cssLazyPrefetch
        };
        Logger.debug('Parsed Vite manifest imports', Util.inspect({
          imports,
          manifest,
          modules
        }, {
          depth: 4,
          colors: true
        }));
        Object.assign(Meteor.settings.vite, {
          imports
        });
        return imports;
      }
    }
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"node_modules":{"picocolors":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/jorgenvatle_vite-bundler/node_modules/picocolors/package.json                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "picocolors",
  "version": "1.1.0",
  "main": "./picocolors.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"picocolors.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/jorgenvatle_vite-bundler/node_modules/picocolors/picocolors.js                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/jorgenvatle:vite-bundler/src/server.ts"
  ],
  mainModulePath: "/node_modules/meteor/jorgenvatle:vite-bundler/src/server.ts"
}});

//# sourceURL=meteor://💻app/packages/jorgenvatle_vite-bundler.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvam9yZ2VudmF0bGU6dml0ZS1idW5kbGVyL3NyYy9zZXJ2ZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2pvcmdlbnZhdGxlOnZpdGUtYnVuZGxlci9zcmMvd29ya2Vycy50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvam9yZ2VudmF0bGU6dml0ZS1idW5kbGVyL3NyYy9hcGkvQ29sbGVjdGlvbnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2pvcmdlbnZhdGxlOnZpdGUtYnVuZGxlci9zcmMvYXBpL0REUC1JUEMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2pvcmdlbnZhdGxlOnZpdGUtYnVuZGxlci9zcmMvYXBpL0VuZHBvaW50cy50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvam9yZ2VudmF0bGU6dml0ZS1idW5kbGVyL3NyYy9hcGkvV2F0Y2hlcnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2pvcmdlbnZhdGxlOnZpdGUtYnVuZGxlci9zcmMvbG9hZGluZy92aXRlLWNvbm5lY3Rpb24taGFuZGxlci50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvam9yZ2VudmF0bGU6dml0ZS1idW5kbGVyL3NyYy91dGlsaXR5L0Fuc2lDb2xvci50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvam9yZ2VudmF0bGU6dml0ZS1idW5kbGVyL3NyYy91dGlsaXR5L0REUExvZ2dlci50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvam9yZ2VudmF0bGU6dml0ZS1idW5kbGVyL3NyYy91dGlsaXR5L0Vycm9ycy50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvam9yZ2VudmF0bGU6dml0ZS1idW5kbGVyL3NyYy91dGlsaXR5L0hlbHBlcnMudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2pvcmdlbnZhdGxlOnZpdGUtYnVuZGxlci9zcmMvdXRpbGl0eS9Mb2dnZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2pvcmdlbnZhdGxlOnZpdGUtYnVuZGxlci9zcmMvdml0ZS1ib2lsZXJwbGF0ZS9jb21tb24udHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2pvcmdlbnZhdGxlOnZpdGUtYnVuZGxlci9zcmMvdml0ZS1ib2lsZXJwbGF0ZS9kZXZlbG9wbWVudC50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvam9yZ2VudmF0bGU6dml0ZS1idW5kbGVyL3NyYy92aXRlLWJvaWxlcnBsYXRlL3Byb2R1Y3Rpb24udHMiXSwibmFtZXMiOlsiV2ViQXBwIiwiV2ViQXBwSW50ZXJuYWxzIiwibW9kdWxlIiwibGluayIsInYiLCJMb2dnZXIiLCJkZWZhdWx0IiwiVml0ZURldlNlcnZlcldvcmtlciIsIlZpdGVQcm9kdWN0aW9uQm9pbGVycGxhdGUiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsIndvcmtlciIsIk1ldGVvciIsImlzUHJvZHVjdGlvbiIsInN0YXJ0dXAiLCJzdGFydCIsInJlZ2lzdGVyQm9pbGVycGxhdGVEYXRhQ2FsbGJhY2siLCJyZXF1ZXN0IiwiZGF0YSIsImR5bmFtaWNCb2R5IiwiZHluYW1pY0hlYWQiLCJnZXRCb2lsZXJwbGF0ZSIsImNvbmNhdCIsImRlYnVnIiwiYmFzZVVybCIsIm1ha2VWaXRlQXNzZXRzQ2FjaGVhYmxlIiwiY29ubmVjdEhhbmRsZXJzIiwidXNlIiwiYXNzZXREaXIiLCJyZXEiLCJyZXMiLCJuZXh0Iiwid3JpdGVIZWFkIiwid3JpdGUiLCJ3YXJuIiwib3JpZ2luYWxVcmwiLCJlbmQiLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiLCJleHBvcnQiLCJjcmVhdGVXb3JrZXJGb3JrIiwiaXNNZXRlb3JJUENNZXNzYWdlIiwiY3dkIiwid29ya2VyUGF0aCIsImdldFByb2plY3RQYWNrYWdlSnNvbiIsImZvcmsiLCJSYW5kb20iLCJQYXRoIiwiRlMiLCJwYyIsImdldE1ldGVvclJ1bnRpbWVDb25maWciLCJob29rcyIsIm9wdGlvbnMiLCJfb3B0aW9ucyRkZXRhY2hlZCIsIl9vcHRpb25zJGlwYyIsIl9vcHRpb25zJGlwYzIiLCJleGlzdHNTeW5jIiwiTWV0ZW9yVml0ZUVycm9yIiwieWVsbG93IiwiY2hpbGQiLCJzdGRpbyIsImRldGFjaGVkIiwiZW52IiwicHJlcGFyZVdvcmtlckVudiIsImlwY092ZXJEZHAiLCJpcGMiLCJhY3RpdmUiLCJ1bnJlZiIsImhvb2tNZXRob2RzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJtZXRob2QiLCJob29rIiwiYmluZEVudmlyb25tZW50Iiwid29ya2VyQ29uZmlnSG9vayIsIndvcmtlckNvbmZpZyIsInBpZCIsImxpc3RlbmluZyIsInByb2Nlc3MiLCJFTkFCTEVfREVCVUdfTE9HUyIsImNvbnNvbGUiLCJsb2ciLCJqb2luIiwic2V0UmVzcG9uc2VIb29rcyIsIm9uIiwibWVzc2FnZSIsImtpbmQiLCJjb2RlIiwiZXJyb3IiLCJjb25uZWN0ZWQiLCJjYWxsIiwiX3JlZiIsIl9vcHRpb25zJGlwYzMiLCJfb3B0aW9ucyRpcGM0IiwicGFyYW1zIiwiaWQiLCJzZW5kIiwidHlwZSIsInRvcGljIiwiRXJyb3IiLCJjb25zdHJ1Y3RvciIsIkFycmF5IiwiaXNBcnJheSIsIm5hbWUiLCJfcHJvY2VzcyRlbnYkTUVURU9SX1YiLCJNRVRFT1JfVklURV9DV0QiLCJndWVzc0N3ZCIsImZpbGUiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJwYXRoIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwiX3Byb2Nlc3MkZW52JFBXRCIsIlBXRCIsImluZGV4IiwiaW5kZXhPZiIsInN1YnN0cmluZyIsIl9yZWYyIiwid29ya2VyRW52UHJlZml4IiwiRk9SQ0VfQ09MT1IiLCJNRVRFT1JfTE9DQUxfRElSIiwiU1RBUlRFRF9BVCIsIkRhdGUiLCJub3ciLCJ0b1N0cmluZyIsIk5PREVfRU5WIiwiTUVURU9SX1JVTlRJTUUiLCJmYWxsYmFjayIsImFzc2lnbiIsIkREUF9JUEMiLCJzdHJpbmdpZnkiLCJlbnRyaWVzIiwiX3JlZjMiLCJrZXkiLCJ2YWx1ZSIsInN0YXJ0c1dpdGgiLCJ1blByZWZpeGVkS2V5IiwicmVwbGFjZSIsIlJlZ0V4cCIsIl9vYmplY3RTcHJlYWQiLCJTdGF0dXNDb2xsZWN0aW9uIiwiRGF0YVN0cmVhbUNvbGxlY3Rpb24iLCJJcGNDb2xsZWN0aW9uIiwiTW9uZ28iLCJDb2xsZWN0aW9uIiwiY29ubmVjdGlvbiIsInRyYW5zZm9ybSIsImRvYyIsInJlc3BvbnNlSG9va3MiLCJtZXRob2RzIiwibWV0ZW9yLXZpdGU6aXBjLnJlY2VpdmVkIiwicmVtb3ZlQXN5bmMiLCJwdWJsaXNoIiwiZmluZCIsImluc2VydEFzeW5jIiwiY2F0Y2giLCJNZXRob2RzIiwid2F0Y2hEYXRhU3RyZWFtTG9ncyIsIm1ldGVvci12aXRlOnN0YXR1cy91cGRhdGUiLCJzdGF0dXMiLCJhcHBJZCIsInVwc2VydEFzeW5jIiwiJHNldCIsInVwZGF0ZWRBdCIsIiRzZXRPbkluc2VydCIsImNyZWF0ZWRBdCIsIm1ldGVvci12aXRlOmxvZyIsImlzQ2xpZW50IiwiJGluIiwibGltaXQiLCJzb3J0IiwiRERQTG9nZ2VyIiwid2F0Y2hlckFjdGl2ZSIsInN0YXJ0dXBUaW1lIiwic3Vic2NyaWJlIiwib25SZWFkeSIsIm9uU3RvcCIsIiRndCIsIm9ic2VydmUiLCJhZGRlZCIsImRvY3VtZW50IiwicHJpbnQiLCJtb2R1bGUxIiwiTWV0ZW9yVml0ZUNvbmZpZyIsIlZJVEVfRU5UUllQT0lOVF9TQ1JJUFRfSUQiLCJWSVRFX0NMSUVOVF9TQ1JJUFRfSUQiLCJWaXRlRGV2U2NyaXB0cyIsIlZpdGVDb25uZWN0aW9uIiwiZ2V0Q29uZmlnIiwic2V0Q29uZmlnIiwiRGV2Q29ubmVjdGlvbkxvZyIsImNvbmZpZyIsInVybHMiLCJuZWVkc1JlYWN0UHJlYW1ibGUiLCJlbnRyeXBvaW50VXJsIiwiZW50cnlGaWxlIiwidml0ZUNsaWVudFVybCIsInJlYWN0UmVmcmVzaCIsInBhY2thZ2VKc29uIiwiZGVwZW5kZW5jaWVzIiwiZGV2RGVwZW5kZW5jaWVzIiwic3RyaW5nVGVtcGxhdGUiLCJyZWFkeSIsIkFzc2V0cyIsImdldFRleHRBc3luYyIsImdldFRleHQiLCJtb2R1bGVMaW5lcyIsInVuc2hpZnQiLCJpbmplY3RTY3JpcHRzSW5ET00iLCJpc1NlcnZlciIsImlzRGV2ZWxvcG1lbnQiLCJleGlzdGluZ1NjcmlwdCIsImdldEVsZW1lbnRCeUlkIiwiVGVtcG9yYXJ5RWxlbWVudHMiLCJzcGxhc2hTY3JlZW4iLCJzdHlsZXMiLCJ2aXRlRW50cnlwb2ludCIsImNyZWF0ZUVsZW1lbnQiLCJzcmMiLCJzZXRBdHRyaWJ1dGUiLCJ2aXRlQ2xpZW50Iiwib25lcnJvciIsInNldFRpbWVvdXQiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInJlbG9hZCIsIm9ubG9hZCIsIl9UZW1wb3JhcnlFbGVtZW50cyRzcCIsIl9UZW1wb3JhcnlFbGVtZW50cyRzdCIsImluZm8iLCJyZW1vdmUiLCJib2R5IiwicHJlcGVuZCIsInJ1bnRpbWVDb25maWciLCJob3N0IiwicG9ydCIsImxhc3RVcGRhdGUiLCJwdWJsaWNhdGlvbiIsInJlZnJlc2hDb25maWciLCJjb25maWdTZWxlY3RvciIsIl9pZCIsIl9jb25maWckcmVzb2x2ZWRVcmxzIiwiX2NvbmZpZyRyZXNvbHZlZFVybHMkIiwiX2NvbmZpZyRyZXNvbHZlZFVybHMyIiwiX2NvbmZpZyRyZXNvbHZlZFVybHMzIiwidml0ZUNvbmZpZyIsImZpbmRPbmVBc3luYyIsInJlc29sdmVkVXJscyIsIm5ldHdvcmsiLCJsb2NhbCIsIk1FVEVPUl9WSVRFX0hPU1QiLCJNRVRFT1JfVklURV9QUk9UT0NPTCIsIk1FVEVPUl9WSVRFX1BPUlQiLCJhZ2UiLCJydW5TZXR0ZXJzIiwibG9nTGFiZWwiLCJfbG9nVG9TY3JlZW4iLCJfZG9jdW1lbnQkcXVlcnlTZWxlY3QiLCJtZXNzYWdlTm9kZSIsImlubmVyVGV4dCIsInF1ZXJ5U2VsZWN0b3IiLCJfbGVuIiwiX2tleSIsIl9sZW4yIiwiX2tleTIiLCJfbGVuMyIsIl9rZXkzIiwicGFyYW0iLCJzdGFjayIsIkFuc2lDb2xvciIsImRlZmluZUNvbG9yIiwicHJlZml4Iiwic3VmZml4IiwiZGltIiwiZ3JlZW4iLCJibHVlIiwicmVkIiwiaW5zcGVjdCIsInNlcmlhbGl6ZUFyZ3MiLCJhcmdzIiwiY2FsbEFzeW5jIiwic3R5bGVNZXNzYWdlIiwic2VuZGVyIiwibGV2ZWwiLCJtYXAiLCJkZXB0aCIsImNvbG9ycyIsIl90aGlzIiwibGV2ZWxzIiwiU3RyaW5nIiwic3VjY2VzcyIsIl9sZW40IiwiX2tleTQiLCJfbGVuNSIsIl9rZXk1IiwiX2xlbjYiLCJfa2V5NiIsIl9sZW43IiwiX2tleTciLCJfbGVuOCIsIl9rZXk4IiwiX2xlbjkiLCJfa2V5OSIsIl9sZW4xMCIsIl9rZXkxMCIsImV4cG9ydERlZmF1bHQiLCJkZXRhaWxzIiwibXNUb0h1bWFuVGltZSIsInBvc2l4UGF0aCIsImdldFRlbXBEaXIiLCJnZXREZXZTZXJ2ZXJIb3N0IiwiZ2V0QnVpbGRDb25maWciLCJPUyIsIm1pbGxpc2Vjb25kcyIsImR1cmF0aW9uIiwiY291bnQiLCJNYXRoIiwicm91bmQiLCJmaWxlUGF0aCIsInNwbGl0Iiwic2VwIiwiX3BhY2thZ2VKc29uJG1ldGVvciIsIl9wYWNrYWdlSnNvbiRtZXRlb3IkdiIsInRlbXBSb290RGlyIiwibWV0ZW9yIiwidml0ZSIsInRlbXBCdWlsZERpciIsInRtcGRpciIsInRlbXBEaXIiLCJyZXNvbHZlIiwibWtkaXJTeW5jIiwicmVjdXJzaXZlIiwiY2F1c2UiLCJfcHJvY2VzcyRhcmd2JGpvaW4kbWEiLCJwb3J0U3RyaW5nIiwiaG9zdG5hbWUiLCJhcmd2IiwibWF0Y2giLCJncm91cHMiLCJNRVRFT1JfUE9SVCIsIkREUF9ERUZBVUxUX0NPTk5FQ1RJT05fVVJMIiwiTU9CSUxFX0REUF9VUkwiLCJfRERQX0RFRkFVTFRfQ09OTkVDVEkiLCJfTU9CSUxFX0REUF9VUkwkbWF0Y2giLCJwYXJzZUludCIsIk51bWJlciIsImlzTmFOIiwiX21ldGVvcl9ib290c3RyYXBfXyIsIl9tZXRlb3JfYm9vdHN0cmFwX18kYyIsIl9fbWV0ZW9yX2Jvb3RzdHJhcF9fIiwiY29uZmlnSnNvbiIsIl9wYWNrYWdlSnNvbiRtZXRlb3IyIiwiX3BhY2thZ2VKc29uJG1ldGVvcjIkIiwicGx1Z2luRW5hYmxlZCIsIlZJVEVfTUVURU9SX0RJU0FCTEVEIiwiTUVURU9SX1ZJVEVfRElTQUJMRUQiLCJtZXRlb3JNYWluTW9kdWxlIiwibWFpbk1vZHVsZSIsImNsaWVudCIsInZpdGVPdXRTcmNEaXIiLCJpc1NpbXVsYXRlZFByb2R1Y3Rpb24iLCJpbmNsdWRlcyIsInRlbXBNZXRlb3JQcm9qZWN0IiwidGVtcE1ldGVvck91dERpciIsImZzIiwicGVyZm9ybWFuY2UiLCJCdWlsZExvZ2dlciIsImRlYnVnRW5hYmxlZCIsImdpdGh1YiIsIkdpdGh1YkFjdGlvbnMiLCJkZWJ1Z0VudiIsIkRFQlVHIiwidHJpbSIsImZpZWxkIiwiREVCVUdfRU5WX1RSSUdHRVJTIiwiYW5ub3RhdGUiLCJzdGFydFByb2ZpbGVyIiwic3RhcnRUaW1lIiwiY29tcGxldGUiLCJtZXNzYWdlV2l0aFRpbWluZyIsInN1bW1hcml6ZSIsInN1bW1hcnlMaW5lcyIsInN0ZXBTdW1tYXJ5RmlsZSIsInVzZUFubm90YXRpb25zIiwiTUVURU9SX1ZJVEVfRElTQUJMRV9DSV9TVU1NQVJZIiwiR0lUSFVCX1NURVBfU1VNTUFSWSIsImZvcm1hdHRlZEFyZ3MiLCJwdXNoIiwic3VtbWFyeSIsIndyaXRlRmlsZVN5bmMiLCJWaXRlQm9pbGVycGxhdGUiLCJmZXRjaCIsInZpdGVTZXJ2ZXIiLCJyZWZyZXNoTmVlZGVkIiwibWV0ZW9yUGFyZW50UGlkIiwicHBpZCIsIm1ldGVvckNvbmZpZyIsInNjcmlwdHMiLCJVdGlsIiwidml0ZU1hbmlmZXN0IiwiYXNzZXRzRGlyIiwiYmFzZSIsImltcG9ydHMiLCJsaW5lcyIsInByZWZldGNoQXJyYXkiLCJzdHlsZXNoZWV0cyIsIm1vZHVsZXMiLCJtb2R1bGVQcmVsb2FkIiwibW9kdWxlTGF6eVByZWZldGNoIiwiaHJlZiIsImNzc0xhenlQcmVmZXRjaCIsImFzIiwibGF6eVByZWZldGNoIiwiYXNzZXRzIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm1ha2VMaW5rIiwiYXNzZXQiLCJyZWwiLCJmZXRjaFByaW9yaXR5IiwibG9hZE5leHQiLCJmcmFnbWVudCIsIkRvY3VtZW50RnJhZ21lbnQiLCJzaGlmdCIsImFwcGVuZCIsImhlYWQiLCJESVNBQkxFX0ZVTExfQVBQX1BSRUZFVENIIiwiX01ldGVvciRzZXR0aW5ncyR2aXRlIiwic2V0dGluZ3MiLCJtYW5pZmVzdCIsInZpdGVNYW5pZmVzdEluZm8iLCJjbGllbnRQcm9ncmFtcyIsImVuZHNXaXRoIiwidml0ZU1hbmlmZXN0UGF0aCIsInNlcnZlckRpciIsImFyY2hzIiwiYXJjaCIsImZpbGVzIiwic3RhdGljRmlsZXNCeUFyY2giLCJjYWNoZWFibGUiLCJfTWV0ZW9yJHNldHRpbmdzJHZpdGUyIiwiU2V0IiwicHJlbG9hZEltcG9ydHMiLCJfY2h1bmskY3NzIiwiY2h1bmsiLCJoYXMiLCJkZWxldGUiLCJhZGQiLCJjc3MiLCJfY2h1bmskY3NzMiIsImlzRW50cnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFDQSxJQUFBQSxNQUFTLEVBQUFDLGVBQVE7SUFBQUMsTUFBZSxDQUFFQyxJQUFBLGdCQUFNLEVBQWU7TUFBQ0gsT0FBQUksQ0FBQTtRQUFBSixNQUFBLEdBQUFJLENBQUE7TUFBQTtNQUFBSCxnQkFBQUcsQ0FBQTtRQUFBSCxlQUFBLEdBQUFHLENBQUE7TUFBQTtJQUFBO0lBQUEsSUFBQUMsTUFBQTtJQUFBSCxNQUFBLENBQUFDLElBQUE7TUFBQUcsUUFBQUYsQ0FBQTtRQUFBQyxNQUFBLEdBQUFELENBQUE7TUFBQTtJQUFBO0lBQUEsSUFBQUcsbUJBQUE7SUFBQUwsTUFBQSxDQUFBQyxJ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QUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDN0IxQixXQUFXLENBQUN5QyxHQUFHLENBQUNILEtBQUssQ0FBQ25WLElBQUksQ0FBQztVQUMvQjtVQUVBaVYsY0FBYyxDQUFDRSxLQUFLLENBQUN6QyxPQUFPLElBQUksRUFBRSxDQUFDO1VBRW5DLENBQUE4QyxXQUFBLEdBQUFMLEtBQUssQ0FBQ0ksR0FBRyxjQUFBQyxXQUFBLHVCQUFUQSxXQUFBLENBQVc3WCxPQUFPLENBQUM0WCxHQUFHLElBQUc7WUFDckIxQyxXQUFXLENBQUN5QyxHQUFHLENBQUNDLEdBQUcsQ0FBQztZQUNwQnJDLGVBQWUsQ0FBQ21DLE1BQU0sQ0FBQ0UsR0FBRyxDQUFDO1VBQy9CLENBQUMsQ0FBQztRQUNOO1FBRUEsTUFBTTdDLE9BQU8sR0FBRztVQUNaRyxXQUFXO1VBQ1hDLE9BQU87VUFDUEMsYUFBYTtVQUNiQyxrQkFBa0I7VUFDbEJFO1NBQ0g7UUFFRDFaLE1BQU0sQ0FBQ2lCLEtBQUssQ0FBQyw4QkFBOEIsRUFBRTZYLElBQUksQ0FBQ3pILE9BQU8sQ0FBQztVQUN0RDZILE9BQU87VUFDUDBCLFFBQVE7VUFDUnRCO1NBQ0gsRUFBRTtVQUFFekgsS0FBSyxFQUFFLENBQUM7VUFBRUMsTUFBTSxFQUFFO1FBQUksQ0FBRSxDQUFDLENBQUM7UUFFL0I3TixNQUFNLENBQUMrRCxNQUFNLENBQUMxSCxNQUFNLENBQUNxYSxRQUFRLENBQUN0RyxJQUFJLEVBQUU7VUFBRTZFO1FBQU8sQ0FBRSxDQUFDO1FBRWhELE9BQU9BLE9BQU87TUFDbEI7O0lBQ0huWCxzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHIiwiZmlsZSI6Ii9wYWNrYWdlcy9qb3JnZW52YXRsZV92aXRlLWJ1bmRsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgSFRUUCBmcm9tICdodHRwJztcbmltcG9ydCB7IFdlYkFwcCwgV2ViQXBwSW50ZXJuYWxzIH0gZnJvbSAnbWV0ZW9yL3dlYmFwcCc7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4vdXRpbGl0eS9Mb2dnZXInO1xuaW1wb3J0IHR5cGUgeyBCb2lsZXJwbGF0ZURhdGEgfSBmcm9tICcuL3ZpdGUtYm9pbGVycGxhdGUvY29tbW9uJztcbmltcG9ydCB7IFZpdGVEZXZTZXJ2ZXJXb3JrZXIgfSBmcm9tICcuL3ZpdGUtYm9pbGVycGxhdGUvZGV2ZWxvcG1lbnQnO1xuaW1wb3J0IHsgVml0ZVByb2R1Y3Rpb25Cb2lsZXJwbGF0ZSB9IGZyb20gJy4vdml0ZS1ib2lsZXJwbGF0ZS9wcm9kdWN0aW9uJztcblxuY29uc3Qgd29ya2VyID0gTWV0ZW9yLmlzUHJvZHVjdGlvbiA/IG5ldyBWaXRlUHJvZHVjdGlvbkJvaWxlcnBsYXRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuZXcgVml0ZURldlNlcnZlcldvcmtlcigpO1xuXG5pZiAoJ3N0YXJ0JyBpbiB3b3JrZXIpIHtcbiAgICBNZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gICAgICAgIHdvcmtlci5zdGFydCgpO1xuICAgIH0pXG59XG5cbldlYkFwcEludGVybmFscy5yZWdpc3RlckJvaWxlcnBsYXRlRGF0YUNhbGxiYWNrKCdtZXRlb3Itdml0ZScsIGFzeW5jIChyZXF1ZXN0OiBIVFRQLkluY29taW5nTWVzc2FnZSwgZGF0YTogQm9pbGVycGxhdGVEYXRhKSA9PiB7XG4gICAgY29uc3QgeyBkeW5hbWljQm9keSwgZHluYW1pY0hlYWQgfSA9IGF3YWl0IHdvcmtlci5nZXRCb2lsZXJwbGF0ZSgpO1xuICAgIFxuICAgIGlmIChkeW5hbWljSGVhZCkge1xuICAgICAgICBkYXRhLmR5bmFtaWNIZWFkID0gYCR7ZGF0YS5keW5hbWljSGVhZCB8fCAnJ31cXG4ke2R5bmFtaWNIZWFkfWA7XG4gICAgfVxuICAgIFxuICAgIGlmIChkeW5hbWljQm9keSkge1xuICAgICAgICBkYXRhLmR5bmFtaWNCb2R5ID0gYCR7ZGF0YS5keW5hbWljQm9keSB8fCAnJ31cXG4ke2R5bmFtaWNCb2R5fWA7XG4gICAgfVxufSk7XG5cbmlmICh3b3JrZXIgaW5zdGFuY2VvZiBWaXRlUHJvZHVjdGlvbkJvaWxlcnBsYXRlKSB7XG4gICAgTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuICAgICAgICBMb2dnZXIuZGVidWcoYFZpdGUgYXNzZXQgYmFzZSBVUkw6ICR7d29ya2VyLmJhc2VVcmx9YCk7XG4gICAgICAgIHdvcmtlci5tYWtlVml0ZUFzc2V0c0NhY2hlYWJsZSgpO1xuICAgIH0pXG4gICAgXG4gICAgLy8gUHJldmVudCBNZXRlb3IgZnJvbSBzZW5kaW5nIGEgMjAwIE9LIEhUTUwgZmlsZSB3aGVuIHRoZSByZXF1ZXN0IGlzIGNsZWFybHkgbm90IHZhbGlkLlxuICAgIC8vIElmIGFuIGFzc2V0IGlzIGZvdW5kIGJ5IE1ldGVvciwgdGhpcyBob29rIHdpbGwgbm90IGJlIGNhbGxlZC5cbiAgICBXZWJBcHAuY29ubmVjdEhhbmRsZXJzLnVzZSh3b3JrZXIuYXNzZXREaXIsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICByZXMud3JpdGVIZWFkKDQwNCwgJ05vdCBmb3VuZCcpO1xuICAgICAgICByZXMud3JpdGUoJ1ZpdGUgYXNzZXQgY291bGQgbm90IGJlIGZvdW5kLicpXG4gICAgICAgIExvZ2dlci53YXJuKGBTZXJ2ZWQgNDA0IGZvciBWaXRlIGFzc2V0IHJlcXVlc3Q6ICR7cmVxLm9yaWdpbmFsVXJsfWApO1xuICAgICAgICByZXMuZW5kKCk7XG4gICAgfSlcbn1cblxuIiwiaW1wb3J0IHR5cGUgeyBDaGlsZFByb2Nlc3MgfSBmcm9tICdjb25jdXJyZW50bHkvZGlzdC9zcmMvY29tbWFuZCc7XG5pbXBvcnQgeyBmb3JrIH0gZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUmFuZG9tIH0gZnJvbSAnbWV0ZW9yL3JhbmRvbSc7XG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBGUyBmcm9tICdmcyc7XG5pbXBvcnQgcGMgZnJvbSAncGljb2NvbG9ycyc7XG5pbXBvcnQgdHlwZSB7IFdvcmtlck1ldGhvZCwgV29ya2VyUmVzcG9uc2UsIFdvcmtlclJlc3BvbnNlSG9va3MsIE1ldGVvcklQQ01lc3NhZ2UsIFByb2plY3RKc29uIH0gZnJvbSAnbWV0ZW9yLXZpdGUnO1xuaW1wb3J0IHR5cGUgeyBERFBfSVBDIH0gZnJvbSAnLi9hcGkvRERQLUlQQyc7XG5pbXBvcnQgeyBnZXRNZXRlb3JSdW50aW1lQ29uZmlnIH0gZnJvbSAnLi91dGlsaXR5L0hlbHBlcnMnO1xuXG4vLyBVc2UgYSB3b3JrZXIgdG8gc2tpcCByZWlmeSBhbmQgRmliZXJzXG4vLyBVc2UgYSBjaGlsZCBwcm9jZXNzIGluc3RlYWQgb2Ygd29ya2VyIHRvIGF2b2lkIFdBU00vYXJjaGl2ZWQgdGhyZWFkcyBlcnJvclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdvcmtlckZvcmsoaG9va3M6IFBhcnRpYWw8V29ya2VyUmVzcG9uc2VIb29rcz4sIG9wdGlvbnM/OiB7XG4gICAgZGV0YWNoZWQ6IGJvb2xlYW4sXG4gICAgaXBjPzogRERQX0lQQztcbn0pIHtcbiAgICBpZiAoIUZTLmV4aXN0c1N5bmMod29ya2VyUGF0aCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvclZpdGVFcnJvcihbXG4gICAgICAgICAgICBgVW5hYmxlIHRvIGxvY2F0ZSBNZXRlb3ItVml0ZSB3b3JrZXJzISBNYWtlIHN1cmUgeW91J3ZlIGluc3RhbGxlZCB0aGUgJ21ldGVvci12aXRlJyBucG0gcGFja2FnZS5gLFxuICAgICAgICAgICAgYEluc3RhbGwgaXQgYnkgcnVubmluZyB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6YCxcbiAgICAgICAgICAgIGAkICAke3BjLnllbGxvdygnbnBtIGkgLUQgbWV0ZW9yLXZpdGUnKX1gXG4gICAgICAgIF0pXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGNoaWxkID0gZm9yayh3b3JrZXJQYXRoLCBbJy0tZW5hYmxlLXNvdXJjZS1tYXBzJ10sIHtcbiAgICAgICAgc3RkaW86IFsnaW5oZXJpdCcsICdpbmhlcml0JywgJ2luaGVyaXQnLCAnaXBjJ10sXG4gICAgICAgIGN3ZCxcbiAgICAgICAgZGV0YWNoZWQ6IG9wdGlvbnM/LmRldGFjaGVkID8/IGZhbHNlLFxuICAgICAgICBlbnY6IHByZXBhcmVXb3JrZXJFbnYoeyBpcGNPdmVyRGRwOiAhIW9wdGlvbnM/LmlwYz8uYWN0aXZlIH0pLFxuICAgIH0pO1xuICAgIFxuICAgIGlmIChvcHRpb25zPy5kZXRhY2hlZCkge1xuICAgICAgICBjaGlsZC51bnJlZigpO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBob29rTWV0aG9kcyA9IE9iamVjdC5rZXlzKGhvb2tzKSBhcyAoa2V5b2YgdHlwZW9mIGhvb2tzKVtdO1xuICAgIGhvb2tNZXRob2RzLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICAgICAgICBjb25zdCBob29rID0gaG9va3NbbWV0aG9kXTtcbiAgICAgICAgaWYgKHR5cGVvZiBob29rICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG4gICAgICAgIChob29rc1ttZXRob2RdIGFzIHR5cGVvZiBob29rKSA9IE1ldGVvci5iaW5kRW52aXJvbm1lbnQoaG9vayk7XG4gICAgfSlcbiAgICBcbiAgICBjb25zdCB3b3JrZXJDb25maWdIb29rID0gaG9va3Mud29ya2VyQ29uZmlnO1xuICAgIGhvb2tzLndvcmtlckNvbmZpZyA9IChkYXRhKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2Ygd29ya2VyQ29uZmlnSG9vayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgd29ya2VyQ29uZmlnSG9vayhkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHBpZCwgbGlzdGVuaW5nIH0gPSBkYXRhO1xuICAgICAgICBpZiAobGlzdGVuaW5nICYmIHByb2Nlc3MuZW52LkVOQUJMRV9ERUJVR19MT0dTKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUnVubmluZyBWaXRlIHdvcmtlciBhcyBhIGJhY2tncm91bmQgcHJvY2Vzcy4uXFxuICAnLCBbXG4gICAgICAgICAgICAgICAgYEJhY2tncm91bmQgUElEOiAke3BpZH1gLFxuICAgICAgICAgICAgICAgIGBDaGlsZCBwcm9jZXNzIFBJRDogJHtjaGlsZC5waWR9YCxcbiAgICAgICAgICAgICAgICBgTWV0ZW9yIFBJRDogJHtwcm9jZXNzLnBpZH1gLFxuICAgICAgICAgICAgICAgIGBJcyB2aXRlIHNlcnZlcjogJHtsaXN0ZW5pbmd9YCxcbiAgICAgICAgICAgIF0uam9pbignXFxuICAgJykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmIChvcHRpb25zPy5pcGM/LmFjdGl2ZSkge1xuICAgICAgICBvcHRpb25zLmlwYy5zZXRSZXNwb25zZUhvb2tzKGhvb2tzKTtcbiAgICB9XG4gICAgXG4gICAgY2hpbGQub24oJ21lc3NhZ2UnLCAobWVzc2FnZTogV29ya2VyUmVzcG9uc2UgJiB7IGRhdGE6IGFueSB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGhvb2sgPSBob29rc1ttZXNzYWdlLmtpbmRdO1xuICAgICAgICBcbiAgICAgICAgaWYgKHR5cGVvZiBob29rICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdNZXRlb3I6IFVucmVjb2duaXplZCB3b3JrZXIgbWVzc2FnZSEnLCB7IG1lc3NhZ2UgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBob29rKG1lc3NhZ2UuZGF0YSk7XG4gICAgfSk7XG4gICAgXG4gICAgY2hpbGQub24oJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICBpZiAoY29kZSB8fCBwcm9jZXNzLmVudi5FTkFCTEVfREVCVUdfTE9HUykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDaGlsZCBleGl0ZWQgd2l0aCBjb2RlOicsIGNvZGUpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICBcbiAgICBjaGlsZC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignTWV0ZW9yOiBXb3JrZXIgcHJvY2VzcyBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgIGlmICghY2hpbGQuY29ubmVjdGVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yVml0ZUVycm9yKCdMb3N0IGNvbm5lY3Rpb24gdG8gVml0ZSB3b3JrZXIgcHJvY2VzcycpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgY2hpbGQub24oJ2Rpc2Nvbm5lY3QnLCAoKSA9PiB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5FTkFCTEVfREVCVUdfTE9HUykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNZXRlb3I6IFdvcmtlciBwcm9jZXNzIGRpc2Nvbm5lY3RlZCcpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgICBjYWxsKHsgcGFyYW1zLCBtZXRob2QgfTogT21pdDxXb3JrZXJNZXRob2QsICdpZCc+KSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgIGlkOiBSYW5kb20uaWQoKSxcbiAgICAgICAgICAgICAgICBtZXRob2QsXG4gICAgICAgICAgICAgICAgcGFyYW1zLFxuICAgICAgICAgICAgfSBhcyBXb3JrZXJNZXRob2Q7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghb3B0aW9ucz8uaXBjPy5hY3RpdmUgJiYgIWNoaWxkLmNvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3JWaXRlRXJyb3IoYE9vcHMgd29ya2VyIHByb2Nlc3MgaXMgbm90IGNvbm5lY3RlZCEgVHJpZWQgdG8gc2VuZCBtZXNzYWdlIHRvIHdvcmtlcjogJHttZXRob2R9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChvcHRpb25zPy5pcGM/LmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuaXBjLmNhbGwobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChjaGlsZC5jb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5zZW5kKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjaGlsZCxcbiAgICB9XG59XG5cbmV4cG9ydCB0eXBlIFdvcmtlckluc3RhbmNlID0ge1xuICAgIGNhbGwobWV0aG9kOiBPbWl0PFdvcmtlck1ldGhvZCwgJ3JlcGxpZXMnPik6IHZvaWQ7XG4gICAgY2hpbGQ6IENoaWxkUHJvY2Vzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0ZW9ySVBDTWVzc2FnZTxcbiAgICBUb3BpYyBleHRlbmRzIE1ldGVvcklQQ01lc3NhZ2VbJ3RvcGljJ11cbj4obWVzc2FnZTogdW5rbm93bik6IG1lc3NhZ2UgaXMgTWV0ZW9ySVBDTWVzc2FnZSAge1xuICAgIGlmICghbWVzc2FnZSB8fCB0eXBlb2YgbWVzc2FnZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoISgndHlwZScgaW4gbWVzc2FnZSkgfHwgISgndG9waWMnIGluIG1lc3NhZ2UpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG1lc3NhZ2U/LnR5cGUgIT09ICdNRVRFT1JfSVBDX01FU1NBR0UnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBtZXNzYWdlLnRvcGljICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5jbGFzcyBNZXRlb3JWaXRlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nW10gfCBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2UpKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gW21lc3NhZ2VdO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKGBcXG7imqEgICR7bWVzc2FnZS5qb2luKCdcXG4gTCAnKX1gKTtcbiAgICAgICAgdGhpcy5uYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGN3ZCA9IHByb2Nlc3MuZW52Lk1FVEVPUl9WSVRFX0NXRCA/PyBndWVzc0N3ZCgpO1xuZXhwb3J0IGNvbnN0IHdvcmtlclBhdGggPSBQYXRoLmpvaW4oY3dkLCAnbm9kZV9tb2R1bGVzL21ldGVvci12aXRlL2Rpc3QvYmluL3dvcmtlci5tanMnKTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9qZWN0UGFja2FnZUpzb248XG4gICAgVEZpbGUgZXh0ZW5kcyAncGFja2FnZS5qc29uJyB8ICdwYWNrYWdlLWxvY2suanNvbicgPSAncGFja2FnZS5qc29uJ1xuPihmaWxlOiBURmlsZSA9ICdwYWNrYWdlLmpzb24nIGFzIFRGaWxlKToge1xuICAgICdwYWNrYWdlLmpzb24nOiBQcm9qZWN0SnNvbjtcbiAgICAncGFja2FnZS1sb2NrLmpzb24nOiB7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgLy8gbG9ja2ZpbGUgdjNcbiAgICAgICAgcGFja2FnZXM/OiBQYXJ0aWFsPFJlY29yZDxzdHJpbmcsIHsgdmVyc2lvbjogc3RyaW5nIH0+PlxuICAgICAgICBcbiAgICAgICAgLy8gbG9ja2ZpbGUgdjFcbiAgICAgICAgZGVwZW5kZW5jaWVzPzogUGFydGlhbDxSZWNvcmQ8c3RyaW5nLCB7IHZlcnNpb246IHN0cmluZyB9Pj47XG4gICAgfVxufVtURmlsZV0ge1xuICAgIGNvbnN0IHBhdGggPSBQYXRoLmpvaW4oY3dkLCBmaWxlKTtcbiAgICBcbiAgICBpZiAoIUZTLmV4aXN0c1N5bmMocGF0aCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvclZpdGVFcnJvcihbXG4gICAgICAgICAgICBgVW5hYmxlIHRvIGxvY2F0ZSAke3BjLnllbGxvdyhmaWxlKX0gZm9yIHlvdXIgcHJvamVjdCBpbiAke3BjLnllbGxvdyhwYXRoKX1gLFxuICAgICAgICAgICAgYE1ha2Ugc3VyZSB5b3UgcnVuIE1ldGVvciBjb21tYW5kcyBmcm9tIHRoZSByb290IG9mIHlvdXIgcHJvamVjdCBkaXJlY3RvcnkuYCxcbiAgICAgICAgICAgIGBBbHRlcm5hdGl2ZWx5LCB5b3UgY2FuIHN1cHBseSBhIHN1cGVyZmljaWFsIENXRCBmb3IgTWV0ZW9yLVZpdGUgdG8gdXNlOmAsXG4gICAgICAgICAgICBgJCAgY3Jvc3MtZW52IE1FVEVPUl9WSVRFX0NXRD1cIi4vcHJvamVjdHMvbXktbWV0ZW9yLXByb2plY3QvXCIgbWV0ZW9yIHJ1bmBcbiAgICAgICAgXSlcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIEpTT04ucGFyc2UoRlMucmVhZEZpbGVTeW5jKHBhdGgsICd1dGYtOCcpKTtcbn1cblxuZnVuY3Rpb24gZ3Vlc3NDd2QgKCkge1xuICAgIGxldCBjd2QgPSBwcm9jZXNzLmVudi5QV0QgPz8gcHJvY2Vzcy5jd2QoKVxuICAgIGNvbnN0IGluZGV4ID0gY3dkLmluZGV4T2YoJy5tZXRlb3InKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgY3dkID0gY3dkLnN1YnN0cmluZygwLCBpbmRleClcbiAgICB9XG4gICAgcmV0dXJuIGN3ZFxufVxuXG5mdW5jdGlvbiBwcmVwYXJlV29ya2VyRW52KHsgaXBjT3ZlckRkcCA9IGZhbHNlIH0pIHtcbiAgICBjb25zdCB3b3JrZXJFbnZQcmVmaXggPSAnTUVURU9SX1ZJVEVfV09SS0VSXyc7XG4gICAgY29uc3QgZW52OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+ID0ge1xuICAgICAgICBGT1JDRV9DT0xPUjogJzMnLFxuICAgICAgICBFTkFCTEVfREVCVUdfTE9HUzogcHJvY2Vzcy5lbnYuRU5BQkxFX0RFQlVHX0xPR1MsXG4gICAgICAgIE1FVEVPUl9MT0NBTF9ESVI6IHByb2Nlc3MuZW52Lk1FVEVPUl9MT0NBTF9ESVIsXG4gICAgICAgIFNUQVJURURfQVQ6IERhdGUubm93KCkudG9TdHJpbmcoKSxcbiAgICAgICAgTk9ERV9FTlY6IHByb2Nlc3MuZW52Lk5PREVfRU5WLFxuICAgIH1cbiAgICBpZiAoaXBjT3ZlckRkcCkge1xuICAgICAgICBjb25zdCBNRVRFT1JfUlVOVElNRSA9IGdldE1ldGVvclJ1bnRpbWVDb25maWcoKVxuICAgICAgICBpZiAoIU1FVEVPUl9SVU5USU1FLmZhbGxiYWNrKSB7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKGVudiwge1xuICAgICAgICAgICAgICAgIEREUF9JUEM6IHRydWUsXG4gICAgICAgICAgICAgICAgTUVURU9SX1JVTlRJTUU6IEpTT04uc3RyaW5naWZ5KE1FVEVPUl9SVU5USU1FKSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG4gICAgT2JqZWN0LmVudHJpZXMocHJvY2Vzcy5lbnYpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICBpZiAoIWtleS5zdGFydHNXaXRoKHdvcmtlckVudlByZWZpeCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1blByZWZpeGVkS2V5ID0ga2V5LnJlcGxhY2UobmV3IFJlZ0V4cChgXiR7d29ya2VyRW52UHJlZml4fWApLCAnJyk7XG4gICAgICAgIGVudltrZXldID0gdmFsdWU7XG4gICAgICAgIGVudlt1blByZWZpeGVkS2V5XSA9IHZhbHVlO1xuICAgIH0pXG4gICAgcmV0dXJuIGVudjtcbn1cbiIsImltcG9ydCB0eXBlIHsgV29ya2VyTWV0aG9kIH0gZnJvbSAnbWV0ZW9yLXZpdGUnO1xuaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xuaW1wb3J0IHR5cGUgeyBSdW50aW1lQ29uZmlnIH0gZnJvbSAnLi4vbG9hZGluZy92aXRlLWNvbm5lY3Rpb24taGFuZGxlcic7XG5cbmV4cG9ydCBjb25zdCBTdGF0dXNDb2xsZWN0aW9uID0gbmV3IE1vbmdvLkNvbGxlY3Rpb248U3RhdHVzRG9jdW1lbnQ+KCdfbWV0ZW9yLXZpdGUuc3RhdHVzJywgeyBjb25uZWN0aW9uOiBudWxsIH0pO1xuZXhwb3J0IGNvbnN0IERhdGFTdHJlYW1Db2xsZWN0aW9uID0gbmV3IE1vbmdvLkNvbGxlY3Rpb248RGF0YVN0cmVhbURvY3VtZW50PignX21ldGVvci12aXRlLmRhdGEtc3RyZWFtJyk7XG5leHBvcnQgY29uc3QgSXBjQ29sbGVjdGlvbiA9IG5ldyBNb25nby5Db2xsZWN0aW9uPFNlcmlhbGl6ZWRJcGNEb2N1bWVudCwgSXBjRG9jdW1lbnQ+KCdfbWV0ZW9yLXZpdGUuaXBjJywge1xuICAgIGNvbm5lY3Rpb246IG51bGwsXG4gICAgdHJhbnNmb3JtOiAoZG9jOiBTZXJpYWxpemVkSXBjRG9jdW1lbnQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmRvYyxcbiAgICAgICAgICAgIHBhcmFtczogSlNPTi5wYXJzZShkb2MucGFyYW1zKSxcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VEb2N1bWVudCB7XG4gICAgY3JlYXRlZEF0OiBEYXRlO1xuICAgIHVwZGF0ZWRBdD86IERhdGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdHVzRG9jdW1lbnQ8VFN0YXR1cyBleHRlbmRzIGtleW9mIE1ldGVvclZpdGVTdGF0dXMgPSBrZXlvZiBNZXRlb3JWaXRlU3RhdHVzPiBleHRlbmRzIEJhc2VEb2N1bWVudCB7XG4gICAgdHlwZTogVFN0YXR1cyxcbiAgICBkYXRhOiBNZXRlb3JWaXRlU3RhdHVzW1RTdGF0dXNdO1xuICAgIGFwcElkOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBNZXRlb3JWaXRlU3RhdHVzIHtcbiAgICB2aXRlQ29uZmlnOiBSdW50aW1lQ29uZmlnO1xuICAgIHZpdGVXb3JrZXI6IHtcbiAgICAgICAgcGlkOiBudW1iZXI7XG4gICAgICAgIG1ldGVvclBpZDogbnVtYmVyO1xuICAgICAgICBtZXRlb3JQYXJlbnRQaWQ6IG51bWJlcjtcbiAgICAgICAgbGFzdEhlYXJ0YmVhdDogRGF0ZTtcbiAgICAgICAgc3RhcnRlZEF0OiBEYXRlO1xuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJcGNEb2N1bWVudDxUTWV0aG9kIGV4dGVuZHMgV29ya2VyTWV0aG9kID0gV29ya2VyTWV0aG9kPiB7XG4gICAgbWV0aG9kOiBUTWV0aG9kWydtZXRob2QnXVxuICAgIHBhcmFtczogVE1ldGhvZFsncGFyYW1zJ107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXplZElwY0RvY3VtZW50PFRNZXRob2QgZXh0ZW5kcyBXb3JrZXJNZXRob2QgPSBXb3JrZXJNZXRob2Q+IHtcbiAgICBtZXRob2Q6IFRNZXRob2RbJ21ldGhvZCddO1xuICAgIHBhcmFtczogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBEYXRhU3RyZWFtTG9nVHlwZSA9ICdsb2c6Y2xpZW50JyB8ICdsb2c6c2VydmVyJyB8ICdsb2c6c2hhcmVkJztcbmV4cG9ydCB0eXBlIERhdGFTdHJlYW1Mb2dMZXZlbHMgPSAnaW5mbycgfCAnZGVidWcnIHwgJ2Vycm9yJyB8ICdzdWNjZXNzJyB8ICd3YXJuJztcblxuZXhwb3J0IGludGVyZmFjZSBEYXRhU3RyZWFtRG9jdW1lbnQgZXh0ZW5kcyBCYXNlRG9jdW1lbnQge1xuICAgIHR5cGU6IERhdGFTdHJlYW1Mb2dUeXBlO1xuICAgIGxldmVsOiBEYXRhU3RyZWFtTG9nTGV2ZWxzO1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbiAgICBzZW5kZXI/OiBzdHJpbmc7XG59IiwiaW1wb3J0IHR5cGUgeyBXb3JrZXJNZXRob2QsIFdvcmtlclJlc3BvbnNlLCBXb3JrZXJSZXNwb25zZUhvb2tzIH0gZnJvbSAnbWV0ZW9yLXZpdGUnO1xuaW1wb3J0IHsgZ2V0TWV0ZW9yUnVudGltZUNvbmZpZyB9IGZyb20gJy4uL3V0aWxpdHkvSGVscGVycyc7XG5pbXBvcnQgeyBJcGNDb2xsZWN0aW9uIH0gZnJvbSAnLi9Db2xsZWN0aW9ucyc7XG5cbnR5cGUgSXBjUmVzcG9uc2UgPSBXb3JrZXJSZXNwb25zZSAmIHsgZGF0YTogYW55IH1cblxuZXhwb3J0IGNsYXNzIEREUF9JUEMge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSByZXNwb25zZUhvb2tzOiBQYXJ0aWFsPFdvcmtlclJlc3BvbnNlSG9va3M+KSB7XG4gICAgICAgIE1ldGVvci5tZXRob2RzKHtcbiAgICAgICAgICAgICdtZXRlb3Itdml0ZTppcGMnOiAoeyBraW5kLCBkYXRhIH06IElwY1Jlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaG9vayA9IHRoaXMucmVzcG9uc2VIb29rc1traW5kXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhvb2sgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignTWV0ZW9yOiBVbnJlY29nbml6ZWQgd29ya2VyIG1lc3NhZ2UhJywgeyBtZXNzYWdlOiB7IGtpbmQsIGRhdGEgfX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gaG9vayhkYXRhKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhc3luYyAnbWV0ZW9yLXZpdGU6aXBjLnJlY2VpdmVkJyhpZDogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgSXBjQ29sbGVjdGlvbi5yZW1vdmVBc3luYyhpZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIE1ldGVvci5wdWJsaXNoKCdtZXRlb3Itdml0ZTppcGMnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBJcGNDb2xsZWN0aW9uLmZpbmQoKTtcbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGNhbGwoeyBtZXRob2QsIHBhcmFtcywgaWQgfTogV29ya2VyTWV0aG9kKSB7XG4gICAgICAgIElwY0NvbGxlY3Rpb24uaW5zZXJ0QXN5bmMoe1xuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBtZXRob2QsXG4gICAgICAgICAgICBwYXJhbXM6IEpTT04uc3RyaW5naWZ5KHBhcmFtcyksXG4gICAgICAgIH0pLmNhdGNoKChlcnJvcjogdW5rbm93bikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignVml0ZTogRmFpbGVkIHRvIHNlbmQgSVBDIGV2ZW50IScsIGVycm9yKTtcbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHNldFJlc3BvbnNlSG9va3MocmVzcG9uc2VIb29rczogUGFydGlhbDxXb3JrZXJSZXNwb25zZUhvb2tzPikge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMucmVzcG9uc2VIb29rcywgcmVzcG9uc2VIb29rcyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgd2UgYXJlIGNvbmZpZGVudCB0aGF0IE1ldGVvciBjYW4gYmUgcmVhY2hlZCBvdmVyIEREUCBmcm9tIHRoZSBjdXJyZW50IHJ1bnRpbWUgY29uZmlnXG4gICAgICovXG4gICAgcHVibGljIGdldCBhY3RpdmUoKSB7XG4gICAgICAgIHJldHVybiAhZ2V0TWV0ZW9yUnVudGltZUNvbmZpZygpLmZhbGxiYWNrXG4gICAgfVxufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgZ2V0TWV0ZW9yUnVudGltZUNvbmZpZyB9IGZyb20gJy4uL3V0aWxpdHkvSGVscGVycyc7XG5pbXBvcnQge1xuICAgIHR5cGUgQmFzZURvY3VtZW50LFxuICAgIERhdGFTdHJlYW1Db2xsZWN0aW9uLFxuICAgIHR5cGUgRGF0YVN0cmVhbURvY3VtZW50LFxuICAgIFN0YXR1c0NvbGxlY3Rpb24sXG4gICAgdHlwZSBTdGF0dXNEb2N1bWVudCxcbn0gZnJvbSAnLi9Db2xsZWN0aW9ucyc7XG5pbXBvcnQgeyB3YXRjaERhdGFTdHJlYW1Mb2dzIH0gZnJvbSAnLi9XYXRjaGVycyc7XG5cbmV4cG9ydCB0eXBlIE1ldGVvclZpdGVNZXRob2RzID0gdHlwZW9mIE1ldGhvZHM7XG5cbmV4cG9ydCBjb25zdCBNZXRob2RzID0ge1xuICAgIGFzeW5jICdtZXRlb3Itdml0ZTpzdGF0dXMvdXBkYXRlJyhzdGF0dXM6IE9taXQ8U3RhdHVzRG9jdW1lbnQsIGtleW9mIEJhc2VEb2N1bWVudD4pIHtcbiAgICAgICAgY29uc3QgeyBhcHBJZCB9ID0gZ2V0TWV0ZW9yUnVudGltZUNvbmZpZygpO1xuICAgICAgICBhd2FpdCBTdGF0dXNDb2xsZWN0aW9uLnVwc2VydEFzeW5jKFxuICAgICAgICAgICAgeyB0eXBlOiBzdGF0dXMudHlwZSB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogT2JqZWN0LmFzc2lnbihzdGF0dXMuZGF0YSwgeyB1cGRhdGVkQXQ6IG5ldyBEYXRlKCksIGFwcElkICB9KSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICRzZXRPbkluc2VydDoge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgICB9LFxuICAgIGFzeW5jICdtZXRlb3Itdml0ZTpsb2cnKGxvZzogT21pdDxEYXRhU3RyZWFtRG9jdW1lbnQsIGtleW9mIEJhc2VEb2N1bWVudD4pIHtcbiAgICAgICAgYXdhaXQgRGF0YVN0cmVhbUNvbGxlY3Rpb24uaW5zZXJ0QXN5bmMoT2JqZWN0LmFzc2lnbihsb2csIHtcbiAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgICAgfSkpO1xuICAgIH0sXG59XG5cbk1ldGVvci5zdGFydHVwKCgpID0+IHtcbiAgICBpZiAoTWV0ZW9yLmlzUHJvZHVjdGlvbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIE1ldGVvci5tZXRob2RzKE1ldGhvZHMpO1xuICAgIHdhdGNoRGF0YVN0cmVhbUxvZ3MoKTtcbiAgICBcbiAgICBpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgTWV0ZW9yLnB1Ymxpc2goJ21ldGVvci12aXRlOmxvZycsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIERhdGFTdHJlYW1Db2xsZWN0aW9uLmZpbmQoe1xuICAgICAgICAgICAgdHlwZTogeyAkaW46IFsnbG9nOmNsaWVudCcsICdsb2c6c2hhcmVkJ10gfSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbGltaXQ6IDUwLFxuICAgICAgICAgICAgc29ydDogeyBjcmVhdGVkQXQ6IC0xIH0sXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIFRvZG86IGNsZWFuIHVwIG9sZCBsb2dzIHJlZ3VsYXJseVxufSk7IiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgRERQTG9nZ2VyIGZyb20gJy4uL3V0aWxpdHkvRERQTG9nZ2VyJztcbmltcG9ydCB7IERhdGFTdHJlYW1Db2xsZWN0aW9uIH0gZnJvbSAnLi9Db2xsZWN0aW9ucyc7XG5sZXQgd2F0Y2hlckFjdGl2ZSA9IGZhbHNlO1xuXG5leHBvcnQgZnVuY3Rpb24gd2F0Y2hEYXRhU3RyZWFtTG9ncygpIHtcbiAgICBjb25zdCBzdGFydHVwVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgXG4gICAgaWYgKHdhdGNoZXJBY3RpdmUpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihuZXcgRXJyb3IoJ+KaoSBEYXRhIHN0cmVhbSBsb2dzIGFyZSBhbHJlYWR5IGJlaW5nIHdhdGNoZWQnKSk7XG4gICAgfVxuICAgIFxuICAgIGlmIChNZXRlb3IuaXNQcm9kdWN0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbWV0ZW9yLXZpdGUgZGF0YSBsb2dzIGFyZSBvbmx5IGF2YWlsYWJsZSBpbiBkZXZlbG9wbWVudCBtb2RlJyk7XG4gICAgfVxuICAgIFxuICAgIHdhdGNoZXJBY3RpdmUgPSB0cnVlO1xuICAgIFxuICAgIGlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgICAgICAgTWV0ZW9yLnN1YnNjcmliZSgnbWV0ZW9yLXZpdGU6bG9nJywge1xuICAgICAgICAgICAgb25SZWFkeSgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCfimqEgTGlzdGVuaW5nIGZvciBsb2dzIGZyb20gbWV0ZW9yLXZpdGUnKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblN0b3AoZXJyb3I6IHVua25vd24pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmRlYnVnKCfimqEgVW5zdWJzY3JpYmVkIGZyb20gbWV0ZW9yLXZpdGUgbG9ncycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCfimqEgRXJyb3IgZnJvbSBtZXRlb3Itdml0ZSBsb2dzIHB1YmxpY2F0aW9uJywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgRGF0YVN0cmVhbUNvbGxlY3Rpb24uZmluZCh7IGNyZWF0ZWRBdDogeyAkZ3Q6IHN0YXJ0dXBUaW1lIH0gfSkub2JzZXJ2ZSh7XG4gICAgICAgIGFkZGVkKGRvY3VtZW50KSB7XG4gICAgICAgICAgICBERFBMb2dnZXIucHJpbnQoZG9jdW1lbnQpO1xuICAgICAgICB9LFxuICAgIH0pXG59IiwiaW1wb3J0IHsgV29ya2VyUmVzcG9uc2VEYXRhIH0gZnJvbSAnbWV0ZW9yLXZpdGUnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XG5pbXBvcnQgJy4uL2FwaS9FbmRwb2ludHMnO1xuaW1wb3J0IHsgZ2V0UHJvamVjdFBhY2thZ2VKc29uIH0gZnJvbSAnLi4vd29ya2Vycyc7XG5cbmV4cG9ydCB0eXBlIFJ1bnRpbWVDb25maWcgPSBXb3JrZXJSZXNwb25zZURhdGE8J3ZpdGVDb25maWcnPiAmIHsgcmVhZHk6IGJvb2xlYW4sIGxhc3RVcGRhdGU6IG51bWJlciwgYmFzZVVybDogc3RyaW5nIH07XG5leHBvcnQgbGV0IE1ldGVvclZpdGVDb25maWc6IE1vbmdvLkNvbGxlY3Rpb248UnVudGltZUNvbmZpZz47XG5leHBvcnQgY29uc3QgVklURV9FTlRSWVBPSU5UX1NDUklQVF9JRCA9ICdtZXRlb3Itdml0ZS1lbnRyeXBvaW50LXNjcmlwdCc7XG5leHBvcnQgY29uc3QgVklURV9DTElFTlRfU0NSSVBUX0lEID0gJ21ldGVvci12aXRlLWNsaWVudCc7XG5leHBvcnQgY2xhc3MgVml0ZURldlNjcmlwdHMge1xuICAgIHB1YmxpYyByZWFkb25seSB1cmxzO1xuICAgIHB1YmxpYyByZWFkb25seSBuZWVkc1JlYWN0UHJlYW1ibGU6IGJvb2xlYW47XG4gICAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGNvbmZpZzogUnVudGltZUNvbmZpZykge1xuICAgICAgICBjb25zdCB7IGJhc2VVcmwgfSA9IGNvbmZpZztcbiAgICAgICAgXG4gICAgICAgIHRoaXMudXJscyA9IHtcbiAgICAgICAgICAgIGJhc2VVcmwsXG4gICAgICAgICAgICBlbnRyeXBvaW50VXJsOiBgJHtiYXNlVXJsfS8ke2NvbmZpZy5lbnRyeUZpbGV9YCxcbiAgICAgICAgICAgIHZpdGVDbGllbnRVcmw6IGAke2Jhc2VVcmx9L0B2aXRlL2NsaWVudGAsXG4gICAgICAgICAgICByZWFjdFJlZnJlc2g6IGAke2Jhc2VVcmx9L0ByZWFjdC1yZWZyZXNoYCxcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERldGVybWluZSB3aGV0aGVyIHRvIGluamVjdCBSZWFjdCBSZWZyZXNoIHNuaXBwZXQgaW50byBIVE1MIHNlcnZlZCBieSBNZXRlb3IuXG4gICAgICAgICAqIFdpdGhvdXQgdGhpcyBzbmlwcGV0LCBSZWFjdCBITVIgd2lsbCBub3Qgd29yayB3aXRoIE1ldGVvci1WaXRlLlxuICAgICAgICAgKlxuICAgICAgICAgKiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL0pvcmdlblZhdGxlL21ldGVvci12aXRlL2lzc3Vlcy8yOX1cbiAgICAgICAgICoge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS92aXRlanMvdml0ZS1wbHVnaW4tcmVhY3QvaXNzdWVzLzExI2Rpc2N1c3Npb25fcjQzMDg3OTIwMX1cbiAgICAgICAgICovXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gZ2V0UHJvamVjdFBhY2thZ2VKc29uKCk7XG4gICAgICAgICAgICB0aGlzLm5lZWRzUmVhY3RQcmVhbWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoJ0B2aXRlanMvcGx1Z2luLXJlYWN0JyBpbiBwYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5lZWRzUmVhY3RQcmVhbWJsZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJ0B2aXRlanMvcGx1Z2luLXJlYWN0JyBpbiBwYWNrYWdlSnNvbi5kZXZEZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5lZWRzUmVhY3RQcmVhbWJsZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc3RyaW5nVGVtcGxhdGUoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3QgeyB2aXRlQ2xpZW50VXJsLCBlbnRyeXBvaW50VXJsIH0gPSB0aGlzLnVybHM7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXRoaXMuY29uZmlnLnJlYWR5KSB7XG4gICAgICAgICAgICBpZiAoJ2dldFRleHRBc3luYycgaW4gQXNzZXRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFzc2V0cy5nZXRUZXh0QXN5bmMoJ3NyYy9sb2FkaW5nL2Rldi1zZXJ2ZXItc3BsYXNoLmh0bWwnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIEFzc2V0cy5nZXRUZXh0KCdzcmMvbG9hZGluZy9kZXYtc2VydmVyLXNwbGFzaC5odG1sJykhO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBtb2R1bGVMaW5lcyA9IFtcbiAgICAgICAgICAgIGA8c2NyaXB0IHNyYz1cIiR7dml0ZUNsaWVudFVybH1cIiB0eXBlPVwibW9kdWxlXCIgaWQ9XCIke1ZJVEVfQ0xJRU5UX1NDUklQVF9JRH1cIj48L3NjcmlwdD5gLFxuICAgICAgICAgICAgYDxzY3JpcHQgc3JjPVwiJHtlbnRyeXBvaW50VXJsfVwiIHR5cGU9XCJtb2R1bGVcIiBpZD1cIiR7VklURV9FTlRSWVBPSU5UX1NDUklQVF9JRH1cIj48L3NjcmlwdD5gXG4gICAgICAgIF1cbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm5lZWRzUmVhY3RQcmVhbWJsZSkge1xuICAgICAgICAgICAgbW9kdWxlTGluZXMudW5zaGlmdChgXG4gICAgICAgICAgICAgICAgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCI+XG4gICAgICAgICAgICAgICAgICBpbXBvcnQgUmVmcmVzaFJ1bnRpbWUgZnJvbSBcIiR7dGhpcy51cmxzLnJlYWN0UmVmcmVzaH1cIjtcbiAgICAgICAgICAgICAgICAgIFJlZnJlc2hSdW50aW1lLmluamVjdEludG9HbG9iYWxIb29rKHdpbmRvdylcbiAgICAgICAgICAgICAgICAgIHdpbmRvdy4kUmVmcmVzaFJlZyQgPSAoKSA9PiB7fVxuICAgICAgICAgICAgICAgICAgd2luZG93LiRSZWZyZXNoU2lnJCA9ICgpID0+ICh0eXBlKSA9PiB0eXBlXG4gICAgICAgICAgICAgICAgICB3aW5kb3cuX192aXRlX3BsdWdpbl9yZWFjdF9wcmVhbWJsZV9pbnN0YWxsZWRfXyA9IHRydWVcbiAgICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgIGApXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBtb2R1bGVMaW5lcy5qb2luKCdcXG4nKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGluamVjdFNjcmlwdHNJbkRPTSgpIHtcbiAgICAgICAgaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGNhbiBvbmx5IHJ1biBvbiB0aGUgY2xpZW50IScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghTWV0ZW9yLmlzRGV2ZWxvcG1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gSWYgdGhlIHNjcmlwdHMgYWxyZWFkeSBleGlzdHMgb24gdGhlIHBhZ2UsIHRocm93IGFuIGVycm9yIHRvIHByZXZlbnQgYWRkaW5nIG1vcmUgdGhhbiBvbmUgc2NyaXB0LlxuICAgICAgICBjb25zdCBleGlzdGluZ1NjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFZJVEVfRU5UUllQT0lOVF9TQ1JJUFRfSUQpIHx8IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFZJVEVfQ0xJRU5UX1NDUklQVF9JRCk7XG4gICAgICAgIGlmIChleGlzdGluZ1NjcmlwdCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdWaXRlIHNjcmlwdCBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgY3VycmVudCBkb2N1bWVudCcpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBUZW1wb3JhcnlFbGVtZW50cyA9IHtcbiAgICAgICAgICAgIHNwbGFzaFNjcmVlbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldGVvci12aXRlLXNwbGFzaC1zY3JlZW4nKSxcbiAgICAgICAgICAgIHN0eWxlczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldGVvci12aXRlLXN0eWxlcycpLFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IHNldCBvZiBub2RlcyBzbyB0aGV5IGNhbiBiZSBhcHBlbmRlZCB0byB0aGUgZG9jdW1lbnQuXG4gICAgICAgIGNvbnN0IHZpdGVFbnRyeXBvaW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgIHZpdGVFbnRyeXBvaW50LmlkID0gVklURV9FTlRSWVBPSU5UX1NDUklQVF9JRDtcbiAgICAgICAgdml0ZUVudHJ5cG9pbnQuc3JjID0gdGhpcy51cmxzLmVudHJ5cG9pbnRVcmw7XG4gICAgICAgIHZpdGVFbnRyeXBvaW50LnR5cGUgPSAnbW9kdWxlJztcbiAgICAgICAgdml0ZUVudHJ5cG9pbnQuc2V0QXR0cmlidXRlKCdkZWZlcicsICd0cnVlJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB2aXRlQ2xpZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgIHZpdGVDbGllbnQuaWQgPSBWSVRFX0NMSUVOVF9TQ1JJUFRfSUQ7XG4gICAgICAgIHZpdGVDbGllbnQuc3JjID0gdGhpcy51cmxzLnZpdGVDbGllbnRVcmw7XG4gICAgICAgIHZpdGVDbGllbnQudHlwZSA9ICdtb2R1bGUnO1xuICAgICAgICBcbiAgICAgICAgdml0ZUVudHJ5cG9pbnQub25lcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgICAgICAgRGV2Q29ubmVjdGlvbkxvZy5lcnJvcignVml0ZSBlbnRyeXBvaW50IG1vZHVsZSBmYWlsZWQgdG8gbG9hZCEgV2lsbCByZWZyZXNoIHBhZ2Ugc2hvcnRseS4uLicsIGVycm9yKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpLCAxNTAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgdml0ZUVudHJ5cG9pbnQub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgRGV2Q29ubmVjdGlvbkxvZy5pbmZvKCdMb2FkZWQgVml0ZSBtb2R1bGUgZHluYW1pY2FsbHkhIEhvcGVmdWxseSBhbGwgd2VudCB3ZWxsIGFuZCB5b3VyIGFwcCBpcyB1c2FibGUuIPCfpJ4nKTtcbiAgICAgICAgICAgIFRlbXBvcmFyeUVsZW1lbnRzLnNwbGFzaFNjcmVlbj8ucmVtb3ZlKClcbiAgICAgICAgICAgIFRlbXBvcmFyeUVsZW1lbnRzLnN0eWxlcz8ucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LmJvZHkucHJlcGVuZCh2aXRlRW50cnlwb2ludCwgdml0ZUNsaWVudCk7XG4gICAgfVxufVxuXG5jb25zdCBydW50aW1lQ29uZmlnOiBSdW50aW1lQ29uZmlnID0ge1xuICAgIHJlYWR5OiBmYWxzZSxcbiAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICBiYXNlVXJsOiAnaHR0cDovL2xvY2FsaG9zdDowJyxcbiAgICBwb3J0OiAwLFxuICAgIGVudHJ5RmlsZTogJycsXG4gICAgbGFzdFVwZGF0ZTogRGF0ZS5ub3coKSxcbn1cblxuZXhwb3J0IGNvbnN0IFZpdGVDb25uZWN0aW9uID0ge1xuICAgIHB1YmxpY2F0aW9uOiAnX21ldGVvcl92aXRlJyBhcyBjb25zdCxcbiAgICBtZXRob2RzOiB7XG4gICAgICAgIHJlZnJlc2hDb25maWc6ICdfbWV0ZW9yX3ZpdGVfcmVmcmVzaF9jb25maWcnLFxuICAgIH0sXG4gICAgY29uZmlnU2VsZWN0b3I6IHsgX2lkOiAndml0ZUNvbmZpZycgfSxcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENvbmZpZygpIHtcbiAgICBjb25zdCB2aXRlQ29uZmlnID0gYXdhaXQgTWV0ZW9yVml0ZUNvbmZpZy5maW5kT25lQXN5bmMoVml0ZUNvbm5lY3Rpb24uY29uZmlnU2VsZWN0b3IpO1xuICAgIGNvbnN0IGNvbmZpZyA9IHZpdGVDb25maWcgfHwgcnVudGltZUNvbmZpZztcbiAgICBsZXQgYmFzZVVybCA9IGNvbmZpZy5yZXNvbHZlZFVybHM/Lm5ldHdvcms/LlswXSB8fCBjb25maWcucmVzb2x2ZWRVcmxzPy5sb2NhbD8uWzBdIHx8IGBodHRwOi8vbG9jYWxob3N0OiR7Y29uZmlnLnBvcnR9YDtcbiAgICBcbiAgICBpZiAocHJvY2Vzcy5lbnYuTUVURU9SX1ZJVEVfSE9TVCkge1xuICAgICAgICBiYXNlVXJsID0gYCR7cHJvY2Vzcy5lbnYuTUVURU9SX1ZJVEVfUFJPVE9DT0wgfHwgJ2h0dHAnfTovLyR7cHJvY2Vzcy5lbnYuTUVURU9SX1ZJVEVfSE9TVH06JHtwcm9jZXNzLmVudi5NRVRFT1JfVklURV9QT1JUIHx8IGNvbmZpZy5wb3J0fWBcbiAgICB9XG4gICAgXG4gICAgLy8gU3RyaXAgYW55IHRyYWlsaW5nICcvJyBjaGFyYWN0ZXJzXG4gICAgYmFzZVVybCA9IGJhc2VVcmwucmVwbGFjZSgvXFwvKyQvZywgJycpO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICAgIC4uLmNvbmZpZyxcbiAgICAgICAgYmFzZVVybCxcbiAgICAgICAgYWdlOiBEYXRlLm5vdygpIC0gY29uZmlnLmxhc3RVcGRhdGUsXG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0Q29uZmlnPFRDb25maWcgZXh0ZW5kcyBQYXJ0aWFsPFJ1bnRpbWVDb25maWc+Pihjb25maWc6IFRDb25maWcpIHtcbiAgICBPYmplY3QuYXNzaWduKHJ1bnRpbWVDb25maWcsIGNvbmZpZywgVml0ZUNvbm5lY3Rpb24uY29uZmlnU2VsZWN0b3IsIHsgbGFzdFVwZGF0ZTogRGF0ZS5ub3coKSB9KTtcbiAgICBcbiAgICBpZiAocnVudGltZUNvbmZpZy5wb3J0ICYmIHJ1bnRpbWVDb25maWcuaG9zdCAmJiBydW50aW1lQ29uZmlnLmVudHJ5RmlsZSkge1xuICAgICAgICBydW50aW1lQ29uZmlnLnJlYWR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgYXdhaXQgTWV0ZW9yVml0ZUNvbmZpZy51cHNlcnRBc3luYyhWaXRlQ29ubmVjdGlvbi5jb25maWdTZWxlY3RvciwgcnVudGltZUNvbmZpZyk7XG4gICAgcmV0dXJuIHJ1bnRpbWVDb25maWc7XG59XG5cbmlmIChNZXRlb3IuaXNEZXZlbG9wbWVudCkge1xuICAgIE1ldGVvclZpdGVDb25maWcgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbihWaXRlQ29ubmVjdGlvbi5wdWJsaWNhdGlvbiwgeyBjb25uZWN0aW9uOiBudWxsIH0pO1xufVxuY29uc3QgbG9nTGFiZWwgPSBNZXRlb3IuaXNDbGllbnQgPyBgW01ldGVvci1WaXRlXSDimqEgYCA6ICfimqEgICc7XG5cbmV4cG9ydCBjb25zdCBEZXZDb25uZWN0aW9uTG9nID0ge1xuICAgIF9sb2dUb1NjcmVlbihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFNZXRlb3IuaXNDbGllbnQpIHJldHVybjtcbiAgICAgICAgY29uc3QgbWVzc2FnZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbWVzc2FnZU5vZGUuaW5uZXJUZXh0ID0gbWVzc2FnZTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnZpdGUtc3RhdHVzLXRleHQnKT8ucHJlcGVuZChtZXNzYWdlTm9kZSk7XG4gICAgfSxcbiAgICBpbmZvOiAobWVzc2FnZTogc3RyaW5nLCAuLi5wYXJhbXM6IFBhcmFtZXRlcnM8dHlwZW9mIGNvbnNvbGUubG9nPikgPT4ge1xuICAgICAgICBEZXZDb25uZWN0aW9uTG9nLl9sb2dUb1NjcmVlbihgIOKaoSAke21lc3NhZ2V9YCk7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgICAgIGAke2xvZ0xhYmVsfSAke21lc3NhZ2V9YCxcbiAgICAgICAgICAgIC4uLnBhcmFtcyxcbiAgICAgICAgKVxuICAgIH0sXG4gICAgZGVidWc6IChtZXNzYWdlOiBzdHJpbmcsIC4uLnBhcmFtczogUGFyYW1ldGVyczx0eXBlb2YgY29uc29sZS5sb2c+KSA9PiB7XG4gICAgICAgIERldkNvbm5lY3Rpb25Mb2cuX2xvZ1RvU2NyZWVuKGAg4pqhICR7bWVzc2FnZX1gKTtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcbiAgICAgICAgICAgIGAke2xvZ0xhYmVsfSAke21lc3NhZ2V9YCxcbiAgICAgICAgICAgIC4uLnBhcmFtcyxcbiAgICAgICAgKVxuICAgIH0sXG4gICAgZXJyb3I6IChtZXNzYWdlOiBzdHJpbmcsIC4uLnBhcmFtczogUGFyYW1ldGVyczx0eXBlb2YgY29uc29sZS5sb2c+KSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgcGFyYW0gb2YgcGFyYW1zKSB7XG4gICAgICAgICAgICBpZiAocGFyYW0gaW5zdGFuY2VvZiBFcnJvciAmJiBwYXJhbS5zdGFjaykge1xuICAgICAgICAgICAgICAgIERldkNvbm5lY3Rpb25Mb2cuX2xvZ1RvU2NyZWVuKHBhcmFtLnN0YWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBEZXZDb25uZWN0aW9uTG9nLl9sb2dUb1NjcmVlbihgIOKaoSAke21lc3NhZ2V9YCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICBgJHtsb2dMYWJlbH0gJHttZXNzYWdlfWAsXG4gICAgICAgICAgICAuLi5wYXJhbXMsXG4gICAgICAgIClcbiAgICB9LFxufTtcbiIsImZ1bmN0aW9uIGRlZmluZUNvbG9yKHByZWZpeDogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykge1xuICAgIHJldHVybiAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiBgJHtwcmVmaXh9JHttZXNzYWdlfSR7c3VmZml4fWA7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgQW5zaUNvbG9yID0ge1xuICAgIGRpbTogZGVmaW5lQ29sb3IoJ1xceDFiWzJtJywgJ1xceDFiWzIybScpLFxuICAgIGdyZWVuOiBkZWZpbmVDb2xvcignXFx4MWJbMzJtJywgJ1xceDFiWzM5bScpLFxuICAgIGJsdWU6IGRlZmluZUNvbG9yKCdcXHgxYlszNG0nLCAnXFx4MWJbMzltJyksXG4gICAgcmVkOiBkZWZpbmVDb2xvcignXFx4MWJbMzFtJywgJ1xceDFiWzM5bScpLFxufTsiLCJpbXBvcnQgcGMgZnJvbSAncGljb2NvbG9ycyc7XG5pbXBvcnQgdHlwZSB7IEJhc2VEb2N1bWVudCwgRGF0YVN0cmVhbURvY3VtZW50LCBEYXRhU3RyZWFtTG9nVHlwZSB9IGZyb20gJy4uL2FwaS9Db2xsZWN0aW9ucyc7XG5pbXBvcnQgeyBNZXRob2RzIH0gZnJvbSAnLi4vYXBpL0VuZHBvaW50cyc7XG5pbXBvcnQgeyBpbnNwZWN0IH0gZnJvbSAnbm9kZTp1dGlsJztcbmltcG9ydCB7IEFuc2lDb2xvciB9IGZyb20gJy4vQW5zaUNvbG9yJztcblxuY2xhc3MgRERQTG9nZ2VyIHtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdHlwZTogRGF0YVN0cmVhbUxvZ1R5cGUgPSAnbG9nOnNoYXJlZCc7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9ICdsb2c6Y2xpZW50JztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgc2VuZChsb2c6IE9taXQ8RGF0YVN0cmVhbURvY3VtZW50LCAndHlwZScgfCBrZXlvZiBCYXNlRG9jdW1lbnQ+ICYgeyBhcmdzOiB1bmtub3duW10gfSkge1xuICAgICAgICBjb25zdCBkb2N1bWVudDogT21pdDxEYXRhU3RyZWFtRG9jdW1lbnQsIGtleW9mIEJhc2VEb2N1bWVudD4gPSBPYmplY3QuYXNzaWduKHt9LCBsb2csIHtcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IFtsb2cubWVzc2FnZSwgLi4udGhpcy5zZXJpYWxpemVBcmdzKGxvZy5hcmdzKV0uam9pbignICcpLFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmICghTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgICAgICAgICBNZXRlb3IuY2FsbEFzeW5jKCdtZXRlb3Itdml0ZTpsb2cnLCBkb2N1bWVudCkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvZyBtZXNzYWdlJywgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIE1ldGhvZHNbJ21ldGVvci12aXRlOmxvZyddKGRvY3VtZW50KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2cgbWVzc2FnZScsIGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHByb3RlY3RlZCBzdHlsZU1lc3NhZ2UoZGF0YTogUGljazxEYXRhU3RyZWFtRG9jdW1lbnQsICdtZXNzYWdlJyB8ICdsZXZlbCcgfCAnc2VuZGVyJz4pIHtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gZGF0YS5zZW5kZXIgPyBBbnNpQ29sb3IuZGltKGBbJHtkYXRhLnNlbmRlcn1dYCkgKyAnICcgOiAnJztcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGDimqEgICR7cHJlZml4fSR7ZGF0YS5tZXNzYWdlfWA7XG4gICAgICAgIHN3aXRjaCAoZGF0YS5sZXZlbCkge1xuICAgICAgICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBjLmJsdWUobWVzc2FnZSk7XG4gICAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBjLnJlZChtZXNzYWdlKTtcbiAgICAgICAgICAgIGNhc2UgJ3dhcm4nOlxuICAgICAgICAgICAgICAgIHJldHVybiBwYy55ZWxsb3cobWVzc2FnZSk7XG4gICAgICAgICAgICBjYXNlICdzdWNjZXNzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcGMuZ3JlZW4obWVzc2FnZSk7XG4gICAgICAgICAgICBjYXNlICdkZWJ1Zyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBjLmRpbShwYy5ibHVlKG1lc3NhZ2UpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgc2VyaWFsaXplQXJncyhhcmdzOiBMb2dNZXRob2RBcmdzKSB7XG4gICAgICAgIHJldHVybiBhcmdzLm1hcCgoZGF0YSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGluc3BlY3QoZGF0YSwgeyBkZXB0aDogMiwgY29sb3JzOiB0cnVlIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHByaW50KGxvZzogRGF0YVN0cmVhbURvY3VtZW50KSB7XG4gICAgICAgIGNvbnN0IGxldmVsczogUmVjb3JkPERhdGFTdHJlYW1Eb2N1bWVudFsnbGV2ZWwnXSwgKC4uLmFyZ3M6IExvZ01ldGhvZEFyZ3MpID0+IHZvaWQ+ID0ge1xuICAgICAgICAgICAgaW5mbzogKG1lc3NhZ2U6IHVua25vd24sIC4uLmFyZ3M6IHVua25vd25bXSkgPT4gY29uc29sZS5pbmZvKHRoaXMuc3R5bGVNZXNzYWdlKHsgbWVzc2FnZTogU3RyaW5nKG1lc3NhZ2UpLCBsZXZlbDogJ2luZm8nLCBzZW5kZXI6IGxvZy5zZW5kZXIgfSksIC4uLmFyZ3MpLFxuICAgICAgICAgICAgZXJyb3I6IChtZXNzYWdlOiB1bmtub3duLCAuLi5hcmdzOiB1bmtub3duW10pID0+IGNvbnNvbGUuZXJyb3IodGhpcy5zdHlsZU1lc3NhZ2UoeyBtZXNzYWdlOiBTdHJpbmcobWVzc2FnZSksIGxldmVsOiAnZXJyb3InLCBzZW5kZXI6IGxvZy5zZW5kZXIgfSksIC4uLmFyZ3MpLFxuICAgICAgICAgICAgd2FybjogKG1lc3NhZ2U6IHVua25vd24sIC4uLmFyZ3M6IHVua25vd25bXSkgPT4gY29uc29sZS53YXJuKHRoaXMuc3R5bGVNZXNzYWdlKHsgbWVzc2FnZTogU3RyaW5nKG1lc3NhZ2UpLCBsZXZlbDogJ3dhcm4nLCBzZW5kZXI6IGxvZy5zZW5kZXIgfSksIC4uLmFyZ3MpLFxuICAgICAgICAgICAgc3VjY2VzczogKG1lc3NhZ2U6IHVua25vd24sIC4uLmFyZ3M6IHVua25vd25bXSkgPT4gY29uc29sZS5sb2codGhpcy5zdHlsZU1lc3NhZ2UoeyBtZXNzYWdlOiBTdHJpbmcobWVzc2FnZSksIGxldmVsOiAnc3VjY2VzcycsIHNlbmRlcjogbG9nLnNlbmRlciB9KSwgLi4uYXJncyksXG4gICAgICAgICAgICBkZWJ1ZzogKG1lc3NhZ2U6IHVua25vd24sIC4uLmFyZ3M6IHVua25vd25bXSkgPT4gY29uc29sZS5kZWJ1Zyh0aGlzLnN0eWxlTWVzc2FnZSh7IG1lc3NhZ2U6IFN0cmluZyhtZXNzYWdlKSwgbGV2ZWw6ICdkZWJ1ZycsIHNlbmRlcjogbG9nLnNlbmRlciB9KSwgLi4uYXJncyksXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChsb2cubGV2ZWwgaW4gbGV2ZWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gbGV2ZWxzW2xvZy5sZXZlbF0obG9nLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmVycm9yKCdVbmtub3duIGxvZyBsZXZlbCcsIGxvZyk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBpbmZvKG1lc3NhZ2U6IHN0cmluZywgLi4uYXJnczogTG9nTWV0aG9kQXJncykge1xuICAgICAgICB0aGlzLnNlbmQoeyBtZXNzYWdlLCBhcmdzLCBsZXZlbDogJ2luZm8nIH0pO1xuICAgIH1cbiAgICBwdWJsaWMgZXJyb3IobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBMb2dNZXRob2RBcmdzKSB7XG4gICAgICAgIHRoaXMuc2VuZCh7IG1lc3NhZ2UsIGFyZ3MsIGxldmVsOiAnZXJyb3InIH0pO1xuICAgIH1cbiAgICBwdWJsaWMgd2FybihtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IExvZ01ldGhvZEFyZ3MpIHtcbiAgICAgICAgdGhpcy5zZW5kKHsgbWVzc2FnZSwgYXJncywgbGV2ZWw6ICd3YXJuJyB9KTtcbiAgICB9XG4gICAgcHVibGljIHN1Y2Nlc3MobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBMb2dNZXRob2RBcmdzKSB7XG4gICAgICAgIHRoaXMuc2VuZCh7IG1lc3NhZ2UsIGFyZ3MsIGxldmVsOiAnc3VjY2VzcycgfSk7XG4gICAgfVxuICAgIHB1YmxpYyBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IExvZ01ldGhvZEFyZ3MpIHtcbiAgICAgICAgdGhpcy5zZW5kKHsgbWVzc2FnZSwgYXJncywgbGV2ZWw6ICdkZWJ1ZycgfSk7XG4gICAgfVxufVxuXG50eXBlIExvZ01ldGhvZEFyZ3MgPSB1bmtub3duW107XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBERFBMb2dnZXIoKTsiLCJleHBvcnQgY2xhc3MgTWV0ZW9yVml0ZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBkZXRhaWxzPzogeyBjYXVzZT86IHVua25vd24gfSkge1xuICAgICAgICBzdXBlcihcbiAgICAgICAgICAgIGDimqEgICR7bWVzc2FnZX1gLFxuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBNaWdodCBvciBtaWdodCBub3QgYmUgc3VwcG9ydGVkIGRlcGVuZGluZyBvbiBNZXRlb3IncyBub2RlIHZlcnNpb24uXG4gICAgICAgICAgICBkZXRhaWxzXG4gICAgICAgICk7XG4gICAgfVxufSIsImltcG9ydCB7IGN3ZCwgZ2V0UHJvamVjdFBhY2thZ2VKc29uIH0gZnJvbSAnLi4vd29ya2Vycyc7XG5pbXBvcnQgUGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IE9TIGZyb20gJ25vZGU6b3MnO1xuaW1wb3J0IEZTIGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHsgTWV0ZW9yVml0ZUVycm9yIH0gZnJvbSAnLi9FcnJvcnMnO1xuXG5leHBvcnQgZnVuY3Rpb24gbXNUb0h1bWFuVGltZShtaWxsaXNlY29uZHM6IG51bWJlcikge1xuICAgIGNvbnN0IGR1cmF0aW9uID0ge1xuICAgICAgICBjb3VudDogbWlsbGlzZWNvbmRzLFxuICAgICAgICB0eXBlOiAnbXMnLFxuICAgIH1cbiAgICBcbiAgICBpZiAobWlsbGlzZWNvbmRzID4gMTAwMCkge1xuICAgICAgICBkdXJhdGlvbi5jb3VudCA9IG1pbGxpc2Vjb25kcyAvIDEwMDA7XG4gICAgICAgIGR1cmF0aW9uLnR5cGUgPSAncyc7XG4gICAgfVxuICAgIFxuICAgIGlmIChkdXJhdGlvbi50eXBlID09PSAncycgJiYgZHVyYXRpb24uY291bnQgPiA2MCkge1xuICAgICAgICBkdXJhdGlvbi50eXBlID0gJ21pbidcbiAgICAgICAgZHVyYXRpb24uY291bnQgPSBkdXJhdGlvbi5jb3VudCAvIDYwO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChkdXJhdGlvbi5jb3VudCAqIDEwMCkgLyAxMDB9JHtkdXJhdGlvbi50eXBlfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3NpeFBhdGgoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHJldHVybiBmaWxlUGF0aC5zcGxpdChQYXRoLnNlcCkuam9pbignLycpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZW1wRGlyKCkge1xuICAgIGNvbnN0IHBhY2thZ2VKc29uID0gZ2V0UHJvamVjdFBhY2thZ2VKc29uKCk7XG4gICAgY29uc3QgdGVtcFJvb3REaXIgPSBwYWNrYWdlSnNvbj8ubWV0ZW9yPy52aXRlPy50ZW1wQnVpbGREaXIgfHwgT1MudG1wZGlyKCk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdGVtcERpciA9IFBhdGgucmVzb2x2ZSh0ZW1wUm9vdERpciwgJ21ldGVvci12aXRlJywgcGFja2FnZUpzb24ubmFtZSk7XG4gICAgICAgIEZTLm1rZGlyU3luYyh0ZW1wRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIHRlbXBEaXI7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS53YXJuKG5ldyBNZXRlb3JWaXRlRXJyb3IoYFVuYWJsZSB0byBzZXQgdXAgdGVtcCBkaXJlY3RvcnkgZm9yIG1ldGVvci12aXRlIGJ1bmRsZXMuIFdpbGwgdXNlIG5vZGVfbW9kdWxlcyBpbnN0ZWFkYCwgeyBjYXVzZTogZXJyb3IgfSkpO1xuICAgICAgICByZXR1cm4gUGF0aC5yZXNvbHZlKGN3ZCwgJ25vZGVfbW9kdWxlcycsICcudml0ZS1tZXRlb3ItdGVtcCcpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERldlNlcnZlckhvc3QoKTogeyBob3N0OiBzdHJpbmcsIHBvcnQ6IG51bWJlciwgZmFsbGJhY2s6IGJvb2xlYW4gfSB7XG4gICAgbGV0IHsgcG9ydFN0cmluZywgaG9zdG5hbWUgfSA9IHByb2Nlc3MuYXJndi5qb2luKCcgJykubWF0Y2goLy0tcG9ydFtcXHM9XSg/PGhvc3RuYW1lPltcXGRcXHcuXSs6KT8oPzxwb3J0U3RyaW5nPltcXGRdKykvKT8uZ3JvdXBzIHx8IHt9O1xuICAgIGNvbnN0IHsgTUVURU9SX1BPUlQsIEREUF9ERUZBVUxUX0NPTk5FQ1RJT05fVVJMLCBNT0JJTEVfRERQX1VSTCB9ID0gcHJvY2Vzcy5lbnY7XG4gICAgXG4gXG4gICAgaWYgKCFwb3J0U3RyaW5nICYmIE1FVEVPUl9QT1JUKSB7XG4gICAgICAgIHBvcnRTdHJpbmcgPSBNRVRFT1JfUE9SVDtcbiAgICB9XG4gICAgXG4gICAgaWYgKCFwb3J0U3RyaW5nICYmIEREUF9ERUZBVUxUX0NPTk5FQ1RJT05fVVJMKSB7XG4gICAgICAgIGNvbnN0IHsgcG9ydCwgaG9zdCB9ID0gRERQX0RFRkFVTFRfQ09OTkVDVElPTl9VUkw/Lm1hdGNoKC9cXC9cXC8oPzxob3N0PltcXGRcXHdcXC1fLl0rKTooPzxwb3J0PlxcZCspLyk/Lmdyb3VwcyB8fCB7IHBvcnQ6ICcnLCBob3N0OiAnJyB9O1xuICAgICAgICBwb3J0U3RyaW5nID0gcG9ydDtcbiAgICAgICAgaG9zdG5hbWUgPSBob3N0O1xuICAgIH1cbiAgICBcbiAgICBpZiAoIXBvcnRTdHJpbmcgJiYgTU9CSUxFX0REUF9VUkwpIHtcbiAgICAgICAgY29uc3QgeyBwb3J0IH0gPSBNT0JJTEVfRERQX1VSTD8ubWF0Y2goLzooPzxwb3J0PlxcZCspLyk/Lmdyb3VwcyB8fCB7IHBvcnQ6ICcnIH07XG4gICAgICAgIHBvcnRTdHJpbmcgPSBwb3J0O1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBwb3J0ID0gcGFyc2VJbnQocG9ydFN0cmluZyk7XG4gICAgXG4gICAgaWYgKE51bWJlci5pc05hTihwb3J0KSkge1xuICAgICAgICBjb25zb2xlLndhcm4obmV3IE1ldGVvclZpdGVFcnJvcihgVW5hYmxlIHRvIGRldGVybWluZSB0aGUgcG9ydCBmb3IgeW91ciBNZXRlb3IgZGV2ZWxvcG1lbnQgc2VydmVyLiBXZSdyZSBnb2luZyB0byBhc3N1bWUgaXQncyBsb2NhbGhvc3Q6MzAwMC4gSWYgeW91J3JlIHVzaW5nIGEgZGlmZmVyZW50IHBvcnQgc3BlY2lmeSBpdCB1c2luZyB0aGUgTUVURU9SX1BPUlQgZW52aXJvbm1lbnQgdmFyaWFibGUgc28gdGhhdCBWaXRlIGNhbiBmdW5jdGlvbiBjb3JyZWN0bHkuIEUuZy4gTUVURU9SX1BPUlQ9MzAzMGApKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZhbGxiYWNrOiB0cnVlLFxuICAgICAgICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgICAgICAgICBwb3J0OiAzMDAwLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgICBmYWxsYmFjazogZmFsc2UsXG4gICAgICAgIGhvc3Q6IGhvc3RuYW1lIHx8ICdsb2NhbGhvc3QnLFxuICAgICAgICBwb3J0LFxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNZXRlb3JSdW50aW1lQ29uZmlnKCkge1xuICAgIGNvbnN0IGFwcElkID0gX19tZXRlb3JfYm9vdHN0cmFwX18/LmNvbmZpZ0pzb24/LmFwcElkO1xuICAgIGNvbnN0IHsgcG9ydCwgaG9zdCwgZmFsbGJhY2sgfSA9IGdldERldlNlcnZlckhvc3QoKTtcbiAgICBcbiAgICBpZiAoIWFwcElkKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihuZXcgTWV0ZW9yVml0ZUVycm9yKCdVbmFibGUgdG8gcmV0cmlldmUgeW91ciBNZXRlb3IgQXBwIElELiAoYC4vLm1ldGVvci8uaWRgKSBUaGlzIGlzIHByb2JhYmx5IGZpbmUgaW4gbW9zdCBjYXNlcywgYnV0IGNhbiBsZWFkIHRvIGlzc3VlcyB3aGVuIHJ1bm5pbmcgbXVsdGlwbGUgY29uY3VycmVudCBpbnN0YW5jZXMuIFBsZWFzZSBkbyByZXBvcnQgdGhpcyBpc3N1ZSBvbiBHaXRIdWIg8J+ZjyBodHRwczovL2dpdGh1Yi5jb20vSm9yZ2VuVmF0bGUvbWV0ZW9yLXZpdGUvaXNzdWVzJykpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgICBob3N0LFxuICAgICAgICBwb3J0LFxuICAgICAgICBhcHBJZCxcbiAgICAgICAgZmFsbGJhY2ssXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnVpbGRDb25maWcoKSB7XG4gICAgY29uc3QgcGFja2FnZUpzb24gPSBnZXRQcm9qZWN0UGFja2FnZUpzb24oKTtcbiAgICBjb25zdCB0ZW1wRGlyID0gZ2V0VGVtcERpcigpO1xuICAgIFxuICAgIC8vIE5vdCBpbiBhIHByb2plY3QgKHB1Ymxpc2hpbmcgdGhlIHBhY2thZ2Ugb3IgaW4gdGVtcG9yYXJ5IE1ldGVvciBidWlsZClcbiAgICBjb25zdCBwbHVnaW5FbmFibGVkID0gIXByb2Nlc3MuZW52LlZJVEVfTUVURU9SX0RJU0FCTEVEICYmICFwcm9jZXNzLmVudi5NRVRFT1JfVklURV9ESVNBQkxFRDtcbiAgICBcbiAgICAvKipcbiAgICAgKiBNZXRlb3IgY2xpZW50IG1haW5Nb2R1bGUgYXMgc3BlY2lmaWVkIGluIHRoZSBwYWNrYWdlLmpzb24gZmlsZS4gVGhpcyBpcyB3aGVyZSB3ZSB3aWxsIHB1c2ggdGhlIGZpbmFsIFZpdGUgYnVuZGxlLlxuICAgICAqL1xuICAgIGNvbnN0IG1ldGVvck1haW5Nb2R1bGUgPSBwYWNrYWdlSnNvbi5tZXRlb3I/Lm1haW5Nb2R1bGU/LmNsaWVudFxuICAgIFxuICAgIC8qKlxuICAgICAqIERlc3RpbmF0aW9uIGRpcmVjdG9yeSBpbnNpZGUgdGhlIHNvdXJjZSBNZXRlb3IgcHJvamVjdCBmb3IgdGhlIHRyYW5zcGlsZWQgVml0ZSBidW5kbGUuXG4gICAgICogVGhpcyBpcyB3aGF0IGlzIGZlZCBpbnRvIE1ldGVvciBhdCB0aGUgZW5kIG9mIHRoZSBidWlsZCBwcm9jZXNzLlxuICAgICAqL1xuICAgIGNvbnN0IHZpdGVPdXRTcmNEaXIgPSBQYXRoLmpvaW4oY3dkLCAnX3ZpdGUtYnVuZGxlJywgJ2NsaWVudCcpXG4gICAgXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgTWV0ZW9yIGlzIHJ1bm5pbmcgdXNpbmcgdGhlIC0tcHJvZHVjdGlvbiBmbGFnIGFuZCBub3QgYWN0dWFsbHkgYnVuZGxpbmcgZm9yIHByb2R1Y3Rpb24uXG4gICAgICogVGhpcyBpcyBpbXBvcnRhbnQgdG8gY2hlY2sgZm9yIGFzIHdlIG5vcm1hbGx5IGNsZWFuIHVwIHRoZSBmaWxlcyBjcmVhdGVkIGZvciBwcm9kdWN0aW9uIG9uY2Ugb3VyIGNvbXBpbGVyXG4gICAgICogcGx1Z2luIGZpbmlzaGVzLlxuICAgICAqL1xuICAgIGNvbnN0IGlzU2ltdWxhdGVkUHJvZHVjdGlvbiA9IHByb2Nlc3MuYXJndi5pbmNsdWRlcygnLS1wcm9kdWN0aW9uJyk7XG4gICAgXG4gICAgLyoqXG4gICAgICogSW50ZXJtZWRpYXJ5IE1ldGVvciBwcm9qZWN0IC0gdXNlZCB0byBidWlsZCB0aGUgVml0ZSBidW5kbGUgaW4gYSBzYWZlIGVudmlyb25tZW50IHdoZXJlIGFsbCB0aGUgTWV0ZW9yXG4gICAgICogcGFja2FnZXMgZnJvbSB0aGUgc291cmNlIHByb2plY3QgYXJlIGF2YWlsYWJsZSB0byBvdXIgVml0ZSBwbHVnaW4gdG8gYW5hbHl6ZSBmb3IgY3JlYXRpbmcgRVNNIGV4cG9ydCBzdHVicy5cbiAgICAgKi9cbiAgICBjb25zdCB0ZW1wTWV0ZW9yUHJvamVjdCA9IFBhdGgucmVzb2x2ZSh0ZW1wRGlyLCAnbWV0ZW9yJykgLy8gVGVtcG9yYXJ5IE1ldGVvciBwcm9qZWN0IHNvdXJjZVxuICAgIGNvbnN0IHRlbXBNZXRlb3JPdXREaXIgPSBQYXRoLmpvaW4odGVtcERpciwgJ2J1bmRsZScsICdtZXRlb3InKTsgLy8gVGVtcG9yYXJ5IE1ldGVvciBwcm9kdWN0aW9uIGJ1bmRsZVxuICAgIFxuICAgIGlmIChwbHVnaW5FbmFibGVkICYmICFwYWNrYWdlSnNvbi5tZXRlb3IubWFpbk1vZHVsZSkge1xuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yVml0ZUVycm9yKCdObyBtZXRlb3IgbWFpbiBtb2R1bGUgZm91bmQsIHBsZWFzZSBhZGQgbWV0ZW9yLm1haW5Nb2R1bGUuY2xpZW50IHRvIHlvdXIgcGFja2FnZS5qc29uJylcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFja2FnZUpzb24sXG4gICAgICAgIHRlbXBNZXRlb3JPdXREaXIsXG4gICAgICAgIHRlbXBNZXRlb3JQcm9qZWN0LFxuICAgICAgICBpc1NpbXVsYXRlZFByb2R1Y3Rpb24sXG4gICAgICAgIG1ldGVvck1haW5Nb2R1bGUsXG4gICAgICAgIHBsdWdpbkVuYWJsZWQsXG4gICAgICAgIHZpdGVPdXRTcmNEaXIsXG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBNZXRlb3JSdW50aW1lQ29uZmlnID0gUmV0dXJuVHlwZTx0eXBlb2YgZ2V0TWV0ZW9yUnVudGltZUNvbmZpZz47IiwiaW1wb3J0IHBjIGZyb20gJ3BpY29jb2xvcnMnO1xuaW1wb3J0IHsgaW5zcGVjdCB9IGZyb20gJ25vZGU6dXRpbCc7XG5pbXBvcnQgZnMgZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBwZXJmb3JtYW5jZSB9IGZyb20gJ25vZGU6cGVyZl9ob29rcyc7XG5pbXBvcnQgeyBtc1RvSHVtYW5UaW1lIH0gZnJvbSAnLi9IZWxwZXJzJztcblxuY2xhc3MgQnVpbGRMb2dnZXIge1xuICAgIHByb3RlY3RlZCBkZWJ1Z0VuYWJsZWQgPSBmYWxzZTtcbiAgICBwcm90ZWN0ZWQgZ2l0aHViID0gbmV3IEdpdGh1YkFjdGlvbnMoKTtcbiAgICBwcm90ZWN0ZWQgc3RhdGljIERFQlVHX0VOVl9UUklHR0VSUyA9IFtcbiAgICAgICAgJ3RydWUnLFxuICAgICAgICAnKicsXG4gICAgICAgICd2aXRlLWJ1bmRsZXI6KicsXG4gICAgXVxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBkZWJ1Z0VudiA9IHByb2Nlc3MuZW52LkRFQlVHIHx8ICdmYWxzZSc7XG4gICAgICAgIHRoaXMuZGVidWdFbmFibGVkID0gISFkZWJ1Z0Vudi50cmltKCkuc3BsaXQoL1xccysvKS5maW5kKChmaWVsZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIEJ1aWxkTG9nZ2VyLkRFQlVHX0VOVl9UUklHR0VSUy5pbmNsdWRlcyhmaWVsZC50cmltKCkpXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGluZm8obWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBMb2dNZXRob2RBcmdzKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhwYy5ibHVlKGDimqEgICR7bWVzc2FnZX1gKSwgLi4uYXJncylcbiAgICB9XG4gICAgcHVibGljIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgLi4uYXJnczogTG9nTWV0aG9kQXJncykge1xuICAgICAgICB0aGlzLmdpdGh1Yi5hbm5vdGF0ZShtZXNzYWdlLCB7fSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IocGMucmVkKGDimqEgICR7bWVzc2FnZX1gKSwgLi4uYXJncylcbiAgICB9XG4gICAgcHVibGljIHdhcm4obWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBMb2dNZXRob2RBcmdzKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihwYy55ZWxsb3coYOKaoSAgJHttZXNzYWdlfWApLCAuLi5hcmdzKVxuICAgIH1cbiAgICBwdWJsaWMgc3VjY2VzcyhtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IExvZ01ldGhvZEFyZ3MpIHtcbiAgICAgICAgY29uc29sZS5sb2cocGMuZ3JlZW4oYOKaoSAgJHttZXNzYWdlfWApLCAuLi5hcmdzKVxuICAgIH1cbiAgICBwdWJsaWMgZGVidWcobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBMb2dNZXRob2RBcmdzKSB7XG4gICAgICAgIGlmICghdGhpcy5kZWJ1Z0VuYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmRlYnVnKHBjLmRpbShwYy5ibHVlKGDimqEgICR7bWVzc2FnZX1gKSksIC4uLmFyZ3MpXG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBzdGFydFByb2ZpbGVyKCkge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbXBsZXRlOiAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZVdpdGhUaW1pbmcgPSBgJHttZXNzYWdlfSBpbiAke21zVG9IdW1hblRpbWUocGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWUpfWBcbiAgICAgICAgICAgICAgICB0aGlzLnN1Y2Nlc3MobWVzc2FnZVdpdGhUaW1pbmcpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2l0aHViLnN1bW1hcml6ZShtZXNzYWdlV2l0aFRpbWluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIEdpdGh1YkFjdGlvbnMge1xuICAgIHByb3RlY3RlZCByZWFkb25seSBzdW1tYXJ5TGluZXM6IHN0cmluZ1tdID0gW107XG4gICAgcHJvdGVjdGVkIHN0ZXBTdW1tYXJ5RmlsZTtcbiAgICBwcm90ZWN0ZWQgdXNlQW5ub3RhdGlvbnM7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5NRVRFT1JfVklURV9ESVNBQkxFX0NJX1NVTU1BUlkgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RlcFN1bW1hcnlGaWxlID0gcHJvY2Vzcy5lbnYuR0lUSFVCX1NURVBfU1VNTUFSWTtcbiAgICAgICAgdGhpcy51c2VBbm5vdGF0aW9ucyA9ICEhdGhpcy5zdGVwU3VtbWFyeUZpbGU7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBhbm5vdGF0ZShtZXNzYWdlOiBzdHJpbmcsIG9wdGlvbnM6IEdpdGh1YkFubm90YXRpb25PcHRpb25zID0ge30pIHtcbiAgICAgICAgaWYgKCF0aGlzLnVzZUFubm90YXRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGF0YTogc3RyaW5nW10gPSBPYmplY3QuZW50cmllcyhvcHRpb25zKS5tYXAoKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGAke2tleX09XCIke3ZhbHVlfVwiYFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKGA6Om5vdGljZSAke2RhdGEuam9pbigpfTo64pqhICAke21lc3NhZ2V9YCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBzdW1tYXJpemUobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBMb2dNZXRob2RBcmdzKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGVwU3VtbWFyeUZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkQXJncyA9IGFyZ3MubGVuZ3RoID8gaW5zcGVjdChhcmdzKSA6ICcnO1xuICAgICAgICB0aGlzLnN1bW1hcnlMaW5lcy5wdXNoKGDimqEgICR7bWVzc2FnZX0gJHtmb3JtYXR0ZWRBcmdzfWApO1xuICAgICAgICBjb25zdCBzdW1tYXJ5ID0gW1xuICAgICAgICAgICAgJ2BgYGxvZycsXG4gICAgICAgICAgICAnTWV0ZW9yLVZpdGUgYnVpbGQgbWV0cmljczonLFxuICAgICAgICAgICAgLi4udGhpcy5zdW1tYXJ5TGluZXMsXG4gICAgICAgICAgICAnYGBgJyxcbiAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgJzxkZXRhaWxzPicsXG4gICAgICAgICAgICAnPHN1bW1hcnk+R2VuZXJhdGVkIGJ5IE1ldGVvciBWaXRlPC9zdW1tYXJ5PicsXG4gICAgICAgICAgICAnXFxuJyxcbiAgICAgICAgICAgICdTdGVwIHN1bW1hcnkgZ2VuZXJhdGVkIGJ5IFtgam9yZ2VudmF0bGU6dml0ZS1idW5kbGVyYF0oaHR0cHM6Ly9naXRodWIuY29tL0pvcmdlblZhdGxlL21ldGVvci12aXRlKScsXG4gICAgICAgICAgICAnWW91IGNhbiBkaXNhYmxlIHRoaXMgYmVoYXZpb3VyIHdpdGggYW4gZW52aXJvbm1lbnQgdmFyaWFibGU6IGBNRVRFT1JfVklURV9ESVNBQkxFX0NJX1NVTU1BUlk9ZmFsc2VgJyxcbiAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgJzwvZGV0YWlscz4nLFxuICAgICAgICAgICAgJycsXG4gICAgICAgIF1cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLnN0ZXBTdW1tYXJ5RmlsZSwgc3VtbWFyeS5qb2luKCdcXG4nKSk7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgR2l0aHViQW5ub3RhdGlvbk9wdGlvbnMge1xuICAgIHRpdGxlPzogc3RyaW5nO1xufVxuXG50eXBlIExvZ01ldGhvZEFyZ3MgPSB1bmtub3duW107XG5leHBvcnQgZGVmYXVsdCBuZXcgQnVpbGRMb2dnZXIoKTtcbiIsImV4cG9ydCBpbnRlcmZhY2UgQm9pbGVycGxhdGVEYXRhIHtcbiAgICBjc3M6IHN0cmluZ1tdO1xuICAgIGpzOiB7XG4gICAgICAgIHVybDogc3RyaW5nO1xuICAgICAgICBzcmk6IHN0cmluZztcbiAgICB9W107XG4gICAgaGVhZDogc3RyaW5nO1xuICAgIGJvZHk6IHN0cmluZztcbiAgICBtZXRlb3JNYW5pZmVzdDogc3RyaW5nO1xuICAgIGFkZGl0aW9uYWxTdGF0aWNKczogc3RyaW5nW107XG4gICAgbWV0ZW9yUnVudGltZUNvbmZpZzogc3RyaW5nO1xuICAgIG1ldGVvclJ1bnRpbWVIYXNoOiBzdHJpbmc7XG4gICAgcm9vdFVybFBhdGhQcmVmaXg6IHN0cmluZztcbiAgICBidW5kbGVkSnNDc3NVcmxSZXdyaXRlSG9vazogRnVuY3Rpb247XG4gICAgc3JpTW9kZTogdW5kZWZpbmVkO1xuICAgIGlubGluZVNjcmlwdHNBbGxvd2VkOiBib29sZWFuO1xuICAgIGlubGluZTogdW5kZWZpbmVkO1xuICAgIGh0bWxBdHRyaWJ1dGVzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBkeW5hbWljSGVhZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGR5bmFtaWNCb2R5OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCB0eXBlIEJvaWxlcnBsYXRlID0ge1xuICAgIGR5bmFtaWNIZWFkPzogc3RyaW5nO1xuICAgIGR5bmFtaWNCb2R5Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVml0ZUJvaWxlcnBsYXRlIHtcbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0Qm9pbGVycGxhdGUoKTogUHJvbWlzZTxCb2lsZXJwbGF0ZT4gfCBCb2lsZXJwbGF0ZTtcbn0iLCJpbXBvcnQgeyBmZXRjaCB9IGZyb20gJ21ldGVvci9mZXRjaCc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEREUF9JUEMgfSBmcm9tICcuLi9hcGkvRERQLUlQQyc7XG5pbXBvcnQge1xuICAgIERldkNvbm5lY3Rpb25Mb2csXG4gICAgZ2V0Q29uZmlnLFxuICAgIE1ldGVvclZpdGVDb25maWcsXG4gICAgc2V0Q29uZmlnLFxuICAgIFZpdGVDb25uZWN0aW9uLCBWaXRlRGV2U2NyaXB0cyxcbn0gZnJvbSAnLi4vbG9hZGluZy92aXRlLWNvbm5lY3Rpb24taGFuZGxlcic7XG5pbXBvcnQgeyBnZXRCdWlsZENvbmZpZywgZ2V0TWV0ZW9yUnVudGltZUNvbmZpZyB9IGZyb20gJy4uL3V0aWxpdHkvSGVscGVycyc7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4uL3V0aWxpdHkvTG9nZ2VyJztcbmltcG9ydCB7IGNyZWF0ZVdvcmtlckZvcmssIGdldFByb2plY3RQYWNrYWdlSnNvbiwgaXNNZXRlb3JJUENNZXNzYWdlLCB0eXBlIFdvcmtlckluc3RhbmNlIH0gZnJvbSAnLi4vd29ya2Vycyc7XG5pbXBvcnQgeyB0eXBlIEJvaWxlcnBsYXRlLCBWaXRlQm9pbGVycGxhdGUgfSBmcm9tICcuL2NvbW1vbic7XG5cblxuZXhwb3J0IGNsYXNzIFZpdGVEZXZTZXJ2ZXJXb3JrZXIgZXh0ZW5kcyBWaXRlQm9pbGVycGxhdGUge1xuICAgIHByb3RlY3RlZCB2aXRlU2VydmVyPzogV29ya2VySW5zdGFuY2U7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBzdGFydCgpIHtcbiAgICAgICAgaWYgKE1ldGVvci5pc1Byb2R1Y3Rpb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVHJpZWQgdG8gc3RhcnQgVml0ZSBkZXYgc2VydmVyIGluIHByb2R1Y3Rpb24hJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFnZXRCdWlsZENvbmZpZygpLnBsdWdpbkVuYWJsZWQpIHtcbiAgICAgICAgICAgIExvZ2dlci53YXJuKCdNZXRlb3IgVml0ZSBwbHVnaW4gZGlzYWJsZWQuIEFib3J0aW5nIGRldiBzZXJ2ZXIgc3RhcnR1cCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBEZXZDb25uZWN0aW9uTG9nLmluZm8oJ1N0YXJ0aW5nIFZpdGUgc2VydmVyLi4uJyk7XG4gICAgICAgIGNvbnN0IGlwYyA9IG5ldyBERFBfSVBDKHtcbiAgICAgICAgICAgIGFzeW5jIHZpdGVDb25maWcoY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyByZWFkeSB9ID0gYXdhaXQgc2V0Q29uZmlnKGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgaWYgKHJlYWR5KSB7XG4gICAgICAgICAgICAgICAgICAgIERldkNvbm5lY3Rpb25Mb2cuaW5mbyhgTWV0ZW9yLVZpdGUgcmVhZHkgZm9yIGNvbm5lY3Rpb25zIWApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmVmcmVzaE5lZWRlZCgpIHtcbiAgICAgICAgICAgICAgICBEZXZDb25uZWN0aW9uTG9nLmluZm8oJ1NvbWUgbGF6eS1sb2FkZWQgcGFja2FnZXMgd2VyZSBpbXBvcnRlZCwgcGxlYXNlIHJlZnJlc2gnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3Qgdml0ZVNlcnZlciA9IHRoaXMudml0ZVNlcnZlciA9IGNyZWF0ZVdvcmtlckZvcmsoe1xuICAgICAgICAgICAgdml0ZUNvbmZpZzogaXBjLnJlc3BvbnNlSG9va3Mudml0ZUNvbmZpZyxcbiAgICAgICAgICAgIHJlZnJlc2hOZWVkZWQ6IGlwYy5yZXNwb25zZUhvb2tzLnJlZnJlc2hOZWVkZWQsXG4gICAgICAgIH0sIHsgZGV0YWNoZWQ6IHRydWUsIGlwYyB9KTtcbiAgICAgICAgXG4gICAgICAgIE1ldGVvci5wdWJsaXNoKFZpdGVDb25uZWN0aW9uLnB1YmxpY2F0aW9uLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gTWV0ZW9yVml0ZUNvbmZpZy5maW5kKFZpdGVDb25uZWN0aW9uLmNvbmZpZ1NlbGVjdG9yKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBNZXRlb3IubWV0aG9kcyh7XG4gICAgICAgICAgICBbVml0ZUNvbm5lY3Rpb24ubWV0aG9kcy5yZWZyZXNoQ29uZmlnXSgpIHtcbiAgICAgICAgICAgICAgICBEZXZDb25uZWN0aW9uTG9nLmluZm8oJ1JlZnJlc2hpbmcgY29uZmlndXJhdGlvbiBmcm9tIFZpdGUgZGV2IHNlcnZlci4uLicpXG4gICAgICAgICAgICAgICAgdml0ZVNlcnZlci5jYWxsKHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAndml0ZS5zZXJ2ZXIuZ2V0Q29uZmlnJyxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBbXSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0Q29uZmlnKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdml0ZVNlcnZlci5jYWxsKHtcbiAgICAgICAgICAgIG1ldGhvZDogJ3ZpdGUuc2VydmVyLnN0YXJ0JyxcbiAgICAgICAgICAgIHBhcmFtczogW3tcbiAgICAgICAgICAgICAgICBwYWNrYWdlSnNvbjogZ2V0UHJvamVjdFBhY2thZ2VKc29uKCksXG4gICAgICAgICAgICAgICAgbWV0ZW9yUGFyZW50UGlkOiBwcm9jZXNzLnBwaWQsXG4gICAgICAgICAgICAgICAgbWV0ZW9yQ29uZmlnOiBnZXRNZXRlb3JSdW50aW1lQ29uZmlnKCksXG4gICAgICAgICAgICB9XVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIEZvcndhcmQgSVBDIG1lc3NhZ2VzIGZyb20gdGhlIGBtZXRlb3ItdG9vbGAgcGFyZW50IHByb2Nlc3MgdG8gdGhlIFZpdGUgc2VydmVyXG4gICAgICAgIC8vIFVzZWQgdG8gbm90aWZ5IG91ciBWaXRlIGJ1aWxkIHBsdWdpbiBvZiB0aGluZ3MgbGlrZSB0aGUgY2xpZW50IGJ1bmRsZSBvciBBdG1vc3BoZXJlIHBhY2thZ2VzIGJlaW5nIHJlYnVpbHQuXG4gICAgICAgIHByb2Nlc3Mub24oJ21lc3NhZ2UnLCBhc3luYyAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFpc01ldGVvcklQQ01lc3NhZ2UobWVzc2FnZSkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IHsgYmFzZVVybCwgcmVhZHkgfSA9IGF3YWl0IGdldENvbmZpZygpO1xuICAgICAgICAgICAgaWYgKCFyZWFkeSkgcmV0dXJuO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBhd2FpdCBmZXRjaChgJHtiYXNlVXJsfS9fX21ldGVvcl9fL2lwYy1tZXNzYWdlYCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpLFxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yOiB1bmtub3duKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgYXN5bmMgZ2V0Qm9pbGVycGxhdGUoKTogUHJvbWlzZTxCb2lsZXJwbGF0ZT4ge1xuICAgICAgICBjb25zdCBzY3JpcHRzID0gbmV3IFZpdGVEZXZTY3JpcHRzKGF3YWl0IGdldENvbmZpZygpKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkeW5hbWljQm9keTogYXdhaXQgc2NyaXB0cy5zdHJpbmdUZW1wbGF0ZSgpLFxuICAgICAgICB9XG4gICAgfVxufSIsImltcG9ydCBGUyBmcm9tICdmcyc7XG5pbXBvcnQgdHlwZSB7IFRyYW5zZm9ybWVkVml0ZU1hbmlmZXN0IH0gZnJvbSAnbWV0ZW9yLXZpdGUvbWV0ZW9yL0lQQy9tZXRob2RzL2J1aWxkJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgV2ViQXBwLCBXZWJBcHBJbnRlcm5hbHMgfSBmcm9tICdtZXRlb3Ivd2ViYXBwJztcbmltcG9ydCBQYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IFV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4uL3V0aWxpdHkvTG9nZ2VyJztcbmltcG9ydCB7IHR5cGUgQm9pbGVycGxhdGUsIFZpdGVCb2lsZXJwbGF0ZSB9IGZyb20gJy4vY29tbW9uJztcblxuZXhwb3J0IGNsYXNzIFZpdGVQcm9kdWN0aW9uQm9pbGVycGxhdGUgZXh0ZW5kcyBWaXRlQm9pbGVycGxhdGUge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0IGFzc2V0RGlyKCkge1xuICAgICAgICByZXR1cm4gJy8nICsgdGhpcy52aXRlTWFuaWZlc3QuYXNzZXRzRGlyLnJlcGxhY2UoL15cXC8rLywgJycpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0IGJhc2VVcmwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZpdGVNYW5pZmVzdC5iYXNlO1xuICAgIH1cbiAgICBcbiAgICBwcm90ZWN0ZWQgZmlsZVBhdGgoZmlsZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLmJhc2VVcmwucmVwbGFjZSgvXFwvPyQvLCAnJyl9LyR7ZmlsZX1gO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0Qm9pbGVycGxhdGUoKTogQm9pbGVycGxhdGUge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZHluYW1pY0hlYWQ6IHRoaXMuZHluYW1pY0hlYWQsXG4gICAgICAgICAgICBkeW5hbWljQm9keTogJydcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIGdldCBkeW5hbWljSGVhZCgpIHtcbiAgICAgICAgY29uc3QgaW1wb3J0cyA9IHRoaXMuaW1wb3J0cztcbiAgICAgICAgY29uc3QgbGluZXMgPSBbXTtcbiAgICAgICAgY29uc3QgcHJlZmV0Y2hBcnJheTogUHJlZmV0Y2hPYmplY3RbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGltcG9ydHMuc3R5bGVzaGVldHMpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBjcm9zc29yaWdpbiBocmVmPVwiJHt0aGlzLmZpbGVQYXRoKGZpbGUpfVwiPmApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgaW1wb3J0cy5tb2R1bGVzKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGA8c2NyaXB0IHR5cGU9XCJtb2R1bGVcIiBjcm9zc29yaWdpbiBzcmM9XCIke3RoaXMuZmlsZVBhdGgoZmlsZSl9XCI+PC9zY3JpcHQ+YCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBpbXBvcnRzLm1vZHVsZVByZWxvYWQpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYDxsaW5rIHJlbD1cIm1vZHVsZXByZWxvYWRcIiBjcm9zc29yaWdpbiBocmVmPVwiJHt0aGlzLmZpbGVQYXRoKGZpbGUpfVwiPmApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgaW1wb3J0cy5tb2R1bGVMYXp5UHJlZmV0Y2gpIHtcbiAgICAgICAgICAgIHByZWZldGNoQXJyYXkucHVzaCh7XG4gICAgICAgICAgICAgICAgaHJlZjogdGhpcy5maWxlUGF0aChmaWxlKSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBpbXBvcnRzLmNzc0xhenlQcmVmZXRjaCkge1xuICAgICAgICAgICAgcHJlZmV0Y2hBcnJheS5wdXNoKHtcbiAgICAgICAgICAgICAgICBocmVmOiB0aGlzLmZpbGVQYXRoKGZpbGUpLFxuICAgICAgICAgICAgICAgIGFzOiAnc3R5bGUnLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gbGF6eVByZWZldGNoKGFzc2V0czogUHJlZmV0Y2hPYmplY3RbXSkge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFrZUxpbmsgPSAoYXNzZXQ6IFByZWZldGNoT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJylcbiAgICAgICAgICAgICAgICAgICAgbGluay5yZWwgPSAncHJlZmV0Y2gnO1xuICAgICAgICAgICAgICAgICAgICBsaW5rLmZldGNoUHJpb3JpdHkgPSAnbG93JztcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKGFzc2V0KS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGlua1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkTmV4dCA9IChhc3NldHM6IFByZWZldGNoT2JqZWN0W10sIGNvdW50OiBudW1iZXIpID0+IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID4gYXNzZXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgPSBhc3NldHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcmFnbWVudCA9IG5ldyBEb2N1bWVudEZyYWdtZW50XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhc3NldCA9IGFzc2V0cy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhc3NldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGluayA9IG1ha2VMaW5rKGFzc2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kKGxpbmspXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudC0tXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhc3NldHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluay5vbmxvYWQgPSAoKSA9PiBsb2FkTmV4dChhc3NldHMsIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluay5vbmVycm9yID0gKCkgPT4gbG9hZE5leHQoYXNzZXRzLCAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZChmcmFnbWVudClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxvYWROZXh0KGFzc2V0cywgMyk7XG4gICAgICAgICAgICB9KSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCFwcm9jZXNzLmVudi5ESVNBQkxFX0ZVTExfQVBQX1BSRUZFVENIKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgIGA8c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIj5gLFxuICAgICAgICAgICAgICAgIGAke2xhenlQcmVmZXRjaC50b1N0cmluZygpfTtgLFxuICAgICAgICAgICAgICAgIGBsYXp5UHJlZmV0Y2goJHtKU09OLnN0cmluZ2lmeShwcmVmZXRjaEFycmF5KX0pYCxcbiAgICAgICAgICAgICAgICBgPC9zY3JpcHQ+YFxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBnZXQgdml0ZU1hbmlmZXN0KCk6IFRyYW5zZm9ybWVkVml0ZU1hbmlmZXN0IHtcbiAgICAgICAgaWYgKE1ldGVvci5zZXR0aW5ncy52aXRlPy5tYW5pZmVzdCkge1xuICAgICAgICAgICAgcmV0dXJuIE1ldGVvci5zZXR0aW5ncy52aXRlLm1hbmlmZXN0O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTZWFyY2ggTWV0ZW9yJ3MgcHJvZ3JhbS5qc29uIGZpbGUgZm9yIFZpdGUncyBtYW5pZmVzdC5qc29uIGZpbGVcbiAgICAgICAgY29uc3Qgdml0ZU1hbmlmZXN0SW5mbyA9IFdlYkFwcC5jbGllbnRQcm9ncmFtc1snd2ViLmJyb3dzZXInXS5tYW5pZmVzdC5maW5kKCh7IHBhdGggfTogTWV0ZW9yUHJvZ3JhbU1hbmlmZXN0KSA9PiBwYXRoLmVuZHNXaXRoKCd2aXRlLW1hbmlmZXN0Lmpzb24nKSk7XG4gICAgICAgIGlmICghdml0ZU1hbmlmZXN0SW5mbykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBWaXRlIG1hbmlmZXN0IGluIE1ldGVvciBjbGllbnQgcHJvZ3JhbSBtYW5pZmVzdCcpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBSZWFkIGFuZCBjYWNoZSB0aGUgY29udGVudHMgb2YgdGhlIHZpdGUgbWFuaWZlc3QuanNvbiBmaWxlLlxuICAgICAgICBjb25zdCB2aXRlTWFuaWZlc3RQYXRoID0gUGF0aC5qb2luKF9fbWV0ZW9yX2Jvb3RzdHJhcF9fLnNlcnZlckRpciwgJy4uJywgJ3dlYi5icm93c2VyJywgdml0ZU1hbmlmZXN0SW5mby5wYXRoKTtcbiAgICAgICAgY29uc3QgbWFuaWZlc3QgPSBKU09OLnBhcnNlKEZTLnJlYWRGaWxlU3luYyh2aXRlTWFuaWZlc3RQYXRoLCAndXRmOCcpKTtcbiAgICAgICAgTWV0ZW9yLnNldHRpbmdzLnZpdGUgPSB7IG1hbmlmZXN0IH07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbWFuaWZlc3Q7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIE1hcmsgYXNzZXRzIGJ1aWx0IGJ5IFZpdGUgYXMgY2FjaGVhYmxlIGluIE1ldGVvcidzIHByb2dyYW0uanNvbiBmaWxlIGZvciBib3RoIGxlZ2FjeSBhbmQgbW9kZXJuIGJyb3dzZXJzLlxuICAgICAqIEJlY2F1c2Ugb2YgdGhlIHdheSBNZXRlb3IgaGFuZGxlcyBub24tY2FjaGVhYmxlIGFzc2V0cywgaGVhZGVycyBhcmUgYWRkZWQgdGhhdCBtYWtlIGl0IHRyaWNreSB0byBjYWNoZSB3aXRoXG4gICAgICogYSBzdGFuZGFyZCByZXZlcnNlIHByb3h5IGNvbmZpZy4gWW91IHdvdWxkIGhhdmUgdG8gZXhwbGljaXRseSBvdmVycmlkZSB0aGUgY2FjaGluZyBoZWFkZXJzIGZvciBhbGwgZmlsZXMgc2VydmVkXG4gICAgICogYnkgbWV0ZW9yIGF0IC92aXRlLWFzc2V0cy5cbiAgICAgKlxuICAgICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIE1ldGVvciB3b3VsZCBiZSB0byBzZXQgYSBtYXgtYWdlIGhlYWRlciBvZiAwLiBXaGljaCB3b3VsZCBvZiBjb3Vyc2UgcmVzdWx0IGluIGEgbG90IG9mXG4gICAgICogbG9hZCBiZWluZyBwdXQgb24gYm90aCB5b3VyIGNsaWVudHMgYW5kIHlvdXIgc2VydmVyLlxuICAgICAqL1xuICAgIHB1YmxpYyBtYWtlVml0ZUFzc2V0c0NhY2hlYWJsZSgpIHtcbiAgICAgICAgY29uc3QgYXJjaHMgPSBbJ3dlYi5icm93c2VyJywgJ3dlYi5icm93c2VyLmxlZ2FjeSddIGFzIGNvbnN0O1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBhcmNoIG9mIGFyY2hzKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlcyA9IFdlYkFwcEludGVybmFscy5zdGF0aWNGaWxlc0J5QXJjaFthcmNoXSB8fCB7fTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gT3ZlcnJpZGUgY2FjaGVhYmxlIGZsYWcgZm9yIGFueSBhc3NldHMgYnVpbHQgYnkgVml0ZS5cbiAgICAgICAgICAgIC8vIE1ldGVvciB3aWxsIGJ5IGRlZmF1bHQgc2V0IHRoaXMgdG8gZmFsc2UgZm9yIGFzc2V0IGZpbGVzLlxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoZmlsZXMpLmZvckVhY2goKFtwYXRoLCBmaWxlXSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGF0aC5zdGFydHNXaXRoKGAke3RoaXMuYXNzZXREaXJ9L2ApKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBhdGguZW5kc1dpdGgoJy5qcycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGUuY2FjaGVhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBhdGguZW5kc1dpdGgoJy5jc3MnKSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlLmNhY2hlYWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcm90ZWN0ZWQgZ2V0IGltcG9ydHMoKTogTWFuaWZlc3RJbXBvcnRzIHtcbiAgICAgICAgaWYgKE1ldGVvci5zZXR0aW5ncy52aXRlPy5pbXBvcnRzKSB7XG4gICAgICAgICAgICByZXR1cm4gTWV0ZW9yLnNldHRpbmdzLnZpdGUuaW1wb3J0cztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgbWFuaWZlc3QgPSB0aGlzLnZpdGVNYW5pZmVzdDtcbiAgICAgICAgY29uc3Qgc3R5bGVzaGVldHMgPSBuZXcgU2V0PHN0cmluZz4oKVxuICAgICAgICBjb25zdCBtb2R1bGVzID0gbmV3IFNldDxzdHJpbmc+KClcbiAgICAgICAgY29uc3QgbW9kdWxlUHJlbG9hZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCBtb2R1bGVMYXp5UHJlZmV0Y2ggPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgY29uc3QgY3NzTGF6eVByZWZldGNoID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBwcmVsb2FkSW1wb3J0cyhpbXBvcnRzOiBzdHJpbmdbXSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIGltcG9ydHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IG1hbmlmZXN0LmZpbGVzW3BhdGhdO1xuICAgICAgICAgICAgICAgIGlmICghY2h1bmspIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtb2R1bGVQcmVsb2FkLmhhcyhjaHVuay5maWxlKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbW9kdWxlTGF6eVByZWZldGNoLmRlbGV0ZShjaHVuay5maWxlKTtcbiAgICAgICAgICAgICAgICBtb2R1bGVQcmVsb2FkLmFkZChjaHVuay5maWxlKTtcbiAgICAgICAgICAgICAgICBjaHVuay5jc3M/LmZvckVhY2goY3NzID0+IHN0eWxlc2hlZXRzLmFkZChjc3MpKTtcbiAgICAgICAgICAgICAgICBwcmVsb2FkSW1wb3J0cyhjaHVuay5pbXBvcnRzIHx8IFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBUb2RvOiBQcmVsb2FkIGFsbCBhc3NldHMgYXBwIGFzc2V0cyBpbiB0aGUgYmFja2dyb3VuZCBhZnRlciBsb2FkaW5nIGVzc2VudGlhbCBhc3NldHMuXG4gICAgICAgIC8vICByZWw9XCJwcmVsb2FkXCIgZmV0Y2hQcmlvcml0eT1cImxvd1wiXG4gICAgICAgIGZvciAoY29uc3QgW25hbWUsIGNodW5rXSBvZiBPYmplY3QuZW50cmllcyhtYW5pZmVzdC5maWxlcykpIHtcbiAgICAgICAgICAgIGlmICghY2h1bmsuaXNFbnRyeSkge1xuICAgICAgICAgICAgICAgIGlmIChjaHVuay5maWxlLmVuZHNXaXRoKCcuanMnKSkge1xuICAgICAgICAgICAgICAgICAgICBtb2R1bGVMYXp5UHJlZmV0Y2guYWRkKGNodW5rLmZpbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2h1bmsuZmlsZS5lbmRzV2l0aCgnLmNzcycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNzc0xhenlQcmVmZXRjaC5hZGQoY2h1bmsuZmlsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoY2h1bmsuZmlsZS5lbmRzV2l0aCgnLmpzJykpIHtcbiAgICAgICAgICAgICAgICBtb2R1bGVMYXp5UHJlZmV0Y2guZGVsZXRlKGNodW5rLmZpbGUpO1xuICAgICAgICAgICAgICAgIG1vZHVsZXMuYWRkKGNodW5rLmZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoY2h1bmsuZmlsZS5lbmRzV2l0aCgnLmNzcycpKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzaGVldHMuYWRkKGNodW5rLmZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmVsb2FkSW1wb3J0cyhjaHVuay5pbXBvcnRzIHx8IFtdKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmsuY3NzPy5mb3JFYWNoKGNzcyA9PiB7XG4gICAgICAgICAgICAgICAgc3R5bGVzaGVldHMuYWRkKGNzcyk7XG4gICAgICAgICAgICAgICAgY3NzTGF6eVByZWZldGNoLmRlbGV0ZShjc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGltcG9ydHMgPSB7XG4gICAgICAgICAgICBzdHlsZXNoZWV0cyxcbiAgICAgICAgICAgIG1vZHVsZXMsXG4gICAgICAgICAgICBtb2R1bGVQcmVsb2FkLFxuICAgICAgICAgICAgbW9kdWxlTGF6eVByZWZldGNoLFxuICAgICAgICAgICAgY3NzTGF6eVByZWZldGNoLFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBMb2dnZXIuZGVidWcoJ1BhcnNlZCBWaXRlIG1hbmlmZXN0IGltcG9ydHMnLCBVdGlsLmluc3BlY3Qoe1xuICAgICAgICAgICAgaW1wb3J0cyxcbiAgICAgICAgICAgIG1hbmlmZXN0LFxuICAgICAgICAgICAgbW9kdWxlcyxcbiAgICAgICAgfSwgeyBkZXB0aDogNCwgY29sb3JzOiB0cnVlIH0pKTtcbiAgICAgICAgXG4gICAgICAgIE9iamVjdC5hc3NpZ24oTWV0ZW9yLnNldHRpbmdzLnZpdGUsIHsgaW1wb3J0cyB9KTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpbXBvcnRzO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIE1ldGVvclByb2dyYW1NYW5pZmVzdCB7XG4gICAgcGF0aDogc3RyaW5nO1xuICAgIHVybD86IHN0cmluZztcbiAgICBjYWNoZWFibGU6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBQcmVmZXRjaE9iamVjdCB7XG4gICAgaHJlZjogc3RyaW5nO1xuICAgIGFzPzogJ3N0eWxlJztcbn1cblxuaW50ZXJmYWNlIE1hbmlmZXN0SW1wb3J0cyB7XG4gICAgc3R5bGVzaGVldHM6IFNldDxzdHJpbmc+O1xuICAgIG1vZHVsZXM6IFNldDxzdHJpbmc+O1xuICAgIG1vZHVsZVByZWxvYWQ6IFNldDxzdHJpbmc+O1xuICAgIG1vZHVsZUxhenlQcmVmZXRjaDogU2V0PHN0cmluZz47XG4gICAgY3NzTGF6eVByZWZldGNoOiBTZXQ8c3RyaW5nPjtcbn0iXX0=
