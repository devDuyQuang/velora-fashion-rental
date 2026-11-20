export const categories = ['Váy dạ hội', 'Váy công sở', 'Áo dài', 'Vest/Suit', 'Phụ kiện']
export const sizes = ['XS', 'S', 'M', 'L', 'XL']
export const photo = (index, detail = false) => `/images/${index}${detail ? '-detail' : ''}.jpg`
export const products = [
 ['Élodie', 'Váy satin ánh champagne', 0, 280000, 1390000, 'Hot', 'Satin mềm, bề mặt ánh nhẹ', ['S','M','L']],
 ['Noir Muse', 'Đầm dạ hội cổ vuông', 0, 230000, 1190000, 'Mới', 'Crepe cao cấp, lót lụa', ['XS','S','M']],
 ['Fleur', 'Đầm hoa dáng dài', 1, 190000, 890000, 'Giảm giá', 'Voan in hoa, lót mềm', ['S','M','L']],
 ['Maison', 'Vest phom may đo', 3, 320000, 1590000, 'Mới', 'Twill dệt chéo, lót mỏng', ['M','L','XL']],
 ['An Nhiên', 'Áo dài dáng suông', 2, 260000, 1350000, 'Mới', 'Lụa mềm, có lớp lót', ['S','M','L','XL']],
 ['Lumière', 'Vòng cổ ánh vàng', 4, 90000, 490000, 'Giảm giá', 'Hợp kim mạ vàng, dây điều chỉnh', ['S','M','L']],
].map(([name, subtitle, category, rent, sale, badge, material, sizes], i) => ({
 id: i+1, name, subtitle, category: categories[category], rent, sale, original: rent * 2, deposit: rent * 2, badge, material, sizes, image: i
}))
export const money = value => new Intl.NumberFormat('vi-VN', {style:'currency', currency:'VND'}).format(value)
export function today() {
 const now = new Date()
 return [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-')
}
export function returnDate(start, days) {
 const date = new Date(start + 'T12:00:00')
 date.setDate(date.getDate() + days)
 return date.toLocaleDateString('vi-VN')
}
export function totals(items, coupon) {
 const subtotal = items.reduce((sum, i) => sum + (i.mode === 'rent' ? i.product.rent * i.days : i.product.sale) * i.qty, 0)
 const deposit = items.reduce((sum, i) => sum + (i.mode === 'rent' ? i.product.deposit * i.qty : 0), 0)
 const discount = coupon ? Math.round(subtotal / 2) : 0
 return {subtotal, deposit, discount, total: subtotal + deposit - discount}
}
