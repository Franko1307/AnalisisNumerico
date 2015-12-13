$(document).ready(function() {
draw(-10,10);
$('#table-2').hide();

var NoHayError = true;

$('#calcula').click(function(){
	
	if ( NohayCamposVacios() ){	
		var a = $('input#a').val();
		var b = $('input#b').val();
		var fx = $('input#Fx').val();
		var MaxIteraciones = $('input#Max-Iteraciones').val();
		var tolerancia = $('input#tolerancia').val();
		draw(a,b);
		generaTabla(fx,a,b,MaxIteraciones,tolerancia);

	}
	else{
		alert("Error: Campos vacios");
	}
	

	
	
})

function NohayCamposVacios(){

	if ($('#a').val().length>0 && 
		$('#b').val().length>0 &&
		$('#Fx').val().length>0 && 
		$('#Max-Iteraciones').val().length>0 && 
		$('#tolerancia').val().length>0 )return true;

	return false;
}

function draw(a,b) {

	var j = document.getElementById('Fx').value;
	j = 'f(x)=' + j;
	$('#grafica').text( '$$' + j + '$$');
	MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	try {

	  functionPlot({
	    target: '#grafica',
	    yDomain: [-10, 10],
	    xDomain: [a-2,b - -2],
	    data: [{
	      fn: math.eval(j)
	    }]
	  });

	}
	catch (err) {
	  alert("Error de sintaxis");
	  console.log(err);
	  NoHayError = false;
	  $('#raiz').hide();
	  
	}


}
function generaTabla(fx,a,b,maxiteraciones,tolerancia){
	
	$('#table-2').hide();
	$('#raiz').hide();

	var funcionfx = math.parse(fx);
	var evala = {x:a};
	var evalb = {x:b};

	var fa = funcionfx.eval(evala);
	var fb = funcionfx.eval(evalb);

	var signofa = obtensigno(fa);
	var signofb = obtensigno(fb);


	try{

		if ( signofa * signofb > 0 ) throw "NO CAMBIO SIGNO";

		var x0 = b;
		var i = 0;
		var fxchida;
		var fxaprox;
		var derivada;
		var sderivada;
		var evalx;
		var aux;
		$('#tabla-2').empty();
		$('#table-2').show();

		do{


			error = Math.abs((x0-aux)/x0);
			aux = x0;
			evalx = {x:x0}
			fxchida = funcionfx.eval(evalx);
			fxaprox = {x: math.add(x0,0.0000001) };
			fxaproxchida = funcionfx.eval(fxaprox);
			derivada = math.divide(math.subtract(fxaproxchida, fxchida),0.0000001);
	
			insertarFila(i,x0,fxchida,derivada,error);


			if (fxchida == 0 || error<=tolerancia && NoHayError){
					$('#raiz').show();
					$('#raiz').text('$$Raiz : ' + x0 + '$$');
					break;
			}

			x0 = math.subtract(  x0  , math.divide( fxchida , derivada));

			++i;
		}while ( i <= maxiteraciones );

		if ( i > maxiteraciones ) throw "ITERACIONES INSUFICIENTES"

	}catch ( error ) {

		$('#raiz').show();

		if ( error == "NO CAMBIO SIGNO" )
			$('#raiz').text('No hay cambio de signo al evaluar en los intervalos dados, pruebe un intervalo diferente.');

		if ( error == "ITERACIONES INSUFICIENTES")
			$('#raiz').text('$$Error:\\,iteraciones\\,insuficientes\\,para\\,encontrar\\,la\\,raiz\\,con\\,la\\,tolerancia\\,dada.$$');
	}
	
	MathJax.Hub.Queue(["Typeset",MathJax.Hub]);	 
}

function obtensigno(p){
	
	if (p<0) return -1;
	if (p==0) return 0;
	return 1;
}
function insertarFila(){
	renglon = $('<tr>');
	for(var i = 0, len = arguments.length; i < len; ++i) renglon.append($('<td>').text('$$'+arguments[i]+'$$'));
	$('#tabla-2').append(renglon);
}


 });