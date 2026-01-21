// --- CẤU HÌNH ---
const amThanhDua = new Audio('nhac_nen.mp3'); 
const amThanhThang = new Audio('thang_cuoc.mp3');
amThanhDua.loop = true; amThanhDua.volume = 0.2; amThanhThang.volume = 1.0;

const btnFullscreen = document.getElementById('btnFullscreen');
const container = document.querySelector('.main-container');
const victoryOverlay = document.getElementById('victory-overlay');
const winnerNameText = document.getElementById('winner-name');
const btnStart = document.getElementById('mainBtn');
const statusText = document.getElementById('status');
const commentaryText = document.getElementById('commentary-text');

let gameLoop; 
let idVitThangCuoc = null; // Biến lưu ID con vịt vừa thắng

const funnyComments = [
    "Trời ơi, con số 3 nó đang bơi hay đang đi dạo vậy?",
    "Các vận động viên đang bám đuổi rất sát!",
    "Một cú bứt tốc thần sầu!",
    "Có vẻ con vịt kia quên ăn sáng rồi...",
    "Kịch tính đến giây phút cuối cùng!",
    "Ai sẽ là nhà vô địch đây??",
    "Nhanh lên nào các em ơi!"
];

// --- 1. FULLSCREEN ---
btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        if(container.requestFullscreen) container.requestFullscreen();
        btnFullscreen.innerText = "✖";
    } else {
        if(document.exitFullscreen) document.exitFullscreen();
        btnFullscreen.innerText = "⛶";
    }
});

// --- 2. HÀM BẮT ĐẦU ĐUA ---
function batDauDua() {
    const soLuongVit = 7;
    
    if (amThanhDua.paused) amThanhDua.play().catch(e=>{});
    amThanhThang.pause(); amThanhThang.currentTime = 0; 

    victoryOverlay.classList.add('hidden');
    btnStart.disabled = true; btnStart.innerText = "ĐANG ĐUA..."; btnStart.style.opacity = "0.7";
    statusText.innerText = "💨 CUỘC ĐUA BẮT ĐẦU!";
    commentaryText.innerText = "Xuất phát!!!";

    const trackWidth = document.querySelector('.race-area').offsetWidth;
    const vachDich = (trackWidth * 0.98) - 20; 

    let danhSachVit = [];
    
    for (let i = 1; i <= soLuongVit; i++) {
        let vitElement = document.getElementById('duck' + i);
        
        // --- LOGIC MỚI: BỎ QUA VỊT ĐÃ BỊ LOẠI ---
        // Nếu vịt có class 'eliminated', thì không cho vào danh sách đua
        if (vitElement && !vitElement.classList.contains('eliminated')) {
            
            let statusIcon = vitElement.querySelector('.status-icon');
            vitElement.style.left = '0px';
            statusIcon.innerText = "";
            
            danhSachVit.push({ 
                id: i, 
                element: vitElement, 
                icon: statusIcon,
                position: 0,
                // Giữ tốc độ chậm (nhân 0.5)
                tocDoRieng: (Math.random() * 1.5) * 0.5,
                trangThai: "binhThuong", 
                demTrangThai: 0 
            });
        }
    }
    
    // Nếu lỡ tay loại hết vịt thì thông báo
    if (danhSachVit.length === 0) {
        statusText.innerText = "HẾT VỊT RỒI! BẤM NÚT ĐỎ ĐỂ HỒI SINH.";
        btnStart.disabled = false;
        btnStart.innerText = "HẾT VỊT";
        return;
    }

    if (gameLoop) clearInterval(gameLoop);

    gameLoop = setInterval(() => {
        
        if (Math.random() < 0.02) {
            let randomComment = funnyComments[Math.floor(Math.random() * funnyComments.length)];
            commentaryText.innerText = "🎤 " + randomComment;
        }

        for (let vit of danhSachVit) {
            
            if (vit.demTrangThai > 0) {
                vit.demTrangThai--; 
                if (vit.demTrangThai <= 0) {
                    vit.trangThai = "binhThuong";
                    vit.icon.innerText = ""; 
                }
            } else {
                let rand = Math.random();
                if (rand < 0.005) { 
                    vit.trangThai = "nguGat";
                    vit.demTrangThai = 30; 
                    vit.icon.innerText = "💤";
                    commentaryText.innerText = `🎤 Vịt số ${vit.id} đang ngủ gật!`;
                } else if (rand > 0.99) { 
                    vit.trangThai = "tangToc";
                    vit.demTrangThai = 40; 
                    vit.icon.innerText = "🔥";
                    commentaryText.innerText = `🎤 Vịt số ${vit.id} bật TÊN LỬA!`;
                }
            }

            let buocNhay = 0;
            if (vit.trangThai === "nguGat") buocNhay = 0; 
            else if (vit.trangThai === "tangToc") buocNhay = 4; // Tốc độ tên lửa chậm
            else {
                let tocDoGoc = 1 + (Math.random() * 2) + vit.tocDoRieng;
                buocNhay = tocDoGoc * 0.4; // Tốc độ thường chậm
            }
            
            vit.position += buocNhay;
            vit.element.style.left = vit.position + 'px';

            if (vit.position >= vachDich) {
                clearInterval(gameLoop); 
                xuLyThang(vit);       
                return;
            }
        }
    }, 50); 
}

