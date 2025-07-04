import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, Link, GraduationCap, Users, BookMarked } from "lucide-react";

type Carrera = {
  id: number;
  name: string;
};
type Curso = {
  id: number;
  name: string;
  user_id?: number;
  career_id?: number;
};
type Asignacion = {
  id: number;
  curso_id: number;
  curso_nombre: string;
  carrera_id: number;
  carrera_nombre: string;
};

const GestionAcademica = () => {
  const [activeTab, setActiveTab] = useState("materias_cursos");
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [nuevaCarrera, setNuevaCarrera] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoNombre, setCursoNombre] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [careerId, setCareerId] = useState("");
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

  useEffect(() => {
    fetchCarreras();
    fetchCursos();
    fetchAsignaciones();
  }, []);

  const fetchCarreras = async () => {
    const res = await fetch("http://localhost:8000/careers/all");
    const data = await res.json();
    setCarreras(data);
  };

  const fetchCursos = async () => {
    const res = await fetch("http://localhost:8000/cursos/all");
    const data = await res.json();
    setCursos(data);
  };

  const fetchAsignaciones = async () => {
    const res = await fetch("http://localhost:8000/asignaciones/all");
    const data = await res.json();
    setAsignaciones(data);
  };

  const crearCarrera = async () => {
    if (!nuevaCarrera.trim()) return;
    await fetch("http://localhost:8000/careers/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nuevaCarrera }),
    });
    setNuevaCarrera("");
    fetchCarreras();
  };

  const eliminarCarrera = async (id: number) => {
    await fetch(`http://localhost:8000/careers/${id}`, { method: "DELETE" });
    fetchCarreras();
  };

  const crearCurso = async () => {
    if (!cursoNombre.trim()) return;
    await fetch("http://localhost:8000/curso/AddCurso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cursoNombre }),
    });
    setCursoNombre("");
    fetchCursos();
  };

  const eliminarCurso = async (id: number) => {
    await fetch(`http://localhost:8000/curso/delete/${id}`, { method: "DELETE" });
    fetchCursos();
  };

  const asignarCarreraACurso = async () => {
    if (!cursoSeleccionado || !careerId) return;
    await fetch("http://localhost:8000/asignaciones/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ curso_id: parseInt(cursoSeleccionado), career_id: parseInt(careerId) }),
    });
    setCursoSeleccionado("");
    setCareerId("");
    fetchAsignaciones();
  };

  const eliminarAsignacion = async (id: number) => {
    await fetch(`http://localhost:8000/asignaciones/${id}`, { method: "DELETE" });
    fetchAsignaciones();
  };

  const renderMateriasCursos = () => (
    <div className="d-flex flex-column gap-4">
      {/* Gestión de Cursos */}
      <div className="card shadow-sm p-4">
        <div className="d-flex align-items-center mb-3">
          <BookOpen size={18} className="text-primary me-2" />
          <h4 className="fw-bold text-dark mb-0">Gestión de Cursos</h4>
        </div>
        <form className="mb-3">
          <div className="row g-2">
            <div className="col-md-12">
              <label className="form-label">Nombre del Curso</label>
              <input
                type="text"
                className="form-control"
                placeholder="agregar curso"
                value={cursoNombre}
                onChange={(e) => setCursoNombre(e.target.value)}
              />
            </div>
          </div>
          <button type="button" className="btn btn-success mt-3" onClick={crearCurso}>
            <Plus size={16} className="me-2" /> Crear Curso
          </button>
        </form>
        <div className="list-group">
          {cursos.length === 0 ? (
            <div className="text-center py-4">
              <Users size={36} className="text-muted mb-3" />
              <h5 className="fw-bold text-secondary">No hay cursos registrados</h5>
              <p className="text-muted">Crea tu primer curso para comenzar.</p>
            </div>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
              {cursos.map((curso) => (
                <div key={curso.id} className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
                  <p className="fw-bold mb-0">{curso.name}</p>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => eliminarCurso(curso.id)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "red")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Gestión de Materias */}
      <div className="card shadow-sm p-4">
        <div className="d-flex align-items-center mb-3">
          <GraduationCap size={18} className="text-primary me-2" />
          <h4 className="fw-bold text-dark mb-0">Gestión de Materias</h4>
        </div>
        <form className="mb-3">
          <div className="row g-2">
            <div className="col-md-12">
              <label className="form-label">Nueva Materia</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre de la materia"
                value={nuevaCarrera}
                onChange={(e) => setNuevaCarrera(e.target.value)}
              />
            </div>
          </div>
          <button type="button" className="btn btn-success mt-3" onClick={crearCarrera}>
            <Plus size={16} className="me-2" /> Crear Materia
          </button>
        </form>
        <div className="list-group">
          {carreras.length === 0 ? (
            <div className="text-center py-4">
              <BookMarked size={36} className="text-muted mb-3" />
              <h5 className="fw-bold text-secondary">No hay materias registradas</h5>
              <p className="text-muted">Comienza creando tu primera materia.</p>
            </div>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
              {carreras.map((carrera) => (
                <div key={carrera.id} className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
                  <p className="fw-bold mb-0">{carrera.name}</p>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => eliminarCarrera(carrera.id)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "red")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAsignaciones = () => {
    const agrupadas = asignaciones.reduce((acc, asignacion) => {
      const cursoId = asignacion.curso_id;
      if (!acc[cursoId]) {
        acc[cursoId] = { curso_nombre: asignacion.curso_nombre, materias: [] };
      }
      acc[cursoId].materias.push({
        id: asignacion.id,
        carrera_id: asignacion.carrera_id,
        carrera_nombre: asignacion.carrera_nombre,
      });
      return acc;
    }, {} as Record<number, { curso_nombre: string; materias: Array<{ id: number; carrera_id: number; carrera_nombre: string }> }>);

    return (
      <div className="card shadow-sm p-4">
        <div className="d-flex align-items-center mb-3">
          <Link size={18} className="text-primary me-2" />
          <h4 className="fw-bold text-dark mb-0">Asignación de Materias a Cursos</h4>
        </div>
        <form className="mb-3">
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label">Seleccionar Curso</label>
              <select className="form-select" value={cursoSeleccionado} onChange={(e) => setCursoSeleccionado(e.target.value)}>
                <option value="">Elegir curso</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Seleccionar Materia</label>
              <select className="form-select" value={careerId} onChange={(e) => setCareerId(e.target.value)}>
                <option value="">Elegir materia</option>
                {carreras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className="btn btn-success mt-3" onClick={asignarCarreraACurso}>
            <Link size={16} className="me-2" /> Asignar Materia
          </button>
        </form>
        <div className="list-group">
          {Object.keys(agrupadas).length === 0 ? (
            <div className="text-center py-4">
              <Link size={36} className="text-muted mb-3" />
              <h5 className="fw-bold text-secondary">No hay asignaciones registradas</h5>
              <p className="text-muted">Asigna materias a cursos para comenzar.</p>
            </div>
          ) : (
            Object.entries(agrupadas).map(([cursoId, grupo]) => (
              <div key={cursoId} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="fw-bold mb-0">📚 {grupo.curso_nombre}</p>
                    <small className="text-muted">
                      {grupo.materias.length} materia{grupo.materias.length !== 1 ? "s" : ""} asignada
                      {grupo.materias.length !== 1 ? "s" : ""}
                    </small>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {grupo.materias.map((materia) => (
                    <div key={materia.id} className="badge bg-primary d-flex align-items-center gap-2">
                      <span>{materia.carrera_nombre}</span>
                      <button
                        type="button"
                        className="btn-close btn-close-white p-1"
                        onClick={() => eliminarAsignacion(materia.id)}
                        title="Eliminar asignación"
                      ></button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        <ul className="nav nav-pills justify-content-center mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "materias_cursos" ? "active" : ""}`}
              onClick={() => setActiveTab("materias_cursos")}
            >
              📚 Materias y Cursos
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "asignaciones" ? "active" : ""}`}
              onClick={() => setActiveTab("asignaciones")}
            >
              🔗 Asignaciones
            </button>
          </li>
        </ul>
        {activeTab === "materias_cursos" && renderMateriasCursos()}
        {activeTab === "asignaciones" && renderAsignaciones()}
      </div>
    </div>
  );
};

export default GestionAcademica;