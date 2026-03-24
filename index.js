const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

/*
🔥 CORS
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
🔥 HELPER
*/
const getTodayDate = () => new Date().toISOString().slice(0,10);

// normalize 4 digit
const normalize = (num) => {
  return num.replace(/\D/g,'').slice(-4);
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
      return res.json({ status:false, message:"Market tidak valid" });
    }

    const config = MARKETS[market];

    /*
    =========================
    🔥 MAIN (SOURCE UTAMA)
    =========================
    */
    const mainHTML = await fetch(config.main).then(r => r.text());

    let mainNumbers = [...mainHTML.matchAll(/pool&quot;:&quot;(\d+)/g)].map(x => x[1]);

    // remove duplicate
    mainNumbers = [...new Set(mainNumbers)];

    const mainPrize1 = mainNumbers[0];

    if (!mainPrize1) {
      return res.json({ status:false, message:"Main belum keluar" });
    }

    /*
    =========================
    🔥 HISTORY (VALIDASI)
    =========================
    */
    const historyURL = `https://duaempat0326.kartu275.com/history/result/${config.code}/kosong`;

    const historyHTML = await fetch(historyURL, {
      headers: {
        "x-requested-with": "XMLHttpRequest",
        "user-agent": "Mozilla/5.0"
      }
    }).then(r => r.text());

    const allNumbers = [...historyHTML.matchAll(/showdetil\('(\d+)'\)/g)].map(x => x[1]);
    const allDates = [...historyHTML.matchAll(/(\d{4}-\d{2}-\d{2})/g)].map(x => x[1]);

    if (allNumbers.length < 1 || allDates.length < 1) {
      return res.json({ status:false, message:"History error" });
    }

    const historyDate = allDates[0];
    const todayDate = getTodayDate();

    /*
    =========================
    🔥 NORMALIZE (FIX 4 DIGIT BUG)
    =========================
    */
    const main4D = normalize(mainPrize1);
    const history4D = allNumbers.map(n => normalize(n));

    /*
    =========================
    🔥 OUTPUT (SELALU DARI MAIN)
    =========================
    */
    let result = {};
    mainNumbers.forEach((n,i)=> result["prize"+(i+1)] = n);

    /*
    =========================
    🔥 LOGIC FINAL
    =========================
    */

    // BELUM UPDATE
    if (historyDate !== todayDate) {

      if (!history4D.includes(main4D)) {
        return res.json({
          status:true,
          type:"VALID",
          market,
          result
        });
      }

      return res.json({
        status:true,
        type:"OLD",
        market,
        result
      });
    }

    // SUDAH UPDATE
    if (historyDate === todayDate) {

      return res.json({
        status:true,
        type:"CONFIRMED",
        market,
        result
      });
    }

  } catch (err) {
    return res.json({
      status:false,
      message:"Error",
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
