exports.funcDeclSort=funcDeclSort;

/**
 * @param {Node} program
 * @return {undefined}
 * Main purpose of this pass is to sort the function declaration in the same let
 * scope to generate minimum loadUndefined. FuzzIL demand declare before use. We
 * put callee before caller. Generally when there is a cycle in call graph we
 * put one loadUndefined to solve that:
 *
 * function a(){b()};
 * function b(){a()};
 *
 * becomes
 * b=undefined;
 * function a(){b()};
 * function tmp(){a()};
 * b=tmp;
 *
 * So will collect call graph information then do a DFS on the call graph to
 * find cycles.
 * if a function have out-of-scope use before def it must be hoisted, So there
 * is no need for it to participate the sort.
 *
 * callStack is array of [scope(funcInBlock), funcName]. It tracks what function
 * i am currently in, lexically.
 */
function funcDeclSort(program) {
  const symtab=[];
  const callStack=[];
  symtab.push(program.varsOnScope);
  for (let i=0; i<program.body.length; i++) {
    processStmt(program.body[i], symtab, callStack);
  }
  sortFuncDecl(program, symtab);
  symtab.pop();
  return;
}

/**
 * @param {Node} stmt
 * @param {Map[]} symtab
 * @param {[]} callStack
 * @return {undefined}
 */
