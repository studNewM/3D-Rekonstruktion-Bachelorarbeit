# 3D-Rekonstruktion-Bachelorarbeit

Willkommen beim GitHub-Repository von "3D-Rekonstruction-Bachelorarbeit". Dieses Projekt ermöglicht 3D-Rekonstruktionen mit Tools wie Meshroom, COLMAP und OpenMVS. Es ist wichtig zu beachten, dass dieses Projekt aktuell nur auf Windows-Systemen unterstützt wird.

## Voraussetzungen

- [Node.js](https://nodejs.org/en/download) >= 20.6
- Microsoft Visual C++ Redistributable Package 2015, 2017 and 2019 [Microsoft’s Support](https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads.)
- NVIDIA GPU mit CUDA (für Meshroom)

## Meshroom

Meshroom wird als primäres Rekonstruktionstool verwendet. Folgen Sie der offiziellen Installationsanleitung:

- Meshroom Installationsanleitung: [Meshroom Installation](https://meshroom-manual.readthedocs.io/en/bibtex1/install/install.html)
- Speichern Sie Meshroom unter `./3D-Rekonstruktion-Bachelorarbeit/src/tools`.

## Colmap/OpenMVS (Optional)

Für die Nutzung von Colmap und OpenMVS:

- Wenn bereits installiert, tragen Sie die Pfade in der `.env`-Datei ein.
- Für eine automatische Installation folgen Sie dem Setup-Prozess des Projekts.

## Installation des Projekts

Führen Sie die folgenden Schritte aus, um das Projekt einzurichten:

```bash
git clone https://github.com/studNewM/3D-Rekonstruktion-Bachelorarbeit.git
```

```bash
cd 3D-Rekonstruktion-Bachelorarbeit
```

```bash
mv ./src/.example.env ./src/.env
```

```bash
npm install
```

```bash
npm run start
```

Der Server ist nun unter http://localhost:3000 erreichbar.
