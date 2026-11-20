import React, {useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Search, ShoppingBag, Phone, Mail, UserRound, Package, Menu, X, Heart, Star, Handshake, Instagram, Facebook, CreditCard, Truck, Plus, Minus, Trash2, Check, ChevronRight, SlidersHorizontal} from 'lucide-react'
import {products, categories, occasions, brands, sizes, photo, money, today, returnDate, totals, outletPrice, itemPrice} from './data.js'
import {Navigation, PitchHome, FavoriteButton, Brands, Membership, PartnerForm} from './experience.jsx'
import './style.css'

const labels = {rent:'Thuê trang phục', buy:'Mua đứt'}
const payments = ['Chuyển khoản QR','Ví MoMo','Thanh toán khi nhận hàng (COD)']
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
 const [favorites,setFavorites] = useStored('velora.favorites',[])
 const [plan,setPlan] = useStored('velora.plan','')
 const [partners,setPartners] = useStored('velora.partners',[])
 const toggleFavorite = id => setFavorites(favorites.includes(id)?favorites.filter(i=>i!==id):[...favorites,id])
 const [search, setSearch] = useState(() => new URLSearchParams(route().split('?')[1]).get('q') || '')
 const [searchOpen, setSearchOpen] = useState(false)
 const [mobile, setMobile] = useState(false)
 const [modal, setModal] = useState(null)
 const gridProps = {favorites,toggleFavorite,quick:(product,mode)=>setModal({product,mode})}
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
  const key = [item.product.id,item.mode,item.size,item.date,item.days,item.note||'',item.price||''].join(':')
  const existing = cart.find(i => i.key === key)
  setCart(existing ? cart.map(i => i.key === key ? {...i,qty:i.qty+1} : i) : [...cart,{...item,key,qty:1}])
  setModal(null)
  if (checkout) go('/cart')
  else setNotice('Đã thêm vào giỏ hàng')
 }
 const firstRental = !orders.some(order=>order.items.some(item=>item.mode==='rent'))
 const activeCoupon = coupon==='KOL50'&&!firstRental ? false : coupon
 const placeOrder = (recipient, payment) => {
  let code
  do {code = 'RTZ' + crypto.randomUUID().slice(0,8).toUpperCase()} while (orders.some(o => o.code === code))
  setOrders([{code, recipient, payment, items:cart, stage:0, coupon:activeCoupon, ...totals(cart,activeCoupon), date:new Date().toISOString()}, ...orders])
  setCart([])
  setCoupon(false)
  go('/success/' + code)
 }
 const findProducts = term => products.filter(p => {
  const haystack = normalize([p.name,p.subtitle,p.brand,p.category,p.color,...p.occasions].join(' '))
  return normalize(term.trim()).split(/\s+/).every(word=>haystack.includes(word))
 })
 const results = findProducts(search)
 const detail = path.match(/^\/product\/(\d+)(?:\/(rent|buy))?$/)
 const product = detail && products.find(p => p.id === Number(detail[1]))
 const [section,query=''] = path.split('?')
 let page
 if (path === '/') page = <PitchHome Grid={Grid} {...gridProps}/>
 else if (['/rent','/buy','/collection','/search'].includes(section)) page = <Catalog key={path} path={section} query={query} products={section==='/search'?findProducts(new URLSearchParams(query).get('q')||''):products} {...gridProps}/>
 else if (path==='/wishlist') page = <><div className="page-banner"><h1>Danh sách yêu thích</h1></div><section className="container section">{favorites.length?<Grid items={products.filter(p=>favorites.includes(p.id))} mode="rent" {...gridProps}/>:<div className="empty"><Heart size={28}/><p>Chưa có trang phục yêu thích.</p><a className="button primary" href="#/collection">Khám phá tủ đồ</a></div>}</section></>
 else if (path==='/brands') page = <Brands/>
 else if (path==='/membership') page = <Membership selected={plan} select={name=>{setPlan(name);setNotice('Đã lưu lựa chọn hội viên')}}/>
 else if (product) page = <Product key={path} product={product} initialMode={detail[2] || 'rent'} add={add} {...gridProps}/>
 else if (path === '/cart') page = <Cart cart={cart} setCart={setCart} coupon={activeCoupon} setCoupon={setCoupon} firstRental={firstRental} account={account} placeOrder={placeOrder}/>
 else if (path === '/track' || path.startsWith('/track/')) page = <Tracking key={path} orders={orders} initial={path.split('/')[2] || ''} updateStage={(code,stage)=>setOrders(orders.map(o=>o.code===code?{...o,stage}:o))}/>
 else if (path === '/policy' || path.startsWith('/policy/')) page = <Policy key={path} focus={path.split('/')[2]}/>
 else if (path.startsWith('/success/') && orders.some(o=>o.code===path.split('/')[2])) page = <div className="container success"><Check size={48}/><h1>Đặt hàng thành công</h1><p>Mã đơn hàng <b>#{path.split('/')[2]}</b></p><p>Đơn hàng đã được lưu trên trình duyệt này.</p><a className="button primary" href={'#/track/'+path.split('/')[2]}>Theo dõi đơn hàng</a></div>
 else page = <div className="container success"><h1>Không tìm thấy trang</h1><a className="button primary" href="#/">Về trang chủ</a></div>
 return <>
  <div className="topbar"><div className="container top-inner">
   <div className="top-contact"><a href="tel:0798969040"><Phone/> Hotline: 079 896 9040</a><a href="mailto:rental@velora.vn"><Mail/> Email: rental@velora.vn</a></div>
   <div><button className="partner-link" onClick={()=>setModal('partner')}><Handshake/> Trở thành đối tác</button><a href="#/track"><Package/> Theo dõi đơn hàng</a><button onClick={()=>setModal('account')}><UserRound/> {account?.name || 'Đăng nhập / Đăng ký'}</button></div>
  </div></div>
  <header><div className="container header-inner">
   <button className="menu icon-button" aria-label="Mở menu" aria-expanded={mobile} onClick={()=>setMobile(!mobile)}><Menu/></button>
   <a className="logo" href="#/">VELORA<span>C L O S E T</span></a>
   <Navigation path={path} mobile={mobile}/>
   <div className="head-actions">
    <form className="search" role="search" onSubmit={e=>{e.preventDefault();setSearchOpen(false);go('/search?'+new URLSearchParams({q:search.trim()}))}}>
     <button aria-label="Tìm sản phẩm"><Search size={17}/></button><input aria-label="Tìm sản phẩm" placeholder="Tìm trang phục..." value={search} onFocus={()=>setSearchOpen(true)} onChange={e=>{setSearch(e.target.value);setSearchOpen(true)}} onBlur={e=>{if(!e.currentTarget.form.contains(e.relatedTarget))setSearchOpen(false)}}/>
     {searchOpen && search.trim() && <div className="search-results">{results.length ? results.slice(0,5).map(p=><a href={'#/product/'+p.id} key={p.id}><img src={photo(p.image)} alt=""/><span>{p.name}<small>{p.subtitle}</small></span></a>) : <p>Không tìm thấy trang phục.</p>}</div>}
    </form>
    <a className="icon-button wishlist-link" aria-label={'Yêu thích, '+favorites.length+' món'} href="#/wishlist"><Heart size={21}/></a>
    <a className="bag icon-button" aria-label={'Giỏ hàng, '+cart.reduce((n,i)=>n+i.qty,0)+' món'} href="#/cart"><ShoppingBag size={22}/><span>{cart.reduce((n,i)=>n+i.qty,0)}</span></a>
   </div>
  </div></header>
  <main>{page}</main>
  <Footer/>
  {notice && <div role="status" className="toast"><Check size={18}/>{notice}</div>}
  {modal==='partner'&&<Modal title="Trở thành đối tác" close={()=>setModal(null)}><PartnerForm submit={data=>{setPartners([...partners,{...data,date:new Date().toISOString()}]);setModal(null);setNotice('Đã lưu đăng ký đối tác trên thiết bị này')}}/></Modal>}
  {modal==='account' && <Modal title={account?'Tài khoản':'Chào mừng đến Velora'} close={()=>setModal(null)}><Account account={account} save={next=>{setAccount(next);setModal(null)}}/></Modal>}
  {modal?.product && <Modal title={modal.product.name} close={()=>setModal(null)}><p className="muted">{modal.product.subtitle}</p><Options product={modal.product} initialMode={modal.mode} add={add}/></Modal>}
 </>
}