function processStmt(stmt, symtab, callStack) {
  switch (stmt.type) {
    case 'VariableDeclaration':
      for (let i=0; i<stmt.declarations.length; i++) {
        processPattern(stmt.declarations[i].id, symtab, callStack, false);
        if (stmt.declarations[i].init!==null) {
          processExpression(stmt.declarations[i].init, symtab, callStack);
        }
      }
      break;
    case 'BlockStatement':
      if (stmt.varsOnScope!=symtab[symtab.length-1]) {
        symtab.push(stmt.varsOnScope);
        for (let i=0; i<stmt.body.length; i++) {
          processStmt(stmt.body[i], symtab, callStack);
        }
        sortFuncDecl(stmt, symtab);
        symtab.pop();
        break;
      } else {
        // called from Function declaration/ function exp, etc.
        for (let i=0; i<stmt.body.length; i++) {
          processStmt(stmt.body[i], symtab, callStack);
        }
        sortFuncDecl(stmt, symtab);
        break;
      }
    case 'FunctionDeclaration':
      // be careful about the order: function name symbol is in outer scope;
      // should first find correct func name symbol, then push the inner symtab
      callStack.push(
          [getSymtab(symtab, stmt.id.name, 'declaredIn'), stmt.id.name]);
      symtab.push(stmt.body.varsOnScope);
      for (let i=0; i<stmt.params.length; i++) {
        processPattern(stmt.params[i], symtab, callStack, false);
      }
      processStmt(stmt.body, symtab, callStack);
      callStack.pop();
      symtab.pop();
      break;
    case 'EmptyStatement':
      break;
    case 'ExpressionStatement':
      processExpression(stmt.expression, symtab, callStack);
      break;
    case 'ClassDeclaration':
      processPattern(stmt.id, symtab, callStack, false);
      if (stmt.superClass!==null) {
        processExpression(stmt.superClass, symtab, callStack);
      }
      processClassBody(stmt.body, symtab, callStack);
      break;
    case 'ReturnStatement':
      if (stmt.argument!==null) {
        processExpression(stmt.argument, symtab, callStack);
      }
      break;
    case 'DebuggerStatement':
      break;
    case 'WithStatement':
      exitProgram(stmt.type);
      break;
    case 'LabeledStatement':
      processStmt(stmt.body, symtab, callStack);
      break;
    case 'BreakStatement':
      break;
    case 'ContinueStatement':
      break;
    case 'IfStatement':
      processExpression(stmt.test, symtab, callStack);
      processStmt(stmt.consequent, symtab, callStack);
      if (stmt.alternate!==null) {
        processStmt(stmt.alternate, symtab, callStack);
      }
      break;
    case 'SwitchStatement':
      processExpression(stmt.discriminant, symtab, callStack);
      for (let i=0; i<stmt.cases.length; i++) {
        if (stmt.cases[i].test!==null) {
          processExpression(stmt.cases[i].test, symtab, callStack);
        }
        for (let j=0; j<stmt.cases[i].consequent.length; j++) {
          processStmt(stmt.cases[i].consequent[j], symtab, callStack);
        }
      }
      break;
    case 'ThrowStatement':
      processExpression(stmt.argument, symtab, callStack);
      break;
    case 'TryStatement':
      processStmt(stmt.block, symtab, callStack);
      if (stmt.handler!==null) {
        symtab.push(stmt.handler.body.varsOnScope);
        if (stmt.handler.param!==null) {
          processPattern(stmt.handler.param, symtab, callStack, false);
        }
        processStmt(stmt.handler.body, symtab, callStack);
        symtab.pop();
      }
      if (stmt.finalizer!==null) {
        processStmt(stmt.finalizer, symtab, callStack);
      }
      return;
    case 'WhileStatement':
      processExpression(stmt.test, symtab, callStack);
      processStmt(stmt.body, symtab, callStack);
      return;
    case 'DoWhileStatement':
      processStmt(stmt.body, symtab, callStack);
      processExpression(stmt.test, symtab, callStack);
      return;
    case 'ForStatement':
      symtab.push(stmt.varsOnScope);
      if (stmt.init===null) {
      } else if (stmt.init.type=='VariableDeclaration') {
        processStmt(stmt.init, symtab, callStack);
      } else {
        processExpression(stmt.init, symtab, callStack);
      }
      if (stmt.test!==null) {
        processExpression(stmt.test, symtab, callStack);
      }
      if (stmt.update!==null) {
        processExpression(stmt.update, symtab, callStack);
      }
      processStmt(stmt.body, symtab, callStack);
      symtab.pop();
      break;
    case 'ForInStatement':
    case 'ForOfStatement':
      symtab.push(stmt.varsOnScope);
      if (stmt.left.type=='VariableDeclaration') {
        processStmt(stmt.left, symtab, callStack);
      } else {
        processPattern(stmt.left, symtab, callStack, true);
      }
      processExpression(stmt.right, symtab, callStack);
      processStmt(stmt.body, symtab, callStack);
      symtab.pop();
      break;
    // technically, import declaration is not a stmt
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
 * @param {[]} callStack
 * @return {undefined}
 */
function processExpression(expression, symtab, callStack) {
  switch (expression.type) {
    case 'Identifier':
      processPattern(expression, symtab, callStack, true);
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
          processExpression(expression.elements[i].argument, symtab, callStack);
        } else {
          processExpression(expression.elements[i], symtab, callStack);
        }
      }
      break;
    case 'ObjectExpression':
      for (let i=0; i<expression.properties.length; i++) {
        if (expression.properties[i].type=='Property') {
          processExpression(expression.properties[i].key, symtab, callStack);
          processExpression(expression.properties[i].value, symtab, callStack);
        } else {
          processExpression(expression.properties[i].argument,
              symtab, callStack);
        }
      }
      break;
    case 'FunctionExpression':
      symtab.push(expression.varsOnScope);
      symtab.push(expression.body.varsOnScope);
      for (let i=0; i<expression.params.length; i++) {
        processPattern(expression.params[i], symtab, callStack, false);
      }
      processStmt(expression.body, symtab, callStack);
      symtab.pop();
      symtab.pop();
      break;
    case 'ArrowFunctionExpression':
      if (expression.expression===false) {
        symtab.push(expression.body.varsOnScope);
        for (let i=0; i<expression.params.length; i++) {
          processPattern(expression.params[i], symtab, callStack, false);
        }
        if (expression.id!==null) {
          throw new Error();
        }
        processStmt(expression.body, symtab, callStack);
        symtab.pop();
      } else {
        symtab.push(expression.varsOnScope);
        for (let i=0; i<expression.params.length; i++) {
          processPattern(expression.params[i], symtab, callStack, false);
        }
        if (expression.id!==null) {
          throw new Error();
        }
        processExpression(expression.body, symtab, callStack);
        symtab.pop();
      }
      break;
    case 'ClassExpression':
      symtab.push(expression.varsOnScope);
      if (expression.superClass!==null) {
        processExpression(expression.superClass, symtab, callStack);
      }
      processClassBody(expression.body);
      symtab.pop();
      break;
    case 'TaggedTemplateExpression':
      processExpression(expression.tag, symtab, callStack);
      for (let i=0; i<expression.quasi.expressions.length; i++) {
        processExpression(expression.quasi.expressions[i], symtab, callStack);
      }
      break;
    case 'TemplateLiteral':
      for (let i=0; i<expression.expressions.length; i++) {
        processExpression(expression.expressions[i], symtab, callStack);
      }
      break;
    case 'ChainExpression':
      processExpression(expression.expression, symtab, callStack);
      break;
    case 'ImportExpression':
      exitProgram(expression.type);
      break;
    case 'UnaryExpression':
      processExpression(expression.argument, symtab, callStack);
      break;
    case 'BinaryExpression':
      processExpression(expression.left, symtab, callStack);
      processExpression(expression.right, symtab, callStack);
      break;
    case 'AssignmentExpression':
      processPattern(expression.left, symtab, callStack, true);
      processExpression(expression.right, symtab, callStack);
      break;
    case 'LogicalExpression':
      processExpression(expression.left, symtab, callStack);
      processExpression(expression.right, symtab, callStack);
      break;
    case 'MemberExpression':
      if (expression.object.type!='Super') {
        processExpression(expression.object, symtab, callStack);
      }
      if (expression.computed==true) {
        processExpression(expression.property, symtab, callStack);
      }
      break;
    case 'ConditionalExpression':
      processExpression(expression.test, symtab, callStack);
      processExpression(expression.alternate, symtab, callStack);
      processExpression(expression.consequent, symtab, callStack);
      break;
    case 'CallExpression':
      if (expression.callee.type!='Super') {
        processExpression(expression.callee, symtab, callStack);
      }
      for (let i=0; i<expression.arguments.length; i++) {
        if (expression.arguments[i].type=='SpreadExpression') {
          processExpression(expression.arguments[i].argument,
              symtab, callStack);
        } else {
          processExpression(expression.arguments[i], symtab, callStack);
        }
      }
      break;
    case 'NewExpression':
      processExpression(expression.callee, symtab, callStack);
      for (let i=0; i<expression.arguments.length; i++) {
        if (expression.arguments[i].type=='SpreadExpression') {
          processExpression(expression.arguments[i].argument,
              symtab, callStack);
        } else {
          processExpression(expression.arguments[i], symtab, callStack);
        }
      }
      break;
    case 'SequenceExpression':
      for (let i=0; i<expression.expressions.length; i++) {
        processExpression(expression.expressions[i], symtab, callStack);
      }
      break;
    case 'YieldExpression':
      if (expression.argument!==null) {
        processExpression(expression.argument, symtab, callStack);
      }
      break;
    case 'AwaitExpression':
      processExpression(expression.argument, symtab, callStack);
      break;
    case 'MetaProperty':
      break;
    case 'UpdateExpression':
      processExpression(expression.argument, symtab, callStack);
      break;
    case 'SpreadElement':
      processExpression(expression.argument, symtab, callStack);
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
      processExpression(classbody[i].key, symtab, callStack);
      processExpression(classbody[i].value, symtab, callStack);
    } else {
      exitProgram('Class Property definition');
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
 * @param {Node} pattern
 * @param {Node} symtab
 * @param {[String]} callStack
 * @param {Boolean} use
 * @return {undefined}
 */
function processPattern(pattern, symtab, callStack, use) {
  switch (pattern.type) {
    case 'Identifier':
      calleeProperties=getSymtab(symtab, pattern.name);
      if (calleeProperties!==undefined&&
          calleeProperties.get('type')=='func'&&use) {
        for (const [callerScope, callerName] of callStack) {
          if (callerScope==calleeProperties.get('declaredIn')) {
            callerScope.get(callerName).push(pattern.name);
          }
        }
      }
      break;
    case 'MemberExpression':
      if (pattern.object.type!='Super') {
        processExpression(pattern.object, symtab, callStack);
      }
      if (pattern.computed==true) {
        processExpression(pattern.property, symtab, callStack);
      }
      break;
    case 'ObjectPattern':
      for (let i=0; i<pattern.properties.length; i++) {
        switch (pattern.properties[i].type) {
          case 'Property':
            processExpression(pattern.properties[i].key, symtab, callStack);
            processPattern(pattern.properties[i].value, symtab, callStack, use);
            break;
          case 'RestElement':
            processPattern(pattern.properties[i].argument,
                symtab, callStack, use);
            break;
          default:
            throw new Error();
        }
      }
      break;
    case 'ArrayPattern':
      for (let i=0; i<pattern.elements.length; i++) {
        if (pattern.elements[i]===null) continue;
        processPattern(pattern.elements[i], symtab, callStack, use);
      }
      break;
    case 'RestElement':
      processPattern(pattern.argument, symtab, callStack, use);
      break;
    case 'AssignmentPattern':
      processPattern(pattern.left, symtab, callStack, use);
      processExpression(pattern.right, symtab, callStack);
      break;
    default:
      throw new Error();
  }
  return;
}

/**
 * @param {Node} node
 * @param {Map[]} symtab
 * @return {undefined}
 */
function sortFuncDecl(node, symtab) {
  const toAddLoadUndefined=[];
  const visited=[];
  const color=new Map();

  /**
  * @param {String} funcDecl
  * @return {undefined}
  */
  function rpo(funcDecl) {
    color.set(funcDecl, 'grey');
    for (const use of node.funcInBlock.get(funcDecl)) {
      if (use==funcDecl) {
        continue;
      }
      if (toAddLoadUndefined.includes(funcDecl)) {
        continue;
      }
      if (color.get(use)=='grey') {
        toAddLoadUndefined.push(use);
        continue;
      }
      if (color.get(use)==undefined) {
        rpo(use);
      }
    }
    color.set(funcDecl, 'black');
    visited.push(funcDecl);
  }

  // call graph not connective, start from every node
  for (const [funcDecl] of node.funcInBlock) {
    if (visited.includes(funcDecl)) {
      continue;
    }
    if (toAddLoadUndefined.includes(funcDecl)) {
      continue;
    }
    rpo(funcDecl);
  }

  // place the function that do not need loadundefined
  // in order on top of the let scope
  const tmp=node.body.slice();
  let cursor=0;
  for (let i=0; i<visited.length; i++) {
    if (toAddLoadUndefined.includes(visited[i])) {
      continue;
    }
    for (let j=0; j<tmp.length; j++) {
      if (tmp[j].type=='FunctionDeclaration'&&tmp[j].id.name==visited[i]) {
        node.body[cursor]=tmp[j];
        tmp.splice(j, 1);
        cursor+=1;
      }
    }
  }
  // toAddLoadUndefined and someLoadUndefined function from useAnalysis pass
  // will be placed afterward
  for (let i=0; i<tmp.length; i++) {
    if (tmp[i].type=='FunctionDeclaration') {
      node.body[cursor]=tmp[i];
      setLoadUndefined(symtab, tmp[i].id.name);
      cursor+=1;
    }
  }
}


/**
 * @param {Node} symtab
 * @param {string} variable
 * @return {undefined}
 */
function setLoadUndefined(symtab, variable) {
  for (let i=symtab.length-1; i>=0; i--) {
    // there is no pointer from function name to varsOnScope which is on
    // varScope. We backtrace symtab and think the first function declaration we
    // meet is the function we want to set.
    // This is likely to be correct.
    // in the future maybe keep a pointer from hoist pass.
    if (symtab[i].has(variable)&&
        symtab[i].get(variable).get('type')=='func') {
      symtab[i].get(variable).set('loadUndefined', '');
      break;
    }
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
