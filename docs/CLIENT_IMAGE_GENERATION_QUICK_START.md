# 🎨 Client-Side Image Generation - Quick Start

## ⚡ Quick Setup

### 1. Add API Key

Create or update `.env.local`:

```bash
NEXT_PUBLIC_FLUX_API_KEY=your_flux_api_key_here
```

> ⚠️ Note: `NEXT_PUBLIC_` prefix makes this available on client side

### 2. Restart Dev Server

```bash
npm run dev
```

---

## 🧪 Quick Test

### Test 1: Generate WITH Images

1. **Navigate:** http://localhost:3000/worksheet-editor

2. **Fill form:**
   - Topic: `Dinosaurs`
   - Level: `Elementary`
   - Exercise Types: Toggle "Let AI choose" ✅
   - Advanced Options:
     - Language: `English`
     - Include Images: `ON` ✅

3. **Click:** Generate

4. **Watch progress:**
   ```
   Stage 1: ✨ AI is Creating Your Worksheet
            (10-30 seconds)
   
   Stage 2: 🎨 Generating Images
            Progress: 2 / 3 images generated
            [████████████░░░░] 66%
            (2-5 seconds per image)
   ```

5. **Result:** Worksheet with AI-generated dinosaur images

---

### Test 2: Generate WITHOUT Images

1. **Same form, but:**
   - Include Images: `OFF` ❌

2. **Click:** Generate

3. **Watch progress:**
   ```
   Stage 1: ✨ AI is Creating Your Worksheet
            (10-30 seconds)
   
   [Goes straight to canvas - no Stage 2]
   ```

4. **Result:** Worksheet with text only, no images

---

## 🔍 What's Happening Behind the Scenes

### Stage 1: Content (Backend + Gemini)

```
User clicks "Generate"
    ↓
POST /api/worksheet/generate
    ↓
Gemini 2.5 Flash generates:
{
  "elements": [
    {
      "type": "image-placeholder",
      "properties": {
        "imagePrompt": "A friendly T-Rex...",  ← Generated prompt
        "caption": "T-Rex"
      }
    }
  ]
}
```

### Stage 2: Images (Frontend + Flux)

```
WorksheetEditor receives worksheet
    ↓
WorksheetImageGenerationService.generateImagesForWorksheet()
    ↓
For each image-placeholder:
    1. Extract imagePrompt
    2. Enhance prompt (add "child-friendly", "educational", etc.)
    3. Direct fetch() to Flux API
    4. Receive base64 image
    5. Update element.properties.url
    6. Update progress UI
    ↓
Complete worksheet with images
```

---

## 📊 Expected Output

### Console Logs

```
🚀 Generating worksheet with params: {...}
📡 Sending request to API: {...}
✅ Content generated successfully
🎨 Starting client-side image generation...
📊 Image progress: 1/3
📊 Image progress: 2/3
📊 Image progress: 3/3
✅ Image generation completed: 3/3
```

### Browser Network Tab

You should see:

1. **POST** `/api/worksheet/generate` → Returns content with imagePrompts
2. **POST** `https://api.together.xyz/v1/images/generations` (3x) → Returns images

---

## 🐛 Common Issues

### Issue: "Flux API key not configured"

**Solution:**
```bash
# Check .env.local exists
cat .env.local

# Should show:
NEXT_PUBLIC_FLUX_API_KEY=sk_...

# Restart server
npm run dev
```

---

### Issue: Images not generating (no Stage 2)

**Check:**
1. "Include Images" toggle is ON
2. Browser console for errors
3. Network tab for API calls

**Debug:**
```javascript
// Open browser console on generation page
console.log(process.env.NEXT_PUBLIC_FLUX_API_KEY); 
// Should show your key
```

---

### Issue: Some images fail

**Expected behavior:**
- ⚠️ Warning shown: "2 image(s) failed"
- Worksheet still displays
- Failed images show placeholders

**Common causes:**
- API rate limit
- Network timeout
- Invalid prompt

---

## 🎯 Testing Checklist

- [ ] Stage 1 shows "Creating Worksheet" message
- [ ] Stage 2 shows "Generating Images" with progress bar
- [ ] Progress bar updates (0% → 33% → 66% → 100%)
- [ ] Current image caption displays
- [ ] Total count displays (e.g., "2 / 3 images")
- [ ] Worksheet displays with generated images
- [ ] Images are educational and child-friendly
- [ ] Canvas editor works with generated worksheet
- [ ] Disable images → no Stage 2 → faster generation

---

## 🔧 Advanced Testing

### Test Different Topics

```
✅ "Solar System"    → Space images
✅ "Ocean Animals"   → Sea creatures
✅ "Fruits"          → Fruit illustrations
✅ "Shapes"          → Geometric shapes
```

### Test Different Age Groups

```
✅ Beginner (3-5)    → Very simple images
✅ Elementary (6-7)  → Child-friendly illustrations
✅ Intermediate      → More detailed images
```

### Test Error Handling

1. **Invalid API key:**
   ```bash
   NEXT_PUBLIC_FLUX_API_KEY=invalid_key
   ```
   Expected: All images fail, worksheet still displays

2. **No API key:**
   ```bash
   # Remove from .env.local
   ```
   Expected: Error in console, no images generated

3. **Network disconnected:**
   - Open DevTools → Network tab
   - Set "Offline"
   - Try generating
   Expected: Images fail, worksheet displays

---

## 📝 Verification Points

### After successful generation:

1. **Check worksheet elements:**
   ```javascript
   // In browser console
   generatedWorksheet.pages[0].elements
   // Should show elements with:
   // - type: "image-placeholder"
   // - properties.url: "data:image/png;base64,..."
   ```

2. **Verify images are embedded:**
   - Right-click image → "Open image in new tab"
   - Should show base64 data URL (very long)
   - Image should be educational and relevant

3. **Check generation stats:**
   - Console should show: "✅ Image generation completed: X/X"
   - All X images should be generated (or show warnings)

---

## 🚀 Next Steps After Testing

1. ✅ Verify images are educational and relevant
2. ✅ Test with different topics and age groups
3. ✅ Check performance (timing)
4. ✅ Monitor API usage
5. ✅ Consider server-side generation for production

---

## 📚 Related Docs

- [Full Documentation](./CLIENT_SIDE_IMAGE_GENERATION.md)
- [AI Worksheet Generation](./AI_WORKSHEET_GENERATION.md)
- [Step1 Parameters](./STEP1_WORKSHEET_UPDATES.md)

---

## 💡 Quick Troubleshooting

```bash
# 1. Check environment
echo $NEXT_PUBLIC_FLUX_API_KEY

# 2. Verify .env.local
cat .env.local | grep FLUX

# 3. Restart server
pkill -f "next dev" && npm run dev

# 4. Clear browser cache
# Chrome: Cmd+Shift+Delete → Clear cache

# 5. Check API status
curl https://api.together.xyz/health
```

---

**Ready to test! 🎉**

Open http://localhost:3000/worksheet-editor and generate your first worksheet with AI images!
