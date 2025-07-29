import React from 'react';

const AnimatedStarButton = ({
  onClick,
  children = 'Try Collaborative Workspace',
  className = '',
  bgColor = 'bg-purple-400',
  textColor = 'text-gray-900',
  borderColor = 'border-purple-400',
  hoverTextColor = 'hover:text-purple-400',
  hoverShadow = 'hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]',
  borderRadius = 'rounded-lg',
}) => {
  return (
    <div className={`relative overflow-visible ${className}`}>
      <button
        onClick={onClick}
        className={`group relative px-8 py-3 ${bgColor} ${textColor} text-lg font-medium border-2 ${borderColor} ${borderRadius} shadow-none transition-all duration-300 ease-in-out cursor-pointer hover:bg-transparent ${hoverTextColor} ${hoverShadow} overflow-visible`}
      >
        {children}

        {/* Star 1 */}
        <div className="absolute top-[20%] left-[20%] w-6 h-auto z-[-5] transition-all duration-1000 ease-[cubic-bezier(0.05,0.83,0.43,0.96)] group-hover:top-[-80%] group-hover:left-[-30%] group-hover:z-[2] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 784.11 815.53"
            className="w-full h-full"
          >
            <path
              className="fill-[#fffdef]"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </svg>
        </div>

        {/* Star 2 */}
        <div className="absolute top-[45%] left-[45%] w-4 h-auto z-[-5] transition-all duration-1000 ease-[cubic-bezier(0,0.4,0,1.01)] group-hover:top-[-25%] group-hover:left-[10%] group-hover:z-[2] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 784.11 815.53"
            className="w-full h-full"
          >
            <path
              className="fill-[#fffdef]"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </svg>
        </div>

        {/* Star 3 */}
        <div className="absolute top-[40%] left-[40%] w-[5px] h-auto z-[-5] transition-all duration-1000 ease-[cubic-bezier(0,0.4,0,1.01)] group-hover:top-[55%] group-hover:left-[25%] group-hover:z-[2] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 784.11 815.53"
            className="w-full h-full"
          >
            <path
              className="fill-[#fffdef]"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </svg>
        </div>

        {/* Star 4 */}
        <div className="absolute top-[20%] left-[40%] w-2 h-auto z-[-5] transition-all duration-800 ease-[cubic-bezier(0,0.4,0,1.01)] group-hover:top-[30%] group-hover:left-[80%] group-hover:z-[2] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 784.11 815.53"
            className="w-full h-full"
          >
            <path
              className="fill-[#fffdef]"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </svg>
        </div>

        {/* Star 5 */}
        <div className="absolute top-[25%] left-[45%] w-4 h-auto z-[-5] transition-all duration-600 ease-[cubic-bezier(0,0.4,0,1.01)] group-hover:top-[25%] group-hover:left-[115%] group-hover:z-[2] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 784.11 815.53"
            className="w-full h-full"
          >
            <path
              className="fill-[#fffdef]"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </svg>
        </div>

        {/* Star 6 */}
        <div className="absolute top-[5%] left-[50%] w-[5px] h-auto z-[-5] transition-all duration-800 ease-in-out group-hover:top-[5%] group-hover:left-[60%] group-hover:z-[2] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 784.11 815.53"
            className="w-full h-full"
          >
            <path
              className="fill-[#fffdef]"
              d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
            />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default AnimatedStarButton;
