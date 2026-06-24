# PANDUAN INTEGRASI API: Halaman Guru (Teacher Panel)

Panduan ini berisi langkah-langkah detail, contoh kode, serta instruksi lengkap untuk menghubungkan antarmuka frontend guru (`FrontEndMuhammadAhlul/pages/guru/*`) ke API Backend Laravel. Panduan ini dirancang agar dapat dipahami dengan mudah oleh programmer junior maupun model AI.

---

## DAFTAR ISI
1. [Prasyarat & Konfigurasi Umum](#0-prasyarat--konfigurasi-umum)
2. [Dashboard (`dashboard.js`)](#1-dashboard-dashboardjs)
3. [Kelas Saya (`kelas.js`)](#2-kelas-saya-kelasjs)
4. [Materi Pembelajaran (`materi.js`)](#3-materi-pembelajaran-materijs)
5. [Tugas Kelas (`tugas.js`)](#4-tugas-kelas-tugasjs)
6. [Pengumpulan & Penilaian Tugas (`pengumpulan.js`)](#5-pengumpulan--penilaian-tugas-pengumpulanjs)
7. [Forum Diskusi (`forum.js`)](#6-forum-diskusi-forumjs)
8. [Pengumuman (`pengumuman.js`)](#7-pengumuman-pengumumanjs)
9. [Profil Guru (`profil.js`)](#8-profil-guru-profiljs)

---

## 0. PRASYARAT & KONFIGURASI UMUM

### A. Autentikasi Menggunakan Token
Setiap request ke backend yang membutuhkan hak akses harus menyertakan header `Authorization`:
```javascript
Authorization: Bearer <token_dari_local_storage>
```
Gunakan modul utility `src/js/api/api-client.js` karena modul ini telah mengotomatisasi penyisipan token dari LocalStorage.

### B. Mendapatkan Data Pengguna Aktif
Untuk mendapatkan data guru yang sedang login (seperti Nama, Email, ID), baca dari local storage menggunakan utility `storage`:
```javascript
import { storage } from '../../utils/storage.js';
const user = storage.getUser();
```

---

## 1. DASHBOARD (`dashboard.js`)
*   **Lokasi Berkas**: `src/js/views/guru/dashboard.js`
*   **Tujuan**: Menampilkan statistik dashboard guru (jumlah kelas, materi, tugas, pengumuman) dan menampilkan daftar kelas, tugas, serta pengumpulan terbaru.

### Langkah-Langkah Integrasi:
1.  **Muat Nama Pengguna**:
    Ambil profil pengguna dari `storage.getUser()`, bersihkan sapaan gelar (jika ada), lalu tampilkan ke `#welcome-title` dan `#user-display-name`.
2.  **Ambil Data Statistik dari API**:
    Lakukan request `GET` secara paralel ke endpoint berikut:
    *   `/kelas` -> hitung panjang array data untuk `#stat-kelas-count`.
    *   `/materi` -> hitung panjang array data untuk `#stat-materi-count`.
    *   `/tugas` -> hitung panjang array data untuk `#stat-tugas-count`.
    *   `/pengumuman` -> hitung panjang array data untuk `#stat-announcement-count`.
3.  **Render Grid Kelas**:
    Gunakan data dari `/kelas` untuk merender daftar kelas di `#classes-grid-container`. Tampilkan Nama Kelas, Tingkat, Jurusan, dan Jumlah Siswa.
4.  **Render Tugas Terbaru**:
    Gunakan data dari `/tugas` (potong hanya 2 item teratas menggunakan `slice(0, 2)`) dan render ke `#recent-tasks-container`.
5.  **Render Pengumpulan Terbaru**:
    Lakukan perulangan (loop) pada setiap tugas, ambil data pengumpulannya via `GET /pengumpulan/{tugas_id}`, gabungkan hasilnya, potong 2 item teratas, dan tampilkan ke `#recent-submissions-container`.

---

## 2. KELAS SAYA (`kelas.js`)
*   **Lokasi Berkas**: `src/js/views/guru/kelas.js`
*   **Tujuan**: Menampilkan daftar kelas yang diampu dan membuat kelas baru.

### Langkah-Langkah Integrasi:
1.  **Muat Daftar Kelas**:
    Kirim request `GET /kelas`. Render datanya ke dalam tabel body `#classes-table-body`.
    *   *Masing-masing baris (tr) menampilkan*: Nama Kelas, Tingkat, Jurusan, dan Jumlah Siswa.
2.  **Buat Kelas Baru**:
    Dapatkan input formulir `#form-tambah-kelas` saat disubmit:
    *   `nama_kelas`: Ambil dari `#kelas-name`.
    *   `tingkat`: Ekstrak karakter pertama (misal: "X", "XI", atau "XII" sesuai aturan backend).
    *   `jurusan`: Ambil dari `#kelas-subject`.
    *   `tahun_ajaran`: Ambil dari `#kelas-academic-year` (kirim berupa angka 4 digit, misal: `2024` agar tidak memicu error validasi backend).
3.  **Kirim Data**:
    Kirim request `POST /kelas` dengan payload JSON. Jika berhasil, panggil `alert()`, tutup modal, dan muat ulang tabel kelas.

---

## 3. MATERI PEMBELAJARAN (`materi.js`)
*   **Lokasi Berkas**: `src/js/views/guru/materi.js`
*   **Tujuan**: Menampilkan daftar materi, membuat materi baru (upload file/link video), dan menghapus materi.

### Langkah-Langkah Integrasi:
1.  **Muat Daftar Materi**:
    Kirim request `GET /materi`. Render data materi ke tabel body `#materials-table-body`.
2.  **Muat Opsi Dropdown Kelas & Mapel**:
    Muat data dari `GET /kelas` dan `GET /mapel` untuk mengisi opsi pilihan `<select>` di modal tambah materi.
3.  **Unggah Materi Baru (Multipart/FormData)**:
    Karena terdapat upload file (PDF/Gambar), gunakan `FormData` dan fetch secara manual agar header `Content-Type` tidak diubah menjadi JSON:
    ```javascript
    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('tipe', tipe); // 'pdf', 'gambar', atau 'video'
    formData.append('mapel_id', mapelId);
    
    if (tipe === 'video') {
        formData.append('link_video', linkVideo);
    } else {
        formData.append('file', fileInputElement.files[0]); // PENTING: Gunakan key 'file'
    }

    const response = await fetch('http://127.0.0.1:8000/api/materi', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${storage.getToken()}`,
            'Accept': 'application/json'
        },
        body: formData
    });
    ```
4.  **Hapus Materi**:
    Bind tombol hapus materi untuk memicu `DELETE /materi/{id}`.

---

## 4. TUGAS KELAS (`tugas.js`)
*   **Lokasi Berkas**: `src/js/views/guru/tugas.js`
*   **Tujuan**: Menampilkan daftar tugas, membuat tugas baru untuk kelas tertentu, dan menghapus tugas.

### Langkah-Langkah Integrasi:
1.  **Muat Daftar Tugas**:
    Kirim request `GET /tugas` dan render datanya ke `#tasks-grid-container`.
    *   Tampilkan judul tugas, tenggat waktu (deadline), deskripsi, dan nama kelas.
    *   Sediakan tombol "Lihat Pengumpulan" yang mengarahkan ke halaman `pengumpulan.html?tugas_id={id}`.
2.  **Buat Tugas Baru**:
    Dapatkan input formulir saat disubmit:
    *   `judul`: `#task-title`
    *   `deskripsi`: `#task-desc`
    *   `deadline`: `#task-deadline` (format datetime-local)
    *   `kelas_id`: `#task-class-select`
3.  **Kirim Payload**:
    Kirim request `POST /tugas` dengan payload JSON. Jika berhasil, muat ulang halaman.
4.  **Hapus Tugas**:
    Panggil `DELETE /tugas/{id}` jika pengguna menekan tombol hapus dan mengonfirmasinya.

---

## 5. PENGUMPULAN & PENILAIAN TUGAS (`pengumpulan.js`)
*   **Lokasi Berkas**: `src/js/views/guru/pengumpulan.js`
*   **Tujuan**: Menampilkan siswa yang mengumpulkan tugas dan menginputkan nilai beserta catatan umpan balik.

### Langkah-Langkah Integrasi:
1.  **Dapatkan ID Tugas**:
    Baca parameter `tugas_id` dari query URL:
    ```javascript
    const urlParams = new URLSearchParams(window.location.search);
    const tugasId = urlParams.get('tugas_id');
    ```
2.  **Muat Daftar Pengumpulan**:
    Kirim request `GET /pengumpulan/${tugasId}`.
    *   Hitung statistik: jumlah siswa mengumpulkan (nilai tidak null) dan belum dinilai.
    *   Render baris tabel `#submissions-table-body`.
3.  **Buka Panel Detail**:
    Saat baris tabel diklik, tampilkan panel `#pengumpulan-detail-panel` dan sembunyikan `#pengumpulan-list-panel`. Isi data siswa, tautan file (arahkan ke URL backend `/storage/{file_path}`), nilai saat ini, dan catatan guru.
4.  **Simpan Nilai**:
    Kirim request `PUT /pengumpulan/{id_pengumpulan}/nilai` dengan payload:
    ```json
    {
        "nilai": 85,
        "catatan_guru": "Pekerjaan bagus, pertahankan!"
    }
    ```

---

## 6. FORUM DISKUSI (`forum.js`)
*   **Lokasi Berkas**: `src/js/views/guru/forum.js`
*   **Tujuan**: Berpartisipasi dalam diskusi kelas, membuat topik baru, dan membalas komentar.

### Langkah-Langkah Integrasi:
1.  **Muat Daftar Diskusi**:
    Kirim request `GET /forum` dan tampilkan data ke `#forum-feed`.
2.  **Buat Topik Baru**:
    Kirim request `POST /forum` dengan parameter:
    *   `judul`: Judul diskusi
    *   `konten`: Isi deskripsi/pertanyaan diskusi
    *   `mapel_id`: ID mata pelajaran terkait
    *   `kelas_id`: ID kelas target
3.  **Tampilkan Thread Detail & Balasan**:
    Panggil `GET /forum/{id}` untuk mendapatkan detail diskusi beserta array `komentars`. Urutkan balasan komentar utama dan komentar bersarang (nested replies) dari properti `balasan`.
4.  **Kirim Komentar**:
    Kirim request `POST /forum/{id}/komentar` dengan payload:
    ```json
    {
        "konten": "Balasan saya...",
        "parent_id": null // atau isi ID komentar jika berupa balasan bersarang (reply)
    }
    ```
5.  **Hapus Komentar**:
    Kirim request `DELETE /komentar/{id_komentar}` untuk menghapus komentar.

---

## 7. PENGUMUMAN (`pengumuman.js`)
*   **Lokasi Berkas**: `src/js/views/guru/pengumuman.js`
*   **Tujuan**: Membuat, mengedit, dan menghapus pengumuman kelas.

### Langkah-Langkah Integrasi:
1.  **Muat Pengumuman**:
    Kirim request `GET /pengumuman` dan tampilkan ke `#announcements-feed`.
2.  **Buat Pengumuman Baru**:
    Kirim request `POST /pengumuman` dengan payload JSON:
    ```json
    {
        "judul": "Judul Pengumuman",
        "isi": "Isi Pengumuman lengkap",
        "kelas_id": null // null untuk umum, atau isi dengan ID kelas tertentu
    }
    ```
3.  **Edit Pengumuman**:
    Kirim request `PUT /pengumuman/{id}` untuk memperbarui data pengumuman yang sudah ada.
4.  **Hapus Pengumuman**:
    Panggil request `DELETE /pengumuman/{id}`.

---

## 8. PROFIL GURU (`profil.js`)
*   **Lokasi Berkas**: `src/js/views/guru/profil.js`
*   **Tujuan**: Menampilkan biodata guru dan mengubah profil serta kata sandi.

### Langkah-Langkah Integrasi:
1.  **Muat Profil**:
    Panggil `GET /profile` untuk mendapatkan data pengguna aktif saat ini. Isi ke elemen input profil (`nama`, `username`, `email`).
2.  **Perbarui Data Profil**:
    *   *Catatan Mismatch Otorisasi*: Gunakan endpoint `PUT /admin/{id}` (jika admin) ATAU endpoint update profil yang disediakan backend.
    *   Kirim payload: `{ nama, username, email }`.
3.  **Ganti Password**:
    *   Kirim request update dengan menyertakan payload `{ password: newPassword }` ke API update profil.
4.  **Logout**:
    Bind tombol logout untuk memanggil API `POST /logout` lalu hapus session token dan bersihkan LocalStorage via `authApi.logout()`.
