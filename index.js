const express = require("express");
const fetch = require("node-fetch");
const app = express();

const PORT = process.env.PORT || 3000;

/*
🔥 MAPPING PASARAN
Tambahin kalau nanti kamu dapat code baru
*/
const MARKETS = {
  totomacau: { main: "", code: "m17" },
  austria: { main: "", code: "p13850" },
  cambodia: { main: "", code: "p13851" },
  china: { main: "", code: "p13852" },
  cyprus: { main: "", code: "p13853" },
  guangdong: { main: "", code: "p13854" },
  hongkong: { main: "", code: "p13855" },
  madrid: { main: "", code: "p13856" },
  miami: { main: "", code: "p13857" },
  philippines: { main: "", code: "p13858" },
  roma: { main: "", code: "p13859" },
  singapore: { main: "", code: "p13860" },
  sydney: { main: "", code: "p13861" },
  taiwan: { main: "", code: "p13862" },
  totobeijing: { main: "", code: "p13863" },
  turin: { main: "", code: "p13864" },
  japan: { main: "", code: "p15472" },
  iceland: { main: "", code: "p15473" },
  bullseye: { main: "", code: "p18887" },
  newyorkeve: { main: "", code: "p18901" },
  newyorkmid: { main: "", code: "p18902" },
  floridamid: { main: "", code: "p18903" },
  floridaeve: { main: "", code: "p18904" },
  kentuckyeve: { main: "", code: "p18905" },
  kentuckymid: { main: "", code: "p18906" },
  carolinaeve: { main: "", code: "p18907" },
  carolinaday: { main: "", code: "p18908" },
  oregon12: { main: "", code: "p18909" },
  oregon09: { main: "", code: "p18910" },
  oregon03: { main: "", code: "p18911" },
  oregon06: { main: "", code: "p18912" },
  california: { main: "", code: "p18913" },
  bulgaria: { main: "", code: "p28512" },
  hungary: { main: "", code: "p28513" },
  laos: { main: "", code: "p28514" },
  jejulotto: { main: "", code: "p28515" },
  totofuzhou: { main: "", code: "p28516" },
  bhutan: { main: "", code: "p28517" },
  toronto: { main: "", code: "p28518" },
  monaco: { main: "", code: "p30090" },
  cuba: { main: "", code: "p30091" },
  ecuador: { main: "", code: "p30092" },
  foshan: { main: "", code: "p30093" },
  chengdu: { main: "", code: "p30095" },
  chongqing: { main: "", code: "p30097" },
  kowloon: { main: "", code: "p30100" },
  taichung: { main: "", code: "p30102" },
  haiti: { main: "", code: "p30104" },
  denver: { main: "", code: "p30105" },
  italy: { main: "", code: "p30527" },
  france: { main: "", code: "p30528" },
  chile: { main: "", code: "p30529" },
  mexico: { main: "", code: "p30530" },
  oslo: { main: "", code: "p30531" },
  totomacao5d: { main: "", code: "m51" },
  kingkong4d: { main: "", code: "m83" }
};

/*
🔥 ROOT
*/
app.get("/", (req, res) => {
  res.send("API RUNNING 🚀");
});

/*
🔥 SCRAPER
*/
app.get("/scrape", async (req, res) => {
  try {
    const market = req.query.market;

    if (!market || !MARKETS[market]) {
      return res.json({
        status: false,
        message: "Market tidak valid"
      });
    }

    const config = MARKETS[market];

    /*
    =========================
    🔥 STEP 1: SCRAPE MAIN SITE
    =========================
    */
    const mainHTML = await fetch(config.main).then(r => r.text());

    const poolMatch = mainHTML.match(/pool&quot;:&quot;(\d+)/i);
    const mainNumber = poolMatch ? poolMatch[1] : null;

    if (!mainNumber) {
      return res.json({
        status: false,
        message: "Gagal ambil angka dari main site"
      });
    }

    /*
    =========================
    🔥 STEP 2: SCRAPE HISTORY (AJAX)
    =========================
    */
    const historyURL = `https://duatiga0326.kartu275.com/history/result/${config.code}/kosong`;

    const historyHTML = await fetch(historyURL, {
      headers: {
        "x-requested-with": "XMLHttpRequest"
      }
    }).then(r => r.text());

    const matches = [...historyHTML.matchAll(/showdetil\('(\d+)'\)/g)];

    if (matches.length < 6) {
      return res.json({
        status: false,
        message: "Data history tidak cukup"
      });
    }

    const today = matches.slice(0, 3).map(x => x[1]);
    const yesterday = matches.slice(3, 6).map(x => x[1]);

    /*
    =========================
    🔥 STEP 3: VALIDASI
    =========================
    */

    // ❌ belum update
    if (JSON.stringify(today) === JSON.stringify(yesterday)) {
      return res.json({
        status: false,
        message: "Belum update (angka sama)"
      });
    }

    // ❌ kalau main belum masuk history
    if (!today.includes(mainNumber)) {
      return res.json({
        status: false,
        message: "Main belum sinkron"
      });
    }

    /*
    =========================
    🔥 STEP 4: OUTPUT
    =========================
    */
    return res.json({
      status: true,
      market,
      result: {
        prize1: today[0],
        prize2: today[1],
        prize3: today[2]
      },
      message: "VALID RESULT ✅"
    });

  } catch (err) {
    return res.json({
      status: false,
      message: "Error server",
      error: err.message
    });
  }
});

/*
🔥 START
*/
app.listen(PORT, () => {
  console.log("API RUNNING ON PORT " + PORT);
});
