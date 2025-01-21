import type { CSVmanager } from "$lib/xlsx";
import CodiceFiscale from "codice-fiscale-js"

export type RowError = {
  hasError: boolean;
  row?: number;
  error?: string;
};

export enum LogType {
  ERRORE = "ERRORE",
  INFO = "INFO",
  CORREZZIONE = "CORREZZIONE",
}

export type Log = {
  row?: number;
  column?: number;
  type: LogType;
  message: string;
};

export const columnPositions = {
  codiceFiscaleProprietario: 0,
  tipoProprietario: 1,
  codiceFiscaleAssistito: 2,
  dataDocumento: 3,
  numeroDocumento: 4,
  suffissoNumeroDocumento: 5,
  dispositivo: 6,
  dataPagamento: 7,
  tipoOperazione: 8,
  voceSpesa: 9,
  importo: 10,
  pagamentoTracciato: 11,
  tipoDocumento: 12,
  esercizioOpposizione: 13,
  codiceNaturaIva: 14,
};

// check rows takes in data and a (row) => rowError function
export function CheckRows(data: CSVmanager, checkRow: (data: CSVmanager, row: number) => RowError): RowError[] {
  var errors = [];

  for (var i = 1; i < data.getNRows(); i++) {
    var rowError = checkRow(data, i);

    if (rowError.hasError) {
      rowError.row = i + 1;
      errors.push(rowError);
    }
  }

  return errors;
}

export function CheckAndFix(data: CSVmanager, column: number, checkRow: (data: CSVmanager, row: number, column: number) => RowError): RowError[] {
  var errors = []

  for (var i = 1; i < data.getNRows(); i++) {
    var rowError = checkRow(data, i, column);

    if (rowError.hasError) {
      rowError.row = i + 1;
      errors.push(rowError);
    }
  }

  return errors
}

export function printErrors(errors: RowError[]) {
  if (errors.length === 0) { return; }

  for (var i = 0; i < errors.length; i++) {
    if (errors[i].hasError) {
      console.log(`Error on row ${errors[i].row}: ${errors[i].error}`);
    }
  }
}

export function LogErrors(errors: RowError[]): Log[] {
  if (errors.length === 0) { return []; }

  var logs: Log[] = [];

  for (var i = 0; i < errors.length; i++) {
    if (errors[i].hasError) {
      logs.push({
        row: errors[i].row!,
        column: 0,
        type: LogType.ERRORE,
        message: errors[i].error!,
      });
    }
  }

  return logs;
}

export function CheckColumnAmount(data: CSVmanager, row: number): RowError {
  if (data.getNColumns() !== 15) {
    return { hasError: true, error: `Numero invalido di colonne: ${data.getNColumns()}` };
  }
  return { hasError: false };
}

export function CheckFiscaleCode(data: CSVmanager, row: number, column: number): RowError {
  var code = data.getCell(row, column);

  code = code.trim().toUpperCase();

  if (!CodiceFiscale.check(code)) {
    return { hasError: true, error: `Codice fiscale errato, colonna ${column}: "${code}"` };
  }

  data.setCell(row, column, code);

  return { hasError: false };
}

export function CheckTipoProprietario(data: CSVmanager, row: number, column: number): RowError {
  var tipo = data.getCell(row, column);

  // should be a number
  if (isNaN(parseInt(tipo))) {
    return { hasError: true, error: `"tipo proprietario" invalido, col ${column}: "${tipo}"` };
  }

  if (tipo.length > 3) {
    return { hasError: true, error: `"tipo proprietario" invalido, col ${column}: "${tipo}"` };
  }

  tipo = tipo.padStart(3, "0");
  data.setCell(row, column, tipo);

  return { hasError: false };
}

export function CheckDate(data: CSVmanager, row: number, column: number): RowError {
  var cell_str = data.getCell(row, column);

  if (cell_str === "") {
    return { hasError: true, error: `Data mancante, col ${column}: "${cell_str}"` };
  }

    // if the date is in the format "dd/mm/YYYY" or "d/m/YYYY" or ... we need to convert it to "YYYY-mm-dd"
  if (cell_str.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)) {
    let date_split = cell_str.split("/");
    let day = date_split[0].padStart(2, "0");
    let month = date_split[1].padStart(2, "0");
    let year = date_split[2];

    cell_str = `${day}-${month}-${year}`;


    // if the date is in the format "ddmmYYYY" we need to convert it to "YYYY-mm-dd"
  } else if (cell_str.match(/\d{8}/)) {
    let day = cell_str.slice(0, 2);
    let month = cell_str.slice(2, 4);
    let year = cell_str.slice(4, 8);

    cell_str = `${year}-${month}-${day}`;


    // if the date is in the format "YYYY-mm-dd" we don't need to do anything
  } else if (cell_str.match(/\d{4}-\d{2}-\d{2}/)) {

    // else the date is invalid
  } else {
    return { hasError: true, error: `Formato data invalida, col ${column}: "${cell_str}"` };
  }

  var date = new Date(cell_str);

  if (isNaN(date.getTime())) {
    return { hasError: true, error: `Errore lettura data, col ${column}: "${cell_str}"` };
  }

  let day = date.getDate().toString().padStart(2, "0");
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let year = date.getFullYear().toString();

  let datestr = `${day}${month}${year}`;

  data.setCell(row, column, datestr);

  return { hasError: false };
}

export function CheckImporto(data: CSVmanager, row: number, column: number): RowError {
  var importo = data.getCell(row, column);
  
  // regex to match this format: "1.000,00"
  if (
    !importo.match(/((((\d{1,3}\.)*000,)|(\d{1,3},))\d{2})/) &&
    !importo.match(/\d+.\d\d/) 
  ) {
    return { hasError: true, error: `Importo invalido, col ${column}: "${importo}"` };
  }

  importo = importo.replaceAll("\"", "");

  // should be a number
  if (isNaN(parseFloat(importo))) {
    return { hasError: true, error: `Importo invalido, col ${column}: "${importo}"` };
  }

  var fixedImporto = parseFloat(importo).toFixed(2);

  data.setCell(row, column, fixedImporto);

  // convert to a float with 2 decimals
  return { hasError: false };
}