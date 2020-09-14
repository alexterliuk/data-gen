/**
 * Provider of make with bound context.
 *   @param {object} valueChecker
 */
function getMake(valueChecker) {
  const makeDataAnalysis = this.makeDataAnalysis;
  const makeRed = this.makeRed;
  const _v = valueChecker;

  return make;

  /**
   * Trigger of making data process (a user will call it).
   *   @param {object|array} srcData
   *   @param {object} optionsMake
   */
  function make(srcData, optionsMake) {
    const obj = _v.isObject(srcData);
    const arr = _v.isArray(srcData);

    if (!obj && !arr) {
      const msg = 'Source data must be object or array.';
      makeRed ? console.log(makeRed(msg)) : console.error(msg);
      return;
    }

    if (obj && !Object.keys(srcData).length) return {};

    if (arr && !srcData.length) return [];

    if (!(_v.isObject(optionsMake) && _v.getPositiveIntegerOrZero(optionsMake.quantity) > 0)) {
      return obj ? {} : arr ? [] : undefined;
    }

    return makeDataAnalysis(srcData, optionsMake);
  }
}

module.exports = getMake;
