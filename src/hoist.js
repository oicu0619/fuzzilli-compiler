exports.hoist=hoist;

const funcDeclToHoist=[];
/**
 * @param {Node} program
 * @return {undefined}
 * The main purpose of the pass is two thing:
 *  collect declare informations for the next passes
 *  hoist function declartion to the top of let scope.
 * Information that we collect:
 *  varsOnScope is Map, symtab is array of Maps
 *  varsOnScope key is var name, value is property Map
 *  funcInBlock is Map, funcInBlockTable is array of Maps.
 *  funcInBlock is aux data structure for funcDeclSort pass.
 *  varsOnScope keep record of all variables on their actual scope
 *  funcInBlock keep record of functions on their let scope.
 *
 * for example:
 *
 * function a(){      // <-- b will be inside varsOnscope here
 * {                  // <-- b will be inside funcInBlock here
 *  function b(){}
 * }
 *
 * varsOnScope track properties like:
 *  type: var/let/const/func/class/
 *        param/funcExpName/classExpName/catchVar
 *        arguments( the argument object of function)
 *        may also extend detail type in future:loopVar
 *  declared: undefined/ inScope / outScope
 *            trace whether var is used out of letScope.
 *            if all of var is in letScope, do not need to hoist.
 *            if used out of let scope, have to hoist the var.
 *  loadUndefined: if set, means variable will be hoist to this scope.
 *                 Generator additional loadUndefined Fuzzil in compile pass.
 *
 */
function hoist(program) {
  program.varsOnScope=new Map();
  program.funcInBlock=new Map();
  for (let i=0; i<program.body.length; i++) {
    hoistStmt(program.body[i], program, program, program.body, i);
  }
  // detach function declaration during the pass
  // attach function declaration on the letScope at the end.
  // [stmt, letScope]
  for (const funcDecl of funcDeclToHoist) {
    const stmt=funcDecl[0];
    const letScope=funcDecl[1];
    letScope.body.splice(0, 0, stmt);
  }
  return;
}

/**
 * @param {Node} stmt
 * @param {Node} varScope
 * @param {Node} letScope
 * @param {Node} father
 * @param {String|Number} property
 * @return {undefined}
 * record father and property to delete current node from father
 * Node do not have pointer to father node.
 */
