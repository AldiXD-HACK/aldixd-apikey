const fetch = require('node-fetch');

// Kunci API untuk layanan ipapi (opsional, untuk meningkatkan limit)
const IPAPI_KEY = process.env.IPAPI_KEY || '';

module.exports = {
  name: "IP Lookup",
  desc: "Mendapatkan informasi geolokasi berdasarkan alamat IP",
  category: "Tools",
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
      const response = await fetch(`http://api.ipapi.com/api/${cleanIp}?access_key=${IPAPI_KEY}&fields=main,location,time_zone,currency,connection,security`);
      
      if (!response.ok) {
        throw new Error(`IP lookup service responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Jika ada error dari layanan ipapi
      if (data.error) {
        return res.json({ 
          status: false, 
          error: data.error.info || "IP lookup failed" 
        });
      }
      
      // Format respons
      const result = {
        ip: data.ip,
        type: data.type,
        continent: data.continent_name,
        country: data.country_name,
        country_code: data.country_code,
        region: data.region_name,
        city: data.city,
        zip: data.zip,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.time_zone?.id,
        utc_offset: data.time_zone?.offset,
        currency: data.currency?.code,
        isp: data.connection?.isp,
        asn: data.connection?.asn,
        proxy: data.security?.is_proxy,
        crawler: data.security?.is_crawler,
        threat_level: data.security?.threat_level
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
