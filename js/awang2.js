// =========================================
// FILE: js/awang2.js
// =========================================

import {
    onValue,
    update,
    increment,
    ref,
    get,
    remove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
    getToken
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// =========================================
// MENU HANDLER (TITIK 3)
// =========================================
window.toggleCommentMenu = (id) => {
    if (event) event.stopPropagation();

    const targetMenu = document.getElementById(`menu-${id}`);
    const allMenus = document.querySelectorAll('.dropdown-menu');

    allMenus.forEach(m => {
        if (m.id !== `menu-${id}`) m.classList.remove('active');
    });

    if (targetMenu) {
        targetMenu.classList.toggle('active');
        if(typeof playSfx === 'function') playSfx('pop');
    }
};

window.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
});

// =========================================
// ACTION: DELETE COMMENT
// =========================================
window.deleteComment = (id) => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));

    Swal.fire({
        title: 'Hapus Ulasan?',
        text: "Ulasan yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        background: '#0f172a',
        color: '#f8fafc'
    }).then((result) => {
        if (result.isConfirmed) {
            if (!navigator.onLine && typeof showToast === 'function') {
                showToast("Sistem Offline: Menunggu koneksi untuk menghapus...", "warning");
            }

            let currentData = window.siteData.comments || [];
            if (!Array.isArray(currentData)) currentData = Object.values(currentData);

            const newData = currentData.filter(c => c.id !== id && c.parentId !== id);

            update(window.dbRef, { comments: newData })
                .then(() => {
                    if(typeof showToast === 'function') showToast("Ulasan berhasil dihapus", "success");
                    if(typeof playSfx === 'function') playSfx('success');
                })
                .catch((err) => {
                    console.error(err);
                    if(typeof showToast === 'function') showToast("Gagal menghapus", "info");
                });
        }
    });
};

// =========================================
// ACTION: EDIT COMMENT
// =========================================
window.editComment = (id) => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));

    let currentData = window.siteData.comments || [];
    if (!Array.isArray(currentData)) currentData = Object.values(currentData);

    const target = currentData.find(c => c.id === id);

    if (target) {
        window.editingId = id;
        window.currentParentId = null;

        if(window.openModal) window.openModal();

        const nameInput = document.getElementById('revName');
        const textInput = document.getElementById('revText');
        const titleModal = document.getElementById('modalTitle');
        const submitBtn = document.getElementById('submitReviewBtn');

        if(nameInput) nameInput.value = target.name;
        if(textInput) textInput.value = target.text;

        if(titleModal) {
            titleModal.innerText = "EDIT ULASAN";
            titleModal.style.color = "#fbbf24";
        }
        if(submitBtn) {
            submitBtn.innerText = "UPDATE";
            submitBtn.classList.add("bg-yellow-600");
        }

        if (target.star) {
            window.selectedStar = target.star;
            const starElements = document.querySelectorAll('#starInput span');
            starElements.forEach(s => {
                const v = parseInt(s.getAttribute('data-v'));
                if (v <= target.star) {
                    s.style.color = '#facc15';
                    s.style.transform = 'scale(1.1)';
                } else {
                    s.style.color = '#374151';
                    s.style.transform = 'scale(1)';
                }
            });
        }
        if(typeof playSfx === 'function') playSfx('pop');
    }
};

// =========================================
// ACTION: LOVE COMMENT
// =========================================
window.loveComment = (id) => {
    if (!navigator.onLine && typeof showToast === 'function') {
        showToast("Offline: Perubahan akan disimpan saat online", "warning");
    }

    let currentData = window.siteData.comments || [];
    if (!Array.isArray(currentData)) currentData = Object.values(currentData);

    const updatedData = currentData.map(c => {
        if (c.id === id) {
            return { ...c, adminLoved: !c.adminLoved };
        }
        return c;
    });

    update(window.dbRef, { comments: updatedData });
    if(typeof playSfx === 'function') playSfx('pop');
};

// =========================================
// ACTION: PIN COMMENT
// =========================================
window.pinComment = (id) => {
    if (!navigator.onLine && typeof showToast === 'function') {
        showToast("Offline: Perubahan akan disimpan saat online", "warning");
    }

    let currentData = window.siteData.comments || [];
    if (!Array.isArray(currentData)) currentData = Object.values(currentData);

    const targetComment = currentData.find(c => c.id === id);
    const willBePinned = targetComment ? !targetComment.isPinned : false;

    const updatedData = currentData.map(c => {
        if (c.id === id) {
            return { ...c, isPinned: willBePinned };
        } else {
            return { ...c, isPinned: false };
        }
    });

    update(window.dbRef, { comments: updatedData });

    if(willBePinned) {
        if(typeof playSfx === 'function') playSfx('success');
    } else {
        if(typeof playSfx === 'function') playSfx('pop');
    }
};

