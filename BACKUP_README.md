# Backup to Excel Converter

This script converts the Mofil system backup JSON file into an Excel file with multiple sheets for easy viewing and analysis.

## Usage

### Option 1: Default file path
```bash
npm run backup-to-excel
```

### Option 2: Specify custom file path
```bash
node backup-to-excel.js /path/to/your/backup.json
```

### Option 3: Run directly with Node.js
```bash
node backup-to-excel.js
```

## Features

- **Automatic file detection**: Checks if the input file exists
- **Flexible input**: Accepts command line arguments for custom file paths
- **Multiple sheets**: Creates separate worksheets for each data type
- **Error handling**: Provides clear error messages if files are missing

## Output

The script creates an Excel file with the following sheets:

- **Appointments**: All appointment bookings with customer details, project info, and status
- **Inventory**: Current inventory items with stock levels, suppliers, and pricing
- **Users**: All user accounts including customers and designers
- **AuditLogs**: System activity logs and account creation records

## File Locations

- **Default Input**: `c:/Users/reinier/Downloads/mofil-backup-YYYY-MM-DD.json`
- **Output**: Same directory as input file, with `.xlsx` extension

## Dependencies

- `xlsx`: Excel file generation library

## Example

```bash
# Convert the default backup file
npm run backup-to-excel

# Convert a specific backup file
node backup-to-excel.js ./backups/mofil-backup-2026-05-03.json
```