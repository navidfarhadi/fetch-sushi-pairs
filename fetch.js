const fetch = require('sync-fetch');
const networks = require('./networks');
const tokenlist = require('./tokenlist');
const fs = require('fs');


let all_networks = networks.networks;
let all_tokens = tokenlist.TOKENS;

let chain_id = 56;
let current_network = null;
all_networks.forEach((net, i) => {  if (net.chainId==chain_id) current_network=net; });
let cntr = 0;
var stream = fs.createWriteStream(`pairs-of-${current_network.shortName}.md`);
stream.once('open', function(){});
stream.write('Counter | Network | Symbol A | Name | Decimals | Address | Symbol B | Name | Decimals | Address | PairAddress \n');
stream.write('--- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- \n');

all_tokens.forEach((token_a, i) => {
    all_tokens.forEach((token_b, j) => {
        if (token_a.chainId == chain_id && token_b.chainId == chain_id) {
            if (token_a.address != token_b.address) {
                let pair = get_pair(token_a.address.substring(2), token_b.address.substring(2));
                console.log(pair);
                if (pair != "0x0000000000000000000000000000000000000000000000000000000000000000") {
                    cntr++;
                    let record = 
                            `${cntr} | ${current_network.chain} `+
                            `| ${token_a.symbol} | ${token_a.name} | ${token_a.decimals} | ${token_a.address} ` + 
                            `| ${token_b.symbol} | ${token_b.name} | ${token_b.decimals} | ${token_b.address} ` +
                            `| 0x${pair.substring(26)} \n`;
                    console.log(record);
                    stream.write(record);
                }
            }
        }
    })
});
stream.end();

function get_pair(token_a, token_b) {
    // let tokens = "0xe6a439050000000000000000000000003ee2200efb3400fabb9aacf31297cbdd1d435d4700000000000000000000000055d398326f99059ff775485246999027b3197955";
    let tokens = `0xe6a43905000000000000000000000000${token_a}000000000000000000000000${token_b}`;
    let res = fetch("https://bsc-mainnet.web3api.com/v1/KBR2FY9IJ2IXESQMQ45X76BNWDAW2TT3Z3", {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7",
        "content-type": "application/json",
        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "Referer": "https://www.bscscan.com/",
        "Referrer-Policy": "origin-when-cross-origin"
    },
    "body": `{\"jsonrpc\":\"2.0\",\"id\":12,\"method\":\"eth_call\",\"params\":[{\"from\":\"0x0000000000000000000000000000000000000000\",\"data\":\"${tokens}\",\"to\":\"0xc35dadb65012ec5796536bd9864ed8773abc74c4\"},\"latest\"]}`,
    "method": "POST"
    });
    return res.json().result;
}
