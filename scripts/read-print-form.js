const XLSX = require('xlsx');
const workbook = XLSX.readFile('print_form.xlsx');

console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach((name, idx) => {
  console.log('\n========================================');
  console.log('Sheet ' + (idx + 1) + ': ' + name);
  console.log('========================================');
  
  const sheet = workbook.Sheets[name];
  console.log('Range:', sheet['!ref']);
  
  // Get merge info
  if (sheet['!merges']) {
    console.log('Merges:', sheet['!merges'].length);
  }
  
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  
  data.forEach((row, i) => {
    const filtered = row.filter(c => c !== '');
    if (filtered.length > 0) {
      console.log('Row ' + (i + 1) + ':', filtered.join(' | '));
    }
  });
});

