// Custom email

"use strict";

import { String } from "aws-sdk/clients/apigateway";
import { User } from "../../models/user";
import { escapeDoubleQuotes, escapeHTML } from "../../utils/text-utils";

/**
 * Email: Reset password.
 */
export class CustomEmailView {
    /**
     * Renders the view.
     * @param activeUser The active user, or null if there is not an active user.
     */
    public static render(response: any, body: string): string {
        const bodyRender = body.replace(/[\n\r]/g, "<br>");
        let html = "";

        html += `<!DOCTYPE html>`;
        html += `<html>`;
        html += `   <head>`;
        html += `       <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />`;
        html += `       <meta http-equiv="Cache-control" content="no-cache">`;
        html += `   </head>`;
        html += `   <body>`;
        html += `       ${bodyRender}`;
        html += `   </body>`;
        html += `</html>`;

        return html;
    }

    /**
     * Renders the email plain text.
     */
    public static renderText(response: any, body: string): string {
        let text = "";

        text += `${escapeHTML(body)}`;
        text += `` + `\n`;

        return text;
    }

}