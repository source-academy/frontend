import { ListVisualizerMain } from './ListVisualizerMain';

type SetVis = (vis: React.ReactNode) => void;

export default class ListVisualizer {
    private static setVisualization: SetVis;
    private static vis: ListVisualizerMain = new ListVisualizerMain();

    static init(setVisualization: SetVis): void {
        ListVisualizer.setVisualization = setVisualization;
    }

    static draw(data: any): void {
        if (!ListVisualizer.setVisualization) {
            throw new Error('List visualizer not initialized');
        }
        ListVisualizer.setVisualization(ListVisualizer.vis.draw(data));
    }
}
