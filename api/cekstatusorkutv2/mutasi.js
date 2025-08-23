const axios = require('axios');
const { URLSearchParams } = require('url');
const crypto = require('crypto');
const QRCode = require('qrcode');

class OrderKuota {
  static API_URL = 'https://app.orderkuota.com:443/api/v2';
  static HOST = 'app.orderkuota.com';
  static USER_AGENT = 'okhttp/4.10.0';
  static APP_VERSION_NAME = '25.03.14';
  static APP_VERSION_CODE = '250314';
  static APP_REG_ID = 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ';

  constructor(username = null, authToken = null) {
    this.username = username;
    this.authToken = authToken;
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
      'requests[0]': 'mutasi',
      app_version_name: OrderKuota.APP_VERSION_NAME,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      app_reg_id: OrderKuota.APP_REG_ID,
    });
    
    return await this.request('POST', `${OrderKuota.API_URL}/get`, payload);
  }

  buildHeaders() {
    return {
      'Host': OrderKuota.HOST,
      'User-Agent': OrderKuota.USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  async request(method, url, body = null) {
    try {
      const response = await axios({
        method,
        url,
        headers: this.buildHeaders(),
        data: body.toString(),
        timeout: 10000
      });
      
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  }
}

// Helper functions
function convertCRC16(str) {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ("000" + (crc & 0xFFFF).toString(16).toUpperCase()).slice(-4);
}

function generateTransactionId() {
  return `VANN HOSTING - ${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

function generateExpirationTime() {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 30);
  return expirationTime;
}

// Simplified image upload service
class ImageUploadService {
  constructor(host) {
    this.host = host;
  }
  
  async uploadFromBinary(buffer, filename) {
    // This is a placeholder - implement actual image upload logic
    return {
      directLink: `https://${this.host}/images/${filename}`
    };
  }
}

async function elxyzFile(buffer) {
  const service = new ImageUploadService('pixhost.to');
  const { directLink } = await service.uploadFromBinary(buffer, 'vannhosting.png');
  return directLink;
}

async function createQRIS(amount, codeqr) {
  let qrisData = codeqr;
  qrisData = qrisData.slice(0, -4);
  const step1 = qrisData.replace("010211", "010212");
  const step2 = step1.split("5802ID");
  amount = amount.toString();
  let uang = "54" + ("0" + amount.length).slice(-2) + amount;
  uang += "5802ID";
  const final = step2[0] + uang + step2[1];
  const result = final + convertCRC16(final);
  const buffer = await QRCode.toBuffer(result);
  const uploadedFile = await elxyzFile(buffer);
  return {
    idtransaksi: generateTransactionId(),
    jumlah: amount,
    expired: generateExpirationTime(),
    imageqris: {
      url: uploadedFile
    }
  };
}

module.exports = function (app) {
  // Global API key storage (replace with your actual storage mechanism)
  const globalApikey = ['your-api-key-1', 'your-api-key-2']; // Add your valid API keys here

  // GET QRIS MUTATION DATA
  app.get("/orderkuota/mutasiqr", async (req, res) => {
    const { apikey, username, token } = req.query;
    
    // API key validation
    if (!globalApikey.includes(apikey)) {
      return res.json({ 
        creator: "AldiXDCodeX",
        status: false, 
        error: 'Apikey invalid',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!username) {
      return res.json({ 
        creator: "AldiXDCodeX",
        status: false, 
        error: 'Missing username',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!token) {
      return res.json({ 
        creator: "AldiXDCodeX",
        status: false, 
        error: 'Missing token',
        timestamp: new Date().toISOString()
      });
    }

    try {
      const ok = new OrderKuota(username, token);
      const response = await ok.getTransactionQris();
      
      // Check if the API response has the expected structure
      if (!response || !response.qris_history || !response.qris_history.results) {
        return res.json({
          creator: "AldiXDCodeX",
          status: false,
          error: 'Invalid API response structure',
          apiResponse: response,
          timestamp: new Date().toISOString()
        });
      }
      
      // Filter only IN transactions
      const transactions = response.qris_history.results
        .filter(e => e.status === "IN")
        .map(item => ({
          date: item.tanggal,
          amount: item.kredit !== "0" ? item.kredit : item.debet,
          type: "CR",
          qris: "static",
          brand_name: item.brand?.name || "Unknown",
          issuer_reff: item.id?.toString() || "N/A",
          buyer_reff: item.keterangan || "N/A",
          balance: item.saldo_akhir || "0"
        }));
      
      res.json({ 
        creator: "AldiXDCodeX",
        status: true, 
        data: transactions,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ 
        creator: "AldiXDCodeX",
        status: false, 
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // CREATE QRIS ENDPOINT
  app.get("/orderkuota/createqris", async (req, res) => {
    const { apikey, amount, codeqr } = req.query;
    
    // API key validation
    if (!globalApikey.includes(apikey)) {
      return res.json({ 
        creator: "AldiXDCodeX",
        status: false, 
        error: 'Apikey invalid',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!amount) {
      return res.json({ 
        creator: "AldiXDCodeX",
        status: false, 
        error: 'Missing amount',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!codeqr) {
      return res.json({ 
        creator: "AldiXDCodeX",
        status: false, 
        error: 'Missing codeqr',
        timestamp: new Date().toISOString()
      });
    }

    try {
      const qrisData = await createQRIS(amount, codeqr);
      res.json({
        creator: "AldiXDCodeX",
        status: true,
        data: qrisData,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({
        creator: "AldiXDCodeX",
        status: false,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });
};
