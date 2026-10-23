// Grant Aviation Mobile Web App (iteration prototype)
// Passenger + Employee modes. Mock data in localStorage for fast iteration.
// Live map via OpenSky. Later wrap in Capacitor/React Native for real mobile app.

const AIRPORTS = {
  ANC: "Anchorage", ENA: "Kenai", BET: "Bethel", DLG: "Dillingham", AKN: "King Salmon",
  CDB: "Cold Bay", DUT: "Dutch Harbor", EMK: "Emmonak",
  // Bethel
  VAK: "Chevak", HPB: "Hooper Bay", SCM: "Scammon Bay", WWT: "Mertarvik", NME: "Nightmute",
  OOK: "Toksook Bay", TNK: "Tununak", MYU: "Mekoryuk", CYF: "Chefornak", KPN: "Kipnuk",
  KKH: "Kongiganak", KWK: "Kwigillingok", WTL: "Tuntutuliak", KWN: "Quinhagak", EEK: "Eek",
  KOT: "Kotlik", SXP: "Nunam Iqua", AUK: "Alakanuk", ATT: "Atmautluak", NUP: "Nunapitchuk",
  KUK: "Kasigluk", MLL: "Marshall", PQS: "Pilot Station", KSM: "St Mary's", MOU: "Mountain Village",
  // Cold Bay
  KVC: "King Cove", KFP: "False Pass", NLG: "Nelson Lagoon", PML: "Port Moller",
  // Dillingham
  TOG: "Togiak", TWA: "Twin Hills", KMO: "Manokotak", CLP: "Clarks Point", KLL: "Levelock",
  KNW: "New Stuyahok", KEK: "Ekwok", KGK: "Koliganek",
  // Dutch Harbor (Akun: Akutan's airport is on Akun Island)
  KQA: "Akun", AKB: "Atka", IKO: "Nikolski", SNP: "St. Paul", STG: "St. George",
  // King Salmon
  WSN: "South Naknek", EGX: "Egegik", IGG: "Igiugig", PIP: "Pilot Point", UGB: "Ugashik",
  PTH: "Port Heiden", KPV: "Perryville", KBW: "Chignik Bay", KCQ: "Chignik Lake", KCL: "Chignik Lagoon"
};

// Approximate airport positions [lat, lon] for the employee run map and mock flight lengths (decimal degrees, west negative).
const AIRPORT_COORDS = {
  ANC: [61.174, -149.996], ENA: [60.573, -151.245], BET: [60.780, -161.838], DLG: [59.045, -158.505],
  AKN: [58.677, -156.649], CDB: [55.206, -162.725], DUT: [53.900, -166.544], EMK: [62.786, -164.491],
  VAK: [61.534, -165.584], HPB: [61.524, -166.147], SCM: [61.845, -165.571], WWT: [60.824, -164.504],
  NME: [60.471, -164.701], OOK: [60.542, -165.087], TNK: [60.576, -165.272], MYU: [60.371, -166.271],
  CYF: [60.150, -164.286], KPN: [59.933, -164.031], KKH: [59.961, -162.881], KWK: [59.876, -163.169],
  WTL: [60.336, -162.667], KWN: [59.755, -161.845], EEK: [60.214, -162.044], KOT: [63.031, -163.533],
  SXP: [62.521, -164.848], AUK: [62.680, -164.660], ATT: [60.867, -162.273], NUP: [60.906, -162.439],
  KUK: [60.874, -162.524], MLL: [61.864, -162.026], PQS: [61.934, -162.900], KSM: [62.061, -163.302],
  MOU: [62.096, -163.682],
  KVC: [55.116, -162.266], KFP: [54.847, -163.410], NLG: [56.008, -161.160], PML: [56.006, -160.561],
  TOG: [59.053, -160.397], TWA: [59.076, -160.273], KMO: [58.990, -159.050], CLP: [58.834, -158.529],
  KLL: [59.128, -156.859], KNW: [59.450, -157.328], KEK: [59.357, -157.471], KGK: [59.727, -157.259],
  KQA: [54.133, -165.778], AKB: [52.220, -174.206], IKO: [52.942, -168.849], SNP: [57.167, -170.220],
  STG: [56.578, -169.662],
  WSN: [58.703, -157.003], EGX: [58.186, -157.376], IGG: [59.324, -155.902], PIP: [57.580, -157.572],
  UGB: [57.528, -157.399], PTH: [56.959, -158.633], KPV: [55.906, -159.163], KBW: [56.296, -158.401],
  KCQ: [56.255, -158.775], KCL: [56.311, -158.534]
};

// Grant's real scheduled network: hub → places it flies to nonstop. Every route is flown both ways.
const GRANT_NETWORK = {
  ANC: ["ENA"],
  BET: ["VAK", "HPB", "SCM", "WWT", "NME", "OOK", "TNK", "MYU", "CYF", "KPN", "KKH", "KWK", "WTL", "KWN", "EEK",
    "EMK", "KOT", "SXP", "AUK", "ATT", "NUP", "KUK", "MLL", "PQS", "KSM", "MOU", "DLG"],
  EMK: ["BET", "KOT", "SXP", "AUK"],
  CDB: ["KVC", "KFP", "NLG", "PML"],
  DLG: ["TOG", "TWA", "KMO", "CLP", "AKN", "KLL", "KNW", "KEK", "KGK"],
  DUT: ["KQA", "AKB", "IKO", "SNP", "STG"],
  AKN: ["KLL", "WSN", "EGX", "IGG", "DLG", "PIP", "UGB", "PTH", "KPV", "KBW", "KCQ", "KCL"]
};
// Routes Grant only flies part of the year.
const SEASONAL_PAIRS = new Set(["BET-DLG", "DLG-BET"]);

// Every Grant route as unique code pairs [a, b] (a < b), then both directions as labelled ROUTES.
const GRANT_PAIRS = (() => {
  const seen = new Map();
  Object.keys(GRANT_NETWORK).forEach(hub => GRANT_NETWORK[hub].forEach(c => {
    const pair = [hub, c].sort();
    seen.set(pair.join("-"), pair);
  }));
  return [...seen.values()];
})();
const ROUTES = GRANT_PAIRS.flatMap(([a, b]) => [
  { from: airportLabel(a), to: airportLabel(b) },
  { from: airportLabel(b), to: airportLabel(a) }
]);

// Other airlines fly Anchorage to Grant's hubs (Grant doesn't). Every leg is flown both ways.
// No partner times in the app: passengers check times on the airline's own site.
const PARTNER_AIRLINES = {
  alaska: { name: "Alaska Airlines", button: "Book this part with Alaska Airlines", url: "https://www.alaskaair.com/" },
  ravn: { name: "Ravn Alaska", button: "Book with Ravn Alaska", url: "https://www.ravnalaska.com/fly" }
};
const PARTNER_ROUTES = [
  ["alaska", "ANC", ["BET", "DLG", "AKN", "CDB", "DUT", "SNP", "KSM"]],
  ["ravn", "ANC", ["CDB", "DUT", "SNP", "KSM"]]
];
// [{ airline, from, to }] in both directions.
const PARTNER_LEGS = PARTNER_ROUTES.flatMap(([airline, from, tos]) =>
  tos.flatMap(to => [{ airline, from, to }, { airline, from: to, to: from }]));

// Unique airport list for From/To selects (anywhere Grant or a partner flies): hubs first, then villages A–Z.
const HUB_ORDER = ["Anchorage (ANC)", "Kenai (ENA)", "Bethel (BET)", "Dillingham (DLG)", "King Salmon (AKN)", "Dutch Harbor (DUT)", "Cold Bay (CDB)", "Emmonak (EMK)"];
const BOOK_AIRPORTS = (() => {
  const all = new Set();
  ROUTES.forEach(r => { all.add(r.from); all.add(r.to); });
  PARTNER_LEGS.forEach(l => { all.add(airportLabel(l.from)); all.add(airportLabel(l.to)); });
  const hubs = HUB_ORDER.filter(a => all.has(a));
  const villages = [...all].filter(a => !HUB_ORDER.includes(a)).sort();
  return [...hubs, ...villages];
})();

function airportOptions(selected, placeholder) {
  const ph = placeholder ? `<option value="" disabled${selected ? "" : " selected"}>${placeholder}</option>` : "";
  return ph + BOOK_AIRPORTS.map(a => `<option value="${a}"${a === selected ? " selected" : ""}>${a}</option>`).join("");
}

// Mock daily flights by route (times in 24h local). Real schedules vary by day/season.
const MOCK_FLIGHTS = {
  "Anchorage (ANC)-Kenai (ENA)": [
    { num: "GV5515", dep: "05:00", arr: "05:35", dur: "35m" },
    { num: "GV5525", dep: "05:30", arr: "06:05", dur: "35m" },
    { num: "GV5535", dep: "06:00", arr: "06:35", dur: "35m" },
    { num: "GV5555", dep: "07:00", arr: "07:35", dur: "35m" },
    { num: "GV5565", dep: "07:30", arr: "08:05", dur: "35m" },
    { num: "GV5575", dep: "08:00", arr: "08:35", dur: "35m" },
    { num: "GV5595", dep: "09:00", arr: "09:35", dur: "35m" },
    { num: "GV5615", dep: "10:00", arr: "10:35", dur: "35m" },
    { num: "GV5635", dep: "11:00", arr: "11:35", dur: "35m" },
    { num: "GV5675", dep: "13:00", arr: "13:35", dur: "35m" },
    { num: "GV5695", dep: "14:00", arr: "14:35", dur: "35m" }
  ],
  "Kenai (ENA)-Anchorage (ANC)": [
    { num: "GV6005", dep: "06:00", arr: "06:35", dur: "35m" },
    { num: "GV6025", dep: "07:00", arr: "07:35", dur: "35m" },
    { num: "GV6045", dep: "08:00", arr: "08:35", dur: "35m" },
    { num: "GV6065", dep: "09:30", arr: "10:05", dur: "35m" },
    { num: "GV6085", dep: "11:00", arr: "11:35", dur: "35m" },
    { num: "GV6105", dep: "13:00", arr: "13:35", dur: "35m" },
    { num: "GV6125", dep: "15:00", arr: "15:35", dur: "35m" },
    { num: "GV6145", dep: "17:00", arr: "17:35", dur: "35m" }
  ],
  "Bethel (BET)-Chevak (VAK)": [
    { num: "GV2905", dep: "08:30", arr: "09:15", dur: "45m" },
    { num: "GV2910", dep: "11:00", arr: "11:45", dur: "45m" },
    { num: "GV2920", dep: "14:30", arr: "15:15", dur: "45m" }
  ],
  "Bethel (BET)-Emmonak (EMK)": [
    { num: "GV1610", dep: "09:30", arr: "10:45", dur: "1h15m" },
    { num: "GV1630", dep: "12:45", arr: "13:45", dur: "1h" },
    { num: "GV1650", dep: "16:15", arr: "17:15", dur: "1h" }
  ]
};

// Mock legs used to build connecting itineraries: [num, from, to, dep, arr] (24h local).
// Hand-written legs first; every other Grant route gets generated legs below. Real direct routes in
// MOCK_FLIGHTS and the PASSENGER_RUN_IDS runs are added on top.
const CONNECTION_FLIGHTS = [
  // Bethel ↔ villages (Bethel → Chevak and Bethel → Emmonak come from MOCK_FLIGHTS)
  ["GV2906", "VAK", "BET", "09:35", "10:20"], ["GV2912", "VAK", "BET", "12:05", "12:50"], ["GV2922", "VAK", "BET", "15:35", "16:20"],
  ["GV2931", "BET", "HPB", "09:00", "09:50"], ["GV2933", "BET", "HPB", "13:15", "14:05"],
  ["GV2932", "HPB", "BET", "10:10", "11:00"], ["GV2934", "HPB", "BET", "14:25", "15:15"],
  ["GV2941", "BET", "KPN", "08:00", "08:40"], ["GV2943", "BET", "KPN", "14:00", "14:40"],
  ["GV2942", "KPN", "BET", "09:00", "09:40"], ["GV2944", "KPN", "BET", "15:00", "15:40"],
  ["GV1611", "EMK", "BET", "11:15", "12:30"], ["GV1631", "EMK", "BET", "14:15", "15:15"], ["GV1651", "EMK", "BET", "17:45", "18:45"],
  // Emmonak ↔ Kotlik
  ["GV8101", "EMK", "KOT", "11:30", "11:50"], ["GV8103", "EMK", "KOT", "14:30", "14:50"], ["GV8105", "EMK", "KOT", "18:00", "18:20"],
  ["GV8102", "KOT", "EMK", "12:10", "12:30"], ["GV8104", "KOT", "EMK", "15:10", "15:30"], ["GV8106", "KOT", "EMK", "18:40", "19:00"],
  // Bristol Bay
  ["GV4101", "DLG", "TOG", "08:00", "08:35"], ["GV4103", "DLG", "TOG", "13:00", "13:35"], ["GV4105", "DLG", "TOG", "17:15", "17:50"],
  ["GV4102", "TOG", "DLG", "08:55", "09:30"], ["GV4104", "TOG", "DLG", "13:55", "14:30"], ["GV4106", "TOG", "DLG", "18:10", "18:45"],
  ["GV4201", "AKN", "DLG", "09:30", "10:10"], ["GV4203", "AKN", "DLG", "13:00", "13:40"],
  ["GV4202", "DLG", "AKN", "10:40", "11:20"], ["GV4204", "DLG", "AKN", "14:10", "14:50"],
  // Aleutians
  ["GV7101", "DUT", "AKB", "11:00", "12:45"], ["GV7102", "AKB", "DUT", "13:15", "15:00"],
  ["GV9201", "CDB", "KVC", "16:30", "16:50"], ["GV9203", "CDB", "KVC", "08:20", "08:40"],
  ["GV9202", "KVC", "CDB", "17:10", "17:30"], ["GV9204", "KVC", "CDB", "09:00", "09:20"]
];

// Generated mock legs for every Grant route not covered above: three out-and-backs a day from the hub
// (morning, around midday, afternoon), one for seasonal routes. Length from distance at Caravan speed.
// Numbers GV3001–GV3399: odd leaves the hub, even comes back.
(() => {
  const covered = new Set();
  Object.keys(MOCK_FLIGHTS).forEach(k => covered.add(k.split("-").map(airportCodeOf).sort().join("-")));
  CONNECTION_FLIGHTS.forEach(([, from, to]) => covered.add([from, to].sort().join("-")));
  const hubOf = pair => Object.keys(GRANT_NETWORK).find(h => pair.includes(h) && GRANT_NETWORK[h].includes(pair.find(c => c !== h))) || pair[0];
  let n = 3001;
  GRANT_PAIRS.filter(p => !covered.has(p.join("-"))).forEach((pair, i) => {
    const hub = hubOf(pair);
    const spoke = pair.find(c => c !== hub);
    const [la1, lo1] = AIRPORT_COORDS[hub];
    const [la2, lo2] = AIRPORT_COORDS[spoke];
    const nm = 60 * Math.hypot(la2 - la1, (lo2 - lo1) * Math.cos((la1 + la2) / 2 * Math.PI / 180));
    const dur = Math.max(15, Math.round((nm / 150 * 60 + 10) / 5) * 5);
    const offset = (i * 7 % 6) * 10;
    const starts = SEASONAL_PAIRS.has(hub + "-" + spoke) ? [11 * 60] : [7 * 60 + 30, 12 * 60 + 30, 16 * 60 + 30];
    starts.forEach(start => {
      const dep = start + offset;
      const back = dep + dur + 25;
      CONNECTION_FLIGHTS.push(
        ["GV" + n, hub, spoke, fmtMin(dep), fmtMin(dep + dur)],
        ["GV" + (n + 1), spoke, hub, fmtMin(back), fmtMin(back + dur)]);
      n += 2;
    });
  });
})();

// Employee runs passengers can book onto; consecutive legs share one flight number (stay on the plane).
const PASSENGER_RUN_IDS = ["R-BET-1", "R-BET-2", "R-BET-3", "R-DLG-1", "R-CDB-1", "R-DUT-1"];
const MIN_LAYOVER = 40;   // minutes, when changing planes
const MAX_LAYOVER = 360;  // no overnight connections in the mock
const MAX_ITINERARIES = 3;

// Obviously fake passengers for demo manifests. Phones use the fictional 555-01xx range only.
const FAKE_PASSENGERS = [
  { name: "Testy McTesterson", phone: "(907) 555-0101" },
  { name: "Jane Placeholder", phone: "(907) 555-0102" },
  { name: "John Sampleton", phone: "(907) 555-0103" },
  { name: "Polly Prototype", phone: "(907) 555-0104" },
  { name: "Mocky Mockwell", phone: "(907) 555-0105" },
  { name: "Fiona Fakename", phone: "(907) 555-0106" },
  { name: "Demo Dan", phone: "(907) 555-0107" },
  { name: "Dummy Dorothy", phone: "(907) 555-0108" },
  { name: "Lorem Ipsum", phone: "(907) 555-0109" },
  { name: "Stubby Stubbins", phone: "(907) 555-0110" },
  { name: "Example Ellie", phone: "(907) 555-0111" },
  { name: "Notreal Ned", phone: "(907) 555-0112" }
];

// Seed manifests: flight number → passenger indices into FAKE_PASSENGERS and how many are checked in.
const SEED_MANIFESTS = {
  GV5555: { indices: [0, 1, 2, 3, 4, 5, 6, 7], checkedIn: 4 },
  GV2905: { indices: [8, 9, 10, 11, 0], checkedIn: 2 }
};

// Faint region caption on the run map, by run base.
const MAP_REGIONS = {
  ANC: "Cook Inlet", ENA: "Cook Inlet", BET: "Yukon-Kuskokwim Delta", EMK: "Lower Yukon",
  DLG: "Bristol Bay", AKN: "Bristol Bay", CDB: "Alaska Peninsula", DUT: "Aleutian Islands"
};

