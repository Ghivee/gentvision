import { FreshnessStatus, UserMode } from '../../types';

/**
 * Rekomendasi FEFO berdasarkan status kesegaran dan mode pengguna.
 * Mode Retail  → rekomendasi untuk pengelola toko/retail
 * Mode Consumer → rekomendasi untuk konsumen/rumah tangga
 */
export function getFefoRecommendation(status: FreshnessStatus, mode: UserMode): string[] {
  if (mode === 'retail') {
    switch (status) {
      case 'spoiled':
        return [
          'Pajang di Rak Paling Depan & Beri Diskon 30% Sekarang',
          'Pasang label "PROMO HARI INI" — prioritas jual tertinggi',
          'Hubungi supervisor untuk verifikasi sebelum penghapusan stok',
          'Catat batch ini untuk evaluasi rantai dingin',
        ];
      case 'warning':
        return [
          'Stok Penyangga — Siapkan untuk dijual besok pagi',
          'Pindahkan ke posisi rak tengah, depan batch yang lebih segar',
          'Periksa suhu penyimpanan (target: 0–4°C)',
          'Pertimbangkan diskon 10–15% jika tidak terjual dalam 6 jam',
        ];
      case 'fresh':
        return [
          'Simpan di Freezer atau rak belakang',
          'Prioritas jual rendah — batch lain lebih mendesak',
          'Rotasi normal, tidak perlu tindakan segera',
          'Catat tanggal kadaluarsa untuk monitoring rutin',
        ];
    }
  } else {
    // consumer mode
    switch (status) {
      case 'spoiled':
        return [
          'Wajib Dimasak atau Diolah Hari Ini',
          'Masak hingga suhu internal ≥ 75°C untuk keamanan',
          'Jangan simpan kembali — gunakan segera',
          'Jika ragu, jangan dikonsumsi — keamanan lebih penting',
        ];
      case 'warning':
        return [
          'Simpan di Kulkas Bawah (0–4°C) dan masak dalam 24 jam',
          'Bungkus rapat dengan plastik wrap atau wadah tertutup',
          'Prioritaskan pengolahan sebelum daging lain yang lebih segar',
          'Cium aroma sebelum memasak sebagai pengecekan tambahan',
        ];
      case 'fresh':
        return [
          'Simpan di Freezer jika tidak digunakan dalam 2 hari',
          'Daging masih prima — boleh disimpan di kulkas normal',
          'Tidak perlu tindakan mendesak',
          'Bisa digunakan untuk meal prep mingguan',
        ];
    }
  }
}
