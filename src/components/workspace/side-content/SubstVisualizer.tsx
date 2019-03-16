import { Node } from 'estree';
import { Context } from 'js-slang';
import * as React from 'react';
import { ISubstTimelineProps, ISubstTimelineState, SubstTimeline } from './../../SubstTimeline';

class SubstVisualizer extends React.Component<ISubstTimelineProps, ISubstTimelineState> {

  private timeline : SubstTimeline | null;
  
  constructor(props : ISubstTimelineProps) {
    super(props);
}

  public componentDidMount() {
    
    if (this.timeline) {
      (window as any).SubstTimeline = this.timeline;
    }
  }

  public updateTrees(newTrees : Array<[Node, Context]>) {
    if (this.timeline) {
      this.timeline.updateTrees(newTrees);
    }
  }

  public render() {
    return <div> <SubstTimeline ref={x => this.timeline = x}/></div>;
  }
}

export default SubstVisualizer;
