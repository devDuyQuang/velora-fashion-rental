export const categories = ['Váy dạ hội', 'Đầm dự tiệc', 'Áo dài', 'Vest/Suit', 'Váy công sở', 'Đồ đi biển', 'Túi xách', 'Trang sức', 'Giày']
export const occasions = ['Tiệc cưới', 'Prom/Kỷ yếu', 'Chụp ảnh Lookbook', 'Công sở cao cấp', 'Du lịch']
export const sizes = ['XS', 'S', 'M', 'L', 'XL']
export const photo = (index, detail = false) => `/images/${index}${detail && index < 6 ? '-detail' : ''}.jpg`
const entries = [
 ['Élodie','Váy satin ánh champagne',0,150000,1390000,'Lâm Gia Khang','Champagne',[0,1],0,'Satin mềm, bề mặt ánh nhẹ'],
 ['Noir Muse','Đầm dạ hội cổ vuông',0,130000,1190000,'Chung Thanh Phong','Đen',[0,1],1,'Crepe cao cấp, lót lụa'],
 ['Fleur','Đầm hoa dáng dài',1,110000,890000,'L’espoir','Hồng',[0,4],2,'Voan in hoa, lót mềm'],
 ['Maison','Vest phom may đo',3,160000,1590000,'The Blue T-shirt','Be',[2,3],3,'Twill dệt chéo, lót mỏng'],
 ['An Nhiên','Áo dài dáng suông',2,140000,1350000,'Thủy Design House','Trắng',[0,1,2],4,'Lụa mềm, có lớp lót'],
 ['Lumière','Vòng cổ ánh vàng',7,55000,490000,'Dear José','Champagne',[0,2],12,'Hợp kim mạ vàng, dây điều chỉnh'],
 ['Rosalie','Đầm midi cổ nhẹ nhàng',1,125000,1490000,'L’espoir','Hồng',[0,2],8,'Organza dệt mềm'],
 ['Dune','Váy nghỉ dưỡng dáng dài',5,95000,1090000,'Dear José','Be',[2,4],9,'Cotton pha linen'],
 ['Atelier','Túi da dáng hộp',6,75000,1990000,'The Blue T-shirt','Đen',[0,3],10,'Da tổng hợp vân mịn'],
 ['Minuit','Giày cao gót mũi nhọn',8,60000,790000,'Dear José','Đen',[0,1],11,'Da tổng hợp, gót 7 cm'],
 ['Soleil','Váy công sở phom gọn',4,115000,1250000,'Lâm Gia Khang','Trắng',[3,4],9,'Cotton dệt chéo'],
 ['Vân Khê','Áo dài cách tân',2,170000,1890000,'Thủy Design House','Champagne',[0,2],4,'Lụa pha tơ'],
]
export const products = entries.map(([name,subtitle,category,rent,sale,brand,color,events,image,material],i)=>({
 id:i+1,name,subtitle,category:categories[category],rent,sale,original:rent*2,deposit:rent*2,
 brand,color,occasions:events.map(e=>occasions[e]),image,material,
 outlet:[1,2,5,8,9].includes(i), popularity:[98,96,95,94,91,87,92,86,83,79,75,88][i],
 sizes:i===3?['M','L','XL']:i===4?['S','M','L','XL']:i%3===1?['XS','S','M']:['XS','S','M','L'],
}))
export const brands = [...new Set(products.map(product => product.brand))]
export const money = value => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(value)
export function today() {
 const now = new Date()
 return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-')
}
export function returnDate(start,days) {
 const date = new Date(start+'T12:00:00')
 date.setDate(date.getDate()+days)
 return date.toLocaleDateString('vi-VN')
}
export const outletPrice = product => product.outlet ? Math.round(product.sale * .3) : product.sale
export const itemPrice = item => item.mode==='rent' ? item.product.rent*item.days : item.price ?? item.product.sale
export function totals(items,coupon) {
 let subtotal=0, rental=0, deposit=0
 for(const item of items){
  const charge=itemPrice(item)*item.qty
  subtotal+=charge
  if(item.mode==='rent'){rental+=charge;deposit+=item.product.deposit*item.qty}
 }
 const discount = Math.round((coupon==='KOL50'?rental:coupon?subtotal:0)/2)
 return {subtotal,deposit,discount,total:subtotal+deposit-discount}
}
