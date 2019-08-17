let encode = function(str, token) {
    let output = Buffer.alloc(str.length)

    for (let i = 0; i < str.length; i ++) 
        output[i] = str.charCodeAt(i) + token.charCodeAt(i % token.length)
    return output
}

let decode = function(buffer, token) {
    let output = ''

    for (let i = 0; i < buffer.length; i ++)
        output += String.fromCharCode(buffer[i] - token.charCodeAt(i % token.length))
    return output
}

module.exports.encode = encode
module.exports.decode = decode