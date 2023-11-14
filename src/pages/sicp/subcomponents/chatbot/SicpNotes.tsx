const summary1 =
  '1. Building Abstractions with Functions' +
  '\n1. **Introduction to Programming Concepts:**' +
  "- Discusses John Locke's ideas on mental processes, emphasizing abstraction as a key concept in forming general ideas" +
  '- Introduces the concept of computational processes, likening them to abstract beings that manipulate data according to program rules.' +
  '\n2. **Programming Language Selection:**' +
  ' - Chooses JavaScript as the programming language for expressing procedural thoughts.' +
  ' - Traces the development of JavaScript from its origins in controlling web browsers to its current status as a general-purpose programming language.' +
  '\n3. **JavaScript Characteristics and Standardization:** ' +
  "- Highlights JavaScript's core features inherited from Scheme and Self languages." +
  '- Notes the standardization efforts, leading to ECMAScript, and its evolution, with ECMAScript 2015 as a significant edition.' +
  "- Discusses JavaScript's initial interpretation in web browsers and its subsequent efficient execution using techniques like JIT compilation." +
  '\n4. **Practical Application of JavaScript:**' +
  '- Emphasizes the practicality of embedding JavaScript in web pages and its role in web browser interactions.' +
  "- Recognizes JavaScript's expanding role as a general-purpose programming language, especially with the advent of systems like Node.js." +
  "- Points out JavaScript's suitability for an online version of a book on computer programs due to its execution capabilities in web browsers.";

const summary1_1 =
  '1.1: The Elements of Programming' +
  '\n1. **Programming Language Components:**' +
  "- A powerful programming language involves more than instructing a computer; it's a framework for organizing ideas about processes." +
  '- Focuses on three mechanisms: primitive expressions, means of combination, and means of abstraction.' +
  '\n2. **Elements in Programming:**' +
  '- Programming deals with two key elements: functions and data.' +
  "- Defines data as manipulable 'stuff' and functions as rules for manipulating data." +
  '- Emphasizes the importance of a language describing primitive data and functions and combining/abstracting them.' +
  '\n3. **Chapter Scope:**' +
  '- Chapter focuses on simple numerical data to explore rules for building functions.' +
  '- Acknowledges the complexity of handling numbers in programming languages, deferring detailed exploration to later chapters.' +
  '\n4. **Numerical Considerations:**' +
  '- Raises issues in dealing with numbers, such as distinctions between integers and real numbers.' +
  '- Acknowledges challenges like arithmetic operations, representation limits, and roundoff behavior.' +
  "- Declares the book's focus on large-scale program design, deferring detailed numerical analysis.";

const summary1_1_1 =
  '1.1.1  Expressions' +
  '\n1. **JavaScript Interpreter Interaction:**' +
  '- Introduction to programming via interactions with a JavaScript interpreter.' +
  '- Statements involve typing expressions, and the interpreter responds by displaying the evaluated results.' +
  '\n2. **Expression Statements:**' +
  '- Expression statements consist of an expression followed by a semicolon.' +
  '- Primitive expressions include numbers; evaluation involves clicking, displaying the interpreter, and running the statement.' +
  '\n3. **Compound Expressions:**' +
  '- Expressions combining numbers with operators form compound expressions.' +
  '- Examples of operator combinations with arithmetic operators and infix notation are provided.' +
  '\n4. **Read-Evaluate-Print Loop:**' +
  '- JavaScript interpreter operates in a read-evaluate-print loop.' +
  '- Complex expressions are handled, and the interpreter reads, evaluates, and prints results in a cycle.';

const summary1_1_2 =
  '1.1.2  Naming and the Environment' +
  '\n1. **Constants and Declarations:**' +
  '- JavaScript uses constant declarations (e.g., const size = 2;) to associate names with values (constants).' +
  '- Names like size can then be used in expressions, providing a means of abstraction for simple values.' +
  '\n2. **Abstraction with Constants:**' +
  '- Constant declaration is a simple form of abstraction, allowing the use of names for results of compound operations.' +
  '- Examples include using constants like pi and radius in calculations for circumference.' +
  '\n3. **Incremental Program Development:**' +
  "- JavaScript's incremental development involves step-by-step construction of computational objects using name-object associations." +
  '- The interpreter supports this process by allowing incremental creation of associations in successive interactions.' +
  '\n4. **Program Environment:**' +
  '- The interpreter maintains a memory called the program environment, tracking name-object pairs.' +
  '- This environment is crucial for understanding interpreter operation and implementing interpreters in later chapters.';

const summary1_1_3 =
  '1.1.3: Evaluating Operator Combinations' +
  '\n1. **Evaluation of Operator Combinations:**' +
  '- The interpreter follows a procedure to evaluate operator combinations.' +
  "- Recursive evaluation involves assessing operand expressions and applying the operator's function." +
  '- Recursive nature simplifies the understanding of complex, nested combinations in a hierarchical, tree-like structure.' +
  '\n2. **Recursion in Evaluation:**' +
  '- Recursion efficiently handles deeply nested combinations.' +
  '- A tree representation illustrates the percolation of operand values upward during evaluation.' +
  "- General process type known as 'tree accumulation.'" +
  '\n3. **Handling Primitive Expressions:**' +
  '- Primitive cases involve evaluating numerals and names.' +
  '- Numerals represent the numbers they name.' +
  '- Names derive values from the environment where associations are stored.' +
  '\n4. **Role of Environment in Evaluation:**' +
  '- The environment is crucial for determining name meanings in expressions.' +
  "- In JavaScript, a name's value depends on the environment, especially in interactive contexts." +
  "- Declarations, like `const x = 3;`, associate names with values and aren't handled by the evaluation rule.";

const summary1_1_4 =
  '1.1.4 Compound Functions' +
  '\n1. **Compound Functions in JavaScript:**' +
  '- Function declarations offer a powerful abstraction, allowing compound operations to be named.' +
  '- Declaring a function involves specifying parameters, a return expression, and associating it with a name.' +
  '- Function applications, like `square(21)`, execute the named function with specified arguments, yielding a result.' +
  '\n2. **Function Application in JavaScript:**' +
  '- To evaluate a function application, subexpressions (function and arguments) are evaluated, and the function is applied to the arguments.' +
  '- Nested function applications, such as `square(square(3))`, demonstrate the versatility of this approach.' +
  '\n3. **Building Functions with Compound Functions:**' +
  '- Functions like `sum_of_squares` can be defined using previously declared functions (e.g., `square`) as building blocks.' +
  '- Primitive functions provided by the JavaScript environment, like `math_log`, are used similarly to compound functions.' +
  '\n4. **Syntax and Naming Conventions:**' +
  '- Function declaration syntax involves naming, specifying parameters, and defining the return expression.' +
  '- Common JavaScript conventions, like camel case or snake case, affect the readability of multi-part function names (e.g., `sum_of_squares`).';

const summary1_1_5 =
  '1.1.5 The Substitution Model for Function Application' +
  '\n1. **Substitution Model for Function Application:**' +
  '- The interpreter follows a substitution model when evaluating function applications in JavaScript.' +
  '- For compound functions, it involves replacing parameters with corresponding arguments in the return expression.' +
  "- This model helps conceptualize function application but differs from the actual interpreter's workings." +
  '\n2. **Applicative-Order vs. Normal-Order Evaluation:**' +
  '- Applicative-order evaluation, used by JavaScript, evaluates arguments before function application.' +
  '- Normal-order evaluation substitutes arguments for parameters until only operators and primitive functions remain, then evaluates.' +
  '- Both methods yield the same result for functions modeled using substitution, but normal order is more complex.' +
  '\n3. **Implications of Evaluation Models:**' +
  '- The substitution model serves as a starting point for thinking formally about evaluation.' +
  "- Over the book, more refined models will replace the substitution model, especially when dealing with 'mutable data.'" +
  '- JavaScript uses applicative-order evaluation for efficiency, while normal-order evaluation has its own implications explored later.' +
  '\n4. **Challenges in Substitution Process:**' +
  '- The substitution process, despite its simplicity, poses challenges in giving a rigorous mathematical definition.' +
  '- Issues arise from potential confusion between parameter names and identical names in expressions to which a function is applied.' +
  '- Future chapters will explore variations, including normal-order evaluation and its use in handling infinite data structures.';

const summary1_1_6 =
  '1.1.6 Conditional Expressions and Predicates' +
  '\n1. **Conditional Expressions and Predicates:**' +
  "- JavaScript's conditional expressions involve a predicate, a consequent expression, and an alternative expression." +
  '- The interpreter evaluates the predicate; if true, it returns the consequent expression, else the alternative expression.' +
  '- Predicates include boolean operators (&&, ||) and logical negation (!), aiding in conditional logic.' +
  '\n2. **Handling Multiple Cases:**' +
  '- Nested conditional expressions handle multiple cases, enabling complex case analyses.' +
  '- The structure uses clauses with predicates and consequent expressions, ending with a final alternative expression.' +
  '- Logical composition operations like && and || assist in constructing compound predicates.' +
  '\n3. **Examples and Applications:**' +
  '- Functions, like absolute value (abs), can be defined using conditional expressions.' +
  '- Logical operations (&&, ||, !) and comparison operators enhance the expressiveness of conditional expressions.' +
  '- Exercises demonstrate practical applications, such as evaluating sequences of statements and translating expressions into JavaScript.' +
  '\n4. **Evaluation Models:**' +
  "- Applicative-order evaluation (JavaScript's approach) evaluates arguments before function application." +
  '- Normal-order evaluation fully expands and then reduces expressions, leading to potential multiple evaluations.' +
  '- Substitution models are foundational for understanding function application but become inadequate in detailed analyses.';

