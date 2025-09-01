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
A modern React web app for OAMK students and reviewers to upload, process, and review work certificates for ECTS credit using an AI-powered backend with enhanced company validation and rich content display capabilities.

**This is a dual-portal application with separate interfaces for students and reviewers.**

---

## 👥 User Types & Portals

### **🎓 Student Portal**
**Purpose**: For OAMK students to submit work certificates and track their applications

**Features:**
- **Certificate Upload**: Drag-and-drop file upload with training type selection
- **AI Processing**: Real-time processing with progress indicators
- **Application Tracking**: Dashboard showing status, credits, and decisions
- **Company Validation**: View company legitimacy status and justifications
- **Appeal Process**: Submit comments and appeals for rejected applications
- **Document Management**: View and download submitted certificates

**Access**: Students access via the main application interface

---

### **👨‍💼 Reviewer Portal**
**Purpose**: For OAMK faculty and staff to review and approve student applications

**Features:**
- **Application Review**: View all pending and processed applications
- **Decision Making**: Approve/reject applications with comments
- **Company Validation Insights**: Access company legitimacy information
- **Student Communication**: Review student comments and appeals
- **Document Analysis**: View certificates and AI evaluation results
- **Workflow Management**: Track review status and decisions

**Access**: Reviewers access via the same application with different permissions and views

---

## 🔄 Portal Switching

### **How It Works:**
1. **Single Application**: Both portals are part of the same React application
2. **Role-Based Access**: Users see different interfaces based on their role
3. **Dynamic Navigation**: UI adapts to show relevant features for each user type
4. **Shared Backend**: Both portals connect to the same FastAPI backend

### **User Experience:**
- **Students**: Focus on certificate submission and application tracking
- **Reviewers**: Focus on application review and decision management
- **Seamless Integration**: Both portals share the same modern UI design
- **Responsive Design**: Works on all devices for both user types

---

## ✨ Key Features

### **Shared Features (Both Portals):**
- **Modern React UI** with responsive design
- **Real-time updates** and progress indicators
- **Company validation system** with legitimacy checking
- **Rich content display** with formatted justifications
- **Document viewing** with embedded modals

### **Student-Specific Features:**
- **Drag-and-drop certificate upload** (PDF, DOCX, images)
- **Training type selection** (general/professional)
- **Application dashboard** with status, credits, and justifications
- **Appeal and feedback submission** for rejected cases
- **Personal application history** and tracking

### **Reviewer-Specific Features:**
- **Application review dashboard** with filtering and sorting
- **Decision management** (approve/reject with comments)
- **Company validation insights** for better decision making
- **Student communication** and comment review
- **Workflow management** and status tracking

---

## 🗂️ Main UI Flow

### **Student Portal Flow:**
1. **Enter student email** and access student interface
2. **Upload certificate** and select training type (degree is auto-fetched)
3. **AI processes document** and shows results with company validation
4. **Send for approval** (select reviewer)
5. **Track application status** (accepted, rejected, pending, appeal)
6. **Submit appeals** if applications are rejected

### **Reviewer Portal Flow:**
1. **Access reviewer interface** with application dashboard
2. **Review pending applications** with company validation insights
3. **Analyze AI evaluation results** and company legitimacy
4. **Make decisions** (approve/reject) with detailed comments
5. **Review student appeals** and provide feedback
6. **Track review workflow** and decision history

---

## 🏢 Company Validation Features

### **What It Does:**
- **Legitimacy Check**: Verifies if companies actually exist
- **Business Registration**: Checks business registry information
- **Risk Assessment**: Identifies potentially suspicious companies
- **Evidence Collection**: Gathers supporting documentation

### **UI Integration (Both Portals):**
- **Training Institution Validation** label showing company status
- **View Justification** button for detailed company validation results
- **Company validation status** indicators (LEGITIMATE/UNVERIFIED/SUSPICIOUS)
- **Rich justification modal** with formatted company validation details

### **Company Validation Results:**
```json
{
  "company_validation_status": "LEGITIMATE",
  "company_validation_justification": {
    "name": "Company Name",
    "status": "LEGITIMATE",
    "confidence": "high",
    "risk_level": "low",
    "justification": "Company verified through business registry...",
    "supporting_evidence": [
      "Business registry match found",
      "Website verification successful",
      "Industry information confirmed"
    ]
  }
}
```

## 🔗 Backend/API Integration
- **Requires the backend FastAPI server running** (see `../backend/README.md`)
- **Default API URL**: `http://localhost:8000`
- **To change API URL**, edit `.env` file


## 🔧 Development

### **Tech Stack:**
- **React 18** with modern hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Modern JavaScript** (ES6+) features

### **Key Components:**
- **JustificationModal**: Rich content display with formatting
- **DocumentViewerModal**: Embedded document viewing
- **CompanyValidationDisplay**: Company legitimacy indicators
- **StudentPortal**: Student-specific interface and features
- **ReviewerPortal**: Reviewer-specific interface and features
- **RoleBasedNavigation**: Dynamic UI based on user type

### **State Management:**
- **React hooks** for local state
- **Context API** for shared state and user roles
- **Local storage** for persistence
- **API integration** for backend communication
- **Role-based access control** for different user types

---

## 📄 More Information
- **Backend Documentation**: See `../backend/README.md`
- **API Documentation**: Interactive docs at `http://localhost:8000/docs`
- **Company Validation**: See `../backend/README.md#company-validation-system`
- **AI Workflow**: See `../backend/AI_WORKFLOW_README.md`
- **OCR Process**: See `../backend/OCR_PROCESS_GUIDE.md`

---

**Note**: This frontend application provides a modern, user-friendly dual-portal interface for OAMK's AI-powered academic credit evaluation system. Students can submit and track applications, while reviewers can analyze and approve them, all with enhanced company validation features and rich content display capabilities for improved transparency and decision-making.


