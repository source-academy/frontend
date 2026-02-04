export enum GamePhaseType {
  Move = 'Move',
  Explore = 'Explore',
  Talk = 'Talk',
  Menu = 'Menu',
  EscapeMenu = 'EscapeMenu',
  None = 'None',
  Sequence = 'Sequence',
  Dashboard = 'Dashboard'
}

/**
 * A terminal phase should only ever be the top-most phase in the phase stack.
 * In particular, this means the phase stack should only have at most one
 * terminal phase on it at any point. A terminal phase should be popped from
 * the stack before another phase is pushed on.
 */
export enum GameTerminalPhaseType {
  EscapeMenu = GamePhaseType.EscapeMenu,
  Dashboard = GamePhaseType.Dashboard
}
