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
  const encontrado = invitados.find(i =>
    i.nombre.toLowerCase().includes(valor) 
  );

  if (encontrado) {
    debugger
    if (encontrado.llego === 1) {
    resultDiv.innerHTML = "<p>⚠️ Ya deberias estar pedo, ya entraste</p>";
  } else {
    render(encontrado);
  }
  } else {
    resultDiv.innerHTML = "<p>No encontrado</p>";
  }
});

function render(inv) {
  resultDiv.innerHTML = `
    <div class="result-card">
      <h2 class="title">Bienvenido</h2>
      <h1 class="name">${inv.nombre}</h1>

      <div class="info">
        <p>🪑 MESA <strong>${inv.mesa}</strong></p>
        <p>👥 PERSONAS <strong>${inv.personas}</strong> </p>
      </div>

      <button class="ok" onclick="checkIn(${inv.id})">Marcar llegada</button>
    </div>
  `;
}

function checkIn(id) {
   const invitado = invitados.find(i => i.id === id);

  if (invitado) {
    invitado.llego = 1;

    // guardar persistencia
    localStorage.setItem("check_" + id, "1");

    alert("Marcado como llegó");
    resultDiv.innerHTML = "";
  }
}
