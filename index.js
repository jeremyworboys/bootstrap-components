
var express = require('express');
var path = require('path');
var https = require('https');
var http = require('http');
var uglifyJS = require('uglify-js');
var less = require('less');

var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(express.bodyParser());
});

app.get('/', function(req, res) {
    res.send('Bootstrap Component Server :D');
});



var projects = require('./files.json');
var TAG = '3.0.0-wip';
var CACHE = {};

(function() {
    function cache_file(filename, encoding, path) {
        var options = {
            host: 'raw.github.com',
            port: 443,
            path: path,
            method: 'GET'
        };
        var content = [];
        var req = https.request(options, function(res) {
            res.setEncoding(encoding);
            res.on('data', function(chunk) {
                content.push(chunk);
            });
            res.on('end', function() {
                CACHE[filename] = content.join('');
            });
        });
        req.end();
    }
    var k, project;
    for (k in projects) {
        project = projects[k];
        if (project.styles) project.styles.forEach(function(file) {
            cache_file(file, 'utf-8', path.join('/twitter/bootstrap/', TAG, '/less/', file));
        });
        if (project.scripts) project.scripts.forEach(function(file) {
            cache_file(file, 'utf-8', path.join('/twitter/bootstrap/', TAG, '/js/', file));
        });
        if (project.fonts) project.fonts.forEach(function(file) {
            cache_file(file, 'binary', path.join('/twitter/bootstrap/', TAG, '/fonts/', file));
        });
    }
})();



var copyright = [
    '/*!',
    ' * Copyright 2012 Twitter, Inc',
    ' * Licensed under the Apache License v2.0',
    ' * http://www.apache.org/licenses/LICENSE-2.0',
    ' *',
    ' * Designed and built with all the love in the world @twitter by @mdo and @fat.',
    ' */'
].join('\n');

app.get('/:user/:project/:version/:file', function(req, res) {
    if (req.params.user !== 'bootstrap-components') return res.send(404);

    var name = req.params.project;
    var project = projects[name];
    if (!project) return res.send(404);
    var file = req.params.file;
    var result;


    if (file === 'component.json') {
        var pkg = {
            name: name,
            repo: "bootstrap-components/"+name,
            description: "Bootstrap "+name+" component",
            version: "3.0.0",
            license: "Apache 2.0"
        };
        if (project.styles) pkg.styles = ['index.css'];
        if (project.scripts) {
            pkg.scripts = ['index.js'];
            pkg.main = project.scripts[0];
            pkg.dependencies = {"component/jquery": "*"};
        }
        if (project.fonts) pkg.fonts = project.fonts;
        return res.send(JSON.stringify(pkg));
    }


    if (file === 'index.css') {
        result = '';

        result += CACHE['variables.less'];
        result += CACHE['mixins.less'];

        project.styles.forEach(function (filename) {
            result += CACHE[filename];
        });

        result = result.replace(/@import[^\n]*/gi, '');
        result = result;

        return new less.Parser({
            optimization: 0,
            filename: 'index.css'
        }).parse(result, function (err, tree) {
            if (err) throw JSON.stringify(err);

            res.set('Content-Type', 'text/plain');
            return res.send(copyright + tree.toCSS({
                compress: true
            }).replace(/\.\.\/.+?\//g, ''));
        });
    }


    if (file === 'index.js') {
        var content = project.scripts.map(function(filename) {
            return CACHE[filename];
        }).join('\n').replace(/[\"\']use strict[\"\']/gi, '');

        res.set('Content-Type', 'text/plain');
        return res.send(copyright + uglifyJS.minify(content, {
            fromString: true
        }).code);
    }


    if (project.fonts && ~project.fonts.indexOf(file)) {
        result = CACHE[file];

        res.set('Content-Type', 'application/octet-stream');
        return res.send(result);
    }

    return res.send(404);
});



http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
