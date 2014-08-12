Jade-Browser-Middleware
-----------------------

Jade-Browser-Middleware is a simple piece of middleware for express
that precompiles your Jade templates and writes them to files in your
project folder as functions you can access in your client-side JS.

Usage
-----

### In Node

Require jade-browser-middleware

```javascript
var express = require('express'),
    jade-browser-middleware = require('jade-browser-middleware'),
    app = express();
````

Assign the middleware to your Express app and define the source of your templates, and the namespace you'd like to use for compiled template functions in the browser.

```javascript
app.use(jade-browser-middleware({
    src: __dirname + '/views/includes',
    dest: __dirname + '/public/templates'
    namespace: 'templates'
}));
````

On each request the middleware will look for the any JS files in the
src property you defined, if it's not there or changes have been made to the file, it'll compile it, and write it to the src directory as the JS file named in the request, even if the directory doesn't exist.


### In the browser

Request a template i.e. `script src='templates/filename.js'` and if the equivalent jade template exists in your `src` directory, it will be added to an object namespaced with the namespace you created on the server (defaults to jadeTemplates).

````javascript
templates.compileJadeTemplate()
````

LICENSE
-------

MIT
