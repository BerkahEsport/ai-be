import got from "got";
import * as cheerio from "cheerio";

export async function search(query) {
    return new Promise(async (resolve, reject) => {
        try {
        const response = await got(`https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`, {
            headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36 OPR/81.0.4196.61',
            'sec-ch-ua': '"Opera GX";v="81", " Not;A Brand";v="99", "Chromium";v="95"'
            }
        });
        const $ = cheerio.load(response.body);
        let parseSearch = {};
        for (let i = 0; $('script').length > i; i++) {
            const initialData = $('script')[i];
            const inData = $(initialData).get()[0].children[0]?.data.includes('var ytInitialData = ');
            if (inData) {
            const inDataParse = $('script')[i];
            const inDataJson = $(inDataParse).get()[0].children[0].data.split('var ytInitialData = ')[1].replace(/;/g, '');
            parseSearch = JSON.parse(inDataJson);
            }
        }
        if (typeof parseSearch === 'object') {
            const content = parseSearch['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'];
            const searchData = content.length === 2 ? content[0]['itemSectionRenderer']['contents'] : content[1]['itemSectionRenderer']['contents'];
            if (searchData instanceof Error) return reject('error search data');
            const result = [];
            for (const getData of searchData) {
            const videosRenderer = getData['videoRenderer'];
            if (videosRenderer) {
                const resultData = {
                ID: videosRenderer['videoId'],
                url: `https://www.youtube.com${videosRenderer['navigationEndpoint']['commandMetadata']['webCommandMetadata']['url']}`,
                title: videosRenderer['title']['runs'][0]['text'],
                description: videosRenderer['detailedMetadataSnippets'] ? videosRenderer['detailedMetadataSnippets'][0]['snippetText']['runs'][0]['text'] : 'Unknown',
                thumbnail: videosRenderer['thumbnail']['thumbnails'].map(output => {
                    output['url'] = output['url'].split('?')[0];
                    return output;
                })[0]['url'],
                published_at: videosRenderer['publishedTimeText'] ? videosRenderer['publishedTimeText']['simpleText'] : '-',
                duration: videosRenderer['thumbnailOverlays'][0]['thumbnailOverlayTimeStatusRenderer']?.['text']['simpleText'] 
                    ? videosRenderer['thumbnailOverlays'][0]['thumbnailOverlayTimeStatusRenderer']['text']['simpleText'].replace('.', ':') 
                    : videosRenderer['thumbnailOverlays'][0]['thumbnailOverlayTimeStatusRenderer']['text']['accessibility']['accessibilityData']['label'],
                views: isNaN(parseInt(videosRenderer['viewCountText']['simpleText']?.split(' x ')[0].replace(/\./g, ''))) 
                    ? 'Unknown' 
                    : parseInt(videosRenderer['viewCountText']['simpleText']?.split(' x ')[0].replace(/\./g, '')),
                isLive: Object.keys(videosRenderer).includes('badges') 
                    ? !!/live/i.test(videosRenderer['badges'][0]['metadataBadgeRenderer']['label']) 
                    : false,
                author: {
                    name: videosRenderer['ownerText']['runs'][0]['text'],
                    url: `https://www.youtube.com${videosRenderer['ownerText']['runs'][0]['navigationEndpoint']['commandMetadata']['webCommandMetadata']['url']}`
                }
                };
                if (resultData.isLive) {
                delete resultData['duration'];
                delete resultData['published_at'];
                delete resultData['views'];
                }
                result.push(resultData);
            }
            }
            resolve(result);
        } else {
            reject('error request');
        }
        } catch (error) {
        reject(error);
        }
    });
}