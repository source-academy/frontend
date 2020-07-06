import { require as acequire, Ace } from 'ace-builds';
import * as React from 'react';
import ReactDOM from 'react-dom';

import { groupBy, map, omit, sortBy, values, keyBy } from 'lodash';

import { EditorHook } from './Editor';
import Comments, { IComment } from './Comments';
import { v1 as uuidv1 } from 'uuid';
import { EventEmitter } from 'events';
const LineWidgets = acequire('ace/line_widgets').LineWidgets;

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

export interface CommentAPI {
  // Assumes commentId is immutable. Do not update it unless explicitly via API.
  updateComment: (...comments: IComment[]) => void;
  updateCommentsBeingEdited: (...comments: IComment[]) => void;
  removeComment: (comment: IComment) => void;
  removeCommentEdit: (comment: IComment) => void;
  // Probably need a replaceId for comments to update when the server does.

  isUnsubmittedComment: (comment: IComment) => boolean;
}

/*  NOTE ON INTEGRATION WITH SERVER SIDE:

All the data is bound in this component so that it can easily be updated from server side.

I'm guessing that useCallback + ref can be used to pass real time updates in.

Specifically:

```

const onExternalDataRef = React.useState((data: dataT) => {});
const onExternalData = React.useCallback( (data: dataT) => {
    // ...  setState( ... ) ... 
}, [comments, etc.]);
onExternalDataRef.current = onExternalData;

React.useEffect(() => {
    externalService.on('data', (data) => onExternalDataRef.current(data));
}, [onExternalDataRef])

```

Also note that for the comment ID, the server should not trust the 
ID being sent to be globally unique.
- Not cryptographically secure
- Even if it was, the user can just send a known collision.

Discard everything except following:
- id (for update purposes, but ignore it for new comments)
- text
- linenum

*/

