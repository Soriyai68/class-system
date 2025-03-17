Package["core-runtime"].queue("aldeed:simple-schema",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var key, name, options, schema, genericKey;

var require = meteorInstall({"node_modules":{"meteor":{"aldeed:simple-schema":{"lib":{"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/main.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let SimpleSchema, ValidationContext;
    module.link("./SimpleSchema", {
      SimpleSchema(v) {
        SimpleSchema = v;
      },
      ValidationContext(v) {
        ValidationContext = v;
      }
    }, 0);
    module.link("./clean");
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    SimpleSchema.ValidationContext = ValidationContext;
    module.exportDefault(SimpleSchema);
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

},"SimpleSchema.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/SimpleSchema.js                                                                   //
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
    const _excluded = ["type"];
    module.export({
      schemaDefinitionOptions: () => schemaDefinitionOptions,
      SimpleSchema: () => SimpleSchema,
      ValidationContext: () => ValidationContext
    });
    let clone;
    module.link("clone", {
      default(v) {
        clone = v;
      }
    }, 0);
    let MessageBox;
    module.link("message-box", {
      default(v) {
        MessageBox = v;
      }
    }, 1);
    let MongoObject;
    module.link("mongo-object", {
      default(v) {
        MongoObject = v;
      }
    }, 2);
    let humanize;
    module.link("./humanize", {
      default(v) {
        humanize = v;
      }
    }, 3);
    let ValidationContext;
    module.link("./ValidationContext", {
      default(v) {
        ValidationContext = v;
      }
    }, 4);
    let SimpleSchemaGroup;
    module.link("./SimpleSchemaGroup", {
      default(v) {
        SimpleSchemaGroup = v;
      }
    }, 5);
    let regExpObj;
    module.link("./regExp", {
      default(v) {
        regExpObj = v;
      }
    }, 6);
    let clean;
    module.link("./clean", {
      default(v) {
        clean = v;
      }
    }, 7);
    let expandShorthand;
    module.link("./expandShorthand", {
      default(v) {
        expandShorthand = v;
      }
    }, 8);
    let forEachKeyAncestor, isEmptyObject, merge;
    module.link("./utility", {
      forEachKeyAncestor(v) {
        forEachKeyAncestor = v;
      },
      isEmptyObject(v) {
        isEmptyObject = v;
      },
      merge(v) {
        merge = v;
      }
    }, 9);
    let defaultMessages;
    module.link("./defaultMessages", {
      default(v) {
        defaultMessages = v;
      }
    }, 10);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const schemaDefinitionOptions = ['autoValue', 'defaultValue', 'label', 'optional', 'required', 'type'];
    const oneOfProps = ['allowedValues', 'blackbox', 'custom', 'exclusiveMax', 'exclusiveMin', 'max', 'maxCount', 'min', 'minCount', 'regEx', 'skipRegExCheckForEmptyStrings', 'trim', 'type'];
    const propsThatCanBeFunction = ['allowedValues', 'exclusiveMax', 'exclusiveMin', 'label', 'max', 'maxCount', 'min', 'minCount', 'optional', 'regEx', 'skipRegExCheckForEmptyStrings'];
    class SimpleSchema {
      constructor() {
        let schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        /**
         * @method SimpleSchema#pick
         * @param {[fields]} The list of fields to pick to instantiate the subschema
         * @returns {SimpleSchema} The subschema
         */
        this.pick = getPickOrOmit('pick');
        /**
         * @method SimpleSchema#omit
         * @param {[fields]} The list of fields to omit to instantiate the subschema
         * @returns {SimpleSchema} The subschema
         */
        this.omit = getPickOrOmit('omit');
        // Stash the options object
        this._constructorOptions = _objectSpread(_objectSpread({}, SimpleSchema._constructorOptionDefaults), options);
        delete this._constructorOptions.clean; // stored separately below

        // Schema-level defaults for cleaning
        this._cleanOptions = _objectSpread(_objectSpread({}, SimpleSchema._constructorOptionDefaults.clean), options.clean || {});

        // Custom validators for this instance
        this._validators = [];
        this._docValidators = [];

        // Named validation contexts
        this._validationContexts = {};

        // Clone, expanding shorthand, and store the schema object in this._schema
        this._schema = {};
        this._depsLabels = {};
        this.extend(schema);

        // Clone raw definition and save if keepRawDefinition is active
        this._rawDefinition = this._constructorOptions.keepRawDefinition ? schema : null;

        // Define default validation error messages
        this.messageBox = new MessageBox(clone(defaultMessages));
        this.version = SimpleSchema.version;
      }

      /**
      /* @returns {Object} The entire raw schema definition passed in the constructor
      */
      get rawDefinition() {
        return this._rawDefinition;
      }
      forEachAncestorSimpleSchema(key, func) {
        const genericKey = MongoObject.makeKeyGeneric(key);
        forEachKeyAncestor(genericKey, ancestor => {
          const def = this._schema[ancestor];
          if (!def) return;
          def.type.definitions.forEach(typeDef => {
            if (SimpleSchema.isSimpleSchema(typeDef.type)) {
              func(typeDef.type, ancestor, genericKey.slice(ancestor.length + 1));
            }
          });
        });
      }

      /**
       * Returns whether the obj is a SimpleSchema object.
       * @param {Object} [obj] An object to test
       * @returns {Boolean} True if the given object appears to be a SimpleSchema instance
       */
      static isSimpleSchema(obj) {
        return obj && (obj instanceof SimpleSchema || obj._schema);
      }

      /**
       * For Meteor apps, add a reactive dependency on the label
       * for a key.
       */
      reactiveLabelDependency(key) {
        let tracker = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._constructorOptions.tracker;
        if (!key || !tracker) return;
        const genericKey = MongoObject.makeKeyGeneric(key);

        // If in this schema
        if (this._schema[genericKey]) {
          if (!this._depsLabels[genericKey]) {
            this._depsLabels[genericKey] = new tracker.Dependency();
          }
          this._depsLabels[genericKey].depend();
          return;
        }

        // If in subschema
        this.forEachAncestorSimpleSchema(key, (simpleSchema, ancestor, subSchemaKey) => {
          // Pass tracker down so that we get reactivity even if the subschema
          // didn't have tracker option set
          simpleSchema.reactiveLabelDependency(subSchemaKey, tracker);
        });
      }

      /**
       * @param {String} key One specific or generic key for which to get the schema.
       * @returns {[SimpleSchema, String]} Returns a 2-tuple.
       *
       *   First item: The SimpleSchema instance that actually defines the given key.
       *
       *   For example, if you have several nested objects, each their own SimpleSchema
       *   instance, and you pass in 'outerObj.innerObj.innerestObj.name' as the key, you'll
       *   get back the SimpleSchema instance for `outerObj.innerObj.innerestObj` key.
       *
       *   But if you pass in 'outerObj.innerObj.innerestObj.name' as the key and that key is
       *   defined in the main schema without use of subschemas, then you'll get back the main schema.
       *
       *   Second item: The part of the key that is in the found schema.
       *
       *   Always returns a tuple (array) but the values may be `null`.
       */
      nearestSimpleSchemaInstance(key) {
        if (!key) return [null, null];
        const genericKey = MongoObject.makeKeyGeneric(key);
        if (this._schema[genericKey]) return [this, genericKey];

        // If not defined in this schema, see if it's defined in a subschema
        let innerKey;
        let nearestSimpleSchemaInstance;
        this.forEachAncestorSimpleSchema(key, (simpleSchema, ancestor, subSchemaKey) => {
          if (!nearestSimpleSchemaInstance && simpleSchema._schema[subSchemaKey]) {
            nearestSimpleSchemaInstance = simpleSchema;
            innerKey = subSchemaKey;
          }
        });
        return innerKey ? [nearestSimpleSchemaInstance, innerKey] : [null, null];
      }

      /**
       * @param {String} [key] One specific or generic key for which to get the schema.
       * @returns {Object} The entire schema object or just the definition for one key.
       *
       * Note that this returns the raw, unevaluated definition object. Use `getDefinition`
       * if you want the evaluated definition, where any properties that are functions
       * have been run to produce a result.
       */
      schema(key) {
        if (!key) return this._schema;
        const genericKey = MongoObject.makeKeyGeneric(key);
        let keySchema = this._schema[genericKey];

        // If not defined in this schema, see if it's defined in a subschema
        if (!keySchema) {
          let found = false;
          this.forEachAncestorSimpleSchema(key, (simpleSchema, ancestor, subSchemaKey) => {
            if (!found) keySchema = simpleSchema.schema(subSchemaKey);
            if (keySchema) found = true;
          });
        }
        return keySchema;
      }

      /**
       * @returns {Object} The entire schema object with subschemas merged. This is the
       * equivalent of what schema() returned in SimpleSchema < 2.0
       *
       * Note that this returns the raw, unevaluated definition object. Use `getDefinition`
       * if you want the evaluated definition, where any properties that are functions
       * have been run to produce a result.
       */
      mergedSchema() {
        const mergedSchema = {};
        this._schemaKeys.forEach(key => {
          const keySchema = this._schema[key];
          mergedSchema[key] = keySchema;
          keySchema.type.definitions.forEach(typeDef => {
            if (!SimpleSchema.isSimpleSchema(typeDef.type)) return;
            const childSchema = typeDef.type.mergedSchema();
            Object.keys(childSchema).forEach(subKey => {
              mergedSchema["".concat(key, ".").concat(subKey)] = childSchema[subKey];
            });
          });
        });
        return mergedSchema;
      }

      /**
       * Returns the evaluated definition for one key in the schema
       *
       * @param {String} key Generic or specific schema key
       * @param {Array(String)} [propList] Array of schema properties you need; performance optimization
       * @param {Object} [functionContext] The context to use when evaluating schema options that are functions
       * @returns {Object} The schema definition for the requested key
       */
      getDefinition(key, propList) {
        let functionContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        const defs = this.schema(key);
        if (!defs) return;
        const getPropIterator = (obj, newObj) => {
          return prop => {
            if (Array.isArray(propList) && !propList.includes(prop)) return;
            const val = obj[prop];
            // For any options that support specifying a function, evaluate the functions
            if (propsThatCanBeFunction.indexOf(prop) > -1 && typeof val === 'function') {
              newObj[prop] = val.call(_objectSpread({
                key
              }, functionContext));
              // Inflect label if undefined
              if (prop === 'label' && typeof newObj[prop] !== 'string') newObj[prop] = inflectedLabel(key, this._constructorOptions.humanizeAutoLabels);
            } else {
              newObj[prop] = val;
            }
          };
        };
        const result = {};
        Object.keys(defs).forEach(getPropIterator(defs, result));

        // Resolve all the types and convert to a normal array to make it easier
        // to use.
        if (defs.type) {
          result.type = defs.type.definitions.map(typeDef => {
            const newTypeDef = {};
            Object.keys(typeDef).forEach(getPropIterator(typeDef, newTypeDef));
            return newTypeDef;
          });
        }
        return result;
      }

      /**
       * Returns a string identifying the best guess data type for a key. For keys
       * that allow multiple types, the first type is used. This can be useful for
       * building forms.
       *
       * @param {String} key Generic or specific schema key
       * @returns {String} A type string. One of:
       *  string, number, boolean, date, object, stringArray, numberArray, booleanArray,
       *  dateArray, objectArray
       */
      getQuickTypeForKey(key) {
        let type;
        const fieldSchema = this.schema(key);
        if (!fieldSchema) return;
        const fieldType = fieldSchema.type.singleType;
        if (fieldType === String) {
          type = 'string';
        } else if (fieldType === Number || fieldType === SimpleSchema.Integer) {
          type = 'number';
        } else if (fieldType === Boolean) {
          type = 'boolean';
        } else if (fieldType === Date) {
          type = 'date';
        } else if (fieldType === Array) {
          const arrayItemFieldSchema = this.schema("".concat(key, ".$"));
          if (!arrayItemFieldSchema) return;
          const arrayItemFieldType = arrayItemFieldSchema.type.singleType;
          if (arrayItemFieldType === String) {
            type = 'stringArray';
          } else if (arrayItemFieldType === Number || arrayItemFieldType === SimpleSchema.Integer) {
            type = 'numberArray';
          } else if (arrayItemFieldType === Boolean) {
            type = 'booleanArray';
          } else if (arrayItemFieldType === Date) {
            type = 'dateArray';
          } else if (arrayItemFieldType === Object || SimpleSchema.isSimpleSchema(arrayItemFieldType)) {
            type = 'objectArray';
          }
        } else if (fieldType === Object) {
          type = 'object';
        }
        return type;
      }

      /**
       * Given a key that is an Object, returns a new SimpleSchema instance scoped to that object.
       *
       * @param {String} key Generic or specific schema key
       */
      getObjectSchema(key) {
        const newSchemaDef = {};
        const genericKey = MongoObject.makeKeyGeneric(key);
        const searchString = "".concat(genericKey, ".");
        const mergedSchema = this.mergedSchema();
        Object.keys(mergedSchema).forEach(k => {
          if (k.indexOf(searchString) === 0) {
            newSchemaDef[k.slice(searchString.length)] = mergedSchema[k];
          }
        });
        return this._copyWithSchema(newSchemaDef);
      }

      // Returns an array of all the autovalue functions, including those in subschemas all the
      // way down the schema tree
      autoValueFunctions() {
        let result = [].concat(this._autoValues);
        this._schemaKeys.forEach(key => {
          this._schema[key].type.definitions.forEach(typeDef => {
            if (!SimpleSchema.isSimpleSchema(typeDef.type)) return;
            result = result.concat(typeDef.type.autoValueFunctions().map(_ref => {
              let {
                func,
                fieldName,
                closestSubschemaFieldName
              } = _ref;
              return {
                func,
                fieldName: "".concat(key, ".").concat(fieldName),
                closestSubschemaFieldName: closestSubschemaFieldName.length ? "".concat(key, ".").concat(closestSubschemaFieldName) : key
              };
            }));
          });
        });
        return result;
      }

      // Returns an array of all the blackbox keys, including those in subschemas
      blackboxKeys() {
        const blackboxKeys = new Set(this._blackboxKeys);
        this._schemaKeys.forEach(key => {
          this._schema[key].type.definitions.forEach(typeDef => {
            if (!SimpleSchema.isSimpleSchema(typeDef.type)) return;
            typeDef.type.blackboxKeys().forEach(blackboxKey => {
              blackboxKeys.add("".concat(key, ".").concat(blackboxKey));
            });
          });
        });
        return Array.from(blackboxKeys);
      }

      // Check if the key is a nested dot-syntax key inside of a blackbox object
      keyIsInBlackBox(key) {
        let isInBlackBox = false;
        forEachKeyAncestor(MongoObject.makeKeyGeneric(key), (ancestor, remainder) => {
          if (this._blackboxKeys.has(ancestor)) {
            isInBlackBox = true;
          } else {
            const testKeySchema = this.schema(ancestor);
            if (testKeySchema) {
              testKeySchema.type.definitions.forEach(typeDef => {
                if (!SimpleSchema.isSimpleSchema(typeDef.type)) return;
                if (typeDef.type.keyIsInBlackBox(remainder)) isInBlackBox = true;
              });
            }
          }
        });
        return isInBlackBox;
      }

      // Returns true if key is explicitly allowed by the schema or implied
      // by other explicitly allowed keys.
      // The key string should have $ in place of any numeric array positions.
      allowsKey(key) {
        // Loop through all keys in the schema
        return this._schemaKeys.some(loopKey => {
          // If the schema key is the test key, it's allowed.
          if (loopKey === key) return true;
          const fieldSchema = this.schema(loopKey);
          const compare1 = key.slice(0, loopKey.length + 2);
          const compare2 = compare1.slice(0, -1);

          // Blackbox and subschema checks are needed only if key starts with
          // loopKey + a dot
          if (compare2 !== "".concat(loopKey, ".")) return false;

          // Black box handling
          if (this._blackboxKeys.has(loopKey)) {
            // If the test key is the black box key + ".$", then the test
            // key is NOT allowed because black box keys are by definition
            // only for objects, and not for arrays.
            return compare1 !== "".concat(loopKey, ".$");
          }

          // Subschemas
          let allowed = false;
          const subKey = key.slice(loopKey.length + 1);
          fieldSchema.type.definitions.forEach(typeDef => {
            if (!SimpleSchema.isSimpleSchema(typeDef.type)) return;
            if (typeDef.type.allowsKey(subKey)) allowed = true;
          });
          return allowed;
        });
      }

      /**
       * Returns all the child keys for the object identified by the generic prefix,
       * or all the top level keys if no prefix is supplied.
       *
       * @param {String} [keyPrefix] The Object-type generic key for which to get child keys. Omit for
       *   top-level Object-type keys
       * @returns {[[Type]]} [[Description]]
       */
      objectKeys(keyPrefix) {
        if (!keyPrefix) return this._firstLevelSchemaKeys;
        const objectKeys = [];
        const setObjectKeys = (curSchema, schemaParentKey) => {
          Object.keys(curSchema).forEach(fieldName => {
            const definition = curSchema[fieldName];
            fieldName = schemaParentKey ? "".concat(schemaParentKey, ".").concat(fieldName) : fieldName;
            if (fieldName.indexOf('.') > -1 && fieldName.slice(-2) !== '.$') {
              const parentKey = fieldName.slice(0, fieldName.lastIndexOf('.'));
              const parentKeyWithDot = "".concat(parentKey, ".");
              objectKeys[parentKeyWithDot] = objectKeys[parentKeyWithDot] || [];
              objectKeys[parentKeyWithDot].push(fieldName.slice(fieldName.lastIndexOf('.') + 1));
            }

            // If the current field is a nested SimpleSchema,
            // iterate over the child fields and cache their properties as well
            definition.type.definitions.forEach(_ref2 => {
              let {
                type
              } = _ref2;
              if (SimpleSchema.isSimpleSchema(type)) {
                setObjectKeys(type._schema, fieldName);
              }
            });
          });
        };
        setObjectKeys(this._schema);
        return objectKeys["".concat(keyPrefix, ".")] || [];
      }

      /**
       * Copies this schema into a new instance with the same validators, messages,
       * and options, but with different keys as defined in `schema` argument
       *
       * @param {Object} schema
       * @returns The new SimpleSchema instance (chainable)
       */
      _copyWithSchema(schema) {
        const cl = new SimpleSchema(schema, _objectSpread({}, this._constructorOptions));
        cl._cleanOptions = this._cleanOptions;
        cl.messageBox = this.messageBox.clone();
        return cl;
      }

      /**
       * Clones this schema into a new instance with the same schema keys, validators,
       * and options.
       *
       * @returns The new SimpleSchema instance (chainable)
       */
      clone() {
        return this._copyWithSchema(this._schema);
      }

      /**
       * Extends (mutates) this schema with another schema, key by key.
       *
       * @param {SimpleSchema|Object} schema
       * @returns The SimpleSchema instance (chainable)
       */
      extend() {
        let schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        if (Array.isArray(schema)) throw new Error('You may not pass an array of schemas to the SimpleSchema constructor or to extend()');
        let schemaObj;
        if (SimpleSchema.isSimpleSchema(schema)) {
          schemaObj = schema._schema;
          this._validators = this._validators.concat(schema._validators);
          this._docValidators = this._docValidators.concat(schema._docValidators);
          Object.assign(this._cleanOptions, schema._cleanOptions);
          Object.assign(this._constructorOptions, schema._constructorOptions);
        } else {
          schemaObj = expandShorthand(schema);
        }
        const schemaKeys = Object.keys(schemaObj);
        const combinedKeys = new Set([...Object.keys(this._schema), ...schemaKeys]);

        // Update all of the information cached on the instance
        schemaKeys.forEach(fieldName => {
          const definition = standardizeDefinition(schemaObj[fieldName]);

          // Merge/extend with any existing definition
          if (this._schema[fieldName]) {
            if (!Object.prototype.hasOwnProperty.call(this._schema, fieldName)) {
              // fieldName is actually a method from Object itself!
              throw new Error("".concat(fieldName, " key is actually the name of a method on Object, please rename it"));
            }
            const {
                type
              } = definition,
              definitionWithoutType = _objectWithoutProperties(definition, _excluded); // eslint-disable-line no-unused-vars

            this._schema[fieldName] = _objectSpread(_objectSpread({}, this._schema[fieldName]), definitionWithoutType);
            if (definition.type) this._schema[fieldName].type.extend(definition.type);
          } else {
            this._schema[fieldName] = definition;
          }
          checkAndScrubDefinition(fieldName, this._schema[fieldName], this._constructorOptions, combinedKeys);
        });
        checkSchemaOverlap(this._schema);

        // Set/Reset all of these
        this._schemaKeys = Object.keys(this._schema);
        this._autoValues = [];
        this._blackboxKeys = new Set();
        this._firstLevelSchemaKeys = [];

        // Update all of the information cached on the instance
        this._schemaKeys.forEach(fieldName => {
          // Make sure parent has a definition in the schema. No implied objects!
          if (fieldName.indexOf('.') > -1) {
            const parentFieldName = fieldName.slice(0, fieldName.lastIndexOf('.'));
            if (!Object.prototype.hasOwnProperty.call(this._schema, parentFieldName)) throw new Error("\"".concat(fieldName, "\" is in the schema but \"").concat(parentFieldName, "\" is not"));
          }
          const definition = this._schema[fieldName];

          // Keep list of all top level keys
          if (fieldName.indexOf('.') === -1) this._firstLevelSchemaKeys.push(fieldName);

          // Keep list of all blackbox keys for passing to MongoObject constructor
          // XXX For now if any oneOf type is blackbox, then the whole field is.
          /* eslint-disable no-restricted-syntax */
          for (const oneOfDef of definition.type.definitions) {
            // XXX If the type is SS.Any, also consider it a blackbox
            if (oneOfDef.blackbox === true || oneOfDef.type === SimpleSchema.Any) {
              this._blackboxKeys.add(fieldName);
              break;
            }
          }
          /* eslint-enable no-restricted-syntax */

          // Keep list of autoValue functions
          if (typeof definition.autoValue === 'function') {
            this._autoValues.push({
              closestSubschemaFieldName: '',
              fieldName,
              func: definition.autoValue
            });
          }
        });
        return this;
      }
      getAllowedValuesForKey(key) {
        // For array fields, `allowedValues` is on the array item definition
        if (this.allowsKey("".concat(key, ".$"))) {
          key = "".concat(key, ".$");
        }
        const allowedValues = this.get(key, 'allowedValues');
        if (Array.isArray(allowedValues) || allowedValues instanceof Set) {
          return [...allowedValues];
        }
        return null;
      }
      newContext() {
        return new ValidationContext(this);
      }
      namedContext(name) {
        if (typeof name !== 'string') name = 'default';
        if (!this._validationContexts[name]) {
          this._validationContexts[name] = new ValidationContext(this, name);
        }
        return this._validationContexts[name];
      }
      addValidator(func) {
        this._validators.push(func);
      }
      addDocValidator(func) {
        this._docValidators.push(func);
      }

      /**
       * @param obj {Object|Object[]} Object or array of objects to validate.
       * @param [options] {Object} Same options object that ValidationContext#validate takes
       *
       * Throws an Error with name `ClientError` and `details` property containing the errors.
       */
      validate(obj) {
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        // For Meteor apps, `check` option can be passed to silence audit-argument-checks
        const check = options.check || this._constructorOptions.check;
        if (typeof check === 'function') {
          // Call check but ignore the error
          try {
            check(obj);
          } catch (e) {/* ignore error */}
        }

        // obj can be an array, in which case we validate each object in it and
        // throw as soon as one has an error
        const objects = Array.isArray(obj) ? obj : [obj];
        objects.forEach(oneObj => {
          const validationContext = this.newContext();
          const isValid = validationContext.validate(oneObj, options);
          if (isValid) return;
          const errors = validationContext.validationErrors();

          // In order for the message at the top of the stack trace to be useful,
          // we set it to the first validation error message.
          const message = this.messageForError(errors[0]);
          const error = new Error(message);
          error.errorType = 'ClientError';
          error.name = 'ClientError';
          error.error = 'validation-error';

          // Add meaningful error messages for each validation error.
          // Useful for display messages when using 'mdg:validated-method'.
          error.details = errors.map(errorDetail => _objectSpread(_objectSpread({}, errorDetail), {}, {
            message: this.messageForError(errorDetail)
          }));

          // The primary use for the validationErrorTransform is to convert the
          // vanilla Error into a Meteor.Error until DDP is able to pass
          // vanilla errors back to the client.
          if (typeof SimpleSchema.validationErrorTransform === 'function') {
            throw SimpleSchema.validationErrorTransform(error);
          } else {
            throw error;
          }
        });
      }

      /**
       * @param obj {Object} Object to validate.
       * @param [options] {Object} Same options object that ValidationContext#validate takes
       *
       * Returns a Promise that resolves with the errors
       */
      validateAndReturnErrorsPromise(obj, options) {
        const validationContext = this.newContext();
        const isValid = validationContext.validate(obj, options);
        if (isValid) return Promise.resolve([]);

        // Add the `message` prop
        const errors = validationContext.validationErrors().map(errorDetail => {
          return _objectSpread(_objectSpread({}, errorDetail), {}, {
            message: this.messageForError(errorDetail)
          });
        });
        return Promise.resolve(errors);
      }
      validator() {
        let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return obj => {
          const optionsClone = _objectSpread({}, options);
          if (options.clean === true) {
            // Do this here and pass into both functions for better performance
            optionsClone.mongoObject = new MongoObject(obj, this.blackboxKeys());
            this.clean(obj, optionsClone);
          }
          if (options.returnErrorsPromise) {
            return this.validateAndReturnErrorsPromise(obj, optionsClone);
          }
          return this.validate(obj, optionsClone);
        };
      }
      getFormValidator() {
        let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return this.validator(_objectSpread(_objectSpread({}, options), {}, {
          returnErrorsPromise: true
        }));
      }
      clean() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return clean(this, ...args);
      }

      /**
       * Change schema labels on the fly, causing mySchema.label computation
       * to rerun. Useful when the user changes the language.
       *
       * @param {Object} labels A dictionary of all the new label values, by schema key.
       */
      labels(labels) {
        Object.keys(labels).forEach(key => {
          const label = labels[key];
          if (typeof label !== 'string' && typeof label !== 'function') return;
          const [schemaInstance, innerKey] = this.nearestSimpleSchemaInstance(key);
          if (!schemaInstance) return;
          schemaInstance._schema[innerKey].label = label;
          schemaInstance._depsLabels[innerKey] && schemaInstance._depsLabels[innerKey].changed();
        });
      }

      /**
       * Gets a field's label or all field labels reactively.
       *
       * @param {String} [key] The schema key, specific or generic.
       *   Omit this argument to get a dictionary of all labels.
       * @returns {String} The label
       */
      label(key) {
        // Get all labels
        if (key === null || key === undefined) {
          const result = {};
          this._schemaKeys.forEach(schemaKey => {
            result[schemaKey] = this.label(schemaKey);
          });
          return result;
        }

        // Get label for one field
        const label = this.get(key, 'label');
        if (label) this.reactiveLabelDependency(key);
        return label || null;
      }

      /**
       * Gets a field's property
       *
       * @param {String} key The schema key, specific or generic.
       * @param {String} prop Name of the property to get for that schema key
       * @param {Object} [functionContext] The `this` context to use if prop is a function
       * @returns {any} The property value
       */
      get(key, prop, functionContext) {
        const def = this.getDefinition(key, ['type', prop], functionContext);
        if (!def) return undefined;
        if (schemaDefinitionOptions.includes(prop)) {
          return def[prop];
        }
        return (def.type.find(props => props[prop]) || {})[prop];
      }

      // shorthand for getting defaultValue
      defaultValue(key) {
        return this.get(key, 'defaultValue');
      }

      // Returns a string message for the given error type and key. Passes through
      // to message-box pkg.
      messageForError(errorInfo) {
        const {
          name
        } = errorInfo;
        return this.messageBox.message(errorInfo, {
          context: {
            key: name,
            // backward compatibility

            // The call to this.label() establishes a reactive dependency, too
            label: this.label(name)
          }
        });
      }
      // If you need to allow properties other than those listed above, call this from your app or package
      static extendOptions(options) {
        // For backwards compatibility we still take an object here, but we only care about the names
        if (!Array.isArray(options)) options = Object.keys(options);
        options.forEach(option => {
          schemaDefinitionOptions.push(option);
        });
      }
      static defineValidationErrorTransform(transform) {
        if (typeof transform !== 'function') {
          throw new Error('SimpleSchema.defineValidationErrorTransform must be passed a function that accepts an Error and returns an Error');
        }
        SimpleSchema.validationErrorTransform = transform;
      }
      static validate(obj, schema, options) {
        // Allow passing just the schema object
        if (!SimpleSchema.isSimpleSchema(schema)) {
          schema = new SimpleSchema(schema);
        }
        return schema.validate(obj, options);
      }
      static oneOf() {
        for (var _len2 = arguments.length, definitions = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          definitions[_key2] = arguments[_key2];
        }
        return new SimpleSchemaGroup(...definitions);
      }
      static addValidator(func) {
        SimpleSchema._validators.push(func);
      }
      static addDocValidator(func) {
        SimpleSchema._docValidators.push(func);
      }

      // Global constructor options

      /**
       * @summary Get/set default values for SimpleSchema constructor options
       */
      static constructorOptionDefaults(options) {
        if (!options) return SimpleSchema._constructorOptionDefaults;
        SimpleSchema._constructorOptionDefaults = _objectSpread(_objectSpread(_objectSpread({}, SimpleSchema._constructorOptionDefaults), options), {}, {
          clean: _objectSpread(_objectSpread({}, SimpleSchema._constructorOptionDefaults.clean), options.clean || {})
        });
      }
    }

    /*
     * PRIVATE
     */

    // Throws an error if any fields are `type` SimpleSchema but then also
    // have subfields defined outside of that.
    SimpleSchema.version = 2;
    SimpleSchema.Any = '___Any___';
    SimpleSchema.RegEx = regExpObj;
    // Global custom validators
    SimpleSchema._validators = [];
    SimpleSchema._docValidators = [];
    SimpleSchema._constructorOptionDefaults = {
      clean: {
        autoConvert: true,
        extendAutoValueContext: {},
        filter: true,
        getAutoValues: true,
        removeEmptyStrings: true,
        removeNullsFromArrays: false,
        trimStrings: true
      },
      humanizeAutoLabels: true,
      requiredByDefault: true
    };
    SimpleSchema.ErrorTypes = {
      REQUIRED: 'required',
      MIN_STRING: 'minString',
      MAX_STRING: 'maxString',
      MIN_NUMBER: 'minNumber',
      MAX_NUMBER: 'maxNumber',
      MIN_NUMBER_EXCLUSIVE: 'minNumberExclusive',
      MAX_NUMBER_EXCLUSIVE: 'maxNumberExclusive',
      MIN_DATE: 'minDate',
      MAX_DATE: 'maxDate',
      BAD_DATE: 'badDate',
      MIN_COUNT: 'minCount',
      MAX_COUNT: 'maxCount',
      MUST_BE_INTEGER: 'noDecimal',
      VALUE_NOT_ALLOWED: 'notAllowed',
      EXPECTED_TYPE: 'expectedType',
      FAILED_REGULAR_EXPRESSION: 'regEx',
      KEY_NOT_IN_SCHEMA: 'keyNotInSchema'
    };
    SimpleSchema.Integer = 'SimpleSchema.Integer';
    // Backwards compatibility
    SimpleSchema._makeGeneric = MongoObject.makeKeyGeneric;
    SimpleSchema.ValidationContext = ValidationContext;
    SimpleSchema.setDefaultMessages = messages => {
      merge(defaultMessages, messages);
    };
    function checkSchemaOverlap(schema) {
      Object.keys(schema).forEach(key => {
        const val = schema[key];
        if (!val.type) throw new Error("".concat(key, " key is missing \"type\""));
        val.type.definitions.forEach(def => {
          if (!SimpleSchema.isSimpleSchema(def.type)) return;
          Object.keys(def.type._schema).forEach(subKey => {
            const newKey = "".concat(key, ".").concat(subKey);
            if (Object.prototype.hasOwnProperty.call(schema, newKey)) {
              throw new Error("The type for \"".concat(key, "\" is set to a SimpleSchema instance that defines \"").concat(key, ".").concat(subKey, "\", but the parent SimpleSchema instance also tries to define \"").concat(key, ".").concat(subKey, "\""));
            }
          });
        });
      });
    }

    /**
     * @param {String} fieldName The full generic schema key
     * @param {Boolean} shouldHumanize Humanize it
     * @returns {String} A label based on the key
     */
    function inflectedLabel(fieldName, shouldHumanize) {
      const pieces = fieldName.split('.');
      let label;
      do {
        label = pieces.pop();
      } while (label === '$' && pieces.length);
      return shouldHumanize ? humanize(label) : label;
    }
    function getDefaultAutoValueFunction(defaultValue) {
      return function defaultAutoValueFunction() {
        if (this.isSet) return;
        if (this.operator === null) return defaultValue;

        // Handle the case when pulling an object from an array the object contains a field
        // which has a defaultValue. We don't want the default value to be returned in this case
        if (this.operator === '$pull') return;

        // Handle the case where we are $pushing an object into an array of objects and we
        // want any fields missing from that object to be added if they have default values
        if (this.operator === '$push') return defaultValue;

        // If parent is set, we should update this position instead of $setOnInsert
        if (this.parentField().isSet) return defaultValue;

        // Make sure the default value is added on upsert insert
        if (this.isUpsert) return {
          $setOnInsert: defaultValue
        };
      };
    }

    // Mutates def into standardized object with SimpleSchemaGroup type
    function standardizeDefinition(def) {
      const standardizedDef = Object.keys(def).reduce((newDef, prop) => {
        if (!oneOfProps.includes(prop)) {
          newDef[prop] = def[prop];
        }
        return newDef;
      }, {});

      // Internally, all definition types are stored as groups for simplicity of access.
      // If we are extending, there may not actually be def.type, but it's okay because
      // it will be added later when the two SimpleSchemaGroups are merged.
      if (def.type && def.type instanceof SimpleSchemaGroup) {
        standardizedDef.type = def.type.clone();
      } else {
        const groupProps = Object.keys(def).reduce((newDef, prop) => {
          if (oneOfProps.includes(prop)) {
            newDef[prop] = def[prop];
          }
          return newDef;
        }, {});
        standardizedDef.type = new SimpleSchemaGroup(groupProps);
      }
      return standardizedDef;
    }

    /**
     * @summary Checks and mutates definition. Clone it first.
     *   Throws errors if any problems are found.
     * @param {String} fieldName Name of field / key
     * @param {Object} definition Field definition
     * @param {Object} options Options
     * @param {Set} allKeys Set of all field names / keys in entire schema
     * @return {undefined} Void
     */
    function checkAndScrubDefinition(fieldName, definition, options, allKeys) {
      if (!definition.type) throw new Error("".concat(fieldName, " key is missing \"type\""));

      // Validate the field definition
      Object.keys(definition).forEach(key => {
        if (schemaDefinitionOptions.indexOf(key) === -1) {
          throw new Error("Invalid definition for ".concat(fieldName, " field: \"").concat(key, "\" is not a supported property"));
        }
      });

      // Make sure the `type`s are OK
      let couldBeArray = false;
      definition.type.definitions.forEach(_ref3 => {
        let {
          type
        } = _ref3;
        if (!type) throw new Error("Invalid definition for ".concat(fieldName, " field: \"type\" option is required"));
        if (Array.isArray(type)) {
          throw new Error("Invalid definition for ".concat(fieldName, " field: \"type\" may not be an array. Change it to Array."));
        }
        if (type.constructor === Object && isEmptyObject(type)) {
          throw new Error("Invalid definition for ".concat(fieldName, " field: \"type\" may not be an object. Change it to Object"));
        }
        if (type === Array) couldBeArray = true;
        if (SimpleSchema.isSimpleSchema(type)) {
          Object.keys(type._schema).forEach(subKey => {
            const newKey = "".concat(fieldName, ".").concat(subKey);
            if (allKeys.has(newKey)) {
              throw new Error("The type for \"".concat(fieldName, "\" is set to a SimpleSchema instance that defines \"").concat(newKey, "\", but the parent SimpleSchema instance also tries to define \"").concat(newKey, "\""));
            }
          });
        }
      });

      // If at least one of the possible types is Array, then make sure we have a
      // definition for the array items, too.
      if (couldBeArray && !allKeys.has("".concat(fieldName, ".$"))) {
        throw new Error("\"".concat(fieldName, "\" is Array type but the schema does not include a \"").concat(fieldName, ".$\" definition for the array items\""));
      }

      // defaultValue -> autoValue
      // We support defaultValue shortcut by converting it immediately into an
      // autoValue.

      if ('defaultValue' in definition) {
        if ('autoValue' in definition && !definition.autoValue.isDefault) {
          console.warn("SimpleSchema: Found both autoValue and defaultValue options for \"".concat(fieldName, "\". Ignoring defaultValue."));
        } else {
          if (fieldName.endsWith('.$')) {
            throw new Error('An array item field (one that ends with ".$") cannot have defaultValue.');
          }
          definition.autoValue = getDefaultAutoValueFunction(definition.defaultValue);
          definition.autoValue.isDefault = true;
        }
      }

      // REQUIREDNESS
      if (fieldName.endsWith('.$')) {
        definition.optional = true;
      } else if (!Object.prototype.hasOwnProperty.call(definition, 'optional')) {
        if (Object.prototype.hasOwnProperty.call(definition, 'required')) {
          if (typeof definition.required === 'function') {
            // Save a reference to the `required` fn because
            // we are going to delete it from `definition` below
            const requiredFn = definition.required;
            definition.optional = function optional() {
              for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
              }
              return !requiredFn.apply(this, args);
            };
          } else {
            definition.optional = !definition.required;
          }
        } else {
          definition.optional = options.requiredByDefault === false;
        }
      }
      delete definition.required;

      // LABELS
      if (!Object.prototype.hasOwnProperty.call(definition, 'label')) {
        if (options.defaultLabel) {
          definition.label = options.defaultLabel;
        } else if (SimpleSchema.defaultLabel) {
          definition.label = SimpleSchema.defaultLabel;
        } else {
          definition.label = inflectedLabel(fieldName, options.humanizeAutoLabels);
        }
      }
    }
    function getPickOrOmit(type) {
      return function pickOrOmit() {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }
        // If they are picking/omitting an object or array field, we need to also include everything under it
        const newSchema = {};
        this._schemaKeys.forEach(key => {
          // Pick/omit it if it IS in the array of keys they want OR if it
          // STARTS WITH something that is in the array plus a period
          const includeIt = args.some(wantedField => key === wantedField || key.indexOf("".concat(wantedField, ".")) === 0);
          if (includeIt && type === 'pick' || !includeIt && type === 'omit') {
            newSchema[key] = this._schema[key];
          }
        });
        return this._copyWithSchema(newSchema);
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

},"SimpleSchemaGroup.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/SimpleSchemaGroup.js                                                              //
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
    let MongoObject;
    module.link("mongo-object", {
      default(v) {
        MongoObject = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class SimpleSchemaGroup {
      constructor() {
        for (var _len = arguments.length, definitions = new Array(_len), _key = 0; _key < _len; _key++) {
          definitions[_key] = arguments[_key];
        }
        this.definitions = definitions.map(definition => {
          if (MongoObject.isBasicObject(definition)) {
            return _objectSpread({}, definition);
          }
          if (definition instanceof RegExp) {
            return {
              type: String,
              regEx: definition
            };
          }
          return {
            type: definition
          };
        });
      }
      get singleType() {
        return this.definitions[0].type;
      }
      clone() {
        return new SimpleSchemaGroup(...this.definitions);
      }
      extend(otherGroup) {
        // We extend based on index being the same. No better way I can think of at the moment.
        this.definitions = this.definitions.map((def, index) => {
          const otherDef = otherGroup.definitions[index];
          if (!otherDef) return def;
          return _objectSpread(_objectSpread({}, def), otherDef);
        });
      }
    }
    module.exportDefault(SimpleSchemaGroup);
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

},"ValidationContext.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/ValidationContext.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      default: () => ValidationContext
    });
    let MongoObject;
    module.link("mongo-object", {
      default(v) {
        MongoObject = v;
      }
    }, 0);
    let doValidation;
    module.link("./doValidation", {
      default(v) {
        doValidation = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class ValidationContext {
      /**
       * @param {SimpleSchema} ss SimpleSchema instance to use for validation
       * @param {String} [name] Optional context name, accessible on context.name.
       */
      constructor(ss, name) {
        this.name = name;
        this._simpleSchema = ss;
        this._schema = ss.schema();
        this._schemaKeys = Object.keys(this._schema);
        this._validationErrors = [];

        // Set up validation dependencies
        this._deps = {};
        const {
          tracker
        } = ss._constructorOptions;
        if (tracker) {
          this._depsAny = new tracker.Dependency();
          this._schemaKeys.forEach(key => {
            this._deps[key] = new tracker.Dependency();
          });
        }
      }
      _markKeyChanged(key) {
        const genericKey = MongoObject.makeKeyGeneric(key);
        if (Object.prototype.hasOwnProperty.call(this._deps, genericKey)) this._deps[genericKey].changed();
      }
      _markKeysChanged(keys) {
        if (!keys || !Array.isArray(keys) || !keys.length) return;
        keys.forEach(key => this._markKeyChanged(key));
        this._depsAny && this._depsAny.changed();
      }
      setValidationErrors(errors) {
        const previousValidationErrors = this._validationErrors.map(o => o.name);
        const newValidationErrors = errors.map(o => o.name);
        this._validationErrors = errors;

        // Mark all previous plus all new as changed
        const changedKeys = previousValidationErrors.concat(newValidationErrors);
        this._markKeysChanged(changedKeys);
      }
      addValidationErrors(errors) {
        const newValidationErrors = errors.map(o => o.name);
        errors.forEach(error => this._validationErrors.push(error));

        // Mark all new as changed
        this._markKeysChanged(newValidationErrors);
      }

      // Reset the validationErrors array
      reset() {
        this.setValidationErrors([]);
      }
      getErrorForKey(key) {
        let genericKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MongoObject.makeKeyGeneric(key);
        const errors = this._validationErrors;
        const errorForKey = errors.find(error => error.name === key);
        if (errorForKey) return errorForKey;
        return errors.find(error => error.name === genericKey);
      }
      _keyIsInvalid(key, genericKey) {
        return !!this.getErrorForKey(key, genericKey);
      }

      // Like the internal one, but with deps
      keyIsInvalid(key) {
        let genericKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MongoObject.makeKeyGeneric(key);
        if (Object.prototype.hasOwnProperty.call(this._deps, genericKey)) this._deps[genericKey].depend();
        return this._keyIsInvalid(key, genericKey);
      }
      keyErrorMessage(key) {
        let genericKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MongoObject.makeKeyGeneric(key);
        if (Object.prototype.hasOwnProperty.call(this._deps, genericKey)) this._deps[genericKey].depend();
        const errorObj = this.getErrorForKey(key, genericKey);
        if (!errorObj) return '';
        return this._simpleSchema.messageForError(errorObj);
      }

      /**
       * Validates the object against the simple schema and sets a reactive array of error objects
       */
      validate(obj) {
        let {
          extendedCustomContext = {},
          ignore: ignoreTypes = [],
          keys: keysToValidate,
          modifier: isModifier = false,
          mongoObject,
          upsert: isUpsert = false
        } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        const validationErrors = doValidation({
          extendedCustomContext,
          ignoreTypes,
          isModifier,
          isUpsert,
          keysToValidate,
          mongoObject,
          obj,
          schema: this._simpleSchema,
          validationContext: this
        });
        if (keysToValidate) {
          // We have only revalidated the listed keys, so if there
          // are any other existing errors that are NOT in the keys list,
          // we should keep these errors.
          /* eslint-disable no-restricted-syntax */
          for (const error of this._validationErrors) {
            const wasValidated = keysToValidate.some(key => key === error.name || error.name.startsWith("".concat(key, ".")));
            if (!wasValidated) validationErrors.push(error);
          }
          /* eslint-enable no-restricted-syntax */
        }
        this.setValidationErrors(validationErrors);

        // Return true if it was valid; otherwise, return false
        return !validationErrors.length;
      }
      isValid() {
        this._depsAny && this._depsAny.depend();
        return this._validationErrors.length === 0;
      }
      validationErrors() {
        this._depsAny && this._depsAny.depend();
        return this._validationErrors;
      }
      clean() {
        return this._simpleSchema.clean(...arguments);
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

},"clean.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/clean.js                                                                          //
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
    let clone;
    module.link("clone", {
      default(v) {
        clone = v;
      }
    }, 0);
    let MongoObject;
    module.link("mongo-object", {
      default(v) {
        MongoObject = v;
      }
    }, 1);
    let isEmptyObject, looksLikeModifier;
    module.link("./utility", {
      isEmptyObject(v) {
        isEmptyObject = v;
      },
      looksLikeModifier(v) {
        looksLikeModifier = v;
      }
    }, 2);
    let SimpleSchema;
    module.link("./SimpleSchema", {
      SimpleSchema(v) {
        SimpleSchema = v;
      }
    }, 3);
    let convertToProperType;
    module.link("./clean/convertToProperType", {
      default(v) {
        convertToProperType = v;
      }
    }, 4);
    let setAutoValues;
    module.link("./clean/setAutoValues", {
      default(v) {
        setAutoValues = v;
      }
    }, 5);
    let typeValidator;
    module.link("./validation/typeValidator", {
      default(v) {
        typeValidator = v;
      }
    }, 6);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const operatorsToIgnoreValue = ['$unset', '$currentDate'];

    /**
     * @param {SimpleSchema} ss - A SimpleSchema instance
     * @param {Object} doc - Document or modifier to clean. Referenced object will be modified in place.
     * @param {Object} [options]
     * @param {Boolean} [options.mutate=false] - Mutate doc. Set this to true to improve performance if you don't mind mutating the object you're cleaning.
     * @param {Boolean} [options.filter=true] - Do filtering?
     * @param {Boolean} [options.autoConvert=true] - Do automatic type converting?
     * @param {Boolean} [options.removeEmptyStrings=true] - Remove keys in normal object or $set where the value is an empty string?
     * @param {Boolean} [options.removeNullsFromArrays=false] - Remove all null items from all arrays
     * @param {Boolean} [options.trimStrings=true] - Trim string values?
     * @param {Boolean} [options.getAutoValues=true] - Inject automatic and default values?
     * @param {Boolean} [options.isModifier=false] - Is doc a modifier object?
     * @param {Boolean} [options.isUpsert=false] - Will the modifier object be used to do an upsert? This is used
     *   to determine whether $setOnInsert should be added to it for defaultValues.
     * @param {Boolean} [options.mongoObject] - If you already have the mongoObject instance, pass it to improve performance
     * @param {Object} [options.extendAutoValueContext] - This object will be added to the `this` context of autoValue functions.
     * @returns {Object} The modified doc.
     *
     * Cleans a document or modifier object. By default, will filter, automatically
     * type convert where possible, and inject automatic/default values. Use the options
     * to skip one or more of these.
     */
    function clean(ss, doc) {
      let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      // By default, doc will be filtered and autoconverted
      options = _objectSpread(_objectSpread({
        isModifier: looksLikeModifier(doc),
        isUpsert: false
      }, ss._cleanOptions), options);

      // Clone so we do not mutate
      const cleanDoc = options.mutate ? doc : clone(doc);
      const mongoObject = options.mongoObject || new MongoObject(cleanDoc, ss.blackboxKeys());

      // Clean loop
      if (options.filter || options.autoConvert || options.removeEmptyStrings || options.trimStrings) {
        const removedPositions = []; // For removing now-empty objects after

        mongoObject.forEachNode(function eachNode() {
          // The value of a $unset is irrelevant, so no point in cleaning it.
          // Also we do not care if fields not in the schema are unset.
          // Other operators also have values that we wouldn't want to clean.
          if (operatorsToIgnoreValue.includes(this.operator)) return;
          const gKey = this.genericKey;
          if (!gKey) return;
          let val = this.value;
          if (val === undefined) return;
          let p;

          // Filter out props if necessary
          if (options.filter && !ss.allowsKey(gKey) || options.removeNullsFromArrays && this.isArrayItem && val === null) {
            // XXX Special handling for $each; maybe this could be made nicer
            if (this.position.slice(-7) === '[$each]') {
              mongoObject.removeValueForPosition(this.position.slice(0, -7));
              removedPositions.push(this.position.slice(0, -7));
            } else {
              this.remove();
              removedPositions.push(this.position);
            }
            if (SimpleSchema.debug) {
              console.info("SimpleSchema.clean: filtered out value that would have affected key \"".concat(gKey, "\", which is not allowed by the schema"));
            }
            return; // no reason to do more
          }
          const outerDef = ss.schema(gKey);
          const defs = outerDef && outerDef.type.definitions;
          const def = defs && defs[0];

          // Autoconvert values if requested and if possible
          if (options.autoConvert && def) {
            const isValidType = defs.some(definition => {
              const errors = typeValidator.call({
                valueShouldBeChecked: true,
                definition,
                value: val
              });
              return errors === undefined;
            });
            if (!isValidType) {
              const newVal = convertToProperType(val, def.type);
              if (newVal !== undefined && newVal !== val) {
                SimpleSchema.debug && console.info("SimpleSchema.clean: autoconverted value ".concat(val, " from ").concat(typeof val, " to ").concat(typeof newVal, " for ").concat(gKey));
                val = newVal;
                this.updateValue(newVal);
              }
            }
          }

          // Trim strings if
          // 1. The trimStrings option is `true` AND
          // 2. The field is not in the schema OR is in the schema with `trim` !== `false` AND
          // 3. The value is a string.
          if (options.trimStrings && (!def || def.trim !== false) && typeof val === 'string') {
            val = val.trim();
            this.updateValue(val);
          }

          // Remove empty strings if
          // 1. The removeEmptyStrings option is `true` AND
          // 2. The value is in a normal object or in the $set part of a modifier
          // 3. The value is an empty string.
          if (options.removeEmptyStrings && (!this.operator || this.operator === '$set') && typeof val === 'string' && !val.length) {
            // For a document, we remove any fields that are being set to an empty string
            this.remove();
            // For a modifier, we $unset any fields that are being set to an empty string.
            // But only if we're not already within an entire object that is being set.
            if (this.operator === '$set' && this.position.match(/\[/g).length < 2) {
              p = this.position.replace('$set', '$unset');
              mongoObject.setValueForPosition(p, '');
            }
          }
        }, {
          endPointsOnly: false
        });

        // Remove any objects that are now empty after filtering
        removedPositions.forEach(removedPosition => {
          const lastBrace = removedPosition.lastIndexOf('[');
          if (lastBrace !== -1) {
            const removedPositionParent = removedPosition.slice(0, lastBrace);
            const value = mongoObject.getValueForPosition(removedPositionParent);
            if (isEmptyObject(value)) mongoObject.removeValueForPosition(removedPositionParent);
          }
        });
        mongoObject.removeArrayItems();
      }

      // Set automatic values
      options.getAutoValues && setAutoValues(ss.autoValueFunctions(), mongoObject, options.isModifier, options.isUpsert, options.extendAutoValueContext);

      // Ensure we don't have any operators set to an empty object
      // since MongoDB 2.6+ will throw errors.
      if (options.isModifier) {
        Object.keys(cleanDoc || {}).forEach(op => {
          const operatorValue = cleanDoc[op];
          if (typeof operatorValue === 'object' && operatorValue !== null && isEmptyObject(operatorValue)) {
            delete cleanDoc[op];
          }
        });
      }
      return cleanDoc;
    }
    module.exportDefault(clean);
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

},"defaultMessages.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/defaultMessages.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let regExpObj;
    module.link("./regExp", {
      default(v) {
        regExpObj = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const regExpMessages = [{
      exp: regExpObj.Email,
      msg: 'must be a valid email address'
    }, {
      exp: regExpObj.EmailWithTLD,
      msg: 'must be a valid email address'
    }, {
      exp: regExpObj.Domain,
      msg: 'must be a valid domain'
    }, {
      exp: regExpObj.WeakDomain,
      msg: 'must be a valid domain'
    }, {
      exp: regExpObj.IP,
      msg: 'must be a valid IPv4 or IPv6 address'
    }, {
      exp: regExpObj.IPv4,
      msg: 'must be a valid IPv4 address'
    }, {
      exp: regExpObj.IPv6,
      msg: 'must be a valid IPv6 address'
    }, {
      exp: regExpObj.Url,
      msg: 'must be a valid URL'
    }, {
      exp: regExpObj.Id,
      msg: 'must be a valid alphanumeric ID'
    }, {
      exp: regExpObj.ZipCode,
      msg: 'must be a valid ZIP code'
    }, {
      exp: regExpObj.Phone,
      msg: 'must be a valid phone number'
    }];
    const defaultMessages = {
      initialLanguage: 'en',
      messages: {
        en: {
          required: '{{{label}}} is required',
          minString: '{{{label}}} must be at least {{min}} characters',
          maxString: '{{{label}}} cannot exceed {{max}} characters',
          minNumber: '{{{label}}} must be at least {{min}}',
          maxNumber: '{{{label}}} cannot exceed {{max}}',
          minNumberExclusive: '{{{label}}} must be greater than {{min}}',
          maxNumberExclusive: '{{{label}}} must be less than {{max}}',
          minDate: '{{{label}}} must be on or after {{min}}',
          maxDate: '{{{label}}} cannot be after {{max}}',
          badDate: '{{{label}}} is not a valid date',
          minCount: 'You must specify at least {{minCount}} values',
          maxCount: 'You cannot specify more than {{maxCount}} values',
          noDecimal: '{{{label}}} must be an integer',
          notAllowed: '{{{value}}} is not an allowed value',
          expectedType: '{{{label}}} must be of type {{dataType}}',
          regEx(_ref) {
            let {
              label,
              regExp
            } = _ref;
            // See if there's one where exp matches this expression
            let msgObj;
            if (regExp) {
              msgObj = regExpMessages.find(o => o.exp && o.exp.toString() === regExp);
            }
            const regExpMessage = msgObj ? msgObj.msg : 'failed regular expression validation';
            return "".concat(label, " ").concat(regExpMessage);
          },
          keyNotInSchema: '{{name}} is not allowed by the schema'
        }
      }
    };
    module.exportDefault(defaultMessages);
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

},"doValidation.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/doValidation.js                                                                   //
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
    const _excluded = ["type"];
    let MongoObject;
    module.link("mongo-object", {
      default(v) {
        MongoObject = v;
      }
    }, 0);
    let SimpleSchema;
    module.link("./SimpleSchema", {
      SimpleSchema(v) {
        SimpleSchema = v;
      }
    }, 1);
    let appendAffectedKey, getParentOfKey, looksLikeModifier, isObjectWeShouldTraverse;
    module.link("./utility", {
      appendAffectedKey(v) {
        appendAffectedKey = v;
      },
      getParentOfKey(v) {
        getParentOfKey = v;
      },
      looksLikeModifier(v) {
        looksLikeModifier = v;
      },
      isObjectWeShouldTraverse(v) {
        isObjectWeShouldTraverse = v;
      }
    }, 2);
    let typeValidator;
    module.link("./validation/typeValidator", {
      default(v) {
        typeValidator = v;
      }
    }, 3);
    let requiredValidator;
    module.link("./validation/requiredValidator", {
      default(v) {
        requiredValidator = v;
      }
    }, 4);
    let allowedValuesValidator;
    module.link("./validation/allowedValuesValidator", {
      default(v) {
        allowedValuesValidator = v;
      }
    }, 5);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function shouldCheck(key) {
      if (key === '$pushAll') throw new Error('$pushAll is not supported; use $push + $each');
      return ['$pull', '$pullAll', '$pop', '$slice'].indexOf(key) === -1;
    }
    function doValidation(_ref) {
      let {
        extendedCustomContext,
        ignoreTypes,
        isModifier,
        isUpsert,
        keysToValidate,
        mongoObject,
        obj,
        schema,
        validationContext
      } = _ref;
      // First do some basic checks of the object, and throw errors if necessary
      if (!obj || typeof obj !== 'object' && typeof obj !== 'function') {
        throw new Error('The first argument of validate() must be an object');
      }
      if (!isModifier && looksLikeModifier(obj)) {
        throw new Error('When the validation object contains mongo operators, you must set the modifier option to true');
      }
      function getFieldInfo(key) {
        // Create mongoObject if necessary, cache for speed
        if (!mongoObject) mongoObject = new MongoObject(obj, schema.blackboxKeys());
        const keyInfo = mongoObject.getInfoForKey(key) || {};
        return {
          isSet: keyInfo.value !== undefined,
          value: keyInfo.value,
          operator: keyInfo.operator || null
        };
      }
      let validationErrors = [];

      // Validation function called for each affected key
      function validate(val, affectedKey, affectedKeyGeneric, def, op, isInArrayItemObject, isInSubObject) {
        // Get the schema for this key, marking invalid if there isn't one.
        if (!def) {
          // We don't need KEY_NOT_IN_SCHEMA error for $unset and we also don't need to continue
          if (op === '$unset' || op === '$currentDate' && affectedKey.endsWith('.$type')) return;
          validationErrors.push({
            name: affectedKey,
            type: SimpleSchema.ErrorTypes.KEY_NOT_IN_SCHEMA,
            value: val
          });
          return;
        }

        // For $rename, make sure that the new name is allowed by the schema
        if (op === '$rename' && !schema.allowsKey(val)) {
          validationErrors.push({
            name: val,
            type: SimpleSchema.ErrorTypes.KEY_NOT_IN_SCHEMA,
            value: null
          });
          return;
        }

        // Prepare the context object for the validator functions
        const fieldParentNameWithEndDot = getParentOfKey(affectedKey, true);
        const fieldParentName = fieldParentNameWithEndDot.slice(0, -1);
        const fieldValidationErrors = [];
        const validatorContext = _objectSpread({
          addValidationErrors(errors) {
            errors.forEach(error => fieldValidationErrors.push(error));
          },
          field(fName) {
            return getFieldInfo(fName);
          },
          genericKey: affectedKeyGeneric,
          isInArrayItemObject,
          isInSubObject,
          isModifier,
          isSet: val !== undefined,
          key: affectedKey,
          obj,
          operator: op,
          parentField() {
            return getFieldInfo(fieldParentName);
          },
          siblingField(fName) {
            return getFieldInfo(fieldParentNameWithEndDot + fName);
          },
          validationContext,
          value: val,
          // Value checks are not necessary for null or undefined values, except
          // for non-optional null array items, or for $unset or $rename values
          valueShouldBeChecked: op !== '$unset' && op !== '$rename' && (val !== undefined && val !== null || affectedKeyGeneric.slice(-2) === '.$' && val === null && !def.optional)
        }, extendedCustomContext || {});
        const builtInValidators = [requiredValidator, typeValidator, allowedValuesValidator];
        const validators = builtInValidators.concat(schema._validators).concat(SimpleSchema._validators);

        // Loop through each of the definitions in the SimpleSchemaGroup.
        // If any return true, we're valid.
        const fieldIsValid = def.type.some(typeDef => {
          // If the type is SimpleSchema.Any, then it is valid:
          if (typeDef === SimpleSchema.Any) return true;
          const {
              type
            } = def,
            definitionWithoutType = _objectWithoutProperties(def, _excluded); // eslint-disable-line no-unused-vars

          const finalValidatorContext = _objectSpread(_objectSpread({}, validatorContext), {}, {
            // Take outer definition props like "optional" and "label"
            // and add them to inner props like "type" and "min"
            definition: _objectSpread(_objectSpread({}, definitionWithoutType), typeDef)
          });

          // Add custom field validators to the list after the built-in
          // validators but before the schema and global validators.
          const fieldValidators = validators.slice(0);
          if (typeof typeDef.custom === 'function') {
            fieldValidators.splice(builtInValidators.length, 0, typeDef.custom);
          }

          // We use _.every just so that we don't continue running more validator
          // functions after the first one returns false or an error string.
          return fieldValidators.every(validator => {
            const result = validator.call(finalValidatorContext);

            // If the validator returns a string, assume it is the
            // error type.
            if (typeof result === 'string') {
              fieldValidationErrors.push({
                name: affectedKey,
                type: result,
                value: val
              });
              return false;
            }

            // If the validator returns an object, assume it is an
            // error object.
            if (typeof result === 'object' && result !== null) {
              fieldValidationErrors.push(_objectSpread({
                name: affectedKey,
                value: val
              }, result));
              return false;
            }

            // If the validator returns false, assume they already
            // called this.addValidationErrors within the function
            if (result === false) return false;

            // Any other return value we assume means it was valid
            return true;
          });
        });
        if (!fieldIsValid) {
          validationErrors = validationErrors.concat(fieldValidationErrors);
        }
      }

      // The recursive function
      function checkObj(_ref2) {
        let {
          val,
          affectedKey,
          operator,
          isInArrayItemObject = false,
          isInSubObject = false
        } = _ref2;
        let affectedKeyGeneric;
        let def;
        if (affectedKey) {
          // When we hit a blackbox key, we don't progress any further
          if (schema.keyIsInBlackBox(affectedKey)) return;

          // Make a generic version of the affected key, and use that
          // to get the schema for this key.
          affectedKeyGeneric = MongoObject.makeKeyGeneric(affectedKey);
          const shouldValidateKey = !keysToValidate || keysToValidate.some(keyToValidate => keyToValidate === affectedKey || keyToValidate === affectedKeyGeneric || affectedKey.startsWith("".concat(keyToValidate, ".")) || affectedKeyGeneric.startsWith("".concat(keyToValidate, ".")));

          // Prepare the context object for the rule functions
          const fieldParentNameWithEndDot = getParentOfKey(affectedKey, true);
          const fieldParentName = fieldParentNameWithEndDot.slice(0, -1);
          const functionsContext = _objectSpread({
            field(fName) {
              return getFieldInfo(fName);
            },
            genericKey: affectedKeyGeneric,
            isInArrayItemObject,
            isInSubObject,
            isModifier,
            isSet: val !== undefined,
            key: affectedKey,
            obj,
            operator,
            parentField() {
              return getFieldInfo(fieldParentName);
            },
            siblingField(fName) {
              return getFieldInfo(fieldParentNameWithEndDot + fName);
            },
            validationContext,
            value: val
          }, extendedCustomContext || {});

          // Perform validation for this key
          def = schema.getDefinition(affectedKey, null, functionsContext);
          if (shouldValidateKey) {
            validate(val, affectedKey, affectedKeyGeneric, def, operator, isInArrayItemObject, isInSubObject);
          }
        }

        // If affectedKeyGeneric is undefined due to this being the first run of this
        // function, objectKeys will return the top-level keys.
        const childKeys = schema.objectKeys(affectedKeyGeneric);

        // Temporarily convert missing objects to empty objects
        // so that the looping code will be called and required
        // descendent keys can be validated.
        if ((val === undefined || val === null) && (!def || !def.optional && childKeys && childKeys.length > 0)) {
          val = {};
        }

        // Loop through arrays
        if (Array.isArray(val)) {
          val.forEach((v, i) => {
            checkObj({
              val: v,
              affectedKey: "".concat(affectedKey, ".").concat(i),
              operator
            });
          });
        } else if (isObjectWeShouldTraverse(val) && (!def || !schema._blackboxKeys.has(affectedKey))) {
          // Loop through object keys

          // Get list of present keys
          const presentKeys = Object.keys(val);

          // If this object is within an array, make sure we check for
          // required as if it's not a modifier
          isInArrayItemObject = affectedKeyGeneric && affectedKeyGeneric.slice(-2) === '.$';
          const checkedKeys = [];

          // Check all present keys plus all keys defined by the schema.
          // This allows us to detect extra keys not allowed by the schema plus
          // any missing required keys, and to run any custom functions for other keys.
          /* eslint-disable no-restricted-syntax */
          for (const key of [...presentKeys, ...childKeys]) {
            // `childKeys` and `presentKeys` may contain the same keys, so make
            // sure we run only once per unique key
            if (checkedKeys.indexOf(key) !== -1) continue;
            checkedKeys.push(key);
            checkObj({
              val: val[key],
              affectedKey: appendAffectedKey(affectedKey, key),
              operator,
              isInArrayItemObject,
              isInSubObject: true
            });
          }
          /* eslint-enable no-restricted-syntax */
        }
      }
      function checkModifier(mod) {
        // Loop through operators
        Object.keys(mod).forEach(op => {
          const opObj = mod[op];
          // If non-operators are mixed in, throw error
          if (op.slice(0, 1) !== '$') {
            throw new Error("Expected '".concat(op, "' to be a modifier operator like '$set'"));
          }
          if (shouldCheck(op)) {
            // For an upsert, missing props would not be set if an insert is performed,
            // so we check them all with undefined value to force any 'required' checks to fail
            if (isUpsert && (op === '$set' || op === '$setOnInsert')) {
              const presentKeys = Object.keys(opObj);
              schema.objectKeys().forEach(schemaKey => {
                if (!presentKeys.includes(schemaKey)) {
                  checkObj({
                    val: undefined,
                    affectedKey: schemaKey,
                    operator: op
                  });
                }
              });
            }
            // Don't use forEach here because it will not properly handle an
            // object that has a property named `length`
            Object.keys(opObj).forEach(k => {
              let v = opObj[k];
              if (op === '$push' || op === '$addToSet') {
                if (typeof v === 'object' && '$each' in v) {
                  v = v.$each;
                } else {
                  k = "".concat(k, ".0");
                }
              }
              checkObj({
                val: v,
                affectedKey: k,
                operator: op
              });
            });
          }
        });
      }

      // Kick off the validation
      if (isModifier) {
        checkModifier(obj);
      } else {
        checkObj({
          val: obj
        });
      }

      // Custom whole-doc validators
      const docValidators = schema._docValidators.concat(SimpleSchema._docValidators);
      const docValidatorContext = _objectSpread({
        ignoreTypes,
        isModifier,
        isUpsert,
        keysToValidate,
        mongoObject,
        obj,
        schema,
        validationContext
      }, extendedCustomContext || {});
      docValidators.forEach(func => {
        const errors = func.call(docValidatorContext, obj);
        if (!Array.isArray(errors)) throw new Error('Custom doc validator must return an array of error objects');
        if (errors.length) validationErrors = validationErrors.concat(errors);
      });
      const addedFieldNames = [];
      validationErrors = validationErrors.filter(errObj => {
        // Remove error types the user doesn't care about
        if (ignoreTypes.includes(errObj.type)) return false;
        // Make sure there is only one error per fieldName
        if (addedFieldNames.includes(errObj.name)) return false;
        addedFieldNames.push(errObj.name);
        return true;
      });
      return validationErrors;
    }
    module.exportDefault(doValidation);
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

},"expandShorthand.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/expandShorthand.js                                                                //
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
    let MongoObject;
    module.link("mongo-object", {
      default(v) {
        MongoObject = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    /**
     * Clones a schema object, expanding shorthand as it does it.
     */
    function expandShorthand(schema) {
      const schemaClone = {};
      Object.keys(schema).forEach(key => {
        const definition = schema[key];
        // CASE 1: Not shorthand. Just clone
        if (MongoObject.isBasicObject(definition)) {
          schemaClone[key] = _objectSpread({}, definition);
          return;
        }

        // CASE 2: The definition is an array of some type
        if (Array.isArray(definition)) {
          if (Array.isArray(definition[0])) {
            throw new Error("Array shorthand may only be used to one level of depth (".concat(key, ")"));
          }
          const type = definition[0];
          schemaClone[key] = {
            type: Array
          };

          // Also add the item key definition
          const itemKey = "".concat(key, ".$");
          if (schema[itemKey]) {
            throw new Error("Array shorthand used for ".concat(key, " field but ").concat(key, ".$ key is already in the schema"));
          }
          if (type instanceof RegExp) {
            schemaClone[itemKey] = {
              type: String,
              regEx: type
            };
          } else {
            schemaClone[itemKey] = {
              type
            };
          }
          return;
        }

        // CASE 3: The definition is a regular expression
        if (definition instanceof RegExp) {
          schemaClone[key] = {
            type: String,
            regEx: definition
          };
          return;
        }

        // CASE 4: The definition is something, a type
        schemaClone[key] = {
          type: definition
        };
      });
      return schemaClone;
    }
    module.exportDefault(expandShorthand);
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

},"humanize.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/humanize.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/*
  Code source:
    https://github.com/jxson/string-humanize
    https://github.com/jxson/string-capitalize
 */

function capitalize(text) {
  text = text || '';
  text = text.trim();
  if (text[0]) {
    text = text[0].toUpperCase() + text.substr(1).toLowerCase();
  }

  // Do "ID" instead of "id" or "Id"
  text = text.replace(/\bid\b/g, 'ID');
  text = text.replace(/\bId\b/g, 'ID');
  return text;
}
function underscore(text) {
  text = text || '';
  text = text.toString(); // might be a number
  text = text.trim();
  text = text.replace(/([a-z\d])([A-Z]+)/g, '$1_$2');
  text = text.replace(/[-\s]+/g, '_').toLowerCase();
  return text;
}
function extname(text) {
  const index = text.lastIndexOf('.');
  const ext = text.substring(index, text.length);
  return index === -1 ? '' : ext;
}
function humanize(text) {
  text = text || '';
  text = text.toString(); // might be a number
  text = text.trim();
  text = text.replace(extname(text), '');
  text = underscore(text);
  text = text.replace(/[\W_]+/g, ' ');
  return capitalize(text);
}
module.exportDefault(humanize);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"regExp.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/regExp.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// this domain regex matches all domains that have at least one .
// sadly IPv4 Adresses will be caught too but technically those are valid domains
// this expression is extracted from the original RFC 5322 mail expression
// a modification enforces that the tld consists only of characters
const rxDomain = '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z](?:[a-z-]*[a-z])?';
// this domain regex matches everythign that could be a domain in intranet
// that means "localhost" is a valid domain
const rxNameDomain = '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.|$))+';
// strict IPv4 expression which allows 0-255 per oktett
const rxIPv4 = '(?:(?:[0-1]?\\d{1,2}|2[0-4]\\d|25[0-5])(?:\\.|$)){4}';
// strict IPv6 expression which allows (and validates) all shortcuts
const rxIPv6 = '(?:(?:[\\dA-Fa-f]{1,4}(?::|$)){8}' // full adress
+ '|(?=(?:[^:\\s]|:[^:\\s])*::(?:[^:\\s]|:[^:\\s])*$)' // or min/max one '::'
+ '[\\dA-Fa-f]{0,4}(?:::?(?:[\\dA-Fa-f]{1,4}|$)){1,6})'; // and short adress
// this allows domains (also localhost etc) and ip adresses
const rxWeakDomain = "(?:".concat([rxNameDomain, rxIPv4, rxIPv6].join('|'), ")");
// unique id from the random package also used by minimongo
// min and max are used to set length boundaries
// set both for explicit lower and upper bounds
// set min as integer and max to null for explicit lower bound and arbitrary upper bound
// set none for arbitrary length
// set only min for fixed length
// character list: https://github.com/meteor/meteor/blob/release/0.8.0/packages/random/random.js#L88
// string length: https://github.com/meteor/meteor/blob/release/0.8.0/packages/random/random.js#L143
const isValidBound = (value, lower) => !value || Number.isSafeInteger(value) && value > lower;
const idOfLength = (min, max) => {
  if (!isValidBound(min, 0)) throw new Error("Expected a non-negative safe integer, got ".concat(min));
  if (!isValidBound(max, min)) throw new Error("Expected a non-negative safe integer greater than 1 and greater than min, got ".concat(max));
  let bounds;
  if (min && max) bounds = "".concat(min, ",").concat(max);else if (min && max === null) bounds = "".concat(min, ",");else if (min && !max) bounds = "".concat(min);else if (!min && !max) bounds = '0,';else throw new Error("Unexpected state for min (".concat(min, ") and max (").concat(max, ")"));
  return new RegExp("^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{".concat(bounds, "}$"));
};
const regEx = {
  // We use the RegExp suggested by W3C in http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
  // This is probably the same logic used by most browsers when type=email, which is our goal. It is
  // a very permissive expression. Some apps may wish to be more strict and can write their own RegExp.
  Email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  // Like Email but requires the TLD (.com, etc)
  EmailWithTLD: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  Domain: new RegExp("^".concat(rxDomain, "$")),
  WeakDomain: new RegExp("^".concat(rxWeakDomain, "$")),
  IP: new RegExp("^(?:".concat(rxIPv4, "|").concat(rxIPv6, ")$")),
  IPv4: new RegExp("^".concat(rxIPv4, "$")),
  IPv6: new RegExp("^".concat(rxIPv6, "$")),
  // URL RegEx from https://gist.github.com/dperini/729294
  // DEPRECATED! Known 2nd degree polynomial ReDoS vulnerability.
  // Use a custom validator such as this to validate URLs:
  //   custom() {
  //     if (!this.isSet) return;
  //     try {
  //       new URL(this.value);
  //     } catch (err) {
  //       return 'badUrl';
  //     }
  //   }
  // eslint-disable-next-line redos/no-vulnerable
  Url: /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i,
  // default id is defined with exact 17 chars of length
  Id: idOfLength(17),
  idOfLength,
  // allows for a 5 digit zip code followed by a whitespace or dash and then 4 more digits
  // matches 11111 and 11111-1111 and 11111 1111
  ZipCode: /^\d{5}(?:[-\s]\d{4})?$/,
  // taken from Google's libphonenumber library
  // https://github.com/googlei18n/libphonenumber/blob/master/javascript/i18n/phonenumbers/phonenumberutil.js
  // reference the VALID_PHONE_NUMBER_PATTERN key
  // allows for common phone number symbols including + () and -
  // DEPRECATED! Known 2nd degree polynomial ReDoS vulnerability.
  // Instead, use a custom validation function, with a high quality
  // phone number validation package that meets your needs.
  // eslint-disable-next-line redos/no-vulnerable
  Phone: /^[0-9０-９٠-٩۰-۹]{2}$|^[+＋]*(?:[-x‐-―−ー－-／  ­​⁠　()（）［］.\[\]/~⁓∼～*]*[0-9０-９٠-٩۰-۹]){3,}[-x‐-―−ー－-／  ­​⁠　()（）［］.\[\]/~⁓∼～*A-Za-z0-9０-９٠-٩۰-۹]*(?:;ext=([0-9０-９٠-٩۰-۹]{1,20})|[  \t,]*(?:e?xt(?:ensi(?:ó?|ó))?n?|ｅ?ｘｔｎ?|доб|anexo)[:\.．]?[  \t,-]*([0-9０-９٠-٩۰-۹]{1,20})#?|[  \t,]*(?:[xｘ#＃~～]|int|ｉｎｔ)[:\.．]?[  \t,-]*([0-9０-９٠-٩۰-۹]{1,9})#?|[- ]+([0-9０-９٠-٩۰-۹]{1,6})#|[  \t]*(?:,{2}|;)[:\.．]?[  \t,-]*([0-9０-９٠-٩۰-۹]{1,15})#?|[  \t]*(?:,)+[:\.．]?[  \t,-]*([0-9０-９٠-٩۰-۹]{1,9})#?)?$/i // eslint-disable-line no-irregular-whitespace
};
module.exportDefault(regEx);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clean":{"AutoValueRunner.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/clean/AutoValueRunner.js                                                          //
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
      default: () => AutoValueRunner
    });
    let clone;
    module.link("clone", {
      default(v) {
        clone = v;
      }
    }, 0);
    let getParentOfKey;
    module.link("../utility", {
      getParentOfKey(v) {
        getParentOfKey = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function getFieldInfo(mongoObject, key) {
      const keyInfo = mongoObject.getInfoForKey(key) || {};
      return {
        isSet: keyInfo.value !== undefined,
        value: keyInfo.value,
        operator: keyInfo.operator || null
      };
    }
    class AutoValueRunner {
      constructor(options) {
        this.options = options;
        this.doneKeys = [];
      }
      runForPosition(_ref) {
        let {
          key: affectedKey,
          operator,
          position,
          value
        } = _ref;
        const {
          closestSubschemaFieldName,
          extendedAutoValueContext,
          func,
          isModifier,
          isUpsert,
          mongoObject
        } = this.options;

        // If already called for this key, skip it
        if (this.doneKeys.includes(affectedKey)) return;
        const fieldParentName = getParentOfKey(affectedKey, true);
        const parentFieldInfo = getFieldInfo(mongoObject, fieldParentName.slice(0, -1));
        let doUnset = false;
        if (Array.isArray(parentFieldInfo.value)) {
          if (isNaN(affectedKey.split('.').slice(-1).pop())) {
            // parent is an array, but the key to be set is not an integer (see issue #80)
            return;
          }
        }
        const autoValue = func.call(_objectSpread({
          closestSubschemaFieldName: closestSubschemaFieldName.length ? closestSubschemaFieldName : null,
          field(fName) {
            return getFieldInfo(mongoObject, closestSubschemaFieldName + fName);
          },
          isModifier,
          isUpsert,
          isSet: value !== undefined,
          key: affectedKey,
          operator,
          parentField() {
            return parentFieldInfo;
          },
          siblingField(fName) {
            return getFieldInfo(mongoObject, fieldParentName + fName);
          },
          unset() {
            doUnset = true;
          },
          value
        }, extendedAutoValueContext || {}), mongoObject.getObject());

        // Update tracking of which keys we've run autovalue for
        this.doneKeys.push(affectedKey);
        if (doUnset && position) mongoObject.removeValueForPosition(position);
        if (autoValue === undefined) return;

        // If the user's auto value is of the pseudo-modifier format, parse it
        // into operator and value.
        if (isModifier) {
          let op;
          let newValue;
          if (autoValue && typeof autoValue === 'object') {
            const avOperator = Object.keys(autoValue).find(avProp => avProp.substring(0, 1) === '$');
            if (avOperator) {
              op = avOperator;
              newValue = autoValue[avOperator];
            }
          }

          // Add $set for updates and upserts if necessary. Keep this
          // above the "if (op)" block below since we might change op
          // in this line.
          if (!op && position.slice(0, 1) !== '$') {
            op = '$set';
            newValue = autoValue;
          }
          if (op) {
            // Update/change value
            mongoObject.removeValueForPosition(position);
            mongoObject.setValueForPosition("".concat(op, "[").concat(affectedKey, "]"), clone(newValue));
            return;
          }
        }

        // Update/change value. Cloning is necessary in case it's an object, because
        // if we later set some keys within it, they'd be set on the original object, too.
        mongoObject.setValueForPosition(position, clone(autoValue));
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

},"convertToProperType.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/clean/convertToProperType.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let SimpleSchema;
    module.link("../SimpleSchema", {
      SimpleSchema(v) {
        SimpleSchema = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    /**
     * Converts value to proper type
     *
     * @param {Any} value Value to try to convert
     * @param {Any} type  A type
     * @returns {Any} Value converted to type.
     */
    function convertToProperType(value, type) {
      // Can't and shouldn't convert arrays or objects or null
      if (Array.isArray(value) || value && (typeof value === 'function' || typeof value === 'object') && !(value instanceof Date) || value === null) return value;

      // Convert to String type
      if (type === String) {
        if (value === null || value === undefined) return value;
        return value.toString();
      }

      // Convert to Number type
      if (type === Number || type === SimpleSchema.Integer) {
        if (typeof value === 'string' && value.length > 0) {
          // Try to convert numeric strings to numbers
          const numberVal = Number(value);
          if (!isNaN(numberVal)) return numberVal;
        }
        // Leave it; will fail validation
        return value;
      }

      // If target type is a Date we can safely convert from either a
      // number (Integer value representing the number of milliseconds
      // since 1 January 1970 00:00:00 UTC) or a string that can be parsed
      // by Date.
      if (type === Date) {
        if (typeof value === 'string') {
          const parsedDate = Date.parse(value);
          if (isNaN(parsedDate) === false) return new Date(parsedDate);
        }
        if (typeof value === 'number') return new Date(value);
      }

      // Convert to Boolean type
      if (type === Boolean) {
        if (typeof value === 'string') {
          // Convert exact string 'true' and 'false' to true and false respectively
          if (value.toLowerCase() === 'true') return true;
          if (value.toLowerCase() === 'false') return false;
        } else if (typeof value === 'number' && !isNaN(value)) {
          // NaN can be error, so skipping it
          return Boolean(value);
        }
      }

      // If an array is what you want, I'll give you an array
      if (type === Array) return [value];

      // Could not convert
      return value;
    }
    module.exportDefault(convertToProperType);
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

},"getPositionsForAutoValue.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/clean/getPositionsForAutoValue.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      default: () => getPositionsForAutoValue
    });
    let MongoObject;
    module.link("mongo-object", {
      default(v) {
        MongoObject = v;
      }
    }, 0);
    let getLastPartOfKey, getParentOfKey;
    module.link("../utility", {
      getLastPartOfKey(v) {
        getLastPartOfKey = v;
      },
      getParentOfKey(v) {
        getParentOfKey = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function getPositionsForAutoValue(_ref) {
      let {
        fieldName,
        isModifier,
        mongoObject
      } = _ref;
      // Positions for this field
      const positions = mongoObject.getPositionsInfoForGenericKey(fieldName);

      // If the field is an object and will be created by MongoDB,
      // we don't need (and can't have) a value for it
      if (isModifier && mongoObject.getPositionsThatCreateGenericKey(fieldName).length > 0) {
        return positions;
      }

      // For simple top-level fields, just add an undefined would-be position
      // if there isn't a real position.
      if (fieldName.indexOf('.') === -1 && positions.length === 0) {
        positions.push({
          key: fieldName,
          value: undefined,
          operator: isModifier ? '$set' : null,
          position: isModifier ? "$set[".concat(fieldName, "]") : fieldName
        });
        return positions;
      }
      const parentPath = getParentOfKey(fieldName);
      const lastPart = getLastPartOfKey(fieldName, parentPath);
      const lastPartWithBraces = lastPart.replace(/\./g, '][');
      const parentPositions = mongoObject.getPositionsInfoForGenericKey(parentPath);
      if (parentPositions.length) {
        parentPositions.forEach(info => {
          const childPosition = "".concat(info.position, "[").concat(lastPartWithBraces, "]");
          if (!positions.find(i => i.position === childPosition)) {
            positions.push({
              key: "".concat(info.key, ".").concat(lastPart),
              value: undefined,
              operator: info.operator,
              position: childPosition
            });
          }
        });
      } else if (parentPath.slice(-2) !== '.$') {
        // positions that will create parentPath
        mongoObject.getPositionsThatCreateGenericKey(parentPath).forEach(info => {
          const {
            operator,
            position
          } = info;
          let wouldBePosition;
          if (operator) {
            const next = position.slice(position.indexOf('[') + 1, position.indexOf(']'));
            const nextPieces = next.split('.');
            const newPieces = [];
            let newKey;
            while (nextPieces.length && newKey !== parentPath) {
              newPieces.push(nextPieces.shift());
              newKey = newPieces.join('.');
            }
            newKey = "".concat(newKey, ".").concat(fieldName.slice(newKey.length + 1));
            wouldBePosition = "$set[".concat(newKey, "]");
          } else {
            const lastPart2 = getLastPartOfKey(fieldName, parentPath);
            const lastPartWithBraces2 = lastPart2.replace(/\./g, '][');
            wouldBePosition = "".concat(position.slice(0, position.lastIndexOf('[')), "[").concat(lastPartWithBraces2, "]");
          }
          if (!positions.find(i => i.position === wouldBePosition)) {
            positions.push({
              key: MongoObject._positionToKey(wouldBePosition),
              value: undefined,
              operator: operator ? '$set' : null,
              position: wouldBePosition
            });
          }
        });
      }
      return positions;
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

},"setAutoValues.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/clean/setAutoValues.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      sortAutoValueFunctions: () => sortAutoValueFunctions
    });
    let getPositionsForAutoValue;
    module.link("./getPositionsForAutoValue", {
      default(v) {
        getPositionsForAutoValue = v;
      }
    }, 0);
    let AutoValueRunner;
    module.link("./AutoValueRunner", {
      default(v) {
        AutoValueRunner = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function sortAutoValueFunctions(autoValueFunctions) {
      const defaultFieldOrder = autoValueFunctions.reduce((acc, _ref, index) => {
        let {
          fieldName
        } = _ref;
        acc[fieldName] = index;
        return acc;
      }, {});

      // Sort by how many dots each field name has, asc, such that we can auto-create
      // objects and arrays before we run the autoValues for properties within them.
      // Fields of the same level (same number of dots) preserve should order from the original array.
      return autoValueFunctions.sort((a, b) => {
        const depthDiff = a.fieldName.split('.').length - b.fieldName.split('.').length;
        return depthDiff === 0 ? defaultFieldOrder[a.fieldName] - defaultFieldOrder[b.fieldName] : depthDiff;
      });
    }
    /**
     * @method setAutoValues
     * @private
     * @param {Array} autoValueFunctions - An array of objects with func, fieldName, and closestSubschemaFieldName props
     * @param {MongoObject} mongoObject
     * @param {Boolean} [isModifier=false] - Is it a modifier doc?
     * @param {Object} [extendedAutoValueContext] - Object that will be added to the context when calling each autoValue function
     * @returns {undefined}
     *
     * Updates doc with automatic values from autoValue functions or default
     * values from defaultValue. Modifies the referenced object in place.
     */
    function setAutoValues(autoValueFunctions, mongoObject, isModifier, isUpsert, extendedAutoValueContext) {
      const sortedAutoValueFunctions = sortAutoValueFunctions(autoValueFunctions);
      sortedAutoValueFunctions.forEach(_ref2 => {
        let {
          func,
          fieldName,
          closestSubschemaFieldName
        } = _ref2;
        const avRunner = new AutoValueRunner({
          closestSubschemaFieldName,
          extendedAutoValueContext,
          func,
          isModifier,
          isUpsert,
          mongoObject
        });
        const positions = getPositionsForAutoValue({
          fieldName,
          isModifier,
          mongoObject
        });

        // Run the autoValue function once for each place in the object that
        // has a value or that potentially should.
        positions.forEach(avRunner.runForPosition.bind(avRunner));
      });
    }
    module.exportDefault(setAutoValues);
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

}},"utility":{"appendAffectedKey.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/utility/appendAffectedKey.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => appendAffectedKey
});
function appendAffectedKey(affectedKey, key) {
  if (key === '$each') return affectedKey;
  return affectedKey ? "".concat(affectedKey, ".").concat(key) : key;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dateToDateString.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/utility/dateToDateString.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => dateToDateString
});
function dateToDateString(date) {
  let m = date.getUTCMonth() + 1;
  if (m < 10) m = "0".concat(m);
  let d = date.getUTCDate();
  if (d < 10) d = "0".concat(d);
  return "".concat(date.getUTCFullYear(), "-").concat(m, "-").concat(d);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"forEachKeyAncestor.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/utility/forEachKeyAncestor.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => forEachKeyAncestor
});
function forEachKeyAncestor(key, loopFunc) {
  let lastDot;

  // Iterate the dot-syntax hierarchy
  let ancestor = key;
  do {
    lastDot = ancestor.lastIndexOf('.');
    if (lastDot !== -1) {
      ancestor = ancestor.slice(0, lastDot);
      const remainder = key.slice(ancestor.length + 1);
      loopFunc(ancestor, remainder); // Remove last path component
    }
  } while (lastDot !== -1);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"getKeysWithValueInObj.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/utility/getKeysWithValueInObj.js                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => getKeysWithValueInObj
});
function getKeysWithValueInObj(obj, matchKey) {
  const keysWithValue = [];
  const keyAdjust = k => k.slice(0, matchKey.length + 1);
  const matchKeyPlusDot = "".concat(matchKey, ".");
  Object.keys(obj || {}).forEach(key => {
    const val = obj[key];
    if (val === undefined || val === null) return;
    if (keyAdjust(key) === matchKeyPlusDot) {
      keysWithValue.push(key);
    }
  });
  return keysWithValue;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"getLastPartOfKey.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/utility/getLastPartOfKey.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => getLastPartOfKey
});
function getLastPartOfKey(key, ancestorKey) {
  let lastPart = '';
  const startString = "".concat(ancestorKey, ".");
  if (key.indexOf(startString) === 0) {
    lastPart = key.replace(startString, '');
    if (lastPart.startsWith('$.')) lastPart = lastPart.slice(2);
  }
  return lastPart;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"getParentOfKey.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/utility/getParentOfKey.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => getParentOfKey
});
function getParentOfKey(key, withEndDot) {
  const lastDot = key.lastIndexOf('.');
  return lastDot === -1 ? '' : key.slice(0, lastDot + Number(!!withEndDot));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/utility/index.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.link("./appendAffectedKey", {
      default: "appendAffectedKey"
    }, 0);
    module.link("./dateToDateString", {
      default: "dateToDateString"
    }, 1);
    module.link("./forEachKeyAncestor", {
      default: "forEachKeyAncestor"
    }, 2);
    module.link("./getKeysWithValueInObj", {
      default: "getKeysWithValueInObj"
    }, 3);
    module.link("./getLastPartOfKey", {
      default: "getLastPartOfKey"
    }, 4);
    module.link("./getParentOfKey", {
      default: "getParentOfKey"
    }, 5);
    module.link("./isEmptyObject", {
      default: "isEmptyObject"
    }, 6);
    module.link("./isObjectWeShouldTraverse", {
      default: "isObjectWeShouldTraverse"
    }, 7);
    module.link("./looksLikeModifier", {
      default: "looksLikeModifier"
    }, 8);
    module.link("./merge", {
      default: "merge"
    }, 9);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
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

},"isEmptyObject.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/utility/isEmptyObject.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => isEmptyObject
});
function isEmptyObject(obj) {
  /* eslint-disable no-restricted-syntax */
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  /* eslint-enable no-restricted-syntax */

  return true;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"isObjectWeShouldTraverse.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/utility/isObjectWeShouldTraverse.js                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => isObjectWeShouldTraverse
});
function isObjectWeShouldTraverse(val) {
  // Some of these types don't exist in old browsers so we'll catch and return false in those cases
  try {
    if (val !== Object(val)) return false;
    // There are some object types that we know we shouldn't traverse because
    // they will often result in overflows and it makes no sense to validate them.
    if (val instanceof Date) return false;
    if (val instanceof Int8Array) return false;
    if (val instanceof Uint8Array) return false;
    if (val instanceof Uint8ClampedArray) return false;
    if (val instanceof Int16Array) return false;
    if (val instanceof Uint16Array) return false;
    if (val instanceof Int32Array) return false;
    if (val instanceof Uint32Array) return false;
    if (val instanceof Float32Array) return false;
    if (val instanceof Float64Array) return false;
  } catch (e) {
    return false;
  }
  return true;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"looksLikeModifier.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/utility/looksLikeModifier.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => looksLikeModifier
});
function looksLikeModifier(obj) {
  return !!Object.keys(obj || {}).find(key => key.substring(0, 1) === '$');
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"merge.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/utility/merge.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => merge
});
function merge(destination) {
  for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }
  sources.forEach(source => {
    Object.keys(source).forEach(prop => {
      if (prop === '__proto__') return; // protect against prototype pollution
      if (source[prop] && source[prop].constructor && source[prop].constructor === Object) {
        if (!destination[prop] || !destination[prop].constructor || destination[prop].constructor !== Object) {
          destination[prop] = {};
        }
        merge(destination[prop], source[prop]);
      } else {
        destination[prop] = source[prop];
      }
    });
  });
  return destination;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"validation":{"allowedValuesValidator.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/validation/allowedValuesValidator.js                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      default: () => allowedValuesValidator
    });
    let SimpleSchema;
    module.link("../SimpleSchema", {
      SimpleSchema(v) {
        SimpleSchema = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function allowedValuesValidator() {
      if (!this.valueShouldBeChecked) return;
      const {
        allowedValues
      } = this.definition;
      if (!allowedValues) return;
      let isAllowed;
      // set defined in scope and allowedValues is its instance
      if (typeof Set === 'function' && allowedValues instanceof Set) {
        isAllowed = allowedValues.has(this.value);
      } else {
        isAllowed = allowedValues.includes(this.value);
      }
      return isAllowed ? true : SimpleSchema.ErrorTypes.VALUE_NOT_ALLOWED;
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

},"requiredValidator.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/validation/requiredValidator.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      default: () => requiredValidator
    });
    let SimpleSchema;
    module.link("../SimpleSchema", {
      SimpleSchema(v) {
        SimpleSchema = v;
      }
    }, 0);
    let getKeysWithValueInObj;
    module.link("../utility", {
      getKeysWithValueInObj(v) {
        getKeysWithValueInObj = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function requiredValidator() {
      const {
        definition,
        isInArrayItemObject,
        isInSubObject,
        key,
        obj,
        operator,
        value
      } = this;
      const {
        optional
      } = definition;
      if (optional) return;

      // If value is null, no matter what, we add required
      if (value === null) return SimpleSchema.ErrorTypes.REQUIRED;

      // If operator would remove, we add required
      if (operator === '$unset' || operator === '$rename') return SimpleSchema.ErrorTypes.REQUIRED;

      // The rest of these apply only if the value is undefined
      if (value !== undefined) return;

      // At this point, if it's a normal, non-modifier object, then a missing value is an error
      if (!operator) return SimpleSchema.ErrorTypes.REQUIRED;

      // Everything beyond this point deals with modifier objects only

      // We can skip the required check for keys that are ancestors of those in $set or
      // $setOnInsert because they will be created by MongoDB while setting.
      const keysWithValueInSet = getKeysWithValueInObj(obj.$set, key);
      if (keysWithValueInSet.length) return;
      const keysWithValueInSetOnInsert = getKeysWithValueInObj(obj.$setOnInsert, key);
      if (keysWithValueInSetOnInsert.length) return;

      // In the case of $set and $setOnInsert, the value may be undefined here
      // but it is set in another operator. So check that first.
      const fieldInfo = this.field(key);
      if (fieldInfo.isSet && fieldInfo.value !== null) return;

      // Required if in an array or sub object
      if (isInArrayItemObject || isInSubObject) return SimpleSchema.ErrorTypes.REQUIRED;

      // If we've got this far with an undefined $set or $setOnInsert value, it's a required error.
      if (operator === '$set' || operator === '$setOnInsert') return SimpleSchema.ErrorTypes.REQUIRED;
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

},"typeValidator":{"doArrayChecks.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/validation/typeValidator/doArrayChecks.js                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      default: () => doArrayChecks
    });
    let SimpleSchema;
    module.link("../../SimpleSchema", {
      SimpleSchema(v) {
        SimpleSchema = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function doArrayChecks(def, keyValue) {
      // Is it an array?
      if (!Array.isArray(keyValue)) {
        return {
          type: SimpleSchema.ErrorTypes.EXPECTED_TYPE,
          dataType: 'Array'
        };
      }

      // Are there fewer than the minimum number of items in the array?
      if (def.minCount !== null && keyValue.length < def.minCount) {
        return {
          type: SimpleSchema.ErrorTypes.MIN_COUNT,
          minCount: def.minCount
        };
      }

      // Are there more than the maximum number of items in the array?
      if (def.maxCount !== null && keyValue.length > def.maxCount) {
        return {
          type: SimpleSchema.ErrorTypes.MAX_COUNT,
          maxCount: def.maxCount
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

},"doDateChecks.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/validation/typeValidator/doDateChecks.js                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      default: () => doDateChecks
    });
    let SimpleSchema;
    module.link("../../SimpleSchema", {
      SimpleSchema(v) {
        SimpleSchema = v;
      }
    }, 0);
    let dateToDateString;
    module.link("../../utility", {
      dateToDateString(v) {
        dateToDateString = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function doDateChecks(def, keyValue) {
      // Is it an invalid date?
      if (isNaN(keyValue.getTime())) return {
        type: SimpleSchema.ErrorTypes.BAD_DATE
      };

      // Is it earlier than the minimum date?
      if (def.min && typeof def.min.getTime === 'function' && def.min.getTime() > keyValue.getTime()) {
        return {
          type: SimpleSchema.ErrorTypes.MIN_DATE,
          min: dateToDateString(def.min)
        };
      }

      // Is it later than the maximum date?
      if (def.max && typeof def.max.getTime === 'function' && def.max.getTime() < keyValue.getTime()) {
        return {
          type: SimpleSchema.ErrorTypes.MAX_DATE,
          max: dateToDateString(def.max)
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

},"doNumberChecks.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/validation/typeValidator/doNumberChecks.js                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      default: () => doNumberChecks
    });
    let SimpleSchema;
    module.link("../../SimpleSchema", {
      SimpleSchema(v) {
        SimpleSchema = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // Polyfill to support IE11
    Number.isInteger = Number.isInteger || function isInteger(value) {
      return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    };
    function doNumberChecks(def, keyValue, op, expectsInteger) {
      // Is it a valid number?
      if (typeof keyValue !== 'number' || isNaN(keyValue)) {
        return {
          type: SimpleSchema.ErrorTypes.EXPECTED_TYPE,
          dataType: expectsInteger ? 'Integer' : 'Number'
        };
      }

      // Assuming we are not incrementing, is the value less than the maximum value?
      if (op !== '$inc' && def.max !== null && (def.exclusiveMax ? def.max <= keyValue : def.max < keyValue)) {
        return {
          type: def.exclusiveMax ? SimpleSchema.ErrorTypes.MAX_NUMBER_EXCLUSIVE : SimpleSchema.ErrorTypes.MAX_NUMBER,
          max: def.max
        };
      }

      // Assuming we are not incrementing, is the value more than the minimum value?
      if (op !== '$inc' && def.min !== null && (def.exclusiveMin ? def.min >= keyValue : def.min > keyValue)) {
        return {
          type: def.exclusiveMin ? SimpleSchema.ErrorTypes.MIN_NUMBER_EXCLUSIVE : SimpleSchema.ErrorTypes.MIN_NUMBER,
          min: def.min
        };
      }

      // Is it an integer if we expect an integer?
      if (expectsInteger && !Number.isInteger(keyValue)) {
        return {
          type: SimpleSchema.ErrorTypes.MUST_BE_INTEGER
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

},"doStringChecks.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/validation/typeValidator/doStringChecks.js                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      default: () => doStringChecks
    });
    let SimpleSchema;
    module.link("../../SimpleSchema", {
      SimpleSchema(v) {
        SimpleSchema = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function doStringChecks(def, keyValue) {
      // Is it a String?
      if (typeof keyValue !== 'string') {
        return {
          type: SimpleSchema.ErrorTypes.EXPECTED_TYPE,
          dataType: 'String'
        };
      }

      // Is the string too long?
      if (def.max !== null && def.max < keyValue.length) {
        return {
          type: SimpleSchema.ErrorTypes.MAX_STRING,
          max: def.max
        };
      }

      // Is the string too short?
      if (def.min !== null && def.min > keyValue.length) {
        return {
          type: SimpleSchema.ErrorTypes.MIN_STRING,
          min: def.min
        };
      }

      // Does the string match the regular expression?
      if ((def.skipRegExCheckForEmptyStrings !== true || keyValue !== '') && def.regEx instanceof RegExp && !def.regEx.test(keyValue)) {
        return {
          type: SimpleSchema.ErrorTypes.FAILED_REGULAR_EXPRESSION,
          regExp: def.regEx.toString()
        };
      }

      // If regEx is an array of regular expressions, does the string match all of them?
      if (Array.isArray(def.regEx)) {
        let regExError;
        def.regEx.every(re => {
          if (!re.test(keyValue)) {
            regExError = {
              type: SimpleSchema.ErrorTypes.FAILED_REGULAR_EXPRESSION,
              regExp: re.toString()
            };
            return false;
          }
          return true;
        });
        if (regExError) return regExError;
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

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/lib/validation/typeValidator/index.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      default: () => typeValidator
    });
    let SimpleSchema;
    module.link("../../SimpleSchema", {
      SimpleSchema(v) {
        SimpleSchema = v;
      }
    }, 0);
    let doDateChecks;
    module.link("./doDateChecks", {
      default(v) {
        doDateChecks = v;
      }
    }, 1);
    let doNumberChecks;
    module.link("./doNumberChecks", {
      default(v) {
        doNumberChecks = v;
      }
    }, 2);
    let doStringChecks;
    module.link("./doStringChecks", {
      default(v) {
        doStringChecks = v;
      }
    }, 3);
    let doArrayChecks;
    module.link("./doArrayChecks", {
      default(v) {
        doArrayChecks = v;
      }
    }, 4);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    function typeValidator() {
      if (!this.valueShouldBeChecked) return;
      const def = this.definition;
      const expectedType = def.type;
      const keyValue = this.value;
      const op = this.operator;
      if (expectedType === String) return doStringChecks(def, keyValue);
      if (expectedType === Number) return doNumberChecks(def, keyValue, op, false);
      if (expectedType === SimpleSchema.Integer) return doNumberChecks(def, keyValue, op, true);
      if (expectedType === Boolean) {
        // Is it a boolean?
        if (typeof keyValue === 'boolean') return;
        return {
          type: SimpleSchema.ErrorTypes.EXPECTED_TYPE,
          dataType: 'Boolean'
        };
      }
      if (expectedType === Object || SimpleSchema.isSimpleSchema(expectedType)) {
        // Is it an object?
        if (keyValue === Object(keyValue) && typeof keyValue[Symbol.iterator] !== 'function' && !(keyValue instanceof Date)) return;
        return {
          type: SimpleSchema.ErrorTypes.EXPECTED_TYPE,
          dataType: 'Object'
        };
      }
      if (expectedType === Array) return doArrayChecks(def, keyValue);
      if (expectedType instanceof Function) {
        // Generic constructor checks
        if (!(keyValue instanceof expectedType)) {
          // https://docs.mongodb.com/manual/reference/operator/update/currentDate/
          const dateTypeIsOkay = expectedType === Date && op === '$currentDate' && (keyValue === true || JSON.stringify(keyValue) === '{"$type":"date"}');
          if (expectedType !== Date || !dateTypeIsOkay) {
            return {
              type: SimpleSchema.ErrorTypes.EXPECTED_TYPE,
              dataType: expectedType.name
            };
          }
        }

        // Date checks
        if (expectedType === Date) {
          // https://docs.mongodb.com/manual/reference/operator/update/currentDate/
          if (op === '$currentDate') {
            return doDateChecks(def, new Date());
          }
          return doDateChecks(def, keyValue);
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

}}}},"node_modules":{"clone":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/aldeed_simple-schema/node_modules/clone/package.json                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "clone",
  "version": "2.1.2",
  "main": "clone.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clone.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/aldeed_simple-schema/node_modules/clone/clone.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"message-box":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/aldeed_simple-schema/node_modules/message-box/package.json                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "message-box",
  "version": "0.2.7",
  "main": "./dist/MessageBox.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dist":{"MessageBox.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/aldeed_simple-schema/node_modules/message-box/dist/MessageBox.js                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"mongo-object":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/aldeed_simple-schema/node_modules/mongo-object/package.json                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "mongo-object",
  "version": "3.0.1",
  "main": "./dist/cjs/main.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dist":{"cjs":{"main.js":function module(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/aldeed_simple-schema/node_modules/mongo-object/dist/cjs/main.js                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoObject = exports.reportNulls = exports.makeKeyGeneric = exports.keyToPosition = exports.isBasicObject = exports.genericKeyAffectsOtherGenericKey = exports.extractOp = exports.expandKey = exports.cleanNulls = exports.appendAffectedKey = void 0;
const mongo_object_js_1 = __importDefault(require("./mongo-object.js"));
exports.MongoObject = mongo_object_js_1.default;
var util_js_1 = require("./util.js");
Object.defineProperty(exports, "appendAffectedKey", { enumerable: true, get: function () { return util_js_1.appendAffectedKey; } });
Object.defineProperty(exports, "cleanNulls", { enumerable: true, get: function () { return util_js_1.cleanNulls; } });
Object.defineProperty(exports, "expandKey", { enumerable: true, get: function () { return util_js_1.expandKey; } });
Object.defineProperty(exports, "extractOp", { enumerable: true, get: function () { return util_js_1.extractOp; } });
Object.defineProperty(exports, "genericKeyAffectsOtherGenericKey", { enumerable: true, get: function () { return util_js_1.genericKeyAffectsOtherGenericKey; } });
Object.defineProperty(exports, "isBasicObject", { enumerable: true, get: function () { return util_js_1.isBasicObject; } });
Object.defineProperty(exports, "keyToPosition", { enumerable: true, get: function () { return util_js_1.keyToPosition; } });
Object.defineProperty(exports, "makeKeyGeneric", { enumerable: true, get: function () { return util_js_1.makeKeyGeneric; } });
Object.defineProperty(exports, "reportNulls", { enumerable: true, get: function () { return util_js_1.reportNulls; } });
exports.default = mongo_object_js_1.default;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo-object.js":function module(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/aldeed_simple-schema/node_modules/mongo-object/dist/cjs/mongo-object.js                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_js_1 = require("./util.js");
const REMOVED_MARKER = '______MONGO_OBJECT_REMOVED______';
class MongoObject {
    /*
     * @constructor
     * @param obj
     * @param blackboxKeys A list of the names of keys that shouldn't be traversed
     * @returns {undefined}
     *
     * Creates a new MongoObject instance. The object passed as the first argument
     * will be modified in place by calls to instance methods. Also, immediately
     * upon creation of the instance, the object will have any `undefined` keys
     * removed recursively.
     */
    constructor(obj, blackboxKeys = []) {
        this._affectedKeys = {};
        this._arrayItemPositions = [];
        this._blackboxKeys = [];
        this._genericAffectedKeys = {};
        this._objectPositions = [];
        this._parentPositions = [];
        this._positionsByGenericKey = {};
        this._positionsInsideArrays = [];
        this._positionsThatCreateGenericKey = {};
        this._obj = obj;
        this._blackboxKeys = blackboxKeys;
        this._reParseObj();
    }
    _reParseObj() {
        const blackboxKeys = this._blackboxKeys;
        this._affectedKeys = {};
        this._genericAffectedKeys = {};
        this._positionsByGenericKey = {};
        this._positionsThatCreateGenericKey = {};
        this._parentPositions = [];
        this._positionsInsideArrays = [];
        this._objectPositions = [];
        this._arrayItemPositions = [];
        function parseObj(self, val, currentPosition, affectedKey, operator, adjusted, isWithinArray) {
            // Adjust for first-level modifier operators
            if (operator == null && (affectedKey === null || affectedKey === void 0 ? void 0 : affectedKey.substring(0, 1)) === '$') {
                operator = affectedKey;
                affectedKey = null;
            }
            let affectedKeyIsBlackBox = false;
            let stop = false;
            if (affectedKey != null) {
                // Adjust for $push and $addToSet and $pull and $pop
                if (adjusted !== true) {
                    if (operator === '$push' ||
                        operator === '$addToSet' ||
                        operator === '$pop') {
                        // Adjust for $each
                        // We can simply jump forward and pretend like the $each array
                        // is the array for the field. This has the added benefit of
                        // skipping past any $slice, which we also don't care about.
                        if ((0, util_js_1.isBasicObject)(val) && '$each' in val) {
                            val = val.$each;
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            currentPosition = `${currentPosition}[$each]`;
                        }
                        else {
                            affectedKey = `${affectedKey}.0`;
                        }
                        adjusted = true;
                    }
                    else if (operator === '$pull') {
                        affectedKey = `${affectedKey}.0`;
                        if ((0, util_js_1.isBasicObject)(val)) {
                            stop = true;
                        }
                        adjusted = true;
                    }
                }
                // Make generic key
                const affectedKeyGeneric = (0, util_js_1.makeKeyGeneric)(affectedKey);
                if (affectedKeyGeneric === null)
                    throw new Error(`Failed to get generic key for key "${affectedKey}"`);
                // Determine whether affected key should be treated as a black box
                affectedKeyIsBlackBox = affectedKeyGeneric !== null &&
                    blackboxKeys.includes(affectedKeyGeneric);
                // Mark that this position affects this generic and non-generic key
                if (currentPosition != null) {
                    self._affectedKeys[currentPosition] = affectedKey;
                    self._genericAffectedKeys[currentPosition] = affectedKeyGeneric;
                    const positionInfo = {
                        key: affectedKey,
                        operator: operator !== null && operator !== void 0 ? operator : null,
                        position: currentPosition
                    };
                    if (self._positionsByGenericKey[affectedKeyGeneric] == null)
                        self._positionsByGenericKey[affectedKeyGeneric] = [];
                    self._positionsByGenericKey[affectedKeyGeneric].push(positionInfo);
                    // Operators other than $unset will cause ancestor object keys to
                    // be auto-created.
                    if (operator != null && operator !== '$unset') {
                        MongoObject.objectsThatGenericKeyWillCreate(affectedKeyGeneric).forEach((objGenericKey) => {
                            if (self._positionsThatCreateGenericKey[objGenericKey] === undefined) {
                                self._positionsThatCreateGenericKey[objGenericKey] = [];
                            }
                            self._positionsThatCreateGenericKey[objGenericKey].push(positionInfo);
                        });
                    }
                    // If we're within an array, mark this position so we can omit it from flat docs
                    if (isWithinArray === true)
                        self._positionsInsideArrays.push(currentPosition);
                }
            }
            if (stop)
                return;
            // Loop through arrays
            if (Array.isArray(val) && val.length > 0) {
                if (currentPosition != null) {
                    // Mark positions with arrays that should be ignored when we want endpoints only
                    self._parentPositions.push(currentPosition);
                }
                // Loop
                val.forEach((v, i) => {
                    if (currentPosition != null)
                        self._arrayItemPositions.push(`${currentPosition}[${i}]`);
                    parseObj(self, v, currentPosition != null ? `${currentPosition}[${i}]` : String(i), 
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    `${affectedKey}.${i}`, operator, adjusted, true);
                });
            }
            else if (((0, util_js_1.isBasicObject)(val) && !affectedKeyIsBlackBox) ||
                currentPosition == null) {
                // Loop through object keys, only for basic objects,
                // but always for the passed-in object, even if it
                // is a custom object.
                if (currentPosition != null && !(0, util_js_1.isEmpty)(val)) {
                    // Mark positions with objects that should be ignored when we want endpoints only
                    self._parentPositions.push(currentPosition);
                    // Mark positions with objects that should be left out of flat docs.
                    self._objectPositions.push(currentPosition);
                }
                // Loop
                Object.keys(val).forEach((k) => {
                    const v = val[k];
                    if (v === undefined) {
                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete val[k];
                    }
                    else if (k !== '$slice') {
                        parseObj(self, v, currentPosition != null ? `${currentPosition}[${k}]` : k, (0, util_js_1.appendAffectedKey)(affectedKey, k), operator, adjusted, isWithinArray);
                    }
                });
            }
        }
        parseObj(this, this._obj);
    }
    /**
     * @param func
     * @param [options]
     * @param [options.endPointsOnly=true] - Only call function for endpoints and not for nodes that contain other nodes
     * @returns
     *
     * Runs a function for each endpoint node in the object tree, including all items in every array.
     * The function arguments are
     * (1) the value at this node
     * (2) a string representing the node position
     * (3) the representation of what would be changed in mongo, using mongo dot notation
     * (4) the generic equivalent of argument 3, with '$' instead of numeric pieces
     */
    forEachNode(func, { endPointsOnly = true } = {}) {
        if (typeof func !== 'function')
            throw new Error('filter requires a loop function');
        const updatedValues = {};
        Object.keys(this._affectedKeys).forEach((position) => {
            if (endPointsOnly && this._parentPositions.includes(position))
                return; // Only endpoints
            func.call({
                value: this.getValueForPosition(position),
                isArrayItem: this._arrayItemPositions.includes(position),
                operator: (0, util_js_1.extractOp)(position),
                position,
                key: this._affectedKeys[position],
                genericKey: this._genericAffectedKeys[position],
                updateValue: (newVal) => {
                    updatedValues[position] = newVal;
                },
                remove: () => {
                    updatedValues[position] = undefined;
                }
            });
        });
        // Actually update/remove values as instructed
        Object.keys(updatedValues).forEach((position) => {
            this.setValueForPosition(position, updatedValues[position]);
        });
    }
    getValueForPosition(position) {
        const subkeys = position.split('[');
        let current = this._obj;
        const ln = subkeys.length;
        for (let i = 0; i < ln; i++) {
            let subkey = subkeys[i];
            // If the subkey ends in ']', remove the ending
            if (subkey.slice(-1) === ']')
                subkey = subkey.slice(0, -1);
            current = current[subkey];
            if (!Array.isArray(current) && !(0, util_js_1.isBasicObject)(current) && i < ln - 1)
                return;
        }
        if (current === REMOVED_MARKER)
            return;
        return current;
    }
    /**
     * @param position
     * @param value
     */
    setValueForPosition(position, value) {
        const subkeys = position.split('[');
        let current = this._obj;
        const ln = subkeys.length;
        let createdObjectsOrArrays = false;
        let affectedKey = '';
        for (let i = 0; i < ln; i++) {
            let subkey = subkeys[i];
            // If the subkey ends in "]", remove the ending
            if (subkey.slice(-1) === ']')
                subkey = subkey.slice(0, -1);
            // We don't store modifiers
            if (subkey.length > 0 && subkey.substring(0, 1) !== '$') {
                affectedKey = (0, util_js_1.appendAffectedKey)(affectedKey, subkey);
            }
            // If we've reached the key in the object tree that needs setting or
            // deleting, do it.
            if (i === ln - 1) {
                // If value is undefined, delete the property
                if (value === undefined) {
                    if (Array.isArray(current)) {
                        // We can't just delete it because indexes in the position strings will be off
                        // We will mark it uniquely and then parse this elsewhere
                        current[Number(subkey)] = REMOVED_MARKER;
                    }
                    else {
                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete current[subkey];
                    }
                }
                else {
                    current[subkey] = value;
                }
                this._affectedKeys[position] = affectedKey;
            }
            else {
                // Otherwise attempt to keep moving deeper into the object.
                // If we're setting (as opposed to deleting) a key and we hit a place
                // in the ancestor chain where the keys are not yet created, create them.
                if (current[subkey] === undefined && value !== undefined) {
                    // See if the next piece is a number
                    const nextPiece = subkeys[i + 1];
                    current[subkey] = Number.isNaN(parseInt(nextPiece, 10)) ? {} : [];
                    createdObjectsOrArrays = true;
                }
                // Move deeper into the object
                current = current[subkey];
                // If we can go no further, then quit
                if (!Array.isArray(current) && !(0, util_js_1.isBasicObject)(current) && i < ln - 1)
                    return;
            }
        }
        // If there are now new arrays or objects in the main object, we need to reparse it
        if (createdObjectsOrArrays ||
            Array.isArray(value) ||
            (0, util_js_1.isBasicObject)(value)) {
            this._reParseObj();
        }
    }
    removeValueForPosition(position) {
        this.setValueForPosition(position, undefined);
    }
    getKeyForPosition(position) {
        return this._affectedKeys[position];
    }
    getGenericKeyForPosition(position) {
        return this._genericAffectedKeys[position];
    }
    /**
     * @param key Non-generic key
     * @returns The value and operator of the requested non-generic key.
     *   Example: {value: 1, operator: "$pull"}
     */
    getInfoForKey(key) {
        // Get the info
        const position = this.getPositionForKey(key);
        if (position !== undefined) {
            return {
                value: this.getValueForPosition(position),
                operator: (0, util_js_1.extractOp)(position)
            };
        }
        // If we haven't returned yet, check to see if there is an array value
        // corresponding to this key
        // We find the first item within the array, strip the last piece off the
        // position string, and then return whatever is at that new position in
        // the original object.
        const positions = this.getPositionsForGenericKey(`${key}.$`);
        for (let index = 0; index < positions.length; index++) {
            const pos = positions[index];
            let value = this.getValueForPosition(pos);
            if (value === undefined) {
                const parentPosition = pos.slice(0, pos.lastIndexOf('['));
                value = this.getValueForPosition(parentPosition);
            }
            if (value !== undefined) {
                return {
                    value,
                    operator: (0, util_js_1.extractOp)(pos)
                };
            }
        }
    }
    /**
     * @method MongoObject.getPositionForKey
     * @param {String} key - Non-generic key
     * @returns The position string for the place in the object that
     *   affects the requested non-generic key.
     *   Example: 'foo[bar][0]'
     */
    getPositionForKey(key) {
        const positions = Object.getOwnPropertyNames(this._affectedKeys);
        for (let index = 0; index < positions.length; index++) {
            const position = positions[index];
            // We return the first one we find. While it's
            // possible that multiple update operators could
            // affect the same non-generic key, we'll assume that's not the case.
            if (this._affectedKeys[position] === key)
                return position;
        }
    }
    /**
     * @param genericKey Generic key
     * @returns An array of position strings for the places in the object that
     *   affect the requested generic key.
     *   Example: ['foo[bar][0]']
     */
    getPositionsForGenericKey(genericKey) {
        return this.getPositionsInfoForGenericKey(genericKey).map((p) => p.position);
    }
    /**
     * @param genericKey Generic key
     * @returns An array of position info for the places in the object that
     *   affect the requested generic key.
     */
    getPositionsInfoForGenericKey(genericKey) {
        let positions = this._positionsByGenericKey[genericKey];
        if (positions == null || positions.length === 0)
            positions = this._positionsByGenericKey[`${genericKey}.$`];
        if (positions == null || positions.length === 0)
            positions = [];
        return positions.map((info) => (Object.assign({ value: this.getValueForPosition(info.position) }, info)));
    }
    getPositionsThatCreateGenericKey(genericKey) {
        var _a;
        return (_a = this._positionsThatCreateGenericKey[genericKey]) !== null && _a !== void 0 ? _a : [];
    }
    /**
     * @deprecated Use getInfoForKey
     * @param {String} key - Non-generic key
     * @returns The value of the requested non-generic key
     */
    getValueForKey(key) {
        const position = this.getPositionForKey(key);
        if (position != null)
            return this.getValueForPosition(position);
    }
    /**
     * Adds `key` with value `val` under operator `op` to the source object.
     *
     * @param key Key to set
     * @param val Value to give this key
     * @param op Operator under which to set it, or `null` for a non-modifier object
     * @returns
     */
    addKey(key, val, op) {
        const position = op != null ? `${op}[${key}]` : (0, util_js_1.keyToPosition)(key);
        this.setValueForPosition(position, val);
    }
    /**
     * Removes anything that affects any of the generic keys in the list
     */
    removeGenericKeys(keys) {
        Object.getOwnPropertyNames(this._genericAffectedKeys).forEach((position) => {
            const genericKey = this._genericAffectedKeys[position];
            if (genericKey !== null && keys.includes(genericKey)) {
                this.removeValueForPosition(position);
            }
        });
    }
    /**
     * Removes anything that affects the requested generic key
     */
    removeGenericKey(key) {
        Object.getOwnPropertyNames(this._genericAffectedKeys).forEach((position) => {
            if (this._genericAffectedKeys[position] === key) {
                this.removeValueForPosition(position);
            }
        });
    }
    /**
     * Removes anything that affects the requested non-generic key
     */
    removeKey(key) {
        // We don't use getPositionForKey here because we want to be sure to
        // remove for all positions if there are multiple.
        Object.getOwnPropertyNames(this._affectedKeys).forEach((position) => {
            if (this._affectedKeys[position] === key) {
                this.removeValueForPosition(position);
            }
        });
    }
    /**
     * Removes anything that affects any of the non-generic keys in the list
     */
    removeKeys(keys) {
        keys.forEach((key) => this.removeKey(key));
    }
    /**
     * Passes all affected keys to a test function, which
     * should return false to remove whatever is affecting that key
     */
    filterGenericKeys(test) {
        const checkedKeys = [];
        const keysToRemove = [];
        Object.getOwnPropertyNames(this._genericAffectedKeys).forEach((position) => {
            const genericKey = this._genericAffectedKeys[position];
            if (genericKey !== null && !checkedKeys.includes(genericKey)) {
                checkedKeys.push(genericKey);
                if (genericKey != null && !test(genericKey)) {
                    keysToRemove.push(genericKey);
                }
            }
        });
        keysToRemove.forEach((key) => this.removeGenericKey(key));
    }
    /**
     * Sets the value for every place in the object that affects
     * the requested non-generic key
     */
    setValueForKey(key, val) {
        // We don't use getPositionForKey here because we want to be sure to
        // set the value for all positions if there are multiple.
        Object.getOwnPropertyNames(this._affectedKeys).forEach((position) => {
            if (this._affectedKeys[position] === key) {
                this.setValueForPosition(position, val);
            }
        });
    }
    /**
     * Sets the value for every place in the object that affects
     * the requested generic key
     */
    setValueForGenericKey(key, val) {
        // We don't use getPositionForKey here because we want to be sure to
        // set the value for all positions if there are multiple.
        Object.getOwnPropertyNames(this._genericAffectedKeys).forEach((position) => {
            if (this._genericAffectedKeys[position] === key) {
                this.setValueForPosition(position, val);
            }
        });
    }
    removeArrayItems() {
        // Traverse and pull out removed array items at this point
        function traverse(obj) {
            (0, util_js_1.each)(obj, (val, indexOrProp) => {
                // Move deeper into the object
                const next = obj[indexOrProp];
                // If we can go no further, then quit
                if ((0, util_js_1.isBasicObject)(next)) {
                    traverse(next);
                }
                else if (Array.isArray(next)) {
                    obj[indexOrProp] = next.filter((item) => item !== REMOVED_MARKER);
                    traverse(obj[indexOrProp]);
                }
                return undefined;
            });
        }
        traverse(this._obj);
    }
    /**
     * Get the source object, potentially modified by other method calls on this
     * MongoObject instance.
     */
    getObject() {
        return this._obj;
    }
    /**
     * Gets a flat object based on the MongoObject instance.
     * In a flat object, the key is the name of the non-generic affectedKey,
     * with mongo dot notation if necessary, and the value is the value for
     * that key.
     *
     * With `keepArrays: true`, we don't flatten within arrays. Currently
     * MongoDB does not see a key such as `a.0.b` and automatically assume
     * an array. Instead it would create an object with key '0' if there
     * wasn't already an array saved as the value of `a`, which is rarely
     * if ever what we actually want. To avoid this confusion, we
     * set entire arrays.
     */
    getFlatObject({ keepArrays = false } = {}) {
        const newObj = {};
        Object.keys(this._affectedKeys).forEach((position) => {
            const affectedKey = this._affectedKeys[position];
            if (typeof affectedKey === 'string' &&
                ((keepArrays &&
                    !this._positionsInsideArrays.includes(position) &&
                    !this._objectPositions.includes(position)) ||
                    (!keepArrays &&
                        !this._parentPositions.includes(position)))) {
                newObj[affectedKey] = this.getValueForPosition(position);
            }
        });
        return newObj;
    }
    /**
     * @method MongoObject.affectsKey
     * @param key Key to test
     * @returns True if the non-generic key is affected by this object
     */
    affectsKey(key) {
        return this.getPositionForKey(key) !== undefined;
    }
    /**
     * @method MongoObject.affectsGenericKey
     * @param key Key to test
     * @returns True if the generic key is affected by this object
     */
    affectsGenericKey(key) {
        const positions = Object.getOwnPropertyNames(this._genericAffectedKeys);
        for (let index = 0; index < positions.length; index++) {
            const position = positions[index];
            if (this._genericAffectedKeys[position] === key)
                return true;
        }
        return false;
    }
    /**
     * @method MongoObject.affectsGenericKeyImplicit
     * @param key Key to test
     * @returns Like affectsGenericKey, but will return true if a child key is affected
     */
    affectsGenericKeyImplicit(key) {
        const positions = Object.getOwnPropertyNames(this._genericAffectedKeys);
        for (let index = 0; index < positions.length; index++) {
            const position = positions[index];
            const affectedKey = this._genericAffectedKeys[position];
            if (affectedKey !== null &&
                (0, util_js_1.genericKeyAffectsOtherGenericKey)(key, affectedKey))
                return true;
        }
        return false;
    }
    /**
     * This is different from MongoObject.prototype.getKeyForPosition in that
     * this method does not depend on the requested position actually being
     * present in any particular MongoObject.
     *
     * @method MongoObject._positionToKey
     * @param position
     * @returns The key that this position in an object would affect.
     */
    static _positionToKey(position) {
        // XXX Probably a better way to do this, but this is
        // foolproof for now.
        const mDoc = new MongoObject({});
        mDoc.setValueForPosition(position, 1); // Value doesn't matter
        return mDoc.getKeyForPosition(position);
    }
    /**
     * @method MongoObject.docToModifier
     * @public
     * @param doc - An object to be converted into a MongoDB modifier
     * @param [options] Options
     * @returns A MongoDB modifier.
     *
     * Converts an object into a modifier by flattening it, putting keys with
     * null, undefined, and empty string values into `modifier.$unset`, and
     * putting the rest of the keys into `modifier.$set`.
     */
    static docToModifier(doc, { keepArrays = false, keepEmptyStrings = false } = {}) {
        // Flatten doc
        const mDoc = new MongoObject(doc);
        let flatDoc = mDoc.getFlatObject({ keepArrays });
        // Get a list of null, undefined, and empty string values so we can unset them instead
        const nulls = (0, util_js_1.reportNulls)(flatDoc, keepEmptyStrings);
        flatDoc = (0, util_js_1.cleanNulls)(flatDoc, false, keepEmptyStrings);
        const modifier = {};
        if (!(0, util_js_1.isEmpty)(flatDoc))
            modifier.$set = flatDoc;
        if (!(0, util_js_1.isEmpty)(nulls))
            modifier.$unset = nulls;
        return modifier;
    }
    static objAffectsKey(obj, key) {
        const mDoc = new MongoObject(obj);
        return mDoc.affectsKey(key);
    }
    /**
     * @param genericKey Generic key
     * @return Array of other generic keys that would be created by this generic key
     */
    static objectsThatGenericKeyWillCreate(genericKey) {
        const objs = [];
        do {
            const lastDotPosition = genericKey.lastIndexOf('.');
            genericKey = lastDotPosition === -1 ? '' : genericKey.slice(0, lastDotPosition);
            if (genericKey.length > 0 && !genericKey.endsWith('.$'))
                objs.push(genericKey);
        } while (genericKey.length > 0);
        return objs;
    }
    /**
     * Takes a flat object and returns an expanded version of it.
     */
    static expandObj(doc) {
        const newDoc = {};
        Object.keys(doc).forEach((key) => {
            const val = doc[key];
            const subkeys = key.split('.');
            const subkeylen = subkeys.length;
            let current = newDoc;
            for (let i = 0; i < subkeylen; i++) {
                const subkey = subkeys[i];
                if (typeof current[subkey] !== 'undefined' &&
                    !(0, util_js_1.isObject)(current[subkey])) {
                    break; // Already set for some reason; leave it alone
                }
                if (i === subkeylen - 1) {
                    // Last iteration; time to set the value
                    current[subkey] = val;
                }
                else {
                    // See if the next piece is a number
                    const nextPiece = subkeys[i + 1];
                    const nextPieceInt = parseInt(nextPiece, 10);
                    if (Number.isNaN(nextPieceInt) && !(0, util_js_1.isObject)(current[subkey])) {
                        current[subkey] = {};
                    }
                    else if (!Number.isNaN(nextPieceInt) &&
                        !Array.isArray(current[subkey])) {
                        current[subkey] = [];
                    }
                }
                current = current[subkey];
            }
        });
        return newDoc;
    }
}
exports.default = MongoObject;
/* STATIC */
MongoObject._keyToPosition = util_js_1.keyToPosition;
MongoObject.cleanNulls = util_js_1.cleanNulls;
MongoObject.expandKey = util_js_1.expandKey;
MongoObject.isBasicObject = util_js_1.isBasicObject;
MongoObject.makeKeyGeneric = util_js_1.makeKeyGeneric;
MongoObject.reportNulls = util_js_1.reportNulls;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"util.js":function module(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/aldeed_simple-schema/node_modules/mongo-object/dist/cjs/util.js                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandKey = exports.keyToPosition = exports.makeKeyGeneric = exports.isObject = exports.isEmpty = exports.isPrototype = exports.each = exports.isArrayLike = exports.isLength = exports.isNullUndefinedOrEmptyString = exports.genericKeyAffectsOtherGenericKey = exports.extractOp = exports.appendAffectedKey = exports.reportNulls = exports.isBasicObject = exports.cleanNulls = void 0;
/** Used as references for various `Number` constants. */
const MAX_SAFE_INTEGER = 9007199254740991;
/**
 * @param doc Source object or array
 * @param isArray True if `doc` is an array
 * @param keepEmptyStrings Whether to keep empty strings
 * @returns An object in which all properties with null, undefined, or empty
 *   string values have been removed, recursively.
 */
function cleanNulls(doc, isArray = false, keepEmptyStrings = false) {
    const newDoc = isArray ? [] : {};
    Object.keys(doc).forEach((key) => {
        let val = doc[key];
        if (!Array.isArray(val) && isBasicObject(val)) {
            val = cleanNulls(val, false, keepEmptyStrings); // Recurse into plain objects
            if (!isEmpty(val))
                newDoc[key] = val;
        }
        else if (Array.isArray(val)) {
            val = cleanNulls(val, true, keepEmptyStrings); // Recurse into non-typed arrays
            if (!isEmpty(val))
                newDoc[key] = val;
        }
        else if (!isNullUndefinedOrEmptyString(val)) {
            newDoc[key] = val;
        }
        else if (keepEmptyStrings &&
            typeof val === 'string' &&
            val.length === 0) {
            newDoc[key] = val;
        }
    });
    return newDoc;
}
exports.cleanNulls = cleanNulls;
/**
 * @param obj Any reference to check
 * @returns True if obj is an Object as opposed to
 *   something that inherits from Object
 */
function isBasicObject(obj) {
    return obj === Object(obj) && Object.getPrototypeOf(obj) === Object.prototype;
}
exports.isBasicObject = isBasicObject;
/**
 * @method MongoObject.reportNulls
 * @public
 * @param flatDoc An object with no properties that are also objects.
 * @returns An object in which the keys represent the keys in the
 *   original object that were null, undefined, or empty strings, and the value
 *   of each key is "".
 */
function reportNulls(flatDoc, keepEmptyStrings = false) {
    const nulls = {};
    // Loop through the flat doc
    Object.keys(flatDoc).forEach((key) => {
        const val = flatDoc[key];
        if (val === null ||
            val === undefined ||
            (!keepEmptyStrings && typeof val === 'string' && val.length === 0) ||
            // If value is an array in which all the values recursively are undefined, null,
            // or an empty string
            (Array.isArray(val) &&
                cleanNulls(val, true, keepEmptyStrings).length === 0)) {
            nulls[key] = '';
        }
    });
    return nulls;
}
exports.reportNulls = reportNulls;
function appendAffectedKey(affectedKey, key) {
    if (key === '$each')
        return affectedKey;
    return (affectedKey != null && affectedKey.length > 0) ? `${affectedKey}.${key}` : key;
}
exports.appendAffectedKey = appendAffectedKey;
// Extracts operator piece, if present, from position string
function extractOp(position) {
    const firstPositionPiece = position.slice(0, position.indexOf('['));
    return firstPositionPiece.substring(0, 1) === '$' ? firstPositionPiece : null;
}
exports.extractOp = extractOp;
function genericKeyAffectsOtherGenericKey(key, affectedKey) {
    // If the affected key is the test key
    if (affectedKey === key)
        return true;
    // If the affected key implies the test key because the affected key
    // starts with the test key followed by a period
    if (affectedKey.substring(0, key.length + 1) === `${key}.`)
        return true;
    // If the affected key implies the test key because the affected key
    // starts with the test key and the test key ends with ".$"
    const lastTwo = key.slice(-2);
    if (lastTwo === '.$' && key.slice(0, -2) === affectedKey)
        return true;
    return false;
}
exports.genericKeyAffectsOtherGenericKey = genericKeyAffectsOtherGenericKey;
function isNullUndefinedOrEmptyString(val) {
    return (val === undefined ||
        val === null ||
        (typeof val === 'string' && val.length === 0));
}
exports.isNullUndefinedOrEmptyString = isNullUndefinedOrEmptyString;
function isLength(value) {
    return (typeof value === 'number' &&
        value > -1 &&
        value % 1 === 0 &&
        value <= MAX_SAFE_INTEGER);
}
exports.isLength = isLength;
function isArrayLike(value) {
    return value != null && typeof value !== 'function' && isLength(value.length);
}
exports.isArrayLike = isArrayLike;
function each(collection, iteratee) {
    if (collection == null) {
        return;
    }
    if (Array.isArray(collection)) {
        collection.forEach(iteratee);
        return;
    }
    const iterable = Object(collection);
    if (!isArrayLike(collection)) {
        Object.keys(iterable).forEach((key) => iteratee(iterable[key], key, iterable));
        return;
    }
    let index = -1;
    while (++index < collection.length) {
        if (iteratee(iterable[index], index, iterable) === false) {
            break;
        }
    }
}
exports.each = each;
function isPrototype(value) {
    const Ctor = value === null || value === void 0 ? void 0 : value.constructor;
    if (typeof Ctor !== 'function' || Ctor.prototype === undefined) {
        return value === Object.prototype;
    }
    return value === Ctor.prototype;
}
exports.isPrototype = isPrototype;
function isEmpty(value) {
    if (value === null || value === undefined) {
        return true;
    }
    if (Array.isArray(value) || typeof value === 'string') {
        return value.length === 0;
    }
    const tag = Object.prototype.toString.call(value);
    if (tag === '[object Map]' || tag === '[object Set]') {
        return value.size === 0;
    }
    if (isPrototype(value)) {
        return Object.keys(value).length === 0;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const key in value) {
        if (Object.hasOwnProperty.call(value, key)) {
            return false;
        }
    }
    return true;
}
exports.isEmpty = isEmpty;
function isObject(value) {
    const type = typeof value;
    return value != null && (type === 'object' || type === 'function');
}
exports.isObject = isObject;
/* Takes a specific string that uses any mongo-style positional update
 * dot notation and returns a generic string equivalent. Replaces all numeric
 * positional "pieces" (e.g. '.1') or any other positional operator
 * (e.g. '$[<identifier>]')  with a dollar sign ($).
 *
 * @param key A specific or generic key
 * @returns Generic name.
 */
function makeKeyGeneric(key) {
    if (typeof key !== 'string')
        return null;
    return key.replace(/\.([0-9]+|\$\[[^\]]*\])(?=\.|$)/g, '.$');
}
exports.makeKeyGeneric = makeKeyGeneric;
function keyToPosition(key, wrapAll = false) {
    let position = '';
    key.split('.').forEach((piece, i) => {
        if (i === 0 && !wrapAll) {
            position += piece;
        }
        else {
            position += `[${piece}]`;
        }
    });
    return position;
}
exports.keyToPosition = keyToPosition;
/**
 *  Takes a string representation of an object key and its value
 *  and updates "obj" to contain that key with that value.
 *
 *  Example keys and results if val is 1:
 *    "a" -> {a: 1}
 *    "a[b]" -> {a: {b: 1}}
 *    "a[b][0]" -> {a: {b: [1]}}
 *    'a[b.0.c]' -> {a: {'b.0.c': 1}}
 * @param val Value
 * @param key Key
 * @param obj Object
 */
function expandKey(val, key, obj) {
    const subkeys = key.split('[');
    let current = obj;
    for (let i = 0, ln = subkeys.length; i < ln; i++) {
        let subkey = subkeys[i];
        if (subkey.slice(-1) === ']') {
            subkey = subkey.slice(0, -1);
        }
        if (i === ln - 1) {
            // Last iteration; time to set the value; always overwrite
            current[subkey] = val;
            // If val is undefined, delete the property
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            if (val === undefined)
                delete current[subkey];
        }
        else {
            // See if the next piece is a number
            const nextPiece = subkeys[i + 1];
            if (current[subkey] === undefined) {
                current[subkey] = Number.isNaN(parseInt(nextPiece, 10)) ? {} : [];
            }
        }
        current = current[subkey];
    }
}
exports.expandKey = expandKey;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/aldeed:simple-schema/lib/main.js"
  ],
  mainModulePath: "/node_modules/meteor/aldeed:simple-schema/lib/main.js"
}});

//# sourceURL=meteor://💻app/packages/aldeed_simple-schema.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNpbXBsZS1zY2hlbWEvbGliL21haW4uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi9TaW1wbGVTY2hlbWEuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi9TaW1wbGVTY2hlbWFHcm91cC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNpbXBsZS1zY2hlbWEvbGliL1ZhbGlkYXRpb25Db250ZXh0LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGRlZWQ6c2ltcGxlLXNjaGVtYS9saWIvY2xlYW4uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi9kZWZhdWx0TWVzc2FnZXMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi9kb1ZhbGlkYXRpb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi9leHBhbmRTaG9ydGhhbmQuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi9odW1hbml6ZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNpbXBsZS1zY2hlbWEvbGliL3JlZ0V4cC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNpbXBsZS1zY2hlbWEvbGliL2NsZWFuL0F1dG9WYWx1ZVJ1bm5lci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNpbXBsZS1zY2hlbWEvbGliL2NsZWFuL2NvbnZlcnRUb1Byb3BlclR5cGUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi9jbGVhbi9nZXRQb3NpdGlvbnNGb3JBdXRvVmFsdWUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi9jbGVhbi9zZXRBdXRvVmFsdWVzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGRlZWQ6c2ltcGxlLXNjaGVtYS9saWIvdXRpbGl0eS9hcHBlbmRBZmZlY3RlZEtleS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNpbXBsZS1zY2hlbWEvbGliL3V0aWxpdHkvZGF0ZVRvRGF0ZVN0cmluZy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNpbXBsZS1zY2hlbWEvbGliL3V0aWxpdHkvZm9yRWFjaEtleUFuY2VzdG9yLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGRlZWQ6c2ltcGxlLXNjaGVtYS9saWIvdXRpbGl0eS9nZXRLZXlzV2l0aFZhbHVlSW5PYmouanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi91dGlsaXR5L2dldExhc3RQYXJ0T2ZLZXkuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi91dGlsaXR5L2dldFBhcmVudE9mS2V5LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGRlZWQ6c2ltcGxlLXNjaGVtYS9saWIvdXRpbGl0eS9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNpbXBsZS1zY2hlbWEvbGliL3V0aWxpdHkvaXNFbXB0eU9iamVjdC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNpbXBsZS1zY2hlbWEvbGliL3V0aWxpdHkvaXNPYmplY3RXZVNob3VsZFRyYXZlcnNlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGRlZWQ6c2ltcGxlLXNjaGVtYS9saWIvdXRpbGl0eS9sb29rc0xpa2VNb2RpZmllci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNpbXBsZS1zY2hlbWEvbGliL3V0aWxpdHkvbWVyZ2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi92YWxpZGF0aW9uL2FsbG93ZWRWYWx1ZXNWYWxpZGF0b3IuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi92YWxpZGF0aW9uL3JlcXVpcmVkVmFsaWRhdG9yLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGRlZWQ6c2ltcGxlLXNjaGVtYS9saWIvdmFsaWRhdGlvbi90eXBlVmFsaWRhdG9yL2RvQXJyYXlDaGVja3MuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzaW1wbGUtc2NoZW1hL2xpYi92YWxpZGF0aW9uL3R5cGVWYWxpZGF0b3IvZG9EYXRlQ2hlY2tzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGRlZWQ6c2ltcGxlLXNjaGVtYS9saWIvdmFsaWRhdGlvbi90eXBlVmFsaWRhdG9yL2RvTnVtYmVyQ2hlY2tzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGRlZWQ6c2ltcGxlLXNjaGVtYS9saWIvdmFsaWRhdGlvbi90eXBlVmFsaWRhdG9yL2RvU3RyaW5nQ2hlY2tzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGRlZWQ6c2ltcGxlLXNjaGVtYS9saWIvdmFsaWRhdGlvbi90eXBlVmFsaWRhdG9yL2luZGV4LmpzIl0sIm5hbWVzIjpbIlNpbXBsZVNjaGVtYSIsIlZhbGlkYXRpb25Db250ZXh0IiwibW9kdWxlIiwibGluayIsInYiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsImV4cG9ydERlZmF1bHQiLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiLCJfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMiLCJkZWZhdWx0IiwiX29iamVjdFNwcmVhZCIsIl9leGNsdWRlZCIsImV4cG9ydCIsInNjaGVtYURlZmluaXRpb25PcHRpb25zIiwiY2xvbmUiLCJNZXNzYWdlQm94IiwiTW9uZ29PYmplY3QiLCJodW1hbml6ZSIsIlNpbXBsZVNjaGVtYUdyb3VwIiwicmVnRXhwT2JqIiwiY2xlYW4iLCJleHBhbmRTaG9ydGhhbmQiLCJmb3JFYWNoS2V5QW5jZXN0b3IiLCJpc0VtcHR5T2JqZWN0IiwibWVyZ2UiLCJkZWZhdWx0TWVzc2FnZXMiLCJvbmVPZlByb3BzIiwicHJvcHNUaGF0Q2FuQmVGdW5jdGlvbiIsImNvbnN0cnVjdG9yIiwic2NoZW1hIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwib3B0aW9ucyIsInBpY2siLCJnZXRQaWNrT3JPbWl0Iiwib21pdCIsIl9jb25zdHJ1Y3Rvck9wdGlvbnMiLCJfY29uc3RydWN0b3JPcHRpb25EZWZhdWx0cyIsIl9jbGVhbk9wdGlvbnMiLCJfdmFsaWRhdG9ycyIsIl9kb2NWYWxpZGF0b3JzIiwiX3ZhbGlkYXRpb25Db250ZXh0cyIsIl9zY2hlbWEiLCJfZGVwc0xhYmVscyIsImV4dGVuZCIsIl9yYXdEZWZpbml0aW9uIiwia2VlcFJhd0RlZmluaXRpb24iLCJtZXNzYWdlQm94IiwidmVyc2lvbiIsInJhd0RlZmluaXRpb24iLCJmb3JFYWNoQW5jZXN0b3JTaW1wbGVTY2hlbWEiLCJrZXkiLCJmdW5jIiwiZ2VuZXJpY0tleSIsIm1ha2VLZXlHZW5lcmljIiwiYW5jZXN0b3IiLCJkZWYiLCJ0eXBlIiwiZGVmaW5pdGlvbnMiLCJmb3JFYWNoIiwidHlwZURlZiIsImlzU2ltcGxlU2NoZW1hIiwic2xpY2UiLCJvYmoiLCJyZWFjdGl2ZUxhYmVsRGVwZW5kZW5jeSIsInRyYWNrZXIiLCJEZXBlbmRlbmN5IiwiZGVwZW5kIiwic2ltcGxlU2NoZW1hIiwic3ViU2NoZW1hS2V5IiwibmVhcmVzdFNpbXBsZVNjaGVtYUluc3RhbmNlIiwiaW5uZXJLZXkiLCJrZXlTY2hlbWEiLCJmb3VuZCIsIm1lcmdlZFNjaGVtYSIsIl9zY2hlbWFLZXlzIiwiY2hpbGRTY2hlbWEiLCJPYmplY3QiLCJrZXlzIiwic3ViS2V5IiwiY29uY2F0IiwiZ2V0RGVmaW5pdGlvbiIsInByb3BMaXN0IiwiZnVuY3Rpb25Db250ZXh0IiwiZGVmcyIsImdldFByb3BJdGVyYXRvciIsIm5ld09iaiIsInByb3AiLCJBcnJheSIsImlzQXJyYXkiLCJpbmNsdWRlcyIsInZhbCIsImluZGV4T2YiLCJjYWxsIiwiaW5mbGVjdGVkTGFiZWwiLCJodW1hbml6ZUF1dG9MYWJlbHMiLCJyZXN1bHQiLCJtYXAiLCJuZXdUeXBlRGVmIiwiZ2V0UXVpY2tUeXBlRm9yS2V5IiwiZmllbGRTY2hlbWEiLCJmaWVsZFR5cGUiLCJzaW5nbGVUeXBlIiwiU3RyaW5nIiwiTnVtYmVyIiwiSW50ZWdlciIsIkJvb2xlYW4iLCJEYXRlIiwiYXJyYXlJdGVtRmllbGRTY2hlbWEiLCJhcnJheUl0ZW1GaWVsZFR5cGUiLCJnZXRPYmplY3RTY2hlbWEiLCJuZXdTY2hlbWFEZWYiLCJzZWFyY2hTdHJpbmciLCJrIiwiX2NvcHlXaXRoU2NoZW1hIiwiYXV0b1ZhbHVlRnVuY3Rpb25zIiwiX2F1dG9WYWx1ZXMiLCJfcmVmIiwiZmllbGROYW1lIiwiY2xvc2VzdFN1YnNjaGVtYUZpZWxkTmFtZSIsImJsYWNrYm94S2V5cyIsIlNldCIsIl9ibGFja2JveEtleXMiLCJibGFja2JveEtleSIsImFkZCIsImZyb20iLCJrZXlJc0luQmxhY2tCb3giLCJpc0luQmxhY2tCb3giLCJyZW1haW5kZXIiLCJoYXMiLCJ0ZXN0S2V5U2NoZW1hIiwiYWxsb3dzS2V5Iiwic29tZSIsImxvb3BLZXkiLCJjb21wYXJlMSIsImNvbXBhcmUyIiwiYWxsb3dlZCIsIm9iamVjdEtleXMiLCJrZXlQcmVmaXgiLCJfZmlyc3RMZXZlbFNjaGVtYUtleXMiLCJzZXRPYmplY3RLZXlzIiwiY3VyU2NoZW1hIiwic2NoZW1hUGFyZW50S2V5IiwiZGVmaW5pdGlvbiIsInBhcmVudEtleSIsImxhc3RJbmRleE9mIiwicGFyZW50S2V5V2l0aERvdCIsInB1c2giLCJfcmVmMiIsImNsIiwiRXJyb3IiLCJzY2hlbWFPYmoiLCJhc3NpZ24iLCJzY2hlbWFLZXlzIiwiY29tYmluZWRLZXlzIiwic3RhbmRhcmRpemVEZWZpbml0aW9uIiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJkZWZpbml0aW9uV2l0aG91dFR5cGUiLCJjaGVja0FuZFNjcnViRGVmaW5pdGlvbiIsImNoZWNrU2NoZW1hT3ZlcmxhcCIsInBhcmVudEZpZWxkTmFtZSIsIm9uZU9mRGVmIiwiYmxhY2tib3giLCJBbnkiLCJhdXRvVmFsdWUiLCJnZXRBbGxvd2VkVmFsdWVzRm9yS2V5IiwiYWxsb3dlZFZhbHVlcyIsImdldCIsIm5ld0NvbnRleHQiLCJuYW1lZENvbnRleHQiLCJuYW1lIiwiYWRkVmFsaWRhdG9yIiwiYWRkRG9jVmFsaWRhdG9yIiwidmFsaWRhdGUiLCJjaGVjayIsImUiLCJvYmplY3RzIiwib25lT2JqIiwidmFsaWRhdGlvbkNvbnRleHQiLCJpc1ZhbGlkIiwiZXJyb3JzIiwidmFsaWRhdGlvbkVycm9ycyIsIm1lc3NhZ2UiLCJtZXNzYWdlRm9yRXJyb3IiLCJlcnJvciIsImVycm9yVHlwZSIsImRldGFpbHMiLCJlcnJvckRldGFpbCIsInZhbGlkYXRpb25FcnJvclRyYW5zZm9ybSIsInZhbGlkYXRlQW5kUmV0dXJuRXJyb3JzUHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwidmFsaWRhdG9yIiwib3B0aW9uc0Nsb25lIiwibW9uZ29PYmplY3QiLCJyZXR1cm5FcnJvcnNQcm9taXNlIiwiZ2V0Rm9ybVZhbGlkYXRvciIsIl9sZW4iLCJhcmdzIiwiX2tleSIsImxhYmVscyIsImxhYmVsIiwic2NoZW1hSW5zdGFuY2UiLCJjaGFuZ2VkIiwic2NoZW1hS2V5IiwiZmluZCIsInByb3BzIiwiZGVmYXVsdFZhbHVlIiwiZXJyb3JJbmZvIiwiY29udGV4dCIsImV4dGVuZE9wdGlvbnMiLCJvcHRpb24iLCJkZWZpbmVWYWxpZGF0aW9uRXJyb3JUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm0iLCJvbmVPZiIsIl9sZW4yIiwiX2tleTIiLCJjb25zdHJ1Y3Rvck9wdGlvbkRlZmF1bHRzIiwiUmVnRXgiLCJhdXRvQ29udmVydCIsImV4dGVuZEF1dG9WYWx1ZUNvbnRleHQiLCJmaWx0ZXIiLCJnZXRBdXRvVmFsdWVzIiwicmVtb3ZlRW1wdHlTdHJpbmdzIiwicmVtb3ZlTnVsbHNGcm9tQXJyYXlzIiwidHJpbVN0cmluZ3MiLCJyZXF1aXJlZEJ5RGVmYXVsdCIsIkVycm9yVHlwZXMiLCJSRVFVSVJFRCIsIk1JTl9TVFJJTkciLCJNQVhfU1RSSU5HIiwiTUlOX05VTUJFUiIsIk1BWF9OVU1CRVIiLCJNSU5fTlVNQkVSX0VYQ0xVU0lWRSIsIk1BWF9OVU1CRVJfRVhDTFVTSVZFIiwiTUlOX0RBVEUiLCJNQVhfREFURSIsIkJBRF9EQVRFIiwiTUlOX0NPVU5UIiwiTUFYX0NPVU5UIiwiTVVTVF9CRV9JTlRFR0VSIiwiVkFMVUVfTk9UX0FMTE9XRUQiLCJFWFBFQ1RFRF9UWVBFIiwiRkFJTEVEX1JFR1VMQVJfRVhQUkVTU0lPTiIsIktFWV9OT1RfSU5fU0NIRU1BIiwiX21ha2VHZW5lcmljIiwic2V0RGVmYXVsdE1lc3NhZ2VzIiwibWVzc2FnZXMiLCJuZXdLZXkiLCJzaG91bGRIdW1hbml6ZSIsInBpZWNlcyIsInNwbGl0IiwicG9wIiwiZ2V0RGVmYXVsdEF1dG9WYWx1ZUZ1bmN0aW9uIiwiZGVmYXVsdEF1dG9WYWx1ZUZ1bmN0aW9uIiwiaXNTZXQiLCJvcGVyYXRvciIsInBhcmVudEZpZWxkIiwiaXNVcHNlcnQiLCIkc2V0T25JbnNlcnQiLCJzdGFuZGFyZGl6ZWREZWYiLCJyZWR1Y2UiLCJuZXdEZWYiLCJncm91cFByb3BzIiwiYWxsS2V5cyIsImNvdWxkQmVBcnJheSIsIl9yZWYzIiwiaXNEZWZhdWx0IiwiY29uc29sZSIsIndhcm4iLCJlbmRzV2l0aCIsIm9wdGlvbmFsIiwicmVxdWlyZWQiLCJyZXF1aXJlZEZuIiwiX2xlbjMiLCJfa2V5MyIsImFwcGx5IiwiZGVmYXVsdExhYmVsIiwicGlja09yT21pdCIsIl9sZW40IiwiX2tleTQiLCJuZXdTY2hlbWEiLCJpbmNsdWRlSXQiLCJ3YW50ZWRGaWVsZCIsImlzQmFzaWNPYmplY3QiLCJSZWdFeHAiLCJyZWdFeCIsIm90aGVyR3JvdXAiLCJpbmRleCIsIm90aGVyRGVmIiwiZG9WYWxpZGF0aW9uIiwic3MiLCJfc2ltcGxlU2NoZW1hIiwiX3ZhbGlkYXRpb25FcnJvcnMiLCJfZGVwcyIsIl9kZXBzQW55IiwiX21hcmtLZXlDaGFuZ2VkIiwiX21hcmtLZXlzQ2hhbmdlZCIsInNldFZhbGlkYXRpb25FcnJvcnMiLCJwcmV2aW91c1ZhbGlkYXRpb25FcnJvcnMiLCJvIiwibmV3VmFsaWRhdGlvbkVycm9ycyIsImNoYW5nZWRLZXlzIiwiYWRkVmFsaWRhdGlvbkVycm9ycyIsInJlc2V0IiwiZ2V0RXJyb3JGb3JLZXkiLCJlcnJvckZvcktleSIsIl9rZXlJc0ludmFsaWQiLCJrZXlJc0ludmFsaWQiLCJrZXlFcnJvck1lc3NhZ2UiLCJlcnJvck9iaiIsImV4dGVuZGVkQ3VzdG9tQ29udGV4dCIsImlnbm9yZSIsImlnbm9yZVR5cGVzIiwia2V5c1RvVmFsaWRhdGUiLCJtb2RpZmllciIsImlzTW9kaWZpZXIiLCJ1cHNlcnQiLCJ3YXNWYWxpZGF0ZWQiLCJzdGFydHNXaXRoIiwibG9va3NMaWtlTW9kaWZpZXIiLCJjb252ZXJ0VG9Qcm9wZXJUeXBlIiwic2V0QXV0b1ZhbHVlcyIsInR5cGVWYWxpZGF0b3IiLCJvcGVyYXRvcnNUb0lnbm9yZVZhbHVlIiwiZG9jIiwiY2xlYW5Eb2MiLCJtdXRhdGUiLCJyZW1vdmVkUG9zaXRpb25zIiwiZm9yRWFjaE5vZGUiLCJlYWNoTm9kZSIsImdLZXkiLCJ2YWx1ZSIsInAiLCJpc0FycmF5SXRlbSIsInBvc2l0aW9uIiwicmVtb3ZlVmFsdWVGb3JQb3NpdGlvbiIsInJlbW92ZSIsImRlYnVnIiwiaW5mbyIsIm91dGVyRGVmIiwiaXNWYWxpZFR5cGUiLCJ2YWx1ZVNob3VsZEJlQ2hlY2tlZCIsIm5ld1ZhbCIsInVwZGF0ZVZhbHVlIiwidHJpbSIsIm1hdGNoIiwicmVwbGFjZSIsInNldFZhbHVlRm9yUG9zaXRpb24iLCJlbmRQb2ludHNPbmx5IiwicmVtb3ZlZFBvc2l0aW9uIiwibGFzdEJyYWNlIiwicmVtb3ZlZFBvc2l0aW9uUGFyZW50IiwiZ2V0VmFsdWVGb3JQb3NpdGlvbiIsInJlbW92ZUFycmF5SXRlbXMiLCJvcCIsIm9wZXJhdG9yVmFsdWUiLCJyZWdFeHBNZXNzYWdlcyIsImV4cCIsIkVtYWlsIiwibXNnIiwiRW1haWxXaXRoVExEIiwiRG9tYWluIiwiV2Vha0RvbWFpbiIsIklQIiwiSVB2NCIsIklQdjYiLCJVcmwiLCJJZCIsIlppcENvZGUiLCJQaG9uZSIsImluaXRpYWxMYW5ndWFnZSIsImVuIiwibWluU3RyaW5nIiwibWF4U3RyaW5nIiwibWluTnVtYmVyIiwibWF4TnVtYmVyIiwibWluTnVtYmVyRXhjbHVzaXZlIiwibWF4TnVtYmVyRXhjbHVzaXZlIiwibWluRGF0ZSIsIm1heERhdGUiLCJiYWREYXRlIiwibWluQ291bnQiLCJtYXhDb3VudCIsIm5vRGVjaW1hbCIsIm5vdEFsbG93ZWQiLCJleHBlY3RlZFR5cGUiLCJyZWdFeHAiLCJtc2dPYmoiLCJ0b1N0cmluZyIsInJlZ0V4cE1lc3NhZ2UiLCJrZXlOb3RJblNjaGVtYSIsImFwcGVuZEFmZmVjdGVkS2V5IiwiZ2V0UGFyZW50T2ZLZXkiLCJpc09iamVjdFdlU2hvdWxkVHJhdmVyc2UiLCJyZXF1aXJlZFZhbGlkYXRvciIsImFsbG93ZWRWYWx1ZXNWYWxpZGF0b3IiLCJzaG91bGRDaGVjayIsImdldEZpZWxkSW5mbyIsImtleUluZm8iLCJnZXRJbmZvRm9yS2V5IiwiYWZmZWN0ZWRLZXkiLCJhZmZlY3RlZEtleUdlbmVyaWMiLCJpc0luQXJyYXlJdGVtT2JqZWN0IiwiaXNJblN1Yk9iamVjdCIsImZpZWxkUGFyZW50TmFtZVdpdGhFbmREb3QiLCJmaWVsZFBhcmVudE5hbWUiLCJmaWVsZFZhbGlkYXRpb25FcnJvcnMiLCJ2YWxpZGF0b3JDb250ZXh0IiwiZmllbGQiLCJmTmFtZSIsInNpYmxpbmdGaWVsZCIsImJ1aWx0SW5WYWxpZGF0b3JzIiwidmFsaWRhdG9ycyIsImZpZWxkSXNWYWxpZCIsImZpbmFsVmFsaWRhdG9yQ29udGV4dCIsImZpZWxkVmFsaWRhdG9ycyIsImN1c3RvbSIsInNwbGljZSIsImV2ZXJ5IiwiY2hlY2tPYmoiLCJzaG91bGRWYWxpZGF0ZUtleSIsImtleVRvVmFsaWRhdGUiLCJmdW5jdGlvbnNDb250ZXh0IiwiY2hpbGRLZXlzIiwiaSIsInByZXNlbnRLZXlzIiwiY2hlY2tlZEtleXMiLCJjaGVja01vZGlmaWVyIiwibW9kIiwib3BPYmoiLCIkZWFjaCIsImRvY1ZhbGlkYXRvcnMiLCJkb2NWYWxpZGF0b3JDb250ZXh0IiwiYWRkZWRGaWVsZE5hbWVzIiwiZXJyT2JqIiwic2NoZW1hQ2xvbmUiLCJpdGVtS2V5IiwiY2FwaXRhbGl6ZSIsInRleHQiLCJ0b1VwcGVyQ2FzZSIsInN1YnN0ciIsInRvTG93ZXJDYXNlIiwidW5kZXJzY29yZSIsImV4dG5hbWUiLCJleHQiLCJzdWJzdHJpbmciLCJyeERvbWFpbiIsInJ4TmFtZURvbWFpbiIsInJ4SVB2NCIsInJ4SVB2NiIsInJ4V2Vha0RvbWFpbiIsImpvaW4iLCJpc1ZhbGlkQm91bmQiLCJsb3dlciIsImlzU2FmZUludGVnZXIiLCJpZE9mTGVuZ3RoIiwibWluIiwibWF4IiwiYm91bmRzIiwiQXV0b1ZhbHVlUnVubmVyIiwiZG9uZUtleXMiLCJydW5Gb3JQb3NpdGlvbiIsImV4dGVuZGVkQXV0b1ZhbHVlQ29udGV4dCIsInBhcmVudEZpZWxkSW5mbyIsImRvVW5zZXQiLCJpc05hTiIsInVuc2V0IiwiZ2V0T2JqZWN0IiwibmV3VmFsdWUiLCJhdk9wZXJhdG9yIiwiYXZQcm9wIiwibnVtYmVyVmFsIiwicGFyc2VkRGF0ZSIsInBhcnNlIiwiZ2V0UG9zaXRpb25zRm9yQXV0b1ZhbHVlIiwiZ2V0TGFzdFBhcnRPZktleSIsInBvc2l0aW9ucyIsImdldFBvc2l0aW9uc0luZm9Gb3JHZW5lcmljS2V5IiwiZ2V0UG9zaXRpb25zVGhhdENyZWF0ZUdlbmVyaWNLZXkiLCJwYXJlbnRQYXRoIiwibGFzdFBhcnQiLCJsYXN0UGFydFdpdGhCcmFjZXMiLCJwYXJlbnRQb3NpdGlvbnMiLCJjaGlsZFBvc2l0aW9uIiwid291bGRCZVBvc2l0aW9uIiwibmV4dCIsIm5leHRQaWVjZXMiLCJuZXdQaWVjZXMiLCJzaGlmdCIsImxhc3RQYXJ0MiIsImxhc3RQYXJ0V2l0aEJyYWNlczIiLCJfcG9zaXRpb25Ub0tleSIsInNvcnRBdXRvVmFsdWVGdW5jdGlvbnMiLCJkZWZhdWx0RmllbGRPcmRlciIsImFjYyIsInNvcnQiLCJhIiwiYiIsImRlcHRoRGlmZiIsInNvcnRlZEF1dG9WYWx1ZUZ1bmN0aW9ucyIsImF2UnVubmVyIiwiYmluZCIsImRhdGVUb0RhdGVTdHJpbmciLCJkYXRlIiwibSIsImdldFVUQ01vbnRoIiwiZCIsImdldFVUQ0RhdGUiLCJnZXRVVENGdWxsWWVhciIsImxvb3BGdW5jIiwibGFzdERvdCIsImdldEtleXNXaXRoVmFsdWVJbk9iaiIsIm1hdGNoS2V5Iiwia2V5c1dpdGhWYWx1ZSIsImtleUFkanVzdCIsIm1hdGNoS2V5UGx1c0RvdCIsImFuY2VzdG9yS2V5Iiwic3RhcnRTdHJpbmciLCJ3aXRoRW5kRG90IiwiSW50OEFycmF5IiwiVWludDhBcnJheSIsIlVpbnQ4Q2xhbXBlZEFycmF5IiwiSW50MTZBcnJheSIsIlVpbnQxNkFycmF5IiwiSW50MzJBcnJheSIsIlVpbnQzMkFycmF5IiwiRmxvYXQzMkFycmF5IiwiRmxvYXQ2NEFycmF5IiwiZGVzdGluYXRpb24iLCJzb3VyY2VzIiwic291cmNlIiwiaXNBbGxvd2VkIiwia2V5c1dpdGhWYWx1ZUluU2V0IiwiJHNldCIsImtleXNXaXRoVmFsdWVJblNldE9uSW5zZXJ0IiwiZmllbGRJbmZvIiwiZG9BcnJheUNoZWNrcyIsImtleVZhbHVlIiwiZGF0YVR5cGUiLCJkb0RhdGVDaGVja3MiLCJnZXRUaW1lIiwiZG9OdW1iZXJDaGVja3MiLCJpc0ludGVnZXIiLCJpc0Zpbml0ZSIsIk1hdGgiLCJmbG9vciIsImV4cGVjdHNJbnRlZ2VyIiwiZXhjbHVzaXZlTWF4IiwiZXhjbHVzaXZlTWluIiwiZG9TdHJpbmdDaGVja3MiLCJza2lwUmVnRXhDaGVja0ZvckVtcHR5U3RyaW5ncyIsInRlc3QiLCJyZWdFeEVycm9yIiwicmUiLCJTeW1ib2wiLCJpdGVyYXRvciIsIkZ1bmN0aW9uIiwiZGF0ZVR5cGVJc09rYXkiLCJKU09OIiwic3RyaW5naWZ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLElBQUlBLFlBQVksRUFBQ0MsaUJBQWlCO0lBQUNDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLGdCQUFnQixFQUFDO01BQUNILFlBQVlBLENBQUNJLENBQUMsRUFBQztRQUFDSixZQUFZLEdBQUNJLENBQUM7TUFBQSxDQUFDO01BQUNILGlCQUFpQkEsQ0FBQ0csQ0FBQyxFQUFDO1FBQUNILGlCQUFpQixHQUFDRyxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUNGLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUFDLElBQUlFLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBR2xPTCxZQUFZLENBQUNDLGlCQUFpQixHQUFHQSxpQkFBaUI7SUFIbERDLE1BQU0sQ0FBQ0ksYUFBYSxDQUtMTixZQUxTLENBQUM7SUFBQ08sc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7SUNBMUIsSUFBSUMsd0JBQXdCO0lBQUNULE1BQU0sQ0FBQ0MsSUFBSSxD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QUt4UixJQUFJLEVBQUU7VUFDekI7VUFDQSxJQUFJeVAsRUFBRSxLQUFLLGNBQWMsRUFBRTtZQUN6QixPQUFPeUwsWUFBWSxDQUFDcmUsR0FBRyxFQUFFLElBQUltRCxJQUFJLENBQUMsQ0FBQyxDQUFDO1VBQ3RDO1VBQ0EsT0FBT2tiLFlBQVksQ0FBQ3JlLEdBQUcsRUFBRW1lLFFBQVEsQ0FBQztRQUNwQztNQUNGO0lBQ0Y7SUFBQ3hoQixzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHIiwiZmlsZSI6Ii9wYWNrYWdlcy9hbGRlZWRfc2ltcGxlLXNjaGVtYS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNpbXBsZVNjaGVtYSwgVmFsaWRhdGlvbkNvbnRleHQgfSBmcm9tICcuL1NpbXBsZVNjaGVtYSc7XG5pbXBvcnQgJy4vY2xlYW4nO1xuXG5TaW1wbGVTY2hlbWEuVmFsaWRhdGlvbkNvbnRleHQgPSBWYWxpZGF0aW9uQ29udGV4dDtcblxuZXhwb3J0IGRlZmF1bHQgU2ltcGxlU2NoZW1hO1xuIiwiLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbmltcG9ydCBjbG9uZSBmcm9tICdjbG9uZSc7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tICdtZXNzYWdlLWJveCc7XG5pbXBvcnQgTW9uZ29PYmplY3QgZnJvbSAnbW9uZ28tb2JqZWN0JztcbmltcG9ydCBodW1hbml6ZSBmcm9tICcuL2h1bWFuaXplJztcbmltcG9ydCBWYWxpZGF0aW9uQ29udGV4dCBmcm9tICcuL1ZhbGlkYXRpb25Db250ZXh0JztcbmltcG9ydCBTaW1wbGVTY2hlbWFHcm91cCBmcm9tICcuL1NpbXBsZVNjaGVtYUdyb3VwJztcbmltcG9ydCByZWdFeHBPYmogZnJvbSAnLi9yZWdFeHAnO1xuaW1wb3J0IGNsZWFuIGZyb20gJy4vY2xlYW4nO1xuaW1wb3J0IGV4cGFuZFNob3J0aGFuZCBmcm9tICcuL2V4cGFuZFNob3J0aGFuZCc7XG5pbXBvcnQgeyBmb3JFYWNoS2V5QW5jZXN0b3IsIGlzRW1wdHlPYmplY3QsIG1lcmdlIH0gZnJvbSAnLi91dGlsaXR5JztcbmltcG9ydCBkZWZhdWx0TWVzc2FnZXMgZnJvbSAnLi9kZWZhdWx0TWVzc2FnZXMnO1xuXG4vLyBFeHBvcnRlZCBmb3IgdGVzdHNcbmV4cG9ydCBjb25zdCBzY2hlbWFEZWZpbml0aW9uT3B0aW9ucyA9IFtcbiAgJ2F1dG9WYWx1ZScsXG4gICdkZWZhdWx0VmFsdWUnLFxuICAnbGFiZWwnLFxuICAnb3B0aW9uYWwnLFxuICAncmVxdWlyZWQnLFxuICAndHlwZScsXG5dO1xuXG5jb25zdCBvbmVPZlByb3BzID0gW1xuICAnYWxsb3dlZFZhbHVlcycsXG4gICdibGFja2JveCcsXG4gICdjdXN0b20nLFxuICAnZXhjbHVzaXZlTWF4JyxcbiAgJ2V4Y2x1c2l2ZU1pbicsXG4gICdtYXgnLFxuICAnbWF4Q291bnQnLFxuICAnbWluJyxcbiAgJ21pbkNvdW50JyxcbiAgJ3JlZ0V4JyxcbiAgJ3NraXBSZWdFeENoZWNrRm9yRW1wdHlTdHJpbmdzJyxcbiAgJ3RyaW0nLFxuICAndHlwZScsXG5dO1xuXG5jb25zdCBwcm9wc1RoYXRDYW5CZUZ1bmN0aW9uID0gW1xuICAnYWxsb3dlZFZhbHVlcycsXG4gICdleGNsdXNpdmVNYXgnLFxuICAnZXhjbHVzaXZlTWluJyxcbiAgJ2xhYmVsJyxcbiAgJ21heCcsXG4gICdtYXhDb3VudCcsXG4gICdtaW4nLFxuICAnbWluQ291bnQnLFxuICAnb3B0aW9uYWwnLFxuICAncmVnRXgnLFxuICAnc2tpcFJlZ0V4Q2hlY2tGb3JFbXB0eVN0cmluZ3MnLFxuXTtcblxuY2xhc3MgU2ltcGxlU2NoZW1hIHtcbiAgY29uc3RydWN0b3Ioc2NoZW1hID0ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgIC8vIFN0YXNoIHRoZSBvcHRpb25zIG9iamVjdFxuICAgIHRoaXMuX2NvbnN0cnVjdG9yT3B0aW9ucyA9IHtcbiAgICAgIC4uLlNpbXBsZVNjaGVtYS5fY29uc3RydWN0b3JPcHRpb25EZWZhdWx0cyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfTtcbiAgICBkZWxldGUgdGhpcy5fY29uc3RydWN0b3JPcHRpb25zLmNsZWFuOyAvLyBzdG9yZWQgc2VwYXJhdGVseSBiZWxvd1xuXG4gICAgLy8gU2NoZW1hLWxldmVsIGRlZmF1bHRzIGZvciBjbGVhbmluZ1xuICAgIHRoaXMuX2NsZWFuT3B0aW9ucyA9IHtcbiAgICAgIC4uLlNpbXBsZVNjaGVtYS5fY29uc3RydWN0b3JPcHRpb25EZWZhdWx0cy5jbGVhbixcbiAgICAgIC4uLihvcHRpb25zLmNsZWFuIHx8IHt9KSxcbiAgICB9O1xuXG4gICAgLy8gQ3VzdG9tIHZhbGlkYXRvcnMgZm9yIHRoaXMgaW5zdGFuY2VcbiAgICB0aGlzLl92YWxpZGF0b3JzID0gW107XG4gICAgdGhpcy5fZG9jVmFsaWRhdG9ycyA9IFtdO1xuXG4gICAgLy8gTmFtZWQgdmFsaWRhdGlvbiBjb250ZXh0c1xuICAgIHRoaXMuX3ZhbGlkYXRpb25Db250ZXh0cyA9IHt9O1xuXG4gICAgLy8gQ2xvbmUsIGV4cGFuZGluZyBzaG9ydGhhbmQsIGFuZCBzdG9yZSB0aGUgc2NoZW1hIG9iamVjdCBpbiB0aGlzLl9zY2hlbWFcbiAgICB0aGlzLl9zY2hlbWEgPSB7fTtcbiAgICB0aGlzLl9kZXBzTGFiZWxzID0ge307XG4gICAgdGhpcy5leHRlbmQoc2NoZW1hKTtcblxuICAgIC8vIENsb25lIHJhdyBkZWZpbml0aW9uIGFuZCBzYXZlIGlmIGtlZXBSYXdEZWZpbml0aW9uIGlzIGFjdGl2ZVxuICAgIHRoaXMuX3Jhd0RlZmluaXRpb24gPSB0aGlzLl9jb25zdHJ1Y3Rvck9wdGlvbnMua2VlcFJhd0RlZmluaXRpb24gPyBzY2hlbWEgOiBudWxsO1xuXG4gICAgLy8gRGVmaW5lIGRlZmF1bHQgdmFsaWRhdGlvbiBlcnJvciBtZXNzYWdlc1xuICAgIHRoaXMubWVzc2FnZUJveCA9IG5ldyBNZXNzYWdlQm94KGNsb25lKGRlZmF1bHRNZXNzYWdlcykpO1xuXG4gICAgdGhpcy52ZXJzaW9uID0gU2ltcGxlU2NoZW1hLnZlcnNpb247XG4gIH1cblxuICAvKipcbiAgLyogQHJldHVybnMge09iamVjdH0gVGhlIGVudGlyZSByYXcgc2NoZW1hIGRlZmluaXRpb24gcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3RvclxuICAqL1xuICBnZXQgcmF3RGVmaW5pdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fcmF3RGVmaW5pdGlvbjtcbiAgfVxuXG4gIGZvckVhY2hBbmNlc3RvclNpbXBsZVNjaGVtYShrZXksIGZ1bmMpIHtcbiAgICBjb25zdCBnZW5lcmljS2V5ID0gTW9uZ29PYmplY3QubWFrZUtleUdlbmVyaWMoa2V5KTtcblxuICAgIGZvckVhY2hLZXlBbmNlc3RvcihnZW5lcmljS2V5LCAoYW5jZXN0b3IpID0+IHtcbiAgICAgIGNvbnN0IGRlZiA9IHRoaXMuX3NjaGVtYVthbmNlc3Rvcl07XG4gICAgICBpZiAoIWRlZikgcmV0dXJuO1xuICAgICAgZGVmLnR5cGUuZGVmaW5pdGlvbnMuZm9yRWFjaCgodHlwZURlZikgPT4ge1xuICAgICAgICBpZiAoU2ltcGxlU2NoZW1hLmlzU2ltcGxlU2NoZW1hKHR5cGVEZWYudHlwZSkpIHtcbiAgICAgICAgICBmdW5jKHR5cGVEZWYudHlwZSwgYW5jZXN0b3IsIGdlbmVyaWNLZXkuc2xpY2UoYW5jZXN0b3IubGVuZ3RoICsgMSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIG9iaiBpcyBhIFNpbXBsZVNjaGVtYSBvYmplY3QuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqXSBBbiBvYmplY3QgdG8gdGVzdFxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgZ2l2ZW4gb2JqZWN0IGFwcGVhcnMgdG8gYmUgYSBTaW1wbGVTY2hlbWEgaW5zdGFuY2VcbiAgICovXG4gIHN0YXRpYyBpc1NpbXBsZVNjaGVtYShvYmopIHtcbiAgICByZXR1cm4gKG9iaiAmJiAob2JqIGluc3RhbmNlb2YgU2ltcGxlU2NoZW1hIHx8IG9iai5fc2NoZW1hKSk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIE1ldGVvciBhcHBzLCBhZGQgYSByZWFjdGl2ZSBkZXBlbmRlbmN5IG9uIHRoZSBsYWJlbFxuICAgKiBmb3IgYSBrZXkuXG4gICAqL1xuICByZWFjdGl2ZUxhYmVsRGVwZW5kZW5jeShrZXksIHRyYWNrZXIgPSB0aGlzLl9jb25zdHJ1Y3Rvck9wdGlvbnMudHJhY2tlcikge1xuICAgIGlmICgha2V5IHx8ICF0cmFja2VyKSByZXR1cm47XG5cbiAgICBjb25zdCBnZW5lcmljS2V5ID0gTW9uZ29PYmplY3QubWFrZUtleUdlbmVyaWMoa2V5KTtcblxuICAgIC8vIElmIGluIHRoaXMgc2NoZW1hXG4gICAgaWYgKHRoaXMuX3NjaGVtYVtnZW5lcmljS2V5XSkge1xuICAgICAgaWYgKCF0aGlzLl9kZXBzTGFiZWxzW2dlbmVyaWNLZXldKSB7XG4gICAgICAgIHRoaXMuX2RlcHNMYWJlbHNbZ2VuZXJpY0tleV0gPSBuZXcgdHJhY2tlci5EZXBlbmRlbmN5KCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9kZXBzTGFiZWxzW2dlbmVyaWNLZXldLmRlcGVuZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIGluIHN1YnNjaGVtYVxuICAgIHRoaXMuZm9yRWFjaEFuY2VzdG9yU2ltcGxlU2NoZW1hKGtleSwgKHNpbXBsZVNjaGVtYSwgYW5jZXN0b3IsIHN1YlNjaGVtYUtleSkgPT4ge1xuICAgICAgLy8gUGFzcyB0cmFja2VyIGRvd24gc28gdGhhdCB3ZSBnZXQgcmVhY3Rpdml0eSBldmVuIGlmIHRoZSBzdWJzY2hlbWFcbiAgICAgIC8vIGRpZG4ndCBoYXZlIHRyYWNrZXIgb3B0aW9uIHNldFxuICAgICAgc2ltcGxlU2NoZW1hLnJlYWN0aXZlTGFiZWxEZXBlbmRlbmN5KHN1YlNjaGVtYUtleSwgdHJhY2tlcik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleSBPbmUgc3BlY2lmaWMgb3IgZ2VuZXJpYyBrZXkgZm9yIHdoaWNoIHRvIGdldCB0aGUgc2NoZW1hLlxuICAgKiBAcmV0dXJucyB7W1NpbXBsZVNjaGVtYSwgU3RyaW5nXX0gUmV0dXJucyBhIDItdHVwbGUuXG4gICAqXG4gICAqICAgRmlyc3QgaXRlbTogVGhlIFNpbXBsZVNjaGVtYSBpbnN0YW5jZSB0aGF0IGFjdHVhbGx5IGRlZmluZXMgdGhlIGdpdmVuIGtleS5cbiAgICpcbiAgICogICBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgc2V2ZXJhbCBuZXN0ZWQgb2JqZWN0cywgZWFjaCB0aGVpciBvd24gU2ltcGxlU2NoZW1hXG4gICAqICAgaW5zdGFuY2UsIGFuZCB5b3UgcGFzcyBpbiAnb3V0ZXJPYmouaW5uZXJPYmouaW5uZXJlc3RPYmoubmFtZScgYXMgdGhlIGtleSwgeW91J2xsXG4gICAqICAgZ2V0IGJhY2sgdGhlIFNpbXBsZVNjaGVtYSBpbnN0YW5jZSBmb3IgYG91dGVyT2JqLmlubmVyT2JqLmlubmVyZXN0T2JqYCBrZXkuXG4gICAqXG4gICAqICAgQnV0IGlmIHlvdSBwYXNzIGluICdvdXRlck9iai5pbm5lck9iai5pbm5lcmVzdE9iai5uYW1lJyBhcyB0aGUga2V5IGFuZCB0aGF0IGtleSBpc1xuICAgKiAgIGRlZmluZWQgaW4gdGhlIG1haW4gc2NoZW1hIHdpdGhvdXQgdXNlIG9mIHN1YnNjaGVtYXMsIHRoZW4geW91J2xsIGdldCBiYWNrIHRoZSBtYWluIHNjaGVtYS5cbiAgICpcbiAgICogICBTZWNvbmQgaXRlbTogVGhlIHBhcnQgb2YgdGhlIGtleSB0aGF0IGlzIGluIHRoZSBmb3VuZCBzY2hlbWEuXG4gICAqXG4gICAqICAgQWx3YXlzIHJldHVybnMgYSB0dXBsZSAoYXJyYXkpIGJ1dCB0aGUgdmFsdWVzIG1heSBiZSBgbnVsbGAuXG4gICAqL1xuICBuZWFyZXN0U2ltcGxlU2NoZW1hSW5zdGFuY2Uoa2V5KSB7XG4gICAgaWYgKCFrZXkpIHJldHVybiBbbnVsbCwgbnVsbF07XG5cbiAgICBjb25zdCBnZW5lcmljS2V5ID0gTW9uZ29PYmplY3QubWFrZUtleUdlbmVyaWMoa2V5KTtcbiAgICBpZiAodGhpcy5fc2NoZW1hW2dlbmVyaWNLZXldKSByZXR1cm4gW3RoaXMsIGdlbmVyaWNLZXldO1xuXG4gICAgLy8gSWYgbm90IGRlZmluZWQgaW4gdGhpcyBzY2hlbWEsIHNlZSBpZiBpdCdzIGRlZmluZWQgaW4gYSBzdWJzY2hlbWFcbiAgICBsZXQgaW5uZXJLZXk7XG4gICAgbGV0IG5lYXJlc3RTaW1wbGVTY2hlbWFJbnN0YW5jZTtcbiAgICB0aGlzLmZvckVhY2hBbmNlc3RvclNpbXBsZVNjaGVtYShrZXksIChzaW1wbGVTY2hlbWEsIGFuY2VzdG9yLCBzdWJTY2hlbWFLZXkpID0+IHtcbiAgICAgIGlmICghbmVhcmVzdFNpbXBsZVNjaGVtYUluc3RhbmNlICYmIHNpbXBsZVNjaGVtYS5fc2NoZW1hW3N1YlNjaGVtYUtleV0pIHtcbiAgICAgICAgbmVhcmVzdFNpbXBsZVNjaGVtYUluc3RhbmNlID0gc2ltcGxlU2NoZW1hO1xuICAgICAgICBpbm5lcktleSA9IHN1YlNjaGVtYUtleTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBpbm5lcktleSA/IFtuZWFyZXN0U2ltcGxlU2NoZW1hSW5zdGFuY2UsIGlubmVyS2V5XSA6IFtudWxsLCBudWxsXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW2tleV0gT25lIHNwZWNpZmljIG9yIGdlbmVyaWMga2V5IGZvciB3aGljaCB0byBnZXQgdGhlIHNjaGVtYS5cbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGVudGlyZSBzY2hlbWEgb2JqZWN0IG9yIGp1c3QgdGhlIGRlZmluaXRpb24gZm9yIG9uZSBrZXkuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB0aGlzIHJldHVybnMgdGhlIHJhdywgdW5ldmFsdWF0ZWQgZGVmaW5pdGlvbiBvYmplY3QuIFVzZSBgZ2V0RGVmaW5pdGlvbmBcbiAgICogaWYgeW91IHdhbnQgdGhlIGV2YWx1YXRlZCBkZWZpbml0aW9uLCB3aGVyZSBhbnkgcHJvcGVydGllcyB0aGF0IGFyZSBmdW5jdGlvbnNcbiAgICogaGF2ZSBiZWVuIHJ1biB0byBwcm9kdWNlIGEgcmVzdWx0LlxuICAgKi9cbiAgc2NoZW1hKGtleSkge1xuICAgIGlmICgha2V5KSByZXR1cm4gdGhpcy5fc2NoZW1hO1xuXG4gICAgY29uc3QgZ2VuZXJpY0tleSA9IE1vbmdvT2JqZWN0Lm1ha2VLZXlHZW5lcmljKGtleSk7XG4gICAgbGV0IGtleVNjaGVtYSA9IHRoaXMuX3NjaGVtYVtnZW5lcmljS2V5XTtcblxuICAgIC8vIElmIG5vdCBkZWZpbmVkIGluIHRoaXMgc2NoZW1hLCBzZWUgaWYgaXQncyBkZWZpbmVkIGluIGEgc3Vic2NoZW1hXG4gICAgaWYgKCFrZXlTY2hlbWEpIHtcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgdGhpcy5mb3JFYWNoQW5jZXN0b3JTaW1wbGVTY2hlbWEoa2V5LCAoc2ltcGxlU2NoZW1hLCBhbmNlc3Rvciwgc3ViU2NoZW1hS2V5KSA9PiB7XG4gICAgICAgIGlmICghZm91bmQpIGtleVNjaGVtYSA9IHNpbXBsZVNjaGVtYS5zY2hlbWEoc3ViU2NoZW1hS2V5KTtcbiAgICAgICAgaWYgKGtleVNjaGVtYSkgZm91bmQgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleVNjaGVtYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgZW50aXJlIHNjaGVtYSBvYmplY3Qgd2l0aCBzdWJzY2hlbWFzIG1lcmdlZC4gVGhpcyBpcyB0aGVcbiAgICogZXF1aXZhbGVudCBvZiB3aGF0IHNjaGVtYSgpIHJldHVybmVkIGluIFNpbXBsZVNjaGVtYSA8IDIuMFxuICAgKlxuICAgKiBOb3RlIHRoYXQgdGhpcyByZXR1cm5zIHRoZSByYXcsIHVuZXZhbHVhdGVkIGRlZmluaXRpb24gb2JqZWN0LiBVc2UgYGdldERlZmluaXRpb25gXG4gICAqIGlmIHlvdSB3YW50IHRoZSBldmFsdWF0ZWQgZGVmaW5pdGlvbiwgd2hlcmUgYW55IHByb3BlcnRpZXMgdGhhdCBhcmUgZnVuY3Rpb25zXG4gICAqIGhhdmUgYmVlbiBydW4gdG8gcHJvZHVjZSBhIHJlc3VsdC5cbiAgICovXG4gIG1lcmdlZFNjaGVtYSgpIHtcbiAgICBjb25zdCBtZXJnZWRTY2hlbWEgPSB7fTtcblxuICAgIHRoaXMuX3NjaGVtYUtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBjb25zdCBrZXlTY2hlbWEgPSB0aGlzLl9zY2hlbWFba2V5XTtcbiAgICAgIG1lcmdlZFNjaGVtYVtrZXldID0ga2V5U2NoZW1hO1xuXG4gICAgICBrZXlTY2hlbWEudHlwZS5kZWZpbml0aW9ucy5mb3JFYWNoKCh0eXBlRGVmKSA9PiB7XG4gICAgICAgIGlmICghKFNpbXBsZVNjaGVtYS5pc1NpbXBsZVNjaGVtYSh0eXBlRGVmLnR5cGUpKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBjaGlsZFNjaGVtYSA9IHR5cGVEZWYudHlwZS5tZXJnZWRTY2hlbWEoKTtcbiAgICAgICAgT2JqZWN0LmtleXMoY2hpbGRTY2hlbWEpLmZvckVhY2goKHN1YktleSkgPT4ge1xuICAgICAgICAgIG1lcmdlZFNjaGVtYVtgJHtrZXl9LiR7c3ViS2V5fWBdID0gY2hpbGRTY2hlbWFbc3ViS2V5XTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBtZXJnZWRTY2hlbWE7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZXZhbHVhdGVkIGRlZmluaXRpb24gZm9yIG9uZSBrZXkgaW4gdGhlIHNjaGVtYVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5IEdlbmVyaWMgb3Igc3BlY2lmaWMgc2NoZW1hIGtleVxuICAgKiBAcGFyYW0ge0FycmF5KFN0cmluZyl9IFtwcm9wTGlzdF0gQXJyYXkgb2Ygc2NoZW1hIHByb3BlcnRpZXMgeW91IG5lZWQ7IHBlcmZvcm1hbmNlIG9wdGltaXphdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gW2Z1bmN0aW9uQ29udGV4dF0gVGhlIGNvbnRleHQgdG8gdXNlIHdoZW4gZXZhbHVhdGluZyBzY2hlbWEgb3B0aW9ucyB0aGF0IGFyZSBmdW5jdGlvbnNcbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIHNjaGVtYSBkZWZpbml0aW9uIGZvciB0aGUgcmVxdWVzdGVkIGtleVxuICAgKi9cbiAgZ2V0RGVmaW5pdGlvbihrZXksIHByb3BMaXN0LCBmdW5jdGlvbkNvbnRleHQgPSB7fSkge1xuICAgIGNvbnN0IGRlZnMgPSB0aGlzLnNjaGVtYShrZXkpO1xuICAgIGlmICghZGVmcykgcmV0dXJuO1xuXG4gICAgY29uc3QgZ2V0UHJvcEl0ZXJhdG9yID0gKG9iaiwgbmV3T2JqKSA9PiB7XG4gICAgICByZXR1cm4gKHByb3ApID0+IHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocHJvcExpc3QpICYmICFwcm9wTGlzdC5pbmNsdWRlcyhwcm9wKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB2YWwgPSBvYmpbcHJvcF07XG4gICAgICAgIC8vIEZvciBhbnkgb3B0aW9ucyB0aGF0IHN1cHBvcnQgc3BlY2lmeWluZyBhIGZ1bmN0aW9uLCBldmFsdWF0ZSB0aGUgZnVuY3Rpb25zXG4gICAgICAgIGlmIChwcm9wc1RoYXRDYW5CZUZ1bmN0aW9uLmluZGV4T2YocHJvcCkgPiAtMSAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgbmV3T2JqW3Byb3BdID0gdmFsLmNhbGwoe1xuICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgLi4uZnVuY3Rpb25Db250ZXh0LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIEluZmxlY3QgbGFiZWwgaWYgdW5kZWZpbmVkXG4gICAgICAgICAgaWYgKHByb3AgPT09ICdsYWJlbCcgJiYgdHlwZW9mIG5ld09ialtwcm9wXSAhPT0gJ3N0cmluZycpIG5ld09ialtwcm9wXSA9IGluZmxlY3RlZExhYmVsKGtleSwgdGhpcy5fY29uc3RydWN0b3JPcHRpb25zLmh1bWFuaXplQXV0b0xhYmVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3T2JqW3Byb3BdID0gdmFsO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhkZWZzKS5mb3JFYWNoKGdldFByb3BJdGVyYXRvcihkZWZzLCByZXN1bHQpKTtcblxuICAgIC8vIFJlc29sdmUgYWxsIHRoZSB0eXBlcyBhbmQgY29udmVydCB0byBhIG5vcm1hbCBhcnJheSB0byBtYWtlIGl0IGVhc2llclxuICAgIC8vIHRvIHVzZS5cbiAgICBpZiAoZGVmcy50eXBlKSB7XG4gICAgICByZXN1bHQudHlwZSA9IGRlZnMudHlwZS5kZWZpbml0aW9ucy5tYXAoKHR5cGVEZWYpID0+IHtcbiAgICAgICAgY29uc3QgbmV3VHlwZURlZiA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyh0eXBlRGVmKS5mb3JFYWNoKGdldFByb3BJdGVyYXRvcih0eXBlRGVmLCBuZXdUeXBlRGVmKSk7XG4gICAgICAgIHJldHVybiBuZXdUeXBlRGVmO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGlkZW50aWZ5aW5nIHRoZSBiZXN0IGd1ZXNzIGRhdGEgdHlwZSBmb3IgYSBrZXkuIEZvciBrZXlzXG4gICAqIHRoYXQgYWxsb3cgbXVsdGlwbGUgdHlwZXMsIHRoZSBmaXJzdCB0eXBlIGlzIHVzZWQuIFRoaXMgY2FuIGJlIHVzZWZ1bCBmb3JcbiAgICogYnVpbGRpbmcgZm9ybXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgR2VuZXJpYyBvciBzcGVjaWZpYyBzY2hlbWEga2V5XG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IEEgdHlwZSBzdHJpbmcuIE9uZSBvZjpcbiAgICogIHN0cmluZywgbnVtYmVyLCBib29sZWFuLCBkYXRlLCBvYmplY3QsIHN0cmluZ0FycmF5LCBudW1iZXJBcnJheSwgYm9vbGVhbkFycmF5LFxuICAgKiAgZGF0ZUFycmF5LCBvYmplY3RBcnJheVxuICAgKi9cbiAgZ2V0UXVpY2tUeXBlRm9yS2V5KGtleSkge1xuICAgIGxldCB0eXBlO1xuXG4gICAgY29uc3QgZmllbGRTY2hlbWEgPSB0aGlzLnNjaGVtYShrZXkpO1xuICAgIGlmICghZmllbGRTY2hlbWEpIHJldHVybjtcblxuICAgIGNvbnN0IGZpZWxkVHlwZSA9IGZpZWxkU2NoZW1hLnR5cGUuc2luZ2xlVHlwZTtcblxuICAgIGlmIChmaWVsZFR5cGUgPT09IFN0cmluZykge1xuICAgICAgdHlwZSA9ICdzdHJpbmcnO1xuICAgIH0gZWxzZSBpZiAoZmllbGRUeXBlID09PSBOdW1iZXIgfHwgZmllbGRUeXBlID09PSBTaW1wbGVTY2hlbWEuSW50ZWdlcikge1xuICAgICAgdHlwZSA9ICdudW1iZXInO1xuICAgIH0gZWxzZSBpZiAoZmllbGRUeXBlID09PSBCb29sZWFuKSB7XG4gICAgICB0eXBlID0gJ2Jvb2xlYW4nO1xuICAgIH0gZWxzZSBpZiAoZmllbGRUeXBlID09PSBEYXRlKSB7XG4gICAgICB0eXBlID0gJ2RhdGUnO1xuICAgIH0gZWxzZSBpZiAoZmllbGRUeXBlID09PSBBcnJheSkge1xuICAgICAgY29uc3QgYXJyYXlJdGVtRmllbGRTY2hlbWEgPSB0aGlzLnNjaGVtYShgJHtrZXl9LiRgKTtcbiAgICAgIGlmICghYXJyYXlJdGVtRmllbGRTY2hlbWEpIHJldHVybjtcblxuICAgICAgY29uc3QgYXJyYXlJdGVtRmllbGRUeXBlID0gYXJyYXlJdGVtRmllbGRTY2hlbWEudHlwZS5zaW5nbGVUeXBlO1xuICAgICAgaWYgKGFycmF5SXRlbUZpZWxkVHlwZSA9PT0gU3RyaW5nKSB7XG4gICAgICAgIHR5cGUgPSAnc3RyaW5nQXJyYXknO1xuICAgICAgfSBlbHNlIGlmIChhcnJheUl0ZW1GaWVsZFR5cGUgPT09IE51bWJlciB8fCBhcnJheUl0ZW1GaWVsZFR5cGUgPT09IFNpbXBsZVNjaGVtYS5JbnRlZ2VyKSB7XG4gICAgICAgIHR5cGUgPSAnbnVtYmVyQXJyYXknO1xuICAgICAgfSBlbHNlIGlmIChhcnJheUl0ZW1GaWVsZFR5cGUgPT09IEJvb2xlYW4pIHtcbiAgICAgICAgdHlwZSA9ICdib29sZWFuQXJyYXknO1xuICAgICAgfSBlbHNlIGlmIChhcnJheUl0ZW1GaWVsZFR5cGUgPT09IERhdGUpIHtcbiAgICAgICAgdHlwZSA9ICdkYXRlQXJyYXknO1xuICAgICAgfSBlbHNlIGlmIChhcnJheUl0ZW1GaWVsZFR5cGUgPT09IE9iamVjdCB8fCBTaW1wbGVTY2hlbWEuaXNTaW1wbGVTY2hlbWEoYXJyYXlJdGVtRmllbGRUeXBlKSkge1xuICAgICAgICB0eXBlID0gJ29iamVjdEFycmF5JztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGZpZWxkVHlwZSA9PT0gT2JqZWN0KSB7XG4gICAgICB0eXBlID0gJ29iamVjdCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBrZXkgdGhhdCBpcyBhbiBPYmplY3QsIHJldHVybnMgYSBuZXcgU2ltcGxlU2NoZW1hIGluc3RhbmNlIHNjb3BlZCB0byB0aGF0IG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleSBHZW5lcmljIG9yIHNwZWNpZmljIHNjaGVtYSBrZXlcbiAgICovXG4gIGdldE9iamVjdFNjaGVtYShrZXkpIHtcbiAgICBjb25zdCBuZXdTY2hlbWFEZWYgPSB7fTtcbiAgICBjb25zdCBnZW5lcmljS2V5ID0gTW9uZ29PYmplY3QubWFrZUtleUdlbmVyaWMoa2V5KTtcbiAgICBjb25zdCBzZWFyY2hTdHJpbmcgPSBgJHtnZW5lcmljS2V5fS5gO1xuXG4gICAgY29uc3QgbWVyZ2VkU2NoZW1hID0gdGhpcy5tZXJnZWRTY2hlbWEoKTtcbiAgICBPYmplY3Qua2V5cyhtZXJnZWRTY2hlbWEpLmZvckVhY2goKGspID0+IHtcbiAgICAgIGlmIChrLmluZGV4T2Yoc2VhcmNoU3RyaW5nKSA9PT0gMCkge1xuICAgICAgICBuZXdTY2hlbWFEZWZbay5zbGljZShzZWFyY2hTdHJpbmcubGVuZ3RoKV0gPSBtZXJnZWRTY2hlbWFba107XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5fY29weVdpdGhTY2hlbWEobmV3U2NoZW1hRGVmKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHRoZSBhdXRvdmFsdWUgZnVuY3Rpb25zLCBpbmNsdWRpbmcgdGhvc2UgaW4gc3Vic2NoZW1hcyBhbGwgdGhlXG4gIC8vIHdheSBkb3duIHRoZSBzY2hlbWEgdHJlZVxuICBhdXRvVmFsdWVGdW5jdGlvbnMoKSB7XG4gICAgbGV0IHJlc3VsdCA9IFtdLmNvbmNhdCh0aGlzLl9hdXRvVmFsdWVzKTtcblxuICAgIHRoaXMuX3NjaGVtYUtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICB0aGlzLl9zY2hlbWFba2V5XS50eXBlLmRlZmluaXRpb25zLmZvckVhY2goKHR5cGVEZWYpID0+IHtcbiAgICAgICAgaWYgKCEoU2ltcGxlU2NoZW1hLmlzU2ltcGxlU2NoZW1hKHR5cGVEZWYudHlwZSkpKSByZXR1cm47XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodHlwZURlZi50eXBlLmF1dG9WYWx1ZUZ1bmN0aW9ucygpLm1hcCgoe1xuICAgICAgICAgIGZ1bmMsXG4gICAgICAgICAgZmllbGROYW1lLFxuICAgICAgICAgIGNsb3Nlc3RTdWJzY2hlbWFGaWVsZE5hbWUsXG4gICAgICAgIH0pID0+IHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZnVuYyxcbiAgICAgICAgICAgIGZpZWxkTmFtZTogYCR7a2V5fS4ke2ZpZWxkTmFtZX1gLFxuICAgICAgICAgICAgY2xvc2VzdFN1YnNjaGVtYUZpZWxkTmFtZTogY2xvc2VzdFN1YnNjaGVtYUZpZWxkTmFtZS5sZW5ndGggPyBgJHtrZXl9LiR7Y2xvc2VzdFN1YnNjaGVtYUZpZWxkTmFtZX1gIDoga2V5LFxuICAgICAgICAgIH07XG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHRoZSBibGFja2JveCBrZXlzLCBpbmNsdWRpbmcgdGhvc2UgaW4gc3Vic2NoZW1hc1xuICBibGFja2JveEtleXMoKSB7XG4gICAgY29uc3QgYmxhY2tib3hLZXlzID0gbmV3IFNldCh0aGlzLl9ibGFja2JveEtleXMpO1xuXG4gICAgdGhpcy5fc2NoZW1hS2V5cy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIHRoaXMuX3NjaGVtYVtrZXldLnR5cGUuZGVmaW5pdGlvbnMuZm9yRWFjaCgodHlwZURlZikgPT4ge1xuICAgICAgICBpZiAoIShTaW1wbGVTY2hlbWEuaXNTaW1wbGVTY2hlbWEodHlwZURlZi50eXBlKSkpIHJldHVybjtcbiAgICAgICAgdHlwZURlZi50eXBlLmJsYWNrYm94S2V5cygpLmZvckVhY2goKGJsYWNrYm94S2V5KSA9PiB7XG4gICAgICAgICAgYmxhY2tib3hLZXlzLmFkZChgJHtrZXl9LiR7YmxhY2tib3hLZXl9YCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbShibGFja2JveEtleXMpO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgdGhlIGtleSBpcyBhIG5lc3RlZCBkb3Qtc3ludGF4IGtleSBpbnNpZGUgb2YgYSBibGFja2JveCBvYmplY3RcbiAga2V5SXNJbkJsYWNrQm94KGtleSkge1xuICAgIGxldCBpc0luQmxhY2tCb3ggPSBmYWxzZTtcbiAgICBmb3JFYWNoS2V5QW5jZXN0b3IoTW9uZ29PYmplY3QubWFrZUtleUdlbmVyaWMoa2V5KSwgKGFuY2VzdG9yLCByZW1haW5kZXIpID0+IHtcbiAgICAgIGlmICh0aGlzLl9ibGFja2JveEtleXMuaGFzKGFuY2VzdG9yKSkge1xuICAgICAgICBpc0luQmxhY2tCb3ggPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdGVzdEtleVNjaGVtYSA9IHRoaXMuc2NoZW1hKGFuY2VzdG9yKTtcbiAgICAgICAgaWYgKHRlc3RLZXlTY2hlbWEpIHtcbiAgICAgICAgICB0ZXN0S2V5U2NoZW1hLnR5cGUuZGVmaW5pdGlvbnMuZm9yRWFjaCgodHlwZURlZikgPT4ge1xuICAgICAgICAgICAgaWYgKCEoU2ltcGxlU2NoZW1hLmlzU2ltcGxlU2NoZW1hKHR5cGVEZWYudHlwZSkpKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodHlwZURlZi50eXBlLmtleUlzSW5CbGFja0JveChyZW1haW5kZXIpKSBpc0luQmxhY2tCb3ggPSB0cnVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGlzSW5CbGFja0JveDtcbiAgfVxuXG4gIC8vIFJldHVybnMgdHJ1ZSBpZiBrZXkgaXMgZXhwbGljaXRseSBhbGxvd2VkIGJ5IHRoZSBzY2hlbWEgb3IgaW1wbGllZFxuICAvLyBieSBvdGhlciBleHBsaWNpdGx5IGFsbG93ZWQga2V5cy5cbiAgLy8gVGhlIGtleSBzdHJpbmcgc2hvdWxkIGhhdmUgJCBpbiBwbGFjZSBvZiBhbnkgbnVtZXJpYyBhcnJheSBwb3NpdGlvbnMuXG4gIGFsbG93c0tleShrZXkpIHtcbiAgICAvLyBMb29wIHRocm91Z2ggYWxsIGtleXMgaW4gdGhlIHNjaGVtYVxuICAgIHJldHVybiB0aGlzLl9zY2hlbWFLZXlzLnNvbWUoKGxvb3BLZXkpID0+IHtcbiAgICAgIC8vIElmIHRoZSBzY2hlbWEga2V5IGlzIHRoZSB0ZXN0IGtleSwgaXQncyBhbGxvd2VkLlxuICAgICAgaWYgKGxvb3BLZXkgPT09IGtleSkgcmV0dXJuIHRydWU7XG5cbiAgICAgIGNvbnN0IGZpZWxkU2NoZW1hID0gdGhpcy5zY2hlbWEobG9vcEtleSk7XG4gICAgICBjb25zdCBjb21wYXJlMSA9IGtleS5zbGljZSgwLCBsb29wS2V5Lmxlbmd0aCArIDIpO1xuICAgICAgY29uc3QgY29tcGFyZTIgPSBjb21wYXJlMS5zbGljZSgwLCAtMSk7XG5cbiAgICAgIC8vIEJsYWNrYm94IGFuZCBzdWJzY2hlbWEgY2hlY2tzIGFyZSBuZWVkZWQgb25seSBpZiBrZXkgc3RhcnRzIHdpdGhcbiAgICAgIC8vIGxvb3BLZXkgKyBhIGRvdFxuICAgICAgaWYgKGNvbXBhcmUyICE9PSBgJHtsb29wS2V5fS5gKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIEJsYWNrIGJveCBoYW5kbGluZ1xuICAgICAgaWYgKHRoaXMuX2JsYWNrYm94S2V5cy5oYXMobG9vcEtleSkpIHtcbiAgICAgICAgLy8gSWYgdGhlIHRlc3Qga2V5IGlzIHRoZSBibGFjayBib3gga2V5ICsgXCIuJFwiLCB0aGVuIHRoZSB0ZXN0XG4gICAgICAgIC8vIGtleSBpcyBOT1QgYWxsb3dlZCBiZWNhdXNlIGJsYWNrIGJveCBrZXlzIGFyZSBieSBkZWZpbml0aW9uXG4gICAgICAgIC8vIG9ubHkgZm9yIG9iamVjdHMsIGFuZCBub3QgZm9yIGFycmF5cy5cbiAgICAgICAgcmV0dXJuIGNvbXBhcmUxICE9PSBgJHtsb29wS2V5fS4kYDtcbiAgICAgIH1cblxuICAgICAgLy8gU3Vic2NoZW1hc1xuICAgICAgbGV0IGFsbG93ZWQgPSBmYWxzZTtcbiAgICAgIGNvbnN0IHN1YktleSA9IGtleS5zbGljZShsb29wS2V5Lmxlbmd0aCArIDEpO1xuICAgICAgZmllbGRTY2hlbWEudHlwZS5kZWZpbml0aW9ucy5mb3JFYWNoKCh0eXBlRGVmKSA9PiB7XG4gICAgICAgIGlmICghKFNpbXBsZVNjaGVtYS5pc1NpbXBsZVNjaGVtYSh0eXBlRGVmLnR5cGUpKSkgcmV0dXJuO1xuICAgICAgICBpZiAodHlwZURlZi50eXBlLmFsbG93c0tleShzdWJLZXkpKSBhbGxvd2VkID0gdHJ1ZTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGFsbG93ZWQ7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgdGhlIGNoaWxkIGtleXMgZm9yIHRoZSBvYmplY3QgaWRlbnRpZmllZCBieSB0aGUgZ2VuZXJpYyBwcmVmaXgsXG4gICAqIG9yIGFsbCB0aGUgdG9wIGxldmVsIGtleXMgaWYgbm8gcHJlZml4IGlzIHN1cHBsaWVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW2tleVByZWZpeF0gVGhlIE9iamVjdC10eXBlIGdlbmVyaWMga2V5IGZvciB3aGljaCB0byBnZXQgY2hpbGQga2V5cy4gT21pdCBmb3JcbiAgICogICB0b3AtbGV2ZWwgT2JqZWN0LXR5cGUga2V5c1xuICAgKiBAcmV0dXJucyB7W1tUeXBlXV19IFtbRGVzY3JpcHRpb25dXVxuICAgKi9cbiAgb2JqZWN0S2V5cyhrZXlQcmVmaXgpIHtcbiAgICBpZiAoIWtleVByZWZpeCkgcmV0dXJuIHRoaXMuX2ZpcnN0TGV2ZWxTY2hlbWFLZXlzO1xuXG4gICAgY29uc3Qgb2JqZWN0S2V5cyA9IFtdO1xuICAgIGNvbnN0IHNldE9iamVjdEtleXMgPSAoY3VyU2NoZW1hLCBzY2hlbWFQYXJlbnRLZXkpID0+IHtcbiAgICAgIE9iamVjdC5rZXlzKGN1clNjaGVtYSkuZm9yRWFjaCgoZmllbGROYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjdXJTY2hlbWFbZmllbGROYW1lXTtcbiAgICAgICAgZmllbGROYW1lID0gc2NoZW1hUGFyZW50S2V5ID8gYCR7c2NoZW1hUGFyZW50S2V5fS4ke2ZpZWxkTmFtZX1gIDogZmllbGROYW1lO1xuICAgICAgICBpZiAoZmllbGROYW1lLmluZGV4T2YoJy4nKSA+IC0xICYmIGZpZWxkTmFtZS5zbGljZSgtMikgIT09ICcuJCcpIHtcbiAgICAgICAgICBjb25zdCBwYXJlbnRLZXkgPSBmaWVsZE5hbWUuc2xpY2UoMCwgZmllbGROYW1lLmxhc3RJbmRleE9mKCcuJykpO1xuICAgICAgICAgIGNvbnN0IHBhcmVudEtleVdpdGhEb3QgPSBgJHtwYXJlbnRLZXl9LmA7XG4gICAgICAgICAgb2JqZWN0S2V5c1twYXJlbnRLZXlXaXRoRG90XSA9IG9iamVjdEtleXNbcGFyZW50S2V5V2l0aERvdF0gfHwgW107XG4gICAgICAgICAgb2JqZWN0S2V5c1twYXJlbnRLZXlXaXRoRG90XS5wdXNoKGZpZWxkTmFtZS5zbGljZShmaWVsZE5hbWUubGFzdEluZGV4T2YoJy4nKSArIDEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSBjdXJyZW50IGZpZWxkIGlzIGEgbmVzdGVkIFNpbXBsZVNjaGVtYSxcbiAgICAgICAgLy8gaXRlcmF0ZSBvdmVyIHRoZSBjaGlsZCBmaWVsZHMgYW5kIGNhY2hlIHRoZWlyIHByb3BlcnRpZXMgYXMgd2VsbFxuICAgICAgICBkZWZpbml0aW9uLnR5cGUuZGVmaW5pdGlvbnMuZm9yRWFjaCgoeyB0eXBlIH0pID0+IHtcbiAgICAgICAgICBpZiAoU2ltcGxlU2NoZW1hLmlzU2ltcGxlU2NoZW1hKHR5cGUpKSB7XG4gICAgICAgICAgICBzZXRPYmplY3RLZXlzKHR5cGUuX3NjaGVtYSwgZmllbGROYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHNldE9iamVjdEtleXModGhpcy5fc2NoZW1hKTtcblxuICAgIHJldHVybiBvYmplY3RLZXlzW2Ake2tleVByZWZpeH0uYF0gfHwgW107XG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIHRoaXMgc2NoZW1hIGludG8gYSBuZXcgaW5zdGFuY2Ugd2l0aCB0aGUgc2FtZSB2YWxpZGF0b3JzLCBtZXNzYWdlcyxcbiAgICogYW5kIG9wdGlvbnMsIGJ1dCB3aXRoIGRpZmZlcmVudCBrZXlzIGFzIGRlZmluZWQgaW4gYHNjaGVtYWAgYXJndW1lbnRcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHNjaGVtYVxuICAgKiBAcmV0dXJucyBUaGUgbmV3IFNpbXBsZVNjaGVtYSBpbnN0YW5jZSAoY2hhaW5hYmxlKVxuICAgKi9cbiAgX2NvcHlXaXRoU2NoZW1hKHNjaGVtYSkge1xuICAgIGNvbnN0IGNsID0gbmV3IFNpbXBsZVNjaGVtYShzY2hlbWEsIHsgLi4udGhpcy5fY29uc3RydWN0b3JPcHRpb25zIH0pO1xuICAgIGNsLl9jbGVhbk9wdGlvbnMgPSB0aGlzLl9jbGVhbk9wdGlvbnM7XG4gICAgY2wubWVzc2FnZUJveCA9IHRoaXMubWVzc2FnZUJveC5jbG9uZSgpO1xuICAgIHJldHVybiBjbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9uZXMgdGhpcyBzY2hlbWEgaW50byBhIG5ldyBpbnN0YW5jZSB3aXRoIHRoZSBzYW1lIHNjaGVtYSBrZXlzLCB2YWxpZGF0b3JzLFxuICAgKiBhbmQgb3B0aW9ucy5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5ldyBTaW1wbGVTY2hlbWEgaW5zdGFuY2UgKGNoYWluYWJsZSlcbiAgICovXG4gIGNsb25lKCkge1xuICAgIHJldHVybiB0aGlzLl9jb3B5V2l0aFNjaGVtYSh0aGlzLl9zY2hlbWEpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dGVuZHMgKG11dGF0ZXMpIHRoaXMgc2NoZW1hIHdpdGggYW5vdGhlciBzY2hlbWEsIGtleSBieSBrZXkuXG4gICAqXG4gICAqIEBwYXJhbSB7U2ltcGxlU2NoZW1hfE9iamVjdH0gc2NoZW1hXG4gICAqIEByZXR1cm5zIFRoZSBTaW1wbGVTY2hlbWEgaW5zdGFuY2UgKGNoYWluYWJsZSlcbiAgICovXG4gIGV4dGVuZChzY2hlbWEgPSB7fSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHNjaGVtYSkpIHRocm93IG5ldyBFcnJvcignWW91IG1heSBub3QgcGFzcyBhbiBhcnJheSBvZiBzY2hlbWFzIHRvIHRoZSBTaW1wbGVTY2hlbWEgY29uc3RydWN0b3Igb3IgdG8gZXh0ZW5kKCknKTtcblxuICAgIGxldCBzY2hlbWFPYmo7XG4gICAgaWYgKFNpbXBsZVNjaGVtYS5pc1NpbXBsZVNjaGVtYShzY2hlbWEpKSB7XG4gICAgICBzY2hlbWFPYmogPSBzY2hlbWEuX3NjaGVtYTtcbiAgICAgIHRoaXMuX3ZhbGlkYXRvcnMgPSB0aGlzLl92YWxpZGF0b3JzLmNvbmNhdChzY2hlbWEuX3ZhbGlkYXRvcnMpO1xuICAgICAgdGhpcy5fZG9jVmFsaWRhdG9ycyA9IHRoaXMuX2RvY1ZhbGlkYXRvcnMuY29uY2F0KHNjaGVtYS5fZG9jVmFsaWRhdG9ycyk7XG4gICAgICBPYmplY3QuYXNzaWduKHRoaXMuX2NsZWFuT3B0aW9ucywgc2NoZW1hLl9jbGVhbk9wdGlvbnMpO1xuICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLl9jb25zdHJ1Y3Rvck9wdGlvbnMsIHNjaGVtYS5fY29uc3RydWN0b3JPcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2NoZW1hT2JqID0gZXhwYW5kU2hvcnRoYW5kKHNjaGVtYSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2NoZW1hS2V5cyA9IE9iamVjdC5rZXlzKHNjaGVtYU9iaik7XG4gICAgY29uc3QgY29tYmluZWRLZXlzID0gbmV3IFNldChbLi4uT2JqZWN0LmtleXModGhpcy5fc2NoZW1hKSwgLi4uc2NoZW1hS2V5c10pO1xuXG4gICAgLy8gVXBkYXRlIGFsbCBvZiB0aGUgaW5mb3JtYXRpb24gY2FjaGVkIG9uIHRoZSBpbnN0YW5jZVxuICAgIHNjaGVtYUtleXMuZm9yRWFjaCgoZmllbGROYW1lKSA9PiB7XG4gICAgICBjb25zdCBkZWZpbml0aW9uID0gc3RhbmRhcmRpemVEZWZpbml0aW9uKHNjaGVtYU9ialtmaWVsZE5hbWVdKTtcblxuICAgICAgLy8gTWVyZ2UvZXh0ZW5kIHdpdGggYW55IGV4aXN0aW5nIGRlZmluaXRpb25cbiAgICAgIGlmICh0aGlzLl9zY2hlbWFbZmllbGROYW1lXSkge1xuICAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9zY2hlbWEsIGZpZWxkTmFtZSkpIHtcbiAgICAgICAgICAvLyBmaWVsZE5hbWUgaXMgYWN0dWFsbHkgYSBtZXRob2QgZnJvbSBPYmplY3QgaXRzZWxmIVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtmaWVsZE5hbWV9IGtleSBpcyBhY3R1YWxseSB0aGUgbmFtZSBvZiBhIG1ldGhvZCBvbiBPYmplY3QsIHBsZWFzZSByZW5hbWUgaXRgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgdHlwZSwgLi4uZGVmaW5pdGlvbldpdGhvdXRUeXBlIH0gPSBkZWZpbml0aW9uOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5cbiAgICAgICAgdGhpcy5fc2NoZW1hW2ZpZWxkTmFtZV0gPSB7XG4gICAgICAgICAgLi4udGhpcy5fc2NoZW1hW2ZpZWxkTmFtZV0sXG4gICAgICAgICAgLi4uZGVmaW5pdGlvbldpdGhvdXRUeXBlLFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChkZWZpbml0aW9uLnR5cGUpIHRoaXMuX3NjaGVtYVtmaWVsZE5hbWVdLnR5cGUuZXh0ZW5kKGRlZmluaXRpb24udHlwZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zY2hlbWFbZmllbGROYW1lXSA9IGRlZmluaXRpb247XG4gICAgICB9XG5cbiAgICAgIGNoZWNrQW5kU2NydWJEZWZpbml0aW9uKGZpZWxkTmFtZSwgdGhpcy5fc2NoZW1hW2ZpZWxkTmFtZV0sIHRoaXMuX2NvbnN0cnVjdG9yT3B0aW9ucywgY29tYmluZWRLZXlzKTtcbiAgICB9KTtcblxuICAgIGNoZWNrU2NoZW1hT3ZlcmxhcCh0aGlzLl9zY2hlbWEpO1xuXG4gICAgLy8gU2V0L1Jlc2V0IGFsbCBvZiB0aGVzZVxuICAgIHRoaXMuX3NjaGVtYUtleXMgPSBPYmplY3Qua2V5cyh0aGlzLl9zY2hlbWEpO1xuICAgIHRoaXMuX2F1dG9WYWx1ZXMgPSBbXTtcbiAgICB0aGlzLl9ibGFja2JveEtleXMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fZmlyc3RMZXZlbFNjaGVtYUtleXMgPSBbXTtcblxuICAgIC8vIFVwZGF0ZSBhbGwgb2YgdGhlIGluZm9ybWF0aW9uIGNhY2hlZCBvbiB0aGUgaW5zdGFuY2VcbiAgICB0aGlzLl9zY2hlbWFLZXlzLmZvckVhY2goKGZpZWxkTmFtZSkgPT4ge1xuICAgICAgLy8gTWFrZSBzdXJlIHBhcmVudCBoYXMgYSBkZWZpbml0aW9uIGluIHRoZSBzY2hlbWEuIE5vIGltcGxpZWQgb2JqZWN0cyFcbiAgICAgIGlmIChmaWVsZE5hbWUuaW5kZXhPZignLicpID4gLTEpIHtcbiAgICAgICAgY29uc3QgcGFyZW50RmllbGROYW1lID0gZmllbGROYW1lLnNsaWNlKDAsIGZpZWxkTmFtZS5sYXN0SW5kZXhPZignLicpKTtcbiAgICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fc2NoZW1hLCBwYXJlbnRGaWVsZE5hbWUpKSB0aHJvdyBuZXcgRXJyb3IoYFwiJHtmaWVsZE5hbWV9XCIgaXMgaW4gdGhlIHNjaGVtYSBidXQgXCIke3BhcmVudEZpZWxkTmFtZX1cIiBpcyBub3RgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IHRoaXMuX3NjaGVtYVtmaWVsZE5hbWVdO1xuXG4gICAgICAvLyBLZWVwIGxpc3Qgb2YgYWxsIHRvcCBsZXZlbCBrZXlzXG4gICAgICBpZiAoZmllbGROYW1lLmluZGV4T2YoJy4nKSA9PT0gLTEpIHRoaXMuX2ZpcnN0TGV2ZWxTY2hlbWFLZXlzLnB1c2goZmllbGROYW1lKTtcblxuICAgICAgLy8gS2VlcCBsaXN0IG9mIGFsbCBibGFja2JveCBrZXlzIGZvciBwYXNzaW5nIHRvIE1vbmdvT2JqZWN0IGNvbnN0cnVjdG9yXG4gICAgICAvLyBYWFggRm9yIG5vdyBpZiBhbnkgb25lT2YgdHlwZSBpcyBibGFja2JveCwgdGhlbiB0aGUgd2hvbGUgZmllbGQgaXMuXG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1yZXN0cmljdGVkLXN5bnRheCAqL1xuICAgICAgZm9yIChjb25zdCBvbmVPZkRlZiBvZiBkZWZpbml0aW9uLnR5cGUuZGVmaW5pdGlvbnMpIHtcbiAgICAgICAgLy8gWFhYIElmIHRoZSB0eXBlIGlzIFNTLkFueSwgYWxzbyBjb25zaWRlciBpdCBhIGJsYWNrYm94XG4gICAgICAgIGlmIChvbmVPZkRlZi5ibGFja2JveCA9PT0gdHJ1ZSB8fCBvbmVPZkRlZi50eXBlID09PSBTaW1wbGVTY2hlbWEuQW55KSB7XG4gICAgICAgICAgdGhpcy5fYmxhY2tib3hLZXlzLmFkZChmaWVsZE5hbWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXJlc3RyaWN0ZWQtc3ludGF4ICovXG5cbiAgICAgIC8vIEtlZXAgbGlzdCBvZiBhdXRvVmFsdWUgZnVuY3Rpb25zXG4gICAgICBpZiAodHlwZW9mIGRlZmluaXRpb24uYXV0b1ZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX2F1dG9WYWx1ZXMucHVzaCh7XG4gICAgICAgICAgY2xvc2VzdFN1YnNjaGVtYUZpZWxkTmFtZTogJycsXG4gICAgICAgICAgZmllbGROYW1lLFxuICAgICAgICAgIGZ1bmM6IGRlZmluaXRpb24uYXV0b1ZhbHVlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0QWxsb3dlZFZhbHVlc0ZvcktleShrZXkpIHtcbiAgICAvLyBGb3IgYXJyYXkgZmllbGRzLCBgYWxsb3dlZFZhbHVlc2AgaXMgb24gdGhlIGFycmF5IGl0ZW0gZGVmaW5pdGlvblxuICAgIGlmICh0aGlzLmFsbG93c0tleShgJHtrZXl9LiRgKSkge1xuICAgICAga2V5ID0gYCR7a2V5fS4kYDtcbiAgICB9XG4gICAgY29uc3QgYWxsb3dlZFZhbHVlcyA9IHRoaXMuZ2V0KGtleSwgJ2FsbG93ZWRWYWx1ZXMnKTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGFsbG93ZWRWYWx1ZXMpIHx8IGFsbG93ZWRWYWx1ZXMgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgIHJldHVybiBbLi4uYWxsb3dlZFZhbHVlc107XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBuZXdDb250ZXh0KCkge1xuICAgIHJldHVybiBuZXcgVmFsaWRhdGlvbkNvbnRleHQodGhpcyk7XG4gIH1cblxuICBuYW1lZENvbnRleHQobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIG5hbWUgPSAnZGVmYXVsdCc7XG4gICAgaWYgKCF0aGlzLl92YWxpZGF0aW9uQ29udGV4dHNbbmFtZV0pIHtcbiAgICAgIHRoaXMuX3ZhbGlkYXRpb25Db250ZXh0c1tuYW1lXSA9IG5ldyBWYWxpZGF0aW9uQ29udGV4dCh0aGlzLCBuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRpb25Db250ZXh0c1tuYW1lXTtcbiAgfVxuXG4gIGFkZFZhbGlkYXRvcihmdW5jKSB7XG4gICAgdGhpcy5fdmFsaWRhdG9ycy5wdXNoKGZ1bmMpO1xuICB9XG5cbiAgYWRkRG9jVmFsaWRhdG9yKGZ1bmMpIHtcbiAgICB0aGlzLl9kb2NWYWxpZGF0b3JzLnB1c2goZnVuYyk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIG9iaiB7T2JqZWN0fE9iamVjdFtdfSBPYmplY3Qgb3IgYXJyYXkgb2Ygb2JqZWN0cyB0byB2YWxpZGF0ZS5cbiAgICogQHBhcmFtIFtvcHRpb25zXSB7T2JqZWN0fSBTYW1lIG9wdGlvbnMgb2JqZWN0IHRoYXQgVmFsaWRhdGlvbkNvbnRleHQjdmFsaWRhdGUgdGFrZXNcbiAgICpcbiAgICogVGhyb3dzIGFuIEVycm9yIHdpdGggbmFtZSBgQ2xpZW50RXJyb3JgIGFuZCBgZGV0YWlsc2AgcHJvcGVydHkgY29udGFpbmluZyB0aGUgZXJyb3JzLlxuICAgKi9cbiAgdmFsaWRhdGUob2JqLCBvcHRpb25zID0ge30pIHtcbiAgICAvLyBGb3IgTWV0ZW9yIGFwcHMsIGBjaGVja2Agb3B0aW9uIGNhbiBiZSBwYXNzZWQgdG8gc2lsZW5jZSBhdWRpdC1hcmd1bWVudC1jaGVja3NcbiAgICBjb25zdCBjaGVjayA9IG9wdGlvbnMuY2hlY2sgfHwgdGhpcy5fY29uc3RydWN0b3JPcHRpb25zLmNoZWNrO1xuICAgIGlmICh0eXBlb2YgY2hlY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIENhbGwgY2hlY2sgYnV0IGlnbm9yZSB0aGUgZXJyb3JcbiAgICAgIHRyeSB7IGNoZWNrKG9iaik7IH0gY2F0Y2ggKGUpIHsgLyogaWdub3JlIGVycm9yICovIH1cbiAgICB9XG5cbiAgICAvLyBvYmogY2FuIGJlIGFuIGFycmF5LCBpbiB3aGljaCBjYXNlIHdlIHZhbGlkYXRlIGVhY2ggb2JqZWN0IGluIGl0IGFuZFxuICAgIC8vIHRocm93IGFzIHNvb24gYXMgb25lIGhhcyBhbiBlcnJvclxuICAgIGNvbnN0IG9iamVjdHMgPSBBcnJheS5pc0FycmF5KG9iaikgPyBvYmogOiBbb2JqXTtcbiAgICBvYmplY3RzLmZvckVhY2goKG9uZU9iaikgPT4ge1xuICAgICAgY29uc3QgdmFsaWRhdGlvbkNvbnRleHQgPSB0aGlzLm5ld0NvbnRleHQoKTtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSB2YWxpZGF0aW9uQ29udGV4dC52YWxpZGF0ZShvbmVPYmosIG9wdGlvbnMpO1xuXG4gICAgICBpZiAoaXNWYWxpZCkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uQ29udGV4dC52YWxpZGF0aW9uRXJyb3JzKCk7XG5cbiAgICAgIC8vIEluIG9yZGVyIGZvciB0aGUgbWVzc2FnZSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFjayB0cmFjZSB0byBiZSB1c2VmdWwsXG4gICAgICAvLyB3ZSBzZXQgaXQgdG8gdGhlIGZpcnN0IHZhbGlkYXRpb24gZXJyb3IgbWVzc2FnZS5cbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLm1lc3NhZ2VGb3JFcnJvcihlcnJvcnNbMF0pO1xuXG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcblxuICAgICAgZXJyb3IuZXJyb3JUeXBlID0gJ0NsaWVudEVycm9yJztcbiAgICAgIGVycm9yLm5hbWUgPSAnQ2xpZW50RXJyb3InO1xuICAgICAgZXJyb3IuZXJyb3IgPSAndmFsaWRhdGlvbi1lcnJvcic7XG5cbiAgICAgIC8vIEFkZCBtZWFuaW5nZnVsIGVycm9yIG1lc3NhZ2VzIGZvciBlYWNoIHZhbGlkYXRpb24gZXJyb3IuXG4gICAgICAvLyBVc2VmdWwgZm9yIGRpc3BsYXkgbWVzc2FnZXMgd2hlbiB1c2luZyAnbWRnOnZhbGlkYXRlZC1tZXRob2QnLlxuICAgICAgZXJyb3IuZGV0YWlscyA9IGVycm9ycy5tYXAoKGVycm9yRGV0YWlsKSA9PiAoeyAuLi5lcnJvckRldGFpbCwgbWVzc2FnZTogdGhpcy5tZXNzYWdlRm9yRXJyb3IoZXJyb3JEZXRhaWwpIH0pKTtcblxuICAgICAgLy8gVGhlIHByaW1hcnkgdXNlIGZvciB0aGUgdmFsaWRhdGlvbkVycm9yVHJhbnNmb3JtIGlzIHRvIGNvbnZlcnQgdGhlXG4gICAgICAvLyB2YW5pbGxhIEVycm9yIGludG8gYSBNZXRlb3IuRXJyb3IgdW50aWwgRERQIGlzIGFibGUgdG8gcGFzc1xuICAgICAgLy8gdmFuaWxsYSBlcnJvcnMgYmFjayB0byB0aGUgY2xpZW50LlxuICAgICAgaWYgKHR5cGVvZiBTaW1wbGVTY2hlbWEudmFsaWRhdGlvbkVycm9yVHJhbnNmb3JtID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IFNpbXBsZVNjaGVtYS52YWxpZGF0aW9uRXJyb3JUcmFuc2Zvcm0oZXJyb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIG9iaiB7T2JqZWN0fSBPYmplY3QgdG8gdmFsaWRhdGUuXG4gICAqIEBwYXJhbSBbb3B0aW9uc10ge09iamVjdH0gU2FtZSBvcHRpb25zIG9iamVjdCB0aGF0IFZhbGlkYXRpb25Db250ZXh0I3ZhbGlkYXRlIHRha2VzXG4gICAqXG4gICAqIFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgZXJyb3JzXG4gICAqL1xuICB2YWxpZGF0ZUFuZFJldHVybkVycm9yc1Byb21pc2Uob2JqLCBvcHRpb25zKSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbkNvbnRleHQgPSB0aGlzLm5ld0NvbnRleHQoKTtcbiAgICBjb25zdCBpc1ZhbGlkID0gdmFsaWRhdGlvbkNvbnRleHQudmFsaWRhdGUob2JqLCBvcHRpb25zKTtcblxuICAgIGlmIChpc1ZhbGlkKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcblxuICAgIC8vIEFkZCB0aGUgYG1lc3NhZ2VgIHByb3BcbiAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uQ29udGV4dC52YWxpZGF0aW9uRXJyb3JzKCkubWFwKChlcnJvckRldGFpbCkgPT4ge1xuICAgICAgcmV0dXJuIHsgLi4uZXJyb3JEZXRhaWwsIG1lc3NhZ2U6IHRoaXMubWVzc2FnZUZvckVycm9yKGVycm9yRGV0YWlsKSB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShlcnJvcnMpO1xuICB9XG5cbiAgdmFsaWRhdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiAob2JqKSA9PiB7XG4gICAgICBjb25zdCBvcHRpb25zQ2xvbmUgPSB7IC4uLm9wdGlvbnMgfTtcbiAgICAgIGlmIChvcHRpb25zLmNsZWFuID09PSB0cnVlKSB7XG4gICAgICAgIC8vIERvIHRoaXMgaGVyZSBhbmQgcGFzcyBpbnRvIGJvdGggZnVuY3Rpb25zIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAgICAgb3B0aW9uc0Nsb25lLm1vbmdvT2JqZWN0ID0gbmV3IE1vbmdvT2JqZWN0KG9iaiwgdGhpcy5ibGFja2JveEtleXMoKSk7XG4gICAgICAgIHRoaXMuY2xlYW4ob2JqLCBvcHRpb25zQ2xvbmUpO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMucmV0dXJuRXJyb3JzUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZUFuZFJldHVybkVycm9yc1Byb21pc2Uob2JqLCBvcHRpb25zQ2xvbmUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGUob2JqLCBvcHRpb25zQ2xvbmUpO1xuICAgIH07XG4gIH1cblxuICBnZXRGb3JtVmFsaWRhdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiB0aGlzLnZhbGlkYXRvcih7IC4uLm9wdGlvbnMsIHJldHVybkVycm9yc1Byb21pc2U6IHRydWUgfSk7XG4gIH1cblxuICBjbGVhbiguLi5hcmdzKSB7XG4gICAgcmV0dXJuIGNsZWFuKHRoaXMsIC4uLmFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSBzY2hlbWEgbGFiZWxzIG9uIHRoZSBmbHksIGNhdXNpbmcgbXlTY2hlbWEubGFiZWwgY29tcHV0YXRpb25cbiAgICogdG8gcmVydW4uIFVzZWZ1bCB3aGVuIHRoZSB1c2VyIGNoYW5nZXMgdGhlIGxhbmd1YWdlLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gbGFiZWxzIEEgZGljdGlvbmFyeSBvZiBhbGwgdGhlIG5ldyBsYWJlbCB2YWx1ZXMsIGJ5IHNjaGVtYSBrZXkuXG4gICAqL1xuICBsYWJlbHMobGFiZWxzKSB7XG4gICAgT2JqZWN0LmtleXMobGFiZWxzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGNvbnN0IGxhYmVsID0gbGFiZWxzW2tleV07XG4gICAgICBpZiAodHlwZW9mIGxhYmVsICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgbGFiZWwgIT09ICdmdW5jdGlvbicpIHJldHVybjtcblxuICAgICAgY29uc3QgW3NjaGVtYUluc3RhbmNlLCBpbm5lcktleV0gPSB0aGlzLm5lYXJlc3RTaW1wbGVTY2hlbWFJbnN0YW5jZShrZXkpO1xuICAgICAgaWYgKCFzY2hlbWFJbnN0YW5jZSkgcmV0dXJuO1xuXG4gICAgICBzY2hlbWFJbnN0YW5jZS5fc2NoZW1hW2lubmVyS2V5XS5sYWJlbCA9IGxhYmVsO1xuICAgICAgc2NoZW1hSW5zdGFuY2UuX2RlcHNMYWJlbHNbaW5uZXJLZXldICYmIHNjaGVtYUluc3RhbmNlLl9kZXBzTGFiZWxzW2lubmVyS2V5XS5jaGFuZ2VkKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGZpZWxkJ3MgbGFiZWwgb3IgYWxsIGZpZWxkIGxhYmVscyByZWFjdGl2ZWx5LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW2tleV0gVGhlIHNjaGVtYSBrZXksIHNwZWNpZmljIG9yIGdlbmVyaWMuXG4gICAqICAgT21pdCB0aGlzIGFyZ3VtZW50IHRvIGdldCBhIGRpY3Rpb25hcnkgb2YgYWxsIGxhYmVscy5cbiAgICogQHJldHVybnMge1N0cmluZ30gVGhlIGxhYmVsXG4gICAqL1xuICBsYWJlbChrZXkpIHtcbiAgICAvLyBHZXQgYWxsIGxhYmVsc1xuICAgIGlmIChrZXkgPT09IG51bGwgfHwga2V5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgICAgdGhpcy5fc2NoZW1hS2V5cy5mb3JFYWNoKChzY2hlbWFLZXkpID0+IHtcbiAgICAgICAgcmVzdWx0W3NjaGVtYUtleV0gPSB0aGlzLmxhYmVsKHNjaGVtYUtleSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gR2V0IGxhYmVsIGZvciBvbmUgZmllbGRcbiAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0KGtleSwgJ2xhYmVsJyk7XG4gICAgaWYgKGxhYmVsKSB0aGlzLnJlYWN0aXZlTGFiZWxEZXBlbmRlbmN5KGtleSk7XG4gICAgcmV0dXJuIGxhYmVsIHx8IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGZpZWxkJ3MgcHJvcGVydHlcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleSBUaGUgc2NoZW1hIGtleSwgc3BlY2lmaWMgb3IgZ2VuZXJpYy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHByb3AgTmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0IGZvciB0aGF0IHNjaGVtYSBrZXlcbiAgICogQHBhcmFtIHtPYmplY3R9IFtmdW5jdGlvbkNvbnRleHRdIFRoZSBgdGhpc2AgY29udGV4dCB0byB1c2UgaWYgcHJvcCBpcyBhIGZ1bmN0aW9uXG4gICAqIEByZXR1cm5zIHthbnl9IFRoZSBwcm9wZXJ0eSB2YWx1ZVxuICAgKi9cbiAgZ2V0KGtleSwgcHJvcCwgZnVuY3Rpb25Db250ZXh0KSB7XG4gICAgY29uc3QgZGVmID0gdGhpcy5nZXREZWZpbml0aW9uKGtleSwgWyd0eXBlJywgcHJvcF0sIGZ1bmN0aW9uQ29udGV4dCk7XG5cbiAgICBpZiAoIWRlZikgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgIGlmIChzY2hlbWFEZWZpbml0aW9uT3B0aW9ucy5pbmNsdWRlcyhwcm9wKSkge1xuICAgICAgcmV0dXJuIGRlZltwcm9wXTtcbiAgICB9XG5cbiAgICByZXR1cm4gKGRlZi50eXBlLmZpbmQoKHByb3BzKSA9PiBwcm9wc1twcm9wXSkgfHwge30pW3Byb3BdO1xuICB9XG5cbiAgLy8gc2hvcnRoYW5kIGZvciBnZXR0aW5nIGRlZmF1bHRWYWx1ZVxuICBkZWZhdWx0VmFsdWUoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KGtleSwgJ2RlZmF1bHRWYWx1ZScpO1xuICB9XG5cbiAgLy8gUmV0dXJucyBhIHN0cmluZyBtZXNzYWdlIGZvciB0aGUgZ2l2ZW4gZXJyb3IgdHlwZSBhbmQga2V5LiBQYXNzZXMgdGhyb3VnaFxuICAvLyB0byBtZXNzYWdlLWJveCBwa2cuXG4gIG1lc3NhZ2VGb3JFcnJvcihlcnJvckluZm8pIHtcbiAgICBjb25zdCB7IG5hbWUgfSA9IGVycm9ySW5mbztcblxuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VCb3gubWVzc2FnZShlcnJvckluZm8sIHtcbiAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAga2V5OiBuYW1lLCAvLyBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG5cbiAgICAgICAgLy8gVGhlIGNhbGwgdG8gdGhpcy5sYWJlbCgpIGVzdGFibGlzaGVzIGEgcmVhY3RpdmUgZGVwZW5kZW5jeSwgdG9vXG4gICAgICAgIGxhYmVsOiB0aGlzLmxhYmVsKG5hbWUpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIFNpbXBsZVNjaGVtYSNwaWNrXG4gICAqIEBwYXJhbSB7W2ZpZWxkc119IFRoZSBsaXN0IG9mIGZpZWxkcyB0byBwaWNrIHRvIGluc3RhbnRpYXRlIHRoZSBzdWJzY2hlbWFcbiAgICogQHJldHVybnMge1NpbXBsZVNjaGVtYX0gVGhlIHN1YnNjaGVtYVxuICAgKi9cbiAgcGljayA9IGdldFBpY2tPck9taXQoJ3BpY2snKTtcblxuICAvKipcbiAgICogQG1ldGhvZCBTaW1wbGVTY2hlbWEjb21pdFxuICAgKiBAcGFyYW0ge1tmaWVsZHNdfSBUaGUgbGlzdCBvZiBmaWVsZHMgdG8gb21pdCB0byBpbnN0YW50aWF0ZSB0aGUgc3Vic2NoZW1hXG4gICAqIEByZXR1cm5zIHtTaW1wbGVTY2hlbWF9IFRoZSBzdWJzY2hlbWFcbiAgICovXG4gIG9taXQgPSBnZXRQaWNrT3JPbWl0KCdvbWl0Jyk7XG5cbiAgc3RhdGljIHZlcnNpb24gPSAyO1xuXG4gIC8vIElmIHlvdSBuZWVkIHRvIGFsbG93IHByb3BlcnRpZXMgb3RoZXIgdGhhbiB0aG9zZSBsaXN0ZWQgYWJvdmUsIGNhbGwgdGhpcyBmcm9tIHlvdXIgYXBwIG9yIHBhY2thZ2VcbiAgc3RhdGljIGV4dGVuZE9wdGlvbnMob3B0aW9ucykge1xuICAgIC8vIEZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB3ZSBzdGlsbCB0YWtlIGFuIG9iamVjdCBoZXJlLCBidXQgd2Ugb25seSBjYXJlIGFib3V0IHRoZSBuYW1lc1xuICAgIGlmICghQXJyYXkuaXNBcnJheShvcHRpb25zKSkgb3B0aW9ucyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpO1xuICAgIG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uKSA9PiB7XG4gICAgICBzY2hlbWFEZWZpbml0aW9uT3B0aW9ucy5wdXNoKG9wdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgZGVmaW5lVmFsaWRhdGlvbkVycm9yVHJhbnNmb3JtKHRyYW5zZm9ybSkge1xuICAgIGlmICh0eXBlb2YgdHJhbnNmb3JtICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NpbXBsZVNjaGVtYS5kZWZpbmVWYWxpZGF0aW9uRXJyb3JUcmFuc2Zvcm0gbXVzdCBiZSBwYXNzZWQgYSBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgYW4gRXJyb3IgYW5kIHJldHVybnMgYW4gRXJyb3InKTtcbiAgICB9XG4gICAgU2ltcGxlU2NoZW1hLnZhbGlkYXRpb25FcnJvclRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbiAgfVxuXG4gIHN0YXRpYyB2YWxpZGF0ZShvYmosIHNjaGVtYSwgb3B0aW9ucykge1xuICAgIC8vIEFsbG93IHBhc3NpbmcganVzdCB0aGUgc2NoZW1hIG9iamVjdFxuICAgIGlmICghKFNpbXBsZVNjaGVtYS5pc1NpbXBsZVNjaGVtYShzY2hlbWEpKSkge1xuICAgICAgc2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYShzY2hlbWEpO1xuICAgIH1cblxuICAgIHJldHVybiBzY2hlbWEudmFsaWRhdGUob2JqLCBvcHRpb25zKTtcbiAgfVxuXG4gIHN0YXRpYyBvbmVPZiguLi5kZWZpbml0aW9ucykge1xuICAgIHJldHVybiBuZXcgU2ltcGxlU2NoZW1hR3JvdXAoLi4uZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgc3RhdGljIEFueSA9ICdfX19BbnlfX18nO1xuXG4gIHN0YXRpYyBSZWdFeCA9IHJlZ0V4cE9iajtcblxuICAvLyBHbG9iYWwgY3VzdG9tIHZhbGlkYXRvcnNcbiAgc3RhdGljIF92YWxpZGF0b3JzID0gW107XG5cbiAgc3RhdGljIGFkZFZhbGlkYXRvcihmdW5jKSB7XG4gICAgU2ltcGxlU2NoZW1hLl92YWxpZGF0b3JzLnB1c2goZnVuYyk7XG4gIH1cblxuICBzdGF0aWMgX2RvY1ZhbGlkYXRvcnMgPSBbXTtcblxuICBzdGF0aWMgYWRkRG9jVmFsaWRhdG9yKGZ1bmMpIHtcbiAgICBTaW1wbGVTY2hlbWEuX2RvY1ZhbGlkYXRvcnMucHVzaChmdW5jKTtcbiAgfVxuXG4gIC8vIEdsb2JhbCBjb25zdHJ1Y3RvciBvcHRpb25zXG4gIHN0YXRpYyBfY29uc3RydWN0b3JPcHRpb25EZWZhdWx0cyA9IHtcbiAgICBjbGVhbjoge1xuICAgICAgYXV0b0NvbnZlcnQ6IHRydWUsXG4gICAgICBleHRlbmRBdXRvVmFsdWVDb250ZXh0OiB7fSxcbiAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgIGdldEF1dG9WYWx1ZXM6IHRydWUsXG4gICAgICByZW1vdmVFbXB0eVN0cmluZ3M6IHRydWUsXG4gICAgICByZW1vdmVOdWxsc0Zyb21BcnJheXM6IGZhbHNlLFxuICAgICAgdHJpbVN0cmluZ3M6IHRydWUsXG4gICAgfSxcbiAgICBodW1hbml6ZUF1dG9MYWJlbHM6IHRydWUsXG4gICAgcmVxdWlyZWRCeURlZmF1bHQ6IHRydWUsXG4gIH07XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEdldC9zZXQgZGVmYXVsdCB2YWx1ZXMgZm9yIFNpbXBsZVNjaGVtYSBjb25zdHJ1Y3RvciBvcHRpb25zXG4gICAqL1xuICBzdGF0aWMgY29uc3RydWN0b3JPcHRpb25EZWZhdWx0cyhvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSByZXR1cm4gU2ltcGxlU2NoZW1hLl9jb25zdHJ1Y3Rvck9wdGlvbkRlZmF1bHRzO1xuXG4gICAgU2ltcGxlU2NoZW1hLl9jb25zdHJ1Y3Rvck9wdGlvbkRlZmF1bHRzID0ge1xuICAgICAgLi4uU2ltcGxlU2NoZW1hLl9jb25zdHJ1Y3Rvck9wdGlvbkRlZmF1bHRzLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIGNsZWFuOiB7XG4gICAgICAgIC4uLlNpbXBsZVNjaGVtYS5fY29uc3RydWN0b3JPcHRpb25EZWZhdWx0cy5jbGVhbixcbiAgICAgICAgLi4uKG9wdGlvbnMuY2xlYW4gfHwge30pLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEVycm9yVHlwZXMgPSB7XG4gICAgUkVRVUlSRUQ6ICdyZXF1aXJlZCcsXG4gICAgTUlOX1NUUklORzogJ21pblN0cmluZycsXG4gICAgTUFYX1NUUklORzogJ21heFN0cmluZycsXG4gICAgTUlOX05VTUJFUjogJ21pbk51bWJlcicsXG4gICAgTUFYX05VTUJFUjogJ21heE51bWJlcicsXG4gICAgTUlOX05VTUJFUl9FWENMVVNJVkU6ICdtaW5OdW1iZXJFeGNsdXNpdmUnLFxuICAgIE1BWF9OVU1CRVJfRVhDTFVTSVZFOiAnbWF4TnVtYmVyRXhjbHVzaXZlJyxcbiAgICBNSU5fREFURTogJ21pbkRhdGUnLFxuICAgIE1BWF9EQVRFOiAnbWF4RGF0ZScsXG4gICAgQkFEX0RBVEU6ICdiYWREYXRlJyxcbiAgICBNSU5fQ09VTlQ6ICdtaW5Db3VudCcsXG4gICAgTUFYX0NPVU5UOiAnbWF4Q291bnQnLFxuICAgIE1VU1RfQkVfSU5URUdFUjogJ25vRGVjaW1hbCcsXG4gICAgVkFMVUVfTk9UX0FMTE9XRUQ6ICdub3RBbGxvd2VkJyxcbiAgICBFWFBFQ1RFRF9UWVBFOiAnZXhwZWN0ZWRUeXBlJyxcbiAgICBGQUlMRURfUkVHVUxBUl9FWFBSRVNTSU9OOiAncmVnRXgnLFxuICAgIEtFWV9OT1RfSU5fU0NIRU1BOiAna2V5Tm90SW5TY2hlbWEnLFxuICB9O1xuXG4gIHN0YXRpYyBJbnRlZ2VyID0gJ1NpbXBsZVNjaGVtYS5JbnRlZ2VyJztcblxuICAvLyBCYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICBzdGF0aWMgX21ha2VHZW5lcmljID0gTW9uZ29PYmplY3QubWFrZUtleUdlbmVyaWM7XG5cbiAgc3RhdGljIFZhbGlkYXRpb25Db250ZXh0ID0gVmFsaWRhdGlvbkNvbnRleHQ7XG5cbiAgc3RhdGljIHNldERlZmF1bHRNZXNzYWdlcyA9IChtZXNzYWdlcykgPT4ge1xuICAgIG1lcmdlKGRlZmF1bHRNZXNzYWdlcywgbWVzc2FnZXMpO1xuICB9O1xufVxuXG4vKlxuICogUFJJVkFURVxuICovXG5cbi8vIFRocm93cyBhbiBlcnJvciBpZiBhbnkgZmllbGRzIGFyZSBgdHlwZWAgU2ltcGxlU2NoZW1hIGJ1dCB0aGVuIGFsc29cbi8vIGhhdmUgc3ViZmllbGRzIGRlZmluZWQgb3V0c2lkZSBvZiB0aGF0LlxuZnVuY3Rpb24gY2hlY2tTY2hlbWFPdmVybGFwKHNjaGVtYSkge1xuICBPYmplY3Qua2V5cyhzY2hlbWEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IHZhbCA9IHNjaGVtYVtrZXldO1xuICAgIGlmICghdmFsLnR5cGUpIHRocm93IG5ldyBFcnJvcihgJHtrZXl9IGtleSBpcyBtaXNzaW5nIFwidHlwZVwiYCk7XG4gICAgdmFsLnR5cGUuZGVmaW5pdGlvbnMuZm9yRWFjaCgoZGVmKSA9PiB7XG4gICAgICBpZiAoIShTaW1wbGVTY2hlbWEuaXNTaW1wbGVTY2hlbWEoZGVmLnR5cGUpKSkgcmV0dXJuO1xuXG4gICAgICBPYmplY3Qua2V5cyhkZWYudHlwZS5fc2NoZW1hKS5mb3JFYWNoKChzdWJLZXkpID0+IHtcbiAgICAgICAgY29uc3QgbmV3S2V5ID0gYCR7a2V5fS4ke3N1YktleX1gO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNjaGVtYSwgbmV3S2V5KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHR5cGUgZm9yIFwiJHtrZXl9XCIgaXMgc2V0IHRvIGEgU2ltcGxlU2NoZW1hIGluc3RhbmNlIHRoYXQgZGVmaW5lcyBcIiR7a2V5fS4ke3N1YktleX1cIiwgYnV0IHRoZSBwYXJlbnQgU2ltcGxlU2NoZW1hIGluc3RhbmNlIGFsc28gdHJpZXMgdG8gZGVmaW5lIFwiJHtrZXl9LiR7c3ViS2V5fVwiYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGROYW1lIFRoZSBmdWxsIGdlbmVyaWMgc2NoZW1hIGtleVxuICogQHBhcmFtIHtCb29sZWFufSBzaG91bGRIdW1hbml6ZSBIdW1hbml6ZSBpdFxuICogQHJldHVybnMge1N0cmluZ30gQSBsYWJlbCBiYXNlZCBvbiB0aGUga2V5XG4gKi9cbmZ1bmN0aW9uIGluZmxlY3RlZExhYmVsKGZpZWxkTmFtZSwgc2hvdWxkSHVtYW5pemUpIHtcbiAgY29uc3QgcGllY2VzID0gZmllbGROYW1lLnNwbGl0KCcuJyk7XG4gIGxldCBsYWJlbDtcbiAgZG8ge1xuICAgIGxhYmVsID0gcGllY2VzLnBvcCgpO1xuICB9IHdoaWxlIChsYWJlbCA9PT0gJyQnICYmIHBpZWNlcy5sZW5ndGgpO1xuICByZXR1cm4gc2hvdWxkSHVtYW5pemUgPyBodW1hbml6ZShsYWJlbCkgOiBsYWJlbDtcbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEF1dG9WYWx1ZUZ1bmN0aW9uKGRlZmF1bHRWYWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gZGVmYXVsdEF1dG9WYWx1ZUZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmlzU2V0KSByZXR1cm47XG4gICAgaWYgKHRoaXMub3BlcmF0b3IgPT09IG51bGwpIHJldHVybiBkZWZhdWx0VmFsdWU7XG5cbiAgICAvLyBIYW5kbGUgdGhlIGNhc2Ugd2hlbiBwdWxsaW5nIGFuIG9iamVjdCBmcm9tIGFuIGFycmF5IHRoZSBvYmplY3QgY29udGFpbnMgYSBmaWVsZFxuICAgIC8vIHdoaWNoIGhhcyBhIGRlZmF1bHRWYWx1ZS4gV2UgZG9uJ3Qgd2FudCB0aGUgZGVmYXVsdCB2YWx1ZSB0byBiZSByZXR1cm5lZCBpbiB0aGlzIGNhc2VcbiAgICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJyRwdWxsJykgcmV0dXJuO1xuXG4gICAgLy8gSGFuZGxlIHRoZSBjYXNlIHdoZXJlIHdlIGFyZSAkcHVzaGluZyBhbiBvYmplY3QgaW50byBhbiBhcnJheSBvZiBvYmplY3RzIGFuZCB3ZVxuICAgIC8vIHdhbnQgYW55IGZpZWxkcyBtaXNzaW5nIGZyb20gdGhhdCBvYmplY3QgdG8gYmUgYWRkZWQgaWYgdGhleSBoYXZlIGRlZmF1bHQgdmFsdWVzXG4gICAgaWYgKHRoaXMub3BlcmF0b3IgPT09ICckcHVzaCcpIHJldHVybiBkZWZhdWx0VmFsdWU7XG5cbiAgICAvLyBJZiBwYXJlbnQgaXMgc2V0LCB3ZSBzaG91bGQgdXBkYXRlIHRoaXMgcG9zaXRpb24gaW5zdGVhZCBvZiAkc2V0T25JbnNlcnRcbiAgICBpZiAodGhpcy5wYXJlbnRGaWVsZCgpLmlzU2V0KSByZXR1cm4gZGVmYXVsdFZhbHVlO1xuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBkZWZhdWx0IHZhbHVlIGlzIGFkZGVkIG9uIHVwc2VydCBpbnNlcnRcbiAgICBpZiAodGhpcy5pc1Vwc2VydCkgcmV0dXJuIHsgJHNldE9uSW5zZXJ0OiBkZWZhdWx0VmFsdWUgfTtcbiAgfTtcbn1cblxuLy8gTXV0YXRlcyBkZWYgaW50byBzdGFuZGFyZGl6ZWQgb2JqZWN0IHdpdGggU2ltcGxlU2NoZW1hR3JvdXAgdHlwZVxuZnVuY3Rpb24gc3RhbmRhcmRpemVEZWZpbml0aW9uKGRlZikge1xuICBjb25zdCBzdGFuZGFyZGl6ZWREZWYgPSBPYmplY3Qua2V5cyhkZWYpLnJlZHVjZSgobmV3RGVmLCBwcm9wKSA9PiB7XG4gICAgaWYgKCFvbmVPZlByb3BzLmluY2x1ZGVzKHByb3ApKSB7XG4gICAgICBuZXdEZWZbcHJvcF0gPSBkZWZbcHJvcF07XG4gICAgfVxuICAgIHJldHVybiBuZXdEZWY7XG4gIH0sIHt9KTtcblxuICAvLyBJbnRlcm5hbGx5LCBhbGwgZGVmaW5pdGlvbiB0eXBlcyBhcmUgc3RvcmVkIGFzIGdyb3VwcyBmb3Igc2ltcGxpY2l0eSBvZiBhY2Nlc3MuXG4gIC8vIElmIHdlIGFyZSBleHRlbmRpbmcsIHRoZXJlIG1heSBub3QgYWN0dWFsbHkgYmUgZGVmLnR5cGUsIGJ1dCBpdCdzIG9rYXkgYmVjYXVzZVxuICAvLyBpdCB3aWxsIGJlIGFkZGVkIGxhdGVyIHdoZW4gdGhlIHR3byBTaW1wbGVTY2hlbWFHcm91cHMgYXJlIG1lcmdlZC5cbiAgaWYgKGRlZi50eXBlICYmIGRlZi50eXBlIGluc3RhbmNlb2YgU2ltcGxlU2NoZW1hR3JvdXApIHtcbiAgICBzdGFuZGFyZGl6ZWREZWYudHlwZSA9IGRlZi50eXBlLmNsb25lKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZ3JvdXBQcm9wcyA9IE9iamVjdC5rZXlzKGRlZikucmVkdWNlKChuZXdEZWYsIHByb3ApID0+IHtcbiAgICAgIGlmIChvbmVPZlByb3BzLmluY2x1ZGVzKHByb3ApKSB7XG4gICAgICAgIG5ld0RlZltwcm9wXSA9IGRlZltwcm9wXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdEZWY7XG4gICAgfSwge30pO1xuICAgIHN0YW5kYXJkaXplZERlZi50eXBlID0gbmV3IFNpbXBsZVNjaGVtYUdyb3VwKGdyb3VwUHJvcHMpO1xuICB9XG5cbiAgcmV0dXJuIHN0YW5kYXJkaXplZERlZjtcbn1cblxuLyoqXG4gKiBAc3VtbWFyeSBDaGVja3MgYW5kIG11dGF0ZXMgZGVmaW5pdGlvbi4gQ2xvbmUgaXQgZmlyc3QuXG4gKiAgIFRocm93cyBlcnJvcnMgaWYgYW55IHByb2JsZW1zIGFyZSBmb3VuZC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZE5hbWUgTmFtZSBvZiBmaWVsZCAvIGtleVxuICogQHBhcmFtIHtPYmplY3R9IGRlZmluaXRpb24gRmllbGQgZGVmaW5pdGlvblxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9uc1xuICogQHBhcmFtIHtTZXR9IGFsbEtleXMgU2V0IG9mIGFsbCBmaWVsZCBuYW1lcyAvIGtleXMgaW4gZW50aXJlIHNjaGVtYVxuICogQHJldHVybiB7dW5kZWZpbmVkfSBWb2lkXG4gKi9cbmZ1bmN0aW9uIGNoZWNrQW5kU2NydWJEZWZpbml0aW9uKGZpZWxkTmFtZSwgZGVmaW5pdGlvbiwgb3B0aW9ucywgYWxsS2V5cykge1xuICBpZiAoIWRlZmluaXRpb24udHlwZSkgdGhyb3cgbmV3IEVycm9yKGAke2ZpZWxkTmFtZX0ga2V5IGlzIG1pc3NpbmcgXCJ0eXBlXCJgKTtcblxuICAvLyBWYWxpZGF0ZSB0aGUgZmllbGQgZGVmaW5pdGlvblxuICBPYmplY3Qua2V5cyhkZWZpbml0aW9uKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAoc2NoZW1hRGVmaW5pdGlvbk9wdGlvbnMuaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGRlZmluaXRpb24gZm9yICR7ZmllbGROYW1lfSBmaWVsZDogXCIke2tleX1cIiBpcyBub3QgYSBzdXBwb3J0ZWQgcHJvcGVydHlgKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIE1ha2Ugc3VyZSB0aGUgYHR5cGVgcyBhcmUgT0tcbiAgbGV0IGNvdWxkQmVBcnJheSA9IGZhbHNlO1xuICBkZWZpbml0aW9uLnR5cGUuZGVmaW5pdGlvbnMuZm9yRWFjaCgoeyB0eXBlIH0pID0+IHtcbiAgICBpZiAoIXR5cGUpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBkZWZpbml0aW9uIGZvciAke2ZpZWxkTmFtZX0gZmllbGQ6IFwidHlwZVwiIG9wdGlvbiBpcyByZXF1aXJlZGApO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodHlwZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBkZWZpbml0aW9uIGZvciAke2ZpZWxkTmFtZX0gZmllbGQ6IFwidHlwZVwiIG1heSBub3QgYmUgYW4gYXJyYXkuIENoYW5nZSBpdCB0byBBcnJheS5gKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0ICYmIGlzRW1wdHlPYmplY3QodHlwZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBkZWZpbml0aW9uIGZvciAke2ZpZWxkTmFtZX0gZmllbGQ6IFwidHlwZVwiIG1heSBub3QgYmUgYW4gb2JqZWN0LiBDaGFuZ2UgaXQgdG8gT2JqZWN0YCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT09IEFycmF5KSBjb3VsZEJlQXJyYXkgPSB0cnVlO1xuXG4gICAgaWYgKFNpbXBsZVNjaGVtYS5pc1NpbXBsZVNjaGVtYSh0eXBlKSkge1xuICAgICAgT2JqZWN0LmtleXModHlwZS5fc2NoZW1hKS5mb3JFYWNoKChzdWJLZXkpID0+IHtcbiAgICAgICAgY29uc3QgbmV3S2V5ID0gYCR7ZmllbGROYW1lfS4ke3N1YktleX1gO1xuICAgICAgICBpZiAoYWxsS2V5cy5oYXMobmV3S2V5KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHR5cGUgZm9yIFwiJHtmaWVsZE5hbWV9XCIgaXMgc2V0IHRvIGEgU2ltcGxlU2NoZW1hIGluc3RhbmNlIHRoYXQgZGVmaW5lcyBcIiR7bmV3S2V5fVwiLCBidXQgdGhlIHBhcmVudCBTaW1wbGVTY2hlbWEgaW5zdGFuY2UgYWxzbyB0cmllcyB0byBkZWZpbmUgXCIke25ld0tleX1cImApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIElmIGF0IGxlYXN0IG9uZSBvZiB0aGUgcG9zc2libGUgdHlwZXMgaXMgQXJyYXksIHRoZW4gbWFrZSBzdXJlIHdlIGhhdmUgYVxuICAvLyBkZWZpbml0aW9uIGZvciB0aGUgYXJyYXkgaXRlbXMsIHRvby5cbiAgaWYgKGNvdWxkQmVBcnJheSAmJiAhYWxsS2V5cy5oYXMoYCR7ZmllbGROYW1lfS4kYCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtmaWVsZE5hbWV9XCIgaXMgQXJyYXkgdHlwZSBidXQgdGhlIHNjaGVtYSBkb2VzIG5vdCBpbmNsdWRlIGEgXCIke2ZpZWxkTmFtZX0uJFwiIGRlZmluaXRpb24gZm9yIHRoZSBhcnJheSBpdGVtc1wiYCk7XG4gIH1cblxuICAvLyBkZWZhdWx0VmFsdWUgLT4gYXV0b1ZhbHVlXG4gIC8vIFdlIHN1cHBvcnQgZGVmYXVsdFZhbHVlIHNob3J0Y3V0IGJ5IGNvbnZlcnRpbmcgaXQgaW1tZWRpYXRlbHkgaW50byBhblxuICAvLyBhdXRvVmFsdWUuXG5cbiAgaWYgKCdkZWZhdWx0VmFsdWUnIGluIGRlZmluaXRpb24pIHtcbiAgICBpZiAoJ2F1dG9WYWx1ZScgaW4gZGVmaW5pdGlvbiAmJiAhZGVmaW5pdGlvbi5hdXRvVmFsdWUuaXNEZWZhdWx0KSB7XG4gICAgICBjb25zb2xlLndhcm4oYFNpbXBsZVNjaGVtYTogRm91bmQgYm90aCBhdXRvVmFsdWUgYW5kIGRlZmF1bHRWYWx1ZSBvcHRpb25zIGZvciBcIiR7ZmllbGROYW1lfVwiLiBJZ25vcmluZyBkZWZhdWx0VmFsdWUuYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChmaWVsZE5hbWUuZW5kc1dpdGgoJy4kJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbiBhcnJheSBpdGVtIGZpZWxkIChvbmUgdGhhdCBlbmRzIHdpdGggXCIuJFwiKSBjYW5ub3QgaGF2ZSBkZWZhdWx0VmFsdWUuJyk7XG4gICAgICB9XG4gICAgICBkZWZpbml0aW9uLmF1dG9WYWx1ZSA9IGdldERlZmF1bHRBdXRvVmFsdWVGdW5jdGlvbihkZWZpbml0aW9uLmRlZmF1bHRWYWx1ZSk7XG4gICAgICBkZWZpbml0aW9uLmF1dG9WYWx1ZS5pc0RlZmF1bHQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJFUVVJUkVETkVTU1xuICBpZiAoZmllbGROYW1lLmVuZHNXaXRoKCcuJCcpKSB7XG4gICAgZGVmaW5pdGlvbi5vcHRpb25hbCA9IHRydWU7XG4gIH0gZWxzZSBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkZWZpbml0aW9uLCAnb3B0aW9uYWwnKSkge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZGVmaW5pdGlvbiwgJ3JlcXVpcmVkJykpIHtcbiAgICAgIGlmICh0eXBlb2YgZGVmaW5pdGlvbi5yZXF1aXJlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBTYXZlIGEgcmVmZXJlbmNlIHRvIHRoZSBgcmVxdWlyZWRgIGZuIGJlY2F1c2VcbiAgICAgICAgLy8gd2UgYXJlIGdvaW5nIHRvIGRlbGV0ZSBpdCBmcm9tIGBkZWZpbml0aW9uYCBiZWxvd1xuICAgICAgICBjb25zdCByZXF1aXJlZEZuID0gZGVmaW5pdGlvbi5yZXF1aXJlZDtcbiAgICAgICAgZGVmaW5pdGlvbi5vcHRpb25hbCA9IGZ1bmN0aW9uIG9wdGlvbmFsKC4uLmFyZ3MpIHtcbiAgICAgICAgICByZXR1cm4gIXJlcXVpcmVkRm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZpbml0aW9uLm9wdGlvbmFsID0gIWRlZmluaXRpb24ucmVxdWlyZWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZmluaXRpb24ub3B0aW9uYWwgPSAob3B0aW9ucy5yZXF1aXJlZEJ5RGVmYXVsdCA9PT0gZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIGRlbGV0ZSBkZWZpbml0aW9uLnJlcXVpcmVkO1xuXG4gIC8vIExBQkVMU1xuICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkZWZpbml0aW9uLCAnbGFiZWwnKSkge1xuICAgIGlmIChvcHRpb25zLmRlZmF1bHRMYWJlbCkge1xuICAgICAgZGVmaW5pdGlvbi5sYWJlbCA9IG9wdGlvbnMuZGVmYXVsdExhYmVsO1xuICAgIH0gZWxzZSBpZiAoU2ltcGxlU2NoZW1hLmRlZmF1bHRMYWJlbCkge1xuICAgICAgZGVmaW5pdGlvbi5sYWJlbCA9IFNpbXBsZVNjaGVtYS5kZWZhdWx0TGFiZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZmluaXRpb24ubGFiZWwgPSBpbmZsZWN0ZWRMYWJlbChmaWVsZE5hbWUsIG9wdGlvbnMuaHVtYW5pemVBdXRvTGFiZWxzKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UGlja09yT21pdCh0eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBwaWNrT3JPbWl0KC4uLmFyZ3MpIHtcbiAgICAvLyBJZiB0aGV5IGFyZSBwaWNraW5nL29taXR0aW5nIGFuIG9iamVjdCBvciBhcnJheSBmaWVsZCwgd2UgbmVlZCB0byBhbHNvIGluY2x1ZGUgZXZlcnl0aGluZyB1bmRlciBpdFxuICAgIGNvbnN0IG5ld1NjaGVtYSA9IHt9O1xuICAgIHRoaXMuX3NjaGVtYUtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAvLyBQaWNrL29taXQgaXQgaWYgaXQgSVMgaW4gdGhlIGFycmF5IG9mIGtleXMgdGhleSB3YW50IE9SIGlmIGl0XG4gICAgICAvLyBTVEFSVFMgV0lUSCBzb21ldGhpbmcgdGhhdCBpcyBpbiB0aGUgYXJyYXkgcGx1cyBhIHBlcmlvZFxuICAgICAgY29uc3QgaW5jbHVkZUl0ID0gYXJncy5zb21lKCh3YW50ZWRGaWVsZCkgPT4ga2V5ID09PSB3YW50ZWRGaWVsZCB8fCBrZXkuaW5kZXhPZihgJHt3YW50ZWRGaWVsZH0uYCkgPT09IDApO1xuXG4gICAgICBpZiAoKGluY2x1ZGVJdCAmJiB0eXBlID09PSAncGljaycpIHx8ICghaW5jbHVkZUl0ICYmIHR5cGUgPT09ICdvbWl0JykpIHtcbiAgICAgICAgbmV3U2NoZW1hW2tleV0gPSB0aGlzLl9zY2hlbWFba2V5XTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLl9jb3B5V2l0aFNjaGVtYShuZXdTY2hlbWEpO1xuICB9O1xufVxuXG5leHBvcnQgeyBTaW1wbGVTY2hlbWEsIFZhbGlkYXRpb25Db250ZXh0IH07XG4iLCJpbXBvcnQgTW9uZ29PYmplY3QgZnJvbSAnbW9uZ28tb2JqZWN0JztcblxuY2xhc3MgU2ltcGxlU2NoZW1hR3JvdXAge1xuICBjb25zdHJ1Y3RvciguLi5kZWZpbml0aW9ucykge1xuICAgIHRoaXMuZGVmaW5pdGlvbnMgPSBkZWZpbml0aW9ucy5tYXAoKGRlZmluaXRpb24pID0+IHtcbiAgICAgIGlmIChNb25nb09iamVjdC5pc0Jhc2ljT2JqZWN0KGRlZmluaXRpb24pKSB7XG4gICAgICAgIHJldHVybiB7IC4uLmRlZmluaXRpb24gfTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRlZmluaXRpb24gaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgICAgcmVnRXg6IGRlZmluaXRpb24sXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7IHR5cGU6IGRlZmluaXRpb24gfTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBzaW5nbGVUeXBlKCkge1xuICAgIHJldHVybiB0aGlzLmRlZmluaXRpb25zWzBdLnR5cGU7XG4gIH1cblxuICBjbG9uZSgpIHtcbiAgICByZXR1cm4gbmV3IFNpbXBsZVNjaGVtYUdyb3VwKC4uLnRoaXMuZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgZXh0ZW5kKG90aGVyR3JvdXApIHtcbiAgICAvLyBXZSBleHRlbmQgYmFzZWQgb24gaW5kZXggYmVpbmcgdGhlIHNhbWUuIE5vIGJldHRlciB3YXkgSSBjYW4gdGhpbmsgb2YgYXQgdGhlIG1vbWVudC5cbiAgICB0aGlzLmRlZmluaXRpb25zID0gdGhpcy5kZWZpbml0aW9ucy5tYXAoKGRlZiwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IG90aGVyRGVmID0gb3RoZXJHcm91cC5kZWZpbml0aW9uc1tpbmRleF07XG4gICAgICBpZiAoIW90aGVyRGVmKSByZXR1cm4gZGVmO1xuICAgICAgcmV0dXJuIHsgLi4uZGVmLCAuLi5vdGhlckRlZiB9O1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNpbXBsZVNjaGVtYUdyb3VwO1xuIiwiaW1wb3J0IE1vbmdvT2JqZWN0IGZyb20gJ21vbmdvLW9iamVjdCc7XG5pbXBvcnQgZG9WYWxpZGF0aW9uIGZyb20gJy4vZG9WYWxpZGF0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFsaWRhdGlvbkNvbnRleHQge1xuICAvKipcbiAgICogQHBhcmFtIHtTaW1wbGVTY2hlbWF9IHNzIFNpbXBsZVNjaGVtYSBpbnN0YW5jZSB0byB1c2UgZm9yIHZhbGlkYXRpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IFtuYW1lXSBPcHRpb25hbCBjb250ZXh0IG5hbWUsIGFjY2Vzc2libGUgb24gY29udGV4dC5uYW1lLlxuICAgKi9cbiAgY29uc3RydWN0b3Ioc3MsIG5hbWUpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuX3NpbXBsZVNjaGVtYSA9IHNzO1xuICAgIHRoaXMuX3NjaGVtYSA9IHNzLnNjaGVtYSgpO1xuICAgIHRoaXMuX3NjaGVtYUtleXMgPSBPYmplY3Qua2V5cyh0aGlzLl9zY2hlbWEpO1xuICAgIHRoaXMuX3ZhbGlkYXRpb25FcnJvcnMgPSBbXTtcblxuICAgIC8vIFNldCB1cCB2YWxpZGF0aW9uIGRlcGVuZGVuY2llc1xuICAgIHRoaXMuX2RlcHMgPSB7fTtcbiAgICBjb25zdCB7IHRyYWNrZXIgfSA9IHNzLl9jb25zdHJ1Y3Rvck9wdGlvbnM7XG4gICAgaWYgKHRyYWNrZXIpIHtcbiAgICAgIHRoaXMuX2RlcHNBbnkgPSBuZXcgdHJhY2tlci5EZXBlbmRlbmN5KCk7XG4gICAgICB0aGlzLl9zY2hlbWFLZXlzLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICB0aGlzLl9kZXBzW2tleV0gPSBuZXcgdHJhY2tlci5EZXBlbmRlbmN5KCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfbWFya0tleUNoYW5nZWQoa2V5KSB7XG4gICAgY29uc3QgZ2VuZXJpY0tleSA9IE1vbmdvT2JqZWN0Lm1ha2VLZXlHZW5lcmljKGtleSk7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9kZXBzLCBnZW5lcmljS2V5KSkgdGhpcy5fZGVwc1tnZW5lcmljS2V5XS5jaGFuZ2VkKCk7XG4gIH1cblxuICBfbWFya0tleXNDaGFuZ2VkKGtleXMpIHtcbiAgICBpZiAoIWtleXMgfHwgIUFycmF5LmlzQXJyYXkoa2V5cykgfHwgIWtleXMubGVuZ3RoKSByZXR1cm47XG5cbiAgICBrZXlzLmZvckVhY2goKGtleSkgPT4gdGhpcy5fbWFya0tleUNoYW5nZWQoa2V5KSk7XG5cbiAgICB0aGlzLl9kZXBzQW55ICYmIHRoaXMuX2RlcHNBbnkuY2hhbmdlZCgpO1xuICB9XG5cbiAgc2V0VmFsaWRhdGlvbkVycm9ycyhlcnJvcnMpIHtcbiAgICBjb25zdCBwcmV2aW91c1ZhbGlkYXRpb25FcnJvcnMgPSB0aGlzLl92YWxpZGF0aW9uRXJyb3JzLm1hcCgobykgPT4gby5uYW1lKTtcbiAgICBjb25zdCBuZXdWYWxpZGF0aW9uRXJyb3JzID0gZXJyb3JzLm1hcCgobykgPT4gby5uYW1lKTtcblxuICAgIHRoaXMuX3ZhbGlkYXRpb25FcnJvcnMgPSBlcnJvcnM7XG5cbiAgICAvLyBNYXJrIGFsbCBwcmV2aW91cyBwbHVzIGFsbCBuZXcgYXMgY2hhbmdlZFxuICAgIGNvbnN0IGNoYW5nZWRLZXlzID0gcHJldmlvdXNWYWxpZGF0aW9uRXJyb3JzLmNvbmNhdChuZXdWYWxpZGF0aW9uRXJyb3JzKTtcbiAgICB0aGlzLl9tYXJrS2V5c0NoYW5nZWQoY2hhbmdlZEtleXMpO1xuICB9XG5cbiAgYWRkVmFsaWRhdGlvbkVycm9ycyhlcnJvcnMpIHtcbiAgICBjb25zdCBuZXdWYWxpZGF0aW9uRXJyb3JzID0gZXJyb3JzLm1hcCgobykgPT4gby5uYW1lKTtcblxuICAgIGVycm9ycy5mb3JFYWNoKChlcnJvcikgPT4gdGhpcy5fdmFsaWRhdGlvbkVycm9ycy5wdXNoKGVycm9yKSk7XG5cbiAgICAvLyBNYXJrIGFsbCBuZXcgYXMgY2hhbmdlZFxuICAgIHRoaXMuX21hcmtLZXlzQ2hhbmdlZChuZXdWYWxpZGF0aW9uRXJyb3JzKTtcbiAgfVxuXG4gIC8vIFJlc2V0IHRoZSB2YWxpZGF0aW9uRXJyb3JzIGFycmF5XG4gIHJlc2V0KCkge1xuICAgIHRoaXMuc2V0VmFsaWRhdGlvbkVycm9ycyhbXSk7XG4gIH1cblxuICBnZXRFcnJvckZvcktleShrZXksIGdlbmVyaWNLZXkgPSBNb25nb09iamVjdC5tYWtlS2V5R2VuZXJpYyhrZXkpKSB7XG4gICAgY29uc3QgZXJyb3JzID0gdGhpcy5fdmFsaWRhdGlvbkVycm9ycztcbiAgICBjb25zdCBlcnJvckZvcktleSA9IGVycm9ycy5maW5kKChlcnJvcikgPT4gZXJyb3IubmFtZSA9PT0ga2V5KTtcbiAgICBpZiAoZXJyb3JGb3JLZXkpIHJldHVybiBlcnJvckZvcktleTtcblxuICAgIHJldHVybiBlcnJvcnMuZmluZCgoZXJyb3IpID0+IGVycm9yLm5hbWUgPT09IGdlbmVyaWNLZXkpO1xuICB9XG5cbiAgX2tleUlzSW52YWxpZChrZXksIGdlbmVyaWNLZXkpIHtcbiAgICByZXR1cm4gISF0aGlzLmdldEVycm9yRm9yS2V5KGtleSwgZ2VuZXJpY0tleSk7XG4gIH1cblxuICAvLyBMaWtlIHRoZSBpbnRlcm5hbCBvbmUsIGJ1dCB3aXRoIGRlcHNcbiAga2V5SXNJbnZhbGlkKGtleSwgZ2VuZXJpY0tleSA9IE1vbmdvT2JqZWN0Lm1ha2VLZXlHZW5lcmljKGtleSkpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX2RlcHMsIGdlbmVyaWNLZXkpKSB0aGlzLl9kZXBzW2dlbmVyaWNLZXldLmRlcGVuZCgpO1xuXG4gICAgcmV0dXJuIHRoaXMuX2tleUlzSW52YWxpZChrZXksIGdlbmVyaWNLZXkpO1xuICB9XG5cbiAga2V5RXJyb3JNZXNzYWdlKGtleSwgZ2VuZXJpY0tleSA9IE1vbmdvT2JqZWN0Lm1ha2VLZXlHZW5lcmljKGtleSkpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuX2RlcHMsIGdlbmVyaWNLZXkpKSB0aGlzLl9kZXBzW2dlbmVyaWNLZXldLmRlcGVuZCgpO1xuXG4gICAgY29uc3QgZXJyb3JPYmogPSB0aGlzLmdldEVycm9yRm9yS2V5KGtleSwgZ2VuZXJpY0tleSk7XG4gICAgaWYgKCFlcnJvck9iaikgcmV0dXJuICcnO1xuXG4gICAgcmV0dXJuIHRoaXMuX3NpbXBsZVNjaGVtYS5tZXNzYWdlRm9yRXJyb3IoZXJyb3JPYmopO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlcyB0aGUgb2JqZWN0IGFnYWluc3QgdGhlIHNpbXBsZSBzY2hlbWEgYW5kIHNldHMgYSByZWFjdGl2ZSBhcnJheSBvZiBlcnJvciBvYmplY3RzXG4gICAqL1xuICB2YWxpZGF0ZShvYmosIHtcbiAgICBleHRlbmRlZEN1c3RvbUNvbnRleHQgPSB7fSxcbiAgICBpZ25vcmU6IGlnbm9yZVR5cGVzID0gW10sXG4gICAga2V5czoga2V5c1RvVmFsaWRhdGUsXG4gICAgbW9kaWZpZXI6IGlzTW9kaWZpZXIgPSBmYWxzZSxcbiAgICBtb25nb09iamVjdCxcbiAgICB1cHNlcnQ6IGlzVXBzZXJ0ID0gZmFsc2UsXG4gIH0gPSB7fSkge1xuICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvcnMgPSBkb1ZhbGlkYXRpb24oe1xuICAgICAgZXh0ZW5kZWRDdXN0b21Db250ZXh0LFxuICAgICAgaWdub3JlVHlwZXMsXG4gICAgICBpc01vZGlmaWVyLFxuICAgICAgaXNVcHNlcnQsXG4gICAgICBrZXlzVG9WYWxpZGF0ZSxcbiAgICAgIG1vbmdvT2JqZWN0LFxuICAgICAgb2JqLFxuICAgICAgc2NoZW1hOiB0aGlzLl9zaW1wbGVTY2hlbWEsXG4gICAgICB2YWxpZGF0aW9uQ29udGV4dDogdGhpcyxcbiAgICB9KTtcblxuICAgIGlmIChrZXlzVG9WYWxpZGF0ZSkge1xuICAgICAgLy8gV2UgaGF2ZSBvbmx5IHJldmFsaWRhdGVkIHRoZSBsaXN0ZWQga2V5cywgc28gaWYgdGhlcmVcbiAgICAgIC8vIGFyZSBhbnkgb3RoZXIgZXhpc3RpbmcgZXJyb3JzIHRoYXQgYXJlIE5PVCBpbiB0aGUga2V5cyBsaXN0LFxuICAgICAgLy8gd2Ugc2hvdWxkIGtlZXAgdGhlc2UgZXJyb3JzLlxuICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tcmVzdHJpY3RlZC1zeW50YXggKi9cbiAgICAgIGZvciAoY29uc3QgZXJyb3Igb2YgdGhpcy5fdmFsaWRhdGlvbkVycm9ycykge1xuICAgICAgICBjb25zdCB3YXNWYWxpZGF0ZWQgPSBrZXlzVG9WYWxpZGF0ZS5zb21lKChrZXkpID0+IGtleSA9PT0gZXJyb3IubmFtZSB8fCBlcnJvci5uYW1lLnN0YXJ0c1dpdGgoYCR7a2V5fS5gKSk7XG4gICAgICAgIGlmICghd2FzVmFsaWRhdGVkKSB2YWxpZGF0aW9uRXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgfVxuICAgICAgLyogZXNsaW50LWVuYWJsZSBuby1yZXN0cmljdGVkLXN5bnRheCAqL1xuICAgIH1cblxuICAgIHRoaXMuc2V0VmFsaWRhdGlvbkVycm9ycyh2YWxpZGF0aW9uRXJyb3JzKTtcblxuICAgIC8vIFJldHVybiB0cnVlIGlmIGl0IHdhcyB2YWxpZDsgb3RoZXJ3aXNlLCByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gIXZhbGlkYXRpb25FcnJvcnMubGVuZ3RoO1xuICB9XG5cbiAgaXNWYWxpZCgpIHtcbiAgICB0aGlzLl9kZXBzQW55ICYmIHRoaXMuX2RlcHNBbnkuZGVwZW5kKCk7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgdmFsaWRhdGlvbkVycm9ycygpIHtcbiAgICB0aGlzLl9kZXBzQW55ICYmIHRoaXMuX2RlcHNBbnkuZGVwZW5kKCk7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRpb25FcnJvcnM7XG4gIH1cblxuICBjbGVhbiguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NpbXBsZVNjaGVtYS5jbGVhbiguLi5hcmdzKTtcbiAgfVxufVxuIiwiaW1wb3J0IGNsb25lIGZyb20gJ2Nsb25lJztcbmltcG9ydCBNb25nb09iamVjdCBmcm9tICdtb25nby1vYmplY3QnO1xuaW1wb3J0IHsgaXNFbXB0eU9iamVjdCwgbG9va3NMaWtlTW9kaWZpZXIgfSBmcm9tICcuL3V0aWxpdHknO1xuaW1wb3J0IHsgU2ltcGxlU2NoZW1hIH0gZnJvbSAnLi9TaW1wbGVTY2hlbWEnO1xuaW1wb3J0IGNvbnZlcnRUb1Byb3BlclR5cGUgZnJvbSAnLi9jbGVhbi9jb252ZXJ0VG9Qcm9wZXJUeXBlJztcbmltcG9ydCBzZXRBdXRvVmFsdWVzIGZyb20gJy4vY2xlYW4vc2V0QXV0b1ZhbHVlcyc7XG5pbXBvcnQgdHlwZVZhbGlkYXRvciBmcm9tICcuL3ZhbGlkYXRpb24vdHlwZVZhbGlkYXRvcic7XG5cbmNvbnN0IG9wZXJhdG9yc1RvSWdub3JlVmFsdWUgPSBbJyR1bnNldCcsICckY3VycmVudERhdGUnXTtcblxuLyoqXG4gKiBAcGFyYW0ge1NpbXBsZVNjaGVtYX0gc3MgLSBBIFNpbXBsZVNjaGVtYSBpbnN0YW5jZVxuICogQHBhcmFtIHtPYmplY3R9IGRvYyAtIERvY3VtZW50IG9yIG1vZGlmaWVyIHRvIGNsZWFuLiBSZWZlcmVuY2VkIG9iamVjdCB3aWxsIGJlIG1vZGlmaWVkIGluIHBsYWNlLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5tdXRhdGU9ZmFsc2VdIC0gTXV0YXRlIGRvYy4gU2V0IHRoaXMgdG8gdHJ1ZSB0byBpbXByb3ZlIHBlcmZvcm1hbmNlIGlmIHlvdSBkb24ndCBtaW5kIG11dGF0aW5nIHRoZSBvYmplY3QgeW91J3JlIGNsZWFuaW5nLlxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5maWx0ZXI9dHJ1ZV0gLSBEbyBmaWx0ZXJpbmc/XG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmF1dG9Db252ZXJ0PXRydWVdIC0gRG8gYXV0b21hdGljIHR5cGUgY29udmVydGluZz9cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMucmVtb3ZlRW1wdHlTdHJpbmdzPXRydWVdIC0gUmVtb3ZlIGtleXMgaW4gbm9ybWFsIG9iamVjdCBvciAkc2V0IHdoZXJlIHRoZSB2YWx1ZSBpcyBhbiBlbXB0eSBzdHJpbmc/XG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU51bGxzRnJvbUFycmF5cz1mYWxzZV0gLSBSZW1vdmUgYWxsIG51bGwgaXRlbXMgZnJvbSBhbGwgYXJyYXlzXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLnRyaW1TdHJpbmdzPXRydWVdIC0gVHJpbSBzdHJpbmcgdmFsdWVzP1xuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5nZXRBdXRvVmFsdWVzPXRydWVdIC0gSW5qZWN0IGF1dG9tYXRpYyBhbmQgZGVmYXVsdCB2YWx1ZXM/XG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmlzTW9kaWZpZXI9ZmFsc2VdIC0gSXMgZG9jIGEgbW9kaWZpZXIgb2JqZWN0P1xuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5pc1Vwc2VydD1mYWxzZV0gLSBXaWxsIHRoZSBtb2RpZmllciBvYmplY3QgYmUgdXNlZCB0byBkbyBhbiB1cHNlcnQ/IFRoaXMgaXMgdXNlZFxuICogICB0byBkZXRlcm1pbmUgd2hldGhlciAkc2V0T25JbnNlcnQgc2hvdWxkIGJlIGFkZGVkIHRvIGl0IGZvciBkZWZhdWx0VmFsdWVzLlxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5tb25nb09iamVjdF0gLSBJZiB5b3UgYWxyZWFkeSBoYXZlIHRoZSBtb25nb09iamVjdCBpbnN0YW5jZSwgcGFzcyBpdCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnMuZXh0ZW5kQXV0b1ZhbHVlQ29udGV4dF0gLSBUaGlzIG9iamVjdCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBgdGhpc2AgY29udGV4dCBvZiBhdXRvVmFsdWUgZnVuY3Rpb25zLlxuICogQHJldHVybnMge09iamVjdH0gVGhlIG1vZGlmaWVkIGRvYy5cbiAqXG4gKiBDbGVhbnMgYSBkb2N1bWVudCBvciBtb2RpZmllciBvYmplY3QuIEJ5IGRlZmF1bHQsIHdpbGwgZmlsdGVyLCBhdXRvbWF0aWNhbGx5XG4gKiB0eXBlIGNvbnZlcnQgd2hlcmUgcG9zc2libGUsIGFuZCBpbmplY3QgYXV0b21hdGljL2RlZmF1bHQgdmFsdWVzLiBVc2UgdGhlIG9wdGlvbnNcbiAqIHRvIHNraXAgb25lIG9yIG1vcmUgb2YgdGhlc2UuXG4gKi9cbmZ1bmN0aW9uIGNsZWFuKHNzLCBkb2MsIG9wdGlvbnMgPSB7fSkge1xuICAvLyBCeSBkZWZhdWx0LCBkb2Mgd2lsbCBiZSBmaWx0ZXJlZCBhbmQgYXV0b2NvbnZlcnRlZFxuICBvcHRpb25zID0ge1xuICAgIGlzTW9kaWZpZXI6IGxvb2tzTGlrZU1vZGlmaWVyKGRvYyksXG4gICAgaXNVcHNlcnQ6IGZhbHNlLFxuICAgIC4uLnNzLl9jbGVhbk9wdGlvbnMsXG4gICAgLi4ub3B0aW9ucyxcbiAgfTtcblxuICAvLyBDbG9uZSBzbyB3ZSBkbyBub3QgbXV0YXRlXG4gIGNvbnN0IGNsZWFuRG9jID0gb3B0aW9ucy5tdXRhdGUgPyBkb2MgOiBjbG9uZShkb2MpO1xuXG4gIGNvbnN0IG1vbmdvT2JqZWN0ID0gb3B0aW9ucy5tb25nb09iamVjdCB8fCBuZXcgTW9uZ29PYmplY3QoY2xlYW5Eb2MsIHNzLmJsYWNrYm94S2V5cygpKTtcblxuICAvLyBDbGVhbiBsb29wXG4gIGlmIChcbiAgICBvcHRpb25zLmZpbHRlclxuICAgIHx8IG9wdGlvbnMuYXV0b0NvbnZlcnRcbiAgICB8fCBvcHRpb25zLnJlbW92ZUVtcHR5U3RyaW5nc1xuICAgIHx8IG9wdGlvbnMudHJpbVN0cmluZ3NcbiAgKSB7XG4gICAgY29uc3QgcmVtb3ZlZFBvc2l0aW9ucyA9IFtdOyAvLyBGb3IgcmVtb3Zpbmcgbm93LWVtcHR5IG9iamVjdHMgYWZ0ZXJcblxuICAgIG1vbmdvT2JqZWN0LmZvckVhY2hOb2RlKFxuICAgICAgZnVuY3Rpb24gZWFjaE5vZGUoKSB7XG4gICAgICAgIC8vIFRoZSB2YWx1ZSBvZiBhICR1bnNldCBpcyBpcnJlbGV2YW50LCBzbyBubyBwb2ludCBpbiBjbGVhbmluZyBpdC5cbiAgICAgICAgLy8gQWxzbyB3ZSBkbyBub3QgY2FyZSBpZiBmaWVsZHMgbm90IGluIHRoZSBzY2hlbWEgYXJlIHVuc2V0LlxuICAgICAgICAvLyBPdGhlciBvcGVyYXRvcnMgYWxzbyBoYXZlIHZhbHVlcyB0aGF0IHdlIHdvdWxkbid0IHdhbnQgdG8gY2xlYW4uXG4gICAgICAgIGlmIChvcGVyYXRvcnNUb0lnbm9yZVZhbHVlLmluY2x1ZGVzKHRoaXMub3BlcmF0b3IpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZ0tleSA9IHRoaXMuZ2VuZXJpY0tleTtcbiAgICAgICAgaWYgKCFnS2V5KSByZXR1cm47XG5cbiAgICAgICAgbGV0IHZhbCA9IHRoaXMudmFsdWU7XG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBwO1xuXG4gICAgICAgIC8vIEZpbHRlciBvdXQgcHJvcHMgaWYgbmVjZXNzYXJ5XG4gICAgICAgIGlmIChcbiAgICAgICAgICAob3B0aW9ucy5maWx0ZXIgJiYgIXNzLmFsbG93c0tleShnS2V5KSlcbiAgICAgICAgICB8fCAob3B0aW9ucy5yZW1vdmVOdWxsc0Zyb21BcnJheXMgJiYgdGhpcy5pc0FycmF5SXRlbSAmJiB2YWwgPT09IG51bGwpXG4gICAgICAgICkge1xuICAgICAgICAgIC8vIFhYWCBTcGVjaWFsIGhhbmRsaW5nIGZvciAkZWFjaDsgbWF5YmUgdGhpcyBjb3VsZCBiZSBtYWRlIG5pY2VyXG4gICAgICAgICAgaWYgKHRoaXMucG9zaXRpb24uc2xpY2UoLTcpID09PSAnWyRlYWNoXScpIHtcbiAgICAgICAgICAgIG1vbmdvT2JqZWN0LnJlbW92ZVZhbHVlRm9yUG9zaXRpb24odGhpcy5wb3NpdGlvbi5zbGljZSgwLCAtNykpO1xuICAgICAgICAgICAgcmVtb3ZlZFBvc2l0aW9ucy5wdXNoKHRoaXMucG9zaXRpb24uc2xpY2UoMCwgLTcpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgIHJlbW92ZWRQb3NpdGlvbnMucHVzaCh0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFNpbXBsZVNjaGVtYS5kZWJ1Zykge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICAgICAgICBgU2ltcGxlU2NoZW1hLmNsZWFuOiBmaWx0ZXJlZCBvdXQgdmFsdWUgdGhhdCB3b3VsZCBoYXZlIGFmZmVjdGVkIGtleSBcIiR7Z0tleX1cIiwgd2hpY2ggaXMgbm90IGFsbG93ZWQgYnkgdGhlIHNjaGVtYWAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47IC8vIG5vIHJlYXNvbiB0byBkbyBtb3JlXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvdXRlckRlZiA9IHNzLnNjaGVtYShnS2V5KTtcbiAgICAgICAgY29uc3QgZGVmcyA9IG91dGVyRGVmICYmIG91dGVyRGVmLnR5cGUuZGVmaW5pdGlvbnM7XG4gICAgICAgIGNvbnN0IGRlZiA9IGRlZnMgJiYgZGVmc1swXTtcblxuICAgICAgICAvLyBBdXRvY29udmVydCB2YWx1ZXMgaWYgcmVxdWVzdGVkIGFuZCBpZiBwb3NzaWJsZVxuICAgICAgICBpZiAob3B0aW9ucy5hdXRvQ29udmVydCAmJiBkZWYpIHtcbiAgICAgICAgICBjb25zdCBpc1ZhbGlkVHlwZSA9IGRlZnMuc29tZSgoZGVmaW5pdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdHlwZVZhbGlkYXRvci5jYWxsKHtcbiAgICAgICAgICAgICAgdmFsdWVTaG91bGRCZUNoZWNrZWQ6IHRydWUsXG4gICAgICAgICAgICAgIGRlZmluaXRpb24sXG4gICAgICAgICAgICAgIHZhbHVlOiB2YWwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBlcnJvcnMgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmICghaXNWYWxpZFR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1ZhbCA9IGNvbnZlcnRUb1Byb3BlclR5cGUodmFsLCBkZWYudHlwZSk7XG4gICAgICAgICAgICBpZiAobmV3VmFsICE9PSB1bmRlZmluZWQgJiYgbmV3VmFsICE9PSB2YWwpIHtcbiAgICAgICAgICAgICAgU2ltcGxlU2NoZW1hLmRlYnVnXG4gICAgICAgICAgICAgICAgJiYgY29uc29sZS5pbmZvKFxuICAgICAgICAgICAgICAgICAgYFNpbXBsZVNjaGVtYS5jbGVhbjogYXV0b2NvbnZlcnRlZCB2YWx1ZSAke3ZhbH0gZnJvbSAke3R5cGVvZiB2YWx9IHRvICR7dHlwZW9mIG5ld1ZhbH0gZm9yICR7Z0tleX1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHZhbCA9IG5ld1ZhbDtcbiAgICAgICAgICAgICAgdGhpcy51cGRhdGVWYWx1ZShuZXdWYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRyaW0gc3RyaW5ncyBpZlxuICAgICAgICAvLyAxLiBUaGUgdHJpbVN0cmluZ3Mgb3B0aW9uIGlzIGB0cnVlYCBBTkRcbiAgICAgICAgLy8gMi4gVGhlIGZpZWxkIGlzIG5vdCBpbiB0aGUgc2NoZW1hIE9SIGlzIGluIHRoZSBzY2hlbWEgd2l0aCBgdHJpbWAgIT09IGBmYWxzZWAgQU5EXG4gICAgICAgIC8vIDMuIFRoZSB2YWx1ZSBpcyBhIHN0cmluZy5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIG9wdGlvbnMudHJpbVN0cmluZ3NcbiAgICAgICAgICAmJiAoIWRlZiB8fCBkZWYudHJpbSAhPT0gZmFsc2UpXG4gICAgICAgICAgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZydcbiAgICAgICAgKSB7XG4gICAgICAgICAgdmFsID0gdmFsLnRyaW0oKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVZhbHVlKHZhbCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgZW1wdHkgc3RyaW5ncyBpZlxuICAgICAgICAvLyAxLiBUaGUgcmVtb3ZlRW1wdHlTdHJpbmdzIG9wdGlvbiBpcyBgdHJ1ZWAgQU5EXG4gICAgICAgIC8vIDIuIFRoZSB2YWx1ZSBpcyBpbiBhIG5vcm1hbCBvYmplY3Qgb3IgaW4gdGhlICRzZXQgcGFydCBvZiBhIG1vZGlmaWVyXG4gICAgICAgIC8vIDMuIFRoZSB2YWx1ZSBpcyBhbiBlbXB0eSBzdHJpbmcuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBvcHRpb25zLnJlbW92ZUVtcHR5U3RyaW5nc1xuICAgICAgICAgICYmICghdGhpcy5vcGVyYXRvciB8fCB0aGlzLm9wZXJhdG9yID09PSAnJHNldCcpXG4gICAgICAgICAgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZydcbiAgICAgICAgICAmJiAhdmFsLmxlbmd0aFxuICAgICAgICApIHtcbiAgICAgICAgICAvLyBGb3IgYSBkb2N1bWVudCwgd2UgcmVtb3ZlIGFueSBmaWVsZHMgdGhhdCBhcmUgYmVpbmcgc2V0IHRvIGFuIGVtcHR5IHN0cmluZ1xuICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgLy8gRm9yIGEgbW9kaWZpZXIsIHdlICR1bnNldCBhbnkgZmllbGRzIHRoYXQgYXJlIGJlaW5nIHNldCB0byBhbiBlbXB0eSBzdHJpbmcuXG4gICAgICAgICAgLy8gQnV0IG9ubHkgaWYgd2UncmUgbm90IGFscmVhZHkgd2l0aGluIGFuIGVudGlyZSBvYmplY3QgdGhhdCBpcyBiZWluZyBzZXQuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5vcGVyYXRvciA9PT0gJyRzZXQnXG4gICAgICAgICAgICAmJiB0aGlzLnBvc2l0aW9uLm1hdGNoKC9cXFsvZykubGVuZ3RoIDwgMlxuICAgICAgICAgICkge1xuICAgICAgICAgICAgcCA9IHRoaXMucG9zaXRpb24ucmVwbGFjZSgnJHNldCcsICckdW5zZXQnKTtcbiAgICAgICAgICAgIG1vbmdvT2JqZWN0LnNldFZhbHVlRm9yUG9zaXRpb24ocCwgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHsgZW5kUG9pbnRzT25seTogZmFsc2UgfSxcbiAgICApO1xuXG4gICAgLy8gUmVtb3ZlIGFueSBvYmplY3RzIHRoYXQgYXJlIG5vdyBlbXB0eSBhZnRlciBmaWx0ZXJpbmdcbiAgICByZW1vdmVkUG9zaXRpb25zLmZvckVhY2goKHJlbW92ZWRQb3NpdGlvbikgPT4ge1xuICAgICAgY29uc3QgbGFzdEJyYWNlID0gcmVtb3ZlZFBvc2l0aW9uLmxhc3RJbmRleE9mKCdbJyk7XG4gICAgICBpZiAobGFzdEJyYWNlICE9PSAtMSkge1xuICAgICAgICBjb25zdCByZW1vdmVkUG9zaXRpb25QYXJlbnQgPSByZW1vdmVkUG9zaXRpb24uc2xpY2UoMCwgbGFzdEJyYWNlKTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBtb25nb09iamVjdC5nZXRWYWx1ZUZvclBvc2l0aW9uKHJlbW92ZWRQb3NpdGlvblBhcmVudCk7XG4gICAgICAgIGlmIChpc0VtcHR5T2JqZWN0KHZhbHVlKSkgbW9uZ29PYmplY3QucmVtb3ZlVmFsdWVGb3JQb3NpdGlvbihyZW1vdmVkUG9zaXRpb25QYXJlbnQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbW9uZ29PYmplY3QucmVtb3ZlQXJyYXlJdGVtcygpO1xuICB9XG5cbiAgLy8gU2V0IGF1dG9tYXRpYyB2YWx1ZXNcbiAgb3B0aW9ucy5nZXRBdXRvVmFsdWVzXG4gICAgJiYgc2V0QXV0b1ZhbHVlcyhcbiAgICAgIHNzLmF1dG9WYWx1ZUZ1bmN0aW9ucygpLFxuICAgICAgbW9uZ29PYmplY3QsXG4gICAgICBvcHRpb25zLmlzTW9kaWZpZXIsXG4gICAgICBvcHRpb25zLmlzVXBzZXJ0LFxuICAgICAgb3B0aW9ucy5leHRlbmRBdXRvVmFsdWVDb250ZXh0LFxuICAgICk7XG5cbiAgLy8gRW5zdXJlIHdlIGRvbid0IGhhdmUgYW55IG9wZXJhdG9ycyBzZXQgdG8gYW4gZW1wdHkgb2JqZWN0XG4gIC8vIHNpbmNlIE1vbmdvREIgMi42KyB3aWxsIHRocm93IGVycm9ycy5cbiAgaWYgKG9wdGlvbnMuaXNNb2RpZmllcikge1xuICAgIE9iamVjdC5rZXlzKGNsZWFuRG9jIHx8IHt9KS5mb3JFYWNoKChvcCkgPT4ge1xuICAgICAgY29uc3Qgb3BlcmF0b3JWYWx1ZSA9IGNsZWFuRG9jW29wXTtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIG9wZXJhdG9yVmFsdWUgPT09ICdvYmplY3QnXG4gICAgICAgICYmIG9wZXJhdG9yVmFsdWUgIT09IG51bGxcbiAgICAgICAgJiYgaXNFbXB0eU9iamVjdChvcGVyYXRvclZhbHVlKVxuICAgICAgKSB7XG4gICAgICAgIGRlbGV0ZSBjbGVhbkRvY1tvcF07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gY2xlYW5Eb2M7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsZWFuO1xuIiwiaW1wb3J0IHJlZ0V4cE9iaiBmcm9tICcuL3JlZ0V4cCc7XG5cbmNvbnN0IHJlZ0V4cE1lc3NhZ2VzID0gW1xuICB7IGV4cDogcmVnRXhwT2JqLkVtYWlsLCBtc2c6ICdtdXN0IGJlIGEgdmFsaWQgZW1haWwgYWRkcmVzcycgfSxcbiAgeyBleHA6IHJlZ0V4cE9iai5FbWFpbFdpdGhUTEQsIG1zZzogJ211c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzJyB9LFxuICB7IGV4cDogcmVnRXhwT2JqLkRvbWFpbiwgbXNnOiAnbXVzdCBiZSBhIHZhbGlkIGRvbWFpbicgfSxcbiAgeyBleHA6IHJlZ0V4cE9iai5XZWFrRG9tYWluLCBtc2c6ICdtdXN0IGJlIGEgdmFsaWQgZG9tYWluJyB9LFxuICB7IGV4cDogcmVnRXhwT2JqLklQLCBtc2c6ICdtdXN0IGJlIGEgdmFsaWQgSVB2NCBvciBJUHY2IGFkZHJlc3MnIH0sXG4gIHsgZXhwOiByZWdFeHBPYmouSVB2NCwgbXNnOiAnbXVzdCBiZSBhIHZhbGlkIElQdjQgYWRkcmVzcycgfSxcbiAgeyBleHA6IHJlZ0V4cE9iai5JUHY2LCBtc2c6ICdtdXN0IGJlIGEgdmFsaWQgSVB2NiBhZGRyZXNzJyB9LFxuICB7IGV4cDogcmVnRXhwT2JqLlVybCwgbXNnOiAnbXVzdCBiZSBhIHZhbGlkIFVSTCcgfSxcbiAgeyBleHA6IHJlZ0V4cE9iai5JZCwgbXNnOiAnbXVzdCBiZSBhIHZhbGlkIGFscGhhbnVtZXJpYyBJRCcgfSxcbiAgeyBleHA6IHJlZ0V4cE9iai5aaXBDb2RlLCBtc2c6ICdtdXN0IGJlIGEgdmFsaWQgWklQIGNvZGUnIH0sXG4gIHsgZXhwOiByZWdFeHBPYmouUGhvbmUsIG1zZzogJ211c3QgYmUgYSB2YWxpZCBwaG9uZSBudW1iZXInIH0sXG5dO1xuXG5jb25zdCBkZWZhdWx0TWVzc2FnZXMgPSB7XG4gIGluaXRpYWxMYW5ndWFnZTogJ2VuJyxcbiAgbWVzc2FnZXM6IHtcbiAgICBlbjoge1xuICAgICAgcmVxdWlyZWQ6ICd7e3tsYWJlbH19fSBpcyByZXF1aXJlZCcsXG4gICAgICBtaW5TdHJpbmc6ICd7e3tsYWJlbH19fSBtdXN0IGJlIGF0IGxlYXN0IHt7bWlufX0gY2hhcmFjdGVycycsXG4gICAgICBtYXhTdHJpbmc6ICd7e3tsYWJlbH19fSBjYW5ub3QgZXhjZWVkIHt7bWF4fX0gY2hhcmFjdGVycycsXG4gICAgICBtaW5OdW1iZXI6ICd7e3tsYWJlbH19fSBtdXN0IGJlIGF0IGxlYXN0IHt7bWlufX0nLFxuICAgICAgbWF4TnVtYmVyOiAne3t7bGFiZWx9fX0gY2Fubm90IGV4Y2VlZCB7e21heH19JyxcbiAgICAgIG1pbk51bWJlckV4Y2x1c2l2ZTogJ3t7e2xhYmVsfX19IG11c3QgYmUgZ3JlYXRlciB0aGFuIHt7bWlufX0nLFxuICAgICAgbWF4TnVtYmVyRXhjbHVzaXZlOiAne3t7bGFiZWx9fX0gbXVzdCBiZSBsZXNzIHRoYW4ge3ttYXh9fScsXG4gICAgICBtaW5EYXRlOiAne3t7bGFiZWx9fX0gbXVzdCBiZSBvbiBvciBhZnRlciB7e21pbn19JyxcbiAgICAgIG1heERhdGU6ICd7e3tsYWJlbH19fSBjYW5ub3QgYmUgYWZ0ZXIge3ttYXh9fScsXG4gICAgICBiYWREYXRlOiAne3t7bGFiZWx9fX0gaXMgbm90IGEgdmFsaWQgZGF0ZScsXG4gICAgICBtaW5Db3VudDogJ1lvdSBtdXN0IHNwZWNpZnkgYXQgbGVhc3Qge3ttaW5Db3VudH19IHZhbHVlcycsXG4gICAgICBtYXhDb3VudDogJ1lvdSBjYW5ub3Qgc3BlY2lmeSBtb3JlIHRoYW4ge3ttYXhDb3VudH19IHZhbHVlcycsXG4gICAgICBub0RlY2ltYWw6ICd7e3tsYWJlbH19fSBtdXN0IGJlIGFuIGludGVnZXInLFxuICAgICAgbm90QWxsb3dlZDogJ3t7e3ZhbHVlfX19IGlzIG5vdCBhbiBhbGxvd2VkIHZhbHVlJyxcbiAgICAgIGV4cGVjdGVkVHlwZTogJ3t7e2xhYmVsfX19IG11c3QgYmUgb2YgdHlwZSB7e2RhdGFUeXBlfX0nLFxuICAgICAgcmVnRXgoe1xuICAgICAgICBsYWJlbCxcbiAgICAgICAgcmVnRXhwLFxuICAgICAgfSkge1xuICAgICAgICAvLyBTZWUgaWYgdGhlcmUncyBvbmUgd2hlcmUgZXhwIG1hdGNoZXMgdGhpcyBleHByZXNzaW9uXG4gICAgICAgIGxldCBtc2dPYmo7XG4gICAgICAgIGlmIChyZWdFeHApIHtcbiAgICAgICAgICBtc2dPYmogPSByZWdFeHBNZXNzYWdlcy5maW5kKChvKSA9PiBvLmV4cCAmJiBvLmV4cC50b1N0cmluZygpID09PSByZWdFeHApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVnRXhwTWVzc2FnZSA9IG1zZ09iaiA/IG1zZ09iai5tc2cgOiAnZmFpbGVkIHJlZ3VsYXIgZXhwcmVzc2lvbiB2YWxpZGF0aW9uJztcblxuICAgICAgICByZXR1cm4gYCR7bGFiZWx9ICR7cmVnRXhwTWVzc2FnZX1gO1xuICAgICAgfSxcbiAgICAgIGtleU5vdEluU2NoZW1hOiAne3tuYW1lfX0gaXMgbm90IGFsbG93ZWQgYnkgdGhlIHNjaGVtYScsXG4gICAgfSxcbiAgfSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmF1bHRNZXNzYWdlcztcbiIsImltcG9ydCBNb25nb09iamVjdCBmcm9tICdtb25nby1vYmplY3QnO1xuaW1wb3J0IHsgU2ltcGxlU2NoZW1hIH0gZnJvbSAnLi9TaW1wbGVTY2hlbWEnO1xuaW1wb3J0IHtcbiAgYXBwZW5kQWZmZWN0ZWRLZXksXG4gIGdldFBhcmVudE9mS2V5LFxuICBsb29rc0xpa2VNb2RpZmllcixcbiAgaXNPYmplY3RXZVNob3VsZFRyYXZlcnNlLFxufSBmcm9tICcuL3V0aWxpdHknO1xuaW1wb3J0IHR5cGVWYWxpZGF0b3IgZnJvbSAnLi92YWxpZGF0aW9uL3R5cGVWYWxpZGF0b3InO1xuaW1wb3J0IHJlcXVpcmVkVmFsaWRhdG9yIGZyb20gJy4vdmFsaWRhdGlvbi9yZXF1aXJlZFZhbGlkYXRvcic7XG5pbXBvcnQgYWxsb3dlZFZhbHVlc1ZhbGlkYXRvciBmcm9tICcuL3ZhbGlkYXRpb24vYWxsb3dlZFZhbHVlc1ZhbGlkYXRvcic7XG5cbmZ1bmN0aW9uIHNob3VsZENoZWNrKGtleSkge1xuICBpZiAoa2V5ID09PSAnJHB1c2hBbGwnKSB0aHJvdyBuZXcgRXJyb3IoJyRwdXNoQWxsIGlzIG5vdCBzdXBwb3J0ZWQ7IHVzZSAkcHVzaCArICRlYWNoJyk7XG4gIHJldHVybiBbJyRwdWxsJywgJyRwdWxsQWxsJywgJyRwb3AnLCAnJHNsaWNlJ10uaW5kZXhPZihrZXkpID09PSAtMTtcbn1cblxuZnVuY3Rpb24gZG9WYWxpZGF0aW9uKHtcbiAgZXh0ZW5kZWRDdXN0b21Db250ZXh0LFxuICBpZ25vcmVUeXBlcyxcbiAgaXNNb2RpZmllcixcbiAgaXNVcHNlcnQsXG4gIGtleXNUb1ZhbGlkYXRlLFxuICBtb25nb09iamVjdCxcbiAgb2JqLFxuICBzY2hlbWEsXG4gIHZhbGlkYXRpb25Db250ZXh0LFxufSkge1xuICAvLyBGaXJzdCBkbyBzb21lIGJhc2ljIGNoZWNrcyBvZiB0aGUgb2JqZWN0LCBhbmQgdGhyb3cgZXJyb3JzIGlmIG5lY2Vzc2FyeVxuICBpZiAoIW9iaiB8fCAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iaiAhPT0gJ2Z1bmN0aW9uJykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBmaXJzdCBhcmd1bWVudCBvZiB2YWxpZGF0ZSgpIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cblxuICBpZiAoIWlzTW9kaWZpZXIgJiYgbG9va3NMaWtlTW9kaWZpZXIob2JqKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignV2hlbiB0aGUgdmFsaWRhdGlvbiBvYmplY3QgY29udGFpbnMgbW9uZ28gb3BlcmF0b3JzLCB5b3UgbXVzdCBzZXQgdGhlIG1vZGlmaWVyIG9wdGlvbiB0byB0cnVlJyk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRGaWVsZEluZm8oa2V5KSB7XG4gICAgLy8gQ3JlYXRlIG1vbmdvT2JqZWN0IGlmIG5lY2Vzc2FyeSwgY2FjaGUgZm9yIHNwZWVkXG4gICAgaWYgKCFtb25nb09iamVjdCkgbW9uZ29PYmplY3QgPSBuZXcgTW9uZ29PYmplY3Qob2JqLCBzY2hlbWEuYmxhY2tib3hLZXlzKCkpO1xuXG4gICAgY29uc3Qga2V5SW5mbyA9IG1vbmdvT2JqZWN0LmdldEluZm9Gb3JLZXkoa2V5KSB8fCB7fTtcbiAgICByZXR1cm4ge1xuICAgICAgaXNTZXQ6IChrZXlJbmZvLnZhbHVlICE9PSB1bmRlZmluZWQpLFxuICAgICAgdmFsdWU6IGtleUluZm8udmFsdWUsXG4gICAgICBvcGVyYXRvcjoga2V5SW5mby5vcGVyYXRvciB8fCBudWxsLFxuICAgIH07XG4gIH1cblxuICBsZXQgdmFsaWRhdGlvbkVycm9ycyA9IFtdO1xuXG4gIC8vIFZhbGlkYXRpb24gZnVuY3Rpb24gY2FsbGVkIGZvciBlYWNoIGFmZmVjdGVkIGtleVxuICBmdW5jdGlvbiB2YWxpZGF0ZSh2YWwsIGFmZmVjdGVkS2V5LCBhZmZlY3RlZEtleUdlbmVyaWMsIGRlZiwgb3AsIGlzSW5BcnJheUl0ZW1PYmplY3QsIGlzSW5TdWJPYmplY3QpIHtcbiAgICAvLyBHZXQgdGhlIHNjaGVtYSBmb3IgdGhpcyBrZXksIG1hcmtpbmcgaW52YWxpZCBpZiB0aGVyZSBpc24ndCBvbmUuXG4gICAgaWYgKCFkZWYpIHtcbiAgICAgIC8vIFdlIGRvbid0IG5lZWQgS0VZX05PVF9JTl9TQ0hFTUEgZXJyb3IgZm9yICR1bnNldCBhbmQgd2UgYWxzbyBkb24ndCBuZWVkIHRvIGNvbnRpbnVlXG4gICAgICBpZiAob3AgPT09ICckdW5zZXQnIHx8IChvcCA9PT0gJyRjdXJyZW50RGF0ZScgJiYgYWZmZWN0ZWRLZXkuZW5kc1dpdGgoJy4kdHlwZScpKSkgcmV0dXJuO1xuXG4gICAgICB2YWxpZGF0aW9uRXJyb3JzLnB1c2goe1xuICAgICAgICBuYW1lOiBhZmZlY3RlZEtleSxcbiAgICAgICAgdHlwZTogU2ltcGxlU2NoZW1hLkVycm9yVHlwZXMuS0VZX05PVF9JTl9TQ0hFTUEsXG4gICAgICAgIHZhbHVlOiB2YWwsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBGb3IgJHJlbmFtZSwgbWFrZSBzdXJlIHRoYXQgdGhlIG5ldyBuYW1lIGlzIGFsbG93ZWQgYnkgdGhlIHNjaGVtYVxuICAgIGlmIChvcCA9PT0gJyRyZW5hbWUnICYmICFzY2hlbWEuYWxsb3dzS2V5KHZhbCkpIHtcbiAgICAgIHZhbGlkYXRpb25FcnJvcnMucHVzaCh7XG4gICAgICAgIG5hbWU6IHZhbCxcbiAgICAgICAgdHlwZTogU2ltcGxlU2NoZW1hLkVycm9yVHlwZXMuS0VZX05PVF9JTl9TQ0hFTUEsXG4gICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHJlcGFyZSB0aGUgY29udGV4dCBvYmplY3QgZm9yIHRoZSB2YWxpZGF0b3IgZnVuY3Rpb25zXG4gICAgY29uc3QgZmllbGRQYXJlbnROYW1lV2l0aEVuZERvdCA9IGdldFBhcmVudE9mS2V5KGFmZmVjdGVkS2V5LCB0cnVlKTtcbiAgICBjb25zdCBmaWVsZFBhcmVudE5hbWUgPSBmaWVsZFBhcmVudE5hbWVXaXRoRW5kRG90LnNsaWNlKDAsIC0xKTtcblxuICAgIGNvbnN0IGZpZWxkVmFsaWRhdGlvbkVycm9ycyA9IFtdO1xuXG4gICAgY29uc3QgdmFsaWRhdG9yQ29udGV4dCA9IHtcbiAgICAgIGFkZFZhbGlkYXRpb25FcnJvcnMoZXJyb3JzKSB7XG4gICAgICAgIGVycm9ycy5mb3JFYWNoKChlcnJvcikgPT4gZmllbGRWYWxpZGF0aW9uRXJyb3JzLnB1c2goZXJyb3IpKTtcbiAgICAgIH0sXG4gICAgICBmaWVsZChmTmFtZSkge1xuICAgICAgICByZXR1cm4gZ2V0RmllbGRJbmZvKGZOYW1lKTtcbiAgICAgIH0sXG4gICAgICBnZW5lcmljS2V5OiBhZmZlY3RlZEtleUdlbmVyaWMsXG4gICAgICBpc0luQXJyYXlJdGVtT2JqZWN0LFxuICAgICAgaXNJblN1Yk9iamVjdCxcbiAgICAgIGlzTW9kaWZpZXIsXG4gICAgICBpc1NldDogKHZhbCAhPT0gdW5kZWZpbmVkKSxcbiAgICAgIGtleTogYWZmZWN0ZWRLZXksXG4gICAgICBvYmosXG4gICAgICBvcGVyYXRvcjogb3AsXG4gICAgICBwYXJlbnRGaWVsZCgpIHtcbiAgICAgICAgcmV0dXJuIGdldEZpZWxkSW5mbyhmaWVsZFBhcmVudE5hbWUpO1xuICAgICAgfSxcbiAgICAgIHNpYmxpbmdGaWVsZChmTmFtZSkge1xuICAgICAgICByZXR1cm4gZ2V0RmllbGRJbmZvKGZpZWxkUGFyZW50TmFtZVdpdGhFbmREb3QgKyBmTmFtZSk7XG4gICAgICB9LFxuICAgICAgdmFsaWRhdGlvbkNvbnRleHQsXG4gICAgICB2YWx1ZTogdmFsLFxuICAgICAgLy8gVmFsdWUgY2hlY2tzIGFyZSBub3QgbmVjZXNzYXJ5IGZvciBudWxsIG9yIHVuZGVmaW5lZCB2YWx1ZXMsIGV4Y2VwdFxuICAgICAgLy8gZm9yIG5vbi1vcHRpb25hbCBudWxsIGFycmF5IGl0ZW1zLCBvciBmb3IgJHVuc2V0IG9yICRyZW5hbWUgdmFsdWVzXG4gICAgICB2YWx1ZVNob3VsZEJlQ2hlY2tlZDogKFxuICAgICAgICBvcCAhPT0gJyR1bnNldCcgJiYgb3AgIT09ICckcmVuYW1lJ1xuICAgICAgICAmJiAoKHZhbCAhPT0gdW5kZWZpbmVkICYmIHZhbCAhPT0gbnVsbCkgfHwgKGFmZmVjdGVkS2V5R2VuZXJpYy5zbGljZSgtMikgPT09ICcuJCcgJiYgdmFsID09PSBudWxsICYmICFkZWYub3B0aW9uYWwpKVxuICAgICAgKSxcbiAgICAgIC4uLihleHRlbmRlZEN1c3RvbUNvbnRleHQgfHwge30pLFxuICAgIH07XG5cbiAgICBjb25zdCBidWlsdEluVmFsaWRhdG9ycyA9IFtcbiAgICAgIHJlcXVpcmVkVmFsaWRhdG9yLFxuICAgICAgdHlwZVZhbGlkYXRvcixcbiAgICAgIGFsbG93ZWRWYWx1ZXNWYWxpZGF0b3IsXG4gICAgXTtcbiAgICBjb25zdCB2YWxpZGF0b3JzID0gYnVpbHRJblZhbGlkYXRvcnNcbiAgICAgIC5jb25jYXQoc2NoZW1hLl92YWxpZGF0b3JzKVxuICAgICAgLmNvbmNhdChTaW1wbGVTY2hlbWEuX3ZhbGlkYXRvcnMpO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggb2YgdGhlIGRlZmluaXRpb25zIGluIHRoZSBTaW1wbGVTY2hlbWFHcm91cC5cbiAgICAvLyBJZiBhbnkgcmV0dXJuIHRydWUsIHdlJ3JlIHZhbGlkLlxuICAgIGNvbnN0IGZpZWxkSXNWYWxpZCA9IGRlZi50eXBlLnNvbWUoKHR5cGVEZWYpID0+IHtcbiAgICAgIC8vIElmIHRoZSB0eXBlIGlzIFNpbXBsZVNjaGVtYS5BbnksIHRoZW4gaXQgaXMgdmFsaWQ6XG4gICAgICBpZiAodHlwZURlZiA9PT0gU2ltcGxlU2NoZW1hLkFueSkgcmV0dXJuIHRydWU7XG5cbiAgICAgIGNvbnN0IHsgdHlwZSwgLi4uZGVmaW5pdGlvbldpdGhvdXRUeXBlIH0gPSBkZWY7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcblxuICAgICAgY29uc3QgZmluYWxWYWxpZGF0b3JDb250ZXh0ID0ge1xuICAgICAgICAuLi52YWxpZGF0b3JDb250ZXh0LFxuXG4gICAgICAgIC8vIFRha2Ugb3V0ZXIgZGVmaW5pdGlvbiBwcm9wcyBsaWtlIFwib3B0aW9uYWxcIiBhbmQgXCJsYWJlbFwiXG4gICAgICAgIC8vIGFuZCBhZGQgdGhlbSB0byBpbm5lciBwcm9wcyBsaWtlIFwidHlwZVwiIGFuZCBcIm1pblwiXG4gICAgICAgIGRlZmluaXRpb246IHtcbiAgICAgICAgICAuLi5kZWZpbml0aW9uV2l0aG91dFR5cGUsXG4gICAgICAgICAgLi4udHlwZURlZixcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIC8vIEFkZCBjdXN0b20gZmllbGQgdmFsaWRhdG9ycyB0byB0aGUgbGlzdCBhZnRlciB0aGUgYnVpbHQtaW5cbiAgICAgIC8vIHZhbGlkYXRvcnMgYnV0IGJlZm9yZSB0aGUgc2NoZW1hIGFuZCBnbG9iYWwgdmFsaWRhdG9ycy5cbiAgICAgIGNvbnN0IGZpZWxkVmFsaWRhdG9ycyA9IHZhbGlkYXRvcnMuc2xpY2UoMCk7XG4gICAgICBpZiAodHlwZW9mIHR5cGVEZWYuY3VzdG9tID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGZpZWxkVmFsaWRhdG9ycy5zcGxpY2UoYnVpbHRJblZhbGlkYXRvcnMubGVuZ3RoLCAwLCB0eXBlRGVmLmN1c3RvbSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIHVzZSBfLmV2ZXJ5IGp1c3Qgc28gdGhhdCB3ZSBkb24ndCBjb250aW51ZSBydW5uaW5nIG1vcmUgdmFsaWRhdG9yXG4gICAgICAvLyBmdW5jdGlvbnMgYWZ0ZXIgdGhlIGZpcnN0IG9uZSByZXR1cm5zIGZhbHNlIG9yIGFuIGVycm9yIHN0cmluZy5cbiAgICAgIHJldHVybiBmaWVsZFZhbGlkYXRvcnMuZXZlcnkoKHZhbGlkYXRvcikgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB2YWxpZGF0b3IuY2FsbChmaW5hbFZhbGlkYXRvckNvbnRleHQpO1xuXG4gICAgICAgIC8vIElmIHRoZSB2YWxpZGF0b3IgcmV0dXJucyBhIHN0cmluZywgYXNzdW1lIGl0IGlzIHRoZVxuICAgICAgICAvLyBlcnJvciB0eXBlLlxuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBmaWVsZFZhbGlkYXRpb25FcnJvcnMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBhZmZlY3RlZEtleSxcbiAgICAgICAgICAgIHR5cGU6IHJlc3VsdCxcbiAgICAgICAgICAgIHZhbHVlOiB2YWwsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIHZhbGlkYXRvciByZXR1cm5zIGFuIG9iamVjdCwgYXNzdW1lIGl0IGlzIGFuXG4gICAgICAgIC8vIGVycm9yIG9iamVjdC5cbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdvYmplY3QnICYmIHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgICAgIGZpZWxkVmFsaWRhdGlvbkVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IGFmZmVjdGVkS2V5LFxuICAgICAgICAgICAgdmFsdWU6IHZhbCxcbiAgICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgdmFsaWRhdG9yIHJldHVybnMgZmFsc2UsIGFzc3VtZSB0aGV5IGFscmVhZHlcbiAgICAgICAgLy8gY2FsbGVkIHRoaXMuYWRkVmFsaWRhdGlvbkVycm9ycyB3aXRoaW4gdGhlIGZ1bmN0aW9uXG4gICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gQW55IG90aGVyIHJldHVybiB2YWx1ZSB3ZSBhc3N1bWUgbWVhbnMgaXQgd2FzIHZhbGlkXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpZiAoIWZpZWxkSXNWYWxpZCkge1xuICAgICAgdmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KGZpZWxkVmFsaWRhdGlvbkVycm9ycyk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIHJlY3Vyc2l2ZSBmdW5jdGlvblxuICBmdW5jdGlvbiBjaGVja09iaih7XG4gICAgdmFsLFxuICAgIGFmZmVjdGVkS2V5LFxuICAgIG9wZXJhdG9yLFxuICAgIGlzSW5BcnJheUl0ZW1PYmplY3QgPSBmYWxzZSxcbiAgICBpc0luU3ViT2JqZWN0ID0gZmFsc2UsXG4gIH0pIHtcbiAgICBsZXQgYWZmZWN0ZWRLZXlHZW5lcmljO1xuICAgIGxldCBkZWY7XG5cbiAgICBpZiAoYWZmZWN0ZWRLZXkpIHtcbiAgICAgIC8vIFdoZW4gd2UgaGl0IGEgYmxhY2tib3gga2V5LCB3ZSBkb24ndCBwcm9ncmVzcyBhbnkgZnVydGhlclxuICAgICAgaWYgKHNjaGVtYS5rZXlJc0luQmxhY2tCb3goYWZmZWN0ZWRLZXkpKSByZXR1cm47XG5cbiAgICAgIC8vIE1ha2UgYSBnZW5lcmljIHZlcnNpb24gb2YgdGhlIGFmZmVjdGVkIGtleSwgYW5kIHVzZSB0aGF0XG4gICAgICAvLyB0byBnZXQgdGhlIHNjaGVtYSBmb3IgdGhpcyBrZXkuXG4gICAgICBhZmZlY3RlZEtleUdlbmVyaWMgPSBNb25nb09iamVjdC5tYWtlS2V5R2VuZXJpYyhhZmZlY3RlZEtleSk7XG5cbiAgICAgIGNvbnN0IHNob3VsZFZhbGlkYXRlS2V5ID0gIWtleXNUb1ZhbGlkYXRlIHx8IGtleXNUb1ZhbGlkYXRlLnNvbWUoKGtleVRvVmFsaWRhdGUpID0+IChcbiAgICAgICAga2V5VG9WYWxpZGF0ZSA9PT0gYWZmZWN0ZWRLZXlcbiAgICAgICAgfHwga2V5VG9WYWxpZGF0ZSA9PT0gYWZmZWN0ZWRLZXlHZW5lcmljXG4gICAgICAgIHx8IGFmZmVjdGVkS2V5LnN0YXJ0c1dpdGgoYCR7a2V5VG9WYWxpZGF0ZX0uYClcbiAgICAgICAgfHwgYWZmZWN0ZWRLZXlHZW5lcmljLnN0YXJ0c1dpdGgoYCR7a2V5VG9WYWxpZGF0ZX0uYClcbiAgICAgICkpO1xuXG4gICAgICAvLyBQcmVwYXJlIHRoZSBjb250ZXh0IG9iamVjdCBmb3IgdGhlIHJ1bGUgZnVuY3Rpb25zXG4gICAgICBjb25zdCBmaWVsZFBhcmVudE5hbWVXaXRoRW5kRG90ID0gZ2V0UGFyZW50T2ZLZXkoYWZmZWN0ZWRLZXksIHRydWUpO1xuICAgICAgY29uc3QgZmllbGRQYXJlbnROYW1lID0gZmllbGRQYXJlbnROYW1lV2l0aEVuZERvdC5zbGljZSgwLCAtMSk7XG5cbiAgICAgIGNvbnN0IGZ1bmN0aW9uc0NvbnRleHQgPSB7XG4gICAgICAgIGZpZWxkKGZOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIGdldEZpZWxkSW5mbyhmTmFtZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdlbmVyaWNLZXk6IGFmZmVjdGVkS2V5R2VuZXJpYyxcbiAgICAgICAgaXNJbkFycmF5SXRlbU9iamVjdCxcbiAgICAgICAgaXNJblN1Yk9iamVjdCxcbiAgICAgICAgaXNNb2RpZmllcixcbiAgICAgICAgaXNTZXQ6ICh2YWwgIT09IHVuZGVmaW5lZCksXG4gICAgICAgIGtleTogYWZmZWN0ZWRLZXksXG4gICAgICAgIG9iaixcbiAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIHBhcmVudEZpZWxkKCkge1xuICAgICAgICAgIHJldHVybiBnZXRGaWVsZEluZm8oZmllbGRQYXJlbnROYW1lKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2libGluZ0ZpZWxkKGZOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIGdldEZpZWxkSW5mbyhmaWVsZFBhcmVudE5hbWVXaXRoRW5kRG90ICsgZk5hbWUpO1xuICAgICAgICB9LFxuICAgICAgICB2YWxpZGF0aW9uQ29udGV4dCxcbiAgICAgICAgdmFsdWU6IHZhbCxcbiAgICAgICAgLi4uKGV4dGVuZGVkQ3VzdG9tQ29udGV4dCB8fCB7fSksXG4gICAgICB9O1xuXG4gICAgICAvLyBQZXJmb3JtIHZhbGlkYXRpb24gZm9yIHRoaXMga2V5XG4gICAgICBkZWYgPSBzY2hlbWEuZ2V0RGVmaW5pdGlvbihhZmZlY3RlZEtleSwgbnVsbCwgZnVuY3Rpb25zQ29udGV4dCk7XG4gICAgICBpZiAoc2hvdWxkVmFsaWRhdGVLZXkpIHtcbiAgICAgICAgdmFsaWRhdGUodmFsLCBhZmZlY3RlZEtleSwgYWZmZWN0ZWRLZXlHZW5lcmljLCBkZWYsIG9wZXJhdG9yLCBpc0luQXJyYXlJdGVtT2JqZWN0LCBpc0luU3ViT2JqZWN0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiBhZmZlY3RlZEtleUdlbmVyaWMgaXMgdW5kZWZpbmVkIGR1ZSB0byB0aGlzIGJlaW5nIHRoZSBmaXJzdCBydW4gb2YgdGhpc1xuICAgIC8vIGZ1bmN0aW9uLCBvYmplY3RLZXlzIHdpbGwgcmV0dXJuIHRoZSB0b3AtbGV2ZWwga2V5cy5cbiAgICBjb25zdCBjaGlsZEtleXMgPSBzY2hlbWEub2JqZWN0S2V5cyhhZmZlY3RlZEtleUdlbmVyaWMpO1xuXG4gICAgLy8gVGVtcG9yYXJpbHkgY29udmVydCBtaXNzaW5nIG9iamVjdHMgdG8gZW1wdHkgb2JqZWN0c1xuICAgIC8vIHNvIHRoYXQgdGhlIGxvb3BpbmcgY29kZSB3aWxsIGJlIGNhbGxlZCBhbmQgcmVxdWlyZWRcbiAgICAvLyBkZXNjZW5kZW50IGtleXMgY2FuIGJlIHZhbGlkYXRlZC5cbiAgICBpZiAoKHZhbCA9PT0gdW5kZWZpbmVkIHx8IHZhbCA9PT0gbnVsbCkgJiYgKCFkZWYgfHwgKCFkZWYub3B0aW9uYWwgJiYgY2hpbGRLZXlzICYmIGNoaWxkS2V5cy5sZW5ndGggPiAwKSkpIHtcbiAgICAgIHZhbCA9IHt9O1xuICAgIH1cblxuICAgIC8vIExvb3AgdGhyb3VnaCBhcnJheXNcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICB2YWwuZm9yRWFjaCgodiwgaSkgPT4ge1xuICAgICAgICBjaGVja09iaih7XG4gICAgICAgICAgdmFsOiB2LFxuICAgICAgICAgIGFmZmVjdGVkS2V5OiBgJHthZmZlY3RlZEtleX0uJHtpfWAsXG4gICAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdFdlU2hvdWxkVHJhdmVyc2UodmFsKSAmJiAoIWRlZiB8fCAhc2NoZW1hLl9ibGFja2JveEtleXMuaGFzKGFmZmVjdGVkS2V5KSkpIHtcbiAgICAgIC8vIExvb3AgdGhyb3VnaCBvYmplY3Qga2V5c1xuXG4gICAgICAvLyBHZXQgbGlzdCBvZiBwcmVzZW50IGtleXNcbiAgICAgIGNvbnN0IHByZXNlbnRLZXlzID0gT2JqZWN0LmtleXModmFsKTtcblxuICAgICAgLy8gSWYgdGhpcyBvYmplY3QgaXMgd2l0aGluIGFuIGFycmF5LCBtYWtlIHN1cmUgd2UgY2hlY2sgZm9yXG4gICAgICAvLyByZXF1aXJlZCBhcyBpZiBpdCdzIG5vdCBhIG1vZGlmaWVyXG4gICAgICBpc0luQXJyYXlJdGVtT2JqZWN0ID0gKGFmZmVjdGVkS2V5R2VuZXJpYyAmJiBhZmZlY3RlZEtleUdlbmVyaWMuc2xpY2UoLTIpID09PSAnLiQnKTtcblxuICAgICAgY29uc3QgY2hlY2tlZEtleXMgPSBbXTtcblxuICAgICAgLy8gQ2hlY2sgYWxsIHByZXNlbnQga2V5cyBwbHVzIGFsbCBrZXlzIGRlZmluZWQgYnkgdGhlIHNjaGVtYS5cbiAgICAgIC8vIFRoaXMgYWxsb3dzIHVzIHRvIGRldGVjdCBleHRyYSBrZXlzIG5vdCBhbGxvd2VkIGJ5IHRoZSBzY2hlbWEgcGx1c1xuICAgICAgLy8gYW55IG1pc3NpbmcgcmVxdWlyZWQga2V5cywgYW5kIHRvIHJ1biBhbnkgY3VzdG9tIGZ1bmN0aW9ucyBmb3Igb3RoZXIga2V5cy5cbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXJlc3RyaWN0ZWQtc3ludGF4ICovXG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBbLi4ucHJlc2VudEtleXMsIC4uLmNoaWxkS2V5c10pIHtcbiAgICAgICAgLy8gYGNoaWxkS2V5c2AgYW5kIGBwcmVzZW50S2V5c2AgbWF5IGNvbnRhaW4gdGhlIHNhbWUga2V5cywgc28gbWFrZVxuICAgICAgICAvLyBzdXJlIHdlIHJ1biBvbmx5IG9uY2UgcGVyIHVuaXF1ZSBrZXlcbiAgICAgICAgaWYgKGNoZWNrZWRLZXlzLmluZGV4T2Yoa2V5KSAhPT0gLTEpIGNvbnRpbnVlO1xuICAgICAgICBjaGVja2VkS2V5cy5wdXNoKGtleSk7XG5cbiAgICAgICAgY2hlY2tPYmooe1xuICAgICAgICAgIHZhbDogdmFsW2tleV0sXG4gICAgICAgICAgYWZmZWN0ZWRLZXk6IGFwcGVuZEFmZmVjdGVkS2V5KGFmZmVjdGVkS2V5LCBrZXkpLFxuICAgICAgICAgIG9wZXJhdG9yLFxuICAgICAgICAgIGlzSW5BcnJheUl0ZW1PYmplY3QsXG4gICAgICAgICAgaXNJblN1Yk9iamVjdDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXJlc3RyaWN0ZWQtc3ludGF4ICovXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tNb2RpZmllcihtb2QpIHtcbiAgICAvLyBMb29wIHRocm91Z2ggb3BlcmF0b3JzXG4gICAgT2JqZWN0LmtleXMobW9kKS5mb3JFYWNoKChvcCkgPT4ge1xuICAgICAgY29uc3Qgb3BPYmogPSBtb2Rbb3BdO1xuICAgICAgLy8gSWYgbm9uLW9wZXJhdG9ycyBhcmUgbWl4ZWQgaW4sIHRocm93IGVycm9yXG4gICAgICBpZiAob3Auc2xpY2UoMCwgMSkgIT09ICckJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICcke29wfScgdG8gYmUgYSBtb2RpZmllciBvcGVyYXRvciBsaWtlICckc2V0J2ApO1xuICAgICAgfVxuICAgICAgaWYgKHNob3VsZENoZWNrKG9wKSkge1xuICAgICAgICAvLyBGb3IgYW4gdXBzZXJ0LCBtaXNzaW5nIHByb3BzIHdvdWxkIG5vdCBiZSBzZXQgaWYgYW4gaW5zZXJ0IGlzIHBlcmZvcm1lZCxcbiAgICAgICAgLy8gc28gd2UgY2hlY2sgdGhlbSBhbGwgd2l0aCB1bmRlZmluZWQgdmFsdWUgdG8gZm9yY2UgYW55ICdyZXF1aXJlZCcgY2hlY2tzIHRvIGZhaWxcbiAgICAgICAgaWYgKGlzVXBzZXJ0ICYmIChvcCA9PT0gJyRzZXQnIHx8IG9wID09PSAnJHNldE9uSW5zZXJ0JykpIHtcbiAgICAgICAgICBjb25zdCBwcmVzZW50S2V5cyA9IE9iamVjdC5rZXlzKG9wT2JqKTtcbiAgICAgICAgICBzY2hlbWEub2JqZWN0S2V5cygpLmZvckVhY2goKHNjaGVtYUtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcmVzZW50S2V5cy5pbmNsdWRlcyhzY2hlbWFLZXkpKSB7XG4gICAgICAgICAgICAgIGNoZWNrT2JqKHtcbiAgICAgICAgICAgICAgICB2YWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBhZmZlY3RlZEtleTogc2NoZW1hS2V5LFxuICAgICAgICAgICAgICAgIG9wZXJhdG9yOiBvcCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRG9uJ3QgdXNlIGZvckVhY2ggaGVyZSBiZWNhdXNlIGl0IHdpbGwgbm90IHByb3Blcmx5IGhhbmRsZSBhblxuICAgICAgICAvLyBvYmplY3QgdGhhdCBoYXMgYSBwcm9wZXJ0eSBuYW1lZCBgbGVuZ3RoYFxuICAgICAgICBPYmplY3Qua2V5cyhvcE9iaikuZm9yRWFjaCgoaykgPT4ge1xuICAgICAgICAgIGxldCB2ID0gb3BPYmpba107XG4gICAgICAgICAgaWYgKG9wID09PSAnJHB1c2gnIHx8IG9wID09PSAnJGFkZFRvU2V0Jykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiAnJGVhY2gnIGluIHYpIHtcbiAgICAgICAgICAgICAgdiA9IHYuJGVhY2g7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBrID0gYCR7a30uMGA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNoZWNrT2JqKHtcbiAgICAgICAgICAgIHZhbDogdixcbiAgICAgICAgICAgIGFmZmVjdGVkS2V5OiBrLFxuICAgICAgICAgICAgb3BlcmF0b3I6IG9wLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIEtpY2sgb2ZmIHRoZSB2YWxpZGF0aW9uXG4gIGlmIChpc01vZGlmaWVyKSB7XG4gICAgY2hlY2tNb2RpZmllcihvYmopO1xuICB9IGVsc2Uge1xuICAgIGNoZWNrT2JqKHsgdmFsOiBvYmogfSk7XG4gIH1cblxuICAvLyBDdXN0b20gd2hvbGUtZG9jIHZhbGlkYXRvcnNcbiAgY29uc3QgZG9jVmFsaWRhdG9ycyA9IHNjaGVtYS5fZG9jVmFsaWRhdG9ycy5jb25jYXQoU2ltcGxlU2NoZW1hLl9kb2NWYWxpZGF0b3JzKTtcbiAgY29uc3QgZG9jVmFsaWRhdG9yQ29udGV4dCA9IHtcbiAgICBpZ25vcmVUeXBlcyxcbiAgICBpc01vZGlmaWVyLFxuICAgIGlzVXBzZXJ0LFxuICAgIGtleXNUb1ZhbGlkYXRlLFxuICAgIG1vbmdvT2JqZWN0LFxuICAgIG9iaixcbiAgICBzY2hlbWEsXG4gICAgdmFsaWRhdGlvbkNvbnRleHQsXG4gICAgLi4uKGV4dGVuZGVkQ3VzdG9tQ29udGV4dCB8fCB7fSksXG4gIH07XG4gIGRvY1ZhbGlkYXRvcnMuZm9yRWFjaCgoZnVuYykgPT4ge1xuICAgIGNvbnN0IGVycm9ycyA9IGZ1bmMuY2FsbChkb2NWYWxpZGF0b3JDb250ZXh0LCBvYmopO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShlcnJvcnMpKSB0aHJvdyBuZXcgRXJyb3IoJ0N1c3RvbSBkb2MgdmFsaWRhdG9yIG11c3QgcmV0dXJuIGFuIGFycmF5IG9mIGVycm9yIG9iamVjdHMnKTtcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkgdmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KGVycm9ycyk7XG4gIH0pO1xuXG4gIGNvbnN0IGFkZGVkRmllbGROYW1lcyA9IFtdO1xuICB2YWxpZGF0aW9uRXJyb3JzID0gdmFsaWRhdGlvbkVycm9ycy5maWx0ZXIoKGVyck9iaikgPT4ge1xuICAgIC8vIFJlbW92ZSBlcnJvciB0eXBlcyB0aGUgdXNlciBkb2Vzbid0IGNhcmUgYWJvdXRcbiAgICBpZiAoaWdub3JlVHlwZXMuaW5jbHVkZXMoZXJyT2JqLnR5cGUpKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gTWFrZSBzdXJlIHRoZXJlIGlzIG9ubHkgb25lIGVycm9yIHBlciBmaWVsZE5hbWVcbiAgICBpZiAoYWRkZWRGaWVsZE5hbWVzLmluY2x1ZGVzKGVyck9iai5uYW1lKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgYWRkZWRGaWVsZE5hbWVzLnB1c2goZXJyT2JqLm5hbWUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbiAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnM7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRvVmFsaWRhdGlvbjtcbiIsImltcG9ydCBNb25nb09iamVjdCBmcm9tICdtb25nby1vYmplY3QnO1xuXG4vKipcbiAqIENsb25lcyBhIHNjaGVtYSBvYmplY3QsIGV4cGFuZGluZyBzaG9ydGhhbmQgYXMgaXQgZG9lcyBpdC5cbiAqL1xuZnVuY3Rpb24gZXhwYW5kU2hvcnRoYW5kKHNjaGVtYSkge1xuICBjb25zdCBzY2hlbWFDbG9uZSA9IHt9O1xuXG4gIE9iamVjdC5rZXlzKHNjaGVtYSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHNjaGVtYVtrZXldO1xuICAgIC8vIENBU0UgMTogTm90IHNob3J0aGFuZC4gSnVzdCBjbG9uZVxuICAgIGlmIChNb25nb09iamVjdC5pc0Jhc2ljT2JqZWN0KGRlZmluaXRpb24pKSB7XG4gICAgICBzY2hlbWFDbG9uZVtrZXldID0geyAuLi5kZWZpbml0aW9uIH07XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQ0FTRSAyOiBUaGUgZGVmaW5pdGlvbiBpcyBhbiBhcnJheSBvZiBzb21lIHR5cGVcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkZWZpbml0aW9uKSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGVmaW5pdGlvblswXSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBcnJheSBzaG9ydGhhbmQgbWF5IG9ubHkgYmUgdXNlZCB0byBvbmUgbGV2ZWwgb2YgZGVwdGggKCR7a2V5fSlgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHR5cGUgPSBkZWZpbml0aW9uWzBdO1xuICAgICAgc2NoZW1hQ2xvbmVba2V5XSA9IHsgdHlwZTogQXJyYXkgfTtcblxuICAgICAgLy8gQWxzbyBhZGQgdGhlIGl0ZW0ga2V5IGRlZmluaXRpb25cbiAgICAgIGNvbnN0IGl0ZW1LZXkgPSBgJHtrZXl9LiRgO1xuICAgICAgaWYgKHNjaGVtYVtpdGVtS2V5XSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFycmF5IHNob3J0aGFuZCB1c2VkIGZvciAke2tleX0gZmllbGQgYnV0ICR7a2V5fS4kIGtleSBpcyBhbHJlYWR5IGluIHRoZSBzY2hlbWFgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgc2NoZW1hQ2xvbmVbaXRlbUtleV0gPSB7IHR5cGU6IFN0cmluZywgcmVnRXg6IHR5cGUgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjaGVtYUNsb25lW2l0ZW1LZXldID0geyB0eXBlIH07XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQ0FTRSAzOiBUaGUgZGVmaW5pdGlvbiBpcyBhIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgIGlmIChkZWZpbml0aW9uIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICBzY2hlbWFDbG9uZVtrZXldID0ge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIHJlZ0V4OiBkZWZpbml0aW9uLFxuICAgICAgfTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDQVNFIDQ6IFRoZSBkZWZpbml0aW9uIGlzIHNvbWV0aGluZywgYSB0eXBlXG4gICAgc2NoZW1hQ2xvbmVba2V5XSA9IHsgdHlwZTogZGVmaW5pdGlvbiB9O1xuICB9KTtcblxuICByZXR1cm4gc2NoZW1hQ2xvbmU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGV4cGFuZFNob3J0aGFuZDtcbiIsIi8qXG4gIENvZGUgc291cmNlOlxuICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9qeHNvbi9zdHJpbmctaHVtYW5pemVcbiAgICBodHRwczovL2dpdGh1Yi5jb20vanhzb24vc3RyaW5nLWNhcGl0YWxpemVcbiAqL1xuXG5mdW5jdGlvbiBjYXBpdGFsaXplKHRleHQpIHtcbiAgdGV4dCA9IHRleHQgfHwgJyc7XG4gIHRleHQgPSB0ZXh0LnRyaW0oKTtcblxuICBpZiAodGV4dFswXSkge1xuICAgIHRleHQgPSB0ZXh0WzBdLnRvVXBwZXJDYXNlKCkgKyB0ZXh0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgLy8gRG8gXCJJRFwiIGluc3RlYWQgb2YgXCJpZFwiIG9yIFwiSWRcIlxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXGJpZFxcYi9nLCAnSUQnKTtcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxiSWRcXGIvZywgJ0lEJyk7XG5cbiAgcmV0dXJuIHRleHQ7XG59XG5cbmZ1bmN0aW9uIHVuZGVyc2NvcmUodGV4dCkge1xuICB0ZXh0ID0gdGV4dCB8fCAnJztcbiAgdGV4dCA9IHRleHQudG9TdHJpbmcoKTsgLy8gbWlnaHQgYmUgYSBudW1iZXJcbiAgdGV4dCA9IHRleHQudHJpbSgpO1xuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oW2EtelxcZF0pKFtBLVpdKykvZywgJyQxXyQyJyk7XG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1stXFxzXSsvZywgJ18nKS50b0xvd2VyQ2FzZSgpO1xuXG4gIHJldHVybiB0ZXh0O1xufVxuXG5mdW5jdGlvbiBleHRuYW1lKHRleHQpIHtcbiAgY29uc3QgaW5kZXggPSB0ZXh0Lmxhc3RJbmRleE9mKCcuJyk7XG4gIGNvbnN0IGV4dCA9IHRleHQuc3Vic3RyaW5nKGluZGV4LCB0ZXh0Lmxlbmd0aCk7XG5cbiAgcmV0dXJuIChpbmRleCA9PT0gLTEpID8gJycgOiBleHQ7XG59XG5cbmZ1bmN0aW9uIGh1bWFuaXplKHRleHQpIHtcbiAgdGV4dCA9IHRleHQgfHwgJyc7XG4gIHRleHQgPSB0ZXh0LnRvU3RyaW5nKCk7IC8vIG1pZ2h0IGJlIGEgbnVtYmVyXG4gIHRleHQgPSB0ZXh0LnRyaW0oKTtcbiAgdGV4dCA9IHRleHQucmVwbGFjZShleHRuYW1lKHRleHQpLCAnJyk7XG4gIHRleHQgPSB1bmRlcnNjb3JlKHRleHQpO1xuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9bXFxXX10rL2csICcgJyk7XG5cbiAgcmV0dXJuIGNhcGl0YWxpemUodGV4dCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGh1bWFuaXplO1xuIiwiLy8gdGhpcyBkb21haW4gcmVnZXggbWF0Y2hlcyBhbGwgZG9tYWlucyB0aGF0IGhhdmUgYXQgbGVhc3Qgb25lIC5cbi8vIHNhZGx5IElQdjQgQWRyZXNzZXMgd2lsbCBiZSBjYXVnaHQgdG9vIGJ1dCB0ZWNobmljYWxseSB0aG9zZSBhcmUgdmFsaWQgZG9tYWluc1xuLy8gdGhpcyBleHByZXNzaW9uIGlzIGV4dHJhY3RlZCBmcm9tIHRoZSBvcmlnaW5hbCBSRkMgNTMyMiBtYWlsIGV4cHJlc3Npb25cbi8vIGEgbW9kaWZpY2F0aW9uIGVuZm9yY2VzIHRoYXQgdGhlIHRsZCBjb25zaXN0cyBvbmx5IG9mIGNoYXJhY3RlcnNcbmNvbnN0IHJ4RG9tYWluID0gJyg/OlthLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT9cXFxcLikrW2Etel0oPzpbYS16LV0qW2Etel0pPyc7XG4vLyB0aGlzIGRvbWFpbiByZWdleCBtYXRjaGVzIGV2ZXJ5dGhpZ24gdGhhdCBjb3VsZCBiZSBhIGRvbWFpbiBpbiBpbnRyYW5ldFxuLy8gdGhhdCBtZWFucyBcImxvY2FsaG9zdFwiIGlzIGEgdmFsaWQgZG9tYWluXG5jb25zdCByeE5hbWVEb21haW4gPSAnKD86W2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pPyg/OlxcXFwufCQpKSsnO1xuLy8gc3RyaWN0IElQdjQgZXhwcmVzc2lvbiB3aGljaCBhbGxvd3MgMC0yNTUgcGVyIG9rdGV0dFxuY29uc3QgcnhJUHY0ID0gJyg/Oig/OlswLTFdP1xcXFxkezEsMn18MlswLTRdXFxcXGR8MjVbMC01XSkoPzpcXFxcLnwkKSl7NH0nO1xuLy8gc3RyaWN0IElQdjYgZXhwcmVzc2lvbiB3aGljaCBhbGxvd3MgKGFuZCB2YWxpZGF0ZXMpIGFsbCBzaG9ydGN1dHNcbmNvbnN0IHJ4SVB2NiA9ICcoPzooPzpbXFxcXGRBLUZhLWZdezEsNH0oPzo6fCQpKXs4fScgLy8gZnVsbCBhZHJlc3NcbiAgKyAnfCg/PSg/OlteOlxcXFxzXXw6W146XFxcXHNdKSo6Oig/OlteOlxcXFxzXXw6W146XFxcXHNdKSokKScgLy8gb3IgbWluL21heCBvbmUgJzo6J1xuICArICdbXFxcXGRBLUZhLWZdezAsNH0oPzo6Oj8oPzpbXFxcXGRBLUZhLWZdezEsNH18JCkpezEsNn0pJzsgLy8gYW5kIHNob3J0IGFkcmVzc1xuLy8gdGhpcyBhbGxvd3MgZG9tYWlucyAoYWxzbyBsb2NhbGhvc3QgZXRjKSBhbmQgaXAgYWRyZXNzZXNcbmNvbnN0IHJ4V2Vha0RvbWFpbiA9IGAoPzoke1tyeE5hbWVEb21haW4sIHJ4SVB2NCwgcnhJUHY2XS5qb2luKCd8Jyl9KWA7XG4vLyB1bmlxdWUgaWQgZnJvbSB0aGUgcmFuZG9tIHBhY2thZ2UgYWxzbyB1c2VkIGJ5IG1pbmltb25nb1xuLy8gbWluIGFuZCBtYXggYXJlIHVzZWQgdG8gc2V0IGxlbmd0aCBib3VuZGFyaWVzXG4vLyBzZXQgYm90aCBmb3IgZXhwbGljaXQgbG93ZXIgYW5kIHVwcGVyIGJvdW5kc1xuLy8gc2V0IG1pbiBhcyBpbnRlZ2VyIGFuZCBtYXggdG8gbnVsbCBmb3IgZXhwbGljaXQgbG93ZXIgYm91bmQgYW5kIGFyYml0cmFyeSB1cHBlciBib3VuZFxuLy8gc2V0IG5vbmUgZm9yIGFyYml0cmFyeSBsZW5ndGhcbi8vIHNldCBvbmx5IG1pbiBmb3IgZml4ZWQgbGVuZ3RoXG4vLyBjaGFyYWN0ZXIgbGlzdDogaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvYmxvYi9yZWxlYXNlLzAuOC4wL3BhY2thZ2VzL3JhbmRvbS9yYW5kb20uanMjTDg4XG4vLyBzdHJpbmcgbGVuZ3RoOiBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci9ibG9iL3JlbGVhc2UvMC44LjAvcGFja2FnZXMvcmFuZG9tL3JhbmRvbS5qcyNMMTQzXG5jb25zdCBpc1ZhbGlkQm91bmQgPSAodmFsdWUsIGxvd2VyKSA9PiAhdmFsdWUgfHwgKE51bWJlci5pc1NhZmVJbnRlZ2VyKHZhbHVlKSAmJiB2YWx1ZSA+IGxvd2VyKTtcbmNvbnN0IGlkT2ZMZW5ndGggPSAobWluLCBtYXgpID0+IHtcbiAgaWYgKCFpc1ZhbGlkQm91bmQobWluLCAwKSkgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhIG5vbi1uZWdhdGl2ZSBzYWZlIGludGVnZXIsIGdvdCAke21pbn1gKTtcbiAgaWYgKCFpc1ZhbGlkQm91bmQobWF4LCBtaW4pKSB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGEgbm9uLW5lZ2F0aXZlIHNhZmUgaW50ZWdlciBncmVhdGVyIHRoYW4gMSBhbmQgZ3JlYXRlciB0aGFuIG1pbiwgZ290ICR7bWF4fWApO1xuICBsZXQgYm91bmRzO1xuICBpZiAobWluICYmIG1heCkgYm91bmRzID0gYCR7bWlufSwke21heH1gO1xuICBlbHNlIGlmIChtaW4gJiYgbWF4ID09PSBudWxsKSBib3VuZHMgPSBgJHttaW59LGA7XG4gIGVsc2UgaWYgKG1pbiAmJiAhbWF4KSBib3VuZHMgPSBgJHttaW59YDtcbiAgZWxzZSBpZiAoIW1pbiAmJiAhbWF4KSBib3VuZHMgPSAnMCwnO1xuICBlbHNlIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBzdGF0ZSBmb3IgbWluICgke21pbn0pIGFuZCBtYXggKCR7bWF4fSlgKTtcbiAgcmV0dXJuIG5ldyBSZWdFeHAoYF5bMjM0NTY3ODlBQkNERUZHSEpLTE1OUFFSU1RXWFlaYWJjZGVmZ2hpamttbm9wcXJzdHV2d3h5el17JHtib3VuZHN9fSRgKTtcbn07XG5cbmNvbnN0IHJlZ0V4ID0ge1xuICAvLyBXZSB1c2UgdGhlIFJlZ0V4cCBzdWdnZXN0ZWQgYnkgVzNDIGluIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw1L2Zvcm1zLmh0bWwjdmFsaWQtZS1tYWlsLWFkZHJlc3NcbiAgLy8gVGhpcyBpcyBwcm9iYWJseSB0aGUgc2FtZSBsb2dpYyB1c2VkIGJ5IG1vc3QgYnJvd3NlcnMgd2hlbiB0eXBlPWVtYWlsLCB3aGljaCBpcyBvdXIgZ29hbC4gSXQgaXNcbiAgLy8gYSB2ZXJ5IHBlcm1pc3NpdmUgZXhwcmVzc2lvbi4gU29tZSBhcHBzIG1heSB3aXNoIHRvIGJlIG1vcmUgc3RyaWN0IGFuZCBjYW4gd3JpdGUgdGhlaXIgb3duIFJlZ0V4cC5cbiAgRW1haWw6IC9eW2EtekEtWjAtOS4hIyQlJicqK1xcLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKiQvLFxuXG4gIC8vIExpa2UgRW1haWwgYnV0IHJlcXVpcmVzIHRoZSBUTEQgKC5jb20sIGV0YylcbiAgRW1haWxXaXRoVExEOiAvXigoW148PigpXFxbXFxdXFxcXC4sOzpcXHNAXCJdKyhcXC5bXjw+KClcXFtcXF1cXFxcLiw7Olxcc0BcIl0rKSopfChcIi4rXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31dKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLyxcblxuICBEb21haW46IG5ldyBSZWdFeHAoYF4ke3J4RG9tYWlufSRgKSxcbiAgV2Vha0RvbWFpbjogbmV3IFJlZ0V4cChgXiR7cnhXZWFrRG9tYWlufSRgKSxcblxuICBJUDogbmV3IFJlZ0V4cChgXig/OiR7cnhJUHY0fXwke3J4SVB2Nn0pJGApLFxuICBJUHY0OiBuZXcgUmVnRXhwKGBeJHtyeElQdjR9JGApLFxuICBJUHY2OiBuZXcgUmVnRXhwKGBeJHtyeElQdjZ9JGApLFxuICAvLyBVUkwgUmVnRXggZnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9kcGVyaW5pLzcyOTI5NFxuICAvLyBERVBSRUNBVEVEISBLbm93biAybmQgZGVncmVlIHBvbHlub21pYWwgUmVEb1MgdnVsbmVyYWJpbGl0eS5cbiAgLy8gVXNlIGEgY3VzdG9tIHZhbGlkYXRvciBzdWNoIGFzIHRoaXMgdG8gdmFsaWRhdGUgVVJMczpcbiAgLy8gICBjdXN0b20oKSB7XG4gIC8vICAgICBpZiAoIXRoaXMuaXNTZXQpIHJldHVybjtcbiAgLy8gICAgIHRyeSB7XG4gIC8vICAgICAgIG5ldyBVUkwodGhpcy52YWx1ZSk7XG4gIC8vICAgICB9IGNhdGNoIChlcnIpIHtcbiAgLy8gICAgICAgcmV0dXJuICdiYWRVcmwnO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlZG9zL25vLXZ1bG5lcmFibGVcbiAgVXJsOiAvXig/Oig/Oig/Omh0dHBzP3xmdHApOik/XFwvXFwvKSg/OlxcUysoPzo6XFxTKik/QCk/KD86KD8hKD86MTB8MTI3KSg/OlxcLlxcZHsxLDN9KXszfSkoPyEoPzoxNjlcXC4yNTR8MTkyXFwuMTY4KSg/OlxcLlxcZHsxLDN9KXsyfSkoPyExNzJcXC4oPzoxWzYtOV18MlxcZHwzWzAtMV0pKD86XFwuXFxkezEsM30pezJ9KSg/OlsxLTldXFxkP3wxXFxkXFxkfDJbMDFdXFxkfDIyWzAtM10pKD86XFwuKD86MT9cXGR7MSwyfXwyWzAtNF1cXGR8MjVbMC01XSkpezJ9KD86XFwuKD86WzEtOV1cXGQ/fDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNF0pKXwoPzooPzpbYS16MC05XFx1MDBhMS1cXHVmZmZmXVthLXowLTlcXHUwMGExLVxcdWZmZmZfLV17MCw2Mn0pP1thLXowLTlcXHUwMGExLVxcdWZmZmZdXFwuKSsoPzpbYS16XFx1MDBhMS1cXHVmZmZmXXsyLH1cXC4/KSkoPzo6XFxkezIsNX0pPyg/OlsvPyNdXFxTKik/JC9pLFxuICAvLyBkZWZhdWx0IGlkIGlzIGRlZmluZWQgd2l0aCBleGFjdCAxNyBjaGFycyBvZiBsZW5ndGhcbiAgSWQ6IGlkT2ZMZW5ndGgoMTcpLFxuICBpZE9mTGVuZ3RoLFxuICAvLyBhbGxvd3MgZm9yIGEgNSBkaWdpdCB6aXAgY29kZSBmb2xsb3dlZCBieSBhIHdoaXRlc3BhY2Ugb3IgZGFzaCBhbmQgdGhlbiA0IG1vcmUgZGlnaXRzXG4gIC8vIG1hdGNoZXMgMTExMTEgYW5kIDExMTExLTExMTEgYW5kIDExMTExIDExMTFcbiAgWmlwQ29kZTogL15cXGR7NX0oPzpbLVxcc11cXGR7NH0pPyQvLFxuICAvLyB0YWtlbiBmcm9tIEdvb2dsZSdzIGxpYnBob25lbnVtYmVyIGxpYnJhcnlcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZWkxOG4vbGlicGhvbmVudW1iZXIvYmxvYi9tYXN0ZXIvamF2YXNjcmlwdC9pMThuL3Bob25lbnVtYmVycy9waG9uZW51bWJlcnV0aWwuanNcbiAgLy8gcmVmZXJlbmNlIHRoZSBWQUxJRF9QSE9ORV9OVU1CRVJfUEFUVEVSTiBrZXlcbiAgLy8gYWxsb3dzIGZvciBjb21tb24gcGhvbmUgbnVtYmVyIHN5bWJvbHMgaW5jbHVkaW5nICsgKCkgYW5kIC1cbiAgLy8gREVQUkVDQVRFRCEgS25vd24gMm5kIGRlZ3JlZSBwb2x5bm9taWFsIFJlRG9TIHZ1bG5lcmFiaWxpdHkuXG4gIC8vIEluc3RlYWQsIHVzZSBhIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uLCB3aXRoIGEgaGlnaCBxdWFsaXR5XG4gIC8vIHBob25lIG51bWJlciB2YWxpZGF0aW9uIHBhY2thZ2UgdGhhdCBtZWV0cyB5b3VyIG5lZWRzLlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVkb3Mvbm8tdnVsbmVyYWJsZVxuICBQaG9uZTogL15bMC0577yQLe+8mdmgLdmp27At27ldezJ9JHxeWyvvvItdKig/OlsteOKAkC3igJXiiJLjg7zvvI0t77yPICDCreKAi+KBoOOAgCgp77yI77yJ77y777y9LlxcW1xcXS9+4oGT4oi8772eKl0qWzAtOe+8kC3vvJnZoC3ZqduwLdu5XSl7Myx9Wy144oCQLeKAleKIkuODvO+8jS3vvI8gIMKt4oCL4oGg44CAKCnvvIjvvInvvLvvvL0uXFxbXFxdL37igZPiiLzvvZ4qQS1aYS16MC0577yQLe+8mdmgLdmp27At27ldKig/OjtleHQ9KFswLTnvvJAt77yZ2aAt2anbsC3buV17MSwyMH0pfFsgIFxcdCxdKig/OmU/eHQoPzplbnNpKD86b8yBP3zDsykpP24/fO+9hT/vvZjvvZTvvY4/fNC00L7QsXxhbmV4bylbOlxcLu+8jl0/WyAgXFx0LC1dKihbMC0577yQLe+8mdmgLdmp27At27ldezEsMjB9KSM/fFsgIFxcdCxdKig/Olt4772YI++8g37vvZ5dfGludHzvvYnvvY7vvZQpWzpcXC7vvI5dP1sgIFxcdCwtXSooWzAtOe+8kC3vvJnZoC3ZqduwLdu5XXsxLDl9KSM/fFstIF0rKFswLTnvvJAt77yZ2aAt2anbsC3buV17MSw2fSkjfFsgIFxcdF0qKD86LHsyfXw7KVs6XFwu77yOXT9bICBcXHQsLV0qKFswLTnvvJAt77yZ2aAt2anbsC3buV17MSwxNX0pIz98WyAgXFx0XSooPzosKStbOlxcLu+8jl0/WyAgXFx0LC1dKihbMC0577yQLe+8mdmgLdmp27At27ldezEsOX0pIz8pPyQvaSwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1pcnJlZ3VsYXItd2hpdGVzcGFjZVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcmVnRXg7XG4iLCJpbXBvcnQgY2xvbmUgZnJvbSAnY2xvbmUnO1xuaW1wb3J0IHsgZ2V0UGFyZW50T2ZLZXkgfSBmcm9tICcuLi91dGlsaXR5JztcblxuZnVuY3Rpb24gZ2V0RmllbGRJbmZvKG1vbmdvT2JqZWN0LCBrZXkpIHtcbiAgY29uc3Qga2V5SW5mbyA9IG1vbmdvT2JqZWN0LmdldEluZm9Gb3JLZXkoa2V5KSB8fCB7fTtcbiAgcmV0dXJuIHtcbiAgICBpc1NldDogKGtleUluZm8udmFsdWUgIT09IHVuZGVmaW5lZCksXG4gICAgdmFsdWU6IGtleUluZm8udmFsdWUsXG4gICAgb3BlcmF0b3I6IGtleUluZm8ub3BlcmF0b3IgfHwgbnVsbCxcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXV0b1ZhbHVlUnVubmVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5kb25lS2V5cyA9IFtdO1xuICB9XG5cbiAgcnVuRm9yUG9zaXRpb24oe1xuICAgIGtleTogYWZmZWN0ZWRLZXksXG4gICAgb3BlcmF0b3IsXG4gICAgcG9zaXRpb24sXG4gICAgdmFsdWUsXG4gIH0pIHtcbiAgICBjb25zdCB7XG4gICAgICBjbG9zZXN0U3Vic2NoZW1hRmllbGROYW1lLFxuICAgICAgZXh0ZW5kZWRBdXRvVmFsdWVDb250ZXh0LFxuICAgICAgZnVuYyxcbiAgICAgIGlzTW9kaWZpZXIsXG4gICAgICBpc1Vwc2VydCxcbiAgICAgIG1vbmdvT2JqZWN0LFxuICAgIH0gPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAvLyBJZiBhbHJlYWR5IGNhbGxlZCBmb3IgdGhpcyBrZXksIHNraXAgaXRcbiAgICBpZiAodGhpcy5kb25lS2V5cy5pbmNsdWRlcyhhZmZlY3RlZEtleSkpIHJldHVybjtcblxuICAgIGNvbnN0IGZpZWxkUGFyZW50TmFtZSA9IGdldFBhcmVudE9mS2V5KGFmZmVjdGVkS2V5LCB0cnVlKTtcbiAgICBjb25zdCBwYXJlbnRGaWVsZEluZm8gPSBnZXRGaWVsZEluZm8obW9uZ29PYmplY3QsIGZpZWxkUGFyZW50TmFtZS5zbGljZSgwLCAtMSkpO1xuXG4gICAgbGV0IGRvVW5zZXQgPSBmYWxzZTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KHBhcmVudEZpZWxkSW5mby52YWx1ZSkpIHtcbiAgICAgIGlmIChpc05hTihhZmZlY3RlZEtleS5zcGxpdCgnLicpLnNsaWNlKC0xKS5wb3AoKSkpIHtcbiAgICAgICAgLy8gcGFyZW50IGlzIGFuIGFycmF5LCBidXQgdGhlIGtleSB0byBiZSBzZXQgaXMgbm90IGFuIGludGVnZXIgKHNlZSBpc3N1ZSAjODApXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBhdXRvVmFsdWUgPSBmdW5jLmNhbGwoe1xuICAgICAgY2xvc2VzdFN1YnNjaGVtYUZpZWxkTmFtZTogY2xvc2VzdFN1YnNjaGVtYUZpZWxkTmFtZS5sZW5ndGggPyBjbG9zZXN0U3Vic2NoZW1hRmllbGROYW1lIDogbnVsbCxcbiAgICAgIGZpZWxkKGZOYW1lKSB7XG4gICAgICAgIHJldHVybiBnZXRGaWVsZEluZm8obW9uZ29PYmplY3QsIGNsb3Nlc3RTdWJzY2hlbWFGaWVsZE5hbWUgKyBmTmFtZSk7XG4gICAgICB9LFxuICAgICAgaXNNb2RpZmllcixcbiAgICAgIGlzVXBzZXJ0LFxuICAgICAgaXNTZXQ6ICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSxcbiAgICAgIGtleTogYWZmZWN0ZWRLZXksXG4gICAgICBvcGVyYXRvcixcbiAgICAgIHBhcmVudEZpZWxkKCkge1xuICAgICAgICByZXR1cm4gcGFyZW50RmllbGRJbmZvO1xuICAgICAgfSxcbiAgICAgIHNpYmxpbmdGaWVsZChmTmFtZSkge1xuICAgICAgICByZXR1cm4gZ2V0RmllbGRJbmZvKG1vbmdvT2JqZWN0LCBmaWVsZFBhcmVudE5hbWUgKyBmTmFtZSk7XG4gICAgICB9LFxuICAgICAgdW5zZXQoKSB7XG4gICAgICAgIGRvVW5zZXQgPSB0cnVlO1xuICAgICAgfSxcbiAgICAgIHZhbHVlLFxuICAgICAgLi4uKGV4dGVuZGVkQXV0b1ZhbHVlQ29udGV4dCB8fCB7fSksXG4gICAgfSwgbW9uZ29PYmplY3QuZ2V0T2JqZWN0KCkpO1xuXG4gICAgLy8gVXBkYXRlIHRyYWNraW5nIG9mIHdoaWNoIGtleXMgd2UndmUgcnVuIGF1dG92YWx1ZSBmb3JcbiAgICB0aGlzLmRvbmVLZXlzLnB1c2goYWZmZWN0ZWRLZXkpO1xuXG4gICAgaWYgKGRvVW5zZXQgJiYgcG9zaXRpb24pIG1vbmdvT2JqZWN0LnJlbW92ZVZhbHVlRm9yUG9zaXRpb24ocG9zaXRpb24pO1xuXG4gICAgaWYgKGF1dG9WYWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICAvLyBJZiB0aGUgdXNlcidzIGF1dG8gdmFsdWUgaXMgb2YgdGhlIHBzZXVkby1tb2RpZmllciBmb3JtYXQsIHBhcnNlIGl0XG4gICAgLy8gaW50byBvcGVyYXRvciBhbmQgdmFsdWUuXG4gICAgaWYgKGlzTW9kaWZpZXIpIHtcbiAgICAgIGxldCBvcDtcbiAgICAgIGxldCBuZXdWYWx1ZTtcbiAgICAgIGlmIChhdXRvVmFsdWUgJiYgdHlwZW9mIGF1dG9WYWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3QgYXZPcGVyYXRvciA9IE9iamVjdC5rZXlzKGF1dG9WYWx1ZSkuZmluZCgoYXZQcm9wKSA9PiBhdlByb3Auc3Vic3RyaW5nKDAsIDEpID09PSAnJCcpO1xuICAgICAgICBpZiAoYXZPcGVyYXRvcikge1xuICAgICAgICAgIG9wID0gYXZPcGVyYXRvcjtcbiAgICAgICAgICBuZXdWYWx1ZSA9IGF1dG9WYWx1ZVthdk9wZXJhdG9yXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBZGQgJHNldCBmb3IgdXBkYXRlcyBhbmQgdXBzZXJ0cyBpZiBuZWNlc3NhcnkuIEtlZXAgdGhpc1xuICAgICAgLy8gYWJvdmUgdGhlIFwiaWYgKG9wKVwiIGJsb2NrIGJlbG93IHNpbmNlIHdlIG1pZ2h0IGNoYW5nZSBvcFxuICAgICAgLy8gaW4gdGhpcyBsaW5lLlxuICAgICAgaWYgKCFvcCAmJiBwb3NpdGlvbi5zbGljZSgwLCAxKSAhPT0gJyQnKSB7XG4gICAgICAgIG9wID0gJyRzZXQnO1xuICAgICAgICBuZXdWYWx1ZSA9IGF1dG9WYWx1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wKSB7XG4gICAgICAgIC8vIFVwZGF0ZS9jaGFuZ2UgdmFsdWVcbiAgICAgICAgbW9uZ29PYmplY3QucmVtb3ZlVmFsdWVGb3JQb3NpdGlvbihwb3NpdGlvbik7XG4gICAgICAgIG1vbmdvT2JqZWN0LnNldFZhbHVlRm9yUG9zaXRpb24oYCR7b3B9WyR7YWZmZWN0ZWRLZXl9XWAsIGNsb25lKG5ld1ZhbHVlKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBVcGRhdGUvY2hhbmdlIHZhbHVlLiBDbG9uaW5nIGlzIG5lY2Vzc2FyeSBpbiBjYXNlIGl0J3MgYW4gb2JqZWN0LCBiZWNhdXNlXG4gICAgLy8gaWYgd2UgbGF0ZXIgc2V0IHNvbWUga2V5cyB3aXRoaW4gaXQsIHRoZXknZCBiZSBzZXQgb24gdGhlIG9yaWdpbmFsIG9iamVjdCwgdG9vLlxuICAgIG1vbmdvT2JqZWN0LnNldFZhbHVlRm9yUG9zaXRpb24ocG9zaXRpb24sIGNsb25lKGF1dG9WYWx1ZSkpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBTaW1wbGVTY2hlbWEgfSBmcm9tICcuLi9TaW1wbGVTY2hlbWEnO1xuXG4vKipcbiAqIENvbnZlcnRzIHZhbHVlIHRvIHByb3BlciB0eXBlXG4gKlxuICogQHBhcmFtIHtBbnl9IHZhbHVlIFZhbHVlIHRvIHRyeSB0byBjb252ZXJ0XG4gKiBAcGFyYW0ge0FueX0gdHlwZSAgQSB0eXBlXG4gKiBAcmV0dXJucyB7QW55fSBWYWx1ZSBjb252ZXJ0ZWQgdG8gdHlwZS5cbiAqL1xuZnVuY3Rpb24gY29udmVydFRvUHJvcGVyVHlwZSh2YWx1ZSwgdHlwZSkge1xuICAvLyBDYW4ndCBhbmQgc2hvdWxkbid0IGNvbnZlcnQgYXJyYXlzIG9yIG9iamVjdHMgb3IgbnVsbFxuICBpZiAoXG4gICAgQXJyYXkuaXNBcnJheSh2YWx1ZSlcbiAgICB8fCAodmFsdWUgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSAmJiAhKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkpXG4gICAgfHwgdmFsdWUgPT09IG51bGxcbiAgKSByZXR1cm4gdmFsdWU7XG5cbiAgLy8gQ29udmVydCB0byBTdHJpbmcgdHlwZVxuICBpZiAodHlwZSA9PT0gU3RyaW5nKSB7XG4gICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHJldHVybiB2YWx1ZTtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuXG4gIC8vIENvbnZlcnQgdG8gTnVtYmVyIHR5cGVcbiAgaWYgKHR5cGUgPT09IE51bWJlciB8fCB0eXBlID09PSBTaW1wbGVTY2hlbWEuSW50ZWdlcikge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFRyeSB0byBjb252ZXJ0IG51bWVyaWMgc3RyaW5ncyB0byBudW1iZXJzXG4gICAgICBjb25zdCBudW1iZXJWYWwgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKCFpc05hTihudW1iZXJWYWwpKSByZXR1cm4gbnVtYmVyVmFsO1xuICAgIH1cbiAgICAvLyBMZWF2ZSBpdDsgd2lsbCBmYWlsIHZhbGlkYXRpb25cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvLyBJZiB0YXJnZXQgdHlwZSBpcyBhIERhdGUgd2UgY2FuIHNhZmVseSBjb252ZXJ0IGZyb20gZWl0aGVyIGFcbiAgLy8gbnVtYmVyIChJbnRlZ2VyIHZhbHVlIHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kc1xuICAvLyBzaW5jZSAxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpIG9yIGEgc3RyaW5nIHRoYXQgY2FuIGJlIHBhcnNlZFxuICAvLyBieSBEYXRlLlxuICBpZiAodHlwZSA9PT0gRGF0ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBwYXJzZWREYXRlID0gRGF0ZS5wYXJzZSh2YWx1ZSk7XG4gICAgICBpZiAoaXNOYU4ocGFyc2VkRGF0ZSkgPT09IGZhbHNlKSByZXR1cm4gbmV3IERhdGUocGFyc2VkRGF0ZSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSByZXR1cm4gbmV3IERhdGUodmFsdWUpO1xuICB9XG5cbiAgLy8gQ29udmVydCB0byBCb29sZWFuIHR5cGVcbiAgaWYgKHR5cGUgPT09IEJvb2xlYW4pIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gQ29udmVydCBleGFjdCBzdHJpbmcgJ3RydWUnIGFuZCAnZmFsc2UnIHRvIHRydWUgYW5kIGZhbHNlIHJlc3BlY3RpdmVseVxuICAgICAgaWYgKHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICd0cnVlJykgcmV0dXJuIHRydWU7XG4gICAgICBpZiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ2ZhbHNlJykgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpKSB7IC8vIE5hTiBjYW4gYmUgZXJyb3IsIHNvIHNraXBwaW5nIGl0XG4gICAgICByZXR1cm4gQm9vbGVhbih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgYW4gYXJyYXkgaXMgd2hhdCB5b3Ugd2FudCwgSSdsbCBnaXZlIHlvdSBhbiBhcnJheVxuICBpZiAodHlwZSA9PT0gQXJyYXkpIHJldHVybiBbdmFsdWVdO1xuXG4gIC8vIENvdWxkIG5vdCBjb252ZXJ0XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29udmVydFRvUHJvcGVyVHlwZTtcbiIsImltcG9ydCBNb25nb09iamVjdCBmcm9tICdtb25nby1vYmplY3QnO1xuaW1wb3J0IHsgZ2V0TGFzdFBhcnRPZktleSwgZ2V0UGFyZW50T2ZLZXkgfSBmcm9tICcuLi91dGlsaXR5JztcblxuLyoqXG4gKiBBIHBvc2l0aW9uIGlzIGEgcGxhY2UgaW4gdGhlIG9iamVjdCB3aGVyZSB0aGlzIGZpZWxkIGV4aXN0cy5cbiAqIElmIG5vIGFycmF5cyBhcmUgaW52b2x2ZWQsIHRoZW4gZXZlcnkgZmllbGQva2V5IGhhcyBhdCBtb3N0IDEgcG9zaXRpb24uXG4gKiBJZiBhcnJheXMgYXJlIGludm9sdmVkLCB0aGVuIGEgZmllbGQgY291bGQgaGF2ZSBwb3RlbnRpYWxseSB1bmxpbWl0ZWQgcG9zaXRpb25zLlxuICpcbiAqIEZvciBleGFtcGxlLCB0aGUga2V5ICdhLmIuJC5jYCB3b3VsZCBoYXZlIHRoZXNlIHBvc2l0aW9uczpcbiAqICAgYGFbYl1bMF1bY11gXG4gKiAgIGBhW2JdWzFdW2NdYFxuICogICBgYVtiXVsyXVtjXWBcbiAqXG4gKiBGb3IgdGhpcyBvYmplY3Q6XG4gKiB7XG4gKiAgIGE6IHtcbiAqICAgICBiOiBbXG4gKiAgICAgICB7IGM6IDEgfSxcbiAqICAgICAgIHsgYzogMSB9LFxuICogICAgICAgeyBjOiAxIH0sXG4gKiAgICAgXSxcbiAqICAgfSxcbiAqIH1cbiAqXG4gKiBUbyBtYWtlIG1hdHRlcnMgbW9yZSBjb21wbGljYXRlZCwgd2Ugd2FudCB0byBpbmNsdWRlIG5vdCBvbmx5IHRoZSBleGlzdGluZyBwb3NpdGlvbnNcbiAqIGJ1dCBhbHNvIHRoZSBwb3NpdGlvbnMgdGhhdCBtaWdodCBleGlzdCBkdWUgdG8gdGhlaXIgcGFyZW50IG9iamVjdCBleGlzdGluZyBvciB0aGVpclxuICogcGFyZW50IG9iamVjdCBiZWluZyBhdXRvLWNyZWF0ZWQgYnkgYSBNb25nb0RCIG1vZGlmaWVyIHRoYXQgaW1wbGllcyBpdC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0UG9zaXRpb25zRm9yQXV0b1ZhbHVlKHsgZmllbGROYW1lLCBpc01vZGlmaWVyLCBtb25nb09iamVjdCB9KSB7XG4gIC8vIFBvc2l0aW9ucyBmb3IgdGhpcyBmaWVsZFxuICBjb25zdCBwb3NpdGlvbnMgPSBtb25nb09iamVjdC5nZXRQb3NpdGlvbnNJbmZvRm9yR2VuZXJpY0tleShmaWVsZE5hbWUpO1xuXG4gIC8vIElmIHRoZSBmaWVsZCBpcyBhbiBvYmplY3QgYW5kIHdpbGwgYmUgY3JlYXRlZCBieSBNb25nb0RCLFxuICAvLyB3ZSBkb24ndCBuZWVkIChhbmQgY2FuJ3QgaGF2ZSkgYSB2YWx1ZSBmb3IgaXRcbiAgaWYgKGlzTW9kaWZpZXIgJiYgbW9uZ29PYmplY3QuZ2V0UG9zaXRpb25zVGhhdENyZWF0ZUdlbmVyaWNLZXkoZmllbGROYW1lKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgfVxuXG4gIC8vIEZvciBzaW1wbGUgdG9wLWxldmVsIGZpZWxkcywganVzdCBhZGQgYW4gdW5kZWZpbmVkIHdvdWxkLWJlIHBvc2l0aW9uXG4gIC8vIGlmIHRoZXJlIGlzbid0IGEgcmVhbCBwb3NpdGlvbi5cbiAgaWYgKGZpZWxkTmFtZS5pbmRleE9mKCcuJykgPT09IC0xICYmIHBvc2l0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICBwb3NpdGlvbnMucHVzaCh7XG4gICAgICBrZXk6IGZpZWxkTmFtZSxcbiAgICAgIHZhbHVlOiB1bmRlZmluZWQsXG4gICAgICBvcGVyYXRvcjogaXNNb2RpZmllciA/ICckc2V0JyA6IG51bGwsXG4gICAgICBwb3NpdGlvbjogaXNNb2RpZmllciA/IGAkc2V0WyR7ZmllbGROYW1lfV1gIDogZmllbGROYW1lLFxuICAgIH0pO1xuICAgIHJldHVybiBwb3NpdGlvbnM7XG4gIH1cblxuICBjb25zdCBwYXJlbnRQYXRoID0gZ2V0UGFyZW50T2ZLZXkoZmllbGROYW1lKTtcbiAgY29uc3QgbGFzdFBhcnQgPSBnZXRMYXN0UGFydE9mS2V5KGZpZWxkTmFtZSwgcGFyZW50UGF0aCk7XG4gIGNvbnN0IGxhc3RQYXJ0V2l0aEJyYWNlcyA9IGxhc3RQYXJ0LnJlcGxhY2UoL1xcLi9nLCAnXVsnKTtcbiAgY29uc3QgcGFyZW50UG9zaXRpb25zID0gbW9uZ29PYmplY3QuZ2V0UG9zaXRpb25zSW5mb0ZvckdlbmVyaWNLZXkocGFyZW50UGF0aCk7XG5cbiAgaWYgKHBhcmVudFBvc2l0aW9ucy5sZW5ndGgpIHtcbiAgICBwYXJlbnRQb3NpdGlvbnMuZm9yRWFjaCgoaW5mbykgPT4ge1xuICAgICAgY29uc3QgY2hpbGRQb3NpdGlvbiA9IGAke2luZm8ucG9zaXRpb259WyR7bGFzdFBhcnRXaXRoQnJhY2VzfV1gO1xuICAgICAgaWYgKCFwb3NpdGlvbnMuZmluZCgoaSkgPT4gaS5wb3NpdGlvbiA9PT0gY2hpbGRQb3NpdGlvbikpIHtcbiAgICAgICAgcG9zaXRpb25zLnB1c2goe1xuICAgICAgICAgIGtleTogYCR7aW5mby5rZXl9LiR7bGFzdFBhcnR9YCxcbiAgICAgICAgICB2YWx1ZTogdW5kZWZpbmVkLFxuICAgICAgICAgIG9wZXJhdG9yOiBpbmZvLm9wZXJhdG9yLFxuICAgICAgICAgIHBvc2l0aW9uOiBjaGlsZFBvc2l0aW9uLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSBlbHNlIGlmIChwYXJlbnRQYXRoLnNsaWNlKC0yKSAhPT0gJy4kJykge1xuICAgIC8vIHBvc2l0aW9ucyB0aGF0IHdpbGwgY3JlYXRlIHBhcmVudFBhdGhcbiAgICBtb25nb09iamVjdC5nZXRQb3NpdGlvbnNUaGF0Q3JlYXRlR2VuZXJpY0tleShwYXJlbnRQYXRoKS5mb3JFYWNoKChpbmZvKSA9PiB7XG4gICAgICBjb25zdCB7IG9wZXJhdG9yLCBwb3NpdGlvbiB9ID0gaW5mbztcbiAgICAgIGxldCB3b3VsZEJlUG9zaXRpb247XG4gICAgICBpZiAob3BlcmF0b3IpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHBvc2l0aW9uLnNsaWNlKHBvc2l0aW9uLmluZGV4T2YoJ1snKSArIDEsIHBvc2l0aW9uLmluZGV4T2YoJ10nKSk7XG4gICAgICAgIGNvbnN0IG5leHRQaWVjZXMgPSBuZXh0LnNwbGl0KCcuJyk7XG5cbiAgICAgICAgY29uc3QgbmV3UGllY2VzID0gW107XG4gICAgICAgIGxldCBuZXdLZXk7XG4gICAgICAgIHdoaWxlIChuZXh0UGllY2VzLmxlbmd0aCAmJiBuZXdLZXkgIT09IHBhcmVudFBhdGgpIHtcbiAgICAgICAgICBuZXdQaWVjZXMucHVzaChuZXh0UGllY2VzLnNoaWZ0KCkpO1xuICAgICAgICAgIG5ld0tleSA9IG5ld1BpZWNlcy5qb2luKCcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgbmV3S2V5ID0gYCR7bmV3S2V5fS4ke2ZpZWxkTmFtZS5zbGljZShuZXdLZXkubGVuZ3RoICsgMSl9YDtcbiAgICAgICAgd291bGRCZVBvc2l0aW9uID0gYCRzZXRbJHtuZXdLZXl9XWA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsYXN0UGFydDIgPSBnZXRMYXN0UGFydE9mS2V5KGZpZWxkTmFtZSwgcGFyZW50UGF0aCk7XG4gICAgICAgIGNvbnN0IGxhc3RQYXJ0V2l0aEJyYWNlczIgPSBsYXN0UGFydDIucmVwbGFjZSgvXFwuL2csICddWycpO1xuICAgICAgICB3b3VsZEJlUG9zaXRpb24gPSBgJHtwb3NpdGlvbi5zbGljZSgwLCBwb3NpdGlvbi5sYXN0SW5kZXhPZignWycpKX1bJHtsYXN0UGFydFdpdGhCcmFjZXMyfV1gO1xuICAgICAgfVxuICAgICAgaWYgKCFwb3NpdGlvbnMuZmluZCgoaSkgPT4gaS5wb3NpdGlvbiA9PT0gd291bGRCZVBvc2l0aW9uKSkge1xuICAgICAgICBwb3NpdGlvbnMucHVzaCh7XG4gICAgICAgICAga2V5OiBNb25nb09iamVjdC5fcG9zaXRpb25Ub0tleSh3b3VsZEJlUG9zaXRpb24pLFxuICAgICAgICAgIHZhbHVlOiB1bmRlZmluZWQsXG4gICAgICAgICAgb3BlcmF0b3I6IG9wZXJhdG9yID8gJyRzZXQnIDogbnVsbCxcbiAgICAgICAgICBwb3NpdGlvbjogd291bGRCZVBvc2l0aW9uLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbnM7XG59XG4iLCJpbXBvcnQgZ2V0UG9zaXRpb25zRm9yQXV0b1ZhbHVlIGZyb20gJy4vZ2V0UG9zaXRpb25zRm9yQXV0b1ZhbHVlJztcbmltcG9ydCBBdXRvVmFsdWVSdW5uZXIgZnJvbSAnLi9BdXRvVmFsdWVSdW5uZXInO1xuXG4vKipcbiAqIEBtZXRob2Qgc29ydEF1dG9WYWx1ZUZ1bmN0aW9uc1xuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGF1dG9WYWx1ZUZ1bmN0aW9ucyAtIEFycmF5IG9mIG9iamVjdHMgdG8gYmUgc29ydGVkXG4gKiBAcmV0dXJucyB7QXJyYXl9IFNvcnRlZCBhcnJheVxuICpcbiAqIFN0YWJsZSBzb3J0IG9mIHRoZSBhdXRvVmFsdWVGdW5jdGlvbnMgKHByZXNlcnZlcyBvcmRlciBhdCB0aGUgc2FtZSBmaWVsZCBkZXB0aCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzb3J0QXV0b1ZhbHVlRnVuY3Rpb25zKGF1dG9WYWx1ZUZ1bmN0aW9ucykge1xuICBjb25zdCBkZWZhdWx0RmllbGRPcmRlciA9IGF1dG9WYWx1ZUZ1bmN0aW9ucy5yZWR1Y2UoKGFjYywgeyBmaWVsZE5hbWUgfSwgaW5kZXgpID0+IHtcbiAgICBhY2NbZmllbGROYW1lXSA9IGluZGV4O1xuICAgIHJldHVybiBhY2M7XG4gIH0sIHt9KTtcblxuICAvLyBTb3J0IGJ5IGhvdyBtYW55IGRvdHMgZWFjaCBmaWVsZCBuYW1lIGhhcywgYXNjLCBzdWNoIHRoYXQgd2UgY2FuIGF1dG8tY3JlYXRlXG4gIC8vIG9iamVjdHMgYW5kIGFycmF5cyBiZWZvcmUgd2UgcnVuIHRoZSBhdXRvVmFsdWVzIGZvciBwcm9wZXJ0aWVzIHdpdGhpbiB0aGVtLlxuICAvLyBGaWVsZHMgb2YgdGhlIHNhbWUgbGV2ZWwgKHNhbWUgbnVtYmVyIG9mIGRvdHMpIHByZXNlcnZlIHNob3VsZCBvcmRlciBmcm9tIHRoZSBvcmlnaW5hbCBhcnJheS5cbiAgcmV0dXJuIGF1dG9WYWx1ZUZ1bmN0aW9ucy5zb3J0KChhLCBiKSA9PiB7XG4gICAgY29uc3QgZGVwdGhEaWZmID0gYS5maWVsZE5hbWUuc3BsaXQoJy4nKS5sZW5ndGggLSBiLmZpZWxkTmFtZS5zcGxpdCgnLicpLmxlbmd0aDtcbiAgICByZXR1cm4gZGVwdGhEaWZmID09PSAwID8gZGVmYXVsdEZpZWxkT3JkZXJbYS5maWVsZE5hbWVdIC0gZGVmYXVsdEZpZWxkT3JkZXJbYi5maWVsZE5hbWVdIDogZGVwdGhEaWZmO1xuICB9KTtcbn1cblxuLyoqXG4gKiBAbWV0aG9kIHNldEF1dG9WYWx1ZXNcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhdXRvVmFsdWVGdW5jdGlvbnMgLSBBbiBhcnJheSBvZiBvYmplY3RzIHdpdGggZnVuYywgZmllbGROYW1lLCBhbmQgY2xvc2VzdFN1YnNjaGVtYUZpZWxkTmFtZSBwcm9wc1xuICogQHBhcmFtIHtNb25nb09iamVjdH0gbW9uZ29PYmplY3RcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2lzTW9kaWZpZXI9ZmFsc2VdIC0gSXMgaXQgYSBtb2RpZmllciBkb2M/XG4gKiBAcGFyYW0ge09iamVjdH0gW2V4dGVuZGVkQXV0b1ZhbHVlQ29udGV4dF0gLSBPYmplY3QgdGhhdCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBjb250ZXh0IHdoZW4gY2FsbGluZyBlYWNoIGF1dG9WYWx1ZSBmdW5jdGlvblxuICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAqXG4gKiBVcGRhdGVzIGRvYyB3aXRoIGF1dG9tYXRpYyB2YWx1ZXMgZnJvbSBhdXRvVmFsdWUgZnVuY3Rpb25zIG9yIGRlZmF1bHRcbiAqIHZhbHVlcyBmcm9tIGRlZmF1bHRWYWx1ZS4gTW9kaWZpZXMgdGhlIHJlZmVyZW5jZWQgb2JqZWN0IGluIHBsYWNlLlxuICovXG5mdW5jdGlvbiBzZXRBdXRvVmFsdWVzKGF1dG9WYWx1ZUZ1bmN0aW9ucywgbW9uZ29PYmplY3QsIGlzTW9kaWZpZXIsIGlzVXBzZXJ0LCBleHRlbmRlZEF1dG9WYWx1ZUNvbnRleHQpIHtcbiAgY29uc3Qgc29ydGVkQXV0b1ZhbHVlRnVuY3Rpb25zID0gc29ydEF1dG9WYWx1ZUZ1bmN0aW9ucyhhdXRvVmFsdWVGdW5jdGlvbnMpO1xuXG4gIHNvcnRlZEF1dG9WYWx1ZUZ1bmN0aW9ucy5mb3JFYWNoKCh7IGZ1bmMsIGZpZWxkTmFtZSwgY2xvc2VzdFN1YnNjaGVtYUZpZWxkTmFtZSB9KSA9PiB7XG4gICAgY29uc3QgYXZSdW5uZXIgPSBuZXcgQXV0b1ZhbHVlUnVubmVyKHtcbiAgICAgIGNsb3Nlc3RTdWJzY2hlbWFGaWVsZE5hbWUsXG4gICAgICBleHRlbmRlZEF1dG9WYWx1ZUNvbnRleHQsXG4gICAgICBmdW5jLFxuICAgICAgaXNNb2RpZmllcixcbiAgICAgIGlzVXBzZXJ0LFxuICAgICAgbW9uZ29PYmplY3QsXG4gICAgfSk7XG5cbiAgICBjb25zdCBwb3NpdGlvbnMgPSBnZXRQb3NpdGlvbnNGb3JBdXRvVmFsdWUoeyBmaWVsZE5hbWUsIGlzTW9kaWZpZXIsIG1vbmdvT2JqZWN0IH0pO1xuXG4gICAgLy8gUnVuIHRoZSBhdXRvVmFsdWUgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBwbGFjZSBpbiB0aGUgb2JqZWN0IHRoYXRcbiAgICAvLyBoYXMgYSB2YWx1ZSBvciB0aGF0IHBvdGVudGlhbGx5IHNob3VsZC5cbiAgICBwb3NpdGlvbnMuZm9yRWFjaChhdlJ1bm5lci5ydW5Gb3JQb3NpdGlvbi5iaW5kKGF2UnVubmVyKSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzZXRBdXRvVmFsdWVzO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXBwZW5kQWZmZWN0ZWRLZXkoYWZmZWN0ZWRLZXksIGtleSkge1xuICBpZiAoa2V5ID09PSAnJGVhY2gnKSByZXR1cm4gYWZmZWN0ZWRLZXk7XG4gIHJldHVybiBhZmZlY3RlZEtleSA/IGAke2FmZmVjdGVkS2V5fS4ke2tleX1gIDoga2V5O1xufVxuIiwiLyoqXG4gKiBHaXZlbiBhIERhdGUgaW5zdGFuY2UsIHJldHVybnMgYSBkYXRlIHN0cmluZyBvZiB0aGUgZm9ybWF0IFlZWVktTU0tRERcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGF0ZVRvRGF0ZVN0cmluZyhkYXRlKSB7XG4gIGxldCBtID0gKGRhdGUuZ2V0VVRDTW9udGgoKSArIDEpO1xuICBpZiAobSA8IDEwKSBtID0gYDAke219YDtcbiAgbGV0IGQgPSBkYXRlLmdldFVUQ0RhdGUoKTtcbiAgaWYgKGQgPCAxMCkgZCA9IGAwJHtkfWA7XG4gIHJldHVybiBgJHtkYXRlLmdldFVUQ0Z1bGxZZWFyKCl9LSR7bX0tJHtkfWA7XG59XG4iLCIvKipcbiAqIFJ1biBsb29wRnVuYyBmb3IgZWFjaCBhbmNlc3RvciBrZXkgaW4gYSBkb3QtZGVsaW1pdGVkIGtleS4gRm9yIGV4YW1wbGUsXG4gKiBpZiBrZXkgaXMgXCJhLmIuY1wiLCBsb29wRnVuYyB3aWxsIGJlIGNhbGxlZCBmaXJzdCB3aXRoICgnYS5iJywgJ2MnKSBhbmQgdGhlbiB3aXRoICgnYScsICdiLmMnKVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmb3JFYWNoS2V5QW5jZXN0b3Ioa2V5LCBsb29wRnVuYykge1xuICBsZXQgbGFzdERvdDtcblxuICAvLyBJdGVyYXRlIHRoZSBkb3Qtc3ludGF4IGhpZXJhcmNoeVxuICBsZXQgYW5jZXN0b3IgPSBrZXk7XG4gIGRvIHtcbiAgICBsYXN0RG90ID0gYW5jZXN0b3IubGFzdEluZGV4T2YoJy4nKTtcbiAgICBpZiAobGFzdERvdCAhPT0gLTEpIHtcbiAgICAgIGFuY2VzdG9yID0gYW5jZXN0b3Iuc2xpY2UoMCwgbGFzdERvdCk7XG4gICAgICBjb25zdCByZW1haW5kZXIgPSBrZXkuc2xpY2UoYW5jZXN0b3IubGVuZ3RoICsgMSk7XG4gICAgICBsb29wRnVuYyhhbmNlc3RvciwgcmVtYWluZGVyKTsgLy8gUmVtb3ZlIGxhc3QgcGF0aCBjb21wb25lbnRcbiAgICB9XG4gIH0gd2hpbGUgKGxhc3REb3QgIT09IC0xKTtcbn1cbiIsIi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBrZXlzIHRoYXQgYXJlIGluIG9iaiwgaGF2ZSBhIHZhbHVlXG4gKiBvdGhlciB0aGFuIG51bGwgb3IgdW5kZWZpbmVkLCBhbmQgc3RhcnQgd2l0aCBtYXRjaEtleVxuICogcGx1cyBhIGRvdC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0S2V5c1dpdGhWYWx1ZUluT2JqKG9iaiwgbWF0Y2hLZXkpIHtcbiAgY29uc3Qga2V5c1dpdGhWYWx1ZSA9IFtdO1xuXG4gIGNvbnN0IGtleUFkanVzdCA9IChrKSA9PiBrLnNsaWNlKDAsIG1hdGNoS2V5Lmxlbmd0aCArIDEpO1xuICBjb25zdCBtYXRjaEtleVBsdXNEb3QgPSBgJHttYXRjaEtleX0uYDtcblxuICBPYmplY3Qua2V5cyhvYmogfHwge30pLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IHZhbCA9IG9ialtrZXldO1xuICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCB8fCB2YWwgPT09IG51bGwpIHJldHVybjtcbiAgICBpZiAoa2V5QWRqdXN0KGtleSkgPT09IG1hdGNoS2V5UGx1c0RvdCkge1xuICAgICAga2V5c1dpdGhWYWx1ZS5wdXNoKGtleSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ga2V5c1dpdGhWYWx1ZTtcbn1cbiIsIi8qKlxuICogUmV0dXJucyB0aGUgZW5kaW5nIG9mIGtleSwgYWZ0ZXIgc3RyaXBwaW5nIG91dCB0aGUgYmVnaW5uaW5nXG4gKiBhbmNlc3RvcktleSBhbmQgYW55IGFycmF5IHBsYWNlaG9sZGVyc1xuICpcbiAqIGdldExhc3RQYXJ0T2ZLZXkoJ2EuYi5jJywgJ2EnKSByZXR1cm5zICdiLmMnXG4gKiBnZXRMYXN0UGFydE9mS2V5KCdhLmIuJC5jJywgJ2EuYicpIHJldHVybnMgJ2MnXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldExhc3RQYXJ0T2ZLZXkoa2V5LCBhbmNlc3RvcktleSkge1xuICBsZXQgbGFzdFBhcnQgPSAnJztcbiAgY29uc3Qgc3RhcnRTdHJpbmcgPSBgJHthbmNlc3RvcktleX0uYDtcbiAgaWYgKGtleS5pbmRleE9mKHN0YXJ0U3RyaW5nKSA9PT0gMCkge1xuICAgIGxhc3RQYXJ0ID0ga2V5LnJlcGxhY2Uoc3RhcnRTdHJpbmcsICcnKTtcbiAgICBpZiAobGFzdFBhcnQuc3RhcnRzV2l0aCgnJC4nKSkgbGFzdFBhcnQgPSBsYXN0UGFydC5zbGljZSgyKTtcbiAgfVxuICByZXR1cm4gbGFzdFBhcnQ7XG59XG4iLCIvKipcbiAqIFJldHVybnMgdGhlIHBhcmVudCBvZiBhIGtleS4gRm9yIGV4YW1wbGUsIHJldHVybnMgJ2EuYicgd2hlbiBwYXNzZWQgJ2EuYi5jJy5cbiAqIElmIG5vIHBhcmVudCwgcmV0dXJucyBhbiBlbXB0eSBzdHJpbmcuIElmIHdpdGhFbmREb3QgaXMgdHJ1ZSwgdGhlIHJldHVyblxuICogdmFsdWUgd2lsbCBoYXZlIGEgZG90IGFwcGVuZGVkIHdoZW4gaXQgaXNuJ3QgYW4gZW1wdHkgc3RyaW5nLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRQYXJlbnRPZktleShrZXksIHdpdGhFbmREb3QpIHtcbiAgY29uc3QgbGFzdERvdCA9IGtleS5sYXN0SW5kZXhPZignLicpO1xuICByZXR1cm4gbGFzdERvdCA9PT0gLTEgPyAnJyA6IGtleS5zbGljZSgwLCBsYXN0RG90ICsgTnVtYmVyKCEhd2l0aEVuZERvdCkpO1xufVxuIiwiZXhwb3J0IHsgZGVmYXVsdCBhcyBhcHBlbmRBZmZlY3RlZEtleSB9IGZyb20gJy4vYXBwZW5kQWZmZWN0ZWRLZXknO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBkYXRlVG9EYXRlU3RyaW5nIH0gZnJvbSAnLi9kYXRlVG9EYXRlU3RyaW5nJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgZm9yRWFjaEtleUFuY2VzdG9yIH0gZnJvbSAnLi9mb3JFYWNoS2V5QW5jZXN0b3InO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBnZXRLZXlzV2l0aFZhbHVlSW5PYmogfSBmcm9tICcuL2dldEtleXNXaXRoVmFsdWVJbk9iaic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGdldExhc3RQYXJ0T2ZLZXkgfSBmcm9tICcuL2dldExhc3RQYXJ0T2ZLZXknO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBnZXRQYXJlbnRPZktleSB9IGZyb20gJy4vZ2V0UGFyZW50T2ZLZXknO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBpc0VtcHR5T2JqZWN0IH0gZnJvbSAnLi9pc0VtcHR5T2JqZWN0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgaXNPYmplY3RXZVNob3VsZFRyYXZlcnNlIH0gZnJvbSAnLi9pc09iamVjdFdlU2hvdWxkVHJhdmVyc2UnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBsb29rc0xpa2VNb2RpZmllciB9IGZyb20gJy4vbG9va3NMaWtlTW9kaWZpZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBtZXJnZSB9IGZyb20gJy4vbWVyZ2UnO1xuIiwiLyoqXG4gKiBAc3VtbWFyeSBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIG9iamVjdCBoYXMgYW55IFwib3duXCIgcHJvcGVydGllc1xuICogQHBhcmFtIHtPYmplY3R9IG9iaiBPYmplY3QgdG8gdGVzdFxuICogQHJldHVybiB7Qm9vbGVhbn0gVHJ1ZSBpZiBpdCBoYXMgbm8gXCJvd25cIiBwcm9wZXJ0aWVzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlzRW1wdHlPYmplY3Qob2JqKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXJlc3RyaWN0ZWQtc3ludGF4ICovXG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbm8tcmVzdHJpY3RlZC1zeW50YXggKi9cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlzT2JqZWN0V2VTaG91bGRUcmF2ZXJzZSh2YWwpIHtcbiAgLy8gU29tZSBvZiB0aGVzZSB0eXBlcyBkb24ndCBleGlzdCBpbiBvbGQgYnJvd3NlcnMgc28gd2UnbGwgY2F0Y2ggYW5kIHJldHVybiBmYWxzZSBpbiB0aG9zZSBjYXNlc1xuICB0cnkge1xuICAgIGlmICh2YWwgIT09IE9iamVjdCh2YWwpKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gVGhlcmUgYXJlIHNvbWUgb2JqZWN0IHR5cGVzIHRoYXQgd2Uga25vdyB3ZSBzaG91bGRuJ3QgdHJhdmVyc2UgYmVjYXVzZVxuICAgIC8vIHRoZXkgd2lsbCBvZnRlbiByZXN1bHQgaW4gb3ZlcmZsb3dzIGFuZCBpdCBtYWtlcyBubyBzZW5zZSB0byB2YWxpZGF0ZSB0aGVtLlxuICAgIGlmICh2YWwgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHZhbCBpbnN0YW5jZW9mIEludDhBcnJheSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh2YWwgaW5zdGFuY2VvZiBVaW50OEFycmF5KSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHZhbCBpbnN0YW5jZW9mIFVpbnQ4Q2xhbXBlZEFycmF5KSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHZhbCBpbnN0YW5jZW9mIEludDE2QXJyYXkpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodmFsIGluc3RhbmNlb2YgVWludDE2QXJyYXkpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodmFsIGluc3RhbmNlb2YgSW50MzJBcnJheSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh2YWwgaW5zdGFuY2VvZiBVaW50MzJBcnJheSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh2YWwgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodmFsIGluc3RhbmNlb2YgRmxvYXQ2NEFycmF5KSByZXR1cm4gZmFsc2U7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiIsIi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGFueSBvZiB0aGUga2V5cyBvZiBvYmogc3RhcnQgd2l0aCBhICRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbG9va3NMaWtlTW9kaWZpZXIob2JqKSB7XG4gIHJldHVybiAhIU9iamVjdC5rZXlzKG9iaiB8fCB7fSkuZmluZCgoa2V5KSA9PiBrZXkuc3Vic3RyaW5nKDAsIDEpID09PSAnJCcpO1xufVxuIiwiLyoqXG4gKiBXZSBoYXZlIHJlbGF0aXZlbHkgc2ltcGxlIGRlZXAgbWVyZ2luZyByZXF1aXJlbWVudHMgaW4gdGhpcyBwYWNrYWdlLlxuICogV2UgYXJlIG9ubHkgZXZlciBtZXJnaW5nIG1lc3NhZ2VzIGNvbmZpZywgc28gd2Uga25vdyB0aGUgc3RydWN0dXJlLFxuICogd2Uga25vdyB0aGVyZSBhcmUgbm8gYXJyYXlzLCBhbmQgd2Uga25vdyB0aGVyZSBhcmUgbm8gY29uc3RydWN0b3JzXG4gKiBvciB3ZWlyZGx5IGRlZmluZWQgcHJvcGVydGllcy5cbiAqXG4gKiBUaHVzLCB3ZSBjYW4gd3JpdGUgYSB2ZXJ5IHNpbXBsaXN0aWMgZGVlcCBtZXJnZSBmdW5jdGlvbiB0byBhdm9pZFxuICogcHVsbGluZyBpbiBhIGxhcmdlIGRlcGVuZGVuY3kuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWVyZ2UoZGVzdGluYXRpb24sIC4uLnNvdXJjZXMpIHtcbiAgc291cmNlcy5mb3JFYWNoKChzb3VyY2UpID0+IHtcbiAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgIGlmIChwcm9wID09PSAnX19wcm90b19fJykgcmV0dXJuOyAvLyBwcm90ZWN0IGFnYWluc3QgcHJvdG90eXBlIHBvbGx1dGlvblxuICAgICAgaWYgKFxuICAgICAgICBzb3VyY2VbcHJvcF1cbiAgICAgICAgJiYgc291cmNlW3Byb3BdLmNvbnN0cnVjdG9yXG4gICAgICAgICYmIHNvdXJjZVtwcm9wXS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0XG4gICAgICApIHtcbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvbltwcm9wXSB8fCAhZGVzdGluYXRpb25bcHJvcF0uY29uc3RydWN0b3IgfHwgZGVzdGluYXRpb25bcHJvcF0uY29uc3RydWN0b3IgIT09IE9iamVjdCkge1xuICAgICAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgbWVyZ2UoZGVzdGluYXRpb25bcHJvcF0sIHNvdXJjZVtwcm9wXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXN0aW5hdGlvbltwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xufVxuIiwiaW1wb3J0IHsgU2ltcGxlU2NoZW1hIH0gZnJvbSAnLi4vU2ltcGxlU2NoZW1hJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWxsb3dlZFZhbHVlc1ZhbGlkYXRvcigpIHtcbiAgaWYgKCF0aGlzLnZhbHVlU2hvdWxkQmVDaGVja2VkKSByZXR1cm47XG5cbiAgY29uc3QgeyBhbGxvd2VkVmFsdWVzIH0gPSB0aGlzLmRlZmluaXRpb247XG4gIGlmICghYWxsb3dlZFZhbHVlcykgcmV0dXJuO1xuXG4gIGxldCBpc0FsbG93ZWQ7XG4gIC8vIHNldCBkZWZpbmVkIGluIHNjb3BlIGFuZCBhbGxvd2VkVmFsdWVzIGlzIGl0cyBpbnN0YW5jZVxuICBpZiAodHlwZW9mIFNldCA9PT0gJ2Z1bmN0aW9uJyAmJiBhbGxvd2VkVmFsdWVzIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgaXNBbGxvd2VkID0gYWxsb3dlZFZhbHVlcy5oYXModGhpcy52YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgaXNBbGxvd2VkID0gYWxsb3dlZFZhbHVlcy5pbmNsdWRlcyh0aGlzLnZhbHVlKTtcbiAgfVxuXG4gIHJldHVybiBpc0FsbG93ZWQgPyB0cnVlIDogU2ltcGxlU2NoZW1hLkVycm9yVHlwZXMuVkFMVUVfTk9UX0FMTE9XRUQ7XG59XG4iLCJpbXBvcnQgeyBTaW1wbGVTY2hlbWEgfSBmcm9tICcuLi9TaW1wbGVTY2hlbWEnO1xuaW1wb3J0IHsgZ2V0S2V5c1dpdGhWYWx1ZUluT2JqIH0gZnJvbSAnLi4vdXRpbGl0eSc7XG5cbi8vIENoZWNrIGZvciBtaXNzaW5nIHJlcXVpcmVkIHZhbHVlcy4gVGhlIGdlbmVyYWwgbG9naWMgaXMgdGhpczpcbi8vICogSWYgdGhlIG9wZXJhdG9yIGlzICR1bnNldCBvciAkcmVuYW1lLCBpdCdzIGludmFsaWQuXG4vLyAqIElmIHRoZSB2YWx1ZSBpcyBudWxsLCBpdCdzIGludmFsaWQuXG4vLyAqIElmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQgYW5kIG9uZSBvZiB0aGUgZm9sbG93aW5nIGFyZSB0cnVlLCBpdCdzIGludmFsaWQ6XG4vLyAgICAgKiBXZSdyZSB2YWxpZGF0aW5nIGEga2V5IG9mIGEgc3ViLW9iamVjdC5cbi8vICAgICAqIFdlJ3JlIHZhbGlkYXRpbmcgYSBrZXkgb2YgYW4gb2JqZWN0IHRoYXQgaXMgYW4gYXJyYXkgaXRlbS5cbi8vICAgICAqIFdlJ3JlIHZhbGlkYXRpbmcgYSBkb2N1bWVudCAoYXMgb3Bwb3NlZCB0byBhIG1vZGlmaWVyKS5cbi8vICAgICAqIFdlJ3JlIHZhbGlkYXRpbmcgYSBrZXkgdW5kZXIgdGhlICRzZXQgb3BlcmF0b3IgaW4gYSBtb2RpZmllciwgYW5kIGl0J3MgYW4gdXBzZXJ0LlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVxdWlyZWRWYWxpZGF0b3IoKSB7XG4gIGNvbnN0IHtcbiAgICBkZWZpbml0aW9uLCBpc0luQXJyYXlJdGVtT2JqZWN0LCBpc0luU3ViT2JqZWN0LCBrZXksIG9iaiwgb3BlcmF0b3IsIHZhbHVlLFxuICB9ID0gdGhpcztcbiAgY29uc3QgeyBvcHRpb25hbCB9ID0gZGVmaW5pdGlvbjtcblxuICBpZiAob3B0aW9uYWwpIHJldHVybjtcblxuICAvLyBJZiB2YWx1ZSBpcyBudWxsLCBubyBtYXR0ZXIgd2hhdCwgd2UgYWRkIHJlcXVpcmVkXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCkgcmV0dXJuIFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLlJFUVVJUkVEO1xuXG4gIC8vIElmIG9wZXJhdG9yIHdvdWxkIHJlbW92ZSwgd2UgYWRkIHJlcXVpcmVkXG4gIGlmIChvcGVyYXRvciA9PT0gJyR1bnNldCcgfHwgb3BlcmF0b3IgPT09ICckcmVuYW1lJykgcmV0dXJuIFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLlJFUVVJUkVEO1xuXG4gIC8vIFRoZSByZXN0IG9mIHRoZXNlIGFwcGx5IG9ubHkgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZFxuICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gIC8vIEF0IHRoaXMgcG9pbnQsIGlmIGl0J3MgYSBub3JtYWwsIG5vbi1tb2RpZmllciBvYmplY3QsIHRoZW4gYSBtaXNzaW5nIHZhbHVlIGlzIGFuIGVycm9yXG4gIGlmICghb3BlcmF0b3IpIHJldHVybiBTaW1wbGVTY2hlbWEuRXJyb3JUeXBlcy5SRVFVSVJFRDtcblxuICAvLyBFdmVyeXRoaW5nIGJleW9uZCB0aGlzIHBvaW50IGRlYWxzIHdpdGggbW9kaWZpZXIgb2JqZWN0cyBvbmx5XG5cbiAgLy8gV2UgY2FuIHNraXAgdGhlIHJlcXVpcmVkIGNoZWNrIGZvciBrZXlzIHRoYXQgYXJlIGFuY2VzdG9ycyBvZiB0aG9zZSBpbiAkc2V0IG9yXG4gIC8vICRzZXRPbkluc2VydCBiZWNhdXNlIHRoZXkgd2lsbCBiZSBjcmVhdGVkIGJ5IE1vbmdvREIgd2hpbGUgc2V0dGluZy5cbiAgY29uc3Qga2V5c1dpdGhWYWx1ZUluU2V0ID0gZ2V0S2V5c1dpdGhWYWx1ZUluT2JqKG9iai4kc2V0LCBrZXkpO1xuICBpZiAoa2V5c1dpdGhWYWx1ZUluU2V0Lmxlbmd0aCkgcmV0dXJuO1xuICBjb25zdCBrZXlzV2l0aFZhbHVlSW5TZXRPbkluc2VydCA9IGdldEtleXNXaXRoVmFsdWVJbk9iaihvYmouJHNldE9uSW5zZXJ0LCBrZXkpO1xuICBpZiAoa2V5c1dpdGhWYWx1ZUluU2V0T25JbnNlcnQubGVuZ3RoKSByZXR1cm47XG5cbiAgLy8gSW4gdGhlIGNhc2Ugb2YgJHNldCBhbmQgJHNldE9uSW5zZXJ0LCB0aGUgdmFsdWUgbWF5IGJlIHVuZGVmaW5lZCBoZXJlXG4gIC8vIGJ1dCBpdCBpcyBzZXQgaW4gYW5vdGhlciBvcGVyYXRvci4gU28gY2hlY2sgdGhhdCBmaXJzdC5cbiAgY29uc3QgZmllbGRJbmZvID0gdGhpcy5maWVsZChrZXkpO1xuICBpZiAoZmllbGRJbmZvLmlzU2V0ICYmIGZpZWxkSW5mby52YWx1ZSAhPT0gbnVsbCkgcmV0dXJuO1xuXG4gIC8vIFJlcXVpcmVkIGlmIGluIGFuIGFycmF5IG9yIHN1YiBvYmplY3RcbiAgaWYgKGlzSW5BcnJheUl0ZW1PYmplY3QgfHwgaXNJblN1Yk9iamVjdCkgcmV0dXJuIFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLlJFUVVJUkVEO1xuXG4gIC8vIElmIHdlJ3ZlIGdvdCB0aGlzIGZhciB3aXRoIGFuIHVuZGVmaW5lZCAkc2V0IG9yICRzZXRPbkluc2VydCB2YWx1ZSwgaXQncyBhIHJlcXVpcmVkIGVycm9yLlxuICBpZiAob3BlcmF0b3IgPT09ICckc2V0JyB8fCBvcGVyYXRvciA9PT0gJyRzZXRPbkluc2VydCcpIHJldHVybiBTaW1wbGVTY2hlbWEuRXJyb3JUeXBlcy5SRVFVSVJFRDtcbn1cbiIsImltcG9ydCB7IFNpbXBsZVNjaGVtYSB9IGZyb20gJy4uLy4uL1NpbXBsZVNjaGVtYSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRvQXJyYXlDaGVja3MoZGVmLCBrZXlWYWx1ZSkge1xuICAvLyBJcyBpdCBhbiBhcnJheT9cbiAgaWYgKCFBcnJheS5pc0FycmF5KGtleVZhbHVlKSkge1xuICAgIHJldHVybiB7IHR5cGU6IFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLkVYUEVDVEVEX1RZUEUsIGRhdGFUeXBlOiAnQXJyYXknIH07XG4gIH1cblxuICAvLyBBcmUgdGhlcmUgZmV3ZXIgdGhhbiB0aGUgbWluaW11bSBudW1iZXIgb2YgaXRlbXMgaW4gdGhlIGFycmF5P1xuICBpZiAoZGVmLm1pbkNvdW50ICE9PSBudWxsICYmIGtleVZhbHVlLmxlbmd0aCA8IGRlZi5taW5Db3VudCkge1xuICAgIHJldHVybiB7IHR5cGU6IFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLk1JTl9DT1VOVCwgbWluQ291bnQ6IGRlZi5taW5Db3VudCB9O1xuICB9XG5cbiAgLy8gQXJlIHRoZXJlIG1vcmUgdGhhbiB0aGUgbWF4aW11bSBudW1iZXIgb2YgaXRlbXMgaW4gdGhlIGFycmF5P1xuICBpZiAoZGVmLm1heENvdW50ICE9PSBudWxsICYmIGtleVZhbHVlLmxlbmd0aCA+IGRlZi5tYXhDb3VudCkge1xuICAgIHJldHVybiB7IHR5cGU6IFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLk1BWF9DT1VOVCwgbWF4Q291bnQ6IGRlZi5tYXhDb3VudCB9O1xuICB9XG59XG4iLCJpbXBvcnQgeyBTaW1wbGVTY2hlbWEgfSBmcm9tICcuLi8uLi9TaW1wbGVTY2hlbWEnO1xuaW1wb3J0IHsgZGF0ZVRvRGF0ZVN0cmluZyB9IGZyb20gJy4uLy4uL3V0aWxpdHknO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkb0RhdGVDaGVja3MoZGVmLCBrZXlWYWx1ZSkge1xuICAvLyBJcyBpdCBhbiBpbnZhbGlkIGRhdGU/XG4gIGlmIChpc05hTihrZXlWYWx1ZS5nZXRUaW1lKCkpKSByZXR1cm4geyB0eXBlOiBTaW1wbGVTY2hlbWEuRXJyb3JUeXBlcy5CQURfREFURSB9O1xuXG4gIC8vIElzIGl0IGVhcmxpZXIgdGhhbiB0aGUgbWluaW11bSBkYXRlP1xuICBpZiAoZGVmLm1pbiAmJiB0eXBlb2YgZGVmLm1pbi5nZXRUaW1lID09PSAnZnVuY3Rpb24nICYmIGRlZi5taW4uZ2V0VGltZSgpID4ga2V5VmFsdWUuZ2V0VGltZSgpKSB7XG4gICAgcmV0dXJuIHsgdHlwZTogU2ltcGxlU2NoZW1hLkVycm9yVHlwZXMuTUlOX0RBVEUsIG1pbjogZGF0ZVRvRGF0ZVN0cmluZyhkZWYubWluKSB9O1xuICB9XG5cbiAgLy8gSXMgaXQgbGF0ZXIgdGhhbiB0aGUgbWF4aW11bSBkYXRlP1xuICBpZiAoZGVmLm1heCAmJiB0eXBlb2YgZGVmLm1heC5nZXRUaW1lID09PSAnZnVuY3Rpb24nICYmIGRlZi5tYXguZ2V0VGltZSgpIDwga2V5VmFsdWUuZ2V0VGltZSgpKSB7XG4gICAgcmV0dXJuIHsgdHlwZTogU2ltcGxlU2NoZW1hLkVycm9yVHlwZXMuTUFYX0RBVEUsIG1heDogZGF0ZVRvRGF0ZVN0cmluZyhkZWYubWF4KSB9O1xuICB9XG59XG4iLCJpbXBvcnQgeyBTaW1wbGVTY2hlbWEgfSBmcm9tICcuLi8uLi9TaW1wbGVTY2hlbWEnO1xuXG4vLyBQb2x5ZmlsbCB0byBzdXBwb3J0IElFMTFcbk51bWJlci5pc0ludGVnZXIgPSBOdW1iZXIuaXNJbnRlZ2VyIHx8IGZ1bmN0aW9uIGlzSW50ZWdlcih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSh2YWx1ZSkgJiYgTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZG9OdW1iZXJDaGVja3MoZGVmLCBrZXlWYWx1ZSwgb3AsIGV4cGVjdHNJbnRlZ2VyKSB7XG4gIC8vIElzIGl0IGEgdmFsaWQgbnVtYmVyP1xuICBpZiAodHlwZW9mIGtleVZhbHVlICE9PSAnbnVtYmVyJyB8fCBpc05hTihrZXlWYWx1ZSkpIHtcbiAgICByZXR1cm4geyB0eXBlOiBTaW1wbGVTY2hlbWEuRXJyb3JUeXBlcy5FWFBFQ1RFRF9UWVBFLCBkYXRhVHlwZTogZXhwZWN0c0ludGVnZXIgPyAnSW50ZWdlcicgOiAnTnVtYmVyJyB9O1xuICB9XG5cbiAgLy8gQXNzdW1pbmcgd2UgYXJlIG5vdCBpbmNyZW1lbnRpbmcsIGlzIHRoZSB2YWx1ZSBsZXNzIHRoYW4gdGhlIG1heGltdW0gdmFsdWU/XG4gIGlmIChvcCAhPT0gJyRpbmMnICYmIGRlZi5tYXggIT09IG51bGwgJiYgKGRlZi5leGNsdXNpdmVNYXggPyBkZWYubWF4IDw9IGtleVZhbHVlIDogZGVmLm1heCA8IGtleVZhbHVlKSkge1xuICAgIHJldHVybiB7IHR5cGU6IGRlZi5leGNsdXNpdmVNYXggPyBTaW1wbGVTY2hlbWEuRXJyb3JUeXBlcy5NQVhfTlVNQkVSX0VYQ0xVU0lWRSA6IFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLk1BWF9OVU1CRVIsIG1heDogZGVmLm1heCB9O1xuICB9XG5cbiAgLy8gQXNzdW1pbmcgd2UgYXJlIG5vdCBpbmNyZW1lbnRpbmcsIGlzIHRoZSB2YWx1ZSBtb3JlIHRoYW4gdGhlIG1pbmltdW0gdmFsdWU/XG4gIGlmIChvcCAhPT0gJyRpbmMnICYmIGRlZi5taW4gIT09IG51bGwgJiYgKGRlZi5leGNsdXNpdmVNaW4gPyBkZWYubWluID49IGtleVZhbHVlIDogZGVmLm1pbiA+IGtleVZhbHVlKSkge1xuICAgIHJldHVybiB7IHR5cGU6IGRlZi5leGNsdXNpdmVNaW4gPyBTaW1wbGVTY2hlbWEuRXJyb3JUeXBlcy5NSU5fTlVNQkVSX0VYQ0xVU0lWRSA6IFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLk1JTl9OVU1CRVIsIG1pbjogZGVmLm1pbiB9O1xuICB9XG5cbiAgLy8gSXMgaXQgYW4gaW50ZWdlciBpZiB3ZSBleHBlY3QgYW4gaW50ZWdlcj9cbiAgaWYgKGV4cGVjdHNJbnRlZ2VyICYmICFOdW1iZXIuaXNJbnRlZ2VyKGtleVZhbHVlKSkge1xuICAgIHJldHVybiB7IHR5cGU6IFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLk1VU1RfQkVfSU5URUdFUiB9O1xuICB9XG59XG4iLCJpbXBvcnQgeyBTaW1wbGVTY2hlbWEgfSBmcm9tICcuLi8uLi9TaW1wbGVTY2hlbWEnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkb1N0cmluZ0NoZWNrcyhkZWYsIGtleVZhbHVlKSB7XG4gIC8vIElzIGl0IGEgU3RyaW5nP1xuICBpZiAodHlwZW9mIGtleVZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7IHR5cGU6IFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLkVYUEVDVEVEX1RZUEUsIGRhdGFUeXBlOiAnU3RyaW5nJyB9O1xuICB9XG5cbiAgLy8gSXMgdGhlIHN0cmluZyB0b28gbG9uZz9cbiAgaWYgKGRlZi5tYXggIT09IG51bGwgJiYgZGVmLm1heCA8IGtleVZhbHVlLmxlbmd0aCkge1xuICAgIHJldHVybiB7IHR5cGU6IFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLk1BWF9TVFJJTkcsIG1heDogZGVmLm1heCB9O1xuICB9XG5cbiAgLy8gSXMgdGhlIHN0cmluZyB0b28gc2hvcnQ/XG4gIGlmIChkZWYubWluICE9PSBudWxsICYmIGRlZi5taW4gPiBrZXlWYWx1ZS5sZW5ndGgpIHtcbiAgICByZXR1cm4geyB0eXBlOiBTaW1wbGVTY2hlbWEuRXJyb3JUeXBlcy5NSU5fU1RSSU5HLCBtaW46IGRlZi5taW4gfTtcbiAgfVxuXG4gIC8vIERvZXMgdGhlIHN0cmluZyBtYXRjaCB0aGUgcmVndWxhciBleHByZXNzaW9uP1xuICBpZiAoXG4gICAgKGRlZi5za2lwUmVnRXhDaGVja0ZvckVtcHR5U3RyaW5ncyAhPT0gdHJ1ZSB8fCBrZXlWYWx1ZSAhPT0gJycpXG4gICAgJiYgZGVmLnJlZ0V4IGluc3RhbmNlb2YgUmVnRXhwICYmICFkZWYucmVnRXgudGVzdChrZXlWYWx1ZSlcbiAgKSB7XG4gICAgcmV0dXJuIHsgdHlwZTogU2ltcGxlU2NoZW1hLkVycm9yVHlwZXMuRkFJTEVEX1JFR1VMQVJfRVhQUkVTU0lPTiwgcmVnRXhwOiBkZWYucmVnRXgudG9TdHJpbmcoKSB9O1xuICB9XG5cbiAgLy8gSWYgcmVnRXggaXMgYW4gYXJyYXkgb2YgcmVndWxhciBleHByZXNzaW9ucywgZG9lcyB0aGUgc3RyaW5nIG1hdGNoIGFsbCBvZiB0aGVtP1xuICBpZiAoQXJyYXkuaXNBcnJheShkZWYucmVnRXgpKSB7XG4gICAgbGV0IHJlZ0V4RXJyb3I7XG4gICAgZGVmLnJlZ0V4LmV2ZXJ5KChyZSkgPT4ge1xuICAgICAgaWYgKCFyZS50ZXN0KGtleVZhbHVlKSkge1xuICAgICAgICByZWdFeEVycm9yID0geyB0eXBlOiBTaW1wbGVTY2hlbWEuRXJyb3JUeXBlcy5GQUlMRURfUkVHVUxBUl9FWFBSRVNTSU9OLCByZWdFeHA6IHJlLnRvU3RyaW5nKCkgfTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgaWYgKHJlZ0V4RXJyb3IpIHJldHVybiByZWdFeEVycm9yO1xuICB9XG59XG4iLCJpbXBvcnQgeyBTaW1wbGVTY2hlbWEgfSBmcm9tICcuLi8uLi9TaW1wbGVTY2hlbWEnO1xuaW1wb3J0IGRvRGF0ZUNoZWNrcyBmcm9tICcuL2RvRGF0ZUNoZWNrcyc7XG5pbXBvcnQgZG9OdW1iZXJDaGVja3MgZnJvbSAnLi9kb051bWJlckNoZWNrcyc7XG5pbXBvcnQgZG9TdHJpbmdDaGVja3MgZnJvbSAnLi9kb1N0cmluZ0NoZWNrcyc7XG5pbXBvcnQgZG9BcnJheUNoZWNrcyBmcm9tICcuL2RvQXJyYXlDaGVja3MnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0eXBlVmFsaWRhdG9yKCkge1xuICBpZiAoIXRoaXMudmFsdWVTaG91bGRCZUNoZWNrZWQpIHJldHVybjtcblxuICBjb25zdCBkZWYgPSB0aGlzLmRlZmluaXRpb247XG4gIGNvbnN0IGV4cGVjdGVkVHlwZSA9IGRlZi50eXBlO1xuICBjb25zdCBrZXlWYWx1ZSA9IHRoaXMudmFsdWU7XG4gIGNvbnN0IG9wID0gdGhpcy5vcGVyYXRvcjtcblxuICBpZiAoZXhwZWN0ZWRUeXBlID09PSBTdHJpbmcpIHJldHVybiBkb1N0cmluZ0NoZWNrcyhkZWYsIGtleVZhbHVlKTtcbiAgaWYgKGV4cGVjdGVkVHlwZSA9PT0gTnVtYmVyKSByZXR1cm4gZG9OdW1iZXJDaGVja3MoZGVmLCBrZXlWYWx1ZSwgb3AsIGZhbHNlKTtcbiAgaWYgKGV4cGVjdGVkVHlwZSA9PT0gU2ltcGxlU2NoZW1hLkludGVnZXIpIHJldHVybiBkb051bWJlckNoZWNrcyhkZWYsIGtleVZhbHVlLCBvcCwgdHJ1ZSk7XG5cbiAgaWYgKGV4cGVjdGVkVHlwZSA9PT0gQm9vbGVhbikge1xuICAgIC8vIElzIGl0IGEgYm9vbGVhbj9cbiAgICBpZiAodHlwZW9mIGtleVZhbHVlID09PSAnYm9vbGVhbicpIHJldHVybjtcbiAgICByZXR1cm4geyB0eXBlOiBTaW1wbGVTY2hlbWEuRXJyb3JUeXBlcy5FWFBFQ1RFRF9UWVBFLCBkYXRhVHlwZTogJ0Jvb2xlYW4nIH07XG4gIH1cblxuICBpZiAoZXhwZWN0ZWRUeXBlID09PSBPYmplY3QgfHwgU2ltcGxlU2NoZW1hLmlzU2ltcGxlU2NoZW1hKGV4cGVjdGVkVHlwZSkpIHtcbiAgICAvLyBJcyBpdCBhbiBvYmplY3Q/XG4gICAgaWYgKFxuICAgICAga2V5VmFsdWUgPT09IE9iamVjdChrZXlWYWx1ZSlcbiAgICAgICYmIHR5cGVvZiBrZXlWYWx1ZVtTeW1ib2wuaXRlcmF0b3JdICE9PSAnZnVuY3Rpb24nXG4gICAgICAmJiAhKGtleVZhbHVlIGluc3RhbmNlb2YgRGF0ZSlcbiAgICApIHJldHVybjtcbiAgICByZXR1cm4geyB0eXBlOiBTaW1wbGVTY2hlbWEuRXJyb3JUeXBlcy5FWFBFQ1RFRF9UWVBFLCBkYXRhVHlwZTogJ09iamVjdCcgfTtcbiAgfVxuXG4gIGlmIChleHBlY3RlZFR5cGUgPT09IEFycmF5KSByZXR1cm4gZG9BcnJheUNoZWNrcyhkZWYsIGtleVZhbHVlKTtcblxuICBpZiAoZXhwZWN0ZWRUeXBlIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAvLyBHZW5lcmljIGNvbnN0cnVjdG9yIGNoZWNrc1xuICAgIGlmICghKGtleVZhbHVlIGluc3RhbmNlb2YgZXhwZWN0ZWRUeXBlKSkge1xuICAgICAgLy8gaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9yZWZlcmVuY2Uvb3BlcmF0b3IvdXBkYXRlL2N1cnJlbnREYXRlL1xuICAgICAgY29uc3QgZGF0ZVR5cGVJc09rYXkgPSBleHBlY3RlZFR5cGUgPT09IERhdGVcbiAgICAgICAgJiYgb3AgPT09ICckY3VycmVudERhdGUnXG4gICAgICAgICYmIChrZXlWYWx1ZSA9PT0gdHJ1ZSB8fCBKU09OLnN0cmluZ2lmeShrZXlWYWx1ZSkgPT09ICd7XCIkdHlwZVwiOlwiZGF0ZVwifScpO1xuXG4gICAgICBpZiAoZXhwZWN0ZWRUeXBlICE9PSBEYXRlIHx8ICFkYXRlVHlwZUlzT2theSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6IFNpbXBsZVNjaGVtYS5FcnJvclR5cGVzLkVYUEVDVEVEX1RZUEUsXG4gICAgICAgICAgZGF0YVR5cGU6IGV4cGVjdGVkVHlwZS5uYW1lLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERhdGUgY2hlY2tzXG4gICAgaWYgKGV4cGVjdGVkVHlwZSA9PT0gRGF0ZSkge1xuICAgICAgLy8gaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9yZWZlcmVuY2Uvb3BlcmF0b3IvdXBkYXRlL2N1cnJlbnREYXRlL1xuICAgICAgaWYgKG9wID09PSAnJGN1cnJlbnREYXRlJykge1xuICAgICAgICByZXR1cm4gZG9EYXRlQ2hlY2tzKGRlZiwgbmV3IERhdGUoKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZG9EYXRlQ2hlY2tzKGRlZiwga2V5VmFsdWUpO1xuICAgIH1cbiAgfVxufVxuIl19
