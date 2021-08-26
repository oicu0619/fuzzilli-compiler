const {execSync}=require('child_process');
const fs=require('fs');

const protoPath='/root/chrome_study/prototest/1.fuzzil.protobuf';
const liftPath='/root/chrome_study/prototest/lift.js';
const testFolder='/root/chrome_study/mycompiler/testfromv8';


const files=fs.readdirSync(testFolder);
files.forEach((file) => {
  execSync('rm -f '+protoPath+'>/dev/null');
  execSync('rm -f '+liftPath+'>/dev/null');
  if (file.slice(-3)!='.js') {
    return;
  };
  const testFullPath=testFolder+'/'+file;
  try {
    execSync('node /root/chrome_study/mycompiler/index.js '+testFullPath);
  } catch (e) {
    console.log('compile fail: '+file);
    return;
  }
  try {
    execSync('/root/chrome_study/fuzzillimy/fuzzilli/.build/debug/FuzzILTool '+
      '--liftToJS /root/chrome_study/prototest/1.fuzzil.protobuf >'+liftPath);
  } catch (e) {
    console.log('compile fail: '+file);
    return;
  }
  const OriJs=fs.readFileSync(testFullPath).toString();
  const liftJs=fs.readFileSync(liftPath).toString();
  try {
    oriValue=eval(OriJs);
    liftValue=eval(liftJs);
  } catch (e) {
    console.log('eval check fail: '+file);
    return;
  }
  equal=true;
  if (typeof oriValue=='object'&&typeof liftValue=='object') {
    equal=(oriValue.toString()==liftValue.toString());
    oriValue=oriValue.toString();
  } else if (typeof oriValue=='symbol'&&typeof liftValue=='symbol') {
    equal=(oriValue.toString()==liftValue.toString());
    oriValue=oriValue.toString();
  } else {
    equal=Object.is(eval(OriJs), eval(liftJs));
  }
  if (!equal) {
    console.log('eval check fail: '+file);
    return;
  }
  if (oriValue===undefined) {
    console.log('testcase should not return undefined: '+file);
    return;
  }
  console.log('test pass: '+file+'; both eval to: '+oriValue);
});

// the last line of the testcase js must be a reassign
// so that will be compile to reassign in Fuzzil
// that var is the value returned by eval.
