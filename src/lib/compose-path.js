/**
 * Compose path from path segments.
 *   @param {array} pathSegments - collection with strings and/or numbers
 *   @param {object} optionsAppTesting
 */
function composePath(pathSegments, optionsAppTesting) {
  const make = {
    v1: (path, segment) => typeof segment === 'number' ? `[${segment}]` : !path.length ? `${segment}` : `.${segment}`,
    v2: (path, segment) => typeof segment === 'number' ? `['${segment}']` : !path.length ? `${segment}` : `.${segment}`,
    v3: (path, segment) => typeof segment === 'number' ? `["${segment}"]` : !path.length ? `${segment}` : `.${segment}`,
    v4: (path, segment) => `['${segment}']`,
    v5: (path, segment) => `["${segment}"]`,
  };

  const syntax = (optionsAppTesting || {}).pathSyntax;
  const syntaxType = !syntax ? 'v1'
                             : syntax.singleQuotes && syntax.squareBraced ? 'v4'
                             : syntax.singleQuotes ? 'v2'
                             : syntax.doubleQuotes && syntax.squareBraced ? 'v5'
                             : syntax.doubleQuotes ? 'v3'
                             : 'v1';

  return pathSegments.reduce((acc, segm) => acc += make[syntaxType](acc, segm), '');
}

module.exports = composePath;
