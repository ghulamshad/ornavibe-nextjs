import { createTheme } from "@mui/material/styles";

// Gifoy-inspired gift shop theme for Ornavibe storefront
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#ff4f72", // Gifoy pink
    },
    secondary: {
      main: "#9b87f5", // soft violet accent used in hero bg
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
      // Soft section background (e.g. light gray / tint)
      sectionSoft: "#f9fafb",
      // Higher contrast section background (e.g. for highlighted bands)
      sectionContrast: "#fff0f4",
    } as any,
    text: {
      primary: "#1b1b1f",
      secondary: "#666779",
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    h1: {
      fontSize: "2.125rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 700,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "0.875rem",
    },
    body2: {
      fontSize: "0.75rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: "8px 18px",
        },
      },
      defaultProps: {
        disableElevation: true,
      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
            boxShadow: "0 18px 38px rgba(255,79,114,0.45)",
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 18px rgba(15,23,42,0.08)",
        },
      },
    },
  },
});

export default theme;
