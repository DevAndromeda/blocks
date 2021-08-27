const { resolve } = require("path");
const { setFailed } = require("@actions/core");
const { exec } = require("@actions/exec");
const { which } = require("@actions/io");

async function run() {
    try {
        await exec(await which("bash", true), ["src/action.sh"], {
            cwd: resolve(__dirname, "..")
        });
    } catch (error) {
        setFailed(error.message);
    }
}

run();