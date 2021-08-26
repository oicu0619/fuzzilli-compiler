exports.identifierAnalysis=identifierAnalysis;

/**
 * @param {Node} program
 * @return {undefined}
 * for expression like  a + (++a); we can not just compile it to:
 * v0 <- genUnaryOperation ++ 'a'
 * v1 <- BinaryOperation a, v0
 * Because it will lift to
 * v0 = ++a
 * v1 = a + v0
 * which is not correct. We have to Dup a to save the value of a before ++.
 * That dup is not always need, so we do this pass the track which identifier
 * should be Dup, and only Dup the neccessary ones.
 * Be aware that function call maybe change value of all identifier
 */
function identifierAnalysis(program) {
  for (let i=0; i<program.body.length; i++) {
    processStmt(program.body[i]);
  }
  return;
}

/**
 * @param {Node} stmt
 * @return {undefined}
 */
function processStmt(stmt) {
  switch (stmt.type) {
    case 'VariableDeclaration':
      for (let i=0; i<stmt.declarations.length; i++) {
        if (stmt.declarations[i].init!==null) {
          processExpression(stmt.declarations[i].init, []);
        }
        processPattern(stmt.declarations[i].id);
      }
      break;
    case 'BlockStatement':
      for (let i=0; i<stmt.body.length; i++) {
        processStmt(stmt.body[i]);
      }
      break;
    case 'FunctionDeclaration':
      for (let i=0; i<stmt.params.length; i++) {
        processPattern(stmt.params[i]);
      }
      processStmt(stmt.body);
      break;
    case 'EmptyStatement':
      break;
    case 'ExpressionStatement':
      processExpression(stmt.expression, []);
      break;
    case 'ReturnStatement':
      if (stmt.argument!==null) {
        processExpression(stmt.argument, []);
      }
      break;
    case 'DebuggerStatement':
      break;
    case 'WithStatement':
      exitProgram(stmt.type);
      break;
    case 'LabeledStatement':
      processStmt(stmt.body);
      break;
    case 'BreakStatement':
      break;
    case 'ContinueStatement':
      break;
    case 'IfStatement':
      processExpression(stmt.test, []);
      processStmt(stmt.consequent);
      if (stmt.alternate!==null) {
        processStmt(stmt.alternate);
      }
      break;
    case 'SwitchStatement':
      processExpression(stmt.discriminant, []);
      for (let i=0; i<stmt.cases.length; i++) {
        if (stmt.cases[i].test!==null) {
          processExpression(stmt.cases[i].test, []);
        }
        for (let j=0; j<stmt.cases[i].consequent.length; j++) {
          processStmt(stmt.cases[i].consequent[j]);
        }
      }
      break;
    case 'ThrowStatement':
      processExpression(stmt.argument, []);
      break;
    case 'TryStatement':
      processStmt(stmt.block);
      if (stmt.handler!==null) {
        if (stmt.handler.param!==null) {
          processPattern(stmt.handler.param);
        }
        processStmt(stmt.handler.body);
      }
      if (stmt.finalizer!==null) {
        processStmt(stmt.finalizer);
      }
      return;
    case 'WhileStatement':
      processExpression(stmt.test, []);
      processStmt(stmt.body);
      return;
    case 'DoWhileStatement':
      processStmt(stmt.body);
      processExpression(stmt.test, []);
      return;
    case 'ForStatement':
      if (stmt.init===null) {
      } else if (stmt.init.type=='VariableDeclaration') {
        processStmt(stmt.init);
      } else {
        processExpression(stmt.init, []);
      }
      if (stmt.test!==null) {
        processExpression(stmt.test, []);
      }
      if (stmt.update!==null) {
        processExpression(stmt.update, []);
      }
      processStmt(stmt.body);
      break;
    case 'ForInStatement':
    case 'ForOfStatement':
      if (stmt.left.type=='VariableDeclaration') {
        processStmt(stmt.left);
      } else {
        processPattern(stmt.left);
      }
      processExpression(stmt.right, []);
      processStmt(stmt.body);
      break;
    case 'ClassDeclaration':
      processPattern(stmt.id);
      if (stmt.superClass!==null) {
        processExpression(stmt.superClass, []);
      }
      processClassBody(stmt.body);
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
 * @param {[]} identifierTab
 * identifierTab: [[IdentifierNode,...],...]
 * if there is something that may change the value of identifier in a expression
 * like a+func() ; mark previous identifier as dup
 * @return {undefined}
 */
function processExpression(expression, identifierTab) {
  switch (expression.type) {
    case 'Identifier':
      if (identifierTab.length==0) {
        break;
      }
      identifierTab[identifierTab.length-1].push(expression);
      break;
    case 'Literal':
      break;
    case 'ThisExpression':
      break;
    case 'ArrayExpression':
      identifierTab.push([]);
      for (let i=0; i<expression.elements.length; i++) {
        if (expression.elements[i]===null) {
          continue;
        } else if (expression.elements[i].type=='SpreadElement') {
          processExpression(expression.elements[i].argument, identifierTab);
        } else {
          processExpression(expression.elements[i], identifierTab);
        }
      }
      identifierTab.pop();
      break;
    case 'ObjectExpression':
      identifierTab.push([]);
      for (let i=0; i<expression.properties.length; i++) {
        if (expression.properties[i].type=='Property') {
          processExpression(expression.properties[i].key, identifierTab);
          processExpression(expression.properties[i].value, identifierTab);
        } else {
          processExpression(expression.properties[i].argument, identifierTab);
        }
      }
      identifierTab.pop();
      break;
    case 'FunctionExpression':
      identifierTab.push([]);
      for (let i=0; i<expression.params.length; i++) {
        processPattern(expression.params[i]);
      }
      processStmt(expression.body);
      identifierTab.pop();
      break;
    case 'ArrowFunctionExpression':
      identifierTab.push([]);
      for (let i=0; i<expression.params.length; i++) {
        processPattern(expression.params[i]);
      }
      if (expression.expression===false) {
        processStmt(expression.body);
      } else {
        processExpression(expression.body, []);
      }
      identifierTab.pop();
      break;
    case 'CallExpression':
      identifierTab.push([]);
      if (expression.callee.type!='Super') {
        processExpression(expression.callee, identifierTab);
      }
      for (let i=0; i<expression.arguments.length; i++) {
        if (expression.arguments[i].type=='SpreadExpression') {
          processExpression(expression.arguments[i].argument, identifierTab);
        } else {
          processExpression(expression.arguments[i], identifierTab);
        }
      }
      identifierTab.pop();
      dupEverything(identifierTab);
      break;
    case 'TaggedTemplateExpression':
      identifierTab.push([]);
      processExpression(expression.tag, identifierTab);
      for (let i=0; i<expression.quasi.expressions.length; i++) {
        processExpression(expression.quasi.expressions[i], identifierTab);
      }
      identifierTab.pop();
      dupEverything(identifierTab);
      break;
    case 'TemplateLiteral':
      identifierTab.push([]);
      for (let i=0; i<expression.expressions.length; i++) {
        processExpression(expression.expressions[i], identifierTab);
      }
      identifierTab.pop();
      break;
    case 'ChainExpression':
      identifierTab.push([]);
      processExpression(expression.expression, identifierTab);
      identifierTab.pop();
      break;
    case 'ImportExpression':
      exitProgram(expression.type);
      break;
    case 'UnaryExpression':
      identifierTab.push([]);
      processExpression(expression.argument, identifierTab);
      identifierTab.pop();
      if (expression.operator=='-'||expression.operator=='+'||
          expression.operator=='~'||expression.operator=='delete') {
      // this will call valueOf of a object
      // delete can be trap by proxy
        dupEverything(identifierTab);
      }
      break;
    case 'BinaryExpression':
      identifierTab.push([]);
      processExpression(expression.left, identifierTab);
      processExpression(expression.right, identifierTab);
      identifierTab.pop();
      if (expression.operator!='==='||expression.operator=='!=='||
          expression.operator=='instanceof') {
      // others will call toString or valueof
        dupEverything(identifierTab);
      }
      break;
    case 'AssignmentExpression':
      if (expression.operator=='=') {
        identifierTab.push([]);
        processPattern(expression.left);
        processExpression(expression.right, identifierTab);
        identifierTab.pop();
        // x * (x=1)
        // actually only need to dup the lhs of the assignExpression
        // currently we dup everything.
        // Will change that in the future.
        dupEverything(identifierTab);
        break;
      } else {
        identifierTab.push([]);
        processExpression(expression.left, identifierTab);
        processExpression(expression.right, identifierTab);
        identifierTab.pop();
        // a += ++a
        dupEverything(identifierTab);
      }
      break;
    case 'LogicalExpression':
      identifierTab.push([]);
      processExpression(expression.left, identifierTab);
      processExpression(expression.right, identifierTab);
      identifierTab.pop();
      break;
    case 'MemberExpression':
      identifierTab.push([]);
      if (expression.object.type!='Super') {
        processExpression(expression.object, identifierTab);
      }
      if (expression.computed==true) {
        processExpression(expression.property, identifierTab);
      }
      identifierTab.pop();
      dupEverything(identifierTab);
      // getter can be a function call
      break;
    case 'ConditionalExpression':
      identifierTab.push([]);
      processExpression(expression.test, identifierTab);
      processExpression(expression.alternate, identifierTab);
      processExpression(expression.consequent, identifierTab);
      identifierTab.pop();
      break;
    case 'NewExpression':
      identifierTab.push([]);
      processExpression(expression.callee, identifierTab);
      for (let i=0; i<expression.arguments.length; i++) {
        if (expression.arguments[i].type=='SpreadExpression') {
          processExpression(expression.arguments[i].argument, identifierTab);
        } else {
          processExpression(expression.arguments[i], identifierTab);
        }
      }
      identifierTab.pop();
      dupEverything(identifierTab);
      break;
    case 'SequenceExpression':
      identifierTab.push([]);
      for (let i=0; i<expression.expressions.length; i++) {
        processExpression(expression.expressions[i], identifierTab);
      }
      identifierTab.pop();
      break;
    case 'YieldExpression':
      identifierTab.push([]);
      if (expression.argument!==null) {
        processExpression(expression.argument, identifierTab);
      }
      identifierTab.pop();
      break;
    case 'AwaitExpression':
      identifierTab.push([]);
      processExpression(expression.argument, identifierTab);
      identifierTab.pop();
      break;
    case 'MetaProperty':
      break;
    case 'UpdateExpression':
      identifierTab.push([]);
      processExpression(expression.argument, identifierTab);
      identifierTab.pop();
      dupEverything(identifierTab);
      break;
    case 'SpreadElement':
      identifierTab.push([]);
      processExpression(expression.argument, identifierTab);
      identifierTab.pop();
      break;
    case 'ClassExpression':
      identifierTab.push([]);
      if (expression.id!==null) {
        processPattern(expression.id);
      }
      if (expression.superClass!==null) {
        processExpression(expression.superClass, identifierTab);
      }
      processClassBody(expression.body);
      identifierTab.pop();
      break;
    default:
      throw new Error();
  }
  return;
}

/**
 * @param {[]} identifierTab
 * @return {undefined}
 */
function dupEverything(identifierTab) {
  for (const tab of identifierTab) {
    for (const node of tab) {
      node.dup=true;
    }
  }
}

/**
 * @param {Node[]} classbody
 * @return {undefined}
 */
function processClassBody(classbody) {
  for (let i=0; i<classbody.length; i++) {
    if (classbody[i].type=='MethodDefinition') {
      if (classbody[i].key.type!='PrivateIdentifier') {
        exitProgram('class private identifer');
      }
      processExpression(classbody[i].key, []);
      processExpression(classbody[i].value, []);
    } else {
      exitProgram('Class Property definition');
    }
  }
}

/**
 * @param {Node} pattern
 * @return {undefined}
 */
function processPattern(pattern) {
  switch (pattern.type) {
    case 'Identifier':
      break;
    case 'MemberExpression':
      if (pattern.object.type!='Super') {
        processExpression(pattern.object, []);
      }
      if (pattern.computed==true) {
        processExpression(pattern.property, []);
      }
      break;
    case 'ObjectPattern':
      for (let i=0; i<pattern.properties.length; i++) {
        switch (pattern.properties[i].type) {
          case 'Property':
            processExpression(pattern.properties[i].key, []);
            processPattern(pattern.properties[i].value);
            break;
          case 'RestElement':
            processPattern(pattern.properties[i].argument);
            break;
          default:
            throw new Error();
        }
      }
      break;
    case 'ArrayPattern':
      for (let i=0; i<pattern.elements.length; i++) {
        if (pattern.elements[i]===null) continue;
        processPattern(pattern.elements[i]);
      }
      break;
    case 'RestElement':
      processPattern(pattern.argument);
      break;
    case 'AssignmentPattern':
      processPattern(pattern.left);
      processExpression(pattern.right, []);
      break;
    default:
      throw new Error();
  }
  return;
}

/**
 * @param {string} type
 * @return {undefined}
 */
function exitProgram(type) {
  console.log('Not Supported: '+type);
  process.exit(139);
}
