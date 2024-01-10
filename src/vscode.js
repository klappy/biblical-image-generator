const vscode = require("vscode");

function getConfiguration() {
  const config = vscode.workspace.getConfiguration("biblical-image-generator");
  const openaiApiKey = config.get("openaiApiKey");
  const imagesPath = config.get("imagesPath");

  return { openaiApiKey, imagesPath };
}

module.exports = {
  getConfiguration,
};
