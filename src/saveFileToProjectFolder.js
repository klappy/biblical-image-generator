const fs = require("fs");
const path = require("path");
const vscode = require("vscode");

async function saveFileToProjectFolder({ data, subfolder, filename }) {
  // Get the current workspace folder
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folder found.");
    return;
  }
  const workspaceFolder = workspaceFolders[0].uri.fsPath;
  // Define the path where the image will be saved
  const imagesFolder = path.join(workspaceFolder, subfolder);
  const filepath = path.join(imagesFolder, filename);

  if (!fs.existsSync(imagesFolder)) {
    fs.mkdirSync(imagesFolder, { recursive: true });
  }
  // Write the image data to a file
  fs.writeFile(filepath, data, "binary", (err) => {
    if (err) {
      vscode.window.showErrorMessage(`Error saving file: ${err}`);
    } else {
      vscode.window.showInformationMessage(`File saved to ${filepath}`);
    }
  });
}

module.exports = {
  saveFileToProjectFolder,
};
