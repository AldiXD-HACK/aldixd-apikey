const axios = require('axios');

// Configuration constants
const OrderKuota = {
  KASIR_HOST: 'orderkuota.com',
  MEBVIEW_USER_AGENT: 'Mozilla/5.0 (Linux; Android 10; M2004J19C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.185 Mobile Safari/537.36',
  APP_PACKAGE: 'app.orderkuota.com:443'
};

// Mock function to generate dynamic key (replace with actual implementation)
async function getDynamicKey(authUsername, authToken) {
  // In a real implementation, this would make an API call to get the dynamic key
  return Buffer.from(`${authUsername}:${authToken}`).toString('base64');
}

module.exports = function (app) {

  // GET QRIS MUTATION DATA
  app.get('/mutasiqris', async (req, res) => {
    const { merchant, username, token } = req.query;

    if (!merchant || !username || !token) {
      return res.status(400).json({
        success: false,
        error: 'Parameter required: merchant, username, token'
      });
    }

    try {
      // Get dynamic key
      const dynamicKey = await getDynamicKey(username, token);
      
      // Prepare request parameters
      const params = {
        timestamp: Date.now(),
        merchant: merchant
      };

      // Prepare headers
      const headers = {
        'Host': OrderKuota.KASIR_HOST,
        'Accept': 'application/json',
        'Referer': `https://${OrderKuota.KASIR_HOST}/qris/?id=${merchant}&key=${dynamicKey}`,
        'User-Agent': OrderKuota.MEBVIEW_USER_AGENT,
        'X-Requested-With': OrderKuota.APP_PACKAGE
      };

      // Make API request
      const response = await axios.get(`https://${OrderKuota.KASIR_HOST}/qris/curl/mutasi.php`, {
        params,
        headers,
        timeout: 10000
      });

      return res.status(200).json({
        success: true,
        message: 'QRIS mutation data retrieved',
        data: response.data,
        merchant: merchant,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      // Handle different error scenarios
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
        merchant: merchant,
        timestamp: new Date().toISOString()
      });
    }
  });
};
