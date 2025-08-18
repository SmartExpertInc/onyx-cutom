export default function Script() {
  return (
    <div className="h-full bg-white border-gray-300 rounded-md relative overflow-hidden w-full">
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-start justify-start px-4 py-8 md:py-16 lg:py-24">

        {/* Top Section with Avatar and Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16 w-full">
          {/* Avatar Image */}
          <div className="relative flex-shrink-0">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/56233caf01f230cefc02bb883b9bb2e1c7a46208?width=160"
              alt="Avatar"
              className="w-16 h-8 sm:w-20 sm:h-11 rounded-[11px] object-cover"
            />
            {/* Counter Badge */}
            <div className="absolute -top-1 -right-1 bg-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-sm border border-gray-100">
              <span className="text-[#585858] text-sm font-medium">2</span>
            </div>
            {/* Small Avatar Overlay */}
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/25754df26bea4537d5d743978026d0a6812e4ed7?width=72"
              alt="Small avatar"
              className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-7 h-7 sm:w-9 sm:h-9 rounded-[8.75px] object-cover"
            />
          </div>

          {/* Language/User Selector */}
          <div className="relative w-full sm:w-auto">
            <div className="bg-[#FDFDFD] border border-[#E0E0E0] rounded-[10px_9px_6px_7px] px-3 py-2 sm:px-4 sm:py-3 shadow-sm w-full sm:w-auto min-w-[160px]">
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/ad3b604e583b1053aaa9cb6aa8eae3d12ad5b9be?width=40"
                  alt="Flag"
                  className="w-4 h-4 sm:w-5 sm:h-5 object-cover flex-shrink-0"
                />
                <span className="text-[#626262] text-sm font-medium truncate">US-Leesa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Text */}
        <div className="w-full max-w-[615px] lg:max-w-[650px]">
          <p className="text-[#5F5F5F] text-sm leading-relaxed font-normal">
            Create dynamic, powerful and informative videos with an
            avatar as your host. Instantly translate your video into over
            eighty languages, use engaging media to grab your
            audiences attention, or even simulate conversations between
            multiple avatars. All with an intuitive interface that anyone
            can use!
          </p>
        </div>
      </div>
    </div>
  );
}