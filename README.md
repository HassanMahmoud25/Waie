# وعي — منصة محتوى معرفية

تطبيق Next.js (App Router) عربي RTL ينظّم حلقات قناة وعي في سلاسل وموضوعات ومختارات، مع مشغّل مشاهدة/استماع دائم، ومكتبة شخصية (حفظ، تقدّم، ملاحظات، متابعة سلاسل، إشعارات)، ولوحة إدارة في `/admin` لإدارة المحتوى ومزامنته من YouTube.

**التقنيات:** Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 + PostgreSQL · TanStack Query 5 · Zod.

## التشغيل محليًا

المتطلبات: Node.js 22 (لا يقل عن 21؛ أمر الاختبارات يعتمد على glob في `node --test`) وPostgreSQL.

```bash
npm install
cp .env.example .env           # ثم املأ القيم (Prisma CLI يقرأ .env؛ Next يقرأ .env.local أيضًا ويقدّمه)
npm run db:deploy              # تطبيق المهاجرات على قاعدتك المحلية
npm run db:pull-content        # اختياري: نسخ محتوى الإنتاج (انظر «قاعدة التطوير المحلية»)
npm run admin:create -- you@example.com "الاسم"   # حساب مسؤول للوحة الإدارة
npm run dev
```

افتح `http://localhost:3000`. قاعدة البيانات هي المصدر الوحيد للمحتوى — لا توجد بيانات تجريبية؛ بدون `DATABASE_URL` تفشل الصفحات برسالة واضحة. بقاعدة فارغة، أضف المحتوى من `/admin/sync/youtube` (يتطلب `YOUTUBE_API_KEY`).

### متغيرات البيئة

القائمة الكاملة مع الشرح في `.env.example`. كلها تُقرأ على الخادم فقط، ما عدا `NEXT_PUBLIC_SITE_URL`.

| المتغير | مطلوب؟ | الغرض |
| --- | --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | نعم | PostgreSQL. `DIRECT_URL` لأوامر Prisma CLI (اتصال غير مجمّع). |
| `AUTH_SECRET` | نعم | توقيع كوكي الجلسة، 32 حرفًا على الأقل (`openssl rand -base64 48`). تغييره يُخرج الجميع. |
| `NEXT_PUBLIC_SITE_URL` | في الإنتاج | الأصل القانوني للروابط وsitemap وصور المشاركة. |
| `YOUTUBE_API_KEY` | للمزامنة | YouTube Data API، يُستخدم في `src/lib/youtube` فقط. |
| `YOUTUBE_CHANNEL_HANDLE` | لا | الافتراضي `@Waie`. |
| `PODCAST_FEED_URL` | لا | مصدر صوت وضع الاستماع؛ قيمة فارغة تعطّله. |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | لرسائل إعادة التعيين | بدونها ينجح الطلب ظاهريًا ولا تُرسل رسالة (يُسجَّل في السجلات). |

## الأوامر

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | خادم التطوير. |
| `npm run build` / `npm start` | `prisma generate` ثم بناء الإنتاج / تشغيله. |
| `npm run lint` | ESLint (`next/core-web-vitals` + TypeScript). |
| `npx tsc --noEmit` | فحص الأنواع. |
| `npm test` | كل ملفات `src/**/*.test.ts` عبر `node:test` + tsx. لا تحتاج قاعدة بيانات. |
| `npm run db:migrate` | إنشاء مهاجرة جديدة أثناء التطوير (`prisma migrate dev`). |
| `npm run db:deploy` / `db:status` | تطبيق المهاجرات / عرض حالتها. |
| `npm run db:pull-content` | نسخ جداول المحتوى من الإنتاج إلى القاعدة المحلية (قراءة فقط من الإنتاج). |
| `npm run admin:create -- email "الاسم"` | إنشاء مسؤول أو إعادة تعيين كلمة مروره (تُطلب بشكل مخفي، 12 حرفًا فأكثر). |
| `npm run people:seed-hosts` | إنشاء سجلات `Person` للمقدّمين الثلاثة. |
| `npm run audio:encode` | احتياطي لترميز صوت حلقة غير موجودة في الـpodcast — انظر `docs/audio-pipeline.md`. |

