import { useEffect, useState } from "react";
import { Users, BookOpen, Plus } from "lucide-react";

type Alumno = {
  id: number;
  username: string;
  email: string;
  dni: string;
  firstname: string;
  lastname: string;
  type: string;
};

type Curso = {
  id: number;
  name: string;
  status: string;
};

const Inscripciones = () => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [selectedAlumno, setSelectedAlumno] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/users/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const soloAlumnos = data.filter((user: Alumno) =>
            user.type.toLowerCase().includes("alumno")
          );
          setAlumnos(soloAlumnos);
        } else {
          console.error("Error al cargar alumnos:", await res.text());
        }
      } catch (error) {
        console.error("Error al cargar alumnos:", error);
      }
    };

    const cargarCursos = async () => {
      try {
        const res = await fetch("http://localhost:8000/cursos/all");
        if (res.ok) {
          const data = await res.json();
          setCursos(data);
        } else {
          console.error("Error al cargar cursos:", await res.text());
        }
      } catch (error) {
        console.error("Error al cargar cursos:", error);
      }
    };

    cargarAlumnos();
    cargarCursos();
  }, []);

  const handleInscribir = async () => {
    if (!selectedAlumno || !selectedCurso) {
      setMessage("Por favor selecciona un alumno y un curso");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/user/addcurso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_user: parseInt(selectedAlumno),
          id_curso: parseInt(selectedCurso),
        }),
      });

      if (res.ok) {
        const responseText = await res.text();
        setMessage(responseText);
        setSelectedAlumno("");
        setSelectedCurso("");
      } else {
        const errorData = await res.json();
        setMessage(errorData.detail || "Error al inscribir alumno");
      }
    } catch (error) {
      setMessage("Error de conexión con el servidor");
      console.error("Error al inscribir:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-4">
          <BookOpen size={32} className="text-primary mb-2" />
          <h2 className="fw-bold">Inscripciones</h2>
          <p className="text-muted">Asigna alumnos a Cursos</p>
        </div>

        {/* Sección de Nueva Inscripción */}
        <div className="card shadow-sm p-4 mb-4">
          <div className="d-flex align-items-center mb-3">
            <Plus size={20} className="text-primary me-2" />
            <h4 className="fw-bold text-dark mb-0">Nueva Inscripción</h4>
          </div>
          <form className="mb-3">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Seleccionar Alumno</label>
                <select
                  className="form-select"
                  value={selectedAlumno}
                  onChange={(e) => setSelectedAlumno(e.target.value)}
                >
                  <option value="">Seleccionar alumno...</option>
                  {alumnos.map((alumno) => (
                    <option key={alumno.id} value={alumno.id}>
                      {alumno.firstname} {alumno.lastname} - DNI: {alumno.dni}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Seleccionar Curso</label>
                <select
                  className="form-select"
                  value={selectedCurso}
                  onChange={(e) => setSelectedCurso(e.target.value)}
                >
                  <option value="">Seleccionar curso...</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-success mt-3"
              onClick={handleInscribir}
              disabled={loading}
            >
              <Plus size={16} className="me-2" />
              {loading ? "Inscribiendo..." : "Inscribir Alumno"}
            </button>
          </form>
          {message && (
            <div
              className={`alert ${
                message.toLowerCase().includes("error") ? "alert-danger" : "alert-success"
              } mt-3`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Sección de Estado de Carga */}
        <div className="card shadow-sm p-4">
          <div className="d-flex align-items-center mb-3">
            <Users size={20} className="text-primary me-2" />
            <h4 className="fw-bold text-dark mb-0">Estado de Carga</h4>
          </div>
          <div className="row">
            <div className="col-md-6">
              <p className="text-muted mb-0">
                <strong>Alumnos cargados:</strong> {alumnos.length}
              </p>
            </div>
            <div className="col-md-6">
              <p className="text-muted mb-0">
                <strong>Cursos disponibles:</strong> {cursos.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscripciones;