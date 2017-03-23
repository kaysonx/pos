'use strict';

function printReceipt(tags) {

    let countGoodsInfo = countGoods(tags)
    let basicGoodsInfo = getGoodsInfo(countGoodsInfo)
    let basicGoodsInfo_promotion = getGoodsPromotion(basicGoodsInfo)
    console.log(basicGoodsInfo_promotion)

}

function countGoodsPrice(goods) {
    let finalResult = {}
    for (var index = 0; index < goods.length; index++) {
        var good = goods[index];
        good.total = countGoodPrice(good)
    }
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
    for (var index = 0; index < barcodeInfo.length; index++) {
        var barcodeItem = barcodeInfo[index];
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
    for (var index = 0; index < basicGoodsInfo.length; index++) {
        var basicItem = basicGoodsInfo[index];
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
    for (var index = 0; index < codes.length; index++) {
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



