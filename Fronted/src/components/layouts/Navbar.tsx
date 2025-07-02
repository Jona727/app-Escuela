import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, Menu } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.firstName || "Usuario";
  const userType = user?.type || "Alumno";
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isSmallScreen);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#ffffff",
        padding: "10px 20px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Logo e Ícono */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "linear-gradient(to right, #7c3aed, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GraduationCap color="white" size={20} />
        </div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Instituto Mariano Moreno
        </h1>
      </div>

      {/* Barra de Navegación Normal (Visible en Pantallas Grandes) */}
      {!isMobile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: isActive ? "#06b6d4" : "#333",
              fontWeight: isActive ? "bold" : "normal",
            })}
          >
            Inicio
          </NavLink>
          <NavLink
            to="/profile"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: isActive ? "#06b6d4" : "#333",
              fontWeight: isActive ? "bold" : "normal",
            })}
          >
            Perfil
          </NavLink>
          {userType === "Alumno" && (
            <>
              <NavLink
                to="/MiCursada"
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: isActive ? "#06b6d4" : "#333",
                  fontWeight: isActive ? "bold" : "normal",
                })}
              >
                Curso
              </NavLink>
              <NavLink
                to="/MisPagos"
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: isActive ? "#06b6d4" : "#333",
                  fontWeight: isActive ? "bold" : "normal",
                })}
              >
                Pagos
              </NavLink>
            </>
          )}
          {userType === "Administrador" && (
            <>
              <NavLink
                to="/user"
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: isActive ? "#06b6d4" : "#333",
                  fontWeight: isActive ? "bold" : "normal",
                })}
              >
                Usuarios
              </NavLink>
              <NavLink
                to="/GestionAcademica"
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: isActive ? "#06b6d4" : "#333",
                  fontWeight: isActive ? "bold" : "normal",
                })}
              >
                Gestión Académica
              </NavLink>
              <NavLink
                to="/pagos"
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: isActive ? "#06b6d4" : "#333",
                  fontWeight: isActive ? "bold" : "normal",
                })}
              >
                Pagos
              </NavLink>
              <NavLink
                to="/inscripciones"
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: isActive ? "#06b6d4" : "#333",
                  fontWeight: isActive ? "bold" : "normal",
                })}
              >
                Inscripciones
              </NavLink>
            </>
          )}
          {/* Botón de Logout */}
          <button
            onClick={handleLogout}
            style={{
              background: "#ff4d4d",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "background 0.3s ease",
            }}
          >
            <LogOut size={16} style={{ marginRight: "8px" }} />
            Cerrar Cesion
          </button>
        </div>
      )}

      {/* Botón de Hamburguesa (Siempre Visible en Pantallas Pequeñas) */}
      {isMobile && (
        <div
          style={{
            width: "30px",
            height: "24px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 20,
          }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span
            style={{
              display: "block",
              width: "100%",
              height: "3px",
              background: "#333",
              borderRadius: "3px",
            }}
          ></span>
          <span
            style={{
              display: "block",
              width: "100%",
              height: "3px",
              background: "#333",
              borderRadius: "3px",
            }}
          ></span>
          <span
            style={{
              display: "block",
              width: "100%",
              height: "3px",
              background: "#333",
              borderRadius: "3px",
            }}
          ></span>
        </div>
      )}

      {/* Menú Desplegable (Visible Solo en Pantallas Pequeñas) */}
      {isMobile && isMenuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: "0",
            right: "0",
            width: "33.33%",
            height: "100vh",
            background: "#ffffff",
            padding: "20px",
            boxShadow: "-4px 0 6px rgba(0, 0, 0, 0.1)",
            zIndex: 15,
            transition: "transform 0.3s ease",
            transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
          }}
        >
          {/* Información del Usuario */}
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "5px",
              }}
            >
              {userName}
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                marginBottom: "10px",
              }}
            >
              {userType}
            </p>
          </div>
          {/* Enlaces de Navegación */}
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <li>
              <NavLink
                to="/dashboard"
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: isActive ? "#06b6d4" : "#333",
                  fontWeight: isActive ? "bold" : "normal",
                })}
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: isActive ? "#06b6d4" : "#333",
                  fontWeight: isActive ? "bold" : "normal",
                })}
                onClick={() => setIsMenuOpen(false)}
              >
                Perfil
              </NavLink>
            </li>
            {userType === "Alumno" && (
              <>
                <li>
                  <NavLink
                    to="/MiCursada"
                    style={({ isActive }) => ({
                      textDecoration: "none",
                      color: isActive ? "#06b6d4" : "#333",
                      fontWeight: isActive ? "bold" : "normal",
                    })}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Curso
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/MisPagos"
                    style={({ isActive }) => ({
                      textDecoration: "none",
                      color: isActive ? "#06b6d4" : "#333",
                      fontWeight: isActive ? "bold" : "normal",
                    })}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pagos
                  </NavLink>
                </li>
              </>
            )}
            {userType === "Administrador" && (
              <>
                <li>
                  <NavLink
                    to="/user"
                    style={({ isActive }) => ({
                      textDecoration: "none",
                      color: isActive ? "#06b6d4" : "#333",
                      fontWeight: isActive ? "bold" : "normal",
                    })}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Usuarios
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/GestionAcademica"
                    style={({ isActive }) => ({
                      textDecoration: "none",
                      color: isActive ? "#06b6d4" : "#333",
                      fontWeight: isActive ? "bold" : "normal",
                    })}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Gestión Académica
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/pagos"
                    style={({ isActive }) => ({
                      textDecoration: "none",
                      color: isActive ? "#06b6d4" : "#333",
                      fontWeight: isActive ? "bold" : "normal",
                    })}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pagos
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/inscripciones"
                    style={({ isActive }) => ({
                      textDecoration: "none",
                      color: isActive ? "#06b6d4" : "#333",
                      fontWeight: isActive ? "bold" : "normal",
                    })}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inscripciones
                  </NavLink>
                </li>
              </>
            )}
          </ul>
          {/* Botón de Logout */}
          <button
            onClick={handleLogout}
            style={{
              background: "#ff4d4d",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
              marginTop: "20px",
              transition: "background 0.3s ease",
            }}
          >
            <LogOut size={16} style={{ marginRight: "8px" }} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;