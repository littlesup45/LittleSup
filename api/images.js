export default async function handler(req, res) {
    const owner = 'uzzano-info';
    const repo = 'LittleSup';
    const path = `images/gallery`;
    const token = process.env.GITHUB_TOKEN;

    const headers = {
        'User-Agent': 'Vercel-LittleSup'
    };
    if (token) headers['Authorization'] = `token ${token}`;

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers
        });

        if (!response.ok) {
            if (response.status === 404) return res.status(200).json([]);
            throw new Error(await response.text());
        }

        const data = await response.json();
        const files = data.filter(f => f.type === 'file' && f.name.match(/\.(jpg|jpeg|png)$/i));
        const urls = files.map(file => `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`);

        // Cache to prevent hitting GitHub API rate limits
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=86400');
        res.status(200).json(urls);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
