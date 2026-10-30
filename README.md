# RB Wheels – redesign

Volledige redesign van https://www.rbwheels.net (scootergarage, Alphen aan den Rijn).

## Inhoud
- `content/` – scrape van de huidige site (2026-10-30): `rbwheels.json` (alles per sectie) plus CSV's voor diensten, FAQ, openingstijden en afbeeldingen.

Achtergrond en bedrijfsgegevens staan in de SecondBrain: `Projects/RB Wheels/` en `Wiki/organizations/rb-wheels.md`.

## Redesign (statische site)
- `index.html`, `styles.css`, `script.js` – geen build-stap, geen framework.
- `assets/img/` – foto's van de huidige site in 750w en 1500w.
- Lokaal bekijken:

```bash
python3 -m http.server 4321
```

Daarna http://localhost:4321 openen.

Kortingsactie: de oude Squarespace-pop-up (10% korting in ruil voor een e-mailadres) is vervangen door een WhatsApp-variant. Een wegklikbare kaart verschijnt zodra de werkbon uit beeld is; "Gebruik de korting" vinkt in de werkbon "Ik gebruik de 10% websitekorting" aan en dat komt in het WhatsApp-bericht. Wegklikken of gebruiken wordt per browser onthouden (localStorage). Geldt niet bij "Scooter kopen". De klant moet nog bevestigen dat ze de korting zo willen geven.
