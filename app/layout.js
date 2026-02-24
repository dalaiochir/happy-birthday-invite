import "./globals.css";

export const metadata = {
  title: "🎉 Төрсөн өдрийн урилга 🎉",
  description: "Хөгжилтэй төрсөн өдрийн урилга",
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}