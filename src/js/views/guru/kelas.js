import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

let editMode = false;
let editingClassId = null;
let globalClasses = [];

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
        editMode = false;
        editingClassId = null;
        
        // Reset modal title and button to default
        const modalTitle = document.getElementById('modal-title');
        if (modalTitle) modalTitle.textContent = 'Buat Kelas Baru';
        
        const submitBtn = document.getElementById('btn-submit-kelas');
        if (submitBtn) submitBtn.textContent = 'Buat Kelas';
        
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

            const payload = {
                nama_kelas: className,
                tingkat: tingkat,
                jurusan: subject, // Map Mata Pelajaran to 'jurusan'
                tahun_ajaran: tahun_ajaran,
                guru_id: guru_id
            };

            try {
                let response;
                if (editMode) {
                    response = await apiClient.put(`/kelas/${editingClassId}`, payload);
                } else {
                    response = await apiClient.post('/kelas', payload);
                }

                if (response.success) {
                    alert(editMode ? 'Kelas berhasil diperbarui!' : 'Kelas baru berhasil dibuat!');
                    closeModal();
                    await loadAndRenderClasses();
                } else {
                    alert((editMode ? 'Gagal memperbarui kelas: ' : 'Gagal membuat kelas: ') + (response.message || 'Error tidak diketahui'));
                }
            } catch (err) {
                console.error(err);
                if (err.errors) {
                    const errMsg = Object.values(err.errors).flat().join('\n');
                    alert(`Gagal menyimpan kelas:\n${errMsg}`);
                } else {
                    alert('Gagal menghubungkan ke server untuk menyimpan kelas.');
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
            globalClasses = classes; // Store globally for edit prefilling

            if (classes.length === 0) {
                container.innerHTML = '<tr><td colspan="5" class="empty-state">Belum ada kelas yang diampu.</td></tr>';
                return;
            }

            container.innerHTML = classes.map(c => {
                const subject = c.jurusan || 'Umum';
                const grade = c.tingkat || '-';
                const classCode = c.id;
                const studentCount = c.jumlah_siswa || 0;

                return `
                    <tr>
                        <td style="font-weight: 700; text-align: center;">${subject}</td>
                        <td>${grade}</td>
                        <td style="font-family: monospace; font-weight: 700; color: #4b5563;">${classCode}</td>
                        <td>${studentCount}</td>
                        <td style="display: flex; gap: 8px; justify-content: center; align-items: center;">
                            <button class="btn-edit-kelas" data-id="${c.id}" style="background: #eab308; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.85rem;">Edit</button>
                            <button class="btn-hapus-kelas" data-id="${c.id}" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.85rem;">Hapus</button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Attach event listeners to Edit and Hapus buttons
            container.querySelectorAll('.btn-edit-kelas').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    const classObj = globalClasses.find(c => c.id === id);
                    if (classObj) {
                        editMode = true;
                        editingClassId = id;

                        // Change Modal Title and button label
                        const modalTitle = document.getElementById('modal-title');
                        if (modalTitle) modalTitle.textContent = 'Edit Kelas';
                        
                        const submitBtn = document.getElementById('btn-submit-kelas');
                        if (submitBtn) submitBtn.textContent = 'Simpan';

                        // Fill Form Values
                        document.getElementById('kelas-name').value = classObj.nama_kelas || '';
                        document.getElementById('kelas-subject').value = classObj.jurusan || '';
                        document.getElementById('kelas-date').value = `Kelas ${classObj.tingkat || ''}`;
                        document.getElementById('kelas-academic-year').value = classObj.tahun_ajaran || '';
                        document.getElementById('kelas-display-code').value = classObj.id || '';

                        // Open modal
                        const modal = document.getElementById('modal-kelas');
                        if (modal) modal.style.display = 'flex';
                    }
                });
            });

            container.querySelectorAll('.btn-hapus-kelas').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = parseInt(btn.dataset.id);
                    if (confirm('Apakah Anda yakin ingin menghapus kelas ini? Semua data terkait (materi, tugas, dll) di kelas ini mungkin juga akan terhapus.')) {
                        try {
                            const response = await apiClient.delete(`/kelas/${id}`);
                            if (response.success) {
                                alert('Kelas berhasil dihapus!');
                                await loadAndRenderClasses();
                            } else {
                                alert('Gagal menghapus kelas: ' + (response.message || 'Error tidak diketahui'));
                            }
                        } catch (err) {
                            console.error(err);
                            alert('Gagal menghubungkan ke server untuk menghapus kelas.');
                        }
                    }
                });
            });

        } else {
            container.innerHTML = '<tr><td colspan="5" class="empty-state" style="color: #ef4444;">Gagal mengambil data kelas.</td></tr>';
        }
    } catch (err) {
        console.error('Error fetching classes:', err);
        container.innerHTML = '<tr><td colspan="5" class="empty-state" style="color: #ef4444;">Gagal memuat daftar kelas. Pastikan server backend menyala.</td></tr>';
    }
}
