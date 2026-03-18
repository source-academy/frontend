import {Stage } from 'react-konva';

import { Config } from './Config';
import { Data, Step } from './dataVisualizerTypes';
import { Tree } from './tree/Tree';
import { DataTreeNode } from './tree/TreeNode';

/**
 * The data visualizer class.
 * Exposes three function: init, drawData, and clear.
 *
 * init is used by SideContentDataVisualizer as a hook.
 * drawData is the draw_data function in source.
 * clear is used by WorkspaceSaga to reset the visualizer after every "Run" button press
 */
export default class DataVisualizer {
  private static counter = 1;
  private static empty(step: Step[]) {}
  private static setSteps: (step: Step[]) => void = DataVisualizer.empty;
  public static dataRecords: Data[] = [];
  public static isRedraw: boolean = false;
  private static _instance = new DataVisualizer();
  public static treeMode: boolean = false;
  public static BinTreeMode: boolean = false;
  public static normalMode: boolean = true;
  private static dataList: Data []=[]; 
  public static binaryTreeDepth: number = 0;
  public static isBinTree: boolean = false;
  public static isGenTree: boolean = false;
  public static nodeCount:number[]=[];


  private steps: Step[] = [];
  private nodeLabel = 0;
  private nodeToLabelMap: Map<DataTreeNode, number> = new Map();

  private constructor() {}

  public static get_depth(structures: Data[], depth:number,nodePos:number): number { //works assuming is a binary tree
    //let depth=0;
    if (!(structures instanceof Array)){
      return 0;
    }
    structures.push(nodePos);
    if (structures[1]===null){
      //nodeCount keeps track of the most number of elements at each dept
      console.log(this.nodeCount);
      if (this.nodeCount[depth]===undefined){
        this.nodeCount[depth]=0;
      }
      this.nodeCount[depth]=Math.max(this.nodeCount[depth],nodePos);
      //console.log(structures);
      console.log(this.nodeCount);
      console.log("end: "+"nodePos:"+nodePos+" d:"+depth);
      console.log(this.nodeCount);
    }

      console.log("n:"+structures[0]+" d:"+depth);
      this.binaryTreeDepth=Math.max(this.binaryTreeDepth,depth);
      this.get_depth(structures[0],depth+1, 0);
      this.get_depth(structures[1],depth,nodePos+1);
      return depth;

    
  }

  //modify to check for general trees too, make sure no pairs
  public static isBinaryTree(structures: Data[]): boolean { //modify for non trees too
    if (structures[0]===null){
      return true;
    }
    let next=structures[0];
    let ans=false
    let count=0;
    while(next instanceof Array){
      count++;
      next=next[1];
    }
    if (count==3){
      ans=true
    }
    return ans&&this.isBinaryTree(structures[0][1]);
  }

  public static isGeneralTree(structures: Data[]): boolean {
    if (structures == null) {
      return true;
    }
    if (structures.length > 2 || (!(structures[1] instanceof Array) && structures[1] != null)) {
      return false;
    }
    return this.isGeneralTree(structures[1]) && this.isGeneralTree(structures[0]);
  }

  public static init(setSteps: (step: Step[]) => void): void {
    DataVisualizer.setSteps = setSteps;
  }

  // RenderBinaryTree
  public static toggleBinTreeMode(): void {
    DataVisualizer.BinTreeMode = !DataVisualizer.BinTreeMode;
  }

  // RenderGeneralTree
  public static toggleTreeMode(): void {
    DataVisualizer.treeMode = !DataVisualizer.treeMode;
  }

  // OriginalView
  public static toggleNormalMode(): void {
    DataVisualizer.normalMode = !DataVisualizer.normalMode;
  }

  public static getBinTreeMode(): boolean {
    return DataVisualizer.BinTreeMode;
  }

  public static getTreeMode(): boolean {
    return DataVisualizer.treeMode;
  }

  public static getNormalMode(): boolean {
    return DataVisualizer.normalMode;
  }

  public static drawData(structures: Data[]): void {
    if (!DataVisualizer.setSteps) {
      throw new Error('Data visualizer not initialized');
    }
    if (!DataVisualizer.isRedraw){
      this.dataRecords.push(structures);
    }
    console.log(structures);
    DataVisualizer.isBinTree=this.isBinaryTree(structures);
    DataVisualizer.isGenTree=this.isGeneralTree(structures);
      this.get_depth(structures[0],0,0);
      console.log('Binary tree depth: ' + DataVisualizer.binaryTreeDepth);
      console.log(structures);
      console.log("nodeCount: " + this.nodeCount);
    

    this.dataList=structures;
    DataVisualizer._instance.addStep(structures);
    DataVisualizer.setSteps(DataVisualizer._instance.steps);
  }