// Employee home bases (selectable on the Base tab).
const BASES = ["ANC", "ENA", "BET", "DLG", "AKN", "CDB", "DUT", "EMK"];

// Mock multi-stop runs. Times are a template day centred on 12:00; buildRuns() shifts the whole
// day so it is centred on the time the app was first opened today, so some runs are always in progress.
// Every leg is a Grant route from GRANT_NETWORK; multi-stop runs go back through a hub between villages.
const RUN_TEMPLATES = [
  { id: "R-ANC-1", flightNum: "GV101", aircraft: "Piper Navajo", base: "ANC",
    legs: [["ANC", "ENA", "07:00", "07:35"], ["ENA", "ANC", "08:00", "08:35"]] },
  { id: "R-ANC-2", flightNum: "GV111", aircraft: "Cessna 208 Caravan", base: "ANC",
    legs: [["ANC", "ENA", "11:30", "12:05"], ["ENA", "ANC", "12:30", "13:05"]] },
  { id: "R-ANC-3", flightNum: "GV121", aircraft: "Piper Navajo", base: "ANC",
    legs: [["ANC", "ENA", "16:00", "16:35"], ["ENA", "ANC", "17:00", "17:35"]] },
  { id: "R-ENA-1", flightNum: "GV131", aircraft: "Cessna 208 Caravan", base: "ENA",
    legs: [["ENA", "ANC", "09:30", "10:05"], ["ANC", "ENA", "10:45", "11:20"]] },
  { id: "R-BET-1", flightNum: "GV301", aircraft: "Cessna 208 Caravan", base: "BET",
    legs: [["BET", "VAK", "08:30", "09:15"], ["VAK", "BET", "09:35", "10:20"], ["BET", "HPB", "10:50", "11:40"], ["HPB", "BET", "12:00", "12:50"]] },
  { id: "R-BET-2", flightNum: "GV311", aircraft: "Cessna 208 Caravan", base: "BET",
    legs: [["BET", "EMK", "10:15", "11:30"], ["EMK", "KOT", "11:50", "12:10"], ["KOT", "BET", "12:30", "13:45"]] },
  { id: "R-BET-3", flightNum: "GV321", aircraft: "Piper Navajo", base: "BET",
    legs: [["BET", "KPN", "12:00", "12:40"], ["KPN", "BET", "13:00", "13:40"], ["BET", "KWK", "14:05", "14:35"], ["KWK", "BET", "14:55", "15:25"]] },
  { id: "R-BET-4", flightNum: "GV331", aircraft: "Cessna 208 Caravan", base: "BET",
    legs: [["BET", "OOK", "15:00", "15:45"], ["OOK", "BET", "16:05", "16:50"], ["BET", "TNK", "17:15", "18:05"], ["TNK", "BET", "18:25", "19:15"]] },
  { id: "R-BET-5", flightNum: "GV341", aircraft: "Cessna 208 Caravan", base: "BET",
    legs: [["BET", "KKH", "20:30", "21:05"], ["KKH", "BET", "21:25", "22:00"]] },
  { id: "R-DLG-1", flightNum: "GV401", aircraft: "Cessna 208 Caravan", base: "DLG",
    legs: [["DLG", "TWA", "09:00", "09:30"], ["TWA", "DLG", "09:50", "10:20"], ["DLG", "TOG", "10:45", "11:20"], ["TOG", "DLG", "11:40", "12:15"]] },
  { id: "R-DLG-2", flightNum: "GV411", aircraft: "Piper Navajo", base: "DLG",
    legs: [["DLG", "KMO", "13:30", "13:50"], ["KMO", "DLG", "14:10", "14:30"], ["DLG", "CLP", "14:50", "15:05"], ["CLP", "DLG", "15:25", "15:40"]] },
  { id: "R-AKN-1", flightNum: "GV501", aircraft: "Cessna 208 Caravan", base: "AKN",
    legs: [["AKN", "KLL", "10:00", "10:30"], ["KLL", "DLG", "10:50", "11:20"], ["DLG", "AKN", "11:45", "12:25"]] },
  { id: "R-AKN-2", flightNum: "GV511", aircraft: "Piper Navajo", base: "AKN",
    legs: [["AKN", "DLG", "15:30", "16:10"], ["DLG", "AKN", "16:40", "17:20"]] },
  { id: "R-AKN-3", flightNum: "GV521", aircraft: "Cessna 208 Caravan", base: "AKN",
    legs: [["AKN", "IGG", "13:00", "13:40"], ["IGG", "AKN", "14:00", "14:40"]] },
  { id: "R-CDB-1", flightNum: "GV601", aircraft: "Cessna 208 Caravan", base: "CDB",
    legs: [["CDB", "KVC", "11:00", "11:20"], ["KVC", "CDB", "11:40", "12:00"], ["CDB", "KFP", "12:20", "12:50"], ["KFP", "CDB", "13:10", "13:40"]] },
  { id: "R-DUT-1", flightNum: "GV701", aircraft: "Piper Navajo", base: "DUT",
    legs: [["DUT", "AKB", "09:30", "11:15"], ["AKB", "DUT", "12:00", "13:45"]] },
  { id: "R-EMK-1", flightNum: "GV801", aircraft: "Cessna 208 Caravan", base: "EMK",
    legs: [["EMK", "AUK", "12:30", "12:45"], ["AUK", "EMK", "13:05", "13:20"], ["EMK", "SXP", "13:40", "13:55"], ["SXP", "EMK", "14:15", "14:30"]] },
  { id: "R-EMK-2", flightNum: "GV811", aircraft: "Cessna 208 Caravan", base: "EMK",
    legs: [["EMK", "KOT", "15:30", "15:50"], ["KOT", "EMK", "16:10", "16:30"]] }
];

const STORAGE_KEY = "grant-aviation-data-v3";

// Mock help line (fictional 555-01xx range) for the passenger "Need help?" button.
const HELP_PHONE = "(907) 555-0100";
const HELP_PHONE_TEL = "+19075550100";

// Profile "Text size" setting, kept outside the main data blob. index.html applies it before first paint too.
// v2 added a smaller Normal, so the old key is migrated once: old normal -> large, old large/xl -> xlarge.
const TEXT_SIZE_KEY = "grant-aviation-text-size-v2";
const OLD_TEXT_SIZE_KEY = "grant-aviation-text-size";
const TEXT_SIZES = [
  { id: "normal", label: "Normal" },
  { id: "large", label: "Large" },
  { id: "xlarge", label: "Extra large" }
];

function getTextSize() {
  let id = null;
  try {
    id = localStorage.getItem(TEXT_SIZE_KEY);
    const old = localStorage.getItem(OLD_TEXT_SIZE_KEY);
    if (!id && old) {
      id = old === "normal" ? "large" : "xlarge";
      localStorage.setItem(TEXT_SIZE_KEY, id);
    }
    if (old !== null) localStorage.removeItem(OLD_TEXT_SIZE_KEY);
  } catch (e) { id = null; }
  return TEXT_SIZES.some(s => s.id === id) ? id : "normal";
}

function applyTextSize(id) {
  if (id === "normal") delete document.documentElement.dataset.textSize;
  else document.documentElement.dataset.textSize = id;
}

// Other Profile settings, also kept outside the main data blob. index.html applies the display ones before first paint.
const SETTINGS_KEY = "grant-aviation-settings";
const REMINDER_LEADS = [
  { id: "1h", label: "1 hour before", ms: 3600000 },
  { id: "3h", label: "3 hours before", ms: 3 * 3600000 },
  { id: "1d", label: "1 day before", ms: 86400000 }
];
const DEFAULT_SETTINGS = { highContrast: false, reduceMotion: false, bigButtons: false, reminders: true, reminderLead: "3h", homeAirport: null };

function getSettings() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)); } catch (e) { saved = null; }
  const s = { ...DEFAULT_SETTINGS };
  if (isPlainObject(saved)) {
    ["highContrast", "reduceMotion", "bigButtons", "reminders"].forEach(k => { if (typeof saved[k] === "boolean") s[k] = saved[k]; });
    if (REMINDER_LEADS.some(l => l.id === saved.reminderLead)) s.reminderLead = saved.reminderLead;
    if (homeAirportCodes().includes(saved.homeAirport)) s.homeAirport = saved.homeAirport;
  }
  return s;
}

function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch (e) { /* private mode: still applies for this visit */ }
}

function applySettings(s = getSettings()) {
  const ds = document.documentElement.dataset;
  const flag = (name, on) => { if (on) ds[name] = "on"; else delete ds[name]; };
  flag("contrast", s.highContrast);
  flag("reduceMotion", s.reduceMotion);
  flag("bigButtons", s.bigButtons);
}

// Home airport choices: everywhere you can book from or follow on the Map. Hubs first, then villages A-Z.
function homeAirportCodes() {
  const codes = new Set(BOOK_AIRPORTS.map(airportCodeOf));
  RUN_TEMPLATES.forEach(t => { codes.add(t.legs[0][0]); t.legs.forEach(l => codes.add(l[1])); });
  const hubs = HUB_ORDER.map(airportCodeOf).filter(c => codes.has(c));
  const villages = [...codes].filter(c => !hubs.includes(c))
    .sort((a, b) => (AIRPORTS[a] || a).localeCompare(AIRPORTS[b] || b));
  return [...hubs, ...villages];
}

// Simple inline line icons (no icon font or CDN). Always shown next to a text label.
const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  book: '<path fill="currentColor" stroke="none" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>',
  trips: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M15 6v12" stroke-dasharray="2 2.5"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  base: '<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>',
  runs: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  checkin: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
  tools: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>'
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ""}</svg>`;
}

// Plain status words passengers see.
const PAX_STATUS = {
  "on-time": { label: "On time", cls: "status-on-time" },
  delayed: { label: "Delayed", cls: "status-delayed" },
  boarding: { label: "Boarding", cls: "status-boarding" },
  boarded: { label: "Boarded", cls: "status-boarded" },
  departed: { label: "Departed", cls: "status-departed" },
  arrived: { label: "Arrived", cls: "status-arrived" }
};
const BOARDING_WINDOW_MIN = 30; // boarding starts this long before departure

function paxStatusBadge(key) {
  const s = PAX_STATUS[key] || PAX_STATUS["on-time"];
  return `<span class="status-badge ${s.cls}">${s.label}</span>`;
}

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function loadData() {
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    data = null;
  }
  if (!isPlainObject(data)) data = {};
  data.employeeMode = !!data.employeeMode;
  if (!Array.isArray(data.trips)) data.trips = [];
  if (!isPlainObject(data.delays)) data.delays = {};
  if (!isPlainObject(data.flightManifests)) data.flightManifests = {};
  if (!BASES.includes(data.employeeBase)) data.employeeBase = "BET";
  if (!isPlainObject(data.runDelays)) data.runDelays = {};
  if (typeof data.checkinFlight !== "string") data.checkinFlight = null;
  // Passenger Map choices: a stop served by some run, and a run that actually stops there.
  const templateStops = t => [t.legs[0][0], ...t.legs.map(l => l[1])];
  if (!RUN_TEMPLATES.some(t => templateStops(t).includes(data.paxMapLocation))) data.paxMapLocation = null;
  const paxRun = RUN_TEMPLATES.find(t => t.id === data.paxMapRun);
  if (!data.paxMapLocation || !paxRun || !templateStops(paxRun).includes(data.paxMapLocation)) data.paxMapRun = null;
  // The mock run day is anchored once per calendar day; a new day starts with fresh runs and no delays.
  const today = localDateISO(new Date());
  const anchor = data.runAnchor;
  if (!isPlainObject(anchor) || anchor.date !== today || !Number.isFinite(anchor.startMin)) {
    data.runAnchor = { date: today, startMin: Math.floor(minutesSinceMidnight(today) / 15) * 15 };
    data.runDelays = {};
  }
  const validDelay = d => isPlainObject(d) && Number.isFinite(d.minutes) && Number.isInteger(d.fromLegIndex) && d.fromLegIndex >= 0;
  Object.keys(data.runDelays).forEach(id => {
    const d = data.runDelays[id];
    if (!validDelay(d)) delete data.runDelays[id];
    else if (!Array.isArray(d.history) || !d.history.every(validDelay)) delete d.history;
  });
  Object.keys(data.flightManifests).forEach(num => {
    if (!Array.isArray(data.flightManifests[num])) delete data.flightManifests[num];
  });
  // Add seed manifests for existing users too, without touching manifests that already exist.
  Object.keys(SEED_MANIFESTS).forEach(num => {
    if (data.flightManifests[num]) return;
    const seed = SEED_MANIFESTS[num];
    data.flightManifests[num] = seed.indices.map((p, i) => {
      const checkedIn = i < seed.checkedIn;
      return {
        name: FAKE_PASSENGERS[p].name,
        phone: FAKE_PASSENGERS[p].phone,
        checkedIn,
        boardingPass: `GRANT-${num}-S${String(i + 1).padStart(2, "0")}`, // every seeded passenger has a pass so scanning can check them in
        tripId: null
      };
    });
  });
  saveData(data);
  return data;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function localDateISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Minutes elapsed since local midnight of the given YYYY-MM-DD date (can exceed 1440 or be negative).
function minutesSinceMidnight(dateISO) {
  const [y, m, d] = dateISO.split("-").map(Number);
  return (Date.now() - new Date(y, m - 1, d).getTime()) / 60000;
}

let state = loadData();
let selectedFlight = null; // selected itinerary on the Book page
let bookItineraries = [];
let bookPlan = null; // Book page steps when a partner airline flies part of the trip
const RUNS = buildRuns();
let selectedMapRunId = null;
let runFilterFrom = ""; // Runs page From/To filter ("" = any)
let runFilterTo = "";
let delayFilterFrom = ""; // Tools page Post Delay From/To filter ("" = any)
let delayFilterTo = "";
let pageHistory = []; // passenger Back button: pages visited before the current one

const NAV_TABS = {
  passenger: [
    { page: "home", label: "Home", icon: "home", render: renderHome },
    { page: "book", label: "Book", icon: "book", render: renderBook },
    { page: "trips", label: "My Trips", icon: "trips", render: renderTrips },
    { page: "map", label: "Map", icon: "map", render: renderMap },
    { page: "profile", label: "Profile", icon: "profile", render: renderProfile }
  ],
  employee: [
    { page: "base", label: "Base", icon: "base", render: renderBase },
    { page: "runs", label: "Runs", icon: "runs", render: renderRuns },
    { page: "runmap", label: "Map", icon: "map", render: renderRunMap },
    { page: "checkin", label: "Check-in", icon: "checkin", render: renderCheckin },
    { page: "tools", label: "Tools", icon: "tools", render: renderTools }
  ]
};

let currentPage = currentTabs()[0].page;

function currentTabs() {
  return state.employeeMode ? NAV_TABS.employee : NAV_TABS.passenger;
}

function renderNav() {
  document.querySelector(".bottom-nav").innerHTML = currentTabs().map(t =>
    `<button data-page="${t.page}"${t.page === currentPage ? ' class="active" aria-current="page"' : ""}>${icon(t.icon)}<span>${t.label}</span></button>`
  ).join("");
}

function render() {
  stopCamera(); // every page change, role switch and re-render replaces the viewfinder
  hideCheckinModal();
  const tabs = currentTabs();
  let tab = tabs.find(t => t.page === currentPage);
  if (!tab) {
    tab = tabs[0];
    currentPage = tab.page;
    renderNav();
  }
  syncRunMapTimer(); // refreshes renderRunProgress in place, so the live planes list is never wiped
  syncHomeTimer();
  const role = state.employeeMode ? "employee" : "passenger";
  document.querySelectorAll(".role-switch button").forEach(b => b.classList.toggle("active", b.dataset.role === role));
  const el = document.getElementById("content");
  tab.render(el);
  if (!state.employeeMode) el.insertAdjacentHTML("beforeend", helpButtonHtml());
  el.scrollTop = 0;
}

// ---------- Passenger page chrome ----------

// Big Back + Home buttons and the page title. back defaults to the previous page; subviews pass "render()".
function pageTopHtml(title, back = "goBack()") {
  return `
    <div class="page-top">
      <button class="btn-nav" onclick="${back}">${icon("back")}<span>Back</span></button>
      <button class="btn-nav" onclick="goTo('home')">${icon("home")}<span>Home</span></button>
    </div>
    <h2>${title}</h2>`;
}

function helpButtonHtml() {
  return `
    <a class="help-btn" href="tel:${HELP_PHONE_TEL}">
      ${icon("phone")}
      <span><b>Need help? Call Grant Aviation</b><span>${HELP_PHONE}</span></span>
    </a>`;
}

function confirmBannerHtml(text) {
  return `<div class="confirm-banner" role="status">${icon("check")}<span>${text}</span></div>`;
}

// ---------- Passenger trip times and status ----------

function dateAt(iso, hhmm) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "") || !/^\d{1,2}:\d{2}$/.test(hhmm || "")) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  return new Date(y, m - 1, d, h, min);
}

// "Today, Thursday, October 22" — dates in words so nobody has to decode 2026-10-22.
function fmtDateLong(iso) {
  const d = dateAt(iso, "00:00");
  if (!d) return iso || "";
  const text = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((d - today) / 86400000);
  return days === 0 ? `Today, ${text}` : days === 1 ? `Tomorrow, ${text}` : text;
}

// Effective departure and arrival as Dates (posted new times shift the whole trip), or null if the trip has no usable time.
function tripTimes(trip) {
  const eff = getEffectiveDep(trip);
  const dep = dateAt(eff.date, eff.time);
  if (!dep) return null;
  let min = Number.isFinite(trip.totalMin) ? trip.totalMin : null;
  if (min === null && trip.depTime && trip.arrTime) min = (toMinutes(trip.arrTime) - toMinutes(trip.depTime) + 1440) % 1440;
  const arr = new Date(dep.getTime() + (min || 60) * 60000);
  return { dep, arr, eff };
}

function tripStatus(trip, now = new Date()) {
  const t = tripTimes(trip);
  if (!t) return "on-time";
  if (now >= t.arr) return "arrived";
  if (now >= t.dep) return "departed";
  if (trip.boarded) return "boarded";
  if (t.dep - now <= BOARDING_WINDOW_MIN * 60000) return "boarding";
  const delay = state.delays[trip.flightNum];
  const orig = dateAt(trip.date, trip.depTime);
  if (delay && (delay.type === "delayed" || delay.type === "hold" || (t.eff.changed && orig && t.dep > orig))) return "delayed";
  return "on-time";
}

// Plain message for a posted delay or weather hold.
function tripDelayNote(trip) {
  const delay = state.delays[trip.flightNum];
  if (!delay) return "";
  const parts = [];
  if (delay.type === "hold") parts.push("Weather hold — waiting for better weather.");
  if (delay.message) parts.push(escapeHtml(delay.message));
  return parts.length ? `<p style="color:var(--warning); font-weight:600;">${parts.join(" ")}</p>` : "";
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// "2 hours 5 minutes", "1 day 3 hours", "45 minutes".
function fmtCountdown(ms) {
  const mins = Math.max(1, Math.ceil(ms / 60000));
  const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
  if (d) return [plural(d, "day"), h ? plural(h, "hour") : ""].filter(Boolean).join(" ");
  return [h ? plural(h, "hour") : "", m ? plural(m, "minute") : ""].filter(Boolean).join(" ");
}

function peopleText(pax) {
  const n = Number(pax) || 1;
  return n === 1 ? "1 person" : `${n} people`;
}

// Soonest trip that hasn't arrived yet.
function nextTrip(now = new Date()) {
  return state.trips
    .map(trip => ({ trip, t: tripTimes(trip) }))
    .filter(x => x.t && x.t.arr > now)
    .sort((a, b) => a.t.dep - b.t.dep)[0] || null;
}

function nextFlightCardHtml() {
  const now = new Date();
  const next = nextTrip(now);
  if (!next) {
    return `
      <section class="card next-card" aria-labelledby="nextTitle">
        <h3 id="nextTitle">My next flight</h3>
        <p>You have no flights booked yet.</p>
        <button class="btn" onclick="goTo('book')">${icon("book")}<span>Book a flight</span></button>
      </section>`;
  }
  const { trip, t } = next;
  const status = tripStatus(trip, now);
  const countdown = {
    departed: `Your plane has left. It lands at about ${clockHHMM(t.arr)}.`,
    boarded: `You are on board. Leaving in ${fmtCountdown(t.dep - now)}.`,
    boarding: `Boarding now — please go to the plane. Leaving in ${fmtCountdown(t.dep - now)}.`
  }[status] || `Leaves in ${fmtCountdown(t.dep - now)}`;
  const others = state.trips.length - 1;
  return `
    <section class="card next-card" aria-labelledby="nextTitle">
      <div class="next-head">
        <h3 id="nextTitle">My next flight</h3>
        ${paxStatusBadge(status)}
      </div>
      <p class="next-route">${trip.from} → ${trip.to}</p>
      <p class="meta">${fmtDateLong(t.eff.date)}</p>
      <div class="next-times">
        <div><span>Leaves</span><b>${clockHHMM(t.dep)}</b></div>
        <div><span>Lands</span><b>${clockHHMM(t.arr)}</b></div>
      </div>
      <p class="next-countdown" id="nextCountdown" aria-live="polite">${countdown}</p>
      <p class="meta">Flight ${trip.itineraryNum || trip.flightNum} · ${peopleText(trip.pax)} · Open seating</p>
      ${t.eff.changed ? `<p class="meta">New time. It was ${trip.depTime || ""} on ${fmtDateLong(trip.date)}.</p>` : ""}
      ${tripDelayNote(trip)}
      ${status === "departed" ? "" : reminderNoteHtml(t.dep, now)}
      ${trip.checkedIn
        ? `<button class="btn" onclick="showPass('${trip.id}')">${icon("trips")}<span>Show boarding pass</span></button>`
        : `<button class="btn" onclick="checkIn('${trip.id}')">${icon("check")}<span>Check in now</span></button>`}
      <button class="btn btn-outline" onclick="goTo('trips')">${icon("trips")}<span>See all my trips${others > 0 ? ` (${state.trips.length})` : ""}</span></button>
    </section>`;
}

// Mock flight reminder from the Profile setting. Nothing is really sent in the prototype.
function reminderNoteHtml(dep, now) {
  const s = getSettings();
  if (!s.reminders) return "";
  const lead = REMINDER_LEADS.find(l => l.id === s.reminderLead);
  const at = new Date(dep - lead.ms);
  const when = `${fmtDateLong(localDateISO(at))} at ${clockHHMM(at)}`;
  const text = at > now
    ? `Reminder set: we will remind you ${lead.label} — ${when}.`
    : `Reminder sent ${when} (${lead.label}).`;
  return `<p class="next-reminder">${icon("bell")}<span>${text}</span></p>`;
}

function renderHome(el) {
  el.innerHTML = `
    <h2>Welcome to Grant Aviation</h2>
    <div id="nextFlight">${nextFlightCardHtml()}</div>
    <div class="card">
      <h3>Book a flight</h3>
      <p class="meta">Anchorage ↔ Kenai and dozens of villages across the Yukon-Kuskokwim Delta, Bristol Bay, and the Aleutians.</p>
      <button class="btn" onclick="goTo('book')">${icon("book")}<span>Book a flight</span></button>
    </div>
    <div class="card">
      <h3>Where is my plane?</h3>
      <p class="meta">See where today's Grant planes are and when they reach your village.</p>
      <button class="btn btn-outline" onclick="goTo('map')">${icon("map")}<span>Open the map</span></button>
    </div>
    <p class="meta" style="margin-bottom:0.75rem;">Serving remote Alaska communities since 1971. No formal check-in in the villages — just show up when the plane is close.</p>
    <div class="note">This is a prototype for design & functionality iteration. Data is stored locally in your browser. Employee mode lets staff post delays and weather holds.</div>
  `;
}

// Refresh the Home "My next flight" countdown every 30s while passenger Home is showing; called from render().
let homeTimer = null;
function syncHomeTimer() {
  const on = !state.employeeMode && currentPage === "home";
  if (!on && homeTimer) {
    clearInterval(homeTimer);
    homeTimer = null;
  }
  if (on && !homeTimer) {
    homeTimer = setInterval(() => {
      const box = document.getElementById("nextFlight");
      if (box) box.innerHTML = nextFlightCardHtml();
    }, 30000);
  }
}

// ---------- Itineraries (direct + connecting) ----------

function airportCodeOf(label) {
  const m = /\(([A-Z]{3})\)/.exec(label || "");
  return m ? m[1] : label;
}

// 85 → "1h 25m", 45 → "45m", 120 → "2h".
function fmtDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h}h` : "", m || !h ? `${m}m` : ""].filter(Boolean).join(" ");
}

