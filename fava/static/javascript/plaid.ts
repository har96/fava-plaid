import { select, selectAll, delegate, fetchAPI } from "./helpers";
import e from "./events";
import { formatCurrency } from "./format";
import AddTrans from "./modals/AddTrans.svelte";

let trans_field;
let transactions: any[];

function getTrans(inst: string): void {
  // Start loading indicator
  const svg = select(".fava-icon");
  if (svg) {
    svg.classList.add("loading");
  }
  // Fetch transactions
  fetchAPI("plaid_transactions", { inst }).then(response => {
    const table: HTMLTableElement = select(
      "table.plaid-transactions tbody"
    ) as HTMLTableElement;
    const data: any[] = response as any[];
    transactions = data;

    if (table) {
      for (const trans of data) {
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
  });
}

e.on("page-loaded", () => {
  const trans = select(".plaid-transactions");
  // Quit if not in plaid
  if (!trans) {
    return;
  }

  console.log("in plaid");

  // Institution select
  const inst_s = select("select#institution") as HTMLInputElement;
  console.log(`Changed institution to ${inst_s.value}`);

  if (inst_s) {
    getTrans(inst_s.value);
    inst_s.addEventListener("change", () => {
      // Get transactions
      console.log(`Changed institution to ${inst_s.value}`);
      // Clear table
      const rows = selectAll(
        "table.plaid-transactions tbody tr"
      ) as HTMLElement[];
      if (rows) {rows.forEach(r => r.remove());}
      // Replace transactions
      getTrans(inst_s.value);
    });
  }

  delegate(trans, "click", "tr", event => {
    const target = event.target as HTMLElement;

    if (target) {
      const row = target.parentNode as HTMLTableRowElement;
      if (row) {
        trans_field = new AddTrans({
          target: select("body") as Element,
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
