# Verification — 2026-10-02

- `npm run build`: TypeScript and production build passed.
- `npm audit --omit=dev`: zero vulnerabilities. Full install audit was also clean after updating Sharp.
- Optimization exported a valid GLB and decoded it again with glTF Transform.
- Visually checked the textured model in both the development and production builds; no browser console errors or warnings were reported.
- Checked narrow phone (~375 CSS px), tablet (~769 CSS px), and desktop layouts. No horizontal overflow beyond the viewport at the measured phone/tablet widths.
- Verified navigation to About, Journey, and Work; camera composition adjusted to leave room for text on tablets.
- Verified avatar dialog, drag rotation, Escape dismissal, and focus returning to the launch button.
- Verified project placeholder dialog and Escape dismissal.
- Verified motion toggle changes its state and the page's motion setting.
- Model download points to the optimized local GLB. Production build includes model, decoder, fonts, and attribution.

Not exercised: a physical low-end phone, a browser without WebGL, a simulated failed model request, or a real OS reduced-motion setting. Fallback and reduced-motion code is present, but those environmental cases were not independently simulated. All career details remain placeholders. Nothing has been deployed.

## Reference-aligned revision

- Avatar and story text stay centered. Added matching display/body font families, corner metadata, inset frame, softened rendering, and static film grain.
- Calibrated eye patches against raycast surface/texture samples. Browser shader moves the pupils independently; there is no new facial skeleton or animated eye object in the GLB.
- Captured distinct left and right gaze states via accessible arrow-key controls. The head stays fixed. Pointer events and smoothed gaze updates were observed during browser checks.
- Verified the motion toggle, mobile hero at 338 CSS px with no horizontal overflow, and readable centered story overlay. Viewport reset afterward.
- Revised production build and TypeScript passed. No browser shader errors or warnings were reported. Temporary diagnostic logging removed.

The preview screenshot is `portfolio-preview.jpg`.
