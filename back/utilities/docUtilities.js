
// the goal is to fill a dae_template.docx with the data from the form and save it in /forms/filled

const path = require('path');
const fs = require('fs');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const docxtopdf = require('docx-pdf');



const daeFiller = (data) => {
    const daeTemplatePath = path.join(__dirname, `../files/forms/templates/DAE_template_${data.signedByEmail}.docx`); // create the path of the template document

    const word = new PizZip(fs.readFileSync(daeTemplatePath)); // read the content of the docx file
    const doc = new Docxtemplater(word, { linebreaks: true }); // create a new instance of the docxtemplater


    //create a string for all the courses that will be placed at {cours}
    let courses = '';
    for (let i = 0; i < data.courses.length; i++) {
        courses += '- ' + data.courses[i].matiere + ' de ' + data.courses[i].heureDebut + ' à ' + data.courses[i].heureFin + '\n'
    }
    data.cours = courses;

    console.log(data)
    doc.setData(data);

    try {
        doc.render(); // render the document (replace the variables with the data)
    } catch (error) {
        throw error;
    }

    const buf = doc.getZip().generate({ type: 'nodebuffer' }); // get the buffer of the rendered document

    // if the filename already exists, add a number to the filename
    let i = 1;
    if (data.date.includes('/')) {
        data.date = data.date.replace(/\//g, '-');
    }
    var filledDAEPath = path.join(__dirname, `../files/forms/filled/DAE_${data.prenom}_${data.nom}_${data.date}.docx`); // create the path of the filled document
    console.log('DAE path: ', filledDAEPath);

    while (fs.existsSync(filledDAEPath)) {
        console.log('file exists')
        // if there are '/' in the data.date, replace them with '-'

        filledDAEPath = path.join(__dirname, `../files/forms/filled/DAE_${data.prenom}_${data.nom}_${data.date}_${i}.docx`);
        i++;
    }
    fs.writeFileSync(filledDAEPath, buf); // write the buffer to the filled document
    return path.basename(filledDAEPath);
}

const docxToPdf = async (docxPath) => {
    try {
        // get the api key from the .env file
        const apiKey = process.env.CONVERT_API_KEY;
        const fileName = path.basename(docxPath, '.docx');

        var convertapi = require('convertapi')(apiKey);
        const result = await convertapi.convert('pdf', {
            File: docxPath,
            FileName: fileName
        }, 'docx');
        
        await result.saveFiles(`files/forms/filled`);
        // get the path were the pdf was saved
        console.log("Successfully converted file")
        const pdfPath = path.join(__dirname, `../files/forms/filled/${fileName}.pdf`);
        console.log(pdfPath);
        return pdfPath;
    } catch (error) {
        console.error(error.toString());
        throw error; // throw the error to be caught in the calling function
    }
}


module.exports = { daeFiller, docxToPdf };