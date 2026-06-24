import { storage } from '../../utils/storage.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';
import { CONFIG } from '../../config.js';

let activeClassFilter = 'semua';
let globalClasses = [];
let globalSubjects = [];

document.addEventListener('DOMContentLoaded', async () => {
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
    const modal = document.getElementById('modal-materi');
    const openModalBtn = document.getElementById('btn-tambah-materi');
    const closeModalBtn = document.getElementById('modal-materi-close');
    const cancelModalBtn = document.getElementById('btn-cancel-materi');
    const form = document.getElementById('form-tambah-materi');
    const fileInput = document.getElementById('materi-file');
    const fileUploadText = document.getElementById('file-upload-text');

    // Open Modal
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    // Close Modal helper
    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
        if (fileUploadText) {
            fileUploadText.textContent = 'Klik disini untuk mengupload materi';
        }
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Detail Modal elements
    const detailModal = document.getElementById('modal-detail-materi');
    const closeDetailBtn = document.getElementById('modal-detail-materi-close');
    const closeDetailBtn2 = document.getElementById('btn-close-detail');

    const closeDetailModal = () => {
        if (detailModal) detailModal.style.display = 'none';
    };

    if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeDetailModal);
    if (closeDetailBtn2) closeDetailBtn2.addEventListener('click', closeDetailModal);

    // Bind file input change to display selected filename
    if (fileInput && fileUploadText) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileUploadText.textContent = `File terpilih: ${file.name}`;
            } else {
                fileUploadText.textContent = 'Klik disini untuk mengupload materi';
            }
        });
    }

    // Event delegation for detail-link clicks in table
    const tableBody = document.getElementById('materi-table-body');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const link = e.target.closest('.detail-link');
            if (link) {
                e.preventDefault();
                const matId = parseInt(link.dataset.id);
                showMaterialDetail(matId);
            }
        });
    }

    // Load filter dropdowns, subjects, and materials
    await loadInitialData();

    // Form Submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const classId = parseInt(document.getElementById('materi-class').value);
            const title = document.getElementById('materi-title').value.trim();
            const desc = document.getElementById('materi-desc').value.trim();

            if (!fileInput.files || !fileInput.files[0]) {
                alert('Pilih file materi terlebih dahulu.');
                return;
            }

            const file = fileInput.files[0];
            const fileName = file.name.toLowerCase();
            let tipe = 'pdf';
            if (fileName.endsWith('.pdf')) {
                tipe = 'pdf';
            } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.webp')) {
                tipe = 'gambar';
            } else {
                alert('Format file tidak valid. Diizinkan: PDF, JPG, JPEG, PNG, WebP.');
                return;
            }

            // Find subject matching selected class's jurusan
            const selectedClass = globalClasses.find(c => c.id === classId);
            let mapelId = null;
            if (selectedClass && selectedClass.jurusan) {
                const mapel = globalSubjects.find(s => 
                    s.kode_mapel.toLowerCase() === selectedClass.jurusan.toLowerCase() ||
                    s.nama_mapel.toLowerCase() === selectedClass.jurusan.toLowerCase()
                );
                if (mapel) mapelId = mapel.id;
            }
            
            // Fallback: if no match, use the first subject available or 1
            if (!mapelId) {
                mapelId = globalSubjects.length > 0 ? globalSubjects[0].id : 1;
            }

            // Multipart FormData Upload
            const formData = new FormData();
            formData.append('judul', title);
            formData.append('deskripsi', desc);
            formData.append('tipe', tipe);
            formData.append('mapel_id', mapelId);
            formData.append('file', file);

            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/materi`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${storage.getToken()}`,
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert('Materi berhasil diunggah!');
                    closeModal();
                    await loadAndRenderMaterials();
                } else {
                    const errorMsg = result.message || 'Gagal menyimpan materi.';
                    const errorsDetail = result.errors ? '\n' + Object.values(result.errors).flat().join('\n') : '';
                    alert(errorMsg + errorsDetail);
                }
            } catch (err) {
                console.error(err);
                alert('Gagal menghubungi server untuk mengunggah materi.');
            }
        });
    }

    // Filter selection handler
    const filterSelect = document.getElementById('filter-class-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            activeClassFilter = e.target.value;
            loadAndRenderMaterials();
        });
    }
});

async function loadInitialData() {
    try {
        // Fetch classes & mapel first
        const [classesRes, mapelRes] = await Promise.all([
            apiClient.get('/kelas'),
            apiClient.get('/mapel')
        ]);

        if (classesRes.success) globalClasses = classesRes.data || [];
        if (mapelRes.success) globalSubjects = mapelRes.data || [];

        populateClassDropdowns();
        await loadAndRenderMaterials();

    } catch (err) {
        console.error('Error loading initial data:', err);
    }
}

