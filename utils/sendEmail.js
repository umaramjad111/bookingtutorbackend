const nodemailer = require("nodemailer")

module.exports = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: Number(process.env.EMAIL_PORT),
            secure: Boolean(process.env.SECURE),
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            }
        })
        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        })
        console.log("Email sent successfully", "email send")
    } catch (error) {
        console.log("Error in sending email")
        console.log(error)
    }
}
















// const nodemailer = require('nodemailer');

// const sendVerificationEmail = async (email, token) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'champumar322@gmail.com',
//       pass: 'uzubgyqdhxnqzkxt'
//     }
//   });

//   const mailOptions = {
//     from: 'champumar322@gmail.com',
//     to: email,
//     subject: 'Email Verification',
//     text: `Please use this token to verify your email: ${token}`
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Verification email sent successfully!');
//   } catch (error) {
//     console.error('Error sending verification email:', error);
//   }
// };

// module.exports = sendVerificationEmail;
