const fetch = require('node-fetch');

module.exports = [
  {
    name: "Create Subdomain WebP",
    desc: "Create Cloudflare Subdomain with Proxy Enabled (WebP)",
    category: "Cloudflare",
    path: "/cloudflare/createsubdomainwebp?zoneid=&apikeycf=&domain=&nama=&ip=",
    async run(req, res) {
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
        "X-Auth-Email": domain
      };

      const payload = {
        type: "A",
        name: nama,
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
    }
  },
  {
    name: "Create Subdomain Panel",
    desc: "Create Cloudflare Subdomain without Proxy (Panel)",
    category: "Cloudflare",
    path: "/cloudflare/createsubdomainpanel?zoneid=&apikeycf=&domain=&nama=&ip=",
    async run(req, res) {
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
        "X-Auth-Email": domain
      };

      const payload = {
        type: "A",
        name: nama,
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
    }
  },
  {
    name: "Create DNS Record",
    desc: "Create Custom DNS Record in Cloudflare",
    category: "Cloudflare",
    path: "/cloudflare/create?zoneid=&apikeycf=&domain=&type=&name=&content=&proxied=&ttl=",
    async run(req, res) {
      const { zoneid, apikeycf, domain, type, name, content, proxied, ttl } = req.query;

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
        "X-Auth-Email": domain.includes('@') ? domain : `admin@${domain}`
      };

      const payload = {
        type: type.toUpperCase(),
        name,
        content,
        ttl: ttl || 1,
        proxied: proxied === 'true'
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
    }
  },
  {
    name: "Delete DNS Record",
    desc: "Delete DNS Record from Cloudflare",
    category: "Cloudflare",
    path: "/cloudflare/delete?zoneid=&apikeycf=&domain=&recordid=",
    async run(req, res) {
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
    }
  },
  {
    name: "List Subdomains",
    desc: "List All DNS Records/Subdomains in Cloudflare",
    category: "Cloudflare",
    path: "/cloudflare/listsubdomains?zoneid=&apikeycf=&domain=",
    async run(req, res) {
      const { zoneid, apikeycf, domain } = req.query;

      if (!zoneid || !apikeycf || !domain) {
        return res.status(400).json({
          status: false,
          error: 'Parameter wajib: zoneid, apikeycf, domain'
        });
      }

      const headers = {
        "Authorization": `Bearer ${apikeycf}`,
        "Content-Type": "application/json",
        "X-Auth-Email": domain.includes('@') ? domain : `admin@${domain}`
      };

      try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneid}/dns_records`, {
          method: "GET",
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

        // Filter hanya record A dan CNAME untuk subdomain
        const subdomains = data.result.filter(record => 
          record.type === 'A' || record.type === 'CNAME'
        ).map(record => ({
          id: record.id,
          type: record.type,
          name: record.name,
          content: record.content,
          proxied: record.proxied,
          created: record.created_on,
          modified: record.modified_on
        }));

        res.status(200).json({
          status: true,
          message: `✅ Found ${subdomains.length} subdomains`,
          total: subdomains.length,
          subdomains
        });

      } catch (err) {
        res.status(500).json({
          status: false,
          error: "Server Error",
          details: err.message
        });
      }
    }
  }
];
