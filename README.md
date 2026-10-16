# فيديو موشن جرافيك باستخدام Remotion

فيديو موشن جرافيك (10 ثواني، مقاس طولي للريلز 1080×1920، 30fps) مكتوب بـ React و [Remotion](https://www.remotion.dev).

## المشاهد
1. **العنوان** (`src/scenes/TitleScene.tsx`) – عنوان بيدخل بحركة spring وخط ملوّن وعنوان فرعي.
2. **المميزات** (`src/scenes/FeaturesScene.tsx`) – 3 كروت فوق بعض بتدخل من الجناب وبتطفو.
3. **الختام** (`src/scenes/OutroScene.tsx`) – اسم البراند مع دايرة بتلف وجملة ختامية.
4. **الخلفية** (`src/scenes/Background.tsx`) – تدرّج لوني وأشكال متحركة طول الفيديو.

## الموسيقى
الموسيقى في `public/audio/music.mp3`، وهي موسيقى أصلية متولّدة بالكود (`scripts/generate-music.mjs`)، يعني من غير أي حقوق ملكية.
سرعتها 108 BPM عشان الانتقال بين المشاهد ييجي على الإيقاع، وفيها صوت whoosh وضربة عند كل انتقال.
- عشان تولّدها تاني: `npm run music` (محتاج ffmpeg).
- عشان تحط موسيقى من عندك: بدّل الملف `public/audio/music.mp3` بنفس الاسم.
- مستوى الصوت والـ fade: في `src/MotionIntro.tsx`.

## التشغيل
```bash
npm install
npm run dev      # يفتح Remotion Studio للمعاينة والتعديل
npm run render   # يطلع الفيديو في out/video.mp4
```

## التعديل
- النصوص: `defaultProps` في `src/Root.tsx` (ممكن كمان تعدّلها من Remotion Studio).
- الألوان: `colors` في `src/theme.ts`.
- مدة كل مشهد: الـ `Sequence` في `src/MotionIntro.tsx`.

---

# «أصحاب المزرعة» — الحلقة 1: «موو، بيب، أُنك!» (`FarmSong`)

أغنية أطفال 45 ثانية (1080×1920، 30fps) بثلاث شخصيات أصلية: **موومو** البقرة، **بيبو** الكتكوت، **لولو** الخنزيرة.
خطة الإنتاج الكاملة (الكلمات، المشاهد، برومبتات أدوات توليد الفيديو، الوصف والعنوان) في `episode-01-farm-song/PRODUCTION.md`.

- الفيديو الجاهز: `renders/farm-song-ep01.mp4`، والصورة المصغّرة: `renders/farm-song-ep01-thumbnail.png`.
- الشخصيات مرسومة SVG في `src/farm/characters/` (شكل ولبس ثابت في كل المشاهد)، والمزرعة في `src/farm/Farm.tsx`.
- المشاهد الستة في `src/farm/scenes.tsx` (كل مشهد 225 فريم = 16 نبضة على 128 BPM)، والكلمات في `src/farm/Lyrics.tsx`.
- آخر فريم هو نفس أول فريم (بيبو جوه كومة القش)، فالفيديو بيعيد نفسه من غير قطع.
- الموسيقى والمؤثرات أصلية ومتولّدة بالكود (`scripts/generate-farm-song.mjs`) ومظبوطة على −14 LUFS من غير أصوات عالية مفاجئة. الغناء نفسه مش متسجّل: اللحن بيعزفه الماريمبا والكلمات ظاهرة على الشاشة، ولو عايز صوت مغنّي سجّله على نفس الإيقاع وحطّه فوق الملف.

```bash
npm run farm-music    # يولّد public/audio/farm-song.mp3 (محتاج ffmpeg)
npm run render:farm   # يطلع الفيديو في out/farm-song.mp4
```

---

خط Cairo موجود في `public/fonts` (رخصة SIL OFL) عشان الرندر يشتغل من غير إنترنت.
