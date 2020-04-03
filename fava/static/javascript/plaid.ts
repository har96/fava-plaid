import AddEntry from "modals/AddEntry.svelte";
import { select, delegate, fetchAPI } from "./helpers";
import e from "./events";


function getTrans(inst: string): void {
  const data = fetchAPI("plaid_transactions", { inst });
  console.log("got transactions");
  console.log(data);
}

e.on("page-loaded", () => {
  const trans = select(".plaid-transactions");
  // Quit if not in plaid
  if (!trans) {return;}

  console.log("in plaid");

  // Institution select
  const inst_s = select("select#institution") as HTMLInputElement;
  console.log(`Changed institution to ${  inst_s.value}`);

  if (inst_s) {
    getTrans(inst_s.value);
    inst_s.addEventListener("change", () => {
      // Get transactions
      console.log(`Changed institution to ${  inst_s.value}`);
      getTrans(inst_s.value);
    });
  }

  delegate(trans, "click", "tr", event => {
    const target = event.target as HTMLElement;

    console.log(`Clicked element with ${  target.innerText}`);
  });
});
