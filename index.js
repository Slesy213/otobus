// Pin oluşturucu ve bildirim sistemi
let currentPin = null;
let scanResult = null;

// Rastgele 8 haneli PIN oluştur
function generatePin() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// PIN oluşturma butonu
document.getElementById('genPinBtn').addEventListener('click', () => {
    currentPin = generatePin();
    document.getElementById('notification').innerHTML = `
        ✅ Yeni PIN oluşturuldu: <strong style="color:#ff0000;">${currentPin}</strong><br>
        Bu PIN'i kullanıcıya gönderin.
    `;
    // PIN'i sessionStorage'a kaydet
    sessionStorage.setItem('expectedPin', currentPin);
    sessionStorage.setItem('scanCompleted', 'false');
});

// Doğrulama butonu
document.getElementById('verifyBtn').addEventListener('click', () => {
    const enteredPin = document.getElementById('pinInput').value;
    const expectedPin = sessionStorage.getItem('expectedPin');
    
    if (!expectedPin) {
        document.getElementById('notification').innerHTML = '<span class="red-alert">❌ Önce PIN oluşturun!</span>';
        return;
    }
    
    if (enteredPin === expectedPin) {
        document.getElementById('notification').innerHTML = '✅ PIN doğrulandı! Tarama başlatılıyor...';
        // Tarama başlatma sinyali
        if (window.scannerAPI && window.scannerAPI.startScan) {
            window.scannerAPI.startScan();
        } else {
            document.getElementById('notification').innerHTML = '<span class="red-alert">⚠️ Tarayıcı modülü yüklenemedi!</span>';
        }
    } else {
        document.getElementById('notification').innerHTML = '<span class="red-alert">❌ Hatalı PIN! Tekrar deneyin.</span>';
    }
});

// Scanner'dan gelecek bildirimleri dinle
window.addEventListener('message', (event) => {
    if (event.data.type === 'SCAN_RESULT') {
        scanResult = event.data.data;
        const notifDiv = document.getElementById('notification');
        
        if (scanResult.cheatsFound && scanResult.cheatsFound.length > 0) {
            notifDiv.innerHTML = `<span class="red-alert">🚨 HİLE TESPİT EDİLDİ! 🚨<br>Bulunanlar: ${scanResult.cheatsFound.join(', ')}</span>`;
        } else if (scanResult.suspiciousApps && scanResult.suspiciousApps.length > 0) {
            notifDiv.innerHTML = `<span class="red-alert">⚠️ Şüpheli Uygulamalar: ${scanResult.suspiciousApps.join(', ')}</span>`;
        } else {
            notifDiv.innerHTML = `<span class="red-alert">✅ Temiz sistem, hile bulunamadı.</span>`;
        }
        
        sessionStorage.setItem('scanCompleted', 'true');
    }
});
