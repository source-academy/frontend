import { GameButton, screenSize } from '../commons/CommonsTypes';
import { modeMenuBanner, modeButton } from './GameModeMenuTypes';
import { GameMode } from '../mode/GameModeTypes';

class GameModeMenu {

    private modeButtons: Array<GameButton>;
    readonly modeButtonYPos = screenSize.y * 0.80;

    constructor() {
        this.modeButtons = new Array<GameButton>();

        // Menu Banner is always rendered first, so it is always the first element
        const banner = { 
            assetKey: modeMenuBanner.key,
            assetXPos: modeMenuBanner.xPos,
            assetYPos: modeMenuBanner.yPos
        } as GameButton;
        this.modeButtons.push(banner);
        
    }

    public addModeButton(modeName: GameMode): void {

        // -1 since we do not count banner, +1 to add the new button
        const newNumberOfButtons = this.modeButtons.length;
        const partitionSize = screenSize.x / newNumberOfButtons;

        const newXPos = partitionSize / 2;

        // Reposition existing buttons, except the banner
        for (let i = 1; i < this.modeButtons.length; i++) {
            this.modeButtons[i] = { 
                ...this.modeButtons[i], 
                assetXPos: (newXPos + (i - 1) * partitionSize) 
            };
        }

        // Add the new button
        const newModeButton: GameButton = {
            text: modeName,
            assetKey: modeButton.key,
            assetXPos: (newXPos + (this.modeButtons.length - 1) * partitionSize),
            assetYPos: this.modeButtonYPos
        };
        this.modeButtons.push(newModeButton);
    }

    public getModeButtons(): Array<GameButton> {
        return this.modeButtons;
    }
}

export default GameModeMenu;