# AstroPulse

A React + TypeScript crew-health prototype with one React Three Fiber canvas, one Drei camera controller, and **two real imported GLBs**. All readings, assistant replies and voice interactions are clearly labeled demos.

## Run

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. `npm run build` type-checks and creates `dist/`; `npm run preview` serves that build. The app can be hosted as static files. No API keys or backend are required.

## Viewer behavior

- Suit on shows NASA’s astronaut. Suit off shows the separately prepared Z-Anatomy subset.
- A 240ms material transition swaps visibility without remounting the camera or canvas. Reduced motion makes the swap immediate.
- Selecting Cardiovascular, Respiratory, Skeletal, Muscular or Digestive highlights named meshes, opens Body, and reveals anatomy. Suit toggles keep the selection.
- Drag to orbit, scroll/pinch to zoom; labeled buttons also rotate, tilt, zoom and reset. Automatic rotation is opt-in and disabled under reduced motion. Reset restores the initial camera only.
- Body / AI Agent switches one persistent inspector. Model, selection, camera, conversation and draft are retained.
- Voice is a cancellable timer-driven simulation; no microphone permissions, recording, speech recognition, network AI, or live health data.
- Model downloads have loading, 30-second timeout, validation, asset-specific error and Retry states. WebGL failure is explained. No placeholder body shapes are rendered.

## Assets and preparation

The bundled astronaut is about **1.26 MB** and anatomy about **1.10 MB**, with eight anatomy meshes. The 130 MB source atlas is never downloaded by the browser. Anatomy loads only after it is requested, then stays available for later swaps.

[Sources, required attribution and license notes](public/models/ATTRIBUTION.md) are also available from the app footer. Original archive license and Zenodo metadata are preserved alongside the assets. Note the discrepancy: Zenodo metadata says CC BY 4.0, while the downloaded archive states CC BY-SA 2.1 Japan; this derivative retains the archive’s attribution and share-alike terms.

Reproduce the preparation with Blender (tested with 5.2.2 LTS):

1. Download [NASA Astronaut.glb](https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/astronaut/Astronaut.glb) and [Z-Anatomy.zip, record 4953712](https://zenodo.org/records/4953712/files/Z-Anatomy.zip?download=1) into a source directory.
2. Extract `Z-Anatomy.blend` from that archive into the same directory.
3. Run:

```sh
blender --background --factory-startup --python scripts/prepare_models.py -- /absolute/path/to/sources
```

The script disables embedded atlas scripts, retains only the selected structures, evaluates geometry, rotates upper-limb bones toward a T-pose, simplifies it, gives both models a common normalized height/center/ground, and exports `public/models/`. `preparation.json` records source/output SHA-256 hashes, original object names, face counts and transforms. Raw atlas and working files are not shipped. Anatomical proportions differ from the suit, and posing is approximate; this is a prototype model swap, not a registered digital twin.

Mesh/control mapping lives in `src/systems.ts`. Do not rename exported meshes without updating this mapping and validation. Selected structures use cyan and an x-ray highlight to remain visible through surrounding anatomy.

## Validation

```sh
npm run build
npm run lint
npx playwright install chromium  # once, if no Playwright browser is installed
npm test
```

Set `CHROMIUM_PATH=/path/to/chrome` to use an existing Chromium installation. Tests cover exact GLB contents and size budgets; camera, canvas and framing preservation; all system mappings; missing-asset retry; loading; keyboard selection; reduced motion; mobile overflow; assistant persistence; and voice cancellation. `scripts/preview.mjs` captures desktop/mobile review images to `/tmp` while the dev server is running on port 5177.

`DESIGN.md` records the visual and behavioral decisions. `premium-audit.json` records the static skill audit; it is not a substitute for the browser tests.
