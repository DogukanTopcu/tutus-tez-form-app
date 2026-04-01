export type ResponseValue = string | string[];
export type SurveyResponses = Record<string, ResponseValue>;

export type Option = {
  value: string;
  label: string;
  hint?: string;
};

export type MatrixRow = {
  key: string;
  label: string;
};

type BaseField = {
  key: string;
  label: string;
  description?: string;
  required?: boolean;
};

export type TextField = BaseField & {
  type: "text" | "number" | "textarea" | "time";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
};

export type RadioField = BaseField & {
  type: "radio";
  options: Option[];
  columns?: 2 | 3 | 4;
};

export type CheckboxField = BaseField & {
  type: "checkbox";
  options: Option[];
  columns?: 2 | 3 | 4;
  maxSelections?: number;
};

export type MatrixField = BaseField & {
  type: "matrix";
  rows: MatrixRow[];
  columns: Option[];
};

export type SurveyField = TextField | RadioField | CheckboxField | MatrixField;

export type SurveySection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  type: "basic" | "ffq" | "upf";
  fields?: SurveyField[];
};

export type FoodFrequencyItem = {
  id: string;
  label: string;
  helper?: string;
  portionHint: string;
};

export type FoodFrequencyCategory = {
  id: string;
  title: string;
  items: FoodFrequencyItem[];
};

export type UltraProcessedItem = {
  id: string;
  group: string;
  foods: string;
  threshold: string;
};

export const DRAFT_STORAGE_KEY = "seafarer-nutrition-survey-draft-v1";

export const matrixKey = (groupKey: string, rowKey: string) =>
  `${groupKey}__${rowKey}`;

export const ffqKey = (
  itemId: string,
  part: "frequency" | "portion" | "daily",
) => `ffq__${itemId}__${part}`;

export const upfKey = (itemId: string) => `upf__${itemId}`;

export const genderOptions: Option[] = [
  { value: "male", label: "Erkek" },
  { value: "female", label: "Kadın" },
  { value: "other", label: "Diğer" },
];

export const shiftOptions: Option[] = [
  { value: "day", label: "Gündüz" },
  { value: "night", label: "Gece" },
  { value: "mixed", label: "Karışık" },
];

export const changeOptions: Option[] = [
  { value: "increase", label: "Artar" },
  { value: "same", label: "Değişmez" },
  { value: "decrease", label: "Azalır" },
];

export const frequencyOptions: Option[] = [
  { value: "never", label: "Hiç / yılda 1" },
  { value: "monthly_1_3", label: "Ayda 1-3 kez" },
  { value: "weekly_1_2", label: "Haftada 1-2 kez" },
  { value: "weekly_3_4", label: "Haftada 3-4 kez" },
  { value: "weekly_5_6", label: "Haftada 5-6 kez" },
  { value: "daily_1", label: "Günde 1 kez" },
  { value: "daily_2", label: "Günde 2 kez" },
  { value: "every_meal", label: "Her öğün +" },
];

export const stressOptions: Option[] = [
  { value: "never", label: "Hiç" },
  { value: "sometimes", label: "Bazen" },
  { value: "often", label: "Sık" },
  { value: "very_often", label: "Çok sık" },
];

export const shortFrequencyOptions: Option[] = [
  { value: "never", label: "Hiç" },
  { value: "monthly_1_3", label: "Ayda 1-3" },
  { value: "weekly_1", label: "Haftada 1" },
  { value: "weekly_2_4", label: "Haftada 2-4" },
  { value: "daily_1", label: "Günde 1" },
  { value: "daily_2_plus", label: "Günde 2+" },
];

export const sleepFrequencyOptions: Option[] = [
  { value: "0", label: "Bir aydır hiç olmadı" },
  { value: "1", label: "Haftada 1'den az" },
  { value: "2", label: "Haftada 1-2 kez" },
  { value: "3", label: "Haftada 3 veya daha fazla" },
];

export const fourPointSeverityOptions: Option[] = [
  { value: "0", label: "Çok iyi" },
  { value: "1", label: "Oldukça iyi" },
  { value: "2", label: "Oldukça kötü" },
  { value: "3", label: "Çok kötü" },
];

export const medicationOptions: Option[] = [
  { value: "0", label: "Hiç" },
  { value: "1", label: "Haftada birden az" },
  { value: "2", label: "Haftada bir veya iki kez" },
  { value: "3", label: "Haftada üç veya daha fazla" },
];

export const functioningOptions: Option[] = [
  { value: "0", label: "Hiç problem oluşturmadı" },
  { value: "1", label: "Yalnızca çok az problem oluşturdu" },
  { value: "2", label: "Bir dereceye kadar problem oluşturdu" },
  { value: "3", label: "Çok büyük bir problem oluşturdu" },
];

export const bristolOptions: Option[] = [
  {
    value: "1",
    label: "Tip 1",
    hint: "Sert ve ayrı parçalar, keçi pisliği gibi.",
  },
  {
    value: "2",
    label: "Tip 2",
    hint: "Topaklı ve sosis şeklinde ama engebeli.",
  },
  {
    value: "3",
    label: "Tip 3",
    hint: "Sosis gibi ama çatlaklı yüzeyli.",
  },
  {
    value: "4",
    label: "Tip 4",
    hint: "Sosis veya yılan gibi, düzgün ve yumuşak.",
  },
  {
    value: "5",
    label: "Tip 5",
    hint: "Yumuşak parçalar, belirgin kenarsız, kolay çıkan.",
  },
  {
    value: "6",
    label: "Tip 6",
    hint: "Peltemsi, düzensiz kenarlı, gevşek dışkı.",
  },
  {
    value: "7",
    label: "Tip 7",
    hint: "Tamamen sıvı, katı parça içermeyen.",
  },
];

