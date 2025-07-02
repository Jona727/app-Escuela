import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type LoginProcessResponse = {
  status: string;
  token?: string;
  user?: unknown;
  message?: string;
};

function Login() {
  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const ENDPOINT = "users/loginUser";
  const LOGIN_URL = `http://${BACKEND_IP}:${BACKEND_PORT}/${ENDPOINT}`;

  const userInputRef = useRef<HTMLInputElement>(null);
  const passInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  function loginProcess(dataObject: LoginProcessResponse) {
    if (dataObject.status === "success") {
      localStorage.setItem("token", dataObject.token ?? "");
      localStorage.setItem("user", JSON.stringify(dataObject.user));
      setMessage("Iniciando sesión...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000); // Espera 1 segundo antes de redirigir
    } else {
      setMessage(dataObject.message ?? "Error desconocido");
    }
  }

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const username = userInputRef.current?.value.trim();
    const password = passInputRef.current?.value.trim();

    if (!username || !password) {
      setMessage("Por favor, completa todos los campos.");
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({ username, password });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    fetch(LOGIN_URL, requestOptions)
      .then((response) => response.json())
      .then((dataObject) => loginProcess(dataObject))
      .catch((error) => {
        console.error("Error durante el inicio de sesión:", error);
        setMessage("Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo.");
      });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Tarjeta de Login */}
      <div
        style={{
          maxWidth: "450px",
          width: "100%",
          padding: "32px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "36px",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "8px",
          }}
        >
          Bienvenido
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            fontSize: "16px",
            marginBottom: "32px",
          }}
        >
          Por favor, ingresá tus datos.
        </p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="inputUser"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Usuario
            </label>
            <input
              type="text"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "12px",
                fontSize: "16px",
              }}
              id="inputUser"
              ref={userInputRef}
              placeholder=""
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="exampleInputPassword1"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "12px",
                fontSize: "16px",
              }}
              id="exampleInputPassword1"
              ref={passInputRef}
              placeholder=""
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(135deg, #a855f7 0%, #a855f7 100%)",
              color: "white",
              fontWeight: "600",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Iniciar Sesión
          </button>

          <span
            style={{
              display: "block",
              marginTop: "16px",
              textAlign: "center",
              color: "red",
              fontSize: "14px",
            }}
          >
            {message}
          </span>
        </form>
      </div>
    </div>
  );
}

export default Login;