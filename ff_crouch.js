// ============================================
// Free Fire Crouch Toggle - AutoX.js
// Chạm nút nổi 2 lần = BẬT, 3 lần = TẮT
// ============================================

auto.waitFor(); // Chờ cấp quyền Trợ năng

// ============ CẤU HÌNH - SỬA 2 SỐ NÀY ============
// Lấy tọa độ bằng cách bật "Pointer location" trong Developer Options
var CROUCH_X = 1500;     // <-- SỬA X CỦA NÚT NGỒI VÀO ĐÂY
var CROUCH_Y = 800;      // <-- SỬA Y CỦA NÚT NGỒI VÀO ĐÂY
// =================================================

var WINDOW_MS     = 350;    // Thời gian (ms) để tính là "chạm liên tiếp"
var SPAM_INTERVAL = 180;    // Tốc độ nhấp nhả (ms) - Đừng để dưới 100 kẻo bị quét
var modeOn = false;
var spamThread = null;
var taps = [];

// Tạo nút nổi (Floating Button)
var floaty = floaty.window(
    <frame gravity="center">
        <text id="label" text="OFF" textSize="14sp" textColor="#ffffff" bg="#88000000" padding="15"/>
    </frame>
);
// Đặt vị trí nút nổi ban đầu (góc trái)
floaty.setPosition(100, 300);

// Hàm cập nhật giao diện nút nổi
function updateFloaty() {
    ui.run(function() {
        if (modeOn) {
            floaty.label.setText("ON");
            floaty.label.attr("bg", "#88ff0000"); // Màu đỏ khi Bật
        } else {
            floaty.label.setText("OFF");
            floaty.label.attr("bg", "#88000000"); // Màu đen khi Tắt
        }
    });
}

// Xử lý khi chạm vào nút nổi
floaty.label.setOnTouchListener(function(view, event) {
    if (event.getAction() == event.ACTION_DOWN) {
        return true; // Bắt đầu chạm
    }
    if (event.getAction() == event.ACTION_UP) {
        // Kiểm tra xem người dùng có đang KÉO nút không, nếu kéo thì không tính là chạm
        var isDrag = false; 
        // (Auto.js xử lý kéo thả mặc định cho floaty.window, nên ở đây chỉ cần quan tâm ACTION_UP)
        
        var now = Date.now();
        // Lọc các lần chạm cũ
        var keep = [];
        for (var i = 0; i < taps.length; i++) {
            if (now - taps[i] < WINDOW_MS) keep.push(taps[i]);
        }
        taps = keep;
        taps.push(now);
        var n = taps.length;

        if (n == 2 && !modeOn) {
            // BẬT
            modeOn = true;
            updateFloaty();
            startSpam();
            toast("BẬT TỰ ĐỘNG NGỒI");
        } else if (n == 3) {
            // TẮT
            modeOn = false;
            updateFloaty();
            stopSpam();
            taps = []; // Reset
            toast("TẮT TỰ ĐỘNG NGỒI");
        }
        return true;
    }
    return false;
});

// Hàm bật spam ngồi
function startSpam() {
    if (spamThread) return;
    spamThread = threads.start(function() {
        while (modeOn) {
            // Nhấp vào tọa độ nút ngồi (thời gian nhấn 1ms)
            press(CROUCH_X, CROUCH_Y, 1);
            sleep(SPAM_INTERVAL);
        }
    });
}

// Hàm tắt spam
function stopSpam() {
    if (spamThread) {
        modeOn = false;
        spamThread.interrupt();
        spamThread = null;
    }
}

// Vòng lặp giữ script chạy mãi mãi
while (true) {
    sleep(1000);
}
