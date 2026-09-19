declare module "pica" {
  interface PicaOptions {
    features?: ("js" | "wasm" | "ww")[];
    idle?: number;
  }

  interface Pica {
    resize(
      from: HTMLCanvasElement | HTMLImageElement | OffscreenCanvas,
      to: HTMLCanvasElement | OffscreenCanvas,
      options?: {
        quality?: number;
        alpha?: boolean;
        unsharpAmount?: number;
        unsharpRadius?: number;
        unsharpThreshold?: number;
      }
    ): Promise<HTMLCanvasElement | OffscreenCanvas>;

    toBlob(
      canvas: HTMLCanvasElement | OffscreenCanvas,
      mimeType?: string,
      quality?: number
    ): Promise<Blob>;
  }

  function pica(options?: PicaOptions): Pica;

  export default pica;
}
