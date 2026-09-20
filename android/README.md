# Okul Asistanı — Android APK Derleme Kılavuzu

Bu dizin, **Okul Asistanı** uygulamasının Android Studio ve Gradle ile derlenebilir eksiksiz Android projesini içerir.

## APK Derleme Adımları

### 1. Yöntem: Android Studio ile (Önerilen)
1. Bilgisayarınızda **Android Studio**'yu açın.
2. **Open** diyerek bu `android/` klasörünü seçin.
3. Gradle senkronizasyonunun tamamlanmasını bekleyin.
4. Üst menüden **Build > Build Bundle(s) / APK(s) > Build APK(s)** seçeneğine tıklayın.
5. Derleme tamamlandığında çıkan bildirime tıklayarak `app-debug.apk` dosyasını alın ve telefonunuza yükleyin.

### 2. Yöntem: Komut Satırı (Terminal / CMD) ile
Android SDK ve JDK 17 kurulu bir sistemde:

```bash
cd android
./gradlew assembleDebug
```
Windows için:
```cmd
cd android
gradlew.bat assembleDebug
```

Çıktı APK dosyası:
`android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Yöntem: PWA Olarak Telefona Anında Ekleme
Uygulama tam PWA standartlarına uygun hazırlandığı için:
1. Chrome veya mobil tarayıcınızda açın.
2. Sağ üstteki üç nokta menüsünden **"Uygulamayı Yükle"** veya **"Ana Ekrana Ekle"** seçeneğine dokunun.
3. Gerçek bir Android uygulaması gibi tam ekran, internetsiz çalışma ve bildirim desteğiyle telefonunuza yüklenir.
