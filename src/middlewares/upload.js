import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(
            null,
            path.join(__dirname.replace('middlewares', 'public'), '/files')
        );
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `profile-${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const ALLOWED_FORMATS = ['jpg', 'png', 'jpeg'];

const multerFilter = (req, file, cb) => {
    if (ALLOWED_FORMATS.includes(file.mimetype.split('/')[1])) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de foto no permitida'), false);
    }
};

export const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});
