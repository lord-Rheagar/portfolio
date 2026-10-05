import { Matrix4, MeshStandardMaterial, Vector2, Vector3, Object3D, Mesh } from 'three';

/** Eye coordinates measured on the original Meshy surface, before scene normalization.
 * Re-shades the two sclera patches without moving eyelids, glasses or the head.
 * Named eye controls in me.glb are rotated by the upstream gaze algorithm.
 * The adapter redraws irises because Meshy baked the eyes into the face mesh.
 */
export function addEyeTracking(material: MeshStandardMaterial, nativeTransform: Matrix4, left: Vector2, right: Vector2) {
  material.onBeforeCompile = shader => {
    shader.uniforms.uGazeLeft = {value:left};
    shader.uniforms.uGazeRight = {value:right};
    shader.uniforms.uEyeTransform = {value:nativeTransform};
    shader.vertexShader = `uniform mat4 uEyeTransform; varying vec3 vEyeSurface;\n${shader.vertexShader}`
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEyeSurface = (uEyeTransform * vec4(position, 1.0)).xyz;');
    shader.fragmentShader = `
      uniform vec2 uGazeLeft;
      uniform vec2 uGazeRight;
      varying vec3 vEyeSurface;
      vec3 animatedEye(vec3 original, vec2 center, vec2 radius, vec2 gaze) {
        vec2 p = vEyeSurface.xy - center;
        float edge = length(p / radius);
        // Glasses sit in front of the eyeball; back-of-head geometry sits behind it.
        float surface = step(0.235, vEyeSurface.z) * (1.0-step(0.305, vEyeSurface.z));
        float mask = (1.0-smoothstep(0.89, 1.025, edge)) * surface;
        vec2 iris = p - gaze * vec2(0.023, 0.012);
        float r = length(iris);
        float angle = atan(iris.y, iris.x);
        float fibers = sin(angle*43.0+r*1400.0)*0.04 + sin(angle*71.0)*0.025;
        vec3 white = vec3(0.86,0.84,0.75) * (1.0-0.12*pow(edge,3.0));
        vec3 brown = vec3(0.105+fibers,0.052+fibers*0.45,0.021+fibers*0.2);
        vec3 color = mix(white, brown, 1.0-smoothstep(0.0275,0.029,r));
        color = mix(color, vec3(0.008,0.006,0.004), 1.0-smoothstep(0.014,0.0155,r));
        float glint = 1.0-smoothstep(0.003,0.005,length(iris-vec2(-0.008,0.011)));
        color = mix(color,vec3(1.0,0.98,0.9),glint*0.92);
        return mix(original,color,mask);
      }
    ${shader.fragmentShader}`.replace('#include <map_fragment>', `
      #include <map_fragment>
      diffuseColor.rgb = animatedEye(diffuseColor.rgb, vec2(-0.135,0.335), vec2(0.070,0.034), uGazeLeft);
      diffuseColor.rgb = animatedEye(diffuseColor.rgb, vec2( 0.123,0.329), vec2(0.070,0.031), uGazeRight);
    `);
  };
  material.customProgramCacheKey=()=> 'bodhi-surface-gaze-v2';
  material.needsUpdate=true;
}

export function bindMeshyEyes(model: Object3D) {
  const left = new Vector2(), right = new Vector2(), direction = new Vector3();
  const controls = [model.getObjectByName('eye-left'), model.getObjectByName('eye-right')];
  const materials: MeshStandardMaterial[] = [];
  model.traverse(object => {
    if (!(object instanceof Mesh) || object.name !== 'BodhiAvatar') return;
    object.updateMatrix();
    const nativeTransform = object.matrix.clone();
    object.material = (object.material as MeshStandardMaterial).clone();
    materials.push(object.material);
    addEyeTracking(object.material, nativeTransform, left, right);
  });
  return {
    update() {
      controls.forEach((control,i) => {
        if (!control) return;
        direction.set(0,0,1).applyQuaternion(control.quaternion);
        (i===0?left:right).set(Math.max(-1,Math.min(1,direction.x*2)),Math.max(-1,Math.min(1,direction.y*3)));
      });
    },
    dispose() { materials.forEach(material=>material.dispose()); },
  };
}
