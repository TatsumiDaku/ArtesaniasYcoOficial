const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento dinámica
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = 'uploads/avatars/';
        if (req.baseUrl.includes('products')) dest = 'uploads/products/';
        else if (req.baseUrl.includes('shops')) dest = 'uploads/shops/';
        // Puedes agregar más casos según tus rutas
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let prefix = 'avatar-';
        if (req.baseUrl.includes('products')) prefix = 'product-';
        else if (req.baseUrl.includes('shops')) prefix = 'shop_header_image-';
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de archivos para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Error: El archivo debe ser una imagen válida (jpeg, jpg, png, gif).'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB
    fileFilter: fileFilter
});

module.exports = upload; 