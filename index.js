const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

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
    🔥 STEP 1: MAIN (AMBIL SEMUA ANGKA)
    =========================
    */
    const mainHTML = await fetch(config.main).then(r => r.text());

    const mainMatches = [...mainHTML.matchAll(/pool&quot;:&quot;(\d+)/g)];
    const mainNumbers = mainMatches.map(x => x[1]);

    const mainPrize1 = mainNumbers[0];

    if(!mainPrize1){
      return res.json({ status:false, message:"Main belum keluar" });
    }

    /*
    =========================
    🔥 STEP 2: HISTORY (PRIZE1 SAJA)
    =========================
    */
    const historyURL = `https://duatiga0326.kartu275.com/history/result/${config.code}/kosong`;

    const historyHTML = await fetch(historyURL, {
      headers: { "x-requested-with": "XMLHttpRequest" }
    }).then(r => r.text());

    const rows = [...historyHTML.matchAll(/<tr>([\s\S]*?)<\/tr>/g)];

    if(rows.length < 3){
      return res.json({ status:false, message:"History error" });
    }

    const getNumbers = (row) => {
      return [...row.matchAll(/showdetil\('(\d+)'\)/g)].map(x => x[1]);
    };

    const today = getNumbers(rows[1][1]);
    const yesterday = getNumbers(rows[2][1]);

    const historyToday = today[0];
    const historyYesterday = yesterday[0];

    /*
    =========================
    🔥 STEP 3: VALIDATION (PRIZE1 ONLY)
    =========================
    */

    // ✅ CONFIRMED
    if(historyToday && historyToday !== historyYesterday){
      let result = {};
      today.forEach((n,i)=> result["prize"+(i+1)] = n);

      return res.json({
        status:true,
        type:"CONFIRMED",
        market,
        result
      });
    }

    // ⚡ VALID (EARLY CEPAT)
    if(mainPrize1 !== historyToday && mainPrize1 !== historyYesterday){
      let result = {};
      mainNumbers.forEach((n,i)=> result["prize"+(i+1)] = n);

      return res.json({
        status:true,
        type:"VALID",
        market,
        result
      });
    }

    return res.json({
      status:false,
      message:"Angka lama / belum update"
    });

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
  console.log("RUNNING " + PORT);
});
