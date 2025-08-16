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

 
 // GET QRIS MERCHANT HISTORY (AXIOS VERSION)
  app.get('/mutasiqris', async (req, res) => {
    const { username, token } = req.query;
    const apikey = "f21f9421"; // API key built-in

    if (!username || !token) {
      return res.status(400).json({
        status: false,
        error: 'Parameter required: username, token'
      });
    }

    try {
      // Construct URL with URLSearchParams for proper encoding
      const params = new URLSearchParams({
        username,
        token,
        apikey
      });

      const url = `https://api.wbk.web.id/api/mutasi-orderkuota?${params.toString()}`;
      
      const response = await axios.get(url);
      
      return res.status(200).json({
        status: true,
        message: 'QRIS history retrieved successfully',
        data: response.data
      });

    } catch (error) {
      // Handle Axios-specific errors
      if (error.response) {
        // API responded with error status
        return res.status(error.response.status).json({
          status: false,
          error: 'WBK API error',
          details: error.response.data
        });
      } else if (error.request) {
        // Request made but no response
        return res.status(504).json({
          status: false,
          error: 'No response from WBK API',
          details: error.message
        });
      } else {
        // Other errors
        return res.status(500).json({
          status: false,
          error: 'Internal server error',
          details: error.message
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
