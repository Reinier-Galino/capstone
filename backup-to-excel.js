import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Get input file path from command line argument or use default
const inputFilePath = process.argv[2] || 'c:/Users/reinier/Downloads/mofil-backup-2026-05-03.json';

// Check if file exists
if (!fs.existsSync(inputFilePath)) {
  console.error(`Error: Input file not found: ${inputFilePath}`);
  console.log('Usage: node backup-to-excel.js [path/to/backup.json]');
  process.exit(1);
}

// Read the backup JSON file
const backupData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Function to convert array of objects to worksheet
function createWorksheet(data, sheetName) {
  if (!Array.isArray(data)) {
    // If data is not an array, convert it to an array with one object
    data = [data];
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return worksheet;
}

// Create worksheets for each data section
createWorksheet(backupData.appointments, 'Appointments');
createWorksheet(backupData.inventory, 'Inventory');
createWorksheet(backupData.users, 'Users');

// For audit logs, we need to convert the array of strings to objects
const auditLogObjects = backupData.auditLogs.map((log, index) => ({
  'Log Entry': log,
  'Index': index + 1
}));
createWorksheet(auditLogObjects, 'AuditLogs');

// Generate output file path
const inputFileName = path.basename(inputFilePath, '.json');
const outputFilePath = path.join(path.dirname(inputFilePath), `${inputFileName}.xlsx`);

// Write the workbook to file
XLSX.writeFile(workbook, outputFilePath);

console.log(`✅ Excel file created successfully: ${outputFilePath}`);
console.log('📊 Sheets created: Appointments, Inventory, Users, AuditLogs');
console.log(`📅 Backup timestamp: ${backupData.timestamp}`);