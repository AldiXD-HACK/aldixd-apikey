const fetch = require('node-fetch');

module.exports = {
  name: "IP Lookup",
  desc: "Mendapatkan informasi lokasi dan detail berdasarkan alamat IP",
  category: "Tools",
  path: "/ip/lookup?apikey=&ip=",

  async run(req, res) {
    const { apikey, ip } = req.query;

    // Validasi API key
    if (!apikey || !global.apikey?.includes(apikey)) {
      return res.json({ status: false, error: "Invalid API key" });
    }

    // Tentukan IP target
    const targetIp = ip || req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      '8.8.8.8';

    const cleanIp = targetIp.replace(/^::ffff:/, '');

    try {
      // Request ke ipwho.is
      const response = await fetch(`https://ipwho.is/${cleanIp}`);
      if (!response.ok) {
        throw new Error(`IP Lookup service error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        return res.json({
          status: false,
          error: data.message || "IP lookup failed"
        });
      }

      // Format respons
      const result = {
        ip: data.ip,
        type: data.type,
        continent: data.continent,
        country: data.country,
        country_code: data.country_code,
        region: data.region,
        city: data.city,
        postal: data.postal,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone?.id,
        utc_offset: data.timezone?.utc,
        isp: data.connection?.isp,
        org: data.connection?.org,
        asn: data.connection?.asn,
      };

      return res.json({ status: true, result });

    } catch (err) {
      console.error("IP Lookup Error:", err);
      return res.status(500).json({
        status: false,
        error: err.message || "Failed to fetch IP information"
      });
    }
  }
};
