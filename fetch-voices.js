const https = require('https');

const options = {
  hostname: 'api.elevenlabs.io',
  port: 443,
  path: '/v1/voices',
  method: 'GET',
  headers: {
    'xi-api-key': 'sk_1bdaeb59b97bda2e07f6a79bbfedc1765cbbd40c8d8a33e4'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
