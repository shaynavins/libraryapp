exports.handler = async function(event, context) {
  const { email, code } = JSON.parse(event.body);
  // TODO: Verify OTP for the email
  // For now, just return success for demo
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: `OTP ${code} for ${email} would be verified here` })
  };
}; 