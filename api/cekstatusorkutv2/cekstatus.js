const axios = require('axios');

module.exports = function (app) {

  // REQUEST OTP ENDPOINT
  app.get('/requestotp', async (req, res) => {
    const { username, password } = req.query;

    if (!username || !password) {
      return res.status(400).json({
        status: false,
        error: 'Parameter tidak lengkap. Wajib: username, password'
      });
    }

    const url = 'https://bovalone.me/api/orderkuota/request_otp';
    const apiKey = 'arie-PtdKRj6051SPulxjSf'; // Replace with your actual API key

    const payload = {
      username: username,
      password: password
    };

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(url, payload, { headers });

      return res.status(200).json({
        status: true,
        message: "✅ OTP request berhasil",
        data: response.data
      });

    } catch (error) {
      const errorData = error.response ? error.response.data : error.message;
      return res.status(500).json({
        status: false,
        error: "❌ Gagal meminta OTP",
        detail: errorData
      });
    }
  });

 
  // GET QRIS MUTATION HISTORY
  app.get('/mutasiqris', async (req, res) => {
    const { username, token } = req.query;

    if (!username || !token) {
      return res.status(400).json({
        status: false,
        creator: "Orderkuota Proxy",
        message: "Parameter required: username, token",
        merchant: username || "unknown",
        result: []
      });
    }

    try {
      const response = await axios.get('https://app.orderkuota.com/api/v2/get', {
        params: {
          username,
          token
        },
        timeout: 10000
      });

      // Format response to match Orderkuota structure
      return res.status(200).json({
        status: response.data.status || true,
        creator: response.data.creator || "Orderkuota",
        message: response.data.message || "Mutasi berhasil ditampilkan",
        merchant: response.data.merchant || username,
        result: response.data.result || []
      });

    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // API responded with error status
        return res.status(error.response.status).json({
          status: false,
          creator: "AldiXDCodeX",
          message: `API error: ${error.response.data.message || error.response.statusText}`,
          merchant: username,
          result: []
        });
      } else if (error.request) {
        // Request made but no response
        return res.status(504).json({
          status: false,
          creator: "AldiXDCodeX",
          message: "Tidak ada respons dari server Orderkuota",
          merchant: username,
          result: []
        });
      } else {
        // Other errors
        return res.status(500).json({
          status: false,
          creator: "Orderkuota Proxy",
          message: `Internal server error: ${error.message}`,
          merchant: username,
          result: []
        });
      }
    }
  });
  
  // VERIFY OTP ENDPOINT
  app.get('/verifyotp', async (req, res) => {
    const { username, otp } = req.query;

    if (!username || !otp) {
      return res.status(400).json({
        status: false,
        error: 'Parameter tidak lengkap. Wajib: username, otp'
      });
    }

    const url = 'https://bovalone.me/api/orderkuota/verify_otp';
    const apiKey = 'arie-PtdKRj6051SPulxjSf'; // Replace with your actual API key

    const payload = {
      username: username,
      otp: otp
    };

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(url, payload, { headers });

      return res.status(200).json({
        status: true,
        message: "✅ OTP verification successful",
        data: response.data
      });

    } catch (error) {
      const statusCode = error.response?.status || 500;
      const errorData = error.response?.data || error.message;
      
      return res.status(statusCode).json({
        status: false,
        error: "❌ Gagal verifikasi OTP",
        detail: errorData
      });
    }
  });
};
