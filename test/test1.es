module monads from 'monads';
monads.DOMable({tagName:'div'}).on('load').style({'border-radius':'12px',width:'200px',height:'200px'}).gradient({color1:'#0000ff',color2:'#00ff00',repeatY:true}).insert(document.body)
