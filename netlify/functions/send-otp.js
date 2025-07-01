exports.handler = async function(event, context) {
  const { email } = JSON.parse(event.body);
  // TODO: Generate OTP, store it, and send email using nodemailer or another service
  // For now, just return success for demo
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: `OTP would be sent to ${email}` })
  };
}; 