const summary1_1_7 =
  "1.1.7 Example: Square Roots by Newton's Method" +
  "\n1. **Newton's Method for Square Roots:**" +
  '- Mathematical and computer functions differ; computer functions must be effective.' +
  "- Newton's method, an iterative approach, is used to compute square roots." +
  '- The process involves successive approximations, improving guesses through simple manipulations.' +
  '\n2. **Functional Approach to Square Roots:**' +
  '- Functions like `sqrt_iter`, `improve`, `average`, and `is_good_enough` formalize the iterative square-root computation.' +
  '- The basic strategy is expressed through recursion without explicit iterative constructs.' +
  '- The example demonstrates that a simple functional language can handle numerical programs efficiently.' +
  '\n3. **Declarative vs. Imperative Knowledge:**' +
  '- The distinction between mathematical and computer functions reflects declarative (what is) vs. imperative (how to) knowledge.' +
  '- Computer science deals with imperative descriptions, focusing on how to perform tasks.' +
  "- Newton's method for square roots exemplifies the transition from declarative to imperative knowledge in programming." +
  '\n4. **Exercises and Challenges:**' +
  '- Exercises involve evaluating the effectiveness of conditional expressions and exploring improvements to the square-root program.' +
  "- Newton's method is extended to cube roots, showcasing the general applicability of the approach." +
  '- Considerations for precision and handling small/large numbers in square-root computation are discussed.';

const summary1_1_8 =
  '1.1.8 Functions as Black-Box Abstractions' +
  '\n1. **Function Decomposition:**' +
  '- The square root program illustrates a cluster of functions decomposing the problem into subproblems.' +
  '- Functions like `is_good_enough` and `improve` operate as modules, contributing to the overall process.' +
  '- Decomposition is crucial for readability and modularity, enabling the use of functions as black-box abstractions.' +
  '\n2. **Functional Abstraction:**' +
  '- Functions should act as black boxes, allowing users to focus on the result, not implementation details.' +
  "- Parameter names, being bound, don't affect function behavior, promoting functional abstraction." +
  '- The significance of local names and the independence of function meaning from parameter names are emphasized.' +
  '\n3. **Lexical Scoping:**' +
  '- Lexical scoping allows functions to have internal declarations, localizing subfunctions.' +
  '- Block structure and lexical scoping enhance the organization of large programs.' +
  "- Free names in internal declarations derive their values from the enclosing function's arguments." +
  '\n4. **Simplification and Organization:**' +
  '- Internalizing declarations simplifies auxiliary functions in a block structure.' +
  '- Lexical scoping eliminates the need to pass certain arguments explicitly, enhancing clarity.' +
  '- The combination of block structure and lexical scoping aids in the organization of complex programs.';

const summary1_2 =
  '1.2 Functions and the Processes They Generate' +
  '\n1. **Programming Expertise Analogy:**' +
  "- Programming is likened to chess, where knowing piece movements isn't enough without strategic understanding." +
  "- Similar to a novice chess player, knowing primitive operations isn't sufficient without understanding common programming patterns." +
  '\n2. **Importance of Process Visualization:**' +
  '- Expert programmers visualize consequences and patterns of actions, akin to a photographer planning exposure for desired effects.' +
  '- Understanding the local evolution of computational processes is crucial for constructing programs with desired behaviors.' +
  '\n3. **Function as Process Pattern:**' +
  '- A function serves as a pattern for the local evolution of a computational process.' +
  '- Describing global behavior based on local evolution is challenging but understanding typical process patterns is essential.' +
  '\n4. **Analysis of Process Shapes:**' +
  '- Examining common shapes of processes generated by simple functions.' +
  '- Investigating how these processes consume computational resources like time and space.';

const summary1_2_1 =
  '1.2.1 Linear Recursion and Iteration' +
  '\n1. **Factorial Computation:**' +
  '- Two methods for computing factorial: recursive (linear recursive process) and iterative (linear iterative process).' +
  '- Recursive process involves a chain of deferred operations, while iterative process maintains fixed state variables.' +
  '\n2. **Recursive vs. Iterative:**' +
  '- Recursive process builds a chain of deferred operations, resulting in linear growth of information.' +
  '- Iterative process maintains fixed state variables, described as a linear iterative process with constant space.' +
  '\n3. **Tail-Recursion and Implementation:**' +
  '- Tail-recursive implementations execute iterative processes in constant space.' +
  '- Common languages may consume memory with recursive functions; JavaScript (ECMAScript 2015) supports tail recursion.' +
  "\n4. **Exercise: Ackermann's Function:**" +
  "- Illustration of Ackermann's function." +
  "- Definition of functions f, g, and h in terms of Ackermann's function.";

const summary1_2_2 =
  '1.2.2 Tree Recursion' +
  '\n1. **Tree Recursion:**' +
  '- Tree recursion is illustrated using the Fibonacci sequence computation.' +
  '- Recursive function `fib` exhibits a tree-recursive process with exponential growth in redundant computations.' +
  '\n2. **Iterative Fibonacci:**' +
  '- An alternative linear iterative process for Fibonacci computation is introduced.' +
  '- Contrast between the exponential growth of tree recursion and linear growth of the iterative process is highlighted.' +
  '\n3. **Smart Compilation and Efficiency:**' +
  '- Tree-recursive processes, while inefficient, are often easy to understand.' +
  "- A 'smart compiler' is proposed to transform tree-recursive functions into more efficient forms." +
  '\n4. **Example: Counting Change:**' +
  '- The problem of counting change for a given amount is introduced.' +
  '- A recursive solution is presented, demonstrating tree recursion with a clear reduction rule.';

const summary1_2_3 =
  '1.2.3 Orders of Growth' +
  '\n1. **Orders of Growth:**' +
  '- Processes exhibit varying resource consumption rates, described by the order of growth.' +
  '- Represented as Θ(f(n)), indicating resource usage between k₁f(n) and k₂f(n) for large n.' +
  '\n2. **Examples of Order of Growth:**' +
  '- Linear recursive factorial process has Θ(n) steps and space.' +
  '- Iterative factorial has Θ(n) steps but Θ(1) space.' +
  '- Tree-recursive Fibonacci has Θ(ϕⁿ) steps and Θ(n) space, where ϕ is the golden ratio.' +
  '\n3. **Crude Description:**' +
  '- Orders of growth offer a basic overview, e.g., Θ(n²) for quadratic processes.' +
  '- Useful for anticipating behavior changes with problem size variations.' +
  '\n4. **Upcoming Analysis:**' +
  '- Future exploration includes algorithms with logarithmic order of growth.' +
  "- Expected behavior changes, such as doubling problem size's impact on resource utilization.";

const summary1_2_4 =
  '1.2.4 Exponentiation' +
  '\n1. **Exponentiation Process:**' +
  '- Recursive process for exponentiation: bⁿ = b * bⁿ⁻¹.' +
  '- Linear recursive process: Θ(n) steps and Θ(n) space.' +
  '- Improved iterative version: Θ(n) steps but Θ(1) space.' +
  '\n2. **Successive Squaring:**' +
  '- Successive squaring reduces steps for exponentiation.' +
  '- Fast_expt function exhibits logarithmic growth: Θ(log n) steps and space.' +
  '\n3. **Multiplication Algorithms:**' +
  '- Design logarithmic steps multiplication using successive doubling and halving.' +
  '- Utilize observation from exponentiation for efficient iterative multiplication.' +
  '\n4. **Fibonacci Numbers:**' +
  '- Clever algorithm for Fibonacci in logarithmic steps.' +
  '- Transformation T and Tⁿ for Fibonacci computation using successive squaring.';

const summary1_2_5 =
  '1.2.5 Greatest Common Divisors' +
  '\n1. **Greatest Common Divisors (GCD):**' +
  '- GCD of a and b is the largest integer dividing both with no remainder.' +
  "- Euclid's Algorithm efficiently computes GCD using recursive reduction." +
  '- Algorithm based on the observation: GCD(a, b) = GCD(b, a % b).' +
  '\n2. **Algorithm Complexity:**' +
  "- Euclid's Algorithm has logarithmic growth." +
  "- Lamé's Theorem relates Euclid's steps to Fibonacci numbers." +
  '- Order of growth: Θ(log n).' +
  "\n3. **Euclid's Algorithm Function:**" +
  "- Express Euclid's Algorithm as a function: `gcd(a, b)`." +
  '- Iterative process with logarithmic growth in steps.' +
  '\n4. **Exercise:**' +
  '- Normal-order evaluation impacts the process generated by gcd function.' +
  "- Lamé's Theorem applied to estimate the order of growth for Euclid's Algorithm.";

const summary1_2_6 =
  '1.2.6 Example: Testing for Primality' +
  '\n1. **Primality Testing Methods:**' +
  '- Methods for checking primality: Order Θ(n) and probabilistic method with Θ(log n).' +
  '- Finding divisors: Program to find the smallest integral divisor of a given number.' +
  "- Fermat's Little Theorem: Θ(log n) primality test based on number theory." +
  '- Fermat test and Miller–Rabin test as probabilistic algorithms.' +
  "\n2. **Fermat's Little Theorem:**" +
  '- If n is prime, a^(n-1) ≡ 1 (mod n) for a < n.' +
  '- Fermat test: Randomly choosing a and checking congruence.' +
  '- Probabilistic nature: Result is probably correct, with rare chances of error.' +
  '\n3. **Algorithm Implementation:**' +
  '- Implementation of Fermat test using expmod function.' +
  '- Miller–Rabin test: Squaring step checks for nontrivial square roots of 1.' +
  '- Probabilistic algorithms and their reliability in practical applications.' +
  '\n4. **Exercises:**' +
  '- Exercise 1.21: Finding the smallest divisor using the smallest_divisor function.' +
  '- Exercise 1.22: Timed prime tests for different ranges, comparing Θ(n) and Θ(log n) methods.' +
  '- Exercise 1.23: Optimizing smallest_divisor for efficiency.' +
  '- Exercise 1.24: Testing primes using the Fermat method (Θ(log n)).' +
  '- Exercise 1.25: Comparing expmod and fast_expt for primality testing.' +
  '- Exercise 1.26: Identifying algorithmic transformation affecting efficiency.' +
  '- Exercise 1.27: Testing Carmichael numbers that fool the Fermat test.' +
  '- Exercise 1.28: Implementing the Miller–Rabin test and testing its reliability.';

