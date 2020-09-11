// collection of helper functions to check values

const $v = {
  isNull: val => val === null,

  isArray: val => Array.isArray(val),

  isObject: val => typeof val === 'object'
                   && !$v.isNull(val)
                   && !$v.isArray(val)
                   && !$v.isRegExp(val),

  isRegExp: val => typeof val !== 'undefined'
                   && !$v.isNull(val)
                   && val.constructor.name === 'RegExp',

  isError: val => $v.isObject(val)
                  && val.constructor.name === 'Error',

  isString: (...vals) => vals.every(val => typeof val === 'string'),

  isNumber: (...vals) => vals.every(val => typeof val === 'number'),

  isNaN: val => Number.isNaN(val),

  isInfinity: val => typeof val === 'number'
                     && !$v.isNaN(val) ? !Number.isFinite(val) : false,

  isBoolean: val => typeof val === 'boolean',

  isFunction: val => typeof val === 'function',

  getType: val => $v.isNull(val) ? 'null'
                                 : $v.isArray(val) ? 'array'
                                 : $v.isNaN(val) ? 'NaN'
                                 : $v.isInfinity(val) ? 'Infinity'
                                 : $v.isRegExp(val) ? 'regexp'
                                 : typeof val,

  getPositiveIntegerOrZero: val => $v.isNumber(val)
                                   && !$v.isNaN(val)
                                   && Number.isFinite(val)
                                   && val >= 0 ? Math.floor(val) : 0,
};

module.exports = $v;
