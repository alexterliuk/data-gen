/**
 * Provider of test (core public method) with bound context.
 *   @param {object} valueChecker
 *   @param {object} optionsApp - options defined in app
 */
function getTest(valueChecker, optionsApp) {
  const make = this.make;
  const testingDataMode = this.testingDataMode;
  const testingOptsNames = Object.keys(testingDataMode.opts).reduce((acc, n) => { acc[n] = true; return acc; }, {});
  const _v = valueChecker;
  const _o = optionsApp;

  return test;

  /**
   * Switch on testing mode and invoke make. This will log steps of building data process while make is doing its job.
   *   @param {object|array} srcData
   *   @param {object} optionsMake - data from optionsMake.testing will be passed to optionsApp.testing
   */
  function test(srcData, optionsMake) {
    const optsMake = optionsMake;

    if (_v.isObject(optsMake) && _v.getPositiveIntegerOrZero(optsMake.quantity) > 0) {
      testingDataMode.activated = _v.isObject(srcData) || _v.isArray(srcData);

      if (testingDataMode.activated) {
        console.log('\nTESTING SWITCHED ON. MODE: Testing given data.');

        if (_v.isObject(optsMake.testing)) {
          Object.keys(optsMake.testing).forEach(name => {

            if (testingOptsNames[name]) {
              _o.testing[name] = optsMake.testing[name];
            }
          });
        }
      }
    }

    return make(srcData, optsMake);
  }
}

module.exports = getTest;
