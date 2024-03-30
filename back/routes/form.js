const express = require('express');
const router = express.Router();
require('dotenv').config();
const db = require('../utilities/db');
const authenticateToken = require('../utilities/authMiddleware');
const multer = require('multer');
const path = require('path'); // Importation du module path
const fs = require('fs');
const nodemailer = require("nodemailer");
const { daeFiller, daeImageFiller, keyWordFiller, docxToPdf } = require('../utilities/docUtilities');

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

        const userSendTo = (await db.query('SELECT * FROM users WHERE users_email = ?', [sendTo]))[0][0];

        // fill the form with the formData
        const docxName = await daeFiller(formData);


        // insert the form in the database
        const { insertId } = await db.query('INSERT INTO form (form_type, form_data, form_statut, form_sentTo, form_sentToGroup, form_to_review) VALUES (?, ?, ?, ?, ?, ?)', [type, JSON.stringify(formData), 'to_review', sendTo, sendToGroup, docxName]);

        // send an email to the student
        var subject = `[${type} - ${formData.date.split('-').reverse().join('/')}] - REÇUE`;
        if (sendTo === "all") {
            var html = '<p>Bonjour ' + formData.prenom + ',</p><p>Votre demande de ' + type + ' pour le ' + formData.date.split('-').reverse().join('/') + ' a bien été reçue par ' + sendToGroup + ', elle sera traitée dans les plus brefs délais.</p><p>Merci pour votre engagement<br>Sportivement</p>';
        } else {
            var html = '<p>Bonjour ' + formData.prenom + ',</p><p>Votre demande de ' + type + ' pour le ' + formData.date.split('-').reverse().join('/') + ' a bien été reçue par ' + userSendTo.users_username + ', elle sera traitée dans les plus brefs délais.</p><p>Merci pour votre engagement<br>Sportivement</p>';
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

        // send an email to the association member
        subject = `[${type} - ${formData.date.split('-').reverse().join('/')}] - NOUVELLE DEMANDE`;
        if (sendTo === "all") {
            html = '<p>Bonjour ' + sendToGroup + ',</p><p>Vous avez reçu une nouvelle demande de ' + type + ' pour le ' + formData.date.split('-').reverse().join('/') + ' de la part de ' + formData.prenom + ' ' + formData.nom + '.<br>Veuillez vous connecter au <a href="https://docs.bds-efrei.fr/admin">site du BDS</a> pour la consulter.</p><p>Sportivement</p>';
            email = "marius.chevailler@efrei.net";
        } else {
            html = '<p>Bonjour ' + userSendTo.users_username + ',</p><p>Vous avez reçu une nouvelle demande de ' + type + ' pour le ' + formData.date.split('-').reverse().join('/') + ' de la part de ' + formData.prenom + ' ' + formData.nom + '.<br>Veuillez vous connecter au <a href="https://docs.bds-efrei.fr/admin">site du BDS</a> pour la consulter.</p><p>Sportivement</p>';
            email = userSendTo.users_email;
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

        console.log("Permission :" + permissions[0].users_permissions);
        var rows = [];
        var nb = [];
        if (permissions[0].users_permissions === 1 || permissions[0].users_permissions === 2) {
            [rows] = await db.query('SELECT * FROM form WHERE form_statut LIKE ? AND form_type LIKE ? AND form_sentTo LIKE ? AND form_data LIKE ? ORDER BY form_id DESC', [statut, type, forUser, `%${search}%`]);
            const query = `SELECT * FROM form WHERE form_statut LIKE ${statut} AND form_type LIKE ${type} AND form_data LIKE ${search} ORDER BY form_id DESC`;
            console.log(query);
            [nb] = await db.query('SELECT COUNT(*) FROM form WHERE form_sentTo LIKE ?', [forUser]);
            console.log(nb[0]['COUNT(*)']);
        } else {
            if(user.users_groups_name === 'Responsables Vie Associative'){
                [rows] = await db.query("SELECT * FROM form WHERE form_statut = 'waitingForAdmin' AND form_type LIKE ? AND form_sentTo LIKE ? AND form_data LIKE ? ORDER BY form_id DESC", [type, forUser, `%${search}%`]);
            }else{
                [rows] = await db.query('SELECT * FROM form WHERE form_statut LIKE ? AND form_type LIKE ? AND form_sentTo LIKE ? AND form_data LIKE ? ORDER BY form_id DESC', [statut, type, forUser, `%${search}%`]);
            }
            
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
        if (form[0].form_statut !== 'waitingForAdmin') {
            const filePath = path.join(__dirname, `../files/forms/filled/${form[0].form_signed_asso}`);
        }else if (form[0].form_statut === 'accepted') {
            const filePath = path.join(__dirname, `../files/forms/filled/${form[0].form_signed_admin}`);
        }else {
            res.status(404).json({ error: 'Form not signed' });
            return;
        }
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
        var filePath;
        if (form[0].form_statut === 'waitingForAdmin') {
            filePath = path.join(__dirname, `../files/forms/filled/${form[0].form_signed_asso}`);
        }else if (form[0].form_statut === 'accepted') {
            filePath = path.join(__dirname, `../files/forms/filled/${form[0].form_signed_admin}`);
        }else {
            res.status(404).json({ error: 'Form not signed' });
            return;
        }
        console.log(filePath);
        const pdfPath = await docxToPdf(filePath);
        console.log('before download: ', pdfPath);
        res.download(pdfPath); // in the front end, the file will be downloaded

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
        // get the form
        const [form] = await db.query('SELECT * FROM form WHERE form_id = ?', [id]);
        // update the form_data
        await db.query('UPDATE form SET form_data = ? WHERE form_id = ?', [JSON.stringify(form_data), id]);
        // create again the form with the new data
        const docxName = await daeFiller(form_data);
        await db.query('UPDATE form SET form_to_review = ? WHERE form_id = ?', [docxName, id]);

        // if the form is waiting for admin, recreate the form_signed_asso
        if (form[0].form_statut === 'waitingForAdmin') {
            const signed_asso_path = path.join(__dirname, `../files/forms/filled/DAE_signed_asso_${form_data.prenom}_${form_data.nom}_${form_data.date}.docx`);
            fs.copyFileSync(path.join(__dirname, `../files/forms/filled/${form[0].form_to_review}`), signed_asso_path);
            console.log('copied file to: ', signed_asso_path);
            await keyWordFiller(path.join(__dirname, `../files/forms/filled/${path.basename(signed_asso_path)}`), 'signedByAsso', form[0].form_signedByAsso);  
            await keyWordFiller(path.join(__dirname, `../files/forms/filled/${path.basename(signed_asso_path)}`), 'signatureAsso', "{{signatureAsso}}");
            await daeImageFiller(path.join(__dirname, `../files/forms/filled/${path.basename(signed_asso_path)}`), path.join(__dirname, `../files/forms/filled/DAE_signed_asso_${form_data.prenom}_${form_data.nom}_${form_data.date}.docx`), path.join(__dirname, `../files/signatures/signature_${form[0].form_signedByAsso}.png`), 'signatureAsso');
            await db.query('UPDATE form SET form_signedByAsso = ?, form_signed_asso = ? WHERE form_id = ?', [req.user.users_email, path.basename(signed_asso_path), id]);
        }

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

        // if users_email appartient a un groupe qui est de type 'admin'
        console.log(user.users_groups_name);
        const group = (await db.query('SELECT * FROM users_groups WHERE users_groups_name = ?', [user.users_groups_name]))[0];
        //get the form
        const [form] = await db.query('SELECT * FROM form WHERE form_id = ?', [id]);
        const data = JSON.parse(form[0].form_data);
        console.log(group)
        var statut = form[0].form_statut;
        if (group[0].users_groups_type === 'ASSO'){
            //copy the form to a new file
            const signed_asso_path = path.join(__dirname, `../files/forms/filled/DAE_signed_asso_${data.prenom}_${data.nom}_${data.date}.docx`);
            fs.copyFileSync(path.join(__dirname, `../files/forms/filled/${form[0].form_to_review}`), signed_asso_path);
            console.log('copied file to: ', signed_asso_path);
            // insert the name of the user who signed the form
            await keyWordFiller(path.join(__dirname, `../files/forms/filled/${path.basename(signed_asso_path)}`), 'signedByAsso', user.users_email);
            //create the placeholder for the signature
            await keyWordFiller(path.join(__dirname, `../files/forms/filled/${path.basename(signed_asso_path)}`), 'signatureAsso', "{{signatureAsso}}");
            //insert the signature
            await daeImageFiller(path.join(__dirname, `../files/forms/filled/${path.basename(signed_asso_path)}`),path.join(__dirname, `../files/forms/filled/DAE_signed_asso_${data.prenom}_${data.nom}_${data.date}.docx`), path.join(__dirname, `../files/signatures/signature_${user.users_email}.png`), 'signatureAsso');
            
            // update the form in the database
            await db.query('UPDATE form SET form_statut = "waitingForAdmin", form_signedByAsso = ?, form_signed_asso = ? WHERE form_id = ?', [user.users_email, path.basename(signed_asso_path), id]);
            statut = 'waitingForAdmin';
        }
        else if (group[0].users_groups_type === 'ADMIN') {
            console.log('admin')
            //copy the form to a new file
            const signed_admin_path = path.join(__dirname, `../files/forms/filled/DAE_signed_admin_${data.prenom}_${data.nom}_${data.date}.docx`);
            fs.copyFileSync(path.join(__dirname, `../files/forms/filled/${form[0].form_signed_asso}`), signed_admin_path);
            console.log('copied file to: ', signed_admin_path);
            // insert the name of the user who signed the form
            await keyWordFiller(path.join(__dirname, `../files/forms/filled/${path.basename(signed_admin_path)}`), 'signedByAdmin', user.users_email);
            //create the placeholder for the signature
            await keyWordFiller(path.join(__dirname, `../files/forms/filled/${path.basename(signed_admin_path)}`), 'signatureAdmin', "{{signatureAdmin}}");
            //insert the signature
            await daeImageFiller(path.join(__dirname, `../files/forms/filled/${path.basename(signed_admin_path)}`), path.join(__dirname, `../files/forms/filled/DAE_signed_admin_${data.prenom}_${data.nom}_${data.date}.docx`), path.join(__dirname, `../files/signatures/signature_${user.users_email}.png`), 'signatureAdmin');
            await db.query('UPDATE form SET form_statut = "accepted", form_signedByAdmin = ? , form_signed_admin = ? WHERE form_id = ?', [user.users_email, path.basename(signed_admin_path), id]);
            statut = 'accepted';
        }

        if (statut === 'waitingForAdmin') {
            // send mail to Admin
            const [admin] = await db.query('SELECT * FROM users WHERE users_groups_name = "Responsables Vie Associative"');
            const subject = `[${form[0].form_type} - ${JSON.parse(form[0].form_data).date.split('-').reverse().join('/')}] - NOUVELLE DEMANDE`;
            const html = '<p>Bonjour,</p><p>Vous avez reçu une nouvelle demande de ' + form[0].form_type + ' pour le ' + JSON.parse(form[0].form_data).date.split('-').reverse().join('/') + ' de la part de ' + JSON.parse(form[0].form_data).prenom + ' ' + JSON.parse(form[0].form_data).nom + '.<br>Veuillez vous connecter au <a href="https://docs.bds-efrei.fr/admin">site du BDS</a> pour la consulter.</p><p>Sportivement</p>';
            console.log("admin: ", admin);
            const maillist = admin.map(a => a.users_email).join(', ');
            console.log("mail list: ", maillist)
            
            const mailOptions = {
                from: `${process.env.EMAIL_FROM}`,
                to: maillist,
                subject: subject,
                html: html,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email to admin: ", error);
                } else {
                    console.log("Email sent: ", info.response);
                }
            });
            
            res.status(200).json({ message: 'Form accepted by association' });
        } else if (statut === 'accepted') {
            //extract email from data
            const formData = JSON.parse(form[0].form_data);
            const subject = `[${form[0].form_type} - ${formData.date.split('-').reverse().join('/')}] - ACCEPTÉE`;

            const html = '<p>Bonjour ' + formData.prenom + ',</p><p>Votre ' + form[0].form_type + ' du ' + formData.date.split('-').reverse().join('/') + ' a été acceptée par ' + user.users_username + '.<br>Veuillez trouver ci-joint le document PDF à faire signer par le service association de l’école et par vous-même.<br>Vous pourrez alors envoyer par mail cette fiche à votre référent réussite étudiante ainsi qu’à l’alias absence de votre promo.<br><br>Merci pour votre engagement<br>Sportivement</p>';
            console.log("form id: ", id)
            const [document] = await db.query('SELECT * FROM form WHERE form_id = ?', [id]);

            console.log("document: ", document)
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
                        path: path.join(__dirname, `../files/forms/filled/${document[0].form_signed_admin}`),
                        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    }
                ]

            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email to user", error);
                } else {
                    console.log("Email sent: ", info.response);
                }
            });
            res.status(200).json({ message: 'Form accepted by admin' });
        } else {  
            res.status(500).json({ error: 'Form not signed' });
        }
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