  public static clearWithData(): void {
    DataVisualizer.dataRecords = [];
    DataVisualizer.isRedraw = false;
    DataVisualizer.clear();
  }

  public static clear(): void {
    DataVisualizer._instance = new DataVisualizer();
    this.nodeCount=[];
    this.binaryTreeDepth=0;
    DataVisualizer.setSteps(DataVisualizer._instance.steps);
  }

  public static displaySpecialContent(dataNode: DataTreeNode): number {
    return DataVisualizer._instance.displaySpecialContent(dataNode);
  }

  private displaySpecialContent(dataNode: DataTreeNode): number {
    if (this.nodeToLabelMap.has(dataNode)) {
      return this.nodeToLabelMap.get(dataNode) ?? 0;
    } else {
      console.log('*' + this.nodeLabel + ': ' + dataNode.data);
      this.nodeToLabelMap.set(dataNode, this.nodeLabel);
      return this.nodeLabel++;
    }
  }

  private addStep(structures: Data[]) {
    const step = structures.map(xs => this.createDrawing(xs));
    this.steps.push(step);
  }

  /**
   *  For student use. Draws a structure by converting it into a tree object, attempts to draw on the canvas,
   *  Then shift it to the left end.
   */
  private createDrawing(xs: Data): JSX.Element {
    const treeDrawer = Tree.fromSourceStructure(xs).draw();

    // To account for overflow to the left side due to a backward arrow
    // const leftMargin = Config.ArrowMarginHorizontal + Config.StrokeWidth;
    const leftMargin = (Config.StrokeWidth / 2);

    // To account for overflow to the top due to a backward arrow
    const topMargin = Config.StrokeWidth / 2;

    const layer = treeDrawer.draw(leftMargin, topMargin);
    //const treeLayer=treeDrawer.draw(leftMargin, topMargin, true);
    // if (DataVisualizer.treeMode){
    //   layer=treeLayer;
    // }
    // me added, below is + leftMargin for default extra space on the right, and + one node width cuz gotta include the very root node


    //for normal mode
    if (DataVisualizer.normalMode){
      return (
        <Stage key={xs} width={treeDrawer.width + leftMargin} height={treeDrawer.height + topMargin}>
          {layer}
        </Stage>
      )
    }
    // NON-BINARY TREE WARNING
    if(!DataVisualizer.isBinTree&&DataVisualizer.BinTreeMode){
      return (
        <Stage key={xs} width={400} height={100}>
           {layer}
         </Stage>
      )
    }
    if (!DataVisualizer.isGenTree&&DataVisualizer.treeMode){
      return (
        <Stage key={xs} width={400} height={100}>
           {layer}
         </Stage>
      )
    }
    if (DataVisualizer.getBinTreeMode()) { // RenderBinaryTree
      const EY1 = Math.max(treeDrawer.leftCOUNTER, treeDrawer.rightCOUNTER);
      const EY2 = 2 * (Math.pow(2, EY1 - 1) - 1) + 1; // how many nodegroups stretch left or right (not including root)
      const EY3 = treeDrawer.downCOUNTER - 1; // how many node groups stretch down
      return (
        <Stage key={xs} width={(EY2 * Config.NWidth) * 2 + leftMargin * 2 + Config.NWidth} height={(EY3 * Config.DistanceY * 2) + (EY3 * Config.BoxHeight * 2) + Config.BoxHeight * 3 + topMargin * 2}>
          {layer}
        </Stage>
      );
    }
    else if (DataVisualizer.getTreeMode()) { // RenderGeneralTree
      const L = DataVisualizer.nodeCount[0];
      const EY4 = (Config.NWidth + Config.BoxWidth) * (L + 1) * Math.pow(L, DataVisualizer.binaryTreeDepth) - Config.BoxWidth; // GP Term, minus extra blank space of box width at the end
      const EY3 = treeDrawer.downCOUNTER;
      return (
        <Stage key={xs} width={(EY4) + leftMargin * 2} height={(EY3 * Config.BoxHeight * 4) + Config.BoxHeight + topMargin * 2}>
          {layer}
        </Stage>
      );
    }
    else { // OriginalView
      return (
        <Stage key={xs} width={treeDrawer.width + leftMargin} height={treeDrawer.height + topMargin}>
          {layer}
        </Stage>
      );
    }
    
  }
  static redraw(){
    this.isRedraw=true;
    this.clear();
    DataVisualizer.counter = - DataVisualizer.counter;
    return DataVisualizer.dataRecords.map(structures => this.drawData(structures));
    //return this.drawData(this.dataList);
  }

}