const summary1_3 =
  '1.3 Formulating Abstractions with Higher-Order Functions' +
  '\n1. **Higher-Order Functions:**' +
  '- Functions as abstractions for compound operations on numbers.' +
  '- Declaring functions allows expressing concepts like cubing, enhancing language expressiveness.' +
  '- Importance of building abstractions using function names.' +
  '- Introduction of higher-order functions that accept or return functions, increasing expressive power.' +
  '\n2. **Abstraction in Programming:**' +
  '- Programming languages should allow building abstractions through named common patterns.' +
  '- Functions enable working with higher-level operations beyond primitive language functions.' +
  '- Limitations without abstractions force work at the level of primitive operations.' +
  '- Higher-order functions extend the ability to create abstractions in programming languages.';

const summary1_3_1 =
  '1.3.1 Functions as Arguments' +
  '\n1. **Common Pattern in Functions:**' +
  '- Three functions share a common pattern for summing series.' +
  '- Functions differ in name, term computation, and next value.' +
  '- Identification of the summation abstraction in mathematical series.' +
  '- Introduction of a common template for expressing summation patterns.' +
  '\n2. **Higher-Order Function for Summation:**' +
  "- Introduction of a higher-order function for summation, named 'sum.'" +
  "- 'sum' takes a term, lower and upper bounds, and next function as parameters." +
  "- Examples of using 'sum' to compute sum_cubes, sum_integers, and pi_sum." +
  "- Application of 'sum' in numerical integration and approximation of π." +
  '\n3. **Iterative Formulation:**' +
  '- Transformation of summation function into an iterative process.' +
  "- Example of an iterative summation function using Simpson's Rule." +
  "- Extension to a more general notion called 'accumulate' for combining terms." +
  '\n4. **Filtered Accumulation:**' +
  '- Introduction of filtered accumulation using a predicate for term selection.' +
  '- Examples of filtered accumulation: sum of squares of prime numbers and product of relatively prime integers.' +
  '- Acknowledgment of the expressive power attained through appropriate abstractions.';

const summary1_3_2 =
  '1.3.2 Constructing Functions using Lambda Expressions' +
  '\n1. **Lambda Expressions for Function Creation:**' +
  '- Introduction of lambda expressions for concise function creation.' +
  '- Lambda expressions used to directly specify functions without declaration.' +
  '- Elimination of the need for auxiliary functions like pi_term and pi_next.' +
  '- Examples of pi_sum and integral functions using lambda expressions.' +
  '\n2. **Lambda Expression Syntax:**' +
  '- Lambda expressions written as `(parameters) => expression`.' +
  '- Equivalent functionality to function declarations but without a specified name.' +
  '- Readability and equivalence demonstrated with examples.' +
  '- Usage of lambda expressions in various contexts, such as function application.' +
  '\n3. **Local Names Using Lambda Expressions:**' +
  '- Lambda expressions employed to create anonymous functions for local names.' +
  "- Example of computing a function with intermediate quantities like 'a' and 'b'." +
  '- Comparison with alternative approaches, including using auxiliary functions.' +
  '- Utilization of constant declarations within function bodies for local names.' +
  '\n4. **Conditional Statements in JavaScript:**' +
  '- Introduction of conditional statements using `if-else` syntax.' +
  "- Example of applying conditional statements in the 'expmod' function." +
  '- Scope considerations for constant declarations within conditional statements.' +
  '- Efficient use of conditional statements to improve function performance.' +
  '\n5. **Exercise 1.34:**' +
  '- A function `f` that takes a function `g` and applies it to the value 2.' +
  '- Demonstrations with `square` and a lambda expression.' +
  '- A hypothetical scenario of evaluating `f(f)` and its explanation as an exercise.' +
  '- Illustration of function composition and its outcome.';

const summary1_3_3 =
  '1.3.3 Functions as General Methods' +
  '\n1. **Introduction to General Methods:**' +
  '- Compound functions and higher-order functions for abstracting numerical operations.' +
  '- Higher-order functions express general methods of computation.' +
  '- Examples of general methods for finding zeros and fixed points of functions.' +
  '\n2. **Half-Interval Method for Finding Roots:**' +
  '- A strategy for finding roots of continuous functions using the half-interval method.' +
  '- Implementation of the method in JavaScript with the `search` function.' +
  '- Use of the method to approximate roots, e.g., finding π and solving a cubic equation.' +
  '\n3. **Fixed Points of Functions:**' +
  '- Definition of a fixed point of a function and methods to locate it.' +
  '- Introduction of the `fixed_point` function for finding fixed points with a given tolerance.' +
  '- Examples using cosine and solving equations involving trigonometric functions.' +
  '\n4. **Square Root Computation and Averaging:**' +
  '- Attempt to compute square roots using fixed-point search and the challenge with convergence.' +
  '- Introduction of average damping to control oscillations and improve convergence.' +
  '- Illustration of square root computation using average damping in the `sqrt` function.' +
  '\n5. **Exercises and Further Exploration:**' +
  '- Exercise 1.35: Golden ratio as a fixed point.' +
  '- Exercise 1.36: Modifying `fixed_point` and solving equations.' +
  '- Exercise 1.37: Continued fraction representation and approximating values.' +
  "- Exercise 1.38: Approximating Euler's number using continued fractions." +
  "- Exercise 1.39: Lambert's continued fraction for the tangent function.";

const summary1_3_4 =
  '1.3.4 Functions as Returned Values' +
  '\n1. **Programming Concepts:**' +
  '- Demonstrates the use of functions as first-class citizens in JavaScript.' +
  '- Highlights the application of higher-order functions in expressing general methods.' +
  '- Shows how to create abstractions and build upon them for more powerful functionalities.' +
  '- Discusses the significance of first-class functions in JavaScript and their expressive power.' +
  '\n2. **Specific Programming Techniques:**' +
  '- Introduces and applies average damping and fixed-point methods in function computations.' +
  "- Explores Newton's method and expresses it as a fixed-point process." +
  '- Provides examples of implementing functions for square roots, cube roots, and nth roots.' +
  '- Discusses iterative improvement as a general computational strategy.' +
  '\n3. **Exercises and Problem Solving:**' +
  '- Includes exercises like implementing functions for cubic equations, function composition, and iterative improvement.' +
  '- Addresses challenges in computing nth roots using repeated average damping.' +
  '\n4. **General Programming Advice:**' +
  '- Emphasizes the importance of identifying and building upon underlying abstractions in programming.' +
  '- Encourages programmers to think in terms of abstractions and choose appropriate levels of abstraction for tasks.' +
  '- Discusses the benefits and challenges of first-class functions in programming languages.';

const summary2 =
  '2 Building Abstractions with Data' +
  '\n1. **Focus on Compound Data:**' +
  ' The chapter discusses the importance of compound data in programming languages to model complex phenomena and improve design modularity.' +
  '\n2. **Data Abstraction:**' +
  ' Introduces the concept of data abstraction, emphasizing how it simplifies program design by separating the representation and usage of data objects.' +
  '\n3. **Expressive Power:**' +
  ' Compound data enhances the expressive power of programming languages, allowing the manipulation of different data types without detailed knowledge of their representations.' +
  '\n4. **Symbolic Expressions and Generic Operations:**' +
  ' Explores symbolic expressions, alternatives for representing sets, and the need for generic operations in handling differently represented data, illustrated with polynomial arithmetic.';

const summary2_1 =
  '2.1 Introduction to Data Abstraction' +
  '\n1. **Data Abstraction Definition:**' +
  ' Data abstraction is a methodology separating how compound data is used from its construction details using selectors and constructors.' +
  '\n2. **Functional Abstraction Analogy:**' +
  ' Similar to functional abstraction, data abstraction allows replacing details of data implementation while preserving overall behavior.' +
  '\n3. **Program Structuring:**' +
  ' Programs should operate on "abstract data" without unnecessary assumptions, with a defined interface using selectors and constructors for concrete data representation.' +
  '\n4. **Illustration with Rational Numbers:**' +
  ' The concept is illustrated by designing functions for manipulating rational numbers through data abstraction techniques.';

const summary2_1_1 =
  '2.1.1 Example: Arithmetic Operations for Rational Numbers' +
  '\n1. **Rational Number Operations:**' +
  ' Describes arithmetic operations for rational numbers: add, subtract, multiply, divide, and equality tests.' +
  '\n2. **Synthetic Strategy:**' +
  ' Utilizes "wishful thinking" synthesis, assuming constructor and selectors for rational numbers without defining their implementation details.' +
  '\n3. **Pairs and Glue:**' +
  ' Introduces pairs as the glue for implementing concrete data abstraction and list-structured data, illustrating their use in constructing complex data structures.' +
  '\n4. **Rational Number Representation:**' +
  ' Represents rational numbers as pairs of integers (numerator and denominator) and implements operations using pairs as building blocks. Also addresses reducing rational numbers to lowest terms.';

