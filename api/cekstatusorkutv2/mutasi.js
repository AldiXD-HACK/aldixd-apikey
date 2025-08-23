const axios = require('axios');

// Konstanta yang diperlukan
const API_URL = 'https://app.orderkuota.com:443/api/v2';
const HOST = 'app.orderkuota.com';
const USER_AGENT = 'okhttp/4.10.0';
const APP_VERSION_NAME = '25.03.14';
const APP_VERSION_CODE = '250314';
const APP_REG_ID = 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ';

// Fungsi untuk membuat headers
function buildHeaders() {
  return {
    'Host': HOST,
    'User-Agent': USER_AGENT,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
}

// Endpoint untuk mendapatkan mutasi QRIS
app.get('/mutasiqris', async (req, res) => {
  const { merchantId, username, token } = req.query;

  // Validasi parameter
  if (!merchantId || !username || !token) {
    return res.status(400).json({
      status: false,
      error: 'Parameter merchantId, username, dan token wajib diisi'
    });
  }

  try {
    // Mendapatkan dynamic key (asumsi fungsi ini sudah ada)
    const dynamicKey = await getDynamicKey(username, token);
    
    // URL endpoint mutasi
    const url = `https://${HOST}/qris/curl/mutasi.php`;
    
    // Parameter request
    const params = {
      timestamp: Date.now(),
      merchant: merchantId
    };
    
    // Headers request
    const headers = {
      'Host': HOST,
      'accept': 'application/json',
      'referer': `https://${HOST}/qris/?id=${merchantId}&key=${dynamicKey}`,
      'user-agent': USER_AGENT,
      'x-requested-with': 'com.orderkuota.app' // Mengasumsikan package name
    };

    // Melakukan request ke API OrderKuota
    const response = await axios.get(url, { params, headers });
    
    // Mengembalikan response
    res.status(200).json({
      status: true,
      data: response.data
    });
    
  } catch (error) {
    // Menangani error
    const status = error.response ? error.response.status : 'N/A';
    const baseMessage = error.message || `Request Gagal - Status: ${status}`;
    
    res.status(500).json({
      status: false,
      error: `Server Error: ${baseMessage}`,
      detail: error.response ? error.response.data : null
    });
  }
});

// Fungsi bantuan untuk mendapatkan dynamic key
async function getDynamicKey(username, token) {
  // Implementasi sesuai dengan kebutuhan aplikasi Anda
  // Ini adalah placeholder, Anda perlu mengimplementasi sesuai logika aplikasi
  try {
    const response = await axios.post(`${API_URL}/auth/get-key`, {
      username,
      token
    }, {
      headers: buildHeaders()
    });
    
    return response.data.key;
  } catch (error) {
    throw new Error('Gagal mendapatkan dynamic key');
  }
}