// Every bookable leg as { num, from, to, dep, arr } with airport codes.
function bookableLegs() {
  const legs = [];
  Object.keys(MOCK_FLIGHTS).forEach(key => {
    const [from, to] = key.split("-").map(airportCodeOf);
    MOCK_FLIGHTS[key].forEach(f => legs.push({ num: f.num, from, to, dep: f.dep, arr: f.arr }));
  });
  CONNECTION_FLIGHTS.forEach(([num, from, to, dep, arr]) => legs.push({ num, from, to, dep, arr }));
  RUN_TEMPLATES.filter(t => PASSENGER_RUN_IDS.includes(t.id)).forEach(t => {
    t.legs.forEach(([from, to, dep, arr]) => legs.push({ num: t.flightNum, from, to, dep, arr }));
  });
  return legs;
}

function itineraryFromLegs(path) {
  const legs = path.map(p => ({
    num: p.leg.num, from: airportLabel(p.leg.from), to: airportLabel(p.leg.to),
    dep: p.leg.dep, arr: p.leg.arr, dur: fmtDuration(p.arrAbs - p.depAbs)
  }));
  const connections = path.slice(1).map((p, i) => {
    const prev = path[i];
    const stay = prev.leg.num === p.leg.num;
    return { at: airportLabel(p.leg.from), type: stay ? "stay" : "deplane", layover: fmtDuration(p.depAbs - prev.arrAbs) };
  });
  const totalMin = path[path.length - 1].arrAbs - path[0].depAbs;
  return {
    id: legs.map(l => l.num + "@" + l.dep).join("|"),
    num: [...new Set(legs.map(l => l.num))].join(" / "),
    legs, connections,
    dep: legs[0].dep, arr: legs[legs.length - 1].arr,
    totalMin, direct: legs.length === 1
  };
}

// Itineraries from → to (airport labels as used in the Book selects), sorted by departure.
// opts.minDep (minutes) keeps only flights leaving at or after that time, e.g. after a partner flight lands.
function getItineraries(from, to, opts = {}) {
  const minDep = opts.minDep || 0;
  const direct = MOCK_FLIGHTS[from + "-" + to];
  if (direct) {
    return direct.filter(f => toMinutes(f.dep) >= minDep).map(f => ({
      id: f.num + "@" + f.dep,
      num: f.num,
      legs: [{ num: f.num, from, to, dep: f.dep, arr: f.arr, dur: f.dur }],
      connections: [],
      dep: f.dep, arr: f.arr,
      totalMin: (toMinutes(f.arr) - toMinutes(f.dep) + 1440) % 1440,
      direct: true
    }));
  }

  const origin = airportCodeOf(from);
  const dest = airportCodeOf(to);
  const legs = bookableLegs();
  const found = [];
  // Depth-first search, at most 2 plane changes (staying on a multi-stop run doesn't count), never revisiting an airport.
  const extend = (path, visited, changes) => {
    const last = path[path.length - 1];
    if (last.leg.to === dest) {
      found.push(path);
      return;
    }
    if (path.length === 5) return;
    legs.forEach(leg => {
      if (leg.from !== last.leg.to || visited.has(leg.to)) return;
      const stay = leg.num === last.leg.num;
      if (!stay && changes === 2) return;
      const minGround = stay ? 0 : MIN_LAYOVER;
      let depAbs = toMinutes(leg.dep);
      while (depAbs < last.arrAbs + minGround) depAbs += 1440;
      if (depAbs - last.arrAbs > MAX_LAYOVER) return;
      const arrAbs = depAbs + ((toMinutes(leg.arr) - toMinutes(leg.dep) + 1440) % 1440);
      extend([...path, { leg, depAbs, arrAbs }], new Set([...visited, leg.to]), changes + (stay ? 0 : 1));
    });
  };
  legs.filter(l => l.from === origin).forEach(leg => {
    const depAbs = toMinutes(leg.dep);
    const arrAbs = depAbs + ((toMinutes(leg.arr) - depAbs + 1440) % 1440);
    extend([{ leg, depAbs, arrAbs }], new Set([origin, leg.to]), 0);
  });

  // Same times on the same route count once; fewer legs win.
  const byKey = new Map();
  found.map(itineraryFromLegs)
    .sort((a, b) => a.legs.length - b.legs.length)
    .forEach(it => {
      const key = it.legs.map(l => `${l.from}-${l.to}-${l.dep}-${l.arr}`).join("|");
      if (!byKey.has(key)) byKey.set(key, it);
    });
  const all = [...byKey.values()];
  const depOf = it => toMinutes(it.dep);
  const arrOf = it => depOf(it) + it.totalMin;
  // Drop options another one beats: leaves no earlier and arrives no later (ties → fewer legs).
  const better = (b, a) => depOf(b) >= depOf(a) && arrOf(b) <= arrOf(a) &&
    (depOf(b) > depOf(a) || arrOf(b) < arrOf(a) || b.legs.length < a.legs.length);
  return all
    .filter(a => !all.some(b => b !== a && better(b, a)))
    .filter(a => depOf(a) >= minDep)
    .sort((a, b) => depOf(a) - depOf(b) || a.totalMin - b.totalMin)
    .slice(0, MAX_ITINERARIES);
}

function connectionNote(c) {
  return c.type === "stay"
    ? `Stay on the plane in ${c.at} · ${c.layover} stop`
    : `Change planes in ${c.at} · ${c.layover} wait`;
}

function stopsText(it) {
  const n = it.connections.length;
  return `About ${fmtDuration(it.totalMin)} in total · ${n} stop${n === 1 ? "" : "s"}`;
}

// Leg-by-leg breakdown shared by the Book cards and My Trips.
function itineraryLegsHtml(legs, connections) {
  return legs.map((l, i) => `
    <div class="itin-leg">
      <span class="itin-num">${l.num}</span>
      ${l.from} ${l.dep} → ${l.to} ${l.arr}
    </div>
    ${connections[i] ? `<div class="itin-conn itin-${connections[i].type}">${connectionNote(connections[i])}</div>` : ""}
  `).join("");
}

// ---------- Trips that need a partner airline ----------

// Grant legs come after a partner leg: suggest Grant flights from midday so the partner flight has landed.
const AFTER_PARTNER_MIN_DEP = 12 * 60;

function isSeasonalLeg(l) {
  return SEASONAL_PAIRS.has(airportCodeOf(l.from) + "-" + airportCodeOf(l.to));
}

// Cheapest way from → to (codes) over Grant routes and partner legs: fewest partner legs, then fewest legs.
// Returns steps [{ type: "grant", from, to } | { type: "partner", from, to, airlines }], merging back-to-back Grant legs.
function planTrip(origin, dest) {
  const edges = new Map(); // code → [{ to, type, airlines }]
  const addEdge = (from, to, type, airline) => {
    if (!edges.has(from)) edges.set(from, []);
    const list = edges.get(from);
    const e = list.find(x => x.to === to && x.type === type);
    if (e) { if (airline && !e.airlines.includes(airline)) e.airlines.push(airline); }
    else list.push({ to, type, airlines: airline ? [airline] : [] });
  };
  bookableLegs().forEach(l => addEdge(l.from, l.to, "grant"));
  PARTNER_LEGS.forEach(l => addEdge(l.from, l.to, "partner", l.airline));

  const cost = new Map([[origin, 0]]);
  const prev = new Map();
  const open = [origin];
  while (open.length) {
    open.sort((a, b) => cost.get(a) - cost.get(b));
    const at = open.shift();
    if (at === dest) break;
    (edges.get(at) || []).forEach(e => {
      const c = cost.get(at) + (e.type === "partner" ? 100 : 1);
      if (cost.has(e.to) && cost.get(e.to) <= c) return;
      cost.set(e.to, c);
      prev.set(e.to, { from: at, edge: e });
      if (!open.includes(e.to)) open.push(e.to);
    });
  }
  if (!prev.has(dest)) return null;
  const path = [];
  for (let c = dest; c !== origin; c = prev.get(c).from) path.unshift({ from: prev.get(c).from, ...prev.get(c).edge });
  const steps = [];
  path.forEach(p => {
    const last = steps[steps.length - 1];
    if (p.type === "grant" && last && last.type === "grant") last.to = p.to;
    else steps.push(p.type === "grant" ? { type: "grant", from: p.from, to: p.to } : { type: "partner", from: p.from, to: p.to, airlines: p.airlines });
  });
  return steps;
}

function airlineNames(step) {
  return step.airlines.map(a => PARTNER_AIRLINES[a].name).join(" or ");
}

function partnerButtonsHtml(step) {
  return step.airlines.map(a => {
    const p = PARTNER_AIRLINES[a];
    return `<a class="btn partner-btn" href="${p.url}" target="_blank" rel="noopener">${p.button}</a>`;
  }).join("") + `<p class="meta">Opens their website in a new window.</p>`;
}

// One partner part of a trip: who flies it and big buttons to their own site. prevStep tells us what comes before.
function partnerStepHtml(step, num, total, prevStep) {
  return `
    <div class="card trip-step partner-step">
      <div class="step-num">Part ${num} of ${total}</div>
      <div class="itin-times">${airportLabel(step.from)} → ${airportLabel(step.to)}</div>
      <p class="partner-who">This part is flown by ${airlineNames(step)} (not Grant)</p>
      <p>Check times on their site.</p>
      ${prevStep ? `<p class="meta">Choose a flight that leaves after your Grant flight lands in ${AIRPORTS[step.from] || step.from}.</p>` : ""}
      ${partnerButtonsHtml(step)}
    </div>`;
}

