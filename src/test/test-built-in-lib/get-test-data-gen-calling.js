/**
 * Provider of testDataGenCalling with bound context.
 */
function getTestDataGenCalling() {
  const logBuiltIn = this.logBuiltIn;
  const test = this.test;

  return testDataGenCalling;

  /**
   * Test how DataGen's make and test methods handle being called with proper and improper arguments.
   *   @param {object} count - { ofParamsCalls: <number> },
   */
  function testDataGenCalling(count) {
    const params = [];
    const intro = 'TESTING OF DataGen CALLING WITH';
    const msg2 = 'It should log an error in all cases when srcData is not object or array.';

    params[0] = { msg1: `${intro} DIFFERENT srcData WITHOUT options`,
      msg2,
      callingWithInfo: 'CALLING WITH srcData:' };

    params[1] = { msg1: `${intro} DIFFERENT srcData WITHOUT options AND VIA CALLING test FUNCTION`,
      msg2,
      callingWithInfo: 'CALLING WITH srcData:',
      call: { by: test } };

    params[2] = { msg1: `${intro} DIFFERENT srcData AND WITH options TO BE { quantity: 3 }`,
      msg2,
      callingWithInfo: 'CALLING WITH srcData:',
      call: { args: ['_currVal_', { quantity: 3 }] } };

    params[3] = { msg1: `${intro} DIFFERENT srcData AND WITH options TO BE { quantity: 3 } AND VIA CALLING test FUNCTION`,
      msg2,
      callingWithInfo: 'CALLING WITH srcData:',
      call: { by: test, args: ['_currVal_', { quantity: 3 }] } };

    params[4] = { msg1: `${intro} srcData TO BE { x: \'y\'} AND WITH NOT VALID options`,
      msg2: 'It should return empty array. ' +
            'It should log no errors because analyzing and building triggered only if options.quantity > 0.',
      callingWithInfo: 'CALLING WITH OPTIONS:',
      call: { args: [{ x: 'y' }, '_currVal_'] } };

    return logBuiltIn(count, params, 'testDataGenCalling');
  }
}

module.exports = getTestDataGenCalling;
