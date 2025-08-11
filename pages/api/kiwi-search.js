
export default async function handler(req, res) {
  try {
    const { origin = "FRA", destination = "AGP", daysAhead = "30" } = req.query;
    const today = new Date();
    const to = new Date();
    to.setDate(today.getDate() + parseInt(String(daysAhead)));
    const format = (d) => d.toISOString().slice(0, 10);

    const url = new URL("https://api.tequila.kiwi.com/v2/search");
    url.searchParams.set("fly_from", String(origin));
    url.searchParams.set("fly_to", String(destination));
    url.searchParams.set("date_from", format(today));
    url.searchParams.set("date_to", format(to));
    url.searchParams.set("curr", "EUR");
    url.searchParams.set("limit", "20");
    url.searchParams.set("sort", "price");
    url.searchParams.set("asc", "1");
    url.searchParams.set("one_for_city", "1");

    const apiKey = process.env.KIWI_API_KEY || "";
    if (!apiKey) {
      return res.status(200).json({
        results: [
          { date: format(today), price: 79, airline: "Ryanair", nonstop: true, link: "#" },
          { date: format(to), price: 89, airline: "Eurowings", nonstop: true, link: "#" },
        ],
        note: "Kein KIWI_API_KEY gesetzt. Demo Daten."
      });
    }

    const r = await fetch(url.toString(), { headers: { apikey: apiKey } });
    if (!r.ok) throw new Error("Kiwi API Fehler");
    const json = await r.json();

    const results = (json?.data || []).map((it) => ({
      date: (it.local_departure || it.route?.[0]?.local_departure || "").slice(0, 10),
      price: it.price,
      airline: it.airlines?.[0] || (it.route?.[0]?.airline) || "n/a",
      nonstop: (it.route?.length || 1) === 1,
      link: it.deep_link || "#",
    }));

    res.status(200).json({ results });
  } catch (e) {
    res.status(500).json({ error: e?.message || "unknown" });
  }
}
