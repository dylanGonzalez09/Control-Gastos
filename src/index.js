// Variables del DOM
const filtro = document.getElementById('filtro');
const categoriaFormulario = document.getElementById('categoria-formulario');
const gastoinput = document.getElementById('gasto-formulario');
const descripcionInput = document.getElementById('descripcion');
const gastosDiv = document.querySelector('.gastos');
const alertaDiv = document.querySelector('.alerta');
const fechaInput = document.querySelector('#fecha');
const gastoMaximoDiv = document.querySelector('.gasto-maximo');
const gastoMinimoDiv = document.querySelector('.gasto-minimo');
const btnAgregar = document.querySelector('#agregar');
const graficoDiv = document.querySelector('.grafico');

// Variables globales
let categorias = ['salud', 'alimentacion', 'transporte', 'educacion', 'arriendo', 'servicios publicos', 'entretenimiento', 'ropa', 'vacaciones', 'vehiculo'];
let gastoConvertido;
let gastos = [];
let editando = false;
let idEditado;
let gastosFiltrados;
let filtroAlmacenado;

document.addEventListener('DOMContentLoaded', () =>{
    // Obtener los gastos del local storage y almacenarlos en el mismo arreglo o uno vacio si  no hay gastos
    gastos = JSON.parse(localStorage.getItem('gastos')) || [];

    if(gastos.length === 0){
        // Alerta no hay gastos
        noGastos();
    }else{
        mostrarGastos(gastos);
    }
    
    llenarSelects();
    calcularValores();
    grafico();

    filtro.addEventListener('change', e => {
        filtrarGasto(e);
        filtroAlmacenado = e.target.value;
        
        if(gastosFiltrados.length === 0){
            // Alerta no hay gastos
            noGastos(e.target.value);
        }
    });    
});

document.addEventListener('submit', e => {
    e.preventDefault();

    const anioActual = new Date().getFullYear();
    const anioFormulario = new Date(fechaInput.value).getFullYear();

    btnAgregar.textContent = 'Agregar';
    gastoConvertido = Number(gastoinput.value);

    // Validar formulario de gastos
    if ([categoriaFormulario.value, gastoinput.value, descripcionInput.value, fechaInput.value].includes('')) {
        mostrarAlerta('error', 'ERROR! NO PUEDEN HABER CAMPOS VACIOS', alertaDiv);
        return;
    }

    if(anioFormulario !== anioActual){
        mostrarAlerta('error', 'EL AÑO DEBE SER EL ACTUAL', alertaDiv);
        return;
    }

    if (isNaN(gastoConvertido) || gastoConvertido <= 0) {
        mostrarAlerta('error', 'ERROR! DEBES INTRODUCIR UN VALOR DE GASTO VALIDO', alertaDiv);
        return;
    }

    if (categoriaFormulario.value === '-- SELECCIONAR --') {
        mostrarAlerta('error', 'ERROR! DEBES SELECCIONAR UNA CATEGORIA', alertaDiv);
        return;
    }

    if(editando){
        // Agregar gasto editado
        agregarGastoEditado();
        editando = false;
        mostrarAlerta('exito', 'GASTO EDITADO CORRECTAMENTE!', alertaDiv);
        
    }else{
        // Agregar gasto
        agregarGasto();
        mostrarAlerta('exito', 'GASTO AGREGADO CORRECTAMENTE!', alertaDiv);
    }

    calcularValores();
    grafico();
    
    // Resetear el formulario
    e.target.reset();
    
    // Verificar si no hay filtros para mostrar todos los gastos
    if(filtro.value === '-- SELECCIONAR --'){
        // Mostrar e imprimir gastos en el DOM
        mostrarGastos(gastos);
    }else{
        const gastosFiltrados = gastos.filter(gasto => gasto.categoria  === filtro.value);
        mostrarGastos(gastosFiltrados);
    }

    if(filtroAlmacenado){
        if(gastosFiltrados.length === 0){
            noGastos(filtroAlmacenado);
        }
    }

});

function llenarSelects() {
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria.toUpperCase();

        const option2 = document.createElement('option');
        option2.value = categoria;
        option2.textContent = categoria.toUpperCase();

        filtro.appendChild(option);
        categoriaFormulario.appendChild(option2);

    });
}

