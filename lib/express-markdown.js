/*!
 * express-markdown
 * MIT Licensed
 */

var express = require("express");

var cache = {};

// Tie into express's compilers object
express.compiler.compilers.markdown = {
    match: /\.html$/,
    ext: '.md',
    compile: function(str, fn){
        var md = cache.md || (cache.md = require("markdown"));
        try {
            fn(null, md.markdown.toHTML(str));
        } catch (err) {
            fn(err);
        }
    }
};
