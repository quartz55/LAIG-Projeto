#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler3;

void main() {

	vec4 mask = texture2D(uSampler3,vTextureCoord);
	
	if(mask.r < 0.2)
    gl_FragColor = texture2D(uSampler, vTextureCoord);
	else 
	gl_FragColor = mask;
}
