// validateForm.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
  
    form.addEventListener('submit', (event) => {
      let errors = [];
      console.log('Formulario enviado. Iniciando validación.'); // Verifica que el script se ejecute
  
      // Validación de nombre
      if (nameInput.value.trim() === '') {
        errors.push('El nombre es obligatorio.');
        nameInput.placeholder = 'El nombre es obligatorio.';
        nameInput.classList.add('error');
      } else {
        nameInput.placeholder = 'Nombre';
        nameInput.classList.remove('error');
      }
  
      // Validación de correo electrónico
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value)) {
        errors.push('El correo electrónico no es válido.');
        emailInput.placeholder = 'El correo electrónico no es válido.';
        emailInput.classList.add('error');
      } else {
        emailInput.placeholder = 'Correo Electrónico';
        emailInput.classList.remove('error');
      }
  
      // Validación de mensaje
      if (messageInput.value.trim() === '') {
        errors.push('El mensaje es obligatorio.');
        messageInput.placeholder = 'El mensaje es obligatorio.';
        messageInput.classList.add('error');
      } else {
        messageInput.placeholder = 'Mensaje';
        messageInput.classList.remove('error');
      }
  
      // Prevenir el envío del formulario si hay errores
      if (errors.length > 0) {
        event.preventDefault();
        console.log('Errores encontrados:', errors); // Verifica los errores encontrados
      } else {
        console.log('Formulario válido.'); // Verifica que el formulario sea válido
      }
    });
  });
  
  