export function pdfBuffersToUrl(buffers: Array<{ data: number[] } | Buffer>): string {
  // flatten into one big Uint8Array
  const parts = buffers.map(b =>
    b instanceof Uint8Array
      ? b
      : new Uint8Array(b.data) // socket.io often sends Buffers as { type: 'Buffer', data: [...] }
  );
  const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
  const merged = new Uint8Array(totalLength);

  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }

  // create Blob and Object URL
  const blob = new Blob([merged], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}