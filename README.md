# Office Attendance System

A modern web-based attendance system that allows employees to check in securely using IP address verification, with real-time Google Sheets integration and push notifications for administrators.

![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![React](https://img.shields.io/badge/Frontend-React-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Google Sheets](https://img.shields.io/badge/Integration-Google%20Sheets-yellow)

## ✨ Features

- ✅ Employee check-in with IP verification (within office network)
- 📊 Attendance records saved in real-time to Google Sheets
- 🔔 Push notifications sent to admins on each check-in
- 🔐 Restricts users to one check-in per day
- ⚛️ React frontend with Material-UI
- 🔧 Admin-only notification subscription system

## 🧰 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Cloud project with Google Sheets API enabled
- Service account credentials for Google Sheets API
- VAPID keys for Web Push notifications

## ⚙️ Setup Instructions

### 📦 Backend Setup

1. Install backend dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/attendance_system
PORT=3000
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
OFFICE_IP_RANGE=192.168.1.0/24
```

> 🔐 Note: Ensure your `GOOGLE_PRIVATE_KEY` is properly escaped or stored in base64.

3. Start the backend server:

```bash
npm run dev
```

### 💻 Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Create a `.env` file inside the frontend directory:

```env
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

4. Start the frontend development server:

```bash
npm run dev
```

## 📋 Google Sheets Setup

1. Create a Google Sheet and note its ID
2. Enable the **Google Sheets API** in your Google Cloud Console
3. Create a **service account** and download the credentials
4. Share the Google Sheet with the service account email
5. Update the `.env` file with the spreadsheet ID and credentials

## 🔔 Push Notifications Setup

1. Generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

2. Add the generated keys to both backend and frontend `.env` files

## 🚀 Usage

- Open the frontend application in a browser
- Admins should subscribe to push notifications
- Employees enter their name and email to check in
- Check-ins are accepted only from within the defined office IP range
- Admins receive real-time notifications for every successful check-in
- Each employee can only check in once per day

## 🔒 Security Considerations

- IP address whitelisting restricts check-ins to office network
- Duplicate check-ins are prevented by date-based validation
- Google service credentials and VAPID keys must be kept secure
- Sensitive keys should never be exposed in the frontend

---

> Built with ❤️ by [Shubhanshu Pandey](https://github.com/ShubhanshuPandey05)