const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  const { email } = JSON.parse(event.body);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set up transporter (use environment variables for real secrets)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // set in Netlify env vars
      pass: process.env.GMAIL_PASS, // set in Netlify env vars (App Password)
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    });
    // TODO: Store OTP in a database or cache for verification
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'OTP sent!' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}; 