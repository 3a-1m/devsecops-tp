const express = require('express');
const { execFile } = require('child_process');

const app = express();
const hostnamePattern = /^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

function escapeHtml(value) {
  const characters = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return value.replace(/[&<>"']/g, (character) => characters[character]);
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Message de bienvenue
app.get('/hello', (req, res) => {
  const name = typeof req.query.name === 'string' ? req.query.name : 'inconnu';
  res.type('html').send(`<h1>Bonjour ${escapeHtml(name)}</h1>`);
});

// Outil réseau : ping un hôte validé sans passer par un shell
app.get('/ping', (req, res) => {
  const host = req.query.host;
  if (typeof host !== 'string' || !hostnamePattern.test(host) || host !== host.trim()) {
    return res.status(400).json({ error: 'Hôte invalide' });
  }

  execFile('ping', ['-c', '1', host], (err, stdout) => {
    if (err) return res.status(500).send('Erreur');
    res.type('text').send(stdout);
  });
});

// Préférences utilisateur : seules les clés prévues sont lues
app.get('/prefs', (req, res) => {
  const preferences = { theme: 'light', lang: 'fr' };

  if (typeof req.query.theme === 'string') {
    preferences.theme = req.query.theme;
  }
  if (typeof req.query.lang === 'string') {
    preferences.lang = req.query.lang;
  }

  res.json(preferences);
});

module.exports = app;
