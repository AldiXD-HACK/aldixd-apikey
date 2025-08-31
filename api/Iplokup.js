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
      '8.8.8.8'; // fallback Google DNS

    // Bersihkan IPv6 prefix (::ffff:)
    const cleanIp = targetIp.replace(/^::ffff:/, '');

    try {
      // Request ke ipapi.co
      const response = await fetch(`https://ipapi.co/${cleanIp}/json/`);
      if (!response.ok) {
        throw new Error(`IP Lookup service error: ${response.status}`);
      }

      const data = await response.json();

      // Kalau API balikin error
      if (data.error) {
        return res.json({
          status: false,
          error: data.reason || "IP lookup failed"
        });
      }

      // Format hasil biar rapi
      const result = {
        ip: data.ip,
        version: data.version,
        city: data.city,
        region: data.region,
        country: data.country_name,
        country_code: data.country,
        continent_code: data.continent_code,
        in_eu: data.in_eu,
        postal: data.postal,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        utc_offset: data.utc_offset,
        country_calling_code: data.country_calling_code,
        currency: data.currency,
        languages: data.languages,
        asn: data.asn,
        org: data.org,
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
