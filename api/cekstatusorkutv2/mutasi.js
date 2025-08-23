const axios = require('axios');

// OrderKuota API Configuration
const OrderKuotaConfig = {
  API_URL: 'https://app.orderkuota.com:443/api/v2',
  HOST: 'app.orderkuota.com',
  USER_AGENT: 'okhttp/4.10.0',
  APP_VERSION_NAME: '25.03.14',
  APP_VERSION_CODE: '250314',
  APP_REG_ID: 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ'
};

module.exports = function (app) {

  // GET MUTATION DATA (API v2)
  app.get('/mutasiqris', async (req, res) => {
    const { username, token } = req.query;

    if (!username || !token) {
      return res.status(400).json({
        success: false,
        error: 'Parameter required: username, token'
      });
    }

    try {
      // Prepare headers for API v2
      const headers = {
        'Host': OrderKuotaConfig.HOST,
        'User-Agent': OrderKuotaConfig.USER_AGENT,
        'Accept': 'application/json',
        'X-App-Version-Name': OrderKuotaConfig.APP_VERSION_NAME,
        'X-App-Version-Code': OrderKuotaConfig.APP_VERSION_CODE,
        'X-App-Reg-ID': OrderKuotaConfig.APP_REG_ID,
        'Authorization': `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`
      };

      // Make API request to v2 endpoint
      const response = await axios.get(`${OrderKuotaConfig.API_URL}/get`, {
        headers,
        timeout: 10000
      });

      // Format the response
      return res.status(200).json({
        success: true,
        message: 'QRIS mutation data retrieved successfully',
        data: response.data,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      // Handle errors
      let status = 500;
      let errorMessage = 'Internal server error';
      
      if (error.response) {
        status = error.response.status;
        errorMessage = error.response.data.message || `API responded with status ${status}`;
      } else if (error.request) {
        errorMessage = 'No response received from OrderKuota API';
      } else {
        errorMessage = error.message;
      }

      return res.status(status).json({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
  });

  // CHECK ORDERKUOTA API STATUS
  app.get('/mutasiqrischeck', async (req, res) => {
    try {
      const response = await axios.get(`${OrderKuotaConfig.API_URL}/get`, {
        headers: {
          'Host': OrderKuotaConfig.HOST,
          'User-Agent': OrderKuotaConfig.USER_AGENT
        },
        timeout: 5000
      });

      return res.status(200).json({
        success: true,
        message: 'OrderKuota API v2 is operational',
        status: response.status,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'OrderKuota API v2 is not responding',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
};
