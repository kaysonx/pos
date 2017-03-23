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
    if (findResult === null) {
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
  count = count === undefined ? 1 : parseFloat(count)
  return {
    barcode,
    count
  }
}

const findByBarcode = (array, barcode) => {
  let [searchResult] = array.filter(a => a.barcode === barcode)
  return searchResult !== undefined ? searchResult : null
}

const getAllGoodsInfo = (barcodeInfo) => {
  let items = loadAllItems()
  return barcodeInfo.map(goods => {
    let [searchItem] = items.filter(item => item.barcode === goods.barcode)
    return Object.assign({}, searchItem, {
      count: goods.count
    })
  })
}

const getAllGoodsPromotion = (allGoodsInfoCount) => {
  let promotions = loadPromotions()
  return allGoodsInfoCount.map(goods => {
    let [findPromotion] = promotions.filter(p => p.barcodes.includes(goods.barcode))
    return Object.assign({}, goods, {
      promotion_type: findPromotion !== undefined ? findPromotion.type : ""
    })
  })
}

const countAllGoodsPrice = (allGoods) => {
  let allGoodsPrice = 0
  let allGoodsSaved = 0
  let cartItems = allGoods.map(goods => {
    let {
      total,
      savedPrice
    } = countGoodsPrice(goods)
    allGoodsPrice += total
    allGoodsSaved += savedPrice
    return Object.assign({}, goods, {
      total,
      savedPrice
    })
  })
  return {
    cartItems,
    allGoodsPrice,
    allGoodsSaved
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
    printInfo += `\n名称：${goodInfo.name}，数量：${goodInfo.count}${goodInfo.unit}，单价：${goodInfo.price.toFixed(2)}(元)，小计：${goodInfo.total.toFixed(2)}(元)`
  }
  printInfo += `\n----------------------\n总计：${receiptInfo.allGoodsPrice.toFixed(2)}(元)\n节省：${receiptInfo.allGoodsSaved.toFixed(2)}(元)\n**********************`
  console.log(printInfo)
}

