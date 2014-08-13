Jade-Browser-Middleware
-----------------------

**Jade-Browser-Middleware** is a piece of middleware for express that precompiles your Jade templates on the fly and writes them to files in your
chosen destination as functions you can execute in your client-side JS.

## How it works

Request a compiled template, i.e., `script src='/templates/my-jade-template.js'`, and if it does not yet exist, **Jade-Browser-Middleware** will look in your chosen `src` location for `my-jade-template.jade`.
If it's found, a compiled version, `my-jade-template.js` will be created and written to an optional `dest` location or `src`.

If the template already exists, **Jade-Browser-Middleware** will check if the original template has been modified, and if so, will recompile the template.

When the template is compiled, the function will be assigned to a namespace (defaults to 'jadeTemplates') on the `window` object, i.e., `window.jadeTemplates.my_jade_templates = function (...) {...};`.

Then you can do `window.jadeTemplates.my_jade_templates([locals]);`, which returns the markup compiled with optional locals.


## Setup

`$ npm install jade-browser-middleware`

### In Node

```
var express = require('express'),
    jadeBrowserMiddleware = require('jade-browser-middleware'),
    app = express();
```

Use the middleware in your app and pass in options.

```
app.use(jadeBrowserMiddleware(__dirname + '/views/includes', {
    dest: __dirname + '/public/templates'
    namespace: 'templates',
    format: 'camelcase'
}));
```

- `src` - (required) is the source location of the Jade templates you want to have compiled.
For backwards-compatibility `src` can be defined as an option i.e., `{ src: '...' }`

#### Options

- `dest`- the destination for your compiled templates (defaults to `src`).
- `namespace` - the namespace for your templates map in the browser (defaults to 'jadeTemplates').
- `format` - the format of the function name added to the namespace for each template request (defaults to 'underscore').

##### format

- 'underscore' - will convert spaces and hyphens to underscores i.e., *my jade-template.jade* becomes *my_jade_template.jade*
- 'camelcase' - will convert strings to camelcase i.e., *my jade-template.jade* becomes *myJadeTemplate.jade*

### In the browser

Get [Jade runtime](https://raw.githubusercontent.com/visionmedia/jade/master/runtime.js) and include in your project, i.e., `script src='lib/runtime.js'`


Request a template i.e., `script src='templates/my-jade-template.js'` and if the equivalent jade template exists in your `src` location, it will be compiled and written to an optional `dest` location or `src`.


LICENSE
-------

MIT
