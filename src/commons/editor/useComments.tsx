import { require as acequire, Ace } from 'ace-builds';
import * as React from 'react';
import ReactDOM from 'react-dom';

import { groupBy, map } from 'lodash';

import { EditorHook } from './Editor';
import Comments, { IComment } from './Comments';
const LineWidgets = acequire("ace/line_widgets").LineWidgets;

// Inferred from: https://github.com/ajaxorg/ace/blob/master/lib/ace/ext/error_marker.js#L129
interface IWidget {
    row: number;
    fixedWidth: boolean;
    coverGutter: boolean;
    el: Element;
    type: string;
}

interface ILineManager {
    attach: (editor: Ace.Editor) => void;
    addLineWidget: (widget: IWidget) => void;
    removeLineWidget: (widget: IWidget) => void;
}

const useComments: EditorHook = (inProps, outProps, keyBindings, reactAceRef, contextMenuHandlers) => {
    const [comments, setComments] = React.useState([] as IComment[]);

    const widgetManagerRef: React.MutableRefObject<ILineManager | null> = React.useRef(null);
    React.useEffect(() => {
        if (!reactAceRef.current) { return; }
        const editor = reactAceRef.current!.editor;
        widgetManagerRef.current = new LineWidgets(editor.session);
        widgetManagerRef.current!.attach(editor)
    }, [reactAceRef])

    const createCommentPrompt = React.useCallback((row) => {
        console.log('@@@', comments);
        setComments([...comments,
        {
            isEditing: true,
            isCollapsed: false,
            username: 'My user name',
            profilePic: 'https://picsum.photos/200',
            linenum: row,
            text: '',
            datetime: 0, // Not submitted yet! 
        }]);
    }, [comments]);

    contextMenuHandlers.createCommentPrompt = createCommentPrompt;
    console.log('Re-binding createCommentPrompt', comments);

    // Render comments.
    React.useEffect(() => {
        // React can't handle the rendering because it's going into 
        // an unmanaged component.
        // Also, the line number changes externally, so extra fun.
        // TODO: implement line number changes for comments.
        // TODO: Put a minimize/maximize button. 

        // Re-render all comments.
        console.log('Re-rendering comments', comments);
        const commentsWithIdx = map(comments, (c, idx) => [c, idx] as [IComment, number]);
        const commentsByLine = groupBy(commentsWithIdx, ([c, _]) => c.linenum);
        const commentsWidgets = map(commentsByLine, ((commentsOnLine) => {

            const container = document.createElement('div');
            container.style.maxWidth = '40em';
            // container.style.backgroundColor = 'grey';
            const widget: IWidget = {
                row: comments[0].linenum, // Must exist.
                fixedWidth: true,
                coverGutter: true,
                el: container,
                type: "errorMarker"
            };
            ReactDOM.render((<Comments
                allComments={comments}
                comments={commentsOnLine}
                setComments={setComments} />), container);
            widgetManagerRef.current?.addLineWidget(widget);
            console.log('added line widget', widget);
            return widget;
        }));


        return () => {
            // Remove all comments
            console.log('Removing comments', comments);
            commentsWidgets.forEach((widget) => {
                widgetManagerRef.current?.removeLineWidget(widget);
            })
        }
    }, [comments])

};

export default useComments;