// --- 3. XỬ LÝ THẮNG ---
function xuLyThang(vitThang) {
    const flash = document.getElementById('camera-flash');
    if(flash) {
        flash.classList.add('flash-active');
        setTimeout(() => { flash.classList.remove('flash-active'); }, 100);
    }
    amThanhThang.play();

    // Lưu lại ID người thắng để lát nữa xử lý
    idVitThangCuoc = vitThang.id;

    let tenThat = vitThang.element.querySelector('.name-input').value;

    statusText.innerText = "KẾT THÚC!";
    winnerNameText.innerText = tenThat + " VÔ ĐỊCH!";
    commentaryText.innerText = `🎤 Chúc mừng ${tenThat} đã về đích đầu tiên!`;
    
    victoryOverlay.classList.remove('hidden');
    btnStart.disabled = false; btnStart.style.opacity = "1"; btnStart.innerText = "CHƠI VÁN MỚI 🏁";

    if (typeof confetti === "function") {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}

// --- 4. HÀM MỚI: QUYẾT ĐỊNH SỐ PHẬN ---
function quyetDinhSoPhan(loaiBo) {
    if (loaiBo && idVitThangCuoc !== null) {
        // Tìm con vịt thắng và thêm class 'eliminated'
        const vitElement = document.getElementById('duck' + idVitThangCuoc);
        if (vitElement) {
            vitElement.classList.add('eliminated');
        }
    }
    // Đóng bảng thông báo
    victoryOverlay.classList.add('hidden');
}

// HÀM RESET (HỒI SINH TẤT CẢ)
function hoiSinhVit() {
    for (let i = 1; i <= 7; i++) {
        let vitElement = document.getElementById('duck' + i);
        if (vitElement) {
            vitElement.classList.remove('eliminated');
            vitElement.style.left = '0px';
        }
    }
    statusText.innerText = "ĐÃ HỒI SINH TẤT CẢ!";
    btnStart.innerText = "🏁 XUẤT PHÁT! 🏁";
    btnStart.disabled = false;
}

function dongBangThongBao() {
    victoryOverlay.classList.add('hidden');
}

// --- CÁC HÀM PHỤ TRỢ (ĐÊM, MƯA) ---
function toggleNightMode() {
    const body = document.body;
    const btn = document.getElementById('btnNightMode');
    body.classList.toggle('night-mode');
    if (body.classList.contains('night-mode')) {
        btn.innerText = "☀️"; btn.style.background = "#fff"; btn.style.color = "#000";
    } else {
        btn.innerText = "🌙"; btn.style.background = "#555"; btn.style.color = "#fff";
    }
}

function toggleRain() {
    const rain = document.getElementById('rainEffect');
    const body = document.body;
    const btn = document.getElementById('btnRain');
    if (!rain.classList.contains('active')) {
        rain.classList.add('active'); body.classList.add('raining');
        btn.innerText = "🌤️"; btn.style.background = "#007bff";
    } else {
        rain.classList.remove('active'); body.classList.remove('raining');
        btn.innerText = "🌧️"; btn.style.background = "#555";
    }
}