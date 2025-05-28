document.addEventListener('DOMContentLoaded', initPage);

function initPage() {
    displayCart();
    updateCartCount();

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(event) {
            const productCard = this.closest('.product-card');
            const productId = parseInt(this.getAttribute('data-id'));
            let productName = this.getAttribute('data-name');
            let productPrice = parseFloat(this.getAttribute('data-price'));

            // Recuperar datos si vienen como null
            if (!productName || isNaN(productPrice)) {
                productName = productCard.querySelector('h2').textContent;
                productPrice = parseFloat(productCard.querySelector('p:nth-of-type(2)').textContent.replace(/[^0-9.]/g, ''));
            }

            const productTalle = document.querySelector(`#talle-${productId}`).value;
            const productQuantity = parseInt(document.querySelector(`#cantidad-${productId}`).value);

            if (productTalle && productQuantity > 0) {
                addToCart(productId, productName, productPrice, productTalle, productQuantity);
                updateCartIndicator();
            } else {
                alert("Selecciona un talle y una cantidad válida.");
            }
        });
    });

    document.querySelector('.clear-cart').addEventListener('click', () => {
        localStorage.removeItem('cart');
        localStorage.setItem("cartCount", 0);
        updateCartCount();
        displayCart();
    });

    document.getElementById('confirmar-carrito-btn').addEventListener('click', () => {
        document.getElementById('dialog').style.display = 'block';
    });

    document.getElementById('confirmation-form').addEventListener('submit', function(event) {
        event.preventDefault();
        confirmPurchase();
    });
}

// Agregar producto al carrito
function addToCart(productId, productName, productPrice, productTalle, productQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = { id: productId, name: productName, price: productPrice, talle: productTalle, quantity: productQuantity };

    const existingProduct = cart.find(item => item.id === productId && item.talle === productTalle);
    if (existingProduct) {
        existingProduct.quantity += productQuantity;
    } else {
        cart.push(product);
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    let totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    localStorage.setItem("cartCount", totalCount);

    updateCartCount();
    displayCart();
}
// Función para cambiar el estado del botón
function changeButtonState(button) {
    button.style.backgroundColor = '#4CAF50'; // Cambiar a verde
    const originalText = button.textContent;
    button.textContent = 'Producto agregado';
    button.disabled = true; // Deshabilitar el botón
// Revertir el cambio después de 1 segundo
    setTimeout(() => {
        button.style.backgroundColor = '';
        button.textContent = originalText;
        button.disabled = false;
    }, 500);
}

// Mostrar carrito
function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.querySelector('.cart-items');
    cartContainer.innerHTML = '';

    cart.forEach(product => {
        const listItem = document.createElement('div');
        listItem.classList.add('cart-item');
        listItem.innerHTML = `
            <button class="decrease-quantity" data-id="${product.id}" data-talle="${product.talle}">-</button>
            <p>${product.quantity} x ${product.name} (Talle: ${product.talle}) - Precio: $${(product.price * product.quantity).toFixed(2)}</p>
            <button class="increase-quantity" data-id="${product.id}" data-talle="${product.talle}">+</button>
        `;
        cartContainer.appendChild(listItem);
    });

    updateCartTotal();

    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(button.getAttribute('data-id'));
            const productTalle = button.getAttribute('data-talle');
            removeFromCart(productId, productTalle);
        });
    });

    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(button.getAttribute('data-id'));
            const productTalle = button.getAttribute('data-talle');
            addToCart(productId, null, null, productTalle, 1);
        });
    });
}

// Eliminar productos
function removeFromCart(productId, productTalle) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === productId && item.talle === productTalle);

    if (existingProduct) {
        existingProduct.quantity -= 1;

        // Si la cantidad es 0, eliminar el producto del carrito
        if (existingProduct.quantity <= 0) {
            cart = cart.filter(item => !(item.id === productId && item.talle === productTalle));
        }

        // **Actualizar localStorage**
        localStorage.setItem('cart', JSON.stringify(cart));

        // **Actualizar el contador de productos en el carrito**
        let totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
        localStorage.setItem("cartCount", totalCount);

        // Refrescar la interfaz
        updateCartCount();
        displayCart();
    }
}


// Actualizar total del carrito
function updateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartTotal = cart.reduce((total, product) => total + (product.price * product.quantity), 0);
    document.querySelector('.cart-total').textContent = cartTotal.toFixed(2);
}

