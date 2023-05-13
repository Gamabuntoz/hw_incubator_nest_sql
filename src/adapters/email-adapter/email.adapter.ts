import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { senderData } from '../../helpers/constants';

@Injectable()
export class EmailAdapter {
  async sendEmail(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      port: 465,
      host: 'smtp.gmail.com',
      auth: {
        user: senderData.user,
        pass: senderData.pass,
      },
      secure: true,
    });
    await transporter.sendMail({
      from: 'SAMURAIS-API, <bonypiper@gmail.com>',
      to: email,
      subject: 'Registration',
      html: `<h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
            <a href='https://hw-incubator-nest.vercel.app/registration-confirmation?code=${code}'>complete registration</a>
            </p>`,
    });
    return true;
  }
  async sendEmailForPasswordRecovery(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      port: 465,
      host: 'smtp.gmail.com',
      auth: {
        user: senderData.user,
        pass: senderData.pass,
      },
      secure: true,
    });
    await transporter.sendMail({
      from: 'SAMURAIS-API, <bonypiper@gmail.com>',
      to: email,
      subject: 'Password Recovery',
      html: `<h1>Password recovery</h1>
                        <p>To finish password recovery please follow the link below:
                           <a href='https://incubator-hw.vercel.app/password-recovery?recoveryCode=${code}'>recovery password</a>
                        </p>`,
    });
    return true;
  }
}
