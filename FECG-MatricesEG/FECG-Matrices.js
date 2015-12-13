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
		for (var i = 0; i < n; ++i){
			console.log(arr[i]," ---- ", arr[i].length)
			if ( (arr[i]).length < n- -1) throw "MATRIZ INVALIDA";
		}
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
		//Quito la matriz del inicio
		$('#formato').empty();
		//Imprimo las matrices
		imprimirMatriz(arr,"matrices");
		//Obtengo el vector solucion aproximado de la matriz original
		vector = eliminacionGaussiana(arr,true);
		var error;
		var resaprox;
		var vector2;
		var tolerancia = $('#tolerancia').val();
		//Calculo el error y lo voy mejorando con lo de la solución de los errores de redondeo.
		
		var contador = 0;
		do{
			
			error = calculaError(copia2,vector);
		
			resaprox = miaprox(copia2,vector);
			
			imprimirVector(vector,"vectores",error);
			
			cambiaMatriz(copia,resaprox);
	
			vector2 = eliminacionGaussiana(copia,false);
			for(var i = 0; i < $('input#orden').val(); ++i ){
				vector[i] += redondear(vector2[i],nr);
				vector[i] = redondear (vector[i], nr)
			}
			++contador;
		}while( error > tolerancia && contador < 30 );

		if ( contador >= 30 ) $('#vectores').append('$$Han\\,pasado\\,30\\,iteraciones\\,y\\,el\\,error\\,no\\,alcanza\\,la\\,tolerancia\\,pedida.\\,Pruebe\\,con\\,un\\,valor\\,de\\,redondeo\\,mayor.$$');

		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

	}catch(e) {
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
		if (e == "ValorN") alert("Error: Parece que el orden ingresado es distinto al que tiene la matriz ingresada o que hay espacios debajo de la matriz o a la derecha.");
		if (e == "DIM ERROR") alert("Error: La matriz ingresada es erronea, verifique si hay espacios por debajo o al lado de la matriz, o si le faltan elementos.");
		if ( e == "NO HAY SOLUCION") alert("La matriz ingresada no se puede resolver");
		if (e == "MATRIZ INVALIDA") alert("Error: Formato de matriz inválido");
	}
})
//Funcion que calcula el vector solucion aproximado.
function miaprox(arreglo,vector) {

	var evaluado = [];
	var nr = $('input#redondeo').val();

	for (var i = 0; i < $('input#orden').val(); ++i ){
		evaluado[i] = 0;
		for (var j = 0; j < $('input#orden').val() ; ++j){
			evaluado[i] += arreglo[i][j]*vector[j];
			evaluado[i] = redondear(evaluado[i], nr);				
		}
	}
	var error = [];
	for (var i = 0; i < $('input#orden').val() ; ++i ) error[i] = redondear( arreglo[i][$('input#orden').val()] - evaluado[i],nr);
	return error;
}
//Funcion que cambia las b's por mi vector solucion evaluado
function cambiaMatriz(arr,vector) {
	for (var i = 0; i < $('input#orden').val(); ++i) arr[i][$('input#orden').val()] = vector[i];
}
//Funcion que calcula el error más grande entre las restas
function calculaError( arreglo, vector ) {

	var evaluado = [];
	var nr = $('input#redondeo').val();

	for (var i = 0; i < $('input#orden').val(); ++i ){
		evaluado[i] = 0;	
		for (var j = 0; j < $('input#orden').val() ; ++j){
			evaluado[i] += arreglo[i][j]*vector[j];
			evaluado[i] = redondear( evaluado[i], nr);
		}
	}

	var error;
	error =  math.abs(evaluado[0] - arreglo[0][$('input#orden').val()]);
	error = redondear(error, nr);

	for (var i = 0; i < $('input#orden').val() - 1; ++i ) if ( error < redondear((evaluado[i] - arreglo[i][$('input#orden').val()]),nr)) error = redondear(evaluado[i] - arreglo[i][$('input#orden').val()],nr);
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
function eliminacionGaussiana(arr,imprime) {
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
	
	for (var i = 0; i < n-1 ; ++i) {
		p = i;
		if ( arr[p][i] == 0) {
			do{
				if ( arr[p][i] != 0 ) break;
				++p;				
			}while( p <= n-1 );
			if ( p > n-1) throw "NO HAY SOLUCION";
		}
		if (p != i) {
			var aux = arr[p];
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
		if( imprime) imprimirMatriz(arr,"matrices");	

		if ( arr[n-1][n-1] == 0 ) throw "NO HAY SOLUCION";
	}
	
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
	return vector;
}

 });