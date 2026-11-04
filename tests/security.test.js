const request = require('supertest');
const app = require('../src/app');

describe('security regression tests', () => {
  test('should escape HTML in the greeting name', async () => {
    const response = await request(app)
      .get('/hello')
      .query({ name: '<script>alert(1)</script>' });

    expect(response.status).toBe(200);
    expect(response.text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(response.text).not.toContain('<script>');
  });

  test('should reject a host containing a shell command', async () => {
    const response = await request(app)
      .get('/ping')
      .query({ host: 'google.com;cat /etc/passwd' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Hôte invalide' });
  });

  test('should ignore unapproved preference properties', async () => {
    const response = await request(app)
      .get('/prefs')
      .query({
        theme: 'dark',
        admin: 'true',
        '__proto__[admin]': 'true',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ theme: 'dark', lang: 'fr' });
    expect({}.admin).toBeUndefined();
  });
});
