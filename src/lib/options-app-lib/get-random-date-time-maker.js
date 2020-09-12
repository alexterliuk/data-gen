/**
 * Provider of makeRandomDateTime with bound context.
 *   @param {object} valueChecker
 *   @param {object} helper
 *   @param {object} optionsApp - options defined in app
 */
function getRandomDateTimeMaker(valueChecker, helper, optionsApp) {
  const _v = valueChecker;
  const _h = helper;
  const _o = optionsApp;

  return makeRandomDateTime;

  /**
   * option.data:
   *     {arrays with numbers} years, months, dates, hours, minutes, seconds
   * The function returns datetime string (YYYY-MM-DDThh:mm:ss),
   * which is completely random or random within specified vals inside option.data.
   */
  function makeRandomDateTime(option) {
    const o = option.data;
    const optYears = getValsThroughValidation(o.years, 'years');
    const optMonths = getValsThroughValidation(o.months, 'months');
    const optDates = getValsThroughValidation(o.dates, 'dates');
    const optHours = getValsThroughValidation(o.hours, 'hours');
    const optMinutes = getValsThroughValidation(o.minutes, 'minutes');
    const optSeconds = getValsThroughValidation(o.seconds, 'seconds');

    let leapYear, maxDateEnd, date = '', time = '', dt = {} /*datetime*/;

    // default - from 1900 to current year
    dt.year = optYears ? optYears[_h.getRandomFloor(0, optYears.length)]
      : _h.getRandomFloor(1900, (new Date).getFullYear() + 1);

    leapYear = !((2020 - dt.year) % 4);

    dt.month = optMonths ? optMonths[_h.getRandomFloor(0, optMonths.length)]
      : _h.getRandomFloor(1, 13);

    maxDateEnd = dt.month < 8 ? (dt.month % 2 ? 31 : 30)
      : dt.month % 2 ? 30 : 31;

    let day;
    if (optDates) {
      day = optDates[_h.getRandomFloor(0, optDates.length)];
      day = day === 29 && dt.month === 2 && !leapYear ? 28 : day;
    }

    dt.date = day || _h.getRandomFloor(1, dt.month === 2 ? (leapYear ? 30 : 29) : maxDateEnd + 1);

    dt.hours = optHours ? optHours[_h.getRandomFloor(0, optHours.length)]
      : _h.getRandomFloor(0, 24);

    dt.minutes = optMinutes ? optMinutes[_h.getRandomFloor(0, optMinutes.length)]
      : _h.getRandomFloor(0, 60);

    dt.seconds = optSeconds ? optSeconds[_h.getRandomFloor(0, optSeconds.length)]
      : _h.getRandomFloor(0, 60);

    // make date and time representation
    for (const num of [dt.year, dt.month, dt.date]) {
      date += num < 10 ? '-0' + num : '-' + num;
    }

    for (const num of [dt.hours, dt.minutes, dt.seconds]) {
      time += num < 10 ? ':0' + num : ':' + num;
    }

    //console.log('opts:', { optYears, optMonths, optDates, optHours, optMinutes, optSeconds });

    return date.slice(1) + 'T' + time.slice(1);


    /**
     * Check if vals are within range of real date and time.
     *   @param {array} vals
     *   @param {string} specName - e.g. 'hours'
     */
    function validate(vals, specName) {
      // if any val is not number or negative number (and thus 0 instead of val returned), fallback to default
      if (!vals.every(val => _v.getPositiveIntegerOrZero(val) === val)) return false;

      // datetime specification
      const specs = {
        years: { from: 0, to: 9999 }, // years added, so that no need to add years logic inside getValsThroughValidation
        months: { from: 1, to: 12 },
        dates: { from: 1, to: 31 },
        hours: { from: 0, to: 24 },
        minutes: { from: 0, to: 60 },
        seconds: { from: 0, to: 60 },
      };

      return vals.every(val => val >= specs[specName].from && val <= specs[specName].to);
    }

    /**
     * Check if cont is of proper type and not empty, and vals can represent real date and time.
     *   @param {array} cont
     *   @param {string} specName - e.g. 'months'
     */
    function getValsThroughValidation(cont, specName) {
      const informNotValidVals = _o.$notifyOn.randomDatetime_notValidVals;
      const container = _h.getNotEmptyContainer(cont, 'array');

      if (!cont || _v.isArray(cont) && !cont.length) return false;

      if (container && validate(container, specName)) {
        return container;

      } else {
        informNotValidVals(option, specName);
        return false;
      }
    }
  }
}

module.exports = getRandomDateTimeMaker;
