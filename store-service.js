const fs = require("fs");
const path = require("path");

const items = [];
const categories = [];

module.exports.initialize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, "/data/items.json"),
      "utf8",
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          items.push(...JSON.parse(data));
          fs.readFile(
            path.join(__dirname, "/data/categories.json"),
            "utf8",
            (err, data) => {
              if (err) {
                reject(err);
              } else {
                categories.push(...JSON.parse(data));
                resolve();
              }
            }
          );
        }
      }
    );
  });
};

module.exports.getAllItems = () => {
  return new Promise((resolve, reject) => {
    if (items.length > 0) {
      resolve(items);
    } else {
      reject("No Items available");
    }
  });
};

module.exports.getPublishedItems = () => {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter((item) => item.published === true);
    if (publishedItems.length > 0) {
      resolve(publishedItems);
    } else {
      reject("No Shop Items available");
    }
  });
};

module.exports.getCategories = () => {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories);
    } else {
      reject("No Categories available");
    }
  });
};

module.exports.addItem = (itemData) => {
  return new Promise((resolve) => {
      itemData.published = itemData.published !== undefined ? true : false;
      
      itemData.id = items.length + 1;
      
      items.push(itemData);
      
      resolve(itemData);
  });
};

module.exports.getItemById = (id) => {
  return new Promise((resolve, reject) => {
      const item = items.find(item => item.id === id);
      item ? resolve(item) : reject("no results returned");
  });
};

module.exports.getItemsByCategory = (category) => {
  return new Promise((resolve, reject) => {
      const filtered = items.filter(item => item.category == category);
      filtered.length > 0 
          ? resolve(filtered)
          : reject("no results returned");
  });
};

module.exports.isValidDate = (dateString) => {
  if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return false;
  }
  const dateS = new Date(dateString);
  const dNum = dateS.getTime();
  if (!dNum && dNum !== 0) {
    return false;
  } else {
    return d.toISOString().slice(0,10) === dateString;
  }
};

module.exports.getItemsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
      const minDate = new Date(minDateStr);
      const filtered = items.filter(item => new Date(item.postDate) >= minDate);
      filtered.length > 0 
          ? resolve(filtered)
          : reject("no results returned");
  });
};