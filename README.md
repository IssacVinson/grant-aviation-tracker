# Grant Aviation — Mobile Web Prototype

This is the iteration version of the Grant Aviation app. It runs as a mobile-first website (localhost or GitHub Pages) so we can design and test functionality quickly before wrapping it as a real native mobile app.

## Features in this prototype
- Mobile app UI with bottom navigation
- Book flights (local mock booking from real Grant routes)
- My Trips + Check-in
- Boarding pass with QR code
- Employee mode: post delays / weather holds, validate boarding passes
- Live map of Grant planes (OpenSky ADS-B)
- Grant-style colors (navy + crimson)

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
