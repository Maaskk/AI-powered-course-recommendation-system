# LearnPath AI - Course Recommendation System

🎓 **AI-Powered Course Recommendation Platform** that provides personalized course recommendations based on student profiles, academic performance, and interests.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **SQLite** (included with Python)

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Maaskk/AI-powered-course-recommendation-system.git
cd AI-powered-course-recommendation-system
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Install Python Dependencies

```bash
cd ml
pip3 install -r requirements.txt
cd ..
```

#### 4. Prepare Data

Ensure you have course data in the `data/` directory:
- `data/100K Coursera's Course Reviews Dataset by Jan Charles /reviews_by_course.csv`
- `data/coursera/` (optional)
- `data/itm-rec/` (optional)

#### 5. Train the ML Model (First Time Only)

```bash
cd ml
python3 train_professional_model.py
cd ..
```

This will create:
- `ml/results/professional_recommender.pkl` - Trained model
- `ml/results/course_catalog.csv` - Course catalog

#### 6. Start the ML API Server

Open a **new terminal** and run:

```bash
cd ml
python3 predict_api.py
```

Keep this terminal open. The API will run on `http://localhost:5000`

#### 7. Start the Next.js Frontend

Open **another terminal** and run:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### First Time Setup

1. **Register** a new account at `http://localhost:3000/register`
2. **Complete your profile** (major, year, interests, GPA)
3. **Generate recommendations** on the dashboard
4. **View course details** by clicking on any course card

### Features

- ✅ **Personalized Recommendations** - AI-powered course suggestions
- ✅ **Student Profiles** - Track major, year, GPA, and interests
- ✅ **Course Details** - View full course information and reviews
- ✅ **Dark/Light Mode** - Toggle theme preference
- ✅ **Profile Editing** - Update your profile anytime

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── course/            # Course detail pages
│   └── ...
├── components/            # React components
├── lib/                   # Utilities and helpers
├── ml/                    # Machine Learning backend
│   ├── src/              # ML source code
│   ├── predict_api.py    # Flask API server
│   └── train_professional_model.py
├── data/                  # Course data and database
└── public/               # Static assets
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (optional):

```env
ML_API_URL=http://localhost:5000
DATABASE_PATH=./data/app.db
```

### ML API Configuration

The ML API runs on port `5000` by default. To change it, edit `ml/predict_api.py`:

```python
app.run(host='0.0.0.0', port=5000, debug=False)
```

## 🐛 Troubleshooting

### ML API Not Starting

```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Restart API
cd ml && python3 predict_api.py
```

### Database Errors

```bash
# Reset database (WARNING: Deletes all data)
rm data/app.db*

# Restart Next.js server (will recreate tables)
npm run dev
```

### Module Not Found Errors

```bash
# Reinstall Python dependencies
cd ml
pip3 install -r requirements.txt --upgrade
```

### Theme Toggle Not Working

- Clear browser cache
- Check browser console for errors
- Ensure `next-themes` is installed: `npm list next-themes`

## 📊 Data Requirements

The system works with:
- **Coursera course reviews** (CSV format)
- **Course metadata** (title, description, category, etc.)
- **User ratings** (stored in SQLite database)

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Python, Flask, scikit-learn
- **Database**: SQLite (better-sqlite3)
- **ML**: TF-IDF, Cosine Similarity, Hybrid Recommendation

## 📝 Development

### Run in Development Mode

```bash
# Terminal 1: ML API
cd ml && python3 predict_api.py

# Terminal 2: Next.js
npm run dev
```

### Build for Production

```bash
# Build Next.js app
npm run build

# Start production server
npm start
```

## 📄 License

This project is private and proprietary.

## 👥 Contributors

- Project maintained by Maaskk

## 🔗 Links

- **GitHub Repository**: https://github.com/Maaskk/AI-powered-course-recommendation-system
- **Issues**: Report bugs and feature requests on GitHub

---

**Need Help?** Check the browser console and terminal logs for error messages.
