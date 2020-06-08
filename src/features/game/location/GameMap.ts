import { GameLocation } from '../location/GameMapTypes';

class GameMap {
    private navigation: Map<string, string[]>;
    private locations: Map<string, GameLocation>;

    constructor() {
        this.navigation = new Map<string, string[]>();
        this.locations = new Map<string, GameLocation>();
    }
    
    public setNavigationFrom(id: string, destination: string[]) {
        this.navigation.set(id, destination);
    }
    
    public getNavigationFrom(id: string): string[] | undefined {
        return this.navigation.get(id);
    }

    public setLocation(location: GameLocation): void {
        this.locations.set(location.key, location);
    }

    public getLocation(id: string): GameLocation | undefined {
        return this.locations.get(id);
    }
    
    public getLocations(): Map<string, GameLocation> {
        return this.locations;
    }
}

export default GameMap;