const runAgent = require("../engine")

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST allowed" })
    return
  }

  try {

    const { message } = req.body

    const result = await runAgent(message)

    res.status(200).json(result)

  } catch (err) {

    console.error(err)

    res.status(500).json({
      error: "Agent failed"
    })

  }

}