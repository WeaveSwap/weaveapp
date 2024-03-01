const { network } = require("hardhat")

const moveTime = async (time) => {
    console.log(`Moving forward in time for ${time} seconds...`)
    await network.provider.send("evm_increaseTime", [time])
    console.log("Moved forward in time succesfully!!!")
}

module.exports = {
    moveTime,
}
