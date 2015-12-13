
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
		//Checo si el usuario metio toda la información
    checarCampos();
		//Toda variable que no tenga 'var' se utiliza como global.
    a = $('#a').val()
    b = $('#b').val()
    n = $('#n').val()
    fx = $('#fx').val()
		//Una condición para que el usuario meta n's mayores que 2
		if (n < 2) throw "Alerta, no debería hacer aproximaciones con ese número de particiones. Pruebe con una n mayor"

		//Se obtiene la h y se declara como una variable global
    h = (b-a)/n
    //Obtengo fx0 y fxn
    funcion = math.parse(fx)
  	eval = {x:a}
  	fx0 = funcion.eval(eval)
    eval = {x:b}
    fxn = funcion.eval(eval)

		//Tengo el caso para cuando n es igual a 3 usar 3/8 solo
		var resultado
		if ( n == 3){
			resultado = simpsonTresOctavos()
		}else switch ( n % 2 === 0) {
			//Sino es 3 entonces checo si es múltiplo de 2, y uso 1/3 o el combinado
			case true:  resultado = simpsonUnTercio();  break;
			case false: resultado = simpsonCombinado(); break;
			default: throw "Error: La n ingresada no parece ser entera"
		}
		//Checamos el resultado
    console.log("resultado: " + resultado)

		//Un parser sólo para imprimir la función en latex con el método .toTex
    var parser = math.parser()
    var node = math.parse(fx)
		//Limpio donde pondré la integral y la añado
		$('#Integral').show()
    $('#Integral').empty()
    $('#Integral').append("$$\\int_{"+a+"}^{"+b+"}"+node.toTex()+"~dx = " + resultado + "$$")
	MathJax.Hub.Queue(["Typeset",MathJax.Hub])
	}catch(e){
		MathJax.Hub.Queue(["Typeset",MathJax.Hub])
		$('#CONTAINER').hide()
		$('#ERRORES').show()
		$('#ERRORES').empty()
		$('#ERRORES').append(e)
	}

})
var simpsonUnTercio = function()
{

	var sumaPar = 0
	var sumaImpar = 0
	var xi = math.add(a,h)

	for (var i = 1; i < n; ++i){
		//Voy evaluando xi, y dependiendo de la i añado ese valor a la suma de pares o impares
		eval = {x:xi}
		if (i % 2 === 0) sumaPar += funcion.eval(eval)
		else sumaImpar += funcion.eval(eval)
		xi += h
	}
	//Regreso ese valor, utilizo math.add para sumar los valores ya que utilizando el operador '+' se me suelen concatenar los valores en ocaciones y así no arriesgo
	return (b-a) * (math.add(math.add(fx0,(4*sumaImpar)),math.add((2*sumaPar),fxn)))/(3*n)
}
var simpsonCombinado = function()
{
	var sumaPar = 0
	var sumaImpar = 0
	var xi = math.add(a,h)
	var restada = n-3
	var xiAux = b-h
	//Igual al 1/3 de arriba
	for (var i = 1; i < restada; ++i){
		eval = {x:xi}
		if (i % 2 === 0) sumaPar += funcion.eval(eval)
		else sumaImpar += funcion.eval(eval)
		xi += h
	}
	//Calculo f(x_{n-1}, f(x_{n-2}) y f(x_{n-3})) para la parte del 3/8
	eval = {x:xiAux}
	var fxn_1 = funcion.eval(eval)

	xiAux -= h
	eval = {x:xiAux}
	var fxn_2 = funcion.eval(eval)
	xiAux -= h
	eval = {x:xiAux}
	var fxn_3 = funcion.eval(eval)
	//Calculo las partes de 1/3 y 3/8 por separado
	var parteUnTercio = math.add(math.add(fx0,(4*sumaImpar)),math.add((2*sumaPar),fxn_3))/(3*n)
	var parteTresOctavos = 3*(math.add(math.add((fxn_3),(3*fxn_2)),math.add((3*fxn_1),(fxn))))/(8*n)
	//Regreso la formulita
	return (b-a) * (math.add(parteUnTercio,parteTresOctavos))
}
var simpsonTresOctavos = function()
{
	//Pues aquí es simplemente un caso, cuando n es igual a 3 ya que al parecer este caso hace ruido.
	var xi = math.add(a,h)
	eval = {x:xi}
	var fx1 = funcion.eval(eval)
	xi += h
	eval = {x:xi}
	var fx2 = funcion.eval(eval)
	return (3*h/8)*(math.add( math.add(fx0, 3*fx1), math.add(3*fx2, fxn) ))
}
//La función para evitar que el usuario deje campos imcompletos.
var checarCampos = function()
{
  if ( $('#a').val().length>0 && $('#b').val().length>0 && $('#fx').val().length>0 && $('#n').val().length>0 ) return
  throw "Error: Campos vacíos"
}
});
