import { promises } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import functions from "./functions.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function ffmpeg(buffer, args = [], ext = '', ext2 = '', fileName = 'Convert-') {
    return new Promise(async (resolve, reject) => {
        try {
        let tmp = join(__dirname, "../sessions", "media", `${fileName+functions.getRandom(ext, "3")}`)
        let out = tmp + '.' + ext2;
        await promises.writeFile(tmp, buffer)
        spawn('ffmpeg', [
            '-y',
            '-i', tmp,
            ...args,
            out
        ])
            .on('error', reject)
            .on('close', async (code) => {
            try {
                await promises.unlink(tmp)
                if (code !== 0) return reject(code)
                resolve({
                data: await promises.readFile(out),
                filename: out,
                delete() {
                    return promises.unlink(out)
                }
                })
            } catch (e) {
                reject(e)
            }
            })
        } catch (e) {
        reject(e)
        }
    })
}

/**
 * Convert Audio to Playable WhatsApp Audio
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toPTT(buffer, out, ext) {
    return ffmpeg(buffer, [
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-vbr', 'on',
    ], ext, 'ogg', out)
}

/**
 * Convert Audio to Playable WhatsApp PTT
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toAudio(buffer, ext, out) {
    return ffmpeg(buffer, [
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-vbr', 'on',
        '-compression_level', '10'
    ], ext, 'opus', out)
}

/**
 * Convert Audio to Playable WhatsApp Video
 * @param {Buffer} buffer Video Buffer
 * @param {String} ext File Extension 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toVideo(buffer, ext, out) {
    return ffmpeg(buffer, [
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-ab', '128k',
        '-ar', '44100',
        '-crf', '32',
        '-preset', 'slow'
    ], ext, 'mp4', out)
}
export { ffmpeg, toAudio, toPTT, toVideo}