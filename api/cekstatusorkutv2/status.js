const fetch = require('node-fetch');

module.exports = function (app) {

  // GET QRIS MERCHANT HISTORY (API KEY IN SCRIPT)
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
};
