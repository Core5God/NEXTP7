/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useRef, useState, useMemo, useEffect, useLayoutEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  ScrollControls, 
  Scroll, 
  useScroll, 
  PerspectiveCamera,
  Points,
  PointMaterial
} from "@react-three/drei";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, 
  X, 
  ChevronRight, 
  MousePointer2, 
} from "lucide-react";
import * as THREE from "three";

// --- Constants & Config ---
const THEME = {
  primary: "#A40000",
  secondary: "#0066ff",
  bg: "#050505",
  text: "#ffffff",
  muted: "rgba(255, 255, 255, 0.4)"
};

const PROLOGUE_IMAGES = [
  "https://i.postimg.cc/6pmJvPf2/20260208-xiao-pengp7-shang-hai7474-4000.jpg",
  "https://i.postimg.cc/0NKgdCVb/20260208-xiao-pengp7-shang-hai7732-4000.jpg",
  "https://i.postimg.cc/bvSXHRmd/20260208-xiao-pengp7-shang-hai8480-0309.jpg",
  "https://i.postimg.cc/7LJvMNK2/20260208-xiao-pengp7-shang-hai8569-0309.jpg",
  "https://i.postimg.cc/9fw3tBLJ/20260208-xiao-pengp7-shang-hai8789-0309.jpg",
  "https://i.postimg.cc/xdwwsbZP/20260208-xiao-pengp7-shang-hai8887-4000.jpg",
  "https://i.postimg.cc/JhffTBFx/20260208-xiao-pengp7-shang-hai9155-4000.jpg",
  "https://i.postimg.cc/pdww0nS6/20260212-xiao-pengp7-su-zhou0304-0309.jpg",
  "https://i.postimg.cc/nhPbDWGn/20260212-xiao-pengp7-su-zhou0714.jpg",
  "https://i.postimg.cc/3xc5vqFr/Lifestyle-hei-03-4000px.jpg",
  "https://i.postimg.cc/2SKRZt76/xiao-peng-P716983-0309.jpg",
  "https://i.postimg.cc/Gm5wyfxL/xiao-peng-P717825-0306.jpg"
];

// --- Procedural 3D Components ---

/**
 * Background Grid & Particles for atmosphere
 */
function Background() {
  const scroll = useScroll();
  const gridRef = useRef<THREE.GridHelper>(null);

  useLayoutEffect(() => {
    if (gridRef.current) {
      (gridRef.current.material as THREE.LineBasicMaterial).transparent = true;
    }
  }, []);

  useFrame(() => {
    if (gridRef.current) {
      // Grid only visible/bright in prologue, fades out as we scroll to chapters
      const opacity = Math.max(0, 1 - scroll.offset * 10);
      (gridRef.current.material as THREE.LineBasicMaterial).opacity = opacity * 0.15;
    }
  });

  return (
    <group>
      <gridHelper ref={gridRef} args={[120, 60, 0x333333, 0x111111]} position={[0, -6, 0]} />
      <fog attach="fog" args={[THEME.bg, 5, 45]} />
    </group>
  );
}

/**
 * Camera Rig for subtle movement
 */
function CameraRig() {
  const scroll = useScroll();
  const { camera, mouse } = useThree();
  
  useFrame((state, delta) => {
    const offset = scroll.offset;
    
    // Simple linear path for background particles
    let targetPos = new THREE.Vector3(0, 1.5, 10 - offset * 20);
    let targetLookAt = new THREE.Vector3(0, 0, -offset * 20);

    // Mouse Parallax (Very subtle)
    const parallaxX = mouse.x * 0.1;
    const parallaxY = mouse.y * 0.1;
    
    camera.position.lerp(new THREE.Vector3(targetPos.x + parallaxX, targetPos.y + parallaxY, targetPos.z), 0.05);
    camera.lookAt(targetLookAt);
  });

  return null;
}

/**
 * Main Scene Assembler - Cleaned of all 3D placeholders
 */
function Scene() {
  return (
    <>
      <CameraRig />
      <Background />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color={THEME.primary} />
    </>
  );
}

// --- UI Components ---

