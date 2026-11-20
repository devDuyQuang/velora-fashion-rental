import React, {useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Search, ShoppingBag, Phone, Mail, UserRound, Package, Menu, X, Shirt, Percent, Sparkles, CalendarDays, Instagram, Facebook, CreditCard, Truck, Plus, Minus, Trash2, Check, ChevronRight, SlidersHorizontal} from 'lucide-react'
import {products, categories, sizes, photo, money, today, returnDate, totals} from './data.js'
import './style.css'

const labels = {rent:'Thuê trang phục', buy:'Mua sản phẩm'}
const payments = ['Chuyển khoản QR','Ví MoMo','Thanh toán khi nhận hàng (COD)']
const nav = [['Trang chủ','/'],['Thuê đồ','/rent'],['Mua đồ','/buy'],['Bộ sưu tập','/collection'],['Chính sách thuê','/policy']]
const go = path => { location.hash = path }
const route = () => location.hash.slice(1) || '/'
function useStored(key, initial) {
 const [value, setValue] = useState(() => {
  try { return JSON.parse(localStorage.getItem(key)) ?? initial }
  catch { return initial }
 })
 return [value, next => { localStorage.setItem(key, JSON.stringify(next)); setValue(next) }]
}
const formatDate = date => returnDate(date, 0)

