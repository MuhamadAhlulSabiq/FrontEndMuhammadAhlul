import { storage } from '../../utils/storage.js';
import { authApi } from '../../api/auth.js';
import { initSidebar } from '../../components/sidebar.js';
import { apiClient } from '../../api/api-client.js';

let activeSubjectFilter = 'semua';
let globalMaterials = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Sidebar
    initSidebar();

    // 1. Initialize user info display
    const user = storage.getUser();
    if (user) {
        const dispName = document.getElementById('user-display-name');
        if (dispName) dispName.textContent = user.name || 'Rohmat';
        
        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=siswa_${user.id || 'seed'}`;
    }

    // 2. Set up logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await authApi.logout();
        });
    }

    // 3. Load Materials from API
    await loadMaterials();

    // 4. Tab filtering listener
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');

            // Set filter key and render
            activeSubjectFilter = tab.dataset.subject;
            renderMaterials();
        });
    });
});

async function loadMaterials() {
    const container = document.getElementById('materials-feed');
    if (!container) return;

    try {
        const response = await apiClient.get('/materi');
        if (response.success && response.data) {
            globalMaterials = response.data;
            renderMaterials();
        } else {
            container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal memuat materi dari server.</div>';
        }
    } catch (err) {
        console.error('Error fetching materials:', err);
        container.innerHTML = '<div class="empty-state" style="color: #ef4444;">Gagal menghubungkan ke server materi.</div>';
    }
}

function getClassCode(subjectName) {
    if (!subjectName) return 'pkn';
    const name = subjectName.toLowerCase();
    if (name.includes('ing') || name.includes('english')) return 'ing';
    if (name.includes('mat') || name.includes('mtk') || name.includes('hitung')) return 'mtk';
    if (name.includes('ipa') || name.includes('sains') || name.includes('fis') || name.includes('kim') || name.includes('bio')) return 'ipa';
    return 'pkn';
}

function renderMaterials() {
    const container = document.getElementById('materials-feed');
    if (!container) return;

    // Filter list based on selected tab subject code
    const filtered = globalMaterials.filter(m => {
        if (activeSubjectFilter === 'semua') return true;
        const classCode = getClassCode(m.mapel ? m.mapel.nama_mapel : '');
        return classCode === activeSubjectFilter;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📂</span>
                <p>Tidak ada materi tersedia untuk kategori ini.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(m => {
        const subjectTitle = m.mapel ? m.mapel.nama_mapel : 'Materi';
        const classCode = getClassCode(subjectTitle);
        const docType = m.tipe === 'gambar' ? 'Gambar' : 'PDF';

        // Format Date
        const dateObj = new Date(m.created_at);
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const timeStr = isNaN(dateObj.getTime()) ? '-' : `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

        return `
            <div class="list-item" onclick="window.open('${m.file_url || '#'}', '_blank')" style="cursor: pointer; animation: fadeIn 0.3s ease;">
                <div class="item-left">
                    <div class="item-icon-box ${classCode}" style="display: flex; align-items: center; justify-content: center; font-weight: 800;">
                        ${classCode === 'mtk' ? '✕' : (classCode === 'ing' ? 'En' : (classCode === 'ipa' ? 'Sci' : 'Pkn'))}
                    </div>
                    <div class="item-details">
                        <h4 style="font-weight: 700; color: #111827;">${m.judul}</h4>
                        <p style="color: #64748b; font-size: 0.85rem; margin-top: 2px;">${subjectTitle}</p>
                    </div>
                </div>
                <div class="item-right">
                    <span class="badge-doc ${docType.toLowerCase()}">${docType}</span>
                    <span class="item-date" style="font-size: 0.85rem; color: #888888;">${timeStr}</span>
                </div>
            </div>
        `;
    }).join('');
}
