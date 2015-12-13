//Funcion de chequeo para que no se pongan trolls los usuarios a la hora de evaluar x
function checaLetra (evt){
 	var charCode = (evt.which) ? evt.which : event.keyCode
 	if (charCode == 46 || charCode == 45 )return true
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
		//Obtengo la matriz de puntos
		var arr = matriz()
    console.log("hola1")
    //Separo la matriz en dos vectores para trabajar con ellos más fácil mente
    var vectorPuntos = obtenColumna(arr,0)
    console.log(vectorPuntos)
    console.log("hola2")
    var vectorPuntosEvaluados = obtenColumna(arr,1)
    //Obtengo la forma de las multiplicaciones
    console.log("hola3")
    var vectorMultiplicaciones = obtenMultiplicaciones(vectorPuntos)
    //Para checar que todo vaya bien
    console.log(arr)
    console.log(vectorPuntos)
    console.log(vectorPuntosEvaluados)
    console.log(vectorMultiplicaciones)
		//Transformo todo a una expresión
		var expresion = transformaAExpresion(vectorMultiplicaciones, vectorPuntosEvaluados)
		//Guardo la cadena en una variable global para poder accesarla con otra función luego si el usuario quiere evaluar la x
		window.expresion = expresion
		//la checo por si acaso
		console.log(expresion)
		//Abilito la opción donde mostraré la función
		$('#funcion').show()
		$('#funcion').empty()
		//Transformo la cadena a latex y lo mando imprimir
		var node = math.parse(expresion)
		$('#funcion').append('$$F_{'+(vectorPuntos.length-1)+'}(x):'+node.toTex()+'$$')
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
var obtenColumna = function(arr,columna)
{
  var vector = []
  for (x in arr) vector[x] = arr[x][columna]
  return vector
}
var obtenMultiplicaciones = function(vectorPuntos)
{
  var vectorMultiplicaciones = []
  for (x in vectorPuntos){
    vectorMultiplicaciones[x] = "["
    for (var j in vectorPuntos){
      console.log("es la x + esto " + vectorPuntos[j])
      if (j != x) vectorMultiplicaciones[x] += "(x" + signoRaices(vectorPuntos[j]) + ")"
    }
    vectorMultiplicaciones[x] += "]/["
    for (var j in vectorPuntos){
      if (j != x){
        if (vectorPuntos[x] != 0)
          vectorMultiplicaciones[x] += "(" + vectorPuntos[x] + signoRaices(vectorPuntos[j]) + ")"
        else{
          vectorMultiplicaciones[x] += "(" + (-vectorPuntos[j]) + ")"
        }

      }
    }
    vectorMultiplicaciones[x] += "]"
  }
  return vectorMultiplicaciones
}
//Esto lo transforma a una cadena toda la expresión
var transformaAExpresion = function (multiplicaciones, vectorPuntosEvaluados)
{
	var expresion = ""//+vectorPuntosEvaluados[0]

  for (var x in vectorPuntosEvaluados)//= 1; x < vectorPuntosEvaluados.length; ++x){
    expresion += signo(vectorPuntosEvaluados[x]) + multiplicaciones[x]

	return expresion
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
