import { useEffect, useState } from "react";
import { CreditCard, Trash2, Plus } from "lucide-react";

// Tipos
interface Usuario {
  id: number;
  firstname: string;
  lastname: string;
}

interface Curso {
  id: number;
  name: string;
}

interface Pago {
  id: number;
  amount: number;
  fecha_pago: string;
  mes_afectado: string;
  usuario: string;
  carrera: string;
}

const Pagos = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  const [usuarioPago, setUsuarioPago] = useState("");
  const [cursoPago, setCursoPago] = useState("");
  const [monto, setMonto] = useState("");
  const [mesPago, setMesPago] = useState("");

  const mesActual = new Date().toISOString().slice(0, 7);

  const pagosFiltrados = pagos.filter((p) =>
    usuarioPago ? p.usuario?.includes(usuarioPago) : true
  );

  useEffect(() => {
    fetch("http://localhost:8000/users/all", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsuarios(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error al cargar usuarios:", err);
        setUsuarios([]);
      });

    fetch("http://localhost:8000/cursos/all")
      .then((res) => res.json())
      .then((data) => setCursos(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error al cargar cursos:", err);
        setCursos([]);
      });

    fetch("http://localhost:8000/payment/all/detailled")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const pagosFormateados = data.map((p: any) => ({
            id: p.id_pago,
            amount: p.monto,
            fecha_pago: p.fecha_de_pago,
            mes_afectado: p.mes_pagado.slice(0, 7),
            usuario: p.alumno,
            carrera: p.curso_afectado,
          }));
          setPagos(pagosFormateados);
        } else {
          setPagos([]);
        }
      })
      .catch((err) => {
        console.error("Error al cargar pagos:", err);
        setPagos([]);
      });
  }, []);

  const registrarPago = () => {
    if (!usuarioPago || !cursoPago || !monto || !mesPago) {
      alert("Por favor completa todos los campos");
      return;
    }

    const fechaAfectada = `${mesPago}-01`;

    fetch("http://localhost:8000/payment/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: parseInt(usuarioPago),
        curso_id: parseInt(cursoPago),
        amount: parseFloat(monto),
        affect_month: fechaAfectada,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(() => {
        setUsuarioPago("");
        setCursoPago("");
        setMonto("");
        setMesPago("");
        window.location.reload();
      })
      .catch((err) => {
        console.error("Error al registrar pago:", err);
        alert("Error al registrar el pago");
      });
  };

  const eliminarPago = (id: number) => {
    fetch(`http://localhost:8000/payment/delete/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => setPagos(pagos.filter((p) => p.id !== id)));
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-4">
          <CreditCard size={32} className="text-primary mb-2" />
          <h2 className="fw-bold">Gestión de Pagos</h2>
          <p className="text-muted">Administra pagos y cuotas</p>
        </div>

        {/* Sección de Registro */}
        <div className="card shadow-sm p-4 mb-4">
          <div className="d-flex align-items-center mb-3">
            <Plus size={20} className="text-primary me-2" />
            <h4 className="fw-bold text-dark mb-0">Registrar Nuevo Pago</h4>
          </div>
          <form className="mb-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Alumno</label>
                <select
                  className="form-select"
                  value={usuarioPago}
                  onChange={(e) => setUsuarioPago(e.target.value)}
                >
                  <option value="">Seleccionar alumno</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstname} {u.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Curso</label>
                <select
                  className="form-select"
                  value={cursoPago}
                  onChange={(e) => setCursoPago(e.target.value)}
                >
                  <option value="">Seleccionar curso</option>
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Monto</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ej: 150.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Mes</label>
                <input
                  type="month"
                  className="form-control"
                  value={mesPago}
                  onChange={(e) => setMesPago(e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              className="btn btn-success mt-3"
              onClick={registrarPago}
            >
              <Plus size={16} className="me-2" />
              Registrar Pago
            </button>
          </form>
        </div>

        {/* Tabla de Pagos */}
        <div className="card shadow-sm p-4">
          <div className="d-flex align-items-center mb-3">
            <CreditCard size={20} className="text-primary me-2" />
            <h4 className="fw-bold text-dark mb-0">Pagos Registrados</h4>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Alumno</th>
                  <th>Curso</th>
                  <th>Monto</th>
                  <th>Mes</th>
                  <th>Fecha de Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <CreditCard size={48} className="text-muted mb-3" />
                      <h5 className="fw-bold text-secondary">No hay pagos registrados</h5>
                      <p className="text-muted">Registra tu primer pago para comenzar.</p>
                    </td>
                  </tr>
                ) : (
                  pagosFiltrados.map((p) => (
                    <tr key={p.id}>
                      <td>{p.usuario}</td>
                      <td>{p.carrera}</td>
                      <td>${p.amount.toFixed(2)}</td>
                      <td>{p.mes_afectado}</td>
                      <td>{new Date(p.fecha_pago).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => eliminarPago(p.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagos;