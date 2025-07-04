import { useEffect, useRef, useState } from "react";

type Usuario = {
  id: number;
  username: string;
  email: string;
  dni: string;
  firstname: string;
  lastname: string;
  type: string;
  curso?: string;
  active: boolean;
};

function User() {
  const userRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const dniRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState("Alumno");
  const [msg, setMsg] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modoEdicion, setModoEdicion] = useState<Usuario | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioReset, setUsuarioReset] = useState<Usuario | null>(null);
  const nuevaPassRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    const res = await fetch("http://localhost:8000/users/all", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setUsuarios(data);
  };

  const limpiar = () => {
    if (firstNameRef.current) firstNameRef.current.value = "";
    if (lastNameRef.current) lastNameRef.current.value = "";
    if (dniRef.current) dniRef.current.value = "";
    if (emailRef.current) emailRef.current.value = "";
    if (userRef.current) userRef.current.value = "";
    if (passRef.current) passRef.current.value = "";
    setType("Alumno");
    setModoEdicion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modoEdicion) {
      const datosActualizados = {
        firstname: firstNameRef.current?.value,
        lastname: lastNameRef.current?.value,
        dni: parseInt(dniRef.current?.value || "0"),
        email: emailRef.current?.value,
      };
      const res = await fetch(`http://localhost:8000/users/profile/${modoEdicion.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(datosActualizados),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Usuario actualizado correctamente");
        fetchUsuarios();
        limpiar();
      } else {
        setMsg(data.message || "Error al actualizar");
      }
    } else {
      const nuevo = {
        username: userRef.current?.value,
        password: passRef.current?.value,
        email: emailRef.current?.value,
        dni: parseInt(dniRef.current?.value || "0"),
        firstname: firstNameRef.current?.value,
        lastname: lastNameRef.current?.value,
        type: type,
      };
      const res = await fetch("http://localhost:8000/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(nuevo),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Usuario creado correctamente");
        fetchUsuarios();
        limpiar();
      } else {
        setMsg(data.message || "Error al crear usuario");
      }
    }
  };

  const handleEditar = (u: Usuario) => {
    setModoEdicion(u);
    emailRef.current!.value = u.email;
    firstNameRef.current!.value = u.firstname;
    lastNameRef.current!.value = u.lastname;
    dniRef.current!.value = u.dni;
    userRef.current!.value = u.username;
    setType(u.type);
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Estás seguro que deseas eliminar este usuario?")) return;
    const res = await fetch(`http://localhost:8000/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Usuario eliminado correctamente");
      fetchUsuarios();
    } else {
      setMsg(data.message || "Error al eliminar");
    }
  };

  const handleAbrirReset = (u: Usuario) => {
    setUsuarioReset(u);
    setMsg("");
  };

  const handleConfirmarReset = async () => {
    const nuevaPass = nuevaPassRef.current?.value;
    if (!nuevaPass) {
      setMsg("Ingrese una nueva contraseña");
      return;
    }
    const res = await fetch(`http://localhost:8000/users/reset-password/${usuarioReset?.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        current_password: "",
        new_password: nuevaPass,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Contraseña restablecida correctamente");
      setUsuarioReset(null);
      fetchUsuarios();
    } else {
      setMsg(data.message || "Error al restablecer la contraseña");
    }
  };

  const usuariosFiltrados = usuarios
    .filter((u) => u.type !== "Administrador")
    .filter((u) =>
      u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.firstname.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.lastname.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1)); // Activos primero

  return (
    <div style={{ minHeight: "100vh", background: "", padding: "32px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Formulario */}
        <div style={{ display: "flex", gap: "32px", marginBottom: "32px" }}>
          {/* Columna Izquierda: Formulario */}
          <div style={{ flex: 1, background: "#fff", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", padding: "32px" }}>
            <h2 style={{ textAlign: "center", fontSize: "24px", marginBottom: "24px" }}>
              {modoEdicion ? "Editar usuario" : "Crear usuario"}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
              <input ref={userRef} type="text" placeholder="Username" required disabled={!!modoEdicion} style={inputStyle} />
              {!modoEdicion && <input ref={passRef} type="password" placeholder="Contraseña" required style={inputStyle} />}
              <input ref={emailRef} type="email" placeholder="Email" required style={inputStyle} />
              <input ref={dniRef} type="text" placeholder="DNI" required style={inputStyle} />
              <input ref={firstNameRef} type="text" placeholder="Nombre" required style={inputStyle} />
              <input ref={lastNameRef} type="text" placeholder="Apellido" required style={inputStyle} />
              {!modoEdicion && (
                <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                  <option value="Alumno">Alumno</option>
                  <option value="Administrador">Administrador</option>
                </select>
              )}
              <div style={{ display: "flex", gap: "16px" }}>
                <button type="submit" style={submitButtonStyle}>
                  {modoEdicion ? "Guardar cambios" : "Crear usuario"}
                </button>
                {modoEdicion && (
                  <button type="button" onClick={limpiar} style={cancelButtonStyle}>
                    Cancelar
                  </button>
                )}
              </div>
              {msg && <p style={{ color: "red", textAlign: "center" }}>{msg}</p>}
            </form>
          </div>

          {/* Columna Derecha: Lista de Usuarios */}
          <div style={{
            flex: 1,
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "32px",
            position: "relative"
          }}>
            {/* Slice derecho */}
            <div style={{
              position: "absolute",
              top: "0",
              left: "-16px",
              width: "1px",
              height: "100%",
              background: "#e5e7eb",
            }}></div>

            <h2 style={{ textAlign: "center", fontSize: "24px", marginBottom: "24px" }}>Usuarios registrados</h2>
            <input
              type="text"
              placeholder="Buscar por usuario, email o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={inputStyle}
            />
            <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "16px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f3f4f6" }}>
                  <tr>
                    <th style={tableHeaderStyle}>Usuario</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Nombre completo</th>
                    <th style={tableHeaderStyle}>Tipo</th>
                    <th style={tableHeaderStyle}>Curso</th>
                    <th style={tableHeaderStyle}>Estado</th>
                    <th style={tableHeaderStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id} style={{ background: !u.active ? "#f5f5f5" : "#fff" }}>
                      <td style={tableCellStyle}>{u.username}</td>
                      <td style={tableCellStyle}>{u.email}</td>
                      <td style={tableCellStyle}>{`${u.firstname} ${u.lastname}`}</td>
                      <td style={tableCellStyle}>{u.type}</td>
                      <td style={tableCellStyle}>{u.curso || "Sin curso"}</td>
                      <td style={tableCellStyle}>
                        {u.active ? (
                          <span style={{ background: "#d1fae5", color: "#10b981", padding: "4px 8px", borderRadius: "8px" }}>Activo</span>
                        ) : (
                          <span style={{ background: "#f5f5f5", color: "#6b7280", padding: "4px 8px", borderRadius: "8px" }}>Inactivo</span>
                        )}
                      </td>
                      <td style={tableCellStyle}>
                        <button onMouseEnter={(e) => e.currentTarget.style.background = "#eff6ff"} 
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} 
                                onClick={() => handleEditar(u)} 
                                style={actionButtonStyle}>
                          Editar
                        </button>
                        <button onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"} 
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} 
                                onClick={() => handleEliminar(u.id)} 
                                style={actionButtonStyle}>
                          Eliminar
                        </button>
                        <button onMouseEnter={(e) => e.currentTarget.style.background = "#fef9c3"} 
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} 
                                onClick={() => handleAbrirReset(u)} 
                                style={actionButtonStyle}>
                          Restablecer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal para Restablecer Contraseña */}
        {usuarioReset && (
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
          }}>
            <h3>Restablecer contraseña de <strong>{usuarioReset.username}</strong></h3>
            <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
              <input ref={nuevaPassRef} type="password" placeholder="Nueva contraseña" style={inputStyle} />
              <button onClick={handleConfirmarReset} style={submitButtonStyle}>Confirmar</button>
              <button onClick={() => setUsuarioReset(null)} style={cancelButtonStyle}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos reutilizables
const inputStyle = {
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "16px",
  transition: "border-color 0.2s",
};

const submitButtonStyle = {
  padding: "12px",
  background: "linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  transition: "transform 0.2s",
};

const cancelButtonStyle = {
  padding: "12px",
  background: "#f3f4f6",
  color: "#374151",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  transition: "background 0.2s",
};

const tableHeaderStyle: React.CSSProperties = {
  padding: "12px",
  background: "#f3f4f6",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left", 
  fontSize: "14px",
  fontWeight: "bold",
};

const tableCellStyle = {
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
};

const actionButtonStyle = {
  padding: "8px 12px",
  color: "#3b82f6",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  transition: "background 0.2s",
};

export default User;