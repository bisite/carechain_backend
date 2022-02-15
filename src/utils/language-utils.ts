// Language utils

"use strict";

import { Assets } from "../assets";

export function getResourcesScript(response: any): string {
    let html = "";
    html += `<script type="text/javascript" src="${Assets.versioned("/lang/" + response.getLocale() + ".js")}"></script>`;
    html += `<script>`;
    html += `var langData=(window.LOCALE_DATA || {});window.__=function(a,n){if(void 0===n)return langData[a]||a;langData[a]=n};`;
    html += `</script>`;
    return html;
}
