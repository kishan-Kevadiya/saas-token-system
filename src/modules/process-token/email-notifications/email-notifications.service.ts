// import path from 'path';
// import nodemailer, { type Transporter } from 'nodemailer';
// import hbs from 'nodemailer-express-handlebars';
// import { create as createExpressHandlebars } from 'express-handlebars';
// import moment from 'moment';

// interface EmailInfo {
//   to: string;
//   subject: string;
//   template: string;
// }

// interface EmailServiceConfig {
//   smtpHost: string;
//   smtpPort: number;
//   smtpUsername: string;
//   smtpPassword: string;
//   smtpSecure: boolean;
// }

// interface ForgotPasswordContext {
//   email: string;
//   name: string;
//   link: string;
//   contactEmail: string;
//   contactPhone: string;
//   currentYear: number;
// }

// export default class EmailNotificationService {
//   private transporter?: Transporter;
//   private config?: EmailServiceConfig;

//   constructor(config?: EmailServiceConfig) {
//     if (config) {
//       this.initialize(config);
//     }
//   }

//   private initialize(config: EmailServiceConfig) {
//     this.config = config;

//     this.transporter = nodemailer.createTransport({
//       host: config.smtpHost,
//       port: config.smtpPort,
//       auth: {
//         user: config.smtpUsername,
//         pass: config.smtpPassword,
//       },
//       secure: config.smtpSecure,
//       logger: console,
//       debug: false,
//     });

//     const viewEngineHandlebarConfig = createExpressHandlebars({
//       layoutsDir: path.resolve(__dirname, 'templates'),
//       extname: '.hbs',
//       defaultLayout: false,
//     });

//     const handlebarOptions = {
//       viewEngine: viewEngineHandlebarConfig,
//       viewPath: path.resolve(__dirname, 'templates'),
//       extName: '.hbs',
//     };

//     this.transporter.use('compile', hbs(handlebarOptions));
//   }

//   private async sendEmail<T>(mail: EmailInfo, context?: T): Promise<void> {
//     if (!this.transporter || !this.config) {
//       console.warn('Email config is not set. Skipping sendEmail.');
//       return;
//     }

//     const mailOptions = {
//       from: this.config.smtpUsername,
//       to: mail.to,
//       subject: mail.subject,
//       template: mail.template,
//       context,
//       templateOptions: {
//         layout: false,
//       },
//     };

//     try {
//       const info = await this.transporter.sendMail(mailOptions);
//       console.log('Email sent: ', info.response);
//     } catch (error) {
//       console.error('Error sending email:', error);
//     }
//   }

//   private readonly currentYear = moment().year();

// public async sendTokenCallNotification(
//   email: string,
//   name: string,
//   tokenNumber: string,
//   counterNumber: string,
//   organizationName: string,
//   logoUrl: string,
//   year: number
// ) {
//   await this.sendEmail(
//     {
//       to: email,
//       subject: 'Your Token Has Been Called!',
//       template: 'notify-called-token-user',
//     },
//     {
//       name,
//       tokenNumber,
//       counterNumber,
//       organizationName,
//       logoUrl,
//       year,
//     }
//   );
// }

// public async sendTokenNextNotification(
//   email: string,
//   name: string,
//   tokenNumber: string,
//   estimatedMinutes: number,
//   organizationName: string,
//   logoUrl: string
// ): Promise<void> {
//   await this.sendEmail(
//     {
//       to: email,
//       subject: 'Your Token is Next!',
//       template: 'next-notify-token-user', 
//     },
//     {
//       name,
//       tokenNumber,
//       estimatedMinutes,
//       organizationName,
//       logoUrl,
//       year: this.currentYear,
//     }
//   );
// }

// }