function App() {
 const [path, setPath] = useState(route)
 const [cart, setCart] = useStored('velora.cart', [])
 const [orders, setOrders] = useStored('velora.orders', [])
 const [account, setAccount] = useStored('velora.account', null)
 const [coupon, setCoupon] = useStored('velora.coupon', false)
 const [search, setSearch] = useState('')
 const [searchOpen, setSearchOpen] = useState(false)
 const [mobile, setMobile] = useState(false)
 const [modal, setModal] = useState(null)
 const [notice, setNotice] = useState('')
 React.useEffect(() => {
  const update = () => { setPath(route()); setMobile(false); setSearchOpen(false); window.scrollTo(0,0) }
  window.addEventListener('hashchange', update)
  return () => window.removeEventListener('hashchange', update)
 }, [])
 React.useEffect(() => {
  if (!notice) return
  const timer = setTimeout(() => setNotice(''), 2500)
  return () => clearTimeout(timer)
 }, [notice])
 const add = (item, checkout) => {
  const key = [item.product.id,item.mode,item.size,item.date,item.days].join(':')
  const existing = cart.find(i => i.key === key)
  setCart(existing ? cart.map(i => i.key === key ? {...i,qty:i.qty+1} : i) : [...cart,{...item,key,qty:1}])
  setModal(null)
  if (checkout) go('/cart')
  else setNotice('Đã thêm vào giỏ hàng')
 }
 const placeOrder = (recipient, payment) => {
  let code
  do {code = 'VLR' + crypto.randomUUID().slice(0,8).toUpperCase()} while (orders.some(o => o.code === code))
  setOrders([{code, recipient, payment, items:cart, ...totals(cart,coupon), date:new Date().toISOString()}, ...orders])
  setCart([])
  setCoupon(false)
  go('/success/' + code)
 }
 const results = products.filter(p => normalize(p.name + ' ' + p.subtitle + ' ' + p.category).includes(normalize(search.trim())))
 const detail = path.match(/^\/product\/(\d+)(?:\/(rent|buy))?$/)
 const product = detail && products.find(p => p.id === Number(detail[1]))
 let page
 if (path === '/') page = <Home quick={(product,mode) => setModal({product,mode})}/>
 else if (['/rent','/buy','/collection','/search'].includes(path)) page = <Catalog key={path} path={path} products={path === '/search' ? results : products} quick={(product,mode) => setModal({product,mode})}/>
 else if (product) page = <Product key={path} product={product} initialMode={detail[2] || 'rent'} add={add}/>
 else if (path === '/cart') page = <Cart cart={cart} setCart={setCart} coupon={coupon} setCoupon={setCoupon} account={account} placeOrder={placeOrder}/>
 else if (path === '/track' || path.startsWith('/track/')) page = <Tracking key={path} orders={orders} initial={path.split('/')[2] || ''}/>
 else if (path === '/policy') page = <Policy/>
 else if (path.startsWith('/success/') && orders.some(o=>o.code===path.split('/')[2])) page = <div className="container success"><Check size={48}/><h1>Đặt hàng thành công</h1><p>Mã đơn hàng <b>#{path.split('/')[2]}</b></p><p>Đơn hàng đã được lưu trên trình duyệt này.</p><a className="button primary" href={'#/track/'+path.split('/')[2]}>Theo dõi đơn hàng</a></div>
 else page = <div className="container success"><h1>Không tìm thấy trang</h1><a className="button primary" href="#/">Về trang chủ</a></div>
 return <>
  <div className="topbar"><div className="container top-inner">
   <div className="top-contact"><a href="tel:0901884068"><Phone/> 0901 884 068</a><a href="mailto:hello@veloracloset.vn"><Mail/> hello@veloracloset.vn</a></div>
   <div><a href="#/track"><Package/> Theo dõi đơn hàng</a><button onClick={()=>setModal('account')}><UserRound/> {account?.name || 'Đăng nhập / Đăng ký'}</button></div>
  </div></div>
  <header><div className="container header-inner">
   <button className="menu icon-button" aria-label="Mở menu" aria-expanded={mobile} onClick={()=>setMobile(!mobile)}><Menu/></button>
   <a className="logo" href="#/">VELORA<span>C L O S E T</span></a>
   <nav className={mobile ? 'open' : ''}>{nav.map(([name,url])=><a key={url} className={path===url?'active':''} href={'#'+url}>{name}</a>)}</nav>
   <div className="head-actions">
    <form className="search" role="search" onSubmit={e=>{e.preventDefault();setSearchOpen(false);go('/search')}}>
     <button aria-label="Tìm sản phẩm"><Search size={17}/></button><input aria-label="Tìm sản phẩm" placeholder="Tìm trang phục..." value={search} onFocus={()=>setSearchOpen(true)} onChange={e=>{setSearch(e.target.value);setSearchOpen(true)}} onBlur={e=>{if(!e.currentTarget.form.contains(e.relatedTarget))setSearchOpen(false)}}/>
     {searchOpen && search.trim() && <div className="search-results">{results.length ? results.slice(0,5).map(p=><a href={'#/product/'+p.id} key={p.id}><img src={photo(p.image)} alt=""/><span>{p.name}<small>{p.subtitle}</small></span></a>) : <p>Không tìm thấy trang phục.</p>}</div>}
    </form>
    <a className="bag icon-button" aria-label={'Giỏ hàng, '+cart.reduce((n,i)=>n+i.qty,0)+' món'} href="#/cart"><ShoppingBag size={22}/><span>{cart.reduce((n,i)=>n+i.qty,0)}</span></a>
   </div>
  </div></header>
  <main>{page}</main>
  <Footer/>
  {notice && <div role="status" className="toast"><Check size={18}/>{notice}</div>}
  {modal==='account' && <Modal title={account?'Tài khoản':'Chào mừng đến Velora'} close={()=>setModal(null)}><Account account={account} save={next=>{setAccount(next);setModal(null)}}/></Modal>}
  {modal?.product && <Modal title={modal.product.name} close={()=>setModal(null)}><p className="muted">{modal.product.subtitle}</p><Options product={modal.product} initialMode={modal.mode} add={add}/></Modal>}
 </>
}

function normalize(value) {
 return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replaceAll('đ','d')
}

