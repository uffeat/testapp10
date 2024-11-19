// toast
import { create } from "rollo/component";
import { toast } from "rolloui/toast";

document.getElementById('app').classList.add('d-none')
create('div', {id: 'root', parent: document.body})

console.log('HERE')

toast("Awesome", "Content");
toast("Staying long", "Content", { delay: 20000, style: 'success' });
