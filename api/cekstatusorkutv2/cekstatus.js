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


  // CEK MUTASI QRIS (NEW VERSION)
  // CEK MUTASI QRIS ENDPOINT
  app.get('/mutasiqris', async (req, res) => {
    const { authToken, authUsername } = req.query;

    if (!authToken || !authUsername) {
      return res.status(400).json({
        status: "error",
        message: "Parameter required: authToken, authUsername",
        data: null
      });
    }

    const url = 'https://bovalone.me/api/orderkuota/mutasiqris';
    const apiKey = 'arie-PtdKRj6051SPulxjSf'; // Replace with your actual API key

    const data = {
      authToken,
      authUsername
    };

    try {
      const response = await axios.post(url, data, {
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Format response structure
      return res.status(200).json({
        status: "success",
        message: null,
        data: response.data.data || response.data, // Adjust according to actual API response
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.response?.data?.message || "Failed to check QRIS mutation",
        data: null,
        timestamp: new Date().toISOString()
      });
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
