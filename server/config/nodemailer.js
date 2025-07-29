import  nodemailer from 'nodemailer';

const transporter =nodemailer.createTransport({
host:'smtp-relay.brevo.com',
port:465,
secure: true, 
auth:{
    user:process.env.SMTP_USER,
    pass:process.env.SMTP_PASS,

}
});

export default transporter;