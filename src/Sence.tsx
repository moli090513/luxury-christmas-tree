import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { PropsSystem } from './PropsSystem';
import * as THREE from 'three';

// 动态相机控制：基于手势 pointer 坐标实现平滑视角跟随
const CameraController = ({ gestureState }: { gestureState: any }) => {
  const { camera } = useThree();
  const targetCamPos = new THREE.Vector3(0, 4, 20);

  useFrame((state, delta) => {
    const [pointerX, pointerY] = gestureState.current.pointer;
    // 手势移动影响相机最终期望目标点
    const currentTargetX = targetCamPos.x + pointerX * 6;
    const currentTargetY = targetCamPos.y + pointerY * 4;
    
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, currentTargetX, delta * 2.0);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, currentTargetY, delta * 2.0);
    camera.lookAt(0, 2, 0);
  });
  return null;
};

export const LuxuryTreeScene = ({ gestureState }: { gestureState: any }) => {
  return (
    <div className="w-full h-full bg-[#020d08]">
      <Canvas
        camera={{ position: [0, 4, 20], fov: 45 }}
        gl={{ powerPreference: "high-performance", antialias: false }}
      >
        {/* 特朗普式奢华暗调环境光 */}
        <color attach="background" args={["#010a05"]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} color="#FFD700" intensity={1.5} />
        <directionalLight position={[-5, 8, 5]} color="#053e20" intensity={2} />

        {/* 豪华大堂 HDRI 氛围映射 */}
        <Environment preset="lobby" />

        {/* 核心组件群 */}
        <Foliage gestureState={gestureState} />
        <PropsSystem gestureState={gestureState} />

        {/* 手势相机调控器 */}
        <CameraController gestureState={gestureState} />
        <OrbitControls enableZoom={true} maxDistance={30} minDistance={5} target={[0, 2, 0]} />

        {/* 电影级后期处理：金光渲染 */}
        <EffectComposer disableNormalPass>
          <Bloom 
            threshold={0.8} 
            intensity={1.2} 
            luminanceSmoothing={0.3} 
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

