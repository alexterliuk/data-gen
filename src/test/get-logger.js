/**
 * Library for testing (used only when DataGen.test is invoked).
 *   @param {object} valueChecker
 *   @param {object} helper
 *   @param {object} optionsApp - options defined in app
 */
function getLogger(valueChecker, helper, optionsApp) {
  const _v = valueChecker;
  const _h = helper;
  const _o = optionsApp;

  if (!_v || !_h || !_o) {
    const msg = '[getLogger]: valueChecker, helper, optionsApp arguments are required when calling getLogger.';
    this.makeRed ? console.log(this.makeRed(msg)) : console.error(msg);
    return {};
  }

  const $log = {
    /**
     * Make stringified val to have length not bigger than spaceLength.
     *   @param {number} spaceLength
     *   @param {*} val - any type
     *   @param {string} [prefix] - to be used in the beginning of shortened val
     */
    limitToLength: (spaceLength, val, prefix) => {
      let newVal = '' + val;
      let pref = _v.isString(prefix) ? prefix : '...';

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
     * This function keeps types of data while logging. Long strings, objects and arrays are wrapped in array for neat tabular visual representation.
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

          if (_v.isObject(val)) {

            if (_v.isError(val)) {
              updatedSpace = space.slice(2 + diffTypesLength); // start from 2 instead of 0 - exclude console's automatically added spaces between logged arguments
              val = ['DIFF', [_h.parseError(val)]];
            } else {
              updatedSpace = space.slice(2 + objInArrLength);
              val = [val]; // wrap in array needed for neat table view of logging data
            }

          } else if (_v.isArray(val)) {
            updatedSpace = space.slice(2 + arrInArrLength + ('' + val.length).length - 1);
            val = [val];

          } else if (_v.isString(val) && !val.length) {
            updatedSpace = space.slice(2, spaceLength - _o.charSymbols.string.length/*2*/ + 1); // +1 for slicing until and including the last char
            val = _o.charSymbols.string;

          } else if (_v.isString(val) && val.length > spaceLength && /*do not wrap path string in arr:*/ count !== dLastIdx) {
            updatedSpace = space.slice(2 + typeInArrLength);
            val = ['string', [val]];

          } else if (_v.isRegExp(val) && val.source.length > spaceLength) {
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
          const showAll = _o.testing.showAllNewVals;

          if (!level) {
            paths[path] = [dataCollector[0][key]];

            if (showAll) {
              dataCollector.slice(1).forEach(el => {
                paths[path].push(el[key]);
              });
            }
            return paths[path][0];

          } else {
            const parentPath = this.composePath(pathSegments.slice(0, pathSegments.length - 1), _o);
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
     *   @param {string} msg - message to log
     */
    testing: (data, dataName, msg) => {
      if (!this.testingDataMode.activated) return;

      const arrSymb = _o.charSymbols.array;
      const objSymb = _o.charSymbols.object;
      const strSymb = _o.charSymbols.string;
      const spaceLength = _v.getPositiveIntegerOrZero(_o.testing.maxSpaceLength) || 30;
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
          console.log('_o.testing:', _o.testing);
          if (_o.testing.keepDataTypes && !_o.temp.elementsByCurrentLevel_NB1logged) {
            console.warn('NB: objects, arrays and long strings are wrapped in arrays for neat table view of logging data.');
            _o.temp.elementsByCurrentLevel_NB1logged = true;
          }
          console.log(`${headerDash} ELEMENTS BY LEVEL ${data.level} ${headerLongDash}`);
          console.log(_o.testing.keepDataTypes ? ' ' + columnsNames : columnsNames);

          data.elementsByLevel[data.level].forEach(obj => {
            const key = obj.propertyName || obj.index;
            const val = obj.hasOwnProperty('propertyValue') ? obj.propertyValue : obj.indexValue;
            const newVal = $log.getVal.byPath(data.level, data.dataCollector, key, obj.composedPath, obj.pathSegments);
            const newType = _v.getType(newVal);
            let typeOrigNew = obj.type === newType ? `${obj.type} - ${newType}`
                                                   : Error(`name>>DIFF\n msg>>Types of values are different.\n orig>>${obj.type}\n new>>${newType}`);

            if (_o.testing.keepDataTypes) {
              $log.composeAndLog(space, spaceLength, key, val, newVal, typeOrigNew, obj.composedPath);

            } else {
              const typeStr = _v.isRegExp(val) ? 'regexp'
                                               : obj.type === 'object' ? objSymb
                                               : obj.type === 'array' ? arrSymb
                                               : obj.type === 'string' && !val.length ? strSymb
                                               : false;
              const newTypeStr = _v.isRegExp(newVal) ? 'regexp'
                                                     : _v.isObject(newVal) ? objSymb
                                                     : _v.isArray(newVal) ? arrSymb
                                                     : _v.isString(newVal) && !newVal.length ? strSymb
                                                     : false;
              const err = _v.isError(typeOrigNew);
              if (err) {
                const parsedError = _h.parseError(typeOrigNew);
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
                composedLogLine = [composedLogLine[0], typeOrigNew, composedLogLine[1]].reduce((acc, curr) => acc + '%c' + curr, ''); // TODO: this is browser compliant, not node compliant
                console.log(composedLogLine, '', 'color:red', '');
              } else {
                console.log(composedLogLine);
              }
            }

            if (_o.testing.showAllNewVals) {                // show on 3rd column
              const startSpace = $log.composeLogLine(space, '', '', 'ALL').split('ALL')[0];
              const info = {
                path: obj.composedPath,
                values: $log.getVal.getPaths()[obj.composedPath],
              };
              console.log(_o.testing.keepDataTypes ? startSpace : startSpace.slice(1), ['ALL NEW VALS', info]);
            }
          });
        },

        dataCollector: data => { console.log(`Created ${data.length} instances of new data.`); /*console.log('sourceData:', sourceData);*/},
      };

      _v.isFunction(log[dataName]) ? log[dataName](data) : console.log(log[dataName], data);

      if (msg) console.log(msg);
    }, // end of testing

    /**
     * Clear state when current call is complete.
     */
    clearState: () => {
      if (!this.testingDataMode.activated) return;
      this.testingDataMode.activated = false;
      $log.getVal.clearPaths();
    },
  }; // end of $log

  return $log;
}

module.exports = getLogger;
