import { Button, Card, IconName, Tooltip } from '@blueprintjs/core'
import * as React from 'react'

export type SideContentProps = {
  activeTab: number
  tabs: SideContentTab[]
  handleChangeActiveTab: (aT: number) => void
}

export type SideContentTab = {
  label: string
  icon: string
  body: JSX.Element
}

class SideContent extends React.PureComponent<SideContentProps, {}> {
  public render() {
    const activeTab = (this.props.activeTab < 0 || this.props.activeTab >= this.props.tabs.length) 
      ? 0 
      : this.props.activeTab
    return (
      <div className="side-content">
        <Card>
          {this.renderHeader()}
          <div className="side-content-text">{this.props.tabs[activeTab].body}</div>
        </Card>
      </div>
    )
  }

  private renderHeader() {
    if (this.props.tabs.length < 2) {
      return <></>
    } else {
      const click = (i: number) => () => this.props.handleChangeActiveTab(i)
      const buttons = this.props.tabs.map((tab, i) => (
        <Tooltip key={i} content={tab.label}>
          <Button icon={tab.icon as IconName} className="pt-minimal" onClick={click(i)} />
        </Tooltip>
      ))
      return (
        <>
          <div className="side-content-header">{buttons}</div>
          <hr />
        </>
      )
    }
  }
}

export default SideContent
