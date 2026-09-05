# AI Agent Instructions

## TypeScript Rules

* Prefer `type`s over `interface`s for type definitions

## Frontend Rules

* Components should be function declarations, not function expressions
* Component props should be defined as a separate type, not inline
* Props should be destructured in the function parameters, not inside the function body
* As per the [TypeScript Rules](#typescript-rules), props should be defined as a `type`, not an `interface`
* Props should be named `Props` if unexported, or `ComponentNameProps` if exported
* Each file should only have one component, and the file name should match the component name
* **Exception:** For pages, the file name should be correspondent to the route segment (e.g. `_index.tsx` for the root route, `about.tsx` for the `/about` route, etc.), and the component name should end in `Page` (e.g. `IndexPage`, `AboutPage`, etc.)
* Components should be exported as a default export, not a named export
* The default export should be defined at the end of the file, not inline with the component definition
* If a component requires multiple sub-components, they should be defined in separate files, and the main component moved under a folder named after the main component, but using lowerCamelCase (e.g. `MainComponent` would be in `mainComponent/MainComponent.tsx`, and its sub-components would be in the same folder, but with their own file names corresponding to the sub-components' names)
