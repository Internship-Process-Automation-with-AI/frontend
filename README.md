# OAMK Academic Credit Evaluation Frontend

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```
2. **Run in development**
   ```bash
   npm run dev
   # App: http://localhost:5173
   ```
3. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

---

## 📝 What is this?
A modern React web app for OAMK students and reviewers to upload, process, and review work certificates for ECTS credit using an AI-powered backend.

---

## ✨ Key Features
- Drag-and-drop certificate upload (PDF, DOCX, images)
- Training type selection (general/professional)
- Real-time AI processing with progress indicators
- Application dashboard with status, credits, and justifications
- Document preview and download
- Reviewer selection (with position & department)
- Appeal and feedback workflow
- Responsive, user-friendly UI

---

## 🗂️ Main UI Flow
1. **Enter student email**
2. **Upload certificate** and select training type (degree is auto-fetched)
3. **AI processes document** and shows results
4. **Send for approval** (select reviewer)
5. **Track application status** (accepted, rejected, pending, appeal)
6. **Reviewers** can approve/reject/leave comments

---

## 🔗 Backend/API
- Requires the backend FastAPI server running (see `../backend/README.md`)
- Default API URL: `http://localhost:8000`
- To change API URL, edit `frontend/src/api.js`

---

## 📄 More
- For backend setup, see `../backend/README.md`
- For API docs, visit `http://localhost:8000/docs` when backend is running
