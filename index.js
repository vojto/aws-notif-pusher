var express = require('express');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var async = require('async');

AWS.config.update({ region:'eu-central-1' });

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json());

app.get('/', function(request, response) {
  response.send('ok');
});

app.post('/push', function(request, response) {
  var sns = new AWS.SNS();

  var endpoints = request.body.endpoints.map(function(endpoint) {
    return endpoint.replace(/\s/, '');
  });

  if (!endpoints || endpoints.length < 0) {
    return response.send('missing argument endpoints');
  }

  var format = request.body.format;
  if (!format) {
    return response.send('missing argument format');
  }

  var notifBody = request.body.body;
  if (!notifBody) {
    return response.send('missing argument body');
  }

  async.each(endpoints, function(endpoint, next) {
    var message = {};

    message[format] = JSON.stringify(notifBody);

    var params = {
      Message: JSON.stringify(message),
      'MessageStructure': 'json',
      TargetArn: endpoint
    };

    console.log('SNS.Publish:');
    console.log(params);
    console.log('---');

    sns.publish(params, function(err, data) {
      next(err);
    });
  }, function(err) {
    if (err) {
      console.log(err);
      response.send(err);
    } else {
      response.send('ok');
    }

  });

  

  

});



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


