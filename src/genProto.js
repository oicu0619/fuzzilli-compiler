require('../proto/operations_pb');
require('../proto/program_pb');
require('../proto/typesystem_pb');
require('../proto/sync_pb');

exports.genLoadUndefined=genLoadUndefined;
exports.genLoadInteger=genLoadInteger;
exports.genLoadBoolean=genLoadBoolean;
exports.genLoadString=genLoadString;
exports.genLoadBigInt=genLoadBigInt;
exports.genLoadNull=genLoadNull;
exports.genLoadRegExp=genLoadRegExp;
exports.genCallFunctionWithSpread=genCallFunctionWithSpread;
exports.genCallFunction=genCallFunction;
exports.genCallSuperConstructor=genCallSuperConstructor;
exports.genCreateArrayWithSpread=genCreateArrayWithSpread;
exports.genCreateArray=genCreateArray;
exports.genBeginAnyFunctionDefinition=genBeginAnyFunctionDefinition;
exports.genLoadBuiltin=genLoadBuiltin;
exports.genEndAnyFunctionDefinition=genEndAnyFunctionDefinition;
exports.genReassign=genReassign;
exports.genReturn=genReturn;
exports.genBinaryOperation=genBinaryOperation;
exports.genCompare=genCompare;
exports.genInstanceOf=genInstanceOf;
exports.genIn=genIn;
exports.genCreateObject=genCreateObject;
exports.genCreateObjectWithSpread=genCreateObjectWithSpread;
exports.genTypeOf=genTypeOf;
exports.genBinaryOperationAndReassign=genBinaryOperationAndReassign;
exports.genUnaryOperation=genUnaryOperation;
exports.genLoadProperty=genLoadProperty;
exports.genLoadSuperProperty=genLoadSuperProperty;
exports.genLoadElement=genLoadElement;
exports.genLoadComputedProperty=genLoadComputedProperty;
exports.genStoreSuperProperty=genStoreSuperProperty;
exports.genStoreElement=genStoreElement;
exports.genStoreComputedProperty=genStoreComputedProperty;
exports.genStoreProperty=genStoreProperty;
exports.genConditionalOperation=genConditionalOperation;
exports.genConstruct=genConstruct;
exports.genAwait=genAwait;
exports.genBreak=genBreak;
exports.genConitnue=genConitnue;
exports.genBeginIf=genBeginIf;
exports.genEndIf=genEndIf;
exports.genBeginElse=genBeginElse;
exports.genThrowException=genThrowException;
exports.genYield=genYield;
exports.genBeginBlockStatement=genBeginBlockStatement;
exports.genEndBlockStatement=genEndBlockStatement;
exports.genBeginTry=genBeginTry;
exports.genBeginCatch=genBeginCatch;
exports.genBeginFinally=genBeginFinally;
exports.genEndTryCatch=genEndTryCatch;
exports.genBeginWhile=genBeginWhile;
exports.genEndWhile=genEndWhile;
exports.genEndDoWhile=genEndDoWhile;
exports.genBeginDoWhile=genBeginDoWhile;
exports.genBeginFor=genBeginFor;
exports.genEndFor=genEndFor;
exports.genEndForIn=genEndForIn;
exports.genBeginForIn=genBeginForIn;
exports.genBeginForOf=genBeginForOf;
exports.genEndForOf=genEndForOf;
exports.genCallComputedMethod=genCallComputedMethod;
exports.genCallMethod=genCallMethod;
exports.genLoadFloat=genLoadFloat;
exports.genDup=genDup;
exports.genContinue=genContinue;
// exports.genDeleteProperty=genDeleteProperty;
// exports.genDeleteElement=genDeleteElement;
// exports.genDeleteComputedProperty=genDeleteComputedProperty;
exports.genBeginArrowFunctionDefinition=genBeginArrowFunctionDefinition;
exports.genEndArrowFunctionDefinition=genEndArrowFunctionDefinition;

/**
 * @param {Node[]} IR
 * @param {Number[]} inoutList
 * @param {Boolean} async
 * @return {undefined}
 */
