
/**
 * Dependencies.
 */

var express = require('express');
var partials = require('express-partials');
var app = express();
var router = require('tower-router');
var route = require('tower-route');
var path = require('path');
var markdown = require('./markdown');

/**
 * Configuration.
 */

app.configure(function(){
  app.use(partials());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.use('/public', express.static(__dirname + '/public'));
  app.engine('html', render);
  app.use(router);
});

route('/', function(context){
  context.res.render('index');
  //context.res.send(document.innerHTML);
});

route('/guides', function(context){
  context.res.render('guides', { code: markdown('code') });
});

route('/api', function(context){
  context.res.render('docs');
});

app.get('/docs', function(req, res){
  res.render('docs', { url: 'docs' });
});

/**
 * Listen.
 */

app.listen(process.env.PORT || 3000);

/**
 * tmp
 */

var directive = require('tower-directive');

directive('data-content', function(scope, el, attr){
  el.appendChild(scope.get('body')(scope));
});

var template = require('tower-template');
var content = require('tower-content');
var domify = require('domify');
var jsdom = require('jsdom').jsdom;
var fs = require('fs');
var path = require('path');
var layoutPath = path.join(__dirname, 'views/layout.html');
var layout = jsdom(fs.readFileSync(layoutPath));
var templates = {};
templates[layoutPath] = template(layout);

// express 3.x template engine compliance

function render(filename, options, cb) {
  var startTime = new Date;
  var fn = templates[filename];

  if (!fn) {
    var html = fs.readFileSync(filename, 'utf-8');
    var el = domify(html, layout); // XXX: added second param, need to send PR
    //layout.appendChild(el);
    //console.log(layout.documentElement.innerHTML);
    templates[filename] = fn = template(el);
  }

  if (layoutPath === filename) {
    var el = fn(content.root().update(options));
    var endTime = new Date;
    console.log(endTime - startTime);
    //console.log(el.documentElement.innerHTML)
    cb(null, el.documentElement.innerHTML);
  } else {
    var endTime = new Date;
    console.log(endTime - startTime);
    cb(null, fn); 
  }
}
