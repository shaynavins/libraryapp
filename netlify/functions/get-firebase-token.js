exports.handler = async function(event, context) {
  const { email } = JSON.parse(event.body);
  // TODO: Use Firebase Admin SDK to generate a custom token for the email
  // For now, just return a dummy token for demo
  return {
    statusCode: 200,
    body: JSON.stringify({ token: 'DUMMY_FIREBASE_TOKEN_FOR_' + email })
  };
}; 