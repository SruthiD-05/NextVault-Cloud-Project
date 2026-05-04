const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Create uploads dir
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true, mode: 0o777 });
} else {
  try { fs.chmodSync(UPLOADS_DIR, 0o777); } catch(e) {}
}

// ✅ Notes storage file
const NOTES_FILE = path.join(__dirname, 'notes.json');
function loadNotes() {
  try {
    if (fs.existsSync(NOTES_FILE)) return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
  } catch(e) {}
  return {};
}
function saveNotes(notes) {
  try { fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2)); } catch(e) {}
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function getFileList() {
  if (!fs.existsSync(UPLOADS_DIR)) return [];
  const notes = loadNotes();
  return fs.readdirSync(UPLOADS_DIR)
    .filter(f => f !== '.gitkeep')
    .map(filename => {
      const filePath = path.join(UPLOADS_DIR, filename);
      const stats = fs.statSync(filePath);
      return {
        id: filename,
        name: filename,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        mimetype: mime.lookup(filename) || 'application/octet-stream',
        uploadedAt: stats.birthtime.toISOString(),
        url: `/files/${filename}`,
        hasNote: !!(notes[filename] && notes[filename].text),
        noteText: notes[filename]?.text || '',
        noteUpdatedAt: notes[filename]?.updatedAt || null
      };
    }).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  res.json({
    success: true,
    file: {
      id: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      sizeFormatted: formatBytes(req.file.size),
      mimetype: req.file.mimetype,
      url: `/files/${req.file.filename}`
    }
  });
});

app.post('/api/upload/multiple', upload.array('files', 50), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files uploaded.' });
  const uploaded = req.files.map(f => ({
    id: f.filename,
    originalName: f.originalname,
    size: f.size,
    sizeFormatted: formatBytes(f.size),
    mimetype: f.mimetype,
    url: `/files/${f.filename}`
  }));
  res.json({ success: true, message: `${uploaded.length} file(s) uploaded.`, files: uploaded });
});

app.get('/api/files', (req, res) => res.json({ success: true, files: getFileList() }));

app.get('/files/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found.' });
  const mimeType = mime.lookup(filename) || 'application/octet-stream';
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.sendFile(filePath);
});

app.get('/files/:filename/download', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found.' });
  res.download(filePath, filename);
});

app.delete('/api/files/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'Not found.' });
  fs.unlinkSync(filePath);
  const notes = loadNotes();
  delete notes[filename];
  saveNotes(notes);
  res.json({ success: true, message: 'Deleted.' });
});

// ============================================================
// ✅ NOTES ENDPOINTS
// ============================================================

app.get('/api/notes/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const notes = loadNotes();
  const note = notes[filename] || { text: '', updatedAt: null };
  res.json({ success: true, filename, ...note });
});

app.post('/api/notes/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const { text } = req.body;
  if (typeof text !== 'string') return res.status(400).json({ success: false, message: 'Invalid note text.' });
  const notes = loadNotes();
  if (text.trim() === '') {
    delete notes[filename];
  } else {
    notes[filename] = {
      text: text.trim().slice(0, 2000),
      updatedAt: new Date().toISOString()
    };
  }
  saveNotes(notes);
  res.json({ success: true, message: 'Note saved.', note: notes[filename] || null });
});

app.delete('/api/notes/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const notes = loadNotes();
  delete notes[filename];
  saveNotes(notes);
  res.json({ success: true, message: 'Note deleted.' });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: err.message || 'Server error.' });
});

app.listen(PORT, () => {
  console.log(`✅ NexVault running on port ${PORT}`);
  console.log(`📁 Uploads: ${UPLOADS_DIR}`);
  console.log(`📝 Notes: ${NOTES_FILE}`);
});

module.exports = app;