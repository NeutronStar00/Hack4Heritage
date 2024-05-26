const fs = require('fs');
const { google }= require('googleapis');
const apikeys = require('../driveapikey.json');
const upload = require('../routes/multer');

const SCOPE = ['https://www.googleapis.com/auth/drive'];

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

        // Set file permissions to public
        await drive.permissions.create({
            fileId: fileId,
            resource: {
                role: 'reader',
                type: 'anyone'
            }
        });

        // Get the updated webViewLink
        const updatedFile = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink'
        });

        return { fileId, filePath: filePath.path, fileLink: updatedFile.data.webViewLink };
    } catch (error) {
        console.error("Error uploading the file:", error);
        throw error;
    }
}

module.exports = {
    authorize,
    uploadFile
};