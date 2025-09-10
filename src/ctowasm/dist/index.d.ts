type RelationalOperator = "<" | "<=" | "!=" | "==" | ">=" | ">";
type ArithmeticOperator = "+" | "-" | "/" | "*" | "%";
type LogicalBinaryOperator = "&&" | "||";
type BitwiseBinaryOperator = ">>" | "<<" | "&" | "|" | "^";
type BinaryOperator = RelationalOperator | ArithmeticOperator | LogicalBinaryOperator | BitwiseBinaryOperator;
type ArithemeticUnaryOperator = "++" | "--";
type PostfixOperator = ArithemeticUnaryOperator;
type PrefixOperator = "!" | "~" | "-" | "+" | ArithemeticUnaryOperator;
type ScalarCDataType = PrimaryCDataType | PointerCDataType;
type PointerCDataType = "pointer";
type PrimaryCDataType = IntegerDataType | FloatDataType;
type IntegerDataType = SignedIntegerType | UnsignedIntegerType;
type UnsignedIntegerType = "unsigned char" | "unsigned short" | "unsigned int" | "unsigned long";
type SignedIntegerType = "signed char" | "signed short" | "signed int" | "signed long";
type FloatDataType = "float" | "double";
type DataType = ScalarDataType | ArrayDataType | StructDataType | FunctionDataType | EnumDataType | VoidDataType;
type ScalarDataType = PrimaryDataType | PointerDataType;
interface DataTypeBase {
    isConst?: boolean;
}
interface PrimaryDataType extends DataTypeBase {
    type: "primary";
    primaryDataType: PrimaryCDataType;
}
interface ArrayDataType extends DataTypeBase {
    type: "array";
    elementDataType: DataType;
    numElements: Expression;
}
interface PointerDataType extends DataTypeBase {
    type: "pointer";
    pointeeType: DataType;
}
interface FunctionDataType extends DataTypeBase {
    type: "function";
    returnType: DataType;
    parameters: DataType[];
}
interface StructDataType extends DataTypeBase {
    type: "struct";
    tag: string | null;
    fields: StructField[];
}
interface VoidDataType extends DataTypeBase {
    type: "void";
}
interface EnumDataType extends DataTypeBase {
    type: "enum";
    tag: string | null;
}
interface StructField {
    tag: string;
    dataType: DataType | StructSelfPointer;
    isConst?: boolean;
}
interface StructSelfPointer {
    type: "struct self pointer";
}
type UnaryExpression = PostfixExpression | PrefixExpression | FunctionCall | StructMemberAccess | PointerDereference | AddressOfExpression | SizeOfExpression;
interface UnaryExpressionBase extends CNodeBase {
    expr: Expression;
}
interface PostfixExpression extends UnaryExpressionBase {
    type: "PostfixExpression";
    operator: PostfixOperator;
}
interface PrefixExpression extends UnaryExpressionBase {
    type: "PrefixExpression";
    operator: PrefixOperator;
}
interface FunctionCall extends UnaryExpressionBase {
    type: "FunctionCall";
    expr: Expression;
    args: Expression[];
}
interface StructMemberAccess extends UnaryExpressionBase {
    type: "StructMemberAccess";
    expr: Expression;
    fieldTag: string;
}
interface PointerDereference extends CNodeBase {
    type: "PointerDereference";
    expr: Expression;
}
interface AddressOfExpression extends CNodeBase {
    type: "AddressOfExpression";
    expr: Expression;
}
type SizeOfExpression = SizeOfExpressionExpression | SizeOfDataTypeExpression;
interface SizeOfExpressionBase extends CNodeBase {
    type: "SizeOfExpression";
    subtype: "expression" | "dataType";
}
interface SizeOfExpressionExpression extends SizeOfExpressionBase {
    subtype: "expression";
    expr: Expression;
}
interface SizeOfDataTypeExpression extends SizeOfExpressionBase {
    subtype: "dataType";
    dataType: DataType;
}
interface Assignment extends CNodeBase {
    type: "Assignment";
    lvalue: Expression;
    expr: Expression;
}
interface Point {
    line: number;
    offset: number;
    column: number;
}
interface Position {
    start: Point;
    end: Point;
}
interface BinaryExpression extends CNodeBase {
    type: "BinaryExpression";
    leftExpr: Expression;
    rightExpr: Expression;
    operator: BinaryOperator;
}
type IntegerConstantSuffix = "u" | "l" | "ul";
type FloatConstantSuffix = "F" | "f";
type Constant = IntegerConstant | FloatConstant;
interface IntegerConstant extends CNodeBase {
    type: "IntegerConstant";
    value: bigint;
    suffix: IntegerConstantSuffix | null;
}
interface FloatConstant extends CNodeBase {
    type: "FloatConstant";
    value: number;
    suffix: FloatConstantSuffix | null;
}
interface IdentifierExpression extends CNodeBase {
    type: "IdentifierExpression";
    name: string;
}
interface ConditionalExpression extends CNodeBase {
    type: "ConditionalExpression";
    condition: Expression;
    trueExpression: Expression;
    falseExpression: Expression;
}
interface StringLiteral extends CNodeBase {
    type: "StringLiteral";
    chars: number[];
}
interface CNodeBase {
    type: string;
    position: Position;
}
type Expression = Assignment | BinaryExpression | Constant | IdentifierExpression | UnaryExpression | CommaSeparatedExpressions | ConditionalExpression | StringLiteral;
interface CommaSeparatedExpressions extends CNodeBase {
    type: "CommaSeparatedExpressions";
    expressions: Expression[];
}
interface BinaryExpressionP extends ExpressionPBase {
    type: "BinaryExpression";
    leftExpr: ExpressionP;
    rightExpr: ExpressionP;
    operator: BinaryOperator;
    operandTargetDataType: ScalarCDataType;
}
interface UnaryExpressionP extends ExpressionPBase {
    type: "UnaryExpression";
    operator: "-" | "~" | "!";
    expr: ExpressionP;
}
interface PreStatementExpressionP extends ExpressionPBase {
    type: "PreStatementExpression";
    statements: StatementP[];
    expr: ExpressionP;
}
interface PostStatementExpressionP extends ExpressionPBase {
    type: "PostStatementExpression";
    statements: StatementP[];
    expr: ExpressionP;
}
interface ConditionalExpressionP extends ExpressionPBase {
    type: "ConditionalExpression";
    condition: ExpressionP;
    trueExpression: ExpressionP;
    falseExpression: ExpressionP;
}
type Address = LocalAddress | DataSegmentAddress | DynamicAddress | ReturnObjectAddress | FunctionTableIndex;
interface AddressBase extends ExpressionPBase {
    dataType: "pointer";
}
interface LocalAddress extends AddressBase {
    type: "LocalAddress";
    offset: IntegerConstantP;
}
interface DataSegmentAddress extends AddressBase {
    type: "DataSegmentAddress";
    offset: IntegerConstantP;
}
interface DynamicAddress extends AddressBase {
    type: "DynamicAddress";
    address: ExpressionP;
}
interface FunctionTableIndex extends AddressBase {
    type: "FunctionTableIndex";
    index: IntegerConstantP;
}
type ReturnObjectAddress = ReturnObjectAddressStore | ReturnObjectAddressLoad;
interface ReturnObjectAddressBase extends AddressBase {
    type: "ReturnObjectAddress";
    subtype: "store" | "load";
    offset: IntegerConstantP;
}
interface ReturnObjectAddressStore extends ReturnObjectAddressBase {
    subtype: "store";
}
interface ReturnObjectAddressLoad extends ReturnObjectAddressBase {
    subtype: "load";
}
interface MemoryLoad extends ExpressionPBase {
    type: "MemoryLoad";
    address: Address;
}
interface MemoryStore extends ExpressionPBase {
    type: "MemoryStore";
    address: Address;
    value: ExpressionP;
    dataType: ScalarCDataType;
}
type IterationStatementP = DoWhileLoopP | WhileLoopP | ForLoopP;
interface IterationStatementBase extends CNodePBase {
    type: "DoWhileLoop" | "WhileLoop" | "ForLoop";
    condition: ExpressionP | null;
    body: StatementP[];
}
interface DoWhileLoopP extends IterationStatementBase {
    type: "DoWhileLoop";
    condition: ExpressionP;
}
interface WhileLoopP extends IterationStatementBase {
    type: "WhileLoop";
    condition: ExpressionP;
}
interface ForLoopP extends IterationStatementBase {
    type: "ForLoop";
    clause: StatementP[];
    update: StatementP[];
    condition: ExpressionP | null;
}
interface SelectionStatementP extends CNodePBase {
    type: "SelectionStatement";
    condition: ExpressionP;
    ifStatements: StatementP[];
    elseStatements: StatementP[] | null;
}
interface SwitchStatementP {
    type: "SwitchStatement";
    targetExpression: ExpressionP;
    cases: SwitchStatementCaseP[];
    defaultStatements: StatementP[];
    position: Position;
}
interface SwitchStatementCaseP {
    condition: BinaryExpressionP;
    statements: StatementP[];
    position: Position;
}
type FunctionTable = FunctionTableEntry[];
interface FunctionTableEntry {
    functionName: string;
    functionDetails: FunctionDetails;
    isDefined: boolean;
}
interface PrimaryDataTypeMemoryObjectDetails {
    dataType: ScalarCDataType;
    offset: number;
}
interface FunctionDefinitionP extends CNodePBase {
    type: "FunctionDefinition";
    name: string;
    sizeOfLocals: number;
    body: StatementP[];
    dataType: FunctionDataType;
}
interface FunctionDetails {
    parameters: PrimaryDataTypeMemoryObjectDetails[];
    returnObjects: PrimaryDataTypeMemoryObjectDetails[] | null;
    sizeOfParams: number;
    sizeOfReturn: number;
}
interface FunctionCallP extends CNodePBase {
    type: "FunctionCall";
    calledFunction: CalledFunction;
    functionDetails: FunctionDetails;
    args: ExpressionP[];
}
type CalledFunction = IndirectlyCalledFunction | DirectlyCalledFunction;
interface IndirectlyCalledFunction extends CNodePBase {
    type: "IndirectlyCalledFunction";
    functionAddress: ExpressionP;
}
interface DirectlyCalledFunction extends CNodePBase {
    type: "DirectlyCalledFunction";
    functionName: string;
}
type JumpStatementP = ReturnStatementP | BreakStatementP | ContinueStatementP;
interface ReturnStatementP extends CNodePBase {
    type: "ReturnStatement";
}
interface BreakStatementP extends CNodePBase {
    type: "BreakStatement";
}
interface ContinueStatementP extends CNodePBase {
    type: "ContinueStatement";
}
interface ExpressionStatementP extends CNodePBase {
    type: "ExpressionStatement";
    expr: ExpressionP;
}
type CNodeP = FunctionDefinitionP | StatementP | ExpressionP;
interface CNodePBase {
    type: string;
    position: Position;
}
type StatementP = MemoryStore | SelectionStatementP | IterationStatementP | FunctionCallP | JumpStatementP | SwitchStatementP | ExpressionStatementP;
type ExpressionP = BinaryExpressionP | ConstantP | PreStatementExpressionP | PostStatementExpressionP | UnaryExpressionP | Address | MemoryLoad | ConditionalExpressionP;
interface ExpressionPBase extends CNodePBase {
    dataType: ScalarCDataType;
}
interface ExternalFunction {
    moduleName: ModuleName;
    name: string;
    parameters: PrimaryDataTypeMemoryObjectDetails[];
    returnObjects: PrimaryDataTypeMemoryObjectDetails[] | null;
}
interface CAstRootP extends CNodePBase {
    type: "Root";
    functions: FunctionDefinitionP[];
    dataSegmentByteStr: string;
    dataSegmentSizeInBytes: number;
    externalFunctions: ExternalFunction[];
    functionTable: FunctionTable;
}
type ConstantP = IntegerConstantP | FloatConstantP;
interface IntegerConstantP extends ExpressionPBase {
    type: "IntegerConstant";
    value: bigint;
    dataType: IntegerDataType;
}
interface FloatConstantP extends ExpressionPBase {
    type: "FloatConstant";
    value: number;
    dataType: FloatDataType;
}
interface MemoryBlock {
    address: number;
    size: number;
}
interface ModuleFunction {
    parentImportedObject: string;
    functionType: FunctionDataType;
    jsFunction: Function;
}
declare abstract class Module {
    memory: WebAssembly.Memory;
    functionTable: WebAssembly.Table;
    config: ModulesGlobalConfig;
    freeList: MemoryBlock[];
    allocatedBlocks: Map<number, number>;
    sharedWasmGlobalVariables: SharedWasmGlobalVariables;
    instantiate?: () => Promise<void>;
    abstract moduleDeclaredStructs: StructDataType[];
    abstract moduleFunctions: Record<string, ModuleFunction>;
    constructor(memory: WebAssembly.Memory, functionTable: WebAssembly.Table, config: ModulesGlobalConfig, sharedWasmGlobalVariables: SharedWasmGlobalVariables);
    print(str: string): void;
}
declare const mathStdlibName = "math";
declare const pixAndFlixLibraryModuleImportName = "pix_n_flix";
declare const sourceStandardLibraryModuleImportName = "source_stdlib";
declare const utilityStdLibName = "utility";
interface ModulesGlobalConfig {
    printFunction: (str: string) => void;
    externalFunctions?: {
        [functionName: string]: Function;
    };
}
interface SharedWasmGlobalVariables {
    stackPointer: WebAssembly.Global;
    heapPointer: WebAssembly.Global;
    basePointer: WebAssembly.Global;
}
type ModuleName = typeof sourceStandardLibraryModuleImportName | typeof pixAndFlixLibraryModuleImportName | typeof mathStdlibName | typeof utilityStdLibName;
declare class ModuleRepository {
    memory: WebAssembly.Memory;
    functionTable: WebAssembly.Table;
    config: ModulesGlobalConfig;
    modules: Record<ModuleName, Module>;
    sharedWasmGlobalVariables: SharedWasmGlobalVariables;
    constructor(memory?: WebAssembly.Memory, functionTable?: WebAssembly.Table, config?: ModulesGlobalConfig);
    setStackPointerValue(value: number): void;
    setBasePointerValue(value: number): void;
    setHeapPointerValue(value: number): void;
    setMemory(numberOfPages: number): void;
    createWasmImportsObject(importedModules: ModuleName[]): Promise<WebAssembly.Imports>;
}
interface ImmutableStack<T, S> {
    push(item: T): S;
    pop(): [T | undefined, S];
    peek(): T | undefined;
    size(): number;
    isEmpty(): boolean;
    toArray(): ReadonlyArray<T>;
}
declare class Stack<T, R = any> implements ImmutableStack<T, R> {
    protected readonly storage: ReadonlyArray<T>;
    constructor(items?: ReadonlyArray<T>);
    protected createNew(items: ReadonlyArray<T>): R;
    setTo(otherStack: Stack<T, R>): void;
    concat(item: T[]): R;
    push(item: T): R;
    getStack(): ReadonlyArray<T>;
    some(predicate: (value: T) => boolean): boolean;
    pop(): [T | undefined, R];
    getIdx(idx: number): T;
    peek(): T;
    peekLast(depth: number): ReadonlyArray<T>;
    size(): number;
    isEmpty(): boolean;
    toArray(): ReadonlyArray<T>;
}
export enum InstructionType {
    BINARY_OP = "BINARY_OP",
    UNARY_OP = "UNARY_OP",
    BRANCH = "BRANCH",
    POP = "POP",
    MEMORY_STORE = "MEMORY_STORE",
    MEMORY_LOAD = "MEMORY_LOAD",
    WHILE = "WHILE",
    FORLOOP = "FORLOOP",
    STACKFRAMETEARDOWNINSTRUCTION = "STACKFRAMETEARDOWNINSTRUCTION",
    CALLINSTRUCTION = "CALLINSTRUCTION",
    FUNCTIONINDEXWRAPPER = "FUNCTIONINDEXWRAPPER",
    BREAK_MARK = "BREAK_MARK",
    CASE_JUMP = "CASE_JUMP",
    CASE_MARK = "CASE_MARK",
    CONTINUE_MARK = "CONTINUE_MARK"
}
interface BaseInstruction {
    type: InstructionType;
    position: Position;
}
interface BinaryOpInstruction extends BaseInstruction {
    type: InstructionType.BINARY_OP;
    operator: BinaryOperator;
    dataType: ScalarCDataType;
}
interface UnaryOpInstruction extends BaseInstruction {
    type: InstructionType.UNARY_OP;
    operator: string;
}
interface branchOpInstruction extends BaseInstruction {
    type: InstructionType.BRANCH;
    trueExpr: CNodeP[];
    falseExpr: CNodeP[];
}
declare const branchOpInstruction: (trueExpr: CNodeP[], falseExpr: CNodeP[], position: Position) => branchOpInstruction;
interface popInstruction extends BaseInstruction {
    type: InstructionType.POP;
}
declare const popInstruction: () => popInstruction;
interface MemoryStoreInstruction extends BaseInstruction {
    type: InstructionType.MEMORY_STORE;
    dataType: ScalarCDataType;
}
interface MemoryLoadInstruction extends BaseInstruction {
    type: InstructionType.MEMORY_LOAD;
    dataType: ScalarCDataType;
}
interface WhileLoopInstruction extends BaseInstruction {
    type: InstructionType.WHILE;
    condition: ExpressionP;
    body: CNodeP[];
    hasContinue: boolean;
}
interface ForLoopInstruction extends BaseInstruction {
    type: InstructionType.FORLOOP;
    body: CNodeP[];
    update: CNodeP[];
    condition: ExpressionP;
    hasContinue: boolean;
}
interface StackFrameTearDownInstruction extends BaseInstruction {
    functionName: string;
    type: InstructionType.STACKFRAMETEARDOWNINSTRUCTION;
    basePointer: number;
    stackPointer: number;
}
interface CallInstruction extends BaseInstruction {
    type: InstructionType.CALLINSTRUCTION;
    calledFunction: CalledFunction;
    functionDetails: FunctionDetails;
}
interface FunctionIndexWrapper extends BaseInstruction {
    type: InstructionType.FUNCTIONINDEXWRAPPER;
}
interface BreakMarkInstruction extends BaseInstruction {
    type: InstructionType.BREAK_MARK;
}
interface ContinueMarkInstruction extends BaseInstruction {
    type: InstructionType.CONTINUE_MARK;
}
interface CaseJumpInstruction extends BaseInstruction {
    type: InstructionType.CASE_JUMP;
    caseValue: number;
}
interface CaseMarkInstruction extends BaseInstruction {
    type: InstructionType.CASE_MARK;
    caseValue: number;
}
type Instruction = BinaryOpInstruction | UnaryOpInstruction | branchOpInstruction | popInstruction | MemoryStoreInstruction | MemoryLoadInstruction | StackFrameTearDownInstruction | CallInstruction | FunctionIndexWrapper | WhileLoopInstruction | ForLoopInstruction | BreakMarkInstruction | CaseJumpInstruction | CaseMarkInstruction | ContinueMarkInstruction;
type ControlItem = CNodeP | Instruction;
declare class Control extends Stack<ControlItem, Control> {
    protected createNew(items: ReadonlyArray<ControlItem>): Control;
    canAvoidEnvInstr(): boolean;
    getTearDowns(): StackFrameTearDownInstruction[];
    getNumEnvDependentItems(): number;
    isInstruction(item: any): boolean;
    isNode(item: any): boolean;
    copy(): Control;
    toString(): string;
}
interface MemoryAddress {
    type: "MemoryAddress";
    value: bigint;
    hexValue: string;
}
type StashItem = ConstantP | MemoryAddress | FunctionTableIndex;
declare class Stash extends Stack<StashItem, Stash> {
    protected createNew(items: ReadonlyArray<StashItem>): Stash;
    static isConstant(item: StashItem): item is ConstantP;
    static isMemoryAddress(value: StashItem): value is MemoryAddress;
    toString(): string;
}
interface MemoryWriteInterface {
    type: "MemoryWriteInterface";
    address: bigint;
    value: ConstantP;
    dataType: ScalarCDataType;
}
declare class Memory {
    memory: WebAssembly.Memory;
    dataSegmentSizeInBytes: number;
    dataSegmentByteStr: string;
    heapBuffer: number;
    stackBuffer: number;
    sharedWasmGlobalVariables: SharedWasmGlobalVariables;
    static cnt: number;
    constructor(dataSegmentByteStr: string, dataSegmentSizeInBytes: number, heapBuffer?: number, stackBuffer?: number);
    writeToModuleMemory(): void;
    cloneModuleMemory(): Memory;
    setPointers(stackPointer: number, basePointer: number, heapPointer: number): void;
    stackFrameSetup(sizeOfParams: number, sizeOfLocals: number, sizeOfReturn: number, parameters: StashItem[]): Memory;
    stackFrameTearDown(stackPointer: number, basePointer: number): Memory;
    checkOutOfBounds(address: bigint): boolean;
    write(values: MemoryWriteInterface[]): Memory;
    load(address: MemoryAddress, dataType: ScalarCDataType): StashItem;
    clone(): Memory;
    getFormattedMemoryView(start?: number, end?: number): string;
}
declare class StackFrame {
    constructor(functionName: string, basePointer: number, memory: Memory);
}
interface CContext {
    astRoot: CAstRootP;
    control: Control;
    stash: Stash;
    memory: Memory;
    stackFrames: StackFrame[];
    step: number;
}
export function controlItemToString(controlItem: ControlItem): string;
interface SuccessfulCompilationResult {
    status: "success";
    wasm: Uint8Array;
    dataSegmentSize: number;
    functionTableSize: number;
    importedModules: ModuleName[];
    warnings: string[];
}
interface FailedCompilationResult {
    status: "failure";
    errorMessage: string;
}
type CompilationResult = SuccessfulCompilationResult | FailedCompilationResult;
interface SuccessfulEvaluationResult {
    status: "success";
    context: CContext;
    importedModules: ModuleName[];
}
interface FailedEvaluationResult {
    status: "failure";
    errorMessage: string;
}
type EvaluationResult = SuccessfulEvaluationResult | FailedEvaluationResult;
interface SuccessfulWatCompilationResult {
    status: "success";
    watOutput: string;
    warnings: string[];
}
interface FailedWatCompilationResult {
    status: "failure";
    errorMessage: string;
}
type WatCompilationResult = SuccessfulWatCompilationResult | FailedWatCompilationResult;
export const defaultModuleRepository: ModuleRepository;
export function compileToWat(program: string): WatCompilationResult;
export function generate_WAT_AST(program: string): string;
export function interpret_C_AST(program: string, modulesConfig: ModulesGlobalConfig): void;
export function evaluate(program: string, modulesConfig: ModulesGlobalConfig, targetStep: number): Promise<EvaluationResult>;
export function compile(program: string): Promise<CompilationResult>;
export function compileAndRun(program: string, modulesConfig?: ModulesGlobalConfig): Promise<CompilationResult>;
export function runWasm(wasm: Uint8Array, dataSegmentSize: number, functionTableSize: number, importedModules: ModuleName[], modulesConfig?: ModulesGlobalConfig): Promise<void>;
export function generate_processed_C_AST(program: string): string;
export function generate_C_AST(program: string): string;

//# sourceMappingURL=index.d.ts.map
