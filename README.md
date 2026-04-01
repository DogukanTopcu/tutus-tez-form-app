# Gemicilerde Beslenme Durumu Formu

Next.js 16 + Supabase tabanli, halka acik bir tez anket uygulamasi.

## Neler var?

- Tez dokumanindaki sorulari web formuna donusturen 9 bolumlu akis
- Mobil uyumlu, sicak renk paletli arayuz
- Supabase'e server-side insert yapan guvenli `/api/submissions` rotasi
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
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Supabase SQL Editor'da [schema.sql](/Users/dogukantopcu/Desktop/jobs/other/burak-tutus-tez-form/supabase/schema.sql) dosyasindaki sorguyu calistirin.

5. Gelistirme sunucusunu baslatin:

```bash
npm run dev
```

6. Tarayicida `http://localhost:3000` adresini acin.

## Veri modeli

- `responses`: Tum form alanlari JSONB olarak saklanir.
- `profile`: Demografik ozet alanlari ayri JSONB olarak yazilir.
- `analytics`: BMI, PSQI puani, Bristol tipi ve UPF evet sayisi gibi turetilmis ozetler.
- Normalize kolonlar: yas, cinsiyet, gorev, vardiya tipi gibi analizde sik filtrelenecek alanlar.

## Notlar

- Form gonderimi icin service role key sadece server tarafinda kullanilir.
- Tablo uzerinde RLS aciktir; insert islemleri API route uzerinden service role ile yapilir.
- Isterseniz daha sonra yonetici paneli, cok dilli destek veya raporlama ekranlari eklenebilir.
