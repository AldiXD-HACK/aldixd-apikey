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
};
