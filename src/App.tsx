import { useRef } from 'react';
import { useHandGesture } from './useHandGesture';
import { LuxuryTreeScene } from './Scene';

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // 注入核心手势追踪状态状态机
  const gestureState = useHandGesture(videoRef);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas 渲染层 */}
      <LuxuryTreeScene gestureState={gestureState} />

      {/* 极简奢华 UI 控制面板层 */}
      <div className="absolute inset-x-0 top-0 p-8 flex justify-between items-start pointer-events-none">
        <div className="text-white">
          <h1 className="text-2xl font-bold tracking-widest text-[#FFD700] drop-shadow">
            GRAND LUXURY INTERACTIVE CHRISTMAS TREE
          </h1>
          <p className="text-xs text-emerald-400 font-mono mt-1">REACT 19 / THREE.JS / MEDIAPIPE GESTURE</p>
        </div>
        
        {/* 右上角隐藏/小窗显示视频流调试 */}
        <div className="relative w-32 h-24 rounded-lg border border-[#FFD700]/30 overflow-hidden bg-black/40 backdrop-blur pointer-events-auto">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <div className="absolute bottom-1 left-1 text-[9px] px-1 bg-[#FFD700] text-black font-bold rounded">
            LIVE CAMERA
          </div>
        </div>
      </div>

      {/* 底部交互手势操作指南提示栏 */}
      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center justify-center pointer-events-none text-center">
        <div className="bg-emerald-950/60 border border-[#FFD700]/40 px-6 py-3 rounded-full backdrop-blur-md shadow-[0_0_30px_rgba(255,215,0,0.15)]">
          <span className="text-sm font-medium tracking-wide text-gray-200">
            🖐️ <strong className="text-[#FFD700]">张开手掌</strong>：释放混沌 (CHAOS) &nbsp;|&nbsp; ✊ <strong className="text-[#FFD700]">握紧拳头</strong>：凝聚成树 (FORMED)
          </span>
          <p className="text-[11px] text-emerald-500 mt-1 font-mono">移动手部可作为物理摇杆微调黄金比例镜头视角</p>
        </div>
      </div>
    </main>
  );
}

