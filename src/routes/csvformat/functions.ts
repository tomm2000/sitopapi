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
  var datestr = data.getCell(row, column);

  // if column is a date in GGMMAAAA format, do nothing
  if (datestr.match(/^\d{8}$/)) {
    return { hasError: false }
  }

  // if data is in the format DMMYYYY, convert it to GGMMAAAA
  if (datestr.match(/^\d{7}$/)) {
    data.setCell(row, column, datestr.padStart(8, "0"));

    return { hasError: false };
  }

  // if data is in the format D/M/Y
  let date = datestr.split("/");

  if (date.length !== 3) {
    return { hasError: true, error: `Data invalida, col ${column}: "${datestr}"` };
  }

  let day = date[0];
  let month = date[1];
  let year = date[2];

  if (day.length === 1) {
    day = "0" + day;
  }

  if (month.length === 1) {
    month = "0" + month;
  }

  if (year.length === 2) {
    let currentYear = new Date().getFullYear().toString().slice(2, 4);
    year = (parseInt(year) > parseInt(currentYear) ? "19" : "20") + year;
  }

  data.setCell(row, column, day + month + year);

  return { hasError: false };
}

export function CheckImporto(data: CSVmanager, row: number, column: number): RowError {
  var importo = data.getCell(row, column);

  console.log(importo);
  
  // regex to match this format: "1.000,00"
  if (!importo.match(/((((\d{1,3}\.)*000,)|(\d{1,3},))\d{2})/)) {
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