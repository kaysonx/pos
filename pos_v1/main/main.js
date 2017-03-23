'use strict';

const printReceipt = (tags) => {
  let allGoodsCount = getAllGoodsCount(tags)
  let allGoodsCountInfo = getAllGoodsInfo(allGoodsCount)
  let allGoodsCountInfoPromotion = getAllGoodsPromotion(allGoodsCountInfo)
  let receiptInfo = countAllGoodsPrice(allGoodsCountInfoPromotion)
  printGoodsInfo(receiptInfo)
}

const getAllGoodsCount = (userBarcodes) => {
  let allGoodsCount = []
  userBarcodes.map(userBarcode => {
    let {
      barcode,
      count
    } = resolveUserBarcode(userBarcode)
    let findResult = findByBarcode(allGoodsCount, barcode)
    if (findResult == null) {
      allGoodsCount.push({
        barcode: barcode,
        count: count
      })
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

const countAllGoodsPrice = (allGoods) => {
  let allGoodsPrice = 0
  let allGoodsSaved = 0
  let cartItems = allGoods.map(goods => {
    let goodsPriceInfo = countGoodsPrice(goods)
    goods.total = goodsPriceInfo.total
    goods.savedPrice = goodsPriceInfo.savedPrice
    allGoodsPrice += goods.total
    allGoodsSaved += goods.savedPrice
    return goods
  })
  return {
    cartItems: cartItems,
    allGoodsPrice: allGoodsPrice,
    allGoodsSaved: allGoodsSaved
  }
}

const countGoodsPrice = (goods) => {
  switch (goods.promotion_type) {
    case 'BUY_TWO_GET_ONE_FREE':
      if (goods.count > 2) {
        return {
          savedPrice: goods.price,
          total: (goods.count - 1) * goods.price
        }
      }
    default:
      return {
        savedPrice: 0,
        total: goods.count * goods.price
      }
  }
}

const printGoodsInfo = (receiptInfo) => {
  let printInfo = `***<没钱赚商店>收据***`
  for (let goodInfo of receiptInfo.cartItems) {
    let goodInfoStr = `\n名称：${goodInfo.name}，数量：${goodInfo.count}${goodInfo.unit}，单价：${goodInfo.price.toFixed(2)}(元)，小计：${goodInfo.total.toFixed(2)}(元)`
    printInfo += goodInfoStr
  }
  printInfo += `\n----------------------\n总计：${receiptInfo.allGoodsPrice.toFixed(2)}(元)
节省：${receiptInfo.allGoodsSaved.toFixed(2)}(元)\n**********************`
  console.log(printInfo)
}

