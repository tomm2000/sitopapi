<script lang="ts">
  import Ref from "$lib/components/Ref.svelte";
</script>

<div class="layout">
  <Ref page="." title="home"></Ref>
  <slot></slot>
</div>

<style lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 10px;
}
</style>