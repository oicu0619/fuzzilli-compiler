/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.fuzzilli.protobuf.FunctionSignature', null, global);
goog.exportSymbol('proto.fuzzilli.protobuf.Type', null, global);
goog.exportSymbol('proto.fuzzilli.protobuf.TypeExtension', null, global);

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.fuzzilli.protobuf.Type = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.fuzzilli.protobuf.Type.oneofGroups_);
};
goog.inherits(proto.fuzzilli.protobuf.Type, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.fuzzilli.protobuf.Type.displayName = 'proto.fuzzilli.protobuf.Type';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.fuzzilli.protobuf.Type.oneofGroups_ = [[3,4]];

/**
 * @enum {number}
 */
proto.fuzzilli.protobuf.Type.ExtCase = {
  EXT_NOT_SET: 0,
  EXTENSIONIDX: 3,
  EXTENSION: 4
};

/**
 * @return {proto.fuzzilli.protobuf.Type.ExtCase}
 */
proto.fuzzilli.protobuf.Type.prototype.getExtCase = function() {
  return /** @type {proto.fuzzilli.protobuf.Type.ExtCase} */(jspb.Message.computeOneofCase(this, proto.fuzzilli.protobuf.Type.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.fuzzilli.protobuf.Type.prototype.toObject = function(opt_includeInstance) {
  return proto.fuzzilli.protobuf.Type.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.fuzzilli.protobuf.Type} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.fuzzilli.protobuf.Type.toObject = function(includeInstance, msg) {
  var f, obj = {
    definitetype: jspb.Message.getFieldWithDefault(msg, 1, 0),
    possibletype: jspb.Message.getFieldWithDefault(msg, 2, 0),
    extensionidx: jspb.Message.getFieldWithDefault(msg, 3, 0),
    extension: (f = msg.getExtension$()) && proto.fuzzilli.protobuf.TypeExtension.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.fuzzilli.protobuf.Type}
 */
proto.fuzzilli.protobuf.Type.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.fuzzilli.protobuf.Type;
  return proto.fuzzilli.protobuf.Type.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.fuzzilli.protobuf.Type} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.fuzzilli.protobuf.Type}
 */
proto.fuzzilli.protobuf.Type.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setDefinitetype(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPossibletype(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setExtensionidx(value);
      break;
    case 4:
      var value = new proto.fuzzilli.protobuf.TypeExtension;
      reader.readMessage(value,proto.fuzzilli.protobuf.TypeExtension.deserializeBinaryFromReader);
      msg.setExtension$(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.fuzzilli.protobuf.Type.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.fuzzilli.protobuf.Type.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.fuzzilli.protobuf.Type} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.fuzzilli.protobuf.Type.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDefinitetype();
  if (f !== 0) {
    writer.writeUint32(
      1,
      f
    );
  }
  f = message.getPossibletype();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getExtension$();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.fuzzilli.protobuf.TypeExtension.serializeBinaryToWriter
    );
  }
};


/**
 * optional uint32 definiteType = 1;
 * @return {number}
 */
proto.fuzzilli.protobuf.Type.prototype.getDefinitetype = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.fuzzilli.protobuf.Type.prototype.setDefinitetype = function(value) {
  jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional uint32 possibleType = 2;
 * @return {number}
 */
proto.fuzzilli.protobuf.Type.prototype.getPossibletype = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.fuzzilli.protobuf.Type.prototype.setPossibletype = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional uint32 extensionIdx = 3;
 * @return {number}
 */
proto.fuzzilli.protobuf.Type.prototype.getExtensionidx = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.fuzzilli.protobuf.Type.prototype.setExtensionidx = function(value) {
  jspb.Message.setOneofField(this, 3, proto.fuzzilli.protobuf.Type.oneofGroups_[0], value);
};


proto.fuzzilli.protobuf.Type.prototype.clearExtensionidx = function() {
  jspb.Message.setOneofField(this, 3, proto.fuzzilli.protobuf.Type.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.fuzzilli.protobuf.Type.prototype.hasExtensionidx = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional TypeExtension extension = 4;
 * @return {?proto.fuzzilli.protobuf.TypeExtension}
 */
proto.fuzzilli.protobuf.Type.prototype.getExtension$ = function() {
  return /** @type{?proto.fuzzilli.protobuf.TypeExtension} */ (
    jspb.Message.getWrapperField(this, proto.fuzzilli.protobuf.TypeExtension, 4));
};


/** @param {?proto.fuzzilli.protobuf.TypeExtension|undefined} value */
proto.fuzzilli.protobuf.Type.prototype.setExtension$ = function(value) {
  jspb.Message.setOneofWrapperField(this, 4, proto.fuzzilli.protobuf.Type.oneofGroups_[0], value);
};


proto.fuzzilli.protobuf.Type.prototype.clearExtension$ = function() {
  this.setExtension$(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.fuzzilli.protobuf.Type.prototype.hasExtension$ = function() {
  return jspb.Message.getField(this, 4) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.fuzzilli.protobuf.TypeExtension = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.fuzzilli.protobuf.TypeExtension.repeatedFields_, null);
};
goog.inherits(proto.fuzzilli.protobuf.TypeExtension, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.fuzzilli.protobuf.TypeExtension.displayName = 'proto.fuzzilli.protobuf.TypeExtension';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.fuzzilli.protobuf.TypeExtension.repeatedFields_ = [1,2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.fuzzilli.protobuf.TypeExtension.prototype.toObject = function(opt_includeInstance) {
  return proto.fuzzilli.protobuf.TypeExtension.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.fuzzilli.protobuf.TypeExtension} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.fuzzilli.protobuf.TypeExtension.toObject = function(includeInstance, msg) {
  var f, obj = {
    propertiesList: jspb.Message.getRepeatedField(msg, 1),
    methodsList: jspb.Message.getRepeatedField(msg, 2),
    group: jspb.Message.getFieldWithDefault(msg, 3, ""),
    signature: (f = msg.getSignature()) && proto.fuzzilli.protobuf.FunctionSignature.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.fuzzilli.protobuf.TypeExtension}
 */
proto.fuzzilli.protobuf.TypeExtension.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.fuzzilli.protobuf.TypeExtension;
  return proto.fuzzilli.protobuf.TypeExtension.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.fuzzilli.protobuf.TypeExtension} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.fuzzilli.protobuf.TypeExtension}
 */
proto.fuzzilli.protobuf.TypeExtension.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.addProperties(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.addMethods(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setGroup(value);
      break;
    case 4:
      var value = new proto.fuzzilli.protobuf.FunctionSignature;
      reader.readMessage(value,proto.fuzzilli.protobuf.FunctionSignature.deserializeBinaryFromReader);
      msg.setSignature(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.fuzzilli.protobuf.TypeExtension.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.fuzzilli.protobuf.TypeExtension.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.fuzzilli.protobuf.TypeExtension} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.fuzzilli.protobuf.TypeExtension.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPropertiesList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      1,
      f
    );
  }
  f = message.getMethodsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      2,
      f
    );
  }
  f = message.getGroup();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getSignature();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.fuzzilli.protobuf.FunctionSignature.serializeBinaryToWriter
    );
  }
};


/**
 * repeated string properties = 1;
 * @return {!Array<string>}
 */
proto.fuzzilli.protobuf.TypeExtension.prototype.getPropertiesList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 1));
};


