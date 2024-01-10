const axios = require("axios").default;

async function download(url) {
  try {
    const response = await axios({
      url: url,
      method: "GET",
      responseType: "arraybuffer", // Important for binary data like images
    });

    return response.data;
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}

module.exports = {
  download,
};
