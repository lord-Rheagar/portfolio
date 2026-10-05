# Bodhi's avatar

Approved on 2026-10-02: swept black hair, clear glasses, beard and curled mustache, expressive eyes, long neck, green embroidered shirt. Concept images were generated using the user's supplied photos.

## Files
- approved-concept.png: approved two-view raster concept, not a 3D model.
- meshy-input-front.png: single front view used for generation.
- avatar-original.glb: unchanged downloaded Meshy model.
- model-inspection.json: original GLB structure.
- optimization-report.json: measured optimization and connectivity results.
- ../../public/models/avatar.glb: optimized website model.
- ATTRIBUTION.md: model credit and license.

## Generation
User authorized Meshy 6 Lite, free credits, and CC BY 4.0. Geometry task: 01a0fd40-023d-726b-8228-e893dccba8a7. Texture task: 01a0fd42-e95e-7639-9b65-bf654c5de37b. Used 10 credits for geometry and 10 for textures. No paid plan purchased. Creator account: doctorbunip.

## Optimization
Run npm run optimize:avatar from the project root to reproduce the web copy. Original: 13,740,524 bytes, 260,728 triangles. Web copy: 1,147,776 bytes, 73,003 triangles. Approximately 91.6% smaller. Textures are 2048px WebP; geometry uses Meshopt compression. The script validates the exported file by decoding it again. The web copy was visually checked in the browser.

## Current polished version

The site now uses the Blender-polished model described in blender/README.md. Editable source: blender/bodhi-polished.blend. It has actual eye_L / eye_R meshes, cleaned lens geometry and softer materials. The former surface-eye shader has been removed. Previous model and scene code are preserved in pre-polish/.

Rebuild via the Blender polish script, npm run optimize:polished, then npm run prepare:scene. Camera path and focus anchors remain unchanged. A complete facial rig and blinking are not included.
