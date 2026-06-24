# Laporan Fitur & Mismatch API Backend (Elearning-Backend)

Dokumen ini berisi analisis detail mengenai fitur-fitur yang hilang pada backend (`Elearning-Backend`) serta ketidakcocokan (mismatch) antara validasi API backend dengan kebutuhan data pada frontend (`FrontEndMuhammadAhlul`).

---

## 1. Fitur yang Belum Ada / Hilang dari Source Code Backend
Meskipun tabel database `tugas` dan `pengumpulan_tugas` sudah terbuat di dalam database MySQL lokal (mungkin dari eksekusi sebelumnya), **seluruh berkas kode sumber (source code) terkait fitur ini tidak ada di repositori backend**.

Berikut adalah berkas-berkas yang hilang dan **harus dibuat ulang**:

### A. Migration Files (`database/migrations/`)
* **`2026_06_24_000000_create_tugas_table.php`**
* **`2026_06_24_000001_create_pengumpulan_tugas_table.php`**

### B. Eloquent Models (`app/Models/`)
* **`app/Models/Tugas.php`**
* **`app/Models/PengumpulanTugas.php`**

### C. Controller & Request Validation
* **`app/Http/Controllers/Api/TugasController.php`**
* Validasi input request saat guru membuat tugas baru dan saat siswa mengumpulkan tugas.

### D. Rute API (`routes/api.php`)
Rute berikut belum terdaftar pada berkas `routes/api.php`:
* `GET /api/tugas` (Mendapatkan daftar tugas)
* `POST /api/tugas` (Membuat tugas baru)
* `DELETE /api/tugas/{id}` (Menghapus tugas)
* `GET /api/pengumpulan/{tugas_id}` (Melihat daftar pengumpulan siswa)
* `PUT /api/pengumpulan/{id}/nilai` (Menilai pengumpulan siswa)

---

## 2. Ketidakcocokan (Mismatch) Validasi & Logika Bisnis

### A. Validasi Tingkat Kelas (`KelasRequest.php`)
* **Masalah**: Backend membatasi nilai `tingkat` hanya untuk tingkat SMA: `'in:X,XI,XII'`.
* **Frontend**: Halaman guru dan admin dirancang untuk tingkat SD/SMP (menggunakan angka `1, 2, 3, 4, 5, 6` atau `7, 8, 9`). Saat frontend mengirim tingkat kelas seperti `"5"`, backend menolaknya dengan error `422 Unprocessable Content` (Tingkat tidak valid).
* **Solusi**: Aturan validasi `tingkat` di `KelasRequest.php` harus diperluas agar menerima angka tingkat sekolah dasar/menengah.

### B. Format Tahun Ajaran (`KelasRequest.php`)
* **Masalah**: Backend memvalidasi `tahun_ajaran` sebagai tipe `integer` dengan panjang tepat 4 digit (misal: `2024`), minimal `2000` dan maksimal `2099`.
* **Frontend**: Form input pada frontend mengirim format rentang tahun seperti `"2024/2025"` (string). Hal ini memicu error validasi backend.
* **Solusi**: Ubah aturan validasi di backend menjadi tipe `string` (max: 9 karakter) atau sesuaikan input frontend agar hanya mengirim tahun mulai (integer).

### C. Nama Field File Materi (`StoreMateriRequest.php` & `UpdateMateriRequest.php`)
* **Masalah**: Backend mengharapkan field bernama `'file'` untuk upload dokumen PDF/gambar.
* **Frontend**: Script javascript pada frontend mengirim field bernama `'file_materi'`.
* **Solusi**: Samakan nama field menjadi `'file'` di kedua sisi.

### D. Otorisasi Update Profil Guru (`routes/api.php` & `UserController.php`)
* **Masalah**: Frontend memperbarui profil guru dengan mengirim request `PUT /api/admin/{id}`. Namun, rute `/api/admin` di backend diproteksi oleh middleware khusus admin:
  ```php
  Route::middleware('role:admin')->group(function () {
      Route::apiResource('admin', UserController::class);
  });
  ```
  Ini menyebabkan guru yang mencoba mengedit profilnya sendiri mendapatkan error `403 Forbidden`.
* **Solusi**: Buat rute khusus yang dapat diakses oleh semua pengguna yang sudah login (misalnya `PUT /api/profile` atau izinkan role `guru` mengakses fungsi update profil miliknya sendiri di `UserController`).
