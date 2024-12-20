/*<============== CREDITS ==============>
	Author: berkahesportid
	Github: https://github.com/BerkahEsport/
	Contact me: 62895375950107
	
	Do not delete the source code.
	It is prohibited to sell and buy
	WhatsApp BOT scripts
	without the knowledge
	of the script owner.
	
	Selling = Sin 
	
	Thank you to Allah S.W.T
<============== CREDITS ==============>*/
import got from "got";
import fs from "fs";
import functions from "./functions.js";
import {writeExif} from "./sticker.js";
const RestAPIs = "https://api.siputzx.my.id/"; // Thanks APIs for siputzx
export default async (sock, sender, msg, text, buffer) => {
    const sendFile = async (jid, url, fileName = "", caption = "", quoted = "", options = {}) => {
		let { mimetype: mime, data: buffer, ext, filename, size } = await functions.fetchBuffer(url);
        filename = typeof filename == "object" ? functions.getRandom("unknown", 3) : filename
		console.log(`Saved in: ${filename}.${ext}`);
        if (caption == null || !caption) {
			caption = `Name file: ${filename}\nSize file: ${size} KB`
		}
		mime = options.mime || mime
		let data = {}
        if (options.asDocument || size >= 40000000) data = {
            document: buffer, 
            mimetype: mime, 
            caption: typeof caption == "object" ? functions.format(caption) : caption,
            fileName: fileName ? `${fileName}.${ext}` : `${filename+functions.getRandom("", 3)}.${ext}`
            }
        else if (options.asSticker || /webp/.test(mime)) {
            let pathFile = await writeExif({ mimetype: mime, data: buffer }, fileName)
            data = { sticker: fs.readFileSync(pathFile), mimetype: "image/webp" }
        }
        else if (/image/.test(mime)) data = {
            image: buffer, 
            fileName: fileName ? `${fileName}.${ext}` : `${filename+functions.getRandom("", 3)}.${ext}`, 
            caption : typeof caption == "object" ? functions.format(caption) :  caption, 
            mimetype: options.mime ? options.mime : "image/png"
        }
        else if (/video/.test(mime)) data = {
            video: buffer, 
            fileName: fileName ? `${fileName}.${ext}` : `${filename+functions.getRandom("", 3)}.${ext}`, 
            caption : typeof caption == "object" ? functions.format(caption) :  caption, 
            mimetype: options.mime ? options.mime : "video/mp4"
        } 
        else if (/audio|m4a/.test(mime)) data = {
            audio: buffer,
            fileName: fileName ? `${fileName}.${ext}` : `${filename+functions.getRandom("", 3)}.${ext}`, 
            caption : typeof caption == "object" ? functions.format(caption) :  caption, 
            mimetype: options.mime ? options.mime : "audio/mpeg"
        }
	let msg = await sock.sendMessage(jid, data, { ephemeralExpiration: 1000000 || 604800, quoted, ...options })
	data = null
	return msg
	}

    let action = 'default', json = {};
    if (/play/i.test(text)) {
        action = 'play';
    } else if (/video/i.test(text)) {
        action = 'video';
    }  else if (/s|sticker/i.test(text)) {
        action = 'sticker';
    } else if (text.includes('youtube.com') || text.includes('youtu.be')) {
        if (text.includes('music.youtube.com') || text.includes('mp3')) {
            action = 'youtubeMusic';
        } else {
            action = 'youtubeVideo';
        }
    } else if (text.includes('facebook.com')) {
        action = 'facebook';
    } else if (text.includes('instagram.com')) {
        action = 'instagram';
    } else if (text.includes('tiktok.com')) {
        action = 'tiktok';
    } else if (text.includes('threads.net')) {
        action = 'threads';
    } else if (text.includes('capcut.com')) {
        action = 'capcut';
    } else if (text.includes('github.com')) {
        action = 'github';
    } else if (text.includes('drive.google.com')) {
        action = 'googleDrive';
    } else if (text.includes('sfile.mobi')) {
        action = 'sfile';
    } else if (text.includes('twitter.com') || text.includes('x.com')) {
        action = 'twitter';
    } else if (text.includes('telegram.me') || text.includes('t.me')) {
        action = 'telegramSticker';
    } else if (text.includes('play.google.com')) {
        action = 'googlePlay';
    } else if (text.includes('mediafire.com')) {
        action = 'mediafire';
    } else if (text.includes('pinterest.com')) {
        action = 'pinterest';
    } else if (text.includes('spotify.com')) {
        action = 'spotify';
    } else if (text.includes('doodstream.com')) {
        action = 'doodStream';
    } else if (text.includes('terabox.com')) {
        action = 'terabox';
    } else if (text.includes('mega.nz')) {
        action = 'mega';
    } else if (text.includes('snackvideo.com')) {
        action = 'snackvideo';
    } else if (text.includes('lahelu.com')) {
        action = 'lahelu';
    } else if (text.includes('soundcloud.com')) {
        action = 'soundcloud';
    }
    try {
        switch (action) {
            case 'play':
                json = await functions.fetchJson(RestAPIs+"api/d/youtube?q="+text);
                await sendFile(sender, json.data.sounds, json.data?.title || "Audio", "", msg);
            break;
            case 'video':
                json = await functions.fetchJson(RestAPIs+"api/d/youtube?q="+text);
                await sendFile(sender, json.data.video, json.data?.title || "Audio", "", msg);
            break;
            case 'sticker':
                if (!buffer) {
                    await sock.sendMessage(sender, { 
                    text: 'Please send a picture or reply to a picture message and type a sticker to create a sticker.', mentions: [sender] }, {
                    ephemeralExpiration: 1000000
                    });
                } else await sendFile(sender, buffer, "Sticker", "", msg, { asSticker: true});
            break
            case 'youtubeVideo':
                json = await functions.fetchJson(RestAPIs+"api/d/ytmp4?url="+text);
                await sendFile(sender, json.data.dl, json.data?.title || "Video", "", msg);
            break;
            case 'youtubeMusic':
                json = await functions.fetchJson(RestAPIs+"api/d/ytmp3?url="+text);
                await sendFile(sender, json.data.dl, json.data?.title || "Audio", "", msg);
            break;
            case 'facebook':
                json = await functions.fetchJson(RestAPIs+"api/d/facebook?url="+text);
                await sendFile(sender, json.data.video, "", "", msg);
            break;
            case 'instagram':
                json = await functions.fetchJson(RestAPIs+"api/d/igdl?url="+text);
                for (const item of json.data) {
                    await sendFile(sender, item.url, "", "", msg);
                    await functions.delay(1000);
                }
            break;
            case 'tiktok':
                json = await functions.fetchJson(RestAPIs+"api/tiktok?url="+text);
                for (const item of json.data.urls) {
                    await sendFile(sender, item, "", "", msg);
                    await functions.delay(1000);
                }
            break;
            case 'threads':
                json = await functions.fetchJson("https://btch.us.kg/download/threads?url="+text);
                await sendFile(sender, json.result?.video_urls?.[0] ? json.result?.video_urls?.[0] : json.result?.image_urls?.[0], "", "", msg);
            break;
            case 'capcut':
                json = await functions.fetchJson(RestAPIs+"api/d/capcut?url="+text);
                await sendFile(sender, json.data.originalVideoUrl, "", "", msg);
            break;
            case 'twitter':
                json = await functions.fetchJson(RestAPIs+"api/d/twitter?url="+text);
                await sendFile(sender, json.data.downloadLink, "", "", msg);
            break;
            case 'pinterest':
                json = await functions.fetchJson(RestAPIs+"api/d/pinterest?url="+text);
                await sendFile(sender, json.data.url, "", "", msg);
            break;
            case 'github':
                const data = await getGitHubRepoInfo(regex)
                sendFile(sender, data.link, data.filename, "", msg, {asDocument: true});
            break;
            case 'googleDrive':
                json = await functions.fetchJson(RestAPIs+"api/d/gdrive?url="+text);
                await sendFile(sender, json.data.download, "", "", msg);
            break;
            case 'sfile':
                await sock.sendMessage(sender, { 
                    text: 'Feature development in progress!', mentions: [sender] }, {
                    ephemeralExpiration: 1000000
                });
            break;
            case 'telegramSticker':
                await sock.sendMessage(sender, { 
                    text: 'Feature development in progress!', mentions: [sender] }, {
                    ephemeralExpiration: 1000000
                });
            break;
            case 'googlePlay':
                await sock.sendMessage(sender, { 
                    text: 'Feature development in progress!', mentions: [sender] }, {
                    ephemeralExpiration: 1000000
                });
            break;
            case 'mediafire':
                await sock.sendMessage(sender, { 
                    text: 'Feature development in progress!', mentions: [sender] }, {
                    ephemeralExpiration: 1000000
                });
            break;
            case 'spotify':
                json = await functions.fetchJson(RestAPIs+"api/d/spotify?url="+text);
                await sendFile(sender, json.download, "", "", msg);
            break;
            case 'doodStream':
                await sock.sendMessage(sender, { 
                    text: 'Feature development in progress!', mentions: [sender] }, {
                    ephemeralExpiration: 1000000
                });
            break;
            case 'terabox':
                await sock.sendMessage(sender, { 
                    text: 'Feature development in progress!', mentions: [sender] }, {
                    ephemeralExpiration: 1000000
                });
            break;
            case 'mega':
                await sock.sendMessage(sender, { 
                    text: 'Feature development in progress!', mentions: [sender] }, {
                    ephemeralExpiration: 1000000
                });
            break;
            case 'snackvideo':
                json = await functions.fetchJson(RestAPIs+"api/d/snackvideo?url="+text);
                await sendFile(sender, json.data.videoUrl, "", "", msg);
            break;
            case 'lahelu':
                json = await functions.fetchJson(RestAPIs+"api/d/lahelu?url="+text);
                for (const item of json.result.content) {
                    await sendFile(sender, item.value, "", "", msg);
                    await functions.delay(1000);
                }
            break;
            case 'soundcloud':
                json = await functions.fetchJson(RestAPIs+"api/d/soundcloud?url="+text);
                await sendFile(sender, json.data.url, "", "", msg);
            break;
            default:
                await sock.sendMessage(sender, {
                    text: "The message you entered does not match the download features provided.", mentions: [sender] }, {
                    ephemeralExpiration: 1000000
                });
            break;
        }
    } catch(e) {
        await sock.sendMessage(sender, {
            text: "The feature is having problems please try again later! Or contact the script owner contact: 62895375950107", mentions: [sender] }, {
            ephemeralExpiration: 1000000
        });
        console.log(e);
    }
};




async function getGitHubRepoInfo(text) {
    const regex = /github\.com\/([^/]+)\/([^/]+)/;
    let [_, username, repo] = text.match(regex) || [];
    if (!username || !repo) {
        throw new Error("Invalid GitHub text");
    }
    repo = repo.replace(/.git$/, "");
    const link = `https://api.github.com/repos/${username}/${repo}/zipball`;

    try {
        const response = await got.head(link);
        const contentDisposition = response.headers["content-disposition"];
        if (!contentDisposition) {
            throw new Error("Content-Disposition header not found");
        }
        const match = contentDisposition.match(/attachment; filename=(.*)/);
        if (!match || !match[1]) {
            throw new Error("Filename not found in Content-Disposition header");
        }
        const filename = match[1];
        return { link, filename };
    } catch (error) {
        throw new Error(`Failed to fetch repo info: ${error.message}`);
    }
}
