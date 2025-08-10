const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const CONFIG = {
    API_KEY: "aldixdcodex", // Change this to your secret API key
    DEFAULT_LIMITS: {
        disk: 1024, // 1GB disk
        swap: 0,
        io: 500,
        cpu: 0, // Unlimited CPU
        databases: 0,
        backups: 0
    }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create user endpoint
app.get('/createuser', async (req, res) => {
    try {
        // Validate API key
        if (req.query.apikey !== CONFIG.API_KEY) {
            return res.json({
                status: "false",
                creator: "AldiXDHOST"
            });
        }

        // Extract and validate parameters
        const requiredParams = [
            'username', 'password', 'ram', 
            'nestid', 'locid', 'eggid', 
            'domain', 'ptla'
        ];
        
        for (const param of requiredParams) {
            if (!req.query[param]) {
                return res.json({
                    status: "false",
                    creator: "AldiXDHOST",
                    message: `Missing parameter: ${param}`
                });
            }
        }

        const {
            username, password, ram,
            nestid, locid, eggid,
            domain, ptla
        } = req.query;

        // Convert RAM to number (0 for unlimited)
        const memoryLimit = parseInt(ram) === 0 ? -1 : parseInt(ram);

        // Pterodactyl API configuration
        const pterodactylConfig = {
            url: `https://${domain}`,
            apiKey: ptla
        };

        // 1. First create the user account
        const userResponse = await axios.post(
            `${pterodactylConfig.url}/api/application/users`,
            {
                username: username,
                email: `${username}@${domain}`,
                first_name: username,
                last_name: "User",
                password: password
            },
            {
                headers: {
                    'Authorization': `Bearer ${pterodactylConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const userId = userResponse.data.attributes.id;

        // 2. Create the server for the user
        const serverData = {
            name: `${username}-server`,
            user: userId,
            egg: parseInt(eggid),
            docker_image: "quay.io/pterodactyl/core:java",
            startup: "",
            environment: {},
            limits: {
                ...CONFIG.DEFAULT_LIMITS,
                memory: memoryLimit
            },
            allocation: {
                default: parseInt(locid)
            }
        };

        await axios.post(
            `${pterodactylConfig.url}/api/application/servers`,
            serverData,
            {
                headers: {
                    'Authorization': `Bearer ${pterodactylConfig.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Prepare success response
        const responseData = {
            status: "true",
            creator: "AldiXDHOST",
            username: username,
            password: password,
            ram: memoryLimit === -1 ? "0" : `${ram}GB`,
            cpu: "0",
            panel_url: `https://${domain}`,
            login_url: `https://${domain}/auth/login`
        };

        res.json(responseData);

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.json({
            status: "false",
            creator: "AldiXDHOST",
            message: error.response?.data?.errors?.[0]?.detail || "Failed to create account"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Pterodactyl Account Creator API running on port ${PORT}`);
    console.log(`Example endpoint: http://localhost:${PORT}/createuser?apikey=${CONFIG.API_KEY}&username=test&password=test123&ram=1&nestid=1&locid=1&eggid=1&domain=panel.example.com&ptla=ptla_yourkey`);
});
