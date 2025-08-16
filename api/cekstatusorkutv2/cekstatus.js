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


  
      app.get('/mutasiqris', async (req, res) => {
    const { username, token } = req.query;
    const apikey = "f21f9421"; // API key langsung di script

    if (!username || !token) {
      return res.status(400).json({
        status: false,
        error: 'Parameter required: username, token'
      });
    }

    try {
      const url = `https://api.wbk.web.id/api/mutasi-orderkuota?username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}&apikey=${apikey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          status: false,
          error: 'Failed to fetch QRIS history',
          details: data
        });
      }

      return res.status(200).json({
        status: true,
        message: 'QRIS history retrieved successfully',
        data: data
      });

    } catch (error) {
      return res.status(500).json({
        status: false,
        error: 'Internal server error',
        details: error.message
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
