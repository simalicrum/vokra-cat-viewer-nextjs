export default function Header() {
  return (
    <header
      className="flex w-full justify-center items-center"
      style={{
        height: "112px",
      }}
    >
      <div
        className="flex justify-between items-center px-4"
        style={{ width: "1200px" }}
      >
        <a href="https://www.vokra.ca">
          <img
            className=""
            style={{
              maxWidth: "197px",
              width: "100%",
            }}
            src="/20160408_VOKRA_workmark_black_PNG.png"
          />
        </a>
      </div>
    </header>
  );
}
