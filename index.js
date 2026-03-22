const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("API RUNNING 🚀");
});

app.get("/scrape", async (req, res) => {
    try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.json({ status: false });
        }

        const response = await axios.get(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const html = response.data;

        const regex = /pool(?:&quot;|"):(?:&quot;|")(\d+)/gi;

        let match;
        let unique = new Set();

        while ((match = regex.exec(html)) !== null) {
            unique.add(match[1]);
        }

        const numbers = Array.from(unique);

        const labels = ["prize1", "prize2", "prize3", "starter", "consolation"];
        const output = {};

        numbers.forEach((num, i) => {
            output[labels[i] || `extra${i}`] = num;
        });

        res.json({
            status: true,
            total: numbers.length,
            data: output
        });

    } catch (err) {
        res.json({
            status: false,
            message: "error",
            error: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log("API running 🚀");
});
