$(document).ready(function() {
draw(-10,10);
$('#table-2').hide();

var NoHayError = true;

$('#calcula').click(function(){
	
	if (NohayCamposVacios()){	
		var a = $('input#a').val();
		var b = $('input#b').val();
		var fx = $('input#Fx').val();
		var xa = $('input#x').val();
		var MaxIteraciones = $('input#Max-Iteraciones').val();
		var tolerancia = $('input#tolerancia').val();
		draw(a,b);
		generaTabla(fx,xa,a,b,MaxIteraciones,tolerancia);

	}
	else{
		alert("Error: Campos vacios");
	}
	

	
	
})

function NohayCamposVacios(){
	
	if ($('#a').val().length>0 && 
		$('#b').val().length>0 &&
		$('#Fx').val().length>0 && 
		$('#x').val().length>0 &&
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
	  console.log(err);
	  NoHayError = true;
	  $('#raiz').hide();
	  alert("Error de sintaxis");
	}


}
function hayPuntoFijo() {
	
}
function generaTabla(fx,gx,a,b,maxiteraciones,tolerancia){
	
	$('#table-2').hide();
	$('#raiz').hide();

	var funcionfx = math.parse(fx);

	cosass = {x:a};
	ccosas = {x:b};
		
	fa = funcionfx.eval(cosass);
  	fb = funcionfx.eval(ccosas);

  	signofa = obtensigno(fa);
  	signofb = obtensigno(fb);

  	
  	try{

  		if (!(signofa * signofb <= 0) ) throw "NO CAMBIO SIGNO";

  		var p0 = math.add(math.divide(math.bignumber(a),2),math.divide(math.bignumber(b),2));
  		var funciongx = math.parse(gx);

  		var gx = {x:p0}
  
  		var gxaprox = {x: math.add(math.bignumber(p0),math.bignumber(0.0000001)) }
  	
  		var Gx = funciongx.eval(gx);
  		
  		var Ghx = funciongx.eval(gxaprox);
  		
  		var derivada = math.divide(math.subtract(math.bignumber(Ghx), math.bignumber(Gx)),math.bignumber(0.0000001));
 	
  		if ( Math.abs(derivada) > 1 ) throw "NO CONVERGE";

	  		//var funciongx = math.parse(gx);
	  		//var gx = {x:}
	  	
	  		$('#tabla-2').empty();
			$('#table-2').show();

			var i = 0;
			var fp;
			var aux;
			var Fx;
			var error;
			var aux2;
			do{
				aux2 = aux;
				aux = p0;
				Fx = {x:p0};
		
				p0 = funciongx.eval(Fx);

				fp = funcionfx.eval(Fx);


				error = Math.abs((aux-aux2)/aux);

				insertarFila(i,aux,fp,error);


				if (fp == 0 || error<=tolerancia && NoHayError){
					$('#raiz').show();
					$('#raiz').text('$$Raiz : ' + aux + '$$');
					break;
				}

				
				
				++i;
			}while(i <= maxiteraciones);

			if ( i > maxiteraciones ) throw "NO ITERACIONES SUFICIENTES";
			
			MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	}catch( error ) {

		if ( error == "NO CAMBIO SIGNO"){
			$('#raiz').show();
			$('#raiz').text('No hay cambio de signo al evaluar en los intervalos dados, pruebe un intervalo diferente.');
		}
		if (error == "NO ITERACIONES SUFICIENTES") {
			$('#raiz').show();
			$('#raiz').text('$$Error:\\,iteraciones\\,insuficientes\\,para\\,encontrar\\,la\\,raiz\\,con\\,la\\,tolerancia\\,dada.$$');
		}
		if ( error == "NO CONVERGE"){
			$('#raiz').show();
			$('#raiz').text("$$Error:\\,|g'(p_0)|\\not\\le1,\\,\\,\\,\\,donde\\,\\,\\,p_0=\\frac{a+b}{2}$$");
		}
		

		

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