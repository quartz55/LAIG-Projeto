#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform sampler2D uSampler2;
uniform sampler2D uSampler3;

uniform float multiplier;

varying vec2 vTextureCoord;

void main() {
    vTextureCoord = aTextureCoord;

    vec4 filter = texture2D(uSampler2, aTextureCoord);
    vec3 offset = vec3(0, filter.r, 0) * multiplier;

	vec4 mask = texture2D(uSampler3, aTextureCoord);
	if(mask.r >= 0.2)
	offset = vec3(0,0,0);
	
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);	
}
