const axios = require('axios');
const { URLSearchParams } = require('url');

// Updated OrderKuota API Configuration with latest version
const OrderKuotaConfig = {
  API_URL: 'https://app.orderkuota.com:443/api/v2',
  HOST: 'app.orderkuota.com',
  USER_AGENT: 'okhttp/4.10.0',
  // Updated to latest version (example values - you may need to get the actual latest version)
  APP_VERSION_NAME: '25.08.23',
  APP_VERSION_CODE: '250823',
  APP_REG_ID: 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ'
};

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
      // Direct API call with updated parameters
      const payload = new URLSearchParams({
        auth_token: token,
        auth_username: username,
        'requests[qris_history][jumlah]': '50',
        'requests[qris_history][jenis]': '',
        'requests[qris_history][page]': '1',
        'requests[qris_history][dari_tanggal]': '',
        'requests[qris_history][ke_tanggal]': '',
        'requests[qris_history][keterangan]': '',
        'requests[0]': 'account',
        app_version_name: OrderKuotaConfig.APP_VERSION_NAME,
        app_version_code: OrderKuotaConfig.APP_VERSION_CODE,
        app_reg_id: OrderKuotaConfig.APP_REG_ID,
      });

      const response = await axios.post(`${OrderKuotaConfig.API_URL}/get`, payload.toString(), {
        headers: {
          'Host': OrderKuotaConfig.HOST,
          'User-Agent': OrderKuotaConfig.USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 10000
      });

      // Check if API returned an error
      if (!response.data.success) {
        return res.status(500).json({
          creator: "AldiXDCodeX",
          success: false,
          error: response.data.message || 'API returned an error',
          timestamp: new Date().toISOString()
        });
      }

      // Transform the response to match your expected format
      const transactions = response.data.qris_history.results
        .filter(e => e.status === "IN")
        .map(item => ({
          date: item.tanggal,
          amount: item.kredit !== "0" ? item.kredit : item.debet,
          type: "CR", // Credit for IN transactions
          qris: "static",
          brand_name: item.brand.name,
          issuer_reff: item.id.toString(),
          buyer_reff: item.keterangan,
          balance: item.saldo_akhir
        }));

      return res.status(200).json({
        creator: "AldiXDCodeX",
        success: true,
        message: 'QRIS mutation data retrieved successfully',
        data: transactions,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      let errorMessage = 'Internal server error';
      
      if (error.response) {
        errorMessage = error.response.data.message || `API responded with status ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response received from OrderKuota API';
      } else {
        errorMessage = error.message;
      }

      return res.status(500).json({
        creator: "AldiXDCodeX",
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
  });
};
