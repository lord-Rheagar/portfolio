# Migration to the actual reference frontend — 2026-10-02

Reference commit: c9a9fe373cde72c77ff7f2dabde17fb79dce89b3.
Read README.en.md sections Make It Yours, Assets & Media, Swapping the Character Model, plus NOTICE and model/eye setup conventions.

## Source fidelity

Content-normalized comparisons confirm these are identical to upstream (line endings ignored): styles.css, ui/Works.tsx, ui/NoiseOverlay.tsx, ui/LoadingScreen.tsx, scene/Env.tsx, data/focusPoints.ts, data/workDocs.ts, store.ts.
App.tsx keeps all layout/effect structure and constants; changes are personal copy, corner labels, English default. Resume.tsx keeps animation and entry rendering; replaces biography/social data and removes the personal ZOOOP logo branch. Scene.tsx adds only the Meshy eye material binding/update; original scroll interpolation, camera playback, focus, gaze, lighting and postprocessing are preserved.

## Asset differences

Own camera path fitted to Bodhi, not the author's baked trajectory. Own studio HDR instead of the unverified upstream HDR. Personal covers and work text replaced with the original fallback UI and clear placeholders. Font families unchanged, served locally with OFL notices.
Meshy eye surfaces are animated with a shader controlled by named eye nodes. No separate eyeball meshes or portable facial rig. Exact character motion is therefore not a frame-for-frame reproduction of the author asset.

## Verification

- TypeScript and production build pass. Vite warns about the original large WebGL/Markdown bundle.
- ESLint: zero errors; five warnings inherited from upstream dormant App controls and SocialIcons export.
- me.glb decoded successfully: 1,207,356 bytes; 1 camera; CameraAction and CharacterAction; all expected anchors and both eye controls; 351 finite samples spanning 350 frames at 24fps.
- Desktop: centered portrait and original hero; résumé camera closeup; film grain and autofocus; left/right pupil movement visually confirmed and saved.
- Works: pinned horizontal track reaches the last panel; project detail opens and Back closes it.
- Mobile: 390px viewport, 375px available page width (scrollbar), no horizontal overflow; original hero and résumé card layout rendered successfully. Screenshot saved.
- Browser: no runtime errors during checks; upstream Framer Motion static-container warning remains.
- Screenshots: reference-gaze-left.jpg, reference-gaze-right.jpg, reference-mobile.jpg, original-layout-preview.jpg.

Earlier preview source is preserved in ../archive/custom-preview/ and excluded from Git/build. Earlier docs/verification.md and preview screenshots describe the superseded custom version. No deployment performed.

## Superseded model note — 2026-10-03
The surface-eye adaptation above describes the pre-polish model. The current site uses actual Blender-authored eye meshes and no eye-painting shader. See ../assets/avatar/blender/README.md. Camera path, focus anchors, layout and postprocessing are preserved.
