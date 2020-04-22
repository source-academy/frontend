const { createContext, runInContext } = require('js-slang');

module.exports = {
    /**
     * Evaluates Source program string using js-slang interpreter.
     * @param  {String} program  Program to evaluate
     * @param  {Number} chapter  Source chapter number to evaluate under
     * @return {undefined}
     */
    eval_code: function(program, chapter) {
        const context = createContext(chapter);
        const options = {
            executionMethod: 'auto',
            originalMaxExecTime: 1000,
            scheduler: 'async',
            steps: 1000,
            useSubst: false,
            variant: 'default'
        }
        runInContext(program, context, options);
    }
};
