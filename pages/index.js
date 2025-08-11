
import React, { useEffect, useMemo, useState } from "react";

const ORIGIN_GROUPS = [
  { key: "DE_WEST", name: "Westdeutschland (Region)", airports: ["DUS", "FRA", "FMO", "CGN", "DTM"] },
  { key: "DE_SÜD", name: "Süddeutschland (Region)", airports: ["MUC", "STR", "NUE", "FKB"] },
  { key: "DE_NORD", name: "Norddeutschland (Region)", airports: ["HAM", "HAJ", "BRE"] },
  { key: "NL_RANDSTAD", name: "Niederlande Randstad (Region)", airports: ["AMS", "EIN", "RTM"] },
  { key: "UK_LONDON", name: "London Region (UK)", airports: ["LHR", "LGW", "STN", "LTN", "SEN"] },
  { key: "UK_NORTH", name: "Nordengland (UK)", airports: ["MAN", "LPL", "NCL", "LBA"] },
];

const ORIGINS = [
  { code: "FRA", name: "Frankfurt" },
  { code: "DUS", name: "Düsseldorf" },
  { code: "FMO", name: "Münster Osnabrück" },
  { code: "AMS", name: "Amsterdam" },
  { code: "EIN", name: "Eindhoven" },
  { code: "LHR", name: "London Heathrow" },
  { code: "LGW", name: "London Gatwick" },
  { code: "MAN", name: "Manchester" },
];

const DESTINATIONS = [
  { code: "AGP", name: "Málaga" },
  { code: "PMI", name: "Palma de Mallorca" },
  { code: "ALC", name: "Alicante" },
];

const DEFAULT_ROWS = [
  { date: "2025-08-18", price: 69, airline: "Ryanair", nonstop: true, link: "#" },
  { date: "2025-08-22", price: 74, airline: "Eurowings", nonstop: true, link: "#" },
  { date: "2025-08-25", price: 83, airline: "Lufthansa", nonstop: true, link: "#" },
  { date: "2025-08-28", price: 96, airline: "Vueling", nonstop: false, link: "#" },
];

function formatEUR(n) { return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n); }
function classNames(...arr) { return arr.filter(Boolean).join(" "); }

