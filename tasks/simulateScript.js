const {task} = require("hardhat/config");
const {simulateScript} = require("@chainlink/functions-toolkit");

task("functions-simulate-script","Simulates the Javascript source code execution")
.setAction(async(taskArgs, hre) => {
    const requestConfig = require("../Functions-request-config.js");

    console.log("Starting Simulation");
    console.log("Token:",requestConfig.args[0]);

    try{
        // const simulator = new FunctionSimulator();

        const { responseBytesHexstring, errorString } = await simulateScript({
            source: requestConfig.source,
            args: requestConfig.args,
            secrets: requestConfig.secrets || {},
            bytesArgs: [],
            maxExecutionTimeMs: 10000
          })

           
        if (errorString) {
        console.log("❌ Simulation Error:", errorString)
        return
        }

        console.log("✅ Simulation Successful!")
        console.log("Response (hex):", responseBytesHexstring)
        
        // Decode the response based on expected return type
        if (requestConfig.expectedReturnType === "uint256") {
          const responseInt = BigInt(responseBytesHexstring)
          console.log("🎯 Attention Score:", responseInt.toString())
        }
        
    }
    catch(error){
        console.error("❌ Simulation failed:", error.message)
    }


})