function genBeginArrowFunctionDefinition(
    IR, inoutList, async) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const signature=new proto.fuzzilli.protobuf.FunctionSignature();
  const outType=new proto.fuzzilli.protobuf.Type();
  const inTypeList=[];
  for (let i=0; i<inoutList.length-1; i++) {
    const inType=new proto.fuzzilli.protobuf.Type();
    inType.setPossibletype(256+2**31);
    inTypeList.push(inType);
  }
  outType.setDefinitetype(4095);
  outType.setPossibletype(4095);
  signature.setInputtypesList(inTypeList);
  signature.setOutputtype(outType);
  if (async==false) {
    const beginArrowFunctionDefinition=
      new proto.fuzzilli.protobuf.BeginArrowFunctionDefinition();
    beginArrowFunctionDefinition.setSignature(signature);
    inst.setBeginarrowfunctiondefinition(beginArrowFunctionDefinition);
  } else {
    const beginAsyncArrowFunctionDefinition=
      new proto.fuzzilli.protobuf.BeginAsyncArrowFunctionDefinition();
    beginAsyncArrowFunctionDefinition.setSignature(signature);
    inst.setBeginasyncarrowfunctiondefinition(
        beginAsyncArrowFunctionDefinition);
  }
  inst.setInoutsList(inoutList);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Boolean} async
 * @param {Boolean} generator
 * @return {undefined}
 */
function genEndArrowFunctionDefinition(IR, async) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  if (async==false) {
    const endArrowFunctionDefinition=
      new proto.fuzzilli.protobuf.EndArrowFunctionDefinition();
    inst.setEndarrowfunctiondefinition(endArrowFunctionDefinition);
  } else {
    const endAsyncArrowFunctionDefinition=
      new proto.fuzzilli.protobuf.EndAsyncArrowFunctionDefinition();
    inst.setEndasyncarrowfunctiondefinition(endAsyncArrowFunctionDefinition);
  }
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genContinue(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const continueOp=
    new proto.fuzzilli.protobuf.Continue();
  inst.setContinue(continueOp);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} id
 * @return {undefined}
 */
