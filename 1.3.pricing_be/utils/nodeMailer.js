const nodemailer = require("nodemailer");

function sendEmail(to) {
  // Create a transporter object
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  // Define the email options
  let mailOptions = {
    from: process.env.GMAIL_USERNAME,
    to: "phanthaiduong2000@gmail.com",
    subject: "[Order Me] Your customer is not happy",
    text: "Your customer is not happy with your service. Please check your email for more details",
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occurred:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
}

module.exports = { sendEmail };
