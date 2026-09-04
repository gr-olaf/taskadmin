const { getMe, getFile, getImages, getComments } = require('./figma');

async function main() {
  try {
    // Проверка токена - получение информации о пользователе
    console.log('=== Проверка подключения к Figma ===');
    const user = await getMe();
    console.log(`Пользователь: ${user.email}`);
    console.log(`Имя: ${user.handle}`);

    // Пример: Получение файла по ключу
    // Замените на реальный ключ файла из URL:
    // https://www.figma.com/file/ВОТ_ЭТОТ_КЛЮЧ/название-файла
    const fileKey = 'YOUR_FILE_KEY';

    console.log('\n=== Получение информации о файле ===');
    const file = await getFile(fileKey);
    console.log(`Название файла: ${file.name}`);
    console.log(`Последнее обновление: ${new Date(file.lastModified)}`);

    // Пример: Получение изображений нод
    // const nodeIds = ['1:2', '1:3']; // ID нод из Figma
    // const images = await getImages(fileKey, nodeIds);
    // console.log('Изображения:', images.images);

    // Пример: Получение комментариев
    // const comments = await getComments(fileKey);
    // console.log('Комментарии:', comments.comments.length);

  } catch (error) {
    if (error.response) {
      console.error('Ошибка API:', error.response.status, error.response.data);
    } else {
      console.error('Ошибка:', error.message);
    }
  }
}

main();