function normalize(value) {
 return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replaceAll('đ','d')
}

function Grid({items,mode,quick,favorites,toggleFavorite}) {
 return <div className="product-grid">{items.map(p=><article className="product-card" key={p.id}>
  <div className="card-media">
   <a className="product-image" href={`#/product/${p.id}/${mode}`}>
    <img src={photo(p.image)} alt={p.subtitle} loading="lazy"/><img className="alternate" src={photo(p.image,true)} alt="" loading="lazy"/>
    <span className={'badge '+(mode==='rent'?'hot':'')}>{mode==='rent'?'-50%':p.outlet?'-70%':'Mới'}</span>
   </a>
   <FavoriteButton product={p} favorites={favorites} toggleFavorite={toggleFavorite}/>
  </div>
  <div className="card-info"><small>{p.brand}</small><h3><a href={`#/product/${p.id}/${mode}`}>{p.name}</a></h3><p>{p.subtitle}</p>
   <div className="prices">{mode==='buy'?<><b>{money(outletPrice(p))} {p.outlet&&<del>{money(p.sale)}</del>}</b><span>Thuê 3 ngày {money(p.rent*3)}</span></>:<><b>{money(p.rent*3)} <small>/ 3 ngày</small> <del>{money(p.original*3)}</del></b><span>Giá bán gốc {money(p.sale)}</span></>}</div>
   <div className="size-list">{p.sizes.map(s=><span key={s}>{s}</span>)}</div>
   <div className="card-actions"><a className="button secondary" href={`#/product/${p.id}/${mode}`}>Xem chi tiết</a><button className="button primary" onClick={()=>quick(p,mode)} aria-label={'Thêm nhanh vào giỏ '+p.name} title="Thêm nhanh vào giỏ"><ShoppingBag size={17}/><Plus size={13}/></button></div>
  </div>
 </article>)}</div>
}

