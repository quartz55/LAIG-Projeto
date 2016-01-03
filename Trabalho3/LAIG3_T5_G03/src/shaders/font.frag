#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec3 uFgColor;
uniform vec3 uBgColor;

void main() {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    vec4 finalColor = vec4(mix(uBgColor, uFgColor, texColor.r), 1);

    gl_FragColor = finalColor;
}


