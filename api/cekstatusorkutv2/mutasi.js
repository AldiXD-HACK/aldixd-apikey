const axios = require('axios');

// Konstanta yang diberikan
const API_URL = 'https://app.orderkuota.com:443/api/v2';
const HOST = 'app.orderkuota.com';
const USER_AGENT = 'okhttp/4.10.0';
const APP_VERSION_NAME = '25.03.14';
const APP_VERSION_CODE = '250314';
const APP_REG_ID = 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ';

// Fungsi untuk mendapatkan dynamic key (asumsi)
async function getDynamicKey(authUsername, authToken) {
  // Implementasi untuk mendapatkan dynamic key
  // Ini adalah placeholder - Anda perlu menyesuaikan dengan implementasi sebenarnya
  try {
    const response = await axios.post(`${API_URL}/auth/get-key`, {
      username: authUsername,
      token: authToken
    }, {
      headers: {
        'Host': HOST,
        'User-Agent': USER_AGENT,
        'X-App-Version-Name': APP_VERSION_NAME,
        'X-App-Version-Code': APP_VERSION_CODE,
        'X-App-Reg-ID': APP_REG_ID
      }
    });
    
    return response.data.key;
  } catch (error) {
    throw new Error(`Gagal mendapatkan dynamic key: ${error.message}`);
  }
}

// Endpoint untuk mendapatkan mutasi QRIS
app.get('/mutasiqris', async (req, res) => {
  const { dynamicMerchantId, authUsername, authToken } = req.query;

  if (!dynamicMerchantId || !authUsername || !authToken) {
    return res.status(400).json({
      status: false,
      error: 'Parameter wajib: dynamicMerchantId, authUsername, authToken'
    });
  }

  try {
    const dynamicKey = await getDynamicKey(authUsername, authToken);
    const url = `https://${HOST}/qris/curl/mutasi.php`;
    const params = {
      timestamp: Date.now(),
      merchant: dynamicMerchantId
    };

    const headers = {
      'Host': HOST,
      'accept': 'application/json',
      'referer': `https://${HOST}/qris/?id=${dynamicMerchantId}&key=${dynamicKey}`,
      'user-agent': USER_AGENT,
      'x-requested-with': 'XMLHttpRequest'
    };

    const response = await axios.get(url, { params, headers });
    
    return res.status(200).json({
      status: true,
      data: response.data
    });

  } catch (error) {
    const status = error.response ? error.response.status : 'N/A';
    const baseMessage = error.message || `Request Gagal - Status: ${status}`;
    
    return res.status(500).json({
      status: false,
      error: `Server Error: ${baseMessage}`
    });
  }
});
