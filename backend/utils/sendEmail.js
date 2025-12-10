const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Tạo Transporter (Cấu hình dịch vụ gửi mail)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // Ví dụ: 'gmail'
    auth: {
      user: process.env.EMAIL_USER, // Email của bạn
      pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (App Password)
    },
  });

  // 2. Cấu hình nội dung email
  const message = {
    from: `${process.env.EMAIL_FROM_NAME || 'Handmade Market'} <${process.env.EMAIL_USER}>`,
    to: options.email,     // Người nhận
    subject: options.subject, // Tiêu đề
    text: options.message,    // Nội dung dạng text
    // html: options.html     // Nội dung dạng HTML (nếu cần)
  };

  // 3. Gửi email
  const info = await transporter.sendMail(message);

  console.log('Email sent: %s', info.messageId);
};

module.exports = sendEmail;