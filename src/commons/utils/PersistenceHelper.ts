import { PersistenceFile } from '../../features/persistence/PersistenceTypes';

/**
 * Regex to get full parent path of a file path, and filename with file extension.
 * Some examples of calling exec:
 *
 *     '/playground/cp3108' -> ['/playground/cp3108', '/playground/', 'cp3108', '']
 *     '/playground/cp3108/a.js' -> ['/playground/cp3108/a.js', '/playground/cp3108/', 'a', '.js']
 *     '' -> ['', undefined, '', '']
 *     'a.js' -> ['a.js', undefined, 'a', '.js']
 *     'asdf' -> ['asdf', undefined, 'asdf', '']
 */
export const filePathRegex = /^(.*[\\/])?(\.*.*?)(\.[^.]+?|)$/;

/**
 * Checks if any persistenceFile in a given persistenceFileArray 
 * has a lastEdit that is more recent than lastSaved.
 * @param pf persistenceFileArray.
 * @returns boolean representing whether any file has yet to be updated.
 */
export const areAllFilesSavedGoogleDrive = (pf: PersistenceFile[]) => {
    for (const currPersistenceFile of pf) {
        if (!currPersistenceFile.lastEdit || (currPersistenceFile.lastSaved && currPersistenceFile.lastEdit < currPersistenceFile.lastSaved)) {
            continue;
        } else {
            return false;
        }
    }
    return true;
}