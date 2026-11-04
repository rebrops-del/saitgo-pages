
(()=>{'use strict';
const $=s=>document.querySelector(s);
const ids=['seller','docNo','docDate','phone','client','clientPhone','car','plate','notes'];
const key='stoblank-form-v1';
const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(Number(n)||0)+' ₽';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
let stored=null;try{stored=JSON.parse(localStorage.getItem(key)||'null')}catch(e){}
let mode=stored&&['Заказ-наряд','Акт выполненных работ','Смета'].includes(stored.mode)?stored.mode:'Заказ-наряд';
let items=stored&&Array.isArray(stored.items)&&stored.items.length<61?stored.items:[{name:'Диагностика автомобиля',qty:1,price:1500},{name:'',qty:1,price:0}];
items=items.map(x=>({name:String(x.name||'').slice(0,160),qty:Math.min(100000,Math.max(0,Number(x.qty)||0)),price:Math.min(100000000,Math.max(0,Number(x.price)||0))}));
for(const id of ids){const el=$('#'+id);if(el&&stored&&stored.fields&&typeof stored.fields[id]==='string')el.value=stored.fields[id]}
if(!$('#docDate').value)$('#docDate').value=today();
if(!$('#docNo').value)$('#docNo').value='001';
const sum=()=>items.reduce((t,x)=>t+Math.round(x.qty*x.price*100)/100,0);
function save(){try{const fields={};for(const id of ids)fields[id]=$('#'+id).value;localStorage.setItem(key,JSON.stringify({fields,items,mode}))}catch(e){}}
function render(){
document.querySelectorAll('.doc-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.type===mode));
const list=$('#itemRows');list.innerHTML='';
items.forEach((x,i)=>{
 const row=document.createElement('div');row.className='item-row';
 const name=document.createElement('input');name.maxLength=160;name.value=x.name;name.placeholder='Работа или материал';name.setAttribute('aria-label','Наименование '+(i+1));
 const qty=document.createElement('input');qty.type='number';qty.step='any';qty.min='0';qty.max='100000';qty.value=x.qty;qty.setAttribute('aria-label','Количество '+(i+1));
 const price=document.createElement('input');price.type='number';price.step='any';price.min='0';price.max='100000000';price.value=x.price;price.setAttribute('aria-label','Цена '+(i+1));
 const total=document.createElement('div');total.className='row-sum';total.textContent=money(x.qty*x.price);
 const del=document.createElement('button');del.type='button';del.className='remove-row';del.textContent='×';del.title='Удалить позицию';
 name.addEventListener('input',()=>{x.name=name.value;save()});
 qty.addEventListener('input',()=>{x.qty=Math.min(100000,Math.max(0,Number(qty.value)||0));total.textContent=money(x.qty*x.price);$('#total').textContent=money(sum());save()});
 price.addEventListener('input',()=>{x.price=Math.min(100000000,Math.max(0,Number(price.value)||0));total.textContent=money(x.qty*x.price);$('#total').textContent=money(sum());save()});
 del.addEventListener('click',()=>{items.splice(i,1);render()});
 row.append(name,qty,price,total,del);list.appendChild(row);
});
$('#total').textContent=money(sum());save()
}
for(const id of ids)$('#'+id).addEventListener('input',save);
document.querySelectorAll('.doc-tabs button').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.type;render()}));
$('#addRow').addEventListener('click',()=>{if(items.length>=60){alert('Не больше 60 позиций');return}items.push({name:'',qty:1,price:0});render();$('#itemRows input:last-of-type')?.focus()});
$('#clear').addEventListener('click',()=>{if(!confirm('Очистить сведения на этом устройстве?'))return;for(const id of ids)$('#'+id).value='';$('#docDate').value=today();$('#docNo').value='001';items=[{name:'',qty:1,price:0}];render()});
$('#print').addEventListener('click',()=>{
 $('#pType').textContent=mode;
 $('#pNum').textContent='№ '+($('#docNo').value||'б/н')+' от '+($('#docDate').value||'—').split('-').reverse().join('.');
 const props=[['Исполнитель',$('#seller').value],['Телефон исполнителя',$('#phone').value],['Клиент',$('#client').value],['Телефон клиента',$('#clientPhone').value],['Автомобиль',$('#car').value],['Госномер / VIN',$('#plate').value]];
 $('#pMeta').innerHTML=props.filter(x=>x[1].trim()).map(x=>'<div><b>'+esc(x[0])+':</b> '+esc(x[1])+'</div>').join('');
 $('#pRows').innerHTML=items.filter(x=>x.name.trim()).map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(x.name)+'</td><td>'+esc(x.qty)+'</td><td>'+money(x.price)+'</td><td>'+money(x.qty*x.price)+'</td></tr>').join('')||'<tr><td colspan="5">Позиции не указаны</td></tr>';
 $('#pTotal').textContent='Итого: '+money(sum());
 $('#pNotes').textContent=$('#notes').value?'Примечания: '+$('#notes').value:'';
 window.print()
});
const y=$('#year');if(y)y.textContent=new Date().getFullYear();
// Предварительная регистрация интереса к PRO, без получения денег и без сервера сбора адресов.
const listEmail='ps.beletckii@gmail.com';
const f=$('#checkoutForm'), n=$('#checkoutMessage'), copyButton=$('#copyRequest');
function getLaunchRequest(){
 if(!f||!f.reportValidity())return null;
 const email=$('#email').value.trim();
 const subject='СТОБланк PRO — уведомите о запуске';
 const body=[
  'Здравствуйте!',
  '',
  'Пожалуйста, сообщите мне, когда появится возможность приобрести комплект «СТОБланк PRO».',
  'Меня интересует заявленная цена 1 490 ₽. Сейчас ничего не оплачиваю.',
  '',
  'Email для уведомления: '+email,
  '',
  'Согласен получить одно сообщение о запуске. Для удаления этой заявки могу написать ответ на это письмо.'
 ].join(String.fromCharCode(10));
 return {subject,body};
}
function showInfo(s){if(n)n.textContent=s}
if(f)f.addEventListener('submit',e=>{
 e.preventDefault();const q=getLaunchRequest();if(!q)return;
 const uri='mailto:'+listEmail+'?subject='+encodeURIComponent(q.subject)+'&body='+encodeURIComponent(q.body);
 showInfo('Откройте письмо и отправьте его из своей почтовой программы. Если она не откроется, нажмите «Скопировать заявку». Сайт не принимает оплату и не получает ваш email автоматически.');
 window.location.href=uri;
});
if(copyButton)copyButton.addEventListener('click',async()=>{
 const q=getLaunchRequest();if(!q)return;
 const s=['Кому: '+listEmail,'Тема: '+q.subject,'',q.body].join(String.fromCharCode(10));
 try{
  if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
  await navigator.clipboard.writeText(s);showInfo('Текст скопирован. Отправьте его на '+listEmail+'.');
 }catch(err){showInfo('Напишите на '+listEmail+' с темой «'+q.subject+'».')}
});
render()
})();
