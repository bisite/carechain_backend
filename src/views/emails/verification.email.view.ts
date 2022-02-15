// Verification email

"use strict";

import { User } from "../../models/user";
import { escapeDoubleQuotes, escapeHTML } from "../../utils/text-utils";

/**
 * Email: Verification
 */
export class VerificationEmailView {
    /**
     * Renders the view.
     * @param activeUser The active user, or null if there is not an active user.
     */
    public static render(response: any, user: User, urlToRedirect: string): string {
        let html = "";

        html += `<!DOCTYPE html>`;
        html += `<html>`;
        html += `   <head>`;
        html += `       <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />`;
        html += `       <meta http-equiv="Cache-control" content="no-cache">`;
        html += `       <title>${response.__("Cleverus") + " - " + response.__("Verify your email")}</title>`;
        html += `   </head>`;
        html += `   <body>`;
        html += `       <h2>${response.__("Cleverus") + " - " + response.__("Verify your email")}</h2>`;
        html += `       <p>${response.__("Hi {0}, Welcome to Cleverus. In order to complete your registration, follow the link below.").replace("{0}", escapeHTML(user.username))}</p>`;
        html += `       <p><a href="${escapeDoubleQuotes(urlToRedirect)}" target="_blank">${escapeHTML(urlToRedirect)}</a></p>`;
        html += `   </body>`;
        html += `</html>`;

        return html;
    }

    /**
     * Renders the email as plain text.
     */
    public static renderText(response: any, user: User, urlToRedirect: string): string {
        let text = "";

        text += `${response.__("Cleverus") + " - " + response.__("Verify your email")}` + `\n`;
        text += `` + `\n`;
        text += `${response.__("Hi {0}, Welcome to Cleverus. In order to complete your registration, follow the link below.").replace("{0}", escapeHTML(user.username))}` + `\n`;
        text += `${escapeHTML(urlToRedirect)}` + `\n`;

        return text;
    }

}