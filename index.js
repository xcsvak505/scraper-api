const express = require("express");
const fetch = require("node-fetch");

const app = express();

const PORT = process.env.PORT || 3000;

/*
🔥 MANUAL CORS (BIAR GAK CRASH)
*/
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

/*
🔥 MARKET
*/
const MARKETS = {
  turin: { main: "https://turinpools4d.org", code: "p13864" },
  italy: { main: "https://italylotto4d.com", code: "p30527" },
  cuba: { main: "https://cubalotto.com", code: "p30091" },
  france: { main: "https://francelottery4d.com", code: "p30528" },
  bulgaria: { main: "https://bulgarialottodraw.com", code: "p28512" },
  hungary: { main: "https://hungarylotto4d.com", code: "p28513" },
  ecuador: { main: "https://ecuadorlotto.com", code: "p30092" },
  foshan: { main: "https://foshantoto.com", code: "p30093" },
  chile: { main: "https://chilelotto4d.com", code: "p30529" },
  laos: { main: "https://laoslotterydraw.com", code: "p28514" },
  chengdu: { main: "https://chengdutoto.com", code: "p30095" },
  china: { main: "https://chinatoto4d.asia", code: "p13852" },
  chongqing: { main: "https://chongqing4d.com", code: "p30097" },
  japan: { main: "https://japanlottery.online", code: "p15472" },
  kowloon: { main: "https://kowloon4d.com", code: "p30100" },
  jejulotto: { main: "https://jejulotto.com", code: "p28515" },
  taichung: { main: "https://taichung4d.com", code: "p30102" },
  oslo: { main: "https://oslolotto.com", code: "p30531" },
  bhutan: { main: "https://bhutanpools4d.com", code: "p28517" },
  denver: { main: "https://denverwla.us", code: "p30105" },
  toronto: { main: "https://torontolottodraw.com", code: "p28518" }
};

/*
🔥 ROOT
*/
app.get("/", (req, res) => {
  res.send("API RUNNING 🔥");
});

/*
🔥 SCRAPER FINAL
*/
app.get("/scrape", async (req, res) => {
  try {
    const market = req.query.market;

    if (!MARKETS[market]) {
      return res.json({ status: false, message: "Market tidak valid" });
    }

    const config = MARKETS[market];

    /*
    =========================
    🔥 STEP 1: MAIN (AMBIL SEMUA)
    =========================
    */
    const mainHTML = await fetch(config.main).then(r => r.text());

    const mainMatches = [...mainHTML.matchAll(/pool&quot;:&quot;(\d+)/g)];
    const mainNumbers = mainMatches.map(x => x[1]);

    const mainPrize1 = mainNumbers[0];

    if (!mainPrize1) {
      return res.json({ status: false, message: "Main belum keluar" });
    }

    /*
    =========================
    🔥 STEP 2: HISTORY (ANTI ERROR)
    =========================
    */
    const historyURL = `https://duatiga0326.kartu275.com/history/result/${config.code}/kosong`;

    const historyHTML = await fetch(historyURL, {
      headers: { "x-requested-with": "XMLHttpRequest" }
    }).then(r => r.text());

    const allNumbers = [...historyHTML.matchAll(/showdetil\('(\d+)'\)/g)].map(x => x[1]);

    if (allNumbers.length < 2) {
      return res.json({ status: false, message: "History error" });
    }

    // 🔥 PRIZE1 ONLY
    const historyToday = allNumbers[0];
    const historyYesterday = allNumbers[3] || allNumbers[1];

    /*
    =========================
    🔥 STEP 3: VALIDASI
    =========================
    */

    // ✅ CONFIRMED
    if (historyToday && historyToday !== historyYesterday) {
      let result = {};
      for (let i = 0; i < mainNumbers.length; i++) {
        result["prize" + (i + 1)] = mainNumbers[i];
      }

      return res.json({
        status: true,
        type: "CONFIRMED",
        market,
        result
      });
    }

    // ⚡ VALID (CEPAT)
    if (mainPrize1 !== historyToday && mainPrize1 !== historyYesterday) {
      let result = {};
      for (let i = 0; i < mainNumbers.length; i++) {
        result["prize" + (i + 1)] = mainNumbers[i];
      }

      return res.json({
        status: true,
        type: "VALID",
        market,
        result
      });
    }

    return res.json({
      status: false,
      message: "Angka lama / belum update"
    });

  } catch (err) {
    return res.json({
      status: false,
      message: "Error",
      error: err.message
    });
  }
});

/*
🔥 START
*/
app.listen(PORT, () => {
  console.log("RUNNING PORT " + PORT);
});
