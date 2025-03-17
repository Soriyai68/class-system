Package["core-runtime"].queue("ostrio:cookies",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"ostrio:cookies":{"cookies.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/ostrio_cookies/cookies.js                                                                               //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      Cookies: () => Cookies
    });
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    let fetch;
    let WebApp;
    if (Meteor.isServer) {
      WebApp = require('meteor/webapp').WebApp;
    } else {
      fetch = require('meteor/fetch').fetch;
    }
    const NoOp = () => {};
    const urlRE = /\/___cookie___\/set/;
    const rootUrl = Meteor.isServer ? process.env.ROOT_URL : window.__meteor_runtime_config__.ROOT_URL || window.__meteor_runtime_config__.meteorEnv.ROOT_URL || false;
    const mobileRootUrl = Meteor.isServer ? process.env.MOBILE_ROOT_URL : window.__meteor_runtime_config__.MOBILE_ROOT_URL || window.__meteor_runtime_config__.meteorEnv.MOBILE_ROOT_URL || false;
    const helpers = {
      isUndefined(obj) {
        return obj === void 0;
      },
      isArray(obj) {
        return Array.isArray(obj);
      },
      clone(obj) {
        if (!this.isObject(obj)) return obj;
        return this.isArray(obj) ? obj.slice() : Object.assign({}, obj);
      }
    };
    const _helpers = ['Number', 'Object', 'Function'];
    for (let i = 0; i < _helpers.length; i++) {
      helpers['is' + _helpers[i]] = function (obj) {
        return Object.prototype.toString.call(obj) === '[object ' + _helpers[i] + ']';
      };
    }

    /**
     * @url https://github.com/jshttp/cookie/blob/master/index.js
     * @name cookie
     * @author jshttp
     * @license
     * (The MIT License)
     *
     * Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
     * Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
     *
     * Permission is hereby granted, free of charge, to any person obtaining
     * a copy of this software and associated documentation files (the
     * 'Software'), to deal in the Software without restriction, including
     * without limitation the rights to use, copy, modify, merge, publish,
     * distribute, sublicense, and/or sell copies of the Software, and to
     * permit persons to whom the Software is furnished to do so, subject to
     * the following conditions:
     *
     * The above copyright notice and this permission notice shall be
     * included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
     * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
     * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
     * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
     * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
     * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     */
    const decode = decodeURIComponent;
    const encode = encodeURIComponent;
    const pairSplitRegExp = /; */;

    /**
     * RegExp to match field-content in RFC 7230 sec 3.2
     *
     * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
     * field-vchar   = VCHAR / obs-text
     * obs-text      = %x80-FF
     */
    const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

    /**
     * @function
     * @name tryDecode
     * @param {String} str
     * @param {Function} d
     * @summary Try decoding a string using a decoding function.
     * @private
     */
    const tryDecode = (str, d) => {
      try {
        return d(str);
      } catch (e) {
        return str;
      }
    };

    /**
     * @function
     * @name parse
     * @param {String} str
     * @param {Object} [options]
     * @return {Object}
     * @summary
     * Parse a cookie header.
     * Parse the given cookie header string into an object
     * The object has the various cookies as keys(names) => values
     * @private
     */
    const parse = (str, options) => {
      if (typeof str !== 'string') {
        throw new Meteor.Error(404, 'argument str must be a string');
      }
      const obj = {};
      const opt = options || {};
      let val;
      let key;
      let eqIndx;
      str.split(pairSplitRegExp).forEach(pair => {
        eqIndx = pair.indexOf('=');
        if (eqIndx < 0) {
          return;
        }
        key = pair.substr(0, eqIndx).trim();
        key = tryDecode(unescape(key), opt.decode || decode);
        val = pair.substr(++eqIndx, pair.length).trim();
        if (val[0] === '"') {
          val = val.slice(1, -1);
        }
        if (void 0 === obj[key]) {
          obj[key] = tryDecode(val, opt.decode || decode);
        }
      });
      return obj;
    };

    /**
     * @function
     * @name antiCircular
     * @param data {Object} - Circular or any other object which needs to be non-circular
     * @private
     */
    const antiCircular = _obj => {
      const object = helpers.clone(_obj);
      const cache = new Map();
      return JSON.stringify(object, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.get(value)) {
            return void 0;
          }
          cache.set(value, true);
        }
        return value;
      });
    };

    /**
     * @function
     * @name serialize
     * @param {String} name
     * @param {String} val
     * @param {Object} [options]
     * @return { cookieString: String, sanitizedValue: Mixed }
     * @summary
     * Serialize data into a cookie header.
     * Serialize the a name value pair into a cookie string suitable for
     * http headers. An optional options object specified cookie parameters.
     * serialize('foo', 'bar', { httpOnly: true }) => "foo=bar; httpOnly"
     * @private
     */
    const serialize = function (key, val) {
      let opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      let name;
      if (!fieldContentRegExp.test(key)) {
        name = escape(key);
      } else {
        name = key;
      }
      let sanitizedValue = val;
      let value = val;
      if (!helpers.isUndefined(value)) {
        if (helpers.isObject(value) || helpers.isArray(value)) {
          const stringified = antiCircular(value);
          value = encode("JSON.parse(".concat(stringified, ")"));
          sanitizedValue = JSON.parse(stringified);
        } else {
          value = encode(value);
          if (value && !fieldContentRegExp.test(value)) {
            value = escape(value);
          }
        }
      } else {
        value = '';
      }
      const pairs = ["".concat(name, "=").concat(value)];
      if (helpers.isNumber(opt.maxAge)) {
        pairs.push("Max-Age=".concat(opt.maxAge));
      }
      if (opt.domain && typeof opt.domain === 'string') {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new Meteor.Error(404, 'option domain is invalid');
        }
        pairs.push("Domain=".concat(opt.domain));
      }
      if (opt.path && typeof opt.path === 'string') {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new Meteor.Error(404, 'option path is invalid');
        }
        pairs.push("Path=".concat(opt.path));
      } else {
        pairs.push('Path=/');
      }
      opt.expires = opt.expires || opt.expire || false;
      if (opt.expires === Infinity) {
        pairs.push('Expires=Fri, 31 Dec 9999 23:59:59 GMT');
      } else if (opt.expires instanceof Date) {
        pairs.push("Expires=".concat(opt.expires.toUTCString()));
      } else if (opt.expires === 0) {
        pairs.push('Expires=0');
      } else if (helpers.isNumber(opt.expires)) {
        pairs.push("Expires=".concat(new Date(opt.expires).toUTCString()));
      }
      if (opt.httpOnly) {
        pairs.push('HttpOnly');
      }
      if (opt.secure) {
        pairs.push('Secure');
      }
      if (opt.firstPartyOnly) {
        pairs.push('First-Party-Only');
      }
      if (opt.sameSite) {
        pairs.push(opt.sameSite === true ? 'SameSite' : "SameSite=".concat(opt.sameSite));
      }
      return {
        cookieString: pairs.join('; '),
        sanitizedValue
      };
    };
    const isStringifiedRegEx = /JSON\.parse\((.*)\)/;
    const isTypedRegEx = /false|true|null/;
    const deserialize = string => {
      if (typeof string !== 'string') {
        return string;
      }
      if (isStringifiedRegEx.test(string)) {
        let obj = string.match(isStringifiedRegEx)[1];
        if (obj) {
          try {
            return JSON.parse(decode(obj));
          } catch (e) {
            console.error('[ostrio:cookies] [.get()] [deserialize()] Exception:', e, string, obj);
            return string;
          }
        }
        return string;
      } else if (isTypedRegEx.test(string)) {
        try {
          return JSON.parse(string);
        } catch (e) {
          return string;
        }
      }
      return string;
    };

    /**
     * @locus Anywhere
     * @class __cookies
     * @param opts {Object} - Options (configuration) object
     * @param opts._cookies {Object|String} - Current cookies as String or Object
     * @param opts.TTL {Number|Boolean} - Default cookies expiration time (max-age) in milliseconds, by default - session (false)
     * @param opts.runOnServer {Boolean} - Expose Cookies class to Server
     * @param opts.response {http.ServerResponse|Object} - This object is created internally by a HTTP server
     * @param opts.allowQueryStringCookies {Boolean} - Allow passing Cookies in a query string (in URL). Primary should be used only in Cordova environment
     * @param opts.allowedCordovaOrigins {Regex|Boolean} - [Server] Allow setting Cookies from that specific origin which in Meteor/Cordova is localhost:12XXX (^http://localhost:12[0-9]{3}$)
     * @summary Internal Class
     */
    class __cookies {
      constructor(opts) {
        this.__pendingCookies = [];
        this.TTL = opts.TTL || false;
        this.response = opts.response || false;
        this.runOnServer = opts.runOnServer || false;
        this.allowQueryStringCookies = opts.allowQueryStringCookies || false;
        this.allowedCordovaOrigins = opts.allowedCordovaOrigins || false;
        if (this.allowedCordovaOrigins === true) {
          this.allowedCordovaOrigins = /^http:\/\/localhost:12[0-9]{3}$/;
        }
        this.originRE = new RegExp("^https?://(".concat(rootUrl ? rootUrl : '').concat(mobileRootUrl ? '|' + mobileRootUrl : '', ")$"));
        if (helpers.isObject(opts._cookies)) {
          this.cookies = opts._cookies;
        } else {
          this.cookies = parse(opts._cookies);
        }
      }

      /**
       * @locus Anywhere
       * @memberOf __cookies
       * @name get
       * @param {String} key  - The name of the cookie to read
       * @param {String} _tmp - Unparsed string instead of user's cookies
       * @summary Read a cookie. If the cookie doesn't exist a null value will be returned.
       * @returns {String|void}
       */
      get(key, _tmp) {
        const cookieString = _tmp ? parse(_tmp) : this.cookies;
        if (!key || !cookieString) {
          return void 0;
        }
        if (cookieString.hasOwnProperty(key)) {
          return deserialize(cookieString[key]);
        }
        return void 0;
      }

      /**
       * @locus Anywhere
       * @memberOf __cookies
       * @name set
       * @param {String} key   - The name of the cookie to create/overwrite
       * @param {String} value - The value of the cookie
       * @param {Object} opts  - [Optional] Cookie options (see readme docs)
       * @summary Create/overwrite a cookie.
       * @returns {Boolean}
       */
      set(key, value) {
        let opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        if (key && !helpers.isUndefined(value)) {
          if (helpers.isNumber(this.TTL) && opts.expires === undefined) {
            opts.expires = new Date(+new Date() + this.TTL);
          }
          const {
            cookieString,
            sanitizedValue
          } = serialize(key, value, opts);
          this.cookies[key] = sanitizedValue;
          if (Meteor.isClient) {
            document.cookie = cookieString;
          } else if (this.response) {
            this.__pendingCookies.push(cookieString);
            this.response.setHeader('Set-Cookie', this.__pendingCookies);
          }
          return true;
        }
        return false;
      }

      /**
       * @locus Anywhere
       * @memberOf __cookies
       * @name remove
       * @param {String} key    - The name of the cookie to create/overwrite
       * @param {String} path   - [Optional] The path from where the cookie will be
       * readable. E.g., "/", "/mydir"; if not specified, defaults to the current
       * path of the current document location (string or null). The path must be
       * absolute (see RFC 2965). For more information on how to use relative paths
       * in this argument, see: https://developer.mozilla.org/en-US/docs/Web/API/document.cookie#Using_relative_URLs_in_the_path_parameter
       * @param {String} domain - [Optional] The domain from where the cookie will
       * be readable. E.g., "example.com", ".example.com" (includes all subdomains)
       * or "subdomain.example.com"; if not specified, defaults to the host portion
       * of the current document location (string or null).
       * @summary Remove a cookie(s).
       * @returns {Boolean}
       */
      remove(key) {
        let path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';
        let domain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
        if (key && this.cookies.hasOwnProperty(key)) {
          const {
            cookieString
          } = serialize(key, '', {
            domain,
            path,
            expires: new Date(0)
          });
          delete this.cookies[key];
          if (Meteor.isClient) {
            document.cookie = cookieString;
          } else if (this.response) {
            this.response.setHeader('Set-Cookie', cookieString);
          }
          return true;
        } else if (!key && this.keys().length > 0 && this.keys()[0] !== '') {
          const keys = Object.keys(this.cookies);
          for (let i = 0; i < keys.length; i++) {
            this.remove(keys[i]);
          }
          return true;
        }
        return false;
      }

      /**
       * @locus Anywhere
       * @memberOf __cookies
       * @name has
       * @param {String} key  - The name of the cookie to create/overwrite
       * @param {String} _tmp - Unparsed string instead of user's cookies
       * @summary Check whether a cookie exists in the current position.
       * @returns {Boolean}
       */
      has(key, _tmp) {
        const cookieString = _tmp ? parse(_tmp) : this.cookies;
        if (!key || !cookieString) {
          return false;
        }
        return cookieString.hasOwnProperty(key);
      }

      /**
       * @locus Anywhere
       * @memberOf __cookies
       * @name keys
       * @summary Returns an array of all readable cookies from this location.
       * @returns {[String]}
       */
      keys() {
        if (this.cookies) {
          return Object.keys(this.cookies);
        }
        return [];
      }

      /**
       * @locus Client
       * @memberOf __cookies
       * @name send
       * @param cb {Function} - Callback
       * @summary Send all cookies over XHR to server.
       * @returns {void}
       */
      send() {
        let cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : NoOp;
        if (Meteor.isServer) {
          cb(new Meteor.Error(400, 'Can\'t run `.send()` on server, it\'s Client only method!'));
        }
        if (this.runOnServer) {
          let path = "".concat(window.__meteor_runtime_config__.ROOT_URL_PATH_PREFIX || window.__meteor_runtime_config__.meteorEnv.ROOT_URL_PATH_PREFIX || '', "/___cookie___/set");
          let query = '';
          if ((Meteor.isCordova || Meteor.isDesktop) && this.allowQueryStringCookies) {
            const cookiesKeys = this.keys();
            const cookiesArray = [];
            for (let i = 0; i < cookiesKeys.length; i++) {
              const {
                sanitizedValue
              } = serialize(cookiesKeys[i], this.get(cookiesKeys[i]));
              const pair = "".concat(cookiesKeys[i], "=").concat(sanitizedValue);
              if (!cookiesArray.includes(pair)) {
                cookiesArray.push(pair);
              }
            }
            if (cookiesArray.length) {
              path = Meteor.absoluteUrl('___cookie___/set');
              query = "?___cookies___=".concat(encodeURIComponent(cookiesArray.join('; ')));
            }
          }
          fetch("".concat(path).concat(query), {
            credentials: 'include',
            type: 'cors'
          }).then(response => {
            cb(void 0, response);
          }).catch(cb);
        } else {
          cb(new Meteor.Error(400, 'Can\'t send cookies on server when `runOnServer` is false.'));
        }
        return void 0;
      }
    }

    /**
     * @function
     * @locus Server
     * @summary Middleware handler
     * @private
     */
    const __middlewareHandler = (request, response, opts) => {
      let _cookies = {};
      if (opts.runOnServer) {
        if (request.headers && request.headers.cookie) {
          _cookies = parse(request.headers.cookie);
        }
        return new __cookies({
          _cookies,
          TTL: opts.TTL,
          runOnServer: opts.runOnServer,
          response,
          allowQueryStringCookies: opts.allowQueryStringCookies
        });
      }
      throw new Meteor.Error(400, 'Can\'t use middleware when `runOnServer` is false.');
    };

    /**
     * @locus Anywhere
     * @class Cookies
     * @param opts {Object}
     * @param opts.TTL {Number} - Default cookies expiration time (max-age) in milliseconds, by default - session (false)
     * @param opts.auto {Boolean} - [Server] Auto-bind in middleware as `req.Cookies`, by default `true`
     * @param opts.handler {Function} - [Server] Middleware handler
     * @param opts.runOnServer {Boolean} - Expose Cookies class to Server
     * @param opts.allowQueryStringCookies {Boolean} - Allow passing Cookies in a query string (in URL). Primary should be used only in Cordova environment
     * @param opts.allowedCordovaOrigins {Regex|Boolean} - [Server] Allow setting Cookies from that specific origin which in Meteor/Cordova is localhost:12XXX (^http://localhost:12[0-9]{3}$)
     * @summary Main Cookie class
     */
    class Cookies extends __cookies {
      constructor() {
        let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        opts.TTL = helpers.isNumber(opts.TTL) ? opts.TTL : false;
        opts.runOnServer = opts.runOnServer !== false ? true : false;
        opts.allowQueryStringCookies = opts.allowQueryStringCookies !== true ? false : true;
        if (Meteor.isClient) {
          opts._cookies = document.cookie;
          super(opts);
        } else {
          opts._cookies = {};
          super(opts);
          opts.auto = opts.auto !== false ? true : false;
          this.opts = opts;
          this.handler = helpers.isFunction(opts.handler) ? opts.handler : false;
          this.onCookies = helpers.isFunction(opts.onCookies) ? opts.onCookies : false;
          if (opts.runOnServer && !Cookies.isLoadedOnServer) {
            Cookies.isLoadedOnServer = true;
            if (opts.auto) {
              WebApp.connectHandlers.use((req, res, next) => {
                if (urlRE.test(req._parsedUrl.path)) {
                  const matchedCordovaOrigin = !!req.headers.origin && this.allowedCordovaOrigins && this.allowedCordovaOrigins.test(req.headers.origin);
                  const matchedOrigin = matchedCordovaOrigin || !!req.headers.origin && this.originRE.test(req.headers.origin);
                  if (matchedOrigin) {
                    res.setHeader('Access-Control-Allow-Credentials', 'true');
                    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                  }
                  const cookiesArray = [];
                  let cookiesObject = {};
                  if (matchedCordovaOrigin && opts.allowQueryStringCookies && req.query.___cookies___) {
                    cookiesObject = parse(decodeURIComponent(req.query.___cookies___));
                  } else if (req.headers.cookie) {
                    cookiesObject = parse(req.headers.cookie);
                  }
                  const cookiesKeys = Object.keys(cookiesObject);
                  if (cookiesKeys.length) {
                    for (let i = 0; i < cookiesKeys.length; i++) {
                      const {
                        cookieString
                      } = serialize(cookiesKeys[i], cookiesObject[cookiesKeys[i]]);
                      if (!cookiesArray.includes(cookieString)) {
                        cookiesArray.push(cookieString);
                      }
                    }
                    if (cookiesArray.length) {
                      res.setHeader('Set-Cookie', cookiesArray);
                    }
                  }
                  helpers.isFunction(this.onCookies) && this.onCookies(__middlewareHandler(req, res, opts));
                  res.writeHead(200);
                  res.end('');
                } else {
                  req.Cookies = __middlewareHandler(req, res, opts);
                  helpers.isFunction(this.handler) && this.handler(req.Cookies);
                  next();
                }
              });
            }
          }
        }
      }

      /**
       * @locus Server
       * @memberOf Cookies
       * @name middleware
       * @summary Get Cookies instance into callback
       * @returns {void}
       */
      middleware() {
        if (!Meteor.isServer) {
          throw new Meteor.Error(500, '[ostrio:cookies] Can\'t use `.middleware()` on Client, it\'s Server only!');
        }
        return (req, res, next) => {
          helpers.isFunction(this.handler) && this.handler(__middlewareHandler(req, res, this.opts));
          next();
        };
      }
    }
    if (Meteor.isServer) {
      Cookies.isLoadedOnServer = false;
    }

    /* Export the Cookies class */
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
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ostrio:cookies/cookies.js"
  ],
  mainModulePath: "/node_modules/meteor/ostrio:cookies/cookies.js"
}});

