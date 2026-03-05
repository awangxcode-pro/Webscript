// =========================================
// FILE: js/script_tools.js
// =========================================

let currentPlatform = null;

// =========================================
// INISIALISASI SIDEBAR
// =========================================
function initToolsSidebar() {
    const sidebar = document.getElementById('sidebarContent');
    if (!sidebar || typeof DL_CONFIG === 'undefined') return;

    sidebar.innerHTML = '';

    let html = `
    <div class="px-6 mb-4 mt-2">
        <div class="text-[9px] font-black text-[#60a5fa] uppercase tracking-[0.2em] opacity-80 mb-1">SYSTEM MODULES</div>
        <div class="h-0.5 w-8 bg-[#60a5fa] rounded-full"></div>
    </div>`;

    DL_CONFIG.tools.forEach(tool => {
        const iconClass = window.getIcon ? window.getIcon(tool.icon) : "fas fa-bolt";

        html += `
        <div onclick="switchTool('${tool.id}', '${tool.name}', '${iconClass}', '${tool.color}')" class="relative overflow-hidden flex items-center gap-4 px-5 py-4 mx-3 rounded-xl cursor-pointer group transition-all duration-300 hover:bg-[#1e3a8a]/20 border border-transparent hover:border-[#60a5fa]/30 mb-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0f172a] border border-[#334155] shadow-lg group-hover:scale-110 transition-transform relative z-10" style="color: ${tool.color};">
                <i class="${iconClass} text-sm"></i>
            </div>
            <div class="flex-1 relative z-10">
                <h4 class="text-[10px] font-black uppercase text-slate-300 group-hover:text-white transition-colors tracking-wide">${tool.name}</h4>
            </div>
            <i class="fas fa-chevron-right absolute right-4 text-[8px] text-slate-600 group-hover:text-white transition-all opacity-50 group-hover:opacity-100"></i>
        </div>`;
    });

    html += `
    <div class="mt-8 px-4 border-t border-[#334155] pt-6 mx-2">
        <a href="../index.html" class="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-white hover:border-[#60a5fa] transition-all text-[9px] font-bold uppercase tracking-widest group">
            <i class="fas fa-power-off group-hover:text-red-400 transition-colors"></i> KEMBALI KE HOME
        </a>
    </div>`;

    sidebar.innerHTML = html;
}

// =========================================
// SWITCH TOOL LOGIC
// =========================================
window.switchTool = (id, name, icon, color) => {
    currentPlatform = id;

    document.getElementById('welcomeState').style.display = 'none';
    const toolState = document.getElementById('toolState');
    toolState.style.display = 'block';

    toolState.style.animation = 'none';
    toolState.offsetHeight;
    toolState.style.animation = 'slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';

    const badge = document.getElementById('activeBadgeText');
    badge.innerHTML = `<i class="${icon} mr-2"></i> ${name}`;
    badge.style.borderColor = color;
    badge.style.color = color;
    badge.style.backgroundColor = color + '1a';
    badge.style.boxShadow = `0 0 20px ${color}30`;

    document.getElementById('urlInput').value = '';
    document.getElementById('resultCard').style.display = 'none';

    if(window.innerWidth < 768) {
        const sb = document.getElementById('sidebar');
        if(sb && sb.classList.contains('active')) toggleMenu();
    }

    if(typeof playSfx === 'function') playSfx('pop');
};

// =========================================
// FETCH DATA (SMART HANDLER)
// =========================================
window.processUrl = async () => {
    const url = document.getElementById('urlInput').value.trim();
    const btn = document.getElementById('processBtn');
    const status = document.getElementById('statusText');

    if (!navigator.onLine) {
        if(typeof showToast === 'function') showToast("Sistem Offline: Periksa koneksi internet Anda!", "warning");
        status.innerText = "OFFLINE MODE";
        return;
    }

    if(!url) {
        if(typeof showToast === 'function') showToast("URL KOSONG!", "info");
        return;
    }
    if(!currentPlatform) {
        if(typeof showToast === 'function') showToast("PILIH TOOLS DULU!", "warning");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
    status.innerText = DL_CONFIG.messages.processing;

    try {
        const apiConfig = DL_CONFIG.apis[currentPlatform];
        let result = null;

        if (apiConfig && apiConfig.key && apiConfig.key !== "ISI_APIKEY_DISINI") {
            const finalUrl = apiConfig.url.replace('{URL}', encodeURIComponent(url)).replace('{KEY}', apiConfig.key);

            const response = await fetch(finalUrl, { method: apiConfig.method });
            if(!response.ok) throw new Error("API Error");
            const data = await response.json();

            result = {
                title: data.title || data.data?.title || "Result Found",
                author: data.author || data.data?.author || "Unknown",
                thumb: data.thumb || data.data?.cover || "https://placehold.co/600x400",
                video: data.url || data.data?.play || data.data?.url,
                links: [
                    { label: "DOWNLOAD MP4", url: data.url || data.data?.play || data.data?.url }
                ]
            };
        }

        if (!result) {
            console.log("Mode Mockup Aktif (API Key kosong atau Response null)");
            await new Promise(r => setTimeout(r, 1500)); 

            result = {
                title: "Example Result: " + currentPlatform.toUpperCase(),
                author: "@AwangSystem",
                thumb: "https://placehold.co/600x400/0f172a/ffffff?text=Video+Loading...",
                video: "https://www.w3schools.com/html/mov_bbb.mp4",
                links: [
                    { label: "DOWNLOAD NO WATERMARK", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
                    { label: "DOWNLOAD AUDIO ONLY", url: "#" }
                ]
            };
        }

        renderResult(result);
        if(typeof showToast === 'function') showToast(DL_CONFIG.messages.success, "success");
        if(typeof playSfx === 'function') playSfx('success');

    } catch (e) {
        console.error(e);
        if(typeof showToast === 'function') showToast(DL_CONFIG.messages.error, "error");
        status.innerText = "ERROR: CHECK CONSOLE";
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-arrow-right"></i>';
        status.innerText = "READY TO PROCESS";
    }
};

function renderResult(data) {
    const videoEl = document.getElementById('resVideo');
    const thumbEl = document.getElementById('resThumb');
    const overlay = document.getElementById('playOverlay');

    if (data.video) {
        videoEl.src = data.video;
        videoEl.classList.remove('hidden');
        thumbEl.style.display = 'none';
        overlay.style.display = 'none';
        videoEl.muted = true;
        videoEl.play().catch(() => {});
    } else {
        videoEl.classList.add('hidden');
        thumbEl.src = data.thumb;
        thumbEl.style.display = 'block';
    }

    document.getElementById('resTitle').innerText = data.title;
    document.getElementById('resAuthor').innerText = data.author;

    const linksContainer = document.getElementById('downloadLinks');
    linksContainer.innerHTML = data.links.map(l => `
        <a href="${l.url}" target="_blank" class="dl-block">
            <div class="flex items-center gap-3">
                <div class="dl-icon"><i class="fas fa-download"></i></div>
                <span class="dl-label">${l.label}</span>
            </div>
            <i class="fas fa-chevron-right text-[10px] text-slate-500"></i>
        </a>
    `).join('');

    const resCard = document.getElementById('resultCard');
    resCard.style.display = 'block';
    resCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

window.addEventListener('load', () => {
    setTimeout(initToolsSidebar, 100);
});
