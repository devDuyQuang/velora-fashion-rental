import React,{useEffect,useState} from 'react'
import {CalendarDays,ChevronDown,ChevronLeft,ChevronRight,Heart,Percent,Shirt,Sparkles,Star} from 'lucide-react'
import {brands,photo,products,money} from './data.js'

export const catalogLink = (path,filters) => '#'+path+'?'+new URLSearchParams(filters)
const clothing = [
 ['Váy dạ hội & Sự kiện','Váy dạ hội'],['Đầm dự tiệc','Đầm dự tiệc'],
 ['Áo dài truyền thống & Cách tân','Áo dài'],['Vest & Suit nữ','Vest/Suit'],['Đồ đi biển & Du lịch','Đồ đi biển'],
]
const occasions = ['Tiệc cưới','Prom/Kỷ yếu','Chụp ảnh Lookbook','Công sở cao cấp']
const menus = [
 ['Thuê trang phục','/rent',[
  ['Theo trang phục',clothing.map(([name,category])=>[name,catalogLink('/rent',{category})])],
  ['Theo dịp',occasions.map(occasion=>[occasion,catalogLink('/rent',{occasion})])],
 ]],
 ['Mua sắm','/buy',[
  ['Đồ mới & Thanh lý',[['Hàng thiết kế mới',catalogLink('/buy',{sale:'new'})],['Outlet giảm đến 70%',catalogLink('/buy',{sale:'outlet'})]]],
  ['Phụ kiện',['Túi xách','Trang sức','Giày'].map(category=>[category,catalogLink('/buy',{category})])],
 ]],
 ['Thương hiệu','/brands',[['Local Brand & Nhà thiết kế',brands.map(brand=>[brand,catalogLink('/collection',{brand})])]]],
 ['Gói hội viên','/membership'],
 ['Hướng dẫn & Chính sách','/policy',[['Hướng dẫn dịch vụ', [['Quy trình thuê 4 bước','#/policy/process'],['Giặt hấp TrueSteam','#/policy/steam'],['Câu hỏi thường gặp','#/policy/faq']]]]],
]
export function Navigation({path,mobile}) {
 const [open,setOpen]=useState('')
 useEffect(()=>setOpen(''),[path,mobile])
 useEffect(()=>{
  const close=e=>{if(e.key==='Escape'||(e.type==='pointerdown'&&!e.target.closest('nav')))setOpen('')}
  document.addEventListener('keydown',close)
  document.addEventListener('pointerdown',close)
  return ()=>{document.removeEventListener('keydown',close);document.removeEventListener('pointerdown',close)}
 },[])
 return <nav className={mobile?'open':''} aria-label="Điều hướng chính">
  <a className={path==='/'?'active':''} href="#/">Trang chủ</a>
  {menus.map(([name,url,groups])=><div key={url} className="nav-entry">
   <a className={path.split('?')[0]===url?'active':''} href={'#'+url} onClick={()=>setOpen('')}>{name}</a>
   {groups&&<><button className="menu-toggle" type="button" aria-label={'Danh mục '+name} aria-expanded={open===url} onClick={()=>setOpen(open===url?'':url)}><ChevronDown size={15}/></button>
    {open===url&&<div className="mega-menu">{groups.map(([title,links])=><div key={title}><h3>{title}</h3>{links.map(([label,href])=><a href={href} onClick={()=>setOpen('')} key={href}>{label}</a>)}</div>)}</div>}</>}
  </div>)}
 </nav>
}

