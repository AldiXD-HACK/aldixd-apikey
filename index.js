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

// Static
app.use('/', express.static(path.join(__dirname, '/api')));

// Global Helpers
global.getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'get',
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
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
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
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
const usersFilePath = path.join(__dirname, 'users.json');

// Initialize users file if it doesn't exist
function initializeUsersFile() {
  try {
    if (!fs.existsSync(usersFilePath)) {
      fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
      console.log(chalk.hex('#55efc4')('✔ Created users.json file'));
    }
  } catch (error) {
    console.error(chalk.bgRed.white(` ❌ Error creating users file: ${error.message}`));
  }
}

initializeUsersFile();

// Read users from file
function readUsers() {
  try {
    if (!fs.existsSync(usersFilePath)) {
      return [];
    }
    
    const data = fs.readFileSync(usersFilePath, 'utf8');
    
    // Handle empty file
    if (!data || data.trim() === '') {
      return [];
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error(chalk.bgRed.white(` ❌ Error reading users file: ${error.message}`));
    return [];
  }
}

// Write users to file
function writeUsers(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    console.log(chalk.hex('#55efc4')(`✔ Users file updated with ${users.length} users`));
    return true;
  } catch (error) {
    console.error(chalk.bgRed.white(` ❌ Error writing users file: ${error.message}`));
    return false;
  }
}

// Generate random API key
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Auth middleware
function authenticate(req, res, next) {
  // Skip authentication for certain routes
  const publicRoutes = [
    '/', '/set', '/endpoints', 
    '/login', '/register', 
    '/api/login', '/api/register'
  ];
  
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  
  const apiKey = req.query.apikey || req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required. Please register to get an API key.' });
  }
  
  const users = readUsers();
  const user = users.find(u => u.apikey === apiKey);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid API key. Please check your API key or register again.' });
  }
  
  req.user = user;
  next();
}

// Apply authentication middleware to all routes
app.use(authenticate);

// Routes for authentication
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  const users = readUsers();
  
  // Check if user already exists
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    username,
    password, // Note: In production, you should hash passwords
    apikey: generateApiKey(),
    createdAt: new Date().toISOString(),
    requestCount: 0
  };
  
  users.push(newUser);
  const writeSuccess = writeUsers(users);
  
  if (!writeSuccess) {
    return res.status(500).json({ error: 'Failed to save user data' });
  }
  
  res.json({ 
    success: true,
    message: 'User registered successfully', 
    apikey: newUser.apikey,
    username: newUser.username
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  const users = readUsers();
  const user = users.find(user => user.username === username && user.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  // Update request count
  user.requestCount = (user.requestCount || 0) + 1;
  user.lastLogin = new Date().toISOString();
  writeUsers(users);
  
  res.json({ 
    success: true,
    message: 'Login successful', 
    apikey: user.apikey,
    username: user.username,
    requestCount: user.requestCount
  });
});

// Global JSON Response Wrapper
app.use((req, res, next) => {
  global.totalreq += 1;

  const originalJson = res.json;
  res.json = function (data) {
    if (
      typeof data === 'object' &&
      req.path !== '/endpoints' &&
      req.path !== '/set' &&
      !req.path.startsWith('/api/login') &&
      !req.path.startsWith('/api/register')
    ) {
      return originalJson.call(this, {
        creator: settings.creatorName || "Created Using AldiXDCodeX",
        ...data
      });
    }
    return originalJson.call(this, data);
  };

  next();
});

app.get('/set', (req, res) => res.json(settings));

// Dynamic route loader with sorted categories and endpoints
let totalRoutes = 0;
let rawEndpoints = {};
const apiFolder = path.join(__dirname, 'api');

// Function to load API routes
function loadAPIRoutes() {
  if (!fs.existsSync(apiFolder)) {
    console.log(chalk.bgRed.white(` ❌ API folder not found: ${apiFolder}`));
    return;
  }
  
  fs.readdirSync(apiFolder).forEach(file => {
    const fullPath = path.join(apiFolder, file);
    if (file.endsWith('.js')) {
      try {
        // Clear require cache to ensure fresh module
        delete require.cache[require.resolve(fullPath)];
        const routes = require(fullPath);
        const handlers = Array.isArray(routes) ? routes : [routes];

        handlers.forEach(route => {
          const { name, desc, category, path: routePath, run } = route;

          if (name && desc && category && routePath && typeof run === 'function') {
            const cleanPath = routePath.split('?')[0];
            
            // Apply authentication middleware to all API routes
            app.get(cleanPath, run);

            if (!rawEndpoints[category]) rawEndpoints[category] = [];
            rawEndpoints[category].push({ name, desc, path: routePath });

            totalRoutes++;
            console.log(chalk.hex('#55efc4')(`✔ Loaded: `) + chalk.hex('#ffeaa7')(`${cleanPath} (${file})`));
          } else {
            console.warn(chalk.bgRed.white(` ⚠ Skipped invalid route in ${file}`));
          }
        });

      } catch (err) {
        console.error(chalk.bgRed.white(` ❌ Error in ${file}: ${err.message}`));
      }
    }
  });
}

loadAPIRoutes();

const endpoints = Object.keys(rawEndpoints)
  .sort((a, b) => a.localeCompare(b))
  .reduce((sorted, category) => {
    sorted[category] = rawEndpoints[category].sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, {});

app.get('/endpoints', (req, res) => {
  res.json(endpoints);
});

app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'index.html'));
  } catch (err) {
    console.log(err);
    res.status(500).send('Error loading page');
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(chalk.bgGreen.black(` 🚀 Server is running on port ${PORT} `));
  console.log(chalk.bgCyan.black(` 📦 Total Routes Loaded: ${totalRoutes} `));
  console.log(chalk.hex('#ffeaa7')(` 📁 Users file: ${usersFilePath}`));
});

module.exports = app;
