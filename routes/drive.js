const fs = require('fs');
const { google } = require('googleapis');
const apikeys = require('../driveapikey.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];
const upload = require('../routes/multer');
const runGeminiAI = require('../Biodiversity/gemini');
const path = require('path');
const https = require('https');

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

async function downloadFileFromDrive(authClient, fileId) {
  const drive = google.drive({ version: 'v3', auth: authClient });
  const fileResponse = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  const tempFilePath = path.join(__dirname, `temp_${fileId}`);
  const dest = fs.createWriteStream(tempFilePath);

  return new Promise((resolve, reject) => {
    fileResponse.data
      .on('end', () => {
        console.log('Download complete');
        resolve(tempFilePath);
      })
      .on('error', err => {
        console.error('Error downloading file:', err);
        reject(err);
      })
      .pipe(dest);
  });
}

async function uploadFile(authClient, filePath) {
  console.log("Upload started...");
  const drive = google.drive({ version: 'v3', auth: authClient });

  const fileMetaData = {
    name: filePath.originalname,
    parents: ['1h2_FiFy1ftFPLLfHCxaEI6rczPHrUQBW']
  };

  const media = {
    body: fs.createReadStream(filePath.path),
    mimeType: filePath.mimetype
  };

  try {
    const response = await drive.files.create({
      resource: fileMetaData,
      media: media,
      fields: 'id'
    });
    console.log("Uploaded...");
    const fileId = response.data.id;
    console.log("File ID:", fileId);

    // Set file permissions to public
    await drive.permissions.create({
      fileId: fileId,
      resource: { role: 'reader', type: 'anyone' }
    });

    // Download the file from Google Drive to a temporary file
    const tempFilePath = await downloadFileFromDrive(authClient, fileId);

    // Call the Gemini AI function with the temporary file path
    const result = await runGeminiAI(tempFilePath);
    console.log("Gemini AI Result:", result);


    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    return { fileId, geminiResult: result };
  } catch (error) {
    console.error("Error uploading the file:", error);
    throw error;
  }
}

module.exports = async function (req, res, next) {
  try {
    const authClient = await authorize();
    upload.single('file')(req, res, async err => {
      if (err) {
        console.error("Error uploading file:", err);
        return next(err);
      }
      try {
        const uploadedFile = await uploadFile(authClient, req.file);
        // console.log("File uploaded successfully.");
        // console.log("File ID saved:", uploadedFile.fileId);
        // console.log("Gemini AI Result:", uploadedFile.geminiResult);
        res.json({
          fileId: uploadedFile.fileId,
          geminiResult: uploadedFile.geminiResult
        });
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