const axios = require('axios');
const { URLSearchParams } = require('url');

// Updated OrderKuota API Configuration with current values
const OrderKuotaConfig = {
  API_URL: 'https://app.orderkuota.com:443/api/v2',
  HOST: 'app.orderkuota.com',
  USER_AGENT: 'okhttp/4.10.0',
  // Updated to current version values
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
      'requests[qris_history][jumlah]': '50', // Request more results
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
      'Accept': 'application/json',
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
  // GET QRIS MUTATION DATA (UPDATED VERSION)
  app.get('/orderkuota/mutasiqr', async (req, res) => {
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
      
      // Check if the API returned an error
      if (!response.success) {
        return res.status(500).json({
          creator: "AldiXDCodeX",
          success: false,
          error: response.message || 'API returned an error',
          timestamp: new Date().toISOString()
        });
      }
      
      // Format the response to match your expected format
      const formattedResults = response.qris_history.results.map(transaction => ({
        date: transaction.tanggal,
        amount: transaction.kredit !== "0" ? transaction.kredit : transaction.debet,
        type: "CR", // Assuming all are credit transactions
        qris: "static", // Default value
        brand_name: transaction.brand?.name || "Unknown",
        issuer_reff: transaction.id.toString(),
        buyer_reff: transaction.keterangan,
        balance: transaction.saldo_akhir
      }));
      
      // Filter only IN transactions if needed
      const inTransactions = formattedResults.filter(e => e.type === "CR");
      
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