export const surveySections: SurveySection[] = [
  {
    id: "participant",
    eyebrow: "Bölüm 1",
    title: "Katılımcı Bilgileri",
    description:
      "Temel demografik ve çalışma bilgileri araştırma bağlamını anlamak için kullanılır.",
    type: "basic",
    fields: [
      {
        type: "radio",
        key: "consent",
        label:
          "Bu formdaki bilgilerin araştırma amacıyla anonim olarak kullanılmasını kabul ediyorum.",
        required: true,
        options: [
          { value: "yes", label: "Evet, kabul ediyorum" },
          { value: "no", label: "Hayır" },
        ],
      },
      // {
      //   type: "text",
      //   key: "participant_code",
      //   label: "Katılımcı kodu",
      //   description:
      //     "İsterseniz kurum içi takip için bir kod girebilirsiniz. Ad-soyad istenmez.",
      //   placeholder: "Örn. GMI-024",
      // },
      {
        type: "number",
        key: "age",
        label: "Yaş",
        required: true,
        min: 18,
        max: 90,
        placeholder: "Örn. 34",
      },
      {
        type: "radio",
        key: "gender",
        label: "Cinsiyet",
        required: true,
        options: genderOptions,
      },
      {
        type: "text",
        key: "gender_other",
        label: "Diğer cinsiyet açıklaması",
        placeholder: "İsteğe bağlı",
      },
      {
        type: "text",
        key: "role",
        label: "Görev / mevki",
        required: true,
        placeholder: "Örn. Güverte zabiti",
      },
      {
        type: "text",
        key: "nationality",
        label: "Milliyet",
        required: true,
        placeholder: "Örn. Türkiye",
      },
      {
        type: "number",
        key: "sea_service_years",
        label: "Gemide toplam çalışma süresi (yıl)",
        required: true,
        min: 0,
        max: 60,
      },
      {
        type: "number",
        key: "sea_service_months",
        label: "Gemide toplam çalışma süresi (ek ay)",
        required: true,
        min: 0,
        max: 11,
      },
      {
        type: "radio",
        key: "shift_type",
        label: "Vardiya tipi",
        required: true,
        options: shiftOptions,
      },
      {
        type: "number",
        key: "days_without_shore",
        label: "Karaya çıkmadan geçirilen ortalama süre (gün)",
        required: true,
        min: 0,
        max: 365,
      },
      {
        type: "number",
        key: "height_cm",
        label: "Boy (cm)",
        required: true,
        min: 120,
        max: 230,
      },
      {
        type: "number",
        key: "weight_kg",
        label: "Vücut ağırlığı (kg)",
        required: true,
        min: 35,
        max: 250,
        step: 0.1,
      },
    ],
  },
  {
    id: "voyage",
    eyebrow: "Bölüm 2",
    title: "Sefer ve Öğün Düzeni",
    description:
      "Sefer süresince öğün düzeni, besine erişim ve günlük akışın nasıl değiştiğini değerlendirir.",
    type: "basic",
    fields: [
      {
        type: "radio",
        key: "access_fresh_produce",
        label:
          "Sefer sırasında taze sebze ve meyveye erişiminizi nasıl değerlendirirsiniz?",
        required: true,
        options: [
          { value: "very_good", label: "Çok iyi" },
          { value: "moderate", label: "Orta" },
          { value: "poor", label: "Yetersiz" },
          { value: "very_poor", label: "Çok yetersiz" },
        ],
      },
      {
        type: "matrix",
        key: "voyage_food_change",
        label: "Sefer ilerledikçe aşağıdaki besinlerin tüketimi nasıl değişir?",
        required: true,
        rows: [
          { key: "fresh_vegetables", label: "Taze sebze" },
          { key: "fresh_fruit", label: "Taze meyve" },
          { key: "canned_foods", label: "Konserve gıdalar" },
          { key: "snacks", label: "Atıştırmalıklar" },
        ],
        columns: changeOptions,
      },
      {
        type: "radio",
        key: "meals_per_day",
        label: "Sefer sırasında genellikle günde kaç ana öğün tüketirsiniz?",
        required: true,
        options: [
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "3_plus", label: "3'ten fazla" },
          { value: "irregular", label: "Düzenli değil" },
        ],
      },
      {
        type: "radio",
        key: "meal_schedule",
        label: "Sefer süresince öğün saatleriniz nasıldır?",
        required: true,
        options: [
          { value: "regular", label: "Düzenli" },
          { value: "partly_irregular", label: "Kısmen düzensiz" },
          { value: "very_irregular", label: "Çok düzensiz" },
        ],
      },
      {
        type: "checkbox",
        key: "meal_issues",
        label:
          "Sefer sırasında aşağıdaki durumlardan hangileri yaşanır? Birden fazla seçim yapabilirsiniz.",
        required: true,
        options: [
          { value: "skipping_meals", label: "Öğün atlama" },
          { value: "late_eating", label: "Geç saatlerde yeme" },
          { value: "long_fasting", label: "Uzun süre aç kalma" },
          { value: "continuous_snacking", label: "Sürekli atıştırma" },
          { value: "none", label: "Hiçbiri" },
        ],
        columns: 2,
      },
    ],
  },
  {
    id: "food-access",
    eyebrow: "Bölüm 3",
    title: "Besin Seçimi ve Erişim",
    description:
      "Sık tüketilen gıdalar, paketli ürün kullanımı ve sıvı alışkanlıkları bu bölümde toplanır.",
    type: "basic",
    fields: [
      {
        type: "checkbox",
        key: "frequent_food_types",
        label:
          "Sefer sırasında en sık tükettiğiniz gıda türleri hangileridir? En fazla 3 seçim yapın.",
        required: true,
        maxSelections: 3,
        columns: 2,
        options: [
          { value: "canned_meals", label: "Konserve yemekler" },
          { value: "dry_foods", label: "Kuru gıdalar" },
          { value: "meat_based", label: "Et ağırlıklı yemekler" },
          { value: "pastries", label: "Hamur işleri" },
          { value: "packaged_snacks", label: "Paketli atıştırmalıklar" },
          { value: "freshly_cooked", label: "Taze pişmiş yemekler" },
        ],
      },
      {
        type: "checkbox",
        key: "snack_reasons",
        label:
          "Paketli / atıştırmalık gıdaları tüketme nedenleriniz nelerdir? Uygun olanların tümünü seçin.",
        required: true,
        columns: 2,
        options: [
          { value: "easy_access", label: "Kolay ulaşılabilir" },
          { value: "filling", label: "Tok tutuyor" },
          { value: "stress_relief", label: "Stres azaltıyor" },
          { value: "time_saving", label: "Zaman kazandırıyor" },
          { value: "habit", label: "Alışkanlık" },
          { value: "other", label: "Diğer" },
        ],
      },
      {
        type: "text",
        key: "snack_reasons_other",
        label: "Diğer neden açıklaması",
        placeholder: "İsteğe bağlı",
      },
      {
        type: "radio",
        key: "daily_fluid_intake",
        label: "Sefer sırasında günlük sıvı tüketiminizi nasıl değerlendirirsiniz?",
        required: true,
        options: [
          { value: "sufficient", label: "Yeterli" },
          { value: "partly", label: "Kısmen" },
          { value: "insufficient", label: "Yetersiz" },
        ],
      },
      {
        type: "checkbox",
        key: "preferred_drinks",
        label: "Aşağıdakilerden hangilerini daha sık tüketirsiniz?",
        required: true,
        options: [
          { value: "water", label: "Su" },
          { value: "tea", label: "Çay" },
          { value: "coffee", label: "Kahve" },
          { value: "energy_drink", label: "Enerji içeceği" },
        ],
      },
    ],
  },
  {
    id: "stress",
    eyebrow: "Bölüm 4",
    title: "Stres, Yorgunluk ve Beslenme",
    description:
      "Çalışma yükü, stres ve liman/ev/deniz farklarının yeme davranışı üzerindeki etkileri değerlendirilir.",
    type: "basic",
    fields: [
      {
        type: "matrix",
        key: "stress_eating",
        label: "Aşağıdaki durumlarda yeme miktarınız artar mı?",
        required: true,
        rows: [
          { key: "stress", label: "Stresli olduğumda" },
          { key: "fatigue", label: "Yorgun olduğumda" },
          { key: "sleepless", label: "Uykusuz kaldığımda" },
          { key: "lonely", label: "Yalnız hissettiğimde" },
        ],
        columns: stressOptions,
      },
      {
        type: "radio",
        key: "main_eating_factor",
        label:
          "Sefer sırasında yeme davranışınızı en çok etkileyen faktör hangisidir?",
        required: true,
        options: [
          { value: "workload", label: "İş yoğunluğu" },
          { value: "stress", label: "Stres" },
          { value: "fatigue", label: "Yorgunluk" },
          { value: "low_variety", label: "Besin çeşitliliğinin azlığı" },
          { value: "irregular_meals", label: "Öğün saatlerinin düzensizliği" },
        ],
      },
      {
        type: "checkbox",
        key: "healthy_eating_difficulties",
        label:
          "Sefer sırasında sağlıklı beslenme konusunda en çok zorlandığınız konular hangileridir? En fazla 3 seçim yapın.",
        required: true,
        maxSelections: 3,
        columns: 2,
        options: [
          { value: "produce_access", label: "Taze sebze-meyveye erişim" },
          { value: "fatty_salty_food", label: "Yemeklerin yağlı / tuzlu olması" },
          { value: "irregular_meals", label: "Öğün saatlerinin düzensizliği" },
          { value: "long_work_hours", label: "Uzun çalışma saatleri" },
          { value: "stress_fatigue", label: "Stres ve yorgunluk" },
          { value: "low_variety", label: "Besin çeşitliliğinin azlığı" },
          {
            value: "limited_personal_choice",
            label: "Kendi tercihlerime uygun yemek bulamama",
          },
        ],
      },
      {
        type: "radio",
        key: "sea_land_comparison",
        label: "Hangisi sizin için daha geçerlidir?",
        required: true,
        options: [
          { value: "healthier_at_sea", label: "Denizde daha sağlıklı besleniyorum" },
          {
            value: "healthier_on_land",
            label: "Karadayken daha sağlıklı besleniyorum",
          },
          { value: "no_difference", label: "Belirgin fark yok" },
        ],
      },
      {
        type: "radio",
        key: "port_habit_change",
        label: "Limanlara yanaşıldığında beslenme alışkanlığınız değişir mi?",
        required: true,
        options: [
          { value: "yes", label: "Evet" },
          { value: "no", label: "Hayır" },
        ],
      },
      {
        type: "textarea",
        key: "port_habit_change_note",
        label: "Değişiyorsa nasıl değişiyor?",
        placeholder: "Örn. dışarıdan yemek tüketimi artıyor",
      },
    ],
  },
  {
    id: "preferences",
    eyebrow: "Bölüm 5",
    title: "Beslenme Tercihleri ve Uygulamaları",
    description:
      "Pişirme yöntemleri, yağ tercihleri, atıştırmalıklar ve vardiya kaynaklı alışkanlıklar bu bölümde yer alır.",
    type: "basic",
    fields: [
      {
        type: "checkbox",
        key: "cooking_methods",
        label: "Gemide en sık kullanılan pişirme yöntemleri. En fazla 3 seçim yapın.",
        required: true,
        maxSelections: 3,
        columns: 3,
        options: [
          { value: "boiling", label: "Haşlama" },
          { value: "saute", label: "Sote" },
          { value: "frying", label: "Kızartma" },
          { value: "steaming", label: "Buharda" },
          { value: "oven", label: "Fırın" },
          { value: "grill", label: "Izgara" },
          { value: "other", label: "Diğer" },
        ],
      },
      {
        type: "text",
        key: "cooking_methods_other",
        label: "Diğer pişirme yöntemi",
        placeholder: "İsteğe bağlı",
      },
      {
        type: "radio",
        key: "oil_type",
        label: "Gemide yemeklerde en sık kullanılan yağ türü",
        required: true,
        options: [
          { value: "olive_oil", label: "Zeytinyağı" },
          { value: "margarine", label: "Margarin" },
          { value: "sunflower_canola", label: "Ayçiçeği / kanola" },
          { value: "butter", label: "Tereyağı" },
          { value: "other", label: "Diğer" },
        ],
      },
      {
        type: "text",
        key: "oil_type_other",
        label: "Diğer yağ türü",
        placeholder: "İsteğe bağlı",
      },
      {
        type: "radio",
        key: "bread_preference",
        label: "Ekmek tercihi",
        required: true,
        options: [
          { value: "wholegrain", label: "Tam tahıllı / çavdar" },
          { value: "gluten_free", label: "Glütensiz" },
          { value: "white", label: "Beyaz" },
          { value: "mixed", label: "Karışık" },
          { value: "no_preference", label: "Fark etmez" },
        ],
      },
      {
        type: "radio",
        key: "milk_preference",
        label: "Süt tercihi",
        required: true,
        options: [
          { value: "whole", label: "Tam yağlı" },
          { value: "semi_skimmed", label: "Yarı yağlı" },
          { value: "skimmed", label: "Yağsız" },
          { value: "plant_based", label: "Bitkisel" },
          { value: "none", label: "Tüketmiyorum" },
        ],
      },
      {
        type: "radio",
        key: "salt_habit",
        label: "Tuz ekleme alışkanlığı",
        required: true,
        options: [
          {
            value: "low_salt_while_cooking",
            label: "Yemek pişerken tuz az kullanılır",
          },
          {
            value: "no_extra_after_cooking",
            label: "Piştikten sonra ilave tuz kullanmam",
          },
          {
            value: "sometimes_extra_after_cooking",
            label: "Piştikten sonra ilave tuz ara sıra",
          },
          {
            value: "often_extra_after_cooking",
            label: "Piştikten sonra ilave tuz sıklıkla",
          },
        ],
      },
      {
        type: "radio",
        key: "hot_drink_sugar",
        label: "Sıcak içeceklerde şeker kullanımı",
        required: true,
        options: [
          { value: "sugar_free", label: "Şekersiz" },
          { value: "sweetener", label: "Tatlandırıcı" },
          { value: "up_to_2", label: "Günde ≤ 2 küp / poşet" },
          { value: "more_than_2", label: "Günde > 2 küp / poşet" },
        ],
      },
      {
        type: "checkbox",
        key: "preferred_snacks",
        label: "En sık tercih edilen atıştırmalıklar. En fazla 3 seçim yapın.",
        required: true,
        maxSelections: 3,
        columns: 2,
        options: [
          { value: "fruit", label: "Meyve" },
          { value: "yogurt", label: "Yoğurt" },
          { value: "nuts_unsalted", label: "Kuruyemiş (tuzsuz)" },
          { value: "nuts_salted", label: "Kuruyemiş (tuzlu)" },
          { value: "biscuit_chocolate", label: "Bisküvi / çikolata" },
          { value: "chips_crackers", label: "Cips / kraker" },
          { value: "other", label: "Diğer" },
        ],
      },
      {
        type: "text",
        key: "preferred_snacks_other",
        label: "Diğer atıştırmalık",
        placeholder: "İsteğe bağlı",
      },
      {
        type: "radio",
        key: "night_eating_frequency",
        label: "Vardiya nedeniyle gece yeme / alma durumu",
        required: true,
        options: shortFrequencyOptions,
      },
      {
        type: "radio",
        key: "ready_meal_land_frequency",
        label: "Liman / karadayken dışarıdan hazır yemek tüketimi",
        required: true,
        options: shortFrequencyOptions,
      },
      {
        type: "radio",
        key: "healthy_options_perception",
        label: "Gemide sağlıklı seçenek bulma algısı",
        required: true,
        options: [
          { value: "not_suitable", label: "Hiç uygun değil" },
          { value: "partial", label: "Kısmen" },
          { value: "average", label: "Orta" },
          { value: "suitable", label: "Uygun" },
          { value: "very_suitable", label: "Çok uygun" },
        ],
      },
    ],
  },
  {
    id: "ffq",
    eyebrow: "Bölüm 6",
    title: "Besin Tüketim Sıklığı Anketi",
    description:
      "Son dönemdeki tüketim sıklığınızı ve bir seferdeki yaklaşık miktarı her besin için işaretleyin.",
    type: "ffq",
  },
  {
    id: "bristol",
    eyebrow: "Bölüm 7",
    title: "Bağırsak Sağlığı Göstergeleri",
    description:
      "Son 1 hafta içindeki en sık görülen dışkı tipini Bristol Dışkı Ölçeği'ne göre seçin.",
    type: "basic",
    fields: [
      {
        type: "radio",
        key: "bristol_stool_type",
        label: "En sık görülen dışkı tipi",
        required: true,
        options: bristolOptions,
      },
    ],
  },
  {
    id: "upf",
    eyebrow: "Bölüm 8",
    title: "Çok İşlenmiş Besin Taraması",
    description:
      "Son 1 yılı düşünerek, belirtilen besin grubunu verilen eşik kadar veya daha sık tüketiyorsanız 'Evet' işaretleyin.",
    type: "upf",
  },
  {
    id: "sleep",
    eyebrow: "Bölüm 9",
    title: "Pittsburgh Uyku Kalitesi İndeksi",
    description:
      "Son 1 ay içindeki uyku alışkanlıklarınızı dikkate alarak aşağıdaki soruları yanıtlayın.",
    type: "basic",
    fields: [
      {
        type: "time",
        key: "sleep_bedtime",
        label: "Geçen ay geceleri genellikle ne zaman yattınız?",
        required: true,
      },
      {
        type: "number",
        key: "sleep_latency_minutes",
        label: "Uykuya dalmanız genellikle kaç dakika sürdü?",
        required: true,
        min: 0,
        max: 300,
      },
      {
        type: "time",
        key: "sleep_wake_time",
        label: "Geçen ay sabahları genellikle ne zaman kalktınız?",
        required: true,
      },
      {
        type: "number",
        key: "sleep_hours",
        label: "Geçen ay geceleri kaç saat gerçekten uyudunuz?",
        required: true,
        min: 0,
        max: 24,
        step: 0.5,
      },
      {
        type: "matrix",
        key: "sleep_problems",
        label: "Son bir aydır ne sıklıkla uyku sorunu yaşadınız?",
        required: true,
        rows: [
          { key: "sleep_latency", label: "30 dk içinde uykuya dalamadınız" },
          { key: "waking_early", label: "Gece yarısı ya da sabah erken uyandınız" },
          { key: "bathroom", label: "Tuvalet / banyoya gitmek için uyandınız" },
          { key: "breathing", label: "Rahat nefes alıp veremediniz" },
          { key: "snoring", label: "Öksürdünüz veya gürültülü şekilde horladınız" },
          { key: "cold", label: "Aşırı derecede üşüdünüz" },
          { key: "hot", label: "Aşırı derecede sıcaklık hissettiniz" },
          { key: "dreams", label: "Kötü rüyalar gördünüz" },
          { key: "pain", label: "Ağrı duydunuz" },
          { key: "other", label: "Diğer nedenler" },
        ],
        columns: sleepFrequencyOptions,
      },
      {
        type: "textarea",
        key: "sleep_other_reason",
        label: "Diğer uyku sorunu nedeni",
        placeholder: "İsteğe bağlı",
      },
      {
        type: "radio",
        key: "sleep_quality",
        label: "Uyku kalitenizi genel olarak nasıl değerlendirirsiniz?",
        required: true,
        options: fourPointSeverityOptions,
      },
      {
        type: "radio",
        key: "sleep_medication_use",
        label:
          "Uyumanıza yardımcı olması için ne kadar sıklıkla uyku ilacı aldınız?",
        required: true,
        options: medicationOptions,
      },
      {
        type: "radio",
        key: "daytime_sleepiness",
        label:
          "Araba kullanırken, yemek yerken veya sosyal aktivite sırasında uyanık kalmak için ne kadar sıklıkla zorlandınız?",
        required: true,
        options: medicationOptions,
      },
      {
        type: "radio",
        key: "daytime_functioning",
        label:
          "Bu durum işlerinizi yaparken veya gerekenleri yerine getirirken ne derece problem oluşturdu?",
        required: true,
        options: functioningOptions,
      },
    ],
  },
];

