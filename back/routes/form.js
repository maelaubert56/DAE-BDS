const express = require('express');
const router = express.Router();
require('dotenv').config();
const db = require('../utilities/db');
const authenticateToken = require('../utilities/authMiddleware');
const multer = require('multer');
const path = require('path'); // Importation du module path
const fs = require('fs');
const daeFiller = require('../utilities/daefiller');
const nodemailer = require("nodemailer");
const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: `${process.env.EMAIL_CRED}`,
        pass: `${process.env.EMAIL_CRED_PASSWORD}`,
    },
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/forms/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/', async (req, res) => {
    console.log('POST /api/form')
    try {
        const { type, formData, sendTo, sendToGroup } = req.body;
        
        const user = (await db.query('SELECT * FROM users WHERE users_email = ?', [sendTo]))[0][0];

        const { insertId } = await db.query('INSERT INTO form (form_data, form_type, form_sentTo, form_sentToGroup, form_statut, form_signedBy, form_pdf) VALUES (?, ?, ?, ?, ?, ?, ?)', [JSON.stringify(formData), type,
            sendTo, sendToGroup, 'to_review', '', '']);

        var subject = `[${type} - ${formData.date.split('-').reverse().join('/')}] - REÇUE`;
        if (sendTo === "all") {
            var html = '<p>Bonjour ' + formData.prenom + ',</p><p>Votre demande de ' + type + ' pour le ' + formData.date.split('-').reverse().join('/') + ' a bien été reçue par ' + sendToGroup + ', elle sera traitée dans les plus brefs délais.</p><p>Merci pour votre engagement<br>Sportivement</p>';
        } else {
            var html = '<p>Bonjour ' + formData.prenom + ',</p><p>Votre demande de ' + type + ' pour le ' + formData.date.split('-').reverse().join('/') + ' a bien été reçue par ' + user.users_username + ', elle sera traitée dans les plus brefs délais.</p><p>Merci pour votre engagement<br>Sportivement</p>';
        }
        var email = formData.mail;
        var mailOptions = {
            from: `${process.env.EMAIL_FROM}`,
            to: email,
            subject: subject,
            html: html,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email: ", error);
            } else {
                console.log("Email sent: ", info.response);
            }
        });

        subject = `[${type} - ${formData.date.split('-').reverse().join('/')}] - NOUVELLE DEMANDE`;
        
        if (sendTo === "all") {
            html = '<p>Bonjour ' + sendToGroup + ',</p><p>Vous avez reçu une nouvelle demande de ' + type + ' pour le ' + formData.date.split('-').reverse().join('/') + ' de la part de ' + formData.prenom + ' ' + formData.nom + '.<br>Veuillez vous connecter au <a href="https://docs.bds-efrei.fr/admin">site du BDS</a> pour la consulter.</p><p>Sportivement</p>';
            email = "marius.chevailler@efrei.net";
        } else {
            html = '<p>Bonjour ' + user.users_username + ',</p><p>Vous avez reçu une nouvelle demande de ' + type + ' pour le ' + formData.date.split('-').reverse().join('/') + ' de la part de ' + formData.prenom + ' ' + formData.nom + '.<br>Veuillez vous connecter au <a href="https://docs.bds-efrei.fr/admin">site du BDS</a> pour la consulter.</p><p>Sportivement</p>';
            email = user.users_email;
        }
        mailOptions = {
            from: `${process.env.EMAIL_FROM}`,
            to: email,
            subject: subject,
            html: html,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email: ", error);
            } else {
                console.log("Email sent: ", info.response);
            }
        });


        res.status(201).json({ id: insertId });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    console.log('GET /api/form');
    try {
        var { search, statut, type, forUser, date } = req.query; // the url will look like /api/form?searchfilter=eee&statut=&type=

        if (!search) search = '%';
        if (!statut) statut = '%';
        if (!type) type = '%';
        if (!forUser) forUser = '%';



        console.log('search:' + search + '. statut:' + statut + '. type:' + type + '. forUser:' + forUser + '.');

        const { user } = req;
        const [permissions] = await db.query('SELECT users_permissions FROM users WHERE users_email = ?', [user.users_email]);
        
        console.log("Permission :"+permissions[0].users_permissions);
        var rows = [];
        var nb = [];
        if (permissions[0].users_permissions === 1 || permissions[0].users_permissions === 2) {
            [rows] = await db.query('SELECT * FROM form WHERE form_statut LIKE ? AND form_type LIKE ? AND form_sentTo LIKE ? AND form_data LIKE ? ORDER BY form_id DESC', [statut, type, forUser, `%${search}%`]);
            const query = `SELECT * FROM form WHERE form_statut LIKE ${statut} AND form_type LIKE ${type} AND form_data LIKE ${search} ORDER BY form_id DESC`;
            console.log(query);
            [nb] = await db.query('SELECT COUNT(*) FROM form WHERE form_sentTo LIKE ?', [forUser]);
            console.log(nb[0]['COUNT(*)']);
        } else {
            [rows] = await db.query('SELECT * FROM form WHERE form_sentTo = ? AND form_statut LIKE ? AND form_type LIKE ? AND form_sentTo LIKE ? AND form_data LIKE ? ORDER BY form_id DESC', [user.users_email, statut, type, forUser, `%${search}%`]);
            [nb] = await db.query('SELECT COUNT(*) FROM form WHERE form_sentTo LIKE ?', [user.users_email]);
            console.log(nb[0]['COUNT(*)']);
        }

        if (date) {
            rows = rows.filter(row => {
                const formData = JSON.parse(row.form_data);
                return formData.date === date;
            });
        }

        res.status(200).json({ forms: rows, nb: nb[0]['COUNT(*)'] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/download/:id', authenticateToken, async (req, res) => {
    console.log('GET /api/form/download/:id');
    const { id } = req.params;
    try {
        const [form] = await db.query('SELECT * FROM form WHERE form_id = ?', [id]);
        if (form.length === 0) {
            res.status(404).json({ error: 'Form not found' });
            return;
        }
        const filePath = path.join(__dirname, `../files/forms/filled/${form[0].form_pdf}`);
        console.log(filePath);
        res.download(filePath); // in the front end, the file will be downloaded
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/download/:id/pdf', authenticateToken, async (req, res) => {
    console.log('GET /api/form/download/:id/pdf');
    const { id } = req.params;
    try {
        const [form] = await db.query('SELECT * FROM form WHERE form_id = ?', [id]);
        if (form.length === 0) {
            res.status(404).json({ error: 'Form not found' });
            return;
        }
        const filePath = path.join(__dirname, `../files/forms/filled/${form[0].form_pdf}`);
        console.log(filePath);
        const pdfPath = path.join(__dirname, `../files/forms/filled/${form[0].form_pdf.split('.')[0]}.pdf`);
        const docxBuf = fs.readFile(filePath, async (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
            try {
                const pdfBuf = await libre.convertAsync(data, '.pdf', undefined);
                fs.writeFile(pdfPath, pdfBuf, (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ error: err.message });
                    }
                    res.download(pdfPath);
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: error.message });
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    console.log('PUT /api/form/:id');
    const { id } = req.params;
    const { form_data } = req.body;

    try {
        await db.query('UPDATE form SET form_data = ? WHERE form_id = ?', [JSON.stringify(form_data), id]);
        res.status(200).json({ message: 'Form updated' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/accept/:id', authenticateToken, async (req, res) => {
    console.log('PUT /api/form/accept/:id');
    const { id } = req.params;
    const user = req.user;
    try {

        console.log(user);
        await db.query('UPDATE form SET form_statut = "accepted", form_signedBy = ? WHERE form_id = ?', [user.users_email, id]);

        //get the form
        const [form] = await db.query('SELECT * FROM form WHERE form_id = ?', [id]);
        //extract email from data
        const formData = JSON.parse(form[0].form_data);
        const subject = `[${form[0].form_type} - ${formData.date.split('-').reverse().join('/')}] - ACCEPTÉE`;
        
        const html = '<p>Bonjour ' + formData.prenom + ',</p><p>Votre ' + form[0].form_type + ' du ' + formData.date.split('-').reverse().join('/') + ' a été acceptée par ' + user.users_username + '.<br>Veuillez trouver ci-joint le document PDF à faire signer par le service association de l’école et par vous-même.<br>Vous pourrez alors envoyer par mail cette fiche à votre référent réussite étudiante ainsi qu’à l’alias absence de votre promo.<br><br>Merci pour votre engagement<br>Sportivement</p>';
        //add user to the data as signedBy
        const allData=JSON.parse(form[0].form_data);
        allData.date = allData.date.split('-').reverse().join('/');
        allData.signedByEmail=user.users_email;
        allData.signedByUsername=user.users_username;
        // mettre la date en format jj/mm/aaaa

        allData.date = allData.date.split('-').reverse().join('/');
        allData.fait_le= new Date().toLocaleDateString('fr-FR');
        allData.fait_a='Villejuif';
        const docxName = daeFiller(allData);
        await db.query('UPDATE form SET form_pdf = ? WHERE form_id = ?', [docxName, id]);
        console.log(docxName);


        filePath = path.join(__dirname, `../files/forms/filled/${docxName}`);
        // convert the data string to json
        const email = JSON.parse(form[0].form_data).mail;
        const mailOptions = {
            from: `${process.env.EMAIL_FROM}`,
            to: email,
            subject: subject,
            html: html,
            attachments: [
                {
                    filename: 'DAE.docx',
                    path: filePath,
                    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                }
            ]

        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email: ", error);
            } else {
                console.log("Email sent: ", info.response);
            }
        });

        res.status(200).json({ message: 'Form accepted' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/wait/:id', authenticateToken, async (req, res) => {
    console.log('PUT /api/form/wait/:id');
    const { id } = req.params;
    const user = req.user;
    try {
        await db.query('UPDATE form SET form_statut = "to_review" WHERE form_id = ?', [id]);
        res.status(200).json({ message: 'Form put on hold' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
    console.log('DELETE /api/form/delete/:id');
    const { id } = req.params;
    try {
        await db.query('DELETE FROM form WHERE form_id = ?', [id]);
        res.status(200).json({ message: 'Form deleted' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/reject/:id', authenticateToken, async (req, res) => {
    console.log('PUT /api/form/reject/:id');
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;
    try {
        //mail the user
        const [form] = await db.query('SELECT * FROM form WHERE form_id = ?', [id]);
        const formData = JSON.parse(form[0].form_data);
        const subject = `[${form[0].form_type} - ${formData.date.split('-').reverse().join('/')}] - REFUSÉE`;
        var html = '<p>Bonjour ' + formData.prenom + ',</p><p>Votre ' + form[0].form_type + ' du ' + formData.date.split('-').reverse().join('/') + ' a été refusée par ' + user.users_username + ' pour la raison suivante : ' + reason + '.<br>Nous vous demandons de bien vouloir renouveler votre demande.</p><p>Merci pour votre engagement<br>Sportivement</p>';

            // convert the data string to json
        var email = JSON.parse(form[0].form_data).mail;
        const mailOptions = {
            from: `${process.env.EMAIL_FROM}`,
            to: email,
            subject: subject,
            html: html,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email: ", error);
            } else {
                console.log("Email sent: ", info.response);
            }
        });

        await db.query('UPDATE form SET form_statut = "rejected" WHERE form_id = ?', [id]);


        res.status(200).json({ message: 'Form rejected' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
