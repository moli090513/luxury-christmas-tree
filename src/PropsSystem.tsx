import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import * as THREE from 'three';

interface PropItem {
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  targetRot: THREE.Euler;
  weight: number; // 物理推力权重 (1.0=轻, 3.0=重)
  type: 'ball' | 'box' | 'polaroid';
  textureUrl?: string;
}

export const PropsSystem = ({ gestureState }: { gestureState: any }) => {
  const count = 150;
  const polaroidCount = 15;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const polaroidsRef = useRef<THREE.Group[]>([]);

  // 1. 初始化两套坐标系统与权重
  const items = useMemo(() => {
    const arr: PropItem[] = [];
    
    // 生成彩球和礼物盒数据
    for (let i = 0; i < count; i++) {
      const isBox = Math.random() > 0.7;
      const height = Math.random() * 7;
      const radius = ((8 - height) / 8) * 3.0;
      const angle = Math.random() * Math.PI * 2;

      arr.push({
        chaosPos: new THREE.Vector3().setFromSphericalCoords(8 + Math.random()*4, Math.random()*Math.PI, Math.random()*Math.PI*2),
        targetPos: new THREE.Vector3(Math.cos(angle)*radius, height - 2, Math.sin(angle)*radius),
        targetRot: new THREE.Euler(Math.random(), Math.random(), 0),
        weight: isBox ? 3.0 : 1.2, 
        type: isBox ? 'box' : 'ball'
      });
    }

    // 生成拍立得照片数据
    for (let i = 0; i < polaroidCount; i++) {
      const height = 1 + Math.random() * 5;
      const radius = ((8 - height) / 8) * 2.5 + 0.3; // 贴在树表面
      const angle = (i / polaroidCount) * Math.PI * 2;
      
      arr.push({
        chaosPos: new THREE.Vector3().setFromSphericalCoords(10 + Math.random()*5, Math.random()*Math.PI, Math.random()*Math.PI*2),
        targetPos: new THREE.Vector3(Math.cos(angle)*radius, height - 2, Math.sin(angle)*radius),
        targetRot: new THREE.Euler(0, -angle + Math.PI/2, (Math.random() - 0.5) * 0.3), // 面向外侧
        weight: 2.0,
        type: 'polaroid',
        textureUrl: `https://picsum.photos/id/${i + 10}/200/250` // 假定拍立得精美图源
      });
    }
    return arr;
  }, []);

  // 分离出 Instanced 部分和 Polaroid 部分
  const instancedItems = useMemo(() => items.filter(d => d.type !== 'polaroid'), [items]);
  const polaroidItems = useMemo(() => items.filter(d => d.type === 'polaroid'), [items]);

  useFrame((state, delta) => {
    const p = gestureState.current.progress;

    // 2. 更新 Instanced Mesh (球与盒子)
    if (meshRef.current) {
      instancedItems.forEach((item, idx) => {
        // 根据权重引入非线性滞后变换，形成富有物理层次的爆发散开效果
        const t = Math.min(Math.max((p - (item.weight - 1) * 0.2), 0) / 0.6, 1);
        const currentPos = new THREE.Vector3().lerpVectors(item.targetPos, item.chaosPos, t);
        
        dummy.position.copy(currentPos);
        dummy.rotation.set(item.targetRot.x * (1-t), item.targetRot.y + (state.clock.getElapsedTime()*0.2), 0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. 更新拍立得照片组件 
    polaroidsRef.current.forEach((group, idx) => {
      if (!group) return;
      const item = polaroidItems[idx];
      const t = Math.min(Math.max((p - 0.1), 0) / 0.7, 1);
      
      group.position.lerpVectors(item.targetPos, item.chaosPos, delta * 5.0); 
      group.rotation.y = THREE.MathUtils.lerp(item.targetRot.y, state.clock.getElapsedTime() * 0.5, t);
    });
  });

  return (
    <>
      {/* 奢华高光金色装饰物 InstancedMesh */}
      <instancedMesh ref={meshRef} args={[null, null, instancedItems.length]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} envMapIntensity={2} />
      </instancedMesh>

      {/* 拍立得照片渲染群 */}
      {polaroidItems.map((item, idx) => (
        <group 
          key={idx} 
          ref={(el) => { if(el) polaroidsRef.current[idx] = el; }}
        >
          {/* 拍立得经典白色卡纸边框 */}
          <mesh>
            <boxGeometry args={[0.9, 1.1, 0.02]} />
            <meshStandardMaterial color="#fcfbe3" roughness={0.5} />
          </mesh>
          {/* 照片图像面 */}
          <Image 
            url={item.textureUrl!} 
            scale={[0.8, 0.8]} 
            position={[0, 0.1, 0.011]} 
            transparent
            side={THREE.DoubleSide}
          />
        </group>
      ))}
    </>
  );
};
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import * as THREE from 'three';

interface PropItem {
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  targetRot: THREE.Euler;
  weight: number; // 物理推力权重 (1.0=轻, 3.0=重)
  type: 'ball' | 'box' | 'polaroid';
  textureUrl?: string;
}

export const PropsSystem = ({ gestureState }: { gestureState: any }) => {
  const count = 150;
  const polaroidCount = 15;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const polaroidsRef = useRef<THREE.Group[]>([]);

  // 1. 初始化两套坐标系统与权重
  const items = useMemo(() => {
    const arr: PropItem[] = [];
    
    // 生成彩球和礼物盒数据
    for (let i = 0; i < count; i++) {
      const isBox = Math.random() > 0.7;
      const height = Math.random() * 7;
      const radius = ((8 - height) / 8) * 3.0;
      const angle = Math.random() * Math.PI * 2;

      arr.push({
        chaosPos: new THREE.Vector3().setFromSphericalCoords(8 + Math.random()*4, Math.random()*Math.PI, Math.random()*Math.PI*2),
        targetPos: new THREE.Vector3(Math.cos(angle)*radius, height - 2, Math.sin(angle)*radius),
        targetRot: new THREE.Euler(Math.random(), Math.random(), 0),
        weight: isBox ? 3.0 : 1.2, 
        type: isBox ? 'box' : 'ball'
      });
    }

    // 生成拍立得照片数据
    for (let i = 0; i < polaroidCount; i++) {
      const height = 1 + Math.random() * 5;
      const radius = ((8 - height) / 8) * 2.5 + 0.3; // 贴在树表面
      const angle = (i / polaroidCount) * Math.PI * 2;
      
      arr.push({
        chaosPos: new THREE.Vector3().setFromSphericalCoords(10 + Math.random()*5, Math.random()*Math.PI, Math.random()*Math.PI*2),
        targetPos: new THREE.Vector3(Math.cos(angle)*radius, height - 2, Math.sin(angle)*radius),
        targetRot: new THREE.Euler(0, -angle + Math.PI/2, (Math.random() - 0.5) * 0.3), // 面向外侧
        weight: 2.0,
        type: 'polaroid',
        textureUrl: `https://picsum.photos/id/${i + 10}/200/250` // 假定拍立得精美图源
      });
    }
    return arr;
  }, []);

  // 分离出 Instanced 部分和 Polaroid 部分
  const instancedItems = useMemo(() => items.filter(d => d.type !== 'polaroid'), [items]);
  const polaroidItems = useMemo(() => items.filter(d => d.type === 'polaroid'), [items]);

  useFrame((state, delta) => {
    const p = gestureState.current.progress;

    // 2. 更新 Instanced Mesh (球与盒子)
    if (meshRef.current) {
      instancedItems.forEach((item, idx) => {
        // 根据权重引入非线性滞后变换，形成富有物理层次的爆发散开效果
        const t = Math.min(Math.max((p - (item.weight - 1) * 0.2), 0) / 0.6, 1);
        const currentPos = new THREE.Vector3().lerpVectors(item.targetPos, item.chaosPos, t);
        
        dummy.position.copy(currentPos);
        dummy.rotation.set(item.targetRot.x * (1-t), item.targetRot.y + (state.clock.getElapsedTime()*0.2), 0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. 更新拍立得照片组件 
    polaroidsRef.current.forEach((group, idx) => {
      if (!group) return;
      const item = polaroidItems[idx];
      const t = Math.min(Math.max((p - 0.1), 0) / 0.7, 1);
      
      group.position.lerpVectors(item.targetPos, item.chaosPos, delta * 5.0); 
      group.rotation.y = THREE.MathUtils.lerp(item.targetRot.y, state.clock.getElapsedTime() * 0.5, t);
    });
  });

  return (
    <>
      {/* 奢华高光金色装饰物 InstancedMesh */}
      <instancedMesh ref={meshRef} args={[null, null, instancedItems.length]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} envMapIntensity={2} />
      </instancedMesh>

      {/* 拍立得照片渲染群 */}
      {polaroidItems.map((item, idx) => (
        <group 
          key={idx} 
          ref={(el) => { if(el) polaroidsRef.current[idx] = el; }}
        >
          {/* 拍立得经典白色卡纸边框 */}
          <mesh>
            <boxGeometry args={[0.9, 1.1, 0.02]} />
            <meshStandardMaterial color="#fcfbe3" roughness={0.5} />
          </mesh>
          {/* 照片图像面 */}
          <Image 
            url={item.textureUrl!} 
            scale={[0.8, 0.8]} 
            position={[0, 0.1, 0.011]} 
            transparent
            side={THREE.DoubleSide}
          />
        </group>
      ))}
    </>
  );
};
