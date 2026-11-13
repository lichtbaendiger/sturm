# Sturmsches Konoid – 3D-Demo (three.js)

Interaktive 3D-Visualisierung der **Astigmatismus-Bildzeichnung** eines Achsenpunktes:
ein Leuchtpunkt auf der optischen Achse strahlt durch eine runde, astigmatische
(torische) Sammellinse; hinter der Linse formt das Bündel über die Schar der
Fokalfiguren das **Sturmsche Konoid** und geht durch die **beiden Bildlinien**
(tangential näher und kürzer, sagittal weiter und länger) mit dem
**kleinsten Verwirrungskreis** dazwischen.

Live zum Ausprobieren: *(GitHub-Pages-URL nach dem Aktivieren hier eintragen)*

## Inhalt

| Datei | Zweck |
|---|---|
| `sturm-konoid.html` | komplette Anwendung (HTML, CSS, JavaScript in einer Datei) |
| `vendor/three.module.js` | three.js r169 – lokales Modul (Offline-Fallback) |
| `vendor/three-legacy.min.js` | älteres three.js als klassisches Skript (Fallback für Doppelklick ohne Server) |
| `frotzmaennchen.txt` | ASCII-Vorlage, die als HTML-Kommentar im Quelltext der Demo steckt |

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
