const Razorpay = require('razorpay');

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';

module.exports = async (req, res) => {
    const origin = req.headers.origin || '';
    const allowed = ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN;
    res.setHeader('Access-Control-Allow-Origin', allowed ? origin : ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return res.status(200).json({ enabled: false });
    }

    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await instance.orders.create({
            amount: 3700,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
        });

        res.status(200).json({ enabled: true, orderId: order.id, key: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        res.status(500).json({ error: 'Order creation failed' });
    }
};
