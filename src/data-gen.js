const $v = require('./lib/value-checker');
const getNumberRandomizer = require('./lib/options-app-lib/get-number-randomizer');
const { makeRed } = require('./lib/color-makers');
const getLogger = require('./test/get-logger');
const getHelper = require('./lib/get-helper');
const composePath = require('./lib/compose-path');
const getDataCreators = require('./lib/get-data-creators');
const getOptionsApp = require('./lib/get-options-app');
const getDataAnalysisMaker = require('./core/get-data-analysis-maker');
const getDataBuilder = require('./core/get-data-builder');
const getMake = require('./core/get-make');
const getTest = require('./core/get-test');
const getTestBuiltIn = require('./core/get-test-built-in');

/**
 *
 */
const DataGen = (function() {
  const testingDataMode = {
    activated: false,
    opts: {
      maxSpaceLength: 30,      // space between columns                                           (browser & node)
      //showAllNewVals: false, // show all created values of current path inside array, or object (browser)
      //keepDataTypes: false,  // log data as their type representation, or as strings            (browser)
    },
  };

  const getRandomNumberInRange = bindCtx(getNumberRandomizer, {}, $v)();
  const $h = bindCtx(getHelper, { makeRed, getRandomNumberInRange }, $v)();
  const optionsApp = bindCtx(getOptionsApp, { makeRed }, $v, $h, bindCtx)();
  const $log = bindCtx(getLogger, { makeRed, composePath, testingDataMode }, $v, $h, optionsApp)();

  const { createValues } = getDataCreators($v, optionsApp); // when invoked in buildData,
                                                            // all createSmth funcs will have $v and optionsApp in scope
  // core modules
  const buildData = bindCtx(getDataBuilder, { makeRed, composePath, createValues }, $v, $log, optionsApp)();
  const makeDataAnalysis = bindCtx(getDataAnalysisMaker, { makeRed, buildData }, $v)();
  // core modules - public methods
  const make = bindCtx(getMake, { makeRed, makeDataAnalysis}, $v)();
  const test = bindCtx(getTest, { make, testingDataMode }, $v, optionsApp)();
  const testBuiltIn = bindCtx(getTestBuiltIn, { makeRed, make, test }, $v, $h, bindCtx)();

  return {
    make,
    test,
    testBuiltIn,
  };
})();

/**
 * Bind this and arguments to given function and return it.
 * @param {function} func - will get bound ctx
 * @param {object} thisArgsObj - entities to bind to this
 * @param {*} args - arguments to invoke with
 */
function bindCtx(func, thisArgsObj, ...args) {
  if (!$v.isFunction(func) || !$v.isObject(thisArgsObj)) {
    console.error(makeRed('[bindCtx]: func must be function, thisArgsObj must be object.'));
    return func;
  }

  return func.bind(thisArgsObj, ...args);
}

module.exports = DataGen;
