import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

interface HelloProps {
  onComplete: () => void;
}

const TOTAL_DURATION_MS = 6000;

export default function Hello({ onComplete }: HelloProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    // Use Vite's BASE_URL so this works both locally and on GitHub Pages (/omkar-shirvalkar/)
    fetch(`${import.meta.env.BASE_URL}animations/Welcome.json`)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch(() => setFetchError(true));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => onComplete(), TOTAL_DURATION_MS);
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
        gap: "28px"
      }}
    >
      {/* Apple Logo — larger */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg
          width="72"
          height="86"
          viewBox="0 0 196 236"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M130.16 0C131.376 10.0725 127.586 20.1189 121.271 27.3126C114.602 34.8916 103.874 40.5711 93.3752 39.9066C91.9309 30.0587 96.2198 19.791 102.473 12.9481C109.367 5.39557 120.523 0.259277 130.16 0ZM163.625 79.0681C153.097 72.3491 145.79 68.4001 136.029 68.4001C122.918 68.4001 117.201 74.8 104.978 74.8C92.3986 74.8 84.6397 68.4277 73.5617 68.4277C62.8527 68.4277 51.416 74.9997 44.0767 85.5971C33.5177 100.668 31.7747 128.965 47.8317 155.107C53.8367 164.969 61.8207 176.019 72.3097 176.123C82.1867 176.22 84.9917 169.874 97.8827 169.809C110.774 169.742 113.324 176.213 123.183 176.107C133.682 175.993 142.11 163.788 148.115 153.927C152.545 146.658 154.197 143.005 157.672 134.896C132.547 125.225 128.498 88.4951 163.625 79.0681Z" />
        </svg>
      </motion.div>

      {/* Lottie "Welcome" animation — large and centered */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: animationData ? 1 : 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "min(90vw, 760px)",
          /* natural aspect ratio of the Lottie canvas: 428 / 123 ≈ 3.48 */
          aspectRatio: "428 / 123",
          position: "relative"
        }}
      >
        {animationData && (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
            rendererSettings={{
              preserveAspectRatio: "xMidYMid meet",
              progressiveLoad: false
            }}
          />
        )}
        {fetchError && (
          <div
            style={{
              fontFamily: "'SF Pro Display', 'Helvetica Neue', sans-serif",
              fontSize: "clamp(60px, 10vw, 110px)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "#fff",
              textAlign: "center"
            }}
          >
            Welcome
          </div>
        )}
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 1.6, ease: "easeOut" }}
        style={{
          fontFamily: "'SF Pro Text', 'Helvetica Neue', 'Segoe UI', sans-serif",
          fontSize: "clamp(13px, 1.8vw, 17px)",
          fontWeight: 400,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          margin: 0
        }}
      >
        to Omkar's Portfolio
      </motion.p>
    </div>
  );
}

