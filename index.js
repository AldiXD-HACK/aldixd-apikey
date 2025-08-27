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

// Static files
app.use('/', express.static(path.join(__dirname, '/')));
app.use('/api', express.static(path.join(__dirname, '/api')));

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

// User management functions
const usersFile = path.join(__dirname, 'users.json');

// Ensure users.json exists
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]));
}

const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users:', error);
    return false;
  }
};

// Generate random API key
const generateApiKey = () => {
  return Math.random().toString(36).substring(2) + 
         Math.random().toString(36).substring(2) + 
         Math.random().toString(36).substring(2);
};

// Auth endpoints
app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  const users = readUsers();
  
  // Check if user already exists
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  // Create new user
  const apiKey = generateApiKey();
  const newUser = {
    id: Date.now().toString(),
    username,
    password, // In production, you should hash the password!
    apikey: apiKey,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  if (writeUsers(users)) {
    // Update .env file with new API key
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Remove existing APIKEY if it exists
      envContent = envContent.replace(/APIKEY=.*\n/, '');
    }
    
    // Add all API keys to the environment
    const allApiKeys = users.map(user => user.apikey);
    envContent += `APIKEY=["${allApiKeys.join('", "')}"]\n`;
    
    fs.writeFileSync(envPath, envContent);
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ 
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } else {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      message: 'Login successful',
      user: userWithoutPassword
    });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Middleware to verify API key
const verifyApiKey = (req, res, next) => {
  const apiKey = req.query.apikey || req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }
  
  const users = readUsers();
  const user = users.find(u => u.apikey === apiKey);
  
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ error: 'Invalid API key' });
  }
};

// Global JSON Response Wrapper
app.use((req, res, next) => {
  global.totalreq += 1;
  
  const originalJson = res.json;
  res.json = function (data) {
    if (typeof data === 'object' && req.path !== '/endpoints' && req.path !== '/set') {
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

fs.readdirSync(apiFolder).forEach(file => {
  const fullPath = path.join(apiFolder, file);
  if (file.endsWith('.js')) {
    try {
      const routes = require(fullPath);
      const handlers = Array.isArray(routes) ? routes : [routes];
      
      handlers.forEach(route => {
        if (route.path && route.name) {
          const category = route.category || "Uncategorized";
          if (!rawEndpoints[category]) {
            rawEndpoints[category] = [];
          }
          rawEndpoints[category].push({
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
});

module.exports = app;
