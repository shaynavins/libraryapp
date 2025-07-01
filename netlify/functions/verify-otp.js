const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
  });
}

exports.handler = async function(event, context) {
  const { email, code } = JSON.parse(event.body);

  const doc = await admin.firestore().collection('otps').doc(email).get();
  if (!doc.exists) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'No OTP sent to this email.' }),
    };
  }
  const data = doc.data();
  if (data.otp !== code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'Invalid OTP.' }),
    };
  }
  if (Date.now() > data.expires) {
    await admin.firestore().collection('otps').doc(email).delete();
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'OTP expired.' }),
    };
  }

  // OTP is valid, delete it
  await admin.firestore().collection('otps').doc(email).delete();
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: 'OTP verified!' }),
  };
}; 