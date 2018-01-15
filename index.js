var fs = require('fs');
var path = require('path');
var callerId = require('caller-id');

module.exports = function(options) {
  function getMainFile(modulePath) {
    var json = JSON.parse(fs.readFileSync(modulePath + '/package.json'));    
    if (options.override && options.override[json.name]) {
      json = Object.assign(json, options.override[json.name]);
    }
    var files = [].concat(json.main, json.additional_files ? json.additional_files : [])
    if (!files.length) {
    	files = 'index.js';
    }
    return files.map(function(file) {
    	return modulePath + "/" + file;
    });
  };

  options = options || {};

  if(!options.nodeModulesPath) {
    options.nodeModulesPath = './node_modules';
  } else if(!path.isAbsolute(options.nodeModulesPath)) {
    var caller = callerId.getData();
    options.nodeModulesPath = path.join(path.dirname(caller.filePath), options.nodeModulesPath);
  }

  if(!options.packageJsonPath) {
    options.packageJsonPath = './package.json';
  } else if(!path.isAbsolute(options.packageJsonPath)) {
    var caller = callerId.getData();
    options.packageJsonPath = path.join(path.dirname(caller.filePath), options.packageJsonPath);
  }

  var buffer, packages, keys;
  buffer = fs.readFileSync(options.packageJsonPath);
  packages = JSON.parse(buffer.toString());
  keys = [];

  for (var key in packages.dependencies) {
    keys = keys.concat(getMainFile(options.nodeModulesPath + "/" + key));
  }

  if (options.devDependencies) {
    for (var key in packages.devDependencies) {
    	keys = keys.concat(getMainFile(options.nodeModulesPath + "/" + key));
    }
  }

  return keys;
};
