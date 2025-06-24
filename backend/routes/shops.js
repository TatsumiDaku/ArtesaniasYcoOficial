const express = require('express');
const router = express.Router();
const { getShops, getShopById } = require('../controllers/shops');

// @route   GET api/shops
// @desc    Obtener todas las tiendas de artesanos
// @access  Public
router.get('/', getShops);

// @route   GET api/shops/:id
// @desc    Obtener una tienda por su ID de artesano
// @access  Public
router.get('/:id', getShopById);

module.exports = router; 