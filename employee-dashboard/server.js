const express = require('express');
const fs = require('fs');
const chokidar = require('chokidar');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
app.use(cors());

const csvPaths = {
  CompanyDetails: '../employee-dashboard/CompanyDetails.csv',
  Employee_Data1: '../employee-dashboard/Employee_Data1.csv',
  timesheet: '../employee-dashboard/timesheet.csv',
  Modules_Tasks: '../employee-dashboard/Modules_Tasks.csv',
};

let csvData = {};

const readCSV = (filePath, key) => {
  let data = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', () => {
      csvData[key] = data;
      console.log(`CSV file ${key} successfully processed`);
    });
};

Object.keys(csvPaths).forEach((key) => {
  readCSV(csvPaths[key], key);
  chokidar.watch(csvPaths[key]).on('change', (path) => {
    console.log(`File ${path} has been changed`);
    readCSV(csvPaths[key], key);
  });
});

app.get('/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  if (csvData[fileName]) {
    res.json(csvData[fileName]);
  } else {
    res.status(404).send('File not found');
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
