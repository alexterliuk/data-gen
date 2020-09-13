const getNumberRandomizer = require('./options-app-lib/get-number-randomizer');
const getRandomNumberMaker = require('./options-app-lib/get-random-number-maker');
const getRandomTextMaker = require('./options-app-lib/get-random-text-maker');
const getRandomNameMaker = require('./options-app-lib/get-random-name-maker');
const getRandomDateTimeMaker = require('./options-app-lib/get-random-date-time-maker');
const getNotifications = require('./options-app-lib/get-notifications');
const { createDataOfType } = require('./get-data-creators');

/**
 * Provider of options used for creating data. Alias in app - optionsApp.
 *   @param {object} valueChecker
 *   @param {object} helper
 *   @param {function} bindCtx
 */
function getOptionsApp(valueChecker, helper, bindCtx) {
  const _v = valueChecker;
  const _h = helper;
  const _o = {};

  _o.getRandomNumber = bindCtx(getNumberRandomizer, {}, _v)();

  // When any makeSmth gets called (later in app) it takes option as argument.
  //   option must have {strings} type, name, path
  //                    {object} data
  //   option.data contains specs for makeSmth to stick to when doing its job.
  _o.makeRandomNumber = bindCtx(getRandomNumberMaker, {}, _v, _o)();
  _o.makeRandomText = bindCtx(getRandomTextMaker, {}, _v, _h, _o)();
  _o.makeRandomName = bindCtx(getRandomNameMaker, {}, _v, _h, _o)();
  _o.makeRandomDateTime = bindCtx(getRandomDateTimeMaker, {}, _v, _h, _o)();

  _o.notifyOn = bindCtx(getNotifications, { makeRed: this.makeRed }, _v, _h )();
  _o.applyDefaultOption = type => createDataOfType(type);

  _o.alphabet = 'abcdefghijklmnopqrstuvwxyz';
  _o.textSample = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst. ';
  _o.charSymbols = {
    string: '""',
    object: '{…}',
    array: '[,]',
  };

  _o.temp = {};

  return _o;
}

module.exports = getOptionsApp;
