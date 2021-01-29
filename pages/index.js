import { useEffect, useRef, useState } from "react";
import { Surface } from "gl-react-dom";
import { Shaders, Node, GLSL } from "gl-react";
// import rawShader from "../shaders/bg.glsl";
import timeLoop from "components/timeLoop";

// the shader code with uniforms being recieved from line 42
const shader = `
precision highp float;
varying vec2 uv;
uniform vec4 colors[3];
uniform vec2 particles[3];
void main () {
  vec4 sum = vec4(0.0);
  for (int i=0; i<3; i++) {
    vec4 c = colors[i];
    vec2 p = particles[i];
    float d = c.a * smoothstep(0.1, 1.0, distance(p, uv));
    sum += d * vec4(c.a * c.rgb, c.a);
  }

  if (sum.a > 1.0) {
    sum.rbg /= sum.a;
    sum.a = 1.0;
  }
  gl_FragColor = vec4(sum.a * sum.rgb, 1.0);
}
`;

const shaders = Shaders.create({
  background: {
    frag: GLSL`${shader}`,
  },
});

const BgShader = ({ time }) => (
  <Node
    shader={shaders.background}
    // pass down uniforms to the shader.
    // in this insance i have three colors updating over time
    // but you can also do these calculations in the shader.
    uniforms={{
      colors: [
        [Math.cos(0.002 * time), Math.sin(0.002 * time), 0.2, 1],
        [Math.sin(0.002 * time), -Math.cos(0.002 * time), 0.1, 1],
        [0.3, Math.sin(3 + 0.002 * time), Math.cos(1 + 0.003 * time), 1],
      ],
      particles: [
        [0.1, 0.8],
        [0.3, 0.5],
        [0.6, 1.0],
      ],
      // uncomment the line below to pass in time as a float
      // time
    }}
  />
);

const BgShaderLoop = timeLoop(BgShader);

const Page = () => {
  const [hw, setHW] = useState(null);

  const ref = useRef(null);

  useEffect(() => {
    const changeSize = () => {
      setHW({
        height: ref.current.offsetHeight,
        width: ref.current.offsetWidth,
      });
    };

    changeSize();
    window.addEventListener("resize", changeSize);

    return () => {
      window.removeEventListener("resize", changeSize);
    };
  }, []);

  return (
    <div className="canvas-container" ref={ref}>
      {hw && (
        <Surface
          // using WEBGL 1.0 not webgl2 for Safari/older devices
          version="webgl"
          webglContextAttributes={{
            powerPreference: "high-performance",
            premultipliedAlpha: false,
          }}
          // scaled down the canvas container 30x for massive performance boosts
          // especially on retina/high DPI screens
          // since the shader has a lot of gradients and doesn't need to be
          // extremely sharp, we can get away with scaling down the canvas
          height={hw.height / 30}
          width={hw.width / 30}
        >
          <BgShaderLoop />
        </Surface>
      )}

      <style global jsx>{`
        .canvas-container {
          height: 100vh;
          width: 100vw;
        }

        canvas {
          height: 100vh !important;
          width: 100vw !important;
        }

        body,
        margin {
          padding: 0;
          margin: 0;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default Page;
