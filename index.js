const fs = require("fs");
const { promisify } = require("util");
const rimraf = promisify(require("rimraf"));
const BLOCKS_PATH = `${__dirname}/blocks`;
const GLOBAL_PATH = `${__dirname}/metadata.json`;
const BASE_REQUIRED_FIELDS = ["data", "meta.json"];
const META_REQUIRED_FIELDS = [
    "name",
    "version",
    "description",
    "author"
];
const BLOCK_REQUIRED_FIELDS = [
    "name",
    "description",
    "code"
];
const load = (id) => {
    try {
        const data = require(id);
        return data;
    } catch {
        return null;
    }
};

const loadFile = (id) => {
    try {
        const data = fs.readFileSync(id, { encoding: "utf-8" });
        return data;
    } catch {
        return null;
    }
};

function verifyMeta(path) {
    const metadata = load(path);
    if (!metadata) return { verified: false, data: metadata };

    for (const m of META_REQUIRED_FIELDS) {
        if (!metadata[m]) {
            return { verified: false, data: metadata };
        }
    }

    return { verified: true, data: metadata };
}

function verifyBlock(path) {
    const block = load(path);
    if (!block) return { verified: false, data: block };

    for (const item of BLOCK_REQUIRED_FIELDS) {
        if (!block[item]) return { verified: false, data: block };
    }

    if (block["args"] && !Array.isArray(block["args"])) return { verified: false, data: block };

    return { verified: true, data: block };
}

function checkBlocks() {
    const blocks = (fs.readdirSync(BLOCKS_PATH) || []), invalid = [], valid = [];

    for (const _block of blocks) {
        const block = fs.readdirSync(`${BLOCKS_PATH}/${_block}`) || [];
        let ignore = false;

        for (const required of BASE_REQUIRED_FIELDS) {
            if (!block.some(x => x === required)) {
                console.warn(`[ERROR] Ignoring ${_block} because it's missing ${required}!`);
                ignore = true;
                break;
            }
        }

        if (ignore) {
            invalid.push(`${BLOCKS_PATH}/${_block}`);
            continue;
        };

        const meta = verifyMeta(`${BLOCKS_PATH}/${_block}/meta.json`);
        if (!meta.verified) {
            invalid.push(`${BLOCKS_PATH}/${_block}`);
            continue;
        }

        const blockData = fs.readdirSync(`${BLOCKS_PATH}/${_block}/data`) || [];
        const finalMeta = {
            info: meta.data,
            blocks: [],
            readme: loadFile(`${BLOCKS_PATH}/${_block}/README.md`),
            timestamp: Date.now(),
            path: `/blocks/${_block}`
        };

        for (const blockExt of blockData) {
            const blockMeta = verifyBlock(`${BLOCKS_PATH}/${_block}/data/${blockExt}`);
            if (!blockMeta.verified) {
                console.warn(`[ERROR] Ignoring ${_block} because it's missing blocks data!`);
                ignore = true;
                break;
            } else {
                finalMeta.blocks.push({
                    ...blockMeta.data,
                    file_path: `/blocks/${_block}/data/${blockExt}`
                });
            }
        }

        if (ignore) {
            invalid.push(`${BLOCKS_PATH}/${_block}`);
            break;
        } else {
            valid.push(finalMeta);
        }
    }

    if (!invalid.length) {
        console.log("[SUCCESS] All blocks verified!");
        makeGlobalData(valid);
    } else {
        Promise.all(invalid.map(m => remove(m)))
            .catch(() => {})
            .finally(() => makeGlobalData(valid));
    }
};

async function remove(path) {
    console.log(`[INFO] Removing ${path}...`);
    await rimraf(path);
    console.log(`[INFO] Removed ${path}!`);
}

function makeGlobalData(blocks = []) {
    const data = JSON.stringify(blocks.sort((a, b) => a.info.name.localeCompare(b.info.name)));
    fs.writeFile(GLOBAL_PATH, data, (err) => {
        if (err) console.error(err);
        else console.log("Generated global metadata!");
    });
}

checkBlocks()