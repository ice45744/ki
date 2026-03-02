// Dark Mode System
function initDarkMode() {
    const body = document.body;
    const isDark = localStorage.getItem('dark-mode') === 'enabled';
    
    if (isDark) {
        body.classList.add('dark-mode');
    }

    const toggles = document.querySelectorAll('#darkModeToggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            body.classList.toggle('dark-mode');
            const enabled = body.classList.contains('dark-mode');
            localStorage.setItem('dark-mode', enabled ? 'enabled' : 'disabled');
            
            // Update icon if it exists in the toggle
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.className = enabled ? 'fas fa-sun text-yellow-500' : 'fas fa-moon text-blue-500';
            }
        });
    });
}

// QR Scanner Modal System
async function initQRScanner() {
    const modal = document.getElementById('qrScannerModal');
    const closeBtn = document.getElementById('closeScannerBtn');
    const scanButtons = document.querySelectorAll('a[href="scan.html"], button:has(.fa-qrcode)');
    
    if (!modal) return;

    let html5QrCode = null;

    const stopScanner = async () => {
        if (html5QrCode && html5QrCode.isScanning) {
            await html5QrCode.stop();
            await html5QrCode.clear();
        }
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    const startScanner = async () => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        document.getElementById('reader-loader').classList.remove('hidden');
        
        try {
            if (!html5QrCode) {
                html5QrCode = new Html5Qrcode("reader-popup");
            }
            
            const config = { fps: 15, qrbox: { width: 250, height: 250 } };
            
            await html5QrCode.start(
                { facingMode: "environment" }, 
                config,
                onScanSuccess
            );
            document.getElementById('reader-loader').classList.add('hidden');
        } catch (err) {
            console.error("Scanner error:", err);
            document.getElementById('reader-loader').innerHTML = `
                <i class="fas fa-camera-slash text-red-400 text-2xl mb-2"></i>
                <p class="text-[10px] text-gray-500">ไม่สามารถเข้าถึงกล้องได้</p>
                <button onclick="location.reload()" class="mt-2 text-[10px] text-blue-600 font-bold underline">ลองอีกครั้ง</button>
            `;
        }
    };

    const onScanSuccess = async (decodedText) => {
        try {
            const data = JSON.parse(decodedText);
            const { auth, db } = await import('./data.js');
            const { doc, updateDoc, increment, addDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            
            const user = auth.currentUser;
            if (!user) {
                showScanResult("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบก่อน", "bg-red-50 text-red-600");
                return;
            }

            if (data.type === 'points') {
                await updateDoc(doc(db, "users", user.uid), {
                    wasteStamps: increment(data.amount || 0)
                });

                await addDoc(collection(db, "transactions"), {
                    userId: user.uid,
                    type: "receive_points",
                    amount: data.amount,
                    activity: data.activity,
                    timestamp: new Date().toISOString()
                });

                showScanResult("สำเร็จ!", `ได้รับ ${data.amount} แสตมป์ (${data.activity})`, "bg-green-50 text-green-600");
                
                // Vibrate if supported
                if (navigator.vibrate) navigator.vibrate(200);
                
                // Close after delay
                setTimeout(stopScanner, 2000);
            }
        } catch (e) {
            console.error("Scan processing error:", e);
            showScanResult("ผิดพลาด", "QR Code ไม่ถูกต้อง", "bg-orange-50 text-orange-600");
        }
    };

    const showScanResult = (title, msg, classes) => {
        const res = document.getElementById('scanResultPopup');
        const icon = document.getElementById('scanIconPopup');
        const t = document.getElementById('scanTitlePopup');
        const m = document.getElementById('scanMsgPopup');

        res.className = `mt-4 p-4 rounded-2xl flex items-center gap-3 animate-bounce-in ${classes}`;
        t.textContent = title;
        m.textContent = msg;
        icon.className = `w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-sm ${classes.replace('50', '100')}`;
        icon.innerHTML = title === 'สำเร็จ!' ? '<i class="fas fa-check"></i>' : '<i class="fas fa-exclamation"></i>';
        res.classList.remove('hidden');
        
        setTimeout(() => res.classList.add('hidden'), 3000);
    };

    scanButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            startScanner();
        });
    });

    closeBtn.addEventListener('click', stopScanner);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    initDarkMode();
    
    // Global Profile Dropdown Logic
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
    }

    // Load QR Modal HTML if not present
    if (!document.getElementById('qrScannerModal')) {
        try {
            const response = await fetch('qr-modal.html');
            if (response.ok) {
                const html = await response.text();
                document.body.insertAdjacentHTML('beforeend', html);
                
                // Load html5-qrcode script if not present
                if (!window.Html5Qrcode) {
                    const script = document.createElement('script');
                    script.src = "https://unpkg.com/html5-qrcode";
                    script.onload = () => initQRScanner();
                    document.head.appendChild(script);
                } else {
                    initQRScanner();
                }
            }
        } catch (e) {
            console.error("Failed to load QR modal:", e);
        }
    }
});