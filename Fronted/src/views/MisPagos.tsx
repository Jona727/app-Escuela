import { useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface Pago {
  id: number;
  amount: number;
  fecha_pago: string;
  mes_afectado: string;
  curso: string;
}

const MisPagos = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [estadoCuenta, setEstadoCuenta] = useState("Cargando...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    try {
      if (!loading) setIsRefreshing(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }
      const decoded: any = jwtDecode(token);
      const username = decoded?.username;
      if (!username) {
        throw new Error("Token inválido - no se encontró username");
      }
      const response = await fetch(`http://localhost:8000/payment/user/${username}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Token de autenticación inválido o expirado");
        }
        if (response.status === 404) {
          throw new Error("No se encontraron pagos para este usuario");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data: any[] = await response.json();
      const pagosFormateados = data.map((p) => ({
        id: p.id,
        amount: p.amount,
        fecha_pago: p.fecha_pago,
        mes_afectado: p.mes_afectado.slice(0, 7),
        curso: p.curso,
      }));
      setPagos(pagosFormateados);
      const yaPagoEsteMes = pagosFormateados.some((p) => p.mes_afectado === mesActual);
      setEstadoCuenta(yaPagoEsteMes ? "Al día" : "Pendiente");
    } catch (err) {
      console.error("Error al obtener pagos:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar los pagos";
      setError(errorMessage);
      setPagos([]);
      setEstadoCuenta("Error al cargar");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getEstadoCardStyle = () => {
    switch (estadoCuenta) {
      case "Al día":
        return "bg-success text-white";
      case "Pendiente":
        return "bg-warning text-dark";
      case "Error al cargar":
      case "No autenticado":
      case "Token inválido":
        return "bg-danger text-white";
      default:
        return "bg-light";
    }
  };

  const getEstadoIcon = () => {
    switch (estadoCuenta) {
      case "Al día":
        return <CheckCircle size={24} className="text-white" />;
      case "Pendiente":
        return <AlertCircle size={24} className="text-dark" />;
      case "Error al cargar":
      case "No autenticado":
      case "Token inválido":
        return <XCircle size={24} className="text-white" />;
      default:
        return <DollarSign size={24} className="text-muted" />;
    }
  };

  const getPagosStats = () => {
    const ultimoPago =
      pagos.length > 0
        ? new Date(
            Math.max(...pagos.map((p) => new Date(p.fecha_pago).getTime()))
          ).toLocaleDateString()
        : "N/A";
    return {
      ultimoPago,
    };
  };

  const formatearMes = (mesAfectado: string) => {
    const [year, month] = mesAfectado.split("-");
    const fecha = new Date(parseInt(year), parseInt(month) - 1);
    return fecha.toLocaleDateString("es-ES", { year: "numeric", month: "long" });
  };

  const esDelMesActual = (mesAfectado: string) => {
    return mesAfectado === mesActual;
  };

  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 py-4">
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Cargando tus pagos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid bg-light min-vh-100 py-4">
        <div className="container">
          <div className="alert alert-danger text-center">
            <h4 className="alert-heading">Error al cargar la información</h4>
            <p>{error}</p>
            <button onClick={fetchPagos} className="btn btn-primary">
              <RefreshCw size={16} className="me-2" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getPagosStats();

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        {/* Tarjetas Estado de Cuenta y Último Pago */}
        <div className="row g-4 mb-4">
          {/* Estado de Cuenta */}
          <div className="col-md-9">
            <div
              className={`d-flex align-items-center justify-content-between px-3 py-2 rounded shadow-sm h-100 ${getEstadoCardStyle()}`}
            >
              <div>
                <h6 className="fw-bold mb-0">{estadoCuenta}</h6>
                <small className="text-muted">
                  {estadoCuenta === "Al día"
                    ? "Tus pagos están al corriente"
                    : estadoCuenta === "Pendiente"
                    ? "Tienes pagos pendientes"
                    : "Verifica tu información"}
                </small>
              </div>
              {getEstadoIcon()}
            </div>
          </div>

          {/* Último Pago */}
          <div className="col-md-3">
            <div className="d-flex flex-column justify-content-center h-100 px-3 py-2 rounded shadow-sm bg-white">
              <Calendar size={20} className="text-primary mb-2" />
              <h5 className="fw-bold">{stats.ultimoPago}</h5>
              <p className="text-muted mb-0">Último Pago</p>
            </div>
          </div>
        </div>

        {/* Historial de Pagos */}
        <div className="card shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <DollarSign size={20} className="text-primary me-2" />
              <h4 className="fw-bold mb-0">Historial de Pagos</h4>
            </div>
          </div>
          {pagos.length > 0 ? (
              <div style={{ maxHeight: "400px", overflowY: "scroll", border: "1px solid #ddd", borderRadius: "8px" }}>
              <table className="table table-striped table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Mes Afectado</th>
                    <th>Curso</th>
                    <th>Monto</th>
                    <th>Fecha de Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos
                    .sort(
                      (a, b) =>
                        new Date(b.fecha_pago).getTime() -
                        new Date(a.fecha_pago).getTime()
                    )
                    .map((pago) => (
                      <tr key={pago.id}>
                        <td>
                          {formatearMes(pago.mes_afectado)}
                          {esDelMesActual(pago.mes_afectado) && (
                            <span className="badge bg-primary ms-2">Mes actual</span>
                          )}
                        </td>
                        <td>{pago.curso}</td>
                        <td>${pago.amount.toLocaleString()}</td>
                        <td>
                          {new Date(pago.fecha_pago).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <CreditCard size={48} className="text-muted mb-3" />
              <h5 className="fw-bold text-secondary">No hay pagos registrados</h5>
              <p className="text-muted">
                Aún no tienes pagos registrados en el sistema.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisPagos;