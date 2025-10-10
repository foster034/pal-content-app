# Camera Feature Test Instructions

## Manual Test Steps

### Prerequisites
1. Make sure dev server is running: `npm run dev`
2. Open browser to: `http://localhost:3000/tech/dashboard?openForm=true`
3. Login with tech code: `LLY3A4` (Johnny Punk)

---

## Test 1: Camera Access ✓

**Steps:**
1. Click "Submit Content" button (top right)
2. Select any service category and type
3. Click "Continue" to step 2 (Location & Photos)
4. Click "Take Photo" button

**Expected Results:**
- [ ] Camera modal opens with black background
- [ ] Browser asks for camera permission (if first time)
- [ ] Live video feed appears
- [ ] You can see yourself in the video

**If it fails:**
- Check browser console for errors
- Verify camera permissions in browser settings
- Try allowing camera access when prompted

---

## Test 2: GMB Crop Guide ✓

**Steps:**
1. With camera open, look at the overlay

**Expected Results:**
- [ ] White square border visible in center
- [ ] Blue "📍 GMB 1:1 Square" badge at top
- [ ] White corner brackets (L-shaped) at all 4 corners
- [ ] Rule of thirds grid (faint white lines) inside square
- [ ] Areas outside square are dimmed/darkened
- [ ] Help text at bottom: "Photo will auto-crop to 1:1 square (1200x1200)..."

---

## Test 3: Camera Flip ✓

**Steps:**
1. Look for 🔄 button at bottom (between ❌ and ⏺)
2. Click the 🔄 flip button

**Expected Results:**
- [ ] Camera switches (front ↔ back or to different camera)
- [ ] Camera counter updates (e.g., "Camera 1/3" → "Camera 2/3")
- [ ] Video feed switches smoothly
- [ ] Help text shows updated camera number

**Note:** If you only have 1 camera, the 🔄 button won't appear

---

## Test 4: Photo Capture & Auto-Crop ✓

**Steps:**
1. Position yourself within the white square guide
2. Click ⏺ (white circle button) to capture
3. Camera should close and return to form
4. Look for the photo preview in the form

**Expected Results:**
- [ ] Photo captures successfully
- [ ] Camera modal closes
- [ ] Photo preview appears in the form
- [ ] Check browser console for log: `📷 Captured and auto-cropped to GMB size: 1200x1200`

---

## Test 5: Verify Photo Size ✓

**Steps:**
1. After capturing, open browser DevTools (F12)
2. Go to Console tab
3. Look for the capture log message

**Expected Console Log:**
```
📷 Captured and auto-cropped to GMB size: 1200x1200 (from 1920x1080)
```

**Verify:**
- [ ] Final size is exactly 1200x1200
- [ ] Original video size is shown (varies by camera)
- [ ] Aspect ratio is 1:1 (square)

---

## Test 6: Multiple Photos ✓

**Steps:**
1. Capture first photo (as above)
2. Click "Take Photo" button again
3. Capture second photo
4. Repeat for 3rd photo

**Expected Results:**
- [ ] Can capture multiple photos
- [ ] Each photo shows as separate preview
- [ ] All photos maintain 1200x1200 size
- [ ] Form shows photo count

---

## Test 7: Cancel Camera ✓

**Steps:**
1. Click "Take Photo" to open camera
2. Click ❌ (cancel button) at bottom

**Expected Results:**
- [ ] Camera modal closes
- [ ] Returns to form without capturing
- [ ] Camera stream stops (indicator light turns off)
- [ ] No photo is added to form

---

## Test 8: Submit with Photos ✓

**Steps:**
1. Complete the form with:
   - Service category: Automotive
   - Service type: Car Lockout
   - Location: 123 Test St
   - Description: Test with photos
   - At least 1 photo captured
2. Click through all steps
3. Click "Submit" or "Finish"

**Expected Results:**
- [ ] Form submits successfully
- [ ] No errors in console
- [ ] Photos are included in submission
- [ ] Redirects to dashboard or shows success message

---

## Common Issues & Fixes

### Camera Won't Start
**Issue:** Black screen or "Camera access denied"
**Fix:**
- Check browser permissions: chrome://settings/content/camera
- Reload page and allow camera access
- Close other apps using the camera (Zoom, Skype, etc.)

### No Flip Button
**Issue:** 🔄 button doesn't appear
**Fix:** This is normal if you only have 1 camera

### Photo Not Cropping
**Issue:** Photos aren't 1200x1200
**Fix:**
- Check browser console for errors
- Clear browser cache and reload
- Update code was applied correctly

### Camera Frozen
**Issue:** Video feed freezes
**Fix:**
- Close and reopen camera modal
- Refresh the page
- Restart browser

---

## Success Criteria ✅

All tests pass if:
- [x] Camera opens and shows live feed
- [x] GMB crop guide displays correctly
- [x] Can flip between cameras (if multiple available)
- [x] Photos capture at exactly 1200x1200px
- [x] Square crop guide matches actual crop
- [x] Multiple photos can be captured
- [x] Form submits with photos successfully

---

## Developer Console Commands

You can also test programmatically in the browser console:

```javascript
// Check available cameras
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(d => d.kind === 'videoinput');
    console.log('Available cameras:', cameras);
  });

// Check current camera permissions
navigator.permissions.query({ name: 'camera' })
  .then(result => console.log('Camera permission:', result.state));
```

---

## Report Issues

If any tests fail, please note:
1. Which test failed
2. Browser and version (e.g., Chrome 120)
3. Error messages from console
4. Screenshots if helpful
