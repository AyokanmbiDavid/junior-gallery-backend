import { google } from 'googleapis';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' 
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

export const checkDriveConnection = async () => {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    // Test direct metadata query
    const res = await drive.files.get({
      fileId: folderId, 
      fields: 'id, name, mimeType',
    });

    console.log(`Successfully connected to folder: "${res.data.name}" (ID: ${res.data.id})`);
  } catch (error) {
    console.error('Google Drive Connection Failed:', error.message);
  }
};

export const uploadToDrive = async (fileBuffer, fileName, mimeType) => {
  const bufferStream = new Readable();
  bufferStream.push(fileBuffer);
  bufferStream.push(null); 

  const response = await drive.files.create({ 
    requestBody: {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    }, 
    media: {
      mimeType,
      body: bufferStream,
    },
    fields: 'id, webViewLink, webContentLink',
  });

  const fileId = response.data.id;

  // Make the file publicly accessible
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    fileId,
    directLink: `https://lh3.googleusercontent.com/d/${fileId}`,
  };
};

export const deleteFromDrive = async (fileId) => {
  if (!fileId) return;
  await drive.files.delete({ fileId });
};