const SearchService = require('../services/search.service');

class SearchController {
  static search(req, res) {
    try {
      const result = SearchService.search(req.userId, req.query.q);
      res.status(result.status).json(result.body);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = SearchController;