function hoistStmt(stmt, varScope, letScope, father, property) {
  switch (stmt.type) {
    case 'VariableDeclaration':
      hoistVariableDeclaration(stmt, varScope, letScope);
      break;
    case 'BlockStatement':
      // if father node is functionDeclaration/functionexpression/etc
      // they will generate varsOnScope for use and put arguments there
      // So in that case, we don't need to generate varsOnScpe.
      if (stmt.varsOnScope==undefined) {
        stmt.varsOnScope=new Map();
      }
      stmt.funcInBlock=new Map();
      for (let i=0; i<stmt.body.length; i++) {
        hoistStmt(stmt.body[i], varScope, stmt, stmt.body, i);
      }
      break;
    case 'FunctionDeclaration':
      // delete self from AST
      father[property]={type: 'EmptyStatement'};
      // put self to list, add to AST at the end of the pass
      funcDeclToHoist.push([stmt, letScope]);
      if (stmt.body.body.length>0&&stmt.body.body[0].directive) {
        exitProgram('strict mode function');
      }
      letScope.funcInBlock.set(stmt.id.name, []);
      // function x(z) {
      //   console.log(z)
      //   function z() { }
      // }
      //
      // Need further think about how we want this to compile
      // temporarily just bail out here.
      if (varScope.varsOnScope.has(stmt.id.name)&&
          varScope.varsOnScope.get(stmt.id.name).get('type')!='func') {
        exitProgram('argument and parameter same name');
      }
      varScope.varsOnScope.set(stmt.id.name,
          new Map([['type', 'func'], ['declaredIn', letScope.funcInBlock]]));
      stmt.body.varsOnScope=new Map();
      //  function arguments(arguments, arguments) {
      //  console.log(arguments)
      //   }
      //  arguments()
      //
      //  arguments is in the function body scope, and we can define same name
      //  parameter and local variable after.
      //  this is not exactly the case, such as it is allow to declare a let
      //  variable inside function, but i think it is currently accurate enough.
      stmt.body.varsOnScope.set('arguments', new Map([['type', 'arguments']]));
      for (let i=0; i<stmt.params.length; i++) {
        // although function parameter can duplicate:
        // https://tc39.es/ecma262/#sec-parameter-lists-static-semantics-early-errors
        // Fuzzil can not representent duplicate function parameter, saying:
        // decoded code is not statically valid: variable v1 was already defined
        hoistPatternWithoutDup(stmt.params[i], stmt.body, 'param');
      }
      hoistStmt(stmt.body, stmt.body, stmt.body, stmt, 'body');
      break;
    case 'EmptyStatement':
      break;
    case 'ExpressionStatement':
      hoistExpression(stmt.expression);
      break;
    case 'ClassDeclaration':
      letScope.varsOnScope.set(stmt.id.name, (new Map()).set('type', 'class'));
      if (stmt.superClass!==null) {
        hoistExpression(stmt.superClass);
      }
      hoistClassBody(stmt.body);
      break;
    case 'ReturnStatement':
      if (stmt.argument!==null) {
        hoistExpression(stmt.argument);
      }
      break;
    case 'DebuggerStatement':
      break;
    case 'WithStatement':
      exitProgram(stmt.type);
      break;
    case 'LabeledStatement':
      hoistStmt(stmt.body, varScope, letScope, stmt, 'body');
      break;
    case 'BreakStatement':
      break;
    case 'ContinueStatement':
      break;
    case 'IfStatement':
      // if (false) ;
      // else function f() { f=123;}
      // f();
      // console.log(f)
      //
      // f is not changed after f runs.
      //
      // https://tc39.es/ecma262/#sec-functiondeclarations-in-ifstatement-statement-clauses
      // the standard said that we should trait function declaration in if stmt
      // as if there is a block.
      //
      // the simplification here is not correct.
      // will fix later.
      hoistExpression(stmt.test);
      hoistStmt(stmt.consequent, varScope, letScope, stmt, 'consequent');
      if (stmt.alternate!==null) {
        hoistStmt(stmt.alternate, varScope, letScope, stmt, 'alternate');
      }
      break;
    case 'SwitchStatement':
      exitProgram('switch IR is changing on Fuzzil');
      // SwitchStatement hoist have bug:
      // letScope should be point to SwitchStatment
      // because switch have a curly bracket.
      // also, as the only invisible block(no blockstatment but {}),
      // we do not properly handle it in every pass.
      // we currently only think program and block statemtn can be let scope
      // actually switch can.
      hoistExpression(stmt.discriminant);
      for (let i=0; i<stmt.cases.length; i++) {
        if (stmt.cases[i].test!==null) {
          hoistExpression(stmt.cases[i].test);
        }
        for (let j=0; j<stmt.cases[i].consequent.length; j++) {
          hoistStmt(stmt.cases[i].consequent[j], varScope, letScope,
              stmt.cases[i].consequent, j);
        }
      }
      break;
    case 'ThrowStatement':
      hoistExpression(stmt.argument);
      break;
    case 'TryStatement':
      hoistStmt(stmt.block, varScope, letScope, stmt, 'block');
      if (stmt.handler!==null) {
        if (stmt.handler.param!==null) {
          stmt.handler.body.varsOnScope=new Map();
          hoistPattern(
              stmt.handler.param, stmt.handler.body, 'catchVar');
        }
        hoistStmt(stmt.handler.body, varScope, letScope, stmt.handler, 'body');
      }
      if (stmt.finalizer!==null) {
        hoistStmt(stmt.finalizer, varScope, letScope, stmt, 'finalizer');
      }
      return;
    case 'WhileStatement':
      hoistExpression(stmt.test);
      hoistStmt(stmt.body, varScope, letScope, stmt, 'body');
      return;
    case 'DoWhileStatement':
      hoistStmt(stmt.body, varScope, letScope, stmt, 'body');
      hoistExpression(stmt.test);
      return;
    case 'ForStatement':
      // forstatment declaration is a seperate lex scope
      stmt.varsOnScope=new Map();
      if (stmt.init===null) {
      } else if (stmt.init.type=='VariableDeclaration') {
        hoistStmt(stmt.init, varScope, stmt, stmt, 'init');
      } else {
        hoistExpression(stmt.init);
      }
      if (stmt.test!==null) {
        hoistExpression(stmt.test);
      }
      if (stmt.update!==null) {
        hoistExpression(stmt.update);
      }
      hoistStmt(stmt.body, varScope, stmt, stmt, 'body');
      break;
    case 'ForInStatement':
    case 'ForOfStatement':
      stmt.varsOnScope=new Map();
      if (stmt.left.type=='VariableDeclaration') {
        hoistStmt(stmt.left, varScope, stmt, stmt, 'left');
      } else {
        hoistPattern(stmt.left, null, null);
      }
      hoistExpression(stmt.right);
      hoistStmt(stmt.body, varScope, stmt, stmt, 'body');
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
 * @return {undefined}
 */
function hoistExpression(expression) {
  switch (expression.type) {
    case 'Identifier':
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
          hoistExpression(expression.elements[i].argument);
        } else {
          hoistExpression(expression.elements[i]);
        }
      }
      break;
    case 'ObjectExpression':
      for (let i=0; i<expression.properties.length; i++) {
        if (expression.properties[i].type=='Property') {
          hoistExpression(expression.properties[i].key);
          hoistExpression(expression.properties[i].value);
        } else {
          hoistExpression(expression.properties[i].argument);
        }
      }
      break;
    case 'FunctionExpression':
      if (expression.body.body.length>0&&expression.body.body[0].directive) {
        exitProgram('strict mode function');
      }
      expression.body.varsOnScope=new Map();
      // always have a map, sometimes empty
      expression.varsOnScope=new Map();
      expression.body.varsOnScope.set(
          'arguments', new Map([['type', 'arguments']]));
      for (let i=0; i<expression.params.length; i++) {
        hoistPatternWithoutDup(expression.params[i], expression.body, 'param');
      }
      if (expression.id!==null) {
        expression.varsOnScope.set(expression.id.name,
            (new Map()).set('type', 'funcExpName'));
      }
      hoistStmt(expression.body, expression.body, expression.body,
          expression, 'body');
      break;
    case 'ArrowFunctionExpression':
    // arrow function sometimes have varsOnscope
    // (a)=>return a;
      if (expression.body.body!==undefined&&
          expression.body.body.length>0&&expression.body.body[0].directive) {
        exitProgram('strict mode function');
      }
      if (expression.expression===false) {
        expression.body.varsOnScope=new Map();
        for (let i=0; i<expression.params.length; i++) {
          hoistPattern(expression.params[i], expression.body, 'param');
        }
        if (expression.id!==null) {
          throw new Error();
        }
        hoistStmt(expression.body, expression.body, expression.body,
            expression, 'body');
      } else {
        expression.varsOnScope=new Map();
        for (let i=0; i<expression.params.length; i++) {
          hoistPattern(expression.params[i], expression, 'param');
        }
        if (expression.id!==null) {
          throw new Error();
        }
        hoistExpression(expression.body);
      }
      break;
    case 'ClassExpression':
      expression.varsOnScope=new Map();
      if (expression.id!==null) {
        expression.varsOnScope.set(expression.id.name,
            (new Map()).set('type', 'classExprName'));
      }
      if (expression.superClass!==null) {
        hoistExpression(expression.superClass);
      }
      hoistClassBody(expression.body);
      break;
    case 'TaggedTemplateExpression':
      hoistExpression(expression.tag);
      for (let i=0; i<expression.quasi.expressions.length; i++) {
        hoistExpression(expression.quasi.expressions[i]);
      }
      break;
    case 'TemplateLiteral':
      for (let i=0; i<expression.expressions.length; i++) {
        hoistExpression(expression.expressions[i]);
      }
      break;
    case 'ChainExpression':
      hoistExpression(expression.expression);
      break;
    case 'ImportExpression':
      exitProgram(expression.type);
      break;
    case 'UnaryExpression':
      hoistExpression(expression.argument);
      break;
    case 'BinaryExpression':
      hoistExpression(expression.left);
      hoistExpression(expression.right);
      break;
    case 'AssignmentExpression':
      hoistPattern(expression.left, null, null);
      hoistExpression(expression.right);
      break;
    case 'LogicalExpression':
      hoistExpression(expression.left);
      hoistExpression(expression.right);
      break;
    case 'MemberExpression':
      if (expression.object.type!='Super') {
        hoistExpression(expression.object);
      }
      // if computed is false, like a.b, then although b is an identifier, it
      // is not a variable reference, but treated as a string, so no need  to
      // process.
      if (expression.computed==true) {
        hoistExpression(expression.property);
      }
      break;
    case 'ConditionalExpression':
      hoistExpression(expression.test);
      hoistExpression(expression.alternate);
      hoistExpression(expression.consequent);
      break;
    case 'CallExpression':
      if (expression.callee.type!='Super') {
        hoistExpression(expression.callee);
      }
      for (let i=0; i<expression.arguments.length; i++) {
        if (expression.arguments[i].type=='SpreadExpression') {
          hoistExpression(expression.arguments[i].argument);
        } else {
          hoistExpression(expression.arguments[i]);
        }
      }
      break;
    case 'NewExpression':
      hoistExpression(expression.callee);
      for (let i=0; i<expression.arguments.length; i++) {
        if (expression.arguments[i].type=='SpreadExpression') {
          hoistExpression(expression.arguments[i].argument);
        } else {
          hoistExpression(expression.arguments[i]);
        }
      }
      break;
    case 'SequenceExpression':
      for (let i=0; i<expression.expressions.length; i++) {
        hoistExpression(expression.expressions[i]);
      }
      break;
    case 'YieldExpression':
      if (expression.argument!==null) {
        hoistExpression(expression.argument);
      }
      break;
    case 'AwaitExpression':
      hoistExpression(expression.argument);
      break;
    case 'MetaProperty':
      break;
    case 'UpdateExpression':
      hoistExpression(expression.argument);
      break;
    case 'SpreadElement':
      hoistExpression(expression.argument);
      break;
    default:
      throw new Error();
  }
  return;
}

