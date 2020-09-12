/**
 * Provider of notifications with bound context.
 *   @param {object} valueChecker
 *   @param {object} helper
 */
function getNotifications(valueChecker, helper) {
  const _v = valueChecker;
  const _h = helper;

  return {
    optionNotObject: option => {
      console.error(`Option '${option}' must be object.` + _h.notifToDefault());
    },

    optionHasNoName: option => {
      console.error(`Option with path '${option.path}' has no name and can't be applied.` + _h.notifToDefault());
      // console.error(`Option with keys [${Object.keys(option).join(', ')}] has no name and can't be applied.` +
      //   _h.notifToDefault());
    },

    optionNotFound: option => {
      console.error(`Option '${option.name}' has not been found.` + _h.notifToDefault());
    },

    emptyOption: option => {
      console.error(`Nothing truthy specified inside option '${option.name}'.` + _h.notifToDefault());
    },

    notCorrespondingTypes: (option, elType) => {
      console.error(_h.notifStart(option) + `Attempt to apply option to incompatible type of data.\n` +
        `The option has type '${option.type}', but the data by the option's path is of type '${elType}'.`
        + _h.notifToDefault());
    },

    libNotFoundOrNotObject: () => {
      console.error(`Library has not been found in options or it is not object.\n` +
        `Make sure options have 'lib' key and its value is object.` + _h.notifToDefault());
    },

    libOptionNotComplete: option => {
      console.error(`Library option '${option.name}' does not have 'make' or/and 'data' properties.` +
        _h.notifToDefault());
    },

    optionNotComplete: option => {
      console.error(_h.notifStart(option) + `Option has no 'data' to work with and thus can't be applied.`
        + _h.notifToDefault());
    },

    optionNotFoundOrLibFuncNotFunc: (option, funcInLib) => {
      console.error(`Option '${option.name}' has not been found or\n` +
        `library function '${funcInLib.make}' is not function.` + _h.notifToDefault());
    },

    randomName_minBiggerThanMax: (option, key) => {
      const o = option.data[key];
      console.error(_h.notifStart(option) + `minLength ${o.minLength} is bigger than\n` +
        `maxLength ${o.maxLength} in option's key '${key}'.` + _h.notifToDefault());
    },

    randomText_notValidMinOrMax: option => {
      const vals = ['minLength', 'maxLength'].map(k =>
        _v.isArray(option.data[k]) ? 'array'
                                   : _v.isString(option.data[k]) ? 'string'
                                   : option.data[k]);

      console.error(_h.notifStart(option) + `minLength: ${vals[0]}, maxLength: ${vals[1]}.\n` +
        `Lengths must be positive finite numbers, or 0.` + _h.notifToDefault());
    },

    randomText_minBiggerThanMax: option => {
      const o = option.data;
      console.error(_h.notifStart(option) + `minLength ${o.minLength} is bigger than maxLength ${o.maxLength}.` +
        _h.notifToDefault());
    },

    randomDatetime_notValidVals: (option, type) => {
      console.error(_h.notifStart(option) + `Not valid values for '${type}'.\n` +
        `They should be numbers representing real '${type}'.`);
    },
  };
}

module.exports = getNotifications;