// =========================================
// REPLY LOGIC
// =========================================
window.replyComment = (parentId, name) => {
    window.currentParentId = parentId;
    window.editingId = null;

    if(window.openModal) window.openModal();

    const textInput = document.getElementById('revText');
    const titleModal = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitReviewBtn');

    if(textInput) {
        textInput.value = `@${name} `;
        textInput.placeholder = `Membalas @${name}...`;
        textInput.focus();
    }
    if(titleModal) {
        titleModal.innerText = `BALAS ${name.toUpperCase()}`;
        titleModal.style.color = "#60a5fa";
    }
    if(submitBtn) {
        submitBtn.innerText = "KIRIM BALASAN";
        submitBtn.classList.remove("bg-yellow-600");
    }
};

// =========================================
// DOWNLOAD TRACKER
// =========================================
window.trackDownload = (id, link) => {
    if(link && link !== "#") {
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        if(typeof showToast === 'function') showToast("Link error / kosong", "info");
    }

    try {
        if(window.dbRef && navigator.onLine) {
            const updates = {};
            updates[`scriptDownloads/${id}`] = increment(1);
            update(window.dbRef, updates).catch(()=>{});
        }
    } catch(e) {
        console.warn("Track download fail (offline?)");
    }
};

window.executeDownload = (id, link) => {
    Swal.close();
    window.trackDownload(id, link);
};

// =========================================
// LIKE/DISLIKE ENGINE
// =========================================
window.handleEngagement = (id, type, counterId) => {
    if (!navigator.onLine && typeof showToast === 'function') {
        showToast("Offline: Interaksi ditunda", "warning");
    }

    let myInts = JSON.parse(localStorage.getItem('my_ints_v4') || '{}');

    let currentData = window.siteData.comments || [];
    if (!Array.isArray(currentData)) currentData = Object.values(currentData);

    const updated = currentData.map(c => {
        if(c.id === id) {
            if(myInts[id] === type) {
                c[type === 'like' ? 'likes' : 'dislikes'] = Math.max(0, (c[type === 'like' ? 'likes' : 'dislikes'] || 0) - 1);
                delete myInts[id];
            } else {
                if(myInts[id]) {
                    const prevType = myInts[id];
                    c[prevType === 'like' ? 'likes' : 'dislikes'] = Math.max(0, (c[prevType === 'like' ? 'likes' : 'dislikes'] || 0) - 1);
                }
                c[type === 'like' ? 'likes' : 'dislikes'] = (c[type === 'like' ? 'likes' : 'dislikes'] || 0) + 1;
                myInts[id] = type;
            }
        }
        return c;
    });

    localStorage.setItem('my_ints_v4', JSON.stringify(myInts));
    update(window.dbRef, { comments: updated });
    if(typeof playSfx === 'function') playSfx('pop');
};

// =========================================
// RENDER DISPATCHER
// =========================================
window.renderScripts = (data) => {
    const list = document.getElementById('scriptList');
    if(!list) return;

    requestAnimationFrame(() => {
        const isScPage = list.closest('.sc-container') !== null;
        if(isScPage) {
            if (window.renderScPageScripts) window.renderScPageScripts(data);
        } else {
            if (window.renderHomeScripts) window.renderHomeScripts(data);
        }
    });
};

// =========================================
// TOGGLE REPLY LIST
// =========================================
window.toggleReplies = (id) => {
    const el = document.getElementById(`replies-${id}`);
    const icon = document.querySelector(`#reply-toggle-${id} i`);

    if (el) {
        if (el.classList.contains('hidden')) {
            el.classList.remove('hidden');
            if(window.openReplyIds) window.openReplyIds.add(id);
            if(icon) { icon.classList.remove('fa-caret-down'); icon.classList.add('fa-caret-up'); }
        } else {
            el.classList.add('hidden');
            if(window.openReplyIds) window.openReplyIds.delete(id);
            if(icon) { icon.classList.remove('fa-caret-up'); icon.classList.add('fa-caret-down'); }
        }
        if(typeof playSfx === 'function') playSfx('pop');
    }
};

