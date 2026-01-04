import fs from 'fs';
import path from 'path';

async function main() {
    const cwd = process.cwd();
    const SORTED_DIR = path.join(cwd, 'Sorted_Butterflies');
    const PUBLIC_TEMP_DIR = path.join(cwd, 'public/sorted_temp');
    const MANIFEST_PATH = path.join(cwd, 'public/import_manifest.json');

    console.log(`Sorted Dir: ${SORTED_DIR}`);
    console.log(`Public Temp Dir: ${PUBLIC_TEMP_DIR}`);

    const LANG_MAP = {
        'English': 'en',
        'ไทย': 'th',
        '中文': 'zh',
        'Русский': 'ru',
        '日本語': 'jp',
        '한국어': 'kr',
        'العربية': 'ar'
    };

    // Ensure public temp dir exists
    try {
        if (fs.existsSync(PUBLIC_TEMP_DIR)) {
            // Try to remove, but ignore if fails (e.g. locked files)
            try {
                fs.rmSync(PUBLIC_TEMP_DIR, { recursive: true, force: true });
            } catch (e) {
                console.warn("Could not delete temp dir, might be in use. Continuing...");
            }
        }
    } catch (e) {
        console.warn("Error checking temp dir:", e);
    }

    if (!fs.existsSync(PUBLIC_TEMP_DIR)) {
        fs.mkdirSync(PUBLIC_TEMP_DIR, { recursive: true });
    }

    function parseInfoTxt(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').map(l => l.trim());

        const data = {};
        let currentLang = null;

        for (let line of lines) {
            if (!line) continue;

            if (LANG_MAP[line]) {
                currentLang = LANG_MAP[line];
                continue;
            }

            if (!currentLang) continue;

            if (!data[currentLang]) data[currentLang] = {};

            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim().toLowerCase();
                const value = parts.slice(1).join(':').trim();

                if (key.includes('rarity') || key.includes('ระดับความหายาก') || key.includes('稀有度') || key.includes('редкость') || key.includes('レア度') || key.includes('희귀도') || key.includes('معدل الندرة')) {
                    const match = value.match(/(\d)\/5/);
                    if (match) data.rarity = parseInt(match[1]);
                } else if (key.includes('name') || key.includes('ชื่อ') || key.includes('名称') || key.includes('название') || key.includes('名前') || key.includes('이름') || key.includes('الاسم')) {
                    data[currentLang].name = value.replace(/\(.*\)/, '').trim();
                } else if (key.includes('scientific') || key.includes('วิทยาศาสตร์') || key.includes('学名') || key.includes('научное') || key.includes('العلمي')) {
                    data.scientificName = value;
                } else if (key.includes('description') || key.includes('คำอธิบาย') || key.includes('描述') || key.includes('описание') || key.includes('説明') || key.includes('설명') || key.includes('الوصف')) {
                    data[currentLang].description = value;
                } else if (key.includes('habitat') || key.includes('ถิ่นที่อยู่') || key.includes('栖息地') || key.includes('среда обитания') || key.includes('生息地') || key.includes('서식지') || key.includes('الموطن')) {
                    data[currentLang].habitat = value;
                } else if (key.includes('wingspan') || key.includes('ความกว้างปีก') || key.includes('翼展') || key.includes('размах крыльев') || key.includes('翼開長') || key.includes('날개 편 길이') || key.includes('طول الجناح')) {
                    data[currentLang].wingspan = value;
                } else if (key.includes('lifespan') || key.includes('อายุขัย') || key.includes('寿命') || key.includes('продолжительность жизни') || key.includes('수명') || key.includes('العمر')) {
                    data[currentLang].lifespan = value;
                } else if (key.includes('best viewing') || key.includes('best time') || key.includes('ช่วงเวลาที่เหมาะสม') || key.includes('最佳观赏') || key.includes('лучшее время') || key.includes('ベストな観察') || key.includes('관찰하기 가장 좋은') || key.includes('أفضل وقت')) {
                    data[currentLang].bestTime = value;
                } else if (key.includes('fun fact') || key.includes('เกร็ดน่ารู้') || key.includes('趣闻') || key.includes('интересный факт') || key.includes('豆知識') || key.includes('재미있는 사실') || key.includes('حقيقة ممتعة')) {
                    data[currentLang].funFact = value;
                }
            } else if (line.startsWith('-')) {
                const cleanLine = line.substring(1).trim();
                const subParts = cleanLine.split(':');
                if (subParts.length >= 2) {
                    const key = subParts[0].trim().toLowerCase();
                    const value = subParts.slice(1).join(':').trim();
                    if (key.includes('habitat') || key.includes('ถิ่นที่อยู่')) data[currentLang].habitat = value;
                    if (key.includes('wingspan') || key.includes('ความกว้างปีก')) data[currentLang].wingspan = value;
                    if (key.includes('lifespan') || key.includes('อายุขัย')) data[currentLang].lifespan = value;
                    if (key.includes('best') || key.includes('ช่วงเวลา')) data[currentLang].bestTime = value;
                }
            }
        }
        return data;
    }

    const speciesDirs = fs.readdirSync(SORTED_DIR).filter(file => fs.statSync(path.join(SORTED_DIR, file)).isDirectory());
    const manifest = [];

    console.log(`Found ${speciesDirs.length} species folders.`);

    for (const dir of speciesDirs) {
        console.log(`Processing ${dir}...`);
        const dirPath = path.join(SORTED_DIR, dir);
        const files = fs.readdirSync(dirPath);

        const infoFile = files.find(f => f === 'info.txt');
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

        if (!infoFile) {
            console.warn(`Skipping ${dir}: info.txt not found.`);
            continue;
        }

        const info = parseInfoTxt(path.join(dirPath, infoFile));

        const targetDir = path.join(PUBLIC_TEMP_DIR, dir);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const processedImages = [];
        for (const img of imageFiles) {
            // Only copy if not exists or force?
            // Copying might fail if file locked.
            try {
                fs.copyFileSync(path.join(dirPath, img), path.join(targetDir, img));
            } catch (e) {
                console.warn(`Failed to copy ${img}: ${e.message}`);
            }
            processedImages.push({
                originalName: img,
                path: `/sorted_temp/${dir}/${img}`
            });
        }

        manifest.push({
            id: dir,
            ...info,
            images: processedImages
        });
    }

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`Manifest generated at ${MANIFEST_PATH}`);
}

main().catch(err => {
    console.error("Fatal Error:", err);
    fs.writeFileSync('manifest_error.log', err.stack);
});