// Mock flights you can pick, shared by the normal Book list and each Grant part of a partner trip.
// pick(i) is the onclick call; ids are prefix + i and prefix + "pick-" + i.
function itinCardsHtml(list, date, prefix, pick) {
  const now = new Date();
  const gone = it => { const d = dateAt(date, it.dep); return !!d && d <= now; };
  const allGone = list.length && list.every(gone);
  return `
    ${allGone ? `<p class="meta" style="margin-bottom:0.5rem;">Today's flights on this trip have already left. Please choose another day.</p>` : ""}
    ${list.map((it, i) => gone(it) ? `
      <button type="button" class="card itin-card" id="${prefix}${i}" disabled>
        <div class="itin-times">Leaves ${it.dep} → Lands ${it.arr}</div>
        <div class="meta">Flight ${it.num} · Already left today</div>
      </button>` : `
      <button type="button" class="card itin-card" onclick="${pick(i)}" id="${prefix}${i}" aria-pressed="false">
        <div class="itin-times">Leaves ${it.dep} → Lands ${it.arr}</div>
        ${it.direct
          ? `<div class="meta">Flight ${it.num} · ${it.legs[0].dur} <span class="itin-tag">Nonstop</span></div>`
          : `${itineraryLegsHtml(it.legs, it.connections)}<div class="itin-total">${stopsText(it)}</div>`}
        ${it.legs.some(isSeasonalLeg) ? `<div class="meta">Seasonal route: only flies part of the year. Call us to check.</div>` : ""}
        <div class="meta">Open seating</div>
        <span class="itin-pick" id="${prefix}pick-${i}">Tap to choose</span>
      </button>
    `).join("")}`;
}

function markPicked(list, prefix, index) {
  list.forEach((_, i) => {
    const card = document.getElementById(prefix + i);
    const pick = document.getElementById(prefix + "pick-" + i);
    if (!card || card.disabled) return;
    card.classList.toggle("selected", i === index);
    card.setAttribute("aria-pressed", String(i === index));
    if (pick) pick.textContent = i === index ? "✓ Chosen" : "Tap to choose";
  });
}

// Book page for a trip with partner legs: every part as a numbered card, in order.
function renderPartnerPlan(listEl, steps, date) {
  const total = steps.length;
  bookPlan = steps.map((step, s) => {
    if (step.type !== "grant") return { ...step };
    const afterPartner = steps.slice(0, s).some(x => x.type === "partner");
    const from = airportLabel(step.from), to = airportLabel(step.to);
    let list = getItineraries(from, to, { minDep: afterPartner ? AFTER_PARTNER_MIN_DEP : 0 });
    let noAfternoon = false;
    if (afterPartner && !list.length) { list = getItineraries(from, to); noAfternoon = true; }
    return { ...step, afterPartner, noAfternoon, itineraries: list, selected: null };
  });
  const grantSteps = bookPlan.filter(s => s.type === "grant");
  const partners = [...new Set(bookPlan.filter(s => s.type === "partner").flatMap(s => s.airlines))].map(a => PARTNER_AIRLINES[a].name).join(" or ");

  listEl.innerHTML = `
    <p class="step-label" style="font-weight:600;">5. Your trip has ${plural(total, "part")}</p>
    <p class="meta" style="margin-bottom:0.75rem;">${grantSteps.length
      ? `Grant doesn't fly all of this trip. ${partners} flies part of it. Book each part.`
      : `Grant doesn't fly this trip. ${partners} does. Book it on their website.`}</p>
    ${bookPlan.map((step, s) => step.type === "partner"
      ? partnerStepHtml(step, s + 1, total, bookPlan[s - 1] && bookPlan[s - 1].type === "grant")
      : `
      <div class="card trip-step grant-step">
        <div class="step-num">Part ${s + 1} of ${total} · Grant Aviation</div>
        <div class="itin-times">${airportLabel(step.from)} → ${airportLabel(step.to)}</div>
        ${step.afterPartner ? `<p>Your ${airlineNames(bookPlan[s - 1])} flight needs to land first. ${step.noAfternoon
          ? "There is no Grant flight after midday on this trip, so check your landing time carefully."
          : "These Grant flights leave after midday."} Pick one that leaves at least an hour after you land.</p>` : ""}
        ${step.itineraries.length
          ? `<p class="step-label" style="font-weight:600;">Tap a Grant flight to choose it</p>
             ${itinCardsHtml(step.itineraries, date, `flight-${s}-`, i => `selectStepFlight(${s}, ${i})`)}`
          : `<p class="meta">No Grant flights for this part in the prototype yet. Call us and we can help.</p>`}
      </div>`).join("")}
  `;
  const btn = document.getElementById("confirmBtn");
  btn.hidden = !grantSteps.length;
}

function selectStepFlight(s, index) {
  const step = bookPlan && bookPlan[s];
  const chosen = document.getElementById(`flight-${s}-${index}`);
  if (!step || !step.itineraries[index] || !chosen || chosen.disabled) return;
  step.selected = index;
  markPicked(step.itineraries, `flight-${s}-`, index);
  updatePlanButton();
}

function updatePlanButton() {
  const btn = document.getElementById("confirmBtn");
  const grantSteps = bookPlan.filter(s => s.type === "grant");
  const missing = grantSteps.filter(s => s.selected === null).length;
  btn.disabled = !!missing;
  btn.textContent = missing
    ? (grantSteps.length > 1 ? `Choose ${plural(missing, "more Grant flight")}` : "Choose a Grant flight first")
    : (grantSteps.length > 1 ? "Book the Grant parts" : "Book the Grant part");
  if (!missing) btn.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function renderBook(el) {
  selectedFlight = null;
  bookPlan = null;
  // Fewer steps: start from the Profile home airport, else the village picked on the Map page, if it is bookable.
  const bookable = code => code && BOOK_AIRPORTS.find(a => airportCodeOf(a) === code);
  const here = bookable(getSettings().homeAirport) || bookable(state.paxMapLocation) || "";
  el.innerHTML = `
    ${pageTopHtml("Book a flight")}
    <div class="card">
      <label for="from" class="step-label">1. Where are you leaving from?</label>
      <select id="from" onchange="updateFlightList()">${airportOptions(here, "Choose a village or town")}</select>
      <label for="to" class="step-label">2. Where are you going?</label>
      <select id="to" onchange="updateFlightList()">${airportOptions("", "Choose a village or town")}</select>
      <label for="date" class="step-label">3. What day?</label>
      <input type="date" id="date" value="${localDateISO(new Date())}" min="${localDateISO(new Date())}" onchange="updateFlightList()">
      <label for="pax" class="step-label">4. How many people are flying?</label>
      <select id="pax">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<option value="${n}">${peopleText(n)}</option>`).join("")}</select>
      <p class="meta" style="margin-top:0.4rem;">All Grant flights are open seating — no seat to choose.</p>

      <div id="flightList" style="margin-top:1rem;"></div>

      <button class="btn" id="confirmBtn" onclick="bookFlight()" disabled>Choose a flight first</button>
    </div>
    <p class="fine-print">Prototype booking — mock schedules only. No real booking while we are testing.</p>
  `;
  updateFlightList();
}

function resetConfirmBtn() {
  const btn = document.getElementById("confirmBtn");
  if (btn) { btn.disabled = true; btn.hidden = false; btn.textContent = "Choose a flight first"; }
}

function updateFlightList() {
  const from = document.getElementById("from")?.value;
  const to = document.getElementById("to")?.value;
  const listEl = document.getElementById("flightList");
  if (!listEl) return;
  selectedFlight = null;
  bookPlan = null;
  resetConfirmBtn();
  if (!from || !to) {
    listEl.innerHTML = `<p class="meta">Choose where you are leaving from and where you are going to see flights.</p>`;
    return;
  }

  if (from === to) {
    listEl.innerHTML = `<p class="meta">You picked the same place twice. Please choose a different destination.</p>`;
    return;
  }

  const date = document.getElementById("date")?.value;
  bookItineraries = getItineraries(from, to);
  if (!bookItineraries.length) {
    // Grant can't do it alone: show the trip as parts if a partner airline fills the gap.
    const steps = planTrip(airportCodeOf(from), airportCodeOf(to));
    if (steps && steps.some(s => s.type === "partner")) return renderPartnerPlan(listEl, steps, date);
  }
  listEl.innerHTML = !bookItineraries.length
    ? `<p class="meta">No flights for this trip in the prototype yet. Call us and we can help.</p>`
    : `
    <p class="step-label" style="font-weight:600; margin-bottom:0.5rem;">5. Tap a flight to choose it</p>
    ${itinCardsHtml(bookItineraries, date, "flight-", i => `selectFlight(${i})`)}
  `;
}

