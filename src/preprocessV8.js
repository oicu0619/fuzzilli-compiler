exports.preprocess=preprocess;
/**
 * on stack replacement of AST, attach symtab keys on AST.
 * for base scope, the symtab will be attached to the stmtList(not elegant)
 * for other scope, the symtab will be attached to the node, such as BlockStmt
 * @param {String} js
 * @return {String}
 */
function preprocess(js) {
  // eslint-disable-next-line max-len
  const builtinReg=/(%ArrayIncludes_Slow|%_ArrayIncludes_Slow|%ArrayIndexOf|%_ArrayIndexOf|%ArrayIsArray|%_ArrayIsArray|%ArraySpeciesConstructor|%_ArraySpeciesConstructor|%GrowArrayElements|%_GrowArrayElements|%IsArray|%_IsArray|%NewArray|%_NewArray|%NormalizeElements|%_NormalizeElements|%TransitionElementsKind|%_TransitionElementsKind|%TransitionElementsKindWithKind|%_TransitionElementsKindWithKind|%AtomicsLoad64|%_AtomicsLoad64|%AtomicsStore64|%_AtomicsStore64|%AtomicsAdd|%_AtomicsAdd|%AtomicsAnd|%_AtomicsAnd|%AtomicsCompareExchange|%_AtomicsCompareExchange|%AtomicsExchange|%_AtomicsExchange|%AtomicsNumWaitersForTesting|%_AtomicsNumWaitersForTesting|%AtomicsNumAsyncWaitersForTesting|%_AtomicsNumAsyncWaitersForTesting|%AtomicsNumUnresolvedAsyncPromisesForTesting|%_AtomicsNumUnresolvedAsyncPromisesForTesting|%AtomicsOr|%_AtomicsOr|%AtomicsSub|%_AtomicsSub|%AtomicsXor|%_AtomicsXor|%SetAllowAtomicsWait|%_SetAllowAtomicsWait|%BigIntBinaryOp|%_BigIntBinaryOp|%BigIntCompareToBigInt|%_BigIntCompareToBigInt|%BigIntCompareToNumber|%_BigIntCompareToNumber|%BigIntCompareToString|%_BigIntCompareToString|%BigIntEqualToBigInt|%_BigIntEqualToBigInt|%BigIntEqualToNumber|%_BigIntEqualToNumber|%BigIntEqualToString|%_BigIntEqualToString|%BigIntToBoolean|%_BigIntToBoolean|%BigIntToNumber|%_BigIntToNumber|%BigIntUnaryOp|%_BigIntUnaryOp|%ToBigInt|%_ToBigInt|%DefineClass|%_DefineClass|%LoadFromSuper|%_LoadFromSuper|%LoadKeyedFromSuper|%_LoadKeyedFromSuper|%StoreKeyedToSuper|%_StoreKeyedToSuper|%StoreToSuper|%_StoreToSuper|%ThrowConstructorNonCallableError|%_ThrowConstructorNonCallableError|%ThrowNotSuperConstructor|%_ThrowNotSuperConstructor|%ThrowStaticPrototypeError|%_ThrowStaticPrototypeError|%ThrowSuperAlreadyCalledError|%_ThrowSuperAlreadyCalledError|%ThrowSuperNotCalled|%_ThrowSuperNotCalled|%ThrowUnsupportedSuperError|%_ThrowUnsupportedSuperError|%MapGrow|%_MapGrow|%MapShrink|%_MapShrink|%SetGrow|%_SetGrow|%SetShrink|%_SetShrink|%TheHole|%_TheHole|%WeakCollectionDelete|%_WeakCollectionDelete|%WeakCollectionSet|%_WeakCollectionSet|%CompileForOnStackReplacement|%_CompileForOnStackReplacement|%CompileLazy|%_CompileLazy|%CompileBaseline|%_CompileBaseline|%CompileOptimized_Concurrent|%_CompileOptimized_Concurrent|%CompileOptimized_NotConcurrent|%_CompileOptimized_NotConcurrent|%InstallBaselineCode|%_InstallBaselineCode|%HealOptimizedCodeSlot|%_HealOptimizedCodeSlot|%FunctionFirstExecution|%_FunctionFirstExecution|%InstantiateAsmJs|%_InstantiateAsmJs|%NotifyDeoptimized|%_NotifyDeoptimized|%ObserveNode|%_ObserveNode|%ResolvePossiblyDirectEval|%_ResolvePossiblyDirectEval|%VerifyType|%_VerifyType|%DateCurrentTime|%_DateCurrentTime|%ClearStepping|%_ClearStepping|%CollectGarbage|%_CollectGarbage|%DebugAsyncFunctionEntered|%_DebugAsyncFunctionEntered|%DebugAsyncFunctionSuspended|%_DebugAsyncFunctionSuspended|%DebugAsyncFunctionResumed|%_DebugAsyncFunctionResumed|%DebugAsyncFunctionFinished|%_DebugAsyncFunctionFinished|%DebugBreakAtEntry|%_DebugBreakAtEntry|%DebugCollectCoverage|%_DebugCollectCoverage|%DebugGetLoadedScriptIds|%_DebugGetLoadedScriptIds|%DebugOnFunctionCall|%_DebugOnFunctionCall|%DebugPopPromise|%_DebugPopPromise|%DebugPrepareStepInSuspendedGenerator|%_DebugPrepareStepInSuspendedGenerator|%DebugPushPromise|%_DebugPushPromise|%DebugToggleBlockCoverage|%_DebugToggleBlockCoverage|%DebugTogglePreciseCoverage|%_DebugTogglePreciseCoverage|%FunctionGetInferredName|%_FunctionGetInferredName|%GetBreakLocations|%_GetBreakLocations|%GetGeneratorScopeCount|%_GetGeneratorScopeCount|%GetGeneratorScopeDetails|%_GetGeneratorScopeDetails|%HandleDebuggerStatement|%_HandleDebuggerStatement|%IsBreakOnException|%_IsBreakOnException|%LiveEditPatchScript|%_LiveEditPatchScript|%ProfileCreateSnapshotDataBlob|%_ProfileCreateSnapshotDataBlob|%ScheduleBreak|%_ScheduleBreak|%ScriptLocationFromLine2|%_ScriptLocationFromLine2|%SetGeneratorScopeVariableValue|%_SetGeneratorScopeVariableValue|%IncBlockCounter|%_IncBlockCounter|%ForInEnumerate|%_ForInEnumerate|%ForInHasProperty|%_ForInHasProperty|%TraceUnoptimizedBytecodeEntry|%_TraceUnoptimizedBytecodeEntry|%TraceUnoptimizedBytecodeExit|%_TraceUnoptimizedBytecodeExit|%TraceUpdateFeedback|%_TraceUpdateFeedback|%Call|%_Call|%FunctionGetScriptSource|%_FunctionGetScriptSource|%FunctionGetScriptId|%_FunctionGetScriptId|%FunctionGetScriptSourcePosition|%_FunctionGetScriptSourcePosition|%FunctionGetSourceCode|%_FunctionGetSourceCode|%FunctionIsAPIFunction|%_FunctionIsAPIFunction|%IsFunction|%_IsFunction|%AsyncFunctionAwaitCaught|%_AsyncFunctionAwaitCaught|%AsyncFunctionAwaitUncaught|%_AsyncFunctionAwaitUncaught|%AsyncFunctionEnter|%_AsyncFunctionEnter|%AsyncFunctionReject|%_AsyncFunctionReject|%AsyncFunctionResolve|%_AsyncFunctionResolve|%AsyncGeneratorAwaitCaught|%_AsyncGeneratorAwaitCaught|%AsyncGeneratorAwaitUncaught|%_AsyncGeneratorAwaitUncaught|%AsyncGeneratorHasCatchHandlerForPC|%_AsyncGeneratorHasCatchHandlerForPC|%AsyncGeneratorReject|%_AsyncGeneratorReject|%AsyncGeneratorResolve|%_AsyncGeneratorResolve|%AsyncGeneratorYield|%_AsyncGeneratorYield|%CreateJSGeneratorObject|%_CreateJSGeneratorObject|%GeneratorClose|%_GeneratorClose|%GeneratorGetFunction|%_GeneratorGetFunction|%GeneratorGetResumeMode|%_GeneratorGetResumeMode|%FormatList|%_FormatList|%FormatListToParts|%_FormatListToParts|%StringToLowerCaseIntl|%_StringToLowerCaseIntl|%StringToUpperCaseIntl|%_StringToUpperCaseIntl|%AccessCheck|%_AccessCheck|%AllocateByteArray|%_AllocateByteArray|%AllocateInYoungGeneration|%_AllocateInYoungGeneration|%AllocateInOldGeneration|%_AllocateInOldGeneration|%AllocateSeqOneByteString|%_AllocateSeqOneByteString|%AllocateSeqTwoByteString|%_AllocateSeqTwoByteString|%AllowDynamicFunction|%_AllowDynamicFunction|%CreateAsyncFromSyncIterator|%_CreateAsyncFromSyncIterator|%CreateListFromArrayLike|%_CreateListFromArrayLike|%DoubleToStringWithRadix|%_DoubleToStringWithRadix|%FatalProcessOutOfMemoryInAllocateRaw|%_FatalProcessOutOfMemoryInAllocateRaw|%FatalProcessOutOfMemoryInvalidArrayLength|%_FatalProcessOutOfMemoryInvalidArrayLength|%GetAndResetRuntimeCallStats|%_GetAndResetRuntimeCallStats|%GetTemplateObject|%_GetTemplateObject|%IncrementUseCounter|%_IncrementUseCounter|%BytecodeBudgetInterruptFromBytecode|%_BytecodeBudgetInterruptFromBytecode|%BytecodeBudgetInterruptFromCode|%_BytecodeBudgetInterruptFromCode|%NewError|%_NewError|%NewReferenceError|%_NewReferenceError|%NewSyntaxError|%_NewSyntaxError|%NewTypeError|%_NewTypeError|%OrdinaryHasInstance|%_OrdinaryHasInstance|%PromoteScheduledException|%_PromoteScheduledException|%ReportMessageFromMicrotask|%_ReportMessageFromMicrotask|%ReThrow|%_ReThrow|%RunMicrotaskCallback|%_RunMicrotaskCallback|%PerformMicrotaskCheckpoint|%_PerformMicrotaskCheckpoint|%StackGuard|%_StackGuard|%StackGuardWithGap|%_StackGuardWithGap|%Throw|%_Throw|%ThrowApplyNonFunction|%_ThrowApplyNonFunction|%ThrowCalledNonCallable|%_ThrowCalledNonCallable|%ThrowConstructedNonConstructable|%_ThrowConstructedNonConstructable|%ThrowConstructorReturnedNonObject|%_ThrowConstructorReturnedNonObject|%ThrowInvalidStringLength|%_ThrowInvalidStringLength|%ThrowInvalidTypedArrayAlignment|%_ThrowInvalidTypedArrayAlignment|%ThrowIteratorError|%_ThrowIteratorError|%ThrowSpreadArgError|%_ThrowSpreadArgError|%ThrowIteratorResultNotAnObject|%_ThrowIteratorResultNotAnObject|%ThrowNotConstructor|%_ThrowNotConstructor|%ThrowPatternAssignmentNonCoercible|%_ThrowPatternAssignmentNonCoercible|%ThrowRangeError|%_ThrowRangeError|%ThrowReferenceError|%_ThrowReferenceError|%ThrowAccessedUninitializedVariable|%_ThrowAccessedUninitializedVariable|%ThrowStackOverflow|%_ThrowStackOverflow|%ThrowSymbolAsyncIteratorInvalid|%_ThrowSymbolAsyncIteratorInvalid|%ThrowSymbolIteratorInvalid|%_ThrowSymbolIteratorInvalid|%ThrowThrowMethodMissing|%_ThrowThrowMethodMissing|%ThrowTypeError|%_ThrowTypeError|%ThrowTypeErrorIfStrict|%_ThrowTypeErrorIfStrict|%Typeof|%_Typeof|%UnwindAndFindExceptionHandler|%_UnwindAndFindExceptionHandler|%CreateArrayLiteral|%_CreateArrayLiteral|%CreateArrayLiteralWithoutAllocationSite|%_CreateArrayLiteralWithoutAllocationSite|%CreateObjectLiteral|%_CreateObjectLiteral|%CreateObjectLiteralWithoutAllocationSite|%_CreateObjectLiteralWithoutAllocationSite|%CreateRegExpLiteral|%_CreateRegExpLiteral|%DynamicImportCall|%_DynamicImportCall|%GetImportMetaObject|%_GetImportMetaObject|%GetModuleNamespace|%_GetModuleNamespace|%ArrayBufferMaxByteLength|%_ArrayBufferMaxByteLength|%GetHoleNaNLower|%_GetHoleNaNLower|%GetHoleNaNUpper|%_GetHoleNaNUpper|%IsSmi|%_IsSmi|%MaxSmi|%_MaxSmi|%NumberToStringSlow|%_NumberToStringSlow|%StringParseFloat|%_StringParseFloat|%StringParseInt|%_StringParseInt|%StringToNumber|%_StringToNumber|%TypedArrayMaxLength|%_TypedArrayMaxLength|%AddDictionaryProperty|%_AddDictionaryProperty|%AddPrivateField|%_AddPrivateField|%AddPrivateBrand|%_AddPrivateBrand|%AllocateHeapNumber|%_AllocateHeapNumber|%CollectTypeProfile|%_CollectTypeProfile|%CompleteInobjectSlackTrackingForMap|%_CompleteInobjectSlackTrackingForMap|%CopyDataProperties|%_CopyDataProperties|%CopyDataPropertiesWithExcludedProperties|%_CopyDataPropertiesWithExcludedProperties|%CreateDataProperty|%_CreateDataProperty|%CreateIterResultObject|%_CreateIterResultObject|%CreatePrivateAccessors|%_CreatePrivateAccessors|%DefineAccessorPropertyUnchecked|%_DefineAccessorPropertyUnchecked|%DefineDataPropertyInLiteral|%_DefineDataPropertyInLiteral|%DefineGetterPropertyUnchecked|%_DefineGetterPropertyUnchecked|%DefineSetterPropertyUnchecked|%_DefineSetterPropertyUnchecked|%DeleteProperty|%_DeleteProperty|%GetDerivedMap|%_GetDerivedMap|%GetFunctionName|%_GetFunctionName|%GetOwnPropertyDescriptor|%_GetOwnPropertyDescriptor|%GetOwnPropertyKeys|%_GetOwnPropertyKeys|%GetProperty|%_GetProperty|%HasFastPackedElements|%_HasFastPackedElements|%HasInPrototypeChain|%_HasInPrototypeChain|%HasProperty|%_HasProperty|%InternalSetPrototype|%_InternalSetPrototype|%IsJSReceiver|%_IsJSReceiver|%JSReceiverPreventExtensionsDontThrow|%_JSReceiverPreventExtensionsDontThrow|%JSReceiverPreventExtensionsThrow|%_JSReceiverPreventExtensionsThrow|%JSReceiverGetPrototypeOf|%_JSReceiverGetPrototypeOf|%JSReceiverSetPrototypeOfDontThrow|%_JSReceiverSetPrototypeOfDontThrow|%JSReceiverSetPrototypeOfThrow|%_JSReceiverSetPrototypeOfThrow|%LoadPrivateGetter|%_LoadPrivateGetter|%LoadPrivateSetter|%_LoadPrivateSetter|%NewObject|%_NewObject|%ObjectCreate|%_ObjectCreate|%ObjectEntries|%_ObjectEntries|%ObjectEntriesSkipFastPath|%_ObjectEntriesSkipFastPath|%ObjectGetOwnPropertyNames|%_ObjectGetOwnPropertyNames|%ObjectGetOwnPropertyNamesTryFast|%_ObjectGetOwnPropertyNamesTryFast|%ObjectHasOwnProperty|%_ObjectHasOwnProperty|%ObjectIsExtensible|%_ObjectIsExtensible|%ObjectKeys|%_ObjectKeys|%ObjectValues|%_ObjectValues|%ObjectValuesSkipFastPath|%_ObjectValuesSkipFastPath|%OptimizeObjectForAddingMultipleProperties|%_OptimizeObjectForAddingMultipleProperties|%SetDataProperties|%_SetDataProperties|%SetKeyedProperty|%_SetKeyedProperty|%SetNamedProperty|%_SetNamedProperty|%SetOwnPropertyIgnoreAttributes|%_SetOwnPropertyIgnoreAttributes|%StoreDataPropertyInLiteral|%_StoreDataPropertyInLiteral|%ShrinkNameDictionary|%_ShrinkNameDictionary|%ShrinkSwissNameDictionary|%_ShrinkSwissNameDictionary|%ToFastProperties|%_ToFastProperties|%ToLength|%_ToLength|%ToName|%_ToName|%ToNumber|%_ToNumber|%ToNumeric|%_ToNumeric|%ToObject|%_ToObject|%ToString|%_ToString|%TryMigrateInstance|%_TryMigrateInstance|%SwissTableAdd|%_SwissTableAdd|%SwissTableAllocate|%_SwissTableAllocate|%SwissTableDelete|%_SwissTableDelete|%SwissTableDetailsAt|%_SwissTableDetailsAt|%SwissTableElementsCount|%_SwissTableElementsCount|%SwissTableEquals|%_SwissTableEquals|%SwissTableFindEntry|%_SwissTableFindEntry|%SwissTableUpdate|%_SwissTableUpdate|%SwissTableValueAt|%_SwissTableValueAt|%SwissTableKeyAt|%_SwissTableKeyAt|%Add|%_Add|%Equal|%_Equal|%GreaterThan|%_GreaterThan|%GreaterThanOrEqual|%_GreaterThanOrEqual|%LessThan|%_LessThan|%LessThanOrEqual|%_LessThanOrEqual|%NotEqual|%_NotEqual|%StrictEqual|%_StrictEqual|%StrictNotEqual|%_StrictNotEqual|%ReferenceEqual|%_ReferenceEqual|%EnqueueMicrotask|%_EnqueueMicrotask|%PromiseHookAfter|%_PromiseHookAfter|%PromiseHookBefore|%_PromiseHookBefore|%PromiseHookInit|%_PromiseHookInit|%AwaitPromisesInit|%_AwaitPromisesInit|%AwaitPromisesInitOld|%_AwaitPromisesInitOld|%PromiseMarkAsHandled|%_PromiseMarkAsHandled|%PromiseRejectEventFromStack|%_PromiseRejectEventFromStack|%PromiseRevokeReject|%_PromiseRevokeReject|%PromiseStatus|%_PromiseStatus|%RejectPromise|%_RejectPromise|%ResolvePromise|%_ResolvePromise|%PromiseRejectAfterResolved|%_PromiseRejectAfterResolved|%PromiseResolveAfterResolved|%_PromiseResolveAfterResolved|%ConstructAggregateErrorHelper|%_ConstructAggregateErrorHelper|%ConstructInternalAggregateErrorHelper|%_ConstructInternalAggregateErrorHelper|%CheckProxyGetSetTrapResult|%_CheckProxyGetSetTrapResult|%CheckProxyHasTrapResult|%_CheckProxyHasTrapResult|%CheckProxyDeleteTrapResult|%_CheckProxyDeleteTrapResult|%GetPropertyWithReceiver|%_GetPropertyWithReceiver|%IsJSProxy|%_IsJSProxy|%JSProxyGetHandler|%_JSProxyGetHandler|%JSProxyGetTarget|%_JSProxyGetTarget|%SetPropertyWithReceiver|%_SetPropertyWithReceiver|%IsRegExp|%_IsRegExp|%RegExpBuildIndices|%_RegExpBuildIndices|%RegExpExec|%_RegExpExec|%RegExpExecTreatMatchAtEndAsFailure|%_RegExpExecTreatMatchAtEndAsFailure|%RegExpExperimentalOneshotExec|%_RegExpExperimentalOneshotExec|%RegExpExperimentalOneshotExecTreatMatchAtEndAsFailure|%_RegExpExperimentalOneshotExecTreatMatchAtEndAsFailure|%RegExpExecMultiple|%_RegExpExecMultiple|%RegExpInitializeAndCompile|%_RegExpInitializeAndCompile|%RegExpReplaceRT|%_RegExpReplaceRT|%RegExpSplit|%_RegExpSplit|%RegExpStringFromFlags|%_RegExpStringFromFlags|%StringReplaceNonGlobalRegExpWithFunction|%_StringReplaceNonGlobalRegExpWithFunction|%StringSplit|%_StringSplit|%DeclareEvalFunction|%_DeclareEvalFunction|%DeclareEvalVar|%_DeclareEvalVar|%DeclareGlobals|%_DeclareGlobals|%DeclareModuleExports|%_DeclareModuleExports|%DeleteLookupSlot|%_DeleteLookupSlot|%LoadLookupSlot|%_LoadLookupSlot|%LoadLookupSlotInsideTypeof|%_LoadLookupSlotInsideTypeof|%NewClosure|%_NewClosure|%NewClosure_Tenured|%_NewClosure_Tenured|%NewFunctionContext|%_NewFunctionContext|%NewRestParameter|%_NewRestParameter|%NewSloppyArguments|%_NewSloppyArguments|%NewStrictArguments|%_NewStrictArguments|%PushBlockContext|%_PushBlockContext|%PushCatchContext|%_PushCatchContext|%PushWithContext|%_PushWithContext|%StoreGlobalNoHoleCheckForReplLetOrConst|%_StoreGlobalNoHoleCheckForReplLetOrConst|%StoreLookupSlot_Sloppy|%_StoreLookupSlot_Sloppy|%StoreLookupSlot_SloppyHoisting|%_StoreLookupSlot_SloppyHoisting|%StoreLookupSlot_Strict|%_StoreLookupSlot_Strict|%ThrowConstAssignError|%_ThrowConstAssignError|%FlattenString|%_FlattenString|%GetSubstitution|%_GetSubstitution|%InternalizeString|%_InternalizeString|%StringAdd|%_StringAdd|%StringBuilderConcat|%_StringBuilderConcat|%StringCharCodeAt|%_StringCharCodeAt|%StringEqual|%_StringEqual|%StringEscapeQuotes|%_StringEscapeQuotes|%StringGreaterThan|%_StringGreaterThan|%StringGreaterThanOrEqual|%_StringGreaterThanOrEqual|%StringLastIndexOf|%_StringLastIndexOf|%StringLessThan|%_StringLessThan|%StringLessThanOrEqual|%_StringLessThanOrEqual|%StringMaxLength|%_StringMaxLength|%StringReplaceOneCharWithString|%_StringReplaceOneCharWithString|%StringSubstring|%_StringSubstring|%StringToArray|%_StringToArray|%CreatePrivateNameSymbol|%_CreatePrivateNameSymbol|%CreatePrivateBrandSymbol|%_CreatePrivateBrandSymbol|%CreatePrivateSymbol|%_CreatePrivateSymbol|%SymbolDescriptiveString|%_SymbolDescriptiveString|%SymbolIsPrivate|%_SymbolIsPrivate|%Abort|%_Abort|%AbortJS|%_AbortJS|%AbortCSAAssert|%_AbortCSAAssert|%ArraySpeciesProtector|%_ArraySpeciesProtector|%BaselineOsr|%_BaselineOsr|%ClearFunctionFeedback|%_ClearFunctionFeedback|%ClearMegamorphicStubCache|%_ClearMegamorphicStubCache|%CompleteInobjectSlackTracking|%_CompleteInobjectSlackTracking|%ConstructConsString|%_ConstructConsString|%ConstructDouble|%_ConstructDouble|%ConstructSlicedString|%_ConstructSlicedString|%DebugPrint|%_DebugPrint|%DebugPrintPtr|%_DebugPrintPtr|%DebugTrace|%_DebugTrace|%DebugTrackRetainingPath|%_DebugTrackRetainingPath|%DeoptimizeFunction|%_DeoptimizeFunction|%DisallowCodegenFromStrings|%_DisallowCodegenFromStrings|%DisassembleFunction|%_DisassembleFunction|%DynamicCheckMapsEnabled|%_DynamicCheckMapsEnabled|%IsTopTierTurboprop|%_IsTopTierTurboprop|%IsMidTierTurboprop|%_IsMidTierTurboprop|%IsAtomicsWaitAllowed|%_IsAtomicsWaitAllowed|%EnableCodeLoggingForTesting|%_EnableCodeLoggingForTesting|%EnsureFeedbackVectorForFunction|%_EnsureFeedbackVectorForFunction|%GetCallable|%_GetCallable|%GetInitializerFunction|%_GetInitializerFunction|%GetOptimizationStatus|%_GetOptimizationStatus|%GetUndetectable|%_GetUndetectable|%GlobalPrint|%_GlobalPrint|%HasDictionaryElements|%_HasDictionaryElements|%HasDoubleElements|%_HasDoubleElements|%HasElementsInALargeObjectSpace|%_HasElementsInALargeObjectSpace|%HasFastElements|%_HasFastElements|%HasFastProperties|%_HasFastProperties|%HasOwnConstDataProperty|%_HasOwnConstDataProperty|%HasFixedBigInt64Elements|%_HasFixedBigInt64Elements|%HasFixedBigUint64Elements|%_HasFixedBigUint64Elements|%HasFixedFloat32Elements|%_HasFixedFloat32Elements|%HasFixedFloat64Elements|%_HasFixedFloat64Elements|%HasFixedInt16Elements|%_HasFixedInt16Elements|%HasFixedInt32Elements|%_HasFixedInt32Elements|%HasFixedInt8Elements|%_HasFixedInt8Elements|%HasFixedUint16Elements|%_HasFixedUint16Elements|%HasFixedUint32Elements|%_HasFixedUint32Elements|%HasFixedUint8ClampedElements|%_HasFixedUint8ClampedElements|%HasFixedUint8Elements|%_HasFixedUint8Elements|%HasHoleyElements|%_HasHoleyElements|%HasObjectElements|%_HasObjectElements|%HasPackedElements|%_HasPackedElements|%HasSloppyArgumentsElements|%_HasSloppyArgumentsElements|%HasSmiElements|%_HasSmiElements|%HasSmiOrObjectElements|%_HasSmiOrObjectElements|%HaveSameMap|%_HaveSameMap|%HeapObjectVerify|%_HeapObjectVerify|%ICsAreEnabled|%_ICsAreEnabled|%InLargeObjectSpace|%_InLargeObjectSpace|%InYoungGeneration|%_InYoungGeneration|%IsBeingInterpreted|%_IsBeingInterpreted|%IsConcurrentRecompilationSupported|%_IsConcurrentRecompilationSupported|%IsDictPropertyConstTrackingEnabled|%_IsDictPropertyConstTrackingEnabled|%RegexpHasBytecode|%_RegexpHasBytecode|%RegexpHasNativeCode|%_RegexpHasNativeCode|%RegexpTypeTag|%_RegexpTypeTag|%RegexpIsUnmodified|%_RegexpIsUnmodified|%MapIteratorProtector|%_MapIteratorProtector|%ArrayIteratorProtector|%_ArrayIteratorProtector|%NeverOptimizeFunction|%_NeverOptimizeFunction|%NotifyContextDisposed|%_NotifyContextDisposed|%OptimizeFunctionOnNextCall|%_OptimizeFunctionOnNextCall|%TierupFunctionOnNextCall|%_TierupFunctionOnNextCall|%OptimizeOsr|%_OptimizeOsr|%NewRegExpWithBacktrackLimit|%_NewRegExpWithBacktrackLimit|%PrepareFunctionForOptimization|%_PrepareFunctionForOptimization|%PretenureAllocationSite|%_PretenureAllocationSite|%PrintWithNameForAssert|%_PrintWithNameForAssert|%RunningInSimulator|%_RunningInSimulator|%RuntimeEvaluateREPL|%_RuntimeEvaluateREPL|%SerializeDeserializeNow|%_SerializeDeserializeNow|%SetAllocationTimeout|%_SetAllocationTimeout|%SetForceSlowPath|%_SetForceSlowPath|%SetIteratorProtector|%_SetIteratorProtector|%SimulateNewspaceFull|%_SimulateNewspaceFull|%ScheduleGCInStackCheck|%_ScheduleGCInStackCheck|%StringIteratorProtector|%_StringIteratorProtector|%SystemBreak|%_SystemBreak|%TraceEnter|%_TraceEnter|%TraceExit|%_TraceExit|%TurbofanStaticAssert|%_TurbofanStaticAssert|%TypedArraySpeciesProtector|%_TypedArraySpeciesProtector|%UnblockConcurrentRecompilation|%_UnblockConcurrentRecompilation|%DeoptimizeNow|%_DeoptimizeNow|%PromiseSpeciesProtector|%_PromiseSpeciesProtector|%IsConcatSpreadableProtector|%_IsConcatSpreadableProtector|%RegExpSpeciesProtector|%_RegExpSpeciesProtector|%Is64Bit|%_Is64Bit|%ArrayBufferDetach|%_ArrayBufferDetach|%GrowableSharedArrayBufferByteLength|%_GrowableSharedArrayBufferByteLength|%TypedArrayCopyElements|%_TypedArrayCopyElements|%TypedArrayGetBuffer|%_TypedArrayGetBuffer|%TypedArraySet|%_TypedArraySet|%TypedArraySortFast|%_TypedArraySortFast|%ThrowWasmError|%_ThrowWasmError|%ThrowWasmStackOverflow|%_ThrowWasmStackOverflow|%WasmI32AtomicWait|%_WasmI32AtomicWait|%WasmI64AtomicWait|%_WasmI64AtomicWait|%WasmAtomicNotify|%_WasmAtomicNotify|%WasmMemoryGrow|%_WasmMemoryGrow|%WasmStackGuard|%_WasmStackGuard|%WasmThrow|%_WasmThrow|%WasmReThrow|%_WasmReThrow|%WasmThrowJSTypeError|%_WasmThrowJSTypeError|%WasmRefFunc|%_WasmRefFunc|%WasmFunctionTableGet|%_WasmFunctionTableGet|%WasmFunctionTableSet|%_WasmFunctionTableSet|%WasmTableInit|%_WasmTableInit|%WasmTableCopy|%_WasmTableCopy|%WasmTableGrow|%_WasmTableGrow|%WasmTableFill|%_WasmTableFill|%WasmIsValidRefValue|%_WasmIsValidRefValue|%WasmCompileLazy|%_WasmCompileLazy|%WasmCompileWrapper|%_WasmCompileWrapper|%WasmTriggerTierUp|%_WasmTriggerTierUp|%WasmDebugBreak|%_WasmDebugBreak|%WasmAllocateRtt|%_WasmAllocateRtt|%WasmArrayCopy|%_WasmArrayCopy|%DeserializeWasmModule|%_DeserializeWasmModule|%DisallowWasmCodegen|%_DisallowWasmCodegen|%FreezeWasmLazyCompilation|%_FreezeWasmLazyCompilation|%GetWasmExceptionId|%_GetWasmExceptionId|%GetWasmExceptionValues|%_GetWasmExceptionValues|%GetWasmRecoveredTrapCount|%_GetWasmRecoveredTrapCount|%IsAsmWasmCode|%_IsAsmWasmCode|%IsLiftoffFunction|%_IsLiftoffFunction|%IsThreadInWasm|%_IsThreadInWasm|%IsWasmCode|%_IsWasmCode|%IsWasmTrapHandlerEnabled|%_IsWasmTrapHandlerEnabled|%SerializeWasmModule|%_SerializeWasmModule|%SetWasmCompileControls|%_SetWasmCompileControls|%SetWasmInstantiateControls|%_SetWasmInstantiateControls|%WasmGetNumberOfInstances|%_WasmGetNumberOfInstances|%WasmNumCodeSpaces|%_WasmNumCodeSpaces|%WasmTierDown|%_WasmTierDown|%WasmTierUp|%_WasmTierUp|%WasmTierUpFunction|%_WasmTierUpFunction|%WasmTraceEnter|%_WasmTraceEnter|%WasmTraceExit|%_WasmTraceExit|%WasmTraceMemory|%_WasmTraceMemory|%JSFinalizationRegistryRegisterWeakCellWithUnregisterToken|%_JSFinalizationRegistryRegisterWeakCellWithUnregisterToken|%JSWeakRefAddToKeptObjects|%_JSWeakRefAddToKeptObjects|%ShrinkFinalizationRegistryUnregisterTokenMap|%_ShrinkFinalizationRegistryUnregisterTokenMap|%DebugBreakOnBytecode|%_DebugBreakOnBytecode|%LoadLookupSlotForCall|%_LoadLookupSlotForCall|%ElementsTransitionAndStoreIC_Miss|%_ElementsTransitionAndStoreIC_Miss|%KeyedLoadIC_Miss|%_KeyedLoadIC_Miss|%KeyedStoreIC_Miss|%_KeyedStoreIC_Miss|%StoreInArrayLiteralIC_Miss|%_StoreInArrayLiteralIC_Miss|%KeyedStoreIC_Slow|%_KeyedStoreIC_Slow|%LoadElementWithInterceptor|%_LoadElementWithInterceptor|%LoadGlobalIC_Miss|%_LoadGlobalIC_Miss|%LoadGlobalIC_Slow|%_LoadGlobalIC_Slow|%LoadIC_Miss|%_LoadIC_Miss|%LoadNoFeedbackIC_Miss|%_LoadNoFeedbackIC_Miss|%LoadWithReceiverIC_Miss|%_LoadWithReceiverIC_Miss|%LoadWithReceiverNoFeedbackIC_Miss|%_LoadWithReceiverNoFeedbackIC_Miss|%LoadPropertyWithInterceptor|%_LoadPropertyWithInterceptor|%StoreCallbackProperty|%_StoreCallbackProperty|%StoreGlobalIC_Miss|%_StoreGlobalIC_Miss|%StoreGlobalICNoFeedback_Miss|%_StoreGlobalICNoFeedback_Miss|%StoreGlobalIC_Slow|%_StoreGlobalIC_Slow|%StoreIC_Miss|%_StoreIC_Miss|%StoreInArrayLiteralIC_Slow|%_StoreInArrayLiteralIC_Slow|%StorePropertyWithInterceptor|%_StorePropertyWithInterceptor|%CloneObjectIC_Miss|%_CloneObjectIC_Miss|%KeyedHasIC_Miss|%_KeyedHasIC_Miss|%HasElementWithInterceptor|%_HasElementWithInterceptor)/g;
  return js.replace(builtinReg, 'toString');
}
