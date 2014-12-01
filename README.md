Hapi Content Negotiation
===============

[![Build Status](https://travis-ci.org/felipeleusin/hapi-negotiator.svg?branch=master)](https://travis-ci.org/felipeleusin/hapi-negotiator) [![Dependency Status](https://david-dm.org/felipeleusin/hapi-negotiator.svg)](https://david-dm.org/felipeleusin/hapi-negotiator)

[**Hapi**](https://github.com/spumko/hapi) Content Negotiation Plugin

This project enhances content negotiation capabilities of Hapi. It's a wrapper around [**Negotiator**](https://github.com/jshttp/negotiator) module.

## Purpose

When you have the same route but wants it to respond json or a html view depending on the Accept header.

## Options

The plugin supports the following options:

- `mediaTypes` - (optional) a object containing a combination of global media types where the key is the media type name and the value is one of the following:
    - `function (request, reply)` - the function is called receiving the request and the reply
    - `true` - perform the default `reply()`. Effective no-op.
    - `false` - throws Boom.notAccepted() error
    - `{ method, args }` - invoke the `method` on the reply method passing an args array. The args array is appended the default reply object.

 
## Example
You have to configure the plugin for each route, so if you want a route to respond with a view named index when accept is text/html, notAccepted when image/jpeg and the regular json reply when application/vnd.project+json you should configure it as

```javascript
server.route({
	method: 'GET',
	path: '/',
	config: {
		'hapi-negotiator': {
			mediaTypes: {
				'text/html': { method: 'view', args: ['index'] },
				'image/jpeg': false,
				'application/vnd.project+json': true,
			}
		}
	}
});
``` 

## Todo

- Improve documentation
- Include negotiation for Accept Language. Maybe combine with one of the localization modules?

## Comments/Suggestions

Feel free to open an issue.
