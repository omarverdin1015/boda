let invitados = [];
let role = "";
let mesaViendoActual = null; 
let unsubscribeFirebase = null; // Para gestionar la escucha en tiempo real

const searchInput = document.getElementById("search");
const resultDiv = document.getElementById("result");

// 1. CARGAR INVITADOS DESDE FIREBASE EN TIEMPO REAL
function cargarInvitados() {
  if (!window.db) {
    console.error("Firebase no está inicializado.");
    return;
  }

  // Si ya existía una conexión previa, la cerramos para no duplicar listeners
  if (unsubscribeFirebase) unsubscribeFirebase();

  console.log("Conectando con Firebase Firestore...");

  // onSnapshot escucha los cambios en tiempo real
  unsubscribeFirebase = window.onSnapshot(
    window.collection(window.db, "invitados"),
    (snapshot) => {
      invitados = [];
      snapshot.forEach((doc) => {
        // Guardamos los datos del documento y aseguramos su ID de Firebase
        invitados.push({ id: doc.id, ...doc.data() });
      });

      console.log(`Sincronizados ${invitados.length} invitados.`);

      // Refrescamos automáticamente la pantalla actual
      refrescarVistaActual();
    },
    (error) => {
      console.error("Error al recibir actualizaciones de Firebase:", error);
    }
  );
}

// FUNCIÓN AUXILIAR PARA REFRESCAR LA PANTALLA
function refrescarVistaActual() {
  if (mesaViendoActual) {
    verMesa(mesaViendoActual);
  } else if (searchInput.value.trim().length >= 2) {
    searchInput.dispatchEvent(new Event("input"));
  } else {
    resultDiv.innerHTML = "";
  }
}

// 2. BUSCADOR PRINCIPAL
searchInput.addEventListener("input", () => {
  const valor = searchInput.value.toLowerCase().trim();
  resultDiv.innerHTML = "";
  
  mesaViendoActual = null;

  if (!valor || valor.length < 2 || invitados.length === 0) return;

  const resultados = invitados
    .filter(i => i.nombre.toLowerCase().includes(valor))
    .sort((a, b) => (a.llego || 0) - (b.llego || 0));
    
  if (resultados.length > 0) {
    resultDiv.innerHTML = resultados.map(inv => {
      let estadoHtml = Number(inv.llego) === 1 ? `<p>✅ Ya registrado</p>` : "";
      
      let botonCheckIn = "";
      if (role === "recepcion" && Number(inv.llego) === 0) {
        botonCheckIn = `<button class="ok" onclick="checkIn('${inv.id}')">Marcar llegada</button>`;
      }

      return `
        <div class="result-card">
          <h1 class="name">${inv.nombre}</h1>
          <p>🪑 Mesa ${inv.mesa}</p>
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

// 3. VER TODA LA MESA
function verMesa(numeroMesa) {
  mesaViendoActual = String(numeroMesa).trim();

  const resultadosMesa = invitados
    .filter(i => String(i.mesa).trim() === mesaViendoActual)
    .sort((a, b) => (a.llego || 0) - (b.llego || 0));

  resultDiv.innerHTML = `
    <h2 style="text-align: center; margin-bottom: 15px;">Mostrando Mesa ${numeroMesa}</h2>
    ${resultadosMesa.map(inv => {
      
      let estadoHtml = Number(inv.llego) === 1 ? `<p>✅ Ya registrado</p>` : "";
      
      let botonCheckIn = "";
      if (role === "recepcion" && Number(inv.llego) === 0) {
        botonCheckIn = `<button class="ok" onclick="checkIn('${inv.id}')">Marcar llegada</button>`;
      }

      return `
        <div class="result-card">
          <h1 class="name">${inv.nombre}</h1>
          <p>🪑 Mesa ${inv.mesa}</p>
          ${estadoHtml}${botonCheckIn}
        </div>
      `;
    }).join("")}
  `;
}

// 4. CHECK-IN CONECTADO A FIREBASE
window.checkIn = async function(id) {
  try {
    // Apuntamos al documento en la colección "invitados"
    const invitadoRef = window.doc(window.db, "invitados", String(id));

    // Actualizamos únicamente el campo llego a 1 en la nube
    await window.updateDoc(invitadoRef, {
      llego: 1
    });

    console.log(`Llegada registrada exitosamente en Firebase para ID: ${id}`);
    // No hace falta actualizar la interfaz manualmente aquí;
    // Firebase lo detecta y dispara onSnapshot -> refrescarVistaActual() solo.

  } catch (error) {
    console.error("Error al hacer check-in en Firebase:", error);
    alert("No se pudo registrar la llegada. Verifica tu conexión a internet.");
  }
};

// 5. SELECCIÓN DE ROL
function setRole(r) {
  role = r;
  localStorage.setItem("role", r);

  document.getElementById("role-select").style.display = "none";
  document.getElementById("app").style.display = "block";

  cargarInvitados();
}

// 6. REGRESAR AL INICIO
function irInicio() {
  localStorage.removeItem("role");

  document.getElementById("role-select").style.display = "flex";
  document.getElementById("app").style.display = "none";

  searchInput.value = "";
  resultDiv.innerHTML = "";
  mesaViendoActual = null;
}

// 7. AL CARGAR LA PÁGINA
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
  localStorage.clear();
  location.reload();
}