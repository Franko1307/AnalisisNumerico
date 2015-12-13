$(document).ready(function() {
//Muestra la matriz que sale al inicio e indica al usuario el formato que el archivo debe de tener.
$('#formato').append('$$Formato\\,de\\,la\\,matriz\\,de\\,orden\\,n$$');
$('#formato').append('$$\\begin{array}{rrrrr} a_{11} & a_{12} & ... & a_{1n} & b_1 \\\\ a_{21} & a_{22} & ... & a_{2n} & b_2 \\\\ .&&&&. \\\\ .&&&&. \\\\ .&&&&. \\\\ a_{n1} & a_{n2} & ... & a_{nn} & b_n \\end{array}$$');
$('#formato').append('$$No\\,dejar\\,espacios\\,debajo\\,o\\,a\\,un\\,lado\\,de\\,la\\,matriz$$');
$('#fileDisplayArea').hide();
$('#ERRORES').hide()
//Funcion que se encarga de pedir el archivo y guardarlo en 'filedisplayarea' para luego ser transformado a matriz
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
//Funcion principal
/*
* Comentarios; El programa no escala ni utiliza lo de reducir los errores de redondeo porque ni en el procedimiento ni en las instrucciones
* donde se pide el programa indica que se haga. Pero se deja el escalamiento comentado por si en el examen se pide utilizarlo a mi beneficio
* de manera rápida y sin problemas.
*/
$('#ordenar').click(function()
{
	try{
		var nr = $('input#redondeo').val()
		if ( HayEspaciosEnBlanco() ) throw "Espacios en blanco"
		if ( nr < 1 || nr != parseInt(nr) || nr > 15 ) throw "Buen redondeo"
		var n = $('input#orden').val()
		var arr
		//Obtengo el contenido de 'filedisplayarea' y reemplazo espacios,saltos de líneas,y demás a comas.
		arr = (fileDisplayArea.innerText).replace(/(\r\r)/gm,"\r")
		arr = (fileDisplayArea.innerText).replace(/(\r\n|\n|\r)/gm,",")
		arr = arr.replace(/[ ,]+/g, ",")
		arr = arr.split(',').map(Number)
		//Transformo eso a matriz
		arr = listToMatrix(arr,math.add(n,1))

		var dim = math.size(arr)
		//Checo si las dimensiones estan bien
		if ( dim[0] != n || dim[1] != math.add(n,1) ) throw "ValorN"
		//checo si cada renglon tiene n+1 elementos.
		for (var x in arr) 
			if (arr[x].length < math.add(n,1)) throw "MATRIZ INVALIDA"
		//Vacio todo lo que pueda tener en los 'campos'
		$('#matrices').empty()
		$('#vectores').empty()
		$('#formato').empty()
		$('#ERRORES').empty()
		//Matriz tal cual
		$('#matrices').append('Matriz Original')
		imprimirMatriz(arr,"matrices")
		//Redondeo la matriz entera al valor pedido de redondeo
		redondeaMatriz(arr)
		//Matriz redondeada
		$('#matrices').append('Matriz redondeada')
		imprimirMatriz(arr,"matrices")
		//escalaMatriz(arr)
		//Matriz escalada
		//$('#matrices').append('Matriz escalada')
		//imprimirMatriz(arr,"matrices")
		//Creo todas las matrices que voy a necesitar
		var L = []
		var U = []
		var Y = []
		var X = []
		var MatrizOriginal = $.extend(true, [], arr)
		
		console.log(L , U , MatrizOriginal)
		//Procedimiento que me da la MatrizOriginal ya pivoteada, la L y la U  ya chidas
		procedimientoFactorizacionLU(MatrizOriginal, L , U)

		//Se obtiene la Y
		Y = sustitucionHaciaEnfrente(L, MatrizOriginal)
		//Se obtiene la X
		X = sustitucionHaciaAtras(U,Y)

		console.log(Y,X)
		//Imprimo todo lo que tenga que imprimir
		$('#matrices').append('Como queda la matriz después del pivoteo')
		imprimirMatriz(MatrizOriginal, "matrices")
		imprimirMatrizSinBs("L",L,"matrices")
		imprimirMatrizSinBs("U",U,"matrices")
		imprimirVector(X,"vectores")

		MathJax.Hub.Queue(["Typeset",MathJax.Hub])

	}catch(e) {
		MathJax.Hub.Queue(["Typeset",MathJax.Hub])
		$('#ERRORES').show()
		$('#ERRORES').empty()
		switch ( e ) {
		case "ValorN": 
			$('#ERRORES').append('Error: El orden ingresado es distinto al que tiene la matriz ingresada o hay espacios debajo de la matriz o a la derecha.')
			break
		case "DIM ERROR": 
			$('#ERRORES').append('Error: La matriz ingresada es erronea, verifique si hay espacios por debajo o al lado de la matriz, o si le faltan elementos.')
			break
		case "NO HAY SOLUCION":
			$('#ERRORES').append('La matriz ingresada no se puede resolver')
			break
		case "MATRIZ INVALIDA":
			$('#ERRORES').append('Error: Formato de matriz inválido')
			break
		case "Espacios en blanco":
			$('#ERRORES').append('Error: Hay espacios en blanco')
			break
		case "Buen redondeo":
			$('#ERRORES').append('Error: El redondeo ingresado es extremadamente dificil.')
			break
		default:
			$('#ERRORES').append('Error: No se ha encontrado un archivo' + e)
		}
	}
})
function sustitucionHaciaAtras(U,Y) 
{
	var n = $('input#orden').val()
	var nr = $('input#redondeo').val()
	--n
	var X = []
	X[n] = redondear((Y[n] / U[n][n]),nr)
	for (var i = math.subtract(n,1); i >= 0; --i){
		X[i] = Y[i]
		for (var k = math.add(i,1); k <= n; ++k) X[i] = redondear(  ( X[i] - redondear(U[i][k] * X[k] , nr)),nr)
		X[i] = redondear((X[i] / U[i][i]),nr)
	}
	return X
}
function sustitucionHaciaEnfrente(L, A) 
{
	var n = $('input#orden').val()
	var nr = $('input#redondeo').val()
	var Y = []
	Y[0] = redondear((A[0][n] / L[0][0]),nr)
	for (var i = 1; i < n; ++i){
		Y[i] = A[i][n]
		for (var k = 0; k < i; ++k) Y[i] = redondear((Y[i] - redondear(L[i][k] * Y[k] , nr)),nr)
	}
	return Y
}
function procedimientoFactorizacionLU(MatrizOriginal, L , U)
{
	var valorMaximo = 0
	var indice = 0
	var aux = []
	var nr = $('input#redondeo').val()
	var n = $('input#orden').val()

	--n
	for (var x in MatrizOriginal) 
		if ( valorMaximo  < Math.abs(MatrizOriginal[x][0])){
			valorMaximo = Math.abs(MatrizOriginal[x][0])
			indice = x
		}
			
	if ( valorMaximo === 0) throw "NO HAY SOLUCION"
	
	if (indice != 0){
		aux = MatrizOriginal[0]
		MatrizOriginal[0] = MatrizOriginal[indice]
		MatrizOriginal[indice] = aux
	}

	L[0] = []
	U[0] = []
	
	L[0][0] = 1
	U[0][0] = MatrizOriginal[0][0]
	
	for (var j = 1; j <= n; ++j){
		L[j] = []
		U[j] = []
		U[0][j] = redondear((MatrizOriginal[0][j] / L[0][0]),nr)
		L[j][0] = redondear((MatrizOriginal[j][0] / U[0][0]),nr)
	}

	for (var i = 1; i < n; ++i) {
		p = encuentraIndice(MatrizOriginal, L , U , i)

		if (p != i) {
			aux = MatrizOriginal[p]
			MatrizOriginal[p] = MatrizOriginal[i]
			MatrizOriginal[i] = aux
			aux = L[p]
			L[p] = L[i]
			L[i] = aux
		}
	
		L[i][i] = 1
		for (var k = 0; k < i; ++k) {
			U[i][i] = MatrizOriginal[i][i]
			for (var g = 0; g < i; ++g) U[i][i] = redondear((U[i][i] - redondear((L[i][g] * U[g][i]),nr)),nr)
		}	

		for (var j = math.add(i,1); j <= n; ++j){
			U[i][j] = MatrizOriginal[i][j]
			L[j][i] = MatrizOriginal[j][i]
			for (var k = 0; k < i; ++k){
				U[i][j] = redondear( (U[i][j] - redondear((L[i][k] * U[k][j]),nr)),nr )
				L[j][i] = redondear((L[j][i] - redondear((L[j][k] * U[k][i]),nr)),nr)
			}
			U[i][j] = redondear(( U[i][j] / L[i][i]),nr)
			L[j][i] = redondear(( L[j][i] / U[i][i]),nr)
		}
	}
	L[n][n] = 1
	var ann = MatrizOriginal[n][n]
	
	for (var k = 0; k < n; ++k) ann = redondear((ann - redondear((L[n][k] * U[k][n]	),nr)),nr)

	if (ann === 0) throw "NO HAY SOLUCION"	
	U[n][n] = ann
	
	//Aqui le añado los 0's a las matrices L y U
	for (var x in L) 
		for (var j = math.add(x,1); j <= n; ++j)
			L[x][j] = 0
	for (var x in U) 
		for (var i = 0; i < x; ++i)
			U[x][i] = 0

}
function encuentraIndice(MatrizOriginal, L , U , x) 
{
	
	var p = x
	var nr = $('input#redondeo').val()
	var n = $('input#orden').val()
	n = math.subtract(n,1)
	var suma

	for (var k = 0; k < x; ++k) {
		suma = MatrizOriginal[x][x]
		for (var i = 0; i < x; ++i) suma = redondear((suma - redondear((L[x][i] * U[i][x]),nr)),nr)
	}

	var total = Math.abs(suma)
	for (var h = math.add(x,1); h <= n; ++h){
		suma = MatrizOriginal[h][x]
		for (var i = 0; i < x; ++i) suma = redondear((suma-redondear((L[h][i] * U[i][x]),nr)),nr)
		if (total < Math.abs(suma)){
			total = Math.abs(suma)
			p = h
		}
	}
	if (total === 0) throw "NO HAY SOLUCION"
	return p
}
//Checo si algún campo de los que pido está en blanco
function HayEspaciosEnBlanco() 
{
	if ($('#orden').val().length>0 && 
		$('#redondeo').val().length>0)return false;
	return true;
}
//Funcion que redondea
function redondear (n,k)
{
	if(n === 0) return 0;
  	if(n < 0) return -(redondear(-n, k));
  	var mult = Math.pow(10, k - Math.floor(Math.log(n) / Math.LN10) - 1);
  	return Math.round(n * mult) / mult;
}
//Funcion que imprime vector
function imprimirVector(vector,ubicacion) {
	var rens = ""
	for (var i in vector ) rens+= vector[i] + "\\\\"
	$('#'+ubicacion+'').append('$$Vector\\,solucion:\\left[\\begin{array}{r}'+ rens +'\\end{array}\\right]%$$')
}
//Funcion que imprime matriz
function imprimirMatriz(arreglo,ubicacion) 
{
	var n = $('input#orden').val()
	var renglones = ""
	for (var i in arreglo) renglones +="r"
	var rens = ""
	for (var i in arreglo){
		for (var j in arreglo[i]) rens += arreglo[i][j] + "&"
		rens = rens.substring(0,rens.length-1)
		rens += "\\\\"
	}
	rens = rens.substring(0,rens.length-2)
	$('#'+ubicacion+'').show()
	$('#'+ubicacion+'').append('$$-->\\left[\\begin{array}{'+renglones+'|r}'+ rens +'\\end{array}\\right]$$')	
}
//Como la L y la U tienen formato distinto (no tienen la b) se usa esta función para imprimirlas
function imprimirMatrizSinBs(nombre,Matriz,ubicacion)
{
	var n = $('input#orden').val()
	var renglones = ""
	for (var i in Matriz) renglones +="r"
	var rens = ""
	for (var i in Matriz){
		for (var j in Matriz[i]) rens += Matriz[i][j] + "&"
		rens = rens.substring(0,rens.length-1)
		rens += "\\\\"
	}
	rens = rens.substring(0,rens.length-2)
	$('#'+ubicacion+'').show()
	$('#'+ubicacion+'').append('$$'+nombre+':\\left[\\begin{array}{'+renglones+'}'+ rens +'\\end{array}\\right]$$')	

}
//Funcion que transforma a matriz 
function listToMatrix(list, elementsPerSubArray) 
{
    var matrix = [], i, k;
    for (i = 0, k = -1; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
            k++;
            matrix[k] = [];
        }
        matrix[k].push(list[i]);
    }
    return matrix;
}
//Funcion para redondear una matriz
function redondeaMatriz(matriz) 
{
	var nr = $('input#redondeo').val()
	for (var x in matriz) 
		for (var j in matriz[x])
			matriz[x][j] = redondear(matriz[x][j],nr)	
}
/*
*Funcion de escalamiento que no sé si se usa, no la pongo porque no hicimos ningún ejercicio donde ocupáramos escalar
*Es eso o tengo una muy mala memoria pero por si acaso en el examen ocupa escalarse pues la dejo por si acaso.
function escalaMatriz( matriz ) 
{
	var numeroAlto
	var j
	var nr = $('input#redondeo').val()
	for (var i in matriz) {
		numeroAlto = Math.abs(matriz[i][0])
		j = 1
		for (j in matriz) if ( numeroAlto < Math.abs(matriz[i][j]) ) numeroAlto = Math.abs(matriz[i][j])
		if (numeroAlto === 0) throw "NO HAY SOLUCION"
		for (var k in matriz[i]) matriz[i][k] = redondear ( (matriz[i][k] / numeroAlto) ,nr )
	}
}
*/
 });