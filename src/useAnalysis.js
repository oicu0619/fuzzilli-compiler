exports.useAnalysis=useAnalysis;

/**
 * @param {Node} program
 * @return {undefined}
 * Main purpose of this pass is to track use for var variable and functions.
 * We also do the same thing for let variable now, because currently there is
 * no better way to compile def-before-use let var to FuzzIL.
 * Things we track:
 * 1. out of scope use of var
 *
 * {
 * var x=1;
 * }
 * x=10;
 *
 * 2. use before def of var
 *
 * {
 * x=10
 * var x=1
 * }
 *
 * 3. use before def of function
 *
 * a;
 * {
 * function a(){}
 * }
 *
 * 4. out of scope use of function
 * {
 * function a(){}
 * }
 * a
 * var will be compile to let in Fuzzil,so we need track both out of scope use
 * and use before def.
 * For functions, we need to track use before def(because Fuzzil demand def
 * before use.), and also out of scope use(4). Although in javascript, 4 is
 * valid, but in Fuzzil(see Sources/Fuzzilli/FuzzIL/Code.swift), that will get
 * a "variable is not visible anymore" Error.
 *
 * In the hoist pass, function have been hoisted to the top of let scope. So
 * there might be two kinds of use before def: same let scope and out of let
 * scope. For same let scope use before def(mutual recursion), we will handle
 * it in FuncDeclSort pass. we will track out of scope use in this pass.
 *
 * same let scope use before def:
 *
 * {
 *    function a(){b()};
 *    function b(){a()};
 * }
 *
 * out of let scope use
 *
 * console.log(a);
 * {
 * function a(){}
 * }
 */
function useAnalysis(program) {
  const symtab=[];
  initSymtabDeclaredVars(symtab, program);
  // we only track out of let scope use before def. Mark every function inside
  // let scope as inScope so that we don't track same let scope use before def.
  for ([func, blank] of program.funcInBlock) {
    setSymtab(symtab, func, 'declared', 'inScope');
  }
  for (let i=0; i<program.body.length; i++) {
    processStmt(program.body[i], symtab, program);
  }
  for ([func, blank] of program.funcInBlock) {
    setSymtab(symtab, func, 'declared', 'outScope');
  }
  cleanSymtabDeclaredVars(symtab, program);
  return;
}

/**
 * @param {Node} stmt
 * @param {Map[]} symtab
 * @param {Node} letScope
 * @return {undefined}
 */
