import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner"; // Renamed import for clarity

// Use React.ComponentProps to get the props type from the imported component
type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster // Use the aliased import here
      theme={theme as ToasterProps["theme"]} // Type casting should now work correctly
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
