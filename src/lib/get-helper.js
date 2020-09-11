/**
 *   @param {object} valueChecker
 */
function getHelper(valueChecker) {
  const _v = valueChecker;

  // $h is alias for helper
  const $h = {
    notifStart: option => `[${option.name}, path - '${option.path}']: `,

    notifToDefault: () => ' Fallback to creating of default data.',

    optionallyCapitalize: (str, option) =>
      option.capitalizeAllLetters ? str.toUpperCase()
                                  : option.capitalizeFirstLetter === false ? str
                                  : `${(str[0] || '').toUpperCase()}${str.slice(1)}`,

    getRandomElementFromArray: (obj, key) => {
      if (!_v) {
        const msg = '[getRandomElementFromArray]: no valueChecker provided for this function job.';
        this.makeRed ? console.log(this.makeRed(msg)) : console.error(msg);
        return false;
      }

      const arr = _v.isArray(obj[key]) && obj[key];
      return arr && arr.length ? arr[$h.getRandomFloor(0, arr.length)] : false;
    },

    getRandomFloor: (start, end) => Math.floor($options.$getRandom.number(start, end)), // TODO: $options is not in scope

    /**
     * Check whether container is array or object and not empty.
     *   @param {array|object} cont - container to check
     *   @param {string} type - type the container expected to be of
     */
    getNotEmptyContainer: (cont, type) => {
      if (!_v) {
        const msg = '[getNotEmptyContainer]: no valueChecker provided for this function job.';
        this.makeRed ? console.log(this.makeRed(msg)) : console.error(msg);
        return false;
      }

      if (type === 'array') return _v.isArray(cont) && !!cont.length && cont;
      if (type === 'object') return _v.isObject(cont) && !!Object.keys(cont).length && cont;
    },

    /**
     * Make object from error's message.
     *   @param {Error} err
     * Message syntax: 'prop1>>Text\n prop2>>Text\n'.
     *   prop1, prop2 etc. can be any words (quantity are not limited)
     *   e.g.: `name>>DIFF\n msg>>Types of values are different.\n orig>>object\n new>>number`
     */
    parseError: err => {
      if (!err.message) return { info: 'Error has empty message and can\'t be parsed.' };
      const entries = err.message.split(/\n /);

      return entries.reduce((acc, curr) => {
        const entry = curr.split(/>>/);
        acc[entry[0]] = entry[1];

        return acc;
      }, {});
    },
  };

  return $h;
}

module.exports = getHelper;
