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
    //Checo si no hay espacios en blanco (el orden del polinomio)
    checarCampos();
		//Obtengo la matriz de puntos
		var arr = matriz()
    //Separo la matriz en dos vectores para trabajar con ellos más fácil mente
    var vectorPuntos = obtenColumna(arr,0)
    console.log(vectorPuntos)
    var vectorPuntosEvaluados = obtenColumna(arr,1)
    //Obtengo la matriz a resolver
    var matriz_a_resolver = obtenMatrizPolinomial(vectorPuntos, vectorPuntosEvaluados)
    console.log(matriz_a_resolver)
    var vectorRespuesta = []
    //Utilizando gaussiana con pivoteo parcial resuelvo la matriz.
    vectorRespuesta = gaussianaSimpleConPivoteo(matriz_a_resolver,math.add($('#gradoPolinomio').val(),1), 15)
    console.log("vecto respuesta: " + vectorRespuesta)

    //Transformoto todo a una expresión con la forma k + tx + zx^2 ... etc con k,t,z pertenecientes a los números reales
    var expresion = transformaAExpresion(vectorRespuesta)

    //Guardo la expresión en una variable global para poder evaluarla después
    window.expresion = expresion
    console.log(expresion)
    $('#funcion').show()
		$('#funcion').empty()
    //Transoformo todo a latex y lo mando imprimir.
    var node = math.parse(expresion)
    $('#funcion').append('$$F(x):'+node.toTex()+'$$')
    //Habitlito la opción para poder evaluar.
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
var obtenMatrizPolinomial = function(vectorPuntos, vectorPuntosEvaluados)
{
  var grado = $('#gradoPolinomio').val()
  console.log("grado " + grado)
  var maximoGrado = grado*2 + 1
  console.log("Maximo Grado " + maximoGrado)
  var m = vectorPuntos.length
  console.log("m " + m)
  var suma
  var vectorSumas = []
  var matrizResultado = []
  for (var x = 0; x < maximoGrado; ++x){
    suma = 0
    for (var i = 0; i < m; ++i) suma += Math.pow(vectorPuntos[i], x)
    vectorSumas[x] = suma
  }
  for (var x = 0; x <= grado; ++x){
    suma = 0
    for (var i = 0; i < m; ++i) suma += Math.pow(vectorPuntos[i], x) * vectorPuntosEvaluados[i]
    matrizResultado[x] = []
    matrizResultado[x][math.add(grado,1)] = suma
  }
  for (var i = 0; i <= grado; ++i)
    for (var j = 0; j <= grado; ++j)
      matrizResultado[i][j] = vectorSumas[math.add(i,j)]
  return matrizResultado
}
//Funcion de la eliminacion gaussiana
function gaussianaSimpleConPivoteo(arr,n,nr) {
	//Almaceno en variables cada operacion de reondeo
	var p;
	var arrji;
	var arrii;
	var mj;
	var arrjh;
	var arrih;
	var mj_arrih;
	var k;
	var xn = [];
	var xnn;
	var arrn1n;
	var arrn1n1;
	var arri1n;
	var arri1i1;
	var xnk2;
	var arri1k1;
	var xnk2_arri1k1;
	var div;
	var aux;

	for (var i = 0; i < n-1 ; ++i) {

		p = buscaElementoMayor(arr,i, n);
    //function buscaElementoMayor(matriz, i , n) {

		if (p != i) {
			aux = arr[p];
			arr[p] = arr[i];
			arr[i] = aux;
		}
		for (var j = i + 1; j <= n - 1; ++j){
			mj = redondear((redondear(arr[j][i],nr))/(redondear(arr[i][i],nr)),nr);
			for (var h = 0; h <= n; ++h) {
				arrih = redondear(arr[i][h],nr);
				mj_arrih = mj * arrih;
				mj_arrih = redondear (mj_arrih,nr);
				arrjh = redondear(arr[j][h],nr);
				arrjh = arrjh - (  mj_arrih  );
				arrjh = redondear(arrjh,nr)
				arr[j][h] = arrjh;
			}

		}

		if ( arr[n-1][n-1] == 0 ) throw "NO HAY SOLUCION";
	}
	//sustitución hacia atrás.
	arrn1n = redondear(arr[n-1][n],nr);
	arrn1n1 = redondear( arr[n-1][n-1],nr );
	xn[n] = arrn1n/arrn1n1;
	xn[n] = redondear(xn[n],nr);
	//Esto de operar y redondear cada vez no esta padre :(
	for (var i = n-1; i > 0; --i) {
		arri1n = redondear( arr[i-1][n],nr );
		arri1i1 = redondear( arr[i-1][i-1],nr );
		xn[i] = arri1n/arri1i1;
		xn[i] = redondear( xn[i],nr );
		for (var k = i-1; k < n-1 ; ++k){
			xnk2 = redondear( xn[k+2],nr );
			arri1k1 = redondear( arr[i-1][k+1],nr );
			xnk2_arri1k1 = arri1k1*xnk2;
			xnk2_arri1k1 = redondear( xnk2_arri1k1,nr );
			arri1i1 = redondear( arr[i-1][i-1],nr );
			div = xnk2_arri1k1/arri1i1;
			div = redondear ( div,nr );
			xn[i] = redondear( xn[i] , nr );
			xn[i] = xn[i] - div;
			xn[i] = redondear( xn[i] , nr );
		}
	}
	var vector = [];
	for ( var i = 0; i < n; ++i ) vector[i] = xn[i+1];

	return vector;

}
var checarCampos = function()
{
  if ($('#gradoPolinomio').val().length>0) return
  throw "ERROR: Campos vacios"
}
var obtenColumna = function(arr,columna)
{
  var vector = []
  for (x in arr) vector[x] = arr[x][columna]
  return vector
}
//Esto lo transforma a una cadena toda la expresión
var transformaAExpresion = function (vector)
{
	var expresion = ""//+vectorPuntosEvaluados[0]

  expresion += vector[0]

  for (var x = 1; x < vector.length; ++x )//in vector)//= 1; x < vectorPuntosEvaluados.length; ++x){
    expresion += signo(vector[x]) + "x^"+x

	return expresion
}
//Aqui es igual a la función de abajo pero esta es normalita, la de abajo es para las expresiones (x-3)(x+3) por ejemplo
var signo = function (entero)
{
	if (entero < 0) return entero
	if (entero > 0) return "+"+entero
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
function buscaElementoMayor(matriz, i , n) {
	var p = i;
	var numero = Math.abs(matriz[p][i]);
	var contador = p;
	++p;
	for (; p < n ; ++p) {
		if ( numero < Math.abs( matriz[p][i] ) ){
			numero = Math.abs( matriz[p][i] );
			contador = p;
		}
	}
	return contador;
}
//Funcion que redondea
var redondear = function(n,k){
  if(n == 0) return 0;
  if(n < 0) return -(redondear(-n, k));
  var mult = Math.pow(10, k - Math.floor(Math.log(n) / Math.LN10) - 1);
  return Math.round(n * mult) / mult;
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
