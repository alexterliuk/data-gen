/**
 * Provider of makeDataAnalysis with bound context.
 *   @param {object} valueChecker
 */
function getDataAnalysisMaker(valueChecker) {
  const logErr = this.makeRed ? str => console.log(this.makeRed(str)) : console.error;
  const _v = valueChecker;
  const buildData = this.buildData;

  return makeDataAnalysis;

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
        //sourceAnalysis = target;
        //console.log('sourceAnalysis[0] path data:', sourceAnalysis[0].composedPath, sourceAnalysis[0].pathSegments);
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
          if (_v.isObject(el)) describeObject(':root', el, target, currentLevel);
          if (_v.isArray(el)) describeArray(':root', el, target, currentLevel);

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
      if (!_v.isObject(srcObj)) { logErr('srcObj is not object.'); return; }

      const keys = Object.keys(srcObj);
      keys.forEach((key, idx) => {
        const type = _v.getType(srcObj[key]);

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
      if (!_v.isArray(srcArr)) { logErr('srcArr is not array.'); return; }

      srcArr.forEach((el, idx) => {
        const type = _v.getType(el);

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
// ------------------------------ end analyzing block
}

module.exports = getDataAnalysisMaker;
