
// the goal is to fill a dae_template.docx with the data from the form and save it in /forms/filled

const path = require('path');
const fs = require('fs');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
var ImageModule = require('open-docxtemplater-image-module');
var JSZip = require('jszip');
const { patchDocument, PatchType, ImageRun } = require('docx');
const sizeOf = require('image-size');

function nullGetter(part) {
    if (part.raw) {
        return "{" + part.raw + "}";
    }
    if (!part.module && part.value) {
        return "{" + part.value + "}";
    }
    return "";
}

const daeFiller = async (data) => {
    const daeTemplatePath = path.join(__dirname, `../files/forms/templates/DAE_template.docx`); // create the path of the template document

    const word = new PizZip(fs.readFileSync(daeTemplatePath)); // read the content of the docx file
    const doc = new Docxtemplater(word, {nullGetter, linebreaks: true }); // create a new instance of the docxtemplater

    //create a string for all the courses that will be placed at {cours}
    let courses = '';
    for (let i = 0; i < data.courses.length; i++) {
        courses += '- ' + data.courses[i].matiere + ' de ' + data.courses[i].heureDebut + ' à ' + data.courses[i].heureFin + '\n'
    }
    data.cours = courses;

    data.fait_le = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    data.fait_a = 'Villejuif';
    data.signatureAsso="{{signatureAsso}}";
    data.signatureAdmin="{{signatureAdmin}}";
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
    console.log("filled docx")
    return path.basename(filledDAEPath);
}

const daeImageFiller = async (docxPath, outputPath, imagePath, imgTag) => {
    // get the width and height of the image and normalize them to 100Xauto
    
    var width = 0
    var height = 0
    
    sizeOf(imagePath).then(dimensions => {
        width = dimensions.width;
        height = dimensions.height;
    });

    console.log('width: ', width, 'height: ', height);

    const newWidth = 100;
    const newHeight = (newWidth * height) / width;

    patchDocument(fs.readFileSync(docxPath), {
        patches: {
            [imgTag]: {
                type: PatchType.PARAGRAPH,
                children: [
                    new ImageRun({ type: 'png', data: fs.readFileSync(imagePath), transformation: { width: newWidth, height: newHeight } }),
                ],
            }
        },
    })
    .then((buffer) => {
        fs.writeFileSync(outputPath, buffer);
    })

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


module.exports = { daeFiller, daeImageFiller, docxToPdf }; // export the functions to be used in other files