/**
 * Provider of testHelper with bound context.
 *   @param {object} helper
 */
function getTestHelper(helper) {
  const logBuiltIn = this.logBuiltIn;
  const _h = helper;

  return testHelper;

  /**
   * Test some functions of the helper library.
   *   @param {object} count - { ofParamsCalls: <number> },
   */
  function testHelper(count) {
    const params = [];
    const msg1 = 'TESTING SOME FUNCTIONS OF HELPER - $h.';  // same alias (const $h) in get-helper.js
    const vals = [15, 31, {x: 'y'}, [44, null], 56, 'just string', false, function getDummy(){}, 99];

    params[0] = { msg1,
      msg2: 'Testing $h.getRandomElementFromArray.',
      call: { by: _h.getRandomElementFromArray, args: ['_currVal_', 'vals'] },
      vals: Array(30).fill({ vals }) };

    params[1] = { msg1,
      msg2: 'Testing $h.getRandomFloor. It first calls randomizing function from $options which returns floating number, and then rounds it down to the nearest integer.',
      call: { by: _h.getRandomFloor, args: [0, '_currVal_'] },
      vals: Array(10).fill(100) };

    params[2] = { msg1,
      msg2: 'Testing $h.getNotEmptyContainer with 2nd param (type) to be array. It should return <false> if empty container.',
      call: { by: _h.getNotEmptyContainer, args: ['_currVal_', 'array'] },
      vals: Array(5).fill([14, true]).concat(Array(5).fill([])) };

    params[3] = { msg1,
      msg2: 'Testing $h.getNotEmptyContainer with 2nd param (type) to be object. It should return <false> if empty container.',
      call: { by: _h.getNotEmptyContainer, args: ['_currVal_', 'object'] },
      vals: Array(5).fill({ x: 'y' }).concat(Array(5).fill({})) };

    return logBuiltIn(count, params, 'testHelper');
  }
}

module.exports = getTestHelper;
