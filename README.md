# Sturmsches Konoid – 3D-Demo (three.js)

Interaktive 3D-Visualisierung der **Astigmatismus-Bildzeichnung** eines Achsenpunktes:
ein Leuchtpunkt auf der optischen Achse strahlt durch eine runde, astigmatische
(torische) Sammellinse; hinter der Linse formt das Bündel über die Schar der
Fokalfiguren das **Sturmsche Konoid** und geht durch die **beiden Bildlinien**
(tangential näher und kürzer, sagittal weiter und länger) mit dem
**kleinsten Verwirrungskreis** dazwischen.

Live zum Ausprobieren: **<https://sturm.optikorakel.de/>** (Handy- und Desktop-tauglich)

![Vorschau: Sturmsches Konoid mit Leuchtpunkt, Objektkegel, Linse, zwei Bildlinien](vorschau.png)

## Inhalt

| Datei | Zweck |
|---|---|
| `index.html` | komplette Anwendung (HTML, CSS, JavaScript in einer Datei); three.js wird vom CDN geladen |
| `vorschau.png` | Vorschaubild 1200 × 630 (exakt 1,91:1) für Social-Media-Karten und diese README |
| `make-preview.mjs` | erzeugt `vorschau.png` aus derselben Optik (`node make-preview.mjs vorschau.png`) |

Eine eigene Kopie von three.js ist nicht im Repository. Wer ohne Internet arbeiten will, legt
`three.module.js` (aus `node_modules/three/build/`) neben `index.html` und ruft den Ordner über
einen lokalen Webserver auf – Browser verbieten es vom Dateisystem aus, lokale Module zu laden.

## Vorschaubild beim Teilen

Teilt jemand den Link, zeigen Facebook, LinkedIn, WhatsApp, X & Co. das Bild, das
über **Open-Graph-Meta-Tags** im Kopf von `index.html` angesprochen wird
(`og:image`, `og:title`, `og:description`, `og:url`, dazu `twitter:card`).
Wichtig:

* Crawler lesen diese Meta-Angaben – ein per CSS verstecktes `<img>` im Körper wird nicht ausgewertet.
* `og:image` und `og:url` brauchen eine **absolute, öffentlich erreichbare URL**; eingetragen ist
  `https://sturm.optikorakel.de/` mit dem Bild `https://sturm.optikorakel.de/vorschau.png`.
* Damit die Karte wirklich ein Bild zeigt, muss **beides auf dem Webspace liegen**: die Seite als
  `index.html` im Web-Root und daneben `vorschau.png`. Fehlt die Bilddatei, bleibt die Karte leer –
  die Meta-Tags allein reichen nicht.
* Karten rechnen mit etwa 1,91:1 – `vorschau.png` (1200 × 630) passt exakt. Wer lieber ein
  Bildschirmfoto der laufenden Demo zeigen will legt es ins Repo (z. B. 1920 × 1088), passt in
  den Meta-Tags `og:image`, `og:image:width/-height` und `twitter:image` die Datei samt Maß an,
  und schneidet es im Zweifel auf 1,91:1 zu.
* Für das Teilen des **Repo-Links** setzt GitHub ein eigenes Vorschaubild: *Settings → Social preview* → Bild hochladen.
* Prüfen lässt sich das nach dem Deploy mit dem Share-Debugger von Facebook oder dem Twitter/X Card Validator.


## Physik (paraxiales Dünnglas-Modell)

Dioptrien-Matrix der Linse `Φ = diag(ΦT , ΦS)` mit `ΦT > ΦS`, Objektweite `g`:

```
1/b = 1/f − 1/g          f = 1000/Φ[dpt]        (bT < bS)
Schnittfigur bei z:      ax = R·|1 − z/bT| ,  ay = R·|1 − z/bS|
z = bT  →  Bildlinie I   (vertikal, tangential)
z = bS  →  Bildlinie II  (horizontal, sagittal)
1/bK = ½(1/bT + 1/bS)  →  kleinster Verwirrungskreis, r = R·|1 − bK/bT|
```

Der Objektkegel ist geometrisch exakt, die Brechung paraxial — dadurch bleiben
beide Bildlinien scharf definiert, wie in der Lehrbuchzeichnung.

## Bedienung

* **Drehen:** linke Maustaste ziehen (bzw. 1 Finger)
* **Zoomen:** Mausrad (bzw. 2 Finger auseinander/zusammen)
* **Bereich verschieben:** rechte **oder** mittlere Maustaste gedrückt halten und ziehen, alternativ `Shift` + Ziehen (bzw. 2 Finger gemeinsam bewegen)
* **Tasten:** `H` Regler, `W` Messwerte, `Leertaste`/`P` Pause, `R` Licht-Neuaufbau, `F` Ansicht einpassen
* Regler: Brechkraft beider Meridiane, Objektweite, Linsenradius, Strahlenzahl, Photonentempo; Voreinstellungen; Umschalter für Konoidfläche, Fokalfiguren, Bildlinien, Bündel, Meridianebenen, Photonen, Schnittebene, Achse/Raster, Beschriftung, Auto-Drehung

Auf dem Handy werden die Regler und die Messwerte über die untere Knopfleiste
eingeklappt; auf dem Desktop bleibt die Seitenanordnung unverändert.

## Ausführen

1. **Im Browser (Standard):** `index.html` doppelklicken – three.js kommt vom CDN, dafür braucht es Internet.
2. **Lokal mit eigener three.js-Kopie:** `three.module.js` (aus `node_modules/three/build/`) neben
   `index.html` legen, Ordner servieren (`npx serve .`) und `http://localhost:3000/` öffnen.
3. **Online-Demo:** <https://sturm.optikorakel.de/>

## Veröffentlichen

Die Demo läuft auf `https://sturm.optikorakel.de/`. Für ein Update genügt das Hochladen von zwei
Dateien in den Web-Root:

1. `index.html` – die Anwendung selbst, unverändert unter diesem Namen
2. `vorschau.png` – daneben, damit geteilte Links ein Vorschaubild zeigen

three.js wird von dort aus direkt vom CDN geladen, ein eigener Ordner dafür ist nicht nötig.
Alternativ lässt sich das Repository auch als GitHub-Seite betreiben (*Settings → Pages*,
Branch `main`, Ordner `/ (root)`) – dann in den Meta-Tags die passende
`<benutzer>.github.io`-Adresse eintragen.

Nach dem Deploy die Karte testen: Share-Debugger (Facebook) bzw. Card Validator (X) – beide
cachen Vorschaubilder, im Zweifel einmal neu anfragen.
