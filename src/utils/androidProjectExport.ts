import JSZip from "jszip";

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file(
    "build.gradle",
    `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.22'
    }
}
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
task clean(type: Delete) {
    delete rootProject.buildDir
}`
  );

  zip.file(
    "settings.gradle",
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "OkulAsistani"
include ':app'`
  );

  zip.file(
    "gradle.properties",
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official`
  );

  zip.file(
    "README.md",
    `# Okul Asistanı Android APK Projesi

Bu proje Android Studio ile doğrudan açılabilir ve \`./gradlew assembleDebug\` komutuyla APK olarak derlenebilir.

## APK Derleme:
1. Android Studio'yu açın -> Open Project -> Bu klasörü seçin.
2. Build -> Build Bundle(s) / APK(s) -> Build APK(s)
3. 'app-debug.apk' telefonunuza aktarılmaya hazırdır!`
  );

  // app folder
  const appFolder = zip.folder("app");
  if (appFolder) {
    appFolder.file(
      "build.gradle",
      `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}
android {
    namespace 'com.okulasistani.app'
    compileSdk 34
    defaultConfig {
        applicationId "com.okulasistani.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
}
dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.webkit:webkit:1.10.0'
}`
    );

    const srcMain = appFolder.folder("src")?.folder("main");
    if (srcMain) {
      srcMain.file(
        "AndroidManifest.xml",
        `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Okul Asistanı"
        android:theme="@style/Theme.OkulAsistani">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
      );

      const javaFolder = srcMain.folder("java")?.folder("com")?.folder("okulasistani")?.folder("app");
      if (javaFolder) {
        javaFolder.file(
          "MainActivity.kt",
          `package com.okulasistani.app
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            loadUrl("https://ais-dev-fj5erzyycdjiisy5mfclcb-624854905113.europe-west1.run.app")
        }
        setContentView(webView)
    }
}`
        );
      }

      const resValues = srcMain.folder("res")?.folder("values");
      if (resValues) {
        resValues.file("strings.xml", `<resources><string name="app_name">Okul Asistanı</string></resources>`);
        resValues.file("colors.xml", `<resources><color name="primary">#4F46E5</color></resources>`);
        resValues.file(
          "styles.xml",
          `<resources><style name="Theme.OkulAsistani" parent="Theme.Material3.DayNight.NoActionBar"/></resources>`
        );
      }
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "OkulAsistani_Android_Project.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
