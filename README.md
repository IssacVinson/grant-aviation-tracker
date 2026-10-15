# Grant Aviation Live Tracker

Unofficial Progressive Web App for tracking Grant Aviation flights in remote Alaska villages.

## Why this exists

In many remote villages served by Grant Aviation, there is no formal airport check-in. The plane lands on the runway and the pilot counts how many people board. Villagers with WiFi need a simple way to see when the plane is actually approaching so they can head to the airstrip at the right time.

## Features

- **Live flight tracking** using free OpenSky Network ADS-B data
- Shows current position, altitude, speed, and heading of Grant Aviation planes (callsigns starting with GUN or GV)
- Interactive map (Leaflet + OpenStreetMap)
- List of destinations and bases
- Mobile-first design, installable as PWA
- Works on any phone with a browser and WiFi

## Important Notes

- This is **unofficial** and not affiliated with Grant Aviation.
- Always confirm flight status with official agents: **888-359-4726** or res@flygrant.com
- OpenSky Network is free for non-commercial use. Rate limits apply (avoid polling more often than every 10 seconds).
- Coverage depends on ADS-B receivers; some remote areas may have limited tracking.
- For production use with more reliable data, consider AviationStack or FlightAware AeroAPI (paid tiers).

## Setup / Run

1. Open `index.html` in a modern browser, or
2. Serve the folder with any static server:
   ```bash
   python -m http.server 8000
   ```
3. Or deploy to GitHub Pages, Netlify, Vercel, etc.

## Live Tracking

The app fetches current aircraft states from:
`https://opensky-network.org/api/states/all` (filtered to Alaska bounding box)

It then filters for callsigns matching Grant Aviation (GUN / GV).

## License

MIT - feel free to improve for community use.

## Credits

- OpenSky Network for live ADS-B data
- Leaflet for maps
- Logo inspired by the traditional Emmonak owl mask gifted to Grant Aviation
