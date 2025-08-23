const axios = require('axios');

// OrderKuota API Configuration
const OrderKuota = {
  API_URL: 'https://app.orderkuota.com:443/api/v2',
  HOST: 'app.orderkuota.com',
  USER_AGENT: 'okhttp/4.10.0',
  APP_VERSION_NAME: '25.03.14',
  APP_VERSION_CODE: '250314',
  APP_REG_ID: 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ'
};

// Class OrderKuota untuk menangani operasi OrderKuota
class OrderKuotaClient {
  constructor(username, token) {
    this.username = username;
    this.token = token;
  }

  // Method untuk mendapatkan transaksi QRIS
  async getTransactionQris() {
    try {
      // Prepare form data
      const formData = new URLSearchParams();
      formData.append('auth_token', this.token);
      formData.append('auth_username', this.username);
      formData.append('requests[qris_history][jumlah]', '');
      formData.append('requests[qris_history][jenis]', '');
      formData.append('requests[qris_history][page]', '1');
      formData.append('requests[qris_history][dari_tanggal]', '');
      formData.append('requests[qris_history][ke_tanggal]', '');
      formData.append('requests[qris_history][keterangan]', '');
      formData.append('requests[0]', 'account');
      formData.append('app_version_name', OrderKuota.APP_VERSION_NAME);
      formData.append('app_version_code', OrderKuota.APP_VERSION_CODE);
      formData.append('app_reg_id', OrderKuota.APP_REG_ID);

      // Prepare headers
      const headers = {
        'Host': OrderKuota.HOST,
        'User-Agent': OrderKuota.USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      };

      // Make API request
      const response = await axios.post(`${OrderKuota.API_URL}/get`, formData.toString(), {
        headers,
        timeout: 10000
      });

      return response.data;

    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }
}

module.exports = function (app) {
  // Simpan API keys yang valid (dalam produksi, simpan di database atau environment variables)
  const validApiKeys = new Set([
    'codex',
    'your-api-key-2',
    // Tambahkan API keys valid lainnya
  ]);

  // Endpoint untuk mendapatkan mutasi QRIS
  app.get("/mutasiqris", async (req, res) => {
    const { apikey, username, token } = req.query;
    
    // Validasi API key
    if (!apikey || !validApiKeys.has(apikey)) {
      return res.status(401).json({ 
        status: false, 
        error: 'Apikey invalid' 
      });
    }
    
    // Validasi parameter
    if (!username) {
      return res.status(400).json({ 
        status: false, 
        error: 'Missing username' 
      });
    }
    
    if (!token) {
      return res.status(400).json({ 
        status: false, 
        error: 'Missing token' 
      });
    }

    try {
      // Buat instance OrderKuotaClient
      const ok = new OrderKuotaClient(username, token);
      
      // Dapatkan transaksi QRIS
      let login = await ok.getTransactionQris();
      
      // Filter hanya transaksi dengan status "IN"
      if (login && login.qris_history && login.qris_history.results) {
        login = login.qris_history.results.filter(e => e.status === "IN");
      } else {
        login = [];
      }
      
      // Kirim response
      res.json({ 
        status: true, 
        result: login,
        count: login.length
      });
      
    } catch (err) {
      console.error('Error in /mutasiqris:', err.message);
      res.status(500).json({ 
        status: false, 
        error: err.message 
      });
    }
  });

  // Endpoint untuk menambah API key (opsional, untuk administrasi)
  app.post("/admin/apikeys", async (req, res) => {
    const { admin_key, new_apikey } = req.body;
    
    // Validasi admin key (dalam produksi, gunakan metode yang lebih aman)
    if (admin_key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ 
        status: false, 
        error: 'Unauthorized' 
      });
    }
    
    // Tambahkan API key baru
    if (new_apikey) {
      validApiKeys.add(new_apikey);
      return res.json({ 
        status: true, 
        message: 'API key added successfully' 
      });
    } else {
      return res.status(400).json({ 
        status: false, 
        error: 'No API key provided' 
      });
    }
  });
};
