export default `
attribute vec3 position;
uniform mat4 model;
uniform mat4 projection;

void main(void) {
  gl_Position = projection * model * vec4(position, 1.0);
}
`;
