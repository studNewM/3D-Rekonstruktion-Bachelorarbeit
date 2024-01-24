# 3D-Rekonstruktion-Bachelorarbeit

Willkommen beim GitHub-Repository von "3D-Rekonstruction-Bachelorarbeit". Dieses Projekt ermöglicht 3D-Rekonstruktionen mit Tools wie Meshroom, COLMAP und OpenMVS. Es ist wichtig zu beachten, dass dieses Projekt nur auf Linux- und Windows-Systemen unterstützt wird.

## Voraussetzungen

### NVIDIA CUDA

Stellen Sie sicher, dass CUDA installiert ist:

```bash
nvcc -V
```

Falls CUDA nicht installiert ist, besuchen Sie [NVIDIA CUDA Installation](https://docs.nvidia.com/cuda/) für die Installationsanleitung.

### Meshroom

Meshroom wird als primäres Rekonstruktionstool verwendet. Folgen Sie der offiziellen Installationsanleitung:

- Meshroom Installationsanleitung: [Meshroom Installation](https://meshroom-manual.readthedocs.io/en/bibtex1/install/install.html)
- Speichern Sie Meshroom unter `./3D-Rekonstruktion-Bachelorarbeit/src/tools` oder konfigurieren Sie den Pfad in der `.env`-Datei.

### Colmap/OpenMVS (Optional)

Für die Nutzung von Colmap und OpenMVS:

- Wenn bereits installiert, tragen Sie die Pfade in der `.env`-Datei ein.
- Für eine automatische Installation folgen Sie dem Setup-Prozess des Projekts.

## Installation des Projekts

Führen Sie die folgenden Schritte aus, um das Projekt einzurichten:

```bash
git clone https://github.com/studNewM/3D-Rekonstruktion-Bachelorarbeit.git
cd 3D-Rekonstruktion-Bachelorarbeit
npm i
```
