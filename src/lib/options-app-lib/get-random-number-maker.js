/**
 * Provider of makeRandomNumber with bound context.
 *   @param {object} valueChecker
 *   @param {object} optionsApp - options defined in app
 */
function getRandomNumberMaker(valueChecker, optionsApp) {
  const _v = valueChecker;
  const _o = optionsApp;

  return makeRandomNumber;

  /**
   * option.data:
   *     {numbers} min, max, digitsAfterFloatingPoint
   */
  function makeRandomNumber(option) {
    const od = option.data;
    const opt = {
      min: _v.isNumber(od.min) && !_v.isInfinity(od.min) && !_v.isNaN(od.min) && od.min,
      max: _v.isNumber(od.max) && !_v.isInfinity(od.max) && !_v.isNaN(od.max) && od.max,
      digitsAfterFloatingPoint: _v.isNumber(od.digitsAfterFloatingPoint)
                            && !_v.isInfinity(od.digitsAfterFloatingPoint)
                            && !_v.isNaN(od.digitsAfterFloatingPoint)
                            && od.digitsAfterFloatingPoint,
    };

    if (opt.min || opt.max) {
      return +((_o.getRandomNumber(opt.min, opt.max)).toFixed(opt.digitsAfterFloatingPoint));
    }

    return 0;
  }
}

module.exports = getRandomNumberMaker;
