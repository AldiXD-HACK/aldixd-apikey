const fetch = require('node-fetch');

const ytmp3cc = async (url) => {
    const r = await fetch("https://e.ecoe.cc/?_=" + Math.random(), {
        "body": JSON.stringify({ url }),
        "method": "POST"
    })
    if (!r.ok) throw Error(`fetch is not ok! ${r.status} ${r.statusText}\n${await r.text() || null}`)
    return await r.json()
}

module.exports = [
  {
    name: "Ytmp3 V2",
    desc: "Download audio youtube v2",
    category: "Downloader",
    path: "/download/ytmp3v2?apikey=&url=",
    async run(req, res) {
      try {
        const { apikey, url } = req.query;
        if (!apikey || !global.apikey.includes(apikey))
          return res.json({ status: false, error: "Apikey invalid" });
        if (!url)
          return res.json({ status: false, error: "Url is required" });

        const results = await ytmp3cc(url)
        res.status(200).json({
          status: true,
          result: results.url,
        });
      } catch (error) {
        res.status(500).json({ status: false, error: error.message });
      }
    },
  },
];