const summary2_1_2 =
  '2.1.2 Abstraction Barriers' +
  '\n1. **Abstraction Barriers:**' +
  ' Discusses the concept of abstraction barriers, separating program levels using interfaces for data manipulation.' +
  '\n2. **Advantages of Data Abstraction:**' +
  ' Simplifies program maintenance and modification by confining data structure representation changes to a few modules.' +
  '\n3. **Flexibility in Implementation:**' +
  ' Illustrates the flexibility of choosing when to compute certain values, such as gcd, based on use patterns without modifying higher-level functions.' +
  '\n4. **Exercise Examples:**' +
  ' Presents exercises on representing line segments and rectangles, highlighting the application of abstraction barriers and flexibility in design.';

const summary2_1_3 =
  '2.1.3 What Is Meant by Data?' +
  '\n1. **Defining Data:**' +
  ' Discusses the concept of data, emphasizing the need for specific conditions that selectors and constructors must fulfill.' +
  '\n2. **Data as Collections of Functions:**' +
  ' Demonstrates the functional representation of pairs, illustrating that functions can serve as data structures fulfilling necessary conditions.' +
  '\n3. **Functional Pairs Implementation:**' +
  ' Presents an alternative functional representation of pairs and verifies its correctness in terms of head and tail functions.' +
  '\n4. **Church Numerals:**' +
  ' Introduces Church numerals, representing numbers through functions, and provides exercises to define one, two, and addition in this system.';

const summary2_1_4 =
  '2.1.4 Extended Exercise: Interval Arithmetic' +
  '\n1. **Interval Arithmetic Concept:**' +
  ' Alyssa P. Hacker is designing a system for interval arithmetic to handle inexact quantities with known precision.' +
  '\n2. **Interval Operations:**' +
  ' Alyssa defines operations like addition, multiplication, and division for intervals based on their lower and upper bounds.' +
  '\n3. **Interval Constructors and Selectors:**' +
  ' The text introduces an interval constructor and selectors, and there are exercises to complete the implementation and explore related concepts.' +
  '\n4. **User Issues:**' +
  " The user, Lem E. Tweakit, encounters discrepancies in computing parallel resistors using different algebraic expressions in Alyssa's system.";

const summary2_2 =
  '2.2 Hierarchical Data and the Closure Property' +
  '\n1. **Pair Representation:**' +
  ' Pairs, represented using box-and-pointer notation, serve as a primitive "glue" to create compound data objects.' +
  '\n2. **Universal Building Block:**' +
  ' Pairs, capable of combining numbers and other pairs, act as a universal building block for constructing diverse data structures.' +
  '\n3. **Closure Property:**' +
  ' The closure property of pairs enables the creation of hierarchical structures, facilitating the combination of elements with the same operation.' +
  '\n4. **Importance in Programming:**' +
  ' Closure is crucial in programming, allowing the construction of complex structures made up of parts, leading to powerful combinations.';

const summary2_2_1 =
  '2.2.1 Representing Sequences' +
  '\n1. **Sequence Representation:**' +
  ' Pairs are used to represent sequences, visualized as chains of pairs, forming a list structure in box-and-pointer notation.' +
  '\n2. **List Operations:**' +
  ' Lists, constructed using pairs, support operations like head and tail for element extraction, length for counting, and append for combining.' +
  '\n3. **Mapping with Higher-Order Function:**' +
  ' The higher-order function map abstracts list transformations, allowing the application of a function to each element, enhancing abstraction in list processing.' +
  '\n4. **For-Each Operation:**' +
  ' The for_each function applies a given function to each element in a list, useful for actions like printing, with the option to return an arbitrary value.';

const summary2_2_2 =
  '2.2.2 Hierarchical Structures' +
  '\n1. **Hierarchical Sequences:**' +
  ' Sequences of sequences are represented as hierarchical structures, extending the list structure to form trees.' +
  '\n2. **Tree Operations:**' +
  ' Recursion is used for tree operations, such as counting leaves and length, demonstrating natural tree processing with recursive functions.' +
  '\n3. **Mobile Representation:**' +
  ' Binary mobiles, consisting of branches and weights, are represented using compound data structures, with operations to check balance and calculate total weight.' +
  '\n4. **Mapping Over Trees:**' +
  ' Operations like scale_tree demonstrate mapping over trees, combining sequence operations and recursion for efficient tree manipulation.';

const summary2_2_3 =
  '2.2.3 Sequences as Conventional Interfaces' +
  '\n1. **Sequence Operations:**' +
  '- Use signals flowing through stages to design programs, enhancing conceptual clarity.' +
  '- Represent signals as lists, enabling modular program design with standard components.' +
  '\n2. **Operations on Sequences:**' +
  '- Implement mapping, filtering, and accumulation operations for sequence processing.' +
  '- Examples: map, filter, accumulate functions for various computations, providing modularity.' +
  '\n3. **Signal-Flow Structure:**' +
  '- Organize programs to manifest signal-flow structure for clarity.' +
  '- Utilize sequence operations like map, filter, and accumulate to express program designs.' +
  '\n4. **Exercises and Solutions:**' +
  '- Includes exercises involving list-manipulation operations and matrix operations.' +
  '- Demonstrates nested mappings for problem-solving, like permutations and eight-queens puzzle.';

const summary2_2_4 =
  '2.2.4 Example: A Picture Language' +
  '\n1. **Picture Language Overview:**' +
  '- Utilizes a simple language for drawing pictures, showcasing data abstraction, closure, and higher-order functions.' +
  '- Painters, representing images, draw within designated frames, enabling easy experimentation with patterns.' +
  '- Operations like flip, rotate, and squash transform painters, while combinations like beside and below create compound painters.' +
  '\n2. **Painter Operations:**' +
  '- `transform_painter` is a key operation, transforming painters based on specified frame points.' +
  '- Operations like flip_vert, rotate90, and squash_inwards leverage `transform_painter` to achieve specific effects.' +
  '- `beside` and `below` combine painters, each transformed to draw in specific regions of the frame.' +
  '\n3. **Stratified Design Principles:**' +
  '- Embraces stratified design, structuring complexity through levels and languages.' +
  '- Primitives like primitive painters are combined at lower levels, forming components for higher-level operations.' +
  '- Enables robust design, allowing changes at different levels with minimal impact.' +
  '\n4. **Examples and Exercises:**' +
  '- Illustrates examples like square_limit, flipped_pairs, and square_of_four.' +
  '- Exercises involve modifying patterns, defining new transformations, and demonstrating the versatility of the picture language.';

const summary2_3 =
  '2.3 Symbolic Data' +
  '\n1. **Compound Data Objects:**' +
  '- Constructed from numbers in previous sections.' +
  '- Introduction of working with strings as data.' +
  '\n2. **Representation Extension:**' +
  '- Enhances language capabilities.' +
  '- Adds versatility to data representation.';

const summary2_3_1 =
  '2.3.1 Strings' +
  '\n1. **String Usage:**' +
  '- Strings used for messages.' +
  '- Compound data with strings in lists.' +
  '\n2. **String Representation:**' +
  '- Strings in double quotes.' +
  '- Distinction from names in code.' +
  '\n3. **Comparison Operations:**' +
  '- Introduction of === and !== for strings.' +
  '- Example function using ===: `member(item, x)`.' +
  '\n4. **Exercises:**' +
  '- Evaluation exercises with lists and strings.' +
  '- Implementation exercise: `equal` function.';

const summary2_3_2 =
  '2.3.2 Example: Symbolic Differentiation' +
  '\n1. **Symbolic Differentiation:**' +
  '- Purpose: Deriving algebraic expressions symbolically.' +
  '- Historical Significance: Influential in Lisp development and symbolic mathematical systems.' +
  '\n2. **Differentiation Algorithm:**' +
  '- Abstract algorithm for sums, products, and variables.' +
  '- Recursive reduction rules for symbolic expressions.' +
  '\n3. **Expression Representation:**' +
  '- Use of prefix notation for mathematical structure.' +
  '- Variables represented as strings, sums, and products as lists.' +
  '\n4. **Algorithm Implementation:**' +
  '- `deriv` function for symbolic differentiation.' +
  '- Examples and the need for expression simplification.';

const summary2_3_3 =
  '2.3.3 Example: Representing Sets' +
  '\n1. **Set Representation:**' +
  '- Informal definition: a collection of distinct objects.' +
  '- Defined using data abstraction with operations: union_set, intersection_set, is_element_of_set, adjoin_set.' +
  '- Various representations: unordered lists, ordered lists, binary trees.' +
  '\n2. **Sets as Unordered Lists:**' +
  '- Represented as a list with no duplicate elements.' +
  '- Operations: is_element_of_set, adjoin_set, intersection_set.' +
  '- Efficiency concerns: is_element_of_set may require Θ(n) steps.' +
  '\n3. **Sets as Ordered Lists:**' +
  '- Elements listed in increasing order for efficiency.' +
  '- Operations like is_element_of_set benefit from ordered representation.' +
  '- Intersection_set exhibits significant speedup (Θ(n) instead of Θ(n^2)).' +
  '\n4. **Sets as Binary Trees:**' +
  '- Further speedup using a tree structure.' +
  '- Each node holds an entry and links to left and right subtrees.' +
  '- Operations: is_element_of_set, adjoin_set with Θ(log n) complexity.' +
  '- Balancing strategies needed to maintain efficiency.' +
  '\nNote: Code snippets and exercises provide implementation details for each representation.';

