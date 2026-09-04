require('dotenv').config();
const { getFile, getFileNodes, getImages, getComments } = require('./figma');

const FILE_KEY = '9piI5AIxerSPJBrQMbfhTD';

async function main() {
  try {
    console.log('=== Информация о файле ===');
    const file = await getFile(FILE_KEY);
    console.log(`Название: ${file.name}`);
    console.log(`Последнее обновление: ${file.lastModified}`);
    console.log(`Страницы: ${Object.keys(file.document.children).length}`);

    file.document.children.forEach((page, i) => {
      console.log(`\n--- Страница ${i + 1}: ${page.name} ---`);
      if (page.children) {
        page.children.forEach((frame) => {
          console.log(`  Фрейм: ${frame.name} (${frame.type})`);
          if (frame.children) {
            frame.children.forEach((child) => {
              console.log(`    - ${child.name} (${child.type})`);
            });
          }
        });
      }
    });

    // Получение стилей из корневых фреймов
    console.log('\n=== Стили и цвета ===');
    const rootNodes = file.document.children.flatMap(page => 
      page.children ? page.children.map(child => child.id) : []
    );
    
    if (rootNodes.length > 0) {
      const nodesData = await getFileNodes(FILE_KEY, rootNodes);
      const extractColors = (node, colors = new Set()) => {
        if (node.fills) {
          node.fills.forEach(fill => {
            if (fill.color) {
              const { r, g, b, a } = fill.color;
              colors.add(`rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${a})`);
            }
          });
        }
        if (node.children) {
          node.children.forEach(child => extractColors(child, colors));
        }
        return colors;
      };

      const allColors = new Set();
      Object.values(nodesData.nodes).forEach(nodeData => {
        if (nodeData.document) {
          extractColors(nodeData.document, allColors);
        }
      });
      
      console.log('Уникальные цвета:');
      allColors.forEach(color => console.log(`  ${color}`));
    }

    // Комментарии
    console.log('\n=== Комментарии ===');
    const comments = await getComments(FILE_KEY);
    console.log(`Всего комментариев: ${comments.comments.length}`);
    comments.comments.forEach((comment, i) => {
      console.log(`  ${i + 1}. ${comment.message}`);
    });

  } catch (error) {
    if (error.response) {
      console.error('Ошибка API:', error.response.status, error.response.data);
    } else {
      console.error('Ошибка:', error.message);
    }
  }
}

main();
