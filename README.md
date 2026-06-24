# 🎨 E-Learning Frontend Portal

Aplikasi antarmuka pengguna (Frontend) untuk platform E-Learning berbasis web yang dibangun menggunakan **Vanilla HTML, Javascript (ES Modules), dan CSS**. Proyek ini didekopel (decoupled) sepenuhnya dari backend dan berkomunikasi dengan API Backend melalui HTTP Request.

Proyek ini menghadirkan pengalaman pengguna (UX) yang responsif dan premium dengan tiga panel role berbeda: **Admin**, **Guru**, dan **Siswa**.

---

## 🚀 Tech Stack & Fitur Utama

Teknologi yang digunakan sepenuhnya modern tanpa menggunakan build steps (no npm build required):

*   **Markup:** HTML5 dengan struktur semantik.
*   **Styling:** Vanilla CSS3 dengan arsitektur modular (`global.css`, `components.css`, dan style spesifik halaman).
*   **Scripting:** Vanilla Javascript ES6+ menggunakan fitur modern seperti **ES Modules (Import/Export)**, **Async/Await**, dan **Fetch API**.
*   **State & Session:** LocalStorage untuk menyimpan data autentikasi (`elearning_token`) dan peran pengguna (`elearning_role`).
*   **Architecture:** Decoupled Architecture (Frontend dan Backend berada di folder/port terpisah).

---

## 📁 Struktur Direktori Frontend

```text
FrontEndMuhammadAhlul/
│
├── index.html               # Halaman utama (Auto-redirection based on login state)
├── login.html               # Form masuk akun pengguna
├── register.html            # Form pendaftaran akun siswa baru
├── lupa-password.html       # Form pemulihan password (jika diaktifkan)
│
├── pages/                   # File HTML halaman dashboard & fitur per role
│   ├── admin/               # Panel Admin (Kelola User, Kelas, Mapel)
│   ├── guru/                # Panel Guru (Kelola Kelas, Materi, Tugas, Penilaian)
│   └── siswa/               # Panel Siswa (Join Kelas, Lihat Materi, Kerjakan Tugas, Forum)
│
└── src/                     # Aset inti aplikasi
    ├── css/                 # Manajemen Style CSS
    │   ├── global.css       # Pengaturan dasar/reset CSS
    │   ├── components.css   # Komponen UI global (Button, Modal, Card)
    │   └── [role]/          # Desain spesifik untuk setiap panel pengguna
    │
    └── js/                  # Manajemen Logika Javascript
        ├── app.js           # Inisialisasi awal aplikasi
        ├── config.js        # Konfigurasi konstanta global (API URL, default redirect)
        ├── api/             # API Client untuk melakukan request ke Backend
        ├── middleware/      # Keamanan routing (Mencegah bypass login/role ilegal)
        ├── utils/           # Fungsi pembantu (Storage helper, formatting date, dll)
        └── views/           # Logika JS per halaman (Dashboard, Kelas, Materi, dll)
```

---

## ⚙️ Cara Menjalankan Project

Karena proyek ini murni dibangun menggunakan Vanilla JS, HTML, dan CSS, Anda **tidak perlu menginstal package NodeJS/NPM** untuk menjalankannya. Anda hanya membutuhkan web server statis lokal.

### Langkah-Langkah Menjalankan:

1.  **Konfigurasi API URL:**
    Buka file `src/js/config.js` dan pastikan konfigurasi `API_BASE_URL` mengarah ke alamat server backend Anda yang sedang aktif:
    ```javascript
    export const CONFIG = {
        API_BASE_URL: 'http://127.0.0.1:8000/api', // Sesuaikan dengan port server Laravel Anda
        // ...
    };
    ```

2.  **Jalankan Menggunakan Salah Satu Opsi Server Statis Berikut:**

    *   **Opsi A: Menggunakan VS Code Live Server (Sangat Direkomendasikan)**
        1. Instal ekstensi **Live Server** oleh Ritwick Dey di VS Code.
        2. Buka folder `FrontEndMuhammadAhlul` di VS Code.
        3. Klik tombol **"Go Live"** di status bar pojok kanan bawah VS Code.
        4. Halaman akan terbuka otomatis di browser (biasanya alamat `http://127.0.0.1:5500`).

    *   **Opsi B: Menggunakan Python HTTP Server**
        Buka terminal pada direktori `FrontEndMuhammadAhlul` dan jalankan:
        ```bash
        python -m http.server 5500
        ```
        Buka browser dan akses alamat `http://localhost:5500`.

    *   **Opsi C: Menggunakan PHP Built-in Server**
        Buka terminal pada direktori `FrontEndMuhammadAhlul` dan jalankan:
        ```bash
        php -S localhost:5500
        ```
        Buka browser dan akses alamat `http://localhost:5500`.

    *   **Opsi D: Menggunakan NodeJS static runner**
        Jika Anda memiliki NodeJS terinstal, Anda dapat langsung menjalankan server instan:
        ```bash
        npx serve -l 5500 .
        ```

