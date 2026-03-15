const axios = require("axios")

let cachedPrice = null
let lastFetch = 0

async function getPrice(){

  const now = Date.now()

  if(cachedPrice && now - lastFetch < 60000){
    return cachedPrice
  }

  const res = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=inr"
  )

  const price = res.data?.celo?.inr

  if(!price || price <= 0){
    throw new Error("FX rate unavailable")
  }

  cachedPrice = price
  lastFetch = now

  return price
}

async function inrToCelo(inr){

  const price = await getPrice()

  const celo = Number(inr) / price

  return Number(celo.toFixed(6))

}

module.exports = inrToCelo
