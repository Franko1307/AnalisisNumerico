
$(document).ready(function() {

$('#ERRORES').hide()
$('#CONTAINER').hide()

$('#calcular').click(function()
{
	try{

		//Vacio campos
		$('#ERRORES').hide()
		$('#ERRORES').empty()
		$('#Integral').hide()
    $('#Integral').empty()

    checarCampos();

    var a = $('#a').val()
    var b = $('#b').val()
    var n = $('#n').val()
    var fx = $('#fx').val()

    var h = (b-a)/n
    console.log("valor de la H : " + h)

    var funcion = math.parse(fx)
  	var eval
  	eval = {x:a}
  	var fx0 = funcion.eval(eval)
    eval = {x:b}
    var fxn = funcion.eval(eval)

    var sumatoriasFXi = 0
    var nrestada = n-1
    var xi = math.add(a,h)

    for (var i = 0; i < nrestada; ++i){
      eval = {x:xi}
      sumatoriasFXi += funcion.eval(eval)
      xi = math.add(xi,h)
    }
    console.log(sumatoriasFXi)

    var aproximacion = ((b-a) * ( fx0 + 2*(sumatoriasFXi) + fxn)) / (2*n)
    console.log(aproximacion)
    var parser = math.parser()
    var node = math.parse(fx)
    $('#Integral').show()
    $('#Integral').empty()
    $('#Integral').append("$$\\int_{"+a+"}^{"+b+"}"+node.toTex()+"~dx = " + aproximacion + "$$")
	MathJax.Hub.Queue(["Typeset",MathJax.Hub])
	}catch(e){
		MathJax.Hub.Queue(["Typeset",MathJax.Hub])
		$('#CONTAINER').hide()
		$('#ERRORES').show()
		$('#ERRORES').empty()
		$('#ERRORES').append(e)
	}

})
var checarCampos = function()
{
  if ( $('#a').val().length>0 && $('#b').val().length>0 && $('#fx').val().length>0 && $('#n').val().length>0 ) return
  throw "Error: Campos vacíos"
}
});
