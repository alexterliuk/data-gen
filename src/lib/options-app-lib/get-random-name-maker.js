/**
 * Provider of makeRandomName with bound context.
 *   @param {object} valueChecker
 *   @param {object} helper
 *   @param {object} optionsApp - options defined in app
 */
function getRandomNameMaker(valueChecker, helper, optionsApp) {
  const _v = valueChecker;
  const _h = helper;
  const _o = optionsApp;

  return makeRandomName;

  /**
   * option.data:
   *     alphabet - {string} from which to slice characters randomly
   *     allNames - {strings} minLength, maxLength, namesInCompoundName
   *              - {booleans} capitalizeFirstLetter, capitalizeAllLetters
   *              - {array of strings} collection
   *     name1, name2 etc. - have the same params as in allNames, except namesInCompoundName which is absent.
   * If option.data.allNames, function works only with allNames contents - name1, name2 etc. are not checked.
   * If no allNames, function looks for name1, name2 etc. properties and works with them.
   * Steps inside allNames || name1 etc.:
   *     - if collection - make compoundName from names inside collection
   *     - if minLength || maxLength - make names of random length within min-max range, make compoundName from names
   *       (qty of names inside compoundName is defined by namesInCompoundName (if allNames),
   *        or by counting name1, name2 etc. properties inside option.data)
   *     - apply capitalizing options if specified
   */
  function makeRandomName(option) {
    console.log('makeRandomName is called\n_v:', _v);
    const alphabet = (_v.isString(option.data.alphabet) && option.data.alphabet) || _o.alphabet;
    const allNames = _v.isObject(option.data.allNames) && option.data.allNames;
    let compoundName = '';

    if (allNames) {
      const namesInCompoundName = _v.getPositiveIntegerOrZero(allNames.namesInCompoundName);

      for (let i = 1; i <= namesInCompoundName; i++) {
        compoundName += makeName(allNames, 'allNames', alphabet, option);
      }
    }

    if (!allNames) {
      Object.keys(option.data).forEach(key => {
        if (key.slice(0, 4) === 'name' && !_v.isNaN(Number(key.slice(4)))) {
          compoundName += makeName(option.data[key], key, alphabet, option);
        }
      });
    }

    //let cName = compoundName.split(' ');
    //console.log('10-14:', [cName[0].length, cName[0]], '7-13', [cName[1].length, cName[1]], 'max30', [cName[2].length, cName[2]]);
    return compoundName.trim();


    /**
     *
     */
    function makeName(data, key, alph, option) {
      // if collection, take random name from it
      const elementFromCollection = _h.getRandomElementFromArray(data, 'collection');
      if (elementFromCollection) return elementFromCollection + ' ';

      if (data.minLength || data.maxLength) {
        let oneName = '', minLength, maxLength;

        if (data.minLength > data.maxLength) {
          _o.$notifyOn.randomName_minBiggerThanMax(option, key);
          return '';

        } else {
          // if one of lengths is not defined, make it +/- 15 chars compared to defined one
          if (typeof data.minLength === 'undefined') {
            maxLength = _v.getPositiveIntegerOrZero(data.maxLength);
            minLength = maxLength - 15 > 0 ? maxLength - 15 : 0;
          }

          if (typeof data.maxLength === 'undefined') {
            minLength = _v.getPositiveIntegerOrZero(data.minLength);
            maxLength = minLength + 15;
          }

          minLength = _v.isInfinity(minLength) ? 0 : (+minLength || _v.getPositiveIntegerOrZero(data.minLength));
          maxLength = _v.isInfinity(minLength) ? 0 : (+maxLength || _v.getPositiveIntegerOrZero(data.maxLength));

          // make lengths not exceed 100
          maxLength = maxLength > 100 ? 100 : maxLength;
          minLength = maxLength === 100 ? maxLength - 15 : minLength;

          let nameLength = _o.$getRandom.number(minLength, maxLength);
          nameLength = Math.floor(Math.random() * 100) % 2 ? Math.ceil(nameLength) : Math.floor(nameLength);

          for (let y = 0; y < nameLength; y++) {
            let start = _h.getRandomFloor(0, alph.length);
            let end = start + 1;
            oneName += alph.slice(start, end);
          }

          return _h.optionallyCapitalize(oneName, data) + ' ';
        }
      }

      return '';
    }
  }
}

module.exports = getRandomNameMaker;
