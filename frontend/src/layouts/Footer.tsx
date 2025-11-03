// import { useTheme } from "../hooks/useTheme";

export function Footer({children, className = "bg-white"}: {children: React.ReactNode, className?: string}) {
  // const {theme} = useTheme();

  return (
    <footer className={`w-full fixed bottom-0 left-0 right-0 z-10 ${className}`}>
      <div className="container mx-auto">
       {children}
      </div>
    </footer>
  );
}
