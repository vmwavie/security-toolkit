const BASE32_MAP: string[] = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"];

/**
 * This function encodes a given string into a Base32 encoded string.
 *
 * @param {string} data - The string to be encoded into Base32
 *
 * @return {string} The Base32 encoded string
 */
function base32Encode(data: string): string {
  const to_binary = (char: string): string => char.charCodeAt(0).toString(2).padStart(8, "0");

  const binary_to_base32 = (binary_group: string): string =>
    BASE32_MAP[parseInt(binary_group.padEnd(5, "0"), 2)];

  const binary: string = data.split("").map(to_binary).join("");
  const groups: string[] = binary.match(/.{1,5}/g) || [];

  let encoded: string = groups.map(binary_to_base32).join("");

  return encoded;
}

export default base32Encode;
