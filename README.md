# Sturmsches Konoid – 3D-Demo (three.js)

Interaktive 3D-Visualisierung der **Astigmatismus-Bildzeichnung** eines Achsenpunktes:
ein Leuchtpunkt auf der optischen Achse strahlt durch eine runde, astigmatische
(torische) Sammellinse; hinter der Linse formt das Bündel über die Schar der
Fokalfiguren das **Sturmsche Konoid** und geht durch die **beiden Bildlinien**
(tangential näher und kürzer, sagittal weiter und länger) mit dem
**kleinsten Verwirrungskreis** dazwischen.

Live zum Ausprobieren: *(GitHub-Pages-URL nach dem Aktivieren hier eintragen)*

![Vorschau: Sturmsches Konoid mit Leuchtpunkt, Objektkegel, Linse, zwei Bildlinien](vorschau.png)

## Inhalt

| Datei | Zweck |
|---|---|
| `sturm-konoid.html` | komplette Anwendung (HTML, CSS, JavaScript in einer Datei) |
| `vorschau.png` | Vorschaubild 1200 × 630 (exakt 1,91:1) für Social-Media-Karten und diese README |
| `make-preview.mjs` | erzeugt `vorschau.png` aus derselben Optik (`node make-preview.mjs vorschau.png`) |
| `vendor/three.module.js` | three.js r169 – lokales Modul (Offline-Fallback) |
| `vendor/three-legacy.min.js` | älteres three.js als klassisches Skript (Fallback für Doppelklick ohne Server) |

## Vorschaubild beim Teilen

Teilt jemand den Link, zeigen Facebook, LinkedIn, WhatsApp, X & Co. das Bild, das
über **Open-Graph-Meta-Tags** im Kopf von `sturm-konoid.html` angesprochen wird
(`og:image`, `og:title`, `og:description`, `og:url`, dazu `twitter:card`).
Wichtig:

* Crawler lesen diese Meta-Angaben – ein per CSS verstecktes `<img>` im Körper wird nicht ausgewertet.
* `og:image` und `og:url` brauchen eine **absolute, öffentlich erreichbare URL**; aktuell auf GitHub-Pages eingetragen.
* Damit die Adresse existiert: Repo **öffentlich** stellen und *Settings → Pages* aktivieren (siehe unten).
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

* **Drehen:** linke Maustaste ziehen ( bzw. 1 Finger)
* **Zoomen:** Mausrad (bzw. 2 Finger auseinander/zusammen)
* **Bereich verschieben:** rechte **oder** mittlere Maustaste gedrückt halten und ziehen, alternativ `Shift` + Ziehen (bzw. 2 Finger gemeinsam bewegen)
* **Tasten:** `H` Regler, `W` Messwerte, `Leertaste`/`P` Pause, `R` Licht-Neuaufbau, `F` Ansicht einpassen
* Regler: Brechkraft beider Meridiane, Objektweite, Linsenradius, Strahlenzahl, Photonentempo; Voreinstellungen; Umschalter für Konoidfläche, Fokalfiguren, Bildlinien, Bündel, Meridianebenen, Photonen, Schnittebene, Achse/Raster, Beschriftung, Auto-Drehung

Auf dem Handy werden die Regler und die Messwerte über die untere Knopfleiste
eingeklappt; auf dem Desktop bleibt die Seitenanordnung unverändert.

## Ausführen

1. **Online (einfachster Weg):** `sturm-konoid.html` doppelklicken – three.js wird vom CDN geladen.
2. **Offline per Doppelklick:** `vendor/` neben die HTML-Datei legen (Notladung über das klassische Skript).
3. **Offline mit aktuellem three.js:** Ordner lokal servieren, z. B. `npx serve .` und dann `http://localhost:3000/sturm-konoid.html` öffnen.

## GitHub-Seiten aktivieren

Repository → *Settings* → *Pages* → Source **Deploy from a branch**, Branch `main` / `/ (root)` → Save.
Danach läuft die Demo unter `https://<benutzer>.github.io/<repository>/sturm-konoid.html`.