const summary2_3_4 =
  '2.3.4 Example: Huffman Encoding Trees' +
  '\n1. **Huffman Encoding Basics:**' +
  '- Describes the concept of encoding data using sequences of 0s and 1s (bits).' +
  '- Introduces fixed-length and variable-length codes for symbols.' +
  '- Illustrates an example of a fixed-length code and a variable-length code for a set of symbols.' +
  '\n2. **Variable-Length Codes:**' +
  '- Explains the concept of variable-length codes, where different symbols may have different bit lengths.' +
  '- Highlights the efficiency of variable-length codes in comparison to fixed-length codes.' +
  '- Introduces the idea of prefix codes, ensuring no code is a prefix of another.' +
  '\n3. **Huffman Encoding Method:**' +
  '- Presents the Huffman encoding method, a variable-length prefix code.' +
  '- Describes how Huffman codes are represented as binary trees.' +
  '- Explains the construction of Huffman trees based on symbol frequencies.' +
  '\n4. **Decoding with Huffman Trees:**' +
  '- Outlines the process of decoding a bit sequence using a Huffman tree.' +
  '- Describes the algorithm to traverse the tree and decode symbols.' +
  '- Provides functions for constructing, representing, and decoding Huffman trees in JavaScript.';

const summary2_4 =
  '2.4 Multiple Representations for Abstract Data' +
  '\n1. **Data Abstraction:**' +
  '- Introduces data abstraction as a methodology for structuring systems.' +
  '- Explains the use of abstraction barriers to separate design from implementation for rational numbers.' +
  '\n2. **Need for Multiple Representations:**' +
  '- Recognizes the limitation of a single underlying representation for data objects.' +
  '- Discusses the importance of accommodating multiple representations for flexibility.' +
  '\n3. **Generic Functions:**' +
  '- Highlights the concept of generic functions that operate on data with multiple representations.' +
  '- Introduces type tags and data-directed style for building generic functions.' +
  '\n4. **Complex-Number Example:**' +
  '- Illustrates the implementation of complex numbers with both rectangular and polar representations.' +
  '- Emphasizes the role of abstraction barriers in managing different design choices.';

const summary2_4_1 =
  '2.4.1 Representations for Complex Numbers' +
  '\n1. **Complex Number Representations:**' +
  '- Discusses two representations for complex numbers: rectangular form (real and imaginary parts) and polar form (magnitude and angle).' +
  '- Emphasizes the need for generic operations that work with both representations.' +
  '\n2. **Operations on Complex Numbers:**' +
  '- Describes arithmetic operations on complex numbers, highlighting differences in representation for addition, subtraction, multiplication, and division.' +
  '- Illustrates the use of selectors and constructors for implementing these operations.' +
  '\n3. **Programming Choices:**' +
  '- Introduces two programmers, Ben and Alyssa, independently choosing different representations for complex numbers.' +
  '- Presents the implementations of selectors and constructors for both rectangular and polar forms.' +
  '\n4. **Data Abstraction Discipline:**' +
  '- Ensures that the same generic operations work seamlessly with different representations.' +
  "- Acknowledges the example's simplification for clarity, noting the preference for rectangular form in practical computational systems.";

const summary2_4_2 =
  '2.4.2 Tagged data' +
  '\n1. **Principle of Least Commitment:**' +
  '- Data abstraction follows the principle of least commitment, allowing flexibility in choosing representations at the last possible moment.' +
  '- Maintains maximum design flexibility by deferring the choice of concrete representation for data objects.' +
  '\n2. **Tagged Data Implementation:**' +
  '- Introduces type tags to distinguish between different representations of complex numbers (rectangular or polar).' +
  '- Utilizes functions like `attach_tag`, `type_tag`, and `contents` to manage type information.' +
  '\n3. **Coexistence of Representations:**' +
  '- Shows how Ben and Alyssa can modify their representations to coexist in the same system using type tags.' +
  '- Ensures that functions do not conflict by appending "rectangular" or "polar" to their names.' +
  '\n4. **Generic Complex-Arithmetic System:**' +
  '- Implements generic complex-number arithmetic operations that work seamlessly with both rectangular and polar representations.' +
  '- The resulting system is decomposed into three parts: complex-number-arithmetic operations, polar implementation, and rectangular implementation.';

const summary2_4_3 =
  '2.4.3 Data-Directed Programming and Additivity' +
  '\n1. **Dispatching on Type:**' +
  '- Dispatching on type involves checking the type of a datum and calling an appropriate function.' +
  '- Provides modularity but has weaknesses, such as the need for generic functions to know about all representations.' +
  '\n2. **Data-Directed Programming:**' +
  '- Data-directed programming modularizes system design further.' +
  '- Uses an operation-and-type table, allowing easy addition of new representations without modifying existing functions.' +
  '\n3. **Implementation with Tables:**' +
  '- Uses functions like `put` and `get` for manipulating the operation-and-type table.' +
  '- Ben and Alyssa implement their packages by adding entries to the table, facilitating easy integration.' +
  '\n4. **Message Passing:**' +
  '- Message passing represents data objects as functions that dispatch on operation names.' +
  '- Provides an alternative to data-directed programming, where the data object receives operation names as "messages."';

const summary2_5 =
  '2.5 Systems with Generic Operations' +
  '\n1. **Generic Operations Design:**' +
  '- Systems designed to represent data objects in multiple ways through generic interface functions.' +
  '- These generic functions link various representations, providing flexibility and modularity.' +
  '\n2. **Data-Directed Techniques:**' +
  '- Extend the idea of generic operations to define operations generic over different argument types.' +
  '- Utilizes data-directed techniques for constructing a unified arithmetic package from various existing arithmetic packages.' +
  '\n3. **Unified Arithmetic System:**' +
  '- Figure 2.23 illustrates the structure of a generic arithmetic system.' +
  '- Abstraction barriers allow uniform access to ordinary, rational, and complex arithmetic packages through a single generic interface.' +
  '\n4. **Additive Structure:**' +
  '- Individual arithmetic packages (ordinary, rational, complex) designed separately.' +
  '- Additive structure allows combination to produce a comprehensive generic arithmetic system.';

const summary2_5_1 =
  '2.5.1 Generic Arithmetic Operations' +
  '\n1. **Generic Arithmetic Operations:**' +
  '- Designing generic arithmetic operations similar to complex-number operations.' +
  '- Generic functions (add, sub, mul, div) dispatch to appropriate packages based on argument types.' +
  '\n2. **Package for Ordinary Numbers:**' +
  '- Install package for primitive (JavaScript) numbers tagged as "javascript_number."' +
  '- Arithmetic operations defined using primitive functions.' +
  '\n3. **Extension to Rational Numbers:**' +
  '- Add package for rational arithmetic with internal functions from section 2.1.1.' +
  '- Utilize additivity for seamless integration with the existing generic arithmetic system.' +
  '\n4. **Complex Number Package:**' +
  '- Implement a package for complex numbers using the tag "complex."' +
  '- Use existing functions (add_complex, sub_complex) from rectangular and polar packages.' +
  '\n5. **Two-Level Tag System:**' +
  '- Complex numbers have an outer tag ("complex") directing to the complex package.' +
  '- Inner tag ("rectangular" or "polar") further directs within the complex package.' +
  '\n6. **Error Resolution:**' +
  '- Resolve an error in magnitude(z) by defining complex selectors for "complex" numbers.' +
  '- Add real_part, imag_part, magnitude, and angle functions to the complex package.' +
  '\n7. **Internal Functions Simplification:**' +
  '- Internal arithmetic functions in packages (add_rat, add_complex) can have the same names.' +
  '- Naming simplification is possible once declarations are internal to different installation functions.';

const summary2_5_2 =
  '2.5.2 Combining Data of Different Types' +
  '\n1. **Cross-Type Operations:**' +
  '- Consideration of operations crossing type boundaries, like adding a complex number to an ordinary number.' +
  '- Current approach involves designing separate functions for each valid combination, which is cumbersome.' +
  '\n2. **Coercion Technique:**' +
  '- Introduction of coercion to handle operations between different types.' +
  '- Coercion functions transform objects of one type into an equivalent object of another type.' +
  '\n3. **Apply_Generic Modification:**' +
  '- Modify the apply_generic function to include coercion.' +
  "- Check if the operation is defined for the arguments' types; if not, attempt coercion." +
  '\n4. **Hierarchy of Types:**' +
  '- Introduction of a hierarchical structure (tower) to simplify coercion.' +
  '- Types arranged as subtypes and supertypes, enabling a systematic approach to adding new types.';

const summary2_5_3 =
  '2.5.3 Example: Symbolic Algebra' +
  '\n1. **Symbolic Algebra Overview:**' +
  '- Symbolic algebra involves manipulating expressions with variables and operators.' +
  '- Expressions are hierarchical structures, often viewed as trees of operators and operands.' +
  '- Abstractions like linear combination, polynomial, and trigonometric function are common in symbolic algebra.' +
  '\n2. **Polynomial Arithmetic:**' +
  '- Polynomials are represented as a sum of terms, each comprising a coefficient and a power of an indeterminate.' +
  '- Designing a system involves abstracting data using a "poly" data structure with addition and multiplication operations.' +
  '- Generic operations are applied to manipulate terms and term lists for addition and multiplication of polynomials.' +
  '\n3. **Data Abstraction and Generic Operations:**' +
  '- Data abstraction principles, including type tags, are used for polynomial representation and manipulation.' +
  '- Generic operations like add and multiply enable flexibility in handling various coefficient types.' +
  '\n4. **Challenges and Extensions:**' +
  '- Challenges include defining polynomials with different variables and addressing coercion issues.' +
  '- Exercises involve extending the system for subtraction, handling dense and sparse polynomials, and implementing rational functions.' +
  '\n5. **Hierarchies and GCD Computation:**' +
  '- Symbolic algebra illustrates complex type hierarchies where polynomials may have coefficients as polynomials.' +
  '- Greatest Common Divisor (GCD) computation is crucial for operations on rational functions but presents challenges.' +
  '\n6. **Reducing Rational Functions:**' +
  '- Rational functions are reduced to lowest terms using GCD computation and an integerizing factor.' +
  "- The process involves multiplying by the GCD's leading coefficient's power and reducing coefficients to their greatest common divisor." +
  '\n7. **Implementation Exercises:**' +
  '- Exercises cover pseudodivision, modifying GCD computation, and implementing a system for reducing rational functions to lowest terms.' +
  '- The challenges include efficiently computing polynomial GCDs, a crucial aspect of algebraic-manipulation systems.';

