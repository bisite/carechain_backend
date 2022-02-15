// Font awesome utils

'use strit';

import { Assets } from "../assets";

export const FONT_AWESOME_VERSION = "5.15.2";

export class FontAwesome {
    public static getAsset() {
        return Assets.versioned(`/vendor/font-awesome/${FONT_AWESOME_VERSION}/css/all.min.css`);
    }

    public static getFont(name: string) {
        return Assets.raw(`/vendor/font-awesome/${FONT_AWESOME_VERSION}/webfonts/${name}`);
    }
}
