import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const CAR_COLORS = [
  { name: "星曜红", color: "#A40000", img: "https://i.postimg.cc/pL2f5DfZ/hong.png" },
  { name: "星云白", color: "#FFFFFF", img: "https://i.postimg.cc/qvks68sc/bai.png" },
  { name: "暗夜黑", color: "#111111", img: "https://i.postimg.cc/3xKX0gXg/hei.png" },
  { name: "星暮紫", color: "#7D6B91", img: "https://i.postimg.cc/QxggM6Tg/zi.png" },
  { name: "星瀚绿", color: "#2D4B44", img: "https://i.postimg.cc/6p9r4drS/lu.png" },
  { name: "星芒蓝", color: "#4A6FA5", img: "https://i.postimg.cc/VkYq0jqZ/lan.png" },
  { name: "星月银", color: "#BCC6CC", img: "https://i.postimg.cc/P52mWPy2/yin.png" },
  { name: "律动黄", color: "#e3e969", img: "https://i.postimg.cc/L8Htgzt1/huang.png" },
];

export default function Act1_RightPanel() {
  const [revealStage, setRevealStage] = useState<"idle" | "cutting" | "tearing" | "revealed">("idle");
  const [selectedColor, setSelectedColor] = useState(0);

  useEffect(() => {
    // 延迟 2.8s 触发，确保左侧文字特效基本完成
    const timer = setTimeout(() => {
      setRevealStage("cutting");
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (revealStage === "cutting") {
      const timer = setTimeout(() => setRevealStage("tearing"), 1000);
      return () => clearTimeout(timer);
    }
    if (revealStage === "tearing") {
      const timer = setTimeout(() => setRevealStage("revealed"), 800);
      return () => clearTimeout(timer);
    }
  }, [revealStage]);

  return (
    <div className="relative w-full h-auto flex flex-col items-center justify-center">
      {/* 初始黑色覆盖层 - 保持 Reveal 逻辑 */}
      <AnimatePresence>
        {revealStage !== "revealed" && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* 切割线动画 */}
            {revealStage === "cutting" && (
              <>
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease: "circOut" }}
                  className="absolute top-1/2 left-0 w-full h-[1px] bg-white/60 z-30"
                />
                <motion.div 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, ease: "circOut", delay: 0.2 }}
                  className="absolute left-1/2 top-0 w-[1px] h-full bg-white/60 z-30"
                />
              </>
            )}

            {/* 黑色表面撕开动画 */}
            <motion.div 
              animate={revealStage === "tearing" ? { x: "-100%" } : { x: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-y-0 left-0 w-1/2 bg-[#050505]"
            />
            <motion.div 
              animate={revealStage === "tearing" ? { x: "100%" } : { x: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-y-0 right-0 w-1/2 bg-[#050505]"
            />
          </div>
        )}
      </AnimatePresence>

      {/* 车图展示区 - 移除卡片，直接大图展示 */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={revealStage === "revealed" ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full flex flex-col items-center justify-center"
      >
        {/* 图片容器 - 占据容器 88% 宽度 */}
        <div className="relative w-[88%] aspect-[16/9] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedColor}
              src={CAR_COLORS[selectedColor].img}
              alt={CAR_COLORS[selectedColor].name}
              initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(5px)" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          
          {/* 接地阴影 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={revealStage === "revealed" ? { opacity: 0.3 } : {}}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black blur-3xl rounded-[100%]"
          />
        </div>

        {/* 色卡切换区域 - 单行圆形设计，水平居中于容器 */}
        <div className="mt-10 flex items-center justify-center gap-6">
          {CAR_COLORS.map((item, idx) => (
            <button
              key={item.name}
              onClick={() => setSelectedColor(idx)}
              className="group flex flex-col items-center gap-3 focus:outline-none"
            >
              <div className="relative flex items-center justify-center">
                <div 
                  className={`
                    w-3.5 h-3.5 rounded-full transition-all duration-500
                    ${selectedColor === idx ? 'scale-125' : 'hover:scale-125 opacity-60 hover:opacity-100'}
                  `}
                  style={{ backgroundColor: item.color, border: item.color === '#FFFFFF' ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
                />
                {/* 选中高亮外圈 */}
                <AnimatePresence>
                  {selectedColor === idx && (
                    <motion.div 
                      layoutId="swatch-ring"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute -inset-2 border border-white/30 rounded-full pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </div>
              <span className={`text-[8px] uppercase tracking-[0.2em] transition-all duration-500 ${selectedColor === idx ? 'text-white opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-40'}`}>
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
