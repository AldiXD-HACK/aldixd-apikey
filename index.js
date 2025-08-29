const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Firebase configuration
const { db } = require('./firebase-config');

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

// Generate random API key
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Firebase User Management Functions
async function getUserByUsername(username) {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).get();
    
    if (snapshot.empty) {
      return null;
    }
    
    let user = null;
    snapshot.forEach(doc => {
      user = { id: doc.id, ...doc.data() };
    });
    
    return user;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
}

async function getUserByApiKey(apiKey) {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('apikey', '==', apiKey).get();
    
    if (snapshot.empty) {
      return null;
    }
    
    let user = null;
    snapshot.forEach(doc => {
      user = { id: doc.id, ...doc.data() };
    });
    
    return user;
  } catch (error) {
    console.error('Error getting user by API key:', error);
    throw error;
  }
}

async function createUser(userData) {
  try {
    const usersRef = db.collection('users');
    const docRef = await usersRef.add(userData);
    return { id: docRef.id, ...userData };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function updateUser(userId, updateData) {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
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
  
  // Check API key against Firebase
  getUserByApiKey(apiKey)
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Invalid API key. Please check your API key or register again.' });
      }
      
      req.user = user;
      next();
    })
    .catch(error => {
      console.error('Authentication error:', error);
      res.status(500).json({ error: 'Internal server error during authentication' });
    });
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

app.post('/api/register', async (req, res) => {
  try {
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
    
    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Create new user
    const newUser = {
      username,
      password, // Note: In production, you should hash passwords
      apikey: generateApiKey(),
      createdAt: new Date().toISOString(),
      requestCount: 0
    };
    
    const createdUser = await createUser(newUser);
    
    res.json({ 
      success: true,
      message: 'User registered successfully', 
      apikey: createdUser.apikey,
      username: createdUser.username
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = await getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Update request count and last login
    await updateUser(user.id, {
      requestCount: (user.requestCount || 0) + 1,
      lastLogin: new Date().toISOString()
    });
    
    res.json({ 
      success: true,
      message: 'Login successful', 
      apikey: user.apikey,
      username: user.username,
      requestCount: user.requestCount + 1
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
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

module.exports = app;
