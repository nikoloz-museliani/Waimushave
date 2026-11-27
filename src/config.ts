// Only the explicit demo command enables offline portfolio behavior.
// Normal dev/build commands continue to use Express and BrowserRouter.
export const IS_DEMO = import.meta.env.MODE === 'demo'
