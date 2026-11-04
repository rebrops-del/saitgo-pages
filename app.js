(()=>{'use strict';
const $=s=>document.querySelector(s);
const fieldIds=['seller','docNo','docDate','phone','client','clientPhone','car','plate','notes'];
const storageKey='stoblank-form-v1';
const productPrice=1499;
const productPriceLabel=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(productPrice)+' ₽';
const paymentCard='2204120200402929';
const contactEmail='ps.beletckii@gmail.com';
const eol=String.fromCharCode(10);
const money=n=>new Intl.NumberFormat('ru-RU',{minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(n)||0)+' ₽';
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const limit=(v,max)=>Math.min(max,Math.max(0,Number(v)||0));
const allowedModes=['Заказ-наряд','Акт выполненных работ','Смета'];
let saved=null;
try{saved=JSON.parse(localStorage.getItem(storageKey)||'null')}catch(e){}
let mode=allowedModes.includes(saved?.mode)?saved.mode:'Заказ-наряд';
let items=Array.isArray(saved?.items)&&saved.items.length<=60?saved.items:[{name:'Диагностика автомобиля (пример)',qty:1,price:1800},{name:'',qty:1,price:0}];
items=items.map(v=>({name:String(v.name||'').slice(0,160),qty:limit(v.qty,100000),price:limit(v.price,100000000)}));
for(const id of fieldIds){const el=$('#'+id);if(el&&typeof saved?.fields?.[id]==='string')el.value=saved.fields[id]}
if(!$('#docDate').value)$('#docDate').value=today();
if(!$('#docNo').value)$('#docNo').value='001';
const sum=()=>items.reduce((t,item)=>t+Math.round(item.qty*item.price*100)/100,0);
function save(){try{const fields={};fieldIds.forEach(id=>fields[id]=$('#'+id)?.value||'');localStorage.setItem(storageKey,JSON.stringify({mode,items,fields}))}catch(e){}}
function renderItems(){
 document.querySelectorAll('.doc-tabs button').forEach(b=>{b.classList.toggle('active',b.dataset.type===mode);b.setAttribute('aria-pressed',String(b.dataset.type===mode))});
 const list=$('#itemRows');list.replaceChildren();
 items.forEach((item,i)=>{
  const row=document.createElement('div');row.className='item-row';
  const title=document.createElement('input');title.type='text';title.maxLength=160;title.value=item.name;title.placeholder='Работа или материал';title.setAttribute('aria-label','Наименование позиции '+(i+1));
  const qty=document.createElement('input');qty.type='number';qty.step='any';qty.min='0';qty.max='100000';qty.value=item.qty;qty.setAttribute('aria-label','Количество позиции '+(i+1));
  const price=document.createElement('input');price.type='number';price.step='any';price.min='0';price.max='100000000';price.value=item.price;price.setAttribute('aria-label','Цена позиции '+(i+1));
  const total=document.createElement('div');total.className='row-sum';total.textContent=money(item.qty*item.price);
  const del=document.createElement('button');del.className='remove-row';del.type='button';del.title='Удалить позицию';del.setAttribute('aria-label','Удалить позицию '+(i+1));del.textContent='×';
  title.addEventListener('input',()=>{item.name=title.value;save()});
  qty.addEventListener('input',()=>{item.qty=limit(qty.value,100000);updateTotal();total.textContent=money(item.qty*item.price);save()});
  price.addEventListener('input',()=>{item.price=limit(price.value,100000000);updateTotal();total.textContent=money(item.qty*item.price);save()});
  del.addEventListener('click',()=>{items.splice(i,1);renderItems()});
  row.append(title,qty,price,total,del);list.appendChild(row);
 });
 updateTotal();save();
}
function updateTotal(){$('#total').textContent=money(sum())}
fieldIds.forEach(id=>$('#'+id)?.addEventListener('input',save));
document.querySelectorAll('.doc-tabs button').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.type;renderItems()}));
$('#addRow').addEventListener('click',()=>{if(items.length>=60){alert('Не больше 60 позиций в одном документе.');return}items.push({name:'',qty:1,price:0});renderItems();$('#itemRows .item-row:last-child input')?.focus()});
$('#clear').addEventListener('click',()=>{if(!confirm('Удалить сведения документа с этого устройства?'))return;fieldIds.forEach(id=>$('#'+id).value='');$('#docDate').value=today();$('#docNo').value='001';items=[{name:'',qty:1,price:0}];renderItems()});
$('#print').addEventListener('click',()=>{
 $('#pType').textContent=mode;
 $('#pNum').textContent='№ '+($('#docNo').value||'б/н')+' от '+($('#docDate').value||'—').split('-').reverse().join('.');
 const info=[['Исполнитель',$('#seller').value],['Телефон исполнителя',$('#phone').value],['Клиент',$('#client').value],['Телефон клиента',$('#clientPhone').value],['Автомобиль',$('#car').value],['Госномер / VIN',$('#plate').value]];
 $('#pMeta').innerHTML=info.filter(x=>x[1].trim()).map(([key,value])=>'<div><b>'+escapeHtml(key)+':</b> '+escapeHtml(value)+'</div>').join('');
 const valid=items.filter(x=>x.name.trim());
 $('#pRows').innerHTML=valid.length?valid.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+escapeHtml(x.name)+'</td><td>'+escapeHtml(x.qty)+'</td><td>'+money(x.price)+'</td><td>'+money(x.qty*x.price)+'</td></tr>').join(''):'<tr><td colspan="5">Позиции не указаны</td></tr>';
 $('#pTotal').textContent='Итого: '+money(sum());
 $('#pNotes').textContent=$('#notes').value?'Примечания: '+$('#notes').value:'';
 window.print();
});
const year=$('#year');if(year)year.textContent=new Date().getFullYear();
for(const el of document.querySelectorAll('[data-pro-price]'))el.textContent=productPriceLabel;
const form=$('#checkoutForm');
const checkoutMessage=$('#checkoutMessage');
const copyStatus=$('#cardCopyStatus');
function inform(text){if(checkoutMessage)checkoutMessage.textContent=text}
function buyerEmail(){if(!form||!form.reportValidity())return null;return $('#email').value.trim()}
function makeInquiry(){
 const email=buyerEmail();if(!email)return null;
 return {subject:'СТОБланк PRO — заказ '+productPriceLabel,
 body:[
 'Здравствуйте!', '',
 'Хочу приобрести комплект СТОБланк PRO за '+productPriceLabel+'.',
 'Планирую ручной перевод на указанную карту ЮMoney (последние цифры 2929).',
 'Подтвердите, пожалуйста, условия заказа, реквизиты продавца, порядок выдачи кассового чека и срок отправки ZIP-файла.',
 '', 'Email для ответа и получения комплекта: '+email, '',
 'До согласования заказа перевод не выполняю.'
 ].join(eol)};
}
function makePaidReport(){
 const email=buyerEmail();if(!email)return null;
 return {subject:'СТОБланк PRO — перевод на проверку '+productPriceLabel,
 body:[
 'Здравствуйте!', '',
 'Сообщаю о переводе за СТОБланк PRO на '+productPriceLabel+'.',
 'Карта получателя: ЮMoney, последние цифры 2929.',
 'Дата перевода: [указать]',
 'Время перевода: [указать]',
 'Email для ответа и выдачи файла: '+email,
 '', 'Пожалуйста, проверьте фактическое зачисление и сообщите о чеке и выдаче ZIP-файла.',
 'Скриншот перевода не является подтверждением зачисления.'
 ].join(eol)};
}
function openMail(order){
 if(!order)return;
 const link='mailto:'+contactEmail+'?subject='+encodeURIComponent(order.subject)+'&body='+encodeURIComponent(order.body);
 inform('Откроется письмо в вашей почтовой программе. Для отправки нажмите «Отправить» самостоятельно. Если приложение не открывается, используйте «Скопировать текст заявки». Платёж и выдача файла здесь не автоматизированы.');
 window.location.href=link;
}
form?.addEventListener('submit',e=>{e.preventDefault();openMail(makeInquiry())});
$('#paidReport')?.addEventListener('click',()=>openMail(makePaidReport()));
$('#copyRequest')?.addEventListener('click',async()=>{
 const order=makeInquiry();if(!order)return;
 const full=['Кому: '+contactEmail,'Тема: '+order.subject,'',order.body].join(eol);
 try{if(!navigator.clipboard?.writeText)throw Error('unavailable');await navigator.clipboard.writeText(full);inform('Заявка скопирована. Отправьте её самостоятельно на '+contactEmail+'.')}catch(e){inform('Не удалось скопировать автоматически. Напишите на '+contactEmail+' с темой «'+order.subject+'».')}
});
$('#copyCard')?.addEventListener('click',async()=>{
 try{
  if(!navigator.clipboard?.writeText)throw Error('unavailable');
  await navigator.clipboard.writeText(paymentCard);
  if(copyStatus)copyStatus.textContent='Номер карты скопирован. Переводите после согласования заказа с продавцом.';
 }catch(e){if(copyStatus)copyStatus.textContent='Автокопирование не поддерживается. Перепишите номер карты с экрана вручную.'}
});
renderItems();
})();