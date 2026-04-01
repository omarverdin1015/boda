let invitados = [];
let role = "";

const searchInput = document.getElementById("search");
const resultDiv = document.getElementById("result");


// 🔥 CARGAR JSON SEGÚN ROL
function cargarInvitados() {
  let archivo = "invitados.json";

  if (role === "recepcion") {
    archivo = "invitados.json";
  } else if (role === "planner") {
    archivo = "invitados_planner.json";
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


// 🔍 BUSCADOR
searchInput.addEventListener("input", () => {
  const valor = searchInput.value.toLowerCase();
  resultDiv.innerHTML = "";

  if (!valor) return;
  if (valor.length < 2) return;
  if (invitados.length === 0) return;

  const resultados = invitados
    .filter(i => i.nombre.toLowerCase().includes(valor))
    .sort((a, b) => a.llego - b.llego); // 🔥 primero los que no han llegado

  if (resultados.length > 0) {
    resultDiv.innerHTML = resultados.map(inv => {

      if (inv.llego === 1) {
        return `
          <div class="result-card arrived">
            <h1 class="name">${inv.nombre}</h1>
            <p>✅ Ya registrado</p>
          </div>
        `;
      }

      let boton = "";
      if (role === "recepcion") {
        boton = `<button class="ok" onclick="checkIn(${inv.id})">Marcar llegada</button>`;
      }

      return `
        <div class="result-card">
          <h1 class="name">${inv.nombre}</h1>
          <p>🪑 Mesa ${inv.mesa}</p>
          <p>👥 ${inv.personas} personas</p>
          ${boton}
        </div>
      `;
    }).join("");

  } else {
    resultDiv.innerHTML = "<p>No encontrado</p>";
  }
});


// ✅ CHECK IN
function checkIn(id) {
  const invitado = invitados.find(i => i.id === id);

  if (invitado) {
    invitado.llego = 1;
    localStorage.setItem("check_" + id, "1");

    // refrescar resultados
    searchInput.dispatchEvent(new Event("input"));
  }
}


// 🎭 SELECCIÓN DE ROL
function setRole(r) {
  role = r;
  localStorage.setItem("role", r);

  document.getElementById("role-select").style.display = "none";
  document.getElementById("app").style.display = "block";

  cargarInvitados(); // 🔥 IMPORTANTE
}


// 🔙 REGRESAR AL INICIO
function irInicio() {
  localStorage.removeItem("role");

  document.getElementById("role-select").style.display = "flex";
  document.getElementById("app").style.display = "none";

  searchInput.value = "";
  resultDiv.innerHTML = "";
}


// 🔄 AL CARGAR
window.onload = () => {
  const savedRole = localStorage.getItem("role");

  if (savedRole) {
    role = savedRole;

    document.getElementById("role-select").style.display = "none";
    document.getElementById("app").style.display = "block";

    cargarInvitados(); // 🔥 IMPORTANTE
  }
};