function genDup(IR, varNum, id) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const dup=
    new proto.fuzzilli.protobuf.Dup();
  inst.setDup(dup);
  inst.setInoutsList([id, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} value
 * @return {undefined}
 */
function genLoadFloat(IR, varNum, value) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadFloat=
    new proto.fuzzilli.protobuf.LoadFloat();
  loadFloat.setValue(value);
  inst.setLoadfloat(loadFloat);
  inst.setInoutsList([varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} objectName
 * @param {String} methodName
 * @param {Number[]} arguments
 * @return {undefined}
 */
function genCallMethod(IR, varNum, objectName, methodName, arguments) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const callMethod=
    new proto.fuzzilli.protobuf.CallMethod();
  callMethod.setMethodname(methodName);
  inst.setCallmethod(callMethod);
  inst.setInoutsList([objectName, ...arguments, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} objectName
 * @param {Number} methodName
 * @param {Number[]} arguments
 * @return {undefined}
 */
function genCallComputedMethod(IR, varNum, objectName, methodName, arguments) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const callComputedMethod=
    new proto.fuzzilli.protobuf.CallComputedMethod();
  inst.setCallcomputedmethod(callComputedMethod);
  inst.setInoutsList([objectName, methodName, ...arguments, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} lhs
 * @param {Number} rhs
 * @return {undefined}
 */
function genBeginForOf(IR, varNum, lhs, rhs) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const beginForOf=
    new proto.fuzzilli.protobuf.BeginForOf();
  inst.setBeginforof(beginForOf);
  inst.setInoutsList([rhs, lhs]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genEndForOf(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const endForOf=
    new proto.fuzzilli.protobuf.EndForOf();
  inst.setEndforof(endForOf);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} lhs
 * @param {Number} rhs
 * @return {undefined}
 */
function genBeginForIn(IR, varNum, lhs, rhs) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const beginForIn=
    new proto.fuzzilli.protobuf.BeginForIn();
  inst.setBeginforin(beginForIn);
  inst.setInoutsList([rhs, lhs]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genEndForIn(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const endForIn=
    new proto.fuzzilli.protobuf.EndForIn();
  inst.setEndforin(endForIn);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genEndFor(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const endFor=
    new proto.fuzzilli.protobuf.EndFor();
  inst.setEndfor(endFor);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} varNum
 * @param {Number} start
 * @return {undefined}
 */
function genBeginFor(IR, varNum, start) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const genBeginFor=
    new proto.fuzzilli.protobuf.BeginFor();
  genBeginFor.setComparator(proto.fuzzilli.protobuf.Comparator.EQUAL);
  genBeginFor.setOp(proto.fuzzilli.protobuf.BinaryOperator.LOGICAL_AND);
  inst.setBeginfor(genBeginFor);
  genLoadBoolean(IR, varNum, true);
  const trueOp=varNum[0]-1;
  const loopVar=varNum[0];
  varNum[0]+=1;
  inst.setInoutsList([start, trueOp, trueOp, loopVar]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genEndDoWhile(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const endDoWhile=
    new proto.fuzzilli.protobuf.EndDoWhile();
  inst.setEnddowhile(endDoWhile);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} lhs
 * @param {Number} rhs
 * @return {undefined}
 */
function genBeginDoWhile(IR, lhs, rhs) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const beginDoWhile=
    new proto.fuzzilli.protobuf.BeginDoWhile();
  beginDoWhile.setComparator(proto.fuzzilli.protobuf.Comparator.EQUAL);
  inst.setBegindowhile(beginDoWhile);
  inst.setInoutsList([lhs, rhs]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genEndWhile(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const endWhile=
    new proto.fuzzilli.protobuf.EndWhile();
  inst.setEndwhile(endWhile);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} lhs
 * @param {Number} rhs
 * @return {undefined}
 */
function genBeginWhile(IR, lhs, rhs) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const beginWhile=
    new proto.fuzzilli.protobuf.BeginWhile();
  beginWhile.setComparator(proto.fuzzilli.protobuf.Comparator.EQUAL);
  inst.setBeginwhile(beginWhile);
  inst.setInoutsList([lhs, rhs]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genBeginTry(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const beginTry=
    new proto.fuzzilli.protobuf.BeginTry();
  inst.setBegintry(beginTry);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @return {undefined}
 */
function genBeginCatch(IR, varNum) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const beginCatch=
    new proto.fuzzilli.protobuf.BeginCatch();
  inst.setBegincatch(beginCatch);
  inst.setInoutsList([varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genBeginFinally(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const beginFinally=
    new proto.fuzzilli.protobuf.BeginFinally();
  inst.setBeginfinally(beginFinally);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genEndTryCatch(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const endTryCatch=
    new proto.fuzzilli.protobuf.EndTryCatch();
  inst.setEndtrycatch(endTryCatch);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genEndBlockStatement(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const endBlockStatement=
    new proto.fuzzilli.protobuf.EndBlockStatement();
  inst.setEndblockstatement(endBlockStatement);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genBeginBlockStatement(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const beginBlockStatement=
    new proto.fuzzilli.protobuf.BeginBlockStatement();
  inst.setBeginblockstatement(beginBlockStatement);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} arg
 * @return {undefined}
 */
function genYield(IR, varNum, arg) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const yieldOp=
    new proto.fuzzilli.protobuf.Yield();
  inst.setYield(yieldOp);
  inst.setInoutsList([arg, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} arg
 * @return {undefined}
 */
function genThrowException(IR, arg) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const throwException=
    new proto.fuzzilli.protobuf.ThrowException();
  inst.setThrowexception(throwException);
  inst.setInoutsList([arg]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} test
 * @return {undefined}
 */
function genBeginIf(IR, test) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const beginIf=
    new proto.fuzzilli.protobuf.BeginIf();
  inst.setBeginif(beginIf);
  inst.setInoutsList([test]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genEndIf(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const endIF=
    new proto.fuzzilli.protobuf.EndIf();
  inst.setEndif(endIF);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genBeginElse(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const beginElse=
    new proto.fuzzilli.protobuf.BeginElse();
  inst.setBeginelse(beginElse);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}


/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genConitnue(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const continueOp=
    new proto.fuzzilli.protobuf.Continue();
  inst.setContinue(continueOp);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @return {undefined}
 */
function genBreak(IR) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const breakOP=
    new proto.fuzzilli.protobuf.Break();
  inst.setBreak(breakOP);
  inst.setInoutsList([]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number[]} argument
 * @return {undefined}
 */
function genAwait(IR, varNum, argument) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const awaitOp=
    new proto.fuzzilli.protobuf.Await();
  inst.setAwait(awaitOp);
  inst.setInoutsList([argument, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} callee
 * @param {Number[]} arguments
 * @return {undefined}
 */
function genConstruct(IR, varNum, callee, arguments) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const construct=
    new proto.fuzzilli.protobuf.Construct();
  inst.setConstruct(construct);
  inst.setInoutsList([callee, ...arguments, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} test
 * @param {Number} cons
 * @param {Number} alt
 * @return {undefined}
 */
function genConditionalOperation(IR, varNum, test, cons, alt) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const conditionalOperation=
    new proto.fuzzilli.protobuf.ConditionalOperation();
  inst.setConditionaloperation(conditionalOperation);
  inst.setInoutsList([test, cons, alt, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}
/**
 * @param {Node[]} IR
 * @param {String} propertyName
 * @param {Number} rhs
 * @return {undefined}
 */
function genStoreSuperProperty(IR, propertyName, rhs) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const storeSuperProperty=
    new proto.fuzzilli.protobuf.StoreSuperProperty();
  storeSuperProperty.setPropertyname(propertyName);
  inst.setStoresuperproperty(storeSuperProperty);
  inst.setInoutsList([rhs]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} objectId
 * @param {Number} index
 * @param {Number} rhs
 * @return {undefined}
 */
function genStoreElement(IR, objectId, index, rhs) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const storeElement=
    new proto.fuzzilli.protobuf.StoreElement();
  storeElement.setIndex(index);
  inst.setStoreelement(storeElement);
  inst.setInoutsList([objectId, rhs]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} objectId
 * @param {Number} propertyId
 * @param {Number} rhs
 * @return {undefined}
 */
function genStoreComputedProperty(IR, objectId, propertyId, rhs) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const storeComputedProperty=
    new proto.fuzzilli.protobuf.StoreComputedProperty();
  inst.setStorecomputedproperty(storeComputedProperty);
  inst.setInoutsList([objectId, propertyId, rhs]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} objectId
 * @param {Number} propertyName
 * @param {Number} rhs
 * @return {undefined}
 */
function genStoreProperty(IR, objectId, propertyName, rhs) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const storeProperty=
    new proto.fuzzilli.protobuf.StoreProperty();
  storeProperty.setPropertyname(propertyName);
  inst.setStoreproperty(storeProperty);
  inst.setInoutsList([objectId, rhs]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {String} propertyName
 * @return {undefined}
 */
function genLoadSuperProperty(IR, varNum, propertyName) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadSuperProperty=
    new proto.fuzzilli.protobuf.LoadSuperProperty();
  loadSuperProperty.setPropertyname(propertyName);
  inst.setLoadsuperproperty(loadSuperProperty);
  inst.setInoutsList([varNum[0]]);
  IR.push(inst);
  varNum[0]+=1;
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} objectId
 * @param {Number} index
 * @return {undefined}
 */
function genLoadElement(IR, varNum, objectId, index) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadElement=
    new proto.fuzzilli.protobuf.LoadElement();
  loadElement.setIndex(index);
  inst.setLoadelement(loadElement);
  inst.setInoutsList([objectId, varNum[0]]);
  IR.push(inst);
  varNum[0]+=1;
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} objectId
 * @param {Number} propertyId
 * @return {undefined}
 */
function genLoadComputedProperty(IR, varNum, objectId, propertyId) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadComputedproperty=
    new proto.fuzzilli.protobuf.LoadComputedProperty();
  inst.setLoadcomputedproperty(loadComputedproperty);
  inst.setInoutsList([objectId, propertyId, varNum[0]]);
  IR.push(inst);
  varNum[0]+=1;
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} argument
 * @param {string} op
 * @param {boolean} prefix
 * @return {undefined}
 */
function genUnaryOperation(IR, varNum, argument, op, prefix) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const unaryOperation=
    new proto.fuzzilli.protobuf.UnaryOperation();
  unaryOperation.setOp(operatorToUnaryOperator(op, prefix));
  inst.setUnaryoperation(unaryOperation);
  inst.setInoutsList([argument, varNum[0]]);
  IR.push(inst);
  varNum[0]+=1;
  return;
}

/**
 * @param {string} op
 * @param {boolean} prefix
 * @return {proto.fuzzilli.protobuf.UnaryOperator}
 */
function operatorToUnaryOperator(op, prefix) {
  switch (op) {
    case '!':
      return proto.fuzzilli.protobuf.UnaryOperator.LOGICAL_NOT;
    case '~':
      return proto.fuzzilli.protobuf.UnaryOperator.BITWISE_NOT;
    case '+':
      return proto.fuzzilli.protobuf.UnaryOperator.PLUS;
    case '-':
      return proto.fuzzilli.protobuf.UnaryOperator.MINUS;
    case '++':
      if (prefix==true) {
        return proto.fuzzilli.protobuf.UnaryOperator.PRE_INC;
      } else {
        return proto.fuzzilli.protobuf.UnaryOperator.POST_INC;
      }
    case '--':
      if (prefix==true) {
        return proto.fuzzilli.protobuf.UnaryOperator.PRE_DEC;
      } else {
        return proto.fuzzilli.protobuf.UnaryOperator.POST_DEC;
      }
    default:
      throw new Error();
  }
}

/**
 * @param {Node[]} IR
 * @param {Number} lhs
 * @param {Number} rhs
 * @param {string} op
 * @return {undefined}
 */
function genBinaryOperationAndReassign(IR, lhs, rhs, op) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const binaryOperationAndReassign=
    new proto.fuzzilli.protobuf.BinaryOperationAndReassign();
  binaryOperationAndReassign.setOp(operatorToProtoOperator(op.slice(0, -1)));
  inst.setBinaryoperationandreassign(binaryOperationAndReassign);
  inst.setInoutsList([lhs, rhs]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} varNum
 * @param {Number} argument
 * @return {undefined}
 */
function genTypeOf(IR, varNum, argument) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const typeOf=
    new proto.fuzzilli.protobuf.TypeOf();
  inst.setTypeof(typeOf);
  inst.setInoutsList([argument, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} varNum
 * @param {String[]} propertyNames
 * @param {Number[]} propertyValues
 * @return {undefined}
 */
function genCreateObject(IR, varNum, propertyNames, propertyValues) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const createObject=
    new proto.fuzzilli.protobuf.CreateObject();
  createObject.setPropertynamesList(propertyNames);
  inst.setCreateobject(createObject);
  inst.setInoutsList(propertyValues.concat(varNum[0]));
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} varNum
 * @param {String[]} propertyNames
 * @param {Number[]} propertyValues
 * @param {Number[]} spreads
 * @return {undefined}
 */
function genCreateObjectWithSpread(
    IR, varNum, propertyNames, propertyValues, spreads) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const createObjectWithSpread=
    new proto.fuzzilli.protobuf.CreateObjectWithSpread();
  createObjectWithSpread.setPropertynamesList(propertyNames);
  inst.setCreateobjectwithspread(createObjectWithSpread);
  inst.setInoutsList(propertyValues.concat(spreads, varNum[0]));
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} varNum
 * @param {Number} lhs
 * @param {Number} rhs
 * @param {string} op
 * @return {undefined}
 */
function genInstanceOf(IR, varNum, lhs, rhs) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const instanceOf=
    new proto.fuzzilli.protobuf.InstanceOf();
  inst.setInstanceof(instanceOf);
  inst.setInoutsList([lhs, rhs, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} varNum
 * @param {Number} lhs
 * @param {Number} rhs
 * @param {string} op
 * @return {undefined}
 */
function genIn(IR, varNum, lhs, rhs) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const inOp=
    new proto.fuzzilli.protobuf.In();
  inst.setIn(inOp);
  inst.setInoutsList([lhs, rhs, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}


/**
 * @param {Node[]} IR
 * @param {Number} varNum
 * @param {Number} lhs
 * @param {Number} rhs
 * @param {string} op
 * @return {undefined}
 */
function genCompare(IR, varNum, lhs, rhs, op) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const compare=
    new proto.fuzzilli.protobuf.Compare();
  compare.setOp(operatorToComparator(op));
  inst.setCompare(compare);
  inst.setInoutsList([lhs, rhs, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {string} op
 * @return {proto.fuzzilli.protobuf.Comparator}
 */
function operatorToComparator(op) {
  switch (op) {
    case '==':
      return proto.fuzzilli.protobuf.Comparator.EQUAL;
    case '===':
      return proto.fuzzilli.protobuf.Comparator.STRICT_EQUAL;
    case '!=':
      return proto.fuzzilli.protobuf.Comparator.NOT_EQUAL;
    case '!==':
      return proto.fuzzilli.protobuf.Comparator.STRICT_NOT_EQUAL;
    case '<':
      return proto.fuzzilli.protobuf.Comparator.LESS_THAN;
    case '<=':
      return proto.fuzzilli.protobuf.Comparator.LESS_THAN_OR_EQUAL;
    case '>':
      return proto.fuzzilli.protobuf.Comparator.GREATER_THAN;
    case '>=':
      return proto.fuzzilli.protobuf.Comparator.GREATER_THAN_OR_EQUAL;
  }
}


/**
 * @param {Node[]} IR
 * @param {Number} varNum
 * @param {Number} lhs
 * @param {Number} rhs
 * @param {string} op
 * @return {undefined}
 */
function genBinaryOperation(IR, varNum, lhs, rhs, op) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const binaryOperation=
    new proto.fuzzilli.protobuf.BinaryOperation();
  binaryOperation.setOp(operatorToProtoOperator(op));
  inst.setBinaryoperation(binaryOperation);
  inst.setInoutsList([lhs, rhs, varNum[0]]);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {string} op
 * @return {proto.fuzzilli.protobuf.BinaryOperator}
 */
function operatorToProtoOperator(op) {
  switch (op) {
    case '+':
      return proto.fuzzilli.protobuf.BinaryOperator.ADD;
    case '-':
      return proto.fuzzilli.protobuf.BinaryOperator.SUB;
    case '*':
      return proto.fuzzilli.protobuf.BinaryOperator.MUL;
    case '/':
      return proto.fuzzilli.protobuf.BinaryOperator.DIV;
    case '%':
      return proto.fuzzilli.protobuf.BinaryOperator.MOD;
    case '**':
      return proto.fuzzilli.protobuf.BinaryOperator.EXP;
    case '|':
      return proto.fuzzilli.protobuf.BinaryOperator.BIT_OR;
    case '^':
      return proto.fuzzilli.protobuf.BinaryOperator.XOR;
    case '&':
      return proto.fuzzilli.protobuf.BinaryOperator.BIT_AND;
    case '<<':
      return proto.fuzzilli.protobuf.BinaryOperator.LSHIFT;
    case '>>':
      return proto.fuzzilli.protobuf.BinaryOperator.RSHIFT;
    case '>>>':
      return proto.fuzzilli.protobuf.BinaryOperator.UNRSHIFT;
    case '||':
      return proto.fuzzilli.protobuf.BinaryOperator.LOGICAL_OR;
    case '&&':
      return proto.fuzzilli.protobuf.BinaryOperator.LOGICAL_AND;
  }
}

/**
 * @param {Node[]} IR
 * @param {Number} varId
 * @return {undefined}
 */
function genReturn(IR, varId) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const ret=new proto.fuzzilli.protobuf.Return();
  inst.setReturn(ret);
  inst.setInoutsList([varId]);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number} lhs
 * @param {Number} rhs
 * @return {undefined}
 */
function genReassign(IR, lhs, rhs) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const reassign=
    new proto.fuzzilli.protobuf.Reassign();
  inst.setReassign(reassign);
  inst.setInoutsList([lhs, rhs]);
  IR.push(inst);
  return;
}


/**
 * @param {Node[]} IR
 * @param {Boolean} async
 * @param {Boolean} generator
 * @return {undefined}
 */
function genEndAnyFunctionDefinition(IR, async, generator) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  if (async==false&&generator==false) {
    const endFunctionDefination=
      new proto.fuzzilli.protobuf.EndPlainFunctionDefinition();
    inst.setEndplainfunctiondefinition(endFunctionDefination);
  } else if (async==true&&generator==false) {
    const endFunctionDefination=
      new proto.fuzzilli.protobuf.EndAsyncFunctionDefinition();
    inst.setEndasyncfunctiondefinition(endFunctionDefination);
  } else if (async==false&&generator==true) {
    const endFunctionDefination=
      new proto.fuzzilli.protobuf.EndGeneratorFunctionDefinition();
    inst.setEndgeneratorfunctiondefinition(endFunctionDefination);
  } else {
    const endFunctionDefination=
      new proto.fuzzilli.protobuf.EndAsyncGeneratorFunctionDefinition();
    inst.setEndasyncgeneratorfunctiondefinition(endFunctionDefination);
  }
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} objectId
 * @param {String} propertyName
 * @return {undefined}
 */
function genLoadProperty(IR, varNum, objectId, propertyName) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadProperty=
    new proto.fuzzilli.protobuf.LoadProperty();
  loadProperty.setPropertyname(propertyName);
  inst.setLoadproperty(loadProperty);
  inst.setInoutsList([objectId, varNum[0]]);
  varNum[0]=varNum[0]+1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {String} name
 * @return {undefined}
 */
function genLoadBuiltin(IR, varNum, name) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadBuiltin=
    new proto.fuzzilli.protobuf.LoadBuiltin();
  loadBuiltin.setBuiltinname(name);
  inst.setLoadbuiltin(loadBuiltin);
  inoutList=[varNum[0]];
  inst.setInoutsList(inoutList);
  varNum[0]=varNum[0]+1;
  IR.push(inst);
  return;
}


/**
 * @param {Node[]} IR
 * @param {Number[]} inoutList
 * @param {Boolean} async
 * @param {Boolean} generator
 * @param {Boolean} hasRestElement
 * @return {undefined}
 */
function genBeginAnyFunctionDefinition(
    IR, inoutList, async, generator, hasRestElement) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const signature=new proto.fuzzilli.protobuf.FunctionSignature();
  const outType=new proto.fuzzilli.protobuf.Type();
  const inTypeList=[];
  for (let i=0; i<inoutList.length-1; i++) {
    const inType=new proto.fuzzilli.protobuf.Type();
    inType.setPossibletype(256+2**31);
    if (hasRestElement&&(i==inoutList.length-2)) {
      inType.setDefinitetype(2**31);
    }
    inTypeList.push(inType);
  }
  outType.setDefinitetype(4095);
  outType.setPossibletype(4095);
  signature.setInputtypesList(inTypeList);
  signature.setOutputtype(outType);
  if (async==false&&generator==false) {
    const beginFunctionDefinition=
      new proto.fuzzilli.protobuf.BeginPlainFunctionDefinition();
    beginFunctionDefinition.setSignature(signature);
    inst.setBeginplainfunctiondefinition(beginFunctionDefinition);
  } else if (async==true&&generator==false) {
    const beginFunctionDefinition=
      new proto.fuzzilli.protobuf.BeginAsyncFunctionDefinition();
    beginFunctionDefinition.setSignature(signature);
    inst.setBeginasyncfunctiondefinition(beginFunctionDefinition);
  } else if (async==false&&generator==true) {
    const beginFunctionDefinition=
      new proto.fuzzilli.protobuf.BeginGeneratorFunctionDefinition();
    beginFunctionDefinition.setSignature(signature);
    inst.setBegingeneratorfunctiondefinition(beginFunctionDefinition);
  } else {
    const beginFunctionDefinition=
      new proto.fuzzilli.protobuf.BeginAsyncGeneratorFunctionDefinition();
    beginFunctionDefinition.setSignature(signature);
    inst.setBeginasyncgeneratorfunctiondefinition(beginFunctionDefinition);
  }
  inst.setInoutsList(inoutList);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @return {undefined}
 */
function genLoadUndefined(IR, varNum) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadUndefined=new proto.fuzzilli.protobuf.LoadUndefined();
  inst.setLoadundefined(loadUndefined);
  inoutList=[varNum[0]];
  inst.setInoutsList(inoutList);
  varNum[0]=varNum[0]+1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} value
 * @return {undefined}
 */
function genLoadInteger(IR, varNum, value) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadInteger=
    new proto.fuzzilli.protobuf.LoadInteger();
  loadInteger.setValue(value);
  const inoutList=[varNum[0]];
  inst.setLoadinteger(loadInteger);
  inst.setInoutsList(inoutList);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Boolean} value
 * @return {undefined}
 */
function genLoadBoolean(IR, varNum, value) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadBoolean=
    new proto.fuzzilli.protobuf.LoadBoolean();
  loadBoolean.setValue(value);
  const inoutList=[varNum[0]];
  inst.setLoadboolean(loadBoolean);
  inst.setInoutsList(inoutList);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} value
 * @return {undefined}
 */
function genLoadString(IR, varNum, value) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadString=
    new proto.fuzzilli.protobuf.LoadString();
  loadString.setValue(value);
  const inoutList=[varNum[0]];
  inst.setLoadstring(loadString);
  inst.setInoutsList(inoutList);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} value
 * @return {undefined}
 */
function genLoadBigInt(IR, varNum, value) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadBigInt=
    new proto.fuzzilli.protobuf.LoadBigInt();
  loadBigInt.setValue(Number(value));
  const inoutList=[varNum[0]];
  inst.setLoadbigint(loadBigInt);
  inst.setInoutsList(inoutList);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @return {undefined}
 */
function genLoadNull(IR, varNum) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadNull=
    new proto.fuzzilli.protobuf.LoadNull();
  const inoutList=[varNum[0]];
  inst.setLoadnull(loadNull);
  inst.setInoutsList(inoutList);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} value
 * @return {undefined}
 */
function genLoadRegExp(IR, varNum, value) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const loadRegExp=
    new proto.fuzzilli.protobuf.LoadRegExp();
  loadRegExp.setValue(value.source);
  let regExpFlags=0;
  if (value.ignoreCase) regExpFlags+=1;
  if (value.global) regExpFlags+=2;
  if (value.multiline) regExpFlags+=4;
  if (value.dotAll) regExpFlags+=8;
  if (value.unicode) regExpFlags+=16;
  if (value.sticky) regExpFlags+=32;
  loadRegExp.setFlags(regExpFlags);
  const inoutList=[varNum[0]];
  inst.setLoadregexp(loadRegExp);
  inst.setInoutsList(inoutList);
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} callee
 * @param {Number[]} arguments
 * @return {undefined}
 */
function genCallFunction(IR, varNum, callee, arguments) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const callFunction=
    new proto.fuzzilli.protobuf.CallFunction();
  const inoutList=[callee].concat(arguments);
  inst.setCallfunction(callFunction);
  inoutList.push(varNum[0]);
  varNum[0]+=1;
  inst.setInoutsList(inoutList);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number} callee
 * @param {Number[]} arguments
 * @param {Boolean[]} spreads
 * @return {undefined}
 */
function genCallFunctionWithSpread(IR, varNum, callee, arguments, spreads) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const callFunctionWithSpread=
    new proto.fuzzilli.protobuf.CallFunctionWithSpread();
  callFunctionWithSpread.setSpreadsList(spreads);
  const inoutList=[callee].concat(arguments);
  inst.setCallfunctionwithspread(callFunctionWithSpread);
  inoutList.push(varNum[0]);
  varNum[0]+=1;
  inst.setInoutsList(inoutList);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number[]} arguments
 * @return {undefined}
 */
function genCallSuperConstructor(IR, varNum, arguments) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const callSuperConstructor=
    new proto.fuzzilli.protobuf.CallSuperConstructor();
  inst.setCallsuperconstructor(callSuperConstructor);
  inst.setInoutsList(arguments);
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number[]} arrayElements
 * @param {Boolean[]} spreads
 * @return {undefined}
 */
function genCreateArrayWithSpread(IR, varNum, arrayElements, spreads) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const createArrayWithSpread=
    new proto.fuzzilli.protobuf.CreateArrayWithSpread();
  createArrayWithSpread.setSpreadsList(spreads);
  inst.setCreatearraywithspread(createArrayWithSpread);
  inst.setInoutsList(arrayElements.concat(varNum[0]));
  varNum[0]+=1;
  IR.push(inst);
  return;
}

/**
 * @param {Node[]} IR
 * @param {Number[]} varNum
 * @param {Number[]} arrayElements
 * @return {undefined}
 */
function genCreateArray(IR, varNum, arrayElements) {
  const inst=new proto.fuzzilli.protobuf.Instruction();
  const createArray=
    new proto.fuzzilli.protobuf.CreateArray();
  inst.setCreatearray(createArray);
  inst.setInoutsList(arrayElements.concat(varNum[0]));
  varNum[0]+=1;
  IR.push(inst);
  return;
}