const summary3 =
  '3 Modularity, Objects, and State' +
  '\n1. **Organizational Strategies:**' +
  " Programs designed for modeling physical systems can benefit from mirroring the system's structure." +
  ' Two main strategies: object-based (objects with changing behaviors) and stream-processing (focus on information flow).' +
  '\n2. **Linguistic Challenges:**' +
  ' Object-based approach deals with identity maintenance amid changes, moving away from the substitution model.' +
  ' Stream-processing requires decoupling simulated time, using delayed evaluation for optimal exploitation.' +
  '\n3. **Program Organization:**' +
  ' Successful system organization allows easy addition of new features without strategic program changes.' +
  ' Large program structure is influenced by the perception of the system being modeled.' +
  '\n4. **Computational Models:**' +
  ' Object-based models involve computational objects mirroring real-world objects.' +
  ' Stream-processing involves viewing systems as information flows, decoupling simulated time for effective evaluation.';

const summary3_1 =
  '3.1 Assignment and Local State' +
  '\n1. **Object State:**' +
  ' Objects in a system have states influenced by their history, crucial for behavior determination.' +
  " State variables, like a bank account's balance, capture enough information for current behavior." +
  '\n2. **Interconnected Objects:**' +
  ' In systems, objects rarely act independently; interactions couple state variables, influencing each other.' +
  ' Modular computational models mirror actual system objects, each with its local state variables.' +
  '\n3. **Time-Dependent Behavior:**' +
  ' Computational models must change over time to mirror evolving system states.' +
  ' Assignment operations in programming languages are vital for updating state variables during program execution.';

const summary3_1_1 =
  '3.1.1 Local State Variables' +
  '\n1. **Time-Varying State:**' +
  ' Illustrates time-varying state in computational objects using the example of withdrawing from a bank account.' +
  " Function `withdraw` exhibits changing behavior with each call, influenced by the account's history." +
  '\n2. **Variable Declarations and Assignment:**' +
  ' Introduces variable declarations (`let`) and assignment operations for mutable state, enabling dynamic changes.' +
  ' Demonstrates the use of `balance` as a mutable variable, updating its value based on withdrawal operations.' +
  '\n3. **Encapsulation and Local State:**' +
  ' Addresses the issue of unrestricted access to `balance` by making it internal to `withdraw`.' +
  ' `make_withdraw_balance_100` encapsulates `balance` within a local environment, enhancing modularity.' +
  '\n4. **Creating Independent Objects:**' +
  ' Shows the creation of independent objects using functions like `make_withdraw` and `make_account`.' +
  ' Each object maintains its local state, demonstrating modularity and independence of objects.';

const summary3_1_2 =
  '3.1.2 The Benefits of Introducing Assignment' +
  '\n1. **Random Number Generation:**' +
  ' Demonstrates the use of assignment in implementing a random number generator (`rand`) with time-varying state.' +
  ' Utilizes `rand_update` function to generate sequences with desired statistical properties.' +
  '\n2. **Monte Carlo Simulation:**' +
  ' Applies the concept of local state to implement a Monte Carlo simulation for approximating π.' +
  " Shows how assignment enhances modularity by encapsulating the random-number generator's state." +
  '\n3. **Modularity with Assignment:**' +
  ' Compares the modular design of Monte Carlo simulation using `rand` with the non-modular version without local state.' +
  ' Assignment encapsulates the state within `rand`, simplifying the expression of the Monte Carlo method.' +
  '\n4. **Challenges and Complexity:**' +
  ' Acknowledges the conceptual challenges introduced by assignment in programming languages.' +
  ' Highlights the complexity of handling time-varying local state and the trade-offs in achieving modularity.';

const summary3_1_3 =
  '3.1.3 The Costs of Introducing Assignment' +
  '\n1. **Substitution Model Challenge:**' +
  ' Assignment disrupts the substitution model, hindering the interpretation of functions and altering the predictability of outcomes.' +
  '\n2. **Functional vs. Imperative Programming:**' +
  ' Describes functional programming as assignment-free, ensuring consistency in results with identical inputs.' +
  ' Imperative programming, with assignment, complicates reasoning and introduces bugs due to order-sensitive assignments.' +
  '\n3. **Identity and Change:**' +
  ' Discusses the profound issue of identity and change in computational models when assignments are introduced.' +
  ' Examines challenges in determining "sameness" and "change" with evolving objects and the breakdown of referential transparency.' +
  '\n4. **Pitfalls of Imperative Programming:**' +
  ' Highlights potential traps in imperative programming, emphasizing the importance of careful consideration of assignment order.' +
  ' Notes the increased complexity in concurrent execution scenarios and sets the stage for exploring computational models with assignments.';

const summary3_2 =
  '3.2 The Environment Model of Evaluation' +
  '\n1. **Assignment and Function Application:**' +
  ' Substitution model insufficient with assignment.' +
  ' Introduces environment model: frames, bindings, pointers, and the concept of "place."' +
  '\n2. **Environment Structure:**' +
  ' Environments are sequences of frames, each with bindings associating names with values.' +
  ' Illustrates a simple environment structure (Figure 3.1) with frames, pointers, and shadowing.' +
  '\n3. **Value Determination:**' +
  ' Value of a name determined by the first frame in the environment with a binding for that name.' +
  ' Shadowing explained: inner frame bindings take precedence, influencing value determination.' +
  '\n4. **Contextual Meaning:**' +
  ' Expressions acquire meaning in an environment.' +
  ' Global environment introduced, consisting of a single frame with primitive function names.' +
  ' Programs extend global environment with a program frame for top-level declarations.';

const summary3_2_1 =
  '3.2.1 The Rules for Evaluation' +
  '\n1. **Function Application in the Environment Model:**' +
  ' Environment model replaces substitution model for function application.' +
  ' Functions are pairs of code and an environment pointer, created by evaluating lambda expressions.' +
  '\n2. **Function Creation:**' +
  ' Functions created only by evaluating lambda expressions.' +
  ' Function code from lambda expression text, environment from evaluation environment.' +
  '\n3. **Applying Functions:**' +
  ' Create a new environment, bind parameters to argument values.' +
  ' Enclosing environment of the new frame is the specified function environment.' +
  ' Evaluate the function body in the new environment.' +
  '\n4. **Assignment Behavior:**' +
  ' Expression "name = value" in an environment locates the binding for the name.' +
  ' If variable binding, change to reflect the new value; if constant, signal an error.' +
  ' If the name is unbound, signal a "variable undeclared" error.' +
  '\n\n   Evaluation rules, while more complex than substitution, provide an accurate description of interpreter behavior.';

const summary3_2_2 =
  '3.2.2 Applying Simple Functions' +
  '\n1. **Environment Model for Function Calls:**' +
  ' Illustrates function application using the environment model.' +
  ' Analyzes function calls for `f(5)` using the functions `square`, `sum_of_squares`, and `f`.' +
  '\n2. **Environment Structures:**' +
  ' Functions create new environments for each call.' +
  ' Different frames keep local variables separate; each call to `square` generates a new environment.' +
  '\n3. **Evaluation Process:**' +
  ' Evaluates subexpressions of return expressions.' +
  ' Calls to functions create new environments.' +
  ' Focus on environment structures, details of value passing discussed later.' +
  '\n4. **Exercise 3.9:**' +
  ' Analyze environment structures for recursive and iterative factorial functions.' +
  " Environment model won't clarify space efficiency claims; tail recursion discussed later.";

const summary3_2_3 =
  '3.2.3 Frames as the Repository of Local State' +
  '\n1. **Object with Local State:**' +
  ' Illustrates using functions and assignment to represent objects with local state.' +
  ' Example: "withdrawal processor" function, `make_withdraw(balance)`, is evaluated.' +
  '\n2. **Environment Structures:**' +
  ' Function application creates frames with local state.' +
  ' Examines environment structures for `make_withdraw(100)` and subsequent call `W1(50)`.' +
  '\n3. **Local State Handling:**' +
  ' Frame enclosing environment holds local state (e.g., balance).' +
  ' Different objects (e.g., `W1` and `W2`) have independent local state, preventing interference.' +
  '\n4. **Alternate Version - Exercise 3.10:**' +
  ' Analyzes an alternate version of `make_withdraw` using an immediately invoked lambda expression.' +
  ' Compares environment structures for objects created with both versions.';

