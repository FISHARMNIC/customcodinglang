/*
name {param,param,param} <= x , x2 , x3 ; | call function
- x...xn are parameters that need to be executed (not numbers,strings,or vars)
- ex. outlog {$mVar + 1} will not work.
- outlog {} <= $myVar + 1 will work
- seperate multiple executable parameters by space or comma, ending with a semi colon
- seperate multiple static parameters by commas

@pointer : memorylocation | create a pointer that points to a memory location

dedicate {length, value} | malloc
@pointer : dedicate {length} <= value | create var

array{length,cellSize,[array]} | malloc for an array
@pointer : array{length,cellSize} <= [x,y,z] | create array

set {value, index}	        | set memory
outlog{value} 		        | print
index{array,index}		| read index of array
 
$var | read location from memory (read var)
&var | read constant 
#location | read location of pointer 
*/

global.mem;
global.pointers = {};

require('colors')
require('./usableFuncs.js')

var DEBUG = false
if (process.argv[2] == "debug") {
    DEBUG = true
}

var mathArgs = [
    "+",
    "-",
    "*",
    "/",
    "%",
    "<",
    ">",
    "==",
    ">=",
    "=<",
    "!="
]

var escapeChars = ["", " ", ",",";",undefined]

var str = `
@myArr : array {3,3} <= [ABC,DEF,GHI]
outlog {} <= index {$myArr,0}
outlog {} <= index {$myArr,1}
outlog {} <= index {$myArr,2}
setInd {#myArr,0} <= 123
outlog {} <= index {$myArr,0}
`

interpret(str)
debugLog(mem)

function interpret(code) {
    mem = (new Array(100)).fill("\\");
    pointers = {};

    var lineConts;
    var word;

    code = code.split("\n").filter(x => x);
    for (line = 0; line < code.length; line++) {
        lineConts = code[line].split(" ").filter(x => x)
        //console.log(lineConts)
        for (wordNum = lineConts.length - 1; wordNum >= 0; wordNum--) {
            word = lineConts[wordNum]
            var wordSliced = word.slice(1)
            // ------------ VAR TYPE SWITCH ------------
            switch (word[0]) {
                case "#": //RAW VALUE OF POINTER
                    lineConts[wordNum] = pointers[wordSliced]
                    break
                case "$": //VALUE OF POINTER VAR
                    //console.log(word.slice(1)) 
                    //console.log("IND READ ", wordSliced ,pointers[wordSliced],readMem(pointers[wordSliced]).join(""))
                    lineConts[wordNum] = readMem(pointers[wordSliced]).join("")
                    break
                case "&": //RESERVED VAR
                    lineConts[wordNum] = eval(wordSliced)
                    //console.log("&&&", lineConts)
                    break
                case "@":
                    pointers[wordSliced] = lineConts[wordNum + 2]
                    //console.log("PP", pointers)
                    break //HEREEEE
            }
            // ------------ MATH SWITCH ------------
            if(mathArgs.includes(word)) {
                lineConts[wordNum-1] = parseVar(lineConts[wordNum-1])
                //console.log("MATTHHHH: ", `${lineConts[wordNum-1]} ${word} ${lineConts[wordNum+1]}`, String(eval(`${lineConts[wordNum-1]} ${word} ${lineConts[wordNum+1]}`)))
                //console.log(mem)
                lineConts[wordNum - 1] = String(eval(`${lineConts[wordNum-1]} ${word} ${lineConts[wordNum+1]}`))
                lineConts[wordNum] = "";
                lineConts[wordNum + 1] = "";
                //console.log(lineConts)
            }

            // ------------ PARAMETER PARSING ------------
            if (word[0] == "{" && word[word.length - 1] == "}") {
                var params = word.slice(1, -1).split(",").filter(x => x)
		params = params.map(x => parseVar(x))
                if (lineConts[wordNum + 1] == "<=") {
                    var n = 2
                    while (lineConts[wordNum + n] != ";" && lineConts[wordNum + n] != undefined) {
                        //debugLog(lineConts[wordNum + n])
                        if (!escapeChars.includes(lineConts[wordNum + n])) {
                            //debugLog("FUNCOUT", lineConts[wordNum + n])
                            params.push(lineConts[wordNum + n])
                        }
                        n++;
                    }
                }
		
                //console.log(`${lineConts[wordNum - 1]}(${params.map(x => `'${x}'`)})`)
                lineConts[wordNum - 1] = eval(`${lineConts[wordNum - 1]}(${params.map(x => `'${x}'`)})`)
                if(typeof lineConts[wordNum - 1] == "object"){
                    //console.log("SJJJ", parseInt((lineConts[wordNum - 1]).jumpTo))
                    line = parseInt((lineConts[wordNum - 1]).jumpTo)
                    lineConts = code[line].split(" ").filter(x => x)
                    wordNum = -1
                    //console.log("JUMPED")
                    //continue
                }
                wordNum--;
            }
        }
        debugLog(lineConts)
    }
}

// var mem = (new Array(10)).fill("\\");
// dedicate(1, 1)
// dedicate(2, "AB")
// dedicate("?", "123")
// console.log(mem)
// console.log(readMem(0))

function parseVar(str) {
    wordSliced = str.slice(1)
    switch (str[0]) {
        case "#":
            return pointers[wordSliced]
        case "$":
            return readMem(pointers[wordSliced]).join("")
        case "&": //RESERVED VAR
            return eval(wordSliced)
    }
    return str
}

function debugLog(...params) {
    if (DEBUG) { console.log(...params); }
}

