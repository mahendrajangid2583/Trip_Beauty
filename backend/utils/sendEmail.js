import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // options.subject options.message options.email are expected in the options object

  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    // --- CHANGE THESE LINES ---
    service: "gmail", // Use the 'gmail' shortcut
    auth: {
      user: process.env.EMAIL_USER, // Use specific variable for Gmail user
      pass: process.env.EMAIL_PASS, // Use specific variable for App Password
    },
    // -------------------------
  });

  // 2. Define the email options
  const mailOptions = {
    // --- CHANGE THIS LINE ---
    from: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER, // Use a more descriptive variable name
    // -------------------------
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: (can add html version here)
  };

  // 3. Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    // In a real app, you might throw this error to be handled by the controller
    throw new Error('Email sending failed'); // Propagate the error up
  }
};

export default sendEmail;
