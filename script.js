document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarContador();
  mostrarCarrito();
  eventosCarrito();
});

// =====================
// CONFIG
// =====================
const URL = "https://opensheet.elk.sh/1YqfkHm8i9rY975plixaz_cBW9H2k5SDCIuLXrAP9CtE/Hoja%201";

// =====================
// CARGAR PRODUCTOS
// =====================
async function cargarProductos() {
  const container = document.querySelector(".product-container");
  if (!container) return;

  try {
    const res = await fetch(URL);
    const data = await res.json();

    container.innerHTML = "";

    data.forEach((p) => {

      const imagenes = [
        p.Imagen1,
        p.Imagen2,
        p.Imagen3
      ].filter(img => img && img.trim() !== "");

      const img = imagenes[0] || "https://via.placeholder.com/300";

      const talles = generarTalles(p);

      // 🔵 dots solo si hay más de 1 imagen
      let dotsHTML = "";
      if (imagenes.length > 1) {
        dotsHTML = `<div class="dots">
          ${imagenes.map((_, i) => 
            `<span class="dot ${i === 0 ? "active" : ""}"></span>`
          ).join("")}
        </div>`;
      }

      const card = document.createElement("div");
      card.classList.add("product-card");

      card.innerHTML = `
        <div class="img-box">
          <img src="${img}" class="product-img" data-index="0">
          ${dotsHTML}
        </div>

        <h2>${p.Nombre}</h2>
        <p>$${p.Precio}</p>

        <div class="talles-container" id="talles-${p.ID}">
          ${talles}
        </div>

        <input type="number" id="cantidad-${p.ID}" value="1" min="1">

        <button class="add-to-cart"
          data-id="${p.ID}"
          data-name="${p.Nombre}"
          data-price="${p.Precio}"
          data-images='${JSON.stringify(imagenes)}'>
          Agregar
        </button>
      `;

      // 👉 CLICK IMAGEN (carrusel)
      const imgEl = card.querySelector(".product-img");
      const dots = card.querySelectorAll(".dot");

      imgEl.addEventListener("click", () => {
        if (imagenes.length <= 1) {
          activarZoom(imgEl);
          return;
        }

        let index = parseInt(imgEl.dataset.index);
        index = (index + 1) % imagenes.length;

        imgEl.src = imagenes[index];
        imgEl.dataset.index = index;

        // actualizar dots
        dots.forEach(d => d.classList.remove("active"));
        if (dots[index]) dots[index].classList.add("active");
      });

      // 👉 DOBLE CLICK = ZOOM
      imgEl.addEventListener("dblclick", () => {
        activarZoom(imgEl);
      });

      container.appendChild(card);
    });

    activarTalles();
    activarBotones();

  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// =====================
// ZOOM
// =====================
function activarZoom(img) {
  img.classList.toggle("zoomed");
}

// =====================
// TALLES
// =====================
function generarTalles(p) {
  let html = "";

  for (let i = 38; i <= 56; i += 2) {
    const stock = parseInt(p[`Stock${i}`]) || 0;

    html += `
      <button 
        class="talle-btn ${stock === 0 ? "disabled" : ""}" 
        data-talle="${i}"
        data-stock="${stock}">
        ${i}
      </button>
    `;
  }

  return html;
}

function activarTalles() {
  document.querySelectorAll(".talle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("disabled")) return;

      const container = btn.closest(".talles-container");

      container.querySelectorAll(".talle-btn")
        .forEach(b => b.classList.remove("selected"));

      btn.classList.add("selected");
    });
  });
}

// =====================
// BOTONES
// =====================
function activarBotones() {
  document.querySelectorAll(".add-to-cart").forEach(btn => {

    btn.addEventListener("click", (e) => {

      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      const images = JSON.parse(btn.dataset.images);
      const image = images[0] || "";

      const talleSel = document.querySelector(`#talles-${id} .selected`);

      if (!talleSel) {
        alert("Elegí un talle");
        return;
      }

      const talle = talleSel.dataset.talle;
      const stock = parseInt(talleSel.dataset.stock);
      const cantidad = parseInt(document.getElementById(`cantidad-${id}`).value);

      if (cantidad > stock) {
        alert("Sin stock");
        return;
      }

      agregarAlCarrito(id, name, price, talle, cantidad, image);
      animacionCarrito(e);
    });
  });
}