## البنية

```text
src/
├── app/                  مسارات App Router
│   ├── (site)/           الموقع العام: الرئيسية، الحلقات، السلاسل، المواضيع، المختارات، البحث، المكتبة، الإشعارات
│   ├── (auth)/           تسجيل الدخول، إنشاء حساب، نسيت/إعادة تعيين كلمة المرور
│   ├── admin/            لوحة الإدارة (محمية — انظر «المصادقة»)
│   ├── sitemap.ts, robots.ts, صور og/twitter
├── components/           واجهة مقسّمة حسب المجال (episode, series, media, admin, auth, ui, shared, ...)
├── hooks/                hooks العميل (المكتبة المحلية، التشغيل، استعلامات TanStack، الحوارات)
├── lib/
│   ├── repositories/     ContentRepository — كل قراءات المحتوى العام تمر من هنا (Prisma)
│   ├── admin/            قراءات وServer Actions لوحة الإدارة
│   ├── auth/             الجلسة، كلمات المرور، إعادة التعيين، requireAdmin
│   ├── library/          حفظ/تقدّم/ملاحظات/متابعة: قراءات الخادم + Server Actions
│   ├── notifications/    الإشعارات
│   ├── playback/         محرّك المشغّل العام (YouTube iframe + <audio> واحد)
│   ├── audio/            مطابقة الحلقات بخلاصة الـpodcast، SoundCloud
│   ├── sync/, youtube/   مزامنة القناة (الخادم فقط)
│   ├── query/            مفاتيح TanStack Query وخريطة الإبطال
│   ├── validation/       مخططات Zod للإدخال
│   └── search/           تطبيع النص العربي وترتيب النتائج
├── types/                أنواع المجال المستقلة عن Prisma
├── config/site.ts        اسم الموقع والتنقل وأصل الروابط
└── middleware.ts         فحص توقيع جلسة /admin
prisma/                   schema.prisma + migrations
scripts/                  أدوات سطر الأوامر أعلاه
docs/audio-pipeline.md    مصدر الصوت ولماذا لا يُؤخذ من YouTube أبدًا
```

### تدفق البيانات

- **القراءة:** الصفحات Server Components تستدعي `contentRepository` (`src/lib/repositories`) أو قراءات `lib/library` / `lib/admin` مباشرة. الواجهة لا تستورد Prisma.
- **الكتابة:** كل تعديل Server Action (`"use server"`) يتحقق من الهوية والصلاحية بنفسه، ويتحقق من المدخلات بـZod، ثم يستدعي `revalidatePath`.
- **العميل:** TanStack Query فقط لما يجلبه العميل بنفسه (البحث الحي، روابط المكتبة بالمعرّفات). المفاتيح في `src/lib/query/keys.ts`، وما يُبطَل بعد كل تعديل في `src/lib/query/invalidate.ts`.
- **المكتبة للزائر غير المسجّل** تُحفظ في `localStorage` (`hooks/use-library.ts`, `hooks/use-notes.ts`)؛ للمسجّل في قاعدة البيانات، عبر الـproviders في `(site)/layout.tsx`.

### التخزين المؤقت

- كل الصفحات تُرسم عند الطلب (`dynamic = "force-dynamic"` في `app/layout.tsx`)، فلا توجد بيانات قديمة على الخادم.
- `experimental.staleTimes.dynamic = 900` في `next.config.ts`: تُعرض الصفحة التي زرتها خلال 15 دقيقة فورًا من Router Cache بدل إعادة هيكل التحميل. أي `revalidatePath` أو تغيير كوكي في Server Action (تسجيل دخول/خروج) يمسح هذا الكاش بالكامل.
- `components/shared/router-cache-freshness.tsx` يحدّث الصفحة الحالية في الخلفية بعد 15 دقيقة. القيمتان يجب أن تبقيا متساويتين.
- **عند إضافة تعديل إداري جديد:** استدعِ `revalidatePath`، ومن العميل `useInvalidateAfterMutation()` بالنوع المناسب.

