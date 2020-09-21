/**
 * DataGen - data generator. Give data, get back N instances with values - default or randomized according to options.
 * https://github.com/alexterliuk/data-gen
 * This version does not include testBuiltIn functionality.
 * v1.0.1
 */
(function() {
  if (typeof window !== 'undefined' && !window.DataGen) {
    window.DataGen = DataGen();

    function DataGen() {
      const testingDataMode = {
        activated: false,
        opts: {
          maxSpaceLength: 30,    // space between columns
          showAllNewVals: false, // show all created values of current path inside array, or object
          keepDataTypes: false,  // log data as their type representation, or as strings
        },
      };

// ======== $v is alias for value checker =============================================================================
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
// ======== END $v ====================================================================================================

// ======== $h is alias for helper ====================================================================================
      const $h = {
        notifStart: option => `[${option.name}, path - '${option.path}']: `,

        notifToDefault: () => ' Fallback to creating of default data.',

        optionallyCapitalize: (str, option) =>
          option.capitalizeAllLetters ? str.toUpperCase()
                                      : option.capitalizeFirstLetter === false ? str
                                      : `${(str[0] || '').toUpperCase()}${str.slice(1)}`,

        getRandomElementFromArray: (obj, key) => {
          const arr = $v.isArray(obj[key]) && obj[key];
          return arr && arr.length ? arr[$h.getRandomFloor(0, arr.length)] : false;
        },

        getRandomFloor: (start, end) => Math.floor(getRandomNumberInRange(start, end)),

        /**
         * Check whether container is array or object and not empty.
         *   @param {array|object} cont - container to check
         *   @param {string} type - type the container expected to be of
         */
        getNotEmptyContainer: (cont, type) => {
          if (type === 'array') return $v.isArray(cont) && !!cont.length && cont;
          if (type === 'object') return $v.isObject(cont) && !!Object.keys(cont).length && cont;
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
// ======== END $h ====================================================================================================

// ======== $o is alias for options defined in app (also optionsApp alias is used ) ===================================
      const $o = {
        alphabet: 'abcdefghijklmnopqrstuvwxyz',
        textSample: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst. ',
        charSymbols: { string: '""', object: '{…}', array: '[,]' },
        pathSyntax: {},
        testing: {}, // takes in testing options (if any) from user options, used by $log lib
        temp: {},
        applyDefaultOption: type => createDataOfType(type),
      };

      $o.notifyOn = {
        optionNotObject: option => {
          console.error(`Option '${option}' must be object.` + $h.notifToDefault());
        },

        optionHasNoName: option => {
          console.error(`Option with path '${option.path}' has no name and can't be applied.` + $h.notifToDefault());
        },

        optionNotFound: option => {
          console.error(`Option '${option.name}' has not been found.` + $h.notifToDefault());
        },

        emptyOption: option => {
          console.error(`Nothing truthy specified inside option '${option.name}'.` + $h.notifToDefault());
        },

        notCorrespondingTypes: (option, elType) => {
          console.error($h.notifStart(option) + `Attempt to apply option to incompatible type of data.\n` +
            `The option has type '${option.type}', but the data by the option's path is of type '${elType}'.` +
            $h.notifToDefault());
        },

        libNotFoundOrNotObject: () => {
          console.error(`Library has not been found in options or it is not object.\n` +
            `Make sure options have 'lib' key and its value is object.` + $h.notifToDefault());
        },

        libOptionNotComplete: option => {
          console.error(`Library option '${option.name}' does not have 'make' or/and 'data' properties.` +
            $h.notifToDefault());
        },

        optionNotComplete: option => {
          console.error($h.notifStart(option) + `Option has no 'data' to work with and thus can't be applied.` +
            $h.notifToDefault());
        },

        optionNotFoundOrLibFuncNotFunc: (option, funcInLib) => {
          console.error(`Option '${option.name}' has not been found or\n` +
            `library function '${funcInLib.make}' is not function.` + $h.notifToDefault());
        },

        randomName_minBiggerThanMax: (option, key) => {
          const o = option.data[key];
          console.error($h.notifStart(option) + `minLength ${o.minLength} is bigger than\n` +
            `maxLength ${o.maxLength} in option's key '${key}'.` + $h.notifToDefault());
        },

        randomText_notValidMinOrMax: option => {
          const vals = ['minLength', 'maxLength'].map(k =>
            $v.isArray(option.data[k]) ? 'array'
                                       : $v.isString(option.data[k]) ? 'string'
                                       : option.data[k]);

          console.error($h.notifStart(option) + `minLength: ${vals[0]}, maxLength: ${vals[1]}.\n` +
            `Lengths must be positive finite numbers, or 0.` + $h.notifToDefault());
        },

        randomText_minBiggerThanMax: option => {
          const o = option.data;
          console.error($h.notifStart(option) + `minLength ${o.minLength} is bigger than maxLength ${o.maxLength}.` +
            $h.notifToDefault());
        },

        randomDatetime_notValidVals: (option, type) => {
          console.error($h.notifStart(option) + `Not valid values for '${type}'.\n` +
            `They should be numbers representing real '${type}'.`);
        },
      };

      $o.getRandomNumber = getRandomNumberInRange;
      /**
       * Creates a number within specified range.
       * Automatically defines which num is min, and which is max.
       *   @returns {number} - floating number from min to max (excluding min and max), or 0.
       */
      function getRandomNumberInRange(num1, num2) {
        if (!$v.isNumber(num1, num2)) return 0;

        let min = Math.min(num1, num2), max = min === num1 ? num2 : num1;
        let range = max - min;

        return min + (Math.random() * range);
      }

      // When any makeSmth gets called (later in app) it takes option as argument.
      //   option must have {strings} type, name, path
      //                    {object} data
      //   option.data contains specs for makeSmth to stick to when doing its job.

      $o.makeRandomNumber = makeRandomNumber;
      /**
       * option.data:
       *     {numbers} min, max, digitsAfterFloatingPoint
       */
      function makeRandomNumber(option) {
        const od = option.data;
        const opt = {
          min: $v.isNumber(od.min) && !$v.isInfinity(od.min) && !$v.isNaN(od.min) && od.min,
          max: $v.isNumber(od.max) && !$v.isInfinity(od.max) && !$v.isNaN(od.max) && od.max,
          digitsAfterFloatingPoint: $v.isNumber(od.digitsAfterFloatingPoint)
                                && !$v.isInfinity(od.digitsAfterFloatingPoint)
                                && !$v.isNaN(od.digitsAfterFloatingPoint)
                                && od.digitsAfterFloatingPoint,
        };

        if (opt.min || opt.max) {
          return +(($o.getRandomNumber(opt.min, opt.max)).toFixed(opt.digitsAfterFloatingPoint));
        }

        return 0;
      }

      $o.makeRandomText = makeRandomText;
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
        const elementFromCollection = $h.getRandomElementFromArray(option.data, 'collection');
        if (elementFromCollection) return elementFromCollection;

        const minLength = $v.isNumber(option.data.minLength)
                      && !$v.isInfinity(option.data.minLength)
                      && option.data.minLength >= 0
                      && option.data.minLength;

        const maxLength = $v.isNumber(option.data.maxLength)
                      && !$v.isInfinity(option.data.maxLength)
                      && option.data.maxLength >= 0
                      && option.data.maxLength;
        // minLength, maxLength now can be - false || positive integer || 0

        return makeText(option.data, minLength, maxLength, option);

        /**
         *
         */
        function makeText(data, minLength, maxLength, option) {
          if ($v.isBoolean(minLength) || $v.isBoolean(maxLength)) {
            $o.notifyOn.randomText_notValidMinOrMax(option);
            return '';
          }

          if (minLength > maxLength) {
            $o.notifyOn.randomText_minBiggerThanMax(option);
            return '';
          }

          if (minLength || maxLength) {
            let alph = data.alphabet || $o.alphabet;
            let ts = ($v.isString(data.textSample) && data.textSample) || $o.textSample;
            while (maxLength > ts.length) ts += ts;

            let maxStart = ts.length - maxLength;
            let start = data.startFromBeginning ? 0 : $h.getRandomFloor(0, maxStart);
            let maxEnd = start + maxLength;
            let end = minLength === maxLength ? maxEnd : $h.getRandomFloor(start + minLength, maxEnd + 1);

            let text = ts.slice(start, end);
            let origLength = text.length;
            text = text.trimStart();
            // if length changed, restore it
            while (text.length < origLength) {
              text = text.concat(alph[$h.getRandomFloor(0, alph.length)]);
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
                let start = $h.getRandomFloor(0, alph.length);
                text = alph.slice(start, start + 1).concat(text.slice(1));
              }
            }

            return $h.optionallyCapitalize(text, data);
          }

          return '';
        }
      }

      $o.makeRandomName = makeRandomName;
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
       *     - use alphabet specified for allNames || name1 etc., or from option.data, or optionsApp's alphabet
       *     - if minLength || maxLength - make names of random length within min-max range, make compoundName from names
       *       (qty of names inside compoundName is defined by namesInCompoundName (if allNames),
       *        or by counting name1, name2 etc. properties inside option.data)
       *     - apply capitalizing options if specified
       */
      function makeRandomName(option) {
        const alphabet = ($v.isString(option.data.alphabet) && option.data.alphabet) || $o.alphabet;
        const allNames = $v.isObject(option.data.allNames) && option.data.allNames;
        let compoundName = '';

        if (allNames) {
          const namesInCompoundName = $v.getPositiveIntegerOrZero(allNames.namesInCompoundName);
          const _alphabet = option.data.allNames.alphabet || alphabet;

          for (let i = 1; i <= namesInCompoundName; i++) {
            compoundName += makeName(allNames, 'allNames', _alphabet, option);
          }
        }

        if (!allNames) {
          Object.keys(option.data).forEach(key => {
            if (key.slice(0, 4) === 'name' && !$v.isNaN(Number(key.slice(4)))) {

              const _alphabet = option.data[key].alphabet || alphabet;
              compoundName += makeName(option.data[key], key, _alphabet, option);
            }
          });
        }

        return compoundName.trim();

        /**
         *
         */
        function makeName(data, key, alph, option) {
          // if collection, take random name from it
          const elementFromCollection = $h.getRandomElementFromArray(data, 'collection');
          if (elementFromCollection) return elementFromCollection + ' ';

          if (data.minLength || data.maxLength) {
            let oneName = '', minLength, maxLength;

            if (data.minLength > data.maxLength) {
              $o.notifyOn.randomName_minBiggerThanMax(option, key);
              return '';

            } else {
              // if one of lengths is not defined, make it +/- 15 chars compared to defined one
              if (typeof data.minLength === 'undefined') {
                maxLength = $v.getPositiveIntegerOrZero(data.maxLength);
                minLength = maxLength - 15 > 0 ? maxLength - 15 : 0;
              }

              if (typeof data.maxLength === 'undefined') {
                minLength = $v.getPositiveIntegerOrZero(data.minLength);
                maxLength = minLength + 15;
              }

              minLength = $v.isInfinity(minLength) ? 0 : (+minLength || $v.getPositiveIntegerOrZero(data.minLength));
              maxLength = $v.isInfinity(minLength) ? 0 : (+maxLength || $v.getPositiveIntegerOrZero(data.maxLength));

              // make lengths not exceed 100
              maxLength = maxLength > 100 ? 100 : maxLength;
              minLength = maxLength === 100 ? maxLength - 15 : minLength;

              let nameLength = $o.getRandomNumber(minLength, maxLength);
              nameLength = Math.floor(Math.random() * 100) % 2 ? Math.ceil(nameLength) : Math.floor(nameLength);

              for (let y = 0; y < nameLength; y++) {
                let start = $h.getRandomFloor(0, alph.length);
                let end = start + 1;
                oneName += alph.slice(start, end);
              }

              return $h.optionallyCapitalize(oneName, data) + ' ';
            }
          }

          return '';
        }
      }

      $o.makeRandomDateTime = makeRandomDateTime;
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
        dt.year = optYears ? optYears[$h.getRandomFloor(0, optYears.length)]
                           : $h.getRandomFloor(1900, (new Date).getFullYear() + 1);

        leapYear = !((2020 - dt.year) % 4);

        dt.month = optMonths ? optMonths[$h.getRandomFloor(0, optMonths.length)]
                             : $h.getRandomFloor(1, 13);

        maxDateEnd = dt.month < 8 ? (dt.month % 2 ? 31 : 30)
                                  : dt.month % 2 ? 30 : 31;

        let day;
        if (optDates) {
          day = optDates[$h.getRandomFloor(0, optDates.length)];
          day = day === 29 && dt.month === 2 && !leapYear ? 28 : day;
        }

        dt.date = day || $h.getRandomFloor(1, dt.month === 2 ? (leapYear ? 30 : 29) : maxDateEnd + 1);

        dt.hours = optHours ? optHours[$h.getRandomFloor(0, optHours.length)]
                            : $h.getRandomFloor(0, 24);

        dt.minutes = optMinutes ? optMinutes[$h.getRandomFloor(0, optMinutes.length)]
                                : $h.getRandomFloor(0, 60);

        dt.seconds = optSeconds ? optSeconds[$h.getRandomFloor(0, optSeconds.length)]
                                : $h.getRandomFloor(0, 60);

        // make date and time representation
        for (const num of [dt.year, dt.month, dt.date]) {
          date += num < 10 ? '-0' + num : '-' + num;
        }

        for (const num of [dt.hours, dt.minutes, dt.seconds]) {
          time += num < 10 ? ':0' + num : ':' + num;
        }

        return date.slice(1) + 'T' + time.slice(1);

        /**
         * Check if vals are within range of real date and time.
         *   @param {array} vals
         *   @param {string} specName - e.g. 'hours'
         */
        function validate(vals, specName) {
          // if any val is not number or negative number (and thus 0 instead of val returned), fallback to default
          if (!vals.every(val => $v.getPositiveIntegerOrZero(val) === val)) return false;

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
          const informNotValidVals = $o.notifyOn.randomDatetime_notValidVals;
          const container = $h.getNotEmptyContainer(cont, 'array');

          if (!cont || $v.isArray(cont) && !cont.length) return false;

          if (container && validate(container, specName)) {
            return container;

          } else {
            informNotValidVals(option, specName);
            return false;
          }
        }
      }
// ======== END $o ====================================================================================================

// ======== $log - library for testing (used only when DataGen.test is invoked) =======================================
      const $log = {
        /**
         * Make stringified val to have length not bigger than spaceLength.
         *   @param {number} spaceLength
         *   @param {*} val - any type
         *   @param {string} [prefix] - to be used in the beginning of shortened val
         */
        limitToLength: (spaceLength, val, prefix) => {
          let newVal = '' + val;
          let pref = $v.isString(prefix) ? prefix : '...';

          return newVal.length > spaceLength ? pref + newVal.slice(newVal.length - spaceLength + pref.length) : val;
        },

        /**
         * Imitate table view of logging line by adding empty string after each log cell.
         * This function returns string (contrary to composeAndLog which outputs any type | many types of data).
         *   @param {string} space - string padded by spaces to the length specified by user in options, or to default length
         *   @param {...*} data - any type
         */
        composeLogLine: (space, ...data) => {
          return data.reduce((acc, curr) => acc + curr + space.slice(0, space.length - ('' + curr).length), '').trimEnd();
        },

        /**
         * Make tabular line by adding blank string of calculated length after each log cell. Console.log the result.
         * This function keeps types of data while logging.
         * Long strings, objects and arrays are wrapped in array for neat tabular visual representation.
         *   @param {string} space - string padded by spaces to the length specified by user in options, or to default length
         *   @param {number} spaceLength - (space is bigger than spaceLength by one ' ')
         *   @param {...*} data - any type
         */
        composeAndLog: (space, spaceLength, ...data) => {
          const objInArrLength = 7;    // '[{…}]'                      5 + 2 (two is dropdown triangle)
          const arrInArrLength = 12;   // '[Array(1)]'                10 + 2
          const typeInArrLength = 26;  // '(2) ["string", Array(1)]'  20 + 2 + 4 (four is length identificator + following two spaces)
          const diffTypesLength = 24;  // '(2) ["DIFF", Array(1)]'    18 + 2 + 4

          let updatedSpace, count = -0.5;
          let dLastIdx = -1;
          const d = data.reduce((acc, curr) => { dLastIdx += 1; acc[`k${dLastIdx}`] = curr; return acc; }, {});

          const fill = () => {
            count += 0.5;

            let val, realIdx = !(count % 1);
            if (realIdx) {
              val = d[`k${count}`];

              if ($v.isObject(val)) {

                if ($v.isError(val)) {
                  updatedSpace = space.slice(2 + diffTypesLength); // start from 2 instead of 0 - exclude console's
                  val = ['DIFF', [$h.parseError(val)]];            // automatically added spaces between logged arguments
                } else {
                  updatedSpace = space.slice(2 + objInArrLength);
                  val = [val]; // wrap in array needed for neat table view of logging data
                }

              } else if ($v.isArray(val)) {
                updatedSpace = space.slice(2 + arrInArrLength + ('' + val.length).length - 1);
                val = [val];

              } else if ($v.isString(val) && !val.length) {
                updatedSpace = space.slice(2, spaceLength - $o.charSymbols.string.length/*2*/ + 1); // +1 for slicing until
                val = $o.charSymbols.string;                                                        // and including the last char

              } else if ($v.isString(val) && val.length > spaceLength && /*do not wrap path string in arr:*/ count !== dLastIdx) {
                updatedSpace = space.slice(2 + typeInArrLength);
                val = ['string', [val]];

              } else if ($v.isRegExp(val) && val.source.length > spaceLength) {
                updatedSpace = space.slice(2 + typeInArrLength);
                val = ['regexp', [val]]; let x = $o;

              } else {
                updatedSpace = space.slice(2, spaceLength - ('' + val).length + 1); // + 1 for slicing until and including the last char
              }

              return val;
            }

            return updatedSpace;
          };

          // empty string as first argument - hack to prevent logging data by "" style
          console.log('', fill(), fill(), fill(), fill(), fill(), fill(), fill(), fill(), fill());
        },

        /**
         * Value getter lib.
         */
        getVal: (() => {
          let paths = {};

          return {
            /**
             * Get value by given path and update paths object.
             *   @param {number} level
             *   @param {array} dataCollector - collection to get val from (or vals, if options.testing.showAllNewVals)
             *   @param {string|number} key
             *   @param {string} path
             *   @param {array} pathSegments
             */
            byPath: (level, dataCollector, key, path, pathSegments) => {
              const showAll = $o.testing.showAllNewVals;

              if (!level) {
                paths[path] = [dataCollector[0][key]];

                if (showAll) {
                  dataCollector.slice(1).forEach(el => {
                    paths[path].push(el[key]);
                  });
                }
                return paths[path][0];

              } else {
                const parentPath = composePath(pathSegments.slice(0, pathSegments.length - 1), $o);
                paths[path] = [paths[parentPath][0][key]];

                if (showAll) {
                  paths[parentPath].slice(1).forEach(el => {
                    paths[path].push(el[key]);
                  })
                }
                return paths[path][0];
              }
            },
            getPaths: () => paths,
            clearPaths: () => { paths = {}; },
          };
        })(),

        /**
         * Log in-between data of different stages of new data creation process.
         *   @param {object|array} data - entity to log
         *   @param {string} dataName - name of the entity
         *   @param {string} [msg] - message to log
         */
        testing: (data, dataName, msg) => {
          if (!testingDataMode.activated) return;

          const arrSymb = $o.charSymbols.array;
          const objSymb = $o.charSymbols.object;
          const strSymb = $o.charSymbols.string;
          const spaceLength = $v.getPositiveIntegerOrZero($o.testing.maxSpaceLength) || testingDataMode.opts.maxSpaceLength;
          const space = Array(spaceLength + 1).fill(' ').join(''); // space.length is +1 bigger, so that max space between columns
                                                                   // can be === spaceLength, otherwise max space is spaceLength - 1
          const columnsNames = $log.composeLogLine(space, 'KEY', 'VALUE ORIG', 'VALUE NEW', 'TYPE ORIG - NEW', 'PATH');
          const headerDash = '=====';
          const headerLongDash = (str => {
            let newStr = '';
            while (newStr.length < str.length * (spaceLength /*/ 1.5*/ /*/ 2*/)) newStr += str;
            return newStr;
          })(headerDash);

          // logging gear - you either log by console.log, or by invoking method of log - see line after 'const = log...' declaration
          const log = {
            elementsByLevel: 'Elements by level:',
            elementsByLevelAndId: 'Elements by level and id:',
            srcAnalysis: 'Data analysis complete:',

            elementsByCurrentLevel: () => {
              if ($o.testing.keepDataTypes && !$o.temp.elementsByCurrentLevel_NB1logged) {
                console.warn('NB: objects, arrays and long strings are wrapped in arrays for neat table view of logging data.');
                $o.temp.elementsByCurrentLevel_NB1logged = true;
              }
              console.log(`${headerDash} ELEMENTS BY LEVEL ${data.level} ${headerLongDash}`);
              console.log($o.testing.keepDataTypes ? ' ' + columnsNames : columnsNames);

              data.elementsByLevel[data.level].forEach(obj => {
                const key = obj.propertyName || obj.index;
                const val = obj.hasOwnProperty('propertyValue') ? obj.propertyValue : obj.indexValue;
                const newVal = $log.getVal.byPath(data.level, data.dataCollector, key, obj.composedPath, obj.pathSegments);
                const newType = $v.getType(newVal);
                let typeOrigNew = obj.type === newType ? `${obj.type} - ${newType}`
                  : Error(`name>>DIFF\n msg>>Types of values are different.\n orig>>${obj.type}\n new>>${newType}`);

                if ($o.testing.keepDataTypes) {
                  $log.composeAndLog(space, spaceLength, key, val, newVal, typeOrigNew, obj.composedPath);

                } else {
                  const typeStr = $v.isRegExp(val) ? 'regexp'
                                                   : obj.type === 'object' ? objSymb
                                                   : obj.type === 'array' ? arrSymb
                                                   : obj.type === 'string' && !val.length ? strSymb
                                                   : false;
                  const newTypeStr = $v.isRegExp(newVal) ? 'regexp'
                                                         : $v.isObject(newVal) ? objSymb
                                                         : $v.isArray(newVal) ? arrSymb
                                                         : $v.isString(newVal) && !newVal.length ? strSymb
                                                         : false;
                  const err = $v.isError(typeOrigNew);
                  if (err) {
                    const parsedError = $h.parseError(typeOrigNew);
                    typeOrigNew = `DIFF: ${parsedError.orig.slice(0, 3).toUpperCase()} - ${parsedError.new.slice(0, 3).toUpperCase()}`;
                  }

                  let composedLogLine = $log.composeLogLine(
                    space,
                    key,
                    typeStr || $log.limitToLength(spaceLength, val),
                    newTypeStr || $log.limitToLength(spaceLength, newVal),
                    typeOrigNew,
                    obj.composedPath
                  );

                  if (err) { // highlight in red
                    composedLogLine = composedLogLine.split(typeOrigNew);
                    composedLogLine = [composedLogLine[0], typeOrigNew, composedLogLine[1]].reduce((acc, curr) => acc + '%c' + curr, '');
                    console.log(composedLogLine, '', 'color:red', '');
                  } else {
                    console.log(composedLogLine);
                  }
                }

                if ($o.testing.showAllNewVals) {                // show on 3rd column
                  const startSpace = $log.composeLogLine(space, '', '', 'ALL').split('ALL')[0];
                  const info = {
                    path: obj.composedPath,
                    values: $log.getVal.getPaths()[obj.composedPath],
                  };
                  console.log($o.testing.keepDataTypes ? startSpace : startSpace.slice(1), ['ALL NEW VALS', info]);
                }
              });
            },

            dataCollector: data => { console.log(`Created ${data.length} instances of new data.`); },
          };

          $v.isFunction(log[dataName]) ? log[dataName](data) : console.log(log[dataName], data);

          if (msg) console.log(msg);
        }, // end of testing

        /**
         * Clear state when current call is complete.
         */
        clearState: () => {
          if (!testingDataMode.activated) return;
          testingDataMode.activated = false;
          $o.testing = {};
          $log.getVal.clearPaths();
        },
      };
// ======== END $log ==================================================================================================

// ======== data creators - library to use in buildData ===============================================================
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
          $o.notifyOn.notCorrespondingTypes(option, el.type);
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
        if (!$v.isObject(option)) {
          $o.notifyOn.optionNotObject(option);
          return $o.applyDefaultOption(type);
        }

        if (!option.name) {
          $o.notifyOn.optionHasNoName(option);
          return $o.applyDefaultOption(type);
        }

        if (!$o[option.name] && !(options.lib || {})[option.name]) {
          $o.notifyOn.optionNotFound(option);
          return $o.applyDefaultOption(type);
        }

        const funcIn$o = $o[option.name];
        const funcInLib = options.lib && options.lib[option.name];

        if (funcIn$o && !option.data) {
          $o.notifyOn.optionNotComplete(option);
          return $o.applyDefaultOption(type);
        }

        if (funcInLib) {
          if (!options.lib || !$v.isObject(options.lib)) {
            $o.notifyOn.libNotFoundOrNotObject();
            return $o.applyDefaultOption(type);
          }

          if (!$v.isObject(funcInLib)) {
            $o.notifyOn.optionNotObject(funcInLib);
            return $o.applyDefaultOption(type);
          }

          if (!funcInLib.make || !funcInLib.data) {
            $o.notifyOn.libOptionNotComplete(option);
            return $o.applyDefaultOption(type);
          }
        }

        return funcIn$o ? funcIn$o(option, options)
              /* (1) */ : $v.isFunction(funcInLib.make) ? funcInLib.make(funcInLib.data)
              /* (2) */ : $v.isFunction($o[funcInLib.make]) ? $o[funcInLib.make](funcInLib, options)
                        : ($o.notifyOn.optionNotFoundOrLibFuncNotFunc(option, funcInLib), $o.applyDefaultOption(type));

        /* (1) user can put a function to 'make' key of lib's option,
               and it'll be called with given data by 'data' key in that option */
        /* (2) user can put in 'make' key the name of a built-in function (e.g. 'randomName') */
      }
// ======== END data creators =========================================================================================

      /**
       * Compose path from path segments.
       *   @param {array} pathSegments - collection with strings and/or numbers
       *   @param {object} optionsApp - to take pathSyntax from
       */
      function composePath(pathSegments, optionsApp) {
        const make = {
          v1: (path, segment) => typeof segment === 'number' ? `[${segment}]` : !path.length ? `${segment}` : `.${segment}`,
          v2: (path, segment) => typeof segment === 'number' ? `['${segment}']` : !path.length ? `${segment}` : `.${segment}`,
          v3: (path, segment) => typeof segment === 'number' ? `["${segment}"]` : !path.length ? `${segment}` : `.${segment}`,
          v4: (path, segment) => `['${segment}']`,
          v5: (path, segment) => `["${segment}"]`,
        };

        const syntax = (optionsApp || {}).pathSyntax;
        const syntaxType = !syntax ? 'v1'
                                   : syntax.singleQuotes && syntax.squareBraced ? 'v4'
                                   : syntax.singleQuotes ? 'v2'
                                   : syntax.doubleQuotes && syntax.squareBraced ? 'v5'
                                   : syntax.doubleQuotes ? 'v3'
                                   : 'v1';

        return pathSegments.reduce((acc, segm) => acc += make[syntaxType](acc, segm), '');
      }

// ======== data analysis =============================================================================================
      /**
       * Check incoming data and invoke analysis process.
       *   @param {object|array} src
       *   @param {object} optionsMake - options passed to DataGen.make
       */
      function makeDataAnalysis(src, optionsMake) {
        const target = []; // will collect data analysis
        let currentLevel = 0;
        let nextLevelExist = true;
        let numberOfCalls = 0;

        return startAnalysis(target, src);

// ------------------------------ iteration block:
        /**
         *   @param {array} target
         *   @param {array|object} [src]
         */
        function startAnalysis(target, src) {
          // prevent infinite loop if parent is nested inside its child
          if (nextLevelExist && ++numberOfCalls <= 100) {
            return analyzeOneLevel(target, src);
          } else {
            return buildData(target, optionsMake); // startAnalysis - analyzeOneLevel loop complete, start building new data
          }
        }

        /**
         *   @param {array} target
         *   @param {array|object} src
         */
        function analyzeOneLevel(target, src) {
          const currentLevelTarget = triggerDescribing(target, src).filter(obj => obj.level === currentLevel);
          currentLevel += 1;

          // if at previous iteration no data has been made, then currentLevelTarget is empty what makes exit from loop
          if (currentLevelTarget.length) {
            nextLevelExist = true;
            return startAnalysis(target, currentLevelTarget);
          } else {
            nextLevelExist = false;
            return startAnalysis(target);
          }
        }
// ------------------------------ end iteration block

// ------------------------------ analyzing block:
        /**
         * The solver of what describe function to call.
         *   @param {array} target
         *   @param {array|object} src
         */
        function triggerDescribing(target, src) {
          // if currentLevel is 0, wrap src in array;
          // if > 0, src is already array with data from describe[Object/Array]
          const data = !currentLevel ? [src] : [].concat(src);

          data.forEach(el => {
            if (currentLevel === 0) {
              if ($v.isObject(el)) describeObject(':root', el, target, currentLevel);
              if ($v.isArray(el)) describeArray(':root', el, target, currentLevel);

            } else {
              const parent = el.propertyName || el.index;
              const callData = el.propertyValue || el.indexValue;
              if (el.type === 'object') describeObject(parent, callData, target, currentLevel);
              if (el.type === 'array') describeArray(parent, callData, target, currentLevel);
            }
          });

          return target;
        }

        /**
         *   @param {string|number} parentId - number in case if parent is array
         *   @param {object} srcObj
         *   @param {array} target
         *   @param {number} level
         */
        function describeObject(parentId, srcObj, target, level) {
          if (!$v.isObject(srcObj)) { console.error('srcObj is not object.'); return; }

          const keys = Object.keys(srcObj);
          keys.forEach((key, idx) => {
            const type = $v.getType(srcObj[key]);

            target.push({
              parentId,
              propertyName: key,
              propertyValue: srcObj[key],
              type,
              level,
            });
          });

          return target;
        }

        /**
         * @param {string|number} parentId - number in case if parent is array
         * @param {array} srcArr
         * @param {array} target
         * @param {number} level
         */
        function describeArray(parentId, srcArr, target, level) {
          if (!$v.isArray(srcArr)) { console.error('srcArr is not array.'); return; }

          srcArr.forEach((el, idx) => {
            const type = $v.getType(el);

            target.push({
              parentId,
              index: idx,
              indexValue: el,
              type,
              level,
            });
          });

          return target;
        }
      }
// ======== END data analysis =========================================================================================

// ======== building data =============================================================================================
      /**
       * Data builder.
       *   @param {array} srcAnalysis - comprises objects with analysis
       *   @param {object} optionsMake - options passed to DataGen.make (alias - optsMake)
       */
      function buildData(srcAnalysis, optionsMake) {
        $log.testing(srcAnalysis, 'srcAnalysis');

        let optsMake = optionsMake;
        if (!optsMake || !$v.isObject(optsMake) || !Object.keys(optsMake).length) {
          optsMake = { quantity: 0, byPath: [] };
        }

        // add pathSyntax settings given by user
        if ($v.isObject(optsMake.pathSyntax)) {
          Object.entries(optsMake.pathSyntax).forEach(entry => {
            $o.pathSyntax[entry[0]] = entry[1];
          });
        }

        let byPathOptions = optsMake && $v.isArray(optsMake.byPath) ? optsMake.byPath.slice() : [];
        byPathOptions.forEach((opt, idx) => { opt.index = idx; });

        if (!srcAnalysis.length) {
          console.error('Source analysis is empty array. No data to build from.');
          return;
        }

        const elementsByLevel = {};
        const elementsByLevelAndId = {}; // elements of one level with same parentId
        const lastLevel = (srcAnalysis[srcAnalysis.length - 1] || {}).level;
        let level = lastLevel;

        while (level > -1) {
          elementsByLevel[level] = srcAnalysis.filter(el => el.level === level);
          level--;
        }

        // start from level 1 and build elementsByLevelAndId
        level = 1;
        while (level <= lastLevel) {
          const children = elementsByLevelAndId[`level${level}`] = {};

          elementsByLevel[level].forEach(el => {
            if (!children[el.parentId]) { // TODO: place this edge case outside forEach
              children[el.parentId] = [];
            }
            children[el.parentId].push(el);
          });

          level++;
        }

        // ternary to prevent crash on e.g. optsMake.quantity = -4
        let dataCollector = [...Array(optsMake.quantity >= 0 ? optsMake.quantity : 0)]
                             .map(el => {
                               el = srcAnalysis[0].propertyName ? {} : [];
                               return el;
                             });

        level = 0;
        // To each element of level 0 add path to the element under construction.
        // New paths at each next level will derive from the previous level.
        elementsByLevel[level].forEach(el => {
          el.pathsToNewElements = dataCollector;
          el.pathSegments = [el.propertyName || el.index];
          el.composedPath = composePath(el.pathSegments, $o);
        });

        $log.testing(elementsByLevel, 'elementsByLevel');
        $log.testing(elementsByLevelAndId, 'elementsByLevelAndId');

// ------------------------------ main while loop
        while (level <= lastLevel) {

          elementsByLevel[level].forEach(el => {
            const id = el.propertyName || el.index;
            const val = el.hasOwnProperty('propertyValue') ? el.propertyValue : el.indexValue;
            const nextLevel = elementsByLevelAndId['level' + (level + 1)];

            if (el.type === 'object' || el.type === 'array') {
              const updatedDataCollector = [];

              el.pathsToNewElements.forEach(newElem => {
                const newElemWrapper = {};
                newElem[id] = el.type === 'object' ? {} : [];
                newElemWrapper[id] = newElem[id];
                updatedDataCollector.push(newElemWrapper);
              });

              if (nextLevel) {

                (elementsByLevelAndId['level' + (level + 1)][id] || []).forEach(nextLevelEl => {
                  const nextId = nextLevelEl.propertyName || nextLevelEl.index;
                  const nextVal = el.type === 'object' ? nextLevelEl.propertyValue : nextLevelEl.indexValue;

                  // handling NaN case (NaN === NaN is false, thus they can't be successfully compared in expression before ||)
                  if (
                    val.hasOwnProperty(nextId) && val[nextId] === nextVal
                    || $v.isNumber(val[nextId]) && $v.isNumber(nextVal) && $v.isNaN(val[nextId]) === $v.isNaN(nextVal)
                  ) {
                    // creating qty of data acc. to optsMake.quantity:
                    nextLevelEl.pathsToNewElements = updatedDataCollector;
                    nextLevelEl.pathSegments = el.pathSegments.concat(nextId);
                    nextLevelEl.composedPath = composePath(nextLevelEl.pathSegments, $o);

                    (byPathOptMake => {
                      nextLevelEl.pathsToNewElements = createValues(nextLevelEl, id, nextId, byPathOptMake, optsMake);
                    })
                    (byPathOptions.find(opt => opt.path === nextLevelEl.composedPath.slice(-opt.path.length)));
                  }
                });
              }
            }

            if (
              (!level && !Object.keys(elementsByLevelAndId).length)
              || !level && el.type !== 'object'&& el.type !== 'array'
            ) {
              (byPathOptMake => {
                el.pathsToNewElements = createValues(el, id, null, byPathOptMake, optsMake, true);
              })(byPathOptions.find(opt =>
                opt.path === el.composedPath.slice(-(opt.path || '').length)
                || opt.path === ':root.' + el.composedPath.slice(-(opt.path || '').length)));
              // argument modified (in line above), so that opt.path can be
              // e.g. ':root.userAge' - for property 'userAge' at level 0;
              // if no such logic and you want to apply opt only for level 0 property,
              // opt.path is 'userAge' and it also matches 'userAge' properties on other levels,
              // and thus opt is applied on other levels too
            }
          });

          $log.testing({ elementsByLevel, level, dataCollector }, 'elementsByCurrentLevel');

          level += 1;
        }
// ------------------------------ end main while loop

        $log.testing(dataCollector, 'dataCollector');
        $log.clearState();

        return dataCollector;
      }
// ======== END building data =========================================================================================

// ======== public methods ============================================================================================
      /**
       * Trigger of making data process (a user will call it).
       *   @param {object|array} srcData
       *   @param {object} optionsMake
       */
      function make(srcData, optionsMake) {
        const obj = $v.isObject(srcData);
        const arr = $v.isArray(srcData);

        if (!obj && !arr) {
          const msg = 'Source data must be object or array.';
          console.error(msg);
          return [];
        }

        if (obj && !Object.keys(srcData).length) return [];

        if (arr && !srcData.length) return [];

        if (!($v.isObject(optionsMake) && $v.getPositiveIntegerOrZero(optionsMake.quantity) > 0)) {
          return [];
        }

        return makeDataAnalysis(srcData, optionsMake);
      }

      /**
       * Switch on testing mode and invoke make. This will log steps of building data process while make is doing its job.
       *   @param {object|array} srcData
       *   @param {object} optionsMake - data from optionsMake.testing will be passed to optionsApp.testing
       */
      function test(srcData, optionsMake) {
        const optsMake = optionsMake;
        const testingOptsNames = Object.keys(testingDataMode.opts).reduce((acc, n) => { acc[n] = true; return acc; }, {});

        if ($v.isObject(optsMake) && $v.getPositiveIntegerOrZero(optsMake.quantity) > 0) {
          testingDataMode.activated = $v.isObject(srcData) || $v.isArray(srcData);

          if (testingDataMode.activated) {
            console.log('\nTESTING SWITCHED ON. MODE: Testing given data.');

            if ($v.isObject(optsMake.testing)) {
              Object.keys(optsMake.testing).forEach(name => {

                if (testingOptsNames[name]) {
                  $o.testing[name] = optsMake.testing[name];
                }
              });
            }
          }
        }

        return make(srcData, optsMake);
      }
// ======== END public methods ============================================================================================

      return {
        make,
        test,
      };
    } // end of DataGen
  }
})();
