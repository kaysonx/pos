'use strict';

function printReceipt(tags) {
    let countGoodsInfo = getAllGoodsCount(tags)
    let basicGoodsInfo = getAllGoodsInfo(countGoodsInfo)
    let basicGoodsInfo_promotion = getAllGoodsPromotion(basicGoodsInfo)
    let finalResult = countGoodsPrice(basicGoodsInfo_promotion)
    printGoodsInfo(finalResult)

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
    let finalResult = {
        realPrice: 0,
        savedPrice: 0,
        goods: []
    }
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



const getAllGoodsInfo = (barcodeInfo) => {
    let items = loadAllItems()
    return barcodeInfo.map(goods => {
        let searchItems = items.filter(item => item.barcode === goods.barcode)
        searchItems[0].count = goods.count
        return searchItems[0]
    })
}


const getAllGoodsPromotion = (allGoodsInfoCount) => {
    let promotions = loadPromotions()
    return allGoodsInfoCount.map(goods => {
        let findPromotion = promotions.filter(p => p.barcodes.includes(goods.barcode))
        if (findPromotion.length > 0) {
            goods.promotion_type = findPromotion[0].type
        } else {
            goods.promotion_type = ""
        }
        return goods
    })
}



const getAllGoodsCount = (userBarcodes) => {
    let allGoodsCount = []
    userBarcodes.map(userBarcode => {
        let { barcode, count } = resolveUserBarcode(userBarcode)
        let findResult = findByBarcode(allGoodsCount, barcode)
        if (findResult == null) {
            allGoodsCount.push({ barcode: barcode, count: count })
        } else {
            findResult.count += count
        }
    })
    return allGoodsCount
}

const resolveUserBarcode = (userBarcode) => {
    let [barcode, count] = userBarcode.split('-')
    count = count == undefined ? 1 : parseFloat(count)
    return {
        barcode,
        count
    }
}


const findByBarcode = (array, barcode) => {
    let searchResult = array.filter(a => a.barcode === barcode)
    return searchResult.length > 0 ? searchResult[0] : null
}

