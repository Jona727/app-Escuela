import { useEffect, useState } from "react";
import { User, Camera, Mail, CreditCard, UserCheck } from "lucide-react";

type UserProfile = {
  id: number;
  user_id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  dni: number;
  type: string;
  profile_picture?: string;
};
//#region LOGICA
export default function PerfilConCambioClave() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      console.error("No se encontró usuario en localStorage");
      return;
    }
    const userParsed: UserProfile = JSON.parse(storedUser);
    const BACKEND_URL = `http://localhost:8000/users/profile/${userParsed.user_id}`;
    fetch(BACKEND_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setUser(data.user);
          setProfilePicture(data.user.profile_picture || "");
        }
      })
      .catch((err) => console.error("Error al traer perfil", err));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (newPassword !== confirmPassword) {
      setMessage("Las nuevas contraseñas no coinciden");
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setMessage("La nueva contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Contraseña cambiada correctamente");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      setMessage("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  };

  const getBadgeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "admin":
        return "bg-danger text-white";
      case "moderator":
        return "bg-primary text-white";
      case "user":
        return "bg-success text-white";
      default:
        return "bg-secondary text-white";
    }
  };
//#endregion

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span className="ms-2">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-muted">Gestiona tu información personal y configuración de seguridad</p>
        </div>

        {/* Grid Layout */}
        <div className="row">
          {/* Columna Izquierda */}
          <div className="col-lg-4">
            <div className="card shadow-sm p-4 text-center">
              <div className="position-relative">
                <div className="mb-3">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Foto de perfil"
                      className="rounded-circle img-thumbnail border border-white shadow-sm"
                      style={{ width: "128px", height: "128px" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "128px",
                        height: "128px",
                        background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                      }}
                    >
                      <span className="text-white fs-3 fw-bold">
                        {getInitials(user.firstname, user.lastname)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <h2 className="fw-bold text-dark">{`${user.firstname} ${user.lastname}`}</h2>
              <p className="text-muted">@{user.username}</p>
              <span className={`badge ${getBadgeStyle(user.type)}`}>
                <UserCheck size={16} className="me-1" />
                {user.type}
              </span>
              {/* Enlace para abrir el formulario */}
              {!showChangePasswordForm && (
                <p
                  className="text-primary mt-3 cursor-pointer text-decoration-underline"
                  onClick={() => setShowChangePasswordForm(true)}
                >
                  ¿Quieres cambiar la contraseña? Haz clic aquí.
                </p>
              )}
              {showChangePasswordForm && (
                <div className="mt-3">
                  <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: "500px" }}>
                    <h5 className="fw-bold text-dark mb-4">Cambiar Contraseña</h5>
                    <form onSubmit={handleChangePassword}>
                      <div className="mb-3">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="form-control"
                          placeholder="Contraseña actual"
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="form-control"
                          placeholder="Nueva contraseña (mínimo 6 caracteres)"
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="form-control"
                          placeholder="Confirmar nueva contraseña"
                        />
                      </div>
                      <div className="d-flex justify-content-between">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowChangePasswordForm(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`btn btn-primary ${
                            isLoading ? "disabled opacity-50" : ""
                          }`}
                        >
                          {isLoading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Cambiando...
                            </>
                          ) : (
                            "Cambiar contraseña"
                          )}
                        </button>
                      </div>
                    </form>
                    {message && (
                      <div
                        className={`alert ${
                          message.includes("correctamente")
                            ? "alert-success"
                            : "alert-danger"
                        } mt-3`}
                      >
                        {message}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="col-lg-8">
            <div className="card shadow-sm p-4">
              <div className="d-flex align-items-center mb-4">
                <User size={24} className="text-primary me-2" />
                <h3 className="fw-bold text-dark mb-0">Información Personal</h3>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="card bg-light mb-3">
                    <div className="card-body d-flex align-items-center">
                      <User size={20} className="text-muted me-3" />
                      <div>
                        <p className="text-muted mb-1">Nombre</p>
                        <p className="fw-bold">{user.firstname}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card bg-light mb-3">
                    <div className="card-body d-flex align-items-center">
                      <Mail size={20} className="text-muted me-3" />
                      <div>
                        <p className="text-muted mb-1">Email</p>
                        <p className="fw-bold">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-light mb-3">
                    <div className="card-body d-flex align-items-center">
                      <User size={20} className="text-muted me-3" />
                      <div>
                        <p className="text-muted mb-1">Apellido</p>
                        <p className="fw-bold">{user.lastname}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card bg-light mb-3">
                    <div className="card-body d-flex align-items-center">
                      <CreditCard size={20} className="text-muted me-3" />
                      <div>
                        <p className="text-muted mb-1">DNI</p>
                        <p className="fw-bold">{user.dni.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}