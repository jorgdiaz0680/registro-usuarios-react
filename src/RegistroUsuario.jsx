import { useState, useEffect } from "react";
import "./RegistroUsuario.css";
import hero from "./assets/hero.png"; // Imagen importada desde src/assets

// Confirmado con tus capturas: tu backend corre en el puerto 5001.
const API_URL = "http://127.0.0.1:5001";

// Datos para los selects dependientes: la lista de ciudades cambia según el país
const PAISES_CIUDADES = {
  "República Dominicana": [
    "Santo Domingo",
    "Santiago",
    "La Vega",
    "Puerto Plata",
    "San Cristóbal",
    "San Pedro de Macorís",
  ],
  "Estados Unidos": ["Nueva York", "Miami", "Boston", "Los Ángeles"],
  "España": ["Madrid", "Barcelona", "Valencia", "Sevilla"],
};

export default function RegistroUsuario() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [telefono, setTelefono] = useState("");
  const [edad, setEdad] = useState("");
  const [pais, setPais] = useState("");
  const [ciudad, setCiudad] = useState("");

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [usuarios, setUsuarios] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);

  // Consumir datos: trae la lista de usuarios del backend
  const cargarUsuarios = async () => {
    setCargandoLista(true);
    try {
      const respuesta = await fetch(`${API_URL}/usuarios`);
      const datos = await respuesta.json();
      setUsuarios(datos);
    } catch (error) {
      console.error("No se pudo cargar la lista de usuarios", error);
    } finally {
      setCargandoLista(false);
    }
  };

  // Cargar la lista apenas se monta el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Eliminar un usuario por id
  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm("¿Seguro que quieres eliminar este usuario?");
    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE",
      });

      if (!respuesta.ok) {
        alert("No se pudo eliminar el usuario");
        return;
      }

      // Quita al usuario de la lista sin tener que volver a pedirla toda
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      alert("No se pudo conectar con el servidor");
    }
  };

  // Al cambiar el país, reinicia la ciudad (porque las opciones cambian)
  const manejarCambioPais = (e) => {
    setPais(e.target.value);
    setCiudad("");
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrores({});
    setMensaje("");
    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellido,
          correo,
          clave,
          telefono,
          edad,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        // El backend puede devolver errores por campo en "detalle"
        if (datos.detalle) {
          setErrores(datos.detalle);
        } else {
          setMensaje(datos.error || datos.message || "Ocurrió un error");
        }
        return;
      }

      setMensaje("Usuario creado correctamente");
      setNombre("");
      setApellido("");
      setCorreo("");
      setClave("");
      setTelefono("");
      setEdad("");
      setPais("");
      setCiudad("");
      cargarUsuarios(); // refresca la lista con el usuario recién creado
    } catch (error) {
      setMensaje("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contenedor">
      <form onSubmit={manejarEnvio} className="tarjeta formulario">
        <img src={hero} alt="Registro de usuarios" className="imagen-hero" />
        <h2>Crear usuario</h2>

        <div className="campo">
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          {errores.nombre && <p className="error">{errores.nombre}</p>}
        </div>

        <div className="campo">
          <label>Apellido</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
          {errores.apellido && <p className="error">{errores.apellido}</p>}
        </div>

        <div className="campo">
          <label>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          {errores.correo && <p className="error">{errores.correo}</p>}
        </div>

        <div className="campo">
          <label>Clave</label>
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />
          {errores.clave && <p className="error">{errores.clave}</p>}
        </div>

        <div className="campo">
          <label>Teléfono</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>

        <div className="campo">
          <label>Edad</label>
          <input
            type="number"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
          />
        </div>

        <div className="campo">
          <label>País</label>
          <select value={pais} onChange={manejarCambioPais}>
            <option value="">Selecciona un país</option>
            {Object.keys(PAISES_CIUDADES).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Ciudad</label>
          <select
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            disabled={!pais}
          >
            <option value="">
              {pais ? "Selecciona una ciudad" : "Primero elige un país"}
            </option>
            {(PAISES_CIUDADES[pais] || []).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <img src="/icons.svg" alt="" className="icono-public" />

        <button type="submit" disabled={cargando}>
          {cargando ? "Enviando..." : "Registrarse"}
        </button>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </form>

      <div className="tarjeta">
        <div className="encabezado-lista">
          <h2>Usuarios registrados</h2>
          <button onClick={cargarUsuarios} className="boton-secundario">
            {cargandoLista ? "Cargando..." : "Refrescar"}
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Edad</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.correo}</td>
                <td>{u.telefono}</td>
                <td>{u.edad}</td>
                <td>
                  <button
                    className="boton-eliminar"
                    onClick={() => eliminarUsuario(u.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && !cargandoLista && (
          <p className="vacio">No hay usuarios todavía.</p>
        )}
      </div>
    </div>
  );
}
