const fetch = require("node-fetch");

module.exports = [
  {
    name: "Cek Status Order",
    desc: "Cek status Order Orkut",
    category: "Orderkuota",
    path: "/orderkuota/cekstatustrx?kodeproduk=&target=&refid=&kodemerchantorkut=&pinorkut=&pworkut=",
    async run(req, res) {
      const { apikey, kodeproduk, target, refid, kodemerchantorkut, pinorkut, pworkut } = req.query;

      // Validasi API key
      if (!apikey || !global.apikey.includes(apikey)) {
        return res.json({ status: false, error: "Apikey invalid" });
      }

      // Validasi parameter wajib
      if (!kodeproduk || !target || !refid || !kodemerchantorkut || !pinorkut || !pworkut) {
        return res.json({
          status: false,
          error: "Parameter kurang lengkap",
          needed: [
            "kodeproduk",
            "target",
            "refid",
            "kodemerchantorkut",
            "pinorkut",
            "pworkut"
          ]
        });
      }

      const url = `https://h2h.okeconnect.com/trx?product=${kodeproduk}&dest=${target}&refID=${refid}&memberID=${kodemerchantorkut}&pin=${pinorkut}&password=${pworkut}&check=1`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        res.status(200).json({
          status: true,
          request_sent: {
            product: kodeproduk,
            dest: target,
            refID: refid,
            memberID: kodemerchantorkut,
            check: 1
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
