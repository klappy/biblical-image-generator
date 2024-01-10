const vscode = require("vscode");

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

module.exports = {
  askGPT,
  createImage,
};