function processStmt(stmt, symtab, letScope) {
  switch (stmt.type) {
    case 'VariableDeclaration':
      for (let i=0; i<stmt.declarations.length; i++) {
        // be careful about the sequence of process:
        // var a = {x: function() {a=1}}
        // should process init first, then lhs
        // process sequence should identical to Fuzzil IR
        if (stmt.declarations[i].init!==null) {
          processExpression(stmt.declarations[i].init, symtab);
        }
        processPattern(stmt.declarations[i].id, symtab, letScope, true);
      }
      break;
    case 'BlockStatement':
      if (stmt.declaredVars===undefined) {
        initSymtabDeclaredVars(symtab, stmt);
        // we only track out of let scope use before def. Mark every function
        // inside let scope as inScope so that we don't track same let scope
        // use before def.
        for (const [func] of stmt.funcInBlock) {
          setSymtab(symtab, func, 'declared', 'inScope');
        }
        for (let i=0; i<stmt.body.length; i++) {
          processStmt(stmt.body[i], symtab, stmt);
        }
        for (const [func] of stmt.funcInBlock) {
          setSymtab(symtab, func, 'declared', 'outScope');
        }
        cleanSymtabDeclaredVars(symtab, stmt);
        break;
      } else {
        // called from function declaration, father node have already init
        // symtab and processed the arguments;
        for (const [func] of stmt.funcInBlock) {
          setSymtab(symtab, func, 'declared', 'inScope');
        }
        for (let i=0; i<stmt.body.length; i++) {
          processStmt(stmt.body[i], symtab, stmt);
        }
        break;
      }
    case 'FunctionDeclaration':
      // func declaration has to be handled in blockStatment.
      // duplicated function declaration means use not def
      // {
      // function a() { }
      // function a() { 1; }
      // }
      // but FunctionDeclaration use may never cause
      // out of scope use before def.
      initSymtabDeclaredVars(symtab, stmt.body);
      for (let i=0; i<stmt.params.length; i++) {
        processPattern(stmt.params[i], symtab, stmt.body, true);
      }
      processStmt(stmt.body, symtab, stmt.body);
      cleanSymtabDeclaredVars(symtab, stmt.body);
      break;
    case 'EmptyStatement':
      break;
    case 'ExpressionStatement':
      processExpression(stmt.expression, symtab);
      break;
    case 'ReturnStatement':
      if (stmt.argument!==null) {
        processExpression(stmt.argument, symtab);
      }
      break;
    case 'DebuggerStatement':
      break;
    case 'WithStatement':
      exitProgram(stmt.type);
      break;
    case 'LabeledStatement':
      processStmt(stmt.body, symtab, letScope);
      break;
    case 'BreakStatement':
      break;
    case 'ContinueStatement':
      break;
    case 'IfStatement':
      processExpression(stmt.test, symtab);
      processStmt(stmt.consequent, symtab, letScope);
      if (stmt.alternate!==null) {
        processStmt(stmt.alternate, symtab, letScope);
      }
      break;
    case 'SwitchStatement':
      processExpression(stmt.discriminant, symtab);
      for (let i=0; i<stmt.cases.length; i++) {
        if (stmt.cases[i].test!==null) {
          processExpression(stmt.cases[i].test, symtab);
        }
        for (let j=0; j<stmt.cases[i].consequent.length; j++) {
          processStmt(stmt.cases[i].consequent[j], symtab, letScope);
        }
      }
      break;
    case 'ThrowStatement':
      processExpression(stmt.argument, symtab);
      break;
    case 'TryStatement':
      processStmt(stmt.block, symtab, stmt.block);
      if (stmt.handler!==null) {
        initSymtabDeclaredVars(symtab, stmt.handler.body);
        if (stmt.handler.param!==null) {
          processPattern(stmt.handler.param, symtab, stmt.handler.body, true);
        }
        processStmt(stmt.handler.body, symtab, stmt.handler.body);
        cleanSymtabDeclaredVars(symtab, stmt.handler.body);
      }
      if (stmt.finalizer!==null) {
        processStmt(stmt.finalizer, symtab, letScope);
      }
      return;
    case 'WhileStatement':
      processExpression(stmt.test, symtab);
      processStmt(stmt.body, symtab, letScope);
      return;
    case 'DoWhileStatement':
      processStmt(stmt.body, symtab, letScope);
      processExpression(stmt.test, symtab);
      return;
    case 'ForStatement':
      // forstatment declaration is a seperate lex scope
      // only let loopvar will be on this Scope.
      // they do not have chance to outScope access
      initSymtabDeclaredVars(symtab, stmt);
      if (stmt.init===null) {
      } else if (stmt.init.type=='VariableDeclaration') {
        processStmt(stmt.init, symtab, stmt);
      } else {
        processExpression(stmt.init, symtab);
      }
      if (stmt.test!==null) {
        processExpression(stmt.test, symtab);
      }
      if (stmt.update!==null) {
        processExpression(stmt.update, symtab);
      }
      processStmt(stmt.body, symtab, stmt);
      cleanSymtabDeclaredVars(symtab, stmt);
      break;
    case 'ForInStatement':
    case 'ForOfStatement':
      initSymtabDeclaredVars(symtab, stmt);
      if (stmt.left.type=='VariableDeclaration') {
        processStmt(stmt.left, symtab, stmt);
      } else {
        processPattern(stmt.left, symtab, null, false);
      }
      processExpression(stmt.right, symtab);
      processStmt(stmt.body, symtab, stmt);
      cleanSymtabDeclaredVars(symtab, stmt);
      break;
    case 'ClassDeclaration':
      processPattern(stmt.id, symtab, letScope, true);
      if (stmt.superClass!==null) {
        processExpression(stmt.superClass, symtab);
      }
      processClassBody(stmt.body, symtab);
      break;
    case 'ImportDeclaration':
    case 'ExportNamedDeclaration':
    case 'ExportDefaultDeclaration':
    case 'ExportAllDeclaration':
      exitProgram(stmt.type);
    default:
      throw new Error();
  }
  return;
}

/**
 * @param {Node} expression
 * @param {Map[]} symtab
 * @return {undefined}
 */
