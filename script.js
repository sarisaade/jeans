document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarContador();
  mostrarCarrito();
  eventosCarrito();

  // =====================
  // BOTONES DE PAGO
  // =====================

  const btnWA = document.getElementById("btn-whatsapp");
  const btnMP = document.getElementById("btn-mp");

  // 👉 WHATSAPP
  if (btnWA) {
    btnWA.addEventListener("click", () => {

      const nombre = document.getElementById("buyer-name")?.value.trim();

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

      const total = document.querySelector(".cart-total")?.textContent || "0";
      mensaje += `\nTotal: $${total}`;

      const url = `https://wa.me/5491154511489?text=${encodeURIComponent(mensaje)}`;
      window.location.href = url;
    });
  }

  // 👉 MERCADO PAGO
  if (btnMP) {
  btnMP.addEventListener("click", () => {

    const nombre = document.getElementById("buyer-name")?.value.trim();

    if (!nombre) {
      alert("Completá tu nombre");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("Carrito vacío");
      return;
    }

    let mensaje = `Hola! soy ${nombre}, quiero comprar y pagar con Mercado Pago:\n\n`;

    cart.forEach(p => {
      mensaje += `${p.quantity} x ${p.name} (${p.talle})\n`;
    });

    const total = document.querySelector(".cart-total")?.textContent || "0";
    mensaje += `\nTotal: $${total}`;

    const urlWA = `https://wa.me/5491154511489?text=${encodeURIComponent(mensaje)}`;

    // 👉 abrís WhatsApp en otra pestaña
    window.open(urlWA, "_blank");

    // 👉 redirigís a Mercado Pago
    const mpLink = "https://link.mercadopago.com.ar/tu_0link"; // REEMPLAZA con tu link real de Mercado Pago";
    window.location.href = mpLink;
  });
}
});
// =====================
// CONFIG
// =====================
const URL = "https://opensheet.elk.sh/1YqfkHm8i9rY975plixaz_cBW9H2k5SDCIuLXrAP9CtE/Hoja%201";

