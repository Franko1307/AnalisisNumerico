$(document).ready(function() {
//Muestra la matriz que sale al inicio e indica al usuario el formato que el archivo debe de tener.
$('#formato').append('$$Formato\\,de\\,la\\,matriz\\,de\\,orden\\,n$$');
$('#formato').append('$$\\begin{array}{rrrrr} a_{11} & a_{12} & ... & a_{1n} & b_1 \\\\ a_{21} & a_{22} & ... & a_{2n} & b_2 \\\\ .&&&&. \\\\ .&&&&. \\\\ .&&&&. \\\\ a_{n1} & a_{n2} & ... & a_{nn} & b_n \\end{array}$$');
$('#formato').append('$$No\\,dejar\\,espacios\\,debajo\\,o\\,a\\,un\\,lado\\,de\\,la\\,matriz$$');
$('#fileDisplayArea').hide();
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
	
	$('#matrices').empty();
	$('#vectores').empty();

	try{

		if ( HayEspaciosEnBlanco() ) throw "Error: Hay espacios en blanco.";

		var nr = $('input#redondeo').val();
		var n = $('input#orden').val();
		var arr;
		//Obtengo el contenido de 'filedisplayarea' y reemplazo espacios,saltos de líneas,y demás a comas.
		arr = (fileDisplayArea.innerText).replace(/(\r\r)/gm,"\r");
		arr = (fileDisplayArea.innerText).replace(/(\r\n|\n|\r)/gm,",");
		arr = arr.replace(/[ ,]+/g, ",");
		arr = arr.split(',').map(Number);
		//Transformo eso a matriz
		arr = listToMatrix(arr,math.add(n,1));
		
		//Checo si es de nxn+1 la matriz
		var dim = math.size(arr);
		//Checo si las dimensiones estan bien
		if ( dim[0] != n || dim[1] != math.add(n,1) ) throw "ValorN";
		//checo si cada renglon tiene n+1 elementos.
		for (var i = 0; i < n; ++i) if ( (arr[i]).length < n- -1) throw "MATRIZ INVALIDA";
		//Quito la matriz del inicio
		$('#formato').empty();
		//Imprimo la matriz original introducida por archivo
		imprimirMatriz(arr,"matrices");
		//La redondeo para operar con ella.
		redondeaMatriz(arr);
		console.log(arr);
		//Creo una copia de la matriz original ya que la original se transformara despues
		var copia = [];
		for (var i = 0; i < math.add(n,0); ++i){
			copia[i] = [];
			for(var j = 0; j <= math.add(n,0); ++j) copia[i][j] = arr[i][j];
		}
		//Creo otra copia por motivos de logica en la implementacion de mi programa
		var copia2 = [];
		for (var i = 0; i < math.add(n,0); ++i){
			copia2[i] = [];
			for(var j = 0; j <= math.add(n,0); ++j) copia2[i][j] = arr[i][j];
		}
		console.log(copia,copia2);
		
		//Imprimo las matrices
		imprimirMatriz(arr,"matrices");
		//Obtengo el vector solucion aproximado de la matriz original
		escalaMatriz(arr);
		escalaMatriz(copia2);
		escalaMatriz(copia);
		vector = eliminacionGaussiana(arr,true,true);
		var error;
		var VectorResta = [];
		var vector2;
		var tolerancia = $('#tolerancia').val();
		var VectorRestaRealAprox;
		//Calculo el error y lo voy mejorando con lo de la solución de los errores de redondeo.
		var contador = 0;
		
		//Procedimiento de eliminación de errores de redondeo
		do{

			error = calculaError(copia2,vector,VectorResta);
			imprimirVector(vector,"vectores",error);
			
			cambiaMatriz(copia,VectorResta);
			
			vector2 = eliminacionGaussiana( copia, false, false );
			
			restauraCopia ( copia,copia2 );
			
			for(var i = 0; i < $('input#orden').val(); ++i ){
				if ( VectorResta[i] != 0 ){
					vector[i] += vector2[i];
					vector[i] = redondear (vector[i], nr);
				}
			}
			++contador;
		}while( error > tolerancia &&  contador < $('input#Errores').val() );
        if ( contador >= $('input#Errores').val() ) $('#vectores').append('$$Han\\,pasado\\,'+$('input#Errores').val()+'\\,iteraciones\\,y\\,el\\,error\\,no\\,alcanza\\,la\\,tolerancia\\,pedida.\\,Pruebe\\,con\\,un\\,valor\\,de\\,redondeo\\,mayor.$$');
	
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

	}catch(e) {
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

		switch ( e ) {
		case "ValorN": 
			alert("Error: Parece que el orden ingresado es distinto al que tiene la matriz ingresada o que hay espacios debajo de la matriz o a la derecha.");
			break;
		case "DIM ERROR": 
			alert("Error: La matriz ingresada es erronea, verifique si hay espacios por debajo o al lado de la matriz, o si le faltan elementos.");
			break;
		case "NO HAY SOLUCION":
			alert("La matriz ingresada no se puede resolver");
			break;
		case "MATRIZ INVALIDA":
			alert("Error: Formato de matriz inválido");
			break;
		case "NO QUIERO CONTINUAR":
			alert("Ha decidido no continuar por lo que el programa se ha detenido");
			break;
		case "Error: Hay espacios en blanco.":
			alert("Error: Hay espacios en blanco");
			break;
		default:
			alert("Algo inesperado a ocurrido " + e);
		}
	}
})
function HayEspaciosEnBlanco() {

	if ($('#orden').val().length>0 && 
		$('#redondeo').val().length>0 &&
		$('#tolerancia').val().length>0 && 
		$('#valorR').val().length>0 && 
		$('#Errores').val().length>0 )return false;
	return true;
}
//Funcion que cambia las b's por mi vector solucion evaluado
function cambiaMatriz(arr,vector) {
	for (var i = 0; i < $('input#orden').val(); ++i) arr[i][$('input#orden').val()] = vector[i];
}
//Funcion que calcula el error más grande entre las restas
function calculaError( arreglo, vector , vectorerror ) {

	var evaluado = [];
	var nr = $('input#redondeo').val();
	var orden = $('input#orden').val();

	for (var i = 0; i < orden; ++i ){
		evaluado[i] = 0;	
		for (var j = 0; j < orden ; ++j){
			evaluado[i] += arreglo[i][j]*vector[j];
			evaluado[i] = redondear( evaluado[i], nr);
		}
	}
	for (var i = 0; i < orden ; ++i ) vectorerror[i] = redondear( arreglo[i][orden] - evaluado[i],nr);

	var error =  Math.abs(vectorerror[0]);
	
	for (var i = 0; i < orden - 1; ++i) if ( error < Math.abs(vectorerror[i]) ) error = Math.abs(vectorerror[i]);
	return error;
}
//Funcion que redondea
var redondear = function(n,k){
  if(n == 0) return 0;
  if(n < 0) return -(redondear(-n, k));
  var mult = Math.pow(10, k - Math.floor(Math.log(n) / Math.LN10) - 1);
  return Math.round(n * mult) / mult;
}
//Funcion que imprime vector
function imprimirVector(vector,ubicacion,error) {
	var rens = "";
	for (var i = 0; i < $('input#orden').val(); ++i ) rens+= vector[i] + "\\\\";
	$('#'+ubicacion+'').append('$$Vector\\,solucion:\\left[\\begin{array}{r}'+ rens +'\\end{array}\\right]con\\,error:'+error+'$$');
}
//Funcion que imprime matriz
function imprimirMatriz(arreglo,ubicacion) {

	var renglones = "";
	for (var i = 0; i < $('input#orden').val(); ++i) renglones +="r";

	var rens = "";
	var cols;
	for (var i = 0; i < $('input#orden').val(); ++i){
		for (var j = 0; j < math.add($('input#orden').val(),1); ++j) rens += arreglo[i][j] + "&"; 
		rens = rens.substring(0,rens.length-1);
		rens += "\\\\"
	}
	rens = rens.substring(0,rens.length-2);
	$('#'+ubicacion+'').show();
	$('#'+ubicacion+'').append('$$-->\\left[\\begin{array}{'+renglones+'|r}'+ rens +'\\end{array}\\right] $$');
		
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
//Funcion de la eliminacion gaussiana
function eliminacionGaussiana(arr,imprime,ChecarCondicionamiento) {
	//Almaceno en variables cada operacion de reondeo
	var p;
	var n = $('input#orden').val();
	var nr = $('input#redondeo').val();
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
	
	if( imprime ) imprimirMatriz(arr,"matrices");
	for (var i = 0; i < n-1 ; ++i) {
		p = buscaElementoMayor(arr,i);
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
			if ( imprime ) imprimirMatriz(arr,"matrices");
		}
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
		if ( arr[n-1][n-1] == 0 ) throw "NO HAY SOLUCION";
	}
	if ( matrizCondicionada(arr , ChecarCondicionamiento)){
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
		for ( var i = 0; i < $('input#orden').val(); ++i ) vector[i] = xn[i+1];
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
		return vector;
	}
	else throw "NO QUIERO CONTINUAR";
}
function matrizCondicionada( matriz, chequeo ) {
	MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	if ( !chequeo ) return true;
	var determinante = calculaDeterminante ( matriz );
	if ( determinante > $('input#valorR').val() ) return true;
	MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	if ( confirm('La matriz parece estar mal condicionada, ¿Desea continuar bajo su propio riesgoo?') ) return true;
	return false;
}
function calculaDeterminante ( matriz ) {
	var det = matriz[0][0];
	var n = $('input#orden').val();
	for (var i = 1; i < n ; ++i ) det *= matriz[i][i];	
	return Math.abs(det);
}
function escalaMatriz( matriz ) {
	var numeroAlto;
	var n = $('input#orden').val();
	var nr = $('input#redondeo').val();
	for (var i = 0; i < n; ++i) {
		numeroAlto = Math.abs(matriz[i][0]);
		for (var j = 1; j < n; ++j) if ( numeroAlto < Math.abs(matriz[i][j]) ) numeroAlto = Math.abs(matriz[i][j]);
		if (numeroAlto == 0) throw "NO HAY SOLUCION";
		for (var j = 0; j <= n; ++j){
			matriz[i][j] = matriz[i][j] / numeroAlto;
			matriz[i][j] = redondear(matriz[i][j],nr)
		}
	}
}
function redondeaMatriz(matriz) {
	var n = $('input#orden').val();
	var nr = $('input#redondeo').val();
	for (var i = 0; i < n; ++i) for (var j = 0; j <= n; ++j) matriz[i][j] = redondear(matriz[i][j],nr);
}
function buscaElementoMayor(matriz, i ) {
	var n = $('input#orden').val();
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
function restauraCopia( matriz1, matriz2 ) {
	var n = $('input#orden').val();
	for (var i = 0; i < n; ++i) for (var j = 0; j <= n; ++j) matriz1[i][j] = matriz2[i][j]; 
}
 });