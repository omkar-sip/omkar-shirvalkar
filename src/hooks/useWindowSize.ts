export function useWindowSize() {
  const [state, setState] = useState({
    winWidth: window.innerWidth,
    winHeight: window.innerHeight
  });

  useEffect(() => {
    let rafId: number;

    const handler = () => {
      // Use requestAnimationFrame to debounce at the frame rate
      // and avoid excessive re-renders during continuous resize
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setState({
          winWidth: window.innerWidth,
          winHeight: window.innerHeight
        });
      });
    };

    window.addEventListener("resize", handler, { passive: true });

    return () => {
      window.removeEventListener("resize", handler);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return state;
}
