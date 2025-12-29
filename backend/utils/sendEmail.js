const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Kiểm tra xem email service có được cấu hình không
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    throw new Error('Email service chưa được cấu hình');
  }

  // 1. Tạo Transporter (Cấu hình dịch vụ gửi mail)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Cấu hình nội dung email
  const message = {
    from: `${process.env.EMAIL_FROM_NAME || 'Craftify Handmade'} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Gửi email
  const info = await transporter.sendMail(message);

  console.log('Email sent: %s', info.messageId);
  return info;
};

module.exports = sendEmail;