// Grant Aviation Live Tracker
// Uses OpenSky Network free ADS-B data for live positions
// Unofficial - for remote village users

const destinations = [
  { base: "Anchorage", communities: ["Kenai"] },
  { base: "Bethel Terminal 1", communities: ["Chevak", "Hooper Bay", "Scammon Bay", "Metarvik", "Nightmute", "Toksook Bay", "Tununak", "Mekoryuk", "Chefornak", "Kipnuk", "Kongiganak", "Kwigillingok", "Tuntutuliak", "Quinhagak", "Eek"] },
  { base: "Bethel Terminal 2", communities: ["Emmonak", "Kotlik", "Nunam Iqua", "Alakanuk", "Atmautluak", "Nunapitchuk", "Kasigluk", "Marshall", "Pilot Station", "St Mary’s", "Mountain Village", "Dillingham (seasonal)"] },
  { base: "Cold Bay", communities: ["King Cove", "False Pass", "Nelson Lagoon", "Port Moller"] },
  { base: "Dillingham", communities: ["Togiak", "Twin Hills", "Manakotak", "Clarks Point", "King Salmon", "Levelock", "New Stuyahok", "Ekwok", "Koliganek"] },
  { base: "Dutch Harbor / Unalaska", communities: ["Akun (then helicopter to Akutan)", "Atka", "Nikolski", "St. Paul Island", "St. George"] },
  { base: "Emmonak", communities: ["Bethel", "Kotlik", "Nunam Iqua", "Alakanuk"] },
  { base: "Kenai", communities: ["Anchorage"] },
  { base: "King Salmon", communities: ["Levelock", "South Naknek", "Egegik", "Igiugig", "Dillingham", "Pilot Point", "Ugashik", "Port Heiden", "Perryville", "Chignik Bay", "Chignik Lake", "Chignik Lagoon"] }
];

let map, markers = [], grantFlights = [];

function initMap() {
  map = L.map('map').setView([61.0, -150.0], 5); // Alaska overview
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
}

function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  if (tabId === 'tracker' && !map) initMap();
}

document.querySelectorAll('nav button').forEach(btn => {
  btn.addEventListener('click', () => showTab(btn.dataset.tab));
});

function renderDestinations() {
  const container = document.getElementById('destList');
  container.innerHTML = destinations.map(d => `
    <div class="dest-card">
      <h3>${d.base}</h3>
      <p>${d.communities.join(', ')}</p>
    </div>
  `).join('');
}

async function fetchLiveFlights() {
  const msg = document.getElementById('statusMessage');
  msg.textContent = 'Fetching live Grant Aviation planes from OpenSky...';
  try {
    // Bounding box for Alaska (approx)
    const url = 'https://opensky-network.org/api/states/all?lamin=51&lomin=-180&lamax=71&lomax=-130';
    const res = await fetch(url);
    if (!res.ok) throw new Error('API limit or error');
    const data = await res.json();
    const states = data.states || [];
    
    // Filter Grant Aviation: callsigns often GUN#### or GV####
    grantFlights = states.filter(s => {
      const callsign = (s[1] || '').trim().toUpperCase();
      return callsign.startsWith('GUN') || callsign.startsWith('GV');
    }).map(s => ({
      icao24: s[0],
      callsign: (s[1] || '').trim(),
      origin: s[2],
      lon: s[5],
      lat: s[6],
      altitude: s[7], // meters
      velocity: s[9], // m/s
      heading: s[10],
      onGround: s[8],
      verticalRate: s[11]
    }));

    updateMapAndList();
    msg.textContent = `Found ${grantFlights.length} live Grant Aviation flight(s). Data refreshes every few seconds in real use.`;
  } catch (e) {
    msg.textContent = 'Could not fetch live data (OpenSky rate limit or network). Try again in a moment. For production, add an API key or use AviationStack.';
    console.error(e);
    // Demo data fallback
    grantFlights = [{
      callsign: 'GUN5505 (demo)',
      lat: 60.5,
      lon: -151.0,
      altitude: 1500,
      velocity: 80,
      heading: 45,
      onGround: false
    }];
    updateMapAndList();
  }
}

function updateMapAndList() {
  // Clear old markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const list = document.getElementById('flightsList');
  if (grantFlights.length === 0) {
    list.innerHTML = '<p>No Grant Aviation planes currently tracked in the air over Alaska. Check back soon or search a specific flight.</p>';
    return;
  }

  list.innerHTML = grantFlights.map(f => {
    const status = f.onGround ? 'On Ground' : 'In Air';
    const altFt = f.altitude ? Math.round(f.altitude * 3.28084) : 'N/A';
    const speedKt = f.velocity ? Math.round(f.velocity * 1.94384) : 'N/A';
    return `
      <div class="flight-card">
        <h3>${f.callsign || 'Unknown'}</h3>
        <p class="${f.onGround ? 'status-ground' : 'status-live'}">${status}</p>
        <p>Altitude: ${altFt} ft • Speed: ${speedKt} kts • Heading: ${Math.round(f.heading || 0)}°</p>
        <p>Position: ${f.lat?.toFixed(3)}, ${f.lon?.toFixed(3)}</p>
      </div>
    `;
  }).join('');

  // Add markers
  grantFlights.forEach(f => {
    if (f.lat && f.lon) {
      const marker = L.marker([f.lat, f.lon]).addTo(map)
        .bindPopup(`<b>${f.callsign}</b><br>${f.onGround ? 'On Ground' : 'In Air'}<br>Alt: ${Math.round((f.altitude||0)*3.28084)} ft`);
      markers.push(marker);
    }
  });

  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.2));
  }
}

function searchFlight() {
  const query = document.getElementById('flightSearch').value.trim().toUpperCase();
  if (!query) return;
  const found = grantFlights.filter(f => f.callsign.includes(query));
  if (found.length) {
    grantFlights = found; // temporary filter
    updateMapAndList();
    document.getElementById('statusMessage').textContent = `Showing results for ${query}`;
  } else {
    document.getElementById('statusMessage').textContent = `No live plane matching ${query}. It may not be airborne or outside coverage.`;
  }
}

document.getElementById('searchBtn').addEventListener('click', searchFlight);
document.getElementById('refreshBtn').addEventListener('click', fetchLiveFlights);
document.getElementById('flightSearch').addEventListener('keypress', e => { if (e.key === 'Enter') searchFlight(); });

// Init
renderDestinations();
showTab('tracker');
fetchLiveFlights();

// Auto-refresh every 30s (OpenSky recommends not more frequent than 10s for unauth)
setInterval(fetchLiveFlights, 30000);

// PWA install prompt helper (optional)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
