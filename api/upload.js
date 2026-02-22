export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { imageBase64, filename } = req.body;

    if (!imageBase64 || !filename) {
        return res.status(400).json({ error: 'Missing image data or filename' });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const token = process.env.GITHUB_TOKEN;
    const owner = 'uzzano-info';
    const repo = 'LittleSup';
    const path = `images/gallery/${Date.now()}_${filename}`;

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-LittleSup'
            },
            body: JSON.stringify({
                message: `Admin upload new gallery image: ${filename}`,
                content: base64Data,
                branch: 'main'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        const data = await response.json();

        return res.status(200).json({
            success: true,
            url: `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`
        });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: error.message });
    }
}