function processExpression(expression, symtab) {
  switch (expression.type) {
    case 'Identifier':
      processPattern(expression, symtab, null, false);
      break;
    case 'Literal':
      break;
    case 'ThisExpression':
      break;
    case 'ArrayExpression':
      for (let i=0; i<expression.elements.length; i++) {
        if (expression.elements[i]===null) {
          continue;
        } else if (expression.elements[i].type=='SpreadElement') {
          processExpression(expression.elements[i].argument, symtab);
        } else {
          processExpression(expression.elements[i], symtab);
        }
      }
      break;
    case 'ObjectExpression':
      for (let i=0; i<expression.properties.length; i++) {
        if (expression.properties[i].type=='Property') {
          processExpression(expression.properties[i].key, symtab);
          processExpression(expression.properties[i].value, symtab);
        } else {
          processExpression(expression.properties[i].argument, symtab);
        }
      }
      break;
    case 'FunctionExpression':
      initSymtabDeclaredVars(symtab, expression);
      if (expression.id!==null) {
        setSymtab(symtab, expression.id, 'declared', 'inScope');
      }
      initSymtabDeclaredVars(symtab, expression.body);
      for (let i=0; i<expression.params.length; i++) {
        processPattern(expression.params[i], symtab, expression.body, true);
      }
      processStmt(expression.body, symtab, expression.body);
      cleanSymtabDeclaredVars(symtab, expression.body);
      cleanSymtabDeclaredVars(symtab, expression);
      break;
    case 'ArrowFunctionExpression':
    // arrow function may have varsOnscope
    // (a)=>return a;
      if (expression.expression===false) {
        initSymtabDeclaredVars(symtab, expression.body);
        for (let i=0; i<expression.params.length; i++) {
          processPattern(expression.params[i], symtab);
        }
        processStmt(expression.body, symtab, expression.body);
        cleanSymtabDeclaredVars(symtab, expression.body);
      } else {
        initSymtabDeclaredVars(symtab, expression);
        for (let i=0; i<expression.params.length; i++) {
          processPattern(expression.params[i], symtab, expression, true);
        }
        processExpression(expression.body, symtab);
        cleanSymtabDeclaredVars(symtab, expression);
      }
      break;
    case 'TaggedTemplateExpression':
      processExpression(expression.tag, symtab);
      for (let i=0; i<expression.quasi.expressions.length; i++) {
        processExpression(expression.quasi.expressions[i], symtab);
      }
      break;
    case 'TemplateLiteral':
      for (let i=0; i<expression.expressions.length; i++) {
        processExpression(expression.expressions[i], symtab);
      }
      break;
    case 'ChainExpression':
      processExpression(expression.expression, symtab);
      break;
    case 'ImportExpression':
      exitProgram(expression.type);
      break;
    case 'UnaryExpression':
      processExpression(expression.argument, symtab);
      break;
    case 'BinaryExpression':
      processExpression(expression.left, symtab);
      processExpression(expression.right, symtab);
      break;
    case 'AssignmentExpression':
      processPattern(expression.left, symtab, null, false);
      processExpression(expression.right, symtab);
      break;
    case 'LogicalExpression':
      processExpression(expression.left, symtab);
      processExpression(expression.right, symtab);
      break;
    case 'MemberExpression':
      if (expression.object.type!='Super') {
        processExpression(expression.object, symtab);
      }
      if (expression.computed==true) {
        processExpression(expression.property, symtab);
      }
      break;
    case 'ConditionalExpression':
      processExpression(expression.test, symtab);
      processExpression(expression.alternate, symtab);
      processExpression(expression.consequent, symtab);
      break;
    case 'CallExpression':
      if (expression.callee.type!='Super') {
        processExpression(expression.callee, symtab);
      }
      for (let i=0; i<expression.arguments.length; i++) {
        if (expression.arguments[i].type=='SpreadExpression') {
          processExpression(expression.arguments[i].argument, symtab);
        } else {
          processExpression(expression.arguments[i], symtab);
        }
      }
      break;
    case 'NewExpression':
      processExpression(expression.callee, symtab);
      for (let i=0; i<expression.arguments.length; i++) {
        if (expression.arguments[i].type=='SpreadExpression') {
          processExpression(expression.arguments[i].argument, symtab);
        } else {
          processExpression(expression.arguments[i], symtab);
        }
      }
      break;
    case 'SequenceExpression':
      for (let i=0; i<expression.expressions.length; i++) {
        processExpression(expression.expressions[i], symtab);
      }
      break;
    case 'YieldExpression':
      if (expression.argument!==null) {
        processExpression(expression.argument, symtab);
      }
      break;
    case 'AwaitExpression':
      processExpression(expression.argument, symtab);
      break;
    case 'MetaProperty':
      break;
    case 'UpdateExpression':
      processExpression(expression.argument, symtab);
      break;
    case 'SpreadElement':
      processExpression(expression.argument, symtab);
      break;
    case 'ClassExpression':
      initSymtabDeclaredVars(symtab, expression);
      if (expression.id!==null) {
        processPattern(expression.id, symtab, expression, true);
      }
      if (expression.superClass!==null) {
        processExpression(expression.superClass, symtab);
      }
      processClassBody(expression.body, symtab);
      cleanSymtabDeclaredVars(symtab, expression);
      break;
    default:
      throw new Error();
  }
  return;
}

/**
 * @param {Node[]} classbody
 * @param {Map[]} symtab
 * @param {Node}letScope
 * @return {undefined}
 */
