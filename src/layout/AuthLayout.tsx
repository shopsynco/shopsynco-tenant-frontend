import bgImage from "../assets/authbackground.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex w-full min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ✅ Top Left Logo */}
      <div className="absolute top-6 left-10 z-10">
        <img src="/logo.svg" alt="ShopSynco" className="w-36" />
      </div>

      

        {/* ✅ Right Section (children from LoginPage) */}
        <div className="w-1/2 flex justify-center">{children}</div>
      </div>
    // </div>
  );
}
