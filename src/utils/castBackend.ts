import { ExternalLibraryName, Library } from '../components/assessment/assessmentShape'

export const castLibrary = (lib: any): Library => ({
  chapter: lib.chapter,
  external: {
    name: lib.external.name.toUpperCase() as ExternalLibraryName,
    symbols: lib.external.symbols
  },
  globals: Object.entries(lib.globals as object).map(entry => {
    try {
      entry[0] = (window as any).eval(entry[1])
    } catch (e) {}
    return entry
  })
})
