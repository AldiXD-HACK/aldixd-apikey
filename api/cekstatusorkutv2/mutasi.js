const axios = require('axios');

// OrderKuota API Configuration
const OrderKuota = {
  API_URL: 'https://app.orderkuota.com:443/api/v2',
  HOST: 'app.orderkuota.com',
  USER_AGENT: 'okhttp/4.10.0',
  APP_VERSION_NAME: '25.03.14',
  APP_VERSION_CODE: '250314',
  APP_REG_ID: 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ'
};

module.exports = function (app) {

  // GET QRIS TRANSACTION HISTORY
  app.post('/mutasiqris', async (req, res) => {
    const { 
      auth_token, 
      auth_username, 
      jenis = '', 
      page = '1', 
      dari_tanggal = '', 
      ke_tanggal = '', 
      keterangan = '' 
    } = req.body;

    if (!auth_token || !auth_username) {
      return res.status(400).json({
        creator: "AldiXDCodeX",
        success: false,
        error: 'Parameter required: auth_token, auth_username',
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Prepare form data
      const formData = new URLSearchParams();
      formData.append('auth_token', auth_token);
      formData.append('auth_username', auth_username);
      formData.append('requests[qris_history][jumlah]', '');
      formData.append('requests[qris_history][jenis]', jenis);
      formData.append('requests[qris_history][page]', page);
      formData.append('requests[qris_history][dari_tanggal]', dari_tanggal);
      formData.append('requests[qris_history][ke_tanggal]', ke_tanggal);
      formData.append('requests[qris_history][keterangan]', keterangan);
      formData.append('requests[0]', 'account');
      formData.append('app_version_name', OrderKuota.APP_VERSION_NAME);
      formData.append('app_version_code', OrderKuota.APP_VERSION_CODE);
      formData.append('app_reg_id', OrderKuota.APP_REG_ID);

      // Prepare headers
      const headers = {
        'Host': OrderKuota.HOST,
        'User-Agent': OrderKuota.USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      };

      // Make API request
      const response = await axios.post(`${OrderKuota.API_URL}/get`, formData.toString(), {
        headers,
        timeout: 10000
      });

      return res.status(200).json({
        creator: "AldiXDCodeX",
        success: true,
        message: 'QRIS transaction data retrieved successfully',
        data: response.data,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      // Handle errors
      let status = 500;
      let errorMessage = 'Internal server error';
      
      if (error.response) {
        status = error.response.status;
        errorMessage = error.response.data.message || `API responded with status ${status}`;
      } else if (error.request) {
        errorMessage = 'No response received from OrderKuota API';
      } else {
        errorMessage = error.message;
      }

      return res.status(status).json({
        creator: "AldiXDCodeX",
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
  });

  // GET QRIS TRANSACTION HISTORY (GET VERSION)
  app.get('/mutasiqris', async (req, res) => {
    const { 
      auth_token, 
      auth_username, 
      jenis = '', 
      page = '1', 
      dari_tanggal = '', 
      ke_tanggal = '', 
      keterangan = '' 
    } = req.query;

    if (!auth_token || !auth_username) {
      return res.status(400).json({
        creator: "AldiXDCodeX",
        success: false,
        error: 'Parameter required: auth_token, auth_username',
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Prepare form data
      const formData = new URLSearchParams();
      formData.append('auth_token', auth_token);
      formData.append('auth_username', auth_username);
      formData.append('requests[qris_history][jumlah]', '');
      formData.append('requests[qris_history][jenis]', jenis);
      formData.append('requests[qris_history][page]', page);
      formData.append('requests[qris_history][dari_tanggal]', dari_tanggal);
      formData.append('requests[qris_history][ke_tanggal]', ke_tanggal);
      formData.append('requests[qris_history][keterangan]', keterangan);
      formData.append('requests[0]', 'account');
      formData.append('app_version_name', OrderKuota.APP_VERSION_NAME);
      formData.append('app_version_code', OrderKuota.APP_VERSION_CODE);
      formData.append('app_reg_id', OrderKuota.APP_REG_ID);

      // Prepare headers
      const headers = {
        'Host': OrderKuota.HOST,
        'User-Agent': OrderKuota.USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      };

      // Make API request
      const response = await axios.post(`${OrderKuota.API_URL}/get`, formData.toString(), {
        headers,
        timeout: 10000
      });

      return res.status(200).json({
        creator: "AldiXDCodeX",
        success: true,
        message: 'QRIS transaction data retrieved successfully',
        data: response.data,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      // Handle errors
      let status = 500;
      let errorMessage = 'Internal server error';
      
      if (error.response) {
        status = error.response.status;
        errorMessage = error.response.data.message || `API responded with status ${status}`;
      } else if (error.request) {
        errorMessage = 'No response received from OrderKuota API';
      } else {
        errorMessage = error.message;
      }

      return res.status(status).json({
        creator: "AldiXDCodeX",
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
  });
};