export const foodFrequencyCategories: FoodFrequencyCategory[] = [
  {
    id: "dairy",
    title: "Süt ve süt ürünleri",
    items: [
      {
        id: "milk",
        label: "Süt",
        helper: "Tam / yarım / az yağlı",
        portionHint: "Su bardağı (200 ml)",
      },
      {
        id: "yogurt_ayran_kefir",
        label: "Yoğurt / ayran / kefir",
        helper: "Tam / yarım / az yağlı",
        portionHint: "Orta boy kase veya su bardağı (150-200 ml)",
      },
      {
        id: "cheese",
        label: "Peynir",
        helper: "Beyaz / kaşar / tulum / lor vb.",
        portionHint: "Dilim (30 g) veya yemek kaşığı",
      },
    ],
  },
  {
    id: "protein",
    title: "Et ve yumurta",
    items: [
      { id: "egg", label: "Yumurta", portionHint: "Adet (50 g)" },
      { id: "red_meat", label: "Kırmızı et", portionHint: "Köfte büyüklüğü (30 g)" },
      {
        id: "poultry",
        label: "Kümes hayvanları eti",
        helper: "Tavuk, hindi, ördek vb.",
        portionHint: "Köfte büyüklüğü (30 g)",
      },
      {
        id: "fish",
        label: "Balık",
        helper: "Hamsi, palamut, uskumru vb.",
        portionHint: "Adet veya porsiyon",
      },
      {
        id: "processed_meat",
        label: "İşlenmiş et / sakatat",
        helper: "Salam, sosis, sucuk vb.",
        portionHint: "Köfte büyüklüğü (30 g) veya adet",
      },
    ],
  },
  {
    id: "legumes",
    title: "Kurubaklagiller",
    items: [
      {
        id: "legumes",
        label: "Mercimek / nohut / barbunya / kuru fasulye vb.",
        portionHint: "Yemek kaşığı veya orta boy kase",
      },
    ],
  },
  {
    id: "grains",
    title: "Tahıllar",
    items: [
      { id: "rice_bulgur", label: "Pirinç / bulgur", portionHint: "Yemek kaşığı" },
      { id: "pasta", label: "Makarna / erişte", portionHint: "Yemek kaşığı" },
      {
        id: "oats_barley",
        label: "Buğday / yulaf / arpa / diğer",
        portionHint: "Yemek kaşığı",
      },
      {
        id: "white_bread",
        label: "Beyaz ekmek / yufka / lavaş / pide",
        portionHint: "Dilim, rol veya adet",
      },
      {
        id: "wholegrain_bread",
        label: "Tahıllı ekmek türleri",
        helper: "Çavdar, kepek, tam tahıl vb.",
        portionHint: "Dilim (25 g)",
      },
    ],
  },
  {
    id: "vegetables",
    title: "Sebzeler",
    items: [
      {
        id: "raw_leafy_vegetables",
        label: "Çiğ tüketilen yeşil yapraklı sebzeler",
        helper: "Nane, maydanoz, marul vb.",
        portionHint: "Dal veya yaprak adedi",
      },
      {
        id: "cooked_leafy_vegetables",
        label: "Pişmiş tüketilen yeşil yapraklı sebzeler",
        helper: "Ispanak, madımak vb.",
        portionHint: "Yemek kaşığı",
      },
      {
        id: "other_vegetables",
        label: "Diğer sebzeler",
        helper: "Pırasa, patates, kereviz, havuç vb.",
        portionHint: "Yemek kaşığı veya orta boy / adet",
      },
      {
        id: "preserved_vegetables",
        label: "Kuru / konserve / dondurulmuş sebzeler",
        portionHint: "Adet veya yemek kaşığı",
      },
    ],
  },
  {
    id: "fruit",
    title: "Meyveler",
    items: [
      {
        id: "citrus",
        label: "Turunçgiller",
        helper: "Portakal, mandalina, greyfurt",
        portionHint: "Adet (küçük / orta boy)",
      },
      {
        id: "other_fruit",
        label: "Diğer meyveler",
        helper: "Muz, armut, elma, kavun vb.",
        portionHint: "Adet veya dilim",
      },
      {
        id: "dried_fruit",
        label: "Kuru meyveler",
        portionHint: "Adet veya avuç",
      },
      {
        id: "fresh_fruit_juice",
        label: "Taze meyve suyu",
        portionHint: "Su bardağı (200 ml)",
      },
    ],
  },
  {
    id: "fatty_seeds",
    title: "Yağlı tohumlar",
    items: [
      { id: "olive", label: "Zeytin", portionHint: "Adet" },
      {
        id: "nuts",
        label: "Diğer yağlı tohumlar",
        helper: "Ceviz, fındık, fıstık, badem vb.",
        portionHint: "Adet veya avuç",
      },
      {
        id: "seeds",
        label: "Tohumlar",
        helper: "Keten tohumu, chia vb.",
        portionHint: "Tatlı kaşığı (5 g)",
      },
    ],
  },
  {
    id: "oils",
    title: "Yağ",
    items: [
      { id: "olive_oil", label: "Zeytinyağı", portionHint: "Yemek kaşığı" },
      {
        id: "sunflower_corn_oil",
        label: "Ayçiçek / mısırözü yağı",
        portionHint: "Yemek kaşığı",
      },
      {
        id: "other_liquid_oils",
        label: "Diğer sıvı yağlar",
        helper: "Fındık, kanola, pamuk vb.",
        portionHint: "Yemek kaşığı",
      },
      {
        id: "butter_margarine",
        label: "Tereyağı / sade yağ / margarin",
        portionHint: "Yemek kaşığı",
      },
    ],
  },
  {
    id: "beverages",
    title: "İçecekler",
    items: [
      { id: "water", label: "Su", portionHint: "Su bardağı (200 ml)" },
      {
        id: "carbonated_drinks",
        label: "Gazlı içecekler",
        portionHint: "Su bardağı veya kutu",
      },
      {
        id: "packaged_juice",
        label: "Hazır meyve suları",
        portionHint: "Su bardağı veya kutu",
      },
      {
        id: "energy_drinks",
        label: "Enerji içecekleri",
        portionHint: "Su bardağı veya kutu",
      },
      {
        id: "alcohol",
        label: "Alkol",
        helper: "Bira, şarap, rakı, viski vb.",
        portionHint: "Su bardağı veya kutu",
      },
    ],
  },
  {
    id: "sweets",
    title: "Şeker, tatlı ve diğerleri",
    items: [
      {
        id: "sugar",
        label: "Şeker",
        portionHint: "Adet küp şeker veya tatlı kaşığı",
      },
      {
        id: "salt",
        label: "Tuz",
        helper: "Yiyeceklere eklenen ekstra miktar",
        portionHint: "Çay kaşığı (2,5 g)",
      },
      {
        id: "breakfast_sweets",
        label: "Kahvaltılık tatlılar",
        helper: "Bal, pekmez, reçel, krem çikolata vb.",
        portionHint: "Tatlı kaşığı (5 g)",
      },
      { id: "tahini", label: "Tahin", portionHint: "Tatlı kaşığı (5 g)" },
      { id: "milk_desserts", label: "Sütlü tatlılar", portionHint: "Porsiyon" },
      {
        id: "syrup_desserts",
        label: "Şerbetli tatlılar",
        helper: "Baklava vb.",
        portionHint: "Adet",
      },
      {
        id: "dough_desserts",
        label: "Hamur tatlıları",
        helper: "Kek, pankek, kurabiye, bisküvi vb.",
        portionHint: "Adet veya dilim",
      },
      {
        id: "candy_chocolate",
        label: "Şekerleme / çikolata / lokum",
        portionHint: "Adet",
      },
      { id: "chips", label: "Cips", portionHint: "Paket veya kase" },
      {
        id: "sauces",
        label: "Soslar",
        helper: "Mayonez, ketçap, barbekü vb.",
        portionHint: "Tatlı kaşığı (5 g)",
      },
      {
        id: "ready_foods",
        label: "Hazır besinler",
        helper: "Hazır çorba, bulyon, sos vb.",
        portionHint: "Yaklaşık miktar",
      },
      {
        id: "fast_food",
        label: "Fast food ürünler",
        helper: "Hamburger, pizza vb.",
        portionHint: "Yaklaşık miktar",
      },
    ],
  },
];

