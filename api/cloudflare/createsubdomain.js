const fetch = require('node-fetch');

module.exports = function (app) {

  // CREATE SUBDOMAIN WEBP
  app.get('/cloudflare/createsubdomainwebp', async (req, res) => {
    const { zoneid, apikeycf, domain, nama, ip } = req.query;

    if (!zoneid || !apikeycf || !domain || !nama || !ip) {
      return res.status(400).json({
        status: false,
        error: 'Wajib Isi: zoneid, apikeycf, domain, nama, ip'
      });
    }

    const headers = {
      "Authorization": `Bearer ${apikeycf}`,
      "Content-Type": "application/json",
      "X-Auth-Email": domain // Using domain as email (adjust if needed)
    };

    const payload = {
      type: "A",
      name: nama, // subdomain name
      content: ip,
      ttl: 1,
      proxied: true
    };

    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneid}/dns_records`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const json = await response.json();

      if (!json.success) {
        return res.status(500).json({
          status: false,
          error: "Gagal membuat subdomain",
          detail: json.errors
        });
      }

      return res.status(200).json({
        status: true,
        message: "✅ Subdomain berhasil dibuat",
        subdomain: `${json.result.name}.${domain}`,
        dns_id: json.result.id,
        record_type: json.result.type,
        proxied: json.result.proxied
      });

    } catch (err) {
      return res.status(500).json({
        status: false,
        error: "❌ Terjadi kesalahan saat request ke Cloudflare",
        detail: err.message
      });
    }
  });
  //CREATE SUBDOMAIN PANEL
  app.get('/cloudflare/createsubdomainpanel', async (req, res) => {
    const { zoneid, apikeycf, domain, nama, ip } = req.query;

    if (!zoneid || !apikeycf || !domain || !nama || !ip) {
      return res.status(400).json({
        status: false,
        error: 'Wajib Isi: zoneid, apikeycf, domain, nama, ip'
      });
    }

    const headers = {
      "Authorization": `Bearer ${apikeycf}`,
      "Content-Type": "application/json",
      "X-Auth-Email": domain // Using domain as email (adjust if needed)
    };

    const payload = {
      type: "A",
      name: nama, // subdomain name
      content: ip,
      ttl: 1,
      proxied: false
    };

    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneid}/dns_records`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const json = await response.json();

      if (!json.success) {
        return res.status(500).json({
          status: false,
          error: "Gagal membuat subdomain",
          detail: json.errors
        });
      }

      return res.status(200).json({
        status: true,
        message: "✅ Subdomain berhasil dibuat",
        subdomain: `${json.result.name}.${domain}`,
        dns_id: json.result.id,
        record_type: json.result.type,
        proxied: json.result.proxied
      });

    } catch (err) {
      return res.status(500).json({
        status: false,
        error: "❌ Terjadi kesalahan saat request ke Cloudflare",
        detail: err.message
      });
    }
  });
  
  app.get('/cloudflare/create', async (req, res) => {
    const { zoneid, apikeycf, domain, type, name, content, proxied, ttl } = req.query;

    // Validate required parameters
    if (!zoneid || !apikeycf || !domain || !type || !name || !content) {
      return res.status(400).json({
        status: false,
        error: 'isi yg bener: zoneid, apikeycf, domain, type, name, content',
        example: '/cloudflare/create?zoneid=...&apikeycf=...&domain=example.com&type=A&name=test&content=192.168.1.1&proxied=true&ttl=1'
      });
    }

    const headers = {
      "Authorization": `Bearer ${apikeycf}`,
      "Content-Type": "application/json",
      "X-Auth-Email": domain.includes('@') ? domain : `admin@${domain}` // Auto-generate email if not provided
    };

    const payload = {
      type: type.toUpperCase(), // A, AAAA, CNAME, MX, TXT, etc
      name,
      content,
      ttl: ttl || 1, // Default to auto TTL
      proxied: proxied === 'true' // Convert string to boolean
    };

    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneid}/dns_records`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!data.success) {
        return res.status(400).json({
          status: false,
          error: "Cloudflare API Error",
          details: data.errors
        });
      }

      res.status(200).json({
        status: true,
        message: `✅ Record created successfully`,
        record: {
          id: data.result.id,
          type: data.result.type,
          name: data.result.name,
          content: data.result.content,
          proxied: data.result.proxied,
          created: data.result.created_on
        }
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        error: "Server Error",
        details: err.message
      });
    }
  });

  // DELETE SUBDOMAIN
  app.get('/cloudflare/delete', async (req, res) => {
    const { zoneid, apikeycf, domain, recordid } = req.query;

    if (!zoneid || !apikeycf || !domain || !recordid) {
      return res.status(400).json({
        status: false,
        error: 'Contoh nya: zoneid, apikeycf, domain, recordid'
      });
    }

    const headers = {
      "Authorization": `Bearer ${apikeycf}`,
      "Content-Type": "application/json",
      "X-Auth-Email": domain.includes('@') ? domain : `admin@${domain}`
    };

    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneid}/dns_records/${recordid}`, {
        method: "DELETE",
        headers
      });

      const data = await response.json();

      if (!data.success) {
        return res.status(400).json({
          status: false,
          error: "Cloudflare API Error",
          details: data.errors
        });
      }

      res.status(200).json({
        status: true,
        message: `✅ Record deleted successfully`,
        deleted_id: recordid
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        error: "Server Error",
        details: err.message
      });
    }
  });
};