const summary3_2_4 =
  '3.2.4 Internal Declarations' +
  '\n1. **Block Scoping:**' +
  ' Examines evaluation of blocks (e.g., function bodies) with declarations, introducing block scope.' +
  ' Each block creates a new scope for declared names, preventing interference with external names.' +
  '\n2. **Example: Square Root Function:**' +
  ' Demonstrates internal declarations within the `sqrt` function for square roots.' +
  ' Uses the environment model to explain the behavior of internal functions.' +
  '\n3. **Properties of Internal Declarations:**' +
  " Names of local functions don't interfere with external names." +
  " Internal functions can access enclosing function's arguments due to nested environments." +
  '\n4. **Exercise 3.11: Bank Account Function:**' +
  ' Analyzes the environment structure for a bank account function with internal declarations.' +
  ' Explores how local states for multiple accounts are kept distinct in the environment model.' +
  '\n5. **Mutual Recursion:**' +
  ' Explains how mutual recursion works with the environment model.' +
  ' Illustrates with a recursive example checking if a nonnegative integer is even or odd.' +
  '\n6. **Top-Level Declarations:**' +
  ' Revisits top-level name declarations.' +
  ' Explains that the whole program is treated as an implicit block evaluated in the global environment.' +
  ' Describes how locally declared names are handled within blocks.';

const summary3_3 =
  '3.3 Modeling with Mutable Data' +
  '\n1. **Introduction to Mutable Data:**' +
  ' Addresses the need to model systems with changing states, requiring modifications to compound data objects.' +
  '\n2. **Data Abstractions Extension:**' +
  ' Extends data abstractions with mutators, alongside constructors and selectors.' +
  ' Demonstrates the necessity of modifying compound data objects for modeling dynamic systems.' +
  '\n3. **Example: Banking System:**' +
  ' Illustrates the concept of mutators using a banking system example.' +
  ' Describes an operation `set_balance(account, new_value)` to change the balance of a designated account.' +
  '\n4. **Pairs as Building Blocks:**' +
  ' Enhances pairs with basic mutators, expanding their representational power beyond sequences and trees.' +
  ' Introduces the concept of mutable data objects and their importance in modeling complex systems.';

const summary3_3_1 =
  '3.3.1 Mutable List Structure' +
  '\n1. **Limitations of Basic Operations:**' +
  ' Pair operations (pair, head, tail) and list operations (append, list) cannot modify list structures.' +
  ' Introduction of new mutators, set_head, and set_tail for modifying pairs in list structures.' +
  '\n2. **Set_Head Operation:**' +
  ' Modifies the head pointer of a pair, demonstrated with an example.' +
  ' Illustrates the impact on the structure, showing detached pairs and modified list.' +
  '\n3. **Set_Tail Operation:**' +
  ' Similar to set_head but replaces the tail pointer of a pair.' +
  ' Demonstrates the effect on the list structure, highlighting changes in pointers.' +
  '\n4. **Pair Construction vs. Mutators:**' +
  ' Describes the difference between constructing new list structures with pair and modifying existing ones with mutators.' +
  ' Presents a function pair implementation using mutators set_head and set_tail.';

const summary3_3_2 =
  '3.3.2 Representing Queues' +
  '\n1. **Queue Definition:**' +
  ' Queues are sequences with insertions at the rear and deletions at the front, known as FIFO (first in, first out) buffers.' +
  ' Operations: make_queue, is_empty_queue, front_queue, insert_queue, delete_queue.' +
  '\n2. **Efficient Queue Representation:**' +
  ' Efficiently represent queues using pairs with front_ptr and rear_ptr, reducing insertion time from Θ(n) to Θ(1).' +
  ' Queue is a pair (front_ptr, rear_ptr) where the front_ptr points to the first item, and rear_ptr points to the last item.' +
  '\n3. **Queue Operations:**' +
  ' Define operations using functions like front_ptr, rear_ptr, set_front_ptr, and set_rear_ptr.' +
  ' Efficiently implement is_empty_queue, make_queue, front_queue, insert_queue, and delete_queue.' +
  '\n4. **Implementation Insight:**' +
  ' Overcoming inefficiencies of standard list representation for queues by maintaining pointers to both ends.' +
  ' Explanation of how the modification enables constant-time insertions and deletions.' +
  '\n\n   **Note:** The text also includes exercises related to queue implementation and representation, involving debugging and alternative representations.';

const summary3_3_3 =
  '3.3.3 Representing Tables' +
  '\n1. **One-Dimensional Table:**' +
  ' Table represented as a list of records (key, value pairs) with a special "backbone" pair.' +
  ' Lookup function retrieves values by key, insert function adds or updates key-value pairs.' +
  '\n2. **Two-Dimensional Table:**' +
  ' Extends one-dimensional table concept to handle two keys, creating subtables.' +
  ' Lookup and insert functions adapted for two keys, providing efficient indexing.' +
  '\n3. **Local Tables and Procedural Representation:**' +
  ' Procedural representation using a table object with internal state.' +
  ' Functions (lookup, insert) encapsulated within the object for multiple table access.' +
  '\n4. **Memoization with Tables:**' +
  ' Memoization technique enhances function performance by storing previously computed values.' +
  ' Example: memoized Fibonacci function using a local table to store computed results.' +
  '\n\n   **Note:** The text also includes exercises related to table construction, key testing, generalizing tables, binary tree organization, and memoization.';

const summary3_3_4 =
  '3.3.4 A Simulator for Digital Circuits' +
  '\n1. **Digital Circuit Simulation:**' +
  ' Digital systems engineers use computer simulation to design and analyze complex circuits.' +
  ' Event-driven simulation triggers actions based on events, creating a sequence of interconnected events.' +
  '\n2. **Computational Model of Circuits:**' +
  ' Circuits composed of wires and primitive function boxes (and-gate, or-gate, inverter).' +
  ' Signals propagate with delays, affecting circuit behavior.' +
  '\n3. **Simulation Program Design:**' +
  ' Program constructs computational objects for wires and function boxes.' +
  ' Simulation driven by an agenda, scheduling actions at specific times.' +
  '\n4. **Circuit Construction with Functions:**' +
  ' Functions (e.g., `half_adder`, `full_adder`) defined to wire primitive function boxes into complex circuits.' +
  ' Memoization enhances function performance using local tables.' +
  '\n\n   **Note:** The text delves into detailed examples and exercises for building a digital circuit simulator, including functions for wires, primitive functions, and agenda-based simulation.';

const summary3_3_5 =
  '3.3.5 Propagation of Constraints' +
  '\n1. **Introduction to Constraint Modeling:**' +
  ' Traditional programs follow one-directional computations, while systems modeling often involves relations among quantities.' +
  ' Constraints express relationships between quantities; for example, in a mechanical model, the deflection of a rod relates to force, length, area, and modulus.' +
  '\n2. **Constraint-Based Language Design:**' +
  ' Language primitives include constraints like adder(a, b, c), multiplier(x, y, z), and constant(3.14, x).' +
  ' Constraint networks combine constraints using connectors to express complex relations, allowing bidirectional computation.' +
  '\n3. **Constraint System Implementation:**' +
  ' Procedural objects represent connectors with local state for value, informant, and constraints.' +
  ' Functions like set_value, forget_value, and connect enable connectors to interact with constraints.' +
  '\n4. **Example: Celsius-Fahrenheit Converter:**' +
  ' The language is applied to a converter using connectors C and F, demonstrating bidirectional computation.' +
  ' Probes monitor and report changes in connector values, showcasing the flexibility of constraint-based systems.' +
  '\n\n   **Key Concepts:**' +
  ' Constraint propagation involves notifying constraints of value changes and handling bidirectional computations.' +
  ' Constraint networks utilize connectors and primitives to model complex relationships in a constraint-based language.';

const summary3_4 =
  '3.4 Concurrency: Time Is of the Essence' +
  '\n1. **Introduction to Time and State:**' +
  ' Computational objects with local state sacrifice referential transparency, introducing time complexities.' +
  ' Assignment introduces time into models, challenging the substitution model and demanding an environment model.' +
  '\n2. **Modeling Time with State:**' +
  ' Stateful computations lead to time-dependent results, as illustrated by bank account withdrawals yielding different balances.' +
  " Assignment execution delineates moments in time, and expressions' values depend on timing." +
  '\n3. **Concurrent Computation:**' +
  " Modeling systems concurrently as collections of threads (sequential processes) reflects real-world objects' simultaneous actions." +
  ' Concurrent programming enhances modularity and can provide speed advantages by leveraging multiple processors.' +
  '\n4. **Challenges of Concurrency and Assignment:**' +
  ' Assignment complexities intensify in concurrent execution, demanding a nuanced understanding of time.' +
  ' Concurrent computation introduces additional time-related complexities, emphasizing shared memory threads.' +
  '\n\n   **Key Concepts:**' +
  ' Local state introduces time considerations, altering the deterministic nature of timeless expressions.' +
  ' Concurrent computation enhances modularity and potential speed advantages but adds complexity to understanding time.';

const summary3_4_1 =
  '3.4.1 The Nature of Time in Concurrent Systems' +
  '\n1. **Time Ordering in Events:**' +
  ' Time orders events as preceding, simultaneous, or following, illustrated with bank account balance changes.' +
  ' Sequential assignments model changing balances, but complex scenarios emerge in distributed systems.' +
  '\n2. **Challenges in Concurrent Systems:**' +
  ' Concurrent threads sharing state variables pose indeterminacy in event order, leading to potential bugs.' +
  ' Example: Shared variable assignments in withdrawals, when interleaved, may violate system integrity.' +
  '\n3. **Concurrency and Shared State:**' +
  ' Concurrent programs face complexities due to shared state variables, especially in managing simultaneous changes.' +
  ' Concurrent restrictions may be needed to ensure correct behavior, posing challenges in designing efficient and effective systems.' +
  '\n4. **Requirements for Correct Execution:**' +
  ' Stringent concurrency restrictions may hinder efficiency, prompting exploration of less strict requirements.' +
  ' Correct execution may demand producing the same result as a sequential run, allowing some flexibility in outcomes.';

