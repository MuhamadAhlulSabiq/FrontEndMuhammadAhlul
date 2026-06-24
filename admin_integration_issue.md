# ISSUE: Integrasi Halaman Admin (Dashboard, Manajemen Pengguna, dan Pengaturan) ke API Backend

## Deskripsi Tugas
Lakukan integrasi API backend Laravel ke halaman panel Admin (`pages/admin/*`) pada frontend. Tugas ini meliputi pengambilan data statistik riil untuk Dashboard, fungsionalitas pembuatan akun guru baru di halaman Manajemen Pengguna, serta sinkronisasi profil/kata sandi di halaman Pengaturan.

Ikuti panduan langkah demi langkah di bawah ini untuk menyelesaikan integrasi.

---

## Langkah 1: Perluas API Client (`src/js/api/api-client.js`)
Sebelum masuk ke halaman admin, API client saat ini (`apiClient`) hanya memiliki metode `POST`. Anda perlu memperluasnya agar mendukung metode `GET`, `PUT`, dan `DELETE`, serta **secara otomatis menyertakan header Authorization** (Bearer Token) jika pengguna sudah login.

### Modifikasi [api-client.js](file:///d:/Project/joki/E-learning/Frontend%20E-learning/FrontEndMuhammadAhlul/src/js/api/api-client.js):
Ubah struktur file tersebut menjadi seperti berikut:
```javascript
import { CONFIG } from '../config.js';
import { storage } from '../utils/storage.js';

async function request(endpoint, method, data = null) {
    const headers = {
        'Accept': 'application/json'
    };

    // Ambil token dari local storage dan lampirkan jika ada
    const token = storage.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (data) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `HTTP Error: ${response.status}`;
            const err = new Error(errorMessage);
            err.status = response.status;
            err.errors = errorData.errors;
            throw err;
        }

        return await response.json();
    } catch (error) {
        console.error(`API Request ${method} ${endpoint} failed:`, error);
        throw error;
    }
}

export const apiClient = {
    get(endpoint) { return request(endpoint, 'GET'); },
    post(endpoint, data) { return request(endpoint, 'POST', data); },
    put(endpoint, data) { return request(endpoint, 'PUT', data); },
    delete(endpoint) { return request(endpoint, 'DELETE'); }
};
```

---

## Langkah 2: Integrasi Dashboard (`src/js/views/admin/dashboard.js`)
Halaman dashboard menampilkan statistik total guru, total siswa, dan total kelas/kursus aktif. Saat ini nilai tersebut masih semi-hardcoded/menggunakan local storage dummy.

### Tugas:
1. Hubungkan pencarian profil di awal untuk menggunakan data profil riil.
2. Ambil data guru secara riil dari backend untuk mengisi bagian **Total Guru**:
   * Panggil API `GET /admin?role=guru`
   * Ambil jumlah data dari properti `meta.total` (struktur standard pagination Laravel) atau hitung panjang array data respons.
3. Ambil data siswa secara riil untuk mengisi bagian **Total Siswa**:
   * Panggil API `GET /admin?role=siswa`
   * Ambil jumlah total data siswa dari respons.
4. Ambil data kelas aktif untuk mengisi bagian **Kursus Aktif**:
   * Panggil API `GET /kelas`
   * Hitung total kelas yang terdaftar.

### Contoh Kode Integrasi:
```javascript
async function loadAndRenderDashboard() {
    try {
        // 1. Ambil data Guru
        const responseGuru = await apiClient.get('/admin?role=guru');
        const totalGuru = responseGuru.meta?.total || responseGuru.data?.length || 0;
        
        // 2. Ambil data Siswa
        const responseSiswa = await apiClient.get('/admin?role=siswa');
        const totalSiswa = responseSiswa.meta?.total || responseSiswa.data?.length || 0;

        // 3. Ambil data Kelas (Kursus)
        const responseKelas = await apiClient.get('/kelas');
        const totalKelas = responseKelas.data?.length || 0;

        // Render ke DOM
        const teachersCountEl = document.getElementById('stat-teachers-count');
        if (teachersCountEl) teachersCountEl.textContent = totalGuru.toLocaleString('id-ID');

        const studentsCountEl = document.getElementById('stat-students-count');
        if (studentsCountEl) studentsCountEl.textContent = totalSiswa.toLocaleString('id-ID');

        const classesCountEl = document.getElementById('stat-classes-count');
        if (classesCountEl) classesCountEl.textContent = totalKelas.toLocaleString('id-ID');
        
    } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
    }
}
```

---

