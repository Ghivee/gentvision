# GENT-Vision

Pemindai warna stiker kemasan pintar GENT di peramban. Stikernya indikator kolorimetri berbasis kurkumin dalam pelarut eutektik dalam (DES) dan biomassa jerami padi, dikembangkan bersama UGM Technology. GENT-Vision membaca stiker lewat kamera, mengubah warnanya ke CIE Lab, lalu menampilkan hasilnya.

[English](README.md)

## Fungsi

- Pengambilan gambar dari kamera di dalam stensil persegi, dan analisis warna di `src/core/colorimetry.ts` (sRGB ke RGB linear, XYZ, dan CIE Lab).
- Dua mode, retail dan konsumen, dengan rekomendasi penyimpanan berdasarkan prinsip FEFO (yang kedaluwarsa lebih dulu keluar lebih dulu).
- Riwayat pemindaian yang tersimpan di peramban (`localStorage`).
- Laporan PDF yang menyertakan foto hasil tangkapan.
- Bagian landing berisi etalase produk.

## Teknologi

React, TypeScript, Vite, Chart.js, `clsx` dan `tailwind-merge`, ikon Lucide, Oxlint. Dideploy ke GitHub Pages (`.github/workflows/deploy.yml`) dan Vercel (`vercel.json`).

## Menjalankan

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Struktur

```
src/core/colorimetry.ts       konversi ruang warna
src/components/Scanner/       analisis kamera, kartu hasil, riwayat pindai, rekomendasi FEFO
src/components/Hero/          etalase produk
src/data/sampleData.ts        data contoh
```
