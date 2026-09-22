# وعي — منصة محتوى معرفية

تطبيق Next.js عربي RTL ينظم محتوى قناة وعي في سلاسل وموضوعات ومختارات قابلة للإدارة، بدل أن يكون مجرد واجهة لفيديوهات YouTube.

## ما هو موجود في MVP

- الصفحة الرئيسية التحريرية، وصفحات السلاسل والموضوعات والمختارات والحلقات.
- صفحة بحث أولية، ومكتبة شخصية كنموذج لواجهة الحساب.
- تضمين YouTube عبر نطاق الخصوصية المحسن `youtube-nocookie.com`.
- لوحة إدارة أولية في `/admin` ومسارات منظمة قابلة للربط بإجراءات الخادم.
- مخطط Prisma قابل للتوسع: الحلقات، السلاسل، الموضوعات، المختارات، التقدم، المحفوظات، المتابعات، الملاحظات، والنصوص المفرّغة.
- SEO أساسي: metadata وrobots وsitemap، مع قابلية إضافة JSON-LD للـVideoObject عند وصل البيانات الحقيقية.
- طبقة `src/lib/youtube/service.ts` لا تضع مفتاح YouTube في المتصفح وتحافظ على الفصل بين بيانات YouTube والبيانات التحريرية.

## التشغيل

```bash
npm install
cp .env.example .env
npm run dev
```

افتح `http://localhost:3000`. تستخدم الواجهة بيانات عرض مستقلة في `src/lib/content.ts` حتى تظهر قبل ربط قاعدة البيانات.

## قاعدة البيانات

أنشئ قاعدة PostgreSQL ثم حدّث `DATABASE_URL` في `.env`:

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

بعد ذلك، انقل repository الخاص بالمحتوى تدريجيًا من `src/lib/content.ts` إلى Prisma. هذا الملف هو seed/demo فقط، وليس موضع المحتوى داخل مكونات React.

## حماية لوحة الإدارة

`/admin` متاح للمسؤولين فقط. الحماية على الخادم عبر `src/middleware.ts` (فحص توقيع الجلسة) و`requireAdmin()` في `src/lib/auth/server.ts` (يتحقق من دور `ADMIN` في قاعدة البيانات) داخل الـlayout وكل صفحة وكل Server Action إداري. تسجيل الدخول من `/login` نفسها؛ بيانات الاعتماد الحقيقية تُفحص أولًا على الخادم، وإلا يعمل الدخول التجريبي المحلي للزوار كما كان.

```bash
# 1) في .env: AUTH_SECRET بطول 32 حرفًا على الأقل (openssl rand -base64 48) وDATABASE_URL
# 2) طبّق تغيير المخطط (إضافة role وpasswordHash إلى User)
npm run db:migrate -- --name user-roles     # أو: npx prisma db push
# 3) أنشئ حساب المسؤول (كلمة المرور 12 حرفًا فأكثر، تُطلب بشكل مخفي)
npm run admin:create -- you@example.com "الاسم"
```

بدون `DATABASE_URL` أو `AUTH_SECRET` تُغلق لوحة الإدارة تمامًا (fail closed).

## إدارة المحتوى

المسار `/admin` هو نقطة البداية لغير المطور:

1. الصق رابط YouTube في إضافة حلقة.
2. استخرج الفيديو عبر `fetchVideoMetadata` على الخادم (أضف `YOUTUBE_API_KEY`).
3. اختر السلسلة والموضوعات واضف الوصف التحريري وSEO.
4. انشر.

عند بناء `admin/sync`، حدّث فقط الحقول التي يملكها YouTube: `youtubeVideoId` وبيانات النشر والصورة والعنوان إن لم يوجد override. لا تحدّث `descriptionOverride` أو الموضوعات أو السلسلة أو المختارات أو SEO تلقائيًا.

## الهيكل

- `src/app`: صفحات App Router وSEO routes.
- `src/components`: مكونات العرض القابلة لإعادة الاستخدام.
- `src/lib/content.ts`: بيانات العرض المبدئية، خارج المكونات.
- `src/lib/youtube`: حد تكامل YouTube الآمن على الخادم.
- `prisma/schema.prisma`: نموذج البيانات الدائم.

## الخطوات التالية

1. أضف NextAuth أو مزود auth ثم اربط `WatchProgress` و`SavedEpisode` و`Note` بالمستخدم.
2. حوّل صفحة الإدارة إلى Server Actions مع `react-hook-form` وZod؛ مخطط التحقق الأولي في `src/lib/validation.ts`.
3. أضف البحث النصي في PostgreSQL ثم استبدله عند الحاجة بـMeilisearch أو Algolia خلف adapter واحد.
4. أضف صفوف transcript داخل `Transcript` وأظهر بحثًا زمنيًا؛ لا يلزم تغيير نموذج الحلقة.
5. انشر إلى Vercel أو أي منصة Node مع PostgreSQL، واضبط `NEXT_PUBLIC_SITE_URL` إلى الدومين النهائي.