const slides = [
 {image:7,label:'TỦ ĐỒ THIẾT KẾ',title:'Tủ đồ hàng hiệu',accent:'không giới hạn.',body:'Tiết kiệm đến 80% với tủ đồ thiết kế cho mọi dịp.'},
 {image:13,label:'THUÊ LINH HOẠT',title:'Khoảnh khắc đẹp,',accent:'phong cách riêng.',body:'Khám phá lookbook tuyển chọn cho tiệc cưới, dạ hội và kỳ yếu.'},
 {image:14,label:'HỘI VIÊN VELORA',title:'Một tháng mới,',accent:'nhiều diện mạo.',body:'Chọn gói thuê theo tháng phù hợp với lịch trình của bạn.'},
]
export function Hero() {
 const [active,setActive]=useState(0)
 const slide=slides[active]
 const move=direction=>setActive((active+direction+slides.length)%slides.length)
 return <section className="hero pitch-hero" aria-label="Bộ sưu tập Velora" style={{backgroundImage:`linear-gradient(90deg,#141210ef,#1412108c 50%,#14121018 100%),url('${photo(slide.image)}')`}}>
  <div className="container hero-copy"><p className="eyebrow"><span/>{slide.label}</p><h1>{slide.title}<br/><em>{slide.accent}</em></h1><p>{slide.body}</p><div className="actions"><a className="button champagne" href="#/rent">Thuê ngay</a><a className="button outline-light" href="#/membership">Khám phá gói hội viên</a></div></div>
  <div className="slider-controls"><button aria-label="Banner trước" onClick={()=>move(-1)}><ChevronLeft size={20}/></button>{slides.map((s,i)=><button key={s.image} className="slide-dot" aria-label={'Banner '+(i+1)} aria-pressed={active===i} onClick={()=>setActive(i)}/>)}<button aria-label="Banner tiếp theo" onClick={()=>move(1)}><ChevronRight size={20}/></button></div>
 </section>
}

const highlights = [
 [Shirt,'Tủ đồ +5.000 sản phẩm','Đa dạng phong cách từ các thương hiệu cao cấp.'],
 [Percent,'Ưu đãi khủng','Giảm 50% lần thuê đầu tiên với mã KOL50.'],
 [Sparkles,'Giặt hấp TrueSteam','Diệt khuẩn 99,9%, giữ phom dáng chuẩn spa.'],
 [CalendarDays,'Lịch thuê tùy thích','Thuê trong ngày hoặc đặt lịch trước linh hoạt.'],
]
const visualCategories = [
 ['Đầm Dạ Hội',0,{category:'Váy dạ hội'}],['Áo Dài',4,{category:'Áo dài'}],
 ['Đồ Tiệc Cưới',8,{occasion:'Tiệc cưới'}],['Vest Công Sở',3,{category:'Vest/Suit'}],['Túi Hiệu',10,{category:'Túi xách'}],
]
const tabs = ['Xu hướng thuê nhiều nhất','Bộ sưu tập mới','Đồ thanh lý giá tốt']
export function PitchHome({Grid,quick,favorites,toggleFavorite}) {
 const [tab,setTab]=useState(0)
 const featured = tab===2 ? products.filter(p=>p.outlet) : [...products].sort((a,b)=>tab===0?b.popularity-a.popularity:b.id-a.id)
 return <>
  <Hero/>
  <section className="services"><div className="container service-grid">{highlights.map(([Icon,title,desc])=><article key={title}><div className="service-icon"><Icon size={23}/></div><div><h3>{title}</h3><p>{desc}</p></div></article>)}</div></section>
  <section className="container section category-section"><div className="section-title"><p className="eyebrow">CHỌN THEO PHONG CÁCH</p><h2>Danh mục nổi bật</h2></div><div className="visual-grid">{visualCategories.map(([title,image,query])=><a key={title} href={catalogLink('/rent',query)}><img src={photo(image)} alt="" loading="lazy"/><span>{title}</span></a>)}</div></section>
  <section className="container featured"><div className="section-title"><p className="eyebrow">TỦ ĐỒ VELORA</p><h2>Thiết kế nổi bật</h2></div>
   <div className="tabs">{tabs.map((label,i)=><button key={label} className={tab===i?'selected':''} aria-pressed={tab===i} onClick={()=>setTab(i)}>{label}</button>)}</div>
   <Grid items={featured.slice(0,4)} mode={tab===2?'buy':'rent'} quick={quick} favorites={favorites} toggleFavorite={toggleFavorite}/>
   <div className="center"><a className="button secondary" href={tab===2?catalogLink('/buy',{sale:'outlet'}):'#/collection'}>Xem tất cả thiết kế</a></div>
  </section>
  <section className="lookbook"><div className="container section"><div className="section-title"><p className="eyebrow">LOOKBOOK CỘNG ĐỒNG</p><h2>Góc KOL & khách hàng</h2><p className="muted">Các set đồ minh họa cho buổi trình diễn Velora.</p></div><div className="look-grid">{[[0,'Điểm hẹn dạ tiệc'],[8,'Một ngày dự tiệc cưới'],[9,'Kỳ nghỉ cuối tuần']].map(([image,name],i)=><article key={name}><img src={photo(image)} alt={name} loading="lazy"/><div><h3>{name}</h3><a className="button secondary" href={'#/product/'+[1,7,8][i]+'/rent'}>Thuê set đồ này</a></div></article>)}</div></div></section>
 </>
}

