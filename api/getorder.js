const fetch = require("node-fetch");

// Fungsi membuat refID random
function generateRefID() {
  return "12" + Math.floor(Math.random() * 999999999);
}

module.exports = [
  {
    name: "Get Order",
    desc: "Create Order Produk Orderkuota",
    category: "Orderkuota",
    path: "/orderkuota/getorder?apikey=&kodeproduk=&target=&kodemerchantorkut=&pinorkut=&passwordorkut=",
    async run(req, res) {
      const {
        apikey,
        kodeproduk,
        target,
        kodemerchantorkut,
        pinorkut,
        passwordorkut
      } = req.query;

      // Validasi APIKEY
      if (!apikey || !global.apikey.includes(apikey)) {
        return res.json({ status: false, error: "Apikey invalid" });
      }

      // Validasi parameter
      if (!kodeproduk || !target || !kodemerchantorkut || !pinorkut || !passwordorkut) {
        return res.json({
          status: false,
          error: "Parameter tidak lengkap!",
          required: [
            "kodeproduk",
            "target",
            "kodemerchantorkut",
            "pinorkut",
            "passwordorkut"
          ]
        });
      }

      // Generate refID
      const refID = generateRefID();

      try {
        const url =
          `https://h2h.okeconnect.com/trx?product=${kodeproduk}` +
          `&dest=${target}` +
          `&refID=${refID}` +
          `&memberID=${kodemerchantorkut}` +
          `&pin=${pinorkut}` +
          `&password=${passwordorkut}`;

        const response = await fetch(url);
        const text = await response.text(); // response plain text

        res.status(200).json({
          status: true,
          request: {
            product: kodeproduk,
            dest: target,
            memberID: kodemerchantorkut,
            pin: pinorkut,
            password: passwordorkut,
            refID: refID
          },
          result_raw: text
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
