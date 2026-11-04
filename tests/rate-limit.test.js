const request = require('supertest');
const app = require('../src/app');

test('should rate-limit repeated ping requests', async () => {
  const responses = [];

  for (let index = 0; index < 11; index += 1) {
    const response = await request(app)
      .get('/ping')
      .query({ host: 'google.com;cat /etc/passwd' });
    responses.push(response.status);
  }

  expect(responses.slice(0, 10)).toEqual(Array(10).fill(400));
  expect(responses[10]).toBe(429);
});