function mostrarAlerta(tipo, mensaje, alerta) {

    if (tipo === 'error') {
        alerta.classList.remove('exito');
        alerta.classList.add('error');
    } else {
        alerta.classList.remove('error');
        alerta.classList.add('exito');
    }

    alerta.textContent = mensaje.toUpperCase();

    setTimeout(() => {
        alerta.classList.remove('error');
        alerta.classList.remove('exito');
        alerta.textContent = '';
    }, 2000);


}

function noGastos(categoria){
    const noGastoDiv = document.createElement('div');
    const p = document.createElement('p');

    noGastoDiv.classList.add('no-gasto-alerta');

    if(categoria === '-- SELECCIONAR --' || categoria === undefined){
        p.textContent = `NO HAY GASTOS`;
    }
    
    if(categoria && categoria !== '-- SELECCIONAR --'){
        p.textContent = `NO HAY GASTOS CON EL FILTRO DE ${categoria.toUpperCase()}`;
    }

    noGastoDiv.appendChild(p);
    gastosDiv.appendChild(noGastoDiv);

    if(gastos.length && categoria === '-- SELECCIONAR --'){
        noGastoDiv.remove();
    }

}

function agregarGastoEditado(){

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    const gastoEditado = {
        categoria: categoriaFormulario.value,
        gastoValor: gastoConvertido,
        descripcion: descripcionInput.value,
        id: idEditado,
        fecha: fechaInput.value,
        mesString: meses[new Date(fechaInput.value).getMonth()]
    }

    const gastosEditados = gastos.filter(gasto => gasto.id !== idEditado);
    gastosEditados.push(gastoEditado);

    gastos = gastosEditados;

    localStorage.setItem('gastos', JSON.stringify(gastos));
}

function agregarGasto() {

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const gasto = {
        categoria: categoriaFormulario.value,
        gastoValor: gastoConvertido,
        descripcion: descripcionInput.value,
        id: Date.now(),
        fecha: fechaInput.value,
        mesString: meses[new Date(fechaInput.value).getMonth()]
    }

    gastos = [...gastos, gasto];

    // Agregar gastos al local storage
    localStorage.setItem('gastos', JSON.stringify(gastos));
}

function mostrarGastos(gastos){

    // Limpiar HTML
    limpiarHTML(gastosDiv);

    gastos.forEach(gasto => {

        const {categoria, gastoValor, descripcion, fecha, id} = gasto;

        const gastoDiv = document.createElement('div');
        const gastoInfo = document.createElement('div');
        const gastoInfoBtn = document.createElement('div');

        const categoriaP = document.createElement('p');
        const gastoP = document.createElement('p');
        const descripcionP = document.createElement('p');
        const fechaP = document.createElement('p');
        const btnEliminar = document.createElement('button');
        const btnEditar = document.createElement('button');

        gastoDiv.classList.add('gasto');
        gastoInfo.classList.add('gasto-info');
        gastoInfoBtn.classList.add('gasto-info-btn');
        
        categoriaP.classList.add('categoria-gasto');
        categoriaP.innerHTML = `Categoria: <span>${categoria.toUpperCase()}</span>`;

        descripcionP.classList.add('descripcion-gasto');
        descripcionP.innerHTML = `Descripcion: <span>${descripcion.replace(/\b\w/g, l => l.toUpperCase())}</span>`;

        fechaP.classList.add('fecha-gasto');
        fechaP.innerHTML = `Fecha: <span>${fecha}</span>`;

        gastoP.classList.add('gasto-gasto');
        gastoP.innerHTML = `Gasto:<span> $ ${gastoValor.toFixed(2)}</span>`;

        btnEliminar.classList.add('btn-eliminar-gasto');
        btnEliminar.textContent = 'Eliminar Gasto';
        btnEliminar.onclick = function(){
            eliminarGasto(id, filtro.value);
            calcularValores();
            grafico();

            if(filtroAlmacenado){

                if(gastosFiltrados.length === 0){
                    noGastos(filtroAlmacenado);
                }
            }
            
            if(gastos.length === 1){
                noGastos();
            }
        }

        btnEditar.classList.add('btn-editar-gasto');
        btnEditar.textContent = 'Editar Gasto';
        btnEditar.onclick = function(){
            editarGasto(gasto);
        }

        // Agregar datos en el contenedor de gasto
        gastoInfo.appendChild(categoriaP);
        gastoInfo.appendChild(descripcionP);
        gastoInfo.appendChild(fechaP);
        gastoInfo.appendChild(gastoP);
        
        gastoInfoBtn.appendChild(btnEditar);
        gastoInfoBtn.appendChild(btnEliminar);

        // Agregar gasto al contenedor de gastos
        gastoDiv.appendChild(gastoInfo);
        gastoDiv.appendChild(gastoInfoBtn);

        gastosDiv.appendChild(gastoDiv);
        
    });
}

