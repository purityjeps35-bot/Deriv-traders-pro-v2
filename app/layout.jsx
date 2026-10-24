
export const metadata = {
  title: "DerivTraders Pro",
  description: "Live Deriv market data and digit analysis dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        background: "#0b1120",
        color: "#f8fafc"
      }}>
        {children}
      </body>
    </html>
  );
}
