# 🗄️ NexVault — Secure File Storage

> A lightweight, self-hosted file storage system with folders, tags, password locking, sharing, and analytics. No database required.

![License](https://img.shields.io/badge/license-MIT-violet) ![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green) ![Express](https://img.shields.io/badge/express-4.x-blue) ![Frontend](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJS-gold)

---

## ✨ Features

### Core
- 📂 **Drag & Drop Upload** — drop multiple files at once with animated progress bar
- 👁️ **File Preview** — images, video, audio, PDF, code and text preview in-browser
- ⬇️ **Download** — save any file directly to your device
- 🔍 **Search** — real-time search by filename or file type
- 📊 **Storage Stats** — live dashboard with file count, total size, notes and locked file counts

### Unique Features
- 📁 **Folder System** — create emoji-tagged folders and move files between them
- 🏷️ **Color-coded Tags** — 8 tag types (Important, Work, Design, Code, etc.) with a live filter bar
- 🔒 **Per-File Password Lock** — lock individual files with a password; blur overlay protects content until unlocked
- 🔗 **Smart Share Links** — generate links with optional expiry time, access password, and QR code
- 📈 **Analytics Dashboard** — storage by type, 7-day upload activity, file counts, and live activity feed
- ⭐ **Star / Favourite** — mark important files for quick identification
- 📝 **Sticky Notes** — attach personal notes to any file
- ⊞ **Grid / List View** — toggle between card grid and list layout
- 🔀 **Sort & Filter** — sort by date, name, size; filter by file category

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| File Uploads | Multer |
| File IDs | UUID v4 |
| MIME Detection | mime-types |
| Notes Storage | JSON file (no database) |
| Metadata Storage | Browser localStorage |

---

## 📁 Project Structure

```
nexvault/
├── public/
│   └── nexvault.html      # Full frontend (single file)
├── uploads/               # Uploaded files (auto-created)
├── notes.json             # Notes storage (auto-created)
├── server.js              # Express backend
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v14 or higher
- npm

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/nexvault.git
cd nexvault
```

**2. Install dependencies**
```bash
npm install
```

**3. Start the server**
```bash
node server.js
```

**4. Open in browser**
```
http://localhost:3000
```

### Default Login Credentials

| Username | Password |
|---|---|
| admin | admin123 |
| user | user123 |
| guest | guest123 |

> ⚠️ Change these credentials in `server.js` before deploying to production.

---

## 📡 API Endpoints

### Files

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/files` | Get all uploaded files |
| `POST` | `/api/upload` | Upload a single file |
| `POST` | `/api/upload/multiple` | Upload multiple files (max 50) |
| `GET` | `/files/:filename` | View / stream a file inline |
| `GET` | `/files/:filename/download` | Force download a file |
| `DELETE` | `/api/files/:filename` | Delete a file |

### Notes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notes/:filename` | Get note for a file |
| `POST` | `/api/notes/:filename` | Save or update a note |
| `DELETE` | `/api/notes/:filename` | Delete a note |

### System

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |

---

## 🔒 Security Notes

- **File Lock** — passwords are hashed using a djb2 hash and stored in browser `localStorage`. This is client-side protection suitable for personal/team use.
- **Path Traversal Protection** — all filenames are sanitized using `path.basename()` to prevent directory traversal attacks.
- **No Auth Middleware** — login is handled client-side. For production use, add server-side session authentication.
- **Share Links** — expiry and password on share links are client-side simulations. For real enforced expiry, implement server-side token validation.

---

## 🌍 Deployment

### Deploy on Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy on Render
1. Push code to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Deploy

### Environment Variables
```env
PORT=3000   # Optional — defaults to 3000
```

---

## 📦 Dependencies

```json
{
  "express": "^4.18.0",
  "multer": "^1.4.5",
  "uuid": "^9.0.0",
  "mime-types": "^2.1.35"
}
```

Install all with:
```bash
npm install express multer uuid mime-types
```

---

## 🗺️ Roadmap

- [ ] Server-side authentication with sessions
- [ ] Real enforced share link expiry
- [ ] File versioning (keep previous versions)
- [ ] Bulk actions (select multiple files)
- [ ] Dark / light theme toggle
- [ ] Email notifications on upload
- [ ] S3 / cloud storage backend option

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/my-feature`
3. Commit your changes — `git commit -m 'Add my feature'`
4. Push to the branch — `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify and distribute.

---

## 👤 Author

Built with ❤️ using Node.js and vanilla JavaScript.

> NexVault — own your files, own your data.
