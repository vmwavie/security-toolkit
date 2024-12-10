import axios from "axios";

const email_black_list =
  "https://raw.githubusercontent.com/dmachard/blocklist-domains/data/blocklist.txt";

let cachedEmailBlackList: Set<string>;

async function loadEmailBlackList() {
  if (!cachedEmailBlackList) {
    const response = await axios.get(email_black_list);
    const blackListRaw = response.data;
    cachedEmailBlackList = new Set(
      blackListRaw
        .split("\n")
        .map((domain: string) => domain.trim().replace(/^www\./, ""))
        .filter(Boolean)
    );
  }

  return cachedEmailBlackList;
}

export { loadEmailBlackList };
