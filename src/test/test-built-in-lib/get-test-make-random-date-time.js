/**
 * Provider of testMakeRandomDateTime with bound context.
 */
function getTestMakeRandomDateTime() {
  const logBuiltIn = this.logBuiltIn;

  return testMakeRandomDateTime;

  /**
   * Test makeRandomDateTime of optionsApp.
   *   @param {object} count - { ofParamsCalls: <number> },
   *   @param {function} opt
   */
  function testMakeRandomDateTime(count, opt) {
    // TODO: this console.log is colored in browser, but not in node
    console.log(
      '\n\n%c ============ TESTING OF optionsApp\'s makeRandomDateTime ====================================================================================== \n' +
      '  This function creates datetime string (YYYY-MM-DDThh:mm:ss).                                                                                   \n' +
      '  It is completely random or its segments (year, month etc.) are randomly selected from specified vals inside option.data.                       \n' +
      '  Desired values for years, months, dates, hours, minutes, seconds can be defined in arrays with the same name.                                  \n' +
      '  For instance, if option.data.months === [2, 9], datetime string will have month either February, or September.                                 ',
      'background:lightyellow'
    );
    const params = [];

    const vals = {
      years:   [ [], [2016], [1983, 2017], [0],    [1000], [null]     ],
      months:  [ [], [2],    [2, 5, 11],   [-2],   [14],   [true]     ],
      dates:   [ [], [10],   [7, 27, 29],  [-3],   [35],   [false]    ],
      hours:   [ [], [23],   [],           [-4],   [27],   [{}]       ],
      minutes: [ [], [58],   [],           [-0],   [69],   ['1']      ],
      seconds: [ [], [59],   [],           [-2],   [74],   [Infinity] ],
    };

    for (let i = 0; i < vals.years.length; i++) {
      params[i] = {
        msg1: 'option.data:',
        msg2: `years: [${vals.years[i]}], ` +
              `months: [${vals.months[i]}], ` +
              `dates: [${vals.dates[i]}], ` +
              `hours: [${vals.hours[i]}], ` +
              `minutes: [${vals.minutes[i]}], ` +
              `seconds: [${vals.seconds[i]}]`,
        call: { args: [{ date: '' }, '_currVal_'] },
        vals: [{
          quantity: 5,
          byPath: [
            opt(getOption()).assign(false,
                                    'years', vals.years[i],
                                    'months', vals.months[i],
                                    'dates', vals.dates[i],
                                    'hours', vals.hours[i],
                                    'minutes', vals.minutes[i],
                                    'seconds', vals.seconds[i])
                            .obtain()
          ],
        }],
      };
    }

    params[params.length] = {
      msg1: 'If option.data has no values, datetime is created by default rules. ' +
            'If e.g. option.data.months === undefined, default rules for a month are applied.',
      msg2: 'Default rules: use any valid value for month, date, hour, minute, second; ' +
            'for a year use range - from 1900 to current year.',
      call: { args: [{ date: '' }, '_currVal_'] },
      vals: [{
        quantity: 5,
        byPath: [
          opt(getOption()).assign(false,
                                  'years', undefined,
                                  'months', null,
                                  'dates', '',
                                  'hours', true,
                                  'minutes', /ff/,
                                  'seconds', {})
                          .obtain()
        ],
      }],
    };

    params[params.length] = {
      msg1: 'Create 100 different datetime strings.',
      msg2: 'years: [1951, 1990, 2015], ' +
            'months: [2, 3, 11], ' +
            'dates: [8, 9, 29], ' +
            'hours: [0, 19, 23], ' +
            'minutes: [36, 39, 59], ' +
            'seconds: [0, 58, 59]',
      call: { args: [{ date: '' }, '_currVal_'] },
      vals: [{
        quantity: 100,
        byPath: [
          opt(getOption()).assign(false,
                                  'years', [1951, 1990, 2015],
                                  'months', [2, 3, 11],
                                  'dates', [8, 9, 29],
                                  'hours', [0, 19, 23],
                                  'minutes', [36, 39, 59],
                                  'seconds', [0, 58, 59])
                          .obtain()
        ],
      }],
    };


    return logBuiltIn(count, params, 'testMakeRandomDateTime');

    function getOption() {
      return { type: 'string', name: 'makeRandomDateTime', path: 'date', data: {} };
    }
  }
}

module.exports = getTestMakeRandomDateTime;
