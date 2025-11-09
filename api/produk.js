const fetch = require("node-fetch");

const produkMap = {
  pulsatf: "pulsa_transfer",
  sms: "sms_telepon",
  telkomsel: "kuota_telkomsel",
  byu: "kuota_byu",
  indosat: "kuota_indosat",
  tri: "kuota_tri",
  xl: "kuota_xl",
  axis: "kuota_axis",
  smartfren: "kuota_smartfren",
  tokenpln: "token_pln",
  ewallet: "saldo_gojek",
  ppob: "digital",
  pdam: "air_pdam",
  pulsa: "pulsa"
};

module.exports = [
  {
    name: "Get Produk Order Kuota",
    desc: "Get list produk dari Orkut",
    category: "Orderkuota",
    path: "/orderkuota/produk?apikey=&produk=",
    async run(req, res) {
      const { apikey, produk } = req.query;

      if (!apikey || !global.apikey.includes(apikey)) {
        return res.json({ status: false, error: "Apikey invalid" });
      }

      if (!produk) {
        return res.json({
          status: false,
          error: "Parameter 'produk' wajib diisi",
          list_produk: Object.keys(produkMap)
        });
      }

      // cek produknya ada tidak
      const produkFix = produkMap[produk.toLowerCase()];

      if (!produkFix) {
        return res.json({
          status: false,
          error: "Produk tidak ditemukan!",
          contoh: "Gunakan salah satu produk:",
          list_produk: Object.keys(produkMap)
        });
      }

      try {
        const url = `https://okeconnect.com/harga/json?id=905ccd028329b0a&produk=${produkFix}`;
        const response = await fetch(url);
        const data = await response.json();

        res.status(200).json({
          status: true,
          produk_input: produk,
          produk_request: produkFix,
          result: data
        });

      } catch (err) {
        res.status(500).json({
          status: false,
          error: err.message
        });
      }
    }
  }
];
