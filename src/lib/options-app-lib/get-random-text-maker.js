/**
 * Provider of makeRandomText with bound context.
 *   @param {object} valueChecker
 *   @param {object} helper
 *   @param {object} optionsApp - options defined in app
 */
function getRandomTextMaker(valueChecker, helper, optionsApp) {
  const _v = valueChecker;
  const _h = helper;
  const _o = optionsApp;

  return makeRandomText;

  /**
   * option.data:
   *     {string} textSample - from which to slice text randomly
   *     {numbers} minLength, maxLength
   *     {booleans} capitalizeFirstLetter, capitalizeAllLetters
   *     {boolean} startFromBeginning - whether a text should start from the beginning of textSample
   *     {array of strings} collection
   */
  function makeRandomText(option) {
                                    // if collection, take random text from it
    const elementFromCollection = _h.getRandomElementFromArray(option.data, 'collection');
    if (elementFromCollection) return elementFromCollection;

    const minLength = _v.isNumber(option.data.minLength)
                  && !_v.isInfinity(option.data.minLength)
                  && option.data.minLength >= 0
                  && option.data.minLength;

    const maxLength = _v.isNumber(option.data.maxLength)
                  && !_v.isInfinity(option.data.maxLength)
                  && option.data.maxLength >= 0
                  && option.data.maxLength;
    // minLength, maxLength now can be - false || positive integer || 0

    return makeText(option.data, minLength, maxLength, option);


    /**
     *
     */
    function makeText(data, minLength, maxLength, option) {
      if (_v.isBoolean(minLength) || _v.isBoolean(maxLength)) {
        _o.notifyOn.randomText_notValidMinOrMax(option);
        return '';
      }

      if (minLength > maxLength) {
        _o.notifyOn.randomText_minBiggerThanMax(option);
        return '';
      }

      if (minLength || maxLength) {
        let alph = data.alphabet || _o.alphabet;
        let ts = (_v.isString(data.textSample) && data.textSample) || _o.textSample;
        while (maxLength > ts.length) ts += ts;

        let maxStart = ts.length - maxLength;
        let start = data.startFromBeginning ? 0 : _h.getRandomFloor(0, maxStart);
        let maxEnd = start + maxLength;
        let end = minLength === maxLength ? maxEnd : _h.getRandomFloor(start + minLength, maxEnd + 1);
        //console.log('\n');
        //console.log('     starts, ends:', { tsLength: ts.length, maxStart, tsLengthMinusMaxStart: ts.length - maxStart, start, maxEnd, maxEndMinusStart: maxEnd - start, end, endMinusStart: end - start });

        let text = ts.slice(start, end);
        let origLength = text.length;
        text = text.trimStart();
        // if length changed, restore it
        while (text.length < origLength) {
          text = text.concat(alph[_h.getRandomFloor(0, alph.length)]);
        }

        if (!data.startFromBeginning) {
          // make text start from known char (which is present in alph), if it isn't
          let alphChar;
          const zeroChar = (text[0] || '').toLowerCase();
          for (const char of alph) {
            if (char === zeroChar) {
              alphChar = true;
              break;
            }
          }

          if (!alphChar) {
            let start = _h.getRandomFloor(0, alph.length);
            text = alph.slice(start, start + 1).concat(text.slice(1));
          }
        }

        //console.log(text.length, text);
        return _h.optionallyCapitalize(text, data);
      }

      return '';
    }
  }
}

module.exports = getRandomTextMaker;
