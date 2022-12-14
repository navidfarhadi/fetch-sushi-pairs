const fetch = require('sync-fetch');
const networks = require('./networks');
const tokenlist = require('./tokenlist');
const fs = require('fs');


let all_networks = networks.networks;
let all_tokens = tokenlist.TOKENS;

let chain_id = 43114; 
let chain_name = "Avalanche";
var cntr = 0;
var record_number = 0;

append_to_file('Counter | Network | Symbol A | Name | Decimals | Address | Symbol B | Name | Decimals | Address | PairAddress \n');
append_to_file('--- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- \n');

all_tokens.forEach((token_a, i) => {
    all_tokens.forEach((token_b, j) => {
        if (token_a.chainId == chain_id && token_b.chainId == chain_id) {
            if (token_a.address != token_b.address) {
                cntr=cntr+1;
                console.log(cntr);
                if (cntr>=1) {
                    var pair = get_pair(token_a.address.substring(2), token_b.address.substring(2));
                    console.log(pair);
                    if (pair != "0x0000000000000000000000000000000000000000000000000000000000000000") {
                        record_number++;
                        var record = 
                                `${record_number} | ${chain_name} `+
                                `| ${token_a.symbol} | ${token_a.name} | ${token_a.decimals} | ${token_a.address} ` + 
                                `| ${token_b.symbol} | ${token_b.name} | ${token_b.decimals} | ${token_b.address} ` +
                                `| 0x${pair.substring(26)} \n`;
                        console.log(record);
                        append_to_file(record);
                    }
                }
            }
        }
    })
});

function get_pair(token_a, token_b) {
    let tokens = `0xe6a43905000000000000000000000000${token_a}000000000000000000000000${token_b}`;
    let factory_id = "0xc35dadb65012ec5796536bd9864ed8773abc74c4";
    let res = fetch("https://api.avax.network/ext/bc/C/rpc", {
    "headers": {
        "accept": "*/*",
        "content-type": "application/json"
    },
    "body": `{\"jsonrpc\":\"2.0\",\"id\":12,\"method\":\"eth_call\",\"params\":[{\"from\":\"0x0000000000000000000000000000000000000000\",\"data\":\"${tokens}\",\"to\":\"${factory_id}\"},\"latest\"]}`,
    "method": "POST"
    });
    return res.json().result;
}

function append_to_file(record) {
    fs.appendFileSync(`pairs-of-${chain_name}.md`, record);
}