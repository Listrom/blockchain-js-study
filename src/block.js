// 实际的常量
//var targetMax = 0x00000000FFFF0000000000000000000000000000000000000000000000000000
// 修改后的常量 方便展现效果
var targetMax = 0x00100000FFFF0000000000000000000000000000000000000000000000000000;
// 记录最后一个区块的哈希值
var lastBlock = "0000000000000000000000000000000000000000000000000000000000000000";
// 记录出现的最小值
var min       = 0xFF00000000000000000000000000000000000000000000000000000000000000;

// 挖矿
function mining(){
    var data = createData();
    if (data!=null){
        createBlock(data);
    }
}

// 生成一个区块
function createBlock(data){
    var item = '<div class="block">' +
        '            <div class="block_line">' +
        '                <span class="block_title">头哈希</span>' +
        '                <span class="block_value">'+data.head.headHash+'</span>' +
        '            </div>' +
        '            <div class="block_line">' +
        '                <span class="block_title">父哈希</span>' +
        '                <span class="block_value">'+data.head.prevHash+'</span>' +
        '            </div>' +
        '            <div class="block_line">' +
        '                <span class="block_title">版本</span>' +
        '                <span class="block_value">'+data.head.version+'</span>' +
        '            </div>' +
        '            <div class="block_line">' +
        '                <span class="block_title">哈希树根</span>' +
        '                <span class="block_value">'+data.head.merkleRoot+'</span>' +
        '            </div>' +
        '            <div class="block_line">' +
        '                <span class="block_title">时间戳</span>' +
        '                <span class="block_value">'+data.head.time+'</span>' +
        '            </div>' +
        '            <div class="block_line">' +
        '                <span class="block_title">难度系数</span>' +
        '                <span class="block_value">'+data.head.bits+'</span>' +
        '            </div>' +
        '            <div class="block_line">' +
        '                <span class="block_title">随机数</span>' +
        '                <span class="block_value">'+data.head.nonce+'</span>' +
        '            </div>' +
        '        </div>';
    $("#content").prepend(item);
    console.log("成功生成了一个区块！");
}

// 清空区块链
function cleanBlock(){
    $("#content").empty();
    lastBlock = "0000000000000000000000000000000000000000000000000000000000000000";
}

//
function createData(){
    var block = {
        "head" : randomHead(),
        "body" : randomBody()
    };

    // 计算merkleRoot
    block.head.merkleRoot = createMerkleRoot(block.body);

    // 头部除随机数意外的其他值
    var headTemp = block.head.version + block.head.prevBlock + block.head.time + block.head.bits;
    // 目标值
    var target = targetMax / block.head.bits;
    // 计算结果()
    var result = undefined;
    var headHash;
    var headHex;
    for (var i = 0; i < 100; i++) {
        headHash = CryptoJS.SHA256(CryptoJS.SHA256(headTemp + block.head.nonce));
        headHex = hashToHex(headHash);
        if (headHex < min) {
            min = headHex;
            console.log("第"+(i+1)+"次 - " + headHash.toString());
        }
        if (headHex < target){
            result = headHash.toString();
            block.head.headHash = result;
            lastBlock = result;
            //$("#info").text("结果 - 第"+(i+1)+"次 - " + result);
            break;
        }
        block.head.nonce = block.head.nonce + 1;
    }

    console.log("挖矿结束");
    if (result){
        $("#info").text("最新的区块 - " + result);
        return block;
    } else {
        $("#min").text("当前最小值 - "+ min);
        return null;
    }
}

// 生成一个区块头
function randomHead() {
    return {
        "version" : "1.0",
        "headHash": "",
        "prevHash": lastBlock,
        "merkleRoot" : "0",
        "time" : new Date().getTime(),
        "bits" : 1, //难度系数
        "nonce" : 0
    };
}

// 生成随机条数的交易记录集合
function randomBody(){
    var num = (Math.random()*10).toFixed(0);
    var data = new Array();
    for (var i = 0; i < num; i++) {
        data.push(randomRecord())
    }
    return data;
}

// 随机生成一条交易记录
function randomRecord() {
    var template = "[a]用户转给[b]用户,[c]个积分";
    var a = (Math.random()*100).toFixed(0);
    var b = (Math.random()*100).toFixed(0);
    var c = (Math.random()*1000).toFixed(0);
    template = template.replace("a",a);
    template = template.replace("b",b);
    template = template.replace("c",c);
    return template;
}

// 将hash对象转换为16进制 用于比较大小
function hashToHex(hash) {
    return "0x" + hash.toString();
}

// 简化的Merkle生成 暂时还是一次性计算，后期再添加真正的Merkle生成方式
// 想研究的童鞋可以自己实现一下
function createMerkleRoot(data) {
    var all = "";
    for (var i = 0; i < data.length; i++) {
        all += data[i];
    }
    return CryptoJS.SHA256(all);
}
