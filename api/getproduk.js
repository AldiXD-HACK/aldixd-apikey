const fetch = require("node-fetch");

function randomRefID() {
  return "CODEX" + Math.random().toString(36).substring(2, 12).toUpperCase();
}

module.exports = [
  {
    name: "GetOrder",
    desc: "Create Order Produk OrderKuota",
    category: "Orderkuota",
    path: "/orderkuota/getorder?kodeproduk=&target=&kodemerchantorkut=&pinorkut=&passwordorkut=",
    async run(req, res) {
      const { apikey, kodeproduk, target, kodemerchantorkut, pinorkut, passwordorkut } = req.query;

      // Validasi API key
      if (!apikey || !global.apikey.includes(apikey)) {
        return res.json({ status: false, error: "Apikey invalid" });
      }

      // Validasi field
      if (!kodeproduk || !target || !kodemerchantorkut || !pinorkut || !passwordorkut) {
        return res.json({
          status: false,
          error: "Parameter kurang lengkap",
          needed: ["kodeproduk", "target", "kodemerchantorkut", "pinorkut", "passwordorkut"]
        });
      }

      const refID = randomRefID();

      const url = `https://h2h.okeconnect.com/trx?product=${kodeproduk}&dest=${target}&refID=${refID}&memberID=${kodemerchantorkut}&pin=${pinorkut}&password=${passwordorkut}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        res.status(200).json({
          status: true,
          request_sent: {
            product: kodeproduk,
            dest: target,
            refID: refID,
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
