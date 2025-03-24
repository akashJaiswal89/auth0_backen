require('dotenv').config();
const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD
const EMAIL_USER = process.env.EMAIL_USER
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
});


async function verifyToken(token) {
    try {
        const response = await axios.get(`${AUTH0_DOMAIN}/userinfo`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw new Error('Invalid Auth0 token');
    }
}
app.get("/",(req,res)=>{
 res.status(400).json({ error: 'Token is required' })
})
app.post('/auth/callback', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        if (!token) return res.status(400).json({ error: 'Token is required' });
        console.log(token)
        const userInfo = await verifyToken(token);
        const mailOptions = {
            from: "surendrakash89@gmail.com",
            to: userInfo?.email,
            subject: 'Your Authentication Token',
            text: `Here is your Auth0 token: ${token}`
        };

        const data = await transporter.sendMail(mailOptions);
        console.log(data)
        res.status(200).json({ message: 'Email sent successfully', userInfo });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(PORT));
