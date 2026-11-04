
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
// Ручной перевод: здесь нет платёжного процессинга и подтверждения зачисления.
const orderEmail='ps.beletckii@gmail.com';
const cardDigits='2204120200402929';
const f=$('#checkoutForm');
const n=$('#checkoutMessage');
const copyButton=$('#copyRequest');
const paidButton=$('#paidReport');
const copyCardButton=$('#copyCard');
const cardStatus=$('#cardCopyStatus');
const lf=String.fromCharCode(10);
function getBuyerEmail(){
  if(!f||!f.reportValidity())return null;
  return $('#email').value.trim();
}
function makeOrderRequest(){
 const email=getBuyerEmail();if(!email)return null;
 return {
  subject:'СТОБланк PRO — запрос реквизитов для перевода',
  body:[
   'Здравствуйте!',
   '',
   'Хочу приобрести комплект «СТОБланк PRO» за 1 490 ₽.',
   'На сайте указана карта ЮMoney, последние цифры 2929.',
   'Подтвердите, пожалуйста, возможность покупки, реквизиты получателя, условия выдачи чека и срок отправки ZIP.',
   '',
   'Мой email для ответа: '+email,
   '',
   'Перевод выполню после вашего подтверждения.'
  ].join(lf)
 };
}
function makePaidNotice(){
 const email=getBuyerEmail();if(!email)return null;
 return {
  subject:'СТОБланк PRO — сообщение о переводе (проверьте зачисление)',
  body:[
   'Здравствуйте!',
   '',
   'Сообщаю о переводе по заказу «СТОБланк PRO», сумма 1 490 ₽.',
   'Получатель: карта ЮMoney, последние цифры 2929.',
   'Дата перевода: [укажите дату]',
   'Время перевода: [укажите время]',
   'Мой email для ответа: '+email,
   '',
   'Пожалуйста, проверьте фактическое поступление средств и направьте информацию о выдаче чека и комплекта.',
   'Не передаю CVV, пароли и коды подтверждения.'
  ].join(lf)
 };
}
function showOrderMessage(message){if(n)n.textContent=message}
function openEmail(req){
 if(!req)return;
 const uri='mailto:'+orderEmail+'?subject='+encodeURIComponent(req.subject)+'&body='+encodeURIComponent(req.body);
 showOrderMessage('Откроется ваша почтовая программа. Обязательно нажмите «Отправить». Сайт не видит факт отправки письма и не проверяет оплату. Если почта не открылась, нажмите «Скопировать текст заявки».');
 window.location.href=uri;
}
if(f)f.addEventListener('submit',e=>{e.preventDefault();openEmail(makeOrderRequest())});
if(paidButton)paidButton.addEventListener('click',()=>openEmail(makePaidNotice()));
if(copyButton)copyButton.addEventListener('click',async()=>{
 const req=makeOrderRequest();if(!req)return;
 const data=['Кому: '+orderEmail,'Тема: '+req.subject,'',req.body].join(lf);
 try{
   if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error('clipboard unavailable');
   await navigator.clipboard.writeText(data);
   showOrderMessage('Заявка скопирована. Отправьте её самостоятельно на '+orderEmail+'.');
 }catch(e){showOrderMessage('Откройте письмо вручную на '+orderEmail+' с темой «'+req.subject+'».')}
});
if(copyCardButton)copyCardButton.addEventListener('click',async()=>{
 try{
   if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error('clipboard unavailable');
   await navigator.clipboard.writeText(cardDigits);
   if(cardStatus)cardStatus.textContent='Номер карты скопирован. Перед переводом согласуйте заказ с продавцом.';
 }catch(e){if(cardStatus)cardStatus.textContent='Автокопирование недоступно. Перепишите номер с экрана (16 цифр).'}
});
render()
})();
