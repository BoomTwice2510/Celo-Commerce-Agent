import { ethers } from "ethers"

export default async function handler(req, res) {

  // केवल POST request allow
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    })
  }

  try {

    const { address, amount } = req.body

    if (!address || !amount) {
      return res.status(400).json({
        success: false,
        error: "address and amount required"
      })
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)

    const wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      provider
    )

    const tx = await wallet.sendTransaction({
      to: address,
      value: ethers.parseEther(amount.toString())
    })

    await tx.wait()

    return res.status(200).json({
      success: true,
      txHash: tx.hash
    })

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    })

  }

}
