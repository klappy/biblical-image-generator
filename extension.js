// The module 'vscode' contains the VS Code extensibility API
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const { OpenAI } = require("openai");
const axios = require("axios").default;
const instructions = require("./instructions");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Get configuration settings
  // let { openaiApiKey, imagesPath } = getConfiguration();
  // // Initialize OpenAI client
  // let openai = new OpenAI({ apiKey: openaiApiKey });

  // vscode.workspace.onDidChangeConfiguration((event) => {
  //   if (event.affectsConfiguration("myExtension")) {
  //     let { openaiApiKey: openaiApiKeyChange, imagesPath: imagesPathChange } = getConfiguration();
  //     // React to the configuration change
  //     openaiApiKey = openaiApiKeyChange;
  //     imagesPath = imagesPathChange;
  //     openai = new OpenAI({ apiKey: openaiApiKey });
  //   }
  // });

  let disposable = vscode.commands.registerCommand(
    "biblical-image-generator.openaiAsk",
    async function () {
      // Display response in an output panel
      const outputChannel = vscode.window.createOutputChannel("OpenAI");
      outputChannel.show(true);
      // Command implementation will go here
      // vscode.window.showInformationMessage("Get ready to ask OpenAI!");
      // Prompt for user input
      const userInput = await vscode.window.showInputBox({ prompt: "Ask a question to OpenAI" });
      if (!userInput) return;
      outputChannel.appendLine("\nUser input:");
      outputChannel.appendLine(userInput);

      const { openaiApiKey } = getConfiguration();
      const openai = new OpenAI({ apiKey: openaiApiKey });
      const response = await askGPT({ prompt: userInput, openai });
      outputChannel.appendLine(`\nGPT response:\n${response}\n`);
    }
  );
  // Use the console to output diagnostic information (console.log) and errors (console.error)

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  // let disposable1 = vscode.commands.registerCommand("my-extension.helloWorld", function () {
  //   // The code you place here will be executed every time your command is executed

  //   // Display a message box to the user
  //   vscode.window.showInformationMessage("Hello World from my-extension!");
  // });

  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand(
    "biblical-image-generator.imageCreate",
    async function () {
      // Display response in an output panel
      const outputChannel = vscode.window.createOutputChannel("OpenAI");
      outputChannel.show(true);
      // Command implementation will go here
      // vscode.window.showInformationMessage("Get ready to ask OpenAI!");
      // Prompt for user input
      const userInput = await vscode.window.showInputBox({
        prompt: "What Biblical image would you like to create?",
      });
      if (!userInput) return;

      outputChannel.appendLine("\nUser input:");
      outputChannel.appendLine(userInput);

      const prompt = `${instructions.prompt}\n${userInput}`;
      outputChannel.appendLine("\nPrompt:");
      outputChannel.appendLine(prompt);

      const { openaiApiKey, imagesPath } = getConfiguration();

      const openai = new OpenAI({ apiKey: openaiApiKey });
      const imageObject = await createImage({ prompt, openai });
      outputChannel.appendLine(`\nImage url1:\n${imageObject.url}`);
      const imageData = await downloadImage(imageObject.url);
      const filename = userInput.replace(/[^\w\d:-]/g, "_");
      const uuid = Math.random().toString(36).slice(-6);

      await saveImageToProjectFolder({
        imageData,
        imagesPath,
        filename: `${filename}-${uuid}.png`,
      });

      await saveImageToProjectFolder({
        imageData: imageObject.revised_prompt,
        imagesPath,
        filename: `${filename}-${uuid}.txt`,
      });
    }
  );
}

// This method is called when your extension is deactivated
function deactivate() {}

function getConfiguration() {
  const config = vscode.workspace.getConfiguration("biblical-image-generator");
  const openaiApiKey = config.get("openaiApiKey");
  const imagesPath = config.get("imagesPath");

  return { openaiApiKey, imagesPath };
}

async function askGPT({ prompt, openai, model = "gpt-4-1106-preview" }) {
  // Send input to OpenAI API
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    vscode.window.showErrorMessage(`Error communicating with OpenAI: ${error}`);
  }
}

async function createImage({
  prompt,
  openai,
  model = "dall-e-3",
  quality = "standard",
  style = "vivid",
}) {
  try {
    const image = await openai.images.generate({
      model,
      prompt,
      quality,
      style,
    });
    try {
      vscode.window.showInformationMessage(`model: ${model}`);
      return image.data[0];
    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error communicating with OpenAI: ${error}`);
  }
}

async function downloadImage(imageUrl) {
  try {
    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "arraybuffer", // Important for binary data like images
    });

    return response.data;
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}

async function saveImageToProjectFolder({ imageData, imagesPath, filename }) {
  // Get the current workspace folder
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folder found.");
    return;
  }
  const folderPath = workspaceFolders[0].uri.fsPath;

  // Define the path where the image will be saved
  const imagesFolder = path.join(folderPath, imagesPath);
  const imagePath = path.join(imagesFolder, filename);

  if (!fs.existsSync(imagesFolder)) {
    fs.mkdirSync(imagesFolder, { recursive: true });
  }
  // Write the image data to a file
  fs.writeFile(imagePath, imageData, "binary", (err) => {
    if (err) {
      vscode.window.showErrorMessage(`Error saving image: ${err}`);
    } else {
      vscode.window.showInformationMessage(`Image saved to ${imagePath}`);
    }
  });
}

module.exports = {
  activate,
  deactivate,
};