### المصادقة والصلاحيات

- جلسة موقّعة (HMAC-SHA256) في كوكي `waie_session` بخاصية HttpOnly، تحمل معرّف المستخدم و`sessionVersion` (`src/lib/auth/session.ts`). الدور يُقرأ من قاعدة البيانات في كل طلب. تغيير كلمة المرور أو إعادة تعيينها يزيد `sessionVersion` فتُلغى الجلسات الأخرى.
- `/admin` محمي بثلاث طبقات، ويجب الإبقاء عليها كلها: `src/middleware.ts` (التوقيع فقط)، ثم `requireAdmin()` في `admin/layout.tsx` و**كل صفحة إدارية وكل Server Action إداري**. الـServer Actions نقاط POST عامة، لذا كل action جديد يجب أن يتحقق بنفسه.
- بدون `DATABASE_URL` أو `AUTH_SECRET` تُغلق لوحة الإدارة تمامًا (fail closed).

## قاعدة التطوير المحلية ونسخ محتوى الإنتاج

التطوير المحلي يعمل على PostgreSQL محلية مستقلة (مثلًا `brew install postgresql@17 && brew services start postgresql@17` ثم `createdb waie_dev`)، ويشير إليها `DATABASE_URL` في `.env` و`.env.local`. روابط الإنتاج (Supabase) تُحفظ في `.env.supabase.local` (مستبعد من git، ولا يقرؤه Next.js ولا Prisma تلقائيًا).

`db:pull-content` (`scripts/pull-production-content.sh`) يقرأ من الإنتاج عبر `pg_dump --data-only` داخل معاملة READ ONLY، ويرفض الكتابة إلا إذا كان `DATABASE_URL` المحلي على `localhost`. ينسخ جداول المحتوى فقط، ولا ينسخ أبدًا المستخدمين أو كلمات المرور أو بيانات المستخدمين أو `SyncRun`. لذلك قسم «الأكثر مشاهدة» (المرتّب حسب مرات الحفظ) يعرض محليًا أحدث الحلقات — هذا متوقع.

## النشر

مصمّم لـVercel (أو أي منصة Node مع PostgreSQL):

1. اضبط متغيرات البيئة أعلاه، و`NEXT_PUBLIC_SITE_URL` على الدومين النهائي.
2. طبّق المهاجرات **قبل** نشر كود يعتمد عليها، وبشكل متعمّد:
   ```bash
   node --env-file=.env.supabase.local node_modules/.bin/prisma migrate deploy
   ```
3. `npm run build` يشغّل `prisma generate` تلقائيًا.

## ملاحظات وقيود معروفة

- **صور YouTube** تُعرض عبر `EpisodeThumbnail` بخاصية `unoptimized`: حصة Image Optimization في Vercel مستنفدة، وأي تحويل جديد لصورة من `i.ytimg.com` عبر `/_next/image` يعيد 402.
- **الصوت** يأتي من خلاصة الـpodcast الرسمية، ولا يُستخرج من YouTube أبدًا (سياسات YouTube) — التفاصيل في `docs/audio-pipeline.md`.
- **البحث** يطابق النص العربي المطبّع في الذاكرة على كل الحلقات المنشورة. هذا مناسب لحجم الكتالوج الحالي (~100 حلقة، أقل من 30ms)، ويحتاج فهرسة نصية إن كبر الكتالوج كثيرًا.
- **لا يوجد حد لمحاولات تسجيل الدخول أو إنشاء الحسابات** — يحتاج مخزنًا مشتركًا (مثل Upstash) على Vercel.
