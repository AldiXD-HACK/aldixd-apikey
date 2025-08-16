const axios = require('axios');

module.exports = function (app) {

  // REQUEST OTP ENDPOINT
  app.get('/cekstatusorkut', async (req, res) => {
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
};
