import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
  title: "Alerta Pública – Chile",
  description: "Radar ciudadano de incidentes y servicios críticos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
