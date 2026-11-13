---
name: agent-reach-game-upgrader
description: >-
  Quy chuẩn sử dụng Agent-Reach CLI (Panniantong/Agent-Reach) để tìm kiếm, đọc nội dung và trích xuất
  dữ liệu từ Bilibili, YouTube (phụ đề/transcript), XiaoHongShu (Tiểu Hồng Thư), GitHub, Reddit, V2EX
  và Web (0 phí API) nhằm nâng cấp kho từ vựng tiếng Trung HSK/Chuyên ngành và nghiên cứu cơ chế
  gameplay/hiệu ứng mới cho game học tiếng Trung.
---

# Agent-Reach Game Content & Mechanics Upgrader (`agent-reach-game-upgrader`)

Skill này tích hợp bộ công cụ **[Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach)** (`D:\Python312\Scripts\agent-reach.exe`) và script thu hoạch từ vựng [`scripts/reach_vocab_harvester.py`](./scripts/reach_vocab_harvester.py) để giúp AI Agent có "đôi mắt" đọc toàn bộ Internet (Bilibili, XiaoHongShu, YouTube, GitHub, Reddit, V2EX, Web) phục vụ nâng cấp game nhanh chóng.

---

## 1. Các Kênh Agent-Reach Đã Cài Đặt Trên Hệ Thống

Lệnh thực thi chuẩn trên máy:
```powershell
D:\Python312\Scripts\agent-reach.exe <channel> <action> [args]
```
*(Mọi lệnh đều trả về 1 dòng JSON chuẩn xác gồm `{ok, channel, action, items, error}`)*

| Kênh (`channel`) | Lệnh mẫu thường dùng để Nâng cấp Game | Ứng dụng thực tế cho Game Học Tiếng Trung |
| :--- | :--- | :--- |
| **`youtube`** | `agent-reach youtube search "HSK 4 vocabulary" --limit 5`<br>`agent-reach youtube subtitle <video_url> --lang zh-Hans,vi,en` | Tìm video dạy tiếng Trung / HSK và trích xuất toàn bộ phụ đề (subtitles) để tạo Unit từ vựng mới bám sát video thực tế. |
| **`bilibili`** | `agent-reach bilibili search "HSK词汇 记忆" --limit 5`<br>`agent-reach bilibili read <bvid_or_url>` | Săn tài liệu học tiếng Trung bản xứ, từ vựng giao tiếp hiện đại, thành ngữ (成语) và mẹo nhớ chữ Hán trên Bilibili. |
| **`github`** | `agent-reach github search "canvas typing game" --limit 5`<br>`agent-reach github read <owner/repo>` | Nghiên cứu mã nguồn các game bắn chữ (ZType clones, Pinyin shooter, WebAudio synth, Canvas particle effects) để nâng cấp gameplay. |
| **`web`** | `agent-reach web read <url>`<br>`agent-reach read <url>` | Đọc nội dung sạch (qua Jina Reader) từ bất kỳ bài viết tổng hợp từ vựng HSK 1–6 hoặc blog kỹ thuật nào. |
| **`reddit` / `v2ex`** | `agent-reach reddit search "Chinese learning game"`<br>`agent-reach v2ex node programmer` | Khảo sát phản hồi của người học tiếng Trung (r/ChineseLanguage) để tối ưu trải nghiệm học & phản xạ gõ Pinyin. |
| **`xiaohongshu`** | `agent-reach add xiaohongshu`<br>`agent-reach xiaohongshu search "中文学习"` | *(Tùy chọn)* Săn flashcard từ vựng tiếng Trung theo chủ đề đời sống/du lịch/thương mại trên Tiểu Hồng Thư. |

---

## 2. Quy trình 1: Nâng cấp Kho Từ Vựng Tự Động (`Vocab Harvester`)

Khi người dùng yêu cầu: *"Thêm cho anh 1 Unit từ vựng chủ đề Thương mại / Du lịch / HSK 5 / Từ lóng mạng Trung Quốc"* hoặc đưa 1 link YouTube/Bilibili/Web:

