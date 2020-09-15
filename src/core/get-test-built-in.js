const getLogBuiltIn = require('../test/test-built-in-lib/get-log-built-in');
const getTestDataGenCalling = require('../test/test-built-in-lib/get-test-data-gen-calling');
const getTestValueChecker = require('../test/test-built-in-lib/get-test-value-checker');
const getTestHelper = require('../test/test-built-in-lib/get-test-helper');
const getTestMakeRandomNumber = require('../test/test-built-in-lib/get-test-make-random-number');
const getTestMakeRandomName = require('../test/test-built-in-lib/get-test-make-random-name');
const getTestMakeRandomText = require('../test/test-built-in-lib/get-test-make-random-text');
const getTestMakeRandomDateTime = require('../test/test-built-in-lib/get-test-make-random-date-time');

/**
 * Provider of testBuiltIn (core public method) with bound context.
 *   @param {object} valueChecker
 *   @param {object} helper
 *   @param {function} bindCtx
 */
function getTestBuiltIn(valueChecker, helper, bindCtx) {
  const make = this.make;
  const test = this.test;
  const makeRed = this.makeRed;
  const _v = valueChecker;
  const _h = helper;

  const logBuiltIn = bindCtx(getLogBuiltIn, { makeRed, make }, _v)();

  const lib = {
    DataGenCalling: bindCtx(getTestDataGenCalling, { logBuiltIn, test })(),
    valueChecker: bindCtx(getTestValueChecker, { logBuiltIn }, _v)(),
    helper: bindCtx(getTestHelper, { logBuiltIn }, _h)(),
    makeRandomNumber: bindCtx(getTestMakeRandomNumber, { logBuiltIn })(),
    makeRandomName: bindCtx(getTestMakeRandomName, { logBuiltIn })(),
    makeRandomText: bindCtx(getTestMakeRandomText, { logBuiltIn })(),
    makeRandomDateTime: bindCtx(getTestMakeRandomDateTime, { logBuiltIn })(),
  };

  return testBuiltIn;

  /**
   * Log result of testing built-in logic.
   *   @param {string} entities - names of functions or procedures to test
   *                              if omitted, invoke all functions from lib one by one
   */
  function testBuiltIn(...entities) {
    // count how many params of testBuiltIn's lib's functions have been processed
    let count = { ofParamsCalls: 0 };
    console.log('\nTESTING SWITCHED ON. MODE: Testing built-in logic.\n\n');

    if (entities.length) {
      entities.forEach(entityName => {
        if (_v.isString(entityName) && _v.isFunction(lib[entityName])) {
          lib[entityName](count, opt);

        } else {
          console.warn('UNKNOWN ENTITY: ', entityName, '. TESTING OF IT IS NOT POSSIBLE.');
        }
      });

    } else {
      Object.keys(lib).forEach(entityName => { lib[entityName](count, opt); });
    }

    /**
     * Take option, wrap in library and expose modifying methods.
     *   @param {object} [option]
     */
    function opt(option) {
      const lib = {
        assign: function (optionDataKey, ...vals) { // optionDataKey is string or false
          let idx = 0;

          while (idx < vals.length) {
            if (optionDataKey) {
              if (!_v.isObject(this.option.data[optionDataKey])) {
                this.option.data[optionDataKey] = {};
              }

              this.option.data[optionDataKey][vals[idx]] = vals[idx + 1];

            } else {
              this.option.data[vals[idx]] = vals[idx + 1];
            }
            idx += 2;
          }

          return this;
        },

        delete: function (optionDataKey, ...keys) { // optionDataKey is string or false
          if (optionDataKey) {
            keys.length ? keys.forEach(key => delete this.option.data[optionDataKey][key])
                        : delete this.option.data[optionDataKey];

          } else { // if optionDataKey === false
            keys.forEach(key => delete this.option.data[key]);
          }

          return this;
        },

        obtain: function() { return this.option; },
      };

      lib.option = _v.isObject(option) && _v.isObject(option.data) ? option : { data: {} };

      return lib;
    }
  }
}

module.exports = getTestBuiltIn;
