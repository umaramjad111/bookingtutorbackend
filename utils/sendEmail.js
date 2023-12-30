const nodemailer = require("nodemailer")

module.exports = async(email, subject, text) => {
    console.log("email" , process.env.USER , process.env.HOST , process.env.SERVICE , Number(process.env.EMAIL_PORT)  ,process.env.PASS , Boolean(process.env.SECURE) ,   email ,  subject , text)
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
        console.log("Email sent successfully" , "email send")
    } catch (error) {
        console.log("Error in sending email")
        console.log(error)
    }
}