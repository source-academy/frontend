import * as React from 'react';
import AceEditor from 'react-ace';
// source mode and chapter imported in Editor.tsx

export interface IReplInputProps {
  replValue: string;
  sourceChapter: number;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleReplValueChange: (newCode: string) => void;
  handleReplEval: () => void;
}

class ReplInput extends React.PureComponent<IReplInputProps, {}> {
  private replInputBottom: HTMLDivElement;
  private execBrowseHistoryDown: () => void;
  private execBrowseHistoryUp: () => void;
  private execEvaluate: () => void;

  constructor(props: IReplInputProps) {
    super(props);
    this.execBrowseHistoryDown = props.handleBrowseHistoryDown;
    this.execBrowseHistoryUp = props.handleBrowseHistoryUp;
    this.execEvaluate = () => {
      this.replInputBottom.scrollIntoView();
      this.props.handleReplEval();
    };
  }

  public componentDidUpdate() {
    if (this.replInputBottom.clientWidth >= window.innerWidth - 50) {
      /* There is a bug where
       *   if the workspace has been resized via re-resizable such that the
       *   has disappeared off the screen, width 63
       * then
       *   calling scrollIntoView would cause the Repl to suddenly take up 100%
       *   of the screen width. This pushes the editor off-screen so that the
       *   user can no longer resize the workspace at all
       * Fix: the if condition is true when the Repl has dissapeared off-screen.
       *   (-15 to account for the scrollbar */
    } else {
      this.replInputBottom.scrollIntoView();
    }
  }

  public getChapterMode() {
    const chapter = this.props.sourceChapter;
    return chapter === undefined ? 'source1' : 'source' + chapter.toString();
  }

  public render() {
    return (
      <>
        <AceEditor
          className="repl-react-ace react-ace"
          mode={this.getChapterMode()}
          theme="source"
          height="1px"
          width="100%"
          value={this.props.replValue}
          onChange={this.props.handleReplValueChange}
          commands={[
            {
              name: 'browseHistoryDown',
              bindKey: {
                win: 'Down',
                mac: 'Down'
              },
              exec: this.execBrowseHistoryDown
            },
            {
              name: 'browseHistoryUp',
              bindKey: {
                win: 'Up',
                mac: 'Up'
              },
              exec: this.execBrowseHistoryUp
            },
            {
              name: 'evaluate',
              bindKey: {
                win: 'Shift-Enter',
                mac: 'Shift-Enter'
              },
              exec: this.execEvaluate
            }
          ]}
          minLines={1}
          maxLines={20}
          fontSize={17}
          highlightActiveLine={false}
          showGutter={false}
          setOptions={{
            fontFamily: "'Inconsolata', 'Consolas', monospace"
          }}
        />
        <div className="replInputBottom" ref={e => (this.replInputBottom = e!)} />
      </>
    );
  }
}

export default ReplInput;
