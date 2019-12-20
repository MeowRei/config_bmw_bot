const xlsx = require('node-xlsx').default;

class FileParser {
  constructor(fileName) {
    this.fileName = fileName;
  }

  // парсим Эксель и берем из него нужный массив (тот, в котором опции)
  workBookInit() {
    const workSheetsFromFile = xlsx.parse(this.fileName);
    for (const item of workSheetsFromFile) {
      if (item.name === 'car') {
        return item.data;
      }
    }
  }

  // преобразуем массив данных в объект с опциями, без пустых полей и строк
  filterCarDetails() {
    const data = this.workBookInit();
    const regex = RegExp(/^\s*$/);
    const newData = data.filter((elem) => (elem.length !== 0));
    const resulted = [];

    for (const item of newData) {
      const newItem = item
        .filter((elem) => (elem.length !== 0))
        .filter((elem) => !regex.test(elem));
      if (newItem.length !== 0) {
        resulted.push(newItem);
      }
    }
    return resulted;
  }

  // создает массив только с номерами моделей по спецификации
  parseOptions() {
    const data = this.filterCarDetails();
    const optionsOnly = [];
    for (const item of data) {
      const regexOptions = RegExp(/^[A-Z0-9]{3,}\s\s\s[A-Za-z0-9а-яА-Я\s(),.\/-]+/);
      if (regexOptions.test(item)) {
        optionsOnly.push(item.join('').split('   ')[0]);
      }
    }
    return optionsOnly;
  }

  // создает массив с номерами модели, цвета, салона
  parseModelOptions() {
    const dataArr = this.filterCarDetails();
    const threeOptions = dataArr.splice(0, 3);
    const result = [];
    for (const item of threeOptions) {
      const regex = RegExp(/^[A-Z0-9]{3,}/);
      const found = item[1].match(regex)[0];
      result.push(found);
    }
    return result;
  }

  // создаем общий массив со всеми номерами опций + модель + цвет + салон
  async createResultCollection() {
    const coll1 = this.parseModelOptions();
    const coll2 = this.parseOptions();
    const resultColl = coll1.concat(coll2);
    resultColl.splice(-1, 1); // remove one unnecessary field
    return await resultColl;
  }
}

module.exports = FileParser;
