"use strict";

var through = require('through2')
var es = require('event-stream')
var Ractive = require('ractive')
var gutil = require('gulp-util')
var Buffer = require('buffer').Buffer
var concat = require('gulp-concat-util')
var extend = require('lodash.assign')
var os = require('os')
var path = require('path')
// var map = require('map-stream')
var Concat = require('concat-with-sourcemaps');
// consts
var PLUGIN_NAME = 'gulp-ractive'


var defaults = {
    sep: os.EOL,
    process: false,
    namespace: 'window.templates',
    extension: '.html',
    ractive: {
        preserveWhitespace: false,
        sanitize: false
    }
}

function gulpRactive(name, config) {
    var options = extend({}, defaults, config || {});
    var concat, firstFile, fileName;

    var templates = {}
    var nsTemplates = options.namespace + ' = {};'

    function combine(file, encoding, next) {
        if (!firstFile) {
            firstFile = file;
            // Default path to first file basename
            fileName = name || path.basename(file.path)
            concat = new Concat(!!file.sourceMap, fileName, options.sep)
            concat.add(file.relative, nsTemplates, file.sourceMap)
        }

        var baseName = path.basename(file.path, options.extension)
        var baseName = path.basename(file.path, '.html')
        var templateData = file.contents.toString('utf8')

        try {
            var parsedTemplate = Ractive.parse(templateData, options.ractive)
            var nsTemplate = options.namespace+'[\''+baseName+'\'] = ' + JSON.stringify(parsedTemplate)
            concat.add(file.relative, nsTemplate, file.sourceMap)
        } catch (_error) {
            return this.emit('error', new Error(_error))
        }

        next();
    }

    function flush(next) {
      if (firstFile) {
        var joinedFile = firstFile.clone()

        joinedFile.path = path.join(options.cwd || firstFile.base, fileName)
        joinedFile.base = options.base || firstFile.base
        joinedFile.contents = new Buffer(concat.content)
        this.push(joinedFile);
      }
      next();
    }

    return through.obj(combine, flush);
}

module.exports = gulpRactive
