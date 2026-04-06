import type { createBrowserRouter } from 'react-router';

export type Router = ReturnType<typeof createBrowserRouter>;
export type RouterState = Router | null;
