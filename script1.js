function createCard(product) {
    return `
    <div class="product-card">
        <h2>${product.title}</h2>
        <img src="${product.image}" alt="${product.title}">
        <p>${product.description}</p>
        <p>Precio: $${product.price}</p>
        <button class="add-to-cart" data-id="${product.id}" data-name="${product.title}" data-price="${product.price}">Agregar al carrito</button>
    </div>`;
}
// Función para mostrar los datos en el HTML y añadir eventos de clic
async function displayData() {
    const main = document.querySelector('.product-container');
    const data = await fetchData();
    if (data && Array.isArray(data)) {
        main.innerHTML += data.map(createCard).join('');
    }
// Añadir eventos de clic a los nuevos botones "Agregar al carrito"
document.querySelectorAll('.increase-quantity').forEach(button => {
    button.addEventListener('click', function() {
        const productId = parseInt(button.getAttribute('data-id'));
        const productTalle = button.getAttribute('data-talle');
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Buscar el producto dentro del carrito para obtener su nombre y precio
        const product = cart.find(item => item.id === productId && item.talle === productTalle);
        
        if (product) {
            addToCart(productId, product.name, product.price, productTalle, 1); // ✅ Ahora los valores son correctos
        } else {
            console.error("Error: Producto no encontrado en el carrito.");
        }
    });
});

}


// Ejecutar la función al cargar la página
document.addEventListener('DOMContentLoaded', displayData);
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

    // **Actualizar y almacenar el contador en `localStorage` correctamente**
    let totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    localStorage.setItem("cartCount", totalCount);
    
    updateCartCount();
    displayCart();
}

window.addEventListener("storage", (event) => {
    if (event.key === "cartCount") {
        document.querySelectorAll(".cart-count").forEach(el => el.textContent = event.newValue);
    }
});


function updateCartCount() {
    let totalCount = localStorage.getItem("cartCount");

    // Si no hay datos en localStorage, inicializarlo correctamente
    if (!totalCount || isNaN(totalCount)) {
        totalCount = 0;
        localStorage.setItem("cartCount", totalCount);
    }

    document.querySelectorAll(".cart-count").forEach(el => el.textContent = totalCount);
}


// Función para eliminar una unidad del producto del carrito
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

// Función para mostrar los productos en el carrito
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
// Añadir funcionalidad a los botones de eliminación y aumento de cantidad
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
            addToCart(productId, null, null, productTalle, 1); // Incrementar la cantidad en 1
        });
    });
}
// Función para actualizar el total del carrito
function updateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartTotal = cart.reduce((total, product) => total + (product.price * product.quantity), 0);
    document.querySelector('.cart-total').textContent = cartTotal.toFixed(2);
}
// Función para mostrar las imágenes adicionales al hacer clic en "Ver más"
function addViewMoreButton() {
    document.querySelectorAll('.ver-mas').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            const extraImages = document.getElementById(`extra-images-${productId}`);
            if (extraImages.style.display === 'none' || extraImages.style.display === '') {
                extraImages.style.display = 'block';
                button.textContent = "Ver menos";
            } else {
                extraImages.style.display = 'none';
                button.textContent = "Ver más";
            }
        });
    });
}
// Función para inicializar la página
function initPage() {
    displayCart();
    addViewMoreButton();

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(button.getAttribute('data-id'));
            const productName = button.getAttribute('data-name');
            const productPrice = parseFloat(button.getAttribute('data-price'));
            const productTalle = document.querySelector(`#talle-${productId}`).value;
            const productQuantity = parseInt(document.querySelector(`#cantidad-${productId}`).value);
            if (productTalle && productQuantity > 0) {
                addToCart(productId, productName, productPrice, productTalle, productQuantity);
                changeButtonState(button);
            } else {
                alert("Por favor, selecciona un talle y una cantidad válida.");
            }
        });
    });
    
      
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
          const pantIcon = document.getElementById('pant-icon');
          const buttonRect = event.target.getBoundingClientRect(); // Coordenadas del botón
          const cart = document.querySelector('.cart');
      
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
      //let cartItemCount = 0; // Contador global de ítems en el carrito

// Selecciona todos los botones "Agregar al carrito"
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', (event) => {
    // Encuentra el contenedor del producto relacionado al botón clicado
    const productCard = event.target.closest('.product-card');
    const quantityInput = productCard.querySelector('.cantidad'); // Selecciona el campo de cantidad

    // Captura el valor de la cantidad seleccionada
    const quantity = parseInt(quantityInput.value, 10);

    // Validación: suma solo si la cantidad es válida y mayor que cero
    if (!isNaN(quantity) && quantity > 0) {
      cartItemCount += quantity; // Suma la cantidad seleccionada al contador global

      // Actualiza el contador visual del carrito
      const cartCount = document.querySelector('.cart-count');
      cartCount.textContent = cartItemCount;
      
      // Animación visual del contador (opcional)
      cartCount.style.transition = 'all 0.5s ease';
      cartCount.style.transform = 'scale(1.2)';
      setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
      }, 500);

      console.log(`Añadido: ${quantity} producto(s). Total en el carrito: ${cartItemCount}`);
    } else {
      console.log('Selecciona una cantidad válida antes de agregar al carrito.');
    }
  });
});

