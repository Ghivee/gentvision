# GENT-Vision

GENT-Vision is a browser-based scanner for the color of GENT smart-packaging stickers, a colorimetric freshness indicator developed with UGM Technology from curcumin in a deep eutectic solvent (DES) and rice straw biomass. The sticker's color visibly shifts as the food it is attached to ages; GENT-Vision reads that shift with a phone camera and converts it into a number instead of asking a retail worker or a shopper to eyeball a color chart and guess.

[Baca dalam Bahasa Indonesia di bawah](#bahasa-indonesia)

## What it does

- **Camera-based capture** through a square on-screen stencil that lines the sticker up consistently, and color analysis in `src/core/colorimetry.ts`: sRGB is converted to linear RGB, then to CIE XYZ, then to CIE Lab, a color space chosen specifically because it is closer to how the human eye actually perceives differences in hue than raw RGB is.
- **Two modes**, retail and consumer, since a retailer managing shelf stock needs different information than someone deciding whether to eat a single package right now; each produces storage recommendations that follow the FEFO principle (first expired, first out).
- **Scan history** kept in the browser (`localStorage`), so a run of readings over time can be reviewed rather than only the most recent one.
- **A PDF report** that embeds the actual captured photo alongside the reading, so a result can be shared or filed with visual evidence, not just a number.
- **A product showcase** landing section introducing the sticker technology itself.

## Tech stack

React, TypeScript, Vite, Chart.js for the result and history charts, `clsx` and `tailwind-merge` for conditional Tailwind class composition, Lucide icons, Oxlint for linting. Deployed to both GitHub Pages (`.github/workflows/deploy.yml`) and Vercel (`vercel.json`).

## Getting started

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Project structure

```
src/core/colorimetry.ts       the color space conversion math (sRGB -> linear -> XYZ -> Lab)
src/components/Scanner/       camera capture and analysis, the result card, scan history, FEFO recommendations
src/components/Hero/          the product showcase section
src/data/sampleData.ts        sample data used where a real scan has not happened yet
```

---

## Bahasa Indonesia

GENT-Vision adalah pemindai warna berbasis peramban untuk stiker kemasan pintar GENT, indikator kesegaran kolorimetri yang dikembangkan bersama UGM Technology dari kurkumin dalam pelarut eutektik dalam (DES) dan biomassa jerami padi. Warna stiker berubah secara kasat mata seiring makanan yang ditempelinya menua; GENT-Vision membaca perubahan itu lewat kamera HP dan mengubahnya menjadi angka, bukan meminta pekerja ritel atau pembeli menebak warna dari kartu warna dengan mata.

### Fungsi

- **Pengambilan gambar lewat kamera** melalui stensil persegi di layar yang menyejajarkan stiker secara konsisten, dan analisis warna di `src/core/colorimetry.ts`: sRGB diubah ke RGB linear, lalu ke CIE XYZ, lalu ke CIE Lab, ruang warna yang dipilih khusus karena lebih mendekati cara mata manusia sungguhan memersepsikan perbedaan hue dibanding RGB mentah.
- **Dua mode**, retail dan konsumen, karena peritel yang mengelola stok rak butuh informasi berbeda dari pembeli yang memutuskan apakah akan makan satu kemasan sekarang; masing-masing menghasilkan rekomendasi penyimpanan yang mengikuti prinsip FEFO (yang kedaluwarsa lebih dulu keluar lebih dulu).
- **Riwayat pemindaian** tersimpan di peramban (`localStorage`), sehingga rangkaian pembacaan dari waktu ke waktu bisa ditinjau, bukan hanya yang terakhir.
- **Laporan PDF** yang menyertakan foto hasil tangkapan di samping hasil pembacaannya, sehingga hasil bisa dibagikan atau diarsipkan dengan bukti visual, bukan hanya sebuah angka.
- **Etalase produk** di bagian landing yang memperkenalkan teknologi stikernya sendiri.

### Teknologi

React, TypeScript, Vite, Chart.js untuk grafik hasil dan riwayat, `clsx` dan `tailwind-merge` untuk komposisi kelas Tailwind bersyarat, ikon Lucide, Oxlint untuk linting. Dideploy ke GitHub Pages (`.github/workflows/deploy.yml`) dan Vercel (`vercel.json`).

### Menjalankan

```bash
npm install
npm run dev
npm run build
npm run lint
```

### Struktur

```
src/core/colorimetry.ts       matematika konversi ruang warna (sRGB -> linear -> XYZ -> Lab)
src/components/Scanner/       pengambilan dan analisis kamera, kartu hasil, riwayat pindai, rekomendasi FEFO
src/components/Hero/          bagian etalase produk
src/data/sampleData.ts        data contoh yang dipakai saat belum ada pemindaian sungguhan
```
