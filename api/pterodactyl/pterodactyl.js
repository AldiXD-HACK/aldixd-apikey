const fetch = require('node-fetch');

module.exports = function (app) {

  // CREATE ADMIN
  app.get('/pterodactyl/createadmin', async (req, res) => {
    const { username, domain, ptla } = req.query;

    if (!username || !domain || !ptla) {
      return res.status(400).json({
        status: false,
        error: 'Parameter tidak lengkap. Harus ada: username, domain, ptla'
      });
    }

    const email = `${username.toLowerCase()}@gmail.com`;
    const password = `${username.toLowerCase()}001`;

    const headers = {
      "Authorization": `Bearer ${ptla}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    const payload = {
      email,
      username: username.toLowerCase(),
      first_name: username,
      last_name: "Admin",
      password,
      language: "en",
      root_admin: true
    };

    try {
      const response = await fetch(`${domain}/api/application/users`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const json = await response.json();

      if (!json?.attributes?.id) {
        return res.status(500).json({
          status: false,
          error: "Gagal membuat admin",
          detail: json
        });
      }

      return res.status(200).json({
        status: true,
        message: "✅ Admin berhasil dibuat",
        panel: domain,
        email,
        username,
        password,
        admin_id: json.attributes.id
      });

    } catch (err) {
      return res.status(500).json({
        status: false,
        error: "❌ Terjadi kesalahan saat request",
        detail: err.message
      });
    }
  });

  // CREATE SERVER
  app.get('/pterodactyl/create', async (req, res) => {
    const { username, ram, eggid, nestid, loc, domain, ptla } = req.query;

    if (!username || !ram || !eggid || !nestid || !loc || !domain || !ptla) {
      return res.status(400).json({
        status: false,
        error: "Parameter tidak lengkap. Wajib: username, ram, eggid, nestid, loc, domain, ptla"
      });
    }

    const ramMapping = {
      "1024": { ram: "1000", disk: "1000", cpu: "40" },
      "2048": { ram: "2000", disk: "1000", cpu: "60" },
      "3072": { ram: "3000", disk: "2000", cpu: "80" },
      "4096": { ram: "4000", disk: "2000", cpu: "100" },
      "5120": { ram: "5000", disk: "3000", cpu: "120" },
      "6144": { ram: "6000", disk: "3000", cpu: "140" },
      "7168": { ram: "7000", disk: "4000", cpu: "160" },
      "8192": { ram: "8000", disk: "4000", cpu: "180" },
      "9216": { ram: "9000", disk: "5000", cpu: "200" },
      "10240": { ram: "10000", disk: "5000", cpu: "220" },
      "0": { ram: "0", disk: "0", cpu: "0" }
    };

    const spec = ramMapping[ram];
    if (!spec) {
      return res.status(400).json({ status: false, error: "RAM tidak valid" });
    }

    const email = `${username.toLowerCase()}@gmail.com`;
    const password = `${username.toLowerCase()}001`;
    const name = `${username.charAt(0).toUpperCase() + username.slice(1)} Server`;

    const headers = {
      Authorization: `Bearer ${ptla}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    try {
      const checkAuth = await fetch(`${domain}/api/application/users`, { headers });
      if (checkAuth.status === 401) {
        return res.status(401).json({ status: false, error: "Token Pterodactyl tidak valid atau expired (401)" });
      }

      const userPayload = {
        email,
        username: username.toLowerCase(),
        first_name: username,
        last_name: "AldiXDCodeX",
        password,
        language: "en"
      };

      const userRes = await fetch(`${domain}/api/application/users`, {
        method: "POST",
        headers,
        body: JSON.stringify(userPayload)
      });

      const userJson = await userRes.json();
      if (!userRes.ok || !userJson?.attributes?.id) {
        return res.status(500).json({ status: false, error: "Gagal membuat user", detail: userJson });
      }

      const userId = userJson.attributes.id;

      const eggRes = await fetch(`${domain}/api/application/nests/${nestid}/eggs/${eggid}`, { headers });
      const eggJson = await eggRes.json();

      if (!eggRes.ok || !eggJson?.attributes) {
        return res.status(500).json({ status: false, error: "Gagal mengambil data egg", detail: eggJson });
      }

      const startup = eggJson.attributes.startup || "npm start";
      const docker = eggJson.attributes.docker_image || "ghcr.io/parkervcp/yolks:nodejs_21";

      const serverPayload = {
        name,
        user: userId,
        egg: parseInt(eggid),
        docker_image: docker,
        startup,
        limits: {
          memory: parseInt(spec.ram),
          swap: 0,
          disk: parseInt(spec.disk),
          io: 500,
          cpu: parseInt(spec.cpu)
        },
        feature_limits: {
          databases: 2,
          backups: 2,
          allocations: 1
        },
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start"
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: []
        },
        start_on_completion: true
      };

      const serverRes = await fetch(`${domain}/api/application/servers`, {
        method: "POST",
        headers,
        body: JSON.stringify(serverPayload)
      });

      const serverJson = await serverRes.json();
      if (!serverRes.ok || !serverJson?.attributes?.id) {
        return res.status(500).json({ status: false, error: "Gagal membuat server", detail: serverJson });
      }

      return res.status(200).json({
        status: true,
        message: "✅ Server berhasil dibuat!",
        panel: domain,
        user: username,
        pass: password,
        server_id: serverJson.attributes.id
      });

    } catch (err) {
      return res.status(500).json({ status: false, error: "❌ Terjadi kesalahan saat memproses", detail: err.message });
    }
  });

  // DELETE SERVER
  app.get('/pterodactyl/deleteserver', async (req, res) => {
    const { idserver, domain, ptla } = req.query;

    if (!idserver || !domain || !ptla) {
      return res.status(400).json({ 
        status: false, 
        error: 'Parameter tidak lengkap. Wajib: idserver, domain, ptla' 
      });
    }

    const headers = {
      "Authorization": `Bearer ${ptla}`,
      "Accept": "application/json"
    };

    try {
      const response = await fetch(`${domain}/api/application/servers/${idserver}`, {
        method: "DELETE",
        headers,
        timeout: 10000
      });

      if (response.status === 204) {
        return res.status(200).json({
          status: true,
          message: `✅ Server dengan ID ${idserver} berhasil dihapus.`
        });
      }

      const errorText = await response.text();
      return res.status(response.status).json({
        status: false,
        error: "Gagal menghapus server",
        detail: errorText || `Status: ${response.status}`
      });

    } catch (err) {
      return res.status(500).json({
        status: false,
        error: "❌ Terjadi kesalahan saat menghapus server",
        detail: err.message
      });
    }
  });

  // LIST ALL SERVERS
  app.get('/pterodactyl/listservers', async (req, res) => {
    const { domain, ptla } = req.query;

    if (!domain || !ptla) {
      return res.status(400).json({
        status: false,
        error: 'Parameter tidak lengkap. Wajib: domain, ptla'
      });
    }

    const headers = {
      "Authorization": `Bearer ${ptla}`,
      "Accept": "application/json"
    };

    try {
      const response = await fetch(`${domain}/api/application/servers`, {
        method: "GET",
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          status: false,
          error: "Gagal mengambil daftar server",
          detail: errorText || `Status: ${response.status}`
        });
      }

      const data = await response.json();
      const servers = data.data.map(server => ({
        id: server.attributes.id,
        uuid: server.attributes.uuid,
        name: server.attributes.name,
        description: server.attributes.description,
        status: server.attributes.status,
        owner_id: server.attributes.user,
        node_id: server.attributes.node,
        memory: server.attributes.limits.memory,
        disk: server.attributes.limits.disk,
        created_at: server.attributes.created_at
      }));

      return res.status(200).json({
        status: true,
        total_servers: servers.length,
        servers
      });

    } catch (err) {
      return res.status(500).json({
        status: false,
        error: "❌ Terjadi kesalahan saat mengambil daftar server",
        detail: err.message
      });
    }
  });

  // DELETE USER
  app.get('/pterodactyl/deleteuser', async (req, res) => {
    const { user_id, domain, ptla } = req.query;

    if (!user_id || !domain || !ptla) {
      return res.status(400).json({
        status: false,
        error: 'Parameter tidak lengkap. Wajib: user_id, domain, ptla'
      });
    }

    const headers = {
      "Authorization": `Bearer ${ptla}`,
      "Accept": "application/json"
    };

    try {
      // First, get all servers owned by this user
      const serversResponse = await fetch(`${domain}/api/application/servers?filter[user_id]=${user_id}`, {
        method: "GET",
        headers
      });

      if (!serversResponse.ok) {
        const errorText = await serversResponse.text();
        return res.status(serversResponse.status).json({
          status: false,
          error: "Gagal mengambil daftar server user",
          detail: errorText || `Status: ${serversResponse.status}`
        });
      }

      const serversData = await serversResponse.json();
      
      // Delete all servers owned by this user
      for (const server of serversData.data) {
        await fetch(`${domain}/api/application/servers/${server.attributes.id}`, {
          method: "DELETE",
          headers
        });
      }

      // Then delete the user
      const userResponse = await fetch(`${domain}/api/application/users/${user_id}`, {
        method: "DELETE",
        headers
      });

      if (userResponse.status === 204) {
        return res.status(200).json({
          status: true,
          message: `✅ User dengan ID ${user_id} dan semua server terkait berhasil dihapus.`,
          deleted_servers: serversData.data.length
        });
      }

      const errorText = await userResponse.text();
      return res.status(userResponse.status).json({
        status: false,
        error: "Gagal menghapus user",
        detail: errorText || `Status: ${userResponse.status}`
      });

    } catch (err) {
      return res.status(500).json({
        status: false,
        error: "❌ Terjadi kesalahan saat menghapus user",
        detail: err.message
      });
    }
  });

  // DELETE ALL SERVERS
  app.get('/pterodactyl/deleteallservers', async (req, res) => {
    const { domain, ptla } = req.query;

    if (!domain || !ptla) {
      return res.status(400).json({
        status: false,
        error: 'Parameter tidak lengkap. Wajib: domain, ptla'
      });
    }

    const headers = {
      "Authorization": `Bearer ${ptla}`,
      "Accept": "application/json"
    };

    try {
      // Get all servers
      const serversResponse = await fetch(`${domain}/api/application/servers`, {
        method: "GET",
        headers
      });

      if (!serversResponse.ok) {
        const errorText = await serversResponse.text();
        return res.status(serversResponse.status).json({
          status: false,
          error: "Gagal mengambil daftar server",
          detail: errorText || `Status: ${serversResponse.status}`
        });
      }

      const serversData = await serversResponse.json();
      const serverIds = serversData.data.map(server => server.attributes.id);
      
      // Delete all servers
      let deletedCount = 0;
      for (const serverId of serverIds) {
        const deleteResponse = await fetch(`${domain}/api/application/servers/${serverId}`, {
          method: "DELETE",
          headers
        });
        
        if (deleteResponse.status === 204) {
          deletedCount++;
        }
      }

      return res.status(200).json({
        status: true,
        message: `✅ Berhasil menghapus ${deletedCount} dari ${serverIds.length} server.`,
        total_servers: serverIds.length,
        deleted_servers: deletedCount
      });

    } catch (err) {
      return res.status(500).json({
        status: false,
        error: "❌ Terjadi kesalahan saat menghapus semua server",
        detail: err.message
      });
    }
  });
};
