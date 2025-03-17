Package["core-runtime"].queue("ostrio:files",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var ECMAScript = Package.ecmascript.ECMAScript;
var fetch = Package.fetch.fetch;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var _preCollection, _preCollectionName, allowClientCode, allowedOrigins, allowQueryStringCookies, cacheControl, chunkSize, collection, collectionName, continueUploadTTL, debug, disableDownload, disableUpload, downloadCallback, downloadRoute, getUser, integrityCheck, interceptDownload, interceptRequest, namingFunction, onAfterRemove, onAfterUpload, onBeforeRemove, onBeforeUpload, onInitiateUpload, parentDirPermissions, permissions, protected, public, responseHeaders, sanitize, schema, strict, FilesCollection;

var require = meteorInstall({"node_modules":{"meteor":{"ostrio:files":{"server.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ostrio_files/server.js                                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      FilesCollection: () => FilesCollection,
      helpers: () => helpers
    });
    let Mongo;
    module.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 0);
    let fetch;
    module.link("meteor/fetch", {
      fetch(v) {
        fetch = v;
      }
    }, 1);
    let WebApp;
    module.link("meteor/webapp", {
      WebApp(v) {
        WebApp = v;
      }
    }, 2);
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 3);
    let Random;
    module.link("meteor/random", {
      Random(v) {
        Random = v;
      }
    }, 4);
    let Cookies;
    module.link("meteor/ostrio:cookies", {
      Cookies(v) {
        Cookies = v;
      }
    }, 5);
    let check, Match;
    module.link("meteor/check", {
      check(v) {
        check = v;
      },
      Match(v) {
        Match = v;
      }
    }, 6);
    let WriteStream;
    module.link("./write-stream.js", {
      default(v) {
        WriteStream = v;
      }
    }, 7);
    let FilesCollectionCore;
    module.link("./core.js", {
      default(v) {
        FilesCollectionCore = v;
      }
    }, 8);
    let fixJSONParse, fixJSONStringify, helpers;
    module.link("./lib.js", {
      fixJSONParse(v) {
        fixJSONParse = v;
      },
      fixJSONStringify(v) {
        fixJSONStringify = v;
      },
      helpers(v) {
        helpers = v;
      }
    }, 9);
    let AbortController;
    module.link("abort-controller", {
      default(v) {
        AbortController = v;
      }
    }, 10);
    let fs;
    module.link("fs", {
      default(v) {
        fs = v;
      }
    }, 11);
    let nodeQs;
    module.link("querystring", {
      default(v) {
        nodeQs = v;
      }
    }, 12);
    let nodePath;
    module.link("path", {
      default(v) {
        nodePath = v;
      }
    }, 13);
    let pipelineCallback;
    module.link("stream", {
      pipeline(v) {
        pipelineCallback = v;
      }
    }, 14);
    let promisify;
    module.link("util", {
      promisify(v) {
        promisify = v;
      }
    }, 15);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // change to this in "loadAsync" when Meteor supports Node.js 15 upwards
    //import nodeStream from 'stream/promises';

    const pipeline = promisify(pipelineCallback);

    /**
     * @const {Object} bound  - Meteor.bindEnvironment (Fiber wrapper)
     * @const {Function} noop - No Operation function, placeholder for required callbacks
     */
    const bound = Meteor.bindEnvironment(callback => callback());
    const noop = function noop() {};

    /**
     * Create (ensure) index on MongoDB collection, catch and log exception if thrown
     * @function createIndex
     * @param {Mongo.Collection} collection - Mongo.Collection instance
     * @param {object} keys - Field and value pairs where the field is the index key and the value describes the type of index for that field
     * @param {object} opts - Set of options that controls the creation of the index
     * @returns {void 0}
     */
    const createIndex = async (_collection, keys, opts) => {
      const collection = _collection.rawCollection();
      try {
        await collection.createIndex(keys, opts);
      } catch (e) {
        if (e.code === 85) {
          let indexName;
          const indexes = await collection.indexes();
          for (const index of indexes) {
            let allMatch = true;
            for (const indexKey of Object.keys(keys)) {
              if (typeof index.key[indexKey] === 'undefined') {
                allMatch = false;
                break;
              }
            }
            for (const indexKey of Object.keys(index.key)) {
              if (typeof keys[indexKey] === 'undefined') {
                allMatch = false;
                break;
              }
            }
            if (allMatch) {
              indexName = index.name;
              break;
            }
          }
          if (indexName) {
            await collection.dropIndex(indexName);
            await collection.createIndex(keys, opts);
          }
        } else {
          Meteor._debug("Can not set ".concat(Object.keys(keys).join(' + '), " index on \"").concat(_collection._name, "\" collection"), {
            keys,
            opts,
            details: e
          });
        }
      }
    };

    /**
     * @locus Anywhere
     * @class FilesCollection
     * @param config           {Object}   - [Both]   Configuration object with next properties:
     * @param config.debug     {Boolean}  - [Both]   Turn on/of debugging and extra logging
     * @param config.schema    {Object}   - [Both]   Collection Schema
     * @param config.public    {Boolean}  - [Both]   Store files in folder accessible for proxy servers, for limits, and more - read docs
     * @param config.strict    {Boolean}  - [Server] Strict mode for partial content, if is `true` server will return `416` response code, when `range` is not specified, otherwise server return `206`
     * @param config.protected {Function} - [Server] If `true` - files will be served only to authorized users, if `function()` - you're able to check visitor's permissions in your own way function's context has:
     *  - `request`
     *  - `response`
     *  - `user()`
     *  - `userId`
     * @param config.chunkSize      {Number}  - [Both] Upload chunk size, default: 524288 bytes (0,5 Mb)
     * @param config.permissions    {Number}  - [Server] Permissions which will be set to uploaded files (octal), like: `511` or `0o755`. Default: 0644
     * @param config.parentDirPermissions {Number}  - [Server] Permissions which will be set to parent directory of uploaded files (octal), like: `611` or `0o777`. Default: 0755
     * @param config.storagePath    {String|Function}  - [Server] Storage path on file system
     * @param config.cacheControl   {String}  - [Server] Default `Cache-Control` header
     * @param config.responseHeaders {Object|Function} - [Server] Custom response headers, if function is passed, must return Object
     * @param config.throttle       {Number}  - [Server] DEPRECATED bps throttle threshold
     * @param config.downloadRoute  {String}  - [Both]   Server Route used to retrieve files
     * @param config.collection     {Mongo.Collection} - [Both] Mongo Collection Instance
     * @param config.collectionName {String}  - [Both]   Collection name
     * @param config.namingFunction {Function}- [Both]   Function which returns `String`
     * @param config.integrityCheck {Boolean} - [Server] Check file's integrity before serving to users
     * @param config.onAfterUpload  {Function}- [Server] Called right after file is ready on FS. Use to transfer file somewhere else, or do other thing with file directly
     * @param config.onAfterRemove  {Function} - [Server] Called right after file is removed. Removed objects is passed to callback
     * @param config.continueUploadTTL {Number} - [Server] Time in seconds, during upload may be continued, default 3 hours (10800 seconds)
     * @param config.onBeforeUpload {Function}- [Both]   Function which executes on server after receiving each chunk and on client right before beginning upload. Function context is `File` - so you are able to check for extension, mime-type, size and etc.:
     *  - return or resolve `true` to continue
     *  - return or resolve `false` or `String` to abort upload
     * @param config.getUser        {Function} - [Server] Replace default way of recognizing user, usefull when you want to auth user based on custom cookie (or other way). arguments {http: {request: {...}, response: {...}}}, need to return {userId: String, user: Function}
     * @param config.onInitiateUpload {Function} - [Server] Function which executes on server right before upload is begin and right after `onBeforeUpload` hook. This hook is fully asynchronous.
     * @param config.onBeforeRemove {Function} - [Server] Executes before removing file on server, so you can check permissions. Return `true` to allow action and `false` to deny.
     * @param config.allowClientCode  {Boolean}  - [Both]   Allow to run `remove` from client
     * @param config.downloadCallback {Function} - [Server] Callback triggered each time file is requested, return truthy value to continue download, or falsy to abort
     * @param config.interceptRequest {Function} - [Server] Intercept incoming HTTP request, so you can whatever you want, no checks or preprocessing, arguments {http: {request: {...}, response: {...}}, params: {...}}
     * @param config.interceptDownload {Function} - [Server] Intercept download request, so you can serve file from third-party resource, arguments {http: {request: {...}, response: {...}}, fileRef: {...}}
     * @param config.disableUpload {Boolean} - Disable file upload, useful for server only solutions
     * @param config.disableDownload {Boolean} - Disable file download (serving), useful for file management only solutions
     * @param config.allowedOrigins  {Regex|Boolean}  - [Server]   Regex of Origins that are allowed CORS access or `false` to disable completely. Defaults to `/^http:\/\/localhost:12[0-9]{3}$/` for allowing Meteor-Cordova builds access
     * @param config.allowQueryStringCookies {Boolean} - Allow passing Cookies in a query string (in URL). Primary should be used only in Cordova environment. Note: this option will be used only on Cordova. Default: `false`
     * @param config.sanitize {Function} - Override default sanitize function
     * @param config._preCollection  {Mongo.Collection} - [Server] Mongo preCollection Instance
     * @param config._preCollectionName {String}  - [Server]  preCollection name
     * @summary Create new instance of FilesCollection
     */
    class FilesCollection extends FilesCollectionCore {
      constructor(config) {
        super();
        let storagePath;
        if (config) {
          ({
            _preCollection: this._preCollection,
            _preCollectionName: this._preCollectionName,
            allowClientCode: this.allowClientCode,
            allowedOrigins: this.allowedOrigins,
            allowQueryStringCookies: this.allowQueryStringCookies,
            cacheControl: this.cacheControl,
            chunkSize: this.chunkSize,
            collection: this.collection,
            collectionName: this.collectionName,
            continueUploadTTL: this.continueUploadTTL,
            debug: this.debug,
            disableDownload: this.disableDownload,
            disableUpload: this.disableUpload,
            downloadCallback: this.downloadCallback,
            downloadRoute: this.downloadRoute,
            getUser: this.getUser,
            integrityCheck: this.integrityCheck,
            interceptDownload: this.interceptDownload,
            interceptRequest: this.interceptRequest,
            namingFunction: this.namingFunction,
            onAfterRemove: this.onAfterRemove,
            onAfterUpload: this.onAfterUpload,
            onBeforeRemove: this.onBeforeRemove,
            onBeforeUpload: this.onBeforeUpload,
            onInitiateUpload: this.onInitiateUpload,
            parentDirPermissions: this.parentDirPermissions,
            permissions: this.permissions,
            protected: this.protected,
            public: this.public,
            responseHeaders: this.responseHeaders,
            sanitize: this.sanitize,
            schema: this.schema,
            storagePath,
            strict: this.strict
          } = config);
        }
        const self = this;
        if (!helpers.isBoolean(this.debug)) {
          this.debug = false;
        }
        if (!helpers.isBoolean(this.public)) {
          this.public = false;
        }
        if (!this.protected) {
          this.protected = false;
        }
        if (!this.chunkSize) {
          this.chunkSize = 1024 * 512;
        }
        this.chunkSize = Math.floor(this.chunkSize / 8) * 8;
        if (!helpers.isString(this.collectionName) && !this.collection) {
          this.collectionName = 'MeteorUploadFiles';
        }
        if (!this.collection) {
          this.collection = new Mongo.Collection(this.collectionName);
        } else {
          this.collectionName = this.collection._name;
        }
        this.collection.filesCollection = this;
        check(this.collectionName, String);
        if (this.public && !this.downloadRoute) {
          throw new Meteor.Error(500, "[FilesCollection.".concat(this.collectionName, "]: \"downloadRoute\" must be precisely provided on \"public\" collections! Note: \"downloadRoute\" must be equal or be inside of your web/proxy-server (relative) root."));
        }
        if (!helpers.isString(this.downloadRoute)) {
          this.downloadRoute = '/cdn/storage';
        }
        this.downloadRoute = this.downloadRoute.replace(/\/$/, '');
        if (!helpers.isFunction(this.namingFunction)) {
          this.namingFunction = false;
        }
        if (!helpers.isFunction(this.onBeforeUpload)) {
          this.onBeforeUpload = false;
        }
        if (!helpers.isFunction(this.getUser)) {
          this.getUser = false;
        }
        if (!helpers.isBoolean(this.allowClientCode)) {
          this.allowClientCode = true;
        }
        if (!helpers.isFunction(this.onInitiateUpload)) {
          this.onInitiateUpload = false;
        }
        if (!helpers.isFunction(this.interceptRequest)) {
          this.interceptRequest = false;
        }
        if (!helpers.isFunction(this.interceptDownload)) {
          this.interceptDownload = false;
        }
        if (!helpers.isBoolean(this.strict)) {
          this.strict = true;
        }
        if (!helpers.isBoolean(this.allowQueryStringCookies)) {
          this.allowQueryStringCookies = false;
        }
        if (!helpers.isNumber(this.permissions)) {
          this.permissions = parseInt('644', 8);
        }
        if (!helpers.isNumber(this.parentDirPermissions)) {
          this.parentDirPermissions = parseInt('755', 8);
        }
        if (!helpers.isString(this.cacheControl)) {
          this.cacheControl = 'public, max-age=31536000, s-maxage=31536000';
        }
        if (!helpers.isFunction(this.onAfterUpload)) {
          this.onAfterUpload = false;
        }
        if (!helpers.isBoolean(this.disableUpload)) {
          this.disableUpload = false;
        }
        if (!helpers.isFunction(this.onAfterRemove)) {
          this.onAfterRemove = false;
        }
        if (!helpers.isFunction(this.onBeforeRemove)) {
          this.onBeforeRemove = false;
        }
        if (!helpers.isBoolean(this.integrityCheck)) {
          this.integrityCheck = true;
        }
        if (!helpers.isBoolean(this.disableDownload)) {
          this.disableDownload = false;
        }
        if (this.allowedOrigins === true || this.allowedOrigins === void 0) {
          this.allowedOrigins = /^http:\/\/localhost:12[0-9]{3}$/;
        }
        if (!helpers.isObject(this._currentUploads)) {
          this._currentUploads = {};
        }
        if (!helpers.isFunction(this.downloadCallback)) {
          this.downloadCallback = false;
        }
        if (!helpers.isNumber(this.continueUploadTTL)) {
          this.continueUploadTTL = 10800;
        }
        if (!helpers.isFunction(this.sanitize)) {
          this.sanitize = helpers.sanitize;
        }
        if (!helpers.isFunction(this.responseHeaders)) {
          this.responseHeaders = (responseCode, fileRef, versionRef) => {
            const headers = {};
            switch (responseCode) {
              case '206':
                headers.Pragma = 'private';
                headers['Transfer-Encoding'] = 'chunked';
                break;
              case '400':
                headers['Cache-Control'] = 'no-cache';
                break;
              case '416':
                headers['Content-Range'] = "bytes */".concat(versionRef.size);
                break;
              default:
                break;
            }
            headers.Connection = 'keep-alive';
            headers['Content-Type'] = versionRef.type || 'application/octet-stream';
            headers['Accept-Ranges'] = 'bytes';
            return headers;
          };
        }
        if (this.public && !storagePath) {
          throw new Meteor.Error(500, "[FilesCollection.".concat(this.collectionName, "] \"storagePath\" must be set on \"public\" collections! Note: \"storagePath\" must be equal on be inside of your web/proxy-server (absolute) root."));
        }
        if (!storagePath) {
          storagePath = function () {
            return "assets".concat(nodePath.sep, "app").concat(nodePath.sep, "uploads").concat(nodePath.sep).concat(self.collectionName);
          };
        }
        if (helpers.isString(storagePath)) {
          this.storagePath = () => storagePath;
        } else {
          this.storagePath = function () {
            let sp = storagePath.apply(self, arguments);
            if (!helpers.isString(sp)) {
              throw new Meteor.Error(400, "[FilesCollection.".concat(self.collectionName, "] \"storagePath\" function must return a String!"));
            }
            sp = sp.replace(/\/$/, '');
            return nodePath.normalize(sp);
          };
        }
        this._debug('[FilesCollection.storagePath] Set to:', this.storagePath({}));
        try {
          fs.mkdirSync(this.storagePath({}), {
            mode: this.parentDirPermissions,
            recursive: true
          });
        } catch (error) {
          if (error) {
            throw new Meteor.Error(401, "[FilesCollection.".concat(self.collectionName, "] Path \"").concat(this.storagePath({}), "\" is not writable!"), error);
          }
        }
        check(this.strict, Boolean);
        check(this.permissions, Number);
        check(this.storagePath, Function);
        check(this.cacheControl, String);
        check(this.onAfterRemove, Match.OneOf(false, Function));
        check(this.onAfterUpload, Match.OneOf(false, Function));
        check(this.disableUpload, Boolean);
        check(this.integrityCheck, Boolean);
        check(this.onBeforeRemove, Match.OneOf(false, Function));
        check(this.disableDownload, Boolean);
        check(this.downloadCallback, Match.OneOf(false, Function));
        check(this.interceptRequest, Match.OneOf(false, Function));
        check(this.interceptDownload, Match.OneOf(false, Function));
        check(this.continueUploadTTL, Number);
        check(this.responseHeaders, Match.OneOf(Object, Function));
        check(this.allowedOrigins, Match.OneOf(Boolean, RegExp));
        check(this.allowQueryStringCookies, Boolean);
        this._cookies = new Cookies({
          allowQueryStringCookies: this.allowQueryStringCookies,
          allowedCordovaOrigins: this.allowedOrigins
        });
        if (!this.disableUpload) {
          if (!helpers.isString(this._preCollectionName) && !this._preCollection) {
            this._preCollectionName = "__pre_".concat(this.collectionName);
          }
          if (!this._preCollection) {
            this._preCollection = new Mongo.Collection(this._preCollectionName);
          } else {
            this._preCollectionName = this._preCollection._name;
          }
          check(this._preCollectionName, String);
          createIndex(this._preCollection, {
            createdAt: 1
          }, {
            expireAfterSeconds: this.continueUploadTTL,
            background: true
          });
          const _preCollectionCursor = this._preCollection.find({}, {
            fields: {
              _id: 1,
              isFinished: 1
            }
          });
          _preCollectionCursor.observe({
            async changed(doc) {
              if (doc.isFinished) {
                self._debug("[FilesCollection] [_preCollectionCursor.observe] [changed]: ".concat(doc._id));
                await self._preCollection.removeAsync({
                  _id: doc._id
                });
              }
            },
            async removed(doc) {
              // Free memory after upload is done
              // Or if upload is unfinished
              self._debug("[FilesCollection] [_preCollectionCursor.observe] [removed]: ".concat(doc._id));
              if (helpers.isObject(self._currentUploads[doc._id])) {
                self._currentUploads[doc._id].stop();
                self._currentUploads[doc._id].end();

                // We can be unlucky to run into a race condition where another server removed this document before the change of `isFinished` is registered on this server.
                // Therefore it's better to double-check with the main collection if the file is referenced there. Issue: https://github.com/veliovgroup/Meteor-Files/issues/672
                if (!doc.isFinished && (await self.collection.find({
                  _id: doc._id
                }).countAsync()) === 0) {
                  self._debug("[FilesCollection] [_preCollectionCursor.observe] [removeUnfinishedUpload]: ".concat(doc._id));
                  self._currentUploads[doc._id].abort();
                }
                delete self._currentUploads[doc._id];
              }
            }
          });
          this._createStream = (_id, path, opts) => {
            this._currentUploads[_id] = new WriteStream(path, opts.fileLength, opts, this.permissions);
          };

          // This little function allows to continue upload
          // even after server is restarted (*not on dev-stage*)
          this._continueUpload = async _id => {
            if (this._currentUploads[_id] && this._currentUploads[_id].file) {
              if (!this._currentUploads[_id].aborted && !this._currentUploads[_id].ended) {
                return this._currentUploads[_id].file;
              }
              this._createStream(_id, this._currentUploads[_id].file.file.path, this._currentUploads[_id].file);
              return this._currentUploads[_id].file;
            }
            const contUpld = await this._preCollection.findOneAsync({
              _id
            });
            if (contUpld) {
              this._createStream(_id, contUpld.file.path, contUpld);
              return this._currentUploads[_id].file;
            }
            return false;
          };
        }
        if (!this.schema) {
          this.schema = FilesCollectionCore.schema;
        }
        check(this.debug, Boolean);
        check(this.schema, Object);
        check(this.public, Boolean);
        check(this.getUser, Match.OneOf(false, Function));
        check(this.protected, Match.OneOf(Boolean, Function));
        check(this.chunkSize, Number);
        check(this.downloadRoute, String);
        check(this.namingFunction, Match.OneOf(false, Function));
        check(this.onBeforeUpload, Match.OneOf(false, Function));
        check(this.onInitiateUpload, Match.OneOf(false, Function));
        check(this.allowClientCode, Boolean);
        if (this.public && this.protected) {
          throw new Meteor.Error(500, "[FilesCollection.".concat(this.collectionName, "]: Files can not be public and protected at the same time!"));
        }
        this._checkAccess = async http => {
          if (this.protected) {
            let result;
            const {
              userAsync,
              userId
            } = this._getUser(http);
            if (helpers.isFunction(this.protected)) {
              let fileRef;
              if (helpers.isObject(http.params) && http.params._id) {
                fileRef = await this.collection.findOneAsync(http.params._id);
              }
              result = http ? await this.protected.call(Object.assign(http, {
                userAsync,
                userId
              }), fileRef || null) : await this.protected.call({
                userAsync,
                userId
              }, fileRef || null);
            } else {
              result = !!userId;
            }
            if (http && result === true || !http) {
              return true;
            }
            const rc = helpers.isNumber(result) ? result : 401;
            this._debug('[FilesCollection._checkAccess] WARN: Access denied!');
            if (http) {
              const text = 'Access denied!';
              if (!http.response.headersSent) {
                http.response.writeHead(rc, {
                  'Content-Type': 'text/plain',
                  'Content-Length': text.length
                });
              }
              if (!http.response.finished) {
                http.response.end(text);
              }
            }
            return false;
          }
          return true;
        };
        this._methodNames = {
          _Abort: "_FilesCollectionAbort_".concat(this.collectionName),
          _Write: "_FilesCollectionWrite_".concat(this.collectionName),
          _Start: "_FilesCollectionStart_".concat(this.collectionName),
          _Remove: "_FilesCollectionRemove_".concat(this.collectionName)
        };
        this.on('_handleUpload', this._handleUpload);
        this.on('_finishUpload', this._finishUpload);
        this._handleUploadSync = Meteor.wrapAsync(this._handleUpload.bind(this));
        if (this.disableUpload && this.disableDownload) {
          return;
        }
        WebApp.connectHandlers.use(async (httpReq, httpResp, next) => {
          if (this.allowedOrigins && httpReq._parsedUrl.path.includes("".concat(this.downloadRoute, "/")) && !httpResp.headersSent) {
            if (this.allowedOrigins.test(httpReq.headers.origin)) {
              httpResp.setHeader('Access-Control-Allow-Credentials', 'true');
              httpResp.setHeader('Access-Control-Allow-Origin', httpReq.headers.origin);
            }
            if (httpReq.method === 'OPTIONS') {
              httpResp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
              httpResp.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, x-mtok, x-start, x-chunkid, x-fileid, x-eof');
              httpResp.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');
              httpResp.setHeader('Allow', 'GET, POST, OPTIONS');
              httpResp.writeHead(200);
              httpResp.end();
              return;
            }
          }
          if (!this.disableUpload && httpReq._parsedUrl.path.includes("".concat(this.downloadRoute, "/").concat(this.collectionName, "/__upload"))) {
            if (httpReq.method !== 'POST') {
              next();
              return;
            }
            const handleError = _error => {
              let error = _error;
              Meteor._debug('[FilesCollection] [Upload] [HTTP] Exception:', error);
              if (!httpResp.headersSent) {
                httpResp.writeHead(500);
              }
              if (!httpResp.finished) {
                if (helpers.isObject(error) && helpers.isFunction(error.toString)) {
                  error = error.toString();
                }
                if (!helpers.isString(error)) {
                  error = 'Unexpected error!';
                }
                httpResp.end(JSON.stringify({
                  error
                }));
              }
            };
            let body = '';
            const handleData = async () => {
              try {
                let opts;
                let result;
                let user = this._getUser({
                  request: httpReq,
                  response: httpResp
                });
                if (httpReq.headers['x-start'] !== '1') {
                  // CHUNK UPLOAD SCENARIO:
                  opts = {
                    fileId: this.sanitize(httpReq.headers['x-fileid'], 20, 'a')
                  };
                  if (httpReq.headers['x-eof'] === '1') {
                    opts.eof = true;
                  } else {
                    opts.binData = Buffer.from(body, 'base64');
                    opts.chunkId = parseInt(httpReq.headers['x-chunkid']);
                  }
                  const _continueUpload = await this._continueUpload(opts.fileId);
                  if (!_continueUpload) {
                    throw new Meteor.Error(408, 'Can\'t continue upload, session expired. Start upload again.');
                  }
                  ({
                    result,
                    opts
                  } = await this._prepareUpload(Object.assign(opts, _continueUpload), user.userId, 'HTTP'));
                  if (opts.eof) {
                    // FINISH UPLOAD SCENARIO:
                    this._handleUpload(result, opts, _error => {
                      let error = _error;
                      if (error) {
                        if (!httpResp.headersSent) {
                          httpResp.writeHead(500);
                        }
                        if (!httpResp.finished) {
                          if (helpers.isObject(error) && helpers.isFunction(error.toString)) {
                            error = error.toString();
                          }
                          if (!helpers.isString(error)) {
                            error = 'Unexpected error!';
                          }
                          httpResp.end(JSON.stringify({
                            error
                          }));
                        }
                      }
                      if (!httpResp.headersSent) {
                        httpResp.writeHead(200);
                      }
                      if (helpers.isObject(result.file) && result.file.meta) {
                        result.file.meta = fixJSONStringify(result.file.meta);
                      }
                      if (!httpResp.finished) {
                        httpResp.end(JSON.stringify(result));
                      }
                    });
                    return;
                  }
                  this.emit('_handleUpload', result, opts, noop);
                  if (!httpResp.headersSent) {
                    httpResp.writeHead(204);
                  }
                  if (!httpResp.finished) {
                    httpResp.end();
                  }
                } else {
                  // START SCENARIO:
                  try {
                    opts = JSON.parse(body);
                  } catch (jsonErr) {
                    Meteor._debug('Can\'t parse incoming JSON from Client on [.insert() | upload], something went wrong!', jsonErr);
                    opts = {
                      file: {}
                    };
                  }
                  if (!helpers.isObject(opts.file)) {
                    opts.file = {};
                  }
                  if (opts.fileId) {
                    opts.fileId = this.sanitize(opts.fileId, 20, 'a');
                  }
                  this._debug("[FilesCollection] [File Start HTTP] ".concat(opts.file.name || '[no-name]', " - ").concat(opts.fileId));
                  if (helpers.isObject(opts.file) && opts.file.meta) {
                    opts.file.meta = fixJSONParse(opts.file.meta);
                  }
                  opts.___s = true;
                  ({
                    result
                  } = await this._prepareUpload(helpers.clone(opts), user.userId, 'HTTP Start Method'));
                  let res;
                  res = await this.collection.findOneAsync(result._id);
                  if (res) {
                    throw new Meteor.Error(400, 'Can\'t start upload, data substitution detected!');
                  }
                  opts._id = opts.fileId;
                  opts.createdAt = new Date();
                  opts.maxLength = opts.fileLength;
                  await this._preCollection.insertAsync(helpers.omit(opts, '___s'));
                  this._createStream(result._id, result.path, helpers.omit(opts, '___s'));
                  if (opts.returnMeta) {
                    if (!httpResp.headersSent) {
                      httpResp.writeHead(200);
                    }
                    if (!httpResp.finished) {
                      httpResp.end(JSON.stringify({
                        uploadRoute: "".concat(this.downloadRoute, "/").concat(this.collectionName, "/__upload"),
                        file: result
                      }));
                    }
                  } else {
                    if (!httpResp.headersSent) {
                      httpResp.writeHead(204);
                    }
                    if (!httpResp.finished) {
                      httpResp.end();
                    }
                  }
                }
              } catch (httpRespErr) {
                handleError(httpRespErr);
              }
            };
            httpReq.setTimeout(20000, handleError);
            if (typeof httpReq.body === 'object' && Object.keys(httpReq.body).length !== 0) {
              body = JSON.stringify(httpReq.body);
              handleData();
            } else {
              httpReq.on('data', data => bound(() => {
                body += data;
              }));
              httpReq.on('end', () => bound(() => {
                handleData();
              }));
            }
            return;
          }
          if (!this.disableDownload) {
            let uri;
            if (!this.public) {
              if (httpReq._parsedUrl.path.includes("".concat(this.downloadRoute, "/").concat(this.collectionName))) {
                uri = httpReq._parsedUrl.path.replace("".concat(this.downloadRoute, "/").concat(this.collectionName), '');
                if (uri.indexOf('/') === 0) {
                  uri = uri.substring(1);
                }
                const uris = uri.split('/');
                if (uris.length === 3) {
                  const params = {
                    _id: uris[0],
                    query: httpReq._parsedUrl.query ? nodeQs.parse(httpReq._parsedUrl.query) : {},
                    name: uris[2].split('?')[0],
                    version: uris[1]
                  };
                  const http = {
                    request: httpReq,
                    response: httpResp,
                    params
                  };
                  if (this.interceptRequest && helpers.isFunction(this.interceptRequest) && (await this.interceptRequest(http)) === true) {
                    return;
                  }
                  if (await this._checkAccess(http)) {
                    await this.download(http, uris[1], await this.collection.findOneAsync(uris[0]));
                  }
                } else {
                  next();
                }
              } else {
                next();
              }
            } else {
              if (httpReq._parsedUrl.path.includes("".concat(this.downloadRoute))) {
                uri = httpReq._parsedUrl.path.replace("".concat(this.downloadRoute), '');
                if (uri.indexOf('/') === 0) {
                  uri = uri.substring(1);
                }
                const uris = uri.split('/');
                let _file = uris[uris.length - 1];
                if (_file) {
                  let version;
                  if (_file.includes('-')) {
                    version = _file.split('-')[0];
                    _file = _file.split('-')[1].split('?')[0];
                  } else {
                    version = 'original';
                    _file = _file.split('?')[0];
                  }
                  const params = {
                    query: httpReq._parsedUrl.query ? nodeQs.parse(httpReq._parsedUrl.query) : {},
                    file: _file,
                    _id: _file.split('.')[0],
                    version,
                    name: _file
                  };
                  const http = {
                    request: httpReq,
                    response: httpResp,
                    params
                  };
                  if (this.interceptRequest && helpers.isFunction(this.interceptRequest) && (await this.interceptRequest(http)) === true) {
                    return;
                  }
                  await this.download(http, version, await this.collection.findOneAsync(params._id));
                } else {
                  next();
                }
              } else {
                next();
              }
            }
            return;
          }
          next();
        });
        if (!this.disableUpload) {
          const _methods = {};

          // Method used to remove file
          // from Client side
          _methods[this._methodNames._Remove] = async function (selector) {
            check(selector, Match.OneOf(String, Object));
            self._debug("[FilesCollection] [Unlink Method] [.remove(".concat(selector, ")]"));
            if (self.allowClientCode) {
              if (self.onBeforeRemove && helpers.isFunction(self.onBeforeRemove)) {
                const userId = this.userId;
                const userFuncs = {
                  userId: this.userId,
                  userAsync() {
                    if (Meteor.users) {
                      return Meteor.users.findOneAsync(userId);
                    }
                    return null;
                  }
                };
                if (!(await self.onBeforeRemove.call(userFuncs, self.find(selector) || null))) {
                  throw new Meteor.Error(403, '[FilesCollection] [remove] Not permitted!');
                }
              }
              const cursor = self.find(selector);
              if ((await cursor.countAsync()) > 0) {
                self.removeAsync(selector);
                return true;
              }
              throw new Meteor.Error(404, 'Cursor is empty, no files is removed');
            } else {
              throw new Meteor.Error(405, '[FilesCollection] [remove] Running code on a client is not allowed!');
            }
          };

          // Method used to receive "first byte" of upload
          // and all file's meta-data, so
          // it won't be transferred with every chunk
          // Basically it prepares everything
          // So user can pause/disconnect and
          // continue upload later, during `continueUploadTTL`
          _methods[this._methodNames._Start] = async function (opts, returnMeta) {
            check(opts, {
              file: Object,
              fileId: String,
              FSName: Match.Optional(String),
              chunkSize: Number,
              fileLength: Number
            });
            check(returnMeta, Match.Optional(Boolean));
            opts.fileId = self.sanitize(opts.fileId, 20, 'a');
            self._debug("[FilesCollection] [File Start Method] ".concat(opts.file.name, " - ").concat(opts.fileId));
            opts.___s = true;
            const {
              result
            } = await self._prepareUpload(helpers.clone(opts), this.userId, 'DDP Start Method');
            if (await self.collection.findOneAsync(result._id)) {
              throw new Meteor.Error(400, 'Can\'t start upload, data substitution detected!');
            }
            opts._id = opts.fileId;
            opts.createdAt = new Date();
            opts.maxLength = opts.fileLength;
            try {
              await self._preCollection.insertAsync(helpers.omit(opts, '___s'));
              self._createStream(result._id, result.path, helpers.omit(opts, '___s'));
            } catch (e) {
              self._debug("[FilesCollection] [File Start Method] [EXCEPTION:] ".concat(opts.file.name, " - ").concat(opts.fileId), e);
              throw new Meteor.Error(500, 'Can\'t start');
            }
            if (returnMeta) {
              return {
                uploadRoute: "".concat(self.downloadRoute, "/").concat(self.collectionName, "/__upload"),
                file: result
              };
            }
            return true;
          };

          // Method used to write file chunks
          // it receives very limited amount of meta-data
          // This method also responsible for EOF
          _methods[this._methodNames._Write] = async function (_opts) {
            let opts = _opts;
            let result;
            check(opts, {
              eof: Match.Optional(Boolean),
              fileId: String,
              binData: Match.Optional(String),
              chunkId: Match.Optional(Number)
            });
            opts.fileId = self.sanitize(opts.fileId, 20, 'a');
            if (opts.binData) {
              opts.binData = Buffer.from(opts.binData, 'base64');
            }
            const _continueUpload = await self._continueUpload(opts.fileId);
            if (!_continueUpload) {
              throw new Meteor.Error(408, 'Can\'t continue upload, session expired. Start upload again.');
            }
            ({
              result,
              opts
            } = await self._prepareUpload(Object.assign(opts, _continueUpload), this.userId, 'DDP'));
            if (opts.eof) {
              try {
                return self._handleUploadSync(result, opts);
              } catch (handleUploadErr) {
                self._debug('[FilesCollection] [Write Method] [DDP] Exception:', handleUploadErr);
                throw handleUploadErr;
              }
            } else {
              self.emit('_handleUpload', result, opts, noop);
            }
            return true;
          };

          // Method used to Abort upload
          // - Freeing memory by ending writableStreams
          // - Removing temporary record from @_preCollection
          // - Removing record from @collection
          // - .unlink()ing chunks from FS
          _methods[this._methodNames._Abort] = async function (_id) {
            check(_id, String);
            const _continueUpload = await self._continueUpload(_id);
            self._debug("[FilesCollection] [Abort Method]: ".concat(_id, " - ").concat(helpers.isObject(_continueUpload.file) ? _continueUpload.file.path : ''));
            if (self._currentUploads && self._currentUploads[_id]) {
              self._currentUploads[_id].stop();
              self._currentUploads[_id].abort();
            }
            if (_continueUpload) {
              await self._preCollection.removeAsync({
                _id
              });
              await self.removeAsync({
                _id
              });
              if (helpers.isObject(_continueUpload.file) && _continueUpload.file.path) {
                await self.unlink({
                  _id,
                  path: _continueUpload.file.path
                });
              }
            }
            return true;
          };
          Meteor.methods(_methods);
        }
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name _prepareUpload
       * @summary Internal method. Used to optimize received data and check upload permission
       * @returns {Promise<Object>}
       */
      async _prepareUpload() {
        let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        let userId = arguments.length > 1 ? arguments[1] : undefined;
        let transport = arguments.length > 2 ? arguments[2] : undefined;
        let ctx;
        if (!helpers.isBoolean(opts.eof)) {
          opts.eof = false;
        }
        if (!opts.binData) {
          opts.binData = 'EOF';
        }
        if (!helpers.isNumber(opts.chunkId)) {
          opts.chunkId = -1;
        }
        if (!helpers.isString(opts.FSName)) {
          opts.FSName = opts.fileId;
        }
        this._debug("[FilesCollection] [Upload] [".concat(transport, "] Got #").concat(opts.chunkId, "/").concat(opts.fileLength, " chunks, dst: ").concat(opts.file.name || opts.file.fileName));
        const fileName = this._getFileName(opts.file);
        const {
          extension,
          extensionWithDot
        } = this._getExt(fileName);
        if (!helpers.isObject(opts.file.meta)) {
          opts.file.meta = {};
        }
        let result = opts.file;
        result.name = fileName;
        result.meta = opts.file.meta;
        result.extension = extension;
        result.ext = extension;
        result._id = opts.fileId;
        result.userId = userId || null;
        opts.FSName = this.sanitize(opts.FSName);
        if (this.namingFunction) {
          opts.FSName = this.namingFunction(opts);
        }
        result.path = "".concat(this.storagePath(result)).concat(nodePath.sep).concat(opts.FSName).concat(extensionWithDot);
        result = Object.assign(result, this._dataToSchema(result));
        if (this.onBeforeUpload && helpers.isFunction(this.onBeforeUpload)) {
          ctx = Object.assign({
            file: opts.file
          }, {
            chunkId: opts.chunkId,
            userId: result.userId,
            async userAsync() {
              if (Meteor.users && result.userId) {
                return Meteor.users.findOneAsync(result.userId);
              }
              return null;
            },
            eof: opts.eof
          });
          const isUploadAllowed = await this.onBeforeUpload.call(ctx, result);
          if (isUploadAllowed !== true) {
            throw new Meteor.Error(403, helpers.isString(isUploadAllowed) ? isUploadAllowed : '@onBeforeUpload() returned false');
          } else {
            if (opts.___s === true && this.onInitiateUpload && helpers.isFunction(this.onInitiateUpload)) {
              await this.onInitiateUpload.call(ctx, result);
            }
          }
        } else if (opts.___s === true && this.onInitiateUpload && helpers.isFunction(this.onInitiateUpload)) {
          ctx = Object.assign({
            file: opts.file
          }, {
            chunkId: opts.chunkId,
            userId: result.userId,
            async userAsync() {
              if (Meteor.users && result.userId) {
                return Meteor.users.findOneAsync(result.userId);
              }
              return null;
            },
            eof: opts.eof
          });
          await this.onInitiateUpload.call(ctx, result);
        }
        return {
          result,
          opts
        };
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name _finishUpload
       * @summary Internal method. Finish upload, close Writable stream, add record to MongoDB and flush used memory
       * @returns {Promise<undefined>}
       */
      async _finishUpload(result, opts, cb) {
        this._debug("[FilesCollection] [Upload] [finish(ing)Upload] -> ".concat(result.path));
        fs.chmod(result.path, this.permissions, noop);
        result.type = this._getMimeType(opts.file);
        result.public = this.public;
        this._updateFileTypes(result);
        let _id;
        try {
          _id = await this.collection.insertAsync(helpers.clone(result));
          try {
            await this._preCollection.updateAsync({
              _id: opts.fileId
            }, {
              $set: {
                isFinished: true
              }
            });
            if (_id) result._id = _id;
            this._debug("[FilesCollection] [Upload] [finish(ed)Upload] -> ".concat(result.path));
            if (this.onAfterUpload && helpers.isFunction(this.onAfterUpload)) {
              await this.onAfterUpload.call(this, result);
            }
            this.emit('afterUpload', result);
            cb(null, result);
          } catch (prrUpdateError) {
            cb(prrUpdateError);
            this._debug('[FilesCollection] [Upload] [_finishUpload] [update] Error:', prrUpdateError);
          }
        } catch (colInsert) {
          cb(colInsert);
          this._debug('[FilesCollection] [Upload] [_finishUpload] [insert] Error:', colInsert);
        }
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name _handleUpload
       * @summary Internal method to handle upload process, pipe incoming data to Writable stream
       * @returns {undefined}
       */
      _handleUpload(result, opts, cb) {
        try {
          if (opts.eof) {
            this._currentUploads[result._id].end(() => {
              this.emit('_finishUpload', result, opts, cb);
            });
          } else {
            this._currentUploads[result._id].write(opts.chunkId, opts.binData, cb);
          }
        } catch (e) {
          this._debug('[_handleUpload] [EXCEPTION:]', e);
          cb && cb(e);
        }
      }

      /**
       * @locus Anywhere
       * @memberOf FilesCollection
       * @name _getMimeType
       * @param {Object} fileData - File Object
       * @summary Returns file's mime-type
       * @returns {String}
       */
      _getMimeType(fileData) {
        let mime;
        check(fileData, Object);
        if (helpers.isObject(fileData) && fileData.type) {
          mime = fileData.type;
        }
        if (!mime || !helpers.isString(mime)) {
          mime = 'application/octet-stream';
        }
        return mime;
      }

      /**
       * @locus Anywhere
       * @memberOf FilesCollection
       * @name _getUserId
       * @summary Returns `userId` matching the xmtok token derived from Meteor.server.sessions
       * @returns {String}
       */
      _getUserId(xmtok) {
        if (!xmtok) return null;

        // throw an error upon an unexpected type of Meteor.server.sessions in order to identify breaking changes
        if (!Meteor.server.sessions instanceof Map || !helpers.isObject(Meteor.server.sessions)) {
          throw new Error('Received incompatible type of Meteor.server.sessions');
        }
        if (Meteor.server.sessions instanceof Map && Meteor.server.sessions.has(xmtok) && helpers.isObject(Meteor.server.sessions.get(xmtok))) {
          // to be used with >= Meteor 1.8.1 where Meteor.server.sessions is a Map
          return Meteor.server.sessions.get(xmtok).userId;
        } else if (helpers.isObject(Meteor.server.sessions) && xmtok in Meteor.server.sessions && helpers.isObject(Meteor.server.sessions[xmtok])) {
          // to be used with < Meteor 1.8.1 where Meteor.server.sessions is an Object
          return Meteor.server.sessions[xmtok].userId;
        }
        return null;
      }

      /**
       * @locus Anywhere
       * @memberOf FilesCollection
       * @name _getUser
       * @summary Returns object with `userId` and `user()` method which return user's object
       * @returns {Object}
       */
      _getUser() {
        return this.getUser ? this.getUser(...arguments) : this._getUserDefault(...arguments);
      }

      /**
       * @locus Anywhere
       * @memberOf FilesCollection
       * @name _getUserDefault
       * @summary Default way of recognising user based on 'x_mtok' cookie, can be replaced by 'config.getUser' if defnied. Returns object with `userId` and `user()` method which return user's object
       * @returns {Object}
       */
      _getUserDefault(http) {
        const result = {
          async userAsync() {
            return null;
          },
          user() {
            return null;
          },
          userId: null
        };
        if (http) {
          let mtok = null;
          if (http.request.headers['x-mtok']) {
            mtok = http.request.headers['x-mtok'];
          } else {
            const cookie = http.request.Cookies;
            if (cookie.has('x_mtok')) {
              mtok = cookie.get('x_mtok');
            }
          }
          if (mtok) {
            const userId = this._getUserId(mtok);
            if (userId) {
              result.userAsync = () => Meteor.users.findOneAsync(userId);
              result.userId = userId;
            }
          }
        }
        return result;
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name write
       * @param {Buffer} buffer - Binary File's Buffer
       * @param {Object} opts - Object with file-data
       * @param {String} opts.name - File name, alias: `fileName`
       * @param {String} opts.type - File mime-type
       * @param {Object} opts.meta - File additional meta-data
       * @param {String} opts.userId - UserId, default *null*
       * @param {String} opts.fileId - _id, sanitized, max-length: 20; default *null*
       * @param {Boolean} proceedAfterUpload - Proceed onAfterUpload hook
       * @summary Write buffer to FS and add to FilesCollection Collection
       * @throws {Meteor.Error} If there is an error writing the file or inserting the document
       * @returns {Promise<FileRef>} Instance
       */
      async write(buffer) {
        let _opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        let _proceedAfterUpload = arguments.length > 2 ? arguments[2] : undefined;
        this._debug('[FilesCollection] [writeAsync()]');
        let opts = _opts;
        let proceedAfterUpload = _proceedAfterUpload;
        if (helpers.isBoolean(opts)) {
          proceedAfterUpload = opts;
          opts = {};
        }
        check(opts, Match.Optional(Object));
        check(proceedAfterUpload, Match.Optional(Boolean));
        opts.fileId = opts.fileId && this.sanitize(opts.fileId, 20, 'a');
        const fileId = opts.fileId || Random.id();
        const fsName = this.namingFunction ? this.namingFunction(opts) : fileId;
        const fileName = opts.name || opts.fileName ? opts.name || opts.fileName : fsName;
        const {
          extension,
          extensionWithDot
        } = this._getExt(fileName);
        opts.path = "".concat(this.storagePath(opts)).concat(nodePath.sep).concat(fsName).concat(extensionWithDot);
        opts.type = this._getMimeType(opts);
        if (!helpers.isObject(opts.meta)) {
          opts.meta = {};
        }
        if (!helpers.isNumber(opts.size)) {
          opts.size = buffer.length;
        }
        const result = this._dataToSchema({
          name: fileName,
          path: opts.path,
          meta: opts.meta,
          type: opts.type,
          size: opts.size,
          userId: opts.userId,
          extension
        });
        result._id = fileId;
        let fileRef;
        let mustCreateFileFirst = false;
        try {
          const stats = await fs.promises.stat(opts.path);
          if (!stats.isFile()) {
            mustCreateFileFirst = true;
          }
        } catch (statError) {
          mustCreateFileFirst = true;
        }
        if (mustCreateFileFirst) {
          const paths = opts.path.split('/');
          paths.pop();
          await fs.promises.mkdir(paths.join('/'), {
            recursive: true
          });
          await fs.promises.writeFile(opts.path, '');
        }
        const stream = fs.createWriteStream(opts.path, {
          flags: 'w',
          mode: this.permissions
        });
        await new Promise((resolve, reject) => {
          stream.end(buffer, streamErr => {
            if (streamErr) {
              reject(streamErr);
            } else {
              resolve();
            }
          });
        });
        try {
          const _id = await this.collection.insertAsync(result);
          fileRef = await this.collection.findOneAsync(_id);
          if (proceedAfterUpload === true) {
            if (this.onAfterUpload) {
              await this.onAfterUpload.call(this, fileRef);
            }
            this.emit('afterUploadAsync', fileRef);
          }
          this._debug("[FilesCollection] [write]: ".concat(fileName, " -> ").concat(this.collectionName));
        } catch (insertErr) {
          this._debug("[FilesCollection] [write] [insert] Error: ".concat(fileName, " -> ").concat(this.collectionName), insertErr);
          throw new Meteor.Error('writeAsync', insertErr);
        }
        return fileRef;
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name load
       * @param {String} url - URL to file
       * @param {Object} [opts] - Object with file-data
       * @param {Object} opts.headers - HTTP headers to use when requesting the file
       * @param {String} opts.name - File name, alias: `fileName`
       * @param {String} opts.type - File mime-type
       * @param {Object} opts.meta - File additional meta-data
       * @param {String} opts.userId - UserId, default *null*
       * @param {String} opts.fileId - _id, sanitized, max-length: 20; default *null*
       * @param {Number} opts.timeout - Timeout in milliseconds, default: 360000 (6 mins)
       * @param {Function} callback - function(error, fileObj){...}
       * @param {Boolean} [proceedAfterUpload] - Proceed onAfterUpload hook
       * @summary Download file over HTTP, write stream to FS, and add to FilesCollection Collection
       * @returns {Promise<fileObj>} File Object
       */
      async load(url) {
        let _opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        let _proceedAfterUpload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        this._debug("[FilesCollection] [loadAsync(".concat(url, ", ").concat(JSON.stringify(_opts), ", callback)]"));
        let opts = _opts;
        let proceedAfterUpload = _proceedAfterUpload;
        if (helpers.isBoolean(_opts)) {
          proceedAfterUpload = _opts;
          opts = {};
        }
        check(url, String);
        check(opts, Match.Optional(Object));
        check(proceedAfterUpload, Match.Optional(Boolean));
        if (!helpers.isObject(opts)) {
          opts = {
            timeout: 360000
          };
        }
        if (!opts.timeout) {
          opts.timeout = 360000;
        }
        const fileId = opts.fileId && this.sanitize(opts.fileId, 20, 'a') || Random.id();
        const fsName = this.namingFunction ? this.namingFunction(opts) : fileId;
        const pathParts = url.split('/');
        const fileName = opts.name || opts.fileName ? opts.name || opts.fileName : pathParts[pathParts.length - 1].split('?')[0] || fsName;
        const {
          extension,
          extensionWithDot
        } = this._getExt(fileName);
        opts.path = "".concat(this.storagePath(opts)).concat(nodePath.sep).concat(fsName).concat(extensionWithDot);

        // this will be the resolved fileRef
        let fileRef;

        // storeResult is a function that will be called after the file is downloaded and stored in the database
        // this might throw an error from collection.insertAsync or collection.findOneAsync
        const storeResult = async result => {
          result._id = fileId;
          const _id = await this.collection.insertAsync(result);
          fileRef = await this.collection.findOneAsync(_id);
          if (proceedAfterUpload === true) {
            if (this.onAfterUpload) {
              await this.onAfterUpload.call(this, fileRef);
            }
            this.emit('afterUploadAsync', fileRef);
          }
          this._debug("[FilesCollection] [load] [insert] ".concat(fileName, " -> ").concat(this.collectionName));
        };

        // check if the file already exists, otherwise create it
        let mustCreateFileFirst = false;
        try {
          const stats = await fs.promises.stat(opts.path);
          if (!stats.isFile()) {
            mustCreateFileFirst = true;
          }
        } catch (statError) {
          mustCreateFileFirst = true;
        }
        if (mustCreateFileFirst) {
          const paths = opts.path.split('/');
          paths.pop();
          fs.mkdirSync(paths.join('/'), {
            recursive: true
          });
          fs.writeFileSync(opts.path, '');
        }
        const wStream = fs.createWriteStream(opts.path, {
          flags: 'w',
          mode: this.permissions,
          autoClose: true,
          emitClose: false
        });
        const controller = new AbortController();
        try {
          let timer;
          if (opts.timeout > 0) {
            timer = Meteor.setTimeout(() => {
              controller.abort();
              throw new Meteor.Error(408, "Request timeout after ".concat(opts.timeout, "ms"));
            }, opts.timeout);
          }
          const res = await fetch(url, {
            headers: opts.headers || {},
            signal: controller.signal
          });
          if (timer) {
            Meteor.clearTimeout(timer);
            timer = null;
          }
          if (!res.ok) {
            throw new Error("Unexpected response ".concat(res.statusText));
          }
          await pipeline(res.body, wStream);
          const result = this._dataToSchema({
            name: fileName,
            path: opts.path,
            meta: opts.meta,
            type: opts.type || res.headers.get('content-type') || this._getMimeType({
              path: opts.path
            }),
            size: opts.size || parseInt(res.headers.get('content-length') || 0),
            userId: opts.userId,
            extension
          });
          if (!result.size) {
            const newStats = await fs.promises.stat(opts.path);
            result.versions.original.size = result.size = newStats.size;
            await storeResult(result);
          } else {
            await storeResult(result);
          }
          res.body.pipe(wStream);
        } catch (error) {
          this._debug("[FilesCollection] [loadAsync] [fetch(".concat(url, ")] Error:"), error);
          if (fs.existsSync(opts.path)) {
            await fs.promises.unlink(opts.path);
          }
          throw error;
        }
        return fileRef;
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name addFile
       * @param {String} path          - Path to file
       * @param {String} opts          - [Optional] Object with file-data
       * @param {String} opts.type     - [Optional] File mime-type
       * @param {Object} opts.meta     - [Optional] File additional meta-data
       * @param {String} opts.fileId   - _id, sanitized, max-length: 20 symbols default *null*
       * @param {Object} opts.fileName - [Optional] File name, if not specified file name and extension will be taken from path
       * @param {String} opts.userId   - [Optional] UserId, default *null*
       * @param {Boolean} proceedAfterUpload - Proceed onAfterUpload hook
       * @summary Add file from FS to FilesCollection
       * @throws {Meteor.Error} If file does not exist (400) or collection is public (403)
       * @returns {Promise<FilesCollection>} Instance
       */
      async addFile(path) {
        let _opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        let _proceedAfterUpload = arguments.length > 2 ? arguments[2] : undefined;
        this._debug("[FilesCollection] [addFile(".concat(path, ")]"));
        let opts = _opts;
        let proceedAfterUpload = _proceedAfterUpload;
        if (this.public) {
          throw new Meteor.Error(403, 'Can not run [addFile] on public collection! Just Move file to root of your server, then add record to Collection');
        }
        check(path, String);
        check(opts, Match.Optional(Object));
        check(proceedAfterUpload, Match.Optional(Boolean));
        let stats;
        try {
          stats = await fs.promises.stat(path);
        } catch (statErr) {
          if (statErr.code === 'ENOENT') {
            throw new Meteor.Error(400, "[FilesCollection] [addFile(".concat(path, ")]: File does not exist"));
          }
          throw new Meteor.Error(statErr.code, statErr.message);
        }
        if (stats.isFile()) {
          if (!helpers.isObject(opts)) {
            opts = {};
          }
          opts.path = path;
          if (!opts.fileName) {
            const pathParts = path.split(nodePath.sep);
            opts.fileName = path.split(nodePath.sep)[pathParts.length - 1];
          }
          const {
            extension
          } = this._getExt(opts.fileName);
          if (!helpers.isString(opts.type)) {
            opts.type = this._getMimeType(opts);
          }
          if (!helpers.isObject(opts.meta)) {
            opts.meta = {};
          }
          if (!helpers.isNumber(opts.size)) {
            opts.size = stats.size;
          }
          const result = this._dataToSchema({
            name: opts.fileName,
            path,
            meta: opts.meta,
            type: opts.type,
            size: opts.size,
            userId: opts.userId,
            extension,
            _storagePath: path.replace("".concat(nodePath.sep).concat(opts.fileName), ''),
            fileId: opts.fileId && this.sanitize(opts.fileId, 20, 'a') || null
          });
          let _id;
          try {
            _id = await this.collection.insertAsync(result);
          } catch (insertErr) {
            this._debug("[FilesCollection] [addFileAsync] [insertAsync] Error: ".concat(result.name, " -> ").concat(this.collectionName), insertErr);
            throw new Meteor.Error(insertErr.code, insertErr.message);
          }
          const fileRef = await this.collection.findOneAsync(_id);
          if (proceedAfterUpload === true) {
            this.onAfterUpload && this.onAfterUpload.call(this, fileRef);
            this.emit('afterUpload', fileRef);
          }
          this._debug("[FilesCollection] [addFileAsync]: ".concat(result.name, " -> ").concat(this.collectionName));
          return fileRef;
        }
        throw new Meteor.Error(400, "[FilesCollection] [addFile(".concat(path, ")]: File does not exist"));
      }

      /**
       * @locus Anywhere
       * @memberOf FilesCollection
       * @name removeAsync
       * @param {String|Object} selector - Mongo-Style selector (http://docs.meteor.com/api/collections.html#selectors)
       * @throws {Meteor.Error} If cursor is empty
       * @summary Remove documents from the collection
       * @returns {Promise<FilesCollection>} Instance
       */
      async removeAsync(selector) {
        this._debug("[FilesCollection] [removeAsync(".concat(JSON.stringify(selector), ")]"));
        if (selector === void 0) {
          return 0;
        }
        const files = this.collection.find(selector);
        if ((await files.countAsync()) > 0) {
          await files.forEachAsync(file => {
            this.unlink(file);
          });
        } else {
          throw new Meteor.Error(404, 'Cursor is empty, no files is removed');
        }
        if (this.onAfterRemove) {
          const docs = await files.fetchAsync();
          await this.collection.removeAsync(selector);
          await this.onAfterRemove(docs);
        } else {
          await this.collection.removeAsync(selector);
        }
        return this;
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name deny
       * @param {Object} rules
       * @see  https://docs.meteor.com/api/collections.html#Mongo-Collection-deny
       * @summary link Mongo.Collection deny methods
       * @returns {Mongo.Collection} Instance
       */
      deny(rules) {
        this.collection.deny(rules);
        return this.collection;
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name allow
       * @param {Object} rules
       * @see https://docs.meteor.com/api/collections.html#Mongo-Collection-allow
       * @summary link Mongo.Collection allow methods
       * @returns {Mongo.Collection} Instance
       */
      allow(rules) {
        this.collection.allow(rules);
        return this.collection;
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name denyClient
       * @see https://docs.meteor.com/api/collections.html#Mongo-Collection-deny
       * @summary Shorthands for Mongo.Collection deny method
       * @returns {Mongo.Collection} Instance
       */
      denyClient() {
        this.collection.deny({
          insert() {
            return true;
          },
          update() {
            return true;
          },
          remove() {
            return true;
          }
        });
        return this.collection;
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name allowClient
       * @see https://docs.meteor.com/api/collections.html#Mongo-Collection-allow
       * @summary Shorthands for Mongo.Collection allow method
       * @returns {Mongo.Collection} Instance
       */
      allowClient() {
        this.collection.allow({
          insert() {
            return true;
          },
          update() {
            return true;
          },
          remove() {
            return true;
          }
        });
        return this.collection;
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name unlink
       * @param {Object} fileRef - fileObj
       * @param {String} version - [Optional] file's version
       * @param {Function} callback - [Optional] callback function
       * @summary Unlink files and it's versions from FS
       * @returns {FilesCollection} Instance
       */
      unlink(fileRef, version, callback) {
        this._debug("[FilesCollection] [unlink(".concat(fileRef._id, ", ").concat(version, ")]"));
        if (version) {
          if (helpers.isObject(fileRef.versions) && helpers.isObject(fileRef.versions[version]) && fileRef.versions[version].path) {
            fs.unlink(fileRef.versions[version].path, callback || noop);
          }
        } else {
          if (helpers.isObject(fileRef.versions)) {
            for (let vKey in fileRef.versions) {
              if (fileRef.versions[vKey] && fileRef.versions[vKey].path) {
                fs.unlink(fileRef.versions[vKey].path, callback || noop);
              }
            }
          } else {
            fs.unlink(fileRef.path, callback || noop);
          }
        }
        return this;
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name _404
       * @summary Internal method, used to return 404 error
       * @returns {undefined}
       */
      _404(http) {
        this._debug("[FilesCollection] [download(".concat(http.request.originalUrl, ")] [_404] File not found"));
        const text = 'File Not Found :(';
        if (!http.response.headersSent) {
          http.response.writeHead(404, {
            'Content-Type': 'text/plain',
            'Content-Length': text.length
          });
        }
        if (!http.response.finished) {
          http.response.end(text);
        }
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name download
       * @param {Object} http    - Server HTTP object
       * @param {String} version - Requested file version
       * @param {Object} fileRef - Requested file Object
       * @summary Initiates the HTTP response
       * @returns {Promise<undefined>}
       */
      async download(http) {
        let version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'original';
        let fileRef = arguments.length > 2 ? arguments[2] : undefined;
        let vRef;
        this._debug("[FilesCollection] [download(".concat(http.request.originalUrl, ", ").concat(version, ")]"));
        if (fileRef) {
          if (helpers.has(fileRef, 'versions') && helpers.has(fileRef.versions, version)) {
            vRef = fileRef.versions[version];
            vRef._id = fileRef._id;
          } else {
            vRef = fileRef;
          }
        } else {
          vRef = false;
        }
        if (!vRef || !helpers.isObject(vRef)) {
          return this._404(http);
        } else if (fileRef) {
          if (helpers.isFunction(this.downloadCallback) && !(await this.downloadCallback(Object.assign(http, this._getUser(http)), fileRef))) {
            return this._404(http);
          }
          if (this.interceptDownload && helpers.isFunction(this.interceptDownload) && (await this.interceptDownload(http, fileRef, version)) === true) {
            return void 0;
          }
          let stats;
          try {
            stats = await fs.promises.stat(vRef.path);
          } catch (statErr) {
            if (statErr) {
              return this._404(http);
            }
          }
          if (!stats.isFile()) {
            return this._404(http);
          }
          let responseType;
          if (stats.size !== vRef.size && !this.integrityCheck) {
            vRef.size = stats.size;
          }
          if (stats.size !== vRef.size && this.integrityCheck) {
            responseType = '400';
          }
          this.serve(http, fileRef, vRef, version, null, responseType || '200');
          return void 0;
        }
        return this._404(http);
      }

      /**
       * @locus Server
       * @memberOf FilesCollection
       * @name serve
       * @param {Object} http    - Server HTTP object
       * @param {Object} fileRef - Requested file Object
       * @param {Object} vRef    - Requested file version Object
       * @param {String} version - Requested file version
       * @param {stream.Readable|null} readableStream - Readable stream, which serves binary file data
       * @param {String} responseType - Response code
       * @param {Boolean} force200 - Force 200 response code over 206
       * @summary Handle and reply to incoming request
       * @returns {undefined}
       */
      serve(http, fileRef, vRef) {
        var _http$params, _http$params$query, _http$params2, _http$params2$query;
        let version = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'original';
        let readableStream = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
        let _responseType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '200';
        let force200 = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
        let partiral = false;
        let reqRange = false;
        let dispositionType = '';
        let start;
        let end;
        let take;
        let responseType = _responseType;
        if ((_http$params = http.params) !== null && _http$params !== void 0 && (_http$params$query = _http$params.query) !== null && _http$params$query !== void 0 && _http$params$query.download && http.params.query.download === 'true') {
          dispositionType = 'attachment; ';
        } else {
          dispositionType = 'inline; ';
        }
        const dispositionName = "filename=\"".concat(encodeURI(vRef.name || fileRef.name).replace(/\,/g, '%2C'), "\"; filename*=UTF-8''").concat(encodeURIComponent(vRef.name || fileRef.name), "; ");
        const dispositionEncoding = 'charset=UTF-8';
        if (!http.response.headersSent) {
          http.response.setHeader('Content-Disposition', dispositionType + dispositionName + dispositionEncoding);
        }
        if (http.request.headers.range && !force200) {
          partiral = true;
          const array = http.request.headers.range.split(/bytes=([0-9]*)-([0-9]*)/);
          start = parseInt(array[1]);
          end = parseInt(array[2]);
          if (isNaN(end)) {
            end = vRef.size - 1;
          }
          take = end - start;
        } else {
          start = 0;
          end = vRef.size - 1;
          take = vRef.size;
        }
        if (partiral || (_http$params2 = http.params) !== null && _http$params2 !== void 0 && (_http$params2$query = _http$params2.query) !== null && _http$params2$query !== void 0 && _http$params2$query.play && http.params.query.play === 'true') {
          reqRange = {
            start,
            end
          };
          if (isNaN(start) && !isNaN(end)) {
            reqRange.start = end - take;
            reqRange.end = end;
          }
          if (!isNaN(start) && isNaN(end)) {
            reqRange.start = start;
            reqRange.end = start + take;
          }
          if (start + take >= vRef.size) {
            reqRange.end = vRef.size - 1;
          }
          if (this.strict && (reqRange.start >= vRef.size - 1 || reqRange.end > vRef.size - 1)) {
            responseType = '416';
          } else {
            responseType = '206';
          }
        } else {
          responseType = '200';
        }
        const streamErrorHandler = error => {
          this._debug("[FilesCollection] [serve(".concat(vRef.path, ", ").concat(version, ")] [500]"), error);
          if (!http.response.finished) {
            http.response.end(error.toString());
          }
        };
        const headers = helpers.isFunction(this.responseHeaders) ? this.responseHeaders(responseType, fileRef, vRef, version, http) : this.responseHeaders;
        if (!headers['Cache-Control']) {
          if (!http.response.headersSent) {
            http.response.setHeader('Cache-Control', this.cacheControl);
          }
        }
        for (let key in headers) {
          if (!http.response.headersSent) {
            http.response.setHeader(key, headers[key]);
          }
        }
        const respond = (stream, code) => {
          stream._isEnded = false;
          const closeStreamCb = closeError => {
            if (!closeError) {
              stream._isEnded = true;
            } else {
              this._debug("[FilesCollection] [serve(".concat(vRef.path, ", ").concat(version, ")] [respond] [closeStreamCb] (this is error on the stream we wish to forcefully close after it isn't needed anymore. It's okay that it throws errors. Consider this as purely informational message)"), closeError);
            }
          };
          const closeStream = () => {
            if (!stream._isEnded && !stream.destroyed) {
              try {
                if (typeof stream.close === 'function') {
                  stream.close(closeStreamCb);
                } else if (typeof stream.end === 'function') {
                  stream.end(closeStreamCb);
                } else if (typeof stream.destroy === 'function') {
                  stream.destroy('Got to close this stream', closeStreamCb);
                }
              } catch (closeStreamError) {
                // Perhaps one of the method has thrown an error
                // or stream has been already ended/closed/exhausted
              }
            }
          };
          if (!http.response.headersSent && readableStream) {
            http.response.writeHead(code);
          }
          http.request.on('aborted', () => {
            http.request.aborted = true;
          });
          stream.on('open', () => {
            if (!http.response.headersSent) {
              http.response.writeHead(code);
            }
          }).on('abort', () => {
            closeStream();
            if (!http.response.finished) {
              http.response.end();
            }
            if (!http.request.aborted) {
              http.request.destroy();
            }
          }).on('error', err => {
            closeStream();
            streamErrorHandler(err);
          }).on('end', () => {
            if (!http.response.finished) {
              http.response.end();
            }
          }).pipe(http.response);
        };
        switch (responseType) {
          case '400':
            this._debug("[FilesCollection] [serve(".concat(vRef.path, ", ").concat(version, ")] [400] Content-Length mismatch!"));
            var text = 'Content-Length mismatch!';
            if (!http.response.headersSent) {
              http.response.writeHead(400, {
                'Content-Type': 'text/plain',
                'Content-Length': text.length
              });
            }
            if (!http.response.finished) {
              http.response.end(text);
            }
            break;
          case '404':
            this._404(http);
            break;
          case '416':
            this._debug("[FilesCollection] [serve(".concat(vRef.path, ", ").concat(version, ")] [416] Content-Range is not specified!"));
            if (!http.response.headersSent) {
              http.response.writeHead(416);
            }
            if (!http.response.finished) {
              http.response.end();
            }
            break;
          case '206':
            this._debug("[FilesCollection] [serve(".concat(vRef.path, ", ").concat(version, ")] [206]"));
            if (!http.response.headersSent) {
              http.response.setHeader('Content-Range', "bytes ".concat(reqRange.start, "-").concat(reqRange.end, "/").concat(vRef.size));
            }
            respond(readableStream || fs.createReadStream(vRef.path, {
              start: reqRange.start,
              end: reqRange.end
            }), 206);
            break;
          default:
            if (!http.response.headersSent) {
              http.response.setHeader('Content-Length', "".concat(vRef.size));
            }
            this._debug("[FilesCollection] [serve(".concat(vRef.path, ", ").concat(version, ")] [200]"));
            respond(readableStream || fs.createReadStream(vRef.path), 200);
            break;
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"core.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ostrio_files/core.js                                                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      default: () => FilesCollectionCore
    });
    let EventEmitter;
    module.link("eventemitter3", {
      EventEmitter(v) {
        EventEmitter = v;
      }
    }, 0);
    let check, Match;
    module.link("meteor/check", {
      check(v) {
        check = v;
      },
      Match(v) {
        Match = v;
      }
    }, 1);
    let formatFleURL, helpers;
    module.link("./lib.js", {
      formatFleURL(v) {
        formatFleURL = v;
      },
      helpers(v) {
        helpers = v;
      }
    }, 2);
    let FilesCursor, FileCursor;
    module.link("./cursor.js", {
      FilesCursor(v) {
        FilesCursor = v;
      },
      FileCursor(v) {
        FileCursor = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class FilesCollectionCore extends EventEmitter {
      constructor() {
        super();
      }
      /*
       * @locus Anywhere
       * @memberOf FilesCollectionCore
       * @name _debug
       * @summary Print logs in debug mode
       * @returns {void}
       */
      _debug() {
        if (this.debug) {
          // eslint-disable-next-line no-console
          (console.info || console.log || function () {}).apply(void 0, arguments);
        }
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCollectionCore
       * @name _getFileName
       * @param {Object} fileData - File Object
       * @summary Returns file's name
       * @returns {String}
       */
      _getFileName(fileData) {
        const fileName = fileData.name || fileData.fileName;
        if (helpers.isString(fileName) && fileName.length > 0) {
          return (fileData.name || fileData.fileName).replace(/^\.\.+/, '').replace(/\.{2,}/g, '.').replace(/\//g, '');
        }
        return '';
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCollectionCore
       * @name _getExt
       * @param {String} FileName - File name
       * @summary Get extension from FileName
       * @returns {Object}
       */
      _getExt(fileName) {
        if (fileName.includes('.')) {
          const extension = (fileName.split('.').pop().split('?')[0] || '').toLowerCase().replace(/([^a-z0-9\-\_\.]+)/gi, '').substring(0, 20);
          return {
            ext: extension,
            extension,
            extensionWithDot: ".".concat(extension)
          };
        }
        return {
          ext: '',
          extension: '',
          extensionWithDot: ''
        };
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCollectionCore
       * @name _updateFileTypes
       * @param {Object} data - File data
       * @summary Internal method. Classify file based on 'type' field
       */
      _updateFileTypes(data) {
        data.isVideo = /^video\//i.test(data.type);
        data.isAudio = /^audio\//i.test(data.type);
        data.isImage = /^image\//i.test(data.type);
        data.isText = /^text\//i.test(data.type);
        data.isJSON = /^application\/json$/i.test(data.type);
        data.isPDF = /^application\/(x-)?pdf$/i.test(data.type);
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCollectionCore
       * @name _dataToSchema
       * @param {Object} data - File data
       * @summary Internal method. Build object in accordance with default schema from File data
       * @returns {Object}
       */
      _dataToSchema(data) {
        const ds = {
          name: data.name,
          extension: data.extension,
          ext: data.extension,
          extensionWithDot: ".".concat(data.extension),
          path: data.path,
          meta: data.meta,
          type: data.type,
          mime: data.type,
          'mime-type': data.type,
          size: data.size,
          userId: data.userId || null,
          versions: {
            original: {
              path: data.path,
              size: data.size,
              type: data.type,
              extension: data.extension
            }
          },
          _downloadRoute: data._downloadRoute || this.downloadRoute,
          _collectionName: data._collectionName || this.collectionName
        };

        //Optional fileId
        if (data.fileId) {
          ds._id = data.fileId;
        }
        this._updateFileTypes(ds);
        ds._storagePath = data._storagePath || this.storagePath(Object.assign({}, data, ds));
        return ds;
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCollectionCore
       * @name findOneAsync
       * @param {String|Object} selector - Mongo-Style selector (http://docs.meteor.com/api/collections.html#selectors)
       * @param {Object} options - Mongo-Style selector Options (http://docs.meteor.com/api/collections.html#sortspecifiers)
       * @summary Find and return Cursor for matching document Object
       * @returns {Promise<FileCursor>} Instance
       */
      async findOneAsync() {
        let selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        let options = arguments.length > 1 ? arguments[1] : undefined;
        this._debug("[FilesCollection] [findOneAsync(".concat(JSON.stringify(selector), ", ").concat(JSON.stringify(options), ")]"));
        check(selector, Match.Optional(Match.OneOf(Object, String, Boolean, Number, null)));
        check(options, Match.Optional(Object));
        const doc = await this.collection.findOneAsync(selector, options);
        if (doc) {
          return new FileCursor(doc, this);
        }
        return doc;
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCollectionCore
       * @name find
       * @param {String|Object} selector - Mongo-Style selector (http://docs.meteor.com/api/collections.html#selectors)
       * @param {Object}        options  - Mongo-Style selector Options (http://docs.meteor.com/api/collections.html#sortspecifiers)
       * @summary Find and return Cursor for matching documents
       * @returns {FilesCursor} Instance
       */
      find() {
        let selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        let options = arguments.length > 1 ? arguments[1] : undefined;
        this._debug("[FilesCollection] [find(".concat(JSON.stringify(selector), ", ").concat(JSON.stringify(options), ")]"));
        check(selector, Match.Optional(Match.OneOf(Object, String, Boolean, Number, null)));
        check(options, Match.Optional(Object));
        return new FilesCursor(selector, options, this);
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCollectionCore
       * @name updateAsync
       * @see http://docs.meteor.com/#/full/update
       * @summary link Mongo.Collection update method
       * @returns {Promise<Mongo.Collection>} Instance
       */
      async updateAsync() {
        await this.collection.updateAsync.apply(this.collection, arguments);
        return this.collection;
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCollectionCore
       * @name link
       * @param {Object} fileRef - File reference object
       * @param {String} version - Version of file you would like to request
       * @param {String} uriBase - [Optional] URI base, see - https://github.com/veliovgroup/Meteor-Files/issues/626
       * @summary Returns downloadable URL
       * @returns {String} Empty string returned in case if file not found in DB
       */
      link(fileRef) {
        let version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'original';
        let uriBase = arguments.length > 2 ? arguments[2] : undefined;
        this._debug("[FilesCollection] [link(".concat(helpers.isObject(fileRef) ? fileRef._id : void 0, ", ").concat(version, ")]"));
        check(fileRef, Object);
        if (!fileRef) {
          return '';
        }
        return formatFleURL(fileRef, version, uriBase);
      }
    }
    FilesCollectionCore.__helpers = helpers;
    FilesCollectionCore.schema = {
      _id: {
        type: String
      },
      size: {
        type: Number
      },
      name: {
        type: String
      },
      type: {
        type: String
      },
      path: {
        type: String
      },
      isVideo: {
        type: Boolean
      },
      isAudio: {
        type: Boolean
      },
      isImage: {
        type: Boolean
      },
      isText: {
        type: Boolean
      },
      isJSON: {
        type: Boolean
      },
      isPDF: {
        type: Boolean
      },
      extension: {
        type: String,
        optional: true
      },
      ext: {
        type: String,
        optional: true
      },
      extensionWithDot: {
        type: String,
        optional: true
      },
      mime: {
        type: String,
        optional: true
      },
      'mime-type': {
        type: String,
        optional: true
      },
      _storagePath: {
        type: String
      },
      _downloadRoute: {
        type: String
      },
      _collectionName: {
        type: String
      },
      public: {
        type: Boolean,
        optional: true
      },
      meta: {
        type: Object,
        blackbox: true,
        optional: true
      },
      userId: {
        type: String,
        optional: true
      },
      updatedAt: {
        type: Date,
        optional: true
      },
      versions: {
        type: Object,
        blackbox: true
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"cursor.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ostrio_files/cursor.js                                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      FileCursor: () => FileCursor,
      FilesCursor: () => FilesCursor
    });
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class FileCursor {
      constructor(_fileRef, _collection) {
        this._fileRef = _fileRef;
        this._collection = _collection;
        Object.assign(this, _fileRef);
      }

      /*
       * @locus Anywhere
       * @memberOf FileCursor
       * @name removeAsync
       * @throws {Meteor.Error} - If no file reference is provided
       * @summary Remove document
       * @returns {Promise<FileCursor>}
       */
      async removeAsync() {
        this._collection._debug('[FilesCollection] [FileCursor] [removeAsync()]');
        if (this._fileRef) {
          await this._collection.removeAsync(this._fileRef._id);
        } else {
          throw new Meteor.Error(404, 'No such file');
        }
        return this;
      }

      /*
       * @locus Anywhere
       * @memberOf FileCursor
       * @name link
       * @param version {String} - Name of file's subversion
       * @param uriBase {String} - [Optional] URI base, see - https://github.com/veliovgroup/Meteor-Files/issues/626
       * @summary Returns downloadable URL to File
       * @returns {String}
       */
      link() {
        let version = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'original';
        let uriBase = arguments.length > 1 ? arguments[1] : undefined;
        this._collection._debug("[FilesCollection] [FileCursor] [link(".concat(version, ")]"));
        if (this._fileRef) {
          return this._collection.link(this._fileRef, version, uriBase);
        }
        return '';
      }

      /*
       * @locus Anywhere
       * @memberOf FileCursor
       * @name get
       * @param property {String} - Name of sub-object property
       * @summary Returns current document as a plain Object, if `property` is specified - returns value of sub-object property
       * @returns {Object|mix}
       */
      get(property) {
        this._collection._debug("[FilesCollection] [FileCursor] [get(".concat(property, ")]"));
        if (property) {
          return this._fileRef[property];
        }
        return this._fileRef;
      }

      /*
       * @locus Anywhere
       * @memberOf FileCursor
       * @name fetch
       * @summary Returns document as plain Object in Array
       * @returns {[Object]}
       */
      fetch() {
        this._collection._debug('[FilesCollection] [FileCursor] [fetch()]');
        return [this._fileRef];
      }

      /*
       * @locus Anywhere
       * @memberOf FileCursor
       * @name with
       * @summary Returns reactive version of current FileCursor, useful to use with `{{#with}}...{{/with}}` block template helper
       * @returns {[Object]}
       */
      with() {
        this._collection._debug('[FilesCollection] [FileCursor] [with()]');
        return Object.assign(this, this._collection.collection.findOne(this._fileRef._id));
      }
    }
    class FilesCursor {
      constructor() {
        let _selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        let options = arguments.length > 1 ? arguments[1] : undefined;
        let _collection = arguments.length > 2 ? arguments[2] : undefined;
        this._collection = _collection;
        this._selector = _selector;
        this._current = -1;
        this.cursor = this._collection.collection.find(this._selector, options);
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name get
       * @summary Returns all matching document(s) as an Array. Alias of `.fetch()`
       * @returns {Promise<[Object]>}
       */
      async get() {
        this._collection._debug('[FilesCollection] [FilesCursor] [getAsync()]');
        return this.cursor.fetchAsync();
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name hasNext
       * @summary Returns `true` if there is next item available on Cursor
       * @returns {Boolean}
       */
      async hasNext() {
        this._collection._debug('[FilesCollection] [FilesCursor] [hasNextAsync()]');
        return this._current < (await this.cursor.countAsync()) - 1;
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name next
       * @summary Returns next item on Cursor, if available
       * @returns {Promise<Object|undefined>}
       */
      async next() {
        this._collection._debug('[FilesCollection] [FilesCursor] [nextAsync()]');
        return (await this.cursor.fetchAsync())[++this._current];
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name hasPrevious
       * @summary Returns `true` if there is previous item available on Cursor
       * @returns {Boolean}
       */
      hasPrevious() {
        this._collection._debug('[FilesCollection] [FilesCursor] [hasPrevious()]');
        return this._current !== -1;
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name previous
       * @summary Returns previous item on Cursor, if available
       * @returns {Promise<Object|undefined>}
       */
      async previous() {
        this._collection._debug('[FilesCollection] [FilesCursor] [previousAsync()]');
        return this.cursor.fetchAsync()[--this._current];
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name fetchAsync
       * @summary Returns all matching document(s) as an Array.
       * @returns {Promise<[Object]>}
       */
      async fetchAsync() {
        this._collection._debug('[FilesCollection] [FilesCursor] [fetchAsync()]');
        return (await this.cursor.fetchAsync()) || [];
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name first
       * @summary Returns first item on Cursor, if available
       * @returns {Promise<Object|undefined>}
       */
      async first() {
        this._collection._debug('[FilesCollection] [FilesCursor] [firstAsync()]');
        this._current = 0;
        return (await this.fetchAsync())[this._current];
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name last
       * @summary Returns last item on Cursor, if available
       * @returns {Promise<Object|undefined>}
       */
      async last() {
        this._collection._debug('[FilesCollection] [FilesCursor] [last()]');
        this._current = (await this.countAsync()) - 1;
        return (await this.fetchAsync())[this._current];
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name countAsync
       * @summary Returns the number of documents that match a query
       * @returns {Promise<Number>}
       */
      async countAsync() {
        this._collection._debug('[FilesCollection] [FilesCursor] [countAsync()]');
        return this.cursor.countAsync();
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name removeAsync
       * @summary Removes all documents that match a query
       * @returns {Promise<FilesCursor>}
       */
      async removeAsync() {
        this._collection._debug('[FilesCollection] [FilesCursor] [removeAsync()]');
        await this._collection.removeAsync(this._selector);
        return this;
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name forEachAsync
       * @param callback {Function} - Function to call. It will be called with three arguments: the `file`, a 0-based index, and cursor itself
       * @param context {Object} - An object which will be the value of `this` inside `callback`
       * @summary Call `callback` once for each matching document, sequentially and synchronously.
       * @returns {Promise<undefined>}
       */
      async forEachAsync(callback) {
        let context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        this._collection._debug('[FilesCollection] [FilesCursor] [forEachAsync()]');
        await this.cursor.forEachAsync(callback, context);
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name each
       * @summary Returns an Array of FileCursor made for each document on current cursor
       *          Useful when using in {{#each FilesCursor#each}}...{{/each}} block template helper
       * @returns {Promise<[FileCursor]>}
       */
      async each() {
        return this.mapAsync(file => {
          return new FileCursor(file, this._collection);
        });
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name mapAsync
       * @param callback {Function} - Function to call. It will be called with three arguments: the `file`, a 0-based index, and cursor itself
       * @param context {Object} - An object which will be the value of `this` inside `callback`
       * @summary Map `callback` over all matching documents. Returns an Array.
       * @returns {Promise<Array>}
       */
      async mapAsync(callback) {
        let context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        this._collection._debug('[FilesCollection] [FilesCursor] [mapAsync()]');
        return this.cursor.mapAsync(callback, context);
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name current
       * @summary Returns current item on Cursor, if available
       * @returns {Promise<Object|undefined>}
       */
      async current() {
        this._collection._debug('[FilesCollection] [FilesCursor] [currentAsync()]');
        if (this._current < 0) {
          this._current = 0;
        }
        return (await this.fetchAsync())[this._current];
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name observe
       * @param callbacks {Object} - Functions to call to deliver the result set as it changes
       * @summary Watch a query. Receive callbacks as the result set changes.
       * @url http://docs.meteor.com/api/collections.html#Mongo-Cursor-observe
       * @returns {Promise<Object>} - live query handle
       */
      async observe(callbacks) {
        this._collection._debug('[FilesCollection] [FilesCursor] [observe()]');
        return this.cursor.observe(callbacks);
      }

      /*
       * @locus Anywhere
       * @memberOf FilesCursor
       * @name observeChanges
       * @param callbacks {Object} - Functions to call to deliver the result set as it changes
       * @summary Watch a query. Receive callbacks as the result set changes. Only the differences between the old and new documents are passed to the callbacks.
       * @url http://docs.meteor.com/api/collections.html#Mongo-Cursor-observeChanges
       * @returns {Object} - live query handle
       */
      observeChanges(callbacks) {
        this._collection._debug('[FilesCollection] [FilesCursor] [observeChanges()]');
        return this.cursor.observeChanges(callbacks);
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ostrio_files/lib.js                                                                                       //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      fixJSONParse: () => fixJSONParse,
      fixJSONStringify: () => fixJSONStringify,
      formatFleURL: () => formatFleURL,
      helpers: () => helpers
    });
    let check;
    module.link("meteor/check", {
      check(v) {
        check = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const helpers = {
      sanitize() {
        let str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        let max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 28;
        let replacement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '-';
        return str.replace(/([^a-z0-9\-\_]+)/gi, replacement).substring(0, max);
      },
      isUndefined(obj) {
        return obj === void 0;
      },
      isObject(obj) {
        if (this.isArray(obj) || this.isFunction(obj)) {
          return false;
        }
        return obj === Object(obj);
      },
      isArray(obj) {
        return Array.isArray(obj);
      },
      isBoolean(obj) {
        return obj === true || obj === false || Object.prototype.toString.call(obj) === '[object Boolean]';
      },
      isFunction(obj) {
        return typeof obj === 'function' || false;
      },
      isDate(date) {
        return !Number.isNaN(new Date(date).getDate());
      },
      isEmpty(obj) {
        if (this.isDate(obj)) {
          return false;
        }
        if (this.isObject(obj)) {
          return !Object.keys(obj).length;
        }
        if (this.isArray(obj) || this.isString(obj)) {
          return !obj.length;
        }
        return false;
      },
      clone(obj) {
        if (!this.isObject(obj)) return obj;
        return this.isArray(obj) ? obj.slice() : Object.assign({}, obj);
      },
      has(_obj, path) {
        let obj = _obj;
        if (!this.isObject(obj)) {
          return false;
        }
        if (!this.isArray(path)) {
          return this.isObject(obj) && Object.prototype.hasOwnProperty.call(obj, path);
        }
        const length = path.length;
        for (let i = 0; i < length; i++) {
          if (!Object.prototype.hasOwnProperty.call(obj, path[i])) {
            return false;
          }
          obj = obj[path[i]];
        }
        return !!length;
      },
      omit(obj) {
        const clear = Object.assign({}, obj);
        for (var _len = arguments.length, keys = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          keys[_key - 1] = arguments[_key];
        }
        for (let i = keys.length - 1; i >= 0; i--) {
          delete clear[keys[i]];
        }
        return clear;
      },
      now: Date.now,
      throttle(func, wait) {
        let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        let previous = 0;
        let timeout = null;
        let result;
        const that = this;
        let self;
        let args;
        const later = () => {
          previous = options.leading === false ? 0 : that.now();
          timeout = null;
          result = func.apply(self, args);
          if (!timeout) {
            self = args = null;
          }
        };
        const throttled = function () {
          const now = that.now();
          if (!previous && options.leading === false) previous = now;
          const remaining = wait - (now - previous);
          self = this;
          args = arguments;
          if (remaining <= 0 || remaining > wait) {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
            previous = now;
            result = func.apply(self, args);
            if (!timeout) {
              self = args = null;
            }
          } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
          }
          return result;
        };
        throttled.cancel = () => {
          clearTimeout(timeout);
          previous = 0;
          timeout = self = args = null;
        };
        return throttled;
      }
    };
    const _helpers = ['String', 'Number', 'Date'];
    for (let i = 0; i < _helpers.length; i++) {
      helpers['is' + _helpers[i]] = function (obj) {
        return Object.prototype.toString.call(obj) === "[object ".concat(_helpers[i], "]");
      };
    }

    /*
     * @const {Function} fixJSONParse - Fix issue with Date parse
     */
    const fixJSONParse = function (obj) {
      for (let key in obj) {
        if (helpers.isString(obj[key]) && obj[key].includes('=--JSON-DATE--=')) {
          obj[key] = obj[key].replace('=--JSON-DATE--=', '');
          obj[key] = new Date(parseInt(obj[key]));
        } else if (helpers.isObject(obj[key])) {
          obj[key] = fixJSONParse(obj[key]);
        } else if (helpers.isArray(obj[key])) {
          let v;
          for (let i = 0; i < obj[key].length; i++) {
            v = obj[key][i];
            if (helpers.isObject(v)) {
              obj[key][i] = fixJSONParse(v);
            } else if (helpers.isString(v) && v.includes('=--JSON-DATE--=')) {
              v = v.replace('=--JSON-DATE--=', '');
              obj[key][i] = new Date(parseInt(v));
            }
          }
        }
      }
      return obj;
    };

    /*
     * @const {Function} fixJSONStringify - Fix issue with Date stringify
     */
    const fixJSONStringify = function (obj) {
      for (let key in obj) {
        if (helpers.isDate(obj[key])) {
          obj[key] = "=--JSON-DATE--=".concat(+obj[key]);
        } else if (helpers.isObject(obj[key])) {
          obj[key] = fixJSONStringify(obj[key]);
        } else if (helpers.isArray(obj[key])) {
          let v;
          for (let i = 0; i < obj[key].length; i++) {
            v = obj[key][i];
            if (helpers.isObject(v)) {
              obj[key][i] = fixJSONStringify(v);
            } else if (helpers.isDate(v)) {
              obj[key][i] = "=--JSON-DATE--=".concat(+v);
            }
          }
        }
      }
      return obj;
    };

    /*
     * @locus Anywhere
     * @private
     * @name formatFleURL
     * @param {Object} fileRef - File reference object
     * @param {String} version - [Optional] Version of file you would like build URL for
     * @param {String} uriBase - [Optional] URI base, see - https://github.com/veliovgroup/Meteor-Files/issues/626
     * @summary Returns formatted URL for file
     * @returns {String} Downloadable link
     */
    // eslint-disable-next-line camelcase, no-undef
    const formatFleURL = function (fileRef) {
      let version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'original';
      let _uriBase = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (__meteor_runtime_config__ || {}).ROOT_URL;
      check(fileRef, Object);
      check(version, String);
      let uriBase = _uriBase;
      if (!helpers.isString(uriBase)) {
        // eslint-disable-next-line camelcase, no-undef
        uriBase = (__meteor_runtime_config__ || {}).ROOT_URL || '/';
      }
      const _root = uriBase.replace(/\/+$/, '');
      const vRef = fileRef.versions && fileRef.versions[version] || fileRef || {};
      let ext;
      if (helpers.isString(vRef.extension)) {
        ext = ".".concat(vRef.extension.replace(/^\./, ''));
      } else {
        ext = '';
      }
      if (fileRef.public === true) {
        return _root + (version === 'original' ? "".concat(fileRef._downloadRoute, "/").concat(fileRef._id).concat(ext) : "".concat(fileRef._downloadRoute, "/").concat(version, "-").concat(fileRef._id).concat(ext));
      }
      return "".concat(_root).concat(fileRef._downloadRoute, "/").concat(fileRef._collectionName, "/").concat(fileRef._id, "/").concat(version, "/").concat(fileRef._id).concat(ext);
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"write-stream.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ostrio_files/write-stream.js                                                                              //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      default: () => WriteStream
    });
    let fs;
    module.link("fs-extra", {
      default(v) {
        fs = v;
      }
    }, 0);
    let nodePath;
    module.link("path", {
      default(v) {
        nodePath = v;
      }
    }, 1);
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 2);
    let helpers;
    module.link("./lib.js", {
      helpers(v) {
        helpers = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const noop = () => {};

    /**
     * @const {Object} bound   - Meteor.bindEnvironment (Fiber wrapper)
     * @const {Object} fdCache - File Descriptors Cache
     */
    const bound = Meteor.bindEnvironment(callback => callback());
    const fdCache = {};

    /**
     * @private
     * @locus Server
     * @class WriteStream
     * @param path        {String} - Path to file on FS
     * @param maxLength   {Number} - Max amount of chunks in stream
     * @param file        {Object} - fileRef Object
     * @param permissions {String} - Permissions which will be set to open descriptor (octal), like: `611` or `0o777`. Default: 0755
     * @summary writableStream wrapper class, makes sure chunks is written in given order. Implementation of queue stream.
     */
    class WriteStream {
      constructor(path, maxLength, file, permissions) {
        this.path = path.trim();
        this.maxLength = maxLength;
        this.file = file;
        this.permissions = permissions;
        if (!this.path || !helpers.isString(this.path)) {
          return;
        }
        this.fd = null;
        this.ended = false;
        this.aborted = false;
        this.writtenChunks = 0;
        if (fdCache[this.path] && !fdCache[this.path].ended && !fdCache[this.path].aborted) {
          this.fd = fdCache[this.path].fd;
          this.writtenChunks = fdCache[this.path].writtenChunks;
        } else {
          fs.stat(this.path, (statError, stats) => {
            bound(() => {
              if (statError || !stats.isFile()) {
                const paths = this.path.split(nodePath.sep);
                paths.pop();
                try {
                  fs.mkdirSync(paths.join(nodePath.sep), {
                    recursive: true
                  });
                } catch (mkdirError) {
                  throw new Meteor.Error(500, "[FilesCollection] [writeStream] [constructor] [mkdirSync] ERROR: can not make/ensure directory \"".concat(paths.join(nodePath.sep), "\""), mkdirError);
                }
                try {
                  fs.writeFileSync(this.path, '');
                } catch (writeFileError) {
                  throw new Meteor.Error(500, "[FilesCollection] [writeStream] [constructor] [writeFileSync] ERROR: can not write file \"".concat(this.path, "\""), writeFileError);
                }
              }
              fs.open(this.path, 'r+', this.permissions, (oError, fd) => {
                bound(() => {
                  if (oError) {
                    this.abort();
                    throw new Meteor.Error(500, '[FilesCollection] [writeStream] [constructor] [open] [Error:]', oError);
                  } else {
                    this.fd = fd;
                    fdCache[this.path] = this;
                  }
                });
              });
            });
          });
        }
      }

      /**
       * @memberOf writeStream
       * @name write
       * @param {Number} num - Chunk position in a stream
       * @param {Buffer} chunk - Buffer (chunk binary data)
       * @param {Function} callback - Callback
       * @summary Write chunk in given order
       * @returns {Boolean} - True if chunk is sent to stream, false if chunk is set into queue
       */
      write(num, chunk, callback) {
        if (!this.aborted && !this.ended) {
          if (this.fd) {
            fs.write(this.fd, chunk, 0, chunk.length, (num - 1) * this.file.chunkSize, (error, written, buffer) => {
              bound(() => {
                callback && callback(error, written, buffer);
                if (error) {
                  Meteor._debug('[FilesCollection] [writeStream] [write] [Error:]', error);
                  this.abort();
                } else {
                  ++this.writtenChunks;
                }
              });
            });
          } else {
            Meteor.setTimeout(() => {
              this.write(num, chunk, callback);
            }, 25);
          }
        }
        return false;
      }

      /**
       * @memberOf writeStream
       * @name end
       * @param {Function} callback - Callback
       * @summary Finishes writing to writableStream, only after all chunks in queue is written
       * @returns {Boolean} - True if stream is fulfilled, false if queue is in progress
       */
      end(callback) {
        if (!this.aborted && !this.ended) {
          if (this.writtenChunks === this.maxLength) {
            fs.close(this.fd, () => {
              bound(() => {
                delete fdCache[this.path];
                this.ended = true;
                callback && callback(void 0, true);
              });
            });
            return true;
          }
          fs.stat(this.path, (error, stat) => {
            bound(() => {
              if (!error && stat) {
                this.writtenChunks = Math.ceil(stat.size / this.file.chunkSize);
              }
              return Meteor.setTimeout(() => {
                this.end(callback);
              }, 25);
            });
          });
        } else {
          callback && callback(void 0, this.ended);
        }
        return false;
      }

      /**
       * @memberOf writeStream
       * @name abort
       * @param {Function} callback - Callback
       * @summary Aborts writing to writableStream, removes created file
       * @returns {Boolean} - True
       */
      abort(callback) {
        this.aborted = true;
        delete fdCache[this.path];
        fs.unlink(this.path, callback || noop);
        return true;
      }

      /**
       * @memberOf writeStream
       * @name stop
       * @summary Stop writing to writableStream
       * @returns {Boolean} - True
       */
      stop() {
        this.aborted = true;
        delete fdCache[this.path];
        return true;
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"fs-extra":{"package.json":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/ostrio_files/node_modules/fs-extra/package.json                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.exports = {
  "name": "fs-extra",
  "version": "8.1.0",
  "main": "./lib/index.js"
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"index.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/ostrio_files/node_modules/fs-extra/lib/index.js                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.useNode();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"eventemitter3":{"package.json":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/ostrio_files/node_modules/eventemitter3/package.json                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.exports = {
  "name": "eventemitter3",
  "version": "4.0.7",
  "main": "index.js"
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/ostrio_files/node_modules/eventemitter3/index.js                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.useNode();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"abort-controller":{"package.json":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/ostrio_files/node_modules/abort-controller/package.json                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.exports = {
  "name": "abort-controller",
  "version": "3.0.0",
  "main": "dist/abort-controller"
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dist":{"abort-controller.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/ostrio_files/node_modules/abort-controller/dist/abort-controller.js                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.useNode();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      FilesCollection: FilesCollection
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ostrio:files/server.js"
  ],
  mainModulePath: "/node_modules/meteor/ostrio:files/server.js"
}});

//# sourceURL=meteor://💻app/packages/ostrio_files.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb3N0cmlvOmZpbGVzL3NlcnZlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb3N0cmlvOmZpbGVzL2NvcmUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29zdHJpbzpmaWxlcy9jdXJzb3IuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29zdHJpbzpmaWxlcy9saWIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29zdHJpbzpmaWxlcy93cml0ZS1zdHJlYW0uanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0IiwiRmlsZXNDb2xsZWN0aW9uIiwiaGVscGVycyIsIk1vbmdvIiwibGluayIsInYiLCJmZXRjaCIsIldlYkFwcCIsIk1ldGVvciIsIlJhbmRvbSIsIkNvb2tpZXMiLCJjaGVjayIsIk1hdGNoIiwiV3JpdGVTdHJlYW0iLCJkZWZhdWx0IiwiRmlsZXNDb2xsZWN0aW9uQ29yZSIsImZpeEpTT05QYXJzZSIsImZpeEpTT05TdHJpbmdpZnkiLCJBYm9ydENvbnRyb2xsZXIiLCJmcyIsIm5vZGVRcyIsIm5vZGVQYXRoIiwicGlwZWxpbmVDYWxsYmFjayIsInBpcGVsaW5lIiwicHJvbWlzaWZ5IiwiX19yZWlmeVdhaXRGb3JEZXBzX18iLCJib3VuZCIsImJpbmRFbnZpcm9ubWVudCIsImNhbGxiYWNrIiwibm9vcCIsImNyZWF0ZUluZGV4IiwiX2NvbGxlY3Rpb24iLCJrZXlzIiwib3B0cyIsImNvbGxlY3Rpb24iLCJyYXdDb2xsZWN0aW9uIiwiZSIsImNvZGUiLCJpbmRleE5hbWUiLCJpbmRleGVzIiwiaW5kZXgiLCJhbGxNYXRjaCIsImluZGV4S2V5IiwiT2JqZWN0Iiwia2V5IiwibmFtZSIsImRyb3BJbmRleCIsIl9kZWJ1ZyIsImNvbmNhdCIsImpvaW4iLCJfbmFtZSIsImRldGFpbHMiLCJjb25zdHJ1Y3RvciIsImNvbmZpZyIsInN0b3JhZ2VQYXRoIiwiX3ByZUNvbGxlY3Rpb24iLCJfcHJlQ29sbGVjdGlvbk5hbWUiLCJhbGxvd0NsaWVudENvZGUiLCJhbGxvd2VkT3JpZ2lucyIsImFsbG93UXVlcnlTdHJpbmdDb29raWVzIiwiY2FjaGVDb250cm9sIiwiY2h1bmtTaXplIiwiY29sbGVjdGlvbk5hbWUiLCJjb250aW51ZVVwbG9hZFRUTCIsImRlYnVnIiwiZGlzYWJsZURvd25sb2FkIiwiZGlzYWJsZVVwbG9hZCIsImRvd25sb2FkQ2FsbGJhY2siLCJkb3dubG9hZFJvdXRlIiwiZ2V0VXNlciIsImludGVncml0eUNoZWNrIiwiaW50ZXJjZXB0RG93bmxvYWQiLCJpbnRlcmNlcHRSZXF1ZXN0IiwibmFtaW5nRnVuY3Rpb24iLCJvbkFmdGVyUmVtb3ZlIiwib25BZnRlclVwbG9hZCIsIm9uQmVmb3JlUmVtb3ZlIiwib25CZWZvcmVVcGxvYWQiLCJvbkluaXRpYXRlVXBsb2FkIiwicGFyZW50RGlyUGVybWlzc2lvbnMiLCJwZXJtaXNzaW9ucyIsInByb3RlY3RlZCIsInB1YmxpYyIsInJlc3BvbnNlSGVhZGVycyIsInNhbml0aXplIiwic2NoZW1hIiwic3RyaWN0Iiwic2VsZiIsImlzQm9vbGVhbiIsIk1hdGgiLCJmbG9vciIsImlzU3RyaW5nIiwiQ29sbGVjdGlvbiIsImZpbGVzQ29sbGVjdGlvbiIsIlN0cmluZyIsIkVycm9yIiwicmVwbGFjZSIsImlzRnVuY3Rpb24iLCJpc051bWJlciIsInBhcnNlSW50IiwiaXNPYmplY3QiLCJfY3VycmVudFVwbG9hZHMiLCJyZXNwb25zZUNvZGUiLCJmaWxlUmVmIiwidmVyc2lvblJlZiIsImhlYWRlcnMiLCJQcmFnbWEiLCJzaXplIiwiQ29ubmVjdGlvbiIsInR5cGUiLCJzZXAiLCJzcCIsImFwcGx5IiwiYXJndW1lbnRzIiwibm9ybWFsaXplIiwibWtkaXJTeW5jIiwibW9kZSIsInJlY3Vyc2l2ZSIsImVycm9yIiwiQm9vbGVhbiIsIk51bWJlciIsIkZ1bmN0aW9uIiwiT25lT2YiLCJSZWdFeHAiLCJfY29va2llcyIsImFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyIsImNyZWF0ZWRBdCIsImV4cGlyZUFmdGVyU2Vjb25kcyIsImJhY2tncm91bmQiLCJfcHJlQ29sbGVjdGlvbkN1cnNvciIsImZpbmQiLCJmaWVsZHMiLCJfaWQiLCJpc0ZpbmlzaGVkIiwib2JzZXJ2ZSIsImNoYW5nZWQiLCJkb2MiLCJyZW1vdmVBc3luYyIsInJlbW92ZWQiLCJzdG9wIiwiZW5kIiwiY291bnRBc3luYyIsImFib3J0IiwiX2NyZWF0ZVN0cmVhbSIsInBhdGgiLCJmaWxlTGVuZ3RoIiwiX2NvbnRpbnVlVXBsb2FkIiwiZmlsZSIsImFib3J0ZWQiLCJlbmRlZCIsImNvbnRVcGxkIiwiZmluZE9uZUFzeW5jIiwiX2NoZWNrQWNjZXNzIiwiaHR0cCIsInJlc3VsdCIsInVzZXJBc3luYyIsInVzZXJJZCIsIl9nZXRVc2VyIiwicGFyYW1zIiwiY2FsbCIsImFzc2lnbiIsInJjIiwidGV4dCIsInJlc3BvbnNlIiwiaGVhZGVyc1NlbnQiLCJ3cml0ZUhlYWQiLCJsZW5ndGgiLCJmaW5pc2hlZCIsIl9tZXRob2ROYW1lcyIsIl9BYm9ydCIsIl9Xcml0ZSIsIl9TdGFydCIsIl9SZW1vdmUiLCJvbiIsIl9oYW5kbGVVcGxvYWQiLCJfZmluaXNoVXBsb2FkIiwiX2hhbmRsZVVwbG9hZFN5bmMiLCJ3cmFwQXN5bmMiLCJiaW5kIiwiY29ubmVjdEhhbmRsZXJzIiwidXNlIiwiaHR0cFJlcSIsImh0dHBSZXNwIiwibmV4dCIsIl9wYXJzZWRVcmwiLCJpbmNsdWRlcyIsInRlc3QiLCJvcmlnaW4iLCJzZXRIZWFkZXIiLCJtZXRob2QiLCJoYW5kbGVFcnJvciIsIl9lcnJvciIsInRvU3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsImJvZHkiLCJoYW5kbGVEYXRhIiwidXNlciIsInJlcXVlc3QiLCJmaWxlSWQiLCJlb2YiLCJiaW5EYXRhIiwiQnVmZmVyIiwiZnJvbSIsImNodW5rSWQiLCJfcHJlcGFyZVVwbG9hZCIsIm1ldGEiLCJlbWl0IiwicGFyc2UiLCJqc29uRXJyIiwiX19fcyIsImNsb25lIiwicmVzIiwiRGF0ZSIsIm1heExlbmd0aCIsImluc2VydEFzeW5jIiwib21pdCIsInJldHVybk1ldGEiLCJ1cGxvYWRSb3V0ZSIsImh0dHBSZXNwRXJyIiwic2V0VGltZW91dCIsImRhdGEiLCJ1cmkiLCJpbmRleE9mIiwic3Vic3RyaW5nIiwidXJpcyIsInNwbGl0IiwicXVlcnkiLCJ2ZXJzaW9uIiwiZG93bmxvYWQiLCJfZmlsZSIsIl9tZXRob2RzIiwic2VsZWN0b3IiLCJ1c2VyRnVuY3MiLCJ1c2VycyIsImN1cnNvciIsIkZTTmFtZSIsIk9wdGlvbmFsIiwiX29wdHMiLCJoYW5kbGVVcGxvYWRFcnIiLCJ1bmxpbmsiLCJtZXRob2RzIiwidW5kZWZpbmVkIiwidHJhbnNwb3J0IiwiY3R4IiwiZmlsZU5hbWUiLCJfZ2V0RmlsZU5hbWUiLCJleHRlbnNpb24iLCJleHRlbnNpb25XaXRoRG90IiwiX2dldEV4dCIsImV4dCIsIl9kYXRhVG9TY2hlbWEiLCJpc1VwbG9hZEFsbG93ZWQiLCJjYiIsImNobW9kIiwiX2dldE1pbWVUeXBlIiwiX3VwZGF0ZUZpbGVUeXBlcyIsInVwZGF0ZUFzeW5jIiwiJHNldCIsInByclVwZGF0ZUVycm9yIiwiY29sSW5zZXJ0Iiwid3JpdGUiLCJmaWxlRGF0YSIsIm1pbWUiLCJfZ2V0VXNlcklkIiwieG10b2siLCJzZXJ2ZXIiLCJzZXNzaW9ucyIsIk1hcCIsImhhcyIsImdldCIsIl9nZXRVc2VyRGVmYXVsdCIsIm10b2siLCJjb29raWUiLCJidWZmZXIiLCJfcHJvY2VlZEFmdGVyVXBsb2FkIiwicHJvY2VlZEFmdGVyVXBsb2FkIiwiaWQiLCJmc05hbWUiLCJtdXN0Q3JlYXRlRmlsZUZpcnN0Iiwic3RhdHMiLCJwcm9taXNlcyIsInN0YXQiLCJpc0ZpbGUiLCJzdGF0RXJyb3IiLCJwYXRocyIsInBvcCIsIm1rZGlyIiwid3JpdGVGaWxlIiwic3RyZWFtIiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJmbGFncyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic3RyZWFtRXJyIiwiaW5zZXJ0RXJyIiwibG9hZCIsInVybCIsInRpbWVvdXQiLCJwYXRoUGFydHMiLCJzdG9yZVJlc3VsdCIsIndyaXRlRmlsZVN5bmMiLCJ3U3RyZWFtIiwiYXV0b0Nsb3NlIiwiZW1pdENsb3NlIiwiY29udHJvbGxlciIsInRpbWVyIiwic2lnbmFsIiwiY2xlYXJUaW1lb3V0Iiwib2siLCJzdGF0dXNUZXh0IiwibmV3U3RhdHMiLCJ2ZXJzaW9ucyIsIm9yaWdpbmFsIiwicGlwZSIsImV4aXN0c1N5bmMiLCJhZGRGaWxlIiwic3RhdEVyciIsIm1lc3NhZ2UiLCJfc3RvcmFnZVBhdGgiLCJmaWxlcyIsImZvckVhY2hBc3luYyIsImRvY3MiLCJmZXRjaEFzeW5jIiwiZGVueSIsInJ1bGVzIiwiYWxsb3ciLCJkZW55Q2xpZW50IiwiaW5zZXJ0IiwidXBkYXRlIiwicmVtb3ZlIiwiYWxsb3dDbGllbnQiLCJ2S2V5IiwiXzQwNCIsIm9yaWdpbmFsVXJsIiwidlJlZiIsInJlc3BvbnNlVHlwZSIsInNlcnZlIiwiX2h0dHAkcGFyYW1zIiwiX2h0dHAkcGFyYW1zJHF1ZXJ5IiwiX2h0dHAkcGFyYW1zMiIsIl9odHRwJHBhcmFtczIkcXVlcnkiLCJyZWFkYWJsZVN0cmVhbSIsIl9yZXNwb25zZVR5cGUiLCJmb3JjZTIwMCIsInBhcnRpcmFsIiwicmVxUmFuZ2UiLCJkaXNwb3NpdGlvblR5cGUiLCJzdGFydCIsInRha2UiLCJkaXNwb3NpdGlvbk5hbWUiLCJlbmNvZGVVUkkiLCJlbmNvZGVVUklDb21wb25lbnQiLCJkaXNwb3NpdGlvbkVuY29kaW5nIiwicmFuZ2UiLCJhcnJheSIsImlzTmFOIiwicGxheSIsInN0cmVhbUVycm9ySGFuZGxlciIsInJlc3BvbmQiLCJfaXNFbmRlZCIsImNsb3NlU3RyZWFtQ2IiLCJjbG9zZUVycm9yIiwiY2xvc2VTdHJlYW0iLCJkZXN0cm95ZWQiLCJjbG9zZSIsImRlc3Ryb3kiLCJjbG9zZVN0cmVhbUVycm9yIiwiZXJyIiwiY3JlYXRlUmVhZFN0cmVhbSIsIl9fcmVpZnlfYXN5bmNfcmVzdWx0X18iLCJfcmVpZnlFcnJvciIsImFzeW5jIiwiRXZlbnRFbWl0dGVyIiwiZm9ybWF0RmxlVVJMIiwiRmlsZXNDdXJzb3IiLCJGaWxlQ3Vyc29yIiwiY29uc29sZSIsImluZm8iLCJsb2ciLCJ0b0xvd2VyQ2FzZSIsImlzVmlkZW8iLCJpc0F1ZGlvIiwiaXNJbWFnZSIsImlzVGV4dCIsImlzSlNPTiIsImlzUERGIiwiZHMiLCJfZG93bmxvYWRSb3V0ZSIsIl9jb2xsZWN0aW9uTmFtZSIsIm9wdGlvbnMiLCJ1cmlCYXNlIiwiX19oZWxwZXJzIiwib3B0aW9uYWwiLCJibGFja2JveCIsInVwZGF0ZWRBdCIsIl9maWxlUmVmIiwicHJvcGVydHkiLCJ3aXRoIiwiZmluZE9uZSIsIl9zZWxlY3RvciIsIl9jdXJyZW50IiwiaGFzTmV4dCIsImhhc1ByZXZpb3VzIiwicHJldmlvdXMiLCJmaXJzdCIsImxhc3QiLCJjb250ZXh0IiwiZWFjaCIsIm1hcEFzeW5jIiwiY3VycmVudCIsImNhbGxiYWNrcyIsIm9ic2VydmVDaGFuZ2VzIiwic3RyIiwibWF4IiwicmVwbGFjZW1lbnQiLCJpc1VuZGVmaW5lZCIsIm9iaiIsImlzQXJyYXkiLCJBcnJheSIsInByb3RvdHlwZSIsImlzRGF0ZSIsImRhdGUiLCJnZXREYXRlIiwiaXNFbXB0eSIsInNsaWNlIiwiX29iaiIsImhhc093blByb3BlcnR5IiwiaSIsImNsZWFyIiwiX2xlbiIsIl9rZXkiLCJub3ciLCJ0aHJvdHRsZSIsImZ1bmMiLCJ3YWl0IiwidGhhdCIsImFyZ3MiLCJsYXRlciIsImxlYWRpbmciLCJ0aHJvdHRsZWQiLCJyZW1haW5pbmciLCJ0cmFpbGluZyIsImNhbmNlbCIsIl9oZWxwZXJzIiwiX3VyaUJhc2UiLCJfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fIiwiUk9PVF9VUkwiLCJfcm9vdCIsImZkQ2FjaGUiLCJ0cmltIiwiZmQiLCJ3cml0dGVuQ2h1bmtzIiwibWtkaXJFcnJvciIsIndyaXRlRmlsZUVycm9yIiwib3BlbiIsIm9FcnJvciIsIm51bSIsImNodW5rIiwid3JpdHRlbiIsImNlaWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUFBLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDO01BQUNDLGVBQWUsRUFBQ0EsQ0FBQSxLQUFJQSxlQUFlO01BQUNDLE9BQU8sRUFBQ0EsQ0FBQSxLQUFJQTtJQUFPLENBQUMsQ0FBQztJQUFDLElBQUlDLEtBQUs7SUFBQ0osTUFBTSxDQUFDSyxJQUFJLENBQUMsY0FBYyxFQUFDO01BQUNELEtBQUtBLENBQUNFLENBQUMsRUFBQztRQUFDRixLQUFLLEdBQUNFLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJQyxLQUFLO0lBQUNQLE1BQU0sQ0FBQ0ssSUFBSSxDQUFDLGNBQWMsRUFBQztNQUFDRSxLQUFLQSxDQUFDRCxDQUFDLEVBQUM7UUFBQ0MsS0FBSyxHQUFDRCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUUsTUFBTTtJQUFDUixNQUFNLENBQUNLLElBQUksQ0FBQyxlQUFlLEVBQUM7TUFBQ0csTUFBTUEsQ0FBQ0YsQ0FBQyxFQUFDO1FBQUNFLE1BQU0sR0FBQ0YsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlHLE1BQU07SUFBQ1QsTUFBTSxDQUFDSyxJQUFJLENBQUMsZUFBZSxFQUFDO01BQUNJLE1BQU1BLENBQUNILENBQUMsRUFBQztRQUFDRyxNQUFNLEdBQUNILENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJSSxNQUFNO0lBQUNWLE1BQU0sQ0FBQ0ssSUFBSSxDQUFDLGVBQWUsRUFBQztNQUFDSyxNQUFNQSxDQUFDSixDQUFDLEVBQUM7UUFBQ0ksTUFBTSxHQUFDSixDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUssT0FBTztJQUFDWCxNQUFNLENBQUNLLElBQUksQ0FBQyx1QkFBdUIsRUFBQztNQUFDTSxPQUFPQSxDQUFDTCxDQUFDLEVBQUM7UUFBQ0ssT0FBTyxHQUFDTCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSU0sS0FBSyxFQUFDQyxLQUFLO0lBQUNiLE1BQU0sQ0FBQ0ssSUFBSSxDQUFDLGNBQWMsRUFBQztNQUFDTyxLQUFLQSxDQUFDTixDQUFDLEVBQUM7UUFBQ00sS0FBSyxHQUFDTixDQUFDO01BQUEsQ0FBQztNQUFDTyxLQUFLQSxDQUFDUCxDQUFDLEVBQUM7UUFBQ08sS0FBSyxHQUFDUCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSVEsV0FBVztJQUFDZCxNQUFNLENBQUNLLElBQUksQ0FBQyxtQkFBbUIsRUFBQztNQUFDVSxPQUFPQSxDQUFDVCxDQUFDLEVBQUM7UUFBQ1EsV0FBVyxHQUFDUixDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSVUsbUJBQW1CO0lBQUNoQixNQUFNLENBQUNLLElBQUksQ0FBQyxXQUFXLEVBQUM7TUFBQ1UsT0FBT0EsQ0FBQ1QsQ0FBQyxFQUFDO1FBQUNVLG1CQUFtQixHQUFDVixDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSVcsWUFBWSxFQUFDQyxnQkFBZ0IsRUFBQ2YsT0FBTztJQUFDSCxNQUFNLENBQUNLLElBQUksQ0FBQyxVQUFVLEVBQUM7TUFBQ1ksWUFBWUEsQ0FBQ1gsQ0FBQyxFQUFDO1FBQUNXLFlBQVksR0FBQ1gsQ0FBQztNQUFBLENBQUM7TUFBQ1ksZ0JBQWdCQSxDQUFDWixDQUFDLEVBQUM7UUFBQ1ksZ0JBQWdCLEdBQUNaLENBQUM7TUFBQSxDQUFDO01BQUNILE9BQU9BLENBQUNHLENBQUMsRUFBQztRQUFDSCxPQUFPLEdBQUNHLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJYSxlQUFlO0lBQUNuQixNQUFNLENBQUNLLElBQUksQ0FBQyxrQkFBa0IsRUFBQztNQUFDVSxPQUFPQSxDQUFDVCxDQUFDLEVBQUM7UUFBQ2EsZUFBZSxHQUFDYixDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDO0lBQUMsSUFBSWMsRUFBRTtJQUFDcEIsTUFBTSxDQUFDSyxJQUFJLENBQUMsSUFBSSxFQUFDO01BQUNVLE9BQU9BLENBQUNULENBQUMsRUFBQztRQUFDYyxFQUFFLEdBQUNkLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxFQUFFLENBQUM7SUFBQyxJQUFJZSxNQUFNO0lBQUNyQixNQUFNLENBQUNLLElBQUksQ0FBQyxhQUFhLEVBQUM7TUFBQ1UsT0FBT0EsQ0FBQ1QsQ0FBQyxFQUFDO1FBQUNlLE1BQU0sR0FBQ2YsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQztJQUFDLElBQUlnQixRQUFRO0lBQUN0QixNQUFNLENBQUNLLElBQUksQ0FBQyxNQUFNLEVBQUM7TUFBQ1UsT0FBT0EsQ0FBQ1QsQ0FBQyxFQUFDO1FBQUNnQixRQUFRLEdBQUNoQixDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDO0lBQUMsSUFBSWlCLGdCQUFnQjtJQUFDdkIsTUFBTSxDQUFDSyxJQUFJLENBQUMsUUFBUSxFQUFDO01BQUNtQixRQUFRQSxDQUFDbEIsQ0FBQyxFQUFDO1FBQUNpQixnQkFBZ0IsR0FBQ2pCLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxFQUFFLENBQUM7SUFBQyxJQUFJbUIsU0FBUztJQUFDekIsTUFBTSxDQUFDSyxJQUFJLENBQUMsTUFBTSxFQUFDO01BQUNvQixTQUFTQSxDQUFDbkIsQ0FBQyxFQUFDO1FBQUNtQixTQUFTLEdBQUNuQixDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDO0lBQUMsSUFBSW9CLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBbUIxekM7SUFDQTs7SUFFQSxNQUFNRixRQUFRLEdBQUdDLFNBQVMsQ0FBQ0YsZ0JBQWdCLENBQUM7O0lBRTVDO0FBQ0E7QUFDQTtBQUNBO0lBQ0EsTUFBTUksS0FBSyxHQUFHbEIsTUFBTSxDQUFDbUIsZUFBZSxDQUFDQyxRQUFRLElBQUlBLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDNUQsTUFBTUMsSUFBSSxHQUFHLFNBQVNBLElBQUlBLENBQUEsRUFBSSxDQUFDLENBQUM7O0lBR2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQSxNQUFNQyxXQUFXLEdBQUcsTUFBQUEsQ0FBT0MsV0FBVyxFQUFFQyxJQUFJLEVBQUVDLElBQUksS0FBSztNQUNyRCxNQUFNQyxVQUFVLEdBQUdILFdBQVcsQ0FBQ0ksYUFBYSxDQUFDLENBQUM7TUFFOUMsSUFBSTtRQUNGLE1BQU1ELFVBQVUsQ0FBQ0osV0FBVyxDQUFDRSxJQUFJLEVBQUVDLElBQUksQ0FBQztNQUMxQyxDQUFDLENBQUMsT0FBT0csQ0FBQyxFQUFFO1FBQ1YsSUFBSUEsQ0FBQyxDQUFDQyxJQUFJLEtBQUssRUFBRSxFQUFFO1VBQ2pCLElBQUlDLFNBQVM7VUFDYixNQUFNQyxPQUFPLEdBQUcsTUFBTUwsVUFBVSxDQUFDSyxPQUFPLENBQUMsQ0FBQztVQUMxQyxLQUFLLE1BQU1DLEtBQUssSUFBSUQsT0FBTyxFQUFFO1lBQzNCLElBQUlFLFFBQVEsR0FBRyxJQUFJO1lBQ25CLEtBQUssTUFBTUMsUUFBUSxJQUFJQyxNQUFNLENBQUNYLElBQUksQ0FBQ0EsSUFBSSxDQUFDLEVBQUU7Y0FDeEMsSUFBSSxPQUFPUSxLQUFLLENBQUNJLEdBQUcsQ0FBQ0YsUUFBUSxDQUFDLEtBQUssV0FBVyxFQUFFO2dCQUM5Q0QsUUFBUSxHQUFHLEtBQUs7Z0JBQ2hCO2NBQ0Y7WUFDRjtZQUVBLEtBQUssTUFBTUMsUUFBUSxJQUFJQyxNQUFNLENBQUNYLElBQUksQ0FBQ1EsS0FBSyxDQUFDSSxHQUFHLENBQUMsRUFBRTtjQUM3QyxJQUFJLE9BQU9aLElBQUksQ0FBQ1UsUUFBUSxDQUFDLEtBQUssV0FBVyxFQUFFO2dCQUN6Q0QsUUFBUSxHQUFHLEtBQUs7Z0JBQ2hCO2NBQ0Y7WUFDRjtZQUVBLElBQUlBLFFBQVEsRUFBRTtjQUNaSCxTQUFTLEdBQUdFLEtBQUssQ0FBQ0ssSUFBSTtjQUN0QjtZQUNGO1VBQ0Y7VUFFQSxJQUFJUCxTQUFTLEVBQUU7WUFDYixNQUFNSixVQUFVLENBQUNZLFNBQVMsQ0FBQ1IsU0FBUyxDQUFDO1lBQ3JDLE1BQU1KLFVBQVUsQ0FBQ0osV0FBVyxDQUFDRSxJQUFJLEVBQUVDLElBQUksQ0FBQztVQUMxQztRQUNGLENBQUMsTUFBTTtVQUNMekIsTUFBTSxDQUFDdUMsTUFBTSxnQkFBQUMsTUFBQSxDQUFnQkwsTUFBTSxDQUFDWCxJQUFJLENBQUNBLElBQUksQ0FBQyxDQUFDaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBQUQsTUFBQSxDQUFjakIsV0FBVyxDQUFDbUIsS0FBSyxvQkFBZ0I7WUFBRWxCLElBQUk7WUFBRUMsSUFBSTtZQUFFa0IsT0FBTyxFQUFFZjtVQUFFLENBQUMsQ0FBQztRQUN0STtNQUNGO0lBQ0YsQ0FBQzs7SUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0EsTUFBTW5DLGVBQWUsU0FBU2MsbUJBQW1CLENBQUM7TUFDaERxQyxXQUFXQSxDQUFDQyxNQUFNLEVBQUU7UUFDbEIsS0FBSyxDQUFDLENBQUM7UUFDUCxJQUFJQyxXQUFXO1FBQ2YsSUFBSUQsTUFBTSxFQUFFO1VBQ1YsQ0FBQztZQUNDRSxjQUFjLEVBQUUsSUFBSSxDQUFDQSxjQUFjO1lBQ25DQyxrQkFBa0IsRUFBRSxJQUFJLENBQUNBLGtCQUFrQjtZQUMzQ0MsZUFBZSxFQUFFLElBQUksQ0FBQ0EsZUFBZTtZQUNyQ0MsY0FBYyxFQUFFLElBQUksQ0FBQ0EsY0FBYztZQUNuQ0MsdUJBQXVCLEVBQUUsSUFBSSxDQUFDQSx1QkFBdUI7WUFDckRDLFlBQVksRUFBRSxJQUFJLENBQUNBLFlBQVk7WUFDL0JDLFNBQVMsRUFBRSxJQUFJLENBQUNBLFNBQVM7WUFDekIzQixVQUFVLEVBQUUsSUFBSSxDQUFDQSxVQUFVO1lBQzNCNEIsY0FBYyxFQUFFLElBQUksQ0FBQ0EsY0FBYztZQUNuQ0MsaUJBQWlCLEVBQUUsSUFBSSxDQUFDQSxpQkFBaUI7WUFDekNDLEtBQUssRUFBRSxJQUFJLENBQUNBLEtBQUs7WUFDakJDLGVBQWUsRUFBRSxJQUFJLENBQUNBLGVBQWU7WUFDckNDLGFBQWEsRUFBRSxJQUFJLENBQUNBLGFBQWE7WUFDakNDLGdCQUFnQixFQUFFLElBQUksQ0FBQ0EsZ0JBQWdCO1lBQ3ZDQyxhQUFhLEVBQUUsSUFBSSxDQUFDQSxhQUFhO1lBQ2pDQyxPQUFPLEVBQUUsSUFBSSxDQUFDQSxPQUFPO1lBQ3JCQyxjQUFjLEVBQUUsSUFBSSxDQUFDQSxjQUFjO1lBQ25DQyxpQkFBaUIsRUFBRSxJQUFJLENBQUNBLGlCQUFpQjtZQUN6Q0MsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDQSxnQkFBZ0I7WUFDdkNDLGNBQWMsRUFBRSxJQUFJLENBQUNBLGNBQWM7WUFDbkNDLGFBQWEsRUFBRSxJQUFJLENBQUNBLGFBQWE7WUFDakNDLGFBQWEsRUFBRSxJQUFJLENBQUNBLGFBQWE7WUFDakNDLGNBQWMsRUFBRSxJQUFJLENBQUNBLGNBQWM7WUFDbkNDLGNBQWMsRUFBRSxJQUFJLENBQUNBLGNBQWM7WUFDbkNDLGdCQUFnQixFQUFFLElBQUksQ0FBQ0EsZ0JBQWdCO1lBQ3ZDQyxvQkFBb0IsRUFBRSxJQUFJLENBQUNBLG9CQUFvQjtZQUMvQ0MsV0FBVyxFQUFFLElBQUksQ0FBQ0EsV0FBVztZQUM3QkMsU0FBUyxFQUFFLElBQUksQ0FBQ0EsU0FBUztZQUN6QkMsTUFBTSxFQUFFLElBQUksQ0FBQ0EsTUFBTTtZQUNuQkMsZUFBZSxFQUFFLElBQUksQ0FBQ0EsZUFBZTtZQUNyQ0MsUUFBUSxFQUFFLElBQUksQ0FBQ0EsUUFBUTtZQUN2QkMsTUFBTSxFQUFFLElBQUksQ0FBQ0EsTUFBTTtZQUNuQi9CLFdBQVc7WUFDWGdDLE1BQU0sRUFBRSxJQUFJLENBQUNBO1VBQ2YsQ0FBQyxHQUFHakMsTUFBTTtRQUNaO1FBRUEsTUFBTWtDLElBQUksR0FBRyxJQUFJO1FBRWpCLElBQUksQ0FBQ3JGLE9BQU8sQ0FBQ3NGLFNBQVMsQ0FBQyxJQUFJLENBQUN4QixLQUFLLENBQUMsRUFBRTtVQUNsQyxJQUFJLENBQUNBLEtBQUssR0FBRyxLQUFLO1FBQ3BCO1FBRUEsSUFBSSxDQUFDOUQsT0FBTyxDQUFDc0YsU0FBUyxDQUFDLElBQUksQ0FBQ04sTUFBTSxDQUFDLEVBQUU7VUFDbkMsSUFBSSxDQUFDQSxNQUFNLEdBQUcsS0FBSztRQUNyQjtRQUVBLElBQUksQ0FBQyxJQUFJLENBQUNELFNBQVMsRUFBRTtVQUNuQixJQUFJLENBQUNBLFNBQVMsR0FBRyxLQUFLO1FBQ3hCO1FBRUEsSUFBSSxDQUFDLElBQUksQ0FBQ3BCLFNBQVMsRUFBRTtVQUNuQixJQUFJLENBQUNBLFNBQVMsR0FBRyxJQUFJLEdBQUcsR0FBRztRQUM3QjtRQUVBLElBQUksQ0FBQ0EsU0FBUyxHQUFHNEIsSUFBSSxDQUFDQyxLQUFLLENBQUMsSUFBSSxDQUFDN0IsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFFbkQsSUFBSSxDQUFDM0QsT0FBTyxDQUFDeUYsUUFBUSxDQUFDLElBQUksQ0FBQzdCLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDNUIsVUFBVSxFQUFFO1VBQzlELElBQUksQ0FBQzRCLGNBQWMsR0FBRyxtQkFBbUI7UUFDM0M7UUFFQSxJQUFJLENBQUMsSUFBSSxDQUFDNUIsVUFBVSxFQUFFO1VBQ3BCLElBQUksQ0FBQ0EsVUFBVSxHQUFHLElBQUkvQixLQUFLLENBQUN5RixVQUFVLENBQUMsSUFBSSxDQUFDOUIsY0FBYyxDQUFDO1FBQzdELENBQUMsTUFBTTtVQUNMLElBQUksQ0FBQ0EsY0FBYyxHQUFHLElBQUksQ0FBQzVCLFVBQVUsQ0FBQ2dCLEtBQUs7UUFDN0M7UUFFQSxJQUFJLENBQUNoQixVQUFVLENBQUMyRCxlQUFlLEdBQUcsSUFBSTtRQUN0Q2xGLEtBQUssQ0FBQyxJQUFJLENBQUNtRCxjQUFjLEVBQUVnQyxNQUFNLENBQUM7UUFFbEMsSUFBSSxJQUFJLENBQUNaLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQ2QsYUFBYSxFQUFFO1VBQ3RDLE1BQU0sSUFBSTVELE1BQU0sQ0FBQ3VGLEtBQUssQ0FBQyxHQUFHLHNCQUFBL0MsTUFBQSxDQUFzQixJQUFJLENBQUNjLGNBQWMsNEtBQW1LLENBQUM7UUFDek87UUFFQSxJQUFJLENBQUM1RCxPQUFPLENBQUN5RixRQUFRLENBQUMsSUFBSSxDQUFDdkIsYUFBYSxDQUFDLEVBQUU7VUFDekMsSUFBSSxDQUFDQSxhQUFhLEdBQUcsY0FBYztRQUNyQztRQUVBLElBQUksQ0FBQ0EsYUFBYSxHQUFHLElBQUksQ0FBQ0EsYUFBYSxDQUFDNEIsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7UUFFMUQsSUFBSSxDQUFDOUYsT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQ3hCLGNBQWMsQ0FBQyxFQUFFO1VBQzVDLElBQUksQ0FBQ0EsY0FBYyxHQUFHLEtBQUs7UUFDN0I7UUFFQSxJQUFJLENBQUN2RSxPQUFPLENBQUMrRixVQUFVLENBQUMsSUFBSSxDQUFDcEIsY0FBYyxDQUFDLEVBQUU7VUFDNUMsSUFBSSxDQUFDQSxjQUFjLEdBQUcsS0FBSztRQUM3QjtRQUVBLElBQUksQ0FBQzNFLE9BQU8sQ0FBQytGLFVBQVUsQ0FBQyxJQUFJLENBQUM1QixPQUFPLENBQUMsRUFBRTtVQUNyQyxJQUFJLENBQUNBLE9BQU8sR0FBRyxLQUFLO1FBQ3RCO1FBRUEsSUFBSSxDQUFDbkUsT0FBTyxDQUFDc0YsU0FBUyxDQUFDLElBQUksQ0FBQy9CLGVBQWUsQ0FBQyxFQUFFO1VBQzVDLElBQUksQ0FBQ0EsZUFBZSxHQUFHLElBQUk7UUFDN0I7UUFFQSxJQUFJLENBQUN2RCxPQUFPLENBQUMrRixVQUFVLENBQUMsSUFBSSxDQUFDbkIsZ0JBQWdCLENBQUMsRUFBRTtVQUM5QyxJQUFJLENBQUNBLGdCQUFnQixHQUFHLEtBQUs7UUFDL0I7UUFFQSxJQUFJLENBQUM1RSxPQUFPLENBQUMrRixVQUFVLENBQUMsSUFBSSxDQUFDekIsZ0JBQWdCLENBQUMsRUFBRTtVQUM5QyxJQUFJLENBQUNBLGdCQUFnQixHQUFHLEtBQUs7UUFDL0I7UUFFQSxJQUFJLENBQUN0RSxPQUFPLENBQUMrRixVQUFVLENBQUMsSUFBSSxDQUFDMUIsaUJBQWlCLENBQUMsRUFBRTtVQUMvQyxJQUFJLENBQUNBLGlCQUFpQixHQUFHLEtBQUs7UUFDaEM7UUFFQSxJQUFJLENBQUNyRSxPQUFPLENBQUNzRixTQUFTLENBQUMsSUFBSSxDQUFDRixNQUFNLENBQUMsRUFBRTtVQUNuQyxJQUFJLENBQUNBLE1BQU0sR0FBRyxJQUFJO1FBQ3BCO1FBRUEsSUFBSSxDQUFDcEYsT0FBTyxDQUFDc0YsU0FBUyxDQUFDLElBQUksQ0FBQzdCLHVCQUF1QixDQUFDLEVBQUU7VUFDcEQsSUFBSSxDQUFDQSx1QkFBdUIsR0FBRyxLQUFLO1FBQ3RDO1FBRUEsSUFBSSxDQUFDekQsT0FBTyxDQUFDZ0csUUFBUSxDQUFDLElBQUksQ0FBQ2xCLFdBQVcsQ0FBQyxFQUFFO1VBQ3ZDLElBQUksQ0FBQ0EsV0FBVyxHQUFHbUIsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDdkM7UUFFQSxJQUFJLENBQUNqRyxPQUFPLENBQUNnRyxRQUFRLENBQUMsSUFBSSxDQUFDbkIsb0JBQW9CLENBQUMsRUFBRTtVQUNoRCxJQUFJLENBQUNBLG9CQUFvQixHQUFHb0IsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDaEQ7UUFFQSxJQUFJLENBQUNqRyxPQUFPLENBQUN5RixRQUFRLENBQUMsSUFBSSxDQUFDL0IsWUFBWSxDQUFDLEVBQUU7VUFDeEMsSUFBSSxDQUFDQSxZQUFZLEdBQUcsNkNBQTZDO1FBQ25FO1FBRUEsSUFBSSxDQUFDMUQsT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQ3RCLGFBQWEsQ0FBQyxFQUFFO1VBQzNDLElBQUksQ0FBQ0EsYUFBYSxHQUFHLEtBQUs7UUFDNUI7UUFFQSxJQUFJLENBQUN6RSxPQUFPLENBQUNzRixTQUFTLENBQUMsSUFBSSxDQUFDdEIsYUFBYSxDQUFDLEVBQUU7VUFDMUMsSUFBSSxDQUFDQSxhQUFhLEdBQUcsS0FBSztRQUM1QjtRQUVBLElBQUksQ0FBQ2hFLE9BQU8sQ0FBQytGLFVBQVUsQ0FBQyxJQUFJLENBQUN2QixhQUFhLENBQUMsRUFBRTtVQUMzQyxJQUFJLENBQUNBLGFBQWEsR0FBRyxLQUFLO1FBQzVCO1FBRUEsSUFBSSxDQUFDeEUsT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQ3JCLGNBQWMsQ0FBQyxFQUFFO1VBQzVDLElBQUksQ0FBQ0EsY0FBYyxHQUFHLEtBQUs7UUFDN0I7UUFFQSxJQUFJLENBQUMxRSxPQUFPLENBQUNzRixTQUFTLENBQUMsSUFBSSxDQUFDbEIsY0FBYyxDQUFDLEVBQUU7VUFDM0MsSUFBSSxDQUFDQSxjQUFjLEdBQUcsSUFBSTtRQUM1QjtRQUVBLElBQUksQ0FBQ3BFLE9BQU8sQ0FBQ3NGLFNBQVMsQ0FBQyxJQUFJLENBQUN2QixlQUFlLENBQUMsRUFBRTtVQUM1QyxJQUFJLENBQUNBLGVBQWUsR0FBRyxLQUFLO1FBQzlCO1FBRUEsSUFBSSxJQUFJLENBQUNQLGNBQWMsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDQSxjQUFjLEtBQUssS0FBSyxDQUFDLEVBQUU7VUFDbEUsSUFBSSxDQUFDQSxjQUFjLEdBQUcsaUNBQWlDO1FBQ3pEO1FBRUEsSUFBSSxDQUFDeEQsT0FBTyxDQUFDa0csUUFBUSxDQUFDLElBQUksQ0FBQ0MsZUFBZSxDQUFDLEVBQUU7VUFDM0MsSUFBSSxDQUFDQSxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQzNCO1FBRUEsSUFBSSxDQUFDbkcsT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQzlCLGdCQUFnQixDQUFDLEVBQUU7VUFDOUMsSUFBSSxDQUFDQSxnQkFBZ0IsR0FBRyxLQUFLO1FBQy9CO1FBRUEsSUFBSSxDQUFDakUsT0FBTyxDQUFDZ0csUUFBUSxDQUFDLElBQUksQ0FBQ25DLGlCQUFpQixDQUFDLEVBQUU7VUFDN0MsSUFBSSxDQUFDQSxpQkFBaUIsR0FBRyxLQUFLO1FBQ2hDO1FBRUEsSUFBSSxDQUFDN0QsT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQ2IsUUFBUSxDQUFDLEVBQUU7VUFDdEMsSUFBSSxDQUFDQSxRQUFRLEdBQUdsRixPQUFPLENBQUNrRixRQUFRO1FBQ2xDO1FBRUEsSUFBSSxDQUFDbEYsT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQ2QsZUFBZSxDQUFDLEVBQUU7VUFDN0MsSUFBSSxDQUFDQSxlQUFlLEdBQUcsQ0FBQ21CLFlBQVksRUFBRUMsT0FBTyxFQUFFQyxVQUFVLEtBQUs7WUFDNUQsTUFBTUMsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUNsQixRQUFRSCxZQUFZO2NBQ3BCLEtBQUssS0FBSztnQkFDUkcsT0FBTyxDQUFDQyxNQUFNLEdBQUcsU0FBUztnQkFDMUJELE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLFNBQVM7Z0JBQ3hDO2NBQ0YsS0FBSyxLQUFLO2dCQUNSQSxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsVUFBVTtnQkFDckM7Y0FDRixLQUFLLEtBQUs7Z0JBQ1JBLE9BQU8sQ0FBQyxlQUFlLENBQUMsY0FBQXpELE1BQUEsQ0FBY3dELFVBQVUsQ0FBQ0csSUFBSSxDQUFFO2dCQUN2RDtjQUNGO2dCQUNFO1lBQ0Y7WUFFQUYsT0FBTyxDQUFDRyxVQUFVLEdBQUcsWUFBWTtZQUNqQ0gsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHRCxVQUFVLENBQUNLLElBQUksSUFBSSwwQkFBMEI7WUFDdkVKLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxPQUFPO1lBQ2xDLE9BQU9BLE9BQU87VUFDaEIsQ0FBQztRQUNIO1FBRUEsSUFBSSxJQUFJLENBQUN2QixNQUFNLElBQUksQ0FBQzVCLFdBQVcsRUFBRTtVQUMvQixNQUFNLElBQUk5QyxNQUFNLENBQUN1RixLQUFLLENBQUMsR0FBRyxzQkFBQS9DLE1BQUEsQ0FBc0IsSUFBSSxDQUFDYyxjQUFjLHdKQUErSSxDQUFDO1FBQ3JOO1FBRUEsSUFBSSxDQUFDUixXQUFXLEVBQUU7VUFDaEJBLFdBQVcsR0FBRyxTQUFBQSxDQUFBLEVBQVk7WUFDeEIsZ0JBQUFOLE1BQUEsQ0FBZ0IzQixRQUFRLENBQUN5RixHQUFHLFNBQUE5RCxNQUFBLENBQU0zQixRQUFRLENBQUN5RixHQUFHLGFBQUE5RCxNQUFBLENBQVUzQixRQUFRLENBQUN5RixHQUFHLEVBQUE5RCxNQUFBLENBQUd1QyxJQUFJLENBQUN6QixjQUFjO1VBQzVGLENBQUM7UUFDSDtRQUVBLElBQUk1RCxPQUFPLENBQUN5RixRQUFRLENBQUNyQyxXQUFXLENBQUMsRUFBRTtVQUNqQyxJQUFJLENBQUNBLFdBQVcsR0FBRyxNQUFNQSxXQUFXO1FBQ3RDLENBQUMsTUFBTTtVQUNMLElBQUksQ0FBQ0EsV0FBVyxHQUFHLFlBQVk7WUFDN0IsSUFBSXlELEVBQUUsR0FBR3pELFdBQVcsQ0FBQzBELEtBQUssQ0FBQ3pCLElBQUksRUFBRTBCLFNBQVMsQ0FBQztZQUMzQyxJQUFJLENBQUMvRyxPQUFPLENBQUN5RixRQUFRLENBQUNvQixFQUFFLENBQUMsRUFBRTtjQUN6QixNQUFNLElBQUl2RyxNQUFNLENBQUN1RixLQUFLLENBQUMsR0FBRyxzQkFBQS9DLE1BQUEsQ0FBc0J1QyxJQUFJLENBQUN6QixjQUFjLHFEQUFnRCxDQUFDO1lBQ3RIO1lBQ0FpRCxFQUFFLEdBQUdBLEVBQUUsQ0FBQ2YsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDMUIsT0FBTzNFLFFBQVEsQ0FBQzZGLFNBQVMsQ0FBQ0gsRUFBRSxDQUFDO1VBQy9CLENBQUM7UUFDSDtRQUVBLElBQUksQ0FBQ2hFLE1BQU0sQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUNPLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFFLElBQUk7VUFDRm5DLEVBQUUsQ0FBQ2dHLFNBQVMsQ0FBQyxJQUFJLENBQUM3RCxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNqQzhELElBQUksRUFBRSxJQUFJLENBQUNyQyxvQkFBb0I7WUFDL0JzQyxTQUFTLEVBQUU7VUFDYixDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsT0FBT0MsS0FBSyxFQUFFO1VBQ2QsSUFBSUEsS0FBSyxFQUFFO1lBQ1QsTUFBTSxJQUFJOUcsTUFBTSxDQUFDdUYsS0FBSyxDQUFDLEdBQUcsc0JBQUEvQyxNQUFBLENBQXNCdUMsSUFBSSxDQUFDekIsY0FBYyxlQUFBZCxNQUFBLENBQVcsSUFBSSxDQUFDTSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsMEJBQXNCZ0UsS0FBSyxDQUFDO1VBQ2hJO1FBQ0Y7UUFFQTNHLEtBQUssQ0FBQyxJQUFJLENBQUMyRSxNQUFNLEVBQUVpQyxPQUFPLENBQUM7UUFDM0I1RyxLQUFLLENBQUMsSUFBSSxDQUFDcUUsV0FBVyxFQUFFd0MsTUFBTSxDQUFDO1FBQy9CN0csS0FBSyxDQUFDLElBQUksQ0FBQzJDLFdBQVcsRUFBRW1FLFFBQVEsQ0FBQztRQUNqQzlHLEtBQUssQ0FBQyxJQUFJLENBQUNpRCxZQUFZLEVBQUVrQyxNQUFNLENBQUM7UUFDaENuRixLQUFLLENBQUMsSUFBSSxDQUFDK0QsYUFBYSxFQUFFOUQsS0FBSyxDQUFDOEcsS0FBSyxDQUFDLEtBQUssRUFBRUQsUUFBUSxDQUFDLENBQUM7UUFDdkQ5RyxLQUFLLENBQUMsSUFBSSxDQUFDZ0UsYUFBYSxFQUFFL0QsS0FBSyxDQUFDOEcsS0FBSyxDQUFDLEtBQUssRUFBRUQsUUFBUSxDQUFDLENBQUM7UUFDdkQ5RyxLQUFLLENBQUMsSUFBSSxDQUFDdUQsYUFBYSxFQUFFcUQsT0FBTyxDQUFDO1FBQ2xDNUcsS0FBSyxDQUFDLElBQUksQ0FBQzJELGNBQWMsRUFBRWlELE9BQU8sQ0FBQztRQUNuQzVHLEtBQUssQ0FBQyxJQUFJLENBQUNpRSxjQUFjLEVBQUVoRSxLQUFLLENBQUM4RyxLQUFLLENBQUMsS0FBSyxFQUFFRCxRQUFRLENBQUMsQ0FBQztRQUN4RDlHLEtBQUssQ0FBQyxJQUFJLENBQUNzRCxlQUFlLEVBQUVzRCxPQUFPLENBQUM7UUFDcEM1RyxLQUFLLENBQUMsSUFBSSxDQUFDd0QsZ0JBQWdCLEVBQUV2RCxLQUFLLENBQUM4RyxLQUFLLENBQUMsS0FBSyxFQUFFRCxRQUFRLENBQUMsQ0FBQztRQUMxRDlHLEtBQUssQ0FBQyxJQUFJLENBQUM2RCxnQkFBZ0IsRUFBRTVELEtBQUssQ0FBQzhHLEtBQUssQ0FBQyxLQUFLLEVBQUVELFFBQVEsQ0FBQyxDQUFDO1FBQzFEOUcsS0FBSyxDQUFDLElBQUksQ0FBQzRELGlCQUFpQixFQUFFM0QsS0FBSyxDQUFDOEcsS0FBSyxDQUFDLEtBQUssRUFBRUQsUUFBUSxDQUFDLENBQUM7UUFDM0Q5RyxLQUFLLENBQUMsSUFBSSxDQUFDb0QsaUJBQWlCLEVBQUV5RCxNQUFNLENBQUM7UUFDckM3RyxLQUFLLENBQUMsSUFBSSxDQUFDd0UsZUFBZSxFQUFFdkUsS0FBSyxDQUFDOEcsS0FBSyxDQUFDL0UsTUFBTSxFQUFFOEUsUUFBUSxDQUFDLENBQUM7UUFDMUQ5RyxLQUFLLENBQUMsSUFBSSxDQUFDK0MsY0FBYyxFQUFFOUMsS0FBSyxDQUFDOEcsS0FBSyxDQUFDSCxPQUFPLEVBQUVJLE1BQU0sQ0FBQyxDQUFDO1FBQ3hEaEgsS0FBSyxDQUFDLElBQUksQ0FBQ2dELHVCQUF1QixFQUFFNEQsT0FBTyxDQUFDO1FBRTVDLElBQUksQ0FBQ0ssUUFBUSxHQUFHLElBQUlsSCxPQUFPLENBQUM7VUFDMUJpRCx1QkFBdUIsRUFBRSxJQUFJLENBQUNBLHVCQUF1QjtVQUNyRGtFLHFCQUFxQixFQUFFLElBQUksQ0FBQ25FO1FBQzlCLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxJQUFJLENBQUNRLGFBQWEsRUFBRTtVQUN2QixJQUFJLENBQUNoRSxPQUFPLENBQUN5RixRQUFRLENBQUMsSUFBSSxDQUFDbkMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQ0QsY0FBYyxFQUFFO1lBQ3RFLElBQUksQ0FBQ0Msa0JBQWtCLFlBQUFSLE1BQUEsQ0FBWSxJQUFJLENBQUNjLGNBQWMsQ0FBRTtVQUMxRDtVQUVBLElBQUksQ0FBQyxJQUFJLENBQUNQLGNBQWMsRUFBRTtZQUN4QixJQUFJLENBQUNBLGNBQWMsR0FBRyxJQUFJcEQsS0FBSyxDQUFDeUYsVUFBVSxDQUFDLElBQUksQ0FBQ3BDLGtCQUFrQixDQUFDO1VBQ3JFLENBQUMsTUFBTTtZQUNMLElBQUksQ0FBQ0Esa0JBQWtCLEdBQUcsSUFBSSxDQUFDRCxjQUFjLENBQUNMLEtBQUs7VUFDckQ7VUFDQXZDLEtBQUssQ0FBQyxJQUFJLENBQUM2QyxrQkFBa0IsRUFBRXNDLE1BQU0sQ0FBQztVQUV0Q2hFLFdBQVcsQ0FBQyxJQUFJLENBQUN5QixjQUFjLEVBQUU7WUFBRXVFLFNBQVMsRUFBRTtVQUFFLENBQUMsRUFBRTtZQUFFQyxrQkFBa0IsRUFBRSxJQUFJLENBQUNoRSxpQkFBaUI7WUFBRWlFLFVBQVUsRUFBRTtVQUFLLENBQUMsQ0FBQztVQUNwSCxNQUFNQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMxRSxjQUFjLENBQUMyRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDeERDLE1BQU0sRUFBRTtjQUNOQyxHQUFHLEVBQUUsQ0FBQztjQUNOQyxVQUFVLEVBQUU7WUFDZDtVQUNGLENBQUMsQ0FBQztVQUVGSixvQkFBb0IsQ0FBQ0ssT0FBTyxDQUFDO1lBQzNCLE1BQU1DLE9BQU9BLENBQUNDLEdBQUcsRUFBRTtjQUNqQixJQUFJQSxHQUFHLENBQUNILFVBQVUsRUFBRTtnQkFDbEI5QyxJQUFJLENBQUN4QyxNQUFNLGdFQUFBQyxNQUFBLENBQWdFd0YsR0FBRyxDQUFDSixHQUFHLENBQUUsQ0FBQztnQkFDckYsTUFBTTdDLElBQUksQ0FBQ2hDLGNBQWMsQ0FBQ2tGLFdBQVcsQ0FBQztrQkFBQ0wsR0FBRyxFQUFFSSxHQUFHLENBQUNKO2dCQUFHLENBQUMsQ0FBQztjQUN2RDtZQUNGLENBQUM7WUFDRCxNQUFNTSxPQUFPQSxDQUFDRixHQUFHLEVBQUU7Y0FDakI7Y0FDQTtjQUNBakQsSUFBSSxDQUFDeEMsTUFBTSxnRUFBQUMsTUFBQSxDQUFnRXdGLEdBQUcsQ0FBQ0osR0FBRyxDQUFFLENBQUM7Y0FDckYsSUFBSWxJLE9BQU8sQ0FBQ2tHLFFBQVEsQ0FBQ2IsSUFBSSxDQUFDYyxlQUFlLENBQUNtQyxHQUFHLENBQUNKLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ25EN0MsSUFBSSxDQUFDYyxlQUFlLENBQUNtQyxHQUFHLENBQUNKLEdBQUcsQ0FBQyxDQUFDTyxJQUFJLENBQUMsQ0FBQztnQkFDcENwRCxJQUFJLENBQUNjLGVBQWUsQ0FBQ21DLEdBQUcsQ0FBQ0osR0FBRyxDQUFDLENBQUNRLEdBQUcsQ0FBQyxDQUFDOztnQkFFbkM7Z0JBQ0E7Z0JBQ0EsSUFBSSxDQUFDSixHQUFHLENBQUNILFVBQVUsSUFBSSxDQUFDLE1BQU05QyxJQUFJLENBQUNyRCxVQUFVLENBQUNnRyxJQUFJLENBQUM7a0JBQUVFLEdBQUcsRUFBRUksR0FBRyxDQUFDSjtnQkFBSSxDQUFDLENBQUMsQ0FBQ1MsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUU7a0JBQ3hGdEQsSUFBSSxDQUFDeEMsTUFBTSwrRUFBQUMsTUFBQSxDQUErRXdGLEdBQUcsQ0FBQ0osR0FBRyxDQUFFLENBQUM7a0JBQ3BHN0MsSUFBSSxDQUFDYyxlQUFlLENBQUNtQyxHQUFHLENBQUNKLEdBQUcsQ0FBQyxDQUFDVSxLQUFLLENBQUMsQ0FBQztnQkFDdkM7Z0JBRUEsT0FBT3ZELElBQUksQ0FBQ2MsZUFBZSxDQUFDbUMsR0FBRyxDQUFDSixHQUFHLENBQUM7Y0FDdEM7WUFDRjtVQUNGLENBQUMsQ0FBQztVQUVGLElBQUksQ0FBQ1csYUFBYSxHQUFHLENBQUNYLEdBQUcsRUFBRVksSUFBSSxFQUFFL0csSUFBSSxLQUFLO1lBQ3hDLElBQUksQ0FBQ29FLGVBQWUsQ0FBQytCLEdBQUcsQ0FBQyxHQUFHLElBQUl2SCxXQUFXLENBQUNtSSxJQUFJLEVBQUUvRyxJQUFJLENBQUNnSCxVQUFVLEVBQUVoSCxJQUFJLEVBQUUsSUFBSSxDQUFDK0MsV0FBVyxDQUFDO1VBQzVGLENBQUM7O1VBRUQ7VUFDQTtVQUNBLElBQUksQ0FBQ2tFLGVBQWUsR0FBRyxNQUFPZCxHQUFHLElBQUs7WUFDcEMsSUFBSSxJQUFJLENBQUMvQixlQUFlLENBQUMrQixHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMvQixlQUFlLENBQUMrQixHQUFHLENBQUMsQ0FBQ2UsSUFBSSxFQUFFO2NBQy9ELElBQUksQ0FBQyxJQUFJLENBQUM5QyxlQUFlLENBQUMrQixHQUFHLENBQUMsQ0FBQ2dCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQy9DLGVBQWUsQ0FBQytCLEdBQUcsQ0FBQyxDQUFDaUIsS0FBSyxFQUFFO2dCQUMxRSxPQUFPLElBQUksQ0FBQ2hELGVBQWUsQ0FBQytCLEdBQUcsQ0FBQyxDQUFDZSxJQUFJO2NBQ3ZDO2NBQ0EsSUFBSSxDQUFDSixhQUFhLENBQUNYLEdBQUcsRUFBRSxJQUFJLENBQUMvQixlQUFlLENBQUMrQixHQUFHLENBQUMsQ0FBQ2UsSUFBSSxDQUFDQSxJQUFJLENBQUNILElBQUksRUFBRSxJQUFJLENBQUMzQyxlQUFlLENBQUMrQixHQUFHLENBQUMsQ0FBQ2UsSUFBSSxDQUFDO2NBQ2pHLE9BQU8sSUFBSSxDQUFDOUMsZUFBZSxDQUFDK0IsR0FBRyxDQUFDLENBQUNlLElBQUk7WUFDdkM7WUFDQSxNQUFNRyxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMvRixjQUFjLENBQUNnRyxZQUFZLENBQUM7Y0FBQ25CO1lBQUcsQ0FBQyxDQUFDO1lBQzlELElBQUlrQixRQUFRLEVBQUU7Y0FDWixJQUFJLENBQUNQLGFBQWEsQ0FBQ1gsR0FBRyxFQUFFa0IsUUFBUSxDQUFDSCxJQUFJLENBQUNILElBQUksRUFBRU0sUUFBUSxDQUFDO2NBQ3JELE9BQU8sSUFBSSxDQUFDakQsZUFBZSxDQUFDK0IsR0FBRyxDQUFDLENBQUNlLElBQUk7WUFDdkM7WUFDQSxPQUFPLEtBQUs7VUFDZCxDQUFDO1FBQ0g7UUFFQSxJQUFJLENBQUMsSUFBSSxDQUFDOUQsTUFBTSxFQUFFO1VBQ2hCLElBQUksQ0FBQ0EsTUFBTSxHQUFHdEUsbUJBQW1CLENBQUNzRSxNQUFNO1FBQzFDO1FBRUExRSxLQUFLLENBQUMsSUFBSSxDQUFDcUQsS0FBSyxFQUFFdUQsT0FBTyxDQUFDO1FBQzFCNUcsS0FBSyxDQUFDLElBQUksQ0FBQzBFLE1BQU0sRUFBRTFDLE1BQU0sQ0FBQztRQUMxQmhDLEtBQUssQ0FBQyxJQUFJLENBQUN1RSxNQUFNLEVBQUVxQyxPQUFPLENBQUM7UUFDM0I1RyxLQUFLLENBQUMsSUFBSSxDQUFDMEQsT0FBTyxFQUFFekQsS0FBSyxDQUFDOEcsS0FBSyxDQUFDLEtBQUssRUFBRUQsUUFBUSxDQUFDLENBQUM7UUFDakQ5RyxLQUFLLENBQUMsSUFBSSxDQUFDc0UsU0FBUyxFQUFFckUsS0FBSyxDQUFDOEcsS0FBSyxDQUFDSCxPQUFPLEVBQUVFLFFBQVEsQ0FBQyxDQUFDO1FBQ3JEOUcsS0FBSyxDQUFDLElBQUksQ0FBQ2tELFNBQVMsRUFBRTJELE1BQU0sQ0FBQztRQUM3QjdHLEtBQUssQ0FBQyxJQUFJLENBQUN5RCxhQUFhLEVBQUUwQixNQUFNLENBQUM7UUFDakNuRixLQUFLLENBQUMsSUFBSSxDQUFDOEQsY0FBYyxFQUFFN0QsS0FBSyxDQUFDOEcsS0FBSyxDQUFDLEtBQUssRUFBRUQsUUFBUSxDQUFDLENBQUM7UUFDeEQ5RyxLQUFLLENBQUMsSUFBSSxDQUFDa0UsY0FBYyxFQUFFakUsS0FBSyxDQUFDOEcsS0FBSyxDQUFDLEtBQUssRUFBRUQsUUFBUSxDQUFDLENBQUM7UUFDeEQ5RyxLQUFLLENBQUMsSUFBSSxDQUFDbUUsZ0JBQWdCLEVBQUVsRSxLQUFLLENBQUM4RyxLQUFLLENBQUMsS0FBSyxFQUFFRCxRQUFRLENBQUMsQ0FBQztRQUMxRDlHLEtBQUssQ0FBQyxJQUFJLENBQUM4QyxlQUFlLEVBQUU4RCxPQUFPLENBQUM7UUFFcEMsSUFBSSxJQUFJLENBQUNyQyxNQUFNLElBQUksSUFBSSxDQUFDRCxTQUFTLEVBQUU7VUFDakMsTUFBTSxJQUFJekUsTUFBTSxDQUFDdUYsS0FBSyxDQUFDLEdBQUcsc0JBQUEvQyxNQUFBLENBQXNCLElBQUksQ0FBQ2MsY0FBYywrREFBNEQsQ0FBQztRQUNsSTtRQUVBLElBQUksQ0FBQzBGLFlBQVksR0FBRyxNQUFPQyxJQUFJLElBQUs7VUFDbEMsSUFBSSxJQUFJLENBQUN4RSxTQUFTLEVBQUU7WUFDbEIsSUFBSXlFLE1BQU07WUFDVixNQUFNO2NBQUNDLFNBQVM7Y0FBRUM7WUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDQyxRQUFRLENBQUNKLElBQUksQ0FBQztZQUUvQyxJQUFJdkosT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQ2hCLFNBQVMsQ0FBQyxFQUFFO2NBQ3RDLElBQUlzQixPQUFPO2NBQ1gsSUFBSXJHLE9BQU8sQ0FBQ2tHLFFBQVEsQ0FBQ3FELElBQUksQ0FBQ0ssTUFBTSxDQUFDLElBQUtMLElBQUksQ0FBQ0ssTUFBTSxDQUFDMUIsR0FBRyxFQUFFO2dCQUNyRDdCLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQ3JFLFVBQVUsQ0FBQ3FILFlBQVksQ0FBQ0UsSUFBSSxDQUFDSyxNQUFNLENBQUMxQixHQUFHLENBQUM7Y0FDL0Q7Y0FFQXNCLE1BQU0sR0FBR0QsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDeEUsU0FBUyxDQUFDOEUsSUFBSSxDQUFDcEgsTUFBTSxDQUFDcUgsTUFBTSxDQUFDUCxJQUFJLEVBQUU7Z0JBQUNFLFNBQVM7Z0JBQUVDO2NBQU0sQ0FBQyxDQUFDLEVBQUdyRCxPQUFPLElBQUksSUFBSyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUN0QixTQUFTLENBQUM4RSxJQUFJLENBQUM7Z0JBQUNKLFNBQVM7Z0JBQUVDO2NBQU0sQ0FBQyxFQUFHckQsT0FBTyxJQUFJLElBQUssQ0FBQztZQUM1SyxDQUFDLE1BQU07Y0FDTG1ELE1BQU0sR0FBRyxDQUFDLENBQUNFLE1BQU07WUFDbkI7WUFFQSxJQUFLSCxJQUFJLElBQUtDLE1BQU0sS0FBSyxJQUFLLElBQUssQ0FBQ0QsSUFBSSxFQUFFO2NBQ3hDLE9BQU8sSUFBSTtZQUNiO1lBRUEsTUFBTVEsRUFBRSxHQUFHL0osT0FBTyxDQUFDZ0csUUFBUSxDQUFDd0QsTUFBTSxDQUFDLEdBQUdBLE1BQU0sR0FBRyxHQUFHO1lBQ2xELElBQUksQ0FBQzNHLE1BQU0sQ0FBQyxxREFBcUQsQ0FBQztZQUNsRSxJQUFJMEcsSUFBSSxFQUFFO2NBQ1IsTUFBTVMsSUFBSSxHQUFHLGdCQUFnQjtjQUM3QixJQUFJLENBQUNULElBQUksQ0FBQ1UsUUFBUSxDQUFDQyxXQUFXLEVBQUU7Z0JBQzlCWCxJQUFJLENBQUNVLFFBQVEsQ0FBQ0UsU0FBUyxDQUFDSixFQUFFLEVBQUU7a0JBQzFCLGNBQWMsRUFBRSxZQUFZO2tCQUM1QixnQkFBZ0IsRUFBRUMsSUFBSSxDQUFDSTtnQkFDekIsQ0FBQyxDQUFDO2NBQ0o7Y0FFQSxJQUFJLENBQUNiLElBQUksQ0FBQ1UsUUFBUSxDQUFDSSxRQUFRLEVBQUU7Z0JBQzNCZCxJQUFJLENBQUNVLFFBQVEsQ0FBQ3ZCLEdBQUcsQ0FBQ3NCLElBQUksQ0FBQztjQUN6QjtZQUNGO1lBRUEsT0FBTyxLQUFLO1VBQ2Q7VUFDQSxPQUFPLElBQUk7UUFDYixDQUFDO1FBRUQsSUFBSSxDQUFDTSxZQUFZLEdBQUc7VUFDbEJDLE1BQU0sMkJBQUF6SCxNQUFBLENBQTJCLElBQUksQ0FBQ2MsY0FBYyxDQUFFO1VBQ3RENEcsTUFBTSwyQkFBQTFILE1BQUEsQ0FBMkIsSUFBSSxDQUFDYyxjQUFjLENBQUU7VUFDdEQ2RyxNQUFNLDJCQUFBM0gsTUFBQSxDQUEyQixJQUFJLENBQUNjLGNBQWMsQ0FBRTtVQUN0RDhHLE9BQU8sNEJBQUE1SCxNQUFBLENBQTRCLElBQUksQ0FBQ2MsY0FBYztRQUN4RCxDQUFDO1FBRUQsSUFBSSxDQUFDK0csRUFBRSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUNDLGFBQWEsQ0FBQztRQUM1QyxJQUFJLENBQUNELEVBQUUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDRSxhQUFhLENBQUM7UUFDNUMsSUFBSSxDQUFDQyxpQkFBaUIsR0FBR3hLLE1BQU0sQ0FBQ3lLLFNBQVMsQ0FBQyxJQUFJLENBQUNILGFBQWEsQ0FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhFLElBQUksSUFBSSxDQUFDaEgsYUFBYSxJQUFJLElBQUksQ0FBQ0QsZUFBZSxFQUFFO1VBQzlDO1FBQ0Y7UUFDQTFELE1BQU0sQ0FBQzRLLGVBQWUsQ0FBQ0MsR0FBRyxDQUFDLE9BQU9DLE9BQU8sRUFBRUMsUUFBUSxFQUFFQyxJQUFJLEtBQUs7VUFDNUQsSUFBSSxJQUFJLENBQUM3SCxjQUFjLElBQUkySCxPQUFPLENBQUNHLFVBQVUsQ0FBQ3hDLElBQUksQ0FBQ3lDLFFBQVEsSUFBQXpJLE1BQUEsQ0FBSSxJQUFJLENBQUNvQixhQUFhLE1BQUcsQ0FBQyxJQUFJLENBQUNrSCxRQUFRLENBQUNsQixXQUFXLEVBQUU7WUFDOUcsSUFBSSxJQUFJLENBQUMxRyxjQUFjLENBQUNnSSxJQUFJLENBQUNMLE9BQU8sQ0FBQzVFLE9BQU8sQ0FBQ2tGLE1BQU0sQ0FBQyxFQUFFO2NBQ3BETCxRQUFRLENBQUNNLFNBQVMsQ0FBQyxrQ0FBa0MsRUFBRSxNQUFNLENBQUM7Y0FDOUROLFFBQVEsQ0FBQ00sU0FBUyxDQUFDLDZCQUE2QixFQUFFUCxPQUFPLENBQUM1RSxPQUFPLENBQUNrRixNQUFNLENBQUM7WUFDM0U7WUFFQSxJQUFJTixPQUFPLENBQUNRLE1BQU0sS0FBSyxTQUFTLEVBQUU7Y0FDaENQLFFBQVEsQ0FBQ00sU0FBUyxDQUFDLDhCQUE4QixFQUFFLG9CQUFvQixDQUFDO2NBQ3hFTixRQUFRLENBQUNNLFNBQVMsQ0FBQyw4QkFBOEIsRUFBRSxrRUFBa0UsQ0FBQztjQUN0SE4sUUFBUSxDQUFDTSxTQUFTLENBQUMsK0JBQStCLEVBQUUsZ0VBQWdFLENBQUM7Y0FDckhOLFFBQVEsQ0FBQ00sU0FBUyxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQztjQUNqRE4sUUFBUSxDQUFDakIsU0FBUyxDQUFDLEdBQUcsQ0FBQztjQUN2QmlCLFFBQVEsQ0FBQzFDLEdBQUcsQ0FBQyxDQUFDO2NBQ2Q7WUFDRjtVQUNGO1VBRUEsSUFBSSxDQUFDLElBQUksQ0FBQzFFLGFBQWEsSUFBSW1ILE9BQU8sQ0FBQ0csVUFBVSxDQUFDeEMsSUFBSSxDQUFDeUMsUUFBUSxJQUFBekksTUFBQSxDQUFJLElBQUksQ0FBQ29CLGFBQWEsT0FBQXBCLE1BQUEsQ0FBSSxJQUFJLENBQUNjLGNBQWMsY0FBVyxDQUFDLEVBQUU7WUFDcEgsSUFBSXVILE9BQU8sQ0FBQ1EsTUFBTSxLQUFLLE1BQU0sRUFBRTtjQUM3Qk4sSUFBSSxDQUFDLENBQUM7Y0FDTjtZQUNGO1lBRUEsTUFBTU8sV0FBVyxHQUFJQyxNQUFNLElBQUs7Y0FDOUIsSUFBSXpFLEtBQUssR0FBR3lFLE1BQU07Y0FDbEJ2TCxNQUFNLENBQUN1QyxNQUFNLENBQUMsOENBQThDLEVBQUV1RSxLQUFLLENBQUM7Y0FFcEUsSUFBSSxDQUFDZ0UsUUFBUSxDQUFDbEIsV0FBVyxFQUFFO2dCQUN6QmtCLFFBQVEsQ0FBQ2pCLFNBQVMsQ0FBQyxHQUFHLENBQUM7Y0FDekI7Y0FFQSxJQUFJLENBQUNpQixRQUFRLENBQUNmLFFBQVEsRUFBRTtnQkFDdEIsSUFBSXJLLE9BQU8sQ0FBQ2tHLFFBQVEsQ0FBQ2tCLEtBQUssQ0FBQyxJQUFJcEgsT0FBTyxDQUFDK0YsVUFBVSxDQUFDcUIsS0FBSyxDQUFDMEUsUUFBUSxDQUFDLEVBQUU7a0JBQ2pFMUUsS0FBSyxHQUFHQSxLQUFLLENBQUMwRSxRQUFRLENBQUMsQ0FBQztnQkFDMUI7Z0JBRUEsSUFBSSxDQUFDOUwsT0FBTyxDQUFDeUYsUUFBUSxDQUFDMkIsS0FBSyxDQUFDLEVBQUU7a0JBQzVCQSxLQUFLLEdBQUcsbUJBQW1CO2dCQUM3QjtnQkFFQWdFLFFBQVEsQ0FBQzFDLEdBQUcsQ0FBQ3FELElBQUksQ0FBQ0MsU0FBUyxDQUFDO2tCQUFFNUU7Z0JBQU0sQ0FBQyxDQUFDLENBQUM7Y0FDekM7WUFDRixDQUFDO1lBRUQsSUFBSTZFLElBQUksR0FBRyxFQUFFO1lBQ2IsTUFBTUMsVUFBVSxHQUFHLE1BQUFBLENBQUEsS0FBWTtjQUM3QixJQUFJO2dCQUNGLElBQUluSyxJQUFJO2dCQUNSLElBQUl5SCxNQUFNO2dCQUNWLElBQUkyQyxJQUFJLEdBQUcsSUFBSSxDQUFDeEMsUUFBUSxDQUFDO2tCQUFDeUMsT0FBTyxFQUFFakIsT0FBTztrQkFBRWxCLFFBQVEsRUFBRW1CO2dCQUFRLENBQUMsQ0FBQztnQkFFaEUsSUFBSUQsT0FBTyxDQUFDNUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtrQkFDdEM7a0JBQ0F4RSxJQUFJLEdBQUc7b0JBQ0xzSyxNQUFNLEVBQUUsSUFBSSxDQUFDbkgsUUFBUSxDQUFDaUcsT0FBTyxDQUFDNUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHO2tCQUM1RCxDQUFDO2tCQUVELElBQUk0RSxPQUFPLENBQUM1RSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxFQUFFO29CQUNwQ3hFLElBQUksQ0FBQ3VLLEdBQUcsR0FBRyxJQUFJO2tCQUNqQixDQUFDLE1BQU07b0JBQ0x2SyxJQUFJLENBQUN3SyxPQUFPLEdBQUdDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDUixJQUFJLEVBQUUsUUFBUSxDQUFDO29CQUMxQ2xLLElBQUksQ0FBQzJLLE9BQU8sR0FBR3pHLFFBQVEsQ0FBQ2tGLE9BQU8sQ0FBQzVFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztrQkFDdkQ7a0JBRUEsTUFBTXlDLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQ0EsZUFBZSxDQUFDakgsSUFBSSxDQUFDc0ssTUFBTSxDQUFDO2tCQUMvRCxJQUFJLENBQUNyRCxlQUFlLEVBQUU7b0JBQ3BCLE1BQU0sSUFBSTFJLE1BQU0sQ0FBQ3VGLEtBQUssQ0FBQyxHQUFHLEVBQUUsOERBQThELENBQUM7a0JBQzdGO2tCQUVBLENBQUM7b0JBQUMyRCxNQUFNO29CQUFFekg7a0JBQUksQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDNEssY0FBYyxDQUFDbEssTUFBTSxDQUFDcUgsTUFBTSxDQUFDL0gsSUFBSSxFQUFFaUgsZUFBZSxDQUFDLEVBQUVtRCxJQUFJLENBQUN6QyxNQUFNLEVBQUUsTUFBTSxDQUFDO2tCQUV0RyxJQUFJM0gsSUFBSSxDQUFDdUssR0FBRyxFQUFFO29CQUNaO29CQUNBLElBQUksQ0FBQzFCLGFBQWEsQ0FBQ3BCLE1BQU0sRUFBRXpILElBQUksRUFBRzhKLE1BQU0sSUFBSztzQkFDM0MsSUFBSXpFLEtBQUssR0FBR3lFLE1BQU07c0JBQ2xCLElBQUl6RSxLQUFLLEVBQUU7d0JBQ1QsSUFBSSxDQUFDZ0UsUUFBUSxDQUFDbEIsV0FBVyxFQUFFOzBCQUN6QmtCLFFBQVEsQ0FBQ2pCLFNBQVMsQ0FBQyxHQUFHLENBQUM7d0JBQ3pCO3dCQUVBLElBQUksQ0FBQ2lCLFFBQVEsQ0FBQ2YsUUFBUSxFQUFFOzBCQUN0QixJQUFJckssT0FBTyxDQUFDa0csUUFBUSxDQUFDa0IsS0FBSyxDQUFDLElBQUlwSCxPQUFPLENBQUMrRixVQUFVLENBQUNxQixLQUFLLENBQUMwRSxRQUFRLENBQUMsRUFBRTs0QkFDakUxRSxLQUFLLEdBQUdBLEtBQUssQ0FBQzBFLFFBQVEsQ0FBQyxDQUFDOzBCQUMxQjswQkFFQSxJQUFJLENBQUM5TCxPQUFPLENBQUN5RixRQUFRLENBQUMyQixLQUFLLENBQUMsRUFBRTs0QkFDNUJBLEtBQUssR0FBRyxtQkFBbUI7MEJBQzdCOzBCQUVBZ0UsUUFBUSxDQUFDMUMsR0FBRyxDQUFDcUQsSUFBSSxDQUFDQyxTQUFTLENBQUM7NEJBQUU1RTswQkFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDekM7c0JBQ0Y7c0JBRUEsSUFBSSxDQUFDZ0UsUUFBUSxDQUFDbEIsV0FBVyxFQUFFO3dCQUN6QmtCLFFBQVEsQ0FBQ2pCLFNBQVMsQ0FBQyxHQUFHLENBQUM7c0JBQ3pCO3NCQUVBLElBQUluSyxPQUFPLENBQUNrRyxRQUFRLENBQUNzRCxNQUFNLENBQUNQLElBQUksQ0FBQyxJQUFJTyxNQUFNLENBQUNQLElBQUksQ0FBQzJELElBQUksRUFBRTt3QkFDckRwRCxNQUFNLENBQUNQLElBQUksQ0FBQzJELElBQUksR0FBRzdMLGdCQUFnQixDQUFDeUksTUFBTSxDQUFDUCxJQUFJLENBQUMyRCxJQUFJLENBQUM7c0JBQ3ZEO3NCQUVBLElBQUksQ0FBQ3hCLFFBQVEsQ0FBQ2YsUUFBUSxFQUFFO3dCQUN0QmUsUUFBUSxDQUFDMUMsR0FBRyxDQUFDcUQsSUFBSSxDQUFDQyxTQUFTLENBQUN4QyxNQUFNLENBQUMsQ0FBQztzQkFDdEM7b0JBQ0YsQ0FBQyxDQUFDO29CQUNGO2tCQUNGO2tCQUVBLElBQUksQ0FBQ3FELElBQUksQ0FBQyxlQUFlLEVBQUVyRCxNQUFNLEVBQUV6SCxJQUFJLEVBQUVKLElBQUksQ0FBQztrQkFFOUMsSUFBSSxDQUFDeUosUUFBUSxDQUFDbEIsV0FBVyxFQUFFO29CQUN6QmtCLFFBQVEsQ0FBQ2pCLFNBQVMsQ0FBQyxHQUFHLENBQUM7a0JBQ3pCO2tCQUNBLElBQUksQ0FBQ2lCLFFBQVEsQ0FBQ2YsUUFBUSxFQUFFO29CQUN0QmUsUUFBUSxDQUFDMUMsR0FBRyxDQUFDLENBQUM7a0JBQ2hCO2dCQUNGLENBQUMsTUFBTTtrQkFDTDtrQkFDQSxJQUFJO29CQUNGM0csSUFBSSxHQUFHZ0ssSUFBSSxDQUFDZSxLQUFLLENBQUNiLElBQUksQ0FBQztrQkFDekIsQ0FBQyxDQUFDLE9BQU9jLE9BQU8sRUFBRTtvQkFDaEJ6TSxNQUFNLENBQUN1QyxNQUFNLENBQUMsdUZBQXVGLEVBQUVrSyxPQUFPLENBQUM7b0JBQy9HaEwsSUFBSSxHQUFHO3NCQUFDa0gsSUFBSSxFQUFFLENBQUM7b0JBQUMsQ0FBQztrQkFDbkI7a0JBRUEsSUFBSSxDQUFDakosT0FBTyxDQUFDa0csUUFBUSxDQUFDbkUsSUFBSSxDQUFDa0gsSUFBSSxDQUFDLEVBQUU7b0JBQ2hDbEgsSUFBSSxDQUFDa0gsSUFBSSxHQUFHLENBQUMsQ0FBQztrQkFDaEI7a0JBRUEsSUFBSWxILElBQUksQ0FBQ3NLLE1BQU0sRUFBRTtvQkFDZnRLLElBQUksQ0FBQ3NLLE1BQU0sR0FBRyxJQUFJLENBQUNuSCxRQUFRLENBQUNuRCxJQUFJLENBQUNzSyxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztrQkFDbkQ7a0JBRUEsSUFBSSxDQUFDeEosTUFBTSx3Q0FBQUMsTUFBQSxDQUF3Q2YsSUFBSSxDQUFDa0gsSUFBSSxDQUFDdEcsSUFBSSxJQUFJLFdBQVcsU0FBQUcsTUFBQSxDQUFNZixJQUFJLENBQUNzSyxNQUFNLENBQUUsQ0FBQztrQkFDcEcsSUFBSXJNLE9BQU8sQ0FBQ2tHLFFBQVEsQ0FBQ25FLElBQUksQ0FBQ2tILElBQUksQ0FBQyxJQUFJbEgsSUFBSSxDQUFDa0gsSUFBSSxDQUFDMkQsSUFBSSxFQUFFO29CQUNqRDdLLElBQUksQ0FBQ2tILElBQUksQ0FBQzJELElBQUksR0FBRzlMLFlBQVksQ0FBQ2lCLElBQUksQ0FBQ2tILElBQUksQ0FBQzJELElBQUksQ0FBQztrQkFDL0M7a0JBRUE3SyxJQUFJLENBQUNpTCxJQUFJLEdBQUcsSUFBSTtrQkFDaEIsQ0FBQztvQkFBQ3hEO2tCQUFNLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQ21ELGNBQWMsQ0FBQzNNLE9BQU8sQ0FBQ2lOLEtBQUssQ0FBQ2xMLElBQUksQ0FBQyxFQUFFb0ssSUFBSSxDQUFDekMsTUFBTSxFQUFFLG1CQUFtQixDQUFDO2tCQUU1RixJQUFJd0QsR0FBRztrQkFDUEEsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDbEwsVUFBVSxDQUFDcUgsWUFBWSxDQUFDRyxNQUFNLENBQUN0QixHQUFHLENBQUM7a0JBRXBELElBQUlnRixHQUFHLEVBQUU7b0JBQ1AsTUFBTSxJQUFJNU0sTUFBTSxDQUFDdUYsS0FBSyxDQUFDLEdBQUcsRUFBRSxrREFBa0QsQ0FBQztrQkFDakY7a0JBRUE5RCxJQUFJLENBQUNtRyxHQUFHLEdBQUduRyxJQUFJLENBQUNzSyxNQUFNO2tCQUN0QnRLLElBQUksQ0FBQzZGLFNBQVMsR0FBRyxJQUFJdUYsSUFBSSxDQUFDLENBQUM7a0JBQzNCcEwsSUFBSSxDQUFDcUwsU0FBUyxHQUFHckwsSUFBSSxDQUFDZ0gsVUFBVTtrQkFFaEMsTUFBTSxJQUFJLENBQUMxRixjQUFjLENBQUNnSyxXQUFXLENBQUNyTixPQUFPLENBQUNzTixJQUFJLENBQUN2TCxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7a0JBQ2pFLElBQUksQ0FBQzhHLGFBQWEsQ0FBQ1csTUFBTSxDQUFDdEIsR0FBRyxFQUFFc0IsTUFBTSxDQUFDVixJQUFJLEVBQUU5SSxPQUFPLENBQUNzTixJQUFJLENBQUN2TCxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7a0JBRXZFLElBQUlBLElBQUksQ0FBQ3dMLFVBQVUsRUFBRTtvQkFDbkIsSUFBSSxDQUFDbkMsUUFBUSxDQUFDbEIsV0FBVyxFQUFFO3NCQUN6QmtCLFFBQVEsQ0FBQ2pCLFNBQVMsQ0FBQyxHQUFHLENBQUM7b0JBQ3pCO29CQUVBLElBQUksQ0FBQ2lCLFFBQVEsQ0FBQ2YsUUFBUSxFQUFFO3NCQUN0QmUsUUFBUSxDQUFDMUMsR0FBRyxDQUFDcUQsSUFBSSxDQUFDQyxTQUFTLENBQUM7d0JBQzFCd0IsV0FBVyxLQUFBMUssTUFBQSxDQUFLLElBQUksQ0FBQ29CLGFBQWEsT0FBQXBCLE1BQUEsQ0FBSSxJQUFJLENBQUNjLGNBQWMsY0FBVzt3QkFDcEVxRixJQUFJLEVBQUVPO3NCQUNSLENBQUMsQ0FBQyxDQUFDO29CQUNMO2tCQUNGLENBQUMsTUFBTTtvQkFDTCxJQUFJLENBQUM0QixRQUFRLENBQUNsQixXQUFXLEVBQUU7c0JBQ3pCa0IsUUFBUSxDQUFDakIsU0FBUyxDQUFDLEdBQUcsQ0FBQztvQkFDekI7b0JBRUEsSUFBSSxDQUFDaUIsUUFBUSxDQUFDZixRQUFRLEVBQUU7c0JBQ3RCZSxRQUFRLENBQUMxQyxHQUFHLENBQUMsQ0FBQztvQkFDaEI7a0JBQ0Y7Z0JBQ0Y7Y0FDRixDQUFDLENBQUMsT0FBTytFLFdBQVcsRUFBRTtnQkFDcEI3QixXQUFXLENBQUM2QixXQUFXLENBQUM7Y0FDMUI7WUFDRixDQUFDO1lBRUR0QyxPQUFPLENBQUN1QyxVQUFVLENBQUMsS0FBSyxFQUFFOUIsV0FBVyxDQUFDO1lBQ3RDLElBQUksT0FBT1QsT0FBTyxDQUFDYyxJQUFJLEtBQUssUUFBUSxJQUFJeEosTUFBTSxDQUFDWCxJQUFJLENBQUNxSixPQUFPLENBQUNjLElBQUksQ0FBQyxDQUFDN0IsTUFBTSxLQUFLLENBQUMsRUFBRTtjQUM5RTZCLElBQUksR0FBR0YsSUFBSSxDQUFDQyxTQUFTLENBQUNiLE9BQU8sQ0FBQ2MsSUFBSSxDQUFDO2NBQ25DQyxVQUFVLENBQUMsQ0FBQztZQUNkLENBQUMsTUFBTTtjQUNMZixPQUFPLENBQUNSLEVBQUUsQ0FBQyxNQUFNLEVBQUdnRCxJQUFJLElBQUtuTSxLQUFLLENBQUMsTUFBTTtnQkFDdkN5SyxJQUFJLElBQUkwQixJQUFJO2NBQ2QsQ0FBQyxDQUFDLENBQUM7Y0FFSHhDLE9BQU8sQ0FBQ1IsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNbkosS0FBSyxDQUFDLE1BQU07Z0JBQ2xDMEssVUFBVSxDQUFDLENBQUM7Y0FDZCxDQUFDLENBQUMsQ0FBQztZQUNMO1lBQ0E7VUFDRjtVQUVBLElBQUksQ0FBQyxJQUFJLENBQUNuSSxlQUFlLEVBQUU7WUFDekIsSUFBSTZKLEdBQUc7WUFFUCxJQUFJLENBQUMsSUFBSSxDQUFDNUksTUFBTSxFQUFFO2NBQ2hCLElBQUltRyxPQUFPLENBQUNHLFVBQVUsQ0FBQ3hDLElBQUksQ0FBQ3lDLFFBQVEsSUFBQXpJLE1BQUEsQ0FBSSxJQUFJLENBQUNvQixhQUFhLE9BQUFwQixNQUFBLENBQUksSUFBSSxDQUFDYyxjQUFjLENBQUUsQ0FBQyxFQUFFO2dCQUNwRmdLLEdBQUcsR0FBR3pDLE9BQU8sQ0FBQ0csVUFBVSxDQUFDeEMsSUFBSSxDQUFDaEQsT0FBTyxJQUFBaEQsTUFBQSxDQUFJLElBQUksQ0FBQ29CLGFBQWEsT0FBQXBCLE1BQUEsQ0FBSSxJQUFJLENBQUNjLGNBQWMsR0FBSSxFQUFFLENBQUM7Z0JBQ3pGLElBQUlnSyxHQUFHLENBQUNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7a0JBQzFCRCxHQUFHLEdBQUdBLEdBQUcsQ0FBQ0UsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDeEI7Z0JBRUEsTUFBTUMsSUFBSSxHQUFHSCxHQUFHLENBQUNJLEtBQUssQ0FBQyxHQUFHLENBQUM7Z0JBQzNCLElBQUlELElBQUksQ0FBQzNELE1BQU0sS0FBSyxDQUFDLEVBQUU7a0JBQ3JCLE1BQU1SLE1BQU0sR0FBRztvQkFDYjFCLEdBQUcsRUFBRTZGLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ1pFLEtBQUssRUFBRTlDLE9BQU8sQ0FBQ0csVUFBVSxDQUFDMkMsS0FBSyxHQUFHL00sTUFBTSxDQUFDNEwsS0FBSyxDQUFDM0IsT0FBTyxDQUFDRyxVQUFVLENBQUMyQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzdFdEwsSUFBSSxFQUFFb0wsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQkUsT0FBTyxFQUFFSCxJQUFJLENBQUMsQ0FBQztrQkFDakIsQ0FBQztrQkFFRCxNQUFNeEUsSUFBSSxHQUFHO29CQUFDNkMsT0FBTyxFQUFFakIsT0FBTztvQkFBRWxCLFFBQVEsRUFBRW1CLFFBQVE7b0JBQUV4QjtrQkFBTSxDQUFDO2tCQUUzRCxJQUFJLElBQUksQ0FBQ3RGLGdCQUFnQixJQUFJdEUsT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQ3pCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQ0EsZ0JBQWdCLENBQUNpRixJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUU7b0JBQ3RIO2tCQUNGO2tCQUVBLElBQUksTUFBTSxJQUFJLENBQUNELFlBQVksQ0FBQ0MsSUFBSSxDQUFDLEVBQUU7b0JBQ2pDLE1BQU0sSUFBSSxDQUFDNEUsUUFBUSxDQUFDNUUsSUFBSSxFQUFFd0UsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sSUFBSSxDQUFDL0wsVUFBVSxDQUFDcUgsWUFBWSxDQUFDMEUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7a0JBQ2pGO2dCQUNGLENBQUMsTUFBTTtrQkFDTDFDLElBQUksQ0FBQyxDQUFDO2dCQUNSO2NBQ0YsQ0FBQyxNQUFNO2dCQUNMQSxJQUFJLENBQUMsQ0FBQztjQUNSO1lBQ0YsQ0FBQyxNQUFNO2NBQ0wsSUFBSUYsT0FBTyxDQUFDRyxVQUFVLENBQUN4QyxJQUFJLENBQUN5QyxRQUFRLElBQUF6SSxNQUFBLENBQUksSUFBSSxDQUFDb0IsYUFBYSxDQUFFLENBQUMsRUFBRTtnQkFDN0QwSixHQUFHLEdBQUd6QyxPQUFPLENBQUNHLFVBQVUsQ0FBQ3hDLElBQUksQ0FBQ2hELE9BQU8sSUFBQWhELE1BQUEsQ0FBSSxJQUFJLENBQUNvQixhQUFhLEdBQUksRUFBRSxDQUFDO2dCQUNsRSxJQUFJMEosR0FBRyxDQUFDQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO2tCQUMxQkQsR0FBRyxHQUFHQSxHQUFHLENBQUNFLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCO2dCQUVBLE1BQU1DLElBQUksR0FBR0gsR0FBRyxDQUFDSSxLQUFLLENBQUMsR0FBRyxDQUFDO2dCQUMzQixJQUFJSSxLQUFLLEdBQUdMLElBQUksQ0FBQ0EsSUFBSSxDQUFDM0QsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDakMsSUFBSWdFLEtBQUssRUFBRTtrQkFDVCxJQUFJRixPQUFPO2tCQUNYLElBQUlFLEtBQUssQ0FBQzdDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDdkIyQyxPQUFPLEdBQUdFLEtBQUssQ0FBQ0osS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0JJLEtBQUssR0FBR0EsS0FBSyxDQUFDSixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUNBLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7a0JBQzNDLENBQUMsTUFBTTtvQkFDTEUsT0FBTyxHQUFHLFVBQVU7b0JBQ3BCRSxLQUFLLEdBQUdBLEtBQUssQ0FBQ0osS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztrQkFDN0I7a0JBRUEsTUFBTXBFLE1BQU0sR0FBRztvQkFDYnFFLEtBQUssRUFBRTlDLE9BQU8sQ0FBQ0csVUFBVSxDQUFDMkMsS0FBSyxHQUFHL00sTUFBTSxDQUFDNEwsS0FBSyxDQUFDM0IsT0FBTyxDQUFDRyxVQUFVLENBQUMyQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzdFaEYsSUFBSSxFQUFFbUYsS0FBSztvQkFDWGxHLEdBQUcsRUFBRWtHLEtBQUssQ0FBQ0osS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEJFLE9BQU87b0JBQ1B2TCxJQUFJLEVBQUV5TDtrQkFDUixDQUFDO2tCQUNELE1BQU03RSxJQUFJLEdBQUc7b0JBQUM2QyxPQUFPLEVBQUVqQixPQUFPO29CQUFFbEIsUUFBUSxFQUFFbUIsUUFBUTtvQkFBRXhCO2tCQUFNLENBQUM7a0JBQzNELElBQUksSUFBSSxDQUFDdEYsZ0JBQWdCLElBQUl0RSxPQUFPLENBQUMrRixVQUFVLENBQUMsSUFBSSxDQUFDekIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDQSxnQkFBZ0IsQ0FBQ2lGLElBQUksQ0FBQyxNQUFNLElBQUksRUFBRTtvQkFDdEg7a0JBQ0Y7a0JBQ0EsTUFBTSxJQUFJLENBQUM0RSxRQUFRLENBQUM1RSxJQUFJLEVBQUUyRSxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUNsTSxVQUFVLENBQUNxSCxZQUFZLENBQUNPLE1BQU0sQ0FBQzFCLEdBQUcsQ0FBQyxDQUFDO2dCQUNwRixDQUFDLE1BQU07a0JBQ0xtRCxJQUFJLENBQUMsQ0FBQztnQkFDUjtjQUNGLENBQUMsTUFBTTtnQkFDTEEsSUFBSSxDQUFDLENBQUM7Y0FDUjtZQUNGO1lBQ0E7VUFDRjtVQUNBQSxJQUFJLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxJQUFJLENBQUNySCxhQUFhLEVBQUU7VUFDdkIsTUFBTXFLLFFBQVEsR0FBRyxDQUFDLENBQUM7O1VBRW5CO1VBQ0E7VUFDQUEsUUFBUSxDQUFDLElBQUksQ0FBQy9ELFlBQVksQ0FBQ0ksT0FBTyxDQUFDLEdBQUcsZ0JBQWdCNEQsUUFBUSxFQUFFO1lBQzlEN04sS0FBSyxDQUFDNk4sUUFBUSxFQUFFNU4sS0FBSyxDQUFDOEcsS0FBSyxDQUFDNUIsTUFBTSxFQUFFbkQsTUFBTSxDQUFDLENBQUM7WUFDNUM0QyxJQUFJLENBQUN4QyxNQUFNLCtDQUFBQyxNQUFBLENBQStDd0wsUUFBUSxPQUFJLENBQUM7WUFFdkUsSUFBSWpKLElBQUksQ0FBQzlCLGVBQWUsRUFBRTtjQUN4QixJQUFJOEIsSUFBSSxDQUFDWCxjQUFjLElBQUkxRSxPQUFPLENBQUMrRixVQUFVLENBQUNWLElBQUksQ0FBQ1gsY0FBYyxDQUFDLEVBQUU7Z0JBQ2xFLE1BQU1nRixNQUFNLEdBQUcsSUFBSSxDQUFDQSxNQUFNO2dCQUMxQixNQUFNNkUsU0FBUyxHQUFHO2tCQUNoQjdFLE1BQU0sRUFBRSxJQUFJLENBQUNBLE1BQU07a0JBQ25CRCxTQUFTQSxDQUFBLEVBQUU7b0JBQ1QsSUFBSW5KLE1BQU0sQ0FBQ2tPLEtBQUssRUFBRTtzQkFDaEIsT0FBT2xPLE1BQU0sQ0FBQ2tPLEtBQUssQ0FBQ25GLFlBQVksQ0FBQ0ssTUFBTSxDQUFDO29CQUMxQztvQkFDQSxPQUFPLElBQUk7a0JBQ2I7Z0JBQ0YsQ0FBQztnQkFFRCxJQUFJLEVBQUUsTUFBTXJFLElBQUksQ0FBQ1gsY0FBYyxDQUFDbUYsSUFBSSxDQUFDMEUsU0FBUyxFQUFHbEosSUFBSSxDQUFDMkMsSUFBSSxDQUFDc0csUUFBUSxDQUFDLElBQUksSUFBSyxDQUFDLENBQUMsRUFBRTtrQkFDL0UsTUFBTSxJQUFJaE8sTUFBTSxDQUFDdUYsS0FBSyxDQUFDLEdBQUcsRUFBRSwyQ0FBMkMsQ0FBQztnQkFDMUU7Y0FDRjtjQUVBLE1BQU00SSxNQUFNLEdBQUdwSixJQUFJLENBQUMyQyxJQUFJLENBQUNzRyxRQUFRLENBQUM7Y0FDbEMsSUFBSSxDQUFDLE1BQU1HLE1BQU0sQ0FBQzlGLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNuQ3RELElBQUksQ0FBQ2tELFdBQVcsQ0FBQytGLFFBQVEsQ0FBQztnQkFDMUIsT0FBTyxJQUFJO2NBQ2I7Y0FDQSxNQUFNLElBQUloTyxNQUFNLENBQUN1RixLQUFLLENBQUMsR0FBRyxFQUFFLHNDQUFzQyxDQUFDO1lBQ3JFLENBQUMsTUFBTTtjQUNMLE1BQU0sSUFBSXZGLE1BQU0sQ0FBQ3VGLEtBQUssQ0FBQyxHQUFHLEVBQUUscUVBQXFFLENBQUM7WUFDcEc7VUFDRixDQUFDOztVQUdEO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBd0ksUUFBUSxDQUFDLElBQUksQ0FBQy9ELFlBQVksQ0FBQ0csTUFBTSxDQUFDLEdBQUcsZ0JBQWdCMUksSUFBSSxFQUFFd0wsVUFBVSxFQUFFO1lBQ3JFOU0sS0FBSyxDQUFDc0IsSUFBSSxFQUFFO2NBQ1ZrSCxJQUFJLEVBQUV4RyxNQUFNO2NBQ1o0SixNQUFNLEVBQUV6RyxNQUFNO2NBQ2Q4SSxNQUFNLEVBQUVoTyxLQUFLLENBQUNpTyxRQUFRLENBQUMvSSxNQUFNLENBQUM7Y0FDOUJqQyxTQUFTLEVBQUUyRCxNQUFNO2NBQ2pCeUIsVUFBVSxFQUFFekI7WUFDZCxDQUFDLENBQUM7WUFFRjdHLEtBQUssQ0FBQzhNLFVBQVUsRUFBRTdNLEtBQUssQ0FBQ2lPLFFBQVEsQ0FBQ3RILE9BQU8sQ0FBQyxDQUFDO1lBRTFDdEYsSUFBSSxDQUFDc0ssTUFBTSxHQUFHaEgsSUFBSSxDQUFDSCxRQUFRLENBQUNuRCxJQUFJLENBQUNzSyxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztZQUVqRGhILElBQUksQ0FBQ3hDLE1BQU0sMENBQUFDLE1BQUEsQ0FBMENmLElBQUksQ0FBQ2tILElBQUksQ0FBQ3RHLElBQUksU0FBQUcsTUFBQSxDQUFNZixJQUFJLENBQUNzSyxNQUFNLENBQUUsQ0FBQztZQUN2RnRLLElBQUksQ0FBQ2lMLElBQUksR0FBRyxJQUFJO1lBQ2hCLE1BQU07Y0FBRXhEO1lBQU8sQ0FBQyxHQUFHLE1BQU1uRSxJQUFJLENBQUNzSCxjQUFjLENBQUMzTSxPQUFPLENBQUNpTixLQUFLLENBQUNsTCxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMySCxNQUFNLEVBQUUsa0JBQWtCLENBQUM7WUFFbEcsSUFBSSxNQUFNckUsSUFBSSxDQUFDckQsVUFBVSxDQUFDcUgsWUFBWSxDQUFDRyxNQUFNLENBQUN0QixHQUFHLENBQUMsRUFBRTtjQUNsRCxNQUFNLElBQUk1SCxNQUFNLENBQUN1RixLQUFLLENBQUMsR0FBRyxFQUFFLGtEQUFrRCxDQUFDO1lBQ2pGO1lBRUE5RCxJQUFJLENBQUNtRyxHQUFHLEdBQUduRyxJQUFJLENBQUNzSyxNQUFNO1lBQ3RCdEssSUFBSSxDQUFDNkYsU0FBUyxHQUFHLElBQUl1RixJQUFJLENBQUMsQ0FBQztZQUMzQnBMLElBQUksQ0FBQ3FMLFNBQVMsR0FBR3JMLElBQUksQ0FBQ2dILFVBQVU7WUFDaEMsSUFBSTtjQUNGLE1BQU0xRCxJQUFJLENBQUNoQyxjQUFjLENBQUNnSyxXQUFXLENBQUNyTixPQUFPLENBQUNzTixJQUFJLENBQUN2TCxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7Y0FDakVzRCxJQUFJLENBQUN3RCxhQUFhLENBQUNXLE1BQU0sQ0FBQ3RCLEdBQUcsRUFBRXNCLE1BQU0sQ0FBQ1YsSUFBSSxFQUFFOUksT0FBTyxDQUFDc04sSUFBSSxDQUFDdkwsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pFLENBQUMsQ0FBQyxPQUFPRyxDQUFDLEVBQUU7Y0FDVm1ELElBQUksQ0FBQ3hDLE1BQU0sdURBQUFDLE1BQUEsQ0FBdURmLElBQUksQ0FBQ2tILElBQUksQ0FBQ3RHLElBQUksU0FBQUcsTUFBQSxDQUFNZixJQUFJLENBQUNzSyxNQUFNLEdBQUluSyxDQUFDLENBQUM7Y0FDdkcsTUFBTSxJQUFJNUIsTUFBTSxDQUFDdUYsS0FBSyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUM7WUFDN0M7WUFFQSxJQUFJMEgsVUFBVSxFQUFFO2NBQ2QsT0FBTztnQkFDTEMsV0FBVyxLQUFBMUssTUFBQSxDQUFLdUMsSUFBSSxDQUFDbkIsYUFBYSxPQUFBcEIsTUFBQSxDQUFJdUMsSUFBSSxDQUFDekIsY0FBYyxjQUFXO2dCQUNwRXFGLElBQUksRUFBRU87Y0FDUixDQUFDO1lBQ0g7WUFDQSxPQUFPLElBQUk7VUFDYixDQUFDOztVQUdEO1VBQ0E7VUFDQTtVQUNBNkUsUUFBUSxDQUFDLElBQUksQ0FBQy9ELFlBQVksQ0FBQ0UsTUFBTSxDQUFDLEdBQUcsZ0JBQWdCb0UsS0FBSyxFQUFFO1lBQzFELElBQUk3TSxJQUFJLEdBQUc2TSxLQUFLO1lBQ2hCLElBQUlwRixNQUFNO1lBQ1YvSSxLQUFLLENBQUNzQixJQUFJLEVBQUU7Y0FDVnVLLEdBQUcsRUFBRTVMLEtBQUssQ0FBQ2lPLFFBQVEsQ0FBQ3RILE9BQU8sQ0FBQztjQUM1QmdGLE1BQU0sRUFBRXpHLE1BQU07Y0FDZDJHLE9BQU8sRUFBRTdMLEtBQUssQ0FBQ2lPLFFBQVEsQ0FBQy9JLE1BQU0sQ0FBQztjQUMvQjhHLE9BQU8sRUFBRWhNLEtBQUssQ0FBQ2lPLFFBQVEsQ0FBQ3JILE1BQU07WUFDaEMsQ0FBQyxDQUFDO1lBRUZ2RixJQUFJLENBQUNzSyxNQUFNLEdBQUdoSCxJQUFJLENBQUNILFFBQVEsQ0FBQ25ELElBQUksQ0FBQ3NLLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO1lBRWpELElBQUl0SyxJQUFJLENBQUN3SyxPQUFPLEVBQUU7Y0FDaEJ4SyxJQUFJLENBQUN3SyxPQUFPLEdBQUdDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDMUssSUFBSSxDQUFDd0ssT0FBTyxFQUFFLFFBQVEsQ0FBQztZQUNwRDtZQUVBLE1BQU12RCxlQUFlLEdBQUcsTUFBTTNELElBQUksQ0FBQzJELGVBQWUsQ0FBQ2pILElBQUksQ0FBQ3NLLE1BQU0sQ0FBQztZQUMvRCxJQUFJLENBQUNyRCxlQUFlLEVBQUU7Y0FDcEIsTUFBTSxJQUFJMUksTUFBTSxDQUFDdUYsS0FBSyxDQUFDLEdBQUcsRUFBRSw4REFBOEQsQ0FBQztZQUM3RjtZQUVBLENBQUM7Y0FBQzJELE1BQU07Y0FBRXpIO1lBQUksQ0FBQyxHQUFHLE1BQU1zRCxJQUFJLENBQUNzSCxjQUFjLENBQUNsSyxNQUFNLENBQUNxSCxNQUFNLENBQUMvSCxJQUFJLEVBQUVpSCxlQUFlLENBQUMsRUFBRSxJQUFJLENBQUNVLE1BQU0sRUFBRSxLQUFLLENBQUM7WUFFckcsSUFBSTNILElBQUksQ0FBQ3VLLEdBQUcsRUFBRTtjQUNaLElBQUk7Z0JBQ0YsT0FBT2pILElBQUksQ0FBQ3lGLGlCQUFpQixDQUFDdEIsTUFBTSxFQUFFekgsSUFBSSxDQUFDO2NBQzdDLENBQUMsQ0FBQyxPQUFPOE0sZUFBZSxFQUFFO2dCQUN4QnhKLElBQUksQ0FBQ3hDLE1BQU0sQ0FBQyxtREFBbUQsRUFBRWdNLGVBQWUsQ0FBQztnQkFDakYsTUFBTUEsZUFBZTtjQUN2QjtZQUNGLENBQUMsTUFBTTtjQUNMeEosSUFBSSxDQUFDd0gsSUFBSSxDQUFDLGVBQWUsRUFBRXJELE1BQU0sRUFBRXpILElBQUksRUFBRUosSUFBSSxDQUFDO1lBQ2hEO1lBQ0EsT0FBTyxJQUFJO1VBQ2IsQ0FBQzs7VUFFRDtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EwTSxRQUFRLENBQUMsSUFBSSxDQUFDL0QsWUFBWSxDQUFDQyxNQUFNLENBQUMsR0FBRyxnQkFBZ0JyQyxHQUFHLEVBQUU7WUFDeER6SCxLQUFLLENBQUN5SCxHQUFHLEVBQUV0QyxNQUFNLENBQUM7WUFFbEIsTUFBTW9ELGVBQWUsR0FBRyxNQUFNM0QsSUFBSSxDQUFDMkQsZUFBZSxDQUFDZCxHQUFHLENBQUM7WUFDdkQ3QyxJQUFJLENBQUN4QyxNQUFNLHNDQUFBQyxNQUFBLENBQXNDb0YsR0FBRyxTQUFBcEYsTUFBQSxDQUFPOUMsT0FBTyxDQUFDa0csUUFBUSxDQUFDOEMsZUFBZSxDQUFDQyxJQUFJLENBQUMsR0FBR0QsZUFBZSxDQUFDQyxJQUFJLENBQUNILElBQUksR0FBRyxFQUFFLENBQUcsQ0FBQztZQUV0SSxJQUFJekQsSUFBSSxDQUFDYyxlQUFlLElBQUlkLElBQUksQ0FBQ2MsZUFBZSxDQUFDK0IsR0FBRyxDQUFDLEVBQUU7Y0FDckQ3QyxJQUFJLENBQUNjLGVBQWUsQ0FBQytCLEdBQUcsQ0FBQyxDQUFDTyxJQUFJLENBQUMsQ0FBQztjQUNoQ3BELElBQUksQ0FBQ2MsZUFBZSxDQUFDK0IsR0FBRyxDQUFDLENBQUNVLEtBQUssQ0FBQyxDQUFDO1lBQ25DO1lBRUEsSUFBSUksZUFBZSxFQUFFO2NBQ25CLE1BQU0zRCxJQUFJLENBQUNoQyxjQUFjLENBQUNrRixXQUFXLENBQUM7Z0JBQUNMO2NBQUcsQ0FBQyxDQUFDO2NBQzVDLE1BQU03QyxJQUFJLENBQUNrRCxXQUFXLENBQUM7Z0JBQUNMO2NBQUcsQ0FBQyxDQUFDO2NBRzdCLElBQUlsSSxPQUFPLENBQUNrRyxRQUFRLENBQUM4QyxlQUFlLENBQUNDLElBQUksQ0FBQyxJQUFJRCxlQUFlLENBQUNDLElBQUksQ0FBQ0gsSUFBSSxFQUFFO2dCQUN2RSxNQUFNekQsSUFBSSxDQUFDeUosTUFBTSxDQUFDO2tCQUFDNUcsR0FBRztrQkFBRVksSUFBSSxFQUFFRSxlQUFlLENBQUNDLElBQUksQ0FBQ0g7Z0JBQUksQ0FBQyxDQUFDO2NBQzNEO1lBQ0Y7WUFDQSxPQUFPLElBQUk7VUFDYixDQUFDO1VBRUR4SSxNQUFNLENBQUN5TyxPQUFPLENBQUNWLFFBQVEsQ0FBQztRQUMxQjtNQUNGOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UsTUFBTTFCLGNBQWNBLENBQUEsRUFBK0I7UUFBQSxJQUE5QjVLLElBQUksR0FBQWdGLFNBQUEsQ0FBQXFELE1BQUEsUUFBQXJELFNBQUEsUUFBQWlJLFNBQUEsR0FBQWpJLFNBQUEsTUFBRyxDQUFDLENBQUM7UUFBQSxJQUFFMkMsTUFBTSxHQUFBM0MsU0FBQSxDQUFBcUQsTUFBQSxPQUFBckQsU0FBQSxNQUFBaUksU0FBQTtRQUFBLElBQUVDLFNBQVMsR0FBQWxJLFNBQUEsQ0FBQXFELE1BQUEsT0FBQXJELFNBQUEsTUFBQWlJLFNBQUE7UUFDL0MsSUFBSUUsR0FBRztRQUNQLElBQUksQ0FBQ2xQLE9BQU8sQ0FBQ3NGLFNBQVMsQ0FBQ3ZELElBQUksQ0FBQ3VLLEdBQUcsQ0FBQyxFQUFFO1VBQ2hDdkssSUFBSSxDQUFDdUssR0FBRyxHQUFHLEtBQUs7UUFDbEI7UUFFQSxJQUFJLENBQUN2SyxJQUFJLENBQUN3SyxPQUFPLEVBQUU7VUFDakJ4SyxJQUFJLENBQUN3SyxPQUFPLEdBQUcsS0FBSztRQUN0QjtRQUVBLElBQUksQ0FBQ3ZNLE9BQU8sQ0FBQ2dHLFFBQVEsQ0FBQ2pFLElBQUksQ0FBQzJLLE9BQU8sQ0FBQyxFQUFFO1VBQ25DM0ssSUFBSSxDQUFDMkssT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNuQjtRQUVBLElBQUksQ0FBQzFNLE9BQU8sQ0FBQ3lGLFFBQVEsQ0FBQzFELElBQUksQ0FBQzJNLE1BQU0sQ0FBQyxFQUFFO1VBQ2xDM00sSUFBSSxDQUFDMk0sTUFBTSxHQUFHM00sSUFBSSxDQUFDc0ssTUFBTTtRQUMzQjtRQUVBLElBQUksQ0FBQ3hKLE1BQU0sZ0NBQUFDLE1BQUEsQ0FBZ0NtTSxTQUFTLGFBQUFuTSxNQUFBLENBQVVmLElBQUksQ0FBQzJLLE9BQU8sT0FBQTVKLE1BQUEsQ0FBSWYsSUFBSSxDQUFDZ0gsVUFBVSxvQkFBQWpHLE1BQUEsQ0FBaUJmLElBQUksQ0FBQ2tILElBQUksQ0FBQ3RHLElBQUksSUFBSVosSUFBSSxDQUFDa0gsSUFBSSxDQUFDa0csUUFBUSxDQUFFLENBQUM7UUFFckosTUFBTUEsUUFBUSxHQUFHLElBQUksQ0FBQ0MsWUFBWSxDQUFDck4sSUFBSSxDQUFDa0gsSUFBSSxDQUFDO1FBQzdDLE1BQU07VUFBQ29HLFNBQVM7VUFBRUM7UUFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsT0FBTyxDQUFDSixRQUFRLENBQUM7UUFFNUQsSUFBSSxDQUFDblAsT0FBTyxDQUFDa0csUUFBUSxDQUFDbkUsSUFBSSxDQUFDa0gsSUFBSSxDQUFDMkQsSUFBSSxDQUFDLEVBQUU7VUFDckM3SyxJQUFJLENBQUNrSCxJQUFJLENBQUMyRCxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCO1FBRUEsSUFBSXBELE1BQU0sR0FBR3pILElBQUksQ0FBQ2tILElBQUk7UUFDdEJPLE1BQU0sQ0FBQzdHLElBQUksR0FBR3dNLFFBQVE7UUFDdEIzRixNQUFNLENBQUNvRCxJQUFJLEdBQUc3SyxJQUFJLENBQUNrSCxJQUFJLENBQUMyRCxJQUFJO1FBQzVCcEQsTUFBTSxDQUFDNkYsU0FBUyxHQUFHQSxTQUFTO1FBQzVCN0YsTUFBTSxDQUFDZ0csR0FBRyxHQUFHSCxTQUFTO1FBQ3RCN0YsTUFBTSxDQUFDdEIsR0FBRyxHQUFHbkcsSUFBSSxDQUFDc0ssTUFBTTtRQUN4QjdDLE1BQU0sQ0FBQ0UsTUFBTSxHQUFHQSxNQUFNLElBQUksSUFBSTtRQUM5QjNILElBQUksQ0FBQzJNLE1BQU0sR0FBRyxJQUFJLENBQUN4SixRQUFRLENBQUNuRCxJQUFJLENBQUMyTSxNQUFNLENBQUM7UUFFeEMsSUFBSSxJQUFJLENBQUNuSyxjQUFjLEVBQUU7VUFDdkJ4QyxJQUFJLENBQUMyTSxNQUFNLEdBQUcsSUFBSSxDQUFDbkssY0FBYyxDQUFDeEMsSUFBSSxDQUFDO1FBQ3pDO1FBRUF5SCxNQUFNLENBQUNWLElBQUksTUFBQWhHLE1BQUEsQ0FBTSxJQUFJLENBQUNNLFdBQVcsQ0FBQ29HLE1BQU0sQ0FBQyxFQUFBMUcsTUFBQSxDQUFHM0IsUUFBUSxDQUFDeUYsR0FBRyxFQUFBOUQsTUFBQSxDQUFHZixJQUFJLENBQUMyTSxNQUFNLEVBQUE1TCxNQUFBLENBQUd3TSxnQkFBZ0IsQ0FBRTtRQUMzRjlGLE1BQU0sR0FBRy9HLE1BQU0sQ0FBQ3FILE1BQU0sQ0FBQ04sTUFBTSxFQUFFLElBQUksQ0FBQ2lHLGFBQWEsQ0FBQ2pHLE1BQU0sQ0FBQyxDQUFDO1FBRTFELElBQUksSUFBSSxDQUFDN0UsY0FBYyxJQUFJM0UsT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQ3BCLGNBQWMsQ0FBQyxFQUFFO1VBQ2xFdUssR0FBRyxHQUFHek0sTUFBTSxDQUFDcUgsTUFBTSxDQUFDO1lBQ2xCYixJQUFJLEVBQUVsSCxJQUFJLENBQUNrSDtVQUNiLENBQUMsRUFBRTtZQUNEeUQsT0FBTyxFQUFFM0ssSUFBSSxDQUFDMkssT0FBTztZQUNyQmhELE1BQU0sRUFBRUYsTUFBTSxDQUFDRSxNQUFNO1lBQ3JCLE1BQU1ELFNBQVNBLENBQUEsRUFBRztjQUNoQixJQUFJbkosTUFBTSxDQUFDa08sS0FBSyxJQUFJaEYsTUFBTSxDQUFDRSxNQUFNLEVBQUU7Z0JBQ2pDLE9BQU9wSixNQUFNLENBQUNrTyxLQUFLLENBQUNuRixZQUFZLENBQUNHLE1BQU0sQ0FBQ0UsTUFBTSxDQUFDO2NBQ2pEO2NBQ0EsT0FBTyxJQUFJO1lBQ2IsQ0FBQztZQUNENEMsR0FBRyxFQUFFdkssSUFBSSxDQUFDdUs7VUFDWixDQUFDLENBQUM7VUFDRixNQUFNb0QsZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDL0ssY0FBYyxDQUFDa0YsSUFBSSxDQUFDcUYsR0FBRyxFQUFFMUYsTUFBTSxDQUFDO1VBRW5FLElBQUlrRyxlQUFlLEtBQUssSUFBSSxFQUFFO1lBQzVCLE1BQU0sSUFBSXBQLE1BQU0sQ0FBQ3VGLEtBQUssQ0FBQyxHQUFHLEVBQUU3RixPQUFPLENBQUN5RixRQUFRLENBQUNpSyxlQUFlLENBQUMsR0FBR0EsZUFBZSxHQUFHLGtDQUFrQyxDQUFDO1VBQ3ZILENBQUMsTUFBTTtZQUNMLElBQUszTixJQUFJLENBQUNpTCxJQUFJLEtBQUssSUFBSSxJQUFLLElBQUksQ0FBQ3BJLGdCQUFnQixJQUFJNUUsT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQ25CLGdCQUFnQixDQUFDLEVBQUU7Y0FDOUYsTUFBTSxJQUFJLENBQUNBLGdCQUFnQixDQUFDaUYsSUFBSSxDQUFDcUYsR0FBRyxFQUFFMUYsTUFBTSxDQUFDO1lBQy9DO1VBQ0Y7UUFDRixDQUFDLE1BQU0sSUFBS3pILElBQUksQ0FBQ2lMLElBQUksS0FBSyxJQUFJLElBQUssSUFBSSxDQUFDcEksZ0JBQWdCLElBQUk1RSxPQUFPLENBQUMrRixVQUFVLENBQUMsSUFBSSxDQUFDbkIsZ0JBQWdCLENBQUMsRUFBRTtVQUNyR3NLLEdBQUcsR0FBR3pNLE1BQU0sQ0FBQ3FILE1BQU0sQ0FBQztZQUNsQmIsSUFBSSxFQUFFbEgsSUFBSSxDQUFDa0g7VUFDYixDQUFDLEVBQUU7WUFDRHlELE9BQU8sRUFBRTNLLElBQUksQ0FBQzJLLE9BQU87WUFDckJoRCxNQUFNLEVBQUVGLE1BQU0sQ0FBQ0UsTUFBTTtZQUNyQixNQUFNRCxTQUFTQSxDQUFBLEVBQUc7Y0FDaEIsSUFBSW5KLE1BQU0sQ0FBQ2tPLEtBQUssSUFBSWhGLE1BQU0sQ0FBQ0UsTUFBTSxFQUFFO2dCQUNqQyxPQUFPcEosTUFBTSxDQUFDa08sS0FBSyxDQUFDbkYsWUFBWSxDQUFDRyxNQUFNLENBQUNFLE1BQU0sQ0FBQztjQUNqRDtjQUNBLE9BQU8sSUFBSTtZQUNiLENBQUM7WUFDRDRDLEdBQUcsRUFBRXZLLElBQUksQ0FBQ3VLO1VBQ1osQ0FBQyxDQUFDO1VBQ0YsTUFBTSxJQUFJLENBQUMxSCxnQkFBZ0IsQ0FBQ2lGLElBQUksQ0FBQ3FGLEdBQUcsRUFBRTFGLE1BQU0sQ0FBQztRQUMvQztRQUVBLE9BQU87VUFBQ0EsTUFBTTtVQUFFekg7UUFBSSxDQUFDO01BQ3ZCOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UsTUFBTThJLGFBQWFBLENBQUNyQixNQUFNLEVBQUV6SCxJQUFJLEVBQUU0TixFQUFFLEVBQUU7UUFDcEMsSUFBSSxDQUFDOU0sTUFBTSxzREFBQUMsTUFBQSxDQUFzRDBHLE1BQU0sQ0FBQ1YsSUFBSSxDQUFFLENBQUM7UUFDL0U3SCxFQUFFLENBQUMyTyxLQUFLLENBQUNwRyxNQUFNLENBQUNWLElBQUksRUFBRSxJQUFJLENBQUNoRSxXQUFXLEVBQUVuRCxJQUFJLENBQUM7UUFDN0M2SCxNQUFNLENBQUM3QyxJQUFJLEdBQUcsSUFBSSxDQUFDa0osWUFBWSxDQUFDOU4sSUFBSSxDQUFDa0gsSUFBSSxDQUFDO1FBQzFDTyxNQUFNLENBQUN4RSxNQUFNLEdBQUcsSUFBSSxDQUFDQSxNQUFNO1FBQzNCLElBQUksQ0FBQzhLLGdCQUFnQixDQUFDdEcsTUFBTSxDQUFDO1FBRTdCLElBQUl0QixHQUFHO1FBQ1AsSUFBSTtVQUNGQSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUNsRyxVQUFVLENBQUNxTCxXQUFXLENBQUNyTixPQUFPLENBQUNpTixLQUFLLENBQUN6RCxNQUFNLENBQUMsQ0FBQztVQUM5RCxJQUFJO1lBQ0YsTUFBTSxJQUFJLENBQUNuRyxjQUFjLENBQUMwTSxXQUFXLENBQUM7Y0FBQzdILEdBQUcsRUFBRW5HLElBQUksQ0FBQ3NLO1lBQU0sQ0FBQyxFQUFFO2NBQUMyRCxJQUFJLEVBQUU7Z0JBQUM3SCxVQUFVLEVBQUU7Y0FBSTtZQUFDLENBQUMsQ0FBQztZQUNyRixJQUFJRCxHQUFHLEVBQUVzQixNQUFNLENBQUN0QixHQUFHLEdBQUdBLEdBQUc7WUFDekIsSUFBSSxDQUFDckYsTUFBTSxxREFBQUMsTUFBQSxDQUFxRDBHLE1BQU0sQ0FBQ1YsSUFBSSxDQUFFLENBQUM7WUFDOUUsSUFBSSxJQUFJLENBQUNyRSxhQUFhLElBQUl6RSxPQUFPLENBQUMrRixVQUFVLENBQUMsSUFBSSxDQUFDdEIsYUFBYSxDQUFDLEVBQUU7Y0FDaEUsTUFBTSxJQUFJLENBQUNBLGFBQWEsQ0FBQ29GLElBQUksQ0FBQyxJQUFJLEVBQUVMLE1BQU0sQ0FBQztZQUM3QztZQUNBLElBQUksQ0FBQ3FELElBQUksQ0FBQyxhQUFhLEVBQUVyRCxNQUFNLENBQUM7WUFDaENtRyxFQUFFLENBQUMsSUFBSSxFQUFFbkcsTUFBTSxDQUFDO1VBQ2xCLENBQUMsQ0FBQyxPQUFPeUcsY0FBYyxFQUFFO1lBQ3ZCTixFQUFFLENBQUNNLGNBQWMsQ0FBQztZQUNsQixJQUFJLENBQUNwTixNQUFNLENBQUMsNERBQTRELEVBQUVvTixjQUFjLENBQUM7VUFDM0Y7UUFDRixDQUFDLENBQUMsT0FBT0MsU0FBUyxFQUFDO1VBQ2pCUCxFQUFFLENBQUNPLFNBQVMsQ0FBQztVQUNiLElBQUksQ0FBQ3JOLE1BQU0sQ0FBQyw0REFBNEQsRUFBRXFOLFNBQVMsQ0FBQztRQUN0RjtNQUNGOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0V0RixhQUFhQSxDQUFDcEIsTUFBTSxFQUFFekgsSUFBSSxFQUFFNE4sRUFBRSxFQUFFO1FBQzlCLElBQUk7VUFDRixJQUFJNU4sSUFBSSxDQUFDdUssR0FBRyxFQUFFO1lBQ1osSUFBSSxDQUFDbkcsZUFBZSxDQUFDcUQsTUFBTSxDQUFDdEIsR0FBRyxDQUFDLENBQUNRLEdBQUcsQ0FBQyxNQUFNO2NBQ3pDLElBQUksQ0FBQ21FLElBQUksQ0FBQyxlQUFlLEVBQUVyRCxNQUFNLEVBQUV6SCxJQUFJLEVBQUU0TixFQUFFLENBQUM7WUFDOUMsQ0FBQyxDQUFDO1VBQ0osQ0FBQyxNQUFNO1lBQ0wsSUFBSSxDQUFDeEosZUFBZSxDQUFDcUQsTUFBTSxDQUFDdEIsR0FBRyxDQUFDLENBQUNpSSxLQUFLLENBQUNwTyxJQUFJLENBQUMySyxPQUFPLEVBQUUzSyxJQUFJLENBQUN3SyxPQUFPLEVBQUVvRCxFQUFFLENBQUM7VUFDeEU7UUFDRixDQUFDLENBQUMsT0FBT3pOLENBQUMsRUFBRTtVQUNWLElBQUksQ0FBQ1csTUFBTSxDQUFDLDhCQUE4QixFQUFFWCxDQUFDLENBQUM7VUFDOUN5TixFQUFFLElBQUlBLEVBQUUsQ0FBQ3pOLENBQUMsQ0FBQztRQUNiO01BQ0Y7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFMk4sWUFBWUEsQ0FBQ08sUUFBUSxFQUFFO1FBQ3JCLElBQUlDLElBQUk7UUFDUjVQLEtBQUssQ0FBQzJQLFFBQVEsRUFBRTNOLE1BQU0sQ0FBQztRQUN2QixJQUFJekMsT0FBTyxDQUFDa0csUUFBUSxDQUFDa0ssUUFBUSxDQUFDLElBQUlBLFFBQVEsQ0FBQ3pKLElBQUksRUFBRTtVQUMvQzBKLElBQUksR0FBR0QsUUFBUSxDQUFDekosSUFBSTtRQUN0QjtRQUVBLElBQUksQ0FBQzBKLElBQUksSUFBSSxDQUFDclEsT0FBTyxDQUFDeUYsUUFBUSxDQUFDNEssSUFBSSxDQUFDLEVBQUU7VUFDcENBLElBQUksR0FBRywwQkFBMEI7UUFDbkM7UUFDQSxPQUFPQSxJQUFJO01BQ2I7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUMsVUFBVUEsQ0FBQ0MsS0FBSyxFQUFFO1FBQ2hCLElBQUksQ0FBQ0EsS0FBSyxFQUFFLE9BQU8sSUFBSTs7UUFFdkI7UUFDQSxJQUFJLENBQUNqUSxNQUFNLENBQUNrUSxNQUFNLENBQUNDLFFBQVEsWUFBWUMsR0FBRyxJQUFJLENBQUMxUSxPQUFPLENBQUNrRyxRQUFRLENBQUM1RixNQUFNLENBQUNrUSxNQUFNLENBQUNDLFFBQVEsQ0FBQyxFQUFFO1VBQ3ZGLE1BQU0sSUFBSTVLLEtBQUssQ0FBQyxzREFBc0QsQ0FBQztRQUN6RTtRQUVBLElBQUl2RixNQUFNLENBQUNrUSxNQUFNLENBQUNDLFFBQVEsWUFBWUMsR0FBRyxJQUFJcFEsTUFBTSxDQUFDa1EsTUFBTSxDQUFDQyxRQUFRLENBQUNFLEdBQUcsQ0FBQ0osS0FBSyxDQUFDLElBQUl2USxPQUFPLENBQUNrRyxRQUFRLENBQUM1RixNQUFNLENBQUNrUSxNQUFNLENBQUNDLFFBQVEsQ0FBQ0csR0FBRyxDQUFDTCxLQUFLLENBQUMsQ0FBQyxFQUFFO1VBQ3JJO1VBQ0EsT0FBT2pRLE1BQU0sQ0FBQ2tRLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDRyxHQUFHLENBQUNMLEtBQUssQ0FBQyxDQUFDN0csTUFBTTtRQUNqRCxDQUFDLE1BQU0sSUFBSTFKLE9BQU8sQ0FBQ2tHLFFBQVEsQ0FBQzVGLE1BQU0sQ0FBQ2tRLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDLElBQUlGLEtBQUssSUFBSWpRLE1BQU0sQ0FBQ2tRLE1BQU0sQ0FBQ0MsUUFBUSxJQUFJelEsT0FBTyxDQUFDa0csUUFBUSxDQUFDNUYsTUFBTSxDQUFDa1EsTUFBTSxDQUFDQyxRQUFRLENBQUNGLEtBQUssQ0FBQyxDQUFDLEVBQUU7VUFDekk7VUFDQSxPQUFPalEsTUFBTSxDQUFDa1EsTUFBTSxDQUFDQyxRQUFRLENBQUNGLEtBQUssQ0FBQyxDQUFDN0csTUFBTTtRQUM3QztRQUVBLE9BQU8sSUFBSTtNQUNiOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VDLFFBQVFBLENBQUEsRUFBRztRQUNULE9BQU8sSUFBSSxDQUFDeEYsT0FBTyxHQUNqQixJQUFJLENBQUNBLE9BQU8sQ0FBQyxHQUFHNEMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDOEosZUFBZSxDQUFDLEdBQUc5SixTQUFTLENBQUM7TUFDbkU7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRThKLGVBQWVBLENBQUN0SCxJQUFJLEVBQUU7UUFDcEIsTUFBTUMsTUFBTSxHQUFHO1VBQ2IsTUFBTUMsU0FBU0EsQ0FBQSxFQUFHO1lBQUUsT0FBTyxJQUFJO1VBQUUsQ0FBQztVQUNsQzBDLElBQUlBLENBQUEsRUFBRztZQUFFLE9BQU8sSUFBSTtVQUFFLENBQUM7VUFDdkJ6QyxNQUFNLEVBQUU7UUFDVixDQUFDO1FBRUQsSUFBSUgsSUFBSSxFQUFFO1VBQ1IsSUFBSXVILElBQUksR0FBRyxJQUFJO1VBQ2YsSUFBSXZILElBQUksQ0FBQzZDLE9BQU8sQ0FBQzdGLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNsQ3VLLElBQUksR0FBR3ZILElBQUksQ0FBQzZDLE9BQU8sQ0FBQzdGLE9BQU8sQ0FBQyxRQUFRLENBQUM7VUFDdkMsQ0FBQyxNQUFNO1lBQ0wsTUFBTXdLLE1BQU0sR0FBR3hILElBQUksQ0FBQzZDLE9BQU8sQ0FBQzVMLE9BQU87WUFDbkMsSUFBSXVRLE1BQU0sQ0FBQ0osR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2NBQ3hCRyxJQUFJLEdBQUdDLE1BQU0sQ0FBQ0gsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUM3QjtVQUNGO1VBRUEsSUFBSUUsSUFBSSxFQUFFO1lBQ1IsTUFBTXBILE1BQU0sR0FBRyxJQUFJLENBQUM0RyxVQUFVLENBQUNRLElBQUksQ0FBQztZQUVwQyxJQUFJcEgsTUFBTSxFQUFFO2NBQ1ZGLE1BQU0sQ0FBQ0MsU0FBUyxHQUFHLE1BQU1uSixNQUFNLENBQUNrTyxLQUFLLENBQUNuRixZQUFZLENBQUNLLE1BQU0sQ0FBQztjQUMxREYsTUFBTSxDQUFDRSxNQUFNLEdBQUdBLE1BQU07WUFDeEI7VUFDRjtRQUNGO1FBRUEsT0FBT0YsTUFBTTtNQUNmOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UsTUFBTTJHLEtBQUtBLENBQUNhLE1BQU0sRUFBbUM7UUFBQSxJQUFqQ3BDLEtBQUssR0FBQTdILFNBQUEsQ0FBQXFELE1BQUEsUUFBQXJELFNBQUEsUUFBQWlJLFNBQUEsR0FBQWpJLFNBQUEsTUFBRyxDQUFDLENBQUM7UUFBQSxJQUFFa0ssbUJBQW1CLEdBQUFsSyxTQUFBLENBQUFxRCxNQUFBLE9BQUFyRCxTQUFBLE1BQUFpSSxTQUFBO1FBQ2pELElBQUksQ0FBQ25NLE1BQU0sQ0FBQyxrQ0FBa0MsQ0FBQztRQUMvQyxJQUFJZCxJQUFJLEdBQUc2TSxLQUFLO1FBQ2hCLElBQUlzQyxrQkFBa0IsR0FBR0QsbUJBQW1CO1FBRTVDLElBQUlqUixPQUFPLENBQUNzRixTQUFTLENBQUN2RCxJQUFJLENBQUMsRUFBRTtVQUMzQm1QLGtCQUFrQixHQUFHblAsSUFBSTtVQUN6QkEsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNYO1FBRUF0QixLQUFLLENBQUNzQixJQUFJLEVBQUVyQixLQUFLLENBQUNpTyxRQUFRLENBQUNsTSxNQUFNLENBQUMsQ0FBQztRQUNuQ2hDLEtBQUssQ0FBQ3lRLGtCQUFrQixFQUFFeFEsS0FBSyxDQUFDaU8sUUFBUSxDQUFDdEgsT0FBTyxDQUFDLENBQUM7UUFFbER0RixJQUFJLENBQUNzSyxNQUFNLEdBQUd0SyxJQUFJLENBQUNzSyxNQUFNLElBQUksSUFBSSxDQUFDbkgsUUFBUSxDQUFDbkQsSUFBSSxDQUFDc0ssTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUM7UUFDaEUsTUFBTUEsTUFBTSxHQUFHdEssSUFBSSxDQUFDc0ssTUFBTSxJQUFJOUwsTUFBTSxDQUFDNFEsRUFBRSxDQUFDLENBQUM7UUFDekMsTUFBTUMsTUFBTSxHQUFHLElBQUksQ0FBQzdNLGNBQWMsR0FBRyxJQUFJLENBQUNBLGNBQWMsQ0FBQ3hDLElBQUksQ0FBQyxHQUFHc0ssTUFBTTtRQUN2RSxNQUFNOEMsUUFBUSxHQUFJcE4sSUFBSSxDQUFDWSxJQUFJLElBQUlaLElBQUksQ0FBQ29OLFFBQVEsR0FBS3BOLElBQUksQ0FBQ1ksSUFBSSxJQUFJWixJQUFJLENBQUNvTixRQUFRLEdBQUlpQyxNQUFNO1FBRXJGLE1BQU07VUFBQy9CLFNBQVM7VUFBRUM7UUFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsT0FBTyxDQUFDSixRQUFRLENBQUM7UUFFNURwTixJQUFJLENBQUMrRyxJQUFJLE1BQUFoRyxNQUFBLENBQU0sSUFBSSxDQUFDTSxXQUFXLENBQUNyQixJQUFJLENBQUMsRUFBQWUsTUFBQSxDQUFHM0IsUUFBUSxDQUFDeUYsR0FBRyxFQUFBOUQsTUFBQSxDQUFHc08sTUFBTSxFQUFBdE8sTUFBQSxDQUFHd00sZ0JBQWdCLENBQUU7UUFDbEZ2TixJQUFJLENBQUM0RSxJQUFJLEdBQUcsSUFBSSxDQUFDa0osWUFBWSxDQUFDOU4sSUFBSSxDQUFDO1FBQ25DLElBQUksQ0FBQy9CLE9BQU8sQ0FBQ2tHLFFBQVEsQ0FBQ25FLElBQUksQ0FBQzZLLElBQUksQ0FBQyxFQUFFO1VBQ2hDN0ssSUFBSSxDQUFDNkssSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNoQjtRQUVBLElBQUksQ0FBQzVNLE9BQU8sQ0FBQ2dHLFFBQVEsQ0FBQ2pFLElBQUksQ0FBQzBFLElBQUksQ0FBQyxFQUFFO1VBQ2hDMUUsSUFBSSxDQUFDMEUsSUFBSSxHQUFHdUssTUFBTSxDQUFDNUcsTUFBTTtRQUMzQjtRQUVBLE1BQU1aLE1BQU0sR0FBRyxJQUFJLENBQUNpRyxhQUFhLENBQUM7VUFDaEM5TSxJQUFJLEVBQUV3TSxRQUFRO1VBQ2RyRyxJQUFJLEVBQUUvRyxJQUFJLENBQUMrRyxJQUFJO1VBQ2Y4RCxJQUFJLEVBQUU3SyxJQUFJLENBQUM2SyxJQUFJO1VBQ2ZqRyxJQUFJLEVBQUU1RSxJQUFJLENBQUM0RSxJQUFJO1VBQ2ZGLElBQUksRUFBRTFFLElBQUksQ0FBQzBFLElBQUk7VUFDZmlELE1BQU0sRUFBRTNILElBQUksQ0FBQzJILE1BQU07VUFDbkIyRjtRQUNGLENBQUMsQ0FBQztRQUVGN0YsTUFBTSxDQUFDdEIsR0FBRyxHQUFHbUUsTUFBTTtRQUVuQixJQUFJaEcsT0FBTztRQUVYLElBQUlnTCxtQkFBbUIsR0FBRyxLQUFLO1FBQy9CLElBQUk7VUFDRixNQUFNQyxLQUFLLEdBQUcsTUFBTXJRLEVBQUUsQ0FBQ3NRLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDelAsSUFBSSxDQUFDK0csSUFBSSxDQUFDO1VBQy9DLElBQUksQ0FBQ3dJLEtBQUssQ0FBQ0csTUFBTSxDQUFDLENBQUMsRUFBRTtZQUNuQkosbUJBQW1CLEdBQUcsSUFBSTtVQUM1QjtRQUNGLENBQUMsQ0FBQyxPQUFPSyxTQUFTLEVBQUU7VUFDbEJMLG1CQUFtQixHQUFHLElBQUk7UUFDNUI7UUFDQSxJQUFJQSxtQkFBbUIsRUFBRTtVQUN2QixNQUFNTSxLQUFLLEdBQUc1UCxJQUFJLENBQUMrRyxJQUFJLENBQUNrRixLQUFLLENBQUMsR0FBRyxDQUFDO1VBQ2xDMkQsS0FBSyxDQUFDQyxHQUFHLENBQUMsQ0FBQztVQUNYLE1BQU0zUSxFQUFFLENBQUNzUSxRQUFRLENBQUNNLEtBQUssQ0FBQ0YsS0FBSyxDQUFDNU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQUVvRSxTQUFTLEVBQUU7VUFBSyxDQUFDLENBQUM7VUFDN0QsTUFBTWxHLEVBQUUsQ0FBQ3NRLFFBQVEsQ0FBQ08sU0FBUyxDQUFDL1AsSUFBSSxDQUFDK0csSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUM1QztRQUVBLE1BQU1pSixNQUFNLEdBQUc5USxFQUFFLENBQUMrUSxpQkFBaUIsQ0FBQ2pRLElBQUksQ0FBQytHLElBQUksRUFBRTtVQUFDbUosS0FBSyxFQUFFLEdBQUc7VUFBRS9LLElBQUksRUFBRSxJQUFJLENBQUNwQztRQUFXLENBQUMsQ0FBQztRQUVwRixNQUFNLElBQUlvTixPQUFPLENBQUMsQ0FBQ0MsT0FBTyxFQUFFQyxNQUFNLEtBQUs7VUFDckNMLE1BQU0sQ0FBQ3JKLEdBQUcsQ0FBQ3NJLE1BQU0sRUFBR3FCLFNBQVMsSUFBSztZQUNoQyxJQUFJQSxTQUFTLEVBQUU7Y0FDYkQsTUFBTSxDQUFDQyxTQUFTLENBQUM7WUFDbkIsQ0FBQyxNQUFNO2NBQ0xGLE9BQU8sQ0FBQyxDQUFDO1lBQ1g7VUFDRixDQUFDLENBQUM7UUFDSixDQUFDLENBQUM7UUFFRixJQUFJO1VBQ0YsTUFBTWpLLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQ2xHLFVBQVUsQ0FBQ3FMLFdBQVcsQ0FBQzdELE1BQU0sQ0FBQztVQUNyRG5ELE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQ3JFLFVBQVUsQ0FBQ3FILFlBQVksQ0FBQ25CLEdBQUcsQ0FBQztVQUVqRCxJQUFJZ0osa0JBQWtCLEtBQUssSUFBSSxFQUFFO1lBQy9CLElBQUksSUFBSSxDQUFDek0sYUFBYSxFQUFDO2NBQ3JCLE1BQU0sSUFBSSxDQUFDQSxhQUFhLENBQUNvRixJQUFJLENBQUMsSUFBSSxFQUFFeEQsT0FBTyxDQUFDO1lBQzlDO1lBQ0EsSUFBSSxDQUFDd0csSUFBSSxDQUFDLGtCQUFrQixFQUFFeEcsT0FBTyxDQUFDO1VBQ3hDO1VBQ0EsSUFBSSxDQUFDeEQsTUFBTSwrQkFBQUMsTUFBQSxDQUErQnFNLFFBQVEsVUFBQXJNLE1BQUEsQ0FBTyxJQUFJLENBQUNjLGNBQWMsQ0FBRSxDQUFDO1FBQ2pGLENBQUMsQ0FBQyxPQUFPME8sU0FBUyxFQUFFO1VBQ2xCLElBQUksQ0FBQ3pQLE1BQU0sOENBQUFDLE1BQUEsQ0FBOENxTSxRQUFRLFVBQUFyTSxNQUFBLENBQU8sSUFBSSxDQUFDYyxjQUFjLEdBQUkwTyxTQUFTLENBQUM7VUFDekcsTUFBTSxJQUFJaFMsTUFBTSxDQUFDdUYsS0FBSyxDQUFDLFlBQVksRUFBRXlNLFNBQVMsQ0FBQztRQUNqRDtRQUVBLE9BQU9qTSxPQUFPO01BQ2hCOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFLE1BQU1rTSxJQUFJQSxDQUFDQyxHQUFHLEVBQTJDO1FBQUEsSUFBekM1RCxLQUFLLEdBQUE3SCxTQUFBLENBQUFxRCxNQUFBLFFBQUFyRCxTQUFBLFFBQUFpSSxTQUFBLEdBQUFqSSxTQUFBLE1BQUcsQ0FBQyxDQUFDO1FBQUEsSUFBRWtLLG1CQUFtQixHQUFBbEssU0FBQSxDQUFBcUQsTUFBQSxRQUFBckQsU0FBQSxRQUFBaUksU0FBQSxHQUFBakksU0FBQSxNQUFHLEtBQUs7UUFDckQsSUFBSSxDQUFDbEUsTUFBTSxpQ0FBQUMsTUFBQSxDQUFpQzBQLEdBQUcsUUFBQTFQLE1BQUEsQ0FBS2lKLElBQUksQ0FBQ0MsU0FBUyxDQUFDNEMsS0FBSyxDQUFDLGlCQUFjLENBQUM7UUFDeEYsSUFBSTdNLElBQUksR0FBRzZNLEtBQUs7UUFDaEIsSUFBSXNDLGtCQUFrQixHQUFHRCxtQkFBbUI7UUFFNUMsSUFBSWpSLE9BQU8sQ0FBQ3NGLFNBQVMsQ0FBQ3NKLEtBQUssQ0FBQyxFQUFFO1VBQzVCc0Msa0JBQWtCLEdBQUd0QyxLQUFLO1VBQzFCN00sSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNYO1FBRUF0QixLQUFLLENBQUMrUixHQUFHLEVBQUU1TSxNQUFNLENBQUM7UUFDbEJuRixLQUFLLENBQUNzQixJQUFJLEVBQUVyQixLQUFLLENBQUNpTyxRQUFRLENBQUNsTSxNQUFNLENBQUMsQ0FBQztRQUNuQ2hDLEtBQUssQ0FBQ3lRLGtCQUFrQixFQUFFeFEsS0FBSyxDQUFDaU8sUUFBUSxDQUFDdEgsT0FBTyxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDckgsT0FBTyxDQUFDa0csUUFBUSxDQUFDbkUsSUFBSSxDQUFDLEVBQUU7VUFDM0JBLElBQUksR0FBRztZQUNMMFEsT0FBTyxFQUFFO1VBQ1gsQ0FBQztRQUNIO1FBRUEsSUFBSSxDQUFDMVEsSUFBSSxDQUFDMFEsT0FBTyxFQUFFO1VBQ2pCMVEsSUFBSSxDQUFDMFEsT0FBTyxHQUFHLE1BQU07UUFDdkI7UUFFQSxNQUFNcEcsTUFBTSxHQUFJdEssSUFBSSxDQUFDc0ssTUFBTSxJQUFJLElBQUksQ0FBQ25ILFFBQVEsQ0FBQ25ELElBQUksQ0FBQ3NLLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLElBQUs5TCxNQUFNLENBQUM0USxFQUFFLENBQUMsQ0FBQztRQUNsRixNQUFNQyxNQUFNLEdBQUcsSUFBSSxDQUFDN00sY0FBYyxHQUFHLElBQUksQ0FBQ0EsY0FBYyxDQUFDeEMsSUFBSSxDQUFDLEdBQUdzSyxNQUFNO1FBQ3ZFLE1BQU1xRyxTQUFTLEdBQUdGLEdBQUcsQ0FBQ3hFLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDaEMsTUFBTW1CLFFBQVEsR0FBSXBOLElBQUksQ0FBQ1ksSUFBSSxJQUFJWixJQUFJLENBQUNvTixRQUFRLEdBQUtwTixJQUFJLENBQUNZLElBQUksSUFBSVosSUFBSSxDQUFDb04sUUFBUSxHQUFJdUQsU0FBUyxDQUFDQSxTQUFTLENBQUN0SSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM0RCxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUlvRCxNQUFNO1FBRXRJLE1BQU07VUFBQy9CLFNBQVM7VUFBRUM7UUFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQ0MsT0FBTyxDQUFDSixRQUFRLENBQUM7UUFDNURwTixJQUFJLENBQUMrRyxJQUFJLE1BQUFoRyxNQUFBLENBQU0sSUFBSSxDQUFDTSxXQUFXLENBQUNyQixJQUFJLENBQUMsRUFBQWUsTUFBQSxDQUFHM0IsUUFBUSxDQUFDeUYsR0FBRyxFQUFBOUQsTUFBQSxDQUFHc08sTUFBTSxFQUFBdE8sTUFBQSxDQUFHd00sZ0JBQWdCLENBQUU7O1FBRWxGO1FBQ0EsSUFBSWpKLE9BQU87O1FBRVg7UUFDQTtRQUNBLE1BQU1zTSxXQUFXLEdBQUcsTUFBT25KLE1BQU0sSUFBSztVQUNwQ0EsTUFBTSxDQUFDdEIsR0FBRyxHQUFHbUUsTUFBTTtVQUNuQixNQUFNbkUsR0FBRyxHQUFJLE1BQU0sSUFBSSxDQUFDbEcsVUFBVSxDQUFDcUwsV0FBVyxDQUFDN0QsTUFBTSxDQUFDO1VBRXREbkQsT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDckUsVUFBVSxDQUFDcUgsWUFBWSxDQUFDbkIsR0FBRyxDQUFDO1VBQ2pELElBQUlnSixrQkFBa0IsS0FBSyxJQUFJLEVBQUU7WUFDL0IsSUFBSSxJQUFJLENBQUN6TSxhQUFhLEVBQUM7Y0FDckIsTUFBTSxJQUFJLENBQUNBLGFBQWEsQ0FBQ29GLElBQUksQ0FBQyxJQUFJLEVBQUV4RCxPQUFPLENBQUM7WUFDOUM7WUFDQSxJQUFJLENBQUN3RyxJQUFJLENBQUMsa0JBQWtCLEVBQUV4RyxPQUFPLENBQUM7VUFDeEM7VUFDQSxJQUFJLENBQUN4RCxNQUFNLHNDQUFBQyxNQUFBLENBQXNDcU0sUUFBUSxVQUFBck0sTUFBQSxDQUFPLElBQUksQ0FBQ2MsY0FBYyxDQUFFLENBQUM7UUFDeEYsQ0FBQzs7UUFFRDtRQUNBLElBQUl5TixtQkFBbUIsR0FBRyxLQUFLO1FBQy9CLElBQUk7VUFDRixNQUFNQyxLQUFLLEdBQUcsTUFBTXJRLEVBQUUsQ0FBQ3NRLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDelAsSUFBSSxDQUFDK0csSUFBSSxDQUFDO1VBQy9DLElBQUksQ0FBQ3dJLEtBQUssQ0FBQ0csTUFBTSxDQUFDLENBQUMsRUFBRTtZQUNuQkosbUJBQW1CLEdBQUcsSUFBSTtVQUM1QjtRQUNGLENBQUMsQ0FBQyxPQUFPSyxTQUFTLEVBQUU7VUFDbEJMLG1CQUFtQixHQUFHLElBQUk7UUFDNUI7UUFDQSxJQUFHQSxtQkFBbUIsRUFBRTtVQUN0QixNQUFNTSxLQUFLLEdBQUc1UCxJQUFJLENBQUMrRyxJQUFJLENBQUNrRixLQUFLLENBQUMsR0FBRyxDQUFDO1VBQ2xDMkQsS0FBSyxDQUFDQyxHQUFHLENBQUMsQ0FBQztVQUNYM1EsRUFBRSxDQUFDZ0csU0FBUyxDQUFDMEssS0FBSyxDQUFDNU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQUVvRSxTQUFTLEVBQUU7VUFBSyxDQUFDLENBQUM7VUFDbERsRyxFQUFFLENBQUMyUixhQUFhLENBQUM3USxJQUFJLENBQUMrRyxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQ2pDO1FBRUEsTUFBTStKLE9BQU8sR0FBRzVSLEVBQUUsQ0FBQytRLGlCQUFpQixDQUFDalEsSUFBSSxDQUFDK0csSUFBSSxFQUFFO1VBQUNtSixLQUFLLEVBQUUsR0FBRztVQUFFL0ssSUFBSSxFQUFFLElBQUksQ0FBQ3BDLFdBQVc7VUFBRWdPLFNBQVMsRUFBRSxJQUFJO1VBQUVDLFNBQVMsRUFBRTtRQUFNLENBQUMsQ0FBQztRQUN6SCxNQUFNQyxVQUFVLEdBQUcsSUFBSWhTLGVBQWUsQ0FBQyxDQUFDO1FBRXhDLElBQUk7VUFDRixJQUFJaVMsS0FBSztVQUVULElBQUlsUixJQUFJLENBQUMwUSxPQUFPLEdBQUcsQ0FBQyxFQUFFO1lBQ3BCUSxLQUFLLEdBQUczUyxNQUFNLENBQUNvTixVQUFVLENBQUMsTUFBTTtjQUM5QnNGLFVBQVUsQ0FBQ3BLLEtBQUssQ0FBQyxDQUFDO2NBQ2xCLE1BQU0sSUFBSXRJLE1BQU0sQ0FBQ3VGLEtBQUssQ0FBQyxHQUFHLDJCQUFBL0MsTUFBQSxDQUEyQmYsSUFBSSxDQUFDMFEsT0FBTyxPQUFJLENBQUM7WUFDeEUsQ0FBQyxFQUFFMVEsSUFBSSxDQUFDMFEsT0FBTyxDQUFDO1VBQ2xCO1VBRUEsTUFBTXZGLEdBQUcsR0FBRyxNQUFNOU0sS0FBSyxDQUFDb1MsR0FBRyxFQUFFO1lBQzNCak0sT0FBTyxFQUFFeEUsSUFBSSxDQUFDd0UsT0FBTyxJQUFJLENBQUMsQ0FBQztZQUMzQjJNLE1BQU0sRUFBRUYsVUFBVSxDQUFDRTtVQUNyQixDQUFDLENBQUM7VUFFRixJQUFJRCxLQUFLLEVBQUU7WUFDVDNTLE1BQU0sQ0FBQzZTLFlBQVksQ0FBQ0YsS0FBSyxDQUFDO1lBQzFCQSxLQUFLLEdBQUcsSUFBSTtVQUNkO1VBRUEsSUFBSSxDQUFDL0YsR0FBRyxDQUFDa0csRUFBRSxFQUFFO1lBQ1gsTUFBTSxJQUFJdk4sS0FBSyx3QkFBQS9DLE1BQUEsQ0FBd0JvSyxHQUFHLENBQUNtRyxVQUFVLENBQUUsQ0FBQztVQUMxRDtVQUVBLE1BQU1oUyxRQUFRLENBQUM2TCxHQUFHLENBQUNqQixJQUFJLEVBQUU0RyxPQUFPLENBQUM7VUFFakMsTUFBTXJKLE1BQU0sR0FBRyxJQUFJLENBQUNpRyxhQUFhLENBQUM7WUFDaEM5TSxJQUFJLEVBQUV3TSxRQUFRO1lBQ2RyRyxJQUFJLEVBQUUvRyxJQUFJLENBQUMrRyxJQUFJO1lBQ2Y4RCxJQUFJLEVBQUU3SyxJQUFJLENBQUM2SyxJQUFJO1lBQ2ZqRyxJQUFJLEVBQUU1RSxJQUFJLENBQUM0RSxJQUFJLElBQUl1RyxHQUFHLENBQUMzRyxPQUFPLENBQUNxSyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksSUFBSSxDQUFDZixZQUFZLENBQUM7Y0FBQy9HLElBQUksRUFBRS9HLElBQUksQ0FBQytHO1lBQUksQ0FBQyxDQUFDO1lBQzFGckMsSUFBSSxFQUFFMUUsSUFBSSxDQUFDMEUsSUFBSSxJQUFJUixRQUFRLENBQUNpSCxHQUFHLENBQUMzRyxPQUFPLENBQUNxSyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkVsSCxNQUFNLEVBQUUzSCxJQUFJLENBQUMySCxNQUFNO1lBQ25CMkY7VUFDRixDQUFDLENBQUM7VUFFRixJQUFJLENBQUM3RixNQUFNLENBQUMvQyxJQUFJLEVBQUU7WUFDaEIsTUFBTTZNLFFBQVEsR0FBRyxNQUFNclMsRUFBRSxDQUFDc1EsUUFBUSxDQUFDQyxJQUFJLENBQUN6UCxJQUFJLENBQUMrRyxJQUFJLENBQUM7WUFDbERVLE1BQU0sQ0FBQytKLFFBQVEsQ0FBQ0MsUUFBUSxDQUFDL00sSUFBSSxHQUFJK0MsTUFBTSxDQUFDL0MsSUFBSSxHQUFHNk0sUUFBUSxDQUFDN00sSUFBSztZQUM3RCxNQUFNa00sV0FBVyxDQUFDbkosTUFBTSxDQUFDO1VBQzNCLENBQUMsTUFBTTtZQUNMLE1BQU1tSixXQUFXLENBQUNuSixNQUFNLENBQUM7VUFDM0I7VUFDQTBELEdBQUcsQ0FBQ2pCLElBQUksQ0FBQ3dILElBQUksQ0FBQ1osT0FBTyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxPQUFNekwsS0FBSyxFQUFDO1VBQ1osSUFBSSxDQUFDdkUsTUFBTSx5Q0FBQUMsTUFBQSxDQUF5QzBQLEdBQUcsZ0JBQWFwTCxLQUFLLENBQUM7VUFFMUUsSUFBSW5HLEVBQUUsQ0FBQ3lTLFVBQVUsQ0FBQzNSLElBQUksQ0FBQytHLElBQUksQ0FBQyxFQUFFO1lBQzVCLE1BQU03SCxFQUFFLENBQUNzUSxRQUFRLENBQUN6QyxNQUFNLENBQUMvTSxJQUFJLENBQUMrRyxJQUFJLENBQUM7VUFDckM7VUFFQSxNQUFNMUIsS0FBSztRQUNiO1FBR0EsT0FBT2YsT0FBTztNQUNoQjs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFLE1BQU1zTixPQUFPQSxDQUFDN0ssSUFBSSxFQUFtQztRQUFBLElBQWpDOEYsS0FBSyxHQUFBN0gsU0FBQSxDQUFBcUQsTUFBQSxRQUFBckQsU0FBQSxRQUFBaUksU0FBQSxHQUFBakksU0FBQSxNQUFHLENBQUMsQ0FBQztRQUFBLElBQUVrSyxtQkFBbUIsR0FBQWxLLFNBQUEsQ0FBQXFELE1BQUEsT0FBQXJELFNBQUEsTUFBQWlJLFNBQUE7UUFDakQsSUFBSSxDQUFDbk0sTUFBTSwrQkFBQUMsTUFBQSxDQUErQmdHLElBQUksT0FBSSxDQUFDO1FBQ25ELElBQUkvRyxJQUFJLEdBQUc2TSxLQUFLO1FBQ2hCLElBQUlzQyxrQkFBa0IsR0FBR0QsbUJBQW1CO1FBRTVDLElBQUksSUFBSSxDQUFDak0sTUFBTSxFQUFFO1VBQ2YsTUFBTSxJQUFJMUUsTUFBTSxDQUFDdUYsS0FBSyxDQUNwQixHQUFHLEVBQ0gsa0hBQ0YsQ0FBQztRQUNIO1FBRUFwRixLQUFLLENBQUNxSSxJQUFJLEVBQUVsRCxNQUFNLENBQUM7UUFDbkJuRixLQUFLLENBQUNzQixJQUFJLEVBQUVyQixLQUFLLENBQUNpTyxRQUFRLENBQUNsTSxNQUFNLENBQUMsQ0FBQztRQUNuQ2hDLEtBQUssQ0FBQ3lRLGtCQUFrQixFQUFFeFEsS0FBSyxDQUFDaU8sUUFBUSxDQUFDdEgsT0FBTyxDQUFDLENBQUM7UUFFbEQsSUFBSWlLLEtBQUs7UUFDVCxJQUFJO1VBQ0ZBLEtBQUssR0FBRyxNQUFNclEsRUFBRSxDQUFDc1EsUUFBUSxDQUFDQyxJQUFJLENBQUMxSSxJQUFJLENBQUM7UUFDdEMsQ0FBQyxDQUFDLE9BQU84SyxPQUFPLEVBQUU7VUFDaEIsSUFBSUEsT0FBTyxDQUFDelIsSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUM3QixNQUFNLElBQUk3QixNQUFNLENBQUN1RixLQUFLLENBQ3BCLEdBQUcsZ0NBQUEvQyxNQUFBLENBQzJCZ0csSUFBSSw0QkFDcEMsQ0FBQztVQUNIO1VBQ0EsTUFBTSxJQUFJeEksTUFBTSxDQUFDdUYsS0FBSyxDQUFDK04sT0FBTyxDQUFDelIsSUFBSSxFQUFFeVIsT0FBTyxDQUFDQyxPQUFPLENBQUM7UUFDdkQ7UUFDQSxJQUFJdkMsS0FBSyxDQUFDRyxNQUFNLENBQUMsQ0FBQyxFQUFFO1VBQ2xCLElBQUksQ0FBQ3pSLE9BQU8sQ0FBQ2tHLFFBQVEsQ0FBQ25FLElBQUksQ0FBQyxFQUFFO1lBQzNCQSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1VBQ1g7VUFDQUEsSUFBSSxDQUFDK0csSUFBSSxHQUFHQSxJQUFJO1VBRWhCLElBQUksQ0FBQy9HLElBQUksQ0FBQ29OLFFBQVEsRUFBRTtZQUNsQixNQUFNdUQsU0FBUyxHQUFHNUosSUFBSSxDQUFDa0YsS0FBSyxDQUFDN00sUUFBUSxDQUFDeUYsR0FBRyxDQUFDO1lBQzFDN0UsSUFBSSxDQUFDb04sUUFBUSxHQUFHckcsSUFBSSxDQUFDa0YsS0FBSyxDQUFDN00sUUFBUSxDQUFDeUYsR0FBRyxDQUFDLENBQUM4TCxTQUFTLENBQUN0SSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1VBQ2hFO1VBRUEsTUFBTTtZQUFFaUY7VUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDRSxPQUFPLENBQUN4TixJQUFJLENBQUNvTixRQUFRLENBQUM7VUFFakQsSUFBSSxDQUFDblAsT0FBTyxDQUFDeUYsUUFBUSxDQUFDMUQsSUFBSSxDQUFDNEUsSUFBSSxDQUFDLEVBQUU7WUFDaEM1RSxJQUFJLENBQUM0RSxJQUFJLEdBQUcsSUFBSSxDQUFDa0osWUFBWSxDQUFDOU4sSUFBSSxDQUFDO1VBQ3JDO1VBRUEsSUFBSSxDQUFDL0IsT0FBTyxDQUFDa0csUUFBUSxDQUFDbkUsSUFBSSxDQUFDNkssSUFBSSxDQUFDLEVBQUU7WUFDaEM3SyxJQUFJLENBQUM2SyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1VBQ2hCO1VBRUEsSUFBSSxDQUFDNU0sT0FBTyxDQUFDZ0csUUFBUSxDQUFDakUsSUFBSSxDQUFDMEUsSUFBSSxDQUFDLEVBQUU7WUFDaEMxRSxJQUFJLENBQUMwRSxJQUFJLEdBQUc2SyxLQUFLLENBQUM3SyxJQUFJO1VBQ3hCO1VBRUEsTUFBTStDLE1BQU0sR0FBRyxJQUFJLENBQUNpRyxhQUFhLENBQUM7WUFDaEM5TSxJQUFJLEVBQUVaLElBQUksQ0FBQ29OLFFBQVE7WUFDbkJyRyxJQUFJO1lBQ0o4RCxJQUFJLEVBQUU3SyxJQUFJLENBQUM2SyxJQUFJO1lBQ2ZqRyxJQUFJLEVBQUU1RSxJQUFJLENBQUM0RSxJQUFJO1lBQ2ZGLElBQUksRUFBRTFFLElBQUksQ0FBQzBFLElBQUk7WUFDZmlELE1BQU0sRUFBRTNILElBQUksQ0FBQzJILE1BQU07WUFDbkIyRixTQUFTO1lBQ1R5RSxZQUFZLEVBQUVoTCxJQUFJLENBQUNoRCxPQUFPLElBQUFoRCxNQUFBLENBQUkzQixRQUFRLENBQUN5RixHQUFHLEVBQUE5RCxNQUFBLENBQUdmLElBQUksQ0FBQ29OLFFBQVEsR0FBSSxFQUFFLENBQUM7WUFDakU5QyxNQUFNLEVBQUd0SyxJQUFJLENBQUNzSyxNQUFNLElBQUksSUFBSSxDQUFDbkgsUUFBUSxDQUFDbkQsSUFBSSxDQUFDc0ssTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsSUFBSztVQUNsRSxDQUFDLENBQUM7VUFFRixJQUFJbkUsR0FBRztVQUNQLElBQUk7WUFDRkEsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDbEcsVUFBVSxDQUFDcUwsV0FBVyxDQUFDN0QsTUFBTSxDQUFDO1VBQ2pELENBQUMsQ0FBQyxPQUFPOEksU0FBUyxFQUFFO1lBQ2xCLElBQUksQ0FBQ3pQLE1BQU0sMERBQUFDLE1BQUEsQ0FDZ0QwRyxNQUFNLENBQUM3RyxJQUFJLFVBQUFHLE1BQUEsQ0FBTyxJQUFJLENBQUNjLGNBQWMsR0FDOUYwTyxTQUNGLENBQUM7WUFDRCxNQUFNLElBQUloUyxNQUFNLENBQUN1RixLQUFLLENBQUN5TSxTQUFTLENBQUNuUSxJQUFJLEVBQUVtUSxTQUFTLENBQUN1QixPQUFPLENBQUM7VUFDM0Q7VUFFQSxNQUFNeE4sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDckUsVUFBVSxDQUFDcUgsWUFBWSxDQUFDbkIsR0FBRyxDQUFDO1VBRXZELElBQUlnSixrQkFBa0IsS0FBSyxJQUFJLEVBQUU7WUFDL0IsSUFBSSxDQUFDek0sYUFBYSxJQUFJLElBQUksQ0FBQ0EsYUFBYSxDQUFDb0YsSUFBSSxDQUFDLElBQUksRUFBRXhELE9BQU8sQ0FBQztZQUM1RCxJQUFJLENBQUN3RyxJQUFJLENBQUMsYUFBYSxFQUFFeEcsT0FBTyxDQUFDO1VBQ25DO1VBQ0EsSUFBSSxDQUFDeEQsTUFBTSxzQ0FBQUMsTUFBQSxDQUM0QjBHLE1BQU0sQ0FBQzdHLElBQUksVUFBQUcsTUFBQSxDQUFPLElBQUksQ0FBQ2MsY0FBYyxDQUM1RSxDQUFDO1VBQ0QsT0FBT3lDLE9BQU87UUFDaEI7UUFDQSxNQUFNLElBQUkvRixNQUFNLENBQUN1RixLQUFLLENBQ3BCLEdBQUcsZ0NBQUEvQyxNQUFBLENBQzJCZ0csSUFBSSw0QkFDcEMsQ0FBQztNQUNIOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFLE1BQU1QLFdBQVdBLENBQUMrRixRQUFRLEVBQUU7UUFDMUIsSUFBSSxDQUFDekwsTUFBTSxtQ0FBQUMsTUFBQSxDQUFtQ2lKLElBQUksQ0FBQ0MsU0FBUyxDQUFDc0MsUUFBUSxDQUFDLE9BQUksQ0FBQztRQUMzRSxJQUFJQSxRQUFRLEtBQUssS0FBSyxDQUFDLEVBQUU7VUFDdkIsT0FBTyxDQUFDO1FBQ1Y7UUFFQSxNQUFNeUYsS0FBSyxHQUFHLElBQUksQ0FBQy9SLFVBQVUsQ0FBQ2dHLElBQUksQ0FBQ3NHLFFBQVEsQ0FBQztRQUM1QyxJQUFJLE9BQU15RixLQUFLLENBQUNwTCxVQUFVLENBQUMsQ0FBQyxJQUFHLENBQUMsRUFBRTtVQUNoQyxNQUFNb0wsS0FBSyxDQUFDQyxZQUFZLENBQUUvSyxJQUFJLElBQUs7WUFDakMsSUFBSSxDQUFDNkYsTUFBTSxDQUFDN0YsSUFBSSxDQUFDO1VBQ25CLENBQUMsQ0FBQztRQUNKLENBQUMsTUFBTTtVQUNMLE1BQU0sSUFBSTNJLE1BQU0sQ0FBQ3VGLEtBQUssQ0FBQyxHQUFHLEVBQUUsc0NBQXNDLENBQUM7UUFDckU7UUFFQSxJQUFJLElBQUksQ0FBQ3JCLGFBQWEsRUFBRTtVQUN0QixNQUFNeVAsSUFBSSxHQUFHLE1BQU1GLEtBQUssQ0FBQ0csVUFBVSxDQUFDLENBQUM7VUFDckMsTUFBTSxJQUFJLENBQUNsUyxVQUFVLENBQUN1RyxXQUFXLENBQUMrRixRQUFRLENBQUM7VUFDM0MsTUFBTSxJQUFJLENBQUM5SixhQUFhLENBQUN5UCxJQUFJLENBQUM7UUFDaEMsQ0FBQyxNQUFNO1VBQ0wsTUFBTSxJQUFJLENBQUNqUyxVQUFVLENBQUN1RyxXQUFXLENBQUMrRixRQUFRLENBQUM7UUFDN0M7UUFDQSxPQUFPLElBQUk7TUFDYjs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRTZGLElBQUlBLENBQUNDLEtBQUssRUFBRTtRQUNWLElBQUksQ0FBQ3BTLFVBQVUsQ0FBQ21TLElBQUksQ0FBQ0MsS0FBSyxDQUFDO1FBQzNCLE9BQU8sSUFBSSxDQUFDcFMsVUFBVTtNQUN4Qjs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRXFTLEtBQUtBLENBQUNELEtBQUssRUFBRTtRQUNYLElBQUksQ0FBQ3BTLFVBQVUsQ0FBQ3FTLEtBQUssQ0FBQ0QsS0FBSyxDQUFDO1FBQzVCLE9BQU8sSUFBSSxDQUFDcFMsVUFBVTtNQUN4Qjs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VzUyxVQUFVQSxDQUFBLEVBQUc7UUFDWCxJQUFJLENBQUN0UyxVQUFVLENBQUNtUyxJQUFJLENBQUM7VUFDbkJJLE1BQU1BLENBQUEsRUFBRztZQUFFLE9BQU8sSUFBSTtVQUFFLENBQUM7VUFDekJDLE1BQU1BLENBQUEsRUFBRztZQUFFLE9BQU8sSUFBSTtVQUFFLENBQUM7VUFDekJDLE1BQU1BLENBQUEsRUFBRztZQUFFLE9BQU8sSUFBSTtVQUFFO1FBQzFCLENBQUMsQ0FBQztRQUNGLE9BQU8sSUFBSSxDQUFDelMsVUFBVTtNQUN4Qjs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UwUyxXQUFXQSxDQUFBLEVBQUc7UUFDWixJQUFJLENBQUMxUyxVQUFVLENBQUNxUyxLQUFLLENBQUM7VUFDcEJFLE1BQU1BLENBQUEsRUFBRztZQUFFLE9BQU8sSUFBSTtVQUFFLENBQUM7VUFDekJDLE1BQU1BLENBQUEsRUFBRztZQUFFLE9BQU8sSUFBSTtVQUFFLENBQUM7VUFDekJDLE1BQU1BLENBQUEsRUFBRztZQUFFLE9BQU8sSUFBSTtVQUFFO1FBQzFCLENBQUMsQ0FBQztRQUNGLE9BQU8sSUFBSSxDQUFDelMsVUFBVTtNQUN4Qjs7TUFHQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFOE0sTUFBTUEsQ0FBQ3pJLE9BQU8sRUFBRTZILE9BQU8sRUFBRXhNLFFBQVEsRUFBRTtRQUNqQyxJQUFJLENBQUNtQixNQUFNLDhCQUFBQyxNQUFBLENBQThCdUQsT0FBTyxDQUFDNkIsR0FBRyxRQUFBcEYsTUFBQSxDQUFLb0wsT0FBTyxPQUFJLENBQUM7UUFDckUsSUFBSUEsT0FBTyxFQUFFO1VBQ1gsSUFBSWxPLE9BQU8sQ0FBQ2tHLFFBQVEsQ0FBQ0csT0FBTyxDQUFDa04sUUFBUSxDQUFDLElBQUl2VCxPQUFPLENBQUNrRyxRQUFRLENBQUNHLE9BQU8sQ0FBQ2tOLFFBQVEsQ0FBQ3JGLE9BQU8sQ0FBQyxDQUFDLElBQUk3SCxPQUFPLENBQUNrTixRQUFRLENBQUNyRixPQUFPLENBQUMsQ0FBQ3BGLElBQUksRUFBRTtZQUN2SDdILEVBQUUsQ0FBQzZOLE1BQU0sQ0FBQ3pJLE9BQU8sQ0FBQ2tOLFFBQVEsQ0FBQ3JGLE9BQU8sQ0FBQyxDQUFDcEYsSUFBSSxFQUFHcEgsUUFBUSxJQUFJQyxJQUFLLENBQUM7VUFDL0Q7UUFDRixDQUFDLE1BQU07VUFDTCxJQUFJM0IsT0FBTyxDQUFDa0csUUFBUSxDQUFDRyxPQUFPLENBQUNrTixRQUFRLENBQUMsRUFBRTtZQUN0QyxLQUFJLElBQUlvQixJQUFJLElBQUl0TyxPQUFPLENBQUNrTixRQUFRLEVBQUU7Y0FDaEMsSUFBSWxOLE9BQU8sQ0FBQ2tOLFFBQVEsQ0FBQ29CLElBQUksQ0FBQyxJQUFJdE8sT0FBTyxDQUFDa04sUUFBUSxDQUFDb0IsSUFBSSxDQUFDLENBQUM3TCxJQUFJLEVBQUU7Z0JBQ3pEN0gsRUFBRSxDQUFDNk4sTUFBTSxDQUFDekksT0FBTyxDQUFDa04sUUFBUSxDQUFDb0IsSUFBSSxDQUFDLENBQUM3TCxJQUFJLEVBQUdwSCxRQUFRLElBQUlDLElBQUssQ0FBQztjQUM1RDtZQUNGO1VBQ0YsQ0FBQyxNQUFNO1lBQ0xWLEVBQUUsQ0FBQzZOLE1BQU0sQ0FBQ3pJLE9BQU8sQ0FBQ3lDLElBQUksRUFBR3BILFFBQVEsSUFBSUMsSUFBSyxDQUFDO1VBQzdDO1FBQ0Y7UUFDQSxPQUFPLElBQUk7TUFDYjs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFaVQsSUFBSUEsQ0FBQ3JMLElBQUksRUFBRTtRQUNULElBQUksQ0FBQzFHLE1BQU0sZ0NBQUFDLE1BQUEsQ0FBZ0N5RyxJQUFJLENBQUM2QyxPQUFPLENBQUN5SSxXQUFXLDZCQUEwQixDQUFDO1FBQzlGLE1BQU03SyxJQUFJLEdBQUcsbUJBQW1CO1FBRWhDLElBQUksQ0FBQ1QsSUFBSSxDQUFDVSxRQUFRLENBQUNDLFdBQVcsRUFBRTtVQUM5QlgsSUFBSSxDQUFDVSxRQUFRLENBQUNFLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDM0IsY0FBYyxFQUFFLFlBQVk7WUFDNUIsZ0JBQWdCLEVBQUVILElBQUksQ0FBQ0k7VUFDekIsQ0FBQyxDQUFDO1FBQ0o7UUFFQSxJQUFJLENBQUNiLElBQUksQ0FBQ1UsUUFBUSxDQUFDSSxRQUFRLEVBQUU7VUFDM0JkLElBQUksQ0FBQ1UsUUFBUSxDQUFDdkIsR0FBRyxDQUFDc0IsSUFBSSxDQUFDO1FBQ3pCO01BQ0Y7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRSxNQUFNbUUsUUFBUUEsQ0FBQzVFLElBQUksRUFBaUM7UUFBQSxJQUEvQjJFLE9BQU8sR0FBQW5ILFNBQUEsQ0FBQXFELE1BQUEsUUFBQXJELFNBQUEsUUFBQWlJLFNBQUEsR0FBQWpJLFNBQUEsTUFBRyxVQUFVO1FBQUEsSUFBRVYsT0FBTyxHQUFBVSxTQUFBLENBQUFxRCxNQUFBLE9BQUFyRCxTQUFBLE1BQUFpSSxTQUFBO1FBQ2hELElBQUk4RixJQUFJO1FBQ1IsSUFBSSxDQUFDalMsTUFBTSxnQ0FBQUMsTUFBQSxDQUNzQnlHLElBQUksQ0FBQzZDLE9BQU8sQ0FBQ3lJLFdBQVcsUUFBQS9SLE1BQUEsQ0FBS29MLE9BQU8sT0FDckUsQ0FBQztRQUVELElBQUk3SCxPQUFPLEVBQUU7VUFDWCxJQUNFckcsT0FBTyxDQUFDMlEsR0FBRyxDQUFDdEssT0FBTyxFQUFFLFVBQVUsQ0FBQyxJQUNoQ3JHLE9BQU8sQ0FBQzJRLEdBQUcsQ0FBQ3RLLE9BQU8sQ0FBQ2tOLFFBQVEsRUFBRXJGLE9BQU8sQ0FBQyxFQUN0QztZQUNBNEcsSUFBSSxHQUFHek8sT0FBTyxDQUFDa04sUUFBUSxDQUFDckYsT0FBTyxDQUFDO1lBQ2hDNEcsSUFBSSxDQUFDNU0sR0FBRyxHQUFHN0IsT0FBTyxDQUFDNkIsR0FBRztVQUN4QixDQUFDLE1BQU07WUFDTDRNLElBQUksR0FBR3pPLE9BQU87VUFDaEI7UUFDRixDQUFDLE1BQU07VUFDTHlPLElBQUksR0FBRyxLQUFLO1FBQ2Q7UUFFQSxJQUFJLENBQUNBLElBQUksSUFBSSxDQUFDOVUsT0FBTyxDQUFDa0csUUFBUSxDQUFDNE8sSUFBSSxDQUFDLEVBQUU7VUFDcEMsT0FBTyxJQUFJLENBQUNGLElBQUksQ0FBQ3JMLElBQUksQ0FBQztRQUN4QixDQUFDLE1BQU0sSUFBSWxELE9BQU8sRUFBRTtVQUNsQixJQUNFckcsT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQzlCLGdCQUFnQixDQUFDLElBQ3pDLEVBQUUsTUFBTSxJQUFJLENBQUNBLGdCQUFnQixDQUMzQnhCLE1BQU0sQ0FBQ3FILE1BQU0sQ0FBQ1AsSUFBSSxFQUFFLElBQUksQ0FBQ0ksUUFBUSxDQUFDSixJQUFJLENBQUMsQ0FBQyxFQUN4Q2xELE9BQ0YsQ0FBQyxDQUFDLEVBQ0Y7WUFDQSxPQUFPLElBQUksQ0FBQ3VPLElBQUksQ0FBQ3JMLElBQUksQ0FBQztVQUN4QjtVQUVBLElBQ0UsSUFBSSxDQUFDbEYsaUJBQWlCLElBQ3RCckUsT0FBTyxDQUFDK0YsVUFBVSxDQUFDLElBQUksQ0FBQzFCLGlCQUFpQixDQUFDLElBQzFDLENBQUMsTUFBTSxJQUFJLENBQUNBLGlCQUFpQixDQUFDa0YsSUFBSSxFQUFFbEQsT0FBTyxFQUFFNkgsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUMvRDtZQUNBLE9BQU8sS0FBSyxDQUFDO1VBQ2Y7VUFFQSxJQUFJb0QsS0FBSztVQUVULElBQUk7WUFDRkEsS0FBSyxHQUFHLE1BQU1yUSxFQUFFLENBQUNzUSxRQUFRLENBQUNDLElBQUksQ0FBQ3NELElBQUksQ0FBQ2hNLElBQUksQ0FBQztVQUMzQyxDQUFDLENBQUMsT0FBTzhLLE9BQU8sRUFBQztZQUNmLElBQUlBLE9BQU8sRUFBRTtjQUNYLE9BQU8sSUFBSSxDQUFDZ0IsSUFBSSxDQUFDckwsSUFBSSxDQUFDO1lBQ3hCO1VBQ0Y7VUFDQSxJQUFJLENBQUMrSCxLQUFLLENBQUNHLE1BQU0sQ0FBQyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxJQUFJLENBQUNtRCxJQUFJLENBQUNyTCxJQUFJLENBQUM7VUFDeEI7VUFDQSxJQUFJd0wsWUFBWTtVQUVoQixJQUFJekQsS0FBSyxDQUFDN0ssSUFBSSxLQUFLcU8sSUFBSSxDQUFDck8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDckMsY0FBYyxFQUFFO1lBQ3BEMFEsSUFBSSxDQUFDck8sSUFBSSxHQUFHNkssS0FBSyxDQUFDN0ssSUFBSTtVQUN4QjtVQUVBLElBQUk2SyxLQUFLLENBQUM3SyxJQUFJLEtBQUtxTyxJQUFJLENBQUNyTyxJQUFJLElBQUksSUFBSSxDQUFDckMsY0FBYyxFQUFFO1lBQ25EMlEsWUFBWSxHQUFHLEtBQUs7VUFDdEI7VUFFQSxJQUFJLENBQUNDLEtBQUssQ0FDUnpMLElBQUksRUFDSmxELE9BQU8sRUFDUHlPLElBQUksRUFDSjVHLE9BQU8sRUFDUCxJQUFJLEVBQ0o2RyxZQUFZLElBQUksS0FDbEIsQ0FBQztVQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2Y7UUFDQSxPQUFPLElBQUksQ0FBQ0gsSUFBSSxDQUFDckwsSUFBSSxDQUFDO01BQ3hCOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRXlMLEtBQUtBLENBQUN6TCxJQUFJLEVBQUVsRCxPQUFPLEVBQUV5TyxJQUFJLEVBQXdGO1FBQUEsSUFBQUcsWUFBQSxFQUFBQyxrQkFBQSxFQUFBQyxhQUFBLEVBQUFDLG1CQUFBO1FBQUEsSUFBdEZsSCxPQUFPLEdBQUFuSCxTQUFBLENBQUFxRCxNQUFBLFFBQUFyRCxTQUFBLFFBQUFpSSxTQUFBLEdBQUFqSSxTQUFBLE1BQUcsVUFBVTtRQUFBLElBQUVzTyxjQUFjLEdBQUF0TyxTQUFBLENBQUFxRCxNQUFBLFFBQUFyRCxTQUFBLFFBQUFpSSxTQUFBLEdBQUFqSSxTQUFBLE1BQUcsSUFBSTtRQUFBLElBQUV1TyxhQUFhLEdBQUF2TyxTQUFBLENBQUFxRCxNQUFBLFFBQUFyRCxTQUFBLFFBQUFpSSxTQUFBLEdBQUFqSSxTQUFBLE1BQUcsS0FBSztRQUFBLElBQUV3TyxRQUFRLEdBQUF4TyxTQUFBLENBQUFxRCxNQUFBLFFBQUFyRCxTQUFBLFFBQUFpSSxTQUFBLEdBQUFqSSxTQUFBLE1BQUcsS0FBSztRQUM3RyxJQUFJeU8sUUFBUSxHQUFHLEtBQUs7UUFDcEIsSUFBSUMsUUFBUSxHQUFHLEtBQUs7UUFDcEIsSUFBSUMsZUFBZSxHQUFHLEVBQUU7UUFDeEIsSUFBSUMsS0FBSztRQUNULElBQUlqTixHQUFHO1FBQ1AsSUFBSWtOLElBQUk7UUFDUixJQUFJYixZQUFZLEdBQUdPLGFBQWE7UUFFaEMsSUFBSSxDQUFBTCxZQUFBLEdBQUExTCxJQUFJLENBQUNLLE1BQU0sY0FBQXFMLFlBQUEsZ0JBQUFDLGtCQUFBLEdBQVhELFlBQUEsQ0FBYWhILEtBQUssY0FBQWlILGtCQUFBLGVBQWxCQSxrQkFBQSxDQUFvQi9HLFFBQVEsSUFBSzVFLElBQUksQ0FBQ0ssTUFBTSxDQUFDcUUsS0FBSyxDQUFDRSxRQUFRLEtBQUssTUFBTyxFQUFFO1VBQzNFdUgsZUFBZSxHQUFHLGNBQWM7UUFDbEMsQ0FBQyxNQUFNO1VBQ0xBLGVBQWUsR0FBRyxVQUFVO1FBQzlCO1FBRUEsTUFBTUcsZUFBZSxpQkFBQS9TLE1BQUEsQ0FBaUJnVCxTQUFTLENBQUNoQixJQUFJLENBQUNuUyxJQUFJLElBQUkwRCxPQUFPLENBQUMxRCxJQUFJLENBQUMsQ0FBQ21ELE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLDJCQUFBaEQsTUFBQSxDQUF3QmlULGtCQUFrQixDQUFDakIsSUFBSSxDQUFDblMsSUFBSSxJQUFJMEQsT0FBTyxDQUFDMUQsSUFBSSxDQUFDLE9BQUk7UUFDekssTUFBTXFULG1CQUFtQixHQUFHLGVBQWU7UUFFM0MsSUFBSSxDQUFDek0sSUFBSSxDQUFDVSxRQUFRLENBQUNDLFdBQVcsRUFBRTtVQUM5QlgsSUFBSSxDQUFDVSxRQUFRLENBQUN5QixTQUFTLENBQUMscUJBQXFCLEVBQUVnSyxlQUFlLEdBQUdHLGVBQWUsR0FBR0csbUJBQW1CLENBQUM7UUFDekc7UUFFQSxJQUFJek0sSUFBSSxDQUFDNkMsT0FBTyxDQUFDN0YsT0FBTyxDQUFDMFAsS0FBSyxJQUFJLENBQUNWLFFBQVEsRUFBRTtVQUMzQ0MsUUFBUSxHQUFHLElBQUk7VUFDZixNQUFNVSxLQUFLLEdBQUczTSxJQUFJLENBQUM2QyxPQUFPLENBQUM3RixPQUFPLENBQUMwUCxLQUFLLENBQUNqSSxLQUFLLENBQUMseUJBQXlCLENBQUM7VUFDekUySCxLQUFLLEdBQUcxUCxRQUFRLENBQUNpUSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDMUJ4TixHQUFHLEdBQUd6QyxRQUFRLENBQUNpUSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDeEIsSUFBSUMsS0FBSyxDQUFDek4sR0FBRyxDQUFDLEVBQUU7WUFDZEEsR0FBRyxHQUFHb00sSUFBSSxDQUFDck8sSUFBSSxHQUFHLENBQUM7VUFDckI7VUFDQW1QLElBQUksR0FBR2xOLEdBQUcsR0FBR2lOLEtBQUs7UUFDcEIsQ0FBQyxNQUFNO1VBQ0xBLEtBQUssR0FBRyxDQUFDO1VBQ1RqTixHQUFHLEdBQUdvTSxJQUFJLENBQUNyTyxJQUFJLEdBQUcsQ0FBQztVQUNuQm1QLElBQUksR0FBR2QsSUFBSSxDQUFDck8sSUFBSTtRQUNsQjtRQUVBLElBQUkrTyxRQUFRLElBQUssQ0FBQUwsYUFBQSxHQUFBNUwsSUFBSSxDQUFDSyxNQUFNLGNBQUF1TCxhQUFBLGdCQUFBQyxtQkFBQSxHQUFYRCxhQUFBLENBQWFsSCxLQUFLLGNBQUFtSCxtQkFBQSxlQUFsQkEsbUJBQUEsQ0FBb0JnQixJQUFJLElBQUs3TSxJQUFJLENBQUNLLE1BQU0sQ0FBQ3FFLEtBQUssQ0FBQ21JLElBQUksS0FBSyxNQUFRLEVBQUU7VUFDakZYLFFBQVEsR0FBRztZQUFDRSxLQUFLO1lBQUVqTjtVQUFHLENBQUM7VUFDdkIsSUFBSXlOLEtBQUssQ0FBQ1IsS0FBSyxDQUFDLElBQUksQ0FBQ1EsS0FBSyxDQUFDek4sR0FBRyxDQUFDLEVBQUU7WUFDL0IrTSxRQUFRLENBQUNFLEtBQUssR0FBR2pOLEdBQUcsR0FBR2tOLElBQUk7WUFDM0JILFFBQVEsQ0FBQy9NLEdBQUcsR0FBR0EsR0FBRztVQUNwQjtVQUNBLElBQUksQ0FBQ3lOLEtBQUssQ0FBQ1IsS0FBSyxDQUFDLElBQUlRLEtBQUssQ0FBQ3pOLEdBQUcsQ0FBQyxFQUFFO1lBQy9CK00sUUFBUSxDQUFDRSxLQUFLLEdBQUdBLEtBQUs7WUFDdEJGLFFBQVEsQ0FBQy9NLEdBQUcsR0FBR2lOLEtBQUssR0FBR0MsSUFBSTtVQUM3QjtVQUVBLElBQUtELEtBQUssR0FBR0MsSUFBSSxJQUFLZCxJQUFJLENBQUNyTyxJQUFJLEVBQUU7WUFDL0JnUCxRQUFRLENBQUMvTSxHQUFHLEdBQUdvTSxJQUFJLENBQUNyTyxJQUFJLEdBQUcsQ0FBQztVQUM5QjtVQUVBLElBQUksSUFBSSxDQUFDckIsTUFBTSxLQUFNcVEsUUFBUSxDQUFDRSxLQUFLLElBQUtiLElBQUksQ0FBQ3JPLElBQUksR0FBRyxDQUFFLElBQU1nUCxRQUFRLENBQUMvTSxHQUFHLEdBQUlvTSxJQUFJLENBQUNyTyxJQUFJLEdBQUcsQ0FBRyxDQUFDLEVBQUU7WUFDNUZzTyxZQUFZLEdBQUcsS0FBSztVQUN0QixDQUFDLE1BQU07WUFDTEEsWUFBWSxHQUFHLEtBQUs7VUFDdEI7UUFDRixDQUFDLE1BQU07VUFDTEEsWUFBWSxHQUFHLEtBQUs7UUFDdEI7UUFFQSxNQUFNc0Isa0JBQWtCLEdBQUlqUCxLQUFLLElBQUs7VUFDcEMsSUFBSSxDQUFDdkUsTUFBTSw2QkFBQUMsTUFBQSxDQUE2QmdTLElBQUksQ0FBQ2hNLElBQUksUUFBQWhHLE1BQUEsQ0FBS29MLE9BQU8sZUFBWTlHLEtBQUssQ0FBQztVQUMvRSxJQUFJLENBQUNtQyxJQUFJLENBQUNVLFFBQVEsQ0FBQ0ksUUFBUSxFQUFFO1lBQzNCZCxJQUFJLENBQUNVLFFBQVEsQ0FBQ3ZCLEdBQUcsQ0FBQ3RCLEtBQUssQ0FBQzBFLFFBQVEsQ0FBQyxDQUFDLENBQUM7VUFDckM7UUFDRixDQUFDO1FBRUQsTUFBTXZGLE9BQU8sR0FBR3ZHLE9BQU8sQ0FBQytGLFVBQVUsQ0FBQyxJQUFJLENBQUNkLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQ0EsZUFBZSxDQUFDOFAsWUFBWSxFQUFFMU8sT0FBTyxFQUFFeU8sSUFBSSxFQUFFNUcsT0FBTyxFQUFFM0UsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDdEUsZUFBZTtRQUVsSixJQUFJLENBQUNzQixPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7VUFDN0IsSUFBSSxDQUFDZ0QsSUFBSSxDQUFDVSxRQUFRLENBQUNDLFdBQVcsRUFBRTtZQUM5QlgsSUFBSSxDQUFDVSxRQUFRLENBQUN5QixTQUFTLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQ2hJLFlBQVksQ0FBQztVQUM3RDtRQUNGO1FBRUEsS0FBSyxJQUFJaEIsR0FBRyxJQUFJNkQsT0FBTyxFQUFFO1VBQ3ZCLElBQUksQ0FBQ2dELElBQUksQ0FBQ1UsUUFBUSxDQUFDQyxXQUFXLEVBQUU7WUFDOUJYLElBQUksQ0FBQ1UsUUFBUSxDQUFDeUIsU0FBUyxDQUFDaEosR0FBRyxFQUFFNkQsT0FBTyxDQUFDN0QsR0FBRyxDQUFDLENBQUM7VUFDNUM7UUFDRjtRQUVBLE1BQU00VCxPQUFPLEdBQUdBLENBQUN2RSxNQUFNLEVBQUU1UCxJQUFJLEtBQUs7VUFDaEM0UCxNQUFNLENBQUN3RSxRQUFRLEdBQUcsS0FBSztVQUN2QixNQUFNQyxhQUFhLEdBQUlDLFVBQVUsSUFBSztZQUNwQyxJQUFJLENBQUNBLFVBQVUsRUFBRTtjQUNmMUUsTUFBTSxDQUFDd0UsUUFBUSxHQUFHLElBQUk7WUFDeEIsQ0FBQyxNQUFNO2NBQ0wsSUFBSSxDQUFDMVQsTUFBTSw2QkFBQUMsTUFBQSxDQUE2QmdTLElBQUksQ0FBQ2hNLElBQUksUUFBQWhHLE1BQUEsQ0FBS29MLE9BQU8sMk1BQXdNdUksVUFBVSxDQUFDO1lBQ2xSO1VBQ0YsQ0FBQztVQUVELE1BQU1DLFdBQVcsR0FBR0EsQ0FBQSxLQUFNO1lBQ3hCLElBQUksQ0FBQzNFLE1BQU0sQ0FBQ3dFLFFBQVEsSUFBSSxDQUFDeEUsTUFBTSxDQUFDNEUsU0FBUyxFQUFFO2NBQ3pDLElBQUk7Z0JBQ0YsSUFBSSxPQUFPNUUsTUFBTSxDQUFDNkUsS0FBSyxLQUFLLFVBQVUsRUFBRTtrQkFDdEM3RSxNQUFNLENBQUM2RSxLQUFLLENBQUNKLGFBQWEsQ0FBQztnQkFDN0IsQ0FBQyxNQUFNLElBQUksT0FBT3pFLE1BQU0sQ0FBQ3JKLEdBQUcsS0FBSyxVQUFVLEVBQUU7a0JBQzNDcUosTUFBTSxDQUFDckosR0FBRyxDQUFDOE4sYUFBYSxDQUFDO2dCQUMzQixDQUFDLE1BQU0sSUFBSSxPQUFPekUsTUFBTSxDQUFDOEUsT0FBTyxLQUFLLFVBQVUsRUFBRTtrQkFDL0M5RSxNQUFNLENBQUM4RSxPQUFPLENBQUMsMEJBQTBCLEVBQUVMLGFBQWEsQ0FBQztnQkFDM0Q7Y0FDRixDQUFDLENBQUMsT0FBT00sZ0JBQWdCLEVBQUU7Z0JBQ3pCO2dCQUNBO2NBQUE7WUFFSjtVQUNGLENBQUM7VUFFRCxJQUFJLENBQUN2TixJQUFJLENBQUNVLFFBQVEsQ0FBQ0MsV0FBVyxJQUFJbUwsY0FBYyxFQUFFO1lBQ2hEOUwsSUFBSSxDQUFDVSxRQUFRLENBQUNFLFNBQVMsQ0FBQ2hJLElBQUksQ0FBQztVQUMvQjtVQUVBb0gsSUFBSSxDQUFDNkMsT0FBTyxDQUFDekIsRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNO1lBQy9CcEIsSUFBSSxDQUFDNkMsT0FBTyxDQUFDbEQsT0FBTyxHQUFHLElBQUk7VUFDN0IsQ0FBQyxDQUFDO1VBRUY2SSxNQUFNLENBQUNwSCxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU07WUFDdEIsSUFBSSxDQUFDcEIsSUFBSSxDQUFDVSxRQUFRLENBQUNDLFdBQVcsRUFBRTtjQUM5QlgsSUFBSSxDQUFDVSxRQUFRLENBQUNFLFNBQVMsQ0FBQ2hJLElBQUksQ0FBQztZQUMvQjtVQUNGLENBQUMsQ0FBQyxDQUFDd0ksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ25CK0wsV0FBVyxDQUFDLENBQUM7WUFDYixJQUFJLENBQUNuTixJQUFJLENBQUNVLFFBQVEsQ0FBQ0ksUUFBUSxFQUFFO2NBQzNCZCxJQUFJLENBQUNVLFFBQVEsQ0FBQ3ZCLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCO1lBQ0EsSUFBSSxDQUFDYSxJQUFJLENBQUM2QyxPQUFPLENBQUNsRCxPQUFPLEVBQUU7Y0FDekJLLElBQUksQ0FBQzZDLE9BQU8sQ0FBQ3lLLE9BQU8sQ0FBQyxDQUFDO1lBQ3hCO1VBQ0YsQ0FBQyxDQUFDLENBQUNsTSxFQUFFLENBQUMsT0FBTyxFQUFHb00sR0FBRyxJQUFLO1lBQ3RCTCxXQUFXLENBQUMsQ0FBQztZQUNiTCxrQkFBa0IsQ0FBQ1UsR0FBRyxDQUFDO1VBQ3pCLENBQUMsQ0FBQyxDQUFDcE0sRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNO1lBQ2pCLElBQUksQ0FBQ3BCLElBQUksQ0FBQ1UsUUFBUSxDQUFDSSxRQUFRLEVBQUU7Y0FDM0JkLElBQUksQ0FBQ1UsUUFBUSxDQUFDdkIsR0FBRyxDQUFDLENBQUM7WUFDckI7VUFDRixDQUFDLENBQUMsQ0FBQytLLElBQUksQ0FBQ2xLLElBQUksQ0FBQ1UsUUFBUSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxRQUFROEssWUFBWTtVQUNwQixLQUFLLEtBQUs7WUFDUixJQUFJLENBQUNsUyxNQUFNLDZCQUFBQyxNQUFBLENBQTZCZ1MsSUFBSSxDQUFDaE0sSUFBSSxRQUFBaEcsTUFBQSxDQUFLb0wsT0FBTyxzQ0FBbUMsQ0FBQztZQUNqRyxJQUFJbEUsSUFBSSxHQUFHLDBCQUEwQjtZQUVyQyxJQUFJLENBQUNULElBQUksQ0FBQ1UsUUFBUSxDQUFDQyxXQUFXLEVBQUU7Y0FDOUJYLElBQUksQ0FBQ1UsUUFBUSxDQUFDRSxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUMzQixjQUFjLEVBQUUsWUFBWTtnQkFDNUIsZ0JBQWdCLEVBQUVILElBQUksQ0FBQ0k7Y0FDekIsQ0FBQyxDQUFDO1lBQ0o7WUFFQSxJQUFJLENBQUNiLElBQUksQ0FBQ1UsUUFBUSxDQUFDSSxRQUFRLEVBQUU7Y0FDM0JkLElBQUksQ0FBQ1UsUUFBUSxDQUFDdkIsR0FBRyxDQUFDc0IsSUFBSSxDQUFDO1lBQ3pCO1lBQ0E7VUFDRixLQUFLLEtBQUs7WUFDUixJQUFJLENBQUM0SyxJQUFJLENBQUNyTCxJQUFJLENBQUM7WUFDZjtVQUNGLEtBQUssS0FBSztZQUNSLElBQUksQ0FBQzFHLE1BQU0sNkJBQUFDLE1BQUEsQ0FBNkJnUyxJQUFJLENBQUNoTSxJQUFJLFFBQUFoRyxNQUFBLENBQUtvTCxPQUFPLDZDQUEwQyxDQUFDO1lBQ3hHLElBQUksQ0FBQzNFLElBQUksQ0FBQ1UsUUFBUSxDQUFDQyxXQUFXLEVBQUU7Y0FDOUJYLElBQUksQ0FBQ1UsUUFBUSxDQUFDRSxTQUFTLENBQUMsR0FBRyxDQUFDO1lBQzlCO1lBQ0EsSUFBSSxDQUFDWixJQUFJLENBQUNVLFFBQVEsQ0FBQ0ksUUFBUSxFQUFFO2NBQzNCZCxJQUFJLENBQUNVLFFBQVEsQ0FBQ3ZCLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCO1lBQ0E7VUFDRixLQUFLLEtBQUs7WUFDUixJQUFJLENBQUM3RixNQUFNLDZCQUFBQyxNQUFBLENBQTZCZ1MsSUFBSSxDQUFDaE0sSUFBSSxRQUFBaEcsTUFBQSxDQUFLb0wsT0FBTyxhQUFVLENBQUM7WUFDeEUsSUFBSSxDQUFDM0UsSUFBSSxDQUFDVSxRQUFRLENBQUNDLFdBQVcsRUFBRTtjQUM5QlgsSUFBSSxDQUFDVSxRQUFRLENBQUN5QixTQUFTLENBQUMsZUFBZSxXQUFBNUksTUFBQSxDQUFXMlMsUUFBUSxDQUFDRSxLQUFLLE9BQUE3UyxNQUFBLENBQUkyUyxRQUFRLENBQUMvTSxHQUFHLE9BQUE1RixNQUFBLENBQUlnUyxJQUFJLENBQUNyTyxJQUFJLENBQUUsQ0FBQztZQUNsRztZQUNBNlAsT0FBTyxDQUFDakIsY0FBYyxJQUFJcFUsRUFBRSxDQUFDK1YsZ0JBQWdCLENBQUNsQyxJQUFJLENBQUNoTSxJQUFJLEVBQUU7Y0FBQzZNLEtBQUssRUFBRUYsUUFBUSxDQUFDRSxLQUFLO2NBQUVqTixHQUFHLEVBQUUrTSxRQUFRLENBQUMvTTtZQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUMxRztVQUNGO1lBQ0UsSUFBSSxDQUFDYSxJQUFJLENBQUNVLFFBQVEsQ0FBQ0MsV0FBVyxFQUFFO2NBQzlCWCxJQUFJLENBQUNVLFFBQVEsQ0FBQ3lCLFNBQVMsQ0FBQyxnQkFBZ0IsS0FBQTVJLE1BQUEsQ0FBS2dTLElBQUksQ0FBQ3JPLElBQUksQ0FBRSxDQUFDO1lBQzNEO1lBQ0EsSUFBSSxDQUFDNUQsTUFBTSw2QkFBQUMsTUFBQSxDQUE2QmdTLElBQUksQ0FBQ2hNLElBQUksUUFBQWhHLE1BQUEsQ0FBS29MLE9BQU8sYUFBVSxDQUFDO1lBQ3hFb0ksT0FBTyxDQUFDakIsY0FBYyxJQUFJcFUsRUFBRSxDQUFDK1YsZ0JBQWdCLENBQUNsQyxJQUFJLENBQUNoTSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDOUQ7UUFDRjtNQUNGO0lBQ0Y7SUFBQ21PLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUE1UixJQUFBO0VBQUE4UixLQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7SUM3OUREdFgsTUFBTSxDQUFDQyxNQUFNLENBQUM7TUFBQ2MsT0FBTyxFQUFDQSxDQUFBLEtBQUlDO0lBQW1CLENBQUMsQ0FBQztJQUFDLElBQUl1VyxZQUFZO0lBQUN2WCxNQUFNLENBQUNLLElBQUksQ0FBQyxlQUFlLEVBQUM7TUFBQ2tYLFlBQVlBLENBQUNqWCxDQUFDLEVBQUM7UUFBQ2lYLFlBQVksR0FBQ2pYLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJTSxLQUFLLEVBQUNDLEtBQUs7SUFBQ2IsTUFBTSxDQUFDSyxJQUFJLENBQUMsY0FBYyxFQUFDO01BQUNPLEtBQUtBLENBQUNOLENBQUMsRUFBQztRQUFDTSxLQUFLLEdBQUNOLENBQUM7TUFBQSxDQUFDO01BQUNPLEtBQUtBLENBQUNQLENBQUMsRUFBQztRQUFDTyxLQUFLLEdBQUNQLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJa1gsWUFBWSxFQUFDclgsT0FBTztJQUFDSCxNQUFNLENBQUNLLElBQUksQ0FBQyxVQUFVLEVBQUM7TUFBQ21YLFlBQVlBLENBQUNsWCxDQUFDLEVBQUM7UUFBQ2tYLFlBQVksR0FBQ2xYLENBQUM7TUFBQSxDQUFDO01BQUNILE9BQU9BLENBQUNHLENBQUMsRUFBQztRQUFDSCxPQUFPLEdBQUNHLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJbVgsV0FBVyxFQUFDQyxVQUFVO0lBQUMxWCxNQUFNLENBQUNLLElBQUksQ0FBQyxhQUFhLEVBQUM7TUFBQ29YLFdBQVdBLENBQUNuWCxDQUFDLEVBQUM7UUFBQ21YLFdBQVcsR0FBQ25YLENBQUM7TUFBQSxDQUFDO01BQUNvWCxVQUFVQSxDQUFDcFgsQ0FBQyxFQUFDO1FBQUNvWCxVQUFVLEdBQUNwWCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSW9CLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBS25lLE1BQU1WLG1CQUFtQixTQUFTdVcsWUFBWSxDQUFDO01BQzVEbFUsV0FBV0EsQ0FBQSxFQUFHO1FBQ1osS0FBSyxDQUFDLENBQUM7TUFDVDtNQTBGQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFTCxNQUFNQSxDQUFBLEVBQUc7UUFDUCxJQUFJLElBQUksQ0FBQ2lCLEtBQUssRUFBRTtVQUNkO1VBQ0EsQ0FBQzBULE9BQU8sQ0FBQ0MsSUFBSSxJQUFJRCxPQUFPLENBQUNFLEdBQUcsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFFNVEsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFQyxTQUFTLENBQUM7UUFDMUU7TUFDRjs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VxSSxZQUFZQSxDQUFDZ0IsUUFBUSxFQUFFO1FBQ3JCLE1BQU1qQixRQUFRLEdBQUdpQixRQUFRLENBQUN6TixJQUFJLElBQUl5TixRQUFRLENBQUNqQixRQUFRO1FBQ25ELElBQUluUCxPQUFPLENBQUN5RixRQUFRLENBQUMwSixRQUFRLENBQUMsSUFBS0EsUUFBUSxDQUFDL0UsTUFBTSxHQUFHLENBQUUsRUFBRTtVQUN2RCxPQUFPLENBQUNnRyxRQUFRLENBQUN6TixJQUFJLElBQUl5TixRQUFRLENBQUNqQixRQUFRLEVBQUVySixPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDQSxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDQSxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztRQUM5RztRQUNBLE9BQU8sRUFBRTtNQUNYOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRXlKLE9BQU9BLENBQUNKLFFBQVEsRUFBRTtRQUNoQixJQUFJQSxRQUFRLENBQUM1RCxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7VUFDMUIsTUFBTThELFNBQVMsR0FBRyxDQUFDRixRQUFRLENBQUNuQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM0RCxHQUFHLENBQUMsQ0FBQyxDQUFDNUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTJKLFdBQVcsQ0FBQyxDQUFDLENBQUM3UixPQUFPLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLENBQUNnSSxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztVQUNwSSxPQUFPO1lBQUUwQixHQUFHLEVBQUVILFNBQVM7WUFBRUEsU0FBUztZQUFFQyxnQkFBZ0IsTUFBQXhNLE1BQUEsQ0FBTXVNLFNBQVM7VUFBRyxDQUFDO1FBQ3pFO1FBQ0EsT0FBTztVQUFFRyxHQUFHLEVBQUUsRUFBRTtVQUFFSCxTQUFTLEVBQUUsRUFBRTtVQUFFQyxnQkFBZ0IsRUFBRTtRQUFHLENBQUM7TUFDekQ7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRVEsZ0JBQWdCQSxDQUFDbkMsSUFBSSxFQUFFO1FBQ3JCQSxJQUFJLENBQUNpSyxPQUFPLEdBQUcsV0FBVyxDQUFDcE0sSUFBSSxDQUFDbUMsSUFBSSxDQUFDaEgsSUFBSSxDQUFDO1FBQzFDZ0gsSUFBSSxDQUFDa0ssT0FBTyxHQUFHLFdBQVcsQ0FBQ3JNLElBQUksQ0FBQ21DLElBQUksQ0FBQ2hILElBQUksQ0FBQztRQUMxQ2dILElBQUksQ0FBQ21LLE9BQU8sR0FBRyxXQUFXLENBQUN0TSxJQUFJLENBQUNtQyxJQUFJLENBQUNoSCxJQUFJLENBQUM7UUFDMUNnSCxJQUFJLENBQUNvSyxNQUFNLEdBQUcsVUFBVSxDQUFDdk0sSUFBSSxDQUFDbUMsSUFBSSxDQUFDaEgsSUFBSSxDQUFDO1FBQ3hDZ0gsSUFBSSxDQUFDcUssTUFBTSxHQUFHLHNCQUFzQixDQUFDeE0sSUFBSSxDQUFDbUMsSUFBSSxDQUFDaEgsSUFBSSxDQUFDO1FBQ3BEZ0gsSUFBSSxDQUFDc0ssS0FBSyxHQUFHLDBCQUEwQixDQUFDek0sSUFBSSxDQUFDbUMsSUFBSSxDQUFDaEgsSUFBSSxDQUFDO01BQ3pEOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRThJLGFBQWFBLENBQUM5QixJQUFJLEVBQUU7UUFDbEIsTUFBTXVLLEVBQUUsR0FBRztVQUNUdlYsSUFBSSxFQUFFZ0wsSUFBSSxDQUFDaEwsSUFBSTtVQUNmME0sU0FBUyxFQUFFMUIsSUFBSSxDQUFDMEIsU0FBUztVQUN6QkcsR0FBRyxFQUFFN0IsSUFBSSxDQUFDMEIsU0FBUztVQUNuQkMsZ0JBQWdCLE1BQUF4TSxNQUFBLENBQU02SyxJQUFJLENBQUMwQixTQUFTLENBQUU7VUFDdEN2RyxJQUFJLEVBQUU2RSxJQUFJLENBQUM3RSxJQUFJO1VBQ2Y4RCxJQUFJLEVBQUVlLElBQUksQ0FBQ2YsSUFBSTtVQUNmakcsSUFBSSxFQUFFZ0gsSUFBSSxDQUFDaEgsSUFBSTtVQUNmMEosSUFBSSxFQUFFMUMsSUFBSSxDQUFDaEgsSUFBSTtVQUNmLFdBQVcsRUFBRWdILElBQUksQ0FBQ2hILElBQUk7VUFDdEJGLElBQUksRUFBRWtILElBQUksQ0FBQ2xILElBQUk7VUFDZmlELE1BQU0sRUFBRWlFLElBQUksQ0FBQ2pFLE1BQU0sSUFBSSxJQUFJO1VBQzNCNkosUUFBUSxFQUFFO1lBQ1JDLFFBQVEsRUFBRTtjQUNSMUssSUFBSSxFQUFFNkUsSUFBSSxDQUFDN0UsSUFBSTtjQUNmckMsSUFBSSxFQUFFa0gsSUFBSSxDQUFDbEgsSUFBSTtjQUNmRSxJQUFJLEVBQUVnSCxJQUFJLENBQUNoSCxJQUFJO2NBQ2YwSSxTQUFTLEVBQUUxQixJQUFJLENBQUMwQjtZQUNsQjtVQUNGLENBQUM7VUFDRDhJLGNBQWMsRUFBRXhLLElBQUksQ0FBQ3dLLGNBQWMsSUFBSSxJQUFJLENBQUNqVSxhQUFhO1VBQ3pEa1UsZUFBZSxFQUFFekssSUFBSSxDQUFDeUssZUFBZSxJQUFJLElBQUksQ0FBQ3hVO1FBQ2hELENBQUM7O1FBRUQ7UUFDQSxJQUFJK0osSUFBSSxDQUFDdEIsTUFBTSxFQUFFO1VBQ2Y2TCxFQUFFLENBQUNoUSxHQUFHLEdBQUd5RixJQUFJLENBQUN0QixNQUFNO1FBQ3RCO1FBRUEsSUFBSSxDQUFDeUQsZ0JBQWdCLENBQUNvSSxFQUFFLENBQUM7UUFDekJBLEVBQUUsQ0FBQ3BFLFlBQVksR0FBR25HLElBQUksQ0FBQ21HLFlBQVksSUFBSSxJQUFJLENBQUMxUSxXQUFXLENBQUNYLE1BQU0sQ0FBQ3FILE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTZELElBQUksRUFBRXVLLEVBQUUsQ0FBQyxDQUFDO1FBQ3BGLE9BQU9BLEVBQUU7TUFDWDs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRSxNQUFNN08sWUFBWUEsQ0FBQSxFQUF5QjtRQUFBLElBQXhCaUYsUUFBUSxHQUFBdkgsU0FBQSxDQUFBcUQsTUFBQSxRQUFBckQsU0FBQSxRQUFBaUksU0FBQSxHQUFBakksU0FBQSxNQUFHLENBQUMsQ0FBQztRQUFBLElBQUVzUixPQUFPLEdBQUF0UixTQUFBLENBQUFxRCxNQUFBLE9BQUFyRCxTQUFBLE1BQUFpSSxTQUFBO1FBQ3ZDLElBQUksQ0FBQ25NLE1BQU0sb0NBQUFDLE1BQUEsQ0FBb0NpSixJQUFJLENBQUNDLFNBQVMsQ0FBQ3NDLFFBQVEsQ0FBQyxRQUFBeEwsTUFBQSxDQUFLaUosSUFBSSxDQUFDQyxTQUFTLENBQUNxTSxPQUFPLENBQUMsT0FBSSxDQUFDO1FBQ3hHNVgsS0FBSyxDQUFDNk4sUUFBUSxFQUFFNU4sS0FBSyxDQUFDaU8sUUFBUSxDQUFDak8sS0FBSyxDQUFDOEcsS0FBSyxDQUFDL0UsTUFBTSxFQUFFbUQsTUFBTSxFQUFFeUIsT0FBTyxFQUFFQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuRjdHLEtBQUssQ0FBQzRYLE9BQU8sRUFBRTNYLEtBQUssQ0FBQ2lPLFFBQVEsQ0FBQ2xNLE1BQU0sQ0FBQyxDQUFDO1FBRXRDLE1BQU02RixHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUN0RyxVQUFVLENBQUNxSCxZQUFZLENBQUNpRixRQUFRLEVBQUUrSixPQUFPLENBQUM7UUFDakUsSUFBSS9QLEdBQUcsRUFBRTtVQUNQLE9BQU8sSUFBSWlQLFVBQVUsQ0FBQ2pQLEdBQUcsRUFBRSxJQUFJLENBQUM7UUFDbEM7UUFDQSxPQUFPQSxHQUFHO01BQ1o7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VOLElBQUlBLENBQUEsRUFBeUI7UUFBQSxJQUF4QnNHLFFBQVEsR0FBQXZILFNBQUEsQ0FBQXFELE1BQUEsUUFBQXJELFNBQUEsUUFBQWlJLFNBQUEsR0FBQWpJLFNBQUEsTUFBRyxDQUFDLENBQUM7UUFBQSxJQUFFc1IsT0FBTyxHQUFBdFIsU0FBQSxDQUFBcUQsTUFBQSxPQUFBckQsU0FBQSxNQUFBaUksU0FBQTtRQUN6QixJQUFJLENBQUNuTSxNQUFNLDRCQUFBQyxNQUFBLENBQTRCaUosSUFBSSxDQUFDQyxTQUFTLENBQUNzQyxRQUFRLENBQUMsUUFBQXhMLE1BQUEsQ0FBS2lKLElBQUksQ0FBQ0MsU0FBUyxDQUFDcU0sT0FBTyxDQUFDLE9BQUksQ0FBQztRQUNoRzVYLEtBQUssQ0FBQzZOLFFBQVEsRUFBRTVOLEtBQUssQ0FBQ2lPLFFBQVEsQ0FBQ2pPLEtBQUssQ0FBQzhHLEtBQUssQ0FBQy9FLE1BQU0sRUFBRW1ELE1BQU0sRUFBRXlCLE9BQU8sRUFBRUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkY3RyxLQUFLLENBQUM0WCxPQUFPLEVBQUUzWCxLQUFLLENBQUNpTyxRQUFRLENBQUNsTSxNQUFNLENBQUMsQ0FBQztRQUV0QyxPQUFPLElBQUk2VSxXQUFXLENBQUNoSixRQUFRLEVBQUUrSixPQUFPLEVBQUUsSUFBSSxDQUFDO01BQ2pEOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRSxNQUFNdEksV0FBV0EsQ0FBQSxFQUFHO1FBQ2xCLE1BQU0sSUFBSSxDQUFDL04sVUFBVSxDQUFDK04sV0FBVyxDQUFDakosS0FBSyxDQUFDLElBQUksQ0FBQzlFLFVBQVUsRUFBRStFLFNBQVMsQ0FBQztRQUNuRSxPQUFPLElBQUksQ0FBQy9FLFVBQVU7TUFDeEI7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRTlCLElBQUlBLENBQUNtRyxPQUFPLEVBQWlDO1FBQUEsSUFBL0I2SCxPQUFPLEdBQUFuSCxTQUFBLENBQUFxRCxNQUFBLFFBQUFyRCxTQUFBLFFBQUFpSSxTQUFBLEdBQUFqSSxTQUFBLE1BQUcsVUFBVTtRQUFBLElBQUV1UixPQUFPLEdBQUF2UixTQUFBLENBQUFxRCxNQUFBLE9BQUFyRCxTQUFBLE1BQUFpSSxTQUFBO1FBQ3pDLElBQUksQ0FBQ25NLE1BQU0sNEJBQUFDLE1BQUEsQ0FBNkI5QyxPQUFPLENBQUNrRyxRQUFRLENBQUNHLE9BQU8sQ0FBQyxHQUFHQSxPQUFPLENBQUM2QixHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQUFwRixNQUFBLENBQU1vTCxPQUFPLE9BQUksQ0FBQztRQUMxR3pOLEtBQUssQ0FBQzRGLE9BQU8sRUFBRTVELE1BQU0sQ0FBQztRQUV0QixJQUFJLENBQUM0RCxPQUFPLEVBQUU7VUFDWixPQUFPLEVBQUU7UUFDWDtRQUNBLE9BQU9nUixZQUFZLENBQUNoUixPQUFPLEVBQUU2SCxPQUFPLEVBQUVvSyxPQUFPLENBQUM7TUFDaEQ7SUFDRjtJQTVRcUJ6WCxtQkFBbUIsQ0FLL0IwWCxTQUFTLEdBQUd2WSxPQUFPO0lBTFBhLG1CQUFtQixDQU8vQnNFLE1BQU0sR0FBRztNQUNkK0MsR0FBRyxFQUFFO1FBQ0h2QixJQUFJLEVBQUVmO01BQ1IsQ0FBQztNQUNEYSxJQUFJLEVBQUU7UUFDSkUsSUFBSSxFQUFFVztNQUNSLENBQUM7TUFDRDNFLElBQUksRUFBRTtRQUNKZ0UsSUFBSSxFQUFFZjtNQUNSLENBQUM7TUFDRGUsSUFBSSxFQUFFO1FBQ0pBLElBQUksRUFBRWY7TUFDUixDQUFDO01BQ0RrRCxJQUFJLEVBQUU7UUFDSm5DLElBQUksRUFBRWY7TUFDUixDQUFDO01BQ0RnUyxPQUFPLEVBQUU7UUFDUGpSLElBQUksRUFBRVU7TUFDUixDQUFDO01BQ0R3USxPQUFPLEVBQUU7UUFDUGxSLElBQUksRUFBRVU7TUFDUixDQUFDO01BQ0R5USxPQUFPLEVBQUU7UUFDUG5SLElBQUksRUFBRVU7TUFDUixDQUFDO01BQ0QwUSxNQUFNLEVBQUU7UUFDTnBSLElBQUksRUFBRVU7TUFDUixDQUFDO01BQ0QyUSxNQUFNLEVBQUU7UUFDTnJSLElBQUksRUFBRVU7TUFDUixDQUFDO01BQ0Q0USxLQUFLLEVBQUU7UUFDTHRSLElBQUksRUFBRVU7TUFDUixDQUFDO01BQ0RnSSxTQUFTLEVBQUU7UUFDVDFJLElBQUksRUFBRWYsTUFBTTtRQUNaNFMsUUFBUSxFQUFFO01BQ1osQ0FBQztNQUNEaEosR0FBRyxFQUFFO1FBQ0g3SSxJQUFJLEVBQUVmLE1BQU07UUFDWjRTLFFBQVEsRUFBRTtNQUNaLENBQUM7TUFDRGxKLGdCQUFnQixFQUFFO1FBQ2hCM0ksSUFBSSxFQUFFZixNQUFNO1FBQ1o0UyxRQUFRLEVBQUU7TUFDWixDQUFDO01BQ0RuSSxJQUFJLEVBQUU7UUFDSjFKLElBQUksRUFBRWYsTUFBTTtRQUNaNFMsUUFBUSxFQUFFO01BQ1osQ0FBQztNQUNELFdBQVcsRUFBRTtRQUNYN1IsSUFBSSxFQUFFZixNQUFNO1FBQ1o0UyxRQUFRLEVBQUU7TUFDWixDQUFDO01BQ0QxRSxZQUFZLEVBQUU7UUFDWm5OLElBQUksRUFBRWY7TUFDUixDQUFDO01BQ0R1UyxjQUFjLEVBQUU7UUFDZHhSLElBQUksRUFBRWY7TUFDUixDQUFDO01BQ0R3UyxlQUFlLEVBQUU7UUFDZnpSLElBQUksRUFBRWY7TUFDUixDQUFDO01BQ0RaLE1BQU0sRUFBRTtRQUNOMkIsSUFBSSxFQUFFVSxPQUFPO1FBQ2JtUixRQUFRLEVBQUU7TUFDWixDQUFDO01BQ0Q1TCxJQUFJLEVBQUU7UUFDSmpHLElBQUksRUFBRWxFLE1BQU07UUFDWmdXLFFBQVEsRUFBRSxJQUFJO1FBQ2RELFFBQVEsRUFBRTtNQUNaLENBQUM7TUFDRDlPLE1BQU0sRUFBRTtRQUNOL0MsSUFBSSxFQUFFZixNQUFNO1FBQ1o0UyxRQUFRLEVBQUU7TUFDWixDQUFDO01BQ0RFLFNBQVMsRUFBRTtRQUNUL1IsSUFBSSxFQUFFd0csSUFBSTtRQUNWcUwsUUFBUSxFQUFFO01BQ1osQ0FBQztNQUNEakYsUUFBUSxFQUFFO1FBQ1I1TSxJQUFJLEVBQUVsRSxNQUFNO1FBQ1pnVyxRQUFRLEVBQUU7TUFDWjtJQUNGLENBQUM7SUFBQXhCLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUE1UixJQUFBO0VBQUE4UixLQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7SUNoR0h0WCxNQUFNLENBQUNDLE1BQU0sQ0FBQztNQUFDeVgsVUFBVSxFQUFDQSxDQUFBLEtBQUlBLFVBQVU7TUFBQ0QsV0FBVyxFQUFDQSxDQUFBLEtBQUlBO0lBQVcsQ0FBQyxDQUFDO0lBQUMsSUFBSWhYLE1BQU07SUFBQ1QsTUFBTSxDQUFDSyxJQUFJLENBQUMsZUFBZSxFQUFDO01BQUNJLE1BQU1BLENBQUNILENBQUMsRUFBQztRQUFDRyxNQUFNLEdBQUNILENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJb0Isb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTUEsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFVNUwsTUFBTWdXLFVBQVUsQ0FBQztNQUN0QnJVLFdBQVdBLENBQUN5VixRQUFRLEVBQUU5VyxXQUFXLEVBQUU7UUFDakMsSUFBSSxDQUFDOFcsUUFBUSxHQUFHQSxRQUFRO1FBQ3hCLElBQUksQ0FBQzlXLFdBQVcsR0FBR0EsV0FBVztRQUM5QlksTUFBTSxDQUFDcUgsTUFBTSxDQUFDLElBQUksRUFBRTZPLFFBQVEsQ0FBQztNQUMvQjs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UsTUFBTXBRLFdBQVdBLENBQUEsRUFBRztRQUNsQixJQUFJLENBQUMxRyxXQUFXLENBQUNnQixNQUFNLENBQUMsZ0RBQWdELENBQUM7UUFDekUsSUFBSSxJQUFJLENBQUM4VixRQUFRLEVBQUU7VUFDakIsTUFBTSxJQUFJLENBQUM5VyxXQUFXLENBQUMwRyxXQUFXLENBQUMsSUFBSSxDQUFDb1EsUUFBUSxDQUFDelEsR0FBRyxDQUFDO1FBQ3ZELENBQUMsTUFBTTtVQUNMLE1BQU0sSUFBSTVILE1BQU0sQ0FBQ3VGLEtBQUssQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDO1FBQzdDO1FBQ0EsT0FBTyxJQUFJO01BQ2I7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UzRixJQUFJQSxDQUFBLEVBQWdDO1FBQUEsSUFBL0JnTyxPQUFPLEdBQUFuSCxTQUFBLENBQUFxRCxNQUFBLFFBQUFyRCxTQUFBLFFBQUFpSSxTQUFBLEdBQUFqSSxTQUFBLE1BQUcsVUFBVTtRQUFBLElBQUV1UixPQUFPLEdBQUF2UixTQUFBLENBQUFxRCxNQUFBLE9BQUFyRCxTQUFBLE1BQUFpSSxTQUFBO1FBQ2hDLElBQUksQ0FBQ25OLFdBQVcsQ0FBQ2dCLE1BQU0seUNBQUFDLE1BQUEsQ0FBeUNvTCxPQUFPLE9BQUksQ0FBQztRQUM1RSxJQUFJLElBQUksQ0FBQ3lLLFFBQVEsRUFBRTtVQUNqQixPQUFPLElBQUksQ0FBQzlXLFdBQVcsQ0FBQzNCLElBQUksQ0FBQyxJQUFJLENBQUN5WSxRQUFRLEVBQUV6SyxPQUFPLEVBQUVvSyxPQUFPLENBQUM7UUFDL0Q7UUFDQSxPQUFPLEVBQUU7TUFDWDs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UxSCxHQUFHQSxDQUFDZ0ksUUFBUSxFQUFFO1FBQ1osSUFBSSxDQUFDL1csV0FBVyxDQUFDZ0IsTUFBTSx3Q0FBQUMsTUFBQSxDQUF3QzhWLFFBQVEsT0FBSSxDQUFDO1FBQzVFLElBQUlBLFFBQVEsRUFBRTtVQUNaLE9BQU8sSUFBSSxDQUFDRCxRQUFRLENBQUNDLFFBQVEsQ0FBQztRQUNoQztRQUNBLE9BQU8sSUFBSSxDQUFDRCxRQUFRO01BQ3RCOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0V2WSxLQUFLQSxDQUFBLEVBQUc7UUFDTixJQUFJLENBQUN5QixXQUFXLENBQUNnQixNQUFNLENBQUMsMENBQTBDLENBQUM7UUFDbkUsT0FBTyxDQUFDLElBQUksQ0FBQzhWLFFBQVEsQ0FBQztNQUN4Qjs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFRSxJQUFJQSxDQUFBLEVBQUc7UUFDTCxJQUFJLENBQUNoWCxXQUFXLENBQUNnQixNQUFNLENBQUMseUNBQXlDLENBQUM7UUFDbEUsT0FBT0osTUFBTSxDQUFDcUgsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUNqSSxXQUFXLENBQUNHLFVBQVUsQ0FBQzhXLE9BQU8sQ0FBQyxJQUFJLENBQUNILFFBQVEsQ0FBQ3pRLEdBQUcsQ0FBQyxDQUFDO01BQ3BGO0lBQ0Y7SUFXTyxNQUFNb1AsV0FBVyxDQUFDO01BQ3ZCcFUsV0FBV0EsQ0FBQSxFQUF1QztRQUFBLElBQXRDNlYsU0FBUyxHQUFBaFMsU0FBQSxDQUFBcUQsTUFBQSxRQUFBckQsU0FBQSxRQUFBaUksU0FBQSxHQUFBakksU0FBQSxNQUFHLENBQUMsQ0FBQztRQUFBLElBQUVzUixPQUFPLEdBQUF0UixTQUFBLENBQUFxRCxNQUFBLE9BQUFyRCxTQUFBLE1BQUFpSSxTQUFBO1FBQUEsSUFBRW5OLFdBQVcsR0FBQWtGLFNBQUEsQ0FBQXFELE1BQUEsT0FBQXJELFNBQUEsTUFBQWlJLFNBQUE7UUFDOUMsSUFBSSxDQUFDbk4sV0FBVyxHQUFHQSxXQUFXO1FBQzlCLElBQUksQ0FBQ2tYLFNBQVMsR0FBR0EsU0FBUztRQUMxQixJQUFJLENBQUNDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDdkssTUFBTSxHQUFHLElBQUksQ0FBQzVNLFdBQVcsQ0FBQ0csVUFBVSxDQUFDZ0csSUFBSSxDQUFDLElBQUksQ0FBQytRLFNBQVMsRUFBRVYsT0FBTyxDQUFDO01BQ3pFOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UsTUFBTXpILEdBQUdBLENBQUEsRUFBRztRQUNWLElBQUksQ0FBQy9PLFdBQVcsQ0FBQ2dCLE1BQU0sQ0FBQyw4Q0FBOEMsQ0FBQztRQUN2RSxPQUFPLElBQUksQ0FBQzRMLE1BQU0sQ0FBQ3lGLFVBQVUsQ0FBQyxDQUFDO01BQ2pDOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UsTUFBTStFLE9BQU9BLENBQUEsRUFBRztRQUNkLElBQUksQ0FBQ3BYLFdBQVcsQ0FBQ2dCLE1BQU0sQ0FBQyxrREFBa0QsQ0FBQztRQUMzRSxPQUFPLElBQUksQ0FBQ21XLFFBQVEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDdkssTUFBTSxDQUFDOUYsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDO01BQzdEOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UsTUFBTTBDLElBQUlBLENBQUEsRUFBRztRQUNYLElBQUksQ0FBQ3hKLFdBQVcsQ0FBQ2dCLE1BQU0sQ0FBQywrQ0FBK0MsQ0FBQztRQUN4RSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUM0TCxNQUFNLENBQUN5RixVQUFVLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDOEUsUUFBUSxDQUFDO01BQzFEOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VFLFdBQVdBLENBQUEsRUFBRztRQUNaLElBQUksQ0FBQ3JYLFdBQVcsQ0FBQ2dCLE1BQU0sQ0FBQyxpREFBaUQsQ0FBQztRQUMxRSxPQUFPLElBQUksQ0FBQ21XLFFBQVEsS0FBSyxDQUFDLENBQUM7TUFDN0I7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRSxNQUFNRyxRQUFRQSxDQUFBLEVBQUc7UUFDZixJQUFJLENBQUN0WCxXQUFXLENBQUNnQixNQUFNLENBQUMsbURBQW1ELENBQUM7UUFDNUUsT0FBUSxJQUFJLENBQUM0TCxNQUFNLENBQUN5RixVQUFVLENBQUMsQ0FBQyxDQUFFLEVBQUUsSUFBSSxDQUFDOEUsUUFBUSxDQUFDO01BQ3BEOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UsTUFBTTlFLFVBQVVBLENBQUEsRUFBRztRQUNqQixJQUFJLENBQUNyUyxXQUFXLENBQUNnQixNQUFNLENBQUMsZ0RBQWdELENBQUM7UUFDekUsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDNEwsTUFBTSxDQUFDeUYsVUFBVSxDQUFDLENBQUMsS0FBSyxFQUFFO01BQy9DOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UsTUFBTWtGLEtBQUtBLENBQUEsRUFBRztRQUNaLElBQUksQ0FBQ3ZYLFdBQVcsQ0FBQ2dCLE1BQU0sQ0FBQyxnREFBZ0QsQ0FBQztRQUN6RSxJQUFJLENBQUNtVyxRQUFRLEdBQUcsQ0FBQztRQUNqQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUM5RSxVQUFVLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQzhFLFFBQVEsQ0FBQztNQUNqRDs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFLE1BQU1LLElBQUlBLENBQUEsRUFBRztRQUNYLElBQUksQ0FBQ3hYLFdBQVcsQ0FBQ2dCLE1BQU0sQ0FBQywwQ0FBMEMsQ0FBQztRQUNuRSxJQUFJLENBQUNtVyxRQUFRLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQ3JRLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUM3QyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUN1TCxVQUFVLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQzhFLFFBQVEsQ0FBQztNQUNqRDs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFLE1BQU1yUSxVQUFVQSxDQUFBLEVBQUc7UUFDakIsSUFBSSxDQUFDOUcsV0FBVyxDQUFDZ0IsTUFBTSxDQUFDLGdEQUFnRCxDQUFDO1FBQ3pFLE9BQU8sSUFBSSxDQUFDNEwsTUFBTSxDQUFDOUYsVUFBVSxDQUFDLENBQUM7TUFDakM7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRSxNQUFNSixXQUFXQSxDQUFBLEVBQUc7UUFDbEIsSUFBSSxDQUFDMUcsV0FBVyxDQUFDZ0IsTUFBTSxDQUFDLGlEQUFpRCxDQUFDO1FBQzFFLE1BQU0sSUFBSSxDQUFDaEIsV0FBVyxDQUFDMEcsV0FBVyxDQUFDLElBQUksQ0FBQ3dRLFNBQVMsQ0FBQztRQUNsRCxPQUFPLElBQUk7TUFDYjs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRSxNQUFNL0UsWUFBWUEsQ0FBQ3RTLFFBQVEsRUFBZ0I7UUFBQSxJQUFkNFgsT0FBTyxHQUFBdlMsU0FBQSxDQUFBcUQsTUFBQSxRQUFBckQsU0FBQSxRQUFBaUksU0FBQSxHQUFBakksU0FBQSxNQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUNsRixXQUFXLENBQUNnQixNQUFNLENBQUMsa0RBQWtELENBQUM7UUFDM0UsTUFBTSxJQUFJLENBQUM0TCxNQUFNLENBQUN1RixZQUFZLENBQUN0UyxRQUFRLEVBQUU0WCxPQUFPLENBQUM7TUFDbkQ7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFLE1BQU1DLElBQUlBLENBQUEsRUFBRztRQUNYLE9BQU8sSUFBSSxDQUFDQyxRQUFRLENBQUV2USxJQUFJLElBQUs7VUFDN0IsT0FBTyxJQUFJc08sVUFBVSxDQUFDdE8sSUFBSSxFQUFFLElBQUksQ0FBQ3BILFdBQVcsQ0FBQztRQUMvQyxDQUFDLENBQUM7TUFDSjs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRSxNQUFNMlgsUUFBUUEsQ0FBQzlYLFFBQVEsRUFBZ0I7UUFBQSxJQUFkNFgsT0FBTyxHQUFBdlMsU0FBQSxDQUFBcUQsTUFBQSxRQUFBckQsU0FBQSxRQUFBaUksU0FBQSxHQUFBakksU0FBQSxNQUFHLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUNsRixXQUFXLENBQUNnQixNQUFNLENBQUMsOENBQThDLENBQUM7UUFDdkUsT0FBTyxJQUFJLENBQUM0TCxNQUFNLENBQUMrSyxRQUFRLENBQUM5WCxRQUFRLEVBQUU0WCxPQUFPLENBQUM7TUFDaEQ7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRSxNQUFNRyxPQUFPQSxDQUFBLEVBQUc7UUFDZCxJQUFJLENBQUM1WCxXQUFXLENBQUNnQixNQUFNLENBQUMsa0RBQWtELENBQUM7UUFDM0UsSUFBSSxJQUFJLENBQUNtVyxRQUFRLEdBQUcsQ0FBQyxFQUFFO1VBQ3JCLElBQUksQ0FBQ0EsUUFBUSxHQUFHLENBQUM7UUFDbkI7UUFDQSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUM5RSxVQUFVLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQzhFLFFBQVEsQ0FBQztNQUNqRDs7TUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRSxNQUFNNVEsT0FBT0EsQ0FBQ3NSLFNBQVMsRUFBRTtRQUN2QixJQUFJLENBQUM3WCxXQUFXLENBQUNnQixNQUFNLENBQUMsNkNBQTZDLENBQUM7UUFDdEUsT0FBTyxJQUFJLENBQUM0TCxNQUFNLENBQUNyRyxPQUFPLENBQUNzUixTQUFTLENBQUM7TUFDdkM7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VDLGNBQWNBLENBQUNELFNBQVMsRUFBRTtRQUN4QixJQUFJLENBQUM3WCxXQUFXLENBQUNnQixNQUFNLENBQUMsb0RBQW9ELENBQUM7UUFDN0UsT0FBTyxJQUFJLENBQUM0TCxNQUFNLENBQUNrTCxjQUFjLENBQUNELFNBQVMsQ0FBQztNQUM5QztJQUNGO0lBQUN6QyxzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBNVIsSUFBQTtFQUFBOFIsS0FBQTtBQUFBLEc7Ozs7Ozs7Ozs7Ozs7O0lDN1REdFgsTUFBTSxDQUFDQyxNQUFNLENBQUM7TUFBQ2dCLFlBQVksRUFBQ0EsQ0FBQSxLQUFJQSxZQUFZO01BQUNDLGdCQUFnQixFQUFDQSxDQUFBLEtBQUlBLGdCQUFnQjtNQUFDc1csWUFBWSxFQUFDQSxDQUFBLEtBQUlBLFlBQVk7TUFBQ3JYLE9BQU8sRUFBQ0EsQ0FBQSxLQUFJQTtJQUFPLENBQUMsQ0FBQztJQUFDLElBQUlTLEtBQUs7SUFBQ1osTUFBTSxDQUFDSyxJQUFJLENBQUMsY0FBYyxFQUFDO01BQUNPLEtBQUtBLENBQUNOLENBQUMsRUFBQztRQUFDTSxLQUFLLEdBQUNOLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJb0Isb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTUEsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFL1AsTUFBTXZCLE9BQU8sR0FBRztNQUNka0YsUUFBUUEsQ0FBQSxFQUF3QztRQUFBLElBQXZDMFUsR0FBRyxHQUFBN1MsU0FBQSxDQUFBcUQsTUFBQSxRQUFBckQsU0FBQSxRQUFBaUksU0FBQSxHQUFBakksU0FBQSxNQUFHLEVBQUU7UUFBQSxJQUFFOFMsR0FBRyxHQUFBOVMsU0FBQSxDQUFBcUQsTUFBQSxRQUFBckQsU0FBQSxRQUFBaUksU0FBQSxHQUFBakksU0FBQSxNQUFHLEVBQUU7UUFBQSxJQUFFK1MsV0FBVyxHQUFBL1MsU0FBQSxDQUFBcUQsTUFBQSxRQUFBckQsU0FBQSxRQUFBaUksU0FBQSxHQUFBakksU0FBQSxNQUFHLEdBQUc7UUFDNUMsT0FBTzZTLEdBQUcsQ0FBQzlULE9BQU8sQ0FBQyxvQkFBb0IsRUFBRWdVLFdBQVcsQ0FBQyxDQUFDaE0sU0FBUyxDQUFDLENBQUMsRUFBRStMLEdBQUcsQ0FBQztNQUN6RSxDQUFDO01BQ0RFLFdBQVdBLENBQUNDLEdBQUcsRUFBRTtRQUNmLE9BQU9BLEdBQUcsS0FBSyxLQUFLLENBQUM7TUFDdkIsQ0FBQztNQUNEOVQsUUFBUUEsQ0FBQzhULEdBQUcsRUFBRTtRQUNaLElBQUksSUFBSSxDQUFDQyxPQUFPLENBQUNELEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQ2pVLFVBQVUsQ0FBQ2lVLEdBQUcsQ0FBQyxFQUFFO1VBQzdDLE9BQU8sS0FBSztRQUNkO1FBQ0EsT0FBT0EsR0FBRyxLQUFLdlgsTUFBTSxDQUFDdVgsR0FBRyxDQUFDO01BQzVCLENBQUM7TUFDREMsT0FBT0EsQ0FBQ0QsR0FBRyxFQUFFO1FBQ1gsT0FBT0UsS0FBSyxDQUFDRCxPQUFPLENBQUNELEdBQUcsQ0FBQztNQUMzQixDQUFDO01BQ0QxVSxTQUFTQSxDQUFDMFUsR0FBRyxFQUFFO1FBQ2IsT0FBT0EsR0FBRyxLQUFLLElBQUksSUFBSUEsR0FBRyxLQUFLLEtBQUssSUFBSXZYLE1BQU0sQ0FBQzBYLFNBQVMsQ0FBQ3JPLFFBQVEsQ0FBQ2pDLElBQUksQ0FBQ21RLEdBQUcsQ0FBQyxLQUFLLGtCQUFrQjtNQUNwRyxDQUFDO01BQ0RqVSxVQUFVQSxDQUFDaVUsR0FBRyxFQUFFO1FBQ2QsT0FBTyxPQUFPQSxHQUFHLEtBQUssVUFBVSxJQUFJLEtBQUs7TUFDM0MsQ0FBQztNQUNESSxNQUFNQSxDQUFDQyxJQUFJLEVBQUU7UUFDWCxPQUFPLENBQUMvUyxNQUFNLENBQUM2TyxLQUFLLENBQUMsSUFBSWhKLElBQUksQ0FBQ2tOLElBQUksQ0FBQyxDQUFDQyxPQUFPLENBQUMsQ0FBQyxDQUFDO01BQ2hELENBQUM7TUFDREMsT0FBT0EsQ0FBQ1AsR0FBRyxFQUFFO1FBQ1gsSUFBSSxJQUFJLENBQUNJLE1BQU0sQ0FBQ0osR0FBRyxDQUFDLEVBQUU7VUFDcEIsT0FBTyxLQUFLO1FBQ2Q7UUFDQSxJQUFJLElBQUksQ0FBQzlULFFBQVEsQ0FBQzhULEdBQUcsQ0FBQyxFQUFFO1VBQ3RCLE9BQU8sQ0FBQ3ZYLE1BQU0sQ0FBQ1gsSUFBSSxDQUFDa1ksR0FBRyxDQUFDLENBQUM1UCxNQUFNO1FBQ2pDO1FBQ0EsSUFBSSxJQUFJLENBQUM2UCxPQUFPLENBQUNELEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQ3ZVLFFBQVEsQ0FBQ3VVLEdBQUcsQ0FBQyxFQUFFO1VBQzNDLE9BQU8sQ0FBQ0EsR0FBRyxDQUFDNVAsTUFBTTtRQUNwQjtRQUNBLE9BQU8sS0FBSztNQUNkLENBQUM7TUFDRDZDLEtBQUtBLENBQUMrTSxHQUFHLEVBQUU7UUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDOVQsUUFBUSxDQUFDOFQsR0FBRyxDQUFDLEVBQUUsT0FBT0EsR0FBRztRQUNuQyxPQUFPLElBQUksQ0FBQ0MsT0FBTyxDQUFDRCxHQUFHLENBQUMsR0FBR0EsR0FBRyxDQUFDUSxLQUFLLENBQUMsQ0FBQyxHQUFHL1gsTUFBTSxDQUFDcUgsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFa1EsR0FBRyxDQUFDO01BQ2pFLENBQUM7TUFDRHJKLEdBQUdBLENBQUM4SixJQUFJLEVBQUUzUixJQUFJLEVBQUU7UUFDZCxJQUFJa1IsR0FBRyxHQUFHUyxJQUFJO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQ3ZVLFFBQVEsQ0FBQzhULEdBQUcsQ0FBQyxFQUFFO1VBQ3ZCLE9BQU8sS0FBSztRQUNkO1FBQ0EsSUFBSSxDQUFDLElBQUksQ0FBQ0MsT0FBTyxDQUFDblIsSUFBSSxDQUFDLEVBQUU7VUFDdkIsT0FBTyxJQUFJLENBQUM1QyxRQUFRLENBQUM4VCxHQUFHLENBQUMsSUFBSXZYLE1BQU0sQ0FBQzBYLFNBQVMsQ0FBQ08sY0FBYyxDQUFDN1EsSUFBSSxDQUFDbVEsR0FBRyxFQUFFbFIsSUFBSSxDQUFDO1FBQzlFO1FBRUEsTUFBTXNCLE1BQU0sR0FBR3RCLElBQUksQ0FBQ3NCLE1BQU07UUFDMUIsS0FBSyxJQUFJdVEsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHdlEsTUFBTSxFQUFFdVEsQ0FBQyxFQUFFLEVBQUU7VUFDL0IsSUFBSSxDQUFDbFksTUFBTSxDQUFDMFgsU0FBUyxDQUFDTyxjQUFjLENBQUM3USxJQUFJLENBQUNtUSxHQUFHLEVBQUVsUixJQUFJLENBQUM2UixDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3ZELE9BQU8sS0FBSztVQUNkO1VBQ0FYLEdBQUcsR0FBR0EsR0FBRyxDQUFDbFIsSUFBSSxDQUFDNlIsQ0FBQyxDQUFDLENBQUM7UUFDcEI7UUFDQSxPQUFPLENBQUMsQ0FBQ3ZRLE1BQU07TUFDakIsQ0FBQztNQUNEa0QsSUFBSUEsQ0FBQzBNLEdBQUcsRUFBVztRQUNqQixNQUFNWSxLQUFLLEdBQUduWSxNQUFNLENBQUNxSCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVrUSxHQUFHLENBQUM7UUFBQyxTQUFBYSxJQUFBLEdBQUE5VCxTQUFBLENBQUFxRCxNQUFBLEVBRDFCdEksSUFBSSxPQUFBb1ksS0FBQSxDQUFBVyxJQUFBLE9BQUFBLElBQUEsV0FBQUMsSUFBQSxNQUFBQSxJQUFBLEdBQUFELElBQUEsRUFBQUMsSUFBQTtVQUFKaFosSUFBSSxDQUFBZ1osSUFBQSxRQUFBL1QsU0FBQSxDQUFBK1QsSUFBQTtRQUFBO1FBRWYsS0FBSyxJQUFJSCxDQUFDLEdBQUc3WSxJQUFJLENBQUNzSSxNQUFNLEdBQUcsQ0FBQyxFQUFFdVEsQ0FBQyxJQUFJLENBQUMsRUFBRUEsQ0FBQyxFQUFFLEVBQUU7VUFDekMsT0FBT0MsS0FBSyxDQUFDOVksSUFBSSxDQUFDNlksQ0FBQyxDQUFDLENBQUM7UUFDdkI7UUFFQSxPQUFPQyxLQUFLO01BQ2QsQ0FBQztNQUNERyxHQUFHLEVBQUU1TixJQUFJLENBQUM0TixHQUFHO01BQ2JDLFFBQVFBLENBQUNDLElBQUksRUFBRUMsSUFBSSxFQUFnQjtRQUFBLElBQWQ3QyxPQUFPLEdBQUF0UixTQUFBLENBQUFxRCxNQUFBLFFBQUFyRCxTQUFBLFFBQUFpSSxTQUFBLEdBQUFqSSxTQUFBLE1BQUcsQ0FBQyxDQUFDO1FBQy9CLElBQUlvUyxRQUFRLEdBQUcsQ0FBQztRQUNoQixJQUFJMUcsT0FBTyxHQUFHLElBQUk7UUFDbEIsSUFBSWpKLE1BQU07UUFDVixNQUFNMlIsSUFBSSxHQUFHLElBQUk7UUFDakIsSUFBSTlWLElBQUk7UUFDUixJQUFJK1YsSUFBSTtRQUVSLE1BQU1DLEtBQUssR0FBR0EsQ0FBQSxLQUFNO1VBQ2xCbEMsUUFBUSxHQUFHZCxPQUFPLENBQUNpRCxPQUFPLEtBQUssS0FBSyxHQUFHLENBQUMsR0FBR0gsSUFBSSxDQUFDSixHQUFHLENBQUMsQ0FBQztVQUNyRHRJLE9BQU8sR0FBRyxJQUFJO1VBQ2RqSixNQUFNLEdBQUd5UixJQUFJLENBQUNuVSxLQUFLLENBQUN6QixJQUFJLEVBQUUrVixJQUFJLENBQUM7VUFDL0IsSUFBSSxDQUFDM0ksT0FBTyxFQUFFO1lBQ1pwTixJQUFJLEdBQUcrVixJQUFJLEdBQUcsSUFBSTtVQUNwQjtRQUNGLENBQUM7UUFFRCxNQUFNRyxTQUFTLEdBQUcsU0FBQUEsQ0FBQSxFQUFZO1VBQzVCLE1BQU1SLEdBQUcsR0FBR0ksSUFBSSxDQUFDSixHQUFHLENBQUMsQ0FBQztVQUN0QixJQUFJLENBQUM1QixRQUFRLElBQUlkLE9BQU8sQ0FBQ2lELE9BQU8sS0FBSyxLQUFLLEVBQUVuQyxRQUFRLEdBQUc0QixHQUFHO1VBQzFELE1BQU1TLFNBQVMsR0FBR04sSUFBSSxJQUFJSCxHQUFHLEdBQUc1QixRQUFRLENBQUM7VUFDekM5VCxJQUFJLEdBQUcsSUFBSTtVQUNYK1YsSUFBSSxHQUFHclUsU0FBUztVQUNoQixJQUFJeVUsU0FBUyxJQUFJLENBQUMsSUFBSUEsU0FBUyxHQUFHTixJQUFJLEVBQUU7WUFDdEMsSUFBSXpJLE9BQU8sRUFBRTtjQUNYVSxZQUFZLENBQUNWLE9BQU8sQ0FBQztjQUNyQkEsT0FBTyxHQUFHLElBQUk7WUFDaEI7WUFDQTBHLFFBQVEsR0FBRzRCLEdBQUc7WUFDZHZSLE1BQU0sR0FBR3lSLElBQUksQ0FBQ25VLEtBQUssQ0FBQ3pCLElBQUksRUFBRStWLElBQUksQ0FBQztZQUMvQixJQUFJLENBQUMzSSxPQUFPLEVBQUU7Y0FDWnBOLElBQUksR0FBRytWLElBQUksR0FBRyxJQUFJO1lBQ3BCO1VBQ0YsQ0FBQyxNQUFNLElBQUksQ0FBQzNJLE9BQU8sSUFBSTRGLE9BQU8sQ0FBQ29ELFFBQVEsS0FBSyxLQUFLLEVBQUU7WUFDakRoSixPQUFPLEdBQUcvRSxVQUFVLENBQUMyTixLQUFLLEVBQUVHLFNBQVMsQ0FBQztVQUN4QztVQUNBLE9BQU9oUyxNQUFNO1FBQ2YsQ0FBQztRQUVEK1IsU0FBUyxDQUFDRyxNQUFNLEdBQUcsTUFBTTtVQUN2QnZJLFlBQVksQ0FBQ1YsT0FBTyxDQUFDO1VBQ3JCMEcsUUFBUSxHQUFHLENBQUM7VUFDWjFHLE9BQU8sR0FBR3BOLElBQUksR0FBRytWLElBQUksR0FBRyxJQUFJO1FBQzlCLENBQUM7UUFFRCxPQUFPRyxTQUFTO01BQ2xCO0lBQ0YsQ0FBQztJQUVELE1BQU1JLFFBQVEsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDO0lBQzdDLEtBQUssSUFBSWhCLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2dCLFFBQVEsQ0FBQ3ZSLE1BQU0sRUFBRXVRLENBQUMsRUFBRSxFQUFFO01BQ3hDM2EsT0FBTyxDQUFDLElBQUksR0FBRzJiLFFBQVEsQ0FBQ2hCLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVVgsR0FBRyxFQUFFO1FBQzNDLE9BQU92WCxNQUFNLENBQUMwWCxTQUFTLENBQUNyTyxRQUFRLENBQUNqQyxJQUFJLENBQUNtUSxHQUFHLENBQUMsZ0JBQUFsWCxNQUFBLENBQWdCNlksUUFBUSxDQUFDaEIsQ0FBQyxDQUFDLE1BQUc7TUFDMUUsQ0FBQztJQUNIOztJQUVBO0FBQ0E7QUFDQTtJQUNBLE1BQU03WixZQUFZLEdBQUcsU0FBQUEsQ0FBU2taLEdBQUcsRUFBRTtNQUNqQyxLQUFLLElBQUl0WCxHQUFHLElBQUlzWCxHQUFHLEVBQUU7UUFDbkIsSUFBSWhhLE9BQU8sQ0FBQ3lGLFFBQVEsQ0FBQ3VVLEdBQUcsQ0FBQ3RYLEdBQUcsQ0FBQyxDQUFDLElBQUlzWCxHQUFHLENBQUN0WCxHQUFHLENBQUMsQ0FBQzZJLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1VBQ3RFeU8sR0FBRyxDQUFDdFgsR0FBRyxDQUFDLEdBQUdzWCxHQUFHLENBQUN0WCxHQUFHLENBQUMsQ0FBQ29ELE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUM7VUFDbERrVSxHQUFHLENBQUN0WCxHQUFHLENBQUMsR0FBRyxJQUFJeUssSUFBSSxDQUFDbEgsUUFBUSxDQUFDK1QsR0FBRyxDQUFDdFgsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6QyxDQUFDLE1BQU0sSUFBSTFDLE9BQU8sQ0FBQ2tHLFFBQVEsQ0FBQzhULEdBQUcsQ0FBQ3RYLEdBQUcsQ0FBQyxDQUFDLEVBQUU7VUFDckNzWCxHQUFHLENBQUN0WCxHQUFHLENBQUMsR0FBRzVCLFlBQVksQ0FBQ2taLEdBQUcsQ0FBQ3RYLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLENBQUMsTUFBTSxJQUFJMUMsT0FBTyxDQUFDaWEsT0FBTyxDQUFDRCxHQUFHLENBQUN0WCxHQUFHLENBQUMsQ0FBQyxFQUFFO1VBQ3BDLElBQUl2QyxDQUFDO1VBQ0wsS0FBSyxJQUFJd2EsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHWCxHQUFHLENBQUN0WCxHQUFHLENBQUMsQ0FBQzBILE1BQU0sRUFBRXVRLENBQUMsRUFBRSxFQUFFO1lBQ3hDeGEsQ0FBQyxHQUFHNlosR0FBRyxDQUFDdFgsR0FBRyxDQUFDLENBQUNpWSxDQUFDLENBQUM7WUFDZixJQUFJM2EsT0FBTyxDQUFDa0csUUFBUSxDQUFDL0YsQ0FBQyxDQUFDLEVBQUU7Y0FDdkI2WixHQUFHLENBQUN0WCxHQUFHLENBQUMsQ0FBQ2lZLENBQUMsQ0FBQyxHQUFHN1osWUFBWSxDQUFDWCxDQUFDLENBQUM7WUFDL0IsQ0FBQyxNQUFNLElBQUlILE9BQU8sQ0FBQ3lGLFFBQVEsQ0FBQ3RGLENBQUMsQ0FBQyxJQUFJQSxDQUFDLENBQUNvTCxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRTtjQUMvRHBMLENBQUMsR0FBR0EsQ0FBQyxDQUFDMkYsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQztjQUNwQ2tVLEdBQUcsQ0FBQ3RYLEdBQUcsQ0FBQyxDQUFDaVksQ0FBQyxDQUFDLEdBQUcsSUFBSXhOLElBQUksQ0FBQ2xILFFBQVEsQ0FBQzlGLENBQUMsQ0FBQyxDQUFDO1lBQ3JDO1VBQ0Y7UUFDRjtNQUNGO01BQ0EsT0FBTzZaLEdBQUc7SUFDWixDQUFDOztJQUVEO0FBQ0E7QUFDQTtJQUNBLE1BQU1qWixnQkFBZ0IsR0FBRyxTQUFBQSxDQUFTaVosR0FBRyxFQUFFO01BQ3JDLEtBQUssSUFBSXRYLEdBQUcsSUFBSXNYLEdBQUcsRUFBRTtRQUNuQixJQUFJaGEsT0FBTyxDQUFDb2EsTUFBTSxDQUFDSixHQUFHLENBQUN0WCxHQUFHLENBQUMsQ0FBQyxFQUFFO1VBQzVCc1gsR0FBRyxDQUFDdFgsR0FBRyxDQUFDLHFCQUFBSSxNQUFBLENBQXFCLENBQUNrWCxHQUFHLENBQUN0WCxHQUFHLENBQUMsQ0FBRTtRQUMxQyxDQUFDLE1BQU0sSUFBSTFDLE9BQU8sQ0FBQ2tHLFFBQVEsQ0FBQzhULEdBQUcsQ0FBQ3RYLEdBQUcsQ0FBQyxDQUFDLEVBQUU7VUFDckNzWCxHQUFHLENBQUN0WCxHQUFHLENBQUMsR0FBRzNCLGdCQUFnQixDQUFDaVosR0FBRyxDQUFDdFgsR0FBRyxDQUFDLENBQUM7UUFDdkMsQ0FBQyxNQUFNLElBQUkxQyxPQUFPLENBQUNpYSxPQUFPLENBQUNELEdBQUcsQ0FBQ3RYLEdBQUcsQ0FBQyxDQUFDLEVBQUU7VUFDcEMsSUFBSXZDLENBQUM7VUFDTCxLQUFLLElBQUl3YSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdYLEdBQUcsQ0FBQ3RYLEdBQUcsQ0FBQyxDQUFDMEgsTUFBTSxFQUFFdVEsQ0FBQyxFQUFFLEVBQUU7WUFDeEN4YSxDQUFDLEdBQUc2WixHQUFHLENBQUN0WCxHQUFHLENBQUMsQ0FBQ2lZLENBQUMsQ0FBQztZQUNmLElBQUkzYSxPQUFPLENBQUNrRyxRQUFRLENBQUMvRixDQUFDLENBQUMsRUFBRTtjQUN2QjZaLEdBQUcsQ0FBQ3RYLEdBQUcsQ0FBQyxDQUFDaVksQ0FBQyxDQUFDLEdBQUc1WixnQkFBZ0IsQ0FBQ1osQ0FBQyxDQUFDO1lBQ25DLENBQUMsTUFBTSxJQUFJSCxPQUFPLENBQUNvYSxNQUFNLENBQUNqYSxDQUFDLENBQUMsRUFBRTtjQUM1QjZaLEdBQUcsQ0FBQ3RYLEdBQUcsQ0FBQyxDQUFDaVksQ0FBQyxDQUFDLHFCQUFBN1gsTUFBQSxDQUFxQixDQUFDM0MsQ0FBQyxDQUFFO1lBQ3RDO1VBQ0Y7UUFDRjtNQUNGO01BQ0EsT0FBTzZaLEdBQUc7SUFDWixDQUFDOztJQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0E7SUFDQSxNQUFNM0MsWUFBWSxHQUFHLFNBQUFBLENBQUNoUixPQUFPLEVBQWtGO01BQUEsSUFBaEY2SCxPQUFPLEdBQUFuSCxTQUFBLENBQUFxRCxNQUFBLFFBQUFyRCxTQUFBLFFBQUFpSSxTQUFBLEdBQUFqSSxTQUFBLE1BQUcsVUFBVTtNQUFBLElBQUU2VSxRQUFRLEdBQUE3VSxTQUFBLENBQUFxRCxNQUFBLFFBQUFyRCxTQUFBLFFBQUFpSSxTQUFBLEdBQUFqSSxTQUFBLE1BQUcsQ0FBQzhVLHlCQUF5QixJQUFJLENBQUMsQ0FBQyxFQUFFQyxRQUFRO01BQ3hHcmIsS0FBSyxDQUFDNEYsT0FBTyxFQUFFNUQsTUFBTSxDQUFDO01BQ3RCaEMsS0FBSyxDQUFDeU4sT0FBTyxFQUFFdEksTUFBTSxDQUFDO01BQ3RCLElBQUkwUyxPQUFPLEdBQUdzRCxRQUFRO01BRXRCLElBQUksQ0FBQzViLE9BQU8sQ0FBQ3lGLFFBQVEsQ0FBQzZTLE9BQU8sQ0FBQyxFQUFFO1FBQzlCO1FBQ0FBLE9BQU8sR0FBRyxDQUFDdUQseUJBQXlCLElBQUksQ0FBQyxDQUFDLEVBQUVDLFFBQVEsSUFBSSxHQUFHO01BQzdEO01BRUEsTUFBTUMsS0FBSyxHQUFHekQsT0FBTyxDQUFDeFMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7TUFDekMsTUFBTWdQLElBQUksR0FBSXpPLE9BQU8sQ0FBQ2tOLFFBQVEsSUFBSWxOLE9BQU8sQ0FBQ2tOLFFBQVEsQ0FBQ3JGLE9BQU8sQ0FBQyxJQUFLN0gsT0FBTyxJQUFJLENBQUMsQ0FBQztNQUU3RSxJQUFJbUosR0FBRztNQUNQLElBQUl4UCxPQUFPLENBQUN5RixRQUFRLENBQUNxUCxJQUFJLENBQUN6RixTQUFTLENBQUMsRUFBRTtRQUNwQ0csR0FBRyxPQUFBMU0sTUFBQSxDQUFPZ1MsSUFBSSxDQUFDekYsU0FBUyxDQUFDdkosT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBRTtNQUMvQyxDQUFDLE1BQU07UUFDTDBKLEdBQUcsR0FBRyxFQUFFO01BQ1Y7TUFFQSxJQUFJbkosT0FBTyxDQUFDckIsTUFBTSxLQUFLLElBQUksRUFBRTtRQUMzQixPQUFPK1csS0FBSyxJQUFJN04sT0FBTyxLQUFLLFVBQVUsTUFBQXBMLE1BQUEsQ0FBTXVELE9BQU8sQ0FBQzhSLGNBQWMsT0FBQXJWLE1BQUEsQ0FBSXVELE9BQU8sQ0FBQzZCLEdBQUcsRUFBQXBGLE1BQUEsQ0FBRzBNLEdBQUcsT0FBQTFNLE1BQUEsQ0FBUXVELE9BQU8sQ0FBQzhSLGNBQWMsT0FBQXJWLE1BQUEsQ0FBSW9MLE9BQU8sT0FBQXBMLE1BQUEsQ0FBSXVELE9BQU8sQ0FBQzZCLEdBQUcsRUFBQXBGLE1BQUEsQ0FBRzBNLEdBQUcsQ0FBRSxDQUFDO01BQzFKO01BQ0EsVUFBQTFNLE1BQUEsQ0FBVWlaLEtBQUssRUFBQWpaLE1BQUEsQ0FBR3VELE9BQU8sQ0FBQzhSLGNBQWMsT0FBQXJWLE1BQUEsQ0FBSXVELE9BQU8sQ0FBQytSLGVBQWUsT0FBQXRWLE1BQUEsQ0FBSXVELE9BQU8sQ0FBQzZCLEdBQUcsT0FBQXBGLE1BQUEsQ0FBSW9MLE9BQU8sT0FBQXBMLE1BQUEsQ0FBSXVELE9BQU8sQ0FBQzZCLEdBQUcsRUFBQXBGLE1BQUEsQ0FBRzBNLEdBQUc7SUFDcEgsQ0FBQztJQUFDeUgsc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQTVSLElBQUE7RUFBQThSLEtBQUE7QUFBQSxHOzs7Ozs7Ozs7Ozs7OztJQ25ORnRYLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDO01BQUNjLE9BQU8sRUFBQ0EsQ0FBQSxLQUFJRDtJQUFXLENBQUMsQ0FBQztJQUFDLElBQUlNLEVBQUU7SUFBQ3BCLE1BQU0sQ0FBQ0ssSUFBSSxDQUFDLFVBQVUsRUFBQztNQUFDVSxPQUFPQSxDQUFDVCxDQUFDLEVBQUM7UUFBQ2MsRUFBRSxHQUFDZCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSWdCLFFBQVE7SUFBQ3RCLE1BQU0sQ0FBQ0ssSUFBSSxDQUFDLE1BQU0sRUFBQztNQUFDVSxPQUFPQSxDQUFDVCxDQUFDLEVBQUM7UUFBQ2dCLFFBQVEsR0FBQ2hCLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJRyxNQUFNO0lBQUNULE1BQU0sQ0FBQ0ssSUFBSSxDQUFDLGVBQWUsRUFBQztNQUFDSSxNQUFNQSxDQUFDSCxDQUFDLEVBQUM7UUFBQ0csTUFBTSxHQUFDSCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUgsT0FBTztJQUFDSCxNQUFNLENBQUNLLElBQUksQ0FBQyxVQUFVLEVBQUM7TUFBQ0YsT0FBT0EsQ0FBQ0csQ0FBQyxFQUFDO1FBQUNILE9BQU8sR0FBQ0csQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlvQixvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNQSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUluVixNQUFNSSxJQUFJLEdBQUdBLENBQUEsS0FBTSxDQUFDLENBQUM7O0lBRXJCO0FBQ0E7QUFDQTtBQUNBO0lBQ0EsTUFBTUgsS0FBSyxHQUFHbEIsTUFBTSxDQUFDbUIsZUFBZSxDQUFDQyxRQUFRLElBQUlBLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDNUQsTUFBTXNhLE9BQU8sR0FBRyxDQUFDLENBQUM7O0lBRWxCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ2UsTUFBTXJiLFdBQVcsQ0FBQztNQUMvQnVDLFdBQVdBLENBQUM0RixJQUFJLEVBQUVzRSxTQUFTLEVBQUVuRSxJQUFJLEVBQUVuRSxXQUFXLEVBQUU7UUFDOUMsSUFBSSxDQUFDZ0UsSUFBSSxHQUFHQSxJQUFJLENBQUNtVCxJQUFJLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUM3TyxTQUFTLEdBQUdBLFNBQVM7UUFDMUIsSUFBSSxDQUFDbkUsSUFBSSxHQUFHQSxJQUFJO1FBQ2hCLElBQUksQ0FBQ25FLFdBQVcsR0FBR0EsV0FBVztRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDZ0UsSUFBSSxJQUFJLENBQUM5SSxPQUFPLENBQUN5RixRQUFRLENBQUMsSUFBSSxDQUFDcUQsSUFBSSxDQUFDLEVBQUU7VUFDOUM7UUFDRjtRQUVBLElBQUksQ0FBQ29ULEVBQUUsR0FBRyxJQUFJO1FBQ2QsSUFBSSxDQUFDL1MsS0FBSyxHQUFHLEtBQUs7UUFDbEIsSUFBSSxDQUFDRCxPQUFPLEdBQUcsS0FBSztRQUNwQixJQUFJLENBQUNpVCxhQUFhLEdBQUcsQ0FBQztRQUV0QixJQUFJSCxPQUFPLENBQUMsSUFBSSxDQUFDbFQsSUFBSSxDQUFDLElBQUksQ0FBQ2tULE9BQU8sQ0FBQyxJQUFJLENBQUNsVCxJQUFJLENBQUMsQ0FBQ0ssS0FBSyxJQUFJLENBQUM2UyxPQUFPLENBQUMsSUFBSSxDQUFDbFQsSUFBSSxDQUFDLENBQUNJLE9BQU8sRUFBRTtVQUNsRixJQUFJLENBQUNnVCxFQUFFLEdBQUdGLE9BQU8sQ0FBQyxJQUFJLENBQUNsVCxJQUFJLENBQUMsQ0FBQ29ULEVBQUU7VUFDL0IsSUFBSSxDQUFDQyxhQUFhLEdBQUdILE9BQU8sQ0FBQyxJQUFJLENBQUNsVCxJQUFJLENBQUMsQ0FBQ3FULGFBQWE7UUFDdkQsQ0FBQyxNQUFNO1VBQ0xsYixFQUFFLENBQUN1USxJQUFJLENBQUMsSUFBSSxDQUFDMUksSUFBSSxFQUFFLENBQUM0SSxTQUFTLEVBQUVKLEtBQUssS0FBSztZQUN2QzlQLEtBQUssQ0FBQyxNQUFNO2NBQ1YsSUFBSWtRLFNBQVMsSUFBSSxDQUFDSixLQUFLLENBQUNHLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hDLE1BQU1FLEtBQUssR0FBRyxJQUFJLENBQUM3SSxJQUFJLENBQUNrRixLQUFLLENBQUM3TSxRQUFRLENBQUN5RixHQUFHLENBQUM7Z0JBQzNDK0ssS0FBSyxDQUFDQyxHQUFHLENBQUMsQ0FBQztnQkFDWCxJQUFJO2tCQUNGM1EsRUFBRSxDQUFDZ0csU0FBUyxDQUFDMEssS0FBSyxDQUFDNU8sSUFBSSxDQUFDNUIsUUFBUSxDQUFDeUYsR0FBRyxDQUFDLEVBQUU7b0JBQUVPLFNBQVMsRUFBRTtrQkFBSyxDQUFDLENBQUM7Z0JBQzdELENBQUMsQ0FBQyxPQUFPaVYsVUFBVSxFQUFFO2tCQUNuQixNQUFNLElBQUk5YixNQUFNLENBQUN1RixLQUFLLENBQUMsR0FBRyxzR0FBQS9DLE1BQUEsQ0FBcUc2TyxLQUFLLENBQUM1TyxJQUFJLENBQUM1QixRQUFRLENBQUN5RixHQUFHLENBQUMsU0FBS3dWLFVBQVUsQ0FBQztnQkFDeks7Z0JBRUEsSUFBSTtrQkFDRm5iLEVBQUUsQ0FBQzJSLGFBQWEsQ0FBQyxJQUFJLENBQUM5SixJQUFJLEVBQUUsRUFBRSxDQUFDO2dCQUNqQyxDQUFDLENBQUMsT0FBT3VULGNBQWMsRUFBRTtrQkFDdkIsTUFBTSxJQUFJL2IsTUFBTSxDQUFDdUYsS0FBSyxDQUFDLEdBQUcsK0ZBQUEvQyxNQUFBLENBQThGLElBQUksQ0FBQ2dHLElBQUksU0FBS3VULGNBQWMsQ0FBQztnQkFDdko7Y0FDRjtjQUVBcGIsRUFBRSxDQUFDcWIsSUFBSSxDQUFDLElBQUksQ0FBQ3hULElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDaEUsV0FBVyxFQUFFLENBQUN5WCxNQUFNLEVBQUVMLEVBQUUsS0FBSztnQkFDekQxYSxLQUFLLENBQUMsTUFBTTtrQkFDVixJQUFJK2EsTUFBTSxFQUFFO29CQUNWLElBQUksQ0FBQzNULEtBQUssQ0FBQyxDQUFDO29CQUNaLE1BQU0sSUFBSXRJLE1BQU0sQ0FBQ3VGLEtBQUssQ0FBQyxHQUFHLEVBQUUsK0RBQStELEVBQUUwVyxNQUFNLENBQUM7a0JBQ3RHLENBQUMsTUFBTTtvQkFDTCxJQUFJLENBQUNMLEVBQUUsR0FBR0EsRUFBRTtvQkFDWkYsT0FBTyxDQUFDLElBQUksQ0FBQ2xULElBQUksQ0FBQyxHQUFHLElBQUk7a0JBQzNCO2dCQUNGLENBQUMsQ0FBQztjQUNKLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQztVQUNKLENBQUMsQ0FBQztRQUNKO01BQ0Y7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VxSCxLQUFLQSxDQUFDcU0sR0FBRyxFQUFFQyxLQUFLLEVBQUUvYSxRQUFRLEVBQUU7UUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQ3dILE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQ0MsS0FBSyxFQUFFO1VBQ2hDLElBQUksSUFBSSxDQUFDK1MsRUFBRSxFQUFFO1lBQ1hqYixFQUFFLENBQUNrUCxLQUFLLENBQUMsSUFBSSxDQUFDK0wsRUFBRSxFQUFFTyxLQUFLLEVBQUUsQ0FBQyxFQUFFQSxLQUFLLENBQUNyUyxNQUFNLEVBQUUsQ0FBQ29TLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDdlQsSUFBSSxDQUFDdEYsU0FBUyxFQUFFLENBQUN5RCxLQUFLLEVBQUVzVixPQUFPLEVBQUUxTCxNQUFNLEtBQUs7Y0FDckd4UCxLQUFLLENBQUMsTUFBTTtnQkFDVkUsUUFBUSxJQUFJQSxRQUFRLENBQUMwRixLQUFLLEVBQUVzVixPQUFPLEVBQUUxTCxNQUFNLENBQUM7Z0JBQzVDLElBQUk1SixLQUFLLEVBQUU7a0JBQ1Q5RyxNQUFNLENBQUN1QyxNQUFNLENBQUMsa0RBQWtELEVBQUV1RSxLQUFLLENBQUM7a0JBQ3hFLElBQUksQ0FBQ3dCLEtBQUssQ0FBQyxDQUFDO2dCQUNkLENBQUMsTUFBTTtrQkFDTCxFQUFFLElBQUksQ0FBQ3VULGFBQWE7Z0JBQ3RCO2NBQ0YsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDO1VBQ0osQ0FBQyxNQUFNO1lBQ0w3YixNQUFNLENBQUNvTixVQUFVLENBQUMsTUFBTTtjQUN0QixJQUFJLENBQUN5QyxLQUFLLENBQUNxTSxHQUFHLEVBQUVDLEtBQUssRUFBRS9hLFFBQVEsQ0FBQztZQUNsQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1VBQ1I7UUFDRjtRQUNBLE9BQU8sS0FBSztNQUNkOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VnSCxHQUFHQSxDQUFDaEgsUUFBUSxFQUFFO1FBQ1osSUFBSSxDQUFDLElBQUksQ0FBQ3dILE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQ0MsS0FBSyxFQUFFO1VBQ2hDLElBQUksSUFBSSxDQUFDZ1QsYUFBYSxLQUFLLElBQUksQ0FBQy9PLFNBQVMsRUFBRTtZQUN6Q25NLEVBQUUsQ0FBQzJWLEtBQUssQ0FBQyxJQUFJLENBQUNzRixFQUFFLEVBQUUsTUFBTTtjQUN0QjFhLEtBQUssQ0FBQyxNQUFNO2dCQUNWLE9BQU93YSxPQUFPLENBQUMsSUFBSSxDQUFDbFQsSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUNLLEtBQUssR0FBRyxJQUFJO2dCQUNqQnpILFFBQVEsSUFBSUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQztjQUNwQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUM7WUFDRixPQUFPLElBQUk7VUFDYjtVQUVBVCxFQUFFLENBQUN1USxJQUFJLENBQUMsSUFBSSxDQUFDMUksSUFBSSxFQUFFLENBQUMxQixLQUFLLEVBQUVvSyxJQUFJLEtBQUs7WUFDbENoUSxLQUFLLENBQUMsTUFBTTtjQUNWLElBQUksQ0FBQzRGLEtBQUssSUFBSW9LLElBQUksRUFBRTtnQkFDbEIsSUFBSSxDQUFDMkssYUFBYSxHQUFHNVcsSUFBSSxDQUFDb1gsSUFBSSxDQUFDbkwsSUFBSSxDQUFDL0ssSUFBSSxHQUFHLElBQUksQ0FBQ3dDLElBQUksQ0FBQ3RGLFNBQVMsQ0FBQztjQUNqRTtjQUVBLE9BQU9yRCxNQUFNLENBQUNvTixVQUFVLENBQUMsTUFBTTtnQkFDN0IsSUFBSSxDQUFDaEYsR0FBRyxDQUFDaEgsUUFBUSxDQUFDO2NBQ3BCLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDUixDQUFDLENBQUM7VUFDSixDQUFDLENBQUM7UUFDSixDQUFDLE1BQU07VUFDTEEsUUFBUSxJQUFJQSxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDeUgsS0FBSyxDQUFDO1FBQzFDO1FBQ0EsT0FBTyxLQUFLO01BQ2Q7O01BRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRVAsS0FBS0EsQ0FBQ2xILFFBQVEsRUFBRTtRQUNkLElBQUksQ0FBQ3dILE9BQU8sR0FBRyxJQUFJO1FBQ25CLE9BQU84UyxPQUFPLENBQUMsSUFBSSxDQUFDbFQsSUFBSSxDQUFDO1FBQ3pCN0gsRUFBRSxDQUFDNk4sTUFBTSxDQUFDLElBQUksQ0FBQ2hHLElBQUksRUFBR3BILFFBQVEsSUFBSUMsSUFBSyxDQUFDO1FBQ3hDLE9BQU8sSUFBSTtNQUNiOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFOEcsSUFBSUEsQ0FBQSxFQUFHO1FBQ0wsSUFBSSxDQUFDUyxPQUFPLEdBQUcsSUFBSTtRQUNuQixPQUFPOFMsT0FBTyxDQUFDLElBQUksQ0FBQ2xULElBQUksQ0FBQztRQUN6QixPQUFPLElBQUk7TUFDYjtJQUNGO0lBQUNtTyxzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBNVIsSUFBQTtFQUFBOFIsS0FBQTtBQUFBLEciLCJmaWxlIjoiL3BhY2thZ2VzL29zdHJpb19maWxlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcbmltcG9ydCB7IGZldGNoIH0gZnJvbSAnbWV0ZW9yL2ZldGNoJztcbmltcG9ydCB7IFdlYkFwcCB9IGZyb20gJ21ldGVvci93ZWJhcHAnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBSYW5kb20gfSBmcm9tICdtZXRlb3IvcmFuZG9tJztcbmltcG9ydCB7IENvb2tpZXMgfSBmcm9tICdtZXRlb3Ivb3N0cmlvOmNvb2tpZXMnO1xuaW1wb3J0IHsgY2hlY2ssIE1hdGNoIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuaW1wb3J0IFdyaXRlU3RyZWFtIGZyb20gJy4vd3JpdGUtc3RyZWFtLmpzJztcbmltcG9ydCBGaWxlc0NvbGxlY3Rpb25Db3JlIGZyb20gJy4vY29yZS5qcyc7XG5pbXBvcnQgeyBmaXhKU09OUGFyc2UsIGZpeEpTT05TdHJpbmdpZnksIGhlbHBlcnMgfSBmcm9tICcuL2xpYi5qcyc7XG5cbmltcG9ydCBBYm9ydENvbnRyb2xsZXIgZnJvbSAnYWJvcnQtY29udHJvbGxlcic7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IG5vZGVRcyBmcm9tICdxdWVyeXN0cmluZyc7XG5pbXBvcnQgbm9kZVBhdGggZnJvbSAncGF0aCc7XG4vLyBpbiBOb2RlLmpzIDE0LCB0aGVyZSBpcyBubyBwcm9taXNlcyB2ZXJzaW9uIG9mIHN0cmVhbVxuaW1wb3J0IHsgcGlwZWxpbmUgYXMgcGlwZWxpbmVDYWxsYmFjayB9IGZyb20gJ3N0cmVhbSc7XG5pbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tICd1dGlsJztcbi8vIGNoYW5nZSB0byB0aGlzIGluIFwibG9hZEFzeW5jXCIgd2hlbiBNZXRlb3Igc3VwcG9ydHMgTm9kZS5qcyAxNSB1cHdhcmRzXG4vL2ltcG9ydCBub2RlU3RyZWFtIGZyb20gJ3N0cmVhbS9wcm9taXNlcyc7XG5cbmNvbnN0IHBpcGVsaW5lID0gcHJvbWlzaWZ5KHBpcGVsaW5lQ2FsbGJhY2spO1xuXG4vKipcbiAqIEBjb25zdCB7T2JqZWN0fSBib3VuZCAgLSBNZXRlb3IuYmluZEVudmlyb25tZW50IChGaWJlciB3cmFwcGVyKVxuICogQGNvbnN0IHtGdW5jdGlvbn0gbm9vcCAtIE5vIE9wZXJhdGlvbiBmdW5jdGlvbiwgcGxhY2Vob2xkZXIgZm9yIHJlcXVpcmVkIGNhbGxiYWNrc1xuICovXG5jb25zdCBib3VuZCA9IE1ldGVvci5iaW5kRW52aXJvbm1lbnQoY2FsbGJhY2sgPT4gY2FsbGJhY2soKSk7XG5jb25zdCBub29wID0gZnVuY3Rpb24gbm9vcCAoKSB7fTtcblxuXG4vKipcbiAqIENyZWF0ZSAoZW5zdXJlKSBpbmRleCBvbiBNb25nb0RCIGNvbGxlY3Rpb24sIGNhdGNoIGFuZCBsb2cgZXhjZXB0aW9uIGlmIHRocm93blxuICogQGZ1bmN0aW9uIGNyZWF0ZUluZGV4XG4gKiBAcGFyYW0ge01vbmdvLkNvbGxlY3Rpb259IGNvbGxlY3Rpb24gLSBNb25nby5Db2xsZWN0aW9uIGluc3RhbmNlXG4gKiBAcGFyYW0ge29iamVjdH0ga2V5cyAtIEZpZWxkIGFuZCB2YWx1ZSBwYWlycyB3aGVyZSB0aGUgZmllbGQgaXMgdGhlIGluZGV4IGtleSBhbmQgdGhlIHZhbHVlIGRlc2NyaWJlcyB0aGUgdHlwZSBvZiBpbmRleCBmb3IgdGhhdCBmaWVsZFxuICogQHBhcmFtIHtvYmplY3R9IG9wdHMgLSBTZXQgb2Ygb3B0aW9ucyB0aGF0IGNvbnRyb2xzIHRoZSBjcmVhdGlvbiBvZiB0aGUgaW5kZXhcbiAqIEByZXR1cm5zIHt2b2lkIDB9XG4gKi9cbmNvbnN0IGNyZWF0ZUluZGV4ID0gYXN5bmMgKF9jb2xsZWN0aW9uLCBrZXlzLCBvcHRzKSA9PiB7XG4gIGNvbnN0IGNvbGxlY3Rpb24gPSBfY29sbGVjdGlvbi5yYXdDb2xsZWN0aW9uKCk7XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBjb2xsZWN0aW9uLmNyZWF0ZUluZGV4KGtleXMsIG9wdHMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUuY29kZSA9PT0gODUpIHtcbiAgICAgIGxldCBpbmRleE5hbWU7XG4gICAgICBjb25zdCBpbmRleGVzID0gYXdhaXQgY29sbGVjdGlvbi5pbmRleGVzKCk7XG4gICAgICBmb3IgKGNvbnN0IGluZGV4IG9mIGluZGV4ZXMpIHtcbiAgICAgICAgbGV0IGFsbE1hdGNoID0gdHJ1ZTtcbiAgICAgICAgZm9yIChjb25zdCBpbmRleEtleSBvZiBPYmplY3Qua2V5cyhrZXlzKSkge1xuICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXgua2V5W2luZGV4S2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGFsbE1hdGNoID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGluZGV4S2V5IG9mIE9iamVjdC5rZXlzKGluZGV4LmtleSkpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGtleXNbaW5kZXhLZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgYWxsTWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhbGxNYXRjaCkge1xuICAgICAgICAgIGluZGV4TmFtZSA9IGluZGV4Lm5hbWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGluZGV4TmFtZSkge1xuICAgICAgICBhd2FpdCBjb2xsZWN0aW9uLmRyb3BJbmRleChpbmRleE5hbWUpO1xuICAgICAgICBhd2FpdCBjb2xsZWN0aW9uLmNyZWF0ZUluZGV4KGtleXMsIG9wdHMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBNZXRlb3IuX2RlYnVnKGBDYW4gbm90IHNldCAke09iamVjdC5rZXlzKGtleXMpLmpvaW4oJyArICcpfSBpbmRleCBvbiBcIiR7X2NvbGxlY3Rpb24uX25hbWV9XCIgY29sbGVjdGlvbmAsIHsga2V5cywgb3B0cywgZGV0YWlsczogZSB9KTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAY2xhc3MgRmlsZXNDb2xsZWN0aW9uXG4gKiBAcGFyYW0gY29uZmlnICAgICAgICAgICB7T2JqZWN0fSAgIC0gW0JvdGhdICAgQ29uZmlndXJhdGlvbiBvYmplY3Qgd2l0aCBuZXh0IHByb3BlcnRpZXM6XG4gKiBAcGFyYW0gY29uZmlnLmRlYnVnICAgICB7Qm9vbGVhbn0gIC0gW0JvdGhdICAgVHVybiBvbi9vZiBkZWJ1Z2dpbmcgYW5kIGV4dHJhIGxvZ2dpbmdcbiAqIEBwYXJhbSBjb25maWcuc2NoZW1hICAgIHtPYmplY3R9ICAgLSBbQm90aF0gICBDb2xsZWN0aW9uIFNjaGVtYVxuICogQHBhcmFtIGNvbmZpZy5wdWJsaWMgICAge0Jvb2xlYW59ICAtIFtCb3RoXSAgIFN0b3JlIGZpbGVzIGluIGZvbGRlciBhY2Nlc3NpYmxlIGZvciBwcm94eSBzZXJ2ZXJzLCBmb3IgbGltaXRzLCBhbmQgbW9yZSAtIHJlYWQgZG9jc1xuICogQHBhcmFtIGNvbmZpZy5zdHJpY3QgICAge0Jvb2xlYW59ICAtIFtTZXJ2ZXJdIFN0cmljdCBtb2RlIGZvciBwYXJ0aWFsIGNvbnRlbnQsIGlmIGlzIGB0cnVlYCBzZXJ2ZXIgd2lsbCByZXR1cm4gYDQxNmAgcmVzcG9uc2UgY29kZSwgd2hlbiBgcmFuZ2VgIGlzIG5vdCBzcGVjaWZpZWQsIG90aGVyd2lzZSBzZXJ2ZXIgcmV0dXJuIGAyMDZgXG4gKiBAcGFyYW0gY29uZmlnLnByb3RlY3RlZCB7RnVuY3Rpb259IC0gW1NlcnZlcl0gSWYgYHRydWVgIC0gZmlsZXMgd2lsbCBiZSBzZXJ2ZWQgb25seSB0byBhdXRob3JpemVkIHVzZXJzLCBpZiBgZnVuY3Rpb24oKWAgLSB5b3UncmUgYWJsZSB0byBjaGVjayB2aXNpdG9yJ3MgcGVybWlzc2lvbnMgaW4geW91ciBvd24gd2F5IGZ1bmN0aW9uJ3MgY29udGV4dCBoYXM6XG4gKiAgLSBgcmVxdWVzdGBcbiAqICAtIGByZXNwb25zZWBcbiAqICAtIGB1c2VyKClgXG4gKiAgLSBgdXNlcklkYFxuICogQHBhcmFtIGNvbmZpZy5jaHVua1NpemUgICAgICB7TnVtYmVyfSAgLSBbQm90aF0gVXBsb2FkIGNodW5rIHNpemUsIGRlZmF1bHQ6IDUyNDI4OCBieXRlcyAoMCw1IE1iKVxuICogQHBhcmFtIGNvbmZpZy5wZXJtaXNzaW9ucyAgICB7TnVtYmVyfSAgLSBbU2VydmVyXSBQZXJtaXNzaW9ucyB3aGljaCB3aWxsIGJlIHNldCB0byB1cGxvYWRlZCBmaWxlcyAob2N0YWwpLCBsaWtlOiBgNTExYCBvciBgMG83NTVgLiBEZWZhdWx0OiAwNjQ0XG4gKiBAcGFyYW0gY29uZmlnLnBhcmVudERpclBlcm1pc3Npb25zIHtOdW1iZXJ9ICAtIFtTZXJ2ZXJdIFBlcm1pc3Npb25zIHdoaWNoIHdpbGwgYmUgc2V0IHRvIHBhcmVudCBkaXJlY3Rvcnkgb2YgdXBsb2FkZWQgZmlsZXMgKG9jdGFsKSwgbGlrZTogYDYxMWAgb3IgYDBvNzc3YC4gRGVmYXVsdDogMDc1NVxuICogQHBhcmFtIGNvbmZpZy5zdG9yYWdlUGF0aCAgICB7U3RyaW5nfEZ1bmN0aW9ufSAgLSBbU2VydmVyXSBTdG9yYWdlIHBhdGggb24gZmlsZSBzeXN0ZW1cbiAqIEBwYXJhbSBjb25maWcuY2FjaGVDb250cm9sICAge1N0cmluZ30gIC0gW1NlcnZlcl0gRGVmYXVsdCBgQ2FjaGUtQ29udHJvbGAgaGVhZGVyXG4gKiBAcGFyYW0gY29uZmlnLnJlc3BvbnNlSGVhZGVycyB7T2JqZWN0fEZ1bmN0aW9ufSAtIFtTZXJ2ZXJdIEN1c3RvbSByZXNwb25zZSBoZWFkZXJzLCBpZiBmdW5jdGlvbiBpcyBwYXNzZWQsIG11c3QgcmV0dXJuIE9iamVjdFxuICogQHBhcmFtIGNvbmZpZy50aHJvdHRsZSAgICAgICB7TnVtYmVyfSAgLSBbU2VydmVyXSBERVBSRUNBVEVEIGJwcyB0aHJvdHRsZSB0aHJlc2hvbGRcbiAqIEBwYXJhbSBjb25maWcuZG93bmxvYWRSb3V0ZSAge1N0cmluZ30gIC0gW0JvdGhdICAgU2VydmVyIFJvdXRlIHVzZWQgdG8gcmV0cmlldmUgZmlsZXNcbiAqIEBwYXJhbSBjb25maWcuY29sbGVjdGlvbiAgICAge01vbmdvLkNvbGxlY3Rpb259IC0gW0JvdGhdIE1vbmdvIENvbGxlY3Rpb24gSW5zdGFuY2VcbiAqIEBwYXJhbSBjb25maWcuY29sbGVjdGlvbk5hbWUge1N0cmluZ30gIC0gW0JvdGhdICAgQ29sbGVjdGlvbiBuYW1lXG4gKiBAcGFyYW0gY29uZmlnLm5hbWluZ0Z1bmN0aW9uIHtGdW5jdGlvbn0tIFtCb3RoXSAgIEZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYFN0cmluZ2BcbiAqIEBwYXJhbSBjb25maWcuaW50ZWdyaXR5Q2hlY2sge0Jvb2xlYW59IC0gW1NlcnZlcl0gQ2hlY2sgZmlsZSdzIGludGVncml0eSBiZWZvcmUgc2VydmluZyB0byB1c2Vyc1xuICogQHBhcmFtIGNvbmZpZy5vbkFmdGVyVXBsb2FkICB7RnVuY3Rpb259LSBbU2VydmVyXSBDYWxsZWQgcmlnaHQgYWZ0ZXIgZmlsZSBpcyByZWFkeSBvbiBGUy4gVXNlIHRvIHRyYW5zZmVyIGZpbGUgc29tZXdoZXJlIGVsc2UsIG9yIGRvIG90aGVyIHRoaW5nIHdpdGggZmlsZSBkaXJlY3RseVxuICogQHBhcmFtIGNvbmZpZy5vbkFmdGVyUmVtb3ZlICB7RnVuY3Rpb259IC0gW1NlcnZlcl0gQ2FsbGVkIHJpZ2h0IGFmdGVyIGZpbGUgaXMgcmVtb3ZlZC4gUmVtb3ZlZCBvYmplY3RzIGlzIHBhc3NlZCB0byBjYWxsYmFja1xuICogQHBhcmFtIGNvbmZpZy5jb250aW51ZVVwbG9hZFRUTCB7TnVtYmVyfSAtIFtTZXJ2ZXJdIFRpbWUgaW4gc2Vjb25kcywgZHVyaW5nIHVwbG9hZCBtYXkgYmUgY29udGludWVkLCBkZWZhdWx0IDMgaG91cnMgKDEwODAwIHNlY29uZHMpXG4gKiBAcGFyYW0gY29uZmlnLm9uQmVmb3JlVXBsb2FkIHtGdW5jdGlvbn0tIFtCb3RoXSAgIEZ1bmN0aW9uIHdoaWNoIGV4ZWN1dGVzIG9uIHNlcnZlciBhZnRlciByZWNlaXZpbmcgZWFjaCBjaHVuayBhbmQgb24gY2xpZW50IHJpZ2h0IGJlZm9yZSBiZWdpbm5pbmcgdXBsb2FkLiBGdW5jdGlvbiBjb250ZXh0IGlzIGBGaWxlYCAtIHNvIHlvdSBhcmUgYWJsZSB0byBjaGVjayBmb3IgZXh0ZW5zaW9uLCBtaW1lLXR5cGUsIHNpemUgYW5kIGV0Yy46XG4gKiAgLSByZXR1cm4gb3IgcmVzb2x2ZSBgdHJ1ZWAgdG8gY29udGludWVcbiAqICAtIHJldHVybiBvciByZXNvbHZlIGBmYWxzZWAgb3IgYFN0cmluZ2AgdG8gYWJvcnQgdXBsb2FkXG4gKiBAcGFyYW0gY29uZmlnLmdldFVzZXIgICAgICAgIHtGdW5jdGlvbn0gLSBbU2VydmVyXSBSZXBsYWNlIGRlZmF1bHQgd2F5IG9mIHJlY29nbml6aW5nIHVzZXIsIHVzZWZ1bGwgd2hlbiB5b3Ugd2FudCB0byBhdXRoIHVzZXIgYmFzZWQgb24gY3VzdG9tIGNvb2tpZSAob3Igb3RoZXIgd2F5KS4gYXJndW1lbnRzIHtodHRwOiB7cmVxdWVzdDogey4uLn0sIHJlc3BvbnNlOiB7Li4ufX19LCBuZWVkIHRvIHJldHVybiB7dXNlcklkOiBTdHJpbmcsIHVzZXI6IEZ1bmN0aW9ufVxuICogQHBhcmFtIGNvbmZpZy5vbkluaXRpYXRlVXBsb2FkIHtGdW5jdGlvbn0gLSBbU2VydmVyXSBGdW5jdGlvbiB3aGljaCBleGVjdXRlcyBvbiBzZXJ2ZXIgcmlnaHQgYmVmb3JlIHVwbG9hZCBpcyBiZWdpbiBhbmQgcmlnaHQgYWZ0ZXIgYG9uQmVmb3JlVXBsb2FkYCBob29rLiBUaGlzIGhvb2sgaXMgZnVsbHkgYXN5bmNocm9ub3VzLlxuICogQHBhcmFtIGNvbmZpZy5vbkJlZm9yZVJlbW92ZSB7RnVuY3Rpb259IC0gW1NlcnZlcl0gRXhlY3V0ZXMgYmVmb3JlIHJlbW92aW5nIGZpbGUgb24gc2VydmVyLCBzbyB5b3UgY2FuIGNoZWNrIHBlcm1pc3Npb25zLiBSZXR1cm4gYHRydWVgIHRvIGFsbG93IGFjdGlvbiBhbmQgYGZhbHNlYCB0byBkZW55LlxuICogQHBhcmFtIGNvbmZpZy5hbGxvd0NsaWVudENvZGUgIHtCb29sZWFufSAgLSBbQm90aF0gICBBbGxvdyB0byBydW4gYHJlbW92ZWAgZnJvbSBjbGllbnRcbiAqIEBwYXJhbSBjb25maWcuZG93bmxvYWRDYWxsYmFjayB7RnVuY3Rpb259IC0gW1NlcnZlcl0gQ2FsbGJhY2sgdHJpZ2dlcmVkIGVhY2ggdGltZSBmaWxlIGlzIHJlcXVlc3RlZCwgcmV0dXJuIHRydXRoeSB2YWx1ZSB0byBjb250aW51ZSBkb3dubG9hZCwgb3IgZmFsc3kgdG8gYWJvcnRcbiAqIEBwYXJhbSBjb25maWcuaW50ZXJjZXB0UmVxdWVzdCB7RnVuY3Rpb259IC0gW1NlcnZlcl0gSW50ZXJjZXB0IGluY29taW5nIEhUVFAgcmVxdWVzdCwgc28geW91IGNhbiB3aGF0ZXZlciB5b3Ugd2FudCwgbm8gY2hlY2tzIG9yIHByZXByb2Nlc3NpbmcsIGFyZ3VtZW50cyB7aHR0cDoge3JlcXVlc3Q6IHsuLi59LCByZXNwb25zZTogey4uLn19LCBwYXJhbXM6IHsuLi59fVxuICogQHBhcmFtIGNvbmZpZy5pbnRlcmNlcHREb3dubG9hZCB7RnVuY3Rpb259IC0gW1NlcnZlcl0gSW50ZXJjZXB0IGRvd25sb2FkIHJlcXVlc3QsIHNvIHlvdSBjYW4gc2VydmUgZmlsZSBmcm9tIHRoaXJkLXBhcnR5IHJlc291cmNlLCBhcmd1bWVudHMge2h0dHA6IHtyZXF1ZXN0OiB7Li4ufSwgcmVzcG9uc2U6IHsuLi59fSwgZmlsZVJlZjogey4uLn19XG4gKiBAcGFyYW0gY29uZmlnLmRpc2FibGVVcGxvYWQge0Jvb2xlYW59IC0gRGlzYWJsZSBmaWxlIHVwbG9hZCwgdXNlZnVsIGZvciBzZXJ2ZXIgb25seSBzb2x1dGlvbnNcbiAqIEBwYXJhbSBjb25maWcuZGlzYWJsZURvd25sb2FkIHtCb29sZWFufSAtIERpc2FibGUgZmlsZSBkb3dubG9hZCAoc2VydmluZyksIHVzZWZ1bCBmb3IgZmlsZSBtYW5hZ2VtZW50IG9ubHkgc29sdXRpb25zXG4gKiBAcGFyYW0gY29uZmlnLmFsbG93ZWRPcmlnaW5zICB7UmVnZXh8Qm9vbGVhbn0gIC0gW1NlcnZlcl0gICBSZWdleCBvZiBPcmlnaW5zIHRoYXQgYXJlIGFsbG93ZWQgQ09SUyBhY2Nlc3Mgb3IgYGZhbHNlYCB0byBkaXNhYmxlIGNvbXBsZXRlbHkuIERlZmF1bHRzIHRvIGAvXmh0dHA6XFwvXFwvbG9jYWxob3N0OjEyWzAtOV17M30kL2AgZm9yIGFsbG93aW5nIE1ldGVvci1Db3Jkb3ZhIGJ1aWxkcyBhY2Nlc3NcbiAqIEBwYXJhbSBjb25maWcuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMge0Jvb2xlYW59IC0gQWxsb3cgcGFzc2luZyBDb29raWVzIGluIGEgcXVlcnkgc3RyaW5nIChpbiBVUkwpLiBQcmltYXJ5IHNob3VsZCBiZSB1c2VkIG9ubHkgaW4gQ29yZG92YSBlbnZpcm9ubWVudC4gTm90ZTogdGhpcyBvcHRpb24gd2lsbCBiZSB1c2VkIG9ubHkgb24gQ29yZG92YS4gRGVmYXVsdDogYGZhbHNlYFxuICogQHBhcmFtIGNvbmZpZy5zYW5pdGl6ZSB7RnVuY3Rpb259IC0gT3ZlcnJpZGUgZGVmYXVsdCBzYW5pdGl6ZSBmdW5jdGlvblxuICogQHBhcmFtIGNvbmZpZy5fcHJlQ29sbGVjdGlvbiAge01vbmdvLkNvbGxlY3Rpb259IC0gW1NlcnZlcl0gTW9uZ28gcHJlQ29sbGVjdGlvbiBJbnN0YW5jZVxuICogQHBhcmFtIGNvbmZpZy5fcHJlQ29sbGVjdGlvbk5hbWUge1N0cmluZ30gIC0gW1NlcnZlcl0gIHByZUNvbGxlY3Rpb24gbmFtZVxuICogQHN1bW1hcnkgQ3JlYXRlIG5ldyBpbnN0YW5jZSBvZiBGaWxlc0NvbGxlY3Rpb25cbiAqL1xuY2xhc3MgRmlsZXNDb2xsZWN0aW9uIGV4dGVuZHMgRmlsZXNDb2xsZWN0aW9uQ29yZSB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHN1cGVyKCk7XG4gICAgbGV0IHN0b3JhZ2VQYXRoO1xuICAgIGlmIChjb25maWcpIHtcbiAgICAgICh7XG4gICAgICAgIF9wcmVDb2xsZWN0aW9uOiB0aGlzLl9wcmVDb2xsZWN0aW9uLFxuICAgICAgICBfcHJlQ29sbGVjdGlvbk5hbWU6IHRoaXMuX3ByZUNvbGxlY3Rpb25OYW1lLFxuICAgICAgICBhbGxvd0NsaWVudENvZGU6IHRoaXMuYWxsb3dDbGllbnRDb2RlLFxuICAgICAgICBhbGxvd2VkT3JpZ2luczogdGhpcy5hbGxvd2VkT3JpZ2lucyxcbiAgICAgICAgYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXM6IHRoaXMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMsXG4gICAgICAgIGNhY2hlQ29udHJvbDogdGhpcy5jYWNoZUNvbnRyb2wsXG4gICAgICAgIGNodW5rU2l6ZTogdGhpcy5jaHVua1NpemUsXG4gICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvbixcbiAgICAgICAgY29sbGVjdGlvbk5hbWU6IHRoaXMuY29sbGVjdGlvbk5hbWUsXG4gICAgICAgIGNvbnRpbnVlVXBsb2FkVFRMOiB0aGlzLmNvbnRpbnVlVXBsb2FkVFRMLFxuICAgICAgICBkZWJ1ZzogdGhpcy5kZWJ1ZyxcbiAgICAgICAgZGlzYWJsZURvd25sb2FkOiB0aGlzLmRpc2FibGVEb3dubG9hZCxcbiAgICAgICAgZGlzYWJsZVVwbG9hZDogdGhpcy5kaXNhYmxlVXBsb2FkLFxuICAgICAgICBkb3dubG9hZENhbGxiYWNrOiB0aGlzLmRvd25sb2FkQ2FsbGJhY2ssXG4gICAgICAgIGRvd25sb2FkUm91dGU6IHRoaXMuZG93bmxvYWRSb3V0ZSxcbiAgICAgICAgZ2V0VXNlcjogdGhpcy5nZXRVc2VyLFxuICAgICAgICBpbnRlZ3JpdHlDaGVjazogdGhpcy5pbnRlZ3JpdHlDaGVjayxcbiAgICAgICAgaW50ZXJjZXB0RG93bmxvYWQ6IHRoaXMuaW50ZXJjZXB0RG93bmxvYWQsXG4gICAgICAgIGludGVyY2VwdFJlcXVlc3Q6IHRoaXMuaW50ZXJjZXB0UmVxdWVzdCxcbiAgICAgICAgbmFtaW5nRnVuY3Rpb246IHRoaXMubmFtaW5nRnVuY3Rpb24sXG4gICAgICAgIG9uQWZ0ZXJSZW1vdmU6IHRoaXMub25BZnRlclJlbW92ZSxcbiAgICAgICAgb25BZnRlclVwbG9hZDogdGhpcy5vbkFmdGVyVXBsb2FkLFxuICAgICAgICBvbkJlZm9yZVJlbW92ZTogdGhpcy5vbkJlZm9yZVJlbW92ZSxcbiAgICAgICAgb25CZWZvcmVVcGxvYWQ6IHRoaXMub25CZWZvcmVVcGxvYWQsXG4gICAgICAgIG9uSW5pdGlhdGVVcGxvYWQ6IHRoaXMub25Jbml0aWF0ZVVwbG9hZCxcbiAgICAgICAgcGFyZW50RGlyUGVybWlzc2lvbnM6IHRoaXMucGFyZW50RGlyUGVybWlzc2lvbnMsXG4gICAgICAgIHBlcm1pc3Npb25zOiB0aGlzLnBlcm1pc3Npb25zLFxuICAgICAgICBwcm90ZWN0ZWQ6IHRoaXMucHJvdGVjdGVkLFxuICAgICAgICBwdWJsaWM6IHRoaXMucHVibGljLFxuICAgICAgICByZXNwb25zZUhlYWRlcnM6IHRoaXMucmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBzYW5pdGl6ZTogdGhpcy5zYW5pdGl6ZSxcbiAgICAgICAgc2NoZW1hOiB0aGlzLnNjaGVtYSxcbiAgICAgICAgc3RvcmFnZVBhdGgsXG4gICAgICAgIHN0cmljdDogdGhpcy5zdHJpY3QsXG4gICAgICB9ID0gY29uZmlnKTtcbiAgICB9XG5cbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmICghaGVscGVycy5pc0Jvb2xlYW4odGhpcy5kZWJ1ZykpIHtcbiAgICAgIHRoaXMuZGVidWcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNCb29sZWFuKHRoaXMucHVibGljKSkge1xuICAgICAgdGhpcy5wdWJsaWMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucHJvdGVjdGVkKSB7XG4gICAgICB0aGlzLnByb3RlY3RlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5jaHVua1NpemUpIHtcbiAgICAgIHRoaXMuY2h1bmtTaXplID0gMTAyNCAqIDUxMjtcbiAgICB9XG5cbiAgICB0aGlzLmNodW5rU2l6ZSA9IE1hdGguZmxvb3IodGhpcy5jaHVua1NpemUgLyA4KSAqIDg7XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNTdHJpbmcodGhpcy5jb2xsZWN0aW9uTmFtZSkgJiYgIXRoaXMuY29sbGVjdGlvbikge1xuICAgICAgdGhpcy5jb2xsZWN0aW9uTmFtZSA9ICdNZXRlb3JVcGxvYWRGaWxlcyc7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmNvbGxlY3Rpb24pIHtcbiAgICAgIHRoaXMuY29sbGVjdGlvbiA9IG5ldyBNb25nby5Db2xsZWN0aW9uKHRoaXMuY29sbGVjdGlvbk5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbGxlY3Rpb25OYW1lID0gdGhpcy5jb2xsZWN0aW9uLl9uYW1lO1xuICAgIH1cblxuICAgIHRoaXMuY29sbGVjdGlvbi5maWxlc0NvbGxlY3Rpb24gPSB0aGlzO1xuICAgIGNoZWNrKHRoaXMuY29sbGVjdGlvbk5hbWUsIFN0cmluZyk7XG5cbiAgICBpZiAodGhpcy5wdWJsaWMgJiYgIXRoaXMuZG93bmxvYWRSb3V0ZSkge1xuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig1MDAsIGBbRmlsZXNDb2xsZWN0aW9uLiR7dGhpcy5jb2xsZWN0aW9uTmFtZX1dOiBcImRvd25sb2FkUm91dGVcIiBtdXN0IGJlIHByZWNpc2VseSBwcm92aWRlZCBvbiBcInB1YmxpY1wiIGNvbGxlY3Rpb25zISBOb3RlOiBcImRvd25sb2FkUm91dGVcIiBtdXN0IGJlIGVxdWFsIG9yIGJlIGluc2lkZSBvZiB5b3VyIHdlYi9wcm94eS1zZXJ2ZXIgKHJlbGF0aXZlKSByb290LmApO1xuICAgIH1cblxuICAgIGlmICghaGVscGVycy5pc1N0cmluZyh0aGlzLmRvd25sb2FkUm91dGUpKSB7XG4gICAgICB0aGlzLmRvd25sb2FkUm91dGUgPSAnL2Nkbi9zdG9yYWdlJztcbiAgICB9XG5cbiAgICB0aGlzLmRvd25sb2FkUm91dGUgPSB0aGlzLmRvd25sb2FkUm91dGUucmVwbGFjZSgvXFwvJC8sICcnKTtcblxuICAgIGlmICghaGVscGVycy5pc0Z1bmN0aW9uKHRoaXMubmFtaW5nRnVuY3Rpb24pKSB7XG4gICAgICB0aGlzLm5hbWluZ0Z1bmN0aW9uID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFoZWxwZXJzLmlzRnVuY3Rpb24odGhpcy5vbkJlZm9yZVVwbG9hZCkpIHtcbiAgICAgIHRoaXMub25CZWZvcmVVcGxvYWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLmdldFVzZXIpKSB7XG4gICAgICB0aGlzLmdldFVzZXIgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNCb29sZWFuKHRoaXMuYWxsb3dDbGllbnRDb2RlKSkge1xuICAgICAgdGhpcy5hbGxvd0NsaWVudENvZGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICghaGVscGVycy5pc0Z1bmN0aW9uKHRoaXMub25Jbml0aWF0ZVVwbG9hZCkpIHtcbiAgICAgIHRoaXMub25Jbml0aWF0ZVVwbG9hZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghaGVscGVycy5pc0Z1bmN0aW9uKHRoaXMuaW50ZXJjZXB0UmVxdWVzdCkpIHtcbiAgICAgIHRoaXMuaW50ZXJjZXB0UmVxdWVzdCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghaGVscGVycy5pc0Z1bmN0aW9uKHRoaXMuaW50ZXJjZXB0RG93bmxvYWQpKSB7XG4gICAgICB0aGlzLmludGVyY2VwdERvd25sb2FkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFoZWxwZXJzLmlzQm9vbGVhbih0aGlzLnN0cmljdCkpIHtcbiAgICAgIHRoaXMuc3RyaWN0ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNCb29sZWFuKHRoaXMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMpKSB7XG4gICAgICB0aGlzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFoZWxwZXJzLmlzTnVtYmVyKHRoaXMucGVybWlzc2lvbnMpKSB7XG4gICAgICB0aGlzLnBlcm1pc3Npb25zID0gcGFyc2VJbnQoJzY0NCcsIDgpO1xuICAgIH1cblxuICAgIGlmICghaGVscGVycy5pc051bWJlcih0aGlzLnBhcmVudERpclBlcm1pc3Npb25zKSkge1xuICAgICAgdGhpcy5wYXJlbnREaXJQZXJtaXNzaW9ucyA9IHBhcnNlSW50KCc3NTUnLCA4KTtcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNTdHJpbmcodGhpcy5jYWNoZUNvbnRyb2wpKSB7XG4gICAgICB0aGlzLmNhY2hlQ29udHJvbCA9ICdwdWJsaWMsIG1heC1hZ2U9MzE1MzYwMDAsIHMtbWF4YWdlPTMxNTM2MDAwJztcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLm9uQWZ0ZXJVcGxvYWQpKSB7XG4gICAgICB0aGlzLm9uQWZ0ZXJVcGxvYWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNCb29sZWFuKHRoaXMuZGlzYWJsZVVwbG9hZCkpIHtcbiAgICAgIHRoaXMuZGlzYWJsZVVwbG9hZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghaGVscGVycy5pc0Z1bmN0aW9uKHRoaXMub25BZnRlclJlbW92ZSkpIHtcbiAgICAgIHRoaXMub25BZnRlclJlbW92ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghaGVscGVycy5pc0Z1bmN0aW9uKHRoaXMub25CZWZvcmVSZW1vdmUpKSB7XG4gICAgICB0aGlzLm9uQmVmb3JlUmVtb3ZlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFoZWxwZXJzLmlzQm9vbGVhbih0aGlzLmludGVncml0eUNoZWNrKSkge1xuICAgICAgdGhpcy5pbnRlZ3JpdHlDaGVjayA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCFoZWxwZXJzLmlzQm9vbGVhbih0aGlzLmRpc2FibGVEb3dubG9hZCkpIHtcbiAgICAgIHRoaXMuZGlzYWJsZURvd25sb2FkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWxsb3dlZE9yaWdpbnMgPT09IHRydWUgfHwgdGhpcy5hbGxvd2VkT3JpZ2lucyA9PT0gdm9pZCAwKSB7XG4gICAgICB0aGlzLmFsbG93ZWRPcmlnaW5zID0gL15odHRwOlxcL1xcL2xvY2FsaG9zdDoxMlswLTldezN9JC87XG4gICAgfVxuXG4gICAgaWYgKCFoZWxwZXJzLmlzT2JqZWN0KHRoaXMuX2N1cnJlbnRVcGxvYWRzKSkge1xuICAgICAgdGhpcy5fY3VycmVudFVwbG9hZHMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLmRvd25sb2FkQ2FsbGJhY2spKSB7XG4gICAgICB0aGlzLmRvd25sb2FkQ2FsbGJhY2sgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNOdW1iZXIodGhpcy5jb250aW51ZVVwbG9hZFRUTCkpIHtcbiAgICAgIHRoaXMuY29udGludWVVcGxvYWRUVEwgPSAxMDgwMDtcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLnNhbml0aXplKSkge1xuICAgICAgdGhpcy5zYW5pdGl6ZSA9IGhlbHBlcnMuc2FuaXRpemU7XG4gICAgfVxuXG4gICAgaWYgKCFoZWxwZXJzLmlzRnVuY3Rpb24odGhpcy5yZXNwb25zZUhlYWRlcnMpKSB7XG4gICAgICB0aGlzLnJlc3BvbnNlSGVhZGVycyA9IChyZXNwb25zZUNvZGUsIGZpbGVSZWYsIHZlcnNpb25SZWYpID0+IHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IHt9O1xuICAgICAgICBzd2l0Y2ggKHJlc3BvbnNlQ29kZSkge1xuICAgICAgICBjYXNlICcyMDYnOlxuICAgICAgICAgIGhlYWRlcnMuUHJhZ21hID0gJ3ByaXZhdGUnO1xuICAgICAgICAgIGhlYWRlcnNbJ1RyYW5zZmVyLUVuY29kaW5nJ10gPSAnY2h1bmtlZCc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJzQwMCc6XG4gICAgICAgICAgaGVhZGVyc1snQ2FjaGUtQ29udHJvbCddID0gJ25vLWNhY2hlJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnNDE2JzpcbiAgICAgICAgICBoZWFkZXJzWydDb250ZW50LVJhbmdlJ10gPSBgYnl0ZXMgKi8ke3ZlcnNpb25SZWYuc2l6ZX1gO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaGVhZGVycy5Db25uZWN0aW9uID0gJ2tlZXAtYWxpdmUnO1xuICAgICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZlcnNpb25SZWYudHlwZSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgICAgICAgaGVhZGVyc1snQWNjZXB0LVJhbmdlcyddID0gJ2J5dGVzJztcbiAgICAgICAgcmV0dXJuIGhlYWRlcnM7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICh0aGlzLnB1YmxpYyAmJiAhc3RvcmFnZVBhdGgpIHtcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNTAwLCBgW0ZpbGVzQ29sbGVjdGlvbi4ke3RoaXMuY29sbGVjdGlvbk5hbWV9XSBcInN0b3JhZ2VQYXRoXCIgbXVzdCBiZSBzZXQgb24gXCJwdWJsaWNcIiBjb2xsZWN0aW9ucyEgTm90ZTogXCJzdG9yYWdlUGF0aFwiIG11c3QgYmUgZXF1YWwgb24gYmUgaW5zaWRlIG9mIHlvdXIgd2ViL3Byb3h5LXNlcnZlciAoYWJzb2x1dGUpIHJvb3QuYCk7XG4gICAgfVxuXG4gICAgaWYgKCFzdG9yYWdlUGF0aCkge1xuICAgICAgc3RvcmFnZVBhdGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBgYXNzZXRzJHtub2RlUGF0aC5zZXB9YXBwJHtub2RlUGF0aC5zZXB9dXBsb2FkcyR7bm9kZVBhdGguc2VwfSR7c2VsZi5jb2xsZWN0aW9uTmFtZX1gO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoaGVscGVycy5pc1N0cmluZyhzdG9yYWdlUGF0aCkpIHtcbiAgICAgIHRoaXMuc3RvcmFnZVBhdGggPSAoKSA9PiBzdG9yYWdlUGF0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdG9yYWdlUGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IHNwID0gc3RvcmFnZVBhdGguYXBwbHkoc2VsZiwgYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKCFoZWxwZXJzLmlzU3RyaW5nKHNwKSkge1xuICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAwLCBgW0ZpbGVzQ29sbGVjdGlvbi4ke3NlbGYuY29sbGVjdGlvbk5hbWV9XSBcInN0b3JhZ2VQYXRoXCIgZnVuY3Rpb24gbXVzdCByZXR1cm4gYSBTdHJpbmchYCk7XG4gICAgICAgIH1cbiAgICAgICAgc3AgPSBzcC5yZXBsYWNlKC9cXC8kLywgJycpO1xuICAgICAgICByZXR1cm4gbm9kZVBhdGgubm9ybWFsaXplKHNwKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy5fZGVidWcoJ1tGaWxlc0NvbGxlY3Rpb24uc3RvcmFnZVBhdGhdIFNldCB0bzonLCB0aGlzLnN0b3JhZ2VQYXRoKHt9KSk7XG5cbiAgICB0cnkge1xuICAgICAgZnMubWtkaXJTeW5jKHRoaXMuc3RvcmFnZVBhdGgoe30pLCB7XG4gICAgICAgIG1vZGU6IHRoaXMucGFyZW50RGlyUGVybWlzc2lvbnMsXG4gICAgICAgIHJlY3Vyc2l2ZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMSwgYFtGaWxlc0NvbGxlY3Rpb24uJHtzZWxmLmNvbGxlY3Rpb25OYW1lfV0gUGF0aCBcIiR7dGhpcy5zdG9yYWdlUGF0aCh7fSl9XCIgaXMgbm90IHdyaXRhYmxlIWAsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVjayh0aGlzLnN0cmljdCwgQm9vbGVhbik7XG4gICAgY2hlY2sodGhpcy5wZXJtaXNzaW9ucywgTnVtYmVyKTtcbiAgICBjaGVjayh0aGlzLnN0b3JhZ2VQYXRoLCBGdW5jdGlvbik7XG4gICAgY2hlY2sodGhpcy5jYWNoZUNvbnRyb2wsIFN0cmluZyk7XG4gICAgY2hlY2sodGhpcy5vbkFmdGVyUmVtb3ZlLCBNYXRjaC5PbmVPZihmYWxzZSwgRnVuY3Rpb24pKTtcbiAgICBjaGVjayh0aGlzLm9uQWZ0ZXJVcGxvYWQsIE1hdGNoLk9uZU9mKGZhbHNlLCBGdW5jdGlvbikpO1xuICAgIGNoZWNrKHRoaXMuZGlzYWJsZVVwbG9hZCwgQm9vbGVhbik7XG4gICAgY2hlY2sodGhpcy5pbnRlZ3JpdHlDaGVjaywgQm9vbGVhbik7XG4gICAgY2hlY2sodGhpcy5vbkJlZm9yZVJlbW92ZSwgTWF0Y2guT25lT2YoZmFsc2UsIEZ1bmN0aW9uKSk7XG4gICAgY2hlY2sodGhpcy5kaXNhYmxlRG93bmxvYWQsIEJvb2xlYW4pO1xuICAgIGNoZWNrKHRoaXMuZG93bmxvYWRDYWxsYmFjaywgTWF0Y2guT25lT2YoZmFsc2UsIEZ1bmN0aW9uKSk7XG4gICAgY2hlY2sodGhpcy5pbnRlcmNlcHRSZXF1ZXN0LCBNYXRjaC5PbmVPZihmYWxzZSwgRnVuY3Rpb24pKTtcbiAgICBjaGVjayh0aGlzLmludGVyY2VwdERvd25sb2FkLCBNYXRjaC5PbmVPZihmYWxzZSwgRnVuY3Rpb24pKTtcbiAgICBjaGVjayh0aGlzLmNvbnRpbnVlVXBsb2FkVFRMLCBOdW1iZXIpO1xuICAgIGNoZWNrKHRoaXMucmVzcG9uc2VIZWFkZXJzLCBNYXRjaC5PbmVPZihPYmplY3QsIEZ1bmN0aW9uKSk7XG4gICAgY2hlY2sodGhpcy5hbGxvd2VkT3JpZ2lucywgTWF0Y2guT25lT2YoQm9vbGVhbiwgUmVnRXhwKSk7XG4gICAgY2hlY2sodGhpcy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcywgQm9vbGVhbik7XG5cbiAgICB0aGlzLl9jb29raWVzID0gbmV3IENvb2tpZXMoe1xuICAgICAgYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXM6IHRoaXMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMsXG4gICAgICBhbGxvd2VkQ29yZG92YU9yaWdpbnM6IHRoaXMuYWxsb3dlZE9yaWdpbnNcbiAgICB9KTtcblxuICAgIGlmICghdGhpcy5kaXNhYmxlVXBsb2FkKSB7XG4gICAgICBpZiAoIWhlbHBlcnMuaXNTdHJpbmcodGhpcy5fcHJlQ29sbGVjdGlvbk5hbWUpICYmICF0aGlzLl9wcmVDb2xsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuX3ByZUNvbGxlY3Rpb25OYW1lID0gYF9fcHJlXyR7dGhpcy5jb2xsZWN0aW9uTmFtZX1gO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuX3ByZUNvbGxlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5fcHJlQ29sbGVjdGlvbiA9IG5ldyBNb25nby5Db2xsZWN0aW9uKHRoaXMuX3ByZUNvbGxlY3Rpb25OYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3ByZUNvbGxlY3Rpb25OYW1lID0gdGhpcy5fcHJlQ29sbGVjdGlvbi5fbmFtZTtcbiAgICAgIH1cbiAgICAgIGNoZWNrKHRoaXMuX3ByZUNvbGxlY3Rpb25OYW1lLCBTdHJpbmcpO1xuXG4gICAgICBjcmVhdGVJbmRleCh0aGlzLl9wcmVDb2xsZWN0aW9uLCB7IGNyZWF0ZWRBdDogMSB9LCB7IGV4cGlyZUFmdGVyU2Vjb25kczogdGhpcy5jb250aW51ZVVwbG9hZFRUTCwgYmFja2dyb3VuZDogdHJ1ZSB9KTtcbiAgICAgIGNvbnN0IF9wcmVDb2xsZWN0aW9uQ3Vyc29yID0gdGhpcy5fcHJlQ29sbGVjdGlvbi5maW5kKHt9LCB7XG4gICAgICAgIGZpZWxkczoge1xuICAgICAgICAgIF9pZDogMSxcbiAgICAgICAgICBpc0ZpbmlzaGVkOiAxXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBfcHJlQ29sbGVjdGlvbkN1cnNvci5vYnNlcnZlKHtcbiAgICAgICAgYXN5bmMgY2hhbmdlZChkb2MpIHtcbiAgICAgICAgICBpZiAoZG9jLmlzRmluaXNoZWQpIHtcbiAgICAgICAgICAgIHNlbGYuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbX3ByZUNvbGxlY3Rpb25DdXJzb3Iub2JzZXJ2ZV0gW2NoYW5nZWRdOiAke2RvYy5faWR9YCk7XG4gICAgICAgICAgICBhd2FpdCBzZWxmLl9wcmVDb2xsZWN0aW9uLnJlbW92ZUFzeW5jKHtfaWQ6IGRvYy5faWR9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIHJlbW92ZWQoZG9jKSB7XG4gICAgICAgICAgLy8gRnJlZSBtZW1vcnkgYWZ0ZXIgdXBsb2FkIGlzIGRvbmVcbiAgICAgICAgICAvLyBPciBpZiB1cGxvYWQgaXMgdW5maW5pc2hlZFxuICAgICAgICAgIHNlbGYuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbX3ByZUNvbGxlY3Rpb25DdXJzb3Iub2JzZXJ2ZV0gW3JlbW92ZWRdOiAke2RvYy5faWR9YCk7XG4gICAgICAgICAgaWYgKGhlbHBlcnMuaXNPYmplY3Qoc2VsZi5fY3VycmVudFVwbG9hZHNbZG9jLl9pZF0pKSB7XG4gICAgICAgICAgICBzZWxmLl9jdXJyZW50VXBsb2Fkc1tkb2MuX2lkXS5zdG9wKCk7XG4gICAgICAgICAgICBzZWxmLl9jdXJyZW50VXBsb2Fkc1tkb2MuX2lkXS5lbmQoKTtcblxuICAgICAgICAgICAgLy8gV2UgY2FuIGJlIHVubHVja3kgdG8gcnVuIGludG8gYSByYWNlIGNvbmRpdGlvbiB3aGVyZSBhbm90aGVyIHNlcnZlciByZW1vdmVkIHRoaXMgZG9jdW1lbnQgYmVmb3JlIHRoZSBjaGFuZ2Ugb2YgYGlzRmluaXNoZWRgIGlzIHJlZ2lzdGVyZWQgb24gdGhpcyBzZXJ2ZXIuXG4gICAgICAgICAgICAvLyBUaGVyZWZvcmUgaXQncyBiZXR0ZXIgdG8gZG91YmxlLWNoZWNrIHdpdGggdGhlIG1haW4gY29sbGVjdGlvbiBpZiB0aGUgZmlsZSBpcyByZWZlcmVuY2VkIHRoZXJlLiBJc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL3ZlbGlvdmdyb3VwL01ldGVvci1GaWxlcy9pc3N1ZXMvNjcyXG4gICAgICAgICAgICBpZiAoIWRvYy5pc0ZpbmlzaGVkICYmIChhd2FpdCBzZWxmLmNvbGxlY3Rpb24uZmluZCh7IF9pZDogZG9jLl9pZCB9KS5jb3VudEFzeW5jKCkpID09PSAwKSB7XG4gICAgICAgICAgICAgIHNlbGYuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbX3ByZUNvbGxlY3Rpb25DdXJzb3Iub2JzZXJ2ZV0gW3JlbW92ZVVuZmluaXNoZWRVcGxvYWRdOiAke2RvYy5faWR9YCk7XG4gICAgICAgICAgICAgIHNlbGYuX2N1cnJlbnRVcGxvYWRzW2RvYy5faWRdLmFib3J0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRlbGV0ZSBzZWxmLl9jdXJyZW50VXBsb2Fkc1tkb2MuX2lkXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9jcmVhdGVTdHJlYW0gPSAoX2lkLCBwYXRoLCBvcHRzKSA9PiB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRVcGxvYWRzW19pZF0gPSBuZXcgV3JpdGVTdHJlYW0ocGF0aCwgb3B0cy5maWxlTGVuZ3RoLCBvcHRzLCB0aGlzLnBlcm1pc3Npb25zKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFRoaXMgbGl0dGxlIGZ1bmN0aW9uIGFsbG93cyB0byBjb250aW51ZSB1cGxvYWRcbiAgICAgIC8vIGV2ZW4gYWZ0ZXIgc2VydmVyIGlzIHJlc3RhcnRlZCAoKm5vdCBvbiBkZXYtc3RhZ2UqKVxuICAgICAgdGhpcy5fY29udGludWVVcGxvYWQgPSBhc3luYyAoX2lkKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50VXBsb2Fkc1tfaWRdICYmIHRoaXMuX2N1cnJlbnRVcGxvYWRzW19pZF0uZmlsZSkge1xuICAgICAgICAgIGlmICghdGhpcy5fY3VycmVudFVwbG9hZHNbX2lkXS5hYm9ydGVkICYmICF0aGlzLl9jdXJyZW50VXBsb2Fkc1tfaWRdLmVuZGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudFVwbG9hZHNbX2lkXS5maWxlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9jcmVhdGVTdHJlYW0oX2lkLCB0aGlzLl9jdXJyZW50VXBsb2Fkc1tfaWRdLmZpbGUuZmlsZS5wYXRoLCB0aGlzLl9jdXJyZW50VXBsb2Fkc1tfaWRdLmZpbGUpO1xuICAgICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50VXBsb2Fkc1tfaWRdLmZpbGU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29udFVwbGQgPSBhd2FpdCB0aGlzLl9wcmVDb2xsZWN0aW9uLmZpbmRPbmVBc3luYyh7X2lkfSk7XG4gICAgICAgIGlmIChjb250VXBsZCkge1xuICAgICAgICAgIHRoaXMuX2NyZWF0ZVN0cmVhbShfaWQsIGNvbnRVcGxkLmZpbGUucGF0aCwgY29udFVwbGQpO1xuICAgICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50VXBsb2Fkc1tfaWRdLmZpbGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc2NoZW1hKSB7XG4gICAgICB0aGlzLnNjaGVtYSA9IEZpbGVzQ29sbGVjdGlvbkNvcmUuc2NoZW1hO1xuICAgIH1cblxuICAgIGNoZWNrKHRoaXMuZGVidWcsIEJvb2xlYW4pO1xuICAgIGNoZWNrKHRoaXMuc2NoZW1hLCBPYmplY3QpO1xuICAgIGNoZWNrKHRoaXMucHVibGljLCBCb29sZWFuKTtcbiAgICBjaGVjayh0aGlzLmdldFVzZXIsIE1hdGNoLk9uZU9mKGZhbHNlLCBGdW5jdGlvbikpO1xuICAgIGNoZWNrKHRoaXMucHJvdGVjdGVkLCBNYXRjaC5PbmVPZihCb29sZWFuLCBGdW5jdGlvbikpO1xuICAgIGNoZWNrKHRoaXMuY2h1bmtTaXplLCBOdW1iZXIpO1xuICAgIGNoZWNrKHRoaXMuZG93bmxvYWRSb3V0ZSwgU3RyaW5nKTtcbiAgICBjaGVjayh0aGlzLm5hbWluZ0Z1bmN0aW9uLCBNYXRjaC5PbmVPZihmYWxzZSwgRnVuY3Rpb24pKTtcbiAgICBjaGVjayh0aGlzLm9uQmVmb3JlVXBsb2FkLCBNYXRjaC5PbmVPZihmYWxzZSwgRnVuY3Rpb24pKTtcbiAgICBjaGVjayh0aGlzLm9uSW5pdGlhdGVVcGxvYWQsIE1hdGNoLk9uZU9mKGZhbHNlLCBGdW5jdGlvbikpO1xuICAgIGNoZWNrKHRoaXMuYWxsb3dDbGllbnRDb2RlLCBCb29sZWFuKTtcblxuICAgIGlmICh0aGlzLnB1YmxpYyAmJiB0aGlzLnByb3RlY3RlZCkge1xuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig1MDAsIGBbRmlsZXNDb2xsZWN0aW9uLiR7dGhpcy5jb2xsZWN0aW9uTmFtZX1dOiBGaWxlcyBjYW4gbm90IGJlIHB1YmxpYyBhbmQgcHJvdGVjdGVkIGF0IHRoZSBzYW1lIHRpbWUhYCk7XG4gICAgfVxuXG4gICAgdGhpcy5fY2hlY2tBY2Nlc3MgPSBhc3luYyAoaHR0cCkgPT4ge1xuICAgICAgaWYgKHRoaXMucHJvdGVjdGVkKSB7XG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIGNvbnN0IHt1c2VyQXN5bmMsIHVzZXJJZH0gPSB0aGlzLl9nZXRVc2VyKGh0dHApO1xuXG4gICAgICAgIGlmIChoZWxwZXJzLmlzRnVuY3Rpb24odGhpcy5wcm90ZWN0ZWQpKSB7XG4gICAgICAgICAgbGV0IGZpbGVSZWY7XG4gICAgICAgICAgaWYgKGhlbHBlcnMuaXNPYmplY3QoaHR0cC5wYXJhbXMpICYmICBodHRwLnBhcmFtcy5faWQpIHtcbiAgICAgICAgICAgIGZpbGVSZWYgPSBhd2FpdCB0aGlzLmNvbGxlY3Rpb24uZmluZE9uZUFzeW5jKGh0dHAucGFyYW1zLl9pZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzdWx0ID0gaHR0cCA/IGF3YWl0IHRoaXMucHJvdGVjdGVkLmNhbGwoT2JqZWN0LmFzc2lnbihodHRwLCB7dXNlckFzeW5jLCB1c2VySWR9KSwgKGZpbGVSZWYgfHwgbnVsbCkpIDogYXdhaXQgdGhpcy5wcm90ZWN0ZWQuY2FsbCh7dXNlckFzeW5jLCB1c2VySWR9LCAoZmlsZVJlZiB8fCBudWxsKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0ID0gISF1c2VySWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKGh0dHAgJiYgKHJlc3VsdCA9PT0gdHJ1ZSkpIHx8ICFodHRwKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByYyA9IGhlbHBlcnMuaXNOdW1iZXIocmVzdWx0KSA/IHJlc3VsdCA6IDQwMTtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1tGaWxlc0NvbGxlY3Rpb24uX2NoZWNrQWNjZXNzXSBXQVJOOiBBY2Nlc3MgZGVuaWVkIScpO1xuICAgICAgICBpZiAoaHR0cCkge1xuICAgICAgICAgIGNvbnN0IHRleHQgPSAnQWNjZXNzIGRlbmllZCEnO1xuICAgICAgICAgIGlmICghaHR0cC5yZXNwb25zZS5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgaHR0cC5yZXNwb25zZS53cml0ZUhlYWQocmMsIHtcbiAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3BsYWluJyxcbiAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogdGV4dC5sZW5ndGhcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghaHR0cC5yZXNwb25zZS5maW5pc2hlZCkge1xuICAgICAgICAgICAgaHR0cC5yZXNwb25zZS5lbmQodGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHRoaXMuX21ldGhvZE5hbWVzID0ge1xuICAgICAgX0Fib3J0OiBgX0ZpbGVzQ29sbGVjdGlvbkFib3J0XyR7dGhpcy5jb2xsZWN0aW9uTmFtZX1gLFxuICAgICAgX1dyaXRlOiBgX0ZpbGVzQ29sbGVjdGlvbldyaXRlXyR7dGhpcy5jb2xsZWN0aW9uTmFtZX1gLFxuICAgICAgX1N0YXJ0OiBgX0ZpbGVzQ29sbGVjdGlvblN0YXJ0XyR7dGhpcy5jb2xsZWN0aW9uTmFtZX1gLFxuICAgICAgX1JlbW92ZTogYF9GaWxlc0NvbGxlY3Rpb25SZW1vdmVfJHt0aGlzLmNvbGxlY3Rpb25OYW1lfWBcbiAgICB9O1xuXG4gICAgdGhpcy5vbignX2hhbmRsZVVwbG9hZCcsIHRoaXMuX2hhbmRsZVVwbG9hZCk7XG4gICAgdGhpcy5vbignX2ZpbmlzaFVwbG9hZCcsIHRoaXMuX2ZpbmlzaFVwbG9hZCk7XG4gICAgdGhpcy5faGFuZGxlVXBsb2FkU3luYyA9IE1ldGVvci53cmFwQXN5bmModGhpcy5faGFuZGxlVXBsb2FkLmJpbmQodGhpcykpO1xuXG4gICAgaWYgKHRoaXMuZGlzYWJsZVVwbG9hZCAmJiB0aGlzLmRpc2FibGVEb3dubG9hZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBXZWJBcHAuY29ubmVjdEhhbmRsZXJzLnVzZShhc3luYyAoaHR0cFJlcSwgaHR0cFJlc3AsIG5leHQpID0+IHtcbiAgICAgIGlmICh0aGlzLmFsbG93ZWRPcmlnaW5zICYmIGh0dHBSZXEuX3BhcnNlZFVybC5wYXRoLmluY2x1ZGVzKGAke3RoaXMuZG93bmxvYWRSb3V0ZX0vYCkgJiYgIWh0dHBSZXNwLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmFsbG93ZWRPcmlnaW5zLnRlc3QoaHR0cFJlcS5oZWFkZXJzLm9yaWdpbikpIHtcbiAgICAgICAgICBodHRwUmVzcC5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcbiAgICAgICAgICBodHRwUmVzcC5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIGh0dHBSZXEuaGVhZGVycy5vcmlnaW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGh0dHBSZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICAgICAgICBodHRwUmVzcC5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULCBQT1NULCBPUFRJT05TJyk7XG4gICAgICAgICAgaHR0cFJlc3Auc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ1JhbmdlLCBDb250ZW50LVR5cGUsIHgtbXRvaywgeC1zdGFydCwgeC1jaHVua2lkLCB4LWZpbGVpZCwgeC1lb2YnKTtcbiAgICAgICAgICBodHRwUmVzcC5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUV4cG9zZS1IZWFkZXJzJywgJ0FjY2VwdC1SYW5nZXMsIENvbnRlbnQtRW5jb2RpbmcsIENvbnRlbnQtTGVuZ3RoLCBDb250ZW50LVJhbmdlJyk7XG4gICAgICAgICAgaHR0cFJlc3Auc2V0SGVhZGVyKCdBbGxvdycsICdHRVQsIFBPU1QsIE9QVElPTlMnKTtcbiAgICAgICAgICBodHRwUmVzcC53cml0ZUhlYWQoMjAwKTtcbiAgICAgICAgICBodHRwUmVzcC5lbmQoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmRpc2FibGVVcGxvYWQgJiYgaHR0cFJlcS5fcGFyc2VkVXJsLnBhdGguaW5jbHVkZXMoYCR7dGhpcy5kb3dubG9hZFJvdXRlfS8ke3RoaXMuY29sbGVjdGlvbk5hbWV9L19fdXBsb2FkYCkpIHtcbiAgICAgICAgaWYgKGh0dHBSZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaGFuZGxlRXJyb3IgPSAoX2Vycm9yKSA9PiB7XG4gICAgICAgICAgbGV0IGVycm9yID0gX2Vycm9yO1xuICAgICAgICAgIE1ldGVvci5fZGVidWcoJ1tGaWxlc0NvbGxlY3Rpb25dIFtVcGxvYWRdIFtIVFRQXSBFeGNlcHRpb246JywgZXJyb3IpO1xuXG4gICAgICAgICAgaWYgKCFodHRwUmVzcC5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgaHR0cFJlc3Aud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFodHRwUmVzcC5maW5pc2hlZCkge1xuICAgICAgICAgICAgaWYgKGhlbHBlcnMuaXNPYmplY3QoZXJyb3IpICYmIGhlbHBlcnMuaXNGdW5jdGlvbihlcnJvci50b1N0cmluZykpIHtcbiAgICAgICAgICAgICAgZXJyb3IgPSBlcnJvci50b1N0cmluZygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWhlbHBlcnMuaXNTdHJpbmcoZXJyb3IpKSB7XG4gICAgICAgICAgICAgIGVycm9yID0gJ1VuZXhwZWN0ZWQgZXJyb3IhJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaHR0cFJlc3AuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3IgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgYm9keSA9ICcnO1xuICAgICAgICBjb25zdCBoYW5kbGVEYXRhID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgb3B0cztcbiAgICAgICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgICAgICBsZXQgdXNlciA9IHRoaXMuX2dldFVzZXIoe3JlcXVlc3Q6IGh0dHBSZXEsIHJlc3BvbnNlOiBodHRwUmVzcH0pO1xuXG4gICAgICAgICAgICBpZiAoaHR0cFJlcS5oZWFkZXJzWyd4LXN0YXJ0J10gIT09ICcxJykge1xuICAgICAgICAgICAgICAvLyBDSFVOSyBVUExPQUQgU0NFTkFSSU86XG4gICAgICAgICAgICAgIG9wdHMgPSB7XG4gICAgICAgICAgICAgICAgZmlsZUlkOiB0aGlzLnNhbml0aXplKGh0dHBSZXEuaGVhZGVyc1sneC1maWxlaWQnXSwgMjAsICdhJylcbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICBpZiAoaHR0cFJlcS5oZWFkZXJzWyd4LWVvZiddID09PSAnMScpIHtcbiAgICAgICAgICAgICAgICBvcHRzLmVvZiA9IHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0cy5iaW5EYXRhID0gQnVmZmVyLmZyb20oYm9keSwgJ2Jhc2U2NCcpO1xuICAgICAgICAgICAgICAgIG9wdHMuY2h1bmtJZCA9IHBhcnNlSW50KGh0dHBSZXEuaGVhZGVyc1sneC1jaHVua2lkJ10pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgX2NvbnRpbnVlVXBsb2FkID0gYXdhaXQgdGhpcy5fY29udGludWVVcGxvYWQob3B0cy5maWxlSWQpO1xuICAgICAgICAgICAgICBpZiAoIV9jb250aW51ZVVwbG9hZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDA4LCAnQ2FuXFwndCBjb250aW51ZSB1cGxvYWQsIHNlc3Npb24gZXhwaXJlZC4gU3RhcnQgdXBsb2FkIGFnYWluLicpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgKHtyZXN1bHQsIG9wdHN9ID0gYXdhaXQgdGhpcy5fcHJlcGFyZVVwbG9hZChPYmplY3QuYXNzaWduKG9wdHMsIF9jb250aW51ZVVwbG9hZCksIHVzZXIudXNlcklkLCAnSFRUUCcpKTtcblxuICAgICAgICAgICAgICBpZiAob3B0cy5lb2YpIHtcbiAgICAgICAgICAgICAgICAvLyBGSU5JU0ggVVBMT0FEIFNDRU5BUklPOlxuICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZVVwbG9hZChyZXN1bHQsIG9wdHMsIChfZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgIGxldCBlcnJvciA9IF9lcnJvcjtcbiAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWh0dHBSZXNwLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgaHR0cFJlc3Aud3JpdGVIZWFkKDUwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWh0dHBSZXNwLmZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGhlbHBlcnMuaXNPYmplY3QoZXJyb3IpICYmIGhlbHBlcnMuaXNGdW5jdGlvbihlcnJvci50b1N0cmluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yID0gZXJyb3IudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoIWhlbHBlcnMuaXNTdHJpbmcoZXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciA9ICdVbmV4cGVjdGVkIGVycm9yISc7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgaHR0cFJlc3AuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3IgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmICghaHR0cFJlc3AuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaHR0cFJlc3Aud3JpdGVIZWFkKDIwMCk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmIChoZWxwZXJzLmlzT2JqZWN0KHJlc3VsdC5maWxlKSAmJiByZXN1bHQuZmlsZS5tZXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5maWxlLm1ldGEgPSBmaXhKU09OU3RyaW5naWZ5KHJlc3VsdC5maWxlLm1ldGEpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZiAoIWh0dHBSZXNwLmZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGh0dHBSZXNwLmVuZChKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB0aGlzLmVtaXQoJ19oYW5kbGVVcGxvYWQnLCByZXN1bHQsIG9wdHMsIG5vb3ApO1xuXG4gICAgICAgICAgICAgIGlmICghaHR0cFJlc3AuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgICAgICBodHRwUmVzcC53cml0ZUhlYWQoMjA0KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoIWh0dHBSZXNwLmZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgICAgaHR0cFJlc3AuZW5kKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFNUQVJUIFNDRU5BUklPOlxuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG9wdHMgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgICAgICAgICB9IGNhdGNoIChqc29uRXJyKSB7XG4gICAgICAgICAgICAgICAgTWV0ZW9yLl9kZWJ1ZygnQ2FuXFwndCBwYXJzZSBpbmNvbWluZyBKU09OIGZyb20gQ2xpZW50IG9uIFsuaW5zZXJ0KCkgfCB1cGxvYWRdLCBzb21ldGhpbmcgd2VudCB3cm9uZyEnLCBqc29uRXJyKTtcbiAgICAgICAgICAgICAgICBvcHRzID0ge2ZpbGU6IHt9fTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICghaGVscGVycy5pc09iamVjdChvcHRzLmZpbGUpKSB7XG4gICAgICAgICAgICAgICAgb3B0cy5maWxlID0ge307XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAob3B0cy5maWxlSWQpIHtcbiAgICAgICAgICAgICAgICBvcHRzLmZpbGVJZCA9IHRoaXMuc2FuaXRpemUob3B0cy5maWxlSWQsIDIwLCAnYScpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdGhpcy5fZGVidWcoYFtGaWxlc0NvbGxlY3Rpb25dIFtGaWxlIFN0YXJ0IEhUVFBdICR7b3B0cy5maWxlLm5hbWUgfHwgJ1tuby1uYW1lXSd9IC0gJHtvcHRzLmZpbGVJZH1gKTtcbiAgICAgICAgICAgICAgaWYgKGhlbHBlcnMuaXNPYmplY3Qob3B0cy5maWxlKSAmJiBvcHRzLmZpbGUubWV0YSkge1xuICAgICAgICAgICAgICAgIG9wdHMuZmlsZS5tZXRhID0gZml4SlNPTlBhcnNlKG9wdHMuZmlsZS5tZXRhKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIG9wdHMuX19fcyA9IHRydWU7XG4gICAgICAgICAgICAgICh7cmVzdWx0fSA9IGF3YWl0IHRoaXMuX3ByZXBhcmVVcGxvYWQoaGVscGVycy5jbG9uZShvcHRzKSwgdXNlci51c2VySWQsICdIVFRQIFN0YXJ0IE1ldGhvZCcpKTtcblxuICAgICAgICAgICAgICBsZXQgcmVzO1xuICAgICAgICAgICAgICByZXMgPSBhd2FpdCB0aGlzLmNvbGxlY3Rpb24uZmluZE9uZUFzeW5jKHJlc3VsdC5faWQpO1xuXG4gICAgICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMCwgJ0NhblxcJ3Qgc3RhcnQgdXBsb2FkLCBkYXRhIHN1YnN0aXR1dGlvbiBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIG9wdHMuX2lkID0gb3B0cy5maWxlSWQ7XG4gICAgICAgICAgICAgIG9wdHMuY3JlYXRlZEF0ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgb3B0cy5tYXhMZW5ndGggPSBvcHRzLmZpbGVMZW5ndGg7XG5cbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5fcHJlQ29sbGVjdGlvbi5pbnNlcnRBc3luYyhoZWxwZXJzLm9taXQob3B0cywgJ19fX3MnKSk7XG4gICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVN0cmVhbShyZXN1bHQuX2lkLCByZXN1bHQucGF0aCwgaGVscGVycy5vbWl0KG9wdHMsICdfX19zJykpO1xuXG4gICAgICAgICAgICAgIGlmIChvcHRzLnJldHVybk1ldGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWh0dHBSZXNwLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICAgICAgICBodHRwUmVzcC53cml0ZUhlYWQoMjAwKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWh0dHBSZXNwLmZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICBodHRwUmVzcC5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICB1cGxvYWRSb3V0ZTogYCR7dGhpcy5kb3dubG9hZFJvdXRlfS8ke3RoaXMuY29sbGVjdGlvbk5hbWV9L19fdXBsb2FkYCxcbiAgICAgICAgICAgICAgICAgICAgZmlsZTogcmVzdWx0XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghaHR0cFJlc3AuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICAgICAgICAgIGh0dHBSZXNwLndyaXRlSGVhZCgyMDQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghaHR0cFJlc3AuZmluaXNoZWQpIHtcbiAgICAgICAgICAgICAgICAgIGh0dHBSZXNwLmVuZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGh0dHBSZXNwRXJyKSB7XG4gICAgICAgICAgICBoYW5kbGVFcnJvcihodHRwUmVzcEVycik7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGh0dHBSZXEuc2V0VGltZW91dCgyMDAwMCwgaGFuZGxlRXJyb3IpO1xuICAgICAgICBpZiAodHlwZW9mIGh0dHBSZXEuYm9keSA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LmtleXMoaHR0cFJlcS5ib2R5KS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkoaHR0cFJlcS5ib2R5KTtcbiAgICAgICAgICBoYW5kbGVEYXRhKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaHR0cFJlcS5vbignZGF0YScsIChkYXRhKSA9PiBib3VuZCgoKSA9PiB7XG4gICAgICAgICAgICBib2R5ICs9IGRhdGE7XG4gICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgaHR0cFJlcS5vbignZW5kJywgKCkgPT4gYm91bmQoKCkgPT4ge1xuICAgICAgICAgICAgaGFuZGxlRGF0YSgpO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5kaXNhYmxlRG93bmxvYWQpIHtcbiAgICAgICAgbGV0IHVyaTtcblxuICAgICAgICBpZiAoIXRoaXMucHVibGljKSB7XG4gICAgICAgICAgaWYgKGh0dHBSZXEuX3BhcnNlZFVybC5wYXRoLmluY2x1ZGVzKGAke3RoaXMuZG93bmxvYWRSb3V0ZX0vJHt0aGlzLmNvbGxlY3Rpb25OYW1lfWApKSB7XG4gICAgICAgICAgICB1cmkgPSBodHRwUmVxLl9wYXJzZWRVcmwucGF0aC5yZXBsYWNlKGAke3RoaXMuZG93bmxvYWRSb3V0ZX0vJHt0aGlzLmNvbGxlY3Rpb25OYW1lfWAsICcnKTtcbiAgICAgICAgICAgIGlmICh1cmkuaW5kZXhPZignLycpID09PSAwKSB7XG4gICAgICAgICAgICAgIHVyaSA9IHVyaS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHVyaXMgPSB1cmkuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgIGlmICh1cmlzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgX2lkOiB1cmlzWzBdLFxuICAgICAgICAgICAgICAgIHF1ZXJ5OiBodHRwUmVxLl9wYXJzZWRVcmwucXVlcnkgPyBub2RlUXMucGFyc2UoaHR0cFJlcS5fcGFyc2VkVXJsLnF1ZXJ5KSA6IHt9LFxuICAgICAgICAgICAgICAgIG5hbWU6IHVyaXNbMl0uc3BsaXQoJz8nKVswXSxcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiB1cmlzWzFdXG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgY29uc3QgaHR0cCA9IHtyZXF1ZXN0OiBodHRwUmVxLCByZXNwb25zZTogaHR0cFJlc3AsIHBhcmFtc307XG5cbiAgICAgICAgICAgICAgaWYgKHRoaXMuaW50ZXJjZXB0UmVxdWVzdCAmJiBoZWxwZXJzLmlzRnVuY3Rpb24odGhpcy5pbnRlcmNlcHRSZXF1ZXN0KSAmJiAoYXdhaXQgdGhpcy5pbnRlcmNlcHRSZXF1ZXN0KGh0dHApKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChhd2FpdCB0aGlzLl9jaGVja0FjY2VzcyhodHRwKSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZG93bmxvYWQoaHR0cCwgdXJpc1sxXSwgYXdhaXQgdGhpcy5jb2xsZWN0aW9uLmZpbmRPbmVBc3luYyh1cmlzWzBdKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoaHR0cFJlcS5fcGFyc2VkVXJsLnBhdGguaW5jbHVkZXMoYCR7dGhpcy5kb3dubG9hZFJvdXRlfWApKSB7XG4gICAgICAgICAgICB1cmkgPSBodHRwUmVxLl9wYXJzZWRVcmwucGF0aC5yZXBsYWNlKGAke3RoaXMuZG93bmxvYWRSb3V0ZX1gLCAnJyk7XG4gICAgICAgICAgICBpZiAodXJpLmluZGV4T2YoJy8nKSA9PT0gMCkge1xuICAgICAgICAgICAgICB1cmkgPSB1cmkuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB1cmlzID0gdXJpLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICBsZXQgX2ZpbGUgPSB1cmlzW3VyaXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBpZiAoX2ZpbGUpIHtcbiAgICAgICAgICAgICAgbGV0IHZlcnNpb247XG4gICAgICAgICAgICAgIGlmIChfZmlsZS5pbmNsdWRlcygnLScpKSB7XG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IF9maWxlLnNwbGl0KCctJylbMF07XG4gICAgICAgICAgICAgICAgX2ZpbGUgPSBfZmlsZS5zcGxpdCgnLScpWzFdLnNwbGl0KCc/JylbMF07XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9ICdvcmlnaW5hbCc7XG4gICAgICAgICAgICAgICAgX2ZpbGUgPSBfZmlsZS5zcGxpdCgnPycpWzBdO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiBodHRwUmVxLl9wYXJzZWRVcmwucXVlcnkgPyBub2RlUXMucGFyc2UoaHR0cFJlcS5fcGFyc2VkVXJsLnF1ZXJ5KSA6IHt9LFxuICAgICAgICAgICAgICAgIGZpbGU6IF9maWxlLFxuICAgICAgICAgICAgICAgIF9pZDogX2ZpbGUuc3BsaXQoJy4nKVswXSxcbiAgICAgICAgICAgICAgICB2ZXJzaW9uLFxuICAgICAgICAgICAgICAgIG5hbWU6IF9maWxlXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGNvbnN0IGh0dHAgPSB7cmVxdWVzdDogaHR0cFJlcSwgcmVzcG9uc2U6IGh0dHBSZXNwLCBwYXJhbXN9O1xuICAgICAgICAgICAgICBpZiAodGhpcy5pbnRlcmNlcHRSZXF1ZXN0ICYmIGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLmludGVyY2VwdFJlcXVlc3QpICYmIChhd2FpdCB0aGlzLmludGVyY2VwdFJlcXVlc3QoaHR0cCkpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMuZG93bmxvYWQoaHR0cCwgdmVyc2lvbiwgYXdhaXQgdGhpcy5jb2xsZWN0aW9uLmZpbmRPbmVBc3luYyhwYXJhbXMuX2lkKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbmV4dCgpO1xuICAgIH0pO1xuXG4gICAgaWYgKCF0aGlzLmRpc2FibGVVcGxvYWQpIHtcbiAgICAgIGNvbnN0IF9tZXRob2RzID0ge307XG5cbiAgICAgIC8vIE1ldGhvZCB1c2VkIHRvIHJlbW92ZSBmaWxlXG4gICAgICAvLyBmcm9tIENsaWVudCBzaWRlXG4gICAgICBfbWV0aG9kc1t0aGlzLl9tZXRob2ROYW1lcy5fUmVtb3ZlXSA9IGFzeW5jIGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgICAgICBjaGVjayhzZWxlY3RvciwgTWF0Y2guT25lT2YoU3RyaW5nLCBPYmplY3QpKTtcbiAgICAgICAgc2VsZi5fZGVidWcoYFtGaWxlc0NvbGxlY3Rpb25dIFtVbmxpbmsgTWV0aG9kXSBbLnJlbW92ZSgke3NlbGVjdG9yfSldYCk7XG5cbiAgICAgICAgaWYgKHNlbGYuYWxsb3dDbGllbnRDb2RlKSB7XG4gICAgICAgICAgaWYgKHNlbGYub25CZWZvcmVSZW1vdmUgJiYgaGVscGVycy5pc0Z1bmN0aW9uKHNlbGYub25CZWZvcmVSZW1vdmUpKSB7XG4gICAgICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLnVzZXJJZDtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJGdW5jcyA9IHtcbiAgICAgICAgICAgICAgdXNlcklkOiB0aGlzLnVzZXJJZCxcbiAgICAgICAgICAgICAgdXNlckFzeW5jKCl7XG4gICAgICAgICAgICAgICAgaWYgKE1ldGVvci51c2Vycykge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIE1ldGVvci51c2Vycy5maW5kT25lQXN5bmModXNlcklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmICghKGF3YWl0IHNlbGYub25CZWZvcmVSZW1vdmUuY2FsbCh1c2VyRnVuY3MsIChzZWxmLmZpbmQoc2VsZWN0b3IpIHx8IG51bGwpKSkpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsICdbRmlsZXNDb2xsZWN0aW9uXSBbcmVtb3ZlXSBOb3QgcGVybWl0dGVkIScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGN1cnNvciA9IHNlbGYuZmluZChzZWxlY3Rvcik7XG4gICAgICAgICAgaWYgKChhd2FpdCBjdXJzb3IuY291bnRBc3luYygpKSA+IDApIHtcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlQXN5bmMoc2VsZWN0b3IpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDA0LCAnQ3Vyc29yIGlzIGVtcHR5LCBubyBmaWxlcyBpcyByZW1vdmVkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDUsICdbRmlsZXNDb2xsZWN0aW9uXSBbcmVtb3ZlXSBSdW5uaW5nIGNvZGUgb24gYSBjbGllbnQgaXMgbm90IGFsbG93ZWQhJyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cblxuICAgICAgLy8gTWV0aG9kIHVzZWQgdG8gcmVjZWl2ZSBcImZpcnN0IGJ5dGVcIiBvZiB1cGxvYWRcbiAgICAgIC8vIGFuZCBhbGwgZmlsZSdzIG1ldGEtZGF0YSwgc29cbiAgICAgIC8vIGl0IHdvbid0IGJlIHRyYW5zZmVycmVkIHdpdGggZXZlcnkgY2h1bmtcbiAgICAgIC8vIEJhc2ljYWxseSBpdCBwcmVwYXJlcyBldmVyeXRoaW5nXG4gICAgICAvLyBTbyB1c2VyIGNhbiBwYXVzZS9kaXNjb25uZWN0IGFuZFxuICAgICAgLy8gY29udGludWUgdXBsb2FkIGxhdGVyLCBkdXJpbmcgYGNvbnRpbnVlVXBsb2FkVFRMYFxuICAgICAgX21ldGhvZHNbdGhpcy5fbWV0aG9kTmFtZXMuX1N0YXJ0XSA9IGFzeW5jIGZ1bmN0aW9uIChvcHRzLCByZXR1cm5NZXRhKSB7XG4gICAgICAgIGNoZWNrKG9wdHMsIHtcbiAgICAgICAgICBmaWxlOiBPYmplY3QsXG4gICAgICAgICAgZmlsZUlkOiBTdHJpbmcsXG4gICAgICAgICAgRlNOYW1lOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgICAgIGNodW5rU2l6ZTogTnVtYmVyLFxuICAgICAgICAgIGZpbGVMZW5ndGg6IE51bWJlclxuICAgICAgICB9KTtcblxuICAgICAgICBjaGVjayhyZXR1cm5NZXRhLCBNYXRjaC5PcHRpb25hbChCb29sZWFuKSk7XG5cbiAgICAgICAgb3B0cy5maWxlSWQgPSBzZWxmLnNhbml0aXplKG9wdHMuZmlsZUlkLCAyMCwgJ2EnKTtcblxuICAgICAgICBzZWxmLl9kZWJ1ZyhgW0ZpbGVzQ29sbGVjdGlvbl0gW0ZpbGUgU3RhcnQgTWV0aG9kXSAke29wdHMuZmlsZS5uYW1lfSAtICR7b3B0cy5maWxlSWR9YCk7XG4gICAgICAgIG9wdHMuX19fcyA9IHRydWU7XG4gICAgICAgIGNvbnN0IHsgcmVzdWx0IH0gPSBhd2FpdCBzZWxmLl9wcmVwYXJlVXBsb2FkKGhlbHBlcnMuY2xvbmUob3B0cyksIHRoaXMudXNlcklkLCAnRERQIFN0YXJ0IE1ldGhvZCcpO1xuXG4gICAgICAgIGlmIChhd2FpdCBzZWxmLmNvbGxlY3Rpb24uZmluZE9uZUFzeW5jKHJlc3VsdC5faWQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDAsICdDYW5cXCd0IHN0YXJ0IHVwbG9hZCwgZGF0YSBzdWJzdGl0dXRpb24gZGV0ZWN0ZWQhJyk7XG4gICAgICAgIH1cblxuICAgICAgICBvcHRzLl9pZCA9IG9wdHMuZmlsZUlkO1xuICAgICAgICBvcHRzLmNyZWF0ZWRBdCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIG9wdHMubWF4TGVuZ3RoID0gb3B0cy5maWxlTGVuZ3RoO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHNlbGYuX3ByZUNvbGxlY3Rpb24uaW5zZXJ0QXN5bmMoaGVscGVycy5vbWl0KG9wdHMsICdfX19zJykpO1xuICAgICAgICAgIHNlbGYuX2NyZWF0ZVN0cmVhbShyZXN1bHQuX2lkLCByZXN1bHQucGF0aCwgaGVscGVycy5vbWl0KG9wdHMsICdfX19zJykpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgc2VsZi5fZGVidWcoYFtGaWxlc0NvbGxlY3Rpb25dIFtGaWxlIFN0YXJ0IE1ldGhvZF0gW0VYQ0VQVElPTjpdICR7b3B0cy5maWxlLm5hbWV9IC0gJHtvcHRzLmZpbGVJZH1gLCBlKTtcbiAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDUwMCwgJ0NhblxcJ3Qgc3RhcnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXR1cm5NZXRhKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHVwbG9hZFJvdXRlOiBgJHtzZWxmLmRvd25sb2FkUm91dGV9LyR7c2VsZi5jb2xsZWN0aW9uTmFtZX0vX191cGxvYWRgLFxuICAgICAgICAgICAgZmlsZTogcmVzdWx0XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG5cblxuICAgICAgLy8gTWV0aG9kIHVzZWQgdG8gd3JpdGUgZmlsZSBjaHVua3NcbiAgICAgIC8vIGl0IHJlY2VpdmVzIHZlcnkgbGltaXRlZCBhbW91bnQgb2YgbWV0YS1kYXRhXG4gICAgICAvLyBUaGlzIG1ldGhvZCBhbHNvIHJlc3BvbnNpYmxlIGZvciBFT0ZcbiAgICAgIF9tZXRob2RzW3RoaXMuX21ldGhvZE5hbWVzLl9Xcml0ZV0gPSBhc3luYyBmdW5jdGlvbiAoX29wdHMpIHtcbiAgICAgICAgbGV0IG9wdHMgPSBfb3B0cztcbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgY2hlY2sob3B0cywge1xuICAgICAgICAgIGVvZjogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgICAgICAgZmlsZUlkOiBTdHJpbmcsXG4gICAgICAgICAgYmluRGF0YTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgICAgICBjaHVua0lkOiBNYXRjaC5PcHRpb25hbChOdW1iZXIpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9wdHMuZmlsZUlkID0gc2VsZi5zYW5pdGl6ZShvcHRzLmZpbGVJZCwgMjAsICdhJyk7XG5cbiAgICAgICAgaWYgKG9wdHMuYmluRGF0YSkge1xuICAgICAgICAgIG9wdHMuYmluRGF0YSA9IEJ1ZmZlci5mcm9tKG9wdHMuYmluRGF0YSwgJ2Jhc2U2NCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgX2NvbnRpbnVlVXBsb2FkID0gYXdhaXQgc2VsZi5fY29udGludWVVcGxvYWQob3B0cy5maWxlSWQpO1xuICAgICAgICBpZiAoIV9jb250aW51ZVVwbG9hZCkge1xuICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDA4LCAnQ2FuXFwndCBjb250aW51ZSB1cGxvYWQsIHNlc3Npb24gZXhwaXJlZC4gU3RhcnQgdXBsb2FkIGFnYWluLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgKHtyZXN1bHQsIG9wdHN9ID0gYXdhaXQgc2VsZi5fcHJlcGFyZVVwbG9hZChPYmplY3QuYXNzaWduKG9wdHMsIF9jb250aW51ZVVwbG9hZCksIHRoaXMudXNlcklkLCAnRERQJykpO1xuXG4gICAgICAgIGlmIChvcHRzLmVvZikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5faGFuZGxlVXBsb2FkU3luYyhyZXN1bHQsIG9wdHMpO1xuICAgICAgICAgIH0gY2F0Y2ggKGhhbmRsZVVwbG9hZEVycikge1xuICAgICAgICAgICAgc2VsZi5fZGVidWcoJ1tGaWxlc0NvbGxlY3Rpb25dIFtXcml0ZSBNZXRob2RdIFtERFBdIEV4Y2VwdGlvbjonLCBoYW5kbGVVcGxvYWRFcnIpO1xuICAgICAgICAgICAgdGhyb3cgaGFuZGxlVXBsb2FkRXJyO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLmVtaXQoJ19oYW5kbGVVcGxvYWQnLCByZXN1bHQsIG9wdHMsIG5vb3ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcblxuICAgICAgLy8gTWV0aG9kIHVzZWQgdG8gQWJvcnQgdXBsb2FkXG4gICAgICAvLyAtIEZyZWVpbmcgbWVtb3J5IGJ5IGVuZGluZyB3cml0YWJsZVN0cmVhbXNcbiAgICAgIC8vIC0gUmVtb3ZpbmcgdGVtcG9yYXJ5IHJlY29yZCBmcm9tIEBfcHJlQ29sbGVjdGlvblxuICAgICAgLy8gLSBSZW1vdmluZyByZWNvcmQgZnJvbSBAY29sbGVjdGlvblxuICAgICAgLy8gLSAudW5saW5rKClpbmcgY2h1bmtzIGZyb20gRlNcbiAgICAgIF9tZXRob2RzW3RoaXMuX21ldGhvZE5hbWVzLl9BYm9ydF0gPSBhc3luYyBmdW5jdGlvbiAoX2lkKSB7XG4gICAgICAgIGNoZWNrKF9pZCwgU3RyaW5nKTtcblxuICAgICAgICBjb25zdCBfY29udGludWVVcGxvYWQgPSBhd2FpdCBzZWxmLl9jb250aW51ZVVwbG9hZChfaWQpO1xuICAgICAgICBzZWxmLl9kZWJ1ZyhgW0ZpbGVzQ29sbGVjdGlvbl0gW0Fib3J0IE1ldGhvZF06ICR7X2lkfSAtICR7KGhlbHBlcnMuaXNPYmplY3QoX2NvbnRpbnVlVXBsb2FkLmZpbGUpID8gX2NvbnRpbnVlVXBsb2FkLmZpbGUucGF0aCA6ICcnKX1gKTtcblxuICAgICAgICBpZiAoc2VsZi5fY3VycmVudFVwbG9hZHMgJiYgc2VsZi5fY3VycmVudFVwbG9hZHNbX2lkXSkge1xuICAgICAgICAgIHNlbGYuX2N1cnJlbnRVcGxvYWRzW19pZF0uc3RvcCgpO1xuICAgICAgICAgIHNlbGYuX2N1cnJlbnRVcGxvYWRzW19pZF0uYWJvcnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfY29udGludWVVcGxvYWQpIHtcbiAgICAgICAgICBhd2FpdCBzZWxmLl9wcmVDb2xsZWN0aW9uLnJlbW92ZUFzeW5jKHtfaWR9KTtcbiAgICAgICAgICBhd2FpdCBzZWxmLnJlbW92ZUFzeW5jKHtfaWR9KTtcblxuXG4gICAgICAgICAgaWYgKGhlbHBlcnMuaXNPYmplY3QoX2NvbnRpbnVlVXBsb2FkLmZpbGUpICYmIF9jb250aW51ZVVwbG9hZC5maWxlLnBhdGgpIHtcbiAgICAgICAgICAgIGF3YWl0IHNlbGYudW5saW5rKHtfaWQsIHBhdGg6IF9jb250aW51ZVVwbG9hZC5maWxlLnBhdGh9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuXG4gICAgICBNZXRlb3IubWV0aG9kcyhfbWV0aG9kcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlck9mIEZpbGVzQ29sbGVjdGlvblxuICAgKiBAbmFtZSBfcHJlcGFyZVVwbG9hZFxuICAgKiBAc3VtbWFyeSBJbnRlcm5hbCBtZXRob2QuIFVzZWQgdG8gb3B0aW1pemUgcmVjZWl2ZWQgZGF0YSBhbmQgY2hlY2sgdXBsb2FkIHBlcm1pc3Npb25cbiAgICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0Pn1cbiAgICovXG4gIGFzeW5jIF9wcmVwYXJlVXBsb2FkKG9wdHMgPSB7fSwgdXNlcklkLCB0cmFuc3BvcnQpIHtcbiAgICBsZXQgY3R4O1xuICAgIGlmICghaGVscGVycy5pc0Jvb2xlYW4ob3B0cy5lb2YpKSB7XG4gICAgICBvcHRzLmVvZiA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghb3B0cy5iaW5EYXRhKSB7XG4gICAgICBvcHRzLmJpbkRhdGEgPSAnRU9GJztcbiAgICB9XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNOdW1iZXIob3B0cy5jaHVua0lkKSkge1xuICAgICAgb3B0cy5jaHVua0lkID0gLTE7XG4gICAgfVxuXG4gICAgaWYgKCFoZWxwZXJzLmlzU3RyaW5nKG9wdHMuRlNOYW1lKSkge1xuICAgICAgb3B0cy5GU05hbWUgPSBvcHRzLmZpbGVJZDtcbiAgICB9XG5cbiAgICB0aGlzLl9kZWJ1ZyhgW0ZpbGVzQ29sbGVjdGlvbl0gW1VwbG9hZF0gWyR7dHJhbnNwb3J0fV0gR290ICMke29wdHMuY2h1bmtJZH0vJHtvcHRzLmZpbGVMZW5ndGh9IGNodW5rcywgZHN0OiAke29wdHMuZmlsZS5uYW1lIHx8IG9wdHMuZmlsZS5maWxlTmFtZX1gKTtcblxuICAgIGNvbnN0IGZpbGVOYW1lID0gdGhpcy5fZ2V0RmlsZU5hbWUob3B0cy5maWxlKTtcbiAgICBjb25zdCB7ZXh0ZW5zaW9uLCBleHRlbnNpb25XaXRoRG90fSA9IHRoaXMuX2dldEV4dChmaWxlTmFtZSk7XG5cbiAgICBpZiAoIWhlbHBlcnMuaXNPYmplY3Qob3B0cy5maWxlLm1ldGEpKSB7XG4gICAgICBvcHRzLmZpbGUubWV0YSA9IHt9O1xuICAgIH1cblxuICAgIGxldCByZXN1bHQgPSBvcHRzLmZpbGU7XG4gICAgcmVzdWx0Lm5hbWUgPSBmaWxlTmFtZTtcbiAgICByZXN1bHQubWV0YSA9IG9wdHMuZmlsZS5tZXRhO1xuICAgIHJlc3VsdC5leHRlbnNpb24gPSBleHRlbnNpb247XG4gICAgcmVzdWx0LmV4dCA9IGV4dGVuc2lvbjtcbiAgICByZXN1bHQuX2lkID0gb3B0cy5maWxlSWQ7XG4gICAgcmVzdWx0LnVzZXJJZCA9IHVzZXJJZCB8fCBudWxsO1xuICAgIG9wdHMuRlNOYW1lID0gdGhpcy5zYW5pdGl6ZShvcHRzLkZTTmFtZSk7XG5cbiAgICBpZiAodGhpcy5uYW1pbmdGdW5jdGlvbikge1xuICAgICAgb3B0cy5GU05hbWUgPSB0aGlzLm5hbWluZ0Z1bmN0aW9uKG9wdHMpO1xuICAgIH1cblxuICAgIHJlc3VsdC5wYXRoID0gYCR7dGhpcy5zdG9yYWdlUGF0aChyZXN1bHQpfSR7bm9kZVBhdGguc2VwfSR7b3B0cy5GU05hbWV9JHtleHRlbnNpb25XaXRoRG90fWA7XG4gICAgcmVzdWx0ID0gT2JqZWN0LmFzc2lnbihyZXN1bHQsIHRoaXMuX2RhdGFUb1NjaGVtYShyZXN1bHQpKTtcblxuICAgIGlmICh0aGlzLm9uQmVmb3JlVXBsb2FkICYmIGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLm9uQmVmb3JlVXBsb2FkKSkge1xuICAgICAgY3R4ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGZpbGU6IG9wdHMuZmlsZVxuICAgICAgfSwge1xuICAgICAgICBjaHVua0lkOiBvcHRzLmNodW5rSWQsXG4gICAgICAgIHVzZXJJZDogcmVzdWx0LnVzZXJJZCxcbiAgICAgICAgYXN5bmMgdXNlckFzeW5jKCkge1xuICAgICAgICAgIGlmIChNZXRlb3IudXNlcnMgJiYgcmVzdWx0LnVzZXJJZCkge1xuICAgICAgICAgICAgcmV0dXJuIE1ldGVvci51c2Vycy5maW5kT25lQXN5bmMocmVzdWx0LnVzZXJJZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuICAgICAgICBlb2Y6IG9wdHMuZW9mXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGlzVXBsb2FkQWxsb3dlZCA9IGF3YWl0IHRoaXMub25CZWZvcmVVcGxvYWQuY2FsbChjdHgsIHJlc3VsdCk7XG5cbiAgICAgIGlmIChpc1VwbG9hZEFsbG93ZWQgIT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIGhlbHBlcnMuaXNTdHJpbmcoaXNVcGxvYWRBbGxvd2VkKSA/IGlzVXBsb2FkQWxsb3dlZCA6ICdAb25CZWZvcmVVcGxvYWQoKSByZXR1cm5lZCBmYWxzZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKChvcHRzLl9fX3MgPT09IHRydWUpICYmIHRoaXMub25Jbml0aWF0ZVVwbG9hZCAmJiBoZWxwZXJzLmlzRnVuY3Rpb24odGhpcy5vbkluaXRpYXRlVXBsb2FkKSkge1xuICAgICAgICAgIGF3YWl0IHRoaXMub25Jbml0aWF0ZVVwbG9hZC5jYWxsKGN0eCwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoKG9wdHMuX19fcyA9PT0gdHJ1ZSkgJiYgdGhpcy5vbkluaXRpYXRlVXBsb2FkICYmIGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLm9uSW5pdGlhdGVVcGxvYWQpKSB7XG4gICAgICBjdHggPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgZmlsZTogb3B0cy5maWxlXG4gICAgICB9LCB7XG4gICAgICAgIGNodW5rSWQ6IG9wdHMuY2h1bmtJZCxcbiAgICAgICAgdXNlcklkOiByZXN1bHQudXNlcklkLFxuICAgICAgICBhc3luYyB1c2VyQXN5bmMoKSB7XG4gICAgICAgICAgaWYgKE1ldGVvci51c2VycyAmJiByZXN1bHQudXNlcklkKSB7XG4gICAgICAgICAgICByZXR1cm4gTWV0ZW9yLnVzZXJzLmZpbmRPbmVBc3luYyhyZXN1bHQudXNlcklkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIGVvZjogb3B0cy5lb2ZcbiAgICAgIH0pO1xuICAgICAgYXdhaXQgdGhpcy5vbkluaXRpYXRlVXBsb2FkLmNhbGwoY3R4LCByZXN1bHQpO1xuICAgIH1cblxuICAgIHJldHVybiB7cmVzdWx0LCBvcHRzfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25cbiAgICogQG5hbWUgX2ZpbmlzaFVwbG9hZFxuICAgKiBAc3VtbWFyeSBJbnRlcm5hbCBtZXRob2QuIEZpbmlzaCB1cGxvYWQsIGNsb3NlIFdyaXRhYmxlIHN0cmVhbSwgYWRkIHJlY29yZCB0byBNb25nb0RCIGFuZCBmbHVzaCB1c2VkIG1lbW9yeVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx1bmRlZmluZWQ+fVxuICAgKi9cbiAgYXN5bmMgX2ZpbmlzaFVwbG9hZChyZXN1bHQsIG9wdHMsIGNiKSB7XG4gICAgdGhpcy5fZGVidWcoYFtGaWxlc0NvbGxlY3Rpb25dIFtVcGxvYWRdIFtmaW5pc2goaW5nKVVwbG9hZF0gLT4gJHtyZXN1bHQucGF0aH1gKTtcbiAgICBmcy5jaG1vZChyZXN1bHQucGF0aCwgdGhpcy5wZXJtaXNzaW9ucywgbm9vcCk7XG4gICAgcmVzdWx0LnR5cGUgPSB0aGlzLl9nZXRNaW1lVHlwZShvcHRzLmZpbGUpO1xuICAgIHJlc3VsdC5wdWJsaWMgPSB0aGlzLnB1YmxpYztcbiAgICB0aGlzLl91cGRhdGVGaWxlVHlwZXMocmVzdWx0KTtcblxuICAgIGxldCBfaWQ7XG4gICAgdHJ5IHtcbiAgICAgIF9pZCA9IGF3YWl0IHRoaXMuY29sbGVjdGlvbi5pbnNlcnRBc3luYyhoZWxwZXJzLmNsb25lKHJlc3VsdCkpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5fcHJlQ29sbGVjdGlvbi51cGRhdGVBc3luYyh7X2lkOiBvcHRzLmZpbGVJZH0sIHskc2V0OiB7aXNGaW5pc2hlZDogdHJ1ZX19KTtcbiAgICAgICAgaWYgKF9pZCkgcmVzdWx0Ll9pZCA9IF9pZDtcbiAgICAgICAgdGhpcy5fZGVidWcoYFtGaWxlc0NvbGxlY3Rpb25dIFtVcGxvYWRdIFtmaW5pc2goZWQpVXBsb2FkXSAtPiAke3Jlc3VsdC5wYXRofWApO1xuICAgICAgICBpZiAodGhpcy5vbkFmdGVyVXBsb2FkICYmIGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLm9uQWZ0ZXJVcGxvYWQpKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5vbkFmdGVyVXBsb2FkLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXQoJ2FmdGVyVXBsb2FkJywgcmVzdWx0KTtcbiAgICAgICAgY2IobnVsbCwgcmVzdWx0KTtcbiAgICAgIH0gY2F0Y2ggKHByclVwZGF0ZUVycm9yKSB7XG4gICAgICAgIGNiKHByclVwZGF0ZUVycm9yKTtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1tGaWxlc0NvbGxlY3Rpb25dIFtVcGxvYWRdIFtfZmluaXNoVXBsb2FkXSBbdXBkYXRlXSBFcnJvcjonLCBwcnJVcGRhdGVFcnJvcik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoY29sSW5zZXJ0KXtcbiAgICAgIGNiKGNvbEluc2VydCk7XG4gICAgICB0aGlzLl9kZWJ1ZygnW0ZpbGVzQ29sbGVjdGlvbl0gW1VwbG9hZF0gW19maW5pc2hVcGxvYWRdIFtpbnNlcnRdIEVycm9yOicsIGNvbEluc2VydCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlck9mIEZpbGVzQ29sbGVjdGlvblxuICAgKiBAbmFtZSBfaGFuZGxlVXBsb2FkXG4gICAqIEBzdW1tYXJ5IEludGVybmFsIG1ldGhvZCB0byBoYW5kbGUgdXBsb2FkIHByb2Nlc3MsIHBpcGUgaW5jb21pbmcgZGF0YSB0byBXcml0YWJsZSBzdHJlYW1cbiAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICovXG4gIF9oYW5kbGVVcGxvYWQocmVzdWx0LCBvcHRzLCBjYikge1xuICAgIHRyeSB7XG4gICAgICBpZiAob3B0cy5lb2YpIHtcbiAgICAgICAgdGhpcy5fY3VycmVudFVwbG9hZHNbcmVzdWx0Ll9pZF0uZW5kKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ19maW5pc2hVcGxvYWQnLCByZXN1bHQsIG9wdHMsIGNiKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jdXJyZW50VXBsb2Fkc1tyZXN1bHQuX2lkXS53cml0ZShvcHRzLmNodW5rSWQsIG9wdHMuYmluRGF0YSwgY2IpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX2RlYnVnKCdbX2hhbmRsZVVwbG9hZF0gW0VYQ0VQVElPTjpdJywgZSk7XG4gICAgICBjYiAmJiBjYihlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25cbiAgICogQG5hbWUgX2dldE1pbWVUeXBlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBmaWxlRGF0YSAtIEZpbGUgT2JqZWN0XG4gICAqIEBzdW1tYXJ5IFJldHVybnMgZmlsZSdzIG1pbWUtdHlwZVxuICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgKi9cbiAgX2dldE1pbWVUeXBlKGZpbGVEYXRhKSB7XG4gICAgbGV0IG1pbWU7XG4gICAgY2hlY2soZmlsZURhdGEsIE9iamVjdCk7XG4gICAgaWYgKGhlbHBlcnMuaXNPYmplY3QoZmlsZURhdGEpICYmIGZpbGVEYXRhLnR5cGUpIHtcbiAgICAgIG1pbWUgPSBmaWxlRGF0YS50eXBlO1xuICAgIH1cblxuICAgIGlmICghbWltZSB8fCAhaGVscGVycy5pc1N0cmluZyhtaW1lKSkge1xuICAgICAgbWltZSA9ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuICAgIH1cbiAgICByZXR1cm4gbWltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVzQ29sbGVjdGlvblxuICAgKiBAbmFtZSBfZ2V0VXNlcklkXG4gICAqIEBzdW1tYXJ5IFJldHVybnMgYHVzZXJJZGAgbWF0Y2hpbmcgdGhlIHhtdG9rIHRva2VuIGRlcml2ZWQgZnJvbSBNZXRlb3Iuc2VydmVyLnNlc3Npb25zXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAqL1xuICBfZ2V0VXNlcklkKHhtdG9rKSB7XG4gICAgaWYgKCF4bXRvaykgcmV0dXJuIG51bGw7XG5cbiAgICAvLyB0aHJvdyBhbiBlcnJvciB1cG9uIGFuIHVuZXhwZWN0ZWQgdHlwZSBvZiBNZXRlb3Iuc2VydmVyLnNlc3Npb25zIGluIG9yZGVyIHRvIGlkZW50aWZ5IGJyZWFraW5nIGNoYW5nZXNcbiAgICBpZiAoIU1ldGVvci5zZXJ2ZXIuc2Vzc2lvbnMgaW5zdGFuY2VvZiBNYXAgfHwgIWhlbHBlcnMuaXNPYmplY3QoTWV0ZW9yLnNlcnZlci5zZXNzaW9ucykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVjZWl2ZWQgaW5jb21wYXRpYmxlIHR5cGUgb2YgTWV0ZW9yLnNlcnZlci5zZXNzaW9ucycpO1xuICAgIH1cblxuICAgIGlmIChNZXRlb3Iuc2VydmVyLnNlc3Npb25zIGluc3RhbmNlb2YgTWFwICYmIE1ldGVvci5zZXJ2ZXIuc2Vzc2lvbnMuaGFzKHhtdG9rKSAmJiBoZWxwZXJzLmlzT2JqZWN0KE1ldGVvci5zZXJ2ZXIuc2Vzc2lvbnMuZ2V0KHhtdG9rKSkpIHtcbiAgICAgIC8vIHRvIGJlIHVzZWQgd2l0aCA+PSBNZXRlb3IgMS44LjEgd2hlcmUgTWV0ZW9yLnNlcnZlci5zZXNzaW9ucyBpcyBhIE1hcFxuICAgICAgcmV0dXJuIE1ldGVvci5zZXJ2ZXIuc2Vzc2lvbnMuZ2V0KHhtdG9rKS51c2VySWQ7XG4gICAgfSBlbHNlIGlmIChoZWxwZXJzLmlzT2JqZWN0KE1ldGVvci5zZXJ2ZXIuc2Vzc2lvbnMpICYmIHhtdG9rIGluIE1ldGVvci5zZXJ2ZXIuc2Vzc2lvbnMgJiYgaGVscGVycy5pc09iamVjdChNZXRlb3Iuc2VydmVyLnNlc3Npb25zW3htdG9rXSkpIHtcbiAgICAgIC8vIHRvIGJlIHVzZWQgd2l0aCA8IE1ldGVvciAxLjguMSB3aGVyZSBNZXRlb3Iuc2VydmVyLnNlc3Npb25zIGlzIGFuIE9iamVjdFxuICAgICAgcmV0dXJuIE1ldGVvci5zZXJ2ZXIuc2Vzc2lvbnNbeG10b2tdLnVzZXJJZDtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVzQ29sbGVjdGlvblxuICAgKiBAbmFtZSBfZ2V0VXNlclxuICAgKiBAc3VtbWFyeSBSZXR1cm5zIG9iamVjdCB3aXRoIGB1c2VySWRgIGFuZCBgdXNlcigpYCBtZXRob2Qgd2hpY2ggcmV0dXJuIHVzZXIncyBvYmplY3RcbiAgICogQHJldHVybnMge09iamVjdH1cbiAgICovXG4gIF9nZXRVc2VyKCkge1xuICAgIHJldHVybiB0aGlzLmdldFVzZXIgP1xuICAgICAgdGhpcy5nZXRVc2VyKC4uLmFyZ3VtZW50cykgOiB0aGlzLl9nZXRVc2VyRGVmYXVsdCguLi5hcmd1bWVudHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgRmlsZXNDb2xsZWN0aW9uXG4gICAqIEBuYW1lIF9nZXRVc2VyRGVmYXVsdFxuICAgKiBAc3VtbWFyeSBEZWZhdWx0IHdheSBvZiByZWNvZ25pc2luZyB1c2VyIGJhc2VkIG9uICd4X210b2snIGNvb2tpZSwgY2FuIGJlIHJlcGxhY2VkIGJ5ICdjb25maWcuZ2V0VXNlcicgaWYgZGVmbmllZC4gUmV0dXJucyBvYmplY3Qgd2l0aCBgdXNlcklkYCBhbmQgYHVzZXIoKWAgbWV0aG9kIHdoaWNoIHJldHVybiB1c2VyJ3Mgb2JqZWN0XG4gICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAqL1xuICBfZ2V0VXNlckRlZmF1bHQoaHR0cCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgIGFzeW5jIHVzZXJBc3luYygpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICB1c2VyKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgIHVzZXJJZDogbnVsbFxuICAgIH07XG5cbiAgICBpZiAoaHR0cCkge1xuICAgICAgbGV0IG10b2sgPSBudWxsO1xuICAgICAgaWYgKGh0dHAucmVxdWVzdC5oZWFkZXJzWyd4LW10b2snXSkge1xuICAgICAgICBtdG9rID0gaHR0cC5yZXF1ZXN0LmhlYWRlcnNbJ3gtbXRvayddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY29va2llID0gaHR0cC5yZXF1ZXN0LkNvb2tpZXM7XG4gICAgICAgIGlmIChjb29raWUuaGFzKCd4X210b2snKSkge1xuICAgICAgICAgIG10b2sgPSBjb29raWUuZ2V0KCd4X210b2snKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobXRvaykge1xuICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLl9nZXRVc2VySWQobXRvayk7XG5cbiAgICAgICAgaWYgKHVzZXJJZCkge1xuICAgICAgICAgIHJlc3VsdC51c2VyQXN5bmMgPSAoKSA9PiBNZXRlb3IudXNlcnMuZmluZE9uZUFzeW5jKHVzZXJJZCk7XG4gICAgICAgICAgcmVzdWx0LnVzZXJJZCA9IHVzZXJJZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAbWVtYmVyT2YgRmlsZXNDb2xsZWN0aW9uXG4gICAqIEBuYW1lIHdyaXRlXG4gICAqIEBwYXJhbSB7QnVmZmVyfSBidWZmZXIgLSBCaW5hcnkgRmlsZSdzIEJ1ZmZlclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cyAtIE9iamVjdCB3aXRoIGZpbGUtZGF0YVxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0cy5uYW1lIC0gRmlsZSBuYW1lLCBhbGlhczogYGZpbGVOYW1lYFxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0cy50eXBlIC0gRmlsZSBtaW1lLXR5cGVcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMubWV0YSAtIEZpbGUgYWRkaXRpb25hbCBtZXRhLWRhdGFcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdHMudXNlcklkIC0gVXNlcklkLCBkZWZhdWx0ICpudWxsKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0cy5maWxlSWQgLSBfaWQsIHNhbml0aXplZCwgbWF4LWxlbmd0aDogMjA7IGRlZmF1bHQgKm51bGwqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gcHJvY2VlZEFmdGVyVXBsb2FkIC0gUHJvY2VlZCBvbkFmdGVyVXBsb2FkIGhvb2tcbiAgICogQHN1bW1hcnkgV3JpdGUgYnVmZmVyIHRvIEZTIGFuZCBhZGQgdG8gRmlsZXNDb2xsZWN0aW9uIENvbGxlY3Rpb25cbiAgICogQHRocm93cyB7TWV0ZW9yLkVycm9yfSBJZiB0aGVyZSBpcyBhbiBlcnJvciB3cml0aW5nIHRoZSBmaWxlIG9yIGluc2VydGluZyB0aGUgZG9jdW1lbnRcbiAgICogQHJldHVybnMge1Byb21pc2U8RmlsZVJlZj59IEluc3RhbmNlXG4gICAqL1xuICBhc3luYyB3cml0ZShidWZmZXIsIF9vcHRzID0ge30sIF9wcm9jZWVkQWZ0ZXJVcGxvYWQpIHtcbiAgICB0aGlzLl9kZWJ1ZygnW0ZpbGVzQ29sbGVjdGlvbl0gW3dyaXRlQXN5bmMoKV0nKTtcbiAgICBsZXQgb3B0cyA9IF9vcHRzO1xuICAgIGxldCBwcm9jZWVkQWZ0ZXJVcGxvYWQgPSBfcHJvY2VlZEFmdGVyVXBsb2FkO1xuXG4gICAgaWYgKGhlbHBlcnMuaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgICBwcm9jZWVkQWZ0ZXJVcGxvYWQgPSBvcHRzO1xuICAgICAgb3B0cyA9IHt9O1xuICAgIH1cblxuICAgIGNoZWNrKG9wdHMsIE1hdGNoLk9wdGlvbmFsKE9iamVjdCkpO1xuICAgIGNoZWNrKHByb2NlZWRBZnRlclVwbG9hZCwgTWF0Y2guT3B0aW9uYWwoQm9vbGVhbikpO1xuXG4gICAgb3B0cy5maWxlSWQgPSBvcHRzLmZpbGVJZCAmJiB0aGlzLnNhbml0aXplKG9wdHMuZmlsZUlkLCAyMCwgJ2EnKTtcbiAgICBjb25zdCBmaWxlSWQgPSBvcHRzLmZpbGVJZCB8fCBSYW5kb20uaWQoKTtcbiAgICBjb25zdCBmc05hbWUgPSB0aGlzLm5hbWluZ0Z1bmN0aW9uID8gdGhpcy5uYW1pbmdGdW5jdGlvbihvcHRzKSA6IGZpbGVJZDtcbiAgICBjb25zdCBmaWxlTmFtZSA9IChvcHRzLm5hbWUgfHwgb3B0cy5maWxlTmFtZSkgPyAob3B0cy5uYW1lIHx8IG9wdHMuZmlsZU5hbWUpIDogZnNOYW1lO1xuXG4gICAgY29uc3Qge2V4dGVuc2lvbiwgZXh0ZW5zaW9uV2l0aERvdH0gPSB0aGlzLl9nZXRFeHQoZmlsZU5hbWUpO1xuXG4gICAgb3B0cy5wYXRoID0gYCR7dGhpcy5zdG9yYWdlUGF0aChvcHRzKX0ke25vZGVQYXRoLnNlcH0ke2ZzTmFtZX0ke2V4dGVuc2lvbldpdGhEb3R9YDtcbiAgICBvcHRzLnR5cGUgPSB0aGlzLl9nZXRNaW1lVHlwZShvcHRzKTtcbiAgICBpZiAoIWhlbHBlcnMuaXNPYmplY3Qob3B0cy5tZXRhKSkge1xuICAgICAgb3B0cy5tZXRhID0ge307XG4gICAgfVxuXG4gICAgaWYgKCFoZWxwZXJzLmlzTnVtYmVyKG9wdHMuc2l6ZSkpIHtcbiAgICAgIG9wdHMuc2l6ZSA9IGJ1ZmZlci5sZW5ndGg7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZGF0YVRvU2NoZW1hKHtcbiAgICAgIG5hbWU6IGZpbGVOYW1lLFxuICAgICAgcGF0aDogb3B0cy5wYXRoLFxuICAgICAgbWV0YTogb3B0cy5tZXRhLFxuICAgICAgdHlwZTogb3B0cy50eXBlLFxuICAgICAgc2l6ZTogb3B0cy5zaXplLFxuICAgICAgdXNlcklkOiBvcHRzLnVzZXJJZCxcbiAgICAgIGV4dGVuc2lvblxuICAgIH0pO1xuXG4gICAgcmVzdWx0Ll9pZCA9IGZpbGVJZDtcblxuICAgIGxldCBmaWxlUmVmO1xuXG4gICAgbGV0IG11c3RDcmVhdGVGaWxlRmlyc3QgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KG9wdHMucGF0aCk7XG4gICAgICBpZiAoIXN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIG11c3RDcmVhdGVGaWxlRmlyc3QgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKHN0YXRFcnJvcikge1xuICAgICAgbXVzdENyZWF0ZUZpbGVGaXJzdCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChtdXN0Q3JlYXRlRmlsZUZpcnN0KSB7XG4gICAgICBjb25zdCBwYXRocyA9IG9wdHMucGF0aC5zcGxpdCgnLycpO1xuICAgICAgcGF0aHMucG9wKCk7XG4gICAgICBhd2FpdCBmcy5wcm9taXNlcy5ta2RpcihwYXRocy5qb2luKCcvJyksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgYXdhaXQgZnMucHJvbWlzZXMud3JpdGVGaWxlKG9wdHMucGF0aCwgJycpO1xuICAgIH1cblxuICAgIGNvbnN0IHN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKG9wdHMucGF0aCwge2ZsYWdzOiAndycsIG1vZGU6IHRoaXMucGVybWlzc2lvbnN9KTtcblxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHN0cmVhbS5lbmQoYnVmZmVyLCAoc3RyZWFtRXJyKSA9PiB7XG4gICAgICAgIGlmIChzdHJlYW1FcnIpIHtcbiAgICAgICAgICByZWplY3Qoc3RyZWFtRXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IF9pZCA9IGF3YWl0IHRoaXMuY29sbGVjdGlvbi5pbnNlcnRBc3luYyhyZXN1bHQpO1xuICAgICAgZmlsZVJlZiA9IGF3YWl0IHRoaXMuY29sbGVjdGlvbi5maW5kT25lQXN5bmMoX2lkKTtcblxuICAgICAgaWYgKHByb2NlZWRBZnRlclVwbG9hZCA9PT0gdHJ1ZSkge1xuICAgICAgICBpZiAodGhpcy5vbkFmdGVyVXBsb2FkKXtcbiAgICAgICAgICBhd2FpdCB0aGlzLm9uQWZ0ZXJVcGxvYWQuY2FsbCh0aGlzLCBmaWxlUmVmKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXQoJ2FmdGVyVXBsb2FkQXN5bmMnLCBmaWxlUmVmKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbd3JpdGVdOiAke2ZpbGVOYW1lfSAtPiAke3RoaXMuY29sbGVjdGlvbk5hbWV9YCk7XG4gICAgfSBjYXRjaCAoaW5zZXJ0RXJyKSB7XG4gICAgICB0aGlzLl9kZWJ1ZyhgW0ZpbGVzQ29sbGVjdGlvbl0gW3dyaXRlXSBbaW5zZXJ0XSBFcnJvcjogJHtmaWxlTmFtZX0gLT4gJHt0aGlzLmNvbGxlY3Rpb25OYW1lfWAsIGluc2VydEVycik7XG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCd3cml0ZUFzeW5jJywgaW5zZXJ0RXJyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsZVJlZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25cbiAgICogQG5hbWUgbG9hZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIC0gVVJMIHRvIGZpbGVcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRzXSAtIE9iamVjdCB3aXRoIGZpbGUtZGF0YVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cy5oZWFkZXJzIC0gSFRUUCBoZWFkZXJzIHRvIHVzZSB3aGVuIHJlcXVlc3RpbmcgdGhlIGZpbGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdHMubmFtZSAtIEZpbGUgbmFtZSwgYWxpYXM6IGBmaWxlTmFtZWBcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdHMudHlwZSAtIEZpbGUgbWltZS10eXBlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzLm1ldGEgLSBGaWxlIGFkZGl0aW9uYWwgbWV0YS1kYXRhXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRzLnVzZXJJZCAtIFVzZXJJZCwgZGVmYXVsdCAqbnVsbCpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdHMuZmlsZUlkIC0gX2lkLCBzYW5pdGl6ZWQsIG1heC1sZW5ndGg6IDIwOyBkZWZhdWx0ICpudWxsKlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0cy50aW1lb3V0IC0gVGltZW91dCBpbiBtaWxsaXNlY29uZHMsIGRlZmF1bHQ6IDM2MDAwMCAoNiBtaW5zKVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIGZ1bmN0aW9uKGVycm9yLCBmaWxlT2JqKXsuLi59XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3Byb2NlZWRBZnRlclVwbG9hZF0gLSBQcm9jZWVkIG9uQWZ0ZXJVcGxvYWQgaG9va1xuICAgKiBAc3VtbWFyeSBEb3dubG9hZCBmaWxlIG92ZXIgSFRUUCwgd3JpdGUgc3RyZWFtIHRvIEZTLCBhbmQgYWRkIHRvIEZpbGVzQ29sbGVjdGlvbiBDb2xsZWN0aW9uXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGZpbGVPYmo+fSBGaWxlIE9iamVjdFxuICAgKi9cbiAgYXN5bmMgbG9hZCh1cmwsIF9vcHRzID0ge30sIF9wcm9jZWVkQWZ0ZXJVcGxvYWQgPSBmYWxzZSkge1xuICAgIHRoaXMuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbbG9hZEFzeW5jKCR7dXJsfSwgJHtKU09OLnN0cmluZ2lmeShfb3B0cyl9LCBjYWxsYmFjayldYCk7XG4gICAgbGV0IG9wdHMgPSBfb3B0cztcbiAgICBsZXQgcHJvY2VlZEFmdGVyVXBsb2FkID0gX3Byb2NlZWRBZnRlclVwbG9hZDtcblxuICAgIGlmIChoZWxwZXJzLmlzQm9vbGVhbihfb3B0cykpIHtcbiAgICAgIHByb2NlZWRBZnRlclVwbG9hZCA9IF9vcHRzO1xuICAgICAgb3B0cyA9IHt9O1xuICAgIH1cblxuICAgIGNoZWNrKHVybCwgU3RyaW5nKTtcbiAgICBjaGVjayhvcHRzLCBNYXRjaC5PcHRpb25hbChPYmplY3QpKTtcbiAgICBjaGVjayhwcm9jZWVkQWZ0ZXJVcGxvYWQsIE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pKTtcblxuICAgIGlmICghaGVscGVycy5pc09iamVjdChvcHRzKSkge1xuICAgICAgb3B0cyA9IHtcbiAgICAgICAgdGltZW91dDogMzYwMDAwXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICghb3B0cy50aW1lb3V0KSB7XG4gICAgICBvcHRzLnRpbWVvdXQgPSAzNjAwMDA7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZUlkID0gKG9wdHMuZmlsZUlkICYmIHRoaXMuc2FuaXRpemUob3B0cy5maWxlSWQsIDIwLCAnYScpKSB8fCBSYW5kb20uaWQoKTtcbiAgICBjb25zdCBmc05hbWUgPSB0aGlzLm5hbWluZ0Z1bmN0aW9uID8gdGhpcy5uYW1pbmdGdW5jdGlvbihvcHRzKSA6IGZpbGVJZDtcbiAgICBjb25zdCBwYXRoUGFydHMgPSB1cmwuc3BsaXQoJy8nKTtcbiAgICBjb25zdCBmaWxlTmFtZSA9IChvcHRzLm5hbWUgfHwgb3B0cy5maWxlTmFtZSkgPyAob3B0cy5uYW1lIHx8IG9wdHMuZmlsZU5hbWUpIDogcGF0aFBhcnRzW3BhdGhQYXJ0cy5sZW5ndGggLSAxXS5zcGxpdCgnPycpWzBdIHx8IGZzTmFtZTtcblxuICAgIGNvbnN0IHtleHRlbnNpb24sIGV4dGVuc2lvbldpdGhEb3R9ID0gdGhpcy5fZ2V0RXh0KGZpbGVOYW1lKTtcbiAgICBvcHRzLnBhdGggPSBgJHt0aGlzLnN0b3JhZ2VQYXRoKG9wdHMpfSR7bm9kZVBhdGguc2VwfSR7ZnNOYW1lfSR7ZXh0ZW5zaW9uV2l0aERvdH1gO1xuXG4gICAgLy8gdGhpcyB3aWxsIGJlIHRoZSByZXNvbHZlZCBmaWxlUmVmXG4gICAgbGV0IGZpbGVSZWY7XG5cbiAgICAvLyBzdG9yZVJlc3VsdCBpcyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgdGhlIGZpbGUgaXMgZG93bmxvYWRlZCBhbmQgc3RvcmVkIGluIHRoZSBkYXRhYmFzZVxuICAgIC8vIHRoaXMgbWlnaHQgdGhyb3cgYW4gZXJyb3IgZnJvbSBjb2xsZWN0aW9uLmluc2VydEFzeW5jIG9yIGNvbGxlY3Rpb24uZmluZE9uZUFzeW5jXG4gICAgY29uc3Qgc3RvcmVSZXN1bHQgPSBhc3luYyAocmVzdWx0KSA9PiB7XG4gICAgICByZXN1bHQuX2lkID0gZmlsZUlkO1xuICAgICAgY29uc3QgX2lkICA9IGF3YWl0IHRoaXMuY29sbGVjdGlvbi5pbnNlcnRBc3luYyhyZXN1bHQpO1xuXG4gICAgICBmaWxlUmVmID0gYXdhaXQgdGhpcy5jb2xsZWN0aW9uLmZpbmRPbmVBc3luYyhfaWQpO1xuICAgICAgaWYgKHByb2NlZWRBZnRlclVwbG9hZCA9PT0gdHJ1ZSkge1xuICAgICAgICBpZiAodGhpcy5vbkFmdGVyVXBsb2FkKXtcbiAgICAgICAgICBhd2FpdCB0aGlzLm9uQWZ0ZXJVcGxvYWQuY2FsbCh0aGlzLCBmaWxlUmVmKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXQoJ2FmdGVyVXBsb2FkQXN5bmMnLCBmaWxlUmVmKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbbG9hZF0gW2luc2VydF0gJHtmaWxlTmFtZX0gLT4gJHt0aGlzLmNvbGxlY3Rpb25OYW1lfWApO1xuICAgIH07XG5cbiAgICAvLyBjaGVjayBpZiB0aGUgZmlsZSBhbHJlYWR5IGV4aXN0cywgb3RoZXJ3aXNlIGNyZWF0ZSBpdFxuICAgIGxldCBtdXN0Q3JlYXRlRmlsZUZpcnN0ID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChvcHRzLnBhdGgpO1xuICAgICAgaWYgKCFzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICBtdXN0Q3JlYXRlRmlsZUZpcnN0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChzdGF0RXJyb3IpIHtcbiAgICAgIG11c3RDcmVhdGVGaWxlRmlyc3QgPSB0cnVlO1xuICAgIH1cbiAgICBpZihtdXN0Q3JlYXRlRmlsZUZpcnN0KSB7XG4gICAgICBjb25zdCBwYXRocyA9IG9wdHMucGF0aC5zcGxpdCgnLycpO1xuICAgICAgcGF0aHMucG9wKCk7XG4gICAgICBmcy5ta2RpclN5bmMocGF0aHMuam9pbignLycpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMob3B0cy5wYXRoLCAnJyk7XG4gICAgfVxuXG4gICAgY29uc3Qgd1N0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKG9wdHMucGF0aCwge2ZsYWdzOiAndycsIG1vZGU6IHRoaXMucGVybWlzc2lvbnMsIGF1dG9DbG9zZTogdHJ1ZSwgZW1pdENsb3NlOiBmYWxzZSB9KTtcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGxldCB0aW1lcjtcblxuICAgICAgaWYgKG9wdHMudGltZW91dCA+IDApIHtcbiAgICAgICAgdGltZXIgPSBNZXRlb3Iuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDA4LCBgUmVxdWVzdCB0aW1lb3V0IGFmdGVyICR7b3B0cy50aW1lb3V0fW1zYCk7XG4gICAgICAgIH0sIG9wdHMudGltZW91dCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICBoZWFkZXJzOiBvcHRzLmhlYWRlcnMgfHwge30sXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodGltZXIpIHtcbiAgICAgICAgTWV0ZW9yLmNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgIHRpbWVyID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFyZXMub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHJlc3BvbnNlICR7cmVzLnN0YXR1c1RleHR9YCk7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHBpcGVsaW5lKHJlcy5ib2R5LCB3U3RyZWFtKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZGF0YVRvU2NoZW1hKHtcbiAgICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICAgIHBhdGg6IG9wdHMucGF0aCxcbiAgICAgICAgbWV0YTogb3B0cy5tZXRhLFxuICAgICAgICB0eXBlOiBvcHRzLnR5cGUgfHwgcmVzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCB0aGlzLl9nZXRNaW1lVHlwZSh7cGF0aDogb3B0cy5wYXRofSksXG4gICAgICAgIHNpemU6IG9wdHMuc2l6ZSB8fCBwYXJzZUludChyZXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtbGVuZ3RoJykgfHwgMCksXG4gICAgICAgIHVzZXJJZDogb3B0cy51c2VySWQsXG4gICAgICAgIGV4dGVuc2lvblxuICAgICAgfSk7XG5cbiAgICAgIGlmICghcmVzdWx0LnNpemUpIHtcbiAgICAgICAgY29uc3QgbmV3U3RhdHMgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KG9wdHMucGF0aCk7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9ucy5vcmlnaW5hbC5zaXplID0gKHJlc3VsdC5zaXplID0gbmV3U3RhdHMuc2l6ZSk7XG4gICAgICAgIGF3YWl0IHN0b3JlUmVzdWx0KHJlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBzdG9yZVJlc3VsdChyZXN1bHQpO1xuICAgICAgfVxuICAgICAgcmVzLmJvZHkucGlwZSh3U3RyZWFtKTtcbiAgICB9IGNhdGNoKGVycm9yKXtcbiAgICAgIHRoaXMuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbbG9hZEFzeW5jXSBbZmV0Y2goJHt1cmx9KV0gRXJyb3I6YCwgZXJyb3IpO1xuXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhvcHRzLnBhdGgpKSB7XG4gICAgICAgIGF3YWl0IGZzLnByb21pc2VzLnVubGluayhvcHRzLnBhdGgpO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG5cblxuICAgIHJldHVybiBmaWxlUmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlck9mIEZpbGVzQ29sbGVjdGlvblxuICAgKiBAbmFtZSBhZGRGaWxlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoICAgICAgICAgIC0gUGF0aCB0byBmaWxlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRzICAgICAgICAgIC0gW09wdGlvbmFsXSBPYmplY3Qgd2l0aCBmaWxlLWRhdGFcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdHMudHlwZSAgICAgLSBbT3B0aW9uYWxdIEZpbGUgbWltZS10eXBlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzLm1ldGEgICAgIC0gW09wdGlvbmFsXSBGaWxlIGFkZGl0aW9uYWwgbWV0YS1kYXRhXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRzLmZpbGVJZCAgIC0gX2lkLCBzYW5pdGl6ZWQsIG1heC1sZW5ndGg6IDIwIHN5bWJvbHMgZGVmYXVsdCAqbnVsbCpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMuZmlsZU5hbWUgLSBbT3B0aW9uYWxdIEZpbGUgbmFtZSwgaWYgbm90IHNwZWNpZmllZCBmaWxlIG5hbWUgYW5kIGV4dGVuc2lvbiB3aWxsIGJlIHRha2VuIGZyb20gcGF0aFxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0cy51c2VySWQgICAtIFtPcHRpb25hbF0gVXNlcklkLCBkZWZhdWx0ICpudWxsKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHByb2NlZWRBZnRlclVwbG9hZCAtIFByb2NlZWQgb25BZnRlclVwbG9hZCBob29rXG4gICAqIEBzdW1tYXJ5IEFkZCBmaWxlIGZyb20gRlMgdG8gRmlsZXNDb2xsZWN0aW9uXG4gICAqIEB0aHJvd3Mge01ldGVvci5FcnJvcn0gSWYgZmlsZSBkb2VzIG5vdCBleGlzdCAoNDAwKSBvciBjb2xsZWN0aW9uIGlzIHB1YmxpYyAoNDAzKVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxGaWxlc0NvbGxlY3Rpb24+fSBJbnN0YW5jZVxuICAgKi9cbiAgYXN5bmMgYWRkRmlsZShwYXRoLCBfb3B0cyA9IHt9LCBfcHJvY2VlZEFmdGVyVXBsb2FkKSB7XG4gICAgdGhpcy5fZGVidWcoYFtGaWxlc0NvbGxlY3Rpb25dIFthZGRGaWxlKCR7cGF0aH0pXWApO1xuICAgIGxldCBvcHRzID0gX29wdHM7XG4gICAgbGV0IHByb2NlZWRBZnRlclVwbG9hZCA9IF9wcm9jZWVkQWZ0ZXJVcGxvYWQ7XG5cbiAgICBpZiAodGhpcy5wdWJsaWMpIHtcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoXG4gICAgICAgIDQwMyxcbiAgICAgICAgJ0NhbiBub3QgcnVuIFthZGRGaWxlXSBvbiBwdWJsaWMgY29sbGVjdGlvbiEgSnVzdCBNb3ZlIGZpbGUgdG8gcm9vdCBvZiB5b3VyIHNlcnZlciwgdGhlbiBhZGQgcmVjb3JkIHRvIENvbGxlY3Rpb24nXG4gICAgICApO1xuICAgIH1cblxuICAgIGNoZWNrKHBhdGgsIFN0cmluZyk7XG4gICAgY2hlY2sob3B0cywgTWF0Y2guT3B0aW9uYWwoT2JqZWN0KSk7XG4gICAgY2hlY2socHJvY2VlZEFmdGVyVXBsb2FkLCBNYXRjaC5PcHRpb25hbChCb29sZWFuKSk7XG5cbiAgICBsZXQgc3RhdHM7XG4gICAgdHJ5IHtcbiAgICAgIHN0YXRzID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChwYXRoKTtcbiAgICB9IGNhdGNoIChzdGF0RXJyKSB7XG4gICAgICBpZiAoc3RhdEVyci5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFxuICAgICAgICAgIDQwMCxcbiAgICAgICAgICBgW0ZpbGVzQ29sbGVjdGlvbl0gW2FkZEZpbGUoJHtwYXRofSldOiBGaWxlIGRvZXMgbm90IGV4aXN0YFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihzdGF0RXJyLmNvZGUsIHN0YXRFcnIubWVzc2FnZSk7XG4gICAgfVxuICAgIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgaWYgKCFoZWxwZXJzLmlzT2JqZWN0KG9wdHMpKSB7XG4gICAgICAgIG9wdHMgPSB7fTtcbiAgICAgIH1cbiAgICAgIG9wdHMucGF0aCA9IHBhdGg7XG5cbiAgICAgIGlmICghb3B0cy5maWxlTmFtZSkge1xuICAgICAgICBjb25zdCBwYXRoUGFydHMgPSBwYXRoLnNwbGl0KG5vZGVQYXRoLnNlcCk7XG4gICAgICAgIG9wdHMuZmlsZU5hbWUgPSBwYXRoLnNwbGl0KG5vZGVQYXRoLnNlcClbcGF0aFBhcnRzLmxlbmd0aCAtIDFdO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IGV4dGVuc2lvbiB9ID0gdGhpcy5fZ2V0RXh0KG9wdHMuZmlsZU5hbWUpO1xuXG4gICAgICBpZiAoIWhlbHBlcnMuaXNTdHJpbmcob3B0cy50eXBlKSkge1xuICAgICAgICBvcHRzLnR5cGUgPSB0aGlzLl9nZXRNaW1lVHlwZShvcHRzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFoZWxwZXJzLmlzT2JqZWN0KG9wdHMubWV0YSkpIHtcbiAgICAgICAgb3B0cy5tZXRhID0ge307XG4gICAgICB9XG5cbiAgICAgIGlmICghaGVscGVycy5pc051bWJlcihvcHRzLnNpemUpKSB7XG4gICAgICAgIG9wdHMuc2l6ZSA9IHN0YXRzLnNpemU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RhdGFUb1NjaGVtYSh7XG4gICAgICAgIG5hbWU6IG9wdHMuZmlsZU5hbWUsXG4gICAgICAgIHBhdGgsXG4gICAgICAgIG1ldGE6IG9wdHMubWV0YSxcbiAgICAgICAgdHlwZTogb3B0cy50eXBlLFxuICAgICAgICBzaXplOiBvcHRzLnNpemUsXG4gICAgICAgIHVzZXJJZDogb3B0cy51c2VySWQsXG4gICAgICAgIGV4dGVuc2lvbixcbiAgICAgICAgX3N0b3JhZ2VQYXRoOiBwYXRoLnJlcGxhY2UoYCR7bm9kZVBhdGguc2VwfSR7b3B0cy5maWxlTmFtZX1gLCAnJyksXG4gICAgICAgIGZpbGVJZDogKG9wdHMuZmlsZUlkICYmIHRoaXMuc2FuaXRpemUob3B0cy5maWxlSWQsIDIwLCAnYScpKSB8fCBudWxsLFxuICAgICAgfSk7XG5cbiAgICAgIGxldCBfaWQ7XG4gICAgICB0cnkge1xuICAgICAgICBfaWQgPSBhd2FpdCB0aGlzLmNvbGxlY3Rpb24uaW5zZXJ0QXN5bmMocmVzdWx0KTtcbiAgICAgIH0gY2F0Y2ggKGluc2VydEVycikge1xuICAgICAgICB0aGlzLl9kZWJ1ZyhcbiAgICAgICAgICBgW0ZpbGVzQ29sbGVjdGlvbl0gW2FkZEZpbGVBc3luY10gW2luc2VydEFzeW5jXSBFcnJvcjogJHtyZXN1bHQubmFtZX0gLT4gJHt0aGlzLmNvbGxlY3Rpb25OYW1lfWAsXG4gICAgICAgICAgaW5zZXJ0RXJyXG4gICAgICAgICk7XG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoaW5zZXJ0RXJyLmNvZGUsIGluc2VydEVyci5tZXNzYWdlKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsZVJlZiA9IGF3YWl0IHRoaXMuY29sbGVjdGlvbi5maW5kT25lQXN5bmMoX2lkKTtcblxuICAgICAgaWYgKHByb2NlZWRBZnRlclVwbG9hZCA9PT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLm9uQWZ0ZXJVcGxvYWQgJiYgdGhpcy5vbkFmdGVyVXBsb2FkLmNhbGwodGhpcywgZmlsZVJlZik7XG4gICAgICAgIHRoaXMuZW1pdCgnYWZ0ZXJVcGxvYWQnLCBmaWxlUmVmKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2RlYnVnKFxuICAgICAgICBgW0ZpbGVzQ29sbGVjdGlvbl0gW2FkZEZpbGVBc3luY106ICR7cmVzdWx0Lm5hbWV9IC0+ICR7dGhpcy5jb2xsZWN0aW9uTmFtZX1gXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZpbGVSZWY7XG4gICAgfVxuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoXG4gICAgICA0MDAsXG4gICAgICBgW0ZpbGVzQ29sbGVjdGlvbl0gW2FkZEZpbGUoJHtwYXRofSldOiBGaWxlIGRvZXMgbm90IGV4aXN0YFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25cbiAgICogQG5hbWUgcmVtb3ZlQXN5bmNcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBzZWxlY3RvciAtIE1vbmdvLVN0eWxlIHNlbGVjdG9yIChodHRwOi8vZG9jcy5tZXRlb3IuY29tL2FwaS9jb2xsZWN0aW9ucy5odG1sI3NlbGVjdG9ycylcbiAgICogQHRocm93cyB7TWV0ZW9yLkVycm9yfSBJZiBjdXJzb3IgaXMgZW1wdHlcbiAgICogQHN1bW1hcnkgUmVtb3ZlIGRvY3VtZW50cyBmcm9tIHRoZSBjb2xsZWN0aW9uXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPEZpbGVzQ29sbGVjdGlvbj59IEluc3RhbmNlXG4gICAqL1xuICBhc3luYyByZW1vdmVBc3luYyhzZWxlY3Rvcikge1xuICAgIHRoaXMuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbcmVtb3ZlQXN5bmMoJHtKU09OLnN0cmluZ2lmeShzZWxlY3Rvcil9KV1gKTtcbiAgICBpZiAoc2VsZWN0b3IgPT09IHZvaWQgMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZXMgPSB0aGlzLmNvbGxlY3Rpb24uZmluZChzZWxlY3Rvcik7XG4gICAgaWYgKGF3YWl0IGZpbGVzLmNvdW50QXN5bmMoKSA+IDApIHtcbiAgICAgIGF3YWl0IGZpbGVzLmZvckVhY2hBc3luYygoZmlsZSkgPT4ge1xuICAgICAgICB0aGlzLnVubGluayhmaWxlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwNCwgJ0N1cnNvciBpcyBlbXB0eSwgbm8gZmlsZXMgaXMgcmVtb3ZlZCcpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9uQWZ0ZXJSZW1vdmUpIHtcbiAgICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBmaWxlcy5mZXRjaEFzeW5jKCk7XG4gICAgICBhd2FpdCB0aGlzLmNvbGxlY3Rpb24ucmVtb3ZlQXN5bmMoc2VsZWN0b3IpO1xuICAgICAgYXdhaXQgdGhpcy5vbkFmdGVyUmVtb3ZlKGRvY3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLmNvbGxlY3Rpb24ucmVtb3ZlQXN5bmMoc2VsZWN0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25cbiAgICogQG5hbWUgZGVueVxuICAgKiBAcGFyYW0ge09iamVjdH0gcnVsZXNcbiAgICogQHNlZSAgaHR0cHM6Ly9kb2NzLm1ldGVvci5jb20vYXBpL2NvbGxlY3Rpb25zLmh0bWwjTW9uZ28tQ29sbGVjdGlvbi1kZW55XG4gICAqIEBzdW1tYXJ5IGxpbmsgTW9uZ28uQ29sbGVjdGlvbiBkZW55IG1ldGhvZHNcbiAgICogQHJldHVybnMge01vbmdvLkNvbGxlY3Rpb259IEluc3RhbmNlXG4gICAqL1xuICBkZW55KHJ1bGVzKSB7XG4gICAgdGhpcy5jb2xsZWN0aW9uLmRlbnkocnVsZXMpO1xuICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAbWVtYmVyT2YgRmlsZXNDb2xsZWN0aW9uXG4gICAqIEBuYW1lIGFsbG93XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBydWxlc1xuICAgKiBAc2VlIGh0dHBzOi8vZG9jcy5tZXRlb3IuY29tL2FwaS9jb2xsZWN0aW9ucy5odG1sI01vbmdvLUNvbGxlY3Rpb24tYWxsb3dcbiAgICogQHN1bW1hcnkgbGluayBNb25nby5Db2xsZWN0aW9uIGFsbG93IG1ldGhvZHNcbiAgICogQHJldHVybnMge01vbmdvLkNvbGxlY3Rpb259IEluc3RhbmNlXG4gICAqL1xuICBhbGxvdyhydWxlcykge1xuICAgIHRoaXMuY29sbGVjdGlvbi5hbGxvdyhydWxlcyk7XG4gICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25cbiAgICogQG5hbWUgZGVueUNsaWVudFxuICAgKiBAc2VlIGh0dHBzOi8vZG9jcy5tZXRlb3IuY29tL2FwaS9jb2xsZWN0aW9ucy5odG1sI01vbmdvLUNvbGxlY3Rpb24tZGVueVxuICAgKiBAc3VtbWFyeSBTaG9ydGhhbmRzIGZvciBNb25nby5Db2xsZWN0aW9uIGRlbnkgbWV0aG9kXG4gICAqIEByZXR1cm5zIHtNb25nby5Db2xsZWN0aW9ufSBJbnN0YW5jZVxuICAgKi9cbiAgZGVueUNsaWVudCgpIHtcbiAgICB0aGlzLmNvbGxlY3Rpb24uZGVueSh7XG4gICAgICBpbnNlcnQoKSB7IHJldHVybiB0cnVlOyB9LFxuICAgICAgdXBkYXRlKCkgeyByZXR1cm4gdHJ1ZTsgfSxcbiAgICAgIHJlbW92ZSgpIHsgcmV0dXJuIHRydWU7IH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlck9mIEZpbGVzQ29sbGVjdGlvblxuICAgKiBAbmFtZSBhbGxvd0NsaWVudFxuICAgKiBAc2VlIGh0dHBzOi8vZG9jcy5tZXRlb3IuY29tL2FwaS9jb2xsZWN0aW9ucy5odG1sI01vbmdvLUNvbGxlY3Rpb24tYWxsb3dcbiAgICogQHN1bW1hcnkgU2hvcnRoYW5kcyBmb3IgTW9uZ28uQ29sbGVjdGlvbiBhbGxvdyBtZXRob2RcbiAgICogQHJldHVybnMge01vbmdvLkNvbGxlY3Rpb259IEluc3RhbmNlXG4gICAqL1xuICBhbGxvd0NsaWVudCgpIHtcbiAgICB0aGlzLmNvbGxlY3Rpb24uYWxsb3coe1xuICAgICAgaW5zZXJ0KCkgeyByZXR1cm4gdHJ1ZTsgfSxcbiAgICAgIHVwZGF0ZSgpIHsgcmV0dXJuIHRydWU7IH0sXG4gICAgICByZW1vdmUoKSB7IHJldHVybiB0cnVlOyB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbjtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlck9mIEZpbGVzQ29sbGVjdGlvblxuICAgKiBAbmFtZSB1bmxpbmtcbiAgICogQHBhcmFtIHtPYmplY3R9IGZpbGVSZWYgLSBmaWxlT2JqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB2ZXJzaW9uIC0gW09wdGlvbmFsXSBmaWxlJ3MgdmVyc2lvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIFtPcHRpb25hbF0gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogQHN1bW1hcnkgVW5saW5rIGZpbGVzIGFuZCBpdCdzIHZlcnNpb25zIGZyb20gRlNcbiAgICogQHJldHVybnMge0ZpbGVzQ29sbGVjdGlvbn0gSW5zdGFuY2VcbiAgICovXG4gIHVubGluayhmaWxlUmVmLCB2ZXJzaW9uLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbdW5saW5rKCR7ZmlsZVJlZi5faWR9LCAke3ZlcnNpb259KV1gKTtcbiAgICBpZiAodmVyc2lvbikge1xuICAgICAgaWYgKGhlbHBlcnMuaXNPYmplY3QoZmlsZVJlZi52ZXJzaW9ucykgJiYgaGVscGVycy5pc09iamVjdChmaWxlUmVmLnZlcnNpb25zW3ZlcnNpb25dKSAmJiBmaWxlUmVmLnZlcnNpb25zW3ZlcnNpb25dLnBhdGgpIHtcbiAgICAgICAgZnMudW5saW5rKGZpbGVSZWYudmVyc2lvbnNbdmVyc2lvbl0ucGF0aCwgKGNhbGxiYWNrIHx8IG5vb3ApKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGhlbHBlcnMuaXNPYmplY3QoZmlsZVJlZi52ZXJzaW9ucykpIHtcbiAgICAgICAgZm9yKGxldCB2S2V5IGluIGZpbGVSZWYudmVyc2lvbnMpIHtcbiAgICAgICAgICBpZiAoZmlsZVJlZi52ZXJzaW9uc1t2S2V5XSAmJiBmaWxlUmVmLnZlcnNpb25zW3ZLZXldLnBhdGgpIHtcbiAgICAgICAgICAgIGZzLnVubGluayhmaWxlUmVmLnZlcnNpb25zW3ZLZXldLnBhdGgsIChjYWxsYmFjayB8fCBub29wKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmcy51bmxpbmsoZmlsZVJlZi5wYXRoLCAoY2FsbGJhY2sgfHwgbm9vcCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25cbiAgICogQG5hbWUgXzQwNFxuICAgKiBAc3VtbWFyeSBJbnRlcm5hbCBtZXRob2QsIHVzZWQgdG8gcmV0dXJuIDQwNCBlcnJvclxuICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgKi9cbiAgXzQwNChodHRwKSB7XG4gICAgdGhpcy5fZGVidWcoYFtGaWxlc0NvbGxlY3Rpb25dIFtkb3dubG9hZCgke2h0dHAucmVxdWVzdC5vcmlnaW5hbFVybH0pXSBbXzQwNF0gRmlsZSBub3QgZm91bmRgKTtcbiAgICBjb25zdCB0ZXh0ID0gJ0ZpbGUgTm90IEZvdW5kIDooJztcblxuICAgIGlmICghaHR0cC5yZXNwb25zZS5oZWFkZXJzU2VudCkge1xuICAgICAgaHR0cC5yZXNwb25zZS53cml0ZUhlYWQoNDA0LCB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAndGV4dC9wbGFpbicsXG4gICAgICAgICdDb250ZW50LUxlbmd0aCc6IHRleHQubGVuZ3RoXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWh0dHAucmVzcG9uc2UuZmluaXNoZWQpIHtcbiAgICAgIGh0dHAucmVzcG9uc2UuZW5kKHRleHQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25cbiAgICogQG5hbWUgZG93bmxvYWRcbiAgICogQHBhcmFtIHtPYmplY3R9IGh0dHAgICAgLSBTZXJ2ZXIgSFRUUCBvYmplY3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IHZlcnNpb24gLSBSZXF1ZXN0ZWQgZmlsZSB2ZXJzaW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBmaWxlUmVmIC0gUmVxdWVzdGVkIGZpbGUgT2JqZWN0XG4gICAqIEBzdW1tYXJ5IEluaXRpYXRlcyB0aGUgSFRUUCByZXNwb25zZVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx1bmRlZmluZWQ+fVxuICAgKi9cbiAgYXN5bmMgZG93bmxvYWQoaHR0cCwgdmVyc2lvbiA9ICdvcmlnaW5hbCcsIGZpbGVSZWYpIHtcbiAgICBsZXQgdlJlZjtcbiAgICB0aGlzLl9kZWJ1ZyhcbiAgICAgIGBbRmlsZXNDb2xsZWN0aW9uXSBbZG93bmxvYWQoJHtodHRwLnJlcXVlc3Qub3JpZ2luYWxVcmx9LCAke3ZlcnNpb259KV1gXG4gICAgKTtcblxuICAgIGlmIChmaWxlUmVmKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGhlbHBlcnMuaGFzKGZpbGVSZWYsICd2ZXJzaW9ucycpICYmXG4gICAgICAgIGhlbHBlcnMuaGFzKGZpbGVSZWYudmVyc2lvbnMsIHZlcnNpb24pXG4gICAgICApIHtcbiAgICAgICAgdlJlZiA9IGZpbGVSZWYudmVyc2lvbnNbdmVyc2lvbl07XG4gICAgICAgIHZSZWYuX2lkID0gZmlsZVJlZi5faWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2UmVmID0gZmlsZVJlZjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdlJlZiA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghdlJlZiB8fCAhaGVscGVycy5pc09iamVjdCh2UmVmKSkge1xuICAgICAgcmV0dXJuIHRoaXMuXzQwNChodHRwKTtcbiAgICB9IGVsc2UgaWYgKGZpbGVSZWYpIHtcbiAgICAgIGlmIChcbiAgICAgICAgaGVscGVycy5pc0Z1bmN0aW9uKHRoaXMuZG93bmxvYWRDYWxsYmFjaykgJiZcbiAgICAgICAgIShhd2FpdCB0aGlzLmRvd25sb2FkQ2FsbGJhY2soXG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihodHRwLCB0aGlzLl9nZXRVc2VyKGh0dHApKSxcbiAgICAgICAgICBmaWxlUmVmXG4gICAgICAgICkpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuXzQwNChodHRwKTtcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmludGVyY2VwdERvd25sb2FkICYmXG4gICAgICAgIGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLmludGVyY2VwdERvd25sb2FkKSAmJlxuICAgICAgICAoYXdhaXQgdGhpcy5pbnRlcmNlcHREb3dubG9hZChodHRwLCBmaWxlUmVmLCB2ZXJzaW9uKSkgPT09IHRydWVcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuXG4gICAgICBsZXQgc3RhdHM7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHN0YXRzID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdCh2UmVmLnBhdGgpO1xuICAgICAgfSBjYXRjaCAoc3RhdEVycil7XG4gICAgICAgIGlmIChzdGF0RXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuXzQwNChodHRwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fNDA0KGh0dHApO1xuICAgICAgfVxuICAgICAgbGV0IHJlc3BvbnNlVHlwZTtcblxuICAgICAgaWYgKHN0YXRzLnNpemUgIT09IHZSZWYuc2l6ZSAmJiAhdGhpcy5pbnRlZ3JpdHlDaGVjaykge1xuICAgICAgICB2UmVmLnNpemUgPSBzdGF0cy5zaXplO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdHMuc2l6ZSAhPT0gdlJlZi5zaXplICYmIHRoaXMuaW50ZWdyaXR5Q2hlY2spIHtcbiAgICAgICAgcmVzcG9uc2VUeXBlID0gJzQwMCc7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2VydmUoXG4gICAgICAgIGh0dHAsXG4gICAgICAgIGZpbGVSZWYsXG4gICAgICAgIHZSZWYsXG4gICAgICAgIHZlcnNpb24sXG4gICAgICAgIG51bGwsXG4gICAgICAgIHJlc3BvbnNlVHlwZSB8fCAnMjAwJ1xuICAgICAgKTtcblxuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuXzQwNChodHRwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25cbiAgICogQG5hbWUgc2VydmVcbiAgICogQHBhcmFtIHtPYmplY3R9IGh0dHAgICAgLSBTZXJ2ZXIgSFRUUCBvYmplY3RcbiAgICogQHBhcmFtIHtPYmplY3R9IGZpbGVSZWYgLSBSZXF1ZXN0ZWQgZmlsZSBPYmplY3RcbiAgICogQHBhcmFtIHtPYmplY3R9IHZSZWYgICAgLSBSZXF1ZXN0ZWQgZmlsZSB2ZXJzaW9uIE9iamVjdFxuICAgKiBAcGFyYW0ge1N0cmluZ30gdmVyc2lvbiAtIFJlcXVlc3RlZCBmaWxlIHZlcnNpb25cbiAgICogQHBhcmFtIHtzdHJlYW0uUmVhZGFibGV8bnVsbH0gcmVhZGFibGVTdHJlYW0gLSBSZWFkYWJsZSBzdHJlYW0sIHdoaWNoIHNlcnZlcyBiaW5hcnkgZmlsZSBkYXRhXG4gICAqIEBwYXJhbSB7U3RyaW5nfSByZXNwb25zZVR5cGUgLSBSZXNwb25zZSBjb2RlXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZm9yY2UyMDAgLSBGb3JjZSAyMDAgcmVzcG9uc2UgY29kZSBvdmVyIDIwNlxuICAgKiBAc3VtbWFyeSBIYW5kbGUgYW5kIHJlcGx5IHRvIGluY29taW5nIHJlcXVlc3RcbiAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICovXG4gIHNlcnZlKGh0dHAsIGZpbGVSZWYsIHZSZWYsIHZlcnNpb24gPSAnb3JpZ2luYWwnLCByZWFkYWJsZVN0cmVhbSA9IG51bGwsIF9yZXNwb25zZVR5cGUgPSAnMjAwJywgZm9yY2UyMDAgPSBmYWxzZSkge1xuICAgIGxldCBwYXJ0aXJhbCA9IGZhbHNlO1xuICAgIGxldCByZXFSYW5nZSA9IGZhbHNlO1xuICAgIGxldCBkaXNwb3NpdGlvblR5cGUgPSAnJztcbiAgICBsZXQgc3RhcnQ7XG4gICAgbGV0IGVuZDtcbiAgICBsZXQgdGFrZTtcbiAgICBsZXQgcmVzcG9uc2VUeXBlID0gX3Jlc3BvbnNlVHlwZTtcblxuICAgIGlmIChodHRwLnBhcmFtcz8ucXVlcnk/LmRvd25sb2FkICYmIChodHRwLnBhcmFtcy5xdWVyeS5kb3dubG9hZCA9PT0gJ3RydWUnKSkge1xuICAgICAgZGlzcG9zaXRpb25UeXBlID0gJ2F0dGFjaG1lbnQ7ICc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpc3Bvc2l0aW9uVHlwZSA9ICdpbmxpbmU7ICc7XG4gICAgfVxuXG4gICAgY29uc3QgZGlzcG9zaXRpb25OYW1lID0gYGZpbGVuYW1lPVxcXCIke2VuY29kZVVSSSh2UmVmLm5hbWUgfHwgZmlsZVJlZi5uYW1lKS5yZXBsYWNlKC9cXCwvZywgJyUyQycpfVxcXCI7IGZpbGVuYW1lKj1VVEYtOCcnJHtlbmNvZGVVUklDb21wb25lbnQodlJlZi5uYW1lIHx8IGZpbGVSZWYubmFtZSl9OyBgO1xuICAgIGNvbnN0IGRpc3Bvc2l0aW9uRW5jb2RpbmcgPSAnY2hhcnNldD1VVEYtOCc7XG5cbiAgICBpZiAoIWh0dHAucmVzcG9uc2UuaGVhZGVyc1NlbnQpIHtcbiAgICAgIGh0dHAucmVzcG9uc2Uuc2V0SGVhZGVyKCdDb250ZW50LURpc3Bvc2l0aW9uJywgZGlzcG9zaXRpb25UeXBlICsgZGlzcG9zaXRpb25OYW1lICsgZGlzcG9zaXRpb25FbmNvZGluZyk7XG4gICAgfVxuXG4gICAgaWYgKGh0dHAucmVxdWVzdC5oZWFkZXJzLnJhbmdlICYmICFmb3JjZTIwMCkge1xuICAgICAgcGFydGlyYWwgPSB0cnVlO1xuICAgICAgY29uc3QgYXJyYXkgPSBodHRwLnJlcXVlc3QuaGVhZGVycy5yYW5nZS5zcGxpdCgvYnl0ZXM9KFswLTldKiktKFswLTldKikvKTtcbiAgICAgIHN0YXJ0ID0gcGFyc2VJbnQoYXJyYXlbMV0pO1xuICAgICAgZW5kID0gcGFyc2VJbnQoYXJyYXlbMl0pO1xuICAgICAgaWYgKGlzTmFOKGVuZCkpIHtcbiAgICAgICAgZW5kID0gdlJlZi5zaXplIC0gMTtcbiAgICAgIH1cbiAgICAgIHRha2UgPSBlbmQgLSBzdGFydDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhcnQgPSAwO1xuICAgICAgZW5kID0gdlJlZi5zaXplIC0gMTtcbiAgICAgIHRha2UgPSB2UmVmLnNpemU7XG4gICAgfVxuXG4gICAgaWYgKHBhcnRpcmFsIHx8IChodHRwLnBhcmFtcz8ucXVlcnk/LnBsYXkgJiYgKGh0dHAucGFyYW1zLnF1ZXJ5LnBsYXkgPT09ICd0cnVlJykpKSB7XG4gICAgICByZXFSYW5nZSA9IHtzdGFydCwgZW5kfTtcbiAgICAgIGlmIChpc05hTihzdGFydCkgJiYgIWlzTmFOKGVuZCkpIHtcbiAgICAgICAgcmVxUmFuZ2Uuc3RhcnQgPSBlbmQgLSB0YWtlO1xuICAgICAgICByZXFSYW5nZS5lbmQgPSBlbmQ7XG4gICAgICB9XG4gICAgICBpZiAoIWlzTmFOKHN0YXJ0KSAmJiBpc05hTihlbmQpKSB7XG4gICAgICAgIHJlcVJhbmdlLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIHJlcVJhbmdlLmVuZCA9IHN0YXJ0ICsgdGFrZTtcbiAgICAgIH1cblxuICAgICAgaWYgKChzdGFydCArIHRha2UpID49IHZSZWYuc2l6ZSkge1xuICAgICAgICByZXFSYW5nZS5lbmQgPSB2UmVmLnNpemUgLSAxO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zdHJpY3QgJiYgKChyZXFSYW5nZS5zdGFydCA+PSAodlJlZi5zaXplIC0gMSkpIHx8IChyZXFSYW5nZS5lbmQgPiAodlJlZi5zaXplIC0gMSkpKSkge1xuICAgICAgICByZXNwb25zZVR5cGUgPSAnNDE2JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3BvbnNlVHlwZSA9ICcyMDYnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXNwb25zZVR5cGUgPSAnMjAwJztcbiAgICB9XG5cbiAgICBjb25zdCBzdHJlYW1FcnJvckhhbmRsZXIgPSAoZXJyb3IpID0+IHtcbiAgICAgIHRoaXMuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbc2VydmUoJHt2UmVmLnBhdGh9LCAke3ZlcnNpb259KV0gWzUwMF1gLCBlcnJvcik7XG4gICAgICBpZiAoIWh0dHAucmVzcG9uc2UuZmluaXNoZWQpIHtcbiAgICAgICAgaHR0cC5yZXNwb25zZS5lbmQoZXJyb3IudG9TdHJpbmcoKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IGhlYWRlcnMgPSBoZWxwZXJzLmlzRnVuY3Rpb24odGhpcy5yZXNwb25zZUhlYWRlcnMpID8gdGhpcy5yZXNwb25zZUhlYWRlcnMocmVzcG9uc2VUeXBlLCBmaWxlUmVmLCB2UmVmLCB2ZXJzaW9uLCBodHRwKSA6IHRoaXMucmVzcG9uc2VIZWFkZXJzO1xuXG4gICAgaWYgKCFoZWFkZXJzWydDYWNoZS1Db250cm9sJ10pIHtcbiAgICAgIGlmICghaHR0cC5yZXNwb25zZS5oZWFkZXJzU2VudCkge1xuICAgICAgICBodHRwLnJlc3BvbnNlLnNldEhlYWRlcignQ2FjaGUtQ29udHJvbCcsIHRoaXMuY2FjaGVDb250cm9sKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBrZXkgaW4gaGVhZGVycykge1xuICAgICAgaWYgKCFodHRwLnJlc3BvbnNlLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIGh0dHAucmVzcG9uc2Uuc2V0SGVhZGVyKGtleSwgaGVhZGVyc1trZXldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25kID0gKHN0cmVhbSwgY29kZSkgPT4ge1xuICAgICAgc3RyZWFtLl9pc0VuZGVkID0gZmFsc2U7XG4gICAgICBjb25zdCBjbG9zZVN0cmVhbUNiID0gKGNsb3NlRXJyb3IpID0+IHtcbiAgICAgICAgaWYgKCFjbG9zZUVycm9yKSB7XG4gICAgICAgICAgc3RyZWFtLl9pc0VuZGVkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9kZWJ1ZyhgW0ZpbGVzQ29sbGVjdGlvbl0gW3NlcnZlKCR7dlJlZi5wYXRofSwgJHt2ZXJzaW9ufSldIFtyZXNwb25kXSBbY2xvc2VTdHJlYW1DYl0gKHRoaXMgaXMgZXJyb3Igb24gdGhlIHN0cmVhbSB3ZSB3aXNoIHRvIGZvcmNlZnVsbHkgY2xvc2UgYWZ0ZXIgaXQgaXNuJ3QgbmVlZGVkIGFueW1vcmUuIEl0J3Mgb2theSB0aGF0IGl0IHRocm93cyBlcnJvcnMuIENvbnNpZGVyIHRoaXMgYXMgcHVyZWx5IGluZm9ybWF0aW9uYWwgbWVzc2FnZSlgLCBjbG9zZUVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY29uc3QgY2xvc2VTdHJlYW0gPSAoKSA9PiB7XG4gICAgICAgIGlmICghc3RyZWFtLl9pc0VuZGVkICYmICFzdHJlYW0uZGVzdHJveWVkKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RyZWFtLmNsb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIHN0cmVhbS5jbG9zZShjbG9zZVN0cmVhbUNiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHN0cmVhbS5lbmQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgc3RyZWFtLmVuZChjbG9zZVN0cmVhbUNiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHN0cmVhbS5kZXN0cm95ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIHN0cmVhbS5kZXN0cm95KCdHb3QgdG8gY2xvc2UgdGhpcyBzdHJlYW0nLCBjbG9zZVN0cmVhbUNiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChjbG9zZVN0cmVhbUVycm9yKSB7XG4gICAgICAgICAgICAvLyBQZXJoYXBzIG9uZSBvZiB0aGUgbWV0aG9kIGhhcyB0aHJvd24gYW4gZXJyb3JcbiAgICAgICAgICAgIC8vIG9yIHN0cmVhbSBoYXMgYmVlbiBhbHJlYWR5IGVuZGVkL2Nsb3NlZC9leGhhdXN0ZWRcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmICghaHR0cC5yZXNwb25zZS5oZWFkZXJzU2VudCAmJiByZWFkYWJsZVN0cmVhbSkge1xuICAgICAgICBodHRwLnJlc3BvbnNlLndyaXRlSGVhZChjb2RlKTtcbiAgICAgIH1cblxuICAgICAgaHR0cC5yZXF1ZXN0Lm9uKCdhYm9ydGVkJywgKCkgPT4ge1xuICAgICAgICBodHRwLnJlcXVlc3QuYWJvcnRlZCA9IHRydWU7XG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtLm9uKCdvcGVuJywgKCkgPT4ge1xuICAgICAgICBpZiAoIWh0dHAucmVzcG9uc2UuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgICBodHRwLnJlc3BvbnNlLndyaXRlSGVhZChjb2RlKTtcbiAgICAgICAgfVxuICAgICAgfSkub24oJ2Fib3J0JywgKCkgPT4ge1xuICAgICAgICBjbG9zZVN0cmVhbSgpO1xuICAgICAgICBpZiAoIWh0dHAucmVzcG9uc2UuZmluaXNoZWQpIHtcbiAgICAgICAgICBodHRwLnJlc3BvbnNlLmVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaHR0cC5yZXF1ZXN0LmFib3J0ZWQpIHtcbiAgICAgICAgICBodHRwLnJlcXVlc3QuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICB9KS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgIGNsb3NlU3RyZWFtKCk7XG4gICAgICAgIHN0cmVhbUVycm9ySGFuZGxlcihlcnIpO1xuICAgICAgfSkub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgaWYgKCFodHRwLnJlc3BvbnNlLmZpbmlzaGVkKSB7XG4gICAgICAgICAgaHR0cC5yZXNwb25zZS5lbmQoKTtcbiAgICAgICAgfVxuICAgICAgfSkucGlwZShodHRwLnJlc3BvbnNlKTtcbiAgICB9O1xuXG4gICAgc3dpdGNoIChyZXNwb25zZVR5cGUpIHtcbiAgICBjYXNlICc0MDAnOlxuICAgICAgdGhpcy5fZGVidWcoYFtGaWxlc0NvbGxlY3Rpb25dIFtzZXJ2ZSgke3ZSZWYucGF0aH0sICR7dmVyc2lvbn0pXSBbNDAwXSBDb250ZW50LUxlbmd0aCBtaXNtYXRjaCFgKTtcbiAgICAgIHZhciB0ZXh0ID0gJ0NvbnRlbnQtTGVuZ3RoIG1pc21hdGNoISc7XG5cbiAgICAgIGlmICghaHR0cC5yZXNwb25zZS5oZWFkZXJzU2VudCkge1xuICAgICAgICBodHRwLnJlc3BvbnNlLndyaXRlSGVhZCg0MDAsIHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ3RleHQvcGxhaW4nLFxuICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IHRleHQubGVuZ3RoXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWh0dHAucmVzcG9uc2UuZmluaXNoZWQpIHtcbiAgICAgICAgaHR0cC5yZXNwb25zZS5lbmQodGV4dCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICc0MDQnOlxuICAgICAgdGhpcy5fNDA0KGh0dHApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnNDE2JzpcbiAgICAgIHRoaXMuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbc2VydmUoJHt2UmVmLnBhdGh9LCAke3ZlcnNpb259KV0gWzQxNl0gQ29udGVudC1SYW5nZSBpcyBub3Qgc3BlY2lmaWVkIWApO1xuICAgICAgaWYgKCFodHRwLnJlc3BvbnNlLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIGh0dHAucmVzcG9uc2Uud3JpdGVIZWFkKDQxNik7XG4gICAgICB9XG4gICAgICBpZiAoIWh0dHAucmVzcG9uc2UuZmluaXNoZWQpIHtcbiAgICAgICAgaHR0cC5yZXNwb25zZS5lbmQoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJzIwNic6XG4gICAgICB0aGlzLl9kZWJ1ZyhgW0ZpbGVzQ29sbGVjdGlvbl0gW3NlcnZlKCR7dlJlZi5wYXRofSwgJHt2ZXJzaW9ufSldIFsyMDZdYCk7XG4gICAgICBpZiAoIWh0dHAucmVzcG9uc2UuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgaHR0cC5yZXNwb25zZS5zZXRIZWFkZXIoJ0NvbnRlbnQtUmFuZ2UnLCBgYnl0ZXMgJHtyZXFSYW5nZS5zdGFydH0tJHtyZXFSYW5nZS5lbmR9LyR7dlJlZi5zaXplfWApO1xuICAgICAgfVxuICAgICAgcmVzcG9uZChyZWFkYWJsZVN0cmVhbSB8fCBmcy5jcmVhdGVSZWFkU3RyZWFtKHZSZWYucGF0aCwge3N0YXJ0OiByZXFSYW5nZS5zdGFydCwgZW5kOiByZXFSYW5nZS5lbmR9KSwgMjA2KTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoIWh0dHAucmVzcG9uc2UuaGVhZGVyc1NlbnQpIHtcbiAgICAgICAgaHR0cC5yZXNwb25zZS5zZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJywgYCR7dlJlZi5zaXplfWApO1xuICAgICAgfVxuICAgICAgdGhpcy5fZGVidWcoYFtGaWxlc0NvbGxlY3Rpb25dIFtzZXJ2ZSgke3ZSZWYucGF0aH0sICR7dmVyc2lvbn0pXSBbMjAwXWApO1xuICAgICAgcmVzcG9uZChyZWFkYWJsZVN0cmVhbSB8fCBmcy5jcmVhdGVSZWFkU3RyZWFtKHZSZWYucGF0aCksIDIwMCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgRmlsZXNDb2xsZWN0aW9uLCBoZWxwZXJzIH07XG4iLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudGVtaXR0ZXIzJztcbmltcG9ydCB7IGNoZWNrLCBNYXRjaCB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBmb3JtYXRGbGVVUkwsIGhlbHBlcnMgfSBmcm9tICcuL2xpYi5qcyc7XG5pbXBvcnQgeyBGaWxlc0N1cnNvciwgRmlsZUN1cnNvciB9IGZyb20gJy4vY3Vyc29yLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmlsZXNDb2xsZWN0aW9uQ29yZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBzdGF0aWMgX19oZWxwZXJzID0gaGVscGVycztcblxuICBzdGF0aWMgc2NoZW1hID0ge1xuICAgIF9pZDoge1xuICAgICAgdHlwZTogU3RyaW5nXG4gICAgfSxcbiAgICBzaXplOiB7XG4gICAgICB0eXBlOiBOdW1iZXJcbiAgICB9LFxuICAgIG5hbWU6IHtcbiAgICAgIHR5cGU6IFN0cmluZ1xuICAgIH0sXG4gICAgdHlwZToge1xuICAgICAgdHlwZTogU3RyaW5nXG4gICAgfSxcbiAgICBwYXRoOiB7XG4gICAgICB0eXBlOiBTdHJpbmdcbiAgICB9LFxuICAgIGlzVmlkZW86IHtcbiAgICAgIHR5cGU6IEJvb2xlYW5cbiAgICB9LFxuICAgIGlzQXVkaW86IHtcbiAgICAgIHR5cGU6IEJvb2xlYW5cbiAgICB9LFxuICAgIGlzSW1hZ2U6IHtcbiAgICAgIHR5cGU6IEJvb2xlYW5cbiAgICB9LFxuICAgIGlzVGV4dDoge1xuICAgICAgdHlwZTogQm9vbGVhblxuICAgIH0sXG4gICAgaXNKU09OOiB7XG4gICAgICB0eXBlOiBCb29sZWFuXG4gICAgfSxcbiAgICBpc1BERjoge1xuICAgICAgdHlwZTogQm9vbGVhblxuICAgIH0sXG4gICAgZXh0ZW5zaW9uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBvcHRpb25hbDogdHJ1ZVxuICAgIH0sXG4gICAgZXh0OiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBvcHRpb25hbDogdHJ1ZVxuICAgIH0sXG4gICAgZXh0ZW5zaW9uV2l0aERvdDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9LFxuICAgIG1pbWU6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIG9wdGlvbmFsOiB0cnVlXG4gICAgfSxcbiAgICAnbWltZS10eXBlJzoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9LFxuICAgIF9zdG9yYWdlUGF0aDoge1xuICAgICAgdHlwZTogU3RyaW5nXG4gICAgfSxcbiAgICBfZG93bmxvYWRSb3V0ZToge1xuICAgICAgdHlwZTogU3RyaW5nXG4gICAgfSxcbiAgICBfY29sbGVjdGlvbk5hbWU6IHtcbiAgICAgIHR5cGU6IFN0cmluZ1xuICAgIH0sXG4gICAgcHVibGljOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9LFxuICAgIG1ldGE6IHtcbiAgICAgIHR5cGU6IE9iamVjdCxcbiAgICAgIGJsYWNrYm94OiB0cnVlLFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9LFxuICAgIHVzZXJJZDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgICB9LFxuICAgIHVwZGF0ZWRBdDoge1xuICAgICAgdHlwZTogRGF0ZSxcbiAgICAgIG9wdGlvbmFsOiB0cnVlXG4gICAgfSxcbiAgICB2ZXJzaW9uczoge1xuICAgICAgdHlwZTogT2JqZWN0LFxuICAgICAgYmxhY2tib3g6IHRydWVcbiAgICB9XG4gIH07XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25Db3JlXG4gICAqIEBuYW1lIF9kZWJ1Z1xuICAgKiBAc3VtbWFyeSBQcmludCBsb2dzIGluIGRlYnVnIG1vZGVcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBfZGVidWcoKSB7XG4gICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAoY29uc29sZS5pbmZvIHx8IGNvbnNvbGUubG9nIHx8IGZ1bmN0aW9uICgpIHt9KS5hcHBseSh2b2lkIDAsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25Db3JlXG4gICAqIEBuYW1lIF9nZXRGaWxlTmFtZVxuICAgKiBAcGFyYW0ge09iamVjdH0gZmlsZURhdGEgLSBGaWxlIE9iamVjdFxuICAgKiBAc3VtbWFyeSBSZXR1cm5zIGZpbGUncyBuYW1lXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAqL1xuICBfZ2V0RmlsZU5hbWUoZmlsZURhdGEpIHtcbiAgICBjb25zdCBmaWxlTmFtZSA9IGZpbGVEYXRhLm5hbWUgfHwgZmlsZURhdGEuZmlsZU5hbWU7XG4gICAgaWYgKGhlbHBlcnMuaXNTdHJpbmcoZmlsZU5hbWUpICYmIChmaWxlTmFtZS5sZW5ndGggPiAwKSkge1xuICAgICAgcmV0dXJuIChmaWxlRGF0YS5uYW1lIHx8IGZpbGVEYXRhLmZpbGVOYW1lKS5yZXBsYWNlKC9eXFwuXFwuKy8sICcnKS5yZXBsYWNlKC9cXC57Mix9L2csICcuJykucmVwbGFjZSgvXFwvL2csICcnKTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25Db3JlXG4gICAqIEBuYW1lIF9nZXRFeHRcbiAgICogQHBhcmFtIHtTdHJpbmd9IEZpbGVOYW1lIC0gRmlsZSBuYW1lXG4gICAqIEBzdW1tYXJ5IEdldCBleHRlbnNpb24gZnJvbSBGaWxlTmFtZVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgKi9cbiAgX2dldEV4dChmaWxlTmFtZSkge1xuICAgIGlmIChmaWxlTmFtZS5pbmNsdWRlcygnLicpKSB7XG4gICAgICBjb25zdCBleHRlbnNpb24gPSAoZmlsZU5hbWUuc3BsaXQoJy4nKS5wb3AoKS5zcGxpdCgnPycpWzBdIHx8ICcnKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLyhbXmEtejAtOVxcLVxcX1xcLl0rKS9naSwgJycpLnN1YnN0cmluZygwLCAyMCk7XG4gICAgICByZXR1cm4geyBleHQ6IGV4dGVuc2lvbiwgZXh0ZW5zaW9uLCBleHRlbnNpb25XaXRoRG90OiBgLiR7ZXh0ZW5zaW9ufWAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHsgZXh0OiAnJywgZXh0ZW5zaW9uOiAnJywgZXh0ZW5zaW9uV2l0aERvdDogJycgfTtcbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgRmlsZXNDb2xsZWN0aW9uQ29yZVxuICAgKiBAbmFtZSBfdXBkYXRlRmlsZVR5cGVzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gRmlsZSBkYXRhXG4gICAqIEBzdW1tYXJ5IEludGVybmFsIG1ldGhvZC4gQ2xhc3NpZnkgZmlsZSBiYXNlZCBvbiAndHlwZScgZmllbGRcbiAgICovXG4gIF91cGRhdGVGaWxlVHlwZXMoZGF0YSkge1xuICAgIGRhdGEuaXNWaWRlbyA9IC9edmlkZW9cXC8vaS50ZXN0KGRhdGEudHlwZSk7XG4gICAgZGF0YS5pc0F1ZGlvID0gL15hdWRpb1xcLy9pLnRlc3QoZGF0YS50eXBlKTtcbiAgICBkYXRhLmlzSW1hZ2UgPSAvXmltYWdlXFwvL2kudGVzdChkYXRhLnR5cGUpO1xuICAgIGRhdGEuaXNUZXh0ID0gL150ZXh0XFwvL2kudGVzdChkYXRhLnR5cGUpO1xuICAgIGRhdGEuaXNKU09OID0gL15hcHBsaWNhdGlvblxcL2pzb24kL2kudGVzdChkYXRhLnR5cGUpO1xuICAgIGRhdGEuaXNQREYgPSAvXmFwcGxpY2F0aW9uXFwvKHgtKT9wZGYkL2kudGVzdChkYXRhLnR5cGUpO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25Db3JlXG4gICAqIEBuYW1lIF9kYXRhVG9TY2hlbWFcbiAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSBGaWxlIGRhdGFcbiAgICogQHN1bW1hcnkgSW50ZXJuYWwgbWV0aG9kLiBCdWlsZCBvYmplY3QgaW4gYWNjb3JkYW5jZSB3aXRoIGRlZmF1bHQgc2NoZW1hIGZyb20gRmlsZSBkYXRhXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAqL1xuICBfZGF0YVRvU2NoZW1hKGRhdGEpIHtcbiAgICBjb25zdCBkcyA9IHtcbiAgICAgIG5hbWU6IGRhdGEubmFtZSxcbiAgICAgIGV4dGVuc2lvbjogZGF0YS5leHRlbnNpb24sXG4gICAgICBleHQ6IGRhdGEuZXh0ZW5zaW9uLFxuICAgICAgZXh0ZW5zaW9uV2l0aERvdDogYC4ke2RhdGEuZXh0ZW5zaW9ufWAsXG4gICAgICBwYXRoOiBkYXRhLnBhdGgsXG4gICAgICBtZXRhOiBkYXRhLm1ldGEsXG4gICAgICB0eXBlOiBkYXRhLnR5cGUsXG4gICAgICBtaW1lOiBkYXRhLnR5cGUsXG4gICAgICAnbWltZS10eXBlJzogZGF0YS50eXBlLFxuICAgICAgc2l6ZTogZGF0YS5zaXplLFxuICAgICAgdXNlcklkOiBkYXRhLnVzZXJJZCB8fCBudWxsLFxuICAgICAgdmVyc2lvbnM6IHtcbiAgICAgICAgb3JpZ2luYWw6IHtcbiAgICAgICAgICBwYXRoOiBkYXRhLnBhdGgsXG4gICAgICAgICAgc2l6ZTogZGF0YS5zaXplLFxuICAgICAgICAgIHR5cGU6IGRhdGEudHlwZSxcbiAgICAgICAgICBleHRlbnNpb246IGRhdGEuZXh0ZW5zaW9uXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBfZG93bmxvYWRSb3V0ZTogZGF0YS5fZG93bmxvYWRSb3V0ZSB8fCB0aGlzLmRvd25sb2FkUm91dGUsXG4gICAgICBfY29sbGVjdGlvbk5hbWU6IGRhdGEuX2NvbGxlY3Rpb25OYW1lIHx8IHRoaXMuY29sbGVjdGlvbk5hbWVcbiAgICB9O1xuXG4gICAgLy9PcHRpb25hbCBmaWxlSWRcbiAgICBpZiAoZGF0YS5maWxlSWQpIHtcbiAgICAgIGRzLl9pZCA9IGRhdGEuZmlsZUlkO1xuICAgIH1cblxuICAgIHRoaXMuX3VwZGF0ZUZpbGVUeXBlcyhkcyk7XG4gICAgZHMuX3N0b3JhZ2VQYXRoID0gZGF0YS5fc3RvcmFnZVBhdGggfHwgdGhpcy5zdG9yYWdlUGF0aChPYmplY3QuYXNzaWduKHt9LCBkYXRhLCBkcykpO1xuICAgIHJldHVybiBkcztcbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgRmlsZXNDb2xsZWN0aW9uQ29yZVxuICAgKiBAbmFtZSBmaW5kT25lQXN5bmNcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBzZWxlY3RvciAtIE1vbmdvLVN0eWxlIHNlbGVjdG9yIChodHRwOi8vZG9jcy5tZXRlb3IuY29tL2FwaS9jb2xsZWN0aW9ucy5odG1sI3NlbGVjdG9ycylcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBNb25nby1TdHlsZSBzZWxlY3RvciBPcHRpb25zIChodHRwOi8vZG9jcy5tZXRlb3IuY29tL2FwaS9jb2xsZWN0aW9ucy5odG1sI3NvcnRzcGVjaWZpZXJzKVxuICAgKiBAc3VtbWFyeSBGaW5kIGFuZCByZXR1cm4gQ3Vyc29yIGZvciBtYXRjaGluZyBkb2N1bWVudCBPYmplY3RcbiAgICogQHJldHVybnMge1Byb21pc2U8RmlsZUN1cnNvcj59IEluc3RhbmNlXG4gICAqL1xuICBhc3luYyBmaW5kT25lQXN5bmMoc2VsZWN0b3IgPSB7fSwgb3B0aW9ucykge1xuICAgIHRoaXMuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbZmluZE9uZUFzeW5jKCR7SlNPTi5zdHJpbmdpZnkoc2VsZWN0b3IpfSwgJHtKU09OLnN0cmluZ2lmeShvcHRpb25zKX0pXWApO1xuICAgIGNoZWNrKHNlbGVjdG9yLCBNYXRjaC5PcHRpb25hbChNYXRjaC5PbmVPZihPYmplY3QsIFN0cmluZywgQm9vbGVhbiwgTnVtYmVyLCBudWxsKSkpO1xuICAgIGNoZWNrKG9wdGlvbnMsIE1hdGNoLk9wdGlvbmFsKE9iamVjdCkpO1xuXG4gICAgY29uc3QgZG9jID0gYXdhaXQgdGhpcy5jb2xsZWN0aW9uLmZpbmRPbmVBc3luYyhzZWxlY3Rvciwgb3B0aW9ucyk7XG4gICAgaWYgKGRvYykge1xuICAgICAgcmV0dXJuIG5ldyBGaWxlQ3Vyc29yKGRvYywgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiBkb2M7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVzQ29sbGVjdGlvbkNvcmVcbiAgICogQG5hbWUgZmluZFxuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHNlbGVjdG9yIC0gTW9uZ28tU3R5bGUgc2VsZWN0b3IgKGh0dHA6Ly9kb2NzLm1ldGVvci5jb20vYXBpL2NvbGxlY3Rpb25zLmh0bWwjc2VsZWN0b3JzKVxuICAgKiBAcGFyYW0ge09iamVjdH0gICAgICAgIG9wdGlvbnMgIC0gTW9uZ28tU3R5bGUgc2VsZWN0b3IgT3B0aW9ucyAoaHR0cDovL2RvY3MubWV0ZW9yLmNvbS9hcGkvY29sbGVjdGlvbnMuaHRtbCNzb3J0c3BlY2lmaWVycylcbiAgICogQHN1bW1hcnkgRmluZCBhbmQgcmV0dXJuIEN1cnNvciBmb3IgbWF0Y2hpbmcgZG9jdW1lbnRzXG4gICAqIEByZXR1cm5zIHtGaWxlc0N1cnNvcn0gSW5zdGFuY2VcbiAgICovXG4gIGZpbmQoc2VsZWN0b3IgPSB7fSwgb3B0aW9ucykge1xuICAgIHRoaXMuX2RlYnVnKGBbRmlsZXNDb2xsZWN0aW9uXSBbZmluZCgke0pTT04uc3RyaW5naWZ5KHNlbGVjdG9yKX0sICR7SlNPTi5zdHJpbmdpZnkob3B0aW9ucyl9KV1gKTtcbiAgICBjaGVjayhzZWxlY3RvciwgTWF0Y2guT3B0aW9uYWwoTWF0Y2guT25lT2YoT2JqZWN0LCBTdHJpbmcsIEJvb2xlYW4sIE51bWJlciwgbnVsbCkpKTtcbiAgICBjaGVjayhvcHRpb25zLCBNYXRjaC5PcHRpb25hbChPYmplY3QpKTtcblxuICAgIHJldHVybiBuZXcgRmlsZXNDdXJzb3Ioc2VsZWN0b3IsIG9wdGlvbnMsIHRoaXMpO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25Db3JlXG4gICAqIEBuYW1lIHVwZGF0ZUFzeW5jXG4gICAqIEBzZWUgaHR0cDovL2RvY3MubWV0ZW9yLmNvbS8jL2Z1bGwvdXBkYXRlXG4gICAqIEBzdW1tYXJ5IGxpbmsgTW9uZ28uQ29sbGVjdGlvbiB1cGRhdGUgbWV0aG9kXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPE1vbmdvLkNvbGxlY3Rpb24+fSBJbnN0YW5jZVxuICAgKi9cbiAgYXN5bmMgdXBkYXRlQXN5bmMoKSB7XG4gICAgYXdhaXQgdGhpcy5jb2xsZWN0aW9uLnVwZGF0ZUFzeW5jLmFwcGx5KHRoaXMuY29sbGVjdGlvbiwgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0NvbGxlY3Rpb25Db3JlXG4gICAqIEBuYW1lIGxpbmtcbiAgICogQHBhcmFtIHtPYmplY3R9IGZpbGVSZWYgLSBGaWxlIHJlZmVyZW5jZSBvYmplY3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IHZlcnNpb24gLSBWZXJzaW9uIG9mIGZpbGUgeW91IHdvdWxkIGxpa2UgdG8gcmVxdWVzdFxuICAgKiBAcGFyYW0ge1N0cmluZ30gdXJpQmFzZSAtIFtPcHRpb25hbF0gVVJJIGJhc2UsIHNlZSAtIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWxpb3Zncm91cC9NZXRlb3ItRmlsZXMvaXNzdWVzLzYyNlxuICAgKiBAc3VtbWFyeSBSZXR1cm5zIGRvd25sb2FkYWJsZSBVUkxcbiAgICogQHJldHVybnMge1N0cmluZ30gRW1wdHkgc3RyaW5nIHJldHVybmVkIGluIGNhc2UgaWYgZmlsZSBub3QgZm91bmQgaW4gREJcbiAgICovXG4gIGxpbmsoZmlsZVJlZiwgdmVyc2lvbiA9ICdvcmlnaW5hbCcsIHVyaUJhc2UpIHtcbiAgICB0aGlzLl9kZWJ1ZyhgW0ZpbGVzQ29sbGVjdGlvbl0gW2xpbmsoJHsoaGVscGVycy5pc09iamVjdChmaWxlUmVmKSA/IGZpbGVSZWYuX2lkIDogdm9pZCAwKX0sICR7dmVyc2lvbn0pXWApO1xuICAgIGNoZWNrKGZpbGVSZWYsIE9iamVjdCk7XG5cbiAgICBpZiAoIWZpbGVSZWYpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIGZvcm1hdEZsZVVSTChmaWxlUmVmLCB2ZXJzaW9uLCB1cmlCYXNlKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8qXG4gKiBAcHJpdmF0ZVxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAY2xhc3MgRmlsZUN1cnNvclxuICogQHBhcmFtIF9maWxlUmVmICAgIHtPYmplY3R9IC0gTW9uZ28tU3R5bGUgc2VsZWN0b3IgKGh0dHA6Ly9kb2NzLm1ldGVvci5jb20vYXBpL2NvbGxlY3Rpb25zLmh0bWwjc2VsZWN0b3JzKVxuICogQHBhcmFtIF9jb2xsZWN0aW9uIHtGaWxlc0NvbGxlY3Rpb259IC0gRmlsZXNDb2xsZWN0aW9uIEluc3RhbmNlXG4gKiBAc3VtbWFyeSBJbnRlcm5hbCBjbGFzcywgcmVwcmVzZW50cyBlYWNoIHJlY29yZCBpbiBgRmlsZXNDdXJzb3IuZWFjaCgpYCBvciBkb2N1bWVudCByZXR1cm5lZCBmcm9tIGAuZmluZE9uZSgpYCBtZXRob2RcbiAqL1xuZXhwb3J0IGNsYXNzIEZpbGVDdXJzb3Ige1xuICBjb25zdHJ1Y3RvcihfZmlsZVJlZiwgX2NvbGxlY3Rpb24pIHtcbiAgICB0aGlzLl9maWxlUmVmID0gX2ZpbGVSZWY7XG4gICAgdGhpcy5fY29sbGVjdGlvbiA9IF9jb2xsZWN0aW9uO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcywgX2ZpbGVSZWYpO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlQ3Vyc29yXG4gICAqIEBuYW1lIHJlbW92ZUFzeW5jXG4gICAqIEB0aHJvd3Mge01ldGVvci5FcnJvcn0gLSBJZiBubyBmaWxlIHJlZmVyZW5jZSBpcyBwcm92aWRlZFxuICAgKiBAc3VtbWFyeSBSZW1vdmUgZG9jdW1lbnRcbiAgICogQHJldHVybnMge1Byb21pc2U8RmlsZUN1cnNvcj59XG4gICAqL1xuICBhc3luYyByZW1vdmVBc3luYygpIHtcbiAgICB0aGlzLl9jb2xsZWN0aW9uLl9kZWJ1ZygnW0ZpbGVzQ29sbGVjdGlvbl0gW0ZpbGVDdXJzb3JdIFtyZW1vdmVBc3luYygpXScpO1xuICAgIGlmICh0aGlzLl9maWxlUmVmKSB7XG4gICAgICBhd2FpdCB0aGlzLl9jb2xsZWN0aW9uLnJlbW92ZUFzeW5jKHRoaXMuX2ZpbGVSZWYuX2lkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDQsICdObyBzdWNoIGZpbGUnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVDdXJzb3JcbiAgICogQG5hbWUgbGlua1xuICAgKiBAcGFyYW0gdmVyc2lvbiB7U3RyaW5nfSAtIE5hbWUgb2YgZmlsZSdzIHN1YnZlcnNpb25cbiAgICogQHBhcmFtIHVyaUJhc2Uge1N0cmluZ30gLSBbT3B0aW9uYWxdIFVSSSBiYXNlLCBzZWUgLSBodHRwczovL2dpdGh1Yi5jb20vdmVsaW92Z3JvdXAvTWV0ZW9yLUZpbGVzL2lzc3Vlcy82MjZcbiAgICogQHN1bW1hcnkgUmV0dXJucyBkb3dubG9hZGFibGUgVVJMIHRvIEZpbGVcbiAgICogQHJldHVybnMge1N0cmluZ31cbiAgICovXG4gIGxpbmsodmVyc2lvbiA9ICdvcmlnaW5hbCcsIHVyaUJhc2UpIHtcbiAgICB0aGlzLl9jb2xsZWN0aW9uLl9kZWJ1ZyhgW0ZpbGVzQ29sbGVjdGlvbl0gW0ZpbGVDdXJzb3JdIFtsaW5rKCR7dmVyc2lvbn0pXWApO1xuICAgIGlmICh0aGlzLl9maWxlUmVmKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbi5saW5rKHRoaXMuX2ZpbGVSZWYsIHZlcnNpb24sIHVyaUJhc2UpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVDdXJzb3JcbiAgICogQG5hbWUgZ2V0XG4gICAqIEBwYXJhbSBwcm9wZXJ0eSB7U3RyaW5nfSAtIE5hbWUgb2Ygc3ViLW9iamVjdCBwcm9wZXJ0eVxuICAgKiBAc3VtbWFyeSBSZXR1cm5zIGN1cnJlbnQgZG9jdW1lbnQgYXMgYSBwbGFpbiBPYmplY3QsIGlmIGBwcm9wZXJ0eWAgaXMgc3BlY2lmaWVkIC0gcmV0dXJucyB2YWx1ZSBvZiBzdWItb2JqZWN0IHByb3BlcnR5XG4gICAqIEByZXR1cm5zIHtPYmplY3R8bWl4fVxuICAgKi9cbiAgZ2V0KHByb3BlcnR5KSB7XG4gICAgdGhpcy5fY29sbGVjdGlvbi5fZGVidWcoYFtGaWxlc0NvbGxlY3Rpb25dIFtGaWxlQ3Vyc29yXSBbZ2V0KCR7cHJvcGVydHl9KV1gKTtcbiAgICBpZiAocHJvcGVydHkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9maWxlUmVmW3Byb3BlcnR5XTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2ZpbGVSZWY7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVDdXJzb3JcbiAgICogQG5hbWUgZmV0Y2hcbiAgICogQHN1bW1hcnkgUmV0dXJucyBkb2N1bWVudCBhcyBwbGFpbiBPYmplY3QgaW4gQXJyYXlcbiAgICogQHJldHVybnMge1tPYmplY3RdfVxuICAgKi9cbiAgZmV0Y2goKSB7XG4gICAgdGhpcy5fY29sbGVjdGlvbi5fZGVidWcoJ1tGaWxlc0NvbGxlY3Rpb25dIFtGaWxlQ3Vyc29yXSBbZmV0Y2goKV0nKTtcbiAgICByZXR1cm4gW3RoaXMuX2ZpbGVSZWZdO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlQ3Vyc29yXG4gICAqIEBuYW1lIHdpdGhcbiAgICogQHN1bW1hcnkgUmV0dXJucyByZWFjdGl2ZSB2ZXJzaW9uIG9mIGN1cnJlbnQgRmlsZUN1cnNvciwgdXNlZnVsIHRvIHVzZSB3aXRoIGB7eyN3aXRofX0uLi57ey93aXRofX1gIGJsb2NrIHRlbXBsYXRlIGhlbHBlclxuICAgKiBAcmV0dXJucyB7W09iamVjdF19XG4gICAqL1xuICB3aXRoKCkge1xuICAgIHRoaXMuX2NvbGxlY3Rpb24uX2RlYnVnKCdbRmlsZXNDb2xsZWN0aW9uXSBbRmlsZUN1cnNvcl0gW3dpdGgoKV0nKTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih0aGlzLCB0aGlzLl9jb2xsZWN0aW9uLmNvbGxlY3Rpb24uZmluZE9uZSh0aGlzLl9maWxlUmVmLl9pZCkpO1xuICB9XG59XG5cbi8qXG4gKiBAcHJpdmF0ZVxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAY2xhc3MgRmlsZXNDdXJzb3JcbiAqIEBwYXJhbSBfc2VsZWN0b3IgICB7U3RyaW5nfE9iamVjdH0gICAtIE1vbmdvLVN0eWxlIHNlbGVjdG9yIChodHRwOi8vZG9jcy5tZXRlb3IuY29tL2FwaS9jb2xsZWN0aW9ucy5odG1sI3NlbGVjdG9ycylcbiAqIEBwYXJhbSBvcHRpb25zICAgICB7T2JqZWN0fSAgICAgICAgICAtIE1vbmdvLVN0eWxlIHNlbGVjdG9yIE9wdGlvbnMgKGh0dHA6Ly9kb2NzLm1ldGVvci5jb20vYXBpL2NvbGxlY3Rpb25zLmh0bWwjc2VsZWN0b3JzKVxuICogQHBhcmFtIF9jb2xsZWN0aW9uIHtGaWxlc0NvbGxlY3Rpb259IC0gRmlsZXNDb2xsZWN0aW9uIEluc3RhbmNlXG4gKiBAc3VtbWFyeSBJbXBsZW1lbnRhdGlvbiBvZiBDdXJzb3IgZm9yIEZpbGVzQ29sbGVjdGlvblxuICovXG5leHBvcnQgY2xhc3MgRmlsZXNDdXJzb3Ige1xuICBjb25zdHJ1Y3Rvcihfc2VsZWN0b3IgPSB7fSwgb3B0aW9ucywgX2NvbGxlY3Rpb24pIHtcbiAgICB0aGlzLl9jb2xsZWN0aW9uID0gX2NvbGxlY3Rpb247XG4gICAgdGhpcy5fc2VsZWN0b3IgPSBfc2VsZWN0b3I7XG4gICAgdGhpcy5fY3VycmVudCA9IC0xO1xuICAgIHRoaXMuY3Vyc29yID0gdGhpcy5fY29sbGVjdGlvbi5jb2xsZWN0aW9uLmZpbmQodGhpcy5fc2VsZWN0b3IsIG9wdGlvbnMpO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0N1cnNvclxuICAgKiBAbmFtZSBnZXRcbiAgICogQHN1bW1hcnkgUmV0dXJucyBhbGwgbWF0Y2hpbmcgZG9jdW1lbnQocykgYXMgYW4gQXJyYXkuIEFsaWFzIG9mIGAuZmV0Y2goKWBcbiAgICogQHJldHVybnMge1Byb21pc2U8W09iamVjdF0+fVxuICAgKi9cbiAgYXN5bmMgZ2V0KCkge1xuICAgIHRoaXMuX2NvbGxlY3Rpb24uX2RlYnVnKCdbRmlsZXNDb2xsZWN0aW9uXSBbRmlsZXNDdXJzb3JdIFtnZXRBc3luYygpXScpO1xuICAgIHJldHVybiB0aGlzLmN1cnNvci5mZXRjaEFzeW5jKCk7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVzQ3Vyc29yXG4gICAqIEBuYW1lIGhhc05leHRcbiAgICogQHN1bW1hcnkgUmV0dXJucyBgdHJ1ZWAgaWYgdGhlcmUgaXMgbmV4dCBpdGVtIGF2YWlsYWJsZSBvbiBDdXJzb3JcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqL1xuICBhc3luYyBoYXNOZXh0KCkge1xuICAgIHRoaXMuX2NvbGxlY3Rpb24uX2RlYnVnKCdbRmlsZXNDb2xsZWN0aW9uXSBbRmlsZXNDdXJzb3JdIFtoYXNOZXh0QXN5bmMoKV0nKTtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudCA8IChhd2FpdCB0aGlzLmN1cnNvci5jb3VudEFzeW5jKCkpIC0gMTtcbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgRmlsZXNDdXJzb3JcbiAgICogQG5hbWUgbmV4dFxuICAgKiBAc3VtbWFyeSBSZXR1cm5zIG5leHQgaXRlbSBvbiBDdXJzb3IsIGlmIGF2YWlsYWJsZVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3R8dW5kZWZpbmVkPn1cbiAgICovXG4gIGFzeW5jIG5leHQoKSB7XG4gICAgdGhpcy5fY29sbGVjdGlvbi5fZGVidWcoJ1tGaWxlc0NvbGxlY3Rpb25dIFtGaWxlc0N1cnNvcl0gW25leHRBc3luYygpXScpO1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5jdXJzb3IuZmV0Y2hBc3luYygpKVsrK3RoaXMuX2N1cnJlbnRdO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0N1cnNvclxuICAgKiBAbmFtZSBoYXNQcmV2aW91c1xuICAgKiBAc3VtbWFyeSBSZXR1cm5zIGB0cnVlYCBpZiB0aGVyZSBpcyBwcmV2aW91cyBpdGVtIGF2YWlsYWJsZSBvbiBDdXJzb3JcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqL1xuICBoYXNQcmV2aW91cygpIHtcbiAgICB0aGlzLl9jb2xsZWN0aW9uLl9kZWJ1ZygnW0ZpbGVzQ29sbGVjdGlvbl0gW0ZpbGVzQ3Vyc29yXSBbaGFzUHJldmlvdXMoKV0nKTtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudCAhPT0gLTE7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVzQ3Vyc29yXG4gICAqIEBuYW1lIHByZXZpb3VzXG4gICAqIEBzdW1tYXJ5IFJldHVybnMgcHJldmlvdXMgaXRlbSBvbiBDdXJzb3IsIGlmIGF2YWlsYWJsZVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3R8dW5kZWZpbmVkPn1cbiAgICovXG4gIGFzeW5jIHByZXZpb3VzKCkge1xuICAgIHRoaXMuX2NvbGxlY3Rpb24uX2RlYnVnKCdbRmlsZXNDb2xsZWN0aW9uXSBbRmlsZXNDdXJzb3JdIFtwcmV2aW91c0FzeW5jKCldJyk7XG4gICAgcmV0dXJuICh0aGlzLmN1cnNvci5mZXRjaEFzeW5jKCkpWy0tdGhpcy5fY3VycmVudF07XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVzQ3Vyc29yXG4gICAqIEBuYW1lIGZldGNoQXN5bmNcbiAgICogQHN1bW1hcnkgUmV0dXJucyBhbGwgbWF0Y2hpbmcgZG9jdW1lbnQocykgYXMgYW4gQXJyYXkuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPFtPYmplY3RdPn1cbiAgICovXG4gIGFzeW5jIGZldGNoQXN5bmMoKSB7XG4gICAgdGhpcy5fY29sbGVjdGlvbi5fZGVidWcoJ1tGaWxlc0NvbGxlY3Rpb25dIFtGaWxlc0N1cnNvcl0gW2ZldGNoQXN5bmMoKV0nKTtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuY3Vyc29yLmZldGNoQXN5bmMoKSkgfHwgW107XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVzQ3Vyc29yXG4gICAqIEBuYW1lIGZpcnN0XG4gICAqIEBzdW1tYXJ5IFJldHVybnMgZmlyc3QgaXRlbSBvbiBDdXJzb3IsIGlmIGF2YWlsYWJsZVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3R8dW5kZWZpbmVkPn1cbiAgICovXG4gIGFzeW5jIGZpcnN0KCkge1xuICAgIHRoaXMuX2NvbGxlY3Rpb24uX2RlYnVnKCdbRmlsZXNDb2xsZWN0aW9uXSBbRmlsZXNDdXJzb3JdIFtmaXJzdEFzeW5jKCldJyk7XG4gICAgdGhpcy5fY3VycmVudCA9IDA7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmZldGNoQXN5bmMoKSlbdGhpcy5fY3VycmVudF07XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVzQ3Vyc29yXG4gICAqIEBuYW1lIGxhc3RcbiAgICogQHN1bW1hcnkgUmV0dXJucyBsYXN0IGl0ZW0gb24gQ3Vyc29yLCBpZiBhdmFpbGFibGVcbiAgICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0fHVuZGVmaW5lZD59XG4gICAqL1xuICBhc3luYyBsYXN0KCkge1xuICAgIHRoaXMuX2NvbGxlY3Rpb24uX2RlYnVnKCdbRmlsZXNDb2xsZWN0aW9uXSBbRmlsZXNDdXJzb3JdIFtsYXN0KCldJyk7XG4gICAgdGhpcy5fY3VycmVudCA9IChhd2FpdCB0aGlzLmNvdW50QXN5bmMoKSkgLSAxO1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5mZXRjaEFzeW5jKCkpW3RoaXMuX2N1cnJlbnRdO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0N1cnNvclxuICAgKiBAbmFtZSBjb3VudEFzeW5jXG4gICAqIEBzdW1tYXJ5IFJldHVybnMgdGhlIG51bWJlciBvZiBkb2N1bWVudHMgdGhhdCBtYXRjaCBhIHF1ZXJ5XG4gICAqIEByZXR1cm5zIHtQcm9taXNlPE51bWJlcj59XG4gICAqL1xuICBhc3luYyBjb3VudEFzeW5jKCkge1xuICAgIHRoaXMuX2NvbGxlY3Rpb24uX2RlYnVnKCdbRmlsZXNDb2xsZWN0aW9uXSBbRmlsZXNDdXJzb3JdIFtjb3VudEFzeW5jKCldJyk7XG4gICAgcmV0dXJuIHRoaXMuY3Vyc29yLmNvdW50QXN5bmMoKTtcbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgRmlsZXNDdXJzb3JcbiAgICogQG5hbWUgcmVtb3ZlQXN5bmNcbiAgICogQHN1bW1hcnkgUmVtb3ZlcyBhbGwgZG9jdW1lbnRzIHRoYXQgbWF0Y2ggYSBxdWVyeVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxGaWxlc0N1cnNvcj59XG4gICAqL1xuICBhc3luYyByZW1vdmVBc3luYygpIHtcbiAgICB0aGlzLl9jb2xsZWN0aW9uLl9kZWJ1ZygnW0ZpbGVzQ29sbGVjdGlvbl0gW0ZpbGVzQ3Vyc29yXSBbcmVtb3ZlQXN5bmMoKV0nKTtcbiAgICBhd2FpdCB0aGlzLl9jb2xsZWN0aW9uLnJlbW92ZUFzeW5jKHRoaXMuX3NlbGVjdG9yKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgRmlsZXNDdXJzb3JcbiAgICogQG5hbWUgZm9yRWFjaEFzeW5jXG4gICAqIEBwYXJhbSBjYWxsYmFjayB7RnVuY3Rpb259IC0gRnVuY3Rpb24gdG8gY2FsbC4gSXQgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM6IHRoZSBgZmlsZWAsIGEgMC1iYXNlZCBpbmRleCwgYW5kIGN1cnNvciBpdHNlbGZcbiAgICogQHBhcmFtIGNvbnRleHQge09iamVjdH0gLSBBbiBvYmplY3Qgd2hpY2ggd2lsbCBiZSB0aGUgdmFsdWUgb2YgYHRoaXNgIGluc2lkZSBgY2FsbGJhY2tgXG4gICAqIEBzdW1tYXJ5IENhbGwgYGNhbGxiYWNrYCBvbmNlIGZvciBlYWNoIG1hdGNoaW5nIGRvY3VtZW50LCBzZXF1ZW50aWFsbHkgYW5kIHN5bmNocm9ub3VzbHkuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHVuZGVmaW5lZD59XG4gICAqL1xuICBhc3luYyBmb3JFYWNoQXN5bmMoY2FsbGJhY2ssIGNvbnRleHQgPSB7fSkge1xuICAgIHRoaXMuX2NvbGxlY3Rpb24uX2RlYnVnKCdbRmlsZXNDb2xsZWN0aW9uXSBbRmlsZXNDdXJzb3JdIFtmb3JFYWNoQXN5bmMoKV0nKTtcbiAgICBhd2FpdCB0aGlzLmN1cnNvci5mb3JFYWNoQXN5bmMoY2FsbGJhY2ssIGNvbnRleHQpO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0N1cnNvclxuICAgKiBAbmFtZSBlYWNoXG4gICAqIEBzdW1tYXJ5IFJldHVybnMgYW4gQXJyYXkgb2YgRmlsZUN1cnNvciBtYWRlIGZvciBlYWNoIGRvY3VtZW50IG9uIGN1cnJlbnQgY3Vyc29yXG4gICAqICAgICAgICAgIFVzZWZ1bCB3aGVuIHVzaW5nIGluIHt7I2VhY2ggRmlsZXNDdXJzb3IjZWFjaH19Li4ue3svZWFjaH19IGJsb2NrIHRlbXBsYXRlIGhlbHBlclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxbRmlsZUN1cnNvcl0+fVxuICAgKi9cbiAgYXN5bmMgZWFjaCgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXBBc3luYygoZmlsZSkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBGaWxlQ3Vyc29yKGZpbGUsIHRoaXMuX2NvbGxlY3Rpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0N1cnNvclxuICAgKiBAbmFtZSBtYXBBc3luY1xuICAgKiBAcGFyYW0gY2FsbGJhY2sge0Z1bmN0aW9ufSAtIEZ1bmN0aW9uIHRvIGNhbGwuIEl0IHdpbGwgYmUgY2FsbGVkIHdpdGggdGhyZWUgYXJndW1lbnRzOiB0aGUgYGZpbGVgLCBhIDAtYmFzZWQgaW5kZXgsIGFuZCBjdXJzb3IgaXRzZWxmXG4gICAqIEBwYXJhbSBjb250ZXh0IHtPYmplY3R9IC0gQW4gb2JqZWN0IHdoaWNoIHdpbGwgYmUgdGhlIHZhbHVlIG9mIGB0aGlzYCBpbnNpZGUgYGNhbGxiYWNrYFxuICAgKiBAc3VtbWFyeSBNYXAgYGNhbGxiYWNrYCBvdmVyIGFsbCBtYXRjaGluZyBkb2N1bWVudHMuIFJldHVybnMgYW4gQXJyYXkuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cbiAgICovXG4gIGFzeW5jIG1hcEFzeW5jKGNhbGxiYWNrLCBjb250ZXh0ID0ge30pIHtcbiAgICB0aGlzLl9jb2xsZWN0aW9uLl9kZWJ1ZygnW0ZpbGVzQ29sbGVjdGlvbl0gW0ZpbGVzQ3Vyc29yXSBbbWFwQXN5bmMoKV0nKTtcbiAgICByZXR1cm4gdGhpcy5jdXJzb3IubWFwQXN5bmMoY2FsbGJhY2ssIGNvbnRleHQpO1xuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBGaWxlc0N1cnNvclxuICAgKiBAbmFtZSBjdXJyZW50XG4gICAqIEBzdW1tYXJ5IFJldHVybnMgY3VycmVudCBpdGVtIG9uIEN1cnNvciwgaWYgYXZhaWxhYmxlXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdHx1bmRlZmluZWQ+fVxuICAgKi9cbiAgYXN5bmMgY3VycmVudCgpIHtcbiAgICB0aGlzLl9jb2xsZWN0aW9uLl9kZWJ1ZygnW0ZpbGVzQ29sbGVjdGlvbl0gW0ZpbGVzQ3Vyc29yXSBbY3VycmVudEFzeW5jKCldJyk7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnQgPCAwKSB7XG4gICAgICB0aGlzLl9jdXJyZW50ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmZldGNoQXN5bmMoKSlbdGhpcy5fY3VycmVudF07XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVzQ3Vyc29yXG4gICAqIEBuYW1lIG9ic2VydmVcbiAgICogQHBhcmFtIGNhbGxiYWNrcyB7T2JqZWN0fSAtIEZ1bmN0aW9ucyB0byBjYWxsIHRvIGRlbGl2ZXIgdGhlIHJlc3VsdCBzZXQgYXMgaXQgY2hhbmdlc1xuICAgKiBAc3VtbWFyeSBXYXRjaCBhIHF1ZXJ5LiBSZWNlaXZlIGNhbGxiYWNrcyBhcyB0aGUgcmVzdWx0IHNldCBjaGFuZ2VzLlxuICAgKiBAdXJsIGh0dHA6Ly9kb2NzLm1ldGVvci5jb20vYXBpL2NvbGxlY3Rpb25zLmh0bWwjTW9uZ28tQ3Vyc29yLW9ic2VydmVcbiAgICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0Pn0gLSBsaXZlIHF1ZXJ5IGhhbmRsZVxuICAgKi9cbiAgYXN5bmMgb2JzZXJ2ZShjYWxsYmFja3MpIHtcbiAgICB0aGlzLl9jb2xsZWN0aW9uLl9kZWJ1ZygnW0ZpbGVzQ29sbGVjdGlvbl0gW0ZpbGVzQ3Vyc29yXSBbb2JzZXJ2ZSgpXScpO1xuICAgIHJldHVybiB0aGlzLmN1cnNvci5vYnNlcnZlKGNhbGxiYWNrcyk7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIEZpbGVzQ3Vyc29yXG4gICAqIEBuYW1lIG9ic2VydmVDaGFuZ2VzXG4gICAqIEBwYXJhbSBjYWxsYmFja3Mge09iamVjdH0gLSBGdW5jdGlvbnMgdG8gY2FsbCB0byBkZWxpdmVyIHRoZSByZXN1bHQgc2V0IGFzIGl0IGNoYW5nZXNcbiAgICogQHN1bW1hcnkgV2F0Y2ggYSBxdWVyeS4gUmVjZWl2ZSBjYWxsYmFja3MgYXMgdGhlIHJlc3VsdCBzZXQgY2hhbmdlcy4gT25seSB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgb2xkIGFuZCBuZXcgZG9jdW1lbnRzIGFyZSBwYXNzZWQgdG8gdGhlIGNhbGxiYWNrcy5cbiAgICogQHVybCBodHRwOi8vZG9jcy5tZXRlb3IuY29tL2FwaS9jb2xsZWN0aW9ucy5odG1sI01vbmdvLUN1cnNvci1vYnNlcnZlQ2hhbmdlc1xuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIGxpdmUgcXVlcnkgaGFuZGxlXG4gICAqL1xuICBvYnNlcnZlQ2hhbmdlcyhjYWxsYmFja3MpIHtcbiAgICB0aGlzLl9jb2xsZWN0aW9uLl9kZWJ1ZygnW0ZpbGVzQ29sbGVjdGlvbl0gW0ZpbGVzQ3Vyc29yXSBbb2JzZXJ2ZUNoYW5nZXMoKV0nKTtcbiAgICByZXR1cm4gdGhpcy5jdXJzb3Iub2JzZXJ2ZUNoYW5nZXMoY2FsbGJhY2tzKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuXG5jb25zdCBoZWxwZXJzID0ge1xuICBzYW5pdGl6ZShzdHIgPSAnJywgbWF4ID0gMjgsIHJlcGxhY2VtZW50ID0gJy0nKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW15hLXowLTlcXC1cXF9dKykvZ2ksIHJlcGxhY2VtZW50KS5zdWJzdHJpbmcoMCwgbWF4KTtcbiAgfSxcbiAgaXNVbmRlZmluZWQob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9LFxuICBpc09iamVjdChvYmopIHtcbiAgICBpZiAodGhpcy5pc0FycmF5KG9iaikgfHwgdGhpcy5pc0Z1bmN0aW9uKG9iaikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG4gIH0sXG4gIGlzQXJyYXkob2JqKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkob2JqKTtcbiAgfSxcbiAgaXNCb29sZWFuKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWUgfHwgb2JqID09PSBmYWxzZSB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9LFxuICBpc0Z1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nIHx8IGZhbHNlO1xuICB9LFxuICBpc0RhdGUoZGF0ZSkge1xuICAgIHJldHVybiAhTnVtYmVyLmlzTmFOKG5ldyBEYXRlKGRhdGUpLmdldERhdGUoKSk7XG4gIH0sXG4gIGlzRW1wdHkob2JqKSB7XG4gICAgaWYgKHRoaXMuaXNEYXRlKG9iaikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNPYmplY3Qob2JqKSkge1xuICAgICAgcmV0dXJuICFPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNBcnJheShvYmopIHx8IHRoaXMuaXNTdHJpbmcob2JqKSkge1xuICAgICAgcmV0dXJuICFvYmoubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIGNsb25lKG9iaikge1xuICAgIGlmICghdGhpcy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHJldHVybiB0aGlzLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogT2JqZWN0LmFzc2lnbih7fSwgb2JqKTtcbiAgfSxcbiAgaGFzKF9vYmosIHBhdGgpIHtcbiAgICBsZXQgb2JqID0gX29iajtcbiAgICBpZiAoIXRoaXMuaXNPYmplY3Qob2JqKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNBcnJheShwYXRoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaXNPYmplY3Qob2JqKSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwYXRoKTtcbiAgICB9XG5cbiAgICBjb25zdCBsZW5ndGggPSBwYXRoLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHBhdGhbaV0pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIG9iaiA9IG9ialtwYXRoW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuICEhbGVuZ3RoO1xuICB9LFxuICBvbWl0KG9iaiwgLi4ua2V5cykge1xuICAgIGNvbnN0IGNsZWFyID0gT2JqZWN0LmFzc2lnbih7fSwgb2JqKTtcbiAgICBmb3IgKGxldCBpID0ga2V5cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgZGVsZXRlIGNsZWFyW2tleXNbaV1dO1xuICAgIH1cblxuICAgIHJldHVybiBjbGVhcjtcbiAgfSxcbiAgbm93OiBEYXRlLm5vdyxcbiAgdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHByZXZpb3VzID0gMDtcbiAgICBsZXQgdGltZW91dCA9IG51bGw7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBjb25zdCB0aGF0ID0gdGhpcztcbiAgICBsZXQgc2VsZjtcbiAgICBsZXQgYXJncztcblxuICAgIGNvbnN0IGxhdGVyID0gKCkgPT4ge1xuICAgICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IHRoYXQubm93KCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgc2VsZiA9IGFyZ3MgPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCB0aHJvdHRsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBub3cgPSB0aGF0Lm5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIGNvbnN0IHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICAgIHNlbGYgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHRocm90dGxlZC5jYW5jZWwgPSAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICBwcmV2aW91cyA9IDA7XG4gICAgICB0aW1lb3V0ID0gc2VsZiA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhyb3R0bGVkO1xuICB9XG59O1xuXG5jb25zdCBfaGVscGVycyA9IFsnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJ107XG5mb3IgKGxldCBpID0gMDsgaSA8IF9oZWxwZXJzLmxlbmd0aDsgaSsrKSB7XG4gIGhlbHBlcnNbJ2lzJyArIF9oZWxwZXJzW2ldXSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09IGBbb2JqZWN0ICR7X2hlbHBlcnNbaV19XWA7XG4gIH07XG59XG5cbi8qXG4gKiBAY29uc3Qge0Z1bmN0aW9ufSBmaXhKU09OUGFyc2UgLSBGaXggaXNzdWUgd2l0aCBEYXRlIHBhcnNlXG4gKi9cbmNvbnN0IGZpeEpTT05QYXJzZSA9IGZ1bmN0aW9uKG9iaikge1xuICBmb3IgKGxldCBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhlbHBlcnMuaXNTdHJpbmcob2JqW2tleV0pICYmIG9ialtrZXldLmluY2x1ZGVzKCc9LS1KU09OLURBVEUtLT0nKSkge1xuICAgICAgb2JqW2tleV0gPSBvYmpba2V5XS5yZXBsYWNlKCc9LS1KU09OLURBVEUtLT0nLCAnJyk7XG4gICAgICBvYmpba2V5XSA9IG5ldyBEYXRlKHBhcnNlSW50KG9ialtrZXldKSk7XG4gICAgfSBlbHNlIGlmIChoZWxwZXJzLmlzT2JqZWN0KG9ialtrZXldKSkge1xuICAgICAgb2JqW2tleV0gPSBmaXhKU09OUGFyc2Uob2JqW2tleV0pO1xuICAgIH0gZWxzZSBpZiAoaGVscGVycy5pc0FycmF5KG9ialtrZXldKSkge1xuICAgICAgbGV0IHY7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9ialtrZXldLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHYgPSBvYmpba2V5XVtpXTtcbiAgICAgICAgaWYgKGhlbHBlcnMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICBvYmpba2V5XVtpXSA9IGZpeEpTT05QYXJzZSh2KTtcbiAgICAgICAgfSBlbHNlIGlmIChoZWxwZXJzLmlzU3RyaW5nKHYpICYmIHYuaW5jbHVkZXMoJz0tLUpTT04tREFURS0tPScpKSB7XG4gICAgICAgICAgdiA9IHYucmVwbGFjZSgnPS0tSlNPTi1EQVRFLS09JywgJycpO1xuICAgICAgICAgIG9ialtrZXldW2ldID0gbmV3IERhdGUocGFyc2VJbnQodikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmo7XG59O1xuXG4vKlxuICogQGNvbnN0IHtGdW5jdGlvbn0gZml4SlNPTlN0cmluZ2lmeSAtIEZpeCBpc3N1ZSB3aXRoIERhdGUgc3RyaW5naWZ5XG4gKi9cbmNvbnN0IGZpeEpTT05TdHJpbmdpZnkgPSBmdW5jdGlvbihvYmopIHtcbiAgZm9yIChsZXQga2V5IGluIG9iaikge1xuICAgIGlmIChoZWxwZXJzLmlzRGF0ZShvYmpba2V5XSkpIHtcbiAgICAgIG9ialtrZXldID0gYD0tLUpTT04tREFURS0tPSR7K29ialtrZXldfWA7XG4gICAgfSBlbHNlIGlmIChoZWxwZXJzLmlzT2JqZWN0KG9ialtrZXldKSkge1xuICAgICAgb2JqW2tleV0gPSBmaXhKU09OU3RyaW5naWZ5KG9ialtrZXldKTtcbiAgICB9IGVsc2UgaWYgKGhlbHBlcnMuaXNBcnJheShvYmpba2V5XSkpIHtcbiAgICAgIGxldCB2O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvYmpba2V5XS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2ID0gb2JqW2tleV1baV07XG4gICAgICAgIGlmIChoZWxwZXJzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgb2JqW2tleV1baV0gPSBmaXhKU09OU3RyaW5naWZ5KHYpO1xuICAgICAgICB9IGVsc2UgaWYgKGhlbHBlcnMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgb2JqW2tleV1baV0gPSBgPS0tSlNPTi1EQVRFLS09JHsrdn1gO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmo7XG59O1xuXG4vKlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZm9ybWF0RmxlVVJMXG4gKiBAcGFyYW0ge09iamVjdH0gZmlsZVJlZiAtIEZpbGUgcmVmZXJlbmNlIG9iamVjdFxuICogQHBhcmFtIHtTdHJpbmd9IHZlcnNpb24gLSBbT3B0aW9uYWxdIFZlcnNpb24gb2YgZmlsZSB5b3Ugd291bGQgbGlrZSBidWlsZCBVUkwgZm9yXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJpQmFzZSAtIFtPcHRpb25hbF0gVVJJIGJhc2UsIHNlZSAtIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWxpb3Zncm91cC9NZXRlb3ItRmlsZXMvaXNzdWVzLzYyNlxuICogQHN1bW1hcnkgUmV0dXJucyBmb3JtYXR0ZWQgVVJMIGZvciBmaWxlXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBEb3dubG9hZGFibGUgbGlua1xuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlLCBuby11bmRlZlxuY29uc3QgZm9ybWF0RmxlVVJMID0gKGZpbGVSZWYsIHZlcnNpb24gPSAnb3JpZ2luYWwnLCBfdXJpQmFzZSA9IChfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fIHx8IHt9KS5ST09UX1VSTCkgPT4ge1xuICBjaGVjayhmaWxlUmVmLCBPYmplY3QpO1xuICBjaGVjayh2ZXJzaW9uLCBTdHJpbmcpO1xuICBsZXQgdXJpQmFzZSA9IF91cmlCYXNlO1xuXG4gIGlmICghaGVscGVycy5pc1N0cmluZyh1cmlCYXNlKSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2UsIG5vLXVuZGVmXG4gICAgdXJpQmFzZSA9IChfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fIHx8IHt9KS5ST09UX1VSTCB8fCAnLyc7XG4gIH1cblxuICBjb25zdCBfcm9vdCA9IHVyaUJhc2UucmVwbGFjZSgvXFwvKyQvLCAnJyk7XG4gIGNvbnN0IHZSZWYgPSAoZmlsZVJlZi52ZXJzaW9ucyAmJiBmaWxlUmVmLnZlcnNpb25zW3ZlcnNpb25dKSB8fCBmaWxlUmVmIHx8IHt9O1xuXG4gIGxldCBleHQ7XG4gIGlmIChoZWxwZXJzLmlzU3RyaW5nKHZSZWYuZXh0ZW5zaW9uKSkge1xuICAgIGV4dCA9IGAuJHt2UmVmLmV4dGVuc2lvbi5yZXBsYWNlKC9eXFwuLywgJycpfWA7XG4gIH0gZWxzZSB7XG4gICAgZXh0ID0gJyc7XG4gIH1cblxuICBpZiAoZmlsZVJlZi5wdWJsaWMgPT09IHRydWUpIHtcbiAgICByZXR1cm4gX3Jvb3QgKyAodmVyc2lvbiA9PT0gJ29yaWdpbmFsJyA/IGAke2ZpbGVSZWYuX2Rvd25sb2FkUm91dGV9LyR7ZmlsZVJlZi5faWR9JHtleHR9YCA6IGAke2ZpbGVSZWYuX2Rvd25sb2FkUm91dGV9LyR7dmVyc2lvbn0tJHtmaWxlUmVmLl9pZH0ke2V4dH1gKTtcbiAgfVxuICByZXR1cm4gYCR7X3Jvb3R9JHtmaWxlUmVmLl9kb3dubG9hZFJvdXRlfS8ke2ZpbGVSZWYuX2NvbGxlY3Rpb25OYW1lfS8ke2ZpbGVSZWYuX2lkfS8ke3ZlcnNpb259LyR7ZmlsZVJlZi5faWR9JHtleHR9YDtcbn07XG5cbmV4cG9ydCB7IGZpeEpTT05QYXJzZSwgZml4SlNPTlN0cmluZ2lmeSwgZm9ybWF0RmxlVVJMLCBoZWxwZXJzIH07XG4iLCJpbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IG5vZGVQYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBoZWxwZXJzIH0gZnJvbSAnLi9saWIuanMnO1xuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG4vKipcbiAqIEBjb25zdCB7T2JqZWN0fSBib3VuZCAgIC0gTWV0ZW9yLmJpbmRFbnZpcm9ubWVudCAoRmliZXIgd3JhcHBlcilcbiAqIEBjb25zdCB7T2JqZWN0fSBmZENhY2hlIC0gRmlsZSBEZXNjcmlwdG9ycyBDYWNoZVxuICovXG5jb25zdCBib3VuZCA9IE1ldGVvci5iaW5kRW52aXJvbm1lbnQoY2FsbGJhY2sgPT4gY2FsbGJhY2soKSk7XG5jb25zdCBmZENhY2hlID0ge307XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBjbGFzcyBXcml0ZVN0cmVhbVxuICogQHBhcmFtIHBhdGggICAgICAgIHtTdHJpbmd9IC0gUGF0aCB0byBmaWxlIG9uIEZTXG4gKiBAcGFyYW0gbWF4TGVuZ3RoICAge051bWJlcn0gLSBNYXggYW1vdW50IG9mIGNodW5rcyBpbiBzdHJlYW1cbiAqIEBwYXJhbSBmaWxlICAgICAgICB7T2JqZWN0fSAtIGZpbGVSZWYgT2JqZWN0XG4gKiBAcGFyYW0gcGVybWlzc2lvbnMge1N0cmluZ30gLSBQZXJtaXNzaW9ucyB3aGljaCB3aWxsIGJlIHNldCB0byBvcGVuIGRlc2NyaXB0b3IgKG9jdGFsKSwgbGlrZTogYDYxMWAgb3IgYDBvNzc3YC4gRGVmYXVsdDogMDc1NVxuICogQHN1bW1hcnkgd3JpdGFibGVTdHJlYW0gd3JhcHBlciBjbGFzcywgbWFrZXMgc3VyZSBjaHVua3MgaXMgd3JpdHRlbiBpbiBnaXZlbiBvcmRlci4gSW1wbGVtZW50YXRpb24gb2YgcXVldWUgc3RyZWFtLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXcml0ZVN0cmVhbSB7XG4gIGNvbnN0cnVjdG9yKHBhdGgsIG1heExlbmd0aCwgZmlsZSwgcGVybWlzc2lvbnMpIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoLnRyaW0oKTtcbiAgICB0aGlzLm1heExlbmd0aCA9IG1heExlbmd0aDtcbiAgICB0aGlzLmZpbGUgPSBmaWxlO1xuICAgIHRoaXMucGVybWlzc2lvbnMgPSBwZXJtaXNzaW9ucztcbiAgICBpZiAoIXRoaXMucGF0aCB8fCAhaGVscGVycy5pc1N0cmluZyh0aGlzLnBhdGgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5mZCA9IG51bGw7XG4gICAgdGhpcy5lbmRlZCA9IGZhbHNlO1xuICAgIHRoaXMuYWJvcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMud3JpdHRlbkNodW5rcyA9IDA7XG5cbiAgICBpZiAoZmRDYWNoZVt0aGlzLnBhdGhdICYmICFmZENhY2hlW3RoaXMucGF0aF0uZW5kZWQgJiYgIWZkQ2FjaGVbdGhpcy5wYXRoXS5hYm9ydGVkKSB7XG4gICAgICB0aGlzLmZkID0gZmRDYWNoZVt0aGlzLnBhdGhdLmZkO1xuICAgICAgdGhpcy53cml0dGVuQ2h1bmtzID0gZmRDYWNoZVt0aGlzLnBhdGhdLndyaXR0ZW5DaHVua3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZzLnN0YXQodGhpcy5wYXRoLCAoc3RhdEVycm9yLCBzdGF0cykgPT4ge1xuICAgICAgICBib3VuZCgoKSA9PiB7XG4gICAgICAgICAgaWYgKHN0YXRFcnJvciB8fCAhc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGhzID0gdGhpcy5wYXRoLnNwbGl0KG5vZGVQYXRoLnNlcCk7XG4gICAgICAgICAgICBwYXRocy5wb3AoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGZzLm1rZGlyU3luYyhwYXRocy5qb2luKG5vZGVQYXRoLnNlcCksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAobWtkaXJFcnJvcikge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDUwMCwgYFtGaWxlc0NvbGxlY3Rpb25dIFt3cml0ZVN0cmVhbV0gW2NvbnN0cnVjdG9yXSBbbWtkaXJTeW5jXSBFUlJPUjogY2FuIG5vdCBtYWtlL2Vuc3VyZSBkaXJlY3RvcnkgXCIke3BhdGhzLmpvaW4obm9kZVBhdGguc2VwKX1cImAsIG1rZGlyRXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMucGF0aCwgJycpO1xuICAgICAgICAgICAgfSBjYXRjaCAod3JpdGVGaWxlRXJyb3IpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig1MDAsIGBbRmlsZXNDb2xsZWN0aW9uXSBbd3JpdGVTdHJlYW1dIFtjb25zdHJ1Y3Rvcl0gW3dyaXRlRmlsZVN5bmNdIEVSUk9SOiBjYW4gbm90IHdyaXRlIGZpbGUgXCIke3RoaXMucGF0aH1cImAsIHdyaXRlRmlsZUVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmcy5vcGVuKHRoaXMucGF0aCwgJ3IrJywgdGhpcy5wZXJtaXNzaW9ucywgKG9FcnJvciwgZmQpID0+IHtcbiAgICAgICAgICAgIGJvdW5kKCgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKG9FcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDUwMCwgJ1tGaWxlc0NvbGxlY3Rpb25dIFt3cml0ZVN0cmVhbV0gW2NvbnN0cnVjdG9yXSBbb3Blbl0gW0Vycm9yOl0nLCBvRXJyb3IpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZmQgPSBmZDtcbiAgICAgICAgICAgICAgICBmZENhY2hlW3RoaXMucGF0aF0gPSB0aGlzO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlck9mIHdyaXRlU3RyZWFtXG4gICAqIEBuYW1lIHdyaXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBudW0gLSBDaHVuayBwb3NpdGlvbiBpbiBhIHN0cmVhbVxuICAgKiBAcGFyYW0ge0J1ZmZlcn0gY2h1bmsgLSBCdWZmZXIgKGNodW5rIGJpbmFyeSBkYXRhKVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxiYWNrXG4gICAqIEBzdW1tYXJ5IFdyaXRlIGNodW5rIGluIGdpdmVuIG9yZGVyXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSAtIFRydWUgaWYgY2h1bmsgaXMgc2VudCB0byBzdHJlYW0sIGZhbHNlIGlmIGNodW5rIGlzIHNldCBpbnRvIHF1ZXVlXG4gICAqL1xuICB3cml0ZShudW0sIGNodW5rLCBjYWxsYmFjaykge1xuICAgIGlmICghdGhpcy5hYm9ydGVkICYmICF0aGlzLmVuZGVkKSB7XG4gICAgICBpZiAodGhpcy5mZCkge1xuICAgICAgICBmcy53cml0ZSh0aGlzLmZkLCBjaHVuaywgMCwgY2h1bmsubGVuZ3RoLCAobnVtIC0gMSkgKiB0aGlzLmZpbGUuY2h1bmtTaXplLCAoZXJyb3IsIHdyaXR0ZW4sIGJ1ZmZlcikgPT4ge1xuICAgICAgICAgIGJvdW5kKCgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGVycm9yLCB3cml0dGVuLCBidWZmZXIpO1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgIE1ldGVvci5fZGVidWcoJ1tGaWxlc0NvbGxlY3Rpb25dIFt3cml0ZVN0cmVhbV0gW3dyaXRlXSBbRXJyb3I6XScsIGVycm9yKTtcbiAgICAgICAgICAgICAgdGhpcy5hYm9ydCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgKyt0aGlzLndyaXR0ZW5DaHVua3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgTWV0ZW9yLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMud3JpdGUobnVtLCBjaHVuaywgY2FsbGJhY2spO1xuICAgICAgICB9LCAyNSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyT2Ygd3JpdGVTdHJlYW1cbiAgICogQG5hbWUgZW5kXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2tcbiAgICogQHN1bW1hcnkgRmluaXNoZXMgd3JpdGluZyB0byB3cml0YWJsZVN0cmVhbSwgb25seSBhZnRlciBhbGwgY2h1bmtzIGluIHF1ZXVlIGlzIHdyaXR0ZW5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IC0gVHJ1ZSBpZiBzdHJlYW0gaXMgZnVsZmlsbGVkLCBmYWxzZSBpZiBxdWV1ZSBpcyBpbiBwcm9ncmVzc1xuICAgKi9cbiAgZW5kKGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0aGlzLmFib3J0ZWQgJiYgIXRoaXMuZW5kZWQpIHtcbiAgICAgIGlmICh0aGlzLndyaXR0ZW5DaHVua3MgPT09IHRoaXMubWF4TGVuZ3RoKSB7XG4gICAgICAgIGZzLmNsb3NlKHRoaXMuZmQsICgpID0+IHtcbiAgICAgICAgICBib3VuZCgoKSA9PiB7XG4gICAgICAgICAgICBkZWxldGUgZmRDYWNoZVt0aGlzLnBhdGhdO1xuICAgICAgICAgICAgdGhpcy5lbmRlZCA9IHRydWU7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayh2b2lkIDAsIHRydWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZzLnN0YXQodGhpcy5wYXRoLCAoZXJyb3IsIHN0YXQpID0+IHtcbiAgICAgICAgYm91bmQoKCkgPT4ge1xuICAgICAgICAgIGlmICghZXJyb3IgJiYgc3RhdCkge1xuICAgICAgICAgICAgdGhpcy53cml0dGVuQ2h1bmtzID0gTWF0aC5jZWlsKHN0YXQuc2l6ZSAvIHRoaXMuZmlsZS5jaHVua1NpemUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBNZXRlb3Iuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVuZChjYWxsYmFjayk7XG4gICAgICAgICAgfSwgMjUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayh2b2lkIDAsIHRoaXMuZW5kZWQpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlck9mIHdyaXRlU3RyZWFtXG4gICAqIEBuYW1lIGFib3J0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2tcbiAgICogQHN1bW1hcnkgQWJvcnRzIHdyaXRpbmcgdG8gd3JpdGFibGVTdHJlYW0sIHJlbW92ZXMgY3JlYXRlZCBmaWxlXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSAtIFRydWVcbiAgICovXG4gIGFib3J0KGNhbGxiYWNrKSB7XG4gICAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgICBkZWxldGUgZmRDYWNoZVt0aGlzLnBhdGhdO1xuICAgIGZzLnVubGluayh0aGlzLnBhdGgsIChjYWxsYmFjayB8fCBub29wKSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlck9mIHdyaXRlU3RyZWFtXG4gICAqIEBuYW1lIHN0b3BcbiAgICogQHN1bW1hcnkgU3RvcCB3cml0aW5nIHRvIHdyaXRhYmxlU3RyZWFtXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSAtIFRydWVcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgICBkZWxldGUgZmRDYWNoZVt0aGlzLnBhdGhdO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iXX0=
