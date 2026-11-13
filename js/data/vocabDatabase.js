/**
 * Vocabulary Database for Chinese Space Shooter Game
 * Supports both:
 * 1. "pinyin" mode  : Falling Hanzi -> Type Pinyin to shoot
 * 2. "meaning" mode : Falling Hanzi + Pinyin -> Type Vietnamese Meaning to shoot
 * 3. "mixed" mode   : Alternating Pinyin and Vietnamese Meaning targets
 */
window.VocabDatabase = (function () {
    const DECKS = [
        {
            id: "starter_easy",
            name: "Nhập Môn Siêu Dễ (Làm Quen Nhẹ Nhàng)",
            badge: "DỄ • CẤP 0",
            description: "Các từ đơn 1 âm tiết ngắn gọn, tốc độ chậm, cực kỳ dễ chơi để làm quen phản xạ.",
            units: [
                {
                    unitNumber: 1,
                    stageLabel: "Màn 1/3 • Từ Đơn (Gõ Pinyin)",
                    title: "Làm Quen: Từ Đơn Ngắn Gọn (Nhìn Hán ➔ Gõ Pinyin)",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "好", pinyin: "hǎo", pinyinClean: "hao", meaning: "Tốt, khỏe", meaningShort: "Tốt" },
                        { hanzi: "大", pinyin: "dà", pinyinClean: "da", meaning: "To, lớn", meaningShort: "To" },
                        { hanzi: "小", pinyin: "xiǎo", pinyinClean: "xiao", meaning: "Nhỏ, bé", meaningShort: "Nhỏ" },
                        { hanzi: "多", pinyin: "duō", pinyinClean: "duo", meaning: "Nhiều", meaningShort: "Nhiều" },
                        { hanzi: "少", pinyin: "shǎo", pinyinClean: "shao", meaning: "Ít", meaningShort: "Ít" },
                        { hanzi: "水", pinyin: "shuǐ", pinyinClean: "shui", meaning: "Nước", meaningShort: "Nước" },
                        { hanzi: "火", pinyin: "huǒ", pinyinClean: "huo", meaning: "Lửa", meaningShort: "Lửa" },
                        { hanzi: "人", pinyin: "rén", pinyinClean: "ren", meaning: "Người", meaningShort: "Người" },
                        { hanzi: "山", pinyin: "shān", pinyinClean: "shan", meaning: "Núi", meaningShort: "Núi" },
                        { hanzi: "天", pinyin: "tiān", pinyinClean: "tian", meaning: "Trời, ngày", meaningShort: "Trời" },
                        { hanzi: "月", pinyin: "yuè", pinyinClean: "yue", meaning: "Trăng, tháng", meaningShort: "Tháng" },
                        { hanzi: "爱", pinyin: "ài", pinyinClean: "ai", meaning: "Yêu", meaningShort: "Yêu" },
                        { hanzi: "书", pinyin: "shū", pinyinClean: "shu", meaning: "Sách", meaningShort: "Sách" },
                        { hanzi: "车", pinyin: "chē", pinyinClean: "che", meaning: "Xe", meaningShort: "Xe" },
                        { hanzi: "猫", pinyin: "māo", pinyinClean: "mao", meaning: "Con mèo", meaningShort: "Mèo" }
                    ]
                },
                {
                    unitNumber: 2,
                    stageLabel: "Màn 2/3 • Hán+Pinyin (Gõ Nghĩa)",
                    title: "Màn Bắn Nghĩa: Nhìn Hán Tự + Pinyin ➔ Gõ Nghĩa Tiếng Việt",
                    targetMode: "meaning",
                    words: [
                        { hanzi: "好", pinyin: "hǎo", pinyinClean: "hao", meaning: "Tốt, khỏe", meaningShort: "Tốt" },
                        { hanzi: "大", pinyin: "dà", pinyinClean: "da", meaning: "To, lớn", meaningShort: "To" },
                        { hanzi: "小", pinyin: "xiǎo", pinyinClean: "xiao", meaning: "Nhỏ, bé", meaningShort: "Nhỏ" },
                        { hanzi: "水", pinyin: "shuǐ", pinyinClean: "shui", meaning: "Nước", meaningShort: "Nước" },
                        { hanzi: "火", pinyin: "huǒ", pinyinClean: "huo", meaning: "Lửa", meaningShort: "Lửa" },
                        { hanzi: "人", pinyin: "rén", pinyinClean: "ren", meaning: "Người", meaningShort: "Người" },
                        { hanzi: "山", pinyin: "shān", pinyinClean: "shan", meaning: "Núi", meaningShort: "Núi" },
                        { hanzi: "天", pinyin: "tiān", pinyinClean: "tian", meaning: "Trời, ngày", meaningShort: "Trời" },
                        { hanzi: "爱", pinyin: "ài", pinyinClean: "ai", meaning: "Yêu", meaningShort: "Yêu" },
                        { hanzi: "书", pinyin: "shū", pinyinClean: "shu", meaning: "Sách", meaningShort: "Sách" },
                        { hanzi: "车", pinyin: "chē", pinyinClean: "che", meaning: "Xe", meaningShort: "Xe" },
                        { hanzi: "猫", pinyin: "māo", pinyinClean: "mao", meaning: "Mèo, con mèo", meaningShort: "Mèo" },
                        { hanzi: "狗", pinyin: "gǒu", pinyinClean: "gou", meaning: "Chó, con chó", meaningShort: "Chó" },
                        { hanzi: "花", pinyin: "huā", pinyinClean: "hua", meaning: "Hoa, bông hoa", meaningShort: "Hoa" },
                        { hanzi: "茶", pinyin: "chá", pinyinClean: "cha", meaning: "Trà, chè", meaningShort: "Trà" }
                    ]
                },
                {
                    unitNumber: 3,
                    stageLabel: "Màn 3/3 • Số Đếm & Màu Sắc",
                    title: "Số Đếm & Tự Nhiên Cơ Bản",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "一", pinyin: "yī", pinyinClean: "yi", meaning: "Một", meaningShort: "Một" },
                        { hanzi: "二", pinyin: "èr", pinyinClean: "er", meaning: "Hai", meaningShort: "Hai" },
                        { hanzi: "三", pinyin: "sān", pinyinClean: "san", meaning: "Ba", meaningShort: "Ba" },
                        { hanzi: "四", pinyin: "sì", pinyinClean: "si", meaning: "Bốn", meaningShort: "Bốn" },
                        { hanzi: "五", pinyin: "wǔ", pinyinClean: "wu", meaning: "Năm", meaningShort: "Năm" },
                        { hanzi: "六", pinyin: "liù", pinyinClean: "liu", meaning: "Sáu", meaningShort: "Sáu" },
                        { hanzi: "七", pinyin: "qī", pinyinClean: "qi", meaning: "Bảy", meaningShort: "Bảy" },
                        { hanzi: "八", pinyin: "bā", pinyinClean: "ba", meaning: "Tám", meaningShort: "Tám" },
                        { hanzi: "九", pinyin: "jiǔ", pinyinClean: "jiu", meaning: "Chín", meaningShort: "Chín" },
                        { hanzi: "十", pinyin: "shí", pinyinClean: "shi", meaning: "Mười", meaningShort: "Mười" },
                        { hanzi: "红", pinyin: "hóng", pinyinClean: "hong", meaning: "Đỏ, màu đỏ", meaningShort: "Đỏ" },
                        { hanzi: "白", pinyin: "bái", pinyinClean: "bai", meaning: "Trắng, màu trắng", meaningShort: "Trắng" },
                        { hanzi: "黑", pinyin: "hēi", pinyinClean: "hei", meaning: "Đen, màu đen", meaningShort: "Đen" },
                        { hanzi: "风", pinyin: "fēng", pinyinClean: "feng", meaning: "Gió", meaningShort: "Gió" },
                        { hanzi: "雨", pinyin: "yǔ", pinyinClean: "yu", meaning: "Mưa", meaningShort: "Mưa" }
                    ]
                }
            ]
        },        {
            id: "hsk1_full",
            name: "HSK 1 • Giáo Trình Hán Ngữ Quyển 1 (Bài 1–15)",
            badge: "HSK 1 • QUYỂN 1",
            description: "Trọn bộ 15 Bài học (Bài 1 – Bài 15) theo đúng Giáo Trình Hán Ngữ Tập 1 - Quyển Thượng (NXB ĐH Ngôn Ngữ Bắc Kinh). Hỗ trợ cả Gõ Pinyin & Gõ Nghĩa.",
            units: [
                {
                    unitNumber: 1,
                    stageLabel: "Màn 1/15 • Bài 1 (Quyển 1)",
                    title: "Bài 1: 你好 — Xin chào",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "你", pinyin: "nǐ", pinyinClean: "ni", meaning: "Bạn, anh, chị", meaningShort: "Bạn" },
                        { hanzi: "好", pinyin: "hǎo", pinyinClean: "hao", meaning: "Tốt, đẹp, khỏe", meaningShort: "Tốt" },
                        { hanzi: "你好", pinyin: "nǐ hǎo", pinyinClean: "nihao", meaning: "Xin chào, chào bạn", meaningShort: "Xin chào" },
                        { hanzi: "一", pinyin: "yī", pinyinClean: "yi", meaning: "Một, số một", meaningShort: "Một" },
                        { hanzi: "五", pinyin: "wǔ", pinyinClean: "wu", meaning: "Năm, số năm", meaningShort: "Năm" },
                        { hanzi: "八", pinyin: "bā", pinyinClean: "ba", meaning: "Tám, số tám", meaningShort: "Tám" },
                        { hanzi: "大", pinyin: "dà", pinyinClean: "da", meaning: "To, lớn", meaningShort: "To" },
                        { hanzi: "不", pinyin: "bù", pinyinClean: "bu", meaning: "Không", meaningShort: "Không" },
                        { hanzi: "口", pinyin: "kǒu", pinyinClean: "kou", meaning: "Miệng, nhân khẩu", meaningShort: "Miệng" },
                        { hanzi: "白", pinyin: "bái", pinyinClean: "bai", meaning: "Trắng, màu trắng", meaningShort: "Trắng" },
                        { hanzi: "女", pinyin: "nǚ", pinyinClean: "nv", meaning: "Nữ, con gái, phụ nữ", meaningShort: "Nữ" },
                        { hanzi: "马", pinyin: "mǎ", pinyinClean: "ma", meaning: "Ngựa, con ngựa", meaningShort: "Ngựa" }
                    ]
                },
                {
                    unitNumber: 2,
                    stageLabel: "Màn 2/15 • Bài 2 (Quyển 1)",
                    title: "Bài 2: 汉语不太难 — Tiếng Hán không khó lắm",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "忙", pinyin: "máng", pinyinClean: "mang", meaning: "Bận, bận rộn", meaningShort: "Bận" },
                        { hanzi: "吗", pinyin: "ma", pinyinClean: "ma", meaning: "Không, chưa", meaningShort: "Không" },
                        { hanzi: "很", pinyin: "hěn", pinyinClean: "hen", meaning: "Rất", meaningShort: "Rất" },
                        { hanzi: "汉语", pinyin: "Hànyǔ", pinyinClean: "hanyu", meaning: "Tiếng Hán, tiếng Trung", meaningShort: "Tiếng Hán" },
                        { hanzi: "难", pinyin: "nán", pinyinClean: "nan", meaning: "Khó", meaningShort: "Khó" },
                        { hanzi: "太", pinyin: "tài", pinyinClean: "tai", meaning: "Lắm, quá", meaningShort: "Quá" },
                        { hanzi: "爸爸", pinyin: "bàba", pinyinClean: "baba", meaning: "Bố, ba", meaningShort: "Bố" },
                        { hanzi: "妈妈", pinyin: "māma", pinyinClean: "mama", meaning: "Mẹ, má", meaningShort: "Mẹ" },
                        { hanzi: "他", pinyin: "tā", pinyinClean: "ta", meaning: "Anh ấy, ông ấy, anh ta", meaningShort: "Anh ấy" },
                        { hanzi: "她", pinyin: "tā", pinyinClean: "ta", meaning: "Cô ấy, bà ấy", meaningShort: "Cô ấy" },
                        { hanzi: "男", pinyin: "nán", pinyinClean: "nan", meaning: "Nam, con trai", meaningShort: "Nam" },
                        { hanzi: "哥哥", pinyin: "gēge", pinyinClean: "gege", meaning: "Anh trai", meaningShort: "Anh trai" },
                        { hanzi: "弟弟", pinyin: "dìdi", pinyinClean: "didi", meaning: "Em trai", meaningShort: "Em trai" },
                        { hanzi: "妹妹", pinyin: "mèimei", pinyinClean: "meimei", meaning: "Em gái", meaningShort: "Em gái" }
                    ]
                },
                {
                    unitNumber: 3,
                    stageLabel: "Màn 3/15 • Bài 3 (Quyển 1)",
                    title: "Bài 3: 明天见 — Ngày mai gặp lại",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "学", pinyin: "xué", pinyinClean: "xue", meaning: "Học", meaningShort: "Học" },
                        { hanzi: "英语", pinyin: "Yīngyǔ", pinyinClean: "yingyu", meaning: "Tiếng Anh", meaningShort: "Tiếng Anh" },
                        { hanzi: "阿拉伯语", pinyin: "Ālābóyǔ", pinyinClean: "alaboyu", meaning: "Tiếng Ả Rập", meaningShort: "Tiếng Ả Rập" },
                        { hanzi: "德语", pinyin: "Déyǔ", pinyinClean: "deyu", meaning: "Tiếng Đức", meaningShort: "Tiếng Đức" },
                        { hanzi: "俄语", pinyin: "Éyǔ", pinyinClean: "eyu", meaning: "Tiếng Nga", meaningShort: "Tiếng Nga" },
                        { hanzi: "法语", pinyin: "Fǎyǔ", pinyinClean: "fayu", meaning: "Tiếng Pháp", meaningShort: "Tiếng Pháp" },
                        { hanzi: "韩国语", pinyin: "Hánguóyǔ", pinyinClean: "hanguoyu", meaning: "Tiếng Hàn", meaningShort: "Tiếng Hàn" },
                        { hanzi: "日语", pinyin: "Rìyǔ", pinyinClean: "riyu", meaning: "Tiếng Nhật", meaningShort: "Tiếng Nhật" },
                        { hanzi: "西班牙语", pinyin: "Xībānyáyǔ", pinyinClean: "xibanyayu", meaning: "Tiếng Tây Ban Nha", meaningShort: "Tiếng Tây Ban Nha" },
                        { hanzi: "对", pinyin: "duì", pinyinClean: "dui", meaning: "Đúng", meaningShort: "Đúng" },
                        { hanzi: "明天", pinyin: "míngtiān", pinyinClean: "mingtian", meaning: "Ngày mai", meaningShort: "Ngày mai" },
                        { hanzi: "见", pinyin: "jiàn", pinyinClean: "jian", meaning: "Gặp", meaningShort: "Gặp" },
                        { hanzi: "去", pinyin: "qù", pinyinClean: "qu", meaning: "Đi", meaningShort: "Đi" },
                        { hanzi: "邮局", pinyin: "yóujú", pinyinClean: "youju", meaning: "Bưu điện", meaningShort: "Bưu điện" },
                        { hanzi: "寄", pinyin: "jì", pinyinClean: "ji", meaning: "Gửi", meaningShort: "Gửi" },
                        { hanzi: "信", pinyin: "xìn", pinyinClean: "xin", meaning: "Thư, lá thư", meaningShort: "Thư" },
                        { hanzi: "银行", pinyin: "yínháng", pinyinClean: "yinhang", meaning: "Ngân hàng", meaningShort: "Ngân hàng" },
                        { hanzi: "取", pinyin: "qǔ", pinyinClean: "qu", meaning: "Rút tiền, lấy, nhấc", meaningShort: "Rút tiền" },
                        { hanzi: "钱", pinyin: "qián", pinyinClean: "qian", meaning: "Tiền", meaningShort: "Tiền" },
                        { hanzi: "六", pinyin: "liù", pinyinClean: "liu", meaning: "Sáu, số sáu", meaningShort: "Sáu" },
                        { hanzi: "七", pinyin: "qī", pinyinClean: "qi", meaning: "Bảy, số bảy", meaningShort: "Bảy" },
                        { hanzi: "九", pinyin: "jiǔ", pinyinClean: "jiu", meaning: "Chín, số chín", meaningShort: "Chín" }
                    ]
                },
                {
                    unitNumber: 4,
                    stageLabel: "Màn 4/15 • Bài 4 (Quyển 1)",
                    title: "Bài 4: 你去哪儿 — Bạn đi đâu đấy",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "今天", pinyin: "jīntiān", pinyinClean: "jintian", meaning: "Hôm nay", meaningShort: "Hôm nay" },
                        { hanzi: "昨天", pinyin: "zuótiān", pinyinClean: "zuotian", meaning: "Hôm qua", meaningShort: "Hôm qua" },
                        { hanzi: "天", pinyin: "tiān", pinyinClean: "tian", meaning: "Ngày, trời", meaningShort: "Ngày" },
                        { hanzi: "星期", pinyin: "xīngqī", pinyinClean: "xingqi", meaning: "Tuần, thứ", meaningShort: "Tuần" },
                        { hanzi: "星期一", pinyin: "xīngqīyī", pinyinClean: "xingqiyi", meaning: "Thứ hai", meaningShort: "Thứ hai" },
                        { hanzi: "星期二", pinyin: "xīngqī'èr", pinyinClean: "xingqier", meaning: "Thứ ba", meaningShort: "Thứ ba" },
                        { hanzi: "星期三", pinyin: "xīngqīsān", pinyinClean: "xingqisan", meaning: "Thứ tư", meaningShort: "Thứ tư" },
                        { hanzi: "星期四", pinyin: "xīngqīsì", pinyinClean: "xingqisi", meaning: "Thứ năm", meaningShort: "Thứ năm" },
                        { hanzi: "星期五", pinyin: "xīngqīwǔ", pinyinClean: "xingqiwu", meaning: "Thứ sáu", meaningShort: "Thứ sáu" },
                        { hanzi: "星期六", pinyin: "xīngqīliù", pinyinClean: "xingqiliu", meaning: "Thứ bảy", meaningShort: "Thứ bảy" },
                        { hanzi: "星期天", pinyin: "xīngqītiān", pinyinClean: "xingqitian", meaning: "Chủ nhật", meaningShort: "Chủ nhật" },
                        { hanzi: "几", pinyin: "jǐ", pinyinClean: "ji", meaning: "Mấy", meaningShort: "Mấy" },
                        { hanzi: "二", pinyin: "èr", pinyinClean: "er", meaning: "Hai, số hai", meaningShort: "Hai" },
                        { hanzi: "三", pinyin: "sān", pinyinClean: "san", meaning: "Ba, số ba", meaningShort: "Ba" },
                        { hanzi: "四", pinyin: "sì", pinyinClean: "si", meaning: "Bốn, số bốn", meaningShort: "Bốn" },
                        { hanzi: "哪儿", pinyin: "nǎr", pinyinClean: "nar", meaning: "Ở đâu, chỗ nào", meaningShort: "Ở đâu" },
                        { hanzi: "那儿", pinyin: "nàr", pinyinClean: "nar", meaning: "Chỗ đó, nơi đó", meaningShort: "Chỗ đó" },
                        { hanzi: "我", pinyin: "wǒ", pinyinClean: "wo", meaning: "Tôi", meaningShort: "Tôi" },
                        { hanzi: "回", pinyin: "huí", pinyinClean: "hui", meaning: "Về, quay về", meaningShort: "Về" },
                        { hanzi: "学校", pinyin: "xuéxiào", pinyinClean: "xuexiao", meaning: "Trường học", meaningShort: "Trường học" },
                        { hanzi: "再见", pinyin: "zàijiàn", pinyinClean: "zaijian", meaning: "Tạm biệt", meaningShort: "Tạm biệt" },
                        { hanzi: "对不起", pinyin: "duìbuqǐ", pinyinClean: "duibuqi", meaning: "Xin lỗi", meaningShort: "Xin lỗi" },
                        { hanzi: "没关系", pinyin: "méi guānxi", pinyinClean: "meiguanxi", meaning: "Không sao", meaningShort: "Không sao" },
                        { hanzi: "天安门", pinyin: "Tiān'ānmén", pinyinClean: "tiananmen", meaning: "Thiên An Môn", meaningShort: "Thiên An Môn" }
                    ]
                },
                {
                    unitNumber: 5,
                    stageLabel: "Màn 5/15 • Bài 5 (Quyển 1)",
                    title: "Bài 5: 这是王老师 — Đây là thầy giáo Vương",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "这", pinyin: "zhè", pinyinClean: "zhe", meaning: "Đây, này", meaningShort: "Đây" },
                        { hanzi: "是", pinyin: "shì", pinyinClean: "shi", meaning: "Là, phải, đúng", meaningShort: "Là" },
                        { hanzi: "老师", pinyin: "lǎoshī", pinyinClean: "laoshi", meaning: "Giáo viên, thầy cô", meaningShort: "Giáo viên" },
                        { hanzi: "您", pinyin: "nín", pinyinClean: "nin", meaning: "Ngài, ông, bà", meaningShort: "Ngài" },
                        { hanzi: "请", pinyin: "qǐng", pinyinClean: "qing", meaning: "Mời, xin", meaningShort: "Mời" },
                        { hanzi: "进", pinyin: "jìn", pinyinClean: "jin", meaning: "Vào, tiến vào", meaningShort: "Vào" },
                        { hanzi: "坐", pinyin: "zuò", pinyinClean: "zuo", meaning: "Ngồi", meaningShort: "Ngồi" },
                        { hanzi: "喝", pinyin: "hē", pinyinClean: "he", meaning: "Uống", meaningShort: "Uống" },
                        { hanzi: "茶", pinyin: "chá", pinyinClean: "cha", meaning: "Trà, chè", meaningShort: "Trà" },
                        { hanzi: "谢谢", pinyin: "xièxie", pinyinClean: "xiexie", meaning: "Cảm ơn", meaningShort: "Cảm ơn" },
                        { hanzi: "不客气", pinyin: "bú kèqi", pinyinClean: "bukeqi", meaning: "Không có gì, đừng khách sáo", meaningShort: "Không có gì" },
                        { hanzi: "客气", pinyin: "kèqi", pinyinClean: "keqi", meaning: "Khách sáo, lịch sự", meaningShort: "Khách sáo" },
                        { hanzi: "工作", pinyin: "gōngzuò", pinyinClean: "gongzuo", meaning: "Công việc, làm việc", meaningShort: "Công việc" },
                        { hanzi: "身体", pinyin: "shēntǐ", pinyinClean: "shenti", meaning: "Thân thể, sức khỏe", meaningShort: "Sức khỏe" },
                        { hanzi: "十", pinyin: "shí", pinyinClean: "shi", meaning: "Mười, số mười", meaningShort: "Mười" },
                        { hanzi: "日", pinyin: "rì", pinyinClean: "ri", meaning: "Ngày", meaningShort: "Ngày" }
                    ]
                },
                {
                    unitNumber: 6,
                    stageLabel: "Màn 6/15 • Bài 6 (Quyển 1)",
                    title: "Bài 6: 我学习汉语 — Tôi học tiếng Hán",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "请问", pinyin: "qǐngwèn", pinyinClean: "qingwen", meaning: "Xin hỏi", meaningShort: "Xin hỏi" },
                        { hanzi: "问", pinyin: "wèn", pinyinClean: "wen", meaning: "Hỏi", meaningShort: "Hỏi" },
                        { hanzi: "贵姓", pinyin: "guìxìng", pinyinClean: "guixing", meaning: "Họ gì, quý tính", meaningShort: "Họ gì" },
                        { hanzi: "姓", pinyin: "xìng", pinyinClean: "xing", meaning: "Họ", meaningShort: "Họ" },
                        { hanzi: "叫", pinyin: "jiào", pinyinClean: "jiao", meaning: "Gọi, tên là", meaningShort: "Gọi" },
                        { hanzi: "名字", pinyin: "míngzi", pinyinClean: "mingzi", meaning: "Tên", meaningShort: "Tên" },
                        { hanzi: "哪", pinyin: "nǎ", pinyinClean: "na", meaning: "Nào", meaningShort: "Nào" },
                        { hanzi: "国", pinyin: "guó", pinyinClean: "guo", meaning: "Nước, quốc gia", meaningShort: "Nước" },
                        { hanzi: "中国", pinyin: "Zhōngguó", pinyinClean: "zhongguo", meaning: "Trung Quốc", meaningShort: "Trung Quốc" },
                        { hanzi: "德国", pinyin: "Déguó", pinyinClean: "deguo", meaning: "Nước Đức, Đức", meaningShort: "Nước Đức" },
                        { hanzi: "俄国", pinyin: "Éguó", pinyinClean: "eguo", meaning: "Nước Nga, Nga", meaningShort: "Nước Nga" },
                        { hanzi: "法国", pinyin: "Fǎguó", pinyinClean: "faguo", meaning: "Nước Pháp, Pháp", meaningShort: "Nước Pháp" },
                        { hanzi: "韩国", pinyin: "Hánguó", pinyinClean: "hanguo", meaning: "Hàn Quốc, nước Hàn", meaningShort: "Hàn Quốc" },
                        { hanzi: "美国", pinyin: "Měiguó", pinyinClean: "meiguo", meaning: "Nước Mỹ, Mỹ", meaningShort: "Nước Mỹ" },
                        { hanzi: "日本", pinyin: "Rìběn", pinyinClean: "riben", meaning: "Nhật Bản, nước Nhật", meaningShort: "Nhật Bản" },
                        { hanzi: "英国", pinyin: "Yīngguó", pinyinClean: "yingguo", meaning: "Nước Anh, Anh", meaningShort: "Nước Anh" },
                        { hanzi: "人", pinyin: "rén", pinyinClean: "ren", meaning: "Người", meaningShort: "Người" },
                        { hanzi: "学习", pinyin: "xuéxí", pinyinClean: "xuexi", meaning: "Học tập, học", meaningShort: "Học tập" },
                        { hanzi: "汉字", pinyin: "Hànzì", pinyinClean: "hanzi", meaning: "Chữ Hán", meaningShort: "Chữ Hán" },
                        { hanzi: "发音", pinyin: "fāyīn", pinyinClean: "fayin", meaning: "Phát âm", meaningShort: "Phát âm" },
                        { hanzi: "什么", pinyin: "shénme", pinyinClean: "shenme", meaning: "Cái gì, gì", meaningShort: "Cái gì" },
                        { hanzi: "书", pinyin: "shū", pinyinClean: "shu", meaning: "Sách", meaningShort: "Sách" },
                        { hanzi: "谁", pinyin: "shéi", pinyinClean: "shei", meaning: "Ai", meaningShort: "Ai" },
                        { hanzi: "那", pinyin: "nà", pinyinClean: "na", meaning: "Đó, đấy, kia", meaningShort: "Đó" },
                        { hanzi: "杂志", pinyin: "zázhì", pinyinClean: "zazhi", meaning: "Tạp chí", meaningShort: "Tạp chí" },
                        { hanzi: "文", pinyin: "wén", pinyinClean: "wen", meaning: "Văn, chữ viết", meaningShort: "Văn" },
                        { hanzi: "中文", pinyin: "Zhōngwén", pinyinClean: "zhongwen", meaning: "Tiếng Trung, Trung văn", meaningShort: "Tiếng Trung" },
                        { hanzi: "英文", pinyin: "Yīngwén", pinyinClean: "yingwen", meaning: "Tiếng Anh, Anh văn", meaningShort: "Tiếng Anh" },
                        { hanzi: "朋友", pinyin: "péngyou", pinyinClean: "pengyou", meaning: "Bạn bè, người bạn", meaningShort: "Bạn bè" }
                    ]
                },
                {
                    unitNumber: 7,
                    stageLabel: "Màn 7/15 • Bài 7 (Quyển 1)",
                    title: "Bài 7: 你吃什么 — Bạn ăn gì",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "中午", pinyin: "zhōngwǔ", pinyinClean: "zhongwu", meaning: "Buổi trưa, trưa", meaningShort: "Buổi trưa" },
                        { hanzi: "吃", pinyin: "chī", pinyinClean: "chi", meaning: "Ăn", meaningShort: "Ăn" },
                        { hanzi: "饭", pinyin: "fàn", pinyinClean: "fan", meaning: "Cơm, bữa ăn", meaningShort: "Cơm" },
                        { hanzi: "食堂", pinyin: "shítáng", pinyinClean: "shitang", meaning: "Nhà ăn", meaningShort: "Nhà ăn" },
                        { hanzi: "馒头", pinyin: "mántou", pinyinClean: "mantou", meaning: "Màn thầu, bánh bao chay", meaningShort: "Màn thầu" },
                        { hanzi: "米饭", pinyin: "mǐfàn", pinyinClean: "mifan", meaning: "Cơm trắng, cơm", meaningShort: "Cơm trắng" },
                        { hanzi: "米", pinyin: "mǐ", pinyinClean: "mi", meaning: "Gạo", meaningShort: "Gạo" },
                        { hanzi: "要", pinyin: "yào", pinyinClean: "yao", meaning: "Muốn, cần", meaningShort: "Muốn" },
                        { hanzi: "个", pinyin: "gè", pinyinClean: "ge", meaning: "Cái, chiếc", meaningShort: "Cái" },
                        { hanzi: "碗", pinyin: "wǎn", pinyinClean: "wan", meaning: "Bát, cái bát", meaningShort: "Bát" },
                        { hanzi: "鸡蛋", pinyin: "jīdàn", pinyinClean: "jidan", meaning: "Trứng gà", meaningShort: "Trứng gà" },
                        { hanzi: "鸡", pinyin: "jī", pinyinClean: "ji", meaning: "Gà, con gà", meaningShort: "Gà" },
                        { hanzi: "蛋", pinyin: "dàn", pinyinClean: "dan", meaning: "Trứng", meaningShort: "Trứng" },
                        { hanzi: "汤", pinyin: "tāng", pinyinClean: "tang", meaning: "Canh, súp", meaningShort: "Canh" },
                        { hanzi: "啤酒", pinyin: "píjiǔ", pinyinClean: "pijiu", meaning: "Bia", meaningShort: "Bia" },
                        { hanzi: "酒", pinyin: "jiǔ", pinyinClean: "jiu", meaning: "Rượu", meaningShort: "Rượu" },
                        { hanzi: "这些", pinyin: "zhèxiē", pinyinClean: "zhexie", meaning: "Những cái này", meaningShort: "Những cái này" },
                        { hanzi: "些", pinyin: "xiē", pinyinClean: "xie", meaning: "Một vài, một số", meaningShort: "Một vài" },
                        { hanzi: "一些", pinyin: "yìxiē", pinyinClean: "yixie", meaning: "Một số, một ít", meaningShort: "Một số" },
                        { hanzi: "那些", pinyin: "nàxiē", pinyinClean: "naxie", meaning: "Những cái đó", meaningShort: "Những cái đó" },
                        { hanzi: "饺子", pinyin: "jiǎozi", pinyinClean: "jiaozi", meaning: "Sủi cảo, bánh chẻo", meaningShort: "Sủi cảo" },
                        { hanzi: "包子", pinyin: "bāozi", pinyinClean: "baozi", meaning: "Bánh bao", meaningShort: "Bánh bao" },
                        { hanzi: "面条儿", pinyin: "miàntiáor", pinyinClean: "miantiaor", meaning: "Mì sợi, phở", meaningShort: "Mì sợi" }
                    ]
                },
                {
                    unitNumber: 8,
                    stageLabel: "Màn 8/15 • Bài 8 (Quyển 1)",
                    title: "Bài 8: 苹果一斤多少钱 — Một cân táo bao nhiêu tiền",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "买", pinyin: "mǎi", pinyinClean: "mai", meaning: "Mua", meaningShort: "Mua" },
                        { hanzi: "水果", pinyin: "shuǐguǒ", pinyinClean: "shuiguo", meaning: "Hoa quả, trái cây", meaningShort: "Hoa quả" },
                        { hanzi: "苹果", pinyin: "píngguǒ", pinyinClean: "pingguo", meaning: "Táo, quả táo", meaningShort: "Táo" },
                        { hanzi: "斤", pinyin: "jīn", pinyinClean: "jin", meaning: "Cân, nửa kg", meaningShort: "Cân" },
                        { hanzi: "公斤", pinyin: "gōngjīn", pinyinClean: "gongjin", meaning: "Kg, ki-lô-gam", meaningShort: "Kg" },
                        { hanzi: "贵", pinyin: "guì", pinyinClean: "gui", meaning: "Đắt, quý", meaningShort: "Đắt" },
                        { hanzi: "了", pinyin: "le", pinyinClean: "le", meaning: "Rồi, trợ từ", meaningShort: "Rồi" },
                        { hanzi: "吧", pinyin: "ba", pinyinClean: "ba", meaning: "Nhé, đi, thôi", meaningShort: "Nhé" },
                        { hanzi: "多少", pinyin: "duōshao", pinyinClean: "duoshao", meaning: "Bao nhiêu", meaningShort: "Bao nhiêu" },
                        { hanzi: "多", pinyin: "duō", pinyinClean: "duo", meaning: "Nhiều", meaningShort: "Nhiều" },
                        { hanzi: "少", pinyin: "shǎo", pinyinClean: "shao", meaning: "Ít", meaningShort: "Ít" },
                        { hanzi: "块", pinyin: "kuài", pinyinClean: "kuai", meaning: "Đồng, tệ", meaningShort: "Đồng" },
                        { hanzi: "角", pinyin: "jiǎo", pinyinClean: "jiao", meaning: "Hào", meaningShort: "Hào" },
                        { hanzi: "分", pinyin: "fēn", pinyinClean: "fen", meaning: "Xu", meaningShort: "Xu" },
                        { hanzi: "还", pinyin: "hái", pinyinClean: "hai", meaning: "Vẫn còn, còn", meaningShort: "Còn" },
                        { hanzi: "别的", pinyin: "biéde", pinyinClean: "biede", meaning: "Cái khác, khác", meaningShort: "Khác" },
                        { hanzi: "橘子", pinyin: "júzi", pinyinClean: "juzi", meaning: "Quýt, quả quýt", meaningShort: "Quýt" },
                        { hanzi: "怎么", pinyin: "zěnme", pinyinClean: "zenme", meaning: "Thế nào, làm sao", meaningShort: "Thế nào" },
                        { hanzi: "卖", pinyin: "mài", pinyinClean: "mai", meaning: "Bán", meaningShort: "Bán" },
                        { hanzi: "两", pinyin: "liǎng", pinyinClean: "liang", meaning: "Hai", meaningShort: "Hai" },
                        { hanzi: "一共", pinyin: "yígòng", pinyinClean: "yigong", meaning: "Tổng cộng, tất cả", meaningShort: "Tổng cộng" },
                        { hanzi: "给", pinyin: "gěi", pinyinClean: "gei", meaning: "Đưa, cho", meaningShort: "Đưa" },
                        { hanzi: "找", pinyin: "zhǎo", pinyinClean: "zhao", meaning: "Trả tiền thừa, tìm", meaningShort: "Tìm" }
                    ]
                },
                {
                    unitNumber: 9,
                    stageLabel: "Màn 9/15 • Bài 9 (Quyển 1)",
                    title: "Bài 9: 我换人民币 — Tôi đổi tiền nhân dân tệ",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "下午", pinyin: "xiàwǔ", pinyinClean: "xiawu", meaning: "Buổi chiều, chiều", meaningShort: "Buổi chiều" },
                        { hanzi: "上午", pinyin: "shàngwǔ", pinyinClean: "shangwu", meaning: "Buổi sáng, sáng", meaningShort: "Buổi sáng" },
                        { hanzi: "图书馆", pinyin: "túshūguǎn", pinyinClean: "tushuguan", meaning: "Thư viện", meaningShort: "Thư viện" },
                        { hanzi: "换", pinyin: "huàn", pinyinClean: "huan", meaning: "Đổi", meaningShort: "Đổi" },
                        { hanzi: "小姐", pinyin: "xiǎojie", pinyinClean: "xiaojie", meaning: "Cô gái, tiểu thư", meaningShort: "Cô gái" },
                        { hanzi: "营业员", pinyin: "yíngyèyuán", pinyinClean: "yingyeyuan", meaning: "Nhân viên bán hàng, giao dịch viên", meaningShort: "Nhân viên" },
                        { hanzi: "人民币", pinyin: "rénmínbì", pinyinClean: "renminbi", meaning: "Nhân dân tệ", meaningShort: "Nhân dân tệ" },
                        { hanzi: "人民", pinyin: "rénmín", pinyinClean: "renmin", meaning: "Nhân dân", meaningShort: "Nhân dân" },
                        { hanzi: "百", pinyin: "bǎi", pinyinClean: "bai", meaning: "Trăm", meaningShort: "Trăm" },
                        { hanzi: "千", pinyin: "qiān", pinyinClean: "qian", meaning: "Nghìn", meaningShort: "Nghìn" },
                        { hanzi: "万", pinyin: "wàn", pinyinClean: "wan", meaning: "Vạn, mười nghìn", meaningShort: "Vạn" },
                        { hanzi: "美元", pinyin: "měiyuán", pinyinClean: "meiyuan", meaning: "Tiền Mỹ, đô la Mỹ", meaningShort: "Đô la Mỹ" },
                        { hanzi: "港币", pinyin: "gǎngbì", pinyinClean: "gangbi", meaning: "Đô la Hồng Kông", meaningShort: "Đô la HK" },
                        { hanzi: "日元", pinyin: "rìyuán", pinyinClean: "riyuan", meaning: "Yên Nhật", meaningShort: "Yên Nhật" },
                        { hanzi: "欧元", pinyin: "ōuyuán", pinyinClean: "ouyuan", meaning: "Đồng Euro", meaningShort: "Euro" },
                        { hanzi: "等", pinyin: "děng", pinyinClean: "deng", meaning: "Chờ đợi, đợi, chờ", meaningShort: "Chờ đợi" },
                        { hanzi: "一会儿", pinyin: "yíhuìr", pinyinClean: "yihuir", meaning: "Một lát, một chốc", meaningShort: "Một lát" },
                        { hanzi: "先生", pinyin: "xiānsheng", pinyinClean: "xiansheng", meaning: "Ông, ngài, tiên sinh", meaningShort: "Ông" },
                        { hanzi: "数", pinyin: "shǔ", pinyinClean: "shu", meaning: "Đếm", meaningShort: "Đếm" }
                    ]
                },
                {
                    unitNumber: 10,
                    stageLabel: "Màn 10/15 • Bài 10 (Quyển 1)",
                    title: "Bài 10: 他住哪儿 — Ông ấy sống ở đâu",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "办公室", pinyin: "bàngōngshì", pinyinClean: "bangongshi", meaning: "Phòng làm việc, văn phòng", meaningShort: "Văn phòng" },
                        { hanzi: "办公", pinyin: "bàngōng", pinyinClean: "bangong", meaning: "Làm việc", meaningShort: "Làm việc" },
                        { hanzi: "职员", pinyin: "zhíyuán", pinyinClean: "zhiyuan", meaning: "Nhân viên", meaningShort: "Nhân viên" },
                        { hanzi: "找", pinyin: "zhǎo", pinyinClean: "zhao", meaning: "Tìm, kiếm", meaningShort: "Tìm" },
                        { hanzi: "在", pinyin: "zài", pinyinClean: "zai", meaning: "Ở, có mặt", meaningShort: "Ở" },
                        { hanzi: "家", pinyin: "jiā", pinyinClean: "jia", meaning: "Nhà, gia đình", meaningShort: "Nhà" },
                        { hanzi: "呢", pinyin: "ne", pinyinClean: "ne", meaning: "Nhỉ, thế, còn", meaningShort: "Nhỉ" },
                        { hanzi: "住", pinyin: "zhù", pinyinClean: "zhu", meaning: "Sống, cư trú, ở", meaningShort: "Sống" },
                        { hanzi: "楼", pinyin: "lóu", pinyinClean: "lou", meaning: "Nhà, lầu, tòa nhà", meaningShort: "Tòa nhà" },
                        { hanzi: "门", pinyin: "mén", pinyinClean: "men", meaning: "Cửa, ngõ, cổng", meaningShort: "Cửa" },
                        { hanzi: "房间", pinyin: "fángjiān", pinyinClean: "fangjian", meaning: "Phòng, căn phòng", meaningShort: "Phòng" },
                        { hanzi: "号", pinyin: "hào", pinyinClean: "hao", meaning: "Số, cỡ", meaningShort: "Số" },
                        { hanzi: "知道", pinyin: "zhīdào", pinyinClean: "zhidao", meaning: "Biết", meaningShort: "Biết" },
                        { hanzi: "电话", pinyin: "diànhuà", pinyinClean: "dianhua", meaning: "Điện thoại", meaningShort: "Điện thoại" },
                        { hanzi: "电", pinyin: "diàn", pinyinClean: "dian", meaning: "Điện", meaningShort: "Điện" },
                        { hanzi: "号码", pinyin: "hàomǎ", pinyinClean: "haoma", meaning: "Số hiệu, mã số", meaningShort: "Số hiệu" },
                        { hanzi: "零", pinyin: "líng", pinyinClean: "ling", meaning: "Số không", meaningShort: "Số không" },
                        { hanzi: "手机", pinyin: "shǒujī", pinyinClean: "shouji", meaning: "Di động, điện thoại di động", meaningShort: "Di động" },
                        { hanzi: "手", pinyin: "shǒu", pinyinClean: "shou", meaning: "Tay", meaningShort: "Tay" }
                    ]
                },
                {
                    unitNumber: 11,
                    stageLabel: "Màn 11/15 • Bài 11 (Quyển 1)",
                    title: "Bài 11: 我们都是留学生 — Chúng tôi đều là lưu học sinh",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "秘书", pinyin: "mìshū", pinyinClean: "mishu", meaning: "Thư ký", meaningShort: "Thư ký" },
                        { hanzi: "先", pinyin: "xiān", pinyinClean: "xian", meaning: "Trước, đầu tiên", meaningShort: "Trước" },
                        { hanzi: "介绍", pinyin: "jièshào", pinyinClean: "jieshao", meaning: "Giới thiệu", meaningShort: "Giới thiệu" },
                        { hanzi: "一下儿", pinyin: "yíxiàr", pinyinClean: "yixiar", meaning: "Một lúc, một chút", meaningShort: "Một lúc" },
                        { hanzi: "位", pinyin: "wèi", pinyinClean: "wei", meaning: "Vị", meaningShort: "Vị" },
                        { hanzi: "教授", pinyin: "jiàoshòu", pinyinClean: "jiaoshou", meaning: "Giáo sư", meaningShort: "Giáo sư" },
                        { hanzi: "校长", pinyin: "xiàozhǎng", pinyinClean: "xiaozhang", meaning: "Hiệu trưởng", meaningShort: "Hiệu trưởng" },
                        { hanzi: "欢迎", pinyin: "huānyíng", pinyinClean: "huanying", meaning: "Hoan nghênh, chào đón", meaningShort: "Hoan nghênh" },
                        { hanzi: "留学生", pinyin: "liúxuéshēng", pinyinClean: "liuxuesheng", meaning: "Lưu học sinh, du học sinh", meaningShort: "Lưu học sinh" },
                        { hanzi: "留学", pinyin: "liúxué", pinyinClean: "liuxue", meaning: "Du học", meaningShort: "Du học" },
                        { hanzi: "也", pinyin: "yě", pinyinClean: "ye", meaning: "Cũng", meaningShort: "Cũng" },
                        { hanzi: "我们", pinyin: "wǒmen", pinyinClean: "women", meaning: "Chúng tôi, chúng ta", meaningShort: "Chúng tôi" },
                        { hanzi: "你们", pinyin: "nǐmen", pinyinClean: "nimen", meaning: "Các bạn, các anh", meaningShort: "Các bạn" },
                        { hanzi: "他们", pinyin: "tāmen", pinyinClean: "tamen", meaning: "Họ, bọn họ", meaningShort: "Họ" },
                        { hanzi: "都", pinyin: "dōu", pinyinClean: "dou", meaning: "Đều", meaningShort: "Đều" },
                        { hanzi: "和", pinyin: "hé", pinyinClean: "he", meaning: "Và, với", meaningShort: "Và" },
                        { hanzi: "俩", pinyin: "liǎ", pinyinClean: "lia", meaning: "Hai, hai người", meaningShort: "Hai người" },
                        { hanzi: "学生", pinyin: "xuésheng", pinyinClean: "xuesheng", meaning: "Học sinh, sinh viên", meaningShort: "Học sinh" },
                        { hanzi: "没什么", pinyin: "méi shénme", pinyinClean: "meishenme", meaning: "Không có gì", meaningShort: "Không có gì" }
                    ]
                },
                {
                    unitNumber: 12,
                    stageLabel: "Màn 12/15 • Bài 12 (Quyển 1)",
                    title: "Bài 12: 你在哪儿学习 — Bạn học ở đâu",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "语言", pinyin: "yǔyán", pinyinClean: "yuyan", meaning: "Ngôn ngữ", meaningShort: "Ngôn ngữ" },
                        { hanzi: "大学", pinyin: "dàxué", pinyinClean: "daxue", meaning: "Đại học, trường đại học", meaningShort: "Đại học" },
                        { hanzi: "怎么样", pinyin: "zěnmeyàng", pinyinClean: "zenmeyang", meaning: "Như thế nào, ra sao", meaningShort: "Như thế nào" },
                        { hanzi: "觉得", pinyin: "juéde", pinyinClean: "juede", meaning: "Cảm thấy, cảm giác", meaningShort: "Cảm thấy" },
                        { hanzi: "语法", pinyin: "yǔfǎ", pinyinClean: "yufa", meaning: "Ngữ pháp", meaningShort: "Ngữ pháp" },
                        { hanzi: "听", pinyin: "tīng", pinyinClean: "ting", meaning: "Nghe", meaningShort: "Nghe" },
                        { hanzi: "说", pinyin: "shuō", pinyinClean: "shuo", meaning: "Nói", meaningShort: "Nói" },
                        { hanzi: "比较", pinyin: "bǐjiào", pinyinClean: "bijiao", meaning: "So sánh, tương đối, khá", meaningShort: "Tương đối" },
                        { hanzi: "容易", pinyin: "róngyì", pinyinClean: "rongyi", meaning: "Dễ dàng, dễ", meaningShort: "Dễ dàng" },
                        { hanzi: "读", pinyin: "dú", pinyinClean: "du", meaning: "Đọc", meaningShort: "Đọc" },
                        { hanzi: "写", pinyin: "xiě", pinyinClean: "xie", meaning: "Viết", meaningShort: "Viết" },
                        { hanzi: "但是", pinyin: "dànshì", pinyinClean: "danshi", meaning: "Nhưng, thế nhưng", meaningShort: "Nhưng" },
                        { hanzi: "给", pinyin: "gěi", pinyinClean: "gei", meaning: "Tới, cho", meaningShort: "Cho" },
                        { hanzi: "新", pinyin: "xīn", pinyinClean: "xin", meaning: "Mới", meaningShort: "Mới" },
                        { hanzi: "同学", pinyin: "tóngxué", pinyinClean: "tongxue", meaning: "Bạn cùng học, bạn học", meaningShort: "Bạn học" },
                        { hanzi: "同屋", pinyin: "tóngwū", pinyinClean: "tongwu", meaning: "Bạn cùng phòng", meaningShort: "Bạn cùng phòng" },
                        { hanzi: "班", pinyin: "bān", pinyinClean: "ban", meaning: "Lớp, lớp học", meaningShort: "Lớp" }
                    ]
                },
                {
                    unitNumber: 13,
                    stageLabel: "Màn 13/15 • Bài 13 (Quyển 1)",
                    title: "Bài 13: 这是不是中药 — Đây không phải là thuốc Đông y",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "没有", pinyin: "méiyǒu", pinyinClean: "meiyou", meaning: "Không có", meaningShort: "Không có" },
                        { hanzi: "箱子", pinyin: "xiāngzi", pinyinClean: "xiangzi", meaning: "Cái hòm, vali", meaningShort: "Vali" },
                        { hanzi: "有", pinyin: "yǒu", pinyinClean: "you", meaning: "Có", meaningShort: "Có" },
                        { hanzi: "这儿", pinyin: "zhèr", pinyinClean: "zher", meaning: "Ở đây, chỗ này", meaningShort: "Ở đây" },
                        { hanzi: "重", pinyin: "zhòng", pinyinClean: "zhong", meaning: "Nặng", meaningShort: "Nặng" },
                        { hanzi: "黑", pinyin: "hēi", pinyinClean: "hei", meaning: "Đen, màu đen", meaningShort: "Đen" },
                        { hanzi: "红", pinyin: "hóng", pinyinClean: "hong", meaning: "Đỏ, hồng", meaningShort: "Đỏ" },
                        { hanzi: "轻", pinyin: "qīng", pinyinClean: "qing", meaning: "Nhẹ", meaningShort: "Nhẹ" },
                        { hanzi: "旧", pinyin: "jiù", pinyinClean: "jiu", meaning: "Cũ", meaningShort: "Cũ" },
                        { hanzi: "药", pinyin: "yào", pinyinClean: "yao", meaning: "Thuốc", meaningShort: "Thuốc" },
                        { hanzi: "中药", pinyin: "zhōngyào", pinyinClean: "zhongyao", meaning: "Thuốc Đông y", meaningShort: "Thuốc Đông y" },
                        { hanzi: "西药", pinyin: "xīyào", pinyinClean: "xiyao", meaning: "Thuốc Tây", meaningShort: "Thuốc Tây" },
                        { hanzi: "茶叶", pinyin: "cháyè", pinyinClean: "chaye", meaning: "Lá chè, lá trà", meaningShort: "Lá trà" },
                        { hanzi: "里", pinyin: "lǐ", pinyinClean: "li", meaning: "Trong, bên trong", meaningShort: "Bên trong" },
                        { hanzi: "日用品", pinyin: "rìyòngpǐn", pinyinClean: "riyongpin", meaning: "Đồ dùng hàng ngày", meaningShort: "Đồ dùng" },
                        { hanzi: "件", pinyin: "jiàn", pinyinClean: "jian", meaning: "Chiếc, cái, bộ", meaningShort: "Chiếc" },
                        { hanzi: "衣服", pinyin: "yīfu", pinyinClean: "yifu", meaning: "Quần áo", meaningShort: "Quần áo" },
                        { hanzi: "雨伞", pinyin: "yǔsǎn", pinyinClean: "yusan", meaning: "Ô, dù che mưa", meaningShort: "Ô dù" },
                        { hanzi: "雨", pinyin: "yǔ", pinyinClean: "yu", meaning: "Mưa", meaningShort: "Mưa" },
                        { hanzi: "瓶", pinyin: "píng", pinyinClean: "ping", meaning: "Bình, chai, lọ", meaningShort: "Bình" },
                        { hanzi: "香水", pinyin: "xiāngshuǐ", pinyinClean: "xiangshui", meaning: "Nước hoa", meaningShort: "Nước hoa" },
                        { hanzi: "水", pinyin: "shuǐ", pinyinClean: "shui", meaning: "Nước", meaningShort: "Nước" },
                        { hanzi: "本", pinyin: "běn", pinyinClean: "ben", meaning: "Quyển, cuốn", meaningShort: "Quyển" },
                        { hanzi: "词典", pinyin: "cídiǎn", pinyinClean: "cidian", meaning: "Từ điển", meaningShort: "Từ điển" },
                        { hanzi: "张", pinyin: "zhāng", pinyinClean: "zhang", meaning: "Tấm, tờ, chiếc", meaningShort: "Tấm" },
                        { hanzi: "光盘", pinyin: "guāngpán", pinyinClean: "guangpan", meaning: "Đĩa CD", meaningShort: "Đĩa CD" },
                        { hanzi: "支", pinyin: "zhī", pinyinClean: "zhi", meaning: "Cây, chiếc, cành", meaningShort: "Cây" },
                        { hanzi: "笔", pinyin: "bǐ", pinyinClean: "bi", meaning: "Bút, cây bút", meaningShort: "Bút" },
                        { hanzi: "椅子", pinyin: "yǐzi", pinyinClean: "yizi", meaning: "Ghế, cái ghế", meaningShort: "Ghế" }
                    ]
                },
                {
                    unitNumber: 14,
                    stageLabel: "Màn 14/15 • Bài 14 (Quyển 1)",
                    title: "Bài 14: 你的车是新的还是旧的 — Xe của bạn mới hay cũ",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "经理", pinyin: "jīnglǐ", pinyinClean: "jingli", meaning: "Giám đốc", meaningShort: "Giám đốc" },
                        { hanzi: "好久", pinyin: "hǎojiǔ", pinyinClean: "haojiu", meaning: "Lâu lắm rồi, rất lâu", meaningShort: "Rất lâu" },
                        { hanzi: "啊", pinyin: "à", pinyinClean: "a", meaning: "A, á, ơ", meaningShort: "A" },
                        { hanzi: "马马虎虎", pinyin: "mǎmahūhū", pinyinClean: "mamahuhu", meaning: "Tàm tạm, bình thường", meaningShort: "Bình thường" },
                        { hanzi: "最近", pinyin: "zuìjìn", pinyinClean: "zuijin", meaning: "Gần đây, dạo này", meaningShort: "Gần đây" },
                        { hanzi: "刚", pinyin: "gāng", pinyinClean: "gang", meaning: "Vừa, vừa mới", meaningShort: "Vừa mới" },
                        { hanzi: "开学", pinyin: "kāi xué", pinyinClean: "kaixue", meaning: "Khai giảng", meaningShort: "Khai giảng" },
                        { hanzi: "开", pinyin: "kāi", pinyinClean: "kai", meaning: "Mở, lái", meaningShort: "Mở" },
                        { hanzi: "有一点儿", pinyin: "yǒuyìdiǎnr", pinyinClean: "youyidianr", meaning: "Hơi, có một chút", meaningShort: "Hơi" },
                        { hanzi: "点儿", pinyin: "diǎnr", pinyinClean: "dianr", meaning: "Một chút, chút", meaningShort: "Một chút" },
                        { hanzi: "还是", pinyin: "háishi", pinyinClean: "haishi", meaning: "Hay là", meaningShort: "Hay là" },
                        { hanzi: "咖啡", pinyin: "kāfēi", pinyinClean: "kafei", meaning: "Cà phê", meaningShort: "Cà phê" },
                        { hanzi: "杯", pinyin: "bēi", pinyinClean: "bei", meaning: "Cốc, ly", meaningShort: "Cốc" },
                        { hanzi: "车", pinyin: "chē", pinyinClean: "che", meaning: "Xe", meaningShort: "Xe" },
                        { hanzi: "自行车", pinyin: "zìxíngchē", pinyinClean: "zixingche", meaning: "Xe đạp", meaningShort: "Xe đạp" },
                        { hanzi: "汽车", pinyin: "qìchē", pinyinClean: "qiche", meaning: "Xe ô tô, ô tô", meaningShort: "Ô tô" },
                        { hanzi: "摩托车", pinyin: "mótuōchē", pinyinClean: "motuoche", meaning: "Xe máy, mô tô", meaningShort: "Xe máy" },
                        { hanzi: "出租车", pinyin: "chūzūchē", pinyinClean: "chuzuche", meaning: "Xe taxi, taxi", meaningShort: "Taxi" },
                        { hanzi: "颜色", pinyin: "yánsè", pinyinClean: "yanse", meaning: "Màu sắc", meaningShort: "Màu sắc" },
                        { hanzi: "蓝", pinyin: "lán", pinyinClean: "lan", meaning: "Màu xanh lam, xanh lam", meaningShort: "Xanh lam" },
                        { hanzi: "辆", pinyin: "liàng", pinyinClean: "liang", meaning: "Chiếc, lượng từ xe", meaningShort: "Chiếc" },
                        { hanzi: "来", pinyin: "lái", pinyinClean: "lai", meaning: "Đến, tới", meaningShort: "Đến" }
                    ]
                },
                {
                    unitNumber: 15,
                    stageLabel: "Màn 15/15 • Bài 15 (Quyển 1)",
                    title: "Bài 15: 你们公司有多少职员 — Công ty của ông có bao nhiêu nhân viên",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "全", pinyin: "quán", pinyinClean: "quan", meaning: "Toàn, cả, toàn bộ", meaningShort: "Toàn bộ" },
                        { hanzi: "照片", pinyin: "zhàopiàn", pinyinClean: "zhaopian", meaning: "Cái ảnh, bức ảnh", meaningShort: "Bức ảnh" },
                        { hanzi: "看", pinyin: "kàn", pinyinClean: "kan", meaning: "Nhìn, xem", meaningShort: "Xem" },
                        { hanzi: "姐姐", pinyin: "jiějie", pinyinClean: "jiejie", meaning: "Chị gái", meaningShort: "Chị gái" },
                        { hanzi: "只", pinyin: "zhǐ", pinyinClean: "zhi", meaning: "Chỉ", meaningShort: "Chỉ" },
                        { hanzi: "做", pinyin: "zuò", pinyinClean: "zuo", meaning: "Làm", meaningShort: "Làm" },
                        { hanzi: "大夫", pinyin: "dàifu", pinyinClean: "daifu", meaning: "Bác sĩ", meaningShort: "Bác sĩ" },
                        { hanzi: "医院", pinyin: "yīyuàn", pinyinClean: "yiyuan", meaning: "Bệnh viện", meaningShort: "Bệnh viện" },
                        { hanzi: "公司", pinyin: "gōngsī", pinyinClean: "gongsi", meaning: "Công ty", meaningShort: "Công ty" },
                        { hanzi: "商店", pinyin: "shāngdiàn", pinyinClean: "shangdian", meaning: "Cửa hàng", meaningShort: "Cửa hàng" },
                        { hanzi: "律师", pinyin: "lǜshī", pinyinClean: "lvshi", meaning: "Luật sư", meaningShort: "Luật sư" },
                        { hanzi: "外贸", pinyin: "wàimào", pinyinClean: "waimao", meaning: "Thương mại quốc tế, ngoại thương", meaningShort: "Ngoại thương" },
                        { hanzi: "小", pinyin: "xiǎo", pinyinClean: "xiao", meaning: "Nhỏ, bé", meaningShort: "Nhỏ" },
                        { hanzi: "大概", pinyin: "dàgài", pinyinClean: "dagai", meaning: "Đại khái, khoảng", meaningShort: "Khoảng" },
                        { hanzi: "外国", pinyin: "wàiguó", pinyinClean: "waiguo", meaning: "Nước ngoài, ngoại quốc", meaningShort: "Nước ngoài" }
                    ]
                }
            ]
        },
        {
            id: "hsk2_full",
            name: "HSK 2 • Giáo Trình Hán Ngữ Quyển 2 (Bài 16–30)",
            badge: "HSK 2 • QUYỂN 2",
            description: "Trọn bộ 15 Bài học (Bài 16 – Bài 30) theo đúng Giáo Trình Hán Ngữ Tập 1 - Quyển Hạ (NXB ĐH Ngôn Ngữ Bắc Kinh). Hỗ trợ cả Gõ Pinyin & Gõ Nghĩa.",
            units: [
                {
                    unitNumber: 16,
                    stageLabel: "Màn 1/15 • Bài 16 (Quyển 2)",
                    title: "Bài 16: 你常去图书馆吗 — Bạn có thường xuyên đến thư viện không",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "现在", pinyin: "xiànzài", pinyinClean: "xianzai", meaning: "Bây giờ, hiện tại", meaningShort: "Bây giờ" },
                        { hanzi: "跟", pinyin: "gēn", pinyinClean: "gen", meaning: "Cùng, với", meaningShort: "Cùng" },
                        { hanzi: "一起", pinyin: "yìqǐ", pinyinClean: "yiqi", meaning: "Cùng nhau", meaningShort: "Cùng nhau" },
                        { hanzi: "咱们", pinyin: "zánmen", pinyinClean: "zanmen", meaning: "Chúng ta, chúng tôi", meaningShort: "Chúng ta" },
                        { hanzi: "走", pinyin: "zǒu", pinyinClean: "zou", meaning: "Đi, bước", meaningShort: "Đi" },
                        { hanzi: "常常", pinyin: "chángcháng", pinyinClean: "changchang", meaning: "Thường xuyên, thường", meaningShort: "Thường xuyên" },
                        { hanzi: "有时候", pinyin: "yǒu shíhou", pinyinClean: "youshihou", meaning: "Có lúc, thỉnh thoảng", meaningShort: "Có lúc" },
                        { hanzi: "时候", pinyin: "shíhou", pinyinClean: "shihou", meaning: "Lúc, khi", meaningShort: "Lúc" },
                        { hanzi: "借", pinyin: "jiè", pinyinClean: "jie", meaning: "Mượn, vay", meaningShort: "Mượn" },
                        { hanzi: "上网", pinyin: "shàng wǎng", pinyinClean: "shangwang", meaning: "Lên mạng", meaningShort: "Lên mạng" },
                        { hanzi: "网", pinyin: "wǎng", pinyinClean: "wang", meaning: "Mạng, lưới", meaningShort: "Mạng" },
                        { hanzi: "查", pinyin: "chá", pinyinClean: "cha", meaning: "Kiểm tra, tra cứu", meaningShort: "Kiểm tra" },
                        { hanzi: "资料", pinyin: "zīliào", pinyinClean: "ziliao", meaning: "Tư liệu, tài liệu", meaningShort: "Tư liệu" },
                        { hanzi: "总是", pinyin: "zǒngshì", pinyinClean: "zongshi", meaning: "Luôn luôn, tổng", meaningShort: "Luôn luôn" },
                        { hanzi: "宿舍", pinyin: "sùshè", pinyinClean: "sushe", meaning: "Ký túc xá, ký túc", meaningShort: "Ký túc" },
                        { hanzi: "安静", pinyin: "ānjìng", pinyinClean: "anjing", meaning: "Yên tĩnh, yên lặng", meaningShort: "Yên lặng" },
                        { hanzi: "晚上", pinyin: "wǎnshang", pinyinClean: "wanshang", meaning: "Buổi tối, tối", meaningShort: "Buổi tối" },
                        { hanzi: "复习", pinyin: "fùxí", pinyinClean: "fuxi", meaning: "Ôn tập", meaningShort: "Ôn tập" },
                        { hanzi: "课文", pinyin: "kèwén", pinyinClean: "kewen", meaning: "Bài khóa, học bài đọc", meaningShort: "Bài khóa" },
                        { hanzi: "预习", pinyin: "yùxí", pinyinClean: "yuxi", meaning: "Chuẩn bị bài, ôn tập", meaningShort: "Chuẩn bị bài" },
                        { hanzi: "生词", pinyin: "shēngcí", pinyinClean: "shengci", meaning: "Từ mới", meaningShort: "Từ mới" },
                        { hanzi: "或者", pinyin: "huòzhě", pinyinClean: "huozhe", meaning: "Hoặc là", meaningShort: "Hoặc là" },
                        { hanzi: "练习", pinyin: "liànxí", pinyinClean: "lianxi", meaning: "Luyện tập, bài tập", meaningShort: "Luyện tập" },
                        { hanzi: "聊天儿", pinyin: "liáo tiānr", pinyinClean: "liaotianr", meaning: "Nói chuyện, tán gẫu", meaningShort: "Nói chuyện" },
                        { hanzi: "收发", pinyin: "shōufā", pinyinClean: "shoufa", meaning: "Thu phát, nhận gửi", meaningShort: "Thu phát" },
                        { hanzi: "收", pinyin: "shōu", pinyinClean: "shou", meaning: "Thu, nhận", meaningShort: "Thu" },
                        { hanzi: "发", pinyin: "fā", pinyinClean: "fa", meaning: "Gửi, phát", meaningShort: "Gửi" },
                        { hanzi: "伊妹儿", pinyin: "yīmèir", pinyinClean: "yimeir", meaning: "Email, thư điện tử", meaningShort: "Email" },
                        { hanzi: "电影", pinyin: "diànyǐng", pinyinClean: "dianying", meaning: "Phim, điện ảnh", meaningShort: "Phim" },
                        { hanzi: "电视剧", pinyin: "diànshìjù", pinyinClean: "dianshiju", meaning: "Phim truyền hình", meaningShort: "Phim bộ" },
                        { hanzi: "电视", pinyin: "diànshì", pinyinClean: "dianshi", meaning: "Ti vi, truyền hình", meaningShort: "Ti vi" },
                        { hanzi: "休息", pinyin: "xiūxi", pinyinClean: "xiuxi", meaning: "Nghỉ ngơi", meaningShort: "Nghỉ ngơi" },
                        { hanzi: "公园", pinyin: "gōngyuán", pinyinClean: "gongyuan", meaning: "Công viên", meaningShort: "Công viên" },
                        { hanzi: "超市", pinyin: "chāoshì", pinyinClean: "chaoshi", meaning: "Siêu thị", meaningShort: "Siêu thị" },
                        { hanzi: "东西", pinyin: "dōngxi", pinyinClean: "dongxi", meaning: "Đồ vật, đồ đạc", meaningShort: "Đồ vật" }
                    ]
                },
                {
                    unitNumber: 17,
                    stageLabel: "Màn 2/15 • Bài 17 (Quyển 2)",
                    title: "Bài 17: 他在做什么呢 — Bạn ấy đang làm gì đấy",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "在", pinyin: "zài", pinyinClean: "zai", meaning: "Đang ở, đang, ở", meaningShort: "Đang ở" },
                        { hanzi: "出来", pinyin: "chūlai", pinyinClean: "chulai", meaning: "Đi ra, ra ngoài", meaningShort: "Đi ra" },
                        { hanzi: "来", pinyin: "lái", pinyinClean: "lai", meaning: "Đến, tới", meaningShort: "Đến" },
                        { hanzi: "正在", pinyin: "zhèngzài", pinyinClean: "zhengzai", meaning: "Đang", meaningShort: "Đang" },
                        { hanzi: "音乐", pinyin: "yīnyuè", pinyinClean: "yinyue", meaning: "Âm nhạc, nhạc", meaningShort: "Âm nhạc" },
                        { hanzi: "没有", pinyin: "méiyǒu", pinyinClean: "meiyou", meaning: "Không có, chưa", meaningShort: "Không có" },
                        { hanzi: "正", pinyin: "zhèng", pinyinClean: "zheng", meaning: "Đúng lúc, đang", meaningShort: "Đúng lúc" },
                        { hanzi: "录音", pinyin: "lùyīn", pinyinClean: "luyin", meaning: "Ghi âm, băng ghi âm", meaningShort: "Ghi âm" },
                        { hanzi: "事", pinyin: "shì", pinyinClean: "shi", meaning: "Việc, sự việc", meaningShort: "Việc" },
                        { hanzi: "书店", pinyin: "shūdiàn", pinyinClean: "shudian", meaning: "Hiệu sách, nhà sách", meaningShort: "Hiệu sách" },
                        { hanzi: "想", pinyin: "xiǎng", pinyinClean: "xiang", meaning: "Nghĩ, muốn, nhớ", meaningShort: "Nghĩ" },
                        { hanzi: "汉英", pinyin: "Hàn-Yīng", pinyinClean: "hanying", meaning: "Hán Anh", meaningShort: "Hán Anh" },
                        { hanzi: "骑", pinyin: "qí", pinyinClean: "qi", meaning: "Cưỡi, đi xe đạp", meaningShort: "Cưỡi" },
                        { hanzi: "行", pinyin: "xíng", pinyinClean: "xing", meaning: "Được, ổn", meaningShort: "Được" },
                        { hanzi: "门", pinyin: "mén", pinyinClean: "men", meaning: "Môn học, cửa", meaningShort: "Môn học" },
                        { hanzi: "课", pinyin: "kè", pinyinClean: "ke", meaning: "Bài học, môn học", meaningShort: "Bài học" },
                        { hanzi: "综合", pinyin: "zōnghé", pinyinClean: "zonghe", meaning: "Tổng hợp", meaningShort: "Tổng hợp" },
                        { hanzi: "口语", pinyin: "kǒuyǔ", pinyinClean: "kouyu", meaning: "Khẩu ngữ, văn nói", meaningShort: "Khẩu ngữ" },
                        { hanzi: "听力", pinyin: "tīnglì", pinyinClean: "tingli", meaning: "Năng lực nghe, nghe hiểu", meaningShort: "Nghe hiểu" },
                        { hanzi: "阅读", pinyin: "yuèdú", pinyinClean: "yuedu", meaning: "Đọc hiểu, đọc", meaningShort: "Đọc hiểu" },
                        { hanzi: "文化", pinyin: "wénhuà", pinyinClean: "wenhua", meaning: "Văn hóa", meaningShort: "Văn hóa" },
                        { hanzi: "体育", pinyin: "tǐyù", pinyinClean: "tiyu", meaning: "Thể dục, thể thao", meaningShort: "Thể dục" },
                        { hanzi: "教", pinyin: "jiāo", pinyinClean: "jiao", meaning: "Dạy, dạy học", meaningShort: "Dạy" }
                    ]
                },
                {
                    unitNumber: 18,
                    stageLabel: "Màn 3/15 • Bài 18 (Quyển 2)",
                    title: "Bài 18: 我去邮局寄包裹 — Tôi đi bưu điện gửi bưu phẩm",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "包裹", pinyin: "bāoguǒ", pinyinClean: "baoguo", meaning: "Bưu kiện, bưu phẩm", meaningShort: "Bưu kiện" },
                        { hanzi: "顺便", pinyin: "shùnbiàn", pinyinClean: "shunbian", meaning: "Thuận tiện, tiện thể", meaningShort: "Thuận tiện" },
                        { hanzi: "替", pinyin: "tì", pinyinClean: "ti", meaning: "Thay thế, làm hộ", meaningShort: "Thay thế" },
                        { hanzi: "邮票", pinyin: "yóupiào", pinyinClean: "youpiao", meaning: "Tem, tem thư", meaningShort: "Tem" },
                        { hanzi: "份", pinyin: "fèn", pinyinClean: "fen", meaning: "Phần, số báo", meaningShort: "Phần" },
                        { hanzi: "青年", pinyin: "qīngnián", pinyinClean: "qingnian", meaning: "Thanh niên", meaningShort: "Thanh niên" },
                        { hanzi: "报", pinyin: "bào", pinyinClean: "bao", meaning: "Báo, tờ báo", meaningShort: "Báo" },
                        { hanzi: "拿", pinyin: "ná", pinyinClean: "na", meaning: "Cầm, lấy", meaningShort: "Cầm" },
                        { hanzi: "不用", pinyin: "búyòng", pinyinClean: "buyong", meaning: "Không cần", meaningShort: "Không cần" },
                        { hanzi: "用", pinyin: "yòng", pinyinClean: "yong", meaning: "Dùng, sử dụng", meaningShort: "Dùng" },
                        { hanzi: "旅行", pinyin: "lǚxíng", pinyinClean: "lvxing", meaning: "Du lịch", meaningShort: "Du lịch" },
                        { hanzi: "代表", pinyin: "dàibiǎo", pinyinClean: "daibiao", meaning: "Đại biểu", meaningShort: "Đại biểu" },
                        { hanzi: "团", pinyin: "tuán", pinyinClean: "tuan", meaning: "Đoàn, nhóm", meaningShort: "Đoàn" },
                        { hanzi: "参观", pinyin: "cānguān", pinyinClean: "canguan", meaning: "Tham quan, thăm quan", meaningShort: "Tham quan" },
                        { hanzi: "当", pinyin: "dāng", pinyinClean: "dang", meaning: "Đảm nhận, làm", meaningShort: "Đảm nhận" },
                        { hanzi: "翻译", pinyin: "fānyì", pinyinClean: "fanyi", meaning: "Phiên dịch, dịch", meaningShort: "Phiên dịch" },
                        { hanzi: "飞机", pinyin: "fēijī", pinyinClean: "feiji", meaning: "Máy bay", meaningShort: "Máy bay" },
                        { hanzi: "飞", pinyin: "fēi", pinyinClean: "fei", meaning: "Bay", meaningShort: "Bay" },
                        { hanzi: "火车", pinyin: "huǒchē", pinyinClean: "huoche", meaning: "Tàu hỏa, xe lửa", meaningShort: "Tàu hỏa" },
                        { hanzi: "回来", pinyin: "huílái", pinyinClean: "huilai", meaning: "Quay về, trở về", meaningShort: "Quay về" },
                        { hanzi: "办", pinyin: "bàn", pinyinClean: "ban", meaning: "Giải quyết, làm", meaningShort: "Giải quyết" },
                        { hanzi: "帮", pinyin: "bāng", pinyinClean: "bang", meaning: "Giúp, giúp đỡ", meaningShort: "Giúp" },
                        { hanzi: "浇", pinyin: "jiāo", pinyinClean: "jiao", meaning: "Tưới, tưới nước", meaningShort: "Tưới" },
                        { hanzi: "花", pinyin: "huā", pinyinClean: "hua", meaning: "Hoa, bông hoa", meaningShort: "Hoa" },
                        { hanzi: "没问题", pinyin: "méi wèntí", pinyinClean: "meiwenti", meaning: "Không có gì, không vấn đề", meaningShort: "Không vấn đề" },
                        { hanzi: "问题", pinyin: "wèntí", pinyinClean: "wenti", meaning: "Vấn đề, câu hỏi", meaningShort: "Vấn đề" }
                    ]
                },
                {
                    unitNumber: 19,
                    stageLabel: "Màn 4/15 • Bài 19 (Quyển 2)",
                    title: "Bài 19: 可以试试吗 — Có thể thử được không",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "羽绒服", pinyin: "yǔróngfú", pinyinClean: "yurongfu", meaning: "Áo lông vũ, áo phao", meaningShort: "Áo lông vũ" },
                        { hanzi: "又", pinyin: "yòu", pinyinClean: "you", meaning: "Vừa, lại", meaningShort: "Lại" },
                        { hanzi: "好看", pinyin: "hǎokàn", pinyinClean: "haokan", meaning: "Đẹp, ưa nhìn", meaningShort: "Đẹp" },
                        { hanzi: "便宜", pinyin: "piányi", pinyinClean: "pianyi", meaning: "Rẻ", meaningShort: "Rẻ" },
                        { hanzi: "长", pinyin: "cháng", pinyinClean: "chang", meaning: "Dài", meaningShort: "Dài" },
                        { hanzi: "短", pinyin: "duǎn", pinyinClean: "duan", meaning: "Ngắn", meaningShort: "Ngắn" },
                        { hanzi: "一点儿", pinyin: "yìdiǎnr", pinyinClean: "yidianr", meaning: "Một chút, một ít", meaningShort: "Một chút" },
                        { hanzi: "可以", pinyin: "kěyǐ", pinyinClean: "keyi", meaning: "Có thể, được", meaningShort: "Có thể" },
                        { hanzi: "试", pinyin: "shì", pinyinClean: "shi", meaning: "Thử", meaningShort: "Thử" },
                        { hanzi: "当然", pinyin: "dāngrán", pinyinClean: "dangran", meaning: "Đương nhiên, tất nhiên", meaningShort: "Đương nhiên" },
                        { hanzi: "肥", pinyin: "féi", pinyinClean: "fei", meaning: "Rộng, béo", meaningShort: "Rộng" },
                        { hanzi: "胖", pinyin: "pàng", pinyinClean: "pang", meaning: "Béo, mập", meaningShort: "Béo" },
                        { hanzi: "瘦", pinyin: "shòu", pinyinClean: "shou", meaning: "Gầy, chật", meaningShort: "Gầy" },
                        { hanzi: "合适", pinyin: "héshì", pinyinClean: "heshi", meaning: "Thích hợp, vừa vặn", meaningShort: "Thích hợp" },
                        { hanzi: "深", pinyin: "shēn", pinyinClean: "shen", meaning: "Sâu, đậm", meaningShort: "Sâu" },
                        { hanzi: "浅", pinyin: "qiǎn", pinyinClean: "qian", meaning: "Nhạt, nông", meaningShort: "Nhạt" },
                        { hanzi: "种", pinyin: "zhǒng", pinyinClean: "zhong", meaning: "Loại, chủng, kiểu", meaningShort: "Loại" },
                        { hanzi: "打折", pinyin: "dǎ zhé", pinyinClean: "dazhe", meaning: "Giảm giá, chiết khấu", meaningShort: "Giảm giá" },
                        { hanzi: "毛衣", pinyin: "máoyī", pinyinClean: "maoyi", meaning: "Áo len", meaningShort: "Áo len" }
                    ]
                },
                {
                    unitNumber: 20,
                    stageLabel: "Màn 5/15 • Bài 20 (Quyển 2)",
                    title: "Bài 20: 祝你生日快乐 — Chúc bạn sinh nhật vui vẻ",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "年", pinyin: "nián", pinyinClean: "nian", meaning: "Năm", meaningShort: "Năm" },
                        { hanzi: "今年", pinyin: "jīnnián", pinyinClean: "jinnian", meaning: "Năm nay", meaningShort: "Năm nay" },
                        { hanzi: "明年", pinyin: "míngnián", pinyinClean: "mingnian", meaning: "Sang năm, năm sau", meaningShort: "Sang năm" },
                        { hanzi: "后年", pinyin: "hòunián", pinyinClean: "hounian", meaning: "Năm kia, sang năm nữa", meaningShort: "Năm kia" },
                        { hanzi: "去年", pinyin: "qùnián", pinyinClean: "qunian", meaning: "Năm ngoái", meaningShort: "Năm ngoái" },
                        { hanzi: "毕业", pinyin: "bì yè", pinyinClean: "biye", meaning: "Tốt nghiệp", meaningShort: "Tốt nghiệp" },
                        { hanzi: "多", pinyin: "duō", pinyinClean: "duo", meaning: "Nhiều, bao nhiêu", meaningShort: "Nhiều" },
                        { hanzi: "多大", pinyin: "duō dà", pinyinClean: "duoda", meaning: "Bao nhiêu tuổi, bao lớn", meaningShort: "Bao tuổi" },
                        { hanzi: "岁", pinyin: "suì", pinyinClean: "sui", meaning: "Tuổi", meaningShort: "Tuổi" },
                        { hanzi: "属", pinyin: "shǔ", pinyinClean: "shu", meaning: "Thuộc, cầm tinh", meaningShort: "Thuộc" },
                        { hanzi: "狗", pinyin: "gǒu", pinyinClean: "gou", meaning: "Chó, con chó", meaningShort: "Chó" },
                        { hanzi: "月", pinyin: "yuè", pinyinClean: "yue", meaning: "Tháng, trăng", meaningShort: "Tháng" },
                        { hanzi: "号", pinyin: "hào", pinyinClean: "hao", meaning: "Số, ngày", meaningShort: "Số" },
                        { hanzi: "生日", pinyin: "shēngri", pinyinClean: "shengri", meaning: "Sinh nhật", meaningShort: "Sinh nhật" },
                        { hanzi: "正好", pinyin: "zhènghǎo", pinyinClean: "zhenghao", meaning: "Vừa phải, đúng lúc", meaningShort: "Vừa phải" },
                        { hanzi: "打算", pinyin: "dǎsuan", pinyinClean: "dasuan", meaning: "Dự định, định", meaningShort: "Dự định" },
                        { hanzi: "过", pinyin: "guò", pinyinClean: "guo", meaning: "Qua, đón", meaningShort: "Qua" },
                        { hanzi: "准备", pinyin: "zhǔnbèi", pinyinClean: "zhunbei", meaning: "Chuẩn bị", meaningShort: "Chuẩn bị" },
                        { hanzi: "举行", pinyin: "jǔxíng", pinyinClean: "juxing", meaning: "Tổ chức, cử hành", meaningShort: "Tổ chức" },
                        { hanzi: "晚会", pinyin: "wǎnhuì", pinyinClean: "wanhui", meaning: "Dạ hội, liên hoan tối", meaningShort: "Dạ hội" },
                        { hanzi: "参加", pinyin: "cānjiā", pinyinClean: "canjia", meaning: "Tham gia", meaningShort: "Tham gia" },
                        { hanzi: "时间", pinyin: "shíjiān", pinyinClean: "shijian", meaning: "Thời gian", meaningShort: "Thời gian" },
                        { hanzi: "点钟", pinyin: "diǎnzhōng", pinyinClean: "dianzhong", meaning: "Giờ", meaningShort: "Giờ" },
                        { hanzi: "就", pinyin: "jiù", pinyinClean: "jiu", meaning: "Thì, liền, ngay", meaningShort: "Liền" },
                        { hanzi: "一定", pinyin: "yídìng", pinyinClean: "yiding", meaning: "Nhất định, chắc chắn", meaningShort: "Nhất định" },
                        { hanzi: "祝", pinyin: "zhù", pinyinClean: "zhu", meaning: "Chúc", meaningShort: "Chúc" },
                        { hanzi: "快乐", pinyin: "kuàilè", pinyinClean: "kuaile", meaning: "Vui vẻ, hạnh phúc", meaningShort: "Vui vẻ" }
                    ]
                },
                {
                    unitNumber: 21,
                    stageLabel: "Màn 6/15 • Bài 21 (Quyển 2)",
                    title: "Bài 21: 我们明天七点一刻出发 — Ngày mai chúng ta xuất phát lúc 7h15",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "每", pinyin: "měi", pinyinClean: "mei", meaning: "Mỗi", meaningShort: "Mỗi" },
                        { hanzi: "早上", pinyin: "zǎoshang", pinyinClean: "zaoshang", meaning: "Buổi sáng, sáng sớm", meaningShort: "Buổi sáng" },
                        { hanzi: "半", pinyin: "bàn", pinyinClean: "ban", meaning: "Nửa, rưỡi", meaningShort: "Nửa" },
                        { hanzi: "起床", pinyin: "qǐ chuáng", pinyinClean: "qichuang", meaning: "Ngủ dậy, thức dậy", meaningShort: "Ngủ dậy" },
                        { hanzi: "床", pinyin: "chuáng", pinyinClean: "chuang", meaning: "Giường, cái giường", meaningShort: "Giường" },
                        { hanzi: "早饭", pinyin: "zǎofàn", pinyinClean: "zaofan", meaning: "Cơm sáng, bữa sáng", meaningShort: "Cơm sáng" },
                        { hanzi: "午饭", pinyin: "wǔfàn", pinyinClean: "wufan", meaning: "Cơm trưa, bữa trưa", meaningShort: "Cơm trưa" },
                        { hanzi: "晚饭", pinyin: "wǎnfàn", pinyinClean: "wanfan", meaning: "Cơm tối, bữa tối", meaningShort: "Cơm tối" },
                        { hanzi: "以后", pinyin: "yǐhòu", pinyinClean: "yihou", meaning: "Sau này, về sau", meaningShort: "Sau này" },
                        { hanzi: "差", pinyin: "chà", pinyinClean: "cha", meaning: "Kém, thiếu", meaningShort: "Kém" },
                        { hanzi: "刻", pinyin: "kè", pinyinClean: "ke", meaning: "Khắc, mười lăm phút", meaningShort: "Khắc" },
                        { hanzi: "分钟", pinyin: "fēnzhōng", pinyinClean: "fenzhong", meaning: "Phút", meaningShort: "Phút" },
                        { hanzi: "点", pinyin: "diǎn", pinyinClean: "dian", meaning: "Giờ, điểm", meaningShort: "Giờ" },
                        { hanzi: "上课", pinyin: "shàng kè", pinyinClean: "shangke", meaning: "Lên lớp, vào học", meaningShort: "Lên lớp" },
                        { hanzi: "节", pinyin: "jié", pinyinClean: "jie", meaning: "Tiết, lễ", meaningShort: "Tiết" },
                        { hanzi: "教室", pinyin: "jiàoshì", pinyinClean: "jiaoshi", meaning: "Phòng học, lớp học", meaningShort: "Phòng học" },
                        { hanzi: "操场", pinyin: "cāochǎng", pinyinClean: "caochang", meaning: "Sân tập thể dục, sân vận động", meaningShort: "Sân tập" },
                        { hanzi: "锻炼", pinyin: "duànliàn", pinyinClean: "duanlian", meaning: "Luyện tập, rèn luyện", meaningShort: "Luyện tập" },
                        { hanzi: "洗澡", pinyin: "xǐ zǎo", pinyinClean: "xizao", meaning: "Tắm, tắm rửa", meaningShort: "Tắm" },
                        { hanzi: "洗", pinyin: "xǐ", pinyinClean: "xi", meaning: "Rửa, giặt", meaningShort: "Rửa" },
                        { hanzi: "睡觉", pinyin: "shuì jiào", pinyinClean: "shuijiao", meaning: "Ngủ, đi ngủ", meaningShort: "Ngủ" },
                        { hanzi: "爬", pinyin: "pá", pinyinClean: "pa", meaning: "Trèo, leo", meaningShort: "Leo" },
                        { hanzi: "山", pinyin: "shān", pinyinClean: "shan", meaning: "Núi, ngọn núi", meaningShort: "Núi" },
                        { hanzi: "年级", pinyin: "niánjí", pinyinClean: "nianji", meaning: "Lớp, năm cấp", meaningShort: "Lớp" },
                        { hanzi: "出发", pinyin: "chūfā", pinyinClean: "chufa", meaning: "Xuất phát, khởi hành", meaningShort: "Xuất phát" },
                        { hanzi: "前", pinyin: "qián", pinyinClean: "qian", meaning: "Trước, phía trước", meaningShort: "Trước" },
                        { hanzi: "集合", pinyin: "jíhé", pinyinClean: "jihe", meaning: "Tập hợp, tập trung", meaningShort: "Tập hợp" },
                        { hanzi: "上车", pinyin: "shàng chē", pinyinClean: "shangche", meaning: "Lên xe", meaningShort: "Lên xe" },
                        { hanzi: "下车", pinyin: "xià chē", pinyinClean: "xiache", meaning: "Xuống xe", meaningShort: "Xuống xe" },
                        { hanzi: "准时", pinyin: "zhǔnshí", pinyinClean: "zhunshi", meaning: "Đúng giờ", meaningShort: "Đúng giờ" },
                        { hanzi: "带", pinyin: "dài", pinyinClean: "dai", meaning: "Mang, đem theo", meaningShort: "Mang" }
                    ]
                },
                {
                    unitNumber: 22,
                    stageLabel: "Màn 7/15 • Bài 22 (Quyển 2)",
                    title: "Bài 22: 我打算请老师教我京剧 — Tôi định mời giáo viên dạy tôi Kinh kịch",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "叫", pinyin: "jiào", pinyinClean: "jiao", meaning: "Gọi, bảo", meaningShort: "Gọi" },
                        { hanzi: "让", pinyin: "ràng", pinyinClean: "rang", meaning: "Nhường, để, bảo", meaningShort: "Nhường" },
                        { hanzi: "大家", pinyin: "dàjiā", pinyinClean: "dajia", meaning: "Mọi người", meaningShort: "Mọi người" },
                        { hanzi: "谈", pinyin: "tán", pinyinClean: "tan", meaning: "Nói, bàn chuyện", meaningShort: "Nói" },
                        { hanzi: "自己", pinyin: "zìjǐ", pinyinClean: "ziji", meaning: "Tự mình, bản thân", meaningShort: "Tự mình" },
                        { hanzi: "爱好", pinyin: "àihào", pinyinClean: "aihao", meaning: "Sở thích", meaningShort: "Sở thích" },
                        { hanzi: "京剧", pinyin: "jīngjù", pinyinClean: "jingju", meaning: "Kinh kịch", meaningShort: "Kinh kịch" },
                        { hanzi: "喜欢", pinyin: "xǐhuan", pinyinClean: "xihuan", meaning: "Thích, yêu thích", meaningShort: "Thích" },
                        { hanzi: "非常", pinyin: "fēicháng", pinyinClean: "feichang", meaning: "Rất, vô cùng", meaningShort: "Vô cùng" },
                        { hanzi: "唱", pinyin: "chàng", pinyinClean: "chang", meaning: "Hát, ca hát", meaningShort: "Hát" },
                        { hanzi: "玩", pinyin: "wán", pinyinClean: "wan", meaning: "Chơi", meaningShort: "Chơi" },
                        { hanzi: "电脑", pinyin: "diànnǎo", pinyinClean: "diannao", meaning: "Máy tính", meaningShort: "Máy tính" },
                        { hanzi: "下课", pinyin: "xià kè", pinyinClean: "xiake", meaning: "Tan học", meaningShort: "Tan học" },
                        { hanzi: "感到", pinyin: "gǎndào", pinyinClean: "gandao", meaning: "Cảm nhận, cảm thấy", meaningShort: "Cảm nhận" },
                        { hanzi: "心情", pinyin: "xīnqíng", pinyinClean: "xinqing", meaning: "Tâm trạng", meaningShort: "Tâm trạng" },
                        { hanzi: "愉快", pinyin: "yúkuài", pinyinClean: "yukuai", meaning: "Thoải mái, vui vẻ", meaningShort: "Thoải mái" },
                        { hanzi: "业余", pinyin: "yèyú", pinyinClean: "yeyu", meaning: "Nghiệp dư, ngoài chuyên môn", meaningShort: "Nghiệp dư" },
                        { hanzi: "以前", pinyin: "yǐqián", pinyinClean: "yiqian", meaning: "Phía trước, trước đây", meaningShort: "Trước đây" },
                        { hanzi: "对", pinyin: "duì", pinyinClean: "dui", meaning: "Đối với", meaningShort: "Đối với" },
                        { hanzi: "书法", pinyin: "shūfǎ", pinyinClean: "shufa", meaning: "Thư pháp", meaningShort: "Thư pháp" },
                        { hanzi: "特别", pinyin: "tèbié", pinyinClean: "tebie", meaning: "Đặc biệt", meaningShort: "Đặc biệt" },
                        { hanzi: "感兴趣", pinyin: "gǎn xìngqù", pinyinClean: "ganxingqu", meaning: "Có hứng thú, quan tâm", meaningShort: "Có hứng thú" },
                        { hanzi: "兴趣", pinyin: "xìngqù", pinyinClean: "xingqu", meaning: "Hứng thú", meaningShort: "Hứng thú" },
                        { hanzi: "派", pinyin: "pài", pinyinClean: "pai", meaning: "Phái, cử", meaningShort: "Phái" },
                        { hanzi: "高兴", pinyin: "gāoxìng", pinyinClean: "gaoxing", meaning: "Vui vẻ, mừng rỡ", meaningShort: "Vui vẻ" },
                        { hanzi: "画", pinyin: "huà", pinyinClean: "hua", meaning: "Vẽ, tranh", meaningShort: "Vẽ" },
                        { hanzi: "画儿", pinyin: "huàr", pinyinClean: "huar", meaning: "Bức tranh, tranh vẽ", meaningShort: "Bức tranh" }
                    ]
                },
                {
                    unitNumber: 23,
                    stageLabel: "Màn 8/15 • Bài 23 (Quyển 2)",
                    title: "Bài 23: 学校里边有邮局吗 — Trong trường có bưu điện không",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "东边", pinyin: "dōngbian", pinyinClean: "dongbian", meaning: "Phía đông", meaningShort: "Phía đông" },
                        { hanzi: "西边", pinyin: "xībian", pinyinClean: "xibian", meaning: "Phía tây", meaningShort: "Phía tây" },
                        { hanzi: "南边", pinyin: "nánbian", pinyinClean: "nanbian", meaning: "Phía nam", meaningShort: "Phía nam" },
                        { hanzi: "北边", pinyin: "běibian", pinyinClean: "beibian", meaning: "Phía bắc", meaningShort: "Phía bắc" },
                        { hanzi: "前边", pinyin: "qiánbian", pinyinClean: "qianbian", meaning: "Phía trước, trước", meaningShort: "Phía trước" },
                        { hanzi: "后边", pinyin: "hòubian", pinyinClean: "houbian", meaning: "Phía sau, sau", meaningShort: "Phía sau" },
                        { hanzi: "左边", pinyin: "zuǒbian", pinyinClean: "zuobian", meaning: "Bên trái", meaningShort: "Bên trái" },
                        { hanzi: "右边", pinyin: "yòubian", pinyinClean: "youbian", meaning: "Bên phải", meaningShort: "Bên phải" },
                        { hanzi: "里边", pinyin: "lǐbian", pinyinClean: "libian", meaning: "Bên trong", meaningShort: "Bên trong" },
                        { hanzi: "外边", pinyin: "wàibian", pinyinClean: "waibian", meaning: "Bên ngoài", meaningShort: "Bên ngoài" },
                        { hanzi: "上边", pinyin: "shàngbian", pinyinClean: "shangbian", meaning: "Phía trên", meaningShort: "Phía trên" },
                        { hanzi: "下边", pinyin: "xiàbian", pinyinClean: "xiabian", meaning: "Phía dưới", meaningShort: "Phía dưới" },
                        { hanzi: "中间", pinyin: "zhōngjiān", pinyinClean: "zhongjian", meaning: "Ở giữa, trung gian", meaningShort: "Ở giữa" },
                        { hanzi: "离", pinyin: "lí", pinyinClean: "li", meaning: "Cách, rời", meaningShort: "Cách" },
                        { hanzi: "远", pinyin: "yuǎn", pinyinClean: "yuan", meaning: "Xa", meaningShort: "Xa" },
                        { hanzi: "近", pinyin: "jìn", pinyinClean: "jin", meaning: "Gần", meaningShort: "Gần" },
                        { hanzi: "地方", pinyin: "dìfang", pinyinClean: "difang", meaning: "Địa phương, nơi, chỗ", meaningShort: "Địa phương" },
                        { hanzi: "足球场", pinyin: "zúqiúchǎng", pinyinClean: "zuqiuchang", meaning: "Sân bóng, sân bóng đá", meaningShort: "Sân bóng" },
                        { hanzi: "足球", pinyin: "zúqiú", pinyinClean: "zuqiu", meaning: "Đá bóng, bóng đá", meaningShort: "Bóng đá" },
                        { hanzi: "劳驾", pinyin: "láo jià", pinyinClean: "laojia", meaning: "Cảm phiền, làm ơn", meaningShort: "Làm ơn" },
                        { hanzi: "打听", pinyin: "dǎting", pinyinClean: "dating", meaning: "Nghe ngóng, hỏi thăm", meaningShort: "Hỏi thăm" },
                        { hanzi: "博物馆", pinyin: "bówùguǎn", pinyinClean: "bowuguan", meaning: "Viện bảo tàng, bảo tàng", meaningShort: "Bảo tàng" },
                        { hanzi: "和平", pinyin: "hépíng", pinyinClean: "heping", meaning: "Hòa bình", meaningShort: "Hòa bình" },
                        { hanzi: "广场", pinyin: "guǎngchǎng", pinyinClean: "guangchang", meaning: "Quảng trường", meaningShort: "Quảng trường" },
                        { hanzi: "从", pinyin: "cóng", pinyinClean: "cong", meaning: "Từ, từ khi", meaningShort: "Từ" },
                        { hanzi: "到", pinyin: "dào", pinyinClean: "dao", meaning: "Đến, tới", meaningShort: "Đến" },
                        { hanzi: "米", pinyin: "mǐ", pinyinClean: "mi", meaning: "Mét, gạo", meaningShort: "Mét" },
                        { hanzi: "一直", pinyin: "yìzhí", pinyinClean: "yizhi", meaning: "Thẳng, một mạch", meaningShort: "Thẳng" },
                        { hanzi: "往", pinyin: "wǎng", pinyinClean: "wang", meaning: "Hướng về", meaningShort: "Hướng về" },
                        { hanzi: "红绿灯", pinyin: "hónglǜdēng", pinyinClean: "honglvdeng", meaning: "Đèn giao thông, đèn xanh đỏ", meaningShort: "Đèn giao thông" },
                        { hanzi: "绿", pinyin: "lǜ", pinyinClean: "lv", meaning: "Xanh, xanh lá", meaningShort: "Xanh" },
                        { hanzi: "灯", pinyin: "dēng", pinyinClean: "deng", meaning: "Bóng đèn, đèn", meaningShort: "Bóng đèn" },
                        { hanzi: "左", pinyin: "zuǒ", pinyinClean: "zuo", meaning: "Trái, bên trái", meaningShort: "Trái" },
                        { hanzi: "右", pinyin: "yòu", pinyinClean: "you", meaning: "Phải, bên phải", meaningShort: "Phải" },
                        { hanzi: "拐", pinyin: "guǎi", pinyinClean: "guai", meaning: "Rẽ, quẹo", meaningShort: "Rẽ" },
                        { hanzi: "马路", pinyin: "mǎlù", pinyinClean: "malu", meaning: "Đường cái, đường lớn", meaningShort: "Đường cái" },
                        { hanzi: "路", pinyin: "lù", pinyinClean: "lu", meaning: "Đường, con đường", meaningShort: "Đường" },
                        { hanzi: "座", pinyin: "zuò", pinyinClean: "zuo", meaning: "Tòa, lượng từ", meaningShort: "Tòa" },
                        { hanzi: "白色", pinyin: "báisè", pinyinClean: "baise", meaning: "Màu trắng", meaningShort: "Màu trắng" }
                    ]
                },
                {
                    unitNumber: 24,
                    stageLabel: "Màn 9/15 • Bài 24 (Quyển 2)",
                    title: "Bài 24: 我想学太极拳 — Tôi muốn học Thái cực quyền",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "会", pinyin: "huì", pinyinClean: "hui", meaning: "Biết, sẽ", meaningShort: "Biết" },
                        { hanzi: "打", pinyin: "dǎ", pinyinClean: "da", meaning: "Đánh, tập", meaningShort: "Đánh" },
                        { hanzi: "太极拳", pinyin: "tàijíquán", pinyinClean: "taijiquan", meaning: "Thái cực quyền", meaningShort: "Thái cực quyền" },
                        { hanzi: "听说", pinyin: "tīngshuō", pinyinClean: "tingshuo", meaning: "Nghe nói", meaningShort: "Nghe nói" },
                        { hanzi: "下", pinyin: "xià", pinyinClean: "xia", meaning: "Hạ, dưới, sau", meaningShort: "Hạ" },
                        { hanzi: "报名", pinyin: "bào míng", pinyinClean: "baoming", meaning: "Đăng ký, báo danh, ghi tên", meaningShort: "Đăng ký" },
                        { hanzi: "开始", pinyin: "kāishǐ", pinyinClean: "kaishi", meaning: "Bắt đầu", meaningShort: "Bắt đầu" },
                        { hanzi: "能", pinyin: "néng", pinyinClean: "neng", meaning: "Có thể", meaningShort: "Có thể" },
                        { hanzi: "再", pinyin: "zài", pinyinClean: "zai", meaning: "Lại, tái", meaningShort: "Lại" },
                        { hanzi: "遍", pinyin: "biàn", pinyinClean: "bian", meaning: "Lượt, lần", meaningShort: "Lượt" },
                        { hanzi: "懂", pinyin: "dǒng", pinyinClean: "dong", meaning: "Hiểu", meaningShort: "Hiểu" },
                        { hanzi: "意思", pinyin: "yìsi", pinyinClean: "yisi", meaning: "Ý nghĩa", meaningShort: "Ý nghĩa" },
                        { hanzi: "次", pinyin: "cì", pinyinClean: "ci", meaning: "Lần", meaningShort: "Lần" },
                        { hanzi: "小时", pinyin: "xiǎoshí", pinyinClean: "xiaoshi", meaning: "Giờ, tiếng đồng hồ", meaningShort: "Giờ" },
                        { hanzi: "请假", pinyin: "qǐng jià", pinyinClean: "qingjia", meaning: "Xin nghỉ phép", meaningShort: "Nghỉ phép" },
                        { hanzi: "舒服", pinyin: "shūfu", pinyinClean: "shufu", meaning: "Dễ chịu, thoải mái", meaningShort: "Dễ chịu" },
                        { hanzi: "头疼", pinyin: "tóu téng", pinyinClean: "touteng", meaning: "Đau đầu, nhức đầu", meaningShort: "Đau đầu" },
                        { hanzi: "头", pinyin: "tóu", pinyinClean: "tou", meaning: "Cái đầu, đầu", meaningShort: "Cái đầu" },
                        { hanzi: "疼", pinyin: "téng", pinyinClean: "teng", meaning: "Đau nhức, đau", meaningShort: "Đau nhức" },
                        { hanzi: "发烧", pinyin: "fā shāo", pinyinClean: "fashao", meaning: "Phát sốt, sốt", meaningShort: "Phát sốt" },
                        { hanzi: "咳嗽", pinyin: "késou", pinyinClean: "kesou", meaning: "Ho", meaningShort: "Ho" },
                        { hanzi: "可能", pinyin: "kěnéng", pinyinClean: "keneng", meaning: "Khả năng, có thể", meaningShort: "Khả năng" },
                        { hanzi: "感冒", pinyin: "gǎnmào", pinyinClean: "ganmao", meaning: "Cảm, cảm cúm", meaningShort: "Cảm" },
                        { hanzi: "病", pinyin: "bìng", pinyinClean: "bing", meaning: "Bệnh, ốm", meaningShort: "Bệnh" },
                        { hanzi: "看病", pinyin: "kàn bìng", pinyinClean: "kanbing", meaning: "Khám bệnh", meaningShort: "Khám bệnh" }
                    ]
                },
                {
                    unitNumber: 25,
                    stageLabel: "Màn 10/15 • Bài 25 (Quyển 2)",
                    title: "Bài 25: 她学得很好 — Cô ấy học rất giỏi",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "电视台", pinyin: "diànshìtái", pinyinClean: "dianshitai", meaning: "Đài truyền hình", meaningShort: "Đài truyền hình" },
                        { hanzi: "台", pinyin: "tái", pinyinClean: "tai", meaning: "Đài", meaningShort: "Đài" },
                        { hanzi: "表演", pinyin: "biǎoyǎn", pinyinClean: "biaoyan", meaning: "Biểu diễn", meaningShort: "Biểu diễn" },
                        { hanzi: "节目", pinyin: "jiémù", pinyinClean: "jiemu", meaning: "Tiết mục, chương trình", meaningShort: "Tiết mục" },
                        { hanzi: "愿意", pinyin: "yuànyì", pinyinClean: "yuanyi", meaning: "Bằng lòng, nguyện, mong", meaningShort: "Bằng lòng" },
                        { hanzi: "为什么", pinyin: "wèi shénme", pinyinClean: "weishenme", meaning: "Tại sao, vì sao", meaningShort: "Tại sao" },
                        { hanzi: "为", pinyin: "wèi", pinyinClean: "wei", meaning: "Vì, để", meaningShort: "Vì" },
                        { hanzi: "因为", pinyin: "yīnwèi", pinyinClean: "yinwei", meaning: "Bởi vì", meaningShort: "Bởi vì" },
                        { hanzi: "错", pinyin: "cuò", pinyinClean: "cuo", meaning: "Sai, nhầm", meaningShort: "Sai" },
                        { hanzi: "不错", pinyin: "búcuò", pinyinClean: "bucuo", meaning: "Không tồi, khá tốt", meaningShort: "Không tồi" },
                        { hanzi: "进步", pinyin: "jìnbù", pinyinClean: "jinbu", meaning: "Tiến bộ", meaningShort: "Tiến bộ" },
                        { hanzi: "水平", pinyin: "shuǐpíng", pinyinClean: "shuiping", meaning: "Trình độ", meaningShort: "Trình độ" },
                        { hanzi: "提高", pinyin: "tígāo", pinyinClean: "tigao", meaning: "Nâng cao", meaningShort: "Nâng cao" },
                        { hanzi: "流利", pinyin: "liúlì", pinyinClean: "liuli", meaning: "Lưu loát, trôi chảy", meaningShort: "Lưu loát" },
                        { hanzi: "哪里", pinyin: "nǎli", pinyinClean: "nali", meaning: "Ở đâu, không dám", meaningShort: "Ở đâu" },
                        { hanzi: "准", pinyin: "zhǔn", pinyinClean: "zhun", meaning: "Chuẩn, chính xác", meaningShort: "Chuẩn" },
                        { hanzi: "努力", pinyin: "nǔlì", pinyinClean: "nuli", meaning: "Cố gắng, nỗ lực", meaningShort: "Cố gắng" },
                        { hanzi: "认真", pinyin: "rènzhēn", pinyinClean: "renzhen", meaning: "Chăm chỉ, nghiêm túc", meaningShort: "Chăm chỉ" },
                        { hanzi: "早", pinyin: "zǎo", pinyinClean: "zao", meaning: "Sớm", meaningShort: "Sớm" },
                        { hanzi: "晚", pinyin: "wǎn", pinyinClean: "wan", meaning: "Tối, muộn", meaningShort: "Muộn" },
                        { hanzi: "运动", pinyin: "yùndòng", pinyinClean: "yundong", meaning: "Vận động, thể thao", meaningShort: "Vận động" },
                        { hanzi: "跑步", pinyin: "pǎo bù", pinyinClean: "paobu", meaning: "Chạy bộ", meaningShort: "Chạy bộ" },
                        { hanzi: "跑", pinyin: "pǎo", pinyinClean: "pao", meaning: "Chạy", meaningShort: "Chạy" },
                        { hanzi: "篮球", pinyin: "lánqiú", pinyinClean: "lanqiu", meaning: "Bóng rổ", meaningShort: "Bóng rổ" },
                        { hanzi: "球", pinyin: "qiú", pinyinClean: "qiu", meaning: "Cầu, bóng", meaningShort: "Bóng" },
                        { hanzi: "刚才", pinyin: "gāngcái", pinyinClean: "gangcai", meaning: "Vừa mới, lúc nãy", meaningShort: "Vừa mới" },
                        { hanzi: "坚持", pinyin: "jiānchí", pinyinClean: "jianchi", meaning: "Kiên trì", meaningShort: "Kiên trì" },
                        { hanzi: "这么", pinyin: "zhème", pinyinClean: "zheme", meaning: "Như thế này", meaningShort: "Thế này" },
                        { hanzi: "那么", pinyin: "nàme", pinyinClean: "name", meaning: "Thế này, vậy thì", meaningShort: "Vậy thì" }
                    ]
                },
                {
                    unitNumber: 26,
                    stageLabel: "Màn 11/15 • Bài 26 (Quyển 2)",
                    title: "Bài 26: 田芳去哪儿了 — Điền Phương đi đâu",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "喂", pinyin: "wèi", pinyinClean: "wei", meaning: "A lô, thán từ", meaningShort: "A lô" },
                        { hanzi: "阿姨", pinyin: "āyí", pinyinClean: "ayi", meaning: "Dì, cô", meaningShort: "Dì" },
                        { hanzi: "中学", pinyin: "zhōngxué", pinyinClean: "zhongxue", meaning: "Trung học, trường cấp ba", meaningShort: "Trung học" },
                        { hanzi: "出国", pinyin: "chū guó", pinyinClean: "chuguo", meaning: "Ra nước ngoài, xuất ngoại", meaningShort: "Ra nước ngoài" },
                        { hanzi: "出", pinyin: "chū", pinyinClean: "chu", meaning: "Ra, xuất", meaningShort: "Ra" },
                        { hanzi: "打电话", pinyin: "dǎ diànhuà", pinyinClean: "dadianhua", meaning: "Gọi điện thoại", meaningShort: "Gọi điện" },
                        { hanzi: "关机", pinyin: "guān jī", pinyinClean: "guanji", meaning: "Đóng máy, tắt máy", meaningShort: "Tắt máy" },
                        { hanzi: "关", pinyin: "guān", pinyinClean: "guan", meaning: "Đóng, tắt", meaningShort: "Đóng" },
                        { hanzi: "开机", pinyin: "kāi jī", pinyinClean: "kaiji", meaning: "Mở máy, bật máy", meaningShort: "Mở máy" },
                        { hanzi: "对了", pinyin: "duì le", pinyinClean: "duile", meaning: "Đúng rồi, phải rồi", meaningShort: "Đúng rồi" },
                        { hanzi: "忘", pinyin: "wàng", pinyinClean: "wang", meaning: "Quên", meaningShort: "Quên" },
                        { hanzi: "响", pinyin: "xiǎng", pinyinClean: "xiang", meaning: "Kêu, rung chuông", meaningShort: "Kêu" },
                        { hanzi: "接", pinyin: "jiē", pinyinClean: "jie", meaning: "Tiếp, nghe máy, đón", meaningShort: "Tiếp" },
                        { hanzi: "踢", pinyin: "tī", pinyinClean: "ti", meaning: "Đá bóng, đá", meaningShort: "Đá bóng" },
                        { hanzi: "比赛", pinyin: "bǐsài", pinyinClean: "bisai", meaning: "Thi đấu, trận đấu", meaningShort: "Thi đấu" },
                        { hanzi: "队", pinyin: "duì", pinyinClean: "dui", meaning: "Đội", meaningShort: "Đội" },
                        { hanzi: "输", pinyin: "shū", pinyinClean: "shu", meaning: "Thua", meaningShort: "Thua" },
                        { hanzi: "赢", pinyin: "yíng", pinyinClean: "ying", meaning: "Thắng", meaningShort: "Thắng" },
                        { hanzi: "比", pinyin: "bǐ", pinyinClean: "bi", meaning: "So, so với", meaningShort: "So với" },
                        { hanzi: "祝贺", pinyin: "zhùhè", pinyinClean: "zhuhe", meaning: "Chúc mừng", meaningShort: "Chúc mừng" },
                        { hanzi: "上", pinyin: "shàng", pinyinClean: "shang", meaning: "Lên, học", meaningShort: "Lên" },
                        { hanzi: "托福", pinyin: "Tuōfú", pinyinClean: "tuofu", meaning: "TOEFL", meaningShort: "TOEFL" },
                        { hanzi: "已经", pinyin: "yǐjīng", pinyinClean: "yijing", meaning: "Đã, rồi", meaningShort: "Đã" },
                        { hanzi: "考", pinyin: "kǎo", pinyinClean: "kao", meaning: "Thi, kiểm tra", meaningShort: "Thi" },
                        { hanzi: "陪", pinyin: "péi", pinyinClean: "pei", meaning: "Cùng, đi cùng", meaningShort: "Đi cùng" }
                    ]
                },
                {
                    unitNumber: 27,
                    stageLabel: "Màn 12/15 • Bài 27 (Quyển 2)",
                    title: "Bài 27: 玛丽哭了 — Mary khóc rồi",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "哭", pinyin: "kū", pinyinClean: "ku", meaning: "Khóc", meaningShort: "Khóc" },
                        { hanzi: "病人", pinyin: "bìngrén", pinyinClean: "bingren", meaning: "Bệnh nhân, người bệnh", meaningShort: "Bệnh nhân" },
                        { hanzi: "肚子", pinyin: "dùzi", pinyinClean: "duzi", meaning: "Bụng", meaningShort: "Bụng" },
                        { hanzi: "厉害", pinyin: "lìhai", pinyinClean: "lihai", meaning: "Lợi hại, dữ dội", meaningShort: "Lợi hại" },
                        { hanzi: "片", pinyin: "piàn", pinyinClean: "pian", meaning: "Viên thuốc, phiến", meaningShort: "Viên thuốc" },
                        { hanzi: "拉肚子", pinyin: "lā dùzi", pinyinClean: "laduzi", meaning: "Đau bụng, tiêu chảy", meaningShort: "Đau bụng" },
                        { hanzi: "鱼", pinyin: "yú", pinyinClean: "yu", meaning: "Cá", meaningShort: "Cá" },
                        { hanzi: "牛肉", pinyin: "niúròu", pinyinClean: "niurou", meaning: "Thịt bò", meaningShort: "Thịt bò" },
                        { hanzi: "化验", pinyin: "huàyàn", pinyinClean: "huayan", meaning: "Hóa nghiệm, xét nghiệm", meaningShort: "Xét nghiệm" },
                        { hanzi: "大便", pinyin: "dàbiàn", pinyinClean: "dabian", meaning: "Đại tiện", meaningShort: "Đại tiện" },
                        { hanzi: "小便", pinyin: "xiǎobiàn", pinyinClean: "xiaobian", meaning: "Tiểu tiện", meaningShort: "Tiểu tiện" },
                        { hanzi: "检查", pinyin: "jiǎnchá", pinyinClean: "jiancha", meaning: "Kiểm tra, khám", meaningShort: "Kiểm tra" },
                        { hanzi: "结果", pinyin: "jiéguǒ", pinyinClean: "jieguo", meaning: "Kết quả", meaningShort: "Kết quả" },
                        { hanzi: "肠炎", pinyin: "chángyán", pinyinClean: "changyan", meaning: "Viêm ruột", meaningShort: "Viêm ruột" },
                        { hanzi: "消化", pinyin: "xiāohuà", pinyinClean: "xiaohua", meaning: "Tiêu hóa", meaningShort: "Tiêu hóa" },
                        { hanzi: "开药", pinyin: "kāi yào", pinyinClean: "kaiyao", meaning: "Kê đơn, kê thuốc", meaningShort: "Kê đơn" },
                        { hanzi: "打针", pinyin: "dǎ zhēn", pinyinClean: "dazhen", meaning: "Tiêm, chích thuốc", meaningShort: "Tiêm" },
                        { hanzi: "后", pinyin: "hòu", pinyinClean: "hou", meaning: "Sau, phía sau", meaningShort: "Sau" },
                        { hanzi: "寂寞", pinyin: "jìmò", pinyinClean: "jimo", meaning: "Cô đơn", meaningShort: "Cô đơn" },
                        { hanzi: "所以", pinyin: "suǒyǐ", pinyinClean: "suoyi", meaning: "Vì vậy, cho nên", meaningShort: "Vì vậy" },
                        { hanzi: "别", pinyin: "bié", pinyinClean: "bie", meaning: "Đừng", meaningShort: "Đừng" },
                        { hanzi: "难过", pinyin: "nánguò", pinyinClean: "nanguo", meaning: "Khó chịu, buồn", meaningShort: "Khó chịu" },
                        { hanzi: "礼堂", pinyin: "lǐtáng", pinyinClean: "litang", meaning: "Hội trường lớn", meaningShort: "Hội trường" },
                        { hanzi: "舞会", pinyin: "wǔhuì", pinyinClean: "wuhui", meaning: "Vũ hội", meaningShort: "Vũ hội" },
                        { hanzi: "跳舞", pinyin: "tiào wǔ", pinyinClean: "tiaowu", meaning: "Nhảy múa, khiêu vũ", meaningShort: "Nhảy múa" }
                    ]
                },
                {
                    unitNumber: 28,
                    stageLabel: "Màn 13/15 • Bài 28 (Quyển 2)",
                    title: "Bài 28: 我吃了早饭就来了 — Tôi ăn sáng xong rồi đến ngay",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "租", pinyin: "zū", pinyinClean: "zu", meaning: "Thuê", meaningShort: "Thuê" },
                        { hanzi: "房子", pinyin: "fángzi", pinyinClean: "fangzi", meaning: "Phòng, nhà", meaningShort: "Nhà" },
                        { hanzi: "房租", pinyin: "fángzū", pinyinClean: "fangzu", meaning: "Tiền thuê phòng", meaningShort: "Tiền thuê" },
                        { hanzi: "满意", pinyin: "mǎnyì", pinyinClean: "manyi", meaning: "Vừa ý, hài lòng", meaningShort: "Hài lòng" },
                        { hanzi: "有的", pinyin: "yǒude", pinyinClean: "youde", meaning: "Có cái, có người", meaningShort: "Có cái" },
                        { hanzi: "周围", pinyin: "zhōuwéi", pinyinClean: "zhouwei", meaning: "Xung quanh", meaningShort: "Xung quanh" },
                        { hanzi: "环境", pinyin: "huánjìng", pinyinClean: "huanjing", meaning: "Hoàn cảnh, môi trường", meaningShort: "Môi trường" },
                        { hanzi: "乱", pinyin: "luàn", pinyinClean: "luan", meaning: "Loạn, bừa bộn", meaningShort: "Bừa bộn" },
                        { hanzi: "厨房", pinyin: "chúfáng", pinyinClean: "chufang", meaning: "Phòng bếp, nhà bếp", meaningShort: "Phòng bếp" },
                        { hanzi: "卧室", pinyin: "wòshì", pinyinClean: "woshi", meaning: "Phòng ngủ", meaningShort: "Phòng ngủ" },
                        { hanzi: "客厅", pinyin: "kètīng", pinyinClean: "keting", meaning: "Phòng khách", meaningShort: "Phòng khách" },
                        { hanzi: "面积", pinyin: "miànjī", pinyinClean: "mianji", meaning: "Diện tích", meaningShort: "Diện tích" },
                        { hanzi: "层", pinyin: "céng", pinyinClean: "ceng", meaning: "Tầng", meaningShort: "Tầng" },
                        { hanzi: "平方米", pinyin: "píngfāngmǐ", pinyinClean: "pingfangmi", meaning: "Mét vuông", meaningShort: "Mét vuông" },
                        { hanzi: "上去", pinyin: "shàngqu", pinyinClean: "shangqu", meaning: "Đi lên, lên", meaningShort: "Đi lên" },
                        { hanzi: "阳光", pinyin: "yángguāng", pinyinClean: "yangguang", meaning: "Ánh mặt trời, ánh nắng", meaningShort: "Ánh nắng" },
                        { hanzi: "要是", pinyin: "yàoshì", pinyinClean: "yaoshi", meaning: "Nếu, giả sử", meaningShort: "Nếu" },
                        { hanzi: "妻子", pinyin: "qīzi", pinyinClean: "qizi", meaning: "Vợ", meaningShort: "Vợ" },
                        { hanzi: "情况", pinyin: "qíngkuàng", pinyinClean: "qingkuang", meaning: "Tình hình", meaningShort: "Tình hình" },
                        { hanzi: "交通", pinyin: "jiāotōng", pinyinClean: "jiaotong", meaning: "Giao thông", meaningShort: "Giao thông" },
                        { hanzi: "方便", pinyin: "fāngbiàn", pinyinClean: "fangbian", meaning: "Thuận tiện, tiện lợi", meaningShort: "Thuận tiện" },
                        { hanzi: "公共汽车", pinyin: "gōnggòng qìchē", pinyinClean: "gonggongqiche", meaning: "Xe buýt", meaningShort: "Xe buýt" },
                        { hanzi: "站", pinyin: "zhàn", pinyinClean: "zhan", meaning: "Trạm, bến, đứng", meaningShort: "Trạm" },
                        { hanzi: "车站", pinyin: "chēzhàn", pinyinClean: "chezhan", meaning: "Bến xe, nhà ga", meaningShort: "Bến xe" },
                        { hanzi: "旁边", pinyin: "pángbiān", pinyinClean: "pangbian", meaning: "Bên cạnh", meaningShort: "Bên cạnh" },
                        { hanzi: "地铁", pinyin: "dìtiě", pinyinClean: "ditie", meaning: "Tàu điện ngầm, đường sắt", meaningShort: "Tàu điện" },
                        { hanzi: "附近", pinyin: "fùjìn", pinyinClean: "fujin", meaning: "Gần, lân cận", meaningShort: "Gần" },
                        { hanzi: "体育馆", pinyin: "tǐyùguǎn", pinyinClean: "tiyuguan", meaning: "Phòng thể dục, nhà thi đấu", meaningShort: "Nhà thi đấu" },
                        { hanzi: "才", pinyin: "cái", pinyinClean: "cai", meaning: "Vừa, mới", meaningShort: "Mới" },
                        { hanzi: "堵车", pinyin: "dǔ chē", pinyinClean: "duche", meaning: "Tắc đường, kẹt xe", meaningShort: "Tắc đường" },
                        { hanzi: "赶", pinyin: "gǎn", pinyinClean: "gan", meaning: "Vội, đuổi theo", meaningShort: "Vội" },
                        { hanzi: "虽然", pinyin: "suīrán", pinyinClean: "suiran", meaning: "Tuy, mặc dù", meaningShort: "Mặc dù" },
                        { hanzi: "真", pinyin: "zhēn", pinyinClean: "zhen", meaning: "Thật", meaningShort: "Thật" },
                        { hanzi: "条", pinyin: "tiáo", pinyinClean: "tiao", meaning: "Con, lượng từ", meaningShort: "Con" },
                        { hanzi: "河", pinyin: "hé", pinyinClean: "he", meaning: "Sông, dòng sông", meaningShort: "Sông" }
                    ]
                },
                {
                    unitNumber: 29,
                    stageLabel: "Màn 14/15 • Bài 29 (Quyển 2)",
                    title: "Bài 29: 我都做对了 — Tôi làm đúng hết rồi",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "考试", pinyin: "kǎoshì", pinyinClean: "kaoshi", meaning: "Thi, kỳ thi", meaningShort: "Thi" },
                        { hanzi: "题", pinyin: "tí", pinyinClean: "ti", meaning: "Đề, câu hỏi", meaningShort: "Đề" },
                        { hanzi: "道", pinyin: "dào", pinyinClean: "dao", meaning: "Câu, lượng từ", meaningShort: "Câu" },
                        { hanzi: "成绩", pinyin: "chéngjì", pinyinClean: "chengji", meaning: "Thành tích, điểm số", meaningShort: "Thành tích" },
                        { hanzi: "句子", pinyin: "jùzi", pinyinClean: "juzi", meaning: "Câu văn, câu", meaningShort: "Câu văn" },
                        { hanzi: "干什么", pinyin: "gàn shénme", pinyinClean: "ganshenme", meaning: "Làm cái gì, làm gì", meaningShort: "Làm gì" },
                        { hanzi: "干", pinyin: "gàn", pinyinClean: "gan", meaning: "Làm", meaningShort: "Làm" },
                        { hanzi: "看见", pinyin: "kàn jiàn", pinyinClean: "kanjian", meaning: "Nhìn thấy", meaningShort: "Nhìn thấy" },
                        { hanzi: "见", pinyin: "jiàn", pinyinClean: "jian", meaning: "Gặp, thấy", meaningShort: "Gặp" },
                        { hanzi: "词", pinyin: "cí", pinyinClean: "ci", meaning: "Từ, từ ngữ", meaningShort: "Từ" },
                        { hanzi: "糟糕", pinyin: "zāogāo", pinyinClean: "zaogao", meaning: "Chết rồi, thôi rồi, gay go", meaningShort: "Chết rồi" },
                        { hanzi: "成", pinyin: "chéng", pinyinClean: "cheng", meaning: "Thành, trở thành", meaningShort: "Thành" },
                        { hanzi: "回信", pinyin: "huí xìn", pinyinClean: "huixin", meaning: "Trả lời thư, hồi âm", meaningShort: "Trả lời thư" },
                        { hanzi: "故事", pinyin: "gùshi", pinyinClean: "gushi", meaning: "Câu chuyện", meaningShort: "Câu chuyện" },
                        { hanzi: "有意思", pinyin: "yǒu yìsi", pinyinClean: "youyisi", meaning: "Có ý nghĩa, hay, thú vị", meaningShort: "Thú vị" },
                        { hanzi: "页", pinyin: "yè", pinyinClean: "ye", meaning: "Trang, trang sách", meaningShort: "Trang" },
                        { hanzi: "笑", pinyin: "xiào", pinyinClean: "xiao", meaning: "Cười", meaningShort: "Cười" },
                        { hanzi: "会话", pinyin: "huìhuà", pinyinClean: "huihua", meaning: "Đàm thoại, hội thoại", meaningShort: "Đàm thoại" },
                        { hanzi: "念", pinyin: "niàn", pinyinClean: "nian", meaning: "Đọc, niệm", meaningShort: "Đọc" },
                        { hanzi: "答", pinyin: "dá", pinyinClean: "da", meaning: "Trả lời, đáp", meaningShort: "Trả lời" },
                        { hanzi: "办法", pinyin: "bànfǎ", pinyinClean: "banfa", meaning: "Biện pháp, cách", meaningShort: "Biện pháp" },
                        { hanzi: "合上", pinyin: "hé shàng", pinyinClean: "heshang", meaning: "Gấp, đóng lại", meaningShort: "Đóng lại" },
                        { hanzi: "打开", pinyin: "dǎ kāi", pinyinClean: "dakai", meaning: "Mở, mở ra", meaningShort: "Mở" },
                        { hanzi: "作业", pinyin: "zuòyè", pinyinClean: "zuoye", meaning: "Bài tập, bài tập về nhà", meaningShort: "Bài tập" },
                        { hanzi: "熟", pinyin: "shú", pinyinClean: "shu", meaning: "Chín, quen, thuộc", meaningShort: "Thuộc" },
                        { hanzi: "完", pinyin: "wán", pinyinClean: "wan", meaning: "Xong, hết", meaningShort: "Xong" },
                        { hanzi: "听见", pinyin: "tīngjiàn", pinyinClean: "tingjian", meaning: "Nghe thấy", meaningShort: "Nghe thấy" }
                    ]
                },
                {
                    unitNumber: 30,
                    stageLabel: "Màn 15/15 • Bài 30 (Quyển 2)",
                    title: "Bài 30: 我来了两个多月了 — Tôi đã đến được hơn hai tháng rồi",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "生活", pinyin: "shēnghuó", pinyinClean: "shenghuo", meaning: "Sinh hoạt, cuộc sống", meaningShort: "Sinh hoạt" },
                        { hanzi: "差不多", pinyin: "chàbuduō", pinyinClean: "chabuduo", meaning: "Xấp xỉ, gần như", meaningShort: "Xấp xỉ" },
                        { hanzi: "习惯", pinyin: "xíguàn", pinyinClean: "xiguan", meaning: "Thói quen, quen", meaningShort: "Thói quen" },
                        { hanzi: "气候", pinyin: "qìhòu", pinyinClean: "qihou", meaning: "Khí hậu", meaningShort: "Khí hậu" },
                        { hanzi: "干燥", pinyin: "gānzào", pinyinClean: "ganzao", meaning: "Khô ráo, khô hanh", meaningShort: "Khô ráo" },
                        { hanzi: "干净", pinyin: "gānjing", pinyinClean: "ganjing", meaning: "Sạch sẽ", meaningShort: "Sạch sẽ" },
                        { hanzi: "菜", pinyin: "cài", pinyinClean: "cai", meaning: "Rau, món ăn", meaningShort: "Món ăn" },
                        { hanzi: "油腻", pinyin: "yóunì", pinyinClean: "youni", meaning: "Dầu mỡ, ngấy", meaningShort: "Dầu mỡ" },
                        { hanzi: "牛奶", pinyin: "niúnǎi", pinyinClean: "niunai", meaning: "Sữa bò, sữa tươi", meaningShort: "Sữa bò" },
                        { hanzi: "不过", pinyin: "búguò", pinyinClean: "buguo", meaning: "Nhưng, có điều", meaningShort: "Nhưng" },
                        { hanzi: "课间", pinyin: "kèjiān", pinyinClean: "kejian", meaning: "Giữa các giờ học, giờ giải lao", meaningShort: "Giờ giải lao" },
                        { hanzi: "块", pinyin: "kuài", pinyinClean: "kuai", meaning: "Khối, miếng", meaningShort: "Miếng" },
                        { hanzi: "点心", pinyin: "diǎnxin", pinyinClean: "dianxin", meaning: "Điểm tâm, bánh ngọt", meaningShort: "Điểm tâm" },
                        { hanzi: "从来", pinyin: "cónglái", pinyinClean: "conglai", meaning: "Từ trước tới nay", meaningShort: "Từ trước" },
                        { hanzi: "午觉", pinyin: "wǔjiào", pinyinClean: "wujiao", meaning: "Ngủ trưa, giấc trưa", meaningShort: "Ngủ trưa" },
                        { hanzi: "游泳", pinyin: "yóu yǒng", pinyinClean: "youyong", meaning: "Bơi, bơi lội", meaningShort: "Bơi" },
                        { hanzi: "散步", pinyin: "sàn bù", pinyinClean: "sanbu", meaning: "Tản bộ, đi dạo", meaningShort: "Tản bộ" },
                        { hanzi: "功课", pinyin: "gōngkè", pinyinClean: "gongke", meaning: "Bài học, bài vở", meaningShort: "Bài học" },
                        { hanzi: "记", pinyin: "jì", pinyinClean: "ji", meaning: "Ghi, nhớ", meaningShort: "Ghi" },
                        { hanzi: "记住", pinyin: "jì zhù", pinyinClean: "jizhu", meaning: "Ghi nhớ, nhớ kỹ", meaningShort: "Ghi nhớ" },
                        { hanzi: "一般", pinyin: "yìbān", pinyinClean: "yiban", meaning: "Bình thường", meaningShort: "Bình thường" },
                        { hanzi: "感谢", pinyin: "gǎnxiè", pinyinClean: "ganxie", meaning: "Cảm tạ, cảm ơn", meaningShort: "Cảm ơn" },
                        { hanzi: "父母", pinyin: "fùmǔ", pinyinClean: "fumu", meaning: "Bố mẹ, cha mẹ", meaningShort: "Bố mẹ" },
                        { hanzi: "机会", pinyin: "jīhuì", pinyinClean: "jihui", meaning: "Cơ hội", meaningShort: "Cơ hội" },
                        { hanzi: "原来", pinyin: "yuánlái", pinyinClean: "yuanlai", meaning: "Hóa ra, vốn dĩ", meaningShort: "Hóa ra" },
                        { hanzi: "延长", pinyin: "yáncháng", pinyinClean: "yanchang", meaning: "Kéo dài, gia hạn", meaningShort: "Kéo dài" },
                        { hanzi: "练", pinyin: "liàn", pinyinClean: "lian", meaning: "Luyện, tập", meaningShort: "Luyện" },
                        { hanzi: "气功", pinyin: "qìgōng", pinyinClean: "qigong", meaning: "Khí công", meaningShort: "Khí công" },
                        { hanzi: "不一定", pinyin: "bù yídìng", pinyinClean: "buyiding", meaning: "Không nhất định, chưa chắc", meaningShort: "Chưa chắc" },
                        { hanzi: "钟头", pinyin: "zhōngtóu", pinyinClean: "zhongtou", meaning: "Giờ, tiếng đồng hồ", meaningShort: "Giờ" },
                        { hanzi: "效果", pinyin: "xiàoguǒ", pinyinClean: "xiaoguo", meaning: "Hiệu quả", meaningShort: "Hiệu quả" },
                        { hanzi: "好处", pinyin: "hǎochù", pinyinClean: "haochu", meaning: "Có ích, lợi ích, điểm tốt", meaningShort: "Lợi ích" },
                        { hanzi: "坏处", pinyin: "huàichù", pinyinClean: "huaichu", meaning: "Điểm xấu, tác hại", meaningShort: "Tác hại" },
                        { hanzi: "慢性病", pinyin: "mànxìngbìng", pinyinClean: "manxingbing", meaning: "Bệnh mãn tính", meaningShort: "Bệnh mãn tính" },
                        { hanzi: "高血压", pinyin: "gāoxuèyā", pinyinClean: "gaoxueya", meaning: "Cao huyết áp", meaningShort: "Cao huyết áp" },
                        { hanzi: "失眠", pinyin: "shī mián", pinyinClean: "shimian", meaning: "Mất ngủ", meaningShort: "Mất ngủ" },
                        { hanzi: "必须", pinyin: "bìxū", pinyinClean: "bixu", meaning: "Cần thiết, bắt buộc, phải", meaningShort: "Cần thiết" },
                        { hanzi: "打鱼", pinyin: "dǎ yú", pinyinClean: "dayu", meaning: "Câu cá, đánh cá", meaningShort: "Câu cá" },
                        { hanzi: "晒", pinyin: "shài", pinyinClean: "shai", meaning: "Phơi, phơi nắng", meaningShort: "Phơi" },
                        { hanzi: "挺", pinyin: "tǐng", pinyinClean: "ting", meaning: "Rất, khá", meaningShort: "Rất" }
                    ]
                }
            ]
        },
        {
            id: "hsk3_full",
            name: "HSK 3 Vocabulary (Trung Cấp • Bản Mở Đầu)",
            badge: "HSK 3",
            description: "Từ vựng HSK 3 mở rộng tư duy câu, miêu tả tính cách và môi trường (Đang cập nhật thêm giáo trình).",
            units: [
                {
                    unitNumber: 1,
                    stageLabel: "Màn 1/2 • Unit 1 (Pinyin)",
                    title: "Unit 1: Tính cách & Kế hoạch (Gõ Pinyin)",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "聪明", pinyin: "cōngming", pinyinClean: "congming", meaning: "Thông minh", meaningShort: "Thông minh" },
                        { hanzi: "努力", pinyin: "nǔlì", pinyinClean: "nuli", meaning: "Nỗ lực, chăm chỉ", meaningShort: "Nỗ lực" },
                        { hanzi: "认真", pinyin: "rènzhēn", pinyinClean: "renzhen", meaning: "Nghiêm túc, chăm chú", meaningShort: "Nghiêm túc" },
                        { hanzi: "热情", pinyin: "rèqíng", pinyinClean: "reqing", meaning: "Nhiệt tình", meaningShort: "Nhiệt tình" },
                        { hanzi: "总是", pinyin: "zǒngshì", pinyinClean: "zongshi", meaning: "Luôn luôn", meaningShort: "Luôn luôn" },
                        { hanzi: "打算", pinyin: "dǎsuàn", pinyinClean: "dasuan", meaning: "Dự định, kế hoạch", meaningShort: "Dự định" },
                        { hanzi: "周末", pinyin: "zhōumò", pinyinClean: "zhoumo", meaning: "Cuối tuần", meaningShort: "Cuối tuần" },
                        { hanzi: "着急", pinyin: "zháojí", pinyinClean: "zhaoji", meaning: "Lo lắng, sốt ruột", meaningShort: "Lo lắng" },
                        { hanzi: "放心", pinyin: "fàngxīn", pinyinClean: "fangxin", meaning: "Yên tâm", meaningShort: "Yên tâm" },
                        { hanzi: "比赛", pinyin: "bǐsài", pinyinClean: "bisai", meaning: "Trận đấu, cuộc thi", meaningShort: "Trận đấu" },
                        { hanzi: "照片", pinyin: "zhàopiàn", pinyinClean: "zhaopian", meaning: "Bức ảnh, ảnh", meaningShort: "Bức ảnh" },
                        { hanzi: "年级", pinyin: "niánjí", pinyinClean: "nianji", meaning: "Năm học, khối lớp", meaningShort: "Năm học" },
                        { hanzi: "环境", pinyin: "huánjìng", pinyinClean: "huanjing", meaning: "Môi trường", meaningShort: "Môi trường" },
                        { hanzi: "历史", pinyin: "lìshǐ", pinyinClean: "lishi", meaning: "Lịch sử", meaningShort: "Lịch sử" },
                        { hanzi: "世界", pinyin: "shìjiè", pinyinClean: "shijie", meaning: "Thế giới", meaningShort: "Thế giới" }
                    ]
                },
                {
                    unitNumber: 103,
                    stageLabel: "Màn 2/2 • Unit 1 (Gõ Nghĩa)",
                    title: "Unit 1 (Màn Bắn Nghĩa): Nhìn Hán + Pinyin ➔ Gõ Nghĩa",
                    targetMode: "meaning",
                    words: [
                        { hanzi: "聪明", pinyin: "cōngming", pinyinClean: "congming", meaning: "Thông minh", meaningShort: "Thông minh" },
                        { hanzi: "努力", pinyin: "nǔlì", pinyinClean: "nuli", meaning: "Nỗ lực, chăm chỉ", meaningShort: "Nỗ lực" },
                        { hanzi: "认真", pinyin: "rènzhēn", pinyinClean: "renzhen", meaning: "Nghiêm túc", meaningShort: "Nghiêm túc" },
                        { hanzi: "热情", pinyin: "rèqíng", pinyinClean: "reqing", meaning: "Nhiệt tình", meaningShort: "Nhiệt tình" },
                        { hanzi: "周末", pinyin: "zhōumò", pinyinClean: "zhoumo", meaning: "Cuối tuần", meaningShort: "Cuối tuần" },
                        { hanzi: "放心", pinyin: "fàngxīn", pinyinClean: "fangxin", meaning: "Yên tâm", meaningShort: "Yên tâm" },
                        { hanzi: "比赛", pinyin: "bǐsài", pinyinClean: "bisai", meaning: "Trận đấu, cuộc thi", meaningShort: "Trận đấu" },
                        { hanzi: "照片", pinyin: "zhàopiàn", pinyinClean: "zhaopian", meaning: "Bức ảnh, ảnh", meaningShort: "Bức ảnh" },
                        { hanzi: "环境", pinyin: "huánjìng", pinyinClean: "huanjing", meaning: "Môi trường", meaningShort: "Môi trường" },
                        { hanzi: "历史", pinyin: "lìshǐ", pinyinClean: "lishi", meaning: "Lịch sử", meaningShort: "Lịch sử" },
                        { hanzi: "世界", pinyin: "shìjiè", pinyinClean: "shijie", meaning: "Thế giới", meaningShort: "Thế giới" }
                    ]
                }
            ]
        },

        {
            id: "hsk4_full",
            name: "HSK 4 Vocabulary (Chủ Đề Trọng Tâm)",
            badge: "HSK 4",
            description: "Bộ từ vựng HSK 4 chọn lọc theo từng Unit (bao gồm Unit 27 trong video mẫu & màn Gõ Nghĩa).",
            units: [
                {
                    unitNumber: 27,
                    stageLabel: "Màn 1/5 • Unit 27 (Pinyin)",
                    title: "Unit 27: Đời sống & Khám phá (Chuẩn Video Mẫu - Gõ Pinyin)",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "球迷", pinyin: "qiúmí", pinyinClean: "qiumi", meaning: "Người hâm mộ thể thao, fan bóng đá", meaningShort: "Người hâm mộ" },
                        { hanzi: "签证", pinyin: "qiānzhèng", pinyinClean: "qianzheng", meaning: "Thị thực, cấp thị thực, visa", meaningShort: "Thị thực" },
                        { hanzi: "区", pinyin: "qū", pinyinClean: "qu", meaning: "Khu vực, quận, khu", meaningShort: "Khu vực" },
                        { hanzi: "庆祝", pinyin: "qìngzhù", pinyinClean: "qingzhu", meaning: "Kỷ niệm, ăn mừng", meaningShort: "Kỷ niệm" },
                        { hanzi: "轻松", pinyin: "qīngsōng", pinyinClean: "qingsong", meaning: "Thư giãn, dễ dàng, nhẹ nhõm", meaningShort: "Thư giãn" },
                        { hanzi: "前方", pinyin: "qiánfāng", pinyinClean: "qianfang", meaning: "Phía trước", meaningShort: "Phía trước" },
                        { hanzi: "翅膀", pinyin: "chìbǎng", pinyinClean: "chibang", meaning: "Đôi cánh, cánh", meaningShort: "Đôi cánh" },
                        { hanzi: "强", pinyin: "qiáng", pinyinClean: "qiang", meaning: "Mạnh, khỏe, giỏi", meaningShort: "Mạnh" },
                        { hanzi: "气候", pinyin: "qìhòu", pinyinClean: "qihou", meaning: "Khí hậu", meaningShort: "Khí hậu" },
                        { hanzi: "千万", pinyin: "qiānwàn", pinyinClean: "qianwan", meaning: "Nhất định, ngàn vạn lần", meaningShort: "Nhất định" },
                        { hanzi: "墙", pinyin: "qiáng", pinyinClean: "qiang", meaning: "Bức tường, tường", meaningShort: "Bức tường" },
                        { hanzi: "敲", pinyin: "qiāo", pinyinClean: "qiao", meaning: "Gõ, gõ cửa", meaningShort: "Gõ" },
                        { hanzi: "桥", pinyin: "qiáo", pinyinClean: "qiao", meaning: "Cây cầu, cầu", meaningShort: "Cây cầu" },
                        { hanzi: "巧克力", pinyin: "qiǎokèlì", pinyinClean: "qiaokeli", meaning: "Sô-cô-la, kẹo socola", meaningShort: "Socola" },
                        { hanzi: "亲戚", pinyin: "qīnqī", pinyinClean: "qinqi", meaning: "Họ hàng, thân thích", meaningShort: "Họ hàng" },
                        { hanzi: "轻", pinyin: "qīng", pinyinClean: "qing", meaning: "Nhẹ, thanh nhẹ", meaningShort: "Nhẹ" },
                        { hanzi: "情况", pinyin: "qíngkuàng", pinyinClean: "qingkuang", meaning: "Tình hình, tình huống", meaningShort: "Tình hình" },
                        { hanzi: "穷", pinyin: "qióng", pinyinClean: "qiong", meaning: "Nghèo, nghèo khó", meaningShort: "Nghèo" },
                        { hanzi: "区别", pinyin: "qūbié", pinyinClean: "qubie", meaning: "Khác biệt, sự khác biệt, phân biệt", meaningShort: "Khác biệt" },
                        { hanzi: "取", pinyin: "qǔ", pinyinClean: "qu", meaning: "Lấy, rút tiền", meaningShort: "Lấy" },
                        { hanzi: "全部", pinyin: "quánbù", pinyinClean: "quanbu", meaning: "Toàn bộ, tất cả", meaningShort: "Toàn bộ" },
                        { hanzi: "缺点", pinyin: "quēdiǎn", pinyinClean: "quedian", meaning: "Khuyết điểm, nhược điểm", meaningShort: "Khuyết điểm" },
                        { hanzi: "缺少", pinyin: "quēshǎo", pinyinClean: "queshao", meaning: "Thiếu, thiếu hụt", meaningShort: "Thiếu" },
                        { hanzi: "却", pinyin: "què", pinyinClean: "que", meaning: "Nhưng, mà lại", meaningShort: "Nhưng" },
                        { hanzi: "确实", pinyin: "quèshí", pinyinClean: "queshi", meaning: "Quả thực, đích thực, thật sự", meaningShort: "Quả thực" }
                    ]
                },
                {
                    unitNumber: 270,
                    stageLabel: "Màn 2/5 • Unit 27 (Gõ Nghĩa)",
                    title: "Unit 27 (Màn Mới): Nhìn Hán Tự + Pinyin ➔ Gõ Nghĩa Tiếng Việt",
                    targetMode: "meaning",
                    words: [
                        { hanzi: "球迷", pinyin: "qiúmí", pinyinClean: "qiumi", meaning: "Người hâm mộ, fan bóng đá", meaningShort: "Người hâm mộ" },
                        { hanzi: "签证", pinyin: "qiānzhèng", pinyinClean: "qianzheng", meaning: "Thị thực, cấp thị thực, visa", meaningShort: "Thị thực" },
                        { hanzi: "区", pinyin: "qū", pinyinClean: "qu", meaning: "Khu vực, quận, khu", meaningShort: "Khu vực" },
                        { hanzi: "庆祝", pinyin: "qìngzhù", pinyinClean: "qingzhu", meaning: "Kỷ niệm, ăn mừng", meaningShort: "Kỷ niệm" },
                        { hanzi: "轻松", pinyin: "qīngsōng", pinyinClean: "qingsong", meaning: "Thư giãn, dễ dàng", meaningShort: "Thư giãn" },
                        { hanzi: "前方", pinyin: "qiánfāng", pinyinClean: "qianfang", meaning: "Phía trước", meaningShort: "Phía trước" },
                        { hanzi: "翅膀", pinyin: "chìbǎng", pinyinClean: "chibang", meaning: "Đôi cánh, cánh", meaningShort: "Đôi cánh" },
                        { hanzi: "强", pinyin: "qiáng", pinyinClean: "qiang", meaning: "Mạnh, khỏe", meaningShort: "Mạnh" },
                        { hanzi: "气候", pinyin: "qìhòu", pinyinClean: "qihou", meaning: "Khí hậu", meaningShort: "Khí hậu" },
                        { hanzi: "墙", pinyin: "qiáng", pinyinClean: "qiang", meaning: "Bức tường, tường", meaningShort: "Bức tường" },
                        { hanzi: "敲", pinyin: "qiāo", pinyinClean: "qiao", meaning: "Gõ, gõ cửa", meaningShort: "Gõ" },
                        { hanzi: "桥", pinyin: "qiáo", pinyinClean: "qiao", meaning: "Cây cầu, cầu", meaningShort: "Cây cầu" },
                        { hanzi: "亲戚", pinyin: "qīnqī", pinyinClean: "qinqi", meaning: "Họ hàng, thân thích", meaningShort: "Họ hàng" },
                        { hanzi: "轻", pinyin: "qīng", pinyinClean: "qing", meaning: "Nhẹ, thanh nhẹ", meaningShort: "Nhẹ" },
                        { hanzi: "穷", pinyin: "qióng", pinyinClean: "qiong", meaning: "Nghèo, nghèo khó", meaningShort: "Nghèo" },
                        { hanzi: "全部", pinyin: "quánbù", pinyinClean: "quanbu", meaning: "Toàn bộ, tất cả", meaningShort: "Toàn bộ" }
                    ]
                },
                {
                    unitNumber: 28,
                    stageLabel: "Màn 3/5 • Unit 28",
                    title: "Unit 28: Giao tiếp & Cảm xúc",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "然而", pinyin: "rán'ér", pinyinClean: "raner", meaning: "Tuy nhiên, thế mà", meaningShort: "Tuy nhiên" },
                        { hanzi: "热闹", pinyin: "rènao", pinyinClean: "renao", meaning: "Náo nhiệt, nhộn nhịp", meaningShort: "Náo nhiệt" },
                        { hanzi: "任何", pinyin: "rènhé", pinyinClean: "renhe", meaning: "Bất kỳ, bất cứ", meaningShort: "Bất kỳ" },
                        { hanzi: "任务", pinyin: "rènwu", pinyinClean: "renwu", meaning: "Nhiệm vụ", meaningShort: "Nhiệm vụ" },
                        { hanzi: "扔", pinyin: "rēng", pinyinClean: "reng", meaning: "Ném, vứt", meaningShort: "Ném" },
                        { hanzi: "仍然", pinyin: "réngrán", pinyinClean: "rengran", meaning: "Vẫn, vẫn cứ", meaningShort: "Vẫn" },
                        { hanzi: "日记", pinyin: "rìjì", pinyinClean: "riji", meaning: "Nhật ký", meaningShort: "Nhật ký" },
                        { hanzi: "入口", pinyin: "rùkǒu", pinyinClean: "rukou", meaning: "Lối vào, cửa vào", meaningShort: "Lối vào" },
                        { hanzi: "散步", pinyin: "sànbù", pinyinClean: "sanbu", meaning: "Đi dạo, tản bộ", meaningShort: "Đi dạo" },
                        { hanzi: "森林", pinyin: "sēnlín", pinyinClean: "senlin", meaning: "Rừng rậm, rừng", meaningShort: "Rừng" },
                        { hanzi: "沙发", pinyin: "shāfā", pinyinClean: "shafa", meaning: "Ghế sô-pha, sofa", meaningShort: "Sofa" },
                        { hanzi: "伤心", pinyin: "shāngxīn", pinyinClean: "shangxin", meaning: "Đau lòng, buồn bã", meaningShort: "Buồn" },
                        { hanzi: "商量", pinyin: "shāngliang", pinyinClean: "shangliang", meaning: "Bàn bạc, thương lượng", meaningShort: "Bàn bạc" },
                        { hanzi: "稍微", pinyin: "shāowēi", pinyinClean: "shaowei", meaning: "Hơi, một chút", meaningShort: "Một chút" },
                        { hanzi: "勺子", pinyin: "sháozi", pinyinClean: "shaozi", meaning: "Cái thìa, cái muỗng", meaningShort: "Cái thìa" },
                        { hanzi: "社会", pinyin: "shèhuì", pinyinClean: "shehui", meaning: "Xã hội", meaningShort: "Xã hội" },
                        { hanzi: "申请", pinyin: "shēnqǐng", pinyinClean: "shenqing", meaning: "Đăng ký, nộp đơn", meaningShort: "Đăng ký" },
                        { hanzi: "深", pinyin: "shēn", pinyinClean: "shen", meaning: "Sâu, đậm", meaningShort: "Sâu" },
                        { hanzi: "甚至", pinyin: "shènzhì", pinyinClean: "shenzhi", meaning: "Thậm chí", meaningShort: "Thậm chí" },
                        { hanzi: "生活", pinyin: "shēnghuó", pinyinClean: "shenghuo", meaning: "Cuộc sống, sinh hoạt", meaningShort: "Cuộc sống" }
                    ]
                },
                {
                    unitNumber: 29,
                    stageLabel: "Màn 4/5 • Unit 29",
                    title: "Unit 29: Công việc & Thành công",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "生命", pinyin: "shēngmìng", pinyinClean: "shengming", meaning: "Sinh mệnh, sự sống", meaningShort: "Sự sống" },
                        { hanzi: "生意", pinyin: "shēngyi", pinyinClean: "shengyi", meaning: "Kinh doanh, buôn bán", meaningShort: "Kinh doanh" },
                        { hanzi: "省", pinyin: "shěng", pinyinClean: "sheng", meaning: "Tiết kiệm, tỉnh", meaningShort: "Tiết kiệm" },
                        { hanzi: "剩", pinyin: "shèng", pinyinClean: "sheng", meaning: "Còn thừa, còn lại", meaningShort: "Còn lại" },
                        { hanzi: "失败", pinyin: "shībài", pinyinClean: "shibai", meaning: "Thất bại", meaningShort: "Thất bại" },
                        { hanzi: "失望", pinyin: "shīwàng", pinyinClean: "shiwang", meaning: "Thất vọng", meaningShort: "Thất vọng" },
                        { hanzi: "师傅", pinyin: "shīfu", pinyinClean: "shifu", meaning: "Sư phụ, bác tài", meaningShort: "Sư phụ" },
                        { hanzi: "十分", pinyin: "shífēn", pinyinClean: "shifen", meaning: "Vô cùng, hết sức", meaningShort: "Vô cùng" },
                        { hanzi: "实际", pinyin: "shíjì", pinyinClean: "shiji", meaning: "Thực tế", meaningShort: "Thực tế" },
                        { hanzi: "实在", pinyin: "shízài", pinyinClean: "shizai", meaning: "Thật sự, chân thật", meaningShort: "Thật sự" },
                        { hanzi: "使用", pinyin: "shǐyòng", pinyinClean: "shiyong", meaning: "Sử dụng, dùng", meaningShort: "Sử dụng" },
                        { hanzi: "世纪", pinyin: "shìjì", pinyinClean: "shiji", meaning: "Thế kỷ", meaningShort: "Thế kỷ" },
                        { hanzi: "是否", pinyin: "shìfǒu", pinyinClean: "shifou", meaning: "Hay không, liệu có", meaningShort: "Liệu có" },
                        { hanzi: "适合", pinyin: "shìhé", pinyinClean: "shihe", meaning: "Phù hợp, thích hợp", meaningShort: "Phù hợp" },
                        { hanzi: "适应", pinyin: "shìyìng", pinyinClean: "shiying", meaning: "Thích nghi, thích ứng", meaningShort: "Thích nghi" },
                        { hanzi: "收", pinyin: "shōu", pinyinClean: "shou", meaning: "Nhận, thu nhận", meaningShort: "Nhận" },
                        { hanzi: "收入", pinyin: "shōurù", pinyinClean: "shouru", meaning: "Thu nhập", meaningShort: "Thu nhập" },
                        { hanzi: "收拾", pinyin: "shōushi", pinyinClean: "shoushi", meaning: "Dọn dẹp, thu dọn", meaningShort: "Dọn dẹp" },
                        { hanzi: "首都", pinyin: "shǒudū", pinyinClean: "shoudu", meaning: "Thủ đô", meaningShort: "Thủ đô" },
                        { hanzi: "首先", pinyin: "shǒuxiān", pinyinClean: "shouxian", meaning: "Trước tiên, đầu tiên", meaningShort: "Trước tiên" }
                    ]
                },
                {
                    unitNumber: 1,
                    stageLabel: "Màn 5/5 • Unit 1",
                    title: "Unit 1: Tình yêu & Mối quan hệ",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "爱情", pinyin: "àiqíng", pinyinClean: "aiqing", meaning: "Tình yêu", meaningShort: "Tình yêu" },
                        { hanzi: "安排", pinyin: "ānpái", pinyinClean: "anpai", meaning: "Sắp xếp, bố trí", meaningShort: "Sắp xếp" },
                        { hanzi: "安全", pinyin: "ānquán", pinyinClean: "anquan", meaning: "An toàn", meaningShort: "An toàn" },
                        { hanzi: "按时", pinyin: "ànshí", pinyinClean: "anshi", meaning: "Đúng giờ, đúng hạn", meaningShort: "Đúng giờ" },
                        { hanzi: "按照", pinyin: "ànzhào", pinyinClean: "anzhao", meaning: "Dựa theo, tuân theo", meaningShort: "Dựa theo" },
                        { hanzi: "百分之", pinyin: "bǎifēnzhī", pinyinClean: "baifenzhi", meaning: "Phần trăm", meaningShort: "Phần trăm" },
                        { hanzi: "棒", pinyin: "bàng", pinyinClean: "bang", meaning: "Tuyệt vời, giỏi", meaningShort: "Tuyệt vời" },
                        { hanzi: "包子", pinyin: "bāozi", pinyinClean: "baozi", meaning: "Bánh bao", meaningShort: "Bánh bao" },
                        { hanzi: "保护", pinyin: "bǎohù", pinyinClean: "baohu", meaning: "Bảo vệ", meaningShort: "Bảo vệ" },
                        { hanzi: "保证", pinyin: "bǎozhèng", pinyinClean: "baozheng", meaning: "Đảm bảo, cam đoan", meaningShort: "Đảm bảo" },
                        { hanzi: "报名", pinyin: "bàomíng", pinyinClean: "baoming", meaning: "Đăng ký, báo danh", meaningShort: "Đăng ký" },
                        { hanzi: "抱", pinyin: "bào", pinyinClean: "bao", meaning: "Ôm", meaningShort: "Ôm" },
                        { hanzi: "抱歉", pinyin: "bàoqiàn", pinyinClean: "baoqian", meaning: "Xin lỗi, ân hận", meaningShort: "Xin lỗi" },
                        { hanzi: "倍", pinyin: "bèi", pinyinClean: "bei", meaning: "Lần, gấp bội", meaningShort: "Lần" },
                        { hanzi: "本来", pinyin: "běnlái", pinyinClean: "benlai", meaning: "Vốn dĩ, ban đầu", meaningShort: "Ban đầu" }
                    ]
                }
            ]
        },
        {
            id: "hsk5_full",
            name: "HSK 5 Vocabulary (Cao Cấp • Bản Mở Đầu)",
            badge: "HSK 5",
            description: "Chinh phục từ vựng HSK 5 học thuật, thành ngữ và giao tiếp chuyên sâu (Đang cập nhật thêm giáo trình).",
            units: [
                {
                    unitNumber: 1,
                    stageLabel: "Màn 1/2 • Unit 1 (Pinyin)",
                    title: "Unit 1: Tư duy & Học thuật (Gõ Pinyin)",
                    targetMode: "pinyin",
                    words: [
                        { hanzi: "把握", pinyin: "bǎwò", pinyinClean: "bawo", meaning: "Nắm bắt, chắc chắn", meaningShort: "Nắm bắt" },
                        { hanzi: "本质", pinyin: "běnzhì", pinyinClean: "benzhi", meaning: "Bản chất", meaningShort: "Bản chất" },
                        { hanzi: "辩论", pinyin: "biànlùn", pinyinClean: "bianlun", meaning: "Tranh luận, biện luận", meaningShort: "Tranh luận" },
                        { hanzi: "采取", pinyin: "cǎiqǔ", pinyinClean: "caiqu", meaning: "Áp dụng", meaningShort: "Áp dụng" },
                        { hanzi: "成就", pinyin: "chéngjiù", pinyinClean: "chengjiu", meaning: "Thành tựu", meaningShort: "Thành tựu" },
                        { hanzi: "承认", pinyin: "chéngrèn", pinyinClean: "chengren", meaning: "Thừa nhận, công nhận", meaningShort: "Thừa nhận" },
                        { hanzi: "承担", pinyin: "chéngdān", pinyinClean: "chengdan", meaning: "Gánh vác, đảm nhận", meaningShort: "Gánh vác" },
                        { hanzi: "创造", pinyin: "chuàngzào", pinyinClean: "chuangzao", meaning: "Sáng tạo", meaningShort: "Sáng tạo" },
                        { hanzi: "独立", pinyin: "dúlì", pinyinClean: "duli", meaning: "Độc lập, tự lập", meaningShort: "Độc lập" },
                        { hanzi: "鼓励", pinyin: "gǔlì", pinyinClean: "guli", meaning: "Khuyến khích, cổ vũ", meaningShort: "Cổ vũ" },
                        { hanzi: "观察", pinyin: "guānchá", pinyinClean: "guancha", meaning: "Quan sát", meaningShort: "Quan sát" },
                        { hanzi: "观念", pinyin: "guānniàn", pinyinClean: "guannian", meaning: "Quan niệm", meaningShort: "Quan niệm" },
                        { hanzi: "规律", pinyin: "guīlǜ", pinyinClean: "guilv", meaning: "Quy luật", meaningShort: "Quy luật" },
                        { hanzi: "合作", pinyin: "hézuò", pinyinClean: "hezuo", meaning: "Hợp tác", meaningShort: "Hợp tác" },
                        { hanzi: "价值", pinyin: "jiàzhí", pinyinClean: "jiazhi", meaning: "Giá trị", meaningShort: "Giá trị" }
                    ]
                },
                {
                    unitNumber: 105,
                    stageLabel: "Màn 2/2 • Unit 1 (Gõ Nghĩa)",
                    title: "Unit 1 (Màn Bắn Nghĩa): Nhìn Hán + Pinyin ➔ Gõ Nghĩa",
                    targetMode: "meaning",
                    words: [
                        { hanzi: "把握", pinyin: "bǎwò", pinyinClean: "bawo", meaning: "Nắm bắt, chắc chắn", meaningShort: "Nắm bắt" },
                        { hanzi: "本质", pinyin: "běnzhì", pinyinClean: "benzhi", meaning: "Bản chất", meaningShort: "Bản chất" },
                        { hanzi: "辩论", pinyin: "biànlùn", pinyinClean: "bianlun", meaning: "Tranh luận, biện luận", meaningShort: "Tranh luận" },
                        { hanzi: "成就", pinyin: "chéngjiù", pinyinClean: "chengjiu", meaning: "Thành tựu", meaningShort: "Thành tựu" },
                        { hanzi: "承认", pinyin: "chéngrèn", pinyinClean: "chengren", meaning: "Thừa nhận, công nhận", meaningShort: "Thừa nhận" },
                        { hanzi: "创造", pinyin: "chuàngzào", pinyinClean: "chuangzao", meaning: "Sáng tạo", meaningShort: "Sáng tạo" },
                        { hanzi: "独立", pinyin: "dúlì", pinyinClean: "duli", meaning: "Độc lập, tự lập", meaningShort: "Độc lập" },
                        { hanzi: "鼓励", pinyin: "gǔlì", pinyinClean: "guli", meaning: "Cổ vũ, khuyến khích", meaningShort: "Cổ vũ" },
                        { hanzi: "观察", pinyin: "guānchá", pinyinClean: "guancha", meaning: "Quan sát", meaningShort: "Quan sát" },
                        { hanzi: "规律", pinyin: "guīlǜ", pinyinClean: "guilv", meaning: "Quy luật", meaningShort: "Quy luật" },
                        { hanzi: "合作", pinyin: "hézuò", pinyinClean: "hezuo", meaning: "Hợp tác", meaningShort: "Hợp tác" },
                        { hanzi: "价值", pinyin: "jiàzhí", pinyinClean: "jiazhi", meaning: "Giá trị", meaningShort: "Giá trị" }
                    ]
                }
            ]
        }
    ];

    const TONE_CHAR_INFO = {
        "ā": { base: "a", tone: 1 }, "á": { base: "a", tone: 2 }, "ǎ": { base: "a", tone: 3 }, "à": { base: "a", tone: 4 },
        "ē": { base: "e", tone: 1 }, "é": { base: "e", tone: 2 }, "ě": { base: "e", tone: 3 }, "è": { base: "e", tone: 4 },
        "ī": { base: "i", tone: 1 }, "í": { base: "i", tone: 2 }, "ǐ": { base: "i", tone: 3 }, "ì": { base: "i", tone: 4 },
        "ō": { base: "o", tone: 1 }, "ó": { base: "o", tone: 2 }, "ǒ": { base: "o", tone: 3 }, "ò": { base: "o", tone: 4 },
        "ū": { base: "u", tone: 1 }, "ú": { base: "u", tone: 2 }, "ǔ": { base: "u", tone: 3 }, "ù": { base: "u", tone: 4 },
        "ǖ": { base: "v", tone: 1 }, "ǘ": { base: "v", tone: 2 }, "ǚ": { base: "v", tone: 3 }, "ǜ": { base: "v", tone: 4 }, "ü": { base: "v", tone: 0 },
        "ń": { base: "n", tone: 2 }, "ň": { base: "n", tone: 3 }, "ǹ": { base: "n", tone: 4 }
    };

    /**
     * Normalize any pinyin string (with or without tone marks) into lowercase ASCII letters.
     * Converts 'ü' / 'ǖ' / 'ǘ' / 'ǚ' / 'ǜ' into 'v' primary and supports 'u' variant.
     */
    function normalizePinyin(rawPinyin) {
        if (!rawPinyin) return "";
        const result = rawPinyin.toLowerCase().trim();
        let out = "";
        for (let i = 0; i < result.length; i++) {
            const ch = result[i];
            if (TONE_CHAR_INFO[ch]) {
                out += TONE_CHAR_INFO[ch].base;
            } else if (ch >= "a" && ch <= "z") {
                out += ch;
            }
        }
        return out;
    }

    /**
     * Convert tone-marked Pinyin into tone-numbered Pinyin (e.g., "nǐ hǎo" -> "ni3hao3", "māma" -> "ma1ma")
     */
    function normalizePinyinWithTones(rawPinyin) {
        if (!rawPinyin) return "";
        const lower = rawPinyin.toLowerCase().trim();
        const tokens = lower.split(/[\s'’-]+/).filter(Boolean);
        if (tokens.length === 0) return "";

        const VOWELS = "aeiouv";
        const convertChunk = chunk => {
            let clean = "";
            let tone = 0;
            for (let i = 0; i < chunk.length; i++) {
                const ch = chunk[i];
                if (TONE_CHAR_INFO[ch]) {
                    clean += TONE_CHAR_INFO[ch].base;
                    if (TONE_CHAR_INFO[ch].tone > 0) {
                        tone = TONE_CHAR_INFO[ch].tone;
                    }
                } else if (ch >= "a" && ch <= "z") {
                    clean += ch;
                }
            }
            return tone > 0 ? `${clean}${tone}` : clean;
        };

        // If separated by spaces/apostrophes, convert each token; if a single multi-syllable token has multiple tone marks, split on tone syllables
        const outParts = [];
        tokens.forEach(tok => {
            let toneCount = 0;
            for (let i = 0; i < tok.length; i++) {
                if (TONE_CHAR_INFO[tok[i]] && TONE_CHAR_INFO[tok[i]].tone > 0) toneCount++;
            }
            if (toneCount <= 1) {
                outParts.push(convertChunk(tok));
            } else {
                // Multi-syllable joined word (e.g., "nǐhǎo", "xuéxí"): place tone digit at the end of each syllable
                let currentChars = "";
                let currentTone = 0;
                for (let i = 0; i < tok.length; i++) {
                    const ch = tok[i];
                    const info = TONE_CHAR_INFO[ch];
                    if (info) {
                        currentChars += info.base;
                        if (info.tone > 0) currentTone = info.tone;
                    } else if (ch >= "a" && ch <= "z") {
                        currentChars += ch;
                    }
                    // Look ahead: if we already have a tone and the next char starts a new consonant syllable
                    const nextCh = tok[i + 1];
                    const nextBase = nextCh ? (TONE_CHAR_INFO[nextCh] ? TONE_CHAR_INFO[nextCh].base : nextCh) : "";
                    const nextNext = tok[i + 2];
                    const nextNextBase = nextNext ? (TONE_CHAR_INFO[nextNext] ? TONE_CHAR_INFO[nextNext].base : nextNext) : "";

                    if (currentTone > 0 && nextBase) {
                        const isNextVowel = VOWELS.includes(nextBase);
                        const isCurrentNOrG = ch === "n" || ch === "g" || ch === "r";
                        // End of syllable when current is vowel and next is consonant (except n/ng/r coda)
                        if (!isNextVowel && nextBase !== "n" && nextBase !== "g" && nextBase !== "r") {
                            outParts.push(`${currentChars}${currentTone}`);
                            currentChars = "";
                            currentTone = 0;
                        } else if (isCurrentNOrG && (!isNextVowel || (ch === "n" && nextBase !== "g" && VOWELS.includes(nextBase)))) {
                            // e.g. 'n' followed by consonant, or 'g' followed by anything
                            if (ch === "g" || !VOWELS.includes(nextBase)) {
                                outParts.push(`${currentChars}${currentTone}`);
                                currentChars = "";
                                currentTone = 0;
                            }
                        } else if (!isNextVowel && nextBase === "n" && VOWELS.includes(nextNextBase)) {
                            // 'n' is onset of next syllable (e.g. "mǎnì" -> ma3 + ni4)
                            outParts.push(`${currentChars}${currentTone}`);
                            currentChars = "";
                            currentTone = 0;
                        }
                    }
                }
                if (currentChars) {
                    outParts.push(currentTone > 0 ? `${currentChars}${currentTone}` : currentChars);
                }
            }
        });

        return outParts.join("");
    }

    /**
     * Normalize any Vietnamese string into lowercase ASCII letters (strips accents, spaces, punctuation).
     * e.g. "Thị thực" -> "thithuc", "Đôi cánh" -> "doicanh"
     */
    function normalizeVietnamese(rawStr) {
        if (!rawStr) return "";
        const cleaned = rawStr
            .toLowerCase()
            .replace(/đ/g, "d")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        let out = "";
        for (let i = 0; i < cleaned.length; i++) {
            const ch = cleaned[i];
            if (ch >= "a" && ch <= "z") {
                out += ch;
            }
        }
        return out;
    }

    /**
     * Generate all valid Pinyin typing sequences for a word (e.g., 'lvyou', 'luyou', and tone-numbered 'lv3you2').
     */
    function getValidPinyinVariants(wordObj, requireTones = false) {
        if (!wordObj) return ["hao"];
        const base = normalizePinyin(wordObj.pinyinClean || wordObj.pinyin);
        const toned = normalizePinyinWithTones(wordObj.pinyin || wordObj.pinyinClean || "");
        const variants = new Set();

        const addWithUmlautAndSandhi = str => {
            if (!str) return;
            variants.add(str);
            if (str.includes("v")) {
                variants.add(str.replace(/v/g, "u"));
            }
            // Support standard dictionary tones for 不 (bú <-> bù) and 一 (yí/yì <-> yī)
            if (str.includes("bu2")) variants.add(str.replace(/bu2/g, "bu4"));
            if (str.includes("bu4")) variants.add(str.replace(/bu4/g, "bu2"));
            if (str.includes("yi2")) variants.add(str.replace(/yi2/g, "yi1"));
            if (str.includes("yi4")) variants.add(str.replace(/yi4/g, "yi1"));
        };

        if (requireTones && toned) {
            addWithUmlautAndSandhi(toned);
            // For multi-word Boss sentences, also allow tone-free typing so sandhi/neutral tones never block completion
            if (wordObj.isBoss && base) {
                addWithUmlautAndSandhi(base);
            }
            return Array.from(variants).filter(Boolean);
        }

        if (base) {
            addWithUmlautAndSandhi(base);
        }
        if (wordObj.pinyin && /[ǖǘǚǜü]/.test(wordObj.pinyin)) {
            const vForm = normalizePinyin(wordObj.pinyin);
            addWithUmlautAndSandhi(vForm);
        }
        // Always allow tone-numbered typing even in normal mode for learners practicing tones
        if (!requireTones && toned) {
            addWithUmlautAndSandhi(toned);
        }
        return Array.from(variants).filter(Boolean);
    }

    /**
     * Extract concise primary Vietnamese meaning label for display hint (e.g. "Thị thực")
     */
    function getDisplayMeaningHint(wordObj) {
        if (!wordObj) return "";
        if (wordObj.meaningShort) return wordObj.meaningShort;
        const raw = (wordObj.meaning || "").replace(/\([^)]*\)/g, "").trim();
        const parts = raw.split(/[,/;•-]/).map(s => s.trim()).filter(Boolean);
        return parts[0] || raw;
    }

    /**
     * Generate the canonical Vietnamese meaning typing sequence (ASCII lowercase without spaces).
     * Strictly matches `getDisplayMeaningHint(wordObj)` (`meaningShort`) 1-to-1 so the target word
     * never mutates to a secondary meaning (e.g., never switches from "tot" (Tốt) to "dep" (Đẹp))
     * and never hijacks keystrokes meant for other meteors on screen.
     */
    function getValidMeaningVariants(wordObj) {
        if (!wordObj) return ["tu"];
        const primaryHint = getDisplayMeaningHint(wordObj);
        const primaryNorm = normalizeVietnamese(primaryHint);
        return primaryNorm ? [primaryNorm] : [normalizePinyin(wordObj.pinyin || "tu")];
    }

    /**
     * Authentic Complete Boss Sentences for all 42 Units across HSK 0 – HSK 5
     * Every Boss is a full, meaningful sentence built from the vocabulary of that unit.
     */
    const LESSON_BOSS_MAP = {
        // Starter Deck (3 units)
        "Từ Đơn Ngắn Gọn": { hanzi: "好人爱看大书", pinyin: "hǎo rén ài kàn dà shū", pinyinClean: "haorenaikandashu", meaning: "Người tốt thích đọc sách hay", meaningShort: "Người tốt thích đọc sách" },
        "Màn Bắn Nghĩa": { hanzi: "小猫和小狗爱喝水", pinyin: "xiǎo māo hé xiǎo gǒu ài hē shuǐ", pinyinClean: "xiaomaohexiaogouaiheshui", meaning: "Mèo nhỏ và chó nhỏ thích uống nước", meaningShort: "Mèo và chó thích uống nước" },
        "Số Đếm & Tự Nhiên": { hanzi: "今天山上有大风大雨", pinyin: "jīn tiān shān shàng yǒu dà fēng dà yǔ", pinyinClean: "jintianshanshangyoudafengdayu", meaning: "Hôm nay trên núi có gió lớn mưa to", meaningShort: "Trên núi có gió lớn mưa to" },

        // HSK 1 • Giáo Trình Hán Ngữ Quyển 1 (Bài 1 – Bài 15)
        "你好": { hanzi: "你好，大白马很好", pinyin: "nǐ hǎo, dà bái mǎ hěn hǎo", pinyinClean: "nihaodabaimahenhao", meaning: "Xin chào, chú ngựa trắng lớn rất khỏe", meaningShort: "Xin chào, ngựa trắng rất khỏe" },
        "汉语不太难": { hanzi: "爸爸妈妈很忙，汉语不太难", pinyin: "bà ba mā ma hěn máng, Hàn yǔ bú tài nán", pinyinClean: "babamamahenmanghanyubutainan", meaning: "Bố mẹ rất bận, tiếng Hán không khó lắm", meaningShort: "Bố mẹ bận, tiếng Hán không khó" },
        "明天见": { hanzi: "明天我去银行取钱", pinyin: "míng tiān wǒ qù yín háng qǔ qián", pinyinClean: "mingtianwoquyinhangquqian", meaning: "Ngày mai tôi đi ngân hàng rút tiền", meaningShort: "Mai tôi đi ngân hàng rút tiền" },
        "你去哪儿": { hanzi: "今天星期天，我去天安门", pinyin: "jīn tiān xīng qī tiān, wǒ qù Tiān ān mén", pinyinClean: "jintianxingqitianwoqutiananmen", meaning: "Hôm nay Chủ nhật, tôi đi Thiên An Môn", meaningShort: "Chủ nhật tôi đi Thiên An Môn" },
        "这是王老师": { hanzi: "这是王老师，请进请坐请喝茶", pinyin: "zhè shì Wáng lǎo shī, qǐng jìn qǐng zuò qǐng hē chá", pinyinClean: "zheshiwanglaoshiqingjinqingzuoqinghecha", meaning: "Đây là thầy Vương, mời vào ngồi uống trà", meaningShort: "Đây là thầy Vương, mời uống trà" },
        "我学习汉语": { hanzi: "请问你贵姓？我学习汉语", pinyin: "qǐng wèn nǐ guì xìng? wǒ xué xí Hàn yǔ", pinyinClean: "qingwenniguixingwoxuexihanyu", meaning: "Xin hỏi bạn họ gì? Tôi học tiếng Hán", meaningShort: "Bạn họ gì? Tôi học tiếng Hán" },
        "你吃什么": { hanzi: "中午我去食堂吃米饭和饺子", pinyin: "zhōng wǔ wǒ qù shí táng chī mǐ fàn hé jiǎo zi", pinyinClean: "zhongwuwoqushitangchimifanhejiaozi", meaning: "Buổi trưa tôi đi nhà ăn ăn cơm và sủi cảo", meaningShort: "Trưa đi nhà ăn ăn cơm và sủi cảo" },
        "苹果一斤多少钱": { hanzi: "苹果一斤多少钱？我买两斤", pinyin: "píng guǒ yì jīn duō shao qián? wǒ mǎi liǎng jīn", pinyinClean: "pingguoyijinduoshaoqianwomailiangjin", meaning: "Táo một cân bao nhiêu tiền? Tôi mua hai cân", meaningShort: "Táo một cân bao nhiêu tiền" },
        "我换人民币": { hanzi: "下午我去银行换人民币", pinyin: "xià wǔ wǒ qù yín háng huàn Rén mín bì", pinyinClean: "xiawuwoquyinhanghuanrenminbi", meaning: "Buổi chiều tôi đi ngân hàng đổi Nhân dân tệ", meaningShort: "Chiều đi ngân hàng đổi tiền" },
        "他住哪儿": { hanzi: "请问他住哪儿？他住八号楼", pinyin: "qǐng wèn tā zhù nǎr? tā zhù bā hào lóu", pinyinClean: "qingwentazhunartazhubahaolou", meaning: "Xin hỏi anh ấy sống ở đâu? Ở tòa nhà số 8", meaningShort: "Anh ấy sống ở tòa nhà số 8" },
        "我们都是留学生": { hanzi: "我们都是留学生，也学习汉语", pinyin: "wǒ men dōu shì liú xué shēng, yě xué xí Hàn yǔ", pinyinClean: "womendoushiliuxueshengyexuexihanyu", meaning: "Chúng tôi đều là lưu học sinh, cũng học tiếng Hán", meaningShort: "Chúng tôi đều là lưu học sinh" },
        "你在哪儿学习": { hanzi: "我觉得汉语语法不太难", pinyin: "wǒ jué de Hàn yǔ yǔ fǎ bú tài nán", pinyinClean: "wojuedehanyuyufabutainan", meaning: "Tôi cảm thấy ngữ pháp tiếng Hán không khó lắm", meaningShort: "Ngữ pháp tiếng Hán không khó" },
        "这不是中药": { hanzi: "这不是中药，这是日用品", pinyin: "zhè bú shì zhōng yào, zhè shì rì yòng pǐn", pinyinClean: "zhebushizhongyaozheshiriyongpin", meaning: "Đây không phải thuốc Bắc, đây là đồ dùng hàng ngày", meaningShort: "Đây là đồ dùng hàng ngày" },
        "你的车是新的还是旧的": { hanzi: "你的自行车是新的还是旧的", pinyin: "nǐ de zì xíng chē shì xīn de hái shi jiù de", pinyinClean: "nidezixingcheshixindehaishijiude", meaning: "Xe đạp của bạn là xe mới hay xe cũ", meaningShort: "Xe đạp của bạn mới hay cũ" },
        "你们公司有多少职员": { hanzi: "你们公司大概有多少职员", pinyin: "nǐ men gōng sī dà gài yǒu duō shao zhí yuán", pinyinClean: "nimengongsidagaiyouduoshaozhiyuan", meaning: "Công ty các bạn khoảng bao nhiêu nhân viên", meaningShort: "Công ty có bao nhiêu nhân viên" },

        // HSK 2 • Giáo Trình Hán Ngữ Quyển 2 (Bài 16 – Bài 30)
        "你常去图书馆吗": { hanzi: "我晚上常去图书馆复习课文", pinyin: "wǒ wǎn shang cháng qù tú shū guǎn fù xí kè wén", pinyinClean: "wowanshangchangqutushuguanfuxikewen", meaning: "Buổi tối tôi thường đến thư viện ôn tập bài khóa", meaningShort: "Tối thường đến thư viện ôn bài" },
        "他在做什么呢": { hanzi: "他正在房间里听音乐呢", pinyin: "tā zhèng zài fáng jiān lǐ tīng yīn yuè ne", pinyinClean: "tazhengzaifangjianlitingyinyuene", meaning: "Anh ấy đang nghe nhạc trong phòng", meaningShort: "Anh ấy đang nghe nhạc" },
        "我去邮局寄包裹": { hanzi: "我去邮局寄包裹，顺便买邮票", pinyin: "wǒ qù yóu jú jì bāo guǒ, shùn biàn mǎi yóu piào", pinyinClean: "woquyoujujibaoguoshunbianmaiyoupiao", meaning: "Tôi đi bưu điện gửi bưu phẩm, tiện thể mua tem", meaningShort: "Đi bưu điện gửi bưu phẩm" },
        "可以试试吗": { hanzi: "这件羽绒服很好看，可以试试吗", pinyin: "zhè jiàn yǔ róng fú hěn hǎo kàn, kě yǐ shì shi ma", pinyinClean: "zhejianyurongfuhenhaokankeyishishima", meaning: "Chiếc áo phao này rất đẹp, có thể thử được không", meaningShort: "Áo phao rất đẹp, thử được không" },
        "祝你生日快乐": { hanzi: "祝你生日快乐，这是送你的礼物", pinyin: "zhù nǐ shēng rì kuài lè, zhè shì sòng nǐ de lǐ wù", pinyinClean: "zhunishengrikuailezheshisongnideliwu", meaning: "Chúc bạn sinh nhật vui vẻ, đây là quà tặng bạn", meaningShort: "Chúc bạn sinh nhật vui vẻ" },
        "我们明天七点一刻出发": { hanzi: "我们明天早上七点一刻出发", pinyin: "wǒ men míng tiān zǎo shang qī diǎn yí kè chū fā", pinyinClean: "womenmingtianzaoshangqidianyikechufa", meaning: "Sáng mai 7 giờ 15 phút chúng ta xuất phát", meaningShort: "Sáng mai 7h15 xuất phát" },
        "我打算请老师教我京剧": { hanzi: "我打算请老师教我唱京剧", pinyin: "wǒ dǎ suàn qǐng lǎo shī jiāo wǒ chàng jīng jù", pinyinClean: "wodasuanqinglaoshijiaowochangjingju", meaning: "Tôi dự định mời thầy giáo dạy tôi hát Kinh kịch", meaningShort: "Định mời thầy dạy Kinh kịch" },
        "学校里边有邮局吗": { hanzi: "学校里边有邮局，离这儿不远", pinyin: "xué xiào lǐ bian yǒu yóu jú, lí zhèr bù yuǎn", pinyinClean: "xuexiaolibianyouyoujulizherbuyuan", meaning: "Trong trường có bưu điện, cách đây không xa", meaningShort: "Trong trường có bưu điện" },
        "我想学太极拳": { hanzi: "我想学打太极拳，可以报名吗", pinyin: "wǒ xiǎng xué dǎ tài jí quán, kě yǐ bào míng ma", pinyinClean: "woxiangxuedataijiquankeyibaomingma", meaning: "Tôi muốn học đánh Thái cực quyền, đăng ký được không", meaningShort: "Muốn đăng ký học Thái cực quyền" },
        "她学得很好": { hanzi: "她每天很认真，汉语说得很流利", pinyin: "tā měi tiān hěn rèn zhēn, Hàn yǔ shuō de hěn liú lì", pinyinClean: "tameitianhenrenzhenhanyushuodehenliuli", meaning: "Cô ấy mỗi ngày rất chăm chỉ, nói tiếng Hán rất lưu loát", meaningShort: "Cô ấy nói tiếng Hán rất lưu loát" },
        "田芳去哪儿了": { hanzi: "田芳去哪儿了？有人给她打电话", pinyin: "Tián Fāng qù nǎr le? yǒu rén gěi tā dǎ diàn huà", pinyinClean: "tianfangqunarleyourengeitadadianhua", meaning: "Điền Phương đi đâu rồi? Có người gọi điện cho cô ấy", meaningShort: "Điền Phương đi đâu rồi" },
        "玛丽哭了": { hanzi: "玛丽拉肚子了，我们去医院看她", pinyin: "Mǎ lì lā dù zi le, wǒ men qù yī yuàn kàn tā", pinyinClean: "maliladuzilewomenquyiyuankanta", meaning: "Mary bị đau bụng rồi, chúng ta đi bệnh viện thăm cô ấy", meaningShort: "Mary đau bụng, đi viện thăm cô ấy" },
        "我吃了早饭就来了": { hanzi: "我今天吃了早饭就来找你了", pinyin: "wǒ jīn tiān chī le zǎo fàn jiù lái zhǎo nǐ le", pinyinClean: "wojintianchilezaofanjiulaizhaonile", meaning: "Hôm nay tôi ăn sáng xong là đến tìm bạn ngay", meaningShort: "Ăn sáng xong là đến ngay" },
        "早饭吃得饱饱的": { hanzi: "我今天吃了早饭就来找你了", pinyin: "wǒ jīn tiān chī le zǎo fàn jiù lái zhǎo nǐ le", pinyinClean: "wojintianchilezaofanjiulaizhaonile", meaning: "Hôm nay tôi ăn sáng xong là đến tìm bạn ngay", meaningShort: "Ăn sáng xong là đến ngay" },
        "我都做对了": { hanzi: "今天考试的题我都做对了", pinyin: "jīn tiān kǎo shì de tí wǒ dōu zuò duì le", pinyinClean: "jintiankaoshidetiwodouzuoduile", meaning: "Đề thi hôm nay tôi đều làm đúng hết rồi", meaningShort: "Đề thi hôm nay làm đúng hết" },
        "我来了两个多月了": { hanzi: "我来中国已经两个多月了", pinyin: "wǒ lái Zhōng guó yǐ jīng liǎng ge duō yuè le", pinyinClean: "wolaizhongguoyijinglianggeduoyuele", meaning: "Tôi đến Trung Quốc đã hơn hai tháng rồi", meaningShort: "Đến Trung Quốc hơn hai tháng rồi" },

        // HSK 3, HSK 4, HSK 5 Units
        "Tính cách & Kế hoạch": { hanzi: "他学习很认真，周末打算参加比赛", pinyin: "tā xué xí hěn rèn zhēn, zhōu mò dǎ suàn cān jiā bǐ sài", pinyinClean: "taxuexihenrenzhenzhoumodasuancanjiabisai", meaning: "Anh ấy học tập rất nghiêm túc, cuối tuần định tham gia thi đấu", meaningShort: "Học nghiêm túc, cuối tuần thi đấu" },
        "Unit 1 (Màn Bắn Nghĩa)": { hanzi: "他学习很认真，周末打算参加比赛", pinyin: "tā xué xí hěn rèn zhēn, zhōu mò dǎ suàn cān jiā bǐ sài", pinyinClean: "taxuexihenrenzhenzhoumodasuancanjiabisai", meaning: "Anh ấy học tập rất nghiêm túc, cuối tuần định tham gia thi đấu", meaningShort: "Học nghiêm túc, cuối tuần thi đấu" },
        "Unit 27": { hanzi: "办好签证以后，我们一起去庆祝", pinyin: "bàn hǎo qiān zhèng yǐ hòu, wǒ men yì qǐ qù qìng zhù", pinyinClean: "banhaoqianzhengyihouwomenyiqiquqingzhu", meaning: "Sau khi làm xong thị thực, chúng ta cùng đi ăn mừng", meaningShort: "Làm xong visa cùng đi ăn mừng" },
        "Unit 28": { hanzi: "晚饭以后我们常去森林公园散步", pinyin: "wǎn fàn yǐ hòu wǒ men cháng qù sēn lín gōng yuán sàn bù", pinyinClean: "wanfanyihouwomenchangqusenlingongyuansanbu", meaning: "Sau bữa tối chúng tôi thường đi dạo ở công viên rừng", meaningShort: "Sau bữa tối đi dạo công viên rừng" },
        "Unit 29": { hanzi: "想做好生意，必须了解实际情况", pinyin: "xiǎng zuò hǎo shēng yi, bì xū liǎo jiě shí jì qíng kuàng", pinyinClean: "xiangzuohaoshengyibixuliaojieshijiqingkuang", meaning: "Muốn kinh doanh tốt, phải hiểu rõ tình hình thực tế", meaningShort: "Kinh doanh phải hiểu tình hình thực tế" },
        "Tình yêu & Mối quan hệ": { hanzi: "请放心，我保证按时完成任务", pinyin: "qǐng fàng xīn, wǒ bǎo zhèng àn shí wán chéng rèn wu", pinyinClean: "qingfangxinwobaozhenganshiwanchengrenwu", meaning: "Xin yên tâm, tôi đảm bảo hoàn thành nhiệm vụ đúng hạn", meaningShort: "Đảm bảo hoàn thành nhiệm vụ đúng hạn" },
        "Tư duy & Học thuật": { hanzi: "我们要观察规律，努力创造价值", pinyin: "wǒ men yào guān chá guī lǜ, nǔ lì chuàng zào jià zhí", pinyinClean: "womenyaoguanchaguilvnulichuangzaojiazhi", meaning: "Chúng ta cần quan sát quy luật, nỗ lực tạo ra giá trị", meaningShort: "Quan sát quy luật, tạo ra giá trị" }
    };

    /**
     * Get or construct the Boss Sentence for a given Unit (Always a full Chinese sentence!)
     */
    function getUnitBossWord(unit) {
        if (!unit) {
            return {
                hanzi: "我们一起努力学习汉语",
                pinyin: "wǒ men yì qǐ nǔ lì xué xí Hàn yǔ",
                pinyinClean: "womenyiqinulixuexihanyu",
                meaning: "Chúng ta cùng nhau nỗ lực học tiếng Hán",
                meaningShort: "Cùng nỗ lực học tiếng Hán",
                isBoss: true
            };
        }
        if (unit.bossWord) {
            return Object.assign({ isBoss: true }, unit.bossWord);
        }
        const title = unit.title || "";
        for (const key of Object.keys(LESSON_BOSS_MAP)) {
            if (title.includes(key)) {
                return Object.assign({ isBoss: true }, LESSON_BOSS_MAP[key]);
            }
        }
        const words = Array.isArray(unit.words) ? unit.words : [];
        if (words.length >= 2) {
            const first = words[0];
            const second = words[1];
            return {
                hanzi: `今天我们学习${first.hanzi}和${second.hanzi}`,
                pinyin: `jīn tiān wǒ men xué xí ${first.pinyin} hé ${second.pinyin}`,
                pinyinClean: normalizePinyin(`jintianwomenxuexi${first.pinyin}he${second.pinyin}`),
                meaning: `Hôm nay chúng ta học "${getDisplayMeaningHint(first)}" và "${getDisplayMeaningHint(second)}"`,
                meaningShort: `Học ${getDisplayMeaningHint(first)} và ${getDisplayMeaningHint(second)}`,
                isBoss: true
            };
        }
        return {
            hanzi: "我们一起努力学习汉语",
            pinyin: "wǒ men yì qǐ nǔ lì xué xí Hàn yǔ",
            pinyinClean: "womenyiqinulixuexihanyu",
            meaning: "Chúng ta cùng nhau nỗ lực học tiếng Hán",
            meaningShort: "Cùng nỗ lực học tiếng Hán",
            isBoss: true
        };
    }

    return {
        DECKS,
        normalizePinyin,
        normalizePinyinWithTones,
        normalizeVietnamese,
        getValidPinyinVariants,
        getValidMeaningVariants,
        getDisplayMeaningHint,
        getUnitBossWord
    };
})();
