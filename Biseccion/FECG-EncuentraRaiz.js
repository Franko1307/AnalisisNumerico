$(document).ready(function() {
draw(-10,10);
$('#table-2').hide();

var NoHayError = true;

$('#calcula').click(function(){

	if (NohayCamposVacios()){	
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
	  console.log(err);
	  NoHayError = true;
	  $('#raiz').hide();
	  alert("Error de sintaxis");
	}


}
function generaTabla(fx,a,b,maxiteraciones,tolerancia){
	
	
	$('#table-2').hide();

	var p;
	var fp = 0;
	var fa;
	var i = 1;
	var cosas;
	var evafa;
	var evafb;
	var error;
	var signofa;
	var signofp;
	var signofb;
	var funcion = math.parse(fx);
	var aprox;
	var fb;
	
	cosass = {x:a};
	ccosas = {x:b};
		
	fa = funcion.eval(cosass);
  	fb = funcion.eval(ccosas);

  	signofa = obtensigno(fa);
  	signofb = obtensigno(fb);

  	if (signofa * signofb <= 0 ){
  		$('#tabla-2').empty();
		$('#table-2').show();
		do{
			aprox = p;
			p = (parseFloat(a)/2)+(parseFloat(b)/2);

			cosas = {x:p};
			
			fp = funcion.eval(cosas);
			
			
			cosass = {x:a};
			fa = funcion.eval(cosass);

			error = Math.abs((p-aprox)/p);

			insertarFila(i,a,b,p,fa,fp,error);
			if (fp == 0 || error<=tolerancia && NoHayError){
				$('#raiz').show();
				$('#raiz').text('$$Raiz : ' + p + '$$');
				break;
			}

			

			signofa = obtensigno(fa);
			signofp = obtensigno(fp);


			if (signofp * signofa < 0){
				b = p;
			}
			else{
				a = p;
			}

			i += 1;


		}while(i <= maxiteraciones);

		if (i > maxiteraciones){
			$('#raiz').text('$$Error:\\,iteraciones\\,insuficientes\\,para\\,encontrar\\,la\\,raiz\\,con\\,la\\,tolerancia\\,dada.$$');
		}
	}else{
		$('#raiz').show();
		$('#raiz').text('No hay cambio de signo al evaluar en los intervalos dados, pruebe un intervalo diferente.');
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