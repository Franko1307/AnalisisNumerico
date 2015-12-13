//Funcion de chequeo para que no se pongan trolls los usuarios a la hora de evaluar x
function checaLetra (evt){
 	var charCode = (evt.which) ? evt.which : event.keyCode
 	if (charCode == 46 )return true
 	if (charCode > 31 && (charCode < 48 || charCode > 57)) return false
 	return true
}
$(document).ready(function() {
$('#fileDisplayArea').hide();
$('#ERRORES').hide()
$('#CONTAINER').hide()
window.expresion = ""
//Por si el usuario se anima a evaluar la x
$('#evaluarbotton').click(function(){

	//Vacio los campos
	$('#resultado').empty()
	//Obtengo de la variable global la cadena
	var mystring = window.expresion
	//Obtengo el valor que quieren evaluar
	var evaluar = $('input#IngreseX').val()
	//Si se pasan de listos y no ponen nada pues simplemente termino
	if (evaluar === "") return
	var parser = math.parser()
	//Asigno la variable x
	parser.eval("x = "+evaluar)
	//Calculo el resultado y lo mando desplegar.
	$('#resultado').append("Resultado : "+parser.eval(mystring))

})
$('#ordenar').click(function()
{	
	try{

		//Vacio campos
		$('#ERRORES').hide()
		$('#ERRORES').empty()
		$('#CONTAINER').show()
		$('#resultado').empty()

		//Obtengo la matriz del archivo
		arr = matriz()

		//Le extraego los puntos
		var vectorPuntos = vectorIs(arr)
		//Extraego el renglón de los datos chidos
		var vector = obtenDatos(arr)

		//para chequear que todo vaya bien
		console.log(vectorPuntos)
		console.log(vector)
		console.log(arr)

		//Almaceno las multiplicaciones
		arregloMultiplicaciones = multiplicaPuntos(vectorPuntos)

		console.log(arregloMultiplicaciones)

		//Transformo todo a una expresión
		var expresion = transformaAExpresion(vector, arregloMultiplicaciones)
		//Guardo la cadena en una variable global para poder accesarla con otra función luego si el usuario quiere evaluar la x
		window.expresion = expresion
		//la checo por si acaso
		console.log(expresion)

		//Abilito la opción donde mostraré la función
		$('#funcion').show()
		$('#funcion').empty()
		//Transformo la cadena a latex y lo mando imprimir
		var node = math.parse(expresion)
		$('#funcion').append('$$F_{'+vectorPuntos.length+'}(x):'+node.toTex()+'$$')
		//Habilito la opción para que el usuario pueda evaluar la x
		$('#CONTAINER').show()

	MathJax.Hub.Queue(["Typeset",MathJax.Hub])
	}catch(e){
		MathJax.Hub.Queue(["Typeset",MathJax.Hub])
		$('#CONTAINER').hide()
		$('#ERRORES').show()
		$('#ERRORES').empty()
		$('#ERRORES').append(e)
	}
	
})
//Esto lo transforma a una cadena toda la expresión
var transformaAExpresion = function (numeros, multipliaciones)
{
	var expresion = ""

	expresion += numeros[0]

	for (var x = 1; x <= multipliaciones.length; ++x)
		expresion += signo(numeros[x])+multipliaciones[x-1]
	
	return expresion
}
//Esta función me crea un arreglo donde almaceno todas las operaciones del estilo (x+1) , (x+1)(x+3) etc..
var multiplicaPuntos = function (vector)
{
	var arreglo = []

	arreglo[0] = "(x"+signoRaices(vector[0])+")"

	for (var x = 1; x < vector.length; ++x)
		arreglo[x] = arreglo[x-1]+"(x"+signoRaices(vector[x])+")"

	return arreglo

}
//Aqui es igual a la función de abajo pero esta es normalita, la de abajo es para las expresiones (x-3)(x+3) por ejemplo
var signo = function (entero)
{
	if (entero < 0) return entero
	if (entero > 0) return "+"+entero
	return ""
}
//Funcion auxiliar que pone los símbolos '+' a los números positivos para imprimirlos y que se vea todo bien bonito
var signoRaices = function (entero)
{
	if (entero < 0) return "+" + Math.abs(entero)
	if (entero > 0) return "-"+entero
	return ""
}
//Vector de puntos
var vectorIs = function(matriz)
{
	var array = []
	for (var x in matriz)
		array[x] = matriz[x][0]
	array.pop()
	return array
}
//Esta función regresa el primer renglón de la matriz leída y ya procesada, es decir me da los datos buenos.
var obtenDatos = function(matriz)
{

	for ( var j = 2; j <= matriz.length; ++j )
		for (var x = 0; x <= matriz.length-j; ++x)
			matriz[x][j] = (matriz[math.add(x,1)][j-1] - matriz[x][j-1])/(matriz[j-1+x][0] - matriz[x][0])            
	
	var vector = $.extend(true, [], matriz[0])
	vector.shift()
	return vector
}		
//Funcion que regresa la matriz obtenida de leer el archivo	 
var matriz = function()
{
	var arr = (fileDisplayArea.innerText).replace(/(\r\n|\n|\r)/gm,",")
	arr = arr.replace(/[ ,]+/g, ",")
	
	//Esta comprobación se da por si el usuario pide usar más números de los que da.
	if (arr.slice(-1) === ",") arr = arr.slice(0,-1)
	
	arr = arr.split(',').map(Number)
	arr = listToMatrix(arr)
	return arr
}
window.onload = function() 
{
	var fileInput = document.getElementById('fileInput');
	var fileDisplayArea = document.getElementById('fileDisplayArea');
	
	fileInput.addEventListener('change', function(e) {
		$('#fileDisplayArea').hide();
		var file = fileInput.files[0];
		var textType = /text.*/;

		if (file.type.match(textType)) {
			var reader = new FileReader();
			reader.onload = function(e) {
				fileDisplayArea.innerText = reader.result;
			}
			reader.readAsText(file);
		} else {
			$('#fileDisplayArea').show();
			fileDisplayArea.innerText = "Archivo no soportado";
		}
	});
}
//Funcion que transforma a matriz 
function listToMatrix(list) 
{
    var matrix = []
    //Tomo el indice y lo saco de la lista
    var orden = list.shift()

    for (var i = 0, k = 0; i < orden; ++i){
    	matrix[i] = []
    	for (var j = 0; j < 2; ++j, ++k)
    		matrix[i][j] = list[k]
    }
    //Checo si el indice es mayor que el # de elementos que hay
    if ((""+matrix).slice(-1) === ",") throw "ERROR: El indice es mayor que el número de elementos en el archivo"
    if (matrix.length === 0) throw "ERROR: No se ha introducido un archivo"
    return matrix
}


 });