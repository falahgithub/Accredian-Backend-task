const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// const mysql = require('mysql');

const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');


const app = express();


const prisma = new PrismaClient();


app.use(cors());
app.use(bodyParser.json());



app.post('/api/referrals', async (req, res) => {
  const { referrer, referee, email } = req.body;

  if (!referrer || !referee || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newReferral = await prisma.referral.create({
      data: {
        referrer,
        referee,
        email,
      },
    });

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Referral Confirmation',
      text: `Hi ${referee}, you have been referred by ${referrer}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });

    res.status(201).json(newReferral);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