/** @param {!Array<string>} value */
proto.fuzzilli.protobuf.TypeExtension.prototype.setPropertiesList = function(value) {
  jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {!string} value
 * @param {number=} opt_index
 */
proto.fuzzilli.protobuf.TypeExtension.prototype.addProperties = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


proto.fuzzilli.protobuf.TypeExtension.prototype.clearPropertiesList = function() {
  this.setPropertiesList([]);
};


/**
 * repeated string methods = 2;
 * @return {!Array<string>}
 */
proto.fuzzilli.protobuf.TypeExtension.prototype.getMethodsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 2));
};


/** @param {!Array<string>} value */
proto.fuzzilli.protobuf.TypeExtension.prototype.setMethodsList = function(value) {
  jspb.Message.setField(this, 2, value || []);
};


/**
 * @param {!string} value
 * @param {number=} opt_index
 */
proto.fuzzilli.protobuf.TypeExtension.prototype.addMethods = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 2, value, opt_index);
};


proto.fuzzilli.protobuf.TypeExtension.prototype.clearMethodsList = function() {
  this.setMethodsList([]);
};


/**
 * optional string group = 3;
 * @return {string}
 */
proto.fuzzilli.protobuf.TypeExtension.prototype.getGroup = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.fuzzilli.protobuf.TypeExtension.prototype.setGroup = function(value) {
  jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional FunctionSignature signature = 4;
 * @return {?proto.fuzzilli.protobuf.FunctionSignature}
 */
proto.fuzzilli.protobuf.TypeExtension.prototype.getSignature = function() {
  return /** @type{?proto.fuzzilli.protobuf.FunctionSignature} */ (
    jspb.Message.getWrapperField(this, proto.fuzzilli.protobuf.FunctionSignature, 4));
};


/** @param {?proto.fuzzilli.protobuf.FunctionSignature|undefined} value */
proto.fuzzilli.protobuf.TypeExtension.prototype.setSignature = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


proto.fuzzilli.protobuf.TypeExtension.prototype.clearSignature = function() {
  this.setSignature(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.fuzzilli.protobuf.TypeExtension.prototype.hasSignature = function() {
  return jspb.Message.getField(this, 4) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.fuzzilli.protobuf.FunctionSignature = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.fuzzilli.protobuf.FunctionSignature.repeatedFields_, null);
};
goog.inherits(proto.fuzzilli.protobuf.FunctionSignature, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.fuzzilli.protobuf.FunctionSignature.displayName = 'proto.fuzzilli.protobuf.FunctionSignature';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.fuzzilli.protobuf.FunctionSignature.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.fuzzilli.protobuf.FunctionSignature.prototype.toObject = function(opt_includeInstance) {
  return proto.fuzzilli.protobuf.FunctionSignature.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.fuzzilli.protobuf.FunctionSignature} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.fuzzilli.protobuf.FunctionSignature.toObject = function(includeInstance, msg) {
  var f, obj = {
    inputtypesList: jspb.Message.toObjectList(msg.getInputtypesList(),
    proto.fuzzilli.protobuf.Type.toObject, includeInstance),
    outputtype: (f = msg.getOutputtype()) && proto.fuzzilli.protobuf.Type.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.fuzzilli.protobuf.FunctionSignature}
 */
proto.fuzzilli.protobuf.FunctionSignature.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.fuzzilli.protobuf.FunctionSignature;
  return proto.fuzzilli.protobuf.FunctionSignature.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.fuzzilli.protobuf.FunctionSignature} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.fuzzilli.protobuf.FunctionSignature}
 */
proto.fuzzilli.protobuf.FunctionSignature.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.fuzzilli.protobuf.Type;
      reader.readMessage(value,proto.fuzzilli.protobuf.Type.deserializeBinaryFromReader);
      msg.addInputtypes(value);
      break;
    case 2:
      var value = new proto.fuzzilli.protobuf.Type;
      reader.readMessage(value,proto.fuzzilli.protobuf.Type.deserializeBinaryFromReader);
      msg.setOutputtype(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.fuzzilli.protobuf.FunctionSignature.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.fuzzilli.protobuf.FunctionSignature.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.fuzzilli.protobuf.FunctionSignature} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.fuzzilli.protobuf.FunctionSignature.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getInputtypesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.fuzzilli.protobuf.Type.serializeBinaryToWriter
    );
  }
  f = message.getOutputtype();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.fuzzilli.protobuf.Type.serializeBinaryToWriter
    );
  }
};


