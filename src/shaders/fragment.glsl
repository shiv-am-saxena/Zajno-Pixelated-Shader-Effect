uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
varying vec2 vUv;
void main() {
    float block = 20.;
    vec2 blockUv = floor(vUv * block)/block;
    float distance = length(blockUv - uMouse );
    float effect = smoothstep(0.5, 0.0, distance);
    vec2 distortion = vec2(0.05) * (effect * uHover);
    vec4 color = texture2D(uTexture, vUv+distortion);
    gl_FragColor = color;
    // gl_FragColor = vec4( vUv*effect, .0, 1.);
}