export const ultraProcessedItems: UltraProcessedItem[] = [
  {
    id: "full_fat_dairy",
    group: "Tam yağlı süt ürünleri",
    foods: "Krema, isli/füme peynir, eski kaşar, sürülebilir peynir",
    threshold: "Haftada 2 kez veya daha fazla",
  },
  {
    id: "processed_meats",
    group: "İşlenmiş etler",
    foods: "Jambon, salam, sucuk, sosis, pastırma, işlenmiş etli sandviçler",
    threshold: "Günde 1 kez veya daha fazla",
  },
  {
    id: "fats",
    group: "Yağlar",
    foods: "Margarin, tereyağı, iç yağ, kuyruk yağı",
    threshold: "Ayda 3 kezden fazla",
  },
  {
    id: "sweetened_drinks",
    group: "Şekerli ve yapay tatlandırıcılı içecekler",
    foods: "Meşrubatlar, yapay tatlandırıcılı içecekler, hazır meyve-sebze suları",
    threshold: "Haftada 2 kez veya daha fazla",
  },
  {
    id: "desserts",
    group: "Tatlılar",
    foods:
      "Dondurma, bisküvi, çikolata, paketli kek, reçel, bal, pekmez, şerbetli tatlılar ve benzerleri",
    threshold: "Günde 1 kereden fazla",
  },
  {
    id: "snacks",
    group: "Atıştırmalıklar",
    foods: "Paketli patates cipsi ve benzeri paketli atıştırmalıklar",
    threshold: "Ayda 3 kezden fazla",
  },
  {
    id: "ready_products",
    group: "Tüketime hazır ürünler",
    foods: "Pizza, kroket, çabuk çorba, hazır bardak çorba",
    threshold: "Ayda 3 kezden fazla",
  },
  {
    id: "refined_grains",
    group: "İşlenmiş tahıllar",
    foods: "Beyaz ekmek, dilimlenmiş paketli ekmek, kahvaltılık gevrek, noodle, beyaz pirinç",
    threshold: "Haftada 2 kez veya daha fazla",
  },
  {
    id: "sauces",
    group: "Soslar",
    foods: "Hardal, mayonez, domates sosu, ketçap",
    threshold: "Haftada 1 kereden fazla",
  },
  {
    id: "additives",
    group: "İsteğe bağlı eklenenler",
    foods: "Şeker ve sofra tuzu",
    threshold: "Günde 3 kezden fazla",
  },
  {
    id: "fried_foods",
    group: "Kızartılmış besinler",
    foods: "Evde yapılmış veya dışarıda tüketilen kızartılmış yiyecekler",
    threshold: "Haftada 2 kez veya daha fazla",
  },
];

