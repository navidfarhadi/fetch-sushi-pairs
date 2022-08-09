const fetch = require('sync-fetch');
const networks = require('./networks');
const tokenlist = require('./tokenlist');
const fs = require('fs');


String.prototype.escape = function () {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function (tag) {
        return tagsToReplace[tag] || tag;
    });
};

let chain_name = "BSC";
var cntr = 0;
var record_number = 0;

append_to_file('Counter | Network | PairName | PairSymbol | PairDecimals | Token0 | Token1 | PairAddress \n');
append_to_file('--- | --- | --- | --- | --- | --- | --- | --- \n');

for(var i = 0; i < 1621; i++) {
    console.log(i);
    var pair = get_pair(i);
    console.log(pair);
    if (pair != "0x0000000000000000000000000000000000000000000000000000000000000000") {
        record_number++;
        pair = "0x"+pair.substring(26);
        let token0 = contract_method_call(pair, "0x0dfe1681", "");
        let token1 = contract_method_call(pair, "0xd21220a7", "");
        let name = contract_method_call(pair, "0x06fdde03", "");
        let decimals = contract_method_call(pair, "0x313ce567", "");
        let symbol = contract_method_call(pair, "0x95d89b41", "");
        token0 = "0x"+formatresult(token0, 'address').substring(26);
        token1 = "0x"+formatresult(token1, 'address').substring(26);
        name = formatresult(name, 'string');
        decimals = formatresult(decimals, 'uint8');
        symbol = formatresult(symbol, 'string');
        var record = 
            `${record_number} | ${chain_name} `+
            `|${name} |${symbol} | ${decimals} ` + 
            `| ${token0} ` +
            `| ${token1} ` +
            `| ${pair} \n`;
        console.log(record);
        append_to_file(record);
    }
}

function get_pair(index) {
    let factory_address = "0xc35dadb65012ec5796536bd9864ed8773abc74c4";
    var id = ('00000'+index).slice(-5);
    return contract_method_call(factory_address, "0x1e3dd18b", `00000000000000000000000000000000000000000000000000000000000${id}`);
}

function strip(val) {


    val = val.replace(/"/g, '');
    val = val.replace('[', '');
    val = val.replace(']', '');


    return val;
}

function hex_to_ascii(str1) {
    var hex = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}

function remove0x(str1) {
    if (str1.startsWith("0x") == true) {
        str1 = str1.substr(str1.length - str1.length + 2);
    }
    return str1;
}

function formatresult(strResult, resulttype) {
    strResult = strResult.escape();
    if (resulttype.startsWith('uint')) {
        return parseInt(strResult, 16);
    } else if (resulttype == 'string') {
        return strip(hex_to_ascii(strResult).replace(/[^0-9a-zA-Z ]/g, ''));
    } else if (resulttype == 'address') {
        if (strResult != '0x0000000000000000000000000000000000000000') {
            return strResult;
        } else {
            return strResult;
        }
    } else {
        return hex_to_ascii(strResult);
    }
}

function append_to_file(record) {
    fs.appendFileSync(`pairs-of-${chain_name}-v2.md`, record);
}

function contract_method_call(contract_address, method_id, data) {
    var res = fetch("https://bsc-mainnet.web3api.com/v1/KBR2FY9IJ2IXESQMQ45X76BNWDAW2TT3Z3", {
    "headers": {
        "accept": "*/*",
        "content-type": "application/json"
    },
    "body": `{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[{\"data\":\"${method_id}${data}\",\"to\":\"${contract_address}\"},\"latest\"]}`,
    "method": "POST"
    });
    return res.json().result;
}
