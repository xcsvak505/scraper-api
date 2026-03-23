const express = require("express");
const fetch = require("node-fetch");
const app = express();

const PORT = process.env.PORT || 3000;

/*
🔥 FULL MARKET (AUTO DARI KARTUTOTO)
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
  res.send("API RUNNING 🚀");
});

/*
🔥 SCRAPER PRO
*/
app.get("/scrape", async (req, res) => {
  try {
    const market = req.query.market;

    if (!market || !MARKETS[market]) {
      return res.json({ status: false, message: "Market tidak valid" });
    }

    const config = MARKETS[market];

    /*
    =========================
    🔥 STEP 1: MAIN (EARLY DETECT)
    =========================
    */
    let mainNumber = null;

    try {
      const mainHTML = await fetch(config.main).then(r => r.text());
      const match = mainHTML.match(/pool&quot;:&quot;(\d+)/i);
      mainNumber = match ? match[1] : null;
    } catch {}

    /*
    =========================
    🔥 STEP 2: HISTORY (CONFIRM)
    =========================
    */
    const historyURL = `https://duatiga0326.kartu275.com/history/result/${config.code}/kosong`;

    const historyHTML = await fetch(historyURL, {
      headers: { "x-requested-with": "XMLHttpRequest" }
    }).then(r => r.text());

    const matches = [...historyHTML.matchAll(/showdetil\('(\d+)'\)/g)];

    if (matches.length < 6) {
      return res.json({ status: false, message: "History error" });
    }

    const today = matches.slice(0, 3).map(x => x[1]);
    const yesterday = matches.slice(3, 6).map(x => x[1]);

    /*
    =========================
    🔥 STEP 3: LOGIC PRO
    =========================
    */

    // 🔥 CONFIRMED (PALING VALID)
    if (today[0] !== yesterday[0]) {
      return res.json({
        status: true,
        type: "CONFIRMED",
        market,
        result: {
          prize1: today[0],
          prize2: today[1],
          prize3: today[2]
        }
      });
    }

    // ⚡ EARLY (LEBIH CEPAT)
    if (mainNumber && mainNumber !== yesterday[0]) {
      return res.json({
        status: true,
        type: "EARLY",
        market,
        result: {
          prize1: mainNumber
        }
      });
    }

    return res.json({
      status: false,
      message: "Belum update"
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
  console.log("RUNNING ON PORT " + PORT);
});
