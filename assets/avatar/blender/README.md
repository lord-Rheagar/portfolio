# Bodhi model polish — 2026-10-03

Blender 4.5.9 LTS portable, downloaded from download.blender.org with official SHA256 verification. Stored locally under .tools/blender/ (ignored by Git). All geometry is based on Bodhi's own Meshy download.

## Deliverables

- bodhi-polished.blend: editable source with review camera and lights, original textures, material separation and actual eye meshes.
- bodhi-polished.glb: full-resolution character-only export.
- ../../../public/models/avatar-polished.glb: compressed web character, 737,480 bytes and 75,575 triangles.
- ../../../public/models/me.glb: complete animated website scene, 799,756 bytes.
- before-face.png / after-face.png / after-three-quarter.png / after-portrait.png: matching studio renders and final views.
- web-face.png / web-gaze-left.png / web-gaze-right.png: re-import of the optimized export in Blender; eye rotation verified at ±22 degrees.
- polish-report.json, web-export-report.json, gaze-verification.json, scene-verification.json: measurements and validation.

## What changed

Removed 509 foreground artifact faces inside the right lens while preserving the skin beneath and frame outline. Replaced 1,037 baked-eye faces with fitted sockets and two independent spherical eyeballs. Relaxed 6,238 cheek/neck vertices gently; preserved nose, moustache, lips, hairstyle and overall silhouette. Authored warm sclera, brown iris detail and small illustrated catchlights as vertex colors. Added material separation with softer hair/skin and matte cloth; reduced generated normal-map exaggeration.

The eyes are independent meshes named eye_L and eye_R with centered pivots and one material each. They work as regular GLB geometry without a custom surface shader. This is not full facial animation/retopology: no facial skeleton, blink shapes or lip animation were added. Some original AI surface/texture irregularity remains around fine hair and beard detail.

## Rebuild

From the workspace root in PowerShell:

    & '.tools/blender/blender-4.5.9-windows-x64/blender.exe' --background --python-exit-code 1 --python scripts/blender-polish.py -- 'C:/Users/bodhi/OneDrive/Documents/ChatGPT/resume'
    npm run optimize:polished
    npm run prepare:scene
    npm run build

The Blender script starts from avatar-original.glb every time. Manual edits to bodhi-polished.blend should be exported separately before rerunning the script. Web optimization locks mesh borders and preserves eye detail.

## Validation

Production build and TypeScript pass. Lint has zero errors and five existing upstream warnings. Re-imported the decoded optimized web model into Blender and rendered neutral/left/right gaze to verify geometry, materials and eye pivots. CameraAction input/output samples and focus-anchor translations are byte-for-byte numerically unchanged from the pre-polish scene. Local HTTP serves the new model successfully. Live browser visual inspection was not repeated during this polish pass; the prior browser tool policy block remains a limitation.

Original Meshy model and previous website model are preserved. License: CC BY 4.0, doctorbunip / Meshy; see ../ATTRIBUTION.md. The Blender cleanup and eye/material additions are adaptations of that asset.
