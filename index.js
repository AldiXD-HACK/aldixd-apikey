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

// Static files → semua file di folder public langsung bisa diakses
app.use(express.static(path.join(__dirname, '/')));
app.use('/api', express.static(path.join(__dirname, 'api')));

// Global Helpers
global.getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'get',
      url,
      headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 },
      ...options,
      responseType: 'arraybuffer'
    });
    return res.data;
  } catch (err) {
    return err;
  }
};

global.fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      ...options
    });
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

// User management
const usersFile = path.join(__dirname, 'users.json');
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));

const readUsers = () => {
  try { return JSON.parse(fs.readFileSync(usersFile, 'utf8')); }
  catch { return []; }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return true;
  } catch {
    return false;
  }
};

const generateApiKey = () =>
  Math.random().toString(36).substring(2) +
  Math.random().toString(36).substring(2) +
  Math.random().toString(36).substring(2);

// Auth routes
app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  const users = readUsers();
  if (users.find(u => u.username === username))
    return res.status(400).json({ error: 'Username already exists' });

  const apiKey = generateApiKey();
  const newUser = {
    id: Date.now().toString(),
    username,
    password, // sebaiknya hash password kalau production
    apikey: apiKey,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  if (writeUsers(users)) {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    envContent = envContent.replace(/APIKEY=.*\n/, '');
    const allKeys = users.map(u => u.apikey);
    envContent += `APIKEY=["${allKeys.join('", "')}"]\n`;
    fs.writeFileSync(envPath, envContent);

    const { password: _, ...userWithoutPassword } = newUser;
    return res.json({ message: 'User created successfully', user: userWithoutPassword });
  }
  res.status(500).json({ error: 'Failed to create user' });
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ error: 'Invalid username or password' });

  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'Login successful', user: userWithoutPassword });
});

// Middleware verify API key
const verifyApiKey = (req, res, next) => {
  const apiKey = req.query.apikey || req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'API key is required' });

  const users = readUsers();
  const user = users.find(u => u.apikey === apiKey);
  if (!user) return res.status(401).json({ error: 'Invalid API key' });

  req.user = user;
  next();
};

// Response wrapper
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

// Load API routes
let totalRoutes = 0;
let rawEndpoints = {};
const apiFolder = path.join(__dirname, 'api');

fs.readdirSync(apiFolder).forEach(file => {
  if (file.endsWith('.js')) {
    try {
      const routes = require(path.join(apiFolder, file));
      const handlers = Array.isArray(routes) ? routes : [routes];
      handlers.forEach(route => {
        if (route.path && route.name) {
          const cat = route.category || "Uncategorized";
          if (!rawEndpoints[cat]) rawEndpoints[cat] = [];
          rawEndpoints[cat].push({
            name: route.name,
            desc: route.desc || "No description provided",
            path: route.path,
            method: route.method || "GET"
          });
          totalRoutes++;
        }
      });
    } catch (err) {
      console.error(`Error loading route from ${file}:`, err);
    }
  }
});

const endpoints = Object.keys(rawEndpoints)
  .sort()
  .reduce((sorted, cat) => {
    sorted[cat] = rawEndpoints[cat].sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, {});

app.get('/endpoints', (req, res) => res.json(endpoints));

// Default route → index.html (otomatis serve dari public)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(chalk.bgGreen.black(` 🚀 Server running on port ${PORT} `));
  console.log(chalk.bgCyan.black(` 📦 Total Routes Loaded: ${totalRoutes} `));
});

module.exports = app;
