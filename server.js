const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const otps = {}; // { email: { code, expires } }

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shayna.vinoth2007@gmail.com',
    pass: 'rwtt fjzk wokp svyo', 
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const code = generateOTP();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
  otps[email] = { code, expires };

  try {
    await transporter.sendMail({
      from: 'YOUR_GMAIL@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${code}`,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, code } = req.body;
  const record = otps[email];
  if (!record) return res.status(400).json({ success: false, error: 'No OTP sent' });
  if (Date.now() > record.expires) return res.status(400).json({ success: false, error: 'OTP expired' });
  if (record.code !== code) return res.status(400).json({ success: false, error: 'Invalid OTP' });

  delete otps[email]; // Invalidate OTP after use
  res.json({ success: true });
});

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')), // Download from Firebase Console
});

app.post('/get-firebase-token', async (req, res) => {
  const { email } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email).catch(async () => {
      return await admin.auth().createUser({ email });
    });
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    res.json({ token: customToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('OTP server running on port 3001'));