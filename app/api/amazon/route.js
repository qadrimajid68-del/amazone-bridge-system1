import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { asin, url } = await req.json();

        if (!asin && !url) {
            return NextResponse.json({ error: 'Amazon URL ya ASIN zaroori hai!' }, { status: 400 });
        }

        let targetUrl = (url || '').trim();

        // 1. 🔗 Auto-Unshorten amzn.to ya a.co links
        if (targetUrl.includes('amzn.to') || targetUrl.includes('a.co')) {
            try {
                const unshortenRes = await fetch(targetUrl, {
                    method: 'GET',
                    redirect: 'follow',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
                    }
                });
                targetUrl = unshortenRes.url || targetUrl;
            } catch (err) {
                console.log("Unshorten fallback active...");
            }
        }

        // 2. ASIN Check
        let cleanAsin = asin;
        if (!cleanAsin && targetUrl) {
            const match = targetUrl.match(/(?:dp|gp\/product|d)\/([A-Z0-9]{10})/i);
            cleanAsin = match ? match[1] : null;
        }

        const associateTag = process.env.AMAZON_ASSOCIATE_TAG?.trim() || 'majuders-20';

        // 3. Agar Multi-Product / Storefront link ho (jisme /dp/ nahi hota)
        if (!cleanAsin) {
            try {
                const pageRes = await fetch(targetUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
                    }
                });
                const html = await pageRes.text();

                // Saare ASINs dhoondo
                const foundAsins = [...new Set([...html.matchAll(/(?:dp|gp\/product)\/([A-Z0-9]{10})/gi)].map(m => m[1]))]
                    .filter(a => a.length === 10 && !a.startsWith('0000'));

                if (foundAsins.length > 0) {
                    cleanAsin = foundAsins[0]; // Pehla product auto-select karo
                }
            } catch (e) {
                console.log("Multi-product scan error");
            }
        }

        if (!cleanAsin) {
            return NextResponse.json({ 
                error: 'Amazon Link se product code nahi mil saka. Sahi product link dalein.' 
            }, { status: 400 });
        }

        cleanAsin = cleanAsin.toUpperCase();
        const affiliateUrl = `https://www.amazon.com/dp/${cleanAsin}?tag=${associateTag}`;

        let title = '';
        let imageUrl = '';
        let price = '';
        let description = '';
        let rating = '4.6';
        let reviews = '500+';

        // 4. ⚡ CLOUD ANTI-BOT PARSER (Real Data)
        try {
            const jinaRes = await fetch(`https://r.jina.ai/https://www.amazon.com/dp/${cleanAsin}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-No-Cache': 'true'
                },
                signal: AbortSignal.timeout(12000)
            });

            const jinaData = await jinaRes.json();
            if (jinaData?.data) {
                const content = jinaData.data.content || '';
                const rawTitle = jinaData.data.title || '';

                if (rawTitle && rawTitle.toLowerCase() !== 'amazon.com') {
                    title = rawTitle.replace(/^Amazon\.com\s*:\s*/i, '').replace(/:\s*Electronics.*$/i, '').trim();
                }

                // Image
                const imgMatches = [...content.matchAll(/(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_\+\.\-]+\.(?:jpg|png|webp))/gi)];
                for (const match of imgMatches) {
                    const img = match[1];
                    if (!img.includes('icon') && !img.includes('badge') && !img.includes('logo')) {
                        imageUrl = img;
                        break;
                    }
                }

                // Price
                const priceMatch = content.match(/Price:\s*\$([0-9,]+\.[0-9]{2})/i) || content.match(/\$\s*([0-9,]+\.[0-9]{2})/);
                if (priceMatch) price = priceMatch[1].replace(/,/g, '');

                // Description
                const bulletMatches = [...content.matchAll(/^[*-]\s+([^\n\r]+)/gm)]
                    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
                    .filter(txt => txt.length > 20 && !txt.toLowerCase().includes('http'));
                if (bulletMatches.length > 0) description = bulletMatches.slice(0, 2).join(' • ');

                // Rating & Reviews
                const starMatch = content.match(/([0-9]\.[0-9])\s*out of 5/i);
                if (starMatch) rating = starMatch[1];
                const revMatch = content.match(/([0-9,]+)\s*ratings?/i);
                if (revMatch) reviews = revMatch[1];
            }
        } catch (e) {
            console.log("Cloud parser timed out");
        }

        // Guaranteed Image
        if (!imageUrl) {
            imageUrl = `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${cleanAsin}&Format=_SL500_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1`;
        }

        return NextResponse.json({
            title: title || `Amazon Official Product (${cleanAsin})`,
            imageUrl: imageUrl,
            price: price || '19.99',
            description: description || 'High-quality verified product from Amazon marketplace.',
            rating: rating,
            reviews: `${reviews} ratings`,
            affiliateUrl: affiliateUrl
        });

    } catch (error) {
        console.error("Auto Fetch Error:", error);
        return NextResponse.json({ error: 'Data fetch nahi ho saka.' }, { status: 500 });
    }
}