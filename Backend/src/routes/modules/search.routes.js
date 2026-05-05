const express = require('express');
const SearchController = require('../../controllers/searchController');
const authMiddleware = require('../../utils/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, SearchController.search);

module.exports = router;
