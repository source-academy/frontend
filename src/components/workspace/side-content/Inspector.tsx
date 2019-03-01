import * as React from 'react'
// import { createContext } from '../../../utils/slangHelper';

class Inspector extends React.Component<{}, {}> {
  private $parent: HTMLElement | null
  
  public componentDidMount() {
      if (this.$parent) {
        (window as any).Inspector.init(this.$parent)
      }
    }

  public render() {
    return ( 
        <div ref={r => (this.$parent = r)} className="sa-inspector" />
    )
  }
}

export default Inspector
