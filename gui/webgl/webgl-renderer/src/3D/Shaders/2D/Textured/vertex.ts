export default `
attribute vec3 position;
attribute vec2 uv;

uniform mat4 model;
uniform mat4 projection;

varying highp vec2 vTextureCoord;

void main(void) {
  gl_Position = projection * model * vec4(position, 1.0);
  vTextureCoord = uv;
}
`;