function processClassBody(classbody, symtab) {
  for (let i=0; i<classbody.length; i++) {
    if (classbody[i].type=='MethodDefinition') {
      if (classbody[i].key.type!='PrivateIdentifier') {
        exitProgram('class private identifer');
      }
      processExpression(classbody[i].key, symtab);
      processExpression(classbody[i].value, symtab);
    } else {
      exitProgram('Class Property definition');
    }
  }
}

/**
 * @param {Node} pattern
 * @param {Map[]} symtab
 * @param {Node} letScope
 * @param {Boolean} declare
 * @return {undefined}
 * declare=true means declare; false means use
 * if declare false, then letScope is meaningless
 */
function processPattern(pattern, symtab, letScope, declare) {
  switch (pattern.type) {
    case 'Identifier':
      if (!inSymtab(symtab, pattern.name)) {
        break;
      }
      switch (getSymtab(symtab, pattern.name, 'declared')) {
        case undefined:
          if (declare===true) {
            setSymtab(symtab, pattern.name, 'declared', 'inScope');
            letScope.declaredVars.push(pattern.name);
          } else {
            setLoadUndefined(symtab, pattern.name);
          }
          break;
        case 'inScope':
          break;
        case 'outScope':
          setLoadUndefined(symtab, pattern.name);
          break;
        default:
          throw new Error();
      }
      break;
    case 'MemberExpression':
      if (pattern.object.type!='Super') {
        processExpression(pattern.object, symtab);
      }
      if (pattern.computed==true) {
        processExpression(pattern.property, symtab);
      }
      break;
    case 'ObjectPattern':
      for (let i=0; i<pattern.properties.length; i++) {
        switch (pattern.properties[i].type) {
          case 'Property':
            processExpression(pattern.properties[i].key, symtab);
            processPattern(pattern.properties[i].value,
                symtab, letScope, declare);
            break;
          case 'RestElement':
            processPattern(pattern.properties[i].argument,
                symtab, letScope, declare);
            break;
          default:
            throw new Error();
        }
      }
      break;
    case 'ArrayPattern':
      for (let i=0; i<pattern.elements.length; i++) {
        if (pattern.elements[i]===null) continue;
        processPattern(pattern.elements[i], symtab, letScope, declare);
      }
      break;
    case 'RestElement':
      processPattern(pattern.argument, symtab, letScope, declare);
      break;
    case 'AssignmentPattern':
      processPattern(pattern.left, symtab, letScope, declare);
      processExpression(pattern.right, symtab);
      break;
    default:
      throw new Error();
  }
  return;
}

/**
 * @param {Map[]} symtab
 * @param {Node} scope
 * @return {undefined}
 */
function initSymtabDeclaredVars(symtab, scope) {
  symtab.push(scope.varsOnScope);
  scope.declaredVars=[];
}

/**
 * @param {Map[]} symtab
 * @param {Node} scope
 * @return {undefined}
 */
function cleanSymtabDeclaredVars(symtab, scope) {
  for (const variable of scope.declaredVars) {
    setSymtab(symtab, variable, 'declared', 'outScope');
  }
  symtab.pop();
  delete scope.declaredVars;
}

/**
 * @param {Node} symtab
 * @param {string} variable
 * @param {String} key
 * @param {String} value
 * @return {undefined}
 */
function setSymtab(symtab, variable, key, value) {
  for (let i=symtab.length-1; i>=0; i--) {
    if (symtab[i].has(variable)) {
      symtab[i].get(variable).set(key, value);
      break;
    }
  }
}

/**
 * @param {Node} symtab
 * @param {string} variable
 * @param {string} key
 * @return {String|Map}
 */
function getSymtab(symtab, variable, key) {
  for (let i=symtab.length-1; i>=0; i--) {
    if (symtab[i].has(variable)) {
      if (key==undefined) {
        return symtab[i].get(variable);
      } else {
        return symtab[i].get(variable).get(key);
      }
    }
  }
}

/**
 * @param {Node} symtab
 * @param {string} variable
 * @return {Boolean}
 */
function inSymtab(symtab, variable) {
  for (let i=symtab.length-1; i>=0; i--) {
    if (symtab[i].has(variable)) {
      return true;
    }
  }
  return false;
}


/**
 * @param {Node} symtab
 * @param {string} variable
 * @return {undefined}
 */
function setLoadUndefined(symtab, variable) {
  const type=getSymtab(symtab, variable, 'type');
  if (type=='var'||type=='const'||type=='let'||type=='func'||type=='class') {
    setSymtab(symtab, variable, 'loadUndefined', '');
  }
  if (type=='func') {
    // if hoisted to var scope, then no need to participate the func sort pass
    getSymtab(symtab, variable, 'declaredIn').delete(variable);
  }
}
/**
 * @param {string} type
 * @return {undefined}
 */
function exitProgram(type) {
  console.log('Not Supported: '+type);
  process.exit(139);
}
