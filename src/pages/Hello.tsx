import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HelloProps {
  onComplete: () => void;
}

export default function Hello({ onComplete }: HelloProps) {
  useEffect(() => {
    // Total sequence: hello fades in (1s) + holds (1.5s) + subtitle fades in (0.8s) + holds (0.7s) = ~4s
    const timer = setTimeout(() => {
      onComplete();
    }, 4200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden"
      }}
    >
      {/* Apple Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: "48px" }}
      >
        <svg
          width="60"
          height="72"
          viewBox="0 0 196 236"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M130.16 0C131.376 10.0725 127.586 20.1189 121.271 27.3126C114.602 34.8916 103.874 40.5711 93.3752 39.9066C91.9309 30.0587 96.2198 19.791 102.473 12.9481C109.367 5.39557 120.523 0.259277 130.16 0ZM163.625 79.0681C153.097 72.3491 145.79 68.4001 136.029 68.4001C122.918 68.4001 117.201 74.8 104.978 74.8C92.3986 74.8 84.6397 68.4277 73.5617 68.4277C62.8527 68.4277 51.416 74.9997 44.0767 85.5971C33.5177 100.668 31.7747 128.965 47.8317 155.107C53.8367 164.969 61.8207 176.019 72.3097 176.123C82.1867 176.22 84.9917 169.874 97.8827 169.809C110.774 169.742 113.324 176.213 123.183 176.107C133.682 175.993 142.11 163.788 148.115 153.927C152.545 146.658 154.197 143.005 157.672 134.896C132.547 125.225 128.498 88.4951 163.625 79.0681Z" />
        </svg>
      </motion.div>

      {/* "hello." Typography */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "'SF Pro Display', 'Helvetica Neue', 'Segoe UI', sans-serif",
          fontSize: "clamp(72px, 12vw, 120px)",
          fontWeight: 300,
          color: "#ffffff",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          fontStyle: "italic",
          marginBottom: "24px"
        }}
      >
        hello.
      </motion.div>

      {/* Welcome note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 2.0, ease: "easeOut" }}
        style={{
          fontFamily: "'SF Pro Text', 'Helvetica Neue', 'Segoe UI', sans-serif",
          fontSize: "clamp(14px, 2vw, 18px)",
          fontWeight: 400,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginTop: 0
        }}
      >
        Welcome to Omkar's Portfolio
      </motion.p>

      {/* Subtle bottom gradient shimmer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.0, delay: 0.8, ease: "easeOut" }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "200px",
          background:
            "linear-gradient(to top, rgba(30,30,30,0.25), transparent)",
          pointerEvents: "none"
        }}
      />
    </div>
  );
}
