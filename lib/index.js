var Negotiator = require('negotiator');
var Hoek = require('hoek');
var Boom = require('boom');

exports.register = function (plugin,options,next) {

  var defaults = {
    mediaTypes: {
      'application/json': true,
      'text/plain': true,
    }
  };

  var config = Hoek.applyToDefaults(defaults, options);

  plugin.ext('onPreResponse', function (request, reply) {
    var requestSettings = request.route.settings.plugins['hapi-negotiator'];

    if (requestSettings === false) {
      return reply.continue();
    }

    requestSettings = Hoek.applyToDefaults(config, requestSettings || {});
    var requestNegotiator = new Negotiator(request.raw.req);
    var selectedMediaType = requestNegotiator.mediaType(Object.keys(requestSettings.mediaTypes));
    var selectedOption = requestSettings.mediaTypes[selectedMediaType];

    if (!selectedOption) {
      reply(Boom.notAcceptable());
    }
    else if (selectedOption === true)
    {
      reply.continue();
    }
    else if (typeof selectedOption === 'function')
    {
      selectedOption(request, reply);
    }
    else if (selectedOption.method)
    {
      selectedOption.args.push(request.response.source);
      reply[selectedOption.method].apply(reply, selectedOption.args);
    }
    else
    {
      // Not really sure I just reply or just let it fail
      // Log something??
      reply.continue();
    }
  });

  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
