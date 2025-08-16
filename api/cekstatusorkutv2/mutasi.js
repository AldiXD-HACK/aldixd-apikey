const axios = require('axios');

module.exports = function (app) {

  // Constants (should be moved to environment variables in production)
  const KASIR_HOST = 'app.orderkuota.com';
  const MEBVIEW_USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
  const APP_PACKAGE = 'com.orderkuota.app';

  // GET QRIS MUTATION WITH DYNAMIC KEYS
  app.get('/mutasiqris', async (req, res) => {
    const { merchant, auth_username, auth_token, dynamic_key } = req.query;

    // Validate required parameters
    if (!merchant || !auth_username || !auth_token || !dynamic_key) {
      return res.status(400).json({
        success: false,
        error: 'Parameter required: merchant, auth_username, auth_token, dynamic_key'
      });
    }

    try {
      const url = `https://${KASIR_HOST}/qris/curl/mutasi.php`;
      const timestamp = Date.now();

      const headers = {
        'Host': KASIR_HOST,
        'Accept': 'application/json',
        'Referer': `https://${KASIR_HOST}/qris/?id=${merchant}&key=${dynamic_key}`,
        'User-Agent': MEBVIEW_USER_AGENT,
        'X-Requested-With': APP_PACKAGE
      };

      const params = {
        timestamp,
        merchant
      };

      const response = await axios.get(url, {
        params,
        headers,
        timeout: 10000
      });

      // Format and return the response
      return res.status(200).json({
        success: true,
        merchant,
        dynamic_key,
        timestamp,
        data: response.data
      });

    } catch (error) {
      let statusCode = 500;
      let errorMessage = 'Server Error';
      let errorDetails = error.message;
      
      if (error.response) {
        statusCode = error.response.status;
        errorDetails = error.response.data;
      } else if (error.request) {
        errorMessage = 'No response from OrderKuota API';
      }

      return res.status(statusCode).json({
        success: false,
        error: errorMessage,
        details: errorDetails,
        merchant: merchant || null
      });
    }
  });
};