const filterOptions = [
 ['category','Danh mục',categories],['occasion','Dịp mặc',occasions],['size','Kích cỡ',sizes],
 ['color','Màu sắc',['Đen','Trắng','Be','Champagne','Hồng']],['brand','Thương hiệu',brands],
]
const priceRanges = [['0-350000','Dưới 350.000 ₫'],['350000-450000','350.000 – 449.999 ₫'],['450000-550000','450.000 – 549.999 ₫'],['550000-Infinity','Từ 550.000 ₫']]
function Catalog({path,query,products,...gridProps}) {
 const params = new URLSearchParams(query)
 const [mode,setMode] = useState(path==='/buy'?'buy':'rent')
 const [filters,setFilters] = useState(()=>Object.fromEntries(params))
 const [sort,setSort] = useState('popular')
 const [min,max] = filters.range ? filters.range.split('-').map(Number) : [0,Infinity]
 const change = (key,value) => setFilters({...filters,[key]:value})
 const filtered = products.filter(p =>
  (!filters.category||p.category===filters.category) &&
  (!filters.occasion||p.occasions.includes(filters.occasion)) &&
  (!filters.size||p.sizes.includes(filters.size)) &&
  (!filters.color||p.color===filters.color) &&
  (!filters.brand||p.brand===filters.brand) &&
  (mode!=='buy'||!filters.sale||p.outlet===(filters.sale==='outlet')) &&
  p.rent*3>=min&&p.rent*3<max
 ).sort((a,b)=>sort==='price'?a.rent-b.rent:sort==='new'?b.id-a.id:b.popularity-a.popularity)
 const title = {'/rent':'Thuê trang phục','/buy':'Mua sắm','/collection':'Bộ sưu tập','/search':'Kết quả tìm kiếm'}[path]
 return <><div className="page-banner"><p className="eyebrow">TỦ ĐỒ VELORA</p><h1>{title}</h1></div><section className="container section catalog-layout">
  <aside className="catalog-filters" aria-label="Bộ lọc sản phẩm">
   <h2><SlidersHorizontal size={18}/> Bộ lọc</h2>
   <label>Loại dịch vụ<select value={mode} onChange={e=>setMode(e.target.value)}><option value="rent">Thuê</option><option value="buy">Mua</option></select></label>
   {filterOptions.map(([key,label,options])=><label key={key}>{label}<select value={filters[key]||''} onChange={e=>change(key,e.target.value)}><option value="">Tất cả</option>{options.map(v=><option key={v}>{v}</option>)}</select></label>)}
   <label>Giá thuê 3 ngày<select value={filters.range||''} onChange={e=>change('range',e.target.value)}><option value="">Tất cả</option>{priceRanges.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
   {mode==='buy'&&<label>Tình trạng<select value={filters.sale||''} onChange={e=>change('sale',e.target.value)}><option value="">Tất cả</option><option value="new">Hàng thiết kế mới</option><option value="outlet">Đồ thanh lý</option></select></label>}
   <button className="button secondary" onClick={()=>setFilters({})}>Xóa bộ lọc</button>
  </aside>
  <div><div className="catalog-toolbar"><p aria-live="polite">{filtered.length} thiết kế</p><label>Sắp xếp<select value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">Phổ biến nhất</option><option value="price">Giá thuê thấp đến cao</option><option value="new">Mới nhất</option></select></label></div>
  {filtered.length?<Grid items={filtered} mode={mode} {...gridProps}/>:<p className="empty">Không có thiết kế phù hợp.</p>}</div>
 </section></>
}

const views = ['Toàn thân','Cận chất liệu','Chi tiết đường may','Toàn cảnh']
function Product({product,initialMode,add,favorites,toggleFavorite}) {
 const [active,setActive] = useState(0)
 const [guide,setGuide] = useState(false)
 return <section className="container section">
  <div className="breadcrumb"><a href="#/">Trang chủ</a><ChevronRight size={14}/><a href="#/collection">Bộ sưu tập</a><ChevronRight size={14}/>{product.name}</div>
  <div className="detail-grid">
   <div><div className={'detail-frame view-'+active}><img className="detail-img" src={photo(product.image,active===1)} alt={product.subtitle+' · '+views[active]}/><FavoriteButton product={product} favorites={favorites} toggleFavorite={toggleFavorite}/></div>
    <div className="thumbs">{views.map((label,i)=><button key={label} aria-pressed={i===active} onClick={()=>setActive(i)}><span className={'thumb-image view-'+i}><img src={photo(product.image,i===1)} alt=""/></span>{label}</button>)}</div>
   </div>
   <div className="detail-info"><p className="eyebrow">{product.brand}</p><h1>{product.name}</h1><p className="subtitle">{product.subtitle}</p><p className="rating"><Star size={18} fill="currentColor"/> 4,9/5 · Đánh giá mẫu</p><p>Chất liệu {product.material.toLowerCase()}.</p><p className="muted">Số đo tham khảo size M · Ngực 88, eo 70, hông 94 cm</p>
    <Options product={product} initialMode={initialMode} add={add} openGuide={()=>setGuide(true)}/>
   </div>
  </div>
  {guide&&<Modal title="Bảng quy đổi Size & Số đo 3 vòng" close={()=>setGuide(false)}><p>Số đo cơ thể tham khảo (cm)</p><table><thead><tr>{['Size','Ngực','Eo','Hông'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{sizes.map((s,i)=><tr key={s}><th>{s}</th><td>{80+i*4}</td><td>{62+i*4}</td><td>{86+i*4}</td></tr>)}</tbody></table></Modal>}
 </section>
}

function Options({product,initialMode,add,openGuide}) {
 const [mode,setMode] = useState(initialMode)
 const [size,setSize] = useState('')
 const [days,setDays] = useState(3)
 const [date,setDate] = useState('')
 const [note,setNote] = useState('')
 const [error,setError] = useState('')
 const renting = mode==='rent'
 const price = renting?product.rent*days:outletPrice(product)
 const deposit = renting?product.deposit:0
 return <form className="options" onSubmit={e=>{
  e.preventDefault()
  if(!size){setError('Vui lòng chọn size.');return}
  add({product,mode,size,days:renting?days:null,date:renting?date:null,note:renting?note.trim():'',price:renting?null:price},e.nativeEvent.submitter?.value==='checkout')
 }}>
  <fieldset><legend>Hình thức</legend><div className="choices">{Object.entries(labels).map(([key,label])=><button key={key} type="button" aria-pressed={mode===key} onClick={()=>setMode(key)}>{label}</button>)}</div></fieldset>
  <fieldset><legend>Chọn size</legend>{openGuide&&<button type="button" className="text-link size-guide" onClick={openGuide}>Bảng quy đổi Size & Số đo 3 vòng</button>}<div className="choices">{product.sizes.map(s=><button key={s} type="button" aria-pressed={size===s} onClick={()=>{setSize(s);setError('')}}>{s}</button>)}</div></fieldset>
  {renting&&<><div className="fields"><label>Ngày nhận đồ<input required type="date" min={today()} value={date} onChange={e=>setDate(e.target.value)}/></label><label>Gói thuê<select value={days} onChange={e=>setDays(Number(e.target.value))}>{[3,5,7].map(n=><option key={n} value={n}>{n} ngày</option>)}</select></label></div>{date&&<p>Ngày trả dự kiến <b>{returnDate(date,days)}</b></p>}
   <label>Ghi chú chỉnh sửa số đo miễn phí<textarea value={note} onChange={e=>setNote(e.target.value)} rows="2" placeholder="Ví dụ Bóp eo 2 cm, lên lai váy 3 cm"/></label></>}
  <div className="calculation"><div><span>{renting?'Tiền thuê · '+days+' ngày':'Giá bán'}</span><b>{money(price)}</b></div>{renting&&<><div><span>Tiền cọc thế chân</span><b>{money(deposit)}</b></div><small>Hoàn lại 100% khi trả đồ đúng hạn và nguyên trạng.</small></>}
   <div className="calculation-total"><span>Tổng thanh toán</span><b>{money(price+deposit)}</b></div></div>
  {error&&<p role="alert" className="error">{error}</p>}
  <div className="actions"><button className="button secondary" value="cart">Thêm vào giỏ hàng</button><button className="button primary" value="checkout">{renting?'Đặt thuê ngay':'Mua ngay'}</button></div>
 </form>
}

function Cart({cart,setCart,coupon,setCoupon,firstRental,account,placeOrder}) {
 const [code,setCode] = useState(typeof coupon==='string'?coupon:coupon?'GIAM50':'')
 const [message,setMessage] = useState('')
 const [payment,setPayment] = useState(payments[2])
 const submitting = React.useRef(false)
 const summary = totals(cart,coupon)
 const groups = Object.entries(labels).map(([mode,label])=>[mode,label,cart.filter(item=>item.mode===mode)]).filter(([, ,items])=>items.length)
 const quantity = (key,delta) => setCart(cart.map(i=>i.key===key?{...i,qty:i.qty+delta}:i))
 return <><div className="page-banner"><h1>Giỏ hàng & thanh toán</h1></div><section className="container section">
  {cart.length===0 ? <div className="empty"><ShoppingBag size={32}/><p>Giỏ hàng đang trống.</p><a className="button primary" href="#/collection">Khám phá tủ đồ</a></div> : <div className="checkout-grid">
   <div><h2>Trang phục đã chọn</h2>{groups.map(([mode,label,items])=><section className="cart-group" key={mode}><h3>{label} <span>({items.reduce((n,item)=>n+item.qty,0)})</span></h3>{items.map(i=><article className="cart-item" key={i.key}>
    <a href={`#/product/${i.product.id}/${i.mode}`}><img src={photo(i.product.image)} alt={i.product.subtitle}/></a>
    <div><h3>{i.product.name}</h3><p>{labels[i.mode]} · Size {i.size}</p>
     {i.mode==='rent'?<><p>{formatDate(i.date)} – {returnDate(i.date,i.days)} · {i.days} ngày</p><p>Tiền thuê {money(i.product.rent*i.days*i.qty)} · Tiền cọc {money(i.product.deposit*i.qty)}</p>{i.note&&<p>Chỉnh số đo · {i.note}</p>}</>:<p>{money(itemPrice(i)*i.qty)}</p>}
     <div className="quantity"><button type="button" aria-label="Giảm số lượng" disabled={i.qty<=1} onClick={()=>quantity(i.key,-1)}><Minus size={15}/></button><span>{i.qty}</span><button type="button" aria-label="Tăng số lượng" onClick={()=>quantity(i.key,1)}><Plus size={15}/></button></div>
    </div><button type="button" aria-label={'Xóa '+i.product.name} className="icon-button" onClick={()=>setCart(cart.filter(item=>item.key!==i.key))}><Trash2 size={17}/></button>
   </article>)}</section>)}
   <form className="coupon" onSubmit={e=>{
    e.preventDefault()
    const entered=code.trim().toUpperCase()
    const hasRental=cart.some(item=>item.mode==='rent')
    const valid=entered==='GIAM50'||(entered==='KOL50'&&hasRental&&firstRental)
    setCoupon(valid?entered:false)
    if(entered==='KOL50'){
     setMessage(!firstRental?'KOL50 dành cho đơn thuê đầu tiên.':hasRental?'Đã giảm 50% phí thuê.':'KOL50 áp dụng khi giỏ hàng có món thuê.')
    }else{
     setMessage(valid?'Đã giảm 50% tiền thuê và mua.':entered?'Mã giảm giá không hợp lệ.':'Đã bỏ mã ưu đãi.')
    }
   }}><label>Mã ưu đãi<input value={code} placeholder="KOL50" onChange={e=>setCode(e.target.value)}/></label><button className="button secondary">Áp dụng</button></form>{message&&<p role="status">{message}</p>}
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

function Tracking({orders,initial,updateStage}) {
 const [input,setInput] = useState(initial)
 const [query,setQuery] = useState(initial)
 const found = query ? orders.filter(o=>o.code===query) : orders
 return <><div className="page-banner"><h1>Theo dõi đơn hàng</h1></div><section className="container section">
  <form className="tracking-search" onSubmit={e=>{e.preventDefault();setQuery(input.trim().replace(/^#/,'').toUpperCase())}}><label>Mã đơn hàng<input value={input} onChange={e=>setInput(e.target.value)} placeholder="#RTZ..."/></label><button className="button primary">Tra cứu</button></form>
  {!found.length&&<p className="empty">{query?'Không tìm thấy mã đơn hàng trên trình duyệt này.':'Chưa có đơn hàng nào trên trình duyệt này.'}</p>}
  {found.map(o=>{
   const rental = o.items.some(i=>i.mode==='rent')
   const steps = ['Đã xác nhận',rental?'Giặt hấp TrueSteam':'Đang chuẩn bị','Đang giao hàng',...(rental?['Đang trong kỳ thuê','Đã trả đồ & Hoàn cọc']:['Hoàn tất'])]
   const stage = Math.min(o.stage??0,steps.length-1)
   return <article key={o.code} className="order"><div className="order-head"><div><h2>#{o.code}</h2><p>{new Date(o.date).toLocaleString('vi-VN')} · {o.payment}</p></div><b>{money(o.total)}</b></div>
    <ol className="progress">{steps.map((s,i)=><li key={s} className={i<=stage?'reached':''} aria-current={i===stage?'step':undefined}><span>{i<=stage?<Check size={17}/>:i+1}</span>{s}</li>)}</ol>
    <p className="muted">{o.items.map(i=>`${i.product.name} (${i.mode==='rent'?'thuê':'mua'}, ${i.size}) × ${i.qty}`).join(' · ')}</p>
    <details className="demo-controls"><summary>Mô phỏng tiến trình đơn</summary><div className="actions"><button className="button secondary" disabled={stage===steps.length-1} onClick={()=>updateStage(o.code,stage+1)}>Chuyển sang bước tiếp theo</button><button className="button secondary" disabled={stage===0} onClick={()=>updateStage(o.code,0)}>Đặt lại tiến trình</button></div></details>
   </article>
  })}
 </section></>
}

function Policy({focus}) {
 React.useEffect(()=>{
  if(focus)document.getElementById(focus)?.scrollIntoView?.({block:'start'})
 },[focus])
 return <><div className="page-banner"><h1>Chính sách thuê</h1></div><section className="container section policy">
  <h2 id="process">Quy trình thuê 4 bước</h2>
  <ol><li>Chọn trang phục và kích cỡ phù hợp.</li><li>Chọn ngày nhận, gói thuê và xác nhận đơn.</li><li>Nhận trang phục đã giặt hấp và kiểm tra tình trạng khi nhận.</li><li>Trả đồ đúng hẹn để được kiểm tra và hoàn cọc.</li></ol>
  <h2 id="steam">Giặt hấp TrueSteam</h2><p>Trang phục được kiểm tra, giặt hấp và giữ phom trước khi bàn giao theo quy trình dịch vụ minh họa.</p>
  <h2>Tiền cọc thế chân</h2><p>Tiền cọc hiển thị riêng khi đặt thuê. Velora hoàn 100% tiền cọc khi trang phục được trả đúng hạn, đủ phụ kiện và nguyên trạng.</p>
  <h2>Đổi size</h2><p>Nếu đồ không vừa, liên hệ hotline ngay khi nhận. Velora hỗ trợ đổi sang size còn sẵn và xác nhận lịch giao lại trước khi đổi.</p>
  <h2>Đền bù hư hỏng</h2><p>Velora kiểm tra tình trạng khi nhận lại và thông báo chi phí sửa chữa theo mức hư hỏng. Nếu thất lạc hoặc hư hỏng không thể sửa, mức đền bù dựa trên giá bán đã công bố.</p>
  <h2 id="faq">Câu hỏi thường gặp</h2>
  <details><summary>Tôi có thể thuê trong ngày không?</summary><p>Chọn ngày hôm nay khi đặt thuê và liên hệ hotline để kiểm tra lịch giao.</p></details>
  <details><summary>KOL50 giảm những khoản nào?</summary><p>Mã giảm 50% phí thuê trong đơn thuê đầu tiên. Tiền cọc và sản phẩm mua được tính riêng.</p></details>
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
  <div><h3>Chăm sóc khách hàng</h3><a href="#/track">Theo dõi đơn hàng</a><a href="#/policy">Đổi size & hoàn cọc</a><a href="#/policy/faq">Câu hỏi thường gặp</a><a href="tel:0798969040">079 896 9040</a><a href="mailto:rental@velora.vn">rental@velora.vn</a></div>
  <div><h3>Về chúng tôi</h3><a href="#/brands">Thương hiệu</a><a href="#/membership">Gói hội viên</a><a href="#/policy/steam">Giặt hấp TrueSteam</a><p>28 Nguyễn Thiệp, Phường Sài Gòn, TP. Hồ Chí Minh</p></div>
  <div><h3>Mạng xã hội</h3><div className="social"><a aria-label="Instagram" href="https://www.instagram.com/"><Instagram size={19}/></a><a aria-label="Facebook" href="https://www.facebook.com/"><Facebook size={19}/></a></div></div>
  <div><h3>Phương thức thanh toán</h3><p><CreditCard size={17}/> Visa · Mastercard · MoMo · VNPay</p><h3 className="footer-shipping">Đơn vị vận chuyển</h3><p><Truck size={17}/> GHN · GHTK · Ahamove</p></div>
 </div><div className="container copyright">© {new Date().getFullYear()} Velora Closet · Hình ảnh, sản phẩm và thông tin thương hiệu dùng để minh họa.</div></footer>
}

createRoot(document.getElementById('root')).render(<App/>)
