import got from "got";
import fs from "fs";
import path from "path";
import { toBuffer, downloadContentFromMessage } from "@whiskeysockets/baileys";
import { fileTypeFromBuffer } from "file-type";

export default {
    welcome(language) {
        if (language === '1') {
        return (`Welcome to *AI-BE WhatsApp Bot*! 🤖✨

Hello! 😊 I am AutoAI, your smart assistant who is ready to help answer all your questions, and can even create and send images according to your request! 🎨
Here are some features that you can use:

- _Type self/public in the group if you want to turn off/turn on the bot feature in the group._

- _Type search [search] to search for videos on Youtube._

- _Type play [song title] to search and play music._

- _Type video [video title] to search and play video._

- _Type sticker [image] to convert image to sticker._

- _Send YouTube video URL to download video or audio._

- _Send TikTok/Instagram/Facebook URL to download content from those platforms._

- _Send any questions or topics, and I will try to provide the best answer for you._

- _Ask me to create images with the details you want._

> If there are any errors or obstacles, do not hesitate to contact the admin at 62895375950107.

*Enjoy our services!* ✨`.trim());
        } else {
            return (`Selamat datang di *AI-BE WhatsApp Bot*! 🤖✨

Halo! 😊 Saya AutoAI, asisten pintar Anda yang siap membantu menjawab semua pertanyaan Anda, dan bahkan dapat membuat dan mengirim gambar sesuai permintaan Anda! 🎨
Berikut ini beberapa fitur yang bisa kamu gunakan:

- _Ketik self/public pada group jika ingin mematikan/menyalakan fitur bot dalam group._

- _Ketik cari [pencarian] untuk mencari video di Youtube._

- _Ketik play [judul lagu] untuk mencari dan memutar musik._

- _Ketik video [judul video] untuk mencari dan memutar video._

- _Ketik stiker [gambar] untuk mengubah gambar menjadi stiker._

- _Kirim URL video YouTube untuk mengunduh video atau audio._

- _Kirim URL TikTok/Instagram/Facebook untuk mengunduh konten dari platform tersebut._

- _Kirim pertanyaan atau topik apa pun, dan saya akan mencoba memberikan jawaban terbaik untuk kamu._

- _Minta saya untuk membuat gambar dengan detail yang kamu inginkan._

> Jika terjadi kesalahan atau kendala, jangan ragu untuk menghubungi admin di 62895375950107.

*Nikmati layanan kami!* ✨`);
        }
    },
    async downloadMediaMessage(m) {
            const message = (m.msg || m).mimetype || '';
            const type = m.mtype ? m.mtype.replace(/Message|WithCaption/gi, '') : message.split('/')[0];
            const data = await downloadContentFromMessage(m, type);
            let buffer = Buffer.from([]);
            for await (let i of data) buffer = Buffer.concat([buffer, i]);
            return buffer;
        },
    getContentType(object) {
        if (object) {
            const keys = Object.keys(object);
            const key = keys.find(x => (x === 'conversation' || x.endsWith('Message') || x.includes('V2') || x.includes('V3')) && x !== 'senderKeyDistributionMessage');
            return key ? key : keys[0];
        }
    },
    isImage(msg) {
        return Boolean(msg?.message?.imageMessage);
    },
    isAudio(msg) {
        return Boolean(msg?.message?.audioMessage);
    },
    isPdf(msg) {
        return msg?.message?.documentMessage?.mimetype === 'application/pdf';
    },
    isPdfWithCaption(msg) {
        return msg?.message?.documentWithCaptionMessage?.message.documentMessage?.mimetype === 'application/pdf';
    },
    isQuotedMessage(msg, type) {
        return Boolean(msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[type]);
    },
    divideTextInTokens(text, maxTokens = 10000) {
        const tokens = text.split(' ')
        const segments = []
        let currentSegment = []
        tokens.forEach((token) => {
            if (currentSegment.length + 1 <= maxTokens) {
                currentSegment.push(token)
            } else {
                segments.push(currentSegment.join(' '))
                currentSegment = [token]
            }
        })
        if (currentSegment.length > 0) {
            segments.push(currentSegment.join(' '))
        }
        return segments
    },
    isAllowedText(text, allowedWords) {
        if (allowedWords instanceof RegExp) {
            return allowedWords.test(text.trim());
        }
        if (typeof allowedWords === 'string') {
            return text.trim() === allowedWords;
        }
        if (Array.isArray(allowedWords)) {
            const escapedWords = allowedWords.map(word =>
                word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
            );
            const regex = new RegExp(`^(${escapedWords.join('|')})$`, 'i');
            return regex.test(text.trim());
        }
        return false;
    },
    isValidURL(text) {
        const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9\-._~%]+)(:[0-9]{1,5})?(\/[a-zA-Z0-9\-._~%]*)*(\?[a-zA-Z0-9\-._~%&=]*)?(#[a-zA-Z0-9\-._~%]*)?$/;
        if (!urlPattern.test(text)) {
            return false;
        }
        try {
            const url = new URL(text.startsWith("http") ? text : `http://${text}`);
            return url.hostname.includes(".");
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    extractFirstLink(text) {
        const regex = /(https?:\/\/[^\s]+)/i;
        const match = text.match(regex);
        return match ? match[0] : null;
    },
    isBase64(str) {
        return Buffer.from(str, 'base64').toString('base64') === str;
    },
    format(obj) {
        return JSON.stringify(obj, null, 2)
    },
    random(list) {
        return list[Math.floor(Math.random() * list.length)]
    },
    randomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
    },
    getRandom(ext = "", length = "10") {
    let result = ""
    let character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
    let characterLength = character.length
    for (let i = 0; i < length; i++) {
        result += character.charAt(Math.floor(Math.random() * characterLength))
    }
    return `${result}${ext ? `.${ext}` : ""}`
    },
    truncateText(text, wordLimit) {
        const words = text.split(' ');
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(' ') + '...';
        } else {
            return text;
        }
    },
    delay(time) {
        return new Promise(res => setTimeout(res, time));
    },
    mapList(data, top, footer) {
        const symbol = this.random(["⟰", "♕", "♔", "✪", "✽", "✦", "★", "⁂", "✇", "✡", "≛", "☀"]);
        const header = `*<===[ ${top ? `${symbol} ${top} ${symbol}` : `${symbol} SEARCH RESULT ${symbol}`} ]===>*`;
        const stringifyValue = (value) => {
        if (typeof value === 'object' && value !== null) {
            return Object.entries(value).map(([key, val]) => `*${key.toUpperCase()}:* ${stringifyValue(val)}`).join('\n');
        }
        return `_${typeof value === "string" ? value.trim() : value}_`;
        };
        const generateField = (v, index) => {
        const fields = Object.entries(v).map(([key, value]) => `*${key.toUpperCase()}:* ${stringifyValue(value)}`).join('\n');
        return `*[${index + 1}]* ${fields}`;
        };
        const body = data.map((v, i) => generateField(v, i)).join(`\n<==== *AI-BE* ====>\n\n`);
        return `${header}${footer ? `\n\n${footer}` : ''}\n\n${body}`;
    },
    async fetchBuffer(PATH, options = {}, responseType = 'buffer') {
        const basePath = "./sessions";
        const mediaPath = path.join(basePath, "media");
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath);
            console.log('Folder ./sessions created.');
        }
        if (!fs.existsSync(mediaPath)) {
            fs.mkdirSync(mediaPath);
            console.log('Folder ./sessions/media created.');
        }
        let filename = this.getRandom('unknown', 3), data;
        try {
            if (/^https?:\/\//.test(PATH)) {
                const headers = {
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Upgrade-Insecure-Requests": "1",
                    "User-Agent": options.randomUA ? this.randomUA() : "Mozilla/5.0",
                    ...options.headers,
                };
                const response = await got(PATH, {
                    headers,
                    responseType,
                    ...options,
                });
                if (responseType === 'stream') {
                    data = await toBuffer(response.rawBody);
                } else {
                    data = response.rawBody;
                }
                const contentDisposition = response.headers['content-disposition'];
                const filenameMatch = contentDisposition?.match(/filename=(?:(?:"|')(.*?)(?:"|')|([^""\s]+))/);
                filename = filenameMatch ? decodeURIComponent(filenameMatch[1] || filenameMatch[2]) : filename;
            } 
            else if (/^data:.*?\/.*?;base64,/i.test(PATH) || this.isBase64(PATH)) {
                data = Buffer.from(PATH.split(',')[1] || PATH, 'base64');
            }
            else if (fs.existsSync(PATH) && fs.statSync(PATH).isFile()) {
                data = fs.readFileSync(PATH);
                filename = PATH.split('/').pop();
            }
            else if (Buffer.isBuffer(PATH)) {
                data = PATH;
            } 
            else {
                data = Buffer.alloc(20);
            }
            const fileType = await fileTypeFromBuffer(data) || { mime: 'application/octet-stream', ext: 'bin' };
            const size = Buffer.byteLength(data);
            const save = './sessions/media/' + filename;
            await fs.promises.writeFile(save, data);
            return { data, filename, mimetype: fileType.mime, ext: fileType.ext, size };
        } catch (error) {
            console.error('Error fetching buffer:', error.message);
            throw error;
        }
    },
    async fetchJson(url, options = {}) {
        try {
            const response = await got(url, {
                headers: {
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "User-Agent": this.randomUA(),
                    ...(options.headers || {}),
                },
                responseType: "json",
                ...options,
            });
            return response.body;
        } catch (error) {
            throw new Error(`Failed to fetch JSON: ${error.message}`);
        }
    },
    randomUA() {
        const UAs = [
            "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 6.1 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 6.3 WOW64 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4",
            "Mozilla/5.0 (Windows NT 10.0 WOW64 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 6.1 WOW64 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (Windows NT 6.3 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (X11 Ubuntu Linux x86_64 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 6.1 WOW64 Trident/7.0 rv:11.0) like Gecko",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10.12 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_12_4) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30",
            "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0 WOW64 Trident/7.0 rv:11.0) like Gecko",
            "Mozilla/5.0 (Windows NT 10.0 Win64 x64 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
            "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
            "Mozilla/5.0 (Windows NT 6.1 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10.11 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.104 Safari/537.36",
            "Mozilla/5.0 (Windows NT 6.1 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_11_6) AppleWebKit/603.2.5 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.5",
            "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/58.0.3029.110 Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0 WOW64 rv:54.0) Gecko/20100101 Firefox/54.0",
            "Mozilla/5.0 (Windows NT 6.1 Trident/7.0 rv:11.0) like Gecko",
            "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15063",
            "Mozilla/5.0 (Windows NT 6.1 WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (X11 Linux x86_64 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 OPR/45.0.2552.888",
            "Mozilla/5.0 (Windows NT 6.1 Win64 x64 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (X11 Linux x86_64 rv:45.0) Gecko/20100101 Firefox/45.0",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_10_5) AppleWebKit/603.2.5 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.5",
            "Mozilla/5.0 (Windows NT 10.0 WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 6.3 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
            "Mozilla/5.0 (iPad CPU OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.0 Mobile/14F89 Safari/602.1",
            "Mozilla/5.0 (Windows NT 6.1 WOW64 rv:52.0) Gecko/20100101 Firefox/52.0",
            "Mozilla/5.0 (Windows NT 6.1 WOW64 rv:54.0) Gecko/20100101 Firefox/54.0",
            "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
            "Mozilla/5.0 (X11 Ubuntu Linux x86_64 rv:54.0) Gecko/20100101 Firefox/54.0",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_12_3) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8",
            "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36 OPR/45.0.2552.812",
            "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 5.1 rv:52.0) Gecko/20100101 Firefox/52.0",
            "Mozilla/5.0 (X11 Linux x86_64 rv:52.0) Gecko/20100101 Firefox/52.0",
            "Mozilla/5.0 (Windows NT 6.1 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.104 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36",
            "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10.12 rv:54.0) Gecko/20100101 Firefox/54.0",
            "Mozilla/5.0 (Windows NT 6.1 WOW64 rv:40.0) Gecko/20100101 Firefox/40.1",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10.10 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
            "Mozilla/5.0 (compatible MSIE 9.0 Windows NT 6.0 Trident/5.0 Trident/5.0)",
            "Mozilla/5.0 (Windows NT 6.1 WOW64 rv:45.0) Gecko/20100101 Firefox/45.0",
            "Mozilla/5.0 (compatible MSIE 9.0 Windows NT 6.1 Trident/5.0 Trident/5.0)",
            "Mozilla/5.0 (Windows NT 6.1 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36",
            "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0 Win64 x64 rv:54.0) Gecko/20100101 Firefox/54.0",
            "Mozilla/5.0 (iPad CPU OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
            "Mozilla/5.0 (Windows NT 10.0 WOW64 rv:52.0) Gecko/20100101 Firefox/52.0",
            "Mozilla/5.0 (Windows NT 6.1 WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
            "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.104 Safari/537.36",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.104 Safari/537.36",
            "Mozilla/5.0 (X11 Fedora Linux x86_64 rv:53.0) Gecko/20100101 Firefox/53.0",
            "Mozilla/5.0 (Macintosh Intel Mac OS X 10_11_6) AppleWebKit/601.7.7 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7",
            "Mozilla/5.0 (Windows NT 10.0 WOW64 Trident/7.0 Touch rv:11.0) like Gecko",
            "Mozilla/5.0 (Windows NT 6.2 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Mozilla/5.0 (Windows NT 6.3 WOW64 Trident/7.0 rv:11.0) like Gecko"
        ]
        return UAs[Math.floor(Math.random() * UAs.length)];
    }
};