function populateClassDropdowns() {
    const filterSelect = document.getElementById('filter-class-select');
    const formSelect = document.getElementById('materi-class');

    if (globalClasses.length === 0) return;

    // 1. Populate Filter select dropdown
    const filterOptions = globalClasses.map(c => `
        <option value="${c.id}">${c.nama_kelas}</option>
    `).join('');
    if (filterSelect) {
        filterSelect.innerHTML = `<option value="semua">Pilih Kelas</option>` + filterOptions;
    }

    // 2. Populate Modal Form select dropdown
    const formOptions = globalClasses.map(c => `
        <option value="${c.id}">${c.nama_kelas}</option>
    `).join('');
    if (formSelect) {
        formSelect.innerHTML = `<option value="" disabled selected>Pilih Kelas</option>` + formOptions;
    }
}

async function loadAndRenderMaterials() {
    const container = document.getElementById('materi-table-body');
    if (!container) return;

    try {
        const response = await apiClient.get('/materi');
        if (response.success && response.data) {
            let materials = response.data;

            // Filter materials by selected class's subject code (jurusan)
            if (activeClassFilter !== 'semua') {
                const selectedClass = globalClasses.find(c => c.id === parseInt(activeClassFilter));
                if (selectedClass && selectedClass.jurusan) {
                    materials = materials.filter(m => 
                        m.mapel && (
                            m.mapel.kode_mapel.toLowerCase() === selectedClass.jurusan.toLowerCase() ||
                            m.mapel.nama_mapel.toLowerCase() === selectedClass.jurusan.toLowerCase()
                        )
                    );
                }
            }

            if (materials.length === 0) {
                container.innerHTML = '<tr><td colspan="4" class="empty-state">Tidak ada materi yang ditemukan.</td></tr>';
                return;
            }

            container.innerHTML = materials.map(m => {
                const subjectTitle = m.mapel ? m.mapel.nama_mapel : 'Materi';
                
                // Format Indonesian Date from created_at
                const dateObj = new Date(m.created_at);
                const months = [
                    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                ];
                const formattedDate = isNaN(dateObj.getTime()) ? '-' : `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

                // Find which class matches this subject to show under "Kelas" column
                const matchedClass = globalClasses.find(c => 
                    c.jurusan && m.mapel && (
                        c.jurusan.toLowerCase() === m.mapel.kode_mapel.toLowerCase() ||
                        c.jurusan.toLowerCase() === m.mapel.nama_mapel.toLowerCase()
                    )
                );
                const gradeDisplay = matchedClass ? matchedClass.tingkat : '-';

                return `
                    <tr>
                        <td style="font-weight: 700;">${subjectTitle}</td>
                        <td style="text-align: center;">
                            <a href="#" class="detail-link" data-id="${m.id}" style="color: #0d52cd; text-decoration: underline; font-weight: 600;">
                                ${m.judul}
                            </a>
                        </td>
                        <td>${gradeDisplay}</td>
                        <td style="color: #4b5563; font-weight: 600;">${formattedDate}</td>
                    </tr>
                `;
            }).join('');

        } else {
            container.innerHTML = '<tr><td colspan="4" class="empty-state" style="color: #ef4444;">Gagal mengambil data materi.</td></tr>';
        }
    } catch (err) {
        console.error('Error fetching materials:', err);
        container.innerHTML = '<tr><td colspan="4" class="empty-state" style="color: #ef4444;">Gagal memuat daftar materi. Pastikan server backend menyala.</td></tr>';
    }
}

async function showMaterialDetail(id) {
    const detailModal = document.getElementById('modal-detail-materi');
    if (!detailModal) return;

    try {
        const response = await apiClient.get(`/materi/${id}`);
        if (response.success && response.data) {
            const m = response.data;
            const subjectTitle = m.mapel ? m.mapel.nama_mapel : 'Materi';

            document.getElementById('detail-materi-title').textContent = m.judul || '-';
            document.getElementById('detail-materi-subject').textContent = subjectTitle;
            document.getElementById('detail-materi-desc').textContent = m.deskripsi || 'Tidak ada deskripsi.';
            
            const filenameEl = document.getElementById('detail-materi-filename');
            const downloadBtn = document.getElementById('detail-materi-download-btn');
            
            if (filenameEl) filenameEl.textContent = m.file_original_name || 'Lihat File';
            if (downloadBtn) {
                downloadBtn.href = m.file_url || '#';
            }

            detailModal.style.display = 'flex';
        } else {
            alert('Gagal memuat detail materi.');
        }
    } catch (err) {
        console.error(err);
        alert('Gagal mengambil detail materi dari server.');
    }
}
