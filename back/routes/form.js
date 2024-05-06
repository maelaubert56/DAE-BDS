const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../utilities/db");
const authenticateToken = require("../utilities/authMiddleware");
const multer = require("multer");
const path = require("path"); // Importation du module path
const fs = require("fs");
const nodemailer = require("nodemailer");
const {
  daeFiller,
  daeImageFiller,
  keyWordFiller,
  docxToPdf,
} = require("../utilities/docUtilities");
const { file } = require("jszip/lib/object");

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
    cb(null, "uploads/forms/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

router.post("/", async (req, res) => {
  console.log("POST /api/form");
  try {
    const { type, formData, sendTo, sendToGroup } = req.body;

    const userSendTo = (
      await db.query("SELECT * FROM users WHERE users_email = ?", [sendTo])
    )[0][0];

    console.log("userSendTo: ", userSendTo);

    // fill the form with the formData
    const docxName = await daeFiller(formData);

    // insert the form in the database
    console.log("data: ", formData);
    const { insertId } = await db.query(
      "INSERT INTO form (form_type, form_data, form_statut, form_sentTo, form_sentToGroup, form_to_review) VALUES (?, ?, ?, ?, ?, ?)",
      [
        type,
        JSON.stringify(formData),
        "to_review",
        sendTo,
        sendToGroup,
        docxName,
      ]
    );

    // send an email to the student
    var subject = `[${type} - ${formData.date
      .split("-")
      .reverse()
      .join("/")}] - REÇUE`;
    if (sendTo === "all") {
      var html =
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DAE Reçue</title>
        </head>
        <body style="font-family: 'Roboto', sans-serif; margin: 0; padding: 0; background-image: url('https://docs.bds-efrei.fr/banniere_bds.png'); background-repeat: no-repeat; background-size: cover; width: 100%; height: 100%; ">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="margin: 26px auto;">
                            <tr>
                                <td align="center" bgcolor="#ffffff" style="padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                    <img src="https://docs.bds-efrei.fr/icon/done.gif" width="80" alt="confirmed" style="display: block; margin: 0 auto;">
                                    <h1 style="margin: 20px 0; padding: 0; font-size: 36px; font-weight: bold; text-align: center;">DAE Reçue</h1>
                                    <div>
                                        <p>Bonjour ` +
        formData.prenom +
        `,</p>
                                        <p>Votre demande de ` +
        type +
        ` pour le ` +
        formData.date.split("-").reverse().join("/") +
        ` a bien été reçue par ` +
        sendToGroup +
        `.</p>
                                        <p>Elle sera traitée dans les plus brefs délais.</p>
                                        <p>Merci pour votre engagement,</p>
                                        <p>Sportivement</p>
                                        <p class="signature" style="margin-top: 20px; font-size: 14px; text-align: center;">
                                            <b>BDS Efrei Paris</b><br>
                                            <a href="http://www.bds-efrei.fr/">www.bds-efrei.fr</a><br>
                                            30-32 avenue de la République 94800 Villejuif
                                        </p>
                                    </div>
                                    <img class="banniere" src="https://docs.bds-efrei.fr/banniere_mail_bds.png" style="width: 100%; margin-top:0px; border-radius: 10px;">
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        


`;
    } else {
      var html =
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DAE Reçue</title>
        </head>
        <body style="font-family: 'Roboto', sans-serif; margin: 0; padding: 0; background-image: url('https://docs.bds-efrei.fr/banniere_bds.png'); background-repeat: no-repeat; background-size: cover; width: 100%; height: 100%; ">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="margin: 26px auto;">
                            <tr>
                                <td align="center" bgcolor="#ffffff" style="padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                    <img src="https://docs.bds-efrei.fr/icon/time.gif" width="80" alt="confirmed" style="display: block; margin: 0 auto;">
                                    <h1 style="margin: 20px 0; padding: 0; font-size: 36px; font-weight: bold; text-align: center;">DAE Reçue</h1>
                                    <div>
                                        <p>Bonjour ` +
        formData.prenom +
        `,</p>
                                        <p>Votre demande de ` +
        type +
        ` pour le ` +
        formData.date.split("-").reverse().join("/") +
        ` a bien été reçue par ` +
        userSendTo.users_username +
        `.</p>
                                        <p>Elle sera traitée dans les plus brefs délais.</p>
                                        <p>Merci pour votre engagement,</p>
                                        <p>Sportivement</p>
                                        <p class="signature" style="margin-top: 20px; font-size: 14px; text-align: center;">
                                            <b>BDS Efrei Paris</b><br>
                                            <a href="http://www.bds-efrei.fr/">www.bds-efrei.fr</a><br>
                                            30-32 avenue de la République 94800 Villejuif
                                        </p>
                                    </div>
                                    <img class="banniere" src="https://docs.bds-efrei.fr/banniere_mail_bds.png" style="width: 100%; margin-top:0px; border-radius: 10px;">
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        


`;
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
        console.log("Email sent: to user", info.response);
      }
    });
    if (userSendTo.users_send_mail) {
      // send an email to the association member if users_send_mail is true
      subject = `[${type} - ${formData.date
        .split("-")
        .reverse()
        .join("/")}] - NOUVELLE DEMANDE`;
      if (sendTo === "all") {
        var html =
          `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Nouvelle Demande</title>
          </head>
          <body style="font-family: 'Roboto', sans-serif; margin: 0; padding: 0; background-image: url('https://docs.bds-efrei.fr/banniere_bds.png'); background-repeat: no-repeat; background-size: cover; width: 100%; height: 100%; ">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                      <td align="center">
                          <table width="600" border="0" cellspacing="0" cellpadding="0" style="margin: 26px auto;">
                              <tr>
                                  <td align="center" bgcolor="#ffffff" style="padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                      <img src="https://docs.bds-efrei.fr/icon/new.gif" width="80" alt="confirmed" style="display: block; margin: 0 auto;">
                                      <h1 style="margin: 20px 0; padding: 0; font-size: 36px; font-weight: bold; text-align: center;">Nouvelle demande</h1>
                                      <div>
                                          <p>Bonjour ` +
          sendToGroup +
          `,</p>
                                          <p>Vous avez reçu une nouvelle demande de ` +
          type +
          ` pour le ` +
          formData.date.split("-").reverse().join("/") +
          ` de la part de ` +
          formData.prenom +
          " " +
          formData.nom +
          `.</p>
                                          <p>Veuillez vous connecter au <a href="https://docs.bds-efrei.fr/admin">site du BDS</a> pour la consulter.</p>
                                          <p>Merci pour votre engagement,</p>
                                          <p>Sportivement</p>
                                          <p class="signature" style="margin-top: 20px; font-size: 14px; text-align: center;">
                                              <b>BDS Efrei Paris</b><br>
                                              <a href="http://www.bds-efrei.fr/">www.bds-efrei.fr</a><br>
                                              30-32 avenue de la République 94800 Villejuif
                                          </p>
                                      </div>
                                      <img class="banniere" src="https://docs.bds-efrei.fr/banniere_mail_bds.png" style="width: 100%; margin-top:0px; border-radius: 10px;">
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
          </html>
          


`;

        email = "marius.chevailler@efrei.net";
      } else {
        var html =
          `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Nouvelle Demande</title>
          </head>
          <body style="font-family: 'Roboto', sans-serif; margin: 0; padding: 0; background-image: url('https://docs.bds-efrei.fr/banniere_bds.png'); background-repeat: no-repeat; background-size: cover; width: 100%; height: 100%; ">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                      <td align="center">
                          <table width="600" border="0" cellspacing="0" cellpadding="0" style="margin: 26px auto;">
                              <tr>
                                  <td align="center" bgcolor="#ffffff" style="padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                      <img src="https://docs.bds-efrei.fr/icon/new.gif" width="80" alt="confirmed" style="display: block; margin: 0 auto;">
                                      <h1 style="margin: 20px 0; padding: 0; font-size: 36px; font-weight: bold; text-align: center;">Nouvelle demande</h1>
                                      <div>
                                          <p>Bonjour ` +
          userSendTo.users_prenom +
          `,</p>
                                          <p>Vous avez reçu une nouvelle demande de ` +
          type +
          ` pour le ` +
          formData.date.split("-").reverse().join("/") +
          ` de la part de ` +
          formData.prenom +
          " " +
          formData.nom +
          `.</p>
                                          <p>Veuillez vous connecter au <a href="https://docs.bds-efrei.fr/admin">site du BDS</a> pour la consulter.</p>
                                          <p>Merci pour votre engagement,</p>
                                          <p>Sportivement</p>
                                          <p class="signature" style="margin-top: 20px; font-size: 14px; text-align: center;">
                                              <b>BDS Efrei Paris</b><br>
                                              <a href="http://www.bds-efrei.fr/">www.bds-efrei.fr</a><br>
                                              30-32 avenue de la République 94800 Villejuif
                                          </p>
                                      </div>
                                      <img class="banniere" src="https://docs.bds-efrei.fr/banniere_mail_bds.png" style="width: 100%; margin-top:0px; border-radius: 10px;">
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
          </html>
          


`;

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
          console.log("Email sent to staff: ", info.response);
        }
      });
    }

    res.status(201).json({ id: insertId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  console.log("GET /api/form");
  try {
    var { search, statut, type, forUser, date } = req.query; // the url will look like /api/form?searchfilter=eee&statut=&type=

    if (!search) search = "%";
    if (!statut) statut = "%";
    if (!type) type = "%";
    if (!forUser) forUser = "%";
    else forUser = forUser.split(",").join("|");

    console.log(
      "search:" +
        search +
        ". statut:" +
        statut +
        ". type:" +
        type +
        ". forUser:" +
        forUser +
        "."
    );

    const { user } = req;
    const [permissions] = await db.query(
      "SELECT users_permissions FROM users WHERE users_email = ?",
      [user.users_email]
    );

    console.log("Permission :" + permissions[0].users_permissions);
    var rows = [];
    var nb = [];
    if (
      permissions[0].users_permissions === 1 ||
      permissions[0].users_permissions === 2
    ) {
      [rows] = await db.query(
        "SELECT * FROM form WHERE form_statut LIKE ? AND form_type LIKE ? AND form_sentTo RLIKE ? AND form_data LIKE ? ORDER BY form_id DESC",
        [statut, type, forUser, `%${search}%`]
      );
      const query = `SELECT * FROM form WHERE form_statut LIKE ${statut} AND form_type LIKE ${type} AND form_sentTo LIKE ${forUser} AND form_data LIKE ${search} ORDER BY form_id DESC`;
      console.log(query);
      [nb] = await db.query("SELECT COUNT(*) FROM form");
      console.log(nb[0]["COUNT(*)"]);
    } else {
      if (user.users_groups_name === "Responsables Vie Associative") {
        console.log(statut);
        [rows] = await db.query(
          "SELECT * FROM form WHERE form_statut LIKE ? AND form_signedByAsso IS NOT NULL AND form_data LIKE ? AND form_type LIKE ? ORDER BY form_id DESC",
          [statut, `%${search}%`, type]
        );
        [nb] = await db.query(
          "SELECT COUNT(*) FROM form WHERE form_signedByAsso IS NOT NULL"
        );
      } else {
        forUser = user.users_email;
        [rows] = await db.query(
          "SELECT * FROM form WHERE form_statut LIKE ? AND form_type LIKE ? AND form_sentTo LIKE ? AND form_data LIKE ? ORDER BY form_id DESC",
          [statut, type, forUser, `%${search}%`]
        );
        [nb] = await db.query(
          "SELECT COUNT(*) FROM form WHERE form_sentTo LIKE ?",
          [forUser]
        );
      }

      console.log(nb[0]["COUNT(*)"]);
    }

    if (date) {
      rows = rows.filter((row) => {
        const formData = JSON.parse(row.form_data);
        return formData.date === date;
      });
    }

    res.status(200).json({ forms: rows, nb: nb[0]["COUNT(*)"] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/download/:id", authenticateToken, async (req, res) => {
  console.log("GET /api/form/download/:id");
  const { id } = req.params;
  var filePath;
  try {
    const [form] = await db.query("SELECT * FROM form WHERE form_id = ?", [id]);
    if (form.length === 0) {
      res.status(404).json({ error: "Form not found" });
      return;
    }
    if (form[0].form_statut !== "waitingForAdmin") {
      filePath = path.join(
        __dirname,
        `../files/forms/filled/${form[0].form_signed_asso}`
      );
    } else if (form[0].form_statut === "accepted") {
      filePath = path.join(
        __dirname,
        `../files/forms/filled/${form[0].form_signed_admin}`
      );
    } else {
      res.status(404).json({ error: "Form not signed" });
      return;
    }
    console.log(filePath);
    res.download(filePath); // in the front end, the file will be downloaded
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/download/:id/pdf", authenticateToken, async (req, res) => {
  console.log("GET /api/form/download/:id/pdf");
  const { id } = req.params;
  try {
    const [form] = await db.query("SELECT * FROM form WHERE form_id = ?", [id]);
    if (form.length === 0) {
      res.status(404).json({ error: "Form not found" });
      return;
    }
    var filePath;
    if (form[0].form_statut === "waitingForAdmin") {
      filePath = path.join(
        __dirname,
        `../files/forms/filled/${form[0].form_signed_asso}`
      );
    } else if (form[0].form_statut === "accepted") {
      filePath = path.join(
        __dirname,
        `../files/forms/filled/${form[0].form_signed_admin}`
      );
    } else {
      res.status(404).json({ error: "Form not signed" });
      return;
    }
    filePath = filePath.replace(".docx", ".pdf"); // replace the extension ".docx" by ".pdf

    //check if this path already exists
    if (!fs.existsSync(filePath)) {
      filePath = await docxToPdf(filePath.replace(".pdf", ".docx"));
    }
    console.log(filePath);
    res.download(filePath); // in the front end, the file will be downloaded
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  console.log("PUT /api/form/:id");
  const { id } = req.params;
  const { form_data } = req.body;

  try {
    // get the form
    var [form] = await db.query("SELECT * FROM form WHERE form_id = ?", [id]);
    console.log("form: ", form[0]);
    console.log("Data: ", form_data);
    // update the form_data
    await db.query("UPDATE form SET form_data = ? WHERE form_id = ?", [
      JSON.stringify(form_data),
      id,
    ]);
    // create again the form with the new data
    const docxName = await daeFiller(form_data);

    // if the new docx name is not the same as the old one, delete the old one
    if (docxName !== form[0].form_to_review) {
      fs.unlinkSync(
        path.join(__dirname, `../files/forms/filled/${form[0].form_to_review}`)
      );
    }

    await db.query("UPDATE form SET form_to_review = ? WHERE form_id = ?", [
      docxName,
      id,
    ]);

    // if the form is waiting for admin, recreate the form_signed_asso
    console.log("form statut: ", form[0].form_statut);
    if (form[0].form_statut === "waitingForAdmin") {
      [form] = await db.query("SELECT * FROM form WHERE form_id = ?", [id]);

      // delete the old signed_asso file
      fs.unlinkSync(
        path.join(
          __dirname,
          `../files/forms/filled/${form[0].form_signed_asso}`
        )
      );

      const signed_asso_path = path.join(
        __dirname,
        `../files/forms/filled/DAE_signed_asso_${form_data.prenom}_${
          form_data.nom
        }_${JSON.parse(form[0].form_data).date}.docx`
      );
      var [form] = await db.query("SELECT * FROM form WHERE form_id = ?", [id]);
      fs.copyFileSync(
        path.join(__dirname, `../files/forms/filled/${form[0].form_to_review}`),
        signed_asso_path
      );
      console.log("form: ", form[0]);

      const [signataireAsso] = await db.query(
        "SELECT * FROM users WHERE users_email = ?",
        [form[0].form_signedByAsso]
      );
      console.log("copied file to: ", signed_asso_path);
      await keyWordFiller(
        path.join(
          __dirname,
          `../files/forms/filled/${path.basename(signed_asso_path)}`
        ),
        "signedByAsso",
        signataireAsso[0].users_username
      );
      await keyWordFiller(
        path.join(
          __dirname,
          `../files/forms/filled/${path.basename(signed_asso_path)}`
        ),
        "signatureAsso",
        "{{signatureAsso}}"
      );
      await daeImageFiller(
        path.join(
          __dirname,
          `../files/forms/filled/${path.basename(signed_asso_path)}`
        ),
        path.join(
          __dirname,
          `../files/forms/filled/DAE_signed_asso_${form_data.prenom}_${
            form_data.nom
          }_${JSON.parse(form[0].form_data).date}.docx`
        ),
        path.join(
          __dirname,
          `../files/signatures/signature_${form[0].form_signedByAsso}.png`
        ),
        "signatureAsso"
      );
      await db.query(
        "UPDATE form SET form_signedByAsso = ?, form_signed_asso = ? WHERE form_id = ?",
        [form[0].form_signedByAsso, path.basename(signed_asso_path), id]
      );
    }

    res.status(200).json({ message: "Form updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/accept/:id", authenticateToken, async (req, res) => {
  console.log("PUT /api/form/accept/:id");
  const { id } = req.params;
  const user = req.user;
  try {
    console.log(user);

    // if users_email appartient a un groupe qui est de type 'admin'
    console.log(user.users_groups_name);
    const group = (
      await db.query("SELECT * FROM users_groups WHERE users_groups_name = ?", [
        user.users_groups_name,
      ])
    )[0];
    //get the form
    var [form] = await db.query("SELECT * FROM form WHERE form_id = ?", [id]);
    const data = JSON.parse(form[0].form_data);
    console.log(group);
    var statut = form[0].form_statut;
    if (group[0].users_groups_type === "ASSO") {
      //copy the form to a new file
      const signed_asso_path = path.join(
        __dirname,
        `../files/forms/filled/DAE_signed_asso_${data.prenom}_${data.nom}_${data.date}.docx`
      );
      fs.copyFileSync(
        path.join(__dirname, `../files/forms/filled/${form[0].form_to_review}`),
        signed_asso_path
      );
      console.log("copied file to: ", signed_asso_path);
      // insert the name of the user who signed the form
      await keyWordFiller(
        path.join(
          __dirname,
          `../files/forms/filled/${path.basename(signed_asso_path)}`
        ),
        "signedByAsso",
        user.users_username
      );
      //create the placeholder for the signature
      await keyWordFiller(
        path.join(
          __dirname,
          `../files/forms/filled/${path.basename(signed_asso_path)}`
        ),
        "signatureAsso",
        "{{signatureAsso}}"
      );
      //insert the signature
      await daeImageFiller(
        path.join(
          __dirname,
          `../files/forms/filled/${path.basename(signed_asso_path)}`
        ),
        path.join(
          __dirname,
          `../files/forms/filled/DAE_signed_asso_${data.prenom}_${data.nom}_${data.date}.docx`
        ),
        path.join(
          __dirname,
          `../files/signatures/signature_${user.users_email}.png`
        ),
        "signatureAsso"
      );

      // update the form in the database
      await db.query(
        'UPDATE form SET form_statut = "waitingForAdmin", form_signedByAsso = ?, form_signed_asso = ? WHERE form_id = ?',
        [user.users_email, path.basename(signed_asso_path), id]
      );
      statut = "waitingForAdmin";
    } else if (group[0].users_groups_type === "ADMIN") {
      console.log("admin");
      //copy the form to a new file
      const signed_admin_path = path.join(
        __dirname,
        `../files/forms/filled/DAE_signed_admin_${data.prenom}_${data.nom}_${data.date}.docx`
      );

      [form] = await db.query("SELECT * FROM form WHERE form_id = ?", [id]);
      console.log("form: ", form[0].form_signed_asso);

      fs.copyFileSync(
        path.join(
          __dirname,
          `../files/forms/filled/${form[0].form_signed_asso}`
        ),
        signed_admin_path
      );
      console.log("copied file to: ", signed_admin_path);
      // insert the name of the user who signed the form
      await keyWordFiller(
        path.join(
          __dirname,
          `../files/forms/filled/${path.basename(signed_admin_path)}`
        ),
        "signedByAdmin",
        user.users_username
      );
      //create the placeholder for the signature
      await keyWordFiller(
        path.join(
          __dirname,
          `../files/forms/filled/${path.basename(signed_admin_path)}`
        ),
        "signatureAdmin",
        "{{signatureAdmin}}"
      );
      //insert the signature
      await daeImageFiller(
        path.join(
          __dirname,
          `../files/forms/filled/${path.basename(signed_admin_path)}`
        ),
        path.join(
          __dirname,
          `../files/forms/filled/DAE_signed_admin_${data.prenom}_${data.nom}_${data.date}.docx`
        ),
        path.join(
          __dirname,
          `../files/signatures/signature_${user.users_email}.png`
        ),
        "signatureAdmin"
      );
      await db.query(
        'UPDATE form SET form_statut = "accepted", form_signedByAdmin = ? , form_signed_admin = ? WHERE form_id = ?',
        [user.users_email, path.basename(signed_admin_path), id]
      );
      statut = "accepted";
    }

    if (statut === "waitingForAdmin") {
      // send mail to Admin
      const [admin] = await db.query(
        'SELECT * FROM users WHERE users_groups_name = "Responsables Vie Associative"'
      );
      const subject = `[${form[0].form_type} - ${JSON.parse(form[0].form_data)
        .date.split("-")
        .reverse()
        .join("/")}] - NOUVELLE DEMANDE`;
      var html =
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nouvelle Demande</title>
        </head>
        <body style="font-family: 'Roboto', sans-serif; margin: 0; padding: 0; background-image: url('https://docs.bds-efrei.fr/banniere_bds.png'); background-repeat: no-repeat; background-size: cover; width: 100%; height: 100%; ">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="margin: 26px auto;">
                            <tr>
                                <td align="center" bgcolor="#ffffff" style="padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                    <img src="https://docs.bds-efrei.fr/icon/new.gif" width="80" alt="confirmed" style="display: block; margin: 0 auto;">
                                    <h1 style="margin: 20px 0; padding: 0; font-size: 36px; font-weight: bold; text-align: center;">Nouvelle demande</h1>
                                    <div>
                                        <p>Bonjour,</p>
                                        <p>Vous avez reçu une nouvelle demande de ` +
        form[0].form_type +
        ` pour le ` +
        JSON.parse(form[0].form_data).date.split("-").reverse().join("/") +
        ` de la part de ` +
        JSON.parse(form[0].form_data).prenom +
        " " +
        JSON.parse(form[0].form_data).nom +
        `.</p>
                                        <p>Veuillez vous connecter au <a href="https://docs.bds-efrei.fr/admin">site du BDS</a> pour la consulter.</p>
                                        <p>Merci pour votre engagement,</p>
                                        <p>Sportivement</p>
                                        <p class="signature" style="margin-top: 20px; font-size: 14px; text-align: center;">
                                            <b>BDS Efrei Paris</b><br>
                                            <a href="http://www.bds-efrei.fr/">www.bds-efrei.fr</a><br>
                                            30-32 avenue de la République 94800 Villejuif
                                        </p>
                                    </div>
                                    <img class="banniere" src="https://docs.bds-efrei.fr/banniere_mail_bds.png" style="width: 100%; margin-top:0px; border-radius: 10px;">
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        
      
      
      `;

      // get only those who have not users_send_mail to false
      const maillist = admin
        .filter((a) => a.users_send_mail)
        .map((a) => a.users_email)
        .join(", ");
      console.log("mail list: ", maillist);

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
          console.log("Email sent admin: ", info.response);
        }
      });

      res.status(200).json({ message: "Form accepted by association" });
    } else if (statut === "accepted") {
      //extract email from data
      const formData = JSON.parse(form[0].form_data);
      const subject = `[${form[0].form_type} - ${formData.date
        .split("-")
        .reverse()
        .join("/")}] - ACCEPTÉE`;

      // get the username of form_signedByAsso
      const [users] = await db.query(
        "SELECT * FROM users WHERE users_email = ?",
        [form[0].form_signedByAsso]
      );

      const html =
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DAE Acceptée</title>
        </head>
        <body style="font-family: 'Roboto', sans-serif; margin: 0; padding: 0; background-image: url('https://docs.bds-efrei.fr/banniere_bds.png'); background-repeat: no-repeat; background-size: cover; width: 100%; height: 100%; ">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="margin: 26px auto;">
                            <tr>
                                <td align="center" bgcolor="#ffffff" style="padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                    <img src="https://docs.bds-efrei.fr/icon/done.gif" width="80" alt="confirmed" style="display: block; margin: 0 auto;">
                                    <h1 style="margin: 20px 0; padding: 0; font-size: 36px; font-weight: bold; text-align: center;">DAE Acceptée</h1>
                                    <p style="margin: 0 0 20px 0; font-size: 16px; text-align: left;">Bonjour ` +
        formData.prenom +
        `,</p>
                                    <p style="margin: 0 0 0px 0; font-size: 16px; text-align: left;">Votre ` +
        form[0].form_type +
        ` du ` +
        formData.date.split("-").reverse().join("/") +
        ` a été acceptée par ` +
        users[0].users_username +
        `.</p>
                                    <p style="margin: 0 0 20px 0; font-size: 16px; text-align: left;">Veuillez trouver ci-joint le document PDF à signer et à envoyer par mail à votre référent réussite étudiante ainsi qu’à l’alias absence de votre promo.</p>
                                    <p style="margin: 0 0 20px 0; font-size: 16px; text-align: left;">Merci pour votre engagement,</p>
                                    <p style="margin: 0 0 20px 0; font-size: 16px; text-align: left;">Sportivement</p>
                                    <p class="signature" style="margin: 20px 0 0 0; font-size: 14px; text-align: center;">
                                        <b>BDS Efrei Paris</b><br>
                                        <a href="http://www.bds-efrei.fr/">www.bds-efrei.fr</a><br>
                                        30-32 avenue de la République 94800 Villejuif
                                    </p>
                                    <img src="https://docs.bds-efrei.fr/banniere_mail_bds.png" width="100%" style="display: block; border-radius: 10px; margin: 20px 0 0 0;">
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

      console.log("form id: ", id);
      const [document] = await db.query(
        "SELECT * FROM form WHERE form_id = ?",
        [id]
      );

      console.log("document: ", document);
      // look for a pdf file with the same name as the docx. for example : we have test.docx, we look for test.pdf
      const lookingFile = document[0].form_signed_admin
        .split(".")[0]
        .concat(".pdf");
      console.log("looking file: ", lookingFile);
      var pdfPath = "";
      fs.readdir(
        path.join(__dirname, "../files/forms/filled"),
        (err, files) => {
          if (err) {
            console.log(err);
            return;
          }
          files.forEach((file) => {
            if (file === lookingFile) {
              pdfPath = path.join(__dirname, `../files/forms/filled/${file}`);
            }
          });
        }
      );

      if (pdfPath === "") {
        pdfPath = await docxToPdf(
          path.join(
            __dirname,
            `../files/forms/filled/${document[0].form_signed_admin}`
          )
        );
      }

      // convert the data string to json
      const email = JSON.parse(form[0].form_data).mail;
      console.log("email sendin to: ", email);
      const mailOptions = {
        from: `${process.env.EMAIL_FROM}`,
        to: email,
        subject: subject,
        html: html,
        attachments: [
          {
            filename: "DAE.pdf",
            path: path.join(
              __dirname,
              `../files/forms/filled/${pdfPath.split("/").pop()}`
            ),
            contentType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          },
        ],
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email to user", error);
        } else {
          console.log("Email sent to student: ", info.response);
        }
      });
      res.status(200).json({ message: "Form accepted by admin" });
    } else {
      res.status(500).json({ error: "Form not signed" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/wait/:id", authenticateToken, async (req, res) => {
  console.log("PUT /api/form/wait/:id");
  const { id } = req.params;
  const user = req.user;
  try {
    // if the user is admin, then delete his signature if he has signed the form
    const [form] = await db.query("SELECT * FROM form WHERE form_id = ?", [id]);
    if (form[0].form_signedByAdmin === user.users_email) {
      fs.unlinkSync(
        path.join(
          __dirname,
          `../files/forms/filled/${form[0].form_signed_admin}`
        )
      );
      fs.unlinkSync(
        path.join(
          __dirname,
          `../files/forms/filled/${form[0].form_signed_admin.replace(
            ".docx",
            ".pdf"
          )}`
        )
      );
      await db.query(
        'UPDATE form SET form_statut = "waitingForAdmin", form_signedByAdmin = NULL, form_signed_admin = NULL WHERE form_id = ?',
        [id]
      );
    }
    // if the user is asso, then delete his signature if he has signed the form and delete also the signature of the admin
    if (form[0].form_signedByAsso === user.users_email) {
      fs.unlinkSync(
        path.join(
          __dirname,
          `../files/forms/filled/${form[0].form_signed_asso}`
        )
      );
      if (form[0].form_signed_admin) {
        fs.unlinkSync(
          path.join(
            __dirname,
            `../files/forms/filled/${form[0].form_signed_admin}`
          )
        );
        fs.unlinkSync(
          path.join(
            __dirname,
            `../files/forms/filled/${form[0].form_signed_admin.replace(
              ".docx",
              ".pdf"
            )}`
          )
        );
      }
      await db.query(
        'UPDATE form SET form_statut = "to_review", form_signedByAsso = NULL, form_signed_asso = NULL, form_signedByAdmin = NULL, form_signed_admin = NULL WHERE form_id = ?',
        [id]
      );
    }
    res.status(200).json({ message: "Form put on hold" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/delete/:id", authenticateToken, async (req, res) => {
  console.log("DELETE /api/form/delete/:id");
  const { id } = req.params;
  try {
    // delete the files
    const [form] = await db.query("SELECT * FROM form WHERE form_id = ?", [id]);
    fs.unlinkSync(
      path.join(__dirname, `../files/forms/filled/${form[0].form_to_review}`)
    );
    if (form[0].form_signed_asso) {
      fs.unlinkSync(
        path.join(
          __dirname,
          `../files/forms/filled/${form[0].form_signed_asso}`
        )
      );
    }
    if (form[0].form_signed_admin) {
      fs.unlinkSync(
        path.join(
          __dirname,
          `../files/forms/filled/${form[0].form_signed_admin}`
        )
      );
      fs.unlinkSync(
        path.join(
          __dirname,
          `../files/forms/filled/${form[0].form_signed_admin.replace(
            ".docx",
            ".pdf"
          )}`
        )
      );
    }
    await db.query("DELETE FROM form WHERE form_id = ?", [id]);
    res.status(200).json({ message: "Form deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/reject/:id", authenticateToken, async (req, res) => {
  console.log("PUT /api/form/reject/:id");
  const { id } = req.params;
  const { reason } = req.body;
  const [allusers] = await db.query("SELECT * FROM users");
  try {
    //mail the user
    const [form] = await db.query("SELECT * FROM form WHERE form_id = ?", [id]);
    const formData = JSON.parse(form[0].form_data);
    const subject = `[${form[0].form_type} - ${formData.date
      .split("-")
      .reverse()
      .join("/")}] - REFUSÉE`;
    console.log(allusers);
    console.log("form: ", form[0]);
    var html =
      `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DAE Refusée</title>
      </head>
      <body style="font-family: 'Roboto', sans-serif; margin: 0; padding: 0; background-image: url('https://docs.bds-efrei.fr/banniere_bds.png'); background-repeat: no-repeat; background-size: cover; width: 100%; height: 100%; ">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                  <td align="center">
                      <table width="600" border="0" cellspacing="0" cellpadding="0" style="margin: 26px auto;">
                          <tr>
                              <td align="center" bgcolor="#ffffff" style="padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                  <img src="https://docs.bds-efrei.fr/icon/done.gif" width="80" alt="confirmed" style="display: block; margin: 0 auto;">
                                  <h1 style="margin: 20px 0; padding: 0; font-size: 36px; font-weight: bold; text-align: center;">DAE Refusée</h1>
                                  <p style="margin: 0 0 20px 0; font-size: 16px; text-align: left;">Bonjour ` +
      formData.prenom +
      `,</p>
                                  <p style="margin: 0 0 20px 0; font-size: 16px; text-align: left;">Votre ` +
      form[0].form_type +
      ` du ` +
      formData.date.split("-").reverse().join("/") +
      ` a été refusée par ` +
      req.user.users_username +
      ` pour la raison suivante : <b>` +
      reason +
      `</b>.</p>
                                  <p style="margin: 0 0 20px 0; font-size: 16px; text-align: left;">Nous vous demandons de bien vouloir renouveler votre demande.</p>
                                  <p style="margin: 0 0 20px 0; font-size: 16px; text-align: left;">Merci pour votre engagement,</p>
                                  <p style="margin: 0 0 20px 0; font-size: 16px; text-align: left;">Sportivement</p>
                                  <p class="signature" style="margin: 20px 0 0 0; font-size: 14px; text-align: center;">
                                      <b>BDS Efrei Paris</b><br>
                                      <a href="http://www.bds-efrei.fr/">www.bds-efrei.fr</a><br>
                                      30-32 avenue de la République 94800 Villejuif
                                  </p>
                                  <img src="https://docs.bds-efrei.fr/banniere_mail_bds.png" width="100%" style="display: block; border-radius: 10px; margin: 20px 0 0 0;">
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
      
`;

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
        console.log("Email sent to user: ", info.response);
      }
    });

    // if the form was already signed by the association, send a mail to the association member
    console.log("form: ", form[0]);
    console.log(
      "signed by asso: ",
      form[0].form_signedByAsso,
      "is null: ",
      form[0].form_signedByAsso === null
    );
    if (form[0].form_signedByAsso !== null) {
      const [asso] = await db.query(
        "SELECT * FROM users WHERE users_email = ?",
        [form[0].form_signedByAsso]
      );
      if (asso[0].users_send_mail) {
        const subject = `[${form[0].form_type} - ${formData.date
          .split("-")
          .reverse()
          .join("/")}] - REFUSÉE`;

        var html =
          `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>DAE Refusée</title>
          </head>
          <body style="font-family: 'Roboto', sans-serif; margin: 0; padding: 0; background-image: url('https://docs.bds-efrei.fr/banniere_bds.png'); background-repeat: no-repeat; background-size: cover; width: 100%; height: 100%; ">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                      <td align="center">
                          <table width="600" border="0" cellspacing="0" cellpadding="0" style="margin: 26px auto;">
                              <tr>
                                  <td align="center" bgcolor="#ffffff" style="padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                      <img src="https://docs.bds-efrei.fr/icon/done.gif" width="80" alt="confirmed" style="display: block; margin: 0 auto;">
                                      <h1 style="margin: 20px 0; padding: 0; font-size: 36px; font-weight: bold; text-align: center;">DAE Refusée</h1>
                                      <div>
                                          <p>Bonjour ` +
          asso[0].users_username +
          `,</p>
                                          <p>La demande de ` +
          form[0].form_type +
          ` du ` +
          formData.date.split("-").reverse().join("/") +
          ` demandée par ` +
          formData.prenom +
          " " +
          formData.nom +
          ` a été refusée par ` +
          req.user.users_username +
          ` pour la raison suivante : <b>` +
          reason +
          `</b>.</p>
                                          <p>Merci de bien vouloir vous connecter au <a href='https://docs.bds-efrei.fr/admin'>site du BDS</a> pour plus d'informations.</p>
                                          <p>Merci pour votre engagement,</p>
                                          <p>Sportivement</p>
                                          <p class="signature" style="margin-top: 20px; font-size: 14px; text-align: center;">
                                              <b>BDS Efrei Paris</b><br>
                                              <a href="http://www.bds-efrei.fr/">www.bds-efrei.fr</a><br>
                                              30-32 avenue de la République 94800 Villejuif
                                          </p>
                                      </div>
                                      <img class="banniere" src="https://docs.bds-efrei.fr/banniere_mail_bds.png" style="width: 100%; margin-top:0px; border-radius: 10px;">
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
          </html>
          
        `;

        const mailOptions = {
          from: `${process.env.EMAIL_FROM}`,
          to: asso[0].users_email,
          subject: subject,
          html: html,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email: ", error);
          } else {
            console.log("Email sent to staff: ", info.response);
          }
        });
      }
      await db.query(
        'UPDATE form SET form_statut = "rejected", form_reject_reason = ?, form_rejectedBy = ?, form_signedByAdmin = null, form_signed_admin = null WHERE form_id = ?',
        [reason, req.user.users_email, id]
      );
      // delete the signedByAdmin file
      fs.unlinkSync(
        path.join(
          __dirname,
          `../files/forms/filled/${form[0].form_signed_admin}`
        )
      );
      fs.unlinkSync(
        path.join(
          __dirname,
          `../files/forms/filled/${form[0].form_signed_admin.replace(
            ".docx",
            ".pdf"
          )}`
        )
      );
    } else {
      await db.query(
        'UPDATE form SET form_statut = "rejected", form_reject_reason = ?, form_rejectedBy = ?, form_signedByAdmin = null, form_signed_admin = null, form_signedByAsso = null, form_signed_asso = null WHERE form_id = ?',
        [reason, req.user.users_email, id]
      );
      // delete the signedByAdmin file and the signedByAsso file
      if (form[0].form_signed_admin) {
        fs.unlinkSync(
          path.join(
            __dirname,
            `../files/forms/filled/${form[0].form_signed_admin}`
          )
        );
        fs.unlinkSync(
          path.join(
            __dirname,
            `../files/forms/filled/${form[0].form_signed_admin.replace(
              ".docx",
              ".pdf"
            )}`
          )
        );
      }
      if (form[0].form_signed_asso) {
        fs.unlinkSync(
          path.join(
            __dirname,
            `../files/forms/filled/${form[0].form_signed_asso}`
          )
        );
      }
    }

    res.status(200).json({ message: "Form rejected" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