const responseKey = (value: ResponseValue | undefined) =>
  Array.isArray(value) ? value.length > 0 : Boolean(value?.toString().trim());

export const isValuePresent = (value: ResponseValue | undefined) => responseKey(value);

export const getTextValue = (responses: SurveyResponses, key: string) => {
  const value = responses[key];
  return Array.isArray(value) ? value.join(", ") : value?.trim() ?? "";
};

export const getArrayValue = (responses: SurveyResponses, key: string) => {
  const value = responses[key];
  return Array.isArray(value) ? value : [];
};

export const getNumberValue = (responses: SurveyResponses, key: string) => {
  const raw = getTextValue(responses, key);
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

export const calculateBodyMassIndex = (
  heightCm: number | null,
  weightKg: number | null,
) => {
  if (!heightCm || !weightKg) {
    return null;
  }

  const heightInMeters = heightCm / 100;
  const bmi = weightKg / (heightInMeters * heightInMeters);
  return Number.isFinite(bmi) ? Number(bmi.toFixed(1)) : null;
};

const parseTimeToMinutes = (value: string) => {
  if (!value || !value.includes(":")) {
    return null;
  }

  const [hoursText, minutesText] = value.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const calculateSleepDurationComponent = (hours: number | null) => {
  if (hours === null) return null;
  if (hours > 7) return 0;
  if (hours >= 6) return 1;
  if (hours >= 5) return 2;
  return 3;
};

const calculateSleepLatencyComponent = (minutes: number | null, disturbance: number | null) => {
  if (minutes === null || disturbance === null) return null;

  let latencyScore = 0;
  if (minutes > 60) latencyScore = 3;
  else if (minutes >= 31) latencyScore = 2;
  else if (minutes >= 16) latencyScore = 1;

  const total = latencyScore + disturbance;

  if (total === 0) return 0;
  if (total <= 2) return 1;
  if (total <= 4) return 2;
  return 3;
};

const calculateSleepEfficiencyComponent = (
  bedtime: string,
  wakeTime: string,
  sleepHours: number | null,
) => {
  if (sleepHours === null) return null;

  const bedtimeMinutes = parseTimeToMinutes(bedtime);
  const wakeMinutes = parseTimeToMinutes(wakeTime);

  if (bedtimeMinutes === null || wakeMinutes === null) {
    return null;
  }

  let minutesInBed = wakeMinutes - bedtimeMinutes;
  if (minutesInBed <= 0) {
    minutesInBed += 24 * 60;
  }

  if (minutesInBed <= 0) {
    return null;
  }

  const efficiency = (sleepHours * 60) / minutesInBed;
  const percentage = efficiency * 100;

  if (percentage > 85) return 0;
  if (percentage >= 75) return 1;
  if (percentage >= 65) return 2;
  return 3;
};

const calculateSleepDisturbanceComponent = (values: Array<number | null>) => {
  if (values.some((value) => value === null)) {
    return null;
  }

  const total = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  if (total === 0) return 0;
  if (total <= 9) return 1;
  if (total <= 18) return 2;
  return 3;
};

const calculateDaytimeDysfunctionComponent = (
  sleepiness: number | null,
  functioning: number | null,
) => {
  if (sleepiness === null || functioning === null) return null;
  const total = sleepiness + functioning;

  if (total === 0) return 0;
  if (total <= 2) return 1;
  if (total <= 4) return 2;
  return 3;
};

export const calculatePsqiScore = (responses: SurveyResponses) => {
  const subjectiveQuality = getNumberValue(responses, "sleep_quality");
  const sleepLatencyMinutes = getNumberValue(responses, "sleep_latency_minutes");
  const latencyDisturbance = getNumberValue(
    responses,
    matrixKey("sleep_problems", "sleep_latency"),
  );
  const sleepHours = getNumberValue(responses, "sleep_hours");
  const bedtime = getTextValue(responses, "sleep_bedtime");
  const wakeTime = getTextValue(responses, "sleep_wake_time");
  const medicationUse = getNumberValue(responses, "sleep_medication_use");
  const daytimeSleepiness = getNumberValue(responses, "daytime_sleepiness");
  const daytimeFunctioning = getNumberValue(responses, "daytime_functioning");
  const disturbanceRows = [
    "waking_early",
    "bathroom",
    "breathing",
    "snoring",
    "cold",
    "hot",
    "dreams",
    "pain",
    "other",
  ];
  const disturbanceValues = disturbanceRows.map((row) =>
    getNumberValue(responses, matrixKey("sleep_problems", row)),
  );

  const componentScores = [
    subjectiveQuality,
    calculateSleepLatencyComponent(sleepLatencyMinutes, latencyDisturbance),
    calculateSleepDurationComponent(sleepHours),
    calculateSleepEfficiencyComponent(bedtime, wakeTime, sleepHours),
    calculateSleepDisturbanceComponent(disturbanceValues),
    medicationUse,
    calculateDaytimeDysfunctionComponent(daytimeSleepiness, daytimeFunctioning),
  ];

  if (componentScores.some((value) => value === null)) {
    return null;
  }

  return componentScores.reduce<number>((sum, value) => sum + (value ?? 0), 0);
};

export const calculateUltraProcessedCount = (responses: SurveyResponses) =>
  ultraProcessedItems.reduce((count, item) => {
    return count + (getTextValue(responses, upfKey(item.id)) === "yes" ? 1 : 0);
  }, 0);
