# Gemicilerde Beslenme Durumu Formu

Next.js 16 + Supabase tabanli, halka acik bir tez anket uygulamasi.

## Neler var?

- Tez dokumanindaki sorulari web formuna donusturen 9 bolumlu akis
- Mobil uyumlu, sicak renk paletli arayuz
- Supabase'e server-side insert yapan guvenli `/api/submissions` rotasi
- `/admin` altinda Supabase Auth ile korunan yonetici paneli
- Taslak + yayinla modeliyle versiyonlu form CMS'i
- Yanit listesi, detay gorunumu ve grafik tabanli analitik ekranlari
- Besin tuketim sikligi, Bristol diski olcegi, UPF taramasi ve PSQI alanlari
- Yerel taslak kaydi

## Kurulum

1. Bagimliliklari kurun:

```bash
npm install
```

2. Ortam degiskenlerini hazirlayin:

```bash
cp .env.example .env.local
```

3. `.env.local` icine Supabase bilgilerinizi ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Supabase SQL Editor'da [schema.sql](/Users/dogukantopcu/Desktop/jobs/other/burak-tutus-tez-form/supabase/schema.sql) dosyasindaki sorguyu calistirin.

5. Supabase Authentication > Users altinda en az bir email/password kullanicisi olusturun.

6. Gelistirme sunucusunu baslatin:

```bash
npm run dev
```

7. Tarayicida `http://localhost:3000` adresini acin. Admin panel icin `http://localhost:3000/admin/login` adresine gidin.

Ilk admin girisinde `admin_users` tablosu bossa, oturum acan kullanici `owner` olarak kaydedilir.

## Veri modeli

- `survey_versions`: Draft, published ve archived form versiyonlari ile JSONB schema snapshot'lari.
- `survey_responses`: Tum yanitlar, ilgili `survey_version_id` ve immutable `survey_snapshot` ile saklanir.
- `admin_users`: `/admin` erisimi olan Supabase Auth kullanicilari.
- `profile`: Demografik ozet alanlari ayri JSONB olarak yazilir.
- `analytics`: BMI, PSQI puani, Bristol tipi ve UPF evet sayisi gibi turetilmis ozetler.
- Normalize kolonlar: yas, cinsiyet, gorev, vardiya tipi gibi analizde sik filtrelenecek alanlar.

## Notlar

- Form gonderimi icin service role key sadece server tarafinda kullanilir.
- Browser tarafinda yalnizca `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` kullanilir.
- Tablolar uzerinde RLS aciktir; admin ve public veri erisimi Next.js API route'lari uzerinden service role ile yapilir.
