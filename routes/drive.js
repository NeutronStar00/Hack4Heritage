const fs = require('fs');
const { google }= require('googleapis');
const apikeys = require('../driveapikey.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];
const upload = require('../routes/multer');


/* GOOGLE DRIVE API CODE */

async function authorize() {
    const jwtClient = new google.auth.JWT(
        apikeys.client_email,
        null,
        apikeys.private_key,
        SCOPE
    );
    await jwtClient.authorize();
    return jwtClient;
  }
  
  async function uploadFile(authClient, filePath) {
    console.log("Upload started...");
  
    const drive = google.drive({ version: 'v3', auth: authClient });
  
    const fileMetaData = {
        name: filePath.originalname,
        parents: ['1h2_FiFy1ftFPLLfHCxaEI6rczPHrUQBW'] // Folder ID where the file will be uploaded
    };
  
    const media = {
        body: fs.createReadStream(filePath.path),
        mimeType: filePath.mimetype
    };
  
    try {
        const response = await drive.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id, webViewLink' // Request the webViewLink in the response
        });
  
        console.log("Uploaded...");
        const fileId = response.data.id;
        const fileLink = response.data.webViewLink;
  
        console.log("File ID:", fileId);
        console.log("File Link:", fileLink);
  
        return { fileId, fileLink };
    } catch (error) {
        console.error("Error uploading the file:", error);
        throw error;
    }
  }
  
  module.exports = async function(req, res, next) {
    try {
        const authClient = await authorize();
        upload.single('file')(req, res, async err => {
            if (err) {
                console.error("Error uploading file:", err);
                return next(err);
            }
  
            try {
                const uploadedFile = await uploadFile(authClient, req.file);
                console.log("File uploaded successfully.");
                console.log("File ID saved:", uploadedFile.fileId);
                console.log("File link saved:", uploadedFile.fileLink);
  
                // You can now use uploadedFile.fileId and uploadedFile.fileLink variables as needed
            } catch (error) {
                console.error("Error:", error);
                return next(error);
            }
        });
    } catch (error) {
        console.error("Authorization error:", error);
        return next(error);
    }
  };
  /* */