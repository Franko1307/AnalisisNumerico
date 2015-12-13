$(document).ready(function() {
//Muestra la matriz que sale al inicio e indica al usuario el formato que el archivo debe de tener.
$('#formato').append('$$Formato\\,de\\,la\\,matriz\\,de\\,orden\\,n$$');
$('#formato').append('$$\\begin{array}{rrrrr} a_{11} & a_{12} & ... & a_{1n} & b_1 \\\\ a_{21} & a_{22} & ... & a_{2n} & b_2 \\\\ .&&&&. \\\\ .&&&&. \\\\ .&&&&. \\\\ a_{n1} & a_{n2} & ... & a_{nn} & b_n \\end{array}$$');
$('#formato').append('$$No\\,dejar\\,espacios\\,debajo\\,o\\,a\\,un\\,lado\\,de\\,la\\,matriz$$');
$('#fileDisplayArea').hide();
$('#ERRORES').hide()
//Funcion que se encarga de pedir el archivo y guardarlo en 'filedisplayarea' para luego ser transformado a matriz
window.onload = function() {
		
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
$('#ordenar').click(function(){
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

		//Redondeo la matriz entera al valor pedido de redondeo
		redondeaMatriz(arr)
		imprimirMatriz(arr,"matrices")
		escalaMatriz(arr)
		imprimirMatriz(arr,"matrices")
		//Creo una copia de la matriz para no alterar su contenido
		var copia1 = $.extend(true, [], arr)
		
		var inversa = []
		var vectorSolucion
		var error
		var tolerancia = $('#tolerancia').val()
		var iteraciones = $('input#Errores').val()
		var contador = 0

		vectorSolucion = GaussJordan(copia1, inversa)

		vectorResta = []
		var vectorSolucionResta = []

		//Procedimiento encargado de eliminar los errores de redondeo 
		if ( matrizCondicionada ( arr, inversa ) ) {
			do{

				error = calculaError( arr ,vectorSolucion,vectorResta)

				imprimirVector(vectorSolucion,"vectores",error)

				vectorSolucionResta = obtieneSolucionAprox(vectorResta, inversa)

				actualizaSolucion(vectorSolucion,vectorSolucionResta)
				++contador

			}while (error > tolerancia && contador < iteraciones)
			if (contador >= iteraciones ) throw "NO PUDE HACERLO"
		}else throw "NO QUIERO CONTINUAR"

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
		case "NO QUIERO CONTINUAR":
			$('#ERRORES').append('Ha decidido no continuar por lo que el programa se ha detenido')
			break
		case "Espacios en blanco":
			$('#ERRORES').append('Error: Hay espacios en blanco')
			break
		case "Buen redondeo":
			$('#ERRORES').append('Error: El redondeo ingresado es extremadamente dificil.')
			break
		case "NO PUDE HACERLO":
			$('#ERRORES').append('Debido al valor de redondeo o al número permitido de repeticiones no pude calcular la respuesta con la tolerancia pedida, prueba con un valor de redondeo mayor')
			break
		default:
			$('#ERRORES').append('Error: No se ha encontrado un archivo')
		}
	}
})
function obtieneSolucionAprox(vector,matriz) {

	var nr = $('input#redondeo').val()
	var vectorSolucion = []
	for (var i in matriz){
		vectorSolucion[i] = 0
		for (var x in matriz[i])
			vectorSolucion[i] = redondear ( vectorSolucion[i] + redondear ( (matriz[i][x] * vector[x]),nr) ,nr ) 
	}

	return vectorSolucion
}
//Le sumo a mi vector solucion lo que me haya salido al evaluar el vector resta en la matriz original
function actualizaSolucion (vectorS, vectorR) {
	var nr = $('input#redondeo').val()
	for(var i in vectorS) vectorS[i] = redondear( (vectorS[i] + vectorR[i])  ,nr )
}
//Checo si algún campo de los que pido está en blanco
function HayEspaciosEnBlanco() {
	if ($('#orden').val().length>0 && 
		$('#redondeo').val().length>0 &&
		$('#tolerancia').val().length>0 && 
		$('#valorR').val().length>0 && 
		$('#Errores').val().length>0 )return false;
	return true;
}
//Funcion que calcula el error al evaluar en la matriz
function calculaError( arreglo, vector , vectorerror ) {

	var evaluado = []
	var nr = $('input#redondeo').val()
	var orden = $('input#orden').val()

	for (var i = 0; i < orden; ++i ){
		evaluado[i] = 0;	
		for (var j = 0; j < orden ; ++j)
			evaluado[i] = redondear(  ( evaluado[i] + redondear ( (arreglo[i][j]*vector[j]),nr )  ) , nr)
	}
	for (var i = 0; i < orden ; ++i ) vectorerror[i] = redondear( arreglo[i][orden] - evaluado[i],nr)

	var error =  Math.abs(vectorerror[0])

	for (var i = 0; i < orden - 1; ++i) if ( error < Math.abs(vectorerror[i]) ) error = Math.abs(vectorerror[i])
	return error;
}
//Funcion que redondea
function redondear (n,k){
	if(n === 0) return 0;
  	if(n < 0) return -(redondear(-n, k));
  	var mult = Math.pow(10, k - Math.floor(Math.log(n) / Math.LN10) - 1);
  	return Math.round(n * mult) / mult;
}
//Funcion que imprime vector
function imprimirVector(vector,ubicacion,error) {
	var rens = ""
	for (var i in vector ) rens+= vector[i] + "\\\\"
	$('#'+ubicacion+'').append('$$Vector\\,solucion:\\left[\\begin{array}{r}'+ rens +'\\end{array}\\right]con\\,error:'+error+'$$')
}
//Funcion que imprime matriz
function imprimirMatriz(arreglo,ubicacion) {
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
//Funcion que transforma a matriz 
function listToMatrix(list, elementsPerSubArray) {
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
//Funcion de la eliminacion de gaussjordan
function GaussJordan(matriz, identidad) {
	var nr = $('input#redondeo').val()
	var n = $('input#orden').val()
	var aux
	var mj
	//Creo una identidad
	for (var j = 0; j < n; ++j){
		identidad[j] = []
		for (var k = 0; k < n; ++k) identidad[j][k] = 0
	}
	for (var j in identidad) identidad[j][j] = 1
	
	//Pivoteo parcial
	for (var x in matriz) {
		p = buscaElementoMayor(matriz,x)
		if (p != x) {
			aux = matriz[p]
			matriz[p] = matriz[x]
			matriz[x] = aux
			aux = identidad[p]
			identidad[p] = identidad[x]
			identidad[x] = aux
		}
		//normalización
		imprimirMatriz(matriz,"matrices")
		normaliza( matriz[x] , identidad[x] ,x)
		imprimirMatriz(matriz,"matrices")
		//Ceros en la parte de abajo
		for (var j = math.add(x,1); j<n;++j) {
			mj = redondear((redondear(matriz[j][x],nr))/(redondear(matriz[x][x],nr)),nr)
			for (var h in matriz[x])
				matriz[j][h] = redondear( redondear( matriz[j][h],nr )-(redondear( (mj*redondear( matriz[x][h],nr ) ),nr )),nr )
			for (var h = 0; h < n-1; ++h)
				identidad[j][h] = redondear( redondear( identidad[j][h],nr )-(redondear( (mj*redondear( identidad[x][h],nr )),nr )),nr )
			
			imprimirMatriz(matriz,"matrices")
		}
	}	 
	//Ceros en la parte de arriba
	for (var x = n-1; x >= 0; --x) {
		for (var j = x-1; j>=0;--j) {
			mj = redondear((redondear(matriz[j][x],nr))/(redondear(matriz[x][x],nr)),nr)
			for (var h in matriz[x])
				matriz[j][h] = redondear(redondear(matriz[j][h],nr)-(redondear((mj*redondear(matriz[x][h],nr)),nr)),nr)
			for (var h = 0; h < n-1; ++h)
				identidad[j][h] = redondear(redondear(identidad[j][h],nr)-(redondear((mj*redondear(identidad[x][h],nr)),nr)),nr)
			
			imprimirMatriz(matriz,"matrices")
		}
	}

	var VectorSolucion = []
	for (var x in matriz) VectorSolucion[x] = matriz[x][n]

	MathJax.Hub.Queue(["Typeset",MathJax.Hub])
	return VectorSolucion
}
//Funcion que divide todo el renglon de la matriz y la identidad entre el indice
function normaliza( renglon, identidad , indice ) {
	var nr = $('input#redondeo').val()
	var div = renglon[indice]
	if ( div === 0 ) throw "NO HAY SOLUCION"
	for (var x in renglon) renglon[x] = redondear( (renglon[x]/ div),nr )
	for (var x in identidad) identidad[x] = redondear( (identidad[x]/ div),nr )
	
}
//Checo si la matriz esta condicionada
function matrizCondicionada( matriz, inversa ) {
	MathJax.Hub.Queue(["Typeset",MathJax.Hub])

	var nr = $('input#redondeo').val()
	var identidad = []

	for (var x in inversa){
		identidad[x] = []
		for (var j in inversa[x]) identidad[x][j] = 0
	}
	for (var i in inversa)
		for (var j in inversa[i])
			for (var x in inversa[i]) identidad[i][x] = redondear( (identidad[i][x] +  redondear ( (matriz[i][j] * inversa[j][x]) ,nr) ) , nr ) 
		
	var umbral = 1
	for (var x in identidad)
		if ( umbral < math.abs(identidad[x][x]) ) umbral = math.abs(identidad[x][x])
	//Le resto -1 al umbral porque en teoría debería haber puros 1's en la matriz, y si el umbral -1 es 0, pues todo bien pero si es más alto entonces todo mal.
	if ( (umbral - 1)  < $('input#valorR').val() ) return true
	//En este punto la matriz no está condicionada pero le aviso si desea continuar
	if ( confirm('La matriz parece estar mal condicionada, ¿Desea continuar bajo su propio riesgoo?') ) return true
	return false
}
//Funcion para redondear una matriz
function redondeaMatriz(matriz) {
	var nr = $('input#redondeo').val()
	for (var x in matriz) 
		for (var j in matriz[x])
			matriz[x][j] = redondear(matriz[x][j],nr)	
}
//Busca el elemento mayor en valor absoluto en cada fila del indice hacia abajo
function buscaElementoMayor(matriz, i ) {
	var n = $('input#orden').val()
	var p = i
	var nM = Math.abs(matriz[i][i])
	var x = math.add(i,1)
	for (var x=math.add(i,1); x < n ; ++x) 
		if ( nM < Math.abs(matriz[x][i])) {
			nM = Math.abs(matriz[x][i])
			p = x
		}
	return p
}
function escalaMatriz( matriz ) {
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
 });