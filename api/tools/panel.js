const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Your secret API key (change this to your own)
const SECRET_API_KEY = "aldixdcodex";

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create user endpoint
app.get('/createuser', async (req, res) => {
    try {
        // Validate API key
        if (req.query.apikey !== SECRET_API_KEY) {
            return res.json({
                status: "false",
                creator: "AldiXDHOST"
            });
        }

        // Extract parameters from query
        const { 
            username, 
            password,
            ram,
            nestid,
            locid,
            eggid,
            domain,
            ptla
        } = req.query;

        // Validate required parameters
        if (!username || !password || !ram || !nestid || !locid || !eggid || !domain || !ptla) {
            return res.json({
                status: "false",
                creator: "AldiXDHOST"
            });
        }

        // Pterodactyl API configuration
        const PTERODACTYL_URL = `https://${domain}`;
        const PTERODACTYL_API_KEY = ptla;

        // Prepare server creation data
        const serverData = {
            name: username,
            user: 1, // This should be the ID of the user you want to assign the server to
            egg: parseInt(eggid),
            docker_image: "quay.io/pterodactyl/core:java",
            startup: "",
            environment: {},
            limits: {
                memory: parseInt(ram) === 0 ? -1 : parseInt(ram),
                swap: 0,
                disk: 1024,
                io: 500,
                cpu: 0 // 0 means unlimited
            },
            feature_limits: {
                databases: 0,
                backups: 0
            },
            allocation: {
                default: parseInt(locid)
            }
        };

        // Create server in Pterodactyl
        const response = await axios.post(
            `${PTERODACTYL_URL}/api/application/servers`,
            serverData,
            {
                headers: {
                    'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        // Prepare response
        const responseData = {
            status: "true",
            creator: "AldiXDHOST",
            username: username,
            password: password,
            ram: parseInt(ram) === 0 ? "0" : `${ram}GB`,
            cpu: "0"
        };

        res.json(responseData);

    } catch (error) {
        console.error("Error creating user:", error);
        res.json({
            status: "false",
            creator: "AldiXDHOST"
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
