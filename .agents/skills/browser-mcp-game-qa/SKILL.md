---
name: browser-mcp-game-qa
description: >-
  Quy chuẩn kiểm thử tự động tốc độ cao (Turbo Automated QA <25ms), giả lập chơi game (Auto-PlayBot / Time-Warp),
  bắt lỗi Console/Network và kiểm định giao diện Canvas/HUD cho game web (đặc biệt là HSK Space Shooter trong
  d:\app học tiếng trung) bằng sự kết hợp giữa BrowserMCP (@browsermcp/mcp), Chrome DevTools MCP và window.GameQA.
  Sử dụng skill này mỗi khi thêm tính năng mới, thêm bộ từ vựng HSK, sửa lỗi cơ chế bắn chữ hoặc kiểm thử game.
---

# BrowserMCP & Chrome DevTools High-Speed Game QA Skill (`browser-mcp-game-qa`)

Skill này tích hợp **[BrowserMCP/mcp](https://github.com/BrowserMCP/mcp)** (`@browsermcp/mcp`) cùng **Chrome DevTools MCP** (`chrome-devtools-mcp`) và module kiểm thử tốc độ cao [`js/qa/gameQaSuite.js`](file:///d:/app%20h%E1%BB%8Dc%20ti%E1%BA%BFng%20trung/js/qa/gameQaSuite.js) (`window.GameQA`) để tự động hóa 100% quy trình kiểm thử và nâng cấp game với độ trễ cực thấp (**< 25ms**).

---

## 1. 4 Quy Tắc Tăng Tốc Điều Khiển MCP Gấp 10 Lần (BẮT BUỘC TUÂN THỦ)

Để tránh tình trạng MCP thao tác chậm từng bước trên trình duyệt, AI Agent **BẮT BUỘC** áp dụng 4 quy tắc tối ưu tốc độ sau:

### Quy tắc 1: Luôn truyền `"waitForStableDom": false` khi gọi `chrome-devtools` `evaluate_script`
- Game HTML5 Canvas chạy vòng lặp `requestAnimationFrame` 60fps liên tục. Nếu để mặc định `waitForStableDom: true`, mỗi lệnh `evaluate_script` sẽ bị treo chờ 2–4 giây.
- **Bắt buộc**: Luôn đặt `"waitForStableDom": false` trong `evaluate_script` để lệnh trả về trong **~15ms**.

### Quy tắc 2: Gộp nhiều thao tác vào 1 lệnh duy nhất (`Single-Call Batching`)
- **Với `browsermcp` (tool `browser`)**: Tuyệt đối KHÔNG gọi rời rạc từng lệnh `click`, `press`, `wait`, `snapshot` qua nhiều lượt (turns). Hãy gom toàn bộ kịch bản vào **1 chuỗi `commands` nhiều dòng duy nhất**:
  ```text
  goto http://localhost:8088
  eval "() => window.GameQA.runMacro([{ cmd: 'audit' }, { cmd: 'turboShoot', count: 5 }])"
  snapshot -i --depth 2
  ```
- **Với `chrome-devtools` (`evaluate_script`)**: Dùng `window.GameQA.runMacro([...])` để thực thi chuỗi 5–10 hành động (kiểm định, đổi chế độ, bắn hạ từ, diệt Boss, mở Modal) chỉ trong **1 lần gọi MCP duy nhất (< 25ms)**.

### Quy tắc 3: Dùng `Time-Warp Simulation` (`turboClearWords` / `turboCompleteUnit`) thay vì chờ thời gian thực
- Không bao giờ chờ từ rơi tự nhiên 2.1 giây/từ hoặc gõ từng ký tự qua 25 lệnh `press_key`.
- Gọi trực tiếp `window.GameQA.turboClearWords(5)` (bắn nổ 5 từ đồng bộ trong `<15ms`) hoặc `window.GameQA.turboCompleteUnit()` (hoàn thành cả màn 25 từ + hạ Boss 3 giáp trong `<25ms`).

### Quy tắc 4: Chạy Binary `node.exe` Trực tiếp (Zero `npx` Overhead)
- Trong [`C:\Users\ADMIN\.gemini\config\mcp_config.json`](file:///C:/Users/ADMIN/.gemini/config/mcp_config.json), cả `chrome-devtools` và `browsermcp` đều đã được trỏ trực tiếp tới `C:\Program Files\nodejs\node.exe` và file JS đã cài sẵn trong `node_modules` kèm cờ `--no-usage-statistics --no-performance-crux --no-source-maps`, loại bỏ hoàn toàn 5–8 giây khởi động của `npx`.

---

## 2. Quy trình Kiểm thử Game Siêu Tốc (3 Bước — Tổng thời gian < 3 Giây)

### Bước 1: Chạy Offline Audit Tĩnh (< 0.5 Giây)
Kiểm tra cú pháp toàn bộ 7 file JS (`node --check`), đối chiếu 20 ID DOM trong `index.html` và kiểm định toàn bộ từ vựng HSK trong `vocabDatabase.js`:
```powershell
D:\Python312\python.exe "d:\app học tiếng trung\.agents\skills\browser-mcp-game-qa\scripts\offline_game_audit.py"
```

### Bước 2: Thực thi Macro Kiểm thử Toàn diện 1-Lệnh trên Trình duyệt (< 25ms)
Gọi `evaluate_script` (với `waitForStableDom: false`) hoặc `browser` `eval`:
```javascript
() => window.GameQA.runMacro([
  { cmd: "audit" },
  { cmd: "turboShoot", count: 5 },
  { cmd: "peek" }
])
```
Hoặc hoàn thành ngay lập tức toàn bộ màn chơi (bao gồm cả Boss cuối màn) để kiểm tra Modal Tổng kết (`#modal-unit-complete`):
```javascript
() => window.GameQA.turboCompleteUnit()
```

### Bước 3: Phím tắt Tốc độ Cao trong Game (Dành cho Người dùng & Dev)
- **`Alt + T`** (**Turbo Clear 5 từ**): Bắn hạ tức thì 5 từ liên tiếp (kể cả Boss) trong `<15ms` mà không cần chờ từ rơi.
- **`Alt + B`** (**Auto-Play Bot 55ms/phím**): Bật/tắt tàu tự động ngắm và bắn mượt mà.
- **`Alt + Q`** (**Instant QA Audit**): Chạy kiểm định 6 bước và hiện thông báo kết quả ngay trên màn hình.
