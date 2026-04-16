interface BootProps {
  restart: boolean;
  sleep: boolean;
  firstLoad?: boolean;
  setBooting: (value: boolean | ((prevVar: boolean) => boolean)) => void;
}

const loadingInterval = 1;
const bootingInterval = 500;

export default function Boot({ restart, sleep, firstLoad, setBooting }: BootProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [percent, setPercent] = useState<number>(0);

  useEffect(() => {
    if (restart && !sleep) setLoading(true);
    // On first load, automatically start the boot progress bar
    if (firstLoad && !restart && !sleep) setLoading(true);
  }, [restart, sleep, firstLoad]);

  useInterval(
    () => {
      const newPercent = percent + 0.35;
      if (newPercent >= 100) {
        setTimeout(() => {
          setBooting(false);
          setLoading(false);
        }, bootingInterval);
      } else setPercent(newPercent);
    },
    loading ? loadingInterval : null
  );

  const handleClick = () => {
    if (sleep) setBooting(false);
    else if (restart || loading || firstLoad) return;
    else setLoading(true);
  };

  return (
    <div className="size-full bg-black flex-center" onClick={handleClick}>
      <div className="i-fa-brands:apple text-white -mt-4 size-20 sm:size-24" />
      {loading && (
        <div
          className="absolute top-1/2 inset-x-0 w-56 h-1 sm:h-1.5 bg-gray-500 rounded overflow-hidden"
          m="t-16 sm:t-24 x-auto"
        >
          <span
            className="absolute top-0 bg-white h-full rounded-sm"
            style={{
              width: `${percent.toString()}%`
            }}
          />
        </div>
      )}
      {!restart && !loading && !firstLoad && (
        <div
          pos="absolute top-1/2 inset-x-0"
          m="t-16 sm:t-20 x-auto"
          text="sm gray-200 center"
        >
          Click to {sleep ? "wake up" : "boot"}
        </div>
      )}
    </div>
  );
}