/**
 * @param {Node[]} classbody
 * @param {Node} varScope
 * @param {Node}letScope
 * @return {undefined}
 */
function hoistClassBody(classbody) {
  for (let i=0; i<classbody.length; i++) {
    if (classbody[i].type=='MethodDefinition') {
      if (classbody[i].key.type!='PrivateIdentifier') {
        exitProgram('class private identifer');
      }
      hoistExpression(classbody[i].key);
      hoistExpression(classbody[i].value);
    } else {
      exitProgram('Class Property definition');
    }
  }
}

/**
 * @param {Node} pattern
 * @param {Node} scopeToAdd
 * @param {String} type
 * @return {undefined}
 */
function hoistPatternWithoutDup(pattern, scopeToAdd, type) {
  if (pattern.type=='Identifier') {
    if (scopeToAdd!==null) {
      if (scopeToAdd.varsOnScope.has(pattern.name)) {
        exitProgram('Duplicate function param');
      }
      scopeToAdd.varsOnScope.set(pattern.name, (new Map()).set('type', type));
    }
  } else {
    hoistPattern(pattern, scopeToAdd, type);
  }
}

/**
 * @param {Node} pattern
 * @param {Node} scopeToAdd
 * @param {String} type
 * @return {undefined}
 * scopeToAdd means it is not variable declare but use.
 */
