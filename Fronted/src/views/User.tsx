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
    <div className="container-fluid p-4">
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-4 h-100">
            <h2 className="text-center mb-3 fs-5">{modoEdicion ? "Editar usuario" : "Crear usuario"}</h2>
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <input ref={userRef} type="text" className="form-control" placeholder="Username" required disabled={modoEdicion !== null} />
              </div>
              {!modoEdicion && (
                <div className="col-md-6">
                  <input ref={passRef} type="password" className="form-control" placeholder="Contraseña" required />
                </div>
              )}
              <div className="col-md-6">
                <input ref={emailRef} type="email" className="form-control" placeholder="Email" required />
              </div>
              <div className="col-md-6">
                <input ref={dniRef} type="text" className="form-control" placeholder="DNI" required />
              </div>
              <div className="col-md-6">
                <input ref={firstNameRef} type="text" className="form-control" placeholder="Nombre" required />
              </div>
              <div className="col-md-6">
                <input ref={lastNameRef} type="text" className="form-control" placeholder="Apellido" required />
              </div>
              {!modoEdicion && (
                <div className="col-md-12">
                  <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Alumno">Alumno</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              )}
              <div className="col-12 d-flex justify-content-between">
                <button type="submit" className="btn btn-success w-100 me-2">
                  {modoEdicion ? "Guardar cambios" : "Crear usuario"}
                </button>
                {modoEdicion && (
                  <button type="button" onClick={() => limpiar()} className="btn btn-secondary w-100">
                    Cancelar
                  </button>
                )}
              </div>
              <div className="col-12 text-danger">{msg}</div>
            </form>
          </div>
        </div>


        <div className="col-md-6">
          <div className="card shadow-sm p-4 h-100">
            <h2 className="text-center mb-3 fs-5">Usuarios registrados</h2>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por usuario, email o nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Nombre completo</th>
                  <th>Tipo</th>
                  <th>Curso</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className={!u.active ? "table-danger" : ""}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{`${u.firstname} ${u.lastname}`}</td>
                    <td>{u.type}</td>
                    <td>{u.curso || "Sin curso"}</td>
                    <td>
                      {u.active ? (
                        <span className="badge bg-success">Activo</span>
                      ) : (
                        <span className="badge bg-secondary">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <button onClick={() => handleEditar(u)} className="btn btn-success btn-sm me-2" disabled={!u.active}>
                        Editar
                      </button>
                      <button onClick={() => handleEliminar(u.id)} className="btn btn-danger btn-sm me-2" disabled={!u.active}>
                        Eliminar
                      </button>
                      <button onClick={() => handleAbrirReset(u)} className="btn btn-warning btn-sm" disabled={!u.active}>
                        Restablecer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>


            {usuarioReset && (
              <div className="card mt-4 p-3 shadow-sm">
                <h5>Restablecer contraseña de <strong>{usuarioReset.username}</strong></h5>
                <div className="row g-3 align-items-center">
                  <div className="col-auto">
                    <input ref={nuevaPassRef} type="password" className="form-control" placeholder="Nueva contraseña" />
                  </div>
                  <div className="col-auto">
                    <button onClick={handleConfirmarReset} className="btn btn-success">
                      Confirmar
                    </button>
                    <button onClick={() => setUsuarioReset(null)} className="btn btn-secondary ms-2">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}


            <div className="mt-3 text-danger">{msg}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default User;