### Bước 1: Thu thập nguồn từ vựng bằng `agent-reach` hoặc Script Harvester
Chạy trực tiếp script hỗ trợ đi kèm:
```powershell
# Tìm kiếm trên Bilibili / YouTube / GitHub thông qua Agent-Reach:
D:\Python312\python.exe "d:\app học tiếng trung\.agents\skills\agent-reach-game-upgrader\scripts\reach_vocab_harvester.py" --channel bilibili --query "HSK4 核心词汇" --limit 5

# Hoặc chuyển đổi nhanh danh sách từ thô (Chữ Hán - Pinyin - Nghĩa) thành mã JS chuẩn cho vocabDatabase.js:
D:\Python312\python.exe "d:\app học tiếng trung\.agents\skills\agent-reach-game-upgrader\scripts\reach_vocab_harvester.py" --format-unit "Unit 30: Thương mại & Đàm phán" --stage "Màn 5/46 • Unit 30" --words "合同|hétong|Hợp đồng;谈判|tánpàn|Đàm phán;利润|lìrùn|Lợi nhuận"
```

### Bước 2: Quy tắc Chuẩn hóa Dữ liệu Từ vựng (`vocabDatabase.js`)
Mọi từ vựng đưa vào [`js/data/vocabDatabase.js`](file:///d:/app%20h%E1%BB%8Dc%20ti%E1%BA%BFng%20trung/js/data/vocabDatabase.js) phải tuân thủ:
1. **`hanzi`**: Chữ Hán giản thể chuẩn (1–4 chữ để hiển thị đẹp nhất trên thiên thạch/tàu rơi).
2. **`pinyin`**: Pinyin có dấu thanh điệu chuẩn (ví dụ: `"qiúmí"`, `"lǚyóu"`, `"nǚ'ér"`).
3. **`pinyinClean`**: Chuỗi ASCII chữ thường không dấu (`a-z`), trong đó âm `ü` (`ǖǘǚǜü`) được chuẩn hóa thành `v` (hệ thống `getValidPinyinVariants()` sẽ tự động cho phép người chơi gõ cả `v` lẫn `u`).
4. **`meaning`**: Nghĩa tiếng Việt ngắn gọn, súc tích (2–6 từ) để hiển thị rõ nét khi từ nổ tung trên không trung.

### Bước 3: Kiểm định sau khi thêm từ vựng
Sau khi cập nhật `js/data/vocabDatabase.js`, luôn chạy script kiểm định của skill `browser-mcp-game-qa`:
```powershell
D:\Python312\python.exe "d:\app học tiếng trung\.agents\skills\browser-mcp-game-qa\scripts\offline_game_audit.py"
```

---

## 3. Quy trình 2: Nghiên cứu & Nâng cấp Cơ chế Game Mới (Game Mechanics Upgrade)

Khi người dùng muốn nâng cấp gameplay (ví dụ: thêm Boss cuối màn, thêm vật phẩm đóng băng thời gian, bom nổ toàn màn hình, chế độ nghe âm thanh đoán chữ Hán, bảng xếp hạng):
1. Dùng `agent-reach github search "<từ khóa kỹ thuật>"` hoặc `agent-reach web read <url>` để tham khảo thiết kế chuẩn.
2. Áp dụng kiến trúc mô-đun sạch hiện tại của dự án:
   - Thực thể hiển thị mới (Boss, Power-up, Hạt hiệu ứng) $\rightarrow$ thêm vào [`js/engine/entities.js`](file:///d:/app%20h%E1%BB%8Dc%20ti%E1%BA%BFng%20trung/js/engine/entities.js).
   - Logic vòng lặp, va chạm, tính điểm $\rightarrow$ thêm vào [`js/engine/gameEngine.js`](file:///d:/app%20h%E1%BB%8Dc%20ti%E1%BA%BFng%20trung/js/engine/gameEngine.js) và xuất trạng thái qua `getDebugState()`.
   - Âm thanh Synthesizer / Giọng đọc mới $\rightarrow$ thêm vào [`js/audio/soundEngine.js`](file:///d:/app%20h%E1%BB%8Dc%20ti%E1%BA%BFng%20trung/js/audio/soundEngine.js).
   - Nút bấm HUD / Modal cấu hình $\rightarrow$ thêm vào [`index.html`](file:///d:/app%20h%E1%BB%8Dc%20ti%E1%BA%BFng%20trung/index.html) và [`js/ui/uiController.js`](file:///d:/app%20h%E1%BB%8Dc%20ti%E1%BA%BFng%20trung/js/ui/uiController.js).
3. Kích hoạt skill **`browser-mcp-game-qa`** để chạy Auto-Bot kiểm thử tính năng mới ngay trên trình duyệt.
