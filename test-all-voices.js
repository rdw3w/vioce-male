const https = require('https');

const allVoices = [
  '21m00Tcm4TlvDq8ikWAM', // Rachel
  '29vD33N1CtxCmqQRPOHJ', // Drew
  '2EiwWnXFnvU5JabPnv8n', // Clyde
  '5Q0t7uMcjvnagumLfvZi', // Paul
  'AZnzlk1XvdvUeBnXmlld', // Domi
  'CYw3kZ02Hs0563khs1Fj', // Dave
  'D38z5RcWu1voky8IGS1Z', // Fin
  'EXAVITQu4vr4xnSDxMaL', // Sarah
  'ErXwobaYiN019PkySvjV', // Antoni
  'GBv7mTIG0tZioAwcgJoK', // Thomas
  'IKne3meq5aSn9XLyUdCD', // Charlie
  'JBFqnCBsd6RMkjVJQZzi', // George
  'LcfcDJNUP1GQjkvn1xUw', // Emily
  'MF3mGyEYCl7XYWbV9V6O', // Elli
  'N2lVS1w4EtoT3dr4eOWO', // Callum
  'ODq5zmih8GrVes3RoDiz', // Patrick
  'SOYHLrjzK2X1ezoPC6cr', // Harry
  'TX3OmZsQNvqhlGQVWmRo', // Liam
  'ThT5KcBeYPX3keUQqHPh', // Dorothy
  'TxGEqnHWrfWFTfGW9XjX', // Josh
  'VR6AewLTigWG4xSOukaG', // Arnold
  'XB0fDUnXU5powwS1qly0', // Charlotte
  'XrExE9yKIg1WjnnlVkGX', // Matilda
  'Yko7PKHZNXotIFUBG7I9', // Matthew
  'bVMeCyTHy58xNoL34h3p', // James
  'Zlb1dXrM653N07RXdFWR', // Joseph
  'flq6f7yk4E4fJM5XTYuZ', // Michael
  'g5CIjZEefAph4nQFvHAz', // Ethan
  'jBpfuIE2acCO8z3wKNLl', // Gigi
  'jsCqWAovK2zikvvpPNZa', // Freya
  'oWAxZDx7w5VEj9dCyTzz', // Grace
  'onwK4e9ZLuTAKqWW03F9', // Daniel
  'pMsXgVXv3BLzUgSXRplE', // Serena
  'pNInz6obpgDQGcFmaJgB', // Adam
  'piTKgcLEGmPE4e6mJC43', // Nicole
  't0jbNlBVZ17f02VDIeMI', // Jessie
  'wViXBPUzp2ZZixB1xQuM', // Ryan
  'yoZ06aMxZJJ28mfd3POQ', // Sam
  'z9fAnlkpzviPz146aGWa', // Glinda
  'zrHiDhphv9ZnVXBqCQcs', // Mimi
];

const apiKey = 'sk_1bdaeb59b97bda2e07f6a79bbfedc1765cbbd40c8d8a33e4';

async function testVoice(voiceId) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      text: 'Hello',
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
        if (res.statusCode === 200) {
          console.log(`Voice ${voiceId} succeeded.`);
        }
        resolve();
      });
    });

    req.on('error', error => {
      resolve();
    });

    req.write(data);
    req.end();
  });
}

async function run() {
  for (const voice of allVoices) {
    await testVoice(voice);
  }
}

run();
