/*
// Sending email using 
// - npm nodemailer : for sending email 
// - sendgrid.com API : for email service (100 emails per day with free account)
// - mailsac.com : temporary real mail box (for testing)
// - mailtrap.com : trap all email before sending out to real mail box (for testing)
*/
const nodemailer = require('nodemailer'); // email library
const pug = require('pug'); // html template
const { htmlToText } = require('html-to-text'); // convert html to text library

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Choco Husky <${process.env.EMAIL_FROM}>`; // SendGrid : from email address MUST be the same as verified account!
  }

  newTransport() {
    // Production
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // Development
    return nodemailer.createTransport({
      // service: 'Gmail', // Activate in gmail "less secure app" option
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // text: htmlToText.fromString(html),
      text: htmlToText(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
