import { delegate, Events } from "./lib/events";
import router from "./router";
import { urlFor } from "./helpers";
import { formatCurrency } from "./format";
import { fetch, handleJSON } from "./lib/fetch";
import AddTrans from "./modals/AddTrans.svelte";

let trans_field;
let transactions: any[];

async function getTrans(inst: string): Promise<void> {
  // Start loading indicator
  const svg = document.querySelector(".fava-icon");
  if (svg) {
    svg.classList.add("loading");
  }
  // Fetch transactions
  const url = urlFor("api/plaid_transactions", { inst }, false);
  transactions = ((await handleJSON(await fetch(url))) as any).data as any[];
  console.log(transactions);
  const table: HTMLTableElement = document.querySelector(
    "table.plaid-transactions tbody"
  ) as HTMLTableElement;
  // const data: any[] = response as any[];

  if (transactions.length) {
    if (transactions[0].error === "update_item") {
      // Need to update link
      const update_field = document.querySelector(
        "#update_item"
      ) as HTMLElement;

      update_field.innerHTML = transactions[1].error;
      console.log("Need to update account!!!");
    } else {
      if (table) {
        for (const trans of transactions) {
          const row = table.insertRow();
          // Amount
          row.insertCell().innerHTML = formatCurrency(parseFloat(trans.amount));
          // Date
          row.insertCell().innerHTML = trans.date;
          // Description
          row.insertCell().innerHTML = trans.transaction_type;
          // Payee
          row.insertCell().innerHTML = trans.name;
        }
      }
      // Stop loading indicator
      if (svg) {
        svg.classList.remove("loading");
      }
    }
  } else {console.log("No transactions.");}
}

router.on("page-loaded", () => {
  console.log("Transaction page");
  const trans = document.querySelector(".plaid-transactions");
  // Quit if not in plaid
  if (!trans) {
    return;
  }

  console.log("in plaid");

  // Institution select
  const inst_s = document.querySelector(
    "select#institution"
  ) as HTMLInputElement;
  console.log(`Changed institution to ${inst_s.value}`);

  if (inst_s) {
    getTrans(inst_s.value);
    inst_s.addEventListener("change", () => {
      // Get transactions
      console.log(`Changed institution to ${inst_s.value}`);
      // Clear table
      const rows = document.querySelectorAll(
        "table.plaid-transactions tbody tr"
      );
      if (rows) {
        rows.forEach((r) => r.remove());
      }
      // Replace transactions
      getTrans(inst_s.value);
    });
  }

  delegate(trans, "click", "tr", (event) => {
    const target = event.target as HTMLElement;

    if (target) {
      const row = target.parentNode as HTMLTableRowElement;
      if (row) {
        trans_field = new AddTrans({
          target: document.querySelector("body") as Element,
          props: {
            transactions,
            trans_id: row.rowIndex - 1,
          },
        });
      }
    }
    window.location.hash = "plaid-trans";
  });
});
