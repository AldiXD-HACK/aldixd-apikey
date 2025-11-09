const fetch = require("node-fetch");

module.exports = [
  {
    name: "Cek Status Order",
    desc: "Cek status Order Produk",
    category: "OrderKuota",
    path: "/orderkuota/cekstatustrx?apikey=&kodeproduk=&target=&refid=&kodemerchantorkut=&pinorkut=&pwordkut=",
    async run(req, res) {
      const { apikey, kodeproduk, target, refid, kodemerchantorkut, pinorkut, pwordkut } = req.query;

      // Validasi APIKEY lokal
      if (!apikey || !global.apikey.includes(apikey)) {
        return res.json({ status: false, error: "Apikey invalid" });
      }

      // cek parameter wajib
      if (!kodeproduk || !target || !refid || !kodemerchantorkut || !pinorkut || !pwordkut) {
        return res.json({
          status: false,
          error: "Parameter kurang lengkap!",
          needed: ["kodeproduk", "target", "refid", "kodemerchantorkut", "pinorkut", "pwordkut"]
        });
      }

      // URL API asli
      const url = `https://h2h.okeconnect.com/trx?product=${kodeproduk}&dest=${target}&refID=${refid}&memberID=${kodemerchantorkut}&pin=${pinorkut}&password=${pwordkut}&check=1`;

      try {
        const response = await fetch(url);
        const data = await response.text(); // respons API berupa string bukan JSON

        res.status(200).json({
          status: true,
          request_sent: {
            product: kodeproduk,
            dest: target,
            refID: refid,
            memberID: kodemerchantorkut
          },
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
