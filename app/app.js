// Establish a working directory

var root = require('path').normalize(__dirname + '/..');

// Modules

var express = require('express'),
    connectTimeout = require('connect-timeout'),
    context = require('../lib/context'),
    ghm = require("github-flavored-markdown"),
    stylus = require('stylus');

require('../lib/math.uuid');

// Server export

exports = module.exports = (function() {
  
  var server = express.createServer(),
      options = require('./config/options')([server.set('env')]);

  console.log("Environment: " + server.set('env'));

  // Register a markdown theme engine
  server.register('.md', {
      compile: function(str, options){
          var html = ghm.parse(str);
          return function(locals){
              return html.replace(/\{([^}]+)\}/g, function(_, name){
                  return locals[name];
              });
          };
      }
  });
  
  // Config (all)
  
  server.configure(function() {
    
    // Settings
    
    server.set('app root', root + '/app');
    server.set('view engine', options.view_engine || 'md');
    server.set('views', server.set('app root') + '/views');
    server.set('public', server.set('app root') + '/public');
    server.set('port', options.port);
    server.set('host', options.host);
    
    // Middleware
    
    server.use(connectTimeout({ time: options.reqTimeout }));
    server.use(stylus.middleware({
      src: server.set('views'),
      dest: server.set('public'),
      debug: true,
      compileMethod: function(str) {
        return stylus(str).set('compress', options.compressCss);
      }
    }));
    server.use(express.static(server.set('public')));
    server.use(express.cookieParser());
    server.use(express.session({
      secret: Math.uuidFast(),
      key: options.sessionKey,
      store: new express.session.MemoryStore({
        reapInterval: options.reapInterval,
        maxAge: options.maxAge
      })
    }))

    server.use(express.bodyParser())
    server.use(context);
    server.use(server.router)
    server.use(express.errorHandler({ dumpExceptions: options.dumpExceptions, showStack: options.showStack}));
    
    // Helpers
    
    require('./config/helpers')(server)
    
    // Map routes
    
    require('./config/routes')(server)

    // Serve our Markdown Files
    server.use(function(req,res,next) {
      var fs = require('fs')
        , parse = require('url').parse
	, join = require('path').join
        , url = parse(req.url)
        , path = decodeURIComponent(url.pathname)
    	, base = server.set('views')
        , fullpath;

      // potentially malicious path
      if (~path.indexOf('..')) return next
         ? next(new Error('Forbidden'))
         : forbidden(res);
    
      // index support
      if ('/' == path[path.length - 1]) {
        path += 'index.md';
      }

      fullpath = join(base, path);

      // Stat the path
      fs.stat(fullpath,function(err,stat) {
        /**
         * Kindly borrowed from Connect's static.js middleware
         */
        // ignore ENOENT
        if (err) {
          return 'ENOENT' == err.code ? next() : next(err);
        // ignore directories
        } else if (stat.isDirectory()) {
          return next();
        }

        if ('/' == path[0]) {
          path = path.slice(1);
        }
        
        res.render(path, { layout: true } );
      });
    });
  })
  
  // Config (development)
  
  server.configure('development', function() {
    server.use(express.logger({ format: ':method :url :status' }));
  });
      
  // Config (staging)
  
  server.configure('staging', function() {
    server.use(express.logger({ format: ':method :url :status' }));
  });
      
  // Config (production)
  
  server.configure('production', function() {

  });
  
  // Handle errors
  
  require('./config/errors.js')(server)
    
  // Export the server
  
  return server;
  
})();
