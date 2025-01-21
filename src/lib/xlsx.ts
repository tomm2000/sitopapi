import * as XLSX from 'xlsx';

export async function xlsxFile2csv(file: File): Promise<string> {
  var buffer = await file.arrayBuffer();

  return xlsxData2csv(buffer);
}


export async function xlsxData2csv(data: ArrayBuffer): Promise<string> {
  var workbook = XLSX.read(data, {type: 'array'});

  return XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]], {
    FS: ';',
    RS: '\n',
  });
}

export function saveToFile(data: string, filename: string) {
  var blob = new Blob([data], {type: 'text/csv;charset=utf-8;'});
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export class CSVmanager {
  csv: string
  data: string[][] = []
  separator: string

  constructor(csv: string, separator: string) {
    this.csv = csv
    this.separator = separator
    this.data = this.csv.split("\n").map(row => row.split(separator))

    // if rows are shorter than 2, check with different separator
    if (this.data.length < 2) {
      this.data = this.csv.split("\n").map(row => row.split(";"))
    }

    // if columns are shorter than 2, check with different separator
    if (this.data[0].length < 2) {
      this.data = this.csv.split("\n").map(row => row.split(","))
    }

    // if columns are shorter than 2, check with different separator
    if (this.data[0].length < 2) {
      this.data = this.csv.split("\n").map(row => row.split("\t"))
    }
  }

  toString(separator: string | null = null): string {
    separator = separator || this.separator
    return this.data.map(row => row.join(separator)).join("\n")
  }

  save(filename: string, separator: string | null = null) {
    saveToFile(this.toString(separator), filename)
  }

  getRow(row: number): string[] {
    return this.data[row]
  }

  getNRows(): number {
    return this.data.length
  }

  getColumn(column: number): string[] {
    return this.data.map(row => row[column])
  }

  getNColumns(): number {
    return this.data[0].length
  }

  getCell(row: number, column: number): string {
    return this.data[row][column]
  }

  setCell(row: number, column: number, value: string) {
    this.data[row][column] = value
  }
}