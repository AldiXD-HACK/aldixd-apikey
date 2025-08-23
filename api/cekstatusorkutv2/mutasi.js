const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { URLSearchParams } = require("url");
const crypto = require("crypto");
const QRCode = require("qrcode");
const { ImageUploadService } = require("node-upload-images");

const app = express();
const PORT = 3000;

// contoh apikey valid
global.apikey = ["TEST123", "codex"];

// ================= CLASS ORDERKUOTA =================
class OrderKuota {
  static API_URL = "https://app.orderkuota.com:443/api/v2";
  static HOST = "app.orderkuota.com";
  static USER_AGENT = "okhttp/4.10.0";
  static APP_VERSION_NAME = "25.03.14";
  static APP_VERSION_CODE = "250314";
  static APP_REG_ID =
    "di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ";

  constructor(username = null, authToken = null) {
    this.username = username;
    this.authToken = authToken;
  }

  async loginRequest(username, password) {
    const payload = new URLSearchParams({
      username,
      password,
      app_reg_id: OrderKuota.APP_REG_ID,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      app_version_name: OrderKuota.APP_VERSION_NAME,
    });
    return await this.request("POST", `${OrderKuota.API_URL}/login`, payload);
  }

  async getAuthToken(username, otp) {
    const payload = new URLSearchParams({
      username,
      password: otp,
      app_reg_id: OrderKuota.APP_REG_ID,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      app_version_name: OrderKuota.APP_VERSION_NAME,
    });
    return await this.request("POST", `${OrderKuota.API_URL}/login`, payload);
  }

  async getTransactionQris(type = "") {
    const payload = new URLSearchParams({
      auth_token: this.authToken,
      auth_username: this.username,
      "requests[qris_history][jumlah]": "",
      "requests[qris_history][jenis]": type,
      "requests[qris_history][page]": "1",
      "requests[qris_history][dari_tanggal]": "",
      "requests[qris_history][ke_tanggal]": "",
      "requests[qris_history][keterangan]": "",
      "requests[0]": "account",
      app_version_name: OrderKuota.APP_VERSION_NAME,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      app_reg_id: OrderKuota.APP_REG_ID,
    });
    return await this.request("POST", `${OrderKuota.API_URL}/get`, payload);
  }

  buildHeaders() {
    return {
      Host: OrderKuota.HOST,
      "User-Agent": OrderKuota.USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
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

// ================== UTILS ==================
function convertCRC16(str) {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ("000" + (crc & 0xffff).toString(16).toUpperCase()).slice(-4);
}

function generateTransactionId() {
  return `AldiXDCODEX-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

function generateExpirationTime() {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 30);
  return expirationTime;
}

async function elxyzFile(buffer) {
  const service = new ImageUploadService("pixhost.to");
  const { directLink } = await service.uploadFromBinary(
    buffer,
    "vannhosting.png"
  );
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
    imageqris: { url: uploadedFile },
  };
}

// ================== ROUTE ==================
app.get("/mutasiqris", async (req, res) => {
  const { apikey, username, token } = req.query;
  if (!apikey || !global.apikey.includes(apikey))
    return res.json({ status: false, error: "Apikey invalid" });
  if (!username)
    return res.json({ status: false, error: "Missing username" });
  if (!token) return res.json({ status: false, error: "Missing token" });

  try {
    const ok = new OrderKuota(username, token);
    let data = await ok.getTransactionQris();
    if (!data.qris_history) {
      return res.json({ status: false, error: "Tidak ada data qris_history" });
    }
    const login = data.qris_history.results.filter((e) => e.status === "IN");
    res.json({ status: true, result: login });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ================== RUN SERVER ==================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
