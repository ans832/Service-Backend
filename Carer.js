const nodemailer = require('nodemailer');

const Carer = async (req, res) => {
  try {
    const { name, address, phone, query } = req.body;

    if (!name || !phone || !query) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    let transporter;
    if (process.env.USE_ETHEREAL === 'true') {
      // For local testing without Gmail: create an Ethereal test account
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Using Ethereal test account:', testAccount.user);
    } else {
      // Real Gmail (preferred: use app password)
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });
    }

    // Optional: verify connection (will log error if credentials/connection bad)
    transporter.verify((err, success) => {
      if (err) {
        console.error('SMTP verify failed:', err);
      } else {
        console.log('SMTP server is ready to send messages');
      }
    });

    const mailHTML = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>📌 Query for Career </h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Address:</strong> ${address || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Query:</strong> ${query}</p>
        <p> for job related email</p>
      </div>
    `;

    const mailOptions = {
      from: `"Website Contact" <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      subject: `New Query from ${name}`,
      html: mailHTML,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent info:', info);

    if (process.env.USE_ETHEREAL === 'true') {
      // only Ethereal provides a preview URL
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      return res.status(200).json({
        success: true,
        message: 'Ethereal email sent (preview URL logged).',
        preview: nodemailer.getTestMessageUrl(info),
      });
    }

    res.status(200).json({ success: true, message: 'Email sent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: error.message || 'Unknown error' });
  }
};

module.exports = Carer;
