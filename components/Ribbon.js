export default function Ribbon({ children }) {
  return (
    <div className="absolute z-10 top-4 -left-2 bg-vokra-light shadow w-64 h-14">
      <div className="w-2 -left-0 top-14 overflow-hidden absolute">
        <div className=" h-3 bg-gray-700 -rotate-45 transform origin-top-left" />
      </div>
      <div className="w-14 left-64 top-4 overflow-hidden absolute">
        <div className=" h-10 bg-vokra-light rotate-45 transform origin-top-left" />
      </div>
      <div className="w-14 left-64 top-0 overflow-hidden absolute">
        <div className=" h-10 bg-vokra-light -rotate-45 transform origin-bottom-left" />
      </div>
      <div className="flex items-center justify-center h-full w-full">
        <div className="font-bold text-2xl text-white font-special">
          {children}
        </div>
      </div>
    </div>
  );
}
