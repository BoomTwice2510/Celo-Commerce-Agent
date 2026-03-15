require("dotenv").config()
const { ethers } = require("ethers")

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)

const wallet = new ethers.Wallet(
 process.env.PRIVATE_KEY,
 provider
)

async function sendTx(address, amount){

 const tx = await wallet.sendTransaction({
  to: address,
  value: ethers.parseEther(amount.toString())
 })

 await tx.wait()

 return tx.hash
}

module.exports = sendTx