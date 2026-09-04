require('dotenv').config();
const axios = require('axios');

const FIGMA_API_BASE = 'https://api.figma.com/v1';

const figmaClient = axios.create({
  baseURL: FIGMA_API_BASE,
  headers: {
    'X-Figma-Token': process.env.FIGMA_TOKEN,
  },
});

async function getFile(fileKey) {
  const response = await figmaClient.get(`/files/${fileKey}`);
  return response.data;
}

async function getFileNodes(fileKey, nodeIds) {
  const ids = nodeIds.join(',');
  const response = await figmaClient.get(`/files/${fileKey}/nodes?ids=${ids}`);
  return response.data;
}

async function getImages(fileKey, nodeIds, format = 'png', scale = 1) {
  const ids = nodeIds.join(',');
  const response = await figmaClient.get(
    `/images/${fileKey}?ids=${ids}&format=${format}&scale=${scale}`
  );
  return response.data;
}

async function getFileComponents(fileKey) {
  const response = await figmaClient.get(`/files/${fileKey}/components`);
  return response.data;
}

async function getFileStyles(fileKey) {
  const response = await figmaClient.get(`/files/${fileKey}/styles`);
  return response.data;
}

async function getComments(fileKey) {
  const response = await figmaClient.get(`/files/${fileKey}/comments`);
  return response.data;
}

async function getMe() {
  const response = await figmaClient.get('/me');
  return response.data;
}

module.exports = {
  getFile,
  getFileNodes,
  getImages,
  getFileComponents,
  getFileStyles,
  getComments,
  getMe,
};
