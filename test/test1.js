module monads from 'monads';
monads.DOMable({tagName:'div'}).on('load').style({background:'blue',width:'200px',height:'200px'}).insert(document.body)
