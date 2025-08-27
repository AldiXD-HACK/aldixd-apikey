const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.enable("trust proxy");
app.set("json spaces", 2);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Static files dari root folder
app.use(express.static(__dirname));

// Global Helpers
global.getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({ method: 'get', url, responseType: 'arraybuffer', ...options });
    return res.data;
  } catch (err) {
    return err;
  }
};

global.fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({ method: 'GET', url, ...options });
    return res.data;
  } catch (err) {
    return err;
  }
};

global.apikey = process.env.APIKEY || null;
global.totalreq = 0;

// Settings
const settings = {
  creatorName: "AldiXDCodeX",
  whatsappLink: "https://wa.me/6285177499957",
  apiTitle: "AldiXDCodeX Apiee",
  githubLink: "https://whatsapp.com/channel/",
  instagramLink: "https://whatsapp.com/channel/"
};

// ===== User Management (Register / Login) =====
const usersFile = path.join(__dirname, 'users.json');
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));

const readUsers = () => {
  try { return JSON.parse(fs.readFileSync(usersFile, 'utf8')); }
  catch { return []; }
};

const writeUsers = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

const generateApiKey = () =>
  Math.random().toString(36).substring(2) +
  Math.random().toString(36).substring(2) +
  Math.random().toString(36).substring(2);

app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username & password required' });

  const users = readUsers();
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'Username already exists' });

  const apiKey = generateApiKey();
  const newUser = { id: Date.now().toString(), username, password, apikey: apiKey, createdAt: new Date().toISOString() };

  users.push(newUser);
  writeUsers(users);

  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ message: 'User created successfully', user: userWithoutPassword });
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username & password required' });

  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'Login successful', user: userWithoutPassword });
});

// ===== Global JSON Wrapper =====
app.use((req, res, next) => {
  global.totalreq++;
  const originalJson = res.json;
  res.json = function (data) {
    if (typeof data === 'object' && req.path !== '/endpoints' && req.path !== '/set') {
      return originalJson.call(this, { creator: settings.creatorName, ...data });
    }
    return originalJson.call(this, data);
  };
  next();
});

app.get('/set', (req, res) => res.json(settings));

// ===== Dynamic Route Loader =====
let totalRoutes = 0;
let rawEndpoints = {};
const apiFolder = path.join(__dirname, 'api');

fs.readdirSync(apiFolder).forEach(file => {
  if (file.endsWith('.js')) {
    try {
      const routes = require(path.join(apiFolder, file));
      const handlers = Array.isArray(routes) ? routes : [routes];
      handlers.forEach(route => {
        const { name, desc, category, path: routePath, run } = route;
        if (name && desc && category && routePath && typeof run === 'function') {
          app.get(routePath.split('?')[0], run);
          if (!rawEndpoints[category]) rawEndpoints[category] = [];
          rawEndpoints[category].push({ name, desc, path: routePath });
          totalRoutes++;
        }
      });
    } catch (err) {
      console.error(`Error loading route from ${file}:`, err);
    }
  }
});

const endpoints = Object.keys(rawEndpoints).sort().reduce((sorted, category) => {
  sorted[category] = rawEndpoints[category].sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
}, {});

app.get('/endpoints', (req, res) => res.json(endpoints));

// ===== Default Route (index.html) =====
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Start Server
app.listen(PORT, () => {
  console.log(chalk.bgGreen.black(` 🚀 Server running on port ${PORT} `));
  console.log(chalk.bgCyan.black(` 📦 Total Routes Loaded: ${totalRoutes} `));
});

module.exports = app;1