function Home({quick}) {
 const [mode,setMode] = useState('rent')
 return <>
  <section className="hero" style={{backgroundImage:`linear-gradient(90deg, #171512ec 0%, #171512a8 42%, #17151200 75%), url('${photo(7)}')`}}>
   <div className="container hero-copy"><div className="eyebrow"><span/> THỜI TRANG THUÊ & MUA</div>
    <h1>Sang trọng<br/>cho mọi <em>khoảnh khắc.</em></h1>
    <p>Khám phá tủ đồ tuyển chọn cho những dịp đặc biệt.<br/>Thuê linh hoạt, mua thiết kế bạn thật sự yêu.</p>
    <div className="actions"><a className="button champagne" href="#/collection">Khám phá tủ đồ</a><a className="button outline-light" href="#/rent">Thuê ngay giảm 50%</a></div>
   </div>
  </section>
  <section className="services"><div className="container service-grid">
   {[[Shirt,'Tủ đồ +5.000 thiết kế','Váy dạ hội, vest, áo dài và đồ đi tiệc.'],[Percent,'Ưu đãi đến 50%','Tiết kiệm chi phí so với mua mới.'],[Sparkles,'Giặt hấp TrueSteam','Khử khuẩn, thơm tho chuẩn spa trước khi giao.'],[CalendarDays,'Lịch thuê linh hoạt','Chủ động chọn ngày nhận và trả đồ.']].map(([Icon,title,desc])=><article key={title}><div className="service-icon"><Icon size={23}/></div><div><h3>{title}</h3><p>{desc}</p></div></article>)}
  </div></section>
  <section className="container featured">
   <div className="section-title"><p className="eyebrow">TỦ ĐỒ VELORA</p><h2>Thiết kế nổi bật</h2></div>
   <div className="tabs"><button className={mode==='rent'?'selected':''} onClick={()=>setMode('rent')}>Đồ Cho Thuê</button><button className={mode==='buy'?'selected':''} onClick={()=>setMode('buy')}>Đồ Bán (Thanh lý & Mới)</button></div>
   <Grid items={mode==='rent'?products.slice(0,4):[products[1],products[2],products[3],products[5]]} mode={mode} quick={quick}/>
   <div className="center"><a className="button secondary" href={'#/'+mode}>Xem tất cả thiết kế</a></div>
  </section>
 </>
}

function Grid({items,mode,quick}) {
 return <div className="product-grid">{items.map(p=><article className="product-card" key={p.id}>
  <a className="product-image" href={`#/product/${p.id}/${mode}`}>
   <img src={photo(p.image)} alt={p.subtitle} loading="lazy"/><img className="alternate" src={photo(p.image,true)} alt="" loading="lazy"/>
   <span className={'badge '+(p.badge==='Hot'?'hot':'')}>{p.badge}</span>
  </a>
  <div className="card-info"><small>{p.category}</small><h3><a href={`#/product/${p.id}/${mode}`}>{p.name}</a></h3><p>{p.subtitle}</p>
   <div className="prices">{mode==='buy'?<><b>{money(p.sale)}</b><span>Thuê {money(p.rent)}/ngày <del>{money(p.original)}</del></span></>:<><b>{money(p.rent)} <small>/ ngày</small> <del>{money(p.original)}</del></b><span>Mua {money(p.sale)}</span></>}</div>
   <div className="size-list">{p.sizes.map(s=><span key={s}>{s}</span>)}</div>
   <div className="card-actions"><a className="button secondary" href={`#/product/${p.id}/${mode}`}>Xem chi tiết</a><button className="button primary" onClick={()=>quick(p,mode)} aria-label={'Thêm nhanh vào giỏ '+p.name} title="Thêm nhanh vào giỏ"><ShoppingBag size={17}/><Plus size={13}/></button></div>
  </div>
 </article>)}</div>
}

