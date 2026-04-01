let invitados = [];

fetch("invitados.json")
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

const searchInput = document.getElementById("search");
const resultDiv = document.getElementById("result");

searchInput.addEventListener("input", () => {
  const valor = searchInput.value.toLowerCase();
  resultDiv.innerHTML = "";

  if (!valor) return;
  if (invitados.length === 0) return;

  const resultados = invitados.filter(i =>
    i.nombre.toLowerCase().includes(valor)
  );

  if (valor.length < 2) return;


  if (resultados.length > 0) {
    resultDiv.innerHTML = resultados.map(inv => {
      
      if (inv.llego === 1) {
        return `
          <div class="result-card">
            <h1 class="name">${inv.nombre}</h1>
            <p>⚠️ Ya registrado</p>
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

function checkIn(id) {
  const invitado = invitados.find(i => i.id === id);

  if (invitado) {
    invitado.llego = 1;
    localStorage.setItem("check_" + id, "1");

    // 🔥 vuelve a disparar búsqueda
    searchInput.dispatchEvent(new Event("input"));
  }
}


let role = "";

function setRole(r) {
  role = r;
  localStorage.setItem("role", r);

  document.getElementById("role-select").style.display = "none";
  document.getElementById("app").style.display = "block";
}

function irInicio() {
  // borrar rol
  localStorage.removeItem("role");

  // mostrar selector
  document.getElementById("role-select").style.display = "flex";
  document.getElementById("app").style.display = "none";

  // limpiar búsqueda
  const input = document.getElementById("search");
  input.value = "";
  resultDiv.innerHTML = "";
}

window.onload = () => {
  const savedRole = localStorage.getItem("role");

  if (savedRole) {
    role = savedRole;

    document.getElementById("role-select").style.display = "none";
    document.getElementById("app").style.display = "block";
  }
};
