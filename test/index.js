var Lab = require('lab');
var Code = require('code');
var Hapi = require('hapi');
var Path = require('path');
var lab = exports.lab = Lab.script();
var expect = Code.expect;
var before = lab.before;
var after = lab.after;
var describe = lab.describe;
var it = lab.it;

var sinon = require('sinon');

describe('AcceptHeader', function () {
  var data = { data: 'test', success: true };

  var defaultHandler = function (request, reply) {
    reply(data);
  };

  var customNegotiation = sinon.spy(function (request, reply) {
    reply('Ignore Everything!');
  });

  var server = new Hapi.Server({debug: false});
  server.connection({ port: 80 });

  before(function (done) {
    server.register({
      register: require('../'),
      options: {}
    }, function (err) {
      expect(err).to.not.exist;

      server.route([
        {
          method: 'GET',
          path: '/',
          config: {
            plugins: {
              'hapi-negotiator': {
                mediaTypes: {
                  'text/html': { method: 'view', args: ['index'] }
                }
              }
            },
          },
          handler: defaultHandler
        },
        {
          method: 'GET',
          path: '/json',
          handler: defaultHandler
        },
        {
          method: 'GET',
          path: '/ignore',
          config: {
            plugins: {
              'hapi-negotiator': false
            },
          },
          handler: defaultHandler
        },
        {
          method: 'GET',
          path: '/custom',
          config: {
            plugins: {
              'hapi-negotiator': {
                mediaTypes: {
                  'text/html': customNegotiation
                }
              }
            },
          },
          handler: defaultHandler
        },
        {
          method: 'GET',
          path: '/fail',
          config: {
            plugins: {
              'hapi-negotiator': {
                mediaTypes: {
                  'text/html': { wrong: 'param' }
                }
              }
            },
          },
          handler: defaultHandler
        }
      ]);

      server.views({
        engines: {
            html: require('handlebars')
        },
        path: Path.join(__dirname, 'views')
      });

      done();
    });
  });

  after(function (done) {
    server = null;
    done();
  });

  it('returns correct type based on priority', function (done) {
    var request = {
      url: '/', headers: { 'Accept' : 'text/html,application/json;q=0.9,text/plain;q=0.1' }
    };
    server.inject(request, function(res) {
      expect(res.headers['content-type']).to.include('text/html');
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('returns 406 Not Acceptable when type is not found', function (done) {
    var request = {
      url: '/json', headers: { 'Accept' : 'text/html' }
    };
    server.inject(request, function(res) {
      expect(res.statusCode).to.equal(406);
      done();
    });
  });

  it('returns same reply if mediaType is set to true', function (done) {
    var request = {
      url: '/json', headers: { 'Accept' : 'application/json' }
    };
    server.inject(request, function(res) {
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.equal(data);
      done();
    });
  });

  it('skips validation when set to false', function (done) {
    var request = {
      url: '/ignore', headers: { 'Accept' : 'text/html' }
    };
    server.inject(request, function(res) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('returns executes the function if mediaType is one', function (done) {
    var request = {
      url: '/custom', headers: { 'Accept' : 'text/html' }
    };
    server.inject(request, function(res) {
      expect(res.statusCode).to.equal(200);
      expect(customNegotiation.called).to.be.true;
      done();
    });
  });

  it('fails silently on improper route configuration', function (done) {
    var request = {
      url: '/fail', headers: { 'Accept' : 'text/html' }
    };
    server.inject(request, function(res) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });
});