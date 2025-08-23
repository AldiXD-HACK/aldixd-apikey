const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { URLSearchParams } = require('url');
const crypto = require("crypto");
const QRCode = require('qrcode');
const { ImageUploadService } = require('node-upload-images');

class OrderKuota {
   API_URL = 'https://app.orderkuota.com:443/api/v2';
   HOST = 'app.orderkuota.com';
   USER_AGENT = 'okhttp/4.10.0';
   APP_VERSION_NAME = '25.03.14';
   APP_VERSION_CODE = '250314';
   APP_REG_ID = 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ';
   KASIR_HOST = 'app.orderkuota.com';
   MEBVIEW_USER_AGENT = 'okhttp/4.10.0';
   APP_PACKAGE = 'com.orderkuota.app';

  constructor(username = null, authToken = null) {
    this.username = username;
    this.authToken = authToken;
  }

  async loginRequest(username, password) {
    const payload = new URLSearchParams({
      username,
      password,
      app_reg_id: this.APP_REG_ID,
      app_version_code: this.APP_VERSION_CODE,
      app_version_name: this.APP_VERSION_NAME,
    });
    return await this.request('POST', `${this.API_URL}/login`, payload);
  }

  async getAuthToken(username, otp) {
    const payload = new URLSearchParams({
      username,
      password: otp,
      app_reg_id: this.APP_REG_ID,
      app_version_code: this.APP_VERSION_CODE,
      app_version_name: this.APP_VERSION_NAME,
    });
    return await this.request('POST', `${this.API_URL}/login`, payload);
  }

  async getTransactionQris(type = '') {
    const payload = new URLSearchParams({
      auth_token: this.authToken,
      auth_username: this.username,
      'requests[qris_history][jumlah]': '',
      'requests[qris_history][jenis]': type,
      'requests[qris_history][page]': '1',
      'requests[qris_history][dari_tanggal]': '',
      'requests[qris_history][ke_tanggal]': '',
      'requests[qris_history][keterangan]': '',
      'requests[0]': 'account',
      app_version_name: this.APP_VERSION_NAME,
      app_version_code: this.APP_VERSION_CODE,
      app_reg_id: this.APP_REG_ID,
    });
    return await this.request('POST', `${this.API_URL}/get`, payload);
  }

  async getDynamicKey(authUsername, authToken) {
    // Implementasi untuk mendapatkan dynamic key
    // Ini adalah placeholder, Anda perlu menyesuaikan dengan API yang sebenarnya
    const payload = new URLSearchParams({
      auth_username: authUsername,
      auth_token: authToken,
      app_version_name: this.APP_VERSION_NAME,
      app_version_code: this.APP_VERSION_CODE,
      app_reg_id: this.APP_REG_ID,
    });
    
    const response = await this.request('POST', `${this.API_URL}/get-dynamic-key`, payload);
    return response.dynamic_key || response.key || ''; // Sesuaikan dengan response API sebenarnya
  }

  async getMutasi(dynamicMerchantId) {
    try {
      const dynamicKey = await this.getDynamicKey(this.username, this.authToken);
      const url = `https://${this.KASIR_HOST}/qris/curl/mutasi.php`;
      const params = {
        timestamp: Date.now(),
        merchant: dynamicMerchantId
      };
      
      const headers = {
        'Host': this.KASIR_HOST,
        'accept': 'application/json',
        'referer': `https://${this.KASIR_HOST}/qris/?id=${dynamicMerchantId}&key=${dynamicKey}`,
        'user-agent': this.MEBVIEW_USER_AGENT,
        'x-requested-with': this.APP_PACKAGE
      };

      // Menggunakan fetch untuk request
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${url}?${queryString}`, { 
        method: 'GET',
        headers 
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      const status = error.response ? error.response.status : 'N/A';
      const baseMessage = error.message || `Request Gagal - Status: ${status}`;
      throw new Error(`Server Error: ${baseMessage}`);
    }
  }

  buildHeaders() {
    return {
      'Host': this.HOST,
      'User-Agent': this.USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  async request(method, url, body = null) {
    try {
      const res = await fetch(url, {
        method,
        headers: this.buildHeaders(),
        body: body ? body.toString() : null,
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      } else {
        return await res.text();
      }
    } catch (err) {
      return { error: err.message };
    }
  }
}

// Endpoint untuk mendapatkan mutasi QRIS
app.get("/mutasiqris", async (req, res) => {
  const { apikey, username, token, merchantId } = req.query;
  
  if (!global.apikey.includes(apikey)) {
    return res.json({ status: false, error: 'Apikey invalid' });
  }
  if (!username) {
    return res.json({ status: false, error: 'Missing username' });
  }
  if (!token) {
    return res.json({ status: false, error: 'Missing token' });
  }
  if (!merchantId) {
    return res.json({ status: false, error: 'Missing merchantId' });
  }

  try {
    const ok = new OrderKuota(username, token);
    const mutasi = await ok.getMutasi(merchantId);
    
    res.json({ 
      status: true, 
      result: mutasi 
    });
  } catch (err) {
    res.status(500).json({ 
      status: false, 
      error: err.message 
    });
  }
});

// Endpoint yang sudah ada (dari kode sebelumnya)
app.get("/orderkuota/mutasiqr", async (req, res) => {
  const { apikey, username, token } = req.query;
  if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
  if (!username) return res.json({ status: false, error: 'Missing username' });
  if (!token) return res.json({ status: false, error: 'Missing token' });

  try {
    const ok = new OrderKuota(username, token);
    let login = await ok.getTransactionQris();
    login = login.qris_history.results.filter(e => e.status === "IN");
    res.json({ status: true, result: login });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});
