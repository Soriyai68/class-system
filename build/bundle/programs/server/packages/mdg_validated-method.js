Package["core-runtime"].queue("mdg:validated-method",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var check = Package.check.check;
var Match = Package.check.Match;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var options, callback, args, ValidatedMethod;

var require = meteorInstall({"node_modules":{"meteor":{"mdg:validated-method":{"validated-method.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/mdg_validated-method/validated-method.js                                                                //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
      ValidatedMethod: () => ValidatedMethod
    });
    let check, Match;
    module.link("meteor/check", {
      check(v) {
        check = v;
      },
      Match(v) {
        Match = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class ValidatedMethod {
      constructor(options) {
        // Default to no mixins
        options.mixins = options.mixins || [];
        check(options.mixins, [Function]);
        check(options.name, String);
        options = applyMixins(options, options.mixins);
        if (options.connection) {
          // Make sure we have a valid connection object
          if (typeof options.connection !== 'object' || !options.connection.methods) throw new Error('Invalid connection type');
        } else {
          // connection argument defaults to Meteor, which is where Methods are defined on client and
          // server
          options.connection = Meteor;
        }

        // Allow validate: null shorthand for methods that take no arguments
        if (options.validate === null) {
          options.validate = function () {};
        }

        // If this is null/undefined, make it an empty object
        options.applyOptions = options.applyOptions || {};
        check(options, Match.ObjectIncluding({
          name: String,
          validate: Function,
          run: Function,
          mixins: [Function],
          applyOptions: Object
        }));

        // Default options passed to Meteor.apply, can be overridden with applyOptions
        const defaultApplyOptions = {
          // Make it possible to get the ID of an inserted item
          returnStubValue: true,
          // Don't call the server method if the client stub throws an error, so that we don't end
          // up doing validations twice
          throwStubExceptions: true
        };
        options.applyOptions = _objectSpread(_objectSpread({}, defaultApplyOptions), options.applyOptions);

        // Attach all options to the ValidatedMethod instance
        Object.assign(this, options);
        const method = this;
        this.connection.methods({
          [options.name](args) {
            // Silence audit-argument-checks since arguments are always checked when using this package
            check(args, Match.Any);
            const methodInvocation = this;
            return method._execute(methodInvocation, args);
          }
        });
      }
      call(args, callback) {
        // Accept calling with just a callback
        if (typeof args === 'function') {
          callback = args;
          args = {};
        }
        try {
          return this.connection.apply(this.name, [args], this.applyOptions, callback);
        } catch (err) {
          if (callback) {
            // Get errors from the stub in the same way as from the server-side method
            callback(err);
          } else {
            // No callback passed, throw instead of silently failing; this is what
            // "normal" Methods do if you don't pass a callback.
            throw err;
          }
        }
      }
      callAsync(args) {
        //taken from the callAsync method internals which will use applyAsync with a isFromCallAsync param
        //which will flag methods as running on DDP
        //reset current method invocation and mark it as running
        if (Meteor.isClient) {
          DDP._CurrentMethodInvocation._set();
          DDP._CurrentMethodInvocation._setCallAsyncMethodRunning(true);
          return new Promise((resolve, reject) => {
            const clientResultOrThenable = this.connection.applyAsync(this.name, [args],
              //ensure throwStubExceptions which we need in order
              //to catch client exceptions and re-throw them as promise rejections
              //mimic callAsync through isFromCallAsync
              //merge with this.applyOptions
              Object.assign(this.applyOptions, {
                throwStubExceptions: true,
                isFromCallAsync: true
              }), (err, serverResult) => {
                //set the current invocation running to false as soon as server returned its
                //promise so that subsequent methods in .then's of the first method run in their
                //own context instead of thinking they are a stub for the first method
                //MethodOne.call(params)
                //.then(() => MethodTwo.call())
                //.catch(err => log(err));

                DDP._CurrentMethodInvocation._setCallAsyncMethodRunning(false);
                if (err) reject(err);
                resolve(serverResult);
              }),
              isThenable = clientResultOrThenable && typeof clientResultOrThenable.then === 'function';

            //catch exceptions on the stub and re-route them to the promise wrapper
            if (isThenable) clientResultOrThenable.catch(err => reject(err));
          });
        }

        //when called from server, just return the promise as returned by the method
        return this.connection.applyAsync(this.name, [args], this.applyOptions);
      }
      _execute() {
        let methodInvocation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        let args = arguments.length > 1 ? arguments[1] : undefined;
        // Add `this.name` to reference the Method name
        methodInvocation.name = this.name;
        const validateResult = this.validate.bind(methodInvocation)(args);
        if (typeof validateResult !== 'undefined') {
          throw new Error("Returning from validate doesn't do anything; perhaps you meant to throw an error?");
        }
        return this.run.bind(methodInvocation)(args);
      }
    }
    ;

    // Mixins get a chance to transform the arguments before they are passed to the actual Method
    function applyMixins(args, mixins) {
      // Save name of the method here, so we can attach it to potential error messages
      const {
        name
      } = args;
      mixins.forEach(mixin => {
        args = mixin(args);
        if (!Match.test(args, Object)) {
          const functionName = mixin.toString().match(/function\s(\w+)/);
          let msg = 'One of the mixins';
          if (functionName) {
            msg = "The function '".concat(functionName[1], "'");
          }
          throw new Error("Error in ".concat(name, " method: ").concat(msg, " didn't return the options object."));
        }
      });
      return args;
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      ValidatedMethod: ValidatedMethod
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/mdg:validated-method/validated-method.js"
  ],
  mainModulePath: "/node_modules/meteor/mdg:validated-method/validated-method.js"
}});

//# sourceURL=meteor://💻app/packages/mdg_validated-method.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWRnOnZhbGlkYXRlZC1tZXRob2QvdmFsaWRhdGVkLW1ldGhvZC5qcyJdLCJuYW1lcyI6WyJfb2JqZWN0U3ByZWFkIiwibW9kdWxlIiwibGluayIsImRlZmF1bHQiLCJ2IiwiZXhwb3J0IiwiVmFsaWRhdGVkTWV0aG9kIiwiY2hlY2siLCJNYXRjaCIsIl9fcmVpZnlXYWl0Rm9yRGVwc19fIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibWl4aW5zIiwiRnVuY3Rpb24iLCJuYW1lIiwiU3RyaW5nIiwiYXBwbHlNaXhpbnMiLCJjb25uZWN0aW9uIiwibWV0aG9kcyIsIkVycm9yIiwiTWV0ZW9yIiwidmFsaWRhdGUiLCJhcHBseU9wdGlvbnMiLCJPYmplY3RJbmNsdWRpbmciLCJydW4iLCJPYmplY3QiLCJkZWZhdWx0QXBwbHlPcHRpb25zIiwicmV0dXJuU3R1YlZhbHVlIiwidGhyb3dTdHViRXhjZXB0aW9ucyIsImFzc2lnbiIsIm1ldGhvZCIsImFyZ3MiLCJBbnkiLCJtZXRob2RJbnZvY2F0aW9uIiwiX2V4ZWN1dGUiLCJjYWxsIiwiY2FsbGJhY2siLCJhcHBseSIsImVyciIsImNhbGxBc3luYyIsImlzQ2xpZW50IiwiRERQIiwiX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uIiwiX3NldCIsIl9zZXRDYWxsQXN5bmNNZXRob2RSdW5uaW5nIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjbGllbnRSZXN1bHRPclRoZW5hYmxlIiwiYXBwbHlBc3luYyIsImlzRnJvbUNhbGxBc3luYyIsInNlcnZlclJlc3VsdCIsImlzVGhlbmFibGUiLCJ0aGVuIiwiY2F0Y2giLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJ2YWxpZGF0ZVJlc3VsdCIsImJpbmQiLCJmb3JFYWNoIiwibWl4aW4iLCJ0ZXN0IiwiZnVuY3Rpb25OYW1lIiwidG9TdHJpbmciLCJtYXRjaCIsIm1zZyIsImNvbmNhdCIsIl9fcmVp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ZXRob2QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjaGVjaywgTWF0Y2ggfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuXG5leHBvcnQgY2xhc3MgVmFsaWRhdGVkTWV0aG9kIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIC8vIERlZmF1bHQgdG8gbm8gbWl4aW5zXG4gICAgb3B0aW9ucy5taXhpbnMgPSBvcHRpb25zLm1peGlucyB8fCBbXTtcbiAgICBjaGVjayhvcHRpb25zLm1peGlucywgW0Z1bmN0aW9uXSk7XG4gICAgY2hlY2sob3B0aW9ucy5uYW1lLCBTdHJpbmcpO1xuICAgIG9wdGlvbnMgPSBhcHBseU1peGlucyhvcHRpb25zLCBvcHRpb25zLm1peGlucyk7XG5cbiAgICBpZihvcHRpb25zLmNvbm5lY3Rpb24pIHtcbiAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGEgdmFsaWQgY29ubmVjdGlvbiBvYmplY3RcbiAgICAgIGlmKHR5cGVvZiBvcHRpb25zLmNvbm5lY3Rpb24gIT09ICdvYmplY3QnXG4gICAgICB8fCAhb3B0aW9ucy5jb25uZWN0aW9uLm1ldGhvZHMpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb25uZWN0aW9uIHR5cGUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29ubmVjdGlvbiBhcmd1bWVudCBkZWZhdWx0cyB0byBNZXRlb3IsIHdoaWNoIGlzIHdoZXJlIE1ldGhvZHMgYXJlIGRlZmluZWQgb24gY2xpZW50IGFuZFxuICAgICAgLy8gc2VydmVyXG4gICAgICBvcHRpb25zLmNvbm5lY3Rpb24gPSBNZXRlb3I7XG4gICAgfVxuXG4gICAgLy8gQWxsb3cgdmFsaWRhdGU6IG51bGwgc2hvcnRoYW5kIGZvciBtZXRob2RzIHRoYXQgdGFrZSBubyBhcmd1bWVudHNcbiAgICBpZiAob3B0aW9ucy52YWxpZGF0ZSA9PT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy52YWxpZGF0ZSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIH1cblxuICAgIC8vIElmIHRoaXMgaXMgbnVsbC91bmRlZmluZWQsIG1ha2UgaXQgYW4gZW1wdHkgb2JqZWN0XG4gICAgb3B0aW9ucy5hcHBseU9wdGlvbnMgPSBvcHRpb25zLmFwcGx5T3B0aW9ucyB8fCB7fTtcblxuICAgIGNoZWNrKG9wdGlvbnMsIE1hdGNoLk9iamVjdEluY2x1ZGluZyh7XG4gICAgICBuYW1lOiBTdHJpbmcsXG4gICAgICB2YWxpZGF0ZTogRnVuY3Rpb24sXG4gICAgICBydW46IEZ1bmN0aW9uLFxuICAgICAgbWl4aW5zOiBbRnVuY3Rpb25dLFxuICAgICAgYXBwbHlPcHRpb25zOiBPYmplY3QsXG4gICAgfSkpO1xuXG4gICAgLy8gRGVmYXVsdCBvcHRpb25zIHBhc3NlZCB0byBNZXRlb3IuYXBwbHksIGNhbiBiZSBvdmVycmlkZGVuIHdpdGggYXBwbHlPcHRpb25zXG4gICAgY29uc3QgZGVmYXVsdEFwcGx5T3B0aW9ucyA9IHtcbiAgICAgIC8vIE1ha2UgaXQgcG9zc2libGUgdG8gZ2V0IHRoZSBJRCBvZiBhbiBpbnNlcnRlZCBpdGVtXG4gICAgICByZXR1cm5TdHViVmFsdWU6IHRydWUsXG5cbiAgICAgIC8vIERvbid0IGNhbGwgdGhlIHNlcnZlciBtZXRob2QgaWYgdGhlIGNsaWVudCBzdHViIHRocm93cyBhbiBlcnJvciwgc28gdGhhdCB3ZSBkb24ndCBlbmRcbiAgICAgIC8vIHVwIGRvaW5nIHZhbGlkYXRpb25zIHR3aWNlXG4gICAgICB0aHJvd1N0dWJFeGNlcHRpb25zOiB0cnVlLFxuICAgIH07XG5cbiAgICBvcHRpb25zLmFwcGx5T3B0aW9ucyA9IHtcbiAgICAgIC4uLmRlZmF1bHRBcHBseU9wdGlvbnMsXG4gICAgICAuLi5vcHRpb25zLmFwcGx5T3B0aW9uc1xuICAgIH07XG5cbiAgICAvLyBBdHRhY2ggYWxsIG9wdGlvbnMgdG8gdGhlIFZhbGlkYXRlZE1ldGhvZCBpbnN0YW5jZVxuICAgIE9iamVjdC5hc3NpZ24odGhpcywgb3B0aW9ucyk7XG5cbiAgICBjb25zdCBtZXRob2QgPSB0aGlzO1xuICAgIHRoaXMuY29ubmVjdGlvbi5tZXRob2RzKHtcbiAgICAgIFtvcHRpb25zLm5hbWVdKGFyZ3MpIHtcbiAgICAgICAgLy8gU2lsZW5jZSBhdWRpdC1hcmd1bWVudC1jaGVja3Mgc2luY2UgYXJndW1lbnRzIGFyZSBhbHdheXMgY2hlY2tlZCB3aGVuIHVzaW5nIHRoaXMgcGFja2FnZVxuICAgICAgICBjaGVjayhhcmdzLCBNYXRjaC5BbnkpO1xuICAgICAgICBjb25zdCBtZXRob2RJbnZvY2F0aW9uID0gdGhpcztcblxuICAgICAgICByZXR1cm4gbWV0aG9kLl9leGVjdXRlKG1ldGhvZEludm9jYXRpb24sIGFyZ3MpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY2FsbChhcmdzLCBjYWxsYmFjaykge1xuICAgIC8vIEFjY2VwdCBjYWxsaW5nIHdpdGgganVzdCBhIGNhbGxiYWNrXG4gICAgaWYgKCB0eXBlb2YgYXJncyA9PT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgIGNhbGxiYWNrID0gYXJncztcbiAgICAgIGFyZ3MgPSB7fTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbi5hcHBseSh0aGlzLm5hbWUsIFthcmdzXSwgdGhpcy5hcHBseU9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAvLyBHZXQgZXJyb3JzIGZyb20gdGhlIHN0dWIgaW4gdGhlIHNhbWUgd2F5IGFzIGZyb20gdGhlIHNlcnZlci1zaWRlIG1ldGhvZFxuICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTm8gY2FsbGJhY2sgcGFzc2VkLCB0aHJvdyBpbnN0ZWFkIG9mIHNpbGVudGx5IGZhaWxpbmc7IHRoaXMgaXMgd2hhdFxuICAgICAgICAvLyBcIm5vcm1hbFwiIE1ldGhvZHMgZG8gaWYgeW91IGRvbid0IHBhc3MgYSBjYWxsYmFjay5cbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNhbGxBc3luYyhhcmdzKSB7XG5cdFx0Ly90YWtlbiBmcm9tIHRoZSBjYWxsQXN5bmMgbWV0aG9kIGludGVybmFscyB3aGljaCB3aWxsIHVzZSBhcHBseUFzeW5jIHdpdGggYSBpc0Zyb21DYWxsQXN5bmMgcGFyYW1cblx0XHQvL3doaWNoIHdpbGwgZmxhZyBtZXRob2RzIGFzIHJ1bm5pbmcgb24gRERQXG5cdFx0Ly9yZXNldCBjdXJyZW50IG1ldGhvZCBpbnZvY2F0aW9uIGFuZCBtYXJrIGl0IGFzIHJ1bm5pbmdcblx0XHRpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG5cdFx0XHRERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLl9zZXQoKTtcblx0XHRcdEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uX3NldENhbGxBc3luY01ldGhvZFJ1bm5pbmcodHJ1ZSk7XG5cblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNsaWVudFJlc3VsdE9yVGhlbmFibGUgPSB0aGlzLmNvbm5lY3Rpb24uYXBwbHlBc3luYyhcblx0XHRcdFx0XHR0aGlzLm5hbWUsXG5cdFx0XHRcdFx0W2FyZ3NdLFxuXHRcdFx0XHRcdC8vZW5zdXJlIHRocm93U3R1YkV4Y2VwdGlvbnMgd2hpY2ggd2UgbmVlZCBpbiBvcmRlclxuXHRcdFx0XHRcdC8vdG8gY2F0Y2ggY2xpZW50IGV4Y2VwdGlvbnMgYW5kIHJlLXRocm93IHRoZW0gYXMgcHJvbWlzZSByZWplY3Rpb25zXG5cdFx0XHRcdFx0Ly9taW1pYyBjYWxsQXN5bmMgdGhyb3VnaCBpc0Zyb21DYWxsQXN5bmNcblx0XHRcdFx0XHQvL21lcmdlIHdpdGggdGhpcy5hcHBseU9wdGlvbnNcblx0XHRcdFx0XHRPYmplY3QuYXNzaWduKHRoaXMuYXBwbHlPcHRpb25zLCB7IHRocm93U3R1YkV4Y2VwdGlvbnM6IHRydWUsIGlzRnJvbUNhbGxBc3luYzogdHJ1ZSB9KSxcblx0XHRcdFx0XHQoZXJyLCBzZXJ2ZXJSZXN1bHQpID0+IHtcblx0XHRcdFx0XHRcdC8vc2V0IHRoZSBjdXJyZW50IGludm9jYXRpb24gcnVubmluZyB0byBmYWxzZSBhcyBzb29uIGFzIHNlcnZlciByZXR1cm5lZCBpdHNcblx0XHRcdFx0XHRcdC8vcHJvbWlzZSBzbyB0aGF0IHN1YnNlcXVlbnQgbWV0aG9kcyBpbiAudGhlbidzIG9mIHRoZSBmaXJzdCBtZXRob2QgcnVuIGluIHRoZWlyXG5cdFx0XHRcdFx0XHQvL293biBjb250ZXh0IGluc3RlYWQgb2YgdGhpbmtpbmcgdGhleSBhcmUgYSBzdHViIGZvciB0aGUgZmlyc3QgbWV0aG9kXG5cdFx0XHRcdFx0XHQvL01ldGhvZE9uZS5jYWxsKHBhcmFtcylcblx0XHRcdFx0XHRcdC8vLnRoZW4oKCkgPT4gTWV0aG9kVHdvLmNhbGwoKSlcblx0XHRcdFx0XHRcdC8vLmNhdGNoKGVyciA9PiBsb2coZXJyKSk7XG5cblx0XHRcdFx0XHRcdEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uX3NldENhbGxBc3luY01ldGhvZFJ1bm5pbmcoZmFsc2UpO1xuXG5cdFx0XHRcdFx0XHRpZiAoZXJyKSByZWplY3QoZXJyKTtcblx0XHRcdFx0XHRcdHJlc29sdmUoc2VydmVyUmVzdWx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdCksXG5cdFx0XHRcdGlzVGhlbmFibGUgPSBjbGllbnRSZXN1bHRPclRoZW5hYmxlICYmIHR5cGVvZiBjbGllbnRSZXN1bHRPclRoZW5hYmxlLnRoZW4gPT09ICdmdW5jdGlvbic7XG5cblx0XHRcdFx0Ly9jYXRjaCBleGNlcHRpb25zIG9uIHRoZSBzdHViIGFuZCByZS1yb3V0ZSB0aGVtIHRvIHRoZSBwcm9taXNlIHdyYXBwZXJcblx0XHRcdFx0aWYgKGlzVGhlbmFibGUpIGNsaWVudFJlc3VsdE9yVGhlbmFibGUuY2F0Y2goZXJyID0+IHJlamVjdChlcnIpKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vd2hlbiBjYWxsZWQgZnJvbSBzZXJ2ZXIsIGp1c3QgcmV0dXJuIHRoZSBwcm9taXNlIGFzIHJldHVybmVkIGJ5IHRoZSBtZXRob2Rcblx0XHRyZXR1cm4gdGhpcy5jb25uZWN0aW9uLmFwcGx5QXN5bmModGhpcy5uYW1lLCBbYXJnc10sIHRoaXMuYXBwbHlPcHRpb25zKTtcbiAgfVxuXG4gIF9leGVjdXRlKG1ldGhvZEludm9jYXRpb24gPSB7fSwgYXJncykge1xuICAgIC8vIEFkZCBgdGhpcy5uYW1lYCB0byByZWZlcmVuY2UgdGhlIE1ldGhvZCBuYW1lXG4gICAgbWV0aG9kSW52b2NhdGlvbi5uYW1lID0gdGhpcy5uYW1lO1xuXG4gICAgY29uc3QgdmFsaWRhdGVSZXN1bHQgPSB0aGlzLnZhbGlkYXRlLmJpbmQobWV0aG9kSW52b2NhdGlvbikoYXJncyk7XG5cbiAgICBpZiAodHlwZW9mIHZhbGlkYXRlUmVzdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXR1cm5pbmcgZnJvbSB2YWxpZGF0ZSBkb2Vzbid0IGRvIGFueXRoaW5nOyBcXFxucGVyaGFwcyB5b3UgbWVhbnQgdG8gdGhyb3cgYW4gZXJyb3I/YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucnVuLmJpbmQobWV0aG9kSW52b2NhdGlvbikoYXJncyk7XG4gIH1cbn07XG5cbi8vIE1peGlucyBnZXQgYSBjaGFuY2UgdG8gdHJhbnNmb3JtIHRoZSBhcmd1bWVudHMgYmVmb3JlIHRoZXkgYXJlIHBhc3NlZCB0byB0aGUgYWN0dWFsIE1ldGhvZFxuZnVuY3Rpb24gYXBwbHlNaXhpbnMoYXJncywgbWl4aW5zKSB7XG4gIC8vIFNhdmUgbmFtZSBvZiB0aGUgbWV0aG9kIGhlcmUsIHNvIHdlIGNhbiBhdHRhY2ggaXQgdG8gcG90ZW50aWFsIGVycm9yIG1lc3NhZ2VzXG4gIGNvbnN0IHsgbmFtZSB9ID0gYXJncztcblxuICBtaXhpbnMuZm9yRWFjaCgobWl4aW4pID0+IHtcbiAgICBhcmdzID0gbWl4aW4oYXJncyk7XG5cbiAgICBpZighTWF0Y2gudGVzdChhcmdzLCBPYmplY3QpKSB7XG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBtaXhpbi50b1N0cmluZygpLm1hdGNoKC9mdW5jdGlvblxccyhcXHcrKS8pO1xuICAgICAgbGV0IG1zZyA9ICdPbmUgb2YgdGhlIG1peGlucyc7XG5cbiAgICAgIGlmKGZ1bmN0aW9uTmFtZSkge1xuICAgICAgICBtc2cgPSBgVGhlIGZ1bmN0aW9uICcke2Z1bmN0aW9uTmFtZVsxXX0nYDtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBpbiAke25hbWV9IG1ldGhvZDogJHttc2d9IGRpZG4ndCByZXR1cm4gdGhlIG9wdGlvbnMgb2JqZWN0LmApO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGFyZ3M7XG59XG4iXX0=
