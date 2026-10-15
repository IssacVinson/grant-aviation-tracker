// Grant Aviation Mobile Web App (iteration prototype)
// Passenger + Employee modes. Mock data in localStorage for fast iteration.
// Live map via OpenSky. Later wrap in Capacitor/React Native for real mobile app.

const ROUTES = [
  { from: "Anchorage (ANC)", to: "Kenai (ENA)", flight: "GV55xx" },
  { from: "Bethel (BET)", to: "Chevak (VAK)", flight: "GV29xx" },
  { from: "Bethel (BET)", to: "Hooper Bay (HPB)", flight: "GV29xx" },
  { from: "Bethel (BET)", to: "Emmonak (EMK)", flight: "GV16xx" },
  { from: "Bethel (BET)", to: "Kipnuk (KPN)", flight: "GV24xx" },
  { from: "Dillingham (DLG)", to: "Togiak (TOG)", flight: "GV44xx" },
  { from: "King Salmon (AKN)", to: "Dillingham (DLG)", flight: "GV37xx" },
  { from: "Dutch Harbor (DUT)", to: "Atka (AKB)", flight: "GV81xx" },
  { from: "Cold Bay (CDB)", to: "King Cove (KVC)", flight: "GV71xx" },
  { from: "Emmonak (EMK)", to: "Kotlik (KOT)", flight: "GV12xx" }
];

const STORAGE_KEY = "grant-aviation-data";

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { trips: [], employeeMode: false, delays: {} };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let state = loadData();

function render() {
  const page = document.querySelector(".bottom-nav button.active")?.dataset.page || "home";
  const content = document.getElementById("content");
  const roleToggle = document.getElementById("roleToggle");
  roleToggle.textContent = state.employeeMode ? "Employee" : "Passenger";

  if (page === "home") renderHome(content);
  else if (page === "book") renderBook(content);
  else if (page === "trips") renderTrips(content);
  else if (page === "map") renderMap(content);
  else if (page === "profile") renderProfile(content);
}

