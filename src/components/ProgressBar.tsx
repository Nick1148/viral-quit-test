interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm py-3 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 font-medium">
            {current} / {total}
          </span>
          <span className="text-xs text-indigo-600 font-bold">{percent}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
