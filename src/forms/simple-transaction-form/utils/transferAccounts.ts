export function getCounterAccount(account: string): string {
  switch (account) {
    case "mbank_firmowe":
      return "mbank_osobiste";
    case "mbank_osobiste":
      return "mbank_firmowe";
    case "cash":
      return "mbank_osobiste";
    case "sumup":
      return "mbank_osobiste";
    default:
      return account;
  }
} 