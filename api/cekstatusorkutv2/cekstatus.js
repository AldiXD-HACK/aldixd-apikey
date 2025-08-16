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
  
  // CEK MUTASI QRIS (EXACT FORMAT)
  app.get('/mutasiqris', async (req, res) => {
    const { merchant, auth_username, auth_token } = req.query;

    if (!merchant || !auth_username || !auth_token) {
      return res.status(400).json({
        status: "error",
        message: "Missing parameters: merchant, auth_username, auth_token required",
        data: null
      });
    }

    const url = 'https://bovalone.me/api/orderkuota-qr-mutasi';
    const apiKey = 'bvl-bBV4RYPhBuYnVHks3O'; // Replace with your actual key

    try {
      const response = await axios.post(url, {
        merchant,
        auth_username,
        auth_token
      }, {
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Format response exactly as the example
      const responseData = {
        status: "success",
        message: null,
        data: response.data.data.map(item => ({
          date: item.date,
          amount: item.amount,
          type: item.type,
          qris: item.qris,
          brand_name: item.brand_name,
          issuer_reff: item.issuer_reff,
          buyer_reff: item.buyer_reff,
          balance: item.balance
        })),
        merchant: merchant,
        key: apiKey.slice(0, 32) // Show first 32 chars of key for reference
      };

      return res.status(200).json(responseData);

    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.response?.data?.message || "QRIS mutation check failed",
        data: null,
        merchant: merchant || null,
        key: null
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