const summary3_4_2 =
  '3.4.2 Mechanisms for Controlling Concurrency' +
  '\n1. **Concurrency Challenges:**' +
  ' Concurrency challenges arise from interleaving events in different threads.' +
  ' Managing the order of events becomes complex with increasing threads and events.' +
  '\n2. **Serialization for Shared State:**' +
  ' Serialization ensures that certain functions cannot be executed concurrently.' +
  ' Mechanisms like serializers create sets of functions, allowing only one execution at a time.' +
  '\n3. **Serializer Implementation:**' +
  ' Serializer creates serialized functions, controlling access to shared variables.' +
  ' Example: make_serializer function uses a mutex for atomic test_and_set operations.' +
  '\n4. **Deadlock and Deadlock Avoidance:**' +
  ' Deadlock occurs when threads are stuck waiting for each other in a circular dependency.' +
  ' Deadlock avoidance involves numbering shared resources and acquiring them in order to prevent circular dependencies.';

const summary3_5 =
  '3.5 Streams' +
  '\n1. **Modeling State with Streams:**' +
  '- Streams serve as an alternative to assignments for modeling state in computational objects.' +
  '- Stream processing represents time histories of systems without mutable data, using delayed evaluation.' +
  '\n2. **Sequence Representation:**' +
  '- Streams are viewed as sequences, offering a way to model time-varying behavior without direct assignment.' +
  '- Time functions are represented as (potentially infinite) sequences, introducing the concept of world lines.' +
  '\n3. **Delayed Evaluation Technique:**' +
  '- Implementation of streams involves delayed evaluation to handle large or infinite sequences effectively.' +
  '- This technique allows representing extensive sequences without fully realizing them, addressing practical challenges.' +
  '\n4. **Challenges and Implications:**' +
  '- Stream processing avoids assignment-related drawbacks but introduces its own difficulties.' +
  '- The choice between modeling techniques for modular and maintainable systems remains an open question;';

const summary3_5_1 =
  '**3.5.1 Streams Are Delayed Lists**' +
  '\n1. **Efficiency Challenges with Lists:**' +
  '- Representing sequences as lists introduces inefficiencies in time and space for certain computations.' +
  '- Example: Summing prime numbers in an interval, comparing iterative and sequence operation approaches.' +
  '\n2. **Stream Introduction and Structure:**' +
  '- Streams offer a solution to list inefficiencies by allowing demand-driven programming.' +
  '- Stream pairs, consisting of head and a promise (delayed evaluation), represent elements and future construction.' +
  '\n3. **Stream Operations and Functions:**' +
  '- Stream analogs of list operations are defined, including stream_ref, stream_map, and stream_for_each.' +
  '- Delayed evaluation in streams allows elegant formulations, separating apparent structure from actual computation.' +
  '\n4. **Memoization for Efficiency:**' +
  '- Memoization optimizes stream implementation by avoiding repeated evaluation of delayed objects.' +
  '- Function memo is introduced to memoize stream construction, enhancing efficiency in recursive programs;';

const summary3_5_2 =
  '**3.5.2 Infinite Streams**' +
  '\n1. **Representation of Infinite Streams:**' +
  '- Infinite streams efficiently represent sequences, even infinite ones.' +
  '- Streams allow for delayed evaluation, computing only as much as needed.' +
  '\n2. **Examples of Infinite Streams:**' +
  '- Positive integers, non-divisible by 7, Fibonacci, and prime numbers as infinite streams.' +
  '- Streams created using generating functions and filtering mechanisms.' +
  '\n3. **Implicit Definition of Streams:**' +
  '- Streams can be implicitly defined, taking advantage of delayed evaluation.' +
  '- Operations like `add_streams` and `scale_stream` manipulate and generate streams.' +
  '\n4. **Signal Processing with Sieve:**' +
  '- The prime sieve is presented as a signal-processing system.' +
  '- Sieving process efficiently generates an infinite stream of prime numbers.' +
  '\nNote: Omitted specific programming details and exercises;';

const summary3_5_3 =
  '**3.5.3 Exploiting the Stream Paradigm**' +
  '\n1. **Stream Processing Paradigm:**' +
  '- Streams with delayed evaluation model signal-processing systems.' +
  '- Allows modeling systems with different module boundaries, emphasizing time series.' +
  '\n2. **Formulating Iterations as Streams:**' +
  '- Iterative processes represented as streams with infinite sequences.' +
  '- Examples include sqrt_stream for square roots and pi_stream for approximating π.' +
  '\n3. **Advanced Techniques:**' +
  "- Acceleration techniques like Euler's transform enhance convergence." +
  '- Super-acceleration achieved by recursively applying the acceleration process.' +
  '\n4. **Memoization and Optimization:**' +
  '- Memoization used for efficient repeated evaluation of streams.' +
  '- Elegant stream formulation facilitates manipulation with uniform operations.';

const summary3_5_4 =
  '**3.5.4 Streams and Delayed Evaluation Summary**' +
  '\n1. **Signal Processing with Feedback Loops:**' +
  '- Streams used to model systems with feedback loops in signal processing.' +
  "- Integral function's internal stream is defined recursively, demonstrating feedback loop modeling." +
  '\n2. **Implicit Definition Challenges:**' +
  '- Implicit definitions in signal processing systems pose challenges without delayed evaluation.' +
  '- Streams may require delays beyond typical stream programming patterns for effective modeling.' +
  '\n3. **Redefined Integral Function:**' +
  '- Integral function modified to expect a delayed integrand argument.' +
  '- Delayed evaluation crucial for generating streams without fully knowing the input.' +
  '\n4. **Example: Solving Differential Equations:**' +
  '- Solve function demonstrated for approximating e using a delayed approach.' +
  '- Caller must delay the integrand argument for integral, ensuring proper evaluation sequence.';

const summary3_5_5 =
  '**3.5.5 Modularity of Functional Programs and Modularity of Objects Summary**' +
  '\n1. **Stream-Based Modularity:**' +
  '- Streams provide modularity without assignment, encapsulating state evolution.' +
  '- Illustration using Monte Carlo estimation of π, stream-processing version.' +
  '\n2. **Stream Withdrawal Processor:**' +
  '- Comparison of withdrawal processor as a computational object and as a stream function.' +
  '- Stream representation has no assignment or local state, emphasizing temporal stream behavior.' +
  '\n3. **Functional Time Modeling:**' +
  '- Streams explicitly represent time in modeling changing quantities.' +
  '- Functional approach allows state representation with well-defined mathematical functions.' +
  '\n4. **Challenges in Functional Models:**' +
  '- Challenges arise in functional models, especially in interactive systems with independent entities.' +
  '- Merging streams introduces time-related problems, reminiscent of synchronization issues in object-oriented models.';

//...

const SICPNotes = {
  '1': summary1,
  '1.1': summary1_1,
  '1.1.1': summary1_1_1,
  '1.1.2': summary1_1_2,
  '1.1.3': summary1_1_3,
  '1.1.4': summary1_1_4,
  '1.1.5': summary1_1_5,
  '1.1.6': summary1_1_6,
  '1.1.7': summary1_1_7,
  '1.1.8': summary1_1_8,
  '1.2': summary1_2,
  '1.2.1': summary1_2_1,
  '1.2.2': summary1_2_2,
  '1.2.3': summary1_2_3,
  '1.2.4': summary1_2_4,
  '1.2.5': summary1_2_5,
  '1.2.6': summary1_2_6,
  '1.3': summary1_3,
  '1.3.1': summary1_3_1,
  '1.3.2': summary1_3_2,
  '1.3.3': summary1_3_3,
  '1.3.4': summary1_3_4,
  '2': summary2,
  '2.1': summary2_1,
  '2.1.1': summary2_1_1,
  '2.1.2': summary2_1_2,
  '2.1.3': summary2_1_3,
  '2.1.4': summary2_1_4,
  '2.2': summary2_2,
  '2.2.1': summary2_2_1,
  '2.2.2': summary2_2_2,
  '2.2.3': summary2_2_3,
  '2.2.4': summary2_2_4,
  '2.3': summary2_3,
  '2.3.1': summary2_3_1,
  '2.3.2': summary2_3_2,
  '2.3.3': summary2_3_3,
  '2.3.4': summary2_3_4,
  '2.4': summary2_4,
  '2.4.1': summary2_4_1,
  '2.4.2': summary2_4_2,
  '2.4.3': summary2_4_3,
  '2.5': summary2_5,
  '2.5.1': summary2_5_1,
  '2.5.2': summary2_5_2,
  '2.5.3': summary2_5_3,
  '3': summary3,
  '3.1': summary3_1,
  '3.1.1': summary3_1_1,
  '3.1.2': summary3_1_2,
  '3.1.3': summary3_1_3,
  '3.2': summary3_2,
  '3.2.1': summary3_2_1,
  '3.2.2': summary3_2_2,
  '3.2.3': summary3_2_3,
  '3.2.4': summary3_2_4,
  '3.3': summary3_3,
  '3.3.1': summary3_3_1,
  '3.3.2': summary3_3_2,
  '3.3.3': summary3_3_3,
  '3.3.4': summary3_3_4,
  '3.3.5': summary3_3_5,
  '3.4': summary3_4,
  '3.4.1': summary3_4_1,
  '3.4.2': summary3_4_2,
  '3.5': summary3_5,
  '3.5.1': summary3_5_1,
  '3.5.2': summary3_5_2,
  '3.5.3': summary3_5_3,
  '3.5.4': summary3_5_4,
  '3.5.5': summary3_5_5
  //...
};

export default SICPNotes;
