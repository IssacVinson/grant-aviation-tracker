# Grant Aviation — Mobile Web Prototype

This is the iteration version of the Grant Aviation app. It runs as a mobile-first website (localhost or GitHub Pages) so we can design and test functionality quickly before wrapping it as a real native mobile app.

## Features in this prototype
- Mobile app UI with bottom navigation (icons always with text labels)
- Senior-friendly passenger side: 18px base text, 48px+ tap targets, high contrast, plain-language labels, big Back/Home buttons, clear confirmations, and a "Need help? Call Grant Aviation" button on every passenger page (mock number)
- Home: "My next flight" card with a countdown to departure
- Profile: Text size setting (Normal / Large / Extra large), saved in localStorage
- Book flights (local mock booking); open seating, no seat selection. Grant routes and employee runs follow Grant's official route list only (`GRANT_ROUTES` in app.js, airport → nonstop destinations, per direction: Anchorage–Kenai plus the Bethel, Emmonak, Cold Bay, Dillingham, Dutch Harbor and King Salmon areas, including village-to-village hops; Bethel–Dillingham is seasonal). Every leg of every flight and multi-stop run is a pair in that list. Mock times are generated for routes without hand-written ones
- Partner airlines: Grant doesn't fly Anchorage to its other hubs, so `PARTNER_ROUTES` lists Alaska Airlines and Ravn Alaska legs. Trips that need one show as numbered parts; partner parts link to the airline's own site (no partner times in the app), and Grant parts after a partner flight only show flights from midday
- My Trips + Check-in with plain status words (On time, Delayed, Boarding, Boarded, Departed, Arrived)
- Boarding pass with QR code
- Employee mode: post delays / weather holds, validate boarding passes
- Route map with stop labels that never cover the plane; live list of Grant planes (OpenSky ADS-B)
- Black theme with Grant crimson (#C41E3A) accents; 24-hour times throughout

## How to run
Open `index.html` or serve the folder:
```bash
python -m http.server 8000
```
Then open http://localhost:8000

## Next steps
- Refine design based on feedback
- Add real booking/check-in integration when available
- Camera-based QR scanning for employees
- Wrap with Capacitor or convert to React Native / Flutter for App Store / Play Store

Data is stored in the browser's localStorage for easy testing.
