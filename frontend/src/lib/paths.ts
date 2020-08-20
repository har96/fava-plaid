/**
 * Get the basename of a file path.
 */
export function basename(filename: string): string {
  const parts = filename.split(/\/|\\/);
  return parts[parts.length - 1];
}

/**
 * Check whether the given filename includes the account parts at the end.
 */
export function documentHasAccount(filename: string, account: string): boolean {
  const accountParts = account.split(":").reverse();
  const folders = filename.split(/\/|\\/).reverse().slice(1);
  return accountParts.every((part, index) => {
    return part === folders[index];
  });
}
