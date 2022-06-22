export default class Texture {
  ref: WebGLTexture;
  loaded: boolean = false;

  constructor(private gl: WebGLRenderingContext, uri: string) {
    // See if the placeholder texture exists and generate if not
    if (Texture.placeholder === undefined) {
      Texture.placeholder = Texture.generatePlaceholder(gl);
    }
    // Always initial make a reference to the placeholder as any local or remote image will load async
    this.ref = Texture.placeholder;
    gl.bindTexture(gl.TEXTURE_2D, this.ref);
    // Load the image and bind when ready
    const image = new Image();
    image.onload = () => {
      const texture = this.gl.createTexture();
      if (texture === null) {
        throw new Error();
      }
      // TODO this need to queue for end of frame -- can't just be binding in the middle of other rendering
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      // Generate mipss if power of 2 width & height
      if (Texture.isPowerOf2(image.width, image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.NEAREST_MIPMAP_NEAREST, gl.NEAREST);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      }
      this.ref = texture;
    };
    image.src = uri;
  }

  bind() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.ref);
  }

  static placeholder?: WebGLTexture;

  static generatePlaceholder(gl: WebGLRenderingContext): WebGLTexture {
    const texture = gl.createTexture();
    if (texture === null) {
      throw new Error();
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([255, 0, 255, 255])
    );
    return texture;
  }

  static isPowerOf2(width: number, height: number): boolean {
    return (width & (width - 1)) == 0 && (height & (height - 1)) == 0;
  }
}
