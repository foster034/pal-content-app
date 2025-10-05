# 📱 Mobile Camera Debugging Guide

## Common Mobile Camera Issues & Solutions

### 🔒 **Issue 1: HTTPS Required (Most Common)**
**Error**: "Camera access failed: Permission denied" or "getUserMedia() not supported"
**Cause**: Mobile browsers require HTTPS for camera access
**Current URL**: `http://192.168.2.120:3001`

**Solutions**:

#### Option A: Use ngrok (Recommended)
```bash
# Install ngrok globally
npm install -g ngrok

# Start HTTPS tunnel
ngrok http 3001
```
Then use the https://xxx.ngrok.io URL on mobile

#### Option B: HTTPS Dev Server
```bash
# Create SSL certificate
mkdir .ssl
cd .ssl
openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

# Start HTTPS dev server
npm run dev -- --experimental-https --https-key .ssl/localhost.key --https-cert .ssl/localhost.crt
```

### 📱 **Issue 2: Browser Compatibility**
**Supported**: Safari (iOS), Chrome (Android), Firefox Mobile
**Not Supported**: Instagram in-app browser, Facebook in-app browser

### 🎥 **Issue 3: Camera Permissions**
**Symptoms**: Permission denied error
**Solution**:
1. Clear browser cache/data
2. Check browser settings > Camera permissions
3. Ensure camera isn't used by another app

### 🔧 **Issue 4: Camera Constraints**
**Error**: "OverconstrainedError"
**Solution**: App already has fallback logic for this

## 🧪 Testing Steps

### 1. Check Current Status
Open browser console on mobile and look for:
- `🎥 Starting camera initialization...`
- `🔒 Secure context: false` (indicates HTTP issue)
- Error messages with specific causes

### 2. Quick HTTPS Test
Use ngrok for immediate HTTPS access:
```bash
ngrok http 3001
```
Use the provided https URL

### 3. Browser Test
Try different browsers:
- Safari (iOS)
- Chrome (Android)
- Firefox Mobile

## 📋 Debug Checklist

- [ ] Using HTTPS URL
- [ ] Camera permissions granted
- [ ] No other apps using camera
- [ ] Supported browser
- [ ] Check browser console for errors
- [ ] Try different camera (front/back)

## 🛠️ Current Implementation Status

✅ **Already Implemented**:
- Detailed error logging
- Multiple camera support
- Fallback error handling
- Mobile-optimized constraints
- File upload alternative

⚠️ **Missing**:
- HTTPS requirement (main issue)
- PWA camera permissions