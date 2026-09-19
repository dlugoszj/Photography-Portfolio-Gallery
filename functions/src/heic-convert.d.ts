declare module "heic-convert" {
  interface Options {
    buffer: Buffer;
    format: "JPEG" | "PNG";
    quality?: number; // only for JPEG
  }

  function convert(options: Options): Promise<Buffer>;
  export default convert;
}
