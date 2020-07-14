import FontAssets from '../../assets/FontAssets';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { HexColor } from '../../utils/StyleUtils';

export const roomDefaultCode = `
import { prepend_remote_url, get_screen_width, get_screen_height, load_image, create_image, create_text, create_rect, add, set_display_size, set_alpha, set_origin } from 'game';

function preload() {
    load_image("galaxy", prepend_remote_url("/locations/galaxy/normal.png"));
}

function create() {
    const width = get_screen_width();
    const height = get_screen_height();
    const centre_x = width / 2;
    const centre_y = height / 2;

    const image = create_image(centre_x, centre_y, "galaxy");
    const image_resized = set_display_size(image, width, height);

    const black_tint = create_rect(centre_x, centre_y, width, height, 0x000011);
    const black_tint_alpha = set_alpha(black_tint, 0.5);

    const text = create_text(centre_x, centre_y, "Unable to fetch mission!");
    const text_repos = set_origin(text, 0.5, 0.5);

    add(image_resized);
    add(black_tint_alpha);
    add(text_repos);
}

function update() {}
`;

export const verifiedStyle: BitmapFontStyle = {
  key: FontAssets.educatedDeersFont.key,
  size: 40,
  fill: HexColor.paleYellow,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const verifiedText = 'VERIFIED';
export const startTextXPos = verifiedText.length * verifiedStyle.size * 0.4;
