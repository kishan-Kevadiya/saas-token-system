"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailer_express_handlebars_1 = __importDefault(require("nodemailer-express-handlebars"));
const express_handlebars_1 = require("express-handlebars");
const moment_1 = __importDefault(require("moment"));
class EmailNotificationService {
    transporter;
    config;
    constructor(config) {
        if (config) {
            this.initialize(config);
        }
    }
    initialize(config) {
        this.config = config;
        this.transporter = nodemailer_1.default.createTransport({
            host: config.smtpHost,
            port: config.smtpPort,
            auth: {
                user: config.smtpUsername,
                pass: config.smtpPassword,
            },
            secure: config.smtpSecure,
            logger: console,
            debug: false,
        });
        const viewEngineHandlebarConfig = (0, express_handlebars_1.create)({
            layoutsDir: path_1.default.resolve(__dirname, 'templates'),
            extname: '.hbs',
            defaultLayout: false,
        });
        const handlebarOptions = {
            viewEngine: viewEngineHandlebarConfig,
            viewPath: path_1.default.resolve(__dirname, 'templates'),
            extName: '.hbs',
        };
        this.transporter.use('compile', (0, nodemailer_express_handlebars_1.default)(handlebarOptions));
    }
    async sendEmail(mail, context) {
        if (!this.transporter || !this.config) {
            console.warn('Email config is not set. Skipping sendEmail.');
            return;
        }
        const mailOptions = {
            from: this.config.smtpUsername,
            to: mail.to,
            subject: mail.subject,
            template: mail.template,
            context,
            templateOptions: {
                layout: false,
            },
        };
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: ', info.response);
        }
        catch (error) {
            console.error('Error sending email:', error);
        }
    }
    currentYear = (0, moment_1.default)().year();
    async sendTokenCallNotification(email, name, tokenNumber, counterNumber, organizationName, logoUrl, year) {
        await this.sendEmail({
            to: email,
            subject: 'Your Token Has Been Called!',
            template: 'notify-called-token-user',
        }, {
            name,
            tokenNumber,
            counterNumber,
            organizationName,
            logoUrl,
            year,
        });
    }
    async sendTokenNextNotification(email, name, tokenNumber, estimatedMinutes, organizationName, logoUrl) {
        await this.sendEmail({
            to: email,
            subject: 'Your Token is Next!',
            template: 'next-notify-token-user',
        }, {
            name,
            tokenNumber,
            estimatedMinutes,
            organizationName,
            logoUrl,
            year: this.currentYear,
        });
    }
}
exports.default = EmailNotificationService;
//# sourceMappingURL=email-notifications.service.js.map