# GENT-Vision

A browser scanner for the colour of GENT smart-packaging stickers. The sticker is a colorimetric indicator based on curcumin in a deep eutectic solvent (DES) and rice straw biomass, developed with UGM Technology. GENT-Vision reads the sticker through the camera, converts the colour to CIE Lab and reports the result.

[Bahasa Indonesia](README.id.md)

## What it does

- Camera capture inside a square stencil, and colour analysis in `src/core/colorimetry.ts` (sRGB to linear RGB, XYZ and CIE Lab).
- Two modes, retail and consumer, with storage recommendations following the FEFO principle (first expired, first out).
- A scan history kept in the browser (`localStorage`).
- A PDF report that embeds the captured photo.
- A product showcase landing section.

## Tech stack

React, TypeScript, Vite, Chart.js, `clsx` and `tailwind-merge`, Lucide icons, Oxlint. Deployed to GitHub Pages (`.github/workflows/deploy.yml`) and Vercel (`vercel.json`).

## Getting started

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Project structure

```
src/core/colorimetry.ts       colour space conversion
src/components/Scanner/       camera analysis, result card, scan history, FEFO recommendations
src/components/Hero/          product showcase
src/data/sampleData.ts        sample data
```
