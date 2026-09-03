In [computer science](https://en.wikipedia.org/wiki/Computer_science "Computer science"), a **tail call** is a [subroutine](https://en.wikipedia.org/wiki/Subroutine "Subroutine") call performed as the final action of a procedure.[1] If the target of a tail is the same subroutine, the subroutine is said to be **tail recursive**, which is a special case of direct [recursion](https://en.wikipedia.org/wiki/Recursion_(computer_science) "Recursion (computer science)"). **Tail recursion** (or **tail-end recursion**) is particularly useful, and is often easy to optimize in implementations.

Tail calls can be implemented without adding a new [stack frame](https://en.wikipedia.org/wiki/Stack_frame "Stack frame") to the [call stack](https://en.wikipedia.org/wiki/Call_stack "Call stack"). Most of the frame of the current procedure is no longer needed, and can be replaced by the frame of the tail call, modified as appropriate (similar to [overlay](https://en.wikipedia.org/wiki/Exec_(system_call) "Exec (system call)") for processes, but for function calls). The program can then [jump](https://en.wikipedia.org/wiki/Jump_(computer_science) "Jump (computer science)") to the called subroutine. Producing such code instead of a standard call sequence is called **tail-call elimination** or **tail-call optimization**. Tail-call elimination allows procedure calls in tail position to be implemented as efficiently as [goto](https://en.wikipedia.org/wiki/Goto "Goto") statements, thus allowing efficient [structured programming](https://en.wikipedia.org/wiki/Structured_programming "Structured programming"). In the words of [Guy L. Steele](https://en.wikipedia.org/wiki/Guy_L._Steele "Guy L. Steele"), "in general, procedure calls may be usefully thought of as GOTO statements which also pass parameters, and can be uniformly coded as \[machine code\] JUMP instructions".[2]

Not all programming languages require tail-call elimination. However, in [functional programming languages](https://en.wikipedia.org/wiki/Functional_programming_language "Functional programming language"), tail-call elimination is often guaranteed by the [language standard](https://en.wikipedia.org/wiki/Programming_language_specification "Programming language specification"), allowing tail recursion to use a similar amount of memory as an equivalent [loop](https://en.wikipedia.org/wiki/Loop_(computing) "Loop (computing)"). The special case of tail-recursive calls, when a function calls itself, may be more amenable to call elimination than general tail calls. When the language semantics do not explicitly support general tail calls, a compiler can often still optimize **sibling calls**, or tail calls to functions which take and return the same types as the caller.[3]

## Description

When a function is called, the computer must "remember" the place it was called from, the _[return address](https://en.wikipedia.org/wiki/Return_address_(computing) "Return address (computing)")_, so that it can return to that location with the result once the call is complete. Typically, this information is saved on the [call stack](https://en.wikipedia.org/wiki/Call_stack "Call stack"), a list of return locations in the order that the call locations were reached. In addition, compilers allocate memory for local variables of the called function and push register content (if any and/or relevant) onto the stack. Typically, it is done by allocating a stack frame including saved registers, space allocated for non-register local variables, return address and call parameters (unless they are passed in registers). For tail calls, there is no need to remember the caller or preserve content of registers– instead, tail-call elimination avoids allocation of new stack frames and makes only the minimum necessary changes to the existing stack frame before passing it on, and the tail-called function will return directly to the _original_ caller.[4] This, however, leads to complete loss of the caller's stack frame, which is sometimes considered as a hindrance in debugging. The tail call doesn't have to appear lexically after all other statements in the source code; it is only important that the calling function return immediately after the tail call, returning the tail call's result if any, since the calling function is bypassed when the optimization is performed.

For non-recursive function calls, this is usually an [optimization](https://en.wikipedia.org/wiki/Program_optimization "Program optimization") that saves only a little time and space, since there are not that many different functions available to call. When dealing with recursive or [mutually recursive](https://en.wikipedia.org/wiki/Mutually_recursive "Mutually recursive") functions where recursion happens through tail calls, however, the stack space and the number of returns saved can grow to be very significant, since a function can call itself, directly or indirectly, creating a new call stack frame each time. Tail-call elimination often reduces asymptotic stack space requirements from linear, or [O](https://en.wikipedia.org/wiki/Big-O_notation "Big-O notation")(_n_), to constant, or O(1). Tail-call elimination is thus required by the standard definitions of some programming languages, such as [Scheme](https://en.wikipedia.org/wiki/Scheme_(programming_language) "Scheme (programming language)"), and languages in the [ML](https://en.wikipedia.org/wiki/ML_(programming_language) "ML (programming language)") family among others.[5][6] The Scheme language definition formalizes the intuitive notion of tail position exactly, by specifying which syntactic forms allow having results in tail context.[7] Implementations allowing an unlimited number of tail calls to be active at the same moment, thanks to tail-call elimination, can also be called "properly tail recursive".[5]

Besides space and execution efficiency, tail-call elimination is important in the [functional programming](https://en.wikipedia.org/wiki/Functional_programming "Functional programming") idiom known as [continuation-passing style](https://en.wikipedia.org/wiki/Continuation-passing_style "Continuation-passing style") (CPS), which would otherwise quickly run out of stack space.

## Syntactic form

A tail call can be located just before the syntactical end of a function.

```
int a(int n);
int b(int n);

int foo(int data) {
    a(data);
    return b(data);
}

```

Here, both `a(data)` and `b(data)` are calls, but `b` is the last thing the procedure executes before returning and is thus in tail position. However, not all tail calls are necessarily located at the syntactical end of a subroutine:

```
int c(int n);

int bar(int data) {
    if (a(data) > 0) {
        return b(data);
    }
    return c(data);
}

```

Here, both calls to `b` and `c` are in tail position. This is because each of them lies in the end of if-branch respectively, even though the first one is not syntactically at the end of `bar`'s body.

Consider this example:

```
int foo1(int data) {
    return a(data) + 1;
}

int foo2(int data) {
    int ret = a(data);
    return ret;
}

int foo3(int data) {
    int ret = a(data);
    return (ret == 0) ? 1 : ret;
}

```

The call to `a(data)` is in tail position in `foo2`, but it is **not** in tail position either in `foo1` or in `foo3`, because control must return to the caller to allow it to inspect or modify the return value before returning it.

## Example programs

The following program is an example in [Scheme](https://en.wikipedia.org/wiki/Scheme_(programming_language) "Scheme (programming language)"):[8]

```typescript
;; factorial : number -> number
;; to calculate the product of all positive
;; integers less than or equal to n.
(define (factorial n)
 (if (= n 0)
    1
    (* n (factorial (- n 1)))))

```

This is not written in a tail-recursive style, because the multiplication function ("\*") is in the tail position. This can be compared to:

```typescript
;; factorial : number -> number
;; to calculate the product of all positive
;; integers less than or equal to n.
(define (factorial n)
  (fact-iter 1 n))
(define (fact-iter product n)
  (if (= n 0)
      product
      (fact-iter (* product n)
                 (- n 1))))

```

This program assumes [applicative-order](https://en.wikipedia.org/wiki/Evaluation_strategy#Applicative_order "Evaluation strategy") evaluation. The inner procedure `fact-iter` calls itself _last_ in the control flow. This allows an [interpreter](https://en.wikipedia.org/wiki/Interpreter_(computer_software) "Interpreter (computer software)") or [compiler](https://en.wikipedia.org/wiki/Compiler "Compiler") to reorganize the execution which would ordinarily look like this:[8]

```
  call factorial (4)
   call fact-iter (1 4)
    call fact-iter (4 3)
     call fact-iter (12 2)
      call fact-iter (24 1)
      return 24
     return 24
    return 24
   return 24
  return 24
```

into the more [efficient](https://en.wikipedia.org/wiki/Algorithmic_efficiency "Algorithmic efficiency") variant, in terms of both space and time:

```
  call factorial (4)
   call fact-iter (1 4)
   replace arguments with (4 3)
   replace arguments with (12 2)
   replace arguments with (24 1)
   return 24
  return 24
```

This reorganization saves space because no state except for the calling function's address needs to be saved, either on the stack or on the heap, and the call stack frame for `fact-iter` is reused for the intermediate results storage. This also means that the programmer need not worry about running out of stack or heap space for extremely deep recursions. In typical implementations, the tail-recursive variant will be substantially faster than the other variant, but only by a constant factor.

Some programmers working in functional languages will rewrite recursive code to be tail recursive so they can take advantage of this feature. This often requires addition of an "accumulator" argument (`product` in the above example) to the function.

## Tail recursion modulo cons

**Tail recursion modulo cons** is a generalization of tail-recursion optimization introduced by [David H. D. Warren](https://en.wikipedia.org/wiki/David_H._D._Warren "David H. D. Warren")[9] in the context of [compilation](https://en.wikipedia.org/wiki/Compiler "Compiler") of [Prolog](https://en.wikipedia.org/wiki/Prolog "Prolog"), seen as an _explicitly_ [_set once_](https://en.wikipedia.org/wiki/Single_assignment#Single_assignment "Single assignment") language. It was described (though not named) by [Daniel P. Friedman](https://en.wikipedia.org/wiki/Daniel_P._Friedman "Daniel P. Friedman") and [David S. Wise](https://en.wikipedia.org/wiki/David_S._Wise?action=edit&redlink=1 "David S. Wise (page does not exist)") in 1974[10] as a [LISP](https://en.wikipedia.org/wiki/LISP "LISP") compilation technique. As the name suggests, it applies when the only operation left to perform after a recursive call is to prepend a known value in front of the list returned from it (or to perform a constant number of simple data-constructing operations, in general). This call would thus be a _tail call_ save for ("[modulo](https://en.wikipedia.org/wiki/Modulo_(jargon) "Modulo (jargon)")") the said _[cons](https://en.wikipedia.org/wiki/Cons "Cons")_ operation. But prefixing a value at the start of a list _on exit_ from a recursive call is the same as appending this value at the end of the growing list _on entry_ into the recursive call, thus building the list as a [side effect](https://en.wikipedia.org/wiki/Side_effect_(computer_science) "Side effect (computer science)"), as if in an implicit accumulator parameter. The following Prolog fragment illustrates the concept:

### Example code

```
% Prolog, tail recursive modulo cons:
partition([], _, [], []).
partition([X|Xs], Pivot, [X|Rest], Bigs) :-
  X @< Pivot, !,
  partition(Xs, Pivot, Rest, Bigs).
partition([X|Xs], Pivot, Smalls, [X|Rest]) :-
  partition(Xs, Pivot, Smalls, Rest).

```

```
-- In Haskell, guarded recursion:
partition [] _ = ([],[])
partition (x:xs) p 
        | x < p     = (x:a,b)
        | otherwise = (a,x:b)
   where
      (a,b) = partition xs p

```

```
% Prolog, with explicit unifications:
%     non-tail recursive translation:
partition([], _, [], []).
partition(L, Pivot, Smalls, Bigs) :- L=[X|Xs],
 (  X @< Pivot
 -> partition(Xs,Pivot,Rest,Bigs), Smalls=[X|Rest]
 ;  partition(Xs,Pivot,Smalls,Rest), Bigs=[X|Rest]
 ).

```

```
% Prolog, with explicit unifications:
%     tail-recursive translation:
partition([], _, [], []).
partition(L, Pivot, Smalls, Bigs) :- L=[X|Xs],
 (  X @< Pivot
 -> Smalls=[X|Rest], partition(Xs,Pivot,Rest,Bigs)
 ;  Bigs=[X|Rest], partition(Xs,Pivot,Smalls,Rest)
 ).

```

Thus in tail-recursive translation such a call is transformed into first creating a new [list node](https://en.wikipedia.org/wiki/Node_(computer_science) "Node (computer science)") and setting its `first` field, and _then_ making the tail call with the pointer to the node's `rest` field as argument, to be filled recursively. The same effect is achieved when the recursion is _guarded_ under a lazily evaluated data constructor, which is automatically achieved in lazy programming languages like Haskell.

### C example

The following fragment defines a recursive function in [C](https://en.wikipedia.org/wiki/C_(programming_language) "C (programming language)") that duplicates a linked list (with some equivalent Scheme and Prolog code as comments, for comparison):

```javascript
typedef struct LinkedList {
    void* value;
    struct LinkedList* next;
} LinkedList;

LinkedList* duplicate(const LinkedList* ls) {
    LinkedList* head = NULL;

    if (ls) {
        LinkedList* p = duplicate(ls->next);
        head = (LinkedList*)malloc(sizeof(*head));
        head->value = ls->value;
        head->next = p;
    }
    return head;
}

```

```
;; in Scheme,
(define (duplicate ls)
  (if (not (null? ls))
    (cons (car ls)
          (duplicate (cdr ls)))
    '()))

```

```
%% in Prolog,
duplicate([X|Xs],R):-
  duplicate(Xs,Ys),
  R=[X|Ys].
duplicate([],[]).

```

In this form the function is not tail recursive, because control returns to the caller after the recursive call duplicates the rest of the input list. Even if it were to allocate the _head_ node before duplicating the rest, it would still need to plug in the result of the recursive call into the `next` field _after_ the call.[a] So the function is _almost_ tail recursive. Warren's method pushes the responsibility of filling the `next` field into the recursive call itself, which thus becomes tail call.[b] Using sentinel head node to simplify the code,

```javascript
void duplicate_aux(const LinkedList* ls, LinkedList* end) {
    if (ls) {
        end->next = (LinkedList*)malloc(sizeof(*end));
        end->next->value = ls->value;
        duplicate_aux(ls->next, end->next);
    } else {
        end->next = NULL;
    }
}

LinkedList* duplicate(const LinkedList* ls) {  
    LinkedList head;

    duplicate_aux(ls, &head);
    return head.next;
}

```

```javascript
;; in Scheme,
(define (duplicate ls)
  (let ((head (list 1)))
    (let dup ((ls  ls)
              (end head))
      (cond
        ((not (null? ls))
         (set-cdr! end (list (car ls)))
         (dup (cdr ls) (cdr end)))))
    (cdr head)))

```

```
%% in Prolog,
duplicate([X|Xs],R):-
   R=[X|Ys],
   duplicate(Xs,Ys).
duplicate([],[]).

```

The callee now appends to the end of the growing list, rather than have the caller prepend to the beginning of the returned list. The work is now done on the way _forward_ from the list's start, _before_ the recursive call which then proceeds further, instead of _backward_ from the list's end, _after_ the recursive call has returned its result. It is thus similar to the accumulating parameter technique, turning a recursive computation into an iterative one.

Characteristically for this technique, a parent [frame](https://en.wikipedia.org/wiki/Call_frame "Call frame") is created on the execution call stack, which the tail-recursive callee can reuse as its own call frame if the tail-call optimization is present.

The tail-recursive implementation can now be converted into an explicitly iterative implementation, as an accumulating [loop](https://en.wikipedia.org/wiki/Loop_(computing)#Loops "Loop (computing)"):

```javascript
LinkedList* duplicate(const LinkedList* ls) {
    LinkedList head;
    LinkedList* end;
    end = &head;
    while (ls) {
        end->next = (LinkedList*)malloc(sizeof(*end));
        end->next->value = ls->value;
        ls = ls->next;
        end = end->next;
    }
    end->next = NULL;
    return head.next;
}

```

```javascript
 ;; in Scheme,
 (define (duplicate ls)
   (let ((head (list 1)))
     (do ((end head (cdr end))
          (ls  ls   (cdr ls )))
         ((null? ls) (cdr head))
       (set-cdr! end (list (car ls))))))

```

```
%% in Prolog,
%% N/A

```

## History

In a paper delivered to the [ACM](https://en.wikipedia.org/wiki/Association_for_Computing_Machinery "Association for Computing Machinery") conference in Seattle in 1977, [Guy L. Steele](https://en.wikipedia.org/wiki/Guy_L._Steele "Guy L. Steele") summarized the debate over the [GOTO](https://en.wikipedia.org/wiki/GOTO "GOTO") and [structured programming](https://en.wikipedia.org/wiki/Structured_programming "Structured programming"), and observed that procedure calls in the tail position of a procedure can be best treated as a direct transfer of control to the called procedure, typically eliminating unnecessary stack manipulation operations.[2] Since such "tail calls" are very common in [Lisp](https://en.wikipedia.org/wiki/Lisp_(programming_language) "Lisp (programming language)"), a language where procedure calls are ubiquitous, this form of optimization considerably reduces the cost of a procedure call compared to other implementations. Steele argued that poorly-implemented procedure calls had led to an artificial perception that the GOTO was cheap compared to the procedure call. Steele further argued that "in general procedure calls may be usefully thought of as GOTO statements which also pass parameters, and can be uniformly coded as \[machine code\] JUMP instructions", with the machine code stack manipulation instructions "considered an optimization (rather than vice versa!)".[2] Steele cited evidence that well-optimized numerical algorithms in Lisp could execute faster than code produced by then-available commercial Fortran compilers because the cost of a procedure call in Lisp was much lower. In [Scheme](https://en.wikipedia.org/wiki/Scheme_(programming_language) "Scheme (programming language)"), a Lisp dialect developed by Steele with [Gerald Jay Sussman](https://en.wikipedia.org/wiki/Gerald_Jay_Sussman "Gerald Jay Sussman"), tail-call elimination is guaranteed to be implemented in any interpreter.[11]

## Implementation methods

Tail recursion is important to some [high-level languages](https://en.wikipedia.org/wiki/High-level_programming_language "High-level programming language"), especially [functional](https://en.wikipedia.org/wiki/Functional_programming "Functional programming") and [logic](https://en.wikipedia.org/wiki/Logic_programming "Logic programming") languages and members of the [Lisp](https://en.wikipedia.org/wiki/Lisp_programming_language "Lisp programming language") family. In these languages, tail recursion is the most commonly used way (and sometimes the only way available) of implementing iteration. The language specification of Scheme requires that tail calls are to be optimized so as not to grow the stack. Tail calls can be made explicitly in [Perl](https://en.wikipedia.org/wiki/Perl "Perl"), with a variant of the "goto" statement that takes a function name: `goto &NAME;`[12]

However, for language implementations which store function arguments and local variables on a [call stack](https://en.wikipedia.org/wiki/Call_stack "Call stack") (which is the default implementation for many languages, at least on systems with a [hardware stack](https://en.wikipedia.org/wiki/Hardware_stack "Hardware stack"), such as the [x86](https://en.wikipedia.org/wiki/X86 "X86")), implementing generalized tail-call optimization (including mutual tail recursion) presents an issue: if the size of the callee's activation record is different from that of the caller, then additional cleanup or resizing of the stack frame may be required. For these cases, optimizing tail recursion remains trivial, but general tail-call optimization may be harder to implement efficiently.

For example, in the [Java virtual machine](https://en.wikipedia.org/wiki/Java_virtual_machine "Java virtual machine") (JVM), tail-recursive calls can be eliminated (as this reuses the existing call stack), but general tail calls cannot be (as this changes the call stack).[13][14] As a result, functional languages such as [Scala](https://en.wikipedia.org/wiki/Scala_(programming_language) "Scala (programming language)") that target the JVM can efficiently implement direct tail recursion, but not mutual tail recursion.

The [GCC](https://en.wikipedia.org/wiki/GNU_Compiler_Collection "GNU Compiler Collection"), [LLVM/Clang](https://en.wikipedia.org/wiki/Clang "Clang"), and [Intel](https://en.wikipedia.org/wiki/Intel_C_Compiler "Intel C Compiler") compiler suites perform tail-call optimization for [C](https://en.wikipedia.org/wiki/C_(programming_language) "C (programming language)") and other languages at higher optimization levels or when the `-foptimize-sibling-calls` option is passed.[15][16][17] Though the given language syntax may not explicitly support it, the compiler can make this optimization whenever it can determine that the return types for the caller and callee are equivalent, and that the argument types passed to both function are either the same, or require the same amount of total storage space on the call stack.[18]

Various implementation methods are available.

### In assembly

Tail calls are often optimized by [interpreters](https://en.wikipedia.org/wiki/Interpreter_(computing) "Interpreter (computing)") and [compilers](https://en.wikipedia.org/wiki/Compiler "Compiler") of [functional programming](https://en.wikipedia.org/wiki/Functional_programming "Functional programming") and [logic programming](https://en.wikipedia.org/wiki/Logic_programming "Logic programming") languages to more efficient forms of [iteration](https://en.wikipedia.org/wiki/Iteration "Iteration"). For example, [Scheme](https://en.wikipedia.org/wiki/Scheme_(programming_language) "Scheme (programming language)") programmers commonly express [while loops](https://en.wikipedia.org/wiki/While_loop "While loop") as calls to procedures in tail position and rely on the Scheme compiler or interpreter to substitute the tail calls with more efficient [jump](https://en.wikipedia.org/wiki/Jump_(computer_science) "Jump (computer science)") instructions.[19]

For compilers generating assembly directly, tail-call elimination is easy: it suffices to replace a call opcode with a jump one, after fixing parameters on the stack. From a compiler's perspective, the first example above is initially translated into pseudo-[assembly language](https://en.wikipedia.org/wiki/Assembly_language "Assembly language") (in fact, this is valid [x86 assembly](https://en.wikipedia.org/wiki/X86_assembly_language "X86 assembly language")):

```
 foo:
  call baz
  call bar
  ret

```

Tail-call elimination replaces the last two lines with a single jump instruction:

```
 foo:
  call baz
  jmp  bar

```

After subroutine `bar` completes, it will then return directly to the return address of `foo`, omitting the unnecessary `ret` statement.

Typically, the subroutines being called need to be supplied with [parameters](https://en.wikipedia.org/wiki/Parameter_(computer_science) "Parameter (computer science)"). The generated code thus needs to make sure that the [call frame](https://en.wikipedia.org/wiki/Call_frame "Call frame") for `bar` is properly set up before jumping to the tail-called subroutine. For instance, on [platforms](https://en.wikipedia.org/wiki/Computing_platform "Computing platform") where the [call stack](https://en.wikipedia.org/wiki/Call_stack "Call stack") does not just contain the [return address](https://en.wikipedia.org/wiki/Return_statement "Return statement"), but also the parameters for the subroutine, the compiler may need to emit instructions to adjust the call stack. On such a platform, for the code:

```
int foo(int a, int b) {
    baz(a);
    return bar(b);
}

```

where `a` and `b` are parameters, a compiler might translate that as:[c]

```
 foo:
   mov  reg,[sp+a]     ; fetch a from stack (sp) parameter into a scratch register.
   push reg            ; put a on stack where baz expects it
   call baz            ; baz uses a
   pop                 ; remove a from stack
   mov  reg,[sp+b] ; fetch b from stack (sp) parameter into a scratch register.
   push reg            ; put b on stack where bar expects it
   call bar            ; A uses b
   pop                 ; remove b from stack.
   ret

```

A tail-call optimizer could then change the code to:

```
 foo:
   mov  reg,[sp+a]     ; fetch data1 from stack (sp) parameter into a scratch register.
   push reg            ; put a on stack where baz expects it
   call baz            ; baz uses a
   pop                 ; remove a from stack
   mov  reg,[sp+b]     ; fetch b from stack (sp) parameter into a scratch register.
   mov  [sp+a],reg     ; put b where bar expects it
   jmp  bar            ; bar uses b and returns immediately to caller.

```

This code is more efficient both in terms of execution speed and use of stack space.

From a compiler's perspective, a pure tail call is most visible in recursive functions. Consider a pseudo-assembly example where a function calls itself as its final action to process data, taking a single parameter:

```
int foo(int x) {
    if (data == 0) {
        return data;
    }
    return foo(data - 1);
}

```

An unoptimized compiler translates this into a standard call sequence, pushing a new frame to the stack for every recursion:

```
 foo:
   mov  reg,[sp+x]    ; fetch data from stack parameter
   cmp  reg, 0        ; base case check
   je   end
   dec  reg           ; modify x
   push reg           ; push new x onto stack for next call
   call foo           ; recursive call (GROWS THE STACK)
   pop                ; clean up stack after return
 end:
   ret

```

A tail-call optimizer recognizes that the current stack frame is no longer needed after the call. It changes the code to destructively update the argument in place and jump, bounding the stack strictly to O ( 1 )   {\\displaystyle O(1)}  ![{\displaystyle O(1)}](https://wikimedia.org/api/rest_v1/media/math/render/svg/e66384bc40452c5452f33563fe0e27e803b0cc21) space:

```sql
 foo:
   mov  reg,[sp+x]    ; fetch x from stack parameter
   cmp  reg, 0        ; base case check
   je   end
   dec  reg           ; modify x
   mov  [sp+x],reg    ; destructively update the existing stack parameter
   jmp  foo           ; jump directly back to start (STACK REMAINS BOUNDED)
 end:
   ret

```

This optimized code is physically identical to an imperative `while` loop, executing with strictly bounded memory and maximal speed.

### Hardware and space complexity

In bare-metal environments and formal automata theory, a pure tail call is defined primarily by its space complexity: **a pure tail call occurs when the stack space is strictly bounded during recursion**. By guaranteeing that the stack pointer does not grow proportionally to the recursion depth, tail calls allow infinitely deep recursive evaluation to operate within strict physical memory constraints (such as a microkernel or a [boot sector](https://en.wikipedia.org/wiki/Master_boot_record "Master boot record")). This physically transforms the call stack into a bounded state machine.

### Relationship to coroutines

A tail call without recursion is physically equivalent to an assembly `JMP` instruction. This property makes the tail call a fundamental primitive for implementing high-performance [coroutines](https://en.wikipedia.org/wiki/Coroutine "Coroutine"). By replacing the traditional `CALL` and `RET` cycle with a direct jump to the next state, an execution engine can "hand off" control between different functional units in constant stack space. This mechanism is central to [continuation-passing style](https://en.wikipedia.org/wiki/Continuation-passing_style "Continuation-passing style"), where the program never returns, but instead performs a sequence of tail calls to transition between cooperative states.

### Through trampolining

Since many [Scheme](https://en.wikipedia.org/wiki/Scheme_(programming_language) "Scheme (programming language)") compilers use [C](https://en.wikipedia.org/wiki/C_(programming_language) "C (programming language)") as an intermediate target code, the tail recursion must be encoded in C without growing the stack, even if the C compiler does not optimize tail calls. Many implementations achieve this by using a device known as a [trampoline](https://en.wikipedia.org/wiki/Trampoline_(computers) "Trampoline (computers)"), a piece of code that repeatedly calls functions. All functions are entered via the trampoline. When a function has to tail-call another, instead of calling it directly and then returning the result, it returns the address of the function to be called and the call parameters back to the trampoline (from which it was called itself), and the trampoline takes care of calling this function next with the specified parameters. This ensures that the C stack does not grow and iteration can continue indefinitely.

It is possible to implement trampolines using [higher-order functions](https://en.wikipedia.org/wiki/Higher-order_function "Higher-order function") in languages that support them, such as [Groovy](https://en.wikipedia.org/wiki/Groovy_(programming_language) "Groovy (programming language)"), [Visual Basic .NET](https://en.wikipedia.org/wiki/Visual_Basic_.NET "Visual Basic .NET") and [C#](https://en.wikipedia.org/wiki/C_Sharp_(programming_language) "C Sharp (programming language)").[20]

Using a trampoline for all function calls is rather more expensive than the normal C function call, so at least one Scheme compiler, [Chicken](https://en.wikipedia.org/wiki/Chicken_(Scheme_implementation) "Chicken (Scheme implementation)"), uses a technique first described by [Henry Baker](https://en.wikipedia.org/wiki/Henry_Baker_(computer_scientist) "Henry Baker (computer scientist)") from an unpublished suggestion by [Andrew Appel](https://en.wikipedia.org/wiki/Andrew_Appel "Andrew Appel"),[21] in which normal Ccalls are used but the stack size is checked before every call. When the stack reaches its maximum permitted size, objects on the stack are [garbage-collected](https://en.wikipedia.org/wiki/Garbage_collection_(computer_science) "Garbage collection (computer science)") using the [Cheney algorithm](https://en.wikipedia.org/wiki/Cheney_algorithm "Cheney algorithm") by moving all live data into a separate heap. Following this, the stack is unwound ("popped") and the program resumes from the state saved just before the garbage collection. Baker says "Appel's method avoids making a large number of small trampoline bounces by occasionally jumping off the Empire State Building."[21] The garbage collection ensures that mutual tail recursion can continue indefinitely. However, this approach requires that no C function call ever returns, since there is no guarantee that its caller's stack frame still exists; therefore, it involves a much more dramatic internal rewriting of the program code: [continuation-passing style](https://en.wikipedia.org/wiki/Continuation-passing_style "Continuation-passing style").

## Relation to the `while` statement

Tail recursion can be related to the [.mw-parser-output .monospaced{font-family:monospace,monospace}while statement](https://en.wikipedia.org/wiki/While_loop "While loop"), an explicit iteration, for instance by transforming

```
procedure foo(x)
    if p(x)
        return bar(x)
    else
        return foo(baz(x))
```

into

```
procedure foo(x)
    while true
        if p(x)
            return bar(x)
        else
            x ← baz(x)
```

where _x_ may be a tuple involving more than one variable: if so, care must be taken in implementing the [assignment statement](https://en.wikipedia.org/wiki/Assignment_(computer_science) "Assignment (computer science)") _x_ ← baz(_x_) so that dependencies are respected. One may need to introduce auxiliary variables or use a _[swap](https://en.wikipedia.org/wiki/Swap_(computer_science) "Swap (computer science)")_ construct.

More generally,

```
procedure foo(x)
    if p(x)
        return bar(x)
    else if q(x)
        return baz(x)
    ...
    else if r(x)
        return foo(qux(x))
    ...
    else
        return foo(quux(x))
```

can be transformed into

```
procedure foo(x)
    while true
        if p(x)
            return bar(x)
        else if q(x)
            return baz(x)
        ...
        else if r(x)
            x ← qux(x)
        ...
        else
            x ← quux(x)
```

For instance, this [Julia](https://en.wikipedia.org/wiki/Julia_(programming_language) "Julia (programming language)") program gives a non-tail recursive definition `factorial` of the factorial:

```javascript
function factorial(n::Integer)::Integer
    if n == 0
        return 1
    else
        return n * factorial(n - 1)
    end
end

```

Indeed, `n * factorial(n - 1)` wraps the call to `factorial`. But it can be transformed into a tail-recursive definition by adding an argument `a` called an _accumulator_.[8]

This Julia program gives a tail-recursive definition `factorial` of the factorial:

```javascript
function factorial(n::Integer, a::Integer)::Integer
    if n == 0:
        return a
    else
        return factorial(n - 1, n * a)
    end
end

function factorial(n::Integer)::Integer
    return factorial(n, 1)
end

```

This Julia program gives an iterative definition `fact_iter` of the factorial:

```javascript
function fact_iter(n::Integer, a::Integer)::Integer
    while n > 0
        a = n * a
        n = n - 1
    end
    return a
end

function factorial(n::Integer)::Integer
    return fact_iter(n, one(n))
end

```

## Language support

- [Clojure](https://en.wikipedia.org/wiki/Clojure_(programming_language) "Clojure (programming language)") – Clojure has `recur` special form.[22]
- [Common Lisp](https://en.wikipedia.org/wiki/Common_Lisp "Common Lisp") – Some implementations perform tail-call optimization during compilation if optimizing for speed
- [Elixir](https://en.wikipedia.org/wiki/Elixir_(programming_language) "Elixir (programming language)") – Elixir implements tail-call optimization,[23] as do all languages currently targeting the BEAM VM.
- [Elm](https://en.wikipedia.org/wiki/Elm_(programming_language) "Elm (programming language)") – Yes[24]
- [Erlang](https://en.wikipedia.org/wiki/Erlang_(programming_language) "Erlang (programming language)") – Yes
- [F#](https://en.wikipedia.org/wiki/F_Sharp_(programming_language) "F Sharp (programming language)") – F# implements TCO by default where possible[25]
- [Go](https://en.wikipedia.org/wiki/Go_(programming_language) "Go (programming language)") – No support[26]
- [Haskell](https://en.wikipedia.org/wiki/Haskell_(programming_language) "Haskell (programming language)") – Yes[27]
- [JavaScript](https://en.wikipedia.org/wiki/JavaScript "JavaScript") – [ECMAScript](https://en.wikipedia.org/wiki/ECMAScript "ECMAScript") 6.0 compliant engines should have tail calls[28] which is now implemented on [Safari](https://en.wikipedia.org/wiki/Safari_(browser) "Safari (browser)")/[WebKit](https://en.wikipedia.org/wiki/WebKit "WebKit")[29] but rejected by V8 and SpiderMonkey
- [Kotlin](https://en.wikipedia.org/wiki/Kotlin_(programming_language) "Kotlin (programming language)") – Has `tailrec` modifier for functions[30]
- [Lua](https://en.wikipedia.org/wiki/Lua_(programming_language) "Lua (programming language)") – Tail recursion is required by the language definition[31]
- [Objective-C](https://en.wikipedia.org/wiki/Objective-C "Objective-C") – Compiler optimizes tail calls when -O1 (or higher) option specified, but it is easily disturbed by calls added by [Automatic Reference Counting](https://en.wikipedia.org/wiki/Automatic_Reference_Counting "Automatic Reference Counting").
- [OCaml](https://en.wikipedia.org/wiki/OCaml "OCaml") – Yes. Since version 4.03.0,[32] the built-in `tailcall` attribute can be used to verify that a call will be optimized, emitting a warning otherwise.[33]
- [Perl](https://en.wikipedia.org/wiki/Perl_(programming_language) "Perl (programming language)") – Explicit with a variant of the "goto" statement that takes a function name: `goto &NAME;`[34]
- [Prolog](https://en.wikipedia.org/wiki/Prolog "Prolog") – [SWI-Prolog](https://en.wikipedia.org/wiki/SWI-Prolog "SWI-Prolog") implements tail-recursion optimization.[35]
- [PureScript](https://en.wikipedia.org/wiki/PureScript "PureScript") – Yes
- [Python](https://en.wikipedia.org/wiki/Python_(programming_language) "Python (programming language)") – Stock Python implementations do not perform tail-call optimization, though a third-party module is available to do this.[36] Language inventor [Guido van Rossum](https://en.wikipedia.org/wiki/Guido_van_Rossum "Guido van Rossum") contended that [stack traces](https://en.wikipedia.org/wiki/Stack_traces "Stack traces") are altered by tail-call elimination making debugging harder, and preferred that programmers use explicit [iteration](https://en.wikipedia.org/wiki/Iteration "Iteration") instead.[37] In Python 3.14, a new interpreter was introduced that uses tail-call based dispatch of Python opcodes.[38] This resulted in overall improved performance when compared to Python 3.13.[39][40]
- [R](https://en.wikipedia.org/wiki/R_(programming_language) "R (programming language)") – Yes, `tailcall()` function introduced in R.4.4.0[41]
- [Racket](https://en.wikipedia.org/wiki/Racket_(programming_language) "Racket (programming language)") – Yes[42]
- [Ruby](https://en.wikipedia.org/wiki/Ruby_(programming_language) "Ruby (programming language)") – Yes, but disabled by default [43]
- [Rust](https://en.wikipedia.org/wiki/Rust_(programming_language) "Rust (programming language)") – tail-call optimization may be done in limited circumstances, but is not guaranteed[44]
- [Scala](https://en.wikipedia.org/wiki/Scala_(programming_language) "Scala (programming language)") – Tail-recursive functions are automatically optimized by the compiler. Such functions can also optionally be marked with a `@tailrec` annotation, which makes it a compilation error if the function is not tail recursive[45]
- [Scheme](https://en.wikipedia.org/wiki/Scheme_(programming_language) "Scheme (programming language)") – Required by the language definition[46][47]
- [Swift](https://en.wikipedia.org/wiki/Swift_(programming_language) "Swift (programming language)") – In some cases.[48]
- [Tcl](https://en.wikipedia.org/wiki/Tcl_(programming_language) "Tcl (programming language)") – Since Tcl 8.6, Tcl has a `tailcall` command[49]
- [Zig](https://en.wikipedia.org/wiki/Zig_(programming_language) "Zig (programming language)") – Yes[50]

## See also

- [Course-of-values recursion](https://en.wikipedia.org/wiki/Course-of-values_recursion "Course-of-values recursion")
- [Recursion (computer science)](https://en.wikipedia.org/wiki/Recursion_(computer_science) "Recursion (computer science)")
- [Primitive recursive function](https://en.wikipedia.org/wiki/Primitive_recursive_function "Primitive recursive function")
- [Inline expansion](https://en.wikipedia.org/wiki/Inline_expansion "Inline expansion")
- [Leaf subroutine](https://en.wikipedia.org/wiki/Leaf_subroutine "Leaf subroutine")
- [Corecursion](https://en.wikipedia.org/wiki/Corecursion "Corecursion")

## Notes

## References

1. Like this: if (ls) { head = (LinkedList\*)malloc(sizeof(\*head)); head->value = ls->value; head->next = duplicate(ls->next); }
2. Like this: if (ls) { head = (LinkedList\*)malloc(sizeof(\*head)); head->value = ls->value; duplicate(ls->next, &(head->next)); }
3. The call instruction first pushes the current code location onto the stack and then performs an unconditional jump to the code location indicated by the label. The ret instruction first pops a code location off the stack, then performs an unconditional jump to the retrieved code location.
4. .mw-parser-output cite.citation{font-style:inherit;word-wrap:break-word}.mw-parser-output .citation q{quotes:"\\"""\\"""'""'"}.mw-parser-output .citation:target{background-color:rgba(0,127,255,0.133)}.mw-parser-output .id-lock-free.id-lock-free a{background:url("//upload.wikimedia.org/wikipedia/commons/6/65/Lock-green.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-limited.id-lock-limited a,.mw-parser-output .id-lock-registration.id-lock-registration a{background:url("//upload.wikimedia.org/wikipedia/commons/d/d6/Lock-gray-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-subscription.id-lock-subscription a{background:url("//upload.wikimedia.org/wikipedia/commons/a/aa/Lock-red-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .cs1-ws-icon a{background:url("//upload.wikimedia.org/wikipedia/commons/4/4c/Wikisource-logo.svg")right 0.1em center/12px no-repeat}body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-free a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-limited a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-registration a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-subscription a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .cs1-ws-icon a{background-size:contain;padding:0 1em 0 0}.mw-parser-output .cs1-code{color:inherit;background:inherit;border:none;padding:inherit}.mw-parser-output .cs1-hidden-error{display:none;color:var(--color-error,#bf3c2c)}.mw-parser-output .cs1-visible-error{color:var(--color-error,#bf3c2c)}.mw-parser-output .cs1-maint{display:none;color:#085;margin-left:0.3em}.mw-parser-output .cs1-kern-left{padding-left:0.2em}.mw-parser-output .cs1-kern-right{padding-right:0.2em}.mw-parser-output .citation .mw-selflink{font-weight:inherit}@media screen{.mw-parser-output .cs1-format{font-size:95%}html.skin-theme-clientpref-night .mw-parser-output .cs1-maint{color:#18911f}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .cs1-maint{color:#18911f}}Steven Muchnick; Muchnick and Associates (15 August 1997). Advanced Compiler Design Implementation. Morgan Kaufmann. ISBN 978-1-55860-320-2.
5. Steele, Guy Lewis (1977). "Debunking the "expensive procedure call" myth or, procedure call implementations considered harmful or, LAMBDA: The Ultimate GOTO". Proceedings of the 1977 annual conference on - ACM '77. pp. 153–162. doi:10.1145/800179.810196. hdl:1721.1/5753. ISBN 978-1-4503-2308-6. S2CID 9807843.
6. "Sibling call optimization". The LLVM Target-Independent Code Generator. LLVM Project.
7. "Stack memory usage for tail calls". Theoretical Computer Science. Stack Exchange. 2011-07-29. Retrieved 2013-03-21.
8. "5.11. Proper tail recursion". Revised \[6\] Report on the Algorithmic Language Scheme. Retrieved 2013-03-21.
9. "5.3. Proper tail recursion". Revised \[6\] Report on the Algorithmic Language Scheme. Retrieved 2013-03-21.
10. "11.20. Tail calls and tail contexts". Revised \[6\] Report on the Algorithmic Language Scheme. Retrieved 2013-03-21.
11. Sussman, G. J.; Abelson, Hal (1984). Structure and Interpretation of Computer Programs. Cambridge, MA: MIT Press. ISBN 0-262-01077-1.
12. D. H. D. Warren, DAI Research Report 141, University of Edinburgh, 1980.
13. Daniel P. Friedman and David S. Wise, Technical Report TR19: Unwinding Structured Recursions into Iterations, Indiana University, Dec. 1974. PDF available here (webarchived copy here).
14. R5RS Sec. 3.5, Richard Kelsey; William Clinger; Jonathan Rees; et al. (August 1998). "Revised5 Report on the Algorithmic Language Scheme". Higher-Order and Symbolic Computation. 11 (1): 7–105. doi:10.1023/A:1010051815785. S2CID 14069423.
15. Contact details. "goto". perldoc.perl.org. Retrieved 2013-03-21.
16. "What is difference between tail calls and tail recursion?", Stack Overflow
17. "What limitations does the JVM impose on tail-call optimization", Programmers Stack Exchange
18. Lattner, Chris. "LLVM Language Reference Manual, section: The LLVM Target-Independent Code Generator, sub: Tail Call Optimization". The LLVM Compiler Infrastructure. The LLVM Project. Retrieved 24 June 2018.
19. "Using the GNU Compiler Collection (GCC): Optimize Options". gcc.gnu.org.
20. "foptimize-sibling-calls". software.intel.com.
21. "Tackling C++ Tail Calls".
22. Probst, Mark (20 July 2000). "proper tail recursion for gcc". GCC Project. Retrieved 10 March 2015.
23. Samuel Jack, Bouncing on your tail. Functional Fun. April 9, 2008.
24. Henry Baker, "CONS Should Not CONS Its Arguments, Part II: Cheney on the M.T.A." Archived 2006-03-03 at the Wayback Machine
25. "(recur expr\*)". clojure.org.
26. "Recursion". elixir-lang.github.com.
27. Czaplicki, Evan. "Functional Programming in Elm: Tail-Call Elimination".
28. "Tail Calls in F#". msdn. Microsoft. 8 July 2011.
29. "proposal: Go 2: add become statement to support tail calls". github.com.
30. "Tail recursion - HaskellWiki". wiki.haskell.org. Retrieved 2019-06-08.
31. Beres-Deak, Adam. "Worth watching: Douglas Crockford speaking about the good new parts of JavaScript in 2014". bdadam.com.
32. "ECMAScript 6 in WebKit". 13 October 2015.
33. "Functions: infix, vararg, tailrec - Kotlin Programming Language". Kotlin.
34. "Lua 5.3 Reference Manual". www.lua.org.
35. "OCaml 4.03.0 Release Notes". OCaml. Retrieved 2026-04-05.
36. "Language extensions". ocaml.org. Retrieved 2026-04-05.
37. "goto - perldoc.perl.org". perldoc.perl.org.
38. "SWI-Prolog Reference Manual". www.lix.polytechnique.fr.
39. "baruchel/tco". GitHub. 29 March 2022.
40. Rossum, Guido Van (22 April 2009). "Neopythonic: Tail Recursion Elimination".
41. "Tail-calling interpreter". GitHub. 2024-01-08. Retrieved 2025-03-08.
42. "What's new in Python 3.14". Python documentation. Retrieved 2025-02-19.
43. "A new tail-calling interpreter for significantly better interpreter performance". GitHub. 2025-01-06. Retrieved 2025-03-08.
44. "What's new in R 4.4.0?". www.jumpingrivers.com. 2024-04-25. Retrieved 2024-04-28.
45. "The Racket Reference". docs.racket-lang.org.
46. "Ruby Tail Call Optimisation".
47. "Rust FAQ". prev.rust-lang.org.
48. "Scala Standard Library 2.13.0 - scala.annotation.tailrec". www.scala-lang.org. Retrieved 2019-06-20.
49. "Revised^5 Report on the Algorithmic Language Scheme". www.schemers.org.
50. "Revised \[6\] Report on the Algorithmic Language Scheme". www.r6rs.org.
51. "Does Swift implement tail call optimization?". 2014. Retrieved 13 March 2024.
52. "tailcall manual page - Tcl Built-In Commands". www.tcl.tk.
53. "Documentation - the Zig Programming Language".
