Package["core-runtime"].queue("aldeed:collection2",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var EJSON = Package.ejson.EJSON;
var ECMAScript = Package.ecmascript.ECMAScript;
var EventEmitter = Package['raix:eventemitter'].EventEmitter;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Collection2;

var require = meteorInstall({"node_modules":{"meteor":{"aldeed:collection2":{"collection2.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// packages/aldeed_collection2/collection2.js                                             //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let EventEmitter;
    module.link("meteor/raix:eventemitter", {
      EventEmitter(v) {
        EventEmitter = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // Exported only for listening to events
    Collection2 = new EventEmitter();
    module.exportDefault(Collection2);
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Collection2: Collection2
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/aldeed:collection2/collection2.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/aldeed_collection2.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOmNvbGxlY3Rpb24yL2NvbGxlY3Rpb24yLmpzIl0sIm5hbWVzIjpbIkV2ZW50RW1pdHRlciIsIm1vZHVsZSIsImxpbmsiLCJ2IiwiX19yZWlmeVdhaXRGb3JEZXBzX18iLCJDb2xsZWN0aW9uMiIsImV4cG9ydERlZmF1bHQiLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsWUFBWTtJQUFDQyxNQUFNLENBQUNDLElBQUksQ0FBQywwQkFBMEIsRUFBQztNQUFDRixZQUFZQSxDQUFDRyxDQUFDLEVBQUM7UUFBQ0gsWUFBWSxHQUFDRyxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTUEsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFeko7SUFDQUMsV0FBVyxHQUFHLElBQUlMLFlBQVksQ0FBQyxDQUFDO0lBSGhDQyxNQUFNLENBQUNLLGFBQWEsQ0FLTEQsV0FMUyxDQUFDO0lBQUNFLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEciLCJmaWxlIjoiL3BhY2thZ2VzL2FsZGVlZF9jb2xsZWN0aW9uMi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ21ldGVvci9yYWl4OmV2ZW50ZW1pdHRlcic7XG5cbi8vIEV4cG9ydGVkIG9ubHkgZm9yIGxpc3RlbmluZyB0byBldmVudHNcbkNvbGxlY3Rpb24yID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG5leHBvcnQgZGVmYXVsdCBDb2xsZWN0aW9uMjsiXX0=
