const https = require('https');

const voices = [
  '21m00Tcm4TlvDq8ikWAM', // Rachel
  'ErXwobaYiN019PkySvjV', // Antoni
  'TxGEqnHWrfWFTfGW9XjX', // Josh
  'VR6AewLTigWG4xSOukaG', // Arnold
  'MF3mGyEYCl7XYWbV9V6O', // Elli
];

const apiKey = 'sk_1bdaeb59b97bda2e07f6a79bbfedc1765cbbd40c8d8a33e4';

async function testVoice(voiceId) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      text: 'Hello world',
      model_id: 'eleven_multilingual_v2',
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, res => {
      let resData = '';
      res.on('data', chunk => {
        resData += chunk;
      });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.log(`Voice ${voiceId} failed: ${resData}`);
        } else {
          console.log(`Voice ${voiceId} succeeded.`);
        }
        resolve();
      });
    });

    req.on('error', error => {
      console.error(error);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

async function run() {
  for (const voice of voices) {
    await testVoice(voice);
  }
}

run();
