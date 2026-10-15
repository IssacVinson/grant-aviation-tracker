// Grant Aviation Mobile Web App (iteration prototype)
// Passenger + Employee modes. Mock data in localStorage for fast iteration.
// Live map via OpenSky. Later wrap in Capacitor/React Native for real mobile app.

const ROUTES = [
  { from: "Anchorage (ANC)", to: "Kenai (ENA)" },
  { from: "Kenai (ENA)", to: "Anchorage (ANC)" },
  { from: "Bethel (BET)", to: "Chevak (VAK)" },
  { from: "Bethel (BET)", to: "Hooper Bay (HPB)" },
  { from: "Bethel (BET)", to: "Emmonak (EMK)" },
  { from: "Bethel (BET)", to: "Kipnuk (KPN)" },
  { from: "Dillingham (DLG)", to: "Togiak (TOG)" },
  { from: "King Salmon (AKN)", to: "Dillingham (DLG)" },
  { from: "Dutch Harbor (DUT)", to: "Atka (AKB)" },
  { from: "Cold Bay (CDB)", to: "King Cove (KVC)" },
  { from: "Emmonak (EMK)", to: "Kotlik (KOT)" }
];

// Unique airport list for From/To selects: hubs first, then villages A–Z.
const HUB_ORDER = ["Anchorage (ANC)", "Kenai (ENA)", "Bethel (BET)", "Dillingham (DLG)", "King Salmon (AKN)", "Dutch Harbor (DUT)", "Cold Bay (CDB)", "Emmonak (EMK)"];
const BOOK_AIRPORTS = (() => {
  const all = new Set();
  ROUTES.forEach(r => { all.add(r.from); all.add(r.to); });
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
  ],
  "default": [
    { num: "GV2010", dep: "09:00", arr: "09:40", dur: "40m" },
    { num: "GV2030", dep: "12:00", arr: "12:40", dur: "40m" },
    { num: "GV2050", dep: "15:30", arr: "16:10", dur: "40m" }
  ]
};

