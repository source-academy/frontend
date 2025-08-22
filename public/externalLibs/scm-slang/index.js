(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ScmSlangRunner = {}));
})(this, (function (exports) { 'use strict';

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    /**
     * Generic Conductor Error.
     */
    class ConductorError extends Error {
        constructor(message) {
            super(message);
            this.name = "ConductorError";
            this.errorType = "__unknown" /* ErrorType.UNKNOWN */;
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    /**
     * Conductor internal error, probably caused by developer oversight.
     */
    class ConductorInternalError extends ConductorError {
        constructor(message) {
            super(message);
            this.name = "ConductorInternalError";
            this.errorType = "__internal" /* ErrorType.INTERNAL */;
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    class BasicEvaluator {
        async startEvaluator(entryPoint) {
            const initialChunk = await this.conductor.requestFile(entryPoint);
            if (!initialChunk)
                throw new ConductorInternalError("Cannot load entrypoint file");
            await this.evaluateFile(entryPoint, initialChunk);
            while (true) {
                const chunk = await this.conductor.requestChunk();
                await this.evaluateChunk(chunk);
            }
        }
        /**
         * Evaluates a file.
         * @param fileName The name of the file to be evaluated.
         * @param fileContent The content of the file to be evaluated.
         * @returns A promise that resolves when the evaluation is complete.
         */
        async evaluateFile(fileName, fileContent) {
            return this.evaluateChunk(fileContent);
        }
        constructor(conductor) {
            this.conductor = conductor;
        }
    }

    /**
     * Node types of the abstract syntax tree of the Scheme Language.
     * We aim to be as simple as possible, and only represent the bare minimum
     * of Scheme syntax.
     *
     * Syntatic sugar such as "cond" or "let" will be left in another file,
     * and will be translated into the bare minimum of Scheme syntax, for now
     * with a transformer visitor, and perhaps later with a macro system.
     */
    /**
     * The namespace for all the atomic node types.
     */
    var Atomic;
    (function (Atomic) {
        // Scheme chapter 1
        /**
         * A node that represents a sequence of expressions.
         * Also introduces a new scope.
         * The last expression is the return value of the sequence.
         */
        class Sequence {
            constructor(location, expressions) {
                this.location = location;
                this.expressions = expressions;
            }
            accept(visitor) {
                return visitor.visitSequence(this);
            }
            equals(other) {
                if (other instanceof Sequence) {
                    if (this.expressions.length !== other.expressions.length) {
                        return false;
                    }
                    for (let i = 0; i < this.expressions.length; i++) {
                        if (!this.expressions[i].equals(other.expressions[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }
        }
        Atomic.Sequence = Sequence;
        /**
         * A node that represents a Scheme number.
         * TODO: Support the Scheme number tower.
         */
        class NumericLiteral {
            constructor(location, value) {
                this.location = location;
                this.value = value;
            }
            accept(visitor) {
                return visitor.visitNumericLiteral(this);
            }
            equals(other) {
                if (other instanceof NumericLiteral) {
                    return this.value === other.value;
                }
                return false;
            }
        }
        Atomic.NumericLiteral = NumericLiteral;
        /**
         * A node that represents a Scheme boolean.
         */
        class BooleanLiteral {
            constructor(location, value) {
                this.location = location;
                this.value = value;
            }
            accept(visitor) {
                return visitor.visitBooleanLiteral(this);
            }
            equals(other) {
                if (other instanceof BooleanLiteral) {
                    return this.value === other.value;
                }
                return false;
            }
        }
        Atomic.BooleanLiteral = BooleanLiteral;
        /**
         * A node that represents a Scheme string.
         */
        class StringLiteral {
            constructor(location, value) {
                this.location = location;
                this.value = value;
            }
            accept(visitor) {
                return visitor.visitStringLiteral(this);
            }
            equals(other) {
                if (other instanceof StringLiteral) {
                    return this.value === other.value;
                }
                return false;
            }
        }
        Atomic.StringLiteral = StringLiteral;
        /**
         * A node that represents a Scheme complex number.
         */
        class ComplexLiteral {
            constructor(location, value) {
                this.location = location;
                this.value = value;
            }
            accept(visitor) {
                return visitor.visitComplexLiteral(this);
            }
            equals(other) {
                if (other instanceof ComplexLiteral) {
                    return this.value === other.value;
                }
                return false;
            }
        }
        Atomic.ComplexLiteral = ComplexLiteral;
        /**
         * A node representing a Scheme lambda expression.
         * TODO: Support rest arguments.
         */
        class Lambda {
            constructor(location, body, params, rest = undefined) {
                this.location = location;
                this.params = params;
                this.rest = rest;
                this.body = body;
            }
            accept(visitor) {
                return visitor.visitLambda(this);
            }
            equals(other) {
                if (other instanceof Lambda) {
                    if (this.params.length !== other.params.length) {
                        return false;
                    }
                    for (let i = 0; i < this.params.length; i++) {
                        if (!this.params[i].equals(other.params[i])) {
                            return false;
                        }
                    }
                    if (this.rest && other.rest) {
                        if (!this.rest.equals(other.rest)) {
                            return false;
                        }
                    }
                    else if (this.rest || other.rest) {
                        return false;
                    }
                    return this.body.equals(other.body);
                }
                return false;
            }
        }
        Atomic.Lambda = Lambda;
        /**
         * A node representing a Scheme identifier.
         */
        class Identifier {
            constructor(location, name) {
                this.location = location;
                this.name = name;
            }
            accept(visitor) {
                return visitor.visitIdentifier(this);
            }
            equals(other) {
                if (other instanceof Identifier) {
                    return this.name === other.name;
                }
                return false;
            }
        }
        Atomic.Identifier = Identifier;
        /**
         * A node representing a Scheme variable definition.
         * Returns nil.
         */
        class Definition {
            constructor(location, name, value) {
                this.location = location;
                this.name = name;
                this.value = value;
            }
            accept(visitor) {
                return visitor.visitDefinition(this);
            }
            equals(other) {
                if (other instanceof Definition) {
                    return this.name.equals(other.name) && this.value.equals(other.value);
                }
                return false;
            }
        }
        Atomic.Definition = Definition;
        /**
         * A node representing a Scheme function application.
         */
        class Application {
            constructor(location, operator, operands) {
                this.location = location;
                this.operator = operator;
                this.operands = operands;
            }
            accept(visitor) {
                return visitor.visitApplication(this);
            }
            equals(other) {
                if (other instanceof Application) {
                    if (!this.operator.equals(other.operator)) {
                        return false;
                    }
                    if (this.operands.length !== other.operands.length) {
                        return false;
                    }
                    for (let i = 0; i < this.operands.length; i++) {
                        if (!this.operands[i].equals(other.operands[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }
        }
        Atomic.Application = Application;
        /**
         * A node representing a Scheme conditional expression.
         */
        class Conditional {
            constructor(location, test, consequent, alternate) {
                this.location = location;
                this.test = test;
                this.consequent = consequent;
                this.alternate = alternate;
            }
            accept(visitor) {
                return visitor.visitConditional(this);
            }
            equals(other) {
                if (other instanceof Conditional) {
                    return (this.test.equals(other.test) &&
                        this.consequent.equals(other.consequent) &&
                        this.alternate.equals(other.alternate));
                }
                return false;
            }
        }
        Atomic.Conditional = Conditional;
        // Scheme chapter 2
        /**
         * A node representing a Scheme pair.
         */
        class Pair {
            constructor(location, car, cdr) {
                this.location = location;
                this.car = car;
                this.cdr = cdr;
            }
            accept(visitor) {
                return visitor.visitPair(this);
            }
            equals(other) {
                if (other instanceof Pair) {
                    return this.car.equals(other.car) && this.cdr.equals(other.cdr);
                }
                return false;
            }
        }
        Atomic.Pair = Pair;
        /**
         * A node representing nil, an empty scheme list.
         */
        class Nil {
            constructor(location) {
                this.location = location;
            }
            accept(visitor) {
                return visitor.visitNil(this);
            }
            equals(other) {
                return other instanceof Nil;
            }
        }
        Atomic.Nil = Nil;
        /**
         * A node representing a Scheme symbol.
         */
        class Symbol {
            constructor(location, value) {
                this.location = location;
                this.value = value;
            }
            accept(visitor) {
                return visitor.visitSymbol(this);
            }
            equals(other) {
                if (other instanceof Symbol) {
                    return this.value === other.value;
                }
                return false;
            }
        }
        Atomic.Symbol = Symbol;
        /**
         * A node representing a Scheme marker for unquote_splicing.
         * This will be evaluated at runtime.
         */
        class SpliceMarker {
            constructor(location, value) {
                this.location = location;
                this.value = value;
            }
            accept(visitor) {
                return visitor.visitSpliceMarker(this);
            }
            equals(other) {
                if (other instanceof SpliceMarker) {
                    return this.value.equals(other.value);
                }
                return false;
            }
        }
        Atomic.SpliceMarker = SpliceMarker;
        // Scheme chapter 3
        /**
         * A node representing a Scheme variable reassignment.
         * Only supposed to be used on a variable that has been defined.
         * Returns nil.
         */
        class Reassignment {
            constructor(location, name, value) {
                this.location = location;
                this.name = name;
                this.value = value;
            }
            accept(visitor) {
                return visitor.visitReassignment(this);
            }
            equals(other) {
                if (other instanceof Reassignment) {
                    return this.name.equals(other.name) && this.value.equals(other.value);
                }
                return false;
            }
        }
        Atomic.Reassignment = Reassignment;
        // scm-slang specific
        /**
         * A node representing an import statement.
         * syntax: (import <source> ( <identifier>* ))
         * Returns nil.
         */
        class Import {
            constructor(location, source, identifiers) {
                this.location = location;
                this.source = source;
                this.identifiers = identifiers;
            }
            accept(visitor) {
                return visitor.visitImport(this);
            }
            equals(other) {
                if (other instanceof Import) {
                    if (!this.source.equals(other.source)) {
                        return false;
                    }
                    if (this.identifiers.length !== other.identifiers.length) {
                        return false;
                    }
                    for (let i = 0; i < this.identifiers.length; i++) {
                        if (!this.identifiers[i].equals(other.identifiers[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }
        }
        Atomic.Import = Import;
        /**
         * A node representing an export statement.
         * syntax: (export ( <definition> ))
         * Returns nil.
         */
        class Export {
            constructor(location, definition) {
                this.location = location;
                this.definition = definition;
            }
            accept(visitor) {
                return visitor.visitExport(this);
            }
            equals(other) {
                if (other instanceof Export) {
                    return this.definition.equals(other.definition);
                }
                return false;
            }
        }
        Atomic.Export = Export;
        /**
         * A node representing a Scheme Vector.
         */
        class Vector {
            constructor(location, elements) {
                this.location = location;
                this.elements = elements;
            }
            accept(visitor) {
                return visitor.visitVector(this);
            }
            equals(other) {
                if (other instanceof Vector) {
                    if (this.elements.length !== other.elements.length) {
                        return false;
                    }
                    for (let i = 0; i < this.elements.length; i++) {
                        if (!this.elements[i].equals(other.elements[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }
        }
        Atomic.Vector = Vector;
        /**
         * A node representing a Scheme define-syntax expression.
         */
        class DefineSyntax {
            constructor(location, name, transformer) {
                this.location = location;
                this.name = name;
                this.transformer = transformer;
            }
            accept(visitor) {
                return visitor.visitDefineSyntax(this);
            }
            equals(other) {
                if (other instanceof DefineSyntax) {
                    return (this.name.equals(other.name) &&
                        this.transformer.equals(other.transformer));
                }
                return false;
            }
        }
        Atomic.DefineSyntax = DefineSyntax;
        /**
         * A node representing a Scheme syntax-rules expression.
         */
        class SyntaxRules {
            constructor(location, literals, rules) {
                this.location = location;
                this.literals = literals;
                this.rules = rules;
            }
            accept(visitor) {
                return visitor.visitSyntaxRules(this);
            }
            equals(other) {
                if (other instanceof SyntaxRules) {
                    if (this.literals.length !== other.literals.length) {
                        return false;
                    }
                    for (let i = 0; i < this.literals.length; i++) {
                        if (!this.literals[i].equals(other.literals[i])) {
                            return false;
                        }
                    }
                    if (this.rules.length !== other.rules.length) {
                        return false;
                    }
                    for (let i = 0; i < this.rules.length; i++) {
                        if (!this.rules[i][0].equals(other.rules[i][0]) ||
                            !this.rules[i][1].equals(other.rules[i][1])) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }
        }
        Atomic.SyntaxRules = SyntaxRules;
    })(Atomic || (Atomic = {}));
    /**
     * The namespace for all the syntactic sugar node types.
     * Will be transformed into the bare minimum of Scheme syntax.
     * Eventually, we won't need this namespace, as all the syntactic sugar
     * will be converted by a macro system.
     */
    var Extended;
    (function (Extended) {
        // Scheme chapter 1
        /**
         * A node representing a function definition.
         */
        class FunctionDefinition {
            constructor(location, name, body, params, rest = undefined) {
                this.location = location;
                this.name = name;
                this.body = body;
                this.params = params;
                this.rest = rest;
            }
            accept(visitor) {
                return visitor.visitFunctionDefinition(this);
            }
            equals(other) {
                if (other instanceof FunctionDefinition) {
                    if (this.params.length !== other.params.length) {
                        return false;
                    }
                    for (let i = 0; i < this.params.length; i++) {
                        if (!this.params[i].equals(other.params[i])) {
                            return false;
                        }
                    }
                    if (this.rest && other.rest) {
                        if (!this.rest.equals(other.rest)) {
                            return false;
                        }
                    }
                    else if (this.rest || other.rest) {
                        return false;
                    }
                    return this.body.equals(other.body);
                }
                return false;
            }
        }
        Extended.FunctionDefinition = FunctionDefinition;
        /**
         * A node representing a Scheme let expression.
         */
        class Let {
            constructor(location, identifiers, values, body) {
                this.location = location;
                this.identifiers = identifiers;
                this.values = values;
                this.body = body;
            }
            accept(visitor) {
                return visitor.visitLet(this);
            }
            equals(other) {
                if (other instanceof Let) {
                    if (this.identifiers.length !== other.identifiers.length) {
                        return false;
                    }
                    for (let i = 0; i < this.identifiers.length; i++) {
                        if (!this.identifiers[i].equals(other.identifiers[i])) {
                            return false;
                        }
                    }
                    if (this.values.length !== other.values.length) {
                        return false;
                    }
                    for (let i = 0; i < this.values.length; i++) {
                        if (!this.values[i].equals(other.values[i])) {
                            return false;
                        }
                    }
                    return this.body.equals(other.body);
                }
                return false;
            }
        }
        Extended.Let = Let;
        /**
         * A node representing a Scheme cond expression.
         * MAY return nil.
         */
        class Cond {
            constructor(location, predicates, consequents, catchall) {
                this.location = location;
                this.predicates = predicates;
                this.consequents = consequents;
                this.catchall = catchall;
            }
            accept(visitor) {
                return visitor.visitCond(this);
            }
            equals(other) {
                if (other instanceof Cond) {
                    if (this.predicates.length !== other.predicates.length) {
                        return false;
                    }
                    for (let i = 0; i < this.predicates.length; i++) {
                        if (!this.predicates[i].equals(other.predicates[i])) {
                            return false;
                        }
                    }
                    if (this.consequents.length !== other.consequents.length) {
                        return false;
                    }
                    for (let i = 0; i < this.consequents.length; i++) {
                        if (!this.consequents[i].equals(other.consequents[i])) {
                            return false;
                        }
                    }
                    if (this.catchall && other.catchall) {
                        return this.catchall.equals(other.catchall);
                    }
                    else if (this.catchall || other.catchall) {
                        return false;
                    }
                    return true;
                }
                return false;
            }
        }
        Extended.Cond = Cond;
        // Scheme chapter 2
        /**
         * A node representing a Scheme list or dotted list.
         */
        class List {
            constructor(location, elements, terminator = undefined) {
                this.location = location;
                this.elements = elements;
                this.terminator = terminator;
            }
            accept(visitor) {
                return visitor.visitList(this);
            }
            equals(other) {
                if (other instanceof List) {
                    if (this.elements.length !== other.elements.length) {
                        return false;
                    }
                    for (let i = 0; i < this.elements.length; i++) {
                        if (!this.elements[i].equals(other.elements[i])) {
                            return false;
                        }
                    }
                    if (this.terminator && other.terminator) {
                        return this.terminator.equals(other.terminator);
                    }
                    else if (this.terminator || other.terminator) {
                        return false;
                    }
                    return true;
                }
                return false;
            }
        }
        Extended.List = List;
        // Scheme chapter 3
        /**
         * A node representing a Scheme begin expression.
         * Returns the last expression.
         * syntax: (begin <expression>*)
         */
        class Begin {
            constructor(location, expressions) {
                this.location = location;
                this.expressions = expressions;
            }
            accept(visitor) {
                return visitor.visitBegin(this);
            }
            equals(other) {
                if (other instanceof Begin) {
                    if (this.expressions.length !== other.expressions.length) {
                        return false;
                    }
                    for (let i = 0; i < this.expressions.length; i++) {
                        if (!this.expressions[i].equals(other.expressions[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }
        }
        Extended.Begin = Begin;
        /**
         * A node representing a Scheme delay expression.
         * Returns a promise.
         * syntax: (delay <expression>)
         */
        class Delay {
            constructor(location, expression) {
                this.location = location;
                this.expression = expression;
            }
            accept(visitor) {
                return visitor.visitDelay(this);
            }
            equals(other) {
                if (other instanceof Delay) {
                    return this.expression.equals(other.expression);
                }
                return false;
            }
        }
        Extended.Delay = Delay;
    })(Extended || (Extended = {}));

    // A data structure representing the span of the scheme node.
    class Location {
        constructor(start, end) {
            this.start = start;
            this.end = end;
        }
        merge(other) {
            return new Location(this.start, other.end);
        }
    }
    // A data structure representing a particular position of a token.
    class Position {
        constructor(line, column) {
            this.line = line;
            this.column = column;
        }
    }

    function parseSchemeSimple(code) {
        const tokens = tokenize(code);
        const parser = new SimpleSchemeParser(tokens);
        return parser.parse();
    }
    function tokenize(code) {
        const tokens = [];
        let current = 0;
        let line = 1;
        let column = 1;
        while (current < code.length) {
            const char = code[current];
            if (char === "(" || char === "[") {
                tokens.push({ type: "LPAREN", value: char, line, column });
                current++;
                column++;
            }
            else if (char === ")" || char === "]") {
                tokens.push({ type: "RPAREN", value: char, line, column });
                current++;
                column++;
            }
            else if (char === "'") {
                tokens.push({ type: "QUOTE", value: char, line, column });
                current++;
                column++;
            }
            else if (isWhitespace(char)) {
                if (char === "\n") {
                    line++;
                    column = 1;
                }
                else {
                    column++;
                }
                current++;
            }
            else if (char === ";") {
                // Skip comments
                while (current < code.length && code[current] !== "\n") {
                    current++;
                }
            }
            else if (char === '"') {
                // String literal
                const startColumn = column;
                current++;
                column++;
                let value = "";
                while (current < code.length && code[current] !== '"') {
                    if (code[current] === "\\" && current + 1 < code.length) {
                        current++;
                        column++;
                        value += code[current];
                    }
                    else {
                        value += code[current];
                    }
                    current++;
                    column++;
                }
                if (current < code.length) {
                    current++;
                    column++;
                }
                tokens.push({ type: "STRING", value, line, column: startColumn });
            }
            else if (isDigit(char) ||
                ((char === "+" || char === "-") && isDigit(code[current + 1]))) {
                // Number literal (including complex numbers)
                const startColumn = column;
                let value = "";
                // Handle potential complex numbers or signed numbers
                if (char === "+" || char === "-") {
                    value += char;
                    current++;
                    column++;
                }
                // Read number part
                while (current < code.length &&
                    (isDigit(code[current]) ||
                        code[current] === "." ||
                        code[current] === "e" ||
                        code[current] === "E" ||
                        code[current] === "+" ||
                        code[current] === "-")) {
                    value += code[current];
                    current++;
                    column++;
                }
                // Check for complex number suffix 'i' or 'I'
                if (current < code.length &&
                    (code[current] === "i" || code[current] === "I")) {
                    value += code[current];
                    current++;
                    column++;
                    tokens.push({ type: "COMPLEX", value, line, column: startColumn });
                }
                else {
                    tokens.push({ type: "NUMBER", value, line, column: startColumn });
                }
            }
            else if (char === "#") {
                // Handle # prefixed tokens
                const startColumn = column;
                current++;
                column++;
                let value = "#";
                while (current < code.length && isIdentifierPart(code[current])) {
                    value += code[current];
                    current++;
                    column++;
                }
                // Check for special keywords
                if (value === "#t" || value === "#true") {
                    tokens.push({
                        type: "BOOLEAN",
                        value: "true",
                        line,
                        column: startColumn,
                    });
                }
                else if (value === "#f" || value === "#false") {
                    tokens.push({
                        type: "BOOLEAN",
                        value: "false",
                        line,
                        column: startColumn,
                    });
                }
                else {
                    tokens.push({ type: "IDENTIFIER", value, line, column: startColumn });
                }
            }
            else if (isIdentifierStart(char)) {
                // Identifier or keyword
                const startColumn = column;
                let value = "";
                while (current < code.length && isIdentifierPart(code[current])) {
                    value += code[current];
                    current++;
                    column++;
                }
                tokens.push({ type: "IDENTIFIER", value, line, column: startColumn });
            }
            else {
                // Unknown character
                current++;
                column++;
            }
        }
        tokens.push({ type: "EOF", value: "", line, column });
        return tokens;
    }
    function isWhitespace(char) {
        return /\s/.test(char);
    }
    function isDigit(char) {
        return /\d/.test(char);
    }
    function isIdentifierStart(char) {
        return /[a-zA-Z_+\-*/=<>!?]/.test(char);
    }
    function isIdentifierPart(char) {
        return /[a-zA-Z0-9_+\-*/=<>!?]/.test(char);
    }
    class SimpleSchemeParser {
        constructor(tokens) {
            this.current = 0;
            this.tokens = tokens;
        }
        parse() {
            const expressions = [];
            while (!this.isAtEnd()) {
                const expr = this.parseExpression();
                if (expr) {
                    expressions.push(expr);
                }
            }
            return expressions;
        }
        parseExpression() {
            const token = this.peek();
            if (token.type === "NUMBER") {
                return this.parseNumber();
            }
            else if (token.type === "COMPLEX") {
                return this.parseComplex();
            }
            else if (token.type === "STRING") {
                return this.parseString();
            }
            else if (token.type === "BOOLEAN") {
                return this.parseBoolean();
            }
            else if (token.type === "IDENTIFIER") {
                return this.parseIdentifier();
            }
            else if (token.type === "LPAREN") {
                return this.parseList();
            }
            else if (token.type === "QUOTE") {
                return this.parseQuote();
            }
            else {
                this.advance(); // Skip unknown tokens
                return null;
            }
        }
        parseNumber() {
            const token = this.advance();
            const location = this.createLocation(token);
            return new Atomic.NumericLiteral(location, token.value);
        }
        parseComplex() {
            const token = this.advance();
            const location = this.createLocation(token);
            return new Atomic.ComplexLiteral(location, token.value);
        }
        parseString() {
            const token = this.advance();
            const location = this.createLocation(token);
            return new Atomic.StringLiteral(location, token.value);
        }
        parseBoolean() {
            const token = this.advance();
            const location = this.createLocation(token);
            return new Atomic.BooleanLiteral(location, token.value === "true");
        }
        parseIdentifier() {
            const token = this.advance();
            const location = this.createLocation(token);
            return new Atomic.Identifier(location, token.value);
        }
        parseList() {
            const openToken = this.advance(); // Consume '('
            const location = this.createLocation(openToken);
            const elements = [];
            while (!this.isAtEnd() && this.peek().type !== "RPAREN") {
                const expr = this.parseExpression();
                if (expr) {
                    elements.push(expr);
                }
            }
            if (this.peek().type === "RPAREN") {
                this.advance(); // Consume ')'
            }
            if (elements.length === 0) {
                return new Atomic.Nil(location);
            }
            // Check for special forms
            if (elements.length > 0 && elements[0] instanceof Atomic.Identifier) {
                const first = elements[0];
                console.log("DEBUG: parseList - checking special form:", first.name);
                if (first.name === "define") {
                    return this.parseDefine(elements, location);
                }
                else if (first.name === "lambda") {
                    return this.parseLambda(elements, location);
                }
                else if (first.name === "if") {
                    return this.parseConditional(elements, location);
                }
                else if (first.name === "let") {
                    return this.parseLet(elements, location);
                }
                else if (first.name === "begin") {
                    return this.parseBegin(elements, location);
                }
                else if (first.name === "cond") {
                    return this.parseCond(elements, location);
                }
            }
            // Regular function application (including (list) which should be a function call)
            if (elements.length > 0) {
                const operator = elements[0];
                const operands = elements.slice(1);
                return new Atomic.Application(location, operator, operands);
            }
            // Empty list literal
            return new Extended.List(location, elements);
        }
        parseDefine(elements, location) {
            if (elements.length < 3) {
                throw new Error("define requires at least 2 arguments");
            }
            const name = elements[1];
            const value = elements[2];
            console.log("DEBUG: parseDefine - name type:", name.constructor.name);
            console.log("DEBUG: parseDefine - name:", name);
            console.log("DEBUG: parseDefine - Extended.List check:", name instanceof Extended.List);
            // Handle function definition: (define (func-name args) body)
            if ((name instanceof Extended.List && name.elements.length > 0) ||
                (name instanceof Atomic.Application &&
                    name.operator instanceof Atomic.Identifier)) {
                console.log("DEBUG: parseDefine - Processing function definition");
                let funcName;
                let params;
                if (name instanceof Extended.List) {
                    funcName = name.elements[0];
                    params = name.elements
                        .slice(1)
                        .filter(e => e instanceof Atomic.Identifier);
                }
                else {
                    // Handle Application case: (add x y) -> operator is 'add', operands are [x, y]
                    funcName = name.operator;
                    params = name.operands.filter(e => e instanceof Atomic.Identifier);
                }
                console.log("DEBUG: parseDefine - funcName type:", funcName.constructor.name);
                console.log("DEBUG: parseDefine - funcName:", funcName.name);
                if (!(funcName instanceof Atomic.Identifier)) {
                    throw new Error("function name must be an identifier");
                }
                console.log("DEBUG: parseDefine - params:", params.length);
                // Create lambda expression for the function body
                const lambda = new Atomic.Lambda(location, value, params);
                // Return definition with lambda as value
                return new Atomic.Definition(location, funcName, lambda);
            }
            // Handle variable definition: (define name value)
            console.log("DEBUG: parseDefine - Processing variable definition");
            if (!(name instanceof Atomic.Identifier)) {
                throw new Error("define name must be an identifier");
            }
            return new Atomic.Definition(location, name, value);
        }
        parseLambda(elements, location) {
            if (elements.length < 3) {
                throw new Error("lambda requires at least 2 arguments");
            }
            const paramsExpr = elements[1];
            const body = elements[2];
            console.log("DEBUG: parseLambda - paramsExpr type:", paramsExpr.constructor.name);
            console.log("DEBUG: parseLambda - paramsExpr:", paramsExpr);
            let params = [];
            if (paramsExpr instanceof Extended.List) {
                // Handle parameter list like (x y z)
                params = paramsExpr.elements.filter(e => e instanceof Atomic.Identifier);
            }
            else if (paramsExpr instanceof Atomic.Application &&
                paramsExpr.operator instanceof Atomic.Identifier) {
                // Handle Application case: (x y) -> operator is 'x', operands are ['y']
                params = [paramsExpr.operator];
                params.push(...paramsExpr.operands.filter(e => e instanceof Atomic.Identifier));
            }
            else if (paramsExpr instanceof Atomic.Identifier) {
                // Handle single parameter like x
                params = [paramsExpr];
            }
            else if (paramsExpr instanceof Atomic.Nil) {
                // Handle empty parameter list like ()
                params = [];
            }
            else {
                throw new Error("lambda parameters must be identifiers");
            }
            console.log("DEBUG: parseLambda - params:", params.length);
            return new Atomic.Lambda(location, body, params);
        }
        parseConditional(elements, location) {
            if (elements.length !== 4) {
                throw new Error("if requires exactly 3 arguments");
            }
            const test = elements[1];
            const consequent = elements[2];
            const alternate = elements[3];
            return new Atomic.Conditional(location, test, consequent, alternate);
        }
        parseLet(elements, location) {
            if (elements.length < 3) {
                throw new Error("let requires at least 2 arguments");
            }
            const bindingsExpr = elements[1];
            const body = elements[2];
            let identifiers = [];
            let values = [];
            if (bindingsExpr instanceof Extended.List) {
                for (const binding of bindingsExpr.elements) {
                    if (binding instanceof Extended.List && binding.elements.length === 2) {
                        const id = binding.elements[0];
                        const val = binding.elements[1];
                        if (id instanceof Atomic.Identifier) {
                            identifiers.push(id);
                            values.push(val);
                        }
                    }
                }
            }
            return new Extended.Let(location, identifiers, values, body);
        }
        parseBegin(elements, location) {
            const expressions = elements.slice(1);
            return new Extended.Begin(location, expressions);
        }
        parseCond(elements, location) {
            const clauses = elements.slice(1);
            const predicates = [];
            const consequents = [];
            let catchall;
            for (const clause of clauses) {
                if (clause instanceof Extended.List && clause.elements.length >= 2) {
                    const predicate = clause.elements[0];
                    const consequent = clause.elements[1];
                    if (predicate instanceof Atomic.Identifier &&
                        predicate.name === "else") {
                        catchall = consequent;
                    }
                    else {
                        predicates.push(predicate);
                        consequents.push(consequent);
                    }
                }
            }
            return new Extended.Cond(location, predicates, consequents, catchall);
        }
        parseQuote() {
            this.advance(); // Consume quote
            const quoted = this.parseExpression();
            if (!quoted) {
                throw new Error("quote requires an expression");
            }
            // Convert quoted expression to symbol if it's an identifier
            if (quoted instanceof Atomic.Identifier) {
                return new Atomic.Symbol(quoted.location, quoted.name);
            }
            return quoted; // Return the quoted expression directly
        }
        createLocation(token) {
            const start = new Position(token.line, token.column);
            const end = new Position(token.line, token.column + token.value.length);
            return new Location(start, end);
        }
        advance() {
            if (!this.isAtEnd()) {
                this.current++;
            }
            return this.previous();
        }
        peek() {
            return this.tokens[this.current];
        }
        previous() {
            return this.tokens[this.current - 1];
        }
        isAtEnd() {
            return this.peek().type === "EOF";
        }
    }

    // stack.ts
    class Stack {
        constructor() {
            this.items = [];
        }
        push(...items) {
            this.items.push(...items);
        }
        pop() {
            return this.items.pop();
        }
        peek() {
            return this.items[this.items.length - 1];
        }
        isEmpty() {
            return this.items.length === 0;
        }
        size() {
            return this.items.length;
        }
        clear() {
            this.items = [];
        }
        getStack() {
            return [...this.items];
        }
    }
    //Checking
    const s = new Stack();
    s.push(1, 2, 3);
    console.log(s.pop()); // 3
    console.log(s.peek()); // 2
    console.log(s.toString());

    class Control extends Stack {
        constructor(program) {
            super();
            this.numEnvDependentItems = 0;
            // Load program into control stack
            if (program) {
                if (Array.isArray(program)) {
                    // If it's an array of expressions, create a sequence
                    const seq = {
                        type: "StatementSequence",
                        body: program,
                        location: program[0]?.location || {
                            start: { line: 1, column: 1 },
                            end: { line: 1, column: 1 },
                        },
                    };
                    this.push(seq);
                }
                else {
                    this.push(program);
                }
            }
        }
        canAvoidEnvInstr() {
            return this.numEnvDependentItems === 0;
        }
        // For testing purposes
        getNumEnvDependentItems() {
            return this.numEnvDependentItems;
        }
        pop() {
            const item = super.pop();
            if (item !== undefined && this.isEnvDependent(item)) {
                this.numEnvDependentItems--;
            }
            return item;
        }
        push(...items) {
            const itemsNew = Control.simplifyBlocksWithoutDeclarations(...items);
            itemsNew.forEach((item) => {
                if (this.isEnvDependent(item)) {
                    this.numEnvDependentItems++;
                }
            });
            super.push(...itemsNew);
        }
        isEnvDependent(item) {
            return item.isEnvDependent === true;
        }
        /**
         * Before pushing block statements on the control stack, we check if the block statement has any declarations.
         * If not, the block is converted to a StatementSequence.
         * @param items The items being pushed on the control.
         * @returns The same set of control items, but with block statements without declarations converted to StatementSequences.
         */
        static simplifyBlocksWithoutDeclarations(...items) {
            const itemsNew = [];
            items.forEach(item => {
                // For Scheme, we don't have block statements like Python, so we just pass through
                itemsNew.push(item);
            });
            return itemsNew;
        }
        copy() {
            const newControl = new Control();
            const stackCopy = super.getStack();
            newControl.push(...stackCopy);
            return newControl;
        }
    }

    class Stash {
        constructor() {
            this.values = [];
        }
        push(value) {
            this.values.push(value);
        }
        pop() {
            return this.values.pop();
        }
        peek() {
            return this.values[this.values.length - 1];
        }
        size() {
            return this.values.length;
        }
        clear() {
            this.values = [];
        }
        getValues() {
            return [...this.values];
        }
    }

    function createEnvironment(name, parent = null) {
        return {
            parent,
            frame: new Map(),
            name,
            get(name) {
                if (this.frame.has(name)) {
                    return this.frame.get(name);
                }
                if (this.parent) {
                    return this.parent.get(name);
                }
                throw new Error(`Undefined variable: ${name}`);
            },
            set(name, value) {
                if (this.frame.has(name)) {
                    this.frame.set(name, value);
                    return;
                }
                if (this.parent) {
                    this.parent.set(name, value);
                    return;
                }
                throw new Error(`Cannot set undefined variable: ${name}`);
            },
            define(name, value) {
                this.frame.set(name, value);
            },
            has(name) {
                if (this.frame.has(name)) {
                    return true;
                }
                if (this.parent) {
                    return this.parent.has(name);
                }
                return false;
            },
            clone() {
                const clonedFrame = new Map(this.frame);
                const clonedParent = this.parent ? this.parent.clone() : null;
                const clonedEnv = createEnvironment(this.name, clonedParent);
                clonedEnv.frame = clonedFrame;
                return clonedEnv;
            },
        };
    }
    function createProgramEnvironment() {
        return createEnvironment("program");
    }
    function createBlockEnvironment(parent) {
        return createEnvironment("block", parent);
    }

    var InstrType;
    (function (InstrType) {
        InstrType["RESET"] = "Reset";
        InstrType["WHILE"] = "While";
        InstrType["FOR"] = "For";
        InstrType["ASSIGNMENT"] = "Assignment";
        InstrType["APPLICATION"] = "Application";
        InstrType["UNARY_OP"] = "UnaryOperation";
        InstrType["BINARY_OP"] = "BinaryOperation";
        InstrType["BOOL_OP"] = "BoolOperation";
        InstrType["COMPARE"] = "Compare";
        InstrType["CALL"] = "Call";
        InstrType["RETURN"] = "Return";
        InstrType["BREAK"] = "Break";
        InstrType["CONTINUE"] = "Continue";
        InstrType["IF"] = "If";
        InstrType["FUNCTION_DEF"] = "FunctionDef";
        InstrType["LAMBDA"] = "Lambda";
        InstrType["MULTI_LAMBDA"] = "MultiLambda";
        InstrType["GROUPING"] = "Grouping";
        InstrType["LITERAL"] = "Literal";
        InstrType["VARIABLE"] = "Variable";
        InstrType["TERNARY"] = "Ternary";
        InstrType["PASS"] = "Pass";
        InstrType["ASSERT"] = "Assert";
        InstrType["IMPORT"] = "Import";
        InstrType["GLOBAL"] = "Global";
        InstrType["NONLOCAL"] = "NonLocal";
        InstrType["Program"] = "Program";
        InstrType["BRANCH"] = "Branch";
        InstrType["POP"] = "Pop";
        InstrType["ENVIRONMENT"] = "environment";
        InstrType["MARKER"] = "marker";
        // Scheme-specific instructions
        InstrType["DEFINE"] = "Define";
        InstrType["SET"] = "Set";
        InstrType["COND"] = "Cond";
        InstrType["LET"] = "Let";
        InstrType["BEGIN"] = "Begin";
        InstrType["DELAY"] = "Delay";
        InstrType["PAIR"] = "Pair";
        InstrType["LIST"] = "List";
        InstrType["VECTOR"] = "Vector";
        InstrType["SYMBOL"] = "Symbol";
        InstrType["NIL"] = "Nil";
        InstrType["CAR"] = "Car";
        InstrType["CDR"] = "Cdr";
        InstrType["CONS"] = "Cons";
        InstrType["RESTORE_ENV"] = "RestoreEnv";
    })(InstrType || (InstrType = {}));

    // instrCreator.ts
    function createDefineInstr(name, value) {
        return {
            instrType: InstrType.DEFINE,
            srcNode: value,
            name,
            value,
        };
    }
    function createSetInstr(name, value) {
        return {
            instrType: InstrType.SET,
            srcNode: value,
            name,
            value,
        };
    }
    function createCondInstr(predicates, consequents, catchall) {
        return {
            instrType: InstrType.COND,
            srcNode: predicates[0] || consequents[0],
            predicates,
            consequents,
            catchall,
        };
    }
    function createLetInstr(identifiers, values, body) {
        return {
            instrType: InstrType.LET,
            srcNode: body,
            identifiers,
            values,
            body,
        };
    }
    function createBeginInstr(expressions) {
        return {
            instrType: InstrType.BEGIN,
            srcNode: expressions[0] || expressions[expressions.length - 1],
            expressions,
        };
    }
    function createDelayInstr(expression) {
        return {
            instrType: InstrType.DELAY,
            srcNode: expression,
            expression,
        };
    }
    function createPairInstr(car, cdr) {
        return {
            instrType: InstrType.PAIR,
            srcNode: car,
            car,
            cdr,
        };
    }
    function createListInstr(elements, terminator) {
        return {
            instrType: InstrType.LIST,
            srcNode: elements[0] || terminator,
            elements,
            terminator,
        };
    }
    function createVectorInstr(elements) {
        return {
            instrType: InstrType.VECTOR,
            srcNode: elements[0],
            elements,
        };
    }
    function createAppInstr(numOfArgs, srcNode) {
        return {
            instrType: InstrType.APPLICATION,
            srcNode,
            numOfArgs,
        };
    }
    function createBranchInstr(consequent, alternate) {
        return {
            instrType: InstrType.BRANCH,
            srcNode: consequent,
            consequent,
            alternate,
        };
    }
    function createRestoreEnvInstr(env) {
        return {
            instrType: InstrType.RESTORE_ENV,
            srcNode: {
                type: "StatementSequence",
                body: [],
                location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            },
            env,
        };
    }

    // Complex number implementation for Scheme
    // Based on py-slang PyComplexNumber
    class SchemeComplexNumber {
        constructor(real, imag) {
            this.real = real;
            this.imag = imag;
        }
        static fromNumber(value) {
            return new SchemeComplexNumber(value, 0);
        }
        static fromString(str) {
            // Handle Scheme complex number syntax: 3+4i, 1-2i, 5i
            if (!/[iI]/.test(str)) {
                const realVal = Number(str);
                if (isNaN(realVal)) {
                    throw new Error(`Invalid complex string: ${str}`);
                }
                return new SchemeComplexNumber(realVal, 0);
            }
            const lower = str.toLowerCase();
            if (lower.endsWith("i")) {
                const numericPart = str.substring(0, str.length - 1);
                // Handle purely imaginary: i, +i, -i
                if (numericPart === "" || numericPart === "+") {
                    return new SchemeComplexNumber(0, 1);
                }
                else if (numericPart === "-") {
                    return new SchemeComplexNumber(0, -1);
                }
                // Check if it's purely imaginary: 5i
                const imagVal = Number(numericPart);
                if (!isNaN(imagVal)) {
                    return new SchemeComplexNumber(0, imagVal);
                }
                // Handle complex with both real and imaginary parts: 3+4i, 1-2i
                const match = numericPart.match(/^([\+\-]?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)([\+\-]\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)$/);
                if (match) {
                    const realPart = Number(match[1]);
                    const imagPart = Number(match[2]);
                    return new SchemeComplexNumber(realPart, imagPart);
                }
            }
            throw new Error(`Invalid complex string: ${str}`);
        }
        static fromValue(value) {
            if (value instanceof SchemeComplexNumber) {
                return value;
            }
            else if (typeof value === "number") {
                return SchemeComplexNumber.fromNumber(value);
            }
            else if (typeof value === "string") {
                return SchemeComplexNumber.fromString(value);
            }
            else {
                throw new Error(`Cannot convert ${typeof value} to complex number`);
            }
        }
        // Arithmetic operations
        add(other) {
            return new SchemeComplexNumber(this.real + other.real, this.imag + other.imag);
        }
        sub(other) {
            return new SchemeComplexNumber(this.real - other.real, this.imag - other.imag);
        }
        mul(other) {
            // (a + bi) * (c + di) = (ac - bd) + (ad + bc)i
            const real = this.real * other.real - this.imag * other.imag;
            const imag = this.real * other.imag + this.imag * other.real;
            return new SchemeComplexNumber(real, imag);
        }
        div(other) {
            // (a + bi) / (c + di) = ((ac + bd) + (bc - ad)i) / (c² + d²)
            const denominator = other.real * other.real + other.imag * other.imag;
            if (denominator === 0) {
                throw new Error("Division by zero");
            }
            const real = (this.real * other.real + this.imag * other.imag) / denominator;
            const imag = (this.imag * other.real - this.real * other.imag) / denominator;
            return new SchemeComplexNumber(real, imag);
        }
        negate() {
            return new SchemeComplexNumber(-this.real, -this.imag);
        }
        // Comparison (only for equality)
        equals(other) {
            return this.real === other.real && this.imag === other.imag;
        }
        // Magnitude
        abs() {
            return Math.sqrt(this.real * this.real + this.imag * this.imag);
        }
        // String representation
        toString() {
            if (this.imag === 0) {
                return this.real.toString();
            }
            else if (this.real === 0) {
                if (this.imag === 1)
                    return "i";
                if (this.imag === -1)
                    return "-i";
                return `${this.imag}i`;
            }
            else {
                const imagPart = this.imag === 1
                    ? "i"
                    : this.imag === -1
                        ? "-i"
                        : this.imag > 0
                            ? `+${this.imag}i`
                            : `${this.imag}i`;
                return `${this.real}${imagPart}`;
            }
        }
        // Convert to JavaScript number (only if purely real)
        toNumber() {
            if (this.imag !== 0) {
                throw new Error("Cannot convert complex number with imaginary part to real number");
            }
            return this.real;
        }
    }

    // Helper functions for numeric operations
    function isNumericValue(value) {
        return value.type === "number" || value.type === "complex";
    }
    function toComplexNumber(value) {
        if (value.type === "number") {
            return SchemeComplexNumber.fromNumber(value.value);
        }
        else if (value.type === "complex") {
            return value.value;
        }
        else {
            throw new Error(`Cannot convert ${value.type} to complex number`);
        }
    }
    function complexValueToResult(complex) {
        // If purely real, return as number
        if (complex.imag === 0) {
            return { type: "number", value: complex.real };
        }
        return { type: "complex", value: complex };
    }
    const primitives = {
        // Arithmetic operations
        "+": (...args) => {
            if (args.length === 0)
                return { type: "number", value: 0 };
            // Check if all args are numeric (number or complex)
            if (!args.every(isNumericValue)) {
                throw new Error("+ requires numeric arguments");
            }
            // Convert all to complex and add
            const complexNumbers = args.map(toComplexNumber);
            const result = complexNumbers.reduce((acc, curr) => acc.add(curr), SchemeComplexNumber.fromNumber(0));
            return complexValueToResult(result);
        },
        "*": (...args) => {
            if (args.length === 0)
                return { type: "number", value: 1 };
            if (!args.every(isNumericValue)) {
                throw new Error("* requires numeric arguments");
            }
            const complexNumbers = args.map(toComplexNumber);
            const result = complexNumbers.reduce((acc, curr) => acc.mul(curr), SchemeComplexNumber.fromNumber(1));
            return complexValueToResult(result);
        },
        "-": (...args) => {
            if (args.length === 0)
                throw new Error("Subtraction requires at least one argument");
            if (!args.every(isNumericValue)) {
                throw new Error("- requires numeric arguments");
            }
            const complexNumbers = args.map(toComplexNumber);
            const result = args.length === 1
                ? complexNumbers[0].negate()
                : complexNumbers.reduce((acc, curr) => acc.sub(curr));
            return complexValueToResult(result);
        },
        "/": (...args) => {
            if (args.length === 0)
                throw new Error("Division requires at least one argument");
            if (!args.every(isNumericValue)) {
                throw new Error("/ requires numeric arguments");
            }
            const complexNumbers = args.map(toComplexNumber);
            const result = args.length === 1
                ? SchemeComplexNumber.fromNumber(1).div(complexNumbers[0])
                : complexNumbers.reduce((acc, curr) => acc.div(curr));
            return complexValueToResult(result);
        },
        // Comparison operations
        "=": (a, b) => {
            if (a.type !== b.type)
                return { type: "boolean", value: false };
            if (a.type === "number" && b.type === "number") {
                return { type: "boolean", value: a.value === b.value };
            }
            if (a.type === "string" && b.type === "string") {
                return { type: "boolean", value: a.value === b.value };
            }
            if (a.type === "boolean" && b.type === "boolean") {
                return { type: "boolean", value: a.value === b.value };
            }
            return { type: "boolean", value: false };
        },
        ">": (a, b) => {
            if (a.type !== "number" || b.type !== "number") {
                throw new Error("> requires numbers");
            }
            return { type: "boolean", value: a.value > b.value };
        },
        "<": (a, b) => {
            if (a.type !== "number" || b.type !== "number") {
                throw new Error("< requires numbers");
            }
            return { type: "boolean", value: a.value < b.value };
        },
        ">=": (a, b) => {
            if (a.type !== "number" || b.type !== "number") {
                throw new Error(">= requires numbers");
            }
            return { type: "boolean", value: a.value >= b.value };
        },
        "<=": (a, b) => {
            if (a.type !== "number" || b.type !== "number") {
                throw new Error("<= requires numbers");
            }
            return { type: "boolean", value: a.value <= b.value };
        },
        // Logical operations
        not: (x) => {
            if (x.type === "boolean") {
                return { type: "boolean", value: !x.value };
            }
            return { type: "boolean", value: false };
        },
        and: (...args) => {
            for (const arg of args) {
                if (arg.type === "boolean" && !arg.value) {
                    return { type: "boolean", value: false };
                }
            }
            return { type: "boolean", value: true };
        },
        or: (...args) => {
            for (const arg of args) {
                if (arg.type === "boolean" && arg.value) {
                    return { type: "boolean", value: true };
                }
            }
            return { type: "boolean", value: false };
        },
        // List operations
        cons: (car, cdr) => {
            return { type: "pair", car, cdr };
        },
        car: (pair) => {
            if (pair.type === "pair") {
                return pair.car;
            }
            else if (pair.type === "list" && pair.elements.length > 0) {
                return pair.elements[0];
            }
            else {
                throw new Error("car requires a pair or non-empty list");
            }
        },
        cdr: (pair) => {
            if (pair.type === "pair") {
                return pair.cdr;
            }
            else if (pair.type === "list" && pair.elements.length > 0) {
                return { type: "list", elements: pair.elements.slice(1) };
            }
            else {
                throw new Error("cdr requires a pair or non-empty list");
            }
        },
        list: (...args) => {
            return { type: "list", elements: args };
        },
        // Type predicates
        "null?": (value) => {
            return { type: "boolean", value: value.type === "nil" };
        },
        "pair?": (value) => {
            return {
                type: "boolean",
                value: value.type === "pair" || value.type === "list",
            };
        },
        "list?": (value) => {
            return {
                type: "boolean",
                value: value.type === "list" || value.type === "nil",
            };
        },
        "number?": (value) => {
            return { type: "boolean", value: value.type === "number" };
        },
        "string?": (value) => {
            return { type: "boolean", value: value.type === "string" };
        },
        "boolean?": (value) => {
            return { type: "boolean", value: value.type === "boolean" };
        },
        "symbol?": (value) => {
            return { type: "boolean", value: value.type === "symbol" };
        },
        length: (value) => {
            if (value.type === "list") {
                return { type: "number", value: value.elements.length };
            }
            else if (value.type === "pair") {
                // Recursively count pairs
                let count = 0;
                let current = value;
                while (current.type === "pair") {
                    count++;
                    current = current.cdr;
                }
                return { type: "number", value: count };
            }
            else if (value.type === "nil") {
                return { type: "number", value: 0 };
            }
            else {
                throw new Error("length requires a list or pair");
            }
        },
    };

    function evaluate(code, program, context) {
        try {
            // Initialize
            context.runtime.isRunning = true;
            context.stash = new Stash();
            context.control = new Control();
            // Initialize environment with primitives
            Object.entries(primitives).forEach(([name, func]) => {
                context.environment.define(name, { type: "primitive", name, func });
            });
            // Push expressions in reverse order
            for (let i = program.length - 1; i >= 0; i--) {
                context.control.push(program[i]);
            }
            // Run CSE machine using the existing function
            const result = runCSEMachine(code, context, context.control, context.stash);
            return result;
        }
        catch (error) {
            return { type: "error", message: error.message };
        }
    }
    function runCSEMachine(code, context, control, stash) {
        while (!control.isEmpty() && context.runtime.isRunning) {
            const item = control.pop();
            if (!item)
                break;
            evaluateControlItem(item, context, control, stash);
        }
        const result = stash.pop();
        return result || { type: "nil" };
    }
    function evaluateControlItem(item, context, control, stash) {
        if (isInstr(item)) {
            console.log("DEBUG: Evaluating instruction:", item.instrType);
            evaluateInstruction(item, context, control, stash);
        }
        else if (isStatementSequence(item)) {
            // Handle StatementSequence by pushing all expressions in reverse order
            const seq = item;
            for (let i = seq.body.length - 1; i >= 0; i--) {
                control.push(seq.body[i]);
            }
        }
        else {
            console.log("DEBUG: Evaluating expression:", item.constructor.name);
            evaluateExpression(item, context, control, stash);
        }
    }
    function isStatementSequence(item) {
        return "type" in item && item.type === "StatementSequence";
    }
    function isInstr(item) {
        return "instrType" in item;
    }
    function evaluateExpression(expr, context, control, stash) {
        if (expr instanceof Atomic.NumericLiteral) {
            console.log("DEBUG: Evaluating NumericLiteral:", expr.value);
            stash.push({ type: "number", value: parseFloat(expr.value) });
        }
        else if (expr instanceof Atomic.ComplexLiteral) {
            try {
                const complexNumber = SchemeComplexNumber.fromString(expr.value);
                stash.push({ type: "complex", value: complexNumber });
            }
            catch (error) {
                stash.push({
                    type: "error",
                    message: `Invalid complex number: ${error.message}`,
                });
            }
        }
        else if (expr instanceof Atomic.BooleanLiteral) {
            stash.push({ type: "boolean", value: expr.value });
        }
        else if (expr instanceof Atomic.StringLiteral) {
            stash.push({ type: "string", value: expr.value });
        }
        else if (expr instanceof Atomic.Symbol) {
            stash.push({ type: "symbol", value: expr.value });
        }
        else if (expr instanceof Atomic.Nil) {
            stash.push({ type: "nil" });
        }
        else if (expr instanceof Atomic.Identifier) {
            const value = context.environment.get(expr.name);
            stash.push(value);
        }
        else if (expr instanceof Atomic.Definition) {
            // Push the value to be evaluated, then the define instruction
            // The value will be evaluated first, then the define instruction will use the result
            console.log("DEBUG: Definition - expr.value type:", expr.value.constructor.name);
            console.log("DEBUG: Definition - expr.value:", expr.value);
            // Push the define instruction AFTER the value evaluation
            // This ensures the value is evaluated and pushed to stash before define runs
            console.log("DEBUG: Pushing define instruction after value evaluation");
            control.push(createDefineInstr(expr.name.name, expr.value));
            control.push(expr.value);
        }
        else if (expr instanceof Atomic.Reassignment) {
            // Push the value to be evaluated, then the set instruction
            control.push(expr.value);
            control.push(createSetInstr(expr.name.name, expr.value));
        }
        else if (expr instanceof Atomic.Application) {
            console.log("DEBUG: Evaluating Application with", expr.operands.length, "operands");
            // Push the application instruction first (so it's executed last)
            control.push(createAppInstr(expr.operands.length, expr));
            // Push the operator (so it's evaluated before the instruction)
            control.push(expr.operator);
            // Push operands in reverse order (so they are evaluated left-to-right)
            for (let i = expr.operands.length - 1; i >= 0; i--) {
                control.push(expr.operands[i]);
            }
        }
        else if (expr instanceof Atomic.Conditional) {
            console.log("DEBUG: Evaluating Conditional expression");
            // Push test expression first, then branch instruction
            // The branch instruction will decide which branch to take based on test result
            control.push(createBranchInstr(expr.consequent, expr.alternate));
            control.push(expr.test);
        }
        else if (expr instanceof Atomic.Lambda) {
            // Create closure
            const closure = {
                type: "closure",
                params: expr.params.map(p => p.name),
                body: [expr.body],
                env: context.environment,
            };
            stash.push(closure);
        }
        else if (expr instanceof Atomic.Pair) {
            // Push car and cdr to be evaluated, then pair instruction
            control.push(expr.car);
            control.push(expr.cdr);
            control.push(createPairInstr(expr.car, expr.cdr));
        }
        else if (expr instanceof Extended.List) {
            // Push elements to be evaluated, then list instruction
            for (let i = expr.elements.length - 1; i >= 0; i--) {
                control.push(expr.elements[i]);
            }
            control.push(createListInstr(expr.elements, expr.terminator));
        }
        else if (expr instanceof Atomic.Vector) {
            // Push elements to be evaluated, then vector instruction
            for (let i = expr.elements.length - 1; i >= 0; i--) {
                control.push(expr.elements[i]);
            }
            control.push(createVectorInstr(expr.elements));
        }
        else if (expr instanceof Extended.Begin) {
            // Push expressions to be evaluated, then begin instruction
            for (let i = expr.expressions.length - 1; i >= 0; i--) {
                control.push(expr.expressions[i]);
            }
            control.push(createBeginInstr(expr.expressions));
        }
        else if (expr instanceof Extended.Let) {
            // Push values, then let instruction
            for (let i = expr.values.length - 1; i >= 0; i--) {
                control.push(expr.values[i]);
            }
            control.push(createLetInstr(expr.identifiers.map(id => id.name), expr.values, expr.body));
        }
        else if (expr instanceof Extended.Cond) {
            // Push predicates and consequents, then cond instruction
            for (let i = expr.predicates.length - 1; i >= 0; i--) {
                control.push(expr.predicates[i]);
                control.push(expr.consequents[i]);
            }
            if (expr.catchall) {
                control.push(expr.catchall);
            }
            control.push(createCondInstr(expr.predicates, expr.consequents, expr.catchall));
        }
        else if (expr instanceof Extended.Delay) {
            // Push expression to be evaluated, then delay instruction
            control.push(expr.expression);
            control.push(createDelayInstr(expr.expression));
        }
        else {
            throw new Error(`Unsupported expression type: ${expr.constructor.name}`);
        }
    }
    function evaluateInstruction(instruction, context, control, stash) {
        switch (instruction.instrType) {
            case InstrType.DEFINE: {
                const value = stash.pop();
                if (!value) {
                    console.error("DEBUG: Stash is empty when define instruction runs");
                    console.error("DEBUG: Stash size:", stash.size());
                    console.error("DEBUG: Define instruction:", instruction);
                    throw new Error("No value to define");
                }
                const defineInstr = instruction;
                console.log("DEBUG: Defining", defineInstr.name, "with value:", value);
                context.environment.define(defineInstr.name, value);
                // Push void value to indicate successful definition
                stash.push({ type: "void" });
                break;
            }
            case InstrType.SET: {
                const value = stash.pop();
                if (!value)
                    throw new Error("No value to set");
                const setInstr = instruction;
                context.environment.set(setInstr.name, value);
                break;
            }
            case InstrType.APPLICATION: {
                console.log("DEBUG: Executing APPLICATION instruction");
                const appInstr = instruction;
                const operator = stash.pop();
                if (!operator)
                    throw new Error("No operator for application");
                console.log("DEBUG: Operator:", operator);
                const args = [];
                for (let i = 0; i < appInstr.numOfArgs; i++) {
                    const arg = stash.pop();
                    if (arg)
                        args.unshift(arg);
                }
                console.log("DEBUG: Arguments:", args);
                if (operator.type === "closure") {
                    // Apply closure - save current environment and create new one
                    const currentEnv = context.environment;
                    const newEnv = createBlockEnvironment(operator.env);
                    // Bind parameters to the new environment
                    for (let i = 0; i < operator.params.length; i++) {
                        newEnv.define(operator.params[i], args[i] || { type: "nil" });
                    }
                    // Set the new environment for function execution
                    context.environment = newEnv;
                    // Push a marker to restore environment after function execution
                    control.push(createRestoreEnvInstr(currentEnv));
                    // Push function body for execution
                    control.push(...operator.body);
                }
                else if (operator.type === "primitive") {
                    // Apply primitive function
                    try {
                        const result = operator.func(...args);
                        stash.push(result);
                    }
                    catch (error) {
                        stash.push({ type: "error", message: error.message });
                    }
                }
                else {
                    stash.push({
                        type: "error",
                        message: `Cannot apply non-function: ${operator.type}`,
                    });
                }
                break;
            }
            case InstrType.BRANCH: {
                console.log("DEBUG: Executing BRANCH instruction");
                const test = stash.pop();
                if (!test) {
                    console.error("DEBUG: No test value for branch - stash is empty");
                    console.error("DEBUG: Stash size:", stash.size());
                    throw new Error("No test value for branch");
                }
                console.log("DEBUG: Test value:", test);
                const branchInstr = instruction;
                // Check if test is truthy (not false and not nil)
                const isTruthy = test.type !== "boolean" || test.value !== false;
                if (isTruthy && test.type !== "nil") {
                    console.log("DEBUG: Taking consequent branch");
                    control.push(branchInstr.consequent);
                }
                else if (branchInstr.alternate) {
                    console.log("DEBUG: Taking alternate branch");
                    control.push(branchInstr.alternate);
                }
                break;
            }
            case InstrType.PAIR: {
                const cdr = stash.pop();
                const car = stash.pop();
                if (!car || !cdr)
                    throw new Error("Missing car or cdr for pair");
                stash.push({ type: "pair", car, cdr });
                break;
            }
            case InstrType.LIST: {
                const listInstr = instruction;
                const elements = [];
                for (let i = 0; i < listInstr.elements.length; i++) {
                    const element = stash.pop();
                    if (element)
                        elements.unshift(element);
                }
                stash.push({ type: "list", elements });
                break;
            }
            case InstrType.VECTOR: {
                const vectorInstr = instruction;
                const elements = [];
                for (let i = 0; i < vectorInstr.elements.length; i++) {
                    const element = stash.pop();
                    if (element)
                        elements.unshift(element);
                }
                stash.push({ type: "vector", elements });
                break;
            }
            case InstrType.BEGIN: {
                // Begin evaluates all expressions and returns the last one
                const beginInstr = instruction;
                const expressions = beginInstr.expressions;
                if (expressions.length === 0) {
                    stash.push({ type: "nil" });
                }
                else if (expressions.length === 1) {
                    control.push(expressions[0]);
                }
                else {
                    // Push all expressions to be evaluated
                    for (let i = expressions.length - 1; i >= 0; i--) {
                        control.push(expressions[i]);
                    }
                }
                break;
            }
            case InstrType.LET: {
                // Let creates a new environment with bindings
                const letInstr = instruction;
                const values = [];
                for (let i = 0; i < letInstr.values.length; i++) {
                    const value = stash.pop();
                    if (value)
                        values.unshift(value);
                }
                const newEnv = createBlockEnvironment(context.environment);
                for (let i = 0; i < letInstr.identifiers.length; i++) {
                    newEnv.define(letInstr.identifiers[i], values[i] || { type: "nil" });
                }
                context.environment = newEnv;
                control.push(letInstr.body);
                break;
            }
            case InstrType.COND: {
                // Cond evaluates predicates and consequents
                const condInstr = instruction;
                const predicates = condInstr.predicates;
                const consequents = condInstr.consequents;
                if (predicates.length === 0) {
                    if (condInstr.catchall) {
                        control.push(condInstr.catchall);
                    }
                    else {
                        stash.push({ type: "nil" });
                    }
                }
                else {
                    // Push first predicate and consequent
                    control.push(predicates[0]);
                    control.push(consequents[0]);
                    // Push remaining predicates and consequents
                    for (let i = 1; i < predicates.length; i++) {
                        control.push(predicates[i]);
                        control.push(consequents[i]);
                    }
                    if (condInstr.catchall) {
                        control.push(condInstr.catchall);
                    }
                }
                break;
            }
            case InstrType.RESTORE_ENV: {
                const restoreInstr = instruction;
                context.environment = restoreInstr.env;
                break;
            }
            default:
                throw new Error(`Unsupported instruction type: ${instruction.instrType}`);
        }
    }

    class SchemeEvaluator extends BasicEvaluator {
        constructor(conductor) {
            super(conductor);
            this.environment = createProgramEnvironment();
            this.context = {
                control: new Control(),
                stash: new Stash(),
                environment: this.environment,
                runtime: {
                    isRunning: true,
                },
            };
        }
        async evaluateChunk(chunk) {
            try {
                // Parse the Scheme code using simple parser
                const expressions = parseSchemeSimple(chunk);
                // Reset control and stash but keep the same environment
                this.context.control = new Control();
                this.context.stash = new Stash();
                this.context.runtime.isRunning = true;
                // Evaluate the expressions
                const result = evaluate(chunk, expressions, this.context);
                // Send output to the conductor (like py-slang)
                if (result.type === "error") {
                    this.conductor.sendOutput(`Error: ${result.message}`);
                }
                else {
                    // Send the result as output
                    this.conductor.sendOutput(this.valueToString(result));
                }
            }
            catch (error) {
                this.conductor.sendOutput(`Error: ${error instanceof Error ? error.message : error}`);
            }
        }
        valueToString(value) {
            if (value.type === "number") {
                return value.value.toString();
            }
            else if (value.type === "complex") {
                return value.value.toString();
            }
            else if (value.type === "string") {
                return value.value;
            }
            else if (value.type === "boolean") {
                return value.value ? "#t" : "#f";
            }
            else if (value.type === "symbol") {
                return value.value;
            }
            else if (value.type === "nil") {
                return "()";
            }
            else if (value.type === "void") {
                return ""; // Return empty string for void values (define statements)
            }
            else if (value.type === "pair") {
                return `(${this.valueToString(value.car)} . ${this.valueToString(value.cdr)})`;
            }
            else if (value.type === "list") {
                return `(${value.elements.map((el) => this.valueToString(el)).join(" ")})`;
            }
            else if (value.type === "vector") {
                return `#(${value.elements.map((el) => this.valueToString(el)).join(" ")})`;
            }
            else if (value.type === "closure") {
                return `#<procedure>`;
            }
            else if (value.type === "primitive") {
                return `#<primitive:${value.name}>`;
            }
            else if (value.type === "error") {
                return `Error: ${value.message}`;
            }
            else {
                return String(value);
            }
        }
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
        var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
        var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
        var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
        var _, done = false;
        for (var i = decorators.length - 1; i >= 0; i--) {
            var context = {};
            for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
            for (var p in contextIn.access) context.access[p] = contextIn.access[p];
            context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
            var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
            if (kind === "accessor") {
                if (result === void 0) continue;
                if (result === null || typeof result !== "object") throw new TypeError("Object expected");
                if (_ = accept(result.get)) descriptor.get = _;
                if (_ = accept(result.set)) descriptor.set = _;
                if (_ = accept(result.init)) initializers.unshift(_);
            }
            else if (_ = accept(result)) {
                if (kind === "field") initializers.unshift(_);
                else descriptor[key] = _;
            }
        }
        if (target) Object.defineProperty(target, contextIn.name, descriptor);
        done = true;
    }
    function __runInitializers(thisArg, initializers, value) {
        var useValue = arguments.length > 2;
        for (var i = 0; i < initializers.length; i++) {
            value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
        }
        return useValue ? value : void 0;
    }
    function __setFunctionName(f, name, prefix) {
        if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
        return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
    }
    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    /**
     * Imports an external plugin from a given location.
     * @param location Where to find the external plugin.
     * @returns A promise resolving to the imported plugin.
     */
    async function importExternalPlugin(location) {
        const plugin = (await import(/* webpackIgnore: true */ location))
            .plugin;
        // TODO: verify it is actually a plugin
        return plugin;
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    /**
     * Imports an external module from a given location.
     * @param location Where to find the external module.
     * @returns A promise resolving to the imported module.
     */
    async function importExternalModule(location) {
        const plugin = (await importExternalPlugin(location));
        // TODO: additional verification it is a module
        return plugin;
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    class Channel {
        send(message, transfer) {
            this.__verifyAlive();
            this.__port.postMessage(message, transfer ?? []);
        }
        subscribe(subscriber) {
            this.__verifyAlive();
            this.__subscribers.add(subscriber);
            if (this.__waitingMessages) {
                for (const data of this.__waitingMessages) {
                    subscriber(data);
                }
                delete this.__waitingMessages;
            }
        }
        unsubscribe(subscriber) {
            this.__verifyAlive();
            this.__subscribers.delete(subscriber);
        }
        close() {
            this.__verifyAlive();
            this.__isAlive = false;
            this.__port?.close();
        }
        /**
         * Check if this Channel is allowed to be used.
         * @throws Throws an error if the Channel has been closed.
         */
        __verifyAlive() {
            if (!this.__isAlive)
                throw new ConductorInternalError(`Channel ${this.name} has been closed`);
        }
        /**
         * Dispatch some data to subscribers.
         * @param data The data to be dispatched to subscribers.
         */
        __dispatch(data) {
            this.__verifyAlive();
            if (this.__waitingMessages) {
                this.__waitingMessages.push(data);
            }
            else {
                for (const subscriber of this.__subscribers) {
                    subscriber(data);
                }
            }
        }
        /**
         * Listens to the port's message event, and starts the port.
         * Messages will be buffered until the first subscriber listens to the Channel.
         * @param port The MessagePort to listen to.
         */
        listenToPort(port) {
            port.addEventListener("message", e => this.__dispatch(e.data));
            port.start();
        }
        /**
         * Replaces the underlying MessagePort of this Channel and closes it, and starts the new port.
         * @param port The new port to use.
         */
        replacePort(port) {
            this.__verifyAlive();
            this.__port?.close();
            this.__port = port;
            this.listenToPort(port);
        }
        constructor(name, port) {
            /** The callbacks subscribed to this Channel. */
            this.__subscribers = new Set(); // TODO: use WeakRef? but callbacks tend to be thrown away and leaking is better than incorrect behaviour
            /** Is the Channel allowed to be used? */
            this.__isAlive = true;
            this.__waitingMessages = [];
            this.name = name;
            this.replacePort(port);
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    /**
     * A stack-based queue implementation.
     * `push` and `pop` run in amortized constant time.
     */
    class Queue {
        constructor() {
            /** The output stack. */
            this.__s1 = [];
            /** The input stack. */
            this.__s2 = [];
        }
        /**
         * Adds an item to the queue.
         * @param item The item to be added to the queue.
         */
        push(item) {
            this.__s2.push(item);
        }
        /**
         * Removes an item from the queue.
         * @returns The item removed from the queue.
         * @throws If the queue is empty.
         */
        pop() {
            if (this.__s1.length === 0) {
                if (this.__s2.length === 0)
                    throw new Error("queue is empty");
                let temp = this.__s1;
                this.__s1 = this.__s2.reverse();
                this.__s2 = temp;
            }
            return this.__s1.pop(); // as the length is nonzero
        }
        /**
         * The length of the queue.
         */
        get length() {
            return this.__s1.length + this.__s2.length;
        }
        /**
         * Makes a copy of the queue.
         * @returns A copy of the queue.
         */
        clone() {
            const newQueue = new Queue();
            newQueue.__s1 = [...this.__s1];
            newQueue.__s2 = [...this.__s2];
            return newQueue;
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    class MessageQueue {
        push(item) {
            if (this.__promiseQueue.length !== 0)
                this.__promiseQueue.pop()(item);
            else
                this.__inputQueue.push(item);
        }
        async pop() {
            if (this.__inputQueue.length !== 0)
                return this.__inputQueue.pop();
            return new Promise((resolve, _reject) => {
                this.__promiseQueue.push(resolve);
            });
        }
        tryPop() {
            if (this.__inputQueue.length !== 0)
                return this.__inputQueue.pop();
            return undefined;
        }
        constructor() {
            this.__inputQueue = new Queue();
            this.__promiseQueue = new Queue();
            this.push = this.push.bind(this);
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    class ChannelQueue {
        async receive() {
            return this.__messageQueue.pop();
        }
        tryReceive() {
            return this.__messageQueue.tryPop();
        }
        send(message, transfer) {
            this.__channel.send(message, transfer);
        }
        close() {
            this.__channel.unsubscribe(this.__messageQueue.push);
        }
        constructor(channel) {
            this.__messageQueue = new MessageQueue();
            this.name = channel.name;
            this.__channel = channel;
            this.__channel.subscribe(this.__messageQueue.push);
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    class Conduit {
        __negotiateChannel(channelName) {
            const { port1, port2 } = new MessageChannel();
            const channel = new Channel(channelName, port1);
            this.__link.postMessage([channelName, port2], [port2]); // TODO: update communication protocol?
            this.__channels.set(channelName, channel);
        }
        __verifyAlive() {
            if (!this.__alive)
                throw new ConductorInternalError("Conduit already terminated");
        }
        registerPlugin(pluginClass, ...arg) {
            this.__verifyAlive();
            const attachedChannels = [];
            for (const channelName of pluginClass.channelAttach) {
                if (!this.__channels.has(channelName))
                    this.__negotiateChannel(channelName);
                attachedChannels.push(this.__channels.get(channelName)); // as the Channel has been negotiated
            }
            const plugin = new pluginClass(this, attachedChannels, ...arg);
            if (plugin.name !== undefined) {
                if (this.__pluginMap.has(plugin.name))
                    throw new ConductorInternalError(`Plugin ${plugin.name} already registered`);
                this.__pluginMap.set(plugin.name, plugin);
            }
            this.__plugins.push(plugin);
            return plugin;
        }
        unregisterPlugin(plugin) {
            this.__verifyAlive();
            let p = 0;
            for (let i = 0; i < this.__plugins.length; ++i) {
                if (this.__plugins[p] === plugin)
                    ++p;
                this.__plugins[i] = this.__plugins[i + p];
            }
            for (let i = this.__plugins.length - 1, e = this.__plugins.length - p; i >= e; --i) {
                delete this.__plugins[i];
            }
            if (plugin.name) {
                this.__pluginMap.delete(plugin.name);
            }
            plugin.destroy?.();
        }
        lookupPlugin(pluginName) {
            this.__verifyAlive();
            if (!this.__pluginMap.has(pluginName))
                throw new ConductorInternalError(`Plugin ${pluginName} not registered`);
            return this.__pluginMap.get(pluginName); // as the map has been checked
        }
        terminate() {
            this.__verifyAlive();
            for (const plugin of this.__plugins) {
                //this.unregisterPlugin(plugin);
                plugin.destroy?.();
            }
            this.__link.terminate?.();
            this.__alive = false;
        }
        __handlePort(data) {
            // TODO: update communication protocol?
            const [channelName, port] = data;
            if (this.__channels.has(channelName)) {
                // uh-oh, we already have a port for this channel
                const channel = this.__channels.get(channelName); // as the map has been checked
                if (this.__parent) {
                    // extract the data and discard the messageport; child's Channel will close it
                    channel.listenToPort(port);
                }
                else {
                    // replace our messageport; Channel will close it
                    channel.replacePort(port);
                }
            }
            else {
                // register the new channel
                const channel = new Channel(channelName, port);
                this.__channels.set(channelName, channel);
            }
        }
        constructor(link, parent = false) {
            this.__alive = true;
            this.__channels = new Map();
            this.__pluginMap = new Map();
            this.__plugins = [];
            this.__link = link;
            link.addEventListener("message", e => this.__handlePort(e.data));
            this.__parent = parent;
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    class RpcCallMessage {
        constructor(fn, args, invokeId) {
            this.type = 0 /* RpcMessageType.CALL */;
            this.data = { fn, args, invokeId };
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    class RpcErrorMessage {
        constructor(invokeId, err) {
            this.type = 2 /* RpcMessageType.RETURN_ERR */;
            this.data = { invokeId, err };
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    class RpcReturnMessage {
        constructor(invokeId, res) {
            this.type = 1 /* RpcMessageType.RETURN */;
            this.data = { invokeId, res };
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    function makeRpc(channel, self) {
        const waiting = [];
        let invocations = 0;
        const otherCallbacks = {};
        channel.subscribe(async (rpcMessage) => {
            switch (rpcMessage.type) {
                case 0 /* RpcMessageType.CALL */: {
                    const { fn, args, invokeId } = rpcMessage.data;
                    try {
                        // @ts-expect-error
                        const res = await self[fn](...args);
                        if (invokeId > 0)
                            channel.send(new RpcReturnMessage(invokeId, res));
                    }
                    catch (err) {
                        if (invokeId > 0)
                            channel.send(new RpcErrorMessage(invokeId, err));
                    }
                    break;
                }
                case 1 /* RpcMessageType.RETURN */: {
                    const { invokeId, res } = rpcMessage.data;
                    waiting[invokeId]?.[0]?.(res);
                    delete waiting[invokeId];
                    break;
                }
                case 2 /* RpcMessageType.RETURN_ERR */: {
                    const { invokeId, err } = rpcMessage.data;
                    waiting[invokeId]?.[1]?.(err);
                    delete waiting[invokeId];
                    break;
                }
            }
        });
        return new Proxy(otherCallbacks, {
            // TODO: transferring functions
            get(target, p, receiver) {
                const cb = Reflect.get(target, p, receiver);
                if (cb)
                    return cb;
                const newCallback = typeof p === "string" && p.charAt(0) === "$"
                    ? (...args) => {
                        channel.send(new RpcCallMessage(p, args, 0));
                    }
                    : (...args) => {
                        const invokeId = ++invocations;
                        channel.send(new RpcCallMessage(p, args, invokeId));
                        return new Promise((resolve, reject) => {
                            waiting[invokeId] = [resolve, reject];
                        });
                    };
                Reflect.set(target, p, newCallback, receiver);
                return newCallback;
            },
        });
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    /**
     * Typechecking utility decorator.
     * It is recommended that usage of this decorator is removed
     * before or during the build process, as some tools
     * (e.g. terser) do not have good support for class decorators.
     * @param _pluginClass The Class to be typechecked.
     */
    function checkIsPluginClass(_pluginClass) { }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    var DataType;
    (function (DataType) {
        /** The return type of functions with no returned value. As a convention, the associated JS value is undefined. */
        DataType[DataType["VOID"] = 0] = "VOID";
        /** A Boolean value. */
        DataType[DataType["BOOLEAN"] = 1] = "BOOLEAN";
        /** A numerical value. */
        DataType[DataType["NUMBER"] = 2] = "NUMBER";
        /** An immutable string of characters. */
        DataType[DataType["CONST_STRING"] = 3] = "CONST_STRING";
        /** The empty list. As a convention, the associated JS value is null. */
        DataType[DataType["EMPTY_LIST"] = 4] = "EMPTY_LIST";
        /** A pair of values. Reference type. */
        DataType[DataType["PAIR"] = 5] = "PAIR";
        /** An array of values of a single type. Reference type. */
        DataType[DataType["ARRAY"] = 6] = "ARRAY";
        /** A value that can be called with fixed arity. Reference type. */
        DataType[DataType["CLOSURE"] = 7] = "CLOSURE";
        /** An opaque value that cannot be manipulated from user code. */
        DataType[DataType["OPAQUE"] = 8] = "OPAQUE";
        /** A list (either a pair or the empty list). */
        DataType[DataType["LIST"] = 9] = "LIST";
    })(DataType || (DataType = {}));

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    class AbortServiceMessage {
        constructor(minVersion) {
            this.type = 1 /* ServiceMessageType.ABORT */;
            this.data = { minVersion: minVersion };
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    class HelloServiceMessage {
        constructor() {
            this.type = 0 /* ServiceMessageType.HELLO */;
            this.data = { version: 0 /* Constant.PROTOCOL_VERSION */ };
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    class PluginServiceMessage {
        constructor(pluginName) {
            this.type = 3 /* ServiceMessageType.PLUGIN */;
            this.data = pluginName;
        }
    }

    // This file is adapted from:
    // https://github.com/source-academy/conductor
    // Original author(s): Source Academy Team
    let RunnerPlugin = (() => {
        let _classDecorators = [checkIsPluginClass];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        _classThis = class {
            requestFile(fileName) {
                return this.__fileRpc.requestFile(fileName);
            }
            async requestChunk() {
                return (await this.__chunkQueue.receive()).chunk;
            }
            async requestInput() {
                const { message } = await this.__ioQueue.receive();
                return message;
            }
            tryRequestInput() {
                const out = this.__ioQueue.tryReceive();
                return out?.message;
            }
            sendOutput(message) {
                this.__ioQueue.send({ message });
            }
            sendError(error) {
                this.__errorChannel.send({ error });
            }
            updateStatus(status, isActive) {
                this.__statusChannel.send({ status, isActive });
            }
            hostLoadPlugin(pluginName) {
                this.__serviceChannel.send(new PluginServiceMessage(pluginName));
            }
            registerPlugin(pluginClass, ...arg) {
                return this.__conduit.registerPlugin(pluginClass, ...arg);
            }
            unregisterPlugin(plugin) {
                this.__conduit.unregisterPlugin(plugin);
            }
            registerModule(moduleClass) {
                if (!this.__isCompatibleWithModules)
                    throw new ConductorInternalError("Evaluator has no data interface");
                return this.registerPlugin(moduleClass, this.__evaluator);
            }
            unregisterModule(module) {
                this.unregisterPlugin(module);
            }
            async importAndRegisterExternalPlugin(location, ...arg) {
                const pluginClass = await importExternalPlugin(location);
                return this.registerPlugin(pluginClass, ...arg);
            }
            async importAndRegisterExternalModule(location) {
                const moduleClass = await importExternalModule(location);
                return this.registerModule(moduleClass);
            }
            constructor(conduit, [fileChannel, chunkChannel, serviceChannel, ioChannel, errorChannel, statusChannel,], evaluatorClass) {
                this.name = "__runner_main" /* InternalPluginName.RUNNER_MAIN */;
                // @ts-expect-error TODO: figure proper way to typecheck this
                this.__serviceHandlers = new Map([
                    [
                        0 /* ServiceMessageType.HELLO */,
                        function helloServiceHandler(message) {
                            if (message.data.version < 0 /* Constant.PROTOCOL_MIN_VERSION */) {
                                this.__serviceChannel.send(new AbortServiceMessage(0 /* Constant.PROTOCOL_MIN_VERSION */));
                                console.error(`Host's protocol version (${message.data.version}) must be at least ${0 /* Constant.PROTOCOL_MIN_VERSION */}`);
                            }
                            else {
                                console.log(`Host is using protocol version ${message.data.version}`);
                            }
                        },
                    ],
                    [
                        1 /* ServiceMessageType.ABORT */,
                        function abortServiceHandler(message) {
                            console.error(`Host expects at least protocol version ${message.data.minVersion}, but we are on version ${0 /* Constant.PROTOCOL_VERSION */}`);
                            this.__conduit.terminate();
                        },
                    ],
                    [
                        2 /* ServiceMessageType.ENTRY */,
                        function entryServiceHandler(message) {
                            this.__evaluator.startEvaluator(message.data);
                        },
                    ],
                ]);
                this.__conduit = conduit;
                this.__fileRpc = makeRpc(fileChannel, {});
                this.__chunkQueue = new ChannelQueue(chunkChannel);
                this.__serviceChannel = serviceChannel;
                this.__ioQueue = new ChannelQueue(ioChannel);
                this.__errorChannel = errorChannel;
                this.__statusChannel = statusChannel;
                // Use SchemeEvaluator instead of BasicEvaluator
                this.__evaluator = new SchemeEvaluator(this);
                this.__isCompatibleWithModules = false;
                this.__serviceChannel.send(new HelloServiceMessage());
                this.__serviceChannel.subscribe(message => {
                    const handler = this.__serviceHandlers.get(message.type);
                    if (handler) {
                        handler.call(this, message);
                    }
                });
            }
        };
        __setFunctionName(_classThis, "RunnerPlugin");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })();
        _classThis.channelAttach = [
            "__file_rpc" /* InternalChannelName.FILE */,
            "__chunk" /* InternalChannelName.CHUNK */,
            "__service" /* InternalChannelName.SERVICE */,
            "__stdio" /* InternalChannelName.STANDARD_IO */,
            "__error" /* InternalChannelName.ERROR */,
            "__status" /* InternalChannelName.STATUS */,
        ];
        (() => {
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return _classThis;
    })();

    /**
     * Initialise this runner with the evaluator to be used.
     * @param evaluatorClass The Evaluator to be used on this runner.
     * @param link The underlying communication link.
     * @returns The initialised `runnerPlugin` and `conduit`.
     */
    function initialise(evaluatorClass, link = (typeof self !== "undefined"
        ? self
        : typeof global !== "undefined"
            ? global
            : {
                addEventListener: () => { },
                postMessage: () => { },
                onmessage: null,
            })) {
        // Skip conductor initialization in browser environment for now
        // This is causing issues with postMessage
        if (typeof window !== "undefined") {
            // Return mock objects for browser
            return {
                runnerPlugin: {},
                conduit: {},
            };
        }
        const conduit = new Conduit(link, false);
        const runnerPlugin = conduit.registerPlugin(RunnerPlugin, evaluatorClass);
        return { runnerPlugin, conduit };
    }

    // Import encode/decode functions directly to avoid circular dependency
    const b64Encode$1 = (str) => btoa(unescape(encodeURIComponent(str)));
    const b64Decode$1 = (str) => decodeURIComponent(escape(atob(str)));
    const JS_KEYWORDS$1 = [
        "break",
        "case",
        "catch",
        "class",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "eval",
        "export",
        "extends",
        "false",
        "finally",
        "for",
        "function",
        "if",
        "import",
        "in",
        "instanceof",
        "new",
        "return",
        "super",
        "switch",
        "this",
        "throw",
        "true",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",
        "yield",
        "enum",
        "await",
        "implements",
        "package",
        "protected",
        "static",
        "interface",
        "private",
        "public",
    ];
    function encode$1(identifier) {
        if (JS_KEYWORDS$1.includes(identifier) || identifier.startsWith("$scheme_")) {
            return ("$scheme_" +
                b64Encode$1(identifier).replace(/([^a-zA-Z0-9_])/g, (match) => `\$${match.charCodeAt(0)}\$`));
        }
        else {
            return identifier.replace(/([^a-zA-Z0-9_])/g, (match) => `\$${match.charCodeAt(0)}\$`);
        }
    }
    function decode$1(identifier) {
        if (identifier.startsWith("$scheme_")) {
            return b64Decode$1(identifier
                .slice(8)
                .replace(/\$([0-9]+)\$/g, (_, code) => String.fromCharCode(parseInt(code))));
        }
        else {
            return identifier.replace(/\$([0-9]+)\$/g, (_, code) => String.fromCharCode(parseInt(code)));
        }
    }
    // Simple AST walker to replace acorn-walk
    function walkFull(ast, visitor) {
        visitor(ast);
        // Walk through all properties that might contain nodes
        for (const key in ast) {
            const value = ast[key];
            if (value && typeof value === "object") {
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        if (item && typeof item === "object" && item.type) {
                            walkFull(item, visitor);
                        }
                    });
                }
                else if (value.type) {
                    walkFull(value, visitor);
                }
            }
        }
    }
    // A function to modify all names in the estree program.
    // Prevents any name collisions with JS keywords and invalid characters.
    function estreeEncode(ast) {
        walkFull(ast, (node) => {
            if (node.encoded === true) {
                return;
            }
            if (node.type === "Identifier") {
                node.name = encode$1(node.name);
                // ensures the conversion is only done once
                node.encoded = true;
            }
        });
        walkFull(ast, (node) => {
            node.encoded = undefined;
        });
        return ast;
    }
    function estreeDecode(ast) {
        walkFull(ast, (node) => {
            if (node.decoded === true) {
                return;
            }
            if (node.type === "Identifier") {
                node.name = decode$1(node.name);
                // ensures the conversion is only done once
                node.decoded = true;
            }
        });
        walkFull(ast, (node) => {
            node.decoded = undefined;
        });
        return ast;
    }

    function unparse(node) {
        //if ((node as any)?.hidden) return "";
        switch (node.type) {
            case "Identifier":
                return node.name;
            case "Literal":
                return node.raw;
            case "CallExpression":
                const callee = unparse(node.callee);
                const args = node.arguments.map(unparse).join(" ");
                return `(${callee} ${args})`;
            case "ArrayExpression":
                const elements = node.elements.map(s => unparse(s)).join(" ");
                return `(vector ${elements})`;
            case "ArrowFunctionExpression":
                const params = node.params.map(unparse).join(" ");
                const body = unparse(node.body);
                return `(lambda (${params}) ${body})`;
            case "RestElement":
                return `. ${unparse(node.argument)}`;
            case "BlockStatement":
                const statements = node.body.map(unparse).join(" ");
                return `(begin ${statements})`;
            case "ReturnStatement":
                const argument = unparse(node.argument);
                return argument;
            case "VariableDeclaration":
                const id = unparse(node.declarations[0].id);
                const init = unparse(node.declarations[0].init);
                return `(define ${id} ${init})`;
            case "ExpressionStatement":
                return unparse(node.expression);
            case "AssignmentExpression":
                const left = unparse(node.left);
                const right = unparse(node.right);
                return `(set! ${left} ${right})`;
            case "ConditionalExpression":
                const test = unparse(node.test);
                const consequent = unparse(node.consequent);
                const alternate = unparse(node.alternate);
                return `(if ${test} ${consequent} ${alternate})`;
            case "Program":
                return node.body.map(unparse).join("\n");
            case "ImportDeclaration":
                const identifiers = node.specifiers.map(unparse).join(" ");
                const source = unparse(node.source);
                return `(import (${source} ${identifiers}))`;
            case "ExportNamedDeclaration":
                const definition = unparse(node.declaration);
                return `(export ${definition})`;
            default:
                throw new Error(`Unparsing for node type ${node.type} not implemented`);
        }
    }

    // Simple stepper implementation
    function createSimpleStepperNode(node) {
        const nodeType = node.constructor.name;
        console.log('[SCM-STEPPER] createSimpleStepperNode:', { nodeType, node });
        switch (nodeType) {
            case 'NumericLiteral':
            case 'BooleanLiteral':
            case 'StringLiteral':
                return {
                    type: 'Literal',
                    value: node.value,
                    raw: String(node.value),
                    toString: () => String(node.value),
                    isContractible: () => true,
                    isOneStepPossible: () => false,
                    contract: function () { return this; },
                    oneStep: function () { return this; }
                };
            case 'Identifier':
                return {
                    type: 'Identifier',
                    name: node.name,
                    toString: () => node.name,
                    isContractible: () => true,
                    isOneStepPossible: () => false,
                    contract: function () { return this; },
                    oneStep: function () { return this; }
                };
            case 'Application': {
                const opNode = createSimpleStepperNode(node.operator);
                const ops = node.operands.map(createSimpleStepperNode);
                // keep prefix application; arithmetic handled in FunctionApplication.oneStep
                return {
                    type: 'FunctionApplication',
                    operator: opNode,
                    operands: ops,
                    toString: function () { return `(${this.operator.toString()} ${this.operands.map((n) => n.toString()).join(' ')})`; },
                    isContractible: function () { 
                        const isPrim = this.operator.type === 'Identifier' && ['+', '-', '*', '/'].includes(this.operator.name);
                        const isUserFunc = this.operator.type === 'Identifier' && globalEnv[this.operator.name];
                        return (isPrim && this.operands.every((op) => op.type === 'Literal')) || 
                               (this.operator.type === 'LambdaExpression' && this.operands.every((op) => op.isContractible())) ||
                               (isUserFunc && this.operands.every((op) => op.isContractible ? op.isContractible() : true)); 
                    },
                    isOneStepPossible: function () { 
                        const result = this.operands.some((op) => op.isOneStepPossible()) || this.isContractible();
                        console.log('[SCM-STEPPER] isOneStepPossible:', { 
                            operandsSome: this.operands.some((op) => op.isOneStepPossible()),
                            isContractible: this.isContractible(),
                            result: result,
                            operatorType: this.operator.type,
                            operatorName: this.operator.name
                        });
                        return result;
                    },
                    contract: function () { return this; },
                    oneStep: function () {
                        // Step only the first reducible operand
                        for (let i = 0; i < this.operands.length; i++) {
                            const op = this.operands[i];
                            if (op.isOneStepPossible && op.isOneStepPossible()) {
                                const newOperands = [...this.operands];
                                newOperands[i] = op.oneStep();
                                return { ...this, operands: newOperands };
                            }
                        }
                        // No operand stepped; try to contract
                        const isPrim = this.operator.type === 'Identifier' && ['+', '-', '*', '/'].includes(this.operator.name);
                        if (isPrim && this.operands.every((op) => op.type === 'Literal')) {
                            const a = Number(this.operands[0].value);
                            const b = Number(this.operands[1].value);
                            let result = 0;
                            switch (this.operator.name) {
                                case '+':
                                    result = a + b;
                                    break;
                                case '-':
                                    result = a - b;
                                    break;
                                case '*':
                                    result = a * b;
                                    break;
                                case '/':
                                    result = a / b;
                                    break;
                            }
                            return { type: 'Literal', value: result, raw: String(result), toString: () => String(result), isContractible: () => true, isOneStepPossible: () => false, contract: function () { return this; }, oneStep: function () { return this; } };
                        }
                        console.log('[SCM-STEPPER] Checking lambda condition:', { 
                            operatorType: this.operator.type, 
                            operandsContractible: this.operands.every((op) => op.isContractible ? op.isContractible() : true) 
                        });
                        if (this.operator.type === 'LambdaExpression' && this.operands.every((op) => op.isContractible ? op.isContractible() : true)) {
                            const params = this.operator.params || [];
                            const env = {};
                            for (let i = 0; i < Math.min(params.length, this.operands.length); i++) {
                                const param = params[i];
                                const name = param && param.name ? param.name : undefined;
                                if (name)
                                    env[name] = this.operands[i];
                            }
                            console.log('[SCM-STEPPER] Lambda reduction:', { params, env, body: this.operator.body });
                            const reduced = substitute(this.operator.body, env);
                            console.log('[SCM-STEPPER] Reduced result:', JSON.stringify(reduced));
                            return reduced;
                        }
                        // Handle function calls (operator is Identifier, operands are arguments)
                        console.log('[SCM-STEPPER] Checking function call condition:', { 
                            operatorType: this.operator.type, 
                            operatorName: this.operator.name,
                            operandsContractible: this.operands.every((op) => op.isContractible ? op.isContractible() : true) 
                        });
                        if (this.operator.type === 'Identifier' && this.operands.every((op) => op.isContractible ? op.isContractible() : true)) {
                            const funcName = this.operator.name;
                            // Handle built-in functions like +, -, *, /
                            if (['+', '-', '*', '/'].includes(funcName) && this.operands.length === 2) {
                                const a = Number(this.operands[0].value);
                                const b = Number(this.operands[1].value);
                                let result = 0;
                                switch (funcName) {
                                    case '+':
                                        result = a + b;
                                        break;
                                    case '-':
                                        result = a - b;
                                        break;
                                    case '*':
                                        result = a * b;
                                        break;
                                    case '/':
                                        result = a / b;
                                        break;
                                }
                                return { type: 'Literal', value: result, raw: String(result), toString: () => String(result), isContractible: () => true, isOneStepPossible: () => false, contract: function () { return this; }, oneStep: function () { return this; } };
                            }
                            
                            // Handle user-defined functions
                            if (globalEnv[funcName]) {
                                console.log('[SCM-STEPPER] User function call:', funcName, 'with args:', this.operands);
                                const funcDef = globalEnv[funcName];
                                console.log('[SCM-STEPPER] Function definition:', funcDef);
                                const params = funcDef.params || [];
                                const env = {};
                                for (let i = 0; i < Math.min(params.length, this.operands.length); i++) {
                                    const param = params[i];
                                    const name = param && param.name ? param.name : undefined;
                                    if (name)
                                        env[name] = this.operands[i];
                                }
                                console.log('[SCM-STEPPER] Function substitution env:', env);
                                const reduced = substitute(funcDef.body, env);
                                console.log('[SCM-STEPPER] Function reduced result:', JSON.stringify(reduced));
                                return reduced;
                            } else {
                                console.log('[SCM-STEPPER] Function not found in globalEnv:', funcName, 'Available:', Object.keys(globalEnv));
                            }
                        }
                        return this;
                    }
                };
            }
            case 'Lambda':
                const body = createSimpleStepperNode(node.body);
                return {
                    type: 'LambdaExpression',
                    params: node.params || [],
                    body,
                    toString: () => `(lambda (${(node.params || []).map((p) => p.name).join(' ')}) ${body.toString()})`,
                    isContractible: () => true,
                    isOneStepPossible: () => false,
                    contract: function () { return this; },
                    oneStep: function () { return this; }
                };
            case 'FunctionDeclaration':
                const funcBody = createSimpleStepperNode(node.body);
                const funcName = node.name || 'anonymous';
                // Store function definition in global environment
                globalEnv[funcName] = {
                    type: 'LambdaExpression',
                    params: node.params || [],
                    body: funcBody
                };
                console.log('[SCM-STEPPER] Function defined:', funcName, globalEnv[funcName]);
                return {
                    type: 'FunctionDeclaration',
                    name: funcName,
                    params: node.params || [],
                    body: funcBody,
                    toString: () => `(define (${funcName} ${(node.params || []).map((p) => p.name).join(' ')}) ${funcBody.toString()})`,
                    isContractible: () => true,
                    isOneStepPossible: () => false,
                    contract: function () { return this; },
                    oneStep: function () { return this; }
                };
            case 'Definition':
                try {
                    console.log('[SCM-STEPPER] Processing Definition node:', node);
                    const defBody = createSimpleStepperNode(node.value);
                    const defName = node.name ? node.name.name : 'anonymous';
                    // Store function definition in global environment
                    globalEnv[defName] = {
                        type: 'LambdaExpression',
                        params: node.value.params || [],
                        body: createSimpleStepperNode(node.value.body)
                    };
                    console.log('[SCM-STEPPER] Function defined:', defName, globalEnv[defName]);
                    return {
                        type: 'FunctionDeclaration',
                        name: defName,
                        params: node.value.params || [],
                        body: defBody,
                        toString: () => `(define (${defName} ${(node.value.params || []).map((p) => p.name).join(' ')}) ${defBody.toString()})`,
                        isContractible: () => true,
                        isOneStepPossible: () => false,
                        contract: function () { return this; },
                        oneStep: function () { return this; }
                    };
                } catch (error) {
                    console.error('[SCM-STEPPER] Error in Definition case:', error);
                    return {
                        type: 'Literal',
                        value: 'error',
                        raw: 'error',
                        toString: () => 'error',
                        isContractible: () => true,
                        isOneStepPossible: () => false,
                        contract: function () { return this; },
                        oneStep: function () { return this; }
                    };
                }
            case 'Sequence':
                const bodyNodes = node.expressions.map(createSimpleStepperNode);
                return {
                    type: 'Program',
                    body: bodyNodes,
                    toString: function () { return this.body.map((n) => n.toString()).join('\n'); },
                    isContractible: function () { return this.body.every((expr) => expr.isContractible()); },
                    isOneStepPossible: function () { return this.body.some((expr) => expr.isOneStepPossible()); },
                    contract: function () {
                        if (!this.isContractible()) {
                            throw new Error('Cannot contract non-contractible program');
                        }
                        const contractedBody = this.body.map((expr) => expr.contract());
                        if (contractedBody.length === 1) {
                            return contractedBody[0];
                        }
                        return { ...this, body: contractedBody };
                    },
                    oneStep: function () {
                        for (let i = 0; i < this.body.length; i++) {
                            const expr = this.body[i];
                            if (expr.isOneStepPossible()) {
                                const newBody = [...this.body];
                                newBody[i] = expr.oneStep();
                                return { ...this, body: newBody };
                            }
                        }
                        if (this.isContractible()) {
                            return this.contract();
                        }
                        return this;
                    }
                };
            default:
                return {
                    type: 'Literal',
                    value: 'undefined',
                    raw: 'undefined',
                    toString: () => 'undefined',
                    isContractible: () => true,
                    isOneStepPossible: () => false,
                    contract: function () { return this; },
                    oneStep: function () { return this; }
                };
        }
    }
    // Global environment to store function definitions
    const globalEnv = {};
    
    // Simple substitute function for lambda reduction
    function substitute(node, env) {
        if (node.type === 'Identifier') {
            return env[node.name] || node;
        } else if (node.type === 'Literal') {
            return node;
        } else if (node.type === 'FunctionApplication') {
            return {
                type: 'FunctionApplication',
                operator: substitute(node.operator, env),
                operands: node.operands.map(op => substitute(op, env)),
                toString: function() { return `(${this.operator.toString()} ${this.operands.map(op => op.toString()).join(' ')})`; },
                isContractible: function() { return this.operator.type === 'Identifier' && ['+', '-', '*', '/'].includes(this.operator.name) && this.operands.every(op => op.type === 'Literal'); },
                isOneStepPossible: function() { return this.isContractible(); },
                contract: function() { 
                    if (this.isContractible()) {
                        const op = this.operator.name;
                        const left = this.operands[0].value;
                        const right = this.operands[1].value;
                        let result;
                        if (op === '+') result = left + right;
                        else if (op === '-') result = left - right;
                        else if (op === '*') result = left * right;
                        else if (op === '/') result = left / right;
                        return { type: 'Literal', value: result, raw: String(result), toString: () => String(result), isContractible: () => true, isOneStepPossible: () => false, contract: function () { return this; }, oneStep: function () { return this; } };
                    }
                    return this;
                },
                oneStep: function() { return this.contract(); }
            };
        }
        return node;
    }
    
    function stepExpression(code, stepLimit = 1000) {
        try {
            console.log('[SCM-STEPPER] stepExpression called with:', code);
            // Utilities to emulate js-slang stepper behaviour
            const isOneStepPossibleSafe = n => !!n && typeof n.isOneStepPossible === 'function' && n.isOneStepPossible();
            const isContractibleSafe = n => !!n && typeof n.isContractible === 'function' && n.isContractible();
            const getNodeAtPath = (node, path) => {
                let cur = node;
                for (const seg of path) {
                    if (cur == null)
                        return cur;
                    if (seg.key === 'left' || seg.key === 'right') {
                        cur = cur[seg.key];
                    }
                    else if (seg.key === 'body' || seg.key === 'operands') {
                        const arr = cur[seg.key];
                        cur = Array.isArray(arr) ? arr[seg.index] : undefined;
                    }
                }
                return cur;
            };
            const findReduciblePath = (node) => {
                if (!node)
                    return null;
                switch (node.type) {
                    case 'Program': {
                        const body = node.body || [];
                        for (let i = 0; i < body.length; i++) {
                            const sub = body[i];
                            const subPath = findReduciblePath(sub);
                            if (subPath)
                                return [{ key: 'body', index: i }, ...subPath];
                        }
                        return isContractibleSafe(node) ? [] : null;
                    }
                    case 'BinaryExpression': {
                        const left = node.left;
                        const right = node.right;
                        if (isOneStepPossibleSafe(left))
                            return [{ key: 'left' }, ...(findReduciblePath(left) || [])];
                        if (isOneStepPossibleSafe(right))
                            return [{ key: 'right' }, ...(findReduciblePath(right) || [])];
                        return isContractibleSafe(node) ? [] : null;
                    }
                    case 'FunctionApplication': {
                        const ops = node.operands || [];
                        for (let i = 0; i < ops.length; i++) {
                            const sub = ops[i];
                            if (isOneStepPossibleSafe(sub))
                                return [{ key: 'operands', index: i }, ...(findReduciblePath(sub) || [])];
                        }
                        return isContractibleSafe(node) ? [] : null;
                    }
                    default:
                        return null;
                }
            };
            // Helper: convert node to string representation (like js-slang's bodify)
            const nodeToString = (node) => {
                if (!node) return '?';
                switch (node.type) {
                    case 'Literal':
                        return node.raw !== undefined ? node.raw : String(node.value);
                    case 'Identifier':
                        return node.name;
                    case 'FunctionApplication':
                        const op = node.operator?.name || '?';
                        const args = (node.operands || []).map(nodeToString).join(' ');
                        return `(${op} ${args})`;
                    default:
                        return node.toString ? node.toString() : '?';
                }
            };
            
            const explainRedex = (node) => {
                if (node && node.type === 'FunctionApplication' && node.operator && node.operator.type === 'Identifier') {
                    if (['+','-','*','/'].includes(node.operator.name)) {
                        return `Binary expression ${nodeToString(node)} evaluated`;
                    } else {
                        return `Function ${node.operator.name} called`;
                    }
                }
                if (node && node.type === 'LambdaExpression') {
                    return `Lambda expression ${nodeToString(node)} evaluated`;
                }
                return 'Step';
            };
            const canReduce = (node) => {
                if (!node || typeof node !== 'object')
                    return false;
                switch (node.type) {
                    case 'Literal':
                    case 'Identifier':
                        return false;
                    case 'LambdaExpression':
                        return canReduce(node.body);
                    case 'Program':
                        return (node.body || []).some((b) => canReduce(b));
                    case 'FunctionApplication': {
                        const ops = node.operands || [];
                        if (ops.some((o) => canReduce(o)))
                            return true;
                        const isPrim = node.operator && node.operator.type === 'Identifier' && ['+', '-', '*', '/'].includes(node.operator.name);
                        const allLit = ops.length >= 2 && ops.every((o) => o.type === 'Literal');
                        const allContractible = ops.every((o) => (o.isContractible ? o.isContractible() : true));
                        return (isPrim && allLit) || (node.operator && node.operator.type === 'LambdaExpression' && allContractible);
                    }
                    default:
                        return false;
                }
            };
            const expressions = parseSchemeSimple(code);
            try { if (typeof console !== 'undefined') console.log('[SCM-STEPPER] parsed len', Array.isArray(expressions) ? expressions.length : null); } catch (_) {}
            try { if (typeof console !== 'undefined') console.log('[SCM-STEPPER] parsed expressions:', JSON.stringify(expressions, null, 2)); } catch (_) {}
            try { if (typeof console !== 'undefined') console.log('[SCM-STEPPER] globalEnv before processing:', Object.keys(globalEnv)); } catch (_) {}
            if (!expressions || expressions.length === 0) {
                return [{
                        ast: { type: 'Literal', value: 'error', raw: 'error' },
                        markers: [{ explanation: 'Error parsing code' }]
                    }];
            }
            // Convert to stepper nodes
            let stepperNode;
            if (expressions.length === 1) {
                stepperNode = createSimpleStepperNode(expressions[0]);
            }
            else {
                // Create a program node for multiple expressions
                stepperNode = createSimpleStepperNode({ constructor: { name: 'Sequence' }, expressions });
            }
            try { if (typeof console !== 'undefined') console.log('[SCM-STEPPER] globalEnv after processing:', Object.keys(globalEnv)); } catch (_) {}
            // Helper: transform infix BinaryExpression AST to Scheme-style prefix for rendering
            const toPrefix = (node) => {
                if (!node || typeof node !== 'object')
                    return node;
                switch (node.type) {
                    case 'BinaryExpression':
                        return {
                            type: 'FunctionApplication',
                            operator: { type: 'Identifier', name: node.operator },
                            operands: [toPrefix(node.left), toPrefix(node.right)]
                        };
                    case 'Program':
                        return { type: 'Program', body: (node.body || []).map(toPrefix) };
                    case 'FunctionApplication':
                        return {
                            type: 'FunctionApplication',
                            operator: toPrefix(node.operator),
                            operands: (node.operands || []).map(toPrefix)
                        };
                    case 'LambdaExpression':
                        return { type: 'LambdaExpression', params: node.params || [], body: toPrefix(node.body) };
                    default:
                        return node;
                }
            };
            // Generate steps manually
            const steps = [];
            // Add initial step
            steps.push({ ast: toPrefix(stepperNode), markers: [{ explanation: 'Start of evaluation' }] });
            // Generate steps until no more steps possible or limit reached
            let currentStep = 0;
            let currentNode = stepperNode;
            while (currentStep < stepLimit && currentNode.isOneStepPossible && currentNode.isOneStepPossible()) {
                currentStep++;
                try {
                    const oldNode = currentNode;
                    const nextNode = currentNode.oneStep();
                    const unchanged = JSON.stringify(nextNode) === JSON.stringify(oldNode);
                    currentNode = nextNode;
                    
                    // Create steps with before/after markers
                    const path = findReduciblePath(oldNode) || [];
                    const beforeRedex = getNodeAtPath(oldNode, path) ?? oldNode;
                    const explanation = explainRedex(beforeRedex);
                    steps.push({ 
                        ast: toPrefix(oldNode), 
                        markers: [{ 
                            redex: toPrefix(beforeRedex), 
                            redexType: 'beforeMarker', 
                            explanation: explanation 
                        }] 
                    });
                    const afterRedex = getNodeAtPath(currentNode, path) ?? currentNode;
                    steps.push({ 
                        ast: toPrefix(currentNode), 
                        markers: [{ 
                            redex: toPrefix(afterRedex), 
                            redexType: 'afterMarker', 
                            explanation: explanation 
                        }] 
                    });
                    
                    if (unchanged) {
                        break;
                    }
                }
                catch (error) {
                    steps.push({
                        ast: currentNode,
                        markers: [{ explanation: `Step ${currentStep}: Error - ${error}` }]
                    });
                    break;
                }
            }
            if (steps.length === 1 && typeof currentNode.oneStep === 'function') {
                try {
                    const oldNode = currentNode;
                    const path = findReduciblePath(oldNode) || [];
                    const beforeRedex = getNodeAtPath(oldNode, path) ?? oldNode;
                    const explanation = explainRedex(beforeRedex);
                    const nextNode = currentNode.oneStep();
                    const unchanged = JSON.stringify(nextNode) === JSON.stringify(oldNode);
                    currentNode = nextNode;
                    steps.push({ ast: oldNode, markers: [{ redex: beforeRedex, redexType: 'beforeMarker', explanation }] });
                    const afterRedex = getNodeAtPath(currentNode, path) ?? currentNode;
                    steps.push({ ast: currentNode, markers: [{ redex: afterRedex, redexType: 'afterMarker', explanation }] });
                    if (unchanged) {
                        return steps;
                    }
                }
                catch (_) { }
            }
            if (steps.length > 1) {
                const last = steps[steps.length - 1];
                last.markers = [{ explanation: 'Evaluation complete' }];
            }
            return steps;
        }
        catch (error) {
            return [{
                    ast: { type: 'Literal', value: 'error', raw: 'error' },
                    markers: [{ explanation: `Error parsing code: ${error}` }]
                }];
        }
    }

    // Import for internal use
    // Import js-base64 functions directly
    const b64Encode = (str) => btoa(unescape(encodeURIComponent(str)));
    const b64Decode = (str) => decodeURIComponent(escape(atob(str)));
    const JS_KEYWORDS = [
        "break",
        "case",
        "catch",
        "class",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "eval",
        "export",
        "extends",
        "false",
        "finally",
        "for",
        "function",
        "if",
        "import",
        "in",
        "instanceof",
        "new",
        "return",
        "super",
        "switch",
        "this",
        "throw",
        "true",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",
        "yield",
        "enum",
        "await",
        "implements",
        "package",
        "protected",
        "static",
        "interface",
        "private",
        "public",
    ];
    /**
     * Takes a Scheme identifier and encodes it to follow JS naming conventions.
     *
     * @param identifier An identifier name.
     * @returns An encoded identifier that follows JS naming conventions.
     */
    function encode(identifier) {
        if (JS_KEYWORDS.includes(identifier) || identifier.startsWith("$scheme_")) {
            return ("$scheme_" +
                b64Encode(identifier).replace(/([^a-zA-Z0-9_])/g, (match) => `\$${match.charCodeAt(0)}\$`));
        }
        else {
            return identifier.replace(/([^a-zA-Z0-9_])/g, (match) => `\$${match.charCodeAt(0)}\$`);
        }
    }
    /**
     * Takes a JS identifier and decodes it to follow Scheme naming conventions.
     *
     * @param identifier An encoded identifier name.
     * @returns A decoded identifier that follows Scheme naming conventions.
     */
    function decode(identifier) {
        if (identifier.startsWith("$scheme_")) {
            return b64Decode(identifier
                .slice(8)
                .replace(/\$([0-9]+)\$/g, (_, code) => String.fromCharCode(parseInt(code))));
        }
        else {
            return identifier.replace(/\$([0-9]+)\$/g, (_, code) => String.fromCharCode(parseInt(code)));
        }
    }
    // Initialize conductor (following py-slang pattern)
    // Note: This will be executed when the module is loaded
    exports.runnerPlugin = void 0;
    exports.conduit = void 0;
    try {
        const result = initialise(SchemeEvaluator);
        exports.runnerPlugin = result.runnerPlugin;
        exports.conduit = result.conduit;
    }
    catch (error) {
        console.warn("Conductor initialization failed, using mock objects:", error);
        // Create mock objects if initialization fails
        exports.runnerPlugin = {};
        exports.conduit = {};
    }

    exports.BasicEvaluator = BasicEvaluator;
    exports.Control = Control;
    exports.SchemeComplexNumber = SchemeComplexNumber;
    exports.SchemeEvaluator = SchemeEvaluator;
    exports.Stash = Stash;
    exports.createProgramEnvironment = createProgramEnvironment;
    exports.decode = decode;
    exports.encode = encode;
    exports.estreeDecode = estreeDecode;
    exports.estreeEncode = estreeEncode;
    exports.evaluate = evaluate;
    exports.initialise = initialise;
    exports.parseSchemeSimple = parseSchemeSimple;
    exports.stepExpression = stepExpression;
    exports.unparse = unparse;

    // Export to window for frontend use
    if (typeof window !== 'undefined') {
        window.ScmSlangRunner = { stepExpression };
        console.log('[SCM-BUNDLE] ScmSlangRunner loaded successfully');
    }

}));
