/**
 * Curriculum Knowledge Base: Radicals (Bộ thủ), Character Decomposition (Chiết tự),
 * Grammar Points (Ngữ pháp), Contextual Dialogues (Hội thoại) & Placement Test (Kiểm tra đầu vào).
 */
window.CurriculumMeta = (function () {
    const CORE_RADICALS = [
        { radical: "亻", alt: "人", pinyin: "rén", hv: "Nhân đứng", meaning: "Con người, hành động của người", examples: "你, 他, 们, 休, 住, 作" },
        { radical: "女", alt: "", pinyin: "nǚ", hv: "Nữ", meaning: "Phụ nữ, phái nữ, gia đình", examples: "好, 妈, 她, 姐, 妹, 姓" },
        { radical: "口", alt: "", pinyin: "kǒu", hv: "Khẩu", meaning: "Miệng, lời nói, ăn uống", examples: "吃, 喝, 吗, 呢, 叫, 听" },
        { radical: "讠", alt: "言", pinyin: "yán", hv: "Ngôn", meaning: "Ngôn ngữ, lời nói, giao tiếp", examples: "请, 谢, 说, 话, 语, 读, 课" },
        { radical: "氵", alt: "水", pinyin: "shuǐ", hv: "Chấm thủy", meaning: "Nước, chất lỏng, dòng chảy", examples: "汉, 没, 洗, 河, 海, 汤, 酒" },
        { radical: "扌", alt: "手", pinyin: "shǒu", hv: "Tài gẩy (Thủ)", meaning: "Bàn tay, động tác tay", examples: "打, 找, 换, 拿, 报, 按" },
        { radical: "心", alt: "忄", pinyin: "xīn", hv: "Tâm", meaning: "Trái tim, tâm tư, cảm xúc", examples: "想, 您, 忙, 快, 慢, 懂, 情" },
        { radical: "日", alt: "", pinyin: "rì", hv: "Nhật", meaning: "Mặt trời, ngày, thời gian, ánh sáng", examples: "明, 早, 晚, 时, 昨, 星, 晴" },
        { radical: "月", alt: "", pinyin: "yuè", hv: "Nguyệt / Nhục", meaning: "Mặt trăng, tháng (hoặc cơ thể)", examples: "月, 明, 期, 朋, 服, 胖" },
        { radical: "木", alt: "", pinyin: "mù", hv: "Mộc", meaning: "Cây cối, gỗ", examples: "本, 休, 林, 森, 校, 桌, 楼" },
        { radical: "艹", alt: "艸", pinyin: "cǎo", hv: "Thảo đầu", meaning: "Cỏ cây, hoa lá, thảo dược", examples: "茶, 花, 苹, 药, 菜, 蓝" },
        { radical: "钅", alt: "金", pinyin: "jīn", hv: "Kim", meaning: "Kim loại, tiền bạc", examples: "钱, 银, 钟, 错, 铁" },
        { radical: "饣", alt: "食", pinyin: "shí", hv: "Thực", meaning: "Thức ăn, ẩm thực", examples: "饭, 饺, 饿, 馆, 饱" },
        { radical: "辶", alt: "", pinyin: "chuò", hv: "Quai xước", meaning: "Bước đi, di chuyển, khoảng cách", examples: "这, 那, 远, 近, 进, 送, 还" },
        { radical: "宀", alt: "", pinyin: "mián", hv: "Miên", meaning: "Mái nhà, che chở", examples: "家, 字, 安, 宿, 室, 完" },
        { radical: "门", alt: "門", pinyin: "mén", hv: "Môn", meaning: "Cánh cửa, cổng", examples: "门, 问, 间, 闻" },
        { radical: "土", alt: "", pinyin: "tǔ", hv: "Thổ", meaning: "Đất đai, nơi chốn", examples: "在, 坐, 地, 城, 场" },
        { radical: "火", alt: "灬", pinyin: "huǒ", hv: "Hỏa", meaning: "Ngọn lửa, nhiệt, nấu nướng", examples: "火, 热, 点, 照, 然" },
        { radical: "目", alt: "", pinyin: "mù", hv: "Mục", meaning: "Đôi mắt, nhìn ngắm", examples: "看, 睡, 眼, 睛" },
        { radical: "足", alt: "⻊", pinyin: "zú", hv: "Túc", meaning: "Bàn chân, chạy nhảy", examples: "跑, 路, 踢, 跟, 跳" },
        { radical: "车", alt: "車", pinyin: "chē", hv: "Xa", meaning: "Xe cộ, phương tiện", examples: "车, 辆, 轻, 较" },
        { radical: "钅", alt: "", pinyin: "jīn", hv: "Kim", meaning: "Vàng bạc, kim khí", examples: "钱, 银, 银行" },
        { radical: "礻", alt: "示", pinyin: "shì", hv: "Thị", meaning: "Lễ nghi, chúc phúc", examples: "祝, 礼, 社, 神" },
        { radical: "衤", alt: "衣", pinyin: "yī", hv: "Y", meaning: "Quần áo, trang phục", examples: "衬, 衫, 裤, 裙" },
        { radical: "疒", alt: "", pinyin: "nè", hv: "Nạch", meaning: "Bệnh tật, triệu chứng đau", examples: "病, 疼, 瘦, 痛" },
        { radical: "贝", alt: "貝", pinyin: "bèi", hv: "Bối", meaning: "Vỏ sò cổ, tiền tài, mua bán", examples: "贵, 买, 卖, 货, 费" },
        { radical: "彳", alt: "", pinyin: "chì", hv: "Xích", meaning: "Bước chân nhỏ, đường phố", examples: "很, 得, 往, 行" },
        { radical: "阝", alt: "", pinyin: "fù", hv: "Ấp / Phụ", meaning: "Vùng đất, gò đồi, tòa nhà", examples: "院, 阳, 际, 都, 邮" }
    ];

    const CHAR_MNEMONICS = {
        "好": { radical: "女 (Nữ)", tip: "女 (người mẹ) + 子 (đứa con): Mẹ có con bên cạnh là điều TỐT ĐẸP nhất." },
        "你": { radical: "亻 (Nhân đứng)", tip: "亻 (con người) + 尔: Người đang đứng đối diện nói chuyện chính là BẠN." },
        "您": { radical: "心 (Tâm)", tip: "你 (bạn) đặt trên 心 (trái tim): Cách gọi NGÀI đầy kính trọng từ đáy lòng." },
        "我": { radical: "戈 (Qua)", tip: "Tay cầm vũ khí bảo vệ bản thân — đại từ TÔI." },
        "他": { radical: "亻 (Nhân đứng)", tip: "亻 (người) + 也: Người nam giới thứ ba — ANH ẤY." },
        "她": { radical: "女 (Nữ)", tip: "女 (phái nữ) + 也: Người phụ nữ thứ ba — CÔ ẤY." },
        "们": { radical: "亻 (Nhân đứng)", tip: "亻 (người) bước qua 门 (cánh cổng) đông đúc — hậu tố chỉ SỐ NHIỀU." },
        "妈": { radical: "女 (Nữ)", tip: "女 (người phụ nữ, gợi nghĩa) + 马 (ngựa, gợi âm ma) → MẸ." },
        "爸": { radical: "父 (Phụ)", tip: "父 (người cha, gợi nghĩa) + 巴 (gợi âm ba) → BỐ." },
        "明": { radical: "日 (Nhật)", tip: "日 (Mặt trời) + 月 (Mặt trăng) cùng chiếu rọi → SÁNG SỦA / NGÀY MAI." },
        "休": { radical: "亻 (Nhân đứng)", tip: "亻 (người) tựa lưng vào 木 (gốc cây) → NGHỈ NGƠI." },
        "看": { radical: "目 (Mục)", tip: "手 (bàn tay) che lên trên 目 (con mắt) để phóng tầm mắt NHÌN xa." },
        "听": { radical: "口 (Khẩu)", tip: "口 (miệng) + 斤: Lắng tai NGHE lời người khác nói." },
        "吃": { radical: "口 (Khẩu)", tip: "口 (cái miệng) + 乞: Dùng miệng để ĂN thưởng thức." },
        "喝": { radical: "口 (Khẩu)", tip: "口 (miệng) khát nước dưới ánh mặt trời 日 → UỐNG nước." },
        "请": { radical: "讠 (Ngôn)", tip: "讠 (lời nói) + 青 (xanh trong, thanh lịch) → Lời MỜI lịch sự." },
        "谢": { radical: "讠 (Ngôn)", tip: "讠 (lời nói) + 身 (cúi mình) + 寸 (chừng mực) → CẢM ƠN chân thành." },
        "说": { radical: "讠 (Ngôn)", tip: "讠 (lời nói) + 兑 (niềm vui trao đổi) → NÓI chuyện." },
        "话": { radical: "讠 (Ngôn)", tip: "讠 (ngôn từ) phát ra từ 舌 (đầu lưỡi) → LỜI NÓI." },
        "语": { radical: "讠 (Ngôn)", tip: "讠 (ngôn từ) + 吾 (ta): Tiếng nói giao tiếp của cộng đồng → NGÔN NGỮ." },
        "汉": { radical: "氵 (Chấm thủy)", tip: "氵 (dòng nước) sông Hán Thủy — nguồn gốc tộc HÁN & chữ Hán." },
        "字": { radical: "宀 (Miên)", tip: "宀 (mái nhà) che chở 子 (đứa trẻ học hành) → CHỮ VIẾT." },
        "学": { radical: "子 (Tử)", tip: "Đứa trẻ 子 dưới mái trường được truyền thụ tri thức → HỌC TẬP." },
        "家": { radical: "宀 (Miên)", tip: "宀 (mái nhà) có nuôi 豕 (đàn heo sung túc thời xưa) → GIA ĐÌNH / NHÀ." },
        "安": { radical: "宀 (Miên)", tip: "Người phụ nữ 女 ở dưới mái nhà 宀 vững chãi → BÌNH AN." },
        "国": { radical: "囗 (Vi)", tip: "囗 (biên giới bốn phương) bảo vệ 玉 (ngọc quý quốc gia) → ĐẤT NƯỚC." },
        "钱": { radical: "钅 (Kim)", tip: "钅 (kim loại vàng bạc) đúc thành đồng xu → TIỀN BẠC." },
        "银": { radical: "钅 (Kim)", tip: "钅 (kim loại) sáng lấp lánh → BẠC / NGÂN HÀNG." },
        "饭": { radical: "饣 (Thực)", tip: "饣 (thức ăn) + 反 → BỮA CƠM nóng hổi." },
        "茶": { radical: "艹 (Thảo đầu)", tip: "Người 人 đứng hái búp lá 艹 trên cây 木 → TRÀ thơm." },
        "药": { radical: "艹 (Thảo đầu)", tip: "艹 (thảo mộc) + 约 → Thảo dược quý chữa bệnh (THUỐC)." },
        "想": { radical: "心 (Tâm)", tip: "相 (hình bóng) lưu giữ trong 心 (trái tim) → NHỚ NHUNG / SUY NGHĨ." },
        "忙": { radical: "忄 (Tâm đứng)", tip: "忄 (trái tim) + 亡 (chạy vội quên mình) → BẬN RỘN." },
        "买": { radical: "乙 / 贝", tip: "Đưa tiền ra mang hàng về → MUA." },
        "卖": { radical: "十 / 买", tip: "Có thêm chữ 十 (nhiều hàng hóa) trên chữ 买 → BÁN hàng." },
        "坐": { radical: "土 (Thổ)", tip: "Hai người 人人 cùng NGỒI trên mặt đất 土 trò chuyện." },
        "林": { radical: "木 (Mộc)", tip: "Hai cái cây 木 ghép lại thành RỪNG CÂY." },
        "森": { radical: "木 (Mộc)", tip: "Ba cái cây 木 tầng tầng lớp lớp thành RỪNG RẬM đại ngàn." },
        "祝": { radical: "礻 (Thị)", tip: "礻 (lễ nghi cầu phúc) + 兄 (người anh đọc lời chúc) → CHÚC MỪNG." }
    };

    const COMPONENT_HINTS = [
        { test: /[吃喝吗呢叫听哪唱啡吧]/, radical: "口 (Khẩu - Miệng)", meaning: "Liên quan tới miệng, lời nói, ăn uống hoặc trợ từ ngữ khí" },
        { test: /[请谢说话语读课认识谁试]/, radical: "讠 (Ngôn - Lời nói)", meaning: "Liên quan tới ngôn ngữ, hỏi đáp và giao tiếp" },
        { test: /[你他们什住作件休信做]/, radical: "亻 (Nhân đứng - Người)", meaning: "Liên quan tới con người, đại từ hoặc hoạt động" },
        { test: /[好妈她姐姓妹要]/, radical: "女 (Nữ - Phái nữ)", meaning: "Liên quan tới phụ nữ, người thân hoặc vẻ đẹp" },
        { test: /[汉没洗河海汤酒流法泳汽]/, radical: "氵 (Chấm thủy - Nước)", meaning: "Liên quan tới nước, chất lỏng hoặc sự trôi chảy" },
        { test: /[打找换拿报按把拉护]/, radical: "扌 (Tài gẩy - Tay)", meaning: "Liên quan tới bàn tay và thao tác hành động" },
        { test: /[想您忙快慢懂情怕忘意感]/, radical: "心 / 忄 (Tâm - Trái tim)", meaning: "Liên quan tới tâm trạng, suy nghĩ và tình cảm" },
        { test: /[明早晚时昨星晴是春]/, radical: "日 (Nhật - Mặt trời)", meaning: "Liên quan tới ánh sáng, ngày tháng và thời gian" },
        { test: /[茶花苹药菜蓝英]/, radical: "艹 (Thảo đầu - Cỏ cây)", meaning: "Liên quan tới thực vật, hoa lá và thảo mộc" },
        { test: /[钱银钟错铁铅]/, radical: "钅 (Kim - Kim loại)", meaning: "Liên quan tới kim loại, tiền tệ hoặc dụng cụ" },
        { test: /[饭饺饿馆饱饼]/, radical: "饣 (Thực - Đồ ăn)", meaning: "Liên quan tới ẩm thực, món ăn và dinh dưỡng" },
        { test: /[这那远近进送还道选通]/, radical: "辶 (Quai xước - Bước đi)", meaning: "Liên quan tới di chuyển, con đường và khoảng cách" },
        { test: /[家字安宿室完定客]/, radical: "宀 (Miên - Mái nhà)", meaning: "Liên quan tới ngôi nhà, không gian trong nhà và sự ổn định" },
        { test: /[本休林森校桌楼树果机]/, radical: "木 (Mộc - Cây gỗ)", meaning: "Liên quan tới cây cối, gỗ hoặc kiến trúc" }
    ];

    function analyzeHanzi(wordObj) {
        const hanzi = (wordObj && wordObj.hanzi) || "";
        const chars = Array.from(hanzi).filter(c => /[\u4e00-\u9fff]/.test(c));
        for (const ch of chars) {
            if (CHAR_MNEMONICS[ch]) {
                return {
                    focusChar: ch,
                    radical: CHAR_MNEMONICS[ch].radical,
                    mnemonic: CHAR_MNEMONICS[ch].tip,
                    charCount: chars.length
                };
            }
        }
        for (const rule of COMPONENT_HINTS) {
            const matchedChar = chars.find(c => rule.test.test(c));
            if (matchedChar) {
                return {
                    focusChar: matchedChar,
                    radical: rule.radical,
                    mnemonic: `Chữ "${matchedChar}" trong "${hanzi}" chứa bộ ${rule.radical} — ${rule.meaning.toLowerCase()}.`,
                    charCount: chars.length
                };
            }
        }
        const firstChar = chars[0] || hanzi.charAt(0) || "汉";
        return {
            focusChar: firstChar,
            radical: "Cấu trúc Hán tự chuẩn",
            mnemonic: `Ghi nhớ cụm "${hanzi}" (${wordObj.pinyin || ""}) theo ngữ cảnh: "${wordObj.meaning || ""}". Hãy viết nét từ trái sang phải, từ trên xuống dưới.`,
            charCount: Math.max(1, chars.length)
        };
    }

    const UNIT_GRAMMAR_BANK = {
        "starter_easy": [
            {
                pattern: "Chủ ngữ + 很 (hěn) + Tính từ",
                title: "Câu miêu tả tính chất cơ bản",
                explanation: "Trong tiếng Trung, khi nói ai/cái gì 'tốt, to, nhỏ, nhiều...', ta thường đặt phó từ 很 (rất) trước tính từ thay vì dùng động từ 是.",
                exampleHanzi: "大书很好。",
                examplePinyin: "Dà shū hěn hǎo.",
                exampleVi: "Quyển sách lớn rất hay."
            },
            {
                pattern: "Số đếm + Lượng từ + Danh từ",
                title: "Cách đếm sự vật & màu sắc",
                explanation: "Giữa số đếm (一, 二, 三...) và danh từ (人, 猫, 书...) luôn cần một lượng từ nối ở giữa (như 个, 本, 只).",
                exampleHanzi: "一个人，三本书。",
                examplePinyin: "Yí gè rén, sān běn shū.",
                exampleVi: "Một người, ba quyển sách."
            }
        ],
        "Bài 1:": [
            {
                pattern: "A + 好！ (Nǐ hǎo! / Nín hǎo!)",
                title: "Cấu trúc chào hỏi chuẩn tiếng Trung",
                explanation: "Thêm chữ 好 (tốt lành) sau đại từ nhân xưng (你, 您, 你们, 老师) để tạo lời chào lịch sự mọi lúc trong ngày.",
                exampleHanzi: "你好！王老师好！",
                examplePinyin: "Nǐ hǎo! Wáng lǎo shī hǎo!",
                exampleVi: "Xin chào! Em chào thầy Vương ạ!"
            },
            {
                pattern: "Quy tắc biến điệu thanh 3 + thanh 3",
                title: "Biến điệu tự nhiên khi phát âm",
                explanation: "Khi 2 âm tiết thanh 3 đi liền nhau (nǐ + hǎo), âm tiết đầu đọc thành thanh 2 (ní hǎo), nhưng chữ viết Pinyin vẫn giữ nguyên dấu thanh 3.",
                exampleHanzi: "你好 / 很好",
                examplePinyin: "nǐ hǎo (đọc: ní hǎo) / hěn hǎo",
                exampleVi: "Xin chào / Rất khỏe"
            }
        ],
        "Bài 2:": [
            {
                pattern: "Chủ ngữ + 吗 (ma)？",
                title: "Câu hỏi Có–Không với trợ từ 吗",
                explanation: "Đặt trợ từ nghi vấn 吗 ở cuối câu trần thuật để biến câu đó thành câu hỏi 'có ... không?'.",
                exampleHanzi: "爸爸妈妈忙吗？",
                examplePinyin: "Bàba māma máng ma?",
                exampleVi: "Bố mẹ có bận không?"
            },
            {
                pattern: "不 +太 + Tính từ (bú tài...)",
                title: "Cấu trúc giảm nhẹ 'Không ... lắm'",
                explanation: "Dùng 不太 trước tính từ (như 难, 忙, 大) để diễn tả mức độ vừa phải, lịch sự.",
                exampleHanzi: "汉语不太难。",
                examplePinyin: "Hànyǔ bú tài nán.",
                exampleVi: "Tiếng Hán không khó lắm."
            }
        ],
        "Bài 3:": [
            {
                pattern: "Chủ ngữ + 去 (qù) + Địa điểm + Động từ",
                title: "Câu liên động chỉ mục đích đi đâu làm gì",
                explanation: "Động từ 去 (đi) + Nơi chốn + Hành động mục tiêu (rút tiền, gửi thư, học tiếng Hán) sắp xếp đúng theo trình tự thời gian.",
                exampleHanzi: "明天我去银行取钱。",
                examplePinyin: "Míngtiān wǒ qù yínháng qǔ qián.",
                exampleVi: "Ngày mai tôi đi ngân hàng rút tiền."
            }
        ],
        "Bài 4:": [
            {
                pattern: "Đại từ nghi vấn 哪儿 (nǎr) / 几 (jǐ)",
                title: "Hỏi địa điểm 'ở đâu' & hỏi thứ trong tuần",
                explanation: "Trong tiếng Trung, từ để hỏi đặt ngay tại vị trí của câu trả lời mà không cần đảo ngữ.",
                exampleHanzi: "今天星期几？你去哪儿？",
                examplePinyin: "Jīntiān xīngqī jǐ? Nǐ qù nǎr?",
                exampleVi: "Hôm nay thứ mấy? Bạn đi đâu thế?"
            }
        ],
        "Bài 5:": [
            {
                pattern: "这是... / 请 + Động từ",
                title: "Giới thiệu nhân vật & Lời mời lịch sự",
                explanation: "Dùng 这是 + Tên/Chức danh để giới thiệu một người, kết hợp 请进 (mời vào), 请坐 (mời ngồi), 请喝茶 (mời uống trà).",
                exampleHanzi: "这是王老师，请进，请坐！",
                examplePinyin: "Zhè shì Wáng lǎoshī, qǐng jìn, qǐng zuò!",
                exampleVi: "Đây là thầy Vương, mời vào, mời ngồi!"
            }
        ],
        "Bài 6:": [
            {
                pattern: "请问你贵姓？ / 哪国人？",
                title: "Hỏi họ tên & quốc tịch trang trọng",
                explanation: "贵姓 (quý tính) dùng để hỏi họ đối phương một cách lịch sự; 哪 + Lượng từ/Danh từ để hỏi 'nào'.",
                exampleHanzi: "请问你贵姓？你是哪国人？",
                examplePinyin: "Qǐngwèn nǐ guìxìng? Nǐ shì nǎ guó rén?",
                exampleVi: "Xin hỏi bạn họ gì? Bạn là người nước nào?"
            }
        ],
        "Bài 7:": [
            {
                pattern: "Thời gian + 去 + Địa điểm + 吃 + Món ăn",
                title: "Trạng ngữ thời gian & gọi món tại nhà ăn",
                explanation: "Trạng ngữ chỉ thời gian (中午, 今天) luôn đứng trước động từ (đầu câu hoặc ngay sau chủ ngữ).",
                exampleHanzi: "中午我去食堂吃饺子。",
                examplePinyin: "Zhōngwǔ wǒ qù shítáng chī jiǎozi.",
                exampleVi: "Buổi trưa tôi đi nhà ăn ăn sủi cảo."
            }
        ],
        "Bài 8:": [
            {
                pattern: "...多少钱？ / Phân biệt 二 (èr) và 两 (liǎng)",
                title: "Hỏi giá tiền & dùng 两 trước lượng từ",
                explanation: "Khi đếm số lượng với lượng từ (斤, 个, 本), số 2 bắt buộc dùng 两 (liǎng jīn: 2 cân) thay vì 二.",
                exampleHanzi: "苹果一斤多少钱？我买两斤。",
                examplePinyin: "Píngguǒ yì jīn duōshao qián? Wǒ mǎi liǎng jīn.",
                exampleVi: "Táo một cân bao nhiêu tiền? Tôi mua hai cân."
            }
        ]
    };

    function getLessonGuide(deckId, unit) {
        const unitObj = unit || { title: "Bài học", words: [] };
        const words = Array.isArray(unitObj.words) ? unitObj.words : [];
        const boss = window.VocabDatabase ? window.VocabDatabase.getUnitBossWord(unitObj) : null;

        let grammarPoints = null;
        for (const key of Object.keys(UNIT_GRAMMAR_BANK)) {
            if (deckId === key || (unitObj.title && unitObj.title.includes(key))) {
                grammarPoints = UNIT_GRAMMAR_BANK[key];
                break;
            }
        }

        const w0 = words[0] || { hanzi: "汉语", pinyin: "Hànyǔ", meaning: "Tiếng Hán" };
        const w1 = words[1] || w0;
        const w2 = words[2] || w1;
        const w3 = words[3] || w0;

        if (!grammarPoints) {
            if (deckId === "hsk2_full") {
                grammarPoints = [
                    {
                        pattern: "Chủ ngữ + 在/去 + Địa điểm + Động từ",
                        title: "Cấu trúc hoạt động gắn liền không gian & trạng thái",
                        explanation: "Trong HSK 2, trạng ngữ nơi chốn và thời gian đứng trước động từ chính để mô tả bối cảnh hành động một cách tự nhiên.",
                        exampleHanzi: boss ? boss.hanzi : `我们一起学习${w0.hanzi}。`,
                        examplePinyin: boss ? boss.pinyin : `Wǒmen yìqǐ xuéxí ${w0.pinyin}.`,
                        exampleVi: boss ? boss.meaning : `Chúng ta cùng học "${w0.meaning}".`
                    },
                    {
                        pattern: "Động từ + 了 / 过 / 着 (Trợ từ động thái)",
                        title: "Biểu đạt tiến trình & hoàn thành hành động",
                        explanation: "Kết hợp từ vựng mới của bài với 了 (đã hoàn thành) hoặc 正在...呢 (đang diễn ra) để kể lại tình huống giao tiếp thực tế.",
                        exampleHanzi: `今天我学会了“${w0.hanzi}”和“${w1.hanzi}”。`,
                        examplePinyin: `Jīntiān wǒ xuéhuì le "${w0.pinyin}" hé "${w1.pinyin}".`,
                        exampleVi: `Hôm nay tôi đã học thuộc "${window.VocabDatabase.getDisplayMeaningHint(w0)}" và "${window.VocabDatabase.getDisplayMeaningHint(w1)}".`
                    }
                ];
            } else {
                grammarPoints = [
                    {
                        pattern: "Mẫu câu trọng tâm bài khóa",
                        title: "Vận dụng từ vựng vào câu hoàn chỉnh",
                        explanation: "Đặt từ mới vào cấu trúc Chủ ngữ – Trạng ngữ – Động từ – Tân ngữ thay vì chỉ học từ rời rạc để kích hoạt trí nhớ dài hạn.",
                        exampleHanzi: boss ? boss.hanzi : `今天我们学习${w0.hanzi}。`,
                        examplePinyin: boss ? boss.pinyin : `Jīntiān wǒmen xuéxí ${w0.pinyin}.`,
                        exampleVi: boss ? boss.meaning : `Hôm nay chúng ta học ${w0.meaning}.`
                    },
                    {
                        pattern: "Liên kết ý với 也 (cũng) / 都 (đều) / 以后 (sau khi)",
                        title: "Mở rộng câu giao tiếp tự nhiên",
                        explanation: "Sử dụng các phó từ & liên từ phổ biến để nối 2 mệnh đề ngắn thành câu giao tiếp trôi chảy chuẩn HSK.",
                        exampleHanzi: `我也觉得“${w1.hanzi}”很重要。`,
                        examplePinyin: `Wǒ yě juéde "${w1.pinyin}" hěn zhòngyào.`,
                        exampleVi: `Tôi cũng cảm thấy "${window.VocabDatabase.getDisplayMeaningHint(w1)}" rất quan trọng.`
                    }
                ];
            }
        }

        const m0 = window.VocabDatabase ? window.VocabDatabase.getDisplayMeaningHint(w0) : w0.meaning;
        const m1 = window.VocabDatabase ? window.VocabDatabase.getDisplayMeaningHint(w1) : w1.meaning;
        const m2 = window.VocabDatabase ? window.VocabDatabase.getDisplayMeaningHint(w2) : w2.meaning;
        const m3 = window.VocabDatabase ? window.VocabDatabase.getDisplayMeaningHint(w3) : w3.meaning;

        const dialogue = [
            {
                speaker: "Minh Anh (A)",
                avatar: "👩‍🎓",
                hanzi: `你好！今天我们复习“${w0.hanzi}”和“${w1.hanzi}”好吗？`,
                pinyin: `Nǐ hǎo! Jīntiān wǒmen fùxí "${w0.pinyin}" hé "${w1.pinyin}" hǎo ma?`,
                vi: `Chào bạn! Hôm nay chúng mình ôn tập từ "${m0}" và "${m1}" nhé?`
            },
            {
                speaker: "Hoàng Nam (B)",
                avatar: "🧑‍🚀",
                hanzi: `太好了！我还想练习“${w2.hanzi}”怎么用。`,
                pinyin: `Tài hǎo le! Wǒ hái xiǎng liànxí "${w2.pinyin}" zěnme yòng.`,
                vi: `Tuyệt quá! Mình còn muốn luyện cách dùng từ "${m2}" nữa.`
            },
            {
                speaker: "Minh Anh (A)",
                avatar: "👩‍🎓",
                hanzi: boss ? `${boss.hanzi}。` : `你看，“${w3.hanzi}”在口语里很常用。`,
                pinyin: boss ? `${boss.pinyin}.` : `Nǐ kàn, "${w3.pinyin}" zài kǒuyǔ lǐ hěn chángyòng.`,
                vi: boss ? `${boss.meaning}.` : `Bạn xem, từ "${m3}" rất hay dùng trong văn nói đấy.`
            },
            {
                speaker: "Hoàng Nam (B)",
                avatar: "🧑‍🚀",
                hanzi: `我明白了！我们一起读一遍吧。`,
                pinyin: `Wǒ míngbai le! Wǒmen yìqǐ dú yí biàn ba.`,
                vi: `Mình hiểu rồi! Chúng ta cùng đọc lại một lượt nhé.`
            }
        ];

        const contextualSentences = words.slice(0, 12).map((w, idx) => {
            const m = window.VocabDatabase ? window.VocabDatabase.getDisplayMeaningHint(w) : w.meaning;
            const templates = [
                {
                    hanzi: `请跟我读这个词：“${w.hanzi}”。`,
                    cloze: `请跟我读这个词：“___”。`,
                    pinyin: `Qǐng gēn wǒ dú zhège cí: "${w.pinyin}".`,
                    vi: `Hãy đọc theo tôi từ này: "${m}".`,
                    tokens: ["请跟我读", "这个词：", w.hanzi]
                },
                {
                    hanzi: `你知道“${w.hanzi}”是什么意思吗？`,
                    cloze: `你知道“___”是什么意思吗？`,
                    pinyin: `Nǐ zhīdào "${w.pinyin}" shì shénme yìsi ma?`,
                    vi: `Bạn có biết "${m}" nghĩa là gì không?`,
                    tokens: ["你知道", w.hanzi, "是什么意思吗"]
                },
                {
                    hanzi: `今天老师教我们写“${w.hanzi}”。`,
                    cloze: `今天老师教我们写“___”。`,
                    pinyin: `Jīntiān lǎoshī jiāo wǒmen xiě "${w.pinyin}".`,
                    vi: `Hôm nay thầy giáo dạy chúng tôi viết chữ "${m}".`,
                    tokens: ["今天老师", "教我们写", w.hanzi]
                },
                {
                    hanzi: `在汉语里，“${w.hanzi}”非常常用。`,
                    cloze: `在汉语里，“___”非常常用。`,
                    pinyin: `Zài Hànyǔ lǐ, "${w.pinyin}" fēicháng chángyòng.`,
                    vi: `Trong tiếng Hán, từ "${m}" vô cùng thông dụng.`,
                    tokens: ["在汉语里，", w.hanzi, "非常常用"]
                }
            ];
            const tpl = templates[idx % templates.length];
            return Object.assign({ targetWord: w }, tpl);
        });

        return {
            overview: `Nắm vững ${words.length} từ vựng cốt lõi, chiết tự bộ thủ, ngữ pháp ứng dụng và mẫu câu giao tiếp của ${unitObj.title}.`,
            bossSentence: boss,
            grammarPoints,
            dialogue,
            contextualSentences
        };
    }

    const PLACEMENT_QUESTIONS = [
        {
            level: 0,
            tag: "Nhập Môn",
            prompt: "Chữ Hán 「水」 (shuǐ) có nghĩa tiếng Việt là gì?",
            options: ["Nước", "Lửa", "Núi", "Người"],
            correctIndex: 0,
            explain: "水 (shuǐ) nghĩa là Nước — một trong những chữ tượng hình cơ bản nhất."
        },
        {
            level: 0,
            tag: "Nhập Môn",
            prompt: "Cách đọc Pinyin chuẩn của từ 「你好」 (Xin chào) là gì?",
            options: ["nǐ hǎo", "xiè xie", "zài jiàn", "duō shao"],
            correctIndex: 0,
            explain: "你好 đọc là nǐ hǎo (khi nói đọc biến điệu thành ní hǎo)."
        },
        {
            level: 1,
            tag: "HSK 1",
            prompt: "Điền từ thích hợp: 「明天我去___取钱。」 (Ngày mai tôi đi ngân hàng rút tiền.)",
            options: ["银行 (yínháng)", "学校 (xuéxiào)", "食堂 (shítáng)", "医院 (yīyuàn)"],
            correctIndex: 0,
            explain: "银行 (yínháng) nghĩa là Ngân hàng — nơi rút tiền (取钱)."
        },
        {
            level: 1,
            tag: "HSK 1",
            prompt: "Khi mua 2 cân táo, cách nói nào ĐÚNG ngữ pháp tiếng Trung?",
            options: ["两斤苹果 (liǎng jīn píngguǒ)", "二斤苹果 (èr jīn píngguǒ)", "两个斤苹果", "苹果二斤"],
            correctIndex: 0,
            explain: "Trước lượng từ (như 斤, 个, 本), số 2 bắt buộc dùng 两 (liǎng) thay vì 二."
        },
        {
            level: 2,
            tag: "HSK 2",
            prompt: "Câu 「他正在房间里听音乐呢」 diễn tả điều gì?",
            options: [
                "Anh ấy đang nghe nhạc trong phòng",
                "Anh ấy đã nghe nhạc hôm qua",
                "Anh ấy không thích nghe nhạc",
                "Anh ấy định đi mua đĩa nhạc"
            ],
            correctIndex: 0,
            explain: "Cấu trúc 正在 + V + 呢 diễn tả hành động đang diễn ra ngay lúc nói."
        },
        {
            level: 2,
            tag: "HSK 2",
            prompt: "Chọn từ đúng: 「我今天吃了早饭___来找你了。」 (Tôi ăn sáng xong là đến tìm bạn ngay.)",
            options: ["就 (jiù)", "才 (cái)", "吗 (ma)", "最 (zuì)"],
            correctIndex: 0,
            explain: "Cấu trúc V1 + 了 ... 就 + V2 diễn tả hành động thứ 2 xảy ra ngay lập tức sau hành động 1."
        },
        {
            level: 3,
            tag: "HSK 3",
            prompt: "Từ 「打算」 (dǎsuàn) trong câu 「周末我打算参加比赛」 có nghĩa là gì?",
            options: ["Dự định / Kế hoạch", "Lo lắng", "Quên mất", "Bắt buộc"],
            correctIndex: 0,
            explain: "打算 (dǎsuàn) vừa là động từ vừa là danh từ mang nghĩa 'dự định, kế hoạch'."
        },
        {
            level: 4,
            tag: "HSK 4",
            prompt: "Điền từ HSK 4 phù hợp: 「办好___以后，我们就可以买机票出国了。」",
            options: ["签证 (qiānzhèng)", "森林 (sēnlín)", "球迷 (qiúmí)", "规律 (guīlǜ)"],
            correctIndex: 0,
            explain: "签证 (qiānzhèng) là Thị thực (Visa) — thủ tục cần hoàn tất trước khi xuất cảnh."
        }
    ];

    function evaluatePlacement(selectedIndexes = []) {
        let score = 0;
        let maxLevelPassed = -1;

        PLACEMENT_QUESTIONS.forEach((q, idx) => {
            if (selectedIndexes[idx] === q.correctIndex) {
                score++;
                if (q.level > maxLevelPassed) maxLevelPassed = q.level;
            }
        });

        if (score <= 1) {
            return {
                score,
                total: PLACEMENT_QUESTIONS.length,
                deckId: "starter_easy",
                unitIndex: 0,
                badge: "🌱 Cấp 0 • Nhập Môn Tiếng Trung",
                advice: "Bạn nên bắt đầu từ Khóa Nhập Môn Siêu Dễ để làm quen mặt chữ tượng hình, bộ thủ và phản xạ Pinyin nhẹ nhàng nhất!"
            };
        }
        if (score <= 3) {
            return {
                score,
                total: PLACEMENT_QUESTIONS.length,
                deckId: "hsk1_full",
                unitIndex: 0,
                badge: "📘 HSK 1 • Giáo Trình Hán Ngữ Quyển 1",
                advice: "Bạn đã có cảm nhận cơ bản! Hãy bắt đầu lộ trình HSK 1 bài bản (15 bài Quyển 1) kết hợp Chiết tự & Luyện viết."
            };
        }
        if (score <= 5) {
            return {
                score,
                total: PLACEMENT_QUESTIONS.length,
                deckId: "hsk2_full",
                unitIndex: 0,
                badge: "📗 HSK 2 • Giáo Trình Hán Ngữ Quyển 2",
                advice: "Nền tảng HSK 1 của bạn khá vững! Bạn sẵn sàng bước vào HSK 2 (Bài 16–30) để luyện câu dài và hội thoại thực tế."
            };
        }
        if (score <= 6) {
            return {
                score,
                total: PLACEMENT_QUESTIONS.length,
                deckId: "hsk3_full",
                unitIndex: 0,
                badge: "📙 HSK 3 • Trung Cấp Giao Tiếp",
                advice: "Tuyệt vời! Bạn đã nắm chắc sơ cấp. Hãy chinh phục từ vựng & cấu trúc HSK 3 để giao tiếp trôi chảy."
            };
        }
        return {
            score,
            total: PLACEMENT_QUESTIONS.length,
            deckId: "hsk4_full",
            unitIndex: 0,
            badge: "📕 HSK 4 • Trung Cao Cấp",
            advice: "Ấn tượng! Trình độ của bạn đạt ngưỡng HSK 4. Hãy rèn tốc độ phản xạ Pinyin + Thanh điệu và mở rộng từ chuyên ngành!"
        };
    }

    return {
        CORE_RADICALS,
        analyzeHanzi,
        getLessonGuide,
        PLACEMENT_QUESTIONS,
        evaluatePlacement
    };
})();
