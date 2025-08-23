const axios = require('axios');
const { URLSearchParams } = require('url');

// OrderKuota API Configuration
const OrderKuotaConfig = {
  API_URL: 'https://app.orderkuota.com:443/api/v2',
  HOST: 'app.orderkuota.com',
  USER_AGENT: 'okhttp/4.10.0',
  APP_VERSION_NAME: '25.03.14',
  APP_VERSION_CODE: '250314',
  APP_REG_ID: 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ'
};

class OrderKuota {
  constructor(authToken, username) {
    this.authToken = authToken;
    this.username = username;
  }

  async getTransactionQris(type = '') {
    const payload = new URLSearchParams({
      auth_token: this.authToken,
      auth_username: this.username,
      'requests[qris_history][jumlah]': '',
      'requests[qris_history][jenis]': type,
      'requests[qris_history][page]': '1',
      'requests[qris_history][dari_tanggal]': '',
      'requests[qris_history][ke_tanggal]': '',
      'requests[qris_history][keterangan]': '',
      'requests[0]': 'account',
      app_version_name: OrderKuotaConfig.APP_VERSION_NAME,
      app_version_code: OrderKuotaConfig.APP_VERSION_CODE,
      app_reg_id: OrderKuotaConfig.APP_REG_ID,
    });

    return await this.request('POST', `${OrderKuotaConfig.API_URL}/get`, payload);
  }

  buildHeaders() {
    return {
      'Host': OrderKuotaConfig.HOST,
      'User-Agent': OrderKuotaConfig.USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  async request(method, url, body = null) {
    try {
      const response = await axios({
        method,
        url,
        headers: this.buildHeaders(),
        data: body.toString(),
        timeout: 10000
      });
      
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  }
}

module.exports = function (app) {

  // Global API key validation (replace with your actual validation logic)
  const validApiKeys = ['your-api-key-1', 'your-api-key-2']; // Add your valid API keys here

  // GET QRIS MUTATION DATA (CORRECTED VERSION)
  app.get('/mutasiqris', async (req, res) => {
    const { apikey, username, token } = req.query;

    if (!apikey || !username || !token) {
      return res.status(400).json({
        creator: "AldiXDCodeX",
        success: false,
        error: 'Parameter required: apikey, username, token',
        timestamp: new Date().toISOString()
      });
    }

    // API key validation (replace with your actual validation logic)
    if (!validApiKeys.includes(apikey)) {
      return res.status(401).json({
        creator: "AldiXDCodeX",
        success: false,
        error: 'Invalid API key',
        timestamp: new Date().toISOString()
      });
    }

    try {
      const ok = new OrderKuota(token, username);
      let response = await ok.getTransactionQris();
      
      // Filter only IN transactions if needed
      const inTransactions = response.qris_history?.results?.filter(e => e.status === "IN") || [];
      
      return res.status(200).json({
        creator: "AldiXDCodeX",
        success: true,
        message: 'QRIS mutation data retrieved successfully',
        data: {
          success: response.success,
          qris_history: {
            ...response.qris_history,
            results: inTransactions
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      return res.status(500).json({
        creator: "AldiXDCodeX",
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
};
