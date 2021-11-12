global.readMem = function(index = 0, all = false) {
    if (all) {
        return (mem)
    } else {
        var ret = [];
        while (mem[index] != "\0") {
            ret.push(mem[index])
            index++;
        }
        return ret
    }
}

global.dedicate = function(len, value) {
    var i = 0;
    value = String(value)

    while (mem[i] != "\\") {
        i++
    }
    //console.log(i)

    if (len == "?") {
        len = value.length
    } else {
        len == parseInt(len)
    }
    //console.log("len:", len)
    for (j = 0; j < len; i++, j++) {
        mem[i] = value[j]
    }
    mem[i] = '\0'

    return i - len
}

global.outlog = function(str) {
    console.log("::---STDOUT---::".black.bgWhite, str)
    return 1;
}

global.ji = function(a, b) {
    if(JSON.parse(b)) {
        return {jumpTo:a}
    }
    return 0
}

global.set = function(index,value) {
    for(j = index, i = 0; i < value.length; i++, j++) {
        if(mem[j] == "\x00" || mem[j] == "\x00") {
            console.log(`WARNING: MEMORY OVERFLOW AT INDEX[${j}]`.red.bgBlack.bold)
            //console.log(readMem(j,true).slice(j-1,j+10).join().replace(/\x00/g, "NULL").green);
            process.exit(1)
        }
        mem[j] = value[i]
    }
    return 1;
}

global.array = function(length,lengthPerBox,arr) {
	arr = arr.slice(1,-1).split(",")
	arr = arr.map(x => completeNumber(x,lengthPerBox))
	arr.unshift(completeNumber(lengthPerBox,3))
	//console.log(arr)
	return dedicate(length*lengthPerBox + 3,arr.join(""))
	//console.log(arr.slice(1,-1).split(","))
	
}

global.index = function(arr, ind) {
	//console.log(arr)
	arr = arr.split("")
	var len = parseInt(arr.slice(0,3).join(""));
	var parsedArr = [];
	for(var build = "", i = 3; i < arr.length; i++) {
		build+= arr[i]
		//console.log(build)
		if(build.length == len) {
			parsedArr.push(build)
			build = ""
		}
	}
	//console.log(parsedArr[parseInt(ind)])
	return parsedArr[parseInt(ind)]
}

global.setInd = function(pos,ind,value) {
	var arr = readMem(pos)
	var len = parseInt(arr.slice(0,3).join(""));
	var build = ""
	ind = ind * len + 3
	for(i = 0; i < len; i++, ind++) {
		arr[ind] = value[i]
	}
	set(pos,arr)
}

global.NUM = function(n) {
	return parseFloat(n)
}

global.STRING = function(n) {
	return String(n)	
}

global.completeNumber = function(number, length) {
	number = String(number)
	return(("0").repeat(length-(number.length)) + number)
}
