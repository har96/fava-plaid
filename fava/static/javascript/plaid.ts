import { select, delegate, fetchAPI } from "./helpers";
import e from "./events";

function getTrans(inst: string): void {
  fetchAPI("plaid_transactions", { inst }).then(response => {
    const table: HTMLTableElement = select(
      "table.plaid-transactions"
    ) as HTMLTableElement;
    const data: any[] = response as any[];

    if (table) {
      for (const trans of data) {
        const row = table.insertRow();
        // Amount
        row.insertCell().innerHTML = trans.amount;
        // Date
        row.insertCell().innerHTML = trans.date;
        // Description
        row.insertCell().innerHTML = trans.transaction_type;
        // Payee
        row.insertCell().innerHTML = trans.name;
      }
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
      getTrans(inst_s.value);
    });
  }

  delegate(trans, "click", "tr", event => {
    const target = event.target as HTMLElement;

    console.log(`Clicked element with ${target.innerText}`);
  });
});
