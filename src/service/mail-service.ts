// Reserved for license

"use strict";

import Mailer from "nodemailer";
import { Config } from "../config";
import { User } from "../models/user";
import { Monitor } from "../monitor";
import { CustomEmailView } from "../views/emails/customEmail.view";
import { ResetPasswordEmailView } from "../views/emails/reset.password.email.view";
import { VerificationEmailView } from "../views/emails/verification.email.view";

/**
 * Mail service
 */
export class MailService {
    /* Singleton */

    public static instance: MailService = null;

    public static getInstance(): MailService {
        if (MailService.instance) {
            return MailService.instance;
        } else {
            MailService.instance = new MailService();
            return MailService.instance;
        }
    }

    private mailTransporter: Mailer.Transporter;

    constructor() {
        this.mailTransporter = Mailer.createTransport(Config.getInstance().mailerConfiguration);
    }

    public async sendVerificationEmail(user: User, response: Express.Response) {
        const baseURL = Config.getInstance().getAbsoluteURI("/email/verify");
        const url = baseURL + "?uid=" + encodeURIComponent(user.id) + "&verification=" + encodeURIComponent(user.emailVerificationCode);
        Monitor.debug("Sending verification email to: " + user.email);
        try {
            await this.mailTransporter.sendMail({
                from: `"Cleverus" ${Config.getInstance().mailerConfiguration.from}`,
                to: user.email,
                subject: `Cleverus - ${response.__("Verify your email")}`,
                text: VerificationEmailView.renderText(response, user, url),
                html: VerificationEmailView.render(response, user, url),
            });
            Monitor.debug(`Verification email sent to ${user.email}`);
        } catch (e) {
            Monitor.error("Could not send verification email: " + e.message);
            throw e;
        }
    }

    public async sendResetPasswordEmail(user: User, response: Express.Response) {
        const baseURL = Config.getInstance().getAbsoluteURI("/reset/password");
        const url = baseURL + "?uid=" + encodeURIComponent(user.id) + "&verification=" + encodeURIComponent(user.passwordResetCode);
        Monitor.debug("Sending reset password email to: " + user.email);
        try {
            await this.mailTransporter.sendMail({
                from: `"Cleverus" ${Config.getInstance().mailerConfiguration.from}`,
                to: user.email,
                subject: `Cleverus - ${response.__("Password Reset")}`,
                text: ResetPasswordEmailView.renderText(response, user, url),
                html: ResetPasswordEmailView.render(response, user, url),
            });
            Monitor.debug(`Password reset email sent to ${user.email}`);
        } catch (e) {
            Monitor.error("Could not send password reset email: " + e.message);
            throw e;
        }
    }


    public async sendCustomizedEmail(user: User, subject: string, body: string, response: Express.Response) {
        Monitor.debug("Sending custom email to: " + user.email);
        try {
            await this.mailTransporter.sendMail({
                from: `"Cleverus" ${Config.getInstance().mailerConfiguration.from}`,
                to: user.email,
                subject: subject,
                text: CustomEmailView.renderText(response, body),
                html: CustomEmailView.render(response, body),
            });
            Monitor.debug(`Custom email sent to ${user.email}`);
        } catch (e) {
            Monitor.error("Could not send custom email: " + e.message);
            throw e;
        }
    }
}