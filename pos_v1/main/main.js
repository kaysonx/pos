'use strict';

function printReceipt(tags) {

    let countGoodsInfo = countGoods(tags)
    let basicGoodsInfo = getGoodsInfo(countGoodsInfo)
    let basicGoodsInfo_promotion = getGoodsPromotion(basicGoodsInfo)
    let finalResult = countGoodsPrice(basicGoodsInfo_promotion)
    printGoodsInfo(finalResult)
    // console.log(finalResult)

}
function toDecimal2(x) {
    var fNum = Math.round(x * 100) / 100;
    var result = fNum.toString();
    var index = result.indexOf('.');
    if (index < 0) {
        index = result.length;
        result += '.';
    }
    while (result.length <= index + 2) {
        result += '0';
    }
    return result;
}



function printGoodsInfo(receiptInfo) {
    let printInfo = `***<没钱赚商店>收据***`
    for (let goodInfo of receiptInfo.goods) {
        let goodInfoStr = `\n名称：${goodInfo.name}，数量：${goodInfo.count}${goodInfo.unit}，单价：${toDecimal2(goodInfo.price)}(元)，小计：${toDecimal2(goodInfo.total)}(元)`
        printInfo += goodInfoStr
    }

    printInfo += `\n----------------------
总计：${toDecimal2(receiptInfo.savedPrice)}(元)
节省：${toDecimal2(receiptInfo.realPrice - receiptInfo.savedPrice)}(元)
**********************`

    console.log(printInfo)
}

function countGoodsPrice(goods) {
    let finalResult = {}
    finalResult.realPrice = 0
    finalResult.savedPrice = 0
    finalResult.goods = []
    for (let index = 0; index < goods.length; index++) {
        let good = goods[index];
        good.total = countGoodPrice(good)
        finalResult.realPrice += good.count * good.price
        finalResult.savedPrice += good.total
        finalResult.goods.push(good)
    }
    return finalResult
}

function countGoodPrice(good) {
    switch (good.promotion_type) {
        case 'BUY_TWO_GET_ONE_FREE':
            return good.count > 2 ? (good.count - 1) * good.price : good.count * good.price
        default:
            return good.count * good.price
    }
}


function getGoodsInfo(barcodeInfo) {
    let resultGoods = []
    let items = loadAllItems()
    for (let index = 0; index < barcodeInfo.length; index++) {
        let barcodeItem = barcodeInfo[index];
        let findItem = null
        for (let item of items) {
            if (item.barcode == barcodeItem.barcode) {
                findItem = item
                break;
            }
        }
        findItem.count = barcodeItem.count
        resultGoods.push(findItem)
    }
    return resultGoods
}

function getGoodsPromotion(basicGoodsInfo) {
    let resultGoods = []
    let promotions = loadPromotions()
    for (let index = 0; index < basicGoodsInfo.length; index++) {
        let basicItem = basicGoodsInfo[index];
        let findPromotion = null
        for (let promotion of promotions) {
            if (promotion.barcodes.indexOf(basicItem.barcode) !== -1) {
                findPromotion = promotion
                break;
            }
        }
        basicItem.promotion_type = findPromotion == null ? "" : findPromotion.type
        resultGoods.push(basicItem)
    }
    return resultGoods
}


function countGoods(codes) {
    let resultGoods = []
    let split = []
    let barcode = ''
    let count = 0
    for (let index = 0; index < codes.length; index++) {
        let code = codes[index];
        split = code.split('-')
        barcode = split[0]
        count = split.length == 1 ? 1 : parseFloat(split[1])
        let findResult = findObject(resultGoods, barcode)
        if (findResult == null) {
            resultGoods.push({ 'barcode': barcode, 'count': count })
        } else {
            findResult.count += count
        }
    }
    return resultGoods
}


function findObject(objs, barcode) {
    for (let obj of objs) {
        if (obj.barcode === barcode) {
            return obj
        }
    }
    return null
}



