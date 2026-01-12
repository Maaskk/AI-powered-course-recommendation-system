# 📤 How to Upload to GitHub

## Step 1: Initialize Git (if not already done)

```bash
git init
```

## Step 2: Add Remote Repository

```bash
git remote add origin https://github.com/Maaskk/AI-powered-course-recommendation-system.git
```

## Step 3: Add All Files

```bash
git add .
```

## Step 4: Commit Changes

```bash
git commit -m "Initial commit: AI-powered course recommendation system"
```

## Step 5: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

## ✅ Done!

Your project is now on GitHub at:
**https://github.com/Maaskk/AI-powered-course-recommendation-system**

---

## 🔄 Future Updates

To update the repository:

```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 📝 Notes

- The `junk/` folder is ignored by `.gitignore` and won't be uploaded
- Large files (`.pkl` models, databases) are also ignored
- Only source code and essential files will be uploaded
