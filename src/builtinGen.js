const fs=require('fs');
const runtimeFile=
  fs.readFileSync('/root/chrome_study/v86/v8/src/runtime/runtime.h');
const runtimeRawArray=runtimeFile.toString().
    match(/(F|I)\([A-Z].*,.*,.*\)/g);
outRegexp='/(';
for (let i=0; i<runtimeRawArray.length; i++) {
  builtinName=runtimeRawArray[i].split('(')[1].split(',')[0];
  outRegexp+='%';
  outRegexp+=builtinName;
  outRegexp+='|%_';
  outRegexp+=builtinName;
  outRegexp+='|';
}
outRegexp=outRegexp.slice(0, -1);
outRegexp+=')/g';
console.log(outRegexp);
