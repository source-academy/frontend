import { ListVisualizerMain } from './ListVisualizerMain';
import { Data } from './ListVisualizerTypes';

type SetVis = (vis: React.ReactNode[]) => void;

export default class ListVisualizer {
    private static setVisualization: SetVis;
    private static vis: ListVisualizerMain = new ListVisualizerMain();

    static init(setVisualization: SetVis): void {
        ListVisualizer.setVisualization = setVisualization;
    }

    static draw(structures: Data[]): void {
        if (!ListVisualizer.setVisualization) {
            throw new Error('List visualizer not initialized');
        }
        const stages = ListVisualizer.vis.createDrawings(structures);
        ListVisualizer.setVisualization(stages);
    }

    static clear(): void {
        ListVisualizer.vis.clear();
    }
}
