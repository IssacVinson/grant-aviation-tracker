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

function airportOptions(selected) {
  return BOOK_AIRPORTS.map(a => `<option value="${a}"${a === selected ? " selected" : ""}>${a}</option>`).join("");
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
let selectedFlight = null;
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
  const tabs = currentTabs();
  let tab = tabs.find(t => t.page === currentPage);
  if (!tab) {
    tab = tabs[0];
    currentPage = tab.page;
    renderNav();
  }
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

function renderBook(el) {
  selectedFlight = null;
  el.innerHTML = `
    <h2>Book a Flight</h2>
    <div class="card">
      <label>From</label>
      <select id="from" onchange="updateFlightList()">${airportOptions(ROUTES[0].from)}</select>
      <label>To</label>
      <select id="to" onchange="updateFlightList()">${airportOptions(ROUTES[0].to)}</select>
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
  if (!from || !to || !listEl) return;

  if (from === to) {
    listEl.innerHTML = `<p style="color:var(--muted);">Choose a different destination.</p>`;
    selectedFlight = null;
    if (btn) { btn.disabled = true; btn.textContent = "Select a flight first"; }
    return;
  }

  const flights = getFlightsForRoute(from, to);
  listEl.innerHTML = `
    <label style="font-weight:600; display:block; margin-bottom:0.5rem;">Available Flights</label>
    ${flights.map((f, i) => `
      <div class="card" style="padding:0.75rem; margin-bottom:0.5rem; cursor:pointer; border:2px solid transparent;" onclick="selectFlight(${i})" id="flight-${i}">
        <strong>${f.num}</strong> &nbsp; ${f.dep} → ${f.arr} <span style="color:var(--muted);">(${f.dur})</span>
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
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const flights = getFlightsForRoute(from, to);
  selectedFlight = flights[index];

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

  const trip = {
    id: Date.now().toString(),
    from, to, date, pax,
    flightNum: selectedFlight.num,
    depTime: selectedFlight.dep,
    arrTime: selectedFlight.arr,
    duration: selectedFlight.dur,
    status: "Scheduled",
    checkedIn: false,
    boardingPass: null,
    passengerName: "Passenger " + Math.floor(Math.random()*100)
  };
  state.trips.push(trip);
  getManifestEntryForTrip(trip);
  saveData(state);
  alert("Booked! " + trip.flightNum + " on " + date + " at " + trip.depTime);
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
          <strong>${t.flightNum}</strong>
          <span class="status-badge status-${delay.type}">${delay.type.replace("-"," ")}</span>
        </div>
        <p>${t.from} → ${t.to}</p>
        <p style="font-size:0.85rem; color:var(--muted);">${eff.date} • ${eff.time}–${t.arrTime || ""} • ${t.pax} pax</p>
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
  if (typeof QRCode !== "undefined") {
    QRCode.toCanvas(document.getElementById("qr"), trip.boardingPass, { width: 180 }, function (err) {
      if (err) document.getElementById("qr").textContent = trip.boardingPass;
    });
  } else {
    document.getElementById("qr").textContent = trip.boardingPass;
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
        <input id="scanCode" placeholder="Enter or paste boarding code">
        <button class="btn btn-outline" onclick="scanPass()">Validate</button>
        <div id="scanResult"></div>
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
  return RUNS.filter(r => r.legs.some(l => l.from === base || l.to === base));
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
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem;">
      <span style="font-size:0.85rem;">${run.flightNum} · ${run.aircraft}</span>
      <span>${statusBadges(info)}</span>
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

function scanPass() {
  const code = document.getElementById("scanCode").value.trim();
  const res = document.getElementById("scanResult");
  let trip = code ? state.trips.find(t => t.boardingPass === code) : null;
  let flightNum = trip ? trip.flightNum : null;
  let entry = null;
  if (code) {
    for (const num of Object.keys(state.flightManifests)) {
      entry = state.flightManifests[num].find(p => p.boardingPass === code || (trip && p.tripId === trip.id));
      if (entry) {
        flightNum = num;
        break;
      }
    }
  }
  if (!trip && entry && entry.tripId) trip = state.trips.find(t => t.id === entry.tripId) || null;
  if (trip && !entry) entry = getManifestEntryForTrip(trip);

  if (trip || entry) {
    if (entry) {
      entry.checkedIn = true;
      entry.boardingPass = code;
    }
    if (trip) {
      trip.checkedIn = true;
      trip.boardingPass = code;
    }
    saveData(state);
    const name = trip ? trip.passengerName : entry.name;
    res.innerHTML = `<p style="color:var(--success); margin-top:0.5rem;">✓ Valid for ${flightNum} — ${name} (checked in)</p>`;
    if (document.getElementById("statusFlightSelect")?.value === flightNum) renderFlightStatus();
  } else {
    res.innerHTML = `<p style="color:var(--accent); margin-top:0.5rem;">✗ Not found or not checked in</p>`;
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

document.querySelector(".role-switch").addEventListener("click", e => {
  const btn = e.target.closest("button[data-role]");
  if (btn) setRole(btn.dataset.role);
});

// Keep the run map position current without wiping the live planes list.
setInterval(() => {
  if (state.employeeMode && currentPage === "runmap") renderRunProgress();
}, 60000);

// Init
renderNav();
render();
