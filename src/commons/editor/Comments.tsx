import * as React from 'react';
import CSS from 'csstype'; // TODO: Remove
import { Card, Button, ButtonGroup } from '@blueprintjs/core';
import { format } from 'timeago.js';
import Markdown from '../Markdown';
import { keyBy, omit } from 'lodash';

export interface IComment {
    isEditing: boolean;
    isCollapsed: boolean;
    // TODO: Reference user differently.
    username: string;
    profilePic: string;
    linenum: number;
    text: string;
    datetime: number; // if this is 0, means not submitted yet!
}

export interface CommentsProps {
    allComments: IComment[]; // Need this to use setComments properly.
    comments: Array<[IComment, number]>; // Need the position to update
    setComments: (comments: IComment[]) => void;
}



// =============== STYLES ===============
// TODO: REMOVE.

const commentsContainerStyles: CSS.Properties = {
    display: "grid",
    gridTemplateColumns: "3em auto",
    fontFamily: `-apple-system, "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Open Sans", "Helvetica Neue", "Icons16", sans-serif`,
};

const commentStyles: CSS.Properties = {
    gridColumn: 2,
    display: "grid",
    gridTemplateColumns: "4em auto",
    fontSize: '0.8em',
    backgroundColor: "#253545",
}

const contentStyles: CSS.Properties = {

};

const relativeTimeStyles: CSS.Properties = {
    color: "lightgray",
}

const usernameStyles: CSS.Properties = {
    fontWeight: "bolder",
}

const profilePicStyles: CSS.Properties = {
    width: "3em",
    height: "3em"
};

const textStyles: CSS.Properties = {
    marginTop: "0.2em",
}

const replyContainerStyles: CSS.Properties = {
    gridColumn: "1 / 3",
    padding: "0.5em",
    backgroundColor: "grey"
}

const enterMessageStyles: CSS.Properties = {
    width: "100%",
    display: "block",
    resize: "vertical",
}

/* Note on interfaacing with extra data.

The currentComment will be overwritten by parent refreshing from new data. 
-Either: Dump in redux store / localstorage.
-Get a ref to the element from the parent, then request it for data, update and restore it.
-This WILL cause the focus on the textArea to be lost 
 because it will be re-rendered by the parent component.
*/

// Mock function, please replace.
function sendToServer(comment: IComment) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, 1000);
    });
}

export default function Comments(props: CommentsProps) {
    const { comments, setComments, allComments } = props;
    // TODO: Move this outside.
    const [commentsBeingEdited, setCommentsBeingEdited] =
        React.useState(keyBy(comments.filter((c) => c[0].isEditing),
            (c) => c[1]));


    // ---------------- STATE HELPERS ----------------

    // Will be required later to propagate the changes back.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateComment = (comment: IComment, idx: number) => {
        const prepend = allComments.slice(0, idx);
        const postPend = allComments.slice(idx + 1, comments.length);
        setComments([...prepend, comment, ...postPend]);
    }

    function updatePreviewCommentText(comment: IComment, idx: number) {
        return function (event: React.ChangeEvent<HTMLTextAreaElement>) {
            const text = event.target.value;
            const t = {
                ...commentsBeingEdited,
                [idx]: [{
                    ...comment,
                    text,
                }, idx],
            };
            setCommentsBeingEdited(t);
        }
    }


    // ---------------- CONTROLS ----------------

    function cancelWithPrompt(commentIdx: [IComment, number]) {
        return function (evt: any) {
            const [comment, idx] = commentIdx;
            // eslint-disable-next-line no-restricted-globals
            const sure = confirm('Are you sure about that?');
            if (sure) {
                const isNewComment = comment.datetime === 0;
                if (isNewComment) {
                    // Remove the placeholder comment entirely
                    const prepend = allComments.slice(0, idx);
                    const postPend = allComments.slice(idx + 1, comments.length);
                    console.log('new comments', [...prepend, ...postPend])
                    setComments([...prepend, ...postPend]);
                }
                // remove from comments being edited.
                const newCommentsBeingEdited = omit(commentsBeingEdited, [idx]);
                setCommentsBeingEdited(newCommentsBeingEdited);
            }
        }
    }


    function confirmSubmit(commentIdx: [IComment, number]) {
        return async function (evt: any) {
            // TODO: figure out a method for edits
            const [comment, idx] = commentIdx;
            const newComment: IComment = {
                ...comment,
                isEditing: false,
                datetime: Date.now(),
            };

            // TODO: feedback to user first
            try {
                await sendToServer(newComment); // TODO: STUB FUNCTION, PLEASE UPDATE.
                updateComment(newComment, idx);
            } catch (e) {
                // TODO, implement properly
                console.error('Error occured when sending the comment to server', e);
            }
        }
    }



    return (
        <div className="comments-container" style={commentsContainerStyles}>
            <div className="gutter-controls">-</div>
            {comments.map(([comment, idx]) => {
                const displayComment
                    = commentsBeingEdited[idx] ? commentsBeingEdited[idx][0] : comment;
                const { profilePic, username, text, datetime, isEditing } = displayComment;
                return (<Card className="comment" key={datetime} style={commentStyles}>
                    <img className="profile-pic" src={profilePic} alt="" style={profilePicStyles}></img>
                    <div className="content" style={contentStyles}>
                        <span className="username" style={usernameStyles}>{username} </span>
                        <span className="relative-time" style={relativeTimeStyles}>{isEditing ? 'Preview' : format(new Date(datetime))}</span>
                        <Markdown className="text" content={text || "(Content preview)"} />
                    </div>
                    {(isEditing ? <div className="reply-container" style={replyContainerStyles}>
                        <textarea style={enterMessageStyles}
                            placeholder="Write a message..."
                            onChange={updatePreviewCommentText(displayComment, idx)}
                            defaultValue={text}></textarea>
                        <ButtonGroup>
                            <Button onClick={cancelWithPrompt([displayComment, idx])}>Cancel</Button>
                            <Button intent="success"
                                onClick={confirmSubmit([displayComment, idx])}
                                disabled={text.trim().length === 0}>Submit</Button>
                        </ButtonGroup>
                    </div> : '')}
                </Card>);
            })}

        </div>
    );
}