function selectFlight(index) {
  const chosen = document.getElementById("flight-" + index);
  if (!bookItineraries[index] || !chosen || chosen.disabled) return;
  selectedFlight = bookItineraries[index];
  markPicked(bookItineraries, "flight-", index);

  const btn = document.getElementById("confirmBtn");
  btn.disabled = false;
  btn.textContent = `Book flight ${selectedFlight.num} at ${selectedFlight.dep}`;
  btn.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function tripFromItinerary(it, from, to, date, pax) {
  // flightNum is the first leg so delays, manifests and the boarding pass key off the flight you board first.
  return {
    id: Date.now().toString() + Math.floor(Math.random() * 1000),
    from, to, date, pax,
    flightNum: it.legs[0].num,
    itineraryNum: it.num,
    depTime: it.dep,
    arrTime: it.arr,
    duration: it.direct ? it.legs[0].dur : fmtDuration(it.totalMin),
    totalMin: it.totalMin,
    legs: it.legs,
    connections: it.connections,
    status: "Scheduled",
    checkedIn: false,
    boarded: false,
    boardingPass: null,
    passengerName: "Passenger " + Math.floor(Math.random()*100)
  };
}

function bookFlight() {
  const date = document.getElementById("date").value || localDateISO(new Date());
  const pax = document.getElementById("pax").value;
  let trips;
  let partnerSteps = [];
  if (bookPlan) {
    const grantSteps = bookPlan.filter(s => s.type === "grant");
    if (!grantSteps.length || grantSteps.some(s => s.selected === null)) return alert("Please choose a Grant flight for each Grant part");
    trips = grantSteps.map(s => tripFromItinerary(s.itineraries[s.selected], airportLabel(s.from), airportLabel(s.to), date, pax));
    partnerSteps = bookPlan.filter(s => s.type === "partner");
  } else {
    if (!selectedFlight) return alert("Please choose a flight");
    trips = [tripFromItinerary(selectedFlight, document.getElementById("from").value, document.getElementById("to").value, date, pax)];
  }
  trips.forEach(trip => {
    state.trips.push(trip);
    getManifestEntryForTrip(trip);
  });
  saveData(state);
  // Land on My Trips with a confirmation screen; Back from here shows the trips list.
  pageHistory.push(currentPage);
  currentPage = "trips";
  renderNav();
  render();
  showBookingConfirmation(trips.map(t => t.id), partnerSteps);
}

// ids: the Grant trips just booked (one per Grant part). partnerSteps: parts still to book with another airline.
function showBookingConfirmation(ids, partnerSteps = []) {
  const trips = [].concat(ids).map(id => state.trips.find(t => t.id === id)).filter(Boolean);
  if (!trips.length) return;
  const el = document.getElementById("content");
  const many = trips.length > 1;
  el.innerHTML = `
    ${pageTopHtml("You're booked", "render()")}
    ${confirmBannerHtml(many ? "Your Grant flights are booked." : "Your flight is booked.")}
    ${trips.map(trip => `
    <div class="card pass-rows">
      <div><span>From</span><b>${trip.from}</b></div>
      <div><span>To</span><b>${trip.to}</b></div>
      <div><span>Day</span><b>${fmtDateLong(trip.date)}</b></div>
      <div><span>Leaves</span><b>${trip.depTime}</b></div>
      <div><span>Lands</span><b>${trip.arrTime}</b></div>
      <div><span>Flight</span><b>${trip.itineraryNum || trip.flightNum}</b></div>
      <div><span>People</span><b>${peopleText(trip.pax)}</b></div>
      <div><span>Seating</span><b>Open seating</b></div>
    </div>`).join("")}
    ${partnerSteps.length ? `
    <div class="card trip-step partner-step">
      <p class="partner-who">Don't forget: you still need to book the other airline</p>
      ${partnerSteps.map(step => `
        <div class="itin-times" style="margin-top:0.5rem;">${airportLabel(step.from)} → ${airportLabel(step.to)}</div>
        <p>Flown by ${airlineNames(step)} (not Grant). Check times on their site.</p>
        ${partnerButtonsHtml(step)}`).join("")}
    </div>` : ""}
    <button class="btn" onclick="checkIn('${trips[0].id}')">${icon("check")}<span>Check in now</span></button>
    <button class="btn btn-outline" onclick="render()">${icon("trips")}<span>See my trips</span></button>
    ${helpButtonHtml()}
  `;
  el.scrollTop = 0;
}

function renderTrips(el) {
  if (!state.trips.length) {
    el.innerHTML = `${pageTopHtml("My trips")}<div class="card"><p>You have no trips yet.</p><button class="btn" onclick="goTo('book')">${icon("book")}<span>Book a flight</span></button></div>`;
    return;
  }
  // Soonest first; trips with no usable time go last.
  const sorted = state.trips.map(t => ({ t, times: tripTimes(t) }))
    .sort((a, b) => (a.times ? a.times.dep.getTime() : Infinity) - (b.times ? b.times.dep.getTime() : Infinity));
  el.innerHTML = pageTopHtml("My trips") + sorted.map(({ t, times }) => {
    const eff = getEffectiveDep(t);
    const status = tripStatus(t);
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <strong>Flight ${t.itineraryNum || t.flightNum}</strong>
          ${paxStatusBadge(status)}
        </div>
        <p class="next-route">${t.from} → ${t.to}</p>
        <p>${fmtDateLong(eff.date)}</p>
        <p>Leaves <b>${eff.time}</b>${times ? ` · Lands about <b>${clockHHMM(times.arr)}</b>` : t.arrTime ? ` · Lands <b>${t.arrTime}</b>` : ""}</p>
        <p class="meta">${peopleText(t.pax)} · Open seating</p>
        ${Array.isArray(t.legs) && t.legs.length > 1 ? `
          <div class="itin-trip">
            ${itineraryLegsHtml(t.legs, t.connections || [])}
            <div class="itin-total">About ${fmtDuration(t.totalMin)} in total · ${t.legs.length - 1} stop${t.legs.length === 2 ? "" : "s"}</div>
          </div>` : ""}
        ${eff.changed ? `<p class="meta">New time. It was ${t.depTime || ""} on ${fmtDateLong(t.date)}.</p>` : ""}
        ${tripDelayNote(t)}
        ${!t.checkedIn
          ? `<button class="btn" onclick="checkIn('${t.id}')">${icon("check")}<span>Check in now</span></button>`
          : `<button class="btn btn-outline" onclick="showPass('${t.id}')">${icon("trips")}<span>Show boarding pass</span></button>`}
      </div>
    `;
  }).join("");
}

function checkIn(id) {
  const trip = state.trips.find(t => t.id === id);
  if (!trip) return;
  trip.checkedIn = true;
  trip.boardingPass = "GRANT-" + trip.flightNum + "-" + trip.id.slice(-4);
  const entry = getManifestEntryForTrip(trip);
  entry.checkedIn = true;
  entry.checkedInAt = clockHHMM();
  entry.boardingPass = trip.boardingPass;
  saveData(state);
  showPass(id, true);
}

// Find the manifest entry for a booked trip, adding one if missing (e.g. trips booked before manifests existed).
function getManifestEntryForTrip(trip) {
  const list = state.flightManifests[trip.flightNum] || (state.flightManifests[trip.flightNum] = []);
  let entry = list.find(p => p.tripId === trip.id);
  if (!entry) {
    entry = {
      name: trip.passengerName,
      phone: "(907) 555-01" + String(Math.floor(Math.random() * 100)).padStart(2, "0"),
      checkedIn: !!trip.checkedIn,
      boardingPass: trip.boardingPass || null,
      tripId: trip.id
    };
    list.push(entry);
  }
  return entry;
}

// Boarding pass subview over the current page; Back re-renders that page (My Trips or Home).
function showPass(id, justCheckedIn = false) {
  const trip = state.trips.find(t => t.id === id);
  if (!trip || !trip.boardingPass) return;
  const eff = getEffectiveDep(trip);
  const el = document.getElementById("content");
  el.innerHTML = `
    ${pageTopHtml("Boarding pass", "render()")}
    ${justCheckedIn ? confirmBannerHtml("You are checked in. Show this pass when you board.") : ""}
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap;">
        <h3 style="margin:0;">${escapeHtml(trip.passengerName)}</h3>
        ${paxStatusBadge(tripStatus(trip))}
      </div>
      <div class="pass-rows" style="margin-top:0.5rem;">
        <div><span>Flight</span><b>${trip.itineraryNum || trip.flightNum}</b></div>
        <div><span>From</span><b>${trip.from}</b></div>
        <div><span>To</span><b>${trip.to}</b></div>
        <div><span>Day</span><b>${fmtDateLong(eff.date)}</b></div>
        <div><span>Leaves</span><b>${eff.time}</b></div>
        <div><span>Seating</span><b>Open seating</b></div>
      </div>
      <div class="qr-container" id="qr"></div>
      <p class="meta" style="text-align:center;">${trip.boardingPass}</p>
      <button class="btn btn-outline" onclick="render()">${icon("back")}<span>Back</span></button>
    </div>
    <div class="note">Show this code to the pilot or agent when you board. Open seating: sit in any open seat.</div>
    ${helpButtonHtml()}
  `;
  el.scrollTop = 0;
  renderQrInto(document.getElementById("qr"), trip.boardingPass);
}

// Renders a scannable QR (black modules on white) for a boarding code using the vendored qrcode-generator lib.
function renderQrInto(container, text) {
  if (!container) return;
  try {
    if (typeof qrcode !== "function") throw new Error("QR library not loaded");
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    container.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 4, scalable: true, alt: "Boarding pass QR code for " + text });
  } catch (e) {
    container.innerHTML = `<p style="color:#111; font-weight:600;">${text}</p>`;
  }
}

// Every airport any of today's runs stops at: hubs in HUB_ORDER, then villages A-Z by name.
function paxMapLocations() {
  const served = new Set(RUNS.flatMap(runStops));
  const hubs = HUB_ORDER.map(airportCodeOf).filter(c => served.has(c));
  const villages = [...served].filter(c => !hubs.includes(c))
    .sort((a, b) => (AIRPORTS[a] || a).localeCompare(AIRPORTS[b] || b));
  return { hubs, villages };
}

function paxRunsFor(code) {
  return RUNS.filter(r => runStops(r).includes(code))
    .sort((a, b) => a.legs[0].depMin - b.legs[0].depMin || a.flightNum.localeCompare(b.flightNum));
}

function renderMap(el) {
  // Nothing picked yet: start at the Profile home airport if any flight stops there today.
  const home = getSettings().homeAirport;
  if (!state.paxMapLocation && home && paxRunsFor(home).length) {
    state.paxMapLocation = home;
    saveData(state);
  }
  const loc = state.paxMapLocation;
  const runs = loc ? paxRunsFor(loc) : [];
  if (runs.length && !runs.some(r => r.id === state.paxMapRun)) {
    // Default to the next run that hasn't finished, so the passenger sees the plane they're waiting for.
    state.paxMapRun = (runs.find(r => runStatus(r).status !== "Completed") || runs[0]).id;
    saveData(state);
  }
  const { hubs, villages } = paxMapLocations();
  const locOpts = codes => codes.map(c => `<option value="${c}"${c === loc ? " selected" : ""}>${airportLabel(c)}</option>`).join("");
  el.innerHTML = `
    ${pageTopHtml("Where is my plane?")}
    <div class="card">
      <label for="paxLoc" class="step-label">1. Where are you now?</label>
      <select id="paxLoc" onchange="setPaxMapLocation(this.value)">
        <option value=""${loc ? "" : " selected"} disabled>Choose your village or town</option>
        <optgroup label="Hubs">${locOpts(hubs)}</optgroup>
        <optgroup label="Villages">${locOpts(villages)}</optgroup>
      </select>
      ${!loc ? `<p class="meta">Choose where you are to see today's Grant flights stopping there.</p>` : !runs.length ? `
        <p class="meta">No Grant flights stop at ${airportLabel(loc)} today. Call ${HELP_PHONE} to ask about upcoming flights.</p>` : `
        <label for="paxRun" class="step-label">2. Which flight?</label>
        <select id="paxRun" onchange="setPaxMapRun(this.value)">
          ${runs.map(r => `<option value="${r.id}"${r.id === state.paxMapRun ? " selected" : ""}>${runOptionText(r, true)}</option>`).join("")}
        </select>
        <div id="paxMapSvg" class="run-map"></div>`}
    </div>
    ${loc && runs.length ? `<div class="card"><div id="paxMapProgress"></div></div>` : ""}
    ${livePlanesCardHtml()}
  `;
  renderPaxMapProgress();
}

function setPaxMapLocation(code) {
  state.paxMapLocation = paxRunsFor(code).length ? code : null;
  state.paxMapRun = null;
  saveData(state);
  render();
}

function setPaxMapRun(id) {
  if (!paxRunsFor(state.paxMapLocation).some(r => r.id === id)) return;
  state.paxMapRun = id;
  saveData(state);
  renderPaxMapProgress();
}

function renderPaxMapProgress() {
  const run = RUNS.find(r => r.id === state.paxMapRun);
  if (!run || !state.paxMapLocation) return;
  renderRunView(run, { map: "paxMapSvg", progress: "paxMapProgress" }, { highlight: state.paxMapLocation });
}

async function loadMap() {
  const list = document.getElementById("flightList");
  const mapEl = document.getElementById("map");
  if (!list || !mapEl) return;
  try {
    const res = await fetch("https://opensky-network.org/api/states/all?lamin=51&lomin=-180&lamax=71&lomax=-130");
    const data = await res.json();
    const grant = (data.states || []).filter(s => {
      const cs = (s[1] || "").trim().toUpperCase();
      return cs.startsWith("GUN") || cs.startsWith("GV");
    });
    if (!grant.length) {
      mapEl.innerHTML = "No Grant planes currently visible in ADS-B coverage.";
      list.innerHTML = "<p>Check back soon.</p>";
      return;
    }
    mapEl.innerHTML = `<strong>${grant.length}</strong> Grant plane(s) tracked right now.`;
    list.innerHTML = grant.slice(0, 8).map(s => {
      const cs = (s[1] || "").trim();
      const lat = s[6], lon = s[5];
      const alt = s[7] ? Math.round(s[7] * 3.28) : "—";
      return `<div style="font-size:0.85rem; padding:0.4rem 0; border-bottom:1px solid var(--border);">${cs} • ${alt} ft • ${lat?.toFixed(2)}, ${lon?.toFixed(2)}</div>`;
    }).join("");
  } catch (e) {
    mapEl.innerHTML = "Map data unavailable (rate limit or offline).";
  }
}

function renderProfile(el, message = "", where = "") {
  const size = getTextSize();
  const set = getSettings();
  const msg = id => `<div role="status" style="margin-top:0.6rem;">${message && where === id ? confirmBannerHtml(message) : ""}</div>`;
  const toggle = (key, label, hint) => `
    <button type="button" class="toggle" role="switch" aria-checked="${set[key]}" onclick="toggleSetting('${key}')">
      <span><b>${label}</b><span class="meta">${hint}</span></span>
      <span class="toggle-state">${set[key] ? "On" : "Off"}</span>
    </button>`;
  el.innerHTML = `
    ${pageTopHtml("Profile & settings")}
    <div class="card">
      <h3>Text size</h3>
      <p class="meta">Make the words on screen bigger or smaller. Your choice is saved on this phone.</p>
      <div class="seg" role="group" aria-label="Text size">
        ${TEXT_SIZES.map(s => `
          <button type="button" class="seg-${s.id}" aria-pressed="${s.id === size}" onclick="setTextSize('${s.id}')">
            <span>${s.label}${s.id === "normal" ? " (standard)" : ""}</span>${s.id === size ? `<span>${icon("check")}</span>` : ""}
          </button>`).join("")}
      </div>
      ${msg("text")}
    </div>
    <div class="card">
      <h3>Easier to see and use</h3>
      ${toggle("highContrast", "High contrast", "Brighter words and outlines.")}
      ${toggle("reduceMotion", "Less movement", "Stops pulsing and moving effects.")}
      ${toggle("bigButtons", "Bigger buttons", "Makes buttons taller and easier to tap.")}
      ${msg("display")}
    </div>
    <div class="card">
      <h3>Flight reminders</h3>
      <p class="meta">We remind you before your flight leaves.</p>
      ${toggle("reminders", "Reminders", set.reminders ? "Reminders are turned on." : "Reminders are turned off.")}
      ${set.reminders ? `
        <p class="step-label" style="margin-top:0.75rem; font-weight:600;">When should we remind you?</p>
        <div class="seg" role="group" aria-label="Reminder time">
          ${REMINDER_LEADS.map(l => `
            <button type="button" aria-pressed="${l.id === set.reminderLead}" onclick="setReminderLead('${l.id}')">
              <span>${l.label}</span>${l.id === set.reminderLead ? `<span>${icon("check")}</span>` : ""}
            </button>`).join("")}
        </div>` : ""}
      ${msg("reminders")}
    </div>
    <div class="card">
      <label for="homeAirport" class="step-label" style="margin-top:0;">My home airport</label>
      <p class="meta">We fill this in for you on Book and the Map.</p>
      <select id="homeAirport" onchange="setHomeAirport(this.value)">
        <option value=""${set.homeAirport ? "" : " selected"}>No home airport</option>
        ${homeAirportCodes().map(c => `<option value="${c}"${c === set.homeAirport ? " selected" : ""}>${airportLabel(c)}</option>`).join("")}
      </select>
      ${msg("home")}
    </div>
    <div class="card">
      <h3>Clock</h3>
      <p>Times are shown on a 24-hour clock. Right now it is <b>${clockHHMM()}</b>.</p>
      <p class="meta">For example, 2:30 in the afternoon is shown as 14:30.</p>
    </div>
    <div class="card">
      <h3>About</h3>
      <p>Unofficial prototype for Grant Aviation. Destinations include Bethel hubs, Kenai, Dillingham, Dutch Harbor, Cold Bay, and dozens of villages across the Yukon-Kuskokwim Delta, Bristol Bay, and the Aleutians.</p>
      <p class="meta" style="margin-top:0.5rem;">Phone (prototype number): <a class="tel-link" href="tel:${HELP_PHONE_TEL}">${HELP_PHONE}</a></p>
    </div>
    <div class="card">
      <p class="meta">For Grant staff only</p>
      <button class="btn btn-outline" onclick="setRole('employee')">Switch to Employee (demo)</button>
    </div>
  `;
}

// Re-render Profile in place with a confirmation, keeping the scroll position and the help button.
function refreshProfile(message, where) {
  const el = document.getElementById("content");
  const top = el.scrollTop;
  renderProfile(el, message, where);
  el.insertAdjacentHTML("beforeend", helpButtonHtml());
  el.scrollTop = top;
}

function setTextSize(id) {
  const size = TEXT_SIZES.find(s => s.id === id);
  if (!size) return;
  try { localStorage.setItem(TEXT_SIZE_KEY, id); } catch (e) { /* private mode: still applies for this visit */ }
  applyTextSize(id);
  refreshProfile(`Text size is now ${size.label}.`, "text");
}

const TOGGLE_NAMES = { highContrast: "High contrast", reduceMotion: "Less movement", bigButtons: "Bigger buttons", reminders: "Reminders" };

function toggleSetting(key) {
  if (!TOGGLE_NAMES[key]) return;
  const s = getSettings();
  s[key] = !s[key];
  saveSettings(s);
  applySettings(s);
  refreshProfile(`${TOGGLE_NAMES[key]} is now ${s[key] ? "on" : "off"}.`, key === "reminders" ? "reminders" : "display");
}

function setReminderLead(id) {
  const lead = REMINDER_LEADS.find(l => l.id === id);
  if (!lead) return;
  const s = getSettings();
  s.reminderLead = id;
  saveSettings(s);
  refreshProfile(`We will remind you ${lead.label}.`, "reminders");
}

function setHomeAirport(code) {
  const s = getSettings();
  s.homeAirport = homeAirportCodes().includes(code) ? code : null;
  saveSettings(s);
  // Start the Map at the new home airport too (only if a flight stops there today).
  if (s.homeAirport && paxRunsFor(s.homeAirport).length && state.paxMapLocation !== s.homeAirport) {
    state.paxMapLocation = s.homeAirport;
    state.paxMapRun = null;
    saveData(state);
  }
  refreshProfile(s.homeAirport ? `Home airport is now ${airportLabel(s.homeAirport)}.` : "Home airport removed.", "home");
}

function renderTools(el) {
  el.innerHTML = `
      <h2>Employee Tools</h2>
      <div class="card">
        <h3>Flight Status</h3>
        <select id="statusFlightSelect" onchange="renderFlightStatus()">
          ${getStatusFlights().map(f => `<option value="${f.num}"${f.num === "GV5555" ? " selected" : ""}>${flightOptionText(f)}</option>`).join("")}
        </select>
        <div id="flightStatus"></div>
      </div>
      <div class="card">
        <h3>Post Delay / Weather Hold</h3>
        <div id="delayFilter">${delayFilterHtml()}</div>
        <p id="currentDep" style="font-size:0.85rem; color:var(--muted);"></p>
        <label>New Departure Time</label>
        <input type="text" id="newDepTime" placeholder="HH:MM (24-hour, e.g. 13:40)" inputmode="numeric" maxlength="5" pattern="([01][0-9]|2[0-3]):[0-5][0-9]">
        <label>New Date (for next-day delays)</label>
        <input type="date" id="newDepDate">
        <select id="delayType">
          <option value="on-time">On Time</option>
          <option value="delayed">Delayed</option>
          <option value="hold">Weather Hold</option>
        </select>
        <input id="delayMsg" placeholder="Message (optional)">
        <button class="btn" onclick="postDelay()">Post Update</button>
      </div>
      <div class="card">
        <h3>Scan Boarding Pass</h3>
        <p style="font-size:0.85rem; color:var(--muted);">Boarding pass scanning and validation now live on the Check-in tab.</p>
        <button class="btn btn-outline" onclick="goTo('checkin')">Scanning moved to Check-in</button>
      </div>
      <button class="btn btn-outline" onclick="setRole('passenger')">Switch to Passenger</button>
    `;
  renderFlightStatus();
}

// Switching mode rebuilds the bottom nav and lands on that mode's first tab.
function setRole(role) {
  const employee = role === "employee";
  if (employee === state.employeeMode) return;
  state.employeeMode = employee;
  saveData(state);
  pageHistory = [];
  currentPage = currentTabs()[0].page;
  renderNav();
  render();
}

// ---------- Employee runs ----------

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Absolute minutes from run-day midnight → "HH:MM", with "+1d" when past midnight.
function fmtMin(total) {
  const t = Math.round(total);
  const day = Math.floor(t / 1440);
  const m = ((t % 1440) + 1440) % 1440;
  const hhmm = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return day > 0 ? `${hhmm} +${day}d` : hhmm;
}

function airportLabel(code) {
  return AIRPORTS[code] ? `${AIRPORTS[code]} (${code})` : code;
}

// Turn RUN_TEMPLATES into today's runs, shifted so the template's noon lands on today's anchor time.
function buildRuns() {
  const earliest = Math.min(...RUN_TEMPLATES.map(t => toMinutes(t.legs[0][2])));
  const shift = Math.max(state.runAnchor.startMin - 12 * 60, -earliest);
  return RUN_TEMPLATES.map(t => {
    let prev = -Infinity;
    const legs = t.legs.map(([from, to, dep, arr]) => {
      let depMin = toMinutes(dep) + shift;
      while (depMin < prev) depMin += 1440;
      let arrMin = toMinutes(arr) + shift;
      while (arrMin <= depMin) arrMin += 1440;
      prev = arrMin;
      return { from, to, dep: fmtMin(depMin % 1440), arr: fmtMin(arrMin % 1440), depMin, arrMin };
    });
    return { id: t.id, flightNum: t.flightNum, aircraft: t.aircraft, base: t.base, date: state.runAnchor.date, legs };
  });
}

function runNow(run) {
  return minutesSinceMidnight(run.date);
}

function runsForBase(base) {
  // Earliest first-leg departure first, so the day reads morning to evening.
  return RUNS.filter(r => r.legs.some(l => l.from === base || l.to === base))
    .sort((a, b) => a.legs[0].depMin - b.legs[0].depMin || a.flightNum.localeCompare(b.flightNum));
}

function runStops(run) {
  return [run.legs[0].from, ...run.legs.map(l => l.to)];
}

// Delay in minutes applied to each leg. Each recorded delay shifts its fromLegIndex leg and all later ones.
function legOffsets(run) {
  const rec = state.runDelays[run.id];
  const entries = !rec ? [] : (rec.history && rec.history.length ? rec.history : [rec]);
  return run.legs.map((_, i) => entries.reduce((sum, e) => sum + (i >= e.fromLegIndex ? e.minutes : 0), 0));
}

function adjustedLegs(run) {
  const offsets = legOffsets(run);
  return run.legs.map((l, i) => ({ ...l, delay: offsets[i], adjDep: l.depMin + offsets[i], adjArr: l.arrMin + offsets[i] }));
}

function runStatus(run) {
  const legs = adjustedLegs(run);
  const now = runNow(run);
  const delay = Math.max(...legs.map(l => l.delay));
  let status = "Scheduled";
  if (now >= legs[legs.length - 1].adjArr) status = "Completed";
  else if (now >= legs[0].adjDep) status = "In progress";
  return { status, delay, legs, now };
}

function statusBadges(info) {
  const classes = {
    "Scheduled": "status-scheduled",
    "In progress": "status-on-time",
    "Completed": "status-completed"
  };
  let html = `<span class="status-badge ${classes[info.status]}">${info.status}</span>`;
  if (info.delay > 0 && info.status !== "Completed") {
    html += ` <span class="status-badge status-delayed">Delayed +${info.delay} min</span>`;
  }
  return html;
}

// Add a delay to every leg whose (adjusted) arrival hasn't passed yet; cumulative with earlier delays.
function applyRunDelay(runId, minutes) {
  const run = RUNS.find(r => r.id === runId);
  minutes = Math.round(Number(minutes));
  if (!run || !Number.isFinite(minutes) || minutes <= 0) return alert("Enter a delay in minutes");
  const info = runStatus(run);
  const fromLegIndex = info.legs.findIndex(l => l.adjArr > info.now);
  if (fromLegIndex === -1) return alert(run.flightNum + " has already completed");
  const prev = state.runDelays[runId];
  const history = prev ? (prev.history && prev.history.length ? prev.history.slice() : [{ minutes: prev.minutes, fromLegIndex: prev.fromLegIndex, appliedAt: prev.appliedAt }]) : [];
  const appliedAt = new Date().toISOString();
  history.push({ minutes, fromLegIndex, appliedAt });
  state.runDelays[runId] = {
    minutes: history.reduce((s, h) => s + h.minutes, 0),
    fromLegIndex: Math.min(...history.map(h => h.fromLegIndex)),
    appliedAt,
    history
  };
  saveData(state);
  render();
}

function applyCustomRunDelay(runId) {
  const input = document.getElementById("delay-custom-" + runId);
  applyRunDelay(runId, input ? input.value : NaN);
}

function clearRunDelay(runId) {
  delete state.runDelays[runId];
  saveData(state);
  render();
}

function setEmployeeBase(code) {
  if (!BASES.includes(code)) return;
  state.employeeBase = code;
  selectedMapRunId = null;
  saveData(state);
  render();
}

function baseSelectHtml() {
  return `<select onchange="setEmployeeBase(this.value)">
    ${BASES.map(c => `<option value="${c}"${c === state.employeeBase ? " selected" : ""}>${airportLabel(c)}</option>`).join("")}
  </select>`;
}

function renderBase(el) {
  const base = state.employeeBase;
  const runs = runsForBase(base);
  const infos = runs.map(r => ({ run: r, info: runStatus(r) }));
  const count = s => infos.filter(x => x.info.status === s).length;
  const delayed = infos.filter(x => x.info.delay > 0 && x.info.status !== "Completed").length;
  el.innerHTML = `
    <h2>Home Base</h2>
    <div class="card">
      <label>Base airport</label>
      ${baseSelectHtml()}
    </div>
    <div class="card">
      <h3>Today at ${airportLabel(base)}</h3>
      ${runs.length ? `
        <p style="font-size:0.9rem;">${runs.length} run(s) · ${count("In progress")} in progress · ${count("Scheduled")} scheduled · ${count("Completed")} completed${delayed ? ` · <span style="color:var(--accent); font-weight:600;">${delayed} delayed</span>` : ""}</p>
        ${infos.map(({ run, info }) => `
          <div style="font-size:0.85rem; padding:0.5rem 0; border-bottom:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
              <strong>${run.flightNum}</strong>
              <span>${statusBadges(info)}</span>
            </div>
            <div style="color:var(--muted);">${runStops(run).join(" → ")} · ${fmtMin(info.legs[0].adjDep)}–${fmtMin(info.legs[info.legs.length - 1].adjArr)}</div>
          </div>`).join("")}
      ` : `<p style="font-size:0.85rem; color:var(--muted);">No runs touch this base today.</p>`}
      <button class="btn" onclick="goTo('runs')">Manage Runs</button>
      <button class="btn btn-outline" onclick="goTo('runmap')">Run Map</button>
    </div>
    <div class="note">Mock schedule for the prototype. Run times are generated for today around the time you first opened the app.</div>
  `;
}

// A run matches when one of its legs leaves From and the same or a later leg lands at To.
function runMatchesFilter(run, from, to) {
  const start = from ? run.legs.findIndex(l => l.from === from) : 0;
  if (start === -1) return false;
  return !to || run.legs.slice(start).some(l => l.to === to);
}

function setRunFilter(which, code) {
  if (which === "from") runFilterFrom = code;
  else runFilterTo = code;
  render();
}

function clearRunFilter() {
  runFilterFrom = "";
  runFilterTo = "";
  render();
}

function runFilterHtml(runs, shown) {
  const codes = [...new Set(runs.flatMap(runStops))].sort((a, b) => (AIRPORTS[a] || a).localeCompare(AIRPORTS[b] || b));
  const options = (placeholder, selected) => `<option value="">${placeholder}</option>` +
    codes.map(c => `<option value="${c}"${c === selected ? " selected" : ""}>${airportLabel(c)}</option>`).join("");
  const filtered = runFilterFrom || runFilterTo;
  return `
    <div class="card">
      <h3>Find a flight</h3>
      <label for="runFilterFrom">From</label>
      <select id="runFilterFrom" onchange="setRunFilter('from', this.value)">${options("Any departure", runFilterFrom)}</select>
      <label for="runFilterTo">To</label>
      <select id="runFilterTo" onchange="setRunFilter('to', this.value)">${options("Any arrival", runFilterTo)}</select>
      <p style="font-size:1.05rem; font-weight:700; margin-top:0.5rem;">${shown} matching flight${shown === 1 ? "" : "s"}</p>
      ${filtered ? `<button class="btn btn-outline" onclick="clearRunFilter()">Show all</button>` : ""}
    </div>`;
}

function renderRuns(el) {
  const base = state.employeeBase;
  const runs = runsForBase(base);
  // Drop a chosen airport that no run at this base stops at (e.g. after changing base).
  const stops = new Set(runs.flatMap(runStops));
  if (!stops.has(runFilterFrom)) runFilterFrom = "";
  if (!stops.has(runFilterTo)) runFilterTo = "";
  const shown = runs.filter(r => runMatchesFilter(r, runFilterFrom, runFilterTo));
  el.innerHTML = `
    <h2>Runs · ${base}</h2>
    ${runs.length ? runFilterHtml(runs, shown.length) + (shown.length ? shown.map(runCardHtml).join("") : `<div class="card"><p>No flights match. Try another airport or tap Show all.</p></div>`) : `<div class="card"><p>No runs touch ${airportLabel(base)} today.</p><button class="btn btn-outline" onclick="goTo('base')">Change base</button></div>`}
  `;
}

function runCardHtml(run) {
  const info = runStatus(run);
  return `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
        <strong>${run.flightNum}</strong>
        <span>${statusBadges(info)}</span>
      </div>
      <p style="font-size:0.85rem; color:var(--muted);">${run.aircraft}</p>
      <p style="margin:0.25rem 0 0.5rem;">${runStops(run).join(" → ")}</p>
      ${info.legs.map(l => `
        <div style="font-size:0.85rem; padding:0.3rem 0; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; gap:0.5rem;${info.now >= l.adjArr ? " color:var(--muted);" : ""}">
          <span>${l.from} → ${l.to}</span>
          <span style="text-align:right;">
            ${l.delay ? `<s style="color:var(--muted);">${fmtMin(l.depMin)}–${fmtMin(l.arrMin)}</s><br><b style="color:var(--accent);">${fmtMin(l.adjDep)}–${fmtMin(l.adjArr)}</b>` : `${fmtMin(l.depMin)}–${fmtMin(l.arrMin)}`}
          </span>
        </div>`).join("")}
      ${info.status === "Completed" ? "" : `
        <div style="display:flex; gap:0.4rem; margin-top:0.5rem;">
          ${[15, 30, 40, 60].map(m => `<button class="btn btn-outline" style="padding:0.5rem 0;" onclick="applyRunDelay('${run.id}', ${m})">+${m}</button>`).join("")}
        </div>
        <div style="display:flex; gap:0.4rem; align-items:center;">
          <input type="number" id="delay-custom-${run.id}" min="1" max="720" placeholder="Custom min" style="flex:1;">
          <button class="btn" style="width:auto; margin-top:0;" onclick="applyCustomRunDelay('${run.id}')">Apply</button>
        </div>`}
      ${info.delay ? `<button class="btn btn-outline" onclick="clearRunDelay('${run.id}')">Clear delay</button>` : ""}
    </div>
  `;
}

function renderRunMap(el) {
  const base = state.employeeBase;
  let runs = runsForBase(base);
  const fallback = !runs.length;
  if (fallback) runs = RUNS;
  if (!runs.some(r => r.id === selectedMapRunId)) selectedMapRunId = runs[0].id;
  el.innerHTML = `
    <h2>Run Map</h2>
    <div class="card">
      <label>Run</label>
      <select onchange="selectMapRun(this.value)">
        ${runs.map(r => `<option value="${r.id}"${r.id === selectedMapRunId ? " selected" : ""}>${runOptionText(r)}</option>`).join("")}
      </select>
      ${fallback ? `<p style="font-size:0.8rem; color:var(--muted);">No runs touch ${base} today — showing all runs.</p>` : ""}
      <div id="runMapSvg" class="run-map"></div>
    </div>
    <div class="card">
      <div id="runProgress"></div>
    </div>
    ${livePlanesCardHtml()}
  `;
  renderRunProgress();
}

// "11:30 · GV111 · ANC→ENA→ANC". Passengers (plain) get place names: "11:30 · GV111 · Anchorage → Kenai → Anchorage".
function runOptionText(run, plain = false) {
  const dep = adjustedLegs(run)[0].adjDep;
  // Time first so it stays visible when a narrow phone select truncates the label.
  const stops = plain ? runStops(run).map(c => AIRPORTS[c] || c).join(" → ") : runStops(run).join("→");
  return `${fmtMin(dep)} · ${run.flightNum} · ${stops}`;
}

function livePlanesCardHtml() {
  return `
    <div class="card">
      <h3>Live Grant Planes</h3>
      <div id="liveMapArea"><button class="btn btn-outline" onclick="showLivePlanes()">Show live OpenSky list</button></div>
    </div>`;
}

function selectMapRun(id) {
  selectedMapRunId = id;
  renderRunProgress();
}

// Position along the run as a fraction 0..1, where each leg takes an equal share of the bar.
function runPosition(legs, now) {
  const n = legs.length;
  if (now < legs[0].adjDep) return 0;
  for (let i = 0; i < n; i++) {
    const l = legs[i];
    if (now < l.adjDep) return i / n; // on the ground at the stop before leg i
    if (now < l.adjArr) return (i + (now - l.adjDep) / (l.adjArr - l.adjDep)) / n;
  }
  return 1;
}

function renderRunProgress() {
  const run = RUNS.find(r => r.id === selectedMapRunId);
  if (run) renderRunView(run, { map: "runMapSvg", progress: "runProgress" });
}

// Shared by the employee Run Map and passenger Flight Map: SVG map into ids.map, info card into ids.progress.
// opts.highlight: airport code to mark as "You are here", with passenger arrive/depart times in the card.
function renderRunView(run, ids, opts = {}) {
  const out = document.getElementById(ids.progress);
  if (!out) return;
  const info = runStatus(run);
  const pos = runMapState(info.legs, info.now);
  const mapEl = document.getElementById(ids.map);
  if (mapEl) mapEl.innerHTML = runMapSvgHtml(run, info, pos, opts);
  out.innerHTML = runInfoHtml(run, info, pos, opts);
}

// Each time the run arrives at or leaves the passenger's stop, plus the last one that has happened and the next one to come.
function paxStopEvents(run, info, code) {
  const legs = info.legs;
  const n = legs.length;
  const events = [];
  runStops(run).forEach((c, i) => {
    if (c !== code) return;
    if (i > 0) events.push({ verb: "Arrives", past: "Arrived", t: legs[i - 1].adjArr });
    if (i < n) events.push({ verb: "Departs", past: "Departed", t: legs[i].adjDep });
  });
  const now = info.now;
  return { events, next: events.find(e => e.t > now), prev: [...events].reverse().find(e => e.t <= now) };
}

// Plain status of a run from the passenger's stop: On time / Delayed until it gets there, Boarding while it waits there, then Departed / Arrived.
function paxRunStatus(run, info, code) {
  const { next, prev } = paxStopEvents(run, info, code);
  if (!next) return info.status === "Completed" ? "arrived" : "departed";
  if (next.verb === "Departs" && ((prev && prev.verb === "Arrives") || next.t - info.now <= BOARDING_WINDOW_MIN)) return "boarding";
  return info.delay > 0 ? "delayed" : "on-time";
}

// "Arrives at Togiak (TOG) about 10:05 · Leaves about 10:25" for each visit to the stop, plus whether the plane has been and gone.
function paxStopHtml(run, info, code) {
  const { events, next, prev } = paxStopEvents(run, info, code);
  const now = info.now;
  const place = airportLabel(code);
  const times = events.map(e => `${e.verb === "Arrives" ? "Arrives" : "Leaves"} about <b>${fmtMin(e.t)}</b>`).join(" · ");
  let note;
  if (!next) note = `<span class="meta">✓ The plane has already left ${place}. It ${prev.verb === "Arrives" ? "arrived" : "left"} at about ${fmtMin(prev.t)}.</span>`;
  else if (prev && prev.verb === "Arrives" && next.verb === "Departs") note = `<span style="color:#4ade80; font-weight:700;">The plane is on the ground at ${place} now.</span>`;
  else note = `<span style="color:var(--accent-text); font-weight:700;">${next.verb === "Arrives" ? "Gets here" : "Leaves"} in ${fmtCountdown((next.t - now) * 60000)}</span>`;
  const delayNote = info.delay > 0 && next ? ` <span class="meta">(running ${info.delay} minutes late)</span>` : "";
  return `
    <div style="margin-top:0.75rem; padding:0.75rem; border:2px solid var(--accent); border-radius:10px;">
      <div style="font-weight:700;">You are here: ${place}</div>
      <div style="font-variant-numeric:tabular-nums;">${times}</div>
      <div>${note}${delayNote}</div>
    </div>`;
}

// opts.highlight (passenger map) switches to plain words and place names next to every code.
function runInfoHtml(run, info, pos, opts) {
  const plain = !!opts.highlight;
  const legs = info.legs;
  const stops = runStops(run);
  const pct = runPosition(legs, info.now) * 100;
  const n = legs.length;
  const leg = legs[pos.leg];
  const place = c => plain ? airportLabel(c) : c;
  const legText = l => `${place(l.from)} → ${place(l.to)}`;
  const stats = plain ? {
    pre: [["Next flight", legText(leg), "Leaves " + fmtMin(leg.adjDep)], ["Next stop", place(leg.to), "Lands about " + fmtMin(leg.adjArr)]],
    air: [["Flying now", legText(leg), "In the air"], ["Next stop", place(leg.to), "Lands about " + fmtMin(leg.adjArr)]],
    ground: [["On the ground at", place(leg.from), `Leaves ${fmtMin(leg.adjDep)} for ${place(leg.to)}`], ["Next stop", place(leg.to), "Lands about " + fmtMin(leg.adjArr)]],
    done: [["Last flight", legText(leg), "Finished"], ["Landed", place(leg.to), "at " + fmtMin(leg.adjArr)]]
  }[pos.phase] : {
    pre: [["Next leg", legText(leg), "dep " + fmtMin(leg.adjDep)], ["ETA next stop", `${leg.to} ${fmtMin(leg.adjArr)}`]],
    air: [["Current leg", legText(leg), "Airborne"], ["ETA next stop", `${leg.to} ${fmtMin(leg.adjArr)}`]],
    ground: [["On ground", leg.from, `next ${legText(leg)} dep ${fmtMin(leg.adjDep)}`], ["ETA next stop", `${leg.to} ${fmtMin(leg.adjArr)}`]],
    done: [["Last leg", legText(leg), "Completed"], ["Arrived", `${leg.to} ${fmtMin(leg.adjArr)}`]]
  }[pos.phase];
  stats.push(plain ? ["Trip done", `${Math.round(pct)}%`] : ["Complete", `${Math.round(pct)}%`], [plain ? "Last updated" : "Updated", fmtMin(info.now)]);
  const stopRows = stops.map((code, i) => {
    const arr = i > 0 ? legs[i - 1].adjArr : null;
    const dep = i < n ? legs[i].adjDep : null;
    const passed = i < n ? info.now >= dep : info.now >= arr;
    const mine = code === opts.highlight;
    const [arrWord, depWord] = plain ? ["Arrives ", "Leaves "] : ["arr ", "dep "];
    return `
      <div style="font-size:${plain ? "1rem" : "0.85rem"}; padding:0.4rem 0; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; gap:0.5rem;">
        <span${mine ? ' style="font-weight:700;"' : ""}><span style="display:inline-block; width:1.2rem; color:var(--success); font-weight:700;">${passed ? "✓" : ""}</span>${airportLabel(code)}${mine ? ` <span style="color:var(--accent-text); font-size:0.9em;">● You</span>` : ""}</span>
        <span style="color:var(--muted); text-align:right;">${arr !== null ? arrWord + fmtMin(arr) : ""}${arr !== null && dep !== null ? " · " : ""}${dep !== null ? depWord + fmtMin(dep) : ""}</span>
      </div>`;
  }).join("");
  // Passenger labels under the bar use place names on two staggered rows so neighbours don't collide.
  const barLabels = plain
    ? `<div style="position:relative; height:2.8rem; margin:0 0.5rem 0.75rem; font-size:0.9rem; color:var(--muted);">
        ${stops.map((code, i) => `<span style="position:absolute; top:${i % 2 ? "1.3rem" : "0"}; left:${(i / n) * 100}%; white-space:nowrap; transform:translateX(${i === 0 ? "0" : i === n ? "-100%" : "-50%"});">${AIRPORTS[code] || code}</span>`).join("")}
      </div>`
    : `<div style="position:relative; height:1.2rem; margin:0 0.5rem 0.75rem; font-size:0.7rem; color:var(--muted);">
        ${stops.map((code, i) => `<span style="position:absolute; left:${(i / n) * 100}%; transform:translateX(${i === 0 ? "0" : i === n ? "-100%" : "-50%"});">${code}</span>`).join("")}
      </div>`;
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap;">
      <span style="font-size:${plain ? "1rem" : "0.85rem"};"><strong>${plain ? "Flight " : ""}${run.flightNum}</strong> · ${run.aircraft}</span>
      <span>${plain ? paxStatusBadge(paxRunStatus(run, info, opts.highlight)) : statusBadges(info)}</span>
    </div>
    ${plain ? paxStopHtml(run, info, opts.highlight) : ""}
    <div class="rm-stats${plain ? " rm-stats-plain" : ""}">
      ${stats.map(([label, value, sub]) => `
        <div><span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ""}</div>`).join("")}
    </div>
    <div style="position:relative; height:12px; margin:1.25rem 0.5rem 0.25rem; border-radius:6px; overflow:visible; background:var(--accent);">
      <div style="position:absolute; left:0; top:0; bottom:0; width:${pct}%; background:var(--success); border-radius:6px 0 0 6px;"></div>
      ${stops.map((_, i) => `<div style="position:absolute; left:${(i / n) * 100}%; top:-3px; width:2px; height:18px; margin-left:-1px; background:var(--muted);"></div>`).join("")}
      <div style="position:absolute; left:${pct}%; top:50%; width:18px; height:18px; margin:-9px 0 0 -9px; border-radius:50%; background:var(--text); border:3px solid var(--bg); box-shadow:0 0 0 1px var(--muted), 0 1px 3px rgba(0,0,0,0.6);"></div>
    </div>
    ${barLabels}
    ${stopRows}
  `;
}

// ---------- Run map (inline SVG) ----------

const RUN_MAP_W = 400;
const RUN_MAP_H = 300;
let runMapTimer = null;
let runMapTimerKey = null; // "employee" | "passenger" — which map the running interval refreshes

// Where the plane is: before departure, airborne on leg i (fraction t), on the ground waiting for leg i, or done.
function runMapState(legs, now) {
  if (now < legs[0].adjDep) return { phase: "pre", leg: 0, t: 0 };
  for (let i = 0; i < legs.length; i++) {
    const l = legs[i];
    if (now < l.adjDep) return { phase: "ground", leg: i, t: 0 };
    if (now < l.adjArr) return { phase: "air", leg: i, t: (now - l.adjDep) / (l.adjArr - l.adjDep) };
  }
  return { phase: "done", leg: legs.length - 1, t: 1 };
}

// Quadratic Bézier point and tangent for a leg drawn as [start, control, end].
function curvePoint([a, c, b], t) {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
}

function curveTangent([a, c, b], t) {
  return [2 * (1 - t) * (c[0] - a[0]) + 2 * t * (b[0] - c[0]), 2 * (1 - t) * (c[1] - a[1]) + 2 * t * (b[1] - c[1])];
}

// Split a curve at t into the flown part and the part still ahead.
function splitCurve(curve, t) {
  const [a, c, b] = curve;
  const lerp = (p, q) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const m = curvePoint(curve, t);
  return [[a, lerp(a, c), m], [m, lerp(c, b), b]];
}

function curvePath([a, c, b]) {
  const f = p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  return `M${f(a)} Q${f(c)} ${f(b)}`;
}

function headingDeg(v) {
  return Math.atan2(v[0], -v[1]) * 180 / Math.PI; // 0 = north (up), clockwise
}

function niceStep(span) {
  return [0.1, 0.25, 0.5, 1, 2, 5, 10].find(s => span / s <= 5) || 10;
}

function runMapSvgHtml(run, info, pos, opts = {}) {
  const W = RUN_MAP_W, H = RUN_MAP_H;
  const legs = info.legs;
  const stops = runStops(run);
  if (!stops.every(c => AIRPORT_COORDS[c])) return `<p class="note">No map position for ${stops.filter(c => !AIRPORT_COORDS[c]).join(", ")}.</p>`;

  // Equirectangular projection: x = lon·cos(mean lat), y = −lat. Legs bow slightly left of travel, so out-and-back legs read as two arcs.
  const coords = stops.map(c => AIRPORT_COORDS[c]);
  const k = Math.cos(coords.reduce((s, c) => s + c[0], 0) / coords.length * Math.PI / 180);
  const raw = coords.map(([lat, lon]) => [lon * k, -lat]);
  const rawCurves = legs.map((_, i) => {
    const a = raw[i], b = raw[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    return [a, [(a[0] + b[0]) / 2 + dy * 0.18, (a[1] + b[1]) / 2 - dx * 0.18], b];
  });
  const all = rawCurves.flat();
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const spanX = Math.max(Math.max(...xs) - Math.min(...xs), 0.4), spanY = Math.max(Math.max(...ys) - Math.min(...ys), 0.3);
  const s = Math.min((W - 2 * 56) / spanX, (H - 2 * 50) / spanY);
  const toScreen = p => [(p[0] - cx) * s + W / 2, (p[1] - cy) * s + H / 2];
  const pts = raw.map(toScreen);
  const curves = rawCurves.map(c => c.map(toScreen));

  // Graticule over the visible lat/lon range.
  const lonAt = x => ((x - W / 2) / s + cx) / k;
  const latAt = y => -((y - H / 2) / s + cy);
  const lonMin = lonAt(0), lonMax = lonAt(W), latMin = latAt(H), latMax = latAt(0);
  const lonStep = niceStep(lonMax - lonMin), latStep = niceStep(latMax - latMin);
  const deg = (v, step, pos, neg) => `${Math.abs(v).toFixed(step >= 1 ? 0 : step >= 0.5 ? 1 : 2)}°${v >= 0 ? pos : neg}`;
  let grid = "";
  for (let lon = Math.ceil(lonMin / lonStep) * lonStep; lon <= lonMax; lon += lonStep) {
    const x = ((lon * k - cx) * s + W / 2).toFixed(1);
    grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/><text class="rm-grid-label" x="${+x + 3}" y="${H - 5}">${deg(lon, lonStep, "E", "W")}</text>`;
  }
  for (let lat = Math.ceil(latMin / latStep) * latStep; lat <= latMax; lat += latStep) {
    const y = ((-lat - cy) * s + H / 2).toFixed(1);
    grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/><text class="rm-grid-label" x="4" y="${+y - 3}">${deg(lat, latStep, "N", "S")}</text>`;
  }

  // Route: flown portion green with glow, remaining red dashed.
  const flown = i => pos.phase === "done" || i < pos.leg ? 1 : (i === pos.leg && pos.phase === "air" ? pos.t : 0);
  let ahead = "", behind = "";
  curves.forEach((c, i) => {
    const f = flown(i);
    if (f >= 1) behind += curvePath(c);
    else if (f <= 0) ahead += curvePath(c);
    else {
      const [done, rest] = splitCurve(c, f);
      behind += curvePath(done);
      ahead += curvePath(rest);
    }
  });

  // Stops: one marker per airport (out-and-back runs revisit the base), labelled with effective 24h times.
  const byCode = new Map();
  stops.forEach((code, i) => {
    const time = i === 0 ? legs[0].adjDep : legs[i - 1].adjArr;
    const delayed = (i === 0 ? legs[0].delay : legs[i - 1].delay) > 0;
    const passed = i === 0 ? info.now >= legs[0].adjDep : info.now >= legs[i - 1].adjArr;
    const entry = byCode.get(code) || { code, pt: pts[i], times: [], delayed: false, passed: false };
    entry.times.push(fmtMin(time));
    entry.delayed = entry.delayed || delayed;
    entry.passed = entry.passed || passed;
    byCode.set(code, entry);
  });
  // Plane: at the origin before departure, on the curve when airborne, at the stop on the ground.
  const cur = curves[pos.leg];
  const at = pos.phase === "air" ? curvePoint(cur, pos.t) : pos.phase === "done" ? cur[2] : cur[0];
  const heading = headingDeg(curveTangent(cur, pos.phase === "air" ? pos.t : pos.phase === "done" ? 1 : 0));
  const plane = `
    <g transform="translate(${at[0].toFixed(1)} ${at[1].toFixed(1)})">
      ${pos.phase === "air" ? `<circle class="rm-pulse" r="11"/>` : ""}
      <path class="rm-plane" transform="rotate(${heading.toFixed(0)}) scale(1.15)"
        d="M0,-11 C1.2,-11 1.7,-9.6 1.7,-8 L1.7,-3 L10,2 L10,4.4 L1.7,1.8 L1.7,6.8 L4.4,9 L4.4,10.8 L0,9.6 L-4.4,10.8 L-4.4,9 L-1.7,6.8 L-1.7,1.8 L-10,4.4 L-10,2 L-1.7,-3 L-1.7,-8 C-1.7,-9.6 -1.2,-11 0,-11 Z"/>
    </g>`;

  // Labels: "Bethel (BET)" over the times, plus "YOU ARE HERE" for the passenger's stop.
  // The plane icon (radius ~13.5 at any heading) is a hard obstacle — a label is never placed over it.
  // Stop markers and labels already placed are avoided when possible. Candidates start right next to the
  // stop and move outwards; a vertical sweep across the whole map guarantees a spot clear of the plane.
  const PLANE_R = 17;
  const planeBox = { x: at[0] - PLANE_R, y: at[1] - PLANE_R, w: 2 * PLANE_R, h: 2 * PLANE_R };
  const hit = (r, p) => r.x < p.x + p.w && p.x < r.x + r.w && r.y < p.y + p.h && p.y < r.y + r.h;
  const inMap = r => r.y >= 2 && r.y + r.h <= H - 2;
  const stopBoxes = [...byCode.values()].map(st => {
    const r = st.code === opts.highlight ? 13 : 8;
    return { x: st.pt[0] - r, y: st.pt[1] - r, w: 2 * r, h: 2 * r };
  });
  const region = MAP_REGIONS[run.base] || "Alaska";
  const regionText = `${region.toUpperCase()} · AK`;
  const regionW = regionText.length * 7.6;
  stopBoxes.push({ x: W - 8 - regionW, y: 6, w: regionW, h: 16 }, { x: W - 24, y: 28, w: 20, h: 26 }); // region caption, north arrow
  const LINE = 14;
  const placed = [];
  let stopsSvg = "", leaders = "";
  // The passenger's stop is placed first so it gets the best label spot.
  const stopList = [...byCode.values()].sort((a, b) => (b.code === opts.highlight) - (a.code === opts.highlight));
  stopList.forEach(st => {
    const mine = st.code === opts.highlight;
    const name = airportLabel(st.code);
    const times = st.times.join(" / ");
    // Generous width estimate for 12px text (bold name ~7.4px/char, times ~6.9px/char).
    const w = Math.ceil(Math.max(name.length * 7.4, times.length * 6.9, mine ? 12 * 6.6 : 0)) + 8;
    const h = (mine ? 3 : 2) * LINE + 4;
    const [px, py] = st.pt;
    const box = (cx, cy) => ({ x: Math.min(Math.max(cx - w / 2, 2), W - 2 - w), y: cy - h / 2, w, h });
    const cands = [];
    [8, 20, 34, 50].forEach(g => cands.push(
      box(px, py - g - h / 2), box(px, py + g + h / 2), box(px + g + w / 2, py), box(px - g - w / 2, py)
    ));
    for (let dy = 6; dy <= H; dy += 6) cands.push(box(px, py - dy), box(px, py + dy));
    const clearOfPlane = cands.filter(r => inMap(r) && !hit(r, planeBox));
    const spot = clearOfPlane.find(r => ![...placed, ...stopBoxes].some(p => hit(r, p)))
      || clearOfPlane.find(r => !placed.some(p => hit(r, p)))
      || clearOfPlane[0];
    placed.push(spot);
    const lx = (spot.x + w / 2).toFixed(1);
    // Labels pushed away from their stop get a faint leader line back to it.
    const nx = Math.min(Math.max(px, spot.x), spot.x + w), ny = Math.min(Math.max(py, spot.y), spot.y + h);
    if (Math.hypot(nx - px, ny - py) > 24) leaders += `<line class="rm-leader" x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}"/>`;
    const cxy = `cx="${px.toFixed(1)}" cy="${py.toFixed(1)}"`;
    const base = spot.y + 2;
    stopsSvg += `${mine ? `<circle class="rm-you-ring" ${cxy} r="11"/>` : ""}
      <circle class="${st.passed ? "rm-stop-done" : "rm-stop"}" ${cxy} r="${mine ? 6.5 : st.code === stops[0] ? 6 : 5}"/>
      <text class="rm-label rm-code" x="${lx}" y="${(base + 11).toFixed(1)}" text-anchor="middle">${name}</text>
      <text class="rm-label ${st.delayed ? "rm-time-late" : "rm-time"}" x="${lx}" y="${(base + LINE + 11).toFixed(1)}" text-anchor="middle">${times}</text>
      ${mine ? `<text class="rm-label rm-you" x="${lx}" y="${(base + 2 * LINE + 10).toFixed(1)}" text-anchor="middle">YOU ARE HERE</text>` : ""}`;
  });

  const where = { pre: `at ${stops[0]}, departs ${fmtMin(legs[0].adjDep)}`, air: `airborne ${legs[pos.leg].from} to ${legs[pos.leg].to}`,
    ground: `on the ground at ${legs[pos.leg].from}`, done: `completed at ${stops[stops.length - 1]}` }[pos.phase];

  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${run.flightNum} route ${stops.map(airportLabel).join(" to ")}; plane ${where}">
      <defs>
        <filter id="rmGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="${W}" height="${H}" fill="#0f1620"/>
      <g class="rm-grid">${grid}</g>
      <text class="rm-region" x="${W - 8}" y="18" text-anchor="end">${regionText}</text>
      <text class="rm-north" x="${W - 14}" y="38" text-anchor="middle">N</text>
      <path class="rm-north-arrow" d="M${W - 14} 42 l-4 9 l4 -2.5 l4 2.5 Z"/>
      <path class="rm-ahead" d="${ahead}"/>
      <path class="rm-flown" d="${behind}" filter="url(#rmGlow)"/>
      ${leaders}
      ${stopsSvg}
      ${plane}
    </svg>
    ${pos.phase === "done" ? `<div class="rm-banner">${opts.highlight ? "Landed" : "Completed"}</div>` : ""}`;
}

// Refresh the route map every 30s only while the employee Run Map or passenger Map tab is showing; called from render().
// One interval at a time; it is restarted whenever the active map view changes.
function syncRunMapTimer() {
  const key = state.employeeMode ? (currentPage === "runmap" ? "employee" : null) : (currentPage === "map" ? "passenger" : null);
  if (runMapTimer && runMapTimerKey !== key) {
    clearInterval(runMapTimer);
    runMapTimer = null;
  }
  if (key && !runMapTimer) {
    runMapTimer = setInterval(key === "employee" ? renderRunProgress : renderPaxMapProgress, 30000);
  }
  runMapTimerKey = runMapTimer ? key : null;
}

function showLivePlanes() {
  const area = document.getElementById("liveMapArea");
  if (!area) return;
  area.innerHTML = `
    <div id="map" style="padding:0.75rem; background:var(--input-bg); border:1px solid var(--border); border-radius:8px; color:var(--muted); font-size:0.85rem;">Loading…</div>
    <div id="flightList" style="margin-top:0.5rem;"></div>
    <button class="btn btn-outline" onclick="loadMap()">Refresh</button>
  `;
  loadMap();
}

// All flights an employee can post updates for: mock schedule plus booked trips, unique by flight number.
function getKnownFlights() {
  const byNum = new Map();
  Object.keys(MOCK_FLIGHTS).forEach(key => {
    const route = key.split("-").join(" → ");
    const [from, to] = key.split("-").map(airportCodeOf);
    MOCK_FLIGHTS[key].forEach(f => {
      if (!byNum.has(f.num)) byNum.set(f.num, { num: f.num, route, dep: f.dep, from, to });
    });
  });
  state.trips.forEach(t => {
    if (!t.flightNum || byNum.has(t.flightNum)) return;
    byNum.set(t.flightNum, { num: t.flightNum, route: `${t.from} → ${t.to}`, dep: t.depTime || "", from: airportCodeOf(t.from), to: airportCodeOf(t.to) });
  });
  return [...byNum.values()];
}

// Known flights plus any flight that has a manifest, unique by flight number.
function getStatusFlights() {
  const flights = getKnownFlights();
  const nums = new Set(flights.map(f => f.num));
  Object.keys(state.flightManifests).forEach(num => {
    if (!nums.has(num)) flights.push({ num, route: "Manifest only", dep: "" });
  });
  return flights;
}

function renderFlightStatus() {
  const select = document.getElementById("statusFlightSelect");
  const out = document.getElementById("flightStatus");
  if (!select || !out) return;
  const manifest = state.flightManifests[select.value] || [];
  if (!manifest.length) {
    out.innerHTML = `<p style="font-size:0.85rem; color:var(--muted);">No passengers on the manifest for this flight.</p>`;
    return;
  }
  const notIn = manifest.filter(p => !p.checkedIn);
  out.innerHTML = `
    <p style="margin-top:0.5rem;"><b>${manifest.length - notIn.length}/${manifest.length} passengers checked in</b></p>
    ${notIn.length
      ? `<p style="font-size:0.85rem; color:var(--muted);">Not checked in:</p>` + notIn.map(p => `
        <div style="font-size:0.85rem; padding:0.4rem 0; border-bottom:1px solid var(--border); display:flex; justify-content:space-between;">
          <span>${p.name}</span>
          <a href="tel:${p.phone.replace(/[^\d+]/g, "")}">${p.phone}</a>
        </div>`).join("")
      : `<p style="font-size:0.85rem; color:var(--success);">All passengers checked in.</p>`}
  `;
}

function flightOptionText(f) {
  const delay = state.delays[f.num];
  let text = `${f.num} · ${f.route} · dep ${f.dep}`;
  if (delay && (delay.newDepTime || delay.newDepDate)) {
    text += ` · now ${[delay.newDepDate, delay.newDepTime].filter(Boolean).join(" ")}`;
  }
  return text;
}

// Post Delay From/To filter. Updates the card in place so typed times and messages are kept.
function delayFilterHtml() {
  const flights = getKnownFlights();
  const codes = [...new Set(flights.flatMap(f => [f.from, f.to]).filter(Boolean))].sort((a, b) => (AIRPORTS[a] || a).localeCompare(AIRPORTS[b] || b));
  if (!codes.includes(delayFilterFrom)) delayFilterFrom = "";
  if (!codes.includes(delayFilterTo)) delayFilterTo = "";
  const options = (placeholder, selected) => `<option value="">${placeholder}</option>` +
    codes.map(c => `<option value="${c}"${c === selected ? " selected" : ""}>${airportLabel(c)}</option>`).join("");
  const shown = flights.filter(f => (!delayFilterFrom || f.from === delayFilterFrom) && (!delayFilterTo || f.to === delayFilterTo));
  const filtered = delayFilterFrom || delayFilterTo;
  return `
    <label for="delayFilterFrom">From</label>
    <select id="delayFilterFrom" onchange="setDelayFilter('from', this.value)">${options("Any departure", delayFilterFrom)}</select>
    <label for="delayFilterTo">To</label>
    <select id="delayFilterTo" onchange="setDelayFilter('to', this.value)">${options("Any arrival", delayFilterTo)}</select>
    <p style="font-size:1.05rem; font-weight:700; margin-top:0.5rem;">${shown.length} matching flight${shown.length === 1 ? "" : "s"}</p>
    ${filtered ? `<button class="btn btn-outline" onclick="clearDelayFilter()">Show all</button>` : ""}
    <select id="delayFlightSelect" onchange="updateCurrentDep()">
      <option value="">${shown.length ? "Select a flight" : "No flights match"}</option>
      ${shown.map(f => `<option value="${f.num}">${flightOptionText(f)}</option>`).join("")}
    </select>`;
}

function refreshDelayFilter() {
  const box = document.getElementById("delayFilter");
  if (!box) return;
  const prev = document.getElementById("delayFlightSelect").value;
  box.innerHTML = delayFilterHtml();
  // Keep the chosen flight if it still matches.
  const select = document.getElementById("delayFlightSelect");
  if ([...select.options].some(o => o.value === prev)) select.value = prev;
  updateCurrentDep();
}

function setDelayFilter(which, code) {
  if (which === "from") delayFilterFrom = code;
  else delayFilterTo = code;
  refreshDelayFilter();
}

function clearDelayFilter() {
  delayFilterFrom = "";
  delayFilterTo = "";
  refreshDelayFilter();
}

function updateCurrentDep() {
  const num = document.getElementById("delayFlightSelect").value;
  const out = document.getElementById("currentDep");
  const f = getKnownFlights().find(k => k.num === num);
  if (!f) {
    out.textContent = "";
    return;
  }
  const delay = state.delays[num];
  let text = "Scheduled departure: " + f.dep;
  if (delay && (delay.newDepTime || delay.newDepDate)) {
    text += " · Posted new departure: " + [delay.newDepDate, delay.newDepTime].filter(Boolean).join(" ");
  }
  out.textContent = text;
}

// Effective departure for a trip, applying any posted new time/date.
function getEffectiveDep(trip) {
  const delay = state.delays[trip.flightNum];
  const changed = !!(delay && (delay.newDepTime || delay.newDepDate));
  return {
    date: (changed && delay.newDepDate) || trip.date,
    time: (changed && delay.newDepTime) || trip.depTime || "",
    changed
  };
}

function postDelay() {
  const num = document.getElementById("delayFlightSelect").value;
  const type = document.getElementById("delayType").value;
  const msg = document.getElementById("delayMsg").value;
  let newDepTime = document.getElementById("newDepTime").value.trim() || null;
  if (newDepTime) {
    // Accept 1340 or 13:40; always store 24-hour HH:MM.
    const m = newDepTime.match(/^([01]?\d|2[0-3]):?([0-5]\d)$/);
    if (!m) return alert("Enter the new departure time in 24-hour format, e.g. 09:00 or 13:40");
    newDepTime = m[1].padStart(2, "0") + ":" + m[2];
  }
  const newDepDate = document.getElementById("newDepDate").value || null;
  if (!num) return alert("Select a flight");
  state.delays[num] = { type, message: msg, newDepTime, newDepDate };
  saveData(state);
  alert("Update posted for " + num);
  render();
}

// ---------- Passenger check-in (employee) ----------

let cameraStream = null;
let cameraRequest = 0;   // bumped on stop so a late getUserMedia result is discarded
let recentCheckIns = []; // this session only, newest first

function clockHHMM(d = new Date()) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Every scheduled departure today by flight number: { num, from, route, depMin, dep }. Runs use their adjusted first leg.
function scheduledDepartures() {
  const byNum = new Map();
  const add = (num, from, route, depMin) => {
    if (!byNum.has(num)) byNum.set(num, { num, from, route, depMin, dep: fmtMin(depMin) });
  };
  const postedDep = (num, dep) => toMinutes((state.delays[num] && state.delays[num].newDepTime) || dep);
  Object.keys(MOCK_FLIGHTS).forEach(key => {
    const [from, to] = key.split("-").map(airportCodeOf);
    MOCK_FLIGHTS[key].forEach(f => add(f.num, from, `${from} → ${to}`, postedDep(f.num, f.dep)));
  });
  CONNECTION_FLIGHTS.forEach(([num, from, to, dep]) => add(num, from, `${from} → ${to}`, postedDep(num, dep)));
  RUNS.forEach(run => add(run.flightNum, run.legs[0].from, runStops(run).join(" → "), runStatus(run).legs[0].adjDep));
  return byNum;
}

// Flight numbers a pass is good for: every leg of a multi-leg trip, else its manifest, else parsed from GRANT-<num>-….
function passFlightNums(code, trip, manifestNum) {
  const nums = new Set();
  if (trip) {
    (Array.isArray(trip.legs) ? trip.legs : []).forEach(l => { if (l.num) nums.add(l.num); });
    if (trip.flightNum) nums.add(trip.flightNum);
  }
  if (manifestNum) nums.add(manifestNum);
  if (!nums.size) {
    const m = /^GRANT-(GV\d+)-/i.exec(code || "");
    if (m) nums.add(m[1].toUpperCase());
  }
  return [...nums];
}

// Every manifest passenger with their trip (if booked) and the flights their pass covers.
function checkinPassengers() {
  const list = [];
  Object.keys(state.flightManifests).forEach(num => {
    state.flightManifests[num].forEach(entry => {
      const trip = entry.tripId ? state.trips.find(t => t.id === entry.tripId) || null : null;
      list.push({ entry, trip, manifestNum: num, flightNums: passFlightNums(entry.boardingPass, trip, num) });
    });
  });
  return list;
}

function passengersOnFlight(num, pax = checkinPassengers()) {
  return pax.filter(p => p.flightNums.includes(num));
}

// Today's flights departing the base (schedules, runs, and any booked leg leaving it), sorted by departure.
function checkinFlightsForBase(base) {
  const scheduled = scheduledDepartures();
  const flights = new Map();
  scheduled.forEach(f => { if (f.from === base) flights.set(f.num, f); });
  checkinPassengers().forEach(({ trip }) => {
    if (!trip) return; // seeded passengers sit on scheduled flights, already covered above
    const legs = Array.isArray(trip.legs) && trip.legs.length
      ? trip.legs
      : [{ num: trip.flightNum, from: trip.from, to: trip.to, dep: trip.depTime }];
    legs.forEach(l => {
      const from = airportCodeOf(l.from);
      if (!l.num || from !== base || flights.has(l.num) || !/^\d{1,2}:\d{2}$/.test(l.dep || "")) return;
      flights.set(l.num, { num: l.num, from, route: `${from} → ${airportCodeOf(l.to)}`, depMin: toMinutes(l.dep), dep: fmtMin(toMinutes(l.dep)) });
    });
  });
  return [...flights.values()].sort((a, b) => a.depMin - b.depMin || a.num.localeCompare(b.num));
}

// Keep the saved selection if it departs this base; otherwise the first flight with passengers, else the next upcoming, else the first.
function resolveCheckinFlight(flights) {
  let f = flights.find(x => x.num === state.checkinFlight);
  if (!f) {
    const pax = checkinPassengers();
    const nowMin = minutesSinceMidnight(localDateISO(new Date()));
    f = flights.find(x => passengersOnFlight(x.num, pax).length) || flights.find(x => x.depMin >= nowMin) || flights[0] || null;
    state.checkinFlight = f ? f.num : null;
    saveData(state);
  }
  return f;
}

function selectedCheckinFlight() {
  return resolveCheckinFlight(checkinFlightsForBase(state.employeeBase));
}

function setCheckinFlight(num) {
  state.checkinFlight = num;
  saveData(state);
  updateCheckinSummary();
}

function updateCheckinSummary() {
  const out = document.getElementById("checkinSummary");
  if (!out || !state.checkinFlight) return;
  const pax = passengersOnFlight(state.checkinFlight);
  const n = pax.length;
  out.textContent = `${n} passenger${n === 1 ? "" : "s"} · ${pax.filter(p => p.entry.checkedIn).length} checked in`;
}

// "GV2905 · BET → VAK · 08:30" for the flight a pass is actually booked on.
function passBookingText(trip, manifestNum) {
  if (trip) {
    const legs = Array.isArray(trip.legs) && trip.legs.length ? trip.legs : null;
    const stops = legs ? [legs[0].from, ...legs.map(l => l.to)] : [trip.from, trip.to];
    return `${trip.itineraryNum || trip.flightNum} · ${stops.map(airportCodeOf).join(" → ")} · ${getEffectiveDep(trip).time}`;
  }
  const f = scheduledDepartures().get(manifestNum);
  return f ? `${f.num} · ${f.route} · ${f.dep}` : manifestNum;
}

// Look a boarding pass up in trips and manifests and check the passenger in if it is for the selected flight.
// Returns { status: "ok" | "already" | "wrong" | "invalid", ... } for the result modal.
function validateBoardingPass(rawCode, flight) {
  const code = (rawCode || "").trim();
  if (!code) return { status: "invalid", code, reason: "Enter or scan a boarding code." };
  if (!flight) return { status: "invalid", code, reason: "Select a flight to confirm passengers for first." };
  let trip = state.trips.find(t => t.boardingPass === code) || null;
  let flightNum = trip ? trip.flightNum : null;
  let entry = null;
  for (const num of Object.keys(state.flightManifests)) {
    entry = state.flightManifests[num].find(p => p.boardingPass === code || (trip && p.tripId === trip.id));
    if (entry) {
      flightNum = num;
      break;
    }
  }
  if (!trip && entry && entry.tripId) trip = state.trips.find(t => t.id === entry.tripId) || null;
  if (trip && !entry) entry = getManifestEntryForTrip(trip);
  if (!entry) {
    const reason = /^GRANT-/i.test(code)
      ? "No trip or manifest matches this code. Check it was typed correctly or scan again."
      : "Not a Grant boarding pass code (expected GRANT-…).";
    return { status: "invalid", code, reason };
  }

  const result = {
    code,
    name: trip ? trip.passengerName : entry.name,
    flightNum: flight.num,
    route: flight.route,
    dep: flight.dep
  };
  if (!passFlightNums(code, trip, flightNum).includes(flight.num)) {
    result.status = "wrong";
    result.booked = passBookingText(trip, flightNum);
    return result;
  }
  // A pass scanned at the plane means the passenger has boarded (their trip shows "Boarded").
  if (trip && !trip.boarded) {
    trip.boarded = true;
    saveData(state);
  }
  if (entry.checkedIn) {
    result.status = "already";
    result.time = entry.checkedInAt || null;
  } else {
    entry.checkedIn = true;
    entry.checkedInAt = clockHHMM();
    entry.boardingPass = code;
    if (trip) {
      trip.checkedIn = true;
      trip.boardingPass = code;
    }
    saveData(state);
    result.status = "ok";
    result.time = entry.checkedInAt;
    recentCheckIns.unshift({ time: result.time, name: result.name, flightNum: flight.num });
    recentCheckIns = recentCheckIns.slice(0, 5);
  }
  return result;
}

function renderCheckin(el) {
  const canCamera = !!navigator.mediaDevices?.getUserMedia;
  const flights = checkinFlightsForBase(state.employeeBase);
  const selected = resolveCheckinFlight(flights);
  el.innerHTML = `
    <h2>Passenger Check-in</h2>
    <div class="card">
      <label for="checkinFlight">Confirming passengers for</label>
      ${flights.length ? `
        <select id="checkinFlight" onchange="setCheckinFlight(this.value)">
          ${flights.map(f => `<option value="${f.num}"${f === selected ? " selected" : ""}>${f.num} · ${f.route} · ${f.dep}</option>`).join("")}
        </select>
        <p id="checkinSummary" class="checkin-summary"></p>`
      : `<p class="checkin-summary">No flights depart ${airportLabel(state.employeeBase)} today.</p>`}
    </div>
    <div class="card">
      <div class="viewfinder" id="viewfinder">
        <video id="cameraVideo" muted playsinline autoplay hidden></video>
        <span class="vf-corner vf-tl"></span><span class="vf-corner vf-tr"></span>
        <span class="vf-corner vf-bl"></span><span class="vf-corner vf-br"></span>
        <span class="vf-line"></span>
        <p class="vf-caption">Point camera at boarding pass QR code</p>
      </div>
      <p id="cameraNote" class="vf-note"${canCamera ? " hidden" : ""}>${canCamera ? "" : "Camera not available on this device — use Simulate Scan or paste the code."}</p>
      <button class="btn" id="cameraBtn" onclick="toggleCamera()"${canCamera ? "" : " disabled"}>Use Camera</button>
      <button class="btn btn-outline" onclick="simulateScan()">Simulate Scan</button>
      <label for="checkinCode" style="display:block; margin-top:0.75rem; font-size:0.85rem; color:var(--muted);">Or paste boarding code</label>
      <input id="checkinCode" placeholder="GRANT-GV5555-S01" autocomplete="off" autocapitalize="characters"
        onkeydown="if (event.key === 'Enter') submitCheckinCode()">
      <button class="btn btn-outline" onclick="submitCheckinCode()">Validate</button>
    </div>
    <div class="card">
      <h3>Recent check-ins</h3>
      <div id="recentCheckins"></div>
    </div>
  `;
  updateCheckinSummary();
  renderRecentCheckins();
}

function checkinRow(label, value) {
  return `<div><span>${label}</span><b>${escapeHtml(value || "—")}</b></div>`;
}

// Result popup: green confirmed, amber already checked in, red wrong flight / not found.
function showCheckinModal(r) {
  hideCheckinModal();
  const kinds = {
    ok: { icon: "✓", cls: "result-ok", title: "Passenger confirmed" },
    already: { icon: "!", cls: "result-warn", title: `Already checked in${r.time ? ` at ${r.time}` : ""}` },
    wrong: { icon: "✗", cls: "result-bad", title: "Wrong flight" },
    invalid: { icon: "✗", cls: "result-bad", title: r.title || "Not found" }
  };
  const k = kinds[r.status];
  let rows = "";
  if (r.status === "ok") rows = checkinRow("Flight", r.flightNum) + checkinRow("Route", r.route) + checkinRow("Departure", r.dep) + checkinRow("Pass", r.code);
  else if (r.status === "already") rows = checkinRow("Flight", r.flightNum) + checkinRow("Pass", r.code);
  else if (r.status === "wrong") rows = checkinRow("Booked on", r.booked) + checkinRow("Selected", r.flightNum);
  else if (r.code) rows = checkinRow("Entered code", r.code);
  const overlay = document.createElement("div");
  overlay.className = "ci-overlay";
  overlay.id = "checkinModal";
  overlay.innerHTML = `
    <div class="ci-modal" role="dialog" aria-modal="true" aria-labelledby="ciTitle">
      <div class="result-icon ${k.cls}" aria-hidden="true">${k.icon}</div>
      <h3 id="ciTitle" class="ci-title ci-${r.status}">${escapeHtml(k.title)}</h3>
      ${r.name ? `<p class="ci-name">${escapeHtml(r.name)}</p>` : ""}
      ${rows ? `<div class="checkin-details">${rows}</div>` : ""}
      ${r.reason ? `<p class="ci-hint">${escapeHtml(r.reason)}</p>` : ""}
      <button class="btn" id="ciNext" onclick="closeCheckinModal(true)">Next passenger</button>
    </div>`;
  overlay.addEventListener("click", e => { if (e.target === overlay) closeCheckinModal(false); });
  document.body.appendChild(overlay);
  document.getElementById("ciNext").focus();
  if (r.status === "ok" && navigator.vibrate) navigator.vibrate(60);
}

function hideCheckinModal() {
  const modal = document.getElementById("checkinModal");
  if (modal) modal.remove();
}

// "Next passenger" clears the code; overlay click / Escape keep it selected for a quick fix.
function closeCheckinModal(clear) {
  hideCheckinModal();
  const input = document.getElementById("checkinCode");
  if (!input) return;
  if (clear) input.value = "";
  input.focus();
  if (!clear) input.select();
}

function renderRecentCheckins() {
  const out = document.getElementById("recentCheckins");
  if (!out) return;
  out.innerHTML = recentCheckIns.length
    ? recentCheckIns.map(c => `
      <div class="recent-row">
        <span class="recent-time">${c.time}</span>
        <span class="recent-name">${escapeHtml(c.name)}</span>
        <span class="recent-flight">${c.flightNum}</span>
      </div>`).join("")
    : `<p style="font-size:0.85rem; color:var(--muted);">No check-ins yet this session.</p>`;
}

function runCheckin(code) {
  showCheckinModal(validateBoardingPass(code, selectedCheckinFlight()));
  updateCheckinSummary();
  renderRecentCheckins();
}

function submitCheckinCode() {
  runCheckin(document.getElementById("checkinCode").value);
}

// Pick a random pass not checked in yet: ~70% from the selected flight, ~30% from another (to demo Wrong flight).
function simulateScan() {
  const flight = selectedCheckinFlight();
  const pending = checkinPassengers().filter(p => p.entry.boardingPass && !p.entry.checkedIn);
  if (!pending.length) {
    showCheckinModal({ status: "invalid", title: "No passes left", code: "", reason: "Every passenger with a boarding pass is already checked in." });
    return;
  }
  const mine = flight ? pending.filter(p => p.flightNums.includes(flight.num)) : [];
  const others = pending.filter(p => !mine.includes(p));
  const pool = mine.length && (!others.length || Math.random() < 0.7) ? mine : others;
  const code = pool[Math.floor(Math.random() * pool.length)].entry.boardingPass;
  document.getElementById("checkinCode").value = code;
  runCheckin(code);
}

function setCameraNote(text) {
  const note = document.getElementById("cameraNote");
  if (!note) return;
  note.textContent = text;
  note.hidden = !text;
}

async function toggleCamera() {
  if (cameraStream) {
    stopCamera();
    setCameraNote("");
    return;
  }
  const btn = document.getElementById("cameraBtn");
  const request = ++cameraRequest;
  btn.disabled = true;
  setCameraNote("Opening camera…");
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
  } catch (e) {
    if (request !== cameraRequest) return;
    btn.disabled = false;
    const denied = e && (e.name === "NotAllowedError" || e.name === "SecurityError");
    setCameraNote(denied
      ? "Camera permission denied — use Simulate Scan or paste the code."
      : "Couldn't open the camera — use Simulate Scan or paste the code.");
    return;
  }
  const video = document.getElementById("cameraVideo");
  // The user left the tab (or stopped) while the permission prompt was open.
  if (request !== cameraRequest || !video) {
    stream.getTracks().forEach(t => t.stop());
    return;
  }
  cameraStream = stream;
  video.srcObject = stream;
  video.hidden = false;
  video.play().catch(() => {});
  btn.disabled = false;
  btn.textContent = "Stop Camera";
  setCameraNote("Live QR decoding coming later — use Simulate or paste code");
}

function stopCamera() {
  cameraRequest++;
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  const video = document.getElementById("cameraVideo");
  if (video) {
    video.srcObject = null;
    video.hidden = true;
  }
  const btn = document.getElementById("cameraBtn");
  if (btn && navigator.mediaDevices?.getUserMedia) {
    btn.textContent = "Use Camera";
    btn.disabled = false;
  }
}

function goTo(page) {
  if (page !== currentPage) pageHistory = [...pageHistory, currentPage].slice(-20);
  currentPage = page;
  renderNav();
  render();
}

// Back to the previous page in this mode, or Home when there is nothing to go back to.
function goBack() {
  const pages = currentTabs().map(t => t.page);
  let page = null;
  while (pageHistory.length && !page) {
    const p = pageHistory.pop();
    if (pages.includes(p) && p !== currentPage) page = p;
  }
  currentPage = page || pages[0];
  renderNav();
  render();
}

// One delegated listener on the nav, so rebuilding its buttons never stacks handlers.
document.querySelector(".bottom-nav").addEventListener("click", e => {
  const btn = e.target.closest("button[data-page]");
  if (btn) goTo(btn.dataset.page);
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && document.getElementById("checkinModal")) closeCheckinModal(false);
});

document.querySelector(".role-switch").addEventListener("click", e => {
  const btn = e.target.closest("button[data-role]");
  if (btn) setRole(btn.dataset.role);
});

// Init
applyTextSize(getTextSize());
applySettings();
renderNav();
render();
