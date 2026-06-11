// Bilgisayar tarayıcı modül (Node.js tarafında çalışacak - Electron veya benzeri için)
window.scannerAPI = (function() {
    // Hedef: hile yazılımları, cheat engine, otomatikleştiriciler, oyun hileleri
    const suspiciousProcesses = [
        'cheatengine.exe', 'trainer.exe', 'aimbot.exe', 'wallhack.exe',
        'autoit3.exe', 'autohotkey.exe', 'pixelbot.exe', 'triggertool.exe',
        'fivemcheat.exe', 'nexor.exe', 'redengine.exe', 'luna.exe',
        'fivemhook.dll', 'injector.exe', 'extremeinjector.exe', 'processhacker.exe'
    ];
    
    const suspiciousRegistryKeys = [
        'Cheat Engine', 'AutoHotkey', 'AutoIt v3', 'FiveM Cheat', 'Nexor'
    ];
    
    const suspiciousFolders = [
        'C:\\Program Files\\Cheat Engine',
        'C:\\Users\\%USERNAME%\\Desktop\\Cheats',
        'C:\\Users\\%USERNAME%\\Downloads\\Trainers',
        'C:\\FivemCheats'
    ];
    
    // Node.js fs ve child_process modülleri (Electron ortamında)
    async function scanFileSystem() {
        return new Promise((resolve) => {
            // Electron'da IPC ile ana süreçten dosya taraması yapılır
            if (window.require) {
                const fs = window.require('fs');
                const path = window.require('path');
                const os = window.require('os');
                const homedir = os.homedir();
                
                let found = [];
                let drive = process.platform === 'win32' ? 'C:\\' : '/';
                // Kısıtlı tarama (performans için sadece belirli dizinler)
                const scanDirs = [
                    homedir + '\\Desktop',
                    homedir + '\\Downloads',
                    homedir + '\\AppData\\Local',
                    'C:\\Program Files',
                    'C:\\Program Files (x86)'
                ];
                
                for (let dir of scanDirs) {
                    if (fs.existsSync(dir)) {
                        try {
                            const files = fs.readdirSync(dir);
                            for (let file of files) {
                                let lowerFile = file.toLowerCase();
                                for (let bad of suspiciousProcesses) {
                                    if (lowerFile.includes(bad.toLowerCase().replace('.exe','')) || lowerFile === bad.toLowerCase()) {
                                        found.push(file);
                                    }
                                }
                            }
                        } catch(e) {}
                    }
                }
                resolve(found);
            } else {
                resolve([]);
            }
        });
    }
    
    async function scanRunningProcesses() {
        return new Promise((resolve) => {
            if (window.require) {
                const { exec } = window.require('child_process');
                let command = '';
                if (process.platform === 'win32') {
                    command = 'tasklist /FO CSV /NH';
                } else {
                    command = 'ps aux';
                }
                
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        resolve([]);
                        return;
                    }
                    let found = [];
                    let output = stdout.toLowerCase();
                    for (let proc of suspiciousProcesses) {
                        if (output.includes(proc.toLowerCase())) {
                            found.push(proc);
                        }
                    }
                    resolve(found);
                });
            } else {
                resolve([]);
            }
        });
    }
    
    async function fullScan() {
        let processes = await scanRunningProcesses();
        let files = await scanFileSystem();
        
        let allCheats = [...new Set([...processes, ...files])];
        
        // Sonucu siteye gönder
        window.parent.postMessage({
            type: 'SCAN_RESULT',
            data: {
                cheatsFound: allCheats,
                suspiciousApps: processes,
                timestamp: Date.now()
            }
        }, '*');
        
        return { cheatsFound: allCheats };
    }
    
    return {
        startScan: function() {
            document.getElementById('notification').innerHTML = '🔍 Tarama başladı, lütfen bekleyin...';
            fullScan().then(result => {
                console.log('Tarama tamamlandı:', result);
            }).catch(err => {
                document.getElementById('notification').innerHTML = '<span class="red-alert">❌ Tarama hatası!</span>';
            });
        }
    };
})();

// Bildirim: Sayfa yüklendiğinde scanner hazır
console.log('Scanner modülü yüklendi - Electron ortamında çalışması için require desteği gerekli');
