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

    if (!username || !token) {
      return res.status(400).json({
        success: false,
        error: 'Parameter required: username, token'
      });
    }

    try {
      // Make request to Orderkuota API
      const response = await axios.get('https://app.orderkuota.com/api/v2/get', {
        params: {
          username,
          token
        },
        timeout: 10000
      });

      // Check if the API response is successful
      if (!response.data.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch QRIS history',
          details: response.data
        });
      }

      // Format the response data
      const formattedData = response.data.qris_history.results.map(item => ({
        id: item.id,
        amount: item.kredit !== "0" ? item.kredit : item.debet,
        type: item.status === "IN" ? "CREDIT" : "DEBIT",
        final_balance: item.saldo_akhir,
        description: item.keterangan,
        date: item.tanggal,
        status: item.status,
        fee: item.fee,
        brand: {
          name: item.brand.name,
          logo: item.brand.logo
        }
      }));

      return res.status(200).json({
        success: true,
        total_transactions: response.data.qris_history.total,
        current_page: response.data.qris_history.page,
        total_pages: response.data.qris_history.pages,
        transactions: formattedData
      });

    } catch (error) {
      // Handle different types of errors
      let errorMessage = 'Failed to fetch QRIS history';
      let errorDetails = error.message;
      
      if (error.response) {
        errorDetails = error.response.data;
      } else if (error.request) {
        errorMessage = 'No response received from Orderkuota API';
      }

      return res.status(500).json({
        success: false,
        error: errorMessage,
        details: errorDetails
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
