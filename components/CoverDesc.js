export default function CoverDesc({ children }) {
  return (
    <p className="text-gray-500 block-ellipsis text-base h-12 px-4 md:p-0">
      {children}
    </p>
  );
}
