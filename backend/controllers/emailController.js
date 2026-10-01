const { sendEmail } = require('../utils/emailService');

// @desc    Send test email via selected provider
// @route   POST /api/email/send
// @access  Public (for testing purposes)
const sendTestEmail = async (req, res, next) => {
  try {
    const { provider, to, subject, body } = req.body;
    
    if (!provider || !to || !subject || !body) {
      res.status(400);
      throw new Error('Please provide all required fields: provider, to, subject, body');
    }

    const result = await sendEmail({ provider, to, subject, body });
    
    res.status(200).json({
      success: true,
      message: `Email sent successfully via ${provider}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendTestEmail
};