// Mock legs used to build connecting itineraries: [num, from, to, dep, arr] (24h local).
// Kenai and the villages reach the hubs through Anchorage; villages reach Anchorage through their hub.
// Real direct routes in MOCK_FLIGHTS (except "default") and the PASSENGER_RUN_IDS runs are added on top.
const CONNECTION_FLIGHTS = [
  // Anchorage ↔ hubs
  ["GV3101", "ANC", "BET", "07:30", "09:00"], ["GV3103", "ANC", "BET", "11:00", "12:30"], ["GV3105", "ANC", "BET", "15:30", "17:00"],
  ["GV3102", "BET", "ANC", "09:45", "11:15"], ["GV3104", "BET", "ANC", "11:45", "13:15"], ["GV3106", "BET", "ANC", "17:00", "18:30"],
  ["GV3201", "ANC", "DLG", "07:30", "08:40"], ["GV3203", "ANC", "DLG", "11:00", "12:10"], ["GV3205", "ANC", "DLG", "16:00", "17:10"],
  ["GV3202", "DLG", "ANC", "09:20", "10:30"], ["GV3204", "DLG", "ANC", "11:00", "12:10"], ["GV3206", "DLG", "ANC", "18:00", "19:10"],
  ["GV3301", "ANC", "AKN", "08:00", "09:05"], ["GV3303", "ANC", "AKN", "14:00", "15:05"],
  ["GV3302", "AKN", "ANC", "10:00", "11:05"], ["GV3304", "AKN", "ANC", "16:00", "17:05"],
  ["GV3401", "ANC", "DUT", "07:30", "10:20"], ["GV3403", "ANC", "DUT", "13:00", "15:50"],
  ["GV3402", "DUT", "ANC", "10:00", "12:50"], ["GV3404", "DUT", "ANC", "16:45", "19:35"],
  ["GV3501", "ANC", "CDB", "08:00", "10:20"], ["GV3503", "ANC", "CDB", "13:30", "15:50"],
  ["GV3502", "CDB", "ANC", "11:00", "13:20"], ["GV3504", "CDB", "ANC", "16:30", "18:50"],
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

const AIRPORTS = {
  ANC: "Anchorage", ENA: "Kenai", BET: "Bethel", DLG: "Dillingham", AKN: "King Salmon",
  CDB: "Cold Bay", DUT: "Dutch Harbor", EMK: "Emmonak",
  TWA: "Twin Hills", TOG: "Togiak", KMO: "Manokotak", WKK: "Aleknagik",
  VAK: "Chevak", HPB: "Hooper Bay", KOT: "Kotlik", KPN: "Kipnuk", KWK: "Kwigillingok",
  OOK: "Toksook Bay", TNK: "Tununak", KKH: "Kongiganak",
  KLL: "Levelock", IGG: "Igiugig", KVC: "King Cove", KFP: "False Pass", AKB: "Atka",
  AUK: "Alakanuk", SXP: "Nunam Iqua", MOU: "Mountain Village", PQS: "Pilot Station"
};

// Approximate airport positions [lat, lon] for the employee run map (decimal degrees, west negative).
const AIRPORT_COORDS = {
  ANC: [61.174, -149.996], ENA: [60.573, -151.245], BET: [60.780, -161.838], DLG: [59.045, -158.505],
  AKN: [58.677, -156.649], CDB: [55.206, -162.725], DUT: [53.900, -166.544], EMK: [62.786, -164.491],
  TWA: [59.076, -160.273], TOG: [59.053, -160.397], KMO: [58.990, -159.050], WKK: [59.282, -158.618],
  VAK: [61.534, -165.584], HPB: [61.524, -166.147], KOT: [63.031, -163.533], KPN: [59.933, -164.031],
  KWK: [59.876, -163.169], OOK: [60.542, -165.087], TNK: [60.576, -165.272], KKH: [59.961, -162.881],
  KLL: [59.128, -156.859], IGG: [59.324, -155.902], KVC: [55.116, -162.266], KFP: [54.847, -163.410],
  AKB: [52.220, -174.206], AUK: [62.680, -164.660], SXP: [62.521, -164.848], MOU: [62.096, -163.682],
  PQS: [61.934, -162.900]
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
    legs: [["BET", "VAK", "08:30", "09:15"], ["VAK", "HPB", "09:35", "09:55"], ["HPB", "BET", "10:15", "11:05"]] },
  { id: "R-BET-2", flightNum: "GV311", aircraft: "Cessna 208 Caravan", base: "BET",
    legs: [["BET", "EMK", "10:15", "11:30"], ["EMK", "KOT", "11:50", "12:10"], ["KOT", "BET", "12:30", "13:45"]] },
  { id: "R-BET-3", flightNum: "GV321", aircraft: "Piper Navajo", base: "BET",
    legs: [["BET", "KPN", "12:00", "12:40"], ["KPN", "KWK", "13:00", "13:15"], ["KWK", "BET", "13:35", "14:10"]] },
  { id: "R-BET-4", flightNum: "GV331", aircraft: "Cessna 208 Caravan", base: "BET",
    legs: [["BET", "OOK", "15:00", "15:45"], ["OOK", "TNK", "16:05", "16:20"], ["TNK", "BET", "16:40", "17:30"]] },
  { id: "R-BET-5", flightNum: "GV341", aircraft: "Cessna 208 Caravan", base: "BET",
    legs: [["BET", "KKH", "20:30", "21:05"], ["KKH", "BET", "21:25", "22:00"]] },
  { id: "R-DLG-1", flightNum: "GV401", aircraft: "Cessna 208 Caravan", base: "DLG",
    legs: [["DLG", "TWA", "09:00", "09:30"], ["TWA", "TOG", "09:50", "10:05"], ["TOG", "DLG", "10:25", "11:00"]] },
  { id: "R-DLG-2", flightNum: "GV411", aircraft: "Piper Navajo", base: "DLG",
    legs: [["DLG", "KMO", "13:30", "13:50"], ["KMO", "WKK", "14:10", "14:30"], ["WKK", "DLG", "14:50", "15:05"]] },
  { id: "R-AKN-1", flightNum: "GV501", aircraft: "Cessna 208 Caravan", base: "AKN",
    legs: [["AKN", "KLL", "10:00", "10:30"], ["KLL", "IGG", "10:50", "11:20"], ["IGG", "AKN", "11:40", "12:30"]] },
  { id: "R-AKN-2", flightNum: "GV511", aircraft: "Piper Navajo", base: "AKN",
    legs: [["AKN", "DLG", "15:30", "16:10"], ["DLG", "AKN", "16:40", "17:20"]] },
  { id: "R-CDB-1", flightNum: "GV601", aircraft: "Cessna 208 Caravan", base: "CDB",
    legs: [["CDB", "KVC", "11:00", "11:20"], ["KVC", "KFP", "11:40", "12:10"], ["KFP", "CDB", "12:30", "13:00"]] },
  { id: "R-DUT-1", flightNum: "GV701", aircraft: "Piper Navajo", base: "DUT",
    legs: [["DUT", "AKB", "09:30", "11:15"], ["AKB", "DUT", "12:00", "13:45"]] },
  { id: "R-EMK-1", flightNum: "GV801", aircraft: "Cessna 208 Caravan", base: "EMK",
    legs: [["EMK", "AUK", "12:30", "12:45"], ["AUK", "SXP", "13:05", "13:20"], ["SXP", "EMK", "13:40", "14:00"]] },
  { id: "R-EMK-2", flightNum: "GV811", aircraft: "Cessna 208 Caravan", base: "EMK",
    legs: [["EMK", "MOU", "15:30", "15:55"], ["MOU", "PQS", "16:15", "16:35"], ["PQS", "EMK", "16:55", "17:35"]] }
];