// =========================================
// UNLOCK SYSTEM
// =========================================
window.initUnlockProcess = (id, downloadLink) => {
    const sys = CONFIG.unlockSystem;
    const tasks = sys.tasks || [];
    window.unlockState = {};
    tasks.forEach(t => { window.unlockState[t.id] = false; });

    let tasksHtml = '';
    tasks.forEach(t => {
        let iconClass = 'fas fa-link';
        if(t.icon === 'yt') iconClass = 'fab fa-youtube';
        if(t.icon === 'wa') iconClass = 'fab fa-whatsapp';
        if(t.icon === 'bullhorn') iconClass = 'fas fa-bullhorn';
        if(t.icon === 'heart') iconClass = 'fas fa-heart';

        let colorHex = '#60a5fa';
        if(t.color === 'red') colorHex = '#ef4444';
        if(t.color === 'green') colorHex = '#22c55e';
        if(t.color === 'blue') colorHex = '#3b82f6';
        if(t.color === 'pink') colorHex = '#ec4899';

        tasksHtml += `
        <div class="ul-task-card p-3 rounded-xl flex items-center gap-4 cursor-pointer group" id="task-${t.id}" onclick="handleTask('${t.id}', '${t.url}')">
            <div class="w-10 h-10 rounded-lg bg-[#020617] flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform" style="color: ${colorHex}; border-color: ${colorHex}30;">
                <i class="${iconClass} text-lg"></i>
            </div>
            <div class="flex-1">
                <div class="text-[#f8fafc] text-[10px] font-black uppercase group-hover:text-[#60a5fa] transition-colors">${t.title}</div>
                <div class="text-[#64748b] text-[8px] font-bold">${t.subtitle}</div>
            </div>
            <div class="w-12 py-1.5 rounded-lg bg-[#1e293b] flex items-center justify-center text-[#60a5fa] text-[8px] font-black uppercase border border-[#60a5fa]/20" id="btn-${t.id}">${t.btnText}</div>
        </div>`;
    });

    const customStyles = `
    <style>
        .ul-task-card { background: linear-gradient(145deg, #0f172a, #1e293b); border: 1px solid rgba(148, 163, 184, 0.1); transition: all 0.3s; margin-bottom: 8px; }
        .ul-task-card.completed { background: linear-gradient(145deg, #0f291e, #143828); border-color: #22c55e; }
        .ul-progress-bg { background: #1e293b; border-radius: 99px; height: 6px; width: 100%; overflow:hidden; }
        .ul-progress-fill { background: linear-gradient(90deg, #60a5fa, #3b82f6); height: 100%; width: 0%; transition: width 0.5s ease; }
    </style>`;

    Swal.fire({
        html: `${customStyles}<div class="text-left mt-2"><div class="flex flex-col items-center justify-center mb-6 relative"><div class="w-20 h-20 rounded-full bg-[#0f172a] border-4 border-[#1e293b] flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10"><i class="fas fa-lock text-3xl text-[#60a5fa] animate-pulse" id="main-lock-icon"></i></div><h3 class="mt-4 text-[#f8fafc] font-black text-sm uppercase tracking-[0.2em]">${sys.headerTitle}</h3><p class="text-[#94a3b8] text-[9px] mt-1">${sys.headerSubtitle}</p></div><div class="mb-6 px-2"><div class="flex justify-between text-[9px] font-bold text-[#60a5fa] mb-1"><span>PROGRESS</span><span id="progress-text">0%</span></div><div class="ul-progress-bg"><div class="ul-progress-fill" id="progress-bar"></div></div></div><div class="space-y-2">${tasksHtml}</div><div class="mt-6"><button id="final-dl-btn" disabled onclick="window.executeDownload('${id}', '${downloadLink}')" class="w-full py-4 rounded-xl bg-[#020617] border-2 border-[#1e293b] text-[#475569] font-black uppercase text-[12px] tracking-widest cursor-not-allowed transition-all relative overflow-hidden"><span class="relative z-10 flex items-center justify-center gap-3"><i class="fas fa-lock" id="dl-icon"></i> <span id="dl-text">LOCKED</span></span></button></div></div>`,
        background: '#020617',
        showConfirmButton: false,
        showCloseButton: true,
        width: 400
    });
};

window.handleTask = (key, url) => {
    if (window.unlockState[key]) return;

    if (url) window.open(url, '_blank');

    window.unlockState[key] = true;
    const card = document.getElementById(`task-${key}`);
    const btn = document.getElementById(`btn-${key}`);

    if (card) card.classList.add('completed');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-check text-white"></i>';
        btn.className = "w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center shadow-none border-none";
    }
    if(typeof playSfx === 'function') playSfx('pop');

    const s = window.unlockState;
    const total = Object.keys(s).length;
    const done = Object.values(s).filter(v => v).length;
    const percent = Math.round((done / total) * 100);
    const bar = document.getElementById('progress-bar');
    const txt = document.getElementById('progress-text');

    if(bar) bar.style.width = `${percent}%`;
    if(txt) txt.innerText = `${percent}%`;

    if (done === total) {
        const dlBtn = document.getElementById('final-dl-btn');
        const dlIcon = document.getElementById('dl-icon');
        const dlText = document.getElementById('dl-text');
        const mainIcon = document.getElementById('main-lock-icon');

        if(mainIcon) {
            mainIcon.className = "fas fa-unlock-alt text-3xl text-[#22c55e] animate-bounce";
            mainIcon.parentElement.style.borderColor = "#22c55e";
        }

        if (dlBtn) {
            dlBtn.disabled = false;
            dlBtn.className = "w-full py-4 rounded-xl bg-gradient-to-r from-[#60a5fa] to-[#2563eb] text-white font-black uppercase text-[12px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all cursor-pointer animate-pulse border-none";
            dlIcon.className = "fas fa-download animate-bounce";
            dlText.innerText = "DOWNLOAD FILE";
            if(typeof playSfx === 'function') playSfx('success');
        }
    }
};
