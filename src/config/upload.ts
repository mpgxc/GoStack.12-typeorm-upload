import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const consttmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
    directory: consttmpFolder,
    storage: multer.diskStorage({
        destination: consttmpFolder,
        filename(request, file, callback) {
            const fileHash = crypto.randomBytes(10).toString('hex');
            const fileName = `${fileHash}_${file.originalname}`;

            return callback(null, fileName);
        },
    }),
};