function eliminarGasto(id, filtro){

    const gastosEliminados = gastos.filter(gasto => gasto.id !== id);
    gastos = gastosEliminados;
    localStorage.setItem('gastos', JSON.stringify(gastos));
    
    if(filtro === '-- SELECCIONAR --'){
        mostrarGastos(gastos);
    }else{
        gastosFiltrados = gastos.filter(gasto => gasto.categoria  === filtro);
        
        mostrarGastos(gastosFiltrados);
    }    
}

function editarGasto(gasto){
    btnAgregar.textContent = 'Guardar';
    
    const {categoria, gastoValor, descripcion, id, fecha} = gasto;

    // Llenar los campos del formulario
    categoriaFormulario.value = categoria;
    gastoinput.value = gastoValor;
    descripcionInput.value = descripcion;
    fechaInput.value = fecha;

    editando = true;
    idEditado = id;
}

function filtrarGasto(e){

    if(e.target.value === '-- SELECCIONAR --'){
        mostrarGastos(gastos);
        return;
    }

    // Gastos filtrados

    gastosFiltrados = gastos.filter(gasto => gasto.categoria  === e.target.value);

    if(gastosFiltrados.length > 0){
        mostrarGastos(gastosFiltrados);
        
    }else{
        // Mostrar mensaje cuando no hay gastos
        limpiarHTML(gastosDiv);
    }

}

function limpiarHTML(elemento){
    while(elemento.firstChild){
        elemento.removeChild(elemento.firstChild);
    }
}

function calcularValores(){
    let gastosNumeros = [];

    gastos.forEach(gasto => {
        // Agregar cada valor del gasto al arreglo
        const {gastoValor} = gasto;
        gastosNumeros.push(gastoValor);
    });

    // Calcular el gasto minimo y el maximo
    let gastoMaximo = Math.max(...gastosNumeros);
    let gastoMinimo = Math.min(...gastosNumeros);
    
    if(gastoMaximo === -Infinity){
        gastoMaximo = 0;
    }

    if (gastoMinimo === Infinity) {
        gastoMinimo = 0;
    }
    
    // Asignar gastos en el DOM
    gastoMaximoDiv.innerHTML = `Gasto Maximo: $ <span class='gasto-max-min'>${gastoMaximo.toFixed(2)}<span/>`;
    gastoMinimoDiv.innerHTML = `Gasto Minimo: $ <span class='gasto-max-min'>${gastoMinimo.toFixed(2)}<span/>`;
}

function grafico(){

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    let gastoMeses = [calcularTotalMes('Enero'), calcularTotalMes('Febrero'), calcularTotalMes('Marzo'), calcularTotalMes('Abril'), calcularTotalMes('Mayo'), calcularTotalMes('Junio'), calcularTotalMes('Julio'), calcularTotalMes('Agosto'), calcularTotalMes('Septiembre'), calcularTotalMes('Octubre'), calcularTotalMes('Noviembre'), calcularTotalMes('Diciembre')];

    limpiarHTML(graficoDiv);

    const canvas = document.createElement('canvas');
    canvas.classList.add('grafico-canvas');

    graficoDiv.appendChild(canvas);

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: '# de Gastos',
          data: gastoMeses,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
}

function calcularTotalMes(mes){

    let i = 0;
    const gastosMes = gastos.filter(gasto => gasto.mesString === mes);

    gastosMes.forEach(gasto => {
        const {gastoValor} = gasto;

        i += gastoValor;

    });
    
    return i;
}