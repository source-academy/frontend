import { Button, Card, IconName, Tooltip } from '@blueprintjs/core';
import * as React from 'react';

/**
 * @property tabs an Array of SideContentTabs,
 *   which must be non-empty i.e contain at least one SideContentTab
 */
export type SideContentProps = {
  activeTab: number;
  tabs: SideContentTab[];
  handleChangeActiveTab: (aT: number) => void;
};

export type SideContentTab = {
  label: string;
  icon: string;
  body: JSX.Element;
};

class SideContent extends React.PureComponent<SideContentProps, {}> {
  public render() {
    /**
     * The check here prevents a runtime error when the activeTab is momentarily out of
     * bounds of this.props.tabs length. It is set to 0 becuase of the asssumption that tabs
     * is at least length 1 (@see SideContentProps)
     */
    const activeTab =
      this.props.activeTab < 0 || this.props.activeTab >= this.props.tabs.length
        ? 0
        : this.props.activeTab;
    return (
      <div className="side-content">
        <Card>
          {this.renderHeader()}
          <div className="side-content-text">{this.props.tabs[activeTab].body}</div>
        </Card>
      </div>
    );
  }

  private renderHeader() {
    if (this.props.tabs.length < 2) {
      return <></>;
    } else {
      const click = (i: number) => () => this.props.handleChangeActiveTab(i);
      const buttons = this.props.tabs.map((tab, i) => (
        <Tooltip key={i} content={tab.label}>
          <Button
            className="side-content-header-button"
            icon={tab.icon as IconName}
            minimal={true}
            onClick={click(i)}
            active={i === this.props.activeTab}
          />
        </Tooltip>
      ));
      return (
        <>
          <div className="side-content-header">{buttons}</div>
          <hr />
        </>
      );
    }
  }
}

export default SideContent;
