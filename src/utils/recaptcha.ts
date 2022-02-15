/* Google recaptcha */

import Fetch from "node-fetch";
import { Config } from "../config";
import { Monitor } from "../monitor";

export async function verifyCaptcha(captcha: string, expectedAction: string): Promise<boolean> {
    try {
        const response = await Fetch("https://www.google.com/recaptcha/api/siteverify",
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': "application/json",
                },
                body: JSON.stringify({
                    secret: Config.getInstance().reCaptcha.secret,
                    response: captcha,
                }),
            });
        
        const resBody = await response.json();

        const success = resBody.success;
        const action = resBody.action;

        if (success && action === expectedAction) {
            return true; // Verified
        } else {
            Monitor.debug(JSON.stringify(resBody));
            return false; // Not verified
        }
    } catch (ex) {
        Monitor.exception(ex);
        return true; // If it fails, we supose it is valid
    }
}