function Catalog({path,products,quick}) {
 const [mode,setMode] = useState(path==='/buy' ? 'buy':'rent')
 const [category,setCategory] = useState('')
 const [size,setSize] = useState('')
 const [range,setRange] = useState('')
 const [sort,setSort] = useState('new')
 const [min,max] = range ? range.split('-').map(Number) : [0,Infinity]
 const price = p => mode==='rent' ? p.rent : p.sale
 const filtered = products.filter(p => (!category || p.category===category) && (!size || p.sizes.includes(size)) && price(p)>=min && price(p)<max).sort((a,b)=>sort==='price'?price(a)-price(b):b.id-a.id)
 const title = {'/rent':'Thuê trang phục','/buy':'Mua trang phục','/collection':'Bộ sưu tập','/search':'Kết quả tìm kiếm'}[path]
 return <><div className="page-banner"><p className="eyebrow">VELORA CLOSET</p><h1>{title}</h1></div><section className="container section">
  <div className="filters">
   <span><SlidersHorizontal size={17}/> Bộ lọc</span>
   <label>Hình thức<select value={mode} onChange={e=>setMode(e.target.value)}><option value="rent">Thuê</option><option value="buy">Mua</option></select></label>
   <label>Loại trang phục<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">Tất cả</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
   <label>Kích cỡ<select value={size} onChange={e=>setSize(e.target.value)}><option value="">Tất cả</option>{sizes.map(s=><option key={s}>{s}</option>)}</select></label>
   <label>Khoảng giá<select value={range} onChange={e=>setRange(e.target.value)}><option value="">Tất cả</option><option value="0-250000">Dưới 250.000 ₫</option><option value="250000-500000">250.000 – 499.999 ₫</option><option value="500000-1000000">500.000 – 999.999 ₫</option><option value="1000000-Infinity">Từ 1.000.000 ₫</option></select></label>
   <label>Sắp xếp<select value={sort} onChange={e=>setSort(e.target.value)}><option value="new">Mới nhất</option><option value="price">Giá thấp đến cao</option></select></label>
  </div>
  <p className="results-count">{filtered.length} thiết kế {mode==='rent'?'cho thuê':'đang bán'}</p>
  {filtered.length?<Grid items={filtered} mode={mode} quick={quick}/>:<p className="empty">Không có thiết kế phù hợp.</p>}
 </section></>
}

