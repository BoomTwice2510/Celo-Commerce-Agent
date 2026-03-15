const axios = require("axios")

async function inrToCelo(inr){
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=inr"
  )
  const price = res.data?.celo?.inr
  if(!price || price <= 0){
    throw new Error("FX rate unavailable")
  }
  const celo = inr / price
  return celo.toFixed(6)
}

module.exports = inrToCelo
