// The module 'vscode' contains the VS Code extensibility API
const vscode = require("vscode");
const { OpenAI } = require("openai");

const instructions = require("./instructions");
const {
  download,
  askGPT,
  createImage,
  getConfiguration,
  saveFileToProjectFolder,
} = require("./src");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
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
      const imageData = await download(imageObject.url);
      const filename = userInput.replace(/[^\w\d:-]/g, "_");
      const uuid = Math.random().toString(36).slice(-6);

      await saveFileToProjectFolder({
        data: imageData,
        subfolder: imagesPath,
        filename: `${filename}-${uuid}.png`,
      });

      await saveFileToProjectFolder({
        data: imageObject.revised_prompt,
        subfolder: imagesPath,
        filename: `${filename}-${uuid}.txt`,
      });
    }
  );
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
