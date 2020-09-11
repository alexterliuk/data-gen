const getSymbol = code => `\u001b[${code}m`;

const codes = {
  red: [31, 39],
  green: [32, 39],
  blue: [34, 39],
};

const colorize = (str, color) => getSymbol(codes[color][0]) + '' + str + getSymbol(codes[color][1]);

module.exports = {
  makeRed: str => colorize(str, 'red'),
  makeGreen: str => colorize(str, 'green'),
  makeBlue: str => colorize(str, 'blue'),
};
