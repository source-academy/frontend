import { Ace } from 'ace-builds';

import AceCursorMarker from './AceCursorMarker';

/**
 * Implements multiple colored cursors in the ace editor.  Each cursor is
 * associated with a particular user. Each user is identified by a unique id
 * and has a color associated with them.  Each cursor has a position in the
 * editor which is specified by a 2-d row and column ({row: 0, column: 10}).
 */
class AceMultiCursorManager {
  private readonly _cursors: { [key: string]: AceCursorMarker };
  private readonly _session: Ace.EditSession;

  /**
   * Constructs a new AceMultiCursorManager that is bound to a particular
   * Ace EditSession instance.
   *
   * @param session
   *   The Ace EditSession to bind to.
   */
  constructor(session: Ace.EditSession) {
    this._cursors = {};
    this._session = session;
  }

  /**
   * Adds a new collaborative selection.
   *
   * @param id
   *   The unique system identifier for the user associated with this selection.
   * @param label
   *   A human readable / meaningful label / title that identifies the user.
   * @param color
   *   A valid css color string.
   * @param position
   *   A 2-d position or linear index indicating the location of the cursor.
   */
  public addCursor(id: string, label: string, color: string, position: number | Ace.Point): void {
    if (this._cursors[id] !== undefined) {
      throw new Error(`Cursor with id already defined: ${id}`);
    }

    const marker: AceCursorMarker = new AceCursorMarker(this._session, id, label, color, position);

    this._cursors[id] = marker;
    this._session.addDynamicMarker(marker, true);
  }

  /**
   * Updates the selection for a particular user.
   *
   * @param id
   *   The unique identifier for the user.
   * @param position
   *   A 2-d position or linear index indicating the location of the cursor.
   */
  public setCursor(id: string, position: number | Ace.Point): void {
    const cursor: AceCursorMarker = this._getCursor(id);

    cursor.setPosition(position);
  }

  //   /**
  //    * Clears the cursor (but does not remove it) for the specified user.
  //    *
  //    * @param id
  //    *   The unique identifier for the user.
  //    */
  //   public clearCursor(id: string): void {
  //     const cursor = this._getCursor(id);

  //     cursor.setPosition(null);
  //   }

  public isCursorExist(id: string): boolean {
    const cursor = this._cursors[id];
    return cursor !== undefined;
  }

  /**
   * Removes the cursor for the specified user.
   *
   * @param id
   *   The unique identifier for the user.
   */
  public removeCursor(id: string): void {
    const cursor = this._cursors[id];

    if (cursor === undefined) {
      throw new Error(`Cursor not found: ${id}`);
    }
    // Note: ace adds an id field to all added markers.
    this._session.removeMarker((cursor as any).id);
    delete this._cursors[id];
  }

  /**
   * Removes all cursors.
   */
  public removeAll(): void {
    Object.getOwnPropertyNames(this._cursors).forEach(key => {
      this.removeCursor(this._cursors[key].cursorId());
    });
  }

  private _getCursor(id: string): AceCursorMarker {
    const cursor: AceCursorMarker = this._cursors[id];

    if (cursor === undefined) {
      throw new Error(`Cursor not found: ${id}`);
    }
    return cursor;
  }
}

export default AceMultiCursorManager;
