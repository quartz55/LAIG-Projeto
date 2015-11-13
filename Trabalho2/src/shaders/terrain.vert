attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
uniform sampler2D uSampler2;

#define MULTIPLIER 3

void main() {
    vTextureCoord = aTextureCoord;

    float offset = texture2D(uSampler2D, vTextureCoord).r;

    vec3 vertex = aVertexPosition;
    vertex.y += MULTIPLIER * offset;

    gl_Position = uPMatrix * uMVMatrix * vec4(vertex, 1.0);
}
