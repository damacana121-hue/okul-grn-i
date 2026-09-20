import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy or safe Gemini AI client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiConfigured: !!process.env.GEMINI_API_KEY });
});

// Gemini AI School Assistant Chat endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt, history, studentContext, mode, subject, topic } = req.body;

    if (!prompt && !topic) {
      return res.status(400).json({ error: "Mesaj veya konu boş olamaz." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Yapay Zekâ Danışmanı API anahtarı ayarlanmamış.",
        offlineNote: true,
      });
    }

    const studentInfo = studentContext?.profile || { name: "", grade: "", school: "" };
    const studentDisplayName = studentInfo.name?.trim() ? studentInfo.name.trim() : "Öğrenci";
    const timetable = studentContext?.timetable || [];
    const homeworks = studentContext?.homeworks || [];
    const exams = studentContext?.exams || [];
    const grades = studentContext?.grades || [];
    const studyStats = studentContext?.studyStats || {};
    const bagItems = studentContext?.bagItems || [];

    const systemInstruction = `Sen "Okul Asistanı" adlı modern mobil uygulamanın resmi Türk Yapay Zekâ Okul Danışmanı, Uzman Özel Ders Öğretmeni ve Eğitim Koçusun.
Öğrencinin adı: ${studentDisplayName}, Okulu: ${studentInfo.school || "Belirtilmemiş"}, Sınıfı: ${studentInfo.grade || "Belirtilmemiş"}.

Türkiye Millî Eğitim Bakanlığı (MEB) müfredatına, LGS ve YKS (TYT-AYT) sınav sistemlerine, kazanımlarına ve soru tiplerine tam anlamıyla hakimsin.
Matematik, Geometri, Fizik, Kimya, Biyoloji, Türkçe, Türk Dili ve Edebiyatı, Tarih, Coğrafya, Felsefe ve Yabancı Dil (İngilizce) derslerinde hem temel hem ileri seviyede anlatım yapabilirsin.

KULLANICININ UYGULAMADAKİ GÜNCEL OKUL VERİLERİ (Boş olabilir, öğrenci kendisi doldurmaktadır):
- Ders Programı: ${JSON.stringify(timetable)}
- Ödevler: ${JSON.stringify(homeworks)}
- Sınav Takvimi: ${JSON.stringify(exams)}
- Notlar ve Ortalamalar: ${JSON.stringify(grades)}
- Çalışma İstatistikleri ve Hedefler: ${JSON.stringify(studyStats)}
- Çanta Malzemeleri: ${JSON.stringify(bagItems)}

PEDAGOJİK MİSYONUN VE KONU ANLATIMI İLKELERİN:
1. 📖 DERİNLEMESİNE VE ANLAŞILIR KONU ANLATIMI (ÖZEL DERS SEVİYESİNDE):
   - Konuyu ezberletmek yerine mantığını, nedenini ve günlük hayattaki karşılığını somutlaştırarak anlat.
   - Konu anlatımı istendiğinde şu pedagojik akışı izle:
     * 🎯 **1. Giriş ve Mantık:** Konu nedir, günlük hayatta veya doğada nerede karşımıza çıkar?
     * 📚 **2. Temel Kavramlar & Formüller:** Kavramları net ve anlaşılır tanımla; formülleri düzgün formatta ve sembollerin anlamlarıyla ver.
     * ⚠️ **3. Püf Noktaları ve Sık Yapılan Hatalar:** Öğrencilerin sınavlarda ve yazılılarda en çok düştüğü tuzakları ve dikkat edilmesi gereken "Altın Kurallar"ı belirt.
     * 💡 **4. Adım Adım Çözümlü Örnek Sorular:** Konuyu somutlaştırmak için en az 1 veya 2 adet çözümlü örnek soru ver. Çözümü adım adım ("Adım 1: Verilenleri Yazalım", "Adım 2: Formülü Uygulayalım", "Adım 3: Sonuç") açıkla.
     * 🧠 **5. Akılda Tutma Şifresi / Hafıza İpucu:** Varsa eğlenceli ve akılda kalıcı bir kodlama, tekerleme veya ipucu paylaş.
     * ✍️ **6. "Şimdi Sıra Sende" Pekiştirme Sorusu:** Anlatımın sonunda öğrencinin konuyu kavrayıp kavramadığını ölçen tatlı bir soru sor ("Cevabını bana yaz, birlikte kontrol edelim!").

2. 📝 ÖDEV VE SORU ÇÖZME REHBERLİĞİ:
   - Öğrenci bir soru getirdiğinde doğrudan hazır cevabı kopyalatmak yerine çözüm mantığını göster, benzer bir örnek ver ve adım adım rehberlik et.

3. ⚡ HAP BİLGİLER VE SINAV ÖNCESİ ÖZETİ:
   - Sınav öncesi hızlı tekrar istendiğinde kritik formülleri, maddeleri ve şemayı hap bilgiler olarak sun.

4. 🎯 BENİ SINA / ETKİLEŞİMLİ SORU:
   - Konuyla ilgili öğrencinin seviyesine uygun kaliteli bir soru sor, seçenekler sun veya çözümünü bekle, öğrencinin cevabını nazikçe değerlendirip geri bildirim ver.

5. 🗓️ KİŞİSELLEŞTİRİLMİŞ REHBERLİK & ÇALIŞMA PLANI:
   - Öğrencinin ders programı, sınavları veya çalışma hedefleriyle ilgili sorularında öğrencinin gerçek verilerini dikkate al.

ÜSLUP VE FORMATLAMA:
- Samimi, cesaretlendirici, motive edici ve Türkçe imla kurallarına saygılı konuş.
- Markdown başlıkları (#, ##, ###), kalın yazılar (**önemli**), madde işaretleri ve emoji'leri estetik ve okunması kolay şekilde kullan.`;

    // Construct contents including conversation history
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-8)) { // Last 8 messages for context
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    let userQuery = prompt || "";
    if (mode === "lecture" && topic) {
      userQuery = `[KAPSAMLI KONU ANLATIMI]: Lütfen ${subject ? `${subject} dersi ` : ""}"${topic}" konusunu pedagojik ve özel ders derinliğinde; mantığı, kavramları, formülleri, püf noktaları, çözümlü örnek soruları ve pekiştirme sorusuyla birlikte anlat.`;
    } else if (mode === "quiz" && topic) {
      userQuery = `[BENİ SINA - ETKİLEŞİMLİ SORU]: ${subject ? `${subject} dersi ` : ""}"${topic}" konusuyla ilgili sınav kalitesinde güzel bir soru sor, seçenekler veya ipuçları sun ve cevabımı değerlendirmek üzere bekle.`;
    } else if (mode === "summary" && topic) {
      userQuery = `[HAP BİLGİLER VE FORMÜL ÖZETİ]: ${subject ? `${subject} dersi ` : ""}"${topic}" konusunun sınavda çıkacak en kritik formüllerini, altın kurallarını ve hap özetini listele.`;
    } else if (mode === "solve" && topic) {
      userQuery = `[ÖRNEK SORU ÇÖZÜMLERİ]: ${subject ? `${subject} dersi ` : ""}"${topic}" konusuyla ilgili kolaydan zora tipik sınav soruları yaz ve çözümlerini adım adım mantığıyla açıkla.`;
    } else if (mode === "research") {
      const gradeLvl = req.body.gradeLevel || "Lise (9-12. Sınıf)";
      const assignType = req.body.assignmentType || "Kapsamlı Araştırma / Dönem Projesi";
      const specInst = req.body.specialInstructions ? `\nÖğretmenin Özel İstekleri / Kriterleri: ${req.body.specialInstructions}` : "";
      userQuery = `[AKILLI ÖDEV VE AKADEMİK ARAŞTIRMA DOSYASI TALEBİ]
Araştırılacak Konu: "${topic || prompt}"
İlgili Ders: ${subject || "Genel Bilim / Sosyal Bilimler"}
Eğitim Düzeyi: ${gradeLvl}
Ödev / Proje Türü: ${assignType}${specInst}

Lütfen bu ödev konusu için Türk MEB ve akademik araştırma standartlarına uygun, zengin, derinlemesine ve öğrencinin projesinde doğrudan kaynak olarak kullanabileceği eksiksiz bir araştırma dosyası hazırla.
Raporunu şu ana başlıklar altında pedagojik ve estetik bir dille yapılandır:
1. 📌 **Ödev Başlığı ve Giriş Tezi (Giriş Bölümü):** Konunun açık tanımı, tarihsel/bilimsel önemi, araştırma sorusu ve amacı.
2. 📑 **Detaylı Konu İncelemesi (Gelişme Bölümü - En az 3 Alt Başlık):** Konunun mekanizmaları, neden-sonuç ilişkileri, teorik arka planı ve derinlemesine açıklamaları.
3. 📊 **Somut Örnekler, Güncel Veriler ve İstatistikler:** Konuyu somutlaştıran bilimsel çalışmalar, tarihsel olaylar, Türkiye'deki veya dünyadaki durum.
4. 💡 **Öğretmenin Aradığı Kritik Noktalar & Sunum/Yazım Tavsiyeleri:** Bu ödevden tam not almak için sunumda veya raporda özellikle vurgulanması gereken 4-5 can alıcı altın kural.
5. 🏁 **Sonuç ve Değerlendirme:** Araştırmanın ana sentezi, geleceğe yönelik öngörüler ve kişisel çıkarım.
6. 📚 **Akademik & Güvenilir Kaynakça Listesi (Bibliyografya):** Konuyla ilgili geçerli ve bilimsel standartlara uygun kitap, makale, TÜBİTAK/MEB ve güvenilir ansiklopedik referanslar (APA stili).`;
    }

    contents.push({
      role: "user",
      parts: [{ text: userQuery }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "Şu anda yanıt oluşturulamadı, lütfen tekrar dener misin?";
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini AI Chat Error:", error);
    return res.status(500).json({
      error: "Yapay Zekâ Danışmanı için internet bağlantısı gerekiyor veya sunucuya erişilemedi.",
      details: error?.message || "Bilinmeyen hata",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Okul Asistanı server running on port ${PORT}`);
  });
}

startServer();
