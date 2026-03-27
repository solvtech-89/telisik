const { proxyToBackend } = require("../proxyHandler");

module.exports = async (req, res) => {
  return proxyToBackend(req, res, "auth");
};
