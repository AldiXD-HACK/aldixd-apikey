const axios = require('axios');
const { URLSearchParams } = require('url');

// Updated OrderKuota API Configuration with current version info
const OrderKuotaConfig = {
  API_URL: 'https://app.orderkuota.com:443/api/v2',
  HOST: 'app.orderkuota.com',
  USER_AGENT: 'okhttp/4.10.0',
  // Updated to more recent version numbers
  APP_VERSION_NAME: '25.08.23', // Current date as version
  APP_VERSION_CODE: '250823',   // Current date as code
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
      // Adding additional headers that might be required
      'Accept': 'application/json',
      'Accept-Language': 'id-ID, id;q=0.9, en-US;q=0.8, en;q=0.7',
      'Connection': 'Keep-Alive',
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
  // GET QRIS MUTATION DATA
  app.get('/mutasiqris', async (req, res) => {
    const { username, token } = req.query;

    if (!username || !token) {
      return res.status(400).json({
        creator: "AldiXDCodeX",
        success: false,
        error: 'Parameter required: username, token',
        timestamp: new Date().toISOString()
      });
    }

    try {
      const ok = new OrderKuota(token, username);
      let response = await ok.getTransactionQris();
      
      // Check if the API is asking for an update
      if (response.qris_history && response.qris_history.success === false) {
        return res.status(426).json({
          creator: "AldiXDCodeX",
          success: false,
          error: 'API requires app update',
          message: response.qris_history.message,
          timestamp: new Date().toISOString()
        });
      }
      
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

  // ADDITIONAL ENDPOINT TO GET CURRENT APP INFO
  app.get('/orderkuota/appinfo', async (req, res) => {
    res.json({
      creator: "AldiXDCodeX",
      app_info: {
        version_name: OrderKuotaConfig.APP_VERSION_NAME,
        version_code: OrderKuotaConfig.APP_VERSION_CODE,
        user_agent: OrderKuotaConfig.USER_AGENT,
        api_url: OrderKuotaConfig.API_URL
      },
      timestamp: new Date().toISOString()
    });
  });
};
