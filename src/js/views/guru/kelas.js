import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sidebar
    initSidebar();

    // Initialize teacher profile
    const user = storage.getUser();
    if (user) {
        let displayName = user.name || 'Bu Nina';
        let cleanName = displayName.replace(/^Bu\s+/, '');

        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = cleanName;
    }

    // Modal elements
    const modal = document.getElementById('modal-kelas');
    const openModalBtn = document.getElementById('btn-tambah-kelas');
    const closeModalBtn = document.getElementById('modal-kelas-close');
    const cancelModalBtn = document.getElementById('btn-cancel-kelas');
    const form = document.getElementById('form-tambah-kelas');

    const openModal = () => {
        modal.style.display = 'flex';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
    };

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Helper to extract grade number/label from inputs (e.g. "Matematika Kelas 5" -> "5")
    function extractGrade(className, dateClass) {
        const match = (className + ' ' + dateClass).match(/(?:kelas|grade|kls)?\s*([0-9XIIV]+)/i);
        return match ? match[1].toUpperCase() : '5';
    }

    // Form submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const className = document.getElementById('kelas-name').value.trim();
            const subject = document.getElementById('kelas-subject').value.trim();
            const dateClass = document.getElementById('kelas-date').value.trim();
            const academicYear = document.getElementById('kelas-academic-year').value.trim();

            // Extract grade level (e.g., "5" or "X")
            const tingkat = extractGrade(className, dateClass);

            // Parse year to 4-digit integer (e.g., "2025/2026" -> 2025)
            const yearMatch = academicYear.match(/\d{4}/);
            const tahun_ajaran = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

            // Get logged in teacher's ID
            const currentUser = storage.getUser();
            const guru_id = currentUser ? currentUser.id : null;

            try {
                const response = await apiClient.post('/kelas', {
                    nama_kelas: className,
                    tingkat: tingkat,
                    jurusan: subject, // Map Mata Pelajaran to 'jurusan'
                    tahun_ajaran: tahun_ajaran,
                    guru_id: guru_id
                });

                if (response.success) {
                    alert('Kelas baru berhasil dibuat!');
                    closeModal();
                    await loadAndRenderClasses();
                } else {
                    alert('Gagal membuat kelas: ' + (response.message || 'Error tidak diketahui'));
                }
            } catch (err) {
                console.error(err);
                if (err.errors) {
                    const errMsg = Object.values(err.errors).flat().join('\n');
                    alert(`Gagal membuat kelas:\n${errMsg}`);
                } else {
                    alert('Gagal menghubungkan ke server untuk membuat kelas.');
                }
            }
        });
    }

    // Initial render
    loadAndRenderClasses();
});

async function loadAndRenderClasses() {
    const container = document.getElementById('classes-table-body');
    if (!container) return;

    try {
        const response = await apiClient.get('/kelas');
        
        if (response.success && response.data) {
            const classes = response.data;

            if (classes.length === 0) {
                container.innerHTML = '<tr><td colspan="4" class="empty-state">Belum ada kelas yang diampu.</td></tr>';
                return;
            }

            container.innerHTML = classes.map(c => {
                // Mata Pelajaran -> c.jurusan (or fallback if empty)
                const subject = c.jurusan || 'Umum';
                // Kelas -> c.tingkat
                const grade = c.tingkat || '-';
                // Kode Kelas -> c.id (using ID as unique join code)
                const classCode = c.id;
                // Jumlah Siswa -> c.jumlah_siswa
                const studentCount = c.jumlah_siswa || 0;

                return `
                    <tr>
                        <td style="font-weight: 700; text-align: center;">${subject}</td>
                        <td>${grade}</td>
                        <td style="font-family: monospace; font-weight: 700; color: #4b5563;">${classCode}</td>
                        <td>${studentCount}</td>
                    </tr>
                `;
            }).join('');
        } else {
            container.innerHTML = '<tr><td colspan="4" class="empty-state" style="color: #ef4444;">Gagal mengambil data kelas.</td></tr>';
        }
    } catch (err) {
        console.error('Error fetching classes:', err);
        container.innerHTML = '<tr><td colspan="4" class="empty-state" style="color: #ef4444;">Gagal memuat daftar kelas. Pastikan server backend menyala.</td></tr>';
    }
}