function Product({product,initialMode,add}) {
 const [active,setActive] = useState(0)
 const [guide,setGuide] = useState(false)
 return <section className="container section">
  <div className="breadcrumb"><a href="#/">Trang chủ</a><ChevronRight size={14}/><a href="#/collection">Bộ sưu tập</a><ChevronRight size={14}/>{product.name}</div>
  <div className="detail-grid">
   <div><img className="detail-img" src={photo(product.image,!!active)} alt={product.subtitle}/>
    <div className="thumbs">{[0,1].map((i)=><button key={i} aria-label={i?'Xem ảnh cận cảnh':'Xem ảnh toàn bộ'} aria-pressed={i===active} onClick={()=>setActive(i)}><img src={photo(product.image,!!i)} alt=""/></button>)}</div>
   </div>
   <div className="detail-info"><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><p className="subtitle">{product.subtitle}</p><p>Chất liệu {product.material.toLowerCase()}.</p><p className="muted">Số đo tham khảo size M · Ngực 88, eo 70, hông 94 cm</p>
    <Options product={product} initialMode={initialMode} add={add} openGuide={()=>setGuide(true)}/>
   </div>
  </div>
  {guide&&<Modal title="Bảng quy đổi kích cỡ" close={()=>setGuide(false)}><p>Số đo cơ thể tham khảo (cm)</p><table><thead><tr>{['Size','Ngực','Eo','Hông'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{sizes.map((s,i)=><tr key={s}><th>{s}</th><td>{80+i*4}</td><td>{62+i*4}</td><td>{86+i*4}</td></tr>)}</tbody></table></Modal>}
 </section>
}

function Options({product,initialMode,add,openGuide}) {
 const [mode,setMode] = useState(initialMode)
 const [size,setSize] = useState('')
 const [days,setDays] = useState(3)
 const [date,setDate] = useState('')
 const [error,setError] = useState('')
 const renting = mode==='rent'
 return <form className="options" onSubmit={e=>{
  e.preventDefault()
  if(!size){setError('Vui lòng chọn size.');return}
  add({product,mode,size,days:renting?days:null,date:renting?date:null},e.nativeEvent.submitter?.value==='checkout')
 }}>
  <fieldset><legend>Hình thức</legend><div className="choices">{Object.entries(labels).map(([key,label])=><button key={key} type="button" aria-pressed={mode===key} onClick={()=>setMode(key)}>{label}</button>)}</div></fieldset>
  <fieldset><legend>Chọn size {openGuide&&<button type="button" className="text-link" onClick={openGuide}>Bảng kích cỡ</button>}</legend><div className="choices">{product.sizes.map(s=><button key={s} type="button" aria-pressed={size===s} onClick={()=>{setSize(s);setError('')}}>{s}</button>)}</div></fieldset>
  {renting&&<><div className="fields"><label>Ngày nhận đồ<input required type="date" min={today()} value={date} onChange={e=>setDate(e.target.value)}/></label><label>Gói thuê<select value={days} onChange={e=>setDays(Number(e.target.value))}>{[3,5,7].map(n=><option key={n} value={n}>{n} ngày</option>)}</select></label></div>{date&&<p>Ngày trả dự kiến <b>{returnDate(date,days)}</b></p>}</>}
  <div className="calculation"><div><span>{renting?`Tiền thuê · ${money(product.rent)}/ngày × ${days} ngày`:'Giá bán'}</span><b>{money(renting?product.rent*days:product.sale)}</b></div>{renting&&<><div><span>Tiền cọc thế chân</span><b>{money(product.deposit)}</b></div><small>Hoàn lại 100% khi trả đồ đúng hạn và nguyên trạng.</small></>}</div>
  {error&&<p role="alert" className="error">{error}</p>}
  <div className="actions"><button className="button secondary" value="cart">Thêm vào giỏ hàng</button><button className="button primary" value="checkout">{renting?'Đặt thuê ngay':'Mua ngay'}</button></div>
 </form>
}

function Cart({cart,setCart,coupon,setCoupon,account,placeOrder}) {
 const [code,setCode] = useState(coupon?'GIAM50':'')
 const [message,setMessage] = useState('')
 const [payment,setPayment] = useState(payments[2])
 const submitting = React.useRef(false)
 const summary = totals(cart,coupon)
 const quantity = (key,delta) => setCart(cart.map(i=>i.key===key?{...i,qty:i.qty+delta}:i))
 return <><div className="page-banner"><h1>Giỏ hàng & thanh toán</h1></div><section className="container section">
  {cart.length===0 ? <div className="empty"><ShoppingBag size={32}/><p>Giỏ hàng đang trống.</p><a className="button primary" href="#/collection">Khám phá tủ đồ</a></div> : <div className="checkout-grid">
   <div><h2>Trang phục đã chọn</h2>{cart.map(i=><article className="cart-item" key={i.key}>
    <a href={`#/product/${i.product.id}/${i.mode}`}><img src={photo(i.product.image)} alt={i.product.subtitle}/></a>
    <div><h3>{i.product.name}</h3><p>{labels[i.mode]} · Size {i.size}</p>
     {i.mode==='rent'?<><p>{formatDate(i.date)} – {returnDate(i.date,i.days)} · {i.days} ngày</p><p>Tiền thuê {money(i.product.rent*i.days*i.qty)} · Tiền cọc {money(i.product.deposit*i.qty)}</p></>:<p>{money(i.product.sale*i.qty)}</p>}
     <div className="quantity"><button type="button" aria-label="Giảm số lượng" disabled={i.qty<=1} onClick={()=>quantity(i.key,-1)}><Minus size={15}/></button><span>{i.qty}</span><button type="button" aria-label="Tăng số lượng" onClick={()=>quantity(i.key,1)}><Plus size={15}/></button></div>
    </div><button type="button" aria-label={'Xóa '+i.product.name} className="icon-button" onClick={()=>setCart(cart.filter(item=>item.key!==i.key))}><Trash2 size={17}/></button>
   </article>)}
   <form className="coupon" onSubmit={e=>{e.preventDefault();const valid=code.trim().toUpperCase()==='GIAM50';setCoupon(valid);setMessage(valid?'Đã giảm 50% tiền thuê và mua.':'Mã giảm giá không hợp lệ.')}}><label>Mã ưu đãi<input value={code} placeholder="GIAM50" onChange={e=>setCode(e.target.value)}/></label><button className="button secondary">Áp dụng</button></form>{message&&<p role="status">{message}</p>}
   </div>
   <form className="checkout-form" onSubmit={e=>{e.preventDefault();if(submitting.current)return;submitting.current=true;placeOrder(Object.fromEntries(new FormData(e.currentTarget)),payment)}}>
    <h2>Thông tin người nhận</h2>
    <label>Họ tên<input name="name" autoComplete="name" required defaultValue={account?.name}/></label>
    <label>Số điện thoại<input name="phone" autoComplete="tel" type="tel" pattern="[+0-9 .]{8,18}" required/></label>
    <label>Địa chỉ giao hàng<input name="address" autoComplete="street-address" required/></label>
    <label>Ghi chú số đo<textarea name="note" rows="3" placeholder="Ví dụ Ngực 88, eo 70, hông 94 cm"/></label>
    <fieldset><legend>Phương thức thanh toán</legend>{payments.map(p=><label className="radio" key={p}><input type="radio" checked={payment===p} onChange={()=>setPayment(p)}/>{p}</label>)}</fieldset>
    {payment!==payments[2]&&<p className="muted">Phương thức thanh toán mô phỏng. Không có giao dịch thực.</p>}
    <div className="calculation">{[['Tạm tính',summary.subtotal],['Tiền cọc có thể hoàn lại',summary.deposit],['Giảm giá',-summary.discount],['Tổng thanh toán',summary.total]].map(([label,n])=><div key={label}><span>{label}</span><b>{money(n)}</b></div>)}</div>
    <button className="button primary w-full">Xác nhận đặt đơn</button>
   </form>
  </div>}
 </section></>
}

function Tracking({orders,initial}) {
 const [input,setInput] = useState(initial)
 const [query,setQuery] = useState(initial)
 const found = query ? orders.filter(o=>o.code===query) : orders
 return <><div className="page-banner"><h1>Theo dõi đơn hàng</h1></div><section className="container section">
  <form className="tracking-search" onSubmit={e=>{e.preventDefault();setQuery(input.trim().replace(/^#/,'').toUpperCase())}}><label>Mã đơn hàng<input value={input} onChange={e=>setInput(e.target.value)} placeholder="#VLR..."/></label><button className="button primary">Tra cứu</button></form>
  {!found.length&&<p className="empty">{query?'Không tìm thấy mã đơn hàng trên trình duyệt này.':'Chưa có đơn hàng nào trên trình duyệt này.'}</p>}
  {found.map(o=>{
   const rental = o.items.some(i=>i.mode==='rent')
   const steps = ['Đã xác nhận',rental?'Đang giặt hấp & chuẩn bị':'Đang chuẩn bị','Đang giao',...(rental?['Đang thuê','Hoàn tất & Hoàn cọc']:['Hoàn tất'])]
   return <article key={o.code} className="order"><div className="order-head"><div><h2>#{o.code}</h2><p>{new Date(o.date).toLocaleString('vi-VN')} · {o.payment}</p></div><b>{money(o.total)}</b></div>
    <ol className="progress">{steps.map((s,i)=><li key={s} aria-current={i===0?'step':undefined}><span>{i===0?<Check size={17}/>:i+1}</span>{s}</li>)}</ol>
    <p className="muted">{o.items.map(i=>`${i.product.name} (${i.mode==='rent'?'thuê':'mua'}, ${i.size}) × ${i.qty}`).join(' · ')}</p>
   </article>
  })}
 </section></>
}

function Policy() {
 return <><div className="page-banner"><h1>Chính sách thuê</h1></div><section className="container section policy">
  <h2>Quy trình thuê 4 bước</h2>
  <ol><li>Chọn trang phục và kích cỡ phù hợp.</li><li>Chọn ngày nhận, gói thuê và xác nhận đơn.</li><li>Nhận trang phục đã giặt hấp và kiểm tra tình trạng khi nhận.</li><li>Trả đồ đúng hẹn để được kiểm tra và hoàn cọc.</li></ol>
  <h2>Tiền cọc thế chân</h2><p>Tiền cọc hiển thị riêng khi đặt thuê. Velora hoàn 100% tiền cọc khi trang phục được trả đúng hạn, đủ phụ kiện và nguyên trạng.</p>
  <h2>Đổi size</h2><p>Nếu đồ không vừa, liên hệ hotline ngay khi nhận. Velora hỗ trợ đổi sang size còn sẵn và xác nhận lịch giao lại trước khi đổi.</p>
  <h2>Đền bù hư hỏng</h2><p>Velora kiểm tra tình trạng khi nhận lại và thông báo chi phí sửa chữa theo mức hư hỏng. Nếu thất lạc hoặc hư hỏng không thể sửa, mức đền bù dựa trên giá bán đã công bố.</p>
 </section></>
}

function Modal({title,close,children}) {
 const ref = React.useRef(null)
 React.useEffect(()=>{
  ref.current.showModal()
 },[])
 return <dialog ref={ref} onCancel={close} onClick={e=>{if(e.target===e.currentTarget)close()}}><div className="modal-content"><div className="modal-head"><h2>{title}</h2><button className="icon-button" aria-label="Đóng" onClick={close}><X size={22}/></button></div>{children}</div></dialog>
}

function Account({account,save}) {
 const [register,setRegister] = useState(false)
 if(account)return <><p>{account.name} · {account.email}</p><button className="button secondary" onClick={()=>save(null)}>Đăng xuất</button></>
 return <><div className="tabs"><button className={!register?'selected':''} onClick={()=>setRegister(false)}>Đăng nhập</button><button className={register?'selected':''} onClick={()=>setRegister(true)}>Đăng ký</button></div>
 <form className="checkout-form account-form" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);const email=data.get('email');save({email,name:data.get('name')?.trim()||email.split('@')[0]})}}>
  {register&&<label>Họ tên<input required name="name" autoComplete="name"/></label>}
  <label>Email<input type="email" required name="email" autoComplete="email"/></label>
  <p className="muted">Tài khoản mô phỏng được lưu trên trình duyệt này.</p><button className="button primary">{register?'Đăng ký':'Đăng nhập'}</button>
 </form></>
}

function Footer() {
 return <footer><div className="container footer-grid">
  <div><a className="logo" href="#/">VELORA<span>C L O S E T</span></a><p>Tủ đồ thuê & mua cho những dịp đặc biệt.</p><p>28 Nguyễn Thiệp, Phường Sài Gòn, TP. Hồ Chí Minh</p></div>
  <div><h3>Chăm sóc khách hàng</h3><a href="#/track">Theo dõi đơn hàng</a><a href="#/policy">Đổi size & hoàn cọc</a><a href="tel:0901884068">0901 884 068</a><a href="mailto:hello@veloracloset.vn">hello@veloracloset.vn</a></div>
  <div><h3>Về chúng tôi</h3><a href="#/collection">Bộ sưu tập</a><a href="#/rent">Thuê trang phục</a><a href="#/buy">Mua trang phục</a><a href="#/policy">Chính sách dịch vụ</a></div>
  <div><h3>Kết nối với Velora</h3><div className="social"><a aria-label="Instagram" href="https://www.instagram.com/"><Instagram size={19}/></a><a aria-label="Facebook" href="https://www.facebook.com/"><Facebook size={19}/></a></div><p><CreditCard size={17}/> QR · MoMo · COD</p><p><Truck size={17}/> Giao Hàng Nhanh · Giao Hàng Tiết Kiệm</p></div>
 </div><div className="container copyright">© {new Date().getFullYear()} Velora Closet · Cửa hàng mẫu</div></footer>
}

createRoot(document.getElementById('root')).render(<App/>)
