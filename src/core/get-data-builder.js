/**
 * Provider of buildData with bound context.
 *   @param {object} valueChecker
 *   @param {object} logger
 *   @param {object} optionsApp - options defined in app
 */
function getDataBuilder(valueChecker, logger, optionsApp) {
  const logErr = this.makeRed ? str => console.log(this.makeRed(str)) : console.error;
  const _v = valueChecker;
  const _log = logger;
  const _o = optionsApp;
  const composePath = this.composePath;
  const createValues = this.createValues;

  if (!_v || !_log || !_o || !composePath || !createValues) {
    let msg = '[getDataBuilder]: valueChecker, logger, optionsApp, composePath, createValues needed for this function job.';
    logErr(msg); // if this line removed, Error is not red
    throw new Error(this.makeRed ? this.makeRed(msg) : msg);
  }

  return buildData;

  /**
   * Data builder.
   *   @param {array} srcAnalysis - comprises objects with analysis
   *   @param {object} optionsMake - options passed to DataGen.make (alias - optsMake)
   */
  function buildData(srcAnalysis, optionsMake) {
    _log.testing(srcAnalysis, 'srcAnalysis');

    let optsMake = optionsMake;
    if (!optsMake || !_v.isObject(optsMake) || !Object.keys(optsMake).length) {
      optsMake = { quantity: 0, byPath: [] };
    }

    let byPathOptions = optsMake && _v.isArray(optsMake.byPath) ? optsMake.byPath.slice() : [];
    byPathOptions.forEach((opt, idx) => { opt.index = idx; });

    if (!srcAnalysis.length) {
      logErr('Source analysis is empty array. No data to build from.');
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
      el.composedPath = composePath(el.pathSegments, _o);
    });

    _log.testing(elementsByLevel, 'elementsByLevel');
    _log.testing(elementsByLevelAndId, 'elementsByLevelAndId');

// ------------------------------ main while loop
    while (level <= lastLevel) {

      elementsByLevel[level].forEach(el => {
        const id = el.propertyName || el.index;
        const val = el.hasOwnProperty('propertyValue') ? el.propertyValue : el.indexValue;
        const nextLevel = elementsByLevelAndId['level' + (level + 1)];

        // Object.keys added, so that no crash on makeTestData({ uuu: [] }), or makeTestData({ uuu: {} })
        if ((el.type === 'object' || el.type === 'array') && Object.keys(elementsByLevelAndId).length) {
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
              nextLevelEl.pathSegments = [];

              // handling NaN case (NaN === NaN is false, thus they can't be successfully compared in expression before ||)
              if (
                     val.hasOwnProperty(nextId) && val[nextId] === nextVal
                  || _v.isNumber(val[nextId]) && _v.isNumber(nextVal) && _v.isNaN(val[nextId]) === _v.isNaN(nextVal)
              ) {
                // creating qty of data acc. to optsMake.quantity:
                nextLevelEl.pathsToNewElements = updatedDataCollector;
                nextLevelEl.pathSegments = el.pathSegments.concat(nextId);
                nextLevelEl.composedPath = composePath(nextLevelEl.pathSegments, _o);

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

      _log.testing({ elementsByLevel, level, dataCollector }, 'elementsByCurrentLevel');
      //console.log('dataCollector[0]:', dataCollector[0]);

      level += 1;
    }
// ------------------------------ end main while loop

    _log.testing(dataCollector, 'dataCollector');
    _log.clearState();

    return dataCollector;
  }
}

module.exports = getDataBuilder;