// =====================
// CARGAR PRODUCTOS
// =====================
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

    data.forEach((p, index) => {

  p.ID = index; // 🔥 genera ID único

      const imagenes = [
        p.Imagen1,
        p.Imagen2,
        p.Imagen3,
        p.Imagen4,
        p.Imagen5,
        p.Imagen6
      ].filter(img => img && img.trim() !== "");

      const img = imagenes[0] || "https://via.placeholder.com/300";

      const talles = generarTalles(p);
const colores = generarColores(p);

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
        <p class="price" id="price-${p.ID}">$${p.Precio}</p>

        <div class="talles-container" id="talles-${p.ID}">
  ${talles}
</div>

${colores}
<p class="color-name"></p>

<input type="number" id="cantidad-${p.ID}" value="1" min="1">
        <button class="add-to-cart"
          data-id="${p.ID}"
          data-name="${p.Nombre}"
          data-price="${p.Precio}"
          data-precio52="${p.Precio52 || ''}"
          data-precio54="${p.Precio54 || ''}"
          data-precio56="${p.Precio56 || ''}"
          data-images='${JSON.stringify(imagenes)}'>
          Agregar
        </button>
      `;

      // 👉 IMAGEN (carrusel)
      const imgEl = card.querySelector(".product-img");
      const dots = card.querySelectorAll(".dot");

      imgEl.addEventListener("click", () => {
        if (imagenes.length <= 1) return;

        let index = parseInt(imgEl.dataset.index);
        index = (index + 1) % imagenes.length;

        imgEl.src = imagenes[index];
        imgEl.dataset.index = index;

        dots.forEach(d => d.classList.remove("active"));
        if (dots[index]) dots[index].classList.add("active");
      });

      // 🔥 CLICK EN LA CARD → ABRE MODAL
     card.addEventListener("click", (e) => {

  if (
  e.target.closest(".add-to-cart") ||
  e.target.closest(".talle-btn") ||
  e.target.closest(".color-circle") ||
  e.target.closest("input")
) return;
const imagenActual = card.querySelector(".product-img").src;

 abrirModalConCarrusel(p, imgEl.src);
});

      container.appendChild(card);
    });

    activarTalles();
activarColores();
activarBotones();

  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}


// =====================
// TALLES
// =====================
function generarTalles(p) {

  let html = "";

  // 👉 primero probamos letras
  const tallesLetras = ["S","M","L","XL","XXL"];

  let hayLetras = false;

  tallesLetras.forEach(t => {
    if (p[`Stock${t}`] && p[`Stock${t}`] !== "" && p[`Stock${t}`] !== "0") {
      hayLetras = true;
    }
  });

  // 👉 SI TIENE LETRAS
  if (hayLetras) {

    tallesLetras.forEach(t => {
      const stock = parseInt(p[`Stock${t}`]) || 0;

      html += `
        <button class="talle-btn ${stock === 0 ? "disabled" : ""}" 
          data-talle="${t}" 
          data-stock="${stock}">
          ${t}
        </button>
      `;
    });

  } else {

    // 👉 SI NO → números
    for (let i = 38; i <= 56; i += 2) {
      const stock = parseInt(p[`Stock${i}`]) || 0;

      html += `
        <button class="talle-btn ${stock === 0 ? "disabled" : ""}" 
          data-talle="${i}" 
          data-stock="${stock}">
          ${i}
        </button>
      `;
    }
  }

  return html;
}
function generarColores(p) {

  let html = "";

  for (let i = 1; i <= 6; i++) {

    const color = p[`Color${i}`];
    const imagen = p[`Imagen${i}`];

    if (color && imagen) {

      html += `
        <button 
          class="color-circle"
          data-image="${imagen}"
          data-color="${color}"
style="background:${color}"
        </button>
      `;
    }
  }

  if (html === "") return "";

  return `
    <div class="colores-container">
      ${html}
    </div>
  `;
}

function activarTalles() {
  document.querySelectorAll(".talle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("disabled")) return;

      const container = btn.closest(".talles-container");

      container.querySelectorAll(".talle-btn")
        .forEach(b => b.classList.remove("selected"));

      btn.classList.add("selected");
     


      // 👉 CAMBIO DE PRECIO EN PANTALLA
     const card = btn.closest(".product-card");

const priceEl = card.querySelector(".price");
const addBtn = card.querySelector(".add-to-cart");
      let price = parseFloat(addBtn.dataset.price);

      if (btn.dataset.talle === "52" && addBtn.dataset.precio52) {
        price = parseFloat(addBtn.dataset.precio52);
      }
      if (btn.dataset.talle === "54" && addBtn.dataset.precio54) {
        price = parseFloat(addBtn.dataset.precio54);
      }
      if (btn.dataset.talle === "56" && addBtn.dataset.precio56) {
        price = parseFloat(addBtn.dataset.precio56);
      }

      priceEl.textContent = `$${price}`;
    });
  });
}
function activarColores() {

  document.querySelectorAll(".color-circle").forEach(btn => {

    btn.addEventListener("click", () => {

      const card = btn.closest(".product-card");

      card.querySelectorAll(".color-circle")
        .forEach(b => b.classList.remove("selected"));

      btn.classList.add("selected");

      const img = card.querySelector(".product-img");
      img.src = btn.dataset.image;

      // 👉 NUEVO: mostrar nombre del color
      const label = card.querySelector(".color-name");

      let nombreColor = btn.dataset.color;

      const colores = {
        "#000000": "Negro",
        "#ffffff": "Blanco",
        "#f5f5dc": "Crema",
        "#800020": "Bordo",
        "#000066": "Marino",
        "#808080": "Gris",
        "#8b4513": "Marrón",
        "#556b2f": "Verde militar",
        "#0a747c": "Petróleo",
        "#2c2b2b": "Gris oscuro",
      };

      const hex = nombreColor.toLowerCase();

      if (colores[hex]) {
        nombreColor = colores[hex];
      }

      label.textContent = "Color: " + nombreColor;

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

     

      const card = btn.closest(".product-card");
      const images = JSON.parse(btn.dataset.images);

const colorSeleccionado = card.querySelector(".color-circle.selected");

const image = colorSeleccionado
  ? colorSeleccionado.dataset.image
  : (images[0] || "");


const talleSel = card.querySelector(".talle-btn.selected");


if (!talleSel) {
  alert("Elegí un talle");
  return;
}

const talle = talleSel.dataset.talle;
const colorSel = card.querySelector(".color-circle.selected");

const tieneColores =
  card.querySelectorAll(".color-circle").length > 0;

if (tieneColores && !colorSel) {
  alert("Elegí un color");
  return;
}

const color = colorSel
  ? colorSel.dataset.color
  : "";
const stock = parseInt(talleSel.dataset.stock) || 0;

const cantidadInput = card.querySelector("input");
const cantidad = parseInt(cantidadInput.value);

if (!cantidad || cantidad <= 0) {
  alert("Cantidad inválida");
  return;
}

if (!talleSel || !cantidad || cantidad <= 0) {
  alert("Seleccioná talle y cantidad válida");
  return;
}

      // 🔥 PRECIO REAL (EL QUE VE EL USUARIO)
      const priceText = card.querySelector(".price").textContent;
      const price = parseFloat(priceText.replace("$", ""));

      if (cantidad > stock) {
        alert("Sin stock");
        return;
      }

      agregarAlCarrito(id, name, price, talle, color, cantidad, image);
      animacionCarrito(e);
    });
  });
}

// =====================
// CARRITO
// =====================
function agregarAlCarrito(id, name, price, talle, color, cantidad, image) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existe = cart.find(p => p.id === id && p.talle === talle);

  if (existe) {
    existe.quantity += cantidad;
  } else {
   cart.push({
  id,
  name,
  price,
  talle,
  color,
  quantity: cantidad,
  image
});
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

  // 👉 total de unidades en TODO el carrito
  const totalUnidades = cart.reduce((acc, p) => acc + p.quantity, 0);

  const aplicaMayorista = totalUnidades >= 3;

  cart.forEach(p => {

    let precioUnitario = p.price;

    // 👉 si NO llega a 3 → recargo por prenda
    if (!aplicaMayorista) {
      precioUnitario = p.price + 3000;
    }

    const subtotal = precioUnitario * p.quantity;
    total += subtotal;

    const item = document.createElement("div");
    item.classList.add("cart-item");

    item.innerHTML = `
      <img src="${p.image}" class="cart-img">
      <p>
  ${p.name} 
  (${p.talle})
  
  ${p.color 
    ? `<span class="cart-color" style="background:${p.color}"></span>` 
    : ""
  }
</p>

      <div>
        <button class="menos">-</button>
        <span>${p.quantity}</span>
        <button class="mas">+</button>
      </div>

      <p>$${precioUnitario} c/u</p>
      <p><strong>$${subtotal}</strong></p>

      <button class="delete-btn">X</button>
    `;

    item.querySelector(".menos").onclick = () => cambiarCantidad(p.id, p.talle, -1);
    item.querySelector(".mas").onclick = () => cambiarCantidad(p.id, p.talle, 1);
    item.querySelector(".delete-btn").onclick = () => eliminarProducto(p.id, p.talle);

    contenedor.appendChild(item);
  });

  // 👉 MENSAJE GLOBAL
  const aviso = document.createElement("div");

  if (!aplicaMayorista) {
    const faltan = 3 - totalUnidades;

    aviso.innerHTML = `
      <p style="color:orange; font-weight:bold;">
        Agrega ${faltan} prenda(s) mas para alcanzar el precio mayorista!
      </p>
    `;
  } else {
    aviso.innerHTML = `
      <p style="color:green; font-weight:bold;">
        ✔ Precio mayorista aplicado 
      </p>
    `;
  }

  contenedor.appendChild(aviso);

  const totalEl = document.querySelector(".cart-total");
  if (totalEl) totalEl.textContent = total;
}
// =====================
// RESTO
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

  // 🗑️ VACIAR CARRITO
  const vaciar = document.querySelector(".clear-cart");
  if (vaciar) {
    vaciar.onclick = () => {
      localStorage.removeItem("cart");
      actualizarContador();
      mostrarCarrito();
    };
  }

  // ✅ CONFIRMAR (WHATSAPP)
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

  mensaje += `${p.quantity} x ${p.name} (${p.talle})`;

 if (p.color) {

  let nombreColor = p.color;

  const colores = {
    "#000000": "Negro",
    "#ffffff": "Blanco",
    "#f5f5dc": "Crema",
    "#800020": "Bordo",
    "#000066": "Marino",
    "#808080": "Gris claro",
    "#8b4513": "Marrón",
    "#556b2f": "Verde militar",
    "#0a747c": "Petroleo",
    "#2c2b2b": "Gris oscuro",
  };

  const hex = p.color.toLowerCase();

  if (colores[hex]) {
    nombreColor = colores[hex];
  }

  mensaje += ` - ${nombreColor}`;
}

  mensaje += `\n`;

});

const total = document.querySelector(".cart-total").textContent;

mensaje += `\nTotal: $${total}`;

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

  // 📱 MOBILE (animación corta)
  if (window.innerWidth < 600) {

  const icono = document.getElementById("pant-icon");
  const carrito = document.querySelector(".cart");

  if (!icono || !carrito) return;

  const btn = e.currentTarget.getBoundingClientRect();
  const cart = carrito.getBoundingClientRect();

  icono.style.display = "block";

  // arranca desde el botón
  icono.style.left = btn.left + btn.width / 2 + "px";
  icono.style.top = btn.top + btn.height / 2 + "px";
  icono.style.transform = "translate(-50%, -50%) scale(1)";

  setTimeout(() => {
    icono.style.transition = "all 0.6s ease";

    // va al carrito (centro exacto)
    icono.style.left = cart.left + cart.width / 2 + "px";
    icono.style.top = cart.top + cart.height / 2 + "px";
    icono.style.transform = "translate(-50%, -50%) scale(0.5)";
    icono.style.opacity = "0.7";
  }, 50);

  setTimeout(() => {
    icono.style.display = "none";
    icono.style.transition = "";
    icono.style.opacity = "1";
    icono.style.transform = "scale(1)";
  }, 650);

  return;
}

  // 💻 DESKTOP (tu animación original)
  const start = e.currentTarget.getBoundingClientRect();
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
const btn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    btn.classList.add("show");
  } else {
    btn.classList.remove("show");
  }
});

btn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("product-modal");
  const closeBtn = document.querySelector(".close-modal");

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
    if (e.target.id === "product-modal") {
      modal.style.display = "none";
    }
  });
});
function abrirModalConCarrusel(p, imagenActual) {

  const modal = document.getElementById("product-modal");
  const imgEl = document.getElementById("modal-img");

  const prev = document.getElementById("prev-img");
  const next = document.getElementById("next-img");

  const imagenes = [
    p.Imagen1,
    p.Imagen2,
    p.Imagen3
  ].filter(img => img && img.trim() !== "");

  let index = imagenes.indexOf(imagenActual);

if (index < 0) index = 0;

imgEl.src = imagenes[index];

  // 👉 siguiente
  next.onclick = () => {
    index = (index + 1) % imagenes.length;
    imgEl.src = imagenes[index];
  };

  // 👉 anterior
  prev.onclick = () => {
    index = (index - 1 + imagenes.length) % imagenes.length;
    imgEl.src = imagenes[index];
  };

  // info
  document.getElementById("modal-title").textContent = p.Nombre;
  document.getElementById("modal-price").textContent = "$" + p.Precio;

  modal.style.display = "flex";
}
