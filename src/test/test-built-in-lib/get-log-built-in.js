/**
 * Provider of logBuiltIn with bound context.
 *   @param {object} valueChecker
 */
function getLogBuiltIn(valueChecker) {
  const logErr = this.makeRed ? str => console.log(this.makeRed(str)) : console.error;
  const _v = valueChecker;

  return logBuiltIn;

  /**
   * Take params from testBuiltIn's lib's function and trigger iteration over these params with logging logic.
   *   @param {array} params - filled with objects
   *   @param {string} callerName
   *   @param {object} count - { ofParamsCalls: 0 }, used for logging ordinal number of each logic block tested
   * Each object inside params represents testing spec and must have - msg1, call.
   * Other props are optional (msg2, callingWithInfo, vals).
   *   e.g. {
   *          msg1: <string>,
   *          ?msg2: <string>,
   *          call: {
   *            by: <function>,
   *            args: <array> with args one of which is '_currVal_' - placeholder to be replaced by currVal inside makeCall
   *          },
   *          ?callingWithInfo: <string>,
   *          ?hookBeforeLoggingResult: <function> to call before logging result of logBuiltIn
   *          ?vals: <array>,
   *        }
   */
  function logBuiltIn(count, params, callerName) {
    const vals = [0, 1, 0n, 1n, NaN, Infinity, undefined, null, '', 'just string',
                  {}, [], [14, 16], true, false, /ff/, [/ff/, 10], {x: 'y', c: /ff/}];
    const dashes = '============';
    const head = {
      line: '_____________________________________',
      info: 'CALLING WITH:',
    };

    params.forEach((p, idx) => {
      count.ofParamsCalls += 1;

      if (!p.call) p.call = {};

      const paramArgs = p.call.hasOwnProperty('args');
      const placeholderIdx = (p.call.args || []).findIndex(arg => arg === '_currVal_');

      // TODO: this is browser compliant, not node compliant
      console.log('%c' + makeMessage(count.ofParamsCalls, p.msg1, p.msg2), 'background:lightyellow');

      if (paramArgs && placeholderIdx < 0) {
        logErr('[logBuiltIn]: No \'_currVal_\' placeholder in call.args',
                p.call.args,
               `of param by index ${idx} in ${callerName}. Param set has not been tested.`);

      } else {
        (p.vals || vals).forEach(val => {
          console.log(head.line);
          console.log(p.callingWithInfo || head.info, _v.isString(val) && !val.length ? '/*empty string*/' : val);

          // upd - updated paramArgs
          const upd = paramArgs ? p.call.args.slice(0, placeholderIdx)
                                             .concat(_v.isArray(val) ? [val] : val)
                                             .concat(p.call.args.slice(placeholderIdx + 1))
                                : [val];
                                                                        // param.call.args can have up to 5 arguments
          const result = _v.isObject(p.call) && _v.isFunction(p.call.by) ? p.call.by(upd[0], upd[1], upd[2], upd[3], upd[4])
                                                                         : makeData(upd[0], upd[1], upd[2], upd[3], upd[4]);
                                                                         // TODO: fix makeData

          p.hook && _v.isFunction(p.hook) ? p.hook(result) : console.log(result);
        });
      }
    });

    function makeMessage (num, str1, str2) {
      const message = `\n\n${num}) ${dashes} ${str1} ${dashes}`;
      return !str2 ? message : `${message}\n${num < 10 ? '   ' : '    '}${dashes} ${str2}`;
    }
  }
}

module.exports = getLogBuiltIn;
