

<script lang="ts">
  import { goto } from "$app/navigation";

  export var page: string = "";
  export var title: string = "";
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="ref" on:click={() => { goto(`${page}`)}}>
  {title ? title : page}
</div>

<style lang="scss">
.ref {
  cursor: pointer;
  text-decoration: underline;
  color: #2f5af2;
  &:hover {
    text-decoration: none;
  }
}
</style>