import { GameImage, screenSize } from '../commons/CommonsTypes';
import { modeMenuBanner, modeButton } from './GameModeMenuTypes';

class GameModeMenu {

    private modeButtons: Array<GameImage>;

    constructor() {
        this.modeButtons = new Array<GameImage>();

        // Menu Banner is always rendered first, so it is always the first element
        this.modeButtons.push(modeMenuBanner);
    }

    public addModeButton(modeName: string): void {
        const numberOfExistingModes = this.modeButtons.length - 1;
        const newNumberOfPartition = numberOfExistingModes + 2;
        const partitionSize = screenSize.x / newNumberOfPartition;

        const yPos = screenSize.y * 3 / 4;
        const newXPos = partitionSize / 2;

        // Reposition existing buttons, except the banner
        for (let i = 1; i < this.modeButtons.length; i++) {
            this.modeButtons[i] = { 
                ...this.modeButtons[i], 
                xPos: (newXPos + (i - 1) * partitionSize) 
            };
        }

        // Add the new button
        const newModeButton: GameImage = {
            ...modeButton,
            key: modeName,
            xPos: (newXPos + this.modeButtons.length * partitionSize),
            yPos: yPos
        };
        this.modeButtons.push(newModeButton);
    }

    public getModeButtons(): Array<GameImage> {
        return this.modeButtons;
    }
}

export default GameModeMenu;