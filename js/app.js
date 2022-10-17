function iniciarApp() {
    const selectCategorias = document.getElementById('categorias')
    const resultado = document.getElementById('resultado')
    const modal = new bootstrap.Modal('#modal', {})
    const favoritosDiv = document.querySelector('.favoritos')

    if(selectCategorias) {
        selectCategorias.addEventListener('change', seleccionarCategoria)
        obtenerCategorias()
    }

    if(favoritosDiv) {
        obtenerFavoritos()
    }

    function obtenerCategorias() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories))
    }

    function mostrarCategorias(categorias = []) {
        categorias.forEach( categoria => {
            const { strCategory } = categoria
            const option = document.createElement('option')
            option.value = strCategory
            option.textContent = strCategory
            
            selectCategorias.appendChild(option)
        })
    }
    
    function seleccionarCategoria(e) {
        const categoria = e.target.value
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals))
    }

    function mostrarRecetas(recetas = []) {
        limpiarHTML(resultado)

        const heading = document.createElement('h2')

        heading.classList.add('text-center', 'text-black', 'my-5')
        heading.textContent = recetas.length ? 'Resultados' : 'No hay recetas disponibles'

        resultado.appendChild(heading)
        // Iterar en los resultados
        recetas.forEach(receta => {
            const { idMeal, strMeal, strMealThumb } = receta
            const recetaContenedor = document.createElement('div')
            const recetaCard = document.createElement('div')
            const recetaImage = document.createElement('img')
            const recetaBody = document.createElement('div')
            const recetaHeading = document.createElement('h3')
            const recetaBtn = document.createElement('button')

            recetaContenedor.classList.add('col-md-4')
            recetaCard.classList.add('card', 'mb-4')
            recetaImage.classList.add('card-img-top')
            recetaImage.alt = `Imagen de la receta ${strMeal ?? receta.title}`
            recetaImage.src = strMealThumb ?? receta.image
            recetaBody.classList.add('card-body')
            recetaHeading.classList.add('card-title', 'mb-3')
            recetaHeading.textContent = strMeal ?? receta.title
            recetaBtn.classList.add('btn', 'btn-danger', 'w-100')
            recetaBtn.textContent = 'Ver receta'
            // recetaBtn.dataset.bsTarget = '#modal'
            // recetaBtn.dataset.bsToggle = 'modal'

            recetaBtn.onclick = function () {
                seleccionarReceta(idMeal ?? receta.id)
            }

            // Insertar en el HTML
            recetaBody.appendChild(recetaHeading)
            recetaBody.appendChild(recetaBtn)
            recetaCard.appendChild(recetaImage)
            recetaCard.appendChild(recetaBody)
            recetaContenedor.appendChild(recetaCard)
            resultado.appendChild(recetaContenedor)
        })
    }

    function seleccionarReceta(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.meals[0]))
    }

    function mostrarRecetaModal(receta) {
        const { idMeal, strInstructions, strMeal, strMealThumb } = receta
        const modalTitle = document.querySelector('.modal .modal-title')
        const modalBody = document.querySelector('.modal .modal-body')
        const listGroup = document.createElement('ul')
        const modalFooter = document.querySelector('.modal-footer')
        const btnFav = document.createElement('button')
        const btnCerrar = document.createElement('button')

        modalTitle.textContent = strMeal
        modalBody.innerHTML =
        `
            <img class="img-fluid" src="${strMealThumb}" alt="imagen de ${strMeal}" />
            <h3 class="my-3">Instrucciones:</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y cantidades:</h3>
        `

        listGroup.classList.add('list-group')

        for(let i = 1; i <= 20; i++) {
            if(receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]
                const ingredienteLi = document.createElement('li')

                ingredienteLi.classList.add('list-group-item')
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`

                listGroup.appendChild(ingredienteLi)
            }
        }

        modalBody.appendChild(listGroup)

        limpiarHTML(modalFooter)

        btnFav.classList.add('btn', 'btn-danger', 'col')
        btnFav.textContent = existeStorage(idMeal) ? 'Eliminar favorito' : 'Guardar Favorito'
        btnFav.onclick = function () {
            if(existeStorage(idMeal)) {
                eliminarFavorito(idMeal)
                btnFav.textContent = 'Guardar favorito'
                mostrarToast('Eliminado correctamente')
                return
            }

            agregarFavorito({
                id: idMeal,
                title: strMeal,
                image: strMealThumb
            })
            btnFav.textContent = 'Eliminar favorito'
            mostrarToast('Agregado correctamente')
        }

        btnCerrar.classList.add('btn', 'btn-secondary', 'col')
        btnCerrar.textContent = 'Cerrar'
        btnCerrar.onclick = function() {
            modal.hide()
        }

        modalFooter.appendChild(btnFav)
        modalFooter.appendChild(btnCerrar)

        modal.show()
    }

    function agregarFavorito(receta) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]))
    }
    
    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id)
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos))
    }

    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
        return favoritos.some(favorito => favorito.id === id)
    }

    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast')
        const toastBody = document.querySelector('.toast-body')
        const toast = new bootstrap.Toast(toastDiv)

        toastBody.textContent = mensaje
        toast.show()
    }

    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
        const noFavoritos = document.createElement('p')

        if(favoritos.length) {
            mostrarRecetas(favoritos)
            return
        }

        noFavoritos.textContent = 'No hay favoritos aún'
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5')
        resultado.appendChild(noFavoritos)
    }

    function limpiarHTML(selector) {
        while(selector.firstChild) {
            selector.removeChild(selector.firstChild)
        }
    }
}
document.addEventListener('DOMContentLoaded', iniciarApp)