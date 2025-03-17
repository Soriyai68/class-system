Package["core-runtime"].queue("mongo",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var NpmModuleMongodb = Package['npm-mongo'].NpmModuleMongodb;
var NpmModuleMongodbVersion = Package['npm-mongo'].NpmModuleMongodbVersion;
var AllowDeny = Package['allow-deny'].AllowDeny;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var Log = Package.logging.Log;
var Decimal = Package['mongo-decimal'].Decimal;
var MaxHeap = Package['binary-heap'].MaxHeap;
var MinHeap = Package['binary-heap'].MinHeap;
var MinMaxHeap = Package['binary-heap'].MinMaxHeap;
var Hook = Package['callback-hook'].Hook;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var MongoInternals, callback, options, Mongo, selector, doc, ObserveMultiplexer;

var require = meteorInstall({"node_modules":{"meteor":{"mongo":{"mongo_driver.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_driver.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module1.export({
      listenAll: () => listenAll,
      forEachTrigger: () => forEachTrigger
    });
    let OplogHandle;
    module1.link("./oplog_tailing", {
      OplogHandle(v) {
        OplogHandle = v;
      }
    }, 0);
    let MongoConnection;
    module1.link("./mongo_connection", {
      MongoConnection(v) {
        MongoConnection = v;
      }
    }, 1);
    let OplogObserveDriver;
    module1.link("./oplog_observe_driver", {
      OplogObserveDriver(v) {
        OplogObserveDriver = v;
      }
    }, 2);
    let MongoDB;
    module1.link("./mongo_common", {
      MongoDB(v) {
        MongoDB = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    MongoInternals = global.MongoInternals = {};
    MongoInternals.__packageName = 'mongo';
    MongoInternals.NpmModules = {
      mongodb: {
        version: NpmModuleMongodbVersion,
        module: MongoDB
      }
    };

    // Older version of what is now available via
    // MongoInternals.NpmModules.mongodb.module.  It was never documented, but
    // people do use it.
    // XXX COMPAT WITH 1.0.3.2
    MongoInternals.NpmModule = new Proxy(MongoDB, {
      get(target, propertyKey, receiver) {
        if (propertyKey === 'ObjectID') {
          Meteor.deprecate("Accessing 'MongoInternals.NpmModule.ObjectID' directly is deprecated. " + "Use 'MongoInternals.NpmModule.ObjectId' instead.");
        }
        return Reflect.get(target, propertyKey, receiver);
      }
    });
    MongoInternals.OplogHandle = OplogHandle;
    MongoInternals.Connection = MongoConnection;
    MongoInternals.OplogObserveDriver = OplogObserveDriver;

    // This is used to add or remove EJSON from the beginning of everything nested
    // inside an EJSON custom type. It should only be called on pure JSON!

    // Ensure that EJSON.clone keeps a Timestamp as a Timestamp (instead of just
    // doing a structural clone).
    // XXX how ok is this? what if there are multiple copies of MongoDB loaded?
    MongoDB.Timestamp.prototype.clone = function () {
      // Timestamps should be immutable.
      return this;
    };

    // Listen for the invalidation messages that will trigger us to poll the
    // database for changes. If this selector specifies specific IDs, specify them
    // here, so that updates to different specific IDs don't cause us to poll.
    // listenCallback is the same kind of (notification, complete) callback passed
    // to InvalidationCrossbar.listen.

    const listenAll = async function (cursorDescription, listenCallback) {
      const listeners = [];
      await forEachTrigger(cursorDescription, function (trigger) {
        listeners.push(DDPServer._InvalidationCrossbar.listen(trigger, listenCallback));
      });
      return {
        stop: function () {
          listeners.forEach(function (listener) {
            listener.stop();
          });
        }
      };
    };
    const forEachTrigger = async function (cursorDescription, triggerCallback) {
      const key = {
        collection: cursorDescription.collectionName
      };
      const specificIds = LocalCollection._idsMatchedBySelector(cursorDescription.selector);
      if (specificIds) {
        for (const id of specificIds) {
          await triggerCallback(Object.assign({
            id: id
          }, key));
        }
        await triggerCallback(Object.assign({
          dropCollection: true,
          id: null
        }, key));
      } else {
        await triggerCallback(key);
      }
      // Everyone cares about the database being dropped.
      await triggerCallback({
        dropDatabase: true
      });
    };
    // XXX We probably need to find a better way to expose this. Right now
    // it's only used by tests, but in fact you need it in normal
    // operation to interact with capped collections.
    MongoInternals.MongoTimestamp = MongoDB.Timestamp;
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

},"oplog_tailing.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/oplog_tailing.ts                                                                                     //
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
      OPLOG_COLLECTION: () => OPLOG_COLLECTION,
      OplogHandle: () => OplogHandle,
      idForOp: () => idForOp
    });
    let isEmpty;
    module.link("lodash.isempty", {
      default(v) {
        isEmpty = v;
      }
    }, 0);
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 1);
    let CursorDescription;
    module.link("./cursor_description", {
      CursorDescription(v) {
        CursorDescription = v;
      }
    }, 2);
    let MongoConnection;
    module.link("./mongo_connection", {
      MongoConnection(v) {
        MongoConnection = v;
      }
    }, 3);
    let NpmModuleMongodb;
    module.link("meteor/npm-mongo", {
      NpmModuleMongodb(v) {
        NpmModuleMongodb = v;
      }
    }, 4);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const {
      Long
    } = NpmModuleMongodb;
    const OPLOG_COLLECTION = 'oplog.rs';
    let TOO_FAR_BEHIND = +(process.env.METEOR_OPLOG_TOO_FAR_BEHIND || 2000);
    const TAIL_TIMEOUT = +(process.env.METEOR_OPLOG_TAIL_TIMEOUT || 30000);
    class OplogHandle {
      constructor(oplogUrl, dbName) {
        this._oplogUrl = void 0;
        this._dbName = void 0;
        this._oplogLastEntryConnection = void 0;
        this._oplogTailConnection = void 0;
        this._oplogOptions = void 0;
        this._stopped = void 0;
        this._tailHandle = void 0;
        this._readyPromiseResolver = void 0;
        this._readyPromise = void 0;
        this._crossbar = void 0;
        this._baseOplogSelector = void 0;
        this._catchingUpResolvers = void 0;
        this._lastProcessedTS = void 0;
        this._onSkippedEntriesHook = void 0;
        this._startTrailingPromise = void 0;
        this._resolveTimeout = void 0;
        this._entryQueue = new Meteor._DoubleEndedQueue();
        this._workerActive = false;
        this._workerPromise = null;
        this._oplogUrl = oplogUrl;
        this._dbName = dbName;
        this._resolveTimeout = null;
        this._oplogLastEntryConnection = null;
        this._oplogTailConnection = null;
        this._oplogOptions = null;
        this._stopped = false;
        this._tailHandle = null;
        this._readyPromiseResolver = null;
        this._readyPromise = new Promise(r => this._readyPromiseResolver = r);
        this._crossbar = new DDPServer._Crossbar({
          factPackage: "mongo-livedata",
          factName: "oplog-watchers"
        });
        this._baseOplogSelector = {
          ns: new RegExp("^(?:" + [
          // @ts-ignore
          Meteor._escapeRegExp(this._dbName + "."),
          // @ts-ignore
          Meteor._escapeRegExp("admin.$cmd")].join("|") + ")"),
          $or: [{
            op: {
              $in: ['i', 'u', 'd']
            }
          }, {
            op: 'c',
            'o.drop': {
              $exists: true
            }
          }, {
            op: 'c',
            'o.dropDatabase': 1
          }, {
            op: 'c',
            'o.applyOps': {
              $exists: true
            }
          }]
        };
        this._catchingUpResolvers = [];
        this._lastProcessedTS = null;
        this._onSkippedEntriesHook = new Hook({
          debugPrintExceptions: "onSkippedEntries callback"
        });
        this._startTrailingPromise = this._startTailing();
      }
      async stop() {
        if (this._stopped) return;
        this._stopped = true;
        if (this._tailHandle) {
          await this._tailHandle.stop();
        }
      }
      async _onOplogEntry(trigger, callback) {
        if (this._stopped) {
          throw new Error("Called onOplogEntry on stopped handle!");
        }
        await this._readyPromise;
        const originalCallback = callback;
        /**
         * This depends on AsynchronousQueue tasks being wrapped in `bindEnvironment` too.
         *
         * @todo Check after we simplify the `bindEnvironment` implementation if we can remove the second wrap.
         */
        callback = Meteor.bindEnvironment(function (notification) {
          originalCallback(notification);
        },
        // @ts-ignore
        function (err) {
          Meteor._debug("Error in oplog callback", err);
        });
        const listenHandle = this._crossbar.listen(trigger, callback);
        return {
          stop: async function () {
            await listenHandle.stop();
          }
        };
      }
      onOplogEntry(trigger, callback) {
        return this._onOplogEntry(trigger, callback);
      }
      onSkippedEntries(callback) {
        if (this._stopped) {
          throw new Error("Called onSkippedEntries on stopped handle!");
        }
        return this._onSkippedEntriesHook.register(callback);
      }
      async _waitUntilCaughtUp() {
        if (this._stopped) {
          throw new Error("Called waitUntilCaughtUp on stopped handle!");
        }
        await this._readyPromise;
        let lastEntry = null;
        while (!this._stopped) {
          try {
            lastEntry = await this._oplogLastEntryConnection.findOneAsync(OPLOG_COLLECTION, this._baseOplogSelector, {
              projection: {
                ts: 1
              },
              sort: {
                $natural: -1
              }
            });
            break;
          } catch (e) {
            Meteor._debug("Got exception while reading last entry", e);
            // @ts-ignore
            await Meteor.sleep(100);
          }
        }
        if (this._stopped) return;
        if (!lastEntry) return;
        const ts = lastEntry.ts;
        if (!ts) {
          throw Error("oplog entry without ts: " + JSON.stringify(lastEntry));
        }
        if (this._lastProcessedTS && ts.lessThanOrEqual(this._lastProcessedTS)) {
          return;
        }
        let insertAfter = this._catchingUpResolvers.length;
        while (insertAfter - 1 > 0 && this._catchingUpResolvers[insertAfter - 1].ts.greaterThan(ts)) {
          insertAfter--;
        }
        let promiseResolver = null;
        const promiseToAwait = new Promise(r => promiseResolver = r);
        clearTimeout(this._resolveTimeout);
        this._resolveTimeout = setTimeout(() => {
          console.error("Meteor: oplog catching up took too long", {
            ts
          });
        }, 10000);
        this._catchingUpResolvers.splice(insertAfter, 0, {
          ts,
          resolver: promiseResolver
        });
        await promiseToAwait;
        clearTimeout(this._resolveTimeout);
      }
      async waitUntilCaughtUp() {
        return this._waitUntilCaughtUp();
      }
      async _startTailing() {
        const mongodbUri = require('mongodb-uri');
        if (mongodbUri.parse(this._oplogUrl).database !== 'local') {
          throw new Error("$MONGO_OPLOG_URL must be set to the 'local' database of a Mongo replica set");
        }
        this._oplogTailConnection = new MongoConnection(this._oplogUrl, {
          maxPoolSize: 1,
          minPoolSize: 1
        });
        this._oplogLastEntryConnection = new MongoConnection(this._oplogUrl, {
          maxPoolSize: 1,
          minPoolSize: 1
        });
        try {
          var _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2, _Meteor$settings2, _Meteor$settings2$pac, _Meteor$settings2$pac2;
          const isMasterDoc = await this._oplogLastEntryConnection.db.admin().command({
            ismaster: 1
          });
          if (!(isMasterDoc && isMasterDoc.setName)) {
            throw new Error("$MONGO_OPLOG_URL must be set to the 'local' database of a Mongo replica set");
          }
          const lastOplogEntry = await this._oplogLastEntryConnection.findOneAsync(OPLOG_COLLECTION, {}, {
            sort: {
              $natural: -1
            },
            projection: {
              ts: 1
            }
          });
          let oplogSelector = _objectSpread({}, this._baseOplogSelector);
          if (lastOplogEntry) {
            oplogSelector.ts = {
              $gt: lastOplogEntry.ts
            };
            this._lastProcessedTS = lastOplogEntry.ts;
          }
          const includeCollections = (_Meteor$settings = Meteor.settings) === null || _Meteor$settings === void 0 ? void 0 : (_Meteor$settings$pack = _Meteor$settings.packages) === null || _Meteor$settings$pack === void 0 ? void 0 : (_Meteor$settings$pack2 = _Meteor$settings$pack.mongo) === null || _Meteor$settings$pack2 === void 0 ? void 0 : _Meteor$settings$pack2.oplogIncludeCollections;
          const excludeCollections = (_Meteor$settings2 = Meteor.settings) === null || _Meteor$settings2 === void 0 ? void 0 : (_Meteor$settings2$pac = _Meteor$settings2.packages) === null || _Meteor$settings2$pac === void 0 ? void 0 : (_Meteor$settings2$pac2 = _Meteor$settings2$pac.mongo) === null || _Meteor$settings2$pac2 === void 0 ? void 0 : _Meteor$settings2$pac2.oplogExcludeCollections;
          if (includeCollections !== null && includeCollections !== void 0 && includeCollections.length && excludeCollections !== null && excludeCollections !== void 0 && excludeCollections.length) {
            throw new Error("Can't use both mongo oplog settings oplogIncludeCollections and oplogExcludeCollections at the same time.");
          }
          if (excludeCollections !== null && excludeCollections !== void 0 && excludeCollections.length) {
            oplogSelector.ns = {
              $regex: oplogSelector.ns,
              $nin: excludeCollections.map(collName => "".concat(this._dbName, ".").concat(collName))
            };
            this._oplogOptions = {
              excludeCollections
            };
          } else if (includeCollections !== null && includeCollections !== void 0 && includeCollections.length) {
            oplogSelector = {
              $and: [{
                $or: [{
                  ns: /^admin\.\$cmd/
                }, {
                  ns: {
                    $in: includeCollections.map(collName => "".concat(this._dbName, ".").concat(collName))
                  }
                }]
              }, {
                $or: oplogSelector.$or
              }, {
                ts: oplogSelector.ts
              }]
            };
            this._oplogOptions = {
              includeCollections
            };
          }
          const cursorDescription = new CursorDescription(OPLOG_COLLECTION, oplogSelector, {
            tailable: true
          });
          this._tailHandle = this._oplogTailConnection.tail(cursorDescription, doc => {
            this._entryQueue.push(doc);
            this._maybeStartWorker();
          }, TAIL_TIMEOUT);
          this._readyPromiseResolver();
        } catch (error) {
          console.error('Error in _startTailing:', error);
          throw error;
        }
      }
      _maybeStartWorker() {
        if (this._workerPromise) return;
        this._workerActive = true;
        // Convert to a proper promise-based queue processor
        this._workerPromise = (async () => {
          try {
            while (!this._stopped && !this._entryQueue.isEmpty()) {
              // Are we too far behind? Just tell our observers that they need to
              // repoll, and drop our queue.
              if (this._entryQueue.length > TOO_FAR_BEHIND) {
                const lastEntry = this._entryQueue.pop();
                this._entryQueue.clear();
                this._onSkippedEntriesHook.each(callback => {
                  callback();
                  return true;
                });
                // Free any waitUntilCaughtUp() calls that were waiting for us to
                // pass something that we just skipped.
                this._setLastProcessedTS(lastEntry.ts);
                continue;
              }
              // Process next batch from the queue
              const doc = this._entryQueue.shift();
              try {
                await handleDoc(this, doc);
                // Process any waiting fence callbacks
                if (doc.ts) {
                  this._setLastProcessedTS(doc.ts);
                }
              } catch (e) {
                // Keep processing queue even if one entry fails
                console.error('Error processing oplog entry:', e);
              }
            }
          } finally {
            this._workerPromise = null;
            this._workerActive = false;
          }
        })();
      }
      _setLastProcessedTS(ts) {
        this._lastProcessedTS = ts;
        while (!isEmpty(this._catchingUpResolvers) && this._catchingUpResolvers[0].ts.lessThanOrEqual(this._lastProcessedTS)) {
          const sequencer = this._catchingUpResolvers.shift();
          sequencer.resolver();
        }
      }
      _defineTooFarBehind(value) {
        TOO_FAR_BEHIND = value;
      }
      _resetTooFarBehind() {
        TOO_FAR_BEHIND = +(process.env.METEOR_OPLOG_TOO_FAR_BEHIND || 2000);
      }
    }
    function idForOp(op) {
      if (op.op === 'd' || op.op === 'i') {
        return op.o._id;
      } else if (op.op === 'u') {
        return op.o2._id;
      } else if (op.op === 'c') {
        throw Error("Operator 'c' doesn't supply an object with id: " + JSON.stringify(op));
      } else {
        throw Error("Unknown op: " + JSON.stringify(op));
      }
    }
    async function handleDoc(handle, doc) {
      if (doc.ns === "admin.$cmd") {
        if (doc.o.applyOps) {
          // This was a successful transaction, so we need to apply the
          // operations that were involved.
          let nextTimestamp = doc.ts;
          for (const op of doc.o.applyOps) {
            // See https://github.com/meteor/meteor/issues/10420.
            if (!op.ts) {
              op.ts = nextTimestamp;
              nextTimestamp = nextTimestamp.add(Long.ONE);
            }
            await handleDoc(handle, op);
          }
          return;
        }
        throw new Error("Unknown command " + JSON.stringify(doc));
      }
      const trigger = {
        dropCollection: false,
        dropDatabase: false,
        op: doc
      };
      if (typeof doc.ns === "string" && doc.ns.startsWith(handle._dbName + ".")) {
        trigger.collection = doc.ns.slice(handle._dbName.length + 1);
      }
      // Is it a special command and the collection name is hidden
      // somewhere in operator?
      if (trigger.collection === "$cmd") {
        if (doc.o.dropDatabase) {
          delete trigger.collection;
          trigger.dropDatabase = true;
        } else if ("drop" in doc.o) {
          trigger.collection = doc.o.drop;
          trigger.dropCollection = true;
          trigger.id = null;
        } else if ("create" in doc.o && "idIndex" in doc.o) {
          // A collection got implicitly created within a transaction. There's
          // no need to do anything about it.
        } else {
          throw Error("Unknown command " + JSON.stringify(doc));
        }
      } else {
        // All other ops have an id.
        trigger.id = idForOp(doc);
      }
      await handle._crossbar.fire(trigger);
      await new Promise(resolve => setImmediate(resolve));
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

},"observe_multiplex.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/observe_multiplex.ts                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectWithoutProperties;
    module.link("@babel/runtime/helpers/objectWithoutProperties", {
      default(v) {
        _objectWithoutProperties = v;
      }
    }, 0);
    const _excluded = ["_id"];
    module.export({
      ObserveMultiplexer: () => ObserveMultiplexer
    });
    let isEmpty;
    module.link("lodash.isempty", {
      default(v) {
        isEmpty = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class ObserveMultiplexer {
      constructor(_ref) {
        var _this = this;
        let {
          ordered,
          onStop = () => {}
        } = _ref;
        this._ordered = void 0;
        this._onStop = void 0;
        this._queue = void 0;
        this._handles = void 0;
        this._resolver = void 0;
        this._readyPromise = void 0;
        this._isReady = void 0;
        this._cache = void 0;
        this._addHandleTasksScheduledButNotPerformed = void 0;
        if (ordered === undefined) throw Error("must specify ordered");
        // @ts-ignore
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-multiplexers", 1);
        this._ordered = ordered;
        this._onStop = onStop;
        this._queue = new Meteor._AsynchronousQueue();
        this._handles = {};
        this._resolver = null;
        this._isReady = false;
        this._readyPromise = new Promise(r => this._resolver = r).then(() => this._isReady = true);
        // @ts-ignore
        this._cache = new LocalCollection._CachingChangeObserver({
          ordered
        });
        this._addHandleTasksScheduledButNotPerformed = 0;
        this.callbackNames().forEach(callbackName => {
          this[callbackName] = function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }
            _this._applyCallback(callbackName, args);
          };
        });
      }
      addHandleAndSendInitialAdds(handle) {
        return this._addHandleAndSendInitialAdds(handle);
      }
      async _addHandleAndSendInitialAdds(handle) {
        ++this._addHandleTasksScheduledButNotPerformed;
        // @ts-ignore
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-handles", 1);
        await this._queue.runTask(async () => {
          this._handles[handle._id] = handle;
          await this._sendAdds(handle);
          --this._addHandleTasksScheduledButNotPerformed;
        });
        await this._readyPromise;
      }
      async removeHandle(id) {
        if (!this._ready()) throw new Error("Can't remove handles until the multiplex is ready");
        delete this._handles[id];
        // @ts-ignore
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-handles", -1);
        if (isEmpty(this._handles) && this._addHandleTasksScheduledButNotPerformed === 0) {
          await this._stop();
        }
      }
      async _stop() {
        let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        if (!this._ready() && !options.fromQueryError) throw Error("surprising _stop: not ready");
        await this._onStop();
        // @ts-ignore
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-multiplexers", -1);
        this._handles = null;
      }
      async ready() {
        await this._queue.queueTask(() => {
          if (this._ready()) throw Error("can't make ObserveMultiplex ready twice!");
          if (!this._resolver) {
            throw new Error("Missing resolver");
          }
          this._resolver();
          this._isReady = true;
        });
      }
      async queryError(err) {
        await this._queue.runTask(() => {
          if (this._ready()) throw Error("can't claim query has an error after it worked!");
          this._stop({
            fromQueryError: true
          });
          throw err;
        });
      }
      async onFlush(cb) {
        await this._queue.queueTask(async () => {
          if (!this._ready()) throw Error("only call onFlush on a multiplexer that will be ready");
          await cb();
        });
      }
      callbackNames() {
        return this._ordered ? ["addedBefore", "changed", "movedBefore", "removed"] : ["added", "changed", "removed"];
      }
      _ready() {
        return !!this._isReady;
      }
      _applyCallback(callbackName, args) {
        this._queue.queueTask(async () => {
          if (!this._handles) return;
          await this._cache.applyChange[callbackName].apply(null, args);
          if (!this._ready() && callbackName !== 'added' && callbackName !== 'addedBefore') {
            throw new Error("Got ".concat(callbackName, " during initial adds"));
          }
          for (const handleId of Object.keys(this._handles)) {
            const handle = this._handles && this._handles[handleId];
            if (!handle) return;
            const callback = handle["_".concat(callbackName)];
            if (!callback) continue;
            handle.initialAddsSent.then(callback.apply(null, handle.nonMutatingCallbacks ? args : EJSON.clone(args)));
          }
        });
      }
      async _sendAdds(handle) {
        const add = this._ordered ? handle._addedBefore : handle._added;
        if (!add) return;
        const addPromises = [];
        this._cache.docs.forEach((doc, id) => {
          if (!(handle._id in this._handles)) {
            throw Error("handle got removed before sending initial adds!");
          }
          const _ref2 = handle.nonMutatingCallbacks ? doc : EJSON.clone(doc),
            {
              _id
            } = _ref2,
            fields = _objectWithoutProperties(_ref2, _excluded);
          const promise = this._ordered ? add(id, fields, null) : add(id, fields);
          addPromises.push(promise);
        });
        await Promise.all(addPromises);
        handle.initialAddsSentResolver();
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

},"doc_fetcher.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/doc_fetcher.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  DocFetcher: () => DocFetcher
});
class DocFetcher {
  constructor(mongoConnection) {
    this._mongoConnection = mongoConnection;
    // Map from op -> [callback]
    this._callbacksForOp = new Map();
  }

  // Fetches document "id" from collectionName, returning it or null if not
  // found.
  //
  // If you make multiple calls to fetch() with the same op reference,
  // DocFetcher may assume that they all return the same document. (It does
  // not check to see if collectionName/id match.)
  //
  // You may assume that callback is never called synchronously (and in fact
  // OplogObserveDriver does so).
  async fetch(collectionName, id, op, callback) {
    const self = this;
    check(collectionName, String);
    check(op, Object);

    // If there's already an in-progress fetch for this cache key, yield until
    // it's done and return whatever it returns.
    if (self._callbacksForOp.has(op)) {
      self._callbacksForOp.get(op).push(callback);
      return;
    }
    const callbacks = [callback];
    self._callbacksForOp.set(op, callbacks);
    try {
      var doc = (await self._mongoConnection.findOneAsync(collectionName, {
        _id: id
      })) || null;
      // Return doc to all relevant callbacks. Note that this array can
      // continue to grow during callback excecution.
      while (callbacks.length > 0) {
        // Clone the document so that the various calls to fetch don't return
        // objects that are intertwingled with each other. Clone before
        // popping the future, so that if clone throws, the error gets passed
        // to the next callback.
        callbacks.pop()(null, EJSON.clone(doc));
      }
    } catch (e) {
      while (callbacks.length > 0) {
        callbacks.pop()(e);
      }
    } finally {
      // XXX consider keeping the doc around for a period of time before
      // removing from the cache
      self._callbacksForOp.delete(op);
    }
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"polling_observe_driver.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/polling_observe_driver.ts                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      PollingObserveDriver: () => PollingObserveDriver
    });
    let throttle;
    module.link("lodash.throttle", {
      default(v) {
        throttle = v;
      }
    }, 0);
    let listenAll;
    module.link("./mongo_driver", {
      listenAll(v) {
        listenAll = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const POLLING_THROTTLE_MS = +(process.env.METEOR_POLLING_THROTTLE_MS || '') || 50;
    const POLLING_INTERVAL_MS = +(process.env.METEOR_POLLING_INTERVAL_MS || '') || 10 * 1000;
    /**
     * @class PollingObserveDriver
     *
     * One of two observe driver implementations.
     *
     * Characteristics:
     * - Caches the results of a query
     * - Reruns the query when necessary
     * - Suitable for cases where oplog tailing is not available or practical
     */
    class PollingObserveDriver {
      constructor(options) {
        this._options = void 0;
        this._cursorDescription = void 0;
        this._mongoHandle = void 0;
        this._ordered = void 0;
        this._multiplexer = void 0;
        this._stopCallbacks = void 0;
        this._stopped = void 0;
        this._cursor = void 0;
        this._results = void 0;
        this._pollsScheduledButNotStarted = void 0;
        this._pendingWrites = void 0;
        this._ensurePollIsScheduled = void 0;
        this._taskQueue = void 0;
        this._testOnlyPollCallback = void 0;
        this._options = options;
        this._cursorDescription = options.cursorDescription;
        this._mongoHandle = options.mongoHandle;
        this._ordered = options.ordered;
        this._multiplexer = options.multiplexer;
        this._stopCallbacks = [];
        this._stopped = false;
        this._cursor = this._mongoHandle._createAsynchronousCursor(this._cursorDescription);
        this._results = null;
        this._pollsScheduledButNotStarted = 0;
        this._pendingWrites = [];
        this._ensurePollIsScheduled = throttle(this._unthrottledEnsurePollIsScheduled.bind(this), this._cursorDescription.options.pollingThrottleMs || POLLING_THROTTLE_MS);
        this._taskQueue = new Meteor._AsynchronousQueue();
      }
      async _init() {
        var _Package$factsBase;
        const options = this._options;
        const listenersHandle = await listenAll(this._cursorDescription, notification => {
          const fence = DDPServer._getCurrentFence();
          if (fence) {
            this._pendingWrites.push(fence.beginWrite());
          }
          if (this._pollsScheduledButNotStarted === 0) {
            this._ensurePollIsScheduled();
          }
        });
        this._stopCallbacks.push(async () => {
          await listenersHandle.stop();
        });
        if (options._testOnlyPollCallback) {
          this._testOnlyPollCallback = options._testOnlyPollCallback;
        } else {
          const pollingInterval = this._cursorDescription.options.pollingIntervalMs || this._cursorDescription.options._pollingInterval || POLLING_INTERVAL_MS;
          const intervalHandle = Meteor.setInterval(this._ensurePollIsScheduled.bind(this), pollingInterval);
          this._stopCallbacks.push(() => {
            Meteor.clearInterval(intervalHandle);
          });
        }
        await this._unthrottledEnsurePollIsScheduled();
        (_Package$factsBase = Package['facts-base']) === null || _Package$factsBase === void 0 ? void 0 : _Package$factsBase.Facts.incrementServerFact("mongo-livedata", "observe-drivers-polling", 1);
      }
      async _unthrottledEnsurePollIsScheduled() {
        if (this._pollsScheduledButNotStarted > 0) return;
        ++this._pollsScheduledButNotStarted;
        await this._taskQueue.runTask(async () => {
          await this._pollMongo();
        });
      }
      _suspendPolling() {
        ++this._pollsScheduledButNotStarted;
        this._taskQueue.runTask(() => {});
        if (this._pollsScheduledButNotStarted !== 1) {
          throw new Error("_pollsScheduledButNotStarted is ".concat(this._pollsScheduledButNotStarted));
        }
      }
      async _resumePolling() {
        if (this._pollsScheduledButNotStarted !== 1) {
          throw new Error("_pollsScheduledButNotStarted is ".concat(this._pollsScheduledButNotStarted));
        }
        await this._taskQueue.runTask(async () => {
          await this._pollMongo();
        });
      }
      async _pollMongo() {
        var _this$_testOnlyPollCa;
        --this._pollsScheduledButNotStarted;
        if (this._stopped) return;
        let first = false;
        let newResults;
        let oldResults = this._results;
        if (!oldResults) {
          first = true;
          oldResults = this._ordered ? [] : new LocalCollection._IdMap();
        }
        (_this$_testOnlyPollCa = this._testOnlyPollCallback) === null || _this$_testOnlyPollCa === void 0 ? void 0 : _this$_testOnlyPollCa.call(this);
        const writesForCycle = this._pendingWrites;
        this._pendingWrites = [];
        try {
          newResults = await this._cursor.getRawObjects(this._ordered);
        } catch (e) {
          if (first && typeof e.code === 'number') {
            await this._multiplexer.queryError(new Error("Exception while polling query ".concat(JSON.stringify(this._cursorDescription), ": ").concat(e.message)));
          }
          Array.prototype.push.apply(this._pendingWrites, writesForCycle);
          Meteor._debug("Exception while polling query ".concat(JSON.stringify(this._cursorDescription)), e);
          return;
        }
        if (!this._stopped) {
          LocalCollection._diffQueryChanges(this._ordered, oldResults, newResults, this._multiplexer);
        }
        if (first) this._multiplexer.ready();
        this._results = newResults;
        await this._multiplexer.onFlush(async () => {
          for (const w of writesForCycle) {
            await w.committed();
          }
        });
      }
      async stop() {
        var _Package$factsBase2;
        this._stopped = true;
        for (const callback of this._stopCallbacks) {
          await callback();
        }
        for (const w of this._pendingWrites) {
          await w.committed();
        }
        (_Package$factsBase2 = Package['facts-base']) === null || _Package$factsBase2 === void 0 ? void 0 : _Package$factsBase2.Facts.incrementServerFact("mongo-livedata", "observe-drivers-polling", -1);
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

},"oplog_observe_driver.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/oplog_observe_driver.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _asyncIterator;
    module.link("@babel/runtime/helpers/asyncIterator", {
      default(v) {
        _asyncIterator = v;
      }
    }, 0);
    module.export({
      OplogObserveDriver: () => OplogObserveDriver
    });
    let has;
    module.link("lodash.has", {
      default(v) {
        has = v;
      }
    }, 0);
    let isEmpty;
    module.link("lodash.isempty", {
      default(v) {
        isEmpty = v;
      }
    }, 1);
    let oplogV2V1Converter;
    module.link("./oplog_v2_converter", {
      oplogV2V1Converter(v) {
        oplogV2V1Converter = v;
      }
    }, 2);
    let check, Match;
    module.link("meteor/check", {
      check(v) {
        check = v;
      },
      Match(v) {
        Match = v;
      }
    }, 3);
    let CursorDescription;
    module.link("./cursor_description", {
      CursorDescription(v) {
        CursorDescription = v;
      }
    }, 4);
    let forEachTrigger, listenAll;
    module.link("./mongo_driver", {
      forEachTrigger(v) {
        forEachTrigger = v;
      },
      listenAll(v) {
        listenAll = v;
      }
    }, 5);
    let Cursor;
    module.link("./cursor", {
      Cursor(v) {
        Cursor = v;
      }
    }, 6);
    let LocalCollection;
    module.link("meteor/minimongo/local_collection", {
      default(v) {
        LocalCollection = v;
      }
    }, 7);
    let idForOp;
    module.link("./oplog_tailing", {
      idForOp(v) {
        idForOp = v;
      }
    }, 8);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    var PHASE = {
      QUERYING: "QUERYING",
      FETCHING: "FETCHING",
      STEADY: "STEADY"
    };

    // Exception thrown by _needToPollQuery which unrolls the stack up to the
    // enclosing call to finishIfNeedToPollQuery.
    var SwitchedToQuery = function () {};
    var finishIfNeedToPollQuery = function (f) {
      return function () {
        try {
          f.apply(this, arguments);
        } catch (e) {
          if (!(e instanceof SwitchedToQuery)) throw e;
        }
      };
    };
    var currentId = 0;

    /**
     * @class OplogObserveDriver
     * An alternative to PollingObserveDriver which follows the MongoDB operation log
     * instead of re-polling the query.
     *
     * Characteristics:
     * - Follows the MongoDB operation log
     * - Directly observes database changes
     * - More efficient than polling for most use cases
     * - Requires access to MongoDB oplog
     *
     * Interface:
     * - Construction initiates observeChanges callbacks and ready() invocation to the ObserveMultiplexer
     * - Observation can be terminated via the stop() method
     */
    const OplogObserveDriver = function (options) {
      const self = this;
      self._usesOplog = true; // tests look at this

      self._id = currentId;
      currentId++;
      self._cursorDescription = options.cursorDescription;
      self._mongoHandle = options.mongoHandle;
      self._multiplexer = options.multiplexer;
      if (options.ordered) {
        throw Error("OplogObserveDriver only supports unordered observeChanges");
      }
      const sorter = options.sorter;
      // We don't support $near and other geo-queries so it's OK to initialize the
      // comparator only once in the constructor.
      const comparator = sorter && sorter.getComparator();
      if (options.cursorDescription.options.limit) {
        // There are several properties ordered driver implements:
        // - _limit is a positive number
        // - _comparator is a function-comparator by which the query is ordered
        // - _unpublishedBuffer is non-null Min/Max Heap,
        //                      the empty buffer in STEADY phase implies that the
        //                      everything that matches the queries selector fits
        //                      into published set.
        // - _published - Max Heap (also implements IdMap methods)

        const heapOptions = {
          IdMap: LocalCollection._IdMap
        };
        self._limit = self._cursorDescription.options.limit;
        self._comparator = comparator;
        self._sorter = sorter;
        self._unpublishedBuffer = new MinMaxHeap(comparator, heapOptions);
        // We need something that can find Max value in addition to IdMap interface
        self._published = new MaxHeap(comparator, heapOptions);
      } else {
        self._limit = 0;
        self._comparator = null;
        self._sorter = null;
        self._unpublishedBuffer = null;
        // Memory Growth
        self._published = new LocalCollection._IdMap();
      }

      // Indicates if it is safe to insert a new document at the end of the buffer
      // for this query. i.e. it is known that there are no documents matching the
      // selector those are not in published or buffer.
      self._safeAppendToBuffer = false;
      self._stopped = false;
      self._stopHandles = [];
      self._addStopHandles = function (newStopHandles) {
        const expectedPattern = Match.ObjectIncluding({
          stop: Function
        });
        // Single item or array
        check(newStopHandles, Match.OneOf([expectedPattern], expectedPattern));
        self._stopHandles.push(newStopHandles);
      };
      Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-drivers-oplog", 1);
      self._registerPhaseChange(PHASE.QUERYING);
      self._matcher = options.matcher;
      // we are now using projection, not fields in the cursor description even if you pass {fields}
      // in the cursor construction
      const projection = self._cursorDescription.options.fields || self._cursorDescription.options.projection || {};
      self._projectionFn = LocalCollection._compileProjection(projection);
      // Projection function, result of combining important fields for selector and
      // existing fields projection
      self._sharedProjection = self._matcher.combineIntoProjection(projection);
      if (sorter) self._sharedProjection = sorter.combineIntoProjection(self._sharedProjection);
      self._sharedProjectionFn = LocalCollection._compileProjection(self._sharedProjection);
      self._needToFetch = new LocalCollection._IdMap();
      self._currentlyFetching = null;
      self._fetchGeneration = 0;
      self._requeryWhenDoneThisQuery = false;
      self._writesToCommitWhenWeReachSteady = [];
    };
    Object.assign(OplogObserveDriver.prototype, {
      _init: async function () {
        const self = this;

        // If the oplog handle tells us that it skipped some entries (because it got
        // behind, say), re-poll.
        self._addStopHandles(self._mongoHandle._oplogHandle.onSkippedEntries(finishIfNeedToPollQuery(function () {
          return self._needToPollQuery();
        })));
        await forEachTrigger(self._cursorDescription, async function (trigger) {
          self._addStopHandles(await self._mongoHandle._oplogHandle.onOplogEntry(trigger, function (notification) {
            finishIfNeedToPollQuery(function () {
              const op = notification.op;
              if (notification.dropCollection || notification.dropDatabase) {
                // Note: this call is not allowed to block on anything (especially
                // on waiting for oplog entries to catch up) because that will block
                // onOplogEntry!
                return self._needToPollQuery();
              } else {
                // All other operators should be handled depending on phase
                if (self._phase === PHASE.QUERYING) {
                  return self._handleOplogEntryQuerying(op);
                } else {
                  return self._handleOplogEntrySteadyOrFetching(op);
                }
              }
            })();
          }));
        });

        // XXX ordering w.r.t. everything else?
        self._addStopHandles(await listenAll(self._cursorDescription, function () {
          // If we're not in a pre-fire write fence, we don't have to do anything.
          const fence = DDPServer._getCurrentFence();
          if (!fence || fence.fired) return;
          if (fence._oplogObserveDrivers) {
            fence._oplogObserveDrivers[self._id] = self;
            return;
          }
          fence._oplogObserveDrivers = {};
          fence._oplogObserveDrivers[self._id] = self;
          fence.onBeforeFire(async function () {
            const drivers = fence._oplogObserveDrivers;
            delete fence._oplogObserveDrivers;

            // This fence cannot fire until we've caught up to "this point" in the
            // oplog, and all observers made it back to the steady state.
            await self._mongoHandle._oplogHandle.waitUntilCaughtUp();
            for (const driver of Object.values(drivers)) {
              if (driver._stopped) continue;
              const write = await fence.beginWrite();
              if (driver._phase === PHASE.STEADY) {
                // Make sure that all of the callbacks have made it through the
                // multiplexer and been delivered to ObserveHandles before committing
                // writes.
                await driver._multiplexer.onFlush(write.committed);
              } else {
                driver._writesToCommitWhenWeReachSteady.push(write);
              }
            }
          });
        }));

        // When Mongo fails over, we need to repoll the query, in case we processed an
        // oplog entry that got rolled back.
        self._addStopHandles(self._mongoHandle._onFailover(finishIfNeedToPollQuery(function () {
          return self._needToPollQuery();
        })));

        // Give _observeChanges a chance to add the new ObserveHandle to our
        // multiplexer, so that the added calls get streamed.
        return self._runInitialQuery();
      },
      _addPublished: function (id, doc) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          var fields = Object.assign({}, doc);
          delete fields._id;
          self._published.set(id, self._sharedProjectionFn(doc));
          self._multiplexer.added(id, self._projectionFn(fields));

          // After adding this document, the published set might be overflowed
          // (exceeding capacity specified by limit). If so, push the maximum
          // element to the buffer, we might want to save it in memory to reduce the
          // amount of Mongo lookups in the future.
          if (self._limit && self._published.size() > self._limit) {
            // XXX in theory the size of published is no more than limit+1
            if (self._published.size() !== self._limit + 1) {
              throw new Error("After adding to published, " + (self._published.size() - self._limit) + " documents are overflowing the set");
            }
            var overflowingDocId = self._published.maxElementId();
            var overflowingDoc = self._published.get(overflowingDocId);
            if (EJSON.equals(overflowingDocId, id)) {
              throw new Error("The document just added is overflowing the published set");
            }
            self._published.remove(overflowingDocId);
            self._multiplexer.removed(overflowingDocId);
            self._addBuffered(overflowingDocId, overflowingDoc);
          }
        });
      },
      _removePublished: function (id) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          self._published.remove(id);
          self._multiplexer.removed(id);
          if (!self._limit || self._published.size() === self._limit) return;
          if (self._published.size() > self._limit) throw Error("self._published got too big");

          // OK, we are publishing less than the limit. Maybe we should look in the
          // buffer to find the next element past what we were publishing before.

          if (!self._unpublishedBuffer.empty()) {
            // There's something in the buffer; move the first thing in it to
            // _published.
            var newDocId = self._unpublishedBuffer.minElementId();
            var newDoc = self._unpublishedBuffer.get(newDocId);
            self._removeBuffered(newDocId);
            self._addPublished(newDocId, newDoc);
            return;
          }

          // There's nothing in the buffer.  This could mean one of a few things.

          // (a) We could be in the middle of re-running the query (specifically, we
          // could be in _publishNewResults). In that case, _unpublishedBuffer is
          // empty because we clear it at the beginning of _publishNewResults. In
          // this case, our caller already knows the entire answer to the query and
          // we don't need to do anything fancy here.  Just return.
          if (self._phase === PHASE.QUERYING) return;

          // (b) We're pretty confident that the union of _published and
          // _unpublishedBuffer contain all documents that match selector. Because
          // _unpublishedBuffer is empty, that means we're confident that _published
          // contains all documents that match selector. So we have nothing to do.
          if (self._safeAppendToBuffer) return;

          // (c) Maybe there are other documents out there that should be in our
          // buffer. But in that case, when we emptied _unpublishedBuffer in
          // _removeBuffered, we should have called _needToPollQuery, which will
          // either put something in _unpublishedBuffer or set _safeAppendToBuffer
          // (or both), and it will put us in QUERYING for that whole time. So in
          // fact, we shouldn't be able to get here.

          throw new Error("Buffer inexplicably empty");
        });
      },
      _changePublished: function (id, oldDoc, newDoc) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          self._published.set(id, self._sharedProjectionFn(newDoc));
          var projectedNew = self._projectionFn(newDoc);
          var projectedOld = self._projectionFn(oldDoc);
          var changed = DiffSequence.makeChangedFields(projectedNew, projectedOld);
          if (!isEmpty(changed)) self._multiplexer.changed(id, changed);
        });
      },
      _addBuffered: function (id, doc) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          self._unpublishedBuffer.set(id, self._sharedProjectionFn(doc));

          // If something is overflowing the buffer, we just remove it from cache
          if (self._unpublishedBuffer.size() > self._limit) {
            var maxBufferedId = self._unpublishedBuffer.maxElementId();
            self._unpublishedBuffer.remove(maxBufferedId);

            // Since something matching is removed from cache (both published set and
            // buffer), set flag to false
            self._safeAppendToBuffer = false;
          }
        });
      },
      // Is called either to remove the doc completely from matching set or to move
      // it to the published set later.
      _removeBuffered: function (id) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          self._unpublishedBuffer.remove(id);
          // To keep the contract "buffer is never empty in STEADY phase unless the
          // everything matching fits into published" true, we poll everything as
          // soon as we see the buffer becoming empty.
          if (!self._unpublishedBuffer.size() && !self._safeAppendToBuffer) self._needToPollQuery();
        });
      },
      // Called when a document has joined the "Matching" results set.
      // Takes responsibility of keeping _unpublishedBuffer in sync with _published
      // and the effect of limit enforced.
      _addMatching: function (doc) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          var id = doc._id;
          if (self._published.has(id)) throw Error("tried to add something already published " + id);
          if (self._limit && self._unpublishedBuffer.has(id)) throw Error("tried to add something already existed in buffer " + id);
          var limit = self._limit;
          var comparator = self._comparator;
          var maxPublished = limit && self._published.size() > 0 ? self._published.get(self._published.maxElementId()) : null;
          var maxBuffered = limit && self._unpublishedBuffer.size() > 0 ? self._unpublishedBuffer.get(self._unpublishedBuffer.maxElementId()) : null;
          // The query is unlimited or didn't publish enough documents yet or the
          // new document would fit into published set pushing the maximum element
          // out, then we need to publish the doc.
          var toPublish = !limit || self._published.size() < limit || comparator(doc, maxPublished) < 0;

          // Otherwise we might need to buffer it (only in case of limited query).
          // Buffering is allowed if the buffer is not filled up yet and all
          // matching docs are either in the published set or in the buffer.
          var canAppendToBuffer = !toPublish && self._safeAppendToBuffer && self._unpublishedBuffer.size() < limit;

          // Or if it is small enough to be safely inserted to the middle or the
          // beginning of the buffer.
          var canInsertIntoBuffer = !toPublish && maxBuffered && comparator(doc, maxBuffered) <= 0;
          var toBuffer = canAppendToBuffer || canInsertIntoBuffer;
          if (toPublish) {
            self._addPublished(id, doc);
          } else if (toBuffer) {
            self._addBuffered(id, doc);
          } else {
            // dropping it and not saving to the cache
            self._safeAppendToBuffer = false;
          }
        });
      },
      // Called when a document leaves the "Matching" results set.
      // Takes responsibility of keeping _unpublishedBuffer in sync with _published
      // and the effect of limit enforced.
      _removeMatching: function (id) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          if (!self._published.has(id) && !self._limit) throw Error("tried to remove something matching but not cached " + id);
          if (self._published.has(id)) {
            self._removePublished(id);
          } else if (self._unpublishedBuffer.has(id)) {
            self._removeBuffered(id);
          }
        });
      },
      _handleDoc: function (id, newDoc) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          var matchesNow = newDoc && self._matcher.documentMatches(newDoc).result;
          var publishedBefore = self._published.has(id);
          var bufferedBefore = self._limit && self._unpublishedBuffer.has(id);
          var cachedBefore = publishedBefore || bufferedBefore;
          if (matchesNow && !cachedBefore) {
            self._addMatching(newDoc);
          } else if (cachedBefore && !matchesNow) {
            self._removeMatching(id);
          } else if (cachedBefore && matchesNow) {
            var oldDoc = self._published.get(id);
            var comparator = self._comparator;
            var minBuffered = self._limit && self._unpublishedBuffer.size() && self._unpublishedBuffer.get(self._unpublishedBuffer.minElementId());
            var maxBuffered;
            if (publishedBefore) {
              // Unlimited case where the document stays in published once it
              // matches or the case when we don't have enough matching docs to
              // publish or the changed but matching doc will stay in published
              // anyways.
              //
              // XXX: We rely on the emptiness of buffer. Be sure to maintain the
              // fact that buffer can't be empty if there are matching documents not
              // published. Notably, we don't want to schedule repoll and continue
              // relying on this property.
              var staysInPublished = !self._limit || self._unpublishedBuffer.size() === 0 || comparator(newDoc, minBuffered) <= 0;
              if (staysInPublished) {
                self._changePublished(id, oldDoc, newDoc);
              } else {
                // after the change doc doesn't stay in the published, remove it
                self._removePublished(id);
                // but it can move into buffered now, check it
                maxBuffered = self._unpublishedBuffer.get(self._unpublishedBuffer.maxElementId());
                var toBuffer = self._safeAppendToBuffer || maxBuffered && comparator(newDoc, maxBuffered) <= 0;
                if (toBuffer) {
                  self._addBuffered(id, newDoc);
                } else {
                  // Throw away from both published set and buffer
                  self._safeAppendToBuffer = false;
                }
              }
            } else if (bufferedBefore) {
              oldDoc = self._unpublishedBuffer.get(id);
              // remove the old version manually instead of using _removeBuffered so
              // we don't trigger the querying immediately.  if we end this block
              // with the buffer empty, we will need to trigger the query poll
              // manually too.
              self._unpublishedBuffer.remove(id);
              var maxPublished = self._published.get(self._published.maxElementId());
              maxBuffered = self._unpublishedBuffer.size() && self._unpublishedBuffer.get(self._unpublishedBuffer.maxElementId());

              // the buffered doc was updated, it could move to published
              var toPublish = comparator(newDoc, maxPublished) < 0;

              // or stays in buffer even after the change
              var staysInBuffer = !toPublish && self._safeAppendToBuffer || !toPublish && maxBuffered && comparator(newDoc, maxBuffered) <= 0;
              if (toPublish) {
                self._addPublished(id, newDoc);
              } else if (staysInBuffer) {
                // stays in buffer but changes
                self._unpublishedBuffer.set(id, newDoc);
              } else {
                // Throw away from both published set and buffer
                self._safeAppendToBuffer = false;
                // Normally this check would have been done in _removeBuffered but
                // we didn't use it, so we need to do it ourself now.
                if (!self._unpublishedBuffer.size()) {
                  self._needToPollQuery();
                }
              }
            } else {
              throw new Error("cachedBefore implies either of publishedBefore or bufferedBefore is true.");
            }
          }
        });
      },
      _fetchModifiedDocuments: function () {
        var self = this;
        self._registerPhaseChange(PHASE.FETCHING);
        // Defer, because nothing called from the oplog entry handler may yield,
        // but fetch() yields.
        Meteor.defer(finishIfNeedToPollQuery(async function () {
          while (!self._stopped && !self._needToFetch.empty()) {
            if (self._phase === PHASE.QUERYING) {
              // While fetching, we decided to go into QUERYING mode, and then we
              // saw another oplog entry, so _needToFetch is not empty. But we
              // shouldn't fetch these documents until AFTER the query is done.
              break;
            }

            // Being in steady phase here would be surprising.
            if (self._phase !== PHASE.FETCHING) throw new Error("phase in fetchModifiedDocuments: " + self._phase);
            self._currentlyFetching = self._needToFetch;
            var thisGeneration = ++self._fetchGeneration;
            self._needToFetch = new LocalCollection._IdMap();
            var waiting = 0;
            let promiseResolver = null;
            const awaitablePromise = new Promise(r => promiseResolver = r);
            // This loop is safe, because _currentlyFetching will not be updated
            // during this loop (in fact, it is never mutated).
            await self._currentlyFetching.forEachAsync(async function (op, id) {
              waiting++;
              await self._mongoHandle._docFetcher.fetch(self._cursorDescription.collectionName, id, op, finishIfNeedToPollQuery(function (err, doc) {
                if (err) {
                  Meteor._debug('Got exception while fetching documents', err);
                  // If we get an error from the fetcher (eg, trouble
                  // connecting to Mongo), let's just abandon the fetch phase
                  // altogether and fall back to polling. It's not like we're
                  // getting live updates anyway.
                  if (self._phase !== PHASE.QUERYING) {
                    self._needToPollQuery();
                  }
                  waiting--;
                  // Because fetch() never calls its callback synchronously,
                  // this is safe (ie, we won't call fut.return() before the
                  // forEach is done).
                  if (waiting === 0) promiseResolver();
                  return;
                }
                try {
                  if (!self._stopped && self._phase === PHASE.FETCHING && self._fetchGeneration === thisGeneration) {
                    // We re-check the generation in case we've had an explicit
                    // _pollQuery call (eg, in another fiber) which should
                    // effectively cancel this round of fetches.  (_pollQuery
                    // increments the generation.)

                    self._handleDoc(id, doc);
                  }
                } finally {
                  waiting--;
                  // Because fetch() never calls its callback synchronously,
                  // this is safe (ie, we won't call fut.return() before the
                  // forEach is done).
                  if (waiting === 0) promiseResolver();
                }
              }));
            });
            await awaitablePromise;
            // Exit now if we've had a _pollQuery call (here or in another fiber).
            if (self._phase === PHASE.QUERYING) return;
            self._currentlyFetching = null;
          }
          // We're done fetching, so we can be steady, unless we've had a
          // _pollQuery call (here or in another fiber).
          if (self._phase !== PHASE.QUERYING) await self._beSteady();
        }));
      },
      _beSteady: async function () {
        var self = this;
        self._registerPhaseChange(PHASE.STEADY);
        var writes = self._writesToCommitWhenWeReachSteady || [];
        self._writesToCommitWhenWeReachSteady = [];
        await self._multiplexer.onFlush(async function () {
          try {
            for (const w of writes) {
              await w.committed();
            }
          } catch (e) {
            console.error("_beSteady error", {
              writes
            }, e);
          }
        });
      },
      _handleOplogEntryQuerying: function (op) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          self._needToFetch.set(idForOp(op), op);
        });
      },
      _handleOplogEntrySteadyOrFetching: function (op) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          var id = idForOp(op);
          // If we're already fetching this one, or about to, we can't optimize;
          // make sure that we fetch it again if necessary.

          if (self._phase === PHASE.FETCHING && (self._currentlyFetching && self._currentlyFetching.has(id) || self._needToFetch.has(id))) {
            self._needToFetch.set(id, op);
            return;
          }
          if (op.op === 'd') {
            if (self._published.has(id) || self._limit && self._unpublishedBuffer.has(id)) self._removeMatching(id);
          } else if (op.op === 'i') {
            if (self._published.has(id)) throw new Error("insert found for already-existing ID in published");
            if (self._unpublishedBuffer && self._unpublishedBuffer.has(id)) throw new Error("insert found for already-existing ID in buffer");

            // XXX what if selector yields?  for now it can't but later it could
            // have $where
            if (self._matcher.documentMatches(op.o).result) self._addMatching(op.o);
          } else if (op.op === 'u') {
            // we are mapping the new oplog format on mongo 5
            // to what we know better, $set
            op.o = oplogV2V1Converter(op.o);
            // Is this a modifier ($set/$unset, which may require us to poll the
            // database to figure out if the whole document matches the selector) or
            // a replacement (in which case we can just directly re-evaluate the
            // selector)?
            // oplog format has changed on mongodb 5, we have to support both now
            // diff is the format in Mongo 5+ (oplog v2)
            var isReplace = !has(op.o, '$set') && !has(op.o, 'diff') && !has(op.o, '$unset');
            // If this modifier modifies something inside an EJSON custom type (ie,
            // anything with EJSON$), then we can't try to use
            // LocalCollection._modify, since that just mutates the EJSON encoding,
            // not the actual object.
            var canDirectlyModifyDoc = !isReplace && modifierCanBeDirectlyApplied(op.o);
            var publishedBefore = self._published.has(id);
            var bufferedBefore = self._limit && self._unpublishedBuffer.has(id);
            if (isReplace) {
              self._handleDoc(id, Object.assign({
                _id: id
              }, op.o));
            } else if ((publishedBefore || bufferedBefore) && canDirectlyModifyDoc) {
              // Oh great, we actually know what the document is, so we can apply
              // this directly.
              var newDoc = self._published.has(id) ? self._published.get(id) : self._unpublishedBuffer.get(id);
              newDoc = EJSON.clone(newDoc);
              newDoc._id = id;
              try {
                LocalCollection._modify(newDoc, op.o);
              } catch (e) {
                if (e.name !== "MinimongoError") throw e;
                // We didn't understand the modifier.  Re-fetch.
                self._needToFetch.set(id, op);
                if (self._phase === PHASE.STEADY) {
                  self._fetchModifiedDocuments();
                }
                return;
              }
              self._handleDoc(id, self._sharedProjectionFn(newDoc));
            } else if (!canDirectlyModifyDoc || self._matcher.canBecomeTrueByModifier(op.o) || self._sorter && self._sorter.affectedByModifier(op.o)) {
              self._needToFetch.set(id, op);
              if (self._phase === PHASE.STEADY) self._fetchModifiedDocuments();
            }
          } else {
            throw Error("XXX SURPRISING OPERATION: " + op);
          }
        });
      },
      async _runInitialQueryAsync() {
        var self = this;
        if (self._stopped) throw new Error("oplog stopped surprisingly early");
        await self._runQuery({
          initial: true
        }); // yields

        if (self._stopped) return; // can happen on queryError

        // Allow observeChanges calls to return. (After this, it's possible for
        // stop() to be called.)
        await self._multiplexer.ready();
        await self._doneQuerying(); // yields
      },
      // Yields!
      _runInitialQuery: function () {
        return this._runInitialQueryAsync();
      },
      // In various circumstances, we may just want to stop processing the oplog and
      // re-run the initial query, just as if we were a PollingObserveDriver.
      //
      // This function may not block, because it is called from an oplog entry
      // handler.
      //
      // XXX We should call this when we detect that we've been in FETCHING for "too
      // long".
      //
      // XXX We should call this when we detect Mongo failover (since that might
      // mean that some of the oplog entries we have processed have been rolled
      // back). The Node Mongo driver is in the middle of a bunch of huge
      // refactorings, including the way that it notifies you when primary
      // changes. Will put off implementing this until driver 1.4 is out.
      _pollQuery: function () {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          if (self._stopped) return;

          // Yay, we get to forget about all the things we thought we had to fetch.
          self._needToFetch = new LocalCollection._IdMap();
          self._currentlyFetching = null;
          ++self._fetchGeneration; // ignore any in-flight fetches
          self._registerPhaseChange(PHASE.QUERYING);

          // Defer so that we don't yield.  We don't need finishIfNeedToPollQuery
          // here because SwitchedToQuery is not thrown in QUERYING mode.
          Meteor.defer(async function () {
            await self._runQuery();
            await self._doneQuerying();
          });
        });
      },
      // Yields!
      async _runQueryAsync(options) {
        var self = this;
        options = options || {};
        var newResults, newBuffer;

        // This while loop is just to retry failures.
        while (true) {
          // If we've been stopped, we don't have to run anything any more.
          if (self._stopped) return;
          newResults = new LocalCollection._IdMap();
          newBuffer = new LocalCollection._IdMap();

          // Query 2x documents as the half excluded from the original query will go
          // into unpublished buffer to reduce additional Mongo lookups in cases
          // when documents are removed from the published set and need a
          // replacement.
          // XXX needs more thought on non-zero skip
          // XXX 2 is a "magic number" meaning there is an extra chunk of docs for
          // buffer if such is needed.
          var cursor = self._cursorForQuery({
            limit: self._limit * 2
          });
          try {
            await cursor.forEach(function (doc, i) {
              // yields
              if (!self._limit || i < self._limit) {
                newResults.set(doc._id, doc);
              } else {
                newBuffer.set(doc._id, doc);
              }
            });
            break;
          } catch (e) {
            if (options.initial && typeof e.code === 'number') {
              // This is an error document sent to us by mongod, not a connection
              // error generated by the client. And we've never seen this query work
              // successfully. Probably it's a bad selector or something, so we
              // should NOT retry. Instead, we should halt the observe (which ends
              // up calling `stop` on us).
              await self._multiplexer.queryError(e);
              return;
            }

            // During failover (eg) if we get an exception we should log and retry
            // instead of crashing.
            Meteor._debug("Got exception while polling query", e);
            await Meteor._sleepForMs(100);
          }
        }
        if (self._stopped) return;
        self._publishNewResults(newResults, newBuffer);
      },
      // Yields!
      _runQuery: function (options) {
        return this._runQueryAsync(options);
      },
      // Transitions to QUERYING and runs another query, or (if already in QUERYING)
      // ensures that we will query again later.
      //
      // This function may not block, because it is called from an oplog entry
      // handler. However, if we were not already in the QUERYING phase, it throws
      // an exception that is caught by the closest surrounding
      // finishIfNeedToPollQuery call; this ensures that we don't continue running
      // close that was designed for another phase inside PHASE.QUERYING.
      //
      // (It's also necessary whenever logic in this file yields to check that other
      // phases haven't put us into QUERYING mode, though; eg,
      // _fetchModifiedDocuments does this.)
      _needToPollQuery: function () {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          if (self._stopped) return;

          // If we're not already in the middle of a query, we can query now
          // (possibly pausing FETCHING).
          if (self._phase !== PHASE.QUERYING) {
            self._pollQuery();
            throw new SwitchedToQuery();
          }

          // We're currently in QUERYING. Set a flag to ensure that we run another
          // query when we're done.
          self._requeryWhenDoneThisQuery = true;
        });
      },
      // Yields!
      _doneQuerying: async function () {
        var self = this;
        if (self._stopped) return;
        await self._mongoHandle._oplogHandle.waitUntilCaughtUp();
        if (self._stopped) return;
        if (self._phase !== PHASE.QUERYING) throw Error("Phase unexpectedly " + self._phase);
        if (self._requeryWhenDoneThisQuery) {
          self._requeryWhenDoneThisQuery = false;
          self._pollQuery();
        } else if (self._needToFetch.empty()) {
          await self._beSteady();
        } else {
          self._fetchModifiedDocuments();
        }
      },
      _cursorForQuery: function (optionsOverwrite) {
        var self = this;
        return Meteor._noYieldsAllowed(function () {
          // The query we run is almost the same as the cursor we are observing,
          // with a few changes. We need to read all the fields that are relevant to
          // the selector, not just the fields we are going to publish (that's the
          // "shared" projection). And we don't want to apply any transform in the
          // cursor, because observeChanges shouldn't use the transform.
          var options = Object.assign({}, self._cursorDescription.options);

          // Allow the caller to modify the options. Useful to specify different
          // skip and limit values.
          Object.assign(options, optionsOverwrite);
          options.fields = self._sharedProjection;
          delete options.transform;
          // We are NOT deep cloning fields or selector here, which should be OK.
          var description = new CursorDescription(self._cursorDescription.collectionName, self._cursorDescription.selector, options);
          return new Cursor(self._mongoHandle, description);
        });
      },
      // Replace self._published with newResults (both are IdMaps), invoking observe
      // callbacks on the multiplexer.
      // Replace self._unpublishedBuffer with newBuffer.
      //
      // XXX This is very similar to LocalCollection._diffQueryUnorderedChanges. We
      // should really: (a) Unify IdMap and OrderedDict into Unordered/OrderedDict
      // (b) Rewrite diff.js to use these classes instead of arrays and objects.
      _publishNewResults: function (newResults, newBuffer) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          // If the query is limited and there is a buffer, shut down so it doesn't
          // stay in a way.
          if (self._limit) {
            self._unpublishedBuffer.clear();
          }

          // First remove anything that's gone. Be careful not to modify
          // self._published while iterating over it.
          var idsToRemove = [];
          self._published.forEach(function (doc, id) {
            if (!newResults.has(id)) idsToRemove.push(id);
          });
          idsToRemove.forEach(function (id) {
            self._removePublished(id);
          });

          // Now do adds and changes.
          // If self has a buffer and limit, the new fetched result will be
          // limited correctly as the query has sort specifier.
          newResults.forEach(function (doc, id) {
            self._handleDoc(id, doc);
          });

          // Sanity-check that everything we tried to put into _published ended up
          // there.
          // XXX if this is slow, remove it later
          if (self._published.size() !== newResults.size()) {
            Meteor._debug('The Mongo server and the Meteor query disagree on how ' + 'many documents match your query. Cursor description: ', self._cursorDescription);
          }
          self._published.forEach(function (doc, id) {
            if (!newResults.has(id)) throw Error("_published has a doc that newResults doesn't; " + id);
          });

          // Finally, replace the buffer
          newBuffer.forEach(function (doc, id) {
            self._addBuffered(id, doc);
          });
          self._safeAppendToBuffer = newBuffer.size() < self._limit;
        });
      },
      // This stop function is invoked from the onStop of the ObserveMultiplexer, so
      // it shouldn't actually be possible to call it until the multiplexer is
      // ready.
      //
      // It's important to check self._stopped after every call in this file that
      // can yield!
      _stop: async function () {
        var self = this;
        if (self._stopped) return;
        self._stopped = true;

        // Note: we *don't* use multiplexer.onFlush here because this stop
        // callback is actually invoked by the multiplexer itself when it has
        // determined that there are no handles left. So nothing is actually going
        // to get flushed (and it's probably not valid to call methods on the
        // dying multiplexer).
        for (const w of self._writesToCommitWhenWeReachSteady) {
          await w.committed();
        }
        self._writesToCommitWhenWeReachSteady = null;

        // Proactively drop references to potentially big things.
        self._published = null;
        self._unpublishedBuffer = null;
        self._needToFetch = null;
        self._currentlyFetching = null;
        self._oplogEntryHandle = null;
        self._listenersHandle = null;
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-drivers-oplog", -1);
        var _iteratorAbruptCompletion = false;
        var _didIteratorError = false;
        var _iteratorError;
        try {
          for (var _iterator = _asyncIterator(self._stopHandles), _step; _iteratorAbruptCompletion = !(_step = await _iterator.next()).done; _iteratorAbruptCompletion = false) {
            const handle = _step.value;
            {
              await handle.stop();
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (_iteratorAbruptCompletion && _iterator.return != null) {
              await _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      },
      stop: async function () {
        const self = this;
        return await self._stop();
      },
      _registerPhaseChange: function (phase) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          var now = new Date();
          if (self._phase) {
            var timeDiff = now - self._phaseStartTime;
            Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "time-spent-in-" + self._phase + "-phase", timeDiff);
          }
          self._phase = phase;
          self._phaseStartTime = now;
        });
      }
    });

    // Does our oplog tailing code support this cursor? For now, we are being very
    // conservative and allowing only simple queries with simple options.
    // (This is a "static method".)
    OplogObserveDriver.cursorSupported = function (cursorDescription, matcher) {
      // First, check the options.
      var options = cursorDescription.options;

      // Did the user say no explicitly?
      // underscored version of the option is COMPAT with 1.2
      if (options.disableOplog || options._disableOplog) return false;

      // skip is not supported: to support it we would need to keep track of all
      // "skipped" documents or at least their ids.
      // limit w/o a sort specifier is not supported: current implementation needs a
      // deterministic way to order documents.
      if (options.skip || options.limit && !options.sort) return false;

      // If a fields projection option is given check if it is supported by
      // minimongo (some operators are not supported).
      const fields = options.fields || options.projection;
      if (fields) {
        try {
          LocalCollection._checkSupportedProjection(fields);
        } catch (e) {
          if (e.name === "MinimongoError") {
            return false;
          } else {
            throw e;
          }
        }
      }

      // We don't allow the following selectors:
      //   - $where (not confident that we provide the same JS environment
      //             as Mongo, and can yield!)
      //   - $near (has "interesting" properties in MongoDB, like the possibility
      //            of returning an ID multiple times, though even polling maybe
      //            have a bug there)
      //           XXX: once we support it, we would need to think more on how we
      //           initialize the comparators when we create the driver.
      return !matcher.hasWhere() && !matcher.hasGeoQuery();
    };
    var modifierCanBeDirectlyApplied = function (modifier) {
      return Object.entries(modifier).every(function (_ref) {
        let [operation, fields] = _ref;
        return Object.entries(fields).every(function (_ref2) {
          let [field, value] = _ref2;
          return !/EJSON\$/.test(field);
        });
      });
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

},"oplog_v2_converter.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/oplog_v2_converter.ts                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module1.export({
      oplogV2V1Converter: () => oplogV2V1Converter
    });
    let EJSON;
    module1.link("meteor/ejson", {
      EJSON(v) {
        EJSON = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const arrayOperatorKeyRegex = /^(a|[su]\d+)$/;
    /**
     * Checks if a field is an array operator key of form 'a' or 's1' or 'u1' etc
     */
    function isArrayOperatorKey(field) {
      return arrayOperatorKeyRegex.test(field);
    }
    /**
     * Type guard to check if an operator is a valid array operator.
     * Array operators have 'a: true' and keys that match the arrayOperatorKeyRegex
     */
    function isArrayOperator(operator) {
      return operator !== null && typeof operator === 'object' && 'a' in operator && operator.a === true && Object.keys(operator).every(isArrayOperatorKey);
    }
    /**
     * Joins two parts of a field path with a dot.
     * Returns the key itself if prefix is empty.
     */
    function join(prefix, key) {
      return prefix ? "".concat(prefix, ".").concat(key) : key;
    }
    /**
     * Recursively flattens an object into a target object with dot notation paths.
     * Handles special cases:
     * - Arrays are assigned directly
     * - Custom EJSON types are preserved
     * - Mongo.ObjectIDs are preserved
     * - Plain objects are recursively flattened
     * - Empty objects are assigned directly
     */
    function flattenObjectInto(target, source, prefix) {
      if (Array.isArray(source) || typeof source !== 'object' || source === null || source instanceof Mongo.ObjectID || EJSON._isCustomType(source)) {
        target[prefix] = source;
        return;
      }
      const entries = Object.entries(source);
      if (entries.length) {
        entries.forEach(_ref => {
          let [key, value] = _ref;
          flattenObjectInto(target, value, join(prefix, key));
        });
      } else {
        target[prefix] = source;
      }
    }
    /**
     * Converts an oplog diff to a series of $set and $unset operations.
     * Handles several types of operations:
     * - Direct unsets via 'd' field
     * - Nested sets via 'i' field
     * - Top-level sets via 'u' field
     * - Array operations and nested objects via 's' prefixed fields
     *
     * Preserves the structure of EJSON custom types and ObjectIDs while
     * flattening paths into dot notation for MongoDB updates.
     */
    function convertOplogDiff(oplogEntry, diff) {
      let prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      Object.entries(diff).forEach(_ref2 => {
        let [diffKey, value] = _ref2;
        if (diffKey === 'd') {
          var _oplogEntry$$unset;
          // Handle `$unset`s
          (_oplogEntry$$unset = oplogEntry.$unset) !== null && _oplogEntry$$unset !== void 0 ? _oplogEntry$$unset : oplogEntry.$unset = {};
          Object.keys(value).forEach(key => {
            oplogEntry.$unset[join(prefix, key)] = true;
          });
        } else if (diffKey === 'i') {
          var _oplogEntry$$set;
          // Handle (potentially) nested `$set`s
          (_oplogEntry$$set = oplogEntry.$set) !== null && _oplogEntry$$set !== void 0 ? _oplogEntry$$set : oplogEntry.$set = {};
          flattenObjectInto(oplogEntry.$set, value, prefix);
        } else if (diffKey === 'u') {
          var _oplogEntry$$set2;
          // Handle flat `$set`s
          (_oplogEntry$$set2 = oplogEntry.$set) !== null && _oplogEntry$$set2 !== void 0 ? _oplogEntry$$set2 : oplogEntry.$set = {};
          Object.entries(value).forEach(_ref3 => {
            let [key, fieldValue] = _ref3;
            oplogEntry.$set[join(prefix, key)] = fieldValue;
          });
        } else if (diffKey.startsWith('s')) {
          // Handle s-fields (array operations and nested objects)
          const key = diffKey.slice(1);
          if (isArrayOperator(value)) {
            // Array operator
            Object.entries(value).forEach(_ref4 => {
              let [position, fieldValue] = _ref4;
              if (position === 'a') return;
              const positionKey = join(prefix, "".concat(key, ".").concat(position.slice(1)));
              if (position[0] === 's') {
                convertOplogDiff(oplogEntry, fieldValue, positionKey);
              } else if (fieldValue === null) {
                var _oplogEntry$$unset2;
                (_oplogEntry$$unset2 = oplogEntry.$unset) !== null && _oplogEntry$$unset2 !== void 0 ? _oplogEntry$$unset2 : oplogEntry.$unset = {};
                oplogEntry.$unset[positionKey] = true;
              } else {
                var _oplogEntry$$set3;
                (_oplogEntry$$set3 = oplogEntry.$set) !== null && _oplogEntry$$set3 !== void 0 ? _oplogEntry$$set3 : oplogEntry.$set = {};
                oplogEntry.$set[positionKey] = fieldValue;
              }
            });
          } else if (key) {
            // Nested object
            convertOplogDiff(oplogEntry, value, join(prefix, key));
          }
        }
      });
    }
    /**
     * Converts a MongoDB v2 oplog entry to v1 format.
     * Returns the original entry unchanged if it's not a v2 oplog entry
     * or doesn't contain a diff field.
     *
     * The converted entry will contain $set and $unset operations that are
     * equivalent to the v2 diff format, with paths flattened to dot notation
     * and special handling for EJSON custom types and ObjectIDs.
     */
    function oplogV2V1Converter(oplogEntry) {
      if (oplogEntry.$v !== 2 || !oplogEntry.diff) {
        return oplogEntry;
      }
      const convertedOplogEntry = {
        $v: 2
      };
      convertOplogDiff(convertedOplogEntry, oplogEntry.diff);
      return convertedOplogEntry;
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

},"cursor_description.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/cursor_description.ts                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  CursorDescription: () => CursorDescription
});
class CursorDescription {
  constructor(collectionName, selector, options) {
    this.collectionName = void 0;
    this.selector = void 0;
    this.options = void 0;
    this.collectionName = collectionName;
    // @ts-ignore
    this.selector = Mongo.Collection._rewriteSelector(selector);
    this.options = options || {};
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo_connection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_connection.js                                                                                  //
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
      MongoConnection: () => MongoConnection
    });
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    let CLIENT_ONLY_METHODS, getAsyncMethodName;
    module.link("meteor/minimongo/constants", {
      CLIENT_ONLY_METHODS(v) {
        CLIENT_ONLY_METHODS = v;
      },
      getAsyncMethodName(v) {
        getAsyncMethodName = v;
      }
    }, 1);
    let path;
    module.link("path", {
      default(v) {
        path = v;
      }
    }, 2);
    let AsynchronousCursor;
    module.link("./asynchronous_cursor", {
      AsynchronousCursor(v) {
        AsynchronousCursor = v;
      }
    }, 3);
    let Cursor;
    module.link("./cursor", {
      Cursor(v) {
        Cursor = v;
      }
    }, 4);
    let CursorDescription;
    module.link("./cursor_description", {
      CursorDescription(v) {
        CursorDescription = v;
      }
    }, 5);
    let DocFetcher;
    module.link("./doc_fetcher", {
      DocFetcher(v) {
        DocFetcher = v;
      }
    }, 6);
    let MongoDB, replaceMeteorAtomWithMongo, replaceTypes, transformResult;
    module.link("./mongo_common", {
      MongoDB(v) {
        MongoDB = v;
      },
      replaceMeteorAtomWithMongo(v) {
        replaceMeteorAtomWithMongo = v;
      },
      replaceTypes(v) {
        replaceTypes = v;
      },
      transformResult(v) {
        transformResult = v;
      }
    }, 7);
    let ObserveHandle;
    module.link("./observe_handle", {
      ObserveHandle(v) {
        ObserveHandle = v;
      }
    }, 8);
    let ObserveMultiplexer;
    module.link("./observe_multiplex", {
      ObserveMultiplexer(v) {
        ObserveMultiplexer = v;
      }
    }, 9);
    let OplogObserveDriver;
    module.link("./oplog_observe_driver", {
      OplogObserveDriver(v) {
        OplogObserveDriver = v;
      }
    }, 10);
    let OPLOG_COLLECTION, OplogHandle;
    module.link("./oplog_tailing", {
      OPLOG_COLLECTION(v) {
        OPLOG_COLLECTION = v;
      },
      OplogHandle(v) {
        OplogHandle = v;
      }
    }, 11);
    let PollingObserveDriver;
    module.link("./polling_observe_driver", {
      PollingObserveDriver(v) {
        PollingObserveDriver = v;
      }
    }, 12);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const FILE_ASSET_SUFFIX = 'Asset';
    const ASSETS_FOLDER = 'assets';
    const APP_FOLDER = 'app';
    const oplogCollectionWarnings = [];
    const MongoConnection = function (url, options) {
      var _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2;
      var self = this;
      options = options || {};
      self._observeMultiplexers = {};
      self._onFailoverHook = new Hook();
      const userOptions = _objectSpread(_objectSpread({}, Mongo._connectionOptions || {}), ((_Meteor$settings = Meteor.settings) === null || _Meteor$settings === void 0 ? void 0 : (_Meteor$settings$pack = _Meteor$settings.packages) === null || _Meteor$settings$pack === void 0 ? void 0 : (_Meteor$settings$pack2 = _Meteor$settings$pack.mongo) === null || _Meteor$settings$pack2 === void 0 ? void 0 : _Meteor$settings$pack2.options) || {});
      var mongoOptions = Object.assign({
        ignoreUndefined: true
      }, userOptions);

      // Internally the oplog connections specify their own maxPoolSize
      // which we don't want to overwrite with any user defined value
      if ('maxPoolSize' in options) {
        // If we just set this for "server", replSet will override it. If we just
        // set it for replSet, it will be ignored if we're not using a replSet.
        mongoOptions.maxPoolSize = options.maxPoolSize;
      }
      if ('minPoolSize' in options) {
        mongoOptions.minPoolSize = options.minPoolSize;
      }

      // Transform options like "tlsCAFileAsset": "filename.pem" into
      // "tlsCAFile": "/<fullpath>/filename.pem"
      Object.entries(mongoOptions || {}).filter(_ref => {
        let [key] = _ref;
        return key && key.endsWith(FILE_ASSET_SUFFIX);
      }).forEach(_ref2 => {
        let [key, value] = _ref2;
        const optionName = key.replace(FILE_ASSET_SUFFIX, '');
        mongoOptions[optionName] = path.join(Assets.getServerDir(), ASSETS_FOLDER, APP_FOLDER, value);
        delete mongoOptions[key];
      });
      self.db = null;
      self._oplogHandle = null;
      self._docFetcher = null;
      mongoOptions.driverInfo = {
        name: 'Meteor',
        version: Meteor.release
      };
      self.client = new MongoDB.MongoClient(url, mongoOptions);
      self.db = self.client.db();
      self.client.on('serverDescriptionChanged', Meteor.bindEnvironment(event => {
        // When the connection is no longer against the primary node, execute all
        // failover hooks. This is important for the driver as it has to re-pool the
        // query when it happens.
        if (event.previousDescription.type !== 'RSPrimary' && event.newDescription.type === 'RSPrimary') {
          self._onFailoverHook.each(callback => {
            callback();
            return true;
          });
        }
      }));
      if (options.oplogUrl && !Package['disable-oplog']) {
        self._oplogHandle = new OplogHandle(options.oplogUrl, self.db.databaseName);
        self._docFetcher = new DocFetcher(self);
      }
    };
    MongoConnection.prototype._close = async function () {
      var self = this;
      if (!self.db) throw Error("close called before Connection created?");

      // XXX probably untested
      var oplogHandle = self._oplogHandle;
      self._oplogHandle = null;
      if (oplogHandle) await oplogHandle.stop();

      // Use Future.wrap so that errors get thrown. This happens to
      // work even outside a fiber since the 'close' method is not
      // actually asynchronous.
      await self.client.close();
    };
    MongoConnection.prototype.close = function () {
      return this._close();
    };
    MongoConnection.prototype._setOplogHandle = function (oplogHandle) {
      this._oplogHandle = oplogHandle;
      return this;
    };

    // Returns the Mongo Collection object; may yield.
    MongoConnection.prototype.rawCollection = function (collectionName) {
      var self = this;
      if (!self.db) throw Error("rawCollection called before Connection created?");
      return self.db.collection(collectionName);
    };
    MongoConnection.prototype.createCappedCollectionAsync = async function (collectionName, byteSize, maxDocuments) {
      var self = this;
      if (!self.db) throw Error("createCappedCollectionAsync called before Connection created?");
      await self.db.createCollection(collectionName, {
        capped: true,
        size: byteSize,
        max: maxDocuments
      });
    };

    // This should be called synchronously with a write, to create a
    // transaction on the current write fence, if any. After we can read
    // the write, and after observers have been notified (or at least,
    // after the observer notifiers have added themselves to the write
    // fence), you should call 'committed()' on the object returned.
    MongoConnection.prototype._maybeBeginWrite = function () {
      const fence = DDPServer._getCurrentFence();
      if (fence) {
        return fence.beginWrite();
      } else {
        return {
          committed: function () {}
        };
      }
    };

    // Internal interface: adds a callback which is called when the Mongo primary
    // changes. Returns a stop handle.
    MongoConnection.prototype._onFailover = function (callback) {
      return this._onFailoverHook.register(callback);
    };
    MongoConnection.prototype.insertAsync = async function (collection_name, document) {
      const self = this;
      if (collection_name === "___meteor_failure_test_collection") {
        const e = new Error("Failure test");
        e._expectedByTest = true;
        throw e;
      }
      if (!(LocalCollection._isPlainObject(document) && !EJSON._isCustomType(document))) {
        throw new Error("Only plain objects may be inserted into MongoDB");
      }
      var write = self._maybeBeginWrite();
      var refresh = async function () {
        await Meteor.refresh({
          collection: collection_name,
          id: document._id
        });
      };
      return self.rawCollection(collection_name).insertOne(replaceTypes(document, replaceMeteorAtomWithMongo), {
        safe: true
      }).then(async _ref3 => {
        let {
          insertedId
        } = _ref3;
        await refresh();
        await write.committed();
        return insertedId;
      }).catch(async e => {
        await write.committed();
        throw e;
      });
    };

    // Cause queries that may be affected by the selector to poll in this write
    // fence.
    MongoConnection.prototype._refresh = async function (collectionName, selector) {
      var refreshKey = {
        collection: collectionName
      };
      // If we know which documents we're removing, don't poll queries that are
      // specific to other documents. (Note that multiple notifications here should
      // not cause multiple polls, since all our listener is doing is enqueueing a
      // poll.)
      var specificIds = LocalCollection._idsMatchedBySelector(selector);
      if (specificIds) {
        for (const id of specificIds) {
          await Meteor.refresh(Object.assign({
            id: id
          }, refreshKey));
        }
        ;
      } else {
        await Meteor.refresh(refreshKey);
      }
    };
    MongoConnection.prototype.removeAsync = async function (collection_name, selector) {
      var self = this;
      if (collection_name === "___meteor_failure_test_collection") {
        var e = new Error("Failure test");
        e._expectedByTest = true;
        throw e;
      }
      var write = self._maybeBeginWrite();
      var refresh = async function () {
        await self._refresh(collection_name, selector);
      };
      return self.rawCollection(collection_name).deleteMany(replaceTypes(selector, replaceMeteorAtomWithMongo), {
        safe: true
      }).then(async _ref4 => {
        let {
          deletedCount
        } = _ref4;
        await refresh();
        await write.committed();
        return transformResult({
          result: {
            modifiedCount: deletedCount
          }
        }).numberAffected;
      }).catch(async err => {
        await write.committed();
        throw err;
      });
    };
    MongoConnection.prototype.dropCollectionAsync = async function (collectionName) {
      var self = this;
      var write = self._maybeBeginWrite();
      var refresh = function () {
        return Meteor.refresh({
          collection: collectionName,
          id: null,
          dropCollection: true
        });
      };
      return self.rawCollection(collectionName).drop().then(async result => {
        await refresh();
        await write.committed();
        return result;
      }).catch(async e => {
        await write.committed();
        throw e;
      });
    };

    // For testing only.  Slightly better than `c.rawDatabase().dropDatabase()`
    // because it lets the test's fence wait for it to be complete.
    MongoConnection.prototype.dropDatabaseAsync = async function () {
      var self = this;
      var write = self._maybeBeginWrite();
      var refresh = async function () {
        await Meteor.refresh({
          dropDatabase: true
        });
      };
      try {
        await self.db._dropDatabase();
        await refresh();
        await write.committed();
      } catch (e) {
        await write.committed();
        throw e;
      }
    };
    MongoConnection.prototype.updateAsync = async function (collection_name, selector, mod, options) {
      var self = this;
      if (collection_name === "___meteor_failure_test_collection") {
        var e = new Error("Failure test");
        e._expectedByTest = true;
        throw e;
      }

      // explicit safety check. null and undefined can crash the mongo
      // driver. Although the node driver and minimongo do 'support'
      // non-object modifier in that they don't crash, they are not
      // meaningful operations and do not do anything. Defensively throw an
      // error here.
      if (!mod || typeof mod !== 'object') {
        const error = new Error("Invalid modifier. Modifier must be an object.");
        throw error;
      }
      if (!(LocalCollection._isPlainObject(mod) && !EJSON._isCustomType(mod))) {
        const error = new Error("Only plain objects may be used as replacement" + " documents in MongoDB");
        throw error;
      }
      if (!options) options = {};
      var write = self._maybeBeginWrite();
      var refresh = async function () {
        await self._refresh(collection_name, selector);
      };
      var collection = self.rawCollection(collection_name);
      var mongoOpts = {
        safe: true
      };
      // Add support for filtered positional operator
      if (options.arrayFilters !== undefined) mongoOpts.arrayFilters = options.arrayFilters;
      // explictly enumerate options that minimongo supports
      if (options.upsert) mongoOpts.upsert = true;
      if (options.multi) mongoOpts.multi = true;
      // Lets you get a more more full result from MongoDB. Use with caution:
      // might not work with C.upsert (as opposed to C.update({upsert:true}) or
      // with simulated upsert.
      if (options.fullResult) mongoOpts.fullResult = true;
      var mongoSelector = replaceTypes(selector, replaceMeteorAtomWithMongo);
      var mongoMod = replaceTypes(mod, replaceMeteorAtomWithMongo);
      var isModify = LocalCollection._isModificationMod(mongoMod);
      if (options._forbidReplace && !isModify) {
        var err = new Error("Invalid modifier. Replacements are forbidden.");
        throw err;
      }

      // We've already run replaceTypes/replaceMeteorAtomWithMongo on
      // selector and mod.  We assume it doesn't matter, as far as
      // the behavior of modifiers is concerned, whether `_modify`
      // is run on EJSON or on mongo-converted EJSON.

      // Run this code up front so that it fails fast if someone uses
      // a Mongo update operator we don't support.
      let knownId;
      if (options.upsert) {
        try {
          let newDoc = LocalCollection._createUpsertDocument(selector, mod);
          knownId = newDoc._id;
        } catch (err) {
          throw err;
        }
      }
      if (options.upsert && !isModify && !knownId && options.insertedId && !(options.insertedId instanceof Mongo.ObjectID && options.generatedId)) {
        // In case of an upsert with a replacement, where there is no _id defined
        // in either the query or the replacement doc, mongo will generate an id itself.
        // Therefore we need this special strategy if we want to control the id ourselves.

        // We don't need to do this when:
        // - This is not a replacement, so we can add an _id to $setOnInsert
        // - The id is defined by query or mod we can just add it to the replacement doc
        // - The user did not specify any id preference and the id is a Mongo ObjectId,
        //     then we can just let Mongo generate the id
        return await simulateUpsertWithInsertedId(collection, mongoSelector, mongoMod, options).then(async result => {
          await refresh();
          await write.committed();
          if (result && !options._returnObject) {
            return result.numberAffected;
          } else {
            return result;
          }
        });
      } else {
        if (options.upsert && !knownId && options.insertedId && isModify) {
          if (!mongoMod.hasOwnProperty('$setOnInsert')) {
            mongoMod.$setOnInsert = {};
          }
          knownId = options.insertedId;
          Object.assign(mongoMod.$setOnInsert, replaceTypes({
            _id: options.insertedId
          }, replaceMeteorAtomWithMongo));
        }
        const strings = Object.keys(mongoMod).filter(key => !key.startsWith("$"));
        let updateMethod = strings.length > 0 ? 'replaceOne' : 'updateMany';
        updateMethod = updateMethod === 'updateMany' && !mongoOpts.multi ? 'updateOne' : updateMethod;
        return collection[updateMethod].bind(collection)(mongoSelector, mongoMod, mongoOpts).then(async result => {
          var meteorResult = transformResult({
            result
          });
          if (meteorResult && options._returnObject) {
            // If this was an upsertAsync() call, and we ended up
            // inserting a new doc and we know its id, then
            // return that id as well.
            if (options.upsert && meteorResult.insertedId) {
              if (knownId) {
                meteorResult.insertedId = knownId;
              } else if (meteorResult.insertedId instanceof MongoDB.ObjectId) {
                meteorResult.insertedId = new Mongo.ObjectID(meteorResult.insertedId.toHexString());
              }
            }
            await refresh();
            await write.committed();
            return meteorResult;
          } else {
            await refresh();
            await write.committed();
            return meteorResult.numberAffected;
          }
        }).catch(async err => {
          await write.committed();
          throw err;
        });
      }
    };

    // exposed for testing
    MongoConnection._isCannotChangeIdError = function (err) {
      // Mongo 3.2.* returns error as next Object:
      // {name: String, code: Number, errmsg: String}
      // Older Mongo returns:
      // {name: String, code: Number, err: String}
      var error = err.errmsg || err.err;

      // We don't use the error code here
      // because the error code we observed it producing (16837) appears to be
      // a far more generic error code based on examining the source.
      if (error.indexOf('The _id field cannot be changed') === 0 || error.indexOf("the (immutable) field '_id' was found to have been altered to _id") !== -1) {
        return true;
      }
      return false;
    };

    // XXX MongoConnection.upsertAsync() does not return the id of the inserted document
    // unless you set it explicitly in the selector or modifier (as a replacement
    // doc).
    MongoConnection.prototype.upsertAsync = async function (collectionName, selector, mod, options) {
      var self = this;
      if (typeof options === "function" && !callback) {
        callback = options;
        options = {};
      }
      return self.updateAsync(collectionName, selector, mod, Object.assign({}, options, {
        upsert: true,
        _returnObject: true
      }));
    };
    MongoConnection.prototype.find = function (collectionName, selector, options) {
      var self = this;
      if (arguments.length === 1) selector = {};
      return new Cursor(self, new CursorDescription(collectionName, selector, options));
    };
    MongoConnection.prototype.findOneAsync = async function (collection_name, selector, options) {
      var self = this;
      if (arguments.length === 1) {
        selector = {};
      }
      options = options || {};
      options.limit = 1;
      const results = await self.find(collection_name, selector, options).fetch();
      return results[0];
    };

    // We'll actually design an index API later. For now, we just pass through to
    // Mongo's, but make it synchronous.
    MongoConnection.prototype.createIndexAsync = async function (collectionName, index, options) {
      var self = this;

      // We expect this function to be called at startup, not from within a method,
      // so we don't interact with the write fence.
      var collection = self.rawCollection(collectionName);
      await collection.createIndex(index, options);
    };

    // just to be consistent with the other methods
    MongoConnection.prototype.createIndex = MongoConnection.prototype.createIndexAsync;
    MongoConnection.prototype.countDocuments = function (collectionName) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      args = args.map(arg => replaceTypes(arg, replaceMeteorAtomWithMongo));
      const collection = this.rawCollection(collectionName);
      return collection.countDocuments(...args);
    };
    MongoConnection.prototype.estimatedDocumentCount = function (collectionName) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }
      args = args.map(arg => replaceTypes(arg, replaceMeteorAtomWithMongo));
      const collection = this.rawCollection(collectionName);
      return collection.estimatedDocumentCount(...args);
    };
    MongoConnection.prototype.ensureIndexAsync = MongoConnection.prototype.createIndexAsync;
    MongoConnection.prototype.dropIndexAsync = async function (collectionName, index) {
      var self = this;

      // This function is only used by test code, not within a method, so we don't
      // interact with the write fence.
      var collection = self.rawCollection(collectionName);
      var indexName = await collection.dropIndex(index);
    };
    CLIENT_ONLY_METHODS.forEach(function (m) {
      MongoConnection.prototype[m] = function () {
        throw new Error("".concat(m, " +  is not available on the server. Please use ").concat(getAsyncMethodName(m), "() instead."));
      };
    });
    var NUM_OPTIMISTIC_TRIES = 3;
    var simulateUpsertWithInsertedId = async function (collection, selector, mod, options) {
      // STRATEGY: First try doing an upsert with a generated ID.
      // If this throws an error about changing the ID on an existing document
      // then without affecting the database, we know we should probably try
      // an update without the generated ID. If it affected 0 documents,
      // then without affecting the database, we the document that first
      // gave the error is probably removed and we need to try an insert again
      // We go back to step one and repeat.
      // Like all "optimistic write" schemes, we rely on the fact that it's
      // unlikely our writes will continue to be interfered with under normal
      // circumstances (though sufficiently heavy contention with writers
      // disagreeing on the existence of an object will cause writes to fail
      // in theory).

      var insertedId = options.insertedId; // must exist
      var mongoOptsForUpdate = {
        safe: true,
        multi: options.multi
      };
      var mongoOptsForInsert = {
        safe: true,
        upsert: true
      };
      var replacementWithId = Object.assign(replaceTypes({
        _id: insertedId
      }, replaceMeteorAtomWithMongo), mod);
      var tries = NUM_OPTIMISTIC_TRIES;
      var doUpdate = async function () {
        tries--;
        if (!tries) {
          throw new Error("Upsert failed after " + NUM_OPTIMISTIC_TRIES + " tries.");
        } else {
          let method = collection.updateMany;
          if (!Object.keys(mod).some(key => key.startsWith("$"))) {
            method = collection.replaceOne.bind(collection);
          }
          return method(selector, mod, mongoOptsForUpdate).then(result => {
            if (result && (result.modifiedCount || result.upsertedCount)) {
              return {
                numberAffected: result.modifiedCount || result.upsertedCount,
                insertedId: result.upsertedId || undefined
              };
            } else {
              return doConditionalInsert();
            }
          });
        }
      };
      var doConditionalInsert = function () {
        return collection.replaceOne(selector, replacementWithId, mongoOptsForInsert).then(result => ({
          numberAffected: result.upsertedCount,
          insertedId: result.upsertedId
        })).catch(err => {
          if (MongoConnection._isCannotChangeIdError(err)) {
            return doUpdate();
          } else {
            throw err;
          }
        });
      };
      return doUpdate();
    };

    // observeChanges for tailable cursors on capped collections.
    //
    // Some differences from normal cursors:
    //   - Will never produce anything other than 'added' or 'addedBefore'. If you
    //     do update a document that has already been produced, this will not notice
    //     it.
    //   - If you disconnect and reconnect from Mongo, it will essentially restart
    //     the query, which will lead to duplicate results. This is pretty bad,
    //     but if you include a field called 'ts' which is inserted as
    //     new MongoInternals.MongoTimestamp(0, 0) (which is initialized to the
    //     current Mongo-style timestamp), we'll be able to find the place to
    //     restart properly. (This field is specifically understood by Mongo with an
    //     optimization which allows it to find the right place to start without
    //     an index on ts. It's how the oplog works.)
    //   - No callbacks are triggered synchronously with the call (there's no
    //     differentiation between "initial data" and "later changes"; everything
    //     that matches the query gets sent asynchronously).
    //   - De-duplication is not implemented.
    //   - Does not yet interact with the write fence. Probably, this should work by
    //     ignoring removes (which don't work on capped collections) and updates
    //     (which don't affect tailable cursors), and just keeping track of the ID
    //     of the inserted object, and closing the write fence once you get to that
    //     ID (or timestamp?).  This doesn't work well if the document doesn't match
    //     the query, though.  On the other hand, the write fence can close
    //     immediately if it does not match the query. So if we trust minimongo
    //     enough to accurately evaluate the query against the write fence, we
    //     should be able to do this...  Of course, minimongo doesn't even support
    //     Mongo Timestamps yet.
    MongoConnection.prototype._observeChangesTailable = function (cursorDescription, ordered, callbacks) {
      var self = this;

      // Tailable cursors only ever call added/addedBefore callbacks, so it's an
      // error if you didn't provide them.
      if (ordered && !callbacks.addedBefore || !ordered && !callbacks.added) {
        throw new Error("Can't observe an " + (ordered ? "ordered" : "unordered") + " tailable cursor without a " + (ordered ? "addedBefore" : "added") + " callback");
      }
      return self.tail(cursorDescription, function (doc) {
        var id = doc._id;
        delete doc._id;
        // The ts is an implementation detail. Hide it.
        delete doc.ts;
        if (ordered) {
          callbacks.addedBefore(id, doc, null);
        } else {
          callbacks.added(id, doc);
        }
      });
    };
    MongoConnection.prototype._createAsynchronousCursor = function (cursorDescription) {
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var self = this;
      const {
        selfForIteration,
        useTransform
      } = options;
      options = {
        selfForIteration,
        useTransform
      };
      var collection = self.rawCollection(cursorDescription.collectionName);
      var cursorOptions = cursorDescription.options;
      var mongoOptions = {
        sort: cursorOptions.sort,
        limit: cursorOptions.limit,
        skip: cursorOptions.skip,
        projection: cursorOptions.fields || cursorOptions.projection,
        readPreference: cursorOptions.readPreference
      };

      // Do we want a tailable cursor (which only works on capped collections)?
      if (cursorOptions.tailable) {
        mongoOptions.numberOfRetries = -1;
      }
      var dbCursor = collection.find(replaceTypes(cursorDescription.selector, replaceMeteorAtomWithMongo), mongoOptions);

      // Do we want a tailable cursor (which only works on capped collections)?
      if (cursorOptions.tailable) {
        // We want a tailable cursor...
        dbCursor.addCursorFlag("tailable", true);
        // ... and for the server to wait a bit if any getMore has no data (rather
        // than making us put the relevant sleeps in the client)...
        dbCursor.addCursorFlag("awaitData", true);

        // And if this is on the oplog collection and the cursor specifies a 'ts',
        // then set the undocumented oplog replay flag, which does a special scan to
        // find the first document (instead of creating an index on ts). This is a
        // very hard-coded Mongo flag which only works on the oplog collection and
        // only works with the ts field.
        if (cursorDescription.collectionName === OPLOG_COLLECTION && cursorDescription.selector.ts) {
          dbCursor.addCursorFlag("oplogReplay", true);
        }
      }
      if (typeof cursorOptions.maxTimeMs !== 'undefined') {
        dbCursor = dbCursor.maxTimeMS(cursorOptions.maxTimeMs);
      }
      if (typeof cursorOptions.hint !== 'undefined') {
        dbCursor = dbCursor.hint(cursorOptions.hint);
      }
      return new AsynchronousCursor(dbCursor, cursorDescription, options, collection);
    };

    // Tails the cursor described by cursorDescription, most likely on the
    // oplog. Calls docCallback with each document found. Ignores errors and just
    // restarts the tail on error.
    //
    // If timeoutMS is set, then if we don't get a new document every timeoutMS,
    // kill and restart the cursor. This is primarily a workaround for #8598.
    MongoConnection.prototype.tail = function (cursorDescription, docCallback, timeoutMS) {
      var self = this;
      if (!cursorDescription.options.tailable) throw new Error("Can only tail a tailable cursor");
      var cursor = self._createAsynchronousCursor(cursorDescription);
      var stopped = false;
      var lastTS;
      Meteor.defer(async function loop() {
        var doc = null;
        while (true) {
          if (stopped) return;
          try {
            doc = await cursor._nextObjectPromiseWithTimeout(timeoutMS);
          } catch (err) {
            // We should not ignore errors here unless we want to spend a lot of time debugging
            console.error(err);
            // There's no good way to figure out if this was actually an error from
            // Mongo, or just client-side (including our own timeout error). Ah
            // well. But either way, we need to retry the cursor (unless the failure
            // was because the observe got stopped).
            doc = null;
          }
          // Since we awaited a promise above, we need to check again to see if
          // we've been stopped before calling the callback.
          if (stopped) return;
          if (doc) {
            // If a tailable cursor contains a "ts" field, use it to recreate the
            // cursor on error. ("ts" is a standard that Mongo uses internally for
            // the oplog, and there's a special flag that lets you do binary search
            // on it instead of needing to use an index.)
            lastTS = doc.ts;
            docCallback(doc);
          } else {
            var newSelector = Object.assign({}, cursorDescription.selector);
            if (lastTS) {
              newSelector.ts = {
                $gt: lastTS
              };
            }
            cursor = self._createAsynchronousCursor(new CursorDescription(cursorDescription.collectionName, newSelector, cursorDescription.options));
            // Mongo failover takes many seconds.  Retry in a bit.  (Without this
            // setTimeout, we peg the CPU at 100% and never notice the actual
            // failover.
            setTimeout(loop, 100);
            break;
          }
        }
      });
      return {
        stop: function () {
          stopped = true;
          cursor.close();
        }
      };
    };
    Object.assign(MongoConnection.prototype, {
      _observeChanges: async function (cursorDescription, ordered, callbacks, nonMutatingCallbacks) {
        var _self$_oplogHandle;
        var self = this;
        const collectionName = cursorDescription.collectionName;
        if (cursorDescription.options.tailable) {
          return self._observeChangesTailable(cursorDescription, ordered, callbacks);
        }

        // You may not filter out _id when observing changes, because the id is a core
        // part of the observeChanges API.
        const fieldsOptions = cursorDescription.options.projection || cursorDescription.options.fields;
        if (fieldsOptions && (fieldsOptions._id === 0 || fieldsOptions._id === false)) {
          throw Error("You may not observe a cursor with {fields: {_id: 0}}");
        }
        var observeKey = EJSON.stringify(Object.assign({
          ordered: ordered
        }, cursorDescription));
        var multiplexer, observeDriver;
        var firstHandle = false;

        // Find a matching ObserveMultiplexer, or create a new one. This next block is
        // guaranteed to not yield (and it doesn't call anything that can observe a
        // new query), so no other calls to this function can interleave with it.
        if (observeKey in self._observeMultiplexers) {
          multiplexer = self._observeMultiplexers[observeKey];
        } else {
          firstHandle = true;
          // Create a new ObserveMultiplexer.
          multiplexer = new ObserveMultiplexer({
            ordered: ordered,
            onStop: function () {
              delete self._observeMultiplexers[observeKey];
              return observeDriver.stop();
            }
          });
        }
        var observeHandle = new ObserveHandle(multiplexer, callbacks, nonMutatingCallbacks);
        const oplogOptions = (self === null || self === void 0 ? void 0 : (_self$_oplogHandle = self._oplogHandle) === null || _self$_oplogHandle === void 0 ? void 0 : _self$_oplogHandle._oplogOptions) || {};
        const {
          includeCollections,
          excludeCollections
        } = oplogOptions;
        if (firstHandle) {
          var matcher, sorter;
          var canUseOplog = [function () {
            // At a bare minimum, using the oplog requires us to have an oplog, to
            // want unordered callbacks, and to not want a callback on the polls
            // that won't happen.
            return self._oplogHandle && !ordered && !callbacks._testOnlyPollCallback;
          }, function () {
            // We also need to check, if the collection of this Cursor is actually being "watched" by the Oplog handle
            // if not, we have to fallback to long polling
            if (excludeCollections !== null && excludeCollections !== void 0 && excludeCollections.length && excludeCollections.includes(collectionName)) {
              if (!oplogCollectionWarnings.includes(collectionName)) {
                console.warn("Meteor.settings.packages.mongo.oplogExcludeCollections includes the collection ".concat(collectionName, " - your subscriptions will only use long polling!"));
                oplogCollectionWarnings.push(collectionName); // we only want to show the warnings once per collection!
              }
              return false;
            }
            if (includeCollections !== null && includeCollections !== void 0 && includeCollections.length && !includeCollections.includes(collectionName)) {
              if (!oplogCollectionWarnings.includes(collectionName)) {
                console.warn("Meteor.settings.packages.mongo.oplogIncludeCollections does not include the collection ".concat(collectionName, " - your subscriptions will only use long polling!"));
                oplogCollectionWarnings.push(collectionName); // we only want to show the warnings once per collection!
              }
              return false;
            }
            return true;
          }, function () {
            // We need to be able to compile the selector. Fall back to polling for
            // some newfangled $selector that minimongo doesn't support yet.
            try {
              matcher = new Minimongo.Matcher(cursorDescription.selector);
              return true;
            } catch (e) {
              // XXX make all compilation errors MinimongoError or something
              //     so that this doesn't ignore unrelated exceptions
              return false;
            }
          }, function () {
            // ... and the selector itself needs to support oplog.
            return OplogObserveDriver.cursorSupported(cursorDescription, matcher);
          }, function () {
            // And we need to be able to compile the sort, if any.  eg, can't be
            // {$natural: 1}.
            if (!cursorDescription.options.sort) return true;
            try {
              sorter = new Minimongo.Sorter(cursorDescription.options.sort);
              return true;
            } catch (e) {
              // XXX make all compilation errors MinimongoError or something
              //     so that this doesn't ignore unrelated exceptions
              return false;
            }
          }].every(f => f()); // invoke each function and check if all return true

          var driverClass = canUseOplog ? OplogObserveDriver : PollingObserveDriver;
          observeDriver = new driverClass({
            cursorDescription: cursorDescription,
            mongoHandle: self,
            multiplexer: multiplexer,
            ordered: ordered,
            matcher: matcher,
            // ignored by polling
            sorter: sorter,
            // ignored by polling
            _testOnlyPollCallback: callbacks._testOnlyPollCallback
          });
          if (observeDriver._init) {
            await observeDriver._init();
          }

          // This field is only set for use in tests.
          multiplexer._observeDriver = observeDriver;
        }
        self._observeMultiplexers[observeKey] = multiplexer;
        // Blocks until the initial adds have been sent.
        await multiplexer.addHandleAndSendInitialAdds(observeHandle);
        return observeHandle;
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

},"mongo_common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_common.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      MongoDB: () => MongoDB,
      writeCallback: () => writeCallback,
      transformResult: () => transformResult,
      replaceMeteorAtomWithMongo: () => replaceMeteorAtomWithMongo,
      replaceTypes: () => replaceTypes,
      replaceMongoAtomWithMeteor: () => replaceMongoAtomWithMeteor,
      replaceNames: () => replaceNames
    });
    let clone;
    module.link("lodash.clone", {
      default(v) {
        clone = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const MongoDB = Object.assign(NpmModuleMongodb, {
      ObjectID: NpmModuleMongodb.ObjectId
    });
    const writeCallback = function (write, refresh, callback) {
      return function (err, result) {
        if (!err) {
          // XXX We don't have to run this on error, right?
          try {
            refresh();
          } catch (refreshErr) {
            if (callback) {
              callback(refreshErr);
              return;
            } else {
              throw refreshErr;
            }
          }
        }
        write.committed();
        if (callback) {
          callback(err, result);
        } else if (err) {
          throw err;
        }
      };
    };
    const transformResult = function (driverResult) {
      var meteorResult = {
        numberAffected: 0
      };
      if (driverResult) {
        var mongoResult = driverResult.result;
        // On updates with upsert:true, the inserted values come as a list of
        // upserted values -- even with options.multi, when the upsert does insert,
        // it only inserts one element.
        if (mongoResult.upsertedCount) {
          meteorResult.numberAffected = mongoResult.upsertedCount;
          if (mongoResult.upsertedId) {
            meteorResult.insertedId = mongoResult.upsertedId;
          }
        } else {
          // n was used before Mongo 5.0, in Mongo 5.0 we are not receiving this n
          // field and so we are using modifiedCount instead
          meteorResult.numberAffected = mongoResult.n || mongoResult.matchedCount || mongoResult.modifiedCount;
        }
      }
      return meteorResult;
    };
    const replaceMeteorAtomWithMongo = function (document) {
      if (EJSON.isBinary(document)) {
        // This does more copies than we'd like, but is necessary because
        // MongoDB.BSON only looks like it takes a Uint8Array (and doesn't actually
        // serialize it correctly).
        return new MongoDB.Binary(Buffer.from(document));
      }
      if (document instanceof MongoDB.Binary) {
        return document;
      }
      if (document instanceof Mongo.ObjectID) {
        return new MongoDB.ObjectId(document.toHexString());
      }
      if (document instanceof MongoDB.ObjectId) {
        return new MongoDB.ObjectId(document.toHexString());
      }
      if (document instanceof MongoDB.Timestamp) {
        // For now, the Meteor representation of a Mongo timestamp type (not a date!
        // this is a weird internal thing used in the oplog!) is the same as the
        // Mongo representation. We need to do this explicitly or else we would do a
        // structural clone and lose the prototype.
        return document;
      }
      if (document instanceof Decimal) {
        return MongoDB.Decimal128.fromString(document.toString());
      }
      if (EJSON._isCustomType(document)) {
        return replaceNames(makeMongoLegal, EJSON.toJSONValue(document));
      }
      // It is not ordinarily possible to stick dollar-sign keys into mongo
      // so we don't bother checking for things that need escaping at this time.
      return undefined;
    };
    const replaceTypes = function (document, atomTransformer) {
      if (typeof document !== 'object' || document === null) return document;
      var replacedTopLevelAtom = atomTransformer(document);
      if (replacedTopLevelAtom !== undefined) return replacedTopLevelAtom;
      var ret = document;
      Object.entries(document).forEach(function (_ref) {
        let [key, val] = _ref;
        var valReplaced = replaceTypes(val, atomTransformer);
        if (val !== valReplaced) {
          // Lazy clone. Shallow copy.
          if (ret === document) ret = clone(document);
          ret[key] = valReplaced;
        }
      });
      return ret;
    };
    const replaceMongoAtomWithMeteor = function (document) {
      if (document instanceof MongoDB.Binary) {
        // for backwards compatibility
        if (document.sub_type !== 0) {
          return document;
        }
        var buffer = document.value(true);
        return new Uint8Array(buffer);
      }
      if (document instanceof MongoDB.ObjectId) {
        return new Mongo.ObjectID(document.toHexString());
      }
      if (document instanceof MongoDB.Decimal128) {
        return Decimal(document.toString());
      }
      if (document["EJSON$type"] && document["EJSON$value"] && Object.keys(document).length === 2) {
        return EJSON.fromJSONValue(replaceNames(unmakeMongoLegal, document));
      }
      if (document instanceof MongoDB.Timestamp) {
        // For now, the Meteor representation of a Mongo timestamp type (not a date!
        // this is a weird internal thing used in the oplog!) is the same as the
        // Mongo representation. We need to do this explicitly or else we would do a
        // structural clone and lose the prototype.
        return document;
      }
      return undefined;
    };
    const makeMongoLegal = name => "EJSON" + name;
    const unmakeMongoLegal = name => name.substr(5);
    function replaceNames(filter, thing) {
      if (typeof thing === "object" && thing !== null) {
        if (Array.isArray(thing)) {
          return thing.map(replaceNames.bind(null, filter));
        }
        var ret = {};
        Object.entries(thing).forEach(function (_ref2) {
          let [key, value] = _ref2;
          ret[filter(key)] = replaceNames(filter, value);
        });
        return ret;
      }
      return thing;
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

},"asynchronous_cursor.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/asynchronous_cursor.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      AsynchronousCursor: () => AsynchronousCursor
    });
    let LocalCollection;
    module.link("meteor/minimongo/local_collection", {
      default(v) {
        LocalCollection = v;
      }
    }, 0);
    let replaceMongoAtomWithMeteor, replaceTypes;
    module.link("./mongo_common", {
      replaceMongoAtomWithMeteor(v) {
        replaceMongoAtomWithMeteor = v;
      },
      replaceTypes(v) {
        replaceTypes = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class AsynchronousCursor {
      constructor(dbCursor, cursorDescription, options) {
        this._dbCursor = dbCursor;
        this._cursorDescription = cursorDescription;
        this._selfForIteration = options.selfForIteration || this;
        if (options.useTransform && cursorDescription.options.transform) {
          this._transform = LocalCollection.wrapTransform(cursorDescription.options.transform);
        } else {
          this._transform = null;
        }
        this._visitedIds = new LocalCollection._IdMap();
      }
      [Symbol.asyncIterator]() {
        var cursor = this;
        return {
          async next() {
            const value = await cursor._nextObjectPromise();
            return {
              done: !value,
              value
            };
          }
        };
      }

      // Returns a Promise for the next object from the underlying cursor (before
      // the Mongo->Meteor type replacement).
      async _rawNextObjectPromise() {
        try {
          return this._dbCursor.next();
        } catch (e) {
          console.error(e);
        }
      }

      // Returns a Promise for the next object from the cursor, skipping those whose
      // IDs we've already seen and replacing Mongo atoms with Meteor atoms.
      async _nextObjectPromise() {
        while (true) {
          var doc = await this._rawNextObjectPromise();
          if (!doc) return null;
          doc = replaceTypes(doc, replaceMongoAtomWithMeteor);
          if (!this._cursorDescription.options.tailable && '_id' in doc) {
            // Did Mongo give us duplicate documents in the same cursor? If so,
            // ignore this one. (Do this before the transform, since transform might
            // return some unrelated value.) We don't do this for tailable cursors,
            // because we want to maintain O(1) memory usage. And if there isn't _id
            // for some reason (maybe it's the oplog), then we don't do this either.
            // (Be careful to do this for falsey but existing _id, though.)
            if (this._visitedIds.has(doc._id)) continue;
            this._visitedIds.set(doc._id, true);
          }
          if (this._transform) doc = this._transform(doc);
          return doc;
        }
      }

      // Returns a promise which is resolved with the next object (like with
      // _nextObjectPromise) or rejected if the cursor doesn't return within
      // timeoutMS ms.
      _nextObjectPromiseWithTimeout(timeoutMS) {
        if (!timeoutMS) {
          return this._nextObjectPromise();
        }
        const nextObjectPromise = this._nextObjectPromise();
        const timeoutErr = new Error('Client-side timeout waiting for next object');
        const timeoutPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(timeoutErr);
          }, timeoutMS);
        });
        return Promise.race([nextObjectPromise, timeoutPromise]).catch(err => {
          if (err === timeoutErr) {
            this.close();
            return;
          }
          throw err;
        });
      }
      async forEach(callback, thisArg) {
        // Get back to the beginning.
        this._rewind();
        let idx = 0;
        while (true) {
          const doc = await this._nextObjectPromise();
          if (!doc) return;
          await callback.call(thisArg, doc, idx++, this._selfForIteration);
        }
      }
      async map(callback, thisArg) {
        const results = [];
        await this.forEach(async (doc, index) => {
          results.push(await callback.call(thisArg, doc, index, this._selfForIteration));
        });
        return results;
      }
      _rewind() {
        // known to be synchronous
        this._dbCursor.rewind();
        this._visitedIds = new LocalCollection._IdMap();
      }

      // Mostly usable for tailable cursors.
      close() {
        this._dbCursor.close();
      }
      fetch() {
        return this.map(doc => doc);
      }

      /**
       * FIXME: (node:34680) [MONGODB DRIVER] Warning: cursor.count is deprecated and will be
       *  removed in the next major version, please use `collection.estimatedDocumentCount` or
       *  `collection.countDocuments` instead.
       */
      count() {
        return this._dbCursor.count();
      }

      // This method is NOT wrapped in Cursor.
      async getRawObjects(ordered) {
        var self = this;
        if (ordered) {
          return self.fetch();
        } else {
          var results = new LocalCollection._IdMap();
          await self.forEach(function (doc) {
            results.set(doc._id, doc);
          });
          return results;
        }
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

},"cursor.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/cursor.ts                                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      Cursor: () => Cursor
    });
    let ASYNC_CURSOR_METHODS, getAsyncMethodName;
    module.link("meteor/minimongo/constants", {
      ASYNC_CURSOR_METHODS(v) {
        ASYNC_CURSOR_METHODS = v;
      },
      getAsyncMethodName(v) {
        getAsyncMethodName = v;
      }
    }, 0);
    let replaceMeteorAtomWithMongo, replaceTypes;
    module.link("./mongo_common", {
      replaceMeteorAtomWithMongo(v) {
        replaceMeteorAtomWithMongo = v;
      },
      replaceTypes(v) {
        replaceTypes = v;
      }
    }, 1);
    let LocalCollection;
    module.link("meteor/minimongo/local_collection", {
      default(v) {
        LocalCollection = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class Cursor {
      constructor(mongo, cursorDescription) {
        this._mongo = void 0;
        this._cursorDescription = void 0;
        this._synchronousCursor = void 0;
        this._mongo = mongo;
        this._cursorDescription = cursorDescription;
        this._synchronousCursor = null;
      }
      async countAsync() {
        const collection = this._mongo.rawCollection(this._cursorDescription.collectionName);
        return await collection.countDocuments(replaceTypes(this._cursorDescription.selector, replaceMeteorAtomWithMongo), replaceTypes(this._cursorDescription.options, replaceMeteorAtomWithMongo));
      }
      count() {
        throw new Error("count() is not available on the server. Please use countAsync() instead.");
      }
      getTransform() {
        return this._cursorDescription.options.transform;
      }
      _publishCursor(sub) {
        const collection = this._cursorDescription.collectionName;
        return Mongo.Collection._publishCursor(this, sub, collection);
      }
      _getCollectionName() {
        return this._cursorDescription.collectionName;
      }
      observe(callbacks) {
        return LocalCollection._observeFromObserveChanges(this, callbacks);
      }
      async observeAsync(callbacks) {
        return new Promise(resolve => resolve(this.observe(callbacks)));
      }
      observeChanges(callbacks) {
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        const ordered = LocalCollection._observeChangesCallbacksAreOrdered(callbacks);
        return this._mongo._observeChanges(this._cursorDescription, ordered, callbacks, options.nonMutatingCallbacks);
      }
      async observeChangesAsync(callbacks) {
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return this.observeChanges(callbacks, options);
      }
    }
    // Add cursor methods dynamically
    [...ASYNC_CURSOR_METHODS, Symbol.iterator, Symbol.asyncIterator].forEach(methodName => {
      if (methodName === 'count') return;
      Cursor.prototype[methodName] = function () {
        const cursor = setupAsynchronousCursor(this, methodName);
        return cursor[methodName](...arguments);
      };
      if (methodName === Symbol.iterator || methodName === Symbol.asyncIterator) return;
      const methodNameAsync = getAsyncMethodName(methodName);
      Cursor.prototype[methodNameAsync] = function () {
        return this[methodName](...arguments);
      };
    });
    function setupAsynchronousCursor(cursor, method) {
      if (cursor._cursorDescription.options.tailable) {
        throw new Error("Cannot call ".concat(String(method), " on a tailable cursor"));
      }
      if (!cursor._synchronousCursor) {
        cursor._synchronousCursor = cursor._mongo._createAsynchronousCursor(cursor._cursorDescription, {
          selfForIteration: cursor,
          useTransform: true
        });
      }
      return cursor._synchronousCursor;
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

},"local_collection_driver.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/local_collection_driver.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  LocalCollectionDriver: () => LocalCollectionDriver
});
const LocalCollectionDriver = new class LocalCollectionDriver {
  constructor() {
    this.noConnCollections = Object.create(null);
  }
  open(name, conn) {
    if (!name) {
      return new LocalCollection();
    }
    if (!conn) {
      return ensureCollection(name, this.noConnCollections);
    }
    if (!conn._mongo_livedata_collections) {
      conn._mongo_livedata_collections = Object.create(null);
    }

    // XXX is there a way to keep track of a connection's collections without
    // dangling it off the connection object?
    return ensureCollection(name, conn._mongo_livedata_collections);
  }
}();
function ensureCollection(name, collections) {
  return name in collections ? collections[name] : collections[name] = new LocalCollection(name);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"remote_collection_driver.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/remote_collection_driver.ts                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      RemoteCollectionDriver: () => RemoteCollectionDriver
    });
    let once;
    module.link("lodash.once", {
      default(v) {
        once = v;
      }
    }, 0);
    let ASYNC_COLLECTION_METHODS, getAsyncMethodName, CLIENT_ONLY_METHODS;
    module.link("meteor/minimongo/constants", {
      ASYNC_COLLECTION_METHODS(v) {
        ASYNC_COLLECTION_METHODS = v;
      },
      getAsyncMethodName(v) {
        getAsyncMethodName = v;
      },
      CLIENT_ONLY_METHODS(v) {
        CLIENT_ONLY_METHODS = v;
      }
    }, 1);
    let MongoConnection;
    module.link("./mongo_connection", {
      MongoConnection(v) {
        MongoConnection = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class RemoteCollectionDriver {
      constructor(mongoUrl, options) {
        this.mongo = void 0;
        this.mongo = new MongoConnection(mongoUrl, options);
      }
      open(name) {
        const ret = {};
        // Handle remote collection methods
        RemoteCollectionDriver.REMOTE_COLLECTION_METHODS.forEach(method => {
          // Type assertion needed because we know these methods exist on MongoConnection
          const mongoMethod = this.mongo[method];
          ret[method] = mongoMethod.bind(this.mongo, name);
          if (!ASYNC_COLLECTION_METHODS.includes(method)) return;
          const asyncMethodName = getAsyncMethodName(method);
          ret[asyncMethodName] = function () {
            return ret[method](...arguments);
          };
        });
        // Handle client-only methods
        CLIENT_ONLY_METHODS.forEach(method => {
          ret[method] = function () {
            throw new Error("".concat(method, " is not available on the server. Please use ").concat(getAsyncMethodName(method), "() instead."));
          };
        });
        return ret;
      }
    }
    // Assign the class to MongoInternals
    RemoteCollectionDriver.REMOTE_COLLECTION_METHODS = ['createCappedCollectionAsync', 'dropIndexAsync', 'ensureIndexAsync', 'createIndexAsync', 'countDocuments', 'dropCollectionAsync', 'estimatedDocumentCount', 'find', 'findOneAsync', 'insertAsync', 'rawCollection', 'removeAsync', 'updateAsync', 'upsertAsync'];
    MongoInternals.RemoteCollectionDriver = RemoteCollectionDriver;
    // Create the singleton RemoteCollectionDriver only on demand
    MongoInternals.defaultRemoteCollectionDriver = once(() => {
      const connectionOptions = {};
      const mongoUrl = process.env.MONGO_URL;
      if (!mongoUrl) {
        throw new Error("MONGO_URL must be set in environment");
      }
      if (process.env.MONGO_OPLOG_URL) {
        connectionOptions.oplogUrl = process.env.MONGO_OPLOG_URL;
      }
      const driver = new RemoteCollectionDriver(mongoUrl, connectionOptions);
      // Initialize database connection on startup
      Meteor.startup(async () => {
        await driver.mongo.client.connect();
      });
      return driver;
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

},"collection":{"collection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/collection.js                                                                             //
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
    let normalizeProjection;
    module1.link("../mongo_utils", {
      normalizeProjection(v) {
        normalizeProjection = v;
      }
    }, 0);
    let AsyncMethods;
    module1.link("./methods_async", {
      AsyncMethods(v) {
        AsyncMethods = v;
      }
    }, 1);
    let SyncMethods;
    module1.link("./methods_sync", {
      SyncMethods(v) {
        SyncMethods = v;
      }
    }, 2);
    let IndexMethods;
    module1.link("./methods_index", {
      IndexMethods(v) {
        IndexMethods = v;
      }
    }, 3);
    let ID_GENERATORS, normalizeOptions, setupAutopublish, setupConnection, setupDriver, setupMutationMethods, validateCollectionName;
    module1.link("./collection_utils", {
      ID_GENERATORS(v) {
        ID_GENERATORS = v;
      },
      normalizeOptions(v) {
        normalizeOptions = v;
      },
      setupAutopublish(v) {
        setupAutopublish = v;
      },
      setupConnection(v) {
        setupConnection = v;
      },
      setupDriver(v) {
        setupDriver = v;
      },
      setupMutationMethods(v) {
        setupMutationMethods = v;
      },
      validateCollectionName(v) {
        validateCollectionName = v;
      }
    }, 4);
    let ReplicationMethods;
    module1.link("./methods_replication", {
      ReplicationMethods(v) {
        ReplicationMethods = v;
      }
    }, 5);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    /**
     * @summary Namespace for MongoDB-related items
     * @namespace
     */
    Mongo = {};

    /**
     * @summary Constructor for a Collection
     * @locus Anywhere
     * @instancename collection
     * @class
     * @param {String} name The name of the collection.  If null, creates an unmanaged (unsynchronized) local collection.
     * @param {Object} [options]
     * @param {Object} options.connection The server connection that will manage this collection. Uses the default connection if not specified.  Pass the return value of calling [`DDP.connect`](#DDP-connect) to specify a different server. Pass `null` to specify no connection. Unmanaged (`name` is null) collections cannot specify a connection.
     * @param {String} options.idGeneration The method of generating the `_id` fields of new documents in this collection.  Possible values:
    
     - **`'STRING'`**: random strings
     - **`'MONGO'`**:  random [`Mongo.ObjectID`](#mongo_object_id) values
    
    The default id generation technique is `'STRING'`.
     * @param {Function} options.transform An optional transformation function. Documents will be passed through this function before being returned from `fetch` or `findOneAsync`, and before being passed to callbacks of `observe`, `map`, `forEach`, `allow`, and `deny`. Transforms are *not* applied for the callbacks of `observeChanges` or to cursors returned from publish functions.
     * @param {Boolean} options.defineMutationMethods Set to `false` to skip setting up the mutation methods that enable insert/update/remove from client code. Default `true`.
     */
    // Main Collection constructor
    Mongo.Collection = function Collection(name, options) {
      var _ID_GENERATORS$option, _ID_GENERATORS;
      name = validateCollectionName(name);
      options = normalizeOptions(options);
      this._makeNewID = (_ID_GENERATORS$option = (_ID_GENERATORS = ID_GENERATORS)[options.idGeneration]) === null || _ID_GENERATORS$option === void 0 ? void 0 : _ID_GENERATORS$option.call(_ID_GENERATORS, name);
      this._transform = LocalCollection.wrapTransform(options.transform);
      this.resolverType = options.resolverType;
      this._connection = setupConnection(name, options);
      const driver = setupDriver(name, this._connection, options);
      this._driver = driver;
      this._collection = driver.open(name, this._connection);
      this._name = name;
      this._settingUpReplicationPromise = this._maybeSetUpReplication(name, options);
      setupMutationMethods(this, name, options);
      setupAutopublish(this, name, options);
      Mongo._collections.set(name, this);
    };
    Object.assign(Mongo.Collection.prototype, {
      _getFindSelector(args) {
        if (args.length == 0) return {};else return args[0];
      },
      _getFindOptions(args) {
        const [, options] = args || [];
        const newOptions = normalizeProjection(options);
        var self = this;
        if (args.length < 2) {
          return {
            transform: self._transform
          };
        } else {
          check(newOptions, Match.Optional(Match.ObjectIncluding({
            projection: Match.Optional(Match.OneOf(Object, undefined)),
            sort: Match.Optional(Match.OneOf(Object, Array, Function, undefined)),
            limit: Match.Optional(Match.OneOf(Number, undefined)),
            skip: Match.Optional(Match.OneOf(Number, undefined))
          })));
          return _objectSpread({
            transform: self._transform
          }, newOptions);
        }
      }
    });
    Object.assign(Mongo.Collection, {
      async _publishCursor(cursor, sub, collection) {
        var observeHandle = await cursor.observeChanges({
          added: function (id, fields) {
            sub.added(collection, id, fields);
          },
          changed: function (id, fields) {
            sub.changed(collection, id, fields);
          },
          removed: function (id) {
            sub.removed(collection, id);
          }
        },
        // Publications don't mutate the documents
        // This is tested by the `livedata - publish callbacks clone` test
        {
          nonMutatingCallbacks: true
        });

        // We don't call sub.ready() here: it gets called in livedata_server, after
        // possibly calling _publishCursor on multiple returned cursors.

        // register stop callback (expects lambda w/ no args).
        sub.onStop(async function () {
          return await observeHandle.stop();
        });

        // return the observeHandle in case it needs to be stopped early
        return observeHandle;
      },
      // protect against dangerous selectors.  falsey and {_id: falsey} are both
      // likely programmer error, and not what you want, particularly for destructive
      // operations. If a falsey _id is sent in, a new string _id will be
      // generated and returned; if a fallbackId is provided, it will be returned
      // instead.
      _rewriteSelector(selector) {
        let {
          fallbackId
        } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        // shorthand -- scalars match _id
        if (LocalCollection._selectorIsId(selector)) selector = {
          _id: selector
        };
        if (Array.isArray(selector)) {
          // This is consistent with the Mongo console itself; if we don't do this
          // check passing an empty array ends up selecting all items
          throw new Error("Mongo selector can't be an array.");
        }
        if (!selector || '_id' in selector && !selector._id) {
          // can't match anything
          return {
            _id: fallbackId || Random.id()
          };
        }
        return selector;
      }
    });
    Object.assign(Mongo.Collection.prototype, ReplicationMethods, SyncMethods, AsyncMethods, IndexMethods);
    Object.assign(Mongo.Collection.prototype, {
      // Determine if this collection is simply a minimongo representation of a real
      // database on another server
      _isRemoteCollection() {
        // XXX see #MeteorServerNull
        return this._connection && this._connection !== Meteor.server;
      },
      async dropCollectionAsync() {
        var self = this;
        if (!self._collection.dropCollectionAsync) throw new Error('Can only call dropCollectionAsync on server collections');
        await self._collection.dropCollectionAsync();
      },
      async createCappedCollectionAsync(byteSize, maxDocuments) {
        var self = this;
        if (!(await self._collection.createCappedCollectionAsync)) throw new Error('Can only call createCappedCollectionAsync on server collections');
        await self._collection.createCappedCollectionAsync(byteSize, maxDocuments);
      },
      /**
       * @summary Returns the [`Collection`](http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html) object corresponding to this collection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
       * @locus Server
       * @memberof Mongo.Collection
       * @instance
       */
      rawCollection() {
        var self = this;
        if (!self._collection.rawCollection) {
          throw new Error('Can only call rawCollection on server collections');
        }
        return self._collection.rawCollection();
      },
      /**
       * @summary Returns the [`Db`](http://mongodb.github.io/node-mongodb-native/3.0/api/Db.html) object corresponding to this collection's database connection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
       * @locus Server
       * @memberof Mongo.Collection
       * @instance
       */
      rawDatabase() {
        var self = this;
        if (!(self._driver.mongo && self._driver.mongo.db)) {
          throw new Error('Can only call rawDatabase on server collections');
        }
        return self._driver.mongo.db;
      }
    });
    Object.assign(Mongo, {
      /**
       * @summary Retrieve a Meteor collection instance by name. Only collections defined with [`new Mongo.Collection(...)`](#collections) are available with this method. For plain MongoDB collections, you'll want to look at [`rawDatabase()`](#Mongo-Collection-rawDatabase).
       * @locus Anywhere
       * @memberof Mongo
       * @static
       * @param {string} name Name of your collection as it was defined with `new Mongo.Collection()`.
       * @returns {Mongo.Collection | undefined}
       */
      getCollection(name) {
        return this._collections.get(name);
      },
      /**
       * @summary A record of all defined Mongo.Collection instances, indexed by collection name.
       * @type {Map<string, Mongo.Collection>}
       * @memberof Mongo
       * @protected
       */
      _collections: new Map()
    });

    /**
     * @summary Create a Mongo-style `ObjectID`.  If you don't specify a `hexString`, the `ObjectID` will be generated randomly (not using MongoDB's ID construction rules).
     * @locus Anywhere
     * @class
     * @param {String} [hexString] Optional.  The 24-character hexadecimal contents of the ObjectID to create
     */
    Mongo.ObjectID = MongoID.ObjectID;

    /**
     * @summary To create a cursor, use find. To access the documents in a cursor, use forEach, map, or fetch.
     * @class
     * @instanceName cursor
     */
    Mongo.Cursor = LocalCollection.Cursor;

    /**
     * @deprecated in 0.9.1
     */
    Mongo.Collection.Cursor = Mongo.Cursor;

    /**
     * @deprecated in 0.9.1
     */
    Mongo.Collection.ObjectID = Mongo.ObjectID;

    /**
     * @deprecated in 0.9.1
     */
    Meteor.Collection = Mongo.Collection;

    // Allow deny stuff is now in the allow-deny package
    Object.assign(Mongo.Collection.prototype, AllowDeny.CollectionPrototype);
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

},"collection_utils.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/collection_utils.js                                                                       //
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
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    module.export({
      ID_GENERATORS: () => ID_GENERATORS,
      setupConnection: () => setupConnection,
      setupDriver: () => setupDriver,
      setupAutopublish: () => setupAutopublish,
      setupMutationMethods: () => setupMutationMethods,
      validateCollectionName: () => validateCollectionName,
      normalizeOptions: () => normalizeOptions
    });
    const ID_GENERATORS = {
      MONGO(name) {
        return function () {
          const src = name ? DDP.randomStream('/collection/' + name) : Random.insecure;
          return new Mongo.ObjectID(src.hexString(24));
        };
      },
      STRING(name) {
        return function () {
          const src = name ? DDP.randomStream('/collection/' + name) : Random.insecure;
          return src.id();
        };
      }
    };
    function setupConnection(name, options) {
      if (!name || options.connection === null) return null;
      if (options.connection) return options.connection;
      return Meteor.isClient ? Meteor.connection : Meteor.server;
    }
    function setupDriver(name, connection, options) {
      if (options._driver) return options._driver;
      if (name && connection === Meteor.server && typeof MongoInternals !== 'undefined' && MongoInternals.defaultRemoteCollectionDriver) {
        return MongoInternals.defaultRemoteCollectionDriver();
      }
      const {
        LocalCollectionDriver
      } = require('../local_collection_driver.js');
      return LocalCollectionDriver;
    }
    function setupAutopublish(collection, name, options) {
      if (Package.autopublish && !options._preventAutopublish && collection._connection && collection._connection.publish) {
        collection._connection.publish(null, () => collection.find(), {
          is_auto: true
        });
      }
    }
    function setupMutationMethods(collection, name, options) {
      if (options.defineMutationMethods === false) return;
      try {
        collection._defineMutationMethods({
          useExisting: options._suppressSameNameError === true
        });
      } catch (error) {
        if (error.message === "A method named '/".concat(name, "/insertAsync' is already defined")) {
          throw new Error("There is already a collection named \"".concat(name, "\""));
        }
        throw error;
      }
    }
    function validateCollectionName(name) {
      if (!name && name !== null) {
        Meteor._debug('Warning: creating anonymous collection. It will not be ' + 'saved or synchronized over the network. (Pass null for ' + 'the collection name to turn off this warning.)');
        name = null;
      }
      if (name !== null && typeof name !== 'string') {
        throw new Error('First argument to new Mongo.Collection must be a string or null');
      }
      return name;
    }
    function normalizeOptions(options) {
      if (options && options.methods) {
        // Backwards compatibility hack with original signature
        options = {
          connection: options
        };
      }
      // Backwards compatibility: "connection" used to be called "manager".
      if (options && options.manager && !options.connection) {
        options.connection = options.manager;
      }
      return _objectSpread({
        connection: undefined,
        idGeneration: 'STRING',
        transform: null,
        _driver: undefined,
        _preventAutopublish: false
      }, options);
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

},"methods_async.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_async.js                                                                          //
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
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    module.export({
      AsyncMethods: () => AsyncMethods
    });
    const AsyncMethods = {
      /**
       * @summary Finds the first document that matches the selector, as ordered by sort and skip options. Returns `undefined` if no matching document is found.
       * @locus Anywhere
       * @method findOneAsync
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} [selector] A query describing the documents to find
       * @param {Object} [options]
       * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
       * @param {Number} options.skip Number of results to skip at the beginning
       * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
       * @param {Boolean} options.reactive (Client only) Default true; pass false to disable reactivity
       * @param {Function} options.transform Overrides `transform` on the [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
       * @param {String} options.readPreference (Server only) Specifies a custom MongoDB [`readPreference`](https://docs.mongodb.com/manual/core/read-preference) for fetching the document. Possible values are `primary`, `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`.
       * @returns {Object}
       */
      findOneAsync() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return this._collection.findOneAsync(this._getFindSelector(args), this._getFindOptions(args));
      },
      _insertAsync(doc) {
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        // Make sure we were passed a document to insert
        if (!doc) {
          throw new Error('insert requires an argument');
        }

        // Make a shallow clone of the document, preserving its prototype.
        doc = Object.create(Object.getPrototypeOf(doc), Object.getOwnPropertyDescriptors(doc));
        if ('_id' in doc) {
          if (!doc._id || !(typeof doc._id === 'string' || doc._id instanceof Mongo.ObjectID)) {
            throw new Error('Meteor requires document _id fields to be non-empty strings or ObjectIDs');
          }
        } else {
          let generateId = true;

          // Don't generate the id if we're the client and the 'outermost' call
          // This optimization saves us passing both the randomSeed and the id
          // Passing both is redundant.
          if (this._isRemoteCollection()) {
            const enclosing = DDP._CurrentMethodInvocation.get();
            if (!enclosing) {
              generateId = false;
            }
          }
          if (generateId) {
            doc._id = this._makeNewID();
          }
        }

        // On inserts, always return the id that we generated; on all other
        // operations, just return the result from the collection.
        var chooseReturnValueFromCollectionResult = function (result) {
          if (Meteor._isPromise(result)) return result;
          if (doc._id) {
            return doc._id;
          }

          // XXX what is this for??
          // It's some iteraction between the callback to _callMutatorMethod and
          // the return value conversion
          doc._id = result;
          return result;
        };
        if (this._isRemoteCollection()) {
          const promise = this._callMutatorMethodAsync('insertAsync', [doc], options);
          promise.then(chooseReturnValueFromCollectionResult);
          promise.stubPromise = promise.stubPromise.then(chooseReturnValueFromCollectionResult);
          promise.serverPromise = promise.serverPromise.then(chooseReturnValueFromCollectionResult);
          return promise;
        }

        // it's my collection.  descend into the collection object
        // and propagate any exception.
        return this._collection.insertAsync(doc).then(chooseReturnValueFromCollectionResult);
      },
      /**
       * @summary Insert a document in the collection.  Returns a promise that will return the document's unique _id when solved.
       * @locus Anywhere
       * @method  insert
       * @memberof Mongo.Collection
       * @instance
       * @param {Object} doc The document to insert. May not yet have an _id attribute, in which case Meteor will generate one for you.
       */
      insertAsync(doc, options) {
        return this._insertAsync(doc, options);
      },
      /**
       * @summary Modify one or more documents in the collection. Returns the number of matched documents.
       * @locus Anywhere
       * @method update
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to modify
       * @param {MongoModifier} modifier Specifies how to modify the documents
       * @param {Object} [options]
       * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
       * @param {Boolean} options.upsert True to insert a document if no matching documents are found.
       * @param {Array} options.arrayFilters Optional. Used in combination with MongoDB [filtered positional operator](https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/) to specify which elements to modify in an array field.
       */
      updateAsync(selector, modifier) {
        // We've already popped off the callback, so we are left with an array
        // of one or zero items
        const options = _objectSpread({}, (arguments.length <= 2 ? undefined : arguments[2]) || null);
        let insertedId;
        if (options && options.upsert) {
          // set `insertedId` if absent.  `insertedId` is a Meteor extension.
          if (options.insertedId) {
            if (!(typeof options.insertedId === 'string' || options.insertedId instanceof Mongo.ObjectID)) throw new Error('insertedId must be string or ObjectID');
            insertedId = options.insertedId;
          } else if (!selector || !selector._id) {
            insertedId = this._makeNewID();
            options.generatedId = true;
            options.insertedId = insertedId;
          }
        }
        selector = Mongo.Collection._rewriteSelector(selector, {
          fallbackId: insertedId
        });
        if (this._isRemoteCollection()) {
          const args = [selector, modifier, options];
          return this._callMutatorMethodAsync('updateAsync', args, options);
        }

        // it's my collection.  descend into the collection object
        // and propagate any exception.
        // If the user provided a callback and the collection implements this
        // operation asynchronously, then queryRet will be undefined, and the
        // result will be returned through the callback instead.

        return this._collection.updateAsync(selector, modifier, options);
      },
      /**
       * @summary Asynchronously removes documents from the collection.
       * @locus Anywhere
       * @method remove
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to remove
       */
      removeAsync(selector) {
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        selector = Mongo.Collection._rewriteSelector(selector);
        if (this._isRemoteCollection()) {
          return this._callMutatorMethodAsync('removeAsync', [selector], options);
        }

        // it's my collection.  descend into the collection1 object
        // and propagate any exception.
        return this._collection.removeAsync(selector);
      },
      /**
       * @summary Asynchronously modifies one or more documents in the collection, or insert one if no matching documents were found. Returns an object with keys `numberAffected` (the number of documents modified)  and `insertedId` (the unique _id of the document that was inserted, if any).
       * @locus Anywhere
       * @method upsert
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to modify
       * @param {MongoModifier} modifier Specifies how to modify the documents
       * @param {Object} [options]
       * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
       */
      async upsertAsync(selector, modifier, options) {
        return this.updateAsync(selector, modifier, _objectSpread(_objectSpread({}, options), {}, {
          _returnObject: true,
          upsert: true
        }));
      },
      /**
       * @summary Gets the number of documents matching the filter. For a fast count of the total documents in a collection see `estimatedDocumentCount`.
       * @locus Anywhere
       * @method countDocuments
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} [selector] A query describing the documents to count
       * @param {Object} [options] All options are listed in [MongoDB documentation](https://mongodb.github.io/node-mongodb-native/4.11/interfaces/CountDocumentsOptions.html). Please note that not all of them are available on the client.
       * @returns {Promise<number>}
       */
      countDocuments() {
        return this._collection.countDocuments(...arguments);
      },
      /**
       * @summary Gets an estimate of the count of documents in a collection using collection metadata. For an exact count of the documents in a collection see `countDocuments`.
       * @locus Anywhere
       * @method estimatedDocumentCount
       * @memberof Mongo.Collection
       * @instance
       * @param {Object} [options] All options are listed in [MongoDB documentation](https://mongodb.github.io/node-mongodb-native/4.11/interfaces/EstimatedDocumentCountOptions.html). Please note that not all of them are available on the client.
       * @returns {Promise<number>}
       */
      estimatedDocumentCount() {
        return this._collection.estimatedDocumentCount(...arguments);
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

},"methods_index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_index.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  IndexMethods: () => IndexMethods
});
const IndexMethods = {
  // We'll actually design an index API later. For now, we just pass through to
  // Mongo's, but make it synchronous.
  /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method ensureIndexAsync
   * @deprecated in 3.0
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */
  async ensureIndexAsync(index, options) {
    var self = this;
    if (!self._collection.ensureIndexAsync || !self._collection.createIndexAsync) throw new Error('Can only call createIndexAsync on server collections');
    if (self._collection.createIndexAsync) {
      await self._collection.createIndexAsync(index, options);
    } else {
      let Log;
      module.link("meteor/logging", {
        Log(v) {
          Log = v;
        }
      }, 0);
      Log.debug("ensureIndexAsync has been deprecated, please use the new 'createIndexAsync' instead".concat(options !== null && options !== void 0 && options.name ? ", index name: ".concat(options.name) : ", index: ".concat(JSON.stringify(index))));
      await self._collection.ensureIndexAsync(index, options);
    }
  },
  /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method createIndexAsync
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */
  async createIndexAsync(index, options) {
    var self = this;
    if (!self._collection.createIndexAsync) throw new Error('Can only call createIndexAsync on server collections');
    try {
      await self._collection.createIndexAsync(index, options);
    } catch (e) {
      var _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2;
      if (e.message.includes('An equivalent index already exists with the same name but different options.') && (_Meteor$settings = Meteor.settings) !== null && _Meteor$settings !== void 0 && (_Meteor$settings$pack = _Meteor$settings.packages) !== null && _Meteor$settings$pack !== void 0 && (_Meteor$settings$pack2 = _Meteor$settings$pack.mongo) !== null && _Meteor$settings$pack2 !== void 0 && _Meteor$settings$pack2.reCreateIndexOnOptionMismatch) {
        let Log;
        module.link("meteor/logging", {
          Log(v) {
            Log = v;
          }
        }, 1);
        Log.info("Re-creating index ".concat(index, " for ").concat(self._name, " due to options mismatch."));
        await self._collection.dropIndexAsync(index);
        await self._collection.createIndexAsync(index, options);
      } else {
        console.error(e);
        throw new Meteor.Error("An error occurred when creating an index for collection \"".concat(self._name, ": ").concat(e.message));
      }
    }
  },
  /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method createIndex
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */
  createIndex(index, options) {
    return this.createIndexAsync(index, options);
  },
  async dropIndexAsync(index) {
    var self = this;
    if (!self._collection.dropIndexAsync) throw new Error('Can only call dropIndexAsync on server collections');
    await self._collection.dropIndexAsync(index);
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods_replication.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_replication.js                                                                    //
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
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    module.export({
      ReplicationMethods: () => ReplicationMethods
    });
    const ReplicationMethods = {
      async _maybeSetUpReplication(name) {
        var _registerStoreResult, _registerStoreResult$;
        const self = this;
        if (!(self._connection && self._connection.registerStoreClient && self._connection.registerStoreServer)) {
          return;
        }
        const wrappedStoreCommon = {
          // Called around method stub invocations to capture the original versions
          // of modified documents.
          saveOriginals() {
            self._collection.saveOriginals();
          },
          retrieveOriginals() {
            return self._collection.retrieveOriginals();
          },
          // To be able to get back to the collection from the store.
          _getCollection() {
            return self;
          }
        };
        const wrappedStoreClient = _objectSpread({
          // Called at the beginning of a batch of updates. batchSize is the number
          // of update calls to expect.
          //
          // XXX This interface is pretty janky. reset probably ought to go back to
          // being its own function, and callers shouldn't have to calculate
          // batchSize. The optimization of not calling pause/remove should be
          // delayed until later: the first call to update() should buffer its
          // message, and then we can either directly apply it at endUpdate time if
          // it was the only update, or do pauseObservers/apply/apply at the next
          // update() if there's another one.
          async beginUpdate(batchSize, reset) {
            // pause observers so users don't see flicker when updating several
            // objects at once (including the post-reconnect reset-and-reapply
            // stage), and so that a re-sorting of a query can take advantage of the
            // full _diffQuery moved calculation instead of applying change one at a
            // time.
            if (batchSize > 1 || reset) self._collection.pauseObservers();
            if (reset) await self._collection.remove({});
          },
          // Apply an update.
          // XXX better specify this interface (not in terms of a wire message)?
          update(msg) {
            var mongoId = MongoID.idParse(msg.id);
            var doc = self._collection._docs.get(mongoId);

            //When the server's mergebox is disabled for a collection, the client must gracefully handle it when:
            // *We receive an added message for a document that is already there. Instead, it will be changed
            // *We reeive a change message for a document that is not there. Instead, it will be added
            // *We receive a removed messsage for a document that is not there. Instead, noting wil happen.

            //Code is derived from client-side code originally in peerlibrary:control-mergebox
            //https://github.com/peerlibrary/meteor-control-mergebox/blob/master/client.coffee

            //For more information, refer to discussion "Initial support for publication strategies in livedata server":
            //https://github.com/meteor/meteor/pull/11151
            if (Meteor.isClient) {
              if (msg.msg === 'added' && doc) {
                msg.msg = 'changed';
              } else if (msg.msg === 'removed' && !doc) {
                return;
              } else if (msg.msg === 'changed' && !doc) {
                msg.msg = 'added';
                const _ref = msg.fields;
                for (let field in _ref) {
                  const value = _ref[field];
                  if (value === void 0) {
                    delete msg.fields[field];
                  }
                }
              }
            }
            // Is this a "replace the whole doc" message coming from the quiescence
            // of method writes to an object? (Note that 'undefined' is a valid
            // value meaning "remove it".)
            if (msg.msg === 'replace') {
              var replace = msg.replace;
              if (!replace) {
                if (doc) self._collection.remove(mongoId);
              } else if (!doc) {
                self._collection.insert(replace);
              } else {
                // XXX check that replace has no $ ops
                self._collection.update(mongoId, replace);
              }
              return;
            } else if (msg.msg === 'added') {
              if (doc) {
                throw new Error('Expected not to find a document already present for an add');
              }
              self._collection.insert(_objectSpread({
                _id: mongoId
              }, msg.fields));
            } else if (msg.msg === 'removed') {
              if (!doc) throw new Error('Expected to find a document already present for removed');
              self._collection.remove(mongoId);
            } else if (msg.msg === 'changed') {
              if (!doc) throw new Error('Expected to find a document to change');
              const keys = Object.keys(msg.fields);
              if (keys.length > 0) {
                var modifier = {};
                keys.forEach(key => {
                  const value = msg.fields[key];
                  if (EJSON.equals(doc[key], value)) {
                    return;
                  }
                  if (typeof value === 'undefined') {
                    if (!modifier.$unset) {
                      modifier.$unset = {};
                    }
                    modifier.$unset[key] = 1;
                  } else {
                    if (!modifier.$set) {
                      modifier.$set = {};
                    }
                    modifier.$set[key] = value;
                  }
                });
                if (Object.keys(modifier).length > 0) {
                  self._collection.update(mongoId, modifier);
                }
              }
            } else {
              throw new Error("I don't know how to deal with this message");
            }
          },
          // Called at the end of a batch of updates.livedata_connection.js:1287
          endUpdate() {
            self._collection.resumeObserversClient();
          },
          // Used to preserve current versions of documents across a store reset.
          getDoc(id) {
            return self.findOne(id);
          }
        }, wrappedStoreCommon);
        const wrappedStoreServer = _objectSpread({
          async beginUpdate(batchSize, reset) {
            if (batchSize > 1 || reset) self._collection.pauseObservers();
            if (reset) await self._collection.removeAsync({});
          },
          async update(msg) {
            var mongoId = MongoID.idParse(msg.id);
            var doc = self._collection._docs.get(mongoId);

            // Is this a "replace the whole doc" message coming from the quiescence
            // of method writes to an object? (Note that 'undefined' is a valid
            // value meaning "remove it".)
            if (msg.msg === 'replace') {
              var replace = msg.replace;
              if (!replace) {
                if (doc) await self._collection.removeAsync(mongoId);
              } else if (!doc) {
                await self._collection.insertAsync(replace);
              } else {
                // XXX check that replace has no $ ops
                await self._collection.updateAsync(mongoId, replace);
              }
              return;
            } else if (msg.msg === 'added') {
              if (doc) {
                throw new Error('Expected not to find a document already present for an add');
              }
              await self._collection.insertAsync(_objectSpread({
                _id: mongoId
              }, msg.fields));
            } else if (msg.msg === 'removed') {
              if (!doc) throw new Error('Expected to find a document already present for removed');
              await self._collection.removeAsync(mongoId);
            } else if (msg.msg === 'changed') {
              if (!doc) throw new Error('Expected to find a document to change');
              const keys = Object.keys(msg.fields);
              if (keys.length > 0) {
                var modifier = {};
                keys.forEach(key => {
                  const value = msg.fields[key];
                  if (EJSON.equals(doc[key], value)) {
                    return;
                  }
                  if (typeof value === 'undefined') {
                    if (!modifier.$unset) {
                      modifier.$unset = {};
                    }
                    modifier.$unset[key] = 1;
                  } else {
                    if (!modifier.$set) {
                      modifier.$set = {};
                    }
                    modifier.$set[key] = value;
                  }
                });
                if (Object.keys(modifier).length > 0) {
                  await self._collection.updateAsync(mongoId, modifier);
                }
              }
            } else {
              throw new Error("I don't know how to deal with this message");
            }
          },
          // Called at the end of a batch of updates.
          async endUpdate() {
            await self._collection.resumeObserversServer();
          },
          // Used to preserve current versions of documents across a store reset.
          async getDoc(id) {
            return self.findOneAsync(id);
          }
        }, wrappedStoreCommon);

        // OK, we're going to be a slave, replicating some remote
        // database, except possibly with some temporary divergence while
        // we have unacknowledged RPC's.
        let registerStoreResult;
        if (Meteor.isClient) {
          registerStoreResult = self._connection.registerStoreClient(name, wrappedStoreClient);
        } else {
          registerStoreResult = self._connection.registerStoreServer(name, wrappedStoreServer);
        }
        const message = "There is already a collection named \"".concat(name, "\"");
        const logWarn = () => {
          console.warn ? console.warn(message) : console.log(message);
        };
        if (!registerStoreResult) {
          return logWarn();
        }
        return (_registerStoreResult = registerStoreResult) === null || _registerStoreResult === void 0 ? void 0 : (_registerStoreResult$ = _registerStoreResult.then) === null || _registerStoreResult$ === void 0 ? void 0 : _registerStoreResult$.call(_registerStoreResult, ok => {
          if (!ok) {
            logWarn();
          }
        });
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

},"methods_sync.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_sync.js                                                                           //
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
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    module.export({
      SyncMethods: () => SyncMethods
    });
    const SyncMethods = {
      /**
       * @summary Find the documents in a collection that match the selector.
       * @locus Anywhere
       * @method find
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} [selector] A query describing the documents to find
       * @param {Object} [options]
       * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
       * @param {Number} options.skip Number of results to skip at the beginning
       * @param {Number} options.limit Maximum number of results to return
       * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
       * @param {Boolean} options.reactive (Client only) Default `true`; pass `false` to disable reactivity
       * @param {Function} options.transform Overrides `transform` on the  [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
       * @param {Boolean} options.disableOplog (Server only) Pass true to disable oplog-tailing on this query. This affects the way server processes calls to `observe` on this query. Disabling the oplog can be useful when working with data that updates in large batches.
       * @param {Number} options.pollingIntervalMs (Server only) When oplog is disabled (through the use of `disableOplog` or when otherwise not available), the frequency (in milliseconds) of how often to poll this query when observing on the server. Defaults to 10000ms (10 seconds).
       * @param {Number} options.pollingThrottleMs (Server only) When oplog is disabled (through the use of `disableOplog` or when otherwise not available), the minimum time (in milliseconds) to allow between re-polling when observing on the server. Increasing this will save CPU and mongo load at the expense of slower updates to users. Decreasing this is not recommended. Defaults to 50ms.
       * @param {Number} options.maxTimeMs (Server only) If set, instructs MongoDB to set a time limit for this cursor's operations. If the operation reaches the specified time limit (in milliseconds) without the having been completed, an exception will be thrown. Useful to prevent an (accidental or malicious) unoptimized query from causing a full collection scan that would disrupt other database users, at the expense of needing to handle the resulting error.
       * @param {String|Object} options.hint (Server only) Overrides MongoDB's default index selection and query optimization process. Specify an index to force its use, either by its name or index specification. You can also specify `{ $natural : 1 }` to force a forwards collection scan, or `{ $natural : -1 }` for a reverse collection scan. Setting this is only recommended for advanced users.
       * @param {String} options.readPreference (Server only) Specifies a custom MongoDB [`readPreference`](https://docs.mongodb.com/manual/core/read-preference) for this particular cursor. Possible values are `primary`, `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`.
       * @returns {Mongo.Cursor}
       */
      find() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        // Collection.find() (return all docs) behaves differently
        // from Collection.find(undefined) (return 0 docs).  so be
        // careful about the length of arguments.
        return this._collection.find(this._getFindSelector(args), this._getFindOptions(args));
      },
      /**
       * @summary Finds the first document that matches the selector, as ordered by sort and skip options. Returns `undefined` if no matching document is found.
       * @locus Anywhere
       * @method findOne
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} [selector] A query describing the documents to find
       * @param {Object} [options]
       * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
       * @param {Number} options.skip Number of results to skip at the beginning
       * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
       * @param {Boolean} options.reactive (Client only) Default true; pass false to disable reactivity
       * @param {Function} options.transform Overrides `transform` on the [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
       * @param {String} options.readPreference (Server only) Specifies a custom MongoDB [`readPreference`](https://docs.mongodb.com/manual/core/read-preference) for fetching the document. Possible values are `primary`, `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`.
       * @returns {Object}
       */
      findOne() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        return this._collection.findOne(this._getFindSelector(args), this._getFindOptions(args));
      },
      // 'insert' immediately returns the inserted document's new _id.
      // The others return values immediately if you are in a stub, an in-memory
      // unmanaged collection, or a mongo-backed collection and you don't pass a
      // callback. 'update' and 'remove' return the number of affected
      // documents. 'upsert' returns an object with keys 'numberAffected' and, if an
      // insert happened, 'insertedId'.
      //
      // Otherwise, the semantics are exactly like other methods: they take
      // a callback as an optional last argument; if no callback is
      // provided, they block until the operation is complete, and throw an
      // exception if it fails; if a callback is provided, then they don't
      // necessarily block, and they call the callback when they finish with error and
      // result arguments.  (The insert method provides the document ID as its result;
      // update and remove provide the number of affected docs as the result; upsert
      // provides an object with numberAffected and maybe insertedId.)
      //
      // On the client, blocking is impossible, so if a callback
      // isn't provided, they just return immediately and any error
      // information is lost.
      //
      // There's one more tweak. On the client, if you don't provide a
      // callback, then if there is an error, a message will be logged with
      // Meteor._debug.
      //
      // The intent (though this is actually determined by the underlying
      // drivers) is that the operations should be done synchronously, not
      // generating their result until the database has acknowledged
      // them. In the future maybe we should provide a flag to turn this
      // off.

      _insert(doc, callback) {
        // Make sure we were passed a document to insert
        if (!doc) {
          throw new Error('insert requires an argument');
        }

        // Make a shallow clone of the document, preserving its prototype.
        doc = Object.create(Object.getPrototypeOf(doc), Object.getOwnPropertyDescriptors(doc));
        if ('_id' in doc) {
          if (!doc._id || !(typeof doc._id === 'string' || doc._id instanceof Mongo.ObjectID)) {
            throw new Error('Meteor requires document _id fields to be non-empty strings or ObjectIDs');
          }
        } else {
          let generateId = true;

          // Don't generate the id if we're the client and the 'outermost' call
          // This optimization saves us passing both the randomSeed and the id
          // Passing both is redundant.
          if (this._isRemoteCollection()) {
            const enclosing = DDP._CurrentMethodInvocation.get();
            if (!enclosing) {
              generateId = false;
            }
          }
          if (generateId) {
            doc._id = this._makeNewID();
          }
        }

        // On inserts, always return the id that we generated; on all other
        // operations, just return the result from the collection.
        var chooseReturnValueFromCollectionResult = function (result) {
          if (Meteor._isPromise(result)) return result;
          if (doc._id) {
            return doc._id;
          }

          // XXX what is this for??
          // It's some iteraction between the callback to _callMutatorMethod and
          // the return value conversion
          doc._id = result;
          return result;
        };
        const wrappedCallback = wrapCallback(callback, chooseReturnValueFromCollectionResult);
        if (this._isRemoteCollection()) {
          const result = this._callMutatorMethod('insert', [doc], wrappedCallback);
          return chooseReturnValueFromCollectionResult(result);
        }

        // it's my collection.  descend into the collection object
        // and propagate any exception.
        try {
          // If the user provided a callback and the collection implements this
          // operation asynchronously, then queryRet will be undefined, and the
          // result will be returned through the callback instead.
          let result;
          if (!!wrappedCallback) {
            this._collection.insert(doc, wrappedCallback);
          } else {
            // If we don't have the callback, we assume the user is using the promise.
            // We can't just pass this._collection.insert to the promisify because it would lose the context.
            result = this._collection.insert(doc);
          }
          return chooseReturnValueFromCollectionResult(result);
        } catch (e) {
          if (callback) {
            callback(e);
            return null;
          }
          throw e;
        }
      },
      /**
       * @summary Insert a document in the collection.  Returns its unique _id.
       * @locus Anywhere
       * @method  insert
       * @memberof Mongo.Collection
       * @instance
       * @param {Object} doc The document to insert. May not yet have an _id attribute, in which case Meteor will generate one for you.
       * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the _id as the second.
       */
      insert(doc, callback) {
        return this._insert(doc, callback);
      },
      /**
       * @summary Asynchronously modifies one or more documents in the collection. Returns the number of matched documents.
       * @locus Anywhere
       * @method update
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to modify
       * @param {MongoModifier} modifier Specifies how to modify the documents
       * @param {Object} [options]
       * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
       * @param {Boolean} options.upsert True to insert a document if no matching documents are found.
       * @param {Array} options.arrayFilters Optional. Used in combination with MongoDB [filtered positional operator](https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/) to specify which elements to modify in an array field.
       * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
       */
      update(selector, modifier) {
        for (var _len3 = arguments.length, optionsAndCallback = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          optionsAndCallback[_key3 - 2] = arguments[_key3];
        }
        const callback = popCallbackFromArgs(optionsAndCallback);

        // We've already popped off the callback, so we are left with an array
        // of one or zero items
        const options = _objectSpread({}, optionsAndCallback[0] || null);
        let insertedId;
        if (options && options.upsert) {
          // set `insertedId` if absent.  `insertedId` is a Meteor extension.
          if (options.insertedId) {
            if (!(typeof options.insertedId === 'string' || options.insertedId instanceof Mongo.ObjectID)) throw new Error('insertedId must be string or ObjectID');
            insertedId = options.insertedId;
          } else if (!selector || !selector._id) {
            insertedId = this._makeNewID();
            options.generatedId = true;
            options.insertedId = insertedId;
          }
        }
        selector = Mongo.Collection._rewriteSelector(selector, {
          fallbackId: insertedId
        });
        const wrappedCallback = wrapCallback(callback);
        if (this._isRemoteCollection()) {
          const args = [selector, modifier, options];
          return this._callMutatorMethod('update', args, callback);
        }

        // it's my collection.  descend into the collection object
        // and propagate any exception.
        // If the user provided a callback and the collection implements this
        // operation asynchronously, then queryRet will be undefined, and the
        // result will be returned through the callback instead.
        //console.log({callback, options, selector, modifier, coll: this._collection});
        try {
          // If the user provided a callback and the collection implements this
          // operation asynchronously, then queryRet will be undefined, and the
          // result will be returned through the callback instead.
          return this._collection.update(selector, modifier, options, wrappedCallback);
        } catch (e) {
          if (callback) {
            callback(e);
            return null;
          }
          throw e;
        }
      },
      /**
       * @summary Remove documents from the collection
       * @locus Anywhere
       * @method remove
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to remove
       * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
       */
      remove(selector, callback) {
        selector = Mongo.Collection._rewriteSelector(selector);
        if (this._isRemoteCollection()) {
          return this._callMutatorMethod('remove', [selector], callback);
        }

        // it's my collection.  descend into the collection1 object
        // and propagate any exception.
        return this._collection.remove(selector);
      },
      /**
       * @summary Asynchronously modifies one or more documents in the collection, or insert one if no matching documents were found. Returns an object with keys `numberAffected` (the number of documents modified)  and `insertedId` (the unique _id of the document that was inserted, if any).
       * @locus Anywhere
       * @method upsert
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to modify
       * @param {MongoModifier} modifier Specifies how to modify the documents
       * @param {Object} [options]
       * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
       * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
       */
      upsert(selector, modifier, options, callback) {
        if (!callback && typeof options === 'function') {
          callback = options;
          options = {};
        }
        return this.update(selector, modifier, _objectSpread(_objectSpread({}, options), {}, {
          _returnObject: true,
          upsert: true
        }));
      }
    };
    // Convert the callback to not return a result if there is an error
    function wrapCallback(callback, convertResult) {
      return callback && function (error, result) {
        if (error) {
          callback(error);
        } else if (typeof convertResult === 'function') {
          callback(error, convertResult(result));
        } else {
          callback(error, result);
        }
      };
    }
    function popCallbackFromArgs(args) {
      // Pull off any callback (or perhaps a 'callback' variable that was passed
      // in undefined, like how 'upsert' does it).
      if (args.length && (args[args.length - 1] === undefined || args[args.length - 1] instanceof Function)) {
        return args.pop();
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

}},"connection_options.ts":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/connection_options.ts                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**
 * @summary Allows for user specified connection options
 * @example http://mongodb.github.io/node-mongodb-native/3.0/reference/connecting/connection-settings/
 * @locus Server
 * @param {Object} options User specified Mongo connection options
 */
Mongo.setConnectionOptions = function setConnectionOptions(options) {
  check(options, Object);
  Mongo._connectionOptions = options;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo_utils.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_utils.js                                                                                       //
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
    let _objectWithoutProperties;
    module.link("@babel/runtime/helpers/objectWithoutProperties", {
      default(v) {
        _objectWithoutProperties = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const _excluded = ["fields", "projection"];
    module.export({
      normalizeProjection: () => normalizeProjection
    });
    const normalizeProjection = options => {
      // transform fields key in projection
      const _ref = options || {},
        {
          fields,
          projection
        } = _ref,
        otherOptions = _objectWithoutProperties(_ref, _excluded);
      // TODO: enable this comment when deprecating the fields option
      // Log.debug(`fields option has been deprecated, please use the new 'projection' instead`)

      return _objectSpread(_objectSpread({}, otherOptions), projection || fields ? {
        projection: fields || projection
      } : {});
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

},"observe_handle.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/observe_handle.ts                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  ObserveHandle: () => ObserveHandle
});
let nextObserveHandleId = 1;
/**
 * The "observe handle" returned from observeChanges.
 * Contains a reference to an ObserveMultiplexer.
 * Used to stop observation and clean up resources.
 */
class ObserveHandle {
  constructor(multiplexer, callbacks, nonMutatingCallbacks) {
    this._id = void 0;
    this._multiplexer = void 0;
    this.nonMutatingCallbacks = void 0;
    this._stopped = void 0;
    this.initialAddsSentResolver = () => {};
    this.initialAddsSent = void 0;
    this._added = void 0;
    this._addedBefore = void 0;
    this._changed = void 0;
    this._movedBefore = void 0;
    this._removed = void 0;
    /**
     * Using property syntax and arrow function syntax to avoid binding the wrong context on callbacks.
     */
    this.stop = async () => {
      if (this._stopped) return;
      this._stopped = true;
      await this._multiplexer.removeHandle(this._id);
    };
    this._multiplexer = multiplexer;
    multiplexer.callbackNames().forEach(name => {
      if (callbacks[name]) {
        this["_".concat(name)] = callbacks[name];
        return;
      }
      if (name === "addedBefore" && callbacks.added) {
        this._addedBefore = async function (id, fields, before) {
          await callbacks.added(id, fields);
        };
      }
    });
    this._stopped = false;
    this._id = nextObserveHandleId++;
    this.nonMutatingCallbacks = nonMutatingCallbacks;
    this.initialAddsSent = new Promise(resolve => {
      const ready = () => {
        resolve();
        this.initialAddsSent = Promise.resolve();
      };
      const timeout = setTimeout(ready, 30000);
      this.initialAddsSentResolver = () => {
        ready();
        clearTimeout(timeout);
      };
    });
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"lodash.isempty":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.isempty/package.json                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isempty",
  "version": "4.4.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.isempty/index.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.clone":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.clone/package.json                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.clone",
  "version": "4.5.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.clone/index.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.has":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.has/package.json                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.has",
  "version": "4.5.2"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.has/index.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.throttle":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.throttle/package.json                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.throttle",
  "version": "4.1.1"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.throttle/index.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"mongodb-uri":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/mongodb-uri/package.json                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "mongodb-uri",
  "version": "0.9.7",
  "main": "mongodb-uri"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongodb-uri.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/mongodb-uri/mongodb-uri.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.once":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.once/package.json                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.once",
  "version": "4.1.1"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.once/index.js                                                         //
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
  export: function () { return {
      MongoInternals: MongoInternals,
      Mongo: Mongo,
      ObserveMultiplexer: ObserveMultiplexer
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/mongo/mongo_driver.js",
    "/node_modules/meteor/mongo/oplog_tailing.ts",
    "/node_modules/meteor/mongo/observe_multiplex.ts",
    "/node_modules/meteor/mongo/doc_fetcher.js",
    "/node_modules/meteor/mongo/polling_observe_driver.ts",
    "/node_modules/meteor/mongo/oplog_observe_driver.js",
    "/node_modules/meteor/mongo/oplog_v2_converter.ts",
    "/node_modules/meteor/mongo/cursor_description.ts",
    "/node_modules/meteor/mongo/mongo_connection.js",
    "/node_modules/meteor/mongo/mongo_common.js",
    "/node_modules/meteor/mongo/asynchronous_cursor.js",
    "/node_modules/meteor/mongo/cursor.ts",
    "/node_modules/meteor/mongo/local_collection_driver.js",
    "/node_modules/meteor/mongo/remote_collection_driver.ts",
    "/node_modules/meteor/mongo/collection/collection.js",
    "/node_modules/meteor/mongo/connection_options.ts"
  ]
}});

//# sourceURL=meteor://💻app/packages/mongo.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vbW9uZ29fZHJpdmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9vcGxvZ190YWlsaW5nLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9vYnNlcnZlX211bHRpcGxleC50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vZG9jX2ZldGNoZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL3BvbGxpbmdfb2JzZXJ2ZV9kcml2ZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL29wbG9nX29ic2VydmVfZHJpdmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9vcGxvZ192Ml9jb252ZXJ0ZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2N1cnNvcl9kZXNjcmlwdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vbW9uZ29fY29ubmVjdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vbW9uZ29fY29tbW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9hc3luY2hyb25vdXNfY3Vyc29yLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9jdXJzb3IudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2xvY2FsX2NvbGxlY3Rpb25fZHJpdmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9yZW1vdGVfY29sbGVjdGlvbl9kcml2ZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2NvbGxlY3Rpb24vY29sbGVjdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vY29sbGVjdGlvbi9jb2xsZWN0aW9uX3V0aWxzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9jb2xsZWN0aW9uL21ldGhvZHNfYXN5bmMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2NvbGxlY3Rpb24vbWV0aG9kc19pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vY29sbGVjdGlvbi9tZXRob2RzX3JlcGxpY2F0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9jb2xsZWN0aW9uL21ldGhvZHNfc3luYy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vY29ubmVjdGlvbl9vcHRpb25zLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9tb25nb191dGlscy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vb2JzZXJ2ZV9oYW5kbGUudHMiXSwibmFtZXMiOlsibW9kdWxlMSIsImV4cG9ydCIsImxpc3RlbkFsbCIsImZvckVhY2hUcmlnZ2VyIiwiT3Bsb2dIYW5kbGUiLCJsaW5rIiwidiIsIk1vbmdvQ29ubmVjdGlvbiIsIk9wbG9nT2JzZXJ2ZURyaXZlciIsIk1vbmdvREIiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsIk1vbmdvSW50ZXJuYWxzIiwiZ2xvYmFsIiwiX19wYWNrYWdlTmFtZSIsIk5wbU1vZHVsZXMiLCJtb25nb2RiIiwidmVyc2lvbiIsIk5wbU1vZHVsZU1vbmdvZGJWZXJzaW9uIiwibW9kdWxlIiwiTnBtTW9kdWxlIiwiUHJveHkiLCJnZXQiLCJ0YXJnZXQiLCJwcm9wZXJ0eUtleSIsInJlY2VpdmVyIiwiTWV0ZW9yIiwiZGVwcmVjYXRlIiwiUmVmbGVjdCIsIkNvbm5lY3Rpb24iLCJUaW1lc3RhbXAiLCJwcm90b3R5cGUiLCJjbG9uZSIsImN1cnNvckRlc2NyaXB0aW9uIiwibGlzdGVuQ2FsbGJhY2siLCJsaXN0ZW5lcnMiLCJ0cmlnZ2VyIiwicHVzaCIsIkREUFNlcnZlciIsIl9JbnZhbGlkYXRpb25Dcm9zc2JhciIsImxpc3RlbiIsInN0b3AiLCJmb3JFYWNoIiwibGlzdGVuZXIiLCJ0cmlnZ2VyQ2FsbGJhY2siLCJrZXkiLCJjb2xsZWN0aW9uIiwiY29sbGVjdGlvbk5hbWUiLCJzcGVjaWZpY0lkcyIsIkxvY2FsQ29sbGVjdGlvbiIsIl9pZHNNYXRjaGVkQnlTZWxlY3RvciIsInNlbGVjdG9yIiwiaWQiLCJPYmplY3QiLCJhc3NpZ24iLCJkcm9wQ29sbGVjdGlvbiIsImRyb3BEYXRhYmFzZSIsIk1vbmdvVGltZXN0YW1wIiwiX19yZWlmeV9hc3luY19yZXN1bHRfXyIsIl9yZWlmeUVycm9yIiwic2VsZiIsImFzeW5jIiwiX29iamVjdFNwcmVhZCIsImRlZmF1bHQiLCJPUExPR19DT0xMRUNUSU9OIiwiaWRGb3JPcCIsImlzRW1wdHkiLCJDdXJzb3JEZXNjcmlwdGlvbiIsIk5wbU1vZHVsZU1vbmdvZGIiLCJMb25nIiwiVE9PX0ZBUl9CRUhJTkQiLCJwcm9jZXNzIiwiZW52IiwiTUVURU9SX09QTE9HX1RPT19GQVJfQkVISU5EIiwiVEFJTF9USU1FT1VUIiwiTUVURU9SX09QTE9HX1RBSUxfVElNRU9VVCIsImNvbnN0cnVjdG9yIiwib3Bsb2dVcmwiLCJkYk5hbWUiLCJfb3Bsb2dVcmwiLCJfZGJOYW1lIiwiX29wbG9nTGFzdEVudHJ5Q29ubmVjdGlvbiIsIl9vcGxvZ1RhaWxDb25uZWN0aW9uIiwiX29wbG9nT3B0aW9ucyIsIl9zdG9wcGVkIiwiX3RhaWxIYW5kbGUiLCJfcmVhZHlQcm9taXNlUmVzb2x2ZXIiLCJfcmVhZHlQcm9taXNlIiwiX2Nyb3NzYmFyIiwiX2Jhc2VPcGxvZ1NlbGVjdG9yIiwiX2NhdGNoaW5nVXBSZXNvbHZlcnMiLCJfbGFzdFByb2Nlc3NlZFRTIiwiX29uU2tpcHBlZEVudHJpZXNIb29rIiwiX3N0YXJ0VHJhaWxpbmdQcm9taXNlIiwiX3Jlc29sdmVUaW1lb3V0IiwiX2VudHJ5UXVldWUiLCJfRG91YmxlRW5kZWRRdWV1ZSIsIl93b3JrZXJBY3RpdmUiLCJfd29ya2VyUHJvbWlzZSIsIlByb21pc2UiLCJyIiwiX0Nyb3NzYmFyIiwiZmFjdFBhY2thZ2UiLCJmYWN0TmFtZSIsIm5zIiwiUmVnRXhwIiwiX2VzY2FwZVJlZ0V4cCIsImpvaW4iLCIkb3IiLCJvcCIsIiRpbiIsIiRleGlzdHMiLCJIb29rIiwiZGVidWdQcmludEV4Y2VwdGlvbnMiLCJfc3RhcnRUYWlsaW5nIiwiX29uT3Bsb2dFbnRyeSIsImNhbGxiYWNrIiwiRXJyb3IiLCJvcmlnaW5hbENhbGxiYWNrIiwiYmluZEVudmlyb25tZW50Iiwibm90aWZpY2F0aW9uIiwiZXJyIiwiX2RlYnVnIiwibGlzdGVuSGFuZGxlIiwib25PcGxvZ0VudHJ5Iiwib25Ta2lwcGVkRW50cmllcyIsInJlZ2lzdGVyIiwiX3dhaXRVbnRpbENhdWdodFVwIiwibGFzdEVudHJ5IiwiZmluZE9uZUFzeW5jIiwicHJvamVjdGlvbiIsInRzIiwic29ydCIsIiRuYXR1cmFsIiwiZSIsInNsZWVwIiwiSlNPTiIsInN0cmluZ2lmeSIsImxlc3NUaGFuT3JFcXVhbCIsImluc2VydEFmdGVyIiwibGVuZ3RoIiwiZ3JlYXRlclRoYW4iLCJwcm9taXNlUmVzb2x2ZXIiLCJwcm9taXNlVG9Bd2FpdCIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJjb25zb2xlIiwiZXJyb3IiLCJzcGxpY2UiLCJyZXNvbHZlciIsIndhaXRVbnRpbENhdWdodFVwIiwibW9uZ29kYlVyaSIsInJlcXVpcmUiLCJwYXJzZSIsImRhdGFiYXNlIiwibWF4UG9vbFNpemUiLCJtaW5Qb29sU2l6ZSIsIl9NZXRlb3Ikc2V0dGluZ3MiLCJfTWV0ZW9yJHNldHRpbmdzJHBhY2siLCJfTWV0ZW9yJHNldHRpbmdzJHBhY2syIiwiX01ldGVvciRzZXR0aW5nczIiLCJfTWV0ZW9yJHNldHRpbmdzMiRwYWMiLCJfTWV0ZW9yJHNldHRpbmdzMiRwYWMyIiwiaXNNYXN0ZXJEb2MiLCJkYiIsImFkbWluIiwiY29tbWFuZCIsImlzbWFzdGVyIiwic2V0TmFtZSIsImxhc3RPcGxvZ0VudHJ5Iiwib3Bsb2dTZWxlY3RvciIsIiRndCIsImluY2x1ZGVDb2xsZWN0aW9ucyIsInNldHRpbmdzIiwicGFja2FnZXMiLCJtb25nbyIsIm9wbG9nSW5jbHVkZUNvbGxlY3Rpb25zIiwiZXhjbHVkZUNvbGxlY3Rpb25zIiwib3Bsb2dFeGNsdWRlQ29sbGVjdGlvbnMiLCIkcmVnZXgiLCIkbmluIiwibWFwIiwiY29sbE5hbWUiLCJjb25jYXQiLCIkYW5kIiwidGFpbGFibGUiLCJ0YWlsIiwiZG9jIiwiX21heWJlU3RhcnRXb3JrZXIiLCJwb3AiLCJjbGVhciIsImVhY2giLCJfc2V0TGFzdFByb2Nlc3NlZFRTIiwic2hpZnQiLCJoYW5kbGVEb2MiLCJzZXF1ZW5jZXIiLCJfZGVmaW5lVG9vRmFyQmVoaW5kIiwidmFsdWUiLCJfcmVzZXRUb29GYXJCZWhpbmQiLCJvIiwiX2lkIiwibzIiLCJoYW5kbGUiLCJhcHBseU9wcyIsIm5leHRUaW1lc3RhbXAiLCJhZGQiLCJPTkUiLCJzdGFydHNXaXRoIiwic2xpY2UiLCJkcm9wIiwiZmlyZSIsInJlc29sdmUiLCJzZXRJbW1lZGlhdGUiLCJfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMiLCJfZXhjbHVkZWQiLCJPYnNlcnZlTXVsdGlwbGV4ZXIiLCJfcmVmIiwiX3RoaXMiLCJvcmRlcmVkIiwib25TdG9wIiwiX29yZGVyZWQiLCJfb25TdG9wIiwiX3F1ZXVlIiwiX2hhbmRsZXMiLCJfcmVzb2x2ZXIiLCJfaXNSZWFkeSIsIl9jYWNoZSIsIl9hZGRIYW5kbGVUYXNrc1NjaGVkdWxlZEJ1dE5vdFBlcmZvcm1lZCIsInVuZGVmaW5lZCIsIlBhY2thZ2UiLCJGYWN0cyIsImluY3JlbWVudFNlcnZlckZhY3QiLCJfQXN5bmNocm9ub3VzUXVldWUiLCJ0aGVuIiwiX0NhY2hpbmdDaGFuZ2VPYnNlcnZlciIsImNhbGxiYWNrTmFtZXMiLCJjYWxsYmFja05hbWUiLCJfbGVuIiwiYXJndW1lbnRzIiwiYXJncyIsIkFycmF5IiwiX2tleSIsIl9hcHBseUNhbGxiYWNrIiwiYWRkSGFuZGxlQW5kU2VuZEluaXRpYWxBZGRzIiwiX2FkZEhhbmRsZUFuZFNlbmRJbml0aWFsQWRkcyIsInJ1blRhc2siLCJfc2VuZEFkZHMiLCJyZW1vdmVIYW5kbGUiLCJfcmVhZHkiLCJfc3RvcCIsIm9wdGlvbnMiLCJmcm9tUXVlcnlFcnJvciIsInJlYWR5IiwicXVldWVUYXNrIiwicXVlcnlFcnJvciIsIm9uRmx1c2giLCJjYiIsImFwcGx5Q2hhbmdlIiwiYXBwbHkiLCJoYW5kbGVJZCIsImtleXMiLCJpbml0aWFsQWRkc1NlbnQiLCJub25NdXRhdGluZ0NhbGxiYWNrcyIsIkVKU09OIiwiX2FkZGVkQmVmb3JlIiwiX2FkZGVkIiwiYWRkUHJvbWlzZXMiLCJkb2NzIiwiX3JlZjIiLCJmaWVsZHMiLCJwcm9taXNlIiwiYWxsIiwiaW5pdGlhbEFkZHNTZW50UmVzb2x2ZXIiLCJEb2NGZXRjaGVyIiwibW9uZ29Db25uZWN0aW9uIiwiX21vbmdvQ29ubmVjdGlvbiIsIl9jYWxsYmFja3NGb3JPcCIsIk1hcCIsImZldGNoIiwiY2hlY2siLCJTdHJpbmciLCJoYXMiLCJjYWxsYmFja3MiLCJzZXQiLCJkZWxldGUiLCJQb2xsaW5nT2JzZXJ2ZURyaXZlciIsInRocm90dGxlIiwiUE9MTElOR19USFJPVFRMRV9NUyIsIk1FVEVPUl9QT0xMSU5HX1RIUk9UVExFX01TIiwiUE9MTElOR19JTlRFUlZBTF9NUyIsIk1FVEVPUl9QT0xMSU5HX0lOVEVSVkFMX01TIiwiX29wdGlvbnMiLCJfY3Vyc29yRGVzY3JpcHRpb24iLCJfbW9uZ29IYW5kbGUiLCJfbXVsdGlwbGV4ZXIiLCJfc3RvcENhbGxiYWNrcyIsIl9jdXJzb3IiLCJfcmVzdWx0cyIsIl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQiLCJfcGVuZGluZ1dyaXRlcyIsIl9lbnN1cmVQb2xsSXNTY2hlZHVsZWQiLCJfdGFza1F1ZXVlIiwiX3Rlc3RPbmx5UG9sbENhbGxiYWNrIiwibW9uZ29IYW5kbGUiLCJtdWx0aXBsZXhlciIsIl9jcmVhdGVBc3luY2hyb25vdXNDdXJzb3IiLCJfdW50aHJvdHRsZWRFbnN1cmVQb2xsSXNTY2hlZHVsZWQiLCJiaW5kIiwicG9sbGluZ1Rocm90dGxlTXMiLCJfaW5pdCIsIl9QYWNrYWdlJGZhY3RzQmFzZSIsImxpc3RlbmVyc0hhbmRsZSIsImZlbmNlIiwiX2dldEN1cnJlbnRGZW5jZSIsImJlZ2luV3JpdGUiLCJwb2xsaW5nSW50ZXJ2YWwiLCJwb2xsaW5nSW50ZXJ2YWxNcyIsIl9wb2xsaW5nSW50ZXJ2YWwiLCJpbnRlcnZhbEhhbmRsZSIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsIl9wb2xsTW9uZ28iLCJfc3VzcGVuZFBvbGxpbmciLCJfcmVzdW1lUG9sbGluZyIsIl90aGlzJF90ZXN0T25seVBvbGxDYSIsImZpcnN0IiwibmV3UmVzdWx0cyIsIm9sZFJlc3VsdHMiLCJfSWRNYXAiLCJjYWxsIiwid3JpdGVzRm9yQ3ljbGUiLCJnZXRSYXdPYmplY3RzIiwiY29kZSIsIm1lc3NhZ2UiLCJfZGlmZlF1ZXJ5Q2hhbmdlcyIsInciLCJjb21taXR0ZWQiLCJfUGFja2FnZSRmYWN0c0Jhc2UyIiwiX2FzeW5jSXRlcmF0b3IiLCJvcGxvZ1YyVjFDb252ZXJ0ZXIiLCJNYXRjaCIsIkN1cnNvciIsIlBIQVNFIiwiUVVFUllJTkciLCJGRVRDSElORyIsIlNURUFEWSIsIlN3aXRjaGVkVG9RdWVyeSIsImZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5IiwiZiIsImN1cnJlbnRJZCIsIl91c2VzT3Bsb2ciLCJzb3J0ZXIiLCJjb21wYXJhdG9yIiwiZ2V0Q29tcGFyYXRvciIsImxpbWl0IiwiaGVhcE9wdGlvbnMiLCJJZE1hcCIsIl9saW1pdCIsIl9jb21wYXJhdG9yIiwiX3NvcnRlciIsIl91bnB1Ymxpc2hlZEJ1ZmZlciIsIk1pbk1heEhlYXAiLCJfcHVibGlzaGVkIiwiTWF4SGVhcCIsIl9zYWZlQXBwZW5kVG9CdWZmZXIiLCJfc3RvcEhhbmRsZXMiLCJfYWRkU3RvcEhhbmRsZXMiLCJuZXdTdG9wSGFuZGxlcyIsImV4cGVjdGVkUGF0dGVybiIsIk9iamVjdEluY2x1ZGluZyIsIkZ1bmN0aW9uIiwiT25lT2YiLCJfcmVnaXN0ZXJQaGFzZUNoYW5nZSIsIl9tYXRjaGVyIiwibWF0Y2hlciIsIl9wcm9qZWN0aW9uRm4iLCJfY29tcGlsZVByb2plY3Rpb24iLCJfc2hhcmVkUHJvamVjdGlvbiIsImNvbWJpbmVJbnRvUHJvamVjdGlvbiIsIl9zaGFyZWRQcm9qZWN0aW9uRm4iLCJfbmVlZFRvRmV0Y2giLCJfY3VycmVudGx5RmV0Y2hpbmciLCJfZmV0Y2hHZW5lcmF0aW9uIiwiX3JlcXVlcnlXaGVuRG9uZVRoaXNRdWVyeSIsIl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5IiwiX29wbG9nSGFuZGxlIiwiX25lZWRUb1BvbGxRdWVyeSIsIl9waGFzZSIsIl9oYW5kbGVPcGxvZ0VudHJ5UXVlcnlpbmciLCJfaGFuZGxlT3Bsb2dFbnRyeVN0ZWFkeU9yRmV0Y2hpbmciLCJmaXJlZCIsIl9vcGxvZ09ic2VydmVEcml2ZXJzIiwib25CZWZvcmVGaXJlIiwiZHJpdmVycyIsImRyaXZlciIsInZhbHVlcyIsIndyaXRlIiwiX29uRmFpbG92ZXIiLCJfcnVuSW5pdGlhbFF1ZXJ5IiwiX2FkZFB1Ymxpc2hlZCIsIl9ub1lpZWxkc0FsbG93ZWQiLCJhZGRlZCIsInNpemUiLCJvdmVyZmxvd2luZ0RvY0lkIiwibWF4RWxlbWVudElkIiwib3ZlcmZsb3dpbmdEb2MiLCJlcXVhbHMiLCJyZW1vdmUiLCJyZW1vdmVkIiwiX2FkZEJ1ZmZlcmVkIiwiX3JlbW92ZVB1Ymxpc2hlZCIsImVtcHR5IiwibmV3RG9jSWQiLCJtaW5FbGVtZW50SWQiLCJuZXdEb2MiLCJfcmVtb3ZlQnVmZmVyZWQiLCJfY2hhbmdlUHVibGlzaGVkIiwib2xkRG9jIiwicHJvamVjdGVkTmV3IiwicHJvamVjdGVkT2xkIiwiY2hhbmdlZCIsIkRpZmZTZXF1ZW5jZSIsIm1ha2VDaGFuZ2VkRmllbGRzIiwibWF4QnVmZmVyZWRJZCIsIl9hZGRNYXRjaGluZyIsIm1heFB1Ymxpc2hlZCIsIm1heEJ1ZmZlcmVkIiwidG9QdWJsaXNoIiwiY2FuQXBwZW5kVG9CdWZmZXIiLCJjYW5JbnNlcnRJbnRvQnVmZmVyIiwidG9CdWZmZXIiLCJfcmVtb3ZlTWF0Y2hpbmciLCJfaGFuZGxlRG9jIiwibWF0Y2hlc05vdyIsImRvY3VtZW50TWF0Y2hlcyIsInJlc3VsdCIsInB1Ymxpc2hlZEJlZm9yZSIsImJ1ZmZlcmVkQmVmb3JlIiwiY2FjaGVkQmVmb3JlIiwibWluQnVmZmVyZWQiLCJzdGF5c0luUHVibGlzaGVkIiwic3RheXNJbkJ1ZmZlciIsIl9mZXRjaE1vZGlmaWVkRG9jdW1lbnRzIiwiZGVmZXIiLCJ0aGlzR2VuZXJhdGlvbiIsIndhaXRpbmciLCJhd2FpdGFibGVQcm9taXNlIiwiZm9yRWFjaEFzeW5jIiwiX2RvY0ZldGNoZXIiLCJfYmVTdGVhZHkiLCJ3cml0ZXMiLCJpc1JlcGxhY2UiLCJjYW5EaXJlY3RseU1vZGlmeURvYyIsIm1vZGlmaWVyQ2FuQmVEaXJlY3RseUFwcGxpZWQiLCJfbW9kaWZ5IiwibmFtZSIsImNhbkJlY29tZVRydWVCeU1vZGlmaWVyIiwiYWZmZWN0ZWRCeU1vZGlmaWVyIiwiX3J1bkluaXRpYWxRdWVyeUFzeW5jIiwiX3J1blF1ZXJ5IiwiaW5pdGlhbCIsIl9kb25lUXVlcnlpbmciLCJfcG9sbFF1ZXJ5IiwiX3J1blF1ZXJ5QXN5bmMiLCJuZXdCdWZmZXIiLCJjdXJzb3IiLCJfY3Vyc29yRm9yUXVlcnkiLCJpIiwiX3NsZWVwRm9yTXMiLCJfcHVibGlzaE5ld1Jlc3VsdHMiLCJvcHRpb25zT3ZlcndyaXRlIiwidHJhbnNmb3JtIiwiZGVzY3JpcHRpb24iLCJpZHNUb1JlbW92ZSIsIl9vcGxvZ0VudHJ5SGFuZGxlIiwiX2xpc3RlbmVyc0hhbmRsZSIsIl9pdGVyYXRvckFicnVwdENvbXBsZXRpb24iLCJfZGlkSXRlcmF0b3JFcnJvciIsIl9pdGVyYXRvckVycm9yIiwiX2l0ZXJhdG9yIiwiX3N0ZXAiLCJuZXh0IiwiZG9uZSIsInJldHVybiIsInBoYXNlIiwibm93IiwiRGF0ZSIsInRpbWVEaWZmIiwiX3BoYXNlU3RhcnRUaW1lIiwiY3Vyc29yU3VwcG9ydGVkIiwiZGlzYWJsZU9wbG9nIiwiX2Rpc2FibGVPcGxvZyIsInNraXAiLCJfY2hlY2tTdXBwb3J0ZWRQcm9qZWN0aW9uIiwiaGFzV2hlcmUiLCJoYXNHZW9RdWVyeSIsIm1vZGlmaWVyIiwiZW50cmllcyIsImV2ZXJ5Iiwib3BlcmF0aW9uIiwiZmllbGQiLCJ0ZXN0IiwiYXJyYXlPcGVyYXRvcktleVJlZ2V4IiwiaXNBcnJheU9wZXJhdG9yS2V5IiwiaXNBcnJheU9wZXJhdG9yIiwib3BlcmF0b3IiLCJhIiwicHJlZml4IiwiZmxhdHRlbk9iamVjdEludG8iLCJzb3VyY2UiLCJpc0FycmF5IiwiTW9uZ28iLCJPYmplY3RJRCIsIl9pc0N1c3RvbVR5cGUiLCJjb252ZXJ0T3Bsb2dEaWZmIiwib3Bsb2dFbnRyeSIsImRpZmYiLCJkaWZmS2V5IiwiX29wbG9nRW50cnkkJHVuc2V0IiwiJHVuc2V0IiwiX29wbG9nRW50cnkkJHNldCIsIiRzZXQiLCJfb3Bsb2dFbnRyeSQkc2V0MiIsIl9yZWYzIiwiZmllbGRWYWx1ZSIsIl9yZWY0IiwicG9zaXRpb24iLCJwb3NpdGlvbktleSIsIl9vcGxvZ0VudHJ5JCR1bnNldDIiLCJfb3Bsb2dFbnRyeSQkc2V0MyIsIiR2IiwiY29udmVydGVkT3Bsb2dFbnRyeSIsIkNvbGxlY3Rpb24iLCJfcmV3cml0ZVNlbGVjdG9yIiwiQ0xJRU5UX09OTFlfTUVUSE9EUyIsImdldEFzeW5jTWV0aG9kTmFtZSIsInBhdGgiLCJBc3luY2hyb25vdXNDdXJzb3IiLCJyZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbyIsInJlcGxhY2VUeXBlcyIsInRyYW5zZm9ybVJlc3VsdCIsIk9ic2VydmVIYW5kbGUiLCJGSUxFX0FTU0VUX1NVRkZJWCIsIkFTU0VUU19GT0xERVIiLCJBUFBfRk9MREVSIiwib3Bsb2dDb2xsZWN0aW9uV2FybmluZ3MiLCJ1cmwiLCJfb2JzZXJ2ZU11bHRpcGxleGVycyIsIl9vbkZhaWxvdmVySG9vayIsInVzZXJPcHRpb25zIiwiX2Nvbm5lY3Rpb25PcHRpb25zIiwibW9uZ29PcHRpb25zIiwiaWdub3JlVW5kZWZpbmVkIiwiZmlsdGVyIiwiZW5kc1dpdGgiLCJvcHRpb25OYW1lIiwicmVwbGFjZSIsIkFzc2V0cyIsImdldFNlcnZlckRpciIsImRyaXZlckluZm8iLCJyZWxlYXNlIiwiY2xpZW50IiwiTW9uZ29DbGllbnQiLCJvbiIsImV2ZW50IiwicHJldmlvdXNEZXNjcmlwdGlvbiIsInR5cGUiLCJuZXdEZXNjcmlwdGlvbiIsImRhdGFiYXNlTmFtZSIsIl9jbG9zZSIsIm9wbG9nSGFuZGxlIiwiY2xvc2UiLCJfc2V0T3Bsb2dIYW5kbGUiLCJyYXdDb2xsZWN0aW9uIiwiY3JlYXRlQ2FwcGVkQ29sbGVjdGlvbkFzeW5jIiwiYnl0ZVNpemUiLCJtYXhEb2N1bWVudHMiLCJjcmVhdGVDb2xsZWN0aW9uIiwiY2FwcGVkIiwibWF4IiwiX21heWJlQmVnaW5Xcml0ZSIsImluc2VydEFzeW5jIiwiY29sbGVjdGlvbl9uYW1lIiwiZG9jdW1lbnQiLCJfZXhwZWN0ZWRCeVRlc3QiLCJfaXNQbGFpbk9iamVjdCIsInJlZnJlc2giLCJpbnNlcnRPbmUiLCJzYWZlIiwiaW5zZXJ0ZWRJZCIsImNhdGNoIiwiX3JlZnJlc2giLCJyZWZyZXNoS2V5IiwicmVtb3ZlQXN5bmMiLCJkZWxldGVNYW55IiwiZGVsZXRlZENvdW50IiwibW9kaWZpZWRDb3VudCIsIm51bWJlckFmZmVjdGVkIiwiZHJvcENvbGxlY3Rpb25Bc3luYyIsImRyb3BEYXRhYmFzZUFzeW5jIiwiX2Ryb3BEYXRhYmFzZSIsInVwZGF0ZUFzeW5jIiwibW9kIiwibW9uZ29PcHRzIiwiYXJyYXlGaWx0ZXJzIiwidXBzZXJ0IiwibXVsdGkiLCJmdWxsUmVzdWx0IiwibW9uZ29TZWxlY3RvciIsIm1vbmdvTW9kIiwiaXNNb2RpZnkiLCJfaXNNb2RpZmljYXRpb25Nb2QiLCJfZm9yYmlkUmVwbGFjZSIsImtub3duSWQiLCJfY3JlYXRlVXBzZXJ0RG9jdW1lbnQiLCJnZW5lcmF0ZWRJZCIsInNpbXVsYXRlVXBzZXJ0V2l0aEluc2VydGVkSWQiLCJfcmV0dXJuT2JqZWN0IiwiaGFzT3duUHJvcGVydHkiLCIkc2V0T25JbnNlcnQiLCJzdHJpbmdzIiwidXBkYXRlTWV0aG9kIiwibWV0ZW9yUmVzdWx0IiwiT2JqZWN0SWQiLCJ0b0hleFN0cmluZyIsIl9pc0Nhbm5vdENoYW5nZUlkRXJyb3IiLCJlcnJtc2ciLCJpbmRleE9mIiwidXBzZXJ0QXN5bmMiLCJmaW5kIiwicmVzdWx0cyIsImNyZWF0ZUluZGV4QXN5bmMiLCJpbmRleCIsImNyZWF0ZUluZGV4IiwiY291bnREb2N1bWVudHMiLCJhcmciLCJlc3RpbWF0ZWREb2N1bWVudENvdW50IiwiX2xlbjIiLCJfa2V5MiIsImVuc3VyZUluZGV4QXN5bmMiLCJkcm9wSW5kZXhBc3luYyIsImluZGV4TmFtZSIsImRyb3BJbmRleCIsIm0iLCJOVU1fT1BUSU1JU1RJQ19UUklFUyIsIm1vbmdvT3B0c0ZvclVwZGF0ZSIsIm1vbmdvT3B0c0Zvckluc2VydCIsInJlcGxhY2VtZW50V2l0aElkIiwidHJpZXMiLCJkb1VwZGF0ZSIsIm1ldGhvZCIsInVwZGF0ZU1hbnkiLCJzb21lIiwicmVwbGFjZU9uZSIsInVwc2VydGVkQ291bnQiLCJ1cHNlcnRlZElkIiwiZG9Db25kaXRpb25hbEluc2VydCIsIl9vYnNlcnZlQ2hhbmdlc1RhaWxhYmxlIiwiYWRkZWRCZWZvcmUiLCJzZWxmRm9ySXRlcmF0aW9uIiwidXNlVHJhbnNmb3JtIiwiY3Vyc29yT3B0aW9ucyIsInJlYWRQcmVmZXJlbmNlIiwibnVtYmVyT2ZSZXRyaWVzIiwiZGJDdXJzb3IiLCJhZGRDdXJzb3JGbGFnIiwibWF4VGltZU1zIiwibWF4VGltZU1TIiwiaGludCIsImRvY0NhbGxiYWNrIiwidGltZW91dE1TIiwic3RvcHBlZCIsImxhc3RUUyIsImxvb3AiLCJfbmV4dE9iamVjdFByb21pc2VXaXRoVGltZW91dCIsIm5ld1NlbGVjdG9yIiwiX29ic2VydmVDaGFuZ2VzIiwiX3NlbGYkX29wbG9nSGFuZGxlIiwiZmllbGRzT3B0aW9ucyIsIm9ic2VydmVLZXkiLCJvYnNlcnZlRHJpdmVyIiwiZmlyc3RIYW5kbGUiLCJvYnNlcnZlSGFuZGxlIiwib3Bsb2dPcHRpb25zIiwiY2FuVXNlT3Bsb2ciLCJpbmNsdWRlcyIsIndhcm4iLCJNaW5pbW9uZ28iLCJNYXRjaGVyIiwiU29ydGVyIiwiZHJpdmVyQ2xhc3MiLCJfb2JzZXJ2ZURyaXZlciIsIndyaXRlQ2FsbGJhY2siLCJyZXBsYWNlTW9uZ29BdG9tV2l0aE1ldGVvciIsInJlcGxhY2VOYW1lcyIsInJlZnJlc2hFcnIiLCJkcml2ZXJSZXN1bHQiLCJtb25nb1Jlc3VsdCIsIm4iLCJtYXRjaGVkQ291bnQiLCJpc0JpbmFyeSIsIkJpbmFyeSIsIkJ1ZmZlciIsImZyb20iLCJEZWNpbWFsIiwiRGVjaW1hbDEyOCIsImZyb21TdHJpbmciLCJ0b1N0cmluZyIsIm1ha2VNb25nb0xlZ2FsIiwidG9KU09OVmFsdWUiLCJhdG9tVHJhbnNmb3JtZXIiLCJyZXBsYWNlZFRvcExldmVsQXRvbSIsInJldCIsInZhbCIsInZhbFJlcGxhY2VkIiwic3ViX3R5cGUiLCJidWZmZXIiLCJVaW50OEFycmF5IiwiZnJvbUpTT05WYWx1ZSIsInVubWFrZU1vbmdvTGVnYWwiLCJzdWJzdHIiLCJ0aGluZyIsIl9kYkN1cnNvciIsIl9zZWxmRm9ySXRlcmF0aW9uIiwiX3RyYW5zZm9ybSIsIndyYXBUcmFuc2Zvcm0iLCJfdmlzaXRlZElkcyIsIlN5bWJvbCIsImFzeW5jSXRlcmF0b3IiLCJfbmV4dE9iamVjdFByb21pc2UiLCJfcmF3TmV4dE9iamVjdFByb21pc2UiLCJuZXh0T2JqZWN0UHJvbWlzZSIsInRpbWVvdXRFcnIiLCJ0aW1lb3V0UHJvbWlzZSIsInJlamVjdCIsInJhY2UiLCJ0aGlzQXJnIiwiX3Jld2luZCIsImlkeCIsInJld2luZCIsImNvdW50IiwiQVNZTkNfQ1VSU09SX01FVEhPRFMiLCJfbW9uZ28iLCJfc3luY2hyb25vdXNDdXJzb3IiLCJjb3VudEFzeW5jIiwiZ2V0VHJhbnNmb3JtIiwiX3B1Ymxpc2hDdXJzb3IiLCJzdWIiLCJfZ2V0Q29sbGVjdGlvbk5hbWUiLCJvYnNlcnZlIiwiX29ic2VydmVGcm9tT2JzZXJ2ZUNoYW5nZXMiLCJvYnNlcnZlQXN5bmMiLCJvYnNlcnZlQ2hhbmdlcyIsIl9vYnNlcnZlQ2hhbmdlc0NhbGxiYWNrc0FyZU9yZGVyZWQiLCJvYnNlcnZlQ2hhbmdlc0FzeW5jIiwiaXRlcmF0b3IiLCJtZXRob2ROYW1lIiwic2V0dXBBc3luY2hyb25vdXNDdXJzb3IiLCJtZXRob2ROYW1lQXN5bmMiLCJMb2NhbENvbGxlY3Rpb25Ecml2ZXIiLCJub0Nvbm5Db2xsZWN0aW9ucyIsImNyZWF0ZSIsIm9wZW4iLCJjb25uIiwiZW5zdXJlQ29sbGVjdGlvbiIsIl9tb25nb19saXZlZGF0YV9jb2xsZWN0aW9ucyIsImNvbGxlY3Rpb25zIiwiUmVtb3RlQ29sbGVjdGlvbkRyaXZlciIsIm9uY2UiLCJBU1lOQ19DT0xMRUNUSU9OX01FVEhPRFMiLCJtb25nb1VybCIsIlJFTU9URV9DT0xMRUNUSU9OX01FVEhPRFMiLCJtb25nb01ldGhvZCIsImFzeW5jTWV0aG9kTmFtZSIsImRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyIiwiY29ubmVjdGlvbk9wdGlvbnMiLCJNT05HT19VUkwiLCJNT05HT19PUExPR19VUkwiLCJzdGFydHVwIiwiY29ubmVjdCIsIm5vcm1hbGl6ZVByb2plY3Rpb24iLCJBc3luY01ldGhvZHMiLCJTeW5jTWV0aG9kcyIsIkluZGV4TWV0aG9kcyIsIklEX0dFTkVSQVRPUlMiLCJub3JtYWxpemVPcHRpb25zIiwic2V0dXBBdXRvcHVibGlzaCIsInNldHVwQ29ubmVjdGlvbiIsInNldHVwRHJpdmVyIiwic2V0dXBNdXRhdGlvbk1ldGhvZHMiLCJ2YWxpZGF0ZUNvbGxlY3Rpb25OYW1lIiwiUmVwbGljYXRpb25NZXRob2RzIiwiX0lEX0dFTkVSQVRPUlMkb3B0aW9uIiwiX0lEX0dFTkVSQVRPUlMiLCJfbWFrZU5ld0lEIiwiaWRHZW5lcmF0aW9uIiwicmVzb2x2ZXJUeXBlIiwiX2Nvbm5lY3Rpb24iLCJfZHJpdmVyIiwiX2NvbGxlY3Rpb24iLCJfbmFtZSIsIl9zZXR0aW5nVXBSZXBsaWNhdGlvblByb21pc2UiLCJfbWF5YmVTZXRVcFJlcGxpY2F0aW9uIiwiX2NvbGxlY3Rpb25zIiwiX2dldEZpbmRTZWxlY3RvciIsIl9nZXRGaW5kT3B0aW9ucyIsIm5ld09wdGlvbnMiLCJPcHRpb25hbCIsIk51bWJlciIsImZhbGxiYWNrSWQiLCJfc2VsZWN0b3JJc0lkIiwiUmFuZG9tIiwiX2lzUmVtb3RlQ29sbGVjdGlvbiIsInNlcnZlciIsInJhd0RhdGFiYXNlIiwiZ2V0Q29sbGVjdGlvbiIsIk1vbmdvSUQiLCJBbGxvd0RlbnkiLCJDb2xsZWN0aW9uUHJvdG90eXBlIiwiTU9OR08iLCJzcmMiLCJERFAiLCJyYW5kb21TdHJlYW0iLCJpbnNlY3VyZSIsImhleFN0cmluZyIsIlNUUklORyIsImNvbm5lY3Rpb24iLCJpc0NsaWVudCIsImF1dG9wdWJsaXNoIiwiX3ByZXZlbnRBdXRvcHVibGlzaCIsInB1Ymxpc2giLCJpc19hdXRvIiwiZGVmaW5lTXV0YXRpb25NZXRob2RzIiwiX2RlZmluZU11dGF0aW9uTWV0aG9kcyIsInVzZUV4aXN0aW5nIiwiX3N1cHByZXNzU2FtZU5hbWVFcnJvciIsIm1ldGhvZHMiLCJtYW5hZ2VyIiwiX2luc2VydEFzeW5jIiwiZ2V0UHJvdG90eXBlT2YiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzIiwiZ2VuZXJhdGVJZCIsImVuY2xvc2luZyIsIl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbiIsImNob29zZVJldHVyblZhbHVlRnJvbUNvbGxlY3Rpb25SZXN1bHQiLCJfaXNQcm9taXNlIiwiX2NhbGxNdXRhdG9yTWV0aG9kQXN5bmMiLCJzdHViUHJvbWlzZSIsInNlcnZlclByb21pc2UiLCJMb2ciLCJkZWJ1ZyIsInJlQ3JlYXRlSW5kZXhPbk9wdGlvbk1pc21hdGNoIiwiaW5mbyIsIl9yZWdpc3RlclN0b3JlUmVzdWx0IiwiX3JlZ2lzdGVyU3RvcmVSZXN1bHQkIiwicmVnaXN0ZXJTdG9yZUNsaWVudCIsInJlZ2lzdGVyU3RvcmVTZXJ2ZXIiLCJ3cmFwcGVkU3RvcmVDb21tb24iLCJzYXZlT3JpZ2luYWxzIiwicmV0cmlldmVPcmlnaW5hbHMiLCJfZ2V0Q29sbGVjdGlvbiIsIndyYXBwZWRTdG9yZUNsaWVudCIsImJlZ2luVXBkYXRlIiwiYmF0Y2hTaXplIiwicmVzZXQiLCJwYXVzZU9ic2VydmVycyIsInVwZGF0ZSIsIm1zZyIsIm1vbmdvSWQiLCJpZFBhcnNlIiwiX2RvY3MiLCJpbnNlcnQiLCJlbmRVcGRhdGUiLCJyZXN1bWVPYnNlcnZlcnNDbGllbnQiLCJnZXREb2MiLCJmaW5kT25lIiwid3JhcHBlZFN0b3JlU2VydmVyIiwicmVzdW1lT2JzZXJ2ZXJzU2VydmVyIiwicmVnaXN0ZXJTdG9yZVJlc3VsdCIsImxvZ1dhcm4iLCJsb2ciLCJvayIsIl9pbnNlcnQiLCJ3cmFwcGVkQ2FsbGJhY2siLCJ3cmFwQ2FsbGJhY2siLCJfY2FsbE11dGF0b3JNZXRob2QiLCJfbGVuMyIsIm9wdGlvbnNBbmRDYWxsYmFjayIsIl9rZXkzIiwicG9wQ2FsbGJhY2tGcm9tQXJncyIsImNvbnZlcnRSZXN1bHQiLCJzZXRDb25uZWN0aW9uT3B0aW9ucyIsIm90aGVyT3B0aW9ucyIsIm5leHRPYnNlcnZlSGFuZGxlSWQiLCJfY2hhbmdlZCIsIl9tb3ZlZEJlZm9yZSIsIl9yZW1vdmVkIiwiYmVmb3JlIiwidGltZW91dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQUEsT0FBTyxDQUFDQyxNQUFNLENBQUM7TUFBQ0MsU0FBUyxFQUFDQSxDQUFBLEtBQUlBLFNBQVM7TUFBQ0MsY0FBYyxFQUFDQSxDQUFBLEtBQUlBO0lBQWMsQ0FBQyxDQUFDO0lBQUMsSUFBSUMsV0FBVztJQUFDSixPQUFP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Z28uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPcGxvZ0hhbmRsZSB9IGZyb20gJy4vb3Bsb2dfdGFpbGluZyc7XG5pbXBvcnQgeyBNb25nb0Nvbm5lY3Rpb24gfSBmcm9tICcuL21vbmdvX2Nvbm5lY3Rpb24nO1xuaW1wb3J0IHsgT3Bsb2dPYnNlcnZlRHJpdmVyIH0gZnJvbSAnLi9vcGxvZ19vYnNlcnZlX2RyaXZlcic7XG5pbXBvcnQgeyBNb25nb0RCIH0gZnJvbSAnLi9tb25nb19jb21tb24nO1xuXG5Nb25nb0ludGVybmFscyA9IGdsb2JhbC5Nb25nb0ludGVybmFscyA9IHt9O1xuXG5Nb25nb0ludGVybmFscy5fX3BhY2thZ2VOYW1lID0gJ21vbmdvJztcblxuTW9uZ29JbnRlcm5hbHMuTnBtTW9kdWxlcyA9IHtcbiAgbW9uZ29kYjoge1xuICAgIHZlcnNpb246IE5wbU1vZHVsZU1vbmdvZGJWZXJzaW9uLFxuICAgIG1vZHVsZTogTW9uZ29EQlxuICB9XG59O1xuXG4vLyBPbGRlciB2ZXJzaW9uIG9mIHdoYXQgaXMgbm93IGF2YWlsYWJsZSB2aWFcbi8vIE1vbmdvSW50ZXJuYWxzLk5wbU1vZHVsZXMubW9uZ29kYi5tb2R1bGUuICBJdCB3YXMgbmV2ZXIgZG9jdW1lbnRlZCwgYnV0XG4vLyBwZW9wbGUgZG8gdXNlIGl0LlxuLy8gWFhYIENPTVBBVCBXSVRIIDEuMC4zLjJcbk1vbmdvSW50ZXJuYWxzLk5wbU1vZHVsZSA9IG5ldyBQcm94eShNb25nb0RCLCB7XG4gIGdldCh0YXJnZXQsIHByb3BlcnR5S2V5LCByZWNlaXZlcikge1xuICAgIGlmIChwcm9wZXJ0eUtleSA9PT0gJ09iamVjdElEJykge1xuICAgICAgTWV0ZW9yLmRlcHJlY2F0ZShcbiAgICAgICAgYEFjY2Vzc2luZyAnTW9uZ29JbnRlcm5hbHMuTnBtTW9kdWxlLk9iamVjdElEJyBkaXJlY3RseSBpcyBkZXByZWNhdGVkLiBgICtcbiAgICAgICAgYFVzZSAnTW9uZ29JbnRlcm5hbHMuTnBtTW9kdWxlLk9iamVjdElkJyBpbnN0ZWFkLmBcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3BlcnR5S2V5LCByZWNlaXZlcik7XG4gIH0sXG59KTtcblxuTW9uZ29JbnRlcm5hbHMuT3Bsb2dIYW5kbGUgPSBPcGxvZ0hhbmRsZTtcblxuTW9uZ29JbnRlcm5hbHMuQ29ubmVjdGlvbiA9IE1vbmdvQ29ubmVjdGlvbjtcblxuTW9uZ29JbnRlcm5hbHMuT3Bsb2dPYnNlcnZlRHJpdmVyID0gT3Bsb2dPYnNlcnZlRHJpdmVyO1xuXG4vLyBUaGlzIGlzIHVzZWQgdG8gYWRkIG9yIHJlbW92ZSBFSlNPTiBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgZXZlcnl0aGluZyBuZXN0ZWRcbi8vIGluc2lkZSBhbiBFSlNPTiBjdXN0b20gdHlwZS4gSXQgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uIHB1cmUgSlNPTiFcblxuXG4vLyBFbnN1cmUgdGhhdCBFSlNPTi5jbG9uZSBrZWVwcyBhIFRpbWVzdGFtcCBhcyBhIFRpbWVzdGFtcCAoaW5zdGVhZCBvZiBqdXN0XG4vLyBkb2luZyBhIHN0cnVjdHVyYWwgY2xvbmUpLlxuLy8gWFhYIGhvdyBvayBpcyB0aGlzPyB3aGF0IGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBjb3BpZXMgb2YgTW9uZ29EQiBsb2FkZWQ/XG5Nb25nb0RCLlRpbWVzdGFtcC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIFRpbWVzdGFtcHMgc2hvdWxkIGJlIGltbXV0YWJsZS5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBMaXN0ZW4gZm9yIHRoZSBpbnZhbGlkYXRpb24gbWVzc2FnZXMgdGhhdCB3aWxsIHRyaWdnZXIgdXMgdG8gcG9sbCB0aGVcbi8vIGRhdGFiYXNlIGZvciBjaGFuZ2VzLiBJZiB0aGlzIHNlbGVjdG9yIHNwZWNpZmllcyBzcGVjaWZpYyBJRHMsIHNwZWNpZnkgdGhlbVxuLy8gaGVyZSwgc28gdGhhdCB1cGRhdGVzIHRvIGRpZmZlcmVudCBzcGVjaWZpYyBJRHMgZG9uJ3QgY2F1c2UgdXMgdG8gcG9sbC5cbi8vIGxpc3RlbkNhbGxiYWNrIGlzIHRoZSBzYW1lIGtpbmQgb2YgKG5vdGlmaWNhdGlvbiwgY29tcGxldGUpIGNhbGxiYWNrIHBhc3NlZFxuLy8gdG8gSW52YWxpZGF0aW9uQ3Jvc3NiYXIubGlzdGVuLlxuXG5leHBvcnQgY29uc3QgbGlzdGVuQWxsID0gYXN5bmMgZnVuY3Rpb24gKGN1cnNvckRlc2NyaXB0aW9uLCBsaXN0ZW5DYWxsYmFjaykge1xuICBjb25zdCBsaXN0ZW5lcnMgPSBbXTtcbiAgYXdhaXQgZm9yRWFjaFRyaWdnZXIoY3Vyc29yRGVzY3JpcHRpb24sIGZ1bmN0aW9uICh0cmlnZ2VyKSB7XG4gICAgbGlzdGVuZXJzLnB1c2goRERQU2VydmVyLl9JbnZhbGlkYXRpb25Dcm9zc2Jhci5saXN0ZW4oXG4gICAgICB0cmlnZ2VyLCBsaXN0ZW5DYWxsYmFjaykpO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICBsaXN0ZW5lci5zdG9wKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZm9yRWFjaFRyaWdnZXIgPSBhc3luYyBmdW5jdGlvbiAoY3Vyc29yRGVzY3JpcHRpb24sIHRyaWdnZXJDYWxsYmFjaykge1xuICBjb25zdCBrZXkgPSB7Y29sbGVjdGlvbjogY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWV9O1xuICBjb25zdCBzcGVjaWZpY0lkcyA9IExvY2FsQ29sbGVjdGlvbi5faWRzTWF0Y2hlZEJ5U2VsZWN0b3IoXG4gICAgY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IpO1xuICBpZiAoc3BlY2lmaWNJZHMpIHtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHNwZWNpZmljSWRzKSB7XG4gICAgICBhd2FpdCB0cmlnZ2VyQ2FsbGJhY2soT2JqZWN0LmFzc2lnbih7aWQ6IGlkfSwga2V5KSk7XG4gICAgfVxuICAgIGF3YWl0IHRyaWdnZXJDYWxsYmFjayhPYmplY3QuYXNzaWduKHtkcm9wQ29sbGVjdGlvbjogdHJ1ZSwgaWQ6IG51bGx9LCBrZXkpKTtcbiAgfSBlbHNlIHtcbiAgICBhd2FpdCB0cmlnZ2VyQ2FsbGJhY2soa2V5KTtcbiAgfVxuICAvLyBFdmVyeW9uZSBjYXJlcyBhYm91dCB0aGUgZGF0YWJhc2UgYmVpbmcgZHJvcHBlZC5cbiAgYXdhaXQgdHJpZ2dlckNhbGxiYWNrKHsgZHJvcERhdGFiYXNlOiB0cnVlIH0pO1xufTtcblxuXG5cbi8vIFhYWCBXZSBwcm9iYWJseSBuZWVkIHRvIGZpbmQgYSBiZXR0ZXIgd2F5IHRvIGV4cG9zZSB0aGlzLiBSaWdodCBub3dcbi8vIGl0J3Mgb25seSB1c2VkIGJ5IHRlc3RzLCBidXQgaW4gZmFjdCB5b3UgbmVlZCBpdCBpbiBub3JtYWxcbi8vIG9wZXJhdGlvbiB0byBpbnRlcmFjdCB3aXRoIGNhcHBlZCBjb2xsZWN0aW9ucy5cbk1vbmdvSW50ZXJuYWxzLk1vbmdvVGltZXN0YW1wID0gTW9uZ29EQi5UaW1lc3RhbXA7XG4iLCJpbXBvcnQgaXNFbXB0eSBmcm9tICdsb2Rhc2guaXNlbXB0eSc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEN1cnNvckRlc2NyaXB0aW9uIH0gZnJvbSAnLi9jdXJzb3JfZGVzY3JpcHRpb24nO1xuaW1wb3J0IHsgTW9uZ29Db25uZWN0aW9uIH0gZnJvbSAnLi9tb25nb19jb25uZWN0aW9uJztcblxuaW1wb3J0IHsgTnBtTW9kdWxlTW9uZ29kYiB9IGZyb20gXCJtZXRlb3IvbnBtLW1vbmdvXCI7XG5jb25zdCB7IExvbmcgfSA9IE5wbU1vZHVsZU1vbmdvZGI7XG5cbmV4cG9ydCBjb25zdCBPUExPR19DT0xMRUNUSU9OID0gJ29wbG9nLnJzJztcblxubGV0IFRPT19GQVJfQkVISU5EID0gKyhwcm9jZXNzLmVudi5NRVRFT1JfT1BMT0dfVE9PX0ZBUl9CRUhJTkQgfHwgMjAwMCk7XG5jb25zdCBUQUlMX1RJTUVPVVQgPSArKHByb2Nlc3MuZW52Lk1FVEVPUl9PUExPR19UQUlMX1RJTUVPVVQgfHwgMzAwMDApO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wbG9nRW50cnkge1xuICBvcDogc3RyaW5nO1xuICBvOiBhbnk7XG4gIG8yPzogYW55O1xuICB0czogYW55O1xuICBuczogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENhdGNoaW5nVXBSZXNvbHZlciB7XG4gIHRzOiBhbnk7XG4gIHJlc29sdmVyOiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9wbG9nVHJpZ2dlciB7XG4gIGRyb3BDb2xsZWN0aW9uOiBib29sZWFuO1xuICBkcm9wRGF0YWJhc2U6IGJvb2xlYW47XG4gIG9wOiBPcGxvZ0VudHJ5O1xuICBjb2xsZWN0aW9uPzogc3RyaW5nO1xuICBpZD86IHN0cmluZyB8IG51bGw7XG59XG5cbmV4cG9ydCBjbGFzcyBPcGxvZ0hhbmRsZSB7XG4gIHByaXZhdGUgX29wbG9nVXJsOiBzdHJpbmc7XG4gIHB1YmxpYyBfZGJOYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgX29wbG9nTGFzdEVudHJ5Q29ubmVjdGlvbjogTW9uZ29Db25uZWN0aW9uIHwgbnVsbDtcbiAgcHJpdmF0ZSBfb3Bsb2dUYWlsQ29ubmVjdGlvbjogTW9uZ29Db25uZWN0aW9uIHwgbnVsbDtcbiAgcHJpdmF0ZSBfb3Bsb2dPcHRpb25zOiB7IGV4Y2x1ZGVDb2xsZWN0aW9ucz86IHN0cmluZ1tdOyBpbmNsdWRlQ29sbGVjdGlvbnM/OiBzdHJpbmdbXSB9IHwgbnVsbDtcbiAgcHJpdmF0ZSBfc3RvcHBlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfdGFpbEhhbmRsZTogYW55O1xuICBwcml2YXRlIF9yZWFkeVByb21pc2VSZXNvbHZlcjogKCgpID0+IHZvaWQpIHwgbnVsbDtcbiAgcHJpdmF0ZSBfcmVhZHlQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuICBwdWJsaWMgX2Nyb3NzYmFyOiBhbnk7XG4gIHByaXZhdGUgX2Jhc2VPcGxvZ1NlbGVjdG9yOiBhbnk7XG4gIHByaXZhdGUgX2NhdGNoaW5nVXBSZXNvbHZlcnM6IENhdGNoaW5nVXBSZXNvbHZlcltdO1xuICBwcml2YXRlIF9sYXN0UHJvY2Vzc2VkVFM6IGFueTtcbiAgcHJpdmF0ZSBfb25Ta2lwcGVkRW50cmllc0hvb2s6IGFueTtcbiAgcHJpdmF0ZSBfc3RhcnRUcmFpbGluZ1Byb21pc2U6IFByb21pc2U8dm9pZD47XG4gIHByaXZhdGUgX3Jlc29sdmVUaW1lb3V0OiBhbnk7XG5cbiAgcHJpdmF0ZSBfZW50cnlRdWV1ZSA9IG5ldyBNZXRlb3IuX0RvdWJsZUVuZGVkUXVldWUoKTtcbiAgcHJpdmF0ZSBfd29ya2VyQWN0aXZlID0gZmFsc2U7XG4gIHByaXZhdGUgX3dvcmtlclByb21pc2U6IFByb21pc2U8dm9pZD4gfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihvcGxvZ1VybDogc3RyaW5nLCBkYk5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX29wbG9nVXJsID0gb3Bsb2dVcmw7XG4gICAgdGhpcy5fZGJOYW1lID0gZGJOYW1lO1xuXG4gICAgdGhpcy5fcmVzb2x2ZVRpbWVvdXQgPSBudWxsO1xuICAgIHRoaXMuX29wbG9nTGFzdEVudHJ5Q29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fb3Bsb2dUYWlsQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fb3Bsb2dPcHRpb25zID0gbnVsbDtcbiAgICB0aGlzLl9zdG9wcGVkID0gZmFsc2U7XG4gICAgdGhpcy5fdGFpbEhhbmRsZSA9IG51bGw7XG4gICAgdGhpcy5fcmVhZHlQcm9taXNlUmVzb2x2ZXIgPSBudWxsO1xuICAgIHRoaXMuX3JlYWR5UHJvbWlzZSA9IG5ldyBQcm9taXNlKHIgPT4gdGhpcy5fcmVhZHlQcm9taXNlUmVzb2x2ZXIgPSByKTtcbiAgICB0aGlzLl9jcm9zc2JhciA9IG5ldyBERFBTZXJ2ZXIuX0Nyb3NzYmFyKHtcbiAgICAgIGZhY3RQYWNrYWdlOiBcIm1vbmdvLWxpdmVkYXRhXCIsIGZhY3ROYW1lOiBcIm9wbG9nLXdhdGNoZXJzXCJcbiAgICB9KTtcbiAgICB0aGlzLl9iYXNlT3Bsb2dTZWxlY3RvciA9IHtcbiAgICAgIG5zOiBuZXcgUmVnRXhwKFwiXig/OlwiICsgW1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIE1ldGVvci5fZXNjYXBlUmVnRXhwKHRoaXMuX2RiTmFtZSArIFwiLlwiKSxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBNZXRlb3IuX2VzY2FwZVJlZ0V4cChcImFkbWluLiRjbWRcIiksXG4gICAgICBdLmpvaW4oXCJ8XCIpICsgXCIpXCIpLFxuXG4gICAgICAkb3I6IFtcbiAgICAgICAgeyBvcDogeyAkaW46IFsnaScsICd1JywgJ2QnXSB9IH0sXG4gICAgICAgIHsgb3A6ICdjJywgJ28uZHJvcCc6IHsgJGV4aXN0czogdHJ1ZSB9IH0sXG4gICAgICAgIHsgb3A6ICdjJywgJ28uZHJvcERhdGFiYXNlJzogMSB9LFxuICAgICAgICB7IG9wOiAnYycsICdvLmFwcGx5T3BzJzogeyAkZXhpc3RzOiB0cnVlIH0gfSxcbiAgICAgIF1cbiAgICB9O1xuXG4gICAgdGhpcy5fY2F0Y2hpbmdVcFJlc29sdmVycyA9IFtdO1xuICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRUUyA9IG51bGw7XG5cbiAgICB0aGlzLl9vblNraXBwZWRFbnRyaWVzSG9vayA9IG5ldyBIb29rKHtcbiAgICAgIGRlYnVnUHJpbnRFeGNlcHRpb25zOiBcIm9uU2tpcHBlZEVudHJpZXMgY2FsbGJhY2tcIlxuICAgIH0pO1xuXG4gICAgdGhpcy5fc3RhcnRUcmFpbGluZ1Byb21pc2UgPSB0aGlzLl9zdGFydFRhaWxpbmcoKTtcbiAgfVxuXG4gIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcbiAgICB0aGlzLl9zdG9wcGVkID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5fdGFpbEhhbmRsZSkge1xuICAgICAgYXdhaXQgdGhpcy5fdGFpbEhhbmRsZS5zdG9wKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX29uT3Bsb2dFbnRyeSh0cmlnZ2VyOiBPcGxvZ1RyaWdnZXIsIGNhbGxiYWNrOiBGdW5jdGlvbik6IFByb21pc2U8eyBzdG9wOiAoKSA9PiBQcm9taXNlPHZvaWQ+IH0+IHtcbiAgICBpZiAodGhpcy5fc3RvcHBlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGVkIG9uT3Bsb2dFbnRyeSBvbiBzdG9wcGVkIGhhbmRsZSFcIik7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5fcmVhZHlQcm9taXNlO1xuXG4gICAgY29uc3Qgb3JpZ2luYWxDYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBkZXBlbmRzIG9uIEFzeW5jaHJvbm91c1F1ZXVlIHRhc2tzIGJlaW5nIHdyYXBwZWQgaW4gYGJpbmRFbnZpcm9ubWVudGAgdG9vLlxuICAgICAqXG4gICAgICogQHRvZG8gQ2hlY2sgYWZ0ZXIgd2Ugc2ltcGxpZnkgdGhlIGBiaW5kRW52aXJvbm1lbnRgIGltcGxlbWVudGF0aW9uIGlmIHdlIGNhbiByZW1vdmUgdGhlIHNlY29uZCB3cmFwLlxuICAgICAqL1xuICAgIGNhbGxiYWNrID0gTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChcbiAgICAgIGZ1bmN0aW9uIChub3RpZmljYXRpb246IGFueSkge1xuICAgICAgICBvcmlnaW5hbENhbGxiYWNrKG5vdGlmaWNhdGlvbik7XG4gICAgICB9LFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgZnVuY3Rpb24gKGVycikge1xuICAgICAgICBNZXRlb3IuX2RlYnVnKFwiRXJyb3IgaW4gb3Bsb2cgY2FsbGJhY2tcIiwgZXJyKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgbGlzdGVuSGFuZGxlID0gdGhpcy5fY3Jvc3NiYXIubGlzdGVuKHRyaWdnZXIsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4ge1xuICAgICAgc3RvcDogYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICBhd2FpdCBsaXN0ZW5IYW5kbGUuc3RvcCgpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBvbk9wbG9nRW50cnkodHJpZ2dlcjogT3Bsb2dUcmlnZ2VyLCBjYWxsYmFjazogRnVuY3Rpb24pOiBQcm9taXNlPHsgc3RvcDogKCkgPT4gUHJvbWlzZTx2b2lkPiB9PiB7XG4gICAgcmV0dXJuIHRoaXMuX29uT3Bsb2dFbnRyeSh0cmlnZ2VyLCBjYWxsYmFjayk7XG4gIH1cblxuICBvblNraXBwZWRFbnRyaWVzKGNhbGxiYWNrOiBGdW5jdGlvbik6IHsgc3RvcDogKCkgPT4gdm9pZCB9IHtcbiAgICBpZiAodGhpcy5fc3RvcHBlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGVkIG9uU2tpcHBlZEVudHJpZXMgb24gc3RvcHBlZCBoYW5kbGUhXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb25Ta2lwcGVkRW50cmllc0hvb2sucmVnaXN0ZXIoY2FsbGJhY2spO1xuICB9XG5cbiAgYXN5bmMgX3dhaXRVbnRpbENhdWdodFVwKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9zdG9wcGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsZWQgd2FpdFVudGlsQ2F1Z2h0VXAgb24gc3RvcHBlZCBoYW5kbGUhXCIpO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuX3JlYWR5UHJvbWlzZTtcblxuICAgIGxldCBsYXN0RW50cnk6IE9wbG9nRW50cnkgfCBudWxsID0gbnVsbDtcblxuICAgIHdoaWxlICghdGhpcy5fc3RvcHBlZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGFzdEVudHJ5ID0gYXdhaXQgdGhpcy5fb3Bsb2dMYXN0RW50cnlDb25uZWN0aW9uLmZpbmRPbmVBc3luYyhcbiAgICAgICAgICBPUExPR19DT0xMRUNUSU9OLFxuICAgICAgICAgIHRoaXMuX2Jhc2VPcGxvZ1NlbGVjdG9yLFxuICAgICAgICAgIHsgcHJvamVjdGlvbjogeyB0czogMSB9LCBzb3J0OiB7ICRuYXR1cmFsOiAtMSB9IH1cbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIE1ldGVvci5fZGVidWcoXCJHb3QgZXhjZXB0aW9uIHdoaWxlIHJlYWRpbmcgbGFzdCBlbnRyeVwiLCBlKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBhd2FpdCBNZXRlb3Iuc2xlZXAoMTAwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fc3RvcHBlZCkgcmV0dXJuO1xuXG4gICAgaWYgKCFsYXN0RW50cnkpIHJldHVybjtcblxuICAgIGNvbnN0IHRzID0gbGFzdEVudHJ5LnRzO1xuICAgIGlmICghdHMpIHtcbiAgICAgIHRocm93IEVycm9yKFwib3Bsb2cgZW50cnkgd2l0aG91dCB0czogXCIgKyBKU09OLnN0cmluZ2lmeShsYXN0RW50cnkpKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGFzdFByb2Nlc3NlZFRTICYmIHRzLmxlc3NUaGFuT3JFcXVhbCh0aGlzLl9sYXN0UHJvY2Vzc2VkVFMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGluc2VydEFmdGVyID0gdGhpcy5fY2F0Y2hpbmdVcFJlc29sdmVycy5sZW5ndGg7XG5cbiAgICB3aGlsZSAoaW5zZXJ0QWZ0ZXIgLSAxID4gMCAmJiB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzW2luc2VydEFmdGVyIC0gMV0udHMuZ3JlYXRlclRoYW4odHMpKSB7XG4gICAgICBpbnNlcnRBZnRlci0tO1xuICAgIH1cblxuICAgIGxldCBwcm9taXNlUmVzb2x2ZXIgPSBudWxsO1xuXG4gICAgY29uc3QgcHJvbWlzZVRvQXdhaXQgPSBuZXcgUHJvbWlzZShyID0+IHByb21pc2VSZXNvbHZlciA9IHIpO1xuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3Jlc29sdmVUaW1lb3V0KTtcblxuICAgIHRoaXMuX3Jlc29sdmVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTWV0ZW9yOiBvcGxvZyBjYXRjaGluZyB1cCB0b29rIHRvbyBsb25nXCIsIHsgdHMgfSk7XG4gICAgfSwgMTAwMDApO1xuXG4gICAgdGhpcy5fY2F0Y2hpbmdVcFJlc29sdmVycy5zcGxpY2UoaW5zZXJ0QWZ0ZXIsIDAsIHsgdHMsIHJlc29sdmVyOiBwcm9taXNlUmVzb2x2ZXIhIH0pO1xuXG4gICAgYXdhaXQgcHJvbWlzZVRvQXdhaXQ7XG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVzb2x2ZVRpbWVvdXQpO1xuICB9XG5cbiAgYXN5bmMgd2FpdFVudGlsQ2F1Z2h0VXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3dhaXRVbnRpbENhdWdodFVwKCk7XG4gIH1cblxuICBhc3luYyBfc3RhcnRUYWlsaW5nKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG1vbmdvZGJVcmkgPSByZXF1aXJlKCdtb25nb2RiLXVyaScpO1xuICAgIGlmIChtb25nb2RiVXJpLnBhcnNlKHRoaXMuX29wbG9nVXJsKS5kYXRhYmFzZSAhPT0gJ2xvY2FsJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJE1PTkdPX09QTE9HX1VSTCBtdXN0IGJlIHNldCB0byB0aGUgJ2xvY2FsJyBkYXRhYmFzZSBvZiBhIE1vbmdvIHJlcGxpY2Egc2V0XCIpO1xuICAgIH1cblxuICAgIHRoaXMuX29wbG9nVGFpbENvbm5lY3Rpb24gPSBuZXcgTW9uZ29Db25uZWN0aW9uKFxuICAgICAgdGhpcy5fb3Bsb2dVcmwsIHsgbWF4UG9vbFNpemU6IDEsIG1pblBvb2xTaXplOiAxIH1cbiAgICApO1xuICAgIHRoaXMuX29wbG9nTGFzdEVudHJ5Q29ubmVjdGlvbiA9IG5ldyBNb25nb0Nvbm5lY3Rpb24oXG4gICAgICB0aGlzLl9vcGxvZ1VybCwgeyBtYXhQb29sU2l6ZTogMSwgbWluUG9vbFNpemU6IDEgfVxuICAgICk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgaXNNYXN0ZXJEb2MgPSBhd2FpdCB0aGlzLl9vcGxvZ0xhc3RFbnRyeUNvbm5lY3Rpb24hLmRiXG4gICAgICAgIC5hZG1pbigpXG4gICAgICAgIC5jb21tYW5kKHsgaXNtYXN0ZXI6IDEgfSk7XG5cbiAgICAgIGlmICghKGlzTWFzdGVyRG9jICYmIGlzTWFzdGVyRG9jLnNldE5hbWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIiRNT05HT19PUExPR19VUkwgbXVzdCBiZSBzZXQgdG8gdGhlICdsb2NhbCcgZGF0YWJhc2Ugb2YgYSBNb25nbyByZXBsaWNhIHNldFwiKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbGFzdE9wbG9nRW50cnkgPSBhd2FpdCB0aGlzLl9vcGxvZ0xhc3RFbnRyeUNvbm5lY3Rpb24uZmluZE9uZUFzeW5jKFxuICAgICAgICBPUExPR19DT0xMRUNUSU9OLFxuICAgICAgICB7fSxcbiAgICAgICAgeyBzb3J0OiB7ICRuYXR1cmFsOiAtMSB9LCBwcm9qZWN0aW9uOiB7IHRzOiAxIH0gfVxuICAgICAgKTtcblxuICAgICAgbGV0IG9wbG9nU2VsZWN0b3I6IGFueSA9IHsgLi4udGhpcy5fYmFzZU9wbG9nU2VsZWN0b3IgfTtcbiAgICAgIGlmIChsYXN0T3Bsb2dFbnRyeSkge1xuICAgICAgICBvcGxvZ1NlbGVjdG9yLnRzID0geyAkZ3Q6IGxhc3RPcGxvZ0VudHJ5LnRzIH07XG4gICAgICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRUUyA9IGxhc3RPcGxvZ0VudHJ5LnRzO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbmNsdWRlQ29sbGVjdGlvbnMgPSBNZXRlb3Iuc2V0dGluZ3M/LnBhY2thZ2VzPy5tb25nbz8ub3Bsb2dJbmNsdWRlQ29sbGVjdGlvbnM7XG4gICAgICBjb25zdCBleGNsdWRlQ29sbGVjdGlvbnMgPSBNZXRlb3Iuc2V0dGluZ3M/LnBhY2thZ2VzPy5tb25nbz8ub3Bsb2dFeGNsdWRlQ29sbGVjdGlvbnM7XG5cbiAgICAgIGlmIChpbmNsdWRlQ29sbGVjdGlvbnM/Lmxlbmd0aCAmJiBleGNsdWRlQ29sbGVjdGlvbnM/Lmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCB1c2UgYm90aCBtb25nbyBvcGxvZyBzZXR0aW5ncyBvcGxvZ0luY2x1ZGVDb2xsZWN0aW9ucyBhbmQgb3Bsb2dFeGNsdWRlQ29sbGVjdGlvbnMgYXQgdGhlIHNhbWUgdGltZS5cIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChleGNsdWRlQ29sbGVjdGlvbnM/Lmxlbmd0aCkge1xuICAgICAgICBvcGxvZ1NlbGVjdG9yLm5zID0ge1xuICAgICAgICAgICRyZWdleDogb3Bsb2dTZWxlY3Rvci5ucyxcbiAgICAgICAgICAkbmluOiBleGNsdWRlQ29sbGVjdGlvbnMubWFwKChjb2xsTmFtZTogc3RyaW5nKSA9PiBgJHt0aGlzLl9kYk5hbWV9LiR7Y29sbE5hbWV9YClcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fb3Bsb2dPcHRpb25zID0geyBleGNsdWRlQ29sbGVjdGlvbnMgfTtcbiAgICAgIH0gZWxzZSBpZiAoaW5jbHVkZUNvbGxlY3Rpb25zPy5sZW5ndGgpIHtcbiAgICAgICAgb3Bsb2dTZWxlY3RvciA9IHtcbiAgICAgICAgICAkYW5kOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICRvcjogW1xuICAgICAgICAgICAgICAgIHsgbnM6IC9eYWRtaW5cXC5cXCRjbWQvIH0sXG4gICAgICAgICAgICAgICAgeyBuczogeyAkaW46IGluY2x1ZGVDb2xsZWN0aW9ucy5tYXAoKGNvbGxOYW1lOiBzdHJpbmcpID0+IGAke3RoaXMuX2RiTmFtZX0uJHtjb2xsTmFtZX1gKSB9IH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgJG9yOiBvcGxvZ1NlbGVjdG9yLiRvciB9LFxuICAgICAgICAgICAgeyB0czogb3Bsb2dTZWxlY3Rvci50cyB9XG4gICAgICAgICAgXVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9vcGxvZ09wdGlvbnMgPSB7IGluY2x1ZGVDb2xsZWN0aW9ucyB9O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjdXJzb3JEZXNjcmlwdGlvbiA9IG5ldyBDdXJzb3JEZXNjcmlwdGlvbihcbiAgICAgICAgT1BMT0dfQ09MTEVDVElPTixcbiAgICAgICAgb3Bsb2dTZWxlY3RvcixcbiAgICAgICAgeyB0YWlsYWJsZTogdHJ1ZSB9XG4gICAgICApO1xuXG4gICAgICB0aGlzLl90YWlsSGFuZGxlID0gdGhpcy5fb3Bsb2dUYWlsQ29ubmVjdGlvbi50YWlsKFxuICAgICAgICBjdXJzb3JEZXNjcmlwdGlvbixcbiAgICAgICAgKGRvYzogYW55KSA9PiB7XG4gICAgICAgICAgdGhpcy5fZW50cnlRdWV1ZS5wdXNoKGRvYyk7XG4gICAgICAgICAgdGhpcy5fbWF5YmVTdGFydFdvcmtlcigpO1xuICAgICAgICB9LFxuICAgICAgICBUQUlMX1RJTUVPVVRcbiAgICAgICk7XG5cbiAgICAgIHRoaXMuX3JlYWR5UHJvbWlzZVJlc29sdmVyISgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBfc3RhcnRUYWlsaW5nOicsIGVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX21heWJlU3RhcnRXb3JrZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3dvcmtlclByb21pc2UpIHJldHVybjtcbiAgICB0aGlzLl93b3JrZXJBY3RpdmUgPSB0cnVlO1xuXG4gICAgLy8gQ29udmVydCB0byBhIHByb3BlciBwcm9taXNlLWJhc2VkIHF1ZXVlIHByb2Nlc3NvclxuICAgIHRoaXMuX3dvcmtlclByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgd2hpbGUgKCF0aGlzLl9zdG9wcGVkICYmICF0aGlzLl9lbnRyeVF1ZXVlLmlzRW1wdHkoKSkge1xuICAgICAgICAgIC8vIEFyZSB3ZSB0b28gZmFyIGJlaGluZD8gSnVzdCB0ZWxsIG91ciBvYnNlcnZlcnMgdGhhdCB0aGV5IG5lZWQgdG9cbiAgICAgICAgICAvLyByZXBvbGwsIGFuZCBkcm9wIG91ciBxdWV1ZS5cbiAgICAgICAgICBpZiAodGhpcy5fZW50cnlRdWV1ZS5sZW5ndGggPiBUT09fRkFSX0JFSElORCkge1xuICAgICAgICAgICAgY29uc3QgbGFzdEVudHJ5ID0gdGhpcy5fZW50cnlRdWV1ZS5wb3AoKTtcbiAgICAgICAgICAgIHRoaXMuX2VudHJ5UXVldWUuY2xlYXIoKTtcblxuICAgICAgICAgICAgdGhpcy5fb25Ta2lwcGVkRW50cmllc0hvb2suZWFjaCgoY2FsbGJhY2s6IEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIEZyZWUgYW55IHdhaXRVbnRpbENhdWdodFVwKCkgY2FsbHMgdGhhdCB3ZXJlIHdhaXRpbmcgZm9yIHVzIHRvXG4gICAgICAgICAgICAvLyBwYXNzIHNvbWV0aGluZyB0aGF0IHdlIGp1c3Qgc2tpcHBlZC5cbiAgICAgICAgICAgIHRoaXMuX3NldExhc3RQcm9jZXNzZWRUUyhsYXN0RW50cnkudHMpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUHJvY2VzcyBuZXh0IGJhdGNoIGZyb20gdGhlIHF1ZXVlXG4gICAgICAgICAgY29uc3QgZG9jID0gdGhpcy5fZW50cnlRdWV1ZS5zaGlmdCgpO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZURvYyh0aGlzLCBkb2MpO1xuICAgICAgICAgICAgLy8gUHJvY2VzcyBhbnkgd2FpdGluZyBmZW5jZSBjYWxsYmFja3NcbiAgICAgICAgICAgIGlmIChkb2MudHMpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc2V0TGFzdFByb2Nlc3NlZFRTKGRvYy50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gS2VlcCBwcm9jZXNzaW5nIHF1ZXVlIGV2ZW4gaWYgb25lIGVudHJ5IGZhaWxzXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBwcm9jZXNzaW5nIG9wbG9nIGVudHJ5OicsIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5fd29ya2VyUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3dvcmtlckFjdGl2ZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pKCk7XG4gIH1cblxuICBfc2V0TGFzdFByb2Nlc3NlZFRTKHRzOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLl9sYXN0UHJvY2Vzc2VkVFMgPSB0cztcbiAgICB3aGlsZSAoIWlzRW1wdHkodGhpcy5fY2F0Y2hpbmdVcFJlc29sdmVycykgJiYgdGhpcy5fY2F0Y2hpbmdVcFJlc29sdmVyc1swXS50cy5sZXNzVGhhbk9yRXF1YWwodGhpcy5fbGFzdFByb2Nlc3NlZFRTKSkge1xuICAgICAgY29uc3Qgc2VxdWVuY2VyID0gdGhpcy5fY2F0Y2hpbmdVcFJlc29sdmVycy5zaGlmdCgpITtcbiAgICAgIHNlcXVlbmNlci5yZXNvbHZlcigpO1xuICAgIH1cbiAgfVxuXG4gIF9kZWZpbmVUb29GYXJCZWhpbmQodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgIFRPT19GQVJfQkVISU5EID0gdmFsdWU7XG4gIH1cblxuICBfcmVzZXRUb29GYXJCZWhpbmQoKTogdm9pZCB7XG4gICAgVE9PX0ZBUl9CRUhJTkQgPSArKHByb2Nlc3MuZW52Lk1FVEVPUl9PUExPR19UT09fRkFSX0JFSElORCB8fCAyMDAwKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaWRGb3JPcChvcDogT3Bsb2dFbnRyeSk6IHN0cmluZyB7XG4gIGlmIChvcC5vcCA9PT0gJ2QnIHx8IG9wLm9wID09PSAnaScpIHtcbiAgICByZXR1cm4gb3Auby5faWQ7XG4gIH0gZWxzZSBpZiAob3Aub3AgPT09ICd1Jykge1xuICAgIHJldHVybiBvcC5vMi5faWQ7XG4gIH0gZWxzZSBpZiAob3Aub3AgPT09ICdjJykge1xuICAgIHRocm93IEVycm9yKFwiT3BlcmF0b3IgJ2MnIGRvZXNuJ3Qgc3VwcGx5IGFuIG9iamVjdCB3aXRoIGlkOiBcIiArIEpTT04uc3RyaW5naWZ5KG9wKSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgRXJyb3IoXCJVbmtub3duIG9wOiBcIiArIEpTT04uc3RyaW5naWZ5KG9wKSk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRG9jKGhhbmRsZTogT3Bsb2dIYW5kbGUsIGRvYzogT3Bsb2dFbnRyeSk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoZG9jLm5zID09PSBcImFkbWluLiRjbWRcIikge1xuICAgIGlmIChkb2Muby5hcHBseU9wcykge1xuICAgICAgLy8gVGhpcyB3YXMgYSBzdWNjZXNzZnVsIHRyYW5zYWN0aW9uLCBzbyB3ZSBuZWVkIHRvIGFwcGx5IHRoZVxuICAgICAgLy8gb3BlcmF0aW9ucyB0aGF0IHdlcmUgaW52b2x2ZWQuXG4gICAgICBsZXQgbmV4dFRpbWVzdGFtcCA9IGRvYy50cztcbiAgICAgIGZvciAoY29uc3Qgb3Agb2YgZG9jLm8uYXBwbHlPcHMpIHtcbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2lzc3Vlcy8xMDQyMC5cbiAgICAgICAgaWYgKCFvcC50cykge1xuICAgICAgICAgIG9wLnRzID0gbmV4dFRpbWVzdGFtcDtcbiAgICAgICAgICBuZXh0VGltZXN0YW1wID0gbmV4dFRpbWVzdGFtcC5hZGQoTG9uZy5PTkUpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IGhhbmRsZURvYyhoYW5kbGUsIG9wKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBjb21tYW5kIFwiICsgSlNPTi5zdHJpbmdpZnkoZG9jKSk7XG4gIH1cblxuICBjb25zdCB0cmlnZ2VyOiBPcGxvZ1RyaWdnZXIgPSB7XG4gICAgZHJvcENvbGxlY3Rpb246IGZhbHNlLFxuICAgIGRyb3BEYXRhYmFzZTogZmFsc2UsXG4gICAgb3A6IGRvYyxcbiAgfTtcblxuICBpZiAodHlwZW9mIGRvYy5ucyA9PT0gXCJzdHJpbmdcIiAmJiBkb2MubnMuc3RhcnRzV2l0aChoYW5kbGUuX2RiTmFtZSArIFwiLlwiKSkge1xuICAgIHRyaWdnZXIuY29sbGVjdGlvbiA9IGRvYy5ucy5zbGljZShoYW5kbGUuX2RiTmFtZS5sZW5ndGggKyAxKTtcbiAgfVxuXG4gIC8vIElzIGl0IGEgc3BlY2lhbCBjb21tYW5kIGFuZCB0aGUgY29sbGVjdGlvbiBuYW1lIGlzIGhpZGRlblxuICAvLyBzb21ld2hlcmUgaW4gb3BlcmF0b3I/XG4gIGlmICh0cmlnZ2VyLmNvbGxlY3Rpb24gPT09IFwiJGNtZFwiKSB7XG4gICAgaWYgKGRvYy5vLmRyb3BEYXRhYmFzZSkge1xuICAgICAgZGVsZXRlIHRyaWdnZXIuY29sbGVjdGlvbjtcbiAgICAgIHRyaWdnZXIuZHJvcERhdGFiYXNlID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKFwiZHJvcFwiIGluIGRvYy5vKSB7XG4gICAgICB0cmlnZ2VyLmNvbGxlY3Rpb24gPSBkb2Muby5kcm9wO1xuICAgICAgdHJpZ2dlci5kcm9wQ29sbGVjdGlvbiA9IHRydWU7XG4gICAgICB0cmlnZ2VyLmlkID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKFwiY3JlYXRlXCIgaW4gZG9jLm8gJiYgXCJpZEluZGV4XCIgaW4gZG9jLm8pIHtcbiAgICAgIC8vIEEgY29sbGVjdGlvbiBnb3QgaW1wbGljaXRseSBjcmVhdGVkIHdpdGhpbiBhIHRyYW5zYWN0aW9uLiBUaGVyZSdzXG4gICAgICAvLyBubyBuZWVkIHRvIGRvIGFueXRoaW5nIGFib3V0IGl0LlxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcihcIlVua25vd24gY29tbWFuZCBcIiArIEpTT04uc3RyaW5naWZ5KGRvYykpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBBbGwgb3RoZXIgb3BzIGhhdmUgYW4gaWQuXG4gICAgdHJpZ2dlci5pZCA9IGlkRm9yT3AoZG9jKTtcbiAgfVxuXG4gIGF3YWl0IGhhbmRsZS5fY3Jvc3NiYXIuZmlyZSh0cmlnZ2VyKTtcblxuICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldEltbWVkaWF0ZShyZXNvbHZlKSk7XG59IiwiaW1wb3J0IGlzRW1wdHkgZnJvbSAnbG9kYXNoLmlzZW1wdHknO1xuaW1wb3J0IHsgT2JzZXJ2ZUhhbmRsZSB9IGZyb20gJy4vb2JzZXJ2ZV9oYW5kbGUnO1xuXG5pbnRlcmZhY2UgT2JzZXJ2ZU11bHRpcGxleGVyT3B0aW9ucyB7XG4gIG9yZGVyZWQ6IGJvb2xlYW47XG4gIG9uU3RvcD86ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCB0eXBlIE9ic2VydmVIYW5kbGVDYWxsYmFjayA9ICdhZGRlZCcgfCAnYWRkZWRCZWZvcmUnIHwgJ2NoYW5nZWQnIHwgJ21vdmVkQmVmb3JlJyB8ICdyZW1vdmVkJztcblxuLyoqXG4gKiBBbGxvd3MgbXVsdGlwbGUgaWRlbnRpY2FsIE9ic2VydmVIYW5kbGVzIHRvIGJlIGRyaXZlbiBieSBhIHNpbmdsZSBvYnNlcnZlIGRyaXZlci5cbiAqXG4gKiBUaGlzIG9wdGltaXphdGlvbiBlbnN1cmVzIHRoYXQgbXVsdGlwbGUgaWRlbnRpY2FsIG9ic2VydmF0aW9uc1xuICogZG9uJ3QgcmVzdWx0IGluIGR1cGxpY2F0ZSBkYXRhYmFzZSBxdWVyaWVzLlxuICovXG5leHBvcnQgY2xhc3MgT2JzZXJ2ZU11bHRpcGxleGVyIHtcbiAgcHJpdmF0ZSByZWFkb25seSBfb3JkZXJlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSByZWFkb25seSBfb25TdG9wOiAoKSA9PiB2b2lkO1xuICBwcml2YXRlIF9xdWV1ZTogYW55O1xuICBwcml2YXRlIF9oYW5kbGVzOiB7IFtrZXk6IHN0cmluZ106IE9ic2VydmVIYW5kbGUgfSB8IG51bGw7XG4gIHByaXZhdGUgX3Jlc29sdmVyOiAoKHZhbHVlPzogdW5rbm93bikgPT4gdm9pZCkgfCBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IF9yZWFkeVByb21pc2U6IFByb21pc2U8Ym9vbGVhbiB8IHZvaWQ+O1xuICBwcml2YXRlIF9pc1JlYWR5OiBib29sZWFuO1xuICBwcml2YXRlIF9jYWNoZTogYW55O1xuICBwcml2YXRlIF9hZGRIYW5kbGVUYXNrc1NjaGVkdWxlZEJ1dE5vdFBlcmZvcm1lZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHsgb3JkZXJlZCwgb25TdG9wID0gKCkgPT4ge30gfTogT2JzZXJ2ZU11bHRpcGxleGVyT3B0aW9ucykge1xuICAgIGlmIChvcmRlcmVkID09PSB1bmRlZmluZWQpIHRocm93IEVycm9yKFwibXVzdCBzcGVjaWZ5IG9yZGVyZWRcIik7XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgUGFja2FnZVsnZmFjdHMtYmFzZSddICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXVxuICAgICAgICAuRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdChcIm1vbmdvLWxpdmVkYXRhXCIsIFwib2JzZXJ2ZS1tdWx0aXBsZXhlcnNcIiwgMSk7XG5cbiAgICB0aGlzLl9vcmRlcmVkID0gb3JkZXJlZDtcbiAgICB0aGlzLl9vblN0b3AgPSBvblN0b3A7XG4gICAgdGhpcy5fcXVldWUgPSBuZXcgTWV0ZW9yLl9Bc3luY2hyb25vdXNRdWV1ZSgpO1xuICAgIHRoaXMuX2hhbmRsZXMgPSB7fTtcbiAgICB0aGlzLl9yZXNvbHZlciA9IG51bGw7XG4gICAgdGhpcy5faXNSZWFkeSA9IGZhbHNlO1xuICAgIHRoaXMuX3JlYWR5UHJvbWlzZSA9IG5ldyBQcm9taXNlKHIgPT4gdGhpcy5fcmVzb2x2ZXIgPSByKS50aGVuKCgpID0+IHRoaXMuX2lzUmVhZHkgPSB0cnVlKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy5fY2FjaGUgPSBuZXcgTG9jYWxDb2xsZWN0aW9uLl9DYWNoaW5nQ2hhbmdlT2JzZXJ2ZXIoeyBvcmRlcmVkIH0pO1xuICAgIHRoaXMuX2FkZEhhbmRsZVRhc2tzU2NoZWR1bGVkQnV0Tm90UGVyZm9ybWVkID0gMDtcblxuICAgIHRoaXMuY2FsbGJhY2tOYW1lcygpLmZvckVhY2goY2FsbGJhY2tOYW1lID0+IHtcbiAgICAgICh0aGlzIGFzIGFueSlbY2FsbGJhY2tOYW1lXSA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICB0aGlzLl9hcHBseUNhbGxiYWNrKGNhbGxiYWNrTmFtZSwgYXJncyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYWRkSGFuZGxlQW5kU2VuZEluaXRpYWxBZGRzKGhhbmRsZTogT2JzZXJ2ZUhhbmRsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9hZGRIYW5kbGVBbmRTZW5kSW5pdGlhbEFkZHMoaGFuZGxlKTtcbiAgfVxuXG4gIGFzeW5jIF9hZGRIYW5kbGVBbmRTZW5kSW5pdGlhbEFkZHMoaGFuZGxlOiBPYnNlcnZlSGFuZGxlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgKyt0aGlzLl9hZGRIYW5kbGVUYXNrc1NjaGVkdWxlZEJ1dE5vdFBlcmZvcm1lZDtcblxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBQYWNrYWdlWydmYWN0cy1iYXNlJ10gJiYgUGFja2FnZVsnZmFjdHMtYmFzZSddLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgICBcIm1vbmdvLWxpdmVkYXRhXCIsIFwib2JzZXJ2ZS1oYW5kbGVzXCIsIDEpO1xuXG4gICAgYXdhaXQgdGhpcy5fcXVldWUucnVuVGFzayhhc3luYyAoKSA9PiB7XG4gICAgICB0aGlzLl9oYW5kbGVzIVtoYW5kbGUuX2lkXSA9IGhhbmRsZTtcbiAgICAgIGF3YWl0IHRoaXMuX3NlbmRBZGRzKGhhbmRsZSk7XG4gICAgICAtLXRoaXMuX2FkZEhhbmRsZVRhc2tzU2NoZWR1bGVkQnV0Tm90UGVyZm9ybWVkO1xuICAgIH0pO1xuICAgIGF3YWl0IHRoaXMuX3JlYWR5UHJvbWlzZTtcbiAgfVxuXG4gIGFzeW5jIHJlbW92ZUhhbmRsZShpZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLl9yZWFkeSgpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgcmVtb3ZlIGhhbmRsZXMgdW50aWwgdGhlIG11bHRpcGxleCBpcyByZWFkeVwiKTtcblxuICAgIGRlbGV0ZSB0aGlzLl9oYW5kbGVzIVtpZF07XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgUGFja2FnZVsnZmFjdHMtYmFzZSddICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXS5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgICAgXCJtb25nby1saXZlZGF0YVwiLCBcIm9ic2VydmUtaGFuZGxlc1wiLCAtMSk7XG5cbiAgICBpZiAoaXNFbXB0eSh0aGlzLl9oYW5kbGVzKSAmJlxuICAgICAgdGhpcy5fYWRkSGFuZGxlVGFza3NTY2hlZHVsZWRCdXROb3RQZXJmb3JtZWQgPT09IDApIHtcbiAgICAgIGF3YWl0IHRoaXMuX3N0b3AoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfc3RvcChvcHRpb25zOiB7IGZyb21RdWVyeUVycm9yPzogYm9vbGVhbiB9ID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuX3JlYWR5KCkgJiYgIW9wdGlvbnMuZnJvbVF1ZXJ5RXJyb3IpXG4gICAgICB0aHJvdyBFcnJvcihcInN1cnByaXNpbmcgX3N0b3A6IG5vdCByZWFkeVwiKTtcblxuICAgIGF3YWl0IHRoaXMuX29uU3RvcCgpO1xuXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSAmJiBQYWNrYWdlWydmYWN0cy1iYXNlJ11cbiAgICAgICAgLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXCJtb25nby1saXZlZGF0YVwiLCBcIm9ic2VydmUtbXVsdGlwbGV4ZXJzXCIsIC0xKTtcblxuICAgIHRoaXMuX2hhbmRsZXMgPSBudWxsO1xuICB9XG5cbiAgYXN5bmMgcmVhZHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5fcXVldWUucXVldWVUYXNrKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9yZWFkeSgpKVxuICAgICAgICB0aHJvdyBFcnJvcihcImNhbid0IG1ha2UgT2JzZXJ2ZU11bHRpcGxleCByZWFkeSB0d2ljZSFcIik7XG5cbiAgICAgIGlmICghdGhpcy5fcmVzb2x2ZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyByZXNvbHZlclwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcmVzb2x2ZXIoKTtcbiAgICAgIHRoaXMuX2lzUmVhZHkgPSB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgcXVlcnlFcnJvcihlcnI6IEVycm9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5fcXVldWUucnVuVGFzaygoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fcmVhZHkoKSlcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJjYW4ndCBjbGFpbSBxdWVyeSBoYXMgYW4gZXJyb3IgYWZ0ZXIgaXQgd29ya2VkIVwiKTtcbiAgICAgIHRoaXMuX3N0b3AoeyBmcm9tUXVlcnlFcnJvcjogdHJ1ZSB9KTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIG9uRmx1c2goY2I6ICgpID0+IHZvaWQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9xdWV1ZS5xdWV1ZVRhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9yZWFkeSgpKVxuICAgICAgICB0aHJvdyBFcnJvcihcIm9ubHkgY2FsbCBvbkZsdXNoIG9uIGEgbXVsdGlwbGV4ZXIgdGhhdCB3aWxsIGJlIHJlYWR5XCIpO1xuICAgICAgYXdhaXQgY2IoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNhbGxiYWNrTmFtZXMoKTogT2JzZXJ2ZUhhbmRsZUNhbGxiYWNrW10ge1xuICAgIHJldHVybiB0aGlzLl9vcmRlcmVkXG4gICAgICA/IFtcImFkZGVkQmVmb3JlXCIsIFwiY2hhbmdlZFwiLCBcIm1vdmVkQmVmb3JlXCIsIFwicmVtb3ZlZFwiXVxuICAgICAgOiBbXCJhZGRlZFwiLCBcImNoYW5nZWRcIiwgXCJyZW1vdmVkXCJdO1xuICB9XG5cbiAgX3JlYWR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX2lzUmVhZHk7XG4gIH1cblxuICBfYXBwbHlDYWxsYmFjayhjYWxsYmFja05hbWU6IHN0cmluZywgYXJnczogYW55W10pIHtcbiAgICB0aGlzLl9xdWV1ZS5xdWV1ZVRhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9oYW5kbGVzKSByZXR1cm47XG5cbiAgICAgIGF3YWl0IHRoaXMuX2NhY2hlLmFwcGx5Q2hhbmdlW2NhbGxiYWNrTmFtZV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICBpZiAoIXRoaXMuX3JlYWR5KCkgJiZcbiAgICAgICAgKGNhbGxiYWNrTmFtZSAhPT0gJ2FkZGVkJyAmJiBjYWxsYmFja05hbWUgIT09ICdhZGRlZEJlZm9yZScpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgR290ICR7Y2FsbGJhY2tOYW1lfSBkdXJpbmcgaW5pdGlhbCBhZGRzYCk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgaGFuZGxlSWQgb2YgT2JqZWN0LmtleXModGhpcy5faGFuZGxlcykpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlID0gdGhpcy5faGFuZGxlcyAmJiB0aGlzLl9oYW5kbGVzW2hhbmRsZUlkXTtcblxuICAgICAgICBpZiAoIWhhbmRsZSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGNhbGxiYWNrID0gKGhhbmRsZSBhcyBhbnkpW2BfJHtjYWxsYmFja05hbWV9YF07XG5cbiAgICAgICAgaWYgKCFjYWxsYmFjaykgY29udGludWU7XG5cbiAgICAgICAgaGFuZGxlLmluaXRpYWxBZGRzU2VudC50aGVuKGNhbGxiYWNrLmFwcGx5KFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgaGFuZGxlLm5vbk11dGF0aW5nQ2FsbGJhY2tzID8gYXJncyA6IEVKU09OLmNsb25lKGFyZ3MpXG4gICAgICAgICkpXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfc2VuZEFkZHMoaGFuZGxlOiBPYnNlcnZlSGFuZGxlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgYWRkID0gdGhpcy5fb3JkZXJlZCA/IGhhbmRsZS5fYWRkZWRCZWZvcmUgOiBoYW5kbGUuX2FkZGVkO1xuICAgIGlmICghYWRkKSByZXR1cm47XG5cbiAgICBjb25zdCBhZGRQcm9taXNlczogUHJvbWlzZTx2b2lkPltdID0gW107XG5cbiAgICB0aGlzLl9jYWNoZS5kb2NzLmZvckVhY2goKGRvYzogYW55LCBpZDogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoIShoYW5kbGUuX2lkIGluIHRoaXMuX2hhbmRsZXMhKSkge1xuICAgICAgICB0aHJvdyBFcnJvcihcImhhbmRsZSBnb3QgcmVtb3ZlZCBiZWZvcmUgc2VuZGluZyBpbml0aWFsIGFkZHMhXCIpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IF9pZCwgLi4uZmllbGRzIH0gPSBoYW5kbGUubm9uTXV0YXRpbmdDYWxsYmFja3MgPyBkb2MgOiBFSlNPTi5jbG9uZShkb2MpO1xuXG4gICAgICBjb25zdCBwcm9taXNlID0gdGhpcy5fb3JkZXJlZCA/XG4gICAgICAgIGFkZChpZCwgZmllbGRzLCBudWxsKSA6XG4gICAgICAgIGFkZChpZCwgZmllbGRzKTtcblxuICAgICAgYWRkUHJvbWlzZXMucHVzaChwcm9taXNlKTtcbiAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKGFkZFByb21pc2VzKTtcblxuICAgIGhhbmRsZS5pbml0aWFsQWRkc1NlbnRSZXNvbHZlcigpO1xuICB9XG59IiwiZXhwb3J0IGNsYXNzIERvY0ZldGNoZXIge1xuICBjb25zdHJ1Y3Rvcihtb25nb0Nvbm5lY3Rpb24pIHtcbiAgICB0aGlzLl9tb25nb0Nvbm5lY3Rpb24gPSBtb25nb0Nvbm5lY3Rpb247XG4gICAgLy8gTWFwIGZyb20gb3AgLT4gW2NhbGxiYWNrXVxuICAgIHRoaXMuX2NhbGxiYWNrc0Zvck9wID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgLy8gRmV0Y2hlcyBkb2N1bWVudCBcImlkXCIgZnJvbSBjb2xsZWN0aW9uTmFtZSwgcmV0dXJuaW5nIGl0IG9yIG51bGwgaWYgbm90XG4gIC8vIGZvdW5kLlxuICAvL1xuICAvLyBJZiB5b3UgbWFrZSBtdWx0aXBsZSBjYWxscyB0byBmZXRjaCgpIHdpdGggdGhlIHNhbWUgb3AgcmVmZXJlbmNlLFxuICAvLyBEb2NGZXRjaGVyIG1heSBhc3N1bWUgdGhhdCB0aGV5IGFsbCByZXR1cm4gdGhlIHNhbWUgZG9jdW1lbnQuIChJdCBkb2VzXG4gIC8vIG5vdCBjaGVjayB0byBzZWUgaWYgY29sbGVjdGlvbk5hbWUvaWQgbWF0Y2guKVxuICAvL1xuICAvLyBZb3UgbWF5IGFzc3VtZSB0aGF0IGNhbGxiYWNrIGlzIG5ldmVyIGNhbGxlZCBzeW5jaHJvbm91c2x5IChhbmQgaW4gZmFjdFxuICAvLyBPcGxvZ09ic2VydmVEcml2ZXIgZG9lcyBzbykuXG4gIGFzeW5jIGZldGNoKGNvbGxlY3Rpb25OYW1lLCBpZCwgb3AsIGNhbGxiYWNrKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBcbiAgICBjaGVjayhjb2xsZWN0aW9uTmFtZSwgU3RyaW5nKTtcbiAgICBjaGVjayhvcCwgT2JqZWN0KTtcblxuXG4gICAgLy8gSWYgdGhlcmUncyBhbHJlYWR5IGFuIGluLXByb2dyZXNzIGZldGNoIGZvciB0aGlzIGNhY2hlIGtleSwgeWllbGQgdW50aWxcbiAgICAvLyBpdCdzIGRvbmUgYW5kIHJldHVybiB3aGF0ZXZlciBpdCByZXR1cm5zLlxuICAgIGlmIChzZWxmLl9jYWxsYmFja3NGb3JPcC5oYXMob3ApKSB7XG4gICAgICBzZWxmLl9jYWxsYmFja3NGb3JPcC5nZXQob3ApLnB1c2goY2FsbGJhY2spO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNhbGxiYWNrcyA9IFtjYWxsYmFja107XG4gICAgc2VsZi5fY2FsbGJhY2tzRm9yT3Auc2V0KG9wLCBjYWxsYmFja3MpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciBkb2MgPVxuICAgICAgICAoYXdhaXQgc2VsZi5fbW9uZ29Db25uZWN0aW9uLmZpbmRPbmVBc3luYyhjb2xsZWN0aW9uTmFtZSwge1xuICAgICAgICAgIF9pZDogaWQsXG4gICAgICAgIH0pKSB8fCBudWxsO1xuICAgICAgLy8gUmV0dXJuIGRvYyB0byBhbGwgcmVsZXZhbnQgY2FsbGJhY2tzLiBOb3RlIHRoYXQgdGhpcyBhcnJheSBjYW5cbiAgICAgIC8vIGNvbnRpbnVlIHRvIGdyb3cgZHVyaW5nIGNhbGxiYWNrIGV4Y2VjdXRpb24uXG4gICAgICB3aGlsZSAoY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gQ2xvbmUgdGhlIGRvY3VtZW50IHNvIHRoYXQgdGhlIHZhcmlvdXMgY2FsbHMgdG8gZmV0Y2ggZG9uJ3QgcmV0dXJuXG4gICAgICAgIC8vIG9iamVjdHMgdGhhdCBhcmUgaW50ZXJ0d2luZ2xlZCB3aXRoIGVhY2ggb3RoZXIuIENsb25lIGJlZm9yZVxuICAgICAgICAvLyBwb3BwaW5nIHRoZSBmdXR1cmUsIHNvIHRoYXQgaWYgY2xvbmUgdGhyb3dzLCB0aGUgZXJyb3IgZ2V0cyBwYXNzZWRcbiAgICAgICAgLy8gdG8gdGhlIG5leHQgY2FsbGJhY2suXG4gICAgICAgIGNhbGxiYWNrcy5wb3AoKShudWxsLCBFSlNPTi5jbG9uZShkb2MpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB3aGlsZSAoY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY2FsbGJhY2tzLnBvcCgpKGUpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBYWFggY29uc2lkZXIga2VlcGluZyB0aGUgZG9jIGFyb3VuZCBmb3IgYSBwZXJpb2Qgb2YgdGltZSBiZWZvcmVcbiAgICAgIC8vIHJlbW92aW5nIGZyb20gdGhlIGNhY2hlXG4gICAgICBzZWxmLl9jYWxsYmFja3NGb3JPcC5kZWxldGUob3ApO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHRocm90dGxlIGZyb20gJ2xvZGFzaC50aHJvdHRsZSc7XG5pbXBvcnQgeyBsaXN0ZW5BbGwgfSBmcm9tICcuL21vbmdvX2RyaXZlcic7XG5pbXBvcnQgeyBPYnNlcnZlTXVsdGlwbGV4ZXIgfSBmcm9tICcuL29ic2VydmVfbXVsdGlwbGV4JztcblxuaW50ZXJmYWNlIFBvbGxpbmdPYnNlcnZlRHJpdmVyT3B0aW9ucyB7XG4gIGN1cnNvckRlc2NyaXB0aW9uOiBhbnk7XG4gIG1vbmdvSGFuZGxlOiBhbnk7XG4gIG9yZGVyZWQ6IGJvb2xlYW47XG4gIG11bHRpcGxleGVyOiBPYnNlcnZlTXVsdGlwbGV4ZXI7XG4gIF90ZXN0T25seVBvbGxDYWxsYmFjaz86ICgpID0+IHZvaWQ7XG59XG5cbmNvbnN0IFBPTExJTkdfVEhST1RUTEVfTVMgPSArKHByb2Nlc3MuZW52Lk1FVEVPUl9QT0xMSU5HX1RIUk9UVExFX01TIHx8ICcnKSB8fCA1MDtcbmNvbnN0IFBPTExJTkdfSU5URVJWQUxfTVMgPSArKHByb2Nlc3MuZW52Lk1FVEVPUl9QT0xMSU5HX0lOVEVSVkFMX01TIHx8ICcnKSB8fCAxMCAqIDEwMDA7XG5cbi8qKlxuICogQGNsYXNzIFBvbGxpbmdPYnNlcnZlRHJpdmVyXG4gKlxuICogT25lIG9mIHR3byBvYnNlcnZlIGRyaXZlciBpbXBsZW1lbnRhdGlvbnMuXG4gKlxuICogQ2hhcmFjdGVyaXN0aWNzOlxuICogLSBDYWNoZXMgdGhlIHJlc3VsdHMgb2YgYSBxdWVyeVxuICogLSBSZXJ1bnMgdGhlIHF1ZXJ5IHdoZW4gbmVjZXNzYXJ5XG4gKiAtIFN1aXRhYmxlIGZvciBjYXNlcyB3aGVyZSBvcGxvZyB0YWlsaW5nIGlzIG5vdCBhdmFpbGFibGUgb3IgcHJhY3RpY2FsXG4gKi9cbmV4cG9ydCBjbGFzcyBQb2xsaW5nT2JzZXJ2ZURyaXZlciB7XG4gIHByaXZhdGUgX29wdGlvbnM6IFBvbGxpbmdPYnNlcnZlRHJpdmVyT3B0aW9ucztcbiAgcHJpdmF0ZSBfY3Vyc29yRGVzY3JpcHRpb246IGFueTtcbiAgcHJpdmF0ZSBfbW9uZ29IYW5kbGU6IGFueTtcbiAgcHJpdmF0ZSBfb3JkZXJlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfbXVsdGlwbGV4ZXI6IGFueTtcbiAgcHJpdmF0ZSBfc3RvcENhbGxiYWNrczogQXJyYXk8KCkgPT4gUHJvbWlzZTx2b2lkPj47XG4gIHByaXZhdGUgX3N0b3BwZWQ6IGJvb2xlYW47XG4gIHByaXZhdGUgX2N1cnNvcjogYW55O1xuICBwcml2YXRlIF9yZXN1bHRzOiBhbnk7XG4gIHByaXZhdGUgX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZDogbnVtYmVyO1xuICBwcml2YXRlIF9wZW5kaW5nV3JpdGVzOiBhbnlbXTtcbiAgcHJpdmF0ZSBfZW5zdXJlUG9sbElzU2NoZWR1bGVkOiBGdW5jdGlvbjtcbiAgcHJpdmF0ZSBfdGFza1F1ZXVlOiBhbnk7XG4gIHByaXZhdGUgX3Rlc3RPbmx5UG9sbENhbGxiYWNrPzogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBQb2xsaW5nT2JzZXJ2ZURyaXZlck9wdGlvbnMpIHtcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbiA9IG9wdGlvbnMuY3Vyc29yRGVzY3JpcHRpb247XG4gICAgdGhpcy5fbW9uZ29IYW5kbGUgPSBvcHRpb25zLm1vbmdvSGFuZGxlO1xuICAgIHRoaXMuX29yZGVyZWQgPSBvcHRpb25zLm9yZGVyZWQ7XG4gICAgdGhpcy5fbXVsdGlwbGV4ZXIgPSBvcHRpb25zLm11bHRpcGxleGVyO1xuICAgIHRoaXMuX3N0b3BDYWxsYmFja3MgPSBbXTtcbiAgICB0aGlzLl9zdG9wcGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLl9jdXJzb3IgPSB0aGlzLl9tb25nb0hhbmRsZS5fY3JlYXRlQXN5bmNocm9ub3VzQ3Vyc29yKFxuICAgICAgdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24pO1xuXG4gICAgdGhpcy5fcmVzdWx0cyA9IG51bGw7XG4gICAgdGhpcy5fcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkID0gMDtcbiAgICB0aGlzLl9wZW5kaW5nV3JpdGVzID0gW107XG5cbiAgICB0aGlzLl9lbnN1cmVQb2xsSXNTY2hlZHVsZWQgPSB0aHJvdHRsZShcbiAgICAgIHRoaXMuX3VudGhyb3R0bGVkRW5zdXJlUG9sbElzU2NoZWR1bGVkLmJpbmQodGhpcyksXG4gICAgICB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnBvbGxpbmdUaHJvdHRsZU1zIHx8IFBPTExJTkdfVEhST1RUTEVfTVNcbiAgICApO1xuXG4gICAgdGhpcy5fdGFza1F1ZXVlID0gbmV3IChNZXRlb3IgYXMgYW55KS5fQXN5bmNocm9ub3VzUXVldWUoKTtcbiAgfVxuXG4gIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgIGNvbnN0IGxpc3RlbmVyc0hhbmRsZSA9IGF3YWl0IGxpc3RlbkFsbChcbiAgICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLFxuICAgICAgKG5vdGlmaWNhdGlvbjogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGZlbmNlID0gKEREUFNlcnZlciBhcyBhbnkpLl9nZXRDdXJyZW50RmVuY2UoKTtcbiAgICAgICAgaWYgKGZlbmNlKSB7XG4gICAgICAgICAgdGhpcy5fcGVuZGluZ1dyaXRlcy5wdXNoKGZlbmNlLmJlZ2luV3JpdGUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuX2Vuc3VyZVBvbGxJc1NjaGVkdWxlZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMuX3N0b3BDYWxsYmFja3MucHVzaChhc3luYyAoKSA9PiB7IGF3YWl0IGxpc3RlbmVyc0hhbmRsZS5zdG9wKCk7IH0pO1xuXG4gICAgaWYgKG9wdGlvbnMuX3Rlc3RPbmx5UG9sbENhbGxiYWNrKSB7XG4gICAgICB0aGlzLl90ZXN0T25seVBvbGxDYWxsYmFjayA9IG9wdGlvbnMuX3Rlc3RPbmx5UG9sbENhbGxiYWNrO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwb2xsaW5nSW50ZXJ2YWwgPVxuICAgICAgICB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnBvbGxpbmdJbnRlcnZhbE1zIHx8XG4gICAgICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuX3BvbGxpbmdJbnRlcnZhbCB8fFxuICAgICAgICBQT0xMSU5HX0lOVEVSVkFMX01TO1xuXG4gICAgICBjb25zdCBpbnRlcnZhbEhhbmRsZSA9IE1ldGVvci5zZXRJbnRlcnZhbChcbiAgICAgICAgdGhpcy5fZW5zdXJlUG9sbElzU2NoZWR1bGVkLmJpbmQodGhpcyksXG4gICAgICAgIHBvbGxpbmdJbnRlcnZhbFxuICAgICAgKTtcblxuICAgICAgdGhpcy5fc3RvcENhbGxiYWNrcy5wdXNoKCgpID0+IHtcbiAgICAgICAgTWV0ZW9yLmNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxIYW5kbGUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5fdW50aHJvdHRsZWRFbnN1cmVQb2xsSXNTY2hlZHVsZWQoKTtcblxuICAgIChQYWNrYWdlWydmYWN0cy1iYXNlJ10gYXMgYW55KT8uRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdChcbiAgICAgIFwibW9uZ28tbGl2ZWRhdGFcIiwgXCJvYnNlcnZlLWRyaXZlcnMtcG9sbGluZ1wiLCAxKTtcbiAgfVxuXG4gIGFzeW5jIF91bnRocm90dGxlZEVuc3VyZVBvbGxJc1NjaGVkdWxlZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkID4gMCkgcmV0dXJuO1xuICAgICsrdGhpcy5fcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkO1xuICAgIGF3YWl0IHRoaXMuX3Rhc2tRdWV1ZS5ydW5UYXNrKGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuX3BvbGxNb25nbygpO1xuICAgIH0pO1xuICB9XG5cbiAgX3N1c3BlbmRQb2xsaW5nKCk6IHZvaWQge1xuICAgICsrdGhpcy5fcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkO1xuICAgIHRoaXMuX3Rhc2tRdWV1ZS5ydW5UYXNrKCgpID0+IHt9KTtcblxuICAgIGlmICh0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQgIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZCBpcyAke3RoaXMuX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZH1gKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfcmVzdW1lUG9sbGluZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYF9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQgaXMgJHt0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWR9YCk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuX3Rhc2tRdWV1ZS5ydW5UYXNrKGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuX3BvbGxNb25nbygpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX3BvbGxNb25nbygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAtLXRoaXMuX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZDtcblxuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG5cbiAgICBsZXQgZmlyc3QgPSBmYWxzZTtcbiAgICBsZXQgbmV3UmVzdWx0cztcbiAgICBsZXQgb2xkUmVzdWx0cyA9IHRoaXMuX3Jlc3VsdHM7XG5cbiAgICBpZiAoIW9sZFJlc3VsdHMpIHtcbiAgICAgIGZpcnN0ID0gdHJ1ZTtcbiAgICAgIG9sZFJlc3VsdHMgPSB0aGlzLl9vcmRlcmVkID8gW10gOiBuZXcgKExvY2FsQ29sbGVjdGlvbiBhcyBhbnkpLl9JZE1hcDtcbiAgICB9XG5cbiAgICB0aGlzLl90ZXN0T25seVBvbGxDYWxsYmFjaz8uKCk7XG5cbiAgICBjb25zdCB3cml0ZXNGb3JDeWNsZSA9IHRoaXMuX3BlbmRpbmdXcml0ZXM7XG4gICAgdGhpcy5fcGVuZGluZ1dyaXRlcyA9IFtdO1xuXG4gICAgdHJ5IHtcbiAgICAgIG5ld1Jlc3VsdHMgPSBhd2FpdCB0aGlzLl9jdXJzb3IuZ2V0UmF3T2JqZWN0cyh0aGlzLl9vcmRlcmVkKTtcbiAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgIGlmIChmaXJzdCAmJiB0eXBlb2YoZS5jb2RlKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5fbXVsdGlwbGV4ZXIucXVlcnlFcnJvcihcbiAgICAgICAgICBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRXhjZXB0aW9uIHdoaWxlIHBvbGxpbmcgcXVlcnkgJHtcbiAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy5fY3Vyc29yRGVzY3JpcHRpb24pXG4gICAgICAgICAgICB9OiAke2UubWVzc2FnZX1gXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0aGlzLl9wZW5kaW5nV3JpdGVzLCB3cml0ZXNGb3JDeWNsZSk7XG4gICAgICBNZXRlb3IuX2RlYnVnKGBFeGNlcHRpb24gd2hpbGUgcG9sbGluZyBxdWVyeSAke1xuICAgICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbil9YCwgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9zdG9wcGVkKSB7XG4gICAgICAoTG9jYWxDb2xsZWN0aW9uIGFzIGFueSkuX2RpZmZRdWVyeUNoYW5nZXMoXG4gICAgICAgIHRoaXMuX29yZGVyZWQsIG9sZFJlc3VsdHMsIG5ld1Jlc3VsdHMsIHRoaXMuX211bHRpcGxleGVyKTtcbiAgICB9XG5cbiAgICBpZiAoZmlyc3QpIHRoaXMuX211bHRpcGxleGVyLnJlYWR5KCk7XG5cbiAgICB0aGlzLl9yZXN1bHRzID0gbmV3UmVzdWx0cztcblxuICAgIGF3YWl0IHRoaXMuX211bHRpcGxleGVyLm9uRmx1c2goYXN5bmMgKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCB3IG9mIHdyaXRlc0ZvckN5Y2xlKSB7XG4gICAgICAgIGF3YWl0IHcuY29tbWl0dGVkKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBzdG9wKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX3N0b3BwZWQgPSB0cnVlO1xuXG4gICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiB0aGlzLl9zdG9wQ2FsbGJhY2tzKSB7XG4gICAgICBhd2FpdCBjYWxsYmFjaygpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgdyBvZiB0aGlzLl9wZW5kaW5nV3JpdGVzKSB7XG4gICAgICBhd2FpdCB3LmNvbW1pdHRlZCgpO1xuICAgIH1cblxuICAgIChQYWNrYWdlWydmYWN0cy1iYXNlJ10gYXMgYW55KT8uRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdChcbiAgICAgIFwibW9uZ28tbGl2ZWRhdGFcIiwgXCJvYnNlcnZlLWRyaXZlcnMtcG9sbGluZ1wiLCAtMSk7XG4gIH1cbn0iLCJpbXBvcnQgaGFzIGZyb20gJ2xvZGFzaC5oYXMnO1xuaW1wb3J0IGlzRW1wdHkgZnJvbSAnbG9kYXNoLmlzZW1wdHknO1xuaW1wb3J0IHsgb3Bsb2dWMlYxQ29udmVydGVyIH0gZnJvbSBcIi4vb3Bsb2dfdjJfY29udmVydGVyXCI7XG5pbXBvcnQgeyBjaGVjaywgTWF0Y2ggfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgQ3Vyc29yRGVzY3JpcHRpb24gfSBmcm9tICcuL2N1cnNvcl9kZXNjcmlwdGlvbic7XG5pbXBvcnQgeyBmb3JFYWNoVHJpZ2dlciwgbGlzdGVuQWxsIH0gZnJvbSAnLi9tb25nb19kcml2ZXInO1xuaW1wb3J0IHsgQ3Vyc29yIH0gZnJvbSAnLi9jdXJzb3InO1xuaW1wb3J0IExvY2FsQ29sbGVjdGlvbiBmcm9tICdtZXRlb3IvbWluaW1vbmdvL2xvY2FsX2NvbGxlY3Rpb24nO1xuaW1wb3J0IHsgaWRGb3JPcCB9IGZyb20gJy4vb3Bsb2dfdGFpbGluZyc7XG5cbnZhciBQSEFTRSA9IHtcbiAgUVVFUllJTkc6IFwiUVVFUllJTkdcIixcbiAgRkVUQ0hJTkc6IFwiRkVUQ0hJTkdcIixcbiAgU1RFQURZOiBcIlNURUFEWVwiXG59O1xuXG4vLyBFeGNlcHRpb24gdGhyb3duIGJ5IF9uZWVkVG9Qb2xsUXVlcnkgd2hpY2ggdW5yb2xscyB0aGUgc3RhY2sgdXAgdG8gdGhlXG4vLyBlbmNsb3NpbmcgY2FsbCB0byBmaW5pc2hJZk5lZWRUb1BvbGxRdWVyeS5cbnZhciBTd2l0Y2hlZFRvUXVlcnkgPSBmdW5jdGlvbiAoKSB7fTtcbnZhciBmaW5pc2hJZk5lZWRUb1BvbGxRdWVyeSA9IGZ1bmN0aW9uIChmKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoIShlIGluc3RhbmNlb2YgU3dpdGNoZWRUb1F1ZXJ5KSlcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH07XG59O1xuXG52YXIgY3VycmVudElkID0gMDtcblxuLyoqXG4gKiBAY2xhc3MgT3Bsb2dPYnNlcnZlRHJpdmVyXG4gKiBBbiBhbHRlcm5hdGl2ZSB0byBQb2xsaW5nT2JzZXJ2ZURyaXZlciB3aGljaCBmb2xsb3dzIHRoZSBNb25nb0RCIG9wZXJhdGlvbiBsb2dcbiAqIGluc3RlYWQgb2YgcmUtcG9sbGluZyB0aGUgcXVlcnkuXG4gKlxuICogQ2hhcmFjdGVyaXN0aWNzOlxuICogLSBGb2xsb3dzIHRoZSBNb25nb0RCIG9wZXJhdGlvbiBsb2dcbiAqIC0gRGlyZWN0bHkgb2JzZXJ2ZXMgZGF0YWJhc2UgY2hhbmdlc1xuICogLSBNb3JlIGVmZmljaWVudCB0aGFuIHBvbGxpbmcgZm9yIG1vc3QgdXNlIGNhc2VzXG4gKiAtIFJlcXVpcmVzIGFjY2VzcyB0byBNb25nb0RCIG9wbG9nXG4gKlxuICogSW50ZXJmYWNlOlxuICogLSBDb25zdHJ1Y3Rpb24gaW5pdGlhdGVzIG9ic2VydmVDaGFuZ2VzIGNhbGxiYWNrcyBhbmQgcmVhZHkoKSBpbnZvY2F0aW9uIHRvIHRoZSBPYnNlcnZlTXVsdGlwbGV4ZXJcbiAqIC0gT2JzZXJ2YXRpb24gY2FuIGJlIHRlcm1pbmF0ZWQgdmlhIHRoZSBzdG9wKCkgbWV0aG9kXG4gKi9cbmV4cG9ydCBjb25zdCBPcGxvZ09ic2VydmVEcml2ZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBjb25zdCBzZWxmID0gdGhpcztcbiAgc2VsZi5fdXNlc09wbG9nID0gdHJ1ZTsgIC8vIHRlc3RzIGxvb2sgYXQgdGhpc1xuXG4gIHNlbGYuX2lkID0gY3VycmVudElkO1xuICBjdXJyZW50SWQrKztcblxuICBzZWxmLl9jdXJzb3JEZXNjcmlwdGlvbiA9IG9wdGlvbnMuY3Vyc29yRGVzY3JpcHRpb247XG4gIHNlbGYuX21vbmdvSGFuZGxlID0gb3B0aW9ucy5tb25nb0hhbmRsZTtcbiAgc2VsZi5fbXVsdGlwbGV4ZXIgPSBvcHRpb25zLm11bHRpcGxleGVyO1xuXG4gIGlmIChvcHRpb25zLm9yZGVyZWQpIHtcbiAgICB0aHJvdyBFcnJvcihcIk9wbG9nT2JzZXJ2ZURyaXZlciBvbmx5IHN1cHBvcnRzIHVub3JkZXJlZCBvYnNlcnZlQ2hhbmdlc1wiKTtcbiAgfVxuXG4gIGNvbnN0IHNvcnRlciA9IG9wdGlvbnMuc29ydGVyO1xuICAvLyBXZSBkb24ndCBzdXBwb3J0ICRuZWFyIGFuZCBvdGhlciBnZW8tcXVlcmllcyBzbyBpdCdzIE9LIHRvIGluaXRpYWxpemUgdGhlXG4gIC8vIGNvbXBhcmF0b3Igb25seSBvbmNlIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgY29uc3QgY29tcGFyYXRvciA9IHNvcnRlciAmJiBzb3J0ZXIuZ2V0Q29tcGFyYXRvcigpO1xuXG4gIGlmIChvcHRpb25zLmN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMubGltaXQpIHtcbiAgICAvLyBUaGVyZSBhcmUgc2V2ZXJhbCBwcm9wZXJ0aWVzIG9yZGVyZWQgZHJpdmVyIGltcGxlbWVudHM6XG4gICAgLy8gLSBfbGltaXQgaXMgYSBwb3NpdGl2ZSBudW1iZXJcbiAgICAvLyAtIF9jb21wYXJhdG9yIGlzIGEgZnVuY3Rpb24tY29tcGFyYXRvciBieSB3aGljaCB0aGUgcXVlcnkgaXMgb3JkZXJlZFxuICAgIC8vIC0gX3VucHVibGlzaGVkQnVmZmVyIGlzIG5vbi1udWxsIE1pbi9NYXggSGVhcCxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICB0aGUgZW1wdHkgYnVmZmVyIGluIFNURUFEWSBwaGFzZSBpbXBsaWVzIHRoYXQgdGhlXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgZXZlcnl0aGluZyB0aGF0IG1hdGNoZXMgdGhlIHF1ZXJpZXMgc2VsZWN0b3IgZml0c1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgIGludG8gcHVibGlzaGVkIHNldC5cbiAgICAvLyAtIF9wdWJsaXNoZWQgLSBNYXggSGVhcCAoYWxzbyBpbXBsZW1lbnRzIElkTWFwIG1ldGhvZHMpXG5cbiAgICBjb25zdCBoZWFwT3B0aW9ucyA9IHsgSWRNYXA6IExvY2FsQ29sbGVjdGlvbi5fSWRNYXAgfTtcbiAgICBzZWxmLl9saW1pdCA9IHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMubGltaXQ7XG4gICAgc2VsZi5fY29tcGFyYXRvciA9IGNvbXBhcmF0b3I7XG4gICAgc2VsZi5fc29ydGVyID0gc29ydGVyO1xuICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyID0gbmV3IE1pbk1heEhlYXAoY29tcGFyYXRvciwgaGVhcE9wdGlvbnMpO1xuICAgIC8vIFdlIG5lZWQgc29tZXRoaW5nIHRoYXQgY2FuIGZpbmQgTWF4IHZhbHVlIGluIGFkZGl0aW9uIHRvIElkTWFwIGludGVyZmFjZVxuICAgIHNlbGYuX3B1Ymxpc2hlZCA9IG5ldyBNYXhIZWFwKGNvbXBhcmF0b3IsIGhlYXBPcHRpb25zKTtcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9saW1pdCA9IDA7XG4gICAgc2VsZi5fY29tcGFyYXRvciA9IG51bGw7XG4gICAgc2VsZi5fc29ydGVyID0gbnVsbDtcbiAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlciA9IG51bGw7XG4gICAgLy8gTWVtb3J5IEdyb3d0aFxuICAgIHNlbGYuX3B1Ymxpc2hlZCA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwO1xuICB9XG5cbiAgLy8gSW5kaWNhdGVzIGlmIGl0IGlzIHNhZmUgdG8gaW5zZXJ0IGEgbmV3IGRvY3VtZW50IGF0IHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICAvLyBmb3IgdGhpcyBxdWVyeS4gaS5lLiBpdCBpcyBrbm93biB0aGF0IHRoZXJlIGFyZSBubyBkb2N1bWVudHMgbWF0Y2hpbmcgdGhlXG4gIC8vIHNlbGVjdG9yIHRob3NlIGFyZSBub3QgaW4gcHVibGlzaGVkIG9yIGJ1ZmZlci5cbiAgc2VsZi5fc2FmZUFwcGVuZFRvQnVmZmVyID0gZmFsc2U7XG5cbiAgc2VsZi5fc3RvcHBlZCA9IGZhbHNlO1xuICBzZWxmLl9zdG9wSGFuZGxlcyA9IFtdO1xuICBzZWxmLl9hZGRTdG9wSGFuZGxlcyA9IGZ1bmN0aW9uIChuZXdTdG9wSGFuZGxlcykge1xuICAgIGNvbnN0IGV4cGVjdGVkUGF0dGVybiA9IE1hdGNoLk9iamVjdEluY2x1ZGluZyh7IHN0b3A6IEZ1bmN0aW9uIH0pO1xuICAgIC8vIFNpbmdsZSBpdGVtIG9yIGFycmF5XG4gICAgY2hlY2sobmV3U3RvcEhhbmRsZXMsIE1hdGNoLk9uZU9mKFtleHBlY3RlZFBhdHRlcm5dLCBleHBlY3RlZFBhdHRlcm4pKTtcbiAgICBzZWxmLl9zdG9wSGFuZGxlcy5wdXNoKG5ld1N0b3BIYW5kbGVzKTtcbiAgfVxuXG4gIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSAmJiBQYWNrYWdlWydmYWN0cy1iYXNlJ10uRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdChcbiAgICBcIm1vbmdvLWxpdmVkYXRhXCIsIFwib2JzZXJ2ZS1kcml2ZXJzLW9wbG9nXCIsIDEpO1xuXG4gIHNlbGYuX3JlZ2lzdGVyUGhhc2VDaGFuZ2UoUEhBU0UuUVVFUllJTkcpO1xuXG4gIHNlbGYuX21hdGNoZXIgPSBvcHRpb25zLm1hdGNoZXI7XG4gIC8vIHdlIGFyZSBub3cgdXNpbmcgcHJvamVjdGlvbiwgbm90IGZpZWxkcyBpbiB0aGUgY3Vyc29yIGRlc2NyaXB0aW9uIGV2ZW4gaWYgeW91IHBhc3Mge2ZpZWxkc31cbiAgLy8gaW4gdGhlIGN1cnNvciBjb25zdHJ1Y3Rpb25cbiAgY29uc3QgcHJvamVjdGlvbiA9IHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuZmllbGRzIHx8IHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMucHJvamVjdGlvbiB8fCB7fTtcbiAgc2VsZi5fcHJvamVjdGlvbkZuID0gTG9jYWxDb2xsZWN0aW9uLl9jb21waWxlUHJvamVjdGlvbihwcm9qZWN0aW9uKTtcbiAgLy8gUHJvamVjdGlvbiBmdW5jdGlvbiwgcmVzdWx0IG9mIGNvbWJpbmluZyBpbXBvcnRhbnQgZmllbGRzIGZvciBzZWxlY3RvciBhbmRcbiAgLy8gZXhpc3RpbmcgZmllbGRzIHByb2plY3Rpb25cbiAgc2VsZi5fc2hhcmVkUHJvamVjdGlvbiA9IHNlbGYuX21hdGNoZXIuY29tYmluZUludG9Qcm9qZWN0aW9uKHByb2plY3Rpb24pO1xuICBpZiAoc29ydGVyKVxuICAgIHNlbGYuX3NoYXJlZFByb2plY3Rpb24gPSBzb3J0ZXIuY29tYmluZUludG9Qcm9qZWN0aW9uKHNlbGYuX3NoYXJlZFByb2plY3Rpb24pO1xuICBzZWxmLl9zaGFyZWRQcm9qZWN0aW9uRm4gPSBMb2NhbENvbGxlY3Rpb24uX2NvbXBpbGVQcm9qZWN0aW9uKFxuICAgIHNlbGYuX3NoYXJlZFByb2plY3Rpb24pO1xuXG4gIHNlbGYuX25lZWRUb0ZldGNoID0gbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXA7XG4gIHNlbGYuX2N1cnJlbnRseUZldGNoaW5nID0gbnVsbDtcbiAgc2VsZi5fZmV0Y2hHZW5lcmF0aW9uID0gMDtcblxuICBzZWxmLl9yZXF1ZXJ5V2hlbkRvbmVUaGlzUXVlcnkgPSBmYWxzZTtcbiAgc2VsZi5fd3JpdGVzVG9Db21taXRXaGVuV2VSZWFjaFN0ZWFkeSA9IFtdO1xuIH07XG5cbk9iamVjdC5hc3NpZ24oT3Bsb2dPYnNlcnZlRHJpdmVyLnByb3RvdHlwZSwge1xuICBfaW5pdDogYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBJZiB0aGUgb3Bsb2cgaGFuZGxlIHRlbGxzIHVzIHRoYXQgaXQgc2tpcHBlZCBzb21lIGVudHJpZXMgKGJlY2F1c2UgaXQgZ290XG4gICAgLy8gYmVoaW5kLCBzYXkpLCByZS1wb2xsLlxuICAgIHNlbGYuX2FkZFN0b3BIYW5kbGVzKHNlbGYuX21vbmdvSGFuZGxlLl9vcGxvZ0hhbmRsZS5vblNraXBwZWRFbnRyaWVzKFxuICAgICAgZmluaXNoSWZOZWVkVG9Qb2xsUXVlcnkoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc2VsZi5fbmVlZFRvUG9sbFF1ZXJ5KCk7XG4gICAgICB9KVxuICAgICkpO1xuICAgIFxuICAgIGF3YWl0IGZvckVhY2hUcmlnZ2VyKHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uLCBhc3luYyBmdW5jdGlvbiAodHJpZ2dlcikge1xuICAgICAgc2VsZi5fYWRkU3RvcEhhbmRsZXMoYXdhaXQgc2VsZi5fbW9uZ29IYW5kbGUuX29wbG9nSGFuZGxlLm9uT3Bsb2dFbnRyeShcbiAgICAgICAgdHJpZ2dlciwgZnVuY3Rpb24gKG5vdGlmaWNhdGlvbikge1xuICAgICAgICAgIGZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IG9wID0gbm90aWZpY2F0aW9uLm9wO1xuICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbi5kcm9wQ29sbGVjdGlvbiB8fCBub3RpZmljYXRpb24uZHJvcERhdGFiYXNlKSB7XG4gICAgICAgICAgICAgIC8vIE5vdGU6IHRoaXMgY2FsbCBpcyBub3QgYWxsb3dlZCB0byBibG9jayBvbiBhbnl0aGluZyAoZXNwZWNpYWxseVxuICAgICAgICAgICAgICAvLyBvbiB3YWl0aW5nIGZvciBvcGxvZyBlbnRyaWVzIHRvIGNhdGNoIHVwKSBiZWNhdXNlIHRoYXQgd2lsbCBibG9ja1xuICAgICAgICAgICAgICAvLyBvbk9wbG9nRW50cnkhXG4gICAgICAgICAgICAgIHJldHVybiBzZWxmLl9uZWVkVG9Qb2xsUXVlcnkoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIEFsbCBvdGhlciBvcGVyYXRvcnMgc2hvdWxkIGJlIGhhbmRsZWQgZGVwZW5kaW5nIG9uIHBoYXNlXG4gICAgICAgICAgICAgIGlmIChzZWxmLl9waGFzZSA9PT0gUEhBU0UuUVVFUllJTkcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5faGFuZGxlT3Bsb2dFbnRyeVF1ZXJ5aW5nKG9wKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5faGFuZGxlT3Bsb2dFbnRyeVN0ZWFkeU9yRmV0Y2hpbmcob3ApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgICAgKSk7XG4gICAgfSk7XG4gIFxuICAgIC8vIFhYWCBvcmRlcmluZyB3LnIudC4gZXZlcnl0aGluZyBlbHNlP1xuICAgIHNlbGYuX2FkZFN0b3BIYW5kbGVzKGF3YWl0IGxpc3RlbkFsbChcbiAgICAgIHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIElmIHdlJ3JlIG5vdCBpbiBhIHByZS1maXJlIHdyaXRlIGZlbmNlLCB3ZSBkb24ndCBoYXZlIHRvIGRvIGFueXRoaW5nLlxuICAgICAgICBjb25zdCBmZW5jZSA9IEREUFNlcnZlci5fZ2V0Q3VycmVudEZlbmNlKCk7XG4gICAgICAgIGlmICghZmVuY2UgfHwgZmVuY2UuZmlyZWQpXG4gICAgICAgICAgcmV0dXJuO1xuICBcbiAgICAgICAgaWYgKGZlbmNlLl9vcGxvZ09ic2VydmVEcml2ZXJzKSB7XG4gICAgICAgICAgZmVuY2UuX29wbG9nT2JzZXJ2ZURyaXZlcnNbc2VsZi5faWRdID0gc2VsZjtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgXG4gICAgICAgIGZlbmNlLl9vcGxvZ09ic2VydmVEcml2ZXJzID0ge307XG4gICAgICAgIGZlbmNlLl9vcGxvZ09ic2VydmVEcml2ZXJzW3NlbGYuX2lkXSA9IHNlbGY7XG4gIFxuICAgICAgICBmZW5jZS5vbkJlZm9yZUZpcmUoYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnN0IGRyaXZlcnMgPSBmZW5jZS5fb3Bsb2dPYnNlcnZlRHJpdmVycztcbiAgICAgICAgICBkZWxldGUgZmVuY2UuX29wbG9nT2JzZXJ2ZURyaXZlcnM7XG4gIFxuICAgICAgICAgIC8vIFRoaXMgZmVuY2UgY2Fubm90IGZpcmUgdW50aWwgd2UndmUgY2F1Z2h0IHVwIHRvIFwidGhpcyBwb2ludFwiIGluIHRoZVxuICAgICAgICAgIC8vIG9wbG9nLCBhbmQgYWxsIG9ic2VydmVycyBtYWRlIGl0IGJhY2sgdG8gdGhlIHN0ZWFkeSBzdGF0ZS5cbiAgICAgICAgICBhd2FpdCBzZWxmLl9tb25nb0hhbmRsZS5fb3Bsb2dIYW5kbGUud2FpdFVudGlsQ2F1Z2h0VXAoKTtcbiAgXG4gICAgICAgICAgZm9yIChjb25zdCBkcml2ZXIgb2YgT2JqZWN0LnZhbHVlcyhkcml2ZXJzKSkge1xuICAgICAgICAgICAgaWYgKGRyaXZlci5fc3RvcHBlZClcbiAgICAgICAgICAgICAgY29udGludWU7XG4gIFxuICAgICAgICAgICAgY29uc3Qgd3JpdGUgPSBhd2FpdCBmZW5jZS5iZWdpbldyaXRlKCk7XG4gICAgICAgICAgICBpZiAoZHJpdmVyLl9waGFzZSA9PT0gUEhBU0UuU1RFQURZKSB7XG4gICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IGFsbCBvZiB0aGUgY2FsbGJhY2tzIGhhdmUgbWFkZSBpdCB0aHJvdWdoIHRoZVxuICAgICAgICAgICAgICAvLyBtdWx0aXBsZXhlciBhbmQgYmVlbiBkZWxpdmVyZWQgdG8gT2JzZXJ2ZUhhbmRsZXMgYmVmb3JlIGNvbW1pdHRpbmdcbiAgICAgICAgICAgICAgLy8gd3JpdGVzLlxuICAgICAgICAgICAgICBhd2FpdCBkcml2ZXIuX211bHRpcGxleGVyLm9uRmx1c2god3JpdGUuY29tbWl0dGVkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRyaXZlci5fd3JpdGVzVG9Db21taXRXaGVuV2VSZWFjaFN0ZWFkeS5wdXNoKHdyaXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICkpO1xuICBcbiAgICAvLyBXaGVuIE1vbmdvIGZhaWxzIG92ZXIsIHdlIG5lZWQgdG8gcmVwb2xsIHRoZSBxdWVyeSwgaW4gY2FzZSB3ZSBwcm9jZXNzZWQgYW5cbiAgICAvLyBvcGxvZyBlbnRyeSB0aGF0IGdvdCByb2xsZWQgYmFjay5cbiAgICBzZWxmLl9hZGRTdG9wSGFuZGxlcyhzZWxmLl9tb25nb0hhbmRsZS5fb25GYWlsb3ZlcihmaW5pc2hJZk5lZWRUb1BvbGxRdWVyeShcbiAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX25lZWRUb1BvbGxRdWVyeSgpO1xuICAgICAgfSkpKTtcbiAgXG4gICAgLy8gR2l2ZSBfb2JzZXJ2ZUNoYW5nZXMgYSBjaGFuY2UgdG8gYWRkIHRoZSBuZXcgT2JzZXJ2ZUhhbmRsZSB0byBvdXJcbiAgICAvLyBtdWx0aXBsZXhlciwgc28gdGhhdCB0aGUgYWRkZWQgY2FsbHMgZ2V0IHN0cmVhbWVkLlxuICAgIHJldHVybiBzZWxmLl9ydW5Jbml0aWFsUXVlcnkoKTtcbiAgfSxcbiAgX2FkZFB1Ymxpc2hlZDogZnVuY3Rpb24gKGlkLCBkb2MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkcyA9IE9iamVjdC5hc3NpZ24oe30sIGRvYyk7XG4gICAgICBkZWxldGUgZmllbGRzLl9pZDtcbiAgICAgIHNlbGYuX3B1Ymxpc2hlZC5zZXQoaWQsIHNlbGYuX3NoYXJlZFByb2plY3Rpb25Gbihkb2MpKTtcbiAgICAgIHNlbGYuX211bHRpcGxleGVyLmFkZGVkKGlkLCBzZWxmLl9wcm9qZWN0aW9uRm4oZmllbGRzKSk7XG5cbiAgICAgIC8vIEFmdGVyIGFkZGluZyB0aGlzIGRvY3VtZW50LCB0aGUgcHVibGlzaGVkIHNldCBtaWdodCBiZSBvdmVyZmxvd2VkXG4gICAgICAvLyAoZXhjZWVkaW5nIGNhcGFjaXR5IHNwZWNpZmllZCBieSBsaW1pdCkuIElmIHNvLCBwdXNoIHRoZSBtYXhpbXVtXG4gICAgICAvLyBlbGVtZW50IHRvIHRoZSBidWZmZXIsIHdlIG1pZ2h0IHdhbnQgdG8gc2F2ZSBpdCBpbiBtZW1vcnkgdG8gcmVkdWNlIHRoZVxuICAgICAgLy8gYW1vdW50IG9mIE1vbmdvIGxvb2t1cHMgaW4gdGhlIGZ1dHVyZS5cbiAgICAgIGlmIChzZWxmLl9saW1pdCAmJiBzZWxmLl9wdWJsaXNoZWQuc2l6ZSgpID4gc2VsZi5fbGltaXQpIHtcbiAgICAgICAgLy8gWFhYIGluIHRoZW9yeSB0aGUgc2l6ZSBvZiBwdWJsaXNoZWQgaXMgbm8gbW9yZSB0aGFuIGxpbWl0KzFcbiAgICAgICAgaWYgKHNlbGYuX3B1Ymxpc2hlZC5zaXplKCkgIT09IHNlbGYuX2xpbWl0ICsgMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFmdGVyIGFkZGluZyB0byBwdWJsaXNoZWQsIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKHNlbGYuX3B1Ymxpc2hlZC5zaXplKCkgLSBzZWxmLl9saW1pdCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBkb2N1bWVudHMgYXJlIG92ZXJmbG93aW5nIHRoZSBzZXRcIik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb3ZlcmZsb3dpbmdEb2NJZCA9IHNlbGYuX3B1Ymxpc2hlZC5tYXhFbGVtZW50SWQoKTtcbiAgICAgICAgdmFyIG92ZXJmbG93aW5nRG9jID0gc2VsZi5fcHVibGlzaGVkLmdldChvdmVyZmxvd2luZ0RvY0lkKTtcblxuICAgICAgICBpZiAoRUpTT04uZXF1YWxzKG92ZXJmbG93aW5nRG9jSWQsIGlkKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBkb2N1bWVudCBqdXN0IGFkZGVkIGlzIG92ZXJmbG93aW5nIHRoZSBwdWJsaXNoZWQgc2V0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5fcHVibGlzaGVkLnJlbW92ZShvdmVyZmxvd2luZ0RvY0lkKTtcbiAgICAgICAgc2VsZi5fbXVsdGlwbGV4ZXIucmVtb3ZlZChvdmVyZmxvd2luZ0RvY0lkKTtcbiAgICAgICAgc2VsZi5fYWRkQnVmZmVyZWQob3ZlcmZsb3dpbmdEb2NJZCwgb3ZlcmZsb3dpbmdEb2MpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfcmVtb3ZlUHVibGlzaGVkOiBmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5fcHVibGlzaGVkLnJlbW92ZShpZCk7XG4gICAgICBzZWxmLl9tdWx0aXBsZXhlci5yZW1vdmVkKGlkKTtcbiAgICAgIGlmICghIHNlbGYuX2xpbWl0IHx8IHNlbGYuX3B1Ymxpc2hlZC5zaXplKCkgPT09IHNlbGYuX2xpbWl0KVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIGlmIChzZWxmLl9wdWJsaXNoZWQuc2l6ZSgpID4gc2VsZi5fbGltaXQpXG4gICAgICAgIHRocm93IEVycm9yKFwic2VsZi5fcHVibGlzaGVkIGdvdCB0b28gYmlnXCIpO1xuXG4gICAgICAvLyBPSywgd2UgYXJlIHB1Ymxpc2hpbmcgbGVzcyB0aGFuIHRoZSBsaW1pdC4gTWF5YmUgd2Ugc2hvdWxkIGxvb2sgaW4gdGhlXG4gICAgICAvLyBidWZmZXIgdG8gZmluZCB0aGUgbmV4dCBlbGVtZW50IHBhc3Qgd2hhdCB3ZSB3ZXJlIHB1Ymxpc2hpbmcgYmVmb3JlLlxuXG4gICAgICBpZiAoIXNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmVtcHR5KCkpIHtcbiAgICAgICAgLy8gVGhlcmUncyBzb21ldGhpbmcgaW4gdGhlIGJ1ZmZlcjsgbW92ZSB0aGUgZmlyc3QgdGhpbmcgaW4gaXQgdG9cbiAgICAgICAgLy8gX3B1Ymxpc2hlZC5cbiAgICAgICAgdmFyIG5ld0RvY0lkID0gc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIubWluRWxlbWVudElkKCk7XG4gICAgICAgIHZhciBuZXdEb2MgPSBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5nZXQobmV3RG9jSWQpO1xuICAgICAgICBzZWxmLl9yZW1vdmVCdWZmZXJlZChuZXdEb2NJZCk7XG4gICAgICAgIHNlbGYuX2FkZFB1Ymxpc2hlZChuZXdEb2NJZCwgbmV3RG9jKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGVyZSdzIG5vdGhpbmcgaW4gdGhlIGJ1ZmZlci4gIFRoaXMgY291bGQgbWVhbiBvbmUgb2YgYSBmZXcgdGhpbmdzLlxuXG4gICAgICAvLyAoYSkgV2UgY291bGQgYmUgaW4gdGhlIG1pZGRsZSBvZiByZS1ydW5uaW5nIHRoZSBxdWVyeSAoc3BlY2lmaWNhbGx5LCB3ZVxuICAgICAgLy8gY291bGQgYmUgaW4gX3B1Ymxpc2hOZXdSZXN1bHRzKS4gSW4gdGhhdCBjYXNlLCBfdW5wdWJsaXNoZWRCdWZmZXIgaXNcbiAgICAgIC8vIGVtcHR5IGJlY2F1c2Ugd2UgY2xlYXIgaXQgYXQgdGhlIGJlZ2lubmluZyBvZiBfcHVibGlzaE5ld1Jlc3VsdHMuIEluXG4gICAgICAvLyB0aGlzIGNhc2UsIG91ciBjYWxsZXIgYWxyZWFkeSBrbm93cyB0aGUgZW50aXJlIGFuc3dlciB0byB0aGUgcXVlcnkgYW5kXG4gICAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIGZhbmN5IGhlcmUuICBKdXN0IHJldHVybi5cbiAgICAgIGlmIChzZWxmLl9waGFzZSA9PT0gUEhBU0UuUVVFUllJTkcpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgLy8gKGIpIFdlJ3JlIHByZXR0eSBjb25maWRlbnQgdGhhdCB0aGUgdW5pb24gb2YgX3B1Ymxpc2hlZCBhbmRcbiAgICAgIC8vIF91bnB1Ymxpc2hlZEJ1ZmZlciBjb250YWluIGFsbCBkb2N1bWVudHMgdGhhdCBtYXRjaCBzZWxlY3Rvci4gQmVjYXVzZVxuICAgICAgLy8gX3VucHVibGlzaGVkQnVmZmVyIGlzIGVtcHR5LCB0aGF0IG1lYW5zIHdlJ3JlIGNvbmZpZGVudCB0aGF0IF9wdWJsaXNoZWRcbiAgICAgIC8vIGNvbnRhaW5zIGFsbCBkb2N1bWVudHMgdGhhdCBtYXRjaCBzZWxlY3Rvci4gU28gd2UgaGF2ZSBub3RoaW5nIHRvIGRvLlxuICAgICAgaWYgKHNlbGYuX3NhZmVBcHBlbmRUb0J1ZmZlcilcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICAvLyAoYykgTWF5YmUgdGhlcmUgYXJlIG90aGVyIGRvY3VtZW50cyBvdXQgdGhlcmUgdGhhdCBzaG91bGQgYmUgaW4gb3VyXG4gICAgICAvLyBidWZmZXIuIEJ1dCBpbiB0aGF0IGNhc2UsIHdoZW4gd2UgZW1wdGllZCBfdW5wdWJsaXNoZWRCdWZmZXIgaW5cbiAgICAgIC8vIF9yZW1vdmVCdWZmZXJlZCwgd2Ugc2hvdWxkIGhhdmUgY2FsbGVkIF9uZWVkVG9Qb2xsUXVlcnksIHdoaWNoIHdpbGxcbiAgICAgIC8vIGVpdGhlciBwdXQgc29tZXRoaW5nIGluIF91bnB1Ymxpc2hlZEJ1ZmZlciBvciBzZXQgX3NhZmVBcHBlbmRUb0J1ZmZlclxuICAgICAgLy8gKG9yIGJvdGgpLCBhbmQgaXQgd2lsbCBwdXQgdXMgaW4gUVVFUllJTkcgZm9yIHRoYXQgd2hvbGUgdGltZS4gU28gaW5cbiAgICAgIC8vIGZhY3QsIHdlIHNob3VsZG4ndCBiZSBhYmxlIHRvIGdldCBoZXJlLlxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCdWZmZXIgaW5leHBsaWNhYmx5IGVtcHR5XCIpO1xuICAgIH0pO1xuICB9LFxuICBfY2hhbmdlUHVibGlzaGVkOiBmdW5jdGlvbiAoaWQsIG9sZERvYywgbmV3RG9jKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuX3B1Ymxpc2hlZC5zZXQoaWQsIHNlbGYuX3NoYXJlZFByb2plY3Rpb25GbihuZXdEb2MpKTtcbiAgICAgIHZhciBwcm9qZWN0ZWROZXcgPSBzZWxmLl9wcm9qZWN0aW9uRm4obmV3RG9jKTtcbiAgICAgIHZhciBwcm9qZWN0ZWRPbGQgPSBzZWxmLl9wcm9qZWN0aW9uRm4ob2xkRG9jKTtcbiAgICAgIHZhciBjaGFuZ2VkID0gRGlmZlNlcXVlbmNlLm1ha2VDaGFuZ2VkRmllbGRzKFxuICAgICAgICBwcm9qZWN0ZWROZXcsIHByb2plY3RlZE9sZCk7XG4gICAgICBpZiAoIWlzRW1wdHkoY2hhbmdlZCkpXG4gICAgICAgIHNlbGYuX211bHRpcGxleGVyLmNoYW5nZWQoaWQsIGNoYW5nZWQpO1xuICAgIH0pO1xuICB9LFxuICBfYWRkQnVmZmVyZWQ6IGZ1bmN0aW9uIChpZCwgZG9jKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLnNldChpZCwgc2VsZi5fc2hhcmVkUHJvamVjdGlvbkZuKGRvYykpO1xuXG4gICAgICAvLyBJZiBzb21ldGhpbmcgaXMgb3ZlcmZsb3dpbmcgdGhlIGJ1ZmZlciwgd2UganVzdCByZW1vdmUgaXQgZnJvbSBjYWNoZVxuICAgICAgaWYgKHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLnNpemUoKSA+IHNlbGYuX2xpbWl0KSB7XG4gICAgICAgIHZhciBtYXhCdWZmZXJlZElkID0gc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIubWF4RWxlbWVudElkKCk7XG5cbiAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIucmVtb3ZlKG1heEJ1ZmZlcmVkSWQpO1xuXG4gICAgICAgIC8vIFNpbmNlIHNvbWV0aGluZyBtYXRjaGluZyBpcyByZW1vdmVkIGZyb20gY2FjaGUgKGJvdGggcHVibGlzaGVkIHNldCBhbmRcbiAgICAgICAgLy8gYnVmZmVyKSwgc2V0IGZsYWcgdG8gZmFsc2VcbiAgICAgICAgc2VsZi5fc2FmZUFwcGVuZFRvQnVmZmVyID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIC8vIElzIGNhbGxlZCBlaXRoZXIgdG8gcmVtb3ZlIHRoZSBkb2MgY29tcGxldGVseSBmcm9tIG1hdGNoaW5nIHNldCBvciB0byBtb3ZlXG4gIC8vIGl0IHRvIHRoZSBwdWJsaXNoZWQgc2V0IGxhdGVyLlxuICBfcmVtb3ZlQnVmZmVyZWQ6IGZ1bmN0aW9uIChpZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5yZW1vdmUoaWQpO1xuICAgICAgLy8gVG8ga2VlcCB0aGUgY29udHJhY3QgXCJidWZmZXIgaXMgbmV2ZXIgZW1wdHkgaW4gU1RFQURZIHBoYXNlIHVubGVzcyB0aGVcbiAgICAgIC8vIGV2ZXJ5dGhpbmcgbWF0Y2hpbmcgZml0cyBpbnRvIHB1Ymxpc2hlZFwiIHRydWUsIHdlIHBvbGwgZXZlcnl0aGluZyBhc1xuICAgICAgLy8gc29vbiBhcyB3ZSBzZWUgdGhlIGJ1ZmZlciBiZWNvbWluZyBlbXB0eS5cbiAgICAgIGlmICghIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLnNpemUoKSAmJiAhIHNlbGYuX3NhZmVBcHBlbmRUb0J1ZmZlcilcbiAgICAgICAgc2VsZi5fbmVlZFRvUG9sbFF1ZXJ5KCk7XG4gICAgfSk7XG4gIH0sXG4gIC8vIENhbGxlZCB3aGVuIGEgZG9jdW1lbnQgaGFzIGpvaW5lZCB0aGUgXCJNYXRjaGluZ1wiIHJlc3VsdHMgc2V0LlxuICAvLyBUYWtlcyByZXNwb25zaWJpbGl0eSBvZiBrZWVwaW5nIF91bnB1Ymxpc2hlZEJ1ZmZlciBpbiBzeW5jIHdpdGggX3B1Ymxpc2hlZFxuICAvLyBhbmQgdGhlIGVmZmVjdCBvZiBsaW1pdCBlbmZvcmNlZC5cbiAgX2FkZE1hdGNoaW5nOiBmdW5jdGlvbiAoZG9jKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpZCA9IGRvYy5faWQ7XG4gICAgICBpZiAoc2VsZi5fcHVibGlzaGVkLmhhcyhpZCkpXG4gICAgICAgIHRocm93IEVycm9yKFwidHJpZWQgdG8gYWRkIHNvbWV0aGluZyBhbHJlYWR5IHB1Ymxpc2hlZCBcIiArIGlkKTtcbiAgICAgIGlmIChzZWxmLl9saW1pdCAmJiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5oYXMoaWQpKVxuICAgICAgICB0aHJvdyBFcnJvcihcInRyaWVkIHRvIGFkZCBzb21ldGhpbmcgYWxyZWFkeSBleGlzdGVkIGluIGJ1ZmZlciBcIiArIGlkKTtcblxuICAgICAgdmFyIGxpbWl0ID0gc2VsZi5fbGltaXQ7XG4gICAgICB2YXIgY29tcGFyYXRvciA9IHNlbGYuX2NvbXBhcmF0b3I7XG4gICAgICB2YXIgbWF4UHVibGlzaGVkID0gKGxpbWl0ICYmIHNlbGYuX3B1Ymxpc2hlZC5zaXplKCkgPiAwKSA/XG4gICAgICAgIHNlbGYuX3B1Ymxpc2hlZC5nZXQoc2VsZi5fcHVibGlzaGVkLm1heEVsZW1lbnRJZCgpKSA6IG51bGw7XG4gICAgICB2YXIgbWF4QnVmZmVyZWQgPSAobGltaXQgJiYgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpID4gMClcbiAgICAgICAgPyBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5nZXQoc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIubWF4RWxlbWVudElkKCkpXG4gICAgICAgIDogbnVsbDtcbiAgICAgIC8vIFRoZSBxdWVyeSBpcyB1bmxpbWl0ZWQgb3IgZGlkbid0IHB1Ymxpc2ggZW5vdWdoIGRvY3VtZW50cyB5ZXQgb3IgdGhlXG4gICAgICAvLyBuZXcgZG9jdW1lbnQgd291bGQgZml0IGludG8gcHVibGlzaGVkIHNldCBwdXNoaW5nIHRoZSBtYXhpbXVtIGVsZW1lbnRcbiAgICAgIC8vIG91dCwgdGhlbiB3ZSBuZWVkIHRvIHB1Ymxpc2ggdGhlIGRvYy5cbiAgICAgIHZhciB0b1B1Ymxpc2ggPSAhIGxpbWl0IHx8IHNlbGYuX3B1Ymxpc2hlZC5zaXplKCkgPCBsaW1pdCB8fFxuICAgICAgICBjb21wYXJhdG9yKGRvYywgbWF4UHVibGlzaGVkKSA8IDA7XG5cbiAgICAgIC8vIE90aGVyd2lzZSB3ZSBtaWdodCBuZWVkIHRvIGJ1ZmZlciBpdCAob25seSBpbiBjYXNlIG9mIGxpbWl0ZWQgcXVlcnkpLlxuICAgICAgLy8gQnVmZmVyaW5nIGlzIGFsbG93ZWQgaWYgdGhlIGJ1ZmZlciBpcyBub3QgZmlsbGVkIHVwIHlldCBhbmQgYWxsXG4gICAgICAvLyBtYXRjaGluZyBkb2NzIGFyZSBlaXRoZXIgaW4gdGhlIHB1Ymxpc2hlZCBzZXQgb3IgaW4gdGhlIGJ1ZmZlci5cbiAgICAgIHZhciBjYW5BcHBlbmRUb0J1ZmZlciA9ICF0b1B1Ymxpc2ggJiYgc2VsZi5fc2FmZUFwcGVuZFRvQnVmZmVyICYmXG4gICAgICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLnNpemUoKSA8IGxpbWl0O1xuXG4gICAgICAvLyBPciBpZiBpdCBpcyBzbWFsbCBlbm91Z2ggdG8gYmUgc2FmZWx5IGluc2VydGVkIHRvIHRoZSBtaWRkbGUgb3IgdGhlXG4gICAgICAvLyBiZWdpbm5pbmcgb2YgdGhlIGJ1ZmZlci5cbiAgICAgIHZhciBjYW5JbnNlcnRJbnRvQnVmZmVyID0gIXRvUHVibGlzaCAmJiBtYXhCdWZmZXJlZCAmJlxuICAgICAgICBjb21wYXJhdG9yKGRvYywgbWF4QnVmZmVyZWQpIDw9IDA7XG5cbiAgICAgIHZhciB0b0J1ZmZlciA9IGNhbkFwcGVuZFRvQnVmZmVyIHx8IGNhbkluc2VydEludG9CdWZmZXI7XG5cbiAgICAgIGlmICh0b1B1Ymxpc2gpIHtcbiAgICAgICAgc2VsZi5fYWRkUHVibGlzaGVkKGlkLCBkb2MpO1xuICAgICAgfSBlbHNlIGlmICh0b0J1ZmZlcikge1xuICAgICAgICBzZWxmLl9hZGRCdWZmZXJlZChpZCwgZG9jKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRyb3BwaW5nIGl0IGFuZCBub3Qgc2F2aW5nIHRvIHRoZSBjYWNoZVxuICAgICAgICBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgLy8gQ2FsbGVkIHdoZW4gYSBkb2N1bWVudCBsZWF2ZXMgdGhlIFwiTWF0Y2hpbmdcIiByZXN1bHRzIHNldC5cbiAgLy8gVGFrZXMgcmVzcG9uc2liaWxpdHkgb2Yga2VlcGluZyBfdW5wdWJsaXNoZWRCdWZmZXIgaW4gc3luYyB3aXRoIF9wdWJsaXNoZWRcbiAgLy8gYW5kIHRoZSBlZmZlY3Qgb2YgbGltaXQgZW5mb3JjZWQuXG4gIF9yZW1vdmVNYXRjaGluZzogZnVuY3Rpb24gKGlkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghIHNlbGYuX3B1Ymxpc2hlZC5oYXMoaWQpICYmICEgc2VsZi5fbGltaXQpXG4gICAgICAgIHRocm93IEVycm9yKFwidHJpZWQgdG8gcmVtb3ZlIHNvbWV0aGluZyBtYXRjaGluZyBidXQgbm90IGNhY2hlZCBcIiArIGlkKTtcblxuICAgICAgaWYgKHNlbGYuX3B1Ymxpc2hlZC5oYXMoaWQpKSB7XG4gICAgICAgIHNlbGYuX3JlbW92ZVB1Ymxpc2hlZChpZCk7XG4gICAgICB9IGVsc2UgaWYgKHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmhhcyhpZCkpIHtcbiAgICAgICAgc2VsZi5fcmVtb3ZlQnVmZmVyZWQoaWQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfaGFuZGxlRG9jOiBmdW5jdGlvbiAoaWQsIG5ld0RvYykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbWF0Y2hlc05vdyA9IG5ld0RvYyAmJiBzZWxmLl9tYXRjaGVyLmRvY3VtZW50TWF0Y2hlcyhuZXdEb2MpLnJlc3VsdDtcblxuICAgICAgdmFyIHB1Ymxpc2hlZEJlZm9yZSA9IHNlbGYuX3B1Ymxpc2hlZC5oYXMoaWQpO1xuICAgICAgdmFyIGJ1ZmZlcmVkQmVmb3JlID0gc2VsZi5fbGltaXQgJiYgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuaGFzKGlkKTtcbiAgICAgIHZhciBjYWNoZWRCZWZvcmUgPSBwdWJsaXNoZWRCZWZvcmUgfHwgYnVmZmVyZWRCZWZvcmU7XG5cbiAgICAgIGlmIChtYXRjaGVzTm93ICYmICFjYWNoZWRCZWZvcmUpIHtcbiAgICAgICAgc2VsZi5fYWRkTWF0Y2hpbmcobmV3RG9jKTtcbiAgICAgIH0gZWxzZSBpZiAoY2FjaGVkQmVmb3JlICYmICFtYXRjaGVzTm93KSB7XG4gICAgICAgIHNlbGYuX3JlbW92ZU1hdGNoaW5nKGlkKTtcbiAgICAgIH0gZWxzZSBpZiAoY2FjaGVkQmVmb3JlICYmIG1hdGNoZXNOb3cpIHtcbiAgICAgICAgdmFyIG9sZERvYyA9IHNlbGYuX3B1Ymxpc2hlZC5nZXQoaWQpO1xuICAgICAgICB2YXIgY29tcGFyYXRvciA9IHNlbGYuX2NvbXBhcmF0b3I7XG4gICAgICAgIHZhciBtaW5CdWZmZXJlZCA9IHNlbGYuX2xpbWl0ICYmIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLnNpemUoKSAmJlxuICAgICAgICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmdldChzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5taW5FbGVtZW50SWQoKSk7XG4gICAgICAgIHZhciBtYXhCdWZmZXJlZDtcblxuICAgICAgICBpZiAocHVibGlzaGVkQmVmb3JlKSB7XG4gICAgICAgICAgLy8gVW5saW1pdGVkIGNhc2Ugd2hlcmUgdGhlIGRvY3VtZW50IHN0YXlzIGluIHB1Ymxpc2hlZCBvbmNlIGl0XG4gICAgICAgICAgLy8gbWF0Y2hlcyBvciB0aGUgY2FzZSB3aGVuIHdlIGRvbid0IGhhdmUgZW5vdWdoIG1hdGNoaW5nIGRvY3MgdG9cbiAgICAgICAgICAvLyBwdWJsaXNoIG9yIHRoZSBjaGFuZ2VkIGJ1dCBtYXRjaGluZyBkb2Mgd2lsbCBzdGF5IGluIHB1Ymxpc2hlZFxuICAgICAgICAgIC8vIGFueXdheXMuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBYWFg6IFdlIHJlbHkgb24gdGhlIGVtcHRpbmVzcyBvZiBidWZmZXIuIEJlIHN1cmUgdG8gbWFpbnRhaW4gdGhlXG4gICAgICAgICAgLy8gZmFjdCB0aGF0IGJ1ZmZlciBjYW4ndCBiZSBlbXB0eSBpZiB0aGVyZSBhcmUgbWF0Y2hpbmcgZG9jdW1lbnRzIG5vdFxuICAgICAgICAgIC8vIHB1Ymxpc2hlZC4gTm90YWJseSwgd2UgZG9uJ3Qgd2FudCB0byBzY2hlZHVsZSByZXBvbGwgYW5kIGNvbnRpbnVlXG4gICAgICAgICAgLy8gcmVseWluZyBvbiB0aGlzIHByb3BlcnR5LlxuICAgICAgICAgIHZhciBzdGF5c0luUHVibGlzaGVkID0gISBzZWxmLl9saW1pdCB8fFxuICAgICAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpID09PSAwIHx8XG4gICAgICAgICAgICBjb21wYXJhdG9yKG5ld0RvYywgbWluQnVmZmVyZWQpIDw9IDA7XG5cbiAgICAgICAgICBpZiAoc3RheXNJblB1Ymxpc2hlZCkge1xuICAgICAgICAgICAgc2VsZi5fY2hhbmdlUHVibGlzaGVkKGlkLCBvbGREb2MsIG5ld0RvYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGFmdGVyIHRoZSBjaGFuZ2UgZG9jIGRvZXNuJ3Qgc3RheSBpbiB0aGUgcHVibGlzaGVkLCByZW1vdmUgaXRcbiAgICAgICAgICAgIHNlbGYuX3JlbW92ZVB1Ymxpc2hlZChpZCk7XG4gICAgICAgICAgICAvLyBidXQgaXQgY2FuIG1vdmUgaW50byBidWZmZXJlZCBub3csIGNoZWNrIGl0XG4gICAgICAgICAgICBtYXhCdWZmZXJlZCA9IHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmdldChcbiAgICAgICAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIubWF4RWxlbWVudElkKCkpO1xuXG4gICAgICAgICAgICB2YXIgdG9CdWZmZXIgPSBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgfHxcbiAgICAgICAgICAgICAgICAgIChtYXhCdWZmZXJlZCAmJiBjb21wYXJhdG9yKG5ld0RvYywgbWF4QnVmZmVyZWQpIDw9IDApO1xuXG4gICAgICAgICAgICBpZiAodG9CdWZmZXIpIHtcbiAgICAgICAgICAgICAgc2VsZi5fYWRkQnVmZmVyZWQoaWQsIG5ld0RvYyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUaHJvdyBhd2F5IGZyb20gYm90aCBwdWJsaXNoZWQgc2V0IGFuZCBidWZmZXJcbiAgICAgICAgICAgICAgc2VsZi5fc2FmZUFwcGVuZFRvQnVmZmVyID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGJ1ZmZlcmVkQmVmb3JlKSB7XG4gICAgICAgICAgb2xkRG9jID0gc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuZ2V0KGlkKTtcbiAgICAgICAgICAvLyByZW1vdmUgdGhlIG9sZCB2ZXJzaW9uIG1hbnVhbGx5IGluc3RlYWQgb2YgdXNpbmcgX3JlbW92ZUJ1ZmZlcmVkIHNvXG4gICAgICAgICAgLy8gd2UgZG9uJ3QgdHJpZ2dlciB0aGUgcXVlcnlpbmcgaW1tZWRpYXRlbHkuICBpZiB3ZSBlbmQgdGhpcyBibG9ja1xuICAgICAgICAgIC8vIHdpdGggdGhlIGJ1ZmZlciBlbXB0eSwgd2Ugd2lsbCBuZWVkIHRvIHRyaWdnZXIgdGhlIHF1ZXJ5IHBvbGxcbiAgICAgICAgICAvLyBtYW51YWxseSB0b28uXG4gICAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIucmVtb3ZlKGlkKTtcblxuICAgICAgICAgIHZhciBtYXhQdWJsaXNoZWQgPSBzZWxmLl9wdWJsaXNoZWQuZ2V0KFxuICAgICAgICAgICAgc2VsZi5fcHVibGlzaGVkLm1heEVsZW1lbnRJZCgpKTtcbiAgICAgICAgICBtYXhCdWZmZXJlZCA9IHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLnNpemUoKSAmJlxuICAgICAgICAgICAgICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmdldChcbiAgICAgICAgICAgICAgICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLm1heEVsZW1lbnRJZCgpKTtcblxuICAgICAgICAgIC8vIHRoZSBidWZmZXJlZCBkb2Mgd2FzIHVwZGF0ZWQsIGl0IGNvdWxkIG1vdmUgdG8gcHVibGlzaGVkXG4gICAgICAgICAgdmFyIHRvUHVibGlzaCA9IGNvbXBhcmF0b3IobmV3RG9jLCBtYXhQdWJsaXNoZWQpIDwgMDtcblxuICAgICAgICAgIC8vIG9yIHN0YXlzIGluIGJ1ZmZlciBldmVuIGFmdGVyIHRoZSBjaGFuZ2VcbiAgICAgICAgICB2YXIgc3RheXNJbkJ1ZmZlciA9ICghIHRvUHVibGlzaCAmJiBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIpIHx8XG4gICAgICAgICAgICAgICAgKCF0b1B1Ymxpc2ggJiYgbWF4QnVmZmVyZWQgJiZcbiAgICAgICAgICAgICAgICAgY29tcGFyYXRvcihuZXdEb2MsIG1heEJ1ZmZlcmVkKSA8PSAwKTtcblxuICAgICAgICAgIGlmICh0b1B1Ymxpc2gpIHtcbiAgICAgICAgICAgIHNlbGYuX2FkZFB1Ymxpc2hlZChpZCwgbmV3RG9jKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHN0YXlzSW5CdWZmZXIpIHtcbiAgICAgICAgICAgIC8vIHN0YXlzIGluIGJ1ZmZlciBidXQgY2hhbmdlc1xuICAgICAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2V0KGlkLCBuZXdEb2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaHJvdyBhd2F5IGZyb20gYm90aCBwdWJsaXNoZWQgc2V0IGFuZCBidWZmZXJcbiAgICAgICAgICAgIHNlbGYuX3NhZmVBcHBlbmRUb0J1ZmZlciA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gTm9ybWFsbHkgdGhpcyBjaGVjayB3b3VsZCBoYXZlIGJlZW4gZG9uZSBpbiBfcmVtb3ZlQnVmZmVyZWQgYnV0XG4gICAgICAgICAgICAvLyB3ZSBkaWRuJ3QgdXNlIGl0LCBzbyB3ZSBuZWVkIHRvIGRvIGl0IG91cnNlbGYgbm93LlxuICAgICAgICAgICAgaWYgKCEgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpKSB7XG4gICAgICAgICAgICAgIHNlbGYuX25lZWRUb1BvbGxRdWVyeSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYWNoZWRCZWZvcmUgaW1wbGllcyBlaXRoZXIgb2YgcHVibGlzaGVkQmVmb3JlIG9yIGJ1ZmZlcmVkQmVmb3JlIGlzIHRydWUuXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9mZXRjaE1vZGlmaWVkRG9jdW1lbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuX3JlZ2lzdGVyUGhhc2VDaGFuZ2UoUEhBU0UuRkVUQ0hJTkcpO1xuICAgIC8vIERlZmVyLCBiZWNhdXNlIG5vdGhpbmcgY2FsbGVkIGZyb20gdGhlIG9wbG9nIGVudHJ5IGhhbmRsZXIgbWF5IHlpZWxkLFxuICAgIC8vIGJ1dCBmZXRjaCgpIHlpZWxkcy5cbiAgICBNZXRlb3IuZGVmZXIoZmluaXNoSWZOZWVkVG9Qb2xsUXVlcnkoYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgd2hpbGUgKCFzZWxmLl9zdG9wcGVkICYmICFzZWxmLl9uZWVkVG9GZXRjaC5lbXB0eSgpKSB7XG4gICAgICAgIGlmIChzZWxmLl9waGFzZSA9PT0gUEhBU0UuUVVFUllJTkcpIHtcbiAgICAgICAgICAvLyBXaGlsZSBmZXRjaGluZywgd2UgZGVjaWRlZCB0byBnbyBpbnRvIFFVRVJZSU5HIG1vZGUsIGFuZCB0aGVuIHdlXG4gICAgICAgICAgLy8gc2F3IGFub3RoZXIgb3Bsb2cgZW50cnksIHNvIF9uZWVkVG9GZXRjaCBpcyBub3QgZW1wdHkuIEJ1dCB3ZVxuICAgICAgICAgIC8vIHNob3VsZG4ndCBmZXRjaCB0aGVzZSBkb2N1bWVudHMgdW50aWwgQUZURVIgdGhlIHF1ZXJ5IGlzIGRvbmUuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZWluZyBpbiBzdGVhZHkgcGhhc2UgaGVyZSB3b3VsZCBiZSBzdXJwcmlzaW5nLlxuICAgICAgICBpZiAoc2VsZi5fcGhhc2UgIT09IFBIQVNFLkZFVENISU5HKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBoYXNlIGluIGZldGNoTW9kaWZpZWREb2N1bWVudHM6IFwiICsgc2VsZi5fcGhhc2UpO1xuXG4gICAgICAgIHNlbGYuX2N1cnJlbnRseUZldGNoaW5nID0gc2VsZi5fbmVlZFRvRmV0Y2g7XG4gICAgICAgIHZhciB0aGlzR2VuZXJhdGlvbiA9ICsrc2VsZi5fZmV0Y2hHZW5lcmF0aW9uO1xuICAgICAgICBzZWxmLl9uZWVkVG9GZXRjaCA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwO1xuICAgICAgICB2YXIgd2FpdGluZyA9IDA7XG5cbiAgICAgICAgbGV0IHByb21pc2VSZXNvbHZlciA9IG51bGw7XG4gICAgICAgIGNvbnN0IGF3YWl0YWJsZVByb21pc2UgPSBuZXcgUHJvbWlzZShyID0+IHByb21pc2VSZXNvbHZlciA9IHIpO1xuICAgICAgICAvLyBUaGlzIGxvb3AgaXMgc2FmZSwgYmVjYXVzZSBfY3VycmVudGx5RmV0Y2hpbmcgd2lsbCBub3QgYmUgdXBkYXRlZFxuICAgICAgICAvLyBkdXJpbmcgdGhpcyBsb29wIChpbiBmYWN0LCBpdCBpcyBuZXZlciBtdXRhdGVkKS5cbiAgICAgICAgYXdhaXQgc2VsZi5fY3VycmVudGx5RmV0Y2hpbmcuZm9yRWFjaEFzeW5jKGFzeW5jIGZ1bmN0aW9uIChvcCwgaWQpIHtcbiAgICAgICAgICB3YWl0aW5nKys7XG4gICAgICAgICAgYXdhaXQgc2VsZi5fbW9uZ29IYW5kbGUuX2RvY0ZldGNoZXIuZmV0Y2goXG4gICAgICAgICAgICBzZWxmLl9jdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgb3AsXG4gICAgICAgICAgICBmaW5pc2hJZk5lZWRUb1BvbGxRdWVyeShmdW5jdGlvbihlcnIsIGRvYykge1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgTWV0ZW9yLl9kZWJ1ZygnR290IGV4Y2VwdGlvbiB3aGlsZSBmZXRjaGluZyBkb2N1bWVudHMnLCBlcnIpO1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIGdldCBhbiBlcnJvciBmcm9tIHRoZSBmZXRjaGVyIChlZywgdHJvdWJsZVxuICAgICAgICAgICAgICAgIC8vIGNvbm5lY3RpbmcgdG8gTW9uZ28pLCBsZXQncyBqdXN0IGFiYW5kb24gdGhlIGZldGNoIHBoYXNlXG4gICAgICAgICAgICAgICAgLy8gYWx0b2dldGhlciBhbmQgZmFsbCBiYWNrIHRvIHBvbGxpbmcuIEl0J3Mgbm90IGxpa2Ugd2UncmVcbiAgICAgICAgICAgICAgICAvLyBnZXR0aW5nIGxpdmUgdXBkYXRlcyBhbnl3YXkuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX3BoYXNlICE9PSBQSEFTRS5RVUVSWUlORykge1xuICAgICAgICAgICAgICAgICAgc2VsZi5fbmVlZFRvUG9sbFF1ZXJ5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdhaXRpbmctLTtcbiAgICAgICAgICAgICAgICAvLyBCZWNhdXNlIGZldGNoKCkgbmV2ZXIgY2FsbHMgaXRzIGNhbGxiYWNrIHN5bmNocm9ub3VzbHksXG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBzYWZlIChpZSwgd2Ugd29uJ3QgY2FsbCBmdXQucmV0dXJuKCkgYmVmb3JlIHRoZVxuICAgICAgICAgICAgICAgIC8vIGZvckVhY2ggaXMgZG9uZSkuXG4gICAgICAgICAgICAgICAgaWYgKHdhaXRpbmcgPT09IDApIHByb21pc2VSZXNvbHZlcigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgIXNlbGYuX3N0b3BwZWQgJiZcbiAgICAgICAgICAgICAgICAgIHNlbGYuX3BoYXNlID09PSBQSEFTRS5GRVRDSElORyAmJlxuICAgICAgICAgICAgICAgICAgc2VsZi5fZmV0Y2hHZW5lcmF0aW9uID09PSB0aGlzR2VuZXJhdGlvblxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgLy8gV2UgcmUtY2hlY2sgdGhlIGdlbmVyYXRpb24gaW4gY2FzZSB3ZSd2ZSBoYWQgYW4gZXhwbGljaXRcbiAgICAgICAgICAgICAgICAgIC8vIF9wb2xsUXVlcnkgY2FsbCAoZWcsIGluIGFub3RoZXIgZmliZXIpIHdoaWNoIHNob3VsZFxuICAgICAgICAgICAgICAgICAgLy8gZWZmZWN0aXZlbHkgY2FuY2VsIHRoaXMgcm91bmQgb2YgZmV0Y2hlcy4gIChfcG9sbFF1ZXJ5XG4gICAgICAgICAgICAgICAgICAvLyBpbmNyZW1lbnRzIHRoZSBnZW5lcmF0aW9uLilcblxuICAgICAgICAgICAgICAgICAgc2VsZi5faGFuZGxlRG9jKGlkLCBkb2MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB3YWl0aW5nLS07XG4gICAgICAgICAgICAgICAgLy8gQmVjYXVzZSBmZXRjaCgpIG5ldmVyIGNhbGxzIGl0cyBjYWxsYmFjayBzeW5jaHJvbm91c2x5LFxuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgc2FmZSAoaWUsIHdlIHdvbid0IGNhbGwgZnV0LnJldHVybigpIGJlZm9yZSB0aGVcbiAgICAgICAgICAgICAgICAvLyBmb3JFYWNoIGlzIGRvbmUpLlxuICAgICAgICAgICAgICAgIGlmICh3YWl0aW5nID09PSAwKSBwcm9taXNlUmVzb2x2ZXIoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgYXdhaXRhYmxlUHJvbWlzZTtcbiAgICAgICAgLy8gRXhpdCBub3cgaWYgd2UndmUgaGFkIGEgX3BvbGxRdWVyeSBjYWxsIChoZXJlIG9yIGluIGFub3RoZXIgZmliZXIpLlxuICAgICAgICBpZiAoc2VsZi5fcGhhc2UgPT09IFBIQVNFLlFVRVJZSU5HKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgc2VsZi5fY3VycmVudGx5RmV0Y2hpbmcgPSBudWxsO1xuICAgICAgfVxuICAgICAgLy8gV2UncmUgZG9uZSBmZXRjaGluZywgc28gd2UgY2FuIGJlIHN0ZWFkeSwgdW5sZXNzIHdlJ3ZlIGhhZCBhXG4gICAgICAvLyBfcG9sbFF1ZXJ5IGNhbGwgKGhlcmUgb3IgaW4gYW5vdGhlciBmaWJlcikuXG4gICAgICBpZiAoc2VsZi5fcGhhc2UgIT09IFBIQVNFLlFVRVJZSU5HKVxuICAgICAgICBhd2FpdCBzZWxmLl9iZVN0ZWFkeSgpO1xuICAgIH0pKTtcbiAgfSxcbiAgX2JlU3RlYWR5OiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuX3JlZ2lzdGVyUGhhc2VDaGFuZ2UoUEhBU0UuU1RFQURZKTtcbiAgICB2YXIgd3JpdGVzID0gc2VsZi5fd3JpdGVzVG9Db21taXRXaGVuV2VSZWFjaFN0ZWFkeSB8fCBbXTtcbiAgICBzZWxmLl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5ID0gW107XG4gICAgYXdhaXQgc2VsZi5fbXVsdGlwbGV4ZXIub25GbHVzaChhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKGNvbnN0IHcgb2Ygd3JpdGVzKSB7XG4gICAgICAgICAgYXdhaXQgdy5jb21taXR0ZWQoKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiX2JlU3RlYWR5IGVycm9yXCIsIHt3cml0ZXN9LCBlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX2hhbmRsZU9wbG9nRW50cnlRdWVyeWluZzogZnVuY3Rpb24gKG9wKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuX25lZWRUb0ZldGNoLnNldChpZEZvck9wKG9wKSwgb3ApO1xuICAgIH0pO1xuICB9LFxuICBfaGFuZGxlT3Bsb2dFbnRyeVN0ZWFkeU9yRmV0Y2hpbmc6IGZ1bmN0aW9uIChvcCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaWQgPSBpZEZvck9wKG9wKTtcbiAgICAgIC8vIElmIHdlJ3JlIGFscmVhZHkgZmV0Y2hpbmcgdGhpcyBvbmUsIG9yIGFib3V0IHRvLCB3ZSBjYW4ndCBvcHRpbWl6ZTtcbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHdlIGZldGNoIGl0IGFnYWluIGlmIG5lY2Vzc2FyeS5cblxuICAgICAgaWYgKHNlbGYuX3BoYXNlID09PSBQSEFTRS5GRVRDSElORyAmJlxuICAgICAgICAgICgoc2VsZi5fY3VycmVudGx5RmV0Y2hpbmcgJiYgc2VsZi5fY3VycmVudGx5RmV0Y2hpbmcuaGFzKGlkKSkgfHxcbiAgICAgICAgICAgc2VsZi5fbmVlZFRvRmV0Y2guaGFzKGlkKSkpIHtcbiAgICAgICAgc2VsZi5fbmVlZFRvRmV0Y2guc2V0KGlkLCBvcCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wLm9wID09PSAnZCcpIHtcbiAgICAgICAgaWYgKHNlbGYuX3B1Ymxpc2hlZC5oYXMoaWQpIHx8XG4gICAgICAgICAgICAoc2VsZi5fbGltaXQgJiYgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuaGFzKGlkKSkpXG4gICAgICAgICAgc2VsZi5fcmVtb3ZlTWF0Y2hpbmcoaWQpO1xuICAgICAgfSBlbHNlIGlmIChvcC5vcCA9PT0gJ2knKSB7XG4gICAgICAgIGlmIChzZWxmLl9wdWJsaXNoZWQuaGFzKGlkKSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnNlcnQgZm91bmQgZm9yIGFscmVhZHktZXhpc3RpbmcgSUQgaW4gcHVibGlzaGVkXCIpO1xuICAgICAgICBpZiAoc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIgJiYgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuaGFzKGlkKSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnNlcnQgZm91bmQgZm9yIGFscmVhZHktZXhpc3RpbmcgSUQgaW4gYnVmZmVyXCIpO1xuXG4gICAgICAgIC8vIFhYWCB3aGF0IGlmIHNlbGVjdG9yIHlpZWxkcz8gIGZvciBub3cgaXQgY2FuJ3QgYnV0IGxhdGVyIGl0IGNvdWxkXG4gICAgICAgIC8vIGhhdmUgJHdoZXJlXG4gICAgICAgIGlmIChzZWxmLl9tYXRjaGVyLmRvY3VtZW50TWF0Y2hlcyhvcC5vKS5yZXN1bHQpXG4gICAgICAgICAgc2VsZi5fYWRkTWF0Y2hpbmcob3Aubyk7XG4gICAgICB9IGVsc2UgaWYgKG9wLm9wID09PSAndScpIHtcbiAgICAgICAgLy8gd2UgYXJlIG1hcHBpbmcgdGhlIG5ldyBvcGxvZyBmb3JtYXQgb24gbW9uZ28gNVxuICAgICAgICAvLyB0byB3aGF0IHdlIGtub3cgYmV0dGVyLCAkc2V0XG4gICAgICAgIG9wLm8gPSBvcGxvZ1YyVjFDb252ZXJ0ZXIob3AubylcbiAgICAgICAgLy8gSXMgdGhpcyBhIG1vZGlmaWVyICgkc2V0LyR1bnNldCwgd2hpY2ggbWF5IHJlcXVpcmUgdXMgdG8gcG9sbCB0aGVcbiAgICAgICAgLy8gZGF0YWJhc2UgdG8gZmlndXJlIG91dCBpZiB0aGUgd2hvbGUgZG9jdW1lbnQgbWF0Y2hlcyB0aGUgc2VsZWN0b3IpIG9yXG4gICAgICAgIC8vIGEgcmVwbGFjZW1lbnQgKGluIHdoaWNoIGNhc2Ugd2UgY2FuIGp1c3QgZGlyZWN0bHkgcmUtZXZhbHVhdGUgdGhlXG4gICAgICAgIC8vIHNlbGVjdG9yKT9cbiAgICAgICAgLy8gb3Bsb2cgZm9ybWF0IGhhcyBjaGFuZ2VkIG9uIG1vbmdvZGIgNSwgd2UgaGF2ZSB0byBzdXBwb3J0IGJvdGggbm93XG4gICAgICAgIC8vIGRpZmYgaXMgdGhlIGZvcm1hdCBpbiBNb25nbyA1KyAob3Bsb2cgdjIpXG4gICAgICAgIHZhciBpc1JlcGxhY2UgPSAhaGFzKG9wLm8sICckc2V0JykgJiYgIWhhcyhvcC5vLCAnZGlmZicpICYmICFoYXMob3AubywgJyR1bnNldCcpO1xuICAgICAgICAvLyBJZiB0aGlzIG1vZGlmaWVyIG1vZGlmaWVzIHNvbWV0aGluZyBpbnNpZGUgYW4gRUpTT04gY3VzdG9tIHR5cGUgKGllLFxuICAgICAgICAvLyBhbnl0aGluZyB3aXRoIEVKU09OJCksIHRoZW4gd2UgY2FuJ3QgdHJ5IHRvIHVzZVxuICAgICAgICAvLyBMb2NhbENvbGxlY3Rpb24uX21vZGlmeSwgc2luY2UgdGhhdCBqdXN0IG11dGF0ZXMgdGhlIEVKU09OIGVuY29kaW5nLFxuICAgICAgICAvLyBub3QgdGhlIGFjdHVhbCBvYmplY3QuXG4gICAgICAgIHZhciBjYW5EaXJlY3RseU1vZGlmeURvYyA9XG4gICAgICAgICAgIWlzUmVwbGFjZSAmJiBtb2RpZmllckNhbkJlRGlyZWN0bHlBcHBsaWVkKG9wLm8pO1xuXG4gICAgICAgIHZhciBwdWJsaXNoZWRCZWZvcmUgPSBzZWxmLl9wdWJsaXNoZWQuaGFzKGlkKTtcbiAgICAgICAgdmFyIGJ1ZmZlcmVkQmVmb3JlID0gc2VsZi5fbGltaXQgJiYgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuaGFzKGlkKTtcblxuICAgICAgICBpZiAoaXNSZXBsYWNlKSB7XG4gICAgICAgICAgc2VsZi5faGFuZGxlRG9jKGlkLCBPYmplY3QuYXNzaWduKHtfaWQ6IGlkfSwgb3AubykpO1xuICAgICAgICB9IGVsc2UgaWYgKChwdWJsaXNoZWRCZWZvcmUgfHwgYnVmZmVyZWRCZWZvcmUpICYmXG4gICAgICAgICAgICAgICAgICAgY2FuRGlyZWN0bHlNb2RpZnlEb2MpIHtcbiAgICAgICAgICAvLyBPaCBncmVhdCwgd2UgYWN0dWFsbHkga25vdyB3aGF0IHRoZSBkb2N1bWVudCBpcywgc28gd2UgY2FuIGFwcGx5XG4gICAgICAgICAgLy8gdGhpcyBkaXJlY3RseS5cbiAgICAgICAgICB2YXIgbmV3RG9jID0gc2VsZi5fcHVibGlzaGVkLmhhcyhpZClcbiAgICAgICAgICAgID8gc2VsZi5fcHVibGlzaGVkLmdldChpZCkgOiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5nZXQoaWQpO1xuICAgICAgICAgIG5ld0RvYyA9IEVKU09OLmNsb25lKG5ld0RvYyk7XG5cbiAgICAgICAgICBuZXdEb2MuX2lkID0gaWQ7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIExvY2FsQ29sbGVjdGlvbi5fbW9kaWZ5KG5ld0RvYywgb3Aubyk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUubmFtZSAhPT0gXCJNaW5pbW9uZ29FcnJvclwiKVxuICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgLy8gV2UgZGlkbid0IHVuZGVyc3RhbmQgdGhlIG1vZGlmaWVyLiAgUmUtZmV0Y2guXG4gICAgICAgICAgICBzZWxmLl9uZWVkVG9GZXRjaC5zZXQoaWQsIG9wKTtcbiAgICAgICAgICAgIGlmIChzZWxmLl9waGFzZSA9PT0gUEhBU0UuU1RFQURZKSB7XG4gICAgICAgICAgICAgIHNlbGYuX2ZldGNoTW9kaWZpZWREb2N1bWVudHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2VsZi5faGFuZGxlRG9jKGlkLCBzZWxmLl9zaGFyZWRQcm9qZWN0aW9uRm4obmV3RG9jKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWNhbkRpcmVjdGx5TW9kaWZ5RG9jIHx8XG4gICAgICAgICAgICAgICAgICAgc2VsZi5fbWF0Y2hlci5jYW5CZWNvbWVUcnVlQnlNb2RpZmllcihvcC5vKSB8fFxuICAgICAgICAgICAgICAgICAgIChzZWxmLl9zb3J0ZXIgJiYgc2VsZi5fc29ydGVyLmFmZmVjdGVkQnlNb2RpZmllcihvcC5vKSkpIHtcbiAgICAgICAgICBzZWxmLl9uZWVkVG9GZXRjaC5zZXQoaWQsIG9wKTtcbiAgICAgICAgICBpZiAoc2VsZi5fcGhhc2UgPT09IFBIQVNFLlNURUFEWSlcbiAgICAgICAgICAgIHNlbGYuX2ZldGNoTW9kaWZpZWREb2N1bWVudHMoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJYWFggU1VSUFJJU0lORyBPUEVSQVRJT046IFwiICsgb3ApO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGFzeW5jIF9ydW5Jbml0aWFsUXVlcnlBc3luYygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuX3N0b3BwZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvcGxvZyBzdG9wcGVkIHN1cnByaXNpbmdseSBlYXJseVwiKTtcblxuICAgIGF3YWl0IHNlbGYuX3J1blF1ZXJ5KHtpbml0aWFsOiB0cnVlfSk7ICAvLyB5aWVsZHNcblxuICAgIGlmIChzZWxmLl9zdG9wcGVkKVxuICAgICAgcmV0dXJuOyAgLy8gY2FuIGhhcHBlbiBvbiBxdWVyeUVycm9yXG5cbiAgICAvLyBBbGxvdyBvYnNlcnZlQ2hhbmdlcyBjYWxscyB0byByZXR1cm4uIChBZnRlciB0aGlzLCBpdCdzIHBvc3NpYmxlIGZvclxuICAgIC8vIHN0b3AoKSB0byBiZSBjYWxsZWQuKVxuICAgIGF3YWl0IHNlbGYuX211bHRpcGxleGVyLnJlYWR5KCk7XG5cbiAgICBhd2FpdCBzZWxmLl9kb25lUXVlcnlpbmcoKTsgIC8vIHlpZWxkc1xuICB9LFxuXG4gIC8vIFlpZWxkcyFcbiAgX3J1bkluaXRpYWxRdWVyeTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9ydW5Jbml0aWFsUXVlcnlBc3luYygpO1xuICB9LFxuXG4gIC8vIEluIHZhcmlvdXMgY2lyY3Vtc3RhbmNlcywgd2UgbWF5IGp1c3Qgd2FudCB0byBzdG9wIHByb2Nlc3NpbmcgdGhlIG9wbG9nIGFuZFxuICAvLyByZS1ydW4gdGhlIGluaXRpYWwgcXVlcnksIGp1c3QgYXMgaWYgd2Ugd2VyZSBhIFBvbGxpbmdPYnNlcnZlRHJpdmVyLlxuICAvL1xuICAvLyBUaGlzIGZ1bmN0aW9uIG1heSBub3QgYmxvY2ssIGJlY2F1c2UgaXQgaXMgY2FsbGVkIGZyb20gYW4gb3Bsb2cgZW50cnlcbiAgLy8gaGFuZGxlci5cbiAgLy9cbiAgLy8gWFhYIFdlIHNob3VsZCBjYWxsIHRoaXMgd2hlbiB3ZSBkZXRlY3QgdGhhdCB3ZSd2ZSBiZWVuIGluIEZFVENISU5HIGZvciBcInRvb1xuICAvLyBsb25nXCIuXG4gIC8vXG4gIC8vIFhYWCBXZSBzaG91bGQgY2FsbCB0aGlzIHdoZW4gd2UgZGV0ZWN0IE1vbmdvIGZhaWxvdmVyIChzaW5jZSB0aGF0IG1pZ2h0XG4gIC8vIG1lYW4gdGhhdCBzb21lIG9mIHRoZSBvcGxvZyBlbnRyaWVzIHdlIGhhdmUgcHJvY2Vzc2VkIGhhdmUgYmVlbiByb2xsZWRcbiAgLy8gYmFjaykuIFRoZSBOb2RlIE1vbmdvIGRyaXZlciBpcyBpbiB0aGUgbWlkZGxlIG9mIGEgYnVuY2ggb2YgaHVnZVxuICAvLyByZWZhY3RvcmluZ3MsIGluY2x1ZGluZyB0aGUgd2F5IHRoYXQgaXQgbm90aWZpZXMgeW91IHdoZW4gcHJpbWFyeVxuICAvLyBjaGFuZ2VzLiBXaWxsIHB1dCBvZmYgaW1wbGVtZW50aW5nIHRoaXMgdW50aWwgZHJpdmVyIDEuNCBpcyBvdXQuXG4gIF9wb2xsUXVlcnk6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNlbGYuX3N0b3BwZWQpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgLy8gWWF5LCB3ZSBnZXQgdG8gZm9yZ2V0IGFib3V0IGFsbCB0aGUgdGhpbmdzIHdlIHRob3VnaHQgd2UgaGFkIHRvIGZldGNoLlxuICAgICAgc2VsZi5fbmVlZFRvRmV0Y2ggPSBuZXcgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcDtcbiAgICAgIHNlbGYuX2N1cnJlbnRseUZldGNoaW5nID0gbnVsbDtcbiAgICAgICsrc2VsZi5fZmV0Y2hHZW5lcmF0aW9uOyAgLy8gaWdub3JlIGFueSBpbi1mbGlnaHQgZmV0Y2hlc1xuICAgICAgc2VsZi5fcmVnaXN0ZXJQaGFzZUNoYW5nZShQSEFTRS5RVUVSWUlORyk7XG5cbiAgICAgIC8vIERlZmVyIHNvIHRoYXQgd2UgZG9uJ3QgeWllbGQuICBXZSBkb24ndCBuZWVkIGZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5XG4gICAgICAvLyBoZXJlIGJlY2F1c2UgU3dpdGNoZWRUb1F1ZXJ5IGlzIG5vdCB0aHJvd24gaW4gUVVFUllJTkcgbW9kZS5cbiAgICAgIE1ldGVvci5kZWZlcihhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGF3YWl0IHNlbGYuX3J1blF1ZXJ5KCk7XG4gICAgICAgIGF3YWl0IHNlbGYuX2RvbmVRdWVyeWluZygpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gWWllbGRzIVxuICBhc3luYyBfcnVuUXVlcnlBc3luYyhvcHRpb25zKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBuZXdSZXN1bHRzLCBuZXdCdWZmZXI7XG5cbiAgICAvLyBUaGlzIHdoaWxlIGxvb3AgaXMganVzdCB0byByZXRyeSBmYWlsdXJlcy5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgLy8gSWYgd2UndmUgYmVlbiBzdG9wcGVkLCB3ZSBkb24ndCBoYXZlIHRvIHJ1biBhbnl0aGluZyBhbnkgbW9yZS5cbiAgICAgIGlmIChzZWxmLl9zdG9wcGVkKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIG5ld1Jlc3VsdHMgPSBuZXcgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcDtcbiAgICAgIG5ld0J1ZmZlciA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwO1xuXG4gICAgICAvLyBRdWVyeSAyeCBkb2N1bWVudHMgYXMgdGhlIGhhbGYgZXhjbHVkZWQgZnJvbSB0aGUgb3JpZ2luYWwgcXVlcnkgd2lsbCBnb1xuICAgICAgLy8gaW50byB1bnB1Ymxpc2hlZCBidWZmZXIgdG8gcmVkdWNlIGFkZGl0aW9uYWwgTW9uZ28gbG9va3VwcyBpbiBjYXNlc1xuICAgICAgLy8gd2hlbiBkb2N1bWVudHMgYXJlIHJlbW92ZWQgZnJvbSB0aGUgcHVibGlzaGVkIHNldCBhbmQgbmVlZCBhXG4gICAgICAvLyByZXBsYWNlbWVudC5cbiAgICAgIC8vIFhYWCBuZWVkcyBtb3JlIHRob3VnaHQgb24gbm9uLXplcm8gc2tpcFxuICAgICAgLy8gWFhYIDIgaXMgYSBcIm1hZ2ljIG51bWJlclwiIG1lYW5pbmcgdGhlcmUgaXMgYW4gZXh0cmEgY2h1bmsgb2YgZG9jcyBmb3JcbiAgICAgIC8vIGJ1ZmZlciBpZiBzdWNoIGlzIG5lZWRlZC5cbiAgICAgIHZhciBjdXJzb3IgPSBzZWxmLl9jdXJzb3JGb3JRdWVyeSh7IGxpbWl0OiBzZWxmLl9saW1pdCAqIDIgfSk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBjdXJzb3IuZm9yRWFjaChmdW5jdGlvbiAoZG9jLCBpKSB7ICAvLyB5aWVsZHNcbiAgICAgICAgICBpZiAoIXNlbGYuX2xpbWl0IHx8IGkgPCBzZWxmLl9saW1pdCkge1xuICAgICAgICAgICAgbmV3UmVzdWx0cy5zZXQoZG9jLl9pZCwgZG9jKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3QnVmZmVyLnNldChkb2MuX2lkLCBkb2MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAob3B0aW9ucy5pbml0aWFsICYmIHR5cGVvZihlLmNvZGUpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIC8vIFRoaXMgaXMgYW4gZXJyb3IgZG9jdW1lbnQgc2VudCB0byB1cyBieSBtb25nb2QsIG5vdCBhIGNvbm5lY3Rpb25cbiAgICAgICAgICAvLyBlcnJvciBnZW5lcmF0ZWQgYnkgdGhlIGNsaWVudC4gQW5kIHdlJ3ZlIG5ldmVyIHNlZW4gdGhpcyBxdWVyeSB3b3JrXG4gICAgICAgICAgLy8gc3VjY2Vzc2Z1bGx5LiBQcm9iYWJseSBpdCdzIGEgYmFkIHNlbGVjdG9yIG9yIHNvbWV0aGluZywgc28gd2VcbiAgICAgICAgICAvLyBzaG91bGQgTk9UIHJldHJ5LiBJbnN0ZWFkLCB3ZSBzaG91bGQgaGFsdCB0aGUgb2JzZXJ2ZSAod2hpY2ggZW5kc1xuICAgICAgICAgIC8vIHVwIGNhbGxpbmcgYHN0b3BgIG9uIHVzKS5cbiAgICAgICAgICBhd2FpdCBzZWxmLl9tdWx0aXBsZXhlci5xdWVyeUVycm9yKGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIER1cmluZyBmYWlsb3ZlciAoZWcpIGlmIHdlIGdldCBhbiBleGNlcHRpb24gd2Ugc2hvdWxkIGxvZyBhbmQgcmV0cnlcbiAgICAgICAgLy8gaW5zdGVhZCBvZiBjcmFzaGluZy5cbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIkdvdCBleGNlcHRpb24gd2hpbGUgcG9sbGluZyBxdWVyeVwiLCBlKTtcbiAgICAgICAgYXdhaXQgTWV0ZW9yLl9zbGVlcEZvck1zKDEwMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuX3N0b3BwZWQpXG4gICAgICByZXR1cm47XG5cbiAgICBzZWxmLl9wdWJsaXNoTmV3UmVzdWx0cyhuZXdSZXN1bHRzLCBuZXdCdWZmZXIpO1xuICB9LFxuXG4gIC8vIFlpZWxkcyFcbiAgX3J1blF1ZXJ5OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9ydW5RdWVyeUFzeW5jKG9wdGlvbnMpO1xuICB9LFxuXG4gIC8vIFRyYW5zaXRpb25zIHRvIFFVRVJZSU5HIGFuZCBydW5zIGFub3RoZXIgcXVlcnksIG9yIChpZiBhbHJlYWR5IGluIFFVRVJZSU5HKVxuICAvLyBlbnN1cmVzIHRoYXQgd2Ugd2lsbCBxdWVyeSBhZ2FpbiBsYXRlci5cbiAgLy9cbiAgLy8gVGhpcyBmdW5jdGlvbiBtYXkgbm90IGJsb2NrLCBiZWNhdXNlIGl0IGlzIGNhbGxlZCBmcm9tIGFuIG9wbG9nIGVudHJ5XG4gIC8vIGhhbmRsZXIuIEhvd2V2ZXIsIGlmIHdlIHdlcmUgbm90IGFscmVhZHkgaW4gdGhlIFFVRVJZSU5HIHBoYXNlLCBpdCB0aHJvd3NcbiAgLy8gYW4gZXhjZXB0aW9uIHRoYXQgaXMgY2F1Z2h0IGJ5IHRoZSBjbG9zZXN0IHN1cnJvdW5kaW5nXG4gIC8vIGZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5IGNhbGw7IHRoaXMgZW5zdXJlcyB0aGF0IHdlIGRvbid0IGNvbnRpbnVlIHJ1bm5pbmdcbiAgLy8gY2xvc2UgdGhhdCB3YXMgZGVzaWduZWQgZm9yIGFub3RoZXIgcGhhc2UgaW5zaWRlIFBIQVNFLlFVRVJZSU5HLlxuICAvL1xuICAvLyAoSXQncyBhbHNvIG5lY2Vzc2FyeSB3aGVuZXZlciBsb2dpYyBpbiB0aGlzIGZpbGUgeWllbGRzIHRvIGNoZWNrIHRoYXQgb3RoZXJcbiAgLy8gcGhhc2VzIGhhdmVuJ3QgcHV0IHVzIGludG8gUVVFUllJTkcgbW9kZSwgdGhvdWdoOyBlZyxcbiAgLy8gX2ZldGNoTW9kaWZpZWREb2N1bWVudHMgZG9lcyB0aGlzLilcbiAgX25lZWRUb1BvbGxRdWVyeTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICAvLyBJZiB3ZSdyZSBub3QgYWxyZWFkeSBpbiB0aGUgbWlkZGxlIG9mIGEgcXVlcnksIHdlIGNhbiBxdWVyeSBub3dcbiAgICAgIC8vIChwb3NzaWJseSBwYXVzaW5nIEZFVENISU5HKS5cbiAgICAgIGlmIChzZWxmLl9waGFzZSAhPT0gUEhBU0UuUVVFUllJTkcpIHtcbiAgICAgICAgc2VsZi5fcG9sbFF1ZXJ5KCk7XG4gICAgICAgIHRocm93IG5ldyBTd2l0Y2hlZFRvUXVlcnk7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlJ3JlIGN1cnJlbnRseSBpbiBRVUVSWUlORy4gU2V0IGEgZmxhZyB0byBlbnN1cmUgdGhhdCB3ZSBydW4gYW5vdGhlclxuICAgICAgLy8gcXVlcnkgd2hlbiB3ZSdyZSBkb25lLlxuICAgICAgc2VsZi5fcmVxdWVyeVdoZW5Eb25lVGhpc1F1ZXJ5ID0gdHJ1ZTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBZaWVsZHMhXG4gIF9kb25lUXVlcnlpbmc6IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgIHJldHVybjtcblxuICAgIGF3YWl0IHNlbGYuX21vbmdvSGFuZGxlLl9vcGxvZ0hhbmRsZS53YWl0VW50aWxDYXVnaHRVcCgpO1xuXG4gICAgaWYgKHNlbGYuX3N0b3BwZWQpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAoc2VsZi5fcGhhc2UgIT09IFBIQVNFLlFVRVJZSU5HKVxuICAgICAgdGhyb3cgRXJyb3IoXCJQaGFzZSB1bmV4cGVjdGVkbHkgXCIgKyBzZWxmLl9waGFzZSk7XG5cbiAgICBpZiAoc2VsZi5fcmVxdWVyeVdoZW5Eb25lVGhpc1F1ZXJ5KSB7XG4gICAgICBzZWxmLl9yZXF1ZXJ5V2hlbkRvbmVUaGlzUXVlcnkgPSBmYWxzZTtcbiAgICAgIHNlbGYuX3BvbGxRdWVyeSgpO1xuICAgIH0gZWxzZSBpZiAoc2VsZi5fbmVlZFRvRmV0Y2guZW1wdHkoKSkge1xuICAgICAgYXdhaXQgc2VsZi5fYmVTdGVhZHkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5fZmV0Y2hNb2RpZmllZERvY3VtZW50cygpO1xuICAgIH1cbiAgfSxcblxuICBfY3Vyc29yRm9yUXVlcnk6IGZ1bmN0aW9uIChvcHRpb25zT3ZlcndyaXRlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBUaGUgcXVlcnkgd2UgcnVuIGlzIGFsbW9zdCB0aGUgc2FtZSBhcyB0aGUgY3Vyc29yIHdlIGFyZSBvYnNlcnZpbmcsXG4gICAgICAvLyB3aXRoIGEgZmV3IGNoYW5nZXMuIFdlIG5lZWQgdG8gcmVhZCBhbGwgdGhlIGZpZWxkcyB0aGF0IGFyZSByZWxldmFudCB0b1xuICAgICAgLy8gdGhlIHNlbGVjdG9yLCBub3QganVzdCB0aGUgZmllbGRzIHdlIGFyZSBnb2luZyB0byBwdWJsaXNoICh0aGF0J3MgdGhlXG4gICAgICAvLyBcInNoYXJlZFwiIHByb2plY3Rpb24pLiBBbmQgd2UgZG9uJ3Qgd2FudCB0byBhcHBseSBhbnkgdHJhbnNmb3JtIGluIHRoZVxuICAgICAgLy8gY3Vyc29yLCBiZWNhdXNlIG9ic2VydmVDaGFuZ2VzIHNob3VsZG4ndCB1c2UgdGhlIHRyYW5zZm9ybS5cbiAgICAgIHZhciBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucyk7XG5cbiAgICAgIC8vIEFsbG93IHRoZSBjYWxsZXIgdG8gbW9kaWZ5IHRoZSBvcHRpb25zLiBVc2VmdWwgdG8gc3BlY2lmeSBkaWZmZXJlbnRcbiAgICAgIC8vIHNraXAgYW5kIGxpbWl0IHZhbHVlcy5cbiAgICAgIE9iamVjdC5hc3NpZ24ob3B0aW9ucywgb3B0aW9uc092ZXJ3cml0ZSk7XG5cbiAgICAgIG9wdGlvbnMuZmllbGRzID0gc2VsZi5fc2hhcmVkUHJvamVjdGlvbjtcbiAgICAgIGRlbGV0ZSBvcHRpb25zLnRyYW5zZm9ybTtcbiAgICAgIC8vIFdlIGFyZSBOT1QgZGVlcCBjbG9uaW5nIGZpZWxkcyBvciBzZWxlY3RvciBoZXJlLCB3aGljaCBzaG91bGQgYmUgT0suXG4gICAgICB2YXIgZGVzY3JpcHRpb24gPSBuZXcgQ3Vyc29yRGVzY3JpcHRpb24oXG4gICAgICAgIHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lLFxuICAgICAgICBzZWxmLl9jdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3RvcixcbiAgICAgICAgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gbmV3IEN1cnNvcihzZWxmLl9tb25nb0hhbmRsZSwgZGVzY3JpcHRpb24pO1xuICAgIH0pO1xuICB9LFxuXG5cbiAgLy8gUmVwbGFjZSBzZWxmLl9wdWJsaXNoZWQgd2l0aCBuZXdSZXN1bHRzIChib3RoIGFyZSBJZE1hcHMpLCBpbnZva2luZyBvYnNlcnZlXG4gIC8vIGNhbGxiYWNrcyBvbiB0aGUgbXVsdGlwbGV4ZXIuXG4gIC8vIFJlcGxhY2Ugc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIgd2l0aCBuZXdCdWZmZXIuXG4gIC8vXG4gIC8vIFhYWCBUaGlzIGlzIHZlcnkgc2ltaWxhciB0byBMb2NhbENvbGxlY3Rpb24uX2RpZmZRdWVyeVVub3JkZXJlZENoYW5nZXMuIFdlXG4gIC8vIHNob3VsZCByZWFsbHk6IChhKSBVbmlmeSBJZE1hcCBhbmQgT3JkZXJlZERpY3QgaW50byBVbm9yZGVyZWQvT3JkZXJlZERpY3RcbiAgLy8gKGIpIFJld3JpdGUgZGlmZi5qcyB0byB1c2UgdGhlc2UgY2xhc3NlcyBpbnN0ZWFkIG9mIGFycmF5cyBhbmQgb2JqZWN0cy5cbiAgX3B1Ymxpc2hOZXdSZXN1bHRzOiBmdW5jdGlvbiAobmV3UmVzdWx0cywgbmV3QnVmZmVyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gSWYgdGhlIHF1ZXJ5IGlzIGxpbWl0ZWQgYW5kIHRoZXJlIGlzIGEgYnVmZmVyLCBzaHV0IGRvd24gc28gaXQgZG9lc24ndFxuICAgICAgLy8gc3RheSBpbiBhIHdheS5cbiAgICAgIGlmIChzZWxmLl9saW1pdCkge1xuICAgICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5jbGVhcigpO1xuICAgICAgfVxuXG4gICAgICAvLyBGaXJzdCByZW1vdmUgYW55dGhpbmcgdGhhdCdzIGdvbmUuIEJlIGNhcmVmdWwgbm90IHRvIG1vZGlmeVxuICAgICAgLy8gc2VsZi5fcHVibGlzaGVkIHdoaWxlIGl0ZXJhdGluZyBvdmVyIGl0LlxuICAgICAgdmFyIGlkc1RvUmVtb3ZlID0gW107XG4gICAgICBzZWxmLl9wdWJsaXNoZWQuZm9yRWFjaChmdW5jdGlvbiAoZG9jLCBpZCkge1xuICAgICAgICBpZiAoIW5ld1Jlc3VsdHMuaGFzKGlkKSlcbiAgICAgICAgICBpZHNUb1JlbW92ZS5wdXNoKGlkKTtcbiAgICAgIH0pO1xuICAgICAgaWRzVG9SZW1vdmUuZm9yRWFjaChmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgc2VsZi5fcmVtb3ZlUHVibGlzaGVkKGlkKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBOb3cgZG8gYWRkcyBhbmQgY2hhbmdlcy5cbiAgICAgIC8vIElmIHNlbGYgaGFzIGEgYnVmZmVyIGFuZCBsaW1pdCwgdGhlIG5ldyBmZXRjaGVkIHJlc3VsdCB3aWxsIGJlXG4gICAgICAvLyBsaW1pdGVkIGNvcnJlY3RseSBhcyB0aGUgcXVlcnkgaGFzIHNvcnQgc3BlY2lmaWVyLlxuICAgICAgbmV3UmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uIChkb2MsIGlkKSB7XG4gICAgICAgIHNlbGYuX2hhbmRsZURvYyhpZCwgZG9jKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBTYW5pdHktY2hlY2sgdGhhdCBldmVyeXRoaW5nIHdlIHRyaWVkIHRvIHB1dCBpbnRvIF9wdWJsaXNoZWQgZW5kZWQgdXBcbiAgICAgIC8vIHRoZXJlLlxuICAgICAgLy8gWFhYIGlmIHRoaXMgaXMgc2xvdywgcmVtb3ZlIGl0IGxhdGVyXG4gICAgICBpZiAoc2VsZi5fcHVibGlzaGVkLnNpemUoKSAhPT0gbmV3UmVzdWx0cy5zaXplKCkpIHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZygnVGhlIE1vbmdvIHNlcnZlciBhbmQgdGhlIE1ldGVvciBxdWVyeSBkaXNhZ3JlZSBvbiBob3cgJyArXG4gICAgICAgICAgJ21hbnkgZG9jdW1lbnRzIG1hdGNoIHlvdXIgcXVlcnkuIEN1cnNvciBkZXNjcmlwdGlvbjogJyxcbiAgICAgICAgICBzZWxmLl9jdXJzb3JEZXNjcmlwdGlvbik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHNlbGYuX3B1Ymxpc2hlZC5mb3JFYWNoKGZ1bmN0aW9uIChkb2MsIGlkKSB7XG4gICAgICAgIGlmICghbmV3UmVzdWx0cy5oYXMoaWQpKVxuICAgICAgICAgIHRocm93IEVycm9yKFwiX3B1Ymxpc2hlZCBoYXMgYSBkb2MgdGhhdCBuZXdSZXN1bHRzIGRvZXNuJ3Q7IFwiICsgaWQpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEZpbmFsbHksIHJlcGxhY2UgdGhlIGJ1ZmZlclxuICAgICAgbmV3QnVmZmVyLmZvckVhY2goZnVuY3Rpb24gKGRvYywgaWQpIHtcbiAgICAgICAgc2VsZi5fYWRkQnVmZmVyZWQoaWQsIGRvYyk7XG4gICAgICB9KTtcblxuICAgICAgc2VsZi5fc2FmZUFwcGVuZFRvQnVmZmVyID0gbmV3QnVmZmVyLnNpemUoKSA8IHNlbGYuX2xpbWl0O1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIFRoaXMgc3RvcCBmdW5jdGlvbiBpcyBpbnZva2VkIGZyb20gdGhlIG9uU3RvcCBvZiB0aGUgT2JzZXJ2ZU11bHRpcGxleGVyLCBzb1xuICAvLyBpdCBzaG91bGRuJ3QgYWN0dWFsbHkgYmUgcG9zc2libGUgdG8gY2FsbCBpdCB1bnRpbCB0aGUgbXVsdGlwbGV4ZXIgaXNcbiAgLy8gcmVhZHkuXG4gIC8vXG4gIC8vIEl0J3MgaW1wb3J0YW50IHRvIGNoZWNrIHNlbGYuX3N0b3BwZWQgYWZ0ZXIgZXZlcnkgY2FsbCBpbiB0aGlzIGZpbGUgdGhhdFxuICAvLyBjYW4geWllbGQhXG4gIF9zdG9wOiBhc3luYyBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuX3N0b3BwZWQpXG4gICAgICByZXR1cm47XG4gICAgc2VsZi5fc3RvcHBlZCA9IHRydWU7XG5cbiAgICAvLyBOb3RlOiB3ZSAqZG9uJ3QqIHVzZSBtdWx0aXBsZXhlci5vbkZsdXNoIGhlcmUgYmVjYXVzZSB0aGlzIHN0b3BcbiAgICAvLyBjYWxsYmFjayBpcyBhY3R1YWxseSBpbnZva2VkIGJ5IHRoZSBtdWx0aXBsZXhlciBpdHNlbGYgd2hlbiBpdCBoYXNcbiAgICAvLyBkZXRlcm1pbmVkIHRoYXQgdGhlcmUgYXJlIG5vIGhhbmRsZXMgbGVmdC4gU28gbm90aGluZyBpcyBhY3R1YWxseSBnb2luZ1xuICAgIC8vIHRvIGdldCBmbHVzaGVkIChhbmQgaXQncyBwcm9iYWJseSBub3QgdmFsaWQgdG8gY2FsbCBtZXRob2RzIG9uIHRoZVxuICAgIC8vIGR5aW5nIG11bHRpcGxleGVyKS5cbiAgICBmb3IgKGNvbnN0IHcgb2Ygc2VsZi5fd3JpdGVzVG9Db21taXRXaGVuV2VSZWFjaFN0ZWFkeSkge1xuICAgICAgYXdhaXQgdy5jb21taXR0ZWQoKTtcbiAgICB9XG4gICAgc2VsZi5fd3JpdGVzVG9Db21taXRXaGVuV2VSZWFjaFN0ZWFkeSA9IG51bGw7XG5cbiAgICAvLyBQcm9hY3RpdmVseSBkcm9wIHJlZmVyZW5jZXMgdG8gcG90ZW50aWFsbHkgYmlnIHRoaW5ncy5cbiAgICBzZWxmLl9wdWJsaXNoZWQgPSBudWxsO1xuICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyID0gbnVsbDtcbiAgICBzZWxmLl9uZWVkVG9GZXRjaCA9IG51bGw7XG4gICAgc2VsZi5fY3VycmVudGx5RmV0Y2hpbmcgPSBudWxsO1xuICAgIHNlbGYuX29wbG9nRW50cnlIYW5kbGUgPSBudWxsO1xuICAgIHNlbGYuX2xpc3RlbmVyc0hhbmRsZSA9IG51bGw7XG5cbiAgICBQYWNrYWdlWydmYWN0cy1iYXNlJ10gJiYgUGFja2FnZVsnZmFjdHMtYmFzZSddLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgICAgIFwibW9uZ28tbGl2ZWRhdGFcIiwgXCJvYnNlcnZlLWRyaXZlcnMtb3Bsb2dcIiwgLTEpO1xuXG4gICAgZm9yIGF3YWl0IChjb25zdCBoYW5kbGUgb2Ygc2VsZi5fc3RvcEhhbmRsZXMpIHtcbiAgICAgIGF3YWl0IGhhbmRsZS5zdG9wKCk7XG4gICAgfVxuICB9LFxuICBzdG9wOiBhc3luYyBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gYXdhaXQgc2VsZi5fc3RvcCgpO1xuICB9LFxuXG4gIF9yZWdpc3RlclBoYXNlQ2hhbmdlOiBmdW5jdGlvbiAocGhhc2UpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlO1xuXG4gICAgICBpZiAoc2VsZi5fcGhhc2UpIHtcbiAgICAgICAgdmFyIHRpbWVEaWZmID0gbm93IC0gc2VsZi5fcGhhc2VTdGFydFRpbWU7XG4gICAgICAgIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSAmJiBQYWNrYWdlWydmYWN0cy1iYXNlJ10uRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdChcbiAgICAgICAgICBcIm1vbmdvLWxpdmVkYXRhXCIsIFwidGltZS1zcGVudC1pbi1cIiArIHNlbGYuX3BoYXNlICsgXCItcGhhc2VcIiwgdGltZURpZmYpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9waGFzZSA9IHBoYXNlO1xuICAgICAgc2VsZi5fcGhhc2VTdGFydFRpbWUgPSBub3c7XG4gICAgfSk7XG4gIH1cbn0pO1xuXG4vLyBEb2VzIG91ciBvcGxvZyB0YWlsaW5nIGNvZGUgc3VwcG9ydCB0aGlzIGN1cnNvcj8gRm9yIG5vdywgd2UgYXJlIGJlaW5nIHZlcnlcbi8vIGNvbnNlcnZhdGl2ZSBhbmQgYWxsb3dpbmcgb25seSBzaW1wbGUgcXVlcmllcyB3aXRoIHNpbXBsZSBvcHRpb25zLlxuLy8gKFRoaXMgaXMgYSBcInN0YXRpYyBtZXRob2RcIi4pXG5PcGxvZ09ic2VydmVEcml2ZXIuY3Vyc29yU3VwcG9ydGVkID0gZnVuY3Rpb24gKGN1cnNvckRlc2NyaXB0aW9uLCBtYXRjaGVyKSB7XG4gIC8vIEZpcnN0LCBjaGVjayB0aGUgb3B0aW9ucy5cbiAgdmFyIG9wdGlvbnMgPSBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuXG4gIC8vIERpZCB0aGUgdXNlciBzYXkgbm8gZXhwbGljaXRseT9cbiAgLy8gdW5kZXJzY29yZWQgdmVyc2lvbiBvZiB0aGUgb3B0aW9uIGlzIENPTVBBVCB3aXRoIDEuMlxuICBpZiAob3B0aW9ucy5kaXNhYmxlT3Bsb2cgfHwgb3B0aW9ucy5fZGlzYWJsZU9wbG9nKVxuICAgIHJldHVybiBmYWxzZTtcblxuICAvLyBza2lwIGlzIG5vdCBzdXBwb3J0ZWQ6IHRvIHN1cHBvcnQgaXQgd2Ugd291bGQgbmVlZCB0byBrZWVwIHRyYWNrIG9mIGFsbFxuICAvLyBcInNraXBwZWRcIiBkb2N1bWVudHMgb3IgYXQgbGVhc3QgdGhlaXIgaWRzLlxuICAvLyBsaW1pdCB3L28gYSBzb3J0IHNwZWNpZmllciBpcyBub3Qgc3VwcG9ydGVkOiBjdXJyZW50IGltcGxlbWVudGF0aW9uIG5lZWRzIGFcbiAgLy8gZGV0ZXJtaW5pc3RpYyB3YXkgdG8gb3JkZXIgZG9jdW1lbnRzLlxuICBpZiAob3B0aW9ucy5za2lwIHx8IChvcHRpb25zLmxpbWl0ICYmICFvcHRpb25zLnNvcnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gSWYgYSBmaWVsZHMgcHJvamVjdGlvbiBvcHRpb24gaXMgZ2l2ZW4gY2hlY2sgaWYgaXQgaXMgc3VwcG9ydGVkIGJ5XG4gIC8vIG1pbmltb25nbyAoc29tZSBvcGVyYXRvcnMgYXJlIG5vdCBzdXBwb3J0ZWQpLlxuICBjb25zdCBmaWVsZHMgPSBvcHRpb25zLmZpZWxkcyB8fCBvcHRpb25zLnByb2plY3Rpb247XG4gIGlmIChmaWVsZHMpIHtcbiAgICB0cnkge1xuICAgICAgTG9jYWxDb2xsZWN0aW9uLl9jaGVja1N1cHBvcnRlZFByb2plY3Rpb24oZmllbGRzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lID09PSBcIk1pbmltb25nb0Vycm9yXCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBXZSBkb24ndCBhbGxvdyB0aGUgZm9sbG93aW5nIHNlbGVjdG9yczpcbiAgLy8gICAtICR3aGVyZSAobm90IGNvbmZpZGVudCB0aGF0IHdlIHByb3ZpZGUgdGhlIHNhbWUgSlMgZW52aXJvbm1lbnRcbiAgLy8gICAgICAgICAgICAgYXMgTW9uZ28sIGFuZCBjYW4geWllbGQhKVxuICAvLyAgIC0gJG5lYXIgKGhhcyBcImludGVyZXN0aW5nXCIgcHJvcGVydGllcyBpbiBNb25nb0RCLCBsaWtlIHRoZSBwb3NzaWJpbGl0eVxuICAvLyAgICAgICAgICAgIG9mIHJldHVybmluZyBhbiBJRCBtdWx0aXBsZSB0aW1lcywgdGhvdWdoIGV2ZW4gcG9sbGluZyBtYXliZVxuICAvLyAgICAgICAgICAgIGhhdmUgYSBidWcgdGhlcmUpXG4gIC8vICAgICAgICAgICBYWFg6IG9uY2Ugd2Ugc3VwcG9ydCBpdCwgd2Ugd291bGQgbmVlZCB0byB0aGluayBtb3JlIG9uIGhvdyB3ZVxuICAvLyAgICAgICAgICAgaW5pdGlhbGl6ZSB0aGUgY29tcGFyYXRvcnMgd2hlbiB3ZSBjcmVhdGUgdGhlIGRyaXZlci5cbiAgcmV0dXJuICFtYXRjaGVyLmhhc1doZXJlKCkgJiYgIW1hdGNoZXIuaGFzR2VvUXVlcnkoKTtcbn07XG5cbnZhciBtb2RpZmllckNhbkJlRGlyZWN0bHlBcHBsaWVkID0gZnVuY3Rpb24gKG1vZGlmaWVyKSB7XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhtb2RpZmllcikuZXZlcnkoZnVuY3Rpb24gKFtvcGVyYXRpb24sIGZpZWxkc10pIHtcbiAgICByZXR1cm4gT2JqZWN0LmVudHJpZXMoZmllbGRzKS5ldmVyeShmdW5jdGlvbiAoW2ZpZWxkLCB2YWx1ZV0pIHtcbiAgICAgIHJldHVybiAhL0VKU09OXFwkLy50ZXN0KGZpZWxkKTtcbiAgICB9KTtcbiAgfSk7XG59OyIsIi8qKlxuICogQ29udmVydGVyIG1vZHVsZSBmb3IgdGhlIG5ldyBNb25nb0RCIE9wbG9nIGZvcm1hdCAoPj01LjApIHRvIHRoZSBvbmUgdGhhdCBNZXRlb3JcbiAqIGhhbmRsZXMgd2VsbCwgaS5lLiwgYCRzZXRgIGFuZCBgJHVuc2V0YC4gVGhlIG5ldyBmb3JtYXQgaXMgY29tcGxldGVseSBuZXcsXG4gKiBhbmQgbG9va3MgYXMgZm9sbG93czpcbiAqXG4gKiBgYGBqc1xuICogeyAkdjogMiwgZGlmZjogRGlmZiB9XG4gKiBgYGBcbiAqXG4gKiB3aGVyZSBgRGlmZmAgaXMgYSByZWN1cnNpdmUgc3RydWN0dXJlOlxuICogYGBganNcbiAqIHtcbiAqICAgLy8gTmVzdGVkIHVwZGF0ZXMgKHNvbWV0aW1lcyBhbHNvIHJlcHJlc2VudGVkIHdpdGggYW4gcy1maWVsZCkuXG4gKiAgIC8vIEV4YW1wbGU6IGB7ICRzZXQ6IHsgJ2Zvby5iYXInOiAxIH0gfWAuXG4gKiAgIGk6IHsgPGtleT46IDx2YWx1ZT4sIC4uLiB9LFxuICpcbiAqICAgLy8gVG9wLWxldmVsIHVwZGF0ZXMuXG4gKiAgIC8vIEV4YW1wbGU6IGB7ICRzZXQ6IHsgZm9vOiB7IGJhcjogMSB9IH0gfWAuXG4gKiAgIHU6IHsgPGtleT46IDx2YWx1ZT4sIC4uLiB9LFxuICpcbiAqICAgLy8gVW5zZXRzLlxuICogICAvLyBFeGFtcGxlOiBgeyAkdW5zZXQ6IHsgZm9vOiAnJyB9IH1gLlxuICogICBkOiB7IDxrZXk+OiBmYWxzZSwgLi4uIH0sXG4gKlxuICogICAvLyBBcnJheSBvcGVyYXRpb25zLlxuICogICAvLyBFeGFtcGxlOiBgeyAkcHVzaDogeyBmb286ICdiYXInIH0gfWAuXG4gKiAgIHM8a2V5PjogeyBhOiB0cnVlLCB1PGluZGV4PjogPHZhbHVlPiwgLi4uIH0sXG4gKiAgIC4uLlxuICpcbiAqICAgLy8gTmVzdGVkIG9wZXJhdGlvbnMgKHNvbWV0aW1lcyBhbHNvIHJlcHJlc2VudGVkIGluIHRoZSBgaWAgZmllbGQpLlxuICogICAvLyBFeGFtcGxlOiBgeyAkc2V0OiB7ICdmb28uYmFyJzogMSB9IH1gLlxuICogICBzPGtleT46IERpZmYsXG4gKiAgIC4uLlxuICogfVxuICogYGBgXG4gKlxuICogKGFsbCBmaWVsZHMgYXJlIG9wdGlvbmFsKVxuICovXG5cbmltcG9ydCB7IEVKU09OIH0gZnJvbSAnbWV0ZW9yL2Vqc29uJztcblxuaW50ZXJmYWNlIE9wbG9nRW50cnkge1xuICAkdjogbnVtYmVyO1xuICBkaWZmPzogT3Bsb2dEaWZmO1xuICAkc2V0PzogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgJHVuc2V0PzogUmVjb3JkPHN0cmluZywgdHJ1ZT47XG59XG5cbmludGVyZmFjZSBPcGxvZ0RpZmYge1xuICBpPzogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgdT86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIGQ/OiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPjtcbiAgW2tleTogYHMke3N0cmluZ31gXTogQXJyYXlPcGVyYXRvciB8IFJlY29yZDxzdHJpbmcsIGFueT47XG59XG5cbmludGVyZmFjZSBBcnJheU9wZXJhdG9yIHtcbiAgYTogdHJ1ZTtcbiAgW2tleTogYHUke251bWJlcn1gXTogYW55O1xufVxuXG5jb25zdCBhcnJheU9wZXJhdG9yS2V5UmVnZXggPSAvXihhfFtzdV1cXGQrKSQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIGZpZWxkIGlzIGFuIGFycmF5IG9wZXJhdG9yIGtleSBvZiBmb3JtICdhJyBvciAnczEnIG9yICd1MScgZXRjXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlPcGVyYXRvcktleShmaWVsZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBhcnJheU9wZXJhdG9yS2V5UmVnZXgudGVzdChmaWVsZCk7XG59XG5cbi8qKlxuICogVHlwZSBndWFyZCB0byBjaGVjayBpZiBhbiBvcGVyYXRvciBpcyBhIHZhbGlkIGFycmF5IG9wZXJhdG9yLlxuICogQXJyYXkgb3BlcmF0b3JzIGhhdmUgJ2E6IHRydWUnIGFuZCBrZXlzIHRoYXQgbWF0Y2ggdGhlIGFycmF5T3BlcmF0b3JLZXlSZWdleFxuICovXG5mdW5jdGlvbiBpc0FycmF5T3BlcmF0b3Iob3BlcmF0b3I6IHVua25vd24pOiBvcGVyYXRvciBpcyBBcnJheU9wZXJhdG9yIHtcbiAgcmV0dXJuIChcbiAgICBvcGVyYXRvciAhPT0gbnVsbCAmJlxuICAgIHR5cGVvZiBvcGVyYXRvciA9PT0gJ29iamVjdCcgJiZcbiAgICAnYScgaW4gb3BlcmF0b3IgJiZcbiAgICAob3BlcmF0b3IgYXMgQXJyYXlPcGVyYXRvcikuYSA9PT0gdHJ1ZSAmJlxuICAgIE9iamVjdC5rZXlzKG9wZXJhdG9yKS5ldmVyeShpc0FycmF5T3BlcmF0b3JLZXkpXG4gICk7XG59XG5cbi8qKlxuICogSm9pbnMgdHdvIHBhcnRzIG9mIGEgZmllbGQgcGF0aCB3aXRoIGEgZG90LlxuICogUmV0dXJucyB0aGUga2V5IGl0c2VsZiBpZiBwcmVmaXggaXMgZW1wdHkuXG4gKi9cbmZ1bmN0aW9uIGpvaW4ocHJlZml4OiBzdHJpbmcsIGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHByZWZpeCA/IGAke3ByZWZpeH0uJHtrZXl9YCA6IGtleTtcbn1cblxuLyoqXG4gKiBSZWN1cnNpdmVseSBmbGF0dGVucyBhbiBvYmplY3QgaW50byBhIHRhcmdldCBvYmplY3Qgd2l0aCBkb3Qgbm90YXRpb24gcGF0aHMuXG4gKiBIYW5kbGVzIHNwZWNpYWwgY2FzZXM6XG4gKiAtIEFycmF5cyBhcmUgYXNzaWduZWQgZGlyZWN0bHlcbiAqIC0gQ3VzdG9tIEVKU09OIHR5cGVzIGFyZSBwcmVzZXJ2ZWRcbiAqIC0gTW9uZ28uT2JqZWN0SURzIGFyZSBwcmVzZXJ2ZWRcbiAqIC0gUGxhaW4gb2JqZWN0cyBhcmUgcmVjdXJzaXZlbHkgZmxhdHRlbmVkXG4gKiAtIEVtcHR5IG9iamVjdHMgYXJlIGFzc2lnbmVkIGRpcmVjdGx5XG4gKi9cbmZ1bmN0aW9uIGZsYXR0ZW5PYmplY3RJbnRvKFxuICB0YXJnZXQ6IFJlY29yZDxzdHJpbmcsIGFueT4sXG4gIHNvdXJjZTogYW55LFxuICBwcmVmaXg6IHN0cmluZ1xuKTogdm9pZCB7XG4gIGlmIChcbiAgICBBcnJheS5pc0FycmF5KHNvdXJjZSkgfHxcbiAgICB0eXBlb2Ygc291cmNlICE9PSAnb2JqZWN0JyB8fFxuICAgIHNvdXJjZSA9PT0gbnVsbCB8fFxuICAgIHNvdXJjZSBpbnN0YW5jZW9mIE1vbmdvLk9iamVjdElEIHx8XG4gICAgRUpTT04uX2lzQ3VzdG9tVHlwZShzb3VyY2UpXG4gICkge1xuICAgIHRhcmdldFtwcmVmaXhdID0gc291cmNlO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhzb3VyY2UpO1xuICBpZiAoZW50cmllcy5sZW5ndGgpIHtcbiAgICBlbnRyaWVzLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgZmxhdHRlbk9iamVjdEludG8odGFyZ2V0LCB2YWx1ZSwgam9pbihwcmVmaXgsIGtleSkpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHRhcmdldFtwcmVmaXhdID0gc291cmNlO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gb3Bsb2cgZGlmZiB0byBhIHNlcmllcyBvZiAkc2V0IGFuZCAkdW5zZXQgb3BlcmF0aW9ucy5cbiAqIEhhbmRsZXMgc2V2ZXJhbCB0eXBlcyBvZiBvcGVyYXRpb25zOlxuICogLSBEaXJlY3QgdW5zZXRzIHZpYSAnZCcgZmllbGRcbiAqIC0gTmVzdGVkIHNldHMgdmlhICdpJyBmaWVsZFxuICogLSBUb3AtbGV2ZWwgc2V0cyB2aWEgJ3UnIGZpZWxkXG4gKiAtIEFycmF5IG9wZXJhdGlvbnMgYW5kIG5lc3RlZCBvYmplY3RzIHZpYSAncycgcHJlZml4ZWQgZmllbGRzXG4gKlxuICogUHJlc2VydmVzIHRoZSBzdHJ1Y3R1cmUgb2YgRUpTT04gY3VzdG9tIHR5cGVzIGFuZCBPYmplY3RJRHMgd2hpbGVcbiAqIGZsYXR0ZW5pbmcgcGF0aHMgaW50byBkb3Qgbm90YXRpb24gZm9yIE1vbmdvREIgdXBkYXRlcy5cbiAqL1xuZnVuY3Rpb24gY29udmVydE9wbG9nRGlmZihcbiAgb3Bsb2dFbnRyeTogT3Bsb2dFbnRyeSxcbiAgZGlmZjogT3Bsb2dEaWZmLFxuICBwcmVmaXggPSAnJ1xuKTogdm9pZCB7XG4gIE9iamVjdC5lbnRyaWVzKGRpZmYpLmZvckVhY2goKFtkaWZmS2V5LCB2YWx1ZV0pID0+IHtcbiAgICBpZiAoZGlmZktleSA9PT0gJ2QnKSB7XG4gICAgICAvLyBIYW5kbGUgYCR1bnNldGBzXG4gICAgICBvcGxvZ0VudHJ5LiR1bnNldCA/Pz0ge307XG4gICAgICBPYmplY3Qua2V5cyh2YWx1ZSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBvcGxvZ0VudHJ5LiR1bnNldCFbam9pbihwcmVmaXgsIGtleSldID0gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZGlmZktleSA9PT0gJ2knKSB7XG4gICAgICAvLyBIYW5kbGUgKHBvdGVudGlhbGx5KSBuZXN0ZWQgYCRzZXRgc1xuICAgICAgb3Bsb2dFbnRyeS4kc2V0ID8/PSB7fTtcbiAgICAgIGZsYXR0ZW5PYmplY3RJbnRvKG9wbG9nRW50cnkuJHNldCwgdmFsdWUsIHByZWZpeCk7XG4gICAgfSBlbHNlIGlmIChkaWZmS2V5ID09PSAndScpIHtcbiAgICAgIC8vIEhhbmRsZSBmbGF0IGAkc2V0YHNcbiAgICAgIG9wbG9nRW50cnkuJHNldCA/Pz0ge307XG4gICAgICBPYmplY3QuZW50cmllcyh2YWx1ZSkuZm9yRWFjaCgoW2tleSwgZmllbGRWYWx1ZV0pID0+IHtcbiAgICAgICAgb3Bsb2dFbnRyeS4kc2V0IVtqb2luKHByZWZpeCwga2V5KV0gPSBmaWVsZFZhbHVlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChkaWZmS2V5LnN0YXJ0c1dpdGgoJ3MnKSkge1xuICAgICAgLy8gSGFuZGxlIHMtZmllbGRzIChhcnJheSBvcGVyYXRpb25zIGFuZCBuZXN0ZWQgb2JqZWN0cylcbiAgICAgIGNvbnN0IGtleSA9IGRpZmZLZXkuc2xpY2UoMSk7XG4gICAgICBpZiAoaXNBcnJheU9wZXJhdG9yKHZhbHVlKSkge1xuICAgICAgICAvLyBBcnJheSBvcGVyYXRvclxuICAgICAgICBPYmplY3QuZW50cmllcyh2YWx1ZSkuZm9yRWFjaCgoW3Bvc2l0aW9uLCBmaWVsZFZhbHVlXSkgPT4ge1xuICAgICAgICAgIGlmIChwb3NpdGlvbiA9PT0gJ2EnKSByZXR1cm47XG5cbiAgICAgICAgICBjb25zdCBwb3NpdGlvbktleSA9IGpvaW4ocHJlZml4LCBgJHtrZXl9LiR7cG9zaXRpb24uc2xpY2UoMSl9YCk7XG4gICAgICAgICAgaWYgKHBvc2l0aW9uWzBdID09PSAncycpIHtcbiAgICAgICAgICAgIGNvbnZlcnRPcGxvZ0RpZmYob3Bsb2dFbnRyeSwgZmllbGRWYWx1ZSwgcG9zaXRpb25LZXkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZmllbGRWYWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgb3Bsb2dFbnRyeS4kdW5zZXQgPz89IHt9O1xuICAgICAgICAgICAgb3Bsb2dFbnRyeS4kdW5zZXRbcG9zaXRpb25LZXldID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3Bsb2dFbnRyeS4kc2V0ID8/PSB7fTtcbiAgICAgICAgICAgIG9wbG9nRW50cnkuJHNldFtwb3NpdGlvbktleV0gPSBmaWVsZFZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGtleSkge1xuICAgICAgICAvLyBOZXN0ZWQgb2JqZWN0XG4gICAgICAgIGNvbnZlcnRPcGxvZ0RpZmYob3Bsb2dFbnRyeSwgdmFsdWUsIGpvaW4ocHJlZml4LCBrZXkpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgTW9uZ29EQiB2MiBvcGxvZyBlbnRyeSB0byB2MSBmb3JtYXQuXG4gKiBSZXR1cm5zIHRoZSBvcmlnaW5hbCBlbnRyeSB1bmNoYW5nZWQgaWYgaXQncyBub3QgYSB2MiBvcGxvZyBlbnRyeVxuICogb3IgZG9lc24ndCBjb250YWluIGEgZGlmZiBmaWVsZC5cbiAqXG4gKiBUaGUgY29udmVydGVkIGVudHJ5IHdpbGwgY29udGFpbiAkc2V0IGFuZCAkdW5zZXQgb3BlcmF0aW9ucyB0aGF0IGFyZVxuICogZXF1aXZhbGVudCB0byB0aGUgdjIgZGlmZiBmb3JtYXQsIHdpdGggcGF0aHMgZmxhdHRlbmVkIHRvIGRvdCBub3RhdGlvblxuICogYW5kIHNwZWNpYWwgaGFuZGxpbmcgZm9yIEVKU09OIGN1c3RvbSB0eXBlcyBhbmQgT2JqZWN0SURzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gb3Bsb2dWMlYxQ29udmVydGVyKG9wbG9nRW50cnk6IE9wbG9nRW50cnkpOiBPcGxvZ0VudHJ5IHtcbiAgaWYgKG9wbG9nRW50cnkuJHYgIT09IDIgfHwgIW9wbG9nRW50cnkuZGlmZikge1xuICAgIHJldHVybiBvcGxvZ0VudHJ5O1xuICB9XG5cbiAgY29uc3QgY29udmVydGVkT3Bsb2dFbnRyeTogT3Bsb2dFbnRyeSA9IHsgJHY6IDIgfTtcbiAgY29udmVydE9wbG9nRGlmZihjb252ZXJ0ZWRPcGxvZ0VudHJ5LCBvcGxvZ0VudHJ5LmRpZmYpO1xuICByZXR1cm4gY29udmVydGVkT3Bsb2dFbnRyeTtcbn0iLCJpbnRlcmZhY2UgQ3Vyc29yT3B0aW9ucyB7XG4gIGxpbWl0PzogbnVtYmVyO1xuICBza2lwPzogbnVtYmVyO1xuICBzb3J0PzogUmVjb3JkPHN0cmluZywgMSB8IC0xPjtcbiAgZmllbGRzPzogUmVjb3JkPHN0cmluZywgMSB8IDA+O1xuICBwcm9qZWN0aW9uPzogUmVjb3JkPHN0cmluZywgMSB8IDA+O1xuICBkaXNhYmxlT3Bsb2c/OiBib29sZWFuO1xuICBfZGlzYWJsZU9wbG9nPzogYm9vbGVhbjtcbiAgdGFpbGFibGU/OiBib29sZWFuO1xuICB0cmFuc2Zvcm0/OiAoZG9jOiBhbnkpID0+IGFueTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSBhcmd1bWVudHMgdXNlZCB0byBjb25zdHJ1Y3QgYSBjdXJzb3IuXG4gKiBVc2VkIGFzIGEga2V5IGZvciBjdXJzb3IgZGUtZHVwbGljYXRpb24uXG4gKlxuICogQWxsIHByb3BlcnRpZXMgbXVzdCBiZSBlaXRoZXI6XG4gKiAtIEpTT04tc3RyaW5naWZpYWJsZSwgb3JcbiAqIC0gTm90IGFmZmVjdCBvYnNlcnZlQ2hhbmdlcyBvdXRwdXQgKGUuZy4sIG9wdGlvbnMudHJhbnNmb3JtIGZ1bmN0aW9ucylcbiAqL1xuZXhwb3J0IGNsYXNzIEN1cnNvckRlc2NyaXB0aW9uIHtcbiAgY29sbGVjdGlvbk5hbWU6IHN0cmluZztcbiAgc2VsZWN0b3I6IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIG9wdGlvbnM6IEN1cnNvck9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3IoY29sbGVjdGlvbk5hbWU6IHN0cmluZywgc2VsZWN0b3I6IGFueSwgb3B0aW9ucz86IEN1cnNvck9wdGlvbnMpIHtcbiAgICB0aGlzLmNvbGxlY3Rpb25OYW1lID0gY29sbGVjdGlvbk5hbWU7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHRoaXMuc2VsZWN0b3IgPSBNb25nby5Db2xsZWN0aW9uLl9yZXdyaXRlU2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIH1cbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IENMSUVOVF9PTkxZX01FVEhPRFMsIGdldEFzeW5jTWV0aG9kTmFtZSB9IGZyb20gJ21ldGVvci9taW5pbW9uZ28vY29uc3RhbnRzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQXN5bmNocm9ub3VzQ3Vyc29yIH0gZnJvbSAnLi9hc3luY2hyb25vdXNfY3Vyc29yJztcbmltcG9ydCB7IEN1cnNvciB9IGZyb20gJy4vY3Vyc29yJztcbmltcG9ydCB7IEN1cnNvckRlc2NyaXB0aW9uIH0gZnJvbSAnLi9jdXJzb3JfZGVzY3JpcHRpb24nO1xuaW1wb3J0IHsgRG9jRmV0Y2hlciB9IGZyb20gJy4vZG9jX2ZldGNoZXInO1xuaW1wb3J0IHsgTW9uZ29EQiwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28sIHJlcGxhY2VUeXBlcywgdHJhbnNmb3JtUmVzdWx0IH0gZnJvbSAnLi9tb25nb19jb21tb24nO1xuaW1wb3J0IHsgT2JzZXJ2ZUhhbmRsZSB9IGZyb20gJy4vb2JzZXJ2ZV9oYW5kbGUnO1xuaW1wb3J0IHsgT2JzZXJ2ZU11bHRpcGxleGVyIH0gZnJvbSAnLi9vYnNlcnZlX211bHRpcGxleCc7XG5pbXBvcnQgeyBPcGxvZ09ic2VydmVEcml2ZXIgfSBmcm9tICcuL29wbG9nX29ic2VydmVfZHJpdmVyJztcbmltcG9ydCB7IE9QTE9HX0NPTExFQ1RJT04sIE9wbG9nSGFuZGxlIH0gZnJvbSAnLi9vcGxvZ190YWlsaW5nJztcbmltcG9ydCB7IFBvbGxpbmdPYnNlcnZlRHJpdmVyIH0gZnJvbSAnLi9wb2xsaW5nX29ic2VydmVfZHJpdmVyJztcblxuY29uc3QgRklMRV9BU1NFVF9TVUZGSVggPSAnQXNzZXQnO1xuY29uc3QgQVNTRVRTX0ZPTERFUiA9ICdhc3NldHMnO1xuY29uc3QgQVBQX0ZPTERFUiA9ICdhcHAnO1xuXG5jb25zdCBvcGxvZ0NvbGxlY3Rpb25XYXJuaW5ncyA9IFtdO1xuXG5leHBvcnQgY29uc3QgTW9uZ29Db25uZWN0aW9uID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBzZWxmLl9vYnNlcnZlTXVsdGlwbGV4ZXJzID0ge307XG4gIHNlbGYuX29uRmFpbG92ZXJIb29rID0gbmV3IEhvb2s7XG5cbiAgY29uc3QgdXNlck9wdGlvbnMgPSB7XG4gICAgLi4uKE1vbmdvLl9jb25uZWN0aW9uT3B0aW9ucyB8fCB7fSksXG4gICAgLi4uKE1ldGVvci5zZXR0aW5ncz8ucGFja2FnZXM/Lm1vbmdvPy5vcHRpb25zIHx8IHt9KVxuICB9O1xuXG4gIHZhciBtb25nb09wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICBpZ25vcmVVbmRlZmluZWQ6IHRydWUsXG4gIH0sIHVzZXJPcHRpb25zKTtcblxuXG5cbiAgLy8gSW50ZXJuYWxseSB0aGUgb3Bsb2cgY29ubmVjdGlvbnMgc3BlY2lmeSB0aGVpciBvd24gbWF4UG9vbFNpemVcbiAgLy8gd2hpY2ggd2UgZG9uJ3Qgd2FudCB0byBvdmVyd3JpdGUgd2l0aCBhbnkgdXNlciBkZWZpbmVkIHZhbHVlXG4gIGlmICgnbWF4UG9vbFNpemUnIGluIG9wdGlvbnMpIHtcbiAgICAvLyBJZiB3ZSBqdXN0IHNldCB0aGlzIGZvciBcInNlcnZlclwiLCByZXBsU2V0IHdpbGwgb3ZlcnJpZGUgaXQuIElmIHdlIGp1c3RcbiAgICAvLyBzZXQgaXQgZm9yIHJlcGxTZXQsIGl0IHdpbGwgYmUgaWdub3JlZCBpZiB3ZSdyZSBub3QgdXNpbmcgYSByZXBsU2V0LlxuICAgIG1vbmdvT3B0aW9ucy5tYXhQb29sU2l6ZSA9IG9wdGlvbnMubWF4UG9vbFNpemU7XG4gIH1cbiAgaWYgKCdtaW5Qb29sU2l6ZScgaW4gb3B0aW9ucykge1xuICAgIG1vbmdvT3B0aW9ucy5taW5Qb29sU2l6ZSA9IG9wdGlvbnMubWluUG9vbFNpemU7XG4gIH1cblxuICAvLyBUcmFuc2Zvcm0gb3B0aW9ucyBsaWtlIFwidGxzQ0FGaWxlQXNzZXRcIjogXCJmaWxlbmFtZS5wZW1cIiBpbnRvXG4gIC8vIFwidGxzQ0FGaWxlXCI6IFwiLzxmdWxscGF0aD4vZmlsZW5hbWUucGVtXCJcbiAgT2JqZWN0LmVudHJpZXMobW9uZ29PcHRpb25zIHx8IHt9KVxuICAgIC5maWx0ZXIoKFtrZXldKSA9PiBrZXkgJiYga2V5LmVuZHNXaXRoKEZJTEVfQVNTRVRfU1VGRklYKSlcbiAgICAuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICBjb25zdCBvcHRpb25OYW1lID0ga2V5LnJlcGxhY2UoRklMRV9BU1NFVF9TVUZGSVgsICcnKTtcbiAgICAgIG1vbmdvT3B0aW9uc1tvcHRpb25OYW1lXSA9IHBhdGguam9pbihBc3NldHMuZ2V0U2VydmVyRGlyKCksXG4gICAgICAgIEFTU0VUU19GT0xERVIsIEFQUF9GT0xERVIsIHZhbHVlKTtcbiAgICAgIGRlbGV0ZSBtb25nb09wdGlvbnNba2V5XTtcbiAgICB9KTtcblxuICBzZWxmLmRiID0gbnVsbDtcbiAgc2VsZi5fb3Bsb2dIYW5kbGUgPSBudWxsO1xuICBzZWxmLl9kb2NGZXRjaGVyID0gbnVsbDtcblxuICBtb25nb09wdGlvbnMuZHJpdmVySW5mbyA9IHtcbiAgICBuYW1lOiAnTWV0ZW9yJyxcbiAgICB2ZXJzaW9uOiBNZXRlb3IucmVsZWFzZVxuICB9XG5cbiAgc2VsZi5jbGllbnQgPSBuZXcgTW9uZ29EQi5Nb25nb0NsaWVudCh1cmwsIG1vbmdvT3B0aW9ucyk7XG4gIHNlbGYuZGIgPSBzZWxmLmNsaWVudC5kYigpO1xuXG4gIHNlbGYuY2xpZW50Lm9uKCdzZXJ2ZXJEZXNjcmlwdGlvbkNoYW5nZWQnLCBNZXRlb3IuYmluZEVudmlyb25tZW50KGV2ZW50ID0+IHtcbiAgICAvLyBXaGVuIHRoZSBjb25uZWN0aW9uIGlzIG5vIGxvbmdlciBhZ2FpbnN0IHRoZSBwcmltYXJ5IG5vZGUsIGV4ZWN1dGUgYWxsXG4gICAgLy8gZmFpbG92ZXIgaG9va3MuIFRoaXMgaXMgaW1wb3J0YW50IGZvciB0aGUgZHJpdmVyIGFzIGl0IGhhcyB0byByZS1wb29sIHRoZVxuICAgIC8vIHF1ZXJ5IHdoZW4gaXQgaGFwcGVucy5cbiAgICBpZiAoXG4gICAgICBldmVudC5wcmV2aW91c0Rlc2NyaXB0aW9uLnR5cGUgIT09ICdSU1ByaW1hcnknICYmXG4gICAgICBldmVudC5uZXdEZXNjcmlwdGlvbi50eXBlID09PSAnUlNQcmltYXJ5J1xuICAgICkge1xuICAgICAgc2VsZi5fb25GYWlsb3Zlckhvb2suZWFjaChjYWxsYmFjayA9PiB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9KSk7XG5cbiAgaWYgKG9wdGlvbnMub3Bsb2dVcmwgJiYgISBQYWNrYWdlWydkaXNhYmxlLW9wbG9nJ10pIHtcbiAgICBzZWxmLl9vcGxvZ0hhbmRsZSA9IG5ldyBPcGxvZ0hhbmRsZShvcHRpb25zLm9wbG9nVXJsLCBzZWxmLmRiLmRhdGFiYXNlTmFtZSk7XG4gICAgc2VsZi5fZG9jRmV0Y2hlciA9IG5ldyBEb2NGZXRjaGVyKHNlbGYpO1xuICB9XG5cbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuX2Nsb3NlID0gYXN5bmMgZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZiAoISBzZWxmLmRiKVxuICAgIHRocm93IEVycm9yKFwiY2xvc2UgY2FsbGVkIGJlZm9yZSBDb25uZWN0aW9uIGNyZWF0ZWQ/XCIpO1xuXG4gIC8vIFhYWCBwcm9iYWJseSB1bnRlc3RlZFxuICB2YXIgb3Bsb2dIYW5kbGUgPSBzZWxmLl9vcGxvZ0hhbmRsZTtcbiAgc2VsZi5fb3Bsb2dIYW5kbGUgPSBudWxsO1xuICBpZiAob3Bsb2dIYW5kbGUpXG4gICAgYXdhaXQgb3Bsb2dIYW5kbGUuc3RvcCgpO1xuXG4gIC8vIFVzZSBGdXR1cmUud3JhcCBzbyB0aGF0IGVycm9ycyBnZXQgdGhyb3duLiBUaGlzIGhhcHBlbnMgdG9cbiAgLy8gd29yayBldmVuIG91dHNpZGUgYSBmaWJlciBzaW5jZSB0aGUgJ2Nsb3NlJyBtZXRob2QgaXMgbm90XG4gIC8vIGFjdHVhbGx5IGFzeW5jaHJvbm91cy5cbiAgYXdhaXQgc2VsZi5jbGllbnQuY2xvc2UoKTtcbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLl9jbG9zZSgpO1xufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5fc2V0T3Bsb2dIYW5kbGUgPSBmdW5jdGlvbihvcGxvZ0hhbmRsZSkge1xuICB0aGlzLl9vcGxvZ0hhbmRsZSA9IG9wbG9nSGFuZGxlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIFJldHVybnMgdGhlIE1vbmdvIENvbGxlY3Rpb24gb2JqZWN0OyBtYXkgeWllbGQuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLnJhd0NvbGxlY3Rpb24gPSBmdW5jdGlvbiAoY29sbGVjdGlvbk5hbWUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmICghIHNlbGYuZGIpXG4gICAgdGhyb3cgRXJyb3IoXCJyYXdDb2xsZWN0aW9uIGNhbGxlZCBiZWZvcmUgQ29ubmVjdGlvbiBjcmVhdGVkP1wiKTtcblxuICByZXR1cm4gc2VsZi5kYi5jb2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lKTtcbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlQ2FwcGVkQ29sbGVjdGlvbkFzeW5jID0gYXN5bmMgZnVuY3Rpb24gKFxuICBjb2xsZWN0aW9uTmFtZSwgYnl0ZVNpemUsIG1heERvY3VtZW50cykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKCEgc2VsZi5kYilcbiAgICB0aHJvdyBFcnJvcihcImNyZWF0ZUNhcHBlZENvbGxlY3Rpb25Bc3luYyBjYWxsZWQgYmVmb3JlIENvbm5lY3Rpb24gY3JlYXRlZD9cIik7XG5cblxuICBhd2FpdCBzZWxmLmRiLmNyZWF0ZUNvbGxlY3Rpb24oY29sbGVjdGlvbk5hbWUsXG4gICAgeyBjYXBwZWQ6IHRydWUsIHNpemU6IGJ5dGVTaXplLCBtYXg6IG1heERvY3VtZW50cyB9KTtcbn07XG5cbi8vIFRoaXMgc2hvdWxkIGJlIGNhbGxlZCBzeW5jaHJvbm91c2x5IHdpdGggYSB3cml0ZSwgdG8gY3JlYXRlIGFcbi8vIHRyYW5zYWN0aW9uIG9uIHRoZSBjdXJyZW50IHdyaXRlIGZlbmNlLCBpZiBhbnkuIEFmdGVyIHdlIGNhbiByZWFkXG4vLyB0aGUgd3JpdGUsIGFuZCBhZnRlciBvYnNlcnZlcnMgaGF2ZSBiZWVuIG5vdGlmaWVkIChvciBhdCBsZWFzdCxcbi8vIGFmdGVyIHRoZSBvYnNlcnZlciBub3RpZmllcnMgaGF2ZSBhZGRlZCB0aGVtc2VsdmVzIHRvIHRoZSB3cml0ZVxuLy8gZmVuY2UpLCB5b3Ugc2hvdWxkIGNhbGwgJ2NvbW1pdHRlZCgpJyBvbiB0aGUgb2JqZWN0IHJldHVybmVkLlxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5fbWF5YmVCZWdpbldyaXRlID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBmZW5jZSA9IEREUFNlcnZlci5fZ2V0Q3VycmVudEZlbmNlKCk7XG4gIGlmIChmZW5jZSkge1xuICAgIHJldHVybiBmZW5jZS5iZWdpbldyaXRlKCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtjb21taXR0ZWQ6IGZ1bmN0aW9uICgpIHt9fTtcbiAgfVxufTtcblxuLy8gSW50ZXJuYWwgaW50ZXJmYWNlOiBhZGRzIGEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gdGhlIE1vbmdvIHByaW1hcnlcbi8vIGNoYW5nZXMuIFJldHVybnMgYSBzdG9wIGhhbmRsZS5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuX29uRmFpbG92ZXIgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIHRoaXMuX29uRmFpbG92ZXJIb29rLnJlZ2lzdGVyKGNhbGxiYWNrKTtcbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuaW5zZXJ0QXN5bmMgPSBhc3luYyBmdW5jdGlvbiAoY29sbGVjdGlvbl9uYW1lLCBkb2N1bWVudCkge1xuICBjb25zdCBzZWxmID0gdGhpcztcblxuICBpZiAoY29sbGVjdGlvbl9uYW1lID09PSBcIl9fX21ldGVvcl9mYWlsdXJlX3Rlc3RfY29sbGVjdGlvblwiKSB7XG4gICAgY29uc3QgZSA9IG5ldyBFcnJvcihcIkZhaWx1cmUgdGVzdFwiKTtcbiAgICBlLl9leHBlY3RlZEJ5VGVzdCA9IHRydWU7XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIGlmICghKExvY2FsQ29sbGVjdGlvbi5faXNQbGFpbk9iamVjdChkb2N1bWVudCkgJiZcbiAgICAhRUpTT04uX2lzQ3VzdG9tVHlwZShkb2N1bWVudCkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiT25seSBwbGFpbiBvYmplY3RzIG1heSBiZSBpbnNlcnRlZCBpbnRvIE1vbmdvREJcIik7XG4gIH1cblxuICB2YXIgd3JpdGUgPSBzZWxmLl9tYXliZUJlZ2luV3JpdGUoKTtcbiAgdmFyIHJlZnJlc2ggPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgYXdhaXQgTWV0ZW9yLnJlZnJlc2goe2NvbGxlY3Rpb246IGNvbGxlY3Rpb25fbmFtZSwgaWQ6IGRvY3VtZW50Ll9pZCB9KTtcbiAgfTtcbiAgcmV0dXJuIHNlbGYucmF3Q29sbGVjdGlvbihjb2xsZWN0aW9uX25hbWUpLmluc2VydE9uZShcbiAgICByZXBsYWNlVHlwZXMoZG9jdW1lbnQsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSxcbiAgICB7XG4gICAgICBzYWZlOiB0cnVlLFxuICAgIH1cbiAgKS50aGVuKGFzeW5jICh7aW5zZXJ0ZWRJZH0pID0+IHtcbiAgICBhd2FpdCByZWZyZXNoKCk7XG4gICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgcmV0dXJuIGluc2VydGVkSWQ7XG4gIH0pLmNhdGNoKGFzeW5jIGUgPT4ge1xuICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgIHRocm93IGU7XG4gIH0pO1xufTtcblxuXG4vLyBDYXVzZSBxdWVyaWVzIHRoYXQgbWF5IGJlIGFmZmVjdGVkIGJ5IHRoZSBzZWxlY3RvciB0byBwb2xsIGluIHRoaXMgd3JpdGVcbi8vIGZlbmNlLlxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5fcmVmcmVzaCA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgc2VsZWN0b3IpIHtcbiAgdmFyIHJlZnJlc2hLZXkgPSB7Y29sbGVjdGlvbjogY29sbGVjdGlvbk5hbWV9O1xuICAvLyBJZiB3ZSBrbm93IHdoaWNoIGRvY3VtZW50cyB3ZSdyZSByZW1vdmluZywgZG9uJ3QgcG9sbCBxdWVyaWVzIHRoYXQgYXJlXG4gIC8vIHNwZWNpZmljIHRvIG90aGVyIGRvY3VtZW50cy4gKE5vdGUgdGhhdCBtdWx0aXBsZSBub3RpZmljYXRpb25zIGhlcmUgc2hvdWxkXG4gIC8vIG5vdCBjYXVzZSBtdWx0aXBsZSBwb2xscywgc2luY2UgYWxsIG91ciBsaXN0ZW5lciBpcyBkb2luZyBpcyBlbnF1ZXVlaW5nIGFcbiAgLy8gcG9sbC4pXG4gIHZhciBzcGVjaWZpY0lkcyA9IExvY2FsQ29sbGVjdGlvbi5faWRzTWF0Y2hlZEJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICBpZiAoc3BlY2lmaWNJZHMpIHtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIHNwZWNpZmljSWRzKSB7XG4gICAgICBhd2FpdCBNZXRlb3IucmVmcmVzaChPYmplY3QuYXNzaWduKHtpZDogaWR9LCByZWZyZXNoS2V5KSk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBhd2FpdCBNZXRlb3IucmVmcmVzaChyZWZyZXNoS2V5KTtcbiAgfVxufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uX25hbWUsIHNlbGVjdG9yKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZiAoY29sbGVjdGlvbl9uYW1lID09PSBcIl9fX21ldGVvcl9mYWlsdXJlX3Rlc3RfY29sbGVjdGlvblwiKSB7XG4gICAgdmFyIGUgPSBuZXcgRXJyb3IoXCJGYWlsdXJlIHRlc3RcIik7XG4gICAgZS5fZXhwZWN0ZWRCeVRlc3QgPSB0cnVlO1xuICAgIHRocm93IGU7XG4gIH1cblxuICB2YXIgd3JpdGUgPSBzZWxmLl9tYXliZUJlZ2luV3JpdGUoKTtcbiAgdmFyIHJlZnJlc2ggPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgYXdhaXQgc2VsZi5fcmVmcmVzaChjb2xsZWN0aW9uX25hbWUsIHNlbGVjdG9yKTtcbiAgfTtcblxuICByZXR1cm4gc2VsZi5yYXdDb2xsZWN0aW9uKGNvbGxlY3Rpb25fbmFtZSlcbiAgICAuZGVsZXRlTWFueShyZXBsYWNlVHlwZXMoc2VsZWN0b3IsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSwge1xuICAgICAgc2FmZTogdHJ1ZSxcbiAgICB9KVxuICAgIC50aGVuKGFzeW5jICh7IGRlbGV0ZWRDb3VudCB9KSA9PiB7XG4gICAgICBhd2FpdCByZWZyZXNoKCk7XG4gICAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICAgIHJldHVybiB0cmFuc2Zvcm1SZXN1bHQoeyByZXN1bHQgOiB7bW9kaWZpZWRDb3VudCA6IGRlbGV0ZWRDb3VudH0gfSkubnVtYmVyQWZmZWN0ZWQ7XG4gICAgfSkuY2F0Y2goYXN5bmMgKGVycikgPT4ge1xuICAgICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmRyb3BDb2xsZWN0aW9uQXN5bmMgPSBhc3luYyBmdW5jdGlvbihjb2xsZWN0aW9uTmFtZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cblxuICB2YXIgd3JpdGUgPSBzZWxmLl9tYXliZUJlZ2luV3JpdGUoKTtcbiAgdmFyIHJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWV0ZW9yLnJlZnJlc2goe1xuICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbk5hbWUsXG4gICAgICBpZDogbnVsbCxcbiAgICAgIGRyb3BDb2xsZWN0aW9uOiB0cnVlLFxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBzZWxmXG4gICAgLnJhd0NvbGxlY3Rpb24oY29sbGVjdGlvbk5hbWUpXG4gICAgLmRyb3AoKVxuICAgIC50aGVuKGFzeW5jIHJlc3VsdCA9PiB7XG4gICAgICBhd2FpdCByZWZyZXNoKCk7XG4gICAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSlcbiAgICAuY2F0Y2goYXN5bmMgZSA9PiB7XG4gICAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICAgIHRocm93IGU7XG4gICAgfSk7XG59O1xuXG4vLyBGb3IgdGVzdGluZyBvbmx5LiAgU2xpZ2h0bHkgYmV0dGVyIHRoYW4gYGMucmF3RGF0YWJhc2UoKS5kcm9wRGF0YWJhc2UoKWBcbi8vIGJlY2F1c2UgaXQgbGV0cyB0aGUgdGVzdCdzIGZlbmNlIHdhaXQgZm9yIGl0IHRvIGJlIGNvbXBsZXRlLlxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5kcm9wRGF0YWJhc2VBc3luYyA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHZhciB3cml0ZSA9IHNlbGYuX21heWJlQmVnaW5Xcml0ZSgpO1xuICB2YXIgcmVmcmVzaCA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBhd2FpdCBNZXRlb3IucmVmcmVzaCh7IGRyb3BEYXRhYmFzZTogdHJ1ZSB9KTtcbiAgfTtcblxuICB0cnkge1xuICAgIGF3YWl0IHNlbGYuZGIuX2Ryb3BEYXRhYmFzZSgpO1xuICAgIGF3YWl0IHJlZnJlc2goKTtcbiAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUudXBkYXRlQXN5bmMgPSBhc3luYyBmdW5jdGlvbiAoY29sbGVjdGlvbl9uYW1lLCBzZWxlY3RvciwgbW9kLCBvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZiAoY29sbGVjdGlvbl9uYW1lID09PSBcIl9fX21ldGVvcl9mYWlsdXJlX3Rlc3RfY29sbGVjdGlvblwiKSB7XG4gICAgdmFyIGUgPSBuZXcgRXJyb3IoXCJGYWlsdXJlIHRlc3RcIik7XG4gICAgZS5fZXhwZWN0ZWRCeVRlc3QgPSB0cnVlO1xuICAgIHRocm93IGU7XG4gIH1cblxuICAvLyBleHBsaWNpdCBzYWZldHkgY2hlY2suIG51bGwgYW5kIHVuZGVmaW5lZCBjYW4gY3Jhc2ggdGhlIG1vbmdvXG4gIC8vIGRyaXZlci4gQWx0aG91Z2ggdGhlIG5vZGUgZHJpdmVyIGFuZCBtaW5pbW9uZ28gZG8gJ3N1cHBvcnQnXG4gIC8vIG5vbi1vYmplY3QgbW9kaWZpZXIgaW4gdGhhdCB0aGV5IGRvbid0IGNyYXNoLCB0aGV5IGFyZSBub3RcbiAgLy8gbWVhbmluZ2Z1bCBvcGVyYXRpb25zIGFuZCBkbyBub3QgZG8gYW55dGhpbmcuIERlZmVuc2l2ZWx5IHRocm93IGFuXG4gIC8vIGVycm9yIGhlcmUuXG4gIGlmICghbW9kIHx8IHR5cGVvZiBtb2QgIT09ICdvYmplY3QnKSB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoXCJJbnZhbGlkIG1vZGlmaWVyLiBNb2RpZmllciBtdXN0IGJlIGFuIG9iamVjdC5cIik7XG5cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuXG4gIGlmICghKExvY2FsQ29sbGVjdGlvbi5faXNQbGFpbk9iamVjdChtb2QpICYmICFFSlNPTi5faXNDdXN0b21UeXBlKG1vZCkpKSB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICBcIk9ubHkgcGxhaW4gb2JqZWN0cyBtYXkgYmUgdXNlZCBhcyByZXBsYWNlbWVudFwiICtcbiAgICAgIFwiIGRvY3VtZW50cyBpbiBNb25nb0RCXCIpO1xuXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblxuICB2YXIgd3JpdGUgPSBzZWxmLl9tYXliZUJlZ2luV3JpdGUoKTtcbiAgdmFyIHJlZnJlc2ggPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgYXdhaXQgc2VsZi5fcmVmcmVzaChjb2xsZWN0aW9uX25hbWUsIHNlbGVjdG9yKTtcbiAgfTtcblxuICB2YXIgY29sbGVjdGlvbiA9IHNlbGYucmF3Q29sbGVjdGlvbihjb2xsZWN0aW9uX25hbWUpO1xuICB2YXIgbW9uZ29PcHRzID0ge3NhZmU6IHRydWV9O1xuICAvLyBBZGQgc3VwcG9ydCBmb3IgZmlsdGVyZWQgcG9zaXRpb25hbCBvcGVyYXRvclxuICBpZiAob3B0aW9ucy5hcnJheUZpbHRlcnMgIT09IHVuZGVmaW5lZCkgbW9uZ29PcHRzLmFycmF5RmlsdGVycyA9IG9wdGlvbnMuYXJyYXlGaWx0ZXJzO1xuICAvLyBleHBsaWN0bHkgZW51bWVyYXRlIG9wdGlvbnMgdGhhdCBtaW5pbW9uZ28gc3VwcG9ydHNcbiAgaWYgKG9wdGlvbnMudXBzZXJ0KSBtb25nb09wdHMudXBzZXJ0ID0gdHJ1ZTtcbiAgaWYgKG9wdGlvbnMubXVsdGkpIG1vbmdvT3B0cy5tdWx0aSA9IHRydWU7XG4gIC8vIExldHMgeW91IGdldCBhIG1vcmUgbW9yZSBmdWxsIHJlc3VsdCBmcm9tIE1vbmdvREIuIFVzZSB3aXRoIGNhdXRpb246XG4gIC8vIG1pZ2h0IG5vdCB3b3JrIHdpdGggQy51cHNlcnQgKGFzIG9wcG9zZWQgdG8gQy51cGRhdGUoe3Vwc2VydDp0cnVlfSkgb3JcbiAgLy8gd2l0aCBzaW11bGF0ZWQgdXBzZXJ0LlxuICBpZiAob3B0aW9ucy5mdWxsUmVzdWx0KSBtb25nb09wdHMuZnVsbFJlc3VsdCA9IHRydWU7XG5cbiAgdmFyIG1vbmdvU2VsZWN0b3IgPSByZXBsYWNlVHlwZXMoc2VsZWN0b3IsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKTtcbiAgdmFyIG1vbmdvTW9kID0gcmVwbGFjZVR5cGVzKG1vZCwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28pO1xuXG4gIHZhciBpc01vZGlmeSA9IExvY2FsQ29sbGVjdGlvbi5faXNNb2RpZmljYXRpb25Nb2QobW9uZ29Nb2QpO1xuXG4gIGlmIChvcHRpb25zLl9mb3JiaWRSZXBsYWNlICYmICFpc01vZGlmeSkge1xuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoXCJJbnZhbGlkIG1vZGlmaWVyLiBSZXBsYWNlbWVudHMgYXJlIGZvcmJpZGRlbi5cIik7XG4gICAgdGhyb3cgZXJyO1xuICB9XG5cbiAgLy8gV2UndmUgYWxyZWFkeSBydW4gcmVwbGFjZVR5cGVzL3JlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvIG9uXG4gIC8vIHNlbGVjdG9yIGFuZCBtb2QuICBXZSBhc3N1bWUgaXQgZG9lc24ndCBtYXR0ZXIsIGFzIGZhciBhc1xuICAvLyB0aGUgYmVoYXZpb3Igb2YgbW9kaWZpZXJzIGlzIGNvbmNlcm5lZCwgd2hldGhlciBgX21vZGlmeWBcbiAgLy8gaXMgcnVuIG9uIEVKU09OIG9yIG9uIG1vbmdvLWNvbnZlcnRlZCBFSlNPTi5cblxuICAvLyBSdW4gdGhpcyBjb2RlIHVwIGZyb250IHNvIHRoYXQgaXQgZmFpbHMgZmFzdCBpZiBzb21lb25lIHVzZXNcbiAgLy8gYSBNb25nbyB1cGRhdGUgb3BlcmF0b3Igd2UgZG9uJ3Qgc3VwcG9ydC5cbiAgbGV0IGtub3duSWQ7XG4gIGlmIChvcHRpb25zLnVwc2VydCkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgbmV3RG9jID0gTG9jYWxDb2xsZWN0aW9uLl9jcmVhdGVVcHNlcnREb2N1bWVudChzZWxlY3RvciwgbW9kKTtcbiAgICAgIGtub3duSWQgPSBuZXdEb2MuX2lkO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuICBpZiAob3B0aW9ucy51cHNlcnQgJiZcbiAgICAhIGlzTW9kaWZ5ICYmXG4gICAgISBrbm93bklkICYmXG4gICAgb3B0aW9ucy5pbnNlcnRlZElkICYmXG4gICAgISAob3B0aW9ucy5pbnNlcnRlZElkIGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SUQgJiZcbiAgICAgIG9wdGlvbnMuZ2VuZXJhdGVkSWQpKSB7XG4gICAgLy8gSW4gY2FzZSBvZiBhbiB1cHNlcnQgd2l0aCBhIHJlcGxhY2VtZW50LCB3aGVyZSB0aGVyZSBpcyBubyBfaWQgZGVmaW5lZFxuICAgIC8vIGluIGVpdGhlciB0aGUgcXVlcnkgb3IgdGhlIHJlcGxhY2VtZW50IGRvYywgbW9uZ28gd2lsbCBnZW5lcmF0ZSBhbiBpZCBpdHNlbGYuXG4gICAgLy8gVGhlcmVmb3JlIHdlIG5lZWQgdGhpcyBzcGVjaWFsIHN0cmF0ZWd5IGlmIHdlIHdhbnQgdG8gY29udHJvbCB0aGUgaWQgb3Vyc2VsdmVzLlxuXG4gICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyB0aGlzIHdoZW46XG4gICAgLy8gLSBUaGlzIGlzIG5vdCBhIHJlcGxhY2VtZW50LCBzbyB3ZSBjYW4gYWRkIGFuIF9pZCB0byAkc2V0T25JbnNlcnRcbiAgICAvLyAtIFRoZSBpZCBpcyBkZWZpbmVkIGJ5IHF1ZXJ5IG9yIG1vZCB3ZSBjYW4ganVzdCBhZGQgaXQgdG8gdGhlIHJlcGxhY2VtZW50IGRvY1xuICAgIC8vIC0gVGhlIHVzZXIgZGlkIG5vdCBzcGVjaWZ5IGFueSBpZCBwcmVmZXJlbmNlIGFuZCB0aGUgaWQgaXMgYSBNb25nbyBPYmplY3RJZCxcbiAgICAvLyAgICAgdGhlbiB3ZSBjYW4ganVzdCBsZXQgTW9uZ28gZ2VuZXJhdGUgdGhlIGlkXG4gICAgcmV0dXJuIGF3YWl0IHNpbXVsYXRlVXBzZXJ0V2l0aEluc2VydGVkSWQoY29sbGVjdGlvbiwgbW9uZ29TZWxlY3RvciwgbW9uZ29Nb2QsIG9wdGlvbnMpXG4gICAgICAudGhlbihhc3luYyByZXN1bHQgPT4ge1xuICAgICAgICBhd2FpdCByZWZyZXNoKCk7XG4gICAgICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgICAgICBpZiAocmVzdWx0ICYmICEgb3B0aW9ucy5fcmV0dXJuT2JqZWN0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5udW1iZXJBZmZlY3RlZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBpZiAob3B0aW9ucy51cHNlcnQgJiYgIWtub3duSWQgJiYgb3B0aW9ucy5pbnNlcnRlZElkICYmIGlzTW9kaWZ5KSB7XG4gICAgICBpZiAoIW1vbmdvTW9kLmhhc093blByb3BlcnR5KCckc2V0T25JbnNlcnQnKSkge1xuICAgICAgICBtb25nb01vZC4kc2V0T25JbnNlcnQgPSB7fTtcbiAgICAgIH1cbiAgICAgIGtub3duSWQgPSBvcHRpb25zLmluc2VydGVkSWQ7XG4gICAgICBPYmplY3QuYXNzaWduKG1vbmdvTW9kLiRzZXRPbkluc2VydCwgcmVwbGFjZVR5cGVzKHtfaWQ6IG9wdGlvbnMuaW5zZXJ0ZWRJZH0sIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyaW5ncyA9IE9iamVjdC5rZXlzKG1vbmdvTW9kKS5maWx0ZXIoKGtleSkgPT4gIWtleS5zdGFydHNXaXRoKFwiJFwiKSk7XG4gICAgbGV0IHVwZGF0ZU1ldGhvZCA9IHN0cmluZ3MubGVuZ3RoID4gMCA/ICdyZXBsYWNlT25lJyA6ICd1cGRhdGVNYW55JztcbiAgICB1cGRhdGVNZXRob2QgPVxuICAgICAgdXBkYXRlTWV0aG9kID09PSAndXBkYXRlTWFueScgJiYgIW1vbmdvT3B0cy5tdWx0aVxuICAgICAgICA/ICd1cGRhdGVPbmUnXG4gICAgICAgIDogdXBkYXRlTWV0aG9kO1xuICAgIHJldHVybiBjb2xsZWN0aW9uW3VwZGF0ZU1ldGhvZF1cbiAgICAgIC5iaW5kKGNvbGxlY3Rpb24pKG1vbmdvU2VsZWN0b3IsIG1vbmdvTW9kLCBtb25nb09wdHMpXG4gICAgICAudGhlbihhc3luYyByZXN1bHQgPT4ge1xuICAgICAgICB2YXIgbWV0ZW9yUmVzdWx0ID0gdHJhbnNmb3JtUmVzdWx0KHtyZXN1bHR9KTtcbiAgICAgICAgaWYgKG1ldGVvclJlc3VsdCAmJiBvcHRpb25zLl9yZXR1cm5PYmplY3QpIHtcbiAgICAgICAgICAvLyBJZiB0aGlzIHdhcyBhbiB1cHNlcnRBc3luYygpIGNhbGwsIGFuZCB3ZSBlbmRlZCB1cFxuICAgICAgICAgIC8vIGluc2VydGluZyBhIG5ldyBkb2MgYW5kIHdlIGtub3cgaXRzIGlkLCB0aGVuXG4gICAgICAgICAgLy8gcmV0dXJuIHRoYXQgaWQgYXMgd2VsbC5cbiAgICAgICAgICBpZiAob3B0aW9ucy51cHNlcnQgJiYgbWV0ZW9yUmVzdWx0Lmluc2VydGVkSWQpIHtcbiAgICAgICAgICAgIGlmIChrbm93bklkKSB7XG4gICAgICAgICAgICAgIG1ldGVvclJlc3VsdC5pbnNlcnRlZElkID0ga25vd25JZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWV0ZW9yUmVzdWx0Lmluc2VydGVkSWQgaW5zdGFuY2VvZiBNb25nb0RCLk9iamVjdElkKSB7XG4gICAgICAgICAgICAgIG1ldGVvclJlc3VsdC5pbnNlcnRlZElkID0gbmV3IE1vbmdvLk9iamVjdElEKG1ldGVvclJlc3VsdC5pbnNlcnRlZElkLnRvSGV4U3RyaW5nKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBhd2FpdCByZWZyZXNoKCk7XG4gICAgICAgICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgICAgICAgcmV0dXJuIG1ldGVvclJlc3VsdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCByZWZyZXNoKCk7XG4gICAgICAgICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgICAgICAgcmV0dXJuIG1ldGVvclJlc3VsdC5udW1iZXJBZmZlY3RlZDtcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goYXN5bmMgKGVycikgPT4ge1xuICAgICAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfSk7XG4gIH1cbn07XG5cbi8vIGV4cG9zZWQgZm9yIHRlc3Rpbmdcbk1vbmdvQ29ubmVjdGlvbi5faXNDYW5ub3RDaGFuZ2VJZEVycm9yID0gZnVuY3Rpb24gKGVycikge1xuXG4gIC8vIE1vbmdvIDMuMi4qIHJldHVybnMgZXJyb3IgYXMgbmV4dCBPYmplY3Q6XG4gIC8vIHtuYW1lOiBTdHJpbmcsIGNvZGU6IE51bWJlciwgZXJybXNnOiBTdHJpbmd9XG4gIC8vIE9sZGVyIE1vbmdvIHJldHVybnM6XG4gIC8vIHtuYW1lOiBTdHJpbmcsIGNvZGU6IE51bWJlciwgZXJyOiBTdHJpbmd9XG4gIHZhciBlcnJvciA9IGVyci5lcnJtc2cgfHwgZXJyLmVycjtcblxuICAvLyBXZSBkb24ndCB1c2UgdGhlIGVycm9yIGNvZGUgaGVyZVxuICAvLyBiZWNhdXNlIHRoZSBlcnJvciBjb2RlIHdlIG9ic2VydmVkIGl0IHByb2R1Y2luZyAoMTY4MzcpIGFwcGVhcnMgdG8gYmVcbiAgLy8gYSBmYXIgbW9yZSBnZW5lcmljIGVycm9yIGNvZGUgYmFzZWQgb24gZXhhbWluaW5nIHRoZSBzb3VyY2UuXG4gIGlmIChlcnJvci5pbmRleE9mKCdUaGUgX2lkIGZpZWxkIGNhbm5vdCBiZSBjaGFuZ2VkJykgPT09IDBcbiAgICB8fCBlcnJvci5pbmRleE9mKFwidGhlIChpbW11dGFibGUpIGZpZWxkICdfaWQnIHdhcyBmb3VuZCB0byBoYXZlIGJlZW4gYWx0ZXJlZCB0byBfaWRcIikgIT09IC0xKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vLyBYWFggTW9uZ29Db25uZWN0aW9uLnVwc2VydEFzeW5jKCkgZG9lcyBub3QgcmV0dXJuIHRoZSBpZCBvZiB0aGUgaW5zZXJ0ZWQgZG9jdW1lbnRcbi8vIHVubGVzcyB5b3Ugc2V0IGl0IGV4cGxpY2l0bHkgaW4gdGhlIHNlbGVjdG9yIG9yIG1vZGlmaWVyIChhcyBhIHJlcGxhY2VtZW50XG4vLyBkb2MpLlxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS51cHNlcnRBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgc2VsZWN0b3IsIG1vZCwgb3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cblxuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gXCJmdW5jdGlvblwiICYmICEgY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgcmV0dXJuIHNlbGYudXBkYXRlQXN5bmMoY29sbGVjdGlvbk5hbWUsIHNlbGVjdG9yLCBtb2QsXG4gICAgT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucywge1xuICAgICAgdXBzZXJ0OiB0cnVlLFxuICAgICAgX3JldHVybk9iamVjdDogdHJ1ZVxuICAgIH0pKTtcbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuZmluZCA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgc2VsZWN0b3IsIG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKVxuICAgIHNlbGVjdG9yID0ge307XG5cbiAgcmV0dXJuIG5ldyBDdXJzb3IoXG4gICAgc2VsZiwgbmV3IEN1cnNvckRlc2NyaXB0aW9uKGNvbGxlY3Rpb25OYW1lLCBzZWxlY3Rvciwgb3B0aW9ucykpO1xufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5maW5kT25lQXN5bmMgPSBhc3luYyBmdW5jdGlvbiAoY29sbGVjdGlvbl9uYW1lLCBzZWxlY3Rvciwgb3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgc2VsZWN0b3IgPSB7fTtcbiAgfVxuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBvcHRpb25zLmxpbWl0ID0gMTtcblxuICBjb25zdCByZXN1bHRzID0gYXdhaXQgc2VsZi5maW5kKGNvbGxlY3Rpb25fbmFtZSwgc2VsZWN0b3IsIG9wdGlvbnMpLmZldGNoKCk7XG5cbiAgcmV0dXJuIHJlc3VsdHNbMF07XG59O1xuXG4vLyBXZSdsbCBhY3R1YWxseSBkZXNpZ24gYW4gaW5kZXggQVBJIGxhdGVyLiBGb3Igbm93LCB3ZSBqdXN0IHBhc3MgdGhyb3VnaCB0b1xuLy8gTW9uZ28ncywgYnV0IG1ha2UgaXQgc3luY2hyb25vdXMuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZUluZGV4QXN5bmMgPSBhc3luYyBmdW5jdGlvbiAoY29sbGVjdGlvbk5hbWUsIGluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIFdlIGV4cGVjdCB0aGlzIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhdCBzdGFydHVwLCBub3QgZnJvbSB3aXRoaW4gYSBtZXRob2QsXG4gIC8vIHNvIHdlIGRvbid0IGludGVyYWN0IHdpdGggdGhlIHdyaXRlIGZlbmNlLlxuICB2YXIgY29sbGVjdGlvbiA9IHNlbGYucmF3Q29sbGVjdGlvbihjb2xsZWN0aW9uTmFtZSk7XG4gIGF3YWl0IGNvbGxlY3Rpb24uY3JlYXRlSW5kZXgoaW5kZXgsIG9wdGlvbnMpO1xufTtcblxuLy8ganVzdCB0byBiZSBjb25zaXN0ZW50IHdpdGggdGhlIG90aGVyIG1ldGhvZHNcbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlSW5kZXggPVxuICBNb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZUluZGV4QXN5bmM7XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuY291bnREb2N1bWVudHMgPSBmdW5jdGlvbiAoY29sbGVjdGlvbk5hbWUsIC4uLmFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MubWFwKGFyZyA9PiByZXBsYWNlVHlwZXMoYXJnLCByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbykpO1xuICBjb25zdCBjb2xsZWN0aW9uID0gdGhpcy5yYXdDb2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lKTtcbiAgcmV0dXJuIGNvbGxlY3Rpb24uY291bnREb2N1bWVudHMoLi4uYXJncyk7XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmVzdGltYXRlZERvY3VtZW50Q291bnQgPSBmdW5jdGlvbiAoY29sbGVjdGlvbk5hbWUsIC4uLmFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MubWFwKGFyZyA9PiByZXBsYWNlVHlwZXMoYXJnLCByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbykpO1xuICBjb25zdCBjb2xsZWN0aW9uID0gdGhpcy5yYXdDb2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lKTtcbiAgcmV0dXJuIGNvbGxlY3Rpb24uZXN0aW1hdGVkRG9jdW1lbnRDb3VudCguLi5hcmdzKTtcbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuZW5zdXJlSW5kZXhBc3luYyA9IE1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlSW5kZXhBc3luYztcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5kcm9wSW5kZXhBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgaW5kZXgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG5cbiAgLy8gVGhpcyBmdW5jdGlvbiBpcyBvbmx5IHVzZWQgYnkgdGVzdCBjb2RlLCBub3Qgd2l0aGluIGEgbWV0aG9kLCBzbyB3ZSBkb24ndFxuICAvLyBpbnRlcmFjdCB3aXRoIHRoZSB3cml0ZSBmZW5jZS5cbiAgdmFyIGNvbGxlY3Rpb24gPSBzZWxmLnJhd0NvbGxlY3Rpb24oY29sbGVjdGlvbk5hbWUpO1xuICB2YXIgaW5kZXhOYW1lID0gIGF3YWl0IGNvbGxlY3Rpb24uZHJvcEluZGV4KGluZGV4KTtcbn07XG5cblxuQ0xJRU5UX09OTFlfTUVUSE9EUy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gIE1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGVbbV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYCR7bX0gKyAgaXMgbm90IGF2YWlsYWJsZSBvbiB0aGUgc2VydmVyLiBQbGVhc2UgdXNlICR7Z2V0QXN5bmNNZXRob2ROYW1lKFxuICAgICAgICBtXG4gICAgICApfSgpIGluc3RlYWQuYFxuICAgICk7XG4gIH07XG59KTtcblxuXG52YXIgTlVNX09QVElNSVNUSUNfVFJJRVMgPSAzO1xuXG5cblxudmFyIHNpbXVsYXRlVXBzZXJ0V2l0aEluc2VydGVkSWQgPSBhc3luYyBmdW5jdGlvbiAoY29sbGVjdGlvbiwgc2VsZWN0b3IsIG1vZCwgb3B0aW9ucykge1xuICAvLyBTVFJBVEVHWTogRmlyc3QgdHJ5IGRvaW5nIGFuIHVwc2VydCB3aXRoIGEgZ2VuZXJhdGVkIElELlxuICAvLyBJZiB0aGlzIHRocm93cyBhbiBlcnJvciBhYm91dCBjaGFuZ2luZyB0aGUgSUQgb24gYW4gZXhpc3RpbmcgZG9jdW1lbnRcbiAgLy8gdGhlbiB3aXRob3V0IGFmZmVjdGluZyB0aGUgZGF0YWJhc2UsIHdlIGtub3cgd2Ugc2hvdWxkIHByb2JhYmx5IHRyeVxuICAvLyBhbiB1cGRhdGUgd2l0aG91dCB0aGUgZ2VuZXJhdGVkIElELiBJZiBpdCBhZmZlY3RlZCAwIGRvY3VtZW50cyxcbiAgLy8gdGhlbiB3aXRob3V0IGFmZmVjdGluZyB0aGUgZGF0YWJhc2UsIHdlIHRoZSBkb2N1bWVudCB0aGF0IGZpcnN0XG4gIC8vIGdhdmUgdGhlIGVycm9yIGlzIHByb2JhYmx5IHJlbW92ZWQgYW5kIHdlIG5lZWQgdG8gdHJ5IGFuIGluc2VydCBhZ2FpblxuICAvLyBXZSBnbyBiYWNrIHRvIHN0ZXAgb25lIGFuZCByZXBlYXQuXG4gIC8vIExpa2UgYWxsIFwib3B0aW1pc3RpYyB3cml0ZVwiIHNjaGVtZXMsIHdlIHJlbHkgb24gdGhlIGZhY3QgdGhhdCBpdCdzXG4gIC8vIHVubGlrZWx5IG91ciB3cml0ZXMgd2lsbCBjb250aW51ZSB0byBiZSBpbnRlcmZlcmVkIHdpdGggdW5kZXIgbm9ybWFsXG4gIC8vIGNpcmN1bXN0YW5jZXMgKHRob3VnaCBzdWZmaWNpZW50bHkgaGVhdnkgY29udGVudGlvbiB3aXRoIHdyaXRlcnNcbiAgLy8gZGlzYWdyZWVpbmcgb24gdGhlIGV4aXN0ZW5jZSBvZiBhbiBvYmplY3Qgd2lsbCBjYXVzZSB3cml0ZXMgdG8gZmFpbFxuICAvLyBpbiB0aGVvcnkpLlxuXG4gIHZhciBpbnNlcnRlZElkID0gb3B0aW9ucy5pbnNlcnRlZElkOyAvLyBtdXN0IGV4aXN0XG4gIHZhciBtb25nb09wdHNGb3JVcGRhdGUgPSB7XG4gICAgc2FmZTogdHJ1ZSxcbiAgICBtdWx0aTogb3B0aW9ucy5tdWx0aVxuICB9O1xuICB2YXIgbW9uZ29PcHRzRm9ySW5zZXJ0ID0ge1xuICAgIHNhZmU6IHRydWUsXG4gICAgdXBzZXJ0OiB0cnVlXG4gIH07XG5cbiAgdmFyIHJlcGxhY2VtZW50V2l0aElkID0gT2JqZWN0LmFzc2lnbihcbiAgICByZXBsYWNlVHlwZXMoe19pZDogaW5zZXJ0ZWRJZH0sIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSxcbiAgICBtb2QpO1xuXG4gIHZhciB0cmllcyA9IE5VTV9PUFRJTUlTVElDX1RSSUVTO1xuXG4gIHZhciBkb1VwZGF0ZSA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICB0cmllcy0tO1xuICAgIGlmICghIHRyaWVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVcHNlcnQgZmFpbGVkIGFmdGVyIFwiICsgTlVNX09QVElNSVNUSUNfVFJJRVMgKyBcIiB0cmllcy5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBtZXRob2QgPSBjb2xsZWN0aW9uLnVwZGF0ZU1hbnk7XG4gICAgICBpZighT2JqZWN0LmtleXMobW9kKS5zb21lKGtleSA9PiBrZXkuc3RhcnRzV2l0aChcIiRcIikpKXtcbiAgICAgICAgbWV0aG9kID0gY29sbGVjdGlvbi5yZXBsYWNlT25lLmJpbmQoY29sbGVjdGlvbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWV0aG9kKFxuICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgbW9kLFxuICAgICAgICBtb25nb09wdHNGb3JVcGRhdGUpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiAocmVzdWx0Lm1vZGlmaWVkQ291bnQgfHwgcmVzdWx0LnVwc2VydGVkQ291bnQpKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG51bWJlckFmZmVjdGVkOiByZXN1bHQubW9kaWZpZWRDb3VudCB8fCByZXN1bHQudXBzZXJ0ZWRDb3VudCxcbiAgICAgICAgICAgIGluc2VydGVkSWQ6IHJlc3VsdC51cHNlcnRlZElkIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBkb0NvbmRpdGlvbmFsSW5zZXJ0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZG9Db25kaXRpb25hbEluc2VydCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb2xsZWN0aW9uLnJlcGxhY2VPbmUoc2VsZWN0b3IsIHJlcGxhY2VtZW50V2l0aElkLCBtb25nb09wdHNGb3JJbnNlcnQpXG4gICAgICAudGhlbihyZXN1bHQgPT4gKHtcbiAgICAgICAgbnVtYmVyQWZmZWN0ZWQ6IHJlc3VsdC51cHNlcnRlZENvdW50LFxuICAgICAgICBpbnNlcnRlZElkOiByZXN1bHQudXBzZXJ0ZWRJZCxcbiAgICAgIH0pKS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBpZiAoTW9uZ29Db25uZWN0aW9uLl9pc0Nhbm5vdENoYW5nZUlkRXJyb3IoZXJyKSkge1xuICAgICAgICAgIHJldHVybiBkb1VwZGF0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgfTtcbiAgcmV0dXJuIGRvVXBkYXRlKCk7XG59O1xuXG4vLyBvYnNlcnZlQ2hhbmdlcyBmb3IgdGFpbGFibGUgY3Vyc29ycyBvbiBjYXBwZWQgY29sbGVjdGlvbnMuXG4vL1xuLy8gU29tZSBkaWZmZXJlbmNlcyBmcm9tIG5vcm1hbCBjdXJzb3JzOlxuLy8gICAtIFdpbGwgbmV2ZXIgcHJvZHVjZSBhbnl0aGluZyBvdGhlciB0aGFuICdhZGRlZCcgb3IgJ2FkZGVkQmVmb3JlJy4gSWYgeW91XG4vLyAgICAgZG8gdXBkYXRlIGEgZG9jdW1lbnQgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIHByb2R1Y2VkLCB0aGlzIHdpbGwgbm90IG5vdGljZVxuLy8gICAgIGl0LlxuLy8gICAtIElmIHlvdSBkaXNjb25uZWN0IGFuZCByZWNvbm5lY3QgZnJvbSBNb25nbywgaXQgd2lsbCBlc3NlbnRpYWxseSByZXN0YXJ0XG4vLyAgICAgdGhlIHF1ZXJ5LCB3aGljaCB3aWxsIGxlYWQgdG8gZHVwbGljYXRlIHJlc3VsdHMuIFRoaXMgaXMgcHJldHR5IGJhZCxcbi8vICAgICBidXQgaWYgeW91IGluY2x1ZGUgYSBmaWVsZCBjYWxsZWQgJ3RzJyB3aGljaCBpcyBpbnNlcnRlZCBhc1xuLy8gICAgIG5ldyBNb25nb0ludGVybmFscy5Nb25nb1RpbWVzdGFtcCgwLCAwKSAod2hpY2ggaXMgaW5pdGlhbGl6ZWQgdG8gdGhlXG4vLyAgICAgY3VycmVudCBNb25nby1zdHlsZSB0aW1lc3RhbXApLCB3ZSdsbCBiZSBhYmxlIHRvIGZpbmQgdGhlIHBsYWNlIHRvXG4vLyAgICAgcmVzdGFydCBwcm9wZXJseS4gKFRoaXMgZmllbGQgaXMgc3BlY2lmaWNhbGx5IHVuZGVyc3Rvb2QgYnkgTW9uZ28gd2l0aCBhblxuLy8gICAgIG9wdGltaXphdGlvbiB3aGljaCBhbGxvd3MgaXQgdG8gZmluZCB0aGUgcmlnaHQgcGxhY2UgdG8gc3RhcnQgd2l0aG91dFxuLy8gICAgIGFuIGluZGV4IG9uIHRzLiBJdCdzIGhvdyB0aGUgb3Bsb2cgd29ya3MuKVxuLy8gICAtIE5vIGNhbGxiYWNrcyBhcmUgdHJpZ2dlcmVkIHN5bmNocm9ub3VzbHkgd2l0aCB0aGUgY2FsbCAodGhlcmUncyBub1xuLy8gICAgIGRpZmZlcmVudGlhdGlvbiBiZXR3ZWVuIFwiaW5pdGlhbCBkYXRhXCIgYW5kIFwibGF0ZXIgY2hhbmdlc1wiOyBldmVyeXRoaW5nXG4vLyAgICAgdGhhdCBtYXRjaGVzIHRoZSBxdWVyeSBnZXRzIHNlbnQgYXN5bmNocm9ub3VzbHkpLlxuLy8gICAtIERlLWR1cGxpY2F0aW9uIGlzIG5vdCBpbXBsZW1lbnRlZC5cbi8vICAgLSBEb2VzIG5vdCB5ZXQgaW50ZXJhY3Qgd2l0aCB0aGUgd3JpdGUgZmVuY2UuIFByb2JhYmx5LCB0aGlzIHNob3VsZCB3b3JrIGJ5XG4vLyAgICAgaWdub3JpbmcgcmVtb3ZlcyAod2hpY2ggZG9uJ3Qgd29yayBvbiBjYXBwZWQgY29sbGVjdGlvbnMpIGFuZCB1cGRhdGVzXG4vLyAgICAgKHdoaWNoIGRvbid0IGFmZmVjdCB0YWlsYWJsZSBjdXJzb3JzKSwgYW5kIGp1c3Qga2VlcGluZyB0cmFjayBvZiB0aGUgSURcbi8vICAgICBvZiB0aGUgaW5zZXJ0ZWQgb2JqZWN0LCBhbmQgY2xvc2luZyB0aGUgd3JpdGUgZmVuY2Ugb25jZSB5b3UgZ2V0IHRvIHRoYXRcbi8vICAgICBJRCAob3IgdGltZXN0YW1wPykuICBUaGlzIGRvZXNuJ3Qgd29yayB3ZWxsIGlmIHRoZSBkb2N1bWVudCBkb2Vzbid0IG1hdGNoXG4vLyAgICAgdGhlIHF1ZXJ5LCB0aG91Z2guICBPbiB0aGUgb3RoZXIgaGFuZCwgdGhlIHdyaXRlIGZlbmNlIGNhbiBjbG9zZVxuLy8gICAgIGltbWVkaWF0ZWx5IGlmIGl0IGRvZXMgbm90IG1hdGNoIHRoZSBxdWVyeS4gU28gaWYgd2UgdHJ1c3QgbWluaW1vbmdvXG4vLyAgICAgZW5vdWdoIHRvIGFjY3VyYXRlbHkgZXZhbHVhdGUgdGhlIHF1ZXJ5IGFnYWluc3QgdGhlIHdyaXRlIGZlbmNlLCB3ZVxuLy8gICAgIHNob3VsZCBiZSBhYmxlIHRvIGRvIHRoaXMuLi4gIE9mIGNvdXJzZSwgbWluaW1vbmdvIGRvZXNuJ3QgZXZlbiBzdXBwb3J0XG4vLyAgICAgTW9uZ28gVGltZXN0YW1wcyB5ZXQuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9vYnNlcnZlQ2hhbmdlc1RhaWxhYmxlID0gZnVuY3Rpb24gKFxuICBjdXJzb3JEZXNjcmlwdGlvbiwgb3JkZXJlZCwgY2FsbGJhY2tzKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBUYWlsYWJsZSBjdXJzb3JzIG9ubHkgZXZlciBjYWxsIGFkZGVkL2FkZGVkQmVmb3JlIGNhbGxiYWNrcywgc28gaXQncyBhblxuICAvLyBlcnJvciBpZiB5b3UgZGlkbid0IHByb3ZpZGUgdGhlbS5cbiAgaWYgKChvcmRlcmVkICYmICFjYWxsYmFja3MuYWRkZWRCZWZvcmUpIHx8XG4gICAgKCFvcmRlcmVkICYmICFjYWxsYmFja3MuYWRkZWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgb2JzZXJ2ZSBhbiBcIiArIChvcmRlcmVkID8gXCJvcmRlcmVkXCIgOiBcInVub3JkZXJlZFwiKVxuICAgICAgKyBcIiB0YWlsYWJsZSBjdXJzb3Igd2l0aG91dCBhIFwiXG4gICAgICArIChvcmRlcmVkID8gXCJhZGRlZEJlZm9yZVwiIDogXCJhZGRlZFwiKSArIFwiIGNhbGxiYWNrXCIpO1xuICB9XG5cbiAgcmV0dXJuIHNlbGYudGFpbChjdXJzb3JEZXNjcmlwdGlvbiwgZnVuY3Rpb24gKGRvYykge1xuICAgIHZhciBpZCA9IGRvYy5faWQ7XG4gICAgZGVsZXRlIGRvYy5faWQ7XG4gICAgLy8gVGhlIHRzIGlzIGFuIGltcGxlbWVudGF0aW9uIGRldGFpbC4gSGlkZSBpdC5cbiAgICBkZWxldGUgZG9jLnRzO1xuICAgIGlmIChvcmRlcmVkKSB7XG4gICAgICBjYWxsYmFja3MuYWRkZWRCZWZvcmUoaWQsIGRvYywgbnVsbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGxiYWNrcy5hZGRlZChpZCwgZG9jKTtcbiAgICB9XG4gIH0pO1xufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5fY3JlYXRlQXN5bmNocm9ub3VzQ3Vyc29yID0gZnVuY3Rpb24oXG4gIGN1cnNvckRlc2NyaXB0aW9uLCBvcHRpb25zID0ge30pIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBjb25zdCB7IHNlbGZGb3JJdGVyYXRpb24sIHVzZVRyYW5zZm9ybSB9ID0gb3B0aW9ucztcbiAgb3B0aW9ucyA9IHsgc2VsZkZvckl0ZXJhdGlvbiwgdXNlVHJhbnNmb3JtIH07XG5cbiAgdmFyIGNvbGxlY3Rpb24gPSBzZWxmLnJhd0NvbGxlY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWUpO1xuICB2YXIgY3Vyc29yT3B0aW9ucyA9IGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnM7XG4gIHZhciBtb25nb09wdGlvbnMgPSB7XG4gICAgc29ydDogY3Vyc29yT3B0aW9ucy5zb3J0LFxuICAgIGxpbWl0OiBjdXJzb3JPcHRpb25zLmxpbWl0LFxuICAgIHNraXA6IGN1cnNvck9wdGlvbnMuc2tpcCxcbiAgICBwcm9qZWN0aW9uOiBjdXJzb3JPcHRpb25zLmZpZWxkcyB8fCBjdXJzb3JPcHRpb25zLnByb2plY3Rpb24sXG4gICAgcmVhZFByZWZlcmVuY2U6IGN1cnNvck9wdGlvbnMucmVhZFByZWZlcmVuY2UsXG4gIH07XG5cbiAgLy8gRG8gd2Ugd2FudCBhIHRhaWxhYmxlIGN1cnNvciAod2hpY2ggb25seSB3b3JrcyBvbiBjYXBwZWQgY29sbGVjdGlvbnMpP1xuICBpZiAoY3Vyc29yT3B0aW9ucy50YWlsYWJsZSkge1xuICAgIG1vbmdvT3B0aW9ucy5udW1iZXJPZlJldHJpZXMgPSAtMTtcbiAgfVxuXG4gIHZhciBkYkN1cnNvciA9IGNvbGxlY3Rpb24uZmluZChcbiAgICByZXBsYWNlVHlwZXMoY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSxcbiAgICBtb25nb09wdGlvbnMpO1xuXG4gIC8vIERvIHdlIHdhbnQgYSB0YWlsYWJsZSBjdXJzb3IgKHdoaWNoIG9ubHkgd29ya3Mgb24gY2FwcGVkIGNvbGxlY3Rpb25zKT9cbiAgaWYgKGN1cnNvck9wdGlvbnMudGFpbGFibGUpIHtcbiAgICAvLyBXZSB3YW50IGEgdGFpbGFibGUgY3Vyc29yLi4uXG4gICAgZGJDdXJzb3IuYWRkQ3Vyc29yRmxhZyhcInRhaWxhYmxlXCIsIHRydWUpXG4gICAgLy8gLi4uIGFuZCBmb3IgdGhlIHNlcnZlciB0byB3YWl0IGEgYml0IGlmIGFueSBnZXRNb3JlIGhhcyBubyBkYXRhIChyYXRoZXJcbiAgICAvLyB0aGFuIG1ha2luZyB1cyBwdXQgdGhlIHJlbGV2YW50IHNsZWVwcyBpbiB0aGUgY2xpZW50KS4uLlxuICAgIGRiQ3Vyc29yLmFkZEN1cnNvckZsYWcoXCJhd2FpdERhdGFcIiwgdHJ1ZSlcblxuICAgIC8vIEFuZCBpZiB0aGlzIGlzIG9uIHRoZSBvcGxvZyBjb2xsZWN0aW9uIGFuZCB0aGUgY3Vyc29yIHNwZWNpZmllcyBhICd0cycsXG4gICAgLy8gdGhlbiBzZXQgdGhlIHVuZG9jdW1lbnRlZCBvcGxvZyByZXBsYXkgZmxhZywgd2hpY2ggZG9lcyBhIHNwZWNpYWwgc2NhbiB0b1xuICAgIC8vIGZpbmQgdGhlIGZpcnN0IGRvY3VtZW50IChpbnN0ZWFkIG9mIGNyZWF0aW5nIGFuIGluZGV4IG9uIHRzKS4gVGhpcyBpcyBhXG4gICAgLy8gdmVyeSBoYXJkLWNvZGVkIE1vbmdvIGZsYWcgd2hpY2ggb25seSB3b3JrcyBvbiB0aGUgb3Bsb2cgY29sbGVjdGlvbiBhbmRcbiAgICAvLyBvbmx5IHdvcmtzIHdpdGggdGhlIHRzIGZpZWxkLlxuICAgIGlmIChjdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZSA9PT0gT1BMT0dfQ09MTEVDVElPTiAmJlxuICAgICAgY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IudHMpIHtcbiAgICAgIGRiQ3Vyc29yLmFkZEN1cnNvckZsYWcoXCJvcGxvZ1JlcGxheVwiLCB0cnVlKVxuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlb2YgY3Vyc29yT3B0aW9ucy5tYXhUaW1lTXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZGJDdXJzb3IgPSBkYkN1cnNvci5tYXhUaW1lTVMoY3Vyc29yT3B0aW9ucy5tYXhUaW1lTXMpO1xuICB9XG4gIGlmICh0eXBlb2YgY3Vyc29yT3B0aW9ucy5oaW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGRiQ3Vyc29yID0gZGJDdXJzb3IuaGludChjdXJzb3JPcHRpb25zLmhpbnQpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBBc3luY2hyb25vdXNDdXJzb3IoZGJDdXJzb3IsIGN1cnNvckRlc2NyaXB0aW9uLCBvcHRpb25zLCBjb2xsZWN0aW9uKTtcbn07XG5cbi8vIFRhaWxzIHRoZSBjdXJzb3IgZGVzY3JpYmVkIGJ5IGN1cnNvckRlc2NyaXB0aW9uLCBtb3N0IGxpa2VseSBvbiB0aGVcbi8vIG9wbG9nLiBDYWxscyBkb2NDYWxsYmFjayB3aXRoIGVhY2ggZG9jdW1lbnQgZm91bmQuIElnbm9yZXMgZXJyb3JzIGFuZCBqdXN0XG4vLyByZXN0YXJ0cyB0aGUgdGFpbCBvbiBlcnJvci5cbi8vXG4vLyBJZiB0aW1lb3V0TVMgaXMgc2V0LCB0aGVuIGlmIHdlIGRvbid0IGdldCBhIG5ldyBkb2N1bWVudCBldmVyeSB0aW1lb3V0TVMsXG4vLyBraWxsIGFuZCByZXN0YXJ0IHRoZSBjdXJzb3IuIFRoaXMgaXMgcHJpbWFyaWx5IGEgd29ya2Fyb3VuZCBmb3IgIzg1OTguXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLnRhaWwgPSBmdW5jdGlvbiAoY3Vyc29yRGVzY3JpcHRpb24sIGRvY0NhbGxiYWNrLCB0aW1lb3V0TVMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBpZiAoIWN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMudGFpbGFibGUpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG9ubHkgdGFpbCBhIHRhaWxhYmxlIGN1cnNvclwiKTtcblxuICB2YXIgY3Vyc29yID0gc2VsZi5fY3JlYXRlQXN5bmNocm9ub3VzQ3Vyc29yKGN1cnNvckRlc2NyaXB0aW9uKTtcblxuICB2YXIgc3RvcHBlZCA9IGZhbHNlO1xuICB2YXIgbGFzdFRTO1xuXG4gIE1ldGVvci5kZWZlcihhc3luYyBmdW5jdGlvbiBsb29wKCkge1xuICAgIHZhciBkb2MgPSBudWxsO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoc3RvcHBlZClcbiAgICAgICAgcmV0dXJuO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZG9jID0gYXdhaXQgY3Vyc29yLl9uZXh0T2JqZWN0UHJvbWlzZVdpdGhUaW1lb3V0KHRpbWVvdXRNUyk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gV2Ugc2hvdWxkIG5vdCBpZ25vcmUgZXJyb3JzIGhlcmUgdW5sZXNzIHdlIHdhbnQgdG8gc3BlbmQgYSBsb3Qgb2YgdGltZSBkZWJ1Z2dpbmdcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAvLyBUaGVyZSdzIG5vIGdvb2Qgd2F5IHRvIGZpZ3VyZSBvdXQgaWYgdGhpcyB3YXMgYWN0dWFsbHkgYW4gZXJyb3IgZnJvbVxuICAgICAgICAvLyBNb25nbywgb3IganVzdCBjbGllbnQtc2lkZSAoaW5jbHVkaW5nIG91ciBvd24gdGltZW91dCBlcnJvcikuIEFoXG4gICAgICAgIC8vIHdlbGwuIEJ1dCBlaXRoZXIgd2F5LCB3ZSBuZWVkIHRvIHJldHJ5IHRoZSBjdXJzb3IgKHVubGVzcyB0aGUgZmFpbHVyZVxuICAgICAgICAvLyB3YXMgYmVjYXVzZSB0aGUgb2JzZXJ2ZSBnb3Qgc3RvcHBlZCkuXG4gICAgICAgIGRvYyA9IG51bGw7XG4gICAgICB9XG4gICAgICAvLyBTaW5jZSB3ZSBhd2FpdGVkIGEgcHJvbWlzZSBhYm92ZSwgd2UgbmVlZCB0byBjaGVjayBhZ2FpbiB0byBzZWUgaWZcbiAgICAgIC8vIHdlJ3ZlIGJlZW4gc3RvcHBlZCBiZWZvcmUgY2FsbGluZyB0aGUgY2FsbGJhY2suXG4gICAgICBpZiAoc3RvcHBlZClcbiAgICAgICAgcmV0dXJuO1xuICAgICAgaWYgKGRvYykge1xuICAgICAgICAvLyBJZiBhIHRhaWxhYmxlIGN1cnNvciBjb250YWlucyBhIFwidHNcIiBmaWVsZCwgdXNlIGl0IHRvIHJlY3JlYXRlIHRoZVxuICAgICAgICAvLyBjdXJzb3Igb24gZXJyb3IuIChcInRzXCIgaXMgYSBzdGFuZGFyZCB0aGF0IE1vbmdvIHVzZXMgaW50ZXJuYWxseSBmb3JcbiAgICAgICAgLy8gdGhlIG9wbG9nLCBhbmQgdGhlcmUncyBhIHNwZWNpYWwgZmxhZyB0aGF0IGxldHMgeW91IGRvIGJpbmFyeSBzZWFyY2hcbiAgICAgICAgLy8gb24gaXQgaW5zdGVhZCBvZiBuZWVkaW5nIHRvIHVzZSBhbiBpbmRleC4pXG4gICAgICAgIGxhc3RUUyA9IGRvYy50cztcbiAgICAgICAgZG9jQ2FsbGJhY2soZG9jKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBuZXdTZWxlY3RvciA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGxhc3RUUykge1xuICAgICAgICAgIG5ld1NlbGVjdG9yLnRzID0geyRndDogbGFzdFRTfTtcbiAgICAgICAgfVxuICAgICAgICBjdXJzb3IgPSBzZWxmLl9jcmVhdGVBc3luY2hyb25vdXNDdXJzb3IobmV3IEN1cnNvckRlc2NyaXB0aW9uKFxuICAgICAgICAgIGN1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lLFxuICAgICAgICAgIG5ld1NlbGVjdG9yLFxuICAgICAgICAgIGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMpKTtcbiAgICAgICAgLy8gTW9uZ28gZmFpbG92ZXIgdGFrZXMgbWFueSBzZWNvbmRzLiAgUmV0cnkgaW4gYSBiaXQuICAoV2l0aG91dCB0aGlzXG4gICAgICAgIC8vIHNldFRpbWVvdXQsIHdlIHBlZyB0aGUgQ1BVIGF0IDEwMCUgYW5kIG5ldmVyIG5vdGljZSB0aGUgYWN0dWFsXG4gICAgICAgIC8vIGZhaWxvdmVyLlxuICAgICAgICBzZXRUaW1lb3V0KGxvb3AsIDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzdG9wcGVkID0gdHJ1ZTtcbiAgICAgIGN1cnNvci5jbG9zZSgpO1xuICAgIH1cbiAgfTtcbn07XG5cbk9iamVjdC5hc3NpZ24oTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZSwge1xuICBfb2JzZXJ2ZUNoYW5nZXM6IGFzeW5jIGZ1bmN0aW9uIChcbiAgICBjdXJzb3JEZXNjcmlwdGlvbiwgb3JkZXJlZCwgY2FsbGJhY2tzLCBub25NdXRhdGluZ0NhbGxiYWNrcykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBjb25zdCBjb2xsZWN0aW9uTmFtZSA9IGN1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lO1xuXG4gICAgaWYgKGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMudGFpbGFibGUpIHtcbiAgICAgIHJldHVybiBzZWxmLl9vYnNlcnZlQ2hhbmdlc1RhaWxhYmxlKGN1cnNvckRlc2NyaXB0aW9uLCBvcmRlcmVkLCBjYWxsYmFja3MpO1xuICAgIH1cblxuICAgIC8vIFlvdSBtYXkgbm90IGZpbHRlciBvdXQgX2lkIHdoZW4gb2JzZXJ2aW5nIGNoYW5nZXMsIGJlY2F1c2UgdGhlIGlkIGlzIGEgY29yZVxuICAgIC8vIHBhcnQgb2YgdGhlIG9ic2VydmVDaGFuZ2VzIEFQSS5cbiAgICBjb25zdCBmaWVsZHNPcHRpb25zID0gY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5wcm9qZWN0aW9uIHx8IGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuZmllbGRzO1xuICAgIGlmIChmaWVsZHNPcHRpb25zICYmXG4gICAgICAoZmllbGRzT3B0aW9ucy5faWQgPT09IDAgfHxcbiAgICAgICAgZmllbGRzT3B0aW9ucy5faWQgPT09IGZhbHNlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoXCJZb3UgbWF5IG5vdCBvYnNlcnZlIGEgY3Vyc29yIHdpdGgge2ZpZWxkczoge19pZDogMH19XCIpO1xuICAgIH1cblxuICAgIHZhciBvYnNlcnZlS2V5ID0gRUpTT04uc3RyaW5naWZ5KFxuICAgICAgT2JqZWN0LmFzc2lnbih7b3JkZXJlZDogb3JkZXJlZH0sIGN1cnNvckRlc2NyaXB0aW9uKSk7XG5cbiAgICB2YXIgbXVsdGlwbGV4ZXIsIG9ic2VydmVEcml2ZXI7XG4gICAgdmFyIGZpcnN0SGFuZGxlID0gZmFsc2U7XG5cbiAgICAvLyBGaW5kIGEgbWF0Y2hpbmcgT2JzZXJ2ZU11bHRpcGxleGVyLCBvciBjcmVhdGUgYSBuZXcgb25lLiBUaGlzIG5leHQgYmxvY2sgaXNcbiAgICAvLyBndWFyYW50ZWVkIHRvIG5vdCB5aWVsZCAoYW5kIGl0IGRvZXNuJ3QgY2FsbCBhbnl0aGluZyB0aGF0IGNhbiBvYnNlcnZlIGFcbiAgICAvLyBuZXcgcXVlcnkpLCBzbyBubyBvdGhlciBjYWxscyB0byB0aGlzIGZ1bmN0aW9uIGNhbiBpbnRlcmxlYXZlIHdpdGggaXQuXG4gICAgaWYgKG9ic2VydmVLZXkgaW4gc2VsZi5fb2JzZXJ2ZU11bHRpcGxleGVycykge1xuICAgICAgbXVsdGlwbGV4ZXIgPSBzZWxmLl9vYnNlcnZlTXVsdGlwbGV4ZXJzW29ic2VydmVLZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaXJzdEhhbmRsZSA9IHRydWU7XG4gICAgICAvLyBDcmVhdGUgYSBuZXcgT2JzZXJ2ZU11bHRpcGxleGVyLlxuICAgICAgbXVsdGlwbGV4ZXIgPSBuZXcgT2JzZXJ2ZU11bHRpcGxleGVyKHtcbiAgICAgICAgb3JkZXJlZDogb3JkZXJlZCxcbiAgICAgICAgb25TdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZGVsZXRlIHNlbGYuX29ic2VydmVNdWx0aXBsZXhlcnNbb2JzZXJ2ZUtleV07XG4gICAgICAgICAgcmV0dXJuIG9ic2VydmVEcml2ZXIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgb2JzZXJ2ZUhhbmRsZSA9IG5ldyBPYnNlcnZlSGFuZGxlKG11bHRpcGxleGVyLFxuICAgICAgY2FsbGJhY2tzLFxuICAgICAgbm9uTXV0YXRpbmdDYWxsYmFja3MsXG4gICAgKTtcblxuICAgIGNvbnN0IG9wbG9nT3B0aW9ucyA9IHNlbGY/Ll9vcGxvZ0hhbmRsZT8uX29wbG9nT3B0aW9ucyB8fCB7fTtcbiAgICBjb25zdCB7IGluY2x1ZGVDb2xsZWN0aW9ucywgZXhjbHVkZUNvbGxlY3Rpb25zIH0gPSBvcGxvZ09wdGlvbnM7XG4gICAgaWYgKGZpcnN0SGFuZGxlKSB7XG4gICAgICB2YXIgbWF0Y2hlciwgc29ydGVyO1xuICAgICAgdmFyIGNhblVzZU9wbG9nID0gW1xuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gQXQgYSBiYXJlIG1pbmltdW0sIHVzaW5nIHRoZSBvcGxvZyByZXF1aXJlcyB1cyB0byBoYXZlIGFuIG9wbG9nLCB0b1xuICAgICAgICAgIC8vIHdhbnQgdW5vcmRlcmVkIGNhbGxiYWNrcywgYW5kIHRvIG5vdCB3YW50IGEgY2FsbGJhY2sgb24gdGhlIHBvbGxzXG4gICAgICAgICAgLy8gdGhhdCB3b24ndCBoYXBwZW4uXG4gICAgICAgICAgcmV0dXJuIHNlbGYuX29wbG9nSGFuZGxlICYmICFvcmRlcmVkICYmXG4gICAgICAgICAgICAhY2FsbGJhY2tzLl90ZXN0T25seVBvbGxDYWxsYmFjaztcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIFdlIGFsc28gbmVlZCB0byBjaGVjaywgaWYgdGhlIGNvbGxlY3Rpb24gb2YgdGhpcyBDdXJzb3IgaXMgYWN0dWFsbHkgYmVpbmcgXCJ3YXRjaGVkXCIgYnkgdGhlIE9wbG9nIGhhbmRsZVxuICAgICAgICAgIC8vIGlmIG5vdCwgd2UgaGF2ZSB0byBmYWxsYmFjayB0byBsb25nIHBvbGxpbmdcbiAgICAgICAgICBpZiAoZXhjbHVkZUNvbGxlY3Rpb25zPy5sZW5ndGggJiYgZXhjbHVkZUNvbGxlY3Rpb25zLmluY2x1ZGVzKGNvbGxlY3Rpb25OYW1lKSkge1xuICAgICAgICAgICAgaWYgKCFvcGxvZ0NvbGxlY3Rpb25XYXJuaW5ncy5pbmNsdWRlcyhjb2xsZWN0aW9uTmFtZSkpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBNZXRlb3Iuc2V0dGluZ3MucGFja2FnZXMubW9uZ28ub3Bsb2dFeGNsdWRlQ29sbGVjdGlvbnMgaW5jbHVkZXMgdGhlIGNvbGxlY3Rpb24gJHtjb2xsZWN0aW9uTmFtZX0gLSB5b3VyIHN1YnNjcmlwdGlvbnMgd2lsbCBvbmx5IHVzZSBsb25nIHBvbGxpbmchYCk7XG4gICAgICAgICAgICAgIG9wbG9nQ29sbGVjdGlvbldhcm5pbmdzLnB1c2goY29sbGVjdGlvbk5hbWUpOyAvLyB3ZSBvbmx5IHdhbnQgdG8gc2hvdyB0aGUgd2FybmluZ3Mgb25jZSBwZXIgY29sbGVjdGlvbiFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGluY2x1ZGVDb2xsZWN0aW9ucz8ubGVuZ3RoICYmICFpbmNsdWRlQ29sbGVjdGlvbnMuaW5jbHVkZXMoY29sbGVjdGlvbk5hbWUpKSB7XG4gICAgICAgICAgICBpZiAoIW9wbG9nQ29sbGVjdGlvbldhcm5pbmdzLmluY2x1ZGVzKGNvbGxlY3Rpb25OYW1lKSkge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYE1ldGVvci5zZXR0aW5ncy5wYWNrYWdlcy5tb25nby5vcGxvZ0luY2x1ZGVDb2xsZWN0aW9ucyBkb2VzIG5vdCBpbmNsdWRlIHRoZSBjb2xsZWN0aW9uICR7Y29sbGVjdGlvbk5hbWV9IC0geW91ciBzdWJzY3JpcHRpb25zIHdpbGwgb25seSB1c2UgbG9uZyBwb2xsaW5nIWApO1xuICAgICAgICAgICAgICBvcGxvZ0NvbGxlY3Rpb25XYXJuaW5ncy5wdXNoKGNvbGxlY3Rpb25OYW1lKTsgLy8gd2Ugb25seSB3YW50IHRvIHNob3cgdGhlIHdhcm5pbmdzIG9uY2UgcGVyIGNvbGxlY3Rpb24hXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gV2UgbmVlZCB0byBiZSBhYmxlIHRvIGNvbXBpbGUgdGhlIHNlbGVjdG9yLiBGYWxsIGJhY2sgdG8gcG9sbGluZyBmb3JcbiAgICAgICAgICAvLyBzb21lIG5ld2ZhbmdsZWQgJHNlbGVjdG9yIHRoYXQgbWluaW1vbmdvIGRvZXNuJ3Qgc3VwcG9ydCB5ZXQuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG1hdGNoZXIgPSBuZXcgTWluaW1vbmdvLk1hdGNoZXIoY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gWFhYIG1ha2UgYWxsIGNvbXBpbGF0aW9uIGVycm9ycyBNaW5pbW9uZ29FcnJvciBvciBzb21ldGhpbmdcbiAgICAgICAgICAgIC8vICAgICBzbyB0aGF0IHRoaXMgZG9lc24ndCBpZ25vcmUgdW5yZWxhdGVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyAuLi4gYW5kIHRoZSBzZWxlY3RvciBpdHNlbGYgbmVlZHMgdG8gc3VwcG9ydCBvcGxvZy5cbiAgICAgICAgICByZXR1cm4gT3Bsb2dPYnNlcnZlRHJpdmVyLmN1cnNvclN1cHBvcnRlZChjdXJzb3JEZXNjcmlwdGlvbiwgbWF0Y2hlcik7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBBbmQgd2UgbmVlZCB0byBiZSBhYmxlIHRvIGNvbXBpbGUgdGhlIHNvcnQsIGlmIGFueS4gIGVnLCBjYW4ndCBiZVxuICAgICAgICAgIC8vIHskbmF0dXJhbDogMX0uXG4gICAgICAgICAgaWYgKCFjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnNvcnQpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgc29ydGVyID0gbmV3IE1pbmltb25nby5Tb3J0ZXIoY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5zb3J0KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIFhYWCBtYWtlIGFsbCBjb21waWxhdGlvbiBlcnJvcnMgTWluaW1vbmdvRXJyb3Igb3Igc29tZXRoaW5nXG4gICAgICAgICAgICAvLyAgICAgc28gdGhhdCB0aGlzIGRvZXNuJ3QgaWdub3JlIHVucmVsYXRlZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdLmV2ZXJ5KGYgPT4gZigpKTsgIC8vIGludm9rZSBlYWNoIGZ1bmN0aW9uIGFuZCBjaGVjayBpZiBhbGwgcmV0dXJuIHRydWVcblxuICAgICAgdmFyIGRyaXZlckNsYXNzID0gY2FuVXNlT3Bsb2cgPyBPcGxvZ09ic2VydmVEcml2ZXIgOiBQb2xsaW5nT2JzZXJ2ZURyaXZlcjtcbiAgICAgIG9ic2VydmVEcml2ZXIgPSBuZXcgZHJpdmVyQ2xhc3Moe1xuICAgICAgICBjdXJzb3JEZXNjcmlwdGlvbjogY3Vyc29yRGVzY3JpcHRpb24sXG4gICAgICAgIG1vbmdvSGFuZGxlOiBzZWxmLFxuICAgICAgICBtdWx0aXBsZXhlcjogbXVsdGlwbGV4ZXIsXG4gICAgICAgIG9yZGVyZWQ6IG9yZGVyZWQsXG4gICAgICAgIG1hdGNoZXI6IG1hdGNoZXIsICAvLyBpZ25vcmVkIGJ5IHBvbGxpbmdcbiAgICAgICAgc29ydGVyOiBzb3J0ZXIsICAvLyBpZ25vcmVkIGJ5IHBvbGxpbmdcbiAgICAgICAgX3Rlc3RPbmx5UG9sbENhbGxiYWNrOiBjYWxsYmFja3MuX3Rlc3RPbmx5UG9sbENhbGxiYWNrXG4gICAgICB9KTtcblxuICAgICAgaWYgKG9ic2VydmVEcml2ZXIuX2luaXQpIHtcbiAgICAgICAgYXdhaXQgb2JzZXJ2ZURyaXZlci5faW5pdCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIGZpZWxkIGlzIG9ubHkgc2V0IGZvciB1c2UgaW4gdGVzdHMuXG4gICAgICBtdWx0aXBsZXhlci5fb2JzZXJ2ZURyaXZlciA9IG9ic2VydmVEcml2ZXI7XG4gICAgfVxuICAgIHNlbGYuX29ic2VydmVNdWx0aXBsZXhlcnNbb2JzZXJ2ZUtleV0gPSBtdWx0aXBsZXhlcjtcbiAgICAvLyBCbG9ja3MgdW50aWwgdGhlIGluaXRpYWwgYWRkcyBoYXZlIGJlZW4gc2VudC5cbiAgICBhd2FpdCBtdWx0aXBsZXhlci5hZGRIYW5kbGVBbmRTZW5kSW5pdGlhbEFkZHMob2JzZXJ2ZUhhbmRsZSk7XG5cbiAgICByZXR1cm4gb2JzZXJ2ZUhhbmRsZTtcbiAgfSxcblxufSk7XG4iLCJpbXBvcnQgY2xvbmUgZnJvbSAnbG9kYXNoLmNsb25lJ1xuXG4vKiogQHR5cGUge2ltcG9ydCgnbW9uZ29kYicpfSAqL1xuZXhwb3J0IGNvbnN0IE1vbmdvREIgPSBPYmplY3QuYXNzaWduKE5wbU1vZHVsZU1vbmdvZGIsIHtcbiAgT2JqZWN0SUQ6IE5wbU1vZHVsZU1vbmdvZGIuT2JqZWN0SWQsXG59KTtcblxuLy8gVGhlIHdyaXRlIG1ldGhvZHMgYmxvY2sgdW50aWwgdGhlIGRhdGFiYXNlIGhhcyBjb25maXJtZWQgdGhlIHdyaXRlIChpdCBtYXlcbi8vIG5vdCBiZSByZXBsaWNhdGVkIG9yIHN0YWJsZSBvbiBkaXNrLCBidXQgb25lIHNlcnZlciBoYXMgY29uZmlybWVkIGl0KSBpZiBub1xuLy8gY2FsbGJhY2sgaXMgcHJvdmlkZWQuIElmIGEgY2FsbGJhY2sgaXMgcHJvdmlkZWQsIHRoZW4gdGhleSBjYWxsIHRoZSBjYWxsYmFja1xuLy8gd2hlbiB0aGUgd3JpdGUgaXMgY29uZmlybWVkLiBUaGV5IHJldHVybiBub3RoaW5nIG9uIHN1Y2Nlc3MsIGFuZCByYWlzZSBhblxuLy8gZXhjZXB0aW9uIG9uIGZhaWx1cmUuXG4vL1xuLy8gQWZ0ZXIgbWFraW5nIGEgd3JpdGUgKHdpdGggaW5zZXJ0LCB1cGRhdGUsIHJlbW92ZSksIG9ic2VydmVycyBhcmVcbi8vIG5vdGlmaWVkIGFzeW5jaHJvbm91c2x5LiBJZiB5b3Ugd2FudCB0byByZWNlaXZlIGEgY2FsbGJhY2sgb25jZSBhbGxcbi8vIG9mIHRoZSBvYnNlcnZlciBub3RpZmljYXRpb25zIGhhdmUgbGFuZGVkIGZvciB5b3VyIHdyaXRlLCBkbyB0aGVcbi8vIHdyaXRlcyBpbnNpZGUgYSB3cml0ZSBmZW5jZSAoc2V0IEREUFNlcnZlci5fQ3VycmVudFdyaXRlRmVuY2UgdG8gYSBuZXdcbi8vIF9Xcml0ZUZlbmNlLCBhbmQgdGhlbiBzZXQgYSBjYWxsYmFjayBvbiB0aGUgd3JpdGUgZmVuY2UuKVxuLy9cbi8vIFNpbmNlIG91ciBleGVjdXRpb24gZW52aXJvbm1lbnQgaXMgc2luZ2xlLXRocmVhZGVkLCB0aGlzIGlzXG4vLyB3ZWxsLWRlZmluZWQgLS0gYSB3cml0ZSBcImhhcyBiZWVuIG1hZGVcIiBpZiBpdCdzIHJldHVybmVkLCBhbmQgYW5cbi8vIG9ic2VydmVyIFwiaGFzIGJlZW4gbm90aWZpZWRcIiBpZiBpdHMgY2FsbGJhY2sgaGFzIHJldHVybmVkLlxuXG5leHBvcnQgY29uc3Qgd3JpdGVDYWxsYmFjayA9IGZ1bmN0aW9uICh3cml0ZSwgcmVmcmVzaCwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgIGlmICghIGVycikge1xuICAgICAgLy8gWFhYIFdlIGRvbid0IGhhdmUgdG8gcnVuIHRoaXMgb24gZXJyb3IsIHJpZ2h0P1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVmcmVzaCgpO1xuICAgICAgfSBjYXRjaCAocmVmcmVzaEVycikge1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICBjYWxsYmFjayhyZWZyZXNoRXJyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgcmVmcmVzaEVycjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKGVycikge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfTtcbn07XG5cblxuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybVJlc3VsdCA9IGZ1bmN0aW9uIChkcml2ZXJSZXN1bHQpIHtcbiAgdmFyIG1ldGVvclJlc3VsdCA9IHsgbnVtYmVyQWZmZWN0ZWQ6IDAgfTtcbiAgaWYgKGRyaXZlclJlc3VsdCkge1xuICAgIHZhciBtb25nb1Jlc3VsdCA9IGRyaXZlclJlc3VsdC5yZXN1bHQ7XG4gICAgLy8gT24gdXBkYXRlcyB3aXRoIHVwc2VydDp0cnVlLCB0aGUgaW5zZXJ0ZWQgdmFsdWVzIGNvbWUgYXMgYSBsaXN0IG9mXG4gICAgLy8gdXBzZXJ0ZWQgdmFsdWVzIC0tIGV2ZW4gd2l0aCBvcHRpb25zLm11bHRpLCB3aGVuIHRoZSB1cHNlcnQgZG9lcyBpbnNlcnQsXG4gICAgLy8gaXQgb25seSBpbnNlcnRzIG9uZSBlbGVtZW50LlxuICAgIGlmIChtb25nb1Jlc3VsdC51cHNlcnRlZENvdW50KSB7XG4gICAgICBtZXRlb3JSZXN1bHQubnVtYmVyQWZmZWN0ZWQgPSBtb25nb1Jlc3VsdC51cHNlcnRlZENvdW50O1xuXG4gICAgICBpZiAobW9uZ29SZXN1bHQudXBzZXJ0ZWRJZCkge1xuICAgICAgICBtZXRlb3JSZXN1bHQuaW5zZXJ0ZWRJZCA9IG1vbmdvUmVzdWx0LnVwc2VydGVkSWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG4gd2FzIHVzZWQgYmVmb3JlIE1vbmdvIDUuMCwgaW4gTW9uZ28gNS4wIHdlIGFyZSBub3QgcmVjZWl2aW5nIHRoaXMgblxuICAgICAgLy8gZmllbGQgYW5kIHNvIHdlIGFyZSB1c2luZyBtb2RpZmllZENvdW50IGluc3RlYWRcbiAgICAgIG1ldGVvclJlc3VsdC5udW1iZXJBZmZlY3RlZCA9IG1vbmdvUmVzdWx0Lm4gfHwgbW9uZ29SZXN1bHQubWF0Y2hlZENvdW50IHx8IG1vbmdvUmVzdWx0Lm1vZGlmaWVkQ291bnQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1ldGVvclJlc3VsdDtcbn07XG5cbmV4cG9ydCBjb25zdCByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbyA9IGZ1bmN0aW9uIChkb2N1bWVudCkge1xuICBpZiAoRUpTT04uaXNCaW5hcnkoZG9jdW1lbnQpKSB7XG4gICAgLy8gVGhpcyBkb2VzIG1vcmUgY29waWVzIHRoYW4gd2UnZCBsaWtlLCBidXQgaXMgbmVjZXNzYXJ5IGJlY2F1c2VcbiAgICAvLyBNb25nb0RCLkJTT04gb25seSBsb29rcyBsaWtlIGl0IHRha2VzIGEgVWludDhBcnJheSAoYW5kIGRvZXNuJ3QgYWN0dWFsbHlcbiAgICAvLyBzZXJpYWxpemUgaXQgY29ycmVjdGx5KS5cbiAgICByZXR1cm4gbmV3IE1vbmdvREIuQmluYXJ5KEJ1ZmZlci5mcm9tKGRvY3VtZW50KSk7XG4gIH1cbiAgaWYgKGRvY3VtZW50IGluc3RhbmNlb2YgTW9uZ29EQi5CaW5hcnkpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQ7XG4gIH1cbiAgaWYgKGRvY3VtZW50IGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SUQpIHtcbiAgICByZXR1cm4gbmV3IE1vbmdvREIuT2JqZWN0SWQoZG9jdW1lbnQudG9IZXhTdHJpbmcoKSk7XG4gIH1cbiAgaWYgKGRvY3VtZW50IGluc3RhbmNlb2YgTW9uZ29EQi5PYmplY3RJZCkge1xuICAgIHJldHVybiBuZXcgTW9uZ29EQi5PYmplY3RJZChkb2N1bWVudC50b0hleFN0cmluZygpKTtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nb0RCLlRpbWVzdGFtcCkge1xuICAgIC8vIEZvciBub3csIHRoZSBNZXRlb3IgcmVwcmVzZW50YXRpb24gb2YgYSBNb25nbyB0aW1lc3RhbXAgdHlwZSAobm90IGEgZGF0ZSFcbiAgICAvLyB0aGlzIGlzIGEgd2VpcmQgaW50ZXJuYWwgdGhpbmcgdXNlZCBpbiB0aGUgb3Bsb2chKSBpcyB0aGUgc2FtZSBhcyB0aGVcbiAgICAvLyBNb25nbyByZXByZXNlbnRhdGlvbi4gV2UgbmVlZCB0byBkbyB0aGlzIGV4cGxpY2l0bHkgb3IgZWxzZSB3ZSB3b3VsZCBkbyBhXG4gICAgLy8gc3RydWN0dXJhbCBjbG9uZSBhbmQgbG9zZSB0aGUgcHJvdG90eXBlLlxuICAgIHJldHVybiBkb2N1bWVudDtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBEZWNpbWFsKSB7XG4gICAgcmV0dXJuIE1vbmdvREIuRGVjaW1hbDEyOC5mcm9tU3RyaW5nKGRvY3VtZW50LnRvU3RyaW5nKCkpO1xuICB9XG4gIGlmIChFSlNPTi5faXNDdXN0b21UeXBlKGRvY3VtZW50KSkge1xuICAgIHJldHVybiByZXBsYWNlTmFtZXMobWFrZU1vbmdvTGVnYWwsIEVKU09OLnRvSlNPTlZhbHVlKGRvY3VtZW50KSk7XG4gIH1cbiAgLy8gSXQgaXMgbm90IG9yZGluYXJpbHkgcG9zc2libGUgdG8gc3RpY2sgZG9sbGFyLXNpZ24ga2V5cyBpbnRvIG1vbmdvXG4gIC8vIHNvIHdlIGRvbid0IGJvdGhlciBjaGVja2luZyBmb3IgdGhpbmdzIHRoYXQgbmVlZCBlc2NhcGluZyBhdCB0aGlzIHRpbWUuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgcmVwbGFjZVR5cGVzID0gZnVuY3Rpb24gKGRvY3VtZW50LCBhdG9tVHJhbnNmb3JtZXIpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ29iamVjdCcgfHwgZG9jdW1lbnQgPT09IG51bGwpXG4gICAgcmV0dXJuIGRvY3VtZW50O1xuXG4gIHZhciByZXBsYWNlZFRvcExldmVsQXRvbSA9IGF0b21UcmFuc2Zvcm1lcihkb2N1bWVudCk7XG4gIGlmIChyZXBsYWNlZFRvcExldmVsQXRvbSAhPT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiByZXBsYWNlZFRvcExldmVsQXRvbTtcblxuICB2YXIgcmV0ID0gZG9jdW1lbnQ7XG4gIE9iamVjdC5lbnRyaWVzKGRvY3VtZW50KS5mb3JFYWNoKGZ1bmN0aW9uIChba2V5LCB2YWxdKSB7XG4gICAgdmFyIHZhbFJlcGxhY2VkID0gcmVwbGFjZVR5cGVzKHZhbCwgYXRvbVRyYW5zZm9ybWVyKTtcbiAgICBpZiAodmFsICE9PSB2YWxSZXBsYWNlZCkge1xuICAgICAgLy8gTGF6eSBjbG9uZS4gU2hhbGxvdyBjb3B5LlxuICAgICAgaWYgKHJldCA9PT0gZG9jdW1lbnQpXG4gICAgICAgIHJldCA9IGNsb25lKGRvY3VtZW50KTtcbiAgICAgIHJldFtrZXldID0gdmFsUmVwbGFjZWQ7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCBjb25zdCByZXBsYWNlTW9uZ29BdG9tV2l0aE1ldGVvciA9IGZ1bmN0aW9uIChkb2N1bWVudCkge1xuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nb0RCLkJpbmFyeSkge1xuICAgIC8vIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICAgIGlmIChkb2N1bWVudC5zdWJfdHlwZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIGRvY3VtZW50O1xuICAgIH1cbiAgICB2YXIgYnVmZmVyID0gZG9jdW1lbnQudmFsdWUodHJ1ZSk7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gIH1cbiAgaWYgKGRvY3VtZW50IGluc3RhbmNlb2YgTW9uZ29EQi5PYmplY3RJZCkge1xuICAgIHJldHVybiBuZXcgTW9uZ28uT2JqZWN0SUQoZG9jdW1lbnQudG9IZXhTdHJpbmcoKSk7XG4gIH1cbiAgaWYgKGRvY3VtZW50IGluc3RhbmNlb2YgTW9uZ29EQi5EZWNpbWFsMTI4KSB7XG4gICAgcmV0dXJuIERlY2ltYWwoZG9jdW1lbnQudG9TdHJpbmcoKSk7XG4gIH1cbiAgaWYgKGRvY3VtZW50W1wiRUpTT04kdHlwZVwiXSAmJiBkb2N1bWVudFtcIkVKU09OJHZhbHVlXCJdICYmIE9iamVjdC5rZXlzKGRvY3VtZW50KS5sZW5ndGggPT09IDIpIHtcbiAgICByZXR1cm4gRUpTT04uZnJvbUpTT05WYWx1ZShyZXBsYWNlTmFtZXModW5tYWtlTW9uZ29MZWdhbCwgZG9jdW1lbnQpKTtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nb0RCLlRpbWVzdGFtcCkge1xuICAgIC8vIEZvciBub3csIHRoZSBNZXRlb3IgcmVwcmVzZW50YXRpb24gb2YgYSBNb25nbyB0aW1lc3RhbXAgdHlwZSAobm90IGEgZGF0ZSFcbiAgICAvLyB0aGlzIGlzIGEgd2VpcmQgaW50ZXJuYWwgdGhpbmcgdXNlZCBpbiB0aGUgb3Bsb2chKSBpcyB0aGUgc2FtZSBhcyB0aGVcbiAgICAvLyBNb25nbyByZXByZXNlbnRhdGlvbi4gV2UgbmVlZCB0byBkbyB0aGlzIGV4cGxpY2l0bHkgb3IgZWxzZSB3ZSB3b3VsZCBkbyBhXG4gICAgLy8gc3RydWN0dXJhbCBjbG9uZSBhbmQgbG9zZSB0aGUgcHJvdG90eXBlLlxuICAgIHJldHVybiBkb2N1bWVudDtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuY29uc3QgbWFrZU1vbmdvTGVnYWwgPSBuYW1lID0+IFwiRUpTT05cIiArIG5hbWU7XG5jb25zdCB1bm1ha2VNb25nb0xlZ2FsID0gbmFtZSA9PiBuYW1lLnN1YnN0cig1KTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VOYW1lcyhmaWx0ZXIsIHRoaW5nKSB7XG4gIGlmICh0eXBlb2YgdGhpbmcgPT09IFwib2JqZWN0XCIgJiYgdGhpbmcgIT09IG51bGwpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGluZykpIHtcbiAgICAgIHJldHVybiB0aGluZy5tYXAocmVwbGFjZU5hbWVzLmJpbmQobnVsbCwgZmlsdGVyKSk7XG4gICAgfVxuICAgIHZhciByZXQgPSB7fTtcbiAgICBPYmplY3QuZW50cmllcyh0aGluZykuZm9yRWFjaChmdW5jdGlvbiAoW2tleSwgdmFsdWVdKSB7XG4gICAgICByZXRbZmlsdGVyKGtleSldID0gcmVwbGFjZU5hbWVzKGZpbHRlciwgdmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgcmV0dXJuIHRoaW5nO1xufVxuIiwiaW1wb3J0IExvY2FsQ29sbGVjdGlvbiBmcm9tICdtZXRlb3IvbWluaW1vbmdvL2xvY2FsX2NvbGxlY3Rpb24nO1xuaW1wb3J0IHsgcmVwbGFjZU1vbmdvQXRvbVdpdGhNZXRlb3IsIHJlcGxhY2VUeXBlcyB9IGZyb20gJy4vbW9uZ29fY29tbW9uJztcblxuLyoqXG4gKiBUaGlzIGlzIGp1c3QgYSBsaWdodCB3cmFwcGVyIGZvciB0aGUgY3Vyc29yLiBUaGUgZ29hbCBoZXJlIGlzIHRvIGVuc3VyZSBjb21wYXRpYmlsaXR5IGV2ZW4gaWZcbiAqIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2VzIG9uIHRoZSBNb25nb0RCIGRyaXZlci5cbiAqXG4gKiBUaGlzIGlzIGFuIGludGVybmFsIGltcGxlbWVudGF0aW9uIGRldGFpbCBhbmQgaXMgY3JlYXRlZCBsYXppbHkgYnkgdGhlIG1haW4gQ3Vyc29yIGNsYXNzLlxuICovXG5leHBvcnQgY2xhc3MgQXN5bmNocm9ub3VzQ3Vyc29yIHtcbiAgY29uc3RydWN0b3IoZGJDdXJzb3IsIGN1cnNvckRlc2NyaXB0aW9uLCBvcHRpb25zKSB7XG4gICAgdGhpcy5fZGJDdXJzb3IgPSBkYkN1cnNvcjtcbiAgICB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbiA9IGN1cnNvckRlc2NyaXB0aW9uO1xuXG4gICAgdGhpcy5fc2VsZkZvckl0ZXJhdGlvbiA9IG9wdGlvbnMuc2VsZkZvckl0ZXJhdGlvbiB8fCB0aGlzO1xuICAgIGlmIChvcHRpb25zLnVzZVRyYW5zZm9ybSAmJiBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnRyYW5zZm9ybSkge1xuICAgICAgdGhpcy5fdHJhbnNmb3JtID0gTG9jYWxDb2xsZWN0aW9uLndyYXBUcmFuc2Zvcm0oXG4gICAgICAgIGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMudHJhbnNmb3JtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdHJhbnNmb3JtID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl92aXNpdGVkSWRzID0gbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXA7XG4gIH1cblxuICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgIHZhciBjdXJzb3IgPSB0aGlzO1xuICAgIHJldHVybiB7XG4gICAgICBhc3luYyBuZXh0KCkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IGN1cnNvci5fbmV4dE9iamVjdFByb21pc2UoKTtcbiAgICAgICAgcmV0dXJuIHsgZG9uZTogIXZhbHVlLCB2YWx1ZSB9O1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLy8gUmV0dXJucyBhIFByb21pc2UgZm9yIHRoZSBuZXh0IG9iamVjdCBmcm9tIHRoZSB1bmRlcmx5aW5nIGN1cnNvciAoYmVmb3JlXG4gIC8vIHRoZSBNb25nby0+TWV0ZW9yIHR5cGUgcmVwbGFjZW1lbnQpLlxuICBhc3luYyBfcmF3TmV4dE9iamVjdFByb21pc2UoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLl9kYkN1cnNvci5uZXh0KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgUHJvbWlzZSBmb3IgdGhlIG5leHQgb2JqZWN0IGZyb20gdGhlIGN1cnNvciwgc2tpcHBpbmcgdGhvc2Ugd2hvc2VcbiAgLy8gSURzIHdlJ3ZlIGFscmVhZHkgc2VlbiBhbmQgcmVwbGFjaW5nIE1vbmdvIGF0b21zIHdpdGggTWV0ZW9yIGF0b21zLlxuICBhc3luYyBfbmV4dE9iamVjdFByb21pc2UgKCkge1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICB2YXIgZG9jID0gYXdhaXQgdGhpcy5fcmF3TmV4dE9iamVjdFByb21pc2UoKTtcblxuICAgICAgaWYgKCFkb2MpIHJldHVybiBudWxsO1xuICAgICAgZG9jID0gcmVwbGFjZVR5cGVzKGRvYywgcmVwbGFjZU1vbmdvQXRvbVdpdGhNZXRlb3IpO1xuXG4gICAgICBpZiAoIXRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMudGFpbGFibGUgJiYgJ19pZCcgaW4gZG9jKSB7XG4gICAgICAgIC8vIERpZCBNb25nbyBnaXZlIHVzIGR1cGxpY2F0ZSBkb2N1bWVudHMgaW4gdGhlIHNhbWUgY3Vyc29yPyBJZiBzbyxcbiAgICAgICAgLy8gaWdub3JlIHRoaXMgb25lLiAoRG8gdGhpcyBiZWZvcmUgdGhlIHRyYW5zZm9ybSwgc2luY2UgdHJhbnNmb3JtIG1pZ2h0XG4gICAgICAgIC8vIHJldHVybiBzb21lIHVucmVsYXRlZCB2YWx1ZS4pIFdlIGRvbid0IGRvIHRoaXMgZm9yIHRhaWxhYmxlIGN1cnNvcnMsXG4gICAgICAgIC8vIGJlY2F1c2Ugd2Ugd2FudCB0byBtYWludGFpbiBPKDEpIG1lbW9yeSB1c2FnZS4gQW5kIGlmIHRoZXJlIGlzbid0IF9pZFxuICAgICAgICAvLyBmb3Igc29tZSByZWFzb24gKG1heWJlIGl0J3MgdGhlIG9wbG9nKSwgdGhlbiB3ZSBkb24ndCBkbyB0aGlzIGVpdGhlci5cbiAgICAgICAgLy8gKEJlIGNhcmVmdWwgdG8gZG8gdGhpcyBmb3IgZmFsc2V5IGJ1dCBleGlzdGluZyBfaWQsIHRob3VnaC4pXG4gICAgICAgIGlmICh0aGlzLl92aXNpdGVkSWRzLmhhcyhkb2MuX2lkKSkgY29udGludWU7XG4gICAgICAgIHRoaXMuX3Zpc2l0ZWRJZHMuc2V0KGRvYy5faWQsIHRydWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fdHJhbnNmb3JtKVxuICAgICAgICBkb2MgPSB0aGlzLl90cmFuc2Zvcm0oZG9jKTtcblxuICAgICAgcmV0dXJuIGRvYztcbiAgICB9XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgcHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCB3aXRoIHRoZSBuZXh0IG9iamVjdCAobGlrZSB3aXRoXG4gIC8vIF9uZXh0T2JqZWN0UHJvbWlzZSkgb3IgcmVqZWN0ZWQgaWYgdGhlIGN1cnNvciBkb2Vzbid0IHJldHVybiB3aXRoaW5cbiAgLy8gdGltZW91dE1TIG1zLlxuICBfbmV4dE9iamVjdFByb21pc2VXaXRoVGltZW91dCh0aW1lb3V0TVMpIHtcbiAgICBpZiAoIXRpbWVvdXRNUykge1xuICAgICAgcmV0dXJuIHRoaXMuX25leHRPYmplY3RQcm9taXNlKCk7XG4gICAgfVxuICAgIGNvbnN0IG5leHRPYmplY3RQcm9taXNlID0gdGhpcy5fbmV4dE9iamVjdFByb21pc2UoKTtcbiAgICBjb25zdCB0aW1lb3V0RXJyID0gbmV3IEVycm9yKCdDbGllbnQtc2lkZSB0aW1lb3V0IHdhaXRpbmcgZm9yIG5leHQgb2JqZWN0Jyk7XG4gICAgY29uc3QgdGltZW91dFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KHRpbWVvdXRFcnIpO1xuICAgICAgfSwgdGltZW91dE1TKTtcbiAgICB9KTtcbiAgICByZXR1cm4gUHJvbWlzZS5yYWNlKFtuZXh0T2JqZWN0UHJvbWlzZSwgdGltZW91dFByb21pc2VdKVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgaWYgKGVyciA9PT0gdGltZW91dEVycikge1xuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfSk7XG4gIH1cblxuICBhc3luYyBmb3JFYWNoKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgLy8gR2V0IGJhY2sgdG8gdGhlIGJlZ2lubmluZy5cbiAgICB0aGlzLl9yZXdpbmQoKTtcblxuICAgIGxldCBpZHggPSAwO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb25zdCBkb2MgPSBhd2FpdCB0aGlzLl9uZXh0T2JqZWN0UHJvbWlzZSgpO1xuICAgICAgaWYgKCFkb2MpIHJldHVybjtcbiAgICAgIGF3YWl0IGNhbGxiYWNrLmNhbGwodGhpc0FyZywgZG9jLCBpZHgrKywgdGhpcy5fc2VsZkZvckl0ZXJhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbWFwKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgIGF3YWl0IHRoaXMuZm9yRWFjaChhc3luYyAoZG9jLCBpbmRleCkgPT4ge1xuICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IGNhbGxiYWNrLmNhbGwodGhpc0FyZywgZG9jLCBpbmRleCwgdGhpcy5fc2VsZkZvckl0ZXJhdGlvbikpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICBfcmV3aW5kKCkge1xuICAgIC8vIGtub3duIHRvIGJlIHN5bmNocm9ub3VzXG4gICAgdGhpcy5fZGJDdXJzb3IucmV3aW5kKCk7XG5cbiAgICB0aGlzLl92aXNpdGVkSWRzID0gbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXA7XG4gIH1cblxuICAvLyBNb3N0bHkgdXNhYmxlIGZvciB0YWlsYWJsZSBjdXJzb3JzLlxuICBjbG9zZSgpIHtcbiAgICB0aGlzLl9kYkN1cnNvci5jbG9zZSgpO1xuICB9XG5cbiAgZmV0Y2goKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGRvYyA9PiBkb2MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZJWE1FOiAobm9kZTozNDY4MCkgW01PTkdPREIgRFJJVkVSXSBXYXJuaW5nOiBjdXJzb3IuY291bnQgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZVxuICAgKiAgcmVtb3ZlZCBpbiB0aGUgbmV4dCBtYWpvciB2ZXJzaW9uLCBwbGVhc2UgdXNlIGBjb2xsZWN0aW9uLmVzdGltYXRlZERvY3VtZW50Q291bnRgIG9yXG4gICAqICBgY29sbGVjdGlvbi5jb3VudERvY3VtZW50c2AgaW5zdGVhZC5cbiAgICovXG4gIGNvdW50KCkge1xuICAgIHJldHVybiB0aGlzLl9kYkN1cnNvci5jb3VudCgpO1xuICB9XG5cbiAgLy8gVGhpcyBtZXRob2QgaXMgTk9UIHdyYXBwZWQgaW4gQ3Vyc29yLlxuICBhc3luYyBnZXRSYXdPYmplY3RzKG9yZGVyZWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKG9yZGVyZWQpIHtcbiAgICAgIHJldHVybiBzZWxmLmZldGNoKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXN1bHRzID0gbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXA7XG4gICAgICBhd2FpdCBzZWxmLmZvckVhY2goZnVuY3Rpb24gKGRvYykge1xuICAgICAgICByZXN1bHRzLnNldChkb2MuX2lkLCBkb2MpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gIH1cbn0iLCJpbXBvcnQgeyBBU1lOQ19DVVJTT1JfTUVUSE9EUywgZ2V0QXN5bmNNZXRob2ROYW1lIH0gZnJvbSAnbWV0ZW9yL21pbmltb25nby9jb25zdGFudHMnO1xuaW1wb3J0IHsgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28sIHJlcGxhY2VUeXBlcyB9IGZyb20gJy4vbW9uZ29fY29tbW9uJztcbmltcG9ydCBMb2NhbENvbGxlY3Rpb24gZnJvbSAnbWV0ZW9yL21pbmltb25nby9sb2NhbF9jb2xsZWN0aW9uJztcbmltcG9ydCB7IEN1cnNvckRlc2NyaXB0aW9uIH0gZnJvbSAnLi9jdXJzb3JfZGVzY3JpcHRpb24nO1xuaW1wb3J0IHsgT2JzZXJ2ZUNhbGxiYWNrcywgT2JzZXJ2ZUNoYW5nZXNDYWxsYmFja3MgfSBmcm9tICcuL3R5cGVzJztcblxuaW50ZXJmYWNlIE1vbmdvSW50ZXJmYWNlIHtcbiAgcmF3Q29sbGVjdGlvbjogKGNvbGxlY3Rpb25OYW1lOiBzdHJpbmcpID0+IGFueTtcbiAgX2NyZWF0ZUFzeW5jaHJvbm91c0N1cnNvcjogKGN1cnNvckRlc2NyaXB0aW9uOiBDdXJzb3JEZXNjcmlwdGlvbiwgb3B0aW9uczogQ3Vyc29yT3B0aW9ucykgPT4gYW55O1xuICBfb2JzZXJ2ZUNoYW5nZXM6IChjdXJzb3JEZXNjcmlwdGlvbjogQ3Vyc29yRGVzY3JpcHRpb24sIG9yZGVyZWQ6IGJvb2xlYW4sIGNhbGxiYWNrczogYW55LCBub25NdXRhdGluZ0NhbGxiYWNrcz86IGJvb2xlYW4pID0+IGFueTtcbn1cblxuaW50ZXJmYWNlIEN1cnNvck9wdGlvbnMge1xuICBzZWxmRm9ySXRlcmF0aW9uOiBDdXJzb3I8YW55PjtcbiAgdXNlVHJhbnNmb3JtOiBib29sZWFuO1xufVxuXG4vKipcbiAqIEBjbGFzcyBDdXJzb3JcbiAqXG4gKiBUaGUgbWFpbiBjdXJzb3Igb2JqZWN0IHJldHVybmVkIGZyb20gZmluZCgpLCBpbXBsZW1lbnRpbmcgdGhlIGRvY3VtZW50ZWRcbiAqIE1vbmdvLkNvbGxlY3Rpb24gY3Vyc29yIEFQSS5cbiAqXG4gKiBXcmFwcyBhIEN1cnNvckRlc2NyaXB0aW9uIGFuZCBsYXppbHkgY3JlYXRlcyBhbiBBc3luY2hyb25vdXNDdXJzb3JcbiAqIChvbmx5IGNvbnRhY3RzIE1vbmdvREIgd2hlbiBtZXRob2RzIGxpa2UgZmV0Y2ggb3IgZm9yRWFjaCBhcmUgY2FsbGVkKS5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1cnNvcjxULCBVID0gVD4ge1xuICBwdWJsaWMgX21vbmdvOiBNb25nb0ludGVyZmFjZTtcbiAgcHVibGljIF9jdXJzb3JEZXNjcmlwdGlvbjogQ3Vyc29yRGVzY3JpcHRpb247XG4gIHB1YmxpYyBfc3luY2hyb25vdXNDdXJzb3I6IGFueSB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IobW9uZ286IE1vbmdvSW50ZXJmYWNlLCBjdXJzb3JEZXNjcmlwdGlvbjogQ3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgICB0aGlzLl9tb25nbyA9IG1vbmdvO1xuICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uID0gY3Vyc29yRGVzY3JpcHRpb247XG4gICAgdGhpcy5fc3luY2hyb25vdXNDdXJzb3IgPSBudWxsO1xuICB9XG5cbiAgYXN5bmMgY291bnRBc3luYygpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLl9tb25nby5yYXdDb2xsZWN0aW9uKHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lKTtcbiAgICByZXR1cm4gYXdhaXQgY29sbGVjdGlvbi5jb3VudERvY3VtZW50cyhcbiAgICAgIHJlcGxhY2VUeXBlcyh0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3RvciwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28pLFxuICAgICAgcmVwbGFjZVR5cGVzKHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSxcbiAgICApO1xuICB9XG5cbiAgY291bnQoKTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiY291bnQoKSBpcyBub3QgYXZhaWxhYmxlIG9uIHRoZSBzZXJ2ZXIuIFBsZWFzZSB1c2UgY291bnRBc3luYygpIGluc3RlYWQuXCJcbiAgICApO1xuICB9XG5cbiAgZ2V0VHJhbnNmb3JtKCk6ICgoZG9jOiBhbnkpID0+IGFueSkgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnRyYW5zZm9ybTtcbiAgfVxuXG4gIF9wdWJsaXNoQ3Vyc29yKHN1YjogYW55KTogYW55IHtcbiAgICBjb25zdCBjb2xsZWN0aW9uID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWU7XG4gICAgcmV0dXJuIE1vbmdvLkNvbGxlY3Rpb24uX3B1Ymxpc2hDdXJzb3IodGhpcywgc3ViLCBjb2xsZWN0aW9uKTtcbiAgfVxuXG4gIF9nZXRDb2xsZWN0aW9uTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZTtcbiAgfVxuXG4gIG9ic2VydmUoY2FsbGJhY2tzOiBPYnNlcnZlQ2FsbGJhY2tzPFU+KTogYW55IHtcbiAgICByZXR1cm4gTG9jYWxDb2xsZWN0aW9uLl9vYnNlcnZlRnJvbU9ic2VydmVDaGFuZ2VzKHRoaXMsIGNhbGxiYWNrcyk7XG4gIH1cblxuICBhc3luYyBvYnNlcnZlQXN5bmMoY2FsbGJhY2tzOiBPYnNlcnZlQ2FsbGJhY2tzPFU+KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKHRoaXMub2JzZXJ2ZShjYWxsYmFja3MpKSk7XG4gIH1cblxuICBvYnNlcnZlQ2hhbmdlcyhjYWxsYmFja3M6IE9ic2VydmVDaGFuZ2VzQ2FsbGJhY2tzPFU+LCBvcHRpb25zOiB7IG5vbk11dGF0aW5nQ2FsbGJhY2tzPzogYm9vbGVhbiB9ID0ge30pOiBhbnkge1xuICAgIGNvbnN0IG9yZGVyZWQgPSBMb2NhbENvbGxlY3Rpb24uX29ic2VydmVDaGFuZ2VzQ2FsbGJhY2tzQXJlT3JkZXJlZChjYWxsYmFja3MpO1xuICAgIHJldHVybiB0aGlzLl9tb25nby5fb2JzZXJ2ZUNoYW5nZXMoXG4gICAgICB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbixcbiAgICAgIG9yZGVyZWQsXG4gICAgICBjYWxsYmFja3MsXG4gICAgICBvcHRpb25zLm5vbk11dGF0aW5nQ2FsbGJhY2tzXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIG9ic2VydmVDaGFuZ2VzQXN5bmMoY2FsbGJhY2tzOiBPYnNlcnZlQ2hhbmdlc0NhbGxiYWNrczxVPiwgb3B0aW9uczogeyBub25NdXRhdGluZ0NhbGxiYWNrcz86IGJvb2xlYW4gfSA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5vYnNlcnZlQ2hhbmdlcyhjYWxsYmFja3MsIG9wdGlvbnMpO1xuICB9XG59XG5cbi8vIEFkZCBjdXJzb3IgbWV0aG9kcyBkeW5hbWljYWxseVxuWy4uLkFTWU5DX0NVUlNPUl9NRVRIT0RTLCBTeW1ib2wuaXRlcmF0b3IsIFN5bWJvbC5hc3luY0l0ZXJhdG9yXS5mb3JFYWNoKG1ldGhvZE5hbWUgPT4ge1xuICBpZiAobWV0aG9kTmFtZSA9PT0gJ2NvdW50JykgcmV0dXJuO1xuXG4gIChDdXJzb3IucHJvdG90eXBlIGFzIGFueSlbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbih0aGlzOiBDdXJzb3I8YW55PiwgLi4uYXJnczogYW55W10pOiBhbnkge1xuICAgIGNvbnN0IGN1cnNvciA9IHNldHVwQXN5bmNocm9ub3VzQ3Vyc29yKHRoaXMsIG1ldGhvZE5hbWUpO1xuICAgIHJldHVybiBjdXJzb3JbbWV0aG9kTmFtZV0oLi4uYXJncyk7XG4gIH07XG5cbiAgaWYgKG1ldGhvZE5hbWUgPT09IFN5bWJvbC5pdGVyYXRvciB8fCBtZXRob2ROYW1lID09PSBTeW1ib2wuYXN5bmNJdGVyYXRvcikgcmV0dXJuO1xuXG4gIGNvbnN0IG1ldGhvZE5hbWVBc3luYyA9IGdldEFzeW5jTWV0aG9kTmFtZShtZXRob2ROYW1lKTtcblxuICAoQ3Vyc29yLnByb3RvdHlwZSBhcyBhbnkpW21ldGhvZE5hbWVBc3luY10gPSBmdW5jdGlvbih0aGlzOiBDdXJzb3I8YW55PiwgLi4uYXJnczogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzW21ldGhvZE5hbWVdKC4uLmFyZ3MpO1xuICB9O1xufSk7XG5cbmZ1bmN0aW9uIHNldHVwQXN5bmNocm9ub3VzQ3Vyc29yKGN1cnNvcjogQ3Vyc29yPGFueT4sIG1ldGhvZDogc3RyaW5nIHwgc3ltYm9sKTogYW55IHtcbiAgaWYgKGN1cnNvci5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy50YWlsYWJsZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGNhbGwgJHtTdHJpbmcobWV0aG9kKX0gb24gYSB0YWlsYWJsZSBjdXJzb3JgKTtcbiAgfVxuXG4gIGlmICghY3Vyc29yLl9zeW5jaHJvbm91c0N1cnNvcikge1xuICAgIGN1cnNvci5fc3luY2hyb25vdXNDdXJzb3IgPSBjdXJzb3IuX21vbmdvLl9jcmVhdGVBc3luY2hyb25vdXNDdXJzb3IoXG4gICAgICBjdXJzb3IuX2N1cnNvckRlc2NyaXB0aW9uLFxuICAgICAge1xuICAgICAgICBzZWxmRm9ySXRlcmF0aW9uOiBjdXJzb3IsXG4gICAgICAgIHVzZVRyYW5zZm9ybTogdHJ1ZSxcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGN1cnNvci5fc3luY2hyb25vdXNDdXJzb3I7XG59IiwiLy8gc2luZ2xldG9uXG5leHBvcnQgY29uc3QgTG9jYWxDb2xsZWN0aW9uRHJpdmVyID0gbmV3IChjbGFzcyBMb2NhbENvbGxlY3Rpb25Ecml2ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm5vQ29ubkNvbGxlY3Rpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgfVxuXG4gIG9wZW4obmFtZSwgY29ubikge1xuICAgIGlmICghIG5hbWUpIHtcbiAgICAgIHJldHVybiBuZXcgTG9jYWxDb2xsZWN0aW9uO1xuICAgIH1cblxuICAgIGlmICghIGNvbm4pIHtcbiAgICAgIHJldHVybiBlbnN1cmVDb2xsZWN0aW9uKG5hbWUsIHRoaXMubm9Db25uQ29sbGVjdGlvbnMpO1xuICAgIH1cblxuICAgIGlmICghIGNvbm4uX21vbmdvX2xpdmVkYXRhX2NvbGxlY3Rpb25zKSB7XG4gICAgICBjb25uLl9tb25nb19saXZlZGF0YV9jb2xsZWN0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgfVxuXG4gICAgLy8gWFhYIGlzIHRoZXJlIGEgd2F5IHRvIGtlZXAgdHJhY2sgb2YgYSBjb25uZWN0aW9uJ3MgY29sbGVjdGlvbnMgd2l0aG91dFxuICAgIC8vIGRhbmdsaW5nIGl0IG9mZiB0aGUgY29ubmVjdGlvbiBvYmplY3Q/XG4gICAgcmV0dXJuIGVuc3VyZUNvbGxlY3Rpb24obmFtZSwgY29ubi5fbW9uZ29fbGl2ZWRhdGFfY29sbGVjdGlvbnMpO1xuICB9XG59KTtcblxuZnVuY3Rpb24gZW5zdXJlQ29sbGVjdGlvbihuYW1lLCBjb2xsZWN0aW9ucykge1xuICByZXR1cm4gKG5hbWUgaW4gY29sbGVjdGlvbnMpXG4gICAgPyBjb2xsZWN0aW9uc1tuYW1lXVxuICAgIDogY29sbGVjdGlvbnNbbmFtZV0gPSBuZXcgTG9jYWxDb2xsZWN0aW9uKG5hbWUpO1xufVxuIiwiaW1wb3J0IG9uY2UgZnJvbSAnbG9kYXNoLm9uY2UnO1xuaW1wb3J0IHtcbiAgQVNZTkNfQ09MTEVDVElPTl9NRVRIT0RTLFxuICBnZXRBc3luY01ldGhvZE5hbWUsXG4gIENMSUVOVF9PTkxZX01FVEhPRFNcbn0gZnJvbSBcIm1ldGVvci9taW5pbW9uZ28vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBNb25nb0Nvbm5lY3Rpb24gfSBmcm9tICcuL21vbmdvX2Nvbm5lY3Rpb24nO1xuXG4vLyBEZWZpbmUgaW50ZXJmYWNlcyBhbmQgdHlwZXNcbmludGVyZmFjZSBJQ29ubmVjdGlvbk9wdGlvbnMge1xuICBvcGxvZ1VybD86IHN0cmluZztcbiAgW2tleTogc3RyaW5nXTogdW5rbm93bjsgIC8vIENoYW5nZWQgZnJvbSAnYW55JyB0byAndW5rbm93bicgZm9yIGJldHRlciB0eXBlIHNhZmV0eVxufVxuXG5pbnRlcmZhY2UgSU1vbmdvSW50ZXJuYWxzIHtcbiAgUmVtb3RlQ29sbGVjdGlvbkRyaXZlcjogdHlwZW9mIFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXI7XG4gIGRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyOiAoKSA9PiBSZW1vdGVDb2xsZWN0aW9uRHJpdmVyO1xufVxuXG4vLyBNb3JlIHNwZWNpZmljIHR5cGluZyBmb3IgY29sbGVjdGlvbiBtZXRob2RzXG50eXBlIE1vbmdvTWV0aG9kRnVuY3Rpb24gPSAoLi4uYXJnczogdW5rbm93bltdKSA9PiB1bmtub3duO1xuaW50ZXJmYWNlIElDb2xsZWN0aW9uTWV0aG9kcyB7XG4gIFtrZXk6IHN0cmluZ106IE1vbmdvTWV0aG9kRnVuY3Rpb247XG59XG5cbi8vIFR5cGUgZm9yIE1vbmdvQ29ubmVjdGlvblxuaW50ZXJmYWNlIElNb25nb0NsaWVudCB7XG4gIGNvbm5lY3Q6ICgpID0+IFByb21pc2U8dm9pZD47XG59XG5cbmludGVyZmFjZSBJTW9uZ29Db25uZWN0aW9uIHtcbiAgY2xpZW50OiBJTW9uZ29DbGllbnQ7XG4gIFtrZXk6IHN0cmluZ106IE1vbmdvTWV0aG9kRnVuY3Rpb24gfCBJTW9uZ29DbGllbnQ7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgbmFtZXNwYWNlIE5vZGVKUyB7XG4gICAgaW50ZXJmYWNlIFByb2Nlc3NFbnYge1xuICAgICAgTU9OR09fVVJMOiBzdHJpbmc7XG4gICAgICBNT05HT19PUExPR19VUkw/OiBzdHJpbmc7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgTW9uZ29JbnRlcm5hbHM6IElNb25nb0ludGVybmFscztcbiAgY29uc3QgTWV0ZW9yOiB7XG4gICAgc3RhcnR1cDogKGNhbGxiYWNrOiAoKSA9PiBQcm9taXNlPHZvaWQ+KSA9PiB2b2lkO1xuICB9O1xufVxuXG5jbGFzcyBSZW1vdGVDb2xsZWN0aW9uRHJpdmVyIHtcbiAgcHJpdmF0ZSByZWFkb25seSBtb25nbzogTW9uZ29Db25uZWN0aW9uO1xuXG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFJFTU9URV9DT0xMRUNUSU9OX01FVEhPRFMgPSBbXG4gICAgJ2NyZWF0ZUNhcHBlZENvbGxlY3Rpb25Bc3luYycsXG4gICAgJ2Ryb3BJbmRleEFzeW5jJyxcbiAgICAnZW5zdXJlSW5kZXhBc3luYycsXG4gICAgJ2NyZWF0ZUluZGV4QXN5bmMnLFxuICAgICdjb3VudERvY3VtZW50cycsXG4gICAgJ2Ryb3BDb2xsZWN0aW9uQXN5bmMnLFxuICAgICdlc3RpbWF0ZWREb2N1bWVudENvdW50JyxcbiAgICAnZmluZCcsXG4gICAgJ2ZpbmRPbmVBc3luYycsXG4gICAgJ2luc2VydEFzeW5jJyxcbiAgICAncmF3Q29sbGVjdGlvbicsXG4gICAgJ3JlbW92ZUFzeW5jJyxcbiAgICAndXBkYXRlQXN5bmMnLFxuICAgICd1cHNlcnRBc3luYycsXG4gIF0gYXMgY29uc3Q7XG5cbiAgY29uc3RydWN0b3IobW9uZ29Vcmw6IHN0cmluZywgb3B0aW9uczogSUNvbm5lY3Rpb25PcHRpb25zKSB7XG4gICAgdGhpcy5tb25nbyA9IG5ldyBNb25nb0Nvbm5lY3Rpb24obW9uZ29VcmwsIG9wdGlvbnMpO1xuICB9XG5cbiAgcHVibGljIG9wZW4obmFtZTogc3RyaW5nKTogSUNvbGxlY3Rpb25NZXRob2RzIHtcbiAgICBjb25zdCByZXQ6IElDb2xsZWN0aW9uTWV0aG9kcyA9IHt9O1xuXG4gICAgLy8gSGFuZGxlIHJlbW90ZSBjb2xsZWN0aW9uIG1ldGhvZHNcbiAgICBSZW1vdGVDb2xsZWN0aW9uRHJpdmVyLlJFTU9URV9DT0xMRUNUSU9OX01FVEhPRFMuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gICAgICAvLyBUeXBlIGFzc2VydGlvbiBuZWVkZWQgYmVjYXVzZSB3ZSBrbm93IHRoZXNlIG1ldGhvZHMgZXhpc3Qgb24gTW9uZ29Db25uZWN0aW9uXG4gICAgICBjb25zdCBtb25nb01ldGhvZCA9IHRoaXMubW9uZ29bbWV0aG9kXSBhcyBNb25nb01ldGhvZEZ1bmN0aW9uO1xuICAgICAgcmV0W21ldGhvZF0gPSBtb25nb01ldGhvZC5iaW5kKHRoaXMubW9uZ28sIG5hbWUpO1xuXG4gICAgICBpZiAoIUFTWU5DX0NPTExFQ1RJT05fTUVUSE9EUy5pbmNsdWRlcyhtZXRob2QpKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGFzeW5jTWV0aG9kTmFtZSA9IGdldEFzeW5jTWV0aG9kTmFtZShtZXRob2QpO1xuICAgICAgcmV0W2FzeW5jTWV0aG9kTmFtZV0gPSAoLi4uYXJnczogdW5rbm93bltdKSA9PiByZXRbbWV0aG9kXSguLi5hcmdzKTtcbiAgICB9KTtcblxuICAgIC8vIEhhbmRsZSBjbGllbnQtb25seSBtZXRob2RzXG4gICAgQ0xJRU5UX09OTFlfTUVUSE9EUy5mb3JFYWNoKChtZXRob2QpID0+IHtcbiAgICAgIHJldFttZXRob2RdID0gKC4uLmFyZ3M6IHVua25vd25bXSk6IG5ldmVyID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGAke21ldGhvZH0gaXMgbm90IGF2YWlsYWJsZSBvbiB0aGUgc2VydmVyLiBQbGVhc2UgdXNlICR7Z2V0QXN5bmNNZXRob2ROYW1lKFxuICAgICAgICAgICAgbWV0aG9kXG4gICAgICAgICAgKX0oKSBpbnN0ZWFkLmBcbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbi8vIEFzc2lnbiB0aGUgY2xhc3MgdG8gTW9uZ29JbnRlcm5hbHNcbk1vbmdvSW50ZXJuYWxzLlJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIgPSBSZW1vdGVDb2xsZWN0aW9uRHJpdmVyO1xuXG4vLyBDcmVhdGUgdGhlIHNpbmdsZXRvbiBSZW1vdGVDb2xsZWN0aW9uRHJpdmVyIG9ubHkgb24gZGVtYW5kXG5Nb25nb0ludGVybmFscy5kZWZhdWx0UmVtb3RlQ29sbGVjdGlvbkRyaXZlciA9IG9uY2UoKCk6IFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIgPT4ge1xuICBjb25zdCBjb25uZWN0aW9uT3B0aW9uczogSUNvbm5lY3Rpb25PcHRpb25zID0ge307XG4gIGNvbnN0IG1vbmdvVXJsID0gcHJvY2Vzcy5lbnYuTU9OR09fVVJMO1xuXG4gIGlmICghbW9uZ29VcmwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNT05HT19VUkwgbXVzdCBiZSBzZXQgaW4gZW52aXJvbm1lbnRcIik7XG4gIH1cblxuICBpZiAocHJvY2Vzcy5lbnYuTU9OR09fT1BMT0dfVVJMKSB7XG4gICAgY29ubmVjdGlvbk9wdGlvbnMub3Bsb2dVcmwgPSBwcm9jZXNzLmVudi5NT05HT19PUExPR19VUkw7XG4gIH1cblxuICBjb25zdCBkcml2ZXIgPSBuZXcgUmVtb3RlQ29sbGVjdGlvbkRyaXZlcihtb25nb1VybCwgY29ubmVjdGlvbk9wdGlvbnMpO1xuXG4gIC8vIEluaXRpYWxpemUgZGF0YWJhc2UgY29ubmVjdGlvbiBvbiBzdGFydHVwXG4gIE1ldGVvci5zdGFydHVwKGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBhd2FpdCBkcml2ZXIubW9uZ28uY2xpZW50LmNvbm5lY3QoKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRyaXZlcjtcbn0pO1xuXG5leHBvcnQgeyBSZW1vdGVDb2xsZWN0aW9uRHJpdmVyLCBJQ29ubmVjdGlvbk9wdGlvbnMsIElDb2xsZWN0aW9uTWV0aG9kcyB9OyIsImltcG9ydCB7IG5vcm1hbGl6ZVByb2plY3Rpb24gfSBmcm9tIFwiLi4vbW9uZ29fdXRpbHNcIjtcbmltcG9ydCB7IEFzeW5jTWV0aG9kcyB9IGZyb20gJy4vbWV0aG9kc19hc3luYyc7XG5pbXBvcnQgeyBTeW5jTWV0aG9kcyB9IGZyb20gJy4vbWV0aG9kc19zeW5jJztcbmltcG9ydCB7IEluZGV4TWV0aG9kcyB9IGZyb20gJy4vbWV0aG9kc19pbmRleCc7XG5pbXBvcnQge1xuICBJRF9HRU5FUkFUT1JTLCBub3JtYWxpemVPcHRpb25zLFxuICBzZXR1cEF1dG9wdWJsaXNoLFxuICBzZXR1cENvbm5lY3Rpb24sXG4gIHNldHVwRHJpdmVyLFxuICBzZXR1cE11dGF0aW9uTWV0aG9kcyxcbiAgdmFsaWRhdGVDb2xsZWN0aW9uTmFtZVxufSBmcm9tICcuL2NvbGxlY3Rpb25fdXRpbHMnO1xuaW1wb3J0IHsgUmVwbGljYXRpb25NZXRob2RzIH0gZnJvbSAnLi9tZXRob2RzX3JlcGxpY2F0aW9uJztcblxuLyoqXG4gKiBAc3VtbWFyeSBOYW1lc3BhY2UgZm9yIE1vbmdvREItcmVsYXRlZCBpdGVtc1xuICogQG5hbWVzcGFjZVxuICovXG5Nb25nbyA9IHt9O1xuXG4vKipcbiAqIEBzdW1tYXJ5IENvbnN0cnVjdG9yIGZvciBhIENvbGxlY3Rpb25cbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQGluc3RhbmNlbmFtZSBjb2xsZWN0aW9uXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb2xsZWN0aW9uLiAgSWYgbnVsbCwgY3JlYXRlcyBhbiB1bm1hbmFnZWQgKHVuc3luY2hyb25pemVkKSBsb2NhbCBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuY29ubmVjdGlvbiBUaGUgc2VydmVyIGNvbm5lY3Rpb24gdGhhdCB3aWxsIG1hbmFnZSB0aGlzIGNvbGxlY3Rpb24uIFVzZXMgdGhlIGRlZmF1bHQgY29ubmVjdGlvbiBpZiBub3Qgc3BlY2lmaWVkLiAgUGFzcyB0aGUgcmV0dXJuIHZhbHVlIG9mIGNhbGxpbmcgW2BERFAuY29ubmVjdGBdKCNERFAtY29ubmVjdCkgdG8gc3BlY2lmeSBhIGRpZmZlcmVudCBzZXJ2ZXIuIFBhc3MgYG51bGxgIHRvIHNwZWNpZnkgbm8gY29ubmVjdGlvbi4gVW5tYW5hZ2VkIChgbmFtZWAgaXMgbnVsbCkgY29sbGVjdGlvbnMgY2Fubm90IHNwZWNpZnkgYSBjb25uZWN0aW9uLlxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuaWRHZW5lcmF0aW9uIFRoZSBtZXRob2Qgb2YgZ2VuZXJhdGluZyB0aGUgYF9pZGAgZmllbGRzIG9mIG5ldyBkb2N1bWVudHMgaW4gdGhpcyBjb2xsZWN0aW9uLiAgUG9zc2libGUgdmFsdWVzOlxuXG4gLSAqKmAnU1RSSU5HJ2AqKjogcmFuZG9tIHN0cmluZ3NcbiAtICoqYCdNT05HTydgKio6ICByYW5kb20gW2BNb25nby5PYmplY3RJRGBdKCNtb25nb19vYmplY3RfaWQpIHZhbHVlc1xuXG5UaGUgZGVmYXVsdCBpZCBnZW5lcmF0aW9uIHRlY2huaXF1ZSBpcyBgJ1NUUklORydgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy50cmFuc2Zvcm0gQW4gb3B0aW9uYWwgdHJhbnNmb3JtYXRpb24gZnVuY3Rpb24uIERvY3VtZW50cyB3aWxsIGJlIHBhc3NlZCB0aHJvdWdoIHRoaXMgZnVuY3Rpb24gYmVmb3JlIGJlaW5nIHJldHVybmVkIGZyb20gYGZldGNoYCBvciBgZmluZE9uZUFzeW5jYCwgYW5kIGJlZm9yZSBiZWluZyBwYXNzZWQgdG8gY2FsbGJhY2tzIG9mIGBvYnNlcnZlYCwgYG1hcGAsIGBmb3JFYWNoYCwgYGFsbG93YCwgYW5kIGBkZW55YC4gVHJhbnNmb3JtcyBhcmUgKm5vdCogYXBwbGllZCBmb3IgdGhlIGNhbGxiYWNrcyBvZiBgb2JzZXJ2ZUNoYW5nZXNgIG9yIHRvIGN1cnNvcnMgcmV0dXJuZWQgZnJvbSBwdWJsaXNoIGZ1bmN0aW9ucy5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5kZWZpbmVNdXRhdGlvbk1ldGhvZHMgU2V0IHRvIGBmYWxzZWAgdG8gc2tpcCBzZXR0aW5nIHVwIHRoZSBtdXRhdGlvbiBtZXRob2RzIHRoYXQgZW5hYmxlIGluc2VydC91cGRhdGUvcmVtb3ZlIGZyb20gY2xpZW50IGNvZGUuIERlZmF1bHQgYHRydWVgLlxuICovXG4vLyBNYWluIENvbGxlY3Rpb24gY29uc3RydWN0b3Jcbk1vbmdvLkNvbGxlY3Rpb24gPSBmdW5jdGlvbiBDb2xsZWN0aW9uKG5hbWUsIG9wdGlvbnMpIHtcbiAgbmFtZSA9IHZhbGlkYXRlQ29sbGVjdGlvbk5hbWUobmFtZSk7XG5cbiAgb3B0aW9ucyA9IG5vcm1hbGl6ZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgdGhpcy5fbWFrZU5ld0lEID0gSURfR0VORVJBVE9SU1tvcHRpb25zLmlkR2VuZXJhdGlvbl0/LihuYW1lKTtcblxuICB0aGlzLl90cmFuc2Zvcm0gPSBMb2NhbENvbGxlY3Rpb24ud3JhcFRyYW5zZm9ybShvcHRpb25zLnRyYW5zZm9ybSk7XG4gIHRoaXMucmVzb2x2ZXJUeXBlID0gb3B0aW9ucy5yZXNvbHZlclR5cGU7XG5cbiAgdGhpcy5fY29ubmVjdGlvbiA9IHNldHVwQ29ubmVjdGlvbihuYW1lLCBvcHRpb25zKTtcblxuICBjb25zdCBkcml2ZXIgPSBzZXR1cERyaXZlcihuYW1lLCB0aGlzLl9jb25uZWN0aW9uLCBvcHRpb25zKTtcbiAgdGhpcy5fZHJpdmVyID0gZHJpdmVyO1xuXG4gIHRoaXMuX2NvbGxlY3Rpb24gPSBkcml2ZXIub3BlbihuYW1lLCB0aGlzLl9jb25uZWN0aW9uKTtcbiAgdGhpcy5fbmFtZSA9IG5hbWU7XG5cbiAgdGhpcy5fc2V0dGluZ1VwUmVwbGljYXRpb25Qcm9taXNlID0gdGhpcy5fbWF5YmVTZXRVcFJlcGxpY2F0aW9uKG5hbWUsIG9wdGlvbnMpO1xuXG4gIHNldHVwTXV0YXRpb25NZXRob2RzKHRoaXMsIG5hbWUsIG9wdGlvbnMpO1xuXG4gIHNldHVwQXV0b3B1Ymxpc2godGhpcywgbmFtZSwgb3B0aW9ucyk7XG5cbiAgTW9uZ28uX2NvbGxlY3Rpb25zLnNldChuYW1lLCB0aGlzKTtcbn07XG5cbk9iamVjdC5hc3NpZ24oTW9uZ28uQ29sbGVjdGlvbi5wcm90b3R5cGUsIHtcbiAgX2dldEZpbmRTZWxlY3RvcihhcmdzKSB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID09IDApIHJldHVybiB7fTtcbiAgICBlbHNlIHJldHVybiBhcmdzWzBdO1xuICB9LFxuXG4gIF9nZXRGaW5kT3B0aW9ucyhhcmdzKSB7XG4gICAgY29uc3QgWywgb3B0aW9uc10gPSBhcmdzIHx8IFtdO1xuICAgIGNvbnN0IG5ld09wdGlvbnMgPSBub3JtYWxpemVQcm9qZWN0aW9uKG9wdGlvbnMpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChhcmdzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybiB7IHRyYW5zZm9ybTogc2VsZi5fdHJhbnNmb3JtIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoZWNrKFxuICAgICAgICBuZXdPcHRpb25zLFxuICAgICAgICBNYXRjaC5PcHRpb25hbChcbiAgICAgICAgICBNYXRjaC5PYmplY3RJbmNsdWRpbmcoe1xuICAgICAgICAgICAgcHJvamVjdGlvbjogTWF0Y2guT3B0aW9uYWwoTWF0Y2guT25lT2YoT2JqZWN0LCB1bmRlZmluZWQpKSxcbiAgICAgICAgICAgIHNvcnQ6IE1hdGNoLk9wdGlvbmFsKFxuICAgICAgICAgICAgICBNYXRjaC5PbmVPZihPYmplY3QsIEFycmF5LCBGdW5jdGlvbiwgdW5kZWZpbmVkKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGxpbWl0OiBNYXRjaC5PcHRpb25hbChNYXRjaC5PbmVPZihOdW1iZXIsIHVuZGVmaW5lZCkpLFxuICAgICAgICAgICAgc2tpcDogTWF0Y2guT3B0aW9uYWwoTWF0Y2guT25lT2YoTnVtYmVyLCB1bmRlZmluZWQpKSxcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICApO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0cmFuc2Zvcm06IHNlbGYuX3RyYW5zZm9ybSxcbiAgICAgICAgLi4ubmV3T3B0aW9ucyxcbiAgICAgIH07XG4gICAgfVxuICB9LFxufSk7XG5cbk9iamVjdC5hc3NpZ24oTW9uZ28uQ29sbGVjdGlvbiwge1xuICBhc3luYyBfcHVibGlzaEN1cnNvcihjdXJzb3IsIHN1YiwgY29sbGVjdGlvbikge1xuICAgIHZhciBvYnNlcnZlSGFuZGxlID0gYXdhaXQgY3Vyc29yLm9ic2VydmVDaGFuZ2VzKFxuICAgICAgICB7XG4gICAgICAgICAgYWRkZWQ6IGZ1bmN0aW9uKGlkLCBmaWVsZHMpIHtcbiAgICAgICAgICAgIHN1Yi5hZGRlZChjb2xsZWN0aW9uLCBpZCwgZmllbGRzKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNoYW5nZWQ6IGZ1bmN0aW9uKGlkLCBmaWVsZHMpIHtcbiAgICAgICAgICAgIHN1Yi5jaGFuZ2VkKGNvbGxlY3Rpb24sIGlkLCBmaWVsZHMpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVtb3ZlZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIHN1Yi5yZW1vdmVkKGNvbGxlY3Rpb24sIGlkKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAvLyBQdWJsaWNhdGlvbnMgZG9uJ3QgbXV0YXRlIHRoZSBkb2N1bWVudHNcbiAgICAgICAgLy8gVGhpcyBpcyB0ZXN0ZWQgYnkgdGhlIGBsaXZlZGF0YSAtIHB1Ymxpc2ggY2FsbGJhY2tzIGNsb25lYCB0ZXN0XG4gICAgICAgIHsgbm9uTXV0YXRpbmdDYWxsYmFja3M6IHRydWUgfVxuICAgICk7XG5cbiAgICAvLyBXZSBkb24ndCBjYWxsIHN1Yi5yZWFkeSgpIGhlcmU6IGl0IGdldHMgY2FsbGVkIGluIGxpdmVkYXRhX3NlcnZlciwgYWZ0ZXJcbiAgICAvLyBwb3NzaWJseSBjYWxsaW5nIF9wdWJsaXNoQ3Vyc29yIG9uIG11bHRpcGxlIHJldHVybmVkIGN1cnNvcnMuXG5cbiAgICAvLyByZWdpc3RlciBzdG9wIGNhbGxiYWNrIChleHBlY3RzIGxhbWJkYSB3LyBubyBhcmdzKS5cbiAgICBzdWIub25TdG9wKGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGF3YWl0IG9ic2VydmVIYW5kbGUuc3RvcCgpO1xuICAgIH0pO1xuXG4gICAgLy8gcmV0dXJuIHRoZSBvYnNlcnZlSGFuZGxlIGluIGNhc2UgaXQgbmVlZHMgdG8gYmUgc3RvcHBlZCBlYXJseVxuICAgIHJldHVybiBvYnNlcnZlSGFuZGxlO1xuICB9LFxuXG4gIC8vIHByb3RlY3QgYWdhaW5zdCBkYW5nZXJvdXMgc2VsZWN0b3JzLiAgZmFsc2V5IGFuZCB7X2lkOiBmYWxzZXl9IGFyZSBib3RoXG4gIC8vIGxpa2VseSBwcm9ncmFtbWVyIGVycm9yLCBhbmQgbm90IHdoYXQgeW91IHdhbnQsIHBhcnRpY3VsYXJseSBmb3IgZGVzdHJ1Y3RpdmVcbiAgLy8gb3BlcmF0aW9ucy4gSWYgYSBmYWxzZXkgX2lkIGlzIHNlbnQgaW4sIGEgbmV3IHN0cmluZyBfaWQgd2lsbCBiZVxuICAvLyBnZW5lcmF0ZWQgYW5kIHJldHVybmVkOyBpZiBhIGZhbGxiYWNrSWQgaXMgcHJvdmlkZWQsIGl0IHdpbGwgYmUgcmV0dXJuZWRcbiAgLy8gaW5zdGVhZC5cbiAgX3Jld3JpdGVTZWxlY3RvcihzZWxlY3RvciwgeyBmYWxsYmFja0lkIH0gPSB7fSkge1xuICAgIC8vIHNob3J0aGFuZCAtLSBzY2FsYXJzIG1hdGNoIF9pZFxuICAgIGlmIChMb2NhbENvbGxlY3Rpb24uX3NlbGVjdG9ySXNJZChzZWxlY3RvcikpIHNlbGVjdG9yID0geyBfaWQ6IHNlbGVjdG9yIH07XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShzZWxlY3RvcikpIHtcbiAgICAgIC8vIFRoaXMgaXMgY29uc2lzdGVudCB3aXRoIHRoZSBNb25nbyBjb25zb2xlIGl0c2VsZjsgaWYgd2UgZG9uJ3QgZG8gdGhpc1xuICAgICAgLy8gY2hlY2sgcGFzc2luZyBhbiBlbXB0eSBhcnJheSBlbmRzIHVwIHNlbGVjdGluZyBhbGwgaXRlbXNcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk1vbmdvIHNlbGVjdG9yIGNhbid0IGJlIGFuIGFycmF5LlwiKTtcbiAgICB9XG5cbiAgICBpZiAoIXNlbGVjdG9yIHx8ICgnX2lkJyBpbiBzZWxlY3RvciAmJiAhc2VsZWN0b3IuX2lkKSkge1xuICAgICAgLy8gY2FuJ3QgbWF0Y2ggYW55dGhpbmdcbiAgICAgIHJldHVybiB7IF9pZDogZmFsbGJhY2tJZCB8fCBSYW5kb20uaWQoKSB9O1xuICAgIH1cblxuICAgIHJldHVybiBzZWxlY3RvcjtcbiAgfSxcbn0pO1xuXG5PYmplY3QuYXNzaWduKE1vbmdvLkNvbGxlY3Rpb24ucHJvdG90eXBlLCBSZXBsaWNhdGlvbk1ldGhvZHMsIFN5bmNNZXRob2RzLCBBc3luY01ldGhvZHMsIEluZGV4TWV0aG9kcyk7XG5cbk9iamVjdC5hc3NpZ24oTW9uZ28uQ29sbGVjdGlvbi5wcm90b3R5cGUsIHtcbiAgLy8gRGV0ZXJtaW5lIGlmIHRoaXMgY29sbGVjdGlvbiBpcyBzaW1wbHkgYSBtaW5pbW9uZ28gcmVwcmVzZW50YXRpb24gb2YgYSByZWFsXG4gIC8vIGRhdGFiYXNlIG9uIGFub3RoZXIgc2VydmVyXG4gIF9pc1JlbW90ZUNvbGxlY3Rpb24oKSB7XG4gICAgLy8gWFhYIHNlZSAjTWV0ZW9yU2VydmVyTnVsbFxuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uICYmIHRoaXMuX2Nvbm5lY3Rpb24gIT09IE1ldGVvci5zZXJ2ZXI7XG4gIH0sXG5cbiAgYXN5bmMgZHJvcENvbGxlY3Rpb25Bc3luYygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFzZWxmLl9jb2xsZWN0aW9uLmRyb3BDb2xsZWN0aW9uQXN5bmMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBvbmx5IGNhbGwgZHJvcENvbGxlY3Rpb25Bc3luYyBvbiBzZXJ2ZXIgY29sbGVjdGlvbnMnKTtcbiAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uZHJvcENvbGxlY3Rpb25Bc3luYygpO1xuICB9LFxuXG4gIGFzeW5jIGNyZWF0ZUNhcHBlZENvbGxlY3Rpb25Bc3luYyhieXRlU2l6ZSwgbWF4RG9jdW1lbnRzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uY3JlYXRlQ2FwcGVkQ29sbGVjdGlvbkFzeW5jKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnQ2FuIG9ubHkgY2FsbCBjcmVhdGVDYXBwZWRDb2xsZWN0aW9uQXN5bmMgb24gc2VydmVyIGNvbGxlY3Rpb25zJ1xuICAgICAgKTtcbiAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLmNyZWF0ZUNhcHBlZENvbGxlY3Rpb25Bc3luYyhieXRlU2l6ZSwgbWF4RG9jdW1lbnRzKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgUmV0dXJucyB0aGUgW2BDb2xsZWN0aW9uYF0oaHR0cDovL21vbmdvZGIuZ2l0aHViLmlvL25vZGUtbW9uZ29kYi1uYXRpdmUvMy4wL2FwaS9Db2xsZWN0aW9uLmh0bWwpIG9iamVjdCBjb3JyZXNwb25kaW5nIHRvIHRoaXMgY29sbGVjdGlvbiBmcm9tIHRoZSBbbnBtIGBtb25nb2RiYCBkcml2ZXIgbW9kdWxlXShodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tb25nb2RiKSB3aGljaCBpcyB3cmFwcGVkIGJ5IGBNb25nby5Db2xsZWN0aW9uYC5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHJhd0NvbGxlY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghc2VsZi5fY29sbGVjdGlvbi5yYXdDb2xsZWN0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBvbmx5IGNhbGwgcmF3Q29sbGVjdGlvbiBvbiBzZXJ2ZXIgY29sbGVjdGlvbnMnKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGYuX2NvbGxlY3Rpb24ucmF3Q29sbGVjdGlvbigpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZXR1cm5zIHRoZSBbYERiYF0oaHR0cDovL21vbmdvZGIuZ2l0aHViLmlvL25vZGUtbW9uZ29kYi1uYXRpdmUvMy4wL2FwaS9EYi5odG1sKSBvYmplY3QgY29ycmVzcG9uZGluZyB0byB0aGlzIGNvbGxlY3Rpb24ncyBkYXRhYmFzZSBjb25uZWN0aW9uIGZyb20gdGhlIFtucG0gYG1vbmdvZGJgIGRyaXZlciBtb2R1bGVdKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21vbmdvZGIpIHdoaWNoIGlzIHdyYXBwZWQgYnkgYE1vbmdvLkNvbGxlY3Rpb25gLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgcmF3RGF0YWJhc2UoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghKHNlbGYuX2RyaXZlci5tb25nbyAmJiBzZWxmLl9kcml2ZXIubW9uZ28uZGIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBvbmx5IGNhbGwgcmF3RGF0YWJhc2Ugb24gc2VydmVyIGNvbGxlY3Rpb25zJyk7XG4gICAgfVxuICAgIHJldHVybiBzZWxmLl9kcml2ZXIubW9uZ28uZGI7XG4gIH0sXG59KTtcblxuT2JqZWN0LmFzc2lnbihNb25nbywge1xuICAvKipcbiAgICogQHN1bW1hcnkgUmV0cmlldmUgYSBNZXRlb3IgY29sbGVjdGlvbiBpbnN0YW5jZSBieSBuYW1lLiBPbmx5IGNvbGxlY3Rpb25zIGRlZmluZWQgd2l0aCBbYG5ldyBNb25nby5Db2xsZWN0aW9uKC4uLilgXSgjY29sbGVjdGlvbnMpIGFyZSBhdmFpbGFibGUgd2l0aCB0aGlzIG1ldGhvZC4gRm9yIHBsYWluIE1vbmdvREIgY29sbGVjdGlvbnMsIHlvdSdsbCB3YW50IHRvIGxvb2sgYXQgW2ByYXdEYXRhYmFzZSgpYF0oI01vbmdvLUNvbGxlY3Rpb24tcmF3RGF0YWJhc2UpLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlcm9mIE1vbmdvXG4gICAqIEBzdGF0aWNcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZSBvZiB5b3VyIGNvbGxlY3Rpb24gYXMgaXQgd2FzIGRlZmluZWQgd2l0aCBgbmV3IE1vbmdvLkNvbGxlY3Rpb24oKWAuXG4gICAqIEByZXR1cm5zIHtNb25nby5Db2xsZWN0aW9uIHwgdW5kZWZpbmVkfVxuICAgKi9cbiAgZ2V0Q29sbGVjdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb25zLmdldChuYW1lKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgQSByZWNvcmQgb2YgYWxsIGRlZmluZWQgTW9uZ28uQ29sbGVjdGlvbiBpbnN0YW5jZXMsIGluZGV4ZWQgYnkgY29sbGVjdGlvbiBuYW1lLlxuICAgKiBAdHlwZSB7TWFwPHN0cmluZywgTW9uZ28uQ29sbGVjdGlvbj59XG4gICAqIEBtZW1iZXJvZiBNb25nb1xuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBfY29sbGVjdGlvbnM6IG5ldyBNYXAoKSxcbn0pXG5cblxuXG4vKipcbiAqIEBzdW1tYXJ5IENyZWF0ZSBhIE1vbmdvLXN0eWxlIGBPYmplY3RJRGAuICBJZiB5b3UgZG9uJ3Qgc3BlY2lmeSBhIGBoZXhTdHJpbmdgLCB0aGUgYE9iamVjdElEYCB3aWxsIGJlIGdlbmVyYXRlZCByYW5kb21seSAobm90IHVzaW5nIE1vbmdvREIncyBJRCBjb25zdHJ1Y3Rpb24gcnVsZXMpLlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7U3RyaW5nfSBbaGV4U3RyaW5nXSBPcHRpb25hbC4gIFRoZSAyNC1jaGFyYWN0ZXIgaGV4YWRlY2ltYWwgY29udGVudHMgb2YgdGhlIE9iamVjdElEIHRvIGNyZWF0ZVxuICovXG5Nb25nby5PYmplY3RJRCA9IE1vbmdvSUQuT2JqZWN0SUQ7XG5cbi8qKlxuICogQHN1bW1hcnkgVG8gY3JlYXRlIGEgY3Vyc29yLCB1c2UgZmluZC4gVG8gYWNjZXNzIHRoZSBkb2N1bWVudHMgaW4gYSBjdXJzb3IsIHVzZSBmb3JFYWNoLCBtYXAsIG9yIGZldGNoLlxuICogQGNsYXNzXG4gKiBAaW5zdGFuY2VOYW1lIGN1cnNvclxuICovXG5Nb25nby5DdXJzb3IgPSBMb2NhbENvbGxlY3Rpb24uQ3Vyc29yO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIGluIDAuOS4xXG4gKi9cbk1vbmdvLkNvbGxlY3Rpb24uQ3Vyc29yID0gTW9uZ28uQ3Vyc29yO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIGluIDAuOS4xXG4gKi9cbk1vbmdvLkNvbGxlY3Rpb24uT2JqZWN0SUQgPSBNb25nby5PYmplY3RJRDtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBpbiAwLjkuMVxuICovXG5NZXRlb3IuQ29sbGVjdGlvbiA9IE1vbmdvLkNvbGxlY3Rpb247XG5cbi8vIEFsbG93IGRlbnkgc3R1ZmYgaXMgbm93IGluIHRoZSBhbGxvdy1kZW55IHBhY2thZ2Vcbk9iamVjdC5hc3NpZ24oTW9uZ28uQ29sbGVjdGlvbi5wcm90b3R5cGUsIEFsbG93RGVueS5Db2xsZWN0aW9uUHJvdG90eXBlKTtcblxuIiwiZXhwb3J0IGNvbnN0IElEX0dFTkVSQVRPUlMgPSB7XG4gIE1PTkdPKG5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBzcmMgPSBuYW1lID8gRERQLnJhbmRvbVN0cmVhbSgnL2NvbGxlY3Rpb24vJyArIG5hbWUpIDogUmFuZG9tLmluc2VjdXJlO1xuICAgICAgcmV0dXJuIG5ldyBNb25nby5PYmplY3RJRChzcmMuaGV4U3RyaW5nKDI0KSk7XG4gICAgfVxuICB9LFxuICBTVFJJTkcobmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHNyYyA9IG5hbWUgPyBERFAucmFuZG9tU3RyZWFtKCcvY29sbGVjdGlvbi8nICsgbmFtZSkgOiBSYW5kb20uaW5zZWN1cmU7XG4gICAgICByZXR1cm4gc3JjLmlkKCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBDb25uZWN0aW9uKG5hbWUsIG9wdGlvbnMpIHtcbiAgaWYgKCFuYW1lIHx8IG9wdGlvbnMuY29ubmVjdGlvbiA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gIGlmIChvcHRpb25zLmNvbm5lY3Rpb24pIHJldHVybiBvcHRpb25zLmNvbm5lY3Rpb247XG4gIHJldHVybiBNZXRlb3IuaXNDbGllbnQgPyBNZXRlb3IuY29ubmVjdGlvbiA6IE1ldGVvci5zZXJ2ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cERyaXZlcihuYW1lLCBjb25uZWN0aW9uLCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLl9kcml2ZXIpIHJldHVybiBvcHRpb25zLl9kcml2ZXI7XG5cbiAgaWYgKG5hbWUgJiZcbiAgICBjb25uZWN0aW9uID09PSBNZXRlb3Iuc2VydmVyICYmXG4gICAgdHlwZW9mIE1vbmdvSW50ZXJuYWxzICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIE1vbmdvSW50ZXJuYWxzLmRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyKSB7XG4gICAgcmV0dXJuIE1vbmdvSW50ZXJuYWxzLmRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyKCk7XG4gIH1cblxuICBjb25zdCB7IExvY2FsQ29sbGVjdGlvbkRyaXZlciB9ID0gcmVxdWlyZSgnLi4vbG9jYWxfY29sbGVjdGlvbl9kcml2ZXIuanMnKTtcbiAgcmV0dXJuIExvY2FsQ29sbGVjdGlvbkRyaXZlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwQXV0b3B1Ymxpc2goY29sbGVjdGlvbiwgbmFtZSwgb3B0aW9ucykge1xuICBpZiAoUGFja2FnZS5hdXRvcHVibGlzaCAmJlxuICAgICFvcHRpb25zLl9wcmV2ZW50QXV0b3B1Ymxpc2ggJiZcbiAgICBjb2xsZWN0aW9uLl9jb25uZWN0aW9uICYmXG4gICAgY29sbGVjdGlvbi5fY29ubmVjdGlvbi5wdWJsaXNoKSB7XG4gICAgY29sbGVjdGlvbi5fY29ubmVjdGlvbi5wdWJsaXNoKG51bGwsICgpID0+IGNvbGxlY3Rpb24uZmluZCgpLCB7XG4gICAgICBpc19hdXRvOiB0cnVlXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwTXV0YXRpb25NZXRob2RzKGNvbGxlY3Rpb24sIG5hbWUsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMuZGVmaW5lTXV0YXRpb25NZXRob2RzID09PSBmYWxzZSkgcmV0dXJuO1xuXG4gIHRyeSB7XG4gICAgY29sbGVjdGlvbi5fZGVmaW5lTXV0YXRpb25NZXRob2RzKHtcbiAgICAgIHVzZUV4aXN0aW5nOiBvcHRpb25zLl9zdXBwcmVzc1NhbWVOYW1lRXJyb3IgPT09IHRydWVcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IubWVzc2FnZSA9PT0gYEEgbWV0aG9kIG5hbWVkICcvJHtuYW1lfS9pbnNlcnRBc3luYycgaXMgYWxyZWFkeSBkZWZpbmVkYCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGVyZSBpcyBhbHJlYWR5IGEgY29sbGVjdGlvbiBuYW1lZCBcIiR7bmFtZX1cImApO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb2xsZWN0aW9uTmFtZShuYW1lKSB7XG4gIGlmICghbmFtZSAmJiBuYW1lICE9PSBudWxsKSB7XG4gICAgTWV0ZW9yLl9kZWJ1ZyhcbiAgICAgICdXYXJuaW5nOiBjcmVhdGluZyBhbm9ueW1vdXMgY29sbGVjdGlvbi4gSXQgd2lsbCBub3QgYmUgJyArXG4gICAgICAnc2F2ZWQgb3Igc3luY2hyb25pemVkIG92ZXIgdGhlIG5ldHdvcmsuIChQYXNzIG51bGwgZm9yICcgK1xuICAgICAgJ3RoZSBjb2xsZWN0aW9uIG5hbWUgdG8gdHVybiBvZmYgdGhpcyB3YXJuaW5nLiknXG4gICAgKTtcbiAgICBuYW1lID0gbnVsbDtcbiAgfVxuXG4gIGlmIChuYW1lICE9PSBudWxsICYmIHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdGaXJzdCBhcmd1bWVudCB0byBuZXcgTW9uZ28uQ29sbGVjdGlvbiBtdXN0IGJlIGEgc3RyaW5nIG9yIG51bGwnXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBuYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplT3B0aW9ucyhvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMubWV0aG9kcykge1xuICAgIC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IGhhY2sgd2l0aCBvcmlnaW5hbCBzaWduYXR1cmVcbiAgICBvcHRpb25zID0geyBjb25uZWN0aW9uOiBvcHRpb25zIH07XG4gIH1cbiAgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHk6IFwiY29ubmVjdGlvblwiIHVzZWQgdG8gYmUgY2FsbGVkIFwibWFuYWdlclwiLlxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLm1hbmFnZXIgJiYgIW9wdGlvbnMuY29ubmVjdGlvbikge1xuICAgIG9wdGlvbnMuY29ubmVjdGlvbiA9IG9wdGlvbnMubWFuYWdlcjtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29ubmVjdGlvbjogdW5kZWZpbmVkLFxuICAgIGlkR2VuZXJhdGlvbjogJ1NUUklORycsXG4gICAgdHJhbnNmb3JtOiBudWxsLFxuICAgIF9kcml2ZXI6IHVuZGVmaW5lZCxcbiAgICBfcHJldmVudEF1dG9wdWJsaXNoOiBmYWxzZSxcbiAgICAuLi5vcHRpb25zLFxuICB9O1xufVxuIiwiZXhwb3J0IGNvbnN0IEFzeW5jTWV0aG9kcyA9IHtcbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEZpbmRzIHRoZSBmaXJzdCBkb2N1bWVudCB0aGF0IG1hdGNoZXMgdGhlIHNlbGVjdG9yLCBhcyBvcmRlcmVkIGJ5IHNvcnQgYW5kIHNraXAgb3B0aW9ucy4gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBubyBtYXRjaGluZyBkb2N1bWVudCBpcyBmb3VuZC5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgZmluZE9uZUFzeW5jXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge01vbmdvU2VsZWN0b3J9IFtzZWxlY3Rvcl0gQSBxdWVyeSBkZXNjcmliaW5nIHRoZSBkb2N1bWVudHMgdG8gZmluZFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7TW9uZ29Tb3J0U3BlY2lmaWVyfSBvcHRpb25zLnNvcnQgU29ydCBvcmRlciAoZGVmYXVsdDogbmF0dXJhbCBvcmRlcilcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMuc2tpcCBOdW1iZXIgb2YgcmVzdWx0cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmdcbiAgICogQHBhcmFtIHtNb25nb0ZpZWxkU3BlY2lmaWVyfSBvcHRpb25zLmZpZWxkcyBEaWN0aW9uYXJ5IG9mIGZpZWxkcyB0byByZXR1cm4gb3IgZXhjbHVkZS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLnJlYWN0aXZlIChDbGllbnQgb25seSkgRGVmYXVsdCB0cnVlOyBwYXNzIGZhbHNlIHRvIGRpc2FibGUgcmVhY3Rpdml0eVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLnRyYW5zZm9ybSBPdmVycmlkZXMgYHRyYW5zZm9ybWAgb24gdGhlIFtgQ29sbGVjdGlvbmBdKCNjb2xsZWN0aW9ucykgZm9yIHRoaXMgY3Vyc29yLiAgUGFzcyBgbnVsbGAgdG8gZGlzYWJsZSB0cmFuc2Zvcm1hdGlvbi5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMucmVhZFByZWZlcmVuY2UgKFNlcnZlciBvbmx5KSBTcGVjaWZpZXMgYSBjdXN0b20gTW9uZ29EQiBbYHJlYWRQcmVmZXJlbmNlYF0oaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9jb3JlL3JlYWQtcHJlZmVyZW5jZSkgZm9yIGZldGNoaW5nIHRoZSBkb2N1bWVudC4gUG9zc2libGUgdmFsdWVzIGFyZSBgcHJpbWFyeWAsIGBwcmltYXJ5UHJlZmVycmVkYCwgYHNlY29uZGFyeWAsIGBzZWNvbmRhcnlQcmVmZXJyZWRgIGFuZCBgbmVhcmVzdGAuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAqL1xuICBmaW5kT25lQXN5bmMoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLl9jb2xsZWN0aW9uLmZpbmRPbmVBc3luYyhcbiAgICAgIHRoaXMuX2dldEZpbmRTZWxlY3RvcihhcmdzKSxcbiAgICAgIHRoaXMuX2dldEZpbmRPcHRpb25zKGFyZ3MpXG4gICAgKTtcbiAgfSxcblxuICBfaW5zZXJ0QXN5bmMoZG9jLCBvcHRpb25zID0ge30pIHtcbiAgICAvLyBNYWtlIHN1cmUgd2Ugd2VyZSBwYXNzZWQgYSBkb2N1bWVudCB0byBpbnNlcnRcbiAgICBpZiAoIWRvYykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnNlcnQgcmVxdWlyZXMgYW4gYXJndW1lbnQnKTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIGEgc2hhbGxvdyBjbG9uZSBvZiB0aGUgZG9jdW1lbnQsIHByZXNlcnZpbmcgaXRzIHByb3RvdHlwZS5cbiAgICBkb2MgPSBPYmplY3QuY3JlYXRlKFxuICAgICAgT2JqZWN0LmdldFByb3RvdHlwZU9mKGRvYyksXG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhkb2MpXG4gICAgKTtcblxuICAgIGlmICgnX2lkJyBpbiBkb2MpIHtcbiAgICAgIGlmIChcbiAgICAgICAgIWRvYy5faWQgfHxcbiAgICAgICAgISh0eXBlb2YgZG9jLl9pZCA9PT0gJ3N0cmluZycgfHwgZG9jLl9pZCBpbnN0YW5jZW9mIE1vbmdvLk9iamVjdElEKVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnTWV0ZW9yIHJlcXVpcmVzIGRvY3VtZW50IF9pZCBmaWVsZHMgdG8gYmUgbm9uLWVtcHR5IHN0cmluZ3Mgb3IgT2JqZWN0SURzJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgZ2VuZXJhdGVJZCA9IHRydWU7XG5cbiAgICAgIC8vIERvbid0IGdlbmVyYXRlIHRoZSBpZCBpZiB3ZSdyZSB0aGUgY2xpZW50IGFuZCB0aGUgJ291dGVybW9zdCcgY2FsbFxuICAgICAgLy8gVGhpcyBvcHRpbWl6YXRpb24gc2F2ZXMgdXMgcGFzc2luZyBib3RoIHRoZSByYW5kb21TZWVkIGFuZCB0aGUgaWRcbiAgICAgIC8vIFBhc3NpbmcgYm90aCBpcyByZWR1bmRhbnQuXG4gICAgICBpZiAodGhpcy5faXNSZW1vdGVDb2xsZWN0aW9uKCkpIHtcbiAgICAgICAgY29uc3QgZW5jbG9zaW5nID0gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi5nZXQoKTtcbiAgICAgICAgaWYgKCFlbmNsb3NpbmcpIHtcbiAgICAgICAgICBnZW5lcmF0ZUlkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGdlbmVyYXRlSWQpIHtcbiAgICAgICAgZG9jLl9pZCA9IHRoaXMuX21ha2VOZXdJRCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9uIGluc2VydHMsIGFsd2F5cyByZXR1cm4gdGhlIGlkIHRoYXQgd2UgZ2VuZXJhdGVkOyBvbiBhbGwgb3RoZXJcbiAgICAvLyBvcGVyYXRpb25zLCBqdXN0IHJldHVybiB0aGUgcmVzdWx0IGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gICAgdmFyIGNob29zZVJldHVyblZhbHVlRnJvbUNvbGxlY3Rpb25SZXN1bHQgPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIGlmIChNZXRlb3IuX2lzUHJvbWlzZShyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xuXG4gICAgICBpZiAoZG9jLl9pZCkge1xuICAgICAgICByZXR1cm4gZG9jLl9pZDtcbiAgICAgIH1cblxuICAgICAgLy8gWFhYIHdoYXQgaXMgdGhpcyBmb3I/P1xuICAgICAgLy8gSXQncyBzb21lIGl0ZXJhY3Rpb24gYmV0d2VlbiB0aGUgY2FsbGJhY2sgdG8gX2NhbGxNdXRhdG9yTWV0aG9kIGFuZFxuICAgICAgLy8gdGhlIHJldHVybiB2YWx1ZSBjb252ZXJzaW9uXG4gICAgICBkb2MuX2lkID0gcmVzdWx0O1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBpZiAodGhpcy5faXNSZW1vdGVDb2xsZWN0aW9uKCkpIHtcbiAgICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLl9jYWxsTXV0YXRvck1ldGhvZEFzeW5jKCdpbnNlcnRBc3luYycsIFtkb2NdLCBvcHRpb25zKTtcbiAgICAgIHByb21pc2UudGhlbihjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0KTtcbiAgICAgIHByb21pc2Uuc3R1YlByb21pc2UgPSBwcm9taXNlLnN0dWJQcm9taXNlLnRoZW4oY2hvb3NlUmV0dXJuVmFsdWVGcm9tQ29sbGVjdGlvblJlc3VsdCk7XG4gICAgICBwcm9taXNlLnNlcnZlclByb21pc2UgPSBwcm9taXNlLnNlcnZlclByb21pc2UudGhlbihjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0KTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIC8vIGl0J3MgbXkgY29sbGVjdGlvbi4gIGRlc2NlbmQgaW50byB0aGUgY29sbGVjdGlvbiBvYmplY3RcbiAgICAvLyBhbmQgcHJvcGFnYXRlIGFueSBleGNlcHRpb24uXG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24uaW5zZXJ0QXN5bmMoZG9jKVxuICAgICAgLnRoZW4oY2hvb3NlUmV0dXJuVmFsdWVGcm9tQ29sbGVjdGlvblJlc3VsdCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEluc2VydCBhIGRvY3VtZW50IGluIHRoZSBjb2xsZWN0aW9uLiAgUmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIHJldHVybiB0aGUgZG9jdW1lbnQncyB1bmlxdWUgX2lkIHdoZW4gc29sdmVkLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCAgaW5zZXJ0XG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge09iamVjdH0gZG9jIFRoZSBkb2N1bWVudCB0byBpbnNlcnQuIE1heSBub3QgeWV0IGhhdmUgYW4gX2lkIGF0dHJpYnV0ZSwgaW4gd2hpY2ggY2FzZSBNZXRlb3Igd2lsbCBnZW5lcmF0ZSBvbmUgZm9yIHlvdS5cbiAgICovXG4gIGluc2VydEFzeW5jKGRvYywgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9pbnNlcnRBc3luYyhkb2MsIG9wdGlvbnMpO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IE1vZGlmeSBvbmUgb3IgbW9yZSBkb2N1bWVudHMgaW4gdGhlIGNvbGxlY3Rpb24uIFJldHVybnMgdGhlIG51bWJlciBvZiBtYXRjaGVkIGRvY3VtZW50cy5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgdXBkYXRlXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge01vbmdvU2VsZWN0b3J9IHNlbGVjdG9yIFNwZWNpZmllcyB3aGljaCBkb2N1bWVudHMgdG8gbW9kaWZ5XG4gICAqIEBwYXJhbSB7TW9uZ29Nb2RpZmllcn0gbW9kaWZpZXIgU3BlY2lmaWVzIGhvdyB0byBtb2RpZnkgdGhlIGRvY3VtZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5tdWx0aSBUcnVlIHRvIG1vZGlmeSBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzOyBmYWxzZSB0byBvbmx5IG1vZGlmeSBvbmUgb2YgdGhlIG1hdGNoaW5nIGRvY3VtZW50cyAodGhlIGRlZmF1bHQpLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMudXBzZXJ0IFRydWUgdG8gaW5zZXJ0IGEgZG9jdW1lbnQgaWYgbm8gbWF0Y2hpbmcgZG9jdW1lbnRzIGFyZSBmb3VuZC5cbiAgICogQHBhcmFtIHtBcnJheX0gb3B0aW9ucy5hcnJheUZpbHRlcnMgT3B0aW9uYWwuIFVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBNb25nb0RCIFtmaWx0ZXJlZCBwb3NpdGlvbmFsIG9wZXJhdG9yXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL3JlZmVyZW5jZS9vcGVyYXRvci91cGRhdGUvcG9zaXRpb25hbC1maWx0ZXJlZC8pIHRvIHNwZWNpZnkgd2hpY2ggZWxlbWVudHMgdG8gbW9kaWZ5IGluIGFuIGFycmF5IGZpZWxkLlxuICAgKi9cbiAgdXBkYXRlQXN5bmMoc2VsZWN0b3IsIG1vZGlmaWVyLCAuLi5vcHRpb25zQW5kQ2FsbGJhY2spIHtcblxuICAgIC8vIFdlJ3ZlIGFscmVhZHkgcG9wcGVkIG9mZiB0aGUgY2FsbGJhY2ssIHNvIHdlIGFyZSBsZWZ0IHdpdGggYW4gYXJyYXlcbiAgICAvLyBvZiBvbmUgb3IgemVybyBpdGVtc1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLihvcHRpb25zQW5kQ2FsbGJhY2tbMF0gfHwgbnVsbCkgfTtcbiAgICBsZXQgaW5zZXJ0ZWRJZDtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnVwc2VydCkge1xuICAgICAgLy8gc2V0IGBpbnNlcnRlZElkYCBpZiBhYnNlbnQuICBgaW5zZXJ0ZWRJZGAgaXMgYSBNZXRlb3IgZXh0ZW5zaW9uLlxuICAgICAgaWYgKG9wdGlvbnMuaW5zZXJ0ZWRJZCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIShcbiAgICAgICAgICAgIHR5cGVvZiBvcHRpb25zLmluc2VydGVkSWQgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICAgICBvcHRpb25zLmluc2VydGVkSWQgaW5zdGFuY2VvZiBNb25nby5PYmplY3RJRFxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW5zZXJ0ZWRJZCBtdXN0IGJlIHN0cmluZyBvciBPYmplY3RJRCcpO1xuICAgICAgICBpbnNlcnRlZElkID0gb3B0aW9ucy5pbnNlcnRlZElkO1xuICAgICAgfSBlbHNlIGlmICghc2VsZWN0b3IgfHwgIXNlbGVjdG9yLl9pZCkge1xuICAgICAgICBpbnNlcnRlZElkID0gdGhpcy5fbWFrZU5ld0lEKCk7XG4gICAgICAgIG9wdGlvbnMuZ2VuZXJhdGVkSWQgPSB0cnVlO1xuICAgICAgICBvcHRpb25zLmluc2VydGVkSWQgPSBpbnNlcnRlZElkO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdG9yID0gTW9uZ28uQ29sbGVjdGlvbi5fcmV3cml0ZVNlbGVjdG9yKHNlbGVjdG9yLCB7XG4gICAgICBmYWxsYmFja0lkOiBpbnNlcnRlZElkLFxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuX2lzUmVtb3RlQ29sbGVjdGlvbigpKSB7XG4gICAgICBjb25zdCBhcmdzID0gW3NlbGVjdG9yLCBtb2RpZmllciwgb3B0aW9uc107XG5cbiAgICAgIHJldHVybiB0aGlzLl9jYWxsTXV0YXRvck1ldGhvZEFzeW5jKCd1cGRhdGVBc3luYycsIGFyZ3MsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIGl0J3MgbXkgY29sbGVjdGlvbi4gIGRlc2NlbmQgaW50byB0aGUgY29sbGVjdGlvbiBvYmplY3RcbiAgICAvLyBhbmQgcHJvcGFnYXRlIGFueSBleGNlcHRpb24uXG4gICAgLy8gSWYgdGhlIHVzZXIgcHJvdmlkZWQgYSBjYWxsYmFjayBhbmQgdGhlIGNvbGxlY3Rpb24gaW1wbGVtZW50cyB0aGlzXG4gICAgLy8gb3BlcmF0aW9uIGFzeW5jaHJvbm91c2x5LCB0aGVuIHF1ZXJ5UmV0IHdpbGwgYmUgdW5kZWZpbmVkLCBhbmQgdGhlXG4gICAgLy8gcmVzdWx0IHdpbGwgYmUgcmV0dXJuZWQgdGhyb3VnaCB0aGUgY2FsbGJhY2sgaW5zdGVhZC5cblxuICAgIHJldHVybiB0aGlzLl9jb2xsZWN0aW9uLnVwZGF0ZUFzeW5jKFxuICAgICAgc2VsZWN0b3IsXG4gICAgICBtb2RpZmllcixcbiAgICAgIG9wdGlvbnNcbiAgICApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBc3luY2hyb25vdXNseSByZW1vdmVzIGRvY3VtZW50cyBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCByZW1vdmVcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gc2VsZWN0b3IgU3BlY2lmaWVzIHdoaWNoIGRvY3VtZW50cyB0byByZW1vdmVcbiAgICovXG4gIHJlbW92ZUFzeW5jKHNlbGVjdG9yLCBvcHRpb25zID0ge30pIHtcbiAgICBzZWxlY3RvciA9IE1vbmdvLkNvbGxlY3Rpb24uX3Jld3JpdGVTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICBpZiAodGhpcy5faXNSZW1vdGVDb2xsZWN0aW9uKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWxsTXV0YXRvck1ldGhvZEFzeW5jKCdyZW1vdmVBc3luYycsIFtzZWxlY3Rvcl0sIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIGl0J3MgbXkgY29sbGVjdGlvbi4gIGRlc2NlbmQgaW50byB0aGUgY29sbGVjdGlvbjEgb2JqZWN0XG4gICAgLy8gYW5kIHByb3BhZ2F0ZSBhbnkgZXhjZXB0aW9uLlxuICAgIHJldHVybiB0aGlzLl9jb2xsZWN0aW9uLnJlbW92ZUFzeW5jKHNlbGVjdG9yKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgQXN5bmNocm9ub3VzbHkgbW9kaWZpZXMgb25lIG9yIG1vcmUgZG9jdW1lbnRzIGluIHRoZSBjb2xsZWN0aW9uLCBvciBpbnNlcnQgb25lIGlmIG5vIG1hdGNoaW5nIGRvY3VtZW50cyB3ZXJlIGZvdW5kLiBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIGtleXMgYG51bWJlckFmZmVjdGVkYCAodGhlIG51bWJlciBvZiBkb2N1bWVudHMgbW9kaWZpZWQpICBhbmQgYGluc2VydGVkSWRgICh0aGUgdW5pcXVlIF9pZCBvZiB0aGUgZG9jdW1lbnQgdGhhdCB3YXMgaW5zZXJ0ZWQsIGlmIGFueSkuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIHVwc2VydFxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtNb25nb1NlbGVjdG9yfSBzZWxlY3RvciBTcGVjaWZpZXMgd2hpY2ggZG9jdW1lbnRzIHRvIG1vZGlmeVxuICAgKiBAcGFyYW0ge01vbmdvTW9kaWZpZXJ9IG1vZGlmaWVyIFNwZWNpZmllcyBob3cgdG8gbW9kaWZ5IHRoZSBkb2N1bWVudHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMubXVsdGkgVHJ1ZSB0byBtb2RpZnkgYWxsIG1hdGNoaW5nIGRvY3VtZW50czsgZmFsc2UgdG8gb25seSBtb2RpZnkgb25lIG9mIHRoZSBtYXRjaGluZyBkb2N1bWVudHMgKHRoZSBkZWZhdWx0KS5cbiAgICovXG4gIGFzeW5jIHVwc2VydEFzeW5jKHNlbGVjdG9yLCBtb2RpZmllciwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZUFzeW5jKFxuICAgICAgc2VsZWN0b3IsXG4gICAgICBtb2RpZmllcixcbiAgICAgIHtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgX3JldHVybk9iamVjdDogdHJ1ZSxcbiAgICAgICAgdXBzZXJ0OiB0cnVlLFxuICAgICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEdldHMgdGhlIG51bWJlciBvZiBkb2N1bWVudHMgbWF0Y2hpbmcgdGhlIGZpbHRlci4gRm9yIGEgZmFzdCBjb3VudCBvZiB0aGUgdG90YWwgZG9jdW1lbnRzIGluIGEgY29sbGVjdGlvbiBzZWUgYGVzdGltYXRlZERvY3VtZW50Q291bnRgLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCBjb3VudERvY3VtZW50c1xuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtNb25nb1NlbGVjdG9yfSBbc2VsZWN0b3JdIEEgcXVlcnkgZGVzY3JpYmluZyB0aGUgZG9jdW1lbnRzIHRvIGNvdW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gQWxsIG9wdGlvbnMgYXJlIGxpc3RlZCBpbiBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL21vbmdvZGIuZ2l0aHViLmlvL25vZGUtbW9uZ29kYi1uYXRpdmUvNC4xMS9pbnRlcmZhY2VzL0NvdW50RG9jdW1lbnRzT3B0aW9ucy5odG1sKS4gUGxlYXNlIG5vdGUgdGhhdCBub3QgYWxsIG9mIHRoZW0gYXJlIGF2YWlsYWJsZSBvbiB0aGUgY2xpZW50LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+fVxuICAgKi9cbiAgY291bnREb2N1bWVudHMoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLl9jb2xsZWN0aW9uLmNvdW50RG9jdW1lbnRzKC4uLmFyZ3MpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBHZXRzIGFuIGVzdGltYXRlIG9mIHRoZSBjb3VudCBvZiBkb2N1bWVudHMgaW4gYSBjb2xsZWN0aW9uIHVzaW5nIGNvbGxlY3Rpb24gbWV0YWRhdGEuIEZvciBhbiBleGFjdCBjb3VudCBvZiB0aGUgZG9jdW1lbnRzIGluIGEgY29sbGVjdGlvbiBzZWUgYGNvdW50RG9jdW1lbnRzYC5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgZXN0aW1hdGVkRG9jdW1lbnRDb3VudFxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBBbGwgb3B0aW9ucyBhcmUgbGlzdGVkIGluIFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vbW9uZ29kYi5naXRodWIuaW8vbm9kZS1tb25nb2RiLW5hdGl2ZS80LjExL2ludGVyZmFjZXMvRXN0aW1hdGVkRG9jdW1lbnRDb3VudE9wdGlvbnMuaHRtbCkuIFBsZWFzZSBub3RlIHRoYXQgbm90IGFsbCBvZiB0aGVtIGFyZSBhdmFpbGFibGUgb24gdGhlIGNsaWVudC5cbiAgICogQHJldHVybnMge1Byb21pc2U8bnVtYmVyPn1cbiAgICovXG4gIGVzdGltYXRlZERvY3VtZW50Q291bnQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLl9jb2xsZWN0aW9uLmVzdGltYXRlZERvY3VtZW50Q291bnQoLi4uYXJncyk7XG4gIH0sXG59IiwiZXhwb3J0IGNvbnN0IEluZGV4TWV0aG9kcyA9IHtcbiAgLy8gV2UnbGwgYWN0dWFsbHkgZGVzaWduIGFuIGluZGV4IEFQSSBsYXRlci4gRm9yIG5vdywgd2UganVzdCBwYXNzIHRocm91Z2ggdG9cbiAgLy8gTW9uZ28ncywgYnV0IG1ha2UgaXQgc3luY2hyb25vdXMuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBc3luY2hyb25vdXNseSBjcmVhdGVzIHRoZSBzcGVjaWZpZWQgaW5kZXggb24gdGhlIGNvbGxlY3Rpb24uXG4gICAqIEBsb2N1cyBzZXJ2ZXJcbiAgICogQG1ldGhvZCBlbnN1cmVJbmRleEFzeW5jXG4gICAqIEBkZXByZWNhdGVkIGluIDMuMFxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtPYmplY3R9IGluZGV4IEEgZG9jdW1lbnQgdGhhdCBjb250YWlucyB0aGUgZmllbGQgYW5kIHZhbHVlIHBhaXJzIHdoZXJlIHRoZSBmaWVsZCBpcyB0aGUgaW5kZXgga2V5IGFuZCB0aGUgdmFsdWUgZGVzY3JpYmVzIHRoZSB0eXBlIG9mIGluZGV4IGZvciB0aGF0IGZpZWxkLiBGb3IgYW4gYXNjZW5kaW5nIGluZGV4IG9uIGEgZmllbGQsIHNwZWNpZnkgYSB2YWx1ZSBvZiBgMWA7IGZvciBkZXNjZW5kaW5nIGluZGV4LCBzcGVjaWZ5IGEgdmFsdWUgb2YgYC0xYC4gVXNlIGB0ZXh0YCBmb3IgdGV4dCBpbmRleGVzLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIEFsbCBvcHRpb25zIGFyZSBsaXN0ZWQgaW4gW01vbmdvREIgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9yZWZlcmVuY2UvbWV0aG9kL2RiLmNvbGxlY3Rpb24uY3JlYXRlSW5kZXgvI29wdGlvbnMpXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLm5hbWUgTmFtZSBvZiB0aGUgaW5kZXhcbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLnVuaXF1ZSBEZWZpbmUgdGhhdCB0aGUgaW5kZXggdmFsdWVzIG11c3QgYmUgdW5pcXVlLCBtb3JlIGF0IFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvY29yZS9pbmRleC11bmlxdWUvKVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMuc3BhcnNlIERlZmluZSB0aGF0IHRoZSBpbmRleCBpcyBzcGFyc2UsIG1vcmUgYXQgW01vbmdvREIgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9jb3JlL2luZGV4LXNwYXJzZS8pXG4gICAqL1xuICBhc3luYyBlbnN1cmVJbmRleEFzeW5jKGluZGV4LCBvcHRpb25zKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghc2VsZi5fY29sbGVjdGlvbi5lbnN1cmVJbmRleEFzeW5jIHx8ICFzZWxmLl9jb2xsZWN0aW9uLmNyZWF0ZUluZGV4QXN5bmMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBvbmx5IGNhbGwgY3JlYXRlSW5kZXhBc3luYyBvbiBzZXJ2ZXIgY29sbGVjdGlvbnMnKTtcbiAgICBpZiAoc2VsZi5fY29sbGVjdGlvbi5jcmVhdGVJbmRleEFzeW5jKSB7XG4gICAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLmNyZWF0ZUluZGV4QXN5bmMoaW5kZXgsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbXBvcnQgeyBMb2cgfSBmcm9tICdtZXRlb3IvbG9nZ2luZyc7XG5cbiAgICAgIExvZy5kZWJ1ZyhgZW5zdXJlSW5kZXhBc3luYyBoYXMgYmVlbiBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIHRoZSBuZXcgJ2NyZWF0ZUluZGV4QXN5bmMnIGluc3RlYWQkeyBvcHRpb25zPy5uYW1lID8gYCwgaW5kZXggbmFtZTogJHsgb3B0aW9ucy5uYW1lIH1gIDogYCwgaW5kZXg6ICR7IEpTT04uc3RyaW5naWZ5KGluZGV4KSB9YCB9YClcbiAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uZW5zdXJlSW5kZXhBc3luYyhpbmRleCwgb3B0aW9ucyk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBc3luY2hyb25vdXNseSBjcmVhdGVzIHRoZSBzcGVjaWZpZWQgaW5kZXggb24gdGhlIGNvbGxlY3Rpb24uXG4gICAqIEBsb2N1cyBzZXJ2ZXJcbiAgICogQG1ldGhvZCBjcmVhdGVJbmRleEFzeW5jXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge09iamVjdH0gaW5kZXggQSBkb2N1bWVudCB0aGF0IGNvbnRhaW5zIHRoZSBmaWVsZCBhbmQgdmFsdWUgcGFpcnMgd2hlcmUgdGhlIGZpZWxkIGlzIHRoZSBpbmRleCBrZXkgYW5kIHRoZSB2YWx1ZSBkZXNjcmliZXMgdGhlIHR5cGUgb2YgaW5kZXggZm9yIHRoYXQgZmllbGQuIEZvciBhbiBhc2NlbmRpbmcgaW5kZXggb24gYSBmaWVsZCwgc3BlY2lmeSBhIHZhbHVlIG9mIGAxYDsgZm9yIGRlc2NlbmRpbmcgaW5kZXgsIHNwZWNpZnkgYSB2YWx1ZSBvZiBgLTFgLiBVc2UgYHRleHRgIGZvciB0ZXh0IGluZGV4ZXMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gQWxsIG9wdGlvbnMgYXJlIGxpc3RlZCBpbiBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL3JlZmVyZW5jZS9tZXRob2QvZGIuY29sbGVjdGlvbi5jcmVhdGVJbmRleC8jb3B0aW9ucylcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMubmFtZSBOYW1lIG9mIHRoZSBpbmRleFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMudW5pcXVlIERlZmluZSB0aGF0IHRoZSBpbmRleCB2YWx1ZXMgbXVzdCBiZSB1bmlxdWUsIG1vcmUgYXQgW01vbmdvREIgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9jb3JlL2luZGV4LXVuaXF1ZS8pXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5zcGFyc2UgRGVmaW5lIHRoYXQgdGhlIGluZGV4IGlzIHNwYXJzZSwgbW9yZSBhdCBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvaW5kZXgtc3BhcnNlLylcbiAgICovXG4gIGFzeW5jIGNyZWF0ZUluZGV4QXN5bmMoaW5kZXgsIG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFzZWxmLl9jb2xsZWN0aW9uLmNyZWF0ZUluZGV4QXN5bmMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBvbmx5IGNhbGwgY3JlYXRlSW5kZXhBc3luYyBvbiBzZXJ2ZXIgY29sbGVjdGlvbnMnKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLmNyZWF0ZUluZGV4QXN5bmMoaW5kZXgsIG9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZS5tZXNzYWdlLmluY2x1ZGVzKFxuICAgICAgICAgICdBbiBlcXVpdmFsZW50IGluZGV4IGFscmVhZHkgZXhpc3RzIHdpdGggdGhlIHNhbWUgbmFtZSBidXQgZGlmZmVyZW50IG9wdGlvbnMuJ1xuICAgICAgICApICYmXG4gICAgICAgIE1ldGVvci5zZXR0aW5ncz8ucGFja2FnZXM/Lm1vbmdvPy5yZUNyZWF0ZUluZGV4T25PcHRpb25NaXNtYXRjaFxuICAgICAgKSB7XG4gICAgICAgIGltcG9ydCB7IExvZyB9IGZyb20gJ21ldGVvci9sb2dnaW5nJztcblxuICAgICAgICBMb2cuaW5mbyhgUmUtY3JlYXRpbmcgaW5kZXggJHsgaW5kZXggfSBmb3IgJHsgc2VsZi5fbmFtZSB9IGR1ZSB0byBvcHRpb25zIG1pc21hdGNoLmApO1xuICAgICAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLmRyb3BJbmRleEFzeW5jKGluZGV4KTtcbiAgICAgICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5jcmVhdGVJbmRleEFzeW5jKGluZGV4LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoYEFuIGVycm9yIG9jY3VycmVkIHdoZW4gY3JlYXRpbmcgYW4gaW5kZXggZm9yIGNvbGxlY3Rpb24gXCIkeyBzZWxmLl9uYW1lIH06ICR7IGUubWVzc2FnZSB9YCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBc3luY2hyb25vdXNseSBjcmVhdGVzIHRoZSBzcGVjaWZpZWQgaW5kZXggb24gdGhlIGNvbGxlY3Rpb24uXG4gICAqIEBsb2N1cyBzZXJ2ZXJcbiAgICogQG1ldGhvZCBjcmVhdGVJbmRleFxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtPYmplY3R9IGluZGV4IEEgZG9jdW1lbnQgdGhhdCBjb250YWlucyB0aGUgZmllbGQgYW5kIHZhbHVlIHBhaXJzIHdoZXJlIHRoZSBmaWVsZCBpcyB0aGUgaW5kZXgga2V5IGFuZCB0aGUgdmFsdWUgZGVzY3JpYmVzIHRoZSB0eXBlIG9mIGluZGV4IGZvciB0aGF0IGZpZWxkLiBGb3IgYW4gYXNjZW5kaW5nIGluZGV4IG9uIGEgZmllbGQsIHNwZWNpZnkgYSB2YWx1ZSBvZiBgMWA7IGZvciBkZXNjZW5kaW5nIGluZGV4LCBzcGVjaWZ5IGEgdmFsdWUgb2YgYC0xYC4gVXNlIGB0ZXh0YCBmb3IgdGV4dCBpbmRleGVzLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIEFsbCBvcHRpb25zIGFyZSBsaXN0ZWQgaW4gW01vbmdvREIgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9yZWZlcmVuY2UvbWV0aG9kL2RiLmNvbGxlY3Rpb24uY3JlYXRlSW5kZXgvI29wdGlvbnMpXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLm5hbWUgTmFtZSBvZiB0aGUgaW5kZXhcbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLnVuaXF1ZSBEZWZpbmUgdGhhdCB0aGUgaW5kZXggdmFsdWVzIG11c3QgYmUgdW5pcXVlLCBtb3JlIGF0IFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvY29yZS9pbmRleC11bmlxdWUvKVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMuc3BhcnNlIERlZmluZSB0aGF0IHRoZSBpbmRleCBpcyBzcGFyc2UsIG1vcmUgYXQgW01vbmdvREIgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9jb3JlL2luZGV4LXNwYXJzZS8pXG4gICAqL1xuICBjcmVhdGVJbmRleChpbmRleCwgb3B0aW9ucyl7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlSW5kZXhBc3luYyhpbmRleCwgb3B0aW9ucyk7XG4gIH0sXG5cbiAgYXN5bmMgZHJvcEluZGV4QXN5bmMoaW5kZXgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFzZWxmLl9jb2xsZWN0aW9uLmRyb3BJbmRleEFzeW5jKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gb25seSBjYWxsIGRyb3BJbmRleEFzeW5jIG9uIHNlcnZlciBjb2xsZWN0aW9ucycpO1xuICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uZHJvcEluZGV4QXN5bmMoaW5kZXgpO1xuICB9LFxufSIsImV4cG9ydCBjb25zdCBSZXBsaWNhdGlvbk1ldGhvZHMgPSB7XG4gIGFzeW5jIF9tYXliZVNldFVwUmVwbGljYXRpb24obmFtZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGlmIChcbiAgICAgICEoXG4gICAgICAgIHNlbGYuX2Nvbm5lY3Rpb24gJiZcbiAgICAgICAgc2VsZi5fY29ubmVjdGlvbi5yZWdpc3RlclN0b3JlQ2xpZW50ICYmXG4gICAgICAgIHNlbGYuX2Nvbm5lY3Rpb24ucmVnaXN0ZXJTdG9yZVNlcnZlclxuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuXG4gICAgY29uc3Qgd3JhcHBlZFN0b3JlQ29tbW9uID0ge1xuICAgICAgLy8gQ2FsbGVkIGFyb3VuZCBtZXRob2Qgc3R1YiBpbnZvY2F0aW9ucyB0byBjYXB0dXJlIHRoZSBvcmlnaW5hbCB2ZXJzaW9uc1xuICAgICAgLy8gb2YgbW9kaWZpZWQgZG9jdW1lbnRzLlxuICAgICAgc2F2ZU9yaWdpbmFscygpIHtcbiAgICAgICAgc2VsZi5fY29sbGVjdGlvbi5zYXZlT3JpZ2luYWxzKCk7XG4gICAgICB9LFxuICAgICAgcmV0cmlldmVPcmlnaW5hbHMoKSB7XG4gICAgICAgIHJldHVybiBzZWxmLl9jb2xsZWN0aW9uLnJldHJpZXZlT3JpZ2luYWxzKCk7XG4gICAgICB9LFxuICAgICAgLy8gVG8gYmUgYWJsZSB0byBnZXQgYmFjayB0byB0aGUgY29sbGVjdGlvbiBmcm9tIHRoZSBzdG9yZS5cbiAgICAgIF9nZXRDb2xsZWN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH0sXG4gICAgfTtcbiAgICBjb25zdCB3cmFwcGVkU3RvcmVDbGllbnQgPSB7XG4gICAgICAvLyBDYWxsZWQgYXQgdGhlIGJlZ2lubmluZyBvZiBhIGJhdGNoIG9mIHVwZGF0ZXMuIGJhdGNoU2l6ZSBpcyB0aGUgbnVtYmVyXG4gICAgICAvLyBvZiB1cGRhdGUgY2FsbHMgdG8gZXhwZWN0LlxuICAgICAgLy9cbiAgICAgIC8vIFhYWCBUaGlzIGludGVyZmFjZSBpcyBwcmV0dHkgamFua3kuIHJlc2V0IHByb2JhYmx5IG91Z2h0IHRvIGdvIGJhY2sgdG9cbiAgICAgIC8vIGJlaW5nIGl0cyBvd24gZnVuY3Rpb24sIGFuZCBjYWxsZXJzIHNob3VsZG4ndCBoYXZlIHRvIGNhbGN1bGF0ZVxuICAgICAgLy8gYmF0Y2hTaXplLiBUaGUgb3B0aW1pemF0aW9uIG9mIG5vdCBjYWxsaW5nIHBhdXNlL3JlbW92ZSBzaG91bGQgYmVcbiAgICAgIC8vIGRlbGF5ZWQgdW50aWwgbGF0ZXI6IHRoZSBmaXJzdCBjYWxsIHRvIHVwZGF0ZSgpIHNob3VsZCBidWZmZXIgaXRzXG4gICAgICAvLyBtZXNzYWdlLCBhbmQgdGhlbiB3ZSBjYW4gZWl0aGVyIGRpcmVjdGx5IGFwcGx5IGl0IGF0IGVuZFVwZGF0ZSB0aW1lIGlmXG4gICAgICAvLyBpdCB3YXMgdGhlIG9ubHkgdXBkYXRlLCBvciBkbyBwYXVzZU9ic2VydmVycy9hcHBseS9hcHBseSBhdCB0aGUgbmV4dFxuICAgICAgLy8gdXBkYXRlKCkgaWYgdGhlcmUncyBhbm90aGVyIG9uZS5cbiAgICAgIGFzeW5jIGJlZ2luVXBkYXRlKGJhdGNoU2l6ZSwgcmVzZXQpIHtcbiAgICAgICAgLy8gcGF1c2Ugb2JzZXJ2ZXJzIHNvIHVzZXJzIGRvbid0IHNlZSBmbGlja2VyIHdoZW4gdXBkYXRpbmcgc2V2ZXJhbFxuICAgICAgICAvLyBvYmplY3RzIGF0IG9uY2UgKGluY2x1ZGluZyB0aGUgcG9zdC1yZWNvbm5lY3QgcmVzZXQtYW5kLXJlYXBwbHlcbiAgICAgICAgLy8gc3RhZ2UpLCBhbmQgc28gdGhhdCBhIHJlLXNvcnRpbmcgb2YgYSBxdWVyeSBjYW4gdGFrZSBhZHZhbnRhZ2Ugb2YgdGhlXG4gICAgICAgIC8vIGZ1bGwgX2RpZmZRdWVyeSBtb3ZlZCBjYWxjdWxhdGlvbiBpbnN0ZWFkIG9mIGFwcGx5aW5nIGNoYW5nZSBvbmUgYXQgYVxuICAgICAgICAvLyB0aW1lLlxuICAgICAgICBpZiAoYmF0Y2hTaXplID4gMSB8fCByZXNldCkgc2VsZi5fY29sbGVjdGlvbi5wYXVzZU9ic2VydmVycygpO1xuXG4gICAgICAgIGlmIChyZXNldCkgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5yZW1vdmUoe30pO1xuICAgICAgfSxcblxuICAgICAgLy8gQXBwbHkgYW4gdXBkYXRlLlxuICAgICAgLy8gWFhYIGJldHRlciBzcGVjaWZ5IHRoaXMgaW50ZXJmYWNlIChub3QgaW4gdGVybXMgb2YgYSB3aXJlIG1lc3NhZ2UpP1xuICAgICAgdXBkYXRlKG1zZykge1xuICAgICAgICB2YXIgbW9uZ29JZCA9IE1vbmdvSUQuaWRQYXJzZShtc2cuaWQpO1xuICAgICAgICB2YXIgZG9jID0gc2VsZi5fY29sbGVjdGlvbi5fZG9jcy5nZXQobW9uZ29JZCk7XG5cbiAgICAgICAgLy9XaGVuIHRoZSBzZXJ2ZXIncyBtZXJnZWJveCBpcyBkaXNhYmxlZCBmb3IgYSBjb2xsZWN0aW9uLCB0aGUgY2xpZW50IG11c3QgZ3JhY2VmdWxseSBoYW5kbGUgaXQgd2hlbjpcbiAgICAgICAgLy8gKldlIHJlY2VpdmUgYW4gYWRkZWQgbWVzc2FnZSBmb3IgYSBkb2N1bWVudCB0aGF0IGlzIGFscmVhZHkgdGhlcmUuIEluc3RlYWQsIGl0IHdpbGwgYmUgY2hhbmdlZFxuICAgICAgICAvLyAqV2UgcmVlaXZlIGEgY2hhbmdlIG1lc3NhZ2UgZm9yIGEgZG9jdW1lbnQgdGhhdCBpcyBub3QgdGhlcmUuIEluc3RlYWQsIGl0IHdpbGwgYmUgYWRkZWRcbiAgICAgICAgLy8gKldlIHJlY2VpdmUgYSByZW1vdmVkIG1lc3NzYWdlIGZvciBhIGRvY3VtZW50IHRoYXQgaXMgbm90IHRoZXJlLiBJbnN0ZWFkLCBub3Rpbmcgd2lsIGhhcHBlbi5cblxuICAgICAgICAvL0NvZGUgaXMgZGVyaXZlZCBmcm9tIGNsaWVudC1zaWRlIGNvZGUgb3JpZ2luYWxseSBpbiBwZWVybGlicmFyeTpjb250cm9sLW1lcmdlYm94XG4gICAgICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL3BlZXJsaWJyYXJ5L21ldGVvci1jb250cm9sLW1lcmdlYm94L2Jsb2IvbWFzdGVyL2NsaWVudC5jb2ZmZWVcblxuICAgICAgICAvL0ZvciBtb3JlIGluZm9ybWF0aW9uLCByZWZlciB0byBkaXNjdXNzaW9uIFwiSW5pdGlhbCBzdXBwb3J0IGZvciBwdWJsaWNhdGlvbiBzdHJhdGVnaWVzIGluIGxpdmVkYXRhIHNlcnZlclwiOlxuICAgICAgICAvL2h0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL3B1bGwvMTExNTFcbiAgICAgICAgaWYgKE1ldGVvci5pc0NsaWVudCkge1xuICAgICAgICAgIGlmIChtc2cubXNnID09PSAnYWRkZWQnICYmIGRvYykge1xuICAgICAgICAgICAgbXNnLm1zZyA9ICdjaGFuZ2VkJztcbiAgICAgICAgICB9IGVsc2UgaWYgKG1zZy5tc2cgPT09ICdyZW1vdmVkJyAmJiAhZG9jKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIGlmIChtc2cubXNnID09PSAnY2hhbmdlZCcgJiYgIWRvYykge1xuICAgICAgICAgICAgbXNnLm1zZyA9ICdhZGRlZCc7XG4gICAgICAgICAgICBjb25zdCBfcmVmID0gbXNnLmZpZWxkcztcbiAgICAgICAgICAgIGZvciAobGV0IGZpZWxkIGluIF9yZWYpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBfcmVmW2ZpZWxkXTtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgbXNnLmZpZWxkc1tmaWVsZF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSXMgdGhpcyBhIFwicmVwbGFjZSB0aGUgd2hvbGUgZG9jXCIgbWVzc2FnZSBjb21pbmcgZnJvbSB0aGUgcXVpZXNjZW5jZVxuICAgICAgICAvLyBvZiBtZXRob2Qgd3JpdGVzIHRvIGFuIG9iamVjdD8gKE5vdGUgdGhhdCAndW5kZWZpbmVkJyBpcyBhIHZhbGlkXG4gICAgICAgIC8vIHZhbHVlIG1lYW5pbmcgXCJyZW1vdmUgaXRcIi4pXG4gICAgICAgIGlmIChtc2cubXNnID09PSAncmVwbGFjZScpIHtcbiAgICAgICAgICB2YXIgcmVwbGFjZSA9IG1zZy5yZXBsYWNlO1xuICAgICAgICAgIGlmICghcmVwbGFjZSkge1xuICAgICAgICAgICAgaWYgKGRvYykgc2VsZi5fY29sbGVjdGlvbi5yZW1vdmUobW9uZ29JZCk7XG4gICAgICAgICAgfSBlbHNlIGlmICghZG9jKSB7XG4gICAgICAgICAgICBzZWxmLl9jb2xsZWN0aW9uLmluc2VydChyZXBsYWNlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gWFhYIGNoZWNrIHRoYXQgcmVwbGFjZSBoYXMgbm8gJCBvcHNcbiAgICAgICAgICAgIHNlbGYuX2NvbGxlY3Rpb24udXBkYXRlKG1vbmdvSWQsIHJlcGxhY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLm1zZyA9PT0gJ2FkZGVkJykge1xuICAgICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0V4cGVjdGVkIG5vdCB0byBmaW5kIGEgZG9jdW1lbnQgYWxyZWFkeSBwcmVzZW50IGZvciBhbiBhZGQnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLl9jb2xsZWN0aW9uLmluc2VydCh7IF9pZDogbW9uZ29JZCwgLi4ubXNnLmZpZWxkcyB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChtc2cubXNnID09PSAncmVtb3ZlZCcpIHtcbiAgICAgICAgICBpZiAoIWRvYylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0V4cGVjdGVkIHRvIGZpbmQgYSBkb2N1bWVudCBhbHJlYWR5IHByZXNlbnQgZm9yIHJlbW92ZWQnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIHNlbGYuX2NvbGxlY3Rpb24ucmVtb3ZlKG1vbmdvSWQpO1xuICAgICAgICB9IGVsc2UgaWYgKG1zZy5tc2cgPT09ICdjaGFuZ2VkJykge1xuICAgICAgICAgIGlmICghZG9jKSB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRvIGZpbmQgYSBkb2N1bWVudCB0byBjaGFuZ2UnKTtcbiAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMobXNnLmZpZWxkcyk7XG4gICAgICAgICAgaWYgKGtleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIG1vZGlmaWVyID0ge307XG4gICAgICAgICAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBtc2cuZmllbGRzW2tleV07XG4gICAgICAgICAgICAgIGlmIChFSlNPTi5lcXVhbHMoZG9jW2tleV0sIHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGlmICghbW9kaWZpZXIuJHVuc2V0KSB7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllci4kdW5zZXQgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbW9kaWZpZXIuJHVuc2V0W2tleV0gPSAxO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghbW9kaWZpZXIuJHNldCkge1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZXIuJHNldCA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtb2RpZmllci4kc2V0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMobW9kaWZpZXIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgc2VsZi5fY29sbGVjdGlvbi51cGRhdGUobW9uZ29JZCwgbW9kaWZpZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJIGRvbid0IGtub3cgaG93IHRvIGRlYWwgd2l0aCB0aGlzIG1lc3NhZ2VcIik7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIENhbGxlZCBhdCB0aGUgZW5kIG9mIGEgYmF0Y2ggb2YgdXBkYXRlcy5saXZlZGF0YV9jb25uZWN0aW9uLmpzOjEyODdcbiAgICAgIGVuZFVwZGF0ZSgpIHtcbiAgICAgICAgc2VsZi5fY29sbGVjdGlvbi5yZXN1bWVPYnNlcnZlcnNDbGllbnQoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIFVzZWQgdG8gcHJlc2VydmUgY3VycmVudCB2ZXJzaW9ucyBvZiBkb2N1bWVudHMgYWNyb3NzIGEgc3RvcmUgcmVzZXQuXG4gICAgICBnZXREb2MoaWQpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuZmluZE9uZShpZCk7XG4gICAgICB9LFxuXG4gICAgICAuLi53cmFwcGVkU3RvcmVDb21tb24sXG4gICAgfTtcbiAgICBjb25zdCB3cmFwcGVkU3RvcmVTZXJ2ZXIgPSB7XG4gICAgICBhc3luYyBiZWdpblVwZGF0ZShiYXRjaFNpemUsIHJlc2V0KSB7XG4gICAgICAgIGlmIChiYXRjaFNpemUgPiAxIHx8IHJlc2V0KSBzZWxmLl9jb2xsZWN0aW9uLnBhdXNlT2JzZXJ2ZXJzKCk7XG5cbiAgICAgICAgaWYgKHJlc2V0KSBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLnJlbW92ZUFzeW5jKHt9KTtcbiAgICAgIH0sXG5cbiAgICAgIGFzeW5jIHVwZGF0ZShtc2cpIHtcbiAgICAgICAgdmFyIG1vbmdvSWQgPSBNb25nb0lELmlkUGFyc2UobXNnLmlkKTtcbiAgICAgICAgdmFyIGRvYyA9IHNlbGYuX2NvbGxlY3Rpb24uX2RvY3MuZ2V0KG1vbmdvSWQpO1xuXG4gICAgICAgIC8vIElzIHRoaXMgYSBcInJlcGxhY2UgdGhlIHdob2xlIGRvY1wiIG1lc3NhZ2UgY29taW5nIGZyb20gdGhlIHF1aWVzY2VuY2VcbiAgICAgICAgLy8gb2YgbWV0aG9kIHdyaXRlcyB0byBhbiBvYmplY3Q/IChOb3RlIHRoYXQgJ3VuZGVmaW5lZCcgaXMgYSB2YWxpZFxuICAgICAgICAvLyB2YWx1ZSBtZWFuaW5nIFwicmVtb3ZlIGl0XCIuKVxuICAgICAgICBpZiAobXNnLm1zZyA9PT0gJ3JlcGxhY2UnKSB7XG4gICAgICAgICAgdmFyIHJlcGxhY2UgPSBtc2cucmVwbGFjZTtcbiAgICAgICAgICBpZiAoIXJlcGxhY2UpIHtcbiAgICAgICAgICAgIGlmIChkb2MpIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24ucmVtb3ZlQXN5bmMobW9uZ29JZCk7XG4gICAgICAgICAgfSBlbHNlIGlmICghZG9jKSB7XG4gICAgICAgICAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLmluc2VydEFzeW5jKHJlcGxhY2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBYWFggY2hlY2sgdGhhdCByZXBsYWNlIGhhcyBubyAkIG9wc1xuICAgICAgICAgICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi51cGRhdGVBc3luYyhtb25nb0lkLCByZXBsYWNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKG1zZy5tc2cgPT09ICdhZGRlZCcpIHtcbiAgICAgICAgICBpZiAoZG9jKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICdFeHBlY3RlZCBub3QgdG8gZmluZCBhIGRvY3VtZW50IGFscmVhZHkgcHJlc2VudCBmb3IgYW4gYWRkJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5pbnNlcnRBc3luYyh7IF9pZDogbW9uZ29JZCwgLi4ubXNnLmZpZWxkcyB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChtc2cubXNnID09PSAncmVtb3ZlZCcpIHtcbiAgICAgICAgICBpZiAoIWRvYylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0V4cGVjdGVkIHRvIGZpbmQgYSBkb2N1bWVudCBhbHJlYWR5IHByZXNlbnQgZm9yIHJlbW92ZWQnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24ucmVtb3ZlQXN5bmMobW9uZ29JZCk7XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLm1zZyA9PT0gJ2NoYW5nZWQnKSB7XG4gICAgICAgICAgaWYgKCFkb2MpIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdG8gZmluZCBhIGRvY3VtZW50IHRvIGNoYW5nZScpO1xuICAgICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhtc2cuZmllbGRzKTtcbiAgICAgICAgICBpZiAoa2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgbW9kaWZpZXIgPSB7fTtcbiAgICAgICAgICAgIGtleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG1zZy5maWVsZHNba2V5XTtcbiAgICAgICAgICAgICAgaWYgKEVKU09OLmVxdWFscyhkb2Nba2V5XSwgdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtb2RpZmllci4kdW5zZXQpIHtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVyLiR1bnNldCA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtb2RpZmllci4kdW5zZXRba2V5XSA9IDE7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtb2RpZmllci4kc2V0KSB7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllci4kc2V0ID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1vZGlmaWVyLiRzZXRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhtb2RpZmllcikubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLnVwZGF0ZUFzeW5jKG1vbmdvSWQsIG1vZGlmaWVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSSBkb24ndCBrbm93IGhvdyB0byBkZWFsIHdpdGggdGhpcyBtZXNzYWdlXCIpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBDYWxsZWQgYXQgdGhlIGVuZCBvZiBhIGJhdGNoIG9mIHVwZGF0ZXMuXG4gICAgICBhc3luYyBlbmRVcGRhdGUoKSB7XG4gICAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24ucmVzdW1lT2JzZXJ2ZXJzU2VydmVyKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBVc2VkIHRvIHByZXNlcnZlIGN1cnJlbnQgdmVyc2lvbnMgb2YgZG9jdW1lbnRzIGFjcm9zcyBhIHN0b3JlIHJlc2V0LlxuICAgICAgYXN5bmMgZ2V0RG9jKGlkKSB7XG4gICAgICAgIHJldHVybiBzZWxmLmZpbmRPbmVBc3luYyhpZCk7XG4gICAgICB9LFxuICAgICAgLi4ud3JhcHBlZFN0b3JlQ29tbW9uLFxuICAgIH07XG5cblxuICAgIC8vIE9LLCB3ZSdyZSBnb2luZyB0byBiZSBhIHNsYXZlLCByZXBsaWNhdGluZyBzb21lIHJlbW90ZVxuICAgIC8vIGRhdGFiYXNlLCBleGNlcHQgcG9zc2libHkgd2l0aCBzb21lIHRlbXBvcmFyeSBkaXZlcmdlbmNlIHdoaWxlXG4gICAgLy8gd2UgaGF2ZSB1bmFja25vd2xlZGdlZCBSUEMncy5cbiAgICBsZXQgcmVnaXN0ZXJTdG9yZVJlc3VsdDtcbiAgICBpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG4gICAgICByZWdpc3RlclN0b3JlUmVzdWx0ID0gc2VsZi5fY29ubmVjdGlvbi5yZWdpc3RlclN0b3JlQ2xpZW50KFxuICAgICAgICBuYW1lLFxuICAgICAgICB3cmFwcGVkU3RvcmVDbGllbnRcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZ2lzdGVyU3RvcmVSZXN1bHQgPSBzZWxmLl9jb25uZWN0aW9uLnJlZ2lzdGVyU3RvcmVTZXJ2ZXIoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHdyYXBwZWRTdG9yZVNlcnZlclxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlID0gYFRoZXJlIGlzIGFscmVhZHkgYSBjb2xsZWN0aW9uIG5hbWVkIFwiJHtuYW1lfVwiYDtcbiAgICBjb25zdCBsb2dXYXJuID0gKCkgPT4ge1xuICAgICAgY29uc29sZS53YXJuID8gY29uc29sZS53YXJuKG1lc3NhZ2UpIDogY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgfTtcblxuICAgIGlmICghcmVnaXN0ZXJTdG9yZVJlc3VsdCkge1xuICAgICAgcmV0dXJuIGxvZ1dhcm4oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVnaXN0ZXJTdG9yZVJlc3VsdD8udGhlbj8uKG9rID0+IHtcbiAgICAgIGlmICghb2spIHtcbiAgICAgICAgbG9nV2FybigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxufSIsImV4cG9ydCBjb25zdCBTeW5jTWV0aG9kcyA9IHtcbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEZpbmQgdGhlIGRvY3VtZW50cyBpbiBhIGNvbGxlY3Rpb24gdGhhdCBtYXRjaCB0aGUgc2VsZWN0b3IuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIGZpbmRcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gW3NlbGVjdG9yXSBBIHF1ZXJ5IGRlc2NyaWJpbmcgdGhlIGRvY3VtZW50cyB0byBmaW5kXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtNb25nb1NvcnRTcGVjaWZpZXJ9IG9wdGlvbnMuc29ydCBTb3J0IG9yZGVyIChkZWZhdWx0OiBuYXR1cmFsIG9yZGVyKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5za2lwIE51bWJlciBvZiByZXN1bHRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZ1xuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5saW1pdCBNYXhpbXVtIG51bWJlciBvZiByZXN1bHRzIHRvIHJldHVyblxuICAgKiBAcGFyYW0ge01vbmdvRmllbGRTcGVjaWZpZXJ9IG9wdGlvbnMuZmllbGRzIERpY3Rpb25hcnkgb2YgZmllbGRzIHRvIHJldHVybiBvciBleGNsdWRlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMucmVhY3RpdmUgKENsaWVudCBvbmx5KSBEZWZhdWx0IGB0cnVlYDsgcGFzcyBgZmFsc2VgIHRvIGRpc2FibGUgcmVhY3Rpdml0eVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLnRyYW5zZm9ybSBPdmVycmlkZXMgYHRyYW5zZm9ybWAgb24gdGhlICBbYENvbGxlY3Rpb25gXSgjY29sbGVjdGlvbnMpIGZvciB0aGlzIGN1cnNvci4gIFBhc3MgYG51bGxgIHRvIGRpc2FibGUgdHJhbnNmb3JtYXRpb24uXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5kaXNhYmxlT3Bsb2cgKFNlcnZlciBvbmx5KSBQYXNzIHRydWUgdG8gZGlzYWJsZSBvcGxvZy10YWlsaW5nIG9uIHRoaXMgcXVlcnkuIFRoaXMgYWZmZWN0cyB0aGUgd2F5IHNlcnZlciBwcm9jZXNzZXMgY2FsbHMgdG8gYG9ic2VydmVgIG9uIHRoaXMgcXVlcnkuIERpc2FibGluZyB0aGUgb3Bsb2cgY2FuIGJlIHVzZWZ1bCB3aGVuIHdvcmtpbmcgd2l0aCBkYXRhIHRoYXQgdXBkYXRlcyBpbiBsYXJnZSBiYXRjaGVzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5wb2xsaW5nSW50ZXJ2YWxNcyAoU2VydmVyIG9ubHkpIFdoZW4gb3Bsb2cgaXMgZGlzYWJsZWQgKHRocm91Z2ggdGhlIHVzZSBvZiBgZGlzYWJsZU9wbG9nYCBvciB3aGVuIG90aGVyd2lzZSBub3QgYXZhaWxhYmxlKSwgdGhlIGZyZXF1ZW5jeSAoaW4gbWlsbGlzZWNvbmRzKSBvZiBob3cgb2Z0ZW4gdG8gcG9sbCB0aGlzIHF1ZXJ5IHdoZW4gb2JzZXJ2aW5nIG9uIHRoZSBzZXJ2ZXIuIERlZmF1bHRzIHRvIDEwMDAwbXMgKDEwIHNlY29uZHMpLlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5wb2xsaW5nVGhyb3R0bGVNcyAoU2VydmVyIG9ubHkpIFdoZW4gb3Bsb2cgaXMgZGlzYWJsZWQgKHRocm91Z2ggdGhlIHVzZSBvZiBgZGlzYWJsZU9wbG9nYCBvciB3aGVuIG90aGVyd2lzZSBub3QgYXZhaWxhYmxlKSwgdGhlIG1pbmltdW0gdGltZSAoaW4gbWlsbGlzZWNvbmRzKSB0byBhbGxvdyBiZXR3ZWVuIHJlLXBvbGxpbmcgd2hlbiBvYnNlcnZpbmcgb24gdGhlIHNlcnZlci4gSW5jcmVhc2luZyB0aGlzIHdpbGwgc2F2ZSBDUFUgYW5kIG1vbmdvIGxvYWQgYXQgdGhlIGV4cGVuc2Ugb2Ygc2xvd2VyIHVwZGF0ZXMgdG8gdXNlcnMuIERlY3JlYXNpbmcgdGhpcyBpcyBub3QgcmVjb21tZW5kZWQuIERlZmF1bHRzIHRvIDUwbXMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLm1heFRpbWVNcyAoU2VydmVyIG9ubHkpIElmIHNldCwgaW5zdHJ1Y3RzIE1vbmdvREIgdG8gc2V0IGEgdGltZSBsaW1pdCBmb3IgdGhpcyBjdXJzb3IncyBvcGVyYXRpb25zLiBJZiB0aGUgb3BlcmF0aW9uIHJlYWNoZXMgdGhlIHNwZWNpZmllZCB0aW1lIGxpbWl0IChpbiBtaWxsaXNlY29uZHMpIHdpdGhvdXQgdGhlIGhhdmluZyBiZWVuIGNvbXBsZXRlZCwgYW4gZXhjZXB0aW9uIHdpbGwgYmUgdGhyb3duLiBVc2VmdWwgdG8gcHJldmVudCBhbiAoYWNjaWRlbnRhbCBvciBtYWxpY2lvdXMpIHVub3B0aW1pemVkIHF1ZXJ5IGZyb20gY2F1c2luZyBhIGZ1bGwgY29sbGVjdGlvbiBzY2FuIHRoYXQgd291bGQgZGlzcnVwdCBvdGhlciBkYXRhYmFzZSB1c2VycywgYXQgdGhlIGV4cGVuc2Ugb2YgbmVlZGluZyB0byBoYW5kbGUgdGhlIHJlc3VsdGluZyBlcnJvci5cbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBvcHRpb25zLmhpbnQgKFNlcnZlciBvbmx5KSBPdmVycmlkZXMgTW9uZ29EQidzIGRlZmF1bHQgaW5kZXggc2VsZWN0aW9uIGFuZCBxdWVyeSBvcHRpbWl6YXRpb24gcHJvY2Vzcy4gU3BlY2lmeSBhbiBpbmRleCB0byBmb3JjZSBpdHMgdXNlLCBlaXRoZXIgYnkgaXRzIG5hbWUgb3IgaW5kZXggc3BlY2lmaWNhdGlvbi4gWW91IGNhbiBhbHNvIHNwZWNpZnkgYHsgJG5hdHVyYWwgOiAxIH1gIHRvIGZvcmNlIGEgZm9yd2FyZHMgY29sbGVjdGlvbiBzY2FuLCBvciBgeyAkbmF0dXJhbCA6IC0xIH1gIGZvciBhIHJldmVyc2UgY29sbGVjdGlvbiBzY2FuLiBTZXR0aW5nIHRoaXMgaXMgb25seSByZWNvbW1lbmRlZCBmb3IgYWR2YW5jZWQgdXNlcnMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLnJlYWRQcmVmZXJlbmNlIChTZXJ2ZXIgb25seSkgU3BlY2lmaWVzIGEgY3VzdG9tIE1vbmdvREIgW2ByZWFkUHJlZmVyZW5jZWBdKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvY29yZS9yZWFkLXByZWZlcmVuY2UpIGZvciB0aGlzIHBhcnRpY3VsYXIgY3Vyc29yLiBQb3NzaWJsZSB2YWx1ZXMgYXJlIGBwcmltYXJ5YCwgYHByaW1hcnlQcmVmZXJyZWRgLCBgc2Vjb25kYXJ5YCwgYHNlY29uZGFyeVByZWZlcnJlZGAgYW5kIGBuZWFyZXN0YC5cbiAgICogQHJldHVybnMge01vbmdvLkN1cnNvcn1cbiAgICovXG4gIGZpbmQoLi4uYXJncykge1xuICAgIC8vIENvbGxlY3Rpb24uZmluZCgpIChyZXR1cm4gYWxsIGRvY3MpIGJlaGF2ZXMgZGlmZmVyZW50bHlcbiAgICAvLyBmcm9tIENvbGxlY3Rpb24uZmluZCh1bmRlZmluZWQpIChyZXR1cm4gMCBkb2NzKS4gIHNvIGJlXG4gICAgLy8gY2FyZWZ1bCBhYm91dCB0aGUgbGVuZ3RoIG9mIGFyZ3VtZW50cy5cbiAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbi5maW5kKFxuICAgICAgdGhpcy5fZ2V0RmluZFNlbGVjdG9yKGFyZ3MpLFxuICAgICAgdGhpcy5fZ2V0RmluZE9wdGlvbnMoYXJncylcbiAgICApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBGaW5kcyB0aGUgZmlyc3QgZG9jdW1lbnQgdGhhdCBtYXRjaGVzIHRoZSBzZWxlY3RvciwgYXMgb3JkZXJlZCBieSBzb3J0IGFuZCBza2lwIG9wdGlvbnMuIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgbm8gbWF0Y2hpbmcgZG9jdW1lbnQgaXMgZm91bmQuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIGZpbmRPbmVcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gW3NlbGVjdG9yXSBBIHF1ZXJ5IGRlc2NyaWJpbmcgdGhlIGRvY3VtZW50cyB0byBmaW5kXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtNb25nb1NvcnRTcGVjaWZpZXJ9IG9wdGlvbnMuc29ydCBTb3J0IG9yZGVyIChkZWZhdWx0OiBuYXR1cmFsIG9yZGVyKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5za2lwIE51bWJlciBvZiByZXN1bHRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZ1xuICAgKiBAcGFyYW0ge01vbmdvRmllbGRTcGVjaWZpZXJ9IG9wdGlvbnMuZmllbGRzIERpY3Rpb25hcnkgb2YgZmllbGRzIHRvIHJldHVybiBvciBleGNsdWRlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMucmVhY3RpdmUgKENsaWVudCBvbmx5KSBEZWZhdWx0IHRydWU7IHBhc3MgZmFsc2UgdG8gZGlzYWJsZSByZWFjdGl2aXR5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbnMudHJhbnNmb3JtIE92ZXJyaWRlcyBgdHJhbnNmb3JtYCBvbiB0aGUgW2BDb2xsZWN0aW9uYF0oI2NvbGxlY3Rpb25zKSBmb3IgdGhpcyBjdXJzb3IuICBQYXNzIGBudWxsYCB0byBkaXNhYmxlIHRyYW5zZm9ybWF0aW9uLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5yZWFkUHJlZmVyZW5jZSAoU2VydmVyIG9ubHkpIFNwZWNpZmllcyBhIGN1c3RvbSBNb25nb0RCIFtgcmVhZFByZWZlcmVuY2VgXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvcmVhZC1wcmVmZXJlbmNlKSBmb3IgZmV0Y2hpbmcgdGhlIGRvY3VtZW50LiBQb3NzaWJsZSB2YWx1ZXMgYXJlIGBwcmltYXJ5YCwgYHByaW1hcnlQcmVmZXJyZWRgLCBgc2Vjb25kYXJ5YCwgYHNlY29uZGFyeVByZWZlcnJlZGAgYW5kIGBuZWFyZXN0YC5cbiAgICogQHJldHVybnMge09iamVjdH1cbiAgICovXG4gIGZpbmRPbmUoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLl9jb2xsZWN0aW9uLmZpbmRPbmUoXG4gICAgICB0aGlzLl9nZXRGaW5kU2VsZWN0b3IoYXJncyksXG4gICAgICB0aGlzLl9nZXRGaW5kT3B0aW9ucyhhcmdzKVxuICAgICk7XG4gIH0sXG5cblxuICAvLyAnaW5zZXJ0JyBpbW1lZGlhdGVseSByZXR1cm5zIHRoZSBpbnNlcnRlZCBkb2N1bWVudCdzIG5ldyBfaWQuXG4gIC8vIFRoZSBvdGhlcnMgcmV0dXJuIHZhbHVlcyBpbW1lZGlhdGVseSBpZiB5b3UgYXJlIGluIGEgc3R1YiwgYW4gaW4tbWVtb3J5XG4gIC8vIHVubWFuYWdlZCBjb2xsZWN0aW9uLCBvciBhIG1vbmdvLWJhY2tlZCBjb2xsZWN0aW9uIGFuZCB5b3UgZG9uJ3QgcGFzcyBhXG4gIC8vIGNhbGxiYWNrLiAndXBkYXRlJyBhbmQgJ3JlbW92ZScgcmV0dXJuIHRoZSBudW1iZXIgb2YgYWZmZWN0ZWRcbiAgLy8gZG9jdW1lbnRzLiAndXBzZXJ0JyByZXR1cm5zIGFuIG9iamVjdCB3aXRoIGtleXMgJ251bWJlckFmZmVjdGVkJyBhbmQsIGlmIGFuXG4gIC8vIGluc2VydCBoYXBwZW5lZCwgJ2luc2VydGVkSWQnLlxuICAvL1xuICAvLyBPdGhlcndpc2UsIHRoZSBzZW1hbnRpY3MgYXJlIGV4YWN0bHkgbGlrZSBvdGhlciBtZXRob2RzOiB0aGV5IHRha2VcbiAgLy8gYSBjYWxsYmFjayBhcyBhbiBvcHRpb25hbCBsYXN0IGFyZ3VtZW50OyBpZiBubyBjYWxsYmFjayBpc1xuICAvLyBwcm92aWRlZCwgdGhleSBibG9jayB1bnRpbCB0aGUgb3BlcmF0aW9uIGlzIGNvbXBsZXRlLCBhbmQgdGhyb3cgYW5cbiAgLy8gZXhjZXB0aW9uIGlmIGl0IGZhaWxzOyBpZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkLCB0aGVuIHRoZXkgZG9uJ3RcbiAgLy8gbmVjZXNzYXJpbHkgYmxvY2ssIGFuZCB0aGV5IGNhbGwgdGhlIGNhbGxiYWNrIHdoZW4gdGhleSBmaW5pc2ggd2l0aCBlcnJvciBhbmRcbiAgLy8gcmVzdWx0IGFyZ3VtZW50cy4gIChUaGUgaW5zZXJ0IG1ldGhvZCBwcm92aWRlcyB0aGUgZG9jdW1lbnQgSUQgYXMgaXRzIHJlc3VsdDtcbiAgLy8gdXBkYXRlIGFuZCByZW1vdmUgcHJvdmlkZSB0aGUgbnVtYmVyIG9mIGFmZmVjdGVkIGRvY3MgYXMgdGhlIHJlc3VsdDsgdXBzZXJ0XG4gIC8vIHByb3ZpZGVzIGFuIG9iamVjdCB3aXRoIG51bWJlckFmZmVjdGVkIGFuZCBtYXliZSBpbnNlcnRlZElkLilcbiAgLy9cbiAgLy8gT24gdGhlIGNsaWVudCwgYmxvY2tpbmcgaXMgaW1wb3NzaWJsZSwgc28gaWYgYSBjYWxsYmFja1xuICAvLyBpc24ndCBwcm92aWRlZCwgdGhleSBqdXN0IHJldHVybiBpbW1lZGlhdGVseSBhbmQgYW55IGVycm9yXG4gIC8vIGluZm9ybWF0aW9uIGlzIGxvc3QuXG4gIC8vXG4gIC8vIFRoZXJlJ3Mgb25lIG1vcmUgdHdlYWsuIE9uIHRoZSBjbGllbnQsIGlmIHlvdSBkb24ndCBwcm92aWRlIGFcbiAgLy8gY2FsbGJhY2ssIHRoZW4gaWYgdGhlcmUgaXMgYW4gZXJyb3IsIGEgbWVzc2FnZSB3aWxsIGJlIGxvZ2dlZCB3aXRoXG4gIC8vIE1ldGVvci5fZGVidWcuXG4gIC8vXG4gIC8vIFRoZSBpbnRlbnQgKHRob3VnaCB0aGlzIGlzIGFjdHVhbGx5IGRldGVybWluZWQgYnkgdGhlIHVuZGVybHlpbmdcbiAgLy8gZHJpdmVycykgaXMgdGhhdCB0aGUgb3BlcmF0aW9ucyBzaG91bGQgYmUgZG9uZSBzeW5jaHJvbm91c2x5LCBub3RcbiAgLy8gZ2VuZXJhdGluZyB0aGVpciByZXN1bHQgdW50aWwgdGhlIGRhdGFiYXNlIGhhcyBhY2tub3dsZWRnZWRcbiAgLy8gdGhlbS4gSW4gdGhlIGZ1dHVyZSBtYXliZSB3ZSBzaG91bGQgcHJvdmlkZSBhIGZsYWcgdG8gdHVybiB0aGlzXG4gIC8vIG9mZi5cblxuICBfaW5zZXJ0KGRvYywgY2FsbGJhY2spIHtcbiAgICAvLyBNYWtlIHN1cmUgd2Ugd2VyZSBwYXNzZWQgYSBkb2N1bWVudCB0byBpbnNlcnRcbiAgICBpZiAoIWRvYykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnNlcnQgcmVxdWlyZXMgYW4gYXJndW1lbnQnKTtcbiAgICB9XG5cblxuICAgIC8vIE1ha2UgYSBzaGFsbG93IGNsb25lIG9mIHRoZSBkb2N1bWVudCwgcHJlc2VydmluZyBpdHMgcHJvdG90eXBlLlxuICAgIGRvYyA9IE9iamVjdC5jcmVhdGUoXG4gICAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZG9jKSxcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGRvYylcbiAgICApO1xuXG4gICAgaWYgKCdfaWQnIGluIGRvYykge1xuICAgICAgaWYgKFxuICAgICAgICAhZG9jLl9pZCB8fFxuICAgICAgICAhKHR5cGVvZiBkb2MuX2lkID09PSAnc3RyaW5nJyB8fCBkb2MuX2lkIGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SUQpXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdNZXRlb3IgcmVxdWlyZXMgZG9jdW1lbnQgX2lkIGZpZWxkcyB0byBiZSBub24tZW1wdHkgc3RyaW5ncyBvciBPYmplY3RJRHMnXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBnZW5lcmF0ZUlkID0gdHJ1ZTtcblxuICAgICAgLy8gRG9uJ3QgZ2VuZXJhdGUgdGhlIGlkIGlmIHdlJ3JlIHRoZSBjbGllbnQgYW5kIHRoZSAnb3V0ZXJtb3N0JyBjYWxsXG4gICAgICAvLyBUaGlzIG9wdGltaXphdGlvbiBzYXZlcyB1cyBwYXNzaW5nIGJvdGggdGhlIHJhbmRvbVNlZWQgYW5kIHRoZSBpZFxuICAgICAgLy8gUGFzc2luZyBib3RoIGlzIHJlZHVuZGFudC5cbiAgICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgICBjb25zdCBlbmNsb3NpbmcgPSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLmdldCgpO1xuICAgICAgICBpZiAoIWVuY2xvc2luZykge1xuICAgICAgICAgIGdlbmVyYXRlSWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZ2VuZXJhdGVJZCkge1xuICAgICAgICBkb2MuX2lkID0gdGhpcy5fbWFrZU5ld0lEKCk7XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICAvLyBPbiBpbnNlcnRzLCBhbHdheXMgcmV0dXJuIHRoZSBpZCB0aGF0IHdlIGdlbmVyYXRlZDsgb24gYWxsIG90aGVyXG4gICAgLy8gb3BlcmF0aW9ucywganVzdCByZXR1cm4gdGhlIHJlc3VsdCBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICAgIHZhciBjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0ID0gZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICBpZiAoTWV0ZW9yLl9pc1Byb21pc2UocmVzdWx0KSkgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgaWYgKGRvYy5faWQpIHtcbiAgICAgICAgcmV0dXJuIGRvYy5faWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIFhYWCB3aGF0IGlzIHRoaXMgZm9yPz9cbiAgICAgIC8vIEl0J3Mgc29tZSBpdGVyYWN0aW9uIGJldHdlZW4gdGhlIGNhbGxiYWNrIHRvIF9jYWxsTXV0YXRvck1ldGhvZCBhbmRcbiAgICAgIC8vIHRoZSByZXR1cm4gdmFsdWUgY29udmVyc2lvblxuICAgICAgZG9jLl9pZCA9IHJlc3VsdDtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgY29uc3Qgd3JhcHBlZENhbGxiYWNrID0gd3JhcENhbGxiYWNrKFxuICAgICAgY2FsbGJhY2ssXG4gICAgICBjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0XG4gICAgKTtcblxuICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fY2FsbE11dGF0b3JNZXRob2QoJ2luc2VydCcsIFtkb2NdLCB3cmFwcGVkQ2FsbGJhY2spO1xuICAgICAgcmV0dXJuIGNob29zZVJldHVyblZhbHVlRnJvbUNvbGxlY3Rpb25SZXN1bHQocmVzdWx0KTtcbiAgICB9XG5cbiAgICAvLyBpdCdzIG15IGNvbGxlY3Rpb24uICBkZXNjZW5kIGludG8gdGhlIGNvbGxlY3Rpb24gb2JqZWN0XG4gICAgLy8gYW5kIHByb3BhZ2F0ZSBhbnkgZXhjZXB0aW9uLlxuICAgIHRyeSB7XG4gICAgICAvLyBJZiB0aGUgdXNlciBwcm92aWRlZCBhIGNhbGxiYWNrIGFuZCB0aGUgY29sbGVjdGlvbiBpbXBsZW1lbnRzIHRoaXNcbiAgICAgIC8vIG9wZXJhdGlvbiBhc3luY2hyb25vdXNseSwgdGhlbiBxdWVyeVJldCB3aWxsIGJlIHVuZGVmaW5lZCwgYW5kIHRoZVxuICAgICAgLy8gcmVzdWx0IHdpbGwgYmUgcmV0dXJuZWQgdGhyb3VnaCB0aGUgY2FsbGJhY2sgaW5zdGVhZC5cbiAgICAgIGxldCByZXN1bHQ7XG4gICAgICBpZiAoISF3cmFwcGVkQ2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5fY29sbGVjdGlvbi5pbnNlcnQoZG9jLCB3cmFwcGVkQ2FsbGJhY2spO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSB0aGUgY2FsbGJhY2ssIHdlIGFzc3VtZSB0aGUgdXNlciBpcyB1c2luZyB0aGUgcHJvbWlzZS5cbiAgICAgICAgLy8gV2UgY2FuJ3QganVzdCBwYXNzIHRoaXMuX2NvbGxlY3Rpb24uaW5zZXJ0IHRvIHRoZSBwcm9taXNpZnkgYmVjYXVzZSBpdCB3b3VsZCBsb3NlIHRoZSBjb250ZXh0LlxuICAgICAgICByZXN1bHQgPSB0aGlzLl9jb2xsZWN0aW9uLmluc2VydChkb2MpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hvb3NlUmV0dXJuVmFsdWVGcm9tQ29sbGVjdGlvblJlc3VsdChyZXN1bHQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgSW5zZXJ0IGEgZG9jdW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uICBSZXR1cm5zIGl0cyB1bmlxdWUgX2lkLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCAgaW5zZXJ0XG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge09iamVjdH0gZG9jIFRoZSBkb2N1bWVudCB0byBpbnNlcnQuIE1heSBub3QgeWV0IGhhdmUgYW4gX2lkIGF0dHJpYnV0ZSwgaW4gd2hpY2ggY2FzZSBNZXRlb3Igd2lsbCBnZW5lcmF0ZSBvbmUgZm9yIHlvdS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBPcHRpb25hbC4gIElmIHByZXNlbnQsIGNhbGxlZCB3aXRoIGFuIGVycm9yIG9iamVjdCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgYW5kLCBpZiBubyBlcnJvciwgdGhlIF9pZCBhcyB0aGUgc2Vjb25kLlxuICAgKi9cbiAgaW5zZXJ0KGRvYywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5faW5zZXJ0KGRvYywgY2FsbGJhY2spO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBc3luY2hyb25vdXNseSBtb2RpZmllcyBvbmUgb3IgbW9yZSBkb2N1bWVudHMgaW4gdGhlIGNvbGxlY3Rpb24uIFJldHVybnMgdGhlIG51bWJlciBvZiBtYXRjaGVkIGRvY3VtZW50cy5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgdXBkYXRlXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge01vbmdvU2VsZWN0b3J9IHNlbGVjdG9yIFNwZWNpZmllcyB3aGljaCBkb2N1bWVudHMgdG8gbW9kaWZ5XG4gICAqIEBwYXJhbSB7TW9uZ29Nb2RpZmllcn0gbW9kaWZpZXIgU3BlY2lmaWVzIGhvdyB0byBtb2RpZnkgdGhlIGRvY3VtZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5tdWx0aSBUcnVlIHRvIG1vZGlmeSBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzOyBmYWxzZSB0byBvbmx5IG1vZGlmeSBvbmUgb2YgdGhlIG1hdGNoaW5nIGRvY3VtZW50cyAodGhlIGRlZmF1bHQpLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMudXBzZXJ0IFRydWUgdG8gaW5zZXJ0IGEgZG9jdW1lbnQgaWYgbm8gbWF0Y2hpbmcgZG9jdW1lbnRzIGFyZSBmb3VuZC5cbiAgICogQHBhcmFtIHtBcnJheX0gb3B0aW9ucy5hcnJheUZpbHRlcnMgT3B0aW9uYWwuIFVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBNb25nb0RCIFtmaWx0ZXJlZCBwb3NpdGlvbmFsIG9wZXJhdG9yXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL3JlZmVyZW5jZS9vcGVyYXRvci91cGRhdGUvcG9zaXRpb25hbC1maWx0ZXJlZC8pIHRvIHNwZWNpZnkgd2hpY2ggZWxlbWVudHMgdG8gbW9kaWZ5IGluIGFuIGFycmF5IGZpZWxkLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIE9wdGlvbmFsLiAgSWYgcHJlc2VudCwgY2FsbGVkIHdpdGggYW4gZXJyb3Igb2JqZWN0IGFzIHRoZSBmaXJzdCBhcmd1bWVudCBhbmQsIGlmIG5vIGVycm9yLCB0aGUgbnVtYmVyIG9mIGFmZmVjdGVkIGRvY3VtZW50cyBhcyB0aGUgc2Vjb25kLlxuICAgKi9cbiAgdXBkYXRlKHNlbGVjdG9yLCBtb2RpZmllciwgLi4ub3B0aW9uc0FuZENhbGxiYWNrKSB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSBwb3BDYWxsYmFja0Zyb21BcmdzKG9wdGlvbnNBbmRDYWxsYmFjayk7XG5cbiAgICAvLyBXZSd2ZSBhbHJlYWR5IHBvcHBlZCBvZmYgdGhlIGNhbGxiYWNrLCBzbyB3ZSBhcmUgbGVmdCB3aXRoIGFuIGFycmF5XG4gICAgLy8gb2Ygb25lIG9yIHplcm8gaXRlbXNcbiAgICBjb25zdCBvcHRpb25zID0geyAuLi4ob3B0aW9uc0FuZENhbGxiYWNrWzBdIHx8IG51bGwpIH07XG4gICAgbGV0IGluc2VydGVkSWQ7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy51cHNlcnQpIHtcbiAgICAgIC8vIHNldCBgaW5zZXJ0ZWRJZGAgaWYgYWJzZW50LiAgYGluc2VydGVkSWRgIGlzIGEgTWV0ZW9yIGV4dGVuc2lvbi5cbiAgICAgIGlmIChvcHRpb25zLmluc2VydGVkSWQpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICEoXG4gICAgICAgICAgICB0eXBlb2Ygb3B0aW9ucy5pbnNlcnRlZElkID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgICAgb3B0aW9ucy5pbnNlcnRlZElkIGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SURcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2luc2VydGVkSWQgbXVzdCBiZSBzdHJpbmcgb3IgT2JqZWN0SUQnKTtcbiAgICAgICAgaW5zZXJ0ZWRJZCA9IG9wdGlvbnMuaW5zZXJ0ZWRJZDtcbiAgICAgIH0gZWxzZSBpZiAoIXNlbGVjdG9yIHx8ICFzZWxlY3Rvci5faWQpIHtcbiAgICAgICAgaW5zZXJ0ZWRJZCA9IHRoaXMuX21ha2VOZXdJRCgpO1xuICAgICAgICBvcHRpb25zLmdlbmVyYXRlZElkID0gdHJ1ZTtcbiAgICAgICAgb3B0aW9ucy5pbnNlcnRlZElkID0gaW5zZXJ0ZWRJZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxlY3RvciA9IE1vbmdvLkNvbGxlY3Rpb24uX3Jld3JpdGVTZWxlY3RvcihzZWxlY3Rvciwge1xuICAgICAgZmFsbGJhY2tJZDogaW5zZXJ0ZWRJZCxcbiAgICB9KTtcblxuICAgIGNvbnN0IHdyYXBwZWRDYWxsYmFjayA9IHdyYXBDYWxsYmFjayhjYWxsYmFjayk7XG5cbiAgICBpZiAodGhpcy5faXNSZW1vdGVDb2xsZWN0aW9uKCkpIHtcbiAgICAgIGNvbnN0IGFyZ3MgPSBbc2VsZWN0b3IsIG1vZGlmaWVyLCBvcHRpb25zXTtcbiAgICAgIHJldHVybiB0aGlzLl9jYWxsTXV0YXRvck1ldGhvZCgndXBkYXRlJywgYXJncywgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8vIGl0J3MgbXkgY29sbGVjdGlvbi4gIGRlc2NlbmQgaW50byB0aGUgY29sbGVjdGlvbiBvYmplY3RcbiAgICAvLyBhbmQgcHJvcGFnYXRlIGFueSBleGNlcHRpb24uXG4gICAgLy8gSWYgdGhlIHVzZXIgcHJvdmlkZWQgYSBjYWxsYmFjayBhbmQgdGhlIGNvbGxlY3Rpb24gaW1wbGVtZW50cyB0aGlzXG4gICAgLy8gb3BlcmF0aW9uIGFzeW5jaHJvbm91c2x5LCB0aGVuIHF1ZXJ5UmV0IHdpbGwgYmUgdW5kZWZpbmVkLCBhbmQgdGhlXG4gICAgLy8gcmVzdWx0IHdpbGwgYmUgcmV0dXJuZWQgdGhyb3VnaCB0aGUgY2FsbGJhY2sgaW5zdGVhZC5cbiAgICAvL2NvbnNvbGUubG9nKHtjYWxsYmFjaywgb3B0aW9ucywgc2VsZWN0b3IsIG1vZGlmaWVyLCBjb2xsOiB0aGlzLl9jb2xsZWN0aW9ufSk7XG4gICAgdHJ5IHtcbiAgICAgIC8vIElmIHRoZSB1c2VyIHByb3ZpZGVkIGEgY2FsbGJhY2sgYW5kIHRoZSBjb2xsZWN0aW9uIGltcGxlbWVudHMgdGhpc1xuICAgICAgLy8gb3BlcmF0aW9uIGFzeW5jaHJvbm91c2x5LCB0aGVuIHF1ZXJ5UmV0IHdpbGwgYmUgdW5kZWZpbmVkLCBhbmQgdGhlXG4gICAgICAvLyByZXN1bHQgd2lsbCBiZSByZXR1cm5lZCB0aHJvdWdoIHRoZSBjYWxsYmFjayBpbnN0ZWFkLlxuICAgICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24udXBkYXRlKFxuICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgbW9kaWZpZXIsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIHdyYXBwZWRDYWxsYmFja1xuICAgICAgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJlbW92ZSBkb2N1bWVudHMgZnJvbSB0aGUgY29sbGVjdGlvblxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCByZW1vdmVcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gc2VsZWN0b3IgU3BlY2lmaWVzIHdoaWNoIGRvY3VtZW50cyB0byByZW1vdmVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBPcHRpb25hbC4gIElmIHByZXNlbnQsIGNhbGxlZCB3aXRoIGFuIGVycm9yIG9iamVjdCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgYW5kLCBpZiBubyBlcnJvciwgdGhlIG51bWJlciBvZiBhZmZlY3RlZCBkb2N1bWVudHMgYXMgdGhlIHNlY29uZC5cbiAgICovXG4gIHJlbW92ZShzZWxlY3RvciwgY2FsbGJhY2spIHtcbiAgICBzZWxlY3RvciA9IE1vbmdvLkNvbGxlY3Rpb24uX3Jld3JpdGVTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICBpZiAodGhpcy5faXNSZW1vdGVDb2xsZWN0aW9uKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWxsTXV0YXRvck1ldGhvZCgncmVtb3ZlJywgW3NlbGVjdG9yXSwgY2FsbGJhY2spO1xuICAgIH1cblxuXG4gICAgLy8gaXQncyBteSBjb2xsZWN0aW9uLiAgZGVzY2VuZCBpbnRvIHRoZSBjb2xsZWN0aW9uMSBvYmplY3RcbiAgICAvLyBhbmQgcHJvcGFnYXRlIGFueSBleGNlcHRpb24uXG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24ucmVtb3ZlKHNlbGVjdG9yKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgQXN5bmNocm9ub3VzbHkgbW9kaWZpZXMgb25lIG9yIG1vcmUgZG9jdW1lbnRzIGluIHRoZSBjb2xsZWN0aW9uLCBvciBpbnNlcnQgb25lIGlmIG5vIG1hdGNoaW5nIGRvY3VtZW50cyB3ZXJlIGZvdW5kLiBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIGtleXMgYG51bWJlckFmZmVjdGVkYCAodGhlIG51bWJlciBvZiBkb2N1bWVudHMgbW9kaWZpZWQpICBhbmQgYGluc2VydGVkSWRgICh0aGUgdW5pcXVlIF9pZCBvZiB0aGUgZG9jdW1lbnQgdGhhdCB3YXMgaW5zZXJ0ZWQsIGlmIGFueSkuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIHVwc2VydFxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtNb25nb1NlbGVjdG9yfSBzZWxlY3RvciBTcGVjaWZpZXMgd2hpY2ggZG9jdW1lbnRzIHRvIG1vZGlmeVxuICAgKiBAcGFyYW0ge01vbmdvTW9kaWZpZXJ9IG1vZGlmaWVyIFNwZWNpZmllcyBob3cgdG8gbW9kaWZ5IHRoZSBkb2N1bWVudHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMubXVsdGkgVHJ1ZSB0byBtb2RpZnkgYWxsIG1hdGNoaW5nIGRvY3VtZW50czsgZmFsc2UgdG8gb25seSBtb2RpZnkgb25lIG9mIHRoZSBtYXRjaGluZyBkb2N1bWVudHMgKHRoZSBkZWZhdWx0KS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBPcHRpb25hbC4gIElmIHByZXNlbnQsIGNhbGxlZCB3aXRoIGFuIGVycm9yIG9iamVjdCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgYW5kLCBpZiBubyBlcnJvciwgdGhlIG51bWJlciBvZiBhZmZlY3RlZCBkb2N1bWVudHMgYXMgdGhlIHNlY29uZC5cbiAgICovXG4gIHVwc2VydChzZWxlY3RvciwgbW9kaWZpZXIsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCFjYWxsYmFjayAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnVwZGF0ZShcbiAgICAgIHNlbGVjdG9yLFxuICAgICAgbW9kaWZpZXIsXG4gICAgICB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIF9yZXR1cm5PYmplY3Q6IHRydWUsXG4gICAgICAgIHVwc2VydDogdHJ1ZSxcbiAgICAgIH0pO1xuICB9LFxufVxuXG4vLyBDb252ZXJ0IHRoZSBjYWxsYmFjayB0byBub3QgcmV0dXJuIGEgcmVzdWx0IGlmIHRoZXJlIGlzIGFuIGVycm9yXG5mdW5jdGlvbiB3cmFwQ2FsbGJhY2soY2FsbGJhY2ssIGNvbnZlcnRSZXN1bHQpIHtcbiAgcmV0dXJuIChcbiAgICBjYWxsYmFjayAmJlxuICAgIGZ1bmN0aW9uKGVycm9yLCByZXN1bHQpIHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjYWxsYmFjayhlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb252ZXJ0UmVzdWx0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBjb252ZXJ0UmVzdWx0KHJlc3VsdCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIHJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuICApO1xufVxuXG5mdW5jdGlvbiBwb3BDYWxsYmFja0Zyb21BcmdzKGFyZ3MpIHtcbiAgLy8gUHVsbCBvZmYgYW55IGNhbGxiYWNrIChvciBwZXJoYXBzIGEgJ2NhbGxiYWNrJyB2YXJpYWJsZSB0aGF0IHdhcyBwYXNzZWRcbiAgLy8gaW4gdW5kZWZpbmVkLCBsaWtlIGhvdyAndXBzZXJ0JyBkb2VzIGl0KS5cbiAgaWYgKFxuICAgIGFyZ3MubGVuZ3RoICYmXG4gICAgKGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgKSB7XG4gICAgcmV0dXJuIGFyZ3MucG9wKCk7XG4gIH1cbn1cbiIsIi8qKlxuICogQHN1bW1hcnkgQWxsb3dzIGZvciB1c2VyIHNwZWNpZmllZCBjb25uZWN0aW9uIG9wdGlvbnNcbiAqIEBleGFtcGxlIGh0dHA6Ly9tb25nb2RiLmdpdGh1Yi5pby9ub2RlLW1vbmdvZGItbmF0aXZlLzMuMC9yZWZlcmVuY2UvY29ubmVjdGluZy9jb25uZWN0aW9uLXNldHRpbmdzL1xuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVXNlciBzcGVjaWZpZWQgTW9uZ28gY29ubmVjdGlvbiBvcHRpb25zXG4gKi9cbk1vbmdvLnNldENvbm5lY3Rpb25PcHRpb25zID0gZnVuY3Rpb24gc2V0Q29ubmVjdGlvbk9wdGlvbnMgKG9wdGlvbnMpIHtcbiAgY2hlY2sob3B0aW9ucywgT2JqZWN0KTtcbiAgTW9uZ28uX2Nvbm5lY3Rpb25PcHRpb25zID0gb3B0aW9ucztcbn07IiwiZXhwb3J0IGNvbnN0IG5vcm1hbGl6ZVByb2plY3Rpb24gPSBvcHRpb25zID0+IHtcbiAgLy8gdHJhbnNmb3JtIGZpZWxkcyBrZXkgaW4gcHJvamVjdGlvblxuICBjb25zdCB7IGZpZWxkcywgcHJvamVjdGlvbiwgLi4ub3RoZXJPcHRpb25zIH0gPSBvcHRpb25zIHx8IHt9O1xuICAvLyBUT0RPOiBlbmFibGUgdGhpcyBjb21tZW50IHdoZW4gZGVwcmVjYXRpbmcgdGhlIGZpZWxkcyBvcHRpb25cbiAgLy8gTG9nLmRlYnVnKGBmaWVsZHMgb3B0aW9uIGhhcyBiZWVuIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgdGhlIG5ldyAncHJvamVjdGlvbicgaW5zdGVhZGApXG5cbiAgcmV0dXJuIHtcbiAgICAuLi5vdGhlck9wdGlvbnMsXG4gICAgLi4uKHByb2plY3Rpb24gfHwgZmllbGRzID8geyBwcm9qZWN0aW9uOiBmaWVsZHMgfHwgcHJvamVjdGlvbiB9IDoge30pLFxuICB9O1xufTtcbiIsImltcG9ydCB7IE9ic2VydmVIYW5kbGVDYWxsYmFjaywgT2JzZXJ2ZU11bHRpcGxleGVyIH0gZnJvbSAnLi9vYnNlcnZlX211bHRpcGxleCc7XG5cbmxldCBuZXh0T2JzZXJ2ZUhhbmRsZUlkID0gMTtcblxuZXhwb3J0IHR5cGUgT2JzZXJ2ZUhhbmRsZUNhbGxiYWNrSW50ZXJuYWwgPSAnX2FkZGVkJyB8ICdfYWRkZWRCZWZvcmUnIHwgJ19jaGFuZ2VkJyB8ICdfbW92ZWRCZWZvcmUnIHwgJ19yZW1vdmVkJztcblxuXG5leHBvcnQgdHlwZSBDYWxsYmFjazxUID0gYW55PiA9ICguLi5hcmdzOiBUW10pID0+IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuXG4vKipcbiAqIFRoZSBcIm9ic2VydmUgaGFuZGxlXCIgcmV0dXJuZWQgZnJvbSBvYnNlcnZlQ2hhbmdlcy5cbiAqIENvbnRhaW5zIGEgcmVmZXJlbmNlIHRvIGFuIE9ic2VydmVNdWx0aXBsZXhlci5cbiAqIFVzZWQgdG8gc3RvcCBvYnNlcnZhdGlvbiBhbmQgY2xlYW4gdXAgcmVzb3VyY2VzLlxuICovXG5leHBvcnQgY2xhc3MgT2JzZXJ2ZUhhbmRsZTxUID0gYW55PiB7XG4gIF9pZDogbnVtYmVyO1xuICBfbXVsdGlwbGV4ZXI6IE9ic2VydmVNdWx0aXBsZXhlcjtcbiAgbm9uTXV0YXRpbmdDYWxsYmFja3M6IGJvb2xlYW47XG4gIF9zdG9wcGVkOiBib29sZWFuO1xuXG4gIHB1YmxpYyBpbml0aWFsQWRkc1NlbnRSZXNvbHZlcjogKHZhbHVlOiB2b2lkKSA9PiB2b2lkID0gKCkgPT4ge307XG4gIHB1YmxpYyBpbml0aWFsQWRkc1NlbnQ6IFByb21pc2U8dm9pZD5cblxuICBfYWRkZWQ/OiBDYWxsYmFjazxUPjtcbiAgX2FkZGVkQmVmb3JlPzogQ2FsbGJhY2s8VD47XG4gIF9jaGFuZ2VkPzogQ2FsbGJhY2s8VD47XG4gIF9tb3ZlZEJlZm9yZT86IENhbGxiYWNrPFQ+O1xuICBfcmVtb3ZlZD86IENhbGxiYWNrPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKG11bHRpcGxleGVyOiBPYnNlcnZlTXVsdGlwbGV4ZXIsIGNhbGxiYWNrczogUmVjb3JkPE9ic2VydmVIYW5kbGVDYWxsYmFjaywgQ2FsbGJhY2s8VD4+LCBub25NdXRhdGluZ0NhbGxiYWNrczogYm9vbGVhbikge1xuICAgIHRoaXMuX211bHRpcGxleGVyID0gbXVsdGlwbGV4ZXI7XG5cbiAgICBtdWx0aXBsZXhlci5jYWxsYmFja05hbWVzKCkuZm9yRWFjaCgobmFtZTogT2JzZXJ2ZUhhbmRsZUNhbGxiYWNrKSA9PiB7XG4gICAgICBpZiAoY2FsbGJhY2tzW25hbWVdKSB7XG4gICAgICAgIHRoaXNbYF8ke25hbWV9YCBhcyBPYnNlcnZlSGFuZGxlQ2FsbGJhY2tJbnRlcm5hbF0gPSBjYWxsYmFja3NbbmFtZV07XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG5hbWUgPT09IFwiYWRkZWRCZWZvcmVcIiAmJiBjYWxsYmFja3MuYWRkZWQpIHtcbiAgICAgICAgdGhpcy5fYWRkZWRCZWZvcmUgPSBhc3luYyBmdW5jdGlvbiAoaWQsIGZpZWxkcywgYmVmb3JlKSB7XG4gICAgICAgICAgYXdhaXQgY2FsbGJhY2tzLmFkZGVkKGlkLCBmaWVsZHMpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fc3RvcHBlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2lkID0gbmV4dE9ic2VydmVIYW5kbGVJZCsrO1xuICAgIHRoaXMubm9uTXV0YXRpbmdDYWxsYmFja3MgPSBub25NdXRhdGluZ0NhbGxiYWNrcztcblxuICAgIHRoaXMuaW5pdGlhbEFkZHNTZW50ID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBjb25zdCByZWFkeSA9ICgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB0aGlzLmluaXRpYWxBZGRzU2VudCA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dChyZWFkeSwgMzAwMDApXG5cbiAgICAgIHRoaXMuaW5pdGlhbEFkZHNTZW50UmVzb2x2ZXIgPSAoKSA9PiB7XG4gICAgICAgIHJlYWR5KCk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXNpbmcgcHJvcGVydHkgc3ludGF4IGFuZCBhcnJvdyBmdW5jdGlvbiBzeW50YXggdG8gYXZvaWQgYmluZGluZyB0aGUgd3JvbmcgY29udGV4dCBvbiBjYWxsYmFja3MuXG4gICAqL1xuICBzdG9wID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG4gICAgdGhpcy5fc3RvcHBlZCA9IHRydWU7XG4gICAgYXdhaXQgdGhpcy5fbXVsdGlwbGV4ZXIucmVtb3ZlSGFuZGxlKHRoaXMuX2lkKTtcbiAgfVxufSJdfQ==
