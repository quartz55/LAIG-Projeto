#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

uniform float multiplier;

varying vec2 vTextureCoord;

void main() {
    vTextureCoord = aTextureCoord;

    vec4 texColor = texture2D(uSampler2, aTextureCoord);
    vec3 offset = vec3(0,0,0);
    offset.y = texColor.r;
    offset *= multiplier;

    vec3 finalVertex = aVertexPosition + offset;

    gl_Position = uPMatrix * uMVMatrix * vec4(finalVertex, 1.0);
}