function HUD({ prologueState, activeIndex, onReturn, onScrollTo }: { prologueState: PrologueState, activeIndex: number, onReturn: () => void, onScrollTo: (index: number) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isPrologue = prologueState === 'active' || prologueState === 'video';
  const mainColor = "#A40000";

  const getBottomLeftText = () => {
    if (activeIndex === 0) return "XPENG PROLOGUE / 00";
    return `CHAPTER 0${activeIndex}`;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[150] flex flex-col justify-between p-6 md:p-10 font-sans">
      {/* Top Bar Safe Area Gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      
      {/* Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto relative z-10">
        <div className="flex items-center gap-6">
          <img 
            src="https://i.postimg.cc/fWvwLDkk/logo-hua-ban-1.png" 
            alt="XPENG Logo" 
            className="h-29 w-auto object-contain -mt-12 -ml-14"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {!isPrologue && (
          <div className="flex items-center gap-4 -mt-4">
            {prologueState === 'entered' && (
              <button 
                onClick={onReturn}
                className="px-6 py-2 border border-white/10 bg-black/40 backdrop-blur-md text-[9px] uppercase tracking-[0.4em] text-white/60 hover:text-white hover:border-white/30 transition-all group"
              >
                <span className="relative">
                  返回序章
                  <motion.div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white/40 group-hover:w-full transition-all duration-300" />
                </span>
              </button>
            )}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-all duration-500 group"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 group-hover:scale-110" />}
            </button>
          </div>
        )}
      </div>

      {/* Side Chapter Status Indicator */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-12">
        {[0, 1, 2, 3].map((i) => {
          const isActive = activeIndex === i;
          return (
            <div key={i} className="flex items-center gap-6 group cursor-pointer pointer-events-auto">
              <div className="flex flex-col items-center gap-2">
                <motion.span 
                  animate={{ 
                    color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.2)",
                    opacity: isActive ? [0.8, 1, 0.8] : 1
                  }}
                  transition={{ 
                    opacity: isActive ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : { duration: 0.5 },
                    color: { duration: 0.5 }
                  }}
                  className="text-[9px] font-mono tracking-widest"
                >
                  0{i}
                </motion.span>
                <motion.div 
                  animate={{ 
                    backgroundColor: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
                    height: isActive ? 12 : 8
                  }}
                  transition={{ duration: 0.5 }}
                  className="w-[1px]" 
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-6">
          {/* New System Info Labels (Bottom Left) */}
          <div className="flex flex-col gap-1.5 opacity-90">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: mainColor }} />
              <span className="text-[9px] tracking-[0.4em] text-white uppercase font-light">中国｜广州</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.span 
                key={activeIndex}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="text-[9px] tracking-[0.3em] text-white font-light"
              >
                {getBottomLeftText()}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-6">
          {!isPrologue && (
            <div className="flex items-center gap-12 pointer-events-auto">
              <div className="flex flex-col items-end gap-2">
                <span className="text-[9px] text-white/90 uppercase tracking-[0.5em] font-bold">滚动探索</span>
                <div className="w-32 h-[1.5px] bg-white/20 relative overflow-hidden">
                  <motion.div 
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* New System Status Label (Bottom Right) */}
          <div className="flex items-center gap-2 opacity-90">
            <span className="text-[9px] tracking-[0.5em] text-white font-light uppercase">System Active</span>
          </div>
        </div>
      </div>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black pointer-events-auto flex items-center justify-center z-[60]"
          >
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.6fr] gap-12 md:gap-16 p-12 max-w-7xl w-full">
              <div className="flex flex-col gap-12 md:-ml-20">
                {[
                  { en: "IMAGINATION", cn: "想象力", index: 1 },
                  { en: "INTELLIGENCE", cn: "智能", index: 2 },
                  { en: "FUTURE", cn: "未来", index: 3 }
                ].map((item, i) => (
                  <motion.div
                    key={item.en}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => {
                      onScrollTo(item.index);
                      setIsMenuOpen(false);
                    }}
                    className="flex flex-col group cursor-pointer"
                  >
                    <span className="text-5xl md:text-7xl font-bold uppercase tracking-tighter group-hover:text-cyan-400 transition-all duration-500 group-hover:translate-x-4">
                      {item.en}
                    </span>
                    <span className="text-sm font-bold tracking-[0.5em] text-white/20 group-hover:text-cyan-400/50 transition-all ml-2">
                      {item.cn}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="hidden md:flex flex-col justify-center gap-12 border-l border-white/10 pl-20">
                <div className="flex flex-col gap-4">
                  <span className="text-xs text-cyan-400 font-bold tracking-[0.4em] uppercase">项目概述</span>
                  <p className="text-white/40 text-sm leading-relaxed max-w-md">
                    从想象力到智能判断，再到未来形态的预演，<br />
                    我们试图用一套连续的体验叙事，呈现小鹏对于下一代出行的思考。
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-xs text-cyan-400 font-bold tracking-[0.4em] uppercase">联系我们</span>
                  <div className="flex flex-col gap-2 text-white/40 text-sm leading-relaxed">
                    <p>WeChat：wycz-ppll</p>
                    <p>Lark：huangpl2@xiaopeng.com</p>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-10 right-10 w-16 h-16 flex items-center justify-center hover:bg-white/10 rounded-full transition-all"
            >
              <X className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionContent({ title, subtitle, description, index, children, rightContent }: { title: string, subtitle: string, description: string, index: number, children?: React.ReactNode, rightContent?: React.ReactNode }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.4,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
    }
  } as const;

  const titleVariants = {
    hidden: { y: "120%", opacity: 0, skewY: 7 },
    visible: { 
      y: 0, 
      opacity: 1,
      skewY: 0,
      transition: { duration: 1.8, ease: [0.16, 1, 0.3, 1] }
    }
  } as const;

  const subtitleVariants = {
    hidden: { opacity: 0, x: -40, filter: "blur(20px)", scale: 0.98 },
    visible: { 
      opacity: 1, 
      x: 0, 
      filter: "blur(0px)",
      scale: 1,
      transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
    }
  } as const;

  return (
    <div className="h-screen flex flex-col justify-center px-10 md:px-24 lg:px-40 max-w-7xl font-sans relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ margin: "-10%", once: true }}
        className="z-10"
      >
        {/* Micro Label - Red English Text */}
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-16">
          <span className="text-[11px] md:text-[13px] font-black tracking-[0.8em] uppercase" style={{ color: THEME.primary }}>
            SECTION 0{index}
          </span>
          <div className="w-12 h-[1px]" style={{ backgroundColor: THEME.primary, opacity: 0.4 }} />
        </motion.div>
        
        {/* Main Title - Mask Reveal Effect */}
        <div className="overflow-hidden mb-10">
          <motion.h2 
            variants={titleVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] uppercase leading-[1.15] text-white max-w-4xl"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </div>
        
        {/* Subtitle / Explanatory Layer - Slide & Blur Effect */}
        <motion.div 
          variants={subtitleVariants}
          className="flex flex-col gap-24 max-w-xl"
        >
          <p className="text-xs md:text-sm text-white/40 font-light leading-[2.2] tracking-[0.25em]">
            {subtitle}
          </p>
          
          <div className="flex flex-col gap-10">
            <div className="flex gap-16">
              <div className="flex flex-col gap-2">
                <span className="text-[7px] text-white/20 uppercase tracking-[0.4em]">核心技术</span>
                <span className="text-[12px] font-mono text-white/60 tracking-widest">INTELLIGENT</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[7px] text-white/20 uppercase tracking-[0.4em]">研发状态</span>
                <span className="text-[12px] font-mono text-white/60 tracking-widest">DEPLOYED</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              <button className="group w-fit flex items-center gap-6 text-[8px] font-black uppercase tracking-[0.5em] text-white/30 hover:text-white transition-all duration-500">
                <span className="border-b border-white/10 group-hover:border-white pb-1">LEARN MORE</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-3 transition-transform" />
              </button>
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {rightContent}

      {/* Subtle Background Accent - Non-3D */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/2 h-1/2 bg-gradient-to-l from-red-900/5 to-transparent blur-3xl pointer-events-none" />
      
      {/* Decorative Brand Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 right-20 w-px h-32 bg-gradient-to-b from-transparent via-red-600 to-transparent" />
        <div className="absolute bottom-1/4 right-40 w-px h-48 bg-gradient-to-b from-transparent via-red-600 to-transparent" />
        <div className="absolute top-1/2 right-0 w-32 h-px bg-gradient-to-l from-red-600 to-transparent" />
      </div>
    </div>
  );
}

// --- Chapter 1 Specific Components ---

const CAR_COLORS = [
  { name: "星曜红", color: "#A40000", img: "https://i.postimg.cc/pL2f5DfZ/hong.png" },
  { name: "星云白", color: "#F5F5F5", img: "https://i.postimg.cc/qvks68sc/bai.png" },
  { name: "暗夜黑", color: "#1A1A1A", img: "https://i.postimg.cc/3xKX0gXg/hei.png" },
  { name: "星暮紫", color: "#a06eaa", img: "https://i.postimg.cc/QxggM6Tg/zi.png" },
  { name: "星瀚绿", color: "#2F4F4F", img: "https://i.postimg.cc/6p9r4drS/lu.png" },
  { name: "星芒蓝", color: "#7cb1e3", img: "https://i.postimg.cc/VkYq0jqZ/lan.png" },
  { name: "星月银", color: "#C0C0C0", img: "https://i.postimg.cc/P52mWPy2/yin.png" },
  { name: "律动黄", color: "#e7ed68", img: "https://i.postimg.cc/L8Htgzt1/huang.png" },
];

function ChapterOneDisplay() {
  const [selectedColor, setSelectedColor] = useState(CAR_COLORS[0]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 1.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-[58vw] right-[5vw] top-[52.5%] -translate-y-1/2 w-[clamp(520px,34vw,680px)] z-50 flex flex-col items-center pointer-events-auto"
    >
      {/* Background Atmosphere Image Layer */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-visible flex items-center justify-end">
        <AnimatePresence mode="wait">
          <motion.img
            key={`bg-${selectedColor.img}`}
            src={selectedColor.img}
            initial={{ opacity: 0, scale: 1.8, x: 50 }}
            animate={{ opacity: 0.1, scale: 2, x: 0 }}
            exit={{ opacity: 0, scale: 2.2, x: -50 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-contain origin-right translate-x-[20%] -translate-y-[12%]"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
      </div>

      <div className="w-[115%] aspect-[16/9] relative mb-2 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedColor.img}
            src={selectedColor.img}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
      </div>
      
      <div className="flex items-center justify-center gap-8 -translate-y-2">
        {CAR_COLORS.map((item) => (
          <button
            key={item.name}
            onClick={() => setSelectedColor(item)}
            className="group relative flex flex-col items-center"
          >
            <motion.div 
              animate={selectedColor.name === item.name ? {
                boxShadow: [
                  "0 0 0px rgba(255,255,255,0)", 
                  "0 0 25px rgba(255,255,255,0.4)", 
                  "0 0 0px rgba(255,255,255,0)"
                ]
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`w-7 h-7 rounded-full border-2 transition-all duration-500 relative ${
                selectedColor.name === item.name 
                ? 'border-white scale-110' 
                : 'border-transparent hover:border-white/40 hover:scale-110'
              }`}
              style={{ backgroundColor: item.color }}
            >
              {selectedColor.name === item.name && (
                <motion.div 
                  layoutId="active-ring"
                  className="absolute -inset-1.5 border border-white/40 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
            <span className={`text-[8px] tracking-[0.2em] absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase font-bold ${selectedColor.name === item.name ? 'opacity-100 text-white' : 'text-white/40'}`}>
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// --- Prologue Overlay Component ---

// --- Types ---
type PrologueState = 'active' | 'video' | 'entering' | 'entered' | 'returning';

/**
 * ScrollProxy: Exposes the scroll object to the parent App component
 */
function ScrollProxy({ onReady }: { onReady: (scroll: any) => void }) {
  const scroll = useScroll();
  useEffect(() => {
    onReady(scroll);
  }, [scroll, onReady]);
  return null;
}

/**
 * ScrollManager: Handles programmatic scrolling between sections
 */
function ScrollManager({ state, onIndexChange }: { state: PrologueState, onIndexChange: (index: number) => void }) {
  const scroll = useScroll();
  const lastIndex = useRef(0);
  
  useFrame(() => {
    // Force scroll to specific targets during transitions
    if (state === 'entering') {
      const target = 0; // Start of Chapter 1 (Index 1)
      const diff = target - scroll.offset;
      if (Math.abs(diff) > 0.0001) {
        scroll.offset += diff * 0.1; // Smooth interpolation to top
      } else {
        scroll.offset = target;
      }
    } else if (state === 'returning') {
      const target = 0; // Back to top
      const diff = target - scroll.offset;
      if (Math.abs(diff) > 0.0001) {
        scroll.offset += diff * 0.1;
      } else {
        scroll.offset = target;
      }
    } else if (state === 'active') {
      // Keep scroll at top while prologue home is active
      scroll.offset = 0;
    } else if (state === 'video') {
      // Allow scroll to skip video stage
      if (scroll.offset > 0.1) {
        onIndexChange(-1); // Special signal to trigger video completion
      }
    }

    // Calculate active index based on scroll offset
    let currentIndex = 0;
    if (state === 'entered' || state === 'returning') {
      const offset = scroll.offset;
      // With 3 pages of scroll: 01 at 0, 02 at 0.5, 03 at 1.0
      // Thresholds for "centered": 0.25 and 0.75
      if (offset < 0.25) currentIndex = 1;
      else if (offset < 0.75) currentIndex = 2;
      else currentIndex = 3;
    } else if (state === 'entering') {
      currentIndex = 1; // Force 01 during entry transition
    } else {
      currentIndex = 0; // 00 for active/video
    }

    if (currentIndex !== lastIndex.current) {
      lastIndex.current = currentIndex;
      onIndexChange(currentIndex);
    }
  });
  
  return null;
}

/**
 * PrologueImageSlideshow: Randomized slow-switching image sequence
 */
const PrologueImageSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([0]);
  const historyLimit = 4; // Keep track of last 4 images to avoid quick repetition

  useEffect(() => {
    // Preload images for smooth transition
    PROLOGUE_IMAGES.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        // Filter out recently used indices
        const available = PROLOGUE_IMAGES.map((_, i) => i).filter(i => !history.includes(i));
        
        // Pick random from available or fallback to next if somehow empty
        const next = available.length > 0 
          ? available[Math.floor(Math.random() * available.length)]
          : (prev + 1) % PROLOGUE_IMAGES.length;

        setHistory(h => {
          const newHistory = [...h, next];
          if (newHistory.length > historyLimit) newHistory.shift();
          return newHistory;
        });

        return next;
      });
    }, 4500); // 4.5s interval

    return () => clearInterval(timer);
  }, [history]);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ 
            opacity: { duration: 2, ease: "easeInOut" },
            scale: { duration: 8, ease: "linear" } // Very slow zoom for "high-end" feel
          }}
          className="absolute inset-0"
        >
          <img 
            src={PROLOGUE_IMAGES[currentIndex]} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            alt=""
            onError={() => {
              // Skip to next image if loading fails
              setCurrentIndex(prev => (prev + 1) % PROLOGUE_IMAGES.length);
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/**
 * PrologueOverlay: The independent entry layer
 */
const PrologueOverlay = ({ 
  state, 
  onEnter, 
  onVideoComplete,
  onComplete 
}: { 
  state: PrologueState; 
  onEnter: () => void; 
  onVideoComplete: () => void;
  onComplete: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonBounds, setButtonBounds] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  // Measure button bounds for precise line alignment
  useLayoutEffect(() => {
    const updateBounds = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setButtonBounds({
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right
        });
      }
    };

    // Use ResizeObserver for robust tracking of layout shifts
    const observer = new ResizeObserver(updateBounds);
    if (buttonRef.current) observer.observe(buttonRef.current);

    window.addEventListener('resize', updateBounds);
    
    // Continuous sync during entry phase to handle motion animations
    let frameId: number;
    const syncLoop = () => {
      updateBounds();
      frameId = requestAnimationFrame(syncLoop);
    };
    
    if (state === 'active') {
      frameId = requestAnimationFrame(syncLoop);
    }

    updateBounds();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateBounds);
      cancelAnimationFrame(frameId);
    };
  }, [state]);

  // Trigger onComplete after transition animations
  useEffect(() => {
    if (state === 'entering' || state === 'returning') {
      const duration = state === 'entering' ? 1200 : 1500;
      const timer = setTimeout(() => {
        onComplete();
      }, duration); 
      return () => clearTimeout(timer);
    }
  }, [state, onComplete]);

  // Handle video transition lock
  useEffect(() => {
    if (state === 'active') {
      setIsLocked(false);
    }
  }, [state]);

  const handleEnter = () => {
    if (isLocked || state !== 'active') return;
    setIsLocked(true);
    onEnter();
  };

  const mainGreen = "#A40000";
  const accentOrange = "#F49E0A";

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050505]"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: (state === 'entering' || state === 'returning') ? 0 : 1 
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 1. Background Image (Full Screen with Left Fade) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          {/* Gradient Transition Overlay - Fades from solid black on left to transparent on right */}
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent pointer-events-none" />
          
          <motion.div
            className="absolute inset-0"
            animate={state === 'entering' ? {
              opacity: 0,
              scale: 1.1,
              filter: "blur(10px) brightness(1.5)",
            } : state === 'returning' ? {
              opacity: [0, 0.7],
              scale: [1.05, 1],
              filter: ["blur(5px)", "blur(0px)"],
            } : {
              opacity: 0.7,
              scale: isHovered ? 1.02 : 1,
            }}
            transition={{
              duration: 2,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <img 
              src="https://i.postimg.cc/t4BZVFTY/20260212-xiao-pengp7-su-zhou2473-0309.jpg"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              alt=""
            />
          </motion.div>
        </div>
      </div>

      {/* 2. Stable Wireframe System */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {/* System Grid Lines (Static Borders) */}
        {[0, 1].map((pos, i) => (
          <div 
            key={`h-border-${i}`}
            className="absolute w-full h-[1px] bg-white/5"
            style={{ top: `${pos * 100}%` }}
          />
        ))}
        {[0, 1].map((pos, i) => (
          <div 
            key={`v-border-${i}`}
            className="absolute h-full w-[1px] bg-white/5"
            style={{ left: `${pos * 100}%` }}
          />
        ))}

        {/* Interactive Converging Lines */}
        {/* Top Horizontal */}
        <motion.div 
          className="absolute left-0 w-full h-[1px] z-10"
          animate={{ 
            top: isHovered ? buttonBounds.top : "25%",
            backgroundColor: isHovered ? "rgba(164, 0, 0, 1)" : "rgba(164, 0, 0, 0)",
            opacity: isHovered ? 1 : 0
          }}
          transition={{ 
            top: { type: "spring", stiffness: 100, damping: 30 },
            backgroundColor: { duration: 0.6, delay: isHovered ? 0.3 : 0 },
            opacity: { duration: 0.6, delay: isHovered ? 0.3 : 0 }
          }}
        />
        {/* Bottom Horizontal */}
        <motion.div 
          className="absolute left-0 w-full h-[1px] z-10"
          animate={{ 
            top: isHovered ? buttonBounds.bottom : "75%",
            backgroundColor: isHovered ? "rgba(164, 0, 0, 1)" : "rgba(164, 0, 0, 0)",
            opacity: isHovered ? 1 : 0
          }}
          transition={{ 
            top: { type: "spring", stiffness: 100, damping: 30 },
            backgroundColor: { duration: 0.6, delay: isHovered ? 0.3 : 0 },
            opacity: { duration: 0.6, delay: isHovered ? 0.3 : 0 }
          }}
        />
        {/* Left Vertical */}
        <motion.div 
          className="absolute top-0 h-full w-[1px] z-10"
          animate={{ 
            left: isHovered ? buttonBounds.left : "15%",
            backgroundColor: isHovered ? "rgba(164, 0, 0, 1)" : "rgba(164, 0, 0, 0)",
            opacity: isHovered ? 1 : 0
          }}
          transition={{ 
            left: { type: "spring", stiffness: 100, damping: 30 },
            backgroundColor: { duration: 0.6, delay: isHovered ? 0.3 : 0 },
            opacity: { duration: 0.6, delay: isHovered ? 0.3 : 0 }
          }}
        />
        {/* Right Vertical */}
        <motion.div 
          className="absolute top-0 h-full w-[1px] z-10"
          animate={{ 
            left: isHovered ? buttonBounds.right : "55%",
            backgroundColor: isHovered ? "rgba(164, 0, 0, 1)" : "rgba(164, 0, 0, 0)",
            opacity: isHovered ? 1 : 0
          }}
          transition={{ 
            left: { type: "spring", stiffness: 100, damping: 30 },
            backgroundColor: { duration: 0.6, delay: isHovered ? 0.3 : 0 },
            opacity: { duration: 0.6, delay: isHovered ? 0.3 : 0 }
          }}
        />

        {/* Dynamic Snapping Lines (Converge from background to button) */}
        
        {/* Small Accent Details */}
      </div>

      {/* 3. Typography & Content (Shifted Left) */}
      <AnimatePresence>
        {state === 'active' && (
          <motion.div 
            key="home-content"
            exit={{ opacity: 0, x: -100, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeIn" }}
            className="relative z-40 w-full max-w-7xl px-12 flex flex-col items-start pointer-events-none -translate-x-32"
          >
            <div className="mb-6 relative">
              <div className="overflow-hidden">
                <motion.h1 
                  className="text-5xl md:text-7xl font-light tracking-[0.15em] text-white"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                >
                  未来，从此刻开启
                </motion.h1>
              </div>
              
              {/* Subtle Ghosting Glow */}
              <motion.h1 
                className="absolute inset-0 text-5xl md:text-7xl font-light tracking-[0.15em] pointer-events-none select-none"
                style={{ color: mainGreen, opacity: 0.1, filter: "blur(8px)" }}
                animate={{ 
                  x: [-2, 2, -2],
                  opacity: [0.05, 0.15, 0.05]
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                未来，从此刻开启
              </motion.h1>
            </div>
            
            <motion.p 
              className="text-sm md:text-base text-white/40 tracking-[0.25em] font-light max-w-lg mb-16"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
            >
              当技术不再只是参数，出行便开始拥有新的叙事
            </motion.p>

            {/* 4. Refined Enter Button */}
            <div className="pointer-events-auto mt-24">
              <motion.button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleEnter}
                disabled={isLocked}
                className="relative group flex items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 1 }}
              >
                {/* Button Body */}
                <div 
                  ref={buttonRef}
                  className="relative px-24 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-500 group-hover:border-white/20"
                >
                  {/* Left Active Strip */}
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: mainGreen }}
                    animate={{ 
                      width: isHovered ? "100%" : "4px", 
                      opacity: 1 
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 25 }}
                  />
                  
                  <span className={`relative z-10 text-xs md:text-sm tracking-[0.6em] font-light transition-colors duration-500 ${isHovered ? 'text-black' : 'text-white'}`}>
                    进入
                  </span>
                </div>

                {/* Snapping Line Indicator (Right side) */}
                <motion.div 
                  className="ml-4 h-[1px]"
                  style={{ backgroundColor: mainGreen }}
                  animate={{ width: isHovered ? 60 : 20, opacity: isHovered ? 1 : 0.3 }}
                />
                
                {/* Small Accent Dot */}
                <motion.div 
                  className="ml-2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: isHovered ? accentOrange : mainGreen }}
                  animate={{ scale: isHovered ? 1.5 : 1 }}
                />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Video Stage (Expanding Door) */}
      <AnimatePresence>
        {state === 'video' && (
          <motion.div
            key="video-stage"
            initial={{ clipPath: "inset(0 50% 0 50%)" }}
            animate={{ clipPath: "inset(0 0% 0 0%)" }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black"
          >
            <div className="relative w-full h-full">
              <PrologueImageSlideshow />
              
              {/* Video Overlay UI */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
              
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-8 pointer-events-auto">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  onClick={onVideoComplete}
                  className="px-14 py-3 border border-white/20 bg-white/5 backdrop-blur-md text-[13px] uppercase tracking-[0.8em] text-white hover:bg-white hover:text-black transition-all group"
                >
                  开始体验
                  <motion.div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300" />
                </motion.button>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="flex flex-col items-center gap-3"
                >
                  <span className="text-[11px] text-white tracking-[0.5em] uppercase font-medium">进入第一章</span>
                  <motion.div 
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-[1px] h-10 bg-white/40"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Status Info Removed */}
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [prologueState, setPrologueState] = useState<PrologueState>('active');
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<any>(null);

  const handleScrollTo = (index: number) => {
    if (scrollRef.current) {
      const el = scrollRef.current.el;
      const targetOffset = (index - 1) * 0.5;
      const targetScroll = targetOffset * (el.scrollHeight - el.clientHeight);
      
      el.scrollTo({
        top: targetScroll,
        behavior: 'auto'
      });
    }
  };

  return (
    <div className="h-screen w-full bg-[#050505] text-white overflow-hidden font-sans">
      <HUD 
        prologueState={prologueState} 
        activeIndex={activeIndex} 
        onReturn={() => setPrologueState('returning')}
        onScrollTo={handleScrollTo}
      />
      
      <AnimatePresence mode="wait">
        {(prologueState === 'active' || prologueState === 'video' || prologueState === 'entering' || prologueState === 'returning') && (
          <PrologueOverlay 
            key="prologue"
            state={prologueState}
            onEnter={() => setPrologueState('video')} 
            onVideoComplete={() => {
              setPrologueState('entering');
              setActiveIndex(1); // Immediately switch to 01 to avoid delay
            }}
            onComplete={() => {
              if (prologueState === 'entering') setPrologueState('entered');
              if (prologueState === 'returning') {
                setPrologueState('active');
                setActiveIndex(0);
              }
            }}
          />
        )}
      </AnimatePresence>

      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ScrollControls pages={3} damping={0.2}>
            <ScrollProxy onReady={(scroll) => { scrollRef.current = scroll; }} />
            <Scene />
            <ScrollManager 
              state={prologueState} 
              onIndexChange={(index) => {
                if (index === -1 && prologueState === 'video') {
                  setPrologueState('entering');
                  setActiveIndex(1);
                } else {
                  setActiveIndex(index);
                }
              }} 
            />
            
            <Scroll html>
              {/* Chapter 1 */}
              <SectionContent 
                index={1}
                title="先看见一台车的 <br /> 想象力"
                subtitle="它不仅承载移动，更承载品牌、审美与下一代体验的起点。通过极致的设计语言，我们重新定义了智能出行的视觉边界。"
                description=""
                rightContent={<ChapterOneDisplay />}
              />

              {/* Chapter 2 */}
              <SectionContent 
                index={2}
                title="每一次前行，<br /> 都经过思考"
                subtitle="在感知与判断之间，智能驾驶把复杂世界转化为从容行动。基于端到端大模型，实现全场景、全天候的自动驾驶体验。"
                description=""
              />

              {/* Chapter 3 */}
              <SectionContent 
                index={3}
                title="把未来带到 <br /> 现实之前"
                subtitle="飞行汽车与机器人，正在让想象逐步拥有真实形态。我们不断探索人类移动的终极形态，打破维度与空间的限制。"
                description=""
              />

              {/* Micro-interaction End Section */}
              <div className="h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-8">
                  <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center group cursor-pointer hover:border-cyan-400 transition-colors">
                    <MousePointer2 className="w-6 h-6 text-white/20 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-white/20">体验已完成</span>
                </div>
              </div>
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>

      {/* Global Scanning Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>
    </div>
  );
}