const STORAGE_KEY = "grant-aviation-data-v3";

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
const RUNS = buildRuns();
let selectedMapRunId = null;

const NAV_TABS = {
  passenger: [
    { page: "home", label: "Home", render: renderHome },
    { page: "book", label: "Book", render: renderBook },
    { page: "trips", label: "Trips", render: renderTrips },
    { page: "map", label: "Map", render: renderMap },
    { page: "profile", label: "Profile", render: renderProfile }
  ],
  employee: [
    { page: "base", label: "Base", render: renderBase },
    { page: "runs", label: "Runs", render: renderRuns },
    { page: "runmap", label: "Map", render: renderRunMap },
    { page: "checkin", label: "Check-in", render: renderCheckin },
    { page: "tools", label: "Tools", render: renderTools }
  ]
};

let currentPage = currentTabs()[0].page;

function currentTabs() {
  return state.employeeMode ? NAV_TABS.employee : NAV_TABS.passenger;
}

function renderNav() {
  document.querySelector(".bottom-nav").innerHTML = currentTabs().map(t =>
    `<button data-page="${t.page}"${t.page === currentPage ? ' class="active"' : ""}>${t.label}</button>`
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
  const role = state.employeeMode ? "employee" : "passenger";
  document.querySelectorAll(".role-switch button").forEach(b => b.classList.toggle("active", b.dataset.role === role));
  tab.render(document.getElementById("content"));
}

function renderHome(el) {
  el.innerHTML = `
    <h2>Welcome to Grant</h2>
    <p style="color:var(--muted); margin-bottom:1rem;">Serving remote Alaska communities since 1971. No formal check-in in the villages — just show up when the plane is close.</p>
    <div class="card">
      <h3>Quick Book</h3>
      <p style="font-size:0.9rem; color:var(--muted);">Anchorage ↔ Kenai and dozens of villages across the Yukon-Kuskokwim Delta, Bristol Bay, and the Aleutians</p>
      <button class="btn" onclick="goTo('book')">Book a Flight</button>
    </div>
    <div class="card">
      <h3>Live Map</h3>
      <p style="font-size:0.9rem;">See where Grant planes are right now.</p>
      <button class="btn btn-outline" onclick="goTo('map')">Open Map</button>
    </div>
    ${state.trips.length ? `<div class="card"><h3>Upcoming</h3><p>${state.trips.length} trip(s) in My Trips</p></div>` : ""}
    <div class="note">This is a prototype for design & functionality iteration. Data is stored locally in your browser. Employee mode lets staff post delays and weather holds.</div>
  `;
}

function getFlightsForRoute(from, to) {
  const key = from + "-" + to;
  return MOCK_FLIGHTS[key] || MOCK_FLIGHTS["default"];
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
    if (key === "default") return;
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
function getItineraries(from, to) {
  const direct = MOCK_FLIGHTS[from + "-" + to];
  if (direct) {
    return direct.map(f => ({
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
    .sort((a, b) => depOf(a) - depOf(b) || a.totalMin - b.totalMin)
    .slice(0, MAX_ITINERARIES);
}

function connectionNote(c) {
  const city = AIRPORTS[airportCodeOf(c.at)] || c.at;
  return c.type === "stay"
    ? `Stay on plane in ${city} · ${c.layover}`
    : `Deplane in ${city} · ${c.layover} layover`;
}

function stopsText(it) {
  const n = it.connections.length;
  return `Total ~${fmtDuration(it.totalMin)} · ${n} stop${n === 1 ? "" : "s"}`;
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

function renderBook(el) {
  selectedFlight = null;
  el.innerHTML = `
    <h2>Book a Flight</h2>
    <div class="card">
      <label>From</label>
      <select id="from" onchange="updateFlightList()">${airportOptions("", "Select departure")}</select>
      <label>To</label>
      <select id="to" onchange="updateFlightList()">${airportOptions("", "Select destination")}</select>
      <label>Date</label>
      <input type="date" id="date" value="${new Date().toISOString().split("T")[0]}" onchange="updateFlightList()">
      <label>Passengers</label>
      <input type="number" id="pax" value="1" min="1" max="9">
      
      <div id="flightList" style="margin-top:1rem;"></div>
      
      <button class="btn" id="confirmBtn" onclick="bookFlight()" disabled>Select a flight first</button>
    </div>
    <p style="font-size:0.8rem; color:var(--muted);">Prototype booking — mock schedules only. No real booking while we are testing.</p>
  `;
  updateFlightList();
}

function updateFlightList() {
  const from = document.getElementById("from")?.value;
  const to = document.getElementById("to")?.value;
  const listEl = document.getElementById("flightList");
  const btn = document.getElementById("confirmBtn");
  if (!listEl) return;
  if (!from || !to) {
    listEl.innerHTML = `<p style="color:var(--muted);">Choose a departure and destination to see available flights.</p>`;
    selectedFlight = null;
    if (btn) { btn.disabled = true; btn.textContent = "Select a flight first"; }
    return;
  }

  if (from === to) {
    listEl.innerHTML = `<p style="color:var(--muted);">Choose a different destination.</p>`;
    selectedFlight = null;
    if (btn) { btn.disabled = true; btn.textContent = "Select a flight first"; }
    return;
  }

  bookItineraries = getItineraries(from, to);
  listEl.innerHTML = !bookItineraries.length
    ? `<p style="color:var(--muted);">No mock itinerary for this pair yet.</p>`
    : `
    <label style="font-weight:600; display:block; margin-bottom:0.5rem;">Available Flights</label>
    ${bookItineraries.map((it, i) => `
      <div class="card itin-card" onclick="selectFlight(${i})" id="flight-${i}">
        ${it.direct
          ? `<strong>${it.num}</strong> &nbsp; ${it.dep} → ${it.arr} <span style="color:var(--muted);">(${it.legs[0].dur})</span> <span class="itin-tag">Nonstop</span>`
          : `${itineraryLegsHtml(it.legs, it.connections)}<div class="itin-total">${stopsText(it)}</div>`}
      </div>
    `).join("")}
  `;
  selectedFlight = null;
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Select a flight first";
  }
}

function selectFlight(index) {
  selectedFlight = bookItineraries[index];
  if (!selectedFlight) return;

  document.querySelectorAll("[id^='flight-']").forEach(el => {
    el.style.borderColor = "transparent";
  });
  document.getElementById("flight-" + index).style.borderColor = "var(--accent)";

  const btn = document.getElementById("confirmBtn");
  btn.disabled = false;
  btn.textContent = "Confirm Booking — " + selectedFlight.num;
}

function bookFlight() {
  if (!selectedFlight) return alert("Please select a flight");
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const date = document.getElementById("date").value;
  const pax = document.getElementById("pax").value;

  const it = selectedFlight;
  // flightNum is the first leg so delays, manifests and the boarding pass key off the flight you board first.
  const trip = {
    id: Date.now().toString(),
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
    boardingPass: null,
    passengerName: "Passenger " + Math.floor(Math.random()*100)
  };
  state.trips.push(trip);
  getManifestEntryForTrip(trip);
  saveData(state);
  alert("Booked! " + it.num + " on " + date + " at " + trip.depTime);
  goTo("trips");
}

function renderTrips(el) {
  if (!state.trips.length) {
    el.innerHTML = `<h2>My Trips</h2><div class="card"><p>No trips yet.</p><button class="btn" onclick="goTo('book')">Book one</button></div>`;
    return;
  }
  el.innerHTML = `<h2>My Trips</h2>` + state.trips.map(t => {
    const delay = state.delays[t.flightNum] || { type: "on-time", message: "" };
    const eff = getEffectiveDep(t);
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${t.itineraryNum || t.flightNum}</strong>
          <span class="status-badge status-${delay.type}">${delay.type.replace("-"," ")}</span>
        </div>
        <p>${t.from} → ${t.to}</p>
        <p style="font-size:0.85rem; color:var(--muted);">${eff.date} • ${eff.time}–${t.arrTime || ""} • ${t.pax} pax</p>
        ${Array.isArray(t.legs) && t.legs.length > 1 ? `
          <div class="itin-trip">
            ${itineraryLegsHtml(t.legs, t.connections || [])}
            <div class="itin-total">Total ~${fmtDuration(t.totalMin)} · ${t.legs.length - 1} stop${t.legs.length === 2 ? "" : "s"}</div>
          </div>` : ""}
        ${eff.changed ? `<p style="font-size:0.75rem; color:var(--muted);">Originally: ${t.date} ${t.depTime || ""}</p>` : ""}
        ${delay.message ? `<p style="color:var(--warning); font-size:0.85rem;">${delay.message}</p>` : ""}
        ${!t.checkedIn 
          ? `<button class="btn" onclick="checkIn('${t.id}')">Check In</button>` 
          : `<button class="btn btn-outline" onclick="showPass('${t.id}')">Show Boarding Pass</button>`}
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
  showPass(id);
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

function showPass(id) {
  const trip = state.trips.find(t => t.id === id);
  if (!trip || !trip.boardingPass) return;
  const eff = getEffectiveDep(trip);
  const el = document.getElementById("content");
  el.innerHTML = `
    <h2>Boarding Pass</h2>
    <div class="card">
      <h3>${trip.flightNum}</h3>
      <p>${trip.from} → ${trip.to}</p>
      <p>${eff.date} • ${eff.time}</p>
      <p><strong>${trip.passengerName}</strong></p>
      <div class="qr-container" id="qr"></div>
      <p style="text-align:center; font-size:0.8rem; color:var(--muted);">${trip.boardingPass}</p>
      <button class="btn btn-outline" onclick="render()">Back to Trips</button>
    </div>
    <div class="note">Show this QR to the pilot or agent when boarding. In the real app this will be scannable by employees.</div>
  `;
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

function renderMap(el) {
  el.innerHTML = `
    <h2>Live Map</h2>
    <div class="card">
      <p style="font-size:0.85rem; color:var(--muted); margin-bottom:0.5rem;">Approximate positions of Grant Aviation aircraft (OpenSky ADS-B).</p>
      <div id="map" style="height:280px; background:var(--input-bg); border:1px solid var(--border); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--muted);">Loading map…</div>
      <div id="flightList" style="margin-top:0.75rem;"></div>
      <button class="btn btn-outline" onclick="loadMap()">Refresh</button>
    </div>
  `;
  loadMap();
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

function renderProfile(el) {
  el.innerHTML = `
    <h2>Profile</h2>
    <div class="card">
      <p>Passenger mode</p>
      <button class="btn" onclick="setRole('employee')">Switch to Employee (demo)</button>
    </div>
    <div class="card">
      <h3>About</h3>
      <p style="font-size:0.9rem;">Unofficial prototype for Grant Aviation. Destinations include Bethel hubs, Kenai, Dillingham, Dutch Harbor, Cold Bay, and dozens of villages across the Yukon-Kuskokwim Delta, Bristol Bay, and the Aleutians.</p>
      <p style="font-size:0.85rem; margin-top:0.5rem;">Phone: 888-359-4726</p>
    </div>
  `;
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
        <select id="delayFlightSelect" onchange="updateCurrentDep()">
          <option value="">Select a flight</option>
          ${getKnownFlights().map(f => `<option value="${f.num}">${flightOptionText(f)}</option>`).join("")}
        </select>
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

function renderRuns(el) {
  const base = state.employeeBase;
  const runs = runsForBase(base);
  el.innerHTML = `
    <h2>Runs · ${base}</h2>
    ${runs.length ? runs.map(runCardHtml).join("") : `<div class="card"><p>No runs touch ${airportLabel(base)} today.</p><button class="btn btn-outline" onclick="goTo('base')">Change base</button></div>`}
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
        ${runs.map(r => `<option value="${r.id}"${r.id === selectedMapRunId ? " selected" : ""}>${r.flightNum} · ${runStops(r).join("→")}</option>`).join("")}
      </select>
      ${fallback ? `<p style="font-size:0.8rem; color:var(--muted);">No runs touch ${base} today — showing all runs.</p>` : ""}
      <div id="runMapSvg" class="run-map"></div>
    </div>
    <div class="card">
      <div id="runProgress"></div>
    </div>
    <div class="card">
      <h3>Live Grant Planes</h3>
      <div id="liveMapArea"><button class="btn btn-outline" onclick="showLivePlanes()">Show live OpenSky list</button></div>
    </div>
  `;
  renderRunProgress();
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
  const out = document.getElementById("runProgress");
  const run = RUNS.find(r => r.id === selectedMapRunId);
  if (!out || !run) return;
  const info = runStatus(run);
  const legs = info.legs;
  const stops = runStops(run);
  const pct = runPosition(legs, info.now) * 100;
  const n = legs.length;
  const pos = runMapState(legs, info.now);
  const mapEl = document.getElementById("runMapSvg");
  if (mapEl) mapEl.innerHTML = runMapSvgHtml(run, info, pos);
  const leg = legs[pos.leg];
  const legText = l => `${l.from} → ${l.to}`;
  const stats = {
    pre: [["Next leg", legText(leg), "dep " + fmtMin(leg.adjDep)], ["ETA next stop", `${leg.to} ${fmtMin(leg.adjArr)}`]],
    air: [["Current leg", legText(leg), "Airborne"], ["ETA next stop", `${leg.to} ${fmtMin(leg.adjArr)}`]],
    ground: [["On ground", leg.from, `next ${legText(leg)} dep ${fmtMin(leg.adjDep)}`], ["ETA next stop", `${leg.to} ${fmtMin(leg.adjArr)}`]],
    done: [["Last leg", legText(leg), "Completed"], ["Arrived", `${leg.to} ${fmtMin(leg.adjArr)}`]]
  }[pos.phase];
  stats.push(["Complete", `${Math.round(pct)}%`], ["Updated", fmtMin(info.now)]);
  const stopRows = stops.map((code, i) => {
    const arr = i > 0 ? legs[i - 1].adjArr : null;
    const dep = i < n ? legs[i].adjDep : null;
    const passed = i < n ? info.now >= dep : info.now >= arr;
    return `
      <div style="font-size:0.85rem; padding:0.4rem 0; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; gap:0.5rem;">
        <span><span style="display:inline-block; width:1.2rem; color:var(--success); font-weight:700;">${passed ? "✓" : ""}</span>${airportLabel(code)}</span>
        <span style="color:var(--muted); text-align:right;">${arr !== null ? "arr " + fmtMin(arr) : ""}${arr !== null && dep !== null ? " · " : ""}${dep !== null ? "dep " + fmtMin(dep) : ""}</span>
      </div>`;
  }).join("");
  out.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
      <span style="font-size:0.85rem;"><strong>${run.flightNum}</strong> · ${run.aircraft}</span>
      <span>${statusBadges(info)}</span>
    </div>
    <div class="rm-stats">
      ${stats.map(([label, value, sub]) => `
        <div><span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ""}</div>`).join("")}
    </div>
    <div style="position:relative; height:12px; margin:1.25rem 0.5rem 0.25rem; border-radius:6px; overflow:visible; background:var(--accent);">
      <div style="position:absolute; left:0; top:0; bottom:0; width:${pct}%; background:var(--success); border-radius:6px 0 0 6px;"></div>
      ${stops.map((_, i) => `<div style="position:absolute; left:${(i / n) * 100}%; top:-3px; width:2px; height:18px; margin-left:-1px; background:var(--muted);"></div>`).join("")}
      <div style="position:absolute; left:${pct}%; top:50%; width:18px; height:18px; margin:-9px 0 0 -9px; border-radius:50%; background:var(--text); border:3px solid var(--bg); box-shadow:0 0 0 1px var(--muted), 0 1px 3px rgba(0,0,0,0.6);"></div>
    </div>
    <div style="position:relative; height:1.2rem; margin:0 0.5rem 0.75rem; font-size:0.7rem; color:var(--muted);">
      ${stops.map((code, i) => `<span style="position:absolute; left:${(i / n) * 100}%; transform:translateX(${i === 0 ? "0" : i === n ? "-100%" : "-50%"});">${code}</span>`).join("")}
    </div>
    ${stopRows}
  `;
}

// ---------- Run map (inline SVG) ----------

const RUN_MAP_W = 400;
const RUN_MAP_H = 300;
let runMapTimer = null;

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

function runMapSvgHtml(run, info, pos) {
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
  // Greedy label placement: try above, below, then further out, skipping spots that overlap placed labels.
  const placed = [];
  const overlaps = r => placed.some(p => r.x < p.x + p.w && p.x < r.x + r.w && r.y < p.y + p.h && p.y < r.y + r.h);
  let stopsSvg = "";
  [...byCode.values()].forEach(st => {
    const text = `${st.code} ${st.times.join(" / ")}`;
    const w = text.length * 5.8 + 4;
    const lx = Math.min(Math.max(st.pt[0], w / 2 + 4), W - w / 2 - 4);
    const tries = [-11, 20, -25, 34].map(dy => ({ x: lx - w / 2, y: st.pt[1] + dy - 10, w, h: 13, dy }));
    const spot = tries.find(r => r.y > 2 && r.y + r.h < H - 2 && !overlaps(r)) || tries[0];
    placed.push(spot);
    stopsSvg += `<circle class="${st.passed ? "rm-stop-done" : "rm-stop"}" cx="${st.pt[0].toFixed(1)}" cy="${st.pt[1].toFixed(1)}" r="${st.code === stops[0] ? 6 : 5}"/>
      <text class="rm-label" x="${lx.toFixed(1)}" y="${(st.pt[1] + spot.dy).toFixed(1)}" text-anchor="middle"><tspan class="rm-code">${st.code}</tspan> <tspan class="${st.delayed ? "rm-time-late" : "rm-time"}">${st.times.join(" / ")}</tspan></text>`;
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
  const where = { pre: `at ${stops[0]}, departs ${fmtMin(legs[0].adjDep)}`, air: `airborne ${legs[pos.leg].from} to ${legs[pos.leg].to}`,
    ground: `on the ground at ${legs[pos.leg].from}`, done: `completed at ${stops[stops.length - 1]}` }[pos.phase];
  const region = MAP_REGIONS[run.base] || "Alaska";

  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${run.flightNum} route ${stops.join(" to ")}; plane ${where}">
      <defs>
        <filter id="rmGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="${W}" height="${H}" fill="#0f1620"/>
      <g class="rm-grid">${grid}</g>
      <text class="rm-region" x="${W - 8}" y="18" text-anchor="end">${region.toUpperCase()} · AK</text>
      <text class="rm-north" x="${W - 14}" y="38" text-anchor="middle">N</text>
      <path class="rm-north-arrow" d="M${W - 14} 42 l-4 9 l4 -2.5 l4 2.5 Z"/>
      <path class="rm-ahead" d="${ahead}"/>
      <path class="rm-flown" d="${behind}" filter="url(#rmGlow)"/>
      ${stopsSvg}
      ${plane}
    </svg>
    ${pos.phase === "done" ? `<div class="rm-banner">Completed</div>` : ""}`;
}

// Refresh the run map every 30s only while the employee Map tab is showing; called from render().
function syncRunMapTimer() {
  const active = state.employeeMode && currentPage === "runmap";
  if (active && !runMapTimer) {
    runMapTimer = setInterval(renderRunProgress, 30000);
  } else if (!active && runMapTimer) {
    clearInterval(runMapTimer);
    runMapTimer = null;
  }
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
    const route = key === "default" ? "Other routes" : key.split("-").join(" → ");
    MOCK_FLIGHTS[key].forEach(f => {
      if (!byNum.has(f.num)) byNum.set(f.num, { num: f.num, route, dep: f.dep });
    });
  });
  state.trips.forEach(t => {
    if (!t.flightNum || byNum.has(t.flightNum)) return;
    byNum.set(t.flightNum, { num: t.flightNum, route: `${t.from} → ${t.to}`, dep: t.depTime || "" });
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
    if (key === "default") return;
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
  currentPage = page;
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
renderNav();
render();
