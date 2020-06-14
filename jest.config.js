const {defaults} = require('jest-config');
module.exports = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
};

global.Client = {
  checkForName: input => {}
};
verbose = true;