function updateCartCount() {
    let totalCount = localStorage.getItem("cartCount");

    // Si no hay datos en localStorage, inicializarlo correctamente
    if (!totalCount || isNaN(totalCount)) {
        totalCount = 0;
        localStorage.setItem("cartCount", totalCount);
    }

    document.querySelectorAll(".cart-count").forEach(el => el.textContent = totalCount);
}


//Buscador
document.getElementById('search-button').addEventListener('click', () => {
    const selectedOption = document.getElementById('search-options').value.toLowerCase().trim();
    const productCards = document.querySelectorAll('.product-card');

    if (selectedOption === 'ver-todo') {
        // Mostrar todas las tarjetas si se selecciona "Ver todo"
        productCards.forEach(card => {
            card.style.display = 'block';
        });
    } else if (selectedOption === '') {
        // Si no se selecciona nada, también mostramos todos los productos
        productCards.forEach(card => {
            card.style.display = 'block';
        });
    } else {
        // Mostrar solo las tarjetas que coinciden con la búsqueda
        productCards.forEach(card => {
            const productName = card.getAttribute('data-name').toLowerCase();
            card.style.display = productName.includes(selectedOption) ? 'block' : 'none';
        });
    }
});


//menu de orden
document.getElementById('sort-button').addEventListener('click', () => {
    const sortOption = document.getElementById('sort-options').value; // Obtener la opción seleccionada
    const productContainer = document.querySelector('.product-container'); // Contenedor de las tarjetas
    const productCards = Array.from(document.querySelectorAll('.product-card')); // Tarjetas como array

    // Lógica para ordenar
    let sortedCards;
    if (sortOption === 'precio-asc') {
        // Ordenar por precio de menor a mayor
        sortedCards = productCards.sort((a, b) => {
            const priceA = parseFloat(a.querySelector('p:nth-of-type(2)').textContent.replace(/[^0-9.]/g, ''));
            const priceB = parseFloat(b.querySelector('p:nth-of-type(2)').textContent.replace(/[^0-9.]/g, ''));
            return priceA - priceB;
        });
    } else if (sortOption === 'precio-desc') {
        // Ordenar por precio de mayor a menor
        sortedCards = productCards.sort((a, b) => {
            const priceA = parseFloat(a.querySelector('p:nth-of-type(2)').textContent.replace(/[^0-9.]/g, ''));
            const priceB = parseFloat(b.querySelector('p:nth-of-type(2)').textContent.replace(/[^0-9.]/g, ''));
            return priceB - priceA;
        });
    }

    // Limpiar y reordenar las tarjetas en el contenedor
    productContainer.innerHTML = '';
    sortedCards.forEach(card => productContainer.appendChild(card));
});

//boton back to top
window.addEventListener("scroll", function() {
    var button = document.getElementById("back-to-top");
    if (window.scrollY > 300) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
});

// Función para mostrar notificación de producto agregado
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 200);
}
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (event) => {
      const pantIcon = document.getElementById('pant-icon');
      const buttonRect = event.target.getBoundingClientRect(); // Coordenadas del botón
      const cart = document.querySelector('.cart');
      // Cambiar el botón
      event.target.textContent = "Producto agregado";
      event.target.classList.add('added-to-cart');
      event.target.disabled = true; // Opcional: deshabilita el botón después de agregar el producto
      // Restaurar el botón después de 3 segundos
      setTimeout(() => {
        event.target.textContent = "Agregar al carrito";
        event.target.classList.remove('added-to-cart');
        event.target.disabled = false;
    }, 3000);
  
      // Posición inicial: donde está el botón
      pantIcon.style.display = 'block';
      pantIcon.style.position = 'absolute';
      pantIcon.style.left = `${buttonRect.left}px`;
      pantIcon.style.top = `${buttonRect.top}px`;
  
      // Animación hacia el carrito
      pantIcon.style.transition = 'all 1.5s ease'; // Animación suave
      setTimeout(() => {
        pantIcon.style.left = `${cart.offsetLeft + cart.clientWidth / 2}px`; // Posición dentro del carrito
        pantIcon.style.top = `${cart.offsetTop + cart.clientHeight / 2}px`; // Posición dentro del carrito
      }, 50); // Pequeño retraso para la transición
  
      // Mantener el pantalón dentro del carrito o hacer que desaparezca
      setTimeout(() => {
        pantIcon.style.transition = '';
        pantIcon.style.display = 'none'; // El pantalón desaparece
        console.log('Animación completada y el ícono desapareció.');
        updateCartIndicator(); // Llamar al indicador visual
      }, 1550); // Tiempo total de la animación
    });
  });