/**
 * repeated Type inputTypes = 1;
 * @return {!Array<!proto.fuzzilli.protobuf.Type>}
 */
proto.fuzzilli.protobuf.FunctionSignature.prototype.getInputtypesList = function() {
  return /** @type{!Array<!proto.fuzzilli.protobuf.Type>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.fuzzilli.protobuf.Type, 1));
};


/** @param {!Array<!proto.fuzzilli.protobuf.Type>} value */
proto.fuzzilli.protobuf.FunctionSignature.prototype.setInputtypesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.fuzzilli.protobuf.Type=} opt_value
 * @param {number=} opt_index
 * @return {!proto.fuzzilli.protobuf.Type}
 */
proto.fuzzilli.protobuf.FunctionSignature.prototype.addInputtypes = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.fuzzilli.protobuf.Type, opt_index);
};


proto.fuzzilli.protobuf.FunctionSignature.prototype.clearInputtypesList = function() {
  this.setInputtypesList([]);
};


/**
 * optional Type outputType = 2;
 * @return {?proto.fuzzilli.protobuf.Type}
 */
proto.fuzzilli.protobuf.FunctionSignature.prototype.getOutputtype = function() {
  return /** @type{?proto.fuzzilli.protobuf.Type} */ (
    jspb.Message.getWrapperField(this, proto.fuzzilli.protobuf.Type, 2));
};


/** @param {?proto.fuzzilli.protobuf.Type|undefined} value */
proto.fuzzilli.protobuf.FunctionSignature.prototype.setOutputtype = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.fuzzilli.protobuf.FunctionSignature.prototype.clearOutputtype = function() {
  this.setOutputtype(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.fuzzilli.protobuf.FunctionSignature.prototype.hasOutputtype = function() {
  return jspb.Message.getField(this, 2) != null;
};


goog.object.extend(exports, proto.fuzzilli.protobuf);
