document.getElementById('scraping-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Evita el envío del formulario y recarga de la página

    const url = document.getElementById('url').value.trim();  // Obtén la URL
    const xpath = document.getElementById('xpath').value.trim();  // Obtén el XPath

    if (!url || !xpath) {
        alert('Por favor, ingresa tanto una URL como un XPath.');
        return;
    }

    // Usamos AllOrigins para evitar problemas de CORS
    const proxiedUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);

    // Función para realizar scraping utilizando XPath
    async function scrapeData(url, xpath) {
        try {
            const response = await fetch(proxiedUrl);  // Realizamos la solicitud a la URL a través de AllOrigins
            const text = await response.text();  // Obtenemos el contenido HTML como texto

            // Crear un documento temporal para poder usar XPath
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            // Usar XPath para obtener los elementos
            const result = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
            const nodes = [];
            let node = result.iterateNext();
            while (node) {
                // Si el nodo es una imagen, guardamos el src
                if (node.tagName.toLowerCase() === 'img') {
                    const imageUrl = node.getAttribute('src');
                    if (imageUrl) {
                        nodes.push(imageUrl);
                    }
                } else {
                    const nodeText = node.textContent.trim(); // Obtener el texto y eliminar los espacios en blanco
                    if (nodeText) { // Solo agregar el nodo si tiene contenido
                        nodes.push(nodeText);
                    }
                }
                node = result.iterateNext();
            }

            // Mostrar los resultados en formato lista con puntos
            const resultDiv = document.getElementById('result');
            if (nodes.length > 0) {
                resultDiv.innerHTML = '<h2 class="text-xl font-bold">Resultados:</h2>';
                const ul = document.createElement('ul');  // Crear un contenedor de lista
                ul.classList.add('list-disc', 'pl-5');  // Añadir clases de Tailwind para listas con puntos (viñetas)
                nodes.forEach(item => {
                    const li = document.createElement('li');  // Crear cada elemento de lista
                    if (item.startsWith('http')) {  // Si es una URL de imagen
                        const img = document.createElement('img');  // Crear un elemento <img>
                        img.src = item;  // Asignar la URL de la imagen
                        img.alt = 'Imagen';  // Texto alternativo
                        img.classList.add('max-w-xs');  // Tamaño de la imagen (opcional)
                        li.appendChild(img);  // Añadir la imagen al <li>
                    } else {
                        li.textContent = item;  // Si no es una imagen, es solo texto
                    }
                    ul.appendChild(li);  // Añadir el <li> a la lista
                });
                resultDiv.appendChild(ul);  // Añadir la lista a la página
            } else {
                resultDiv.innerHTML = '<p class="text-red-500">No se encontraron resultados con ese XPath.</p>';
            }
        } catch (error) {
            console.error('Error al realizar scraping:', error);
            alert('Hubo un error al intentar hacer scraping. Verifica la URL o el XPath.');
        }
    }

    // Llamar a la función de scraping
    scrapeData(url, xpath);
});
