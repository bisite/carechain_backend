// App view

"use strict";

import { Assets } from "../assets";
import { Config } from "../config";
import { escapeDoubleQuotes, escapeHTML } from "../utils/text-utils";
import { getResourcesScript } from "../utils/language-utils";
import { FontAwesome } from "../utils/font-awesome";

/**
 * App view.
 */
export class AppView {

    public static async render(response: Express.Response, title: string, description: string, darkTheme: boolean): Promise<string> {
        const html = [];

        html.push(`<!DOCTYPE html>`);
        html.push(`<html lang="${escapeDoubleQuotes(response.getLocale())}">`);

        /* Head section */
        html.push(`<head>`);

        // Title
        html.push(`<title>${escapeHTML(title)}</title>`);

        // Meta tags
        html.push(`<meta name="description" content="${escapeHTML(description)}">`);
        html.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
        html.push(`<meta name="theme-color" content="green">`);

        // Favicon
        html.push(`<link rel="shortcut icon" type="image/png" href="${Assets.versioned("/images/favicon.png")}">`);

        // Canonical URL
        html.push(`<link rel="canonical" href="${Config.getInstance().getAbsoluteURI("/")}">`);
        html.push(`<link rel="shortlink" href="${Config.getInstance().getAbsoluteURI("/")}">`);

        // Styles
        const styles = [];

        // Style libraries
        styles.push(Assets.versioned("/vendor/datepicker/index.css"));
        styles.push(Assets.versioned("/vendor/vue2-leaflet/leaflet.css"));
        styles.push(Assets.versioned("/vendor/leaflet-geosearch/geosearch.css"));
        styles.push(FontAwesome.getAsset());
        styles.push(Config.getInstance().isProduction ? Assets.versioned("/css/main.min.css") : Assets.versioned("/css/main.css"));
        styles.push(Config.getInstance().isProduction ? Assets.versioned("/css/cleverus.min.css") : Assets.versioned("/css/cleverus.css"));
        styles.push(Config.getInstance().isProduction ? Assets.versioned("/css/lib/bootstrap.min.css") : Assets.versioned("/css/lib/bootstrap.css"));
        styles.push(Config.getInstance().isProduction ? Assets.versioned("/css/lib/bootstrap-vue.min.css") : Assets.versioned("/css/lib/bootstrap-vue.css"));


        for (const style of styles) {
            html.push(`<link rel="stylesheet" media="screen" href="${Assets.versioned(style)}">`);
        }

        // Scripts

        html.push(getResourcesScript(response));

        html.push(`<script src="${Assets.versioned("/vendor/jquery/jquery.min.js")}" type="text/javascript" defer></script>`);

        html.push(`<script src="${Assets.versioned("/vendor/bootstrap/js/bootstrap.bundle.min.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/vendor/jquery-easing/jquery.easing.min.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/vendor/popper/popper.min.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/vendor/chart.js/Chart.min.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/vendor/chart.js/Chart.bundle.min.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/vendor/vue2-leaflet/leaflet.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/vendor/vue2-leaflet/vue2-leaflet.min.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/vendor/leaflet-geosearch/geosearch.umd.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Config.getInstance().isProduction ? Assets.versioned("/vendor/vue/vue.min.js") : Assets.versioned("/vendor/vue/vue.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Config.getInstance().isProduction ? Assets.versioned("/vendor/vue/bootstrap-vue.min.js") : Assets.versioned("/vendor/vue/bootstrap-vue.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Config.getInstance().isProduction ? Assets.versioned("/vendor/vue/bootstrap-vue.min.js") : Assets.versioned("/vendor/vue/vue-router.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Config.getInstance().isProduction ? Assets.versioned("/js/main.min.js") : Assets.versioned("/js/main.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/vendor/datepicker/index.min.js")}" type="text/javascript" defer></script>`);
        
        html.push(`<script src="${Assets.versioned("/vendor/vue-horizontal/vue-horizontal.min.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/vendor/vue-horizontal/smoothcontrol.js")}" type="text/javascript" defer></script>`);

        // Control
        html.push(`<script src="${Assets.versioned("/js/control/auth.js")}" type="text/javascript" defer></script>`);

        // Utils
        html.push(`<script src="${Assets.versioned("/js/utils/assets.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/utils/requests.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/utils/date.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/utils/cookie.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/utils/snackbar.js")}" type="text/javascript" defer></script>`);

        // Routes
        html.push(`<script src="${Assets.versioned("/js/vue/app-routes.js")}" type="text/javascript" defer></script>`);

        // Components
        html.push(`<script src="${Assets.versioned("/js/vue/components/modals.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/forms.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/tables.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/charts.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/toolbars.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/header.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/footer.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/maps.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/utils.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/dashboard.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/admin-dashboard.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/partner-dashboard.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/sidebars.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/home.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/events.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/components/loading.js")}" type="text/javascript" defer></script>`);
        html.push(`<script src="${Assets.versioned("/js/vue/app.js")}" type="text/javascript" defer></script>`);
        
        
        html.push(`</head>`);

        /* Body section */
        html.push(`<body class="${darkTheme}">`);

        html.push(`<div id="vapp">`);
        {
            // Loading screen
            html.push(`<div class="loading-screen" v-if="loading || checkingAuth">`);
            {
                html.push(`<div class="loading-screen-row">`);
                html.push(`<h1><img class="loading-logo-img" src="${Assets.versioned("/static/images/cleverus-white.svg")}" alt="Cleverus" /></h1>`);
                html.push(`</div>`);
                html.push(`<div class="loading-screen-row">`);
                html.push(`<div class="app-loader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`);
                html.push(`</div>`);
            }

            html.push(`</div>`);


            html.push(`<div class="app-wrap">`);
            {
                html.push(`<router-view ref="routerView"></router-view>`);
            }
            html.push(`</div>`);

            html.push(`<app-footer></app-footer>`);

            // Modals
            html.push(`<add-partner-modal id="addPartnerModalMain" ref="addPartnerModalMain"></add-partner-modal>`);
            html.push(`<invite-partner-modal id="invitePartnerModal" ref="showInviteModal"></invite-partner-modal>`);
            html.push(`<view-card-modal id="showCardModal" ref="showCardModal"></view-card-modal>`);
            html.push(`<buy-service-modal id="buyServiceModal" ref="showBuyServiceModal"></buy-service-modal>`);
        }
        html.push(`</div>`);

        
        html.push(`<script type="text/javascript">window.Languages = ${JSON.stringify(Config.getInstance().languages)};</script>`);
        
        // Snackbar
        html.push('<div id="snackbar"></div>');

        html.push(`</body>`);

        html.push(`</html>`);

        return html.join("\n");
    }
}
