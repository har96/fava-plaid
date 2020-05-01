<script>
  import { tick } from "svelte";

  import { Balance, Transaction, saveEntries } from "../entries";
  import { _ } from "../helpers";
  import { urlHash, closeOverlay } from "../stores";

  import ModalBase from "./ModalBase.svelte";
  import TransactionComponent from "../entry-forms/Transaction.svelte";
  import BalanceComponent from "../entry-forms/Balance.svelte";

  const entryTypes = [
    [_("Transaction"), Transaction],
    [_("Balance"), Balance],
  ];
  let entry = new Transaction();

  $: svelteComponent = {
    Transaction: TransactionComponent,
    Balance: BalanceComponent,
  }[entry.constructor.name];

  let entryComponent;

  export let transactions = [];
  export let trans_id = 0;

  async function focus() {
    await tick();
    if (entryComponent.focus) {
      entryComponent.focus();
    }
  }

  async function fill() {
    await tick();
    const trans = transactions[trans_id];
    if (trans) {
      entry.payee = trans.name;
      entry.date = trans.date;
      entry.postings[0].amount = `${trans.amount.toString()} USD`;
      entry.postings[1].account = trans.beanaccount;
    }
  }

  async function submitAndNew(event) {
    if (event.target.form.reportValidity()) {
      await saveEntries([entry]);
      entry = new entry.constructor();
      trans_id -= 1;
      fill();
      focus();
    }
  }

  async function submit() {
    await saveEntries([entry]);
    entry = new entry.constructor();
    closeOverlay();
  }

  $: shown = $urlHash.startsWith("plaid-trans");
  $: if (shown) {
    fill();
    focus();
  }
</script>

<ModalBase {shown}>
  <form on:submit|preventDefault={submit}>
    <svelte:component
      this={svelteComponent}
      bind:this={entryComponent}
      bind:entry />
    <div class="fieldset">
      <span class="spacer" />
      <button
        type="submit"
        on:click|preventDefault={submitAndNew}
        class="muted">
        {_('Save and add new')}
      </button>
      <button type="submit">{_('Save')}</button>
    </div>
  </form>
</ModalBase>
