Jade-Browser-Middleware
-----------------------

Jade-Browser-Middleware is a simple piece of middleware for express
that precompiles your Jade templates and writes them to files in your
project folder as functions you can access in your client-side JS.

Usage
-----

### On the server

Require jade-browser-middleware

```javascript
var jbm = require('./jade-browser-middleware')
````

Assign the middleware to your Express app and define the source of your templates, and the namespace you'd like to use for compiled template functions in the browser.

```javascript
app.use(jbm.middleware({
    src: __dirname + '/public/templates',
    namespace: 'NS.templates'
}));
````

On each request the middleware will look for the any JS files in the
src property you defined, if it's not there or changes have been made to the file, it'll compile it, and write it to the src directory as the JS file named in the request.

### In the browser

If you need to execute a jade template during runtime, you can access the 'jade' function through the namespace you defined.

````javascript

NS.templates.compileJadeTemplate()

````