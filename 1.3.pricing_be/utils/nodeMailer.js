const nodemailer = require("nodemailer");

function sendEmail(assignedUserEmail, user, feedback) {
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
    to: assignedUserEmail,
    subject: "[Order Me] Your customer is not happy",
    text: `
    Your customer is not happy with your service.

    Their feedback: ${feedback}

    Their contact info:
    Username: ${user.username}
    Full Name: ${user.fullName}
    Email: ${user.email}
    Phone: ${user.phone}
  `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occurred:", error);
    } else {
      // console.log("Email sent successfully:", info.response);
    }
  });
}

module.exports = { sendEmail };
