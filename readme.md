# Overview
This compiler compile Javascript source file to Fuzzil intermediate language, encoded in a protobuf. This allows Fuzzil to start execution from a large initial corpus.\
The aim is to produce correct and shortest Fuzzil IR.\
I test the compiler on test262 corpus and about 80% pass the test:
- compile to Fuzzil IR
- lift to Javascript
- test the lifted JS


# Build
npm install

# Run
node main.js input.js output.fuzzil.protobuf

# Effort
Fuzzil have several properties that differs from javascript. which should be carefully handled by compiler:
1. Fuzzil only have let/const variable, do not have var variable and global variable
2. Fuzzil demand variable defined before it is used.
3. One javascript statement may be compiled to several Fuzzil instruction.
  ```b=a+(++a)``` should be compiled to 
  ```
    v0 <- Dup a
    v1 <- UnaryOperation '++' a
    b <- BinaryOperation '+' v0, v1
  ```
  The Dup operation is needed here.\
  We have to compile to shorter Fuzzil, which means we can not generate Dup everywhere. We need a extra pass to track where the Dup is actually needed.
4. Compiler should compile to shorter Fuzzil, which is better for further mutation.\
  Every hoist generate some additional Fuzzil Instruction. This means we only hoist necessary variables/functions.\
  We can do a use analysis pass to track if there is out-of-scope usage, then only hoist the variable that need hoist. Such as:
  ```
  {
    x=2
    {
      var x=10;
      var y;
      x=0;
    }
  }
  ```
  We do not need to hoist x, but have to hoist y.

  We can sort the function declaration, to minimum the function that need hoisted. Such as:
  ```
  function a(){b()}
  function b(){c()}
  function c(){d()}
  function d(){a()}
  ```
  In Fuzzil, variable must be defined before use. In the original order of the four functions, b/c/d need to be declared as undefined in the top of the scope. If we sort the functions properly, only one function need to be declared as undefined. 