import { Button, Card, IconName, Tooltip } from '@blueprintjs/core'
import * as React from 'react'

interface ISideContentProps {
  activeTab: number
  handleChangeActiveTab: (aT: number) => void
  tabs: SideContentTab[]
}

export type DispatchProps = Pick<ISideContentProps, 'handleChangeActiveTab'>

export type StateProps = Pick<ISideContentProps, 'activeTab'>

export type SideContentTab = {
  label: string
  icon: string
  body: JSX.Element
}

class SideContent extends React.Component<ISideContentProps, {}> {
  public render() {
    return (
      <div className="side-content">
        <Card>
          {this.renderHeader()}
          {this.props.tabs[this.props.activeTab].body}
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
