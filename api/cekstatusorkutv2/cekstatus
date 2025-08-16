const axios = require('axios');

module.exports = function (app) {

  // CEK STATUS ORKUT ENDPOINT
  app.get('/cekstatusorkut', async (req, res) => {
    const { authtoken, usernameorkut } = req.query;

    if (!authtoken || !usernameorkut) {
      return res.status(400).json({
        status: false,
        error: 'Parameter tidak lengkap. Wajib: authtoken, usernameorkut'
      });
    }

    const url = 'https://bovalone.me/api/orderkuota/mutasiqris';
    const apiKey = 'bvl-bBV4RYPhBuYnVHks3O'; // Consider moving this to environment variables

    const data = {
      authToken: authtoken,
      authUsername: usernameorkut
    };

    try {
      const response = await axios.post(url, data, {
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return res.status(200).json({
        status: true,
        message: "✅ Data status berhasil didapatkan",
        data: response.data
      });

    } catch (error) {
      const errorData = error.response ? error.response.data : error.message;
      return res.status(500).json({
        status: false,
        error: "❌ Gagal mengambil data status",
        detail: errorData
      });
    }
  });
};