document.getElementById("back-to-top").addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
//cambio de imagenes
const productImages = {
    "pantalon-moderno": [
        "./blue-jeans-fabric-details.jpg",
        "./jean azul prueba.webp",
        "./otro pantalon prueba.webp"
    ],
    "pantalon-verde": [
        "./pampero-beige.jpg",
        "./foto local.jpg",
        "./panatlon azul.jpg"
    ],
    "jean-celeste": [
        "./panatlon azul.jpg",
        "./pampero-beige.jpg"
    ],
        "costura-camel": ["./blue-jeans-fabric-details.jpg",
        "./jean azul prueba.webp"
    ],
    "jean-clasico": ["./jean clasico.jpg",
        "./jean clasico front.PNG",
        "./jean clasico espalda.JPG"],

"jean-oxido": ["./jean oxido (1).jpg",
    "./jean oxido front.JPG",
    "./jean oxido back (2).JPG"],
    
    "clasico-gris": ["./clasico gris f.JPG",
        "./clasico gris b.JPG" ],

   "clasico-gris-oscuro": ["./gris oscuro front.JPG", 
    "./gris oscuro front 2.JPG",
    "./gris oscuro.JPG"],
    
    "bull-negro": ["./bull negro front.JPG",
        "./bull negro back.JPG"],

"blue-black": ["./blue black.JPG",
    "./blue black back.JPG"],

    "campera-lana-lisa":["./campera lana lisa con bolsillo",]

   
};

document.querySelectorAll("img").forEach(img => {
    let index = 0;
    img.addEventListener("click", function() {
        const images = productImages[this.id]; // Obtiene las imágenes del producto específico
        if (images) {
            index = (index + 1) % images.length;
            this.src = images[index];
        }
    });
});
//cambio de icono pasa fotos a blanco o negro
document.querySelector(".info-icon").classList.toggle("blanco");



// Confirmar compra
function confirmPurchase() {
    const buyerName = document.getElementById('buyer-name').value.trim();
    const buyerPhone = document.getElementById('buyer-phone').value.trim();
    const buyerEmail = document.getElementById('buyer-email').value.trim();
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Verificar que todos los campos estén completos
    if (!buyerName || !buyerPhone || !buyerEmail || cart.length === 0) {
        alert("Por favor, complete todos los campos y agregue al menos un producto al carrito antes de confirmar la compra.");
        return;
    }

    let cartDetails = `Detalles del Carrito:\n`;
    cart.forEach(product => {
        cartDetails += `${product.quantity} x ${product.name} (Talle: ${product.talle}) - Precio: $${(product.price * product.quantity).toFixed(2)}\n`;
    });

    setTimeout(() => {
        const message = `Hola, soy ${buyerName}. Quiero comprar.\nTeléfono: ${buyerPhone}\nEmail: ${buyerEmail}\n${cartDetails}`;
        const encodedMessage = encodeURIComponent(message);

        // Detectar si el usuario está en un dispositivo móvil
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const whatsappURL = isMobile 
            ? `https://api.whatsapp.com/send?phone=5491154511489&text=${encodedMessage}` 
            : `https://web.whatsapp.com/send?phone=5491154511489&text=${encodedMessage}`;

        window.location.href = whatsappURL;
    }, 2000);

    // Vaciar el carrito y reiniciar el contador
    localStorage.removeItem('cart');
    updateCartCounter(); // Reiniciar manualmente el contador
    displayCart();
}

// Función para actualizar el contador manualmente
function updateCartCounter() {
    const cartCounterElement = document.getElementById('cart-counter'); // Ajusta el ID según tu HTML
    if (cartCounterElement) {
        cartCounterElement.textContent = "0"; // Reinicia el contador a cero
    }
}
//detectar dispositivo para mensaje de whatsapp
function detectarDispositivo() {
    var urlMovil = "whatsapp://send?phone=541154511489";
    var urlWeb = "https://wa.me/5491154511489";

    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = urlMovil;
    } else {
      window.location.href = urlWeb;
    }
  }
  