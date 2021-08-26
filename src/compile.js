require('../proto/operations_pb');
require('../proto/program_pb');
require('../proto/typesystem_pb');
require('../proto/sync_pb');
const genProto=require('./genProto.js');

exports.compile=compile;

/**
 * @param {Node} program
 * @return {proto.fuzzilli.protobuf.Program}
 */
function compile(program) {
  const fuzzilProgram=new proto.fuzzilli.protobuf.Program();
  const IR=[];
  const symtab=[new Map()];
  const varNum=[0];// wrap in a array to pass by reference
  processVarsOnScope(program.varsOnScope, IR, symtab, varNum);
  compileStmtList(program.body, IR, symtab, varNum);
  fuzzilProgram.setCodeList(IR);
  return fuzzilProgram;
}

/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {NUmber[]} varNum
 * @return {undefined}
 */
function compileStmt(stmt, IR, symtab, varNum) {
  switch (stmt.type) {
    case 'ExpressionStatement':
      compileExpression(stmt.expression, IR, symtab, varNum);
      break;
    case 'BlockStatement':
      compileBlockStatement(stmt, IR, symtab, varNum);
      break;
    case 'EmptyStatement':
      break;
    case 'DebuggerStatement':
      exitProgram('DebuggerStatement');
      break;
    case 'WithStatement':
      exitProgram('WithStatement');
      break;
    case 'ReturnStatement':
      compileReturnStatement(stmt, IR, symtab, varNum);
      break;
    case 'LabeledStatement':
      exitProgram('LabeledStatement');
      break;
    case 'BreakStatement':
      compileBreakStatement(stmt, IR, symtab, varNum);
      break;
    case 'ContinueStatement':
      compileContinueStatment(stmt, IR, symtab, varNum);
      break;
    case 'IfStatement':
      compileIfStatement(stmt, IR, symtab, varNum);
      break;
    case 'SwitchStatement':
      exitProgram('switch IR is changing on Fuzzil');
      break;
    case 'ThrowStatement':
      compileThrowStatement(stmt, IR, symtab, varNum);
      break;
    case 'TryStatement':
      compileTryStatement(stmt, IR, symtab, varNum);
      break;
    case 'WhileStatement':
      compileWhileStatement(stmt, IR, symtab, varNum);
      break;
    case 'DoWhileStatement':
      compileDoWhileStatement(stmt, IR, symtab, varNum);
      break;
    case 'ForStatement':
      compileForStatement(stmt, IR, symtab, varNum);
      break;
    case 'ForInStatement':
      compileForInStatement(stmt, IR, symtab, varNum);
      break;
    case 'ForOfStatement':
      compileForOfStatement(stmt, IR, symtab, varNum);
      break;
    case 'FunctionDeclaration':
      compileFunctionDeclaration(stmt, IR, symtab, varNum);
      break;
    case 'VariableDeclaration':
      compileVariableDeclaration(stmt, IR, symtab, varNum);
      break;
    case 'ClassDeclaration':
      exitProgram('ClassDeclaration');
      break;
    default:
      throw new Error();
  }
  return;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 * compileExpression can only handle expression in read context.
 * a['b'] = 1;
 * left hand side is a Member expression, but in a write context
 * it can not be handled by compileExpression
 */
function compileExpression(expression, IR, symtab, varNum) {
  switch (expression.type) {
    case 'Identifier':
      return compileIdentifier(expression, IR, symtab, varNum);
    case 'Literal':
      return compileLiteral(expression, IR, symtab, varNum);
    case 'ChainExpression':
      exitProgram('ChainExpression');
      break;
    case 'ThisExpression':
      genProto.genLoadBuiltin(IR, varNum, 'this');
      return varNum[0]-1;
    case 'ImportExpression':
      exitProgram('ImportExpression');
    case 'ArrayExpression':
      return compileArrayExpression(expression, IR, symtab, varNum);
    case 'ObjectExpression':
      return compileObjectExpression(expression, IR, symtab, varNum);
    case 'FunctionExpression':
      return compileFunctionExpression(expression, IR, symtab, varNum);
    case 'ArrowFunctionExpression':
      return compileArrowFunctionExpression(expression, IR, symtab, varNum);
    case 'UnaryExpression':
    case 'UpdateExpression':
      return compileUnaryUpdateExpression(expression, IR, symtab, varNum);
    case 'BinaryExpression':
    case 'LogicalExpression':
      return compileBinaryLogicalExpression(expression, IR, symtab, varNum);
    case 'AssignmentExpression':
      return compileAssignmentExpression(expression, IR, symtab, varNum);
    case 'MemberExpression':
      return compileMemberExpression(expression, IR, symtab, varNum);
    case 'ConditionalExpression':
      return compileConditionalExpression(expression, IR, symtab, varNum);
    case 'CallExpression':
      return compileCallExpression(expression, IR, symtab, varNum);
    case 'NewExpression':
      return compileNewExpression(expression, IR, symtab, varNum);
    case 'SequenceExpression':
      return compileSequenceExpression(expression, IR, symtab, varNum);
    case 'YieldExpression':
      return compileYieldExpression(expression, IR, symtab, varNum);
    case 'AwaitExpression':
      return compileAwait(expression, IR, symtab, varNum);
    case 'TaggedTemplateExpression':
      exitProgram('tag call on template exp');
    case 'TemplateLiteral':
      exitProgram(
          'template literal,i want to solve together with tagged template exp');
    case 'ClassExpression':
      exitProgram('write this after class declare');
    case 'MetaProperty':
      exitProgram('new.target');
    default:
      throw new Error();
  }
}

/**
 * @param {Map} varsOnScope
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {undefined}
 */
function processVarsOnScope(varsOnScope, IR, symtab, varNum) {
  symtab[symtab.length-1]=varsOnScope;
  for (const [variable, property] of varsOnScope) {
    if (property.has('loadUndefined')) {
      genProto.genLoadUndefined(IR, varNum);
      symtab[symtab.length-1].get(variable).set('fuzzilId', varNum[0]-1);
    } else {
      symtab[symtab.length-1].get(variable).set('fuzzilId', undefined);
    };
  }
}

/**
 * @param {Map} varsOnScope
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {undefined}
 */
function processParamsOnScope(varsOnScope, IR, symtab, varNum) {
  for (const [variable, property] of varsOnScope) {
    if (property.get('type')!='param') {
      continue;
    }
    symtab[symtab.length-1].set(variable, varsOnScope.get(variable));
    symtab[symtab.length-1].get(variable).set('fuzzilId', undefined);
  }
}

/**
 * @param {Map} varsOnScope
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {undefined}
 */
function processVarsWithoutParamsOnScope(varsOnScope, IR, symtab, varNum) {
  for (const [variable, property] of varsOnScope) {
    if (property.get('type')=='param') {
      continue;
    }
    symtab[symtab.length-1].set(variable, varsOnScope.get(variable));
    if (property.has('loadUndefined')) {
      genProto.genLoadUndefined(IR, varNum);
      symtab[symtab.length-1].get(variable).set('fuzzilId', varNum[0]-1);
    } else {
      symtab[symtab.length-1].get(variable).set('fuzzilId', undefined);
    };
  }
}


/**
 * @param {Node[]} stmtList
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {undefined}
 * compileblockStmt will add new symtab and gen blockstatement fuzzil
 * So if these two thing is handled by father node, use compileStmtList
 */
function compileStmtList(stmtList, IR, symtab, varNum) {
  for (let i=0; i<stmtList.length; i++) {
    compileStmt(stmtList[i], IR, symtab, varNum);
  }
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileIdentifier(expression, IR, symtab, varNum) {
  if (!inSymtab(symtab, expression.name)) {
    // global var, like Math , or x without any var and let
    if (expression.name=='undefined') {
      genProto.genLoadUndefined(IR, varNum);
      return varNum[0]-1;
    } else if (['Object', 'Array', 'Function', 'String', 'Boolean',
      'Number', 'Symbol', 'BigInt', 'RegExp', 'Error', 'EvalError',
      'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError',
      'AggregateError', 'ArrayBuffer', 'Uint8Array', 'Int8Array',
      'Uint16Array', 'Int16Array', 'Uint32Array', 'Int32Array', 'Date',
      'Float32Array', 'Float64Array', 'Uint8ClampedArray', 'DataView',
      'Promise', 'Proxy', 'Map', 'WeakMap', 'Set', 'WeakSet', 'Math',
      'JSON', 'Reflect', 'isNaN', 'isFinite', 'eval', 'parseInt',
      'parseFloat', 'NaN', 'Infinity'].includes(expression.name)) {
      genProto.genLoadBuiltin(IR, varNum, expression.name);
      return varNum[0]-1;
    } else {
      genProto.genLoadBuiltin(IR, varNum, 'globalThis');
      const globalObject=varNum[0]-1;
      genProto.genLoadProperty(IR, varNum, globalObject, expression.name);
      const varId=varNum[0]-1;
      return varId;
    }
  } else {
    if (isArguments(symtab, expression.name)) {
      // arguments object in function
      genProto.genLoadBuiltin(IR, varNum, 'arguments');
      return varNum[0]-1;
    } else {
      // local var, have to duplicate if marked as dup in identifierAnalysis
      // pass
      const id=getSymtab(symtab, expression.name);
      if (typeof id!='number') {
        throw new Error();
      }
      if (expression.dup==true) {
        genProto.genDup(IR, varNum, id);
        return varNum[0]-1;
      } else {
        return id;
      }
    }
  }
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {NUmber[]} varNum
 * @return {undefined}
 */
function compileFunctionExpression(expression, IR, symtab, varNum) {
  const functionTempId=varNum[0];
  varNum[0]+=1;
  const inoutList=[functionTempId];
  symtab.push(new Map());
  processVarsOnScope(expression.varsOnScope, IR, symtab, varNum);
  symtab.push(new Map());
  processParamsOnScope(expression.body.varsOnScope, IR, symtab, varNum);
  let hasRestElement=false;
  // currently fuzzil not support deconstruct assignment function params
  // so the params process is pretty simple
  for (let i=0; i<expression.params.length; i++) {
    switch (expression.params[i].type) {
      case 'Identifier':
        processParamToSymtabAndInoutList(
            symtab, expression.params[i].name, varNum, inoutList);
        break;
      case 'RestElement':
        if (expression.params[i].argument.type!='Identifier') {
          exitProgram('Func param '+expression.params[i].argument.type);
        }
        hasRestElement=true;
        processParamToSymtabAndInoutList(symtab,
            expression.params[i].argument.name, varNum, inoutList);
        break;
      default:
        exitProgram('Func param '+expression.params[i].type);
    }
  }
  genProto.genBeginAnyFunctionDefinition(
      IR, inoutList, expression.async, expression.generator, hasRestElement);
  processVarsWithoutParamsOnScope(
      expression.body.varsOnScope, IR, symtab, varNum);
  if (expression.id!==null) {
    setSymtab(symtab, expression.id.name, functionTempId);
  }
  compileStmtList(expression.body.body, IR, symtab, varNum);
  genProto.genEndAnyFunctionDefinition(
      IR, expression.async, expression.generator);
  symtab.pop();
  symtab.pop();
  return functionTempId;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {NUmber[]} varNum
 * @return {undefined}
 */
function compileArrowFunctionExpression(expression, IR, symtab, varNum) {
  const functionTempId=varNum[0];
  varNum[0]+=1;
  const inoutList=[functionTempId];
  symtab.push(new Map());
  if (expression.expression==false) {
    processParamsOnScope(expression.body.varsOnScope, IR, symtab, varNum);
  } else {
    processParamsOnScope(expression.varsOnScope, IR, symtab, varNum);
  }
  // currently fuzzil not support deconstruct assignment function params
  // so the params process is pretty simple
  for (let i=0; i<expression.params.length; i++) {
    switch (expression.params[i].type) {
      // arrow function do not allow duplicate param name
      // Do not use processParamToSymtabAndInoutList here.
      case 'Identifier':
        setSymtabLastPage(symtab, expression.params[i].name, varNum[0]);
        inoutList.push(varNum[0]);
        varNum[0]+=1;
        break;
      case 'RestElement':
        if (expression.params[i].argument.type!='Identifier') {
          exitProgram('Func param '+expression.params[i].argument.type);
        }
        exitProgram('Arrow function with rest elem');
        setSymtabLastPage(symtab,
            expression.params[i].argument.name, varNum[0]);
        inoutList.push(varNum[0]);
        varNum[0]+=1;
        break;
      default:
        exitProgram('Func param '+expression.params[i].type);
    }
  }
  genProto.genBeginArrowFunctionDefinition(IR, inoutList, expression.async);
  if (expression.id!==null) {
    throw new Error();
  }
  if (expression.expression==false) {
    processVarsWithoutParamsOnScope(
        expression.body.varsOnScope, IR, symtab, varNum);
    compileStmtList(expression.body.body, IR, symtab, varNum);
  } else {
    const exp = compileExpression(expression.body, IR, symtab, varNum);
    genProto.genReturn(IR, exp);
  }
  genProto.genEndArrowFunctionDefinition(IR, expression.async);
  symtab.pop();
  return functionTempId;
}


/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileForOfStatement(stmt, IR, symtab, varNum) {
  if (stmt.await==true) {
    exitProgram('await in for-of');
  }
  // only support single var declaration here
  if (stmt.left.type!='VariableDeclaration') {
    exitProgram('pattern on for-of lhs');
  }
  if (stmt.left.declarations.length!=1) {
    exitProgram('multi binding on for-of lhs');
  }
  if (stmt.left.declarations[0].id.type!=='Identifier') {
    exitProgram('non-identifier on for-of lhs');
  }
  if (stmt.left.declarations[0].init!==null) {
    // init maybe will execute once
    // will implement later
    exitProgram('default value on for-of lhs');
  }
  symtab.push(new Map());
  processVarsOnScope(stmt.varsOnScope, IR, symtab, varNum);
  if (stmt.left.kind=='var') {
    exitProgram('var decl on For of');
  }
  const rhs=compileExpression(stmt.right, IR, symtab, varNum);
  const lhs=varNum[0];
  varNum[0]+=1;
  setSymtabLastPage(symtab, stmt.left.declarations[0].id.name, lhs);
  genProto.genBeginForOf(IR, varNum, lhs, rhs);
  if (stmt.body.type=='BlockStatement') {
    // symtab handled here to avoid generate addition block statement
    symtab.push(new Map());
    processVarsOnScope(stmt.body.varsOnScope, IR, symtab, varNum);
    compileStmtList(stmt.body.body, IR, symtab, varNum);
    symtab.pop();
  } else {
    compileStmt(stmt.body, IR, symtab, varNum);
  }
  genProto.genEndForOf(IR);
  symtab.pop();
}

/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileForInStatement(stmt, IR, symtab, varNum) {
  // only support single var declaration here
  if (stmt.left.type!='VariableDeclaration') {
    exitProgram('pattern on for-in lhs');
  }
  if (stmt.left.declarations.length!=1) {
    exitProgram('multi binding on for-in lhs');
  }
  if (stmt.left.declarations[0].id.type!=='Identifier') {
    exitProgram('non-identifier on for-in lhs');
  }
  if (stmt.left.declarations[0].init!==null) {
    // init maybe will execute once
    // will implement later
    exitProgram('default value on for-in lhs');
  }
  symtab.push(new Map());
  processVarsOnScope(stmt.varsOnScope, IR, symtab, varNum);
  if (stmt.left.kind=='var') {
    exitProgram('var decl on for-in loop');
  }
  const rhs=compileExpression(stmt.right, IR, symtab, varNum);
  const lhs=varNum[0];
  varNum[0]+=1;
  setSymtabLastPage(symtab, stmt.left.declarations[0].id.name, lhs);
  genProto.genBeginForIn(IR, varNum, lhs, rhs);
  if (stmt.body.type=='BlockStatement') {
    symtab.push(new Map());
    processVarsOnScope(stmt.body.varsOnScope, IR, symtab, varNum);
    compileStmtList(stmt.body.body, IR, symtab, varNum);
    symtab.pop();
  } else {
    compileStmt(stmt.body, IR, symtab, varNum);
  }
  genProto.genEndForIn(IR);
  symtab.pop();
}

/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
  // fuzzil for require 6 inputs:
  // loopvar, start, terminate, terminate op, step, step op.
  // thes is not expressive enough for JS.
  // JS have init, test, update
  // So, the compile will be
  //
  // Fuzzilloopvar=Undefined
  // JStest, store result to Fuzzilstart
  // Fuzzilfor Fuzzilloopvar,Fuzzilstart, true, ==, true, logic_and
  // JSfor loop content
  // JSupdate
  // JStest, Fuzzilloopvar reassign to result.
  //
  // generally, fuzziloopvar, fuzzilstart, fuzziltest will be true or false
  // but it also allow other data type.
 */
function compileForStatement(stmt, IR, symtab, varNum) {
  genProto.genBeginBlockStatement(IR);
  symtab.push(new Map());
  processVarsOnScope(stmt.varsOnScope, IR, symtab, varNum);
  if (stmt.init===null) {
  } else if (stmt.init.type=='VariableDeclaration') {
    compileStmt(stmt.init, IR, symtab, varNum);
  } else {
    compileExpression(stmt.init, IR, symtab, varNum);
  }
  genProto.genLoadUndefined(IR, varNum);
  let start;
  if (stmt.test===null) {
    genProto.genLoadBoolean(IR, varNum, true);
    start=varNum[0]-1;
  } else {
    start=compileExpression(stmt.test, IR, symtab, varNum);
  }
  genProto.genBeginFor(IR, varNum, start);
  const loopVar=varNum[0]-1;
  if (stmt.body.type=='BlockStatement') {
    symtab.push(new Map());
    processVarsOnScope(stmt.body.varsOnScope, IR, symtab, varNum);
    compileStmtList(stmt.body.body, IR, symtab, varNum);
    symtab.pop();
  } else {
    compileStmt(stmt.body, IR, symtab, varNum);
  }
  if (stmt.update!==null) {
    compileExpression(stmt.update, IR, symtab, varNum);
  }
  if (stmt.test!==null) {
    const testAgain=compileExpression(stmt.test, IR, symtab, varNum);
    genProto.genReassign(IR, loopVar, testAgain);
  }
  symtab.pop();
  genProto.genEndFor(IR);
  genProto.genEndBlockStatement(IR);
}

/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileDoWhileStatement(stmt, IR, symtab, varNum) {
  genProto.genLoadUndefined(IR, varNum);
  const testParam=varNum[0]-1;
  genProto.genLoadBoolean(IR, varNum, true);
  genProto.genBeginDoWhile(IR, testParam, varNum[0]-1);
  // stmt.body can be a block stmt or also not.
  // fuzzil automatically add block statement.
  // do not introduce redundent curly brace here.
  if (stmt.body.type=='BlockStatement') {
    symtab.push(new Map());
    processVarsOnScope(stmt.body.varsOnScope, IR, symtab, varNum);
    compileStmtList(stmt.body.body, IR, symtab, varNum);
    symtab.pop();
  } else {
    compileStmt(stmt.body, IR, symtab, varNum);
  }
  const testParamAgain = compileExpression(stmt.test, IR, symtab, varNum);
  genProto.genReassign(IR, testParam, testParamAgain);
  genProto.genEndDoWhile(IR);
}

/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileWhileStatement(stmt, IR, symtab, varNum) {
  const testParam=compileExpression(stmt.test, IR, symtab, varNum);
  genProto.genLoadBoolean(IR, varNum, true);
  genProto.genBeginWhile(IR, testParam, varNum[0]-1);
  // stmt.body can be a block stmt or also not.
  // fuzzil automatically add block statement.
  // do not introduce redundent curly brace here.
  if (stmt.body.type=='BlockStatement') {
    symtab.push(new Map());
    processVarsOnScope(stmt.body.varsOnScope, IR, symtab, varNum);
    compileStmtList(stmt.body.body, IR, symtab, varNum);
    symtab.pop();
  } else {
    compileStmt(stmt.body, IR, symtab, varNum);
  }
  const testParamAgain = compileExpression(stmt.test, IR, symtab, varNum);
  genProto.genReassign(IR, testParam, testParamAgain);
  genProto.genEndWhile(IR);
}


/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileVariableDeclaration(stmt, IR, symtab, varNum) {
  for (let i=0; i<stmt.declarations.length; i++) {
    if (stmt.declarations[i].id.type!='Identifier') {
      exitProgram('pattern in var decl');
    }
    let rhs;
    let lhs=getSymtab(symtab, stmt.declarations[i].id.name);
    if (lhs!==undefined) {
      if (stmt.declarations[i].init!==null) {
        rhs=compileExpression(stmt.declarations[i].init, IR, symtab, varNum);
        genProto.genReassign(IR, lhs, rhs);
      } else {
        // x=0; var x;
        // ignore the var declaration;
      }
    } else {
      if (stmt.declarations[i].init!==null) {
        // first we compile the rhs of the init
        // if it generate one or more Fuzzil IR, we can steal it as the var name
        // if the rhs is a simple identifier, then we have to dup it to get a
        // valid var name.
        const tmpVarNum=varNum[0];
        rhs=compileExpression(stmt.declarations[i].init, IR, symtab, varNum);
        if (tmpVarNum==varNum[0]) {
          genProto.genDup(IR, varNum, rhs);
          lhs=varNum[0]-1;
        } else {
          lhs=rhs;
        }
      } else {
        genProto.genLoadUndefined(IR, varNum);
        lhs=varNum[0]-1;
      }
      setSymtab(symtab, stmt.declarations[i].id.name, lhs);
    }
  }
}

/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileTryStatement(stmt, IR, symtab, varNum) {
  genProto.genBeginTry(IR);
  symtab.push(new Map());
  processVarsOnScope(stmt.block.varsOnScope, IR, symtab, varNum);
  compileStmtList(stmt.block.body, IR, symtab, varNum);
  symtab.pop();
  if (stmt.handler!==null) {
    if (stmt.handler.param===null) exitProgram('catch with no param');
    if (stmt.handler.param.type!='Identifier') {
      exitProgram('catch param not identifier');
    };
    symtab.push(new Map());
    genProto.genBeginCatch(IR, varNum);
    processVarsOnScope(stmt.handler.body.varsOnScope, IR, symtab, varNum);
    setSymtab(symtab, stmt.handler.param.name, varNum[0]-1);
    compileStmtList(stmt.handler.body.body, IR, symtab, varNum);
    symtab.pop();
  }
  if (stmt.finalizer!==null) {
    genProto.genBeginFinally(IR);
    symtab.push(new Map());
    processVarsOnScope(stmt.finalizer.varsOnScope, IR, symtab, varNum);
    compileStmtList(stmt.finalizer.body, IR, symtab, varNum);
    symtab.pop();
  }
  genProto.genEndTryCatch(IR);
}

/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileThrowStatement(stmt, IR, symtab, varNum) {
  const throwArg=compileExpression(stmt.argument, IR, symtab, varNum);
  genProto.genThrowException(IR, throwArg);
  return;
}

/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileIfStatement(stmt, IR, symtab, varNum) {
  const test=compileExpression(stmt.test, IR, symtab, varNum);
  genProto.genBeginIf(IR, test);
  compileStmt(stmt.consequent, IR, symtab, varNum);
  if (stmt.alternate!==null) {
    genProto.genBeginElse(IR);
    compileStmt(stmt.alternate, IR, symtab, varNum);
  }
  genProto.genEndIf(IR);
}

/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileContinueStatment(stmt, IR, symtab, varNum) {
  exitProgram('Continue(conflict with for stmt)');
  if (stmt.label!==null) {
    exitProgram('continue stmt with label');
  } else {
    genProto.genContinue(IR);
  }
  return;
}

/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileBreakStatement(stmt, IR, symtab, varNum) {
  if (stmt.label!==null) {
    exitProgram('break stmt with label');
  } else {
    genProto.genBreak(IR);
  }
  return;
}
/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileReturnStatement(stmt, IR, symtab, varNum) {
  if (stmt.argument===null) {
    genProto.genLoadUndefined(IR, varNum);
    varId=varNum[0]-1;
  } else {
    varId=compileExpression(stmt.argument, IR, symtab, varNum);
  }
  genProto.genReturn(IR, varId);
  return;
}
/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileFunctionDeclaration(stmt, IR, symtab, varNum) {
  // we have to allocate function name in this function, not in genProto.
  // BeginPlainFunctionDefination, because function varNum must less than param.
  // but genproto runs after params compile(allocate name)

  // although this search has store intend, but it will never result to
  // global var, so it is ok to use the regular version of searchSymtab,
  // no need to process whether global var or not
  const functionId=getSymtab(symtab, stmt.id.name);
  const functionTempId=varNum[0];
  varNum[0]+=1;
  const inoutList=[functionTempId];
  if (functionId==undefined) {
    setSymtab(symtab, stmt.id.name, functionTempId);
  }
  symtab.push(new Map());
  processParamsOnScope(stmt.body.varsOnScope, IR, symtab, varNum);
  let hasRestElement=false;
  // currently fuzzil not support deconstruct assignment function params
  // so the params process is pretty simple
  for (let i=0; i<stmt.params.length; i++) {
    switch (stmt.params[i].type) {
      case 'Identifier':
        processParamToSymtabAndInoutList(
            symtab, stmt.params[i].name, varNum, inoutList);
        break;
      case 'RestElement':
        if (stmt.params[i].argument.type!='Identifier') {
          exitProgram('Func param '+stmt.params[i].argument.type);
        }
        hasRestElement=true;
        processParamToSymtabAndInoutList(
            symtab, stmt.params[i].argument.name, varNum, inoutList);
        break;
      default:
        exitProgram('Func param '+stmt.params[i].type);
    }
  }
  genProto.genBeginAnyFunctionDefinition(
      IR, inoutList, stmt.async, stmt.generator, hasRestElement);
  processVarsWithoutParamsOnScope(stmt.body.varsOnScope, IR, symtab, varNum);
  compileStmtList(stmt.body.body, IR, symtab, varNum);
  genProto.genEndAnyFunctionDefinition(IR, stmt.async, stmt.generator);
  if (functionId!==undefined) {
    genProto.genReassign(IR, functionId, functionTempId);
  }
  symtab.pop();
  return;
}

/**
 * @param {Node} stmt
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Object[]} symtab
 * @param {number} varNum
 * @return {undefined}
 */
function compileBlockStatement(stmt, IR, symtab, varNum) {
  symtab.push(new Map());
  genProto.genBeginBlockStatement(IR);
  processVarsOnScope(stmt.varsOnScope, IR, symtab, varNum);
  compileStmtList(stmt.body, IR, symtab, varNum);
  genProto.genEndBlockStatement(IR);
  symtab.pop();
  return;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileYieldExpression(expression, IR, symtab, varNum) {
  if (expression.delegate==true) {
    exitProgram('yield* expression');
  }
  if (expression.argument===null) {
    genProto.genLoadUndefined(IR, varNum);
    genProto.genYield(IR, varNum, varNum[0]-1);
  } else {
    const arg=compileExpression(expression.argument, IR, symtab, varNum);
    genProto.genYield(IR, varNum, arg);
  }
  return varNum[0]-1;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileAwait(expression, IR, symtab, varNum) {
  const awaitArg=compileExpression(expression.argument, IR, symtab, varNum);
  genProto.genAwait(IR, varNum, awaitArg);
  return varNum[0]-1;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileSequenceExpression(expression, IR, symtab, varNum) {
  let retVal;
  for (const singleExpression of expression.expressions) {
    retVal=compileExpression(singleExpression, IR, symtab, varNum);
  }
  return retVal;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileNewExpression(expression, IR, symtab, varNum) {
  const arguments=[];
  if (expression.callee.name=='eval'||expression.callee.name=='Function') {
    exitProgram('eval/Function cons.Fuzzil rename vars.eval likely fail');
  }
  const callee=compileExpression(expression.callee, IR, symtab, varNum);
  for (const argument of expression.arguments) {
    if (argument.type=='SpreadElement') {
      exitProgram('call constructor with spread element');
    } else {
      arguments.push(compileExpression(argument, IR, symtab, varNum));
    }
  }
  genProto.genConstruct(IR, varNum, callee, arguments);
  return varNum[0]-1;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileConditionalExpression(expression, IR, symtab, varNum) {
  // conditional Expression have shortcut;
  // for correctness, should compile to if-else
  // can add some check later; on simple cases, will compile to condition OP IR.
  exitProgram('ConditionalExpression');
  const test=compileExpression(expression.test, IR, symtab, varNum);
  const cons=compileExpression(
      expression.consequent, IR, symtab, varNum);
  const alt=compileExpression(expression.alternate, IR, symtab, varNum);
  genProto.genConditionalOperation(IR, varNum, test, cons, alt);
  return varNum[0]-1;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 * we assume that the caller of this function will not be reassign.
 * so this function will only generate Load, not Store.
 */
function compileMemberExpression(expression, IR, symtab, varNum) {
  if (expression.object.type=='Super') {
    if (expression.computed==false) {
      genProto.genLoadSuperProperty(IR, varNum, expression.property.name);
    } else {
      exitProgram('Computed Property access on Super');
    };
  } else {
    const lhs=compileExpression(expression.object, IR, symtab, varNum);
    if (expression.computed==false) {
      genProto.genLoadProperty(IR, varNum, lhs, expression.property.name);
    } else if (expression.property.type=='Literal'&&
      typeof (expression.property.value)=='number') {
      genProto.genLoadElement(IR, varNum, lhs, expression.property.value);
    } else {
      const propId=compileExpression(expression.property, IR, symtab, varNum);
      genProto.genLoadComputedProperty(
          IR, varNum, lhs, propId);
    }
  }
  return varNum[0]-1;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @param {Number} rhs
 * @return {Number}
 */
function compileMemberExpressionReassign(expression, IR, symtab, varNum, rhs) {
  if (expression.object.type=='Super') {
    if (expression.computed==false) {
      genProto.genStoreSuperProperty(IR, expression.property.name, rhs);
    } else {
      exitProgram('Computed Property access on Super');
    };
  } else {
    const objectId=compileExpression(
        expression.object, IR, symtab, varNum);
    if (expression.computed==false) {
      genProto.genStoreProperty(IR, objectId, expression.property.name, rhs);
    } else if (expression.property.type=='Literal'&&
                  typeof (expression.property.value)=='number'&&
                  expression.property.value %1==0 ) {
      genProto.genStoreElement(IR, objectId, expression.property.value, rhs);
    } else {
      const propId=compileExpression(expression.property, IR, symtab, varNum);
      genProto.genStoreComputedProperty(
          IR, objectId, propId, rhs);
    }
  }
  return rhs;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileUnaryUpdateExpression(expression, IR, symtab, varNum) {
  let argument;
  switch (expression.operator) {
    case '-':
    case '+':
    case '!':
    case '~':
      argument=compileExpression(expression.argument, IR, symtab, varNum);
      genProto.genUnaryOperation(
          IR, varNum, argument, expression.operator, expression.prefix);
      return varNum[0]-1;
    case '++':
    case '--':
      if (expression.argument.type=='Identifier'&&
        inSymtab(symtab, expression.argument.name)&&
        !isArguments(symtab, expression.argument.name)) {
        argument=getSymtab(symtab, expression.argument.name);
        genProto.genUnaryOperation(
            IR, varNum, argument, expression.operator, expression.prefix);
        return varNum[0]-1;
      } else if (expression.prefix==false) {
        // https://tc39.es/ecma262/#sec-postfix-increment-operator
        // a='123' ; a++ ; will return number 123, not string
        // i haven't think of a way to eligantly and correctly representent
        // the return value of postfix ++;
        exitProgram('Postfix ++');
      } else if (expression.argument.type=='Identifier') {
        argument=compileExpression(expression.argument, IR, symtab, varNum);
        genProto.genLoadInteger(IR, varNum, 1);
        intOne=varNum[0]-1;
        genProto.genBinaryOperation(
            IR, varNum, argument, intOne, expression.operator[0]);
        rhs=varNum[0]-1;
        if (inSymtab(symtab, expression.argument.name)) {
          const lhs=getSymtab(symtab, expression.argument.name);
          if (typeof lhs!=='number') {
            // arguments object will throw here
            throw new Error();
          }
          genProto.genReassign(IR, lhs, rhs);
          return lhs;
        } else {
          reassignGlobal(IR, varNum, expression.argument.name, rhs);
          return rhs;
        }
      } else if (expression.argument.type=='MemberExpression') {
        argument=compileExpression(expression.argument, IR, symtab, varNum);
        genProto.genLoadInteger(IR, varNum, 1);
        intOne=varNum[0]-1;
        genProto.genBinaryOperation(
            IR, varNum, argument, intOne, expression.operator[0]);
        rhs=varNum[0]-1;
        return compileMemberExpressionReassign(
            expression.argument, IR, symtab, varNum, rhs);
      } else {
        throw new Error();
      }
    case 'typeof':
      argument=compileExpression(expression.argument, IR, symtab, varNum);
      genProto.genTypeOf(IR, varNum, argument);
      return varNum[0]-1;
    case 'void':
      exitProgram('Unary void');
      break;
    case 'delete':
      exitProgram('delete need have one output');
      if (expression.argument==undefined||
        expression.argument.object==undefined||
        expression.argument.property==undefined) {
        exitProgram('delete param not object property');
      }
      if (expression.argument.computed==false) {
        genProto.genDeleteProperty(IR, varNum,
            expression.argument.object.name, expression.argument.property.name);
      } else if (expression.argument.property.type=='Literal'&&
        typeof (expression.property.value)=='number') {
        genProto.genDeleteElement(IR, varNum,
            expression.argument.object.name,
            expression.argument.property.value);
      } else {
        const propId=compileExpression(
            expression.argument.property, IR, symtab, varNum);
        genProto.genDeleteComputedProperty(
            IR, varNum, expression.argument.object.name, propId);
      }
      return varNum[0]-1;
    default:
      throw new Error();
  }
}
/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileAssignmentExpression(expression, IR, symtab, varNum) {
  if (expression.left.type=='Identifier') {
    let lhs;
    let rhs;
    let lhsDup;
    switch (expression.operator) {
      case '=':
        rhs=compileExpression(expression.right, IR, symtab, varNum);
        if (inSymtab(symtab, expression.left.name)) {
          lhs=getSymtab(symtab, expression.left.name);
          if (typeof lhs!=='number') {
            // arguments object will throw here
            throw new Error();
          }
          genProto.genReassign(IR, lhs, rhs);
          return lhs;
        } else {
          reassignGlobal(IR, varNum, expression.left.name, rhs);
          return rhs;
        };
      case '+=':
      case '-=':
      case '*=':
      case '/=':
      case '%=':
      case '**=':
      case '<<=':
      case '>>=':
      case '>>>=':
      case '|=':
      case '^=':
      case '&=':
        // There are four conditions. Dup or not, Global or not
        // if dup, like
        //
        // a+= ++a
        //
        // it should be compiled to a = a + ++a;
        // then to
        //
        // v0 <- Dup a;
        // v1 <- UnaryOperation a, '++'
        // v2 <- BinaryOperation v0, v1
        // Reassign a, v2
        //
        // if not dup, can compile to BinaryOperationAndReassign
        if (inSymtab(symtab, expression.left.name)) {
          lhs=getSymtab(symtab, expression.left.name);
          if (typeof lhs!=='number') {
            throw new Error();
          }
          if (expression.left.dup==true) {
            // compile lhs first, then rhs. the order is vital.
            lhsDup=compileExpression(expression.left, IR, symtab, varNum);
            rhs=compileExpression(expression.right, IR, symtab, varNum);
            genProto.genBinaryOperation(
                IR, varNum, lhsDup, rhs, expression.operator.slice(0, -1));
            genProto.genReassign(IR, lhs, varNum[0]-1);
            return varNum[0]-1;
          } else {
            rhs=compileExpression(expression.right, IR, symtab, varNum);
            genProto.genBinaryOperationAndReassign(
                IR, lhs, rhs, expression.operator);
            return varNum[0]-1;
          }
        } else {
          // lhs += rhs ; compile to:
          // tmpValue = lhsDup + rhs
          // lhs = tmpValue;
          lhsDup=compileExpression(expression.left, IR, symtab, varNum);
          rhs=compileExpression(expression.right, IR, symtab, varNum);
          genProto.genBinaryOperation(
              IR, varNum, lhsDup, rhs, expression.operator.slice(0, -1));
          const tmpValue=varNum[0]-1;
          reassignGlobal(IR, varNum, expression.left.name, tmpValue);
          return tmpValue;
        };
      case '||=':
      case '&&=':
      case '??=':
        exitProgram('Logical AssignmentOperator');
      default:
        throw new Error();
    }
  } else if (expression.left.type=='MemberExpression') {
    const rhs=compileExpression(expression.right, IR, symtab, varNum);
    if (expression.operator=='=') {
      return compileMemberExpressionReassign(
          expression.left, IR, symtab, varNum, rhs);
    } else {
      exitProgram('Member exp bin op reassign');
    }
  } else {
    exitProgram('Reassign lhs not identifier nor Member exp');
  }
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileBinaryLogicalExpression(expression, IR, symtab, varNum) {
  const lhs=compileExpression(expression.left, IR, symtab, varNum);
  const rhs=compileExpression(expression.right, IR, symtab, varNum);
  switch (expression.operator) {
    case '+':
    case '-':
    case '*':
    case '/':
    case '%':
    case '**':
    case '|':
    case '^':
    case '&':
    case '<<':
    case '>>':
    case '>>>':
    case '||':
    case '&&':
      genProto.genBinaryOperation(IR, varNum, lhs, rhs, expression.operator);
      return varNum[0]-1;
    case '==':
    case '!=':
    case '===':
    case '!==':
    case '<':
    case '>':
    case '<=':
    case '>=':
      genProto.genCompare(IR, varNum, lhs, rhs, expression.operator);
      return varNum[0]-1;
    case 'instanceof':
      genProto.genInstanceOf(IR, varNum, lhs, rhs);
      return varNum[0]-1;
    case 'in':
      genProto.genIn(IR, varNum, lhs, rhs);
      return varNum[0]-1;
    case '??':
      exitProgram('?? operator');
    default:
      throw new Error();
  }
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileObjectExpression(expression, IR, symtab, varNum) {
  const propertyNames=[];
  const propertyValues=[];
  const spreads=[];
  let haveSpreadElement=false;
  for (const property of expression.properties) {
    if (property.type=='SpreadElement') {
      haveSpreadElement=true;
      spreads.push(compileExpression(
          property.argument, IR, symtab, varNum));
    } else {
      if (property.kind=='get') exitProgram('Object getter');
      if (property.kind=='set') exitProgram('Object setter');
      if (property.method==true) exitProgram('Object method');
      if (property.shorthand==true) exitProgram('Object shorthand');
      if (property.computed==true) exitProgram('Object computed');
      switch (property.key.type) {
        case 'Literal':
          switch (typeof (property.key.value)) {
            case 'number':
              propertyNames.push(property.key.value.toString());
              break;
            case 'string':
              const strLiteral=stringValueToRepresentation(property.key.value);
              propertyNames.push(strLiteral);
              break;
            case 'bigint':
              propertyNames.push(property.key.value.toString());
              break;
            default:
              throw new Error();
          }
          break;
        case 'Identifier':
          propertyNames.push(property.key.name);
          break;
        default:
          throw new Error();
      }
      propertyValues.push(
          compileExpression(property.value, IR, symtab, varNum));
    }
  }
  if (haveSpreadElement==true) {
    // {...{"a":1},"a":2};
    // Fuzzil CreateObjectWithSpread will always put spread at last.
    // will fix that in future
    exitProgram('CreateObjectWithSpread');
    genProto.genCreateObjectWithSpread(
        IR, varNum, propertyNames, propertyValues, spreads);
  } else {
    genProto.genCreateObject(IR, varNum, propertyNames, propertyValues);
  }
  return varNum[0]-1;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileArrayExpression(expression, IR, symtab, varNum) {
  const arrayElements=[];
  const spreads=[];
  let haveSpreadElement=false;
  for (const element of expression.elements) {
    if (element===null) {
      genProto.genLoadUndefined(IR, varNum);
      arrayElements.push(varNum[0]-1);
      spreads.push(false);
    } else if (element.type=='SpreadElement') {
      haveSpreadElement=true;
      arrayElements.push(
          compileExpression(element.argument, IR, symtab, varNum));
      spreads.push(true);
    } else {
      arrayElements.push(
          compileExpressionForArray(element, IR, symtab, varNum));
      spreads.push(false);
    }
  }
  if (haveSpreadElement==true) {
    genProto.genCreateArrayWithSpread(IR, varNum, arrayElements, spreads);
  } else {
    genProto.genCreateArray(IR, varNum, arrayElements);
  }
  return varNum[0]-1;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 * Fuzzil Array will treat LoadUndefined as hole, so we compile undefined to
 * globalThis.undefined.
 */
function compileExpressionForArray(expression, IR, symtab, varNum) {
  if (expression.type=='Identifier') {
    if (!inSymtab(symtab, expression.name)) {
      if (expression.name=='undefined') {
        genProto.genLoadBuiltin(IR, varNum, 'globalThis');
        const globalObject=varNum[0]-1;
        genProto.genLoadProperty(IR, varNum, globalObject, expression.name);
        const varId=varNum[0]-1;
        return varId;
      }
    }
  }
  return compileExpression(expression, IR, symtab, varNum);
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileLiteral(expression, IR, symtab, varNum) {
  switch (typeof (expression.value)) {
    case 'number':
    {
      if (expression.value%1===0) {
        if (expression.value>=9223372036854776000||
            expression.value<-9223372036854776000) {
          exitProgram('Integer bigger than int64');
        }
        genProto.genLoadInteger(IR, varNum, expression.value);
        return varNum[0]-1;
      } else {
        genProto.genLoadFloat(IR, varNum, expression.value);
        return varNum[0]-1;
      }
    }
    case 'boolean':
    {
      genProto.genLoadBoolean(IR, varNum, expression.value);
      return varNum[0]-1;
    }
    case 'string':
    {
      const strLiteral=stringValueToRepresentation(expression.value);
      genProto.genLoadString(IR, varNum, strLiteral);
      return varNum[0]-1;
    }
    case 'bigint':
    {
      // protobuf use int to represent Bigint Value. so the value must be safe.
      if (expression.value>=9007199254740991n||
          expression.value<-9007199254740991n) {
        exitProgram('Bigint bigger than safe integer');
      }
      genProto.genLoadBigInt(IR, varNum, expression.value);
      return varNum[0]-1;
    }
    default:
      if (expression.value===null) {
        genProto.genLoadNull(IR, varNum, expression.value);
        return varNum[0]-1;
      } else if (expression.value instanceof RegExp) {
        genProto.genLoadRegExp(IR, varNum, expression.value);
        return varNum[0]-1;
      } else {
        throw new Error();
      };
  }
}

/**
 * @param {String} str
 * @return {String}
 */
function stringValueToRepresentation(str) {
  let rep='';
  for (let i=0; i<str.length; i++) {
    const char=str[i];
    const utfValue=char.charCodeAt(0);
    if (utfValue<16) {
      rep+='\\x0'+utfValue.toString(16);
    } else if (utfValue<32) {
      rep+='\\x'+utfValue.toString(16);
    } else if (utfValue==34) {
      rep+='\\\"';
    } else if (utfValue==39) {
      rep+='\\\'';
    } else if (utfValue==92) {
      rep+='\\\\';
    } else if (utfValue<127) {
      rep+=char;
    } else if (utfValue<256) {
      rep+='\\x'+utfValue.toString(16);
    } else if (utfValue<4096) {
      rep+='\\u0'+utfValue.toString(16);
    } else {
      rep+='\\u'+utfValue.toString(16);
    }
  }
  return rep;
}


/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileCallExpression(expression, IR, symtab, varNum) {
  let callee;
  let callSuperConstructor=false;
  if (expression.callee.type=='Super') {
    callSuperConstructor=true;
  } else if (expression.callee.type=='MemberExpression') {
    return compileMethodCall(expression, IR, symtab, varNum);
  } else {
    if (expression.callee.name=='eval'||expression.callee.name=='Function') {
      exitProgram('eval/Function cons.Fuzzil rename vars.eval likely fail');
    }
    callee=compileExpression(expression.callee, IR, symtab, varNum);
  };
  const arguments=[];
  const spreads=[];
  let haveSpreadElement=false;
  for (const argument of expression.arguments) {
    if (argument.type=='SpreadElement') {
      haveSpreadElement=true;
      arguments.push(
          compileExpression(argument.argument, IR, symtab, varNum));
      spreads.push(true);
    } else {
      arguments.push(compileExpression(argument, IR, symtab, varNum));
      spreads.push(false);
    }
  }
  if (callSuperConstructor==false&&haveSpreadElement==false) {
    genProto.genCallFunction(IR, varNum, callee, arguments);
  } else if (callSuperConstructor==true&&haveSpreadElement==false) {
    genProto.genCallSuperConstructor(IR, varNum, arguments);
  } else if (callSuperConstructor==false&&haveSpreadElement==true) {
    genProto.genCallFunctionWithSpread(
        IR, varNum, callee, arguments, spreads);
  } else {
    process.exit('SuperConstructor with spread element');
  }
  return varNum[0]-1;
}

/**
 * @param {Node} expression
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Map[]} symtab
 * @param {Number[]} varNum
 * @return {Number}
 */
function compileMethodCall(expression, IR, symtab, varNum) {
  if (expression.callee.object.type=='Super') {
    exitProgram('super method with computed method');
  }
  const referenceObject=compileExpression(
      expression.callee.object, IR, symtab, varNum);
  const arguments=[];
  for (const argument of expression.arguments) {
    if (argument.type=='SpreadElement') {
      exitProgram('Method call with SpreadElement');
    } else {
      arguments.push(compileExpression(argument, IR, symtab, varNum));
    }
  }
  if (expression.callee.computed==false) {
    if (expression.callee.property.type!='Identifier') {
      throw new Error();
    }
    const methodName=expression.callee.property.name;
    genProto.genCallMethod(
        IR, varNum, referenceObject, methodName, arguments);
  } else {
    const methodName=compileExpression(
        expression.callee.property, IR, symtab, varNum);
    genProto.genCallComputedMethod(
        IR, varNum, referenceObject, methodName, arguments);
  }
  return varNum[0]-1;
}

/**
 * @param {Map[]} symtab
 * @param {string} varName
 * @return {number|undefined}
 * varName => fuzzil ID
 * can return undefined;
 * must in symtab, otherwise return error
 */
function getSymtab(symtab, varName) {
  for (let i=symtab.length-1; i>=0; i--) {
    if (symtab[i].has(varName)) {
      return symtab[i].get(varName).get('fuzzilId');
    }
  }
  throw new Error();
}

/**
 * @param {Map[]} symtab
 * @param {string} varName
 * @return {Boolean}
 */
function isArguments(symtab, varName) {
  for (let i=symtab.length-1; i>=0; i--) {
    if (symtab[i].has(varName)) {
      return symtab[i].get(varName).get('type')=='arguments';
    }
  }
  throw new Error();
}

/**
 * @param {Map[]} symtab
 * @param {string} varName
 * @return {Boolean}
 * in symtab means local var, not in means global var.
 */
function inSymtab(symtab, varName) {
  for (let i=symtab.length-1; i>=0; i--) {
    if (symtab[i].has(varName)) {
      return true;
    }
  }
  return false;
}

/**
 * @param {Map[]} symtab
 * @param {String} name
 * @param {Number} id
 * @return {undefined}
 */
function setSymtabLastPage(symtab, name, id) {
  if (symtab[symtab.length-1].has(name)) {
    if (symtab[symtab.length-1].get(name).get('fuzzilId')!==undefined) {
      throw new Error();
    }
    symtab[symtab.length-1].get(name).set('fuzzilId', id);
    return;
  } else {
    throw new Error();
  }
}

/**
 * @param {Map[]} symtab
 * @param {String} name
 * @param {Number} varNum
 * @param {[]} inoutList
 * @return {undefined}
 * add param to symtab, and to inoutlist
 * function parameter can duplicate.
 * https://tc39.es/ecma262/#sec-parameter-lists-static-semantics-early-errors
 */
function processParamToSymtabAndInoutList(symtab, name, varNum, inoutList) {
  if (!symtab[symtab.length-1].has(name)) {
    throw new Error();
  }
  if (getSymtab(symtab, name)==undefined) {
    setSymtabLastPage(symtab, name, varNum[0]);
    inoutList.push(varNum[0]);
    varNum[0]+=1;
  } else {
    inoutList.push(getSymtab(symtab, name));
  }
}

/**
 * @param {Map[]} symtab
 * @param {String} name
 * @param {Number} id
 * @return {undefined}
 */
function setSymtab(symtab, name, id) {
  for (let i=symtab.length-1; i>=0; i--) {
    if (symtab[i].has(name)) {
      if (symtab[i].get(name).get('fuzzilId')!==undefined) {
        throw new Error();
      }
      symtab[i].get(name).set('fuzzilId', id);
      return;
    }
  }
  throw new Error();
}
/**
 * @param {proto.fuzzilli.protobuf.Instruction[]} IR
 * @param {Number[]} varNum
 * @param {string} varName
 * @param {number} rhs
 * @return {undefined}
 */
function reassignGlobal(IR, varNum, varName, rhs) {
  genProto.genLoadBuiltin(IR, varNum, 'globalThis');
  globalObject=varNum[0]-1;
  genProto.genStoreProperty(IR, globalObject, varName, rhs);
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
