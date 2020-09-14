/**
 * Provider of testMakeRandomNumber with bound context.
 */
function getTestMakeRandomNumber() {
  const logBuiltIn = this.logBuiltIn;

  return testMakeRandomNumber;

  /**
   * Test makeRandomNumber of optionsApp.
   *   @param {object} count - { ofParamsCalls: <number> },
   *   @param {function} opt
   */
  function testMakeRandomNumber(count, opt) {
    // TODO: this console.log is colored in browser, but not in node
    console.log(
      '\n\n%c ============ TESTING OF optionsApp\'s makeRandomNumber ======================================================================================== \n' +
      '  This function creates random number within a specified range given in option.data.                                                             \n' +
      '  If min > max, it swaps them - takes min as max and max as min.                                                                                 \n' +
      '  It returns created number or 0 (in case if min or max is not number).                                                                          \n',
      'background:lightyellow'
    );
    const params = [];

    params[0] = { msg1: 'min - 0, max - 1.',
      call: { args: [{ someNumber: 0 }, '_currVal_'] },
      vals: [{ quantity: 30, byPath: [opt(getOption()).assign(false, 'min', 0, 'max', 1).obtain()] }] };

    params[1] = { msg1: 'min - 1, max - 1.',
      call: { args: [{ someNumber: 0 }, '_currVal_'] },
      vals: [{ quantity: 30, byPath: [opt(getOption()).assign(false, 'min', 1, 'max', 1).obtain()] }] };

    params[2] = { msg1: 'min - -17, max - 0.',
      call: { args: [{ someNumber: 0 }, '_currVal_'] },
      vals: [{ quantity: 30, byPath: [opt(getOption()).assign(false, 'min', -17, 'max', 0).obtain()] }] };

    params[3] = { msg1: 'min - 10, max - 0.',
      call: { args: [{ someNumber: 0 }, '_currVal_'] },
      vals: [{ quantity: 30, byPath: [opt(getOption()).assign(false, 'min', 10, 'max', 0).obtain()] }] };

    params[4] = { msg1: 'min - NaN, max - 1.',
      call: { args: [{ someNumber: 0 }, '_currVal_'] },
      vals: [{ quantity: 30, byPath: [opt(getOption()).assign(false, 'min', NaN, 'max', 1).obtain()] }] };

    params[5] = { msg1: 'min - undefined, max - Infinity.',
      call: { args: [{ someNumber: 0 }, '_currVal_'] },
      vals: [{ quantity: 30, byPath: [opt(getOption()).assign(false, 'min', undefined, 'max', Infinity).obtain()] }] };

    params[6] = { msg1: 'min - -1000, max - 1000, digitsAfterFloatingPoint - 3.',
      msg2: 'Some created numbers may have 2 or less digits after floating point. ' +
            'It happens when created number e.g. 50.0001, which cannot be shown as 50.000 - it\'s just 50. Same for 70.130 etc.',
      call: { args: [{ someNumber: 0 }, '_currVal_'] },
      vals: [{ quantity: 100, byPath: [opt(getOption()).assign(false, 'min', -1000, 'max', 1000, 'digitsAfterFloatingPoint', 3).obtain()] }] };


    return logBuiltIn(count, params, 'testMakeRandomNumber');

    function getOption() {
      return { type: 'number', name: 'makeRandomNumber', path: 'someNumber', data: {} };
    }
  }
}

module.exports = getTestMakeRandomNumber;
