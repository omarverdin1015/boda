let invitados = [];
let role = "";
// Nueva variable para saber si estamos viendo una mesa completa
let mesaViendoActual = null; 

const searchInput = document.getElementById("search");
const resultDiv = document.getElementById("result");

function cargarInvitados() {
  let archivo = "";

  if (role === "recepcion") {
    archivo = "invitados.json";
  } else if (role === "planner") {
    archivo = "invitados-mesa.json";
  }

  fetch(archivo)
    .then(res => res.json())
    .then(data => {
      invitados = data;

      // cargar estado guardado
      invitados.forEach(inv => {
        const estado = localStorage.getItem("check_" + inv.id);
        if (estado === "1") {
          inv.llego = 1;
        }
      });
    });
}

// BUSCADOR PRINCIPAL
searchInput.addEventListener("input", () => {
  const valor = searchInput.value.toLowerCase().trim();
  resultDiv.innerHTML = "";
  
  // Como estamos buscando texto nuevo, reseteamos la variable de la mesa
  mesaViendoActual = null;

  if (!valor || valor.length < 2 || invitados.length === 0) return;

  // Solo buscamos coincidencias directas por nombre
  const resultados = invitados
    .filter(i => i.nombre.toLowerCase().includes(valor))
    .sort((a, b) => a.llego - b.llego);
    
  if (resultados.length > 0) {
    resultDiv.innerHTML = resultados.map(inv => {
      let estadoHtml = inv.llego === 1 ? `<p>✅ Ya registrado</p>` : "";
      
      let botonCheckIn = "";
      if (role === "recepcion" && inv.llego === 0) {
        botonCheckIn = `<button class="ok" onclick="checkIn(${inv.id})">Marcar llegada</button>`;
      }

      return `
        <div class="result-card">
          <h1 class="name">${inv.nombre}</h1>
          <p>🪑 Mesa ${inv.mesa}</p>
          <p>👥 ${inv.personas} personas</p>
          ${estadoHtml}
          ${botonCheckIn}
          <button style="margin-top: 10px;" onclick="verMesa('${inv.mesa}')">Ver toda la mesa</button>
        </div>
      `;
    }).join("");

  } else {
    resultDiv.innerHTML = "<p>No encontrado</p>";
  }
});

// NUEVA FUNCIÓN: TRAER A TODOS LOS DE LA MESA
function verMesa(numeroMesa) {
  // Guardamos qué mesa estamos viendo para que el Check-In sepa qué refrescar
  mesaViendoActual = String(numeroMesa).trim();

  const resultadosMesa = invitados
    .filter(i => String(i.mesa).trim() === mesaViendoActual)
    .sort((a, b) => a.llego - b.llego);

  resultDiv.innerHTML = `
    <h2 style="text-align: center; margin-bottom: 15px;">Mostrando Mesa ${numeroMesa}</h2>
    ${resultadosMesa.map(inv => {
      
      let estadoHtml = inv.llego === 1 ? `<p>✅ Ya registrado</p>` : "";
      
      let botonCheckIn = "";
      if (role === "recepcion" && inv.llego === 0) {
        botonCheckIn = `<button class="ok" onclick="checkIn(${inv.id})">Marcar llegada</button>`;
      }

      return `
        <div class="result-card">
          <h1 class="name">${inv.nombre}</h1>
          <p>🪑 Mesa ${inv.mesa}</p>
          <p>👥 ${inv.personas} personas</p>
          ${estadoHtml}
          ${botonCheckIn}
        </div>
      `;
    }).join("")}
  `;
}

// CHECK IN ACTUALIZADO
function checkIn(id) {
  const invitado = invitados.find(i => i.id === id);

  if (invitado) {
    invitado.llego = 1;
    localStorage.setItem("check_" + id, "1");

    // Decidir qué vista refrescar
    if (mesaViendoActual) {
      verMesa(mesaViendoActual); // Si estábamos viendo la mesa completa, recargamos esa mesa
    } else {
      searchInput.dispatchEvent(new Event("input")); // Si estábamos en el buscador normal, recargamos la búsqueda
    }
  }
}

// SELECCIÓN DE ROL
function setRole(r) {
  role = r;
  localStorage.setItem("role", r);

  document.getElementById("role-select").style.display = "none";
  document.getElementById("app").style.display = "block";

  cargarInvitados();
}

// REGRESAR AL INICIO
function irInicio() {
  localStorage.removeItem("role");

  document.getElementById("role-select").style.display = "flex";
  document.getElementById("app").style.display = "none";

  searchInput.value = "";
  resultDiv.innerHTML = "";
  mesaViendoActual = null;
}

// AL CARGAR
window.onload = () => {
  const savedRole = localStorage.getItem("role");

  if (savedRole) {
    role = savedRole;

    document.getElementById("role-select").style.display = "none";
    document.getElementById("app").style.display = "block";

    cargarInvitados();
  }
};

function borrarMemoria() {
  localStorage.clear(); // Borra todo el registro de llegadas y roles
  location.reload();    // Recarga la página automáticamente
}
