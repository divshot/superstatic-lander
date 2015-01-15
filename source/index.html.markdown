---
title: Superstatic - Static Web Server for HTML5 Applications
---

# The Static Web Server for HTML5 Applications

Superstatic is an enhanced static web server that was built to power
[Divshot](https://www.divshot.com). It has fantastic support for HTML5
pushState applications as well as clean URLs and other goodies.

## <a id="installation"></a>Installation

Superstatic should be installed globally using npm:

For use via CLI

```
$ npm install -g superstatic
```

For use via API

```
npm install superstatic --save
```
    
## <a id="usage"></a>Usage

By default, Superstatic will simply serve the current directory on port
`3474`. This works just like any other static server:

```
$ superstatic
```

or aliased as

```
$ ss
```
    
You can optionally specify the directory, port and hostname of the server:

```
$ superstatic public --port 8080 --host 127.0.0.1
```
    
Where it gets interesting is with Superstatic's JSON configuration file.

## <a id="configuration"></a>Configuration

Superstatic reads special configuration from a JSON file (either `superstatic.json`
or `divshot.json` by default, configurable with `-c`). This JSON file enables
enhanced static server functionality beyond simply serving files.

**root:** by default, Superstatic will serve the current working directory (or the
ancestor of the current directory that contains the configuration json being used).
This configuration key specifies a directory *relative to the configuration file* that
should be served. For example, if serving a Jekyll app, this might be set to `"_site"`.
A directory passed as an argument into the command line app supercedes this configuration
directive.

**clean_urls:** if `true`, all `.html` files will automatically have their extensions
dropped. If `.html` is used at the end of a filename, it will perform a 301 redirect
to the same path with `.html` dropped.

All paths have clean urls

```json
{
  "clean_urls": true
}
```

Only specific paths get clean urls

```json
{
  "clean_urls": ["/app**", "!/components**"]
}
```

**routes:** you can specify custom route recognition for your application by supplying
an object to the routes key. Use a single star `*` to replace one URL segment or a
double star to replace an arbitrary piece of URLs. This works great for single page
apps. An example:

```json
{
  "routes": {
    "app/**":"application.html",
    "projects/*/edit":"projects.html"
  }
}
```

**redirects:** you can specify to have certain url paths be redirected (specifying a custom http status code, or which defaults to 301) to other url paths by supplying an object to the `redirects` key. Route path matching is similar to using custom routes. For example:

Default 301 redirect

```json
{
  "redirects": {
    "/some/old/path": "/some/new/path"
  }
}
```

Custom http status code

```json
{
  "redirects": {
    "/some/old/path": {
      "status": 302,
      "url": "/some/new/path"
    }
  }
}
```

Route segments are also supported in the redirects configuration. Segmented redirects also support custom status codes (see above):

```json
{
  "redirects": {
    "/old/:segment/path": "/new/path/:segment"
  }
}
```

In this example, `/old/custom-segment/path` redirect to `/new/path/custom-segment`

**error_page:** the path to the page that you want to render 404 errors if an unrecognized
URL is supplied. For example, `error.html`.

**cache_control:** by default, all pages served by superstatic have cache control headers set at
1 hour. To change them, you can supply an object containing file globs and ages (in seconds).
You can also specify `false` to indicate that no caching should be performed, and a string to
manually set the cache control header. An example:

```json
{
  "cache_control": {
    "nocache/**": false,
    "**/*.html": 600,
    "private/**": "private, max-age=1200"
  }
}
```

Note that you can pass the `--no-cache` option when you run the server to serve all content
without caching. This is good to use during development when you want fresh content served
on each request.

**Headers:** Superstatic allows you to set the response headers for the given routing configuration.

```json
{
  "headers": {
    "/cors-stuff/**": {
      "Access-Control-Allow-Origin": "*"
    },
    "/scripts/**": {
      "content-type": "text/javascript"
    }
  }
}
```

# <a id="api"></a>API

Superstatic is available as a middleware and a standalone [Connect](http://www.npmjs.org/package/connect) server. This means you can plug this into your current server or run your own static server using Superstatic's server.


## <a id="middleware"></a>Middleware

```js
var superstatic = require('superstatic')
var connect = require('connect');

var app = connect()
  .use(superstatic(/* options */));

app.listen(3000, function () {

});

```

### `superstatic([options])`

Insantiates middleware. See an [example]() for detail on real world use.

* `options` - Optional configuration:
  * `config` - A file path to your application's configuration file (see [Configuration]()) or an object containing your application's configuration.
  * `protect` - Adds HTTP basic auth. Example:  `username:password`
  * `env`- A file path your application's environment variables file or an object containing values that are available at the urls `/__/env.json` and `/__/env.js`. See the documentation detail on [environment variables](http://docs.divshot.com/guides/environment-variables)
  * `cwd` - The current working directory to set as the root. Your application's root configuration option will be used relative to this.
  * `services` - An object containing various Superstatic services.

## <a id="server"></a>Server

```js
var superstatic = require('superstatic/lib/server');

var app = superstatic(/* options */);

var server = app.listen(function () {

});
```

Since Superstatic's server is a barebones Connect server using the Superstatic middleware, see the [Connect documentation](https://github.com/senchalabs/connect) on how to correctly instantiate, start, and stop the server.

### `superstatic([options])`

Instantiates a Connect server, setting up Superstatic middleware, port, host, debugging, compression, etc.

* `options` - Optional configuration. Uses the same options as the middleware, plus a few more options:
  * `port` - The port of the server. Defaults to `3474`.
  * `host` or `hostname` - The hostname of the server. Defaults to `localhost`.
  * `errorPage` - A file path to a custom error page. Defaults to [Superstatic's error page]().
  * `debug` - A boolean value that tells Superstatic to show or hide network logging in the console. Defaults to `false`.
  * `gzip` - A boolean value that tells Superstatic to gzip response body. Defaults to `false`.

## <a id="testing"></a>Run Tests

In superstatic module directory:

```
npm install
npm test
```

## Contributing

We LOVE open source and open source contributors. If you would like to contribute to Superstatic, please review our [contributing guidelines](https://github.com/divshot/superstatic/blob/master/CONTRIBUTING.md) before your jump in and get your hands dirty.
