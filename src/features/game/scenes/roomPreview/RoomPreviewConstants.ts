import FontAssets from '../../assets/FontAssets';
import { screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';

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
  key: FontAssets.pixelFont.key,
  size: 20,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const RoomConstants = {
  assessmentNumber: 'MYROOM',
  verifiedText: 'VERIFIED',
  tag: { width: 128, height: 50 },
  hoverTagTextConfig: { x: 64, y: 0, oriX: 0.5, oriY: 0.55 },
  refreshButton: { x: 0.95 * screenSize.x, y: 0.92 * screenSize.y }
};