## Langkah 3: Integrasi Manajemen Pengguna - Tambah Guru (`src/js/views/admin/manajemen-pengguna.js`)
Halaman [manajemen-pengguna.html](file:///d:/Project/joki/E-learning/Frontend%20E-learning/FrontEndMuhammadAhlul/pages/admin/manajemen-pengguna.html) digunakan admin untuk mendaftarkan akun Guru baru. Pembuatan akun guru baru harus langsung dimasukkan ke database melalui API `/api/admin`.

### Tugas:
1. Hubungkan form submit ke endpoint backend `POST /admin`.
2. Sesuai validasi backend di `StoreUserRequest.php`, field yang wajib dikirim adalah:
   * `nama` (Nama Lengkap)
   * `username` (Username unik, buat secara otomatis dari awalan email)
   * `email` (Email unik pengajar)
   * `password` (Password guru, berikan default password seperti `Password123` agar guru dapat login dan mengubahnya nanti di halaman pengaturan profil mereka)
   * `role` (Kirim nilai `'guru'`)
3. Tampilkan pesan kesalahan validasi backend jika proses submit gagal (misal: email atau username sudah pernah terdaftar).

### Contoh Kode Integrasi (Form Submit):
```javascript
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const passwordDefault = 'Password123'; // Password default untuk guru baru
            const username = email.split('@')[0];

            try {
                // Panggil API backend untuk menyimpan user baru
                await apiClient.post('/admin', {
                    nama: name,
                    username: username,
                    email: email,
                    password: passwordDefault,
                    role: 'guru'
                });

                alert(`Data pengajar ${name} berhasil disimpan di database! Password default: ${passwordDefault}`);
                window.location.href = 'dashboard.html';

            } catch (err) {
                console.error(err);
                if (err.status === 422 && err.errors) {
                    const errorMessages = Object.values(err.errors).flat().join('\n');
                    alert(`Gagal menyimpan pengajar:\n${errorMessages}`);
                } else {
                    alert(`Terjadi kesalahan: ${err.message}`);
                }
            }
        });
    }
```

---

## Langkah 4: Integrasi Halaman Pengaturan (`src/js/views/admin/pengaturan.js`)
Halaman [pengaturan.html](file:///d:/Project/joki/E-learning/Frontend%20E-learning/FrontEndMuhammadAhlul/pages/admin/pengaturan.html) memiliki tiga bagian utama: Profil Sekolah, Akun & Keamanan (Ganti Password), dan Notifikasi.

### Tugas:
1. **Profil & Password Akun Admin**:
   * Gunakan API `PUT /admin/{user_id}` untuk memperbarui username dan password milik admin itu sendiri.
   * Ambil data `user_id` aktif dari token/session yang tersimpan (`storage.getUser().id`).
   * Saat admin ingin mengubah password melalui modal ganti password:
     * Validasi kecocokan input password baru dan konfirmasi password.
     * Kirim request ke `PUT /admin/{user_id}` dengan body data `{"password": newPassword}`.
2. **Profil Sekolah & Notifikasi**:
   * Karena saat ini database backend belum memiliki tabel khusus untuk setting sekolah (seperti nama sekolah, alamat sekolah, logo sekolah, preferensi notifikasi email/push), biarkan data ini tetap disimpan dan dibaca secara lokal menggunakan `storage.getSettings()` dan `storage.updateSettings()` seperti yang sudah diimplementasikan saat ini.

### Contoh Kode Integrasi (Ganti Password):
```javascript
    if (formChangePassword) {
        formChangePassword.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (newPassword !== confirmPassword) {
                alert('Konfirmasi password baru tidak cocok!');
                return;
            }

            const activeUser = storage.getUser();
            if (!activeUser || !activeUser.id) {
                alert('Data sesi user admin tidak ditemukan.');
                return;
            }

            try {
                // Perbarui password admin via API update user
                await apiClient.put(`/admin/${activeUser.id}`, {
                    password: newPassword
                });
                
                alert('Password admin berhasil diubah!');
                
                // Simpan tanggal perubahan secara lokal
                const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                const settings = storage.getSettings();
                settings.passwordLastChanged = `Terakhir diubah pada ${today}`;
                storage.updateSettings(settings);
                
                // Tutup modal
                modalPassword.classList.remove('active');
                loadSettings();
                
            } catch (err) {
                console.error(err);
                if (err.status === 422 && err.errors) {
                    const errorMessages = Object.values(err.errors).flat().join('\n');
                    alert(`Gagal mengubah password:\n${errorMessages}`);
                } else {
                    alert(`Gagal mengubah password: ${err.message}`);
                }
            }
        });
    }
```

---

## Langkah 5: Pengujian dan Validasi
Setelah menyelesaikan integrasi di atas, lakukan tes manual berikut:
1. Pastikan server backend Laravel berjalan di latar belakang (`php artisan serve`).
2. Login menggunakan akun Admin (`admin@example.com` / `Admin123`).
3. Buka halaman Dashboard, pastikan jumlah guru dan siswa menampilkan data riil dari database.
4. Buka halaman Tambah Guru Baru, masukkan data guru fiktif, klik tombol "Daftar", dan pastikan data berhasil masuk ke database. Coba juga mendaftarkan email yang sama untuk memverifikasi penolakan validasi dari backend.
5. Buka halaman Pengaturan, ganti password admin, logout, lalu coba login kembali menggunakan password baru tersebut.