---

## 🔑 Mekanisme Autentikasi & Keamanan Routing

Sistem autentikasi menggunakan **Laravel Sanctum (Bearer Token)** yang dikelola di sisi client:

1.  **Penyimpanan Kredensial:** Setelah berhasil login melalui `login.html`, respons token dari backend disimpan di LocalStorage dengan kunci `elearning_token` dan hak akses disimpan sebagai `elearning_role`.
2.  **Proteksi Rute (Middleware):** Setiap halaman yang dilindungi menyertakan script inisialisasi yang memanggil modul middleware di awal proses pemuatan halaman:
    *   Mengecek keberadaan token. Jika kosong, pengguna dialihkan kembali ke `login.html`.
    *   Mengecek hak akses halaman. Jika siswa mencoba masuk ke direktori `/pages/guru/*` atau `/pages/admin/*`, maka browser akan memblokir dan mengarahkan kembali ke halaman dashboard yang sesuai.
3.  **API Client & Bearer Authorization:** Modul fetch request secara otomatis membungkus header HTTP di setiap panggilan ke backend:
    ```javascript
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    ```

---

## 👥 Gambaran Fitur Panel Pengguna (Roles)

### 👨‍🎓 Panel Siswa (`/pages/siswa/`)
*   **Dashboard:** Menampilkan sapaan nama siswa, daftar kelas aktif, ringkasan tugas terbaru, dan pengumuman sekolah/kelas.
*   **Gabung Kelas:** Bergabung ke kelas baru secara langsung menggunakan Kode Kelas / ID Kelas yang diberikan oleh Guru.
*   **Materi Pembelajaran:** Mengunduh atau melihat berkas PDF/Gambar materi yang diunggah guru, atau memutar link video pembelajaran.
*   **Tugas Kelas:** Mengakses daftar tugas lengkap di setiap kelas, melihat batas waktu (deadline), dan mengunggah lembar jawaban tugas.
*   **Forum Diskusi:** Membuat topik pertanyaan baru per mata pelajaran, membalas pertanyaan teman/guru, serta mendapatkan fitur komentar bertingkat.
*   **Notifikasi:** Mendapatkan pemberitahuan *real-time* ketika ada komentar baru pada postingan forum miliknya atau balasan komentar baru.

### 👩‍🏫 Panel Guru (`/pages/guru/`)
*   **Dashboard:** Menampilkan metrik data (Jumlah Kelas, Materi, Tugas, Pengumuman), daftar kelas aktif yang diampu, tugas terbaru, dan kiriman tugas siswa terbaru.
*   **Kelola Kelas:** Membuat kelas baru beserta tahun ajaran spesifik.
*   **Kelola Materi:** Mengunggah materi pelajaran (upload dokumen PDF/Gambar, input link video streaming) untuk kelas & mata pelajaran terkait.
*   **Kelola Tugas:** Membuat tugas kelas baru lengkap dengan deskripsi, deadline, dan unggah berkas instruksi tugas.
*   **Penilaian & Grading:** Memeriksa tugas yang dikirim oleh siswa, melihat waktu pengiriman, mengunduh file jawaban, serta menginputkan nilai dan catatan umpan balik.
*   **Forum Diskusi:** Menjawab pertanyaan siswa pada topik forum diskusi di bidang pelajarannya.
*   **Profil & Keamanan:** Mengubah detail profil (Nama, Username, Email) dan mengganti kata sandi.

### 👑 Panel Admin (`/pages/admin/`)
*   **Kelola Pengguna:** CRUD akun (membuat, mengubah, dan menghapus akun Admin, Guru, dan Siswa).
*   **Kelola Kelas:** Mengatur pembagian kelas di sekolah beserta wali kelas (wali kelas wajib guru).
*   **Kelola Mata Pelajaran:** Menambahkan, mengedit, dan menghapus kurikulum mata pelajaran.
