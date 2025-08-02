import { useState, useEffect } from 'react';
import { Play, Pause, RotateCw, ChevronLeft } from 'lucide-react';
import { LuAlarmClock } from 'react-icons/lu';
import { IoTimerOutline } from 'react-icons/io5';
import { IoMdStopwatch } from 'react-icons/io';
import { toast } from 'sonner';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

const Timer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState('stopwatch');
  const [time, setTime] = useState(0);
  const [timerHours, setTimerHours] = useState(1); // default 1h
  const [timerMinutes, setTimerMinutes] = useState(0); // default 0m
  const [isRunning, setIsRunning] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const formatTime = time => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTime(prevTime => {
          if (mode === 'timer') {
            if (prevTime <= 0) {
              setIsRunning(false);
              toast.success('Timer finished!');
              return 0;
            }
            return prevTime - 1;
          } else {
            return prevTime + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, mode]);

  const handleReset = e => {
    e.stopPropagation();
    if (mode === 'timer') {
      setTime(timerHours * 3600 + timerMinutes * 60);
    } else {
      setTime(0);
    }
    setIsRunning(false);
    setIsPaused(false);
  };

  // Reset time when switching modes
  useEffect(() => {
    if (mode === 'stopwatch') {
      setTime(0);
    } else {
      setTime(timerHours * 3600 + timerMinutes * 60);
    }
    setIsRunning(false);
    setIsPaused(false);
  }, [mode, timerHours, timerMinutes]);

  // Hide timer state (do not reset timer state)
  const handleHide = () => {
    setIsHidden(true);
    // Do NOT setIsRunning(false) here, just hide the timer
    setIsOpen(false);
  };

  if (isHidden) {
    const iconColor = mode === 'timer' ? '#ff9500' : '#4a9eff';
    const IconComponent = mode === 'timer' ? IoTimerOutline : IoMdStopwatch;

    return (
      <div className="flex items-center justify-center">
        <button
          onClick={() => setIsHidden(false)}
          className="w-8 h-8 bg-[#3a3a3a] border border-[#555] rounded flex items-center justify-center"
          aria-label="Show timer"
        >
          <IconComponent size={14} color={iconColor} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {isRunning || isPaused ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] rounded">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  if (isRunning) {
                    setIsRunning(false);
                    setIsPaused(true);
                  } else {
                    setIsRunning(true);
                    setIsPaused(false);
                  }
                }}
                className="text-gray-300"
                aria-label={isRunning ? 'Pause' : 'Resume'}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {isRunning ? 'Pause' : 'Resume'}
            </TooltipContent>
          </Tooltip>
          <span className="text-blue-400 font-mono text-sm">
            {formatTime(time)}
          </span>
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-white"
            aria-label="Reset"
          >
            <RotateCw size={14} />
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleHide}
                className="text-gray-400 hover:text-white"
                tabIndex={0}
                aria-label="Hide timer"
              >
                <ChevronLeft size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={6}>
              Hide timer
            </TooltipContent>
          </Tooltip>
        </div>
      ) : isExpanded ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] rounded">
          <button
            onClick={() => setIsOpen(true)}
            className="text-gray-300 hover:text-white"
          >
            <Play size={18} />
          </button>
          <span className="text-blue-400 font-mono text-sm">
            {mode === 'timer'
              ? formatTime(timerHours * 3600 + timerMinutes * 60)
              : '00:00:00'}
          </span>
          <button
            onClick={() => {
              if (mode === 'timer') {
                setTime(timerHours * 3600 + timerMinutes * 60);
              } else {
                setTime(0);
              }
              setIsRunning(false);
              setIsPaused(false);
              setIsOpen(true);
            }}
            className="text-gray-400 hover:text-white"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={handleHide}
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setIsExpanded(true);
            setIsOpen(true);
          }}
          className="w-8 h-8 bg-[#3a3a3a] border border-[#555] rounded flex items-center justify-center text-gray-300 hover:text-white"
        >
          <LuAlarmClock size={16} />
        </button>
      )}

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-[#2a2a2a] border border-[#404040] rounded-lg shadow-lg w-64 z-[9999]">
          <div className="grid grid-cols-2 gap-3 p-4">
            <button
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                mode === 'stopwatch'
                  ? 'bg-[#404040] border-[#555] shadow-lg'
                  : 'bg-[#2a2a2a] border-[#333] hover:bg-[#333]'
              }`}
              onClick={() => {
                setMode('stopwatch');
              }}
            >
              <div
                className={`mb-2 transition-colors duration-200 ${
                  mode === 'stopwatch' ? 'text-[#4a9eff]' : 'text-[#666]'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-18c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm1 5a1 1 0 1 0-2 0v5a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V7z" />
                </svg>
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-200 ${
                  mode === 'stopwatch' ? 'text-white' : 'text-[#888]'
                }`}
              >
                Stopwatch
              </span>
            </button>
            <button
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                mode === 'timer'
                  ? 'bg-[#404040] border-[#555] shadow-lg'
                  : 'bg-[#2a2a2a] border-[#333] hover:bg-[#333]'
              }`}
              onClick={() => {
                setMode('timer');
                setTime(timerHours * 3600 + timerMinutes * 60);
              }}
            >
              <div
                className={`mb-2 transition-colors duration-200 ${
                  mode === 'timer' ? 'text-[#ff9500]' : 'text-[#666]'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-18c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm1 5a1 1 0 1 0-2 0v5a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V7z" />
                </svg>
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-200 ${
                  mode === 'timer' ? 'text-white' : 'text-[#888]'
                }`}
              >
                Timer
              </span>
            </button>
          </div>
          {mode === 'timer' && (
            <div className="border-t border-[#404040] p-4">
              <div className="flex items-center gap-2 justify-center">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={timerHours}
                  onChange={e => {
                    setTimerHours(parseInt(e.target.value) || 0);
                    setTime(
                      (parseInt(e.target.value) || 0) * 3600 + timerMinutes * 60
                    );
                  }}
                  className="w-12 h-8 bg-[#333] border border-[#555] rounded text-center text-white text-sm font-mono"
                />
                <span className="text-xs text-gray-400">h</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timerMinutes}
                  onChange={e => {
                    setTimerMinutes(parseInt(e.target.value) || 0);
                    setTime(
                      timerHours * 3600 + (parseInt(e.target.value) || 0) * 60
                    );
                  }}
                  className="w-12 h-8 bg-[#333] border border-[#555] rounded text-center text-white text-sm font-mono"
                />
                <span className="text-xs text-gray-400">m</span>
                <button
                  onClick={() => {
                    setIsRunning(true);
                    setIsOpen(false);
                  }}
                  className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  Start
                </button>
              </div>
            </div>
          )}
          {mode === 'stopwatch' && (
            <div className="border-t border-[#404040] p-4 text-center">
              <button
                onClick={() => {
                  setIsRunning(true);
                  setIsOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Start Stopwatch
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Timer;
