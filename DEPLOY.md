# Share your site with a client (simple link)

## Step 1 – Build the site

In your project folder, run:

```powershell
cd "c:\Users\HP\Documents\advanplux work"
npm run build
```

This creates a `dist` folder with your ready-to-share site.

---

## Step 2 – Get a link (choose one)

### Option A: Netlify Drop (easiest – no commands)

1. Open: **https://app.netlify.com/drop**
2. Sign up free with email (or Google/GitHub) if asked.
3. **Drag and drop** your **`dist`** folder onto the page.
4. Netlify gives you a link like: `https://random-name-123.netlify.app`
5. Send that link to your client. It works on any phone or browser.

---

### Option B: Vercel (one command)

1. Build (if you didn’t already):
   ```powershell
   npm run build
   ```
2. Deploy:
   ```powershell
   npx vercel --yes
   ```
3. First time: sign in with email or GitHub (free).
4. Copy the link Vercel prints (e.g. `https://advanplux-work-xxx.vercel.app`) and send it to your client.

---

**Summary:** Run `npm run build`, then use **Netlify Drop** (drag `dist` folder) or **Vercel** (`npx vercel --yes`). Both give you a normal link your client can open from any device.
