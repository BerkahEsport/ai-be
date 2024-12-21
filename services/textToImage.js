import got from "got";

const sanai = {
    create: async ({
        prompt = "Berkahesport",
        width = 1024,
        height = 1024,
        guidanceScale = 5,
        pagGuidanceScale = 2,
        numInferenceSteps = 18,
        steps = 20,
        seed = -1,
    } = {}) => {
        if (prompt.match(/buatkan|gambar|image/i)) return {
            status: 403,
            result: false,
        };
        if (typeof prompt !== "string" || prompt.trim() === "") {
            throw new Error("The 'prompt' parameter must be a valid string.");
        }
        if (width <= 0 || height <= 0) {
            throw new Error("Width and height must be positive values.");
        }
        if (guidanceScale < 1 || pagGuidanceScale < 1) {
            throw new Error("The scale must be positive and at least 1.");
        }
        if (numInferenceSteps < 1 || steps < 1) {
            throw new Error("Inference steps and steps must be positive.");
        }

        const url = "https://api.freesana.ai/v1/images/generate";
        const headers = {
            "authority": "api.freesana.ai",
            "origin": "https://freesana.ai",
            "referer": "https://freesana.ai/",
            "user-agent": "Postify/1.0.0",
            "content-type": "application/json",
        };
        const data = {
            prompt,
            model: "sana_1_6b",
            width,
            height,
            guidance_scale: guidanceScale,
            pag_guidance_scale: pagGuidanceScale,
            num_inference_steps: numInferenceSteps,
            steps,
            seed,
        };

        try {
            const response = await got.post(url, {
                json: data,
                headers,
                timeout: { request: 15000 },
                responseType: "json",
            });

            const {
                id,
                status,
                result,
                processingTime,
                nsfw,
            } = response.body;
            console.log(response.body)
            return {
                id,
                status,
                result,
                processingTime,
                width,
                height,
                nsfw,
                seed,
            };
        } catch (error) {
            console.log(error)
            if (error.response) {
                console.error(
                    `API error: ${error.response.statusCode} - ${
                        error.response.body?.message || "Unknown error"
                    }`
                );
            } else if (error.code === "ETIMEDOUT") {
                console.error("The request to the server exceeded the time limit.");
            } else {
                console.error("Error on request:", error.message);
            }
            return {
                status: 404,
                result: false,
            };
        }
    },
};

export default sanai;