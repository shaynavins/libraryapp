let otpStore = global.otpStore || {};
global.otpStore = otpStore;

exports.handler = async function(event, context) {
  const { email, code } = JSON.parse(event.body);

  // Check if OTP exists and matches
  if (!otpStore[email]) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'No OTP sent to this email.' }),
    };
  }
  if (otpStore[email].otp !== code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'Invalid OTP.' }),
    };
  }
  if (Date.now() > otpStore[email].expires) {
    delete otpStore[email];
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'OTP expired.' }),
    };
  }

  // OTP is valid
  delete otpStore[email]; // Invalidate OTP after use
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: 'OTP verified!' }),
  };
}; 