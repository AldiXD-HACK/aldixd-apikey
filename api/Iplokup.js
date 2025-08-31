const fetch = require('node-fetch');

module.exports = {
  name: "IP Lookup",
  desc: "Untuk Mendapatkan Informasi Geolokasi Lewat Ip",
  category: "Toola",
  path: "/ip/lookup?apikey=&ip=",
  
  async run(req, res) {
    const { apikey, ip } = req.query;
    
    // Validasi API key
    if (!apikey || !global.apikey?.includes(apikey)) {
      return res.json({ status: false, error: "Invalid API key" });
    }
    
    // Gunakan IP dari query parameter atau dari request
    const targetIp = ip || req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     req.ip ||
                     '8.8.8.8'; // Default fallback
    
    // Bersihkan IP (menghapus prefix IPv6 jika ada)
    const cleanIp = targetIp.replace(/^::ffff:/, '');

    try {
      // Gunakan layanan ipapi.co untuk lookup IP
      const response = await fetch(`https://ipapi.co/${cleanIp}/json/`);
      
      if (!response.ok) {
        throw new Error(`IP lookup service responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Jika ada error dari layanan ipapi.co
      if (data.error) {
        return res.json({ 
          status: false, 
          error: data.reason || "IP lookup failed" 
        });
      }
      
      // Format respons
      const result = {
        ip: data.ip,
        version: data.version,
        city: data.city,
        region: data.region,
        region_code: data.region_code,
        country: data.country_name,
        country_code: data.country_code,
        country_capital: data.country_capital,
        country_tld: data.country_tld,
        continent_code: data.continent_code,
        in_eu: data.in_eu,
        postal: data.postal,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        utc_offset: data.utc_offset,
        country_calling_code: data.country_calling_code,
        currency: data.currency,
        currency_name: data.currency_name,
        languages: data.languages,
        country_area: data.country_area,
        country_population: data.country_population,
        asn: data.asn,
        org: data.org
      };
      
      res.json({ status: true, result });
      
    } catch (err) {
      console.error("IP Lookup Error:", err);
      res.status(500).json({ 
        status: false, 
        error: err.message || "Failed to fetch IP information" 
      });
    }
  }
};
