// ============================================
// Free Fire Crouch Toggle - AutoX.js (Bản OPPO)
// ============================================

auto.waitFor(); // Chờ cấp quyền Trợ năng

// ============ BIẾN LƯU TỌA ĐỘ ============
// Nếu đã lấy tọa độ thành công, nó sẽ lưu ở đây
var CROUCH_X = 1500; 
var CROUCH_Y = 800;  

var WINDOW_MS     = 350;    // Thời gian (ms) để tính là "chạm liên tiếp"
var SPAM_INTERVAL = 180;    // Tốc độ nhấp nhả (ms)
var modeOn = false;
var spamThread = null;
var taps = [];
var isSettingCoord = false;

// Tạo nút nổi
var floaty = floaty.window(
    <frame gravity="center">
        <text id="label" text="OFF" textSize="14sp" textColor="#ffffff" bg="#88000000" padding="15"/>
    </frame>
);
floaty.setPosition(100, 300);

function updateFloaty() {
    ui.run(function() {
        if (isSettingCoord) {
            floaty.label.setText("LẤY TỌA ĐỘ");
            floaty.label.attr("bg", "#88ffff00"); // Màu vàng
        } else if (modeOn) {
            floaty.label.setText("ON");
            floaty.label.attr("bg", "#88ff0000"); // Màu đỏ
        } else {
            floaty.label.setText("OFF");
            floaty.label.attr("bg", "#88000000"); // Màu đen
        }
    });
}

// Xử lý khi chạm vào nút nổi
floaty.label.setOnTouchListener(function(view, event) {
    if (event.getAction() == event.ACTION_DOWN) {
        return true;
    }
    if (event.getAction() == event.ACTION_UP) {
        var now = Date.now();
        var keep = [];
        for (var i = 0; i < taps.length; i++) {
            if (now - taps[i] < WINDOW_MS) keep.push(taps[i]);
        }
        taps = keep;
        taps.push(now);
        var n = taps.length;

        if (n == 2 && !modeOn && !isSettingCoord) {
            modeOn = true;
            updateFloaty();
            startSpam();
            toast("BẬT TỰ ĐỘNG NGỒI");
        } else if (n == 3) {
            if (isSettingCoord) {
                // Bấm 3 lần để HỦY chế độ lấy tọa độ
                isSettingCoord = false;
                updateFloaty();
                toast("Đã hủy lấy tọa độ");
            } else {
                modeOn = false;
                updateFloaty();
                stopSpam();
                toast("TẮT TỰ ĐỘNG NGỒI");
            }
            taps = [];
        } else if (n == 4) {
            // Bấm 4 lần để BẬT chế độ lấy tọa độ
            isSettingCoord = true;
            modeOn = false;
            stopSpam();
            updateFloaty();
            toast("Hãy chạm vào nút NGỒI trong game!");
            taps = [];
        }
        return true;
    }
    return false;
});

// Hàm lắng nghe chạm màn hình để lấy tọa độ (Chỉ chạy khi bật chế độ)
function startCoordinateListener() {
    events.observeTouch(); // Yêu cầu quyền (AutoX sẽ tự xin)
    events.onTouch(function(p) {
        if (!isSettingCoord) return;
        
        // Nếu là hành động nhấc ngón tay lên (ACTION_UP)
        if (p.getAction() == 1) { 
            var x = p.getX();
            var y = p.getY();
            
            // Bỏ qua nếu chạm vào nút nổi (tránh lưu nhầm tọa độ nút nổi)
            if (x > 50 && x < 300 && y > 250 && y < 400) return;

            CROUCH_X = parseInt(x);
            CROUCH_Y = parseInt(y);
            isSettingCoord = false;
            updateFloaty();
            
            toast("Đã lưu tọa độ nút Ngồi:\nX = " + CROUCH_X + "\nY = " + CROUCH_Y);
            
            // Rung nhẹ để báo hiệu
            device.vibrate(200);
        }
    });
}

function startSpam() {
    if (spamThread) return;
    spamThread = threads.start(function() {
        while (modeOn) {
            press(CROUCH_X, CROUCH_Y, 1);
            sleep(SPAM_INTERVAL);
        }
    });
}

function stopSpam() {
    if (spamThread) {
        modeOn = false;
        spamThread.interrupt();
        spamThread = null;
    }
}

// Kích hoạt lắng nghe chạm toàn màn hình
startCoordinateListener();

// Vòng lặp giữ script
while (true) {
    sleep(1000);
}
