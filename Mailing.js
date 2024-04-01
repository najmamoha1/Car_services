const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.mail_server,
  auth: {
    user: process.env.mail_user,
    pass: process.env.mail_pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});


async function sendStatus({receiver, subject, text,recipientName, senderName}) {
  try {
    await transporter.sendMail({
      from: process.env.mail_user,
      to: receiver,
      subject: subject,
      html:`
        <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your Title Here</title>
</head>
<body>

  <table style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0 auto; border-collapse: collapse; width: 600px; background-color: #ffffff;">
    <tr>
      <td style="padding: 20px; background-color: #f9f9f9;">
        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Emblem_of_the_African_Union.svg/300px-Emblem_of_the_African_Union.svg.png" alt="Your Logo" style="display: block; margin: 0 auto; max-width: 230px; height: 200px;">

        <h1 style="color: #333;">Hello, ${recipientName}!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; color: #555;">
        <p>${text}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; background-color: #1A5632; text-align: center; color: #fff;">
        <p>Thank you for your time, ${senderName}</p>
      </td>
    </tr>
  </table>

</body>
</html>
`
    });
    console.log('Email sent');
  } catch (error) {
    console.error(error);
  }
}

async function sendEmail({receiver, subject, text,recipientName, senderName}) {
  try {
    await transporter.sendMail({
      from: process.env.mail_user,
      to: receiver,
      subject: subject,
      html:`
        <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your Title Here</title>
</head>
<body>

  <table style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0 auto; border-collapse: collapse; width: 600px; background-color: #ffffff;">
    <tr>
      <td style="padding: 20px; background-color: #f9f9f9;">
        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Emblem_of_the_African_Union.svg/300px-Emblem_of_the_African_Union.svg.png" alt="Your Logo" style="display: block; margin: 0 auto; max-width: 230px; height: 200px;">

        <h1 style="color: #333;">Hello, ${recipientName}!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; color: #555;">
        <p>${text}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; background-color: #1A5632; text-align: center; color: #fff;">
        <p>Thank you for your time, ${senderName}</p>
      </td>
    </tr>
  </table>

</html>
`
    });
    console.log('Email sent');
  } catch (error) {
    console.error(error);
  }
}


module.exports ={
    sendStatus: sendStatus,
    sendEmail: sendEmail
}