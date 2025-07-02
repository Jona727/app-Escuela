import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.firstName || "Usuario";
  const userType = user.type || "Alumno";

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mainStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #eff6ff, #f5f3ff)',
    padding: isMobile ? '20px' : '40px',
    fontFamily: 'Arial, sans-serif',
  };

  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: 'bold',
    color: '',//cambie a color
    marginBottom: '20px',
  };

  const gridContainer: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', // Proporción 2:1 en pantallas grandes
    gap: '40px',
  };

  const welcomeCard: React.CSSProperties = {
    background: 'white',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Centra todo el contenido horizontalmente
    textAlign: 'center', // Alinea el texto al centro
    padding: isMobile ? '24px' : '40px',
  };

  const profileCircle: React.CSSProperties = {
    width: isMobile ? '60px' : '80px',
    height: isMobile ? '60px' : '80px',
    borderRadius: '9999px',
    background: 'linear-gradient(to right, rgb(8, 8, 8), rgb(0, 0, 0))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: isMobile ? '20px' : '24px',
    marginTop: '20px', // Espacio entre el texto y el círculo
  };

  const motivationCard: React.CSSProperties = {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(6px)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
  };

  const gradientText: React.CSSProperties = {
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
    background: 'linear-gradient(to right,rgb(2, 2, 2),rgb(7, 3, 10))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const motivationText: React.CSSProperties = {
    fontSize: isMobile ? '16px' : '18px',
    color: '#4b5563',
    maxWidth: '600px',
    margin: '0 auto',
  };

  return (
    <div style={mainStyle}>
      {/* Título Principal */}
      <h1 style={titleStyle}>Sistema de Gestión Educativa</h1>

      {/* Contenedor de la Cuadrícula */}
      <div style={gridContainer}>
        {/* Tarjeta de Bienvenida (2/3 de la pantalla) */}
        <div style={welcomeCard}>
          <h2 style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: 'bold', marginBottom: '12px' }}>
            ¡Bienvenido, {userName}!
          </h2>
          <p style={{ fontSize: isMobile ? '18px' : '20px', opacity: 0.9, marginBottom: '20px' }}>
            Tipo de usuario: {userType}
          </p>
          <div style={profileCircle}>
            <GraduationCap size={isMobile ? 30 : 40} color="white" />
          </div>
        </div>

        {/* Tarjeta de Motivación (1/3 de la pantalla) */}
        <div style={motivationCard}>
          <h3 style={gradientText}>Tu centro de control educativo</h3>
          <p style={motivationText}>
            Utiliza el menú de navegación para acceder a todas las herramientas y funcionalidades
            que necesitas para administrar eficientemente tu institución educativa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;