export function FavoriteButton({product,favorites,toggleFavorite}) {
 const picked=favorites.includes(product.id)
 return <button className="favorite icon-button" type="button" aria-label={(picked?'Bỏ yêu thích ':'Yêu thích ')+product.name} aria-pressed={picked} onClick={()=>toggleFavorite(product.id)}><Heart size={19} fill={picked?'currentColor':'none'}/></button>
}

export function Brands() {
 return <><div className="page-banner"><p className="eyebrow">NHÀ THIẾT KẾ & LOCAL BRAND</p><h1>Thương hiệu</h1></div><section className="container section"><div className="brand-grid">{brands.map(brand=><a className="brand-tile" key={brand} href={catalogLink('/collection',{brand})}><h2>{brand}</h2><span>{products.filter(p=>p.brand===brand).length} thiết kế mẫu</span></a>)}</div></section></>
}

const plans = [
 ['Cơ Bản',999000,'3 bộ mỗi tháng','Cho các dịp đặc biệt trong tháng.'],
 ['Nâng Cao',1499000,'6 bộ mỗi tháng','Cho lịch công sở và sự kiện thường xuyên.'],
 ['VIP',1999000,'Thuê không giới hạn','Luân phiên trang phục trong tháng.'],
]
export function Membership({selected,select}) {
 return <><div className="page-banner"><p className="eyebrow">VELORA MEMBERSHIP</p><h1>Gói hội viên</h1><p>Thuê trang phục thiết kế theo tháng.</p></div><section className="container section"><div className="plan-grid">{plans.map(([name,price,limit,desc])=><article className={name==='VIP'?'plan vip':'plan'} key={name}><h2>{name}</h2><p className="plan-price">{money(price)} <span>/ tháng</span></p><p><Star size={16}/>{limit}</p><p>{desc}</p><button className={'button '+(name==='VIP'?'champagne':'primary')} aria-pressed={selected===name} onClick={()=>select(name)}>{selected===name?'Đã chọn gói '+name:'Chọn gói '+name}</button></article>)}</div><p className="muted plan-note">Gói hội viên dùng cho bản demo. Lựa chọn được lưu trên thiết bị này.</p></section></>
}

export function PartnerForm({submit}) {
 return <form className="checkout-form account-form" onSubmit={event=>{event.preventDefault();submit(Object.fromEntries(new FormData(event.currentTarget)))}}>
  <p>Ký gửi trang phục thiết kế hoặc hợp tác thương hiệu cùng Velora.</p>
  <label>Hình thức hợp tác<select name="type"><option>Ký gửi trang phục</option><option>Hợp tác thương hiệu</option></select></label>
  <label>Họ tên hoặc tên thương hiệu<input name="name" required/></label>
  <label>Email liên hệ<input name="email" type="email" required/></label>
  <label>Số điện thoại<input name="phone" type="tel" required pattern="[+0-9 .]{8,18}"/></label>
  <label>Thông tin bổ sung<textarea name="note" rows="3"/></label>
  <button className="button primary">Lưu đăng ký đối tác</button>
 </form>
}