function hoistPattern(pattern, scopeToAdd, type) {
  switch (pattern.type) {
    case 'Identifier':
      if (scopeToAdd!==null) {
        // function x(z) {
        //   console.log(z)
        //   function z() { }
        // }
        //
        // Need further think about how we want this to compile
        // temporarily just bail out here.
        if (scopeToAdd.varsOnScope.has(pattern.name)&&
            scopeToAdd.varsOnScope.get(pattern.name).get('type')!=type) {
          exitProgram('argument and parameter same name');
        }
        scopeToAdd.varsOnScope.set(pattern.name, (new Map([['type', type]])));
      }
      break;
    case 'MemberExpression':
      if (scopeToAdd!==null) {
        throw new Error();
      }
      if (pattern.object.type!='Super') {
        hoistExpression(pattern.object);
      }
      if (pattern.computed==true) {
        hoistExpression(pattern.property);
      }
      break;
    case 'ObjectPattern':
      for (let i=0; i<pattern.properties.length; i++) {
        switch (pattern.properties[i].type) {
          case 'Property':
            hoistExpression(pattern.properties[i].key);
            hoistPattern(pattern.properties[i].value, scopeToAdd, type);
            break;
          case 'RestElement':
            hoistPattern(pattern.properties[i].argument, scopeToAdd, type);
            break;
          default:
            throw new Error();
        }
      }
      break;
    case 'ArrayPattern':
      for (let i=0; i<pattern.elements.length; i++) {
        if (pattern.elements[i]===null) continue;
        hoistPattern(pattern.elements[i], scopeToAdd, type);
      }
      break;
    case 'RestElement':
      hoistPattern(pattern.argument, scopeToAdd, type);
      break;
    case 'AssignmentPattern':
      hoistPattern(pattern.left, scopeToAdd, type);
      hoistExpression(pattern.right);
      break;
    default:
      throw new Error();
  }
  return;
}

/**
 * @param {Node} stmt
 * @param {Node} varScope
 * @param {Node} letScope
 * @return {undefined}
 */
function hoistVariableDeclaration(stmt, varScope, letScope) {
  let scopeToAdd;
  switch (stmt.kind) {
    case 'var':
      scopeToAdd=varScope;
      break;
    case 'let':
      scopeToAdd=letScope;
      break;
    case 'const':
      scopeToAdd=letScope;
      break;
    default:
      throw new Error();
  }
  for (let i=0; i<stmt.declarations.length; i++) {
    hoistPattern(stmt.declarations[i].id, scopeToAdd, stmt.kind);
    if (stmt.declarations[i].init!==null) {
      hoistExpression(stmt.declarations[i].init);
    }
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
