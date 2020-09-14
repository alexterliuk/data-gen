/**
 * Provider of testValueChecker with bound context.
 *   @param {object} valueChecker
 */
function getTestValueChecker(valueChecker) {
  const logBuiltIn = this.logBuiltIn;
  const _v = valueChecker;

  return testValueChecker;

  /**
   * Test some functions of the value checker library.
   *   @param {object} count - { ofParamsCalls: <number> },
   */
  function testValueChecker(count) {
    const params = [];
    const msg1 = 'TESTING SOME FUNCTIONS OF VALUE CHECKER - $v.'; // same alias (const $v) in value-checker.js

    params[0] = { msg1,
      msg2: 'Testing $v.isObject. It should return <false> if value is null, array, regexp or any other type.',
      call: { by: _v.isObject } };

    params[1] = { msg1,
      msg2: 'Testing $v.isRegExp.',
      call: { by: _v.isRegExp } };

    params[2] = { msg1,
      msg2: 'Testing $v.isError.',
      call: { by: _v.isError },
      vals: [null, {}, [], undefined, Error(), Error('some text'), 'just string'] };

    params[3] = { msg1,
      msg2: 'Testing $v.isInfinity.',
      call: { by: _v.isInfinity },
      vals: [undefined, NaN, 0, 1, true, false, Infinity, 1.2355, -7.2565, 1n, 0n] };

    params[4] = { msg1,
      msg2: 'Testing $v.getType.',
      call: { by: _v.getType } };

    params[5] = { msg1,
      msg2: 'Testing $v.getPositiveIntegerOrZero.',
      call: { by: _v.getPositiveIntegerOrZero } };

    return logBuiltIn(count, params, 'testValueChecker');
  }
}

module.exports = getTestValueChecker;
