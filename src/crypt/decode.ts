/**
 * This function decodes a Base32 encoded string into a buffer.
 *
 * @param {data} data - The Base32 encoded string
 * @returns {Buffer} The decoded buffer
 */
function decode(data: string): Buffer {
  const replacements: { [key: string]: string } = {
    "0": "O",
    "1": "I",
    " ": "",
  };

  const map: { [key: string]: number } = {};

  for (let i = 0; i < 26; i++) {
    map[String.fromCharCode(65 + i)] = i;
  }
  for (let i = 2; i <= 7; i++) {
    map[i.toString()] = 26 + (i - 2);
  }

  const normalized = data
    .toUpperCase()
    .trimEnd()
    .replace(/0/g, replacements["0"])
    .replace(/1/g, replacements["1"])
    .replace(/ /g, replacements[" "]);

  if (/[^A-Z2-7]/.test(normalized)) {
    throw new Error("Invalid Base32 encoded string");
  }

  const chars = normalized.split("");
  const charsCount = chars.length;
  let binary = "";

  for (let i = 0; i < charsCount; i++) {
    binary += map[chars[i]].toString(2).padStart(5, "0");
  }

  const byteCount = Math.floor(binary.length / 8);
  const bytes = new Uint8Array(byteCount);

  for (let i = 0; i < byteCount; i++) {
    bytes[i] = parseInt(binary.substr(i * 8, 8), 2);
  }

  return Buffer.from(bytes);
}

export default decode;