export default function Home() {
  const [origin, setOrigin] = useState(ORIGINS[0].code);
  const [destination, setDestination] = useState(DESTINATIONS[0].code);
  const [daysAhead, setDaysAhead] = useState(30);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [useDemo, setUseDemo] = useState(true);

  const title = useMemo(() => {
    const oName = ORIGINS.find(x => x.code === origin)?.name || ORIGIN_GROUPS.find(g => g.key === origin)?.name || origin;
    const d = DESTINATIONS.find(x => x.code === destination)?.name || destination;
    return `Günstigste Flüge ${oName} → ${d}`;
  }, [origin, destination]);

  async function fetchLive() {
    setLoading(true);
    try {
      const group = ORIGIN_GROUPS.find(g => g.key === origin);
      const flyFrom = group ? group.airports.join(",") : origin;
      const res = await fetch(`/api/kiwi-search?origin=${encodeURIComponent(flyFrom)}&destination=${destination}&daysAhead=${daysAhead}`);
      if (!res.ok) throw new Error("Fehler beim Laden");
      const data = await res.json();
      setRows(data.results);
    } catch (e) {
      console.error(e);
      setRows(DEFAULT_ROWS);
    } finally {
      setLoading(false);
    }
  }

  function onSearch() {
    if (useDemo) {
      const shuffled = [...DEFAULT_ROWS].map(r => ({ ...r, price: Math.max(39, Math.round(r.price * (0.9 + Math.random() * 0.3))) })).sort((a, b) => a.price - b.price);
      setRows(shuffled);
    } else {
      fetchLive();
    }
  }

  useEffect(() => { onSearch(); }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Küstenflüge Finder</h1>
          <div className="text-sm opacity-80">MVP Vorschau</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <section className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-sm mb-2">Abflug</div>
            <div className="grid grid-cols-1 gap-2">
              <select className="w-full p-3 rounded-xl border" value={origin} onChange={e => setOrigin(e.target.value)}>
                <optgroup label="Einzelne Flughäfen">
                  {ORIGINS.map(o => (<option key={o.code} value={o.code}>{o.name} ({o.code})</option>))}
                </optgroup>
                <optgroup label="Regionen">
                  {ORIGIN_GROUPS.map(g => (<option key={g.key} value={g.key}>{g.name}</option>))}
                </optgroup>
              </select>
              <div className="text-xs text-neutral-500">Tipp: Wähle eine Region, um mehrere Flughäfen auf einmal zu durchsuchen.</div>
            </div>
          </Card>

          <Card>
            <div className="text-sm mb-2">Ziel</div>
            <select className="w-full p-3 rounded-xl border" value={destination} onChange={e => setDestination(e.target.value)}>
              {DESTINATIONS.map(d => (<option key={d.code} value={d.code}>{d.name} ({d.code})</option>))}
            </select>
          </Card>

          <Card>
            <div className="text-sm mb-2">Zeitraum</div>
            <div className="flex items-center gap-3">
              <input type="range" min={7} max={60} value={daysAhead} onChange={e => setDaysAhead(parseInt(e.target.value))} className="w-full" />
              <div className="w-16 text-right">{daysAhead} Tage</div>
            </div>
            <label className="flex items-center gap-2 text-sm mt-3">
              <input type="checkbox" checked={useDemo} onChange={e => setUseDemo(e.target.checked)} />
              Demo Daten verwenden
            </label>
          </Card>
        </section>

        <section className="grid md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{title}</h2>
                <button onClick={onSearch} className={classNames("px-4 py-2 rounded-xl text-sm", loading ? "bg-neutral-300" : "bg-neutral-900 text-white hover:opacity-90")} disabled={loading}>
                  {loading ? "Laden…" : "Aktualisieren"}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-sm border-b">
                      <th className="py-2 pr-4">Datum</th>
                      <th className="py-2 pr-4">Airline</th>
                      <th className="py-2 pr-4">Nonstop</th>
                      <th className="py-2 pr-4">Preis</th>
                      <th className="py-2 pr-4">Buchen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 pr-4 whitespace-nowrap">{r.date}</td>
                        <td className="py-3 pr-4">{r.airline}</td>
                        <td className="py-3 pr-4">{r.nonstop ? "Ja" : "Nein"}</td>
                        <td className="py-3 pr-4 font-medium">{formatEUR(r.price)}</td>
                        <td className="py-3 pr-4"><a href={r.link} className="underline" target="_blank" rel="noreferrer">Zum Angebot</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-neutral-500 mt-3">Preise sind im Demo Modus nur Beispiele. Für Live Preise Demo ausschalten und API Key setzen.</div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-semibold mb-2">Ankunft und Abflug</h3>
              <p className="text-sm mb-3">Verlinke auf die offiziellen Live Tafeln der Flughäfen.</p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Málaga AGP Live Tafel</li>
                <li>Palma PMI Live Tafel</li>
                <li>Alicante ALC Live Tafel</li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold mb-2">Regionale Partner</h3>
              <p className="text-sm mb-3">Platz für Hotels, Mietwagen, Tour Anbieter.</p>
              <button className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm">Partner werden</button>
            </Card>
          </div>
        </section>
      </main>
      <footer className="max-w-6xl mx-auto px-4 pb-12 text-xs text-neutral-500">© {new Date().getFullYear()} Küstenflüge. Preise ohne Gewähr. Affiliate Links möglich.</footer>
    </div>
  );
}

function Card({ children }) { return (<div className="bg-white rounded-2xl shadow-sm border p-4">{children}</div>); }
