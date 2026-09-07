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
    
    // Safely list the specific folder to confirm accessibility
    const res = await drive.files.list({
      q: `'${folderId}' in parents or id = '${folderId}'`,
      pageSize: 1,
      fields: 'files(id, name)',
    });

    if (res.data.files && res.data.files.length > 0) {
      console.log('✅ Google Drive Connection established successfully!');
    } else {
      console.warn('⚠️ Google Drive connected, but the specified Folder ID was not found or is empty.');
    }
  } catch (error) {
    console.error('❌ Google Drive Connection Failed:', error.message);
  }
};

export const uploadToDrive = async (fileBuffer, fileName, mimeType) => {
  try {
    // Cleaner, native buffer-to-stream processing
    const bufferStream = Readable.from(fileBuffer);

    const response = await drive.files.create({ 
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      }, 
      media: {
        mimeType,
        body: bufferStream,
      },
      fields: 'id',
    });

    const fileId = response.data.id;

    // Make the uploaded file publicly readable
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      fileId,
      // Official and reliable Direct View URL for frontend rendering
      directLink: `https://google.com{fileId}`,
    };
  } catch (error) {
    console.error('❌ Upload to Google Drive failed:', error.message);
    throw new Error(`Drive Upload Error: ${error.message}`);
  }
};

export const deleteFromDrive = async (fileId) => {
  if (!fileId) return;
  try {
    await drive.files.delete({ fileId });
    console.log(`🗑️ Successfully deleted file ID: ${fileId} from Drive`);
  } catch (error) {
    console.error(`❌ Failed to delete file ID ${fileId} from Drive:`, error.message);
    throw error;
  }
};