function renderHome(el) {
  el.innerHTML = `
    <h2>Welcome to Grant</h2>
    <p style="color:var(--muted); margin-bottom:1rem;">Serving remote Alaska communities since 1971. No formal check-in in the villages — just show up when the plane is close.</p>
    <div class="card">
      <h3>Quick Book</h3>
      <p style="font-size:0.9rem; color:var(--muted);">Anchorage ↔ Kenai and 100+ villages</p>
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

function renderBook(el) {
  el.innerHTML = `
    <h2>Book a Flight</h2>
    <div class="card">
      <label>From</label>
      <select id="from">${ROUTES.map(r => `<option>${r.from}</option>`).join("")}</select>
      <label>To</label>
      <select id="to">${ROUTES.map(r => `<option>${r.to}</option>`).join("")}</select>
      <label>Date</label>
      <input type="date" id="date" value="${new Date().toISOString().split("T")[0]}">
      <label>Passengers</label>
      <input type="number" id="pax" value="1" min="1" max="9">
      <button class="btn" onclick="bookFlight()">Confirm Booking</button>
    </div>
    <p style="font-size:0.8rem; color:var(--muted);">Prototype booking — creates a local trip you can check in for. Real booking will connect to Grant's system later.</p>
  `;
}

function bookFlight() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const date = document.getElementById("date").value;
  const pax = document.getElementById("pax").value;
  const flightNum = "GV" + Math.floor(1000 + Math.random() * 9000);
  const trip = {
    id: Date.now().toString(),
    from, to, date, pax, flightNum,
    status: "Scheduled",
    checkedIn: false,
    boardingPass: null,
    passengerName: "Passenger " + Math.floor(Math.random()*100)
  };
  state.trips.push(trip);
  saveData(state);
  alert("Booked! Flight " + flightNum + " on " + date);
  goTo("trips");
}

function renderTrips(el) {
  if (!state.trips.length) {
    el.innerHTML = `<h2>My Trips</h2><div class="card"><p>No trips yet.</p><button class="btn" onclick="goTo('book')">Book one</button></div>`;
    return;
  }
  el.innerHTML = `<h2>My Trips</h2>` + state.trips.map(t => {
    const delay = state.delays[t.flightNum] || { type: "on-time", message: "" };
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${t.flightNum}</strong>
          <span class="status-badge status-${delay.type}">${delay.type.replace("-"," ")}</span>
        </div>
        <p>${t.from} → ${t.to}</p>
        <p style="font-size:0.85rem; color:var(--muted);">${t.date} • ${t.pax} pax</p>
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
  saveData(state);
  showPass(id);
}

function showPass(id) {
  const trip = state.trips.find(t => t.id === id);
  if (!trip || !trip.boardingPass) return;
  const el = document.getElementById("content");
  el.innerHTML = `
    <h2>Boarding Pass</h2>
    <div class="card">
      <h3>${trip.flightNum}</h3>
      <p>${trip.from} → ${trip.to}</p>
      <p>${trip.date}</p>
      <p><strong>${trip.passengerName}</strong></p>
      <div class="qr-container" id="qr"></div>
      <p style="text-align:center; font-size:0.8rem; color:var(--muted);">${trip.boardingPass}</p>
      <button class="btn btn-outline" onclick="render()">Back to Trips</button>
    </div>
    <div class="note">Show this QR to the pilot or agent when boarding. In the real app this will be scannable by employees.</div>
  `;
  QRCode.toCanvas(document.getElementById("qr"), trip.boardingPass, { width: 180 }, function (err) {
    if (err) document.getElementById("qr").textContent = trip.boardingPass;
  });
}

function renderMap(el) {
  el.innerHTML = `
    <h2>Live Map</h2>
    <div class="card">
      <p style="font-size:0.85rem; color:var(--muted); margin-bottom:0.5rem;">Approximate positions of Grant Aviation aircraft (OpenSky ADS-B).</p>
      <div id="map" style="height:280px; background:#e4e7ec; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--muted);">Loading map…</div>
      <div id="flightList" style="margin-top:0.75rem;"></div>
      <button class="btn btn-outline" onclick="loadMap()">Refresh</button>
    </div>
  `;
  loadMap();
}

async function loadMap() {
  const list = document.getElementById("flightList");
  const mapEl = document.getElementById("map");
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
      return `<div style="font-size:0.85rem; padding:0.4rem 0; border-bottom:1px solid #eee;">${cs} • ${alt} ft • ${lat?.toFixed(2)}, ${lon?.toFixed(2)}</div>`;
    }).join("");
  } catch (e) {
    mapEl.innerHTML = "Map data unavailable (rate limit or offline).";
  }
}

function renderProfile(el) {
  if (state.employeeMode) {
    el.innerHTML = `
      <h2>Employee Tools</h2>
      <div class="card">
        <h3>Post Delay / Weather Hold</h3>
        <input id="flightNum" placeholder="Flight # e.g. GV5505">
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
      <button class="btn btn-outline" onclick="toggleRole()">Switch to Passenger</button>
    `;
  } else {
    el.innerHTML = `
      <h2>Profile</h2>
      <div class="card">
        <p>Passenger mode</p>
        <button class="btn" onclick="toggleRole()">Switch to Employee (demo)</button>
      </div>
      <div class="card">
        <h3>About</h3>
        <p style="font-size:0.9rem;">Unofficial prototype for Grant Aviation. Destinations include Bethel hubs, Kenai, Dillingham, Dutch Harbor, Cold Bay, and dozens of villages.</p>
        <p style="font-size:0.85rem; margin-top:0.5rem;">Phone: 888-359-4726</p>
      </div>
    `;
  }
}

function toggleRole() {
  state.employeeMode = !state.employeeMode;
  saveData(state);
  render();
}

function postDelay() {
  const num = document.getElementById("flightNum").value.trim().toUpperCase();
  const type = document.getElementById("delayType").value;
  const msg = document.getElementById("delayMsg").value;
  if (!num) return alert("Enter a flight number");
  state.delays[num] = { type, message: msg };
  saveData(state);
  alert("Update posted for " + num);
}

function scanPass() {
  const code = document.getElementById("scanCode").value.trim();
  const trip = state.trips.find(t => t.boardingPass === code);
  const res = document.getElementById("scanResult");
  if (trip) {
    res.innerHTML = `<p style="color:var(--success); margin-top:0.5rem;">✓ Valid for ${trip.flightNum} — ${trip.passengerName}</p>`;
  } else {
    res.innerHTML = `<p style="color:var(--crimson); margin-top:0.5rem;">✗ Not found or not checked in</p>`;
  }
}

function goTo(page) {
  document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.remove("active"));
  document.querySelector(`[data-page="${page}"]`).classList.add("active");
  render();
}

document.querySelectorAll(".bottom-nav button").forEach(btn => {
  btn.addEventListener("click", () => goTo(btn.dataset.page));
});

document.getElementById("roleToggle").addEventListener("click", toggleRole);

// Init
render();