// Vaciar el carrito y reiniciar el contador
document.querySelector('.clear-cart').addEventListener('click', () => {
  cartItemCount = 0; // Reinicia el contador del carrito
  const cartCount = document.querySelector('.cart-count');
  cartCount.textContent = cartItemCount; // Actualiza el número en el carrito
  console.log('El carrito ha sido vaciado.');
});




      
      
document.querySelector('.clear-cart').addEventListener('click', function() {
        localStorage.removeItem('cart');
        displayCart();
    });
 document.getElementById('confirmar-carrito-btn').addEventListener('click', function() {
        document.getElementById('dialog').style.display = 'block';
    });

    document.getElementById('confirmation-form').addEventListener('submit', function(event) {
        event.preventDefault();
         // Validar número de teléfono
        const phoneInput = document.getElementById('buyer-phone');
        const phonePattern = /^[0-9]{10,15}$/; // Permitir solo números de 10 a 15 dígitos
        if (!phonePattern.test(phoneInput.value)) {
            alert('Por favor, ingrese un número de teléfono válido.');
            return;
        }// Validar correo electrónico
        const emailInput = document.getElementById('buyer-email');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) {
            alert('Por favor, ingrese un correo electrónico válido.');
            return;
        }
        // Obtener los datos del comprador
    const buyerName = document.getElementById('buyer-name').value;
    const buyerPhone = document.getElementById('buyer-phone').value;
    const buyerEmail = document.getElementById('buyer-email').value;
// Obtener los productos del carrito
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let cartDetails = `Detalles del Carrito:\n`;
    cart.forEach(product => {
        cartDetails += `${product.quantity} x ${product.name} (Talle: ${product.talle}) - Precio: $${(product.price * product.quantity).toFixed(2)}\n`;
    });
    document.getElementById('comprar-btn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevenir el envío del formulario
    // Datos del formulario
        const buyerName = document.getElementById('buyer-name').value;
        const buyerPhone = document.getElementById('buyer-phone').value;
        const buyerEmail = document.getElementById('buyer-email').value;
    
       
        document.addEventListener('DOMContentLoaded', function() {
           
           
            document.getElementById('confirmation-form').addEventListener('submit', function(event) {
                event.preventDefault();
                
                // Validar datos del formulario
                const buyerName = document.getElementById('buyer-name').value;
                const buyerPhone = document.getElementById('buyer-phone').value;
                const buyerEmail = document.getElementById('buyer-email').value;
                
              
                
        
                // Enviar el correo utilizando EmailJS
                emailjs.send('service_9olg4ok', 'template_hsl3vca', templateParams)
                    .then(function(response) {
                        console.log('Correo enviado exitosamente!', response.status, response.text);
                        document.getElementById('confirmation-message').style.display = 'block';
                    }, function(error) {
                        console.log('Fallo en el envío del correo...', error);
                    });
            });
        });
         
    // Enviar el correo utilizando EmailJS
        emailjs.send('service_9olg4ok', 'template_hsl3vca', templateParams)
            .then(function(response) {
                console.log('Correo enviado exitosamente!', response.status, response.text);
                document.getElementById('confirmation-message').style.display = 'block';
            }, function(error) {
                console.log('Fallo en el envío del correo...', error);
            });
    });
    // Mostrar mensaje de confirmación estilizado
const confirmationMessage = document.getElementById('confirmation-message');
confirmationMessage.innerHTML = `
  <h2>Compra Confirmada</h2>
  <p>¡Gracias por su compra, ${document.getElementById('buyer-name').value}Ud.
 será redirigido a WhatsApp donde podrá confirmar su compra con todos los detalles proporcionados y le indicaremos la forma de pago. Si tiene alguna pregunta adicional, no dude en contactarnos. ¡Gracias por confiar en nosotros!</p>
`;
confirmationMessage.style.display = 'block';
document.getElementById('dialog').style.display = 'none';
// Esperar 5 segundos antes de redirigir a WhatsApp
setTimeout(() => {
  // Mensaje a enviar por WhatsApp
  const message = `Hola, soy ${document.getElementById('buyer-name').value}. Quiero comprar. Mis datos son:\nTeléfono: ${document.getElementById('buyer-phone').value}\nEmail: ${document.getElementById('buyer-email').value}\n${cartDetails}`;

  // Codificar el mensaje para la URL
  const encodedMessage = encodeURIComponent(message);

  // Redirigir a WhatsApp con el mensaje
  window.location.href = `https://wa.me/5491154511489?text=${encodedMessage}`;

  // Ocultar el mensaje de confirmación después de redirigir
  confirmationMessage.style.display = 'none';
}, 2000);
// Vaciar el carrito después de la confirmación
        localStorage.removeItem('cart');
        displayCart();
    });
}
// Ejecutar la función initPage cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initPage);

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

document.getElementById("back-to-top").addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
//cambio de imagenes
const images = [
    "./imagenes/blue-jeans-fabric-details.jpg",
    "./imagenes/.jpg",
    "./foto local.jpg",
    "./imagenes/pantalon-trasero.jpg"
];
let index = 0;

document.getElementById("main-image").addEventListener("click", function() {
    index = (index + 1) % images.length; // Cambia la imagen en el mismo lugar
    this.src = images[index];
});