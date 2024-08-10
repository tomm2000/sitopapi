<script lang="ts">
  import { CheckAndFix, CheckColumnAmount, CheckDate, CheckFiscaleCode, CheckImporto, CheckRows, CheckTipoProprietario, LogErrors, LogType, type Log } from "./functions";
  import { CSVmanager, saveToFile, xlsxFile2csv } from "$lib/xlsx";
  import { replaceState } from "$app/navigation";

  let files: FileList;
  let logs: Log[] = [];

  async function convert() {
    logs = [];

    if (!files) {
      logs.push({
        type: LogType.ERRORE,
        message: "No file selected",
      });

      return;
    }

    var file = files[0];

    var csv = await xlsxFile2csv(file);
    var csv_data = new CSVmanager(csv, ";");


    var err = CheckRows(csv_data, CheckColumnAmount);
    logs.push(...LogErrors(err));
    
    if (err.length > 0) {
      logs = [ ...logs, ]
      return;
    }

    var err = CheckAndFix(csv_data, 0, CheckFiscaleCode);
    logs.push(...LogErrors(err));

    var err = CheckAndFix(csv_data, 1, CheckTipoProprietario);
    logs.push(...LogErrors(err));

    var err = CheckAndFix(csv_data, 2, CheckFiscaleCode);
    logs.push(...LogErrors(err));

    var err = CheckAndFix(csv_data, 3, CheckDate);
    logs.push(...LogErrors(err));
    
    var err = CheckAndFix(csv_data, 6, CheckDate);
    logs.push(...LogErrors(err));

    var err = CheckAndFix(csv_data, 9, CheckImporto);
    logs.push(...LogErrors(err));

    logs = [ ...logs, ]

    csv_data.save("converted.csv");
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="page">
  <input type="file" bind:files accept=".csv,.xlsx" >
  <input type="button" value="Converti" on:click={convert}>
  <div class="log">
    {#each logs as log}
      <div class={log.type}>riga {log.row}: {log.message}</div>
    {/each}
  </div>
</div>

<style lang="scss">
  .page {
    height: 100%;
  }

  .log {
    margin-top: 10px;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .ERRORE {
    color: red;
  }

  .CORREZZIONE {
    color: green;
  }
</style>