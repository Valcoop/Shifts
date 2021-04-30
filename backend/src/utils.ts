export function btoa(value: string): string {
  return Buffer.from(value).toString('base64');
}
