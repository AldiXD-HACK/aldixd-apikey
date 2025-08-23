const axios = require('axios');

// Konstanta
const API_URL = 'https://app.orderkuota.com:443/api/v2';
const HOST = 'app.orderkuota.com';
const USER_AGENT = 'okhttp/4.10.0';
const APP_VERSION_NAME = '25.03.14';
const APP_VERSION_CODE = '250314';
const APP_REG_ID = 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ';

// Fungsi untuk mendapatkan dynamic key
async function getDynamicKey(authUsername, authToken) {
  try {
    // Implementasi sebenarnya mungkin berbeda
    // Ini hanya contoh - sesuaikan dengan API OrderKuota yang sebenarnya
    const response = await axios.post(`${API_URL}/auth/get-key`, {
      username: authUsername,
      token: authToken
    }, {
      headers: {
        'Host': HOST,
        'User-Agent': USER_AGENT,
        'X-App-Version-Name': APP_VERSION_NAME,
        'X-App-Version-Code': APP_VERSION_CODE,
        'X-App-Reg-ID': APP_REG_ID,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.key;
  } catch (error) {
    console.error('Error getting dynamic key:', error.message);
    throw new Error(`Gagal mendapatkan dynamic key: ${error.response?.data || error.message}`);
  }
}

// Endpoint untuk mendapatkan mutasi QRIS
app.get('/mutasiqris', async (req, res) => {
  try {
    const { dynamicMerchantId, authUsername, authToken } = req.query;

    // Validasi parameter
    if (!dynamicMerchantId || !authUsername || !authToken) {
      return res.status(400).json({
        status: false,
        error: 'Parameter wajib: dynamicMerchantId, authUsername, authToken'
      });
    }

    // Dapatkan dynamic key
    const dynamicKey = await getDynamicKey(authUsername, authToken);
    
    // Request data mutasi
    const url = `https://${HOST}/qris/curl/mutasi.php`;
    const params = {
      timestamp: Date.now(),
      merchant: dynamicMerchantId
    };

    const headers = {
      'Host': HOST,
      'Accept': 'application/json',
      'Referer': `https://${HOST}/qris/?id=${dynamicMerchantId}&key=${dynamicKey}`,
      'User-Agent': USER_AGENT,
      'X-Requested-With': 'XMLHttpRequest'
    };

    const response = await axios.get(url, { params, headers });
    
    return res.status(200).json({
      status: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error in /mutasiqris:', error.message);
    
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;
    
    return res.status(status).json({
      status: false,
      error: `Server Error: ${errorMessage}`
    });
  }
});