//# sourceURL=meteor://💻app/packages/ostrio_cookies.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb3N0cmlvOmNvb2tpZXMvY29va2llcy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJDb29raWVzIiwiTWV0ZW9yIiwibGluayIsInYiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsImZldGNoIiwiV2ViQXBwIiwiaXNTZXJ2ZXIiLCJyZXF1aXJlIiwiTm9PcCIsInVybFJFIiwicm9vdFVybCIsInByb2Nlc3MiLCJlbnYiLCJST09UX1VSTCIsIndpbmRvdyIsIl9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18iLCJtZXRlb3JFbnYiLCJtb2JpbGVSb290VXJsIiwiTU9CSUxFX1JPT1RfVVJMIiwiaGVscGVycyIsImlzVW5kZWZpbmVkIiwib2JqIiwiaXNBcnJheSIsIkFycmF5IiwiY2xvbmUiLCJpc09iamVjdCIsInNsaWNlIiwiT2JqZWN0IiwiYXNzaWduIiwiX2hlbHBlcnMiLCJpIiwibGVuZ3RoIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiZGVjb2RlIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiZW5jb2RlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwicGFpclNwbGl0UmVnRXhwIiwiZmllbGRDb250ZW50UmVnRXhwIiwidHJ5RGVjb2RlIiwic3RyIiwiZCIsImUiLCJwYXJzZSIsIm9wdGlvbnMiLCJFcnJvciIsIm9wdCIsInZhbCIsImtleSIsImVxSW5keCIsInNwbGl0IiwiZm9yRWFjaCIsInBhaXIiLCJpbmRleE9mIiwic3Vic3RyIiwidHJpbSIsInVuZXNjYXBlIiwiYW50aUNpcmN1bGFyIiwiX29iaiIsIm9iamVjdCIsImNhY2hlIiwiTWFwIiwiSlNPTiIsInN0cmluZ2lmeSIsInZhbHVlIiwiZ2V0Iiwic2V0Iiwic2VyaWFsaXplIiwiYXJndW1lbnRzIiwidW5kZWZpbmVkIiwibmFtZSIsInRlc3QiLCJlc2NhcGUiLCJzYW5pdGl6ZWRWYWx1ZSIsInN0cmluZ2lmaWVkIiwiY29uY2F0IiwicGFpcnMiLCJpc051bWJlciIsIm1heEFnZSIsInB1c2giLCJkb21haW4iLCJwYXRoIiwiZXhwaXJlcyIsImV4cGlyZSIsIkluZmluaXR5IiwiRGF0ZSIsInRvVVRDU3RyaW5nIiwiaHR0cE9ubHkiLCJzZWN1cmUiLCJmaXJzdFBhcnR5T25seSIsInNhbWVTaXRlIiwiY29va2llU3RyaW5nIiwiam9pbiIsImlzU3RyaW5naWZpZWRSZWdFeCIsImlzVHlwZWRSZWdFeCIsImRlc2VyaWFsaXplIiwic3RyaW5nIiwibWF0Y2giLCJjb25zb2xlIiwiZXJyb3IiLCJfX2Nvb2tpZXMiLCJjb25zdHJ1Y3RvciIsIm9wdHMiLCJfX3BlbmRpbmdDb29raWVzIiwiVFRMIiwicmVzcG9uc2UiLCJydW5PblNlcnZlciIsImFsbG93UXVlcnlTdHJpbmdDb29raWVzIiwiYWxsb3dlZENvcmRvdmFPcmlnaW5zIiwib3JpZ2luUkUiLCJSZWdFeHAiLCJfY29va2llcyIsImNvb2tpZXMiLCJfdG1wIiwiaGFzT3duUHJvcGVydHkiLCJpc0NsaWVudCIsImRvY3VtZW50IiwiY29va2llIiwic2V0SGVhZGVyIiwicmVtb3ZlIiwia2V5cyIsImhhcyIsInNlbmQiLCJjYiIsIlJPT1RfVVJMX1BBVEhfUFJFRklYIiwicXVlcnkiLCJpc0NvcmRvdmEiLCJpc0Rlc2t0b3AiLCJjb29raWVzS2V5cyIsImNvb2tpZXNBcnJheSIsImluY2x1ZGVzIiwiYWJzb2x1dGVVcmwiLCJjcmVkZW50aWFscyIsInR5cGUiLCJ0aGVuIiwiY2F0Y2giLCJfX21pZGRsZXdhcmVIYW5kbGVyIiwicmVxdWVzdCIsImhlYWRlcnMiLCJhdXRvIiwiaGFuZGxlciIsImlzRnVuY3Rpb24iLCJvbkNvb2tpZXMiLCJpc0xvYWRlZE9uU2VydmVyIiwiY29ubmVjdEhhbmRsZXJzIiwidXNlIiwicmVxIiwicmVzIiwibmV4dCIsIl9wYXJzZWRVcmwiLCJtYXRjaGVkQ29yZG92YU9yaWdpbiIsIm9yaWdpbiIsIm1hdGNoZWRPcmlnaW4iLCJjb29raWVzT2JqZWN0IiwiX19fY29va2llc19fXyIsIndyaXRlSGVhZCIsImVuZCIsIm1pZGRsZXdhcmUiLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUFBLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDO01BQUNDLE9BQU8sRUFBQ0EsQ0FBQSxLQUFJQTtJQUFPLENBQUMsQ0FBQztJQUFDLElBQUlDLE1BQU07SUFBQ0gsTUFBTSxDQUFDSSxJQUFJLENBQUMsZUFBZSxFQUFDO01BQUNELE1BQU1BLENBQUNFLENBQUMsRUFBQztRQUFDRixNQUFNLEdBQUNFLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNQSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVqSyxJQUFJQyxLQUFLO0lBQ1QsSUFBSUMsTUFBTTtJQUVWLElBQUlMLE1BQU0sQ0FBQ00sUUFBUSxFQUFFO01BQ25CRCxNQUFNLEdBQUdFLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQ0YsTUFBTTtJQUMxQyxDQUFDLE1BQU07TUFDTEQsS0FBSyxHQUFHRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUNILEtBQUs7SUFDdkM7SUFFQSxNQUFNSSxJQUFJLEdBQUlBLENBQUEsS0FBTSxDQUFDLENBQUM7SUFDdEIsTUFBTUMsS0FBSyxHQUFHLHFCQUFxQjtJQUNuQyxNQUFNQyxPQUFPLEdBQUdWLE1BQU0sQ0FBQ00sUUFBUSxHQUFHSyxPQUFPLENBQUNDLEdBQUcsQ0FBQ0MsUUFBUSxHQUFJQyxNQUFNLENBQUNDLHlCQUF5QixDQUFDRixRQUFRLElBQUlDLE1BQU0sQ0FBQ0MseUJBQXlCLENBQUNDLFNBQVMsQ0FBQ0gsUUFBUSxJQUFJLEtBQU07SUFDcEssTUFBTUksYUFBYSxHQUFHakIsTUFBTSxDQUFDTSxRQUFRLEdBQUdLLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDTSxl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QztrQkFDN0R1SixJQUFJLENBQUMsQ0FBQztnQkFDUjtjQUNGLENBQUMsQ0FBQztZQUNKO1VBQ0Y7UUFDRjtNQUNGOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VTLFVBQVVBLENBQUEsRUFBRztRQUNYLElBQUksQ0FBQy9KLE1BQU0sQ0FBQ00sUUFBUSxFQUFFO1VBQ3BCLE1BQU0sSUFBSU4sTUFBTSxDQUFDK0MsS0FBSyxDQUFDLEdBQUcsRUFBRSwyRUFBMkUsQ0FBQztRQUMxRztRQUVBLE9BQU8sQ0FBQ3FHLEdBQUcsRUFBRUMsR0FBRyxFQUFFQyxJQUFJLEtBQUs7VUFDekJuSSxPQUFPLENBQUM0SCxVQUFVLENBQUMsSUFBSSxDQUFDRCxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUNBLE9BQU8sQ0FBQ0osbUJBQW1CLENBQUNVLEdBQUcsRUFBRUMsR0FBRyxFQUFFLElBQUksQ0FBQzdDLElBQUksQ0FBQyxDQUFDO1VBQzFGOEMsSUFBSSxDQUFDLENBQUM7UUFDUixDQUFDO01BQ0g7SUFDRjtJQUVBLElBQUl0SixNQUFNLENBQUNNLFFBQVEsRUFBRTtNQUNuQlAsT0FBTyxDQUFDa0osZ0JBQWdCLEdBQUcsS0FBSztJQUNsQzs7SUFFQTtJQUFBZSxzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHIiwiZmlsZSI6Ii9wYWNrYWdlcy9vc3RyaW9fY29va2llcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG5sZXQgZmV0Y2g7XG5sZXQgV2ViQXBwO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gIFdlYkFwcCA9IHJlcXVpcmUoJ21ldGVvci93ZWJhcHAnKS5XZWJBcHA7XG59IGVsc2Uge1xuICBmZXRjaCA9IHJlcXVpcmUoJ21ldGVvci9mZXRjaCcpLmZldGNoO1xufVxuXG5jb25zdCBOb09wICA9ICgpID0+IHt9O1xuY29uc3QgdXJsUkUgPSAvXFwvX19fY29va2llX19fXFwvc2V0LztcbmNvbnN0IHJvb3RVcmwgPSBNZXRlb3IuaXNTZXJ2ZXIgPyBwcm9jZXNzLmVudi5ST09UX1VSTCA6ICh3aW5kb3cuX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5ST09UX1VSTCB8fCB3aW5kb3cuX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5tZXRlb3JFbnYuUk9PVF9VUkwgfHwgZmFsc2UpO1xuY29uc3QgbW9iaWxlUm9vdFVybCA9IE1ldGVvci5pc1NlcnZlciA/IHByb2Nlc3MuZW52Lk1PQklMRV9ST09UX1VSTCA6ICh3aW5kb3cuX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5NT0JJTEVfUk9PVF9VUkwgfHwgd2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18ubWV0ZW9yRW52Lk1PQklMRV9ST09UX1VSTCB8fCBmYWxzZSk7XG5cbmNvbnN0IGhlbHBlcnMgPSB7XG4gIGlzVW5kZWZpbmVkKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfSxcbiAgaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmopO1xuICB9LFxuICBjbG9uZShvYmopIHtcbiAgICBpZiAoIXRoaXMuaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gdGhpcy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IE9iamVjdC5hc3NpZ24oe30sIG9iaik7XG4gIH1cbn07XG5jb25zdCBfaGVscGVycyA9IFsnTnVtYmVyJywgJ09iamVjdCcsICdGdW5jdGlvbiddO1xuZm9yIChsZXQgaSA9IDA7IGkgPCBfaGVscGVycy5sZW5ndGg7IGkrKykge1xuICBoZWxwZXJzWydpcycgKyBfaGVscGVyc1tpXV0gPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCAnICsgX2hlbHBlcnNbaV0gKyAnXSc7XG4gIH07XG59XG5cbi8qKlxuICogQHVybCBodHRwczovL2dpdGh1Yi5jb20vanNodHRwL2Nvb2tpZS9ibG9iL21hc3Rlci9pbmRleC5qc1xuICogQG5hbWUgY29va2llXG4gKiBAYXV0aG9yIGpzaHR0cFxuICogQGxpY2Vuc2VcbiAqIChUaGUgTUlUIExpY2Vuc2UpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyLTIwMTQgUm9tYW4gU2h0eWxtYW4gPHNodHlsbWFuQGdtYWlsLmNvbT5cbiAqIENvcHlyaWdodCAoYykgMjAxNSBEb3VnbGFzIENocmlzdG9waGVyIFdpbHNvbiA8ZG91Z0Bzb21ldGhpbmdkb3VnLmNvbT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuICogJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbiAqIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZXG4gKiBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuICogVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEVcbiAqIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5jb25zdCBkZWNvZGUgPSBkZWNvZGVVUklDb21wb25lbnQ7XG5jb25zdCBlbmNvZGUgPSBlbmNvZGVVUklDb21wb25lbnQ7XG5jb25zdCBwYWlyU3BsaXRSZWdFeHAgPSAvOyAqLztcblxuLyoqXG4gKiBSZWdFeHAgdG8gbWF0Y2ggZmllbGQtY29udGVudCBpbiBSRkMgNzIzMCBzZWMgMy4yXG4gKlxuICogZmllbGQtY29udGVudCA9IGZpZWxkLXZjaGFyIFsgMSooIFNQIC8gSFRBQiApIGZpZWxkLXZjaGFyIF1cbiAqIGZpZWxkLXZjaGFyICAgPSBWQ0hBUiAvIG9icy10ZXh0XG4gKiBvYnMtdGV4dCAgICAgID0gJXg4MC1GRlxuICovXG5jb25zdCBmaWVsZENvbnRlbnRSZWdFeHAgPSAvXltcXHUwMDA5XFx1MDAyMC1cXHUwMDdlXFx1MDA4MC1cXHUwMGZmXSskLztcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHRyeURlY29kZVxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtGdW5jdGlvbn0gZFxuICogQHN1bW1hcnkgVHJ5IGRlY29kaW5nIGEgc3RyaW5nIHVzaW5nIGEgZGVjb2RpbmcgZnVuY3Rpb24uXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCB0cnlEZWNvZGUgPSAoc3RyLCBkKSA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGQoc3RyKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBwYXJzZVxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHJldHVybiB7T2JqZWN0fVxuICogQHN1bW1hcnlcbiAqIFBhcnNlIGEgY29va2llIGhlYWRlci5cbiAqIFBhcnNlIHRoZSBnaXZlbiBjb29raWUgaGVhZGVyIHN0cmluZyBpbnRvIGFuIG9iamVjdFxuICogVGhlIG9iamVjdCBoYXMgdGhlIHZhcmlvdXMgY29va2llcyBhcyBrZXlzKG5hbWVzKSA9PiB2YWx1ZXNcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IHBhcnNlID0gKHN0ciwgb3B0aW9ucykgPT4ge1xuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwNCwgJ2FyZ3VtZW50IHN0ciBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gIH1cbiAgY29uc3Qgb2JqID0ge307XG4gIGNvbnN0IG9wdCA9IG9wdGlvbnMgfHwge307XG4gIGxldCB2YWw7XG4gIGxldCBrZXk7XG4gIGxldCBlcUluZHg7XG5cbiAgc3RyLnNwbGl0KHBhaXJTcGxpdFJlZ0V4cCkuZm9yRWFjaCgocGFpcikgPT4ge1xuICAgIGVxSW5keCA9IHBhaXIuaW5kZXhPZignPScpO1xuICAgIGlmIChlcUluZHggPCAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGtleSA9IHBhaXIuc3Vic3RyKDAsIGVxSW5keCkudHJpbSgpO1xuICAgIGtleSA9IHRyeURlY29kZSh1bmVzY2FwZShrZXkpLCAob3B0LmRlY29kZSB8fCBkZWNvZGUpKTtcbiAgICB2YWwgPSBwYWlyLnN1YnN0cigrK2VxSW5keCwgcGFpci5sZW5ndGgpLnRyaW0oKTtcbiAgICBpZiAodmFsWzBdID09PSAnXCInKSB7XG4gICAgICB2YWwgPSB2YWwuc2xpY2UoMSwgLTEpO1xuICAgIH1cbiAgICBpZiAodm9pZCAwID09PSBvYmpba2V5XSkge1xuICAgICAgb2JqW2tleV0gPSB0cnlEZWNvZGUodmFsLCAob3B0LmRlY29kZSB8fCBkZWNvZGUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIGFudGlDaXJjdWxhclxuICogQHBhcmFtIGRhdGEge09iamVjdH0gLSBDaXJjdWxhciBvciBhbnkgb3RoZXIgb2JqZWN0IHdoaWNoIG5lZWRzIHRvIGJlIG5vbi1jaXJjdWxhclxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgYW50aUNpcmN1bGFyID0gKF9vYmopID0+IHtcbiAgY29uc3Qgb2JqZWN0ID0gaGVscGVycy5jbG9uZShfb2JqKTtcbiAgY29uc3QgY2FjaGUgID0gbmV3IE1hcCgpO1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqZWN0LCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICBpZiAoY2FjaGUuZ2V0KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgICAgY2FjaGUuc2V0KHZhbHVlLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9KTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzZXJpYWxpemVcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJuIHsgY29va2llU3RyaW5nOiBTdHJpbmcsIHNhbml0aXplZFZhbHVlOiBNaXhlZCB9XG4gKiBAc3VtbWFyeVxuICogU2VyaWFsaXplIGRhdGEgaW50byBhIGNvb2tpZSBoZWFkZXIuXG4gKiBTZXJpYWxpemUgdGhlIGEgbmFtZSB2YWx1ZSBwYWlyIGludG8gYSBjb29raWUgc3RyaW5nIHN1aXRhYmxlIGZvclxuICogaHR0cCBoZWFkZXJzLiBBbiBvcHRpb25hbCBvcHRpb25zIG9iamVjdCBzcGVjaWZpZWQgY29va2llIHBhcmFtZXRlcnMuXG4gKiBzZXJpYWxpemUoJ2ZvbycsICdiYXInLCB7IGh0dHBPbmx5OiB0cnVlIH0pID0+IFwiZm9vPWJhcjsgaHR0cE9ubHlcIlxuICogQHByaXZhdGVcbiAqL1xuY29uc3Qgc2VyaWFsaXplID0gKGtleSwgdmFsLCBvcHQgPSB7fSkgPT4ge1xuICBsZXQgbmFtZTtcblxuICBpZiAoIWZpZWxkQ29udGVudFJlZ0V4cC50ZXN0KGtleSkpIHtcbiAgICBuYW1lID0gZXNjYXBlKGtleSk7XG4gIH0gZWxzZSB7XG4gICAgbmFtZSA9IGtleTtcbiAgfVxuXG4gIGxldCBzYW5pdGl6ZWRWYWx1ZSA9IHZhbDtcbiAgbGV0IHZhbHVlID0gdmFsO1xuICBpZiAoIWhlbHBlcnMuaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgaWYgKGhlbHBlcnMuaXNPYmplY3QodmFsdWUpIHx8IGhlbHBlcnMuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGNvbnN0IHN0cmluZ2lmaWVkID0gYW50aUNpcmN1bGFyKHZhbHVlKTtcbiAgICAgIHZhbHVlID0gZW5jb2RlKGBKU09OLnBhcnNlKCR7c3RyaW5naWZpZWR9KWApO1xuICAgICAgc2FuaXRpemVkVmFsdWUgPSBKU09OLnBhcnNlKHN0cmluZ2lmaWVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSBlbmNvZGUodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlICYmICFmaWVsZENvbnRlbnRSZWdFeHAudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBlc2NhcGUodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YWx1ZSA9ICcnO1xuICB9XG5cbiAgY29uc3QgcGFpcnMgPSBbYCR7bmFtZX09JHt2YWx1ZX1gXTtcblxuICBpZiAoaGVscGVycy5pc051bWJlcihvcHQubWF4QWdlKSkge1xuICAgIHBhaXJzLnB1c2goYE1heC1BZ2U9JHtvcHQubWF4QWdlfWApO1xuICB9XG5cbiAgaWYgKG9wdC5kb21haW4gJiYgdHlwZW9mIG9wdC5kb21haW4gPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKCFmaWVsZENvbnRlbnRSZWdFeHAudGVzdChvcHQuZG9tYWluKSkge1xuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDQsICdvcHRpb24gZG9tYWluIGlzIGludmFsaWQnKTtcbiAgICB9XG4gICAgcGFpcnMucHVzaChgRG9tYWluPSR7b3B0LmRvbWFpbn1gKTtcbiAgfVxuXG4gIGlmIChvcHQucGF0aCAmJiB0eXBlb2Ygb3B0LnBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKCFmaWVsZENvbnRlbnRSZWdFeHAudGVzdChvcHQucGF0aCkpIHtcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDA0LCAnb3B0aW9uIHBhdGggaXMgaW52YWxpZCcpO1xuICAgIH1cbiAgICBwYWlycy5wdXNoKGBQYXRoPSR7b3B0LnBhdGh9YCk7XG4gIH0gZWxzZSB7XG4gICAgcGFpcnMucHVzaCgnUGF0aD0vJyk7XG4gIH1cblxuICBvcHQuZXhwaXJlcyA9IG9wdC5leHBpcmVzIHx8IG9wdC5leHBpcmUgfHwgZmFsc2U7XG4gIGlmIChvcHQuZXhwaXJlcyA9PT0gSW5maW5pdHkpIHtcbiAgICBwYWlycy5wdXNoKCdFeHBpcmVzPUZyaSwgMzEgRGVjIDk5OTkgMjM6NTk6NTkgR01UJyk7XG4gIH0gZWxzZSBpZiAob3B0LmV4cGlyZXMgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcGFpcnMucHVzaChgRXhwaXJlcz0ke29wdC5leHBpcmVzLnRvVVRDU3RyaW5nKCl9YCk7XG4gIH0gZWxzZSBpZiAob3B0LmV4cGlyZXMgPT09IDApIHtcbiAgICBwYWlycy5wdXNoKCdFeHBpcmVzPTAnKTtcbiAgfSBlbHNlIGlmIChoZWxwZXJzLmlzTnVtYmVyKG9wdC5leHBpcmVzKSkge1xuICAgIHBhaXJzLnB1c2goYEV4cGlyZXM9JHsobmV3IERhdGUob3B0LmV4cGlyZXMpKS50b1VUQ1N0cmluZygpfWApO1xuICB9XG5cbiAgaWYgKG9wdC5odHRwT25seSkge1xuICAgIHBhaXJzLnB1c2goJ0h0dHBPbmx5Jyk7XG4gIH1cblxuICBpZiAob3B0LnNlY3VyZSkge1xuICAgIHBhaXJzLnB1c2goJ1NlY3VyZScpO1xuICB9XG5cbiAgaWYgKG9wdC5maXJzdFBhcnR5T25seSkge1xuICAgIHBhaXJzLnB1c2goJ0ZpcnN0LVBhcnR5LU9ubHknKTtcbiAgfVxuXG4gIGlmIChvcHQuc2FtZVNpdGUpIHtcbiAgICBwYWlycy5wdXNoKG9wdC5zYW1lU2l0ZSA9PT0gdHJ1ZSA/ICdTYW1lU2l0ZScgOiBgU2FtZVNpdGU9JHtvcHQuc2FtZVNpdGV9YCk7XG4gIH1cblxuICByZXR1cm4geyBjb29raWVTdHJpbmc6IHBhaXJzLmpvaW4oJzsgJyksIHNhbml0aXplZFZhbHVlIH07XG59O1xuXG5jb25zdCBpc1N0cmluZ2lmaWVkUmVnRXggPSAvSlNPTlxcLnBhcnNlXFwoKC4qKVxcKS87XG5jb25zdCBpc1R5cGVkUmVnRXggPSAvZmFsc2V8dHJ1ZXxudWxsLztcbmNvbnN0IGRlc2VyaWFsaXplID0gKHN0cmluZykgPT4ge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3RyaW5nO1xuICB9XG5cbiAgaWYgKGlzU3RyaW5naWZpZWRSZWdFeC50ZXN0KHN0cmluZykpIHtcbiAgICBsZXQgb2JqID0gc3RyaW5nLm1hdGNoKGlzU3RyaW5naWZpZWRSZWdFeClbMV07XG4gICAgaWYgKG9iaikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGVjb2RlKG9iaikpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbb3N0cmlvOmNvb2tpZXNdIFsuZ2V0KCldIFtkZXNlcmlhbGl6ZSgpXSBFeGNlcHRpb246JywgZSwgc3RyaW5nLCBvYmopO1xuICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RyaW5nO1xuICB9IGVsc2UgaWYgKGlzVHlwZWRSZWdFeC50ZXN0KHN0cmluZykpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2Uoc3RyaW5nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gc3RyaW5nO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyaW5nO1xufTtcblxuLyoqXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqIEBjbGFzcyBfX2Nvb2tpZXNcbiAqIEBwYXJhbSBvcHRzIHtPYmplY3R9IC0gT3B0aW9ucyAoY29uZmlndXJhdGlvbikgb2JqZWN0XG4gKiBAcGFyYW0gb3B0cy5fY29va2llcyB7T2JqZWN0fFN0cmluZ30gLSBDdXJyZW50IGNvb2tpZXMgYXMgU3RyaW5nIG9yIE9iamVjdFxuICogQHBhcmFtIG9wdHMuVFRMIHtOdW1iZXJ8Qm9vbGVhbn0gLSBEZWZhdWx0IGNvb2tpZXMgZXhwaXJhdGlvbiB0aW1lIChtYXgtYWdlKSBpbiBtaWxsaXNlY29uZHMsIGJ5IGRlZmF1bHQgLSBzZXNzaW9uIChmYWxzZSlcbiAqIEBwYXJhbSBvcHRzLnJ1bk9uU2VydmVyIHtCb29sZWFufSAtIEV4cG9zZSBDb29raWVzIGNsYXNzIHRvIFNlcnZlclxuICogQHBhcmFtIG9wdHMucmVzcG9uc2Uge2h0dHAuU2VydmVyUmVzcG9uc2V8T2JqZWN0fSAtIFRoaXMgb2JqZWN0IGlzIGNyZWF0ZWQgaW50ZXJuYWxseSBieSBhIEhUVFAgc2VydmVyXG4gKiBAcGFyYW0gb3B0cy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcyB7Qm9vbGVhbn0gLSBBbGxvdyBwYXNzaW5nIENvb2tpZXMgaW4gYSBxdWVyeSBzdHJpbmcgKGluIFVSTCkuIFByaW1hcnkgc2hvdWxkIGJlIHVzZWQgb25seSBpbiBDb3Jkb3ZhIGVudmlyb25tZW50XG4gKiBAcGFyYW0gb3B0cy5hbGxvd2VkQ29yZG92YU9yaWdpbnMge1JlZ2V4fEJvb2xlYW59IC0gW1NlcnZlcl0gQWxsb3cgc2V0dGluZyBDb29raWVzIGZyb20gdGhhdCBzcGVjaWZpYyBvcmlnaW4gd2hpY2ggaW4gTWV0ZW9yL0NvcmRvdmEgaXMgbG9jYWxob3N0OjEyWFhYICheaHR0cDovL2xvY2FsaG9zdDoxMlswLTldezN9JClcbiAqIEBzdW1tYXJ5IEludGVybmFsIENsYXNzXG4gKi9cbmNsYXNzIF9fY29va2llcyB7XG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICB0aGlzLl9fcGVuZGluZ0Nvb2tpZXMgPSBbXTtcbiAgICB0aGlzLlRUTCA9IG9wdHMuVFRMIHx8IGZhbHNlO1xuICAgIHRoaXMucmVzcG9uc2UgPSBvcHRzLnJlc3BvbnNlIHx8IGZhbHNlO1xuICAgIHRoaXMucnVuT25TZXJ2ZXIgPSBvcHRzLnJ1bk9uU2VydmVyIHx8IGZhbHNlO1xuICAgIHRoaXMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMgPSBvcHRzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzIHx8IGZhbHNlO1xuICAgIHRoaXMuYWxsb3dlZENvcmRvdmFPcmlnaW5zID0gb3B0cy5hbGxvd2VkQ29yZG92YU9yaWdpbnMgfHwgZmFsc2U7XG5cbiAgICBpZiAodGhpcy5hbGxvd2VkQ29yZG92YU9yaWdpbnMgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuYWxsb3dlZENvcmRvdmFPcmlnaW5zID0gL15odHRwOlxcL1xcL2xvY2FsaG9zdDoxMlswLTldezN9JC87XG4gICAgfVxuXG4gICAgdGhpcy5vcmlnaW5SRSA9IG5ldyBSZWdFeHAoYF5odHRwcz86XFwvXFwvKCR7cm9vdFVybCA/IHJvb3RVcmwgOiAnJ30ke21vYmlsZVJvb3RVcmwgPyAoJ3wnICsgbW9iaWxlUm9vdFVybCkgOiAnJ30pJGApO1xuXG4gICAgaWYgKGhlbHBlcnMuaXNPYmplY3Qob3B0cy5fY29va2llcykpIHtcbiAgICAgIHRoaXMuY29va2llcyA9IG9wdHMuX2Nvb2tpZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29va2llcyA9IHBhcnNlKG9wdHMuX2Nvb2tpZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIF9fY29va2llc1xuICAgKiBAbmFtZSBnZXRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleSAgLSBUaGUgbmFtZSBvZiB0aGUgY29va2llIHRvIHJlYWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IF90bXAgLSBVbnBhcnNlZCBzdHJpbmcgaW5zdGVhZCBvZiB1c2VyJ3MgY29va2llc1xuICAgKiBAc3VtbWFyeSBSZWFkIGEgY29va2llLiBJZiB0aGUgY29va2llIGRvZXNuJ3QgZXhpc3QgYSBudWxsIHZhbHVlIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8dm9pZH1cbiAgICovXG4gIGdldChrZXksIF90bXApIHtcbiAgICBjb25zdCBjb29raWVTdHJpbmcgPSBfdG1wID8gcGFyc2UoX3RtcCkgOiB0aGlzLmNvb2tpZXM7XG4gICAgaWYgKCFrZXkgfHwgIWNvb2tpZVN0cmluZykge1xuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG5cbiAgICBpZiAoY29va2llU3RyaW5nLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZShjb29raWVTdHJpbmdba2V5XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIF9fY29va2llc1xuICAgKiBAbmFtZSBzZXRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleSAgIC0gVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0byBjcmVhdGUvb3ZlcndyaXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgY29va2llXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzICAtIFtPcHRpb25hbF0gQ29va2llIG9wdGlvbnMgKHNlZSByZWFkbWUgZG9jcylcbiAgICogQHN1bW1hcnkgQ3JlYXRlL292ZXJ3cml0ZSBhIGNvb2tpZS5cbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqL1xuICBzZXQoa2V5LCB2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgaWYgKGtleSAmJiAhaGVscGVycy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIGlmIChoZWxwZXJzLmlzTnVtYmVyKHRoaXMuVFRMKSAmJiBvcHRzLmV4cGlyZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcHRzLmV4cGlyZXMgPSBuZXcgRGF0ZSgrbmV3IERhdGUoKSArIHRoaXMuVFRMKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgY29va2llU3RyaW5nLCBzYW5pdGl6ZWRWYWx1ZSB9ID0gc2VyaWFsaXplKGtleSwgdmFsdWUsIG9wdHMpO1xuXG4gICAgICB0aGlzLmNvb2tpZXNba2V5XSA9IHNhbml0aXplZFZhbHVlO1xuICAgICAgaWYgKE1ldGVvci5pc0NsaWVudCkge1xuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWVTdHJpbmc7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucmVzcG9uc2UpIHtcbiAgICAgICAgdGhpcy5fX3BlbmRpbmdDb29raWVzLnB1c2goY29va2llU3RyaW5nKTtcbiAgICAgICAgdGhpcy5yZXNwb25zZS5zZXRIZWFkZXIoJ1NldC1Db29raWUnLCB0aGlzLl9fcGVuZGluZ0Nvb2tpZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIF9fY29va2llc1xuICAgKiBAbmFtZSByZW1vdmVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleSAgICAtIFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdG8gY3JlYXRlL292ZXJ3cml0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAgIC0gW09wdGlvbmFsXSBUaGUgcGF0aCBmcm9tIHdoZXJlIHRoZSBjb29raWUgd2lsbCBiZVxuICAgKiByZWFkYWJsZS4gRS5nLiwgXCIvXCIsIFwiL215ZGlyXCI7IGlmIG5vdCBzcGVjaWZpZWQsIGRlZmF1bHRzIHRvIHRoZSBjdXJyZW50XG4gICAqIHBhdGggb2YgdGhlIGN1cnJlbnQgZG9jdW1lbnQgbG9jYXRpb24gKHN0cmluZyBvciBudWxsKS4gVGhlIHBhdGggbXVzdCBiZVxuICAgKiBhYnNvbHV0ZSAoc2VlIFJGQyAyOTY1KS4gRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRvIHVzZSByZWxhdGl2ZSBwYXRoc1xuICAgKiBpbiB0aGlzIGFyZ3VtZW50LCBzZWU6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9kb2N1bWVudC5jb29raWUjVXNpbmdfcmVsYXRpdmVfVVJMc19pbl90aGVfcGF0aF9wYXJhbWV0ZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiAtIFtPcHRpb25hbF0gVGhlIGRvbWFpbiBmcm9tIHdoZXJlIHRoZSBjb29raWUgd2lsbFxuICAgKiBiZSByZWFkYWJsZS4gRS5nLiwgXCJleGFtcGxlLmNvbVwiLCBcIi5leGFtcGxlLmNvbVwiIChpbmNsdWRlcyBhbGwgc3ViZG9tYWlucylcbiAgICogb3IgXCJzdWJkb21haW4uZXhhbXBsZS5jb21cIjsgaWYgbm90IHNwZWNpZmllZCwgZGVmYXVsdHMgdG8gdGhlIGhvc3QgcG9ydGlvblxuICAgKiBvZiB0aGUgY3VycmVudCBkb2N1bWVudCBsb2NhdGlvbiAoc3RyaW5nIG9yIG51bGwpLlxuICAgKiBAc3VtbWFyeSBSZW1vdmUgYSBjb29raWUocykuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKi9cbiAgcmVtb3ZlKGtleSwgcGF0aCA9ICcvJywgZG9tYWluID0gJycpIHtcbiAgICBpZiAoa2V5ICYmIHRoaXMuY29va2llcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjb25zdCB7IGNvb2tpZVN0cmluZyB9ID0gc2VyaWFsaXplKGtleSwgJycsIHtcbiAgICAgICAgZG9tYWluLFxuICAgICAgICBwYXRoLFxuICAgICAgICBleHBpcmVzOiBuZXcgRGF0ZSgwKVxuICAgICAgfSk7XG5cbiAgICAgIGRlbGV0ZSB0aGlzLmNvb2tpZXNba2V5XTtcbiAgICAgIGlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llU3RyaW5nO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMucmVzcG9uc2Uuc2V0SGVhZGVyKCdTZXQtQ29va2llJywgY29va2llU3RyaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoIWtleSAmJiB0aGlzLmtleXMoKS5sZW5ndGggPiAwICYmIHRoaXMua2V5cygpWzBdICE9PSAnJykge1xuICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY29va2llcyk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5yZW1vdmUoa2V5c1tpXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgX19jb29raWVzXG4gICAqIEBuYW1lIGhhc1xuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5ICAtIFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdG8gY3JlYXRlL292ZXJ3cml0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gX3RtcCAtIFVucGFyc2VkIHN0cmluZyBpbnN0ZWFkIG9mIHVzZXIncyBjb29raWVzXG4gICAqIEBzdW1tYXJ5IENoZWNrIHdoZXRoZXIgYSBjb29raWUgZXhpc3RzIGluIHRoZSBjdXJyZW50IHBvc2l0aW9uLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICovXG4gIGhhcyhrZXksIF90bXApIHtcbiAgICBjb25zdCBjb29raWVTdHJpbmcgPSBfdG1wID8gcGFyc2UoX3RtcCkgOiB0aGlzLmNvb2tpZXM7XG4gICAgaWYgKCFrZXkgfHwgIWNvb2tpZVN0cmluZykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBjb29raWVTdHJpbmcuaGFzT3duUHJvcGVydHkoa2V5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIF9fY29va2llc1xuICAgKiBAbmFtZSBrZXlzXG4gICAqIEBzdW1tYXJ5IFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHJlYWRhYmxlIGNvb2tpZXMgZnJvbSB0aGlzIGxvY2F0aW9uLlxuICAgKiBAcmV0dXJucyB7W1N0cmluZ119XG4gICAqL1xuICBrZXlzKCkge1xuICAgIGlmICh0aGlzLmNvb2tpZXMpIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmNvb2tpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvKipcbiAgICogQGxvY3VzIENsaWVudFxuICAgKiBAbWVtYmVyT2YgX19jb29raWVzXG4gICAqIEBuYW1lIHNlbmRcbiAgICogQHBhcmFtIGNiIHtGdW5jdGlvbn0gLSBDYWxsYmFja1xuICAgKiBAc3VtbWFyeSBTZW5kIGFsbCBjb29raWVzIG92ZXIgWEhSIHRvIHNlcnZlci5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBzZW5kKGNiID0gTm9PcCkge1xuICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICAgIGNiKG5ldyBNZXRlb3IuRXJyb3IoNDAwLCAnQ2FuXFwndCBydW4gYC5zZW5kKClgIG9uIHNlcnZlciwgaXRcXCdzIENsaWVudCBvbmx5IG1ldGhvZCEnKSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucnVuT25TZXJ2ZXIpIHtcbiAgICAgIGxldCBwYXRoID0gYCR7d2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkxfUEFUSF9QUkVGSVggfHwgd2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18ubWV0ZW9yRW52LlJPT1RfVVJMX1BBVEhfUFJFRklYIHx8ICcnfS9fX19jb29raWVfX18vc2V0YDtcbiAgICAgIGxldCBxdWVyeSA9ICcnO1xuXG4gICAgICBpZiAoKE1ldGVvci5pc0NvcmRvdmEgfHwgTWV0ZW9yLmlzRGVza3RvcCkgJiYgdGhpcy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcykge1xuICAgICAgICBjb25zdCBjb29raWVzS2V5cyA9IHRoaXMua2V5cygpO1xuICAgICAgICBjb25zdCBjb29raWVzQXJyYXkgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb29raWVzS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IHsgc2FuaXRpemVkVmFsdWUgfSA9IHNlcmlhbGl6ZShjb29raWVzS2V5c1tpXSwgdGhpcy5nZXQoY29va2llc0tleXNbaV0pKTtcbiAgICAgICAgICBjb25zdCBwYWlyID0gYCR7Y29va2llc0tleXNbaV19PSR7c2FuaXRpemVkVmFsdWV9YDtcbiAgICAgICAgICBpZiAoIWNvb2tpZXNBcnJheS5pbmNsdWRlcyhwYWlyKSkge1xuICAgICAgICAgICAgY29va2llc0FycmF5LnB1c2gocGFpcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvb2tpZXNBcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICBwYXRoID0gTWV0ZW9yLmFic29sdXRlVXJsKCdfX19jb29raWVfX18vc2V0Jyk7XG4gICAgICAgICAgcXVlcnkgPSBgP19fX2Nvb2tpZXNfX189JHtlbmNvZGVVUklDb21wb25lbnQoY29va2llc0FycmF5LmpvaW4oJzsgJykpfWA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZmV0Y2goYCR7cGF0aH0ke3F1ZXJ5fWAsIHtcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcbiAgICAgICAgdHlwZTogJ2NvcnMnXG4gICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjYih2b2lkIDAsIHJlc3BvbnNlKTtcbiAgICAgIH0pLmNhdGNoKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2IobmV3IE1ldGVvci5FcnJvcig0MDAsICdDYW5cXCd0IHNlbmQgY29va2llcyBvbiBzZXJ2ZXIgd2hlbiBgcnVuT25TZXJ2ZXJgIGlzIGZhbHNlLicpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQGxvY3VzIFNlcnZlclxuICogQHN1bW1hcnkgTWlkZGxld2FyZSBoYW5kbGVyXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBfX21pZGRsZXdhcmVIYW5kbGVyID0gKHJlcXVlc3QsIHJlc3BvbnNlLCBvcHRzKSA9PiB7XG4gIGxldCBfY29va2llcyA9IHt9O1xuICBpZiAob3B0cy5ydW5PblNlcnZlcikge1xuICAgIGlmIChyZXF1ZXN0LmhlYWRlcnMgJiYgcmVxdWVzdC5oZWFkZXJzLmNvb2tpZSkge1xuICAgICAgX2Nvb2tpZXMgPSBwYXJzZShyZXF1ZXN0LmhlYWRlcnMuY29va2llKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IF9fY29va2llcyh7XG4gICAgICBfY29va2llcyxcbiAgICAgIFRUTDogb3B0cy5UVEwsXG4gICAgICBydW5PblNlcnZlcjogb3B0cy5ydW5PblNlcnZlcixcbiAgICAgIHJlc3BvbnNlLFxuICAgICAgYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXM6IG9wdHMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXNcbiAgICB9KTtcbiAgfVxuXG4gIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAwLCAnQ2FuXFwndCB1c2UgbWlkZGxld2FyZSB3aGVuIGBydW5PblNlcnZlcmAgaXMgZmFsc2UuJyk7XG59O1xuXG4vKipcbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQGNsYXNzIENvb2tpZXNcbiAqIEBwYXJhbSBvcHRzIHtPYmplY3R9XG4gKiBAcGFyYW0gb3B0cy5UVEwge051bWJlcn0gLSBEZWZhdWx0IGNvb2tpZXMgZXhwaXJhdGlvbiB0aW1lIChtYXgtYWdlKSBpbiBtaWxsaXNlY29uZHMsIGJ5IGRlZmF1bHQgLSBzZXNzaW9uIChmYWxzZSlcbiAqIEBwYXJhbSBvcHRzLmF1dG8ge0Jvb2xlYW59IC0gW1NlcnZlcl0gQXV0by1iaW5kIGluIG1pZGRsZXdhcmUgYXMgYHJlcS5Db29raWVzYCwgYnkgZGVmYXVsdCBgdHJ1ZWBcbiAqIEBwYXJhbSBvcHRzLmhhbmRsZXIge0Z1bmN0aW9ufSAtIFtTZXJ2ZXJdIE1pZGRsZXdhcmUgaGFuZGxlclxuICogQHBhcmFtIG9wdHMucnVuT25TZXJ2ZXIge0Jvb2xlYW59IC0gRXhwb3NlIENvb2tpZXMgY2xhc3MgdG8gU2VydmVyXG4gKiBAcGFyYW0gb3B0cy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcyB7Qm9vbGVhbn0gLSBBbGxvdyBwYXNzaW5nIENvb2tpZXMgaW4gYSBxdWVyeSBzdHJpbmcgKGluIFVSTCkuIFByaW1hcnkgc2hvdWxkIGJlIHVzZWQgb25seSBpbiBDb3Jkb3ZhIGVudmlyb25tZW50XG4gKiBAcGFyYW0gb3B0cy5hbGxvd2VkQ29yZG92YU9yaWdpbnMge1JlZ2V4fEJvb2xlYW59IC0gW1NlcnZlcl0gQWxsb3cgc2V0dGluZyBDb29raWVzIGZyb20gdGhhdCBzcGVjaWZpYyBvcmlnaW4gd2hpY2ggaW4gTWV0ZW9yL0NvcmRvdmEgaXMgbG9jYWxob3N0OjEyWFhYICheaHR0cDovL2xvY2FsaG9zdDoxMlswLTldezN9JClcbiAqIEBzdW1tYXJ5IE1haW4gQ29va2llIGNsYXNzXG4gKi9cbmNsYXNzIENvb2tpZXMgZXh0ZW5kcyBfX2Nvb2tpZXMge1xuICBjb25zdHJ1Y3RvcihvcHRzID0ge30pIHtcbiAgICBvcHRzLlRUTCA9IGhlbHBlcnMuaXNOdW1iZXIob3B0cy5UVEwpID8gb3B0cy5UVEwgOiBmYWxzZTtcbiAgICBvcHRzLnJ1bk9uU2VydmVyID0gKG9wdHMucnVuT25TZXJ2ZXIgIT09IGZhbHNlKSA/IHRydWUgOiBmYWxzZTtcbiAgICBvcHRzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzID0gKG9wdHMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMgIT09IHRydWUpID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgaWYgKE1ldGVvci5pc0NsaWVudCkge1xuICAgICAgb3B0cy5fY29va2llcyA9IGRvY3VtZW50LmNvb2tpZTtcbiAgICAgIHN1cGVyKG9wdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRzLl9jb29raWVzID0ge307XG4gICAgICBzdXBlcihvcHRzKTtcbiAgICAgIG9wdHMuYXV0byA9IChvcHRzLmF1dG8gIT09IGZhbHNlKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgICB0aGlzLmhhbmRsZXIgPSBoZWxwZXJzLmlzRnVuY3Rpb24ob3B0cy5oYW5kbGVyKSA/IG9wdHMuaGFuZGxlciA6IGZhbHNlO1xuICAgICAgdGhpcy5vbkNvb2tpZXMgPSBoZWxwZXJzLmlzRnVuY3Rpb24ob3B0cy5vbkNvb2tpZXMpID8gb3B0cy5vbkNvb2tpZXMgOiBmYWxzZTtcblxuICAgICAgaWYgKG9wdHMucnVuT25TZXJ2ZXIgJiYgIUNvb2tpZXMuaXNMb2FkZWRPblNlcnZlcikge1xuICAgICAgICBDb29raWVzLmlzTG9hZGVkT25TZXJ2ZXIgPSB0cnVlO1xuICAgICAgICBpZiAob3B0cy5hdXRvKSB7XG4gICAgICAgICAgV2ViQXBwLmNvbm5lY3RIYW5kbGVycy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgICAgICBpZiAodXJsUkUudGVzdChyZXEuX3BhcnNlZFVybC5wYXRoKSkge1xuICAgICAgICAgICAgICBjb25zdCBtYXRjaGVkQ29yZG92YU9yaWdpbiA9ICEhcmVxLmhlYWRlcnMub3JpZ2luXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5hbGxvd2VkQ29yZG92YU9yaWdpbnNcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucy50ZXN0KHJlcS5oZWFkZXJzLm9yaWdpbik7XG4gICAgICAgICAgICAgIGNvbnN0IG1hdGNoZWRPcmlnaW4gPSBtYXRjaGVkQ29yZG92YU9yaWdpblxuICAgICAgICAgICAgICAgIHx8ICghIXJlcS5oZWFkZXJzLm9yaWdpbiAmJiB0aGlzLm9yaWdpblJFLnRlc3QocmVxLmhlYWRlcnMub3JpZ2luKSk7XG5cbiAgICAgICAgICAgICAgaWYgKG1hdGNoZWRPcmlnaW4pIHtcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgcmVxLmhlYWRlcnMub3JpZ2luKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IGNvb2tpZXNBcnJheSA9IFtdO1xuICAgICAgICAgICAgICBsZXQgY29va2llc09iamVjdCA9IHt9O1xuICAgICAgICAgICAgICBpZiAobWF0Y2hlZENvcmRvdmFPcmlnaW4gJiYgb3B0cy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcyAmJiByZXEucXVlcnkuX19fY29va2llc19fXykge1xuICAgICAgICAgICAgICAgIGNvb2tpZXNPYmplY3QgPSBwYXJzZShkZWNvZGVVUklDb21wb25lbnQocmVxLnF1ZXJ5Ll9fX2Nvb2tpZXNfX18pKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXEuaGVhZGVycy5jb29raWUpIHtcbiAgICAgICAgICAgICAgICBjb29raWVzT2JqZWN0ID0gcGFyc2UocmVxLmhlYWRlcnMuY29va2llKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IGNvb2tpZXNLZXlzID0gT2JqZWN0LmtleXMoY29va2llc09iamVjdCk7XG4gICAgICAgICAgICAgIGlmIChjb29raWVzS2V5cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvb2tpZXNLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCB7IGNvb2tpZVN0cmluZyB9ID0gc2VyaWFsaXplKGNvb2tpZXNLZXlzW2ldLCBjb29raWVzT2JqZWN0W2Nvb2tpZXNLZXlzW2ldXSk7XG4gICAgICAgICAgICAgICAgICBpZiAoIWNvb2tpZXNBcnJheS5pbmNsdWRlcyhjb29raWVTdHJpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvb2tpZXNBcnJheS5wdXNoKGNvb2tpZVN0cmluZyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNvb2tpZXNBcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ1NldC1Db29raWUnLCBjb29raWVzQXJyYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLm9uQ29va2llcykgJiYgdGhpcy5vbkNvb2tpZXMoX19taWRkbGV3YXJlSGFuZGxlcihyZXEsIHJlcywgb3B0cykpO1xuXG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoMjAwKTtcbiAgICAgICAgICAgICAgcmVzLmVuZCgnJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXEuQ29va2llcyA9IF9fbWlkZGxld2FyZUhhbmRsZXIocmVxLCByZXMsIG9wdHMpO1xuICAgICAgICAgICAgICBoZWxwZXJzLmlzRnVuY3Rpb24odGhpcy5oYW5kbGVyKSAmJiB0aGlzLmhhbmRsZXIocmVxLkNvb2tpZXMpO1xuICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAbWVtYmVyT2YgQ29va2llc1xuICAgKiBAbmFtZSBtaWRkbGV3YXJlXG4gICAqIEBzdW1tYXJ5IEdldCBDb29raWVzIGluc3RhbmNlIGludG8gY2FsbGJhY2tcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBtaWRkbGV3YXJlKCkge1xuICAgIGlmICghTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDUwMCwgJ1tvc3RyaW86Y29va2llc10gQ2FuXFwndCB1c2UgYC5taWRkbGV3YXJlKClgIG9uIENsaWVudCwgaXRcXCdzIFNlcnZlciBvbmx5IScpO1xuICAgIH1cblxuICAgIHJldHVybiAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLmhhbmRsZXIpICYmIHRoaXMuaGFuZGxlcihfX21pZGRsZXdhcmVIYW5kbGVyKHJlcSwgcmVzLCB0aGlzLm9wdHMpKTtcbiAgICAgIG5leHQoKTtcbiAgICB9O1xuICB9XG59XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgQ29va2llcy5pc0xvYWRlZE9uU2VydmVyID0gZmFsc2U7XG59XG5cbi8qIEV4cG9ydCB0aGUgQ29va2llcyBjbGFzcyAqL1xuZXhwb3J0IHsgQ29va2llcyB9O1xuIl19