// =====================
// CARRITO
// =====================
function agregarAlCarrito(id, name, price, talle, cantidad, image) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existe = cart.find(p => p.id === id && p.talle === talle);

  if (existe) {
    existe.quantity += cantidad;
  } else {
    cart.push({ id, name, price, talle, quantity: cantidad, image });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  actualizarContador();
  mostrarCarrito();
}

// =====================
// MOSTRAR CARRITO
// =====================
function mostrarCarrito() {
  const contenedor = document.querySelector(".cart-items");
  if (!contenedor) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  contenedor.innerHTML = "";
  let total = 0;

  cart.forEach(p => {
    total += p.price * p.quantity;

    const item = document.createElement("div");
    item.classList.add("cart-item");

    item.innerHTML = `
      <img src="${p.image}" class="cart-img">
      <p>${p.name} (${p.talle})</p>

      <div>
        <button class="menos">-</button>
        <span>${p.quantity}</span>
        <button class="mas">+</button>
      </div>

      <button class="delete-btn">X</button>
    `;

    item.querySelector(".menos").onclick = () => cambiarCantidad(p.id, p.talle, -1);
    item.querySelector(".mas").onclick = () => cambiarCantidad(p.id, p.talle, 1);
    item.querySelector(".delete-btn").onclick = () => eliminarProducto(p.id, p.talle);

    contenedor.appendChild(item);
  });

  const totalEl = document.querySelector(".cart-total");
  if (totalEl) totalEl.textContent = total;
}

// =====================
// RESTO IGUAL
// =====================
function cambiarCantidad(id, talle, cambio) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const prod = cart.find(p => p.id === id && p.talle === talle);

  if (!prod) return;

  prod.quantity += cambio;

  if (prod.quantity <= 0) {
    cart = cart.filter(p => !(p.id === id && p.talle === talle));
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  actualizarContador();
  mostrarCarrito();
}

function eliminarProducto(id, talle) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart = cart.filter(p => !(p.id === id && p.talle === talle));

  localStorage.setItem("cart", JSON.stringify(cart));

  actualizarContador();
  mostrarCarrito();
}

function actualizarContador() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((acc, p) => acc + p.quantity, 0);

  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = total;
  });
}

function eventosCarrito() {
  const vaciar = document.querySelector(".clear-cart");
  if (vaciar) {
    vaciar.onclick = () => {
      localStorage.removeItem("cart");
      actualizarContador();
      mostrarCarrito();
    };
  }

  const form = document.getElementById("confirmation-form");

  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      const nombre = document.getElementById("buyer-name").value.trim();

      if (!nombre) {
        alert("Completá tu nombre");
        return;
      }

      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      if (cart.length === 0) {
        alert("Carrito vacío");
        return;
      }

      let mensaje = `Hola! soy ${nombre}, quiero comprar:\n\n`;

      cart.forEach(p => {
        mensaje += `${p.quantity} x ${p.name} (${p.talle})\n`;
      });

      const url = `https://wa.me/5491154511489?text=${encodeURIComponent(mensaje)}`;
      window.location.href = url;
    });
  }
}

// =====================
// ANIMACION
// =====================
function animacionCarrito(e) {
  const icono = document.getElementById("pant-icon");
  const carrito = document.querySelector(".cart");

  if (!icono || !carrito) return;

  const start = e.target.getBoundingClientRect();
  const end = carrito.getBoundingClientRect();

  icono.style.display = "block";
  icono.style.left = start.left + "px";
  icono.style.top = start.top + "px";

  setTimeout(() => {
    icono.style.transition = "all 0.7s ease";
    icono.style.left = end.left + "px";
    icono.style.top = end.top + "px";
    icono.style.transform = "scale(0.5)";
  }, 50);

  setTimeout(() => {
    icono.style.display = "none";
    icono.style.transition = "";
    icono.style.transform = "scale(1)";
  }, 700);
}