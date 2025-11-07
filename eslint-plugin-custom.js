const noHardcodedStrings = require('./eslint-rules/no-hardcoded-strings.js');

module.exports = {
  rules: {
    'no-hardcoded-strings': noHardcodedStrings
  }
};
