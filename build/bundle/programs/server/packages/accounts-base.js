Package["core-runtime"].queue("accounts-base",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var Hook = Package['callback-hook'].Hook;
var URL = Package.url.URL;
var URLSearchParams = Package.url.URLSearchParams;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Accounts, options, stampedLoginToken, handler, name, query, oldestValidDate, user;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-base":{"server_main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/accounts-base/server_main.js                                                                               //
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
    var _Meteor$settings$pack, _Meteor$settings$pack2;
    module1.export({
      AccountsServer: () => AccountsServer
    });
    let AccountsServer;
    module1.link("./accounts_server.js", {
      AccountsServer(v) {
        AccountsServer = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    /**
     * @namespace Accounts
     * @summary The namespace for all server-side accounts-related methods.
     */
    Accounts = new AccountsServer(Meteor.server, _objectSpread(_objectSpread({}, (_Meteor$settings$pack = Meteor.settings.packages) === null || _Meteor$settings$pack === void 0 ? void 0 : _Meteor$settings$pack.accounts), (_Meteor$settings$pack2 = Meteor.settings.packages) === null || _Meteor$settings$pack2 === void 0 ? void 0 : _Meteor$settings$pack2['accounts-base']));
    // TODO[FIBERS]: I need TLA
    Accounts.init().then();
    // Users table. Don't use the normal autopublish, since we want to hide
    // some fields. Code to autopublish this is in accounts_server.js.
    // XXX Allow users to configure this collection name.

    /**
     * @summary A [Mongo.Collection](#collections) containing user documents.
     * @locus Anywhere
     * @type {Mongo.Collection}
     * @importFromPackage meteor
     */
    Meteor.users = Accounts.users;
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

},"accounts_common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/accounts-base/accounts_common.js                                                                           //
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
      AccountsCommon: () => AccountsCommon,
      EXPIRE_TOKENS_INTERVAL_MS: () => EXPIRE_TOKENS_INTERVAL_MS
    });
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // config option keys
    const VALID_CONFIG_KEYS = ['sendVerificationEmail', 'forbidClientAccountCreation', 'restrictCreationByEmailDomain', 'loginExpiration', 'loginExpirationInDays', 'oauthSecretKey', 'passwordResetTokenExpirationInDays', 'passwordResetTokenExpiration', 'passwordEnrollTokenExpirationInDays', 'passwordEnrollTokenExpiration', 'ambiguousErrorMessages', 'bcryptRounds', 'defaultFieldSelector', 'collection', 'loginTokenExpirationHours', 'tokenSequenceLength', 'clientStorage', 'ddpUrl', 'connection'];

    /**
     * @summary Super-constructor for AccountsClient and AccountsServer.
     * @locus Anywhere
     * @class AccountsCommon
     * @instancename accountsClientOrServer
     * @param options {Object} an object with fields:
     * - connection {Object} Optional DDP connection to reuse.
     * - ddpUrl {String} Optional URL for creating a new DDP connection.
     * - collection {String|Mongo.Collection} The name of the Mongo.Collection
     *     or the Mongo.Collection object to hold the users.
     */
    class AccountsCommon {
      constructor(options) {
        // Validate config options keys
        for (const key of Object.keys(options)) {
          if (!VALID_CONFIG_KEYS.includes(key)) {
            console.error("Accounts.config: Invalid key: ".concat(key));
          }
        }

        // Currently this is read directly by packages like accounts-password
        // and accounts-ui-unstyled.
        this._options = options || {};

        // Note that setting this.connection = null causes this.users to be a
        // LocalCollection, which is not what we want.
        this.connection = undefined;
        this._initConnection(options || {});

        // There is an allow call in accounts_server.js that restricts writes to
        // this collection.
        this.users = this._initializeCollection(options || {});

        // Callback exceptions are printed with Meteor._debug and ignored.
        this._onLoginHook = new Hook({
          bindEnvironment: false,
          debugPrintExceptions: 'onLogin callback'
        });
        this._onLoginFailureHook = new Hook({
          bindEnvironment: false,
          debugPrintExceptions: 'onLoginFailure callback'
        });
        this._onLogoutHook = new Hook({
          bindEnvironment: false,
          debugPrintExceptions: 'onLogout callback'
        });

        // Expose for testing.
        this.DEFAULT_LOGIN_EXPIRATION_DAYS = DEFAULT_LOGIN_EXPIRATION_DAYS;
        this.LOGIN_UNEXPIRING_TOKEN_DAYS = LOGIN_UNEXPIRING_TOKEN_DAYS;

        // Thrown when the user cancels the login process (eg, closes an oauth
        // popup, declines retina scan, etc)
        const lceName = 'Accounts.LoginCancelledError';
        this.LoginCancelledError = Meteor.makeErrorType(lceName, function (description) {
          this.message = description;
        });
        this.LoginCancelledError.prototype.name = lceName;

        // This is used to transmit specific subclass errors over the wire. We
        // should come up with a more generic way to do this (eg, with some sort of
        // symbolic error code rather than a number).
        this.LoginCancelledError.numericError = 0x8acdc2f;
      }
      _initializeCollection(options) {
        if (options.collection && typeof options.collection !== 'string' && !(options.collection instanceof Mongo.Collection)) {
          throw new Meteor.Error('Collection parameter can be only of type string or "Mongo.Collection"');
        }
        let collectionName = 'users';
        if (typeof options.collection === 'string') {
          collectionName = options.collection;
        }
        let collection;
        if (options.collection instanceof Mongo.Collection) {
          collection = options.collection;
        } else {
          collection = new Mongo.Collection(collectionName, {
            _preventAutopublish: true,
            connection: this.connection
          });
        }
        return collection;
      }

      /**
       * @summary Get the current user id, or `null` if no user is logged in. A reactive data source.
       * @locus Anywhere
       */
      userId() {
        throw new Error('userId method not implemented');
      }

      // merge the defaultFieldSelector with an existing options object
      _addDefaultFieldSelector() {
        let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        // this will be the most common case for most people, so make it quick
        if (!this._options.defaultFieldSelector) return options;

        // if no field selector then just use defaultFieldSelector
        if (!options.fields) return _objectSpread(_objectSpread({}, options), {}, {
          fields: this._options.defaultFieldSelector
        });

        // if empty field selector then the full user object is explicitly requested, so obey
        const keys = Object.keys(options.fields);
        if (!keys.length) return options;

        // if the requested fields are +ve then ignore defaultFieldSelector
        // assume they are all either +ve or -ve because Mongo doesn't like mixed
        if (!!options.fields[keys[0]]) return options;

        // The requested fields are -ve.
        // If the defaultFieldSelector is +ve then use requested fields, otherwise merge them
        const keys2 = Object.keys(this._options.defaultFieldSelector);
        return this._options.defaultFieldSelector[keys2[0]] ? options : _objectSpread(_objectSpread({}, options), {}, {
          fields: _objectSpread(_objectSpread({}, options.fields), this._options.defaultFieldSelector)
        });
      }

      /**
       * @summary Get the current user record, or `null` if no user is logged in. A reactive data source. In the server this fuction returns a promise.
       * @locus Anywhere
       * @param {Object} [options]
       * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
       */
      user(options) {
        if (Meteor.isServer) {
          console.warn(["`Meteor.user()` is deprecated on the server side.", "    To fetch the current user record on the server,", "    use `Meteor.userAsync()` instead."].join("\n"));
        }
        const self = this;
        const userId = self.userId();
        const findOne = function () {
          return Meteor.isClient ? self.users.findOne(...arguments) : self.users.findOneAsync(...arguments);
        };
        return userId ? findOne(userId, this._addDefaultFieldSelector(options)) : null;
      }

      /**
       * @summary Get the current user record, or `null` if no user is logged in.
       * @locus Anywhere
       * @param {Object} [options]
       * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
       */
      async userAsync(options) {
        const userId = this.userId();
        return userId ? this.users.findOneAsync(userId, this._addDefaultFieldSelector(options)) : null;
      }
      // Set up config for the accounts system. Call this on both the client
      // and the server.
      //
      // Note that this method gets overridden on AccountsServer.prototype, but
      // the overriding method calls the overridden method.
      //
      // XXX we should add some enforcement that this is called on both the
      // client and the server. Otherwise, a user can
      // 'forbidClientAccountCreation' only on the client and while it looks
      // like their app is secure, the server will still accept createUser
      // calls. https://github.com/meteor/meteor/issues/828
      //
      // @param options {Object} an object with fields:
      // - sendVerificationEmail {Boolean}
      //     Send email address verification emails to new users created from
      //     client signups.
      // - forbidClientAccountCreation {Boolean}
      //     Do not allow clients to create accounts directly.
      // - restrictCreationByEmailDomain {Function or String}
      //     Require created users to have an email matching the function or
      //     having the string as domain.
      // - loginExpirationInDays {Number}
      //     Number of days since login until a user is logged out (login token
      //     expires).
      // - collection {String|Mongo.Collection}
      //     A collection name or a Mongo.Collection object to hold the users.
      // - passwordResetTokenExpirationInDays {Number}
      //     Number of days since password reset token creation until the
      //     token can't be used any longer (password reset token expires).
      // - ambiguousErrorMessages {Boolean}
      //     Return ambiguous error messages from login failures to prevent
      //     user enumeration.
      // - bcryptRounds {Number}
      //     Allows override of number of bcrypt rounds (aka work factor) used
      //     to store passwords.

      /**
       * @summary Set global accounts options. You can also set these in `Meteor.settings.packages.accounts` without the need to call this function.
       * @locus Anywhere
       * @param {Object} options
       * @param {Boolean} options.sendVerificationEmail New users with an email address will receive an address verification email.
       * @param {Boolean} options.forbidClientAccountCreation Calls to [`createUser`](#accounts_createuser) from the client will be rejected. In addition, if you are using [accounts-ui](#accountsui), the "Create account" link will not be available.
       * @param {String | Function} options.restrictCreationByEmailDomain If set to a string, only allows new users if the domain part of their email address matches the string. If set to a function, only allows new users if the function returns true.  The function is passed the full email address of the proposed new user.  Works with password-based sign-in and external services that expose email addresses (Google, Facebook, GitHub). All existing users still can log in after enabling this option. Example: `Accounts.config({ restrictCreationByEmailDomain: 'school.edu' })`.
       * @param {Number} options.loginExpiration The number of milliseconds from when a user logs in until their token expires and they are logged out, for a more granular control. If `loginExpirationInDays` is set, it takes precedent.
       * @param {Number} options.loginExpirationInDays The number of days from when a user logs in until their token expires and they are logged out. Defaults to 90. Set to `null` to disable login expiration.
       * @param {String} options.oauthSecretKey When using the `oauth-encryption` package, the 16 byte key using to encrypt sensitive account credentials in the database, encoded in base64.  This option may only be specified on the server.  See packages/oauth-encryption/README.md for details.
       * @param {Number} options.passwordResetTokenExpirationInDays The number of days from when a link to reset password is sent until token expires and user can't reset password with the link anymore. Defaults to 3.
       * @param {Number} options.passwordResetTokenExpiration The number of milliseconds from when a link to reset password is sent until token expires and user can't reset password with the link anymore. If `passwordResetTokenExpirationInDays` is set, it takes precedent.
       * @param {Number} options.passwordEnrollTokenExpirationInDays The number of days from when a link to set initial password is sent until token expires and user can't set password with the link anymore. Defaults to 30.
       * @param {Number} options.passwordEnrollTokenExpiration The number of milliseconds from when a link to set initial password is sent until token expires and user can't set password with the link anymore. If `passwordEnrollTokenExpirationInDays` is set, it takes precedent.
       * @param {Boolean} options.ambiguousErrorMessages Return ambiguous error messages from login failures to prevent user enumeration. Defaults to `true`.
       * @param {Number} options.bcryptRounds Allows override of number of bcrypt rounds (aka work factor) used to store passwords. The default is 10.
       * @param {MongoFieldSpecifier} options.defaultFieldSelector To exclude by default large custom fields from `Meteor.user()` and `Meteor.findUserBy...()` functions when called without a field selector, and all `onLogin`, `onLoginFailure` and `onLogout` callbacks.  Example: `Accounts.config({ defaultFieldSelector: { myBigArray: 0 }})`. Beware when using this. If, for instance, you do not include `email` when excluding the fields, you can have problems with functions like `forgotPassword` that will break because they won't have the required data available. It's recommend that you always keep the fields `_id`, `username`, and `email`.
       * @param {String|Mongo.Collection} options.collection A collection name or a Mongo.Collection object to hold the users.
       * @param {Number} options.loginTokenExpirationHours When using the package `accounts-2fa`, use this to set the amount of time a token sent is valid. As it's just a number, you can use, for example, 0.5 to make the token valid for just half hour. The default is 1 hour.
       * @param {Number} options.tokenSequenceLength When using the package `accounts-2fa`, use this to the size of the token sequence generated. The default is 6.
       * @param {'session' | 'local'} options.clientStorage By default login credentials are stored in local storage, setting this to true will switch to using session storage.
       */
      config(options) {
        // We don't want users to accidentally only call Accounts.config on the
        // client, where some of the options will have partial effects (eg removing
        // the "create account" button from accounts-ui if forbidClientAccountCreation
        // is set, or redirecting Google login to a specific-domain page) without
        // having their full effects.
        if (Meteor.isServer) {
          __meteor_runtime_config__.accountsConfigCalled = true;
        } else if (!__meteor_runtime_config__.accountsConfigCalled) {
          // XXX would be nice to "crash" the client and replace the UI with an error
          // message, but there's no trivial way to do this.
          Meteor._debug('Accounts.config was called on the client but not on the ' + 'server; some configuration options may not take effect.');
        }

        // We need to validate the oauthSecretKey option at the time
        // Accounts.config is called. We also deliberately don't store the
        // oauthSecretKey in Accounts._options.
        if (Object.prototype.hasOwnProperty.call(options, 'oauthSecretKey')) {
          if (Meteor.isClient) {
            throw new Error('The oauthSecretKey option may only be specified on the server');
          }
          if (!Package['oauth-encryption']) {
            throw new Error('The oauth-encryption package must be loaded to set oauthSecretKey');
          }
          Package['oauth-encryption'].OAuthEncryption.loadKey(options.oauthSecretKey);
          options = _objectSpread({}, options);
          delete options.oauthSecretKey;
        }

        // Validate config options keys
        for (const key of Object.keys(options)) {
          if (!VALID_CONFIG_KEYS.includes(key)) {
            console.error("Accounts.config: Invalid key: ".concat(key));
          }
        }

        // set values in Accounts._options
        for (const key of VALID_CONFIG_KEYS) {
          if (key in options) {
            if (key in this._options) {
              if (key !== 'collection' && Meteor.isTest && key !== 'clientStorage') {
                throw new Meteor.Error("Can't set `".concat(key, "` more than once"));
              }
            }
            this._options[key] = options[key];
          }
        }
        if (options.collection && options.collection !== this.users._name && options.collection !== this.users) {
          this.users = this._initializeCollection(options);
        }
      }

      /**
       * @summary Register a callback to be called after a login attempt succeeds.
       * @locus Anywhere
       * @param {Function} func The callback to be called when login is successful.
       *                        The callback receives a single object that
       *                        holds login details. This object contains the login
       *                        result type (password, resume, etc.) on both the
       *                        client and server. `onLogin` callbacks registered
       *                        on the server also receive extra data, such
       *                        as user details, connection information, etc.
       */
      onLogin(func) {
        let ret = this._onLoginHook.register(func);
        // call the just registered callback if already logged in
        this._startupCallback(ret.callback);
        return ret;
      }

      /**
       * @summary Register a callback to be called after a login attempt fails.
       * @locus Anywhere
       * @param {Function} func The callback to be called after the login has failed.
       */
      onLoginFailure(func) {
        return this._onLoginFailureHook.register(func);
      }

      /**
       * @summary Register a callback to be called after a logout attempt succeeds.
       * @locus Anywhere
       * @param {Function} func The callback to be called when logout is successful.
       */
      onLogout(func) {
        return this._onLogoutHook.register(func);
      }
      _initConnection(options) {
        if (!Meteor.isClient) {
          return;
        }

        // The connection used by the Accounts system. This is the connection
        // that will get logged in by Meteor.login(), and this is the
        // connection whose login state will be reflected by Meteor.userId().
        //
        // It would be much preferable for this to be in accounts_client.js,
        // but it has to be here because it's needed to create the
        // Meteor.users collection.
        if (options.connection) {
          this.connection = options.connection;
        } else if (options.ddpUrl) {
          this.connection = DDP.connect(options.ddpUrl);
        } else if (typeof __meteor_runtime_config__ !== 'undefined' && __meteor_runtime_config__.ACCOUNTS_CONNECTION_URL) {
          // Temporary, internal hook to allow the server to point the client
          // to a different authentication server. This is for a very
          // particular use case that comes up when implementing a oauth
          // server. Unsupported and may go away at any point in time.
          //
          // We will eventually provide a general way to use account-base
          // against any DDP connection, not just one special one.
          this.connection = DDP.connect(__meteor_runtime_config__.ACCOUNTS_CONNECTION_URL);
        } else {
          this.connection = Meteor.connection;
        }
      }
      _getTokenLifetimeMs() {
        // When loginExpirationInDays is set to null, we'll use a really high
        // number of days (LOGIN_UNEXPIRABLE_TOKEN_DAYS) to simulate an
        // unexpiring token.
        const loginExpirationInDays = this._options.loginExpirationInDays === null ? LOGIN_UNEXPIRING_TOKEN_DAYS : this._options.loginExpirationInDays;
        return this._options.loginExpiration || (loginExpirationInDays || DEFAULT_LOGIN_EXPIRATION_DAYS) * 86400000;
      }
      _getPasswordResetTokenLifetimeMs() {
        return this._options.passwordResetTokenExpiration || (this._options.passwordResetTokenExpirationInDays || DEFAULT_PASSWORD_RESET_TOKEN_EXPIRATION_DAYS) * 86400000;
      }
      _getPasswordEnrollTokenLifetimeMs() {
        return this._options.passwordEnrollTokenExpiration || (this._options.passwordEnrollTokenExpirationInDays || DEFAULT_PASSWORD_ENROLL_TOKEN_EXPIRATION_DAYS) * 86400000;
      }
      _tokenExpiration(when) {
        // We pass when through the Date constructor for backwards compatibility;
        // `when` used to be a number.
        return new Date(new Date(when).getTime() + this._getTokenLifetimeMs());
      }
      _tokenExpiresSoon(when) {
        let minLifetimeMs = 0.1 * this._getTokenLifetimeMs();
        const minLifetimeCapMs = MIN_TOKEN_LIFETIME_CAP_SECS * 1000;
        if (minLifetimeMs > minLifetimeCapMs) {
          minLifetimeMs = minLifetimeCapMs;
        }
        return new Date() > new Date(when) - minLifetimeMs;
      }

      // No-op on the server, overridden on the client.
      _startupCallback(callback) {}
    }
    // Note that Accounts is defined separately in accounts_client.js and
    // accounts_server.js.

    /**
     * @summary Get the current user id, or `null` if no user is logged in. A reactive data source.
     * @locus Anywhere
     * @importFromPackage meteor
     */
    Meteor.userId = () => Accounts.userId();

    /**
     * @summary Get the current user record, or `null` if no user is logged in. A reactive data source.
     * @locus Anywhere
     * @importFromPackage meteor
     * @param {Object} [options]
     * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
     */
    Meteor.user = options => Accounts.user(options);

    /**
     * @summary Get the current user record, or `null` if no user is logged in. A reactive data source.
     * @locus Anywhere
     * @importFromPackage meteor
     * @param {Object} [options]
     * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
     */
    Meteor.userAsync = options => Accounts.userAsync(options);

    // how long (in days) until a login token expires
    const DEFAULT_LOGIN_EXPIRATION_DAYS = 90;
    // how long (in days) until reset password token expires
    const DEFAULT_PASSWORD_RESET_TOKEN_EXPIRATION_DAYS = 3;
    // how long (in days) until enrol password token expires
    const DEFAULT_PASSWORD_ENROLL_TOKEN_EXPIRATION_DAYS = 30;
    // Clients don't try to auto-login with a token that is going to expire within
    // .1 * DEFAULT_LOGIN_EXPIRATION_DAYS, capped at MIN_TOKEN_LIFETIME_CAP_SECS.
    // Tries to avoid abrupt disconnects from expiring tokens.
    const MIN_TOKEN_LIFETIME_CAP_SECS = 3600; // one hour
    // how often (in milliseconds) we check for expired tokens
    const EXPIRE_TOKENS_INTERVAL_MS = 600 * 1000;
    // 10 minutes
    // A large number of expiration days (approximately 100 years worth) that is
    // used when creating unexpiring tokens.
    const LOGIN_UNEXPIRING_TOKEN_DAYS = 365 * 100;
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

},"accounts_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/accounts-base/accounts_server.js                                                                           //
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
    let _objectSpread;
    module.link("@babel/runtime/helpers/objectSpread2", {
      default(v) {
        _objectSpread = v;
      }
    }, 1);
    let _asyncIterator;
    module.link("@babel/runtime/helpers/asyncIterator", {
      default(v) {
        _asyncIterator = v;
      }
    }, 2);
    var _Package$oauthEncryp;
    const _excluded = ["token"];
    module.export({
      AccountsServer: () => AccountsServer
    });
    let crypto;
    module.link("crypto", {
      default(v) {
        crypto = v;
      }
    }, 0);
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 1);
    let AccountsCommon, EXPIRE_TOKENS_INTERVAL_MS;
    module.link("./accounts_common.js", {
      AccountsCommon(v) {
        AccountsCommon = v;
      },
      EXPIRE_TOKENS_INTERVAL_MS(v) {
        EXPIRE_TOKENS_INTERVAL_MS = v;
      }
    }, 2);
    let URL;
    module.link("meteor/url", {
      URL(v) {
        URL = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const hasOwn = Object.prototype.hasOwnProperty;

    // XXX maybe this belongs in the check package
    const NonEmptyString = Match.Where(x => {
      check(x, String);
      return x.length > 0;
    });

    /**
     * @summary Constructor for the `Accounts` namespace on the server.
     * @locus Server
     * @class AccountsServer
     * @extends AccountsCommon
     * @instancename accountsServer
     * @param {Object} server A server object such as `Meteor.server`.
     */
    class AccountsServer extends AccountsCommon {
      // Note that this constructor is less likely to be instantiated multiple
      // times than the `AccountsClient` constructor, because a single server
      // can provide only one set of methods.
      constructor(server, _options) {
        var _this;
        super(_options || {});
        _this = this;
        ///
        /// CREATE USER HOOKS
        ///
        /**
         * @summary Customize login token creation.
         * @locus Server
         * @param {Function} func Called whenever a new token is created.
         * Return the sequence and the user object. Return true to keep sending the default email, or false to override the behavior.
         */
        this.onCreateLoginToken = function (func) {
          if (this._onCreateLoginTokenHook) {
            throw new Error('Can only call onCreateLoginToken once');
          }
          this._onCreateLoginTokenHook = func;
        };
        // Generates a MongoDB selector that can be used to perform a fast case
        // insensitive lookup for the given fieldName and string. Since MongoDB does
        // not support case insensitive indexes, and case insensitive regex queries
        // are slow, we construct a set of prefix selectors for all permutations of
        // the first 4 characters ourselves. We first attempt to matching against
        // these, and because 'prefix expression' regex queries do use indexes (see
        // http://docs.mongodb.org/v2.6/reference/operator/query/regex/#index-use),
        // this has been found to greatly improve performance (from 1200ms to 5ms in a
        // test with 1.000.000 users).
        this._selectorForFastCaseInsensitiveLookup = (fieldName, string) => {
          // Performance seems to improve up to 4 prefix characters
          const prefix = string.substring(0, Math.min(string.length, 4));
          const orClause = generateCasePermutationsForString(prefix).map(prefixPermutation => {
            const selector = {};
            selector[fieldName] = new RegExp("^".concat(Meteor._escapeRegExp(prefixPermutation)));
            return selector;
          });
          const caseInsensitiveClause = {};
          caseInsensitiveClause[fieldName] = new RegExp("^".concat(Meteor._escapeRegExp(string), "$"), 'i');
          return {
            $and: [{
              $or: orClause
            }, caseInsensitiveClause]
          };
        };
        this._findUserByQuery = async (query, options) => {
          let user = null;
          if (query.id) {
            // default field selector is added within getUserById()
            user = await Meteor.users.findOneAsync(query.id, this._addDefaultFieldSelector(options));
          } else {
            options = this._addDefaultFieldSelector(options);
            let fieldName;
            let fieldValue;
            if (query.username) {
              fieldName = 'username';
              fieldValue = query.username;
            } else if (query.email) {
              fieldName = 'emails.address';
              fieldValue = query.email;
            } else {
              throw new Error("shouldn't happen (validation missed something)");
            }
            let selector = {};
            selector[fieldName] = fieldValue;
            user = await Meteor.users.findOneAsync(selector, options);
            // If user is not found, try a case insensitive lookup
            if (!user) {
              selector = this._selectorForFastCaseInsensitiveLookup(fieldName, fieldValue);
              const candidateUsers = await Meteor.users.find(selector, _objectSpread(_objectSpread({}, options), {}, {
                limit: 2
              })).fetchAsync();
              // No match if multiple candidates are found
              if (candidateUsers.length === 1) {
                user = candidateUsers[0];
              }
            }
          }
          return user;
        };
        this._handleError = function (msg) {
          var _this$_options$ambigu;
          let throwError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
          let errorCode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 403;
          const isErrorAmbiguous = (_this$_options$ambigu = _this._options.ambiguousErrorMessages) !== null && _this$_options$ambigu !== void 0 ? _this$_options$ambigu : true;
          const error = new Meteor.Error(errorCode, isErrorAmbiguous ? 'Something went wrong. Please check your credentials.' : msg);
          if (throwError) {
            throw error;
          }
          return error;
        };
        this._userQueryValidator = Match.Where(user => {
          check(user, {
            id: Match.Optional(NonEmptyString),
            username: Match.Optional(NonEmptyString),
            email: Match.Optional(NonEmptyString)
          });
          if (Object.keys(user).length !== 1) throw new Match.Error("User property must have exactly one field");
          return true;
        });
        this._server = server || Meteor.server;
        // Set up the server's methods, as if by calling Meteor.methods.
        this._initServerMethods();
        this._initAccountDataHooks();

        // If autopublish is on, publish these user fields. Login service
        // packages (eg accounts-google) add to these by calling
        // addAutopublishFields.  Notably, this isn't implemented with multiple
        // publishes since DDP only merges only across top-level fields, not
        // subfields (such as 'services.facebook.accessToken')
        this._autopublishFields = {
          loggedInUser: ['profile', 'username', 'emails'],
          otherUsers: ['profile', 'username']
        };

        // use object to keep the reference when used in functions
        // where _defaultPublishFields is destructured into lexical scope
        // for publish callbacks that need `this`
        this._defaultPublishFields = {
          projection: {
            profile: 1,
            username: 1,
            emails: 1
          }
        };
        this._initServerPublications();

        // connectionId -> {connection, loginToken}
        this._accountData = {};

        // connection id -> observe handle for the login token that this connection is
        // currently associated with, or a number. The number indicates that we are in
        // the process of setting up the observe (using a number instead of a single
        // sentinel allows multiple attempts to set up the observe to identify which
        // one was theirs).
        this._userObservesForConnections = {};
        this._nextUserObserveNumber = 1; // for the number described above.

        // list of all registered handlers.
        this._loginHandlers = [];
        setupDefaultLoginHandlers(this);
        setExpireTokensInterval(this);
        this._validateLoginHook = new Hook({
          bindEnvironment: false
        });
        this._validateNewUserHooks = [defaultValidateNewUserHook.bind(this)];
        this._deleteSavedTokensForAllUsersOnStartup();
        this._skipCaseInsensitiveChecksForTest = {};
        this.urls = {
          resetPassword: (token, extraParams) => this.buildEmailUrl("#/reset-password/".concat(token), extraParams),
          verifyEmail: (token, extraParams) => this.buildEmailUrl("#/verify-email/".concat(token), extraParams),
          loginToken: (selector, token, extraParams) => this.buildEmailUrl("/?loginToken=".concat(token, "&selector=").concat(selector), extraParams),
          enrollAccount: (token, extraParams) => this.buildEmailUrl("#/enroll-account/".concat(token), extraParams)
        };
        this.addDefaultRateLimit();
        this.buildEmailUrl = function (path) {
          let extraParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          const url = new URL(Meteor.absoluteUrl(path));
          const params = Object.entries(extraParams);
          if (params.length > 0) {
            // Add additional parameters to the url
            for (const [key, value] of params) {
              url.searchParams.append(key, value);
            }
          }
          return url.toString();
        };
      }

      ///
      /// CURRENT USER
      ///

      // @override of "abstract" non-implementation in accounts_common.js
      userId() {
        // This function only works if called inside a method or a pubication.
        // Using any of the information from Meteor.user() in a method or
        // publish function will always use the value from when the function first
        // runs. This is likely not what the user expects. The way to make this work
        // in a method or publish function is to do Meteor.find(this.userId).observe
        // and recompute when the user record changes.
        const currentInvocation = DDP._CurrentMethodInvocation.get() || DDP._CurrentPublicationInvocation.get();
        if (!currentInvocation) throw new Error("Meteor.userId can only be invoked in method calls or publications.");
        return currentInvocation.userId;
      }
      async init() {
        await setupUsersCollection(this.users);
      }

      ///
      /// LOGIN HOOKS
      ///

      /**
       * @summary Validate login attempts.
       * @locus Server
       * @param {Function} func Called whenever a login is attempted (either successful or unsuccessful).  A login can be aborted by returning a falsy value or throwing an exception.
       */
      validateLoginAttempt(func) {
        // Exceptions inside the hook callback are passed up to us.
        return this._validateLoginHook.register(func);
      }

      /**
       * @summary Set restrictions on new user creation.
       * @locus Server
       * @param {Function} func Called whenever a new user is created. Takes the new user object, and returns true to allow the creation or false to abort.
       */
      validateNewUser(func) {
        this._validateNewUserHooks.push(func);
      }

      /**
       * @summary Validate login from external service
       * @locus Server
       * @param {Function} func Called whenever login/user creation from external service is attempted. Login or user creation based on this login can be aborted by passing a falsy value or throwing an exception.
       */
      beforeExternalLogin(func) {
        if (this._beforeExternalLoginHook) {
          throw new Error("Can only call beforeExternalLogin once");
        }
        this._beforeExternalLoginHook = func;
      }
      /**
       * @summary Customize new user creation.
       * @locus Server
       * @param {Function} func Called whenever a new user is created. Return the new user object, or throw an `Error` to abort the creation.
       */
      onCreateUser(func) {
        if (this._onCreateUserHook) {
          throw new Error("Can only call onCreateUser once");
        }
        this._onCreateUserHook = Meteor.wrapFn(func);
      }

      /**
       * @summary Customize oauth user profile updates
       * @locus Server
       * @param {Function} func Called whenever a user is logged in via oauth. Return the profile object to be merged, or throw an `Error` to abort the creation.
       */
      onExternalLogin(func) {
        if (this._onExternalLoginHook) {
          throw new Error("Can only call onExternalLogin once");
        }
        this._onExternalLoginHook = func;
      }

      /**
       * @summary Customize user selection on external logins
       * @locus Server
       * @param {Function} func Called whenever a user is logged in via oauth and a
       * user is not found with the service id. Return the user or undefined.
       */
      setAdditionalFindUserOnExternalLogin(func) {
        if (this._additionalFindUserOnExternalLogin) {
          throw new Error("Can only call setAdditionalFindUserOnExternalLogin once");
        }
        this._additionalFindUserOnExternalLogin = func;
      }
      async _validateLogin(connection, attempt) {
        await this._validateLoginHook.forEachAsync(async callback => {
          let ret;
          try {
            ret = await callback(cloneAttemptWithConnection(connection, attempt));
          } catch (e) {
            attempt.allowed = false;
            // XXX this means the last thrown error overrides previous error
            // messages. Maybe this is surprising to users and we should make
            // overriding errors more explicit. (see
            // https://github.com/meteor/meteor/issues/1960)
            attempt.error = e;
            return true;
          }
          if (!ret) {
            attempt.allowed = false;
            // don't override a specific error provided by a previous
            // validator or the initial attempt (eg "incorrect password").
            if (!attempt.error) attempt.error = new Meteor.Error(403, "Login forbidden");
          }
          return true;
        });
      }
      async _successfulLogin(connection, attempt) {
        await this._onLoginHook.forEachAsync(async callback => {
          await callback(cloneAttemptWithConnection(connection, attempt));
          return true;
        });
      }
      async _failedLogin(connection, attempt) {
        await this._onLoginFailureHook.forEachAsync(async callback => {
          await callback(cloneAttemptWithConnection(connection, attempt));
          return true;
        });
      }
      async _successfulLogout(connection, userId) {
        // don't fetch the user object unless there are some callbacks registered
        let user;
        await this._onLogoutHook.forEachAsync(async callback => {
          if (!user && userId) user = await this.users.findOneAsync(userId, {
            fields: this._options.defaultFieldSelector
          });
          callback({
            user,
            connection
          });
          return true;
        });
      }
      ///
      /// LOGIN METHODS
      ///

      // Login methods return to the client an object containing these
      // fields when the user was logged in successfully:
      //
      //   id: userId
      //   token: *
      //   tokenExpires: *
      //
      // tokenExpires is optional and intends to provide a hint to the
      // client as to when the token will expire. If not provided, the
      // client will call Accounts._tokenExpiration, passing it the date
      // that it received the token.
      //
      // The login method will throw an error back to the client if the user
      // failed to log in.
      //
      //
      // Login handlers and service specific login methods such as
      // `createUser` internally return a `result` object containing these
      // fields:
      //
      //   type:
      //     optional string; the service name, overrides the handler
      //     default if present.
      //
      //   error:
      //     exception; if the user is not allowed to login, the reason why.
      //
      //   userId:
      //     string; the user id of the user attempting to login (if
      //     known), required for an allowed login.
      //
      //   options:
      //     optional object merged into the result returned by the login
      //     method; used by HAMK from SRP.
      //
      //   stampedLoginToken:
      //     optional object with `token` and `when` indicating the login
      //     token is already present in the database, returned by the
      //     "resume" login handler.
      //
      // For convenience, login methods can also throw an exception, which
      // is converted into an {error} result.  However, if the id of the
      // user attempting the login is known, a {userId, error} result should
      // be returned instead since the user id is not captured when an
      // exception is thrown.
      //
      // This internal `result` object is automatically converted into the
      // public {id, token, tokenExpires} object returned to the client.

      // Try a login method, converting thrown exceptions into an {error}
      // result.  The `type` argument is a default, inserted into the result
      // object if not explicitly returned.
      //
      // Log in a user on a connection.
      //
      // We use the method invocation to set the user id on the connection,
      // not the connection object directly. setUserId is tied to methods to
      // enforce clear ordering of method application (using wait methods on
      // the client, and a no setUserId after unblock restriction on the
      // server)
      //
      // The `stampedLoginToken` parameter is optional.  When present, it
      // indicates that the login token has already been inserted into the
      // database and doesn't need to be inserted again.  (It's used by the
      // "resume" login handler).
      async _loginUser(methodInvocation, userId, stampedLoginToken) {
        if (!stampedLoginToken) {
          stampedLoginToken = this._generateStampedLoginToken();
          await this._insertLoginToken(userId, stampedLoginToken);
        }

        // This order (and the avoidance of yields) is important to make
        // sure that when publish functions are rerun, they see a
        // consistent view of the world: the userId is set and matches
        // the login token on the connection (not that there is
        // currently a public API for reading the login token on a
        // connection).
        Meteor._noYieldsAllowed(() => this._setLoginToken(userId, methodInvocation.connection, this._hashLoginToken(stampedLoginToken.token)));
        await methodInvocation.setUserId(userId);
        return {
          id: userId,
          token: stampedLoginToken.token,
          tokenExpires: this._tokenExpiration(stampedLoginToken.when)
        };
      }
      // After a login method has completed, call the login hooks.  Note
      // that `attemptLogin` is called for *all* login attempts, even ones
      // which aren't successful (such as an invalid password, etc).
      //
      // If the login is allowed and isn't aborted by a validate login hook
      // callback, log in the user.
      //
      async _attemptLogin(methodInvocation, methodName, methodArgs, result) {
        if (!result) throw new Error("result is required");

        // XXX A programming error in a login handler can lead to this occurring, and
        // then we don't call onLogin or onLoginFailure callbacks. Should
        // tryLoginMethod catch this case and turn it into an error?
        if (!result.userId && !result.error) throw new Error("A login method must specify a userId or an error");
        let user;
        if (result.userId) user = await this.users.findOneAsync(result.userId, {
          fields: this._options.defaultFieldSelector
        });
        const attempt = {
          type: result.type || "unknown",
          allowed: !!(result.userId && !result.error),
          methodName: methodName,
          methodArguments: Array.from(methodArgs)
        };
        if (result.error) {
          attempt.error = result.error;
        }
        if (user) {
          attempt.user = user;
        }

        // _validateLogin may mutate `attempt` by adding an error and changing allowed
        // to false, but that's the only change it can make (and the user's callbacks
        // only get a clone of `attempt`).
        await this._validateLogin(methodInvocation.connection, attempt);
        if (attempt.allowed) {
          const o = await this._loginUser(methodInvocation, result.userId, result.stampedLoginToken);
          const ret = _objectSpread(_objectSpread({}, o), result.options);
          ret.type = attempt.type;
          await this._successfulLogin(methodInvocation.connection, attempt);
          return ret;
        } else {
          await this._failedLogin(methodInvocation.connection, attempt);
          throw attempt.error;
        }
      }
      // All service specific login methods should go through this function.
      // Ensure that thrown exceptions are caught and that login hook
      // callbacks are still called.
      //
      async _loginMethod(methodInvocation, methodName, methodArgs, type, fn) {
        return await this._attemptLogin(methodInvocation, methodName, methodArgs, await tryLoginMethod(type, fn));
      }
      // Report a login attempt failed outside the context of a normal login
      // method. This is for use in the case where there is a multi-step login
      // procedure (eg SRP based password login). If a method early in the
      // chain fails, it should call this function to report a failure. There
      // is no corresponding method for a successful login; methods that can
      // succeed at logging a user in should always be actual login methods
      // (using either Accounts._loginMethod or Accounts.registerLoginHandler).
      async _reportLoginFailure(methodInvocation, methodName, methodArgs, result) {
        const attempt = {
          type: result.type || "unknown",
          allowed: false,
          error: result.error,
          methodName: methodName,
          methodArguments: Array.from(methodArgs)
        };
        if (result.userId) {
          attempt.user = this.users.findOneAsync(result.userId, {
            fields: this._options.defaultFieldSelector
          });
        }
        await this._validateLogin(methodInvocation.connection, attempt);
        await this._failedLogin(methodInvocation.connection, attempt);

        // _validateLogin may mutate attempt to set a new error message. Return
        // the modified version.
        return attempt;
      }
      ///
      /// LOGIN HANDLERS
      ///

      /**
       * @summary Registers a new login handler.
       * @locus Server
       * @param {String} [name] The type of login method like oauth, password, etc.
       * @param {Function} handler A function that receives an options object
       * (as passed as an argument to the `login` method) and returns one of
       * `undefined`, meaning don't handle or a login method result object.
       */
      registerLoginHandler(name, handler) {
        if (!handler) {
          handler = name;
          name = null;
        }
        this._loginHandlers.push({
          name: name,
          handler: Meteor.wrapFn(handler)
        });
      }
      // Checks a user's credentials against all the registered login
      // handlers, and returns a login token if the credentials are valid. It
      // is like the login method, except that it doesn't set the logged-in
      // user on the connection. Throws a Meteor.Error if logging in fails,
      // including the case where none of the login handlers handled the login
      // request. Otherwise, returns {id: userId, token: *, tokenExpires: *}.
      //
      // For example, if you want to login with a plaintext password, `options` could be
      //   { user: { username: <username> }, password: <password> }, or
      //   { user: { email: <email> }, password: <password> }.

      // Try all of the registered login handlers until one of them doesn't
      // return `undefined`, meaning it handled this call to `login`. Return
      // that return value.
      async _runLoginHandlers(methodInvocation, options) {
        for (let handler of this._loginHandlers) {
          const result = await tryLoginMethod(handler.name, async () => await handler.handler.call(methodInvocation, options));
          if (result) {
            return result;
          }
          if (result !== undefined) {
            throw new Meteor.Error(400, 'A login handler should return a result or undefined');
          }
        }
        return {
          type: null,
          error: new Meteor.Error(400, "Unrecognized options for login request")
        };
      }
      // Deletes the given loginToken from the database.
      //
      // For new-style hashed token, this will cause all connections
      // associated with the token to be closed.
      //
      // Any connections associated with old-style unhashed tokens will be
      // in the process of becoming associated with hashed tokens and then
      // they'll get closed.
      async destroyToken(userId, loginToken) {
        await this.users.updateAsync(userId, {
          $pull: {
            "services.resume.loginTokens": {
              $or: [{
                hashedToken: loginToken
              }, {
                token: loginToken
              }]
            }
          }
        });
      }
      _initServerMethods() {
        // The methods created in this function need to be created here so that
        // this variable is available in their scope.
        const accounts = this;

        // This object will be populated with methods and then passed to
        // accounts._server.methods further below.
        const methods = {};

        // @returns {Object|null}
        //   If successful, returns {token: reconnectToken, id: userId}
        //   If unsuccessful (for example, if the user closed the oauth login popup),
        //     throws an error describing the reason
        methods.login = async function (options) {
          // Login handlers should really also check whatever field they look at in
          // options, but we don't enforce it.
          check(options, Object);
          const result = await accounts._runLoginHandlers(this, options);
          //console.log({result});

          return await accounts._attemptLogin(this, "login", arguments, result);
        };
        methods.logout = async function () {
          const token = accounts._getLoginToken(this.connection.id);
          accounts._setLoginToken(this.userId, this.connection, null);
          if (token && this.userId) {
            await accounts.destroyToken(this.userId, token);
          }
          await accounts._successfulLogout(this.connection, this.userId);
          await this.setUserId(null);
        };

        // Generates a new login token with the same expiration as the
        // connection's current token and saves it to the database. Associates
        // the connection with this new token and returns it. Throws an error
        // if called on a connection that isn't logged in.
        //
        // @returns Object
        //   If successful, returns { token: <new token>, id: <user id>,
        //   tokenExpires: <expiration date> }.
        methods.getNewToken = async function () {
          const user = await accounts.users.findOneAsync(this.userId, {
            fields: {
              "services.resume.loginTokens": 1
            }
          });
          if (!this.userId || !user) {
            throw new Meteor.Error("You are not logged in.");
          }
          // Be careful not to generate a new token that has a later
          // expiration than the curren token. Otherwise, a bad guy with a
          // stolen token could use this method to stop his stolen token from
          // ever expiring.
          const currentHashedToken = accounts._getLoginToken(this.connection.id);
          const currentStampedToken = user.services.resume.loginTokens.find(stampedToken => stampedToken.hashedToken === currentHashedToken);
          if (!currentStampedToken) {
            // safety belt: this should never happen
            throw new Meteor.Error("Invalid login token");
          }
          const newStampedToken = accounts._generateStampedLoginToken();
          newStampedToken.when = currentStampedToken.when;
          await accounts._insertLoginToken(this.userId, newStampedToken);
          return await accounts._loginUser(this, this.userId, newStampedToken);
        };

        // Removes all tokens except the token associated with the current
        // connection. Throws an error if the connection is not logged
        // in. Returns nothing on success.
        methods.removeOtherTokens = async function () {
          if (!this.userId) {
            throw new Meteor.Error("You are not logged in.");
          }
          const currentToken = accounts._getLoginToken(this.connection.id);
          await accounts.users.updateAsync(this.userId, {
            $pull: {
              "services.resume.loginTokens": {
                hashedToken: {
                  $ne: currentToken
                }
              }
            }
          });
        };

        // Allow a one-time configuration for a login service. Modifications
        // to this collection are also allowed in insecure mode.
        methods.configureLoginService = async options => {
          check(options, Match.ObjectIncluding({
            service: String
          }));
          // Don't let random users configure a service we haven't added yet (so
          // that when we do later add it, it's set up with their configuration
          // instead of ours).
          // XXX if service configuration is oauth-specific then this code should
          //     be in accounts-oauth; if it's not then the registry should be
          //     in this package
          if (!(accounts.oauth && accounts.oauth.serviceNames().includes(options.service))) {
            throw new Meteor.Error(403, "Service unknown");
          }
          if (Package['service-configuration']) {
            const {
              ServiceConfiguration
            } = Package['service-configuration'];
            const service = await ServiceConfiguration.configurations.findOneAsync({
              service: options.service
            });
            if (service) throw new Meteor.Error(403, "Service ".concat(options.service, " already configured"));
            if (Package["oauth-encryption"]) {
              const {
                OAuthEncryption
              } = Package["oauth-encryption"];
              if (hasOwn.call(options, 'secret') && OAuthEncryption.keyIsLoaded()) options.secret = OAuthEncryption.seal(options.secret);
            }
            await ServiceConfiguration.configurations.insertAsync(options);
          }
        };
        accounts._server.methods(methods);
      }
      _initAccountDataHooks() {
        this._server.onConnection(connection => {
          this._accountData[connection.id] = {
            connection: connection
          };
          connection.onClose(() => {
            this._removeTokenFromConnection(connection.id);
            delete this._accountData[connection.id];
          });
        });
      }
      _initServerPublications() {
        // Bring into lexical scope for publish callbacks that need `this`
        const {
          users,
          _autopublishFields,
          _defaultPublishFields
        } = this;

        // Publish all login service configuration fields other than secret.
        this._server.publish("meteor.loginServiceConfiguration", function () {
          if (Package['service-configuration']) {
            const {
              ServiceConfiguration
            } = Package['service-configuration'];
            return ServiceConfiguration.configurations.find({}, {
              fields: {
                secret: 0
              }
            });
          }
          this.ready();
        }, {
          is_auto: true
        }); // not technically autopublish, but stops the warning.

        // Use Meteor.startup to give other packages a chance to call
        // setDefaultPublishFields.
        Meteor.startup(() => {
          // Merge custom fields selector and default publish fields so that the client
          // gets all the necessary fields to run properly
          const customFields = this._addDefaultFieldSelector().fields || {};
          const keys = Object.keys(customFields);
          // If the custom fields are negative, then ignore them and only send the necessary fields
          const fields = keys.length > 0 && customFields[keys[0]] ? _objectSpread(_objectSpread({}, this._addDefaultFieldSelector().fields), _defaultPublishFields.projection) : _defaultPublishFields.projection;
          // Publish the current user's record to the client.
          this._server.publish(null, function () {
            if (this.userId) {
              return users.find({
                _id: this.userId
              }, {
                fields
              });
            } else {
              return null;
            }
          }, /*suppress autopublish warning*/{
            is_auto: true
          });
        });

        // Use Meteor.startup to give other packages a chance to call
        // addAutopublishFields.
        Package.autopublish && Meteor.startup(() => {
          // ['profile', 'username'] -> {profile: 1, username: 1}
          const toFieldSelector = fields => fields.reduce((prev, field) => _objectSpread(_objectSpread({}, prev), {}, {
            [field]: 1
          }), {});
          this._server.publish(null, function () {
            if (this.userId) {
              return users.find({
                _id: this.userId
              }, {
                fields: toFieldSelector(_autopublishFields.loggedInUser)
              });
            } else {
              return null;
            }
          }, /*suppress autopublish warning*/{
            is_auto: true
          });

          // XXX this publish is neither dedup-able nor is it optimized by our special
          // treatment of queries on a specific _id. Therefore this will have O(n^2)
          // run-time performance every time a user document is changed (eg someone
          // logging in). If this is a problem, we can instead write a manual publish
          // function which filters out fields based on 'this.userId'.
          this._server.publish(null, function () {
            const selector = this.userId ? {
              _id: {
                $ne: this.userId
              }
            } : {};
            return users.find(selector, {
              fields: toFieldSelector(_autopublishFields.otherUsers)
            });
          }, /*suppress autopublish warning*/{
            is_auto: true
          });
        });
      }
      // Add to the list of fields or subfields to be automatically
      // published if autopublish is on. Must be called from top-level
      // code (ie, before Meteor.startup hooks run).
      //
      // @param opts {Object} with:
      //   - forLoggedInUser {Array} Array of fields published to the logged-in user
      //   - forOtherUsers {Array} Array of fields published to users that aren't logged in
      addAutopublishFields(opts) {
        this._autopublishFields.loggedInUser.push.apply(this._autopublishFields.loggedInUser, opts.forLoggedInUser);
        this._autopublishFields.otherUsers.push.apply(this._autopublishFields.otherUsers, opts.forOtherUsers);
      }
      // Replaces the fields to be automatically
      // published when the user logs in
      //
      // @param {MongoFieldSpecifier} fields Dictionary of fields to return or exclude.
      setDefaultPublishFields(fields) {
        this._defaultPublishFields.projection = fields;
      }
      ///
      /// ACCOUNT DATA
      ///

      // HACK: This is used by 'meteor-accounts' to get the loginToken for a
      // connection. Maybe there should be a public way to do that.
      _getAccountData(connectionId, field) {
        const data = this._accountData[connectionId];
        return data && data[field];
      }
      _setAccountData(connectionId, field, value) {
        const data = this._accountData[connectionId];

        // safety belt. shouldn't happen. accountData is set in onConnection,
        // we don't have a connectionId until it is set.
        if (!data) return;
        if (value === undefined) delete data[field];else data[field] = value;
      }
      ///
      /// RECONNECT TOKENS
      ///
      /// support reconnecting using a meteor login token

      _hashLoginToken(loginToken) {
        const hash = crypto.createHash('sha256');
        hash.update(loginToken);
        return hash.digest('base64');
      }
      // {token, when} => {hashedToken, when}
      _hashStampedToken(stampedToken) {
        const {
            token
          } = stampedToken,
          hashedStampedToken = _objectWithoutProperties(stampedToken, _excluded);
        return _objectSpread(_objectSpread({}, hashedStampedToken), {}, {
          hashedToken: this._hashLoginToken(token)
        });
      }
      // Using $addToSet avoids getting an index error if another client
      // logging in simultaneously has already inserted the new hashed
      // token.
      async _insertHashedLoginToken(userId, hashedToken, query) {
        query = query ? _objectSpread({}, query) : {};
        query._id = userId;
        await this.users.updateAsync(query, {
          $addToSet: {
            "services.resume.loginTokens": hashedToken
          }
        });
      }
      // Exported for tests.
      async _insertLoginToken(userId, stampedToken, query) {
        await this._insertHashedLoginToken(userId, this._hashStampedToken(stampedToken), query);
      }
      /**
       *
       * @param userId
       * @private
       * @returns {Promise<void>}
       */
      _clearAllLoginTokens(userId) {
        this.users.updateAsync(userId, {
          $set: {
            'services.resume.loginTokens': []
          }
        });
      }
      // test hook
      _getUserObserve(connectionId) {
        return this._userObservesForConnections[connectionId];
      }
      // Clean up this connection's association with the token: that is, stop
      // the observe that we started when we associated the connection with
      // this token.
      _removeTokenFromConnection(connectionId) {
        if (hasOwn.call(this._userObservesForConnections, connectionId)) {
          const observe = this._userObservesForConnections[connectionId];
          if (typeof observe === 'number') {
            // We're in the process of setting up an observe for this connection. We
            // can't clean up that observe yet, but if we delete the placeholder for
            // this connection, then the observe will get cleaned up as soon as it has
            // been set up.
            delete this._userObservesForConnections[connectionId];
          } else {
            delete this._userObservesForConnections[connectionId];
            observe.stop();
          }
        }
      }
      _getLoginToken(connectionId) {
        return this._getAccountData(connectionId, 'loginToken');
      }
      // newToken is a hashed token.
      _setLoginToken(userId, connection, newToken) {
        this._removeTokenFromConnection(connection.id);
        this._setAccountData(connection.id, 'loginToken', newToken);
        if (newToken) {
          // Set up an observe for this token. If the token goes away, we need
          // to close the connection.  We defer the observe because there's
          // no need for it to be on the critical path for login; we just need
          // to ensure that the connection will get closed at some point if
          // the token gets deleted.
          //
          // Initially, we set the observe for this connection to a number; this
          // signifies to other code (which might run while we yield) that we are in
          // the process of setting up an observe for this connection. Once the
          // observe is ready to go, we replace the number with the real observe
          // handle (unless the placeholder has been deleted or replaced by a
          // different placehold number, signifying that the connection was closed
          // already -- in this case we just clean up the observe that we started).
          const myObserveNumber = ++this._nextUserObserveNumber;
          this._userObservesForConnections[connection.id] = myObserveNumber;
          Meteor.defer(async () => {
            // If something else happened on this connection in the meantime (it got
            // closed, or another call to _setLoginToken happened), just do
            // nothing. We don't need to start an observe for an old connection or old
            // token.
            if (this._userObservesForConnections[connection.id] !== myObserveNumber) {
              return;
            }
            let foundMatchingUser;
            // Because we upgrade unhashed login tokens to hashed tokens at
            // login time, sessions will only be logged in with a hashed
            // token. Thus we only need to observe hashed tokens here.
            const observe = await this.users.find({
              _id: userId,
              'services.resume.loginTokens.hashedToken': newToken
            }, {
              fields: {
                _id: 1
              }
            }).observeChanges({
              added: () => {
                foundMatchingUser = true;
              },
              removed: connection.close
              // The onClose callback for the connection takes care of
              // cleaning up the observe handle and any other state we have
              // lying around.
            }, {
              nonMutatingCallbacks: true
            });

            // If the user ran another login or logout command we were waiting for the
            // defer or added to fire (ie, another call to _setLoginToken occurred),
            // then we let the later one win (start an observe, etc) and just stop our
            // observe now.
            //
            // Similarly, if the connection was already closed, then the onClose
            // callback would have called _removeTokenFromConnection and there won't
            // be an entry in _userObservesForConnections. We can stop the observe.
            if (this._userObservesForConnections[connection.id] !== myObserveNumber) {
              observe.stop();
              return;
            }
            this._userObservesForConnections[connection.id] = observe;
            if (!foundMatchingUser) {
              // We've set up an observe on the user associated with `newToken`,
              // so if the new token is removed from the database, we'll close
              // the connection. But the token might have already been deleted
              // before we set up the observe, which wouldn't have closed the
              // connection because the observe wasn't running yet.
              connection.close();
            }
          });
        }
      }
      // (Also used by Meteor Accounts server and tests).
      //
      _generateStampedLoginToken() {
        return {
          token: Random.secret(),
          when: new Date()
        };
      }
      ///
      /// TOKEN EXPIRATION
      ///

      // Deletes expired password reset tokens from the database.
      //
      // Exported for tests. Also, the arguments are only used by
      // tests. oldestValidDate is simulate expiring tokens without waiting
      // for them to actually expire. userId is used by tests to only expire
      // tokens for the test user.
      async _expirePasswordResetTokens(oldestValidDate, userId) {
        const tokenLifetimeMs = this._getPasswordResetTokenLifetimeMs();

        // when calling from a test with extra arguments, you must specify both!
        if (oldestValidDate && !userId || !oldestValidDate && userId) {
          throw new Error("Bad test. Must specify both oldestValidDate and userId.");
        }
        oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);
        const tokenFilter = {
          $or: [{
            "services.password.reset.reason": "reset"
          }, {
            "services.password.reset.reason": {
              $exists: false
            }
          }]
        };
        await expirePasswordToken(this, oldestValidDate, tokenFilter, userId);
      }

      // Deletes expired password enroll tokens from the database.
      //
      // Exported for tests. Also, the arguments are only used by
      // tests. oldestValidDate is simulate expiring tokens without waiting
      // for them to actually expire. userId is used by tests to only expire
      // tokens for the test user.
      async _expirePasswordEnrollTokens(oldestValidDate, userId) {
        const tokenLifetimeMs = this._getPasswordEnrollTokenLifetimeMs();

        // when calling from a test with extra arguments, you must specify both!
        if (oldestValidDate && !userId || !oldestValidDate && userId) {
          throw new Error("Bad test. Must specify both oldestValidDate and userId.");
        }
        oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);
        const tokenFilter = {
          "services.password.enroll.reason": "enroll"
        };
        await expirePasswordToken(this, oldestValidDate, tokenFilter, userId);
      }

      // Deletes expired tokens from the database and closes all open connections
      // associated with these tokens.
      //
      // Exported for tests. Also, the arguments are only used by
      // tests. oldestValidDate is simulate expiring tokens without waiting
      // for them to actually expire. userId is used by tests to only expire
      // tokens for the test user.
      /**
       *
       * @param oldestValidDate
       * @param userId
       * @private
       * @return {Promise<void>}
       */
      async _expireTokens(oldestValidDate, userId) {
        const tokenLifetimeMs = this._getTokenLifetimeMs();

        // when calling from a test with extra arguments, you must specify both!
        if (oldestValidDate && !userId || !oldestValidDate && userId) {
          throw new Error("Bad test. Must specify both oldestValidDate and userId.");
        }
        oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);
        const userFilter = userId ? {
          _id: userId
        } : {};

        // Backwards compatible with older versions of meteor that stored login token
        // timestamps as numbers.
        await this.users.updateAsync(_objectSpread(_objectSpread({}, userFilter), {}, {
          $or: [{
            "services.resume.loginTokens.when": {
              $lt: oldestValidDate
            }
          }, {
            "services.resume.loginTokens.when": {
              $lt: +oldestValidDate
            }
          }]
        }), {
          $pull: {
            "services.resume.loginTokens": {
              $or: [{
                when: {
                  $lt: oldestValidDate
                }
              }, {
                when: {
                  $lt: +oldestValidDate
                }
              }]
            }
          }
        }, {
          multi: true
        });
        // The observe on Meteor.users will take care of closing connections for
        // expired tokens.
      }
      // @override from accounts_common.js
      config(options) {
        // Call the overridden implementation of the method.
        const superResult = AccountsCommon.prototype.config.apply(this, arguments);

        // If the user set loginExpirationInDays to null, then we need to clear the
        // timer that periodically expires tokens.
        if (hasOwn.call(this._options, 'loginExpirationInDays') && this._options.loginExpirationInDays === null && this.expireTokenInterval) {
          Meteor.clearInterval(this.expireTokenInterval);
          this.expireTokenInterval = null;
        }
        return superResult;
      }
      // Called by accounts-password
      async insertUserDoc(options, user) {
        // - clone user document, to protect from modification
        // - add createdAt timestamp
        // - prepare an _id, so that you can modify other collections (eg
        // create a first task for every new user)
        //
        // XXX If the onCreateUser or validateNewUser hooks fail, we might
        // end up having modified some other collection
        // inappropriately. The solution is probably to have onCreateUser
        // accept two callbacks - one that gets called before inserting
        // the user document (in which you can modify its contents), and
        // one that gets called after (in which you should change other
        // collections)
        user = _objectSpread({
          createdAt: new Date(),
          _id: Random.id()
        }, user);
        if (user.services) {
          Object.keys(user.services).forEach(service => pinEncryptedFieldsToUser(user.services[service], user._id));
        }
        let fullUser;
        if (this._onCreateUserHook) {
          // Allows _onCreateUserHook to be a promise returning func
          fullUser = await this._onCreateUserHook(options, user);

          // This is *not* part of the API. We need this because we can't isolate
          // the global server environment between tests, meaning we can't test
          // both having a create user hook set and not having one set.
          if (fullUser === 'TEST DEFAULT HOOK') fullUser = defaultCreateUserHook(options, user);
        } else {
          fullUser = defaultCreateUserHook(options, user);
        }
        var _iteratorAbruptCompletion = false;
        var _didIteratorError = false;
        var _iteratorError;
        try {
          for (var _iterator = _asyncIterator(this._validateNewUserHooks), _step; _iteratorAbruptCompletion = !(_step = await _iterator.next()).done; _iteratorAbruptCompletion = false) {
            const hook = _step.value;
            {
              if (!(await hook(fullUser))) throw new Meteor.Error(403, "User validation failed");
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
        let userId;
        try {
          userId = await this.users.insertAsync(fullUser);
        } catch (e) {
          // XXX string parsing sucks, maybe
          // https://jira.mongodb.org/browse/SERVER-3069 will get fixed one day
          // https://jira.mongodb.org/browse/SERVER-4637
          if (!e.errmsg) throw e;
          if (e.errmsg.includes('emails.address')) throw new Meteor.Error(403, "Email already exists.");
          if (e.errmsg.includes('username')) throw new Meteor.Error(403, "Username already exists.");
          throw e;
        }
        return userId;
      }
      // Helper function: returns false if email does not match company domain from
      // the configuration.
      _testEmailDomain(email) {
        const domain = this._options.restrictCreationByEmailDomain;
        return !domain || typeof domain === 'function' && domain(email) || typeof domain === 'string' && new RegExp("@".concat(Meteor._escapeRegExp(domain), "$"), 'i').test(email);
      }
      ///
      /// CLEAN UP FOR `logoutOtherClients`
      ///

      async _deleteSavedTokensForUser(userId, tokensToDelete) {
        if (tokensToDelete) {
          await this.users.updateAsync(userId, {
            $unset: {
              "services.resume.haveLoginTokensToDelete": 1,
              "services.resume.loginTokensToDelete": 1
            },
            $pullAll: {
              "services.resume.loginTokens": tokensToDelete
            }
          });
        }
      }
      _deleteSavedTokensForAllUsersOnStartup() {
        // If we find users who have saved tokens to delete on startup, delete
        // them now. It's possible that the server could have crashed and come
        // back up before new tokens are found in localStorage, but this
        // shouldn't happen very often. We shouldn't put a delay here because
        // that would give a lot of power to an attacker with a stolen login
        // token and the ability to crash the server.
        Meteor.startup(async () => {
          const users = await this.users.find({
            "services.resume.haveLoginTokensToDelete": true
          }, {
            fields: {
              "services.resume.loginTokensToDelete": 1
            }
          });
          users.forEach(user => {
            this._deleteSavedTokensForUser(user._id, user.services.resume.loginTokensToDelete)
            // We don't need to wait for this to complete.
            .then(_ => _).catch(err => {
              console.log(err);
            });
          });
        });
      }
      ///
      /// MANAGING USER OBJECTS
      ///

      // Updates or creates a user after we authenticate with a 3rd party.
      //
      // @param serviceName {String} Service name (eg, twitter).
      // @param serviceData {Object} Data to store in the user's record
      //        under services[serviceName]. Must include an "id" field
      //        which is a unique identifier for the user in the service.
      // @param options {Object, optional} Other options to pass to insertUserDoc
      //        (eg, profile)
      // @returns {Object} Object with token and id keys, like the result
      //        of the "login" method.
      //
      async updateOrCreateUserFromExternalService(serviceName, serviceData, options) {
        options = _objectSpread({}, options);
        if (serviceName === "password" || serviceName === "resume") {
          throw new Error("Can't use updateOrCreateUserFromExternalService with internal service " + serviceName);
        }
        if (!hasOwn.call(serviceData, 'id')) {
          throw new Error("Service data for service ".concat(serviceName, " must include id"));
        }

        // Look for a user with the appropriate service user id.
        const selector = {};
        const serviceIdKey = "services.".concat(serviceName, ".id");

        // XXX Temporary special case for Twitter. (Issue #629)
        //   The serviceData.id will be a string representation of an integer.
        //   We want it to match either a stored string or int representation.
        //   This is to cater to earlier versions of Meteor storing twitter
        //   user IDs in number form, and recent versions storing them as strings.
        //   This can be removed once migration technology is in place, and twitter
        //   users stored with integer IDs have been migrated to string IDs.
        if (serviceName === "twitter" && !isNaN(serviceData.id)) {
          selector["$or"] = [{}, {}];
          selector["$or"][0][serviceIdKey] = serviceData.id;
          selector["$or"][1][serviceIdKey] = parseInt(serviceData.id, 10);
        } else {
          selector[serviceIdKey] = serviceData.id;
        }
        let user = await this.users.findOneAsync(selector, {
          fields: this._options.defaultFieldSelector
        });
        // Check to see if the developer has a custom way to find the user outside
        // of the general selectors above.
        if (!user && this._additionalFindUserOnExternalLogin) {
          user = await this._additionalFindUserOnExternalLogin({
            serviceName,
            serviceData,
            options
          });
        }

        // Before continuing, run user hook to see if we should continue
        if (this._beforeExternalLoginHook && !(await this._beforeExternalLoginHook(serviceName, serviceData, user))) {
          throw new Meteor.Error(403, "Login forbidden");
        }

        // When creating a new user we pass through all options. When updating an
        // existing user, by default we only process/pass through the serviceData
        // (eg, so that we keep an unexpired access token and don't cache old email
        // addresses in serviceData.email). The onExternalLogin hook can be used when
        // creating or updating a user, to modify or pass through more options as
        // needed.
        let opts = user ? {} : options;
        if (this._onExternalLoginHook) {
          opts = await this._onExternalLoginHook(options, user);
        }
        if (user) {
          await pinEncryptedFieldsToUser(serviceData, user._id);
          let setAttrs = {};
          Object.keys(serviceData).forEach(key => setAttrs["services.".concat(serviceName, ".").concat(key)] = serviceData[key]);

          // XXX Maybe we should re-use the selector above and notice if the update
          //     touches nothing?
          setAttrs = _objectSpread(_objectSpread({}, setAttrs), opts);
          await this.users.updateAsync(user._id, {
            $set: setAttrs
          });
          return {
            type: serviceName,
            userId: user._id
          };
        } else {
          // Create a new user with the service data.
          user = {
            services: {}
          };
          user.services[serviceName] = serviceData;
          const userId = await this.insertUserDoc(opts, user);
          return {
            type: serviceName,
            userId
          };
        }
      }
      /**
       * @summary Removes default rate limiting rule
       * @locus Server
       * @importFromPackage accounts-base
       */
      removeDefaultRateLimit() {
        const resp = DDPRateLimiter.removeRule(this.defaultRateLimiterRuleId);
        this.defaultRateLimiterRuleId = null;
        return resp;
      }
      /**
       * @summary Add a default rule of limiting logins, creating new users and password reset
       * to 5 times every 10 seconds per connection.
       * @locus Server
       * @importFromPackage accounts-base
       */
      addDefaultRateLimit() {
        if (!this.defaultRateLimiterRuleId) {
          this.defaultRateLimiterRuleId = DDPRateLimiter.addRule({
            userId: null,
            clientAddress: null,
            type: 'method',
            name: name => ['login', 'createUser', 'resetPassword', 'forgotPassword'].includes(name),
            connectionId: connectionId => true
          }, 5, 10000);
        }
      }
      /**
       * @summary Creates options for email sending for reset password and enroll account emails.
       * You can use this function when customizing a reset password or enroll account email sending.
       * @locus Server
       * @param {Object} email Which address of the user's to send the email to.
       * @param {Object} user The user object to generate options for.
       * @param {String} url URL to which user is directed to confirm the email.
       * @param {String} reason `resetPassword` or `enrollAccount`.
       * @returns {Object} Options which can be passed to `Email.send`.
       * @importFromPackage accounts-base
       */
      async generateOptionsForEmail(email, user, url, reason) {
        let extra = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
        const options = {
          to: email,
          from: this.emailTemplates[reason].from ? await this.emailTemplates[reason].from(user) : this.emailTemplates.from,
          subject: await this.emailTemplates[reason].subject(user, url, extra)
        };
        if (typeof this.emailTemplates[reason].text === 'function') {
          options.text = await this.emailTemplates[reason].text(user, url, extra);
        }
        if (typeof this.emailTemplates[reason].html === 'function') {
          options.html = await this.emailTemplates[reason].html(user, url, extra);
        }
        if (typeof this.emailTemplates.headers === 'object') {
          options.headers = this.emailTemplates.headers;
        }
        return options;
      }
      async _checkForCaseInsensitiveDuplicates(fieldName, displayName, fieldValue, ownUserId) {
        // Some tests need the ability to add users with the same case insensitive
        // value, hence the _skipCaseInsensitiveChecksForTest check
        const skipCheck = Object.prototype.hasOwnProperty.call(this._skipCaseInsensitiveChecksForTest, fieldValue);
        if (fieldValue && !skipCheck) {
          const matchedUsers = await Meteor.users.find(this._selectorForFastCaseInsensitiveLookup(fieldName, fieldValue), {
            fields: {
              _id: 1
            },
            // we only need a maximum of 2 users for the logic below to work
            limit: 2
          }).fetchAsync();
          if (matchedUsers.length > 0 && (
          // If we don't have a userId yet, any match we find is a duplicate
          !ownUserId ||
          // Otherwise, check to see if there are multiple matches or a match
          // that is not us
          matchedUsers.length > 1 || matchedUsers[0]._id !== ownUserId)) {
            this._handleError("".concat(displayName, " already exists."));
          }
        }
      }
      async _createUserCheckingDuplicates(_ref) {
        let {
          user,
          email,
          username,
          options
        } = _ref;
        const newUser = _objectSpread(_objectSpread(_objectSpread({}, user), username ? {
          username
        } : {}), email ? {
          emails: [{
            address: email,
            verified: false
          }]
        } : {});

        // Perform a case insensitive check before insert
        await this._checkForCaseInsensitiveDuplicates('username', 'Username', username);
        await this._checkForCaseInsensitiveDuplicates('emails.address', 'Email', email);
        const userId = await this.insertUserDoc(options, newUser);
        // Perform another check after insert, in case a matching user has been
        // inserted in the meantime
        try {
          await this._checkForCaseInsensitiveDuplicates('username', 'Username', username, userId);
          await this._checkForCaseInsensitiveDuplicates('emails.address', 'Email', email, userId);
        } catch (ex) {
          // Remove inserted user if the check fails
          await Meteor.users.removeAsync(userId);
          throw ex;
        }
        return userId;
      }
    }
    // Give each login hook callback a fresh cloned copy of the attempt
    // object, but don't clone the connection.
    //
    const cloneAttemptWithConnection = (connection, attempt) => {
      const clonedAttempt = EJSON.clone(attempt);
      clonedAttempt.connection = connection;
      return clonedAttempt;
    };
    const tryLoginMethod = async (type, fn) => {
      let result;
      try {
        result = await fn();
      } catch (e) {
        result = {
          error: e
        };
      }
      if (result && !result.type && type) result.type = type;
      return result;
    };
    const setupDefaultLoginHandlers = accounts => {
      accounts.registerLoginHandler("resume", function (options) {
        return defaultResumeLoginHandler.call(this, accounts, options);
      });
    };

    // Login handler for resume tokens.
    const defaultResumeLoginHandler = async (accounts, options) => {
      if (!options.resume) return undefined;
      check(options.resume, String);
      const hashedToken = accounts._hashLoginToken(options.resume);

      // First look for just the new-style hashed login token, to avoid
      // sending the unhashed token to the database in a query if we don't
      // need to.
      let user = await accounts.users.findOneAsync({
        "services.resume.loginTokens.hashedToken": hashedToken
      }, {
        fields: {
          "services.resume.loginTokens.$": 1
        }
      });
      if (!user) {
        // If we didn't find the hashed login token, try also looking for
        // the old-style unhashed token.  But we need to look for either
        // the old-style token OR the new-style token, because another
        // client connection logging in simultaneously might have already
        // converted the token.
        user = await accounts.users.findOneAsync({
          $or: [{
            "services.resume.loginTokens.hashedToken": hashedToken
          }, {
            "services.resume.loginTokens.token": options.resume
          }]
        },
        // Note: Cannot use ...loginTokens.$ positional operator with $or query.
        {
          fields: {
            "services.resume.loginTokens": 1
          }
        });
      }
      if (!user) return {
        error: new Meteor.Error(403, "You've been logged out by the server. Please log in again.")
      };

      // Find the token, which will either be an object with fields
      // {hashedToken, when} for a hashed token or {token, when} for an
      // unhashed token.
      let oldUnhashedStyleToken;
      let token = await user.services.resume.loginTokens.find(token => token.hashedToken === hashedToken);
      if (token) {
        oldUnhashedStyleToken = false;
      } else {
        token = await user.services.resume.loginTokens.find(token => token.token === options.resume);
        oldUnhashedStyleToken = true;
      }
      const tokenExpires = accounts._tokenExpiration(token.when);
      if (new Date() >= tokenExpires) return {
        userId: user._id,
        error: new Meteor.Error(403, "Your session has expired. Please log in again.")
      };

      // Update to a hashed token when an unhashed token is encountered.
      if (oldUnhashedStyleToken) {
        // Only add the new hashed token if the old unhashed token still
        // exists (this avoids resurrecting the token if it was deleted
        // after we read it).  Using $addToSet avoids getting an index
        // error if another client logging in simultaneously has already
        // inserted the new hashed token.
        await accounts.users.updateAsync({
          _id: user._id,
          "services.resume.loginTokens.token": options.resume
        }, {
          $addToSet: {
            "services.resume.loginTokens": {
              "hashedToken": hashedToken,
              "when": token.when
            }
          }
        });

        // Remove the old token *after* adding the new, since otherwise
        // another client trying to login between our removing the old and
        // adding the new wouldn't find a token to login with.
        await accounts.users.updateAsync(user._id, {
          $pull: {
            "services.resume.loginTokens": {
              "token": options.resume
            }
          }
        });
      }
      return {
        userId: user._id,
        stampedLoginToken: {
          token: options.resume,
          when: token.when
        }
      };
    };
    const expirePasswordToken = async (accounts, oldestValidDate, tokenFilter, userId) => {
      // boolean value used to determine if this method was called from enroll account workflow
      let isEnroll = false;
      const userFilter = userId ? {
        _id: userId
      } : {};
      // check if this method was called from enroll account workflow
      if (tokenFilter['services.password.enroll.reason']) {
        isEnroll = true;
      }
      let resetRangeOr = {
        $or: [{
          "services.password.reset.when": {
            $lt: oldestValidDate
          }
        }, {
          "services.password.reset.when": {
            $lt: +oldestValidDate
          }
        }]
      };
      if (isEnroll) {
        resetRangeOr = {
          $or: [{
            "services.password.enroll.when": {
              $lt: oldestValidDate
            }
          }, {
            "services.password.enroll.when": {
              $lt: +oldestValidDate
            }
          }]
        };
      }
      const expireFilter = {
        $and: [tokenFilter, resetRangeOr]
      };
      if (isEnroll) {
        await accounts.users.updateAsync(_objectSpread(_objectSpread({}, userFilter), expireFilter), {
          $unset: {
            "services.password.enroll": ""
          }
        }, {
          multi: true
        });
      } else {
        await accounts.users.updateAsync(_objectSpread(_objectSpread({}, userFilter), expireFilter), {
          $unset: {
            "services.password.reset": ""
          }
        }, {
          multi: true
        });
      }
    };
    const setExpireTokensInterval = accounts => {
      accounts.expireTokenInterval = Meteor.setInterval(async () => {
        await accounts._expireTokens();
        await accounts._expirePasswordResetTokens();
        await accounts._expirePasswordEnrollTokens();
      }, EXPIRE_TOKENS_INTERVAL_MS);
    };
    const OAuthEncryption = (_Package$oauthEncryp = Package["oauth-encryption"]) === null || _Package$oauthEncryp === void 0 ? void 0 : _Package$oauthEncryp.OAuthEncryption;

    // OAuth service data is temporarily stored in the pending credentials
    // collection during the oauth authentication process.  Sensitive data
    // such as access tokens are encrypted without the user id because
    // we don't know the user id yet.  We re-encrypt these fields with the
    // user id included when storing the service data permanently in
    // the users collection.
    //
    const pinEncryptedFieldsToUser = (serviceData, userId) => {
      Object.keys(serviceData).forEach(key => {
        let value = serviceData[key];
        if (OAuthEncryption !== null && OAuthEncryption !== void 0 && OAuthEncryption.isSealed(value)) value = OAuthEncryption.seal(OAuthEncryption.open(value), userId);
        serviceData[key] = value;
      });
    };

    // XXX see comment on Accounts.createUser in passwords_server about adding a
    // second "server options" argument.
    const defaultCreateUserHook = (options, user) => {
      if (options.profile) user.profile = options.profile;
      return user;
    };

    // Validate new user's email or Google/Facebook/GitHub account's email
    function defaultValidateNewUserHook(user) {
      const domain = this._options.restrictCreationByEmailDomain;
      if (!domain) {
        return true;
      }
      let emailIsGood = false;
      if (user.emails && user.emails.length > 0) {
        emailIsGood = user.emails.reduce((prev, email) => prev || this._testEmailDomain(email.address), false);
      } else if (user.services && Object.values(user.services).length > 0) {
        // Find any email of any service and check it
        emailIsGood = Object.values(user.services).reduce((prev, service) => service.email && this._testEmailDomain(service.email), false);
      }
      if (emailIsGood) {
        return true;
      }
      if (typeof domain === 'string') {
        throw new Meteor.Error(403, "@".concat(domain, " email required"));
      } else {
        throw new Meteor.Error(403, "Email doesn't match the criteria.");
      }
    }
    const setupUsersCollection = async users => {
      ///
      /// RESTRICTING WRITES TO USER OBJECTS
      ///
      users.allow({
        // clients can modify the profile field of their own document, and
        // nothing else.
        update: (userId, user, fields, modifier) => {
          // make sure it is our record
          if (user._id !== userId) {
            return false;
          }

          // user can only modify the 'profile' field. sets to multiple
          // sub-keys (eg profile.foo and profile.bar) are merged into entry
          // in the fields list.
          if (fields.length !== 1 || fields[0] !== 'profile') {
            return false;
          }
          return true;
        },
        fetch: ['_id'] // we only look at _id.
      });

      /// DEFAULT INDEXES ON USERS
      await users.createIndexAsync('username', {
        unique: true,
        sparse: true
      });
      await users.createIndexAsync('emails.address', {
        unique: true,
        sparse: true
      });
      await users.createIndexAsync('services.resume.loginTokens.hashedToken', {
        unique: true,
        sparse: true
      });
      await users.createIndexAsync('services.resume.loginTokens.token', {
        unique: true,
        sparse: true
      });
      // For taking care of logoutOtherClients calls that crashed before the
      // tokens were deleted.
      await users.createIndexAsync('services.resume.haveLoginTokensToDelete', {
        sparse: true
      });
      // For expiring login tokens
      await users.createIndexAsync("services.resume.loginTokens.when", {
        sparse: true
      });
      // For expiring password tokens
      await users.createIndexAsync('services.password.reset.when', {
        sparse: true
      });
      await users.createIndexAsync('services.password.enroll.when', {
        sparse: true
      });
    };

    // Generates permutations of all case variations of a given string.
    const generateCasePermutationsForString = string => {
      let permutations = [''];
      for (let i = 0; i < string.length; i++) {
        const ch = string.charAt(i);
        permutations = [].concat(...permutations.map(prefix => {
          const lowerCaseChar = ch.toLowerCase();
          const upperCaseChar = ch.toUpperCase();
          // Don't add unnecessary permutations when ch is not a letter
          if (lowerCaseChar === upperCaseChar) {
            return [prefix + ch];
          } else {
            return [prefix + lowerCaseChar, prefix + upperCaseChar];
          }
        }));
      }
      return permutations;
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

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Accounts: Accounts
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/accounts-base/server_main.js"
  ],
  mainModulePath: "/node_modules/meteor/accounts-base/server_main.js"
}});

//# sourceURL=meteor://💻app/packages/accounts-base.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtYmFzZS9zZXJ2ZXJfbWFpbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtYmFzZS9hY2NvdW50c19jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FjY291bnRzLWJhc2UvYWNjb3VudHNfc2VydmVyLmpzIl0sIm5hbWVzIjpbIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUxIiwibGluayIsImRlZmF1bHQiLCJ2IiwiX01ldGVvciRzZXR0aW5ncyRwYWNrIiwiX01ldGVvciRzZXR0aW5ncyRwYWNrMiIsImV4cG9ydCIsIkFjY291bnRzU2VydmVyIiwiX19yZWlmeVdhaXRGb3JEZXBzX18iLCJBY2NvdW50cyIsIk1ldGVvciIsInNlcnZlciIsInNldHRpbmdzIiwicGFja2FnZXMiLCJhY2NvdW50cyIsImluaXQiLCJ0aGVuIiwidXNlcnMiLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiLCJtb2R1bGUiLCJBY2NvdW50c0NvbW1vbiIsIkVYUElSRV9UT0tFTlNfSU5URVJWQUxfTVMiLCJWQUxJRF9DT05GSUdfS0VZUyIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImtleSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsImNvbnNvbGUiLCJlcnJvciIsImNvbmNhdCIsIl9vcHRpb25zIiwiY29ubmVjdGlvbiIsInVuZGVmaW5lZCIsIl9pbml0Q29ubmVjdGlvbiIsIl9pbml0aWFsaXplQ29sbGVjdGlvbiIsIl9vbkxvZ2luSG9vayIsIkhvb2siLCJiaW5kRW52aXJvbm1lbnQiLCJkZWJ1Z1ByaW50RXhjZXB0aW9ucyIsIl9vbkxvZ2luRmFpbHVyZUhvb2siLCJfb25Mb2dvdXRIb29rIiwiREVGQVVMVF9MT0dJTl9FWFBJUkFUSU9OX0RBWVMiLCJMT0dJTl9VTkVYUElSSU5HX1RPS0VOX0RBWVMiLCJsY2VOYW1lIiwiTG9naW5DYW5jZWxsZWRFcnJvciIsIm1ha2VFcnJvclR5cGUiLCJkZXNjcmlwdGlvbiIsIm1lc3NhZ2UiLCJwcm90b3R5cGUiLCJuYW1lIiwibnVtZXJpY0Vycm9yIiwiY29sbGVjdGlvbiIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIkVycm9yIiwiY29sbGVjdGlvbk5hbWUiLCJfcHJldmVudEF1dG9wdWJsaXNoIiwidXNlcklkIiwiX2FkZERlZmF1bHRGaWVsZFNlbGVjdG9yIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiZGVmYXVsdEZpZWxkU2VsZWN0b3IiLCJmaWVsZHMiLCJrZXlzMiIsInVzZXIiLCJpc1NlcnZlciIsIndhcm4iLCJqb2luIiwiZmluZE9uZSIsImlzQ2xpZW50IiwiZmluZE9uZUFzeW5jIiwidXNlckFzeW5jIiwiY29uZmlnIiwiX19tZXRlb3JfcnVudGltZV9jb25maWdfXyIsImFjY291bnRzQ29uZmlnQ2FsbGVkIiwiX2RlYnVnIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiUGFja2FnZSIsIk9BdXRoRW5jcnlwdGlvbiIsImxvYWRLZXkiLCJvYXV0aFNlY3JldEtleSIsImlzVGVzdCIsIl9uYW1lIiwib25Mb2dpbiIsImZ1bmMiLCJyZXQiLCJyZWdpc3RlciIsIl9zdGFydHVwQ2FsbGJhY2siLCJjYWxsYmFjayIsIm9uTG9naW5GYWlsdXJlIiwib25Mb2dvdXQiLCJkZHBVcmwiLCJERFAiLCJjb25uZWN0IiwiQUNDT1VOVFNfQ09OTkVDVElPTl9VUkwiLCJfZ2V0VG9rZW5MaWZldGltZU1zIiwibG9naW5FeHBpcmF0aW9uSW5EYXlzIiwibG9naW5FeHBpcmF0aW9uIiwiX2dldFBhc3N3b3JkUmVzZXRUb2tlbkxpZmV0aW1lTXMiLCJwYXNzd29yZFJlc2V0VG9rZW5FeHBpcmF0aW9uIiwicGFzc3dvcmRSZXNldFRva2VuRXhwaXJhdGlvbkluRGF5cyIsIkRFRkFVTFRfUEFTU1dPUkRfUkVTRVRfVE9LRU5fRVhQSVJBVElPTl9EQVlTIiwiX2dldFBhc3N3b3JkRW5yb2xsVG9rZW5MaWZldGltZU1zIiwicGFzc3dvcmRFbnJvbGxUb2tlbkV4cGlyYXRpb24iLCJwYXNzd29yZEVucm9sbFRva2VuRXhwaXJhdGlvbkluRGF5cyIsIkRFRkFVTFRfUEFTU1dPUkRfRU5ST0xMX1RPS0VOX0VYUElSQVRJT05fREFZUyIsIl90b2tlbkV4cGlyYXRpb24iLCJ3aGVuIiwiRGF0ZSIsImdldFRpbWUiLCJfdG9rZW5FeHBpcmVzU29vbiIsIm1pbkxpZmV0aW1lTXMiLCJtaW5MaWZldGltZUNhcE1zIiwiTUlOX1RPS0VOX0xJRkVUSU1FX0NBUF9TRUNTIiwiX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzIiwiX2FzeW5jSXRlcmF0b3IiLCJfUGFja2FnZSRvYXV0aEVuY3J5cCIsIl9leGNsdWRlZCIsImNyeXB0byIsIlVSTCIsImhhc093biIsIk5vbkVtcHR5U3RyaW5nIiwiTWF0Y2giLCJXaGVyZSIsIngiLCJjaGVjayIsIlN0cmluZyIsIl90aGlzIiwidGhpcyIsIm9uQ3JlYXRlTG9naW5Ub2tlbiIsIl9vbkNyZWF0ZUxvZ2luVG9rZW5Ib29rIiwiX3NlbGVjdG9yRm9yRmFzdENhc2VJbnNlbnNpdGl2ZUxvb2t1cCIsImZpZWxkTmFtZSIsInN0cmluZyIsInByZWZpeCIsInN1YnN0cmluZyIsIk1hdGgiLCJtaW4iLCJvckNsYXVzZSIsImdlbmVyYXRlQ2FzZVBlcm11dGF0aW9uc0ZvclN0cmluZyIsIm1hcCIsInByZWZpeFBlcm11dGF0aW9uIiwic2VsZWN0b3IiLCJSZWdFeHAiLCJfZXNjYXBlUmVnRXhwIiwiY2FzZUluc2Vuc2l0aXZlQ2xhdXNlIiwiJGFuZCIsIiRvciIsIl9maW5kVXNlckJ5UXVlcnkiLCJxdWVyeSIsImlkIiwiZmllbGRWYWx1ZSIsInVzZXJuYW1lIiwiZW1haWwiLCJjYW5kaWRhdGVVc2VycyIsImZpbmQiLCJsaW1pdCIsImZldGNoQXN5bmMiLCJfaGFuZGxlRXJyb3IiLCJtc2ciLCJfdGhpcyRfb3B0aW9ucyRhbWJpZ3UiLCJ0aHJvd0Vycm9yIiwiZXJyb3JDb2RlIiwiaXNFcnJvckFtYmlndW91cyIsImFtYmlndW91c0Vycm9yTWVzc2FnZXMiLCJfdXNlclF1ZXJ5VmFsaWRhdG9yIiwiT3B0aW9uYWwiLCJfc2VydmVyIiwiX2luaXRTZXJ2ZXJNZXRob2RzIiwiX2luaXRBY2NvdW50RGF0YUhvb2tzIiwiX2F1dG9wdWJsaXNoRmllbGRzIiwibG9nZ2VkSW5Vc2VyIiwib3RoZXJVc2VycyIsIl9kZWZhdWx0UHVibGlzaEZpZWxkcyIsInByb2plY3Rpb24iLCJwcm9maWxlIiwiZW1haWxzIiwiX2luaXRTZXJ2ZXJQdWJsaWNhdGlvbnMiLCJfYWNjb3VudERhdGEiLCJfdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnMiLCJfbmV4dFVzZXJPYnNlcnZlTnVtYmVyIiwiX2xvZ2luSGFuZGxlcnMiLCJzZXR1cERlZmF1bHRMb2dpbkhhbmRsZXJzIiwic2V0RXhwaXJlVG9rZW5zSW50ZXJ2YWwiLCJfdmFsaWRhdGVMb2dpbkhvb2siLCJfdmFsaWRhdGVOZXdVc2VySG9va3MiLCJkZWZhdWx0VmFsaWRhdGVOZXdVc2VySG9vayIsImJpbmQiLCJfZGVsZXRlU2F2ZWRUb2tlbnNGb3JBbGxVc2Vyc09uU3RhcnR1cCIsIl9za2lwQ2FzZUluc2Vuc2l0aXZlQ2hlY2tzRm9yVGVzdCIsInVybHMiLCJyZXNldFBhc3N3b3JkIiwidG9rZW4iLCJleHRyYVBhcmFtcyIsImJ1aWxkRW1haWxVcmwiLCJ2ZXJpZnlFbWFpbCIsImxvZ2luVG9rZW4iLCJlbnJvbGxBY2NvdW50IiwiYWRkRGVmYXVsdFJhdGVMaW1pdCIsInBhdGgiLCJ1cmwiLCJhYnNvbHV0ZVVybCIsInBhcmFtcyIsImVudHJpZXMiLCJ2YWx1ZSIsInNlYXJjaFBhcmFtcyIsImFwcGVuZCIsInRvU3RyaW5nIiwiY3VycmVudEludm9jYXRpb24iLCJfQ3VycmVudE1ldGhvZEludm9jYXRpb24iLCJnZXQiLCJfQ3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbiIsInNldHVwVXNlcnNDb2xsZWN0aW9uIiwidmFsaWRhdGVMb2dpbkF0dGVtcHQiLCJ2YWxpZGF0ZU5ld1VzZXIiLCJwdXNoIiwiYmVmb3JlRXh0ZXJuYWxMb2dpbiIsIl9iZWZvcmVFeHRlcm5hbExvZ2luSG9vayIsIm9uQ3JlYXRlVXNlciIsIl9vbkNyZWF0ZVVzZXJIb29rIiwid3JhcEZuIiwib25FeHRlcm5hbExvZ2luIiwiX29uRXh0ZXJuYWxMb2dpbkhvb2siLCJzZXRBZGRpdGlvbmFsRmluZFVzZXJPbkV4dGVybmFsTG9naW4iLCJfYWRkaXRpb25hbEZpbmRVc2VyT25FeHRlcm5hbExvZ2luIiwiX3ZhbGlkYXRlTG9naW4iLCJhdHRlbXB0IiwiZm9yRWFjaEFzeW5jIiwiY2xvbmVBdHRlbXB0V2l0aENvbm5lY3Rpb24iLCJlIiwiYWxsb3dlZCIsIl9zdWNjZXNzZnVsTG9naW4iLCJfZmFpbGVkTG9naW4iLCJfc3VjY2Vzc2Z1bExvZ291dCIsIl9sb2dpblVzZXIiLCJtZXRob2RJbnZvY2F0aW9uIiwic3RhbXBlZExvZ2luVG9rZW4iLCJfZ2VuZXJhdGVTdGFtcGVkTG9naW5Ub2tlbiIsIl9pbnNlcnRMb2dpblRva2VuIiwiX25vWWllbGRzQWxsb3dlZCIsIl9zZXRMb2dpblRva2VuIiwiX2hhc2hMb2dpblRva2VuIiwic2V0VXNlcklkIiwidG9rZW5FeHBpcmVzIiwiX2F0dGVtcHRMb2dpbiIsIm1ldGhvZE5hbWUiLCJtZXRob2RBcmdzIiwicmVzdWx0IiwidHlwZSIsIm1ldGhvZEFyZ3VtZW50cyIsIkFycmF5IiwiZnJvbSIsIm8iLCJfbG9naW5NZXRob2QiLCJmbiIsInRyeUxvZ2luTWV0aG9kIiwiX3JlcG9ydExvZ2luRmFpbHVyZSIsInJlZ2lzdGVyTG9naW5IYW5kbGVyIiwiaGFuZGxlciIsIl9ydW5Mb2dpbkhhbmRsZXJzIiwiZGVzdHJveVRva2VuIiwidXBkYXRlQXN5bmMiLCIkcHVsbCIsImhhc2hlZFRva2VuIiwibWV0aG9kcyIsImxvZ2luIiwibG9nb3V0IiwiX2dldExvZ2luVG9rZW4iLCJnZXROZXdUb2tlbiIsImN1cnJlbnRIYXNoZWRUb2tlbiIsImN1cnJlbnRTdGFtcGVkVG9rZW4iLCJzZXJ2aWNlcyIsInJlc3VtZSIsImxvZ2luVG9rZW5zIiwic3RhbXBlZFRva2VuIiwibmV3U3RhbXBlZFRva2VuIiwicmVtb3ZlT3RoZXJUb2tlbnMiLCJjdXJyZW50VG9rZW4iLCIkbmUiLCJjb25maWd1cmVMb2dpblNlcnZpY2UiLCJPYmplY3RJbmNsdWRpbmciLCJzZXJ2aWNlIiwib2F1dGgiLCJzZXJ2aWNlTmFtZXMiLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwia2V5SXNMb2FkZWQiLCJzZWNyZXQiLCJzZWFsIiwiaW5zZXJ0QXN5bmMiLCJvbkNvbm5lY3Rpb24iLCJvbkNsb3NlIiwiX3JlbW92ZVRva2VuRnJvbUNvbm5lY3Rpb24iLCJwdWJsaXNoIiwicmVhZHkiLCJpc19hdXRvIiwic3RhcnR1cCIsImN1c3RvbUZpZWxkcyIsIl9pZCIsImF1dG9wdWJsaXNoIiwidG9GaWVsZFNlbGVjdG9yIiwicmVkdWNlIiwicHJldiIsImZpZWxkIiwiYWRkQXV0b3B1Ymxpc2hGaWVsZHMiLCJvcHRzIiwiYXBwbHkiLCJmb3JMb2dnZWRJblVzZXIiLCJmb3JPdGhlclVzZXJzIiwic2V0RGVmYXVsdFB1Ymxpc2hGaWVsZHMiLCJfZ2V0QWNjb3VudERhdGEiLCJjb25uZWN0aW9uSWQiLCJkYXRhIiwiX3NldEFjY291bnREYXRhIiwiaGFzaCIsImNyZWF0ZUhhc2giLCJ1cGRhdGUiLCJkaWdlc3QiLCJfaGFzaFN0YW1wZWRUb2tlbiIsImhhc2hlZFN0YW1wZWRUb2tlbiIsIl9pbnNlcnRIYXNoZWRMb2dpblRva2VuIiwiJGFkZFRvU2V0IiwiX2NsZWFyQWxsTG9naW5Ub2tlbnMiLCIkc2V0IiwiX2dldFVzZXJPYnNlcnZlIiwib2JzZXJ2ZSIsInN0b3AiLCJuZXdUb2tlbiIsIm15T2JzZXJ2ZU51bWJlciIsImRlZmVyIiwiZm91bmRNYXRjaGluZ1VzZXIiLCJvYnNlcnZlQ2hhbmdlcyIsImFkZGVkIiwicmVtb3ZlZCIsImNsb3NlIiwibm9uTXV0YXRpbmdDYWxsYmFja3MiLCJSYW5kb20iLCJfZXhwaXJlUGFzc3dvcmRSZXNldFRva2VucyIsIm9sZGVzdFZhbGlkRGF0ZSIsInRva2VuTGlmZXRpbWVNcyIsInRva2VuRmlsdGVyIiwiJGV4aXN0cyIsImV4cGlyZVBhc3N3b3JkVG9rZW4iLCJfZXhwaXJlUGFzc3dvcmRFbnJvbGxUb2tlbnMiLCJfZXhwaXJlVG9rZW5zIiwidXNlckZpbHRlciIsIiRsdCIsIm11bHRpIiwic3VwZXJSZXN1bHQiLCJleHBpcmVUb2tlbkludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsImluc2VydFVzZXJEb2MiLCJjcmVhdGVkQXQiLCJmb3JFYWNoIiwicGluRW5jcnlwdGVkRmllbGRzVG9Vc2VyIiwiZnVsbFVzZXIiLCJkZWZhdWx0Q3JlYXRlVXNlckhvb2siLCJfaXRlcmF0b3JBYnJ1cHRDb21wbGV0aW9uIiwiX2RpZEl0ZXJhdG9yRXJyb3IiLCJfaXRlcmF0b3JFcnJvciIsIl9pdGVyYXRvciIsIl9zdGVwIiwibmV4dCIsImRvbmUiLCJob29rIiwiZXJyIiwicmV0dXJuIiwiZXJybXNnIiwiX3Rlc3RFbWFpbERvbWFpbiIsImRvbWFpbiIsInJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluIiwidGVzdCIsIl9kZWxldGVTYXZlZFRva2Vuc0ZvclVzZXIiLCJ0b2tlbnNUb0RlbGV0ZSIsIiR1bnNldCIsIiRwdWxsQWxsIiwibG9naW5Ub2tlbnNUb0RlbGV0ZSIsIl8iLCJjYXRjaCIsImxvZyIsInVwZGF0ZU9yQ3JlYXRlVXNlckZyb21FeHRlcm5hbFNlcnZpY2UiLCJzZXJ2aWNlTmFtZSIsInNlcnZpY2VEYXRhIiwic2VydmljZUlkS2V5IiwiaXNOYU4iLCJwYXJzZUludCIsInNldEF0dHJzIiwicmVtb3ZlRGVmYXVsdFJhdGVMaW1pdCIsInJlc3AiLCJERFBSYXRlTGltaXRlciIsInJlbW92ZVJ1bGUiLCJkZWZhdWx0UmF0ZUxpbWl0ZXJSdWxlSWQiLCJhZGRSdWxlIiwiY2xpZW50QWRkcmVzcyIsImdlbmVyYXRlT3B0aW9uc0ZvckVtYWlsIiwicmVhc29uIiwiZXh0cmEiLCJ0byIsImVtYWlsVGVtcGxhdGVzIiwic3ViamVjdCIsInRleHQiLCJodG1sIiwiaGVhZGVycyIsIl9jaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMiLCJkaXNwbGF5TmFtZSIsIm93blVzZXJJZCIsInNraXBDaGVjayIsIm1hdGNoZWRVc2VycyIsIl9jcmVhdGVVc2VyQ2hlY2tpbmdEdXBsaWNhdGVzIiwiX3JlZiIsIm5ld1VzZXIiLCJhZGRyZXNzIiwidmVyaWZpZWQiLCJleCIsInJlbW92ZUFzeW5jIiwiY2xvbmVkQXR0ZW1wdCIsIkVKU09OIiwiY2xvbmUiLCJkZWZhdWx0UmVzdW1lTG9naW5IYW5kbGVyIiwib2xkVW5oYXNoZWRTdHlsZVRva2VuIiwiaXNFbnJvbGwiLCJyZXNldFJhbmdlT3IiLCJleHBpcmVGaWx0ZXIiLCJzZXRJbnRlcnZhbCIsImlzU2VhbGVkIiwib3BlbiIsImVtYWlsSXNHb29kIiwidmFsdWVzIiwiYWxsb3ciLCJtb2RpZmllciIsImZldGNoIiwiY3JlYXRlSW5kZXhBc3luYyIsInVuaXF1ZSIsInNwYXJzZSIsInBlcm11dGF0aW9ucyIsImkiLCJjaCIsImNoYXJBdCIsImxvd2VyQ2FzZUNoYXIiLCJ0b0xvd2VyQ2FzZSIsInVwcGVyQ2FzZUNoYXIiLCJ0b1VwcGVyQ2FzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxhQUFhO0lBQUNDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDLHNDQUFzQyxFQUFDO01BQUNDLE9BQU9BLENBQUNDLENBQUMsRUFBQztRQUFDSixhQUFhLEdBQUNJLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFBQyxxQkFBQSxFQUFBQyxzQkFBQTtJQUF2R0wsT0FBTyxDQUFDTSxNQUFNLENBQUM7TUFBQ0MsY0FBYyxFQUFDQSxDQUFBLEtBQUlBO0lBQWMsQ0FBQyxDQUFDO0lBQUMs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TyxDQUFDbFQsTUFBTSxHQUFHOFMsRUFBRSxDQUFDO1VBQ3RCLENBQUMsTUFBTTtZQUNMLE9BQU8sQ0FBQzlTLE1BQU0sR0FBR2dULGFBQWEsRUFBRWhULE1BQU0sR0FBR2tULGFBQWEsQ0FBQztVQUN6RDtRQUNGLENBQUMsQ0FBRSxDQUFDO01BQ047TUFDQSxPQUFPTixZQUFZO0lBQ3JCLENBQUM7SUFBQXRhLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEciLCJmaWxlIjoiL3BhY2thZ2VzL2FjY291bnRzLWJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBY2NvdW50c1NlcnZlciB9IGZyb20gXCIuL2FjY291bnRzX3NlcnZlci5qc1wiO1xuXG4vKipcbiAqIEBuYW1lc3BhY2UgQWNjb3VudHNcbiAqIEBzdW1tYXJ5IFRoZSBuYW1lc3BhY2UgZm9yIGFsbCBzZXJ2ZXItc2lkZSBhY2NvdW50cy1yZWxhdGVkIG1ldGhvZHMuXG4gKi9cbkFjY291bnRzID0gbmV3IEFjY291bnRzU2VydmVyKE1ldGVvci5zZXJ2ZXIsIHsgLi4uTWV0ZW9yLnNldHRpbmdzLnBhY2thZ2VzPy5hY2NvdW50cywgLi4uTWV0ZW9yLnNldHRpbmdzLnBhY2thZ2VzPy5bJ2FjY291bnRzLWJhc2UnXSB9KTtcbi8vIFRPRE9bRklCRVJTXTogSSBuZWVkIFRMQVxuQWNjb3VudHMuaW5pdCgpLnRoZW4oKTtcbi8vIFVzZXJzIHRhYmxlLiBEb24ndCB1c2UgdGhlIG5vcm1hbCBhdXRvcHVibGlzaCwgc2luY2Ugd2Ugd2FudCB0byBoaWRlXG4vLyBzb21lIGZpZWxkcy4gQ29kZSB0byBhdXRvcHVibGlzaCB0aGlzIGlzIGluIGFjY291bnRzX3NlcnZlci5qcy5cbi8vIFhYWCBBbGxvdyB1c2VycyB0byBjb25maWd1cmUgdGhpcyBjb2xsZWN0aW9uIG5hbWUuXG5cbi8qKlxuICogQHN1bW1hcnkgQSBbTW9uZ28uQ29sbGVjdGlvbl0oI2NvbGxlY3Rpb25zKSBjb250YWluaW5nIHVzZXIgZG9jdW1lbnRzLlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAdHlwZSB7TW9uZ28uQ29sbGVjdGlvbn1cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAqL1xuTWV0ZW9yLnVzZXJzID0gQWNjb3VudHMudXNlcnM7XG5cbmV4cG9ydCB7XG4gIC8vIFNpbmNlIHRoaXMgZmlsZSBpcyB0aGUgbWFpbiBtb2R1bGUgZm9yIHRoZSBzZXJ2ZXIgdmVyc2lvbiBvZiB0aGVcbiAgLy8gYWNjb3VudHMtYmFzZSBwYWNrYWdlLCBwcm9wZXJ0aWVzIG9mIG5vbi1lbnRyeS1wb2ludCBtb2R1bGVzIG5lZWQgdG9cbiAgLy8gYmUgcmUtZXhwb3J0ZWQgaW4gb3JkZXIgdG8gYmUgYWNjZXNzaWJsZSB0byBtb2R1bGVzIHRoYXQgaW1wb3J0IHRoZVxuICAvLyBhY2NvdW50cy1iYXNlIHBhY2thZ2UuXG4gIEFjY291bnRzU2VydmVyXG59O1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8vIGNvbmZpZyBvcHRpb24ga2V5c1xuY29uc3QgVkFMSURfQ09ORklHX0tFWVMgPSBbXG4gICdzZW5kVmVyaWZpY2F0aW9uRW1haWwnLFxuICAnZm9yYmlkQ2xpZW50QWNjb3VudENyZWF0aW9uJyxcbiAgJ3Jlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluJyxcbiAgJ2xvZ2luRXhwaXJhdGlvbicsXG4gICdsb2dpbkV4cGlyYXRpb25JbkRheXMnLFxuICAnb2F1dGhTZWNyZXRLZXknLFxuICAncGFzc3dvcmRSZXNldFRva2VuRXhwaXJhdGlvbkluRGF5cycsXG4gICdwYXNzd29yZFJlc2V0VG9rZW5FeHBpcmF0aW9uJyxcbiAgJ3Bhc3N3b3JkRW5yb2xsVG9rZW5FeHBpcmF0aW9uSW5EYXlzJyxcbiAgJ3Bhc3N3b3JkRW5yb2xsVG9rZW5FeHBpcmF0aW9uJyxcbiAgJ2FtYmlndW91c0Vycm9yTWVzc2FnZXMnLFxuICAnYmNyeXB0Um91bmRzJyxcbiAgJ2RlZmF1bHRGaWVsZFNlbGVjdG9yJyxcbiAgJ2NvbGxlY3Rpb24nLFxuICAnbG9naW5Ub2tlbkV4cGlyYXRpb25Ib3VycycsXG4gICd0b2tlblNlcXVlbmNlTGVuZ3RoJyxcbiAgJ2NsaWVudFN0b3JhZ2UnLFxuICAnZGRwVXJsJyxcbiAgJ2Nvbm5lY3Rpb24nLFxuXTtcblxuLyoqXG4gKiBAc3VtbWFyeSBTdXBlci1jb25zdHJ1Y3RvciBmb3IgQWNjb3VudHNDbGllbnQgYW5kIEFjY291bnRzU2VydmVyLlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAY2xhc3MgQWNjb3VudHNDb21tb25cbiAqIEBpbnN0YW5jZW5hbWUgYWNjb3VudHNDbGllbnRPclNlcnZlclxuICogQHBhcmFtIG9wdGlvbnMge09iamVjdH0gYW4gb2JqZWN0IHdpdGggZmllbGRzOlxuICogLSBjb25uZWN0aW9uIHtPYmplY3R9IE9wdGlvbmFsIEREUCBjb25uZWN0aW9uIHRvIHJldXNlLlxuICogLSBkZHBVcmwge1N0cmluZ30gT3B0aW9uYWwgVVJMIGZvciBjcmVhdGluZyBhIG5ldyBERFAgY29ubmVjdGlvbi5cbiAqIC0gY29sbGVjdGlvbiB7U3RyaW5nfE1vbmdvLkNvbGxlY3Rpb259IFRoZSBuYW1lIG9mIHRoZSBNb25nby5Db2xsZWN0aW9uXG4gKiAgICAgb3IgdGhlIE1vbmdvLkNvbGxlY3Rpb24gb2JqZWN0IHRvIGhvbGQgdGhlIHVzZXJzLlxuICovXG5leHBvcnQgY2xhc3MgQWNjb3VudHNDb21tb24ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgLy8gVmFsaWRhdGUgY29uZmlnIG9wdGlvbnMga2V5c1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG9wdGlvbnMpKSB7XG4gICAgICBpZiAoIVZBTElEX0NPTkZJR19LRVlTLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgQWNjb3VudHMuY29uZmlnOiBJbnZhbGlkIGtleTogJHtrZXl9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3VycmVudGx5IHRoaXMgaXMgcmVhZCBkaXJlY3RseSBieSBwYWNrYWdlcyBsaWtlIGFjY291bnRzLXBhc3N3b3JkXG4gICAgLy8gYW5kIGFjY291bnRzLXVpLXVuc3R5bGVkLlxuICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgLy8gTm90ZSB0aGF0IHNldHRpbmcgdGhpcy5jb25uZWN0aW9uID0gbnVsbCBjYXVzZXMgdGhpcy51c2VycyB0byBiZSBhXG4gICAgLy8gTG9jYWxDb2xsZWN0aW9uLCB3aGljaCBpcyBub3Qgd2hhdCB3ZSB3YW50LlxuICAgIHRoaXMuY29ubmVjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9pbml0Q29ubmVjdGlvbihvcHRpb25zIHx8IHt9KTtcblxuICAgIC8vIFRoZXJlIGlzIGFuIGFsbG93IGNhbGwgaW4gYWNjb3VudHNfc2VydmVyLmpzIHRoYXQgcmVzdHJpY3RzIHdyaXRlcyB0b1xuICAgIC8vIHRoaXMgY29sbGVjdGlvbi5cbiAgICB0aGlzLnVzZXJzID0gdGhpcy5faW5pdGlhbGl6ZUNvbGxlY3Rpb24ob3B0aW9ucyB8fCB7fSk7XG5cbiAgICAvLyBDYWxsYmFjayBleGNlcHRpb25zIGFyZSBwcmludGVkIHdpdGggTWV0ZW9yLl9kZWJ1ZyBhbmQgaWdub3JlZC5cbiAgICB0aGlzLl9vbkxvZ2luSG9vayA9IG5ldyBIb29rKHtcbiAgICAgIGJpbmRFbnZpcm9ubWVudDogZmFsc2UsXG4gICAgICBkZWJ1Z1ByaW50RXhjZXB0aW9uczogJ29uTG9naW4gY2FsbGJhY2snLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fb25Mb2dpbkZhaWx1cmVIb29rID0gbmV3IEhvb2soe1xuICAgICAgYmluZEVudmlyb25tZW50OiBmYWxzZSxcbiAgICAgIGRlYnVnUHJpbnRFeGNlcHRpb25zOiAnb25Mb2dpbkZhaWx1cmUgY2FsbGJhY2snLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fb25Mb2dvdXRIb29rID0gbmV3IEhvb2soe1xuICAgICAgYmluZEVudmlyb25tZW50OiBmYWxzZSxcbiAgICAgIGRlYnVnUHJpbnRFeGNlcHRpb25zOiAnb25Mb2dvdXQgY2FsbGJhY2snLFxuICAgIH0pO1xuXG4gICAgLy8gRXhwb3NlIGZvciB0ZXN0aW5nLlxuICAgIHRoaXMuREVGQVVMVF9MT0dJTl9FWFBJUkFUSU9OX0RBWVMgPSBERUZBVUxUX0xPR0lOX0VYUElSQVRJT05fREFZUztcbiAgICB0aGlzLkxPR0lOX1VORVhQSVJJTkdfVE9LRU5fREFZUyA9IExPR0lOX1VORVhQSVJJTkdfVE9LRU5fREFZUztcblxuICAgIC8vIFRocm93biB3aGVuIHRoZSB1c2VyIGNhbmNlbHMgdGhlIGxvZ2luIHByb2Nlc3MgKGVnLCBjbG9zZXMgYW4gb2F1dGhcbiAgICAvLyBwb3B1cCwgZGVjbGluZXMgcmV0aW5hIHNjYW4sIGV0YylcbiAgICBjb25zdCBsY2VOYW1lID0gJ0FjY291bnRzLkxvZ2luQ2FuY2VsbGVkRXJyb3InO1xuICAgIHRoaXMuTG9naW5DYW5jZWxsZWRFcnJvciA9IE1ldGVvci5tYWtlRXJyb3JUeXBlKGxjZU5hbWUsIGZ1bmN0aW9uKFxuICAgICAgZGVzY3JpcHRpb25cbiAgICApIHtcbiAgICAgIHRoaXMubWVzc2FnZSA9IGRlc2NyaXB0aW9uO1xuICAgIH0pO1xuICAgIHRoaXMuTG9naW5DYW5jZWxsZWRFcnJvci5wcm90b3R5cGUubmFtZSA9IGxjZU5hbWU7XG5cbiAgICAvLyBUaGlzIGlzIHVzZWQgdG8gdHJhbnNtaXQgc3BlY2lmaWMgc3ViY2xhc3MgZXJyb3JzIG92ZXIgdGhlIHdpcmUuIFdlXG4gICAgLy8gc2hvdWxkIGNvbWUgdXAgd2l0aCBhIG1vcmUgZ2VuZXJpYyB3YXkgdG8gZG8gdGhpcyAoZWcsIHdpdGggc29tZSBzb3J0IG9mXG4gICAgLy8gc3ltYm9saWMgZXJyb3IgY29kZSByYXRoZXIgdGhhbiBhIG51bWJlcikuXG4gICAgdGhpcy5Mb2dpbkNhbmNlbGxlZEVycm9yLm51bWVyaWNFcnJvciA9IDB4OGFjZGMyZjtcbiAgfVxuXG4gIF9pbml0aWFsaXplQ29sbGVjdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuY29sbGVjdGlvbiAmJiB0eXBlb2Ygb3B0aW9ucy5jb2xsZWN0aW9uICE9PSAnc3RyaW5nJyAmJiAhKG9wdGlvbnMuY29sbGVjdGlvbiBpbnN0YW5jZW9mIE1vbmdvLkNvbGxlY3Rpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdDb2xsZWN0aW9uIHBhcmFtZXRlciBjYW4gYmUgb25seSBvZiB0eXBlIHN0cmluZyBvciBcIk1vbmdvLkNvbGxlY3Rpb25cIicpO1xuICAgIH1cblxuICAgIGxldCBjb2xsZWN0aW9uTmFtZSA9ICd1c2Vycyc7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLmNvbGxlY3Rpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb2xsZWN0aW9uTmFtZSA9IG9wdGlvbnMuY29sbGVjdGlvbjtcbiAgICB9XG5cbiAgICBsZXQgY29sbGVjdGlvbjtcbiAgICBpZiAob3B0aW9ucy5jb2xsZWN0aW9uIGluc3RhbmNlb2YgTW9uZ28uQ29sbGVjdGlvbikge1xuICAgICAgY29sbGVjdGlvbiA9IG9wdGlvbnMuY29sbGVjdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29sbGVjdGlvbiA9IG5ldyBNb25nby5Db2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lLCB7XG4gICAgICAgIF9wcmV2ZW50QXV0b3B1Ymxpc2g6IHRydWUsXG4gICAgICAgIGNvbm5lY3Rpb246IHRoaXMuY29ubmVjdGlvbixcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEdldCB0aGUgY3VycmVudCB1c2VyIGlkLCBvciBgbnVsbGAgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4uIEEgcmVhY3RpdmUgZGF0YSBzb3VyY2UuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKi9cbiAgdXNlcklkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXNlcklkIG1ldGhvZCBub3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIC8vIG1lcmdlIHRoZSBkZWZhdWx0RmllbGRTZWxlY3RvciB3aXRoIGFuIGV4aXN0aW5nIG9wdGlvbnMgb2JqZWN0XG4gIF9hZGREZWZhdWx0RmllbGRTZWxlY3RvcihvcHRpb25zID0ge30pIHtcbiAgICAvLyB0aGlzIHdpbGwgYmUgdGhlIG1vc3QgY29tbW9uIGNhc2UgZm9yIG1vc3QgcGVvcGxlLCBzbyBtYWtlIGl0IHF1aWNrXG4gICAgaWYgKCF0aGlzLl9vcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yKSByZXR1cm4gb3B0aW9ucztcblxuICAgIC8vIGlmIG5vIGZpZWxkIHNlbGVjdG9yIHRoZW4ganVzdCB1c2UgZGVmYXVsdEZpZWxkU2VsZWN0b3JcbiAgICBpZiAoIW9wdGlvbnMuZmllbGRzKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgZmllbGRzOiB0aGlzLl9vcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yLFxuICAgICAgfTtcblxuICAgIC8vIGlmIGVtcHR5IGZpZWxkIHNlbGVjdG9yIHRoZW4gdGhlIGZ1bGwgdXNlciBvYmplY3QgaXMgZXhwbGljaXRseSByZXF1ZXN0ZWQsIHNvIG9iZXlcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucy5maWVsZHMpO1xuICAgIGlmICgha2V5cy5sZW5ndGgpIHJldHVybiBvcHRpb25zO1xuXG4gICAgLy8gaWYgdGhlIHJlcXVlc3RlZCBmaWVsZHMgYXJlICt2ZSB0aGVuIGlnbm9yZSBkZWZhdWx0RmllbGRTZWxlY3RvclxuICAgIC8vIGFzc3VtZSB0aGV5IGFyZSBhbGwgZWl0aGVyICt2ZSBvciAtdmUgYmVjYXVzZSBNb25nbyBkb2Vzbid0IGxpa2UgbWl4ZWRcbiAgICBpZiAoISFvcHRpb25zLmZpZWxkc1trZXlzWzBdXSkgcmV0dXJuIG9wdGlvbnM7XG5cbiAgICAvLyBUaGUgcmVxdWVzdGVkIGZpZWxkcyBhcmUgLXZlLlxuICAgIC8vIElmIHRoZSBkZWZhdWx0RmllbGRTZWxlY3RvciBpcyArdmUgdGhlbiB1c2UgcmVxdWVzdGVkIGZpZWxkcywgb3RoZXJ3aXNlIG1lcmdlIHRoZW1cbiAgICBjb25zdCBrZXlzMiA9IE9iamVjdC5rZXlzKHRoaXMuX29wdGlvbnMuZGVmYXVsdEZpZWxkU2VsZWN0b3IpO1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yW2tleXMyWzBdXVxuICAgICAgPyBvcHRpb25zXG4gICAgICA6IHtcbiAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgIGZpZWxkczoge1xuICAgICAgICAgICAgLi4ub3B0aW9ucy5maWVsZHMsXG4gICAgICAgICAgICAuLi50aGlzLl9vcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgR2V0IHRoZSBjdXJyZW50IHVzZXIgcmVjb3JkLCBvciBgbnVsbGAgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4uIEEgcmVhY3RpdmUgZGF0YSBzb3VyY2UuIEluIHRoZSBzZXJ2ZXIgdGhpcyBmdWN0aW9uIHJldHVybnMgYSBwcm9taXNlLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcGFyYW0ge01vbmdvRmllbGRTcGVjaWZpZXJ9IG9wdGlvbnMuZmllbGRzIERpY3Rpb25hcnkgb2YgZmllbGRzIHRvIHJldHVybiBvciBleGNsdWRlLlxuICAgKi9cbiAgdXNlcihvcHRpb25zKSB7XG4gICAgaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgICAgY29uc29sZS53YXJuKFtcbiAgICAgICAgXCJgTWV0ZW9yLnVzZXIoKWAgaXMgZGVwcmVjYXRlZCBvbiB0aGUgc2VydmVyIHNpZGUuXCIsXG4gICAgICAgIFwiICAgIFRvIGZldGNoIHRoZSBjdXJyZW50IHVzZXIgcmVjb3JkIG9uIHRoZSBzZXJ2ZXIsXCIsXG4gICAgICAgIFwiICAgIHVzZSBgTWV0ZW9yLnVzZXJBc3luYygpYCBpbnN0ZWFkLlwiLFxuICAgICAgXS5qb2luKFwiXFxuXCIpKTtcbiAgICB9XG5cbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCB1c2VySWQgPSBzZWxmLnVzZXJJZCgpO1xuICAgIGNvbnN0IGZpbmRPbmUgPSAoLi4uYXJncykgPT4gTWV0ZW9yLmlzQ2xpZW50XG4gICAgICA/IHNlbGYudXNlcnMuZmluZE9uZSguLi5hcmdzKVxuICAgICAgOiBzZWxmLnVzZXJzLmZpbmRPbmVBc3luYyguLi5hcmdzKTtcbiAgICByZXR1cm4gdXNlcklkXG4gICAgICA/IGZpbmRPbmUodXNlcklkLCB0aGlzLl9hZGREZWZhdWx0RmllbGRTZWxlY3RvcihvcHRpb25zKSlcbiAgICAgIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBHZXQgdGhlIGN1cnJlbnQgdXNlciByZWNvcmQsIG9yIGBudWxsYCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbi5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtNb25nb0ZpZWxkU3BlY2lmaWVyfSBvcHRpb25zLmZpZWxkcyBEaWN0aW9uYXJ5IG9mIGZpZWxkcyB0byByZXR1cm4gb3IgZXhjbHVkZS5cbiAgICovXG4gIGFzeW5jIHVzZXJBc3luYyhvcHRpb25zKSB7XG4gICAgY29uc3QgdXNlcklkID0gdGhpcy51c2VySWQoKTtcbiAgICByZXR1cm4gdXNlcklkXG4gICAgICA/IHRoaXMudXNlcnMuZmluZE9uZUFzeW5jKHVzZXJJZCwgdGhpcy5fYWRkRGVmYXVsdEZpZWxkU2VsZWN0b3Iob3B0aW9ucykpXG4gICAgICA6IG51bGw7XG4gIH1cbiAgLy8gU2V0IHVwIGNvbmZpZyBmb3IgdGhlIGFjY291bnRzIHN5c3RlbS4gQ2FsbCB0aGlzIG9uIGJvdGggdGhlIGNsaWVudFxuICAvLyBhbmQgdGhlIHNlcnZlci5cbiAgLy9cbiAgLy8gTm90ZSB0aGF0IHRoaXMgbWV0aG9kIGdldHMgb3ZlcnJpZGRlbiBvbiBBY2NvdW50c1NlcnZlci5wcm90b3R5cGUsIGJ1dFxuICAvLyB0aGUgb3ZlcnJpZGluZyBtZXRob2QgY2FsbHMgdGhlIG92ZXJyaWRkZW4gbWV0aG9kLlxuICAvL1xuICAvLyBYWFggd2Ugc2hvdWxkIGFkZCBzb21lIGVuZm9yY2VtZW50IHRoYXQgdGhpcyBpcyBjYWxsZWQgb24gYm90aCB0aGVcbiAgLy8gY2xpZW50IGFuZCB0aGUgc2VydmVyLiBPdGhlcndpc2UsIGEgdXNlciBjYW5cbiAgLy8gJ2ZvcmJpZENsaWVudEFjY291bnRDcmVhdGlvbicgb25seSBvbiB0aGUgY2xpZW50IGFuZCB3aGlsZSBpdCBsb29rc1xuICAvLyBsaWtlIHRoZWlyIGFwcCBpcyBzZWN1cmUsIHRoZSBzZXJ2ZXIgd2lsbCBzdGlsbCBhY2NlcHQgY3JlYXRlVXNlclxuICAvLyBjYWxscy4gaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvaXNzdWVzLzgyOFxuICAvL1xuICAvLyBAcGFyYW0gb3B0aW9ucyB7T2JqZWN0fSBhbiBvYmplY3Qgd2l0aCBmaWVsZHM6XG4gIC8vIC0gc2VuZFZlcmlmaWNhdGlvbkVtYWlsIHtCb29sZWFufVxuICAvLyAgICAgU2VuZCBlbWFpbCBhZGRyZXNzIHZlcmlmaWNhdGlvbiBlbWFpbHMgdG8gbmV3IHVzZXJzIGNyZWF0ZWQgZnJvbVxuICAvLyAgICAgY2xpZW50IHNpZ251cHMuXG4gIC8vIC0gZm9yYmlkQ2xpZW50QWNjb3VudENyZWF0aW9uIHtCb29sZWFufVxuICAvLyAgICAgRG8gbm90IGFsbG93IGNsaWVudHMgdG8gY3JlYXRlIGFjY291bnRzIGRpcmVjdGx5LlxuICAvLyAtIHJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluIHtGdW5jdGlvbiBvciBTdHJpbmd9XG4gIC8vICAgICBSZXF1aXJlIGNyZWF0ZWQgdXNlcnMgdG8gaGF2ZSBhbiBlbWFpbCBtYXRjaGluZyB0aGUgZnVuY3Rpb24gb3JcbiAgLy8gICAgIGhhdmluZyB0aGUgc3RyaW5nIGFzIGRvbWFpbi5cbiAgLy8gLSBsb2dpbkV4cGlyYXRpb25JbkRheXMge051bWJlcn1cbiAgLy8gICAgIE51bWJlciBvZiBkYXlzIHNpbmNlIGxvZ2luIHVudGlsIGEgdXNlciBpcyBsb2dnZWQgb3V0IChsb2dpbiB0b2tlblxuICAvLyAgICAgZXhwaXJlcykuXG4gIC8vIC0gY29sbGVjdGlvbiB7U3RyaW5nfE1vbmdvLkNvbGxlY3Rpb259XG4gIC8vICAgICBBIGNvbGxlY3Rpb24gbmFtZSBvciBhIE1vbmdvLkNvbGxlY3Rpb24gb2JqZWN0IHRvIGhvbGQgdGhlIHVzZXJzLlxuICAvLyAtIHBhc3N3b3JkUmVzZXRUb2tlbkV4cGlyYXRpb25JbkRheXMge051bWJlcn1cbiAgLy8gICAgIE51bWJlciBvZiBkYXlzIHNpbmNlIHBhc3N3b3JkIHJlc2V0IHRva2VuIGNyZWF0aW9uIHVudGlsIHRoZVxuICAvLyAgICAgdG9rZW4gY2FuJ3QgYmUgdXNlZCBhbnkgbG9uZ2VyIChwYXNzd29yZCByZXNldCB0b2tlbiBleHBpcmVzKS5cbiAgLy8gLSBhbWJpZ3VvdXNFcnJvck1lc3NhZ2VzIHtCb29sZWFufVxuICAvLyAgICAgUmV0dXJuIGFtYmlndW91cyBlcnJvciBtZXNzYWdlcyBmcm9tIGxvZ2luIGZhaWx1cmVzIHRvIHByZXZlbnRcbiAgLy8gICAgIHVzZXIgZW51bWVyYXRpb24uXG4gIC8vIC0gYmNyeXB0Um91bmRzIHtOdW1iZXJ9XG4gIC8vICAgICBBbGxvd3Mgb3ZlcnJpZGUgb2YgbnVtYmVyIG9mIGJjcnlwdCByb3VuZHMgKGFrYSB3b3JrIGZhY3RvcikgdXNlZFxuICAvLyAgICAgdG8gc3RvcmUgcGFzc3dvcmRzLlxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBTZXQgZ2xvYmFsIGFjY291bnRzIG9wdGlvbnMuIFlvdSBjYW4gYWxzbyBzZXQgdGhlc2UgaW4gYE1ldGVvci5zZXR0aW5ncy5wYWNrYWdlcy5hY2NvdW50c2Agd2l0aG91dCB0aGUgbmVlZCB0byBjYWxsIHRoaXMgZnVuY3Rpb24uXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMuc2VuZFZlcmlmaWNhdGlvbkVtYWlsIE5ldyB1c2VycyB3aXRoIGFuIGVtYWlsIGFkZHJlc3Mgd2lsbCByZWNlaXZlIGFuIGFkZHJlc3MgdmVyaWZpY2F0aW9uIGVtYWlsLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMuZm9yYmlkQ2xpZW50QWNjb3VudENyZWF0aW9uIENhbGxzIHRvIFtgY3JlYXRlVXNlcmBdKCNhY2NvdW50c19jcmVhdGV1c2VyKSBmcm9tIHRoZSBjbGllbnQgd2lsbCBiZSByZWplY3RlZC4gSW4gYWRkaXRpb24sIGlmIHlvdSBhcmUgdXNpbmcgW2FjY291bnRzLXVpXSgjYWNjb3VudHN1aSksIHRoZSBcIkNyZWF0ZSBhY2NvdW50XCIgbGluayB3aWxsIG5vdCBiZSBhdmFpbGFibGUuXG4gICAqIEBwYXJhbSB7U3RyaW5nIHwgRnVuY3Rpb259IG9wdGlvbnMucmVzdHJpY3RDcmVhdGlvbkJ5RW1haWxEb21haW4gSWYgc2V0IHRvIGEgc3RyaW5nLCBvbmx5IGFsbG93cyBuZXcgdXNlcnMgaWYgdGhlIGRvbWFpbiBwYXJ0IG9mIHRoZWlyIGVtYWlsIGFkZHJlc3MgbWF0Y2hlcyB0aGUgc3RyaW5nLiBJZiBzZXQgdG8gYSBmdW5jdGlvbiwgb25seSBhbGxvd3MgbmV3IHVzZXJzIGlmIHRoZSBmdW5jdGlvbiByZXR1cm5zIHRydWUuICBUaGUgZnVuY3Rpb24gaXMgcGFzc2VkIHRoZSBmdWxsIGVtYWlsIGFkZHJlc3Mgb2YgdGhlIHByb3Bvc2VkIG5ldyB1c2VyLiAgV29ya3Mgd2l0aCBwYXNzd29yZC1iYXNlZCBzaWduLWluIGFuZCBleHRlcm5hbCBzZXJ2aWNlcyB0aGF0IGV4cG9zZSBlbWFpbCBhZGRyZXNzZXMgKEdvb2dsZSwgRmFjZWJvb2ssIEdpdEh1YikuIEFsbCBleGlzdGluZyB1c2VycyBzdGlsbCBjYW4gbG9nIGluIGFmdGVyIGVuYWJsaW5nIHRoaXMgb3B0aW9uLiBFeGFtcGxlOiBgQWNjb3VudHMuY29uZmlnKHsgcmVzdHJpY3RDcmVhdGlvbkJ5RW1haWxEb21haW46ICdzY2hvb2wuZWR1JyB9KWAuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLmxvZ2luRXhwaXJhdGlvbiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmcm9tIHdoZW4gYSB1c2VyIGxvZ3MgaW4gdW50aWwgdGhlaXIgdG9rZW4gZXhwaXJlcyBhbmQgdGhleSBhcmUgbG9nZ2VkIG91dCwgZm9yIGEgbW9yZSBncmFudWxhciBjb250cm9sLiBJZiBgbG9naW5FeHBpcmF0aW9uSW5EYXlzYCBpcyBzZXQsIGl0IHRha2VzIHByZWNlZGVudC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMubG9naW5FeHBpcmF0aW9uSW5EYXlzIFRoZSBudW1iZXIgb2YgZGF5cyBmcm9tIHdoZW4gYSB1c2VyIGxvZ3MgaW4gdW50aWwgdGhlaXIgdG9rZW4gZXhwaXJlcyBhbmQgdGhleSBhcmUgbG9nZ2VkIG91dC4gRGVmYXVsdHMgdG8gOTAuIFNldCB0byBgbnVsbGAgdG8gZGlzYWJsZSBsb2dpbiBleHBpcmF0aW9uLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5vYXV0aFNlY3JldEtleSBXaGVuIHVzaW5nIHRoZSBgb2F1dGgtZW5jcnlwdGlvbmAgcGFja2FnZSwgdGhlIDE2IGJ5dGUga2V5IHVzaW5nIHRvIGVuY3J5cHQgc2Vuc2l0aXZlIGFjY291bnQgY3JlZGVudGlhbHMgaW4gdGhlIGRhdGFiYXNlLCBlbmNvZGVkIGluIGJhc2U2NC4gIFRoaXMgb3B0aW9uIG1heSBvbmx5IGJlIHNwZWNpZmllZCBvbiB0aGUgc2VydmVyLiAgU2VlIHBhY2thZ2VzL29hdXRoLWVuY3J5cHRpb24vUkVBRE1FLm1kIGZvciBkZXRhaWxzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5wYXNzd29yZFJlc2V0VG9rZW5FeHBpcmF0aW9uSW5EYXlzIFRoZSBudW1iZXIgb2YgZGF5cyBmcm9tIHdoZW4gYSBsaW5rIHRvIHJlc2V0IHBhc3N3b3JkIGlzIHNlbnQgdW50aWwgdG9rZW4gZXhwaXJlcyBhbmQgdXNlciBjYW4ndCByZXNldCBwYXNzd29yZCB3aXRoIHRoZSBsaW5rIGFueW1vcmUuIERlZmF1bHRzIHRvIDMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLnBhc3N3b3JkUmVzZXRUb2tlbkV4cGlyYXRpb24gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZnJvbSB3aGVuIGEgbGluayB0byByZXNldCBwYXNzd29yZCBpcyBzZW50IHVudGlsIHRva2VuIGV4cGlyZXMgYW5kIHVzZXIgY2FuJ3QgcmVzZXQgcGFzc3dvcmQgd2l0aCB0aGUgbGluayBhbnltb3JlLiBJZiBgcGFzc3dvcmRSZXNldFRva2VuRXhwaXJhdGlvbkluRGF5c2AgaXMgc2V0LCBpdCB0YWtlcyBwcmVjZWRlbnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLnBhc3N3b3JkRW5yb2xsVG9rZW5FeHBpcmF0aW9uSW5EYXlzIFRoZSBudW1iZXIgb2YgZGF5cyBmcm9tIHdoZW4gYSBsaW5rIHRvIHNldCBpbml0aWFsIHBhc3N3b3JkIGlzIHNlbnQgdW50aWwgdG9rZW4gZXhwaXJlcyBhbmQgdXNlciBjYW4ndCBzZXQgcGFzc3dvcmQgd2l0aCB0aGUgbGluayBhbnltb3JlLiBEZWZhdWx0cyB0byAzMC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMucGFzc3dvcmRFbnJvbGxUb2tlbkV4cGlyYXRpb24gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZnJvbSB3aGVuIGEgbGluayB0byBzZXQgaW5pdGlhbCBwYXNzd29yZCBpcyBzZW50IHVudGlsIHRva2VuIGV4cGlyZXMgYW5kIHVzZXIgY2FuJ3Qgc2V0IHBhc3N3b3JkIHdpdGggdGhlIGxpbmsgYW55bW9yZS4gSWYgYHBhc3N3b3JkRW5yb2xsVG9rZW5FeHBpcmF0aW9uSW5EYXlzYCBpcyBzZXQsIGl0IHRha2VzIHByZWNlZGVudC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLmFtYmlndW91c0Vycm9yTWVzc2FnZXMgUmV0dXJuIGFtYmlndW91cyBlcnJvciBtZXNzYWdlcyBmcm9tIGxvZ2luIGZhaWx1cmVzIHRvIHByZXZlbnQgdXNlciBlbnVtZXJhdGlvbi4gRGVmYXVsdHMgdG8gYHRydWVgLlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5iY3J5cHRSb3VuZHMgQWxsb3dzIG92ZXJyaWRlIG9mIG51bWJlciBvZiBiY3J5cHQgcm91bmRzIChha2Egd29yayBmYWN0b3IpIHVzZWQgdG8gc3RvcmUgcGFzc3dvcmRzLiBUaGUgZGVmYXVsdCBpcyAxMC5cbiAgICogQHBhcmFtIHtNb25nb0ZpZWxkU3BlY2lmaWVyfSBvcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yIFRvIGV4Y2x1ZGUgYnkgZGVmYXVsdCBsYXJnZSBjdXN0b20gZmllbGRzIGZyb20gYE1ldGVvci51c2VyKClgIGFuZCBgTWV0ZW9yLmZpbmRVc2VyQnkuLi4oKWAgZnVuY3Rpb25zIHdoZW4gY2FsbGVkIHdpdGhvdXQgYSBmaWVsZCBzZWxlY3RvciwgYW5kIGFsbCBgb25Mb2dpbmAsIGBvbkxvZ2luRmFpbHVyZWAgYW5kIGBvbkxvZ291dGAgY2FsbGJhY2tzLiAgRXhhbXBsZTogYEFjY291bnRzLmNvbmZpZyh7IGRlZmF1bHRGaWVsZFNlbGVjdG9yOiB7IG15QmlnQXJyYXk6IDAgfX0pYC4gQmV3YXJlIHdoZW4gdXNpbmcgdGhpcy4gSWYsIGZvciBpbnN0YW5jZSwgeW91IGRvIG5vdCBpbmNsdWRlIGBlbWFpbGAgd2hlbiBleGNsdWRpbmcgdGhlIGZpZWxkcywgeW91IGNhbiBoYXZlIHByb2JsZW1zIHdpdGggZnVuY3Rpb25zIGxpa2UgYGZvcmdvdFBhc3N3b3JkYCB0aGF0IHdpbGwgYnJlYWsgYmVjYXVzZSB0aGV5IHdvbid0IGhhdmUgdGhlIHJlcXVpcmVkIGRhdGEgYXZhaWxhYmxlLiBJdCdzIHJlY29tbWVuZCB0aGF0IHlvdSBhbHdheXMga2VlcCB0aGUgZmllbGRzIGBfaWRgLCBgdXNlcm5hbWVgLCBhbmQgYGVtYWlsYC5cbiAgICogQHBhcmFtIHtTdHJpbmd8TW9uZ28uQ29sbGVjdGlvbn0gb3B0aW9ucy5jb2xsZWN0aW9uIEEgY29sbGVjdGlvbiBuYW1lIG9yIGEgTW9uZ28uQ29sbGVjdGlvbiBvYmplY3QgdG8gaG9sZCB0aGUgdXNlcnMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLmxvZ2luVG9rZW5FeHBpcmF0aW9uSG91cnMgV2hlbiB1c2luZyB0aGUgcGFja2FnZSBgYWNjb3VudHMtMmZhYCwgdXNlIHRoaXMgdG8gc2V0IHRoZSBhbW91bnQgb2YgdGltZSBhIHRva2VuIHNlbnQgaXMgdmFsaWQuIEFzIGl0J3MganVzdCBhIG51bWJlciwgeW91IGNhbiB1c2UsIGZvciBleGFtcGxlLCAwLjUgdG8gbWFrZSB0aGUgdG9rZW4gdmFsaWQgZm9yIGp1c3QgaGFsZiBob3VyLiBUaGUgZGVmYXVsdCBpcyAxIGhvdXIuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLnRva2VuU2VxdWVuY2VMZW5ndGggV2hlbiB1c2luZyB0aGUgcGFja2FnZSBgYWNjb3VudHMtMmZhYCwgdXNlIHRoaXMgdG8gdGhlIHNpemUgb2YgdGhlIHRva2VuIHNlcXVlbmNlIGdlbmVyYXRlZC4gVGhlIGRlZmF1bHQgaXMgNi5cbiAgICogQHBhcmFtIHsnc2Vzc2lvbicgfCAnbG9jYWwnfSBvcHRpb25zLmNsaWVudFN0b3JhZ2UgQnkgZGVmYXVsdCBsb2dpbiBjcmVkZW50aWFscyBhcmUgc3RvcmVkIGluIGxvY2FsIHN0b3JhZ2UsIHNldHRpbmcgdGhpcyB0byB0cnVlIHdpbGwgc3dpdGNoIHRvIHVzaW5nIHNlc3Npb24gc3RvcmFnZS5cbiAgICovXG4gIGNvbmZpZyhvcHRpb25zKSB7XG4gICAgLy8gV2UgZG9uJ3Qgd2FudCB1c2VycyB0byBhY2NpZGVudGFsbHkgb25seSBjYWxsIEFjY291bnRzLmNvbmZpZyBvbiB0aGVcbiAgICAvLyBjbGllbnQsIHdoZXJlIHNvbWUgb2YgdGhlIG9wdGlvbnMgd2lsbCBoYXZlIHBhcnRpYWwgZWZmZWN0cyAoZWcgcmVtb3ZpbmdcbiAgICAvLyB0aGUgXCJjcmVhdGUgYWNjb3VudFwiIGJ1dHRvbiBmcm9tIGFjY291bnRzLXVpIGlmIGZvcmJpZENsaWVudEFjY291bnRDcmVhdGlvblxuICAgIC8vIGlzIHNldCwgb3IgcmVkaXJlY3RpbmcgR29vZ2xlIGxvZ2luIHRvIGEgc3BlY2lmaWMtZG9tYWluIHBhZ2UpIHdpdGhvdXRcbiAgICAvLyBoYXZpbmcgdGhlaXIgZnVsbCBlZmZlY3RzLlxuICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICAgIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uYWNjb3VudHNDb25maWdDYWxsZWQgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoIV9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uYWNjb3VudHNDb25maWdDYWxsZWQpIHtcbiAgICAgIC8vIFhYWCB3b3VsZCBiZSBuaWNlIHRvIFwiY3Jhc2hcIiB0aGUgY2xpZW50IGFuZCByZXBsYWNlIHRoZSBVSSB3aXRoIGFuIGVycm9yXG4gICAgICAvLyBtZXNzYWdlLCBidXQgdGhlcmUncyBubyB0cml2aWFsIHdheSB0byBkbyB0aGlzLlxuICAgICAgTWV0ZW9yLl9kZWJ1ZyhcbiAgICAgICAgJ0FjY291bnRzLmNvbmZpZyB3YXMgY2FsbGVkIG9uIHRoZSBjbGllbnQgYnV0IG5vdCBvbiB0aGUgJyArXG4gICAgICAgICAgJ3NlcnZlcjsgc29tZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgbWF5IG5vdCB0YWtlIGVmZmVjdC4nXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gdmFsaWRhdGUgdGhlIG9hdXRoU2VjcmV0S2V5IG9wdGlvbiBhdCB0aGUgdGltZVxuICAgIC8vIEFjY291bnRzLmNvbmZpZyBpcyBjYWxsZWQuIFdlIGFsc28gZGVsaWJlcmF0ZWx5IGRvbid0IHN0b3JlIHRoZVxuICAgIC8vIG9hdXRoU2VjcmV0S2V5IGluIEFjY291bnRzLl9vcHRpb25zLlxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3B0aW9ucywgJ29hdXRoU2VjcmV0S2V5JykpIHtcbiAgICAgIGlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdUaGUgb2F1dGhTZWNyZXRLZXkgb3B0aW9uIG1heSBvbmx5IGJlIHNwZWNpZmllZCBvbiB0aGUgc2VydmVyJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKCFQYWNrYWdlWydvYXV0aC1lbmNyeXB0aW9uJ10pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdUaGUgb2F1dGgtZW5jcnlwdGlvbiBwYWNrYWdlIG11c3QgYmUgbG9hZGVkIHRvIHNldCBvYXV0aFNlY3JldEtleSdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIFBhY2thZ2VbJ29hdXRoLWVuY3J5cHRpb24nXS5PQXV0aEVuY3J5cHRpb24ubG9hZEtleShcbiAgICAgICAgb3B0aW9ucy5vYXV0aFNlY3JldEtleVxuICAgICAgKTtcbiAgICAgIG9wdGlvbnMgPSB7IC4uLm9wdGlvbnMgfTtcbiAgICAgIGRlbGV0ZSBvcHRpb25zLm9hdXRoU2VjcmV0S2V5O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGNvbmZpZyBvcHRpb25zIGtleXNcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvcHRpb25zKSkge1xuICAgICAgaWYgKCFWQUxJRF9DT05GSUdfS0VZUy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEFjY291bnRzLmNvbmZpZzogSW52YWxpZCBrZXk6ICR7a2V5fWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNldCB2YWx1ZXMgaW4gQWNjb3VudHMuX29wdGlvbnNcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBWQUxJRF9DT05GSUdfS0VZUykge1xuICAgICAgaWYgKGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgIGlmIChrZXkgaW4gdGhpcy5fb3B0aW9ucykge1xuICAgICAgICAgIGlmIChrZXkgIT09ICdjb2xsZWN0aW9uJyAmJiAoTWV0ZW9yLmlzVGVzdCAmJiBrZXkgIT09ICdjbGllbnRTdG9yYWdlJykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoYENhbid0IHNldCBcXGAke2tleX1cXGAgbW9yZSB0aGFuIG9uY2VgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9uc1trZXldID0gb3B0aW9uc1trZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmNvbGxlY3Rpb24gJiYgb3B0aW9ucy5jb2xsZWN0aW9uICE9PSB0aGlzLnVzZXJzLl9uYW1lICYmIG9wdGlvbnMuY29sbGVjdGlvbiAhPT0gdGhpcy51c2Vycykge1xuICAgICAgdGhpcy51c2VycyA9IHRoaXMuX2luaXRpYWxpemVDb2xsZWN0aW9uKG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZWdpc3RlciBhIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBhZnRlciBhIGxvZ2luIGF0dGVtcHQgc3VjY2VlZHMuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2hlbiBsb2dpbiBpcyBzdWNjZXNzZnVsLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBjYWxsYmFjayByZWNlaXZlcyBhIHNpbmdsZSBvYmplY3QgdGhhdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGhvbGRzIGxvZ2luIGRldGFpbHMuIFRoaXMgb2JqZWN0IGNvbnRhaW5zIHRoZSBsb2dpblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCB0eXBlIChwYXNzd29yZCwgcmVzdW1lLCBldGMuKSBvbiBib3RoIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudCBhbmQgc2VydmVyLiBgb25Mb2dpbmAgY2FsbGJhY2tzIHJlZ2lzdGVyZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICBvbiB0aGUgc2VydmVyIGFsc28gcmVjZWl2ZSBleHRyYSBkYXRhLCBzdWNoXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgYXMgdXNlciBkZXRhaWxzLCBjb25uZWN0aW9uIGluZm9ybWF0aW9uLCBldGMuXG4gICAqL1xuICBvbkxvZ2luKGZ1bmMpIHtcbiAgICBsZXQgcmV0ID0gdGhpcy5fb25Mb2dpbkhvb2sucmVnaXN0ZXIoZnVuYyk7XG4gICAgLy8gY2FsbCB0aGUganVzdCByZWdpc3RlcmVkIGNhbGxiYWNrIGlmIGFscmVhZHkgbG9nZ2VkIGluXG4gICAgdGhpcy5fc3RhcnR1cENhbGxiYWNrKHJldC5jYWxsYmFjayk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZWdpc3RlciBhIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBhZnRlciBhIGxvZ2luIGF0dGVtcHQgZmFpbHMuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBjYWxsYmFjayB0byBiZSBjYWxsZWQgYWZ0ZXIgdGhlIGxvZ2luIGhhcyBmYWlsZWQuXG4gICAqL1xuICBvbkxvZ2luRmFpbHVyZShmdW5jKSB7XG4gICAgcmV0dXJuIHRoaXMuX29uTG9naW5GYWlsdXJlSG9vay5yZWdpc3RlcihmdW5jKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZWdpc3RlciBhIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBhZnRlciBhIGxvZ291dCBhdHRlbXB0IHN1Y2NlZWRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdoZW4gbG9nb3V0IGlzIHN1Y2Nlc3NmdWwuXG4gICAqL1xuICBvbkxvZ291dChmdW5jKSB7XG4gICAgcmV0dXJuIHRoaXMuX29uTG9nb3V0SG9vay5yZWdpc3RlcihmdW5jKTtcbiAgfVxuXG4gIF9pbml0Q29ubmVjdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCFNZXRlb3IuaXNDbGllbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUaGUgY29ubmVjdGlvbiB1c2VkIGJ5IHRoZSBBY2NvdW50cyBzeXN0ZW0uIFRoaXMgaXMgdGhlIGNvbm5lY3Rpb25cbiAgICAvLyB0aGF0IHdpbGwgZ2V0IGxvZ2dlZCBpbiBieSBNZXRlb3IubG9naW4oKSwgYW5kIHRoaXMgaXMgdGhlXG4gICAgLy8gY29ubmVjdGlvbiB3aG9zZSBsb2dpbiBzdGF0ZSB3aWxsIGJlIHJlZmxlY3RlZCBieSBNZXRlb3IudXNlcklkKCkuXG4gICAgLy9cbiAgICAvLyBJdCB3b3VsZCBiZSBtdWNoIHByZWZlcmFibGUgZm9yIHRoaXMgdG8gYmUgaW4gYWNjb3VudHNfY2xpZW50LmpzLFxuICAgIC8vIGJ1dCBpdCBoYXMgdG8gYmUgaGVyZSBiZWNhdXNlIGl0J3MgbmVlZGVkIHRvIGNyZWF0ZSB0aGVcbiAgICAvLyBNZXRlb3IudXNlcnMgY29sbGVjdGlvbi5cbiAgICBpZiAob3B0aW9ucy5jb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSBvcHRpb25zLmNvbm5lY3Rpb247XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmRkcFVybCkge1xuICAgICAgdGhpcy5jb25uZWN0aW9uID0gRERQLmNvbm5lY3Qob3B0aW9ucy5kZHBVcmwpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0eXBlb2YgX19tZXRlb3JfcnVudGltZV9jb25maWdfXyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uQUNDT1VOVFNfQ09OTkVDVElPTl9VUkxcbiAgICApIHtcbiAgICAgIC8vIFRlbXBvcmFyeSwgaW50ZXJuYWwgaG9vayB0byBhbGxvdyB0aGUgc2VydmVyIHRvIHBvaW50IHRoZSBjbGllbnRcbiAgICAgIC8vIHRvIGEgZGlmZmVyZW50IGF1dGhlbnRpY2F0aW9uIHNlcnZlci4gVGhpcyBpcyBmb3IgYSB2ZXJ5XG4gICAgICAvLyBwYXJ0aWN1bGFyIHVzZSBjYXNlIHRoYXQgY29tZXMgdXAgd2hlbiBpbXBsZW1lbnRpbmcgYSBvYXV0aFxuICAgICAgLy8gc2VydmVyLiBVbnN1cHBvcnRlZCBhbmQgbWF5IGdvIGF3YXkgYXQgYW55IHBvaW50IGluIHRpbWUuXG4gICAgICAvL1xuICAgICAgLy8gV2Ugd2lsbCBldmVudHVhbGx5IHByb3ZpZGUgYSBnZW5lcmFsIHdheSB0byB1c2UgYWNjb3VudC1iYXNlXG4gICAgICAvLyBhZ2FpbnN0IGFueSBERFAgY29ubmVjdGlvbiwgbm90IGp1c3Qgb25lIHNwZWNpYWwgb25lLlxuICAgICAgdGhpcy5jb25uZWN0aW9uID0gRERQLmNvbm5lY3QoXG4gICAgICAgIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uQUNDT1VOVFNfQ09OTkVDVElPTl9VUkxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9IE1ldGVvci5jb25uZWN0aW9uO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRUb2tlbkxpZmV0aW1lTXMoKSB7XG4gICAgLy8gV2hlbiBsb2dpbkV4cGlyYXRpb25JbkRheXMgaXMgc2V0IHRvIG51bGwsIHdlJ2xsIHVzZSBhIHJlYWxseSBoaWdoXG4gICAgLy8gbnVtYmVyIG9mIGRheXMgKExPR0lOX1VORVhQSVJBQkxFX1RPS0VOX0RBWVMpIHRvIHNpbXVsYXRlIGFuXG4gICAgLy8gdW5leHBpcmluZyB0b2tlbi5cbiAgICBjb25zdCBsb2dpbkV4cGlyYXRpb25JbkRheXMgPVxuICAgICAgdGhpcy5fb3B0aW9ucy5sb2dpbkV4cGlyYXRpb25JbkRheXMgPT09IG51bGxcbiAgICAgICAgPyBMT0dJTl9VTkVYUElSSU5HX1RPS0VOX0RBWVNcbiAgICAgICAgOiB0aGlzLl9vcHRpb25zLmxvZ2luRXhwaXJhdGlvbkluRGF5cztcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5fb3B0aW9ucy5sb2dpbkV4cGlyYXRpb24gfHxcbiAgICAgIChsb2dpbkV4cGlyYXRpb25JbkRheXMgfHwgREVGQVVMVF9MT0dJTl9FWFBJUkFUSU9OX0RBWVMpICogODY0MDAwMDBcbiAgICApO1xuICB9XG5cbiAgX2dldFBhc3N3b3JkUmVzZXRUb2tlbkxpZmV0aW1lTXMoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuX29wdGlvbnMucGFzc3dvcmRSZXNldFRva2VuRXhwaXJhdGlvbiB8fFxuICAgICAgKHRoaXMuX29wdGlvbnMucGFzc3dvcmRSZXNldFRva2VuRXhwaXJhdGlvbkluRGF5cyB8fFxuICAgICAgICBERUZBVUxUX1BBU1NXT1JEX1JFU0VUX1RPS0VOX0VYUElSQVRJT05fREFZUykgKiA4NjQwMDAwMFxuICAgICk7XG4gIH1cblxuICBfZ2V0UGFzc3dvcmRFbnJvbGxUb2tlbkxpZmV0aW1lTXMoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuX29wdGlvbnMucGFzc3dvcmRFbnJvbGxUb2tlbkV4cGlyYXRpb24gfHxcbiAgICAgICh0aGlzLl9vcHRpb25zLnBhc3N3b3JkRW5yb2xsVG9rZW5FeHBpcmF0aW9uSW5EYXlzIHx8XG4gICAgICAgIERFRkFVTFRfUEFTU1dPUkRfRU5ST0xMX1RPS0VOX0VYUElSQVRJT05fREFZUykgKiA4NjQwMDAwMFxuICAgICk7XG4gIH1cblxuICBfdG9rZW5FeHBpcmF0aW9uKHdoZW4pIHtcbiAgICAvLyBXZSBwYXNzIHdoZW4gdGhyb3VnaCB0aGUgRGF0ZSBjb25zdHJ1Y3RvciBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHk7XG4gICAgLy8gYHdoZW5gIHVzZWQgdG8gYmUgYSBudW1iZXIuXG4gICAgcmV0dXJuIG5ldyBEYXRlKG5ldyBEYXRlKHdoZW4pLmdldFRpbWUoKSArIHRoaXMuX2dldFRva2VuTGlmZXRpbWVNcygpKTtcbiAgfVxuXG4gIF90b2tlbkV4cGlyZXNTb29uKHdoZW4pIHtcbiAgICBsZXQgbWluTGlmZXRpbWVNcyA9IDAuMSAqIHRoaXMuX2dldFRva2VuTGlmZXRpbWVNcygpO1xuICAgIGNvbnN0IG1pbkxpZmV0aW1lQ2FwTXMgPSBNSU5fVE9LRU5fTElGRVRJTUVfQ0FQX1NFQ1MgKiAxMDAwO1xuICAgIGlmIChtaW5MaWZldGltZU1zID4gbWluTGlmZXRpbWVDYXBNcykge1xuICAgICAgbWluTGlmZXRpbWVNcyA9IG1pbkxpZmV0aW1lQ2FwTXM7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGF0ZSgpID4gbmV3IERhdGUod2hlbikgLSBtaW5MaWZldGltZU1zO1xuICB9XG5cbiAgLy8gTm8tb3Agb24gdGhlIHNlcnZlciwgb3ZlcnJpZGRlbiBvbiB0aGUgY2xpZW50LlxuICBfc3RhcnR1cENhbGxiYWNrKGNhbGxiYWNrKSB7fVxufVxuXG4vLyBOb3RlIHRoYXQgQWNjb3VudHMgaXMgZGVmaW5lZCBzZXBhcmF0ZWx5IGluIGFjY291bnRzX2NsaWVudC5qcyBhbmRcbi8vIGFjY291bnRzX3NlcnZlci5qcy5cblxuLyoqXG4gKiBAc3VtbWFyeSBHZXQgdGhlIGN1cnJlbnQgdXNlciBpZCwgb3IgYG51bGxgIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLiBBIHJlYWN0aXZlIGRhdGEgc291cmNlLlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gKi9cbk1ldGVvci51c2VySWQgPSAoKSA9PiBBY2NvdW50cy51c2VySWQoKTtcblxuLyoqXG4gKiBAc3VtbWFyeSBHZXQgdGhlIGN1cnJlbnQgdXNlciByZWNvcmQsIG9yIGBudWxsYCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbi4gQSByZWFjdGl2ZSBkYXRhIHNvdXJjZS5cbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtNb25nb0ZpZWxkU3BlY2lmaWVyfSBvcHRpb25zLmZpZWxkcyBEaWN0aW9uYXJ5IG9mIGZpZWxkcyB0byByZXR1cm4gb3IgZXhjbHVkZS5cbiAqL1xuTWV0ZW9yLnVzZXIgPSBvcHRpb25zID0+IEFjY291bnRzLnVzZXIob3B0aW9ucyk7XG5cbi8qKlxuICogQHN1bW1hcnkgR2V0IHRoZSBjdXJyZW50IHVzZXIgcmVjb3JkLCBvciBgbnVsbGAgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4uIEEgcmVhY3RpdmUgZGF0YSBzb3VyY2UuXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7TW9uZ29GaWVsZFNwZWNpZmllcn0gb3B0aW9ucy5maWVsZHMgRGljdGlvbmFyeSBvZiBmaWVsZHMgdG8gcmV0dXJuIG9yIGV4Y2x1ZGUuXG4gKi9cbk1ldGVvci51c2VyQXN5bmMgPSBvcHRpb25zID0+IEFjY291bnRzLnVzZXJBc3luYyhvcHRpb25zKTtcblxuLy8gaG93IGxvbmcgKGluIGRheXMpIHVudGlsIGEgbG9naW4gdG9rZW4gZXhwaXJlc1xuY29uc3QgREVGQVVMVF9MT0dJTl9FWFBJUkFUSU9OX0RBWVMgPSA5MDtcbi8vIGhvdyBsb25nIChpbiBkYXlzKSB1bnRpbCByZXNldCBwYXNzd29yZCB0b2tlbiBleHBpcmVzXG5jb25zdCBERUZBVUxUX1BBU1NXT1JEX1JFU0VUX1RPS0VOX0VYUElSQVRJT05fREFZUyA9IDM7XG4vLyBob3cgbG9uZyAoaW4gZGF5cykgdW50aWwgZW5yb2wgcGFzc3dvcmQgdG9rZW4gZXhwaXJlc1xuY29uc3QgREVGQVVMVF9QQVNTV09SRF9FTlJPTExfVE9LRU5fRVhQSVJBVElPTl9EQVlTID0gMzA7XG4vLyBDbGllbnRzIGRvbid0IHRyeSB0byBhdXRvLWxvZ2luIHdpdGggYSB0b2tlbiB0aGF0IGlzIGdvaW5nIHRvIGV4cGlyZSB3aXRoaW5cbi8vIC4xICogREVGQVVMVF9MT0dJTl9FWFBJUkFUSU9OX0RBWVMsIGNhcHBlZCBhdCBNSU5fVE9LRU5fTElGRVRJTUVfQ0FQX1NFQ1MuXG4vLyBUcmllcyB0byBhdm9pZCBhYnJ1cHQgZGlzY29ubmVjdHMgZnJvbSBleHBpcmluZyB0b2tlbnMuXG5jb25zdCBNSU5fVE9LRU5fTElGRVRJTUVfQ0FQX1NFQ1MgPSAzNjAwOyAvLyBvbmUgaG91clxuLy8gaG93IG9mdGVuIChpbiBtaWxsaXNlY29uZHMpIHdlIGNoZWNrIGZvciBleHBpcmVkIHRva2Vuc1xuZXhwb3J0IGNvbnN0IEVYUElSRV9UT0tFTlNfSU5URVJWQUxfTVMgPSA2MDAgKiAxMDAwOyAvLyAxMCBtaW51dGVzXG4vLyBBIGxhcmdlIG51bWJlciBvZiBleHBpcmF0aW9uIGRheXMgKGFwcHJveGltYXRlbHkgMTAwIHllYXJzIHdvcnRoKSB0aGF0IGlzXG4vLyB1c2VkIHdoZW4gY3JlYXRpbmcgdW5leHBpcmluZyB0b2tlbnMuXG5jb25zdCBMT0dJTl9VTkVYUElSSU5HX1RPS0VOX0RBWVMgPSAzNjUgKiAxMDA7XG4iLCJpbXBvcnQgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7XG4gIEFjY291bnRzQ29tbW9uLFxuICBFWFBJUkVfVE9LRU5TX0lOVEVSVkFMX01TLFxufSBmcm9tICcuL2FjY291bnRzX2NvbW1vbi5qcyc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdtZXRlb3IvdXJsJztcblxuY29uc3QgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLy8gWFhYIG1heWJlIHRoaXMgYmVsb25ncyBpbiB0aGUgY2hlY2sgcGFja2FnZVxuY29uc3QgTm9uRW1wdHlTdHJpbmcgPSBNYXRjaC5XaGVyZSh4ID0+IHtcbiAgY2hlY2soeCwgU3RyaW5nKTtcbiAgcmV0dXJuIHgubGVuZ3RoID4gMDtcbn0pO1xuXG5cbi8qKlxuICogQHN1bW1hcnkgQ29uc3RydWN0b3IgZm9yIHRoZSBgQWNjb3VudHNgIG5hbWVzcGFjZSBvbiB0aGUgc2VydmVyLlxuICogQGxvY3VzIFNlcnZlclxuICogQGNsYXNzIEFjY291bnRzU2VydmVyXG4gKiBAZXh0ZW5kcyBBY2NvdW50c0NvbW1vblxuICogQGluc3RhbmNlbmFtZSBhY2NvdW50c1NlcnZlclxuICogQHBhcmFtIHtPYmplY3R9IHNlcnZlciBBIHNlcnZlciBvYmplY3Qgc3VjaCBhcyBgTWV0ZW9yLnNlcnZlcmAuXG4gKi9cbmV4cG9ydCBjbGFzcyBBY2NvdW50c1NlcnZlciBleHRlbmRzIEFjY291bnRzQ29tbW9uIHtcbiAgLy8gTm90ZSB0aGF0IHRoaXMgY29uc3RydWN0b3IgaXMgbGVzcyBsaWtlbHkgdG8gYmUgaW5zdGFudGlhdGVkIG11bHRpcGxlXG4gIC8vIHRpbWVzIHRoYW4gdGhlIGBBY2NvdW50c0NsaWVudGAgY29uc3RydWN0b3IsIGJlY2F1c2UgYSBzaW5nbGUgc2VydmVyXG4gIC8vIGNhbiBwcm92aWRlIG9ubHkgb25lIHNldCBvZiBtZXRob2RzLlxuICBjb25zdHJ1Y3RvcihzZXJ2ZXIsIG9wdGlvbnMpIHtcbiAgICBzdXBlcihvcHRpb25zIHx8IHt9KTtcblxuICAgIHRoaXMuX3NlcnZlciA9IHNlcnZlciB8fCBNZXRlb3Iuc2VydmVyO1xuICAgIC8vIFNldCB1cCB0aGUgc2VydmVyJ3MgbWV0aG9kcywgYXMgaWYgYnkgY2FsbGluZyBNZXRlb3IubWV0aG9kcy5cbiAgICB0aGlzLl9pbml0U2VydmVyTWV0aG9kcygpO1xuXG4gICAgdGhpcy5faW5pdEFjY291bnREYXRhSG9va3MoKTtcblxuICAgIC8vIElmIGF1dG9wdWJsaXNoIGlzIG9uLCBwdWJsaXNoIHRoZXNlIHVzZXIgZmllbGRzLiBMb2dpbiBzZXJ2aWNlXG4gICAgLy8gcGFja2FnZXMgKGVnIGFjY291bnRzLWdvb2dsZSkgYWRkIHRvIHRoZXNlIGJ5IGNhbGxpbmdcbiAgICAvLyBhZGRBdXRvcHVibGlzaEZpZWxkcy4gIE5vdGFibHksIHRoaXMgaXNuJ3QgaW1wbGVtZW50ZWQgd2l0aCBtdWx0aXBsZVxuICAgIC8vIHB1Ymxpc2hlcyBzaW5jZSBERFAgb25seSBtZXJnZXMgb25seSBhY3Jvc3MgdG9wLWxldmVsIGZpZWxkcywgbm90XG4gICAgLy8gc3ViZmllbGRzIChzdWNoIGFzICdzZXJ2aWNlcy5mYWNlYm9vay5hY2Nlc3NUb2tlbicpXG4gICAgdGhpcy5fYXV0b3B1Ymxpc2hGaWVsZHMgPSB7XG4gICAgICBsb2dnZWRJblVzZXI6IFsncHJvZmlsZScsICd1c2VybmFtZScsICdlbWFpbHMnXSxcbiAgICAgIG90aGVyVXNlcnM6IFsncHJvZmlsZScsICd1c2VybmFtZSddXG4gICAgfTtcblxuICAgIC8vIHVzZSBvYmplY3QgdG8ga2VlcCB0aGUgcmVmZXJlbmNlIHdoZW4gdXNlZCBpbiBmdW5jdGlvbnNcbiAgICAvLyB3aGVyZSBfZGVmYXVsdFB1Ymxpc2hGaWVsZHMgaXMgZGVzdHJ1Y3R1cmVkIGludG8gbGV4aWNhbCBzY29wZVxuICAgIC8vIGZvciBwdWJsaXNoIGNhbGxiYWNrcyB0aGF0IG5lZWQgYHRoaXNgXG4gICAgdGhpcy5fZGVmYXVsdFB1Ymxpc2hGaWVsZHMgPSB7XG4gICAgICBwcm9qZWN0aW9uOiB7XG4gICAgICAgIHByb2ZpbGU6IDEsXG4gICAgICAgIHVzZXJuYW1lOiAxLFxuICAgICAgICBlbWFpbHM6IDEsXG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuX2luaXRTZXJ2ZXJQdWJsaWNhdGlvbnMoKTtcblxuICAgIC8vIGNvbm5lY3Rpb25JZCAtPiB7Y29ubmVjdGlvbiwgbG9naW5Ub2tlbn1cbiAgICB0aGlzLl9hY2NvdW50RGF0YSA9IHt9O1xuXG4gICAgLy8gY29ubmVjdGlvbiBpZCAtPiBvYnNlcnZlIGhhbmRsZSBmb3IgdGhlIGxvZ2luIHRva2VuIHRoYXQgdGhpcyBjb25uZWN0aW9uIGlzXG4gICAgLy8gY3VycmVudGx5IGFzc29jaWF0ZWQgd2l0aCwgb3IgYSBudW1iZXIuIFRoZSBudW1iZXIgaW5kaWNhdGVzIHRoYXQgd2UgYXJlIGluXG4gICAgLy8gdGhlIHByb2Nlc3Mgb2Ygc2V0dGluZyB1cCB0aGUgb2JzZXJ2ZSAodXNpbmcgYSBudW1iZXIgaW5zdGVhZCBvZiBhIHNpbmdsZVxuICAgIC8vIHNlbnRpbmVsIGFsbG93cyBtdWx0aXBsZSBhdHRlbXB0cyB0byBzZXQgdXAgdGhlIG9ic2VydmUgdG8gaWRlbnRpZnkgd2hpY2hcbiAgICAvLyBvbmUgd2FzIHRoZWlycykuXG4gICAgdGhpcy5fdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnMgPSB7fTtcbiAgICB0aGlzLl9uZXh0VXNlck9ic2VydmVOdW1iZXIgPSAxOyAgLy8gZm9yIHRoZSBudW1iZXIgZGVzY3JpYmVkIGFib3ZlLlxuXG4gICAgLy8gbGlzdCBvZiBhbGwgcmVnaXN0ZXJlZCBoYW5kbGVycy5cbiAgICB0aGlzLl9sb2dpbkhhbmRsZXJzID0gW107XG4gICAgc2V0dXBEZWZhdWx0TG9naW5IYW5kbGVycyh0aGlzKTtcbiAgICBzZXRFeHBpcmVUb2tlbnNJbnRlcnZhbCh0aGlzKTtcblxuICAgIHRoaXMuX3ZhbGlkYXRlTG9naW5Ib29rID0gbmV3IEhvb2soeyBiaW5kRW52aXJvbm1lbnQ6IGZhbHNlIH0pO1xuICAgIHRoaXMuX3ZhbGlkYXRlTmV3VXNlckhvb2tzID0gW1xuICAgICAgZGVmYXVsdFZhbGlkYXRlTmV3VXNlckhvb2suYmluZCh0aGlzKVxuICAgIF07XG5cbiAgICB0aGlzLl9kZWxldGVTYXZlZFRva2Vuc0ZvckFsbFVzZXJzT25TdGFydHVwKCk7XG5cbiAgICB0aGlzLl9za2lwQ2FzZUluc2Vuc2l0aXZlQ2hlY2tzRm9yVGVzdCA9IHt9O1xuXG4gICAgdGhpcy51cmxzID0ge1xuICAgICAgcmVzZXRQYXNzd29yZDogKHRva2VuLCBleHRyYVBhcmFtcykgPT4gdGhpcy5idWlsZEVtYWlsVXJsKGAjL3Jlc2V0LXBhc3N3b3JkLyR7dG9rZW59YCwgZXh0cmFQYXJhbXMpLFxuICAgICAgdmVyaWZ5RW1haWw6ICh0b2tlbiwgZXh0cmFQYXJhbXMpID0+IHRoaXMuYnVpbGRFbWFpbFVybChgIy92ZXJpZnktZW1haWwvJHt0b2tlbn1gLCBleHRyYVBhcmFtcyksXG4gICAgICBsb2dpblRva2VuOiAoc2VsZWN0b3IsIHRva2VuLCBleHRyYVBhcmFtcykgPT5cbiAgICAgICAgdGhpcy5idWlsZEVtYWlsVXJsKGAvP2xvZ2luVG9rZW49JHt0b2tlbn0mc2VsZWN0b3I9JHtzZWxlY3Rvcn1gLCBleHRyYVBhcmFtcyksXG4gICAgICBlbnJvbGxBY2NvdW50OiAodG9rZW4sIGV4dHJhUGFyYW1zKSA9PiB0aGlzLmJ1aWxkRW1haWxVcmwoYCMvZW5yb2xsLWFjY291bnQvJHt0b2tlbn1gLCBleHRyYVBhcmFtcyksXG4gICAgfTtcblxuICAgIHRoaXMuYWRkRGVmYXVsdFJhdGVMaW1pdCgpO1xuXG4gICAgdGhpcy5idWlsZEVtYWlsVXJsID0gKHBhdGgsIGV4dHJhUGFyYW1zID0ge30pID0+IHtcbiAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoTWV0ZW9yLmFic29sdXRlVXJsKHBhdGgpKTtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IE9iamVjdC5lbnRyaWVzKGV4dHJhUGFyYW1zKTtcbiAgICAgIGlmIChwYXJhbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBBZGQgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIHRvIHRoZSB1cmxcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgcGFyYW1zKSB7XG4gICAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB1cmwudG9TdHJpbmcoKTtcbiAgICB9O1xuICB9XG5cbiAgLy8vXG4gIC8vLyBDVVJSRU5UIFVTRVJcbiAgLy8vXG5cbiAgLy8gQG92ZXJyaWRlIG9mIFwiYWJzdHJhY3RcIiBub24taW1wbGVtZW50YXRpb24gaW4gYWNjb3VudHNfY29tbW9uLmpzXG4gIHVzZXJJZCgpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIG9ubHkgd29ya3MgaWYgY2FsbGVkIGluc2lkZSBhIG1ldGhvZCBvciBhIHB1YmljYXRpb24uXG4gICAgLy8gVXNpbmcgYW55IG9mIHRoZSBpbmZvcm1hdGlvbiBmcm9tIE1ldGVvci51c2VyKCkgaW4gYSBtZXRob2Qgb3JcbiAgICAvLyBwdWJsaXNoIGZ1bmN0aW9uIHdpbGwgYWx3YXlzIHVzZSB0aGUgdmFsdWUgZnJvbSB3aGVuIHRoZSBmdW5jdGlvbiBmaXJzdFxuICAgIC8vIHJ1bnMuIFRoaXMgaXMgbGlrZWx5IG5vdCB3aGF0IHRoZSB1c2VyIGV4cGVjdHMuIFRoZSB3YXkgdG8gbWFrZSB0aGlzIHdvcmtcbiAgICAvLyBpbiBhIG1ldGhvZCBvciBwdWJsaXNoIGZ1bmN0aW9uIGlzIHRvIGRvIE1ldGVvci5maW5kKHRoaXMudXNlcklkKS5vYnNlcnZlXG4gICAgLy8gYW5kIHJlY29tcHV0ZSB3aGVuIHRoZSB1c2VyIHJlY29yZCBjaGFuZ2VzLlxuICAgIGNvbnN0IGN1cnJlbnRJbnZvY2F0aW9uID0gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi5nZXQoKSB8fCBERFAuX0N1cnJlbnRQdWJsaWNhdGlvbkludm9jYXRpb24uZ2V0KCk7XG4gICAgaWYgKCFjdXJyZW50SW52b2NhdGlvbilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGVvci51c2VySWQgY2FuIG9ubHkgYmUgaW52b2tlZCBpbiBtZXRob2QgY2FsbHMgb3IgcHVibGljYXRpb25zLlwiKTtcbiAgICByZXR1cm4gY3VycmVudEludm9jYXRpb24udXNlcklkO1xuICB9XG5cbiAgYXN5bmMgaW5pdCgpIHtcbiAgICBhd2FpdCBzZXR1cFVzZXJzQ29sbGVjdGlvbih0aGlzLnVzZXJzKTtcbiAgfVxuXG4gIC8vL1xuICAvLy8gTE9HSU4gSE9PS1NcbiAgLy8vXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFZhbGlkYXRlIGxvZ2luIGF0dGVtcHRzLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgQ2FsbGVkIHdoZW5ldmVyIGEgbG9naW4gaXMgYXR0ZW1wdGVkIChlaXRoZXIgc3VjY2Vzc2Z1bCBvciB1bnN1Y2Nlc3NmdWwpLiAgQSBsb2dpbiBjYW4gYmUgYWJvcnRlZCBieSByZXR1cm5pbmcgYSBmYWxzeSB2YWx1ZSBvciB0aHJvd2luZyBhbiBleGNlcHRpb24uXG4gICAqL1xuICB2YWxpZGF0ZUxvZ2luQXR0ZW1wdChmdW5jKSB7XG4gICAgLy8gRXhjZXB0aW9ucyBpbnNpZGUgdGhlIGhvb2sgY2FsbGJhY2sgYXJlIHBhc3NlZCB1cCB0byB1cy5cbiAgICByZXR1cm4gdGhpcy5fdmFsaWRhdGVMb2dpbkhvb2sucmVnaXN0ZXIoZnVuYyk7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgU2V0IHJlc3RyaWN0aW9ucyBvbiBuZXcgdXNlciBjcmVhdGlvbi5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIENhbGxlZCB3aGVuZXZlciBhIG5ldyB1c2VyIGlzIGNyZWF0ZWQuIFRha2VzIHRoZSBuZXcgdXNlciBvYmplY3QsIGFuZCByZXR1cm5zIHRydWUgdG8gYWxsb3cgdGhlIGNyZWF0aW9uIG9yIGZhbHNlIHRvIGFib3J0LlxuICAgKi9cbiAgdmFsaWRhdGVOZXdVc2VyKGZ1bmMpIHtcbiAgICB0aGlzLl92YWxpZGF0ZU5ld1VzZXJIb29rcy5wdXNoKGZ1bmMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFZhbGlkYXRlIGxvZ2luIGZyb20gZXh0ZXJuYWwgc2VydmljZVxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgQ2FsbGVkIHdoZW5ldmVyIGxvZ2luL3VzZXIgY3JlYXRpb24gZnJvbSBleHRlcm5hbCBzZXJ2aWNlIGlzIGF0dGVtcHRlZC4gTG9naW4gb3IgdXNlciBjcmVhdGlvbiBiYXNlZCBvbiB0aGlzIGxvZ2luIGNhbiBiZSBhYm9ydGVkIGJ5IHBhc3NpbmcgYSBmYWxzeSB2YWx1ZSBvciB0aHJvd2luZyBhbiBleGNlcHRpb24uXG4gICAqL1xuICBiZWZvcmVFeHRlcm5hbExvZ2luKGZ1bmMpIHtcbiAgICBpZiAodGhpcy5fYmVmb3JlRXh0ZXJuYWxMb2dpbkhvb2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBvbmx5IGNhbGwgYmVmb3JlRXh0ZXJuYWxMb2dpbiBvbmNlXCIpO1xuICAgIH1cblxuICAgIHRoaXMuX2JlZm9yZUV4dGVybmFsTG9naW5Ib29rID0gZnVuYztcbiAgfVxuXG4gIC8vL1xuICAvLy8gQ1JFQVRFIFVTRVIgSE9PS1NcbiAgLy8vXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEN1c3RvbWl6ZSBsb2dpbiB0b2tlbiBjcmVhdGlvbi5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIENhbGxlZCB3aGVuZXZlciBhIG5ldyB0b2tlbiBpcyBjcmVhdGVkLlxuICAgKiBSZXR1cm4gdGhlIHNlcXVlbmNlIGFuZCB0aGUgdXNlciBvYmplY3QuIFJldHVybiB0cnVlIHRvIGtlZXAgc2VuZGluZyB0aGUgZGVmYXVsdCBlbWFpbCwgb3IgZmFsc2UgdG8gb3ZlcnJpZGUgdGhlIGJlaGF2aW9yLlxuICAgKi9cbiAgb25DcmVhdGVMb2dpblRva2VuID0gZnVuY3Rpb24oZnVuYykge1xuICAgIGlmICh0aGlzLl9vbkNyZWF0ZUxvZ2luVG9rZW5Ib29rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBvbmx5IGNhbGwgb25DcmVhdGVMb2dpblRva2VuIG9uY2UnKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vbkNyZWF0ZUxvZ2luVG9rZW5Ib29rID0gZnVuYztcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDdXN0b21pemUgbmV3IHVzZXIgY3JlYXRpb24uXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBDYWxsZWQgd2hlbmV2ZXIgYSBuZXcgdXNlciBpcyBjcmVhdGVkLiBSZXR1cm4gdGhlIG5ldyB1c2VyIG9iamVjdCwgb3IgdGhyb3cgYW4gYEVycm9yYCB0byBhYm9ydCB0aGUgY3JlYXRpb24uXG4gICAqL1xuICBvbkNyZWF0ZVVzZXIoZnVuYykge1xuICAgIGlmICh0aGlzLl9vbkNyZWF0ZVVzZXJIb29rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gb25seSBjYWxsIG9uQ3JlYXRlVXNlciBvbmNlXCIpO1xuICAgIH1cblxuICAgIHRoaXMuX29uQ3JlYXRlVXNlckhvb2sgPSBNZXRlb3Iud3JhcEZuKGZ1bmMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEN1c3RvbWl6ZSBvYXV0aCB1c2VyIHByb2ZpbGUgdXBkYXRlc1xuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgQ2FsbGVkIHdoZW5ldmVyIGEgdXNlciBpcyBsb2dnZWQgaW4gdmlhIG9hdXRoLiBSZXR1cm4gdGhlIHByb2ZpbGUgb2JqZWN0IHRvIGJlIG1lcmdlZCwgb3IgdGhyb3cgYW4gYEVycm9yYCB0byBhYm9ydCB0aGUgY3JlYXRpb24uXG4gICAqL1xuICBvbkV4dGVybmFsTG9naW4oZnVuYykge1xuICAgIGlmICh0aGlzLl9vbkV4dGVybmFsTG9naW5Ib29rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gb25seSBjYWxsIG9uRXh0ZXJuYWxMb2dpbiBvbmNlXCIpO1xuICAgIH1cblxuICAgIHRoaXMuX29uRXh0ZXJuYWxMb2dpbkhvb2sgPSBmdW5jO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEN1c3RvbWl6ZSB1c2VyIHNlbGVjdGlvbiBvbiBleHRlcm5hbCBsb2dpbnNcbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIENhbGxlZCB3aGVuZXZlciBhIHVzZXIgaXMgbG9nZ2VkIGluIHZpYSBvYXV0aCBhbmQgYVxuICAgKiB1c2VyIGlzIG5vdCBmb3VuZCB3aXRoIHRoZSBzZXJ2aWNlIGlkLiBSZXR1cm4gdGhlIHVzZXIgb3IgdW5kZWZpbmVkLlxuICAgKi9cbiAgc2V0QWRkaXRpb25hbEZpbmRVc2VyT25FeHRlcm5hbExvZ2luKGZ1bmMpIHtcbiAgICBpZiAodGhpcy5fYWRkaXRpb25hbEZpbmRVc2VyT25FeHRlcm5hbExvZ2luKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gb25seSBjYWxsIHNldEFkZGl0aW9uYWxGaW5kVXNlck9uRXh0ZXJuYWxMb2dpbiBvbmNlXCIpO1xuICAgIH1cbiAgICB0aGlzLl9hZGRpdGlvbmFsRmluZFVzZXJPbkV4dGVybmFsTG9naW4gPSBmdW5jO1xuICB9XG5cbiAgYXN5bmMgX3ZhbGlkYXRlTG9naW4oY29ubmVjdGlvbiwgYXR0ZW1wdCkge1xuICAgIGF3YWl0IHRoaXMuX3ZhbGlkYXRlTG9naW5Ib29rLmZvckVhY2hBc3luYyhhc3luYyAoY2FsbGJhY2spID0+IHtcbiAgICAgIGxldCByZXQ7XG4gICAgICB0cnkge1xuICAgICAgICByZXQgPSBhd2FpdCBjYWxsYmFjayhjbG9uZUF0dGVtcHRXaXRoQ29ubmVjdGlvbihjb25uZWN0aW9uLCBhdHRlbXB0KSk7XG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICBhdHRlbXB0LmFsbG93ZWQgPSBmYWxzZTtcbiAgICAgICAgLy8gWFhYIHRoaXMgbWVhbnMgdGhlIGxhc3QgdGhyb3duIGVycm9yIG92ZXJyaWRlcyBwcmV2aW91cyBlcnJvclxuICAgICAgICAvLyBtZXNzYWdlcy4gTWF5YmUgdGhpcyBpcyBzdXJwcmlzaW5nIHRvIHVzZXJzIGFuZCB3ZSBzaG91bGQgbWFrZVxuICAgICAgICAvLyBvdmVycmlkaW5nIGVycm9ycyBtb3JlIGV4cGxpY2l0LiAoc2VlXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2lzc3Vlcy8xOTYwKVxuICAgICAgICBhdHRlbXB0LmVycm9yID0gZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoISByZXQpIHtcbiAgICAgICAgYXR0ZW1wdC5hbGxvd2VkID0gZmFsc2U7XG4gICAgICAgIC8vIGRvbid0IG92ZXJyaWRlIGEgc3BlY2lmaWMgZXJyb3IgcHJvdmlkZWQgYnkgYSBwcmV2aW91c1xuICAgICAgICAvLyB2YWxpZGF0b3Igb3IgdGhlIGluaXRpYWwgYXR0ZW1wdCAoZWcgXCJpbmNvcnJlY3QgcGFzc3dvcmRcIikuXG4gICAgICAgIGlmICghYXR0ZW1wdC5lcnJvcilcbiAgICAgICAgICBhdHRlbXB0LmVycm9yID0gbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiTG9naW4gZm9yYmlkZGVuXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH07XG5cbiAgYXN5bmMgX3N1Y2Nlc3NmdWxMb2dpbihjb25uZWN0aW9uLCBhdHRlbXB0KSB7XG4gICAgYXdhaXQgdGhpcy5fb25Mb2dpbkhvb2suZm9yRWFjaEFzeW5jKGFzeW5jIChjYWxsYmFjaykgPT4ge1xuICAgICAgYXdhaXQgY2FsbGJhY2soY2xvbmVBdHRlbXB0V2l0aENvbm5lY3Rpb24oY29ubmVjdGlvbiwgYXR0ZW1wdCkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH07XG5cbiAgYXN5bmMgX2ZhaWxlZExvZ2luKGNvbm5lY3Rpb24sIGF0dGVtcHQpIHtcbiAgICBhd2FpdCB0aGlzLl9vbkxvZ2luRmFpbHVyZUhvb2suZm9yRWFjaEFzeW5jKGFzeW5jIChjYWxsYmFjaykgPT4ge1xuICAgICAgYXdhaXQgY2FsbGJhY2soY2xvbmVBdHRlbXB0V2l0aENvbm5lY3Rpb24oY29ubmVjdGlvbiwgYXR0ZW1wdCkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH07XG5cbiAgYXN5bmMgX3N1Y2Nlc3NmdWxMb2dvdXQoY29ubmVjdGlvbiwgdXNlcklkKSB7XG4gICAgLy8gZG9uJ3QgZmV0Y2ggdGhlIHVzZXIgb2JqZWN0IHVubGVzcyB0aGVyZSBhcmUgc29tZSBjYWxsYmFja3MgcmVnaXN0ZXJlZFxuICAgIGxldCB1c2VyO1xuICAgIGF3YWl0IHRoaXMuX29uTG9nb3V0SG9vay5mb3JFYWNoQXN5bmMoYXN5bmMgY2FsbGJhY2sgPT4ge1xuICAgICAgaWYgKCF1c2VyICYmIHVzZXJJZCkgdXNlciA9IGF3YWl0IHRoaXMudXNlcnMuZmluZE9uZUFzeW5jKHVzZXJJZCwgeyBmaWVsZHM6IHRoaXMuX29wdGlvbnMuZGVmYXVsdEZpZWxkU2VsZWN0b3IgfSk7XG4gICAgICBjYWxsYmFjayh7IHVzZXIsIGNvbm5lY3Rpb24gfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZXMgYSBNb25nb0RCIHNlbGVjdG9yIHRoYXQgY2FuIGJlIHVzZWQgdG8gcGVyZm9ybSBhIGZhc3QgY2FzZVxuICAvLyBpbnNlbnNpdGl2ZSBsb29rdXAgZm9yIHRoZSBnaXZlbiBmaWVsZE5hbWUgYW5kIHN0cmluZy4gU2luY2UgTW9uZ29EQiBkb2VzXG4gIC8vIG5vdCBzdXBwb3J0IGNhc2UgaW5zZW5zaXRpdmUgaW5kZXhlcywgYW5kIGNhc2UgaW5zZW5zaXRpdmUgcmVnZXggcXVlcmllc1xuICAvLyBhcmUgc2xvdywgd2UgY29uc3RydWN0IGEgc2V0IG9mIHByZWZpeCBzZWxlY3RvcnMgZm9yIGFsbCBwZXJtdXRhdGlvbnMgb2ZcbiAgLy8gdGhlIGZpcnN0IDQgY2hhcmFjdGVycyBvdXJzZWx2ZXMuIFdlIGZpcnN0IGF0dGVtcHQgdG8gbWF0Y2hpbmcgYWdhaW5zdFxuICAvLyB0aGVzZSwgYW5kIGJlY2F1c2UgJ3ByZWZpeCBleHByZXNzaW9uJyByZWdleCBxdWVyaWVzIGRvIHVzZSBpbmRleGVzIChzZWVcbiAgLy8gaHR0cDovL2RvY3MubW9uZ29kYi5vcmcvdjIuNi9yZWZlcmVuY2Uvb3BlcmF0b3IvcXVlcnkvcmVnZXgvI2luZGV4LXVzZSksXG4gIC8vIHRoaXMgaGFzIGJlZW4gZm91bmQgdG8gZ3JlYXRseSBpbXByb3ZlIHBlcmZvcm1hbmNlIChmcm9tIDEyMDBtcyB0byA1bXMgaW4gYVxuICAvLyB0ZXN0IHdpdGggMS4wMDAuMDAwIHVzZXJzKS5cbiAgX3NlbGVjdG9yRm9yRmFzdENhc2VJbnNlbnNpdGl2ZUxvb2t1cCA9IChmaWVsZE5hbWUsIHN0cmluZykgPT4ge1xuICAgIC8vIFBlcmZvcm1hbmNlIHNlZW1zIHRvIGltcHJvdmUgdXAgdG8gNCBwcmVmaXggY2hhcmFjdGVyc1xuICAgIGNvbnN0IHByZWZpeCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgTWF0aC5taW4oc3RyaW5nLmxlbmd0aCwgNCkpO1xuICAgIGNvbnN0IG9yQ2xhdXNlID0gZ2VuZXJhdGVDYXNlUGVybXV0YXRpb25zRm9yU3RyaW5nKHByZWZpeCkubWFwKFxuICAgICAgICBwcmVmaXhQZXJtdXRhdGlvbiA9PiB7XG4gICAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSB7fTtcbiAgICAgICAgICBzZWxlY3RvcltmaWVsZE5hbWVdID1cbiAgICAgICAgICAgICAgbmV3IFJlZ0V4cChgXiR7TWV0ZW9yLl9lc2NhcGVSZWdFeHAocHJlZml4UGVybXV0YXRpb24pfWApO1xuICAgICAgICAgIHJldHVybiBzZWxlY3RvcjtcbiAgICAgICAgfSk7XG4gICAgY29uc3QgY2FzZUluc2Vuc2l0aXZlQ2xhdXNlID0ge307XG4gICAgY2FzZUluc2Vuc2l0aXZlQ2xhdXNlW2ZpZWxkTmFtZV0gPVxuICAgICAgICBuZXcgUmVnRXhwKGBeJHtNZXRlb3IuX2VzY2FwZVJlZ0V4cChzdHJpbmcpfSRgLCAnaScpXG4gICAgcmV0dXJuIHskYW5kOiBbeyRvcjogb3JDbGF1c2V9LCBjYXNlSW5zZW5zaXRpdmVDbGF1c2VdfTtcbiAgfVxuXG4gIF9maW5kVXNlckJ5UXVlcnkgPSBhc3luYyAocXVlcnksIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgdXNlciA9IG51bGw7XG5cbiAgICBpZiAocXVlcnkuaWQpIHtcbiAgICAgIC8vIGRlZmF1bHQgZmllbGQgc2VsZWN0b3IgaXMgYWRkZWQgd2l0aGluIGdldFVzZXJCeUlkKClcbiAgICAgIHVzZXIgPSBhd2FpdCBNZXRlb3IudXNlcnMuZmluZE9uZUFzeW5jKHF1ZXJ5LmlkLCB0aGlzLl9hZGREZWZhdWx0RmllbGRTZWxlY3RvcihvcHRpb25zKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMgPSB0aGlzLl9hZGREZWZhdWx0RmllbGRTZWxlY3RvcihvcHRpb25zKTtcbiAgICAgIGxldCBmaWVsZE5hbWU7XG4gICAgICBsZXQgZmllbGRWYWx1ZTtcbiAgICAgIGlmIChxdWVyeS51c2VybmFtZSkge1xuICAgICAgICBmaWVsZE5hbWUgPSAndXNlcm5hbWUnO1xuICAgICAgICBmaWVsZFZhbHVlID0gcXVlcnkudXNlcm5hbWU7XG4gICAgICB9IGVsc2UgaWYgKHF1ZXJ5LmVtYWlsKSB7XG4gICAgICAgIGZpZWxkTmFtZSA9ICdlbWFpbHMuYWRkcmVzcyc7XG4gICAgICAgIGZpZWxkVmFsdWUgPSBxdWVyeS5lbWFpbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInNob3VsZG4ndCBoYXBwZW4gKHZhbGlkYXRpb24gbWlzc2VkIHNvbWV0aGluZylcIik7XG4gICAgICB9XG4gICAgICBsZXQgc2VsZWN0b3IgPSB7fTtcbiAgICAgIHNlbGVjdG9yW2ZpZWxkTmFtZV0gPSBmaWVsZFZhbHVlO1xuICAgICAgdXNlciA9IGF3YWl0IE1ldGVvci51c2Vycy5maW5kT25lQXN5bmMoc2VsZWN0b3IsIG9wdGlvbnMpO1xuICAgICAgLy8gSWYgdXNlciBpcyBub3QgZm91bmQsIHRyeSBhIGNhc2UgaW5zZW5zaXRpdmUgbG9va3VwXG4gICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgc2VsZWN0b3IgPSB0aGlzLl9zZWxlY3RvckZvckZhc3RDYXNlSW5zZW5zaXRpdmVMb29rdXAoZmllbGROYW1lLCBmaWVsZFZhbHVlKTtcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlVXNlcnMgPSBhd2FpdCBNZXRlb3IudXNlcnMuZmluZChzZWxlY3RvciwgeyAuLi5vcHRpb25zLCBsaW1pdDogMiB9KS5mZXRjaEFzeW5jKCk7XG4gICAgICAgIC8vIE5vIG1hdGNoIGlmIG11bHRpcGxlIGNhbmRpZGF0ZXMgYXJlIGZvdW5kXG4gICAgICAgIGlmIChjYW5kaWRhdGVVc2Vycy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICB1c2VyID0gY2FuZGlkYXRlVXNlcnNbMF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdXNlcjtcbiAgfVxuXG4gIC8vL1xuICAvLy8gTE9HSU4gTUVUSE9EU1xuICAvLy9cblxuICAvLyBMb2dpbiBtZXRob2RzIHJldHVybiB0byB0aGUgY2xpZW50IGFuIG9iamVjdCBjb250YWluaW5nIHRoZXNlXG4gIC8vIGZpZWxkcyB3aGVuIHRoZSB1c2VyIHdhcyBsb2dnZWQgaW4gc3VjY2Vzc2Z1bGx5OlxuICAvL1xuICAvLyAgIGlkOiB1c2VySWRcbiAgLy8gICB0b2tlbjogKlxuICAvLyAgIHRva2VuRXhwaXJlczogKlxuICAvL1xuICAvLyB0b2tlbkV4cGlyZXMgaXMgb3B0aW9uYWwgYW5kIGludGVuZHMgdG8gcHJvdmlkZSBhIGhpbnQgdG8gdGhlXG4gIC8vIGNsaWVudCBhcyB0byB3aGVuIHRoZSB0b2tlbiB3aWxsIGV4cGlyZS4gSWYgbm90IHByb3ZpZGVkLCB0aGVcbiAgLy8gY2xpZW50IHdpbGwgY2FsbCBBY2NvdW50cy5fdG9rZW5FeHBpcmF0aW9uLCBwYXNzaW5nIGl0IHRoZSBkYXRlXG4gIC8vIHRoYXQgaXQgcmVjZWl2ZWQgdGhlIHRva2VuLlxuICAvL1xuICAvLyBUaGUgbG9naW4gbWV0aG9kIHdpbGwgdGhyb3cgYW4gZXJyb3IgYmFjayB0byB0aGUgY2xpZW50IGlmIHRoZSB1c2VyXG4gIC8vIGZhaWxlZCB0byBsb2cgaW4uXG4gIC8vXG4gIC8vXG4gIC8vIExvZ2luIGhhbmRsZXJzIGFuZCBzZXJ2aWNlIHNwZWNpZmljIGxvZ2luIG1ldGhvZHMgc3VjaCBhc1xuICAvLyBgY3JlYXRlVXNlcmAgaW50ZXJuYWxseSByZXR1cm4gYSBgcmVzdWx0YCBvYmplY3QgY29udGFpbmluZyB0aGVzZVxuICAvLyBmaWVsZHM6XG4gIC8vXG4gIC8vICAgdHlwZTpcbiAgLy8gICAgIG9wdGlvbmFsIHN0cmluZzsgdGhlIHNlcnZpY2UgbmFtZSwgb3ZlcnJpZGVzIHRoZSBoYW5kbGVyXG4gIC8vICAgICBkZWZhdWx0IGlmIHByZXNlbnQuXG4gIC8vXG4gIC8vICAgZXJyb3I6XG4gIC8vICAgICBleGNlcHRpb247IGlmIHRoZSB1c2VyIGlzIG5vdCBhbGxvd2VkIHRvIGxvZ2luLCB0aGUgcmVhc29uIHdoeS5cbiAgLy9cbiAgLy8gICB1c2VySWQ6XG4gIC8vICAgICBzdHJpbmc7IHRoZSB1c2VyIGlkIG9mIHRoZSB1c2VyIGF0dGVtcHRpbmcgdG8gbG9naW4gKGlmXG4gIC8vICAgICBrbm93biksIHJlcXVpcmVkIGZvciBhbiBhbGxvd2VkIGxvZ2luLlxuICAvL1xuICAvLyAgIG9wdGlvbnM6XG4gIC8vICAgICBvcHRpb25hbCBvYmplY3QgbWVyZ2VkIGludG8gdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgbG9naW5cbiAgLy8gICAgIG1ldGhvZDsgdXNlZCBieSBIQU1LIGZyb20gU1JQLlxuICAvL1xuICAvLyAgIHN0YW1wZWRMb2dpblRva2VuOlxuICAvLyAgICAgb3B0aW9uYWwgb2JqZWN0IHdpdGggYHRva2VuYCBhbmQgYHdoZW5gIGluZGljYXRpbmcgdGhlIGxvZ2luXG4gIC8vICAgICB0b2tlbiBpcyBhbHJlYWR5IHByZXNlbnQgaW4gdGhlIGRhdGFiYXNlLCByZXR1cm5lZCBieSB0aGVcbiAgLy8gICAgIFwicmVzdW1lXCIgbG9naW4gaGFuZGxlci5cbiAgLy9cbiAgLy8gRm9yIGNvbnZlbmllbmNlLCBsb2dpbiBtZXRob2RzIGNhbiBhbHNvIHRocm93IGFuIGV4Y2VwdGlvbiwgd2hpY2hcbiAgLy8gaXMgY29udmVydGVkIGludG8gYW4ge2Vycm9yfSByZXN1bHQuICBIb3dldmVyLCBpZiB0aGUgaWQgb2YgdGhlXG4gIC8vIHVzZXIgYXR0ZW1wdGluZyB0aGUgbG9naW4gaXMga25vd24sIGEge3VzZXJJZCwgZXJyb3J9IHJlc3VsdCBzaG91bGRcbiAgLy8gYmUgcmV0dXJuZWQgaW5zdGVhZCBzaW5jZSB0aGUgdXNlciBpZCBpcyBub3QgY2FwdHVyZWQgd2hlbiBhblxuICAvLyBleGNlcHRpb24gaXMgdGhyb3duLlxuICAvL1xuICAvLyBUaGlzIGludGVybmFsIGByZXN1bHRgIG9iamVjdCBpcyBhdXRvbWF0aWNhbGx5IGNvbnZlcnRlZCBpbnRvIHRoZVxuICAvLyBwdWJsaWMge2lkLCB0b2tlbiwgdG9rZW5FeHBpcmVzfSBvYmplY3QgcmV0dXJuZWQgdG8gdGhlIGNsaWVudC5cblxuICAvLyBUcnkgYSBsb2dpbiBtZXRob2QsIGNvbnZlcnRpbmcgdGhyb3duIGV4Y2VwdGlvbnMgaW50byBhbiB7ZXJyb3J9XG4gIC8vIHJlc3VsdC4gIFRoZSBgdHlwZWAgYXJndW1lbnQgaXMgYSBkZWZhdWx0LCBpbnNlcnRlZCBpbnRvIHRoZSByZXN1bHRcbiAgLy8gb2JqZWN0IGlmIG5vdCBleHBsaWNpdGx5IHJldHVybmVkLlxuICAvL1xuICAvLyBMb2cgaW4gYSB1c2VyIG9uIGEgY29ubmVjdGlvbi5cbiAgLy9cbiAgLy8gV2UgdXNlIHRoZSBtZXRob2QgaW52b2NhdGlvbiB0byBzZXQgdGhlIHVzZXIgaWQgb24gdGhlIGNvbm5lY3Rpb24sXG4gIC8vIG5vdCB0aGUgY29ubmVjdGlvbiBvYmplY3QgZGlyZWN0bHkuIHNldFVzZXJJZCBpcyB0aWVkIHRvIG1ldGhvZHMgdG9cbiAgLy8gZW5mb3JjZSBjbGVhciBvcmRlcmluZyBvZiBtZXRob2QgYXBwbGljYXRpb24gKHVzaW5nIHdhaXQgbWV0aG9kcyBvblxuICAvLyB0aGUgY2xpZW50LCBhbmQgYSBubyBzZXRVc2VySWQgYWZ0ZXIgdW5ibG9jayByZXN0cmljdGlvbiBvbiB0aGVcbiAgLy8gc2VydmVyKVxuICAvL1xuICAvLyBUaGUgYHN0YW1wZWRMb2dpblRva2VuYCBwYXJhbWV0ZXIgaXMgb3B0aW9uYWwuICBXaGVuIHByZXNlbnQsIGl0XG4gIC8vIGluZGljYXRlcyB0aGF0IHRoZSBsb2dpbiB0b2tlbiBoYXMgYWxyZWFkeSBiZWVuIGluc2VydGVkIGludG8gdGhlXG4gIC8vIGRhdGFiYXNlIGFuZCBkb2Vzbid0IG5lZWQgdG8gYmUgaW5zZXJ0ZWQgYWdhaW4uICAoSXQncyB1c2VkIGJ5IHRoZVxuICAvLyBcInJlc3VtZVwiIGxvZ2luIGhhbmRsZXIpLlxuICBhc3luYyBfbG9naW5Vc2VyKG1ldGhvZEludm9jYXRpb24sIHVzZXJJZCwgc3RhbXBlZExvZ2luVG9rZW4pIHtcbiAgICBpZiAoISBzdGFtcGVkTG9naW5Ub2tlbikge1xuICAgICAgc3RhbXBlZExvZ2luVG9rZW4gPSB0aGlzLl9nZW5lcmF0ZVN0YW1wZWRMb2dpblRva2VuKCk7XG4gICAgICBhd2FpdCB0aGlzLl9pbnNlcnRMb2dpblRva2VuKHVzZXJJZCwgc3RhbXBlZExvZ2luVG9rZW4pO1xuICAgIH1cblxuICAgIC8vIFRoaXMgb3JkZXIgKGFuZCB0aGUgYXZvaWRhbmNlIG9mIHlpZWxkcykgaXMgaW1wb3J0YW50IHRvIG1ha2VcbiAgICAvLyBzdXJlIHRoYXQgd2hlbiBwdWJsaXNoIGZ1bmN0aW9ucyBhcmUgcmVydW4sIHRoZXkgc2VlIGFcbiAgICAvLyBjb25zaXN0ZW50IHZpZXcgb2YgdGhlIHdvcmxkOiB0aGUgdXNlcklkIGlzIHNldCBhbmQgbWF0Y2hlc1xuICAgIC8vIHRoZSBsb2dpbiB0b2tlbiBvbiB0aGUgY29ubmVjdGlvbiAobm90IHRoYXQgdGhlcmUgaXNcbiAgICAvLyBjdXJyZW50bHkgYSBwdWJsaWMgQVBJIGZvciByZWFkaW5nIHRoZSBsb2dpbiB0b2tlbiBvbiBhXG4gICAgLy8gY29ubmVjdGlvbikuXG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoKCkgPT5cbiAgICAgIHRoaXMuX3NldExvZ2luVG9rZW4oXG4gICAgICAgIHVzZXJJZCxcbiAgICAgICAgbWV0aG9kSW52b2NhdGlvbi5jb25uZWN0aW9uLFxuICAgICAgICB0aGlzLl9oYXNoTG9naW5Ub2tlbihzdGFtcGVkTG9naW5Ub2tlbi50b2tlbilcbiAgICAgIClcbiAgICApO1xuXG4gICAgYXdhaXQgbWV0aG9kSW52b2NhdGlvbi5zZXRVc2VySWQodXNlcklkKTtcblxuICAgIHJldHVybiB7XG4gICAgICBpZDogdXNlcklkLFxuICAgICAgdG9rZW46IHN0YW1wZWRMb2dpblRva2VuLnRva2VuLFxuICAgICAgdG9rZW5FeHBpcmVzOiB0aGlzLl90b2tlbkV4cGlyYXRpb24oc3RhbXBlZExvZ2luVG9rZW4ud2hlbilcbiAgICB9O1xuICB9O1xuXG4gIC8vIEFmdGVyIGEgbG9naW4gbWV0aG9kIGhhcyBjb21wbGV0ZWQsIGNhbGwgdGhlIGxvZ2luIGhvb2tzLiAgTm90ZVxuICAvLyB0aGF0IGBhdHRlbXB0TG9naW5gIGlzIGNhbGxlZCBmb3IgKmFsbCogbG9naW4gYXR0ZW1wdHMsIGV2ZW4gb25lc1xuICAvLyB3aGljaCBhcmVuJ3Qgc3VjY2Vzc2Z1bCAoc3VjaCBhcyBhbiBpbnZhbGlkIHBhc3N3b3JkLCBldGMpLlxuICAvL1xuICAvLyBJZiB0aGUgbG9naW4gaXMgYWxsb3dlZCBhbmQgaXNuJ3QgYWJvcnRlZCBieSBhIHZhbGlkYXRlIGxvZ2luIGhvb2tcbiAgLy8gY2FsbGJhY2ssIGxvZyBpbiB0aGUgdXNlci5cbiAgLy9cbiAgYXN5bmMgX2F0dGVtcHRMb2dpbihcbiAgICBtZXRob2RJbnZvY2F0aW9uLFxuICAgIG1ldGhvZE5hbWUsXG4gICAgbWV0aG9kQXJncyxcbiAgICByZXN1bHRcbiAgKSB7XG4gICAgaWYgKCFyZXN1bHQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXN1bHQgaXMgcmVxdWlyZWRcIik7XG5cbiAgICAvLyBYWFggQSBwcm9ncmFtbWluZyBlcnJvciBpbiBhIGxvZ2luIGhhbmRsZXIgY2FuIGxlYWQgdG8gdGhpcyBvY2N1cnJpbmcsIGFuZFxuICAgIC8vIHRoZW4gd2UgZG9uJ3QgY2FsbCBvbkxvZ2luIG9yIG9uTG9naW5GYWlsdXJlIGNhbGxiYWNrcy4gU2hvdWxkXG4gICAgLy8gdHJ5TG9naW5NZXRob2QgY2F0Y2ggdGhpcyBjYXNlIGFuZCB0dXJuIGl0IGludG8gYW4gZXJyb3I/XG4gICAgaWYgKCFyZXN1bHQudXNlcklkICYmICFyZXN1bHQuZXJyb3IpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBIGxvZ2luIG1ldGhvZCBtdXN0IHNwZWNpZnkgYSB1c2VySWQgb3IgYW4gZXJyb3JcIik7XG5cbiAgICBsZXQgdXNlcjtcbiAgICBpZiAocmVzdWx0LnVzZXJJZClcbiAgICAgIHVzZXIgPSBhd2FpdCB0aGlzLnVzZXJzLmZpbmRPbmVBc3luYyhyZXN1bHQudXNlcklkLCB7ZmllbGRzOiB0aGlzLl9vcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yfSk7XG5cbiAgICBjb25zdCBhdHRlbXB0ID0ge1xuICAgICAgdHlwZTogcmVzdWx0LnR5cGUgfHwgXCJ1bmtub3duXCIsXG4gICAgICBhbGxvd2VkOiAhISAocmVzdWx0LnVzZXJJZCAmJiAhcmVzdWx0LmVycm9yKSxcbiAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICBtZXRob2RBcmd1bWVudHM6IEFycmF5LmZyb20obWV0aG9kQXJncylcbiAgICB9O1xuICAgIGlmIChyZXN1bHQuZXJyb3IpIHtcbiAgICAgIGF0dGVtcHQuZXJyb3IgPSByZXN1bHQuZXJyb3I7XG4gICAgfVxuICAgIGlmICh1c2VyKSB7XG4gICAgICBhdHRlbXB0LnVzZXIgPSB1c2VyO1xuICAgIH1cblxuICAgIC8vIF92YWxpZGF0ZUxvZ2luIG1heSBtdXRhdGUgYGF0dGVtcHRgIGJ5IGFkZGluZyBhbiBlcnJvciBhbmQgY2hhbmdpbmcgYWxsb3dlZFxuICAgIC8vIHRvIGZhbHNlLCBidXQgdGhhdCdzIHRoZSBvbmx5IGNoYW5nZSBpdCBjYW4gbWFrZSAoYW5kIHRoZSB1c2VyJ3MgY2FsbGJhY2tzXG4gICAgLy8gb25seSBnZXQgYSBjbG9uZSBvZiBgYXR0ZW1wdGApLlxuICAgIGF3YWl0IHRoaXMuX3ZhbGlkYXRlTG9naW4obWV0aG9kSW52b2NhdGlvbi5jb25uZWN0aW9uLCBhdHRlbXB0KTtcblxuICAgIGlmIChhdHRlbXB0LmFsbG93ZWQpIHtcbiAgICAgIGNvbnN0IG8gPSBhd2FpdCB0aGlzLl9sb2dpblVzZXIoXG4gICAgICAgIG1ldGhvZEludm9jYXRpb24sXG4gICAgICAgIHJlc3VsdC51c2VySWQsXG4gICAgICAgIHJlc3VsdC5zdGFtcGVkTG9naW5Ub2tlblxuICAgICAgKVxuICAgICAgY29uc3QgcmV0ID0ge1xuICAgICAgICAuLi5vLFxuICAgICAgICAuLi5yZXN1bHQub3B0aW9uc1xuICAgICAgfTtcbiAgICAgIHJldC50eXBlID0gYXR0ZW1wdC50eXBlO1xuICAgICAgYXdhaXQgdGhpcy5fc3VjY2Vzc2Z1bExvZ2luKG1ldGhvZEludm9jYXRpb24uY29ubmVjdGlvbiwgYXR0ZW1wdCk7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMuX2ZhaWxlZExvZ2luKG1ldGhvZEludm9jYXRpb24uY29ubmVjdGlvbiwgYXR0ZW1wdCk7XG4gICAgICB0aHJvdyBhdHRlbXB0LmVycm9yO1xuICAgIH1cbiAgfTtcblxuICAvLyBBbGwgc2VydmljZSBzcGVjaWZpYyBsb2dpbiBtZXRob2RzIHNob3VsZCBnbyB0aHJvdWdoIHRoaXMgZnVuY3Rpb24uXG4gIC8vIEVuc3VyZSB0aGF0IHRocm93biBleGNlcHRpb25zIGFyZSBjYXVnaHQgYW5kIHRoYXQgbG9naW4gaG9va1xuICAvLyBjYWxsYmFja3MgYXJlIHN0aWxsIGNhbGxlZC5cbiAgLy9cbiAgYXN5bmMgX2xvZ2luTWV0aG9kKFxuICAgIG1ldGhvZEludm9jYXRpb24sXG4gICAgbWV0aG9kTmFtZSxcbiAgICBtZXRob2RBcmdzLFxuICAgIHR5cGUsXG4gICAgZm5cbiAgKSB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX2F0dGVtcHRMb2dpbihcbiAgICAgIG1ldGhvZEludm9jYXRpb24sXG4gICAgICBtZXRob2ROYW1lLFxuICAgICAgbWV0aG9kQXJncyxcbiAgICAgIGF3YWl0IHRyeUxvZ2luTWV0aG9kKHR5cGUsIGZuKVxuICAgICk7XG4gIH07XG5cblxuICAvLyBSZXBvcnQgYSBsb2dpbiBhdHRlbXB0IGZhaWxlZCBvdXRzaWRlIHRoZSBjb250ZXh0IG9mIGEgbm9ybWFsIGxvZ2luXG4gIC8vIG1ldGhvZC4gVGhpcyBpcyBmb3IgdXNlIGluIHRoZSBjYXNlIHdoZXJlIHRoZXJlIGlzIGEgbXVsdGktc3RlcCBsb2dpblxuICAvLyBwcm9jZWR1cmUgKGVnIFNSUCBiYXNlZCBwYXNzd29yZCBsb2dpbikuIElmIGEgbWV0aG9kIGVhcmx5IGluIHRoZVxuICAvLyBjaGFpbiBmYWlscywgaXQgc2hvdWxkIGNhbGwgdGhpcyBmdW5jdGlvbiB0byByZXBvcnQgYSBmYWlsdXJlLiBUaGVyZVxuICAvLyBpcyBubyBjb3JyZXNwb25kaW5nIG1ldGhvZCBmb3IgYSBzdWNjZXNzZnVsIGxvZ2luOyBtZXRob2RzIHRoYXQgY2FuXG4gIC8vIHN1Y2NlZWQgYXQgbG9nZ2luZyBhIHVzZXIgaW4gc2hvdWxkIGFsd2F5cyBiZSBhY3R1YWwgbG9naW4gbWV0aG9kc1xuICAvLyAodXNpbmcgZWl0aGVyIEFjY291bnRzLl9sb2dpbk1ldGhvZCBvciBBY2NvdW50cy5yZWdpc3RlckxvZ2luSGFuZGxlcikuXG4gIGFzeW5jIF9yZXBvcnRMb2dpbkZhaWx1cmUoXG4gICAgbWV0aG9kSW52b2NhdGlvbixcbiAgICBtZXRob2ROYW1lLFxuICAgIG1ldGhvZEFyZ3MsXG4gICAgcmVzdWx0XG4gICkge1xuICAgIGNvbnN0IGF0dGVtcHQgPSB7XG4gICAgICB0eXBlOiByZXN1bHQudHlwZSB8fCBcInVua25vd25cIixcbiAgICAgIGFsbG93ZWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6IHJlc3VsdC5lcnJvcixcbiAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICBtZXRob2RBcmd1bWVudHM6IEFycmF5LmZyb20obWV0aG9kQXJncylcbiAgICB9O1xuXG4gICAgaWYgKHJlc3VsdC51c2VySWQpIHtcbiAgICAgIGF0dGVtcHQudXNlciA9IHRoaXMudXNlcnMuZmluZE9uZUFzeW5jKHJlc3VsdC51c2VySWQsIHtmaWVsZHM6IHRoaXMuX29wdGlvbnMuZGVmYXVsdEZpZWxkU2VsZWN0b3J9KTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLl92YWxpZGF0ZUxvZ2luKG1ldGhvZEludm9jYXRpb24uY29ubmVjdGlvbiwgYXR0ZW1wdCk7XG4gICAgYXdhaXQgdGhpcy5fZmFpbGVkTG9naW4obWV0aG9kSW52b2NhdGlvbi5jb25uZWN0aW9uLCBhdHRlbXB0KTtcblxuICAgIC8vIF92YWxpZGF0ZUxvZ2luIG1heSBtdXRhdGUgYXR0ZW1wdCB0byBzZXQgYSBuZXcgZXJyb3IgbWVzc2FnZS4gUmV0dXJuXG4gICAgLy8gdGhlIG1vZGlmaWVkIHZlcnNpb24uXG4gICAgcmV0dXJuIGF0dGVtcHQ7XG4gIH07XG5cbiAgLy8vXG4gIC8vLyBMT0dJTiBIQU5ETEVSU1xuICAvLy9cblxuICAvKipcbiAgICogQHN1bW1hcnkgUmVnaXN0ZXJzIGEgbmV3IGxvZ2luIGhhbmRsZXIuXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtuYW1lXSBUaGUgdHlwZSBvZiBsb2dpbiBtZXRob2QgbGlrZSBvYXV0aCwgcGFzc3dvcmQsIGV0Yy5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlciBBIGZ1bmN0aW9uIHRoYXQgcmVjZWl2ZXMgYW4gb3B0aW9ucyBvYmplY3RcbiAgICogKGFzIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgYGxvZ2luYCBtZXRob2QpIGFuZCByZXR1cm5zIG9uZSBvZlxuICAgKiBgdW5kZWZpbmVkYCwgbWVhbmluZyBkb24ndCBoYW5kbGUgb3IgYSBsb2dpbiBtZXRob2QgcmVzdWx0IG9iamVjdC5cbiAgICovXG4gIHJlZ2lzdGVyTG9naW5IYW5kbGVyKG5hbWUsIGhhbmRsZXIpIHtcbiAgICBpZiAoISBoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyID0gbmFtZTtcbiAgICAgIG5hbWUgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2xvZ2luSGFuZGxlcnMucHVzaCh7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgaGFuZGxlcjogTWV0ZW9yLndyYXBGbihoYW5kbGVyKVxuICAgIH0pO1xuICB9O1xuXG5cbiAgLy8gQ2hlY2tzIGEgdXNlcidzIGNyZWRlbnRpYWxzIGFnYWluc3QgYWxsIHRoZSByZWdpc3RlcmVkIGxvZ2luXG4gIC8vIGhhbmRsZXJzLCBhbmQgcmV0dXJucyBhIGxvZ2luIHRva2VuIGlmIHRoZSBjcmVkZW50aWFscyBhcmUgdmFsaWQuIEl0XG4gIC8vIGlzIGxpa2UgdGhlIGxvZ2luIG1ldGhvZCwgZXhjZXB0IHRoYXQgaXQgZG9lc24ndCBzZXQgdGhlIGxvZ2dlZC1pblxuICAvLyB1c2VyIG9uIHRoZSBjb25uZWN0aW9uLiBUaHJvd3MgYSBNZXRlb3IuRXJyb3IgaWYgbG9nZ2luZyBpbiBmYWlscyxcbiAgLy8gaW5jbHVkaW5nIHRoZSBjYXNlIHdoZXJlIG5vbmUgb2YgdGhlIGxvZ2luIGhhbmRsZXJzIGhhbmRsZWQgdGhlIGxvZ2luXG4gIC8vIHJlcXVlc3QuIE90aGVyd2lzZSwgcmV0dXJucyB7aWQ6IHVzZXJJZCwgdG9rZW46ICosIHRva2VuRXhwaXJlczogKn0uXG4gIC8vXG4gIC8vIEZvciBleGFtcGxlLCBpZiB5b3Ugd2FudCB0byBsb2dpbiB3aXRoIGEgcGxhaW50ZXh0IHBhc3N3b3JkLCBgb3B0aW9uc2AgY291bGQgYmVcbiAgLy8gICB7IHVzZXI6IHsgdXNlcm5hbWU6IDx1c2VybmFtZT4gfSwgcGFzc3dvcmQ6IDxwYXNzd29yZD4gfSwgb3JcbiAgLy8gICB7IHVzZXI6IHsgZW1haWw6IDxlbWFpbD4gfSwgcGFzc3dvcmQ6IDxwYXNzd29yZD4gfS5cblxuICAvLyBUcnkgYWxsIG9mIHRoZSByZWdpc3RlcmVkIGxvZ2luIGhhbmRsZXJzIHVudGlsIG9uZSBvZiB0aGVtIGRvZXNuJ3RcbiAgLy8gcmV0dXJuIGB1bmRlZmluZWRgLCBtZWFuaW5nIGl0IGhhbmRsZWQgdGhpcyBjYWxsIHRvIGBsb2dpbmAuIFJldHVyblxuICAvLyB0aGF0IHJldHVybiB2YWx1ZS5cbiAgYXN5bmMgX3J1bkxvZ2luSGFuZGxlcnMobWV0aG9kSW52b2NhdGlvbiwgb3B0aW9ucykge1xuICAgIGZvciAobGV0IGhhbmRsZXIgb2YgdGhpcy5fbG9naW5IYW5kbGVycykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHJ5TG9naW5NZXRob2QoaGFuZGxlci5uYW1lLCBhc3luYyAoKSA9PlxuICAgICAgICBhd2FpdCBoYW5kbGVyLmhhbmRsZXIuY2FsbChtZXRob2RJbnZvY2F0aW9uLCBvcHRpb25zKVxuICAgICAgKTtcblxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcbiAgICAgICAgICA0MDAsXG4gICAgICAgICAgJ0EgbG9naW4gaGFuZGxlciBzaG91bGQgcmV0dXJuIGEgcmVzdWx0IG9yIHVuZGVmaW5lZCdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogbnVsbCxcbiAgICAgIGVycm9yOiBuZXcgTWV0ZW9yLkVycm9yKDQwMCwgXCJVbnJlY29nbml6ZWQgb3B0aW9ucyBmb3IgbG9naW4gcmVxdWVzdFwiKVxuICAgIH07XG4gIH07XG5cbiAgLy8gRGVsZXRlcyB0aGUgZ2l2ZW4gbG9naW5Ub2tlbiBmcm9tIHRoZSBkYXRhYmFzZS5cbiAgLy9cbiAgLy8gRm9yIG5ldy1zdHlsZSBoYXNoZWQgdG9rZW4sIHRoaXMgd2lsbCBjYXVzZSBhbGwgY29ubmVjdGlvbnNcbiAgLy8gYXNzb2NpYXRlZCB3aXRoIHRoZSB0b2tlbiB0byBiZSBjbG9zZWQuXG4gIC8vXG4gIC8vIEFueSBjb25uZWN0aW9ucyBhc3NvY2lhdGVkIHdpdGggb2xkLXN0eWxlIHVuaGFzaGVkIHRva2VucyB3aWxsIGJlXG4gIC8vIGluIHRoZSBwcm9jZXNzIG9mIGJlY29taW5nIGFzc29jaWF0ZWQgd2l0aCBoYXNoZWQgdG9rZW5zIGFuZCB0aGVuXG4gIC8vIHRoZXknbGwgZ2V0IGNsb3NlZC5cbiAgYXN5bmMgZGVzdHJveVRva2VuKHVzZXJJZCwgbG9naW5Ub2tlbikge1xuICAgIGF3YWl0IHRoaXMudXNlcnMudXBkYXRlQXN5bmModXNlcklkLCB7XG4gICAgICAkcHVsbDoge1xuICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiB7XG4gICAgICAgICAgJG9yOiBbXG4gICAgICAgICAgICB7IGhhc2hlZFRva2VuOiBsb2dpblRva2VuIH0sXG4gICAgICAgICAgICB7IHRva2VuOiBsb2dpblRva2VuIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBfaW5pdFNlcnZlck1ldGhvZHMoKSB7XG4gICAgLy8gVGhlIG1ldGhvZHMgY3JlYXRlZCBpbiB0aGlzIGZ1bmN0aW9uIG5lZWQgdG8gYmUgY3JlYXRlZCBoZXJlIHNvIHRoYXRcbiAgICAvLyB0aGlzIHZhcmlhYmxlIGlzIGF2YWlsYWJsZSBpbiB0aGVpciBzY29wZS5cbiAgICBjb25zdCBhY2NvdW50cyA9IHRoaXM7XG5cblxuICAgIC8vIFRoaXMgb2JqZWN0IHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggbWV0aG9kcyBhbmQgdGhlbiBwYXNzZWQgdG9cbiAgICAvLyBhY2NvdW50cy5fc2VydmVyLm1ldGhvZHMgZnVydGhlciBiZWxvdy5cbiAgICBjb25zdCBtZXRob2RzID0ge307XG5cbiAgICAvLyBAcmV0dXJucyB7T2JqZWN0fG51bGx9XG4gICAgLy8gICBJZiBzdWNjZXNzZnVsLCByZXR1cm5zIHt0b2tlbjogcmVjb25uZWN0VG9rZW4sIGlkOiB1c2VySWR9XG4gICAgLy8gICBJZiB1bnN1Y2Nlc3NmdWwgKGZvciBleGFtcGxlLCBpZiB0aGUgdXNlciBjbG9zZWQgdGhlIG9hdXRoIGxvZ2luIHBvcHVwKSxcbiAgICAvLyAgICAgdGhyb3dzIGFuIGVycm9yIGRlc2NyaWJpbmcgdGhlIHJlYXNvblxuICAgIG1ldGhvZHMubG9naW4gPSBhc3luYyBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgLy8gTG9naW4gaGFuZGxlcnMgc2hvdWxkIHJlYWxseSBhbHNvIGNoZWNrIHdoYXRldmVyIGZpZWxkIHRoZXkgbG9vayBhdCBpblxuICAgICAgLy8gb3B0aW9ucywgYnV0IHdlIGRvbid0IGVuZm9yY2UgaXQuXG4gICAgICBjaGVjayhvcHRpb25zLCBPYmplY3QpO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhY2NvdW50cy5fcnVuTG9naW5IYW5kbGVycyh0aGlzLCBvcHRpb25zKTtcbiAgICAgIC8vY29uc29sZS5sb2coe3Jlc3VsdH0pO1xuXG4gICAgICByZXR1cm4gYXdhaXQgYWNjb3VudHMuX2F0dGVtcHRMb2dpbih0aGlzLCBcImxvZ2luXCIsIGFyZ3VtZW50cywgcmVzdWx0KTtcbiAgICB9O1xuXG4gICAgbWV0aG9kcy5sb2dvdXQgPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGFjY291bnRzLl9nZXRMb2dpblRva2VuKHRoaXMuY29ubmVjdGlvbi5pZCk7XG4gICAgICBhY2NvdW50cy5fc2V0TG9naW5Ub2tlbih0aGlzLnVzZXJJZCwgdGhpcy5jb25uZWN0aW9uLCBudWxsKTtcbiAgICAgIGlmICh0b2tlbiAmJiB0aGlzLnVzZXJJZCkge1xuICAgICAgIGF3YWl0IGFjY291bnRzLmRlc3Ryb3lUb2tlbih0aGlzLnVzZXJJZCwgdG9rZW4pO1xuICAgICAgfVxuICAgICAgYXdhaXQgYWNjb3VudHMuX3N1Y2Nlc3NmdWxMb2dvdXQodGhpcy5jb25uZWN0aW9uLCB0aGlzLnVzZXJJZCk7XG4gICAgICBhd2FpdCB0aGlzLnNldFVzZXJJZChudWxsKTtcbiAgICB9O1xuXG4gICAgLy8gR2VuZXJhdGVzIGEgbmV3IGxvZ2luIHRva2VuIHdpdGggdGhlIHNhbWUgZXhwaXJhdGlvbiBhcyB0aGVcbiAgICAvLyBjb25uZWN0aW9uJ3MgY3VycmVudCB0b2tlbiBhbmQgc2F2ZXMgaXQgdG8gdGhlIGRhdGFiYXNlLiBBc3NvY2lhdGVzXG4gICAgLy8gdGhlIGNvbm5lY3Rpb24gd2l0aCB0aGlzIG5ldyB0b2tlbiBhbmQgcmV0dXJucyBpdC4gVGhyb3dzIGFuIGVycm9yXG4gICAgLy8gaWYgY2FsbGVkIG9uIGEgY29ubmVjdGlvbiB0aGF0IGlzbid0IGxvZ2dlZCBpbi5cbiAgICAvL1xuICAgIC8vIEByZXR1cm5zIE9iamVjdFxuICAgIC8vICAgSWYgc3VjY2Vzc2Z1bCwgcmV0dXJucyB7IHRva2VuOiA8bmV3IHRva2VuPiwgaWQ6IDx1c2VyIGlkPixcbiAgICAvLyAgIHRva2VuRXhwaXJlczogPGV4cGlyYXRpb24gZGF0ZT4gfS5cbiAgICBtZXRob2RzLmdldE5ld1Rva2VuID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgdXNlciA9IGF3YWl0IGFjY291bnRzLnVzZXJzLmZpbmRPbmVBc3luYyh0aGlzLnVzZXJJZCwge1xuICAgICAgICBmaWVsZHM6IHsgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNcIjogMSB9XG4gICAgICB9KTtcbiAgICAgIGlmICghIHRoaXMudXNlcklkIHx8ICEgdXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFwiWW91IGFyZSBub3QgbG9nZ2VkIGluLlwiKTtcbiAgICAgIH1cbiAgICAgIC8vIEJlIGNhcmVmdWwgbm90IHRvIGdlbmVyYXRlIGEgbmV3IHRva2VuIHRoYXQgaGFzIGEgbGF0ZXJcbiAgICAgIC8vIGV4cGlyYXRpb24gdGhhbiB0aGUgY3VycmVuIHRva2VuLiBPdGhlcndpc2UsIGEgYmFkIGd1eSB3aXRoIGFcbiAgICAgIC8vIHN0b2xlbiB0b2tlbiBjb3VsZCB1c2UgdGhpcyBtZXRob2QgdG8gc3RvcCBoaXMgc3RvbGVuIHRva2VuIGZyb21cbiAgICAgIC8vIGV2ZXIgZXhwaXJpbmcuXG4gICAgICBjb25zdCBjdXJyZW50SGFzaGVkVG9rZW4gPSBhY2NvdW50cy5fZ2V0TG9naW5Ub2tlbih0aGlzLmNvbm5lY3Rpb24uaWQpO1xuICAgICAgY29uc3QgY3VycmVudFN0YW1wZWRUb2tlbiA9IHVzZXIuc2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLmZpbmQoXG4gICAgICAgIHN0YW1wZWRUb2tlbiA9PiBzdGFtcGVkVG9rZW4uaGFzaGVkVG9rZW4gPT09IGN1cnJlbnRIYXNoZWRUb2tlblxuICAgICAgKTtcbiAgICAgIGlmICghIGN1cnJlbnRTdGFtcGVkVG9rZW4pIHsgLy8gc2FmZXR5IGJlbHQ6IHRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlblxuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFwiSW52YWxpZCBsb2dpbiB0b2tlblwiKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5ld1N0YW1wZWRUb2tlbiA9IGFjY291bnRzLl9nZW5lcmF0ZVN0YW1wZWRMb2dpblRva2VuKCk7XG4gICAgICBuZXdTdGFtcGVkVG9rZW4ud2hlbiA9IGN1cnJlbnRTdGFtcGVkVG9rZW4ud2hlbjtcbiAgICAgIGF3YWl0IGFjY291bnRzLl9pbnNlcnRMb2dpblRva2VuKHRoaXMudXNlcklkLCBuZXdTdGFtcGVkVG9rZW4pO1xuICAgICAgcmV0dXJuIGF3YWl0IGFjY291bnRzLl9sb2dpblVzZXIodGhpcywgdGhpcy51c2VySWQsIG5ld1N0YW1wZWRUb2tlbik7XG4gICAgfTtcblxuICAgIC8vIFJlbW92ZXMgYWxsIHRva2VucyBleGNlcHQgdGhlIHRva2VuIGFzc29jaWF0ZWQgd2l0aCB0aGUgY3VycmVudFxuICAgIC8vIGNvbm5lY3Rpb24uIFRocm93cyBhbiBlcnJvciBpZiB0aGUgY29ubmVjdGlvbiBpcyBub3QgbG9nZ2VkXG4gICAgLy8gaW4uIFJldHVybnMgbm90aGluZyBvbiBzdWNjZXNzLlxuICAgIG1ldGhvZHMucmVtb3ZlT3RoZXJUb2tlbnMgPSBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoISB0aGlzLnVzZXJJZCkge1xuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFwiWW91IGFyZSBub3QgbG9nZ2VkIGluLlwiKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGN1cnJlbnRUb2tlbiA9IGFjY291bnRzLl9nZXRMb2dpblRva2VuKHRoaXMuY29ubmVjdGlvbi5pZCk7XG4gICAgICBhd2FpdCBhY2NvdW50cy51c2Vycy51cGRhdGVBc3luYyh0aGlzLnVzZXJJZCwge1xuICAgICAgICAkcHVsbDoge1xuICAgICAgICAgIFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCI6IHsgaGFzaGVkVG9rZW46IHsgJG5lOiBjdXJyZW50VG9rZW4gfSB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBBbGxvdyBhIG9uZS10aW1lIGNvbmZpZ3VyYXRpb24gZm9yIGEgbG9naW4gc2VydmljZS4gTW9kaWZpY2F0aW9uc1xuICAgIC8vIHRvIHRoaXMgY29sbGVjdGlvbiBhcmUgYWxzbyBhbGxvd2VkIGluIGluc2VjdXJlIG1vZGUuXG4gICAgbWV0aG9kcy5jb25maWd1cmVMb2dpblNlcnZpY2UgPSBhc3luYyAob3B0aW9ucykgPT4ge1xuICAgICAgY2hlY2sob3B0aW9ucywgTWF0Y2guT2JqZWN0SW5jbHVkaW5nKHtzZXJ2aWNlOiBTdHJpbmd9KSk7XG4gICAgICAvLyBEb24ndCBsZXQgcmFuZG9tIHVzZXJzIGNvbmZpZ3VyZSBhIHNlcnZpY2Ugd2UgaGF2ZW4ndCBhZGRlZCB5ZXQgKHNvXG4gICAgICAvLyB0aGF0IHdoZW4gd2UgZG8gbGF0ZXIgYWRkIGl0LCBpdCdzIHNldCB1cCB3aXRoIHRoZWlyIGNvbmZpZ3VyYXRpb25cbiAgICAgIC8vIGluc3RlYWQgb2Ygb3VycykuXG4gICAgICAvLyBYWFggaWYgc2VydmljZSBjb25maWd1cmF0aW9uIGlzIG9hdXRoLXNwZWNpZmljIHRoZW4gdGhpcyBjb2RlIHNob3VsZFxuICAgICAgLy8gICAgIGJlIGluIGFjY291bnRzLW9hdXRoOyBpZiBpdCdzIG5vdCB0aGVuIHRoZSByZWdpc3RyeSBzaG91bGQgYmVcbiAgICAgIC8vICAgICBpbiB0aGlzIHBhY2thZ2VcbiAgICAgIGlmICghKGFjY291bnRzLm9hdXRoXG4gICAgICAgICYmIGFjY291bnRzLm9hdXRoLnNlcnZpY2VOYW1lcygpLmluY2x1ZGVzKG9wdGlvbnMuc2VydmljZSkpKSB7XG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlNlcnZpY2UgdW5rbm93blwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKFBhY2thZ2VbJ3NlcnZpY2UtY29uZmlndXJhdGlvbiddKSB7XG4gICAgICAgIGNvbnN0IHsgU2VydmljZUNvbmZpZ3VyYXRpb24gfSA9IFBhY2thZ2VbJ3NlcnZpY2UtY29uZmlndXJhdGlvbiddO1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gYXdhaXQgU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuZmluZE9uZUFzeW5jKHtzZXJ2aWNlOiBvcHRpb25zLnNlcnZpY2V9KVxuICAgICAgICBpZiAoc2VydmljZSlcbiAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMywgYFNlcnZpY2UgJHtvcHRpb25zLnNlcnZpY2V9IGFscmVhZHkgY29uZmlndXJlZGApO1xuXG4gICAgICAgIGlmIChQYWNrYWdlW1wib2F1dGgtZW5jcnlwdGlvblwiXSkge1xuICAgICAgICAgIGNvbnN0IHsgT0F1dGhFbmNyeXB0aW9uIH0gPSBQYWNrYWdlW1wib2F1dGgtZW5jcnlwdGlvblwiXVxuICAgICAgICAgIGlmIChoYXNPd24uY2FsbChvcHRpb25zLCAnc2VjcmV0JykgJiYgT0F1dGhFbmNyeXB0aW9uLmtleUlzTG9hZGVkKCkpXG4gICAgICAgICAgICBvcHRpb25zLnNlY3JldCA9IE9BdXRoRW5jcnlwdGlvbi5zZWFsKG9wdGlvbnMuc2VjcmV0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IFNlcnZpY2VDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb25zLmluc2VydEFzeW5jKG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBhY2NvdW50cy5fc2VydmVyLm1ldGhvZHMobWV0aG9kcyk7XG4gIH07XG5cbiAgX2luaXRBY2NvdW50RGF0YUhvb2tzKCkge1xuICAgIHRoaXMuX3NlcnZlci5vbkNvbm5lY3Rpb24oY29ubmVjdGlvbiA9PiB7XG4gICAgICB0aGlzLl9hY2NvdW50RGF0YVtjb25uZWN0aW9uLmlkXSA9IHtcbiAgICAgICAgY29ubmVjdGlvbjogY29ubmVjdGlvblxuICAgICAgfTtcblxuICAgICAgY29ubmVjdGlvbi5vbkNsb3NlKCgpID0+IHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlVG9rZW5Gcm9tQ29ubmVjdGlvbihjb25uZWN0aW9uLmlkKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2FjY291bnREYXRhW2Nvbm5lY3Rpb24uaWRdO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgX2luaXRTZXJ2ZXJQdWJsaWNhdGlvbnMoKSB7XG4gICAgLy8gQnJpbmcgaW50byBsZXhpY2FsIHNjb3BlIGZvciBwdWJsaXNoIGNhbGxiYWNrcyB0aGF0IG5lZWQgYHRoaXNgXG4gICAgY29uc3QgeyB1c2VycywgX2F1dG9wdWJsaXNoRmllbGRzLCBfZGVmYXVsdFB1Ymxpc2hGaWVsZHMgfSA9IHRoaXM7XG5cbiAgICAvLyBQdWJsaXNoIGFsbCBsb2dpbiBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24gZmllbGRzIG90aGVyIHRoYW4gc2VjcmV0LlxuICAgIHRoaXMuX3NlcnZlci5wdWJsaXNoKFwibWV0ZW9yLmxvZ2luU2VydmljZUNvbmZpZ3VyYXRpb25cIiwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoUGFja2FnZVsnc2VydmljZS1jb25maWd1cmF0aW9uJ10pIHtcbiAgICAgICAgY29uc3QgeyBTZXJ2aWNlQ29uZmlndXJhdGlvbiB9ID0gUGFja2FnZVsnc2VydmljZS1jb25maWd1cmF0aW9uJ107XG4gICAgICAgIHJldHVybiBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kKHt9LCB7ZmllbGRzOiB7c2VjcmV0OiAwfX0pO1xuICAgICAgfVxuICAgICAgdGhpcy5yZWFkeSgpO1xuICAgIH0sIHtpc19hdXRvOiB0cnVlfSk7IC8vIG5vdCB0ZWNobmljYWxseSBhdXRvcHVibGlzaCwgYnV0IHN0b3BzIHRoZSB3YXJuaW5nLlxuXG4gICAgLy8gVXNlIE1ldGVvci5zdGFydHVwIHRvIGdpdmUgb3RoZXIgcGFja2FnZXMgYSBjaGFuY2UgdG8gY2FsbFxuICAgIC8vIHNldERlZmF1bHRQdWJsaXNoRmllbGRzLlxuICAgIE1ldGVvci5zdGFydHVwKCgpID0+IHtcbiAgICAgIC8vIE1lcmdlIGN1c3RvbSBmaWVsZHMgc2VsZWN0b3IgYW5kIGRlZmF1bHQgcHVibGlzaCBmaWVsZHMgc28gdGhhdCB0aGUgY2xpZW50XG4gICAgICAvLyBnZXRzIGFsbCB0aGUgbmVjZXNzYXJ5IGZpZWxkcyB0byBydW4gcHJvcGVybHlcbiAgICAgIGNvbnN0IGN1c3RvbUZpZWxkcyA9IHRoaXMuX2FkZERlZmF1bHRGaWVsZFNlbGVjdG9yKCkuZmllbGRzIHx8IHt9O1xuICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGN1c3RvbUZpZWxkcyk7XG4gICAgICAvLyBJZiB0aGUgY3VzdG9tIGZpZWxkcyBhcmUgbmVnYXRpdmUsIHRoZW4gaWdub3JlIHRoZW0gYW5kIG9ubHkgc2VuZCB0aGUgbmVjZXNzYXJ5IGZpZWxkc1xuICAgICAgY29uc3QgZmllbGRzID0ga2V5cy5sZW5ndGggPiAwICYmIGN1c3RvbUZpZWxkc1trZXlzWzBdXSA/IHtcbiAgICAgICAgLi4udGhpcy5fYWRkRGVmYXVsdEZpZWxkU2VsZWN0b3IoKS5maWVsZHMsXG4gICAgICAgIC4uLl9kZWZhdWx0UHVibGlzaEZpZWxkcy5wcm9qZWN0aW9uXG4gICAgICB9IDogX2RlZmF1bHRQdWJsaXNoRmllbGRzLnByb2plY3Rpb25cbiAgICAgIC8vIFB1Ymxpc2ggdGhlIGN1cnJlbnQgdXNlcidzIHJlY29yZCB0byB0aGUgY2xpZW50LlxuICAgICAgdGhpcy5fc2VydmVyLnB1Ymxpc2gobnVsbCwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy51c2VySWQpIHtcbiAgICAgICAgICByZXR1cm4gdXNlcnMuZmluZCh7XG4gICAgICAgICAgICBfaWQ6IHRoaXMudXNlcklkXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgZmllbGRzLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCAvKnN1cHByZXNzIGF1dG9wdWJsaXNoIHdhcm5pbmcqL3tpc19hdXRvOiB0cnVlfSk7XG4gICAgfSk7XG5cbiAgICAvLyBVc2UgTWV0ZW9yLnN0YXJ0dXAgdG8gZ2l2ZSBvdGhlciBwYWNrYWdlcyBhIGNoYW5jZSB0byBjYWxsXG4gICAgLy8gYWRkQXV0b3B1Ymxpc2hGaWVsZHMuXG4gICAgUGFja2FnZS5hdXRvcHVibGlzaCAmJiBNZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gICAgICAvLyBbJ3Byb2ZpbGUnLCAndXNlcm5hbWUnXSAtPiB7cHJvZmlsZTogMSwgdXNlcm5hbWU6IDF9XG4gICAgICBjb25zdCB0b0ZpZWxkU2VsZWN0b3IgPSBmaWVsZHMgPT4gZmllbGRzLnJlZHVjZSgocHJldiwgZmllbGQpID0+IChcbiAgICAgICAgICB7IC4uLnByZXYsIFtmaWVsZF06IDEgfSksXG4gICAgICAgIHt9XG4gICAgICApO1xuICAgICAgdGhpcy5fc2VydmVyLnB1Ymxpc2gobnVsbCwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy51c2VySWQpIHtcbiAgICAgICAgICByZXR1cm4gdXNlcnMuZmluZCh7IF9pZDogdGhpcy51c2VySWQgfSwge1xuICAgICAgICAgICAgZmllbGRzOiB0b0ZpZWxkU2VsZWN0b3IoX2F1dG9wdWJsaXNoRmllbGRzLmxvZ2dlZEluVXNlciksXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSwgLypzdXBwcmVzcyBhdXRvcHVibGlzaCB3YXJuaW5nKi97aXNfYXV0bzogdHJ1ZX0pO1xuXG4gICAgICAvLyBYWFggdGhpcyBwdWJsaXNoIGlzIG5laXRoZXIgZGVkdXAtYWJsZSBub3IgaXMgaXQgb3B0aW1pemVkIGJ5IG91ciBzcGVjaWFsXG4gICAgICAvLyB0cmVhdG1lbnQgb2YgcXVlcmllcyBvbiBhIHNwZWNpZmljIF9pZC4gVGhlcmVmb3JlIHRoaXMgd2lsbCBoYXZlIE8obl4yKVxuICAgICAgLy8gcnVuLXRpbWUgcGVyZm9ybWFuY2UgZXZlcnkgdGltZSBhIHVzZXIgZG9jdW1lbnQgaXMgY2hhbmdlZCAoZWcgc29tZW9uZVxuICAgICAgLy8gbG9nZ2luZyBpbikuIElmIHRoaXMgaXMgYSBwcm9ibGVtLCB3ZSBjYW4gaW5zdGVhZCB3cml0ZSBhIG1hbnVhbCBwdWJsaXNoXG4gICAgICAvLyBmdW5jdGlvbiB3aGljaCBmaWx0ZXJzIG91dCBmaWVsZHMgYmFzZWQgb24gJ3RoaXMudXNlcklkJy5cbiAgICAgIHRoaXMuX3NlcnZlci5wdWJsaXNoKG51bGwsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSB0aGlzLnVzZXJJZCA/IHsgX2lkOiB7ICRuZTogdGhpcy51c2VySWQgfSB9IDoge307XG4gICAgICAgIHJldHVybiB1c2Vycy5maW5kKHNlbGVjdG9yLCB7XG4gICAgICAgICAgZmllbGRzOiB0b0ZpZWxkU2VsZWN0b3IoX2F1dG9wdWJsaXNoRmllbGRzLm90aGVyVXNlcnMpLFxuICAgICAgICB9KVxuICAgICAgfSwgLypzdXBwcmVzcyBhdXRvcHVibGlzaCB3YXJuaW5nKi97aXNfYXV0bzogdHJ1ZX0pO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEFkZCB0byB0aGUgbGlzdCBvZiBmaWVsZHMgb3Igc3ViZmllbGRzIHRvIGJlIGF1dG9tYXRpY2FsbHlcbiAgLy8gcHVibGlzaGVkIGlmIGF1dG9wdWJsaXNoIGlzIG9uLiBNdXN0IGJlIGNhbGxlZCBmcm9tIHRvcC1sZXZlbFxuICAvLyBjb2RlIChpZSwgYmVmb3JlIE1ldGVvci5zdGFydHVwIGhvb2tzIHJ1bikuXG4gIC8vXG4gIC8vIEBwYXJhbSBvcHRzIHtPYmplY3R9IHdpdGg6XG4gIC8vICAgLSBmb3JMb2dnZWRJblVzZXIge0FycmF5fSBBcnJheSBvZiBmaWVsZHMgcHVibGlzaGVkIHRvIHRoZSBsb2dnZWQtaW4gdXNlclxuICAvLyAgIC0gZm9yT3RoZXJVc2VycyB7QXJyYXl9IEFycmF5IG9mIGZpZWxkcyBwdWJsaXNoZWQgdG8gdXNlcnMgdGhhdCBhcmVuJ3QgbG9nZ2VkIGluXG4gIGFkZEF1dG9wdWJsaXNoRmllbGRzKG9wdHMpIHtcbiAgICB0aGlzLl9hdXRvcHVibGlzaEZpZWxkcy5sb2dnZWRJblVzZXIucHVzaC5hcHBseShcbiAgICAgIHRoaXMuX2F1dG9wdWJsaXNoRmllbGRzLmxvZ2dlZEluVXNlciwgb3B0cy5mb3JMb2dnZWRJblVzZXIpO1xuICAgIHRoaXMuX2F1dG9wdWJsaXNoRmllbGRzLm90aGVyVXNlcnMucHVzaC5hcHBseShcbiAgICAgIHRoaXMuX2F1dG9wdWJsaXNoRmllbGRzLm90aGVyVXNlcnMsIG9wdHMuZm9yT3RoZXJVc2Vycyk7XG4gIH07XG5cbiAgLy8gUmVwbGFjZXMgdGhlIGZpZWxkcyB0byBiZSBhdXRvbWF0aWNhbGx5XG4gIC8vIHB1Ymxpc2hlZCB3aGVuIHRoZSB1c2VyIGxvZ3MgaW5cbiAgLy9cbiAgLy8gQHBhcmFtIHtNb25nb0ZpZWxkU3BlY2lmaWVyfSBmaWVsZHMgRGljdGlvbmFyeSBvZiBmaWVsZHMgdG8gcmV0dXJuIG9yIGV4Y2x1ZGUuXG4gIHNldERlZmF1bHRQdWJsaXNoRmllbGRzKGZpZWxkcykge1xuICAgIHRoaXMuX2RlZmF1bHRQdWJsaXNoRmllbGRzLnByb2plY3Rpb24gPSBmaWVsZHM7XG4gIH07XG5cbiAgLy8vXG4gIC8vLyBBQ0NPVU5UIERBVEFcbiAgLy8vXG5cbiAgLy8gSEFDSzogVGhpcyBpcyB1c2VkIGJ5ICdtZXRlb3ItYWNjb3VudHMnIHRvIGdldCB0aGUgbG9naW5Ub2tlbiBmb3IgYVxuICAvLyBjb25uZWN0aW9uLiBNYXliZSB0aGVyZSBzaG91bGQgYmUgYSBwdWJsaWMgd2F5IHRvIGRvIHRoYXQuXG4gIF9nZXRBY2NvdW50RGF0YShjb25uZWN0aW9uSWQsIGZpZWxkKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuX2FjY291bnREYXRhW2Nvbm5lY3Rpb25JZF07XG4gICAgcmV0dXJuIGRhdGEgJiYgZGF0YVtmaWVsZF07XG4gIH07XG5cbiAgX3NldEFjY291bnREYXRhKGNvbm5lY3Rpb25JZCwgZmllbGQsIHZhbHVlKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuX2FjY291bnREYXRhW2Nvbm5lY3Rpb25JZF07XG5cbiAgICAvLyBzYWZldHkgYmVsdC4gc2hvdWxkbid0IGhhcHBlbi4gYWNjb3VudERhdGEgaXMgc2V0IGluIG9uQ29ubmVjdGlvbixcbiAgICAvLyB3ZSBkb24ndCBoYXZlIGEgY29ubmVjdGlvbklkIHVudGlsIGl0IGlzIHNldC5cbiAgICBpZiAoIWRhdGEpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZClcbiAgICAgIGRlbGV0ZSBkYXRhW2ZpZWxkXTtcbiAgICBlbHNlXG4gICAgICBkYXRhW2ZpZWxkXSA9IHZhbHVlO1xuICB9O1xuXG4gIC8vL1xuICAvLy8gUkVDT05ORUNUIFRPS0VOU1xuICAvLy9cbiAgLy8vIHN1cHBvcnQgcmVjb25uZWN0aW5nIHVzaW5nIGEgbWV0ZW9yIGxvZ2luIHRva2VuXG5cbiAgX2hhc2hMb2dpblRva2VuKGxvZ2luVG9rZW4pIHtcbiAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpO1xuICAgIGhhc2gudXBkYXRlKGxvZ2luVG9rZW4pO1xuICAgIHJldHVybiBoYXNoLmRpZ2VzdCgnYmFzZTY0Jyk7XG4gIH07XG5cbiAgLy8ge3Rva2VuLCB3aGVufSA9PiB7aGFzaGVkVG9rZW4sIHdoZW59XG4gIF9oYXNoU3RhbXBlZFRva2VuKHN0YW1wZWRUb2tlbikge1xuICAgIGNvbnN0IHsgdG9rZW4sIC4uLmhhc2hlZFN0YW1wZWRUb2tlbiB9ID0gc3RhbXBlZFRva2VuO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5oYXNoZWRTdGFtcGVkVG9rZW4sXG4gICAgICBoYXNoZWRUb2tlbjogdGhpcy5faGFzaExvZ2luVG9rZW4odG9rZW4pXG4gICAgfTtcbiAgfTtcblxuICAvLyBVc2luZyAkYWRkVG9TZXQgYXZvaWRzIGdldHRpbmcgYW4gaW5kZXggZXJyb3IgaWYgYW5vdGhlciBjbGllbnRcbiAgLy8gbG9nZ2luZyBpbiBzaW11bHRhbmVvdXNseSBoYXMgYWxyZWFkeSBpbnNlcnRlZCB0aGUgbmV3IGhhc2hlZFxuICAvLyB0b2tlbi5cbiAgYXN5bmMgX2luc2VydEhhc2hlZExvZ2luVG9rZW4odXNlcklkLCBoYXNoZWRUb2tlbiwgcXVlcnkpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5ID8geyAuLi5xdWVyeSB9IDoge307XG4gICAgcXVlcnkuX2lkID0gdXNlcklkO1xuICAgIGF3YWl0IHRoaXMudXNlcnMudXBkYXRlQXN5bmMocXVlcnksIHtcbiAgICAgICRhZGRUb1NldDoge1xuICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiBoYXNoZWRUb2tlblxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIEV4cG9ydGVkIGZvciB0ZXN0cy5cbiAgYXN5bmMgX2luc2VydExvZ2luVG9rZW4odXNlcklkLCBzdGFtcGVkVG9rZW4sIHF1ZXJ5KSB7XG4gICAgYXdhaXQgdGhpcy5faW5zZXJ0SGFzaGVkTG9naW5Ub2tlbihcbiAgICAgIHVzZXJJZCxcbiAgICAgIHRoaXMuX2hhc2hTdGFtcGVkVG9rZW4oc3RhbXBlZFRva2VuKSxcbiAgICAgIHF1ZXJ5XG4gICAgKTtcbiAgfTtcblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHVzZXJJZFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIF9jbGVhckFsbExvZ2luVG9rZW5zKHVzZXJJZCkge1xuICAgIHRoaXMudXNlcnMudXBkYXRlQXN5bmModXNlcklkLCB7XG4gICAgICAkc2V0OiB7XG4gICAgICAgICdzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMnOiBbXVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIHRlc3QgaG9va1xuICBfZ2V0VXNlck9ic2VydmUoY29ubmVjdGlvbklkKSB7XG4gICAgcmV0dXJuIHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb25JZF07XG4gIH07XG5cbiAgLy8gQ2xlYW4gdXAgdGhpcyBjb25uZWN0aW9uJ3MgYXNzb2NpYXRpb24gd2l0aCB0aGUgdG9rZW46IHRoYXQgaXMsIHN0b3BcbiAgLy8gdGhlIG9ic2VydmUgdGhhdCB3ZSBzdGFydGVkIHdoZW4gd2UgYXNzb2NpYXRlZCB0aGUgY29ubmVjdGlvbiB3aXRoXG4gIC8vIHRoaXMgdG9rZW4uXG4gIF9yZW1vdmVUb2tlbkZyb21Db25uZWN0aW9uKGNvbm5lY3Rpb25JZCkge1xuICAgIGlmIChoYXNPd24uY2FsbCh0aGlzLl91c2VyT2JzZXJ2ZXNGb3JDb25uZWN0aW9ucywgY29ubmVjdGlvbklkKSkge1xuICAgICAgY29uc3Qgb2JzZXJ2ZSA9IHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb25JZF07XG4gICAgICBpZiAodHlwZW9mIG9ic2VydmUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIC8vIFdlJ3JlIGluIHRoZSBwcm9jZXNzIG9mIHNldHRpbmcgdXAgYW4gb2JzZXJ2ZSBmb3IgdGhpcyBjb25uZWN0aW9uLiBXZVxuICAgICAgICAvLyBjYW4ndCBjbGVhbiB1cCB0aGF0IG9ic2VydmUgeWV0LCBidXQgaWYgd2UgZGVsZXRlIHRoZSBwbGFjZWhvbGRlciBmb3JcbiAgICAgICAgLy8gdGhpcyBjb25uZWN0aW9uLCB0aGVuIHRoZSBvYnNlcnZlIHdpbGwgZ2V0IGNsZWFuZWQgdXAgYXMgc29vbiBhcyBpdCBoYXNcbiAgICAgICAgLy8gYmVlbiBzZXQgdXAuXG4gICAgICAgIGRlbGV0ZSB0aGlzLl91c2VyT2JzZXJ2ZXNGb3JDb25uZWN0aW9uc1tjb25uZWN0aW9uSWRdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb25JZF07XG4gICAgICAgIG9ic2VydmUuc3RvcCgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBfZ2V0TG9naW5Ub2tlbihjb25uZWN0aW9uSWQpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0QWNjb3VudERhdGEoY29ubmVjdGlvbklkLCAnbG9naW5Ub2tlbicpO1xuICB9O1xuXG4gIC8vIG5ld1Rva2VuIGlzIGEgaGFzaGVkIHRva2VuLlxuICBfc2V0TG9naW5Ub2tlbih1c2VySWQsIGNvbm5lY3Rpb24sIG5ld1Rva2VuKSB7XG4gICAgdGhpcy5fcmVtb3ZlVG9rZW5Gcm9tQ29ubmVjdGlvbihjb25uZWN0aW9uLmlkKTtcbiAgICB0aGlzLl9zZXRBY2NvdW50RGF0YShjb25uZWN0aW9uLmlkLCAnbG9naW5Ub2tlbicsIG5ld1Rva2VuKTtcblxuICAgIGlmIChuZXdUb2tlbikge1xuICAgICAgLy8gU2V0IHVwIGFuIG9ic2VydmUgZm9yIHRoaXMgdG9rZW4uIElmIHRoZSB0b2tlbiBnb2VzIGF3YXksIHdlIG5lZWRcbiAgICAgIC8vIHRvIGNsb3NlIHRoZSBjb25uZWN0aW9uLiAgV2UgZGVmZXIgdGhlIG9ic2VydmUgYmVjYXVzZSB0aGVyZSdzXG4gICAgICAvLyBubyBuZWVkIGZvciBpdCB0byBiZSBvbiB0aGUgY3JpdGljYWwgcGF0aCBmb3IgbG9naW47IHdlIGp1c3QgbmVlZFxuICAgICAgLy8gdG8gZW5zdXJlIHRoYXQgdGhlIGNvbm5lY3Rpb24gd2lsbCBnZXQgY2xvc2VkIGF0IHNvbWUgcG9pbnQgaWZcbiAgICAgIC8vIHRoZSB0b2tlbiBnZXRzIGRlbGV0ZWQuXG4gICAgICAvL1xuICAgICAgLy8gSW5pdGlhbGx5LCB3ZSBzZXQgdGhlIG9ic2VydmUgZm9yIHRoaXMgY29ubmVjdGlvbiB0byBhIG51bWJlcjsgdGhpc1xuICAgICAgLy8gc2lnbmlmaWVzIHRvIG90aGVyIGNvZGUgKHdoaWNoIG1pZ2h0IHJ1biB3aGlsZSB3ZSB5aWVsZCkgdGhhdCB3ZSBhcmUgaW5cbiAgICAgIC8vIHRoZSBwcm9jZXNzIG9mIHNldHRpbmcgdXAgYW4gb2JzZXJ2ZSBmb3IgdGhpcyBjb25uZWN0aW9uLiBPbmNlIHRoZVxuICAgICAgLy8gb2JzZXJ2ZSBpcyByZWFkeSB0byBnbywgd2UgcmVwbGFjZSB0aGUgbnVtYmVyIHdpdGggdGhlIHJlYWwgb2JzZXJ2ZVxuICAgICAgLy8gaGFuZGxlICh1bmxlc3MgdGhlIHBsYWNlaG9sZGVyIGhhcyBiZWVuIGRlbGV0ZWQgb3IgcmVwbGFjZWQgYnkgYVxuICAgICAgLy8gZGlmZmVyZW50IHBsYWNlaG9sZCBudW1iZXIsIHNpZ25pZnlpbmcgdGhhdCB0aGUgY29ubmVjdGlvbiB3YXMgY2xvc2VkXG4gICAgICAvLyBhbHJlYWR5IC0tIGluIHRoaXMgY2FzZSB3ZSBqdXN0IGNsZWFuIHVwIHRoZSBvYnNlcnZlIHRoYXQgd2Ugc3RhcnRlZCkuXG4gICAgICBjb25zdCBteU9ic2VydmVOdW1iZXIgPSArK3RoaXMuX25leHRVc2VyT2JzZXJ2ZU51bWJlcjtcbiAgICAgIHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb24uaWRdID0gbXlPYnNlcnZlTnVtYmVyO1xuICAgICAgTWV0ZW9yLmRlZmVyKGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gSWYgc29tZXRoaW5nIGVsc2UgaGFwcGVuZWQgb24gdGhpcyBjb25uZWN0aW9uIGluIHRoZSBtZWFudGltZSAoaXQgZ290XG4gICAgICAgIC8vIGNsb3NlZCwgb3IgYW5vdGhlciBjYWxsIHRvIF9zZXRMb2dpblRva2VuIGhhcHBlbmVkKSwganVzdCBkb1xuICAgICAgICAvLyBub3RoaW5nLiBXZSBkb24ndCBuZWVkIHRvIHN0YXJ0IGFuIG9ic2VydmUgZm9yIGFuIG9sZCBjb25uZWN0aW9uIG9yIG9sZFxuICAgICAgICAvLyB0b2tlbi5cbiAgICAgICAgaWYgKHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb24uaWRdICE9PSBteU9ic2VydmVOdW1iZXIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZm91bmRNYXRjaGluZ1VzZXI7XG4gICAgICAgIC8vIEJlY2F1c2Ugd2UgdXBncmFkZSB1bmhhc2hlZCBsb2dpbiB0b2tlbnMgdG8gaGFzaGVkIHRva2VucyBhdFxuICAgICAgICAvLyBsb2dpbiB0aW1lLCBzZXNzaW9ucyB3aWxsIG9ubHkgYmUgbG9nZ2VkIGluIHdpdGggYSBoYXNoZWRcbiAgICAgICAgLy8gdG9rZW4uIFRodXMgd2Ugb25seSBuZWVkIHRvIG9ic2VydmUgaGFzaGVkIHRva2VucyBoZXJlLlxuICAgICAgICBjb25zdCBvYnNlcnZlID0gYXdhaXQgdGhpcy51c2Vycy5maW5kKHtcbiAgICAgICAgICBfaWQ6IHVzZXJJZCxcbiAgICAgICAgICAnc2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLmhhc2hlZFRva2VuJzogbmV3VG9rZW5cbiAgICAgICAgfSwgeyBmaWVsZHM6IHsgX2lkOiAxIH0gfSkub2JzZXJ2ZUNoYW5nZXMoe1xuICAgICAgICAgIGFkZGVkOiAoKSA9PiB7XG4gICAgICAgICAgICBmb3VuZE1hdGNoaW5nVXNlciA9IHRydWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZW1vdmVkOiBjb25uZWN0aW9uLmNsb3NlLFxuICAgICAgICAgIC8vIFRoZSBvbkNsb3NlIGNhbGxiYWNrIGZvciB0aGUgY29ubmVjdGlvbiB0YWtlcyBjYXJlIG9mXG4gICAgICAgICAgLy8gY2xlYW5pbmcgdXAgdGhlIG9ic2VydmUgaGFuZGxlIGFuZCBhbnkgb3RoZXIgc3RhdGUgd2UgaGF2ZVxuICAgICAgICAgIC8vIGx5aW5nIGFyb3VuZC5cbiAgICAgICAgfSwgeyBub25NdXRhdGluZ0NhbGxiYWNrczogdHJ1ZSB9KTtcblxuICAgICAgICAvLyBJZiB0aGUgdXNlciByYW4gYW5vdGhlciBsb2dpbiBvciBsb2dvdXQgY29tbWFuZCB3ZSB3ZXJlIHdhaXRpbmcgZm9yIHRoZVxuICAgICAgICAvLyBkZWZlciBvciBhZGRlZCB0byBmaXJlIChpZSwgYW5vdGhlciBjYWxsIHRvIF9zZXRMb2dpblRva2VuIG9jY3VycmVkKSxcbiAgICAgICAgLy8gdGhlbiB3ZSBsZXQgdGhlIGxhdGVyIG9uZSB3aW4gKHN0YXJ0IGFuIG9ic2VydmUsIGV0YykgYW5kIGp1c3Qgc3RvcCBvdXJcbiAgICAgICAgLy8gb2JzZXJ2ZSBub3cuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFNpbWlsYXJseSwgaWYgdGhlIGNvbm5lY3Rpb24gd2FzIGFscmVhZHkgY2xvc2VkLCB0aGVuIHRoZSBvbkNsb3NlXG4gICAgICAgIC8vIGNhbGxiYWNrIHdvdWxkIGhhdmUgY2FsbGVkIF9yZW1vdmVUb2tlbkZyb21Db25uZWN0aW9uIGFuZCB0aGVyZSB3b24ndFxuICAgICAgICAvLyBiZSBhbiBlbnRyeSBpbiBfdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnMuIFdlIGNhbiBzdG9wIHRoZSBvYnNlcnZlLlxuICAgICAgICBpZiAodGhpcy5fdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnNbY29ubmVjdGlvbi5pZF0gIT09IG15T2JzZXJ2ZU51bWJlcikge1xuICAgICAgICAgIG9ic2VydmUuc3RvcCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb24uaWRdID0gb2JzZXJ2ZTtcblxuICAgICAgICBpZiAoISBmb3VuZE1hdGNoaW5nVXNlcikge1xuICAgICAgICAgIC8vIFdlJ3ZlIHNldCB1cCBhbiBvYnNlcnZlIG9uIHRoZSB1c2VyIGFzc29jaWF0ZWQgd2l0aCBgbmV3VG9rZW5gLFxuICAgICAgICAgIC8vIHNvIGlmIHRoZSBuZXcgdG9rZW4gaXMgcmVtb3ZlZCBmcm9tIHRoZSBkYXRhYmFzZSwgd2UnbGwgY2xvc2VcbiAgICAgICAgICAvLyB0aGUgY29ubmVjdGlvbi4gQnV0IHRoZSB0b2tlbiBtaWdodCBoYXZlIGFscmVhZHkgYmVlbiBkZWxldGVkXG4gICAgICAgICAgLy8gYmVmb3JlIHdlIHNldCB1cCB0aGUgb2JzZXJ2ZSwgd2hpY2ggd291bGRuJ3QgaGF2ZSBjbG9zZWQgdGhlXG4gICAgICAgICAgLy8gY29ubmVjdGlvbiBiZWNhdXNlIHRoZSBvYnNlcnZlIHdhc24ndCBydW5uaW5nIHlldC5cbiAgICAgICAgICBjb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvLyAoQWxzbyB1c2VkIGJ5IE1ldGVvciBBY2NvdW50cyBzZXJ2ZXIgYW5kIHRlc3RzKS5cbiAgLy9cbiAgX2dlbmVyYXRlU3RhbXBlZExvZ2luVG9rZW4oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRva2VuOiBSYW5kb20uc2VjcmV0KCksXG4gICAgICB3aGVuOiBuZXcgRGF0ZVxuICAgIH07XG4gIH07XG5cbiAgLy8vXG4gIC8vLyBUT0tFTiBFWFBJUkFUSU9OXG4gIC8vL1xuXG4gIC8vIERlbGV0ZXMgZXhwaXJlZCBwYXNzd29yZCByZXNldCB0b2tlbnMgZnJvbSB0aGUgZGF0YWJhc2UuXG4gIC8vXG4gIC8vIEV4cG9ydGVkIGZvciB0ZXN0cy4gQWxzbywgdGhlIGFyZ3VtZW50cyBhcmUgb25seSB1c2VkIGJ5XG4gIC8vIHRlc3RzLiBvbGRlc3RWYWxpZERhdGUgaXMgc2ltdWxhdGUgZXhwaXJpbmcgdG9rZW5zIHdpdGhvdXQgd2FpdGluZ1xuICAvLyBmb3IgdGhlbSB0byBhY3R1YWxseSBleHBpcmUuIHVzZXJJZCBpcyB1c2VkIGJ5IHRlc3RzIHRvIG9ubHkgZXhwaXJlXG4gIC8vIHRva2VucyBmb3IgdGhlIHRlc3QgdXNlci5cbiAgYXN5bmMgX2V4cGlyZVBhc3N3b3JkUmVzZXRUb2tlbnMob2xkZXN0VmFsaWREYXRlLCB1c2VySWQpIHtcbiAgICBjb25zdCB0b2tlbkxpZmV0aW1lTXMgPSB0aGlzLl9nZXRQYXNzd29yZFJlc2V0VG9rZW5MaWZldGltZU1zKCk7XG5cbiAgICAvLyB3aGVuIGNhbGxpbmcgZnJvbSBhIHRlc3Qgd2l0aCBleHRyYSBhcmd1bWVudHMsIHlvdSBtdXN0IHNwZWNpZnkgYm90aCFcbiAgICBpZiAoKG9sZGVzdFZhbGlkRGF0ZSAmJiAhdXNlcklkKSB8fCAoIW9sZGVzdFZhbGlkRGF0ZSAmJiB1c2VySWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCYWQgdGVzdC4gTXVzdCBzcGVjaWZ5IGJvdGggb2xkZXN0VmFsaWREYXRlIGFuZCB1c2VySWQuXCIpO1xuICAgIH1cblxuICAgIG9sZGVzdFZhbGlkRGF0ZSA9IG9sZGVzdFZhbGlkRGF0ZSB8fFxuICAgICAgKG5ldyBEYXRlKG5ldyBEYXRlKCkgLSB0b2tlbkxpZmV0aW1lTXMpKTtcblxuICAgIGNvbnN0IHRva2VuRmlsdGVyID0ge1xuICAgICAgJG9yOiBbXG4gICAgICAgIHsgXCJzZXJ2aWNlcy5wYXNzd29yZC5yZXNldC5yZWFzb25cIjogXCJyZXNldFwifSxcbiAgICAgICAgeyBcInNlcnZpY2VzLnBhc3N3b3JkLnJlc2V0LnJlYXNvblwiOiB7JGV4aXN0czogZmFsc2V9fVxuICAgICAgXVxuICAgIH07XG5cbiAgIGF3YWl0IGV4cGlyZVBhc3N3b3JkVG9rZW4odGhpcywgb2xkZXN0VmFsaWREYXRlLCB0b2tlbkZpbHRlciwgdXNlcklkKTtcbiAgfVxuXG4gIC8vIERlbGV0ZXMgZXhwaXJlZCBwYXNzd29yZCBlbnJvbGwgdG9rZW5zIGZyb20gdGhlIGRhdGFiYXNlLlxuICAvL1xuICAvLyBFeHBvcnRlZCBmb3IgdGVzdHMuIEFsc28sIHRoZSBhcmd1bWVudHMgYXJlIG9ubHkgdXNlZCBieVxuICAvLyB0ZXN0cy4gb2xkZXN0VmFsaWREYXRlIGlzIHNpbXVsYXRlIGV4cGlyaW5nIHRva2VucyB3aXRob3V0IHdhaXRpbmdcbiAgLy8gZm9yIHRoZW0gdG8gYWN0dWFsbHkgZXhwaXJlLiB1c2VySWQgaXMgdXNlZCBieSB0ZXN0cyB0byBvbmx5IGV4cGlyZVxuICAvLyB0b2tlbnMgZm9yIHRoZSB0ZXN0IHVzZXIuXG4gIGFzeW5jIF9leHBpcmVQYXNzd29yZEVucm9sbFRva2VucyhvbGRlc3RWYWxpZERhdGUsIHVzZXJJZCkge1xuICAgIGNvbnN0IHRva2VuTGlmZXRpbWVNcyA9IHRoaXMuX2dldFBhc3N3b3JkRW5yb2xsVG9rZW5MaWZldGltZU1zKCk7XG5cbiAgICAvLyB3aGVuIGNhbGxpbmcgZnJvbSBhIHRlc3Qgd2l0aCBleHRyYSBhcmd1bWVudHMsIHlvdSBtdXN0IHNwZWNpZnkgYm90aCFcbiAgICBpZiAoKG9sZGVzdFZhbGlkRGF0ZSAmJiAhdXNlcklkKSB8fCAoIW9sZGVzdFZhbGlkRGF0ZSAmJiB1c2VySWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCYWQgdGVzdC4gTXVzdCBzcGVjaWZ5IGJvdGggb2xkZXN0VmFsaWREYXRlIGFuZCB1c2VySWQuXCIpO1xuICAgIH1cblxuICAgIG9sZGVzdFZhbGlkRGF0ZSA9IG9sZGVzdFZhbGlkRGF0ZSB8fFxuICAgICAgKG5ldyBEYXRlKG5ldyBEYXRlKCkgLSB0b2tlbkxpZmV0aW1lTXMpKTtcblxuICAgIGNvbnN0IHRva2VuRmlsdGVyID0ge1xuICAgICAgXCJzZXJ2aWNlcy5wYXNzd29yZC5lbnJvbGwucmVhc29uXCI6IFwiZW5yb2xsXCJcbiAgICB9O1xuXG4gICAgYXdhaXQgZXhwaXJlUGFzc3dvcmRUb2tlbih0aGlzLCBvbGRlc3RWYWxpZERhdGUsIHRva2VuRmlsdGVyLCB1c2VySWQpO1xuICB9XG5cbiAgLy8gRGVsZXRlcyBleHBpcmVkIHRva2VucyBmcm9tIHRoZSBkYXRhYmFzZSBhbmQgY2xvc2VzIGFsbCBvcGVuIGNvbm5lY3Rpb25zXG4gIC8vIGFzc29jaWF0ZWQgd2l0aCB0aGVzZSB0b2tlbnMuXG4gIC8vXG4gIC8vIEV4cG9ydGVkIGZvciB0ZXN0cy4gQWxzbywgdGhlIGFyZ3VtZW50cyBhcmUgb25seSB1c2VkIGJ5XG4gIC8vIHRlc3RzLiBvbGRlc3RWYWxpZERhdGUgaXMgc2ltdWxhdGUgZXhwaXJpbmcgdG9rZW5zIHdpdGhvdXQgd2FpdGluZ1xuICAvLyBmb3IgdGhlbSB0byBhY3R1YWxseSBleHBpcmUuIHVzZXJJZCBpcyB1c2VkIGJ5IHRlc3RzIHRvIG9ubHkgZXhwaXJlXG4gIC8vIHRva2VucyBmb3IgdGhlIHRlc3QgdXNlci5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBvbGRlc3RWYWxpZERhdGVcbiAgICogQHBhcmFtIHVzZXJJZFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgYXN5bmMgX2V4cGlyZVRva2VucyhvbGRlc3RWYWxpZERhdGUsIHVzZXJJZCkge1xuICAgIGNvbnN0IHRva2VuTGlmZXRpbWVNcyA9IHRoaXMuX2dldFRva2VuTGlmZXRpbWVNcygpO1xuXG4gICAgLy8gd2hlbiBjYWxsaW5nIGZyb20gYSB0ZXN0IHdpdGggZXh0cmEgYXJndW1lbnRzLCB5b3UgbXVzdCBzcGVjaWZ5IGJvdGghXG4gICAgaWYgKChvbGRlc3RWYWxpZERhdGUgJiYgIXVzZXJJZCkgfHwgKCFvbGRlc3RWYWxpZERhdGUgJiYgdXNlcklkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQmFkIHRlc3QuIE11c3Qgc3BlY2lmeSBib3RoIG9sZGVzdFZhbGlkRGF0ZSBhbmQgdXNlcklkLlwiKTtcbiAgICB9XG5cbiAgICBvbGRlc3RWYWxpZERhdGUgPSBvbGRlc3RWYWxpZERhdGUgfHxcbiAgICAgIChuZXcgRGF0ZShuZXcgRGF0ZSgpIC0gdG9rZW5MaWZldGltZU1zKSk7XG4gICAgY29uc3QgdXNlckZpbHRlciA9IHVzZXJJZCA/IHtfaWQ6IHVzZXJJZH0gOiB7fTtcblxuXG4gICAgLy8gQmFja3dhcmRzIGNvbXBhdGlibGUgd2l0aCBvbGRlciB2ZXJzaW9ucyBvZiBtZXRlb3IgdGhhdCBzdG9yZWQgbG9naW4gdG9rZW5cbiAgICAvLyB0aW1lc3RhbXBzIGFzIG51bWJlcnMuXG4gICAgYXdhaXQgdGhpcy51c2Vycy51cGRhdGVBc3luYyh7IC4uLnVzZXJGaWx0ZXIsXG4gICAgICAkb3I6IFtcbiAgICAgICAgeyBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucy53aGVuXCI6IHsgJGx0OiBvbGRlc3RWYWxpZERhdGUgfSB9LFxuICAgICAgICB7IFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLndoZW5cIjogeyAkbHQ6ICtvbGRlc3RWYWxpZERhdGUgfSB9XG4gICAgICBdXG4gICAgfSwge1xuICAgICAgJHB1bGw6IHtcbiAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNcIjoge1xuICAgICAgICAgICRvcjogW1xuICAgICAgICAgICAgeyB3aGVuOiB7ICRsdDogb2xkZXN0VmFsaWREYXRlIH0gfSxcbiAgICAgICAgICAgIHsgd2hlbjogeyAkbHQ6ICtvbGRlc3RWYWxpZERhdGUgfSB9XG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgeyBtdWx0aTogdHJ1ZSB9KTtcbiAgICAvLyBUaGUgb2JzZXJ2ZSBvbiBNZXRlb3IudXNlcnMgd2lsbCB0YWtlIGNhcmUgb2YgY2xvc2luZyBjb25uZWN0aW9ucyBmb3JcbiAgICAvLyBleHBpcmVkIHRva2Vucy5cbiAgfTtcblxuICAvLyBAb3ZlcnJpZGUgZnJvbSBhY2NvdW50c19jb21tb24uanNcbiAgY29uZmlnKG9wdGlvbnMpIHtcbiAgICAvLyBDYWxsIHRoZSBvdmVycmlkZGVuIGltcGxlbWVudGF0aW9uIG9mIHRoZSBtZXRob2QuXG4gICAgY29uc3Qgc3VwZXJSZXN1bHQgPSBBY2NvdW50c0NvbW1vbi5wcm90b3R5cGUuY29uZmlnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAvLyBJZiB0aGUgdXNlciBzZXQgbG9naW5FeHBpcmF0aW9uSW5EYXlzIHRvIG51bGwsIHRoZW4gd2UgbmVlZCB0byBjbGVhciB0aGVcbiAgICAvLyB0aW1lciB0aGF0IHBlcmlvZGljYWxseSBleHBpcmVzIHRva2Vucy5cbiAgICBpZiAoaGFzT3duLmNhbGwodGhpcy5fb3B0aW9ucywgJ2xvZ2luRXhwaXJhdGlvbkluRGF5cycpICYmXG4gICAgICB0aGlzLl9vcHRpb25zLmxvZ2luRXhwaXJhdGlvbkluRGF5cyA9PT0gbnVsbCAmJlxuICAgICAgdGhpcy5leHBpcmVUb2tlbkludGVydmFsKSB7XG4gICAgICBNZXRlb3IuY2xlYXJJbnRlcnZhbCh0aGlzLmV4cGlyZVRva2VuSW50ZXJ2YWwpO1xuICAgICAgdGhpcy5leHBpcmVUb2tlbkludGVydmFsID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXJSZXN1bHQ7XG4gIH07XG5cbiAgLy8gQ2FsbGVkIGJ5IGFjY291bnRzLXBhc3N3b3JkXG4gIGFzeW5jIGluc2VydFVzZXJEb2Mob3B0aW9ucywgdXNlcikge1xuICAgIC8vIC0gY2xvbmUgdXNlciBkb2N1bWVudCwgdG8gcHJvdGVjdCBmcm9tIG1vZGlmaWNhdGlvblxuICAgIC8vIC0gYWRkIGNyZWF0ZWRBdCB0aW1lc3RhbXBcbiAgICAvLyAtIHByZXBhcmUgYW4gX2lkLCBzbyB0aGF0IHlvdSBjYW4gbW9kaWZ5IG90aGVyIGNvbGxlY3Rpb25zIChlZ1xuICAgIC8vIGNyZWF0ZSBhIGZpcnN0IHRhc2sgZm9yIGV2ZXJ5IG5ldyB1c2VyKVxuICAgIC8vXG4gICAgLy8gWFhYIElmIHRoZSBvbkNyZWF0ZVVzZXIgb3IgdmFsaWRhdGVOZXdVc2VyIGhvb2tzIGZhaWwsIHdlIG1pZ2h0XG4gICAgLy8gZW5kIHVwIGhhdmluZyBtb2RpZmllZCBzb21lIG90aGVyIGNvbGxlY3Rpb25cbiAgICAvLyBpbmFwcHJvcHJpYXRlbHkuIFRoZSBzb2x1dGlvbiBpcyBwcm9iYWJseSB0byBoYXZlIG9uQ3JlYXRlVXNlclxuICAgIC8vIGFjY2VwdCB0d28gY2FsbGJhY2tzIC0gb25lIHRoYXQgZ2V0cyBjYWxsZWQgYmVmb3JlIGluc2VydGluZ1xuICAgIC8vIHRoZSB1c2VyIGRvY3VtZW50IChpbiB3aGljaCB5b3UgY2FuIG1vZGlmeSBpdHMgY29udGVudHMpLCBhbmRcbiAgICAvLyBvbmUgdGhhdCBnZXRzIGNhbGxlZCBhZnRlciAoaW4gd2hpY2ggeW91IHNob3VsZCBjaGFuZ2Ugb3RoZXJcbiAgICAvLyBjb2xsZWN0aW9ucylcbiAgICB1c2VyID0ge1xuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgX2lkOiBSYW5kb20uaWQoKSxcbiAgICAgIC4uLnVzZXIsXG4gICAgfTtcblxuICAgIGlmICh1c2VyLnNlcnZpY2VzKSB7XG4gICAgICBPYmplY3Qua2V5cyh1c2VyLnNlcnZpY2VzKS5mb3JFYWNoKHNlcnZpY2UgPT5cbiAgICAgICAgcGluRW5jcnlwdGVkRmllbGRzVG9Vc2VyKHVzZXIuc2VydmljZXNbc2VydmljZV0sIHVzZXIuX2lkKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgZnVsbFVzZXI7XG4gICAgaWYgKHRoaXMuX29uQ3JlYXRlVXNlckhvb2spIHtcbiAgICAgIC8vIEFsbG93cyBfb25DcmVhdGVVc2VySG9vayB0byBiZSBhIHByb21pc2UgcmV0dXJuaW5nIGZ1bmNcbiAgICAgIGZ1bGxVc2VyID0gYXdhaXQgdGhpcy5fb25DcmVhdGVVc2VySG9vayhvcHRpb25zLCB1c2VyKTtcblxuICAgICAgLy8gVGhpcyBpcyAqbm90KiBwYXJ0IG9mIHRoZSBBUEkuIFdlIG5lZWQgdGhpcyBiZWNhdXNlIHdlIGNhbid0IGlzb2xhdGVcbiAgICAgIC8vIHRoZSBnbG9iYWwgc2VydmVyIGVudmlyb25tZW50IGJldHdlZW4gdGVzdHMsIG1lYW5pbmcgd2UgY2FuJ3QgdGVzdFxuICAgICAgLy8gYm90aCBoYXZpbmcgYSBjcmVhdGUgdXNlciBob29rIHNldCBhbmQgbm90IGhhdmluZyBvbmUgc2V0LlxuICAgICAgaWYgKGZ1bGxVc2VyID09PSAnVEVTVCBERUZBVUxUIEhPT0snKVxuICAgICAgICBmdWxsVXNlciA9IGRlZmF1bHRDcmVhdGVVc2VySG9vayhvcHRpb25zLCB1c2VyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVsbFVzZXIgPSBkZWZhdWx0Q3JlYXRlVXNlckhvb2sob3B0aW9ucywgdXNlcik7XG4gICAgfVxuXG4gICAgZm9yIGF3YWl0IChjb25zdCBob29rIG9mIHRoaXMuX3ZhbGlkYXRlTmV3VXNlckhvb2tzKSB7XG4gICAgICBpZiAoISBhd2FpdCBob29rKGZ1bGxVc2VyKSlcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlciB2YWxpZGF0aW9uIGZhaWxlZFwiKTtcbiAgICB9XG5cbiAgICBsZXQgdXNlcklkO1xuICAgIHRyeSB7XG4gICAgICB1c2VySWQgPSBhd2FpdCB0aGlzLnVzZXJzLmluc2VydEFzeW5jKGZ1bGxVc2VyKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBYWFggc3RyaW5nIHBhcnNpbmcgc3Vja3MsIG1heWJlXG4gICAgICAvLyBodHRwczovL2ppcmEubW9uZ29kYi5vcmcvYnJvd3NlL1NFUlZFUi0zMDY5IHdpbGwgZ2V0IGZpeGVkIG9uZSBkYXlcbiAgICAgIC8vIGh0dHBzOi8vamlyYS5tb25nb2RiLm9yZy9icm93c2UvU0VSVkVSLTQ2MzdcbiAgICAgIGlmICghZS5lcnJtc2cpIHRocm93IGU7XG4gICAgICBpZiAoZS5lcnJtc2cuaW5jbHVkZXMoJ2VtYWlscy5hZGRyZXNzJykpXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIkVtYWlsIGFscmVhZHkgZXhpc3RzLlwiKTtcbiAgICAgIGlmIChlLmVycm1zZy5pbmNsdWRlcygndXNlcm5hbWUnKSlcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlcm5hbWUgYWxyZWFkeSBleGlzdHMuXCIpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgcmV0dXJuIHVzZXJJZDtcbiAgfTtcblxuICAvLyBIZWxwZXIgZnVuY3Rpb246IHJldHVybnMgZmFsc2UgaWYgZW1haWwgZG9lcyBub3QgbWF0Y2ggY29tcGFueSBkb21haW4gZnJvbVxuICAvLyB0aGUgY29uZmlndXJhdGlvbi5cbiAgX3Rlc3RFbWFpbERvbWFpbihlbWFpbCkge1xuICAgIGNvbnN0IGRvbWFpbiA9IHRoaXMuX29wdGlvbnMucmVzdHJpY3RDcmVhdGlvbkJ5RW1haWxEb21haW47XG5cbiAgICByZXR1cm4gIWRvbWFpbiB8fFxuICAgICAgKHR5cGVvZiBkb21haW4gPT09ICdmdW5jdGlvbicgJiYgZG9tYWluKGVtYWlsKSkgfHxcbiAgICAgICh0eXBlb2YgZG9tYWluID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAobmV3IFJlZ0V4cChgQCR7TWV0ZW9yLl9lc2NhcGVSZWdFeHAoZG9tYWluKX0kYCwgJ2knKSkudGVzdChlbWFpbCkpO1xuICB9O1xuXG4gIC8vL1xuICAvLy8gQ0xFQU4gVVAgRk9SIGBsb2dvdXRPdGhlckNsaWVudHNgXG4gIC8vL1xuXG4gIGFzeW5jIF9kZWxldGVTYXZlZFRva2Vuc0ZvclVzZXIodXNlcklkLCB0b2tlbnNUb0RlbGV0ZSkge1xuICAgIGlmICh0b2tlbnNUb0RlbGV0ZSkge1xuICAgICAgYXdhaXQgdGhpcy51c2Vycy51cGRhdGVBc3luYyh1c2VySWQsIHtcbiAgICAgICAgJHVuc2V0OiB7XG4gICAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUuaGF2ZUxvZ2luVG9rZW5zVG9EZWxldGVcIjogMSxcbiAgICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1RvRGVsZXRlXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgJHB1bGxBbGw6IHtcbiAgICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiB0b2tlbnNUb0RlbGV0ZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgX2RlbGV0ZVNhdmVkVG9rZW5zRm9yQWxsVXNlcnNPblN0YXJ0dXAoKSB7XG4gICAgLy8gSWYgd2UgZmluZCB1c2VycyB3aG8gaGF2ZSBzYXZlZCB0b2tlbnMgdG8gZGVsZXRlIG9uIHN0YXJ0dXAsIGRlbGV0ZVxuICAgIC8vIHRoZW0gbm93LiBJdCdzIHBvc3NpYmxlIHRoYXQgdGhlIHNlcnZlciBjb3VsZCBoYXZlIGNyYXNoZWQgYW5kIGNvbWVcbiAgICAvLyBiYWNrIHVwIGJlZm9yZSBuZXcgdG9rZW5zIGFyZSBmb3VuZCBpbiBsb2NhbFN0b3JhZ2UsIGJ1dCB0aGlzXG4gICAgLy8gc2hvdWxkbid0IGhhcHBlbiB2ZXJ5IG9mdGVuLiBXZSBzaG91bGRuJ3QgcHV0IGEgZGVsYXkgaGVyZSBiZWNhdXNlXG4gICAgLy8gdGhhdCB3b3VsZCBnaXZlIGEgbG90IG9mIHBvd2VyIHRvIGFuIGF0dGFja2VyIHdpdGggYSBzdG9sZW4gbG9naW5cbiAgICAvLyB0b2tlbiBhbmQgdGhlIGFiaWxpdHkgdG8gY3Jhc2ggdGhlIHNlcnZlci5cbiAgICBNZXRlb3Iuc3RhcnR1cChhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCB1c2VycyA9IGF3YWl0IHRoaXMudXNlcnMuZmluZCh7XG4gICAgICAgIFwic2VydmljZXMucmVzdW1lLmhhdmVMb2dpblRva2Vuc1RvRGVsZXRlXCI6IHRydWVcbiAgICAgIH0sIHtcbiAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNUb0RlbGV0ZVwiOiAxXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB1c2Vycy5mb3JFYWNoKHVzZXIgPT4ge1xuICAgICAgICB0aGlzLl9kZWxldGVTYXZlZFRva2Vuc0ZvclVzZXIoXG4gICAgICAgICAgdXNlci5faWQsXG4gICAgICAgICAgdXNlci5zZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNUb0RlbGV0ZVxuICAgICAgICApXG4gICAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0byB3YWl0IGZvciB0aGlzIHRvIGNvbXBsZXRlLlxuICAgICAgICAgIC50aGVuKF8gPT4gXylcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLy9cbiAgLy8vIE1BTkFHSU5HIFVTRVIgT0JKRUNUU1xuICAvLy9cblxuICAvLyBVcGRhdGVzIG9yIGNyZWF0ZXMgYSB1c2VyIGFmdGVyIHdlIGF1dGhlbnRpY2F0ZSB3aXRoIGEgM3JkIHBhcnR5LlxuICAvL1xuICAvLyBAcGFyYW0gc2VydmljZU5hbWUge1N0cmluZ30gU2VydmljZSBuYW1lIChlZywgdHdpdHRlcikuXG4gIC8vIEBwYXJhbSBzZXJ2aWNlRGF0YSB7T2JqZWN0fSBEYXRhIHRvIHN0b3JlIGluIHRoZSB1c2VyJ3MgcmVjb3JkXG4gIC8vICAgICAgICB1bmRlciBzZXJ2aWNlc1tzZXJ2aWNlTmFtZV0uIE11c3QgaW5jbHVkZSBhbiBcImlkXCIgZmllbGRcbiAgLy8gICAgICAgIHdoaWNoIGlzIGEgdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSB1c2VyIGluIHRoZSBzZXJ2aWNlLlxuICAvLyBAcGFyYW0gb3B0aW9ucyB7T2JqZWN0LCBvcHRpb25hbH0gT3RoZXIgb3B0aW9ucyB0byBwYXNzIHRvIGluc2VydFVzZXJEb2NcbiAgLy8gICAgICAgIChlZywgcHJvZmlsZSlcbiAgLy8gQHJldHVybnMge09iamVjdH0gT2JqZWN0IHdpdGggdG9rZW4gYW5kIGlkIGtleXMsIGxpa2UgdGhlIHJlc3VsdFxuICAvLyAgICAgICAgb2YgdGhlIFwibG9naW5cIiBtZXRob2QuXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZU9yQ3JlYXRlVXNlckZyb21FeHRlcm5hbFNlcnZpY2UoXG4gICAgc2VydmljZU5hbWUsXG4gICAgc2VydmljZURhdGEsXG4gICAgb3B0aW9uc1xuICApIHtcbiAgICBvcHRpb25zID0geyAuLi5vcHRpb25zIH07XG5cbiAgICBpZiAoc2VydmljZU5hbWUgPT09IFwicGFzc3dvcmRcIiB8fCBzZXJ2aWNlTmFtZSA9PT0gXCJyZXN1bWVcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcIkNhbid0IHVzZSB1cGRhdGVPckNyZWF0ZVVzZXJGcm9tRXh0ZXJuYWxTZXJ2aWNlIHdpdGggaW50ZXJuYWwgc2VydmljZSBcIlxuICAgICAgICArIHNlcnZpY2VOYW1lKTtcbiAgICB9XG4gICAgaWYgKCFoYXNPd24uY2FsbChzZXJ2aWNlRGF0YSwgJ2lkJykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFNlcnZpY2UgZGF0YSBmb3Igc2VydmljZSAke3NlcnZpY2VOYW1lfSBtdXN0IGluY2x1ZGUgaWRgKTtcbiAgICB9XG5cbiAgICAvLyBMb29rIGZvciBhIHVzZXIgd2l0aCB0aGUgYXBwcm9wcmlhdGUgc2VydmljZSB1c2VyIGlkLlxuICAgIGNvbnN0IHNlbGVjdG9yID0ge307XG4gICAgY29uc3Qgc2VydmljZUlkS2V5ID0gYHNlcnZpY2VzLiR7c2VydmljZU5hbWV9LmlkYDtcblxuICAgIC8vIFhYWCBUZW1wb3Jhcnkgc3BlY2lhbCBjYXNlIGZvciBUd2l0dGVyLiAoSXNzdWUgIzYyOSlcbiAgICAvLyAgIFRoZSBzZXJ2aWNlRGF0YS5pZCB3aWxsIGJlIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGFuIGludGVnZXIuXG4gICAgLy8gICBXZSB3YW50IGl0IHRvIG1hdGNoIGVpdGhlciBhIHN0b3JlZCBzdHJpbmcgb3IgaW50IHJlcHJlc2VudGF0aW9uLlxuICAgIC8vICAgVGhpcyBpcyB0byBjYXRlciB0byBlYXJsaWVyIHZlcnNpb25zIG9mIE1ldGVvciBzdG9yaW5nIHR3aXR0ZXJcbiAgICAvLyAgIHVzZXIgSURzIGluIG51bWJlciBmb3JtLCBhbmQgcmVjZW50IHZlcnNpb25zIHN0b3JpbmcgdGhlbSBhcyBzdHJpbmdzLlxuICAgIC8vICAgVGhpcyBjYW4gYmUgcmVtb3ZlZCBvbmNlIG1pZ3JhdGlvbiB0ZWNobm9sb2d5IGlzIGluIHBsYWNlLCBhbmQgdHdpdHRlclxuICAgIC8vICAgdXNlcnMgc3RvcmVkIHdpdGggaW50ZWdlciBJRHMgaGF2ZSBiZWVuIG1pZ3JhdGVkIHRvIHN0cmluZyBJRHMuXG4gICAgaWYgKHNlcnZpY2VOYW1lID09PSBcInR3aXR0ZXJcIiAmJiAhaXNOYU4oc2VydmljZURhdGEuaWQpKSB7XG4gICAgICBzZWxlY3RvcltcIiRvclwiXSA9IFt7fSx7fV07XG4gICAgICBzZWxlY3RvcltcIiRvclwiXVswXVtzZXJ2aWNlSWRLZXldID0gc2VydmljZURhdGEuaWQ7XG4gICAgICBzZWxlY3RvcltcIiRvclwiXVsxXVtzZXJ2aWNlSWRLZXldID0gcGFyc2VJbnQoc2VydmljZURhdGEuaWQsIDEwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0b3Jbc2VydmljZUlkS2V5XSA9IHNlcnZpY2VEYXRhLmlkO1xuICAgIH1cbiAgICBsZXQgdXNlciA9IGF3YWl0IHRoaXMudXNlcnMuZmluZE9uZUFzeW5jKHNlbGVjdG9yLCB7ZmllbGRzOiB0aGlzLl9vcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yfSk7XG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBkZXZlbG9wZXIgaGFzIGEgY3VzdG9tIHdheSB0byBmaW5kIHRoZSB1c2VyIG91dHNpZGVcbiAgICAvLyBvZiB0aGUgZ2VuZXJhbCBzZWxlY3RvcnMgYWJvdmUuXG4gICAgaWYgKCF1c2VyICYmIHRoaXMuX2FkZGl0aW9uYWxGaW5kVXNlck9uRXh0ZXJuYWxMb2dpbikge1xuICAgICAgdXNlciA9IGF3YWl0IHRoaXMuX2FkZGl0aW9uYWxGaW5kVXNlck9uRXh0ZXJuYWxMb2dpbih7c2VydmljZU5hbWUsIHNlcnZpY2VEYXRhLCBvcHRpb25zfSlcbiAgICB9XG5cbiAgICAvLyBCZWZvcmUgY29udGludWluZywgcnVuIHVzZXIgaG9vayB0byBzZWUgaWYgd2Ugc2hvdWxkIGNvbnRpbnVlXG4gICAgaWYgKHRoaXMuX2JlZm9yZUV4dGVybmFsTG9naW5Ib29rICYmICEoYXdhaXQgdGhpcy5fYmVmb3JlRXh0ZXJuYWxMb2dpbkhvb2soc2VydmljZU5hbWUsIHNlcnZpY2VEYXRhLCB1c2VyKSkpIHtcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIkxvZ2luIGZvcmJpZGRlblwiKTtcbiAgICB9XG5cbiAgICAvLyBXaGVuIGNyZWF0aW5nIGEgbmV3IHVzZXIgd2UgcGFzcyB0aHJvdWdoIGFsbCBvcHRpb25zLiBXaGVuIHVwZGF0aW5nIGFuXG4gICAgLy8gZXhpc3RpbmcgdXNlciwgYnkgZGVmYXVsdCB3ZSBvbmx5IHByb2Nlc3MvcGFzcyB0aHJvdWdoIHRoZSBzZXJ2aWNlRGF0YVxuICAgIC8vIChlZywgc28gdGhhdCB3ZSBrZWVwIGFuIHVuZXhwaXJlZCBhY2Nlc3MgdG9rZW4gYW5kIGRvbid0IGNhY2hlIG9sZCBlbWFpbFxuICAgIC8vIGFkZHJlc3NlcyBpbiBzZXJ2aWNlRGF0YS5lbWFpbCkuIFRoZSBvbkV4dGVybmFsTG9naW4gaG9vayBjYW4gYmUgdXNlZCB3aGVuXG4gICAgLy8gY3JlYXRpbmcgb3IgdXBkYXRpbmcgYSB1c2VyLCB0byBtb2RpZnkgb3IgcGFzcyB0aHJvdWdoIG1vcmUgb3B0aW9ucyBhc1xuICAgIC8vIG5lZWRlZC5cbiAgICBsZXQgb3B0cyA9IHVzZXIgPyB7fSA6IG9wdGlvbnM7XG4gICAgaWYgKHRoaXMuX29uRXh0ZXJuYWxMb2dpbkhvb2spIHtcbiAgICAgIG9wdHMgPSBhd2FpdCB0aGlzLl9vbkV4dGVybmFsTG9naW5Ib29rKG9wdGlvbnMsIHVzZXIpO1xuICAgIH1cblxuICAgIGlmICh1c2VyKSB7XG4gICAgICBhd2FpdCBwaW5FbmNyeXB0ZWRGaWVsZHNUb1VzZXIoc2VydmljZURhdGEsIHVzZXIuX2lkKTtcblxuICAgICAgbGV0IHNldEF0dHJzID0ge307XG4gICAgICBPYmplY3Qua2V5cyhzZXJ2aWNlRGF0YSkuZm9yRWFjaChrZXkgPT5cbiAgICAgICAgc2V0QXR0cnNbYHNlcnZpY2VzLiR7c2VydmljZU5hbWV9LiR7a2V5fWBdID0gc2VydmljZURhdGFba2V5XVxuICAgICAgKTtcblxuICAgICAgLy8gWFhYIE1heWJlIHdlIHNob3VsZCByZS11c2UgdGhlIHNlbGVjdG9yIGFib3ZlIGFuZCBub3RpY2UgaWYgdGhlIHVwZGF0ZVxuICAgICAgLy8gICAgIHRvdWNoZXMgbm90aGluZz9cbiAgICAgIHNldEF0dHJzID0geyAuLi5zZXRBdHRycywgLi4ub3B0cyB9O1xuICAgICAgYXdhaXQgdGhpcy51c2Vycy51cGRhdGVBc3luYyh1c2VyLl9pZCwge1xuICAgICAgICAkc2V0OiBzZXRBdHRyc1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IHNlcnZpY2VOYW1lLFxuICAgICAgICB1c2VySWQ6IHVzZXIuX2lkXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDcmVhdGUgYSBuZXcgdXNlciB3aXRoIHRoZSBzZXJ2aWNlIGRhdGEuXG4gICAgICB1c2VyID0ge3NlcnZpY2VzOiB7fX07XG4gICAgICB1c2VyLnNlcnZpY2VzW3NlcnZpY2VOYW1lXSA9IHNlcnZpY2VEYXRhO1xuICAgICAgY29uc3QgdXNlcklkID0gYXdhaXQgdGhpcy5pbnNlcnRVc2VyRG9jKG9wdHMsIHVzZXIpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogc2VydmljZU5hbWUsXG4gICAgICAgIHVzZXJJZFxuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJlbW92ZXMgZGVmYXVsdCByYXRlIGxpbWl0aW5nIHJ1bGVcbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICAgKi9cbiAgcmVtb3ZlRGVmYXVsdFJhdGVMaW1pdCgpIHtcbiAgICBjb25zdCByZXNwID0gRERQUmF0ZUxpbWl0ZXIucmVtb3ZlUnVsZSh0aGlzLmRlZmF1bHRSYXRlTGltaXRlclJ1bGVJZCk7XG4gICAgdGhpcy5kZWZhdWx0UmF0ZUxpbWl0ZXJSdWxlSWQgPSBudWxsO1xuICAgIHJldHVybiByZXNwO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBZGQgYSBkZWZhdWx0IHJ1bGUgb2YgbGltaXRpbmcgbG9naW5zLCBjcmVhdGluZyBuZXcgdXNlcnMgYW5kIHBhc3N3b3JkIHJlc2V0XG4gICAqIHRvIDUgdGltZXMgZXZlcnkgMTAgc2Vjb25kcyBwZXIgY29ubmVjdGlvbi5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICAgKi9cbiAgYWRkRGVmYXVsdFJhdGVMaW1pdCgpIHtcbiAgICBpZiAoIXRoaXMuZGVmYXVsdFJhdGVMaW1pdGVyUnVsZUlkKSB7XG4gICAgICB0aGlzLmRlZmF1bHRSYXRlTGltaXRlclJ1bGVJZCA9IEREUFJhdGVMaW1pdGVyLmFkZFJ1bGUoe1xuICAgICAgICB1c2VySWQ6IG51bGwsXG4gICAgICAgIGNsaWVudEFkZHJlc3M6IG51bGwsXG4gICAgICAgIHR5cGU6ICdtZXRob2QnLFxuICAgICAgICBuYW1lOiBuYW1lID0+IFsnbG9naW4nLCAnY3JlYXRlVXNlcicsICdyZXNldFBhc3N3b3JkJywgJ2ZvcmdvdFBhc3N3b3JkJ11cbiAgICAgICAgICAuaW5jbHVkZXMobmFtZSksXG4gICAgICAgIGNvbm5lY3Rpb25JZDogKGNvbm5lY3Rpb25JZCkgPT4gdHJ1ZSxcbiAgICAgIH0sIDUsIDEwMDAwKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IENyZWF0ZXMgb3B0aW9ucyBmb3IgZW1haWwgc2VuZGluZyBmb3IgcmVzZXQgcGFzc3dvcmQgYW5kIGVucm9sbCBhY2NvdW50IGVtYWlscy5cbiAgICogWW91IGNhbiB1c2UgdGhpcyBmdW5jdGlvbiB3aGVuIGN1c3RvbWl6aW5nIGEgcmVzZXQgcGFzc3dvcmQgb3IgZW5yb2xsIGFjY291bnQgZW1haWwgc2VuZGluZy5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge09iamVjdH0gZW1haWwgV2hpY2ggYWRkcmVzcyBvZiB0aGUgdXNlcidzIHRvIHNlbmQgdGhlIGVtYWlsIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gdXNlciBUaGUgdXNlciBvYmplY3QgdG8gZ2VuZXJhdGUgb3B0aW9ucyBmb3IuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVVJMIHRvIHdoaWNoIHVzZXIgaXMgZGlyZWN0ZWQgdG8gY29uZmlybSB0aGUgZW1haWwuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSByZWFzb24gYHJlc2V0UGFzc3dvcmRgIG9yIGBlbnJvbGxBY2NvdW50YC5cbiAgICogQHJldHVybnMge09iamVjdH0gT3B0aW9ucyB3aGljaCBjYW4gYmUgcGFzc2VkIHRvIGBFbWFpbC5zZW5kYC5cbiAgICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAgICovXG4gIGFzeW5jIGdlbmVyYXRlT3B0aW9uc0ZvckVtYWlsKGVtYWlsLCB1c2VyLCB1cmwsIHJlYXNvbiwgZXh0cmEgPSB7fSl7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIHRvOiBlbWFpbCxcbiAgICAgIGZyb206IHRoaXMuZW1haWxUZW1wbGF0ZXNbcmVhc29uXS5mcm9tXG4gICAgICAgID8gYXdhaXQgdGhpcy5lbWFpbFRlbXBsYXRlc1tyZWFzb25dLmZyb20odXNlcilcbiAgICAgICAgOiB0aGlzLmVtYWlsVGVtcGxhdGVzLmZyb20sXG4gICAgICBzdWJqZWN0OiBhd2FpdCB0aGlzLmVtYWlsVGVtcGxhdGVzW3JlYXNvbl0uc3ViamVjdCh1c2VyLCB1cmwsIGV4dHJhKSxcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiB0aGlzLmVtYWlsVGVtcGxhdGVzW3JlYXNvbl0udGV4dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb3B0aW9ucy50ZXh0ID0gYXdhaXQgdGhpcy5lbWFpbFRlbXBsYXRlc1tyZWFzb25dLnRleHQodXNlciwgdXJsLCBleHRyYSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLmVtYWlsVGVtcGxhdGVzW3JlYXNvbl0uaHRtbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb3B0aW9ucy5odG1sID0gYXdhaXQgdGhpcy5lbWFpbFRlbXBsYXRlc1tyZWFzb25dLmh0bWwodXNlciwgdXJsLCBleHRyYSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLmVtYWlsVGVtcGxhdGVzLmhlYWRlcnMgPT09ICdvYmplY3QnKSB7XG4gICAgICBvcHRpb25zLmhlYWRlcnMgPSB0aGlzLmVtYWlsVGVtcGxhdGVzLmhlYWRlcnM7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9wdGlvbnM7XG4gIH07XG5cbiAgYXN5bmMgX2NoZWNrRm9yQ2FzZUluc2Vuc2l0aXZlRHVwbGljYXRlcyhcbiAgICBmaWVsZE5hbWUsXG4gICAgZGlzcGxheU5hbWUsXG4gICAgZmllbGRWYWx1ZSxcbiAgICBvd25Vc2VySWRcbiAgKSB7XG4gICAgLy8gU29tZSB0ZXN0cyBuZWVkIHRoZSBhYmlsaXR5IHRvIGFkZCB1c2VycyB3aXRoIHRoZSBzYW1lIGNhc2UgaW5zZW5zaXRpdmVcbiAgICAvLyB2YWx1ZSwgaGVuY2UgdGhlIF9za2lwQ2FzZUluc2Vuc2l0aXZlQ2hlY2tzRm9yVGVzdCBjaGVja1xuICAgIGNvbnN0IHNraXBDaGVjayA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgIHRoaXMuX3NraXBDYXNlSW5zZW5zaXRpdmVDaGVja3NGb3JUZXN0LFxuICAgICAgZmllbGRWYWx1ZVxuICAgICk7XG5cbiAgICBpZiAoZmllbGRWYWx1ZSAmJiAhc2tpcENoZWNrKSB7XG4gICAgICBjb25zdCBtYXRjaGVkVXNlcnMgPSBhd2FpdCBNZXRlb3IudXNlcnNcbiAgICAgICAgLmZpbmQoXG4gICAgICAgICAgdGhpcy5fc2VsZWN0b3JGb3JGYXN0Q2FzZUluc2Vuc2l0aXZlTG9va3VwKGZpZWxkTmFtZSwgZmllbGRWYWx1ZSksXG4gICAgICAgICAge1xuICAgICAgICAgICAgZmllbGRzOiB7IF9pZDogMSB9LFxuICAgICAgICAgICAgLy8gd2Ugb25seSBuZWVkIGEgbWF4aW11bSBvZiAyIHVzZXJzIGZvciB0aGUgbG9naWMgYmVsb3cgdG8gd29ya1xuICAgICAgICAgICAgbGltaXQ6IDIsXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICAgIC5mZXRjaEFzeW5jKCk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgbWF0Y2hlZFVzZXJzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIHVzZXJJZCB5ZXQsIGFueSBtYXRjaCB3ZSBmaW5kIGlzIGEgZHVwbGljYXRlXG4gICAgICAgICghb3duVXNlcklkIHx8XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlLCBjaGVjayB0byBzZWUgaWYgdGhlcmUgYXJlIG11bHRpcGxlIG1hdGNoZXMgb3IgYSBtYXRjaFxuICAgICAgICAgIC8vIHRoYXQgaXMgbm90IHVzXG4gICAgICAgICAgbWF0Y2hlZFVzZXJzLmxlbmd0aCA+IDEgfHwgbWF0Y2hlZFVzZXJzWzBdLl9pZCAhPT0gb3duVXNlcklkKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuX2hhbmRsZUVycm9yKGAke2Rpc3BsYXlOYW1lfSBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgYXN5bmMgX2NyZWF0ZVVzZXJDaGVja2luZ0R1cGxpY2F0ZXMoeyB1c2VyLCBlbWFpbCwgdXNlcm5hbWUsIG9wdGlvbnMgfSkge1xuICAgIGNvbnN0IG5ld1VzZXIgPSB7XG4gICAgICAuLi51c2VyLFxuICAgICAgLi4uKHVzZXJuYW1lID8geyB1c2VybmFtZSB9IDoge30pLFxuICAgICAgLi4uKGVtYWlsID8geyBlbWFpbHM6IFt7IGFkZHJlc3M6IGVtYWlsLCB2ZXJpZmllZDogZmFsc2UgfV0gfSA6IHt9KSxcbiAgICB9O1xuXG4gICAgLy8gUGVyZm9ybSBhIGNhc2UgaW5zZW5zaXRpdmUgY2hlY2sgYmVmb3JlIGluc2VydFxuICAgIGF3YWl0IHRoaXMuX2NoZWNrRm9yQ2FzZUluc2Vuc2l0aXZlRHVwbGljYXRlcygndXNlcm5hbWUnLCAnVXNlcm5hbWUnLCB1c2VybmFtZSk7XG4gICAgYXdhaXQgdGhpcy5fY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzKCdlbWFpbHMuYWRkcmVzcycsICdFbWFpbCcsIGVtYWlsKTtcblxuICAgIGNvbnN0IHVzZXJJZCA9IGF3YWl0IHRoaXMuaW5zZXJ0VXNlckRvYyhvcHRpb25zLCBuZXdVc2VyKTtcbiAgICAvLyBQZXJmb3JtIGFub3RoZXIgY2hlY2sgYWZ0ZXIgaW5zZXJ0LCBpbiBjYXNlIGEgbWF0Y2hpbmcgdXNlciBoYXMgYmVlblxuICAgIC8vIGluc2VydGVkIGluIHRoZSBtZWFudGltZVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9jaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMoJ3VzZXJuYW1lJywgJ1VzZXJuYW1lJywgdXNlcm5hbWUsIHVzZXJJZCk7XG4gICAgICBhd2FpdCB0aGlzLl9jaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMoJ2VtYWlscy5hZGRyZXNzJywgJ0VtYWlsJywgZW1haWwsIHVzZXJJZCk7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIC8vIFJlbW92ZSBpbnNlcnRlZCB1c2VyIGlmIHRoZSBjaGVjayBmYWlsc1xuICAgICAgYXdhaXQgTWV0ZW9yLnVzZXJzLnJlbW92ZUFzeW5jKHVzZXJJZCk7XG4gICAgICB0aHJvdyBleDtcbiAgICB9XG4gICAgcmV0dXJuIHVzZXJJZDtcbiAgfVxuXG4gIF9oYW5kbGVFcnJvciA9IChtc2csIHRocm93RXJyb3IgPSB0cnVlLCBlcnJvckNvZGUgPSA0MDMpID0+IHtcbiAgICBjb25zdCBpc0Vycm9yQW1iaWd1b3VzID0gdGhpcy5fb3B0aW9ucy5hbWJpZ3VvdXNFcnJvck1lc3NhZ2VzID8/IHRydWU7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgTWV0ZW9yLkVycm9yKFxuICAgICAgZXJyb3JDb2RlLFxuICAgICAgaXNFcnJvckFtYmlndW91c1xuICAgICAgICA/ICdTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIGNoZWNrIHlvdXIgY3JlZGVudGlhbHMuJ1xuICAgICAgICA6IG1zZ1xuICAgICk7XG4gICAgaWYgKHRocm93RXJyb3IpIHtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cblxuICBfdXNlclF1ZXJ5VmFsaWRhdG9yID0gTWF0Y2guV2hlcmUodXNlciA9PiB7XG4gICAgY2hlY2sodXNlciwge1xuICAgICAgaWQ6IE1hdGNoLk9wdGlvbmFsKE5vbkVtcHR5U3RyaW5nKSxcbiAgICAgIHVzZXJuYW1lOiBNYXRjaC5PcHRpb25hbChOb25FbXB0eVN0cmluZyksXG4gICAgICBlbWFpbDogTWF0Y2guT3B0aW9uYWwoTm9uRW1wdHlTdHJpbmcpXG4gICAgfSk7XG4gICAgaWYgKE9iamVjdC5rZXlzKHVzZXIpLmxlbmd0aCAhPT0gMSlcbiAgICAgIHRocm93IG5ldyBNYXRjaC5FcnJvcihcIlVzZXIgcHJvcGVydHkgbXVzdCBoYXZlIGV4YWN0bHkgb25lIGZpZWxkXCIpO1xuICAgIHJldHVybiB0cnVlO1xuICB9KTtcblxufVxuXG4vLyBHaXZlIGVhY2ggbG9naW4gaG9vayBjYWxsYmFjayBhIGZyZXNoIGNsb25lZCBjb3B5IG9mIHRoZSBhdHRlbXB0XG4vLyBvYmplY3QsIGJ1dCBkb24ndCBjbG9uZSB0aGUgY29ubmVjdGlvbi5cbi8vXG5jb25zdCBjbG9uZUF0dGVtcHRXaXRoQ29ubmVjdGlvbiA9IChjb25uZWN0aW9uLCBhdHRlbXB0KSA9PiB7XG4gIGNvbnN0IGNsb25lZEF0dGVtcHQgPSBFSlNPTi5jbG9uZShhdHRlbXB0KTtcbiAgY2xvbmVkQXR0ZW1wdC5jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgcmV0dXJuIGNsb25lZEF0dGVtcHQ7XG59O1xuXG5jb25zdCB0cnlMb2dpbk1ldGhvZCA9IGFzeW5jICh0eXBlLCBmbikgPT4ge1xuICBsZXQgcmVzdWx0O1xuICB0cnkge1xuICAgIHJlc3VsdCA9IGF3YWl0IGZuKCk7XG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICByZXN1bHQgPSB7ZXJyb3I6IGV9O1xuICB9XG5cbiAgaWYgKHJlc3VsdCAmJiAhcmVzdWx0LnR5cGUgJiYgdHlwZSlcbiAgICByZXN1bHQudHlwZSA9IHR5cGU7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IHNldHVwRGVmYXVsdExvZ2luSGFuZGxlcnMgPSBhY2NvdW50cyA9PiB7XG4gIGFjY291bnRzLnJlZ2lzdGVyTG9naW5IYW5kbGVyKFwicmVzdW1lXCIsIGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRSZXN1bWVMb2dpbkhhbmRsZXIuY2FsbCh0aGlzLCBhY2NvdW50cywgb3B0aW9ucyk7XG4gIH0pO1xufTtcblxuLy8gTG9naW4gaGFuZGxlciBmb3IgcmVzdW1lIHRva2Vucy5cbmNvbnN0IGRlZmF1bHRSZXN1bWVMb2dpbkhhbmRsZXIgPSBhc3luYyAoYWNjb3VudHMsIG9wdGlvbnMpID0+IHtcbiAgaWYgKCFvcHRpb25zLnJlc3VtZSlcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuXG4gIGNoZWNrKG9wdGlvbnMucmVzdW1lLCBTdHJpbmcpO1xuXG4gIGNvbnN0IGhhc2hlZFRva2VuID0gYWNjb3VudHMuX2hhc2hMb2dpblRva2VuKG9wdGlvbnMucmVzdW1lKTtcblxuICAvLyBGaXJzdCBsb29rIGZvciBqdXN0IHRoZSBuZXctc3R5bGUgaGFzaGVkIGxvZ2luIHRva2VuLCB0byBhdm9pZFxuICAvLyBzZW5kaW5nIHRoZSB1bmhhc2hlZCB0b2tlbiB0byB0aGUgZGF0YWJhc2UgaW4gYSBxdWVyeSBpZiB3ZSBkb24ndFxuICAvLyBuZWVkIHRvLlxuICBsZXQgdXNlciA9IGF3YWl0IGFjY291bnRzLnVzZXJzLmZpbmRPbmVBc3luYyhcbiAgICB7XCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMuaGFzaGVkVG9rZW5cIjogaGFzaGVkVG9rZW59LFxuICAgIHtmaWVsZHM6IHtcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucy4kXCI6IDF9fSk7XG5cbiAgaWYgKCEgdXNlcikge1xuICAgIC8vIElmIHdlIGRpZG4ndCBmaW5kIHRoZSBoYXNoZWQgbG9naW4gdG9rZW4sIHRyeSBhbHNvIGxvb2tpbmcgZm9yXG4gICAgLy8gdGhlIG9sZC1zdHlsZSB1bmhhc2hlZCB0b2tlbi4gIEJ1dCB3ZSBuZWVkIHRvIGxvb2sgZm9yIGVpdGhlclxuICAgIC8vIHRoZSBvbGQtc3R5bGUgdG9rZW4gT1IgdGhlIG5ldy1zdHlsZSB0b2tlbiwgYmVjYXVzZSBhbm90aGVyXG4gICAgLy8gY2xpZW50IGNvbm5lY3Rpb24gbG9nZ2luZyBpbiBzaW11bHRhbmVvdXNseSBtaWdodCBoYXZlIGFscmVhZHlcbiAgICAvLyBjb252ZXJ0ZWQgdGhlIHRva2VuLlxuICAgIHVzZXIgPSAgYXdhaXQgYWNjb3VudHMudXNlcnMuZmluZE9uZUFzeW5jKHtcbiAgICAgICAgJG9yOiBbXG4gICAgICAgICAge1wic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLmhhc2hlZFRva2VuXCI6IGhhc2hlZFRva2VufSxcbiAgICAgICAgICB7XCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMudG9rZW5cIjogb3B0aW9ucy5yZXN1bWV9XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICAvLyBOb3RlOiBDYW5ub3QgdXNlIC4uLmxvZ2luVG9rZW5zLiQgcG9zaXRpb25hbCBvcGVyYXRvciB3aXRoICRvciBxdWVyeS5cbiAgICAgIHtmaWVsZHM6IHtcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiAxfX0pO1xuICB9XG5cbiAgaWYgKCEgdXNlcilcbiAgICByZXR1cm4ge1xuICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIllvdSd2ZSBiZWVuIGxvZ2dlZCBvdXQgYnkgdGhlIHNlcnZlci4gUGxlYXNlIGxvZyBpbiBhZ2Fpbi5cIilcbiAgICB9O1xuXG4gIC8vIEZpbmQgdGhlIHRva2VuLCB3aGljaCB3aWxsIGVpdGhlciBiZSBhbiBvYmplY3Qgd2l0aCBmaWVsZHNcbiAgLy8ge2hhc2hlZFRva2VuLCB3aGVufSBmb3IgYSBoYXNoZWQgdG9rZW4gb3Ige3Rva2VuLCB3aGVufSBmb3IgYW5cbiAgLy8gdW5oYXNoZWQgdG9rZW4uXG4gIGxldCBvbGRVbmhhc2hlZFN0eWxlVG9rZW47XG4gIGxldCB0b2tlbiA9IGF3YWl0IHVzZXIuc2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLmZpbmQodG9rZW4gPT5cbiAgICB0b2tlbi5oYXNoZWRUb2tlbiA9PT0gaGFzaGVkVG9rZW5cbiAgKTtcbiAgaWYgKHRva2VuKSB7XG4gICAgb2xkVW5oYXNoZWRTdHlsZVRva2VuID0gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgIHRva2VuID0gYXdhaXQgdXNlci5zZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMuZmluZCh0b2tlbiA9PlxuICAgICAgdG9rZW4udG9rZW4gPT09IG9wdGlvbnMucmVzdW1lXG4gICAgKTtcbiAgICBvbGRVbmhhc2hlZFN0eWxlVG9rZW4gPSB0cnVlO1xuICB9XG5cbiAgY29uc3QgdG9rZW5FeHBpcmVzID0gYWNjb3VudHMuX3Rva2VuRXhwaXJhdGlvbih0b2tlbi53aGVuKTtcbiAgaWYgKG5ldyBEYXRlKCkgPj0gdG9rZW5FeHBpcmVzKVxuICAgIHJldHVybiB7XG4gICAgICB1c2VySWQ6IHVzZXIuX2lkLFxuICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIllvdXIgc2Vzc2lvbiBoYXMgZXhwaXJlZC4gUGxlYXNlIGxvZyBpbiBhZ2Fpbi5cIilcbiAgICB9O1xuXG4gIC8vIFVwZGF0ZSB0byBhIGhhc2hlZCB0b2tlbiB3aGVuIGFuIHVuaGFzaGVkIHRva2VuIGlzIGVuY291bnRlcmVkLlxuICBpZiAob2xkVW5oYXNoZWRTdHlsZVRva2VuKSB7XG4gICAgLy8gT25seSBhZGQgdGhlIG5ldyBoYXNoZWQgdG9rZW4gaWYgdGhlIG9sZCB1bmhhc2hlZCB0b2tlbiBzdGlsbFxuICAgIC8vIGV4aXN0cyAodGhpcyBhdm9pZHMgcmVzdXJyZWN0aW5nIHRoZSB0b2tlbiBpZiBpdCB3YXMgZGVsZXRlZFxuICAgIC8vIGFmdGVyIHdlIHJlYWQgaXQpLiAgVXNpbmcgJGFkZFRvU2V0IGF2b2lkcyBnZXR0aW5nIGFuIGluZGV4XG4gICAgLy8gZXJyb3IgaWYgYW5vdGhlciBjbGllbnQgbG9nZ2luZyBpbiBzaW11bHRhbmVvdXNseSBoYXMgYWxyZWFkeVxuICAgIC8vIGluc2VydGVkIHRoZSBuZXcgaGFzaGVkIHRva2VuLlxuICAgIGF3YWl0IGFjY291bnRzLnVzZXJzLnVwZGF0ZUFzeW5jKFxuICAgICAge1xuICAgICAgICBfaWQ6IHVzZXIuX2lkLFxuICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucy50b2tlblwiOiBvcHRpb25zLnJlc3VtZVxuICAgICAgfSxcbiAgICAgIHskYWRkVG9TZXQ6IHtcbiAgICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiB7XG4gICAgICAgICAgICBcImhhc2hlZFRva2VuXCI6IGhhc2hlZFRva2VuLFxuICAgICAgICAgICAgXCJ3aGVuXCI6IHRva2VuLndoZW5cbiAgICAgICAgICB9XG4gICAgICAgIH19XG4gICAgKTtcblxuICAgIC8vIFJlbW92ZSB0aGUgb2xkIHRva2VuICphZnRlciogYWRkaW5nIHRoZSBuZXcsIHNpbmNlIG90aGVyd2lzZVxuICAgIC8vIGFub3RoZXIgY2xpZW50IHRyeWluZyB0byBsb2dpbiBiZXR3ZWVuIG91ciByZW1vdmluZyB0aGUgb2xkIGFuZFxuICAgIC8vIGFkZGluZyB0aGUgbmV3IHdvdWxkbid0IGZpbmQgYSB0b2tlbiB0byBsb2dpbiB3aXRoLlxuICAgIGF3YWl0IGFjY291bnRzLnVzZXJzLnVwZGF0ZUFzeW5jKHVzZXIuX2lkLCB7XG4gICAgICAkcHVsbDoge1xuICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiB7IFwidG9rZW5cIjogb3B0aW9ucy5yZXN1bWUgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB1c2VySWQ6IHVzZXIuX2lkLFxuICAgIHN0YW1wZWRMb2dpblRva2VuOiB7XG4gICAgICB0b2tlbjogb3B0aW9ucy5yZXN1bWUsXG4gICAgICB3aGVuOiB0b2tlbi53aGVuXG4gICAgfVxuICB9O1xufTtcblxuY29uc3QgZXhwaXJlUGFzc3dvcmRUb2tlbiA9XG4gIGFzeW5jIChcbiAgICBhY2NvdW50cyxcbiAgICBvbGRlc3RWYWxpZERhdGUsXG4gICAgdG9rZW5GaWx0ZXIsXG4gICAgdXNlcklkXG4gICkgPT4ge1xuICAgIC8vIGJvb2xlYW4gdmFsdWUgdXNlZCB0byBkZXRlcm1pbmUgaWYgdGhpcyBtZXRob2Qgd2FzIGNhbGxlZCBmcm9tIGVucm9sbCBhY2NvdW50IHdvcmtmbG93XG4gICAgbGV0IGlzRW5yb2xsID0gZmFsc2U7XG4gICAgY29uc3QgdXNlckZpbHRlciA9IHVzZXJJZCA/IHsgX2lkOiB1c2VySWQgfSA6IHt9O1xuICAgIC8vIGNoZWNrIGlmIHRoaXMgbWV0aG9kIHdhcyBjYWxsZWQgZnJvbSBlbnJvbGwgYWNjb3VudCB3b3JrZmxvd1xuICAgIGlmICh0b2tlbkZpbHRlclsnc2VydmljZXMucGFzc3dvcmQuZW5yb2xsLnJlYXNvbiddKSB7XG4gICAgICBpc0Vucm9sbCA9IHRydWU7XG4gICAgfVxuICAgIGxldCByZXNldFJhbmdlT3IgPSB7XG4gICAgICAkb3I6IFtcbiAgICAgICAgeyBcInNlcnZpY2VzLnBhc3N3b3JkLnJlc2V0LndoZW5cIjogeyAkbHQ6IG9sZGVzdFZhbGlkRGF0ZSB9IH0sXG4gICAgICAgIHsgXCJzZXJ2aWNlcy5wYXNzd29yZC5yZXNldC53aGVuXCI6IHsgJGx0OiArb2xkZXN0VmFsaWREYXRlIH0gfVxuICAgICAgXVxuICAgIH07XG4gICAgaWYgKGlzRW5yb2xsKSB7XG4gICAgICByZXNldFJhbmdlT3IgPSB7XG4gICAgICAgICRvcjogW1xuICAgICAgICAgIHsgXCJzZXJ2aWNlcy5wYXNzd29yZC5lbnJvbGwud2hlblwiOiB7ICRsdDogb2xkZXN0VmFsaWREYXRlIH0gfSxcbiAgICAgICAgICB7IFwic2VydmljZXMucGFzc3dvcmQuZW5yb2xsLndoZW5cIjogeyAkbHQ6ICtvbGRlc3RWYWxpZERhdGUgfSB9XG4gICAgICAgIF1cbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGV4cGlyZUZpbHRlciA9IHsgJGFuZDogW3Rva2VuRmlsdGVyLCByZXNldFJhbmdlT3JdIH07XG4gICAgaWYgKGlzRW5yb2xsKSB7XG4gICAgICBhd2FpdCBhY2NvdW50cy51c2Vycy51cGRhdGVBc3luYyh7IC4uLnVzZXJGaWx0ZXIsIC4uLmV4cGlyZUZpbHRlciB9LCB7XG4gICAgICAgICR1bnNldDoge1xuICAgICAgICAgIFwic2VydmljZXMucGFzc3dvcmQuZW5yb2xsXCI6IFwiXCJcbiAgICAgICAgfVxuICAgICAgfSwgeyBtdWx0aTogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgYWNjb3VudHMudXNlcnMudXBkYXRlQXN5bmMoeyAuLi51c2VyRmlsdGVyLCAuLi5leHBpcmVGaWx0ZXIgfSwge1xuICAgICAgICAkdW5zZXQ6IHtcbiAgICAgICAgICBcInNlcnZpY2VzLnBhc3N3b3JkLnJlc2V0XCI6IFwiXCJcbiAgICAgICAgfVxuICAgICAgfSwgeyBtdWx0aTogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgfTtcblxuY29uc3Qgc2V0RXhwaXJlVG9rZW5zSW50ZXJ2YWwgPSBhY2NvdW50cyA9PiB7XG4gIGFjY291bnRzLmV4cGlyZVRva2VuSW50ZXJ2YWwgPSBNZXRlb3Iuc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xuICAgYXdhaXQgYWNjb3VudHMuX2V4cGlyZVRva2VucygpO1xuICAgYXdhaXQgYWNjb3VudHMuX2V4cGlyZVBhc3N3b3JkUmVzZXRUb2tlbnMoKTtcbiAgIGF3YWl0IGFjY291bnRzLl9leHBpcmVQYXNzd29yZEVucm9sbFRva2VucygpO1xuICB9LCBFWFBJUkVfVE9LRU5TX0lOVEVSVkFMX01TKTtcbn07XG5cbmNvbnN0IE9BdXRoRW5jcnlwdGlvbiA9IFBhY2thZ2VbXCJvYXV0aC1lbmNyeXB0aW9uXCJdPy5PQXV0aEVuY3J5cHRpb247XG5cbi8vIE9BdXRoIHNlcnZpY2UgZGF0YSBpcyB0ZW1wb3JhcmlseSBzdG9yZWQgaW4gdGhlIHBlbmRpbmcgY3JlZGVudGlhbHNcbi8vIGNvbGxlY3Rpb24gZHVyaW5nIHRoZSBvYXV0aCBhdXRoZW50aWNhdGlvbiBwcm9jZXNzLiAgU2Vuc2l0aXZlIGRhdGFcbi8vIHN1Y2ggYXMgYWNjZXNzIHRva2VucyBhcmUgZW5jcnlwdGVkIHdpdGhvdXQgdGhlIHVzZXIgaWQgYmVjYXVzZVxuLy8gd2UgZG9uJ3Qga25vdyB0aGUgdXNlciBpZCB5ZXQuICBXZSByZS1lbmNyeXB0IHRoZXNlIGZpZWxkcyB3aXRoIHRoZVxuLy8gdXNlciBpZCBpbmNsdWRlZCB3aGVuIHN0b3JpbmcgdGhlIHNlcnZpY2UgZGF0YSBwZXJtYW5lbnRseSBpblxuLy8gdGhlIHVzZXJzIGNvbGxlY3Rpb24uXG4vL1xuY29uc3QgcGluRW5jcnlwdGVkRmllbGRzVG9Vc2VyID0gKHNlcnZpY2VEYXRhLCB1c2VySWQpID0+IHtcbiAgT2JqZWN0LmtleXMoc2VydmljZURhdGEpLmZvckVhY2goa2V5ID0+IHtcbiAgICBsZXQgdmFsdWUgPSBzZXJ2aWNlRGF0YVtrZXldO1xuICAgIGlmIChPQXV0aEVuY3J5cHRpb24/LmlzU2VhbGVkKHZhbHVlKSlcbiAgICAgIHZhbHVlID0gT0F1dGhFbmNyeXB0aW9uLnNlYWwoT0F1dGhFbmNyeXB0aW9uLm9wZW4odmFsdWUpLCB1c2VySWQpO1xuICAgIHNlcnZpY2VEYXRhW2tleV0gPSB2YWx1ZTtcbiAgfSk7XG59O1xuXG4vLyBYWFggc2VlIGNvbW1lbnQgb24gQWNjb3VudHMuY3JlYXRlVXNlciBpbiBwYXNzd29yZHNfc2VydmVyIGFib3V0IGFkZGluZyBhXG4vLyBzZWNvbmQgXCJzZXJ2ZXIgb3B0aW9uc1wiIGFyZ3VtZW50LlxuY29uc3QgZGVmYXVsdENyZWF0ZVVzZXJIb29rID0gKG9wdGlvbnMsIHVzZXIpID0+IHtcbiAgaWYgKG9wdGlvbnMucHJvZmlsZSlcbiAgICB1c2VyLnByb2ZpbGUgPSBvcHRpb25zLnByb2ZpbGU7XG4gIHJldHVybiB1c2VyO1xufTtcblxuLy8gVmFsaWRhdGUgbmV3IHVzZXIncyBlbWFpbCBvciBHb29nbGUvRmFjZWJvb2svR2l0SHViIGFjY291bnQncyBlbWFpbFxuZnVuY3Rpb24gZGVmYXVsdFZhbGlkYXRlTmV3VXNlckhvb2sodXNlcikge1xuICBjb25zdCBkb21haW4gPSB0aGlzLl9vcHRpb25zLnJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluO1xuICBpZiAoIWRvbWFpbikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgbGV0IGVtYWlsSXNHb29kID0gZmFsc2U7XG4gIGlmICh1c2VyLmVtYWlscyAmJiB1c2VyLmVtYWlscy5sZW5ndGggPiAwKSB7XG4gICAgZW1haWxJc0dvb2QgPSB1c2VyLmVtYWlscy5yZWR1Y2UoXG4gICAgICAocHJldiwgZW1haWwpID0+IHByZXYgfHwgdGhpcy5fdGVzdEVtYWlsRG9tYWluKGVtYWlsLmFkZHJlc3MpLCBmYWxzZVxuICAgICk7XG4gIH0gZWxzZSBpZiAodXNlci5zZXJ2aWNlcyAmJiBPYmplY3QudmFsdWVzKHVzZXIuc2VydmljZXMpLmxlbmd0aCA+IDApIHtcbiAgICAvLyBGaW5kIGFueSBlbWFpbCBvZiBhbnkgc2VydmljZSBhbmQgY2hlY2sgaXRcbiAgICBlbWFpbElzR29vZCA9IE9iamVjdC52YWx1ZXModXNlci5zZXJ2aWNlcykucmVkdWNlKFxuICAgICAgKHByZXYsIHNlcnZpY2UpID0+IHNlcnZpY2UuZW1haWwgJiYgdGhpcy5fdGVzdEVtYWlsRG9tYWluKHNlcnZpY2UuZW1haWwpLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgfVxuXG4gIGlmIChlbWFpbElzR29vZCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBkb21haW4gPT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIGBAJHtkb21haW59IGVtYWlsIHJlcXVpcmVkYCk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiRW1haWwgZG9lc24ndCBtYXRjaCB0aGUgY3JpdGVyaWEuXCIpO1xuICB9XG59XG5cbmNvbnN0IHNldHVwVXNlcnNDb2xsZWN0aW9uID0gYXN5bmMgdXNlcnMgPT4ge1xuICAvLy9cbiAgLy8vIFJFU1RSSUNUSU5HIFdSSVRFUyBUTyBVU0VSIE9CSkVDVFNcbiAgLy8vXG4gIHVzZXJzLmFsbG93KHtcbiAgICAvLyBjbGllbnRzIGNhbiBtb2RpZnkgdGhlIHByb2ZpbGUgZmllbGQgb2YgdGhlaXIgb3duIGRvY3VtZW50LCBhbmRcbiAgICAvLyBub3RoaW5nIGVsc2UuXG4gICAgdXBkYXRlOiAodXNlcklkLCB1c2VyLCBmaWVsZHMsIG1vZGlmaWVyKSA9PiB7XG4gICAgICAvLyBtYWtlIHN1cmUgaXQgaXMgb3VyIHJlY29yZFxuICAgICAgaWYgKHVzZXIuX2lkICE9PSB1c2VySWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyB1c2VyIGNhbiBvbmx5IG1vZGlmeSB0aGUgJ3Byb2ZpbGUnIGZpZWxkLiBzZXRzIHRvIG11bHRpcGxlXG4gICAgICAvLyBzdWIta2V5cyAoZWcgcHJvZmlsZS5mb28gYW5kIHByb2ZpbGUuYmFyKSBhcmUgbWVyZ2VkIGludG8gZW50cnlcbiAgICAgIC8vIGluIHRoZSBmaWVsZHMgbGlzdC5cbiAgICAgIGlmIChmaWVsZHMubGVuZ3RoICE9PSAxIHx8IGZpZWxkc1swXSAhPT0gJ3Byb2ZpbGUnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBmZXRjaDogWydfaWQnXSAvLyB3ZSBvbmx5IGxvb2sgYXQgX2lkLlxuICB9KTtcblxuICAvLy8gREVGQVVMVCBJTkRFWEVTIE9OIFVTRVJTXG4gIGF3YWl0IHVzZXJzLmNyZWF0ZUluZGV4QXN5bmMoJ3VzZXJuYW1lJywgeyB1bmlxdWU6IHRydWUsIHNwYXJzZTogdHJ1ZSB9KTtcbiAgYXdhaXQgdXNlcnMuY3JlYXRlSW5kZXhBc3luYygnZW1haWxzLmFkZHJlc3MnLCB7IHVuaXF1ZTogdHJ1ZSwgc3BhcnNlOiB0cnVlIH0pO1xuICBhd2FpdCB1c2Vycy5jcmVhdGVJbmRleEFzeW5jKCdzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMuaGFzaGVkVG9rZW4nLFxuICAgIHsgdW5pcXVlOiB0cnVlLCBzcGFyc2U6IHRydWUgfSk7XG4gIGF3YWl0IHVzZXJzLmNyZWF0ZUluZGV4QXN5bmMoJ3NlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucy50b2tlbicsXG4gICAgeyB1bmlxdWU6IHRydWUsIHNwYXJzZTogdHJ1ZSB9KTtcbiAgLy8gRm9yIHRha2luZyBjYXJlIG9mIGxvZ291dE90aGVyQ2xpZW50cyBjYWxscyB0aGF0IGNyYXNoZWQgYmVmb3JlIHRoZVxuICAvLyB0b2tlbnMgd2VyZSBkZWxldGVkLlxuICBhd2FpdCB1c2Vycy5jcmVhdGVJbmRleEFzeW5jKCdzZXJ2aWNlcy5yZXN1bWUuaGF2ZUxvZ2luVG9rZW5zVG9EZWxldGUnLFxuICAgIHsgc3BhcnNlOiB0cnVlIH0pO1xuICAvLyBGb3IgZXhwaXJpbmcgbG9naW4gdG9rZW5zXG4gIGF3YWl0IHVzZXJzLmNyZWF0ZUluZGV4QXN5bmMoXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMud2hlblwiLCB7IHNwYXJzZTogdHJ1ZSB9KTtcbiAgLy8gRm9yIGV4cGlyaW5nIHBhc3N3b3JkIHRva2Vuc1xuICBhd2FpdCB1c2Vycy5jcmVhdGVJbmRleEFzeW5jKCdzZXJ2aWNlcy5wYXNzd29yZC5yZXNldC53aGVuJywgeyBzcGFyc2U6IHRydWUgfSk7XG4gIGF3YWl0IHVzZXJzLmNyZWF0ZUluZGV4QXN5bmMoJ3NlcnZpY2VzLnBhc3N3b3JkLmVucm9sbC53aGVuJywgeyBzcGFyc2U6IHRydWUgfSk7XG59O1xuXG5cbi8vIEdlbmVyYXRlcyBwZXJtdXRhdGlvbnMgb2YgYWxsIGNhc2UgdmFyaWF0aW9ucyBvZiBhIGdpdmVuIHN0cmluZy5cbmNvbnN0IGdlbmVyYXRlQ2FzZVBlcm11dGF0aW9uc0ZvclN0cmluZyA9IHN0cmluZyA9PiB7XG4gIGxldCBwZXJtdXRhdGlvbnMgPSBbJyddO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoID0gc3RyaW5nLmNoYXJBdChpKTtcbiAgICBwZXJtdXRhdGlvbnMgPSBbXS5jb25jYXQoLi4uKHBlcm11dGF0aW9ucy5tYXAocHJlZml4ID0+IHtcbiAgICAgIGNvbnN0IGxvd2VyQ2FzZUNoYXIgPSBjaC50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3QgdXBwZXJDYXNlQ2hhciA9IGNoLnRvVXBwZXJDYXNlKCk7XG4gICAgICAvLyBEb24ndCBhZGQgdW5uZWNlc3NhcnkgcGVybXV0YXRpb25zIHdoZW4gY2ggaXMgbm90IGEgbGV0dGVyXG4gICAgICBpZiAobG93ZXJDYXNlQ2hhciA9PT0gdXBwZXJDYXNlQ2hhcikge1xuICAgICAgICByZXR1cm4gW3ByZWZpeCArIGNoXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbcHJlZml4ICsgbG93ZXJDYXNlQ2hhciwgcHJlZml4ICsgdXBwZXJDYXNlQ2hhcl07XG4gICAgICB9XG4gICAgfSkpKTtcbiAgfVxuICByZXR1cm4gcGVybXV0YXRpb25zO1xufVxuIl19