const useComments: EditorHook = (
  inProps,
  outProps,
  keyBindings,
  reactAceRef,
  contextMenuHandlers
) => {
  const [comments, setComments] = React.useState({} as { [id: string]: IComment });
  // Comments being edited are copies of existing comments.
  const [commentsBeingEdited, _setCommentsBeingEdited] = React.useState(
    {} as { [id: string]: IComment }
  );

  // This is an irritating design decision to make.
  // 1) The parent component CANNOT be re-rendered when the commentsBeingEdited changes.
  // This is because it nukes the frame, including the focus when the user is typing.
  // 2) The commentsBeingEdited need to here so that incoming data can be managed easily.
  // 3) commentsBeingEditedRef cannot trigger changes by default, so it needs an event to trigger it.
  const [commentEditChangeEE] = React.useState(new EventEmitter());
  // The following events are emitted:
  // change(current: typeof commentsBeingEdited)
  // delete(current: typeof commentsBeingEdited, idOfDeleted: string)
  // change event is ALWAYS emitted when anything changes.
  const setCommentsBeingEdited = React.useCallback(
    (x: { [id: string]: IComment }) => {
      _setCommentsBeingEdited(x);
      // The updated version needs to be emitted
      // Otherwise an older version will be gotten from commentsBeingEditedRef.current.
      // Possibly: commentsBeingEditedRef will only refresh on nextTick
      commentEditChangeEE.emit('change', x);
    },
    [commentEditChangeEE]
  );
  const commentsBeingEditedRef = React.useRef(commentsBeingEdited);
  commentsBeingEditedRef.current = commentsBeingEdited;

  // --------------- API FOR MANIPULATING COMMENTS ---------------
  // TODO: figure out a method to figure if the last item on a given line
  // is an unedited comment.

  const updateComment = React.useCallback(
    (...updatedComments: IComment[]) => {
      const updatedCommentsById = keyBy(updatedComments, 'id');
      setComments({
        ...comments,
        ...updatedCommentsById
      });
    },
    [comments]
  );

  const updateCommentsBeingEdited = React.useCallback(
    (...updatedComments: IComment[]) => {
      const updatedCommentsById = keyBy(updatedComments, 'id');
      setCommentsBeingEdited({
        ...commentsBeingEdited,
        ...updatedCommentsById
      });
    },
    [commentsBeingEdited, setCommentsBeingEdited]
  );

  const removeCommentEdit = React.useCallback(
    (...commentsToRemove: IComment[]) => {
      const ids = commentsToRemove.map(c => c.id);
      const updated = omit(commentsBeingEdited, ids);
      setCommentsBeingEdited(updated);
      commentEditChangeEE.emit('delete', updated, ids);
    },
    [commentEditChangeEE, commentsBeingEdited, setCommentsBeingEdited]
  );

  const removeComment = React.useCallback(
    (...commentsToRemove: IComment[]) => {
      const ids = commentsToRemove.map(c => c.id);
      setComments(omit(comments, ids));
      // Also remove from being edited.
      removeCommentEdit(...commentsToRemove);
    },
    [comments, removeCommentEdit]
  );

  const isUnsubmittedComment = React.useCallback((comment: IComment) => {
    return comment.datetime === Infinity;
  }, []);

  const API: CommentAPI = {
    updateComment,
    updateCommentsBeingEdited,
    removeComment,
    removeCommentEdit,
    isUnsubmittedComment
  };

  const APIRef = React.useRef(API);
  APIRef.current = API;

  // ----------------- ACTUAL OPERATIONS -----------------

  const widgetManagerRef: React.MutableRefObject<ILineManager | null> = React.useRef(null);
  React.useEffect(() => {
    if (!reactAceRef.current) {
      return;
    }
    const editor = reactAceRef.current!.editor;
    widgetManagerRef.current = new LineWidgets(editor.session);
    widgetManagerRef.current!.attach(editor);
  }, [reactAceRef]);

  const createCommentPrompt = React.useCallback(
    row => {
      console.log('@@@', comments);
      const id = uuidv1();
      const newcomment = {
        id,
        isCollapsed: false,
        username: 'My user name',
        profilePic: 'https://picsum.photos/200',
        linenum: row,
        text: '',
        datetime: Infinity
        // Not submitted yet!
        // Will sort to the end.
      };
      setComments({
        ...comments,
        [id]: newcomment
      });
      setCommentsBeingEdited({
        ...commentsBeingEdited,
        [id]: newcomment
      });
    },
    [comments, commentsBeingEdited, setCommentsBeingEdited]
  );

  contextMenuHandlers.createCommentPrompt = createCommentPrompt;
  console.log('Re-binding createCommentPrompt', comments);

  // ----------------- RENDERING -----------------

  // Render comments.
  React.useEffect(() => {
    // React can't handle the rendering because it's going into
    // an unmanaged component.
    // Also, the line number changes externally, so extra fun.
    // TODO: implement line number changes for comments.
    // TODO: Put a minimize/maximize button.

    // Re-render all comments.
    console.log('Re-rendering comments', comments);
    const commentsByLine = groupBy(values(comments), c => c.linenum);
    const commentsWidgets = map(commentsByLine, commentsOnLineUnsorted => {
      const commentsOnLine = sortBy(commentsOnLineUnsorted, c => c.datetime);
      const container = document.createElement('div');
      container.style.maxWidth = '40em';
      // container.style.backgroundColor = 'grey';
      const widget: IWidget = {
        row: commentsOnLine[0].linenum, // Must exist.
        fixedWidth: true,
        coverGutter: true,
        el: container,
        type: 'errorMarker'
      };
      ReactDOM.render(
        <Comments
          comments={commentsOnLine}
          commentsBeingEditedRef={commentsBeingEditedRef}
          APIRef={APIRef}
          commentEditChangeEE={commentEditChangeEE}
        />,
        container
      );
      widgetManagerRef.current?.addLineWidget(widget);
      console.log('added line widget', widget);
      return widget;
    });

    return () => {
      // Remove all comments
      console.log('Removing comments', comments);
      commentsWidgets.forEach(widget => {
        widgetManagerRef.current?.removeLineWidget(widget);
      });
    };
    // DO NOT re-render when commentsBeingEdited changes.
    // This WILL force re-rendering the entire container.
    // Which means focus will be lost when typing.
    // There will likely be some issues when trying to
    // incoming integrate real-time comments.
  }, [commentEditChangeEE, comments, commentsBeingEditedRef]);
};

export default useComments;
