# MCP Chatbot - Android APK Distribution & Build Guide

**Owned by Zyven Technologies Pvt Ltd**  
**Part of the MCP Admin Product Line**

This directory contains the production Android distribution artifacts for **MCP Chatbot : Chat with your MCP servers using cloud llms**.

---

## 📱 Pre-Compiled Release Artifact
- **File**: `mcp-chatbot-release.apk`
- **Package Name**: `com.zyven.mcpadmin.chatbot`
- **Target SDK**: Android 14+ (API 34)
- **Minimum SDK**: Android 8.0+ (API 26)
- **Architecture**: Universal (arm64-v8a, armeabi-v7a, x86_64)

---

## 🛠️ How to Compile / Rebuild APK from Source

This application is built with a responsive Android-first architecture and can be compiled into a native Android APK using either **Capacitor** or **Cordova / Android Studio**.

### 1. Build Production Web Assets
```bash
npm install
npm run build
```

### 2. Initialize Capacitor Android Project
```bash
npx cap init "MCP Chatbot" com.zyven.mcpadmin.chatbot --web-dir dist
npx cap add android
npx cap copy android
```

### 3. Build APK with Gradle or Android Studio
```bash
cd android
./gradlew assembleRelease
```
The newly generated release APK will be located at:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

Sign with your release key using `apksigner`:
```bash
apksigner sign --ks zyven-release.keystore --out ../output/apk/mcp-chatbot-release.apk app-release-unsigned.apk
```

---

## 🌐 Official Resources
- **MCP Admin Cloud**: [https://mcpadmin.cloud](https://mcpadmin.cloud)
- **Zyven Technologies**: [https://zyven-technologies.com](https://zyven-technologies.com)
