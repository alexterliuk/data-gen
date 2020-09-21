/**
 * Library for DataGen to use in buildData (via createValues).
 *   @param {object} valueChecker
 *   @param {object} optionsApp - options defined in app
 */
function getDataCreators(valueChecker, optionsApp) {
  const _v = valueChecker;
  const _o = optionsApp;

  /**
   * For each new element invoke either createDataAccTo, or createDataOfType.
   *   @param {object} el
   *   @param {object} option
   *   @param {object} options
   *   @param {string} id
   *   @param {string} nextId
   *   @param {boolean} [currentLevel] - true or absent
   */
  function createValues(el, id, nextId, option, options, currentLevel) {
    // option must be applied only to the data of corresponding type
    const correspondingTypes = option && option.type === el.type;
    if (option && !correspondingTypes) {
      _o.notifyOn.notCorrespondingTypes(option, el.type);
    }

    const newData = [];
    if (currentLevel) {
      el.pathsToNewElements.forEach(newElem => {
        newElem[id] = option && correspondingTypes ? createDataAccTo(option, el.type, options)
                                                   : createDataOfType(el.type);
      });

    } else {
      el.pathsToNewElements.forEach(newElemWrapper => {
        newElemWrapper[id][nextId] = option && correspondingTypes ? createDataAccTo(option, el.type, options)
                                                                  : createDataOfType(el.type);
        newData.push(newElemWrapper[id]);
      });
    }

    return currentLevel ? el.pathsToNewElements : newData;
  }

  /**
   * Create default value of given type.
   *   @param {string} type
   */
  function createDataOfType(type) {
    const types = {
      'null': null,
      'array': [],
      'object': {},
      'regexp': new RegExp(),
      'number': 0,
      'NaN': NaN,
      'Infinity': Infinity,
      'boolean': true,
      'string': '',
      'undefined': undefined,
    };

    return types[type];
  }

  /**
   * Check option's contents consistency and trigger creation of value -
   * by calling either built-in function, or function given by user in options.lib.
   *   @param {object} option
   *   @param {object} options
   *   @param {string} type - type of new element under creation
   */
  function createDataAccTo(option, type, options) {
    if (!_v.isObject(option)) {
      _o.notifyOn.optionNotObject(option);
      return _o.applyDefaultOption(type);
    }

    if (!option.name) {
      _o.notifyOn.optionHasNoName(option);
      return _o.applyDefaultOption(type);
    }

    if (!_o[option.name] && !(options.lib || {})[option.name]) {
      _o.notifyOn.optionNotFound(option);
      return _o.applyDefaultOption(type);
    }

    const funcIn_o = _o[option.name];
    const funcInLib = options.lib && options.lib[option.name];

    if (funcIn_o && !option.data) {
      _o.notifyOn.optionNotComplete(option);
      return _o.applyDefaultOption(type);
    }

    if (funcInLib) {
      if (!options.lib || !_v.isObject(options.lib)) {
        _o.notifyOn.libNotFoundOrNotObject();
        return _o.applyDefaultOption(type);
      }

      if (!_v.isObject(funcInLib)) {
        _o.notifyOn.optionNotObject(funcInLib);
        return _o.applyDefaultOption(type);
      }

      if (!funcInLib.make || !funcInLib.data) {
        _o.notifyOn.libOptionNotComplete(option);
        return _o.applyDefaultOption(type);
      }
    }

    return funcIn_o ? funcIn_o(option, options)
          /* (1) */ : _v.isFunction(funcInLib.make) ? funcInLib.make(funcInLib.data)
          /* (2) */ : _v.isFunction(_o[funcInLib.make]) ? _o[funcInLib.make](funcInLib, options)
                    : (_o.notifyOn.optionNotFoundOrLibFuncNotFunc(option, funcInLib), _o.applyDefaultOption(type));

    /* (1) user can put a function to 'make' key of lib's option,
           and it'll be called with given data by 'data' key in that option */
    /* (2) user can put in 'make' key the name of a built-in function (e.g. 'randomName') */
  }

  return {
    createValues,
    createDataOfType,
    createDataAccTo,
  };
}

module.exports = getDataCreators;
