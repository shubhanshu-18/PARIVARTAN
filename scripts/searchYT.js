const https = require("https");

function searchYT(query) {
  return new Promise((resolve) => {
    https
      .get(
        "https://www.youtube.com/results?search_query=" +
          encodeURIComponent(query),
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            const matches = [
              ...data.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g),
            ];
            if (matches && matches.length > 0) resolve(matches[0][1]);
            else resolve("4K_X0DXXaGk");
          });
        },
      )
      .on("error", () => resolve("4K_X0DXXaGk"));
  });
}

async function run() {
  const queries = [
    "Kirana shop business plan",
    "Street food stall business",
    "Electrical repair shop business",
    "Tractor repair shop business",
    "MSME registration process",
  ];
  for (const q of queries) {
    const id = await searchYT(q);
    console.log(q + " -> " + id);
  }